import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Smartphone,
  CreditCard,
  Building2,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  QrCode,
  ArrowRight,
  Lock,
} from 'lucide-react';

export function PhonePeCheckoutModal({
  isOpen,
  onClose,
  amount,
  merchantOrderId,
  bookingRef,
  packageName,
  onPaymentSuccess,
  onPaymentFailure,
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('upi'); // upi, qr, card, netbanking
  const [upiId, setUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedBank, setSelectedBank] = useState('HDFC');

  const handleSimulatePayment = (status = 'SUCCESS') => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      if (status === 'SUCCESS') {
        onPaymentSuccess({
          merchantOrderId,
          transactionId: `T${Date.now().toString().slice(-8)}`,
          paymentRail: activeTab.toUpperCase(),
        });
      } else {
        onPaymentFailure('Transaction was cancelled or declined by user bank.');
      }
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* PhonePe Header */}
        <div className="bg-[#5f259f] text-white p-4 sm:p-5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
              {/* PhonePe Logo Icon */}
              <span className="text-[#5f259f] font-black text-2xl leading-none">पे</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight">PhonePe</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
                  Standard Checkout
                </span>
              </div>
              <p className="text-xs text-white/80 font-medium">Weekend Escapes Secure Payment</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Amount Bar */}
        <div className="bg-[#f7f2fb] px-5 py-3.5 border-b border-[#ebdcf7] flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Payable Amount</p>
            <p className="text-xl font-black text-[#5f259f]">₹{Number(amount).toLocaleString('en-IN')}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-slate-400 font-mono">Ref: {bookingRef}</p>
            <p className="text-xs font-semibold text-slate-700 truncate max-w-[150px]">{packageName}</p>
          </div>
        </div>

        {/* Body & Payment Modes */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-grow space-y-4 text-slate-800 text-xs">
          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('upi')}
              className={`py-2 rounded-lg font-bold transition flex flex-col items-center gap-1 text-[11px] ${
                activeTab === 'upi' ? 'bg-white text-[#5f259f] shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              UPI
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('qr')}
              className={`py-2 rounded-lg font-bold transition flex flex-col items-center gap-1 text-[11px] ${
                activeTab === 'qr' ? 'bg-white text-[#5f259f] shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <QrCode className="w-4 h-4" />
              QR Code
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('card')}
              className={`py-2 rounded-lg font-bold transition flex flex-col items-center gap-1 text-[11px] ${
                activeTab === 'card' ? 'bg-white text-[#5f259f] shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Cards
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('netbanking')}
              className={`py-2 rounded-lg font-bold transition flex flex-col items-center gap-1 text-[11px] ${
                activeTab === 'netbanking' ? 'bg-white text-[#5f259f] shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              NetBanking
            </button>
          </div>

          {/* TAB 1: UPI ID */}
          {activeTab === 'upi' && (
            <div className="space-y-3 pt-2">
              <label className="block font-bold text-slate-700">Enter your UPI ID / VPA</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. mobile@ybl, user@okhdfcbank"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="flex-grow px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-none focus:border-[#5f259f]"
                />
                <button
                  type="button"
                  onClick={() => setUpiId('traveller@ybl')}
                  className="px-2.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-600"
                >
                  Use Demo
                </button>
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-[11px] text-[#5f259f] flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  Supported UPI apps: <strong>PhonePe, Google Pay, Paytm, BHIM</strong> & all Indian banks.
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: QR CODE */}
          {activeTab === 'qr' && (
            <div className="flex flex-col items-center text-center py-2 space-y-3">
              <div className="p-3 bg-white border-2 border-dashed border-[#5f259f] rounded-2xl shadow-sm">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=weekendescapes@phonepe&pn=Weekend%20Escapes&am=${amount}&tr=${merchantOrderId}&cu=INR`}
                  alt="PhonePe QR Code"
                  className="w-40 h-40 object-contain rounded-lg"
                />
              </div>
              <p className="text-[11px] font-medium text-slate-600">
                Scan with any UPI app to pay <strong>₹{Number(amount).toLocaleString('en-IN')}</strong>
              </p>
            </div>
          )}

          {/* TAB 3: CARDS */}
          {activeTab === 'card' && (
            <div className="space-y-3 pt-1">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Card Number</label>
                <input
                  type="text"
                  readOnly
                  value="4111 •••• •••• 1111 (PhonePe Test Card)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-700 font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expiry</label>
                  <input
                    type="text"
                    readOnly
                    value="12/28"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-700 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">CVV</label>
                  <input
                    type="password"
                    readOnly
                    value="123"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-700 font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NETBANKING */}
          {activeTab === 'netbanking' && (
            <div className="space-y-3 pt-1">
              <label className="block font-bold text-slate-700">Select Bank</label>
              <div className="grid grid-cols-2 gap-2">
                {['HDFC', 'SBI', 'ICICI', 'Axis'].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setSelectedBank(b)}
                    className={`p-3 rounded-xl border text-left font-bold transition flex items-center justify-between ${
                      selectedBank === b ? 'border-[#5f259f] bg-purple-50 text-[#5f259f]' : 'border-slate-200'
                    }`}
                  >
                    <span>{b} Bank</span>
                    {selectedBank === b && <CheckCircle2 className="w-3.5 h-3.5 text-[#5f259f]" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Action Buttons */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 space-y-2.5">
          <button
            type="button"
            onClick={() => handleSimulatePayment('SUCCESS')}
            disabled={isProcessing}
            className="w-full py-3.5 rounded-xl bg-[#5f259f] hover:bg-[#4d1e82] active:scale-[0.99] text-white font-extrabold text-sm uppercase tracking-wider transition shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing with PhonePe...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Pay ₹{Number(amount).toLocaleString('en-IN')} (PhonePe Standard)</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              100% RBI Authorized Gateway
            </span>
            <button
              type="button"
              onClick={() => handleSimulatePayment('FAIL')}
              disabled={isProcessing}
              className="text-red-500 hover:underline"
            >
              Simulate Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PhonePeCheckoutModal;
