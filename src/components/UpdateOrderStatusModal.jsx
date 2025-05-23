import React, { useState } from 'react';
import { X } from 'lucide-react';
import logo from '../assets/logo.png';
import '../styles/UpdateOrderStatusModal.css'
const UpdateOrderStatusModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  currentStatus = "Pending" 
}) => {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);

  const statusOptions = [
    { value: 'Delivered', color: '#4CAF50', icon: '●' },
    { value: 'On Transit', color: '#FF9800', icon: '●' },
    { value: 'Failed', color: '#F44336', icon: '●' },
    { value: 'Pending', color: '#FFC107', icon: '●' }
  ];

  const handleConfirm = () => {
    onConfirm(selectedStatus);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay-confirm">
      <div className="update-status-modal">
        <div className="modal-header-confirm">
          <div className="logo-container-confirm">
            <img src={logo} alt="Logo" className="logo" />
          </div>
          <button type="button" className="close-button-confirm" onClick={onClose}>
            <X size={24} color='#000'/>
          </button>
        </div>

        <div className="modal-content">
          <h2 className="update-status-title">Update Order Status</h2>
          <p className="update-status-description">
            Select the status you want to update this order
          </p>
          
          <div className="status-options">
            {statusOptions.map((option) => (
              <label 
                key={option.value} 
                className={`status-option ${selectedStatus === option.value ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="orderStatus"
                  value={option.value}
                  checked={selectedStatus === option.value}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                />
                <span 
                  className="status-indicator" 
                  style={{ color: option.color }}
                >
                  {option.icon}
                </span>
                <span className="status-text">{option.value}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="confirm-button update-status-button"
            onClick={handleConfirm}
          >
            Update Status
          </button>
          <button
            type="button"
            className="cancel-button"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateOrderStatusModal;