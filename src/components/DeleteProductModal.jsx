
import React from 'react';
import { X } from 'lucide-react';
import '../styles/DeleteProductModal.css';

const DeleteProductModal = ({ isOpen, onClose, product, onConfirm }) => {
  if (!isOpen || !product) return null;
  
  const handleConfirm = () => {
    onConfirm(product.id);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="delete-product-modal">
        <div className="modal-header">
          <h2>Confirm Deletion</h2>
          <button type="button" className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="modal-content">
          <div className="warning-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#F93A01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          
          <p className="delete-message">
            Are you sure you want to delete the product <strong>{product.name}</strong>?
          </p>
          <p className="delete-warning">
            This action cannot be undone. All data related to this product will be permanently removed.
          </p>
        </div>
        
        <div className="form-actions">
          <button type="button" className="delete-button" onClick={handleConfirm}>
            Delete Product
          </button>
          <button type="button" className="cancel-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProductModal;