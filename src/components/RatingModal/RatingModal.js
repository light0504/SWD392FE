import React, { useState } from 'react';
import './RatingModal.css';
import { submitRating } from '../../api/ratingapi';

const RatingModal = ({ orderDetail, onClose, onRatingSuccess }) => {
    const [score, setScore] = useState(0);
    const [hoverScore, setHoverScore] = useState(0); // <-- State mới để xử lý hover
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
                orderDetailId: orderDetail.id,
                score: score,
                comment: comment,
            };
            
            const response = await submitRating(payload);
            
            if (response.isSuccess) {
                alert("Cảm ơn bạn đã đánh giá dịch vụ!");
                onRatingSuccess(orderDetail.id, { score: score, comment: comment });
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
        <div className="ratingModal-overlay" onClick={onClose}>
            <div className="ratingModal-content" onClick={(e) => e.stopPropagation()}>
                <button className="ratingModal-closeBtn" onClick={onClose}>×</button>
                <h3 className="ratingModal-title">Đánh giá dịch vụ</h3>
                <h4 className="ratingModal-serviceName">{orderDetail.serviceName}</h4>
                
                <form className="ratingModal-form" onSubmit={handleSubmit}>
                    <div className="ratingModal-starContainer">
                        {[...Array(5)].map((_, index) => {
                            const ratingValue = index + 1;
                            return (
                                <span 
                                    key={ratingValue}
                                    className={`ratingModal-star ${ratingValue <= (hoverScore || score) ? 'is-active' : ''}`}
                                    onClick={() => setScore(ratingValue)}
                                    onMouseEnter={() => setHoverScore(ratingValue)}
                                    onMouseLeave={() => setHoverScore(0)}
                                >
                                    ★
                                </span>
                            );
                        })}
                    </div>
                    
                    <textarea
                        className="ratingModal-comment"
                        rows="4"
                        placeholder="Chia sẻ cảm nhận của bạn về dịch vụ..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    ></textarea>

                    {error && <p className="ratingModal-error">{error}</p>}

                    <button type="submit" className="ratingModal-submitBtn" disabled={isSubmitting}>
                        {isSubmitting ? 'Đang gửi...' : 'Gửi Đánh Giá'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RatingModal;