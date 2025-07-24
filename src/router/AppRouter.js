import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Public Pages
import HomePage from '../pages/public/HomePage';
import ServicesPage from '../pages/public/ServicesPage';
import LoginPage from '../pages/public/LoginPage';
import RegisterPage from '../pages/public/RegisterPage';
import ProfilePage from '../pages/public/ProfilePage';
import OrderHistoryPage from '../pages/public/OrderHistoryPage';
import OrderPage from '../pages/public/OrderPage';
import OrderSuccessPage from '../pages/public/OrderSuccessPage';
import MembershipSuccessPage from '../pages/public/MembershipSuccessPage';

// Dashboard Pages
import DashboardHomePage from '../pages/dashboard/DashboardHomePage';
import StaffSchedulePage from '../pages/dashboard/StaffSchedulePage'; 
import ManagerSchedulePage from '../pages/dashboard/ManagerSchedulePage';
import RevenueReportPage from '../pages/dashboard/RevenueReportPage';
import ServiceManagementPage from '../pages/dashboard/ServiceManagement';
import AccessDeniedPage from '../pages/dashboard/AccessDeniedPage';
import StaffManagement from '../pages/dashboard/StaffManagement';
import ManagerOrderPage from '../pages/dashboard/ManagerOrderPage';
import StaffWorklogPage from '../pages/dashboard/StaffWorklogPage';
import MembershipPage from '../pages/public/MembershipPage';

// Auth Components
import ProtectedRoute from './ProtectedRoute';

const AppRouter = () => {
  return (
    <Routes>
      {/* ======================= PUBLIC ROUTES ======================= */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/services" element={<ServicesPage />} />
        
        {/* ====================================================== */}
      {/*       PROTECTED ROUTES FOR USERS (VAI TRÒ 'USER')      */}
      {/* ====================================================== */}
      {/* Các route này yêu cầu đăng nhập và sử dụng layout công khai */}
      {/* <Route element={
          <ProtectedRoute allowedRoles={['USER']}>
              <PublicLayout />
          </ProtectedRoute>
      }> */}
        <Route path="/order-history" element={<OrderHistoryPage />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/order" element={<OrderPage />} />
        <Route path="/membership" element={<MembershipPage />} />
        <Route path="/membership-success" element={<MembershipSuccessPage />} />
        {/* Thêm các trang khác cho người dùng ở đây, ví dụ: /profile */}
      {/* </Route> */}

         {/* ======================= NOT FOUND ======================= */}
        <Route path="*" element={<div style={{padding: '5rem', textAlign: 'center'}}><h1>404 - Không tìm thấy trang</h1></div>} />
      </Route>

      {/* ======================= PROTECTED ROUTES (DASHBOARD) ======================= */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['STAFF', 'MANAGER','ADMIN']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHomePage />} />
        
        {/* --- LỊCH LÀM VIỆC (ĐÃ TÁCH VÀ SỬA TÊN) --- */}
        {/* Staff sẽ truy cập /dashboard/schedule */}
        <Route 
          path="schedule" 
          element={
            <ProtectedRoute allowedRoles={['STAFF']}>
              <StaffSchedulePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="my-worklog"
          element={ <ProtectedRoute allowedRoles={['STAFF']}><StaffWorklogPage /></ProtectedRoute> }
        />
        {/* Manager sẽ truy cập /dashboard/schedule-management */}
        <Route 
          path="schedule-management" 
          element={
            <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
              <ManagerSchedulePage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="staff-management" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <StaffManagement />
            </ProtectedRoute>
          } 
        />
        
        <Route path="services" element={<ProtectedRoute allowedRoles={['MANAGER','ADMIN']}>
              <ServiceManagementPage/>
            </ProtectedRoute>} />
        <Route path="access-denied" element={<AccessDeniedPage />} />

        {/* --- DOANH THU (CHỈ MANAGER) --- */}
        <Route 
            path="revenue" 
            element={
                <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
                    <RevenueReportPage />
                </ProtectedRoute>
            } 
        />
        <Route
          path="orders"
          element={
            <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
              <ManagerOrderPage />
            </ProtectedRoute>
          }
        />
      </Route>
      
     
      
    </Routes>
  );
};

export default AppRouter;