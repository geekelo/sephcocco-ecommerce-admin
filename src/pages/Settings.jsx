
import { useState } from 'react';
import '../styles/Settings.css';
import UserManagement from '../components/UserManagement';
import NotificationSetting from '../components/NotificationSetting';
import PaymentSetting from '../components/PaymentSetting';
import SystemPreferences from '../components/SystemPreferences';


const Settings = () => {
  const [activeTab, setActiveTab] = useState('UserManagement');

  const tabs = [
    { key: 'UserManagement', label: 'User Management' },
    { key: 'NotificationSetting', label: 'Notification Setting' },
    { key: 'PaymentSetting', label: 'Payment Setting' },
    { key: 'SystemPreferences', label: 'System Preferences' }
  ];

  const renderTab = () => {
    switch (activeTab) {
      case 'UserManagement': return <UserManagement />;
      case 'NotificationSetting': return <NotificationSetting />;
      case 'PaymentSetting': return <PaymentSetting />;
      case 'SystemPreferences': return <SystemPreferences />;
      default: return null;
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-wrapper">
        <div className="tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={activeTab === tab.key ? 'active' : ''}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="tab-content">
          {renderTab()}
        </div>
      </div>
    </div>
  );
};

export default Settings;