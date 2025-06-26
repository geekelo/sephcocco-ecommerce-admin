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
  skeletonRows = 5 // Number of skeleton rows to show
}) => {
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

  // Generate skeleton rows
  const renderSkeletonRows = () => {
    return Array.from({ length: skeletonRows }, (_, index) => (
      <div key={`skeleton-${index}`} className="table-row skeleton-row">
        {columns.map((column) => (
          <div
            key={`skeleton-${index}-${column.key}`}
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
    ));
  };

  // Custom loading state with skeleton
  const defaultLoadingState = (
    <div className="table-body">
      {renderSkeletonRows()}
    </div>
  );

  // Get the orders data - handle both direct array and nested object structure
  const getOrdersData = () => {
    if (!data) return [];
    
    // If data is already an array, return it
    if (Array.isArray(data)) return data;
    
    // If data has orders property, return that
    if (data.orders && Array.isArray(data.orders)) return data.orders;
    
    // If data has data property with orders, return that
    if (data.data && data.data.orders && Array.isArray(data.data.orders)) return data.data.orders;
    
    return [];
  };

  const ordersData = getOrdersData();

  return (
    <div className={`flexible-table ${isLoading ? 'loading' : ''} ${className}`}>
      {/* Table Header - Always show when loading to maintain structure */}
      <div className={`table-header ${headerClassName}`}>
        {columns.map((column) => (
          <div
            key={column.key}
            className={`table-header-cell ${column.className || ''}`}
            style={{
              flex: column.flex || 1,
              minWidth: column.minWidth || 'auto',
              maxWidth: column.maxWidth || 'none',
              textAlign: column.align || 'left',
              ...column.headerStyle
            }}
          >
            <span className="header-content">{column.label}</span>
          </div>
        ))}
      </div>

      {/* Table Body */}
      {isLoading ? (
        loadingState || defaultLoadingState
      ) : (
        <div className={`table-body ${bodyClassName}`}>
          {ordersData.length > 0 ? (
            ordersData.map((item, index) => (
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
              />
            ))
          ) : (
            emptyState || defaultEmptyState
          )}
        </div>
      )}
    </div>
  );
};

export default FlexibleTable;