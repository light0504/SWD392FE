import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './LoginPage.css'; // Sẽ tạo file CSS sau

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Hiển thị thông báo nếu được chuyển hướng từ trang đăng ký
  const successMessage = location.state?.message;

  // Lấy đường dẫn mà người dùng muốn truy cập trước khi bị chuyển đến login
  const from = location.state?.from?.pathname || '/dashboard';

  const handleLoginAsRole = (role) => {
    // Trong thực tế, đây là nơi bạn sẽ gọi API đăng nhập với email/password
    // và nhận về thông tin user bao gồm role.
    login(role); // Giả lập login với role được chọn
    navigate(from, { replace: true });
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Chào mừng trở lại!</h2>
        <p>Đăng nhập để tiếp tục với PetParadise</p>
        
        {successMessage && <div className="success-message">{successMessage}</div>}
        
        {/* FORM ĐĂNG NHẬP THỰC TẾ SẼ Ở ĐÂY */}
        {/*
        <form>
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Mật khẩu" />
            <button type="submit">Đăng Nhập</button>
        </form>
        */}

        <div className="mock-login">
            <h4>Giả Lập Đăng Nhập</h4>
            <p>Chọn một vai trò để tiếp tục:</p>
            <button onClick={() => handleLoginAsRole('Customer')} className="btn-mock btn-customer">Đăng nhập (Khách hàng)</button>
            <button onClick={() => handleLoginAsRole('Staff')} className="btn-mock btn-staff">Đăng nhập (Nhân viên)</button>
            <button onClick={() => handleLoginAsRole('Manager')} className="btn-mock btn-manager">Đăng nhập (Quản lý)</button>
        </div>

        <p className="register-link">
          Chưa có tài khoản? <Link to="/register">Tạo tài khoản ngay</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;