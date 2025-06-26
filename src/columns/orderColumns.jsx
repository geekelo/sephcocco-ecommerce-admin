export const createOrderColumns = (handleViewOrder) => [
  { key: "order_number", label: "Order ID", width: "100px" },
  { key: "customer.name", label: "Customer", width: "180px" },
  { key: "product.name", label: "Product name", width: "180px" },
  { key: "quantity", label: "Quantity", width: "180px" },
 
  { key: "unit_price", label: "Unit Price", width: "140px" },
  { key: "total_price", label: "Total Price", width: "140px" },
  { key: "total_cost", label: "Total Cost", width: "140px" },
  { key: "stages", label: "Stages", width: "120px", type: "stages" },
  { key: "status", label: "Status", width: "120px", type: "status" },
  
  
  { key: "created_at", label: "Date", width: "120px" },
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


