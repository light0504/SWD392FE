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

// Dashboard Pages
import DashboardHomePage from '../pages/dashboard/DashboardHomePage';
import StaffSchedulePage from '../pages/dashboard/StaffSchedulePage'; 
import ManagerSchedulePage from '../pages/dashboard/ManagerSchedulePage';
import RevenueReportPage from '../pages/dashboard/RevenueReportPage';
import ServiceManagementPage from '../pages/dashboard/ServiceManagement';
import AccessDeniedPage from '../pages/dashboard/AccessDeniedPage';
import StaffManagement from '../pages/dashboard/StaffManagement';

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
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/order-history" element={<OrderHistoryPage />} />
        <Route path="/order" element={<OrderPage />} />

         {/* ======================= NOT FOUND ======================= */}
        <Route path="*" element={<div style={{padding: '5rem', textAlign: 'center'}}><h1>404 - Không tìm thấy trang</h1></div>} />
      </Route>

      {/* ======================= PROTECTED ROUTES (DASHBOARD) ======================= */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['STAFF', 'MANAGER']}>
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
        {/* Manager sẽ truy cập /dashboard/schedule-management */}
        <Route 
          path="schedule-management" 
          element={
            <ProtectedRoute allowedRoles={['MANAGER']}>
              <ManagerSchedulePage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="staff-management" 
          element={
            <ProtectedRoute allowedRoles={['MANAGER']}>
              <StaffManagement />
            </ProtectedRoute>
          } 
        />
        
        <Route path="services" element={<ServiceManagementPage />} />
        <Route path="access-denied" element={<AccessDeniedPage />} />

        {/* --- DOANH THU (CHỈ MANAGER) --- */}
        <Route 
            path="revenue" 
            element={
                <ProtectedRoute allowedRoles={['MANAGER']}>
                    <RevenueReportPage />
                </ProtectedRoute>
            } 
        />
      </Route>
      
     
      
    </Routes>
  );
};

export default AppRouter;