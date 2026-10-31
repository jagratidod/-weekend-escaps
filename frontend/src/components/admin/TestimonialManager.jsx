import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Star,
  CheckCircle,
  XCircle,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  Clock,
  Sparkles,
  MapPin,
  Compass,
  AlertTriangle,
  Eye,
  Check,
  X,
  MessageSquare,
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function TestimonialManager() {
  const { token } = useAuth();

  const [testimonials, setTestimonials] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);

  const fetchTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`${API_BASE_URL}/testimonials/admin?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        setTestimonials(data.data || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch admin testimonials:', err);
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter, searchQuery]);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      setActionLoadingId(id);
      const res = await fetch(`${API_BASE_URL}/testimonials/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (data.success) {
        setAlertMessage({
          type: 'success',
          text: `Review marked as ${newStatus.toUpperCase()}${newStatus === 'approved' ? ' (Now Live on UI!)' : ''}`,
        });
        fetchTestimonials();
      } else {
        setAlertMessage({ type: 'error', text: data.message || 'Status update failed' });
      }
    } catch (err) {
      setAlertMessage({ type: 'error', text: 'Error updating testimonial status' });
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setAlertMessage(null), 4000);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete the review by "${name}"?`)) {
      return;
    }

    try {
      setActionLoadingId(id);
      const res = await fetch(`${API_BASE_URL}/testimonials/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        setAlertMessage({ type: 'success', text: 'Testimonial deleted successfully' });
        fetchTestimonials();
      } else {
        setAlertMessage({ type: 'error', text: data.message || 'Delete failed' });
      }
    } catch (err) {
      setAlertMessage({ type: 'error', text: 'Error deleting testimonial' });
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setAlertMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FF6B16]/10 text-[#FF6B16]">
              Moderation
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#1A384C] tracking-tight mt-1">
            Testimonials & Reviews
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Approve user-submitted stories before they appear publicly on the website.
          </p>
        </div>

        <button
          onClick={fetchTestimonials}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* ── Alert Notification ── */}
      {alertMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
            alertMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {alertMessage.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{alertMessage.text}</span>
        </div>
      )}

      {/* ── KPI Metrics Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total Reviews</p>
            <p className="text-2xl sm:text-3xl font-black text-[#1A384C] mt-1">{stats.total}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Card (Highlighted with Alert Pill) */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200 shadow-sm flex items-center justify-between relative overflow-hidden">
          {stats.pending > 0 && (
            <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-bl-lg">
              Needs Action
            </div>
          )}
          <div>
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pending Approval</p>
            <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">{stats.pending}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Approved & Live</p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{stats.approved}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Rejected</p>
            <p className="text-2xl sm:text-3xl font-black text-neutral-500 mt-1">{stats.rejected}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── Filters & Search Bar ── */}
      <div className="bg-white rounded-2xl p-4 border border-neutral-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Status Tab Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-xl w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All', count: stats.total },
            { id: 'pending', label: 'Pending', count: stats.pending, highlight: stats.pending > 0 },
            { id: 'approved', label: 'Approved', count: stats.approved },
            { id: 'rejected', label: 'Rejected', count: stats.rejected },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-white text-[#1A384C] shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  tab.highlight
                    ? 'bg-amber-500 text-white font-extrabold'
                    : 'bg-neutral-200 text-neutral-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search traveler, trek, quote..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-200 focus:border-[#FF6B16] rounded-xl pl-9 pr-4 py-2 text-xs text-neutral-800 placeholder-neutral-400 outline-none transition-colors"
          />
        </div>
      </div>

      {/* ── Testimonials List / Grid ── */}
      {loading ? (
        <div className="py-20 text-center text-neutral-400 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-2 border-neutral-300 border-t-[#FF6B16] rounded-full animate-spin mb-3" />
          <p className="text-xs font-medium">Loading testimonials from MongoDB Atlas...</p>
        </div>
      ) : testimonials.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-neutral-200/80 shadow-sm">
          <MessageSquare className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-neutral-700">No Testimonials Found</h3>
          <p className="text-xs text-neutral-400 mt-1">
            {statusFilter === 'pending'
              ? 'No pending reviews waiting for approval. Good job!'
              : 'Try adjusting your search or filters.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testimonials.map((item) => {
            const isActionLoading = actionLoadingId === item._id;

            return (
              <div
                key={item._id}
                className={`bg-white rounded-2xl p-5 border shadow-sm transition-all flex flex-col justify-between ${
                  item.status === 'pending'
                    ? 'border-amber-300 ring-1 ring-amber-200/50'
                    : item.status === 'approved'
                    ? 'border-neutral-200/80 hover:border-emerald-300'
                    : 'border-red-200 bg-neutral-50/50'
                }`}
              >
                <div>
                  {/* Top Header of Card: Status Badge + Date */}
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    {/* Status Pill */}
                    {item.status === 'pending' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                        <Clock className="w-3 h-3" />
                        <span>Pending Approval</span>
                      </span>
                    )}
                    {item.status === 'approved' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle className="w-3 h-3" />
                        <span>Approved (Live)</span>
                      </span>
                    )}
                    {item.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-red-100 text-red-800 border border-red-200">
                        <XCircle className="w-3 h-3" />
                        <span>Rejected</span>
                      </span>
                    )}

                    {/* Date */}
                    <span className="text-[11px] text-neutral-400 font-medium">
                      {new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Main Traveler Info Row */}
                  <div className="flex items-start gap-3.5 mb-3.5">
                    {/* Traveler Photo */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-20 rounded-xl object-cover shrink-0 border border-neutral-200 bg-neutral-100 shadow-sm"
                      onError={(e) => {
                        e.target.src = '/images/testimonials/priya-sharma-card.png';
                      }}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-[#1A384C] truncate">{item.name}</h4>
                        {item.badge && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FF6B16]/10 text-[#FF6B16] shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-neutral-600 font-semibold mt-0.5 truncate">
                        <Compass className="w-3 h-3 text-[#FF6B16] shrink-0" />
                        <span className="truncate">{item.trip}</span>
                      </div>

                      {item.location && (
                        <div className="flex items-center gap-1 text-[10px] text-neutral-400 mt-0.5 truncate">
                          <MapPin className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{item.location}</span>
                        </div>
                      )}

                      {/* Stars */}
                      <div className="flex items-center gap-0.5 mt-1.5">
                        {[...Array(item.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-[#FF6B16] text-[#FF6B16]" />
                        ))}
                        <span className="text-[10px] font-bold text-neutral-500 ml-1">
                          {item.rating}/5
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quote / Review Text */}
                  <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100 mb-4">
                    <p className="text-xs text-neutral-700 italic leading-relaxed line-clamp-3">
                      "{item.quote}"
                    </p>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-neutral-100 gap-2">
                  <div className="flex items-center gap-2">
                    {/* Approve Action */}
                    {item.status !== 'approved' && (
                      <button
                        type="button"
                        disabled={isActionLoading}
                        onClick={() => handleStatusChange(item._id, 'approved')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Approve</span>
                      </button>
                    )}

                    {/* Reject Action */}
                    {item.status !== 'rejected' && (
                      <button
                        type="button"
                        disabled={isActionLoading}
                        onClick={() => handleStatusChange(item._id, 'rejected')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-red-50 text-neutral-700 hover:text-red-600 border border-neutral-200 hover:border-red-200 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                      >
                        <X className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>{item.status === 'approved' ? 'Hide / Reject' : 'Reject'}</span>
                      </button>
                    )}

                    {/* Reset to Pending (if needed) */}
                    {item.status !== 'pending' && (
                      <button
                        type="button"
                        disabled={isActionLoading}
                        onClick={() => handleStatusChange(item._id, 'pending')}
                        className="text-[11px] text-neutral-400 hover:text-neutral-700 font-medium underline cursor-pointer ml-1"
                      >
                        Mark Pending
                      </button>
                    )}
                  </div>

                  {/* Delete Action */}
                  <button
                    type="button"
                    disabled={isActionLoading}
                    onClick={() => handleDelete(item._id, item.name)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
