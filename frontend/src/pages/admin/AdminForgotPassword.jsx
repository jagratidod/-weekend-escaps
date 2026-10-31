import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

export default function AdminForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  const { API_BASE_URL } = useAuth();
  const { logoUrl } = useSettings();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessData(null);

    if (!email) {
      setError('Please provide your admin email address');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/auth/admin/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Could not process request');
      }

      setSuccessData(data);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col justify-center items-center px-4 py-12 select-none">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-black/5 border border-neutral-100 p-8 sm:p-12 transition-all">
        {/* Top Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" title="Weekend Escapes">
            <img
              src={logoUrl || '/logo/weekend-escapes-logo.svg'}
              alt="Weekend Escapes"
              className="h-14 sm:h-16 w-auto object-contain hover:scale-105 transition-transform"
            />
          </Link>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
            Forgot Password
          </h1>
          <p className="mt-1.5 text-neutral-500 text-sm font-medium">
            Enter your email to receive password reset instructions
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert & Reset Link */}
        {successData ? (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800 text-sm">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <p className="font-bold">Reset Instructions Ready</p>
                <p className="text-xs text-emerald-700 mt-1">
                  A password reset token has been generated for your account.
                </p>
              </div>
            </div>

            {/* Direct Reset Action Button */}
            {successData.resetToken && (
              <div className="p-4 rounded-2xl bg-[#FF6B16]/5 border border-[#FF6B16]/20 text-center">
                <p className="text-xs text-neutral-600 font-medium mb-3">
                  Click the button below to set your new password:
                </p>
                <Link
                  to={`/admin/reset-password/${successData.resetToken}`}
                  className="w-full inline-flex items-center justify-center gap-2 h-12 bg-[#FF6B16] hover:bg-[#ff7d33] text-white font-bold text-sm rounded-xl shadow-md transition-all"
                >
                  <KeyRound className="w-4 h-4" />
                  Proceed to Reset Password
                </Link>
              </div>
            )}

            <div className="text-center pt-2">
              <Link
                to="/admin/login"
                className="text-sm font-bold text-neutral-600 hover:text-[#FF6B16] transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </div>
        ) : (
          /* Input Form */
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="email"
                id="reset-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                className="w-full h-13 px-4 rounded-xl border border-neutral-200 bg-white text-neutral-800 placeholder-neutral-400 text-sm sm:text-base focus:border-[#FF6B16] focus:ring-4 focus:ring-[#FF6B16]/10 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-13 bg-[#FF6B16] hover:bg-[#ff7d33] active:scale-[0.99] text-white font-bold text-base rounded-xl shadow-lg shadow-[#FF6B16]/25 hover:shadow-[#FF6B16]/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>

            <div className="text-center pt-3">
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-500 hover:text-[#FF6B16] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>

      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-500 hover:text-neutral-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Website
      </Link>
    </div>
  );
}
