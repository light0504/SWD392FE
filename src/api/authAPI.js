import apiClient from './api'; // Sử dụng instance đã cấu hình

/**
 * Gửi thông tin đăng nhập (email, password) để xác thực người dùng.
 * @param {object} credentials - Đối tượng chứa { email, password }.
 * @returns {Promise<object>}
 */
const loginUser = async (credentials) => {
  try {
    const response = await apiClient.post('/Auth/login', credentials);
    return response.data;
  } catch (error) {
    console.error("Error during login:", error);
    // Thay vì throw, chúng ta có thể trả về lỗi để component xử lý
    if (error.response && error.response.data) {
        return error.response.data;
    }
    throw error; // Ném lỗi mạng hoặc lỗi không xác định
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