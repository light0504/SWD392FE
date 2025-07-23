import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import useCart from '../../hooks/useCart';
import { getAllServices } from '../../api/serviceapi';
import { createOrder } from '../../api/orderAPI';
import { createPaymentUrl } from '../../api/paymentapi';
import { getMembershipByCustomer } from '../../api/membershipAPI';
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

const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const OrderPage = () => {
    const { user } = useAuth();
    const { clearCart } = useCart();
    const navigate = useNavigate();
    const location = useLocation();

    // === STATE MANAGEMENT ===
    const [allServices, setAllServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [membership, setMembership] = useState(null);
    const [orderNote, setOrderNote] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [lastUsedTime, setLastUsedTime] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    const minDateTime = toInputDateTimeString(new Date());

    // === EFFECTS ===
    useEffect(() => {
        const fetchInitialData = async () => {
            if (!user) { setLoading(false); return; }
            setLoading(true);
            try {
                const [servicesRes, membershipRes] = await Promise.all([
                    getAllServices(),
                    getMembershipByCustomer(user.id)
                ]);

                if (servicesRes.isSuccess) {
                    setAllServices(servicesRes.data);
                } else {
                    throw new Error("Không thể tải danh sách dịch vụ.");
                }

                if (membershipRes.isSuccess && membershipRes.data && membershipRes.data.length > 0) {
                    setMembership(membershipRes.data[0]);
                }
                
            } catch (err) {
                setError(err.message || "Lỗi kết nối máy chủ.");
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [user]);

    useEffect(() => {
        const cartItems = location.state?.cartItemsFromSidebar;
        if (cartItems && Array.isArray(cartItems) && cartItems.length > 0) {
            const initialServices = cartItems.map(item => ({ ...item, quantity: 1, scheduledTime: '' }));
            setSelectedServices(initialServices);
        }
    }, [location.state]);

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login', { state: { from: location } });
        }
    }, [user, loading, navigate, location]);

    const filteredServices = useMemo(() => {
        if (!searchTerm) {
            return allServices;
        }
        return allServices.filter(service =>
            service.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allServices, searchTerm]);

    const { totalPrice, discount, finalPrice } = useMemo(() => {
        const originalPrice = selectedServices.reduce((total, s) => total + s.price * s.quantity, 0);
        let discountPercentage = 0;
        if (membership && membership.isActive) {
            discountPercentage = membership.discountPercentage;
        }
        const discountAmount = (originalPrice * discountPercentage) / 100;
        const finalAmount = originalPrice - discountAmount;
        return { totalPrice: originalPrice, discount: discountAmount, finalPrice: finalAmount };
    }, [selectedServices, membership]);

    // === EVENT HANDLERS ===
    const handleServiceToggle = (service) => {
        setSelectedServices(prev => {
            const isSelected = prev.some(s => s.id === service.id);
            if (isSelected) {
                return prev.filter(s => s.id !== service.id);
            } else {
                let initialTime;
                if (lastUsedTime) {
                    initialTime = lastUsedTime;
                } else {
                    const now = new Date();
                    const roundedNow = snapTimeToQuarterHour(now);
                    initialTime = toInputDateTimeString(roundedNow);
                }
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
        setLastUsedTime(finalValueString);
        setSelectedServices(prev =>
            prev.map(s => (s.id === serviceId ? { ...s, scheduledTime: finalValueString } : s))
        );
    };

    const handleSubmitOrder = async () => {
        if (selectedServices.length === 0) { alert("Vui lòng chọn ít nhất một dịch vụ."); return; }
        if (selectedServices.some(s => !s.scheduledTime)) { alert("Vui lòng chọn ngày giờ cho tất cả các dịch vụ đã chọn."); return; }
        setSubmitting(true);
        setError(null);
        const orderPayload = {
            customerId: user.id,
            orderDate: getLocalISOString(new Date()),
            services: selectedServices.flatMap(service =>
                Array.from({ length: service.quantity }, () => ({ serviceId: service.id, scheduledTime: service.scheduledTime }))
            ),
            note: orderNote,
        };
        try {
            const orderResponse = await createOrder(orderPayload);
            if (!orderResponse.isSuccess) throw new Error(orderResponse.message || "Tạo đơn hàng thất bại.");
            const newOrderId = orderResponse.data.id;
            const paymentPayload = { orderId: newOrderId };
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

    if (loading) return <div className="page-loading">Đang tải...</div>;

    return (
        <div className="order-page">
            <div className="container">
                <h1 className="page-title">Đặt Lịch & Thanh Toán</h1>
                <p className="page-subtitle">Chọn dịch vụ, đặt lịch hẹn và hoàn tất thanh toán trong một bước.</p>
                <div className="order-layout">
                    <div className="service-list-panel">
                        <h2>Tất cả dịch vụ</h2>
                        <div className="search-container-order">
                            <input
                                type="text"
                                className="search-input-order"
                                placeholder="Tìm kiếm dịch vụ theo tên..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="service-list">
                            {filteredServices.length > 0 ? (
                                filteredServices.map(service => (
                                    <div
                                        key={service.id}
                                        className={`service-item ${selectedServices.some(s => s.id === service.id) ? 'selected' : ''}`}
                                        onClick={() => handleServiceToggle(service)}
                                    >
                                        <div className="service-info">
                                            <h3>{service.name}</h3>
                                            <p>{service.description}</p>
                                        </div>
                                        <div className="service-price">{formatCurrency(service.price)}</div>
                                    </div>
                                ))
                            ) : (
                                <p className="empty-selection">Không tìm thấy dịch vụ nào.</p>
                            )}
                        </div>
                    </div>
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
                                                type="datetime-local" id={`datetime-${service.id}`}
                                                value={service.scheduledTime}
                                                onChange={(e) => handleDateTimeChange(service.id, e.target.value)}
                                                min={minDateTime} step="900"
                                            />
                                            <small className="datetime-note">(Thời gian sẽ được làm tròn đến mốc 15 phút)</small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="empty-selection">Vui lòng chọn một dịch vụ từ danh sách bên trái.</p>
                        )}
                        {selectedServices.length > 0 && (
                            <div className="order-summary">
                                {membership && membership.isActive && (
                                    <div className="membership-info">
                                        🎉 Chúc mừng! Bạn là thành viên <strong>{membership.membershipName}</strong>
                                    </div>
                                )}
                                <div className="order-note">
                                    <label htmlFor="orderNote">Ghi chú cho đơn hàng:</label>
                                    <textarea
                                        id="orderNote" rows="3"
                                        placeholder="Thú cưng của tôi hơi nhát, vui lòng nhẹ nhàng..."
                                        value={orderNote} onChange={(e) => setOrderNote(e.target.value)}
                                    ></textarea>
                                </div>
                                <div className="price-details">
                                    <p>
                                        <span>Tổng dịch vụ:</span>
                                        <span className={discount > 0 ? 'total-price-original' : ''}>{formatCurrency(totalPrice)}</span>
                                    </p>
                                    {discount > 0 && (
                                        <>
                                            <p className="discount-row">
                                                <span>Ưu đãi thành viên ({membership.discountPercentage}%):</span>
                                                <span>- {formatCurrency(discount)}</span>
                                            </p>
                                            <p className="final-price-row">
                                                <span>Thành tiền:</span>
                                                <strong>{formatCurrency(finalPrice)}</strong>
                                            </p>
                                        </>
                                    )}
                                </div>
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