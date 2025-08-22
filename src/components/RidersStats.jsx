import { CheckCircle, Truck, User, Clock } from "lucide-react";
import '../styles/RidersStats.css'
export const RiderStatistics = ({  shippingData = [], ridersData = [], meta = {} }) => {
  // Use the meta data from API which has the correct counts
  const totalDelivered = meta.total_delivered || 0;
  const totalDispatching = meta.total_dispatching || meta.total_in_transit || 0;
  const totalPending = meta.total_pending || 0;
  const totalAssigned = meta.total_assigned || 0;

  // Alternative calculation if meta is not available
  const calculateStats = () => {
    if (!Array.isArray(shippingData)) return { delivered: 0, dispatching: 0, pending: 0, assigned: 0 };

    const delivered = shippingData.filter(s => s.status === 'delivered').length;
    const dispatching = shippingData.filter(s => 
      s.status === 'dispatched' || 
      s.status === 'in_transit' || 
      s.dispatching === true
    ).length;
    const pending = shippingData.filter(s => s.status === 'pending').length;
    const assigned = shippingData.filter(s => s.assigned_rider || s.rider).length;

    return { delivered, dispatching, pending, assigned };
  };

  // Use API meta data if available, otherwise calculate
  const stats = {
    delivered: totalDelivered || calculateStats().delivered,
    dispatching: totalDispatching || calculateStats().dispatching,
    pending: totalPending || calculateStats().pending,
    assigned: totalAssigned || calculateStats().assigned
  };

  // Additional rider stats

  const totalRiders = Array.isArray(ridersData) ? ridersData.length : 0;

  return (
    <div className="rider-stats-container">
      <div className="rider-stat-card">
        <div className="rider-stat-icon delivered">
          <CheckCircle size={20} />
        </div>
        <div className="rider-stat-info">
          <div className="rider-stat-label">Total Delivered</div>
          <div className="rider-stat-value">{stats.delivered}</div>
        </div>
      </div>
      
      <div className="rider-stat-card">
        <div className="rider-stat-icon dispatching">
          <Truck size={20} />
        </div>
        <div className="rider-stat-info">
          <div className="rider-stat-label">Total Dispatching</div>
          <div className="rider-stat-value">{stats.dispatching}</div>
        </div>
      </div>
      
      <div className="rider-stat-card">
        <div className="rider-stat-icon pending">
          <Clock size={20} />
        </div>
        <div className="rider-stat-info">
          <div className="rider-stat-label">Total Pending</div>
          <div className="rider-stat-value">{stats.pending}</div>
        </div>
      </div>

      <div className="rider-stat-card">
        <div className="rider-stat-icon assigned">
          <User size={20} />
        </div>
        <div className="rider-stat-info">
          <div className="rider-stat-label">Assigned Orders</div>
          <div className="rider-stat-value">{stats.assigned}</div>
        </div>
      </div>

      {totalRiders > 0 && (
        <div className="rider-stat-card">
          <div className="rider-stat-icon available">
            <User size={20} />
          </div>
          <div className="rider-stat-info">
            <div className="rider-stat-label">Available Riders</div>
            <div className="rider-stat-value">{totalRiders}</div>
          </div>
        </div>
      )}
    </div>
  );
};