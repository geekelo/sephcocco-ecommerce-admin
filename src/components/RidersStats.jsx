import { CheckCircle, Truck, User } from "lucide-react";

export const RiderStatistics = ({ riderAssignments, shippingData,ridersData }) => {
  const availableRiders = ridersData.filter(r => r.status === 'Available').length;
  const activeDeliveries = Object.keys(riderAssignments).length + shippingData.filter(s => s.assigned_rider).length;
  const totalRiders = ridersData.length;

  return (
    <div className="rider-stats-container">
      <div className="rider-stat-card">
        <div className="rider-stat-icon available">
          <CheckCircle size={20} />
        </div>
        <div className="rider-stat-info">
          <div className="rider-stat-label">Total Delivered</div>
          <div className="rider-stat-value">{availableRiders}</div>
        </div>
      </div>
      
      <div className="rider-stat-card">
        <div className="rider-stat-icon active">
          <Truck size={20} />
        </div>
        <div className="rider-stat-info">
          <div className="rider-stat-label">Total Dispatching</div>
          <div className="rider-stat-value">{activeDeliveries}</div>
        </div>
      </div>
      
      <div className="rider-stat-card">
        <div className="rider-stat-icon total">
          <User size={20} />
        </div>
        <div className="rider-stat-info">
          <div className="rider-stat-label">Total Pending</div>
          <div className="rider-stat-value">{totalRiders}</div>
        </div>
      </div>
    </div>
  );
};

