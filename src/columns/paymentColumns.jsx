export const createPaymentColumns = (handleViewPayment) => [
  { key: "id", label: "Payment ID", width: "120px" },
  { key: "customerName", label: "Customer", width: "180px" },
  { key: "amount", label: "Amount", width: "120px" },
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
  }
];
