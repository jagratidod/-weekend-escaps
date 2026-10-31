import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { logoUrl } = useSettings();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col justify-center items-center px-4 py-12 select-none">
      {/* ── Center Login Card ── */}
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

        {/* Header Texts (from reference) */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
            Admin Login
          </h1>
          <p className="mt-1.5 text-neutral-500 text-sm font-medium">
            Enter your details to manage the platform
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div>
            <div className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                className="w-full h-13 px-4 rounded-xl border border-neutral-200 bg-white text-neutral-800 placeholder-neutral-400 text-sm sm:text-base focus:border-[#FF6B16] focus:ring-4 focus:ring-[#FF6B16]/10 outline-none transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full h-13 pl-4 pr-12 rounded-xl border border-neutral-200 bg-white text-neutral-800 placeholder-neutral-400 text-sm sm:text-base focus:border-[#FF6B16] focus:ring-4 focus:ring-[#FF6B16]/10 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end pt-1">
            <Link
              to="/admin/forgot-password"
              className="text-xs sm:text-sm font-semibold text-neutral-500 hover:text-[#FF6B16] transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button (Vibrant Orange from reference) */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-13 mt-2 bg-[#FF6B16] hover:bg-[#ff7d33] active:scale-[0.99] text-white font-bold text-base rounded-xl shadow-lg shadow-[#FF6B16]/25 hover:shadow-[#FF6B16]/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Logging in...</span>
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        {/* Demo Credentials Helper Pill */}
        <div className="mt-8 pt-6 border-t border-neutral-100 text-center">
          <p className="text-xs text-neutral-400 font-medium">
            Default credentials:{' '}
            <span className="text-neutral-600 font-semibold">admin@weekendescapes.com</span> /{' '}
            <span className="text-neutral-600 font-semibold">Admin@12345</span>
          </p>
        </div>
      </div>

      {/* Back to Website link */}
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
