import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { usePackages } from '../context/PackageContext';
import { getImageUrl } from '../utils/imageHelper';
import Container from '../components/common/Container';
import {
  Clock,
  MapPin,
  Star,
  CheckCircle,
  XCircle,
  Calendar,
  Users,
  ShieldCheck,
  ArrowRight,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Zap,
} from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import { BRAND } from '../utils/constants';
import { useSettings } from '../context/SettingsContext';
import ItineraryTimeline from '../components/packages/ItineraryTimeline';
import TripReelsRow from '../components/home/TripReelsRow';
import WhatToPack from '../components/packages/WhatToPack';
import PackageFAQ from '../components/packages/PackageFAQ';
import YouMayAlsoLike from '../components/packages/YouMayAlsoLike';
import AvailableDatesSection from '../components/packages/AvailableDatesSection';

const WhatsAppIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.69 12.04 3.69C14.25 3.69 16.31 4.55 17.87 6.11C19.42 7.67 20.28 9.74 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15ZM16.56 14.41C16.31 14.29 15.09 13.69 14.86 13.61C14.63 13.52 14.47 13.48 14.3 13.73C14.14 13.97 13.66 14.54 13.51 14.71C13.37 14.87 13.22 14.89 12.97 14.77C12.73 14.65 11.93 14.39 10.99 13.55C10.25 12.89 9.76 12.08 9.61 11.83C9.47 11.59 9.6 11.45 9.72 11.33C9.83 11.22 9.97 11.04 10.09 10.9C10.21 10.76 10.26 10.65 10.34 10.49C10.42 10.33 10.38 10.18 10.32 10.06C10.26 9.94 9.76 8.72 9.56 8.23C9.36 7.75 9.16 7.82 9.01 7.81C8.87 7.8 8.71 7.8 8.54 7.8C8.38 7.8 8.11 7.86 7.89 8.11C7.66 8.35 7.03 8.94 7.03 10.15C7.03 11.36 7.91 12.52 8.03 12.69C8.16 12.85 9.76 15.32 12.22 16.38C12.81 16.63 13.26 16.78 13.62 16.89C14.21 17.08 14.74 17.05 15.17 16.99C15.65 16.92 16.63 16.39 16.84 15.81C17.04 15.24 17.04 14.75 16.98 14.65C16.92 14.54 16.8 14.47 16.56 14.41Z" />
  </svg>
);

export function PackageDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPackageById, checkAvailability, getUpcomingSlots } = usePackages();
  const pkg = getPackageById(id);

  const {
    whatsappUrl,
    getCustomWhatsAppUrl,
    themeColor = '#FF6B16',
    themeColorHover = '#e05809',
  } = useSettings();
  const packageWaUrl = getCustomWhatsAppUrl
    ? getCustomWhatsAppUrl(`Hi Weekend Escapes! I would like to inquire about the package: ${pkg?.name || pkg?.title || 'Tour Package'}`)
    : whatsappUrl;

  const expertWaUrl = getCustomWhatsAppUrl
    ? getCustomWhatsAppUrl(
        `Hi Weekend Escapes! I would like to connect with a trip expert for *${pkg?.name || pkg?.title || 'the tour package'}* (${pkg?.duration || ''}, ${pkg?.location || ''}). Please guide me with dates, itinerary & booking!`
      )
    : packageWaUrl || whatsappUrl || 'https://wa.me/919876543210';

  const NAV_SECTIONS = [
    { id: 'section-itinerary', label: 'Day-by-Day Itinerary' },
    { id: 'section-dates', label: 'Available Dates' },
    { id: 'section-inclusions', label: "What's Included" },
    { id: 'section-policy', label: 'Important Guidelines' },
  ];

  const [activeSection, setActiveSection] = useState('section-itinerary');

  // Scrollspy effect: highlight active tab as user scrolls down the page
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180;
      for (let i = NAV_SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(NAV_SECTIONS[i].id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(NAV_SECTIONS[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      const yOffset = -120;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedCity, setSelectedCity] = useState(pkg?.departureCities?.[0] || 'Ahmedabad');

  const selectedDateLabel = useMemo(() => {
    if (!selectedDate) return '';
    try {
      const d = new Date(selectedDate.includes('T') ? selectedDate : `${selectedDate}T00:00:00`);
      return d.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);
  const [travelersCount, setTravelersCount] = useState(1);

  // Dynamic Pricing Tiers State (Sharing & Distance based)
  const displayTiers = (() => {
    if (Array.isArray(pkg?.pricingTiers) && pkg.pricingTiers.length > 0) {
      return pkg.pricingTiers;
    }
    // If distance package: provide route options
    if (pkg?.pricingType === 'distance') {
      const base = Number(pkg?.price) > 0 ? Number(pkg.price) : 5999;
      const dest = pkg?.name?.split(' ')[0] || 'Manali';
      return [
        { name: `${dest} to ${dest}`, subtext: 'Ex-Basecamp (Direct Report)', price: base, originalPrice: pkg?.originalPrice ? Number(pkg.originalPrice) : Math.round(base * 1.3), isDefault: true },
        { name: 'Delhi to Delhi', subtext: 'Including AC Volvo Bus Transfers', price: base + 2000, originalPrice: pkg?.originalPrice ? Number(pkg.originalPrice) + 2000 : Math.round((base + 2000) * 1.3), isDefault: false },
      ];
    }
    // If standard pricing type explicitly set, no tiers
    if (pkg?.pricingType === 'standard') {
      return [];
    }
    // Default 3 sharing tiers (Quad, Triple, Double) using package price and location
    const base = Number(pkg?.price) > 0 ? Number(pkg.price) : 4500;
    const orig = pkg?.originalPrice ? Number(pkg.originalPrice) : null;
    const locName = pkg?.location ? pkg.location.split(',')[0].trim() : 'Basecamp';
    return [
      { name: 'Quad Sharing', subtext: `Camp in ${locName}`, price: base, originalPrice: orig || Math.round(base * 1.3), isDefault: true },
      { name: 'Triple Sharing', subtext: `Camp in ${locName}`, price: base + 500, originalPrice: orig ? orig + 500 : Math.round((base + 500) * 1.3), isDefault: false },
      { name: 'Double Sharing', subtext: `Camp in ${locName}`, price: base + 1000, originalPrice: orig ? orig + 1000 : Math.round((base + 1000) * 1.3), isDefault: false },
    ];
  })();

  const tiers = displayTiers;

  const [selectedTier, setSelectedTier] = useState(() => {
    return displayTiers.find((t) => t.isDefault) || displayTiers[0] || null;
  });

  useEffect(() => {
    if (displayTiers.length > 0) {
      const initial = displayTiers.find((t) => t.isDefault) || displayTiers[0];
      setSelectedTier(initial);
    } else {
      setSelectedTier(null);
    }
  }, [pkg?.id, pkg?._id]);

  const effectivePrice = Number(pkg?.price) || 0;
  const effectiveOriginalPrice = pkg?.originalPrice ? Number(pkg.originalPrice) : null;

  const discountPercent =
    effectiveOriginalPrice && effectiveOriginalPrice > effectivePrice
      ? Math.round(((effectiveOriginalPrice - effectivePrice) / effectiveOriginalPrice) * 100)
      : null;

  const gstRate = Number(pkg?.gstRate) >= 0 ? Number(pkg?.gstRate) : 5;
  const baseAmount = effectivePrice;
  const gstAmount = Number(((baseAmount * gstRate) / 100).toFixed(2));
  const grandTotal = Number((baseAmount + gstAmount).toFixed(2));

  // Availability & Slots State
  const [upcomingSlots, setUpcomingSlots] = useState([]);
  const [scheduleType, setScheduleType] = useState('daily');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Minimum date selectable (tomorrow)
  const tomorrowStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  // Fetch upcoming departure slots
  useEffect(() => {
    let isMounted = true;
    const loadSlots = async () => {
      const targetId = pkg?.id || pkg?._id || id;
      if (!targetId) return;
      setLoadingSlots(true);
      const res = await getUpcomingSlots(targetId);
      if (isMounted && res?.slots) {
        setUpcomingSlots(res.slots);
        setScheduleType(res.scheduleType || 'daily');
        // Pre-select first available slot if not selected
        if (!selectedDate && res.slots.length > 0) {
          const firstOpen = res.slots.find((s) => s.status !== 'sold_out') || res.slots[0];
          if (firstOpen?.date) {
            setSelectedDate(firstOpen.date);
          }
        }
      }
      if (isMounted) setLoadingSlots(false);
    };

    loadSlots();
    return () => {
      isMounted = false;
    };
  }, [pkg?.id, pkg?._id, id]);

  // Live availability check whenever date or traveler count changes
  useEffect(() => {
    let isMounted = true;
    const targetId = pkg?.id || pkg?._id || id;
    if (!selectedDate || !targetId) {
      setAvailabilityResult(null);
      return;
    }

    const check = async () => {
      setCheckingAvailability(true);
      const res = await checkAvailability(targetId, selectedDate, travelersCount);
      if (isMounted) {
        setAvailabilityResult(res);
        setCheckingAvailability(false);
      }
    };

    const timer = setTimeout(check, 200);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [selectedDate, travelersCount, pkg?.id, pkg?._id, id]);

  const handleCheckAvailability = (e) => {
    if (e?.preventDefault) e.preventDefault();
    const cityParam = selectedCity ? `?city=${encodeURIComponent(selectedCity)}` : '';
    navigate(`/book/${pkg.id || pkg._id}${cityParam}`, {
      state: { city: selectedCity },
    });
  };

  const handleSelectTierAndBook = (tier) => {
    setSelectedTier(tier);
    const count = Math.max(1, travelersCount);
    setTravelersCount(count);

    if (pkg?.isPrivateTrek) {
      const waMsg = `Hi Weekend Escapes! I would like to book a Private Trek for *${pkg.name}* with *${tier.name}* option (${formatCurrency(tier.price)}/person). Group size: ${count} travelers, Date: ${selectedDate || 'Flexible'}. Please guide us!`;
      const waUrl = getCustomWhatsAppUrl ? getCustomWhatsAppUrl(waMsg) : (whatsappUrl || 'https://wa.me/917983695277');
      window.open(waUrl, '_blank');
      return;
    }

    handleCheckAvailability(null, tier, count);
  };

  const includedItems = Array.isArray(pkg.included) && pkg.included.length > 0
    ? pkg.included
    : ['Experienced Trip Marshal', 'All Meals & Stays', 'Permits & Safety Gears'];

  const excludedItems = Array.isArray(pkg.excluded) && pkg.excluded.length > 0
    ? pkg.excluded
    : [
        'Personal expenses and tips',
        'Insurance and emergency evacuation',
        'Anything not mentioned in inclusions',
      ];

  return (
    <div className="pt-24 pb-24 bg-[#F7F7F5] min-h-screen">
      {/* Hero Banner for Package */}
      <div className="relative h-[55vh] min-h-[400px] w-full bg-neutral-900 overflow-hidden">
        <img
          src={getImageUrl(pkg.image)}
          alt={pkg.name}
          className="w-full h-full object-cover object-center opacity-85 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        <div className="absolute inset-0 flex items-end">
          <Container className="pb-8 sm:pb-10 text-white w-full">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 sm:gap-6">
              {/* Left Column: Badges, Title & Meta */}
              <div className="max-w-3xl">
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mb-3">
                  {pkg.badge && (
                    <span
                      className={`px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-md ${
                        pkg.badgeColor || 'bg-[#FF6B16] text-white'
                      }`}
                    >
                      {pkg.badge}
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold border border-white/10 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-[#FF6B16] text-[#FF6B16]" />
                    {pkg.rating || 4.9} ({pkg.reviewsCount || 120} reviews)
                  </span>
                  {pkg.season && (
                    <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold border border-white/10">
                      {pkg.season}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
                  {pkg.name}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-neutral-300 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#FF6B16]" />
                    {pkg.duration}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#FF6B16]" />
                    {pkg.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#FF6B16]" />
                    {pkg.groupSize || '12 - 18 Explorers'}
                  </span>
                </div>
              </div>

              {/* Right Column: Connect with Expert WhatsApp CTA */}
              <div className="shrink-0 flex items-center pt-2 md:pt-0">
                <a
                  href={expertWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-black text-sm sm:text-base shadow-xl shadow-black/50 hover:shadow-[#25D366]/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-white/20 backdrop-blur-xs group"
                >
                  <WhatsAppIcon className="w-5 h-5 fill-white group-hover:scale-110 transition-transform shrink-0" />
                  <span>Connect with Expert</span>
                </a>
              </div>
            </div>
          </Container>
        </div>
      </div>

      {/* Main Details & Booking Grid */}
      <Container className="mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Itinerary, Inclusions, Highlights */}
          <div className="lg:col-span-8 space-y-8">
            {/* Sticky Navigation Bar with active indicator */}
            <div className="sticky top-20 z-20 bg-white/95 backdrop-blur-md pt-2 pb-1 border-b border-neutral-200 overflow-x-auto no-scrollbar shadow-xs">
              <div className="flex items-center gap-1 sm:gap-2">
                {NAV_SECTIONS.map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => scrollToSection(sec.id)}
                    className={`pb-3 px-4 sm:px-6 font-extrabold text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                      activeSection === sec.id
                        ? 'border-[#FF6B16] text-[#FF6B16]'
                        : 'border-transparent text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    {sec.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Continuous Sections Stream (All sections rendered with smooth scrollspy) */}
            <div className="space-y-10">
              {/* Section 1: Day-by-Day Itinerary */}
              <div id="section-itinerary" className="scroll-mt-32 bg-white rounded-3xl p-6 sm:p-10 border border-neutral-100 shadow-sm">
                <div className="mb-6 pb-4 border-b border-neutral-100 flex items-center justify-between">
                  <div>
                    <span className="text-[#FF6B16] font-bold text-xs uppercase tracking-widest block mb-1">
                      Day-by-Day Experience
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
                      Expedition Itinerary
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-600 text-xs font-bold">
                    {pkg.duration}
                  </span>
                </div>

                <ItineraryTimeline itinerary={pkg.itinerary} packageId={pkg.id || pkg._id} />
              </div>

              {/* Section 2: Available Dates */}
              <div id="section-dates" className="scroll-mt-32 bg-white rounded-3xl p-6 sm:p-8 border border-neutral-100 shadow-sm">
                <AvailableDatesSection
                  pkg={pkg}
                  selectedDate={selectedDate}
                  selectedCity={selectedCity}
                  onSelectCity={(city) => setSelectedCity(city)}
                  onSelectDate={(date, batch) => {
                    setSelectedDate(date);
                    if (window.innerWidth < 1024) {
                      const el = document.getElementById('booking-card-form');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                />
              </div>

              {/* Section 3: What's Included */}
              <div id="section-inclusions" className="scroll-mt-32 space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-neutral-100 shadow-sm">
                <h3 className="text-2xl font-black text-[#111111]">
                  Inclusions & Exclusions
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  <div>
                    <h4 className="text-sm font-extrabold text-emerald-600 uppercase tracking-wider mb-3">
                      Included with Package
                    </h4>
                    <ul className="space-y-3 text-sm text-neutral-700">
                      {includedItems.map((inc, i) => (
                        <li key={i} className="flex items-center gap-2.5">
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-extrabold text-rose-500 uppercase tracking-wider mb-3">
                      Not Included
                    </h4>
                    <ul className="space-y-3 text-sm text-neutral-700">
                      {excludedItems.map((exc, i) => (
                        <li key={i} className="flex items-center gap-2.5">
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          <span>{exc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Section 4: Important Guidelines */}
              <div id="section-policy" className="scroll-mt-32 space-y-4 bg-white p-6 sm:p-8 rounded-3xl border border-neutral-100 shadow-sm text-sm text-neutral-600 leading-relaxed">
                <h3 className="text-2xl font-black text-[#111111] mb-2">
                  Trip Guidelines & Safety
                </h3>
                <p>
                  1. All trekkers must undergo physical conditioning at least 3 weeks prior to high altitude treks.
                </p>
                <p>
                  2. Alcohol consumption, smoking, and littering on trekking trails are strictly prohibited to protect local ecosystems.
                </p>
                <p>
                  3. Weather conditions in mountain passes can change rapidly. The decisions of the trek marshal are final for safety reasons.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing & Smart Availability Booking Card */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200/80 shadow-xl space-y-5">
              {/* Price Row */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <div>
                  <span className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-400">
                    STARTING FROM / PERSON
                  </span>
                  <div className="flex items-baseline gap-2.5 mt-0.5">
                    <span className="text-3xl font-black text-[#111111]">
                      {formatCurrency(effectivePrice)}
                    </span>
                    {effectiveOriginalPrice && effectiveOriginalPrice > effectivePrice && (
                      <span className="text-sm text-neutral-400 font-semibold line-through">
                        {formatCurrency(effectiveOriginalPrice)}
                      </span>
                    )}
                  </div>
                </div>
                {discountPercent ? (
                  <span className="px-3 py-1 rounded-full bg-[#FFF4EE] text-[#FF6B16] border border-[#FED7AA] text-xs font-black">
                    Save {discountPercent}%
                  </span>
                ) : null}
              </div>

              {/* Departure Cities Selector (From) - Theme Based */}
              <div className="pt-1">
                <label className="block text-sm sm:text-base font-extrabold text-neutral-900 mb-2.5">
                  From
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {((pkg?.departureCities && pkg.departureCities.length > 0)
                    ? pkg.departureCities
                    : ['Ahmedabad', 'Mumbai', 'Pune']
                  ).map((city) => {
                    const isSelected = (selectedCity || '').toLowerCase() === city.toLowerCase();
                    return (
                      <button
                        key={city}
                        type="button"
                        onClick={() => setSelectedCity(city)}
                        style={
                          isSelected
                            ? { backgroundColor: themeColor, borderColor: themeColor }
                            : {}
                        }
                        className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'text-white shadow-md shadow-[#FF6B16]/25 border'
                            : 'bg-white border border-neutral-300 text-neutral-700 hover:border-[#FF6B16]/50 hover:text-neutral-900'
                        }`}
                      >
                        {city}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Booking Availability Form */}
              <form id="booking-card-form" onSubmit={handleCheckAvailability} className="space-y-4">

                {/* Price Breakdown with GST Box - Theme Based */}
                <div className="pt-2">
                  <div className="rounded-2xl border border-[#FED7AA] bg-[#FFF9F5] p-4 sm:p-5 space-y-2.5">
                    <div className="flex justify-between items-center text-xs sm:text-sm text-neutral-600 font-semibold">
                      <span>Base Amount:</span>
                      <span className="font-extrabold text-neutral-900 font-mono text-sm sm:text-base">
                        ₹{baseAmount.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs sm:text-sm text-neutral-600 font-semibold">
                      <span>GST ({gstRate}%):</span>
                      <span className="font-extrabold text-neutral-900 font-mono text-sm sm:text-base">
                        ₹{gstAmount.toFixed(2)}
                      </span>
                    </div>

                    <div className="pt-2.5 border-t border-dashed border-[#FED7AA] flex justify-between items-center">
                      <span className="text-sm sm:text-base font-black text-neutral-900">
                        Grand Total:
                      </span>
                      <span
                        className="text-lg sm:text-xl font-black font-mono"
                        style={{ color: themeColor }}
                      >
                        ₹{grandTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary CTA & Custom Dates Row */}
                {pkg?.isPrivateTrek ? (
                  <a
                    href={
                      getCustomWhatsAppUrl
                        ? getCustomWhatsAppUrl(
                            `Hi Weekend Escapes! I would like to book an exclusive Private Trek for *${pkg.name}* (${travelersCount} travelers, Date: ${selectedDate || 'Flexible'}). Please share custom batch pricing & confirmation!`
                          )
                        : whatsappUrl || 'https://wa.me/917983695277'
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-12 rounded-xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-[#25D366]/30 active:scale-[0.99]"
                  >
                    <MessageCircle className="w-5 h-5 fill-white" />
                    <span>Inquire on WhatsApp</span>
                  </a>
                ) : (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={availabilityResult && availabilityResult.available === false}
                        className={`flex-1 min-w-0 h-12 px-3 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                          availabilityResult && availabilityResult.available === false
                            ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed shadow-none'
                            : 'bg-[#FF6B16] hover:bg-[#e05809] active:scale-[0.99] text-white shadow-[#FF6B16]/25'
                        }`}
                      >
                        <span className="truncate">
                          {availabilityResult && availabilityResult.available === false
                            ? 'SELECT ANOTHER DATE'
                            : 'PROCEED TO BOOKING'}
                        </span>
                        <ArrowRight className="w-4 h-4 shrink-0" />
                      </button>

                      <a
                        href={packageWaUrl || BRAND.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Custom Dates? Inquire on WhatsApp"
                        aria-label="Inquire on WhatsApp"
                        className="h-12 w-12 shrink-0 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 hover:border-emerald-400 text-emerald-600 flex items-center justify-center transition-all cursor-pointer shadow-xs group"
                      >
                        <MessageCircle className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                      </a>
                    </div>

                    <p className="text-[11px] text-neutral-400 text-center font-medium">
                      Need custom dates or private batch?{' '}
                      <a
                        href={packageWaUrl || BRAND.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline"
                      >
                        Chat on WhatsApp
                      </a>
                    </p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </Container>

      {/* ── Travel Reels Showcase Section (5 Reels, Package-Specific with Fallback) ── */}
      <section className="w-full pt-10 pb-2 mt-10 border-t border-neutral-200/70 overflow-hidden bg-[#F7F7F5]">
        <TripReelsRow
          title={
            Array.isArray(pkg?.reels) && pkg.reels.length > 0
              ? `Moments From ${pkg.name}`
              : "What Our Travellers Say"
          }
          subtitle={
            Array.isArray(pkg?.reels) && pkg.reels.length > 0
              ? `Real moments captured by explorers on ${pkg.name}`
              : "Real moments and unfiltered trail memories captured by explorers"
          }
          maxReels={5}
          customReels={Array.isArray(pkg?.reels) && pkg.reels.length > 0 ? pkg.reels : null}
        />
      </section>

      {/* ── What to Pack Section (Interactive Category Switcher & Gear Checklist) ── */}
      <WhatToPack packageData={pkg} />

      {/* ── Frequently Asked Questions Section ── */}
      <PackageFAQ packageData={pkg} />

      {/* ── You May Also Like Section (Similar Category & Region Packages) ── */}
      <YouMayAlsoLike currentPackage={pkg} />
    </div>
  );
}

export default PackageDetails;
