import apiClient from './api';

/**
 * Fetch the order history for the current user.
 * @returns {Promise<Array>} Array of order objects
 */
export const getOrderHistory = async () => {
  try {
    const response = await apiClient.get('/orders/history');
    return response.data;
  } catch (error) {
    console.error('Error fetching order history:', error);
    throw error;
  }
}; 