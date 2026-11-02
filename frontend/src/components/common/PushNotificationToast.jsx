import React, { useEffect } from 'react';
import { Bell, X, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PushNotificationToast({ notification, onDismiss }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 8000);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) return null;

  const handleClick = () => {
    if (notification.link) {
      if (notification.link.startsWith('http')) {
        window.open(notification.link, '_blank');
      } else {
        navigate(notification.link);
      }
    }
    onDismiss();
  };

  return (
    <div className="fixed top-5 right-5 z-[9999] max-w-sm w-full animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-[#111111] text-white p-4 rounded-2xl shadow-2xl border border-white/10 flex items-start gap-3 backdrop-blur-md">
        <div className="w-10 h-10 rounded-full bg-[#FF6B16] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#FF6B16]/30">
          <Bell className="w-5 h-5 animate-pulse" />
        </div>

        <div className="flex-1 min-w-0 cursor-pointer" onClick={handleClick}>
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-bold text-white truncate">
              {notification.title || 'Weekend Escapes'}
            </h4>
            <span className="text-[10px] text-white/50 shrink-0">Just now</span>
          </div>
          <p className="text-xs text-white/80 mt-1 line-clamp-2 leading-relaxed">
            {notification.body}
          </p>
          {notification.link && (
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#FF6B16] hover:underline mt-2">
              <span>View details</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          )}
        </div>

        <button
          onClick={onDismiss}
          className="text-white/40 hover:text-white p-1 rounded-lg transition-colors cursor-pointer shrink-0"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
