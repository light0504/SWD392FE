import React, { useEffect, useState, useMemo } from 'react';
import { getAllOrder } from '../../api/orderAPI';
import { getAllCustomers } from '../../api/userAPI';
import { getAllStaff } from '../../api/staffapi';
import './DashboardPages.css';
import './ManagerOrderPage.css';

// --- Hằng số và hàm tiện ích ---
const STATUS_MAP = {
    0: { text: 'Chờ xử lý', class: 'pending' },
    1: { text: 'Đang thực hiện', class: 'processing' },
    2: { text: 'Hoàn thành', class: 'completed' },
    3: { text: 'Đã hủy', class: 'cancelled' },
};

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
const getStatusInfo = (status) => STATUS_MAP[status] || { text: 'Không rõ', class: 'unknown' };
const getOverallOrderStatus = (orderDetails) => {
    if (!orderDetails || orderDetails.length === 0) return 0;
    const statuses = orderDetails.map(detail => detail.status);
    if ([...new Set(statuses)].length === 1) return statuses[0];
    return Math.min(...statuses);
};

// --- Component chính ---
const ManagerOrderPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [timeFilter, setTimeFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                const [orderRes, customerRes, staffRes] = await Promise.all([
                    getAllOrder(), 
                    getAllCustomers(), 
                    getAllStaff()
                ]);

                if (!orderRes.isSuccess || !customerRes.isSuccess || !staffRes.isSuccess) {
                    throw new Error(orderRes.message || customerRes.message || staffRes.message || 'Lỗi tải dữ liệu.');
                }

                const customerMap = new Map(customerRes.data.map(user => [user.userId, `${user.lastName} ${user.firstName}`]));
                const staffMap = new Map(staffRes.data.map(staff => [staff.id, staff.fullName]));

                const enrichedOrders = orderRes.data.map(order => ({
                    ...order,
                    customerName: customerMap.get(order.customerId) || 'Khách vãng lai',
                    overallStatus: getOverallOrderStatus(order.orderDetails),
                    orderDetails: order.orderDetails.map(detail => ({
                        ...detail,
                        staffName: staffMap.get(detail.staffId) || 'Chưa phân công',
                    })),
                }));

                setOrders(enrichedOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)));

            } catch (err) {
                setError(err.message || 'Không thể kết nối đến máy chủ.');
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    const filteredOrders = useMemo(() => {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

        return orders
            .filter(order => {
                const orderDate = new Date(order.orderDate);
                if (timeFilter === 'today') return orderDate >= startOfToday && orderDate < startOfTomorrow;
                if (timeFilter === 'future') return orderDate >= startOfTomorrow;
                if (timeFilter === 'past') return orderDate < startOfToday;
                return true;
            })
            .filter(order => {
                if (statusFilter === 'all') return true;
                const key = Object.keys(STATUS_MAP).find(k => STATUS_MAP[k].class === statusFilter);
                return order.overallStatus === parseInt(key);
            })
            .filter(order => {
                if (!searchTerm) return true;
                const lowerSearchTerm = searchTerm.toLowerCase();
                return (
                    order.id.toLowerCase().includes(lowerSearchTerm) ||
                    order.customerName.toLowerCase().includes(lowerSearchTerm)
                );
            });
    }, [orders, statusFilter, timeFilter, searchTerm]);

    const toggleOrderDetails = (orderId) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    const renderContent = () => {
        if (loading) return <div className="loading-spinner"></div>;
        if (error) return <p className="error-message">{error}</p>;
        if (filteredOrders.length === 0) return <p className="empty-message">Không có đơn hàng nào phù hợp với bộ lọc.</p>;

        return (
            <div className="order-table-container">
                {filteredOrders.map(order => {
                    const statusInfo = getStatusInfo(order.overallStatus);
                    const isExpanded = expandedOrderId === order.id;
                    return (
                        <div key={order.id} className="order-row-group">
                            <div className="order-row-main" onClick={() => toggleOrderDetails(order.id)}>
                                <div className="cell order-id" data-label="Mã ĐH">{order.id.substring(0, 8)}</div>
                                <div className="cell customer-name" data-label="Khách Hàng">{order.customerName}</div>
                                <div className="cell order-date" data-label="Ngày Đặt">{formatDate(order.orderDate)}</div>
                                <div className="cell order-status" data-label="Trạng Thái">
                                    <span className={`status-badge status-${statusInfo.class}`}>{statusInfo.text}</span>
                                </div>
                                <div className="cell order-total" data-label="Tổng Tiền">{formatCurrency(order.totalPrice)}</div>
                                <div className="cell expand-icon" data-label="Chi tiết">{isExpanded ? '▲' : '▼'}</div>
                            </div>
                            {isExpanded && (
                                <div className="order-row-details">
                                    <h4>Chi tiết dịch vụ:</h4>
                                    <ul className="details-list">
                                        {order.orderDetails.map((detail, index) => {
                                            const detailStatusInfo = getStatusInfo(detail.status);
                                            return (
                                                <li key={index} className="detail-item">
                                                    <div className="detail-item-info">
                                                        <strong>{detail.serviceName}</strong>
                                                        <span>Lịch hẹn: {formatDate(detail.scheduledTime)}</span>
                                                        <span>Nhân viên: {detail.staffName}</span>
                                                    </div>
                                                    <div className="detail-item-status">
                                                        <span className={`status-badge status-${detailStatusInfo.class}`}>
                                                            {detailStatusInfo.text}
                                                        </span>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="dashboard-page">
            <h1 className="page-title">Quản Lý Đơn Hàng</h1>
            <p className="page-subtitle">Xem, lọc và quản lý tất cả các đơn hàng trong hệ thống.</p>
            <div className="content-box">
                <div className="page-controls">
                    <div className="time-filter-group">
                        <button onClick={() => setTimeFilter('all')} className={timeFilter === 'all' ? 'active' : ''}>Mọi lúc</button>
                        <button onClick={() => setTimeFilter('today')} className={timeFilter === 'today' ? 'active' : ''}>Hôm Nay</button>
                        <button onClick={() => setTimeFilter('future')} className={timeFilter === 'future' ? 'active' : ''}>Tương Lai</button>
                        <button onClick={() => setTimeFilter('past')} className={timeFilter === 'past' ? 'active' : ''}>Quá Khứ</button>
                    </div>
                    <div className="search-container">
                        <input type="text" placeholder="Tìm theo mã ĐH, tên khách hàng..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                </div>
                <div className="filter-tabs">
                    <button onClick={() => setStatusFilter('all')} className={statusFilter === 'all' ? 'active' : ''}>Tất Cả</button>
                    {Object.values(STATUS_MAP).map(status => (
                        <button key={status.class} onClick={() => setStatusFilter(status.class)} className={statusFilter === status.class ? 'active' : ''}>{status.text}</button>
                    ))}
                </div>
                <div className="order-table-header">
                    <div className="cell order-id">Mã ĐH</div>
                    <div className="cell customer-name">Khách Hàng</div>
                    <div className="cell order-date">Ngày Đặt</div>
                    <div className="cell order-status">Trạng Thái</div>
                    <div className="cell order-total">Tổng Tiền</div>
                    <div className="cell expand-icon"></div>
                </div>
                {renderContent()}
            </div>
        </div>
    );
};

export default ManagerOrderPage;