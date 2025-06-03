import React, { useState, useEffect, useRef } from 'react';
import { Edit3, Trash2, Eye, MoreVertical, Ban, CheckCircle, Shield, Mail, Calendar } from 'lucide-react';
import { formatDate } from '../utils/formatDate';
import { getStatusBadge } from '../utils/getStatusBadge';

const AccountOrderRow = ({ order: account, columns, onViewOrder, onAccountAction }) => {
  const [showActions, setShowActions] = useState(false);
  const actionsRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target)) {
        setShowActions(false);
      }
    };

    if (showActions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showActions]);

  const renderColumnContent = (column, account) => {
    switch (column.id) {
      case 'user':
      case 'admin':
        return (
          <div className="user-info-cell">
            <img 
              src={account.avatar} 
              alt={account.name}
              className="user-avatar"
            />
            <div className="user-details">
              <span className="user-name">{account.name}</span>
              <span className="user-id">ID: {account.id}</span>
            </div>
          </div>
        );

      case 'email':
        return (
          <div className="email-cell">
            <Mail size={14} className="email-icon" />
            <span className="email-text">{account.email}</span>
          </div>
        );

      case 'status':
        return getStatusBadge(account.status);

      case 'orders':
        return (
          <span className="orders-count">
            {account.orders} orders
          </span>
        );

      case 'role':
        return (
          <span className={`role-badge role-${account.role.toLowerCase().replace(' ', '-')}`}>
            <Shield size={12} />
            {account.role}
          </span>
        );

      case 'permissions':
        return (
          <span className="permissions-text">
            {account.permissions}
          </span>
        );

      case 'joinDate':
        return (
          <div className="date-cell">
            <Calendar size={14} className="date-icon" />
            <span>{formatDate(account.joinDate)}</span>
          </div>
        );

      case 'lastLogin':
        return (
          <div className="date-cell">
            <span>{formatDate(account.lastLogin)}</span>
          </div>
        );

      case 'actions':
        return (
          <div className="actions-cell">
            <div 
              className="actions-dropdown" 
              ref={actionsRef}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="actions-trigger"
                onClick={() => setShowActions(!showActions)}
                aria-label="More actions"
              >
                <MoreVertical size={16} />
              </button>
              
              {showActions && (
                <div className="actions-menu">
                  <button
                    className="action-item view"
                    onClick={() => {
                      onViewOrder && onViewOrder(account);
                      setShowActions(false);
                    }}
                  >
                    <Eye size={14} />
                    View Details
                  </button>
                  
                  <button
                    className="action-item edit"
                    onClick={() => {
                      onAccountAction && onAccountAction('edit', account);
                      setShowActions(false);
                    }}
                  >
                    <Edit3 size={14} />
                    Edit Account
                  </button>
                  
                  {account.status === 'active' ? (
                    <button
                      className="action-item suspend"
                      onClick={() => {
                        onAccountAction && onAccountAction('suspend', account);
                        setShowActions(false);
                      }}
                    >
                      <Ban size={14} />
                      Suspend Account
                    </button>
                  ) : (
                    <button
                      className="action-item activate"
                      onClick={() => {
                        onAccountAction && onAccountAction('activate', account);
                        setShowActions(false);
                      }}
                    >
                      <CheckCircle size={14} />
                      Activate Account
                    </button>
                  )}
                  
                  <button
                    className="action-item delete"
                    onClick={() => {
                      onAccountAction && onAccountAction('delete', account);
                      setShowActions(false);
                    }}
                  >
                    <Trash2 size={14} />
                    Delete Account
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return account[column.id] || '-';
    }
  };

  const handleRowClick = (e) => {
    // Don't trigger row click if clicking on actions
    if (!e.target.closest('.actions-dropdown')) {
      onViewOrder && onViewOrder(account);
    }
  };

  return (
    <div 
      className="order-row account-row" 
      onClick={handleRowClick}
    >
      {columns.map(column => (
        <div
          key={column.id}
          className={`order-column ${column.className || ''}`}
        >
          {renderColumnContent(column, account)}
        </div>
      ))}
    </div>
  );
};

export default AccountOrderRow;