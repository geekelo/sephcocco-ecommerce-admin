import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  clickableRow = true,
  mobileCardConfig = null
}) => {

  // Safety check for data
  if (!data) {
    return null;
  }
  const [showActions, setShowActions] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const actionsRef = useRef(null);
  const triggerRef = useRef(null);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target) &&
          actionsRef.current && !actionsRef.current.contains(event.target)) {
        setShowActions(false);
      }
    };

    if (showActions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showActions]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showActions) {
        setShowActions(false);
      }
    };

    if (showActions) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showActions]);

  // Calculate dropdown position using portal
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (showActions && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const dropdownWidth = 180;
      const dropdownHeight = 200;

      let top = triggerRect.bottom + 8;
      let left = triggerRect.right - dropdownWidth;

      // Adjust if going off screen
      if (left < 16) {
        left = triggerRect.left;
      }
      if (left + dropdownWidth > window.innerWidth - 16) {
        left = window.innerWidth - dropdownWidth - 16;
      }
      if (top + dropdownHeight > window.innerHeight - 16) {
        top = triggerRect.top - dropdownHeight - 8;
      }

      setDropdownPosition({ top, left });
    }
  }, [showActions]);

  // Utility functions
  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') return '-';

    const cleaned = typeof value === 'string'
      ? value.replace(/[^0-9.-]+/g, '')
      : value;

    const num = Number(cleaned);

    if (isNaN(num)) return '-';

    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(num);
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
    if (!text || typeof text !== 'string') return '-';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'completed':
      case 'delivered':
      case 'open':
        return 'status-completed status-active';
      case 'pending':
      case 'delivering':
      case 'confirmed':
        return 'status-pending';
      case 'cancelled':
      case 'inactive':
      case 'rejected':
      case 'closed':
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

  // Enhanced cell value getter that handles different column structures
  const getCellValue = (column, data) => {
    // FIRST: Check if column has a custom render function - this should take priority
    if (column.render && typeof column.render === 'function') {
      return column.render(data);
    }

    // Handle column.cell function (from react-table style)
    if (column.cell && typeof column.cell === 'function') {
      return column.cell({ row: { original: data } });
    }

    // Handle accessorKey (from react-table style)
    if (column.accessorKey) {
      return column.accessorKey.split('.').reduce((obj, key) => obj?.[key], data);
    }

    // Handle key or accessor (from custom style)
    const key = column.key || column.accessor;
    if (key) {
      if (key.includes('.')) {
        return key.split('.').reduce((obj, k) => obj?.[k], data);
      }
      return data[key];
    }

    return null;
  };

  // Mobile card configuration
  const getDefaultMobileConfig = () => {
    const primaryField = columns.find(col => {
      const key = (col.key || col.accessorKey || '').toLowerCase();
      return key.includes('name') || key.includes('user') || key.includes('customer') || key.includes('title');
    });

    return {
      primaryField: primaryField?.key || primaryField?.accessorKey || columns[0]?.key || columns[0]?.accessorKey,
      showInHeader: ['status', 'current_stage'],
      excludeFromBody: ['actions', 'action'],
      compactMode: false
    };
  };

  const mobileConfig = mobileCardConfig || getDefaultMobileConfig();

  // Render mobile card layout
  const renderMobileCard = () => {
    const primaryColumn = columns.find(col => 
      (col.key || col.accessorKey) === mobileConfig.primaryField
    );
    const primaryValue = primaryColumn ? getCellValue(primaryColumn, data) : null;

    const headerFields = columns.filter(col => {
      const key = (col.key || col.accessorKey || '').toLowerCase();
      return mobileConfig.showInHeader.includes(key) || key === 'actions' || key === 'action';
    });

    const bodyFields = columns.filter(col => {
      const key = (col.key || col.accessorKey || '').toLowerCase();
      const isPrimary = (col.key || col.accessorKey) === mobileConfig.primaryField;
      const isInHeader = mobileConfig.showInHeader.includes(key);
      const isExcluded = mobileConfig.excludeFromBody.includes(key);
      const isAction = key === 'actions' || key === 'action';
      
      return !isPrimary && !isInHeader && !isExcluded && !isAction;
    });

    return (
      <div className="mobile-card-content">
        <div className="card-header">
          <div className="primary-info">
            {primaryColumn && (
              <div className="mobile-primary-info">
                {renderMobileCellContent(primaryColumn, data, primaryValue, true)}
              </div>
            )}
            
            {headerFields.filter(col => {
              const key = (col.key || col.accessorKey || '').toLowerCase();
              return key !== 'actions' && key !== 'action';
            }).map(column => {
              const value = getCellValue(column, data);
              return (
                <div key={column.key || column.accessorKey} className="mobile-primary-status">
                  {renderMobileCellContent(column, data, value)}
                </div>
              );
            })}
          </div>
          
          <div className="card-actions mobile-card-actions">
            {renderMobileActions()}
          </div>
        </div>

        {bodyFields.length > 0 && (
          <div className="card-body">
            {bodyFields.map(column => {
              const value = getCellValue(column, data);
              const label = column.label || column.header || column.accessorKey || column.key;
              
              return (
                <div key={column.key || column.accessorKey} className="card-row">
                  <div className="card-label">{label}</div>
                  <div className="card-value">
                    {renderMobileCellContent(column, data, value)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Render cell content for mobile
  const renderMobileCellContent = (column, data, value, isPrimary = false) => {
    // If column has custom render function, use it
    if (column.render && typeof column.render === 'function') {
      return column.render(data);
    }

    const columnKey = (column.key || column.accessorKey || '').toLowerCase();
    
    if (column.cell && typeof column.cell === 'function') {
      return value;
    }

    if (columnKey.includes('user') || columnKey.includes('customer') || columnKey.includes('name')) {
      if (isPrimary && data.avatar) {
        return (
          <div className="mobile-primary-avatar">
            <img 
              src={data.avatar} 
              alt={value || 'Avatar'}
              className="avatar"
            />
            <div className="avatar-details">
              <div className="avatar-name">{value}</div>
              {data.email && <div className="avatar-sub">{data.email}</div>}
            </div>
          </div>
        );
      }
      return <div className="mobile-card-text">{value || '-'}</div>;
    }

    if (columnKey.includes('price') || columnKey.includes('cost') || columnKey.includes('amount')) {
      return <div className="mobile-card-currency">{formatCurrency(value)}</div>;
    }
    
    if (columnKey.includes('date') || columnKey.includes('created') || columnKey.includes('updated')) {
      return (
        <div className="mobile-card-date">
          <Calendar size={14} />
          <span>{formatDate(value)}</span>
        </div>
      );
    }
    
    if (columnKey === 'status' || columnKey === 'current_stage') {
      return (
        <div className="mobile-card-status">
          <span className={`status-badge ${getStatusClass(value)}`}>
            {capitalizeText(value)}
          </span>
        </div>
      );
    }
    
    if (columnKey === 'stages') {
      return <div className="mobile-card-stages">{renderStages(value)}</div>;
    }

    return <div className="mobile-card-text">{value || '-'}</div>;
  };

  // Render actions for mobile and desktop
  const renderMobileActions = () => {
    if (!actions || actions.length === 0) return null;

    // Filter available actions
    const availableActions = actions.filter(action => {
      if (action.disabled && typeof action.disabled === 'function') {
        return !action.disabled(data);
      }
      return true;
    });

    if (availableActions.length === 0) return null;

    // Single action - render as button
    if (availableActions.length === 1) {
      const action = availableActions[0];
      return (
        <button
          className={`action-button ${action.className || ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onActionClick && onActionClick(action.key, data);
          }}
        >
          {action.icon && <span className="action-icon">{action.icon}</span>}
          {action.label}
        </button>
      );
    }

    // Multiple actions - render as dropdown with portal
    return (
      <div className="actions-cell-rows">
        <div className="actions-dropdown-table">
          <button
            ref={triggerRef}
            className="actions-trigger-table"
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
            aria-label="More actions"
            aria-expanded={showActions}
          >
            <MoreVertical size={16} />
          </button>
          
          {showActions && (
            createPortal(
              <div
                ref={actionsRef}
                className="actions-menu-portal"
                style={{
                  position: 'fixed',
                  top: dropdownPosition.top,
                  left: dropdownPosition.left,
                  zIndex: 99999,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="actions-menu-table-row">
                  {availableActions.map((action) => (
                    <button
                      key={action.key}
                      className={`action-item-table ${action.className || ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onActionClick && onActionClick(action.key, data);
                        setShowActions(false);
                      }}
                    >
                      {action.icon && <span className="action-icon">{action.icon}</span>}
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>,
              document.body
            )
          )}
        </div>
      </div>
    );
  };

  // Default cell renderer - UPDATED to prioritize custom render functions
  const defaultCellRenderer = (column, data, value) => {
    // PRIORITY 1: Check for custom render function first
    if (column.render && typeof column.render === 'function') {
      return column.render(data);
    }

    // PRIORITY 2: Check for cell function
    if (column.cell && typeof column.cell === 'function') {
      return value;
    }

    if (column.type === 'custom' && column.render) {
      return column.render(value, data, column);
    }

    if (column.type === 'actions') {
      return renderMobileActions(); // Use the same actions renderer
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

    // Keep your original button handling
    if (column.type === 'button' && column.buttonConfig) {
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

    const columnKey = (column.key || column.accessorKey || '')?.toLowerCase() || '';
    
    if (columnKey.includes('price') || columnKey.includes('cost') || columnKey.includes('amount')) {
      return (
        <div className="currency-cell">
          <span className="currency-value">{formatCurrency(value)}</span>
        </div>
      );
    }
    
    if (columnKey.includes('date') || columnKey.includes('created') || columnKey.includes('updated')) {
      return (
        <div className="date-cell">
          <Calendar size={14} className="date-icon" />
          <span className="date-text-row">{formatDate(value)}</span>
        </div>
      );
    }
    
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
    
    if (columnKey === 'stages') {
      return renderStages(value);
    }
    
    // Handle old action column
    if (columnKey === 'action') {
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

    if (column.format) {
      return column.format(value, data);
    }

    return <span className="cell-text">{value || column.defaultValue || '-'}</span>;
  };

  // Keep all your original renderer functions exactly the same
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

  const renderIconCell = (value, config) => {
    const IconComponent = config.iconMap?.[value] || config.defaultIcon;
    
    return (
      <div className="icon-cell">
        {IconComponent && <IconComponent size={config.size || 16} />}
        {config.showText && <span className="icon-text">{value}</span>}
      </div>
    );
  };

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

  const renderCurrencyCell = (value, config) => {
    if (!value && value !== 0) return config.emptyText || '-';
    
    const formattedValue = config.formatter 
      ? config.formatter(value)
      : `${config.symbol || ''}${value}`
    
    return (
      <div className="currency-cell">
        {config.icon && <span className="currency-icon">{config.icon}</span>}
        <span className="currency-value">{formattedValue}</span>
      </div>
    );
  };

  const handleRowClick = (e) => {
    if (!e.target.closest('.actions-dropdown-table') && 
        !e.target.closest('.cell-button') && 
        !e.target.closest('.action-button') &&
        !e.target.closest('.mobile-card-actions') &&
        !e.target.closest('.actions-menu-portal') &&
        clickableRow) {
      onRowClick && onRowClick(data);
    }
  };

  // Return mobile card layout if on mobile
  if (isMobile) {
    return (
      <div 
        className={`table-row ${className}`}
        onClick={handleRowClick}
        style={{ cursor: clickableRow ? 'pointer' : 'default' }}
      >
        {renderMobileCard()}
      </div>
    );
  }

  // Return desktop table layout
  return (
    <div 
      className={`table-row ${className}`}
      onClick={handleRowClick}
      style={{ cursor: clickableRow ? 'pointer' : 'default' }}
    >
      {columns.map((column, columnIndex) => {
        if (!column) {
          return null;
        }
        
        const value = getCellValue(column, data);
        const columnKey = column.key || column.accessorKey || column.header || `column-${columnIndex}`;

        return (
          <div
            key={columnKey}
            className={`table-cell-row ${column.className || ''}`}
            style={{
              flex: column.flex || 1,
              minWidth: column.minWidth || 'auto',
              maxWidth: column.maxWidth || 'none',
              textAlign: column.align || 'left',
              ...column.style
            }}
            data-label={column.label || column.header}
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