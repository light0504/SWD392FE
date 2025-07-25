import React, { createContext, useState, useEffect} from 'react';

// Tạo Context
const CartContext = createContext();

// Tạo Provider Component
export const CartProvider = ({ children }) => {
    // State chính để lưu trữ các dịch vụ trong giỏ
    const [cartItems, setCartItems] = useState(() => {
        // Khởi tạo state trực tiếp từ localStorage để tránh "nhấp nháy" (flickering)
        try {
            const savedCart = localStorage.getItem('cartItems');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error("Failed to parse initial cart items from localStorage", error);
            return [];
        }
    });

    // State để quản lý việc mở/đóng sidebar giỏ hàng
    const [isCartOpen, setIsCartOpen] = useState(false);

    // --- EFFECT MỚI: LẮNG NGHE SỰ THAY ĐỔI TỪ CÁC TAB KHÁC ---
    useEffect(() => {
        const handleStorageChange = (event) => {
            // Chỉ xử lý khi 'cartItems' bị thay đổi
            if (event.key === 'cartItems') {
                try {
                    // Cập nhật state của tab hiện tại với dữ liệu mới từ localStorage
                    const newCartItems = event.newValue ? JSON.parse(event.newValue) : [];
                    setCartItems(newCartItems);
                } catch (error) {
                    console.error("Failed to parse updated cart items from storage event", error);
                }
            }
        };

        // Đăng ký lắng nghe sự kiện 'storage'
        window.addEventListener('storage', handleStorageChange);

        // Dọn dẹp: Gỡ bỏ lắng nghe sự kiện khi component bị unmount
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []); // Mảng phụ thuộc rỗng đảm bảo effect chỉ chạy một lần


    // Sử dụng useEffect để lưu giỏ hàng vào localStorage mỗi khi nó thay đổi
    useEffect(() => {
        try {
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
        } catch (error) {
            console.error("Failed to save cart items to localStorage", error);
        }
    }, [cartItems]);

    // --- CÁC HÀM XỬ LÝ GIỎ HÀNG ---
    const addToCart = (service) => {
        setCartItems(prevItems => {
            const isItemInCart = prevItems.find(item => item.id === service.id);
            if (isItemInCart) {
                alert(`${service.name} đã có trong giỏ hàng.`);
                return prevItems;
            }
            return [...prevItems, service];
        });
        openCart();
    };

    const removeFromCart = (serviceId) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== serviceId));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    // --- CÁC HÀM QUẢN LÝ GIAO DIỆN ---
    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);

    // Tính toán tổng giá tiền và số lượng item
    const cartItemCount = cartItems.length;
    const totalPrice = cartItems.reduce((total, item) => total + item.price, 0);

    // Giá trị sẽ được cung cấp cho toàn bộ ứng dụng
    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
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

export default CartContext; 
// Hook tùy chỉnh để sử dụng CartContext dễ dàng hơn