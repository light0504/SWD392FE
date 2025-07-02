import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
// import { loginUser } from '../../api/authAPI';
import './LoginPage.css';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const redirectFrom = location.state?.from?.pathname || null;
  const successMessage = location.state?.message;

  const getRedirectPath = (roles) => {
    if (roles.some(role => ['Manager', 'Staff', 'MANAGER', 'STAFF'].includes(role))) {
      console.log(roles);
      return '/dashboard';
    }
    console.log(roles);
    return '/';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // console.log('Logging in with:', { email, password });

      const response = await login(email, password);
      // console.log(response);
      if (response.success) {
        console.log('user: ', sessionStorage.getItem('user'));
        const roles = response.data.roles;
        login(response.data); // save to auth context

        const redirectTo = redirectFrom || getRedirectPath(roles);
        navigate(redirectTo, { replace: true });
      } else {
        setError(response?.message || 'Thông tin đăng nhập không chính xác.');
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError('Không thể kết nối đến máy chủ.');
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
