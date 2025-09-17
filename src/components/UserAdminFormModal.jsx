import { Eye, EyeOff, UserPlus, X } from 'lucide-react';
import '../styles/UserAdminFormModal.css';
import { useRegister } from '../hooks/useRegister';
import { validateEmail, validatePassword } from '../schema/LoginSchema';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { useRoles } from '../hooks/useRoles';
import { toast } from 'react-toastify';

const UserAdminFormModal = ({
  isEdit,
  activeTab,
  isLoading,
  onSubmit,
  formValues,
  formErrors,
  onChange,
  closeAllModals,
}) => {
  const [validationErrors, setValidationErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { mutateAsync: register, isPending } = useRegister();
  const { data: rolesData } = useRoles();

  const [outletOptions, setOutletOptions] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);

  useEffect(() => {
    loadOutlets();
  }, [activeTab]);

  useEffect(() => {
    if (rolesData && Array.isArray(rolesData)) {
      setRoleOptions(rolesData);
    }
  }, [rolesData]);

  const loadOutlets = () => {
    try {
      const outletsFromCookies = Cookies.get('outlets');
      if (outletsFromCookies) {
        const parsedOutlets = JSON.parse(outletsFromCookies);
        setOutletOptions(Array.isArray(parsedOutlets) ? parsedOutlets : []);
      } else {
        setOutletOptions([]);
      }
    } catch (error) {
      console.error('Error parsing outlets from cookies:', error);
      setOutletOptions([]);
    }
  };

  // Validation functions
  const validateName = (name) => name.trim().length >= 2;
  const validatePhone = (phone) => /^\+?[\d\s\-\(\)]{10,}$/.test(phone.trim());
  const validateAddress = (address) => address.trim().length >= 3;

  // Check if password is required for current tab
  const isPasswordRequired = () => {
    return activeTab === "admins" && !isEdit;
  };

  // ===== Outlets Handlers =====
  const handleOutletSelect = (e) => {
    const selectedValue = e.target.value;
    if (!selectedValue) return;

    const currentOutlets = formValues.outlets || [];
    if (!currentOutlets.includes(selectedValue)) {
      const updatedOutlets = [...currentOutlets, selectedValue];
      onChange({ ...formValues, outlets: updatedOutlets });

      const newErrors = { ...validationErrors };
      delete newErrors.outlets;
      setValidationErrors(newErrors);
    }
    e.target.value = '';
  };

  const removeOutlet = (outletToRemove) => {
    const currentOutlets = formValues.outlets || [];
    const updatedOutlets = currentOutlets.filter(outlet => outlet !== outletToRemove);
    onChange({ ...formValues, outlets: updatedOutlets });

    const newErrors = { ...validationErrors };
    if (updatedOutlets.length === 0) {
      newErrors.outlets = "Please select at least one outlet";
    } else {
      delete newErrors.outlets;
    }
    setValidationErrors(newErrors);
  };

  const getAvailableOptions = () => {
    const selectedOutlets = formValues.outlets || [];
    return outletOptions.filter(option => !selectedOutlets.includes(option));
  };

  // ===== Roles Handlers (FIXED) =====
  const handleRoleSelect = (e) => {
    const selectedRoleId = e.target.value;
    if (!selectedRoleId) return;

    const currentRoles = formValues.subroles || []; // Use subroles consistently
    if (!currentRoles.includes(selectedRoleId)) {
      const updatedRoles = [...currentRoles, selectedRoleId];
      onChange({ ...formValues, subroles: updatedRoles }); // Use subroles consistently

      const newErrors = { ...validationErrors };
      delete newErrors.subroles; // Use subroles consistently
      setValidationErrors(newErrors);
    }
    e.target.value = "";
  };

  const removeRole = (roleIdToRemove) => {
    const currentRoles = formValues.subroles || []; // Use subroles consistently
    const updatedRoles = currentRoles.filter((roleId) => roleId !== roleIdToRemove);
    onChange({ ...formValues, subroles: updatedRoles }); // Use subroles consistently

    const newErrors = { ...validationErrors };
    if (updatedRoles.length === 0) {
      newErrors.subroles = "Please select at least one role"; // Use subroles consistently
    } else {
      delete newErrors.subroles; // Use subroles consistently
    }
    setValidationErrors(newErrors);
  };

  const getAvailableRoles = () => {
    const selectedRoles = formValues.subroles || []; // Use subroles consistently
    return roleOptions.filter((role) => !selectedRoles.includes(role.id));
  };

  // ===== Input Handlers =====
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...formValues, [name]: value });

    const newErrors = { ...validationErrors };

    switch (name) {
      case 'firstName':
        if (!value.trim()) newErrors.firstName = "First name is required";
        else if (!validateName(value)) newErrors.firstName = "First name must be at least 2 characters";
        else delete newErrors.firstName;
        break;

      case 'lastName':
        if (!value.trim()) newErrors.lastName = "Last name is required";
        else if (!validateName(value)) newErrors.lastName = "Last name must be at least 2 characters";
        else delete newErrors.lastName;
        break;

      case 'email':
        if (!value.trim()) newErrors.email = "Email is required";
        else if (!validateEmail(value)) newErrors.email = "Please enter a valid email address";
        else delete newErrors.email;
        break;

      case 'address':
        if (!value.trim()) newErrors.address = "Address is required";
        else if (!validateAddress(value)) newErrors.address = "Address must be at least 3 characters";
        else delete newErrors.address;
        break;

      case 'phone_number':
        if (!value.trim()) newErrors.phone_number = "Phone number is required";
        else if (!validatePhone(value)) newErrors.phone_number = "Please enter a valid phone number";
        else delete newErrors.phone_number;
        break;

      case 'whatsapp_number':
        if (!value.trim()) newErrors.whatsapp_number = "WhatsApp number is required";
        else if (!validatePhone(value)) newErrors.whatsapp_number = "Please enter a valid WhatsApp number";
        else delete newErrors.whatsapp_number;
        break;

      case 'password':
        if (isPasswordRequired()) {
          if (!value.trim()) newErrors.password = "Password is required";
          else if (!validatePassword(value)) newErrors.password = "Password must be at least 6 characters";
          else delete newErrors.password;

          if (formValues.password_confirmation && value !== formValues.password_confirmation) {
            newErrors.password_confirmation = "Passwords do not match";
          } else if (formValues.password_confirmation) {
            delete newErrors.password_confirmation;
          }
        }
        break;

      case 'password_confirmation':
        if (isPasswordRequired()) {
          if (!value.trim()) newErrors.password_confirmation = "Please confirm your password";
          else if (value !== formValues.password) newErrors.password_confirmation = "Passwords do not match";
          else delete newErrors.password_confirmation;
        }
        break;

      default:
        break;
    }

    setValidationErrors(newErrors);
  };

  // ===== Form Submit (FIXED) =====
  const handleFormSubmit = async () => {
    setApiError("");

    try {
      if (activeTab === "admins") {
        if (!formValues.outlets || formValues.outlets.length === 0) {
          setValidationErrors(prev => ({ ...prev, outlets: "Please select at least one outlet" }));
          return;
        }
        // FIXED: Check subroles instead of roles
        if (!formValues.subroles || formValues.subroles.length === 0) {
          setValidationErrors(prev => ({ ...prev, subroles: "Please select at least one role" }));
          return;
        }
      }

      if (Object.keys(validationErrors).length > 0) return;

      const fullName = `${formValues.firstName || ''} ${formValues.lastName || ''}`.trim();

      let payload;
      if (isEdit) {
        onSubmit(formValues);
      } else {
        if (activeTab === "admins") {
          // Convert role IDs to role names for API
          const subroleNames = (formValues.subroles || []).map(roleId => {
            const role = roleOptions.find(r => r.id === roleId);
            return role ? role.name : roleId;
          });

          payload = {
            user: {
              name: fullName,
              address: formValues.address || '',
              email: formValues.email || '',
              phone_number: formValues.phone_number || '',
              whatsapp_number: formValues.whatsapp_number || '',
              password: formValues.password || '',
              password_confirmation: formValues.password_confirmation || '',
              role: 'admin',
              'sub-roles': subroleNames, // Use converted names
              outlets: formValues.outlets || []
            }
          };
        } else if (activeTab === "users") {
          payload = {
            user: {
              name: fullName,
              address: formValues.address || '',
              email: formValues.email || '',
              phone_number: formValues.phone_number || '',
              whatsapp_number: formValues.whatsapp_number || '',
              role: "user"
            }
          };
        } else if (activeTab === "riders") {
          payload = {
            user: {
              name: fullName,
              address: formValues.address || '',
              email: formValues.email || '',
              phone_number: formValues.phone_number || '',
              whatsapp_number: formValues.whatsapp_number || '',
              role: "rider"
            }
          };
        }

        const response = await register(payload);
          toast.success(`${activeTab === "admins" ? "Admin" : activeTab === "users" ? "User" : "Rider"} Added successfully`);
        if (response?.message) {
          closeAllModals();
        }
      }
    } catch (error) {
      console.error('Form submission failed:', error);
      setApiError(error.message || 'An error occurred while processing your request');
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    console.log(`Field ${name} blurred with value:`, value);
  };

  return (
    <div className="modal-overlay-form" onClick={closeAllModals}>
      <div className="user-admin-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-form">
          <h2 className="modal-title-form">
            <UserPlus size={20} />
            {isEdit ? 'Edit' : 'Add New'} {activeTab === 'users' ? 'User' : activeTab === 'riders' ? 'Rider' : 'Admin'}
          </h2>
          <button className="modal-close-form" onClick={closeAllModals}>×</button>
        </div>

        <div className="modal-body-form">
          <form className="modal-form-form" onSubmit={(e) => e.preventDefault()}>
            
            {/* FIRST NAME */}
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

            {/* LAST NAME */}
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

            {/* EMAIL */}
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

            {/* ADDRESS */}
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

            {/* PHONE */}
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

            {/* WHATSAPP */}
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

            {/* PASSWORD FIELDS */}
            {isPasswordRequired() && (
              <>
                <div className="form-field-form">
                  <label className="form-label-form" htmlFor="password">Password</label>
                  <div className="form-input-wrapper">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formValues.password || ''}
                      onChange={handleInputChange}
                      className={`form-input-form ${validationErrors.password || formErrors.password ? 'error' : ''}`}
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      className="password-toggle-icon"
                      onClick={() => setShowPassword(prev => !prev)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {(validationErrors.password || formErrors.password) && (
                    <div className="form-error-form">{validationErrors.password || formErrors.password}</div>
                  )}
                </div>

                <div className="form-field-form">
                  <label className="form-label-form" htmlFor="password_confirmation">Confirm Password</label>
                  <div className="form-input-wrapper">
                    <input
                      id="password_confirmation"
                      name="password_confirmation"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formValues.password_confirmation || ''}
                      onChange={handleInputChange}
                      className={`form-input-form ${validationErrors.password_confirmation || formErrors.password_confirmation ? 'error' : ''}`}
                      placeholder="Confirm password"
                    />
                    <button
                      type="button"
                      className="password-toggle-icon"
                      onClick={() => setShowConfirmPassword(prev => !prev)}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {(validationErrors.password_confirmation || formErrors.password_confirmation) && (
                    <div className="form-error-form">{validationErrors.password_confirmation || formErrors.password_confirmation}</div>
                  )}
                </div>
              </>
            )}

            {/* ROLES (Admins Only) - FIXED */}
            {activeTab === "admins" && (
              <div className="form-field-form">
                <label className="form-label-form">Sub Roles</label>
                {formValues.subroles && formValues.subroles.length > 0 && (
                  <div className="selected-roles-badges">
                    {formValues.subroles.map((roleId) => {
                      const role = roleOptions.find((r) => r.id === roleId);
                      return (
                        <span key={roleId} className="outlet-badge">
                          {role ? role.name : roleId}
                          <button
                            type="button"
                            onClick={() => removeRole(roleId)}
                            className="outlet-badge-remove"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
                <select
                  onChange={handleRoleSelect}
                  className={`form-select-form ${validationErrors.subroles || formErrors.subroles ? "error" : ""}`}
                  value=""
                >
                  <option value="">
                    {getAvailableRoles().length > 0 ? "Select role to add" : "All roles selected"}
                  </option>
                  {getAvailableRoles().map((role) => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
                {(validationErrors.subroles || formErrors.subroles) && (
                  <div className="form-error-form">{validationErrors.subroles || formErrors.subroles}</div>
                )}
              </div>
            )}

            {/* OUTLETS (Admins Only) */}
            {activeTab === "admins" && (
              <div className="form-field-form">
                <label className="form-label-form">Outlets</label>
                {formValues.outlets && formValues.outlets.length > 0 && (
                  <div className="selected-outlets-badges">
                    {formValues.outlets.map((outlet) => (
                      <span key={outlet} className="outlet-badge">
                        {outlet}
                        <button
                          type="button"
                          onClick={() => removeOutlet(outlet)}
                          className="outlet-badge-remove"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <select
                  onChange={handleOutletSelect}
                  className={`form-select-form ${validationErrors.outlets || formErrors.outlets ? "error" : ""}`}
                  value=""
                >
                  <option value="">
                    {getAvailableOptions().length > 0 ? "Select outlet to add" : "All outlets selected"}
                  </option>
                  {getAvailableOptions().map((outlet) => (
                    <option key={outlet} value={outlet}>{outlet}</option>
                  ))}
                </select>
                {(validationErrors.outlets || formErrors.outlets) && (
                  <div className="form-error-form">{validationErrors.outlets || formErrors.outlets}</div>
                )}
              </div>
            )}

            {/* API ERROR */}
            {apiError && <div className="form-error-form api-error">{apiError}</div>}
          </form>
        </div>

        <div className="modal-footer-form">
          <button
            type="button"
            className="btn-cancel-form"
            onClick={closeAllModals}
            disabled={isLoading || isPending}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-submit-form"
            onClick={handleFormSubmit}
            disabled={isLoading || isPending}
          >
            {(isLoading || isPending)
              ? (isEdit ? "Saving..." : "Creating...")
              : (isEdit ? "Save Changes" : "Create")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserAdminFormModal;