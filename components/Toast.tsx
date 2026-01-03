
import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { NotificationType } from '../types';

const Toast: React.FC = () => {
  const { notifications, removeNotification } = useApp();

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success': return <CheckCircle size={18} className="text-brand-primary" />;
      case 'error': return <XCircle size={18} className="text-semantic-error" />;
      case 'warning': return <AlertTriangle size={18} className="text-semantic-warning" />;
      case 'info': return <Info size={18} className="text-semantic-info" />;
    }
  };

  const getBorderColor = (type: NotificationType) => {
    switch (type) {
      case 'success': return 'border-brand-primary/40';
      case 'error': return 'border-semantic-error/40';
      case 'warning': return 'border-semantic-warning/40';
      case 'info': return 'border-semantic-info/40';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 w-full max-w-xs pointer-events-none">
      {notifications.map((n) => (
        <div 
          key={n.id}
          className={`pointer-events-auto flex items-center gap-3 p-4 rounded-2xl glass-card border ${getBorderColor(n.type)} shadow-2xl animate-in slide-in-from-right-10 fade-in duration-300`}
        >
          <div className="flex-shrink-0">
            {getIcon(n.type)}
          </div>
          <p className="text-xs font-bold text-ui-text flex-1">{n.message}</p>
          <button 
            onClick={() => removeNotification(n.id)}
            className="text-ui-muted hover:text-ui-text transition-colors p-1"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
