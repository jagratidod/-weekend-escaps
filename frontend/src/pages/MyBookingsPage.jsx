import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Phone,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Compass,
  MapPin,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Check,
  Flag,
  MessageCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { DEFAULT_THEME_COLOR, hexToRgb } from '../utils/themeUtils';

const STAGE_CONFIG = [
  {
    step: 1,
    key: 'BOOKED',
    label: 'Select Your Trek (Booked)',
    shortLabel: 'BOOKED',
    desc: 'Customer ki trek booking confirm ho gayi hai. Payment & slot confirmed.',
  },
  {
    step: 2,
    key: 'DEPARTURE',
    label: 'Departure & Reporting',
    shortLabel: 'DEPARTURE',
    desc: 'Trek departure ka stage. Journey start hone wali hai ya departure process mein hai.',
  },
  {
    step: 3,
    key: 'EXPLORING',
    label: 'Exploring The Trail',
    shortLabel: 'EXPLORING',
    desc: 'Customer trek par hai aur mountains, campsites aur trekking experience enjoy kar raha hai.',
  },
  {
    step: 4,
    key: 'EXPLORED',
    label: 'Summit & Explored',
    shortLabel: 'EXPLORED',
    desc: 'Customer ka trek successfully complete ho gaya hai.',
  },
];

const SUB_TABS = [
  { id: 'overview', label: 'Trip Overview' },
  { id: 'itinerary', label: 'Day-Wise Plan' },
  { id: 'travelers', label: 'Travelers Info' },
  { id: 'payment', label: 'Payment & Pass' },
];

export default function MyBookingsPage() {
  const [searchParams] = useSearchParams();
  const { settings = {}, API_BASE_URL, whatsappUrl } = useSettings();

  // Dynamic Theme Colors matching the Registration Wizard
  const themeColor = settings.themeColor || DEFAULT_THEME_COLOR || '#FF6B16';

  const themeDarker = useMemo(() => {
    const rgb = hexToRgb(themeColor);
    if (!rgb) return '#C2410C';
    return `rgb(${Math.max(0, Math.floor(rgb.r * 0.78))}, ${Math.max(0, Math.floor(rgb.g * 0.78))}, ${Math.max(0, Math.floor(rgb.b * 0.78))})`;
  }, [themeColor]);

  const themeDarkest = useMemo(() => {
    const rgb = hexToRgb(themeColor);
    if (!rgb) return '#7C2D12';
    return `rgb(${Math.max(0, Math.floor(rgb.r * 0.58))}, ${Math.max(0, Math.floor(rgb.g * 0.58))}, ${Math.max(0, Math.floor(rgb.b * 0.58))})`;
  }, [themeColor]);

  const companyName = settings.siteName || 'Weekend Escapes';

  const [phoneInput, setPhoneInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const [customerName, setCustomerName] = useState('');
  const [allBookings, setAllBookings] = useState([]);
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [ongoingTrips, setOngoingTrips] = useState([]);
  const [pastTrips, setPastTrips] = useState([]);

  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'ongoing' | 'past'
  const [bookingSubTabs, setBookingSubTabs] = useState({});

  const resultsRef = useRef(null);

  // Clear any previously saved phone so the input is always fresh and empty on load
  useEffect(() => {
    try {
      localStorage.removeItem('my_booking_phone');
    } catch (_) {
      // ignore
    }
  }, []);

  const getSubTab = (id) => bookingSubTabs[id] || 'overview';
  const setSubTab = (id, tabKey) =>
    setBookingSubTabs((prev) => ({ ...prev, [id]: tabKey }));

  // Fetch bookings by mobile number - only when explicitly searched by the user
  const handleSearchBookings = useCallback(
    async (numberToSearch) => {
      const targetPhone = String(numberToSearch || phoneInput).replace(/\D/g, '').slice(-10);

      if (!targetPhone || targetPhone.length < 10) {
        setErrorMsg('Please enter a valid 10-digit mobile number.');
        return;
      }

      const startTime = Date.now();
      try {
        setLoading(true);
        setErrorMsg('');

        // Smooth scroll to loader position immediately so user sees the searching feedback
        setTimeout(() => {
          if (resultsRef.current) {
            const yOffset = -90;
            const y = resultsRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        }, 100);

        const res = await fetch(`${API_BASE_URL}/bookings/my-bookings?phone=${targetPhone}`);
        const data = await res.json();

        // Smooth minimum animation duration so searching loader feels smooth & authentic
        const elapsed = Date.now() - startTime;
        if (elapsed < 650) {
          await new Promise((resolve) => setTimeout(resolve, 650 - elapsed));
        }

        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to retrieve bookings.');
        }

        setHasSearched(true);
        setCustomerName(data.customerName || 'Explorer');
        setAllBookings(data.bookings || []);
        setUpcomingTrips(data.upcoming || []);
        setOngoingTrips(data.ongoing || []);
        setPastTrips(data.past || []);

        // Auto-select smartest tab
        if (data.ongoing && data.ongoing.length > 0) {
          setActiveTab('ongoing');
        } else if (data.upcoming && data.upcoming.length > 0) {
          setActiveTab('upcoming');
        } else if (data.past && data.past.length > 0) {
          setActiveTab('past');
        } else {
          setActiveTab('upcoming');
        }

        // Smoothly auto-scroll to the populated results section
        setTimeout(() => {
          if (resultsRef.current) {
            const yOffset = -90;
            const y = resultsRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        }, 150);
      } catch (err) {
        console.error('Fetch bookings error:', err);
        setErrorMsg(err.message || 'Could not find bookings for this mobile number.');
      } finally {
        setLoading(false);
      }
    },
    [API_BASE_URL, phoneInput]
  );

  const currentList = useMemo(() => {
    if (activeTab === 'ongoing') return ongoingTrips;
    if (activeTab === 'past') return pastTrips;
    return upcomingTrips;
  }, [activeTab, upcomingTrips, ongoingTrips, pastTrips]);

  const tabsConfig = [
    { id: 'upcoming', label: 'Upcoming Trips', count: upcomingTrips.length },
    { id: 'ongoing', label: 'Ongoing Live •', count: ongoingTrips.length, isLive: true },
    { id: 'past', label: 'Past Trips', count: pastTrips.length },
  ];

  return (
    <div className="min-h-screen bg-[#F7F7F5] pb-24 text-[#111111] relative overflow-hidden font-sans">
      {/* ── Soft Clean Ambient Background Circles (Registration Wizard Aesthetic) ── */}
      <div
        className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full opacity-10 pointer-events-none transition-all duration-500"
        style={{ backgroundColor: themeColor }}
      />
      <div
        className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full opacity-10 pointer-events-none transition-all duration-500"
        style={{ backgroundColor: themeColor }}
      />

      {/* ── 1. ATMOSPHERIC THEME HERO BANNER WITH PARALLEL 2-COLUMN LAYOUT ── */}
      <section
        data-navbar-theme="dark"
        className="relative bg-[#111111] text-white pt-28 pb-16 sm:pt-36 sm:pb-20 lg:pt-40 lg:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden select-none"
        style={{
          backgroundImage: 'url("/images/hero/my-bookings-hero.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center 45%',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Soft Dark Vignette & Gradient Overlay so scenic mountain sunset remains gorgeous & vibrant while text stays ultra-sharp */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/50 to-[#111111]/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_20%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* ── LEFT COLUMN: MY BOOKINGS TITLE & EXPEDITION PERKS ── */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-left">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.7)] leading-[1.1]">
              My Bookings
            </h1>

            <p className="text-neutral-200 text-sm sm:text-base lg:text-lg max-w-xl font-medium leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
              Enter your registered mobile number to check your upcoming adventures, live expedition stage, payment receipts, and day-wise itineraries.
            </p>
          </div>

          {/* ── RIGHT COLUMN: ENHANCED INPUT DIV (CARD) ── */}
          <div className="lg:col-span-5 w-full">
            <div className="relative">
              {/* Theme ambient glow behind card */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-[#FF6B16]/30 to-[#e05809]/30 rounded-[32px] blur-xl opacity-75 pointer-events-none" />

              <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-7 shadow-2xl border border-white/80">
                {/* Header inside the enhanced div */}
                <div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-neutral-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#FF6B16] shadow-xs">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-[#111111] tracking-tight">
                        Access Your Trip Pass
                      </h3>
                      <p className="text-xs text-neutral-500 font-medium">
                        Instant real-time booking lookup
                      </p>
                    </div>
                  </div>
                </div>

                {/* Search Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSearchBookings();
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                      Registered Mobile Number
                    </label>

                    <div className="flex items-center group">
                      {/* Country Code Pill */}
                      <div className="flex items-center gap-1.5 px-3.5 py-3.5 sm:py-4 bg-neutral-100/90 rounded-l-2xl border border-r-0 border-neutral-300 text-neutral-800 text-sm font-bold select-none shrink-0 group-focus-within:border-[#FF6B16] transition-colors">
                        <span className="text-base leading-none">🇮🇳</span>
                        <span>+91</span>
                      </div>

                      {/* Number Input */}
                      <div className="relative flex-1">
                        <input
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          value={phoneInput}
                          onChange={(e) => {
                            const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setPhoneInput(cleaned);
                            if (errorMsg) setErrorMsg('');
                          }}
                          placeholder="98765 43210"
                          className="w-full px-4 py-3.5 sm:py-4 rounded-r-2xl border border-neutral-300 focus:border-[#FF6B16] focus:ring-3 focus:ring-[#FF6B16]/20 text-neutral-900 text-base font-black tracking-wide placeholder:text-neutral-400 placeholder:font-normal placeholder:tracking-normal outline-hidden transition-all shadow-xs"
                        />
                        {phoneInput && (
                          <button
                            type="button"
                            onClick={() => {
                              setPhoneInput('');
                              setHasSearched(false);
                              setErrorMsg('');
                            }}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                            title="Clear number"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="flex items-center gap-2 text-xs text-red-600 font-semibold p-2.5 bg-red-50 rounded-xl border border-red-100">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Enhanced CTA Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-[#FF6B16] to-[#e05809] hover:brightness-105 active:scale-[0.99] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-orange-950/25 transition-all cursor-pointer disabled:opacity-60 group"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Searching Bookings...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>Find My Bookings</span>
                        <ArrowRight className="w-4 h-4 opacity-80 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SEARCHING LOADER STATE (Animated Feedback with Auto-Scroll Anchor) ── */}
      {loading && (
        <section
          ref={resultsRef}
          className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-16 text-center scroll-mt-24"
        >
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200/90 shadow-2xl max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 text-[#FF6B16] flex items-center justify-center mx-auto shadow-md">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-black text-neutral-900 tracking-tight">
                Searching Your Bookings...
              </h3>
              <p className="text-xs text-neutral-500 mt-1 font-medium">
                Fetching confirmed passes & live expedition itineraries
              </p>
            </div>
            <div className="flex items-center justify-center gap-1.5 pt-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B16] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B16] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B16] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </section>
      )}

      {/* ── 2. BOOKINGS RESULTS & DETAILS (REGISTRATION WIZARD SPLIT CARD LAYOUT) ── */}
      {hasSearched && !loading && (
        <section
          ref={resultsRef}
          id="booking-results-section"
          className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 scroll-mt-24 relative z-10"
        >
          {/* Customer Greeting Header */}
          <div className="text-center space-y-1 sm:space-y-1.5 mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#111111] tracking-tight">
              Hey {customerName} 👋
            </h2>
            <p className="text-neutral-500 text-xs sm:text-sm font-semibold">
              Here are your active trip passes & expedition details
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center justify-center mb-8">
            <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-white border border-neutral-200/80 shadow-md max-w-full overflow-x-auto no-scrollbar">
              {tabsConfig.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'text-white shadow-md'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                    }`}
                    style={
                      isActive
                        ? {
                            background: `linear-gradient(135deg, ${themeColor} 0%, ${themeDarker} 100%)`,
                          }
                        : {}
                    }
                  >
                    {tab.isLive && (
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isActive ? 'bg-white' : 'bg-emerald-500'
                        } animate-pulse`}
                      />
                    )}
                    <span>{tab.label}</span>
                    <span className="opacity-90 font-mono text-[11px]">({tab.count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Empty State */}
          {currentList.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-neutral-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.10)] max-w-md mx-auto space-y-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-sm"
                style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
              >
                <Compass className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-neutral-900">
                  No {activeTab} bookings found
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                  {activeTab === 'upcoming'
                    ? 'You do not have any upcoming adventures scheduled yet.'
                    : activeTab === 'ongoing'
                    ? 'You have no trips ongoing today.'
                    : 'No past adventure history recorded for this number.'}
                </p>
              </div>
              <Link
                to="/packages"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold transition-all shadow-md"
                style={{
                  background: `linear-gradient(135deg, ${themeColor} 0%, ${themeDarker} 100%)`,
                }}
              >
                Explore Destinations <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-10">
              {currentList.map((booking) => {
                const currentStep = booking.progress?.step || 1;
                const advancePaid = booking.financials?.totalAdvancePaid || 0;
                const balanceDue = booking.financials?.balanceDue || 0;
                const travelers = booking.travelers || [];
                const itinerary = booking.progress?.datedItinerary || [];
                const activeSubTab = getSubTab(booking._id);

                return (
                  <div
                    key={booking._id || booking.bookingRef}
                    className="w-full bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.14)] overflow-hidden flex flex-col md:flex-row relative border border-neutral-150 min-h-[540px] transition-all duration-300"
                  >
                    {/* ========================================================================= */}
                    {/* LEFT SIDEBAR (Theme Color Gradient with Step Badges - EXACTLY LIKE WIZARD) */}
                    {/* ========================================================================= */}
                    <div
                      className="w-full md:w-80 lg:w-[340px] text-white p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shrink-0 shadow-lg transition-all duration-500"
                      style={{
                        background: `linear-gradient(170deg, ${themeColor} 0%, ${themeDarker} 60%, ${themeDarkest} 100%)`,
                      }}
                    >
                      {/* Top Brand & Package Name */}
                      <div className="mb-6 relative z-10">
                        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase leading-snug drop-shadow-sm">
                          {booking.packageName}
                        </h2>
                        <p className="text-xs text-white/80 mt-1 font-medium">
                          📅 {booking.progress?.startDateFormatted || booking.travelDate} • {booking.totalPersons} Seat(s)
                        </p>
                      </div>

                      {/* Vertical Step Items List (Matching Reference Screenshot) */}
                      <div className="space-y-5 sm:space-y-6 my-auto py-3 relative z-10">
                        {STAGE_CONFIG.map((stage) => {
                          const isDone = stage.step < currentStep || currentStep === 4;
                          const isCurrent = stage.step === currentStep && currentStep !== 4;

                          return (
                            <div
                              key={stage.key}
                              className="flex items-center justify-between gap-4 cursor-default select-none transition-all"
                            >
                              {/* Step Title Label */}
                              <div className="pr-2">
                                <span
                                  className={`text-xs sm:text-sm tracking-wide block transition-all ${
                                    isCurrent
                                      ? 'text-white font-black drop-shadow-sm'
                                      : isDone
                                      ? 'text-white/90 font-bold'
                                      : 'text-white/50 font-normal'
                                  }`}
                                >
                                  {stage.label}
                                </span>
                                <span className="text-[10px] text-white/70 block mt-0.5">
                                  {isDone ? 'Completed' : isCurrent ? 'Active Now' : 'Upcoming Stage'}
                                </span>
                              </div>

                              {/* Overlapping Number Circle Badge (Matching Screenshot) */}
                              <div
                                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-black text-sm shrink-0 transition-all duration-300 shadow-md ${
                                  isCurrent
                                    ? 'bg-white ring-[3.5px] ring-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.55)] scale-105'
                                    : isDone
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-white/95 text-neutral-400 border border-white/20'
                                }`}
                                style={isCurrent ? { color: themeColor } : {}}
                              >
                                {isDone ? (
                                  <Check className="w-5 h-5 stroke-[3]" />
                                ) : (
                                  stage.step
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* ========================================================================= */}
                    {/* RIGHT CONTENT AREA (White Form Panel - EXACTLY LIKE WIZARD) */}
                    {/* ========================================================================= */}
                    <div className="flex-1 bg-white p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative">
                      {/* Top Horizontal Sub-Tabs Header (Matching Reference Screenshot) */}
                      <div>
                        <div className="border-b border-neutral-150 pb-3 mb-6">
                          <div className="flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
                            <div className="flex items-center gap-5 sm:gap-7">
                              {SUB_TABS.map((tab) => {
                                const isTabActive = activeSubTab === tab.id;
                                return (
                                  <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setSubTab(booking._id, tab.id)}
                                    className={`text-xs sm:text-sm font-bold pb-2 transition-all cursor-pointer relative whitespace-nowrap ${
                                      isTabActive
                                        ? 'font-black text-neutral-900'
                                        : 'text-neutral-400 hover:text-neutral-700'
                                    }`}
                                    style={isTabActive ? { color: themeColor } : {}}
                                  >
                                    {tab.label}
                                    {isTabActive && (
                                      <div
                                        className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full transition-all"
                                        style={{ backgroundColor: themeColor }}
                                      />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* ─────────────────────────────────────────────────────────────
                            TAB 1: OVERVIEW (Matching Screenshot Form Inputs & Selects)
                            ───────────────────────────────────────────────────────────── */}
                        {activeSubTab === 'overview' && (
                          <div className="space-y-4">
                            {/* Trip / Trek Name Input Style Box */}
                            <div className="space-y-1.5">
                              <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                                TRIP / TREK NAME
                              </label>
                              <div className="w-full bg-neutral-50/80 border border-neutral-250 rounded-xl px-4 py-3 text-neutral-900 text-sm font-black flex items-center justify-between shadow-xs">
                                <span>{booking.packageName}</span>
                                {booking.sharingType && (
                                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-orange-100 text-[#FF6B16] border border-orange-200">
                                    {booking.sharingType}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Departure Date & Booking Type Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                                  DEPARTURE DATE
                                </label>
                                <div className="w-full bg-neutral-50/80 border border-neutral-250 rounded-xl px-4 py-3 text-neutral-900 text-sm font-bold flex items-center justify-between shadow-xs">
                                  <span>{booking.progress?.startDateFormatted || booking.travelDate}</span>
                                  <Calendar className="w-4 h-4 text-neutral-400" />
                                </div>
                              </div>

                              <div className="space-y-1.5">
                                <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                                  CONFIRMED TRAVELERS
                                </label>
                                <div className="w-full bg-neutral-50/80 border border-neutral-250 rounded-xl px-4 py-3 text-neutral-900 text-sm font-bold flex items-center justify-between shadow-xs">
                                  <span>{booking.totalPersons} Explorer(s)</span>
                                  <Users className="w-4 h-4 text-neutral-400" />
                                </div>
                              </div>
                            </div>

                            {/* Current Stage Highlight Box */}
                            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 text-emerald-950 flex items-start gap-3.5 shadow-xs">
                              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200 mt-0.5">
                                <Compass className="w-5 h-5 stroke-[2.5]" />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700">
                                  Stage {currentStep} of 4 • {STAGE_CONFIG[currentStep - 1]?.shortLabel}
                                </span>
                                <h4 className="text-xs sm:text-sm font-bold text-emerald-950">
                                  {STAGE_CONFIG[currentStep - 1]?.label}
                                </h4>
                                <p className="text-xs text-emerald-900/90 leading-relaxed font-medium">
                                  {STAGE_CONFIG[currentStep - 1]?.desc}
                                </p>
                              </div>
                            </div>

                            {/* Advance Paid Mini Row */}
                            <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/70 flex items-center justify-between text-xs">
                              <span className="font-bold text-neutral-600">Total Advance Paid:</span>
                              <span className="font-black text-emerald-800 text-sm">
                                ₹{advancePaid.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* ─────────────────────────────────────────────────────────────
                            TAB 2: DAY-WISE ITINERARY
                            ───────────────────────────────────────────────────────────── */}
                        {activeSubTab === 'itinerary' && (
                          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                            {itinerary.length === 0 ? (
                              <p className="text-xs text-neutral-500 py-6 text-center">
                                Detailed day-wise itinerary will be synced prior to departure.
                              </p>
                            ) : (
                              itinerary.map((dayItem, idx) => (
                                <div
                                  key={idx}
                                  className="p-3.5 sm:p-4 rounded-xl border border-neutral-200 bg-neutral-50/70 hover:bg-neutral-50 flex items-start gap-3.5 transition-all shadow-2xs"
                                >
                                  {/* Day Number Node Badge */}
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 shadow-xs ${
                                      dayItem.isLiveToday
                                        ? 'bg-white ring-[3px] ring-emerald-400 shadow-sm'
                                        : dayItem.isPassed
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-white border-2 border-neutral-300 text-neutral-500'
                                    }`}
                                    style={dayItem.isLiveToday ? { color: themeColor } : {}}
                                  >
                                    {dayItem.isPassed ? (
                                      <Check className="w-4 h-4 stroke-[3]" />
                                    ) : (
                                      idx
                                    )}
                                  </div>

                                  <div className="space-y-1 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h5 className="text-xs sm:text-sm font-black text-neutral-900">
                                        Day {idx} | {dayItem.title} ({dayItem.formattedDate})
                                      </h5>
                                      {dayItem.isLiveToday && (
                                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                          Live Today
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-neutral-600 leading-relaxed font-normal">
                                      {dayItem.desc}
                                    </p>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}

                        {/* ─────────────────────────────────────────────────────────────
                            TAB 3: TRAVELERS
                            ───────────────────────────────────────────────────────────── */}
                        {activeSubTab === 'travelers' && (
                          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                            {travelers.length === 0 ? (
                              <p className="text-xs text-neutral-500 py-6 text-center">
                                Traveler roster assigned for {booking.totalPersons} seat(s).
                              </p>
                            ) : (
                              travelers.map((traveler, tIdx) => (
                                <div
                                  key={traveler.id || tIdx}
                                  className="bg-neutral-50/80 rounded-xl p-4 border border-neutral-200/80 space-y-2.5 shadow-2xs"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 inline-block">
                                      Traveler #{tIdx + 1}
                                    </span>
                                    <span className="text-xs sm:text-sm font-black text-neutral-900">
                                      {traveler.name}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-200/60 text-xs">
                                    <div>
                                      <span className="text-[10px] text-neutral-400 font-bold uppercase block">
                                        AGE
                                      </span>
                                      <span className="font-bold text-neutral-800">
                                        {traveler.age ? `${traveler.age} Yrs` : 'N/A'}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-[10px] text-neutral-400 font-bold uppercase block">
                                        GENDER
                                      </span>
                                      <span className="font-bold text-neutral-800 capitalize">
                                        {traveler.gender || 'N/A'}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-[10px] text-neutral-400 font-bold uppercase block">
                                        PHONE
                                      </span>
                                      <span className="font-bold text-neutral-800 font-mono">
                                        {traveler.phone || booking.primaryContact?.phone || 'N/A'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}

                        {/* ─────────────────────────────────────────────────────────────
                            TAB 4: PAYMENT & PASS
                            ───────────────────────────────────────────────────────────── */}
                        {activeSubTab === 'payment' && (
                          <div className="space-y-4">
                            {/* Advance Paid Highlight Card */}
                            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 flex items-center justify-between gap-4 shadow-xs">
                              <div className="flex items-center gap-3.5">
                                <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200 shadow-xs">
                                  <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
                                </div>
                                <div>
                                  <h4 className="text-xs sm:text-sm font-bold text-emerald-950">
                                    Total Advance Paid
                                  </h4>
                                  <p className="text-[11px] sm:text-xs text-emerald-700/80 font-medium">
                                    Secured via {companyName} Gateways
                                  </p>
                                </div>
                              </div>

                              <div className="text-right">
                                <span className="text-xl sm:text-2xl font-black text-emerald-900">
                                  ₹{advancePaid.toLocaleString('en-IN')}
                                </span>
                                {balanceDue > 0 && (
                                  <p className="text-[11px] text-neutral-500 font-semibold mt-0.5">
                                    Balance Due: ₹{balanceDue.toLocaleString('en-IN')}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Summary Checklist */}
                            <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/70 space-y-2.5 text-xs">
                              <div className="flex justify-between border-b border-neutral-200 pb-2">
                                <span className="text-neutral-500 font-bold uppercase text-[10px]">
                                  Booking Reference:
                                </span>
                                <span className="font-mono font-black text-neutral-900">
                                  {booking.bookingRef}
                                </span>
                              </div>
                              <div className="flex justify-between border-b border-neutral-200 pb-2">
                                <span className="text-neutral-500 font-bold uppercase text-[10px]">
                                  Payment Status:
                                </span>
                                <span className="font-bold text-emerald-700">
                                  {booking.financials?.statusLabel || 'CONFIRMED'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-neutral-500 font-bold uppercase text-[10px]">
                                  Support:
                                </span>
                                <span className="font-semibold text-neutral-800">
                                  Trip Marshal WhatsApp 24x7
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* ========================================================================= */}
                      {/* BOTTOM NAVIGATION FOOTER (Matching Reference Screenshot) */}
                      {/* ========================================================================= */}
                      <div className="pt-6 border-t border-neutral-150 flex items-center justify-end gap-2 mt-6">
                        {/* Action Buttons: Next Tab or WhatsApp */}
                        <div className="flex items-center gap-2">
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors"
                          >
                            <MessageCircle className="w-4 h-4 text-emerald-600" />
                            <span>Trip Marshal</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => {
                              const subTabKeys = ['overview', 'itinerary', 'travelers', 'payment'];
                              const curIdx = subTabKeys.indexOf(activeSubTab);
                              const nextIdx = (curIdx + 1) % subTabKeys.length;
                              setSubTab(booking._id, subTabKeys[nextIdx]);
                            }}
                            className="px-5 py-2.5 rounded-xl text-white font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-md hover:brightness-105 active:scale-95 transition-all cursor-pointer"
                            style={{
                              background: `linear-gradient(135deg, ${themeColor} 0%, ${themeDarker} 100%)`,
                            }}
                          >
                            <span>
                              {activeSubTab === 'overview'
                                ? 'Next: Itinerary →'
                                : activeSubTab === 'itinerary'
                                ? 'Next: Travelers →'
                                : activeSubTab === 'travelers'
                                ? 'Next: Receipt →'
                                : 'Back to Overview ↺'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
