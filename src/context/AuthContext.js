import React, { createContext, useState, useEffect} from 'react'; // <-- thêm useContext
import { loginUser} from '../api/authAPI'; // Giả sử bạn đã tạo file authAPI.js trong thư mục api

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
        try {
            // 1. Tải thông tin người dùng từ localStorage
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Lỗi khi đọc dữ liệu người dùng từ localStorage:", error);
            // Nếu có lỗi, đảm bảo user là null
            localStorage.removeItem('user');
        } finally {
            // Đánh dấu là đã tải xong
            setLoading(false);
        }

        // 2. Lắng nghe sự kiện 'storage' để đồng bộ giữa các tab
        const handleStorageChange = (event) => {
            if (event.key === 'user') {
                if (event.newValue) {
                    // Nếu một tab khác đăng nhập, cập nhật tab hiện tại
                    setUser(JSON.parse(event.newValue));
                } else {
                    // Nếu một tab khác đăng xuất, cũng đăng xuất ở tab hiện tại
                    setUser(null);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Dọn dẹp listener khi component unmount
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

  const login = async (email, password) => {
    try {
      const response = await loginUser(email, password);
      console.log("Login response:", response);
      if (response.isSuccess && response.data) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);

        return { success: true, data: response.data };
      } else {
        return { success: false, message: response.message || 'Login failed' };
      }
    } catch (error) {
      return { success: false, message: error.message || 'An error occurred' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/*
import React, { createContext, useState, useEffect, useContext } from 'react';
import { loginUser as apiLoginUser } from '../api/authAPI'; // Đổi tên để tránh trùng lặp

// Tạo Context
export const AuthContext = createContext(null);

// Tạo Provider Component
export const AuthProvider = ({ children }) => {
    // State để lưu thông tin người dùng
    const [user, setUser] = useState(null);
    // State để xử lý việc tải dữ liệu ban đầu từ localStorage
    const [loading, setLoading] = useState(true);

    // Effect này sẽ chạy một lần duy nhất khi ứng dụng khởi động
    useEffect(() => {
        try {
            // 1. Tải thông tin người dùng từ localStorage
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Lỗi khi đọc dữ liệu người dùng từ localStorage:", error);
            // Nếu có lỗi, đảm bảo user là null
            localStorage.removeItem('user');
        } finally {
            // Đánh dấu là đã tải xong
            setLoading(false);
        }

        // 2. Lắng nghe sự kiện 'storage' để đồng bộ giữa các tab
        const handleStorageChange = (event) => {
            if (event.key === 'user') {
                if (event.newValue) {
                    // Nếu một tab khác đăng nhập, cập nhật tab hiện tại
                    setUser(JSON.parse(event.newValue));
                } else {
                    // Nếu một tab khác đăng xuất, cũng đăng xuất ở tab hiện tại
                    setUser(null);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Dọn dẹp listener khi component unmount
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []); // Mảng rỗng đảm bảo chỉ chạy một lần

    // Hàm đăng nhập, gọi API và cập nhật state/localStorage
    const login = async (email, password) => {
        try {
            const response = await apiLoginUser({ email, password });
            if (response.isSuccess && response.data) {
                setUser(response.data);
                // CHUYỂN SANG SỬ DỤNG localStorage
                localStorage.setItem('user', JSON.stringify(response.data));
                localStorage.setItem('accessToken', response.data.accessToken);
                localStorage.setItem('refreshToken', response.data.refreshToken);

                return { success: true, data: response.data };
            } else {
                return { success: false, message: response.message || 'Đăng nhập thất bại' };
            }
        } catch (error) {
            return { success: false, message: error.message || 'Đã có lỗi xảy ra' };
        }
    };

    // Hàm đăng xuất
    const logout = () => {
        setUser(null);
        // XÓA DỮ LIỆU KHỎI localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    };

    // Giá trị được cung cấp cho toàn bộ ứng dụng
    const value = {
        user,
        loading, // Cung cấp trạng thái loading
        login,
        logout,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
*/
