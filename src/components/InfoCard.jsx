import React from 'react';
import { Mail, Phone } from 'lucide-react';
import '../styles/InfoCard.css';

const InfoCard = ({ items }) => {
  const handleEmailClick = (email) => {
    if (email && email !== "Not provided") {
      window.location.href = `mailto:${email}`;
    }
  };

  const handlePhoneClick = (phone) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  return (
    <div className="info-card">
      {items.map((item, index) => (
        <div key={index} className="info-item">
          <span className="info-label">{item.label}</span>
          <span 
            className={`info-value ${item.isEmail ? 'email' : ''} ${item.isPhone ? 'phone' : ''}`}
            onClick={() => {
              if (item.isEmail) handleEmailClick(item.value);
              if (item.isPhone) handlePhoneClick(item.value);
            }}
            style={{ 
              cursor: (item.isEmail || item.isPhone) ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {item.isEmail && <Mail size={14} />}
            {item.isPhone && <Phone size={14} />}
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default InfoCard;