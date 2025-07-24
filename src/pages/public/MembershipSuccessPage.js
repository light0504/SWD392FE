
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getOrderById } from '../../api/orderAPI';
import './MembershipSuccessPage.css';

const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const MembershipSuccessPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const searchParams = new URLSearchParams(location.search);
    const orderId = searchParams.get('orderId');
    const success = searchParams.get('success') === 'true';

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!orderId || orderId === 'unknown') {
            navigate('/');
            return;
        }
        const fetchOrderDetails = async () => {
            setLoading(true);
            try {
                const response = await getOrderById(orderId);
                if (response.isSuccess) {
                    setOrder(response.data);
                } else {
                    throw new Error(response.message || "Không thể tải chi tiết đơn hàng.");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        if (success) {
            fetchOrderDetails();
        } else {
            setLoading(false);
        }
    }, [orderId, success, navigate]);

    const renderMembershipSummary = () => {
        if (!success) {
            return (
                <p className="status-text error-text">
                    Thanh toán không thành công. Vui lòng thử lại hoặc liên hệ với chúng tôi.
                </p>
            );
        }
        if (loading) {
            return <p className="status-text">Đang tải thông tin gói thành viên của bạn...</p>;
        }
        if (error) {
            return <p className="status-text error-text">Lỗi: {error}</p>;
        }
        if (!order) {
            return <p className="status-text">Không tìm thấy thông tin đơn hàng.</p>;
        }
        return (
            <div className="order-summary-details">
                <div className="summary-total">
                    <span>Tổng tiền:</span>
                    <strong>{formatCurrency(order.totalPrice)}</strong>
                </div>
            </div>
        );
    };

    return (
        <div className="order-success-container">
            <div className="order-success-box">
                <div className={`success-icon ${success ? 'success' : 'fail'}`}> 
                    {success ? '✓' : '✗'}
                </div>
                <h2 className={success ? 'success' : 'fail'}>
                    {success ? 'Mua Thành Viên Thành Công!' : 'Thanh Toán Thất Bại'}
                </h2>
                <p>
                    {success
                        ? 'Cảm ơn bạn đã mua gói thành viên tại PetParadise. Dưới đây là thông tin gói của bạn.'
                        : 'Giao dịch chưa thành công. Bạn có thể thử lại hoặc liên hệ hỗ trợ.'}
                </p>
                {renderMembershipSummary()}
                <div className="action-buttons">
                    <Link to="/" className="btn-back-home">Quay Về Trang Chủ</Link>
                </div>
            </div>
        </div>
    );
};

export default MembershipSuccessPage;
