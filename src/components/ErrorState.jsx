import React from 'react';
import { AlertTriangle } from 'lucide-react';
 export const ErrorState = ({title, message, refetchCategories,isFetchingCategories}) => (
    <div className="error-state">
      <div className="error-icon">
        <AlertTriangle size={64} />
      </div>
      <h3>{ title}</h3>
      <p>{message}</p>
      <button 
        className="retry-btn" 
        onClick={() => refetchCategories()}
        disabled={isFetchingCategories}
      >
        {isFetchingCategories ? "Retrying..." : "Retry"}
      </button>
    </div>
  );