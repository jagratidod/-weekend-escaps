import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mountain,
  Users,
  HeartPulse,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Check,
  Lock,
  MessageCircle,
  ChevronDown,
  Mail,
  Loader2,
} from 'lucide-react';
import { usePackages } from '../context/PackageContext';
import { useSettings } from '../context/SettingsContext';
import { DEFAULT_THEME_COLOR, hexToRgb } from '../utils/themeUtils';

const DEFAULT_POPULAR_TREKS = [
  'Kedarnath Yatra',
  'Hampta Pass Trek',
  'Kasol - Kheerganga Expedition',
  'Spiti Valley Winter Expedition',
  'Chopta - Chandrashila Trek',
  'Brahmatal Winter Trek',
  'Valley of Flowers',
  'Manali Leh Ladakh Road Trip',
];

export default function OfflineRegistrationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { packages = [] } = usePackages();
  const { settings = {}, API_BASE_URL: ctxApiBase, logoUrl } = useSettings();

  // Dynamic branding & contact information
  const companyName = settings.siteName || import.meta.env.VITE_APP_NAME || import.meta.env.VITE_COMPANY_NAME || 'Weekend Escapes';
  const companyPhone = settings.whatsappNumber || settings.phone || import.meta.env.VITE_COMPANY_PHONE || '+91 6375372499';
  const companyWebsite = import.meta.env.VITE_COMPANY_WEBSITE || 'weekendescapes.com';
  const companyTermsUrl = '/terms';
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ctxApiBase || 'http://localhost:5000/api';

  // Dynamic Theme Colors from SettingsContext
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

  const themeLightBg = useMemo(() => {
    const rgb = hexToRgb(themeColor);
    if (!rgb) return 'rgba(255, 107, 22, 0.08)';
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)`;
  }, [themeColor]);

  const themeBorder = useMemo(() => {
    const rgb = hexToRgb(themeColor);
    if (!rgb) return 'rgba(255, 107, 22, 0.25)';
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`;
  }, [themeColor]);

  const cleanPhoneDigits = useMemo(() => companyPhone.replace(/\D/g, ''), [companyPhone]);

  // Combined trek options from backend packages + defaults
  const trekOptions = useMemo(() => {
    const list = new Set();
    list.add('Kedarnath Yatra');

    if (Array.isArray(packages) && packages.length > 0) {
      packages.forEach((p) => {
        const title = p.name || p.title;
        if (title) list.add(title);
      });
    }

    DEFAULT_POPULAR_TREKS.forEach((t) => list.add(t));
    return Array.from(list);
  }, [packages]);

  // Multi-step state: 1 = Trip, 2 = Travelers, 3 = Safety, 4 = Payment, 5 = Confirm, 6 = Success
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [formError, setFormError] = useState('');

  // Step 1: Trip Info
  const [tripName, setTripName] = useState(() => searchParams.get('trip') || 'Kedarnath Yatra');
  const [customTrip, setCustomTrip] = useState('');
  const [departureDate, setDepartureDate] = useState(() => searchParams.get('date') || '2026-11-21');
  const [bookingType, setBookingType] = useState(() => searchParams.get('type') || 'group'); // 'solo' or 'group'
  const [travelersCount, setTravelersCount] = useState(() => {
    const p = parseInt(searchParams.get('travelers') || '2', 10);
    return isNaN(p) || p < 1 ? 2 : p;
  });

  // Step 2: Traveler details
  const [primaryTraveler, setPrimaryTraveler] = useState({
    name: searchParams.get('name') || '',
    email: searchParams.get('email') || '',
    phone: searchParams.get('phone') || '',
    gender: 'Male',
    age: '',
  });

  const [additionalTravelers, setAdditionalTravelers] = useState([]);

  // Adjust additional travelers array when travelersCount changes
  useEffect(() => {
    const extraCount = Math.max(0, travelersCount - 1);
    setAdditionalTravelers((prev) => {
      const updated = [...prev];
      if (updated.length < extraCount) {
        for (let i = updated.length; i < extraCount; i++) {
          updated.push({
            id: i + 2,
            name: '',
            gender: 'Male',
            age: '',
          });
        }
      } else if (updated.length > extraCount) {
        return updated.slice(0, extraCount);
      }
      return updated;
    });
  }, [travelersCount]);

  // Step 3: Safety / Emergency Contact
  const [emergencyContact, setEmergencyContact] = useState({
    name: '',
    phone: '',
    relationship: 'Parent',
    healthInfo: '',
  });

  // Step 4: Payment Details
  const [paymentInfo, setPaymentInfo] = useState({
    utrNumber: '',
    amountPaid: '',
    paymentMethod: 'UPI',
    remarks: '',
  });

  // Step 5: Terms Checkbox
  const [agreedTerms, setAgreedTerms] = useState(true);

  // Pre-fill URL param updates if present
  useEffect(() => {
    const urlTrip = searchParams.get('trip');
    if (urlTrip) setTripName(urlTrip);

    const urlDate = searchParams.get('date');
    if (urlDate) setDepartureDate(urlDate);

    const urlTravelers = searchParams.get('travelers');
    if (urlTravelers) {
      const parsed = parseInt(urlTravelers, 10);
      if (!isNaN(parsed) && parsed >= 1) {
        setTravelersCount(parsed);
        if (parsed === 1) setBookingType('solo');
      }
    }
  }, [searchParams]);

  // Clear errors on step change
  useEffect(() => {
    setFormError('');
  }, [step]);

  // Validation handlers
  const handleNextStep1 = () => {
    const selectedTrip = tripName === '__custom__' ? customTrip.trim() : tripName;
    if (!selectedTrip) {
      setFormError('Please select or enter your booked trip name.');
      return;
    }
    if (!departureDate) {
      setFormError('Please select your departure date.');
      return;
    }
    if (bookingType === 'group' && travelersCount < 2) {
      setFormError('Group booking requires at least 2 travelers. Or switch to Solo.');
      return;
    }
    setFormError('');
    setStep(2);
  };

  const handleNextStep2 = () => {
    if (!primaryTraveler.name.trim()) {
      setFormError('Please enter Primary Contact full name as per Govt ID.');
      return;
    }
    if (!primaryTraveler.email.trim() || !primaryTraveler.email.includes('@')) {
      setFormError('Please provide a valid email ID to receive booking confirmation.');
      return;
    }
    if (!primaryTraveler.phone.trim() || primaryTraveler.phone.replace(/\D/g, '').length < 10) {
      setFormError('Please enter a valid 10-digit phone/WhatsApp number.');
      return;
    }

    for (let i = 0; i < additionalTravelers.length; i++) {
      const t = additionalTravelers[i];
      if (!t.name.trim()) {
        setFormError(`Please enter full name for Traveler ${i + 2}.`);
        return;
      }
    }

    setFormError('');
    setStep(3);
  };

  const handleNextStep3 = () => {
    if (!emergencyContact.name.trim()) {
      setFormError('Please enter emergency contact person name.');
      return;
    }
    if (!emergencyContact.phone.trim() || emergencyContact.phone.replace(/\D/g, '').length < 10) {
      setFormError('Please enter a valid 10-digit emergency contact phone number.');
      return;
    }
    setFormError('');
    setStep(4);
  };

  const handleNextStep4 = () => {
    if (!paymentInfo.utrNumber.trim()) {
      setFormError('Please provide your Payment UTR or Bank Transaction Reference Number.');
      return;
    }
    if (!paymentInfo.amountPaid || Number(paymentInfo.amountPaid) <= 0) {
      setFormError('Please specify the amount paid.');
      return;
    }
    setFormError('');
    setStep(5);
  };

  // Submit Final Registration
  const handleSubmitRegistration = async () => {
    if (!agreedTerms) {
      setFormError('You must agree to the Terms & Conditions before locking your seat.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    const finalTripName = tripName === '__custom__' ? customTrip.trim() : tripName;

    const compiledTravelers = [
      {
        id: 1,
        name: primaryTraveler.name.trim(),
        email: primaryTraveler.email.trim(),
        phone: primaryTraveler.phone.trim(),
        gender: primaryTraveler.gender,
        age: primaryTraveler.age ? Number(primaryTraveler.age) : null,
      },
      ...additionalTravelers.map((t, idx) => ({
        id: idx + 2,
        name: t.name.trim(),
        gender: t.gender,
        age: t.age ? Number(t.age) : null,
      })),
    ];

    const payload = {
      tripName: finalTripName,
      packageId: 'offline-' + finalTripName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      travelDate: departureDate,
      friendlyTravelDate: departureDate,
      bookingType,
      totalPersons: travelersCount,
      primaryContact: {
        name: primaryTraveler.name.trim(),
        email: primaryTraveler.email.trim(),
        phone: primaryTraveler.phone.trim(),
        gender: primaryTraveler.gender,
        age: primaryTraveler.age ? Number(primaryTraveler.age) : null,
      },
      travelers: compiledTravelers,
      emergencyContact: {
        name: emergencyContact.name.trim(),
        phone: emergencyContact.phone.trim(),
        relationship: emergencyContact.relationship,
        healthInfo: emergencyContact.healthInfo.trim(),
      },
      payment: {
        utrNumber: paymentInfo.utrNumber.trim(),
        amountPaid: Number(paymentInfo.amountPaid),
        paymentMethod: paymentInfo.paymentMethod,
        remarks: paymentInfo.remarks.trim(),
      },
    };

    try {
      const response = await fetch(`${apiBaseUrl}/bookings/offline-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to complete registration.');
      }

      setSubmissionResult(data);
      setStep(6);
    } catch (err) {
      console.error('[Registration Error]:', err);
      setFormError(err.message || 'An error occurred while submitting. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyRef = (ref) => {
    if (!ref) return;
    navigator.clipboard.writeText(ref);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2500);
  };

  const finalTripLabel = tripName === '__custom__' ? customTrip : tripName;
  const whatsappBookingMsg = encodeURIComponent(
    `Hi ${companyName}! I have submitted my offline registration for ${finalTripLabel}. Please confirm my seat.`
  );
  const directWhatsAppLink = `https://wa.me/${cleanPhoneDigits}?text=${whatsappBookingMsg}`;

  // Steps matching reference screenshot
  const stepItems = [
    { num: 1, title: 'Select Your Destination', tab: 'General' },
    { num: 2, title: 'Enter Travelers Info', tab: 'Travelers' },
    { num: 3, title: 'Safety & Emergency Contact', tab: 'Emergency' },
    { num: 4, title: 'Payment & UTR Verification', tab: 'Payment' },
    { num: 5, title: 'Review & Lock Seat', tab: 'Confirm' },
  ];

  const percentLeft = Math.max(0, (5 - step) * 20);

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col items-center justify-center py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:px-10 relative overflow-hidden font-sans">
      {/* Soft Clean Ambient Background Circles Only */}
      <div
        className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full opacity-15 pointer-events-none transition-all duration-500"
        style={{ backgroundColor: themeColor }}
      />
      <div
        className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full opacity-10 pointer-events-none transition-all duration-500"
        style={{ backgroundColor: themeColor }}
      />
      <div
        className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full opacity-5 blur-2xl pointer-events-none transition-all duration-500"
        style={{ backgroundColor: themeColor }}
      />

      {/* Top Company Logo (Only logo visible on /registration) */}
      <div className="mb-6 sm:mb-8 flex items-center justify-center relative z-20">
        <Link to="/" className="inline-block transition-transform hover:scale-105" title={companyName}>
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={companyName}
              className="h-10 sm:h-12 w-auto object-contain drop-shadow-xs"
            />
          ) : (
            <span className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
              {companyName}
            </span>
          )}
        </Link>
      </div>

      {/* ── Main Modal Card (Split Layout based on Reference Image) ── */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col md:flex-row relative z-10 border border-neutral-100 min-h-[600px]">
        {/* ========================================================================= */}
        {/* LEFT SIDEBAR (Theme Color Gradient with overlapping Step Badges) */}
        {/* ========================================================================= */}
        <div
          className="w-full md:w-80 lg:w-[340px] text-white p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shrink-0 shadow-lg transition-all duration-500"
          style={{
            background: `linear-gradient(170deg, ${themeColor} 0%, ${themeDarker} 60%, ${themeDarkest} 100%)`,
          }}
        >
          {/* Top Brand Name */}
          <div className="mb-6 relative z-10">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/90 bg-white/20 px-3 py-1 rounded-full border border-white/20">
              Registration Wizard
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-2.5 tracking-tight">
              {companyName}
            </h2>
            <p className="text-xs text-white/80 mt-0.5">
              Secure traveler intake &amp; seat allocation
            </p>
          </div>

          {/* Vertical Step Items List (Matching Reference Screenshot) */}
          <div className="space-y-6 sm:space-y-8 my-auto py-2 relative z-10">
            {stepItems.map((item) => {
              const isActive = step === item.num;
              const isPast = step > item.num;

              return (
                <div
                  key={item.num}
                  className="flex items-center justify-between gap-4 cursor-pointer select-none transition-all"
                  onClick={() => {
                    if (isPast && step <= 5) setStep(item.num);
                  }}
                >
                  {/* Step Title Label */}
                  <span
                    className={`text-xs sm:text-sm tracking-wide transition-all ${
                      isActive
                        ? 'text-white font-black drop-shadow-sm'
                        : isPast
                        ? 'text-white/90 font-medium'
                        : 'text-white/50 font-normal'
                    }`}
                  >
                    {item.title}
                  </span>

                  {/* Overlapping Number Circle Badge (Matching Screenshot) */}
                  <div
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-black text-sm shrink-0 transition-all duration-300 shadow-md ${
                      isActive
                        ? 'bg-white ring-[3.5px] ring-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)] scale-105'
                        : isPast
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white/95 text-neutral-400 border border-white/20'
                    }`}
                    style={isActive ? { color: themeColor } : {}}
                  >
                    {isPast ? <Check className="w-5 h-5 stroke-[3]" /> : item.num}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Sidebar Note */}
          <div className="pt-6 border-t border-white/15 text-[11px] text-white/70 relative z-10 flex items-center justify-between">
            <span>Direct Offline Flow</span>
            <span className="font-mono text-white/90 font-bold">5 Steps</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT CONTENT AREA (White Form Panel) */}
        {/* ========================================================================= */}
        <div className="flex-1 bg-white p-6 sm:p-10 lg:p-12 flex flex-col justify-between relative">
          {/* Top Horizontal Sub-Tabs Header (Matching Reference Screenshot) */}
          {step <= 5 && (
            <div className="border-b border-neutral-150 pb-4 mb-6">
              <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-4 sm:gap-7">
                  {stepItems.map((item) => {
                    const isTabActive = step === item.num;
                    return (
                      <div
                        key={item.num}
                        onClick={() => {
                          if (step > item.num) setStep(item.num);
                        }}
                        className={`text-xs font-bold pb-2 transition-all cursor-pointer relative whitespace-nowrap ${
                          isTabActive
                            ? 'font-black'
                            : step > item.num
                            ? 'text-neutral-600 hover:text-neutral-900'
                            : 'text-neutral-300 cursor-not-allowed'
                        }`}
                        style={isTabActive ? { color: themeColor } : {}}
                      >
                        {item.tab}
                        {isTabActive && (
                          <motion.div
                            layoutId="activeTabUnderline"
                            className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full"
                            style={{ backgroundColor: themeColor }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="text-[11px] text-neutral-400 font-medium whitespace-nowrap pl-4">
                  Approx Time: 2 Mins
                </div>
              </div>
            </div>
          )}

          {/* Error Message Toast */}
          {formError && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-red-700 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Form Step Contents */}
          <div className="my-auto py-2">
            <AnimatePresence mode="wait">
              {/* ─────────────────────────────────────────────────────────────
                  STEP 1: YOUR TRIP
                  ───────────────────────────────────────────────────────────── */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5 max-w-xl"
                >
                  {/* Trip Selector */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                      Trip / Trek Name <span style={{ color: themeColor }}>*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={tripName}
                        onChange={(e) => setTripName(e.target.value)}
                        className="w-full bg-[#FAFBFD] border border-neutral-300 rounded-lg px-4 py-2.5 text-neutral-900 text-sm font-semibold outline-none transition-all appearance-none cursor-pointer focus:bg-white focus:border-neutral-400"
                        style={{
                          borderColor: 'rgb(209, 213, 219)',
                        }}
                      >
                        {trekOptions.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                        <option value="__custom__" style={{ color: themeColor }} className="font-bold">
                          + Custom / Other Trip
                        </option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {tripName === '__custom__' && (
                      <input
                        type="text"
                        placeholder="Enter your custom trip name"
                        value={customTrip}
                        onChange={(e) => setCustomTrip(e.target.value)}
                        className="w-full bg-white border rounded-lg px-4 py-2 text-sm mt-2 outline-none"
                        style={{ borderColor: themeBorder }}
                      />
                    )}
                  </div>

                  {/* Departure Date */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                      Departure Date <span style={{ color: themeColor }}>*</span>
                    </label>
                    <input
                      type="date"
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      className="w-full bg-[#FAFBFD] border border-neutral-300 rounded-lg px-4 py-2.5 text-neutral-900 text-sm font-medium outline-none transition-all focus:bg-white"
                    />
                  </div>

                  {/* Booking Type */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                      Booking Type <span style={{ color: themeColor }}>*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setBookingType('solo');
                          setTravelersCount(1);
                        }}
                        className={`py-2.5 px-4 rounded-lg font-bold text-xs uppercase tracking-wider transition-all border cursor-pointer ${
                          bookingType === 'solo'
                            ? 'text-white shadow-sm'
                            : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                        }`}
                        style={
                          bookingType === 'solo'
                            ? { backgroundColor: themeColor, borderColor: themeColor }
                            : {}
                        }
                      >
                        SOLO
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBookingType('group');
                          if (travelersCount < 2) setTravelersCount(2);
                        }}
                        className={`py-2.5 px-4 rounded-lg font-bold text-xs uppercase tracking-wider transition-all border cursor-pointer ${
                          bookingType === 'group'
                            ? 'text-white shadow-sm'
                            : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                        }`}
                        style={
                          bookingType === 'group'
                            ? { backgroundColor: themeColor, borderColor: themeColor }
                            : {}
                        }
                      >
                        GROUP
                      </button>
                    </div>
                  </div>

                  {/* Number of Travelers */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                        Number of Travelers <span style={{ color: themeColor }}>*</span>
                      </label>
                      <span className="text-[11px] text-neutral-400 font-medium">
                        {bookingType === 'group' ? 'Min 2, Max 50' : 'Solo traveler'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={bookingType === 'solo' || travelersCount <= 2}
                        onClick={() => setTravelersCount((prev) => Math.max(2, prev - 1))}
                        className="w-10 h-10 rounded-lg bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-700 flex items-center justify-center font-bold text-base disabled:opacity-40 cursor-pointer"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={bookingType === 'solo' ? 1 : 2}
                        max={50}
                        disabled={bookingType === 'solo'}
                        value={travelersCount}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val)) {
                            const minVal = bookingType === 'solo' ? 1 : 2;
                            setTravelersCount(Math.min(50, Math.max(minVal, val)));
                          }
                        }}
                        className="flex-1 bg-white border border-neutral-300 rounded-lg py-2 px-3 text-center text-lg font-extrabold text-neutral-900 outline-none"
                      />
                      <button
                        type="button"
                        disabled={bookingType === 'solo' || travelersCount >= 50}
                        onClick={() => setTravelersCount((prev) => Math.min(50, prev + 1))}
                        className="w-10 h-10 rounded-lg bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-700 flex items-center justify-center font-bold text-base disabled:opacity-40 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  STEP 2: TRAVELERS
                  ───────────────────────────────────────────────────────────── */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4 max-w-xl max-h-[380px] overflow-y-auto pr-1"
                >
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                      Full Name <span style={{ color: themeColor }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter full name as per Govt ID"
                      value={primaryTraveler.name}
                      onChange={(e) =>
                        setPrimaryTraveler({ ...primaryTraveler, name: e.target.value })
                      }
                      className="w-full bg-white border border-neutral-300 rounded-lg px-4 py-2.5 text-neutral-900 text-sm font-semibold outline-none"
                    />
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                        Email ID <span style={{ color: themeColor }}>*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="Enter email address"
                        value={primaryTraveler.email}
                        onChange={(e) =>
                          setPrimaryTraveler({ ...primaryTraveler, email: e.target.value })
                        }
                        className="w-full bg-white border border-neutral-300 rounded-lg px-4 py-2.5 text-neutral-900 text-sm font-medium outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                        WhatsApp / Phone <span style={{ color: themeColor }}>*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="Enter 10-digit mobile number"
                        value={primaryTraveler.phone}
                        onChange={(e) =>
                          setPrimaryTraveler({ ...primaryTraveler, phone: e.target.value })
                        }
                        className="w-full bg-white border border-neutral-300 rounded-lg px-4 py-2.5 text-neutral-900 text-sm font-medium outline-none"
                      />
                    </div>
                  </div>

                  {/* Gender & Age */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                        Gender
                      </label>
                      <div className="relative">
                        <select
                          value={primaryTraveler.gender}
                          onChange={(e) =>
                            setPrimaryTraveler({ ...primaryTraveler, gender: e.target.value })
                          }
                          className="w-full bg-white border border-neutral-300 rounded-lg px-4 py-2.5 text-neutral-900 text-sm font-semibold outline-none appearance-none cursor-pointer"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                        Age <span style={{ color: themeColor }}>*</span>
                      </label>
                      <input
                        type="number"
                        placeholder="Age"
                        value={primaryTraveler.age}
                        onChange={(e) =>
                          setPrimaryTraveler({ ...primaryTraveler, age: e.target.value })
                        }
                        className="w-full bg-white border border-neutral-300 rounded-lg px-4 py-2.5 text-neutral-900 text-sm font-medium outline-none"
                      />
                    </div>
                  </div>

                  {/* Additional Travelers (If totalPersons > 1) */}
                  {additionalTravelers.map((traveler, index) => (
                    <div key={traveler.id} className="pt-4 border-t border-neutral-200 space-y-4">
                      <div className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                        Traveler {traveler.id} Details
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                          Full Name <span style={{ color: themeColor }}>*</span>
                        </label>
                        <input
                          type="text"
                          placeholder={`Traveler ${traveler.id} Full Name`}
                          value={traveler.name}
                          onChange={(e) => {
                            const updated = [...additionalTravelers];
                            updated[index].name = e.target.value;
                            setAdditionalTravelers(updated);
                          }}
                          className="w-full bg-white border border-neutral-300 rounded-lg px-4 py-2.5 text-neutral-900 text-sm font-semibold outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                            Gender
                          </label>
                          <div className="relative">
                            <select
                              value={traveler.gender}
                              onChange={(e) => {
                                const updated = [...additionalTravelers];
                                updated[index].gender = e.target.value;
                                setAdditionalTravelers(updated);
                              }}
                              className="w-full bg-white border border-neutral-300 rounded-lg px-4 py-2.5 text-neutral-900 text-sm font-semibold outline-none appearance-none cursor-pointer"
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                            Age
                          </label>
                          <input
                            type="number"
                            placeholder="Age"
                            value={traveler.age || ''}
                            onChange={(e) => {
                              const updated = [...additionalTravelers];
                              updated[index].age = e.target.value;
                              setAdditionalTravelers(updated);
                            }}
                            className="w-full bg-white border border-neutral-300 rounded-lg px-4 py-2.5 text-neutral-900 text-sm font-medium outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  STEP 3: SAFETY & EMERGENCY
                  ───────────────────────────────────────────────────────────── */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4 max-w-xl"
                >
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                      Emergency Contact Name <span style={{ color: themeColor }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter contact person name"
                      value={emergencyContact.name}
                      onChange={(e) =>
                        setEmergencyContact({ ...emergencyContact, name: e.target.value })
                      }
                      className="w-full bg-white border border-neutral-300 rounded-lg px-4 py-2.5 text-neutral-900 text-sm font-semibold outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                        Contact Phone <span style={{ color: themeColor }}>*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="Enter 10-digit mobile number"
                        value={emergencyContact.phone}
                        onChange={(e) =>
                          setEmergencyContact({ ...emergencyContact, phone: e.target.value })
                        }
                        className="w-full bg-white border border-neutral-300 rounded-lg px-4 py-2.5 text-neutral-900 text-sm font-medium outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                        Relationship <span style={{ color: themeColor }}>*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={emergencyContact.relationship}
                          onChange={(e) =>
                            setEmergencyContact({
                              ...emergencyContact,
                              relationship: e.target.value,
                            })
                          }
                          className="w-full bg-white border border-neutral-300 rounded-lg px-4 py-2.5 text-neutral-900 text-sm font-semibold outline-none appearance-none cursor-pointer"
                        >
                          <option value="Parent">Parent</option>
                          <option value="Spouse">Spouse</option>
                          <option value="Sibling">Sibling</option>
                          <option value="Friend">Friend</option>
                          <option value="Other">Other</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                      Any Health Info We Should Know? (Optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Mention any medical conditions, asthma, allergies, medications..."
                      value={emergencyContact.healthInfo}
                      onChange={(e) =>
                        setEmergencyContact({
                          ...emergencyContact,
                          healthInfo: e.target.value,
                        })
                      }
                      className="w-full bg-white border border-neutral-300 rounded-lg p-3 text-neutral-900 text-xs outline-none resize-none"
                    />
                  </div>
                </motion.div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  STEP 4: PAYMENT INFO
                  ───────────────────────────────────────────────────────────── */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4 max-w-xl"
                >
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                      Payment UTR / Reference Number <span style={{ color: themeColor }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter UTR or Bank Ref ID"
                      value={paymentInfo.utrNumber}
                      onChange={(e) =>
                        setPaymentInfo({ ...paymentInfo, utrNumber: e.target.value })
                      }
                      className="w-full bg-white border border-neutral-300 rounded-lg px-4 py-2.5 text-neutral-900 font-mono font-bold text-sm outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                        Amount Paid (₹) <span style={{ color: themeColor }}>*</span>
                      </label>
                      <input
                        type="number"
                        placeholder="Enter amount paid"
                        min={1}
                        value={paymentInfo.amountPaid}
                        onChange={(e) =>
                          setPaymentInfo({ ...paymentInfo, amountPaid: e.target.value })
                        }
                        className="w-full bg-white border border-neutral-300 rounded-lg px-4 py-2.5 text-neutral-900 font-extrabold text-sm outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                        Payment Method <span style={{ color: themeColor }}>*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={paymentInfo.paymentMethod}
                          onChange={(e) =>
                            setPaymentInfo({ ...paymentInfo, paymentMethod: e.target.value })
                          }
                          className="w-full bg-white border border-neutral-300 rounded-lg px-4 py-2.5 text-neutral-900 text-sm font-semibold outline-none appearance-none cursor-pointer"
                        >
                          <option value="UPI">UPI</option>
                          <option value="Bank Transfer">Bank Transfer (IMPS/NEFT)</option>
                          <option value="Cash">Cash</option>
                          <option value="Other">Other</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                      Any Remarks (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Notes or transaction details..."
                      value={paymentInfo.remarks}
                      onChange={(e) =>
                        setPaymentInfo({ ...paymentInfo, remarks: e.target.value })
                      }
                      className="w-full bg-white border border-neutral-300 rounded-lg p-3 text-neutral-900 text-xs outline-none resize-none"
                    />
                  </div>
                </motion.div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  STEP 5: REVIEW & LOCK SEAT
                  ───────────────────────────────────────────────────────────── */}
              {step === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4 max-w-xl"
                >
                  {/* Summary Box */}
                  <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/70 space-y-2.5 text-xs">
                    <div className="flex justify-between border-b border-neutral-200 pb-2">
                      <span className="text-neutral-500 font-bold uppercase text-[10px]">Trip:</span>
                      <span className="font-extrabold text-neutral-900">{finalTripLabel}</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-200 pb-2">
                      <span className="text-neutral-500 font-bold uppercase text-[10px]">Date &amp; Travelers:</span>
                      <span className="font-semibold text-neutral-800">{departureDate} • {travelersCount} Person(s)</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-200 pb-2">
                      <span className="text-neutral-500 font-bold uppercase text-[10px]">Primary Traveler:</span>
                      <span className="font-semibold text-neutral-800">{primaryTraveler.name} ({primaryTraveler.phone})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500 font-bold uppercase text-[10px]">UTR &amp; Amount:</span>
                      <span className="font-bold" style={{ color: themeColor }}>
                        {paymentInfo.utrNumber} — ₹{Number(paymentInfo.amountPaid || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Checklist */}
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1.5 font-medium">
                    <p className="font-bold text-emerald-950">Before you hit confirm, just making sure:</p>
                    <p className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      All traveler details are accurate
                    </p>
                    <p className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      Carry your Govt ID on the trip
                    </p>
                  </div>

                  {/* Terms */}
                  <div className="flex items-start gap-2.5 pt-1">
                    <input
                      type="checkbox"
                      id="termsAgreed"
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded border-neutral-300 cursor-pointer"
                      style={{ accentColor: themeColor }}
                    />
                    <label htmlFor="termsAgreed" className="text-xs text-neutral-700 font-medium cursor-pointer select-none">
                      I/We have read and agree to{' '}
                      <Link
                        to="/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-bold hover:opacity-85 transition-opacity"
                        style={{ color: themeColor }}
                      >
                        {companyName} Terms &amp; Conditions
                      </Link>
                      .
                    </label>
                  </div>
                </motion.div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  STEP 6: SUCCESS SCREEN
                  ───────────────────────────────────────────────────────────── */}
              {step === 6 && (
                <motion.div
                  key="step6"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-6 space-y-5 max-w-md mx-auto"
                >
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                    <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-neutral-900">
                      You're All Set!
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      Booking details recorded for <strong className="text-neutral-800">{finalTripLabel}</strong>. Confirmation email dispatched to <strong className="text-neutral-800">{primaryTraveler.email}</strong>.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-2">
                    <a
                      href={directWhatsAppLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp ({companyPhone})
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setPaymentInfo({ utrNumber: '', amountPaid: '', paymentMethod: 'UPI', remarks: '' });
                    }}
                    className="text-xs text-neutral-400 hover:text-neutral-700 underline cursor-pointer pt-2 block mx-auto"
                  >
                    + Register another traveler
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ========================================================================= */}
          {/* BOTTOM NAVIGATION FOOTER (Matching Reference Screenshot) */}
          {/* ========================================================================= */}
          {step <= 5 && (
            <div className="pt-6 border-t border-neutral-150 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
              {/* Left Side: Progress Track + "% Left" */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-28 sm:w-36 h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: themeColor,
                      width: `${(step / 5) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-[11px] font-bold text-neutral-400">
                  {percentLeft}% Left
                </span>
              </div>

              {/* Right Side: PREVIOUS (Outline) & NEXT (Solid) Buttons */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-md border-2 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 hover:bg-neutral-50"
                    style={{
                      borderColor: themeColor,
                      color: themeColor,
                    }}
                  >
                    ← PREVIOUS
                  </button>
                )}

                {step < 5 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (step === 1) handleNextStep1();
                      else if (step === 2) handleNextStep2();
                      else if (step === 3) handleNextStep3();
                      else if (step === 4) handleNextStep4();
                    }}
                    className="px-8 py-2.5 rounded-md text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 cursor-pointer transform hover:-translate-y-0.5"
                    style={{
                      background: `linear-gradient(135deg, ${themeColor} 0%, ${themeDarker} 100%)`,
                    }}
                  >
                    NEXT →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitRegistration}
                    disabled={submitting || !agreedTerms}
                    className="px-8 py-2.5 rounded-md text-white font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transform hover:-translate-y-0.5"
                    style={{
                      background: `linear-gradient(135deg, ${themeColor} 0%, ${themeDarker} 100%)`,
                    }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        LOCKING...
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        LOCK MY SEAT →
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
