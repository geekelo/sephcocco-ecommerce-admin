import '../styles/InfoCard.css'
const InfoCard = ({ items }) => {
  return (
    <div className="info-card">
      {items.map((item, index) => (
        <div key={index} className="info-item">
          <span className="info-label">{item.label}</span>
          <span className="info-value">{item.value}</span>
        </div>
      ))}
    </div>
  );
};

export default InfoCard