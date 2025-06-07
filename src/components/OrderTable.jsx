import React from 'react';
import '../styles/OrderTable.css';
import AccountOrderRow from './AccountOrderRow';
import CategoryTableRow from './CategoriesTableRow';


const OrderTable = ({
  orders,
  columns = [],
  keyField = 'id',
  onViewOrder,
  onAccountAction,
  onCategoryAction,
  customRowComponent: CustomRow,
  isAdminView = false,
  showHamburgerMenu = false,
  isLoading = false,
  emptyState = null
}) => {
  // Default columns for accounts table
  const defaultAccountColumns = [
    { id: 'user', label: 'User', className: 'user' },
    { id: 'email', label: 'Email', className: 'email' },
    { id: 'status', label: 'Status', className: 'status' },
    { id: 'orders', label: 'Orders', className: 'orders' },
    { id: 'role', label: 'Role', className: 'role' },
    { id: 'joinDate', label: 'Join Date', className: 'date' },
    { id: 'actions', label: 'Actions', className: 'actions' }
  ];

  // Admin-specific columns
  const defaultAdminColumns = [
    { id: 'admin', label: 'Administrator', className: 'user' },
    { id: 'email', label: 'Email', className: 'email' },
    { id: 'role', label: 'Role', className: 'role' },
    { id: 'status', label: 'Status', className: 'status' },
    { id: 'permissions', label: 'Permissions', className: 'permissions' },
    { id: 'lastLogin', label: 'Last Login', className: 'date' },
    { id: 'actions', label: 'Actions', className: 'actions' }
  ];

  // Use provided columns or default based on view type
  const tableColumns = columns.length > 0 
    ? columns 
    : isAdminView
      ? defaultAdminColumns
      : defaultAccountColumns;

  // Determine which row component to use
  let RowComponent = AccountOrderRow;
  
  if (CustomRow) {
    RowComponent = CustomRow;
  } else if (showHamburgerMenu && onCategoryAction) {
    RowComponent = CategoryTableRow;
  }

  // Default empty state
  const defaultEmptyState = (
    <div className="empty-state">
      <div className="empty-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9H21ZM19 21H5V3H13V9H19V21Z"/>
        </svg>
      </div>
      <h3>No {showHamburgerMenu ? 'categories' : 'accounts'} found</h3>
      <p>There are no {showHamburgerMenu ? 'categories' : 'accounts'} to display at the moment. Add some {showHamburgerMenu ? 'categories' : 'accounts'} to get started.</p>
    </div>
  );

  return (
    <div className={`order-table ${isLoading ? 'loading' : ''}`}>
      <div className={`order-table-header ${isAdminView ? 'admin-view' : ''} ${showHamburgerMenu ? 'category-view' : ''}`}>
        {tableColumns.map(column => (
          <div
            key={column.id}
            className={`order-column ${column.className || ''}`}
          >
            {column.label}
          </div>
        ))}
      </div>
             
      <div className="order-table-body">
        {orders && orders.length > 0 ? (
          orders.map((order, index) => (
            <RowComponent
              key={order[keyField] || index}
              order={order}
              columns={tableColumns}
              onViewOrder={onViewOrder}
              onAccountAction={onAccountAction}
              onCategoryAction={onCategoryAction}
              isAdminView={isAdminView}
              isLoading={isLoading}
            />
          ))
        ) : (
          emptyState || defaultEmptyState
        )}
      </div>
      
      {isLoading && (
        <div className="table-loading-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <span>Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTable;