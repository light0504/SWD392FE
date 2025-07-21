import apiClient from "./api";
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

export {
    getAllStaffSchedule,
    getStaffSchedule
};