// src/sections/Footer/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="main-footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section about">
            <h3 className="footer-logo">PetParadise</h3>
            <p>
              Nơi cung cấp các dịch vụ chăm sóc thú cưng chuyên nghiệp và tận tâm nhất. 
              Mang lại trải nghiệm tuyệt vời cho những người bạn bốn chân của bạn.
            </p>
          </div>

          <div className="footer-section links">
            <h4>Khám Phá</h4>
            <ul>
              <li><Link to="/">Trang Chủ</Link></li>
              <li><Link to="/services">Dịch Vụ</Link></li>
              <li><Link to="/login">Đăng Nhập</Link></li>
            </ul>
          </div>

          <div className="footer-section contact">
            <h4>Liên Hệ</h4>
            <p>Email: contact@petparadise.com</p>
            <p>Hotline: 1900 1234</p>
            <p>Địa chỉ: 123 Đường Pet, Quận 1, TP.HCM</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {currentYear} PetParadise. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;