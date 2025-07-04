import React, { useState, useEffect } from 'react';
import ServiceCard from '../../components/ServiceCard/ServiceCard';
import './Services.css';
import { getAllServices } from '../../api/serviceapi'; // Import the getAllServices function

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllServices = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllServices(); // Lấy danh sách dịch vụ từ API
        setServices(data.data); // Cập nhật state với dữ liệu dịch vụ
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllServices();
  }, []);

  const renderContent = () => {
    if (loading) {
      return <p className="status-text">Đang tải dịch vụ, vui lòng chờ...</p>;
    }
    if (error) {
      return <p className="status-text error-text">Lỗi: {error}</p>;
    }
    if (services.length === 0) {
        return <p className="status-text">Hiện chưa có dịch vụ nào.</p>;
    }
    
    return (
      <div className="services-grid">
        {services.map(service => (
          <ServiceCard
            key={service.id}
            service={service} // Truyền toàn bộ đối tượng dịch vụ vào component ServiceCard
          />

        ))}
      </div>
    );
  };

  return (
    <section id="services" className="services-section">
      <div className="container">
        <h2>Dịch Vụ Nổi Bật</h2>
        <p className="section-subtitle">
            Mang đến những trải nghiệm tuyệt vời nhất cho những người bạn bốn chân.
        </p>
        {renderContent()}
      </div>
    </section>
  );
};

export default Services;