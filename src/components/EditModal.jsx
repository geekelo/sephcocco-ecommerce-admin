import React, { useState, useRef, useEffect } from "react";
import { X, Upload, Plus, Image } from "lucide-react";
import "../styles/AddProductModal.css";
import { validateProductForm } from "../schema/ProductSchema";
import { getActiveOutlet } from "../utils/getActiveOutlets";
import { useUpdateProduct } from "../hooks/useUpdateProduct";
import { useUploadSingleImage } from "../hooks/useUploadSingleImage";
import { useActiveDepartment } from "../hooks/useGetActiveDepartment";

const EditProductModal = ({ isOpen, onClose, product, categories = [], departments = [] }) => {
  // Get active outlet from cookies
  const active_outlet = getActiveOutlet();
  
  // Fetch departments if not provided
  const { data: fetchedDepartments = [] } = useActiveDepartment(active_outlet);
  const availableDepartments = departments.length > 0 ? departments : fetchedDepartments;

  const [formData, setFormData] = useState({
    name: "",
    category_ids: [], 
    department_id: "",
    quantity: "",
    price: "",
    discountPrice: "",
    short_description: "", 
    long_description: "",
    visible: false,
    mainImage: null,
    other_images: [], 
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
  const updateProductMutation = useUpdateProduct();
  const uploadImageMutation = useUploadSingleImage();

  // Initialize form data when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        category_ids: Array.isArray(product.categories)
          ? product.categories
          : product.categories
          ? [product.categories]
          : [],
        department_id: product.department.id || "",
        quantity: product.amount_in_stock || "",
        price: product.price || "",
        discountPrice: product.discount_price || product.discountPrice || "",
        short_description: product.short_description || "",
        long_description: product.long_description || product.description || "",
        visible: product.visible || false,
        mainImage: product.main_image_url ? { url: product.main_image_url } : null,
        other_images: product.other_image_urls ? product.other_image_urls.map(url => ({ url })) : []
      });
    }
  }, [product]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setErrors({});
      setIsSubmitting(false);
      setUploadProgress("");
    }
  }, [isOpen]);

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
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData({ ...formData, [name]: newValue });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Upload images to imgbb
  const uploadImages = async () => {
    const uploadedImages = {
      mainImageUrl: null,
      otherImageUrls: []
    };

    try {
      if (formData.mainImage && formData.mainImage.file) {
        setUploadProgress("Uploading main image...");
        const mainImageResponse = await uploadImageMutation.mutateAsync(formData.mainImage.file);
        uploadedImages.mainImageUrl = mainImageResponse.url;
      } else if (formData.mainImage && formData.mainImage.url) {
        uploadedImages.mainImageUrl = formData.mainImage.url;
      } else {
        uploadedImages.mainImageUrl = "https://i.ibb.co/VpgyJ7SM/no-image-template.png";
      }

      const existingImageUrls = formData.other_images
        .filter(img => !img.file && img.url)
        .map(img => img.url);
      
      const newImages = formData.other_images.filter(img => img.file);
      
      if (newImages.length > 0) {
        setUploadProgress("Uploading additional images...");
        const uploadPromises = newImages.map(img => 
          uploadImageMutation.mutateAsync(img.file)
        );
        const newImageResponses = await Promise.all(uploadPromises);
        const newImageUrls = newImageResponses.map(response => response.url);
        uploadedImages.otherImageUrls = [...existingImageUrls, ...newImageUrls];
      } else {
        uploadedImages.otherImageUrls = existingImageUrls;
      }

      return uploadedImages;
    } catch (error) {
      console.error("Image upload failed:", error);
      throw new Error("Failed to upload images. Please try again.");
    }
  };

  // Create FormData for product update
  const createFormData = (imageUrls) => {
    const formDataToSend = new FormData();
    
    formDataToSend.append('product[name]', formData.name.trim());
    formDataToSend.append('product[short_description]', formData.short_description.trim());
    formDataToSend.append('product[long_description]', formData.long_description.trim());
    formDataToSend.append('product[amount_in_stock]', formData.quantity.toString());
    formDataToSend.append('product[price]', formData.price.toString());
    formDataToSend.append('product[visible]', formData.visible.toString());
    
    if (formData.discountPrice && formData.discountPrice > 0) {
      formDataToSend.append('product[discount_price]', formData.discountPrice.toString());
    }
    
    formData.category_ids.forEach((categoryId) => {
      formDataToSend.append('product[category_ids][]', categoryId);
    });
    
    // Add department support
    if (formData.department_id) {
      formDataToSend.append(`product[sephcocco_${active_outlet}_department_id]`, formData.department_id);
    }
    
    if (imageUrls.mainImageUrl) {
      formDataToSend.append('product[main_image_url]', imageUrls.mainImageUrl);
    }
    
    imageUrls.otherImageUrls.forEach((url) => {
      formDataToSend.append(`product[other_image_urls][]`, url);
    });
    
    return formDataToSend;
  };

  // Handle main image upload
  const handleMainImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      setErrors({
        ...errors,
        mainImage: "Please upload only image files (PNG, JPG, JPEG)",
      });
      e.target.value = null;
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, mainImage: "Image size must be less than 5MB" });
      e.target.value = null;
      return;
    }

    const mainImage = {
      file,
      preview: URL.createObjectURL(file),
    };

    setFormData({ ...formData, mainImage });

    if (errors.mainImage) {
      setErrors({ ...errors, mainImage: "" });
    }

    e.target.value = null;
  };

  // Handle additional images upload
  const handleImageChange = (e) => {
    const files = e.target.files ? Array.from(e.target.files) : [];

    if (files.length === 0) return;

    const availableSlots = 4 - formData.other_images.length;

    if (availableSlots <= 0) {
      setErrors({
        ...errors,
        other_images: "Maximum of 4 additional images reached.",
      });
      e.target.value = null;
      return;
    }

    const filesToAdd = files.slice(0, availableSlots);

    for (const file of filesToAdd) {
      if (!file.type.match("image.*")) {
        setErrors({
          ...errors,
          other_images: "Please upload only image files (PNG, JPG, JPEG)",
        });
        e.target.value = null;
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, other_images: "Image size must be less than 5MB" });
        e.target.value = null;
        return;
      }
    }

    const newImages = filesToAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setFormData({ ...formData, other_images: [...formData.other_images, ...newImages] });

    if (errors.other_images) {
      setErrors({ ...errors, other_images: "" });
    }

    e.target.value = null;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (formData.category_ids.length === 0) {
      newErrors.category_ids = "At least one category is required";
    }

    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = "Valid quantity is required";
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = "Valid price is required";
    }

    if (!formData.short_description.trim()) {
      newErrors.short_description = "Short description is required";
    }

    if (!formData.department_id) {
      newErrors.department_id = "Department is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstErrorField = document.querySelector(".form-group-add.error");
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    try {
      setIsSubmitting(true);
      
      const uploadedImages = await uploadImages();

      setUploadProgress("Updating product...");
      const formDataToSend = createFormData(uploadedImages);
      const productResponse = await updateProductMutation.mutateAsync({
        active_outlet,
        productId: product.id,
        payload: formDataToSend
      });

      console.log("Product updated successfully:", productResponse);
      setUploadProgress("Product updated successfully!");
      
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (error) {
      console.error("Failed to update product:", error);
      setErrors({ 
        submit: error.message || "Failed to update product. Please try again." 
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setUploadProgress(""), 2000);
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

  const triggerFileInput = () => {
    if (uploadRef.current) {
      uploadRef.current.click();
    }
  };

  const triggerMainImageFileInput = () => {
    if (mainImageUploadRef.current) {
      mainImageUploadRef.current.click();
    }
  };

  const removeMainImage = () => {
    setFormData({ ...formData, mainImage: null });

    if (errors.mainImage) {
      setErrors({ ...errors, mainImage: "" });
    }
  };

  const removeImage = (index) => {
    const newImages = [...formData.other_images];
    newImages.splice(index, 1);
    setFormData({ ...formData, other_images: newImages });

    if (errors.other_images) {
      setErrors({ ...errors, other_images: "" });
    }
  };

  const handleCloseClick = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay-add">
      <div className="adds-product-modal" ref={modalRef}>
        <div className="modal-header">
          <h2>Edit Product</h2>
          <button 
            type="button" 
            className="close-button" 
            onClick={handleCloseClick}
            disabled={isSubmitting}
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-content">
            {errors.submit && (
              <div className="error-message submit-error">{errors.submit}</div>
            )}

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

            <div className={`form-group-add ${errors.name ? "error" : ""}`}>
              <label htmlFor="name">Product Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter Product Name"
                value={formData.name}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.name && (
                <div className="error-message">{errors.name}</div>
              )}
            </div>

            <div className="form-row">
              <div className={`form-group-add ${errors.category_ids ? "error" : ""}`}>
                <label htmlFor="category">Product Categories</label>
                <div className="form-group-add">
                  <div className="selected-categories">
                    {formData.category_ids.map((catId) => {
                      return (
                        <span className="badge" key={catId?.id || catId}>
                          {catId?.name || 'Unknown Category'}
                          <button
                            type="button"
                            className="remove-btn"
                            onClick={() => {
                              const updated = formData.category_ids.filter(
                                (id) => (id?.id || id) !== (catId?.id || catId)
                              );
                              setFormData({ ...formData, category_ids: updated });
                              if (errors.category_ids) {
                                setErrors({ ...errors, category_ids: "" });
                              }
                            }}
                            disabled={isSubmitting}
                          >
                            &times;
                          </button>
                        </span>
                      );
                    })}
                  </div>

                  <select
                    id="category"
                    name="category"
                    value=""
                    onChange={(e) => {
                      const selectedCategoryId = e.target.value;
                      const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
                      
                      if (
                        selectedCategory &&
                        !formData.category_ids.some(cat => (cat?.id || cat) === selectedCategoryId)
                      ) {
                        const updatedCategories = [...formData.category_ids, selectedCategory];
                        
                        setFormData({
                          ...formData,
                          category_ids: updatedCategories,
                        });
                        if (errors.category_ids) {
                          setErrors({ ...errors, category_ids: "" });
                        }
                      }
                      e.target.value = "";
                    }}
                    className="category-select"
                    disabled={isSubmitting}
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
                    {categories.map((category) => (
                      <option
                        key={category?.id}
                        value={category?.id}
                        disabled={formData.category_ids.some(cat => (cat?.id || cat) === category?.id)}
                      >
                        {category?.name}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.category_ids && (
                  <div className="error-message">{errors.category_ids}</div>
                )}
              </div>

              <div className={`form-group-add ${errors.department_id ? "error" : ""}`}>
                <label htmlFor="department">Department</label>

                <div className="selected-categories">
                  {formData.department_id && (
                    <span className="badge">
                      {availableDepartments?.find(dep => dep.id === formData.department_id)?.name || "Unknown Department"}
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => {
                          setFormData({ ...formData, department_id: "" });
                          if (errors.department_id) {
                            setErrors({ ...errors, department_id: "" });
                          }
                        }}
                        disabled={isSubmitting}
                      >
                        &times;
                      </button>
                    </span>
                  )}
                </div>

                <select
                  id="department"
                  name="department_id"
                  value={formData.department_id}
                  onChange={(e) => {
                    setFormData({ ...formData, department_id: e.target.value });
                    if (errors.department_id) {
                      setErrors({ ...errors, department_id: "" });
                    }
                  }}
                  disabled={isSubmitting}
                  className="category-select"
                >
                  <option value="">Select a department</option>
                  {availableDepartments?.map(dep => (
                    <option key={dep.id} value={dep.id}>
                      {dep.name}
                    </option>
                  ))}
                </select>

                {errors.department_id && (
                  <div className="error-message">{errors.department_id}</div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className={`form-group-add ${errors.discountPrice ? "error" : ""}`}>
                <label htmlFor="discountPrice">Product Price</label>
                <input
                  type="number"
                  step="0.01"
                  id="discountPrice"
                  name="discountPrice"
                  placeholder="Enter Discount price"
                  value={formData.discountPrice}
                  onChange={handleChange}
                  min="0"
                  disabled={isSubmitting}
                />
                {errors.discountPrice && (
                  <div className="error-message">{errors.discountPrice}</div>
                )}
              </div>
              <div className={`form-group-add ${errors.price ? "error" : ""}`}>
                <label htmlFor="price">Selling Price</label>
                <input
                  type="number"
                  step="0.01"
                  id="price"
                  name="price"
                  placeholder="Enter product price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  disabled={isSubmitting}
                />
                {errors.price && (
                  <div className="error-message">{errors.price}</div>
                )}
              </div>
            </div>

            <div className={`form-group-add ${errors.short_description ? "error" : ""}`}>
              <label htmlFor="short_description">Product Short Description</label>
              <textarea
                id="short_description"
                name="short_description"
                placeholder="Brief description of your product"
                value={formData.short_description}
                onChange={handleChange}
                rows={3}
                disabled={isSubmitting}
              ></textarea>
              {errors.short_description && (
                <div className="error-message">{errors.short_description}</div>
              )}
            </div>

            <div className={`form-group-add ${errors.long_description ? "error" : ""}`}>
              <label htmlFor="long_description">Product Long Description <span className="optional">(optional)</span></label>
              <textarea
                id="long_description"
                name="long_description"
                placeholder="Detailed description of your product"
                value={formData.long_description}
                onChange={handleChange}
                rows={5}
                disabled={isSubmitting}
              ></textarea>
              {errors.long_description && (
                <div className="error-message">{errors.long_description}</div>
              )}
            </div>

            <div className={`form-group-add ${errors.mainImage ? "error" : ""}`}>
              <label>
                Main Product Image <span className="optional">(optional)</span>
              </label>

              <input
                type="file"
                ref={mainImageUploadRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleMainImageChange}
                disabled={isSubmitting}
              />

              {formData.mainImage ? (
                <div className="main-image-container">
                  <div className="main-image-preview">
                    <img
                      src={formData.mainImage.preview || formData.mainImage.url}
                      alt="Main Product Preview"
                      className="main-image"
                    />
                    {!isSubmitting && (
                      <button
                        type="button"
                        className="remove-image"
                        onClick={removeMainImage}
                        aria-label="Remove main image"
                      >
                        <X size={16} color="#000" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  className={`main-image-upload-area ${
                    isMainImageDragging ? "dragging" : ""
                  } ${isSubmitting ? "disabled" : ""}`}
                  onDragEnter={!isSubmitting ? handleMainImageDragEnter : undefined}
                  onDragLeave={!isSubmitting ? handleMainImageDragLeave : undefined}
                  onDragOver={!isSubmitting ? handleMainImageDragOver : undefined}
                  onDrop={!isSubmitting ? handleMainImageDrop : undefined}
                  onClick={!isSubmitting ? triggerMainImageFileInput : undefined}
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

            <div className={`form-group-add ${errors.other_images ? "error" : ""}`}>
              <label>Additional Product Images (Max 4)</label>

              <input
                type="file"
                ref={uploadRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleImageChange}
                multiple
                disabled={isSubmitting}
              />

              {formData.other_images.length > 0 && (
                <div className="image-upload-container">
                  <div className="image-preview-grid">
                    {formData.other_images.map((img, index) => (
                      <div key={index} className="image-preview-item">
                        <img
                          src={img.preview || img.url}
                          alt={`Product Preview ${index + 1}`}
                          className="image-preview"
                        />
                        {!isSubmitting && (
                          <button
                            type="button"
                            className="remove-image"
                            onClick={() => removeImage(index)}
                            aria-label="Remove image"
                          >
                            <X size={16} color="#000" />
                          </button>
                        )}
                      </div>
                    ))}

                    {formData.other_images.length < 4 && !isSubmitting && (
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

              {formData.other_images.length === 0 && (
                <div
                  className={`image-upload-area ${
                    isDragging ? "dragging" : ""
                  } ${isSubmitting ? "disabled" : ""}`}
                  onDragEnter={!isSubmitting ? handleDragEnter : undefined}
                  onDragLeave={!isSubmitting ? handleDragLeave : undefined}
                  onDragOver={!isSubmitting ? handleDragOver : undefined}
                  onDrop={!isSubmitting ? handleDrop : undefined}
                  onClick={!isSubmitting ? triggerFileInput : undefined}
                >
                  <div className="upload-placeholder">
                    <Upload size={36} color="#aaa" />
                    <p>
                      Drag and drop up to 4 additional images or click to upload
                    </p>
                  </div>
                </div>
              )}

              {errors.other_images && (
                <div className="error-message">{errors.other_images}</div>
              )}
            </div>

            <div className="form-group-add">
              <label>Product Visibility</label>
              <div className="visibility-section">
                <table className="visibility-table">
                  <tbody>
                    <tr>
                      <td className="checkbox-cell">
                        <input
                          type="checkbox"
                          id="visible"
                          name="visible"
                          checked={formData.visible}
                          onChange={handleChange}
                          disabled={isSubmitting}
                          className="visibility-checkbox"
                        />
                      </td>
                      <td className="label-cell">
                        <label htmlFor="visible" className="visibility-label">
                          Make this product public
                        </label>
                      </td>
                    </tr>
                    <tr>
                      <td></td>
                      <td className="description-cell">
                        <span className="visibility-description">
                          {formData.visible 
                            ? "✓ This product will be visible to customers" 
                            : "⚠ This product will be hidden from customers"
                          }
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="add-button"
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? "Updating Product..."
                : "Update Product"
              }
            </button>
            <button 
              type="button" 
              className="cancel-button" 
              onClick={handleCloseClick}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;