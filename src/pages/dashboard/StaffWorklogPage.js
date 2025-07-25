import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getStaffOrders, updateOrderDetailStatus } from '../../api/orderAPI';
import { getAllCustomers } from '../../api/userAPI';
import { ORDER_DETAIL_STATUS_MAP, getOrderDetailStatusInfo } from '../../constants/status';
import { Helmet } from 'react-helmet-async';
import './DashboardPages.css';
import './StaffWorklogPage.css';

// Simple Modal Component
const Modal = ({ open, title, message, input, inputValue, onInputChange, onClose, onConfirm, confirmText = 'Xác nhận', cancelText = 'Hủy' }) => {
    if (!open) return null;
    const isSuccess = title === 'Thành công';
    return (
        <div className="modal-overlay">
            <div className="modal-box">
                <h3 className="modal-title">{title}</h3>
                <div className="modal-message">{message}</div>
                {input && (
                    <textarea
                        className="modal-input"
                        value={inputValue}
                        onChange={e => onInputChange(e.target.value)}
                        placeholder="Nhập ghi chú (nếu có)"
                        rows={3}
                        style={{ width: '100%', marginTop: 8 }}
                    />
                )}
                <div className="modal-actions">
                    {isSuccess ? (
                        <button className="btn-action btn-confirm" onClick={onClose}>Đóng</button>
                    ) : (
                        <>
                            <button className="btn-action btn-cancel" onClick={onClose}>{cancelText}</button>
                            <button className="btn-action btn-confirm" onClick={onConfirm}>{confirmText}</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};


const formatDate = (dateString) => new Date(dateString).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const StaffWorklogPage = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('pending');
    // Modal state
    const [modal, setModal] = useState({ open: false, title: '', message: '', input: false, inputValue: '', onConfirm: null });

    useEffect(() => {
        const fetchWorklog = async () => {
            if (!user?.id) { setLoading(false); return; }
            setLoading(true);
            try {
                const [ordersRes, customersRes] = await Promise.all([
                    getStaffOrders(user.id),
                    getAllCustomers()
                ]);

                if (!ordersRes.isSuccess || !customersRes.isSuccess) {
                    throw new Error(ordersRes.message || customersRes.message || 'Lỗi tải dữ liệu');
                }

                const customerMap = new Map(customersRes.data.map(c => [c.userId, `${c.lastName} ${c.firstName}`]));

                const allDetails = ordersRes.data.flatMap(order => 
                    order.orderDetails.map(detail => ({
                        ...detail,
                        orderId: order.id,
                        customerName: customerMap.get(order.customerId) || 'Khách vãng lai',
                    }))
                );
                setTasks(allDetails);
            } catch (err) { setError(err.message || 'Lỗi tải danh sách công việc.'); } 
            finally { setLoading(false); }
        };
        fetchWorklog();
    }, [user]);

    const filteredTasks = useMemo(() => {
        const sortedTasks = [...tasks].sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));
        if (statusFilter === 'all') return sortedTasks;
        const key = Object.keys(ORDER_DETAIL_STATUS_MAP).find(k => ORDER_DETAIL_STATUS_MAP[k].class === statusFilter);
        return sortedTasks.filter(t => t.status === parseInt(key));
    }, [tasks, statusFilter]);

    const updateTaskOnUI = (orderDetailId, newStatus, newNote = null) => {
        setTasks(prevTasks => prevTasks.map(task => 
            task.id === orderDetailId 
                ? { ...task, status: newStatus, note: newNote !== null ? newNote : task.note } 
                : task
        ));
    };

    const handleStatusChange = (task, newStatus, requiresNote = false) => {
        const statusText = ORDER_DETAIL_STATUS_MAP[newStatus]?.text.toLowerCase();
        if (requiresNote) {
            setModal({
                open: true,
                title: 'Hoàn thành công việc',
                message: 'Vui lòng nhập ghi chú hoàn thành (nếu có):',
                input: true,
                inputValue: '',
                onConfirm: async (note) => {
                    try {
                        const payload = {
                            orderDetailId: task.id,
                            newStatus: newStatus,
                            note: note
                        };
                        await updateOrderDetailStatus(payload);
                        updateTaskOnUI(task.id, newStatus, note);
                        setModal({
                            open: true,
                            title: 'Thành công',
                            message: 'Cập nhật trạng thái thành công!',
                            input: false,
                            inputValue: '',
                            onConfirm: () => setModal(m => ({ ...m, open: false }))
                        });
                    } catch (err) {
                        setModal({
                            open: true,
                            title: 'Lỗi',
                            message: 'Cập nhật thất bại! Vui lòng thử lại.',
                            input: false,
                            inputValue: '',
                            onConfirm: () => setModal(m => ({ ...m, open: false }))
                        });
                    }
                }
            });
        } else {
            setModal({
                open: true,
                title: 'Xác nhận',
                message: `Bạn có chắc muốn chuyển trạng thái công việc thành "${statusText}" không?`,
                input: false,
                inputValue: '',
                onConfirm: async () => {
                    try {
                        const payload = {
                            orderDetailId: task.id,
                            newStatus: newStatus,
                            note: ''
                        };
                        await updateOrderDetailStatus(payload);
                        updateTaskOnUI(task.id, newStatus, '');
                        setModal({
                            open: true,
                            title: 'Thành công',
                            message: 'Cập nhật trạng thái thành công!',
                            input: false,
                            inputValue: '',
                            onConfirm: () => setModal(m => ({ ...m, open: false }))
                        });
                    } catch (err) {
                        setModal({
                            open: true,
                            title: 'Lỗi',
                            message: 'Cập nhật thất bại! Vui lòng thử lại.',
                            input: false,
                            inputValue: '',
                            onConfirm: () => setModal(m => ({ ...m, open: false }))
                        });
                    }
                }
            });
        }
    };

    const renderTaskActions = (task) => {
        const PENDING = 0;
        const IN_PROGRESS = 1;
        const COMPLETED = 2;
        const CANCELLED = 3;

        switch (task.status) {
            case PENDING:
                return (
                    <>
                        <button className="btn-action btn-cancel" onClick={() => handleStatusChange(task, CANCELLED)}>Hủy</button>
                        <button className="btn-action btn-progress" onClick={() => handleStatusChange(task, IN_PROGRESS)}>Bắt đầu</button>
                    </>
                );
            case IN_PROGRESS:
                return (
                    <div>
                        <button className="btn-action btn-complete" onClick={() => handleStatusChange(task, COMPLETED, true)}>Hoàn thành</button>
                    </div>
                );
            default:
                return null;
        }
    };

    const renderContent = () => {
        if (loading) return <div className="loading-spinner"></div>;
        if (error) return <p className="error-message">{error}</p>;
        if (filteredTasks.length === 0) return <p className="empty-message">Không có công việc nào phù hợp.</p>;

        return (
            <div className="task-list">
                <Helmet>
                    <title>Đơn đặt lịch</title>
                </Helmet>
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
                                {task.note && <p className="task-note"><strong>Ghi chú:</strong> {task.note}</p>}
                            </div>
                            <div className="task-actions">
                                {renderTaskActions(task)}
                            </div>
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
            {/* Modal for confirm/note/notice */}
            <Modal
                open={modal.open}
                title={modal.title}
                message={modal.message}
                input={modal.input}
                inputValue={modal.inputValue}
                onInputChange={val => setModal(m => ({ ...m, inputValue: val }))}
                onClose={() => setModal(m => ({ ...m, open: false }))}
                onConfirm={() => {
                    if (modal.input) {
                        modal.onConfirm && modal.onConfirm(modal.inputValue);
                        setModal(m => ({ ...m, open: false }));
                    } else {
                        modal.onConfirm && modal.onConfirm();
                        setModal(m => ({ ...m, open: false }));
                    }
                }}
                confirmText={modal.input ? 'Hoàn thành' : 'Xác nhận'}
                cancelText="Hủy"
            />
        </div>
    );
};

export default StaffWorklogPage;