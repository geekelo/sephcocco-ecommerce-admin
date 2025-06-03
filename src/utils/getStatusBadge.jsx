import { Ban, CheckCircle } from "lucide-react";

 export const getStatusBadge = (status) => {
    const statusConfig = {
      active: { className: 'status-active', label: 'Active', icon: CheckCircle },
      inactive: { className: 'status-inactive', label: 'Inactive', icon: Ban },
      suspended: { className: 'status-suspended', label: 'Suspended', icon: Ban }
    };

    const config = statusConfig[status] || statusConfig.inactive;
    const Icon = config.icon;

    return (
      <span className={`status-badge ${config.className}`}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };


