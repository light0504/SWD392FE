// src/App.js
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext'; // <-- IMPORT MỚI
import AppRouter from './router/AppRouter';
import './index.css';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider> {/* <-- BỌC ỨNG DỤNG BẰNG CART PROVIDER */}
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;