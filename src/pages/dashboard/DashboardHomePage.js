import { useAuth } from '../../hooks/useAuth';
import { Helmet } from 'react-helmet-async';
import './DashboardPages.css'; // Tái sử dụng CSS chung

const DashboardHomePage = () => {
    const { user } = useAuth();
    return (
        <div className="dashboard-page">
            <Helmet>
                <title>Dashboard</title>
            </Helmet>
            <h1 className="page-title">Tổng quan</h1>
            <div className="welcome-card">
                <h2>Xin chào, {user.firstName}!</h2>
                <p>
                    Chào mừng bạn trở lại với hệ thống quản lý của PetSpa.
                </p>
                <p>
                    Hãy sử dụng thanh điều hướng để bắt đầu công việc của mình.
                </p>
            </div>
            {/* Trong tương lai có thể thêm các widget tổng quan nhanh ở đây */}
        </div>
    );
};

export default DashboardHomePage;