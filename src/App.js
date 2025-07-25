// src/App.js
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext'; // <-- IMPORT MỚI
import AppRouter from './router/AppRouter';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import './App.css';

function App() {
  return (
    <HelmetProvider>
    <AuthProvider>
      <CartProvider> {/* <-- BỌC ỨNG DỤNG BẰNG CART PROVIDER */}
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
    </HelmetProvider>
  );
}

export default App;