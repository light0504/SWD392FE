// src/sections/Services/Services.js (ĐÃ SỬA LỖI)
import React, { useState, useEffect } from 'react';
import ServiceCard from '../../components/ServiceCard/ServiceCard';
import './Services.css';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError(null);
      try {
        // Mock data với key 'title' để đồng bộ với ServiceCard
        const mockApiResult = {
          isSuccess: true,
          data: [
            { id: 'uuid-1', title: 'Tắm & Sấy Thơm Tho', description: 'Sử dụng sữa tắm thảo dược, massage thư giãn, an toàn cho da.', price: 250000, icon: '🛁' },
            { id: 'uuid-2', title: 'Cắt Tỉa Lông & Tạo Kiểu', description: 'Tạo kiểu chuyên nghiệp, gọn gàng và đáng yêu theo yêu cầu.', price: 400000, icon: '✂️' },
            { id: 'uuid-3', title: 'Combo Chăm Sóc Toàn Diện', description: 'Trọn gói tắm, cắt tỉa, vệ sinh tai, cắt móng. Tiết kiệm hơn!', price: 600000, icon: '💖' },
          ],
          message: "Lấy danh sách dịch vụ thành công",
        };
        
        await new Promise(resolve => setTimeout(resolve, 1000)); 

        if (mockApiResult.isSuccess) {
          setServices(mockApiResult.data);
        } else {
          throw new Error(mockApiResult.message || 'Lỗi không xác định.');
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
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
        {/* --- ĐÂY LÀ PHẦN SỬA LỖI CHÍNH --- */}
        {services.map(service => (
          // Thay vì truyền từng props, chúng ta truyền cả object `service`
          <ServiceCard
            key={service.id}
            service={service} // <- SỬA Ở ĐÂY
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