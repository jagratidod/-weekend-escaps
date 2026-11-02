import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { PACKAGES } from '../data/packages';
import { formatCurrency } from '../utils/helpers';
import { useSettings } from '../context/SettingsContext';
import { getVisitorId } from '../hooks/usePushNotifications';
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  Info,
  Calendar,
  Users,
  ChevronDown,
  ChevronUp,
  Lock,
  CheckCircle2,
  AlertCircle,
  Tag,
  Loader2,
  Sparkles,
  MessageCircle,
  ShieldCheck,
  MapPin,
  Clock,
  Printer,
  ChevronRight,
} from 'lucide-react';

const ADVANCE_PER_PERSON = 2000;

export function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { whatsappUrl, getCustomWhatsAppUrl, API_BASE_URL } = useSettings();

  // Find package by ID
  const pkg = PACKAGES.find((p) => p.id === id) || PACKAGES[0];
  const tripTitle = pkg?.name || pkg?.title || 'Expedition Trek';

  // Read initial date & travelers from URL query params or router state
  const queryDate = searchParams.get('date') || location.state?.date || '';
  const queryTravelers = parseInt(searchParams.get('travelers') || location.state?.travelers || '1', 10);
  const queryStep = parseInt(searchParams.get('step') || '1', 10);

  // Wizard Step: 1 = YOUR TRIP, 2 = TRAVELER DETAILS, 3 = PAY & CONFIRM, 4 = SUCCESS
  const [step, setStep] = useState(queryStep >= 1 && queryStep <= 4 ? queryStep : 1);

  // Step 1: Trip Confirmation
  const [travelDate, setTravelDate] = useState(queryDate || getDefaultTomorrowDate());
  const [totalPersons, setTotalPersons] = useState(Math.max(1, queryTravelers || 1));
  const [sharingType, setSharingType] = useState('Standard Sharing');

  // Step 2: Travelers List
  const [travelers, setTravelers] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(0);
  const [errors, setErrors] = useState({});

  // Step 3: Payment & Coupon
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState({ type: '', text: '' });
  const [paymentOption, setPaymentOption] = useState('advance'); // 'advance' | 'full'
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 4: Confirmed Booking Details
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Helper for tomorrow's date string YYYY-MM-DD
  function getDefaultTomorrowDate() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }

  // Sync travelers list when total persons count changes
  useEffect(() => {
    setTravelers((prev) => {
      const list = [...prev];
      while (list.length < totalPersons) {
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
      return list.slice(0, totalPersons);
    });
  }, [totalPersons]);

  // Synchronize step with URL query param so back button and refresh work naturally
  const goToStep = (newStep) => {
    setStep(newStep);
    setSearchParams(
      {
        step: String(newStep),
        date: travelDate,
        travelers: String(totalPersons),
      },
      { replace: false }
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePersonsChange = (newCount) => {
    const validCount = Math.max(1, Math.min(20, newCount));
    setTotalPersons(validCount);
  };

  const handleTravelerFieldChange = (index, field, value) => {
    setTravelers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    if (errors[`${index}_${field}`]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[`${index}_${field}`];
        return next;
      });
    }
  };

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
  const pricePerPerson = pkg?.price || 8999;
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
    setErrors({});
    goToStep(2);
  };

  // Validate Step 2
  const handleContinueToPayment = (e) => {
    e.preventDefault();
    const newErrors = {};

    const primary = travelers[0] || {};
    if (!primary.name?.trim()) newErrors['0_name'] = 'Full name is required';
    if (!primary.email?.trim() || !primary.email.includes('@'))
      newErrors['0_email'] = 'Valid email is required';
    if (!primary.gender) newErrors['0_gender'] = 'Select gender';
    if (!primary.age || Number(primary.age) <= 0) newErrors['0_age'] = 'Valid age required';
    if (!primary.phone?.trim() || primary.phone.replace(/\D/g, '').length < 10) {
      newErrors['0_phone'] = '10-digit mobile number required';
    }

    for (let i = 1; i < travelers.length; i++) {
      const t = travelers[i];
      if (!t.name?.trim()) newErrors[`${i}_name`] = `Traveler ${i + 1} name is required`;
      if (!t.gender) newErrors[`${i}_gender`] = 'Select gender';
      if (!t.age) newErrors[`${i}_age`] = 'Age required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstErrKey = Object.keys(newErrors)[0];
      const errIndex = parseInt(firstErrKey.split('_')[0], 10);
      if (!isNaN(errIndex)) setExpandedIndex(errIndex);
      return;
    }

    setErrors({});
    goToStep(3);
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

  // Final Confirmation & Payment Gateway Action
  const handlePayAndConfirm = async () => {
    if (!agreeTerms) {
      setErrors({ terms: 'Please agree to Terms & Conditions and Cancellation Policy' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const primary = travelers[0] || {};

    const bookingData = {
      packageId: pkg?.id || 'tour-package',
      packageName: tripTitle,
      visitorId: getVisitorId(),
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
    };

    try {
      const res = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit booking');
      }

      const savedBooking = data.booking;

      // Initiate PhonePe Order via Official SDK Backend Endpoint
      const payRes = await fetch(`${API_BASE_URL}/payments/phonepe/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: savedBooking._id,
          paymentOption,
        }),
      });

      const payData = await payRes.json();
      if (!payRes.ok || !payData.success) {
        throw new Error(payData.message || 'Failed to create PhonePe payment order.');
      }

      // Redirect directly to the REAL PhonePe Standard Checkout Gateway
      // e.g. https://mercury-t2.phonepe.com/transact/pgv3?token=... or https://mercury.phonepe.com/...
      if (payData.redirectUrl) {
        window.location.href = payData.redirectUrl;
        return;
      }

      throw new Error('No redirect URL returned by PhonePe.');
    } catch (err) {
      console.error('Booking submission error:', err);
      setErrors({ submit: err.message || 'Payment initiation failed. Please check credentials.' });
      setIsSubmitting(false);
    }
  };

  const primaryTraveler = travelers[0] || {};

  return (
    <div className="min-h-screen bg-[#F7F7F5] pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* ── Top Navigation & Breadcrumbs Bar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
          <Link
            to={`/packages/${pkg.id}`}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-neutral-600 hover:text-[#FF6B16] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-[#FF6B16]" />
            <span>Back to {tripTitle} Details</span>
          </Link>

          {/* Stepper Progress Indicator */}
          {step <= 3 && (
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-400">
              <span className={step >= 1 ? 'text-[#FF6B16]' : ''}>1. Trip</span>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
              <span className={step >= 2 ? 'text-[#FF6B16]' : ''}>2. Travelers</span>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
              <span className={step === 3 ? 'text-[#FF6B16]' : ''}>3. Pay & Confirm</span>
            </div>
          )}
        </div>

        {/* ── Main Booking Container Card ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-neutral-150 select-none">
          {/* ══════════════════════════════════════════════════════════════
              STEP 1: YOUR TRIP
              ══════════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Step Header */}
              <div>
                <span className="inline-block px-3.5 py-1 rounded-full bg-[#FFF4EE] border border-[#FED7AA] text-[#FF6B16] text-[11px] font-black tracking-wider uppercase mb-2">
                  Step 1 of 3
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
                  YOUR TRIP
                </h1>
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
              STEP 2: TRAVELER DETAILS
              ══════════════════════════════════════════════════════════════ */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Step Header */}
              <div>
                <span className="inline-block px-3.5 py-1 rounded-full bg-[#FFF4EE] border border-[#FED7AA] text-[#FF6B16] text-[11px] font-black tracking-wider uppercase mb-2">
                  Step 2 of 3
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
                  TRAVELER DETAILS
                </h1>
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
                  onClick={() => goToStep(1)}
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
              STEP 3: PAY & CONFIRM
              ══════════════════════════════════════════════════════════════ */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Step Header */}
              <div>
                <span className="inline-block px-3.5 py-1 rounded-full bg-[#FFF4EE] border border-[#FED7AA] text-[#FF6B16] text-[11px] font-black tracking-wider uppercase mb-2">
                  Step 3 of 3
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
                  PAY & CONFIRM
                </h1>
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

              {/* 4. Choose Payment Option */}
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
                    <a
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#FF6B16] font-bold underline hover:text-[#e05809]"
                    >
                      Terms & Conditions
                    </a>{' '}
                    and the{' '}
                    <a
                      href="/cancellation-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#FF6B16] font-bold underline hover:text-[#e05809]"
                    >
                      Cancellation Policy
                    </a>.
                  </span>
                </label>
                {errors.terms && (
                  <p className="text-[11px] text-red-500 mt-1 pl-6">{errors.terms}</p>
                )}
              </div>

              {errors.submit && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-medium flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
                  <span>{errors.submit}</span>
                </div>
              )}

              {/* 6. Step 3 Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => goToStep(2)}
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
            <div className="py-4 text-center space-y-6 animate-scaleUp">
              {/* Celebration Animation Ring */}
              <div className="w-20 h-20 rounded-full bg-[#FFF4EE] text-[#FF6B16] flex items-center justify-center mx-auto shadow-inner shadow-[#FF6B16]/20 ring-4 ring-[#FF6B16]/10">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>

              <div>
                <span className="px-3.5 py-1 rounded-full bg-[#FFF4EE] border border-[#FED7AA] text-[#C2410C] text-xs font-bold uppercase tracking-wider">
                  Registration Successful
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-[#111111] mt-2">
                  Trip Confirmed & Slot Locked!
                </h1>
                <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto mt-1">
                  Thank you, <strong>{confirmedBooking.primaryName}</strong>! Your expedition request has been registered under booking ID:
                </p>
                <div className="mt-2 inline-block px-4 py-1.5 rounded-xl bg-neutral-900 text-white font-mono font-bold text-sm">
                  {confirmedBooking.bookingRef}
                </div>
              </div>

              {/* Receipt Summary Card */}
              <div className="bg-[#FFF9F5] border border-[#FED7AA] rounded-2xl p-6 text-left text-xs space-y-3 max-w-md mx-auto">
                <div className="flex justify-between pb-2.5 border-b border-neutral-200/80 font-bold text-neutral-800">
                  <span className="font-extrabold text-sm">{confirmedBooking.tripTitle}</span>
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
                  <span className="font-semibold text-neutral-900">{confirmedBooking.totalPersons} Traveler(s)</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Payment Selection:</span>
                  <span className="font-semibold text-neutral-900 uppercase">
                    {confirmedBooking.paymentOption === 'advance' ? 'Advance Deposit' : 'Full Payment'}
                  </span>
                </div>
                {confirmedBooking.paymentOption === 'advance' && confirmedBooking.remainingBalance > 0 && (
                  <div className="flex justify-between text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                    <span className="font-bold">Due at Basecamp:</span>
                    <span className="font-extrabold">{formatCurrency(confirmedBooking.remainingBalance)}</span>
                  </div>
                )}
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

                {/* Back to Package Details */}
                <Link
                  to={`/packages/${pkg.id}`}
                  className="w-full sm:w-auto h-12 px-6 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-neutral-700 font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-all cursor-pointer"
                >
                  Return to Package Details
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookingPage;
