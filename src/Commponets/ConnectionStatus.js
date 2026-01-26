// components/ConnectionStatus.jsx
import React, { useState } from 'react';
import { 
  ExclamationCircleOutlined, 
  ReloadOutlined, 
  CheckCircleOutlined,
  LoadingOutlined 
} from '@ant-design/icons';
import '../styles/ConnectionStatus.css';

const ConnectionStatus = ({ 
  status = 'loading', // 'loading' | 'error' | 'success' | 'demo'
  message,
  onRetry,
  className = ''
}) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const statusConfig = {
    loading: {
      icon: <LoadingOutlined className="spin-animation" />,
      color: '#3b82f6',
      bgColor: '#eff6ff',
      defaultMessage: 'Connecting to server...'
    },
    error: {
      icon: <ExclamationCircleOutlined className="pulse-animation" />,
      color: '#dc2626',
      bgColor: '#fef2f2',
      defaultMessage: 'Real-time connection failed'
    },
    success: {
      icon: <CheckCircleOutlined />,
      color: '#059669',
      bgColor: '#f0fdf4',
      defaultMessage: 'Connected successfully'
    },
    demo: {
      icon: <ExclamationCircleOutlined className="breathing-animation" />,
      color: '#92400e',
      bgColor: '#fffbeb',
      defaultMessage: 'Showing demo data'
    }
  };

  const config = statusConfig[status] || statusConfig.error;

  const handleRetry = async () => {
    if (!onRetry || isRetrying) return;
    
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setTimeout(() => setIsRetrying(false), 1000);
    }
  };

  return (
    <div 
      className={`connection-status ${status} ${className}`}
      style={{ 
        backgroundColor: config.bgColor,
        borderLeft: `4px solid ${config.color}`
      }}
    >
      <div className="status-content">
        <div className="icon-wrapper" style={{ color: config.color }}>
          {isRetrying ? <LoadingOutlined className="spin-animation" /> : config.icon}
        </div>
        
        <div className="message-section">
          <span className="status-message">
            {message || config.defaultMessage}
          </span>
          {status === 'error' && (
            <span className="status-subtext">
              Check your network connection and try again
            </span>
          )}
          {status === 'demo' && (
            <span className="status-subtext">
              Live data will appear when connection is restored
            </span>
          )}
        </div>

        {(status === 'error' || status === 'demo') && onRetry && (
          <button
            className={`retry-btn ${isRetrying ? 'retrying' : ''}`}
            onClick={handleRetry}
            disabled={isRetrying}
            title="Retry connection"
            style={{ color: config.color }}
          >
            {isRetrying ? (
              <LoadingOutlined className="spin-animation" />
            ) : (
              <ReloadOutlined className="hover-rotate" />
            )}
            <span>{isRetrying ? 'Retrying...' : 'Retry'}</span>
          </button>
        )}
      </div>

      {/* Progress bar for loading state */}
      {status === 'loading' && (
        <div className="progress-track">
          <div className="progress-bar indeterminate"></div>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;