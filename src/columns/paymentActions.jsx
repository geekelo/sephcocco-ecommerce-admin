export const paymentActions = [
  {
    label: 'View',
    key: 'view',
    icon: '👁️', 
    onClick: (order) => handleViewOrder(order)
  },
  {
    label: 'Delete',
    key: 'delete',
    icon: '🗑️',
    onClick: (order) => handleDeleteOrder(order)
  }
];
