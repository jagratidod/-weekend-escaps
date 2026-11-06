import React, { useState } from 'react';
import { Bell, BellRing, BellOff, Check, Loader2 } from 'lucide-react';
import { usePushNotifications } from '../../hooks/usePushNotifications';

export default function NotificationBell({ className = '', isLight = false }) {
  const {
    permission,
    isSubscribed,
    loading,
    requestNotificationPermission,
    unsubscribe,
  } = usePushNotifications();

  const [tooltip, setTooltip] = useState(false);

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await requestNotificationPermission();
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={handleToggle}
        onMouseEnter={() => setTooltip(true)}
        onMouseLeave={() => setTooltip(false)}
        disabled={loading}
        className={`relative p-2.5 rounded-full transition-all duration-200 cursor-pointer ${
          isSubscribed
            ? isLight
              ? 'bg-[#FF6B16]/20 text-[#FF6B16] ring-1 ring-[#FF6B16]/40 hover:bg-[#FF6B16]/30'
              : 'bg-[#FF6B16]/10 text-[#FF6B16] hover:bg-[#FF6B16]/20'
            : isLight
            ? 'bg-white/15 text-white hover:bg-white/25 border border-white/20 backdrop-blur-sm shadow-sm'
            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
        }`}
        aria-label={isSubscribed ? 'Notifications enabled' : 'Enable notifications'}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-[#FF6B16]" />
        ) : isSubscribed ? (
          <>
            <BellRing className="w-4 h-4 text-[#FF6B16]" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          </>
        ) : (
          <Bell className="w-4 h-4" />
        )}
      </button>

      {/* Tooltip */}
      {tooltip && (
        <div className="absolute right-0 top-full mt-2 w-48 p-2 bg-[#111111] text-white text-[11px] rounded-xl shadow-xl z-50 pointer-events-none text-center">
          {isSubscribed
            ? 'Push notifications are active. Click to mute.'
            : permission === 'denied'
            ? 'Notifications blocked in browser settings.'
            : 'Click to receive instant tour alerts & offers.'}
        </div>
      )}
    </div>
  );
}
