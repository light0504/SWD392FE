import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getOrderById } from '../../api/orderAPI';
import './OrderSuccessPage.css';

// Hàm helper để định dạng ngày tháng
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN', { 
        day: '2-digit', month: '2-digit', year: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
    });
};

// Hàm helper để định dạng tiền tệ
const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};


const OrderSuccessPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    // Lấy orderId từ state được truyền qua khi navigate
    const orderId = location.state?.orderId;

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Nếu không có orderId, có nghĩa là người dùng truy cập trực tiếp
        // vào URL này. Chuyển hướng họ về trang chủ để tránh lỗi.
        if (!orderId) {
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

        fetchOrderDetails();
    }, [orderId, navigate]);


    // Component con để render nội dung chi tiết
    const renderOrderSummary = () => {
        if (loading) {
            return <p className="status-text">Đang tải thông tin đơn hàng của bạn...</p>;
        }
        if (error) {
            return <p className="status-text error-text">Lỗi: {error}</p>;
        }
        if (!order) {
            return <p className="status-text">Không tìm thấy thông tin đơn hàng.</p>;
        }

        // Nhóm các dịch vụ giống nhau lại để hiển thị dạng "Tắm gội x 2"
        const serviceSummary = order.orderDetails.reduce((acc, detail) => {
            if (!acc[detail.serviceName]) {
                acc[detail.serviceName] = { 
                    quantity: 0, 
                    // Lấy lịch hẹn của lần đầu tiên xuất hiện
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
                <div className="success-icon">✓</div>
                <h2>Đặt Lịch Thành Công!</h2>
                <p>Cảm ơn bạn đã tin tưởng dịch vụ của PetParadise. Đây là thông tin tóm tắt đơn hàng của bạn.</p>
                
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