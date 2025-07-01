// src/sections/Header/Header.js
import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // <-- IMPORT hook xác thực
import useCart from '../../hooks/useCart';       // <-- IMPORT hook giỏ hàng
import './Header.css';

const Header = () => {
  // Lấy thông tin từ cả hai context
  const { user, logout } = useAuth();
  const { openCart, cartItemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Gọi hàm logout từ AuthContext
    navigate('/'); // Chuyển người dùng về trang chủ sau khi đăng xuất
  };

  // Hàm kiểm tra vai trò để hiển thị nút Dashboard
  const showDashboardButton = user && (user.roles.includes('Manager') || user.roles.includes('Staff') || user.roles.includes('MANAGER') || user.roles.includes('STAFF'));

  return (
    <header className="header">
      <div className="container header-container">
        {/* Logo */}
        <Link to="/" className="logo">PetParadise</Link>

        {/* Navigation */}
        <nav className="main-nav">
          <ul>
            <li><NavLink to="/">Trang Chủ</NavLink></li>
            <li><NavLink to="/services">Dịch Vụ</NavLink></li>
          </ul>
        </nav>

        {/* Các hành động ở header */}
        <div className="header-actions">
          {user ? (
            // ============================================
            // GIAO DIỆN KHI NGƯỜI DÙNG ĐÃ ĐĂNG NHẬP
            // ============================================
            <>
              <div className="user-greeting">
                Chào, {user.firstName || user.email}! {/* Ưu tiên firstName */}
              </div>

              {/* Hiển thị nút Dashboard nếu là Manager hoặc Staff */}
              {showDashboardButton && (
                <Link to="/dashboard" className="btn btn-secondary">
                  Quản lý
                </Link>
              )}
              
              <button onClick={handleLogout} className="btn btn-outline">
                Đăng xuất
              </button>
            </>
          ) : (
            // ============================================
            // GIAO DIỆN KHI NGƯỜI DÙNG CHƯA ĐĂNG NHẬP
            // ============================================
            <>
              <Link to="/login" className="btn btn-primary">Đăng Nhập</Link>
              <Link to="/register" className="btn btn-secondary">Đăng Ký</Link>
            </>
          )}

          {/* Widget giỏ hàng luôn hiển thị */}
          <button onClick={openCart} className="cart-widget">
              <span className="cart-icon">🛒</span>
              {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;