import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, Menu } from 'lucide-react';
import '../styles/Header.css';
import Image from '../assets/profile.png';

const navItems = [
  { name: 'Hello, Welcome Back!', path: '/' },
  { name: 'Orders', path: '/orders' },
  { name: 'Product Categories', path: '/products-categories' },
  { name: 'Products', path: '/products' },
  { name: 'Payments', path: '/payments' },
  { name: 'Messages', path: '/messages' },
  { name: 'Activities', path: '/activities' },
  { name: 'Analytics', path: '/analytics' },
  { name: 'Settings', path: '/settings' },
  { name: 'Manage Accounts', path: '/manage-accounts' },
];

const Header = ({ toggleSidebar, isMobile }) => {
  const location = useLocation();
  
  const normalizedPath = location.pathname.replace(/\/+$/, '') || '/';
  
  // Find exact match first, then fallback to prefix matching
  let currentPage = 'Hello, Welcome Back!';
  
  // First, try to find an exact match
  const exactMatch = navItems.find(item => item.path === normalizedPath);
  if (exactMatch) {
    currentPage = exactMatch.name;
  } else {
    // If no exact match, find the longest matching prefix (excluding root)
    const matches = navItems
      .filter(item => {
        if (item.path === '/') return false; // Skip root for prefix matching
        return normalizedPath.startsWith(item.path + '/');
      })
      .sort((a, b) => b.path.length - a.path.length);
    
    if (matches.length > 0) {
      currentPage = matches[0].name;
    } else if (normalizedPath === '/') {
      currentPage = 'Hello, Welcome Back!';
    }
  }
    
  return (
    <header className="header">
      <div className="header-wrapper">
        {/* Left section with title and toggle button */}
        <div className="header-title">
          {isMobile && (
            <button
              className="menu-toggle"
              onClick={toggleSidebar}
              aria-label="Toggle menu"
            >
              <Menu size={20} color='#000' />
            </button>
          )}
          <h1>{currentPage}</h1>
        </div>

        {/* Right section with search and user info */}
        <div className="header-actions">
          {/* <div className="search-container">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search for anything..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div> */}
                   
          <div className="user-section">
            <div className="notification-badge">
              <Bell size={20} color='#000' />
              <span className="notification-indicator"></span>
            </div>
                       
            <div className="user-profile">
              <div className="avatar">
                <img src={Image} alt="John David" />
              </div>
              <span className="username">John David</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;