import { useContext} from 'react';
import { AuthContext } from '../context/AuthContext';

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);

//   // Khi tải lại trang, kiểm tra xem có thông tin user trong localStorage không
//   useEffect(() => {
//     const storedUser = localStorage.getItem('user');
//     if (storedUser) {
//       setUser(JSON.parse(storedUser));
//     }
//   }, []);

//   // Hàm login mới, nhận vào toàn bộ dữ liệu từ API
//   const login = (userData) => {
//     setUser(userData);
//     // Lưu thông tin user và token vào localStorage để duy trì đăng nhập
//     localStorage.setItem('user', JSON.stringify(userData));
//     localStorage.setItem('accessToken', userData.accessToken);
//     localStorage.setItem('refreshToken', userData.refreshToken);
//   };

//   const logout = () => {
//     setUser(null);
//     // Xóa khỏi localStorage khi logout
//     localStorage.removeItem('user');
//     localStorage.removeItem('accessToken');
//     localStorage.removeItem('refreshToken');
//   };

//   // Cung cấp user và các hàm cho toàn bộ ứng dụng
//   const value = { user, login, logout };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

// Hook để sử dụng context
export const useAuth = () => {
  return useContext(AuthContext);
};