import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getOrderHistory } from '../../api/orderAPI';
import { getAllStaff } from '../../api/staffapi'; // Import từ file API mới
import RatingModal from '../../components/RatingModal/RatingModal';
import './OrderHistoryPage.css';

// --- Hằng số và hàm tiện ích ---
const STATUS_MAP = {
    0: { text: 'Chờ xử lý', class: 'pending' },
    1: { text: 'Đang thực hiện', class: 'processing' },
    2: { text: 'Hoàn thành', class: 'completed' },
    3: { text: 'Đã hủy', class: 'cancelled' },
};
const COMPLETED_STATUS = 2;

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const getOverallOrderStatus = (orderDetails) => {
    if (!orderDetails || orderDetails.length === 0) return 0;
    const statuses = orderDetails.map(detail => detail.status);
    const uniqueStatuses = [...new Set(statuses)];
    if (uniqueStatuses.length === 1) return uniqueStatuses[0];
    return Math.min(...statuses);
};

const getStatusInfo = (status) => STATUS_MAP[status] || { text: 'Không rõ', class: 'unknown' };


// --- Component chính ---
const OrderHistoryPage = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [selectedDetailForRating, setSelectedDetailForRating] = useState(null);

    useEffect(() => {
        const fetchAllData = async () => {
            if (!user?.id) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            try {
                // Gọi cả hai API cùng lúc để tăng hiệu suất
                const [orderResponse, staffResponse] = await Promise.all([
                    getOrderHistory(user.id),
                    getAllStaff()
                ]);

                // Kiểm tra cả hai API có thành công không
                if (!orderResponse.isSuccess || !staffResponse.isSuccess) {
                    throw new Error(orderResponse.message || staffResponse.message || 'Lỗi tải dữ liệu.');
                }

                const ordersData = orderResponse.data;
                const staffData = staffResponse.data;

                // Tạo một "bản đồ" để tra cứu tên nhân viên nhanh chóng từ ID
                const staffMap = new Map(staffData.map(staff => [staff.id, staff.fullName]));

                // Thêm tên nhân viên vào từng chi tiết đơn hàng
                const ordersWithStaffNames = ordersData.map(order => ({
                    ...order,
                    orderDetails: order.orderDetails.map(detail => ({
                        ...detail,
                        // Tra cứu tên từ bản đồ, nếu không có thì hiển thị fallback
                        staffName: staffMap.get(detail.staffId) || 'Chưa phân công'
                    }))
                }));

                // Sắp xếp đơn hàng mới nhất lên đầu và cập nhật state
                const sortedOrders = ordersWithStaffNames.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
                setOrders(sortedOrders);

            } catch (err) {
                setError(err.message || 'Lỗi tải lịch sử đơn hàng.');
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [user]);

    // Các hook useMemo để xử lý lọc và xử lý dữ liệu đã có
    const processedOrders = useMemo(() => orders.map(order => ({...order, overallStatus: getOverallOrderStatus(order.orderDetails)})), [orders]);

    const filteredOrders = useMemo(() => {
        if (activeFilter === 'all') return processedOrders;
        const filterStatusKey = Object.keys(STATUS_MAP).find(key => STATUS_MAP[key].class === activeFilter);
        return processedOrders.filter(order => order.overallStatus === parseInt(filterStatusKey));
    }, [processedOrders, activeFilter]);


    const handleOpenRatingModal = (detail) => {
        setSelectedDetailForRating(detail);
        setIsRatingModalOpen(true);
    };

    const handleRatingSuccess = (orderDetailId, newScore) => {
        setOrders(prevOrders => prevOrders.map(order => ({
            ...order,
            orderDetails: order.orderDetails.map(detail =>
                detail.orderDetailId === orderDetailId ? { ...detail, rating: newScore } : detail
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
                    {Object.values(STATUS_MAP).map(statusInfo => (
                        <button key={statusInfo.class} onClick={() => setActiveFilter(statusInfo.class)} className={activeFilter === statusInfo.class ? 'active' : ''}>
                            {statusInfo.text}
                        </button>
                    ))}
                </div>

                {filteredOrders.length > 0 ? (
                    <div className="order-list">
                        {filteredOrders.map(order => {
                            const statusInfo = getStatusInfo(order.overallStatus);
                            return (
                                <div key={order.id} className="order-card">
                                    <div className="order-card-header">
                                        <div>
                                            <span className="order-id">Đơn hàng #{order.id.substring(0, 8)}</span>
                                            <span className="order-date">{formatDate(order.orderDate)}</span>
                                        </div>
                                        <span className={`status-badge status-${statusInfo.class}`}>{statusInfo.text}</span>
                                    </div>
                                    <div className="order-details-list">
                                        {order.orderDetails.map(detail => (
                                            <div key={detail.orderDetailId} className="order-detail-item">
                                                <div className="detail-info">
                                                    <span className="service-name">{detail.serviceName}</span>
                                                    {detail.staffName && (
                                                        <span className="staff-name">Thực hiện bởi: {detail.staffName}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    {order.overallStatus === COMPLETED_STATUS && !detail.rating && (
                                                        <button className="btn-rate" onClick={() => handleOpenRatingModal(detail)}>Đánh giá</button>
                                                    )}
                                                    {detail.rating && <span className="rated-stars">{`★ ${detail.rating}`}</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="order-card-footer">
                                        <span>Tổng cộng:</span>
                                        <span className="order-total">{formatCurrency(order.totalPrice)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="empty-message">Không có đơn hàng nào phù hợp.</p>
                )}
            </>
        );
    };

    return (
        <div className="user-page-container">
            <div className="container">
                <h1 className="page-title">Lịch Sử Đơn Hàng</h1>
                <p className="page-subtitle">Xem lại và quản lý các dịch vụ bạn đã đặt.</p>
                <div className="content-box">
                    {renderContent()}
                </div>
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