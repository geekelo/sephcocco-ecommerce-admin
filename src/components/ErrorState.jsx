// ErrorState.js
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import '../styles/Error.css';

export const ErrorState = ({ message, onRetry }) => {
  return (
    <div className="error-state">
      <div className="error-content">
        <AlertCircle size={64} className="error-icon" />
        <h3>Oops! Something went wrong</h3>
        <p>{message || 'An unexpected error occurred.'}</p>
        {onRetry && (
          <button className="retry-button" onClick={onRetry}>
            <RefreshCw size={16} />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};