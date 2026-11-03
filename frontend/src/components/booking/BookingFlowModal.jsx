import React, { useState, useEffect } from 'react';
import {
  X,
  Minus,
  Plus,
  Info,
  Calendar,
  Users,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  Lock,
  CheckCircle2,
  AlertCircle,
  Tag,
  Loader2,
  Download,
  Share2,
  MessageCircle,
} from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import { useSettings } from '../../context/SettingsContext';
import { usePackages } from '../../context/PackageContext';

const ADVANCE_PER_PERSON = 2000;

export default function BookingFlowModal({
  isOpen,
  onClose,
  pkg,
  initialDate = '',
  initialTravelers = 1,
}) {
  const { whatsappUrl, getCustomWhatsAppUrl, API_BASE_URL } = useSettings();
  const { checkAvailability } = usePackages();

  // Wizard Step: 1 = YOUR TRIP, 2 = TRAVELER DETAILS, 3 = PAY & CONFIRM, 4 = SUCCESS CONFIRMATION
  const [step, setStep] = useState(1);

  // Step 1 State: Trip Confirmation
  const [travelDate, setTravelDate] = useState('');
  const [totalPersons, setTotalPersons] = useState(1);
  const [sharingType, setSharingType] = useState('Standard Sharing');
  const [customPricePerPerson, setCustomPricePerPerson] = useState(null);

  // Real-time Availability Verification State
  const [availabilityInfo, setAvailabilityInfo] = useState(null);
  const [isCheckingAvail, setIsCheckingAvail] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!travelDate || !pkg || !isOpen) return;

    const check = async () => {
      setIsCheckingAvail(true);
      const targetId = pkg.id || pkg._id;
      const res = await checkAvailability(targetId, travelDate, totalPersons);
      if (isMounted) {
        setAvailabilityInfo(res);
        setIsCheckingAvail(false);
      }
    };
    const t = setTimeout(check, 250);
    return () => {
      isMounted = false;
      clearTimeout(t);
    };
  }, [travelDate, totalPersons, pkg, isOpen]);

  // Step 2 State: Travelers List
  const [travelers, setTravelers] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(0);
  const [errors, setErrors] = useState({});

  // Step 3 State: Payment & Coupon
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState({ type: '', text: '' });
  const [paymentOption, setPaymentOption] = useState('advance'); // 'advance' | 'full'
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 4 State: Confirmed Booking Details
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Initialize form when opened or props change
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setTravelDate(initialDate || getDefaultTomorrowDate());
      const persons = Math.max(1, Number(initialTravelers) || 1);
      setTotalPersons(persons);
      setErrors({});
      if (Array.isArray(pkg?.pricingTiers) && pkg.pricingTiers.length > 0) {
        const defaultT = pkg.pricingTiers.find((t) => t.isDefault) || pkg.pricingTiers[0];
        setSharingType(`${defaultT.name}${defaultT.subtext ? ` (${defaultT.subtext})` : ''}`);
        setCustomPricePerPerson(defaultT.price);
      } else {
        setSharingType('Standard Sharing');
        setCustomPricePerPerson(null);
      }
      setCouponCode('');
      setAppliedDiscount(0);
      setCouponMessage({ type: '', text: '' });
      setPaymentOption('advance');
      setAgreeTerms(true);
      setConfirmedBooking(null);

      // Initialize traveler cards
      syncTravelers(persons);
    }
  }, [isOpen, initialDate, initialTravelers]);

  // Synchronize travelers list length with total persons count
  const syncTravelers = (count) => {
    setTravelers((prev) => {
      const list = [...prev];
      while (list.length < count) {
        list.push({
          id: list.length + 1,
          name: '',
          email: '',
          gender: '',
          age: '',
          phone: '',
          medical: '',
        });
      }
      return list.slice(0, count);
    });
  };

  const handlePersonsChange = (newCount) => {
    const validCount = Math.max(1, Math.min(20, newCount));
    setTotalPersons(validCount);
    syncTravelers(validCount);
  };

  const handleTravelerFieldChange = (index, field, value) => {
    setTravelers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    // Clear error for this field
    if (errors[`${index}_${field}`]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[`${index}_${field}`];
        return next;
      });
    }
  };

  // Helper for tomorrow's date string YYYY-MM-DD
  function getDefaultTomorrowDate() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }

  // Format YYYY-MM-DD to "14 November 2026"
  const formatFriendlyDate = (dateStr) => {
    if (!dateStr) return 'Flexible Date';
    try {
      const [y, m, d] = dateStr.split('-');
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Pricing calculations
  const pricePerPerson = customPricePerPerson || pkg?.price || 8999;
  const subtotal = pricePerPerson * totalPersons;
  const totalPayable = Math.max(0, subtotal - appliedDiscount);
  const advancePayable = ADVANCE_PER_PERSON * totalPersons;
  const finalPayableNow = paymentOption === 'advance' ? advancePayable : totalPayable;

  // Validate Step 1
  const handleContinueToTravelers = (e) => {
    e.preventDefault();
    if (!travelDate) {
      setErrors({ travelDate: 'Please select your travel date' });
      return;
    }
    if (availabilityInfo && availabilityInfo.available === false) {
      setErrors({ travelDate: availabilityInfo.reason || 'This date is currently unavailable for booking. Please pick another date.' });
      return;
      return;
    }
    setErrors({});
    setStep(2);
  };

  // Validate Step 2
  const handleContinueToPayment = (e) => {
    e.preventDefault();
    const newErrors = {};

    // Primary traveler is required to fill full contact info
    const primary = travelers[0] || {};
    if (!primary.name?.trim()) newErrors['0_name'] = 'Full name is required';
    if (!primary.email?.trim() || !primary.email.includes('@'))
      newErrors['0_email'] = 'Valid email is required';
    if (!primary.gender) newErrors['0_gender'] = 'Select gender';
    if (!primary.age || Number(primary.age) <= 0) newErrors['0_age'] = 'Valid age required';
    if (!primary.phone?.trim() || primary.phone.replace(/\D/g, '').length < 10) {
      newErrors['0_phone'] = '10-digit mobile number required';
    }

    // Additional travelers (if any) require Name & Gender
    for (let i = 1; i < travelers.length; i++) {
      const t = travelers[i];
      if (!t.name?.trim()) newErrors[`${i}_name`] = `Traveler ${i + 1} name is required`;
      if (!t.gender) newErrors[`${i}_gender`] = 'Select gender';
      if (!t.age) newErrors[`${i}_age`] = 'Age required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Auto expand the first card with an error
      const firstErrKey = Object.keys(newErrors)[0];
      const errIndex = parseInt(firstErrKey.split('_')[0], 10);
      if (!isNaN(errIndex)) setExpandedIndex(errIndex);
      return;
    }

    setErrors({});
    setStep(3);
  };

  // Coupon Code verification
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'EARLYBIRD') {
      const disc = Math.min(1000 * totalPersons, subtotal * 0.2);
      setAppliedDiscount(disc);
      setCouponMessage({
        type: 'success',
        text: `Awesome! Coupon EARLYBIRD applied (-₹${disc.toLocaleString('en-IN')})`,
      });
    } else if (code === 'WEEKEND10') {
      const disc = Math.round(subtotal * 0.1);
      setAppliedDiscount(disc);
      setCouponMessage({
        type: 'success',
        text: `Coupon WEEKEND10 applied! 10% discount (-₹${disc.toLocaleString('en-IN')})`,
      });
    } else if (code === 'ESCAPE500') {
      setAppliedDiscount(500);
      setCouponMessage({
        type: 'success',
        text: 'Coupon ESCAPE500 applied! Flat ₹500 discount.',
      });
    } else {
      setAppliedDiscount(0);
      setCouponMessage({
        type: 'error',
        text: 'Invalid or expired coupon code. Try EARLYBIRD or WEEKEND10.',
      });
    }
  };

  // Submit and Complete Booking
  const handlePayAndConfirm = async () => {
    if (!agreeTerms) {
      setErrors({ terms: 'Please agree to Terms & Conditions and Cancellation Policy' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const bookingRef = `WE-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const primary = travelers[0] || {};
    const tripTitle = pkg?.name || pkg?.title || 'Mountain Expedition';

    const bookingPayload = {
      name: primary.name,
      email: primary.email,
      phone: primary.phone,
      company: `${totalPersons} Traveler(s) [${paymentOption.toUpperCase()}] Ref: ${bookingRef}`,
      subject: `Tour Booking: ${tripTitle} - Ref: ${bookingRef}`,
      message: `BOOKING CONFIRMED!\nRef ID: ${bookingRef}\nPackage: ${tripTitle}\nTravel Date: ${formatFriendlyDate(travelDate)}\nTotal Persons: ${totalPersons}\nSharing: ${sharingType}\nPayment Choice: ${paymentOption === 'advance' ? `Pay Advance (₹${advancePayable})` : `Pay Full (₹${totalPayable})`}\nSubtotal: ₹${subtotal}\nDiscount: ₹${appliedDiscount}\nFinal Amount Payable: ₹${finalPayableNow}\n\nTravelers List:\n${travelers
        .map(
          (t, i) =>
            `${i + 1}. ${t.name} | Gender: ${t.gender || 'N/A'} | Age: ${t.age || 'N/A'} | Phone: ${t.phone || 'N/A'} | Medical: ${t.medical || 'None'}`
        )
        .join('\n')}`,
      source: 'package_booking',
    };

    try {
      // Post booking record to backend
      const res = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: pkg?.id || 'tour-package',
          packageName: tripTitle,
          travelDate,
          friendlyTravelDate: formatFriendlyDate(travelDate),
          totalPersons,
          sharingType,
          primaryContact: {
            name: primary.name,
            email: primary.email,
            phone: primary.phone,
            gender: primary.gender || '',
            age: primary.age ? Number(primary.age) : null,
          },
          travelers,
          pricing: {
            pricePerPerson,
            subtotal,
            couponCode: appliedDiscount > 0 ? couponCode : '',
            discountAmount: appliedDiscount,
            totalPayable,
            advanceAmount: advancePayable,
            paymentOption,
          },
          paymentOption,
        }),
      });

      const data = await res.json();
      const saved = data.booking;

      const snapshot = {
        bookingRef: saved?.bookingRef || bookingRef,
        tripTitle: saved?.packageName || tripTitle,
        travelDate: saved?.friendlyTravelDate || formatFriendlyDate(travelDate),
        primaryName: saved?.primaryContact?.name || primary.name,
        primaryPhone: saved?.primaryContact?.phone || primary.phone,
        primaryEmail: saved?.primaryContact?.email || primary.email,
        totalPersons: saved?.totalPersons || totalPersons,
        sharingType: saved?.sharingType || sharingType,
        paymentOption: saved?.pricing?.paymentOption || paymentOption,
        finalPayableNow: saved?.pricing?.amountPaidNow || finalPayableNow,
        subtotal: saved?.pricing?.subtotal || subtotal,
        appliedDiscount: saved?.pricing?.discountAmount || appliedDiscount,
        totalPayable: saved?.pricing?.totalPayable || totalPayable,
        travelers: saved?.travelers || travelers,
      };

      setConfirmedBooking(snapshot);
      setStep(4);
    } catch (err) {
      console.error('Booking confirmation error:', err);
      // Success transition fallback
      const snapshot = {
        bookingRef,
        tripTitle,
        travelDate: formatFriendlyDate(travelDate),
        primaryName: primary.name,
        primaryPhone: primary.phone,
        primaryEmail: primary.email,
        totalPersons,
        sharingType,
        paymentOption,
        finalPayableNow,
        subtotal,
        appliedDiscount,
        totalPayable,
        travelers,
      };

      setConfirmedBooking(snapshot);
      setStep(4);
    }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const tripTitle = pkg?.name || pkg?.title || 'Expedition Trek';
  const primaryTraveler = travelers[0] || {};

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 lg:p-6 select-none animate-fadeIn">
      {/* Modal Dialog Card */}
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-neutral-100 flex flex-col max-h-[92vh]">
        {/* Top Header Bar with Close Button */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B16]"></span>
            <span className="font-extrabold text-xs uppercase tracking-wider text-neutral-500">
              Weekend Escapes Booking Engine
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close booking modal"
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-grow space-y-6">
          {/* ══════════════════════════════════════════════════════════════
              STEP 1: YOUR TRIP (Theme Styled)
              ══════════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Step Header */}
              <div>
                <span className="inline-block px-3.5 py-1 rounded-full bg-[#FFF4EE] border border-[#FED7AA] text-[#FF6B16] text-[11px] font-black tracking-wider uppercase mb-2">
                  Step 1 of 3
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
                  YOUR TRIP
                </h2>
                <p className="text-neutral-500 text-xs sm:text-sm mt-1">
                  Confirm your trip, choose a travel date and number of travelers.
                </p>
              </div>

              {/* Form Fields */}
              <form onSubmit={handleContinueToTravelers} className="space-y-5">
                {/* Trip Name Field */}
                <div>
                  <label className="block text-[11px] font-extrabold text-neutral-600 uppercase tracking-wider mb-1.5">
                    TRIP
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={tripTitle}
                    className="w-full h-12 px-4 rounded-xl bg-[#F7F7F5] text-[#111111] font-bold text-sm border border-neutral-200/60 outline-none cursor-not-allowed"
                  />
                </div>

                {/* Date & Persons Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Travel Date */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-neutral-600 uppercase tracking-wider mb-1.5">
                      TRAVEL DATE *
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        required
                        value={travelDate}
                        onChange={(e) => setTravelDate(e.target.value)}
                        min={getDefaultTomorrowDate()}
                        className="w-full h-12 px-4 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-800 focus:border-[#FF6B16] focus:ring-2 focus:ring-[#FF6B16]/10 outline-none transition-all cursor-pointer"
                      />
                    </div>
                    {errors.travelDate && (
                      <p className="text-xs text-red-500 mt-1">{errors.travelDate}</p>
                    )}
                  </div>

                  {/* Total Persons Stepper */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-neutral-600 uppercase tracking-wider mb-1.5">
                      TOTAL PERSONS *
                    </label>
                    <div className="h-12 border border-neutral-200 rounded-xl px-3 flex items-center justify-between bg-white focus-within:border-[#FF6B16]">
                      <button
                        type="button"
                        onClick={() => handlePersonsChange(totalPersons - 1)}
                        disabled={totalPersons <= 1}
                        className="w-8 h-8 rounded-full border border-neutral-200 hover:border-[#FF6B16] hover:text-[#FF6B16] flex items-center justify-center text-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <div className="text-center leading-tight">
                        <span className="block text-base font-black text-neutral-900">
                          {totalPersons}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-medium">
                          person(s)
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handlePersonsChange(totalPersons + 1)}
                        disabled={totalPersons >= 20}
                        className="w-8 h-8 rounded-full border border-neutral-200 hover:border-[#FF6B16] hover:text-[#FF6B16] flex items-center justify-center text-neutral-600 active:scale-95 transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Dynamic Pricing / Sharing Option Selector */}
                {Array.isArray(pkg?.pricingTiers) && pkg.pricingTiers.length > 0 && (
                  <div>
                    <label className="block text-[11px] font-extrabold text-neutral-600 uppercase tracking-wider mb-1.5">
                      {pkg.pricingType === 'sharing'
                        ? 'ROOM / CAMP OCCUPANCY *'
                        : pkg.pricingType === 'distance'
                        ? 'BOARDING & DEPARTURE ROUTE *'
                        : 'SELECTED PACKAGE OPTION *'}
                    </label>
                    <select
                      value={sharingType}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSharingType(val);
                        const match = pkg.pricingTiers.find((t) => val.startsWith(t.name));
                        if (match) setCustomPricePerPerson(match.price);
                      }}
                      className="w-full h-12 px-4 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-800 bg-white focus:border-[#FF6B16] outline-none cursor-pointer"
                    >
                      {pkg.pricingTiers.map((t) => {
                        const label = `${t.name}${t.subtext ? ` (${t.subtext})` : ''}`;
                        return (
                          <option key={t.name} value={label}>
                            {t.name} — {formatCurrency(t.price)}/person {t.subtext ? `• ${t.subtext}` : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                {/* Real-time Availability Status Banner */}
                {travelDate && (
                  <div>
                    {isCheckingAvail ? (
                      <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-semibold text-neutral-500 flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF6B16]" />
                        <span>Verifying seat availability for {travelDate}...</span>
                      </div>
                    ) : availabilityInfo ? (
                      <div
                        className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                          availabilityInfo.available
                            ? availabilityInfo.status === 'filling_fast'
                              ? 'bg-amber-50/80 border-amber-200 text-amber-900 font-bold'
                              : 'bg-emerald-50/80 border-emerald-200 text-emerald-900 font-bold'
                            : 'bg-rose-50 border-rose-200 text-rose-900 font-bold'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {availabilityInfo.available ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          )}
                          <span>
                            {availabilityInfo.available
                              ? availabilityInfo.status === 'filling_fast'
                                ? `⚡ High Demand: Only ${availabilityInfo.seatsLeft} seat(s) remaining for ${totalPersons} traveler(s)!`
                                : `✓ Departure Confirmed: ${availabilityInfo.seatsLeft} seat(s) open for ${totalPersons} traveler(s)`
                              : availabilityInfo.reason || 'This date is currently unavailable for booking.'}
                          </span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/80 border border-current">
                          {availabilityInfo.available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Booking Advance Notice Box (Warm Theme) */}
                <div className="bg-[#FFF6F0] border border-[#FED7AA] rounded-xl p-4 flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#FF6B16] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <Info className="w-3 h-3" />
                  </div>
                  <p className="text-xs sm:text-sm text-[#9A3412] leading-relaxed">
                    A <strong>booking advance of ₹{ADVANCE_PER_PERSON.toLocaleString('en-IN')} per person</strong> is required to secure your seats. Full payment is also accepted at final step.
                  </p>
                </div>

                {/* Primary CTA Button (Theme Orange) */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full h-12 sm:h-14 bg-[#FF6B16] hover:bg-[#e05809] active:scale-[0.99] text-white font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-[#FF6B16]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Continue to Traveler Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              STEP 2: TRAVELER DETAILS (Theme Styled)
              ══════════════════════════════════════════════════════════════ */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Step Header */}
              <div>
                <span className="inline-block px-3.5 py-1 rounded-full bg-[#FFF4EE] border border-[#FED7AA] text-[#FF6B16] text-[11px] font-black tracking-wider uppercase mb-2">
                  Step 2 of 3
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
                  TRAVELER DETAILS
                </h2>
                <p className="text-neutral-500 text-xs sm:text-sm mt-1">
                  Fill in details for each traveler. Traveler 1 is the primary contact.
                </p>
              </div>

              {/* Accordion List for Travelers */}
              <div className="space-y-4">
                {travelers.map((traveler, index) => {
                  const isPrimary = index === 0;
                  const isExpanded = expandedIndex === index;

                  return (
                    <div
                      key={traveler.id}
                      className="border border-neutral-200 rounded-2xl overflow-hidden bg-white shadow-xs transition-all"
                    >
                      {/* Accordion Header */}
                      <button
                        type="button"
                        onClick={() => setExpandedIndex(isExpanded ? -1 : index)}
                        className="w-full p-4 sm:p-5 flex items-center justify-between bg-[#F9FBFC] hover:bg-[#FFF8F4] transition-colors text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm font-black text-neutral-800 uppercase tracking-wide">
                            Traveler {index + 1}
                          </span>
                          {isPrimary && (
                            <span className="px-2.5 py-0.5 rounded-full bg-[#FF6B16] text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                              Primary Contact
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-sm font-extrabold text-[#FF6B16]">
                            {formatCurrency(pricePerPerson)}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-neutral-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-neutral-400" />
                          )}
                        </div>
                      </button>

                      {/* Accordion Form Body */}
                      {isExpanded && (
                        <div className="p-5 sm:p-6 space-y-4 border-t border-neutral-100 bg-white">
                          {/* Full Name */}
                          <div>
                            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                              FULL NAME *
                            </label>
                            <input
                              type="text"
                              required
                              value={traveler.name}
                              onChange={(e) =>
                                handleTravelerFieldChange(index, 'name', e.target.value)
                              }
                              placeholder="Enter full name"
                              className="w-full h-11 px-3.5 rounded-xl border border-neutral-200 text-xs sm:text-sm text-neutral-800 placeholder-neutral-400 focus:border-[#FF6B16] focus:ring-2 focus:ring-[#FF6B16]/10 outline-none transition-all"
                            />
                            {errors[`${index}_name`] && (
                              <p className="text-[11px] text-red-500 mt-1">
                                {errors[`${index}_name`]}
                              </p>
                            )}
                          </div>

                          {/* Email Address (Mandatory for Primary) */}
                          {isPrimary && (
                            <div>
                              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                                EMAIL ADDRESS *
                              </label>
                              <input
                                type="email"
                                required
                                value={traveler.email}
                                onChange={(e) =>
                                  handleTravelerFieldChange(index, 'email', e.target.value)
                                }
                                placeholder="You'll receive booking confirmation here"
                                className="w-full h-11 px-3.5 rounded-xl border border-neutral-200 text-xs sm:text-sm text-neutral-800 placeholder-neutral-400 focus:border-[#FF6B16] focus:ring-2 focus:ring-[#FF6B16]/10 outline-none transition-all"
                              />
                              {errors[`${index}_email`] && (
                                <p className="text-[11px] text-red-500 mt-1">
                                  {errors[`${index}_email`]}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Gender & Age Row */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                                GENDER *
                              </label>
                              <select
                                value={traveler.gender}
                                onChange={(e) =>
                                  handleTravelerFieldChange(index, 'gender', e.target.value)
                                }
                                className="w-full h-11 px-3.5 rounded-xl border border-neutral-200 text-xs sm:text-sm text-neutral-800 focus:border-[#FF6B16] focus:ring-2 focus:ring-[#FF6B16]/10 outline-none transition-all cursor-pointer"
                              >
                                <option value="">Select gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                              </select>
                              {errors[`${index}_gender`] && (
                                <p className="text-[11px] text-red-500 mt-1">
                                  {errors[`${index}_gender`]}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                                AGE *
                              </label>
                              <input
                                type="number"
                                min="5"
                                max="85"
                                value={traveler.age}
                                onChange={(e) =>
                                  handleTravelerFieldChange(index, 'age', e.target.value)
                                }
                                placeholder="e.g. 28"
                                className="w-full h-11 px-3.5 rounded-xl border border-neutral-200 text-xs sm:text-sm text-neutral-800 placeholder-neutral-400 focus:border-[#FF6B16] focus:ring-2 focus:ring-[#FF6B16]/10 outline-none transition-all"
                              />
                              {errors[`${index}_age`] && (
                                <p className="text-[11px] text-red-500 mt-1">
                                  {errors[`${index}_age`]}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Mobile Number */}
                          <div>
                            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                              MOBILE NUMBER {isPrimary ? '*' : '(Optional)'}
                            </label>
                            <input
                              type="tel"
                              value={traveler.phone}
                              onChange={(e) =>
                                handleTravelerFieldChange(index, 'phone', e.target.value)
                              }
                              placeholder="10-digit mobile number"
                              className="w-full h-11 px-3.5 rounded-xl border border-neutral-200 text-xs sm:text-sm text-neutral-800 placeholder-neutral-400 focus:border-[#FF6B16] focus:ring-2 focus:ring-[#FF6B16]/10 outline-none transition-all font-mono"
                            />
                            {errors[`${index}_phone`] && (
                              <p className="text-[11px] text-red-500 mt-1">
                                {errors[`${index}_phone`]}
                              </p>
                            )}
                          </div>

                          {/* Medical / Health Info */}
                          <div>
                            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                              MEDICAL / HEALTH INFO
                            </label>
                            <input
                              type="text"
                              value={traveler.medical}
                              onChange={(e) =>
                                handleTravelerFieldChange(index, 'medical', e.target.value)
                              }
                              placeholder="Leave blank or 'None' if no issues"
                              className="w-full h-11 px-3.5 rounded-xl border border-neutral-200 text-xs sm:text-sm text-neutral-800 placeholder-neutral-400 focus:border-[#FF6B16] focus:ring-2 focus:ring-[#FF6B16]/10 outline-none transition-all"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Step 2 Action Buttons */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="h-12 px-5 rounded-xl bg-[#F1F4F8] hover:bg-[#E5EBF2] text-neutral-700 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleContinueToPayment}
                  className="flex-grow h-12 bg-[#FF6B16] hover:bg-[#e05809] active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#FF6B16]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              STEP 3: PAY & CONFIRM (Theme Styled)
              ══════════════════════════════════════════════════════════════ */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Step Header */}
              <div>
                <span className="inline-block px-3.5 py-1 rounded-full bg-[#FFF4EE] border border-[#FED7AA] text-[#FF6B16] text-[11px] font-black tracking-wider uppercase mb-2">
                  Step 3 of 3
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
                  PAY & CONFIRM
                </h2>
                <p className="text-neutral-500 text-xs sm:text-sm mt-1">
                  Review your booking and choose a payment option.
                </p>
              </div>

              {/* 1. Theme-styled Booking Summary Card */}
              <div className="bg-[#FFF7F2] border border-[#FED7AA] rounded-2xl p-5 sm:p-6 space-y-3.5 text-xs sm:text-sm">
                <div className="text-[11px] font-black text-[#FF6B16] uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-[#FF6B16]/20">
                  <span>📋 BOOKING SUMMARY</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-600 font-medium">Trip</span>
                  <span className="font-extrabold text-[#111111] text-right">
                    {tripTitle}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-600 font-medium">Travel Date</span>
                  <span className="font-extrabold text-[#111111]">
                    {formatFriendlyDate(travelDate)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-600 font-medium">Primary Contact</span>
                  <span className="font-extrabold text-[#111111]">
                    {primaryTraveler.name || 'Explorer'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-600 font-medium">Total Persons</span>
                  <span className="font-extrabold text-[#111111]">
                    {totalPersons} {totalPersons === 1 ? 'person' : 'persons'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-600 font-medium">Selections</span>
                  <span className="font-extrabold text-[#111111]">
                    {sharingType}
                  </span>
                </div>

                <div className="flex items-start justify-between pt-1 border-t border-[#FF6B16]/15">
                  <span className="text-neutral-600 font-medium">Contact</span>
                  <div className="text-right">
                    <p className="font-mono font-bold text-[#111111]">
                      {primaryTraveler.phone}
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      {primaryTraveler.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Price Breakdown Box */}
              <div className="border border-neutral-200 rounded-2xl p-5 space-y-2.5 text-xs sm:text-sm bg-white">
                <div className="flex items-center justify-between text-neutral-600">
                  <span>Price per person</span>
                  <span className="font-semibold text-neutral-800">
                    {formatCurrency(pricePerPerson)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-neutral-600">
                  <span>Persons</span>
                  <span className="font-semibold text-neutral-800">× {totalPersons}</span>
                </div>

                <div className="flex items-center justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-neutral-800">
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                {appliedDiscount > 0 && (
                  <div className="flex items-center justify-between text-[#FF6B16] font-bold">
                    <span>Discount Applied</span>
                    <span>- {formatCurrency(appliedDiscount)}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
                  <span className="text-sm font-black text-neutral-900">Total Payable</span>
                  <span className="text-lg font-black text-neutral-900">
                    {formatCurrency(totalPayable)}
                  </span>
                </div>
              </div>

              {/* 3. Coupon Code Input */}
              <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="ENTER COUPON CODE (E.G. EARLYBIRD)"
                      className="w-full h-11 px-3.5 rounded-xl border border-neutral-200 text-xs sm:text-sm font-mono uppercase text-neutral-800 placeholder-neutral-400 focus:border-[#FF6B16] focus:ring-2 focus:ring-[#FF6B16]/10 outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="h-11 px-5 rounded-xl bg-[#111111] hover:bg-[#FF6B16] text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {couponMessage.text && (
                  <p
                    className={`text-[11px] font-semibold ${
                      couponMessage.type === 'success' ? 'text-[#FF6B16]' : 'text-red-500'
                    }`}
                  >
                    {couponMessage.text}
                  </p>
                )}
              </form>

              {/* 4. Choose Payment Option (Theme Highlights) */}
              <div className="space-y-3">
                <label className="block text-xs font-black text-neutral-700 uppercase tracking-wider">
                  CHOOSE PAYMENT OPTION *
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Option A: Pay Advance */}
                  <div
                    onClick={() => setPaymentOption('advance')}
                    className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentOption === 'advance'
                        ? 'border-[#FF6B16] bg-[#FFF8F4] shadow-sm'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-black uppercase tracking-wider text-neutral-600">
                        PAY ADVANCE
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          paymentOption === 'advance'
                            ? 'border-[#FF6B16] bg-[#FF6B16]'
                            : 'border-neutral-300'
                        }`}
                      >
                        {paymentOption === 'advance' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                    <p className="text-xl font-black text-[#FF6B16]">
                      {formatCurrency(advancePayable)}
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      ₹{ADVANCE_PER_PERSON.toLocaleString('en-IN')} × persons
                    </p>
                  </div>

                  {/* Option B: Pay Full Amount */}
                  <div
                    onClick={() => setPaymentOption('full')}
                    className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentOption === 'full'
                        ? 'border-[#FF6B16] bg-[#FFF8F4] shadow-sm'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-black uppercase tracking-wider text-neutral-600">
                        PAY FULL AMOUNT
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          paymentOption === 'full'
                            ? 'border-[#FF6B16] bg-[#FF6B16]'
                            : 'border-neutral-300'
                        }`}
                      >
                        {paymentOption === 'full' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                    <p className="text-xl font-black text-[#FF6B16]">
                      {formatCurrency(totalPayable)}
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Full package amount
                    </p>
                  </div>
                </div>
              </div>

              {/* 5. Terms & Policy Checkbox */}
              <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/70">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 rounded text-[#FF6B16] focus:ring-[#FF6B16] mt-0.5 cursor-pointer"
                  />
                  <span className="text-xs text-neutral-600 leading-relaxed">
                    I/We have read and agree to Weekend Escapes{' '}
                    <span className="text-[#FF6B16] font-bold underline">Terms & Conditions</span>{' '}
                    and the{' '}
                    <span className="text-[#FF6B16] font-bold underline">Cancellation Policy</span>.
                  </span>
                </label>
                {errors.terms && (
                  <p className="text-[11px] text-red-500 mt-1 pl-6">{errors.terms}</p>
                )}
              </div>

              {/* 6. Step 3 Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={isSubmitting}
                  className="h-12 px-5 rounded-xl bg-[#F1F4F8] hover:bg-[#E5EBF2] text-neutral-700 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handlePayAndConfirm}
                  disabled={isSubmitting}
                  className="flex-grow h-12 sm:h-14 bg-gradient-to-r from-[#FF6B16] to-[#ff4e00] hover:from-[#ff7929] hover:to-[#ff5c17] active:scale-[0.99] text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-xl shadow-[#FF6B16]/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing Payment Gateway...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>PAY SECURELY WITH PHONEPE ({formatCurrency(finalPayableNow)})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              STEP 4: BOOKING CONFIRMED SCREEN (SUCCESS VOUCHER)
              ══════════════════════════════════════════════════════════════ */}
          {step === 4 && confirmedBooking && (
            <div className="py-2 text-center space-y-6 animate-scaleUp">
              {/* Celebration Animation Ring (Theme Color) */}
              <div className="w-20 h-20 rounded-full bg-[#FFF4EE] text-[#FF6B16] flex items-center justify-center mx-auto shadow-inner shadow-[#FF6B16]/20 ring-4 ring-[#FF6B16]/10">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>

              <div>
                <span className="px-3.5 py-1 rounded-full bg-[#FFF4EE] border border-[#FED7AA] text-[#C2410C] text-xs font-bold uppercase tracking-wider">
                  Registration Successful
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#111111] mt-2">
                  Trip Confirmed & Slot Locked!
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto mt-1">
                  Thank you, <strong>{confirmedBooking.primaryName}</strong>! Your expedition request has been registered under booking ID:
                </p>
                <div className="mt-2 inline-block px-4 py-1.5 rounded-xl bg-neutral-900 text-white font-mono font-bold text-sm">
                  {confirmedBooking.bookingRef}
                </div>
              </div>

              {/* Receipt Summary Card */}
              <div className="bg-[#FFF9F5] border border-[#FED7AA] rounded-2xl p-5 text-left text-xs space-y-2.5 max-w-md mx-auto">
                <div className="flex justify-between pb-2 border-b border-neutral-200/80 font-bold text-neutral-800">
                  <span className="font-extrabold">{confirmedBooking.tripTitle}</span>
                  <span className="text-[#FF6B16] font-black text-sm">
                    {formatCurrency(confirmedBooking.finalPayableNow)}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Travel Date:</span>
                  <span className="font-semibold text-neutral-900">{confirmedBooking.travelDate}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Number of Persons:</span>
                  <span className="font-semibold text-neutral-900">{confirmedBooking.totalPersons}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Payment Type:</span>
                  <span className="font-semibold text-neutral-900 uppercase">
                    {confirmedBooking.paymentOption === 'advance' ? 'Advance Deposit' : 'Full Payment'}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Confirmation Dispatched:</span>
                  <span className="font-semibold text-neutral-900">{confirmedBooking.primaryEmail}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                {/* WhatsApp Connect Button using Admin Phone */}
                <a
                  href={
                    getCustomWhatsAppUrl
                      ? getCustomWhatsAppUrl(
                          `Hi Weekend Escapes! I just completed my booking for ${confirmedBooking.tripTitle} (Ref: ${confirmedBooking.bookingRef}) for ${confirmedBooking.totalPersons} traveler(s) on ${confirmedBooking.travelDate}. Please confirm my slot!`
                        )
                      : whatsappUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto h-12 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Connect on WhatsApp</span>
                </a>

                {/* Close / Return Button */}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto h-12 px-6 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-neutral-700 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Done & Back to Package
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
