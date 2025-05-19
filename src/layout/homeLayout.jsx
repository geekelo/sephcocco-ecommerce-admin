import React from 'react'
import Header from './Header';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';
import '../styles/Layout.css'
export default function HomeLayout() {

  return (
    <div className="layout">
      <Header />
      
      <main className="main">
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
}
