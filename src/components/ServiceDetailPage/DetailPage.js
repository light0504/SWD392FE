import { useParams, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import { getServiceById } from "../../api/serviceapi";
import './DetailPage.css';
import useCart from '../../hooks/useCart';
import { getRatingsByServiceId } from "../../api/ratingapi";

const DetailPage = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ratings, setRatings] = useState([]);
  const { addToCart, closeCart } = useCart();

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        const data = await getServiceById(serviceId);
        if (data && data.data) {
          setService(data.data);
        } else {
          setError("Dịch vụ không tồn tại");
        }
      } catch (err) {
        setError(err.message || "Failed to fetch service details");
      } finally {
        setLoading(false);
      }
    };

    const fetchRatings = async () => {
      try {
        const ratingsData = await getRatingsByServiceId(serviceId);
        setRatings(ratingsData.data || []);
      } catch (err) {
        console.error("Failed to fetch ratings:", err);
        setError(err.message || "Failed to fetch ratings");
      }
    };

    fetchServiceDetails();
    fetchRatings();
  }, [serviceId]);

  const renderStars = (score) => (
    <div className="star-rating">
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className={`star ${index < score ? 'filled' : ''}`}>
          ★
        </span>
      ))}
    </div>
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateAverageRating = () => {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating.score, 0);
    return (sum / ratings.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="detail-loading">
        <div className="spinner"></div>
        <p>Đang tải...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="detail-error">
        <div className="error-icon">⚠️</div>
        <h2>Có lỗi xảy ra</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className="btn-back-error">Quay lại</button>
      </div>
    );
  }

  // Nếu service không tồn tại sau khi load xong
  if (!service) {
    return (
      <div className="detail-error">
        <div className="error-icon">⚠️</div>
        <h2>Dịch vụ không tồn tại</h2>
        <button onClick={() => navigate(-1)} className="btn-back-error">Quay lại</button>
      </div>
    );
  }

  return (
    <div className="detail-page-container">
      {/* Header */}
      <div className="detail-header">
        <div className="header-content">
          <button onClick={() => navigate(-1)} className="btn-back-header">
            <span className="back-arrow">←</span>
            <span>Quay lại</span>
          </button>
        </div>
      </div>

      <div className="detail-content">
        {/* Service Detail Card */}
        <div className="service-detail-card">
          <div className="service-layout">
            {/* Service Image Placeholder */}
            <div className="service-image">
              <div className="image-placeholder">
                <span className="service-icon">🛍️</span>
              </div>
            </div>

            {/* Service Info */}
            <div className="service-info">
              <h1 className="service-title">{service.name || "Tên dịch vụ không khả dụng"}</h1>
              <p className="service-description">{service.description || "Mô tả không khả dụng"}</p>

              {/* Rating Summary */}
              {ratings.length > 0 && (
                <div className="rating-summary">
                  <div className="rating-display">
                    {renderStars(Math.round(calculateAverageRating()))}
                    <span className="rating-score">{calculateAverageRating()}</span>
                  </div>
                  <span className="rating-count">({ratings.length} đánh giá)</span>
                </div>
              )}

              {/* Service Details */}
              <div className="service-details">
                <div className="detail-item price-item">
                  <div className="detail-icon">💰</div>
                  <div className="detail-content">
                    <p className="detail-label">Giá dịch vụ</p>
                    <p className="detail-value price-value">{service.price || "N/A"}</p>
                  </div>
                </div>

                <div className="detail-item duration-item">
                  <div className="detail-icon">⏰</div>
                  <div className="detail-content">
                    <p className="detail-label">Thời gian</p>
                    <p className="detail-value duration-value">{service.duration || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  addToCart(service);
                  closeCart();
                }}
                className="btn-add-to-cart"
              >
                <span className="cart-icon">🛒</span>
                Thêm vào giỏ hàng
              </button>
            </div>
          </div>
        </div>

        {/* Ratings Section */}
        <div className="ratings-section">
          <div className="ratings-header">
            <div className="ratings-icon">⭐</div>
            <h2 className="ratings-title">Đánh giá từ khách hàng</h2>
          </div>

          {ratings.length > 0 ? (
            <div className="ratings-list">
              {ratings.map((rating, index) => (
                <div key={index} className="rating-item">
                  <div className="rating-header">
                    <div className="customer-info">
                      <div className="customer-avatar">
                        <span className="avatar-icon">👤</span>
                      </div>
                      <div className="customer-details">
                        <h3 className="customer-name">{rating.customerName || "Ẩn danh"}</h3>
                        {renderStars(rating.score)}
                      </div>
                    </div>
                    <div className="rating-date">
                      <span className="date-icon">📅</span>
                      {formatDate(rating.createDate)}
                    </div>
                  </div>
                  <p className="rating-comment">{rating.comment || "Không có nhận xét"}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-ratings">
              <div className="no-ratings-icon">⭐</div>
              <h3 className="no-ratings-title">Chưa có đánh giá nào</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailPage;
