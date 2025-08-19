// PaymentSetting.jsx
import React, { useState } from 'react';
import '../styles/PaymentSetting.css';

const PaymentSetting = () => {
  const [bankInfo, setBankInfo] = useState({
    bankName: 'First Bank of Nigeria',
    accountName: 'Sephcoco Venture',
    accountNumber: '957876ty39401u',
    accountName2: 'Sephcoco Venture'
  });

  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');

  const [gatewayInfo, setGatewayInfo] = useState({
    paymentGateway: '',
    gatewayApiKey: ''
  });

  const handleEdit = (field) => {
    setEditingField(field);
    setTempValue(bankInfo[field]);
  };

  const handleSave = (field) => {
    setBankInfo(prev => ({
      ...prev,
      [field]: tempValue
    }));
    setEditingField(null);
    setTempValue('');
    console.log(`${field} updated to: ${tempValue}`);
  };

  const handleCancel = () => {
    setEditingField(null);
    setTempValue('');
  };

  const handleGatewayChange = (field, value) => {
    setGatewayInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const EditableField = ({ label, field, value }) => (
    <div className="editable-field">
      <span className="field-label">{label}</span>
      <div className="field-content">
        {editingField === field ? (
          <>
            <input
              type="text"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="edit-input"
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleSave(field);
                if (e.key === 'Escape') handleCancel();
              }}
            />
            <div className="edit-actions">
              <button className="save-btn" onClick={() => handleSave(field)}>
                Save
              </button>
              <button className="cancel-btn" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <span className="field-value">{value}</span>
            <button className="field-edit-btn" onClick={() => handleEdit(field)}>
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.828-2.828z" />
              </svg>
              Edit
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="payment-setting">
      <div className="payment-section">
        <h3>Payment Methods</h3>
        
        <div className="bank-transfer-card">
          <h4>Bank Transfer</h4>
          <div>
            <EditableField 
              label="Bank Name" 
              field="bankName" 
              value={bankInfo.bankName} 
            />
            <EditableField 
              label="Account Name" 
              field="accountName" 
              value={bankInfo.accountName} 
            />
            <EditableField 
              label="Account Number" 
              field="accountNumber" 
              value={bankInfo.accountNumber} 
            />
            <EditableField 
              label="Account Name" 
              field="accountName2" 
              value={bankInfo.accountName2} 
            />
          </div>
        </div>
      </div>
      
      <div className="payment-section">
        <h4>Online payment Gateways</h4>
        <div className="gateway-inputs">
          <div className="input-group">
            <label>Payment Gateway</label>
            <input 
              type="text" 
              placeholder="Enter product price"
              value={gatewayInfo.paymentGateway}
              onChange={(e) => handleGatewayChange('paymentGateway', e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>Gateway API Key</label>
            <input 
              type="text" 
              placeholder="Enter Discount price"
              value={gatewayInfo.gatewayApiKey}
              onChange={(e) => handleGatewayChange('gatewayApiKey', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSetting;