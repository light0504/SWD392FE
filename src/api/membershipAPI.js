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
    const response = await apiClient.get(`/CustomerMembership/by-customer/${customerId}`);
    return response.data;
  } catch (error) {
    // Nếu API trả về 404 (không tìm thấy), đó không phải là lỗi hệ thống.
    // Chúng ta trả về một trạng thái thành công nhưng không có dữ liệu.
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
