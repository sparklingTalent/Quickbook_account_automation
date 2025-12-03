import React from 'react'
import './ErrorMessage.css'

function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <h2>Error Loading Data</h2>
      <p className="error-message">{message}</p>
      {onRetry && (
        <button className="retry-btn" onClick={onRetry}>
          Try Again
        </button>
      )}
      <div className="error-help">
        <p>Make sure:</p>
        <ul>
          <li>The API server is running (./run.sh)</li>
          <li>The server is accessible at http://localhost:8000</li>
          <li>CORS is enabled in the backend</li>
        </ul>
      </div>
    </div>
  )
}

export default ErrorMessage

