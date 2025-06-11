import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical } from 'lucide-react';
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

  // Default cell renderer
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

    // Default text rendering with optional formatting
    if (column.format) {
      return column.format(value, data);
    }

    return value || column.defaultValue || '-';
  };

  // Status cell renderer
  const renderStatusCell = (value, config) => {
    const statusClass = config.classMap?.[value] || config.defaultClass || '';
    const statusText = config.textMap?.[value] || value;
    
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
              {actions.map((action) => (
                <button
                  key={action.key}
                  className={`action-item ${action.className || ''}`}
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
    if (!e.target.closest('.actions-dropdown') && 
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
        const value = column.accessor 
          ? column.accessor.split('.').reduce((obj, key) => obj?.[key], data)
          : data[column.key];

        return (
          <div
            key={column.key}
            className={`table-cell ${column.className || ''}`}
            style={{
              width: column.width,
              minWidth: column.minWidth,
              maxWidth: column.maxWidth,
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