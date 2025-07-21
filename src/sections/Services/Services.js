import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import ServiceCard from '../../components/ServiceCard/ServiceCard';
import './Services.css';
import { getAllServices } from '../../api/serviceapi';

// Số lượng dịch vụ hiển thị trên mỗi trang
const SERVICES_PER_PAGE = 6;

const Services = ({ isFeatured = false }) => {
  // State
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch dữ liệu từ API
  useEffect(() => {
    const fetchAllServices = async () => {
      setLoading(true);
      setError(null);
      try {
        const responseData = await getAllServices();
        if (responseData.isSuccess) {
          setServices(responseData.data);
        } else {
          setError(responseData.message || "Không thể tải dịch vụ.");
        }
      } catch (err) {
        setError(err.message || "Lỗi kết nối máy chủ.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllServices();
  }, []);

  // Tối ưu hóa việc lọc dịch vụ bằng useMemo
  const filteredServices = useMemo(() => {
    if (!searchTerm) {
      return services;
    }
    return services.filter(service =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [services, searchTerm]);

  // Reset về trang 1 mỗi khi người dùng thay đổi từ khóa tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);


  // Hàm render nội dung chính (lưới dịch vụ)
  const renderServicesGrid = () => {
    if (loading) return <p className="status-text">Đang tải dịch vụ...</p>;
    if (error) return <p className="status-text error-text">Lỗi: {error}</p>;
    
    let servicesToDisplay;

    if (isFeatured) {
      servicesToDisplay = services.slice(0, 3);
    } else {
      const indexOfLastService = currentPage * SERVICES_PER_PAGE;
      const indexOfFirstService = indexOfLastService - SERVICES_PER_PAGE;
      servicesToDisplay = filteredServices.slice(indexOfFirstService, indexOfLastService);
    }

    if (servicesToDisplay.length === 0) {
        return <p className="status-text">Không tìm thấy dịch vụ nào phù hợp.</p>;
    }
    
    return (
      <div className="services-grid">
        {servicesToDisplay.map(service => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    );
  };

  // Hàm render các nút phân trang
  const renderPagination = () => {
    if (isFeatured || filteredServices.length <= SERVICES_PER_PAGE) {
      return null;
    }

    const totalPages = Math.ceil(filteredServices.length / SERVICES_PER_PAGE);
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
      <div className="pagination">
        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => setCurrentPage(number)}
            className={`page-item ${currentPage === number ? 'active' : ''}`}
          >
            {number}
          </button>
        ))}
      </div>
    );
  };

  return (
    <section id="services" className="services-section">
      <div className="container">
        <div className="section-header">
            {/* === THAY ĐỔI QUAN TRỌNG: Thêm div.section-title-group === */}
            {/* Div này sẽ nhóm tiêu đề và mô tả, đảm bảo chúng luôn đi cùng nhau */}
            <div className="section-title-group">
                <h2>{isFeatured ? 'Dịch Vụ Nổi Bật' : 'Tất Cả Dịch Vụ'}</h2>
                <p className="section-subtitle">
                    Mang đến những trải nghiệm tuyệt vời nhất cho những người bạn bốn chân.
                </p>
            </div>
            
            {/* Nút này bây giờ là một phần tử flex độc lập */}
            
        </div>
        {isFeatured && services.length > 3 && (
                <Link to="/services" className="btn-view-all">
                    Xem Tất Cả →
                </Link>
            )}
        {!isFeatured && (
          <div className="search-container">
            <input
              type="text"
              placeholder="Tìm kiếm dịch vụ theo tên..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
        
        {renderServicesGrid()}
        {renderPagination()}
      </div>
    </section>
  );
};

export default Services;