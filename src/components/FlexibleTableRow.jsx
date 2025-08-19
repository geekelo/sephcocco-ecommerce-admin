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
  clickableRow = true,
  mobileCardConfig = null // New prop for mobile card configuration
}) => {
  console.log('FlexibleTableRow received data:', data);
  console.log('FlexibleTableRow received columns:', columns);
  
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
    // Try to auto-detect primary fields
    const primaryField = columns.find(col => {
      const key = (col.key || col.accessorKey || '').toLowerCase();
      return key.includes('name') || key.includes('user') || key.includes('customer') || key.includes('title');
    });

    const statusField = columns.find(col => {
      const key = (col.key || col.accessorKey || '').toLowerCase();
      return key === 'status' || key === 'current_stage';
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

    // Header fields (primary info + status/actions)
    const headerFields = columns.filter(col => {
      const key = (col.key || col.accessorKey || '').toLowerCase();
      return mobileConfig.showInHeader.includes(key) || key === 'actions' || key === 'action';
    });

    // Body fields (everything else except excluded and header fields)
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
        {/* Card Header */}
        <div className="card-header">
          <div className="primary-info">
            {primaryColumn && (
              <div className="mobile-primary-info">
                {renderMobileCellContent(primaryColumn, data, primaryValue, true)}
              </div>
            )}
            
            {/* Status in header */}
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
          
          {/* Actions in header */}
          <div className="card-actions mobile-card-actions">
            {renderMobileActions()}
          </div>
        </div>

        {/* Card Body */}
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
    const columnKey = (column.key || column.accessorKey || '').toLowerCase();
    
    // Handle custom cell renderers first
    if (column.cell && typeof column.cell === 'function') {
      return value; // This is already the rendered content
    }

    // Avatar/User fields
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

    // Currency fields
    if (columnKey.includes('price') || columnKey.includes('cost') || columnKey.includes('amount')) {
      return <div className="mobile-card-currency">{formatCurrency(value)}</div>;
    }
    
    // Date fields
    if (columnKey.includes('date') || columnKey.includes('created') || columnKey.includes('updated')) {
      return (
        <div className="mobile-card-date">
          <Calendar size={14} />
          <span>{formatDate(value)}</span>
        </div>
      );
    }
    
    // Status fields
    if (columnKey === 'status' || columnKey === 'current_stage') {
      return (
        <div className="mobile-card-status">
          <span className={`status-badge ${getStatusClass(value)}`}>
            {capitalizeText(value)}
          </span>
        </div>
      );
    }
    
    // Stages field
    if (columnKey === 'stages') {
      return <div className="mobile-card-stages">{renderStages(value)}</div>;
    }

    // Default text
    return <div className="mobile-card-text">{value || '-'}</div>;
  };

  // Render actions for mobile
  const renderMobileActions = () => {
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

  // Default cell renderer with enhanced type handling (for desktop)
  const defaultCellRenderer = (column, data, value) => {
    // If the column already has a cell renderer, it was handled in getCellValue
    if (column.cell && typeof column.cell === 'function') {
      return value; // This is already the rendered content
    }

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
    const columnKey = (column.key || column.accessorKey || '')?.toLowerCase() || '';
    
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
      : `${config.symbol || ''}${value}`
    
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
        !e.target.closest('.mobile-card-actions') &&
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

        console.log(`Column: ${columnKey}, Value:`, value);

        return (
          <div
            key={columnKey}
            className={`table-cell ${column.className || ''}`}
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