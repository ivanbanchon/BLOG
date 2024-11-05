// src/components/Alert.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

const ALERT_ICONS = {
  error: AlertCircle,
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info
};
const ALERT_TITLES = {
  error: 'Error',
  success: 'Éxito',
  warning: 'Advertencia',
  info: 'Información'
};
export const Alert = ({ 
  children, 
  type = 'info', 
  onClose, 
  className = '',
  autoClose = true,
  autoCloseTime = 5000,
  showIcon = true
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const Icon = ALERT_ICONS[type] || ALERT_ICONS.info;
  const title = ALERT_TITLES[type] || ALERT_TITLES.info;
  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    if (autoClose && isVisible) {
      const timer = setTimeout(handleClose, autoCloseTime);
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseTime, isVisible, handleClose]);

  if (!isVisible) return null;

  return (
    <div
      className={`alert alert-${type} ${isExiting ? 'alert-exit' : 'alert-enter'} ${className}`}
      role="alert"
    >
      <div className="alert-content">
        {showIcon && (
          <div className="alert-icon">
            <Icon className="w-5 h-5" />
          </div>
        )}

        <div className="alert-message">
          <div className="alert-header">
            <div>
              <p className="alert-title">{title}</p>
              <div>{children}</div>
            </div>

            {onClose && (
              <button
                onClick={handleClose}
                className="alert-close"
                aria-label="Cerrar alerta"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {autoClose && (
        <div className="alert-progress">
          <div
            className="alert-progress-bar"
            style={{
              animation: `shrink ${autoCloseTime}ms linear forwards`
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Alert;