// src/sections/Header/Header.js
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import useCart from '../../hooks/useCart'; // <-- IMPORT hook giỏ hàng
import './Header.css';

const Header = () => {
  // Lấy hàm openCart và số lượng sản phẩm từ context
  const { openCart, cartItemCount } = useCart();

  return (
    <header className="header">
      <div className="container header-container">
        {/* Logo của bạn */}
        <Link to="/" className="logo">PetParadise</Link>

        {/* Navigation của bạn */}
        <nav className="main-nav">
          <ul>
            <li><NavLink to="/">Trang Chủ</NavLink></li>
            {/* Lưu ý: path là "/services" chứ không phải "/dich-vu" theo cấu trúc cũ */}
            {/* Nếu bạn đã đổi route, hãy cập nhật lại AppRouter.js */}
            <li><NavLink to="/services">Dịch Vụ</NavLink></li>
          </ul>
        </nav>

        {/* Các hành động ở header */}
        <div className="header-actions">
          <Link to="/login" className="btn btn-primary">Đăng Nhập</Link>

          {/* Widget giỏ hàng đã được thêm vào đây */}
          <button onClick={openCart} className="cart-widget">
              <span className="cart-icon">🛒</span>
              {/* Chỉ hiển thị badge khi có đồ trong giỏ */}
              {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;