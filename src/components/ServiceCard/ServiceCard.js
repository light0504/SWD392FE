// src/components/ServiceCard/ServiceCard.js
import React from 'react';
import useCart from '../../hooks/useCart'; // <-- IMPORT MỚI
import './ServiceCard.css';

const ServiceCard = ({ service }) => {
  const { name, description, price, duration } = service;
  const { addToCart, closeCart} = useCart();

  return (
    <div className="service-card">
      {/* <div className="service-icon">{icon}</div> */}
      <h3 className="service-title">{name}</h3>
      <p className="service-description">{description}</p>
      <p className="service-duration">
        Thời gian: {duration} phút
      </p>
      <div className="service-footer"> {/* Bọc giá và nút vào footer */}
        {price && (
          <p className="service-price">
            {price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
          </p>
        )}
        {/* NÚT THÊM MỚI */}
        <button 
            className="btn-add-to-cart"
            onClick={() => {
              addToCart(service);
              closeCart(); // Đóng giỏ hàng sau khi thêm
            }} 
        >
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
};

export default ServiceCard;