
import React from 'react';
import { X } from 'lucide-react';
import '../styles/DeleteProductModal.css';
import logo from '../assets//logo.png'
const VerifyProductModal = ({ isOpen, onClose, product, onConfirm }) => {
  if (!isOpen || !product) return null;
  
  const handleConfirm = () => {
    onConfirm(product.id);
    onClose();
  };

  return (
    <div className="modal-overlay-delete">
      <div className="delete-product-modal">
        <div className="modal-header-delete">
           <div className="logo-container-delete">
                    <img src={logo} alt="Logo" className="logo" />
                  </div>
          <button type="button" className="close-button-delete" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="modal-content">
          <div className="warning-icon">
           <h2 className='delete-title'>Confirm Verification</h2>
          </div>
          
          <p className="delete-message">
            Are you sure you want to verify this payment made by John Doe with the Payment ID “<strong>{product.id}</strong>”

          </p>
          
        </div>
        
        <div className="form-actions">
          <button type="button" className="delete-button" onClick={handleConfirm}>
            Verify Payment
          </button>
          <button type="button" className="cancel-button" onClick={onClose}>
            Cancel Verification
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyProductModal;