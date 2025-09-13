import React, { useEffect } from 'react';
import { 
  Eye, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Activity, 
  Clock, 
  CreditCard, 
  Building2, 
  MessageSquare,
  CheckCircle,
  XCircle,
  Users
} from 'lucide-react';
import { getStatusBadge } from '../utils/getStatusBadge';
import { formatDate } from '../utils/formatDate';
import '../styles/UserViewModal.css';

const UserViewModal = ({ isOpen, onClose, account }) => {
  // Add useEffect to manage body class and dropdown state for modal
  useEffect(() => {
    if (isOpen) {
      // Add class to body when modal opens
      document.body.classList.add('modal-open');
      
      // Close any open dropdowns
      const openDropdowns = document.querySelectorAll('.actions-dropdown-table.show-menu-table');
      openDropdowns.forEach(dropdown => {
        dropdown.classList.remove('show-menu-table');
      });
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Remove class when modal closes
      document.body.classList.remove('modal-open');
      document.body.style.overflow = 'unset';
    }

    // Cleanup function
    return () => {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !account) return null;

  // Helper function to format phone numbers
  const formatPhoneNumber = (phone) => {
    if (!phone) return 'Not provided';
    return phone;
  };

  // Helper function to get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'unsuspended':
        return <CheckCircle size={16} className="status-icon-active" />;
      case 'suspended':
        return <XCircle size={16} className="status-icon-suspended" />;
      default:
        return <Clock size={16} className="status-icon-inactive" />;
    }
  };

  // Helper function to get role icon and styling
  const getRoleDisplay = (role) => {
    const roleMap = {
      'admin': { icon: <Shield size={16} />, class: 'role-admin' },
      'rider': { icon: <Users size={16} />, class: 'role-rider' },
      'user': { icon: <User size={16} />, class: 'role-user' },
      'superadmin': { icon: <Shield size={16} />, class: 'role-superadmin' },
      'manager': { icon: <Shield size={16} />, class: 'role-manager' },
      'frontdesk': { icon: <Shield size={16} />, class: 'role-frontdesk' },
      'support': { icon: <Shield size={16} />, class: 'role-support' }
    };
    
    const roleInfo = roleMap[role] || roleMap['user'];
    
    return (
      <div className={`role-display ${roleInfo.class}`}>
        {roleInfo.icon}
        <span className="role-text">{role.charAt(0).toUpperCase() + role.slice(1)}</span>
      </div>
    );
  };

  // Format outlets for display
  const formatOutlets = (outlets) => {
    if (!outlets || outlets.length === 0) return [];
    return outlets;
  };

  // Format subroles for display
  const formatSubroles = (subroles) => {
    if (!subroles || subroles.length === 0) return [];
    return subroles;
  };

  // Check if user is admin-type role
  const isAdminRole = (role) => {
    return ['admin', 'superadmin', 'manager', 'frontdesk', 'support'].includes(role);
  };

  return (
    <div className="modal-overlay-view" onClick={onClose}>
      <div className="modal-content-view" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-view">
          <h2 className="modal-title-view">
            <Eye size={20} />
            Account Details
          </h2>
          <button className="modal-close-view" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="modal-body-view">
          {/* User Profile Section */}
          <div className="user-profile-view">
            <div className="user-avatar-section">
              <div className="user-avatar-placeholder">
                {isAdminRole(account.role) ? <Shield size={28} /> : 
                 account.role === 'rider' ? <Users size={28} /> : <User size={28} />}
              </div>
              <div className="user-profile-info-view">
                <h3 className="user-profile-name-view">{account.name || 'Unknown User'}</h3>
                <p className="user-profile-email-view">{account.email}</p>
                <div className="user-profile-badges">
                  {getRoleDisplay(account.role)}
                  <div className="status-badge-container">
                    {getStatusIcon(account.status)}
                    <span className={`status-text status-${account.status}`}>
                      {account.status === 'unsuspended' ? 'Active' : 'Suspended'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Information Grid */}
          <div className="user-details-sections">
            {/* Personal Information */}
            <div className="details-section">
              <h4 className="section-title">
                <User size={18} />
                Personal Information
              </h4>
              <div className="user-details-grid-view">
                <div className="detail-item-view">
                  <span className="detail-label-view">
                    <Mail size={14} />
                    Email Address
                  </span>
                  <span className="detail-value-view">{account.email || 'Not provided'}</span>
                </div>
                
                <div className="detail-item-view">
                  <span className="detail-label-view">
                    <Phone size={14} />
                    Phone Number
                  </span>
                  <span className="detail-value-view">{formatPhoneNumber(account.phone_number)}</span>
                </div>
                
                <div className="detail-item-view">
                  <span className="detail-label-view">
                    <MessageSquare size={14} />
                    WhatsApp Number
                  </span>
                  <span className="detail-value-view">{formatPhoneNumber(account.whatsapp_number)}</span>
                </div>
                
                <div className="detail-item-view">
                  <span className="detail-label-view">
                    <MapPin size={14} />
                    Address
                  </span>
                  <span className="detail-value-view">{account.address || 'Not provided'}</span>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="details-section">
              <h4 className="section-title">
                <Shield size={18} />
                Account Information
              </h4>
              <div className="user-details-grid-view">
                <div className="detail-item-view">
                  <span className="detail-label-view">
                    <Shield size={14} />
                    Role
                  </span>
                  <span className="detail-value-view">{account.role.charAt(0).toUpperCase() + account.role.slice(1)}</span>
                </div>
                
                <div className="detail-item-view">
                  <span className="detail-label-view">
                    <Activity size={14} />
                    Status
                  </span>
                  <span className="detail-value-view">
                    {account.status === 'unsuspended' ? 'Active' : 'Suspended'}
                  </span>
                </div>
                
                <div className="detail-item-view">
                  <span className="detail-label-view">
                    <Calendar size={14} />
                    Join Date
                  </span>
                  <span className="detail-value-view">
                    {account.joinDate ? formatDate(account.joinDate) : 'Unknown'}
                  </span>
                </div>

                <div className="detail-item-view">
                  <span className="detail-label-view">
                    <Clock size={14} />
                    Last Login
                  </span>
                  <span className="detail-value-view">
                    {account.lastLogin ? formatDate(account.lastLogin) : 'Never'}
                  </span>
                </div>
              </div>
            </div>

            {/* Admin/Role-specific Information */}
            {isAdminRole(account.role) && (
              <div className="details-section">
                <h4 className="section-title">
                  <Building2 size={18} />
                  Admin Information
                </h4>
                <div className="user-details-grid-view">
                  <div className="detail-item-view">
                    <span className="detail-label-view">
                      <Building2 size={14} />
                      Assigned Outlets
                    </span>
                    <span className="detail-value-view">
                      {formatOutlets(account.outlets).length > 0 ? (
                        <div className="outlets-list">
                          {formatOutlets(account.outlets).map((outlet, index) => (
                            <span key={index} className="outlet-tag">{outlet}</span>
                          ))}
                        </div>
                      ) : (
                        'No outlets assigned'
                      )}
                    </span>
                  </div>

                  {formatSubroles(account.subroles).length > 0 && (
                    <div className="detail-item-view">
                      <span className="detail-label-view">
                        <Shield size={14} />
                        Subroles
                      </span>
                      <span className="detail-value-view">
                        <div className="subroles-list">
                          {formatSubroles(account.subroles).map((subrole, index) => (
                            <span key={index} className="subrole-tag">{subrole}</span>
                          ))}
                        </div>
                      </span>
                    </div>
                  )}
                  
                  {account.payment_ref && (
                    <div className="detail-item-view">
                      <span className="detail-label-view">
                        <CreditCard size={14} />
                        Payment Reference
                      </span>
                      <span className="detail-value-view">{account.payment_ref}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Activity Summary */}
            {(account.orders !== undefined || (account.shippings !== undefined && account.shippings !== 'not a rider')) && (
              <div className="details-section">
                <h4 className="section-title">
                  <Activity size={18} />
                  Activity Summary
                </h4>
                <div className="user-details-grid-view">
                  {account.orders !== undefined && (
                    <div className="detail-item-view">
                      <span className="detail-label-view">
                        <CreditCard size={14} />
                        Total Orders
                      </span>
                      <span className="detail-value-view">{account.orders}</span>
                    </div>
                  )}

                  {account.shippings !== undefined && account.shippings !== 'not a rider' && (
                    <div className="detail-item-view">
                      <span className="detail-label-view">
                        <Users size={14} />
                        Total Deliveries
                      </span>
                      <span className="detail-value-view">{account.shippings}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Modal Footer */}
        <div className="modal-footer-view">
          <button className="btn-secondary-view" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserViewModal;