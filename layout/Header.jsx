import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  User,
  ShoppingCart,
  Menu,
  X,
  CircleHelp,
  CircleUserRound,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/Header.css';
import SearchFilter from '../components/SearchFilter';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation(); // Get current location from react-router
  const currentPath = location.pathname;
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  const navLinks = [
    { name: 'Products', href: '/products' },
    { name: 'Pending', href: '/pending-orders' },
    { name: 'Completed', href: '/completed-orders' },
    { name: 'Messages', href: '/messages' },
    { name: 'Stores', href: '#', isDropdown: true },
    { name: 'Payment History', href: '/payment-history' },
  ];

  const storeOptions = ['Pharmacy', 'Lounge', 'Restaurant'];
  const filterOptions = ['Price: Low to High', 'Price: High to Low', 'Newest First', 'Categories', 'Rating'];

  // Check if a link is active based on current path
  const isLinkActive = (linkHref) => {
    if (linkHref === '#') return false; // Don't mark dropdown toggle as active
    
    // Exact match
    if (currentPath === linkHref) return true;
    
    // Special case for home page
    if (linkHref === '/' && currentPath === '/') return true;
    
    // Check if current path starts with link path (for nested routes)
    // But only if the linkHref is not just '/'
    if (linkHref !== '/' && currentPath.startsWith(linkHref)) return true;
    
    return false;
  };

  // Define handleResize before using it in useEffect
  const handleResize = () => {
    const isMobileView = window.innerWidth <= 768;
    setIsMobile(isMobileView);
    
    // Close mobile menu when switching to desktop
    if (!isMobileView && isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  // Check if mobile on initial load
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Set initial state
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const toggleStoreDropdown = (e) => {
    e.preventDefault();
    setStoreDropdownOpen(prev => !prev);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    console.log('Searching for:', term);
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    console.log('Filter changed to:', filter);
  };

  return (
    <header className="header">
      <div className="header-wrapper">

        {/* Logo */}
        <div className="logo-section">
          <div className="logo-container-header">
            <img src="/logo.png" alt="Logo" className="logo" />
          </div>
        </div>

        {/* Mobile Toggle */}
        <div className="mobile-menu-icon">
          <button onClick={toggleMenu} className="menu-toggle-button">
            {isMenuOpen ? <X size={20} color="#ff4500" /> : <Menu size={20} />}
          </button>
        </div>

        {/* Desktop Nav */}
        <nav className="nav-section desktop-only">
          <div className="nav-links">
            {navLinks.map((link, index) => {
              if (link.isDropdown) {
                return (
                  <div key={index} className="dropdown">
                    <Link to='#' className="nav-link dropdown-toggle">
                      {link.name} <span className="dropdown-icon-wrapper"><ChevronDown size={16} className="dropdown-chevron" /></span>
                    </Link>
                    <div className="dropdown-menu">
                      {storeOptions.map((store, idx) => (
                        <Link 
                          key={idx} 
                          to={`/stores/${store.toLowerCase()}`} 
                          className={`dropdown-item ${isLinkActive(`/stores/${store.toLowerCase()}`) ? 'active-link' : ''}`}
                        >
                          {store}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              } else {
                return (
                  <Link 
                    key={index} 
                    to={link.href} 
                    className={`nav-link ${isLinkActive(link.href) ? 'active-link' : ''}`}
                  >
                    {link.name}
                  </Link>
                );
              }
            })}
          </div>
        </nav>

        {/* Desktop Actions */}
        <div className="actions-section desktop-only">
          <SearchFilter
            placeholder="Search here..."
            filterOptions={filterOptions}
            defaultFilter={selectedFilter}
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            className="desktop-search-filter"
          />
          <div className="header-icons">
            <button className="mobile-icon-button" aria-label="Help" title="Help">
              <CircleHelp size={24} />
            </button>
            <button className="mobile-icon-button" aria-label="User Profile" title="User Profile">
              <CircleUserRound size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Slide-in Menu - Only render when actually in mobile mode */}
        <AnimatePresence>
          {isMenuOpen && isMobile && (
            <motion.div
              className="mobile-slide-menu"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
            >
              {/* Logo on Mobile */}
              <div className="mobile-menu-header">
                <div className="logo-container-header">
                  <img src="/logo.png" alt="Logo" className="logo" />
                </div>
              </div>

              {/* Nav Links */}
              <div className="mobile-nav-links-container">
                <div className="mobile-nav-links">
                  {navLinks.map((link, index) => {
                    if (link.isDropdown) {
                      return (
                        <div key={index} className="mobile-dropdown">
                          <a href="#" className="mobile-nav-link" onClick={toggleStoreDropdown}>
                            {link.name} <ChevronDown size={16} className={storeDropdownOpen ? "chevron-rotated" : ""} />
                          </a>
                          <AnimatePresence>
                            {storeDropdownOpen && (
                              <motion.div
                                className="mobile-dropdown-menu store-dropdown"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                {storeOptions.map((store, idx) => (
                                  <Link 
                                    key={idx} 
                                    to={`/stores/${store.toLowerCase()}`} 
                                    className={`mobile-dropdown-item ${isLinkActive(`/stores/${store.toLowerCase()}`) ? 'active-link' : ''}`}
                                  >
                                    {store}
                                  </Link>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    } else {
                      return (
                        <Link 
                          key={index} 
                          to={link.href} 
                          className={`mobile-nav-link ${isLinkActive(link.href) ? 'active-link' : ''}`}
                        >
                          {link.name}
                        </Link>
                      );
                    }
                  })}
                </div>
              </div>

              {/* User Actions */}
              <div className="mobile-user-actions">
                <button className="mobile-icon-button" aria-label="Help" title="Help">
                  <CircleHelp size={24} />
                </button>
                <button className="mobile-icon-button" aria-label="User Profile" title="User Profile">
                  <CircleUserRound size={24} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;