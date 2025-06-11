export const createOrderColumns = (handleViewOrder) => [
  { key: "id", label: "Order ID", width: "100px" },
  { key: "customerName", label: "Customer", width: "180px" },
  { key: "status", label: "Status", width: "120px", type: "status" },
  { key: "totalAmount", label: "Total Amount", width: "140px" },
  { key: "orderDate", label: "Date", width: "120px" },
  {
    key: "action",
    label: "Action",
    width: "100px",
    type: "button",
    buttonConfig: {
      text: "View",
      className: "view-button",
      icon: "👁️",
      onClick: (data) => {
        handleViewOrder(data); 
      }
    }
  }
];


