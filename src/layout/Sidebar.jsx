import React, { useMemo } from 'react';
import { 
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  MessageSquare,
  Activity,
  BarChart,
  LogOut,
  Users,
  TableOfContents, 
  Bike,
  Archive,
  ShoppingCart,
  Layers
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getActiveUser } from '../utils/getActiveUser';
import '../styles/Sidebar.css';

const Sidebar = ({ isOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  // Get active user + subroles
  const activeUser = getActiveUser();
  const userRole = activeUser?.role?.toLowerCase();
  const subroles = activeUser?.subroles || [];

  // Define all sidebar navigation items
  const navItems = [
    { name: 'Dashboard Overview', icon: <LayoutDashboard size={20} />, path: '/', key: 'dashboard' },
    { name: 'Products', icon: <ShoppingBag size={20} />, path: '/products', key: 'products' },
    { name: 'Orders', icon: <ShoppingCart size={20} />, path: '/orders', key: 'orders' },
    { name: 'Payments', icon: <CreditCard size={20} />, path: '/payments', key: 'payments' },
    { name: 'Logistics', icon: <Bike size={20} />, path: '/logistics', key: 'logistics' },
    { name: 'Stocks Management', icon: <Archive size={20} />, path: '/stocks', key: 'stocks' },
    { name: 'Product Categories', icon: <Layers size={20} />, path: '/products-categories', key: 'categories' },
    { name: 'Manage FAQ', icon: <TableOfContents size={20} />, path: '/faq', key: 'faq' },
    { name: 'Messages', icon: <MessageSquare size={20} />, path: '/messages', key: 'messages' },
    { name: 'Activities', icon: <Activity size={20} />, path: '/activities', key: 'activities' },
    { name: 'Analytics', icon: <BarChart size={20} />, path: '/analytics', key: 'analytics' },
    { name: 'Manage accounts', icon: <Users size={20} />, path: '/manage-accounts', key: 'users' },
  ];

  // Role-based permissions
  const rolePermissions = {
    stock: ['stocks'], 
    logistics: ['logistics'],
    support: ['orders', 'payments'], // front desk == support
    supperadmin: navItems.map(i => i.key), // everything
    admin: navItems.map(i => i.key), // fallback if no subroles
    manager: navItems.map(i => i.key).filter(k => !['users', 'dashboard', 'analytics'].includes(k)), 
    accountant: ['dashboard', 'analytics'],
  };

  // Filter navItems
  const filteredNavItems = useMemo(() => {
    if (subroles.length > 0) {
      // Merge all permissions from subroles
      const allowedKeys = subroles.flatMap(sr => rolePermissions[sr.toLowerCase()] || []);
      return navItems.filter(item => allowedKeys.includes(item.key));
    }

    // If no subroles, fallback to role
    const allowed = rolePermissions[userRole] || [];
    return navItems.filter(item => allowed.includes(item.key));
  }, [userRole, subroles]);

  // Handle logout
  const handleLogout = () => {
    localStorage.clear();
    navigate('/sign-in');
  };

  const handleLogoutWithConfirmation = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      handleLogout();
    }
  };

  // Check if path is active
  const isActive = (path) => {
    if (path === '/') return currentPath === '/';
    return currentPath === path || currentPath.startsWith(path + '/');
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
          {filteredNavItems.map((item, index) => (
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
        <button className="logout-button" onClick={handleLogoutWithConfirmation}>
          <LogOut size={20} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
