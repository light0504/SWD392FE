import React, { useState } from 'react';
import './RatingModal.css';
import { submitRating } from '../../api/ratingapi'; // Import từ file API mới

const RatingModal = ({ orderDetail, onClose, onRatingSuccess }) => {
    const [score, setScore] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (score === 0) {
            setError("Vui lòng chọn ít nhất 1 sao để đánh giá.");
            return;
        }
        setIsSubmitting(true);
        setError(null);

        try {
            const payload = {
                orderDetailId: orderDetail.orderDetailId, // Giả sử API trả về trường này
                score: score,
                comment: comment,
            };
            
            const response = await submitRating(payload);
            
            if (response.isSuccess) {
                alert("Cảm ơn bạn đã đánh giá dịch vụ!");
                onRatingSuccess(orderDetail.orderDetailId, score); // Cập nhật UI ở trang cha
                onClose();
            } else {
                throw new Error(response.message || "Gửi đánh giá thất bại.");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>×</button>
                <h3>Đánh giá dịch vụ</h3>
                <h4>{orderDetail.serviceName}</h4>
                
                <form onSubmit={handleSubmit}>
                    <div className="star-rating">
                        {[...Array(5)].map((_, index) => {
                            const ratingValue = index + 1;
                            return (
                                <span 
                                    key={ratingValue}
                                    className={ratingValue <= score ? 'star selected' : 'star'}
                                    onClick={() => setScore(ratingValue)}
                                >
                                    ★
                                </span>
                            );
                        })}
                    </div>
                    
                    <textarea
                        rows="4"
                        placeholder="Chia sẻ cảm nhận của bạn về dịch vụ..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    ></textarea>

                    {error && <p className="error-message modal-error">{error}</p>}

                    <button type="submit" className="btn-submit-rating" disabled={isSubmitting}>
                        {isSubmitting ? 'Đang gửi...' : 'Gửi Đánh Giá'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RatingModal;