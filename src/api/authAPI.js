import apiClient from './api'; // Sử dụng instance đã cấu hình

const loginUser = async (email, password) => {
  try {
    const response = await apiClient.post(
      '/Auth/login',
      { email, password },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data;
  } catch (error) {
    console.error("Error during login:", error);
    if (error.response && error.response.data) {
      return error.response.data;
    }
    throw error;
  }
};

/**
 * Update the current user's profile information
 * @param {object} userData - Only the fields that need to be updated
 * @returns {Promise<object>}
 */
const updateUserProfile = async (changedFields) => {
  try {
    // Only send the fields that have values
    const updateData = Object.fromEntries(
      Object.entries(changedFields).filter(([_, value]) => value !== undefined && value !== '')
    );
    
    const response = await apiClient.put('/Customers/me', updateData);
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    if (error.response && error.response.data) {
      return error.response.data;
    }
    throw error;
  }
};

/**
 * Gửi thông tin để đăng ký tài khoản mới.
 * @param {object} userData - Thông tin người dùng mới.
 * @returns {Promise<object>}
 */
const registerUser = async (userData) => {
    try {
        const response = await apiClient.post('/Customers', userData);
        return response.data;
    } catch (error) {
        console.error("Error during registration:", error);
        if (error.response && error.response.data) {
            return error.response.data;
        }
        throw error;
    }
}


// Bạn cũng có thể thêm các hàm khác ở đây
// const logoutUser = async () => { ... }
// const refreshToken = async () => { ... }

export { loginUser, registerUser, updateUserProfile };