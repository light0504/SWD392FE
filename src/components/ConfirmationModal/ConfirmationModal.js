// src/components/ConfirmationModal/ConfirmationModal.js
import React from 'react';
import './ConfirmationModal.css';

const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
const formatDate = (dateString) => new Date(dateString).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const ConfirmationModal = ({ orderDetails, onConfirm, onCancel, isSubmitting }) => {
    const { selectedServices, totalPrice, discount, finalPrice, membership, note } = orderDetails;

    return (
        <div className="modal-overlay">
            <div className="confirmation-modal-content">
                <h3>Xác Nhận Đơn Hàng</h3>
                <p className="confirmation-intro">Vui lòng kiểm tra lại thông tin lịch hẹn của bạn trước khi tiếp tục.</p>
                
                <div className="confirmation-details">
                    <h4>Các dịch vụ đã chọn:</h4>
                    <ul className="confirmation-service-list">
                        {selectedServices.map(service => (
                            <li key={service.id}>
                                <div className="service-info">
                                    <span className="service-name">{service.name} (x{service.quantity})</span>
                                    <span className="service-time">Lịch hẹn: {formatDate(service.scheduledTime)}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                    
                    {note && (
                        <div className="confirmation-note">
                            <strong>Ghi chú:</strong> {note}
                        </div>
                    )}
                    
                    <div className="confirmation-pricing">
                        <p><span>Tạm tính:</span> <span>{formatCurrency(totalPrice)}</span></p>
                        {discount > 0 && (
                            <p className="discount">
                                <span>Ưu đãi {membership.membershipName}:</span>
                                <span>- {formatCurrency(discount)}</span>
                            </p>
                        )}
                        <p className="final-price">
                            <span>Thành tiền:</span> 
                            <strong>{formatCurrency(finalPrice)}</strong>
                        </p>
                    </div>
                </div>

                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onCancel} disabled={isSubmitting}>
                        Chỉnh sửa
                    </button>
                    <button className="btn-confirm" onClick={onConfirm} disabled={isSubmitting}>
                        {isSubmitting ? 'Đang xử lý...' : 'Xác Nhận & Thanh Toán'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;