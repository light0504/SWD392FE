import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getAllMemberships, getMembershipByCustomer, createMembershipOrder, deactivateMembership } from '../../api/membershipAPI';
import { createPaymentURL } from '../../api/payAPI';
import { Helmet } from 'react-helmet-async';
import './MembershipPage.css';

const MembershipPage = () => {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noticeModal, setNoticeModal] = useState({ open: false, message: '' });
  const [confirmModal, setConfirmModal] = useState({ open: false, membership: null });
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
          // API now returns a single object or null
          setUserMembership(res?.data || null);
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
    // Không cho mua nếu đã có membership đang active và khác basic
    if (userMembership && userMembership.isActive && userMembership.membershipName && userMembership.membershipName.toLowerCase() !== 'basic') {
      setNoticeModal({ open: true, message: `Bạn đang sử dụng gói: ${userMembership.membershipName}. Không thể mua gói mới khi chưa hết hạn.`, showUpgrade: true, pendingMembership: membership });
      return;
    }
    // Hiển thị modal xác nhận trước khi mua
    setConfirmModal({ open: true, membership });
  };

  const handleConfirmBuy = async () => {
    const membership = confirmModal.membership;
    if (!membership || !user) return;
    setConfirmModal({ open: false, membership: null });
    try {
      // Tạo order mua membership
      const orderRes = await createMembershipOrder(user.id, membership.id);
      if (!orderRes || !orderRes.data || !orderRes.data.id) {
        setNoticeModal({ open: true, message: 'Không tạo được đơn hàng cho gói thành viên.' });
        return;
      }
      // Tạo payment url
      const paymentRes = await createPaymentURL({
        orderId: orderRes.data.id,
        orderType: membership.id
      });
      if (paymentRes) {
        window.location.href = paymentRes;
      } else {
        setNoticeModal({ open: true, message: 'Không lấy được link thanh toán.' });
      }
    } catch (err) {
      setNoticeModal({ open: true, message: 'Lỗi khi tạo thanh toán.' });
    }
  };

  const handleCloseConfirmModal = () => {
    setConfirmModal({ open: false, membership: null });
  };

  const handleCloseNoticeModal = () => {
    setNoticeModal({ open: false, message: '', showUpgrade: false, pendingMembership: null });
  };

  const handleDeactivateAndUpgrade = async () => {
    if (!userMembership || !userMembership.id || !noticeModal.pendingMembership) return;
    try {
      await deactivateMembership(userMembership.id);
      setNoticeModal({ open: false, message: '', showUpgrade: false, pendingMembership: null });
      // Reload the page to ensure all state is refreshed
      window.location.reload();
    } catch {
      setNoticeModal({ open: true, message: 'Không thể hủy gói thành viên hiện tại.', showUpgrade: false, pendingMembership: null });
    }
  };

  if (loading) return <div className="page-loading">Đang tải danh sách gói thành viên...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="membership-page">
      <Helmet>
                <title>Gói thành viên</title>
            </Helmet>
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
      {noticeModal.open && (
        <div className="modal-overlay">
          <div className="notice-modal-content">
            <h2>Thông báo</h2>
            <p>{noticeModal.message}</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn-cancel" onClick={handleCloseNoticeModal}>Đóng</button>
              {noticeModal.showUpgrade && (
                <button className="btn-buy-membership" onClick={handleDeactivateAndUpgrade}>Hủy và nâng cấp</button>
              )}
            </div>
          </div>
        </div>
      )}
      {confirmModal.open && confirmModal.membership && (
        <div className="modal-overlay">
          <div className="notice-modal-content">
            <h2>Xác nhận mua gói thành viên</h2>
            <p>Bạn có chắc chắn muốn mua gói <strong>{confirmModal.membership.name}</strong> với giá <strong>{confirmModal.membership.price.toLocaleString('vi-VN')}đ</strong>?</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn-buy-membership" onClick={handleConfirmBuy}>Xác nhận</button>
              <button className="btn-cancel" onClick={handleCloseConfirmModal}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipPage;
