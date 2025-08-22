import React, { useState, useRef, useEffect } from "react";
import { Truck, User, Loader2 } from "lucide-react";
import '../styles/RidersDropdown.css'
import { useAssignRider } from "../hooks/useAssignRider";
import { getActiveOutlet } from "../utils/getActiveOutlets";

export const RiderDropdown = ({ currentRider, ridersData = [], shippingId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const activeOutlet = getActiveOutlet();
  const assignRiderMutation = useAssignRider();
console.log('id',shippingId);

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

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleRiderSelect = async (rider, e) => {
    e?.stopPropagation(); // Prevent event bubbling
    
    // Validate rider and required props
    if (!rider) {
      console.error('Missing required props for rider selection');
      return;
    }

    // Check if we have shippingId for API call
    if (!shippingId) {
      console.error('shippingId is required for rider assignment API call');
      return;
    }

    setIsAssigning(true);

    try {
      // Call the API to assign rider
      const response = await assignRiderMutation.mutateAsync({
        active_outlet: activeOutlet,
        riderId: rider.id,
        shippingId: shippingId
      });

      console.log('Rider assigned successfully:', response);

 

      setIsOpen(false);
      
      // Show success message (optional)
      // You could use a toast notification here
      console.log(`Successfully assigned ${rider.name} to shipping ${shippingId}`);

    } catch (error) {
      console.error('Error assigning rider:', error);
      
      // Show error message to user (optional)
      // You could use a toast notification here
      alert(`Failed to assign rider: ${error.message || 'Unknown error'}`);
      
    } finally {
      setIsAssigning(false);
    }
  };

  const handleToggleDropdown = (e) => {
    e?.stopPropagation(); // Prevent row click event
    
    // Don't open dropdown if currently assigning
    if (isAssigning) return;
    
    setIsOpen(!isOpen);
  };

  const handleDropdownClick = (e) => {
    e?.stopPropagation(); // Prevent any click events from bubbling up
  };



  // Handle case where ridersData might be null/undefined
  if (!ridersData || !Array.isArray(ridersData)) {
    console.warn('ridersData is not a valid array:', ridersData);
    return (
      <div className="rider-dropdown error">
        <span>Error loading riders</span>
      </div>
    );
  }

  return (
    <div className="rider-dropdown" onClick={handleDropdownClick}>
      <button
        ref={triggerRef}
        className={`rider-dropdown-trigger ${currentRider ? 'rider-assigned' : 'rider-unassigned'} ${isAssigning ? 'assigning' : ''}`}
        onClick={handleToggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        disabled={isAssigning}
      >
        {isAssigning ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <User size={14} />
        )}
        <span className="rider-name">
          {isAssigning 
            ? 'Assigning...' 
            : currentRider?.name || 'Assign Rider'
          }
        </span>
        <svg 
          className={`dropdown-arrow ${isOpen ? 'open' : ''}`}
          fill="none" 
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && !isAssigning && (
        <div 
          ref={menuRef}
          className="rider-dropdown-menu"
          style={{ position: 'fixed' }}
          role="listbox"
        >
          <div className="rider-dropdown-content">
            <div className="rider-dropdown-header">Available Riders</div>
            {ridersData?.length > 0 ? (
              ridersData?.map((rider) => (
                <button
                  key={rider.id || `rider-${Math.random()}`}
                  className="rider-option"
                  onClick={(e) => handleRiderSelect(rider, e)}
                  role="option"
                  aria-selected={currentRider?.id === rider.id}
                  disabled={assignRiderMutation.isPending}
                >
                  <div className="rider-avatar">
                    <User size={16} />
                  </div>
                  <div className="rider-details">
                    <div className="rider-option-name">{rider.name || 'Unknown'}</div>
                    <div className="rider-option-phone">{rider.phone || rider.phone_number || 'No phone'}</div>
               
                  </div>
                </button>
              ))
            ) : (
              <div className="rider-no-available">
                {ridersData.length === 0 ? 'No riders found' : 'No available riders'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};