import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import {
  X,
  User,
  ChevronDown,
  Clock,
  CreditCard,
  Building2,
  CalendarDays,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ArrowRight,
  Lock,
} from 'lucide-react';

export function PhonePeCheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { API_BASE_URL, logoUrl } = useSettings();

  const merchantOrderId = searchParams.get('merchantOrderId') || '';
  const queryAmount = searchParams.get('amount') || '2000';
  const queryRef = searchParams.get('ref') || 'WE-2026-88192';
  const queryPackage = searchParams.get('package') || 'Weekend Escapes Tour';

  const [paymentData, setPaymentData] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('upi'); // upi, card, netbanking, emi
  const [upiMode, setUpiMode] = useState('qr'); // qr, vpa
  const [vpaId, setVpaId] = useState('');
  const [timeLeft, setTimeLeft] = useState(19 * 60 + 45); // 19 mins 45 secs
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC');

  // Fetch payment & booking info from API if available
  useEffect(() => {
    if (!merchantOrderId) return;
    const fetchInfo = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/payments/phonepe/status/${merchantOrderId}`);
        const data = await res.json();
        if (data.success && data.payment) {
          setPaymentData(data.payment);
          setBookingData(data.booking);
        }
      } catch (err) {
        console.warn('PhonePe checkout fetch info:', err);
      }
    };
    fetchInfo();
  }, [merchantOrderId]);

  // Countdown Timer (19 mins)
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const amount = paymentData?.amount || Number(queryAmount);
  const bookingRef = bookingData?.bookingRef || queryRef;
  const packageName = bookingData?.packageName || queryPackage;

  // Complete Payment Action
  const handleCompletePayment = async (status = 'SUCCESS') => {
    setIsProcessing(true);

    try {
      if (status === 'SUCCESS') {
        // Trigger verification endpoint
        if (merchantOrderId) {
          await fetch(`${API_BASE_URL}/payments/phonepe/status/${merchantOrderId}`).catch(() => {});
        }
        setTimeout(() => {
          setIsProcessing(false);
          navigate(`/payment/phonepe/return?merchantOrderId=${merchantOrderId || `WE_ORD_${Date.now()}`}`);
        }, 1500);
      } else {
        setTimeout(() => {
          setIsProcessing(false);
          navigate(`/payment/phonepe/return?merchantOrderId=${merchantOrderId}&status=FAILED`);
        }, 1200);
      }
    } catch (e) {
      navigate(`/payment/phonepe/return?merchantOrderId=${merchantOrderId}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#EDEDED] flex flex-col items-center justify-center p-3 sm:p-6 font-sans select-none">
      
      {/* ── Top Mock PhonePe Browser Bar Indicator ── */}
      <div className="w-full max-w-4xl flex items-center justify-between text-xs text-slate-500 mb-2 px-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
          <span className="font-mono text-[11px] text-slate-600 truncate max-w-md">
            mercury-t2.phonepe.com/transact/pgv3?token=WE_ORD_{merchantOrderId || Date.now()}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-[11px]">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>256-bit Encrypted PhonePe Session</span>
        </div>
      </div>

      {/* ── Main PhonePe Checkout Card ── */}
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col md:flex-row min-h-[560px]">
        
        {/* ════════════════════════════════════════════════════════════════
            LEFT COLUMN: Merchant Branding & Total Amount & Graphic
            ════════════════════════════════════════════════════════════════ */}
        <div className="w-full md:w-[320px] bg-gradient-to-b from-[#FAF8FC] to-[#F3EEF9] border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-between p-6 relative overflow-hidden flex-shrink-0">
          
          {/* Top Merchant Header */}
          <div className="space-y-5 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF6B16] flex items-center justify-center text-white shadow-sm font-black text-sm">
                  WE
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-sm leading-tight">Weekend Escapes</h2>
                  <p className="text-[11px] text-slate-500 truncate max-w-[150px]">{packageName}</p>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-slate-200/80 flex items-center justify-center text-slate-600">
                <User className="w-4 h-4" />
              </div>
            </div>

            {/* Total Amount Pill */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Total</span>
              <span className="text-slate-400 text-xs">:</span>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black text-slate-900">
                  ₹{Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400 cursor-pointer" />
              </div>
            </div>
          </div>

          {/* Center Graphic: Purple Hill with Luggage, Map, Pin & Tickets (Exact Match) */}
          <div className="my-6 relative flex items-center justify-center">
            <div className="w-48 h-48 rounded-full bg-gradient-to-tr from-[#5f259f] to-[#7B33CE] relative flex items-center justify-center shadow-lg overflow-hidden">
              
              {/* White Road / Curve */}
              <div className="absolute inset-0 bg-transparent border-t-8 border-white/20 rounded-full rotate-45 transform scale-125" />
              
              {/* 3D Suitcase SVG */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-20 bg-white rounded-xl shadow-2xl border border-slate-100 flex flex-col items-center justify-center p-2 relative">
                  <div className="w-6 h-2 bg-slate-400 rounded-t-sm absolute -top-2" />
                  <div className="w-full flex justify-between px-1">
                    <div className="w-1 h-12 bg-slate-200 rounded-full" />
                    <div className="w-1 h-12 bg-slate-200 rounded-full" />
                    <div className="w-1 h-12 bg-slate-200 rounded-full" />
                  </div>
                </div>

                {/* Map with Pin */}
                <div className="w-24 h-12 bg-white/95 rounded-lg shadow-md -mt-4 transform -rotate-6 flex items-center justify-around px-2 border border-slate-200">
                  <span className="w-2 h-2 rounded-full bg-[#FF6B16] animate-ping" />
                  <div className="h-0.5 w-12 bg-purple-400/40 border-t border-dashed border-purple-600" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#5f259f]" />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Powered By PhonePe */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium relative z-10 pt-2 border-t border-slate-200/60">
            <span>Powered by</span>
            <div className="flex items-center gap-1">
              <span className="w-5 h-5 rounded-full bg-[#5f259f] text-white flex items-center justify-center font-bold text-[10px]">
                पे
              </span>
              <span className="font-extrabold text-[#5f259f] text-sm tracking-tight">PhonePe</span>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            RIGHT COLUMN: Payment Options & Interactive QR / Payment Form
            ════════════════════════════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col justify-between p-6 sm:p-7 relative">
          
          {/* Top Bar: Title & Close Button */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h1 className="text-base font-bold text-slate-800">Payment Options</h1>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Body Split: Left List of Payment Methods & Right Details / QR */}
          <div className="py-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-grow">
            
            {/* ── Left Method Selector List (5 Cols) ── */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Section 1: UPI Payment */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  UPI Payment
                </p>

                <div
                  onClick={() => setSelectedMethod('upi')}
                  className={`p-3.5 rounded-2xl cursor-pointer transition-all border flex items-center gap-3 relative ${
                    selectedMethod === 'upi'
                      ? 'bg-[#F4EBFF] border-[#5f259f] shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  {/* Purple Left Indicator Pill */}
                  {selectedMethod === 'upi' && (
                    <div className="absolute left-0 top-2 bottom-2 w-1.5 bg-[#5f259f] rounded-r-full" />
                  )}

                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#5f259f] to-purple-400 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs">
                    पे
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 leading-tight">UPI</p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                      Pay via UPI apps, number or ID
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2: Other Methods */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Other Methods
                </p>

                <div className="space-y-2">
                  {/* Option: Debit/Credit Card */}
                  <div
                    onClick={() => setSelectedMethod('card')}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      selectedMethod === 'card'
                        ? 'bg-[#F4EBFF] border-[#5f259f]'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-4 h-4 text-slate-600" />
                      <span className="text-xs font-semibold text-slate-800">Debit/Credit Card</span>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                      <span className="px-1 py-0.5 bg-slate-100 rounded text-blue-700">VISA</span>
                      <span className="px-1 py-0.5 bg-slate-100 rounded text-orange-600">MC</span>
                      <span>+2</span>
                    </div>
                  </div>

                  {/* Option: Net Banking */}
                  <div
                    onClick={() => setSelectedMethod('netbanking')}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      selectedMethod === 'netbanking'
                        ? 'bg-[#F4EBFF] border-[#5f259f]'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-slate-600" />
                      <span className="text-xs font-semibold text-slate-800">Net Banking</span>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                      <span className="px-1 py-0.5 bg-slate-100 rounded text-red-600">HDFC</span>
                      <span className="px-1 py-0.5 bg-slate-100 rounded text-blue-800">SBI</span>
                      <span>+57</span>
                    </div>
                  </div>

                  {/* Option: EMI */}
                  <div
                    onClick={() => setSelectedMethod('emi')}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      selectedMethod === 'emi'
                        ? 'bg-[#F4EBFF] border-[#5f259f]'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CalendarDays className="w-4 h-4 text-slate-600" />
                      <span className="text-xs font-semibold text-slate-800">EMI</span>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                      <span className="px-1 py-0.5 bg-slate-100 rounded text-blue-700">VISA</span>
                      <span className="px-1 py-0.5 bg-slate-100 rounded text-orange-600">MC</span>
                      <span>+2</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right Content Pane (7 Cols) ── */}
            <div className="lg:col-span-7 bg-[#FAFAFA] rounded-2xl border border-slate-200/80 p-5 flex flex-col items-center justify-center min-h-[340px]">
              
              {/* SUB-VIEW 1: UPI ACTIVE (Exact Reference Match) */}
              {selectedMethod === 'upi' && (
                <div className="w-full flex flex-col items-center text-center space-y-3">
                  <h3 className="text-xs font-bold text-slate-800">Scan via any UPI app</h3>

                  {/* Supported UPI App Logos */}
                  <div className="flex items-center gap-2.5 text-xs text-slate-600">
                    <span className="w-5 h-5 rounded-full bg-[#5f259f] text-white font-bold text-[9px] flex items-center justify-center">
                      पे
                    </span>
                    <span className="font-bold text-[11px] text-blue-600">G Pay</span>
                    <span className="font-bold text-[11px] text-cyan-600">Paytm</span>
                    <span className="font-bold text-[11px] text-orange-600">BHIM</span>
                  </div>

                  {/* Elevated QR Card */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative group cursor-pointer"
                       onClick={() => handleCompletePayment('SUCCESS')}>
                    <div className="relative">
                      {/* Dynamic Live QR code generated for this exact order */}
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=weekendescapes@phonepe&pn=Weekend%20Escapes&am=${amount}&tr=${merchantOrderId || 'ORD100'}&cu=INR`}
                        alt="PhonePe QR Code"
                        className="w-44 h-44 object-contain rounded-lg"
                      />

                      {/* Center PhonePe 'पे' Badge */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-9 h-9 rounded-full bg-white border-2 border-[#5f259f] flex items-center justify-center shadow-md">
                          <span className="text-[#5f259f] font-black text-sm">पे</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expiry Pill */}
                  <div className="bg-slate-200/70 text-slate-600 text-[10px] font-bold px-3 py-1 rounded-full">
                    This QR will expire in {formatTimer(timeLeft)}
                  </div>

                  {/* One-Click Simulator CTA */}
                  <div className="w-full pt-2">
                    <button
                      type="button"
                      onClick={() => handleCompletePayment('SUCCESS')}
                      disabled={isProcessing}
                      className="w-full py-2.5 rounded-xl bg-[#5f259f] hover:bg-[#4e1b85] active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Verifying Payment...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Simulate PhonePe QR Scan & Pay ₹{Number(amount).toLocaleString('en-IN')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* SUB-VIEW 2: CARD PAYMENT */}
              {selectedMethod === 'card' && (
                <div className="w-full space-y-3.5 text-xs text-left">
                  <h3 className="font-bold text-slate-800 text-sm">Enter Card Details</h3>
                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Card Number</label>
                    <input
                      type="text"
                      placeholder="4111 2222 3333 4444"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono focus:border-[#5f259f] outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-medium mb-1">Valid Thru</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono focus:border-[#5f259f] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-medium mb-1">CVV</label>
                      <input
                        type="password"
                        placeholder="•••"
                        maxLength="3"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono focus:border-[#5f259f] outline-none"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCompletePayment('SUCCESS')}
                    disabled={isProcessing}
                    className="w-full py-3 rounded-xl bg-[#5f259f] hover:bg-[#4e1b85] text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                  >
                    Pay ₹{Number(amount).toLocaleString('en-IN')}
                  </button>
                </div>
              )}

              {/* SUB-VIEW 3: NETBANKING */}
              {selectedMethod === 'netbanking' && (
                <div className="w-full space-y-3 text-xs text-left">
                  <h3 className="font-bold text-slate-800 text-sm">Popular Banks</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {['HDFC Bank', 'SBI Bank', 'ICICI Bank', 'Axis Bank'].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setSelectedBank(b)}
                        className={`p-3 rounded-xl border font-bold text-left transition ${
                          selectedBank === b ? 'border-[#5f259f] bg-purple-50 text-[#5f259f]' : 'border-slate-200 bg-white'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCompletePayment('SUCCESS')}
                    disabled={isProcessing}
                    className="w-full py-3 rounded-xl bg-[#5f259f] hover:bg-[#4e1b85] text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer mt-2"
                  >
                    Pay via {selectedBank} (₹{Number(amount).toLocaleString('en-IN')})
                  </button>
                </div>
              )}

              {/* SUB-VIEW 4: EMI */}
              {selectedMethod === 'emi' && (
                <div className="w-full text-center space-y-3 text-xs">
                  <CalendarDays className="w-10 h-10 text-[#5f259f] mx-auto" />
                  <h3 className="font-bold text-slate-800 text-sm">No-Cost & Low-Cost EMI</h3>
                  <p className="text-slate-500 max-w-xs mx-auto">
                    Pay in 3, 6, or 9 easy monthly installments with your eligible credit card.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCompletePayment('SUCCESS')}
                    className="py-2.5 px-6 rounded-xl bg-[#5f259f] text-white font-bold text-xs"
                  >
                    Continue with EMI
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Timeout Notice (Exact Match) */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5 text-amber-700">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>This page will timeout in {formatTimer(timeLeft)} mins</span>
            </div>
            
            <button
              type="button"
              onClick={() => handleCompletePayment('FAIL')}
              className="text-slate-400 hover:text-red-500 transition"
            >
              Cancel Transaction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PhonePeCheckoutPage;
