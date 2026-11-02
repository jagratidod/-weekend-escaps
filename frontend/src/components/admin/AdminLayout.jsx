import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import {
  LayoutDashboard,
  Compass,
  Package,
  ShoppingCart,
  BarChart3,
  HelpCircle,
  Settings as SettingsIcon,
  LogOut,
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  ExternalLink,
  Loader2,
  MessageSquareQuote,
  FileText,
  ChevronDown,
  CalendarCheck,
  CreditCard,
  ShieldCheck,
  BookOpen,
  Radio,
} from 'lucide-react';

export default function AdminLayout({
  children,
  activeTab = 'dashboard',
  onTabChange,
}) {
  const { admin, isAuthenticated, loading, logout } = useAuth();
  const { logoUrl } = useSettings();
  const navigate = useNavigate();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagesOpen, setPagesOpen] = useState(true);

  const pageSubItems = [
    { id: 'pages', label: 'Terms & Conditions', icon: FileText },
    { id: 'cancellation_policy', label: 'Cancellation Policy', icon: ShieldCheck },
    { id: 'testimonials', label: 'Testimonials', icon: MessageSquareQuote },
    { id: 'contact_editor', label: 'Contact Page Info', icon: HelpCircle },
  ];

  const otherNavItems = [
    { id: 'broadcast', label: 'Push & Broadcast', icon: Radio },
    { id: 'leads', label: 'Inquiries & Leads', icon: ShoppingCart },
    { id: 'destinations', label: 'Destinations', icon: Compass },
    { id: 'packages', label: 'Tour Packages', icon: Package },
    { id: 'settings', label: 'Settings & WhatsApp', icon: SettingsIcon },
  ];

  const isPageSubActive = pageSubItems.some((sub) => sub.id === activeTab);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (isPageSubActive) {
      setPagesOpen(true);
    }
  }, [activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EBF2F7] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF6B16]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const adminName = admin?.name || 'Nirmal Kumar P';
  const adminEmail = admin?.email || 'admin@weekendescapes.com';
  const adminInitial = adminName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#EBF2F7] flex text-neutral-800 font-sans antialiased overflow-x-hidden">
      {/* ── Mobile Sidebar Overlay ── */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* ── Deep Slate Left Sidebar ── */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-[#1A384C] text-white flex flex-col justify-between transition-transform duration-300 ease-out select-none flex-shrink-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* User Profile Card (Reference Header) */}
          <div className="p-6 pb-4 flex flex-col items-center text-center border-b border-white/10 relative">
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden absolute top-4 right-4 text-white/70 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Avatar */}
            <div className="relative mb-3">
              <div className="w-16 h-16 rounded-full border-2 border-white/80 p-0.5 bg-gradient-to-tr from-[#FF6B16] to-amber-400 flex items-center justify-center shadow-lg">
                <div className="w-full h-full rounded-full bg-[#244960] flex items-center justify-center text-white font-black text-xl">
                  {adminInitial}
                </div>
              </div>
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#1A384C]" />
            </div>

            <h3 className="font-bold text-sm tracking-wide text-white leading-tight">
              {adminName}
            </h3>
            <p className="text-[11px] text-white/60 font-medium truncate max-w-[190px] mt-0.5">
              {adminEmail}
            </p>
          </div>

          {/* Navigation Links with Reference Curved Active Tab Styling */}
          <nav className="mt-4 flex-1 space-y-1.5 pl-4 pr-0">
            {/* 1. Dashboard Tab */}
            <button
              onClick={() => {
                if (onTabChange) onTabChange('dashboard');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 text-sm font-semibold transition-all relative text-left cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#EBF2F7] text-[#1A384C] font-extrabold rounded-l-2xl shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/5 rounded-l-xl'
              }`}
            >
              <LayoutDashboard
                className={`w-4 h-4 flex-shrink-0 ${
                  activeTab === 'dashboard' ? 'text-[#FF6B16]' : 'text-white/70'
                }`}
              />
              <span className="truncate">Dashboard</span>

              {/* Active Indicator dot */}
              {activeTab === 'dashboard' && (
                <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[#FF6B16]" />
              )}
            </button>

            {/* 2. Bookings Management Tab */}
            <button
              onClick={() => {
                if (onTabChange) onTabChange('bookings');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 text-sm font-semibold transition-all relative text-left cursor-pointer ${
                activeTab === 'bookings'
                  ? 'bg-[#EBF2F7] text-[#1A384C] font-extrabold rounded-l-2xl shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/5 rounded-l-xl'
              }`}
            >
              <CalendarCheck
                className={`w-4 h-4 flex-shrink-0 ${
                  activeTab === 'bookings' ? 'text-[#FF6B16]' : 'text-white/70'
                }`}
              />
              <span className="truncate">Bookings</span>

              {/* Active Indicator dot */}
              {activeTab === 'bookings' && (
                <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[#FF6B16]" />
              )}
            </button>

            {/* 2b. PhonePe Payments Management Tab */}
            <button
              type="button"
              onClick={() => {
                if (onTabChange) onTabChange('payments');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 text-sm font-semibold transition-all relative text-left cursor-pointer ${
                activeTab === 'payments'
                  ? 'bg-[#EBF2F7] text-[#1A384C] font-extrabold rounded-l-2xl shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/5 rounded-l-xl'
              }`}
            >
              <CreditCard
                className={`w-4 h-4 flex-shrink-0 ${
                  activeTab === 'payments' ? 'text-[#FF6B16]' : 'text-white/70'
                }`}
              />
              <span className="truncate">Payments</span>

              {/* Active Indicator dot */}
              {activeTab === 'payments' && (
                <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[#FF6B16]" />
              )}
            </button>

            {/* 1c. Blogs & Travel Stories Nav Item */}
            <button
              type="button"
              onClick={() => {
                if (onTabChange) onTabChange('blogs');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 text-sm font-semibold transition-all relative text-left cursor-pointer ${
                activeTab === 'blogs'
                  ? 'bg-[#EBF2F7] text-[#1A384C] font-extrabold rounded-l-2xl shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/5 rounded-l-xl'
              }`}
            >
              <BookOpen
                className={`w-4 h-4 flex-shrink-0 ${
                  activeTab === 'blogs' ? 'text-[#FF6B16]' : 'text-white/70'
                }`}
              />
              <span className="truncate">Blogs & Journal</span>

              {/* Active Indicator dot */}
              {activeTab === 'blogs' && (
                <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[#FF6B16]" />
              )}
            </button>

            {/* 2. Pages Menu with Subpages (Expandable) */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  if (!pagesOpen) {
                    setPagesOpen(true);
                    if (!isPageSubActive && onTabChange) {
                      onTabChange('pages');
                    }
                  } else {
                    setPagesOpen(false);
                  }
                }}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-sm font-semibold transition-all relative text-left cursor-pointer ${
                  isPageSubActive && !pagesOpen
                    ? 'bg-[#EBF2F7] text-[#1A384C] font-extrabold rounded-l-2xl shadow-sm'
                    : isPageSubActive
                    ? 'text-white font-bold bg-white/10 rounded-l-xl'
                    : 'text-white/80 hover:text-white hover:bg-white/5 rounded-l-xl'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <FileText
                    className={`w-4 h-4 flex-shrink-0 ${
                      isPageSubActive ? 'text-[#FF6B16]' : 'text-white/70'
                    }`}
                  />
                  <span className="truncate">Pages</span>
                </div>

                <div className="flex items-center gap-2 pr-3">
                  {isPageSubActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B16]" />
                  )}
                  <ChevronDown
                    className={`w-4 h-4 text-white/60 transition-transform duration-200 ${
                      pagesOpen ? 'rotate-180 text-white' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Expandable Subpages List */}
              {pagesOpen && (
                <div className="ml-4 pl-2 border-l border-white/15 space-y-1 my-1">
                  {pageSubItems.map((sub) => {
                    const SubIcon = sub.icon;
                    const isSubActive = activeTab === sub.id;

                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          if (onTabChange) onTabChange(sub.id);
                          setMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 text-xs font-semibold transition-all relative text-left cursor-pointer ${
                          isSubActive
                            ? 'bg-[#EBF2F7] text-[#1A384C] font-extrabold rounded-l-2xl shadow-sm'
                            : 'text-white/70 hover:text-white hover:bg-white/5 rounded-l-xl'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <SubIcon
                            className={`w-3.5 h-3.5 flex-shrink-0 ${
                              isSubActive ? 'text-[#FF6B16]' : 'text-white/60'
                            }`}
                          />
                          <span className="truncate">{sub.label}</span>
                        </div>

                        {/* Active Indicator dot */}
                        {isSubActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B16] flex-shrink-0 mr-1" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Other Navigation Items */}
            {otherNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (onTabChange) onTabChange(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 text-sm font-semibold transition-all relative text-left cursor-pointer ${
                    isActive
                      ? 'bg-[#EBF2F7] text-[#1A384C] font-extrabold rounded-l-2xl shadow-sm'
                      : 'text-white/80 hover:text-white hover:bg-white/5 rounded-l-xl'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 ${
                      isActive ? 'text-[#FF6B16]' : 'text-white/70'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>

                  {/* Active Indicator dot */}
                  {isActive && (
                    <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[#FF6B16]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Controls (Live Site + Logout) */}
          <div className="p-4 border-t border-white/10 space-y-1">
            <Link
              to="/"
              target="_blank"
              className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-emerald-400" />
              <span>Visit Live Website</span>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-red-300 hover:text-red-200 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Workspace Area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar (from reference) */}
        <header className="px-5 sm:px-8 py-5 flex items-center justify-between gap-4 select-none">
          {/* Left Greeting & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white border border-neutral-200 text-neutral-700 shadow-sm"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#1A384C] tracking-tight">
                Welcome {adminName.split(' ')[0]} !
              </h1>
            </div>
          </div>

          {/* Right Search Bar, Theme Toggle, Notification Bell */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search Input (reference style) */}
            <div className="relative hidden md:block">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-56 lg:w-72 h-10 pl-4 pr-10 rounded-full bg-white border border-neutral-200/80 text-xs sm:text-sm text-neutral-700 placeholder-neutral-400 focus:outline-none focus:border-[#1A384C] shadow-sm transition-all"
              />
              <button
                type="button"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#1A384C] text-white flex items-center justify-center hover:bg-[#254c66] transition-colors"
                aria-label="Search"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Dark / Light Toggle Pill (reference style) */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="h-8 px-2.5 rounded-full bg-[#1A384C] text-white flex items-center gap-1.5 text-xs shadow-sm hover:bg-[#254c66] transition-colors cursor-pointer"
              title="Toggle theme appearance"
            >
              {darkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline text-[11px] font-bold">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-sky-200" />
                  <span className="hidden sm:inline text-[11px] font-bold">Dark</span>
                </>
              )}
            </button>

            {/* Notification Bell with Badge */}
            <button
              className="relative p-2 rounded-full bg-white border border-neutral-200/80 text-neutral-600 hover:text-neutral-900 shadow-sm transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF6B16]" />
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="px-5 sm:px-8 pb-10 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
