// src/hooks/useCart.js
import { useContext } from 'react';
import CartContext from '../context/CartContext';

const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart phải được sử dụng trong một CartProvider');
  }
  return context;
};

export default useCart;