// src/components/CartSidebar/CartSidebar.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import useCart from '../../hooks/useCart';
import './CartSidebar.css';

const CartSidebar = () => {
  const { 
    isCartOpen, 
    closeCart, 
    cartItems, 
    removeFromCart, 
    totalPrice 
  } = useCart();

  const { user } = useAuth(); // Lấy thông tin người dùng
  const navigate = useNavigate(); // Hook để điều hướng

const handleCheckout = () => {
    // Đóng giỏ hàng trước khi điều hướng
    closeCart();

    if (user) {
      // --- TRƯỜNG HỢP 1: NGƯỜI DÙNG ĐÃ ĐĂNG NHẬP ---
      // Điều hướng thẳng đến trang Order và gửi kèm dữ liệu giỏ hàng qua state
      navigate('/order', { 
        state: { 
          cartItemsFromSidebar: cartItems 
        } 
      });
    } else {
      // --- TRƯỜNG HỢP 2: NGƯỜI DÙNG CHƯA ĐĂNG NHẬP ---
      // Điều hướng đến trang Login.
      // Gửi kèm 2 thông tin quan trọng:
      // 1. `from`: để sau khi login biết cần quay về đâu (`/order`).
      // 2. `cartItemsFromSidebar`: để sau khi login, trang Order có thể nhận được dữ liệu.
      navigate('/login', {
        state: {
          from: { pathname: '/order' },
          cartItemsFromSidebar: cartItems
        }
      });
    }
  };


  return (
    <>
      <div 
        className={`cart-overlay ${isCartOpen ? 'open' : ''}`}
        onClick={closeCart}
      ></div>
      <div className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h3>Giỏ Dịch Vụ Của Bạn</h3>
          <button onClick={closeCart} className="cart-close-btn">×</button>
        </div>
        
        <div className="cart-body">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <p>Giỏ hàng của bạn đang trống.</p>
              <p>Hãy chọn thêm dịch vụ để chăm sóc thú cưng nhé!</p>
            </div>
          ) : (
            <ul className="cart-items-list">
              {cartItems.map(item => (
                <li key={item.id} className="cart-item">
                  <div className="item-info">
                    <span className="item-title">{item.name}</span>
                    <span className="item-price">{item.price.toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="item-remove-btn">Xóa</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cartItems.length > 0 && (
           <div className="cart-footer">
              <div className="cart-total">
                <span>Tổng cộng:</span>
                <span className="total-price">{totalPrice.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <button className="btn-checkout" onClick={handleCheckout}>
                Tiến Hành Đặt Lịch
              </button>
           </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;