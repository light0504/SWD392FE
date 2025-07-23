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

export const getMembershipByCustomer = async (customerId) => {
  try {
    const response = await apiClient.get(`/CustomerMembership/by-customer/${customerId}`);
    return response.data;
  } catch (error) {
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
