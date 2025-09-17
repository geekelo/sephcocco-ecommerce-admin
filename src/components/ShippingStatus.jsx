import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import '../styles/ShippingStatusUpdateDropdown.css'

export const ShippingStatusUpdateDropdown = ({ 
  shipping, 
  onComplete, 
  onCancel, 
  isUpdating = false 
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const confirmRef = useRef(null);

  // Calculate dropdown position
  useEffect(() => {
    if ((showDropdown || confirmAction) && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const menuWidth = 200;
      const menuHeight = 150;

      let top = triggerRect.bottom + 8;
      let left = triggerRect.right - menuWidth;

      // Adjust if going off left edge
      if (left < 16) {
        left = triggerRect.left;
      }

      // Adjust if going off right edge
      if (left + menuWidth > window.innerWidth - 16) {
        left = window.innerWidth - menuWidth - 16;
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
  }, [showDropdown, confirmAction]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if ((showDropdown || confirmAction) && 
          !triggerRef.current?.contains(event.target) &&
          !dropdownRef.current?.contains(event.target) &&
          !confirmRef.current?.contains(event.target)) {
        setShowDropdown(false);
        setConfirmAction(null);
      }
    };

    if (showDropdown || confirmAction) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown, confirmAction]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && (showDropdown || confirmAction)) {
        setShowDropdown(false);
        setConfirmAction(null);
      }
    };

    if (showDropdown || confirmAction) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showDropdown, confirmAction]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'status-completed';
      case 'in_transit': 
      case 'dispatched': return 'status-delivering';
      case 'processing': 
      case 'pending': return 'status-processing';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  const canUpdateStatus = (status) => {
    const currentStatus = status?.toLowerCase();
    return currentStatus !== 'delivered' && currentStatus !== 'cancelled';
  };

  const handleComplete = async (e) => {
    e?.stopPropagation();
    try {
      await onComplete(shipping.id);
      setConfirmAction(null);
      setShowDropdown(false);
    } catch (error) {
      console.error('Failed to complete delivery:', error);
    }
  };

  const handleCancel = async (e) => {
    e?.stopPropagation();
    try {
      await onCancel(shipping.id);
      setConfirmAction(null);
      setShowDropdown(false);
    } catch (error) {
      console.error('Failed to cancel delivery:', error);
    }
  };

  const handleConfirmComplete = (e) => {
    e?.stopPropagation();
    setConfirmAction('complete');
    setShowDropdown(false);
  };

  const handleConfirmCancel = (e) => {
    e?.stopPropagation();
    setConfirmAction('cancel');
    setShowDropdown(false);
  };

  const handleCancelConfirmation = (e) => {
    e?.stopPropagation();
    setConfirmAction(null);
  };

  const handleToggleDropdown = (e) => {
    e?.stopPropagation();
    setShowDropdown(!showDropdown);
    setConfirmAction(null);
  };

  const handleDropdownClick = (e) => {
    e?.stopPropagation();
  };

  const isComplete = confirmAction === 'complete';

  return (
    <>
      <div className="status-update-container" onClick={handleDropdownClick}>
        <div className="status-display">
          <span className={`status-badge ${getStatusColor(shipping.status)}`}>
            {String(shipping.status || '-').toUpperCase()}
          </span>
          
          {canUpdateStatus(shipping.status) && (
            <button
              ref={triggerRef}
              onClick={handleToggleDropdown}
              className="status-update-btn"
              disabled={isUpdating}
            >
              <Clock size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal Portal */}
      {confirmAction && createPortal(
        <div
          ref={confirmRef}
          className="status-update-confirm-portal"
          style={{
            position: 'fixed',
            top: position.top,
            left: position.left,
            zIndex: 99999,
          }}
          onClick={handleDropdownClick}
        >
          <div className="status-update-confirm">
            <div className="confirm-message">
              <span>
                {isComplete ? 'Mark as delivered?' : 'Cancel delivery?'}
              </span>
            </div>
            <div className="confirm-actions">
              <button
                onClick={isComplete ? handleComplete : handleCancel}
                disabled={isUpdating}
                className="confirm-btn complete-btn"
              >
                {isUpdating ? 'Updating...' : 'Yes'}
              </button>
              <button
                onClick={handleCancelConfirmation}
                className="confirm-btn cancel-btn"
              >
                No
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Dropdown Menu Portal */}
      {showDropdown && canUpdateStatus(shipping.status) && createPortal(
        <div
          ref={dropdownRef}
          className="status-dropdown-portal"
          style={{
            position: 'fixed',
            top: position.top,
            left: position.left,
            zIndex: 99999,
          }}
          onClick={handleDropdownClick}
        >
          <div className="status-dropdown">
            <div className="dropdown-header">Update Status</div>
            <button
              onClick={handleConfirmComplete}
              className="dropdown-item complete-item"
              disabled={isUpdating}
            >
              <CheckCircle size={16} />
              <span>Mark as Delivered</span>
            </button>
            <button
              onClick={handleConfirmCancel}
              className="dropdown-item cancel-item"
              disabled={isUpdating}
            >
              <XCircle size={16} />
              <span>Cancel Delivery</span>
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};