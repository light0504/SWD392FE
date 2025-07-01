import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import HomePage from '../pages/public/HomePage';
import ServicesPage from '../pages/public/ServicesPage';
import LoginPage from '../pages/public/LoginPage';
import RegisterPage from '../pages/public/RegisterPage';
import DashboardHomePage from '../pages/dashboard/DashboardHomePage';
import SchedulePage from '../pages/dashboard/SchedulePage';
import RevenueReportPage from '../pages/dashboard/RevenueReportPage';
import AccessDeniedPage from '../pages/dashboard/AccessDeniedPage';
import ServicesManagement from '../pages/dashboard/ServiceManagement';
import ProtectedRoute from './ProtectedRoute';

const AppRouter = () => {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        {/* <Route path="/dich-vu" element={<ServicesPage />} /> */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/services" element={<ServicesPage />} />
      </Route>

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['STAFF', 'MANAGER']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHomePage />} />
        <Route path="my-schedule" element={<SchedulePage />} />
        <Route path='services' element={<ServicesManagement/>} />
        <Route path="access-denied" element={<AccessDeniedPage />} />
        <Route 
            path="revenue" 
            element={
                <ProtectedRoute allowedRoles={['MANAGER']}>
                    <RevenueReportPage />
                </ProtectedRoute>
            } 
        />
      </Route>
      
      <Route path="*" element={<div style={{padding: '5rem', textAlign: 'center'}}><h1>404 - Không tìm thấy trang</h1></div>} />
    </Routes>
  );
};

export default AppRouter;