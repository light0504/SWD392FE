import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
        <h3>Chào, {user.firstName}!</h3>
        <p>({user.roles})</p>
      </div>
      <nav>
        <NavLink to="/dashboard" end>Trang chủ</NavLink>
        {(user.roles.some(role => role ==='STAFF') || user.roles.some(role => role === 'MANAGER')) && (<NavLink to="/dashboard/my-schedule">Lịch làm việc</NavLink>)}
        {user.roles.some(role => role === 'MANAGER') && (<NavLink to="/dashboard/services">Quản lí dịch vụ</NavLink>)}
        {user.roles.some(role => role === 'MANAGER') && (<NavLink to="/dashboard/revenue">Quản lí doanh thu</NavLink>)}
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