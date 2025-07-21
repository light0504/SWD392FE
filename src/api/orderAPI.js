import apiClient from './api';

/**
 * Fetch the order history for the current user.
 * @returns {Promise<Array>} Array of order objects
 */

//Lấy lịch sử Order của khách hàng dựa trên id khách hàng
export const getOrderHistory = async (customerId) => {
  try {
    const response = await apiClient.get(`/Order/customer/${customerId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order history for ${customerId}:`, error);
    throw error;
  }
}; 