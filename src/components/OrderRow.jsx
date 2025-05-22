import React from 'react';
import StatusBadge from './StatusBadge';
import '../styles/OrderRow.css';

const OrderRow = ({ order, columns = [], onViewOrder }) => {
  // Default columns if none are provided
  const rowColumns = columns.length > 0 ? columns : [
    { id: 'id', label: 'Order ID', className: 'order-id' },
    { id: 'customer', label: 'Customer', className: 'customer' },
    { id: 'status', label: 'Status', className: 'status' },
    { id: 'amount', label: 'Total Amount', className: 'amount' },
    { id: 'date', label: 'Date', className: 'date' },
    { id: 'action', label: 'Action', className: 'action' }
  ];

  // Custom renderer for special column types
  const renderColumnContent = (column, order) => {
    const fieldId = column.id;
    
    // Handle special column types
    switch (fieldId) {
      case 'status':
        return <StatusBadge status={order[fieldId]} />;
      case 'action':
        return (
          <button 
            className="view-button"
            onClick={() => onViewOrder && onViewOrder(order)}
          >
            <span className="eye-icon">👁️</span> View
          </button>
        );
      default:
        return order[fieldId];
    }
  };

  return (
    <div className="order-row">
      {rowColumns.map(column => (
        <div
          key={column.id}
          className={`order-column ${column.className || ''}`}
          data-label={column.label}
        >
          {renderColumnContent(column, order)}
        </div>
      ))}
    </div>
  );
};

export default OrderRow;