import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

export default function AdminResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { API_BASE_URL } = useAuth();
  const { logoUrl } = useSettings();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/auth/admin/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Password reset failed');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/login');
      }, 2500);
    } catch (err) {
      setError(err.message || 'Invalid or expired reset token');
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
            Set New Password
          </h1>
          <p className="mt-1.5 text-neutral-500 text-sm font-medium">
            Create a secure new password for your admin account
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success ? (
          <div className="space-y-6 text-center">
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
              <p className="font-bold text-base">Password Updated Successfully!</p>
              <p className="text-xs text-emerald-700 mt-1">
                Redirecting you to the login page now...
              </p>
            </div>
            <Link
              to="/admin/login"
              className="inline-flex items-center justify-center w-full h-12 bg-[#FF6B16] hover:bg-[#ff7d33] text-white font-bold rounded-xl shadow-md transition-all text-sm"
            >
              Go to Login Immediately
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New password (min 6 characters)"
                  required
                  className="w-full h-13 pl-4 pr-12 rounded-xl border border-neutral-200 bg-white text-neutral-800 placeholder-neutral-400 text-sm sm:text-base focus:border-[#FF6B16] focus:ring-4 focus:ring-[#FF6B16]/10 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                className="w-full h-13 px-4 rounded-xl border border-neutral-200 bg-white text-neutral-800 placeholder-neutral-400 text-sm sm:text-base focus:border-[#FF6B16] focus:ring-4 focus:ring-[#FF6B16]/10 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-13 mt-2 bg-[#FF6B16] hover:bg-[#ff7d33] active:scale-[0.99] text-white font-bold text-base rounded-xl shadow-lg shadow-[#FF6B16]/25 hover:shadow-[#FF6B16]/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                'Reset Password'
              )}
            </button>

            <div className="text-center pt-2">
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
    </div>
  );
}
