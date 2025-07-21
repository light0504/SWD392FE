import React, { useState, useEffect } from 'react'; // <-- 1. Import useEffect
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './LoginPage.css';

const LoginPage = () => {
  const { user, login } = useAuth(); // <-- 2. Lấy `user` từ context
  const navigate = useNavigate();
  const location = useLocation();

  // State cho form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lấy state từ trang trước
  const fromPath = location.state?.from?.pathname || null;
  const cartItemsFromPrevPage = location.state?.cartItemsFromSidebar || null;
  const successMessage = location.state?.message;

  // --- 3. THÊM LOGIC KIỂM TRA VÀ CHUYỂN HƯỚNG ---
  useEffect(() => {
    // Nếu có thông tin người dùng (tức là đã đăng nhập)
    if (user) {
      // Chuyển hướng về trang chủ hoặc trang dashboard nếu họ là nhân viên
      const redirectPath = getRedirectPathBasedOnRole(user.roles);
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate]); // Effect này sẽ chạy khi `user` hoặc `navigate` thay đổi


  const getRedirectPathBasedOnRole = (roles) => {
    if (roles && roles.some(role => ['MANAGER', 'STAFF'].includes(role))) {
      return '/dashboard';
    }
    return '/'; // Mặc định cho USER hoặc khi không có roles
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await login(email, password);
      
      // Chú ý: Cần kiểm tra 'isSuccess' thay vì 'success' để khớp với các file trước
      if (response && response.isSuccess) { 
        const redirectTo = fromPath || getRedirectPathBasedOnRole(response.data.roles);

        navigate(redirectTo, { 
          replace: true,
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

  // --- 4. TRÁNH RENDER FORM NẾU ĐÃ ĐĂNG NHẬP VÀ ĐANG CHUẨN BỊ CHUYỂN HƯỚNG ---
  // Điều này ngăn form nhấp nháy trên màn hình trước khi chuyển hướng
  if (user) {
    return null; // hoặc một spinner loading: <div className="page-loading">Đang chuyển hướng...</div>
  }

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