import React from 'react';
import OrderRow from './OrderRow';
import '../styles/OrderTable.css';

const OrderTable = ({ orders, columns = [], keyField = 'id', onViewOrder }) => {
  // Default columns if none are provided
  const tableColumns = columns.length > 0 ? columns : [
    { id: 'id', label: 'Order ID', className: 'order-id' },
    { id: 'customer', label: 'Customer', className: 'customer' },
    { id: 'status', label: 'Status', className: 'status' },
    { id: 'amount', label: 'Total Amount', className: 'amount' },
    { id: 'date', label: 'Date', className: 'date' },
    { id: 'action', label: 'Action', className: 'action' }
  ];

  return (
    <div className="order-table">
      <div className="order-table-header">
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
        {orders?.map((order, index) => (
          <OrderRow 
            key={order[keyField] || index} 
            order={order} 
            columns={tableColumns} 
            onViewOrder={onViewOrder} 
          />
        ))}
      </div>
    </div>
  );
};

export default OrderTable;