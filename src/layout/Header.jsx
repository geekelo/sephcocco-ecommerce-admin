import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, Menu } from 'lucide-react';
import '../styles/Header.css';
import Image from '../assets/profile.png';

const navItems = [
  { name: 'Hello, Welcome Back!', path: '/' },
  { name: 'Orders', path: '/orders' },
  { name: 'Products', path: '/products' },
  { name: 'Payments', path: '/payments' },
  { name: 'Messages', path: '/messages' },
  { name: 'Activities', path: '/activities' },
  { name: 'Analytics', path: '/analytics' },
  { name: 'Settings', path: '/settings' },
];

const Header = ({ toggleSidebar, isMobile }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const currentPage = navItems.find(item => location.pathname.startsWith(item.path))?.name || 'Dashboard';

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
