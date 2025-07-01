import React from 'react';

export const ErrorMessage = ({ message, onRetry }) => (
  <div className="error-message">
    <p>{message}</p>
    {onRetry && (
      <button className="retry-button" onClick={onRetry}>
        Retry
      </button>
    )}
  </div>
); 