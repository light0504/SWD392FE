import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getAllServices } from '../../api/serviceapi';
import { createOrder } from '../../api/orderAPI';
import './OrderPage.css';

const OrderPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // === STATE MANAGEMENT ===
    const [allServices, setAllServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [orderNote, setOrderNote] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // === HELPERS ===
    // Tạo chuỗi thời gian hợp lệ cho thuộc tính 'min' của input datetime-local
    const getMinDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };
    const minDateTime = getMinDateTime();

    // === EFFECTS ===
    // 1. Tải danh sách tất cả dịch vụ
    useEffect(() => {
        const fetchServices = async () => {
            setLoading(true);
            try {
                const response = await getAllServices();
                if (response.isSuccess) {
                    setAllServices(response.data);
                } else {
                    setError("Không thể tải danh sách dịch vụ.");
                }
            } catch (err) {
                setError("Lỗi kết nối máy chủ.");
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    // 2. Khởi tạo danh sách dịch vụ đã chọn từ giỏ hàng (nếu có)
    useEffect(() => {
        const cartItems = location.state?.cartItemsFromSidebar;
        if (cartItems && Array.isArray(cartItems) && cartItems.length > 0) {
            const initialServices = cartItems.map(item => ({
                ...item,
                quantity: 1,
                scheduledTime: ''
            }));
            setSelectedServices(initialServices);
        }
    }, [location.state]);

    // 3. Kiểm tra đăng nhập và chuyển hướng nếu cần
    useEffect(() => {
        if (!loading && !user) {
            navigate('/login', { state: { from: location } });
        }
    }, [user, loading, navigate, location]);

    // === EVENT HANDLERS ===
    // Xử lý khi chọn/bỏ chọn dịch vụ
    const handleServiceToggle = (service) => {
        setSelectedServices(prev => {
            const isSelected = prev.some(s => s.id === service.id);
            if (isSelected) {
                return prev.filter(s => s.id !== service.id);
            } else {
                return [...prev, { ...service, quantity: 1, scheduledTime: '' }];
            }
        });
    };

    // Xử lý thay đổi số lượng
    const handleQuantityChange = (serviceId, amount) => {
        setSelectedServices(prev =>
            prev.map(s => {
                if (s.id === serviceId) {
                    const newQuantity = s.quantity + amount;
                    return { ...s, quantity: newQuantity < 1 ? 1 : newQuantity };
                }
                return s;
            })
        );
    };

    // Xử lý thay đổi ngày giờ
    const handleDateTimeChange = (serviceId, value) => {
        setSelectedServices(prev =>
            prev.map(s => (s.id === serviceId ? { ...s, scheduledTime: value } : s))
        );
    };

    // Xử lý gửi đơn hàng
    const handleSubmitOrder = async () => {
        if (selectedServices.length === 0) {
            alert("Vui lòng chọn ít nhất một dịch vụ.");
            return;
        }
        if (selectedServices.some(s => !s.scheduledTime)) {
            alert("Vui lòng chọn ngày giờ cho tất cả các dịch vụ đã chọn.");
            return;
        }

        setSubmitting(true);
        setError(null);

        const orderPayload = {
            customerId: user.id,
            orderDate: new Date().toISOString(),
            services: selectedServices.flatMap(service =>
        Array.from({ length: service.quantity }, () => ({
            serviceId: service.id,
            // Thêm 'Z' vào cuối chuỗi để nói với JS rằng đây là giờ UTC
            scheduledTime: `${service.scheduledTime}:00.000Z`, // <--- SỬA LẠI THÀNH DÒNG NÀY
        }))
    ),
            note: orderNote,
        };

        try {
            const response = await createOrder(orderPayload);
            if (response.isSuccess) {
                alert("Đặt lịch thành công! Chúng tôi sẽ liên hệ với bạn sớm.");
                navigate('/');
            } else {
                setError(response.message || "Đặt lịch thất bại.");
            }
        } catch (err) {
            setError("Đã có lỗi xảy ra khi gửi yêu cầu.");
        } finally {
            setSubmitting(false);
        }
    };

    // === RENDER ===
    if (loading) return <div className="page-loading">Đang tải danh sách dịch vụ...</div>;

    return (
        <div className="order-page">
            <div className="container">
                <h1 className="page-title">Đặt Lịch Dịch Vụ</h1>
                <p className="page-subtitle">Chọn dịch vụ, số lượng và đặt lịch hẹn ngay hôm nay!</p>

                <div className="order-layout">
                    {/* Cột trái: Danh sách tất cả dịch vụ */}
                    <div className="service-list-panel">
                        <h2>Tất cả dịch vụ</h2>
                        <div className="service-list">
                            {allServices.map(service => (
                                <div
                                    key={service.id}
                                    className={`service-item ${selectedServices.some(s => s.id === service.id) ? 'selected' : ''}`}
                                    onClick={() => handleServiceToggle(service)}
                                >
                                    <div className="service-info">
                                        <h3>{service.name}</h3>
                                        <p>{service.description}</p>
                                    </div>
                                    <div className="service-price">
                                        {new Intl.NumberFormat('vi-VN').format(service.price)}đ
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Cột phải: Các dịch vụ đã chọn và đặt lịch */}
                    <div className="selected-services-panel">
                        <h2>Lịch hẹn của bạn</h2>
                        {selectedServices.length > 0 ? (
                            <div className="selected-list scrollable">
                                {selectedServices.map(service => (
                                    <div key={service.id} className="selected-item">
                                        <h4>{service.name}</h4>
                                        <div className="quantity-control">
                                            <label>Số lượng:</label>
                                            <div className="quantity-buttons">
                                                <button onClick={() => handleQuantityChange(service.id, -1)}>-</button>
                                                <span>{service.quantity}</span>
                                                <button onClick={() => handleQuantityChange(service.id, 1)}>+</button>
                                            </div>
                                        </div>
                                        <div className="datetime-picker">
                                            <label htmlFor={`datetime-${service.id}`}>Chọn ngày & giờ:</label>
                                            <input
                                                type="datetime-local"
                                                id={`datetime-${service.id}`}
                                                value={service.scheduledTime}
                                                onChange={(e) => handleDateTimeChange(service.id, e.target.value)}
                                                min={minDateTime}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="empty-selection">Vui lòng chọn một dịch vụ từ danh sách bên trái.</p>
                        )}
                        
                        {selectedServices.length > 0 && (
                            <div className="order-summary">
                                <div className="order-note">
                                    <label htmlFor="orderNote">Ghi chú cho đơn hàng:</label>
                                    <textarea
                                        id="orderNote"
                                        rows="3"
                                        placeholder="Ví dụ: Thú cưng của tôi hơi nhát, vui lòng nhẹ nhàng..."
                                        value={orderNote}
                                        onChange={(e) => setOrderNote(e.target.value)}
                                    ></textarea>
                                </div>
                                <p className="total-services">
                                    Tổng cộng: <strong>{selectedServices.reduce((total, s) => total + s.quantity, 0)} lượt dịch vụ</strong>
                                </p>
                                {error && <p className="error-message">{error}</p>}
                                <button
                                    className="btn-submit-order"
                                    onClick={handleSubmitOrder}
                                    disabled={submitting}
                                >
                                    {submitting ? 'Đang xử lý...' : 'Xác Nhận Đặt Lịch'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderPage;