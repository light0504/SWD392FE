import axios from 'axios';

const API_BASE_URL = 'https://localhost:7191/api';

// Tạo một instance của axios với cấu hình sẵn
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor để tự động đính kèm Access Token vào mỗi yêu cầu API.
 * Nó lấy token từ localStorage (nơi chúng ta lưu sau khi đăng nhập).
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;