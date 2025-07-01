import apiClient from './api'; // Sử dụng instance đã cấu hình

/**
 * Lấy danh sách tất cả các dịch vụ, có thể kèm theo tham số lọc, phân trang.
 * @param {object} params - Các tham số query (ví dụ: { page: 1, limit: 10 })
 * @returns {Promise<object>}
 */
const getAllServices = async (params = {}) => {
  try {
    const response = await apiClient.get('/Service', { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching all services:", error);
    throw error;
  }
};

/**
 * Lấy thông tin chi tiết của một dịch vụ dựa trên ID.
 * @param {string} id - ID của dịch vụ.
 * @returns {Promise<object>}
 */
const getServiceById = async (id) => {
  try {
    const response = await apiClient.get(`/Service/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching service with id ${id}:`, error);
    throw error;
  }
};

/**
 * Tạo một dịch vụ mới.
 * @param {object} serviceData - Dữ liệu của dịch vụ mới (name, price, ...).
 * @returns {Promise<object>}
 */
const createService = async (serviceData) => {
  try {
    const response = await apiClient.post('/Service', serviceData);
    return response.data;
  } catch (error)
  {
    console.error("Error creating service:", error);
    throw error;
  }
};

/**
 * Xóa một dịch vụ dựa trên ID.
 * @param {string} serviceId - ID của dịch vụ cần xóa.
 * @returns {Promise<object>}
 */
const deleteService = async (serviceId) => {
  try {
    const response = await apiClient.delete(`/Service/${serviceId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting service with id ${serviceId}:`, error);
    throw error;
  }
};

// Bạn cũng có thể thêm hàm updateService ở đây
// const updateService = async (serviceId, serviceData) => { ... }

export {
  getAllServices,
  getServiceById,
  createService,
  deleteService,
};