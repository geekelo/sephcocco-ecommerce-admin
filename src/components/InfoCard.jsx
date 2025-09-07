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

      case 'payment confirmed':
        return 'status-processing';
      case 'pending':
      case 'awaiting':
        return 'status-pending';
      case 'paid':
        return 'status-badge status-completed';
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

  // Updated function to format and display date
  const formatStageDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      // Format as: "Sep 7, 2025 4:51 PM"
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const renderStages = (stages) => {
    if (!stages || !Array.isArray(stages) || stages.length === 0) {
      return <span className="info-value">No stages</span>;
    }
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
     {stages.map((stageObj, index) => (
  <div 
    key={index} 
    style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
  >
    <span className={`status-badge ${getStageClass(stageObj.status)}`}>
      {capitalizeText(stageObj.status)} - {formatStageDate(stageObj.date)}
    </span>
  </div>
))}
      </div>
    );
  };

  // Alternative horizontal layout for stages with dates
  const renderStagesHorizontal = (stages) => {
    if (!stages || !Array.isArray(stages) || stages.length === 0) {
      return <span className="info-value">No stages</span>;
    }
    
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {stages.map((stageObj, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: '2px'
          }}>
            <span className={`status-badge ${getStageClass(stageObj.status)}`}>
              {capitalizeText(stageObj.status)}
            </span>
            {stageObj.date && (
              <span style={{ 
                fontSize: '10px', 
                color: '#666', 
                fontStyle: 'italic',
                textAlign: 'center',
                maxWidth: '80px',
                lineHeight: '1.2'
              }}>
                {formatStageDate(stageObj.date)}
              </span>
            )}
          </div>
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
      case 'payment confirmed':
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
              alignItems: 'flex-start', // Changed from 'center' to 'flex-start' for better alignment with multi-line content
              textTransform: 'capitalize',
              gap: '6px'
            }}
          >
            {item.isEmail && <Mail size={14} />}
            {item.isPhone && <Phone size={14} />}
            
            {/* Handle stages separately */}
            {item.isStages ? (
              renderStages(item.value) // Use vertical layout by default
              // renderStagesHorizontal(item.value) // Uncomment this and comment above for horizontal layout
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
                 <div style={{ width: 16, display: 'flex', justifyContent: 'center' }}>
  <Copy
    size={14}
    style={{ cursor: 'pointer', flexShrink: 0 }}
    onClick={(e) => {
      e.stopPropagation();
      handleCopy(item.value, index);
    }}
  />
</div>
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