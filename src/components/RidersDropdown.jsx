import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Truck, User, Loader2 } from "lucide-react";
import '../styles/RidersDropdown.css'
import { useAssignRider } from "../hooks/useAssignRider";
import { getActiveOutlet } from "../utils/getActiveOutlets";

export const RiderDropdown = ({ currentRider, ridersData = [], shippingId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const activeOutlet = getActiveOutlet();
  const assignRiderMutation = useAssignRider();

  // Calculate dropdown position
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const menuWidth = 280;
      const menuHeight = 320;

      let top = triggerRect.bottom + 8;
      let left = triggerRect.left;

      // Adjust if going off right edge
      if (left + menuWidth > window.innerWidth - 16) {
        left = triggerRect.right - menuWidth;
      }

      // Adjust if going off left edge
      if (left < 16) {
        left = 16;
      }

      // Adjust if going off bottom
      if (top + menuHeight > window.innerHeight - 16) {
        top = triggerRect.top - menuHeight - 8;
      }

      // Ensure minimum distance from edges
      top = Math.max(16, Math.min(top, window.innerHeight - menuHeight - 16));
      left = Math.max(16, Math.min(left, window.innerWidth - menuWidth - 16));

      setPosition({ top, left });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && 
          !triggerRef.current?.contains(event.target) &&
          !menuRef.current?.contains(event.target)) {
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
    e?.stopPropagation();
    
    if (!rider || !shippingId) {
      console.error('Missing required props for rider selection');
      return;
    }

    setIsAssigning(true);

    try {
      const response = await assignRiderMutation.mutateAsync({
        active_outlet: activeOutlet,
        riderId: rider.id,
        shippingId: shippingId
      });

      console.log('Rider assigned successfully:', response);
      setIsOpen(false);
      console.log(`Successfully assigned ${rider.name} to shipping ${shippingId}`);

    } catch (error) {
      console.error('Error assigning rider:', error);
      alert(`Failed to assign rider: ${error.message || 'Unknown error'}`);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleToggleDropdown = (e) => {
    e?.stopPropagation();
    if (isAssigning) return;
    setIsOpen(!isOpen);
  };

  const handleDropdownClick = (e) => {
    e?.stopPropagation();
  };

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
        createPortal(
          <div 
            ref={menuRef}
            className="rider-dropdown-menu-portal"
            style={{
              position: 'fixed',
              top: position.top,
              left: position.left,
              zIndex: 99999,
            }}
            role="listbox"
            onClick={handleDropdownClick}
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
          </div>,
          document.body
        )
      )}
    </div>
  );
};