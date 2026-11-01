import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  RotateCcw,
  Home,
  FileText,
  MessageCircle,
  ShieldCheck,
  Calendar,
  Users,
  MapPin,
  ChevronRight,
  Printer,
} from 'lucide-react';

export function PaymentReturnPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { API_BASE_URL, whatsappUrl } = useSettings();

  const merchantOrderId = searchParams.get('merchantOrderId') || '';

  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState('VERIFYING'); // 'VERIFYING', 'COMPLETED', 'PENDING', 'FAILED', 'ERROR'
  const [bookingData, setBookingData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const verifyPayment = async () => {
    if (!merchantOrderId) {
      setPaymentStatus('ERROR');
      setErrorMessage('Missing merchant order identification in return URL.');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/payments/phonepe/status/${merchantOrderId}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Payment status query failed');
      }

      setBookingData(data.booking);
      setPaymentData(data.payment);

      if (data.status === 'COMPLETED' || data.payment?.paymentStatus === 'SUCCESS') {
        setPaymentStatus('COMPLETED');
      } else if (data.status === 'FAILED' || data.payment?.paymentStatus === 'FAILED') {
        setPaymentStatus('FAILED');
      } else {
        setPaymentStatus('PENDING');
      }
    } catch (err) {
      console.error('Payment verification error:', err);
      // If server could not be reached, allow retry
      if (retryCount < 2) {
        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
        }, 3000);
      } else {
        setPaymentStatus('PENDING');
        setErrorMessage(err.message || 'Payment verification taking longer than usual.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verifyPayment();
  }, [merchantOrderId, retryCount]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pt-28 sm:pt-36 pb-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-start">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        
        {/* TOP STATUS HEADER BANNER */}
        <div
          className={`p-6 sm:p-8 text-center text-white ${
            paymentStatus === 'COMPLETED'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-700'
              : paymentStatus === 'FAILED' || paymentStatus === 'ERROR'
              ? 'bg-gradient-to-r from-red-600 to-rose-700'
              : 'bg-gradient-to-r from-amber-500 to-orange-600'
          }`}
        >
          {loading || paymentStatus === 'VERIFYING' ? (
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4" />
              <h1 className="text-2xl font-bold">Verifying Payment with PhonePe</h1>
              <p className="text-white/80 text-sm mt-1">Please do not refresh or close this window...</p>
            </div>
          ) : paymentStatus === 'COMPLETED' ? (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <span className="text-xs font-bold tracking-widest uppercase bg-white/20 px-3 py-1 rounded-full mb-2">
                Payment Successful
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold">Booking Confirmed!</h1>
              <p className="text-white/90 text-sm mt-1">
                Your transaction has been securely processed and verified via PhonePe.
              </p>
            </div>
          ) : paymentStatus === 'PENDING' ? (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-10 h-10 text-white animate-pulse" />
              </div>
              <span className="text-xs font-bold tracking-widest uppercase bg-white/20 px-3 py-1 rounded-full mb-2">
                Verification In Progress
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold">Payment Awaiting Confirmation</h1>
              <p className="text-white/90 text-sm mt-1">
                PhonePe is processing your payment. We will update your booking status shortly.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-10 h-10 text-white" />
              </div>
              <span className="text-xs font-bold tracking-widest uppercase bg-white/20 px-3 py-1 rounded-full mb-2">
                Payment Incomplete
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold">Payment Failed or Cancelled</h1>
              <p className="text-white/90 text-sm mt-1">
                {errorMessage || 'The payment transaction could not be completed. No money was deducted.'}
              </p>
            </div>
          )}
        </div>

        {/* BODY CONTENT */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* REFERENCE & DETAILS */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs uppercase font-bold text-slate-400">Order Reference</p>
                <p className="font-mono font-semibold text-slate-800 break-all">{merchantOrderId || 'N/A'}</p>
              </div>
              {bookingData?.bookingRef && (
                <div>
                  <p className="text-xs uppercase font-bold text-slate-400">Booking Ref</p>
                  <p className="font-mono font-bold text-[#FF6B16]">{bookingData.bookingRef}</p>
                </div>
              )}
              {paymentData?.amount && (
                <div>
                  <p className="text-xs uppercase font-bold text-slate-400">Amount Paid</p>
                  <p className="font-extrabold text-emerald-600 text-lg">
                    ₹{Number(paymentData.amount).toLocaleString('en-IN')}
                  </p>
                </div>
              )}
              {paymentData?.paymentType && (
                <div>
                  <p className="text-xs uppercase font-bold text-slate-400">Payment Plan</p>
                  <p className="font-medium text-slate-700 capitalize">
                    {paymentData.paymentType === 'FULL' ? '100% Full Payment' : 'Advance Deposit'}
                  </p>
                </div>
              )}
            </div>

            {bookingData?.packageName && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-xs uppercase font-bold text-slate-400">Package / Trek</p>
                <p className="font-bold text-[#1A384C] text-base">{bookingData.packageName}</p>
                <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {bookingData.friendlyTravelDate || bookingData.travelDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {bookingData.totalPersons} Traveler(s)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* BALANCE NOTICE IF ADVANCE PAYMENT */}
          {paymentStatus === 'COMPLETED' && bookingData?.pricing?.remainingBalance > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900">
                <p className="font-bold text-sm text-amber-900">Remaining Balance: ₹{Number(bookingData.pricing.remainingBalance).toLocaleString('en-IN')}</p>
                <p className="mt-0.5">
                  Your advance deposit has secured your slots! The remaining amount can be cleared before or during basecamp reporting.
                </p>
              </div>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="space-y-3 pt-2">
            {paymentStatus === 'COMPLETED' ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-100 transition shadow-sm text-sm"
                >
                  <Printer className="w-4 h-4" />
                  Print / Save Receipt
                </button>
                <Link
                  to="/"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#FF6B16] hover:bg-[#e05809] font-bold text-white transition shadow-md shadow-orange-500/20 text-sm"
                >
                  <Home className="w-4 h-4" />
                  Back to Weekend Escapes
                </Link>
              </div>
            ) : paymentStatus === 'FAILED' || paymentStatus === 'ERROR' ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#FF6B16] hover:bg-[#e05809] font-bold text-white transition shadow-md shadow-orange-500/20 text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Retry Payment
                </button>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-emerald-500 text-emerald-700 hover:bg-emerald-50 font-bold transition text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Get Help on WhatsApp
                </a>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => verifyPayment()}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1A384C] hover:bg-[#122837] font-bold text-white transition shadow-md text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Re-check Status Now
                </button>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium transition text-sm"
                >
                  Contact Support
                </a>
              </div>
            )}
          </div>

          {/* SECURITY BADGE */}
          <div className="text-center pt-2">
            <p className="inline-flex items-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Official 256-Bit Encrypted PhonePe Checkout Gateway
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentReturnPage;
