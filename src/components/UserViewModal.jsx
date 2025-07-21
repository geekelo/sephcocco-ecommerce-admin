import React from 'react';
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
  AlertCircle,
  CheckCircle,
  XCircle,
  Users
} from 'lucide-react';
import { getStatusBadge } from '../utils/getStatusBadge';
import { formatDate } from '../utils/formatDate';
import '../styles/UserViewModal.css';

const UserViewModal = ({ isOpen, onClose, account }) => {
  if (!isOpen || !account) return null;

  // Helper function to format phone numbers
  const formatPhoneNumber = (phone) => {
    if (!phone) return 'Not provided';
    return phone;
  };

  // Helper function to get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={16} className="status-icon-active" />;
      case 'inactive':
        return <Clock size={16} className="status-icon-inactive" />;
      case 'suspended':
        return <XCircle size={16} className="status-icon-suspended" />;
      default:
        return <AlertCircle size={16} className="status-icon-default" />;
    }
  };

  // Helper function to get role icon and styling
  const getRoleDisplay = (role) => {
    const isAdmin = role === 'admin';
    return (
      <div className={`role-display ${isAdmin ? 'role-admin' : 'role-user'}`}>
        {isAdmin ? <Shield size={16} /> : <User size={16} />}
        <span className="role-text">{role.charAt(0).toUpperCase() + role.slice(1)}</span>
      </div>
    );
  };

  // Format outlets for display
  const formatOutlets = (outlets) => {
    if (!outlets || outlets.length === 0) return 'No outlets assigned';
    return outlets.join(', ');
  };

  // Calculate account age
  const getAccountAge = (joinDate) => {
    if (!joinDate) return 'Unknown';
    const now = new Date();
    const join = new Date(joinDate);
    const diffTime = Math.abs(now - join);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  };

  // Get last activity status
  const getLastActivityStatus = (lastLogin) => {
    if (!lastLogin) return { text: 'Never logged in', className: 'activity-never' };
    
    const now = new Date();
    const lastLoginDate = new Date(lastLogin);
    const diffHours = Math.abs(now - lastLoginDate) / (1000 * 60 * 60);
    
    if (diffHours < 24) return { text: 'Active today', className: 'activity-today' };
    if (diffHours < 168) return { text: 'Active this week', className: 'activity-week' };
    if (diffHours < 720) return { text: 'Active this month', className: 'activity-month' };
    return { text: 'Inactive', className: 'activity-inactive' };
  };

  const lastActivity = getLastActivityStatus(account.lastLogin);

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
                {account.role === 'admin' ? <Shield size={24} /> : <Users size={24} />}
              </div>
              <div className="user-profile-info-view">
                <h3 className="user-profile-name-view">{account.name || 'Unknown User'}</h3>
                <p className="user-profile-email-view">{account.email}</p>
                <div className="user-profile-badges">
                  {getRoleDisplay(account.role)}
                  <div className="status-badge-container">
                    {getStatusIcon(account.status)}
                    {getStatusBadge(account.status)}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="user-quick-stats">
              <div className="quick-stat-item">
                <Calendar size={16} />
                <div className="quick-stat-info">
                  <span className="quick-stat-label">Account Age</span>
                  <span className="quick-stat-value">{getAccountAge(account.joinDate)}</span>
                </div>
              </div>
              
              <div className="quick-stat-item">
                <Activity size={16} />
                <div className="quick-stat-info">
                  <span className="quick-stat-label">Activity</span>
                  <span className={`quick-stat-value ${lastActivity.className}`}>
                    {lastActivity.text}
                  </span>
                </div>
              </div>
              
              {account.orders !== undefined && (
                <div className="quick-stat-item">
                  <CreditCard size={16} />
                  <div className="quick-stat-info">
                    <span className="quick-stat-label">Total Orders</span>
                    <span className="quick-stat-value">{account.orders}</span>
                  </div>
                </div>
              )}
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
                  <span className="detail-value-view">{account.role}</span>
                </div>
                
                <div className="detail-item-view">
                  <span className="detail-label-view">
                    <Activity size={14} />
                    Status
                  </span>
                  <span className="detail-value-view">{account.status}</span>
                </div>
                
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

            {/* Admin-specific Information */}
            {account.role === 'admin' && (
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
                      {account.outlets && account.outlets.length > 0 ? (
                        <div className="outlets-list">
                          {account.outlets.map((outlet, index) => (
                            <span key={index} className="outlet-tag">{outlet}</span>
                          ))}
                        </div>
                      ) : (
                        'No outlets assigned'
                      )}
                    </span>
                  </div>
                  
                  {account.permissions && (
                    <div className="detail-item-view">
                      <span className="detail-label-view">
                        <Shield size={14} />
                        Permissions
                      </span>
                      <span className="detail-value-view">{account.permissions}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Activity Information */}
            <div className="details-section">
              <h4 className="section-title">
                <Clock size={18} />
                Activity Information
              </h4>
              <div className="user-details-grid-view">
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
                
                <div className="detail-item-view">
                  <span className="detail-label-view">
                    <Activity size={14} />
                    Account Age
                  </span>
                  <span className="detail-value-view">{getAccountAge(account.joinDate)}</span>
                </div>
                
                {account.orders !== undefined && (
                  <div className="detail-item-view">
                    <span className="detail-label-view">
                      <CreditCard size={14} />
                      Total Orders
                    </span>
                    <span className="detail-value-view">{account.orders}</span>
                  </div>
                )}
              </div>
            </div>
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