// src/sections/Header/Header.js
import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; // <-- IMPORT hook xác thực
import useCart from '../../hooks/useCart';       // <-- IMPORT hook giỏ hàng
import './Header.css';

const Header = () => {
  // Lấy thông tin từ cả hai context
  const { user, logout } = useAuth();
  const { openCart, cartItemCount } = useCart();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef(null);
  const greetingRef = useRef(null);

  const handleLogout = () => {
    logout(); // Gọi hàm logout từ AuthContext
    navigate('/'); // Chuyển người dùng về trang chủ sau khi đăng xuất
  };

  const handleProfile = () => {
    navigate('/profile');
    setDropdownOpen(false);
  };

  const handleOrderHistory = () => {
    navigate('/order-history');
    setDropdownOpen(false);
  };

  const handleDropdownToggle = () => {
    setDropdownOpen((open) => {
      if (!open && greetingRef.current) {
        const rect = greetingRef.current.getBoundingClientRect();
        setDropdownPos({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      }
      return !open;
    });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        greetingRef.current &&
        !greetingRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

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
              <div className="user-greeting-wrapper">
                <span
                  className="user-greeting user-greeting--underline"
                  onClick={handleDropdownToggle}
                  tabIndex={0}
                  style={{ cursor: 'pointer' }}
                  ref={greetingRef}
                >
                  Chào, {user.firstName || user.email}!
                </span>
                {dropdownOpen && ReactDOM.createPortal(
                  <div
                    className="user-dropdown-menu user-dropdown-menu-portal"
                    ref={dropdownRef}
                    style={{
                      position: 'absolute',
                      top: dropdownPos.top,
                      left: dropdownPos.left,
                      minWidth: dropdownPos.width,
                      zIndex: 2000
                    }}
                  >
                    <button onClick={handleProfile} className="dropdown-item">Hồ sơ</button>
                    <button onClick={handleOrderHistory} className="dropdown-item">Lịch sử đặt hàng</button>
                    <button onClick={handleLogout} className="dropdown-item">Đăng xuất</button>
                  </div>,
                  document.body
                )}
              </div>

              {/* Hiển thị nút Dashboard nếu là Manager hoặc Staff */}
              {showDashboardButton && (
                <Link to="/dashboard" className="btn btn-secondary">
                  Quản lý
                </Link>
              )}
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