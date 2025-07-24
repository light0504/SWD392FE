import React from 'react';
import { useState, useEffect } from 'react';
import { getAllServices, createService, deleteService, updateService } from '../../api/serviceapi';
import './ServiceManagement.css';

// Modal component for notifications and confirmations
const Modal = ({ open, title, message, onClose, onConfirm, confirmText = 'Xác nhận', cancelText = 'Hủy', onlyClose = false, isSubmitting = false }) => {
    if (!open) return null;
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 style={{ marginTop: 0 }}>{title}</h2>
                <div style={{ marginBottom: 24 }}>{message}</div>
                <div className="modal-actions">
                    {onlyClose ? (
                        <button className="btn-save" onClick={onClose}>Đóng</button>
                    ) : (
                        <>
                            <button className="btn-cancel" onClick={onClose} disabled={isSubmitting}>{cancelText}</button>
                            <button className="btn-save" onClick={onConfirm} disabled={isSubmitting}>{isSubmitting ? 'Đang xử lý...' : confirmText}</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- CÁC HÀM TIỆN ÍCH ---
const formatCurrency = (value) => {
    const numberValue = Number(value);
    if (isNaN(numberValue)) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(numberValue);
};

const ServiceManagement = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); // Trạng thái cho nút Lưu
    // Modal state for notifications and confirmations
    const [modal, setModal] = useState({ open: false, title: '', message: '', onConfirm: null, onlyClose: false });
    const [newService, setNewService] = useState({
        name: '',
        price: '',
        description: '',
        duration: '',
    });
    // Edit modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editService, setEditService] = useState(null);

    useEffect(() => {
      fetchServices();
    }, []);

    // Hàm lấy danh sách dịch vụ từ API
    const fetchServices = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAllServices('Service');
            if (response != null) {
                setServices(response.data);
            } else {
                setError(response.message || 'Lỗi khi tải dữ liệu từ API.');
            }
        } catch (err) {
            console.error("Lỗi khi fetch dịch vụ:", err);
            setError("Không thể kết nối đến máy chủ. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateService = async (e) => {
        e.preventDefault();
        if (!newService.name || !newService.price || !newService.duration) {
            setModal({
                open: true,
                title: 'Thiếu thông tin',
                message: 'Vui lòng điền đầy đủ các trường bắt buộc.',
                onConfirm: null,
                onlyClose: true
            });
            return;
        }
        setIsSubmitting(true);

        const payload = {
            ...newService,
            price: Number(newService.price),
            duration: Number(newService.duration),
        };

        try {
            const response = await createService(payload);
            if (response.isSuccess) {
                setModal({
                    open: true,
                    title: 'Thành công',
                    message: 'Tạo dịch vụ mới thành công!',
                    onConfirm: () => {
                        setModal(m => ({ ...m, open: false }));
                        closeModal();
                        fetchServices();
                    },
                    onlyClose: true
                });
            } else {
                setModal({
                    open: true,
                    title: 'Thất bại',
                    message: response.data?.message || 'Tạo dịch vụ thất bại.',
                    onConfirm: null,
                    onlyClose: true
                });
            }
        } catch (err) {
            console.error("Lỗi khi tạo dịch vụ:", err);
            setModal({
                open: true,
                title: 'Lỗi',
                message: 'Đã có lỗi xảy ra phía máy chủ.',
                onConfirm: null,
                onlyClose: true
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Hàm xử lý xóa dịch vụ
    const handleDeleteService = async (serviceId) => {
        setModal({
            open: true,
            title: 'Xác nhận',
            message: 'Bạn có chắc chắn muốn xóa dịch vụ này không?',
            onConfirm: async () => {
                setModal(m => ({ ...m, open: false }));
                try {
                    await deleteService(serviceId);
                    setModal({
                        open: true,
                        title: 'Thành công',
                        message: 'Xóa dịch vụ thành công!',
                        onConfirm: () => setModal(m => ({ ...m, open: false })),
                        onlyClose: true
                    });
                    setServices(services.filter(s => s.id !== serviceId));
                } catch (err) {
                    console.error("Lỗi khi xóa dịch vụ:", err);
                    setModal({
                        open: true,
                        title: 'Lỗi',
                        message: 'Xóa dịch vụ thất bại. Vui lòng thử lại.',
                        onConfirm: () => setModal(m => ({ ...m, open: false })),
                        onlyClose: true
                    });
                }
            },
            onlyClose: false
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewService({ ...newService, [name]: value });
    };

    const openModal = () => {
        setNewService({ name: '', price: '', description: '', duration: '' });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    // --- RENDER ---

    if (loading) {
        return <div className="placeholder-content">Đang tải danh sách dịch vụ...</div>;
    }

    if (error) {
        return <div className="placeholder-content error-box">{error}</div>;
    }

    return (
        <>
            <div className="dashboard-page service-management-page">
                <h1 className="page-title">Quản Lý Dịch Vụ</h1>
                <p className="page-subtitle">
                    Thêm, sửa, xóa và quản lý các dịch vụ của cửa hàng.
                </p>

                <div className="content-box">
                    <div className="content-header">
                        <button className="btn-add" onClick={openModal}>Thêm dịch vụ mới</button>
                    </div>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Tên dịch vụ</th>
                                    <th>Mô tả</th>
                                    <th>Thời gian (phút)</th>
                                    <th>Giá tiền</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(services) && services.length > 0 ? (
                                    services.map((service) => (
                                        <tr key={service.id}>
                                            <td data-label="Tên dịch vụ" className="service-name">{service.name}</td>
                                            <td data-label="Mô tả">{service.description}</td>
                                            <td data-label="Thời gian">{service.duration}</td>
                                            <td data-label="Giá tiền" className="price">{formatCurrency(service.price)}</td>
                                            <td data-label="Hành động">
                                            <button className="action-btn btn-edit" onClick={() => {
                                                setEditService({ ...service });
                                                setIsEditModalOpen(true);
                                            }}>Sửa</button>
            {/* Edit Service Modal */}
            {isEditModalOpen && editService && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Cập nhật dịch vụ</h2>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            setIsSubmitting(true);
                            try {
                                const payload = {
                                    id: editService.id,
                                    name: editService.name,
                                    price: Number(editService.price),
                                    description: editService.description,
                                    duration: Number(editService.duration)
                                };
                                const response = await updateService(payload);
                                if (response.isSuccess) {
                                    setModal({
                                        open: true,
                                        title: 'Thành công',
                                        message: 'Cập nhật dịch vụ thành công!',
                                        onConfirm: () => {
                                            setModal(m => ({ ...m, open: false }));
                                            setIsEditModalOpen(false);
                                            fetchServices();
                                        },
                                        onlyClose: true
                                    });
                                } else {
                                    setModal({
                                        open: true,
                                        title: 'Thất bại',
                                        message: response.data?.message || 'Cập nhật dịch vụ thất bại.',
                                        onConfirm: null,
                                        onlyClose: true
                                    });
                                }
                            } catch (err) {
                                setModal({
                                    open: true,
                                    title: 'Lỗi',
                                    message: 'Đã có lỗi xảy ra phía máy chủ.',
                                    onConfirm: null,
                                    onlyClose: true
                                });
                            } finally {
                                setIsSubmitting(false);
                            }
                        }}>
                            <div className="form-group">
                                <label htmlFor="edit-name">Tên dịch vụ *</label>
                                <input type="text" id="edit-name" name="name" value={editService.name} onChange={e => setEditService({ ...editService, name: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="edit-price">Giá tiền (VND) *</label>
                                <input type="number" id="edit-price" name="price" value={editService.price} onChange={e => setEditService({ ...editService, price: e.target.value })} required min="0" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="edit-duration">Thời gian (phút) *</label>
                                <input type="number" id="edit-duration" name="duration" value={editService.duration} onChange={e => setEditService({ ...editService, duration: e.target.value })} required min="0" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="edit-description">Mô tả</label>
                                <textarea id="edit-description" name="description" value={editService.description} onChange={e => setEditService({ ...editService, description: e.target.value })} rows="4"></textarea>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setIsEditModalOpen(false)} disabled={isSubmitting}>Hủy</button>
                                <button type="submit" className="btn-save" disabled={isSubmitting}>{isSubmitting ? 'Đang lưu...' : 'Cập nhật'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
                                                <button className="action-btn btn-delete" onClick={() => handleDeleteService(service.id)}>Xóa</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                                            Chưa có dịch vụ nào.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2>Tạo dịch vụ mới</h2>
                            <form onSubmit={handleCreateService}>
                                 {/* Các form-group giữ nguyên */}
                                <div className="form-group">
                                    <label htmlFor="name">Tên dịch vụ *</label>
                                    <input type="text" id="name" name="name" value={newService.name} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="price">Giá tiền (VND) *</label>
                                    <input type="number" id="price" name="price" value={newService.price} onChange={handleInputChange} required min="0" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="duration">Thời gian (phút) *</label>
                                    <input type="number" id="duration" name="duration" value={newService.duration} onChange={handleInputChange} required min="0" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="description">Mô tả</label>
                                    <textarea id="description" name="description" value={newService.description} onChange={handleInputChange} rows="4"></textarea>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-cancel" onClick={closeModal} disabled={isSubmitting}>Hủy</button>
                                    <button type="submit" className="btn-save" disabled={isSubmitting}>
                                        {isSubmitting ? 'Đang lưu...' : 'Lưu lại'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
            {/* Notification/Confirm Modal */}
            {modal.open && (
                <Modal
                    open={modal.open}
                    title={modal.title}
                    message={modal.message}
                    onClose={() => {
                        setModal(m => ({ ...m, open: false }));
                        if (modal.onlyClose && typeof modal.onConfirm === 'function') {
                            modal.onConfirm();
                        }
                    }}
                    onConfirm={modal.onConfirm}
                    confirmText="Xác nhận"
                    cancelText="Hủy"
                    onlyClose={modal.onlyClose}
                    isSubmitting={isSubmitting}
                />
            )}
        </>
    );
};

export default ServiceManagement;