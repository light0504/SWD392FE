import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getOrderById } from '../../api/orderAPI';
import './OrderSuccessPage.css';

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const OrderSuccessPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const searchParams = new URLSearchParams(location.search);
    const orderId = searchParams.get('orderId');
    const success = searchParams.get('success') === 'true';

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!orderId || orderId === 'unknown') {
            navigate('/');
            return;
        }

        const fetchOrderDetails = async () => {
            setLoading(true);
            try {
                const response = await getOrderById(orderId);
                if (response.isSuccess) {
                    setOrder(response.data);
                } else {
                    throw new Error(response.message || "Không thể tải chi tiết đơn hàng.");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (success) {
            fetchOrderDetails();
        } else {
            setLoading(false); // Không fetch nếu thất bại
        }
    }, [orderId, success, navigate]);

    const renderOrderSummary = () => {
        if (!success) {
            return (
                <p className="status-text error-text">
                    Thanh toán không thành công. Vui lòng thử lại hoặc liên hệ với chúng tôi.
                </p>
            );
        }

        if (loading) {
            return <p className="status-text">Đang tải thông tin đơn hàng của bạn...</p>;
        }

        if (error) {
            return <p className="status-text error-text">Lỗi: {error}</p>;
        }

        if (!order) {
            return <p className="status-text">Không tìm thấy thông tin đơn hàng.</p>;
        }

        const serviceSummary = order.orderDetails.reduce((acc, detail) => {
            if (!acc[detail.serviceName]) {
                acc[detail.serviceName] = {
                    quantity: 0,
                    scheduledTime: detail.scheduledTime
                };
            }
            acc[detail.serviceName].quantity += 1;
            return acc;
        }, {});

        return (
            <div className="order-summary-details">
                <h4>Đơn hàng của bạn: #{order.id.substring(0, 8)}</h4>
                <div className="summary-list">
                    {Object.entries(serviceSummary).map(([name, data]) => (
                        <div key={name} className="summary-item">
                            <div className="item-info">
                                <span className="item-name">{name} (x{data.quantity})</span>
                                <span className="item-time">Lịch hẹn: {formatDate(data.scheduledTime)}</span>
                            </div>
                        </div>
                    ))}
                    {order.note && (
                        <div className="summary-note">
                            <strong>Ghi chú của bạn:</strong> {order.note}
                        </div>
                    )}
                </div>
                <div className="summary-total">
                    <span>Tổng cộng:</span>
                    <strong>{formatCurrency(order.totalPrice)}</strong>
                </div>
            </div>
        );
    };

    return (
        <div className="order-success-container">
            <div className="order-success-box">
                <div className={`success-icon ${success ? 'success' : 'fail'}`}>
                    {success ? '✓' : '✗'}
                </div>
                <h2 className={success ? 'success' : 'fail'}>
                    {success ? 'Đặt Lịch Thành Công!' : 'Thanh Toán Thất Bại'}
                </h2>
                <p>
                    {success
                        ? 'Cảm ơn bạn đã tin tưởng dịch vụ của PetParadise. Đây là thông tin tóm tắt đơn hàng của bạn.'
                        : 'Đơn hàng chưa được thanh toán thành công. Bạn có thể thử lại hoặc liên hệ hỗ trợ.'}
                </p>

                {renderOrderSummary()}

                <div className="action-buttons">
                    <Link to="/order-history" className="btn-view-history">Xem Lịch Sử Đặt Hàng</Link>
                    <Link to="/" className="btn-back-home">Quay Về Trang Chủ</Link>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccessPage;
