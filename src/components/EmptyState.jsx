// EmptyState.js
import React from 'react';
import { Package } from 'lucide-react';
import '../styles/Empty.css';

export const EmptyState = ({ message, btnText, handleAddCategory }) => {
  return (
    <div className="empty-state">
      <div className="empty-content">
   
        <p>{message || 'No items to display at the moment.'}</p>
        {btnText && handleAddCategory && (
          <button className="empty-action-button" onClick={handleAddCategory}>
            {btnText}
          </button>
        )}
      </div>
    </div>
  );
};