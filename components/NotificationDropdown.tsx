import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Check, Bell, Info, Award, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationDropdownProps {
    onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
    const { appNotifications, markNotificationAsRead } = useApp();

    const getIcon = (type: string) => {
        switch (type) {
            case 'rescue_update': return <Award className="text-brand-primary" size={16} />;
            case 'activity_update': return <Zap className="text-brand-secondary" size={16} />;
            default: return <Info className="text-brand-primary" size={16} />;
        }
    };

    return (
        <div className="absolute right-0 mt-3 w-80 bg-ui-surface border border-white/10 rounded-[24px] shadow-2xl z-[100] animate-in slide-in-from-top-2 duration-300 overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-2">
                    <Bell size={16} className="text-brand-primary" />
                    <h3 className="text-xs font-black uppercase tracking-widest">Notificações</h3>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                    <X size={14} className="text-ui-muted" />
                </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {appNotifications.length === 0 ? (
                    <div className="p-10 text-center">
                        <Bell className="mx-auto mb-3 text-ui-muted opacity-20" size={32} />
                        <p className="text-[10px] text-ui-muted font-bold uppercase tracking-widest">Nenhuma notificação</p>
                    </div>
                ) : (
                    appNotifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors relative group ${!notification.isRead ? 'bg-brand-primary/5' : ''}`}
                        >
                            {!notification.isRead && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-primary" />
                            )}
                            <div className="flex gap-3">
                                <div className="mt-1 flex-shrink-0">
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-2">
                                        <h4 className={`text-[11px] font-bold truncate ${!notification.isRead ? 'text-ui-text' : 'text-ui-muted'}`}>
                                            {notification.title}
                                        </h4>
                                        <span className="text-[9px] text-ui-muted whitespace-nowrap">
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: ptBR })}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-ui-muted leading-relaxed mt-1 line-clamp-2">
                                        {notification.message}
                                    </p>
                                    {!notification.isRead && (
                                        <button
                                            onClick={() => markNotificationAsRead(notification.id)}
                                            className="mt-2 text-[9px] font-black text-brand-primary uppercase tracking-widest flex items-center gap-1 hover:underline"
                                        >
                                            <Check size={10} /> Marcar como lida
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {appNotifications.length > 0 && (
                <div className="p-3 text-center border-t border-white/5">
                    <p className="text-[9px] text-ui-muted font-bold uppercase tracking-widest">Central de Avisos</p>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
