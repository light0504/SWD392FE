import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { getOrderHistory } from '../../api/orderAPI';
import { getOrderStatusInfo, getOrderDetailStatusInfo, ORDER_STATUS_MAP } from '../../constants/status';
import RatingModal from '../../components/RatingModal/RatingModal';
import './OrderHistoryPage.css';

const formatDate = (dateString) => new Date(dateString).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
const COMPLETED_DETAIL_STATUS = 3; // 'Completed' của OrderDetail là 3

const OrderHistoryPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [selectedDetailForRating, setSelectedDetailForRating] = useState(null);

    useEffect(() => {
        if(!user){
            navigate("/");
            return;
        }
        const fetchHistory = async () => {
            if (!user?.id) { setLoading(false); return; }
            setLoading(true);
            try {
                const response = await getOrderHistory(user.id);
                if (response.isSuccess) {
                    setOrders(response.data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)));
                } else { 
                    setError(response.message || 'Lỗi tải lịch sử đơn hàng.'); 
                }
            }catch (err) {
            if (err.response?.status === 404 || err.response?.status === 400) {
                setError('Không có đơn hàng.');
            } else {
                setError('Lỗi tải lịch sử đơn hàng.');
            }
            }finally { 
                setLoading(false); 
            }
        };
        fetchHistory();
    }, [user, navigate]);

    const filteredOrders = useMemo(() => {
        if (activeFilter === 'all') return orders;
        const key = Object.keys(ORDER_STATUS_MAP).find(k => ORDER_STATUS_MAP[k].class === activeFilter);
        return orders.filter(o => o.status === parseInt(key));
    }, [orders, activeFilter]);
    
    const toggleDetails = (orderId) => setExpandedOrderId(prevId => (prevId === orderId ? null : orderId));
    const handleOpenRatingModal = (detail) => {
        setSelectedDetailForRating(detail);
        setIsRatingModalOpen(true);
    };
    const handleRatingSuccess = (orderDetailId, newScore) => {
        setOrders(prevOrders => prevOrders.map(order => ({
            ...order,
            orderDetails: order.orderDetails.map(detail =>
                detail.id === orderDetailId ? { ...detail, rating: newScore } : detail
            )
        })));
    };

    const renderContent = () => {
        if (loading) return <div className="loading-spinner"></div>;
        if (error) return <p className="error-message">{error}</p>;

        return (
            <>
                <div className="filter-tabs">
                    <button onClick={() => setActiveFilter('all')} className={activeFilter === 'all' ? 'active' : ''}>Tất Cả</button>
                    {Object.values(ORDER_STATUS_MAP).map(statusInfo => (
                        <button key={statusInfo.class} onClick={() => setActiveFilter(statusInfo.class)} className={activeFilter === statusInfo.class ? 'active' : ''}>
                            {statusInfo.text}
                        </button>
                    ))}
                </div>

                {filteredOrders.length > 0 ? (
                    <div className="order-list">
                        {filteredOrders.map(order => {
                            const statusInfo = getOrderStatusInfo(order.status);
                            const isExpanded = expandedOrderId === order.id;

                            return (
                                <div key={order.id} className="order-card">
                                    <div className="order-card-header" onClick={() => toggleDetails(order.id)}>
                                        <div className="header-info">
                                            <span className="order-id">Đơn hàng #{order.id.substring(0, 8)}</span>
                                            <span className="order-date">{formatDate(order.orderDate)}</span>
                                        </div>
                                        <div className="header-status">
                                            <span className={`status-badge status-${statusInfo.class}`}>{statusInfo.text}</span>
                                            <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>▼</span>
                                        </div>
                                    </div>
                                    
                                    {isExpanded && (
                                        <div className="order-details-list">
                                            {order.orderDetails.map(detail => {
                                                const detailStatusInfo = getOrderDetailStatusInfo(detail.status);
                                                return (
                                                    <div key={detail.id} className="order-detail-wrapper">
                                                        <div className="order-detail-item">
                                                            <span className="service-name">{detail.serviceName}</span>
                                                            <div className="detail-actions">
                                                                {detail.status === COMPLETED_DETAIL_STATUS && !detail.rating && (
                                                                    <button className="btn-rate" onClick={() => handleOpenRatingModal(detail)}>Đánh giá</button>
                                                                )}
                                                                {detail.rating && <span className="rated-stars">{`★ ${detail.rating}`}</span>}
                                                                <span className={`status-badge status-${detailStatusInfo.class}`}>{detailStatusInfo.text}</span>
                                                            </div>
                                                        </div>
                                                        {detail.note && (
                                                            <div className="order-detail-note">
                                                                <strong>Ghi chú của nhân viên:</strong> {detail.note}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    <div className="order-card-footer">
                                        <span>Tổng cộng:</span>
                                        <span className="order-total">{formatCurrency(order.totalPrice)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : ( <p className="empty-message">Không có đơn hàng nào phù hợp.</p> )}
            </>
        );
    };

    return (
        <div className="user-page-container">
            <div className="order-container">
                <h1 className="page-title">Lịch Sử Đơn Hàng</h1>
                <p className="page-subtitle">Xem lại và quản lý các dịch vụ bạn đã đặt.</p>
                <div className="content-box">{renderContent()}</div>
                {isRatingModalOpen && (
                    <RatingModal
                        orderDetail={selectedDetailForRating}
                        onClose={() => setIsRatingModalOpen(false)}
                        onRatingSuccess={handleRatingSuccess}
                    />
                )}
            </div>
        </div>
    );
};

export default OrderHistoryPage;