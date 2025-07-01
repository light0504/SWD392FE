import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../api/authAPI'; 
import './LoginPage.css'; // Sử dụng file CSS mới

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // State cho form đăng nhập thật
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lấy thông báo và đường dẫn từ trang trước
  const successMessage = location.state?.message;
  const from = location.state?.from?.pathname || null;

  const getRedirectPath = (roles) => {
    if (roles.includes('Manager') || roles.includes('Staff') || roles.includes('MANAGER') || roles.includes('STAFF')) {
      return '/dashboard';
    }
    return '/'; // Mặc định cho USER
  };
  
  // Xử lý đăng nhập thật qua API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const responseData = await loginUser({ email, password });
      if (responseData.isSuccess) {
        login(responseData.data);
        const redirectPath = from || getRedirectPath(responseData.data.roles);
        navigate(redirectPath, { replace: true });
      } else {
        setError(responseData.message || 'Thông tin đăng nhập không chính xác.');
      }
    } catch (err) {
      setError(err.message || 'Không thể kết nối đến máy chủ.');
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý đăng nhập giả lập (đã được mang trở lại)
  const handleLoginAsRole = (role) => {
    // Tạo một đối tượng user giả lập để context có thể hoạt động
    const mockUser = {
      firstName: role,
      lastName: "User",
      email: `${role.toLowerCase()}@petparadise.com`,
      roles: [role.toUpperCase()]
    };
  
    login(mockUser);
    const redirectPath = getRedirectPath([role.toUpperCase()]);
    console.log(`Đăng nhập giả lập với vai trò: ${role}`);
    navigate(from || redirectPath, { replace: true });
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Chào mừng trở lại!</h2>
        <p>Đăng nhập để tiếp tục với PetParadise</p>
        
        {successMessage && <div className="success-message">{successMessage}</div>}
        
        <form className='login-form' onSubmit={handleSubmit}>
            <input 
                type="email" 
                placeholder="Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
            />
            <input 
                type="password" 
                placeholder="Mật khẩu" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            
            {error && <div className="error-message">{error}</div>}

            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
        </form>

        <div className="mock-login">
            <h4>Hoặc Đăng Nhập Nhanh</h4>
            <p>Chọn một vai trò để thử nghiệm:</p>
            <button onClick={() => handleLoginAsRole('Customer')} className="btn-mock btn-customer">Khách hàng (USER)</button>
            <button onClick={() => handleLoginAsRole('Staff')} className="btn-mock btn-staff">Nhân viên (Staff)</button>
            <button onClick={() => handleLoginAsRole('MANAGER')} className="btn-mock btn-manager">Quản lý (Manager)</button>
        </div>

        <p className="register-link">
          Chưa có tài khoản? <Link to="/register">Tạo tài khoản ngay</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;