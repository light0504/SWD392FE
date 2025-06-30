import React, { createContext, useState } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (role) => {
    // Backend sẽ trả về thông tin user sau khi login thành công
    const mockUserData = {
      'Customer': { name: 'Khách Hàng Vip', role: 'Customer' },
      'Staff': { name: 'Nhân viên An', role: 'Staff' },
      'Manager': { name: 'Quản lý Bình', role: 'Manager' }
    };
    setUser(mockUserData[role] || null);
  };

  const logout = () => { setUser(null); };
  const value = { user, login, logout, isAuthenticated: !!user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};