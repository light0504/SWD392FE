// src/components/ServiceCard/ServiceCard.js
import React from 'react';
import { useNavigate } from 'react-router-dom'; // Thêm dòng này
import useCart from '../../hooks/useCart';
import './ServiceCard.css';

const ServiceCard = ({ service }) => {
  const { id, name, description, price, duration } = service; // Đảm bảo có id
  const { addToCart, closeCart } = useCart();
  const navigate = useNavigate(); // Thêm dòng này

  const handleDetailClick = () => {
    navigate(`/services/${id}`); // Chuyển hướng sang trang chi tiết
  };

  return (
    <div className="service-card">
      {/* <div className="service-icon">{icon}</div> */}
      <h3 className="service-title">{name}</h3>
      <p className="service-description">{description}</p>
      <p className="service-duration">
        Thời gian: {duration} phút
      </p>
      {price && (
        <p className="service-price">
          {price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
        </p>
      )}
      <div className="service-footer">
        <button
          className="btn-add-to-cart"
          onClick={() => {
            addToCart(service);
            closeCart();
          }}
        >
          Thêm vào giỏ
        </button>
        <button
          className="btn-detail"
          style={{ marginLeft: '8px' }}
          onClick={handleDetailClick}
        >
          Xem chi tiết
        </button>
      </div>
    </div>
  );
};

export default ServiceCard;