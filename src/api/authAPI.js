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
 * Gửi thông tin để đăng ký tài khoản mới.
 * @param {object} userData - Thông tin người dùng mới.
 * @returns {Promise<object>}
 */
const registerUser = async (userData) => {
    try {
        const response = await apiClient.post('/Auth/register', userData);
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

export { loginUser, registerUser };