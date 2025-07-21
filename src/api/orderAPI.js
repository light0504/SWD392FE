import apiClient from './api';

/**
 * Fetch the order history for the current user.
 * @returns {Promise<Array>} Array of order objects
 */
const getOrderHistory = async (customerId) => {
  try {
    const response = await apiClient.get(`/Order/customer/${customerId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order history for ${customerId}:`, error);
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