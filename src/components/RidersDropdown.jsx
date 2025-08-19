import React, { useState, useRef, useEffect } from "react";
import { Truck, User } from "lucide-react";

export const RiderDropdown = ({ currentRider, onRiderChange, orderId, ridersData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const availableRiders = ridersData.filter(rider => rider.status === 'Available');

  // Position the dropdown when it opens
  useEffect(() => {
    if (isOpen && triggerRef.current && menuRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const menu = menuRef.current;
      
      // Menu dimensions
      const menuWidth = 280;
      const menuHeight = 320; // Approximate max height
      
      // Calculate available space
      const spaceBelow = window.innerHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;
      
      // Determine vertical position
      let top;
      if (spaceBelow < menuHeight && spaceAbove > menuHeight) {
        // Position above the trigger
        top = triggerRect.top - menuHeight - 4;
        menu.classList.add('dropdown-above');
      } else {
        // Position below the trigger (default)
        top = triggerRect.bottom + 4;
        menu.classList.remove('dropdown-above');
      }
      
      // Determine horizontal position
      let left = triggerRect.left;
      const rightEdge = left + menuWidth;
      
      if (rightEdge > window.innerWidth - 16) {
        // Align to the right edge of the trigger instead
        left = triggerRect.right - menuWidth;
      }
      
      // Ensure it doesn't go off the left edge
      if (left < 16) {
        left = 16;
      }
      
      menu.style.top = `${Math.max(8, top)}px`;
      menu.style.left = `${left}px`;
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target) &&
          menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleRiderSelect = (rider, e) => {
    e.stopPropagation(); // Prevent event bubbling
    onRiderChange(orderId, rider);
    setIsOpen(false);
  };

  const handleToggleDropdown = (e) => {
    e.stopPropagation(); // Prevent row click event
    setIsOpen(!isOpen);
  };

  const handleDropdownClick = (e) => {
    e.stopPropagation(); // Prevent any click events from bubbling up
  };

  return (
    <div className="rider-dropdown" onClick={handleDropdownClick}>
      <button
        ref={triggerRef}
        className={`rider-dropdown-trigger ${currentRider ? 'rider-assigned' : 'rider-unassigned'}`}
        onClick={handleToggleDropdown}
      >
        <User size={14} />
        <span className="rider-name">
          {currentRider ? currentRider.name : 'Assign Rider'}
        </span>
        <svg 
          className={`dropdown-arrow ${isOpen ? 'open' : ''}`}
          fill="none" 
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div 
          ref={menuRef}
          className="rider-dropdown-menu"
          style={{ position: 'fixed' }}
        >
          <div className="rider-dropdown-content">
            <div className="rider-dropdown-header">Available Riders</div>
            {availableRiders.length > 0 ? (
              availableRiders.map((rider) => (
                <button
                  key={rider.id}
                  className="rider-option"
                  onClick={(e) => handleRiderSelect(rider, e)}
                >
                  <div className="rider-avatar">
                    <User size={16} />
                  </div>
                  <div className="rider-details">
                    <div className="rider-option-name">{rider.name}</div>
                    <div className="rider-option-phone">{rider.phone}</div>
                    <div className="rider-option-vehicle">
                      <Truck size={12} />
                      <span>{rider.vehicle}</span>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="rider-no-available">No available riders</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};