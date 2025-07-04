import apiClient from './api'; // Sử dụng instance đã cấu hình

/**
 * Lấy danh sách tất cả các dịch vụ, có thể kèm theo tham số lọc, phân trang.
 * @param {object} params - Các tham số query (ví dụ: { page: 1, limit: 10 })
 * @returns {Promise<object>}
 */
const getAllServices = async () => {
  try {
    const response = await apiClient.get('/Service');
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


/**
 * Lấy thông tin của tất cả staff.
 * @returns {Promise<object>}
 */
const getAllStaff = async () => {
  try {
    // Giả sử endpoint lấy danh sách nhân viên là '/Staff'
    const response = await apiClient.get('/Staff');
    return response.data;
  } catch (error) {
    console.error("Error fetching all staff:", error);
    throw error;
  }
};



/**
 * [MANAGER] Lấy lịch làm việc của TẤT CẢ nhân viên.
 * Tên hàm: getAllStaffSchedule
 */
const getAllStaffSchedule = async () => {
  try {
    // Giả sử endpoint của Manager là /Schedule/all để lấy toàn bộ
    const response = await apiClient.get('/staff-schedules/all');
    return response.data;
  } catch (error) {
    console.error("Error in getAllStaffSchedule:", error);
    throw error;
  }
};

/**
 * Lấy lịch của một staff.
 * @param {string} staffId - ID của staff cần lấy lịch.
 * @returns {Promise<object>}
 */
const getStaffSchedule = async (staffId) => {
  try {
    const response = await apiClient.get(`/staff-schedules/by-staff/${staffId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting service with id ${staffId}:`, error);
    throw error;
  }
};

export {
  getAllServices,
  getServiceById,
  createService,
  deleteService,
  getAllStaff,
  getAllStaffSchedule,
  getStaffSchedule
};