import apiClient from './api';

/**
 * Tạo URL thanh toán cho một đơn hàng.
 * @param {object} payload - Dữ liệu yêu cầu, chứa { orderId, orderType }.
 * @returns {Promise<object>} Dữ liệu trả về từ API, mong đợi sẽ chứa URL thanh toán.
 */
const createPaymentUrl = async (payload) => {
    try {
        const response = await apiClient.post('/Payment/createPaymentURL', payload);
        return response.data;
    } catch (error) {
        console.error("Error creating payment URL:", error);
        throw error;
    }
};

export { createPaymentUrl };