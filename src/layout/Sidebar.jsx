// src/components/Sidebar.jsx
import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  CreditCard, 
  MessageSquare, 
  Activity, 
  BarChart, 
  Settings,
  LogOut,
  Users
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Sidebar.css';

const Sidebar = ({ isOpen }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Define sidebar navigation items
  const navItems = [
    { name: 'Dashboard Overview', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Orders', icon: <ShoppingBag size={20} />, path: '/orders' },
    { name: 'Products', icon: <ShoppingBag size={20} />, path: '/products' },
    { name: 'Payments', icon: <CreditCard size={20} />, path: '/payments' },
    { name: 'Messages', icon: <MessageSquare size={20} />, path: '/messages' },
    { name: 'Activities', icon: <Activity size={20} />, path: '/activities' },
    { name: 'Analytics', icon: <BarChart size={20} />, path: '/analytics' },
        { name: 'Manage accounts', icon: <Users size={20} />, path: '/manage-accounts' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  ];

  // Check if the current path matches an item's path
  const isActive = (path) => {
    return currentPath === path || 
           (path !== '/' && currentPath.startsWith(path));
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-container-side">
          <img src="/logo.png" alt="Logo" className="logo" />
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {navItems.map((item, index) => (
            <li key={index} className={`nav-item ${isActive(item.path) ? 'active' : ''}`}>
              <Link to={item.path} className="nav-link">
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-button">
          <LogOut size={20} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;