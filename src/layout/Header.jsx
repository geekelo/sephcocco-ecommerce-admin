
import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell
} from 'lucide-react';
import '../styles/Header.css';
import Image from '../assets/profile.png'
const Header = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <header className="header">
      <div className="header-wrapper">
        {/* Left section with title */}
        <div className="header-title">
          <h1>Products</h1>
        </div>

        {/* Right section with search and user info */}
        <div className="header-actions">
          <div className="search-container">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search for anything..." 
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>
          
          <div className="user-section">
            <div className="notification-badge">
              <Bell size={20} />
              <span className="notification-indicator"></span>
            </div>
            
            <div className="user-profile">
              <div className="avatar">
                <img src={Profile} alt="John David" />
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