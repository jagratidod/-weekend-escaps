import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { formatCurrency } from '../../utils/helpers';
import {
  Tag,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Percent,
  DollarSign,
  Users,
  Calendar,
  AlertCircle,
  Copy,
  Check,
  Edit2,
  Trash2,
  Sparkles,
  ShieldCheck,
  Filter,
  Phone,
  UserCheck,
} from 'lucide-react';

export default function CouponManager() {
  const { token } = useAuth();
  const { API_BASE_URL } = useSettings();

  const [coupons, setCoupons] = useState([]);
  const [stats, setStats] = useState({ totalCoupons: 0, activeCoupons: 0, totalRedemptions: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'percentage', 'flat', 'per_person'
  const [audienceFilter, setAudienceFilter] = useState('all'); // 'all', 'all_users', 'specific_users'

  // Toast notification state
  const [toast, setToast] = useState(null);
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Copied code feedback
  const [copiedCode, setCopiedCode] = useState(null);
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Modal State (Create / Edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    maxDiscount: '',
    minBookingAmount: '',
    expiryDate: '',
    usageLimit: '',
    targetType: 'all', // 'all' | 'specific_users'
    assignedPhones: '',
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState({});

  // Delete Confirm Modal
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Fetch Coupons
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/coupons`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to load coupons');
      }
      setCoupons(data.coupons || []);
      setStats(data.stats || { totalCoupons: 0, activeCoupons: 0, totalRedemptions: 0 });
    } catch (err) {
      console.error('Fetch coupons error:', err);
      showToast('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCoupons();
    }
  }, [token]);

  // Handle Form Change
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === 'code' ? value.toUpperCase().replace(/[^A-Z0-9_-]/g, '') : value,
    }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      title: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      maxDiscount: '',
      minBookingAmount: '',
      expiryDate: '',
      usageLimit: '',
      targetType: 'all',
      assignedPhones: '',
      isActive: true,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      title: coupon.title || '',
      description: coupon.description || '',
      discountType: coupon.discountType || 'percentage',
      discountValue: coupon.discountValue !== undefined ? String(coupon.discountValue) : '',
      maxDiscount: coupon.maxDiscount ? String(coupon.maxDiscount) : '',
      minBookingAmount: coupon.minBookingAmount ? String(coupon.minBookingAmount) : '',
      expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '',
      usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : '',
      targetType: coupon.targetType || 'all',
      assignedPhones: Array.isArray(coupon.assignedPhones) ? coupon.assignedPhones.join(', ') : '',
      isActive: coupon.isActive !== undefined ? coupon.isActive : true,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  // Validate & Save Form (Create or Update)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!formData.code || formData.code.trim().length < 3) {
      errors.code = 'Code must be at least 3 characters.';
    }

    const val = Number(formData.discountValue);
    if (isNaN(val) || val <= 0) {
      errors.discountValue = 'Please enter a positive discount value.';
    } else if (formData.discountType === 'percentage' && val > 100) {
      errors.discountValue = 'Percentage cannot exceed 100%.';
    }

    if (formData.targetType === 'specific_users') {
      const phones = formData.assignedPhones
        .split(',')
        .map((p) => p.replace(/\D/g, '').slice(-10))
        .filter((p) => p.length === 10);
      if (phones.length === 0) {
        errors.assignedPhones = 'Please enter at least one valid 10-digit mobile number.';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
        minBookingAmount: formData.minBookingAmount ? Number(formData.minBookingAmount) : 0,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        targetType: formData.targetType,
        assignedPhones: formData.assignedPhones,
        isActive: Boolean(formData.isActive),
      };

      const url = editingCoupon
        ? `${API_BASE_URL}/coupons/${editingCoupon._id}`
        : `${API_BASE_URL}/coupons`;
      const method = editingCoupon ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Operation failed');
      }

      showToast('success', data.message || 'Coupon saved successfully');
      setModalOpen(false);
      fetchCoupons();
    } catch (err) {
      console.error('Save coupon error:', err);
      showToast('error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Coupon Active Status
  const handleToggleStatus = async (coupon) => {
    try {
      const res = await fetch(`${API_BASE_URL}/coupons/${coupon._id}/toggle`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to toggle status');
      }

      setCoupons((prev) =>
        prev.map((c) => (c._id === coupon._id ? { ...c, isActive: data.isActive } : c))
      );
      setStats((prev) => ({
        ...prev,
        activeCoupons: data.isActive ? prev.activeCoupons + 1 : Math.max(0, prev.activeCoupons - 1),
      }));
      showToast('success', data.message);
    } catch (err) {
      console.error('Toggle status error:', err);
      showToast('error', err.message);
    }
  };

  // Delete Coupon
  const handleDeleteCoupon = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/coupons/${deleteTarget._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete coupon');
      }

      showToast('success', `Coupon "${deleteTarget.code}" deleted.`);
      setDeleteTarget(null);
      fetchCoupons();
    } catch (err) {
      console.error('Delete coupon error:', err);
      showToast('error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Seed Default Coupons
  const handleSeedDefaults = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/coupons/seed`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to seed default coupons');
      }
      showToast('success', 'Default coupons (EARLYBIRD, WEEKEND10, ESCAPE500) verified/seeded.');
      fetchCoupons();
    } catch (err) {
      console.error('Seed error:', err);
      showToast('error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered Coupons
  const filteredCoupons = useMemo(() => {
    return coupons.filter((coupon) => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const phonesStr = Array.isArray(coupon.assignedPhones)
        ? coupon.assignedPhones.join(' ')
        : '';
      const matchQuery =
        !q ||
        coupon.code.toLowerCase().includes(q) ||
        (coupon.title && coupon.title.toLowerCase().includes(q)) ||
        (coupon.description && coupon.description.toLowerCase().includes(q)) ||
        phonesStr.includes(q);

      // Status
      const matchStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
          ? coupon.isActive
          : !coupon.isActive;

      // Type
      const matchType = typeFilter === 'all' ? true : coupon.discountType === typeFilter;

      // Audience
      const matchAudience =
        audienceFilter === 'all'
          ? true
          : audienceFilter === 'specific_users'
          ? coupon.targetType === 'specific_users'
          : coupon.targetType !== 'specific_users';

      return matchQuery && matchStatus && matchType && matchAudience;
    });
  }, [coupons, searchQuery, statusFilter, typeFilter, audienceFilter]);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold transition-all transform animate-in slide-in-from-bottom duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white shadow-emerald-600/20'
              : 'bg-rose-600 text-white shadow-rose-600/20'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#FFF2EB] text-[#FF6B16] flex items-center justify-center font-bold">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                Coupons & Promo Codes
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                Manage public and customer-specific coupons. Assigned phone numbers get automatic offer popups!
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={fetchCoupons}
            disabled={loading}
            className="p-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh coupons"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleSeedDefaults}
            disabled={actionLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-neutral-200 hover:border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50 text-xs font-bold transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Restore Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF6B16] hover:bg-[#e05a0d] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#FF6B16]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Coupon</span>
          </button>
        </div>
      </div>

      {/* ── Summary Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Coupons */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-700">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Total Coupons
            </div>
            <div className="text-2xl font-black text-neutral-900 mt-0.5">{stats.totalCoupons}</div>
          </div>
        </div>

        {/* Active Coupons */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-600/80">
              Active Offers
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-0.5">{stats.activeCoupons}</div>
          </div>
        </div>

        {/* Total Redemptions */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FFF2EB] text-[#FF6B16] flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#FF6B16]/80">
              Total Redemptions
            </div>
            <div className="text-2xl font-black text-neutral-900 mt-0.5">
              {stats.totalRedemptions}
            </div>
          </div>
        </div>
      </div>

      {/* ── Filters & Search ── */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search code, title, or phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 text-xs rounded-xl border border-neutral-200 focus:border-[#FF6B16] focus:ring-2 focus:ring-[#FF6B16]/10 outline-none transition-all"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-neutral-900 shadow-xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'active'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('inactive')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'inactive'
                  ? 'bg-neutral-800 text-white shadow-xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Inactive
            </button>
          </div>

          {/* Audience Filter */}
          <select
            value={audienceFilter}
            onChange={(e) => setAudienceFilter(e.target.value)}
            className="h-10 px-3 text-xs font-semibold rounded-xl border border-neutral-200 bg-white text-neutral-700 outline-none focus:border-[#FF6B16] cursor-pointer"
          >
            <option value="all">All Audiences</option>
            <option value="all_users">🌐 Public (All)</option>
            <option value="specific_users">📱 VIP / Phone Numbers</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 px-3 text-xs font-semibold rounded-xl border border-neutral-200 bg-white text-neutral-700 outline-none focus:border-[#FF6B16] cursor-pointer"
          >
            <option value="all">All Discount Types</option>
            <option value="percentage">Percentage (%)</option>
            <option value="flat">Flat Discount (₹)</option>
            <option value="per_person">Per Person (₹)</option>
          </select>
        </div>
      </div>

      {/* ── Coupons List / Table ── */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 text-[#FF6B16] animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-neutral-600">Loading coupons database...</p>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="py-20 text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-3">
              <Tag className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-neutral-800">No coupons found</h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters or search keywords.'
                : 'Click "+ Create Coupon" above or restore the defaults to start.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50/70 border-b border-neutral-200/80 text-[11px] font-black uppercase tracking-wider text-neutral-500">
                  <th className="py-3.5 px-4 sm:px-6">Coupon Code</th>
                  <th className="py-3.5 px-4">Offer / Title</th>
                  <th className="py-3.5 px-4">Audience</th>
                  <th className="py-3.5 px-4">Discount</th>
                  <th className="py-3.5 px-4">Min. Cart</th>
                  <th className="py-3.5 px-4">Usage</th>
                  <th className="py-3.5 px-4">Validity</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {filteredCoupons.map((coupon) => {
                  const isExpired = coupon.expiryDate && new Date(coupon.expiryDate) < new Date();
                  const isLimitReached =
                    coupon.usageLimit && coupon.usedCount >= coupon.usageLimit;

                  return (
                    <tr
                      key={coupon._id}
                      className="hover:bg-neutral-50/50 transition-colors group"
                    >
                      {/* Code Chip */}
                      <td className="py-4 px-4 sm:px-6 font-mono">
                        <div className="inline-flex items-center gap-1.5 bg-[#FFF2EB] border border-[#FF6B16]/20 px-2.5 py-1.5 rounded-lg">
                          <span className="font-black text-[#FF6B16] text-xs tracking-wider">
                            {coupon.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(coupon.code)}
                            className="p-1 hover:bg-[#FF6B16]/10 rounded text-neutral-400 hover:text-[#FF6B16] transition-colors cursor-pointer"
                            title="Copy code"
                          >
                            {copiedCode === coupon.code ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Title & Description */}
                      <td className="py-4 px-4 max-w-xs">
                        <div className="font-bold text-neutral-900 line-clamp-1">
                          {coupon.title || coupon.code}
                        </div>
                        {coupon.description && (
                          <div className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                            {coupon.description}
                          </div>
                        )}
                      </td>

                      {/* Audience Badge */}
                      <td className="py-4 px-4">
                        {coupon.targetType === 'specific_users' ? (
                          <div
                            className="inline-flex items-center gap-1 text-purple-700 bg-purple-50 border border-purple-200/80 px-2.5 py-1 rounded-lg font-bold text-[11px]"
                            title={
                              coupon.assignedPhones?.length > 0
                                ? `Assigned to: ${coupon.assignedPhones.join(', ')}`
                                : 'Assigned numbers'
                            }
                          >
                            <Phone className="w-3 h-3 text-purple-600" />
                            <span>
                              VIP ({coupon.assignedPhones?.length || 0})
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-lg font-semibold text-[11px]">
                            🌐 All Travelers
                          </span>
                        )}
                      </td>

                      {/* Discount Value */}
                      <td className="py-4 px-4 font-semibold">
                        {coupon.discountType === 'percentage' && (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold text-xs">
                            <Percent className="w-3 h-3" /> {coupon.discountValue}% OFF
                          </span>
                        )}
                        {coupon.discountType === 'flat' && (
                          <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md font-bold text-xs">
                            Flat {formatCurrency(coupon.discountValue)} OFF
                          </span>
                        )}
                        {coupon.discountType === 'per_person' && (
                          <span className="inline-flex items-center gap-1 text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md font-bold text-xs">
                            {formatCurrency(coupon.discountValue)} / Person
                          </span>
                        )}
                        {coupon.maxDiscount > 0 && (
                          <div className="text-[10px] text-neutral-400 mt-0.5">
                            Max Cap: {formatCurrency(coupon.maxDiscount)}
                          </div>
                        )}
                      </td>

                      {/* Min Booking Cart Amount */}
                      <td className="py-4 px-4 font-semibold text-neutral-700">
                        {coupon.minBookingAmount > 0 ? (
                          formatCurrency(coupon.minBookingAmount)
                        ) : (
                          <span className="text-neutral-400 text-[11px]">No min</span>
                        )}
                      </td>

                      {/* Usage */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-neutral-800">
                          {coupon.usedCount || 0}{' '}
                          <span className="font-normal text-neutral-400 text-[11px]">
                            {coupon.usageLimit ? `/ ${coupon.usageLimit}` : 'used'}
                          </span>
                        </div>
                        {isLimitReached && (
                          <span className="text-[10px] font-bold text-rose-600 block mt-0.5">
                            Limit reached
                          </span>
                        )}
                      </td>

                      {/* Validity / Expiry */}
                      <td className="py-4 px-4">
                        {coupon.expiryDate ? (
                          <div>
                            <span
                              className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                                isExpired ? 'text-rose-600' : 'text-neutral-600'
                              }`}
                            >
                              <Calendar className="w-3 h-3 text-neutral-400" />
                              {new Date(coupon.expiryDate).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                            {isExpired && (
                              <span className="text-[10px] font-bold text-rose-600 block">
                                Expired
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-neutral-400 text-[11px]">Lifetime</span>
                        )}
                      </td>

                      {/* Active Status Switch */}
                      <td className="py-4 px-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={coupon.isActive}
                            onChange={() => handleToggleStatus(coupon)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                          <span className="ml-2 text-[11px] font-bold text-neutral-600">
                            {coupon.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </label>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(coupon)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-colors cursor-pointer"
                            title="Edit coupon"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(coupon)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete coupon"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Create / Edit Coupon Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-neutral-100 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFF2EB] text-[#FF6B16] flex items-center justify-center font-bold">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-neutral-900">
                    {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create New Coupon'}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Configure discount rules, customer audience, and usage limits.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              {/* Row 1: Code & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-neutral-700 mb-1.5">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SUMMER2026"
                    value={formData.code}
                    onChange={(e) => handleInputChange('code', e.target.value)}
                    className={`w-full h-11 px-3.5 rounded-xl border text-xs sm:text-sm font-mono uppercase outline-none transition-all ${
                      formErrors.code
                        ? 'border-rose-400 focus:ring-2 focus:ring-rose-400/20'
                        : 'border-neutral-200 focus:border-[#FF6B16] focus:ring-2 focus:ring-[#FF6B16]/10'
                    }`}
                  />
                  {formErrors.code && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1">
                      {formErrors.code}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-neutral-700 mb-1.5">
                    Offer Title / Headline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Early Bird Trekker Discount"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-neutral-200 text-xs sm:text-sm outline-none focus:border-[#FF6B16] focus:ring-2 focus:ring-[#FF6B16]/10 transition-all"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-neutral-700 mb-1.5">
                  Description / Terms (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Valid on all Uttarakhand departures till end of month"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-neutral-200 text-xs sm:text-sm outline-none focus:border-[#FF6B16] focus:ring-2 focus:ring-[#FF6B16]/10 transition-all"
                />
              </div>

              {/* ── Target Audience Section ── */}
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-3">
                <label className="block text-xs font-black uppercase tracking-wider text-neutral-800">
                  Target Customer Audience *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleInputChange('targetType', 'all')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      formData.targetType === 'all'
                        ? 'bg-white border-[#FF6B16] shadow-xs'
                        : 'bg-white/60 border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          formData.targetType === 'all'
                            ? 'border-[#FF6B16] bg-[#FF6B16]'
                            : 'border-neutral-300'
                        }`}
                      >
                        {formData.targetType === 'all' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="text-xs font-bold text-neutral-900">
                        All Travelers (Public)
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-1 pl-5.5">
                      Visible & usable by any explorer on eligible bookings.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInputChange('targetType', 'specific_users')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      formData.targetType === 'specific_users'
                        ? 'bg-white border-[#FF6B16] shadow-xs'
                        : 'bg-white/60 border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          formData.targetType === 'specific_users'
                            ? 'border-[#FF6B16] bg-[#FF6B16]'
                            : 'border-neutral-300'
                        }`}
                      >
                        {formData.targetType === 'specific_users' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="text-xs font-bold text-neutral-900">
                        Specific Phone Numbers (VIP)
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-1 pl-5.5">
                      Auto-appears when customer enters matching mobile number.
                    </p>
                  </button>
                </div>

                {formData.targetType === 'specific_users' && (
                  <div className="pt-2">
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                      Customer 10-Digit Mobile Number(s) *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 9876543210, 9123456789"
                      value={formData.assignedPhones}
                      onChange={(e) => handleInputChange('assignedPhones', e.target.value)}
                      className={`w-full h-11 px-3.5 rounded-xl border text-xs sm:text-sm font-mono outline-none transition-all ${
                        formErrors.assignedPhones
                          ? 'border-rose-400 focus:ring-2 focus:ring-rose-400/20'
                          : 'border-neutral-200 focus:border-[#FF6B16] focus:ring-2 focus:ring-[#FF6B16]/10'
                      }`}
                    />
                    {formErrors.assignedPhones && (
                      <p className="text-[11px] text-rose-600 font-semibold mt-1">
                        {formErrors.assignedPhones}
                      </p>
                    )}
                    <p className="text-[10px] text-neutral-500 mt-1">
                      💡 Separate multiple numbers with commas. When this traveler inputs their number during checkout, this exclusive offer pops up automatically!
                    </p>
                  </div>
                )}
              </div>

              {/* Row 2: Discount Type & Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-neutral-700 mb-1.5">
                    Discount Type *
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => handleInputChange('discountType', e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-neutral-200 bg-white text-xs sm:text-sm font-semibold outline-none focus:border-[#FF6B16] focus:ring-2 focus:ring-[#FF6B16]/10 cursor-pointer"
                  >
                    <option value="percentage">Percentage (%) Discount</option>
                    <option value="flat">Flat Amount (₹) Off</option>
                    <option value="per_person">Per Person (₹) Discount</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-neutral-700 mb-1.5">
                    {formData.discountType === 'percentage'
                      ? 'Discount Percentage (%) *'
                      : formData.discountType === 'flat'
                      ? 'Flat Discount Amount (₹) *'
                      : 'Discount Per Person (₹) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder={
                      formData.discountType === 'percentage'
                        ? '10'
                        : formData.discountType === 'flat'
                        ? '500'
                        : '1000'
                    }
                    value={formData.discountValue}
                    onChange={(e) => handleInputChange('discountValue', e.target.value)}
                    className={`w-full h-11 px-3.5 rounded-xl border text-xs sm:text-sm font-bold outline-none transition-all ${
                      formErrors.discountValue
                        ? 'border-rose-400 focus:ring-2 focus:ring-rose-400/20'
                        : 'border-neutral-200 focus:border-[#FF6B16] focus:ring-2 focus:ring-[#FF6B16]/10'
                    }`}
                  />
                  {formErrors.discountValue && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1">
                      {formErrors.discountValue}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 3: Max Cap & Min Cart */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-neutral-700 mb-1.5">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 3000 (leave blank for no cap)"
                    value={formData.maxDiscount}
                    onChange={(e) => handleInputChange('maxDiscount', e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-neutral-200 text-xs sm:text-sm outline-none focus:border-[#FF6B16] focus:ring-2 focus:ring-[#FF6B16]/10"
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">
                    Maximum discount allowed when percentage or per person is selected.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-neutral-700 mb-1.5">
                    Min. Booking Subtotal (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 5000 (0 for no minimum)"
                    value={formData.minBookingAmount}
                    onChange={(e) => handleInputChange('minBookingAmount', e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-neutral-200 text-xs sm:text-sm outline-none focus:border-[#FF6B16] focus:ring-2 focus:ring-[#FF6B16]/10"
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">
                    Coupon won't apply if booking subtotal is less than this.
                  </p>
                </div>
              </div>

              {/* Row 4: Expiry Date & Usage Limit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-neutral-700 mb-1.5">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-neutral-200 text-xs sm:text-sm outline-none focus:border-[#FF6B16] focus:ring-2 focus:ring-[#FF6B16]/10"
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">Leave empty for no expiry.</p>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-neutral-700 mb-1.5">
                    Total Usage Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 100 (blank for unlimited)"
                    value={formData.usageLimit}
                    onChange={(e) => handleInputChange('usageLimit', e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-neutral-200 text-xs sm:text-sm outline-none focus:border-[#FF6B16] focus:ring-2 focus:ring-[#FF6B16]/10"
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">
                    Max number of bookings that can use this coupon.
                  </p>
                </div>
              </div>

              {/* Active Toggle Checkbox */}
              <div className="pt-2">
                <label className="inline-flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    className="w-4 h-4 text-[#FF6B16] rounded border-neutral-300 focus:ring-[#FF6B16]"
                  />
                  <span className="text-xs font-bold text-neutral-800">
                    Coupon is currently Active and usable by customers
                  </span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 font-bold text-xs hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-xl bg-[#FF6B16] hover:bg-[#e05a0d] text-white font-bold text-xs shadow-md shadow-[#FF6B16]/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {actionLoading
                    ? 'Saving...'
                    : editingCoupon
                    ? 'Update Coupon'
                    : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-center text-neutral-900">Delete Coupon?</h3>
            <p className="text-xs text-center text-neutral-500 mt-1">
              Are you sure you want to permanently delete coupon{' '}
              <strong className="text-neutral-800 font-mono">"{deleteTarget.code}"</strong>?
              Past bookings with this coupon will still retain their discount history.
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-5 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 font-bold text-xs hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleDeleteCoupon}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
