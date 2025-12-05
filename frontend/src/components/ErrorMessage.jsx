import React from 'react'
import './ErrorMessage.css'

function ErrorMessage({ message, onRetry }) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
  const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
  
  return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <h2>Error Loading Data</h2>
      <p className="error-message">{message}</p>
      
      {/* Debug info */}
      <div className="error-debug" style={{ marginTop: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '5px', fontSize: '12px' }}>
        <strong>Debug Info:</strong>
        <br />
        API URL: <code>{apiUrl}</code>
        <br />
        Frontend Origin: <code>{window.location.origin}</code>
        <br />
        Environment: {isProduction ? 'Production' : 'Development'}
        {isProduction && !import.meta.env.VITE_API_URL && (
          <div style={{ marginTop: '10px', color: '#d32f2f', fontWeight: 'bold' }}>
            ⚠️ VITE_API_URL is not set! Set it in Vercel environment variables.
          </div>
        )}
        {isProduction && import.meta.env.VITE_API_URL && (
          <div style={{ marginTop: '10px', color: '#1976d2', fontWeight: 'bold' }}>
            ℹ️ Add <code>{window.location.origin}</code> to ALLOWED_ORIGINS on Railway backend, or set ALLOWED_ORIGINS=*
          </div>
        )}
      </div>
      
      {onRetry && (
        <button className="retry-btn" onClick={onRetry}>
          Try Again
        </button>
      )}
      <div className="error-help">
        <p>Make sure:</p>
        <ul>
          {isProduction ? (
            <>
              <li><strong>VITE_API_URL</strong> is set in Vercel environment variables</li>
              <li>Backend is deployed and accessible</li>
              <li>CORS is enabled on backend (set ALLOWED_ORIGINS=*)</li>
              <li>Backend URL includes <code>/api/v1</code> at the end</li>
            </>
          ) : (
            <>
              <li>The API server is running (./run.sh)</li>
              <li>The server is accessible at http://localhost:8000</li>
              <li>CORS is enabled in the backend</li>
            </>
          )}
        </ul>
      </div>
    </div>
  )
}

export default ErrorMessage

