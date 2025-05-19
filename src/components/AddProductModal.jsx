// src/components/AddProductModal.jsx
import React, { useState, useRef, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import '../styles/AddProductModal.css';
import { validateProductForm } from '../schma/ProductSchema';

const AddProductModal = ({ isOpen, onClose }) => {
  // Form fields state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    price: '',
    discountPrice: '',
    description: '',
    image: null
  });

  // Validation errors state
  const [errors, setErrors] = useState({});
  
  // Image preview state
  const [imagePreview, setImagePreview] = useState(null);
  
  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  
  // Refs
  const uploadRef = useRef(null);
  const modalRef = useRef(null);
  
  // Close modal when clicking escape
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };
  
  // Handle image upload from file input
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    handleImageFile(file);
  };
  
  // Process image file (for both drag and input)
  const handleImageFile = (file) => {
    if (file) {
      // Validate file type
      if (!file.type.match('image.*')) {
        setErrors({ ...errors, image: 'Please upload an image file (PNG, JPG, JPEG)' });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, image: 'Image size must be less than 5MB' });
        return;
      }
      
      setFormData({ ...formData, image: file });
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Clear image error if exists
      if (errors.image) {
        setErrors({ ...errors, image: '' });
      }
    }
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = validateProductForm();
    
    if (Object.keys(newErrors).length === 0) {
      // Form is valid, proceed with submission
      console.log('Submitting form data:', formData);
      
      // In a real app, you would send this data to an API
      // Example: await api.post('/products', formData);
      
      // Close modal after successful submission
      onClose();
    } else {
      // Show validation errors
      setErrors(newErrors);
      
      // Scroll to the first error
      const firstErrorField = document.querySelector('.form-group.error');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  
  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleImageFile(file);
    }
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    if (uploadRef.current) {
      uploadRef.current.click();
    }
  };
  
  // Remove image preview
  const removeImage = () => {
    setFormData({ ...formData, image: null });
    setImagePreview(null);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay">
      <div className="add-product-modal" ref={modalRef}>
        <div className="modal-header">
          <h2>Add New Product</h2>

        </div>
        
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-content">
            {/* Product Name */}
            <div className={`form-group ${errors.name ? 'error' : ''}`}>
              <label htmlFor="name">Product Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter Product Name"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && <div className="error-message">{errors.name}</div>}
            </div>
            
            {/* Two column layout */}
            <div className="form-row">
              {/* Product Category */}
              <div className={`form-group ${errors.category ? 'error' : ''}`}>
                <label htmlFor="category">Product Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="" disabled>select product category</option>
                  <option value="appetizers">Appetizers</option>
                  <option value="mains">Main Courses</option>
                  <option value="desserts">Desserts</option>
                  <option value="drinks">Drinks</option>
                  <option value="sides">Side Dishes</option>
                </select>
                {errors.category && <div className="error-message">{errors.category}</div>}
              </div>
              
              {/* Stock Quantity */}
              <div className={`form-group ${errors.quantity ? 'error' : ''}`}>
                <label htmlFor="quantity">Stock Quantity</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  placeholder="Enter Stock quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="0"
                />
                {errors.quantity && <div className="error-message">{errors.quantity}</div>}
              </div>
            </div>
            
            {/* Two column layout */}
            <div className="form-row">
              {/* Product Price */}
              <div className={`form-group ${errors.price ? 'error' : ''}`}>
                <label htmlFor="price">Product Price</label>
                <input
                  type="text"
                  id="price"
                  name="price"
                  placeholder="Enter product price"
                  value={formData.price}
                  onChange={handleChange}
                />
                {errors.price && <div className="error-message">{errors.price}</div>}
              </div>
              
              {/* Discount Price */}
              <div className={`form-group ${errors.discountPrice ? 'error' : ''}`}>
                <label htmlFor="discountPrice">Discount Price</label>
                <input
                  type="text"
                  id="discountPrice"
                  name="discountPrice"
                  placeholder="Enter Discount price"
                  value={formData.discountPrice}
                  onChange={handleChange}
                />
                {errors.discountPrice && <div className="error-message">{errors.discountPrice}</div>}
              </div>
            </div>
            
            {/* Product Description */}
            <div className={`form-group ${errors.description ? 'error' : ''}`}>
              <label htmlFor="description">Product Description</label>
              <textarea
                id="description"
                name="description"
                placeholder="Describe your product"
                value={formData.description}
                onChange={handleChange}
                rows={5}
              ></textarea>
              {errors.description && <div className="error-message">{errors.description}</div>}
            </div>
            
            {/* Image Upload */}
            <div className={`form-group ${errors.image ? 'error' : ''}`}>
              <label>Pictures upload</label>
              <div
                className={`image-upload-area ${isDragging ? 'dragging' : ''} ${imagePreview ? 'has-image' : ''}`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={!imagePreview ? triggerFileInput : undefined}
              >
                <input
                  type="file"
                  ref={uploadRef}
                  style={{ display: 'none' }}
                  accept="image/*"
                  onChange={handleImageChange}
                />
                
                {imagePreview ? (
                  <div className="image-preview-container">
                    <img src={imagePreview} alt="Product Preview" className="image-preview" />
                    <button type="button" className="remove-image" onClick={removeImage}>
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <Upload size={36} color="#aaa" />
                    <p>Drag and drop and image or click to upload</p>
                  </div>
                )}
              </div>
              {errors.image && <div className="error-message">{errors.image}</div>}
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="form-actions">
            <button type="submit" className="add-button">Add Product</button>
            <button type="button" className="cancel-button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;