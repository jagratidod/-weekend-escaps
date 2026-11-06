import React, { useState, useEffect, useRef } from 'react';
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
  Film,
  Camera,
  Sparkles,
  GripVertical,
  RotateCcw,
} from 'lucide-react';

const MAIN_NAV_ORDER_KEY = 'admin_sidebar_main_order_v3';
const SUB_NAV_PAGES_KEY = 'admin_sidebar_pages_order_v3';

const DEFAULT_MAIN_NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'bookings', label: 'Bookings', icon: CalendarCheck },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'pages_group', label: 'Pages', icon: FileText, isGroup: true },
  { id: 'broadcast', label: 'Push & Broadcast', icon: Radio },
  { id: 'leads', label: 'Inquiries & Leads', icon: ShoppingCart },
  { id: 'packages', label: 'Tour Packages', icon: Package },
  { id: 'settings', label: 'Settings & WhatsApp', icon: SettingsIcon },
];

const DEFAULT_PAGE_SUB_ITEMS = [
  { id: 'home_sections', label: 'Home Page Editor', icon: Sparkles },
  { id: 'about_editor', label: 'About Page Editor', icon: Compass },
  { id: 'gallery_editor', label: 'Gallery Page Editor', icon: Camera },
  { id: 'reels', label: 'Travel Reels', icon: Film },
  { id: 'blogs', label: 'Blogs & Journal', icon: BookOpen },
  { id: 'pages', label: 'Terms & Conditions', icon: FileText },
  { id: 'cancellation_policy', label: 'Cancellation Policy', icon: ShieldCheck },
  { id: 'testimonials', label: 'Testimonials', icon: MessageSquareQuote },
  { id: 'contact_editor', label: 'Contact Page Info', icon: HelpCircle },
];

// Helper to mathematically reorder array based on drop position ('top' or 'bottom')
function reorderArray(list, sourceIndex, targetIndex, position) {
  if (sourceIndex === targetIndex) return list;
  const next = [...list];
  const [removed] = next.splice(sourceIndex, 1);

  let targetInRemaining = targetIndex;
  if (sourceIndex < targetIndex) {
    targetInRemaining = targetIndex - 1;
  }

  const insertIndex = position === 'bottom' ? targetInRemaining + 1 : targetInRemaining;
  const clampedIndex = Math.max(0, Math.min(next.length, insertIndex));
  next.splice(clampedIndex, 0, removed);
  return next;
}

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

  // Main navigation items state with localStorage persistence
  const [mainNavItems, setMainNavItems] = useState(() => {
    try {
      const saved = localStorage.getItem(MAIN_NAV_ORDER_KEY);
      if (saved) {
        const order = JSON.parse(saved);
        if (Array.isArray(order)) {
          const itemMap = new Map(DEFAULT_MAIN_NAV_ITEMS.map((item) => [item.id, item]));
          const ordered = [];
          for (const id of order) {
            if (itemMap.has(id)) {
              ordered.push(itemMap.get(id));
              itemMap.delete(id);
            }
          }
          for (const item of itemMap.values()) {
            ordered.push(item);
          }
          return ordered;
        }
      }
    } catch (err) {
      console.error('Failed to load nav order:', err);
    }
    return DEFAULT_MAIN_NAV_ITEMS;
  });

  // Sub navigation items under "Pages" with localStorage persistence
  const [pageSubItems, setPageSubItems] = useState(() => {
    try {
      const saved = localStorage.getItem(SUB_NAV_PAGES_KEY);
      if (saved) {
        const order = JSON.parse(saved);
        if (Array.isArray(order)) {
          const itemMap = new Map(DEFAULT_PAGE_SUB_ITEMS.map((item) => [item.id, item]));
          const ordered = [];
          for (const id of order) {
            if (itemMap.has(id)) {
              ordered.push(itemMap.get(id));
              itemMap.delete(id);
            }
          }
          for (const item of itemMap.values()) {
            ordered.push(item);
          }
          return ordered;
        }
      }
    } catch (err) {
      console.error('Failed to load sub nav order:', err);
    }
    return DEFAULT_PAGE_SUB_ITEMS;
  });

  // Drag and drop state
  const [draggingInfo, setDraggingInfo] = useState(null); // { index, type: 'main' | 'sub' }
  const [dragOverInfo, setDragOverInfo] = useState({ index: null, position: null, type: null });
  const touchStateRef = useRef({ active: false, index: null, type: null });

  const isPageSubActive = pageSubItems.some((sub) => sub.id === activeTab);

  const isOrderCustomized =
    JSON.stringify(mainNavItems.map((i) => i.id)) !==
      JSON.stringify(DEFAULT_MAIN_NAV_ITEMS.map((i) => i.id)) ||
    JSON.stringify(pageSubItems.map((i) => i.id)) !==
      JSON.stringify(DEFAULT_PAGE_SUB_ITEMS.map((i) => i.id));

  const resetMenuOrder = () => {
    try {
      localStorage.removeItem(MAIN_NAV_ORDER_KEY);
      localStorage.removeItem(SUB_NAV_PAGES_KEY);
    } catch (err) {}
    setMainNavItems(DEFAULT_MAIN_NAV_ITEMS);
    setPageSubItems(DEFAULT_PAGE_SUB_ITEMS);
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (isPageSubActive) {
      setPagesOpen(true);
    }
  }, [activeTab, isPageSubActive]);

  // Drag event handlers (HTML5 Drag & Drop)
  const handleDragStart = (e, index, type) => {
    e.stopPropagation();
    try {
      e.dataTransfer.setData('text/plain', JSON.stringify({ index, type }));
      e.dataTransfer.effectAllowed = 'move';
    } catch (err) {}
    setDraggingInfo({ index, type });
  };

  const handleDragOver = (e, index, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggingInfo || draggingInfo.type !== type) return;

    try {
      e.dataTransfer.dropEffect = 'move';
    } catch (err) {}

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const position = offsetY < rect.height / 2 ? 'top' : 'bottom';

    if (
      dragOverInfo.index !== index ||
      dragOverInfo.position !== position ||
      dragOverInfo.type !== type
    ) {
      setDragOverInfo({ index, position, type });
    }
  };

  const handleDrop = (e, targetIndex, type) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggingInfo || draggingInfo.type !== type) {
      setDraggingInfo(null);
      setDragOverInfo({ index: null, position: null, type: null });
      return;
    }

    const sourceIndex = draggingInfo.index;
    const position = dragOverInfo.position || 'bottom';

    if (sourceIndex !== targetIndex) {
      if (type === 'main') {
        setMainNavItems((prev) => {
          const next = reorderArray(prev, sourceIndex, targetIndex, position);
          try {
            localStorage.setItem(MAIN_NAV_ORDER_KEY, JSON.stringify(next.map((i) => i.id)));
          } catch (err) {}
          return next;
        });
      } else if (type === 'sub') {
        setPageSubItems((prev) => {
          const next = reorderArray(prev, sourceIndex, targetIndex, position);
          try {
            localStorage.setItem(SUB_NAV_PAGES_KEY, JSON.stringify(next.map((i) => i.id)));
          } catch (err) {}
          return next;
        });
      }
    }

    setDraggingInfo(null);
    setDragOverInfo({ index: null, position: null, type: null });
  };

  const handleDragEnd = () => {
    setDraggingInfo(null);
    setDragOverInfo({ index: null, position: null, type: null });
  };

  // Touch drag handlers (Mobile / Tablet support)
  const handleTouchStart = (e, index, type) => {
    touchStateRef.current = { active: true, index, type };
    setDraggingInfo({ index, type });
  };

  const handleTouchMove = (e) => {
    if (!touchStateRef.current.active) return;
    const touch = e.touches[0];
    if (!touch) return;

    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!element) return;

    const targetRow = element.closest(`[data-nav-type="${touchStateRef.current.type}"]`);
    if (!targetRow) return;

    const targetIndex = parseInt(targetRow.getAttribute('data-nav-index'), 10);
    if (isNaN(targetIndex)) return;

    const rect = targetRow.getBoundingClientRect();
    const offsetY = touch.clientY - rect.top;
    const position = offsetY < rect.height / 2 ? 'top' : 'bottom';

    setDragOverInfo({
      index: targetIndex,
      position,
      type: touchStateRef.current.type,
    });
  };

  const handleTouchEnd = () => {
    if (!touchStateRef.current.active) return;

    if (dragOverInfo.index !== null && dragOverInfo.type === touchStateRef.current.type) {
      const sourceIndex = touchStateRef.current.index;
      const targetIndex = dragOverInfo.index;
      const position = dragOverInfo.position || 'bottom';
      const type = touchStateRef.current.type;

      if (sourceIndex !== targetIndex) {
        if (type === 'main') {
          setMainNavItems((prev) => {
            const next = reorderArray(prev, sourceIndex, targetIndex, position);
            try {
              localStorage.setItem(MAIN_NAV_ORDER_KEY, JSON.stringify(next.map((i) => i.id)));
            } catch (err) {}
            return next;
          });
        } else if (type === 'sub') {
          setPageSubItems((prev) => {
            const next = reorderArray(prev, sourceIndex, targetIndex, position);
            try {
              localStorage.setItem(SUB_NAV_PAGES_KEY, JSON.stringify(next.map((i) => i.id)));
            } catch (err) {}
            return next;
          });
        }
      }
    }

    touchStateRef.current = { active: false, index: null, type: null };
    setDraggingInfo(null);
    setDragOverInfo({ index: null, position: null, type: null });
  };

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
    <div className="h-screen w-full bg-[#EBF2F7] flex text-neutral-800 font-sans antialiased overflow-hidden">
      {/* ── Mobile Sidebar Overlay ── */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* ── Deep Slate Left Sidebar (Fixed & Stays Anchored) ── */}
      <aside
        className={`fixed lg:static top-0 left-0 z-50 h-screen w-64 bg-[#1A384C] text-white flex flex-col justify-between transition-transform duration-300 ease-out select-none flex-shrink-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* User Profile Card (Pinned at top - never scrolls away) */}
          <div className="p-6 pb-4 flex flex-col items-center text-center border-b border-white/10 relative flex-shrink-0">
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

          {/* Navigation Section Header with Drag Hint & Reset Order (Pinned) */}
          <div className="px-4 pt-3 pb-1 flex items-center justify-between text-[11px] font-semibold text-white/50 tracking-wider flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="uppercase text-[10px] text-white/40 font-bold">Menu</span>
              <span className="text-[10px] text-white/30 hidden sm:inline">• Drag to reorder</span>
            </div>
            {isOrderCustomized && (
              <button
                type="button"
                onClick={resetMenuOrder}
                title="Reset menu order to default"
                className="flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 normal-case tracking-normal px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 transition-colors font-medium cursor-pointer"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Reorderable Navigation Links (Scrolls internally if menu overflows) */}
          <nav className="mt-2 flex-1 space-y-1.5 pl-4 pr-1 overflow-y-auto min-h-0 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.2)_transparent]">
            {mainNavItems.map((item, index) => {
              const isDraggingThis =
                draggingInfo?.type === 'main' && draggingInfo?.index === index;
              const showDropTop =
                dragOverInfo.type === 'main' &&
                dragOverInfo.index === index &&
                dragOverInfo.position === 'top' &&
                draggingInfo?.index !== index;
              const showDropBottom =
                dragOverInfo.type === 'main' &&
                dragOverInfo.index === index &&
                dragOverInfo.position === 'bottom' &&
                draggingInfo?.index !== index;

              // ── Pages Expandable Group Item ──
              if (item.isGroup && item.id === 'pages_group') {
                return (
                  <div
                    key={item.id}
                    data-nav-id={item.id}
                    data-nav-index={index}
                    data-nav-type="main"
                    draggable
                    onDragStart={(e) => handleDragStart(e, index, 'main')}
                    onDragOver={(e) => handleDragOver(e, index, 'main')}
                    onDrop={(e) => handleDrop(e, index, 'main')}
                    onDragEnd={handleDragEnd}
                    className={`group relative transition-all duration-150 ${
                      isDraggingThis
                        ? 'opacity-30 scale-[0.98] border border-dashed border-[#FF6B16]/60 rounded-l-xl bg-white/5'
                        : 'opacity-100'
                    }`}
                  >
                    {/* Top drop line indicator */}
                    {showDropTop && (
                      <div className="h-0.5 mx-3 bg-[#FF6B16] rounded-full shadow-[0_0_8px_#FF6B16] animate-pulse my-1 relative z-20 pointer-events-none" />
                    )}

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
                        className={`w-full flex items-center justify-between gap-2.5 pl-2.5 pr-4 py-3 text-sm font-semibold transition-all relative text-left cursor-pointer ${
                          isPageSubActive && !pagesOpen
                            ? 'bg-[#EBF2F7] text-[#1A384C] font-extrabold rounded-l-2xl shadow-sm'
                            : isPageSubActive
                            ? 'text-white font-bold bg-white/10 rounded-l-xl'
                            : 'text-white/80 hover:text-white hover:bg-white/5 rounded-l-xl'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Drag Grip Handle */}
                          <div
                            className={`p-1 rounded cursor-grab active:cursor-grabbing transition-colors touch-none flex items-center justify-center ${
                              isPageSubActive && !pagesOpen
                                ? 'text-[#1A384C]/40 hover:text-[#1A384C]'
                                : 'text-white/30 group-hover:text-white/80 hover:!text-[#FF6B16]'
                            }`}
                            title="Drag up or down to reorder"
                            onClick={(e) => e.stopPropagation()}
                            onTouchStart={(e) => handleTouchStart(e, index, 'main')}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                            onTouchCancel={handleTouchEnd}
                          >
                            <GripVertical className="w-3.5 h-3.5 flex-shrink-0" />
                          </div>

                          <FileText
                            className={`w-4 h-4 flex-shrink-0 ${
                              isPageSubActive ? 'text-[#FF6B16]' : 'text-white/70'
                            }`}
                          />
                          <span className="truncate">Pages</span>
                        </div>

                        <div className="flex items-center gap-2 pr-1">
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

                      {/* Expandable Reorderable Subpages List */}
                      {pagesOpen && (
                        <div className="ml-5 pl-2 border-l border-white/15 space-y-1 my-1">
                          {pageSubItems.map((sub, subIndex) => {
                            const SubIcon = sub.icon;
                            const isSubActive = activeTab === sub.id;
                            const isDraggingThisSub =
                              draggingInfo?.type === 'sub' && draggingInfo?.index === subIndex;
                            const showSubDropTop =
                              dragOverInfo.type === 'sub' &&
                              dragOverInfo.index === subIndex &&
                              dragOverInfo.position === 'top' &&
                              draggingInfo?.index !== subIndex;
                            const showSubDropBottom =
                              dragOverInfo.type === 'sub' &&
                              dragOverInfo.index === subIndex &&
                              dragOverInfo.position === 'bottom' &&
                              draggingInfo?.index !== subIndex;

                            return (
                              <div
                                key={sub.id}
                                data-nav-id={sub.id}
                                data-nav-index={subIndex}
                                data-nav-type="sub"
                                draggable
                                onDragStart={(e) => handleDragStart(e, subIndex, 'sub')}
                                onDragOver={(e) => handleDragOver(e, subIndex, 'sub')}
                                onDrop={(e) => handleDrop(e, subIndex, 'sub')}
                                onDragEnd={handleDragEnd}
                                className={`group/sub relative transition-all duration-150 ${
                                  isDraggingThisSub
                                    ? 'opacity-30 scale-[0.98] border border-dashed border-[#FF6B16]/60 rounded-l-xl bg-white/5'
                                    : 'opacity-100'
                                }`}
                              >
                                {showSubDropTop && (
                                  <div className="h-0.5 mx-2 bg-[#FF6B16] rounded-full shadow-[0_0_8px_#FF6B16] animate-pulse my-1 relative z-20 pointer-events-none" />
                                )}

                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onTabChange) onTabChange(sub.id);
                                    setMobileSidebarOpen(false);
                                  }}
                                  className={`w-full flex items-center justify-between gap-2 pl-2 pr-3.5 py-2.5 text-xs font-semibold transition-all relative text-left cursor-pointer ${
                                    isSubActive
                                      ? 'bg-[#EBF2F7] text-[#1A384C] font-extrabold rounded-l-2xl shadow-sm'
                                      : 'text-white/70 hover:text-white hover:bg-white/5 rounded-l-xl'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div
                                      className={`p-0.5 rounded cursor-grab active:cursor-grabbing transition-colors touch-none flex items-center justify-center ${
                                        isSubActive
                                          ? 'text-[#1A384C]/40 hover:text-[#1A384C]'
                                          : 'text-white/25 group-hover/sub:text-white/75 hover:!text-[#FF6B16]'
                                      }`}
                                      title="Drag up or down to reorder subpage"
                                      onClick={(e) => e.stopPropagation()}
                                      onTouchStart={(e) => handleTouchStart(e, subIndex, 'sub')}
                                      onTouchMove={handleTouchMove}
                                      onTouchEnd={handleTouchEnd}
                                      onTouchCancel={handleTouchEnd}
                                    >
                                      <GripVertical className="w-3 h-3 flex-shrink-0" />
                                    </div>

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

                                {showSubDropBottom && (
                                  <div className="h-0.5 mx-2 bg-[#FF6B16] rounded-full shadow-[0_0_8px_#FF6B16] animate-pulse my-1 relative z-20 pointer-events-none" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Bottom drop line indicator */}
                    {showDropBottom && (
                      <div className="h-0.5 mx-3 bg-[#FF6B16] rounded-full shadow-[0_0_8px_#FF6B16] animate-pulse my-1 relative z-20 pointer-events-none" />
                    )}
                  </div>
                );
              }

              // ── Regular Navigation Item ──
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <div
                  key={item.id}
                  data-nav-id={item.id}
                  data-nav-index={index}
                  data-nav-type="main"
                  draggable
                  onDragStart={(e) => handleDragStart(e, index, 'main')}
                  onDragOver={(e) => handleDragOver(e, index, 'main')}
                  onDrop={(e) => handleDrop(e, index, 'main')}
                  onDragEnd={handleDragEnd}
                  className={`group relative transition-all duration-150 ${
                    isDraggingThis
                      ? 'opacity-30 scale-[0.98] border border-dashed border-[#FF6B16]/60 rounded-l-xl bg-white/5'
                      : 'opacity-100'
                  }`}
                >
                  {/* Top drop line indicator */}
                  {showDropTop && (
                    <div className="h-0.5 mx-3 bg-[#FF6B16] rounded-full shadow-[0_0_8px_#FF6B16] animate-pulse my-1 relative z-20 pointer-events-none" />
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (onTabChange) onTabChange(item.id);
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 pl-2.5 pr-4 py-3 text-sm font-semibold transition-all relative text-left cursor-pointer ${
                      isActive
                        ? 'bg-[#EBF2F7] text-[#1A384C] font-extrabold rounded-l-2xl shadow-sm'
                        : 'text-white/80 hover:text-white hover:bg-white/5 rounded-l-xl'
                    }`}
                  >
                    {/* Drag Grip Handle */}
                    <div
                      className={`p-1 rounded cursor-grab active:cursor-grabbing transition-colors touch-none flex items-center justify-center ${
                        isActive
                          ? 'text-[#1A384C]/40 hover:text-[#1A384C]'
                          : 'text-white/30 group-hover:text-white/80 hover:!text-[#FF6B16]'
                      }`}
                      title="Drag up or down to reorder"
                      onClick={(e) => e.stopPropagation()}
                      onTouchStart={(e) => handleTouchStart(e, index, 'main')}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      onTouchCancel={handleTouchEnd}
                    >
                      <GripVertical className="w-3.5 h-3.5 flex-shrink-0" />
                    </div>

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

                  {/* Bottom drop line indicator */}
                  {showDropBottom && (
                    <div className="h-0.5 mx-3 bg-[#FF6B16] rounded-full shadow-[0_0_8px_#FF6B16] animate-pulse my-1 relative z-20 pointer-events-none" />
                  )}
                </div>
              );
            })}
          </nav>

          {/* Bottom Controls (Live Site + Logout) (Pinned at bottom) */}
          <div className="p-4 border-t border-white/10 space-y-1 flex-shrink-0">
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

      {/* ── Main Workspace Area (Independent Smooth Scroll) ── */}
      <div className="flex-1 h-screen flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar (Pinned with frosted glass effect) */}
        <header className="px-5 sm:px-8 py-5 flex items-center justify-between gap-4 select-none flex-shrink-0 sticky top-0 bg-[#EBF2F7]/95 backdrop-blur-md z-30">
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
