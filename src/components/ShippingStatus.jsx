import React, { useState } from 'react';
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
  };

  const handleConfirmCancel = (e) => {
    e?.stopPropagation();
    setConfirmAction('cancel');
  };

  const handleCancelConfirmation = (e) => {
    e?.stopPropagation();
    setConfirmAction(null);
  };

  const handleToggleDropdown = (e) => {
    e?.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const handleDropdownClick = (e) => {
    e?.stopPropagation();
  };

  if (confirmAction === 'complete') {
    return (
      <div className="status-update-confirm" onClick={handleDropdownClick}>
        <div className="confirm-message">
          <span>Mark as delivered?</span>
        </div>
        <div className="confirm-actions">
          <button
            onClick={handleComplete}
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
    );
  }

  if (confirmAction === 'cancel') {
    return (
      <div className="status-update-confirm" onClick={handleDropdownClick}>
        <div className="confirm-message">
          <span>Cancel delivery?</span>
        </div>
        <div className="confirm-actions">
          <button
            onClick={handleCancel}
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
    );
  }

  return (
    <div className="status-update-container" onClick={handleDropdownClick}>
      <div className="status-display">
        <span className={`status-badge ${getStatusColor(shipping.status)}`}>
          {String(shipping.status || '-').toUpperCase()}
        </span>
        
        {canUpdateStatus(shipping.status) && (
          <button
            onClick={handleToggleDropdown}
            className="status-update-btn"
            disabled={isUpdating}
          >
            <Clock size={14} />
          </button>
        )}
      </div>

      {showDropdown && canUpdateStatus(shipping.status) && (
        <div className="status-dropdown" onClick={handleDropdownClick}>
          <div className="dropdown-header">Update Status</div>
          <button
            onClick={handleConfirmComplete}
            className="dropdown-item complete-item"
            disabled={isUpdating}
          >
            <span>Mark as Delivered</span>
          </button>
          <button
            onClick={handleConfirmCancel}
            className="dropdown-item cancel-item"
            disabled={isUpdating}
          >
            <span>Cancel Delivery</span>
          </button>
        </div>
      )}
    </div>
  );
};