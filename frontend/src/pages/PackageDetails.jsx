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

  const { whatsappUrl, getCustomWhatsAppUrl } = useSettings();
  const packageWaUrl = getCustomWhatsAppUrl
    ? getCustomWhatsAppUrl(`Hi Weekend Escapes! I would like to inquire about the package: ${pkg?.name || pkg?.title || 'Tour Package'}`)
    : whatsappUrl;

  const expertWaUrl = getCustomWhatsAppUrl
    ? getCustomWhatsAppUrl(
        `Hi Weekend Escapes! I would like to connect with a trip expert for *${pkg?.name || pkg?.title || 'the tour package'}* (${pkg?.duration || ''}, ${pkg?.location || ''}). Please guide me with dates, itinerary & booking!`
      )
    : packageWaUrl || whatsappUrl || 'https://wa.me/919876543210';

  const [activeTab, setActiveTab] = useState('itinerary');
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

  const effectivePrice = selectedTier ? Number(selectedTier.price) : (Number(pkg?.price) || 0);
  const effectiveOriginalPrice = selectedTier?.originalPrice || (pkg?.originalPrice ? Number(pkg.originalPrice) : null);

  const discountPercent =
    effectiveOriginalPrice && effectiveOriginalPrice > effectivePrice
      ? Math.round(((effectiveOriginalPrice - effectivePrice) / effectiveOriginalPrice) * 100)
      : null;

  const gstRate = Number(pkg?.gstRate) >= 0 ? Number(pkg?.gstRate) : 5;
  const baseAmount = effectivePrice * travelersCount;
  const gstAmount = Number(((baseAmount * gstRate) / 100).toFixed(2));
  const grandTotal = Number((baseAmount + gstAmount).toFixed(2));

  const handleDropdownChange = (val) => {
    if (displayTiers.length > 0) {
      const found = displayTiers.find((t) => t.name === val);
      if (found) {
        setSelectedTier(found);
      }
    } else {
      setTravelersCount(Number(val));
    }
  };

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

  const handleCheckAvailability = (e, tierToUse = selectedTier, countOverride = null) => {
    if (e?.preventDefault) e.preventDefault();
    if (!selectedDate) {
      const el = document.getElementById('available-dates-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    const query = new URLSearchParams();
    if (selectedDate) query.append('date', selectedDate);
    if (selectedCity) query.append('city', selectedCity);
    const travelersToPass = countOverride !== null ? countOverride : travelersCount;
    query.append('travelers', String(travelersToPass));
    if (tierToUse?.name) {
      query.append('tier', tierToUse.name);
      query.append('tierPrice', String(tierToUse.price));
      if (tierToUse.subtext) query.append('tierSubtext', tierToUse.subtext);
    }
    query.append('step', '1');
    navigate(`/book/${pkg.id || pkg._id}?${query.toString()}`);
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
            {/* Available Departure Dates (City & Month Grid matching screenshot) */}
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

            {/* Navigation Tabs */}
            <div className="flex border-b border-neutral-200">
              <button
                onClick={() => setActiveTab('itinerary')}
                className={`pb-4 px-6 font-extrabold text-sm border-b-2 transition-all cursor-pointer ${
                  activeTab === 'itinerary'
                    ? 'border-[#FF6B16] text-[#FF6B16]'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Day-by-Day Itinerary
              </button>
              <button
                onClick={() => setActiveTab('inclusions')}
                className={`pb-4 px-6 font-extrabold text-sm border-b-2 transition-all cursor-pointer ${
                  activeTab === 'inclusions'
                    ? 'border-[#FF6B16] text-[#FF6B16]'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                What's Included
              </button>
              <button
                onClick={() => setActiveTab('policy')}
                className={`pb-4 px-6 font-extrabold text-sm border-b-2 transition-all cursor-pointer ${
                  activeTab === 'policy'
                    ? 'border-[#FF6B16] text-[#FF6B16]'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Important Guidelines
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('package-faqs-section');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="pb-4 px-6 font-extrabold text-sm border-b-2 border-transparent text-neutral-500 hover:text-[#FF6B16] transition-all cursor-pointer"
              >
                FAQs
              </button>
            </div>

            {/* Tab: Itinerary */}
            {activeTab === 'itinerary' && (
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-neutral-100 shadow-sm">
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
            )}

            {/* Tab: Inclusions */}
            {activeTab === 'inclusions' && (
              <div className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-neutral-100 shadow-sm">
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
            )}

            {/* Tab: Policy */}
            {activeTab === 'policy' && (
              <div className="space-y-4 bg-white p-6 sm:p-8 rounded-3xl border border-neutral-100 shadow-sm text-sm text-neutral-600 leading-relaxed">
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
            )}
          </div>

          {/* Right Column: Pricing & Smart Availability Booking Card */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-xl space-y-5">
              {/* Price Row */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <div>
                  <span className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-400">
                    {selectedTier ? selectedTier.name : 'STARTING FROM'}
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

              {/* Selected Departure Date Indicator */}
              <div className="pb-1">
                {selectedDate ? (
                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-300 rounded-2xl flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <span className="block text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                          Departure Date
                        </span>
                        <span className="block text-xs sm:text-sm font-black text-neutral-900 truncate">
                          {selectedDateLabel || selectedDate}
                          {selectedCity ? ` (${selectedCity})` : ''}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById('available-dates-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="text-xs font-bold text-[#FF6B16] hover:underline cursor-pointer shrink-0 ml-2"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('available-dates-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full p-3.5 bg-orange-50/60 border border-dashed border-[#FF6B16]/50 rounded-2xl flex items-center justify-between text-left hover:bg-orange-50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-[#FF6B16] group-hover:scale-105 transition-transform shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block text-xs font-black text-neutral-800">
                          Select Departure Date
                        </span>
                        <span className="block text-[10px] text-neutral-500 font-medium">
                          Choose from Available Dates on left
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#FF6B16]">
                      Choose &rarr;
                    </span>
                  </button>
                )}
              </div>

              {/* Booking Availability Form */}
              <form id="booking-card-form" onSubmit={handleCheckAvailability} className="space-y-4">
                {/* Unified Sharing / Route / Travelers Dropdown */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-black text-neutral-700 uppercase tracking-wider">
                      {tiers.length > 0
                        ? pkg?.pricingType === 'distance'
                          ? 'SELECT ROUTE & BOARDING'
                          : 'ROOM & SHARING OCCUPANCY'
                        : 'NUMBER OF TRAVELERS'}
                    </label>
                    {selectedTier?.subtext && (
                      <span className="text-[10px] text-emerald-600 font-bold truncate max-w-[170px]">
                        {selectedTier.subtext}
                      </span>
                    )}
                  </div>

                  <select
                    value={selectedTier?.name || travelersCount}
                    onChange={(e) => handleDropdownChange(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold focus:outline-none focus:border-[#FF6B16] focus:ring-2 focus:ring-[#FF6B16]/10 transition-all cursor-pointer bg-white"
                  >
                    {tiers.length > 0 ? (
                      tiers.map((t) => (
                        <option key={t.name} value={t.name}>
                          {t.name} — {formatCurrency(t.price)} per person {t.subtext ? `(${t.subtext})` : ''}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value={1}>1 Traveler (Solo)</option>
                        <option value={2}>2 Travelers (Pair/Couple)</option>
                        <option value={3}>3 Travelers (Small Group)</option>
                        <option value={4}>4 Travelers (Group)</option>
                        <option value={5}>5 Travelers (Group)</option>
                        <option value={6}>6+ Travelers (Custom Batch)</option>
                      </>
                    )}
                  </select>

                  {/* Travelers Count Adjuster Stepper */}
                  {tiers.length > 0 && (
                    <div className="mt-2 flex items-center justify-between px-3.5 py-1.5 bg-neutral-50 rounded-xl border border-neutral-200/80 text-xs font-semibold text-neutral-600">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Travelers Count:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setTravelersCount(Math.max(1, travelersCount - 1))}
                          className="w-6 h-6 rounded-md bg-white border border-neutral-200 text-neutral-700 font-bold hover:bg-neutral-100 flex items-center justify-center text-xs active:scale-95 cursor-pointer shadow-2xs"
                        >
                          -
                        </button>
                        <span className="font-bold text-neutral-900 min-w-[20px] text-center">{travelersCount}</span>
                        <button
                          type="button"
                          onClick={() => setTravelersCount(travelersCount + 1)}
                          className="w-6 h-6 rounded-md bg-white border border-neutral-200 text-neutral-700 font-bold hover:bg-neutral-100 flex items-center justify-center text-xs active:scale-95 cursor-pointer shadow-2xs"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Live Real-time Availability Feedback Card */}
                {selectedDate && (
                  <div className="transition-all animate-fade-in">
                    {checkingAvailability ? (
                      <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-center justify-center gap-2 text-xs font-bold text-neutral-500">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF6B16]" />
                        <span>Verifying seat availability...</span>
                      </div>
                    ) : availabilityResult ? (
                      availabilityResult.available ? (
                        <div
                          className={`p-3.5 rounded-2xl border ${
                            availabilityResult.status === 'filling_fast'
                              ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                              : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {availabilityResult.status === 'filling_fast' ? (
                              <Zap className="w-4 h-4 text-amber-600 shrink-0" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                            <span className="text-xs font-black">
                              {availabilityResult.status === 'filling_fast'
                                ? 'Filling Fast • High Demand Date'
                                : 'Available • Guaranteed Departure'}
                            </span>
                          </div>
                          <p className="text-[11px] font-medium mt-1 pl-6 opacity-90">
                            {availabilityResult.seatsLeft !== undefined
                              ? `${availabilityResult.seatsLeft} seat(s) available for ${travelersCount} traveler(s).`
                              : availabilityResult.message || 'Slot confirmed for your dates.'}
                          </p>
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span className="text-xs font-black">Date Unavailable</span>
                          </div>
                          <p className="text-[11px] font-medium mt-1 pl-6 text-rose-700">
                            {availabilityResult.reason ||
                              'Selected date is sold out or unavailable. Please pick another date or message us on WhatsApp.'}
                          </p>
                        </div>
                      )
                    ) : null}
                  </div>
                )}

                {/* Price Breakdown with GST Box matching screenshot */}
                <div className="pt-2">
                  <div className="rounded-2xl border border-teal-400 bg-teal-50/20 p-4 sm:p-5 space-y-2.5">
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

                    <div className="pt-2.5 border-t border-dashed border-teal-300 flex justify-between items-center">
                      <span className="text-sm sm:text-base font-black text-neutral-900">
                        Grand Total:
                      </span>
                      <span className="text-lg sm:text-xl font-black text-[#0D9488] font-mono">
                        ₹{grandTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-neutral-400 block text-right mt-1.5 font-medium">
                    {selectedTier?.name ? `${selectedTier.name} • ` : ''}
                    ₹{effectivePrice} × {travelersCount} traveler(s) + {gstRate}% GST
                  </span>
                </div>

                {/* Primary CTA */}
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
                    className="w-full py-4 rounded-full font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-[#25D366]/30 active:scale-[0.99]"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Inquire on WhatsApp</span>
                  </a>
                ) : (
                  <button
                    type="submit"
                    disabled={availabilityResult && availabilityResult.available === false}
                    className={`w-full py-4 rounded-full font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                      availabilityResult && availabilityResult.available === false
                        ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed shadow-none'
                        : 'bg-[#FF6B16] hover:bg-[#e05809] active:scale-[0.99] text-white shadow-[#FF6B16]/30'
                    }`}
                  >
                    <span>
                      {availabilityResult && availabilityResult.available === false
                        ? 'SELECT ANOTHER DATE'
                        : 'PROCEED TO BOOKING'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </form>

              {/* WhatsApp Support Button */}
              <div className="pt-3 border-t border-neutral-100">
                <a
                  href={packageWaUrl || BRAND.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-full border border-neutral-300 hover:border-emerald-500 hover:bg-emerald-50/50 text-neutral-800 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Custom Dates? Inquire on WhatsApp</span>
                </a>
              </div>
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
