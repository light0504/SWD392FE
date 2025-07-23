import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getAllMemberships, getMembershipByCustomer, createMembershipOrder } from '../../api/membershipAPI';
import { createPaymentURL } from '../../api/payAPI';
import './MembershipPage.css';

const MembershipPage = () => {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrModal, setQrModal] = useState({ open: false, qrImageUrl: '', membershipName: '' });
  const [userMembership, setUserMembership] = useState(null);
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

  useEffect(() => {
    const fetchUserMembership = async () => {
      if (user && user.id) {
        try {
          const res = await getMembershipByCustomer(user.id);
          const memberships = Array.isArray(res?.data) ? res.data : [];
          // Find active membership, or first if none active
          const activeMembership = memberships.find(m => m.isActive) || memberships[0] || null;
          setUserMembership(activeMembership);
        } catch {
          setUserMembership(null);
        }
      } else {
        setUserMembership(null);
      }
    };
    fetchUserMembership();
  }, [user]);

  const handleBuyMembership = async (membership) => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Không cho mua nếu đã có membership khác basic
    if (userMembership && userMembership.membershipName && userMembership.membershipName.toLowerCase() !== 'basic') {
      alert(`Bạn đang sử dụng gói: ${userMembership.membershipName}. Không thể mua gói mới khi chưa hết hạn.`);
      return;
    }
    try {
      // Tạo order mua membership
      const orderRes = await createMembershipOrder(user.id, membership.id);
      if (!orderRes || !orderRes.data || !orderRes.data.id) {
        alert('Không tạo được đơn hàng cho gói thành viên.');
        return;
      }
      // Tạo payment url
      const paymentRes = await createPaymentURL({
        orderId: orderRes.data.id,
        orderType: membership.id
      });
      if (paymentRes) {
        window.open(paymentRes, '_blank');
      } else {
        alert('Không lấy được link thanh toán.');
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
            {m.price > 0 && (
              <button className="btn-buy-membership" onClick={() => handleBuyMembership(m)}>
                Mua gói này
              </button>
            )}
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
