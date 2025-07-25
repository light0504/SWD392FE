import { Link } from 'react-router-dom';
import './DashboardPages.css'; // Tái sử dụng CSS chung
import { Helmet } from 'react-helmet-async';

const AccessDeniedPage = () => {
    return (
        
        <div className="dashboard-page text-center">
            <Helmet>
                <title>Access Denied</title>
            </Helmet>
            <div className="access-denied-icon">🚫</div>
            <h1 className="page-title" style={{color: '#e74c3c'}}>Truy Cập Bị Từ Chối</h1>
            <p className="page-subtitle">
                Rất tiếc, bạn không có đủ quyền hạn để truy cập vào trang này.
            </p>
            <Link to="/dashboard" className="btn-back">
                Quay về Trang chủ Dashboard
            </Link>
        </div>
    );
};

export default AccessDeniedPage;