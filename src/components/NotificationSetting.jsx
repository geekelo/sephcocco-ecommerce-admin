// NotificationSetting.jsx
import React, { useState } from 'react';
import '../styles/NotificationSetting.css';

const NotificationSetting = () => {
  const [settings, setSettings] = useState({
    email: false,
    inApp: false,
    sms: false
  });

  const toggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    console.log(`${key} notification ${!settings[key] ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className="notification-setting">
      <div className="notification-option">
        <div className="notification-info">
          <h3>Email Notification</h3>
          <p>Turn off/on all email notifications</p>
        </div>
        <label className="toggle-switch">
          <input 
            type="checkbox" 
            checked={settings.email} 
            onChange={() => toggle('email')} 
          />
          <span className="slider"></span>
        </label>
      </div>
      
      <div className="notification-option">
        <div className="notification-info">
          <h3>In App Notification</h3>
          <p>Turn On/Off In app Notifications</p>
        </div>
        <label className="toggle-switch">
          <input 
            type="checkbox" 
            checked={settings.inApp} 
            onChange={() => toggle('inApp')} 
          />
          <span className="slider"></span>
        </label>
      </div>
      
      <div className="notification-option">
        <div className="notification-info">
          <h3>SMS Notification</h3>
          <p>Turn/Off on SMS Notifications</p>
        </div>
        <label className="toggle-switch">
          <input 
            type="checkbox" 
            checked={settings.sms} 
            onChange={() => toggle('sms')} 
          />
          <span className="slider"></span>
        </label>
      </div>
    </div>
  );
};

export default NotificationSetting;