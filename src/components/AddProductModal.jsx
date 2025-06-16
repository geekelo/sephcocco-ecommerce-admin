import React, { useState, useRef, useEffect } from "react";
import { X, Upload, Plus, Image } from "lucide-react";
import "../styles/AddProductModal.css";
import { validateProductForm } from "../schema/ProductSchema";
import { getActiveOutlet } from "../utils/getActiveOutlets";
import { useViewProductCategories } from "../hooks/useGetProductCategories";
import { useAddProduct } from "../hooks/useAddProduct";
import { uploadToImgbb } from "../services/imgbbUpload";

const AddProductModal = ({ isOpen, onClose }) => {
  // Get active outlet from cookies
  const active_outlet = getActiveOutlet();
  
  // Form fields state
  const [formData, setFormData] = useState({
    name: "",
    category_ids: [],
    quantity: "",
    price: "",
    discountPrice: "",
    short_description: "",
    long_description: "",
    visible: false,
    main_image_url: null,
    other_image_urls: []
  });

  // Validation errors state
  const [errors, setErrors] = useState({});

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [isMainImageDragging, setIsMainImageDragging] = useState(false);

  // Refs
  const uploadRef = useRef(null);
  const mainImageUploadRef = useRef(null);
  const modalRef = useRef(null);

  // API hooks
  const { data: categories = [], isLoading: categoriesLoading } = useViewProductCategories(active_outlet);
  const addProductMutation = useAddProduct();

  // Handle main image upload
  const handleMainImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsSubmitting(true);
      setUploadProgress("Uploading main image...");

      // Validate file type
      if (!file.type.match("image.*")) {
        setErrors({
          ...errors,
          mainImage: "Please upload only image files (PNG, JPG, JPEG)",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, mainImage: "Image size must be less than 5MB" });
        return;
      }

      // Upload to imgbb
      const result = await uploadToImgbb(file);
      
      if (result.success) {
        setFormData(prev => ({
          ...prev,
          main_image_url: result.url
        }));
        setUploadProgress("Main image uploaded successfully!");
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (err) {
      setErrors({ ...errors, mainImage: 'Failed to upload image. Please try again.' });
      console.error('Image upload error:', err);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setUploadProgress(""), 2000);
    }
  };

  // Handle additional images upload
  const handleImageChange = async (e) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    try {
      setIsSubmitting(true);
      setUploadProgress("Uploading additional images...");

      // Validate files
      const validFiles = files.filter(file => {
        if (!file.type.match("image.*")) {
          setErrors({ ...errors, other_image_urls: "Please upload only image files (PNG, JPG, JPEG)" });
          return false;
        }
        if (file.size > 5 * 1024 * 1024) {
          setErrors({ ...errors, other_image_urls: "Image size must be less than 5MB" });
          return false;
        }
        return true;
      });

      // Upload all valid files to imgbb
      const uploadPromises = validFiles.map(file => uploadToImgbb(file));
      const results = await Promise.all(uploadPromises);

      // Filter successful uploads and get their URLs
      const successfulUploads = results.filter(result => result.success);
      const imageUrls = successfulUploads.map(result => result.url);

      // Update form data with new image URLs
      setFormData(prev => ({
        ...prev,
        other_image_urls: [...prev.other_image_urls, ...imageUrls]
      }));

      setUploadProgress("Additional images uploaded successfully!");
    } catch (err) {
      setErrors({ ...errors, other_image_urls: 'Failed to upload images. Please try again.' });
      console.error('Images upload error:', err);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setUploadProgress(""), 2000);
    }
  };

  // Create FormData for product submission
  const createFormData = () => {
    const formDataToSend = new FormData();
    
    // Add product fields
    formDataToSend.append('product[name]', formData.name.trim());
    formDataToSend.append('product[short_description]', formData.short_description.trim());
    formDataToSend.append('product[long_description]', formData.long_description.trim());
    formDataToSend.append('product[amount_in_stock]', formData.quantity.toString());
    formDataToSend.append('product[price]', formData.price.toString());
    formDataToSend.append('product[visible]', formData.visible.toString());
    
    // Add discount_price if it exists
    if (formData.discountPrice && formData.discountPrice > 0) {
      formDataToSend.append('product[discount_price]', formData.discountPrice.toString());
    }
    
    // Add category IDs
    formData.category_ids.forEach((categoryId) => {
      formDataToSend.append('product[category_ids][]', categoryId);
    });
    
    // Add main image URL
    if (formData.main_image_url) {
      formDataToSend.append('product[main_image_url]', formData.main_image_url);
    }
    
    // Add other image URLs
    formData.other_image_urls.forEach((imageUrl) => {
      formDataToSend.append('product[other_image_urls][]', imageUrl);
    });
    
    return formDataToSend;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setUploadProgress("Creating product...");

      // Validate form
      const validationErrors = validateProductForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      // Create FormData
      const formDataToSend = createFormData();

      // Submit product
      const response = await addProductMutation.mutateAsync({
        active_outlet,
        payload: formDataToSend
      });

      console.log("Product created successfully:", response);
      setUploadProgress("Product added successfully!");
      
      // Close modal after success
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (error) {
      console.error('Submit error:', error);
      setErrors({ submit: 'Failed to add product. Please try again.' });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setUploadProgress(""), 2000);
    }
  };

  // Remove main image
  const removeMainImage = () => {
    setFormData(prev => ({ ...prev, main_image_url: null }));
    if (errors.mainImage) {
      setErrors(prev => ({ ...prev, mainImage: "" }));
    }
  };

  // Remove additional image
  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      other_image_urls: prev.other_image_urls.filter((_, i) => i !== index)
    }));
    if (errors.other_image_urls) {
      setErrors(prev => ({ ...prev, other_image_urls: "" }));
    }
  };

  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: "",
        category_ids: [],
        quantity: "",
        price: "",
        discountPrice: "",
        short_description: "",
        long_description: "",
        visible: false,
        main_image_url: null,
        other_image_urls: []
      });
      setErrors({});
      setIsSubmitting(false);
      setUploadProgress("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" ref={modalRef}>
        <div className="modal-header">
          <h2>Add New Product</h2>
          <button 
            type="button" 
            className="close-button" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-content">
            {/* Submit Error */}
            {errors.submit && (
              <div className="error-message submit-error">{errors.submit}</div>
            )}

            {/* Upload Progress */}
            {uploadProgress && (
              <div className="upload-progress-message">
                <div className="progress-text">{uploadProgress}</div>
                {isSubmitting && (
                  <div className="progress-spinner">
                    <div className="spinner"></div>
                  </div>
                )}
              </div>
            )}

            {/* Product Name */}
            <div className="form-group">
              <label htmlFor="name">Product Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
              {errors.name && <div className="error-message">{errors.name}</div>}
            </div>

            {/* Price */}
            <div className="form-group">
              <label htmlFor="price">Price</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                required
              />
              {errors.price && <div className="error-message">{errors.price}</div>}
            </div>

            {/* Discount Price */}
            <div className="form-group">
              <label htmlFor="discountPrice">Discount Price (Optional)</label>
              <input
                type="number"
                id="discountPrice"
                name="discountPrice"
                value={formData.discountPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, discountPrice: e.target.value }))}
              />
            </div>

            {/* Quantity */}
            <div className="form-group">
              <label htmlFor="quantity">Quantity in Stock</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                required
              />
              {errors.quantity && <div className="error-message">{errors.quantity}</div>}
            </div>

            {/* Short Description */}
            <div className="form-group">
              <label htmlFor="short_description">Short Description</label>
              <textarea
                id="short_description"
                name="short_description"
                value={formData.short_description}
                onChange={(e) => setFormData(prev => ({ ...prev, short_description: e.target.value }))}
                required
              />
              {errors.short_description && (
                <div className="error-message">{errors.short_description}</div>
              )}
            </div>

            {/* Long Description */}
            <div className="form-group">
              <label htmlFor="long_description">Long Description</label>
              <textarea
                id="long_description"
                name="long_description"
                value={formData.long_description}
                onChange={(e) => setFormData(prev => ({ ...prev, long_description: e.target.value }))}
                required
              />
              {errors.long_description && (
                <div className="error-message">{errors.long_description}</div>
              )}
            </div>

            {/* Main Image Upload */}
            <div className="form-group">
              <label htmlFor="mainImage">Main Image</label>
              <div
                className={`upload-area ${isMainImageDragging ? 'dragging' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsMainImageDragging(true);
                }}
                onDragLeave={() => setIsMainImageDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsMainImageDragging(false);
                  const file = e.dataTransfer.files[0];
                  if (file) {
                    const event = { target: { files: [file] } };
                    handleMainImageChange(event);
                  }
                }}
              >
                <input
                  type="file"
                  id="mainImage"
                  ref={mainImageUploadRef}
                  onChange={handleMainImageChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                {formData.main_image_url ? (
                  <div className="image-preview-container">
                    <img src={formData.main_image_url} alt="Main" className="image-preview" />
                    <button
                      type="button"
                      className="remove-image-button"
                      onClick={removeMainImage}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div
                    className="upload-placeholder"
                    onClick={() => mainImageUploadRef.current?.click()}
                  >
                    <Upload size={24} />
                    <span>Click or drag image here</span>
                  </div>
                )}
              </div>
              {errors.mainImage && <div className="error-message">{errors.mainImage}</div>}
            </div>

            {/* Additional Images Upload */}
            <div className="form-group">
              <label htmlFor="other_images">Additional Images</label>
              <div
                className={`upload-area ${isDragging ? 'dragging' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const files = Array.from(e.dataTransfer.files);
                  if (files.length > 0) {
                    const event = { target: { files } };
                    handleImageChange(event);
                  }
                }}
              >
                <input
                  type="file"
                  id="other_images"
                  ref={uploadRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                />
                <div className="images-grid">
                  {formData.other_image_urls.map((imageUrl, index) => (
                    <div key={index} className="image-preview-container">
                      <img src={imageUrl} alt={`Additional ${index + 1}`} className="image-preview" />
                      <button
                        type="button"
                        className="remove-image-button"
                        onClick={() => removeImage(index)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <div
                    className="upload-placeholder"
                    onClick={() => uploadRef.current?.click()}
                  >
                    <Plus size={24} />
                    <span>Add more images</span>
                  </div>
                </div>
              </div>
              {errors.other_image_urls && <div className="error-message">{errors.other_image_urls}</div>}
            </div>

            {/* Submit Button */}
            <div className="form-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding Product...' : 'Add Product'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;