import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getStaffOrders, completeOrderDetail, cancelOrderDetail } from '../../api/orderAPI';
import { getAllCustomers } from '../../api/userAPI';
import { getOrderDetailStatusInfo, ORDER_DETAIL_STATUS_MAP } from '../../constants/status'; // Import mapping chi tiết
import './DashboardPages.css';
import './StaffWorklogPage.css';

const formatDate = (dateString) => new Date(dateString).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const COMPLETED_STATUS = 3; // 'Completed' của OrderDetail là 3
const CANCELLED_STATUS = 4; // 'Cancelled' của OrderDetail là 4
const PENDING_STATUS = 0; // 'Pending' của OrderDetail là 0

const StaffWorklogPage = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('pending'); // Mặc định lọc việc cần làm

    useEffect(() => {
        const fetchWorklog = async () => {
            if (!user?.id) { setLoading(false); return; }
            setLoading(true);
            try {
                // Gọi API lấy đơn hàng và danh sách khách hàng cùng lúc
                const [ordersRes, customersRes] = await Promise.all([
                    getStaffOrders(user.id),
                    getAllCustomers()
                ]);

                if (!ordersRes.isSuccess || !customersRes.isSuccess) {
                    throw new Error(ordersRes.message || customersRes.message || 'Lỗi tải dữ liệu');
                }

                const customerMap = new Map(customersRes.data.map(c => [c.userId, `${c.lastName} ${c.firstName}`]));

                // "Làm phẳng" dữ liệu: Lấy tất cả orderDetails từ tất cả orders
                const allDetails = ordersRes.data.flatMap(order => 
                    order.orderDetails.map(detail => ({
                        ...detail,
                        orderId: order.id,
                        customerName: customerMap.get(order.customerId) || 'Khách vãng lai',
                        orderDate: order.orderDate,
                    }))
                );
                setTasks(allDetails);
            } catch (err) { setError(err.message || 'Lỗi tải danh sách công việc.'); } 
            finally { setLoading(false); }
        };
        fetchWorklog();
    }, [user]);
    
    const filteredTasks = useMemo(() => {
        if (statusFilter === 'all') return tasks;
        const key = Object.keys(ORDER_DETAIL_STATUS_MAP).find(k => ORDER_DETAIL_STATUS_MAP[k].class === statusFilter);
        return tasks.filter(t => t.status === parseInt(key));
    }, [tasks, statusFilter]);

    const updateTaskStatus = (orderDetailId, newStatus) => {
        setTasks(prev => prev.map(task => 
            task.id === orderDetailId ? { ...task, status: newStatus } : task
        ));
    };

    const handleComplete = async (task) => {
        const note = window.prompt("Nhập ghi chú hoàn thành (nếu có):");
        if (note === null) return;
        try {
            await completeOrderDetail(task.id, note);
            updateTaskStatus(task.id, COMPLETED_STATUS);
            alert("Công việc đã được cập nhật!");
        } catch (err) { alert("Cập nhật thất bại!"); }
    };

    const handleCancel = async (task) => {
        if (!window.confirm("Bạn chắc chắn muốn hủy công việc này?")) return;
        try {
            await cancelOrderDetail(task.id);
            updateTaskStatus(task.id, CANCELLED_STATUS);
        } catch (err) { alert("Cập nhật thất bại!"); }
    };

    const renderContent = () => {
        if (loading) return <div className="loading-spinner"></div>;
        if (error) return <p className="error-message">{error}</p>;
        if (filteredTasks.length === 0) return <p className="empty-message">Không có công việc nào phù hợp.</p>;

        return (
            <div className="task-list">
                {filteredTasks.map(task => {
                    const statusInfo = getOrderDetailStatusInfo(task.status);
                    return (
                        <div key={task.id} className="task-card">
                            <div className="task-header">
                                <span className="task-service-name">{task.serviceName}</span>
                                <span className={`status-badge status-${statusInfo.class}`}>{statusInfo.text}</span>
                            </div>
                            <div className="task-body">
                                <p><strong>Khách hàng:</strong> {task.customerName}</p>
                                <p><strong>Lịch hẹn:</strong> {formatDate(task.scheduledTime)}</p>
                                <p><strong>Mã ĐH:</strong> {task.orderId.substring(0, 8)}</p>
                            </div>
                            {task.status < COMPLETED_STATUS && ( // Hiển thị nút nếu chưa Hoàn thành hoặc Hủy
                                <div className="task-actions">
                                    <button className="btn-action btn-cancel" onClick={() => handleCancel(task)}>Hủy</button>
                                    <button className="btn-action btn-complete" onClick={() => handleComplete(task)}>Hoàn thành</button>
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
            <h1 className="page-title">Công Việc Của Tôi</h1>
            <p className="page-subtitle">Danh sách các dịch vụ được phân công cho bạn.</p>
            <div className="content-box">
                <div className="filter-tabs">
                    <button onClick={() => setStatusFilter('all')} className={statusFilter === 'all' ? 'active' : ''}>Tất Cả</button>
                    {Object.values(ORDER_DETAIL_STATUS_MAP).map(status => (
                        <button key={status.class} onClick={() => setStatusFilter(status.class)} className={statusFilter === status.class ? 'active' : ''}>
                            {status.text}
                        </button>
                    ))}
                </div>
                {renderContent()}
            </div>
        </div>
    );
};

export default StaffWorklogPage;