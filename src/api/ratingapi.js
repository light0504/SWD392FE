import apiClient from './api';

/**
 * Gửi đánh giá (rating) cho một chi tiết dịch vụ cụ thể.
 * @param {object} payload - Dữ liệu đánh giá theo cấu trúc: { orderDetailId, score, comment }
 * @returns {Promise<object>}
 */
const submitRating = async (payload) => {
    try {
        const response = await apiClient.post('/Rating', payload);
        return response.data;
    } catch (error) {
        console.error("Error submitting rating:", error);
        throw error;
    }
};

export { submitRating };