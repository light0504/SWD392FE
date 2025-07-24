import { useParams, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import { getServiceById } from "../../api/serviceapi";
import './DetailPage.css';
import useCart from '../../hooks/useCart';

const DetailPage = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart, closeCart } = useCart();

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        const data = await getServiceById(serviceId);
        setService(data.data);
      } catch (err) {
        setError(err.message || "Failed to fetch service details");
      } finally {
        setLoading(false);
      }
    };

    fetchServiceDetails();
  }, [serviceId]);

  if (loading) return <div className="detail-loading">Loading...</div>;
  if (error) return <div className="detail-error">Error: {error}</div>;

  return (
    <div className="detail-page-container">
      <div className="service-detail-card">
        <h1 className="service-detail-title">{service.name}</h1>
        <p className="service-detail-description">{service.description}</p>
        
        <div className="service-detail-info">
          <div className="service-info-item">
            <div className="service-info-label">Price</div>
            <div className="service-info-value price">{service.price}</div>
          </div>
          <div className="service-info-item">
            <div className="service-info-label">Duration</div>
            <div className="service-info-value duration">{service.duration}</div>
          </div>
        </div>

        <div className="service-detail-actions">
          <button className="btn-book-now" onClick={() => {
            addToCart(service);
            closeCart();
          }}>
            Thêm vào giỏ
          </button>
          <button className="btn-back" onClick={() => navigate(-1)}>
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
}

export default DetailPage;