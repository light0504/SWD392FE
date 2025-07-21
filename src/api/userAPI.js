import apiClient from './api';

/**
 * Lấy danh sách tất cả người dùng (khách hàng).
 * Dùng để tra cứu tên từ customerId.
 */
const getAllCustomers = async () => {
    try {
        // Giả sử endpoint lấy tất cả user là /User
        const response = await apiClient.get('/Customers');
        return response.data;
    } catch (error) {
        console.error("Error fetching all users:", error);
        throw error;
    }
};

export { getAllCustomers };