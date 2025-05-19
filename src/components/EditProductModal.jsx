// src/components/EditProductModal.jsx
import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Plus } from 'lucide-react';
import '../styles/AddProductModal.css';
import { validateProductForm } from '../schma/ProductSchema';

const EditProductModal = ({ isOpen, onClose, product,categories = [] }) => {
  // Form fields state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    price: '',
    discountPrice: '',
    description: '',
    images: []
  });

  // Validation errors state
  const [errors, setErrors] = useState({});
  
  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  
  // Refs
  const uploadRef = useRef(null);
  const modalRef = useRef(null);
  
  // Initialize form data when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category: product.category || '',
        quantity: product.quantity || '',
        price: product.price || '',
        discountPrice: product.discountPrice || '',
        description: product.description || '',
        images: product.images || []
      });
    }
  }, [product]);
  
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
    const files = Array.from(e.target.files);
    handleImageFiles(files);
  };
  
  // Process image files (for both drag and input)
  const handleImageFiles = (files) => {
    if (files && files.length > 0) {
      // Check if adding these files would exceed the 5 image limit
      if (formData.images.length + files.length > 5) {
        setErrors({ ...errors, images: 'Maximum 5 images are allowed' });
        return;
      }
      
      const newImages = [...formData.images];
      const newErrors = { ...errors };
      delete newErrors.images;
      
      files.forEach(file => {
        // Validate file type
        if (!file.type.match('image.*')) {
          newErrors.images = 'Please upload only image files (PNG, JPG, JPEG)';
          return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          newErrors.images = 'Image size must be less than 5MB';
          return;
        }
        
        // Create image preview
        const reader = new FileReader();
        reader.onload = (e) => {
          newImages.push({
            file: file,
            preview: e.target.result
          });
          setFormData({ ...formData, images: newImages });
        };
        reader.readAsDataURL(file);
      });
      
      setErrors(newErrors);
    }
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = validateProductForm(formData);
    
    if (Object.keys(newErrors).length === 0) {
      // Form is valid, proceed with submission
      console.log('Updating product with data:', formData);
      
      // In a real app, you would send this data to an API
      // Example: await api.put(`/products/${product.id}`, formData);
      
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
      const files = Array.from(e.dataTransfer.files);
      handleImageFiles(files);
    }
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    if (uploadRef.current) {
      uploadRef.current.click();
    }
  };
  
  // Remove image
  const removeImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({ ...formData, images: newImages });
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay">
      <div className="add-product-modal" ref={modalRef}>
        <div className="modal-header">
          <h2>Edit Product</h2>
    
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
               <option value="" disabled>Select product category</option>
{categories.map((cat) => (
  <option key={cat.value} value={cat.value}>
    {cat.label}
  </option>
))}

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
            
            {/* Multiple Image Upload */}
            <div className={`form-group ${errors.images ? 'error' : ''}`}>
              <label>Pictures upload (Max 5)</label>
              
              {/* Display uploaded images */}
              {formData.images.length > 0 && (
                <div className="image-preview-grid">
                  {formData.images.map((img, index) => (
                    <div key={index} className="image-preview-item">
                      <img src={img.preview || img.url} alt={`Product Preview ${index + 1}`} className="image-preview" />
                      <button type="button" className="remove-image" onClick={() => removeImage(index)}>
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  
                  {/* Add more images button (if less than 5) */}
                  {formData.images.length < 5 && (
                    <div className="add-more-images" onClick={triggerFileInput}>
                      <Plus size={24} />
                      <span>Add More</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Upload area (shown only when no images are uploaded) */}
              {formData.images.length === 0 && (
                <div
                  className={`image-upload-area ${isDragging ? 'dragging' : ''}`}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={triggerFileInput}
                >
                  <input
                    type="file"
                    ref={uploadRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleImageChange}
                    multiple
                  />
                  
                  <div className="upload-placeholder">
                    <Upload size={36} color="#aaa" />
                    <p>Drag and drop up to 5 images or click to upload</p>
                  </div>
                </div>
              )}
              
              {errors.images && <div className="error-message">{errors.images}</div>}
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="form-actions">
            <button type="submit" className="add-button">Update Product</button>
            <button type="button" className="cancel-button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;