import { BadgeCheck, Mail, Trash2, Eye } from "lucide-react";

export const paymentColumns = [
  { 
    key: "id", 
    label: "Payment ID", 
    className: "payment-id", 
    type: "text" 
  },
  { 
    key: "amount", 
    label: "Amount", 
    className: "amount", 
    type: "custom", 
    render: (value) => `₦${Number(value).toLocaleString()}` 
  },
  { 
    key: "method", 
    label: "Method", 
    className: "method", 
    type: "text" 
  },
  { 
    key: "status", 
    label: "Status", 
    className: "status", 
    type: "custom", 
    render: (value) => (
      <span className={`status-badge ${value?.toLowerCase()}`}>
        {value}
      </span>
    )
  },
  { 
    key: "date", 
    label: "Date", 
    className: "date", 
    type: "date", 
    dateConfig: {
      formatter: (date) => new Date(date).toLocaleDateString()
    }
  },
  { 
    key: "actions", 
    label: "Actions", 
    className: "actions", 
    type: "actions", 
    width: "100px" 
  }
];
