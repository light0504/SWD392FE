import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getStaffOrders, completeOrderDetail, cancelOrderDetail } from '../../api/orderAPI';
import { getAllCustomers } from '../../api/userAPI'; // Vẫn cần để lấy tên khách hàng
import './DashboardPages.css';
import './StaffWorklogPage.css';

// --- Hằng số và hàm tiện ích ---
const STATUS_MAP = {
    0: { text: 'Chờ xử lý', class: 'pending' },
    1: { text: 'Đang thực hiện', class: 'processing' },
    2: { text: 'Hoàn thành', class: 'completed' },
    3: { text: 'Đã hủy', class: 'cancelled' },
};
const PENDING_STATUS = 0;

const formatDate = (dateString) => new Date(dateString).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const getStatusInfo = (status) => STATUS_MAP[status] || { text: 'Không rõ', class: 'unknown' };


const StaffWorklogPage = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [timeFilter, setTimeFilter] = useState('today');
    const [searchTerm, setSearchTerm] = useState('');

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

    // Lọc và tìm kiếm dữ liệu
    const filteredTasks = useMemo(() => {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

        return tasks
            .filter(task => { // Lọc theo thời gian
                const taskDate = new Date(task.scheduledTime);
                if (timeFilter === 'today') return taskDate >= startOfToday && taskDate < startOfTomorrow;
                if (timeFilter === 'future') return taskDate >= startOfTomorrow;
                if (timeFilter === 'past') return taskDate < startOfToday;
                return true;
            })
            .filter(task => { // Lọc theo trạng thái
                if (statusFilter === 'all') return true;
                const key = Object.keys(STATUS_MAP).find(k => STATUS_MAP[k].class === statusFilter);
                return task.status === parseInt(key);
            })
            .filter(task => { // Lọc theo từ khóa tìm kiếm
                if (!searchTerm) return true;
                return task.orderId.toLowerCase().includes(searchTerm.toLowerCase());
            })
            .sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));
    }, [tasks, statusFilter, timeFilter, searchTerm]);

    // Cập nhật trạng thái của một công việc trên UI
    const updateTaskStatus = (orderDetailId, newStatus) => {
        setTasks(prevTasks => prevTasks.map(task => 
            // Quan trọng: Phải so sánh với ID duy nhất của OrderDetail
            task.orderDetailId === orderDetailId ? { ...task, status: newStatus } : task
        ));
    };

    const handleComplete = async (orderDetailId) => {
        if (!window.confirm("Bạn chắc chắn muốn hoàn thành công việc này?")) return;
        try {
            console.log(`Completing order detail ${orderDetailId}...`);
            await completeOrderDetail(orderDetailId);
            updateTaskStatus(orderDetailId, 2);
        } catch (err) { alert("Cập nhật thất bại!"); }
    };

    const handleCancel = async (orderDetailId) => {
        if (!window.confirm("Bạn chắc chắn muốn hủy công việc này?")) return;
        try {
            await cancelOrderDetail(orderDetailId);
            updateTaskStatus(orderDetailId, 3); // 3 = Cancelled
        } catch (err) { alert("Cập nhật thất bại!"); }
    };

    const renderContent = () => {
        if (loading) return <div className="loading-spinner"></div>;
        if (error) return <p className="error-message">{error}</p>;
        if (filteredTasks.length === 0) return <p className="empty-message">Không có công việc nào phù hợp.</p>;

        return (
            <div className="task-list">
                {console.log("Rendering tasks:", filteredTasks)}
                {filteredTasks.map(task => (
                    // Sử dụng orderDetailId làm key để đảm bảo tính duy nhất
                    <div key={task.orderDetailId} className="task-card">
                        <div className="task-header">
                            <span className="task-service-name">{task.serviceName}</span>
                            <span className={`status-badge status-${getStatusInfo(task.status).class}`}>
                                {getStatusInfo(task.status).text}
                            </span>
                        </div>
                        <div className="task-body">
                            <p><strong>Khách hàng:</strong> {task.customerName}</p>
                            <p><strong>Lịch hẹn:</strong> {formatDate(task.scheduledTime)}</p>
                            <p><strong>Mã ĐH:</strong> {task.orderId.substring(0, 8)}</p>
                        </div>
                        {task.status === PENDING_STATUS && (
                            <div className="task-actions">
                                {/* Truyền orderDetailId vào hàm xử lý */}
                                <button className="btn-action btn-cancel" onClick={() => handleCancel(task.orderDetailId)}>Hủy</button>
                                <button className="btn-action btn-complete" onClick={() => handleComplete(task.orderDetailId)}>Hoàn thành</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="dashboard-page">
            <h1 className="page-title">Công Việc Của Tôi</h1>
            <p className="page-subtitle">Danh sách các dịch vụ được phân công cho bạn.</p>
            <div className="content-box">
                <div className="page-controls">
                    <div className="time-filter-group">
                        <button onClick={() => setTimeFilter('today')} className={timeFilter === 'today' ? 'active' : ''}>Hôm Nay</button>
                        <button onClick={() => setTimeFilter('future')} className={timeFilter === 'future' ? 'active' : ''}>Sắp Tới</button>
                        <button onClick={() => setTimeFilter('past')} className={timeFilter === 'past' ? 'active' : ''}>Đã Qua</button>
                    </div>
                    <div className="search-container">
                        <input type="text" placeholder="Tìm theo mã đơn hàng..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                </div>

                <div className="filter-tabs">
                    <button onClick={() => setStatusFilter('pending')} className={statusFilter === 'pending' ? 'active' : ''}>Chờ xử lý</button>
                    <button onClick={() => setStatusFilter('completed')} className={statusFilter === 'completed' ? 'active' : ''}>Hoàn thành</button>
                    <button onClick={() => setStatusFilter('cancelled')} className={statusFilter === 'cancelled' ? 'active' : ''}>Đã hủy</button>
                    <button onClick={() => setStatusFilter('all')} className={statusFilter === 'all' ? 'active' : ''}>Tất Cả</button>
                </div>
                {renderContent()}
            </div>
        </div>
    );
};

export default StaffWorklogPage;