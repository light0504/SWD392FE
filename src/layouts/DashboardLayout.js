import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './DashboardLayout.css';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const isManager = user && (user.roles.includes('MANAGER') || user.roles.includes('ADMIN'));
  const isStaff = user && user.roles.includes('STAFF');
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
            <NavLink to="/dashboard" end>Trang Chủ</NavLink>
            
            {/* SỬA ĐƯỜNG DẪN Ở ĐÂY */}
            {isStaff && 
              <>
              <NavLink to="/dashboard/schedule">Lịch Của Tôi</NavLink>
              <NavLink to="/dashboard/my-worklog">Công Việc Của Tôi</NavLink>
            </>
            
            }

            {isManager && (
                <>
                    <NavLink to="/dashboard/schedule-management">Quản Lý Lịch Làm Việc</NavLink>
                    <NavLink to="/dashboard/orders">Quản Lý Đơn Hàng</NavLink>
                    <NavLink to="/dashboard/revenue">Báo Cáo Doanh Thu</NavLink>
                    <NavLink to="/dashboard/services">Quản Lý Dịch Vụ</NavLink>
                    <NavLink to="/dashboard/staff-management">Quản Nhân Viên</NavLink>
                </>
            )}
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