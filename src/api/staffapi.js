import apiClient from './api';

/**
 * Lấy danh sách tất cả các nhân viên, có thể kèm theo tham số lọc, phân trang.
 * @param {object} params - Các tham số query (ví dụ: { page: 1, limit: 10 })
 * @returns {Promise<object>}
 */
const getAllStaff = async (params = {}) => {
    try {
        const response = await apiClient.get('/Staff', { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching all staff:", error);
        throw error;
    }
};

// /**
//  * Lấy thông tin chi tiết của một nhân viên dựa trên ID.
//  * @param {string} id - ID của nhân viên.
//  * @returns {Promise<object>}
//  */
// const getStaffById = async (id) => {
//   try {
//     const response = await apiClient.get(`/Staff/${id}`);
//     return response.data;
//   } catch (error) {
//     console.error(`Error fetching staff with id ${id}:`, error);
//     throw error;
//   }
// };

/**
 * Lấy thông tin nhân viên bằng cách lọc
 * @param {object} filter - Các tham số lọc
 * @returns {Promise<object>}
 */
const getStaffByFilter = async (filter) => {
    try {
        const response = await apiClient.post('/Staff/filter', filter);
        return response.data;
    } catch (error) {
        console.error("Error fetching staff by filter:", error);
        throw error;
    }
};

/**
 * Tạo một nhân viên mới.
 * @param {object} staffData - Dữ liệu của nhân viên mới (name, salary, ...).
 * @returns {Promise<object>}
 */
const createStaff = async (staffData) => {
    try {
        const response = await apiClient.post('/Staff', staffData);
        return response.data;
    } catch (error) {
        console.error("Error creating staff:", error);
        throw error;
    }
};

/**
 * Cập nhật thông tin của một nhân viên.
 * @param {string} staffId - ID của nhân viên cần cập nhật.
 * @param {object} staffData - Dữ liệu cập nhật của nhân viên.
 * @returns {Promise<object>}
 */
const updateStaff = async (staffId, staffData) => {
    try {
        const response = await apiClient.put(`/Staff/${staffId}`, staffData);
        return response.data;
    } catch (error) {
        console.error(`Error updating staff with id ${staffId}:`, error);
        throw error;
    }
};

/**
 * Xóa một nhân viên dựa trên ID.
 * @param {string} staffId - ID của nhân viên cần xóa.
 * @returns {Promise<object>}
 */
const deleteStaff = async (staffId) => {
    try {
        const response = await apiClient.delete(`/Staff/${staffId}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting staff with id ${staffId}:`, error);
        throw error;
    }
};

export {
    getAllStaff,
    getStaffByFilter,
    createStaff,
    updateStaff,
    deleteStaff
};