import React from 'react';
import { UserPlus } from 'lucide-react';
import '../styles/UserAdminFormModal.css';

const UserAdminFormModal = ({
  isEdit,
  activeTab,
  onSubmit,
  formValues,
  formErrors,
  onChange,
  closeAllModals,
}) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...formValues, [name]: value });
  };

  const handleFormSubmit = () => {
    // Merge firstName and lastName into full name before submission
    const fullName = `${formValues.firstName || ''} ${formValues.lastName || ''}`.trim();
    const submissionData = {
      ...formValues,
      name: fullName,
    };
    delete submissionData.firstName;
    delete submissionData.lastName;
    onSubmit(submissionData);
  };

  return (
    <div className="modal-overlay-form" onClick={closeAllModals}>
      <div className="user-admin-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-form">
          <h2 className="modal-title-form">
            <UserPlus size={20} />
            {isEdit ? 'Edit' : 'Add New'} {activeTab === 'users' ? 'User' : 'Admin'}
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
                className={`form-input-form ${formErrors.firstName ? 'error' : ''}`}
                placeholder="Enter first name"
              />
              {formErrors.firstName && (
                <div className="form-error-form">{formErrors.firstName}</div>
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
                className={`form-input-form ${formErrors.lastName ? 'error' : ''}`}
                placeholder="Enter last name"
              />
              {formErrors.lastName && (
                <div className="form-error-form">{formErrors.lastName}</div>
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
                className={`form-input-form ${formErrors.email ? 'error' : ''}`}
                placeholder="Enter email address"
              />
              {formErrors.email && (
                <div className="form-error-form">{formErrors.email}</div>
              )}
            </div>

            <div className="form-field-form">
              <label className="form-label-form" htmlFor="role">Role</label>
              <select
                id="role"
                name="role"
                value={formValues.role || ''}
                onChange={handleInputChange}
                className={`form-select-form ${formErrors.role ? 'error' : ''}`}
              >
                <option value="">Select role</option>
                {activeTab === 'users' ? (
                  <>
                    <option value="Customer">Customer</option>
                    <option value="Premium Customer">Premium Customer</option>
                  </>
                ) : (
                  <>
                    <option value="Manager">Manager</option>
                    <option value="Super Admin">Super Admin</option>
                    <option value="Admin">Admin</option>
                  </>
                )}
              </select>
              {formErrors.role && (
                <div className="form-error-form">{formErrors.role}</div>
              )}
            </div>

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
              >
                {isEdit ? 'Update' : 'Add'} {activeTab === 'users' ? 'User' : 'Admin'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserAdminFormModal;