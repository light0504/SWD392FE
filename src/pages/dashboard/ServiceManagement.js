import React from 'react';
import { useState, useEffect } from 'react';
import { getAllServices, createService, deleteService } from '../../api/serviceapi';
import './ServiceManagement.css'; 

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
    const [newService, setNewService] = useState({
        name: '',
        price: '',
        description: '',
        duration: '',
    });

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
            alert('Vui lòng điền đầy đủ các trường bắt buộc.');
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
                alert('Tạo dịch vụ mới thành công!');
                closeModal();
                fetchServices(); // <-- Tải lại danh sách để cập nhật
            } else {
                alert(response.data.message || 'Tạo dịch vụ thất bại.');
            }
        } catch (err) {
            console.error("Lỗi khi tạo dịch vụ:", err);
            alert('Đã có lỗi xảy ra phía máy chủ.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Hàm xử lý xóa dịch vụ
    const handleDeleteService = async (serviceId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này không?')) {
            return;
        }

        try {
            // API DELETE thường không trả về body, chỉ cần check status 2xx
            await deleteService(serviceId);
            alert('Xóa dịch vụ thành công!');
            // Cập nhật UI bằng cách lọc ra dịch vụ đã xóa
            setServices(services.filter(s => s.id !== serviceId));
        } catch (err) {
            console.error("Lỗi khi xóa dịch vụ:", err);
            alert('Xóa dịch vụ thất bại. Vui lòng thử lại.');
        }
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
                            {services.length > 0 ? (
                                services.map((service) => (
                                    <tr key={service.id}>
                                        <td data-label="Tên dịch vụ" className="service-name">{service.name}</td>
                                        <td data-label="Mô tả">{service.description}</td>
                                        <td data-label="Thời gian">{service.duration}</td>
                                        <td data-label="Giá tiền" className="price">{formatCurrency(service.price)}</td>
                                        <td data-label="Hành động">
                                            <button className="action-btn btn-edit">Sửa</button>
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
                    <div className="service-management-modal-content">
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
    );
};

export default ServiceManagement;