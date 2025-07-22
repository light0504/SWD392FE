import React, { useEffect, useState, useMemo } from 'react';
import { getAllOrder } from '../../api/orderAPI';
import { getAllCustomers } from '../../api/userAPI';
import { getAllStaff } from '../../api/staffapi';
import { getOrderStatusInfo, getOrderDetailStatusInfo, ORDER_STATUS_MAP } from '../../constants/status'; // Import từ file mới
import './DashboardPages.css';
import './ManagerOrderPage.css';

// --- Các hàm tiện ích khác ---
const formatDate = (dateString) => new Date(dateString).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

// --- Component chính ---
const ManagerOrderPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                const [orderRes, customerRes, staffRes] = await Promise.all([getAllOrder(), getAllCustomers(), getAllStaff()]);

                if (!orderRes.isSuccess || !customerRes.isSuccess || !staffRes.isSuccess) {
                    throw new Error(orderRes.message || customerRes.message || staffRes.message || 'Lỗi tải dữ liệu.');
                }

                const customerMap = new Map(customerRes.data.map(user => [user.userId, `${user.lastName} ${user.firstName}`]));
                const staffMap = new Map(staffRes.data.map(staff => [staff.id, staff.fullName]));

                const enrichedOrders = orderRes.data.map(order => ({
                    ...order,
                    customerName: customerMap.get(order.customerId) || 'Khách vãng lai',
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
        if (activeFilter === 'all') return orders;
        const key = Object.keys(ORDER_STATUS_MAP).find(k => ORDER_STATUS_MAP[k].class === activeFilter);
        return orders.filter(o => o.status === parseInt(key));
    }, [orders, activeFilter]);

    const toggleOrderDetails = (orderId) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    const renderContent = () => {
        if (loading) return <div className="loading-spinner"></div>;
        if (error) return <p className="error-message">{error}</p>;
        if (filteredOrders.length === 0) return <p className="empty-message">Không có đơn hàng nào phù hợp.</p>;

        return (
            <div className="order-table-container">
                {filteredOrders.map(order => {
                    const statusInfo = getOrderStatusInfo(order.status);
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
                                            const detailStatusInfo = getOrderDetailStatusInfo(detail.status);
                                            return (
                                                <li key={detail.id || index} className="detail-item">
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
                <div className="filter-tabs">
                    <button onClick={() => setActiveFilter('all')} className={activeFilter === 'all' ? 'active' : ''}>Tất Cả</button>
                    {Object.values(ORDER_STATUS_MAP).map(status => (
                        <button key={status.class} onClick={() => setActiveFilter(status.class)} className={activeFilter === status.class ? 'active' : ''}>{status.text}</button>
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