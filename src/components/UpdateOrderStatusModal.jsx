import React, { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import '../styles/UpdateOrderStatusModal.css';
import { getActiveOutlet } from '../utils/getActiveOutlets';
import { useUpdateOrderStatus } from '../hooks/useUpdateOrderStatus';

const UpdateOrderStatusModal = ({
  isOpen,
  onClose,
  onConfirm,
  orderIds,
  currentStatus = "Pending"
}) => {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [showCompletedDropdown, setShowCompletedDropdown] = useState(false);
  
  const activeOutlet = getActiveOutlet();
  const updateOrderMutation = useUpdateOrderStatus();

  const statusOptions = [
    { value: 'Pending', color: '#4CAF50', icon: '●' },
    { value: 'Paid', color: '#FF9800', icon: '●' },
    { value: 'Delivering', color: '#F44336', icon: '●' },
    { value: 'Cancelled', color: '#FFC107', icon: '●' }
  ];

  const completedOptions = [
    { value: 'Delivered', color: '#4CAF50', icon: '●' },
    { value: 'Refunded', color: '#9C27B0', icon: '●' }
  ];

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    if (status !== 'Completed') {
      setShowCompletedDropdown(false);
    }
  };

  const handleCompletedClick = () => {
    setShowCompletedDropdown(!showCompletedDropdown);
    if (!showCompletedDropdown && !completedOptions.some(option => option.value === selectedStatus)) {
      setSelectedStatus('Completed');
    }
  };

  const handleConfirm = async () => {
    try {
      await updateOrderMutation.mutateAsync({
        active_outlet: activeOutlet,
        orderIds: Array.isArray(orderIds) ? orderIds : [orderIds],
        status: selectedStatus.toLowerCase(),
      });

      // Call the onConfirm callback with the selected status
      onConfirm?.(selectedStatus);
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error('Failed to update order status:', error);
      // You might want to show an error message to the user here
      // For example, you could add error state and show a toast notification
    }
  };

  if (!isOpen) return null;

  const isCompletedSelected = selectedStatus === 'Completed' || completedOptions.some(option => option.value === selectedStatus);

  return (
    <div className="modal-overlay-confirm">
      <div className="update-status-modal">
        <div className="modal-header-confirm">
          <div className="logo-container-confirm">
             <img src="/logo.png" alt="Logo" className="logo" />
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
                  onChange={(e) => handleStatusChange(e.target.value)}
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
            
            {/* Completed Option with Dropdown */}
            <div className="completed-container">
              <div 
                className={`status-option completed-option ${isCompletedSelected ? 'selected' : ''}`}
                onClick={handleCompletedClick}
              >
                <input
                  type="radio"
                  name="orderStatus"
                  value="Completed"
                  checked={isCompletedSelected}
                  onChange={() => {}}
                />
                <span
                  className="status-indicator"
                  style={{ color: '#4CAF50' }}
                >
                  ●
                </span>
                <span className="status-text">Completed</span>
                <ChevronDown 
                  size={20} 
                  className={`dropdown-arrow ${showCompletedDropdown ? 'open' : ''}`}
                />
              </div>
              
              {showCompletedDropdown && (
                <div className="completed-dropdown">
                  {completedOptions.map((option) => (
                    <label 
                      key={option.value}
                      className={`status-option dropdown-option ${selectedStatus === option.value ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="orderStatus"
                        value={option.value}
                        checked={selectedStatus === option.value}
                        onChange={(e) => handleStatusChange(e.target.value)}
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
              )}
            </div>
          </div>
        </div>

        <div className="form-actions-order">
          <button
            type="button"
            className="confirm-button update-status-button"
            onClick={handleConfirm}
            disabled={updateOrderMutation.isPending}
          >
            {updateOrderMutation.isPending ? 'Updating...' : 'Update Status'}
          </button>
          <button
            type="button"
            className="cancel-button"
            onClick={onClose}
            disabled={updateOrderMutation.isPending}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateOrderStatusModal;