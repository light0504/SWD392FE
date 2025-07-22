import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getAllMemberships } from '../../api/membershipAPI';
import { generateVietQR } from '../../api/payAPI';
import './MembershipPage.css';

const MembershipPage = () => {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrModal, setQrModal] = useState({ open: false, qrImageUrl: '', membershipName: '' });
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchMemberships = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAllMemberships();
        if (response.isSuccess && Array.isArray(response.data)) {
          setMemberships(response.data);
        } else {
          setError(response.message || 'Không thể tải danh sách gói thành viên.');
        }
      } catch (err) {
        setError('Lỗi kết nối máy chủ.');
      } finally {
        setLoading(false);
      }
    };
    fetchMemberships();
  }, []);

  const handleBuyMembership = async (membership) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const payResponse = await generateVietQR({
        amount: membership.price,
        addInfo: `Mua gói thành viên: ${membership.name}`
      });
      if (payResponse && payResponse.qrImageUrl) {
        setQrModal({ open: true, qrImageUrl: payResponse.qrImageUrl, membershipName: membership.name });
      } else {
        alert('Không lấy được mã QR thanh toán.');
      }
    } catch (err) {
      alert('Lỗi khi tạo thanh toán.');
    }
  };

  const handleCloseQrModal = () => {
    setQrModal({ open: false, qrImageUrl: '', membershipName: '' });
  };

  if (loading) return <div className="page-loading">Đang tải danh sách gói thành viên...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="membership-page">
      <h1 className="page-title">Các Gói Thành Viên</h1>
      <p className="page-subtitle">Chọn gói phù hợp để nhận ưu đãi và tiết kiệm hơn khi sử dụng dịch vụ!</p>
      <div className="membership-list">
        {memberships.map(m => (
          <div key={m.id} className="membership-card">
            <img src={m.imageUrl} alt={m.name} className="membership-image" />
            <h2 className="membership-name">{m.name}</h2>
            <p className="membership-description">{m.description}</p>
            <div className="membership-details">
              <span className="membership-price">
                {m.price > 0 ? `${m.price.toLocaleString('vi-VN')}đ` : 'Miễn phí'}
              </span>
              <span className="membership-discount">Giảm {m.discountPercentage}%</span>
              <span className="membership-duration">{m.durationInDays > 0 ? `${m.durationInDays} ngày` : 'Không giới hạn'}</span>
            </div>
            <button className="btn-buy-membership" onClick={() => handleBuyMembership(m)}>
              Mua gói này
            </button>
          </div>
        ))}
      </div>
      {qrModal.open && (
        <div className="modal-overlay">
          <div className="qr-modal-content">
            <h2>Quét mã QR để thanh toán gói: {qrModal.membershipName}</h2>
            <img src={qrModal.qrImageUrl} alt="QR Thanh toán" className="qr-image" />
            <button className="btn-cancel" onClick={handleCloseQrModal}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipPage;
