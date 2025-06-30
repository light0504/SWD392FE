import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  return (
    <section id="home" className="hero">
      {/* Lớp phủ đen mờ để làm nổi bật text */}
      <div className="hero-overlay"></div> 
      <div className="container hero-content">
        <h1>Nâng Niu Thú Cưng, An Tâm Sen Boss</h1>
        <p>
          Trải nghiệm dịch vụ chăm sóc 5 sao từ trái tim, mang đến vẻ đẹp và sức khỏe
          toàn diện cho những người bạn bốn chân.
        </p>
        <Link to="/dich-vu" className="btn btn-primary">Xem Tất Cả Dịch Vụ</Link>
      </div>
    </section>
  );
};

export default Hero;