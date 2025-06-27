import React, { useState } from 'react';
import { Check, Copy, Mail, Phone } from 'lucide-react';
import '../styles/InfoCard.css';

const InfoCard = ({ items }) => {
  const [copiedIndex, setCopiedIndex] = useState(null);

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

  const handleCopy = (text, index) => {
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      }).catch((err) => {
        console.error("Failed to copy!", err);
      });
    }
  };

  const getStatusBadgeClass = (value) => {
    const status = value?.toLowerCase();
    switch (status) {
      case 'pending':
        return 'status-badge status-pending';
      case 'completed':
        return 'status-badge status-completed';
      case 'cancelled':
        return 'status-badge status-cancelled';
      case 'processing':
        return 'status-badge status-processing';
      case 'active':
        return 'status-badge status-active';
      case 'inactive':
      case 'suspended':
        return 'status-badge status-inactive';
      default:
        return 'status-badge';
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
            
            {item.badge ? (
              <span className={getStatusBadgeClass(item.value)}>
                {item?.value?.toUpperCase()}
              </span>
            ) : (
              <>
                {item.value}
                {item.isCopyable && (
                  copiedIndex === index ? (
                    <Check size={14} color="green" />
                  ) : (
                    <Copy
                      size={14}
                      style={{ cursor: 'pointer' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(item.value, index);
                      }}
                    />
                  )
                )}
              </>
            )}
          </span>
        </div>
      ))}
    </div>
  );
};

export default InfoCard;
