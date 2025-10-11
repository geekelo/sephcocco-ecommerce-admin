import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import '../styles/LocationModal.css';

const LocationModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  location, 
  title = 'Add Location',
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    state: '',
    price: '',
    status: 'Active'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (location) {
      setFormData({
        state: location.state || '',
        price: location.price?.toString() || '',
        status: location.status || 'Active'
      });
    } else {
      setFormData({
        state: '',
        price: '',
        status: 'Active'
      });
    }
    setErrors({});
  }, [location, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.state.trim()) {
      newErrors.state = 'State name is required';
    } else if (formData.state.trim().length < 2) {
      newErrors.state = 'State name must be at least 2 characters';
    }

    if (!formData.price.trim()) {
      newErrors.price = 'Delivery price is required';
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Please enter a valid price greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        state: formData.state.trim(),
        price: parseFloat(formData.price),
        status: formData.status
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay-location" onClick={onClose}>
      <div className="location-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-location">
          <h2>{title}</h2>
          <button 
            className="close-btn-location" 
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="location-form">
          <div className="form-group-location">
            <label htmlFor="state">
              State Name <span className="required">*</span>
            </label>
            <input
              id="state"
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="Enter state name"
              className={errors.state ? 'error' : ''}
              disabled={isLoading}
              maxLength={50}
            />
            {errors.state && (
              <span className="error-message">{errors.state}</span>
            )}
          </div>

          <div className="form-group-location">
            <label htmlFor="price">
              Delivery Price (₦) <span className="required">*</span>
            </label>
            <input
              id="price"
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Enter delivery price"
              className={errors.price ? 'error' : ''}
              disabled={isLoading}
              min="0"
              step="0.01"
            />
            {errors.price && (
              <span className="error-message">{errors.price}</span>
            )}
            <span className="helper-text">
              Enter the delivery price in Naira (e.g., 2500)
            </span>
          </div>

          <div className="form-group-location">
            <label htmlFor="status">
              Status <span className="required">*</span>
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={isLoading}
              className="status-select"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <span className="helper-text">
              Inactive locations won't be available for delivery
            </span>
          </div>

          <div className="modal-actions-location">
            <button
              type="button"
              className="cancel-btn-location"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn-location"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-location"></span>
                  {location ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                location ? 'Update Location' : 'Add Location'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LocationModal