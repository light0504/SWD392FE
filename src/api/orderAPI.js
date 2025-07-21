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

/**
 * [STAFF/MANAGER] Cập nhật trạng thái của một chi tiết đơn hàng thành "Hoàn thành".
 * @param {string} orderDetailId - ID của chi tiết đơn hàng.
 * @returns {Promise<object>}
 */
const completeOrderDetail = async (orderDetailId) => {
    try {
        const response = await apiClient.patch(`/OrderDetail/${orderDetailId}/complete`);
        return response.data;
    } catch (error) {
        console.error(`Error completing order detail ${orderDetailId}:`, error);
        throw error;
    }
};

/**
 * [STAFF/MANAGER] Cập nhật trạng thái của một chi tiết đơn hàng thành "Đã hủy".
 * @param {string} orderDetailId - ID của chi tiết đơn hàng.
 * @returns {Promise<object>}
 */
const cancelOrderDetail = async (orderDetailId) => {
    try {
        const response = await apiClient.patch(`/OrderDetail/${orderDetailId}/cancel`);
        return response.data;
    } catch (error) {
        console.error(`Error cancelling order detail ${orderDetailId}:`, error);
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
  createOrder,
  getAllOrder,
  getStaffOrders,
  completeOrderDetail,
  cancelOrderDetail
};
