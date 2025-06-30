// src/components/ServiceCard/ServiceCard.js
import React from 'react';
import useCart from '../../hooks/useCart'; // <-- IMPORT MỚI
import './ServiceCard.css';

// Component nhận toàn bộ object 'service' để có đủ thông tin (id, title, price...)
// Component nhận props và hiển thị thông tin của một dịch vụ
const ServiceCard = ({ service }) => {
  const { icon, title, description, price } = service; // Destructure object
  const { addToCart } = useCart(); // <-- LẤY HÀM addToCart từ context

  return (
    <div className="service-card">
      <div className="service-icon">{icon}</div>
      <h3 className="service-title">{title}</h3>
      <p className="service-description">{description}</p>
      <div className="service-footer"> {/* Bọc giá và nút vào footer */}
        {price && (
          <p className="service-price">
            {price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
          </p>
        )}
        {/* NÚT THÊM MỚI */}
        <button 
            className="btn-add-to-cart"
            onClick={() => addToCart(service)} // <-- GỌI HÀM KHI CLICK
        >
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
};

export default ServiceCard;