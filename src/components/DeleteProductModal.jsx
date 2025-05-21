
import React from 'react';
import { X } from 'lucide-react';
import '../styles/DeleteProductModal.css';
import logo from '../assets//logo.png'
const DeleteProductModal = ({ isOpen, onClose, product, onConfirm }) => {
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
           <h2 className='delete-title'>Confirm Delete</h2>
          </div>
          
          <p className="delete-message">
            Are you sure you want to delete the product <strong>{product.name}</strong>?
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