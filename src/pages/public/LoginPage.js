import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './LoginPage.css';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // State cho form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lấy state từ trang trước để xử lý điều hướng và chuyển tiếp dữ liệu
  const fromPath = location.state?.from?.pathname || null;
  const cartItemsFromPrevPage = location.state?.cartItemsFromSidebar || null;
  const successMessage = location.state?.message;

  const getRedirectPathBasedOnRole = (roles) => {
    if (roles.some(role => ['MANAGER', 'STAFF'].includes(role))) {
      return '/dashboard';
    }
    return '/'; // Mặc định cho USER
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await login(email, password); // Gọi hàm login từ AuthContext

      if (response.isSuccess) {
        // Ưu tiên chuyển hướng về trang người dùng muốn vào trước đó (ví dụ: /order)
        const redirectTo = fromPath || getRedirectPathBasedOnRole(response.data.roles);

        // Khi điều hướng, "mang theo" (chuyển tiếp) dữ liệu giỏ hàng đã nhận được
        navigate(redirectTo, { 
          replace: true, // Thay thế trang login trong lịch sử trình duyệt
          state: {
            cartItemsFromSidebar: cartItemsFromPrevPage
          }
        });
      } else {
        setError(response?.message || 'Thông tin đăng nhập không chính xác.');
      }
    } catch (err) {
      setError('Không thể kết nối đến máy chủ. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Chào mừng trở lại!</h2>
        <p>Đăng nhập để tiếp tục với PetParadise</p>

        {successMessage && <div className="success-message">{successMessage}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="register-link">
          Chưa có tài khoản? <Link to="/register">Tạo tài khoản ngay</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;