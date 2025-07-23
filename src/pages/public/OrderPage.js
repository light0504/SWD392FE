import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import useCart from '../../hooks/useCart';
import { getAllServices } from '../../api/serviceapi';
import { createOrder } from '../../api/orderAPI';
import { createPaymentUrl } from '../../api/paymentapi';
import './OrderPage.css';

// --- HÀM HELPER 1: Làm tròn phút của một đối tượng Date ---
const snapTimeToQuarterHour = (date) => {
    const minutes = date.getMinutes();
    const roundedMinutes = Math.round(minutes / 15) * 15;
    date.setMinutes(roundedMinutes, 0, 0);
    return date;
};

// --- HÀM HELPER 2: Chuyển đổi một đối tượng Date sang chuỗi cho input ---
const toInputDateTimeString = (date) => {
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
};

// --- HÀM HELPER 3: Chuyển chuỗi từ input sang đối tượng Date ---
const fromInputDateTimeString = (str) => {
    return str ? new Date(str) : null;
};

// --- HÀM HELPER 4: Chuyển đổi Date object sang chuỗi local ISO ---
const getLocalISOString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

const OrderPage = () => {
    const { user } = useAuth();
    const { clearCart } = useCart();
    const navigate = useNavigate();
    const location = useLocation();

    // === STATE MANAGEMENT ===
    const [allServices, setAllServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [orderNote, setOrderNote] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    
    const minDateTime = toInputDateTimeString(new Date());

    // === EFFECTS ===
    useEffect(() => {
        const fetchServices = async () => {
            setLoading(true);
            try {
                const response = await getAllServices();
                if (response.isSuccess) setAllServices(response.data);
                else setError("Không thể tải danh sách dịch vụ.");
            } catch (err) {
                setError("Lỗi kết nối máy chủ.");
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    useEffect(() => {
        const cartItems = location.state?.cartItemsFromSidebar;
        if (cartItems && Array.isArray(cartItems) && cartItems.length > 0) {
            const initialServices = cartItems.map(item => ({
                ...item, quantity: 1, scheduledTime: ''
            }));
            setSelectedServices(initialServices);
        }
    }, [location.state]);

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login', { state: { from: location } });
        }
    }, [user, loading, navigate, location]);

    // === EVENT HANDLERS ===
    const handleServiceToggle = (service) => {
        setSelectedServices(prev => {
            const isSelected = prev.some(s => s.id === service.id);
            if (isSelected) {
                return prev.filter(s => s.id !== service.id);
            } else {
                const now = new Date();
                const roundedNow = snapTimeToQuarterHour(now);
                const initialTime = toInputDateTimeString(roundedNow);
                return [...prev, { ...service, quantity: 1, scheduledTime: initialTime }];
            }
        });
    };

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

    const handleDateTimeChange = (serviceId, value) => {
        if (!value) return;
        const dateObject = fromInputDateTimeString(value);
        const snappedDate = snapTimeToQuarterHour(dateObject);
        const finalValueString = toInputDateTimeString(snappedDate);
        setSelectedServices(prev =>
            prev.map(s => (s.id === serviceId ? { ...s, scheduledTime: finalValueString } : s))
        );
    };

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
            orderDate: getLocalISOString(new Date()),
            services: selectedServices.flatMap(service =>
                Array.from({ length: service.quantity }, () => ({
                    serviceId: service.id,
                    scheduledTime: service.scheduledTime,
                }))
            ),
            note: orderNote,
        };

        try {
            const orderResponse = await createOrder(orderPayload);
            console.log("Order created successfully:", orderResponse);
            if (!orderResponse.isSuccess) {
                throw new Error(orderResponse.message || "Tạo đơn hàng thất bại.");
            }
            
            const newOrderId = orderResponse.data.id;

            const paymentPayload = {
                orderId: newOrderId
            };
            const paymentResponse = await createPaymentUrl(paymentPayload);
            if (paymentResponse) {
                clearCart();
                window.location.href = paymentResponse;
            } else {
                throw new Error(paymentResponse.message || "Không thể tạo liên kết thanh toán.");
            }
        } catch (err) {
            setError(err.message || "Đã có lỗi xảy ra trong quá trình đặt hàng.");
            setSubmitting(false);
        }
    };
    
    const totalPrice = selectedServices.reduce((total, s) => total + s.price * s.quantity, 0);

    // === RENDER ===
    if (loading) return <div className="page-loading">Đang tải danh sách dịch vụ...</div>;

    return (
        <div className="order-page">
            <div className="container">
                <h1 className="page-title">Đặt Lịch & Thanh Toán</h1>
                <p className="page-subtitle">Chọn dịch vụ, đặt lịch hẹn và hoàn tất thanh toán trong một bước.</p>

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
                                                step="900" 
                                            />
                                            <small className="datetime-note">
                                                (Thời gian sẽ được làm tròn đến mốc 15 phút)
                                            </small>
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
                                        placeholder="Thú cưng của tôi hơi nhát, vui lòng nhẹ nhàng..."
                                        value={orderNote}
                                        onChange={(e) => setOrderNote(e.target.value)}
                                    ></textarea>
                                </div>
                                
                                <p className="total-services">
                                    Tổng cộng: <strong>{selectedServices.reduce((total, s) => total + s.quantity, 0)} lượt dịch vụ</strong>
                                    <br />
                                    Tổng giá: <strong>{new Intl.NumberFormat('vi-VN').format(totalPrice)}đ</strong>
                                </p>
                                {error && <p className="error-message">{error}</p>}
                                <button
                                    className="btn-submit-order"
                                    onClick={handleSubmitOrder}
                                    disabled={submitting}
                                >
                                    {submitting ? 'Đang xử lý...' : 'Tiến hành Thanh toán'}
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