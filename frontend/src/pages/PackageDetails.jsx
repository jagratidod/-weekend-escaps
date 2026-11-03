import React, { useState, useEffect } from 'react';
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

export function PackageDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPackageById, checkAvailability, getUpcomingSlots } = usePackages();
  const pkg = getPackageById(id);

  const { whatsappUrl, getCustomWhatsAppUrl } = useSettings();
  const packageWaUrl = getCustomWhatsAppUrl
    ? getCustomWhatsAppUrl(`Hi Weekend Escapes! I would like to inquire about the package: ${pkg.name || pkg.title}`)
    : whatsappUrl;

  const [activeTab, setActiveTab] = useState('itinerary');
  const [selectedDate, setSelectedDate] = useState('');
  const [travelersCount, setTravelersCount] = useState(2);

  // Dynamic Pricing Tiers State (Sharing & Distance based with 3 default sharing options)
  const displayTiers = (() => {
    if (Array.isArray(pkg?.pricingTiers) && pkg.pricingTiers.length > 0) {
      return pkg.pricingTiers;
    }
    // If distance package: provide route options
    if (pkg?.pricingType === 'distance') {
      const base = Number(pkg?.price) || 5999;
      const dest = pkg?.name?.split(' ')[0] || 'Manali';
      return [
        { name: `${dest} to ${dest}`, subtext: 'Ex-Basecamp (Direct Report)', price: base, originalPrice: Math.round(base * 1.4), isDefault: true },
        { name: 'Delhi to Delhi', subtext: 'Including AC Volvo Bus Transfers', price: base + 2000, originalPrice: Math.round((base + 2000) * 1.4), isDefault: false },
      ];
    }
    // Default 3 sharing tiers (Quad, Triple, Double) matching user specifications
    const base = Number(pkg?.price) && Number(pkg.price) >= 3000 ? Number(pkg.price) : 8999;
    const sub = 'Camp in Kedarnath';
    return [
      { name: 'Quad Sharing', subtext: sub, price: base, originalPrice: Math.round(base * 1.35), isDefault: true },
      { name: 'Triple Sharing', subtext: sub, price: base + 500, originalPrice: Math.round((base + 500) * 1.35), isDefault: false },
      { name: 'Double Sharing', subtext: sub, price: base + 1000, originalPrice: Math.round((base + 1000) * 1.35), isDefault: false },
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
      if (initial.name.toLowerCase().includes('double')) {
        setTravelersCount(2);
      } else if (initial.name.toLowerCase().includes('triple')) {
        setTravelersCount(3);
      } else if (initial.name.toLowerCase().includes('quad')) {
        setTravelersCount(4);
      }
    } else {
      setSelectedTier(null);
    }
  }, [pkg?.id, pkg?._id]);

  const effectivePrice = selectedTier ? Number(selectedTier.price) : (Number(pkg?.price) || 8999);
  const effectiveOriginalPrice = selectedTier?.originalPrice || pkg?.originalPrice || Math.round(effectivePrice * 1.4);

  const handleDropdownChange = (val) => {
    if (displayTiers.length > 0) {
      const found = displayTiers.find((t) => t.name === val);
      if (found) {
        setSelectedTier(found);
        if (found.name.toLowerCase().includes('double')) {
          setTravelersCount(2);
        } else if (found.name.toLowerCase().includes('triple')) {
          setTravelersCount(3);
        } else if (found.name.toLowerCase().includes('quad')) {
          setTravelersCount(4);
        }
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
    const query = new URLSearchParams();
    if (selectedDate) query.append('date', selectedDate);
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
    let count = travelersCount;
    if (tier.name.toLowerCase().includes('double')) count = 2;
    else if (tier.name.toLowerCase().includes('triple')) count = 3;
    else if (tier.name.toLowerCase().includes('quad')) count = 4;
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
          <Container className="pb-10 text-white">
            <div className="flex flex-wrap items-center gap-3 mb-3">
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

            <div className="mt-3 flex flex-wrap items-center gap-6 text-sm text-neutral-300 font-semibold">
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
          </Container>
        </div>
      </div>

      {/* Main Details & Booking Grid */}
      <Container className="mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Itinerary, Inclusions, Highlights */}
          <div className="lg:col-span-8 space-y-8">
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

            {/* ── DYNAMIC PACKAGE PRICING SECTION (SHARING & DISTANCE BASED) ── */}
            {tiers.length > 0 && (
              <div id="package-pricing-section" className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
                      Package Pricing
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {pkg.pricingType === 'sharing'
                        ? 'Select room & camp occupancy sharing basis'
                        : pkg.pricingType === 'distance'
                        ? 'Select boarding point & departure route'
                        : 'Choose your desired package option'}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-neutral-400">
                    {tiers.length} Options Available
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  {tiers.map((tier, idx) => {
                    const isSelected = selectedTier?.name === tier.name;

                    return (
                      <div
                        key={idx}
                        className={`rounded-2xl p-4 sm:p-5 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/20 shadow-xs ring-1 ring-emerald-400'
                            : 'border-neutral-200 hover:border-neutral-300 bg-white'
                        }`}
                      >
                        {/* Left: Option Title & Subtext */}
                        <div>
                          <div className="font-bold text-base sm:text-lg text-neutral-900">
                            {tier.name}
                          </div>
                          {tier.subtext && (
                            <div className="text-xs sm:text-sm text-neutral-400 font-medium mt-0.5">
                              {tier.subtext}
                            </div>
                          )}
                        </div>

                        {/* Right: Price & Book Now Button */}
                        <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8 border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-100">
                          <div className="text-left sm:text-right">
                            <div className="text-xl sm:text-2xl font-black text-[#0E9F6E]">
                              {formatCurrency(tier.price)}
                            </div>
                            <div className="text-[11px] text-neutral-400 font-semibold">
                              per person
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSelectTierAndBook(tier)}
                            className="px-6 py-2.5 rounded-full bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#0E9F6E] font-bold text-sm border border-[#A7F3D0] transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer flex items-center gap-1.5"
                          >
                            <span>Book Now</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
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
                    <span className="text-sm text-neutral-400 font-semibold line-through">
                      {formatCurrency(effectiveOriginalPrice)}
                    </span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#FFF4EE] text-[#FF6B16] border border-[#FED7AA] text-xs font-black">
                  Save 30%
                </span>
              </div>

              {/* Schedule Type Info Banner */}
              <div className="px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between text-xs">
                <span className="font-extrabold text-[#1A384C] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#FF6B16]" />
                  <span>
                    {scheduleType === 'weekends'
                      ? 'Every Weekend Departures'
                      : scheduleType === 'daily'
                      ? 'Daily Departures (All 365 Days)'
                      : scheduleType === 'batches'
                      ? 'Fixed Departure Batches'
                      : 'Flexible Custom Departures'}
                  </span>
                </span>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Open
                </span>
              </div>

              {/* Quick Select Upcoming Batches (if available) */}
              {upcomingSlots.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-black text-neutral-700 uppercase tracking-wider">
                      {scheduleType === 'weekends'
                        ? 'UPCOMING WEEKEND BATCHES'
                        : scheduleType === 'batches'
                        ? 'SCHEDULED BATCH DATES'
                        : 'UPCOMING DEPARTURE DATES'}
                    </span>
                    <span className="text-[10px] font-bold text-neutral-400">Quick Select</span>
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar">
                    {upcomingSlots.slice(0, 6).map((slot) => {
                      const isSelected = selectedDate === slot.date;
                      const isSoldOut = slot.status === 'sold_out';

                      return (
                        <button
                          key={slot.date}
                          type="button"
                          disabled={isSoldOut}
                          onClick={() => setSelectedDate(slot.date)}
                          className={`px-3 py-2 rounded-xl border text-left shrink-0 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#FF6B16] bg-orange-50/80 ring-2 ring-[#FF6B16]/20'
                              : isSoldOut
                              ? 'border-neutral-200 bg-neutral-100 opacity-50 cursor-not-allowed'
                              : 'border-neutral-200 bg-white hover:border-neutral-300'
                          }`}
                        >
                          <div className="text-xs font-black text-neutral-900">{slot.label}</div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span
                              className={`text-[10px] font-extrabold ${
                                isSoldOut
                                  ? 'text-rose-600'
                                  : slot.status === 'filling_fast'
                                  ? 'text-amber-600'
                                  : 'text-emerald-600'
                              }`}
                            >
                              {isSoldOut ? 'Sold Out' : `${slot.seatsLeft} seats left`}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Booking Availability Form */}
              <form onSubmit={handleCheckAvailability} className="space-y-4">
                {/* Date Picker (Every Day & Random Day support) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-black text-neutral-700 uppercase tracking-wider">
                      SELECT ANY DATE (CALENDAR)
                    </label>
                    <span className="text-[10px] text-neutral-400 font-bold">
                      {scheduleType === 'weekends' ? 'Weekend / Custom' : 'Every Day'}
                    </span>
                  </div>
                  <input
                    type="date"
                    required
                    min={tomorrowStr}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold focus:outline-none focus:border-[#FF6B16] focus:ring-2 focus:ring-[#FF6B16]/10 transition-all cursor-pointer bg-white"
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">
                    {scheduleType === 'weekends'
                      ? 'Trek departs every Friday/Saturday. You can also pick any date for private batches.'
                      : 'Choose any date 365 days a year for instant booking.'}
                  </p>
                </div>

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

                {/* Price Breakdown */}
                <div className="pt-2 border-t border-neutral-100">
                  <div className="flex justify-between items-center text-sm font-bold text-neutral-800 pb-1">
                    <span className="text-neutral-900 font-bold">Total Estimated Cost</span>
                    <span className="text-[#FF6B16] text-xl font-black">
                      {formatCurrency(effectivePrice * travelersCount)}
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-400 block text-right">
                    {selectedTier
                      ? `${selectedTier.name} • ${formatCurrency(effectivePrice)} × ${travelersCount} traveler(s)`
                      : 'Includes all permits, stays & guided trek'}
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
    </div>
  );
}

export default PackageDetails;
