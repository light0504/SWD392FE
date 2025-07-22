import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import useCart from '../../hooks/useCart';
import './CartSidebar.css';

const CartSidebar = () => {
  // Lấy các state và hàm cần thiết từ CartContext qua hook useCart
  const { 
    isCartOpen,       // Trạng thái (boolean) cho biết giỏ hàng đang mở hay đóng
    closeCart,        // Hàm để đóng giỏ hàng
    cartItems,        // Mảng các object dịch vụ trong giỏ
    removeFromCart,   // Hàm để xóa một dịch vụ khỏi giỏ
    totalPrice        // Tổng giá tiền của các dịch vụ trong giỏ
  } = useCart();

  // Lấy thông tin người dùng từ AuthContext để kiểm tra trạng thái đăng nhập
  const { user } = useAuth();
  
  // Sử dụng hook useNavigate để có thể điều hướng chương trình
  const navigate = useNavigate();

  /**
   * Xử lý sự kiện khi người dùng click vào nút "Tiến Hành Đặt Lịch".
   * Chức năng chính: Điều hướng người dùng đến trang phù hợp.
   */
  const handleCheckout = () => {
    // Luôn đóng sidebar giỏ hàng trước khi điều hướng để có trải nghiệm mượt mà
    closeCart();

    if (user) {
      // TRƯỜNG HỢP 1: NGƯỜI DÙNG ĐÃ ĐĂNG NHẬP
      // Điều hướng thẳng đến trang '/order'.
      // Sử dụng `state` của react-router để "gửi kèm" dữ liệu giỏ hàng.
      // Trang OrderPage sẽ nhận được dữ liệu này và khởi tạo với các dịch vụ đã chọn.
      navigate('/order', { 
        state: { 
          cartItemsFromSidebar: cartItems 
        } 
      });
    } else {
      // TRƯỜNG HỢP 2: NGƯỜI DÙNG CHƯA ĐĂNG NHẬP
      // Điều hướng đến trang '/login' để yêu cầu đăng nhập.
      // Gửi kèm 2 thông tin quan trọng trong `state`:
      // 1. `from`: Để trang Login biết cần quay lại đâu (`/order`) sau khi đăng nhập thành công.
      // 2. `cartItemsFromSidebar`: Để "giữ lại" giỏ hàng và chuyển tiếp nó đến trang Order sau khi đăng nhập.
      navigate('/login', {
        state: {
          from: { pathname: '/order' },
          cartItemsFromSidebar: cartItems
        }
      });
    }
  };

  return (
    // Sử dụng Fragment (<>) để nhóm các phần tử mà không tạo thêm thẻ div thừa
    <>
      {/* Lớp phủ màu đen phía sau, click vào sẽ đóng giỏ hàng */}
      <div 
        className={`cart-overlay ${isCartOpen ? 'open' : ''}`}
        onClick={closeCart}
      ></div>
      
      {/* Sidebar chính của giỏ hàng */}
      <div className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
        
        {/* Header của giỏ hàng */}
        <div className="cart-header">
          <h3>Giỏ Dịch Vụ Của Bạn</h3>
          <button onClick={closeCart} className="cart-close-btn">×</button>
        </div>
        
        {/* Phần thân chứa danh sách dịch vụ */}
        <div className="cart-body">
          {cartItems.length === 0 ? (
            // Hiển thị thông báo khi giỏ hàng trống
            <div className="cart-empty">
              <p>Giỏ hàng của bạn đang trống.</p>
              <p>Hãy chọn thêm dịch vụ để chăm sóc thú cưng nhé!</p>
            </div>
          ) : (
            // Hiển thị danh sách các dịch vụ đã chọn
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

        {/* Phần chân giỏ hàng, chỉ hiển thị khi có sản phẩm */}
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