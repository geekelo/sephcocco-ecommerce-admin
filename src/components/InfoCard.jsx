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
  
  const getStageClass = (stage) => {
    // stage parameter should always be a single string value now
    const stageString = String(stage || '').toLowerCase();
    
    switch (stageString) {
      case 'completed':
      case 'shipped':
      case 'delivered':
        return 'status-completed';
      case 'delivering':
      case 'confirmed':
        return 'status-processing';
      case 'pending':
      case 'awaiting':
        return 'status-pending';
      case 'cancelled':
      case 'rejected':
        return 'status-cancelled';
      default:
        return 'badge';
    }
  };
  
  const capitalizeText = (text) => {
    if (!text) return '-';
    return String(text).charAt(0).toUpperCase() + String(text).slice(1).toLowerCase();
  };

  const renderStages = (stages) => {
    if (!stages || !Array.isArray(stages) || stages.length === 0) {
      return <span className="info-value">No stages</span>;
    }
    
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {stages.map((stageObj, index) => (
          <span key={index} className={`status-badge ${getStageClass(stageObj.status)}`}>
            {capitalizeText(stageObj.status)}
          </span>
        ))}
      </div>
    );
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
    // Handle case where value might be an array (take first element)
    const statusValue = Array.isArray(value) ? value[0] : value;
    const status = String(statusValue || '').toLowerCase();
    
    switch (status) {
      case 'pending':
        return 'status-badge status-pending';
      case 'paid':
        return 'status-badge status-completed';
      case 'cancelled':
        return 'status-badge status-cancelled';
      case 'delivering':
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
            
            {/* Handle stages separately */}
            {item.isStages ? (
              renderStages(item.value)
            ) : item.badge ? (
              <span className={getStatusBadgeClass(item.value)}>
                {String(item?.value || '').toUpperCase()}
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