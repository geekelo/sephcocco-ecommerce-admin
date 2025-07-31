import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical, Eye, Calendar, DollarSign } from 'lucide-react';
import '../styles/row.css';

const FlexibleTableRow = ({ 
  data, 
  columns = [],
  onRowClick,
  onActionClick,
  actions = [],
  renderCell,
  className = '',
  clickableRow = true
}) => {
  // Safety check for data
  if (!data) {
    return null;
  }
  const [showActions, setShowActions] = useState(false);
  const actionsRef = useRef(null);
  const triggerRef = useRef(null);

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

  // Calculate dropdown position to handle screen edges and prevent overflow
  useEffect(() => {
    if (showActions && triggerRef.current && actionsRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const dropdown = actionsRef.current.querySelector('.actions-menu-table');
      
      if (dropdown) {
        // Reset classes and inline styles
        dropdown.classList.remove('align-left', 'align-up');
        dropdown.style.position = 'fixed';
        
        const dropdownWidth = 160;
        const dropdownHeight = 200; // Approximate dropdown height
        
        // Calculate initial position (below and right-aligned)
        let top = triggerRect.bottom + 4;
        let left = triggerRect.right - dropdownWidth;
        
        // Check if dropdown would go off bottom of screen
        const spaceBelow = window.innerHeight - triggerRect.bottom;
        const spaceAbove = triggerRect.top;
        
        if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
          // Position above the button
          top = triggerRect.top - dropdownHeight - 4;
          dropdown.classList.add('align-up');
        }
        
        // Check if dropdown would go off left side of screen
        if (left < 16) {
          // Align to left side of button instead
          left = triggerRect.left;
          dropdown.classList.add('align-left');
        }
        
        // Check if dropdown would go off right side of screen
        if (left + dropdownWidth > window.innerWidth - 16) {
          left = window.innerWidth - dropdownWidth - 16;
        }
        
        // Apply calculated positions
        dropdown.style.top = `${top}px`;
        dropdown.style.left = `${left}px`;
        dropdown.style.right = 'auto';
        dropdown.style.bottom = 'auto';
      }
    }
  }, [showActions]);

  // Utility functions
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(value);
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const capitalizeText = (text) => {
    if (!text) return '-';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'completed':
      case 'delivered':
        return 'status-completed status-active';
      case 'pending':
      case 'delivering':
      case 'confirmed':
        return 'status-pending';
      case 'cancelled':
      case 'inactive':
      case 'rejected':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  };

  const getStageClass = (stage) => {
    switch (stage?.toLowerCase()) {
      case 'completed':
      case 'shipped':
      case 'delivered':
        return 'status-completed';
      case 'delivering':
      case 'confirmed':
        return 'status-processing';
      case 'pending':
      case 'awaiting':
        return 'status-pending';
      case 'cancelled':
      case 'rejected':
        return 'status-cancelled';
      default:
        return 'badge';
    }
  };

  const renderStages = (stages) => {
    if (!stages || !Array.isArray(stages)) return '-';
    
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {stages.map((stage, index) => (
          <span key={index} className={`status-badge ${getStageClass(stage)}`}>
            {capitalizeText(stage)}
          </span>
        ))}
      </div>
    );
  };

  // Default cell renderer with enhanced type handling
  const defaultCellRenderer = (column, data, value) => {
    // Handle different cell types based on column configuration
    if (column.type === 'custom' && column.render) {
      return column.render(value, data, column);
    }

    if (column.type === 'actions') {
      return renderActionsCell();
    }

    if (column.type === 'status' && column.statusConfig) {
      return renderStatusCell(value, column.statusConfig);
    }
    if (column.type === 'current_stage' && column.statusConfig) {
      return renderStatusCell(value, column.statusConfig);
    }

    if (column.type === 'avatar' && column.avatarConfig) {
      return renderAvatarCell(value, data, column.avatarConfig);
    }

    if (column.type === 'badge' && column.badgeConfig) {
      return renderBadgeCell(value, column.badgeConfig);
    }

    if (column.type === 'icon' && column.iconConfig) {
      return renderIconCell(value, column.iconConfig);
    }

    if (column.type === 'date' && column.dateConfig) {
      return renderDateCell(value, column.dateConfig);
    }

    if (column.type === 'currency' && column.currencyConfig) {
      return renderCurrencyCell(value, column.currencyConfig);
    }

    if (column.type === 'button' && column.buttonConfig) {
      return renderButtonCell(value, data, column.buttonConfig);
    }

    // Enhanced auto-detection based on column key
    const columnKey = column.key?.toLowerCase() || '';
    
    // Currency fields
    if (columnKey.includes('price') || columnKey.includes('cost') || columnKey.includes('amount')) {
      return (
        <div className="currency-cell">
          <span className="currency-value">{formatCurrency(value)}</span>
        </div>
      );
    }
    
    // Date fields
    if (columnKey.includes('date') || columnKey.includes('created') || columnKey.includes('updated')) {
      return (
        <div className="date-cell">
          <Calendar size={14} className="date-icon" />
          <span className="date-text">{formatDate(value)}</span>
        </div>
      );
    }
    
    // Status field
    if (columnKey === 'status') {
      return (
        <span className={`status-badge ${getStatusClass(value)}`}>
          {capitalizeText(value)}
        </span>
      );
    }
    if (columnKey === 'current_stage') {
      return (
        <span className={`status-badge ${getStatusClass(value)}`}>
          {capitalizeText(value)}
        </span>
      );
    }
    
    // Stages field
    if (columnKey === 'stages') {
      return renderStages(value);
    }
    
    // Action field
    if (columnKey === 'action' || column.type === 'button') {
      return (
        <button
          className={`cell-button ${column.buttonConfig?.className || 'view-button'}`}
          onClick={(e) => {
            e.stopPropagation();
            if (column.buttonConfig?.onClick) {
              column.buttonConfig.onClick(data);
            }
            if (onActionClick) {
              onActionClick('view', data);
            }
          }}
        >
          <Eye size={14} className="button-icon" />
          {column.buttonConfig?.text || 'View'}
        </button>
      );
    }

    // Default text rendering with optional formatting
    if (column.format) {
      return column.format(value, data);
    }

    return <span className="cell-text">{value || column.defaultValue || '-'}</span>;
  };

  // Status cell renderer
  const renderStatusCell = (value, config) => {
    const statusClass = config?.classMap?.[value] || config?.defaultClass || '';
    const statusText = config?.textMap?.[value] || value;
    
    return (
      <span className={`status-badge ${statusClass}`}>
        {config.showIcon && config.iconMap?.[value] && (
          <span className="status-icon">{config.iconMap[value]}</span>
        )}
        {statusText}
      </span>
    );
  };

  // Avatar cell renderer
  const renderAvatarCell = (value, data, config) => {
    const avatarSrc = value || config.defaultAvatar || '/default-avatar.png';
    const nameField = config.nameField || 'name';
    const subField = config.subField;
    
    return (
      <div className="avatar-cell">
        <img 
          src={avatarSrc} 
          alt={data[nameField] || 'Avatar'}
          className={`avatar ${config.size || 'medium'}`}
        />
        {config.showDetails && (
          <div className="avatar-details">
            <span className="avatar-name">{data[nameField]}</span>
            {subField && (
              <span className="avatar-sub">{data[subField]}</span>
            )}
          </div>
        )}
      </div>
    );
  };

  // Badge cell renderer
  const renderBadgeCell = (value, config) => {
    const badgeClass = config.classMap?.[value] || config.defaultClass || '';
    const badgeText = config.textMap?.[value] || value;
    
    return (
      <span className={`badge ${badgeClass}`}>
        {config.icon && <span className="badge-icon">{config.icon}</span>}
        {badgeText}
      </span>
    );
  };

  // Icon cell renderer
  const renderIconCell = (value, config) => {
    const IconComponent = config.iconMap?.[value] || config.defaultIcon;
    
    return (
      <div className="icon-cell">
        {IconComponent && <IconComponent size={config.size || 16} />}
        {config.showText && <span className="icon-text">{value}</span>}
      </div>
    );
  };

  // Date cell renderer
  const renderDateCell = (value, config) => {
    if (!value) return config.emptyText || '-';
    
    const date = new Date(value);
    const formattedDate = config.formatter 
      ? config.formatter(date)
      : date.toLocaleDateString();
    
    return (
      <div className="date-cell">
        {config.icon && <span className="date-icon">{config.icon}</span>}
        <span className="date-text">{formattedDate}</span>
      </div>
    );
  };

  // Currency cell renderer
  const renderCurrencyCell = (value, config) => {
    if (!value && value !== 0) return config.emptyText || '-';
    
    const formattedValue = config.formatter 
      ? config.formatter(value)
      : `${config.symbol || '$'}${value}`;
    
    return (
      <div className="currency-cell">
        {config.icon && <span className="currency-icon">{config.icon}</span>}
        <span className="currency-value">{formattedValue}</span>
      </div>
    );
  };

  // Button cell renderer
  const renderButtonCell = (value, data, config) => {
    return (
      <button
        className={`cell-button ${config.className || ''}`}
        onClick={(e) => {
          e.stopPropagation();
          config.onClick && config.onClick(data, value);
        }}
        disabled={config.disabled?.(data, value)}
      >
        {config.icon && <span className="button-icon">{config.icon}</span>}
        {config.text || value}
      </button>
    );
  };

  // Actions cell renderer
  const renderActionsCell = () => {
    if (!actions || actions.length === 0) return null;

    // Single action - render as button
    if (actions.length === 1) {
      const action = actions[0];
      return (
        <button
          className={`action-button ${action.className || ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onActionClick && onActionClick(action.key, data);
          }}
          disabled={action.disabled?.(data)}
        >
          {action.icon && <span className="action-icon">{action.icon}</span>}
          {action.label}
        </button>
      );
    }

    // Multiple actions - render as dropdown
    return (
      <div className="actions-cell-rows">
        <div 
          className={`actions-dropdown-table ${showActions ? 'show-menu-table' : ''}`}
          ref={actionsRef}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            ref={triggerRef}
            className="actions-trigger-table"
            onClick={() => setShowActions(!showActions)}
            aria-label="More actions"
            aria-expanded={showActions}
          >
            <MoreVertical size={16} />
          </button>
          
          {showActions && (
            <div className="actions-menu-table">
              {actions.map((action) => (
                <button
                  key={action.key}
                  className={`action-item-table ${action.className || ''}`}
                  onClick={() => {
                    onActionClick && onActionClick(action.key, data);
                    setShowActions(false);
                  }}
                  disabled={action.disabled?.(data)}
                >
                  {action.icon && <span className="action-icon">{action.icon}</span>}
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleRowClick = (e) => {
    // Don't trigger row click if clicking on actions or buttons
    if (!e.target.closest('.actions-dropdown-table') && 
        !e.target.closest('.cell-button') && 
        !e.target.closest('.action-button') &&
        clickableRow) {
      onRowClick && onRowClick(data);
    }
  };

  return (
    <div 
      className={`table-row ${className}`}
      onClick={handleRowClick}
      style={{ cursor: clickableRow ? 'pointer' : 'default' }}
    >
      {columns.map((column) => {
        if (!column || !column.key) {
          return null;
        }
        
        const value = column.accessor 
          ? column.accessor.split('.').reduce((obj, key) => obj?.[key], data)
          : data[column.key] || (column.key && column.key.includes('.') ? column.key.split('.').reduce((obj, key) => obj?.[key], data) : data[column.key]);

        return (
          <div
            key={column.key}
            className={`table-cell ${column.className || ''}`}
            style={{
              flex: column.flex || 1,
              minWidth: column.minWidth || 'auto',
              maxWidth: column.maxWidth || 'none',
              textAlign: column.align || 'left',
              ...column.style
            }}
            data-label={column.label}
          >
            {renderCell 
              ? renderCell(column, data, value)
              : defaultCellRenderer(column, data, value)
            }
          </div>
        );
      })}
    </div>
  );
};

export default FlexibleTableRow;