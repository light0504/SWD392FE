// src/components/CartSidebar/CartSidebar.js
import React from 'react';
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
                    <span className="item-title">{item.title}</span>
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
                <span className="total-price">{totalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
              </div>
              <button className="btn-checkout">Tiến Hành Đặt Lịch</button>
           </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;