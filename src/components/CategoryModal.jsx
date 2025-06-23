import React, { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import "../styles/CategoryModal.css";

const CategoryModal = ({ isOpen, onClose, category, onSubmit, title = "Edit Category", mode = "category", isLoading = false }) => {
  // Form fields state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // Validation errors state
  const [errors, setErrors] = useState({});

  // Refs
  const modalRef = useRef(null);

  // Initialize form data when category changes
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        description: category.description || "",
      });
    } else {
      // Reset form for adding new category
      setFormData({
        name: "",
        description: "",
      });
    }
  }, [category]);

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

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    // Validate category name
    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Category name must be at least 2 characters long";
    } else if (formData.name.trim().length > 50) {
      newErrors.name = "Category name must be less than 50 characters";
    }

    // Validate description
    if (!formData.description.trim()) {
      newErrors.description = "Category description is required";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters long";
    } else if (formData.description.trim().length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }

    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      // Form is valid, proceed with submission
      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
      };

      console.log("Submitting category data:", categoryData);
     await onSubmit(categoryData);

      // Reset form after successful submission
      setFormData({
        name: "",
        description: "",
      });
      setErrors({});
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

  // Handle modal overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay-cat" onClick={handleOverlayClick}>
      <div className="edit-category-modal" ref={modalRef}>
        <div className="modal-header-cat">
          <h2>{title}</h2>
          <button 
            type="button" 
            className="close-button-cat" 
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="category-form">
          <div className="form-content">
            {/* Category Name */}
            <div className={`form-group ${errors.name ? "error" : ""}`}>
              <label htmlFor="name">
                Category Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter category name (e.g., Appetizers, Main Dishes)"
                value={formData.name}
                onChange={handleChange}
                maxLength={50}
                autoFocus
              />
              <div className="character-count">
                {formData.name.length}/50
              </div>
              {errors.name && (
                <div className="error-message">{errors.name}</div>
              )}
            </div>

            {/* Category Description */}
            <div className={`form-group ${errors.description ? "error" : ""}`}>
              <label htmlFor="description">
                Category Description <span className="required">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                placeholder="Describe this category and what types of products it contains..."
                value={formData.description}
                onChange={handleChange}
                rows={4}
                maxLength={500}
              />
              <div className="character-count">
                {formData.description.length}/500
              </div>
              {errors.description && (
                <div className="error-message">{errors.description}</div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="button-spinner"></div>
                  {category ? "Updating..." : "Adding..."}
                </>
              ) : (
                category ? "Update Category" : "Add Category"
              )}
            </button>
            <button type="button" className="cancel-button" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;