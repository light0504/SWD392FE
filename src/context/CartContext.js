// src/context/CartContext.js
import React, { createContext, useState} from 'react';

// Tạo Context
const CartContext = createContext();

// Tạo Provider Component
export const CartProvider = ({ children }) => {
  // State để lưu trữ các dịch vụ trong giỏ và trạng thái mở/đóng của giỏ hàng
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Hàm thêm dịch vụ vào giỏ hàng
  const addToCart = (serviceToAdd) => {
    // Kiểm tra xem dịch vụ đã có trong giỏ chưa
    const isItemInCart = cartItems.find((item) => item.id === serviceToAdd.id);

    if (isItemInCart) {
      // Nếu đã có, có thể hiển thị thông báo hoặc không làm gì cả
      // Ở đây chúng ta sẽ mở giỏ hàng để người dùng thấy nó đã ở đó
      console.warn("Dịch vụ này đã có trong giỏ hàng.");
    } else {
      // Nếu chưa có, thêm vào mảng cartItems
      setCartItems([...cartItems, { ...serviceToAdd, quantity: 1 }]);
    }
     // Tự động mở giỏ hàng sau khi thêm
    openCart();
  };

  // Hàm xóa dịch vụ khỏi giỏ hàng
  const removeFromCart = (serviceId) => {
    setCartItems(cartItems.filter((item) => item.id !== serviceId));
  };

  // Hàm mở giỏ hàng
  const openCart = () => setIsCartOpen(true);

  // Hàm đóng giỏ hàng
  const closeCart = () => setIsCartOpen(false);
  
  // Các giá trị sẽ được cung cấp cho toàn bộ ứng dụng
  const value = {
    cartItems,
    isCartOpen,
    addToCart,
    removeFromCart,
    openCart,
    closeCart,
    // Giá trị dẫn xuất: tổng số lượng và tổng tiền
    cartItemCount: cartItems.length,
    totalPrice: cartItems.reduce((total, item) => total + item.price, 0),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;