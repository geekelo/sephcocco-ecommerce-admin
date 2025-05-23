import '../styles/StatsCard.css'
const StatsCard = ({ title, value, icon, trend, isOrange = false }) => {
  return (
    <div className={`stats-card ${isOrange ? 'orange-card' : ''}`}>
      <div className="stats-content">
        <div className="stats-text">
          <h3 className="stats-title">{title}</h3>
          <div className="stats-value">{value}</div>
        </div>
        {trend && (
          <div className="stats-trend">
            {trend}
          </div>
        )}
        {icon && (
          <div className="stats-icon">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard