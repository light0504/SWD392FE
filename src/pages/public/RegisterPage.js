import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../api/authAPI';
import './RegisterPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();

  // State cho dữ liệu form
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    gender: '1', // default male
    phoneNumber: ''
  });

  // State riêng cho các lỗi validation
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  // Lỗi từ phía API (sau khi đã submit)
  const [apiError, setApiError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prevErrors => ({ ...prevErrors, [name]: null }));
    }
  };

  // Hàm validate toàn bộ form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = 'Tên không được để trống.';
    if (!formData.lastName) newErrors.lastName = 'Họ không được để trống.';
    if (!formData.email) {
      newErrors.email = 'Email không được để trống.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ.';
    }
    if (!formData.password) {
      newErrors.password = 'Mật khẩu không được để trống.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự.';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
    }
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Số điện thoại không được để trống.';
    } else if (!/^\d{9,15}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Số điện thoại không hợp lệ.';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    // Bước 1: Validate form trước khi gửi
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return; // Dừng lại nếu có lỗi
    }

    // Bước 2: Bắt đầu quá trình gửi
    setLoading(true);
    setErrors({});

    try {
      // Chuẩn bị dữ liệu đúng định dạng API yêu cầu
      const dataToSend = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: parseInt(formData.gender, 10),
        address: formData.address,
        imgURL: '',
        phoneNumber: formData.phoneNumber
      };

      // Gọi API thực tế
      const apiResult = await registerUser(dataToSend);
      if (apiResult.isSuccess) {
        navigate('/login', { state: { message: apiResult.message || 'Đăng ký tài khoản thành công!' } });
      } else {
        // Nếu API trả về lỗi (ví dụ: email đã tồn tại)
        setApiError(apiResult.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      setApiError(err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page-container">
      <form className="form-box" onSubmit={handleSubmit} noValidate>
        <h2>Tạo tài khoản PetParadise</h2>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="lastName">Họ</label>
            <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
            {errors.lastName && <span className="error-text">{errors.lastName}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="firstName">Tên</label>
            <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
            {errors.firstName && <span className="error-text">{errors.firstName}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Mật khẩu</label>
          <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
          {errors.password && <span className="error-text">{errors.password}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
          <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
          {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="address">Địa chỉ (Không bắt buộc)</label>
          <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label htmlFor="gender">Giới tính</label>
          <select id="gender" name="gender" value={formData.gender} onChange={handleChange} required>
            <option value="1">Nam</option>
            <option value="2">Nữ</option>
            <option value="0">Khác</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="phoneNumber">Số điện thoại</label>
          <input type="text" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
          {errors.phoneNumber && <span className="error-text">{errors.phoneNumber}</span>}
        </div>

        {apiError && <p className="api-error-message">{apiError}</p>}

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Tạo Tài Khoản'}
        </button>

        <p className="form-footer-link">
          Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;