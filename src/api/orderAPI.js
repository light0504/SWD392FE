import apiClient from './api';

/**
 * Fetch the order history for the current user.
 * @returns {Promise<Array>} Array of order objects
 */
const getOrderHistory = async () => {
  try {
    const response = await apiClient.get('/orders/history');
    return response.data;
  } catch (error) {
    console.error('Error fetching order history:', error);
    throw error;
  }
}; 

/**
 * Gửi yêu cầu tạo một đơn hàng mới.
 * @param {object} orderPayload - Dữ liệu đơn hàng theo cấu trúc API.
 * @returns {Promise<object>}
 */
const createOrder = async (orderPayload) => {
    try {
        // Giả sử endpoint tạo đơn hàng là /Order
        const response = await apiClient.post('/Order', orderPayload);
        return response.data;
    } catch (error) {
        console.error("Error creating order:", error);
        if (error.response && error.response.data) {
            return error.response.data;
        }
        throw error;
    }
};

export { getOrderHistory,
  createOrder 
};