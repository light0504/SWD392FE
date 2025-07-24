import React, { useEffect, useState } from 'react';
import { getAllOrder } from '../../api/orderAPI';
import './DashboardPages.css';

const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return 'N/A';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const formatDate = (dateString) => {
  if (!dateString || dateString.startsWith('0001-01-01')) return 'N/A';
  return new Date(dateString).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const RevenueReportPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all'); // 'all', 'service', 'membership'

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getAllOrder();
        if (res && res.data && Array.isArray(res.data)) {
          setOrders(res.data.filter(o => o.status === 4));
        } else {
          setError(res?.message || 'Không thể tải danh sách đơn hàng.');
        }
      } catch (err) {
        setError('Lỗi kết nối máy chủ.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Filtered orders by type
  const filteredOrders = orders.filter(order => {
    const isMembershipOrder = !order.orderDetails || order.orderDetails.length === 0;
    if (filterType === 'all') return true;
    if (filterType === 'membership') return isMembershipOrder;
    if (filterType === 'service') return !isMembershipOrder;
    return true;
  });

  // Calculate total revenue
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

  return (
    <div className="dashboard-page">
      <h1 className="page-title">Báo Cáo Doanh Thu</h1>
      <p className="page-subtitle">
        Phân tích và theo dõi tình hình kinh doanh của spa theo thời gian.
      </p>
      {loading ? (
        <div className="page-loading">Đang tải dữ liệu đơn hàng...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <div className="info-box" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            <label htmlFor="order-type-filter" style={{ fontWeight: 600, marginRight: 8 }}>Lọc loại đơn:</label>
            <select
              id="order-type-filter"
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="dashboard-select"
            >
              <option value="all">Tất cả</option>
              <option value="service">Dịch vụ</option>
              <option value="membership">Gói thành viên</option>
            </select>
            <span className="dashboard-total-revenue">
              Tổng doanh thu: <span style={{ color: '#28a745' }}>{formatCurrency(totalRevenue)}</span>
            </span>
          </div>
          <div className="welcome-card" style={{ padding: 0, boxShadow: 'none' }}>
            <div className="revenue-table-wrapper">
              <table className="revenue-table">
                <thead>
                  <tr>
                    <th>Mã Đơn</th>
                    <th>Ngày Đặt</th>
                    <th>Loại Đơn</th>
                    <th>Dịch Vụ / Gói Thành Viên</th>
                    <th>Tổng Tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center' }}>Không có đơn hàng nào.</td></tr>
                  ) : (
                    filteredOrders.map(order => {
                      const isMembershipOrder = !order.orderDetails || order.orderDetails.length === 0;
                      return (
                        <tr key={order.id}>
                          <td>{order.id.substring(0, 8)}</td>
                          <td>{formatDate(order.orderDate)}</td>
                          <td>{isMembershipOrder ? 'Gói thành viên' : 'Dịch vụ'}</td>
                          <td>
                            {isMembershipOrder ? (
                              <span className="membership-badge">Mua gói thành viên</span>
                            ) : (
                              <ul className="service-list">
                                {order.orderDetails.map(detail => (
                                  <li key={detail.id}>{detail.serviceName}</li>
                                ))}
                              </ul>
                            )}
                          </td>
                          <td><strong>{formatCurrency(order.totalPrice)}</strong></td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RevenueReportPage;