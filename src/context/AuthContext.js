import React, { createContext, useState, useContext } from 'react'; // <-- thêm useContext

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const login = (userData) => { setUser(userData); };

  const logout = () => { setUser(null); };
  const value = { user, login, logout, isAuthenticated: !!user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ✅ Bổ sung đoạn này
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
