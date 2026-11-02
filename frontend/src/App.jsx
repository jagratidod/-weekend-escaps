import React from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AppRoutes from './routes/AppRoutes';
import ScrollToTop from './components/common/ScrollToTop';
import { MessageCircle } from 'lucide-react';
import { BRAND } from './utils/constants';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { usePushNotifications } from './hooks/usePushNotifications';
import PushNotificationToast from './components/common/PushNotificationToast';

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const { whatsappUrl } = useSettings();
  const { foregroundNotification, dismissForegroundNotification } = usePushNotifications();

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F5] text-[#111111]">
      {/* Global In-App Push Notification Toast (Foreground) */}
      <PushNotificationToast
        notification={foregroundNotification}
        onDismiss={dismissForegroundNotification}
      />

      {/* Sticky Header Navbar (hidden on /admin routes) */}
      {!isAdminRoute && <Header />}

      {/* Dynamic Route Pages */}
      <main className="flex-grow">
        <AppRoutes />
      </main>

      {/* Footer (hidden on /admin routes) */}
      {!isAdminRoute && <Footer />}

      {/* Floating WhatsApp Action Button (hidden on /admin routes) */}
      {!isAdminRoute && (
        <a
          href={whatsappUrl || BRAND.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with travel guide on WhatsApp"
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 group cursor-pointer"
        >
          <MessageCircle className="w-7 h-7 fill-white/20" />
          <span className="absolute right-16 bg-neutral-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Chat with an Expert
          </span>
        </a>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <ScrollToTop />
          <AppContent />
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
