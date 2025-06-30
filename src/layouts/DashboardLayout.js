import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './DashboardLayout.css';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  }

  return (
    <div className="sidebar">
      <div className="sidebar-profile">
        <h3>Chào, {user.name}!</h3>
        <p>({user.role})</p>
      </div>
      <nav>
        <NavLink to="/dashboard" end>Trang chủ</NavLink>
        {(user.role === 'Staff' || user.role === 'Manager') && (<NavLink to="/dashboard/my-schedule">Lịch làm việc</NavLink>)}
        {user.role === 'Manager' && (<NavLink to="/dashboard/revenue">Xem Doanh Thu</NavLink>)}
      </nav>
      <button onClick={handleLogout} className="btn-logout">Đăng xuất</button>
    </div>
  );
};

const DashboardLayout = () => {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;