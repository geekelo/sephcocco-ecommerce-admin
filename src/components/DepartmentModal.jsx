import React, { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import "../styles/CategoryModal.css";
import { getActiveOutlet } from "../utils/getActiveOutlets";

const DepartmentModal = ({
  isOpen,
  onClose,
  department,
  onSubmit,
  title = "Edit Department",
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    active: true,
  });

  const [errors, setErrors] = useState({});
  const modalRef = useRef(null);
const activeOutlet = getActiveOutlet()
  // Initialize form data when editing
  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name || "",
        description: department.description || "",
        active: department.active ?? true,

      });
    } else {
      setFormData({
        name: "",
        description: "",
        active: true,
  
      });
    }
  }, [department]);

  // ESC key closes modal
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Department name is required";
    else if (formData.name.trim().length < 2)
      newErrors.name = "Department name must be at least 2 characters";
    else if (formData.name.trim().length > 50)
      newErrors.name = "Department name must be less than 50 characters";

    if (!formData.description.trim())
      newErrors.description = "Description is required";
    else if (formData.description.trim().length < 10)
      newErrors.description = "Description must be at least 10 characters long";

    return newErrors;
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      const payload = {
       
          name: formData.name.trim(),
          address: formData.description.trim(),
          active: formData.active,
    
     
      };

      console.log("Submitting department:", payload);
      await onSubmit(payload);

    //   setFormData({
    //     name: "",
    //     description: "",
    //     active: true,
   
    //   });
      setErrors({});
    } else {
      setErrors(newErrors);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
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
            {/* Department Name */}
            <div className={`form-group ${errors.name ? "error" : ""}`}>
              <label htmlFor="name">
                Department Name <span className="required">*</span>
              </label>
              <input
                style={{ color: "#000" }}
                type="text"
                id="name"
                name="name"
                placeholder="Enter department name"
                value={formData.name}
                onChange={handleChange}
                maxLength={50}
                autoFocus
              />
              <div className="character-count">{formData.name.length}/50</div>
              {errors.name && <div className="error-message">{errors.name}</div>}
            </div>

            {/* Department Description */}
            <div className={`form-group ${errors.description ? "error" : ""}`}>
              <label htmlFor="description">
                Department Description <span className="required">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                placeholder="Describe this department..."
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


            {/* Active Status */}
          <div className="form-group checkbox-group">
  <label className="switch">
    <input
      type="checkbox"
      name="active"
      checked={formData.active}
      onChange={handleChange}
    />
    <span className="slider-department round"></span>
  </label>
  <span className="switch-label-department">Active Department</span>
</div>

          </div>

          <div className="form-actions">
            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="button-spinner"></div>
                  {department ? "Updating..." : "Adding..."}
                </>
              ) : department ? (
                "Update Department"
              ) : (
                "Add Department"
              )}
            </button>
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepartmentModal;
