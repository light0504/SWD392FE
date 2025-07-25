import React from 'react';
import './NotificationModal.css';

const NotificationModal = ({ message, onClose, type = 'error' }) => {
    // Component sẽ không render gì cả nếu không có message
    if (!message) {
        return null;
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className={`notification-modal ${type}`} onClick={(e) => e.stopPropagation()}>
                <div className="modal-icon">
                    {type === 'error' ? '!' : '✓'}
                </div>
                <div className="modal-content-text">
                    <h4>{type === 'error' ? 'Đã có lỗi xảy ra' : 'Thành công'}</h4>
                    <p>{message}</p>
                </div>
                <button onClick={onClose} className="modal-close-button">Đóng</button>
            </div>
        </div>
    );
};

export default NotificationModal;