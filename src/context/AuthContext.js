import React, { createContext, useState, useContext } from 'react'; // <-- thêm useContext
import { loginUser} from '../api/authAPI'; // Giả sử bạn đã tạo file authAPI.js trong thư mục api

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = async (email, password) => {
    try {
      const response = await loginUser(email, password);
      if (response.isSuccess && response.data) {
        setUser(response.data);
        sessionStorage.setItem('user', JSON.stringify(response.data));
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
    sessionStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
