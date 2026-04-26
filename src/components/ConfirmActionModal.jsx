import React from 'react';
import { X } from 'lucide-react';
import logo from '../assets/logo.png';
import '../styles/ConfirmActionModal.css'
const ConfirmActionModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  confirmButtonClass = 'confirm-button',
  type = 'default', // 'delete', 'discard', 'verify', 'default'
  isLoading = undefined,
  children
}) => {
  
  // Define different button styles and texts based on type
  const getButtonConfig = () => {
    switch (type) {
      case 'delete':
        return {
          confirmText: 'Delete Product',
          confirmClass: 'confirm-button delete-button',
          cancelText: 'Cancel'
        };
      case 'discard':
        return {
          confirmText: 'Discard Order',
          confirmClass: 'confirm-button discard-button',
          cancelText: 'Keep Order'
        };
      case 'discardPayment':
        return {
          confirmText: 'Discard Payment',
          confirmClass: 'confirm-button discard-button',
          cancelText: 'Keep Payment'
        };
      case 'verify':
        return {
          confirmText: 'Verify Payment',
          confirmClass: 'confirm-button verify-button',
          cancelText: 'Cancel Verification'
        };
      case 'success':
        return {
          confirmText: 'OK',
          confirmClass: 'confirm-button success-button',
          cancelText: null // No cancel button for success
        };
      default:
        return {
          confirmText: confirmButtonText,
          confirmClass: confirmButtonClass,
          cancelText: cancelButtonText
        };
    }
  };

  const buttonConfig = getButtonConfig();

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    // auto-close only when parent is NOT managing loading state
    if (isLoading === undefined) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay-confirm-modal">
      <div className="confirm-action-modal">
        <div className="modal-header-confirm">
          <div className="logo-container-confirm">
            <img src={logo} alt="Logo" className="logo" />
          </div>
          <button type="button" className="close-button-confirm" onClick={onClose}>
            <X size={24} color='#000'/>
          </button>
        </div>

        <div className="modal-content-confirm">
          <h2 className="confirm-title">{title}</h2>
          <p className="confirm-message">
            {message}
          </p>
        </div>

        {children || (
          <div className="form-actions-confirm">
            <button
              type="button"
              className={buttonConfig.confirmClass}
              onClick={handleConfirm}
              disabled={!!isLoading}
            >
              {isLoading ? `${buttonConfig.confirmText.split(' ')[0]}ing...` : buttonConfig.confirmText}
            </button>
            {buttonConfig.cancelText && (
              <button
                type="button"
                className="cancel-button"
                onClick={onClose}
                disabled={!!isLoading}
              >
                {buttonConfig.cancelText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmActionModal;