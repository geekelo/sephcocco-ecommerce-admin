import React from 'react';
import '../styles/StatusBadge.css';

const StatusBadge = ({ status }) => {
  const getStatusClass = () => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'status-delivered';
      case 'on transit':
        return 'status-transit';
      case 'failed':
        return 'status-failed';
      default:
        return 'status-default';
    }
  };

  return (
    <div className={`status-badge ${getStatusClass()}`}>
      <span className="status-indicator"></span>
      <span className="status-text">{status}</span>
    </div>
  );
};

export default StatusBadge;