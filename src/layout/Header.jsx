import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, Menu } from 'lucide-react';
import '../styles/Header.css';
import Image from '../assets/profile.png';
import { navItems } from '../constants/data';
import NotificationDialog from '../components/NotificationDialog';
import OutletSwitcher from '../components/OutletSwitcher'; // Add this import
import { getActiveOutlet } from '../utils/getActiveOutlets';
import { useNotifyAdmin } from '../hooks/useNotifyAdmin';
import { useViewAllProduct } from '../hooks/useGetAllProduct';

const Header = ({ toggleSidebar, isMobile }) => {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const activeOutlet = getActiveOutlet();
  const user = localStorage.getItem('userName')
  
  // Destructure refetch from the query hook
  const { data: notifyData, refetch } = useNotifyAdmin(activeOutlet);

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
window.location.reload()
  };

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

            <div className="user-profile-header">
              {/* <div className="avatar-header">
                <img src={Image} alt="John David" />
              </div> */}
              <span className="username">{user}</span>
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