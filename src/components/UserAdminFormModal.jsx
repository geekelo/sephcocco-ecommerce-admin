import React, { useState } from 'react';
import { Pause, UserPlus } from 'lucide-react';
import '../styles/UserAdminFormModal.css';
import { useRegister } from '../hooks/useRegister';
import { validateEmail, validatePassword } from '../schema/LoginSchema';

const UserAdminFormModal = ({
  isEdit,
  activeTab,
  onSubmit,
  formValues,
  formErrors,
  onChange,
  closeAllModals,
}) => {
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const { mutateAsync: register } = useRegister();

  // Validation functions
  const validateName = (name) => name.trim().length >= 2;
  const validatePhone = (phone) => /^\+?[\d\s\-\(\)]{10,}$/.test(phone.trim());
  const validateAddress = (address) => address.trim().length >= 5;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...formValues, [name]: value });

    // Real-time validation
    const newErrors = { ...validationErrors };

    switch (name) {
      case 'firstName':
        if (!value.trim()) {
          newErrors.firstName = "First name is required";
        } else if (!validateName(value)) {
          newErrors.firstName = "First name must be at least 2 characters";
        } else {
          delete newErrors.firstName;
        }
        break;

      case 'lastName':
        if (!value.trim()) {
          newErrors.lastName = "Last name is required";
        } else if (!validateName(value)) {
          newErrors.lastName = "Last name must be at least 2 characters";
        } else {
          delete newErrors.lastName;
        }
        break;

      case 'email':
        if (!value.trim()) {
          newErrors.email = "Email is required";
        } else if (!validateEmail(value)) {
          newErrors.email = "Please enter a valid email address";
        } else {
          delete newErrors.email;
        }
        break;

      case 'address':
        if (!value.trim()) {
          newErrors.address = "Address is required";
        } else if (!validateAddress(value)) {
          newErrors.address = "Address must be at least 5 characters";
        } else {
          delete newErrors.address;
        }
        break;

      case 'phone_number':
        if (!value.trim()) {
          newErrors.phone_number = "Phone number is required";
        } else if (!validatePhone(value)) {
          newErrors.phone_number = "Please enter a valid phone number";
        } else {
          delete newErrors.phone_number;
        }
        break;

      case 'whatsapp_number':
        if (!value.trim()) {
          newErrors.whatsapp_number = "WhatsApp number is required";
        } else if (!validatePhone(value)) {
          newErrors.whatsapp_number = "Please enter a valid WhatsApp number";
        } else {
          delete newErrors.whatsapp_number;
        }
        break;

      case 'password':
        if (!value.trim()) {
          newErrors.password = "Password is required";
        } else if (!validatePassword(value)) {
          newErrors.password = "Password must be at least 6 characters";
        } else {
          delete newErrors.password;
        }
        // Check password confirmation match if it exists
        if (formValues.password_confirmation && value !== formValues.password_confirmation) {
          newErrors.password_confirmation = "Passwords do not match";
        } else if (formValues.password_confirmation && value === formValues.password_confirmation) {
          delete newErrors.password_confirmation;
        }
        break;

      case 'password_confirmation':
        if (!value.trim()) {
          newErrors.password_confirmation = "Please confirm your password";
        } else if (value !== formValues.password) {
          newErrors.password_confirmation = "Passwords do not match";
        } else {
          delete newErrors.password_confirmation;
        }
        break;

      case 'outlet':
        if (!value.trim()) {
          newErrors.outlet = "Please select an outlet";
        } else {
          delete newErrors.outlet;
        }
        break;

      default:
        break;
    }

    setValidationErrors(newErrors);
  };

  const handleFormSubmit = async () => {
    try {
      // Merge firstName and lastName into full name
      const fullName = `${formValues.firstName || ''} ${formValues.lastName || ''}`.trim();
      
      const payload = {
        user: {
      name: fullName,
        address: formValues.address || '',
        email: formValues.email || '',
        phone_number: formValues.phone_number || '',
        whatsapp_number: formValues.whatsapp_number || '',
        password: formValues.password || '',
        password_confirmation: formValues.password_confirmation || '',
        role: "admin",
        outlet: formValues.outlet || ''
        }
  
      };
console.log(payload);

   const response =   await register(payload);
   console.log(response);
   if (response?.message) {
closeAllModals(); 
   }
     
    } catch (error) {
      console.error('Registration failed:', error);
      // Handle error appropriately
    }
  };
  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    // Trigger validation on blur
    validateField(name, value);
  };
  return (
    <div className="modal-overlay-form" onClick={closeAllModals}>
      <div className="user-admin-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-form">
          <h2 className="modal-title-form">
            <UserPlus size={20} />
            {isEdit ? 'Edit' : 'Add New'} {'User'}
          </h2>
          <button className="modal-close-form" onClick={closeAllModals}>
            ×
          </button>
        </div>

        <div className="modal-body-form">
          <form className="modal-form-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-field-form">
              <label className="form-label-form" htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formValues.firstName || ''}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`form-input-form ${validationErrors.firstName || formErrors.firstName ? 'error' : ''}`}
                placeholder="Enter first name"
              />
              {(validationErrors.firstName || formErrors.firstName) && (
                <div className="form-error-form">{validationErrors.firstName || formErrors.firstName}</div>
              )}
            </div>

            <div className="form-field-form">
              <label className="form-label-form" htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formValues.lastName || ''}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`form-input-form ${validationErrors.lastName || formErrors.lastName ? 'error' : ''}`}
                placeholder="Enter last name"
              />
              {(validationErrors.lastName || formErrors.lastName) && (
                <div className="form-error-form">{validationErrors.lastName || formErrors.lastName}</div>
              )}
            </div>

            <div className="form-field-form">
              <label className="form-label-form" htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formValues.email || ''}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`form-input-form ${validationErrors.email || formErrors.email ? 'error' : ''}`}
                placeholder="Enter email address"
              />
              {(validationErrors.email || formErrors.email) && (
                <div className="form-error-form">{validationErrors.email || formErrors.email}</div>
              )}
            </div>

            <div className="form-field-form">
              <label className="form-label-form" htmlFor="address">Address</label>
              <input
                id="address"
                name="address"
                type="text"
                value={formValues.address || ''}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`form-input-form ${validationErrors.address || formErrors.address ? 'error' : ''}`}
                placeholder="Enter address"
              />
              {(validationErrors.address || formErrors.address) && (
                <div className="form-error-form">{validationErrors.address || formErrors.address}</div>
              )}
            </div>

            <div className="form-field-form">
              <label className="form-label-form" htmlFor="phone_number">Phone Number</label>
              <input
                id="phone_number"
                name="phone_number"
                type="tel"
                value={formValues.phone_number || ''}
                onChange={handleInputChange}
                className={`form-input-form ${validationErrors.phone_number || formErrors.phone_number ? 'error' : ''}`}
                placeholder="Enter phone number"
              />
              {(validationErrors.phone_number || formErrors.phone_number) && (
                <div className="form-error-form">{validationErrors.phone_number || formErrors.phone_number}</div>
              )}
            </div>

            <div className="form-field-form">
              <label className="form-label-form" htmlFor="whatsapp_number">WhatsApp Number</label>
              <input
                id="whatsapp_number"
                name="whatsapp_number"
                type="tel"
                value={formValues.whatsapp_number || ''}
                onChange={handleInputChange}
                className={`form-input-form ${validationErrors.whatsapp_number || formErrors.whatsapp_number ? 'error' : ''}`}
                placeholder="Enter WhatsApp number"
              />
              {(validationErrors.whatsapp_number || formErrors.whatsapp_number) && (
                <div className="form-error-form">{validationErrors.whatsapp_number || formErrors.whatsapp_number}</div>
              )}
            </div>

            <div className="form-field-form">
              <label className="form-label-form" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={formValues.password || ''}
                onChange={handleInputChange}
                className={`form-input-form ${validationErrors.password || formErrors.password ? 'error' : ''}`}
                placeholder="Enter password"
              />
              {(validationErrors.password || formErrors.password) && (
                <div className="form-error-form">{validationErrors.password || formErrors.password}</div>
              )}
            </div>

            <div className="form-field-form">
              <label className="form-label-form" htmlFor="password_confirmation">Confirm Password</label>
              <input
                id="password_confirmation"
                name="password_confirmation"
                type="password"
                value={formValues.password_confirmation || ''}
                onChange={handleInputChange}
                className={`form-input-form ${validationErrors.password_confirmation || formErrors.password_confirmation ? 'error' : ''}`}
                placeholder="Confirm password"
              />
              {(validationErrors.password_confirmation || formErrors.password_confirmation) && (
                <div className="form-error-form">{validationErrors.password_confirmation || formErrors.password_confirmation}</div>
              )}
            </div>

            <div className="form-field-form">
              <label className="form-label-form" htmlFor="outlet">Outlet</label>
              <select
                id="outlet"
                name="outlet"
                value={formValues.outlet || ''}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`form-select-form ${validationErrors.outlet || formErrors.outlet ? 'error' : ''}`}
              >
                <option disabled value="">Select outlet</option>
                <option value="restaurant">Restaurant</option>
                <option value="pharmacy">Pharmacy</option>
                <option value="lounge">Lounge</option>
              </select>
              {(validationErrors.outlet || formErrors.outlet) && (
                <div className="form-error-form">{validationErrors.outlet || formErrors.outlet}</div>
              )}
            </div>

            {apiError && <div className="form-error-form api-error">{apiError}</div>}

            <div className="form-actions-form">
              <button
                type="button"
                className="btn-form btn-secondary-form"
                onClick={closeAllModals}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-form btn-primary-form"
                onClick={handleFormSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="spinner"></div>
                ) : (
                  `${isEdit ? 'Update' : 'Add'} User`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserAdminFormModal;