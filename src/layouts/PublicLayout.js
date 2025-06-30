// src/layouts/PublicLayout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../sections/Header/Header';
import Footer from '../sections/Footer/Footer'; 
import CartSidebar from '../components/CartSidebar/CartSidebar'; // <-- IMPORT MỚI

const PublicLayout = () => {
  return (
    <>
      <Header />
      <main className="main-content">
        <Outlet /> 
      </main>
      <Footer />
      <CartSidebar /> {/* <-- THÊM COMPONENT GIỎ HÀNG VÀO ĐÂY */}
    </>
  );
};

export default PublicLayout;