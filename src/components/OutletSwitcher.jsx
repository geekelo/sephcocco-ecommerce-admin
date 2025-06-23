import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Store, Check } from 'lucide-react';
import Cookies from 'js-cookie';
import { getStoreIcon } from '../utils/getStoreIcon';
import '../styles/OutletSwitcher.css';

const OutletSwitcher = ({ onOutletChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [outlets, setOutlets] = useState([]);
  const [activeOutlet, setActiveOutlet] = useState('');

  const dropdownRef = useRef(null);

  useEffect(() => {
    loadOutlets();
    loadActiveOutlet();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const loadOutlets = () => {
    try {
      const outletsFromCookies = Cookies.get('outlets');
      if (outletsFromCookies) {
        const parsedOutlets = JSON.parse(outletsFromCookies);
        setOutlets(Array.isArray(parsedOutlets) ? parsedOutlets : []);
      } else {
        console.warn('No outlets found in cookies');
        setOutlets([]);
      }
    } catch (error) {
      console.error('Error parsing outlets from cookies:', error);
      setOutlets([]);
    } finally {
     
    }
  };

  const loadActiveOutlet = () => {
    const activeOutletFromCookies = Cookies.get('activeOutlet');
    if (activeOutletFromCookies) {
      setActiveOutlet(String(activeOutletFromCookies).trim());
    } else {
      // Set first outlet as default if no active outlet is set
      const outletsFromCookies = Cookies.get('outlets');
      if (outletsFromCookies) {
        try {
          const parsedOutlets = JSON.parse(outletsFromCookies);
          if (Array.isArray(parsedOutlets) && parsedOutlets.length > 0) {
            setActiveOutlet(parsedOutlets[0]);
          }
        } catch (error) {
          console.error('Error setting default outlet:', error);
        }
      }
    }
  };

  const handleOutletSwitch = (outlet) => {
    try {
      // Update the active outlet cookie
      Cookies.set('activeOutlet', outlet, { expires: 1 });
      setActiveOutlet(outlet);
      setIsOpen(false);
      
      // Trigger callback if provided
      if (onOutletChange) {
        onOutletChange(outlet);
      }
      
      // Refresh the page to reload data for the new outlet
      window.location.reload();
    } catch (error) {
      console.error('Error switching outlet:', error);
    }
  };


  if (outlets.length === 0) {
    return (
      <div className={`outlet-switcher empty ${className}`}>
        <div className="outlet-switcher-trigger">
          <Store size={16} />
          <span>No outlets</span>
        </div>
      </div>
    );
  }

  if (outlets.length === 1) {
    return (
      <div className={`outlet-switcher single ${className}`}>
        <div className="outlet-switcher-trigger">
          {getStoreIcon(outlets[0])}
          <span style={{ textTransform: 'capitalize' }}>{outlets[0]}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`outlet-switcher ${className}`} ref={dropdownRef}>
      <button
        className="outlet-switcher-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="outlet-info">
          {getStoreIcon(activeOutlet)}
          <span style={{ textTransform: 'capitalize' }}>
            {activeOutlet || 'Select Outlet'}
          </span>
        </div>
        <ChevronDown 
          size={16} 
          className={`chevron ${isOpen ? 'rotated' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="outlet-dropdown">
          <div className="outlet-dropdown-header">
            <Store size={14} />
            <span>Switch Outlet</span>
          </div>
          <div className="outlet-list">
            {outlets.map((outlet) => (
              <button
                key={outlet}
                className={`outlet-option ${activeOutlet === outlet ? 'active' : ''}`}
                onClick={() => handleOutletSwitch(outlet)}
              >
                <div className="outlet-option-content">
                  {getStoreIcon(outlet)}
                  <span style={{ textTransform: 'capitalize' }}>{outlet}</span>
                </div>
                {activeOutlet === outlet && (
                  <Check size={14} className="check-icon" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OutletSwitcher;