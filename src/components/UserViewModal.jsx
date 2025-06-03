import React from 'react';
import { Eye } from 'lucide-react';
import { getStatusBadge } from '../utils/getStatusBadge';
import { formatDate } from '../utils/formatDate';
import '../styles/UserViewModal.css';

const UserViewModal = ({ isOpen, onClose, account }) => {
  if (!isOpen || !account) return null;

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
          <div className="user-details-view">
            <div className="user-profile-view">
              <img
                src={account.avatar || '/api/placeholder/80/80'}
                alt={account.name}
                className="user-profile-avatar-view"
                onError={(e) => {
                  e.target.src = '/api/placeholder/80/80';
                }}
              />
              <div className="user-profile-info-view">
                <h3 className="user-profile-name-view">{account.name}</h3>
                <p className="user-profile-email-view">{account.email}</p>
                <div className="user-profile-status-view">
                  {getStatusBadge(account.status)}
                </div>
              </div>
            </div>

            <div className="user-details-grid-view">
              <div className="detail-item-view">
                <span className="detail-label-view">User ID</span>
                <span className="detail-value-view">{account.id}</span>
              </div>
              <div className="detail-item-view">
                <span className="detail-label-view">Role</span>
                <span className="detail-value-view">{account.role}</span>
              </div>
              <div className="detail-item-view">
                <span className="detail-label-view">Join Date</span>
                <span className="detail-value-view">{formatDate(account.joinDate)}</span>
              </div>
              <div className="detail-item-view">
                <span className="detail-label-view">Last Login</span>
                <span className="detail-value-view">{formatDate(account.lastLogin)}</span>
              </div>
              {'orders' in account && (
                <div className="detail-item-view">
                  <span className="detail-label-view">Total Orders</span>
                  <span className="detail-value-view">{account.orders}</span>
                </div>
              )}
              {account.permissions && (
                <div className="detail-item-view">
                  <span className="detail-label-view">Permissions</span>
                  <span className="detail-value-view">{account.permissions}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserViewModal;