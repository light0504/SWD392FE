import React, { useState, useEffect } from "react";
import { getAllStaff, createStaff, updateStaff, deleteStaff, getStaffByFilter } from "../../api/staffapi";
import { Helmet } from 'react-helmet-async';
import NotificationModal from "../../components/NotificationModal/NotificationModal";
import "./StaffManagement.css";

const formatCurrency = (value) => {
    const numberValue = Number(value);
    if (isNaN(numberValue)) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(numberValue);
};

const StaffManagement = () => {
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ message: null, type: 'error' });
    const [showForm, setShowForm] = useState(false);
    const [formType, setFormType] = useState('add');
    const [formData, setFormData] = useState({
        email: '', password: '', firstName: '', lastName: '',
        gender: '', salary: '', hireDate: '', imgURL: '', note: ''
    });
    const [editId, setEditId] = useState(null);
    const [showFilter, setShowFilter] = useState(false);
    const [filterData, setFilterData] = useState({
        name: '', minSalary: '', maxSalary: '', hireDateFrom: '', hireDateTo: ''
    });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const fetchStaff = async () => {
        setLoading(true);
        setNotification({ message: null });
        try {
            const data = await getAllStaff();
            setStaffList(data.data || data);
        } catch (err) {
            setNotification({ message: 'Không thể tải danh sách nhân viên.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    useEffect(() => {
        if (showForm || showFilter || showDeleteModal || notification.message) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [showForm, showFilter, showDeleteModal, notification.message]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddClick = () => {
        setFormType('add');
        setFormData({
            email: '', password: '', firstName: '', lastName: '', gender: '',
            salary: '', hireDate: '', imgURL: '', note: ''
        });
        setShowForm(true);
        setEditId(null);
    };

    const handleEditClick = (staff) => {
        setFormType('edit');
        setFormData({
            email: staff.email || '', password: '', firstName: staff.firstName || '',
            lastName: staff.lastName || '', gender: staff.gender || '',
            salary: staff.salary || '', hireDate: staff.hireDate ? staff.hireDate.slice(0, 10) : '',
            imgURL: staff.imgURL || '', note: staff.note || ''
        });
        setEditId(staff.id);
        setShowForm(true);
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        setLoading(true);
        setShowDeleteModal(false);
        try {
            await deleteStaff(deleteId);
            setNotification({ message: 'Xóa nhân viên thành công!', type: 'success' });
            fetchStaff();
        } catch (err) {
            setNotification({ message: 'Xóa nhân viên thất bại.', type: 'error' });
        } finally {
            setLoading(false);
            setDeleteId(null);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setDeleteId(null);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (formType === 'add') {
                await createStaff({ ...formData, salary: Number(formData.salary) });
                setNotification({ message: 'Thêm nhân viên thành công!', type: 'success' });
            } else if (formType === 'edit' && editId) {
                const { email, password, ...updateData } = formData;
                await updateStaff(editId, { ...updateData, salary: Number(updateData.salary) });
                setNotification({ message: 'Cập nhật thông tin thành công!', type: 'success' });
            }
            setShowForm(false);
            fetchStaff();
        } catch (err) {
            setNotification({ message: 'Lưu thông tin thất bại. Vui lòng kiểm tra lại dữ liệu.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleFilterInputChange = (e) => {
        const { name, value } = e.target;
        setFilterData(prev => ({ ...prev, [name]: value }));
    };

    const handleFilterClick = () => { setShowFilter(true); };

    const handleFilterSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let filter = {
                name: filterData.name,
                minSalary: filterData.minSalary ? Number(filterData.minSalary) : null,
                maxSalary: filterData.maxSalary ? Number(filterData.maxSalary) : null,
                hireDateFrom: filterData.hireDateFrom ? new Date(filterData.hireDateFrom).toISOString() : null,
                hireDateTo: filterData.hireDateTo ? new Date(filterData.hireDateTo).toISOString() : null
            };
            filter = Object.fromEntries(Object.entries(filter).filter(([_, v]) => v != null && v !== ''));
            const data = await getStaffByFilter(filter);
            setStaffList(data.data || data);
            setShowFilter(false);
        } catch (err) {
            setNotification({ message: 'Không tìm thấy nhân viên nào phù hợp với bộ lọc.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('vi-VN');
    };

    return (
        <div>
            <Helmet>
                <title>Quản lí nhân viên</title>
            </Helmet>

            <NotificationModal 
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification({ message: null })}
            />

            <h1 className="page-title">Quản lý nhân viên</h1>
            <p className="page-subtitle">Thêm, sửa, xóa và quản lý các nhân viên của cửa hàng.</p>
            
            <div className="content-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <button className="btn-filter" onClick={handleFilterClick}>Lọc</button>
                    <button className="btn-add" onClick={handleAddClick}>Thêm nhân viên</button>
                </div>
                
                {loading && <div>Đang tải...</div>}

                <table className="staff-table">
                    <thead>
                        <tr>
                            <th>Họ tên</th>
                            <th>Email</th>
                            <th>Lương</th>
                            <th>Ngày vào làm</th>
                            <th>Ghi chú</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {staffList && staffList.length > 0 ? staffList.map(staff => (
                            <tr key={staff.id}>
                                <td data-label="Họ tên">{staff.fullName}</td>
                                <td data-label="Email">{staff.email}</td>
                                <td data-label="Lương">{formatCurrency(staff.salary)}</td>
                                <td data-label="Ngày vào làm">{formatDate(staff.hireDate)}</td>
                                <td data-label="Ghi chú">{staff.note || ''}</td>
                                <td data-label="Hành động">
                                    <button className="btn-edit" onClick={() => handleEditClick(staff)}>Sửa</button>
                                    <button className="btn-delete" onClick={() => handleDeleteClick(staff.id)}>Xóa</button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="6" style={{ textAlign: 'center' }}>Không có nhân viên nào.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showForm && (
                <div className="modal-overlay">
                    <form className="staff-form two-col-form" onSubmit={handleFormSubmit}>
                        <h3>{formType === 'add' ? 'Thêm nhân viên' : 'Sửa nhân viên'}</h3>
                        <div className="form-cols">
                            <div className="form-col">
                                <label>Email<input name="email" value={formData.email} onChange={handleInputChange} required type="email" disabled={formType === 'edit'} /></label>
                                {formType === 'add' && (<label>Mật khẩu<input name="password" value={formData.password} onChange={handleInputChange} required type="password" /></label>)}
                                <label>Họ<input name="lastName" value={formData.lastName} onChange={handleInputChange} required /></label>
                                <label>Tên<input name="firstName" value={formData.firstName} onChange={handleInputChange} required /></label>
                                <label>Giới tính
                                    <select name="gender" value={formData.gender} onChange={handleInputChange} required>
                                        <option value="">Chọn giới tính</option><option value="Nam">Nam</option><option value="Nữ">Nữ</option><option value="Khác">Khác</option>
                                    </select>
                                </label>
                            </div>
                            <div className="form-col">
                                <label>Lương<input name="salary" value={formData.salary} onChange={handleInputChange} required type="number" min="0" /></label>
                                <label>Ngày vào làm<input name="hireDate" value={formData.hireDate} onChange={handleInputChange} required type="date" /></label>
                                <label>Ảnh đại diện (URL)<input name="imgURL" value={formData.imgURL} onChange={handleInputChange} type="text" /></label>
                                <label>Ghi chú<input name="note" value={formData.note} onChange={handleInputChange} /></label>
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn-save" disabled={loading}>Lưu</button>
                            <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Hủy</button>
                        </div>
                    </form>
                </div>
            )}

            {showFilter && (
                <div className="modal-overlay">
                    <form className="staff-form" onSubmit={handleFilterSubmit}>
                        <h3>Lọc nhân viên</h3>
                        <label>Họ tên<input name="name" value={filterData.name} onChange={handleFilterInputChange} /></label>
                        <label>Lương tối thiểu<input name="minSalary" value={filterData.minSalary} onChange={handleFilterInputChange} type="number" min="0" /></label>
                        <label>Lương tối đa<input name="maxSalary" value={filterData.maxSalary} onChange={handleFilterInputChange} type="number" min="0" /></label>
                        <label>Ngày vào làm từ<input name="hireDateFrom" value={filterData.hireDateFrom} onChange={handleFilterInputChange} type="date" /></label>
                        <label>Ngày vào làm đến<input name="hireDateTo" value={filterData.hireDateTo} onChange={handleFilterInputChange} type="date" /></label>
                        <div className="form-actions">
                            <button type="submit" className="btn-save" disabled={loading}>Lọc</button>
                            <button type="button" className="btn-cancel" onClick={() => setShowFilter(false)}>Hủy</button>
                        </div>
                    </form>
                </div>
            )}
            
            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal-confirm">
                        <p>Bạn có chắc muốn xóa nhân viên này?</p>
                        <div className="form-actions">
                            <button className="btn-save" onClick={handleConfirmDelete} disabled={loading}>Xóa</button>
                            <button className="btn-cancel" onClick={handleCancelDelete} disabled={loading}>Hủy</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffManagement;