import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, Menu, User, ChevronDown } from 'lucide-react';
import '../styles/Header.css';
import Image from '../assets/profile.png';
import { navItems } from '../constants/data';
import NotificationDialog from '../components/NotificationDialog';
import OutletSwitcher from '../components/OutletSwitcher';
import { getActiveOutlet } from '../utils/getActiveOutlets';
import { useNotifyAdmin } from '../hooks/useNotifyAdmin';
import { getActiveUser } from '../utils/getActiveUser'; 

const Header = ({ toggleSidebar, isMobile }) => {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);
  
  const activeOutlet = getActiveOutlet();
  const activeUserData = getActiveUser(); // Get the object from getActiveUser
  
  // Parse the full user object from localStorage
  const fullUser = activeUserData.user ? JSON.parse(activeUserData.user) : null;
  
  console.log('activeUserData', activeUserData);
  console.log('fullUser', fullUser);
  
  // Destructure refetch from the query hook
  const { data: notifyData, refetch } = useNotifyAdmin(activeOutlet);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };

    if (showProfile) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showProfile]);

  const normalizedPath = location.pathname.replace(/\/+$/, '') || '/';

  let currentPage = 'Hello, Welcome Back!';
  const exactMatch = navItems.find(item => item.path === normalizedPath);
  if (exactMatch) {
    currentPage = exactMatch.name;
  } else {
    const matches = navItems
      .filter(item => item.path !== '/' && normalizedPath.startsWith(item.path + '/'))
      .sort((a, b) => b.path.length - a.path.length);
    if (matches.length > 0) {
      currentPage = matches[0].name;
    }
  }

  // Handle outlet change - the OutletSwitcher will handle its own state management
  const handleOutletChange = () => {
    window.location.reload();
  };

  // Format date for last login
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get user data - combine both sources
  const getUserProfileData = () => {
    return {
      name: activeUserData.name || fullUser?.name || '',
      email: activeUserData.email || fullUser?.email || '',
      address: fullUser?.address || '',
      subroles: activeUserData.subroles || fullUser?.subroles || [],
      whatsappNumber: fullUser?.whatsapp_number || '',
      phoneNumber: fullUser?.phone_number || '',
      lastLogin: formatDate(fullUser?.last_login_at)
    };
  };

  const profileData = getUserProfileData();
  console.log('prof', profileData);

  return (
    <>
      <header className="header">
        <div className="header-wrapper">
          <div className="header-title">
            {isMobile && (
              <button
                className="menu-toggle"
                onClick={toggleSidebar}
                aria-label="Toggle menu"
              >
                <Menu size={20} color="#000" />
              </button>
            )}
            <h1>{currentPage}</h1>
          </div>

          <div className="header-actions">
            {/* Add OutletSwitcher to header actions */}
            <OutletSwitcher 
              onOutletChange={handleOutletChange}
              className="header-outlet-switcher"
            />
            
            <div
              className="notification-badge"
              onClick={() => setShowNotifications(!showNotifications)}
              style={{ cursor: 'pointer' }}
            >
              <Bell size={20} color="#000" />
              {notifyData?.length > 0 && <span className="notification-indicator"></span>}
            </div>

            {/* Updated user profile section with dropdown */}
            <div className="user-profile-section" ref={profileRef}>
              <div 
                className="user-profile-header"
                onClick={() => setShowProfile(!showProfile)}
              >
                <div className="avatar-header">
                  <User size={16} color="#666" />
                </div>
                <span className="username">{profileData.name}</span>
                <ChevronDown 
                  size={14} 
                  className={`profile-chevron ${showProfile ? 'rotated' : ''}`}
                />
              </div>

              {/* Profile Dropdown */}
              {showProfile && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-header">
                    <div className="profile-avatar">
                      <User size={20} color="#666" />
                    </div>
                    <div className="profile-header-info">
                      <h4>{profileData.name}</h4>
                      <span>{activeUserData.role}</span>
                    </div>
                  </div>
                  
                  <div className="profile-dropdown-content">
                    <div className="profile-item">
                      <label>Email</label>
                      <span>{profileData.email}</span>
                    </div>
                    
                    <div className="profile-item address">
                      <label>Address</label>
                      <span>{profileData.address}</span>
                    </div>
                    
                    {profileData.subroles?.length > 0 && (
                      <div className="profile-item">
                        <label>Sub Roles</label>
                        <span>{profileData.subroles.join(', ')}</span>
                      </div>
                    )}
                    
                    <div className="profile-item">
                      <label>WhatsApp</label>
                      <span>{profileData.whatsappNumber}</span>
                    </div>
                    
                    <div className="profile-item">
                      <label>Phone</label>
                      <span>{profileData.phoneNumber}</span>
                    </div>
                    
                    <div className="profile-item">
                      <label>Last Login</label>
                      <span>{profileData.lastLogin}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {showNotifications && (
        <NotificationDialog onClose={() => setShowNotifications(false)} refetch={refetch} notifyData={notifyData} />
      )}
    </>
  );
};

export default Header;