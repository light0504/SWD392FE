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
 * Fetch the order history for the current user.
 * @returns {Promise<Array>} Array of order objects
 */
const getAllOrder = async () => {
  try {
    const response = await apiClient.get(`/Order`);
    console.log("All orders fetched successfully:", response);
    return response.data;
  } catch (error) {
    // Sửa lại log lỗi cho chính xác
    console.error(`Error fetching all orders:`, error);
    throw error;
  }
};

/**
 * [STAFF] Lấy tất cả các đơn hàng (và chi tiết) được phân công cho một nhân viên cụ thể.
 * @param {string} staffId - ID của nhân viên.
 * @returns {Promise<object>}
 */
const getStaffOrders = async (staffId) => {
    try {
        const response = await apiClient.get(`/Order/staff/${staffId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching orders for staff ${staffId}:`, error);
        throw error;
    }
};

const updateOrderDetailStatus = async (payload) => {
    try {
        const response = await apiClient.patch('/OrderDetail/status', payload);
        return response.data;
    } catch (error) {
        console.error("Error updating order detail status:", error);
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
        console.log("Order created successfully:", response);
        return response.data;
    } catch (error) {
        console.error("Error creating order:", error);
        if (error.response && error.response.data) {
            return error.response.data;
        }
        throw error;
    }
};
/**
 * Lấy thông tin chi tiết của một đơn hàng cụ thể bằng ID.
 * @param {string} orderId - ID của đơn hàng.
 * @returns {Promise<object>}
 */

const getOrderById = async (orderId) => {
    try {
        // Giả sử endpoint là /Order/{id}
        const response = await apiClient.get(`/Order/${orderId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching order with id ${orderId}:`, error);
        throw error;
    }
};

export { getOrderHistory,
  createOrder,
  getAllOrder,
  getStaffOrders,
  updateOrderDetailStatus
, getOrderById };

