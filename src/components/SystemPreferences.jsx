// SystemPreferences.jsx
import React, { useState } from 'react';
import '../styles/SystemPreferences.css';

const SystemPreferences = () => {
  const [maxProducts, setMaxProducts] = useState(false);

  const handleToggle = () => {
    setMaxProducts(!maxProducts);
    console.log(`Max products per order ${!maxProducts ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className="system-preferences">
      <div className="preference-option">
        <div className="preference-info">
          <h3>Max Products per Order</h3>
          <p>Restrict how many items can be added to a single order</p>
        </div>
        <label className="preference-toggle">
          <input
            type="checkbox"
            checked={maxProducts}
            onChange={handleToggle}
          />
          <span className="preference-slider"></span>
        </label>
      </div>
    </div>
  );
};

export default SystemPreferences;