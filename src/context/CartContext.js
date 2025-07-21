import React, { createContext, useState, useEffect } from 'react';

// Tạo Context
const CartContext = createContext();

// Tạo Provider Component
const CartProvider = ({ children }) => {
    // State chính để lưu trữ các dịch vụ trong giỏ
    const [cartItems, setCartItems] = useState([]);
    // State để quản lý việc mở/đóng sidebar giỏ hàng
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Sử dụng useEffect để tải giỏ hàng từ localStorage khi ứng dụng khởi động
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem('cartItems');
            if (savedCart) {
                setCartItems(JSON.parse(savedCart));
            }
        } catch (error) {
            console.error("Failed to parse cart items from localStorage", error);
        }
    }, []);

    // Sử dụng useEffect để lưu giỏ hàng vào localStorage mỗi khi nó thay đổi
    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    // --- CÁC HÀM XỬ LÝ GIỎ HÀNG ---

    const addToCart = (service) => {
        setCartItems(prevItems => {
            // Kiểm tra xem dịch vụ đã có trong giỏ chưa
            const isItemInCart = prevItems.find(item => item.id === service.id);
            if (isItemInCart) {
                // Nếu đã có, có thể bạn muốn tăng số lượng, nhưng ở đây ta chỉ cần thông báo
                alert(`${service.name} đã có trong giỏ hàng.`);
                return prevItems;
            }
            // Nếu chưa có, thêm vào giỏ
            return [...prevItems, service];
        });
        // Tự động mở giỏ hàng khi thêm sản phẩm mới
        openCart();
    };

    const removeFromCart = (serviceId) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== serviceId));
    };

    // --- HÀM MỚI ĐỂ XÓA TOÀN BỘ GIỎ HÀNG ---
    const clearCart = () => {
        setCartItems([]); // Đơn giản là đặt lại mảng về rỗng
    };

    // --- CÁC HÀM QUẢN LÝ GIAO DIỆN ---

    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);

    // Tính toán tổng giá tiền và số lượng item mỗi khi giỏ hàng thay đổi
    const cartItemCount = cartItems.length;
    const totalPrice = cartItems.reduce((total, item) => total + item.price, 0);

    // Giá trị sẽ được cung cấp cho toàn bộ ứng dụng
    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        clearCart, // <-- Cung cấp hàm này
        cartItemCount,
        totalPrice,
        isCartOpen,
        openCart,
        closeCart,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export { CartProvider, CartContext };
export default CartContext;