import React from 'react';
import FlexibleTableRow from './FlexibleTableRow';
import "../styles/Table.css";

const FlexibleTable = ({
  data = [],
  columns = [],
  actions = [],
  keyField = 'id',
  onRowClick,
  onActionClick,
  renderCell,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  rowClassName = '',
  clickableRows = true,
  isLoading = false,
  emptyState = null,
  loadingState = null,
  skeletonRows = 5, // Number of skeleton rows to show
  // New mobile card configuration props
  mobileCardConfig = null, // Configuration for mobile card layout
  enableMobileCards = true // Enable/disable mobile card view
}) => {
  console.log('FlexibleTable received data:', data);
  console.log('Data type:', typeof data);
  console.log('Is array:', Array.isArray(data));
  
  // Default empty state
  const defaultEmptyState = (
    <div className="table-empty-state">
      <div className="empty-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9H21ZM19 21H5V3H13V9H19V21Z"/>
        </svg>
      </div>
      <h3>No data found</h3>
      <p>There are no items to display at the moment.</p>
    </div>
  );

  // Generate skeleton cell content based on column type or key
  const getSkeletonContent = (column) => {
    const columnKey = column.key?.toLowerCase() || '';
    
    if (columnKey.includes('avatar') || columnKey.includes('user') || columnKey.includes('profile')) {
      return (
        <div className="skeleton-avatar-cell">
          <div className="skeleton-avatar"></div>
          <div className="skeleton-text-group">
            <div className="skeleton-text skeleton-text-medium"></div>
            <div className="skeleton-text skeleton-text-small"></div>
          </div>
        </div>
      );
    }
    
    if (columnKey.includes('status') || columnKey.includes('badge') || columnKey.includes('tag') || columnKey.includes('stages')) {
      return <div className="skeleton-badge"></div>;
    }
    
    if (columnKey.includes('price') || columnKey.includes('amount') || columnKey.includes('cost') || columnKey.includes('currency')) {
      return <div className="skeleton-text skeleton-text-currency"></div>;
    }
    
    if (columnKey.includes('date') || columnKey.includes('time') || columnKey.includes('created') || columnKey.includes('updated')) {
      return <div className="skeleton-text skeleton-text-date"></div>;
    }
    
    if (columnKey.includes('action') || actions.length > 0 && column === columns[columns.length - 1]) {
      return <div className="skeleton-action"></div>;
    }
    
    // Default text skeleton
    return <div className="skeleton-text skeleton-text-default"></div>;
  };

  // Generate skeleton rows - enhanced for mobile cards
  const renderSkeletonRows = () => {
    return Array.from({ length: skeletonRows }, (_, index) => (
      <div key={`skeleton-row-${index}`} className="table-row skeleton-row">
        {/* Desktop skeleton */}
        <div className="desktop-skeleton" style={{ display: 'flex', width: '100%' }}>
          {columns.map((column, colIndex) => (
            <div
              key={`skeleton-cell-${index}-${colIndex}-${column.key || column.header || column.accessorKey || 'default'}`}
              className="table-cell"
              style={{
                flex: column.flex || 1,
                minWidth: column.minWidth || 'auto',
                maxWidth: column.maxWidth || 'none',
                textAlign: column.align || 'left',
                padding: '16px'
              }}
            >
              <div className="skeleton-content">
                {getSkeletonContent(column)}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile card skeleton */}
        <div className="mobile-skeleton" style={{ display: 'none' }}>
          <div className="skeleton-card-header">
            <div className="skeleton-avatar-cell">
              <div className="skeleton-avatar"></div>
              <div className="skeleton-text-group">
                <div className="skeleton-text skeleton-text-medium"></div>
                <div className="skeleton-text skeleton-text-small"></div>
              </div>
            </div>
            <div className="skeleton-badge"></div>
          </div>
          <div className="skeleton-card-body">
            {[1, 2, 3].map((item) => (
              <div key={item} className="skeleton-card-row">
                <div className="skeleton-card-label"></div>
                <div className="skeleton-card-value"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ));
  };

  // Custom loading state with skeleton
  const defaultLoadingState = (
    <div className="table-body">
      {renderSkeletonRows()}
    </div>
  );

  // Get the table data - now works for any type of data
  const getTableData = () => {
    if (!data) return [];
    
    // If data is already an array, return it
    if (Array.isArray(data)) return data;
    
    // If data has orders property, return that (for backwards compatibility)
    if (data.orders && Array.isArray(data.orders)) return data.orders;
    
    // If data has data property with orders, return that (for backwards compatibility)
    if (data.data && data.data.orders && Array.isArray(data.data.orders)) return data.data.orders;
    
    // If data has any array property, try to find it
    const arrayProps = Object.keys(data).filter(key => Array.isArray(data[key]));
    if (arrayProps.length > 0) {
      return data[arrayProps[0]];
    }
    
    return [];
  };

  const tableData = getTableData();
  console.log('Final table data:', tableData);
  console.log('Table data length:', tableData.length);

  // Enhanced mobile card configuration
  const getEnhancedMobileConfig = () => {
    if (mobileCardConfig) return mobileCardConfig;
    
    // Auto-detect configuration based on column structure
    const primaryField = columns.find(col => {
      const key = (col.key || col.accessorKey || '').toLowerCase();
      return key.includes('name') || key.includes('user') || key.includes('customer') || 
             key.includes('title') || key.includes('email') || col.type === 'avatar';
    });

    const statusFields = columns.filter(col => {
      const key = (col.key || col.accessorKey || '').toLowerCase();
      return key === 'status' || key === 'current_stage' || key.includes('stage') || 
             col.type === 'status' || col.type === 'badge';
    }).map(col => col.key || col.accessorKey);

    const actionFields = columns.filter(col => {
      const key = (col.key || col.accessorKey || '').toLowerCase();
      return key === 'actions' || key === 'action' || col.type === 'actions';
    }).map(col => col.key || col.accessorKey);

    return {
      primaryField: primaryField?.key || primaryField?.accessorKey || columns[0]?.key || columns[0]?.accessorKey,
      showInHeader: [...statusFields],
      excludeFromBody: [...actionFields, 'actions', 'action'],
      compactMode: false,
      groupSimilarFields: true // Group similar fields together in mobile view
    };
  };

  const finalMobileConfig = enableMobileCards ? getEnhancedMobileConfig() : null;

  return (
    <div className={`flexible-table ${isLoading ? 'loading' : ''} ${className}`}>
      {/* Table Header - Always show when loading to maintain structure on desktop */}
      <div className={`table-header ${headerClassName}`}>
        {columns.map((column) => (
          <div
            key={column.key || column.header || column.accessorKey}
            className={`table-header-cell ${column.className || ''}`}
            style={{
              flex: column.flex || 1,
              minWidth: column.minWidth || 'auto',
              maxWidth: column.maxWidth || 'none',
              textAlign: column.align || 'left',
              ...column.headerStyle
            }}
          >
            <span className="header-content">
              {column.label || column.header || column.accessorKey}
            </span>
          </div>
        ))}
      </div>

      {/* Table Body */}
      {isLoading ? (
        loadingState || defaultLoadingState
      ) : (
        <div className={`table-body ${bodyClassName}`}>
          {tableData.length > 0 ? (
            tableData.map((item, index) => {
              console.log(`Rendering row ${index}:`, item);
              return (
                <FlexibleTableRow
                  key={item[keyField] || index}
                  data={item}
                  columns={columns}
                  actions={actions}
                  onRowClick={onRowClick}
                  onActionClick={onActionClick}
                  renderCell={renderCell}
                  className={rowClassName}
                  clickableRow={clickableRows}
                  mobileCardConfig={finalMobileConfig}
                />
              );
            })
          ) : (
            emptyState || defaultEmptyState
          )}
        </div>
      )}
    </div>
  );
};

export default FlexibleTable;