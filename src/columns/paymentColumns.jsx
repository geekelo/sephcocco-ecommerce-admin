export const createPaymentColumns = (handleViewPayment) => [
  { key: "transactionId", label: "Payment ID", width: "120px" },
  { key: "customerName", label: "Customer", width: "180px" },
  { key: "deliveryLocation", label: "Delivery Location", width: "120px" },
  { key: "deliveryAmount", label: "Delivery Amount", width: "120px" },

        { key: "orderAmount", label: "Order Amount", width: "120px" },
          { key: "amount", label: "Total Amount", width: "120px" },
        
  { key: "paymentDate", label: "Date", width: "120px" },
  { key: "status", label: "Status", width: "120px", type: "status" },
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
        handleViewPayment(data);
      }
    }
  },

];
