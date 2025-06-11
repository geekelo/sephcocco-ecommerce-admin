export const orderColumns = [
  {
    key: 'orderId',
    label: 'Order ID',
    minWidth: '100px'
  },
  {
    key: 'customerName',
    label: 'Customer',
    minWidth: '150px'
  },
  {
    key: 'amount',
    label: 'Amount',
    minWidth: '100px',
    align: 'right',
    render: (value) => `₦${value.toFixed(2)}`
  },
  {
    key: 'date',
    label: 'Date',
    minWidth: '140px',
    render: (value) => new Date(value).toLocaleDateString()
  },
  {
    key: 'status',
    label: 'Status',
    minWidth: '120px',
    render: (value) => (
      <span className={`status-tag ${value.toLowerCase()}`}>
        {value}
      </span>
    )
  }
];
