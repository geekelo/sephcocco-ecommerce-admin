// src/components/AddProductModal.jsx
import React, { useState, useRef, useEffect } from "react";
import { X, Upload, Plus, Image } from "lucide-react";
import "../styles/AddProductModal.css";
import { validateProductForm } from "../schema/ProductSchema";

const AddProductModal = ({ isOpen, onClose }) => {
  // Form fields state
  const [formData, setFormData] = useState({
    name: "",
    category: [],
    quantity: "",
    price: "",
    discountPrice: "",
    description: "",
    mainImage: null,
    images: [],
  });

  // Validation errors state
  const [errors, setErrors] = useState({});

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [isMainImageDragging, setIsMainImageDragging] = useState(false);

  // Refs
  const uploadRef = useRef(null);
  const mainImageUploadRef = useRef(null);
  const modalRef = useRef(null);

  // Close modal when clicking escape
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) onClose();
    };
    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Handle main image upload
  const handleMainImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match("image.*")) {
      setErrors({
        ...errors,
        mainImage: "Please upload only image files (PNG, JPG, JPEG)",
      });
      e.target.value = null;
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, mainImage: "Image size must be less than 5MB" });
      e.target.value = null;
      return;
    }

    // Create image preview
    const mainImage = {
      file,
      preview: URL.createObjectURL(file),
    };

    // Update formData
    setFormData({ ...formData, mainImage });

    // Clear any error
    if (errors.mainImage) {
      setErrors({ ...errors, mainImage: "" });
    }

    // Reset input
    e.target.value = null;
  };

  // Handle additional images upload
  const handleImageChange = (e) => {
    const files = e.target.files ? Array.from(e.target.files) : [];

    if (files.length === 0) return; // nothing selected

    // Calculate how many images can still be added
    const availableSlots = 4 - formData.images.length;

    if (availableSlots <= 0) {
      setErrors({
        ...errors,
        images: "Maximum of 4 additional images reached.",
      });
      e.target.value = null; // reset input
      return;
    }

    // Take only the allowed number of files
    const filesToAdd = files.slice(0, availableSlots);

    // Map files to your image object format
    const newImages = filesToAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    // Update formData images state appending new images
    setFormData({ ...formData, images: [...formData.images, ...newImages] });

    if (errors.images) {
      setErrors({ ...errors, images: "" });
    }

    // Reset file input value so same file can be uploaded again if needed
    e.target.value = null;
  };

  // Process image files (for both drag and input)
  const handleImageFiles = (files, isMainImage = false) => {
    if (!files || files.length === 0) return;

    if (isMainImage) {
      // For main image, we only take the first file
      const file = files[0];

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

      // Create image preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const mainImage = {
          file,
          preview: e.target.result,
        };
        setFormData({ ...formData, mainImage });
      };
      reader.readAsDataURL(file);

      // Clear any error
      if (errors.mainImage) {
        setErrors({ ...errors, mainImage: "" });
      }
    } else {
      // For additional images
      // Check if adding these files would exceed the 4 image limit
      if (formData.images.length + files.length > 4) {
        setErrors({
          ...errors,
          images: "Maximum 4 additional images are allowed",
        });
        return;
      }

      const newImages = [...formData.images];
      const newErrors = { ...errors };
      delete newErrors.images;

      Array.from(files).forEach((file) => {
        // Validate file type
        if (!file.type.match("image.*")) {
          newErrors.images = "Please upload only image files (PNG, JPG, JPEG)";
          return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          newErrors.images = "Image size must be less than 5MB";
          return;
        }

        // Create image preview
        const reader = new FileReader();
        reader.onload = (e) => {
          newImages.push({
            file: file,
            preview: e.target.result,
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

    // Additional validation for main image
    if (!formData.mainImage) {
      newErrors.mainImage = "Main product image is required";
    }

    if (Object.keys(newErrors).length === 0) {
      // Form is valid, proceed with submission
      console.log("Submitting form data:", formData);

      // In a real app, you would send this data to an API
      // Example: await api.post('/products', formData);

      // Close modal after successful submission
      onClose();
    } else {
      // Show validation errors
      setErrors(newErrors);

      // Scroll to the first error
      const firstErrorField = document.querySelector(".form-group.error");
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  // Handle drag events for main image
  const handleMainImageDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMainImageDragging(true);
  };

  const handleMainImageDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMainImageDragging(false);
  };

  const handleMainImageDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isMainImageDragging) setIsMainImageDragging(true);
  };

  const handleMainImageDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMainImageDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleMainImageChange({ target: { files: [e.dataTransfer.files[0]] } });
    }
  };

  // Handle drag events for additional images
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
      handleImageChange({ target: { files } });
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    if (uploadRef.current) {
      uploadRef.current.click();
    }
  };

  // Trigger main image file input click
  const triggerMainImageFileInput = () => {
    if (mainImageUploadRef.current) {
      mainImageUploadRef.current.click();
    }
  };

  // Remove main image
  const removeMainImage = () => {
    setFormData({ ...formData, mainImage: null });

    // Clear any error
    if (errors.mainImage) {
      setErrors({ ...errors, mainImage: "" });
    }
  };

  // Remove additional image
  const removeImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({ ...formData, images: newImages });

    // Clear any image errors when removing images
    if (errors.images) {
      setErrors({ ...errors, images: "" });
    }
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
            <div className={`form-group ${errors.name ? "error" : ""}`}>
              <label htmlFor="name">Product Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter Product Name"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && (
                <div className="error-message">{errors.name}</div>
              )}
            </div>

            {/* Two column layout */}
            <div className="form-row">
              {/* Product Category */}
              <div className={`form-group ${errors.category ? "error" : ""}`}>
                <label htmlFor="category">Product Categories</label>
                <div className="form-group">
                  <div className="selected-categories">
                    {formData.category.map((cat) => (
                      <span className="badge" key={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => {
                            const updated = formData.category.filter(
                              (c) => c !== cat
                            );
                            setFormData({ ...formData, category: updated });
                            if (errors.category) {
                              setErrors({ ...errors, category: "" });
                            }
                          }}
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>

                  <select
                    id="category"
                    name="category"
                    value="" // always reset to empty to allow adding new categories
                    onChange={(e) => {
                      const newCategory = e.target.value;
                      if (
                        newCategory &&
                        !formData.category.includes(newCategory)
                      ) {
                        setFormData({
                          ...formData,
                          category: [...formData.category, newCategory],
                        });
                        if (errors.category) {
                          setErrors({ ...errors, category: "" });
                        }
                      }
                      e.target.value = ""; // reset dropdown selection after adding
                    }}
                    className="category-select"
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
                    {["appetizers", "mains", "desserts", "drinks", "sides"].map(
                      (option) => (
                        <option
                          key={option}
                          value={option}
                          disabled={formData.category.includes(option)}
                        >
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </option>
                      )
                    )}
                  </select>
                </div>
                {errors.category && (
                  <div className="error-message">{errors.category}</div>
                )}
              </div>

              {/* Stock Quantity */}
              <div className={`form-group ${errors.quantity ? "error" : ""}`}>
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
                {errors.quantity && (
                  <div className="error-message">{errors.quantity}</div>
                )}
              </div>
            </div>

            {/* Two column layout */}
            <div className="form-row">
              {/* Product Price */}
              <div className={`form-group ${errors.price ? "error" : ""}`}>
                <label htmlFor="price">Product Price</label>
                <input
                  type="text"
                  id="price"
                  name="price"
                  placeholder="Enter product price"
                  value={formData.price}
                  onChange={handleChange}
                />
                {errors.price && (
                  <div className="error-message">{errors.price}</div>
                )}
              </div>

              {/* Discount Price */}
              <div
                className={`form-group ${errors.discountPrice ? "error" : ""}`}
              >
                <label htmlFor="discountPrice">Discount Price</label>
                <input
                  type="text"
                  id="discountPrice"
                  name="discountPrice"
                  placeholder="Enter Discount price"
                  value={formData.discountPrice}
                  onChange={handleChange}
                />
                {errors.discountPrice && (
                  <div className="error-message">{errors.discountPrice}</div>
                )}
              </div>
            </div>

            {/* Product Description */}
            <div className={`form-group ${errors.description ? "error" : ""}`}>
              <label htmlFor="description">Product Description</label>
              <textarea
                id="description"
                name="description"
                placeholder="Describe your product"
                value={formData.description}
                onChange={handleChange}
                rows={5}
              ></textarea>
              {errors.description && (
                <div className="error-message">{errors.description}</div>
              )}
            </div>

            {/* Main Product Image Upload */}
            <div className={`form-group ${errors.mainImage ? "error" : ""}`}>
              <label>
                Main Product Image <span className="required">*</span>
              </label>

              {/* Hidden file input for main image */}
              <input
                type="file"
                ref={mainImageUploadRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleMainImageChange}
              />

              {/* Display uploaded main image */}
              {formData.mainImage ? (
                <div className="main-image-container">
                  <div className="main-image-preview">
                    <img
                      src={formData.mainImage.preview}
                      alt="Main Product Preview"
                      className="main-image"
                    />
                    <button
                      type="button"
                      className="remove-image"
                      onClick={removeMainImage}
                      aria-label="Remove main image"
                    >
                      <X size={16} color="#000" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={`main-image-upload-area ${
                    isMainImageDragging ? "dragging" : ""
                  }`}
                  onDragEnter={handleMainImageDragEnter}
                  onDragLeave={handleMainImageDragLeave}
                  onDragOver={handleMainImageDragOver}
                  onDrop={handleMainImageDrop}
                  onClick={triggerMainImageFileInput}
                >
                  <div className="upload-placeholder-main">
                    <Image size={36} color="#aaa" />
                    <p>Drag and drop main product image or click to upload</p>
                  </div>
                </div>
              )}

              {errors.mainImage && (
                <div className="error-message">{errors.mainImage}</div>
              )}
            </div>

            {/* Additional Images Upload */}
            <div className={`form-group ${errors.images ? "error" : ""}`}>
              <label>Additional Product Images (Max 4)</label>

              {/* Hidden file input for additional images */}
              <input
                type="file"
                ref={uploadRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleImageChange}
                multiple
              />

              {/* Display uploaded additional images in a grid with 3 per row */}
              {formData.images.length > 0 && (
                <div className="image-upload-container">
                  <div className="image-preview-grid">
                    {formData.images.map((img, index) => (
                      <div key={index} className="image-preview-item">
                        <img
                          src={img.preview}
                          alt={`Product Preview ${index + 1}`}
                          className="image-preview"
                        />
                        <button
                          type="button"
                          className="remove-image"
                          onClick={() => removeImage(index)}
                          aria-label="Remove image"
                        >
                          <X size={16} color="#000" />
                        </button>
                      </div>
                    ))}

                    {/* Add more images button (if less than 4) */}
                    {formData.images.length < 4 && (
                      <div
                        className="add-more-images"
                        onClick={triggerFileInput}
                      >
                        <Plus size={24} color="#000" />
                        <span>Add More</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Upload area (shown only when no additional images are uploaded) */}
              {formData.images.length === 0 && (
                <div
                  className={`image-upload-area ${
                    isDragging ? "dragging" : ""
                  }`}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={triggerFileInput}
                >
                  <div className="upload-placeholder">
                    <Upload size={36} color="#aaa" />
                    <p>
                      Drag and drop up to 4 additional images or click to upload
                    </p>
                  </div>
                </div>
              )}

              {errors.images && (
                <div className="error-message">{errors.images}</div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button type="submit" className="add-button">
              Add Product
            </button>
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
