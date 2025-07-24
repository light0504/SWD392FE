import apiClient from './api';

export const getAllMemberships = async () => {
  try {
    const response = await apiClient.get('/Membership');
    return response.data;
  } catch (error) {
    console.error(`Error fetching membership data:`, error);
    throw error;
  }
};

/**
 * Lấy thông tin thành viên của một khách hàng cụ thể.
 * @param {string} customerId - ID của khách hàng.
 * @returns {Promise<object>}
 */
export const getMembershipByCustomer = async (customerId) => {
  try {
    // Use the new endpoint for best/active membership
    const response = await apiClient.get(`/CustomerMembership/by-customer/best${customerId}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return { isSuccess: true, data: null, message: "Customer has no membership." };
    }
    console.error(`Error fetching customer membership:`, error);
    throw error;
  }
};

export const createMembershipOrder = async (customerId, membershipId) => {
  try {
    const response = await apiClient.post(`/CustomerMembership/${customerId}/memberships/${membershipId}`);
    return response.data;
  } catch (error) {
    console.error('Error creating membership order:', error);
    throw error;
  }
};

/**
 * Deactivate (end) a customer membership by ID.
 * @param {string} customerMembershipId - The ID of the customer membership to deactivate.
 * @returns {Promise<object>} API response
 */
export const deactivateMembership = async (customerMembershipId) => {
  try {
    const response = await apiClient.patch(`/CustomerMembership/${customerMembershipId}/end`);
    return response.data;
  } catch (error) {
    console.error('Error deactivating membership:', error);
    throw error;
  }
};