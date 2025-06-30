import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import './DashboardPages.css'; // Tái sử dụng CSS chung

const SchedulePage = () => {
    const { user } = useAuth();

    return (
        <div className="dashboard-page">
            <h1 className="page-title">Quản Lý Lịch Làm Việc</h1>
            <p className="page-subtitle">
                Xem lại lịch làm việc và các lịch hẹn đã được sắp xếp.
            </p>
            
            {/* Thông báo riêng cho Quản lý */}
            {user.role === 'Manager' && (
                <div className="info-box">
                    <strong>Chế độ Quản lý:</strong> Bạn có thể xem lịch làm việc của toàn bộ nhân viên tại đây.
                </div>
            )}
            
            <div className="placeholder-content">
                <p>📅 Component Lịch (Calendar) sẽ được tích hợp tại đây để hiển thị và quản lý lịch hẹn.</p>
            </div>
        </div>
    );
};

export default SchedulePage;