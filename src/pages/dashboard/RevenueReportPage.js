import React from 'react';
import './DashboardPages.css'; // Tái sử dụng CSS chung

const RevenueReportPage = () => {
    return (
        <div className="dashboard-page">
            <h1 className="page-title">Báo Cáo Doanh Thu</h1>
            <p className="page-subtitle">
                Phân tích và theo dõi tình hình kinh doanh của spa theo thời gian.
            </p>
            
             <div className="placeholder-content">
                <p>📈 Các biểu đồ doanh thu theo ngày, tuần, tháng sẽ được tích hợp ở đây.</p>
            </div>
        </div>
    );
};

export default RevenueReportPage;