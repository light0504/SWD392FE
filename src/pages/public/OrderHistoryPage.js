import React, { useEffect, useState } from 'react';
import './OrderHistoryPage.css';
import { useAuth } from '../../hooks/useAuth';
import { getOrderHistory } from '../../api/orderAPI';

export default function OrderHistoryPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getOrderHistory();
        setOrders(data);
      } catch (err) {
        setError('Failed to load order history.');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchOrders();
  }, [user]);

  if (!user) {
    return <div className="order-history-page"><h2>Please log in to view your order history.</h2></div>;
  }

  if (loading) {
    return <div className="order-history-page"><p>Loading...</p></div>;
  }

  if (error) {
    return <div className="order-history-page"><p>{error}</p></div>;
  }

  return (
    <div className="order-history-page">
      <h2>Your Order History</h2>
      {orders.length === 0 ? (
        <p>You have no orders yet.</p>
      ) : (
        <table className="order-history-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.date}</td>
                <td>{order.status}</td>
                <td>{order.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}