import React from 'react';

const ServiceDetailPopup = ({ open, onClose, service }) => {
    if (!open) return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.popup}>
                <button style={styles.closeBtn} onClick={onClose}>×</button>
                <h2>{service?.name || 'Service Name'}</h2>
                <p>{service?.description || 'Service description goes here.'}</p>
                <p><strong>Price:</strong> {service?.price ? service.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : '0 VND'}</p>
                <p><strong>Duration:</strong> {service?.duration || '0'} minutes</p>
                {/* Add more service details as needed */}
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    popup: {
        background: '#fff',
        padding: '2rem',
        borderRadius: '8px',
        minWidth: '300px',
        position: 'relative',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    },
    closeBtn: {
        position: 'absolute',
        top: '10px',
        right: '15px',
        background: 'transparent',
        border: 'none',
        fontSize: '1.5rem',
        cursor: 'pointer',
    },
};

export default ServiceDetailPopup;