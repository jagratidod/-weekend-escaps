import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Search,
  Filter,
  Users,
  CreditCard,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  MoreVertical,
  Eye,
  Trash2,
  Phone,
  Mail,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  Download,
  Printer,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  Calendar,
  MapPin,
  HeartPulse,
  Tag,
  ShieldAlert,
  Save,
  ArrowUpDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { formatCurrency } from '../../utils/helpers';

export default function BookingManager() {
  const { token } = useAuth();
  const { API_BASE_URL, getCustomWhatsAppUrl } = useSettings();

  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
    medicalAlerts: 0,
    totalRevenue: 0,
    totalCollected: 0,
    totalDue: 0,
    totalTravelers: 0,
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('confirmed');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [copiedRef, setCopiedRef] = useState('');
  const [adminNoteText, setAdminNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [amountPaidInput, setAmountPaidInput] = useState('');
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [updatingTripStage, setUpdatingTripStage] = useState(false);

  // Fetch bookings from API
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (search.trim()) params.append('search', search.trim());

      const res = await fetch(`${API_BASE_URL}/bookings?${params.toString()}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [selectedStatus]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBookings();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Copy ref helper
  const handleCopyRef = (ref) => {
    navigator.clipboard.writeText(ref);
    setCopiedRef(ref);
    setTimeout(() => setCopiedRef(''), 2000);
  };

  // Change dynamic trip journey stage (Auto, Booked, Departure, Exploring, Explored)
  const handleTripStatusChange = async (bookingId, newTripStatus) => {
    try {
      setUpdatingTripStage(true);
      const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ tripStatus: newTripStatus }),
      });

      const data = await res.json();
      if (data.success && data.booking) {
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, tripStatus: newTripStatus } : b))
        );
        if (selectedBooking && selectedBooking._id === bookingId) {
          setSelectedBooking({ ...selectedBooking, tripStatus: newTripStatus });
        }
      }
    } catch (err) {
      console.error('Trip status update error:', err);
    } finally {
      setUpdatingTripStage(false);
    }
  };

  // Update amount paid received
  const handleUpdatePaymentReceived = async (bookingId, newAmount) => {
    try {
      setUpdatingPayment(true);
      const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ amountPaid: Number(newAmount) }),
      });

      const data = await res.json();
      if (data.success && data.booking) {
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? data.booking : b))
        );
        if (selectedBooking && selectedBooking._id === bookingId) {
          setSelectedBooking(data.booking);
        }
      }
    } catch (err) {
      console.error('Payment update error:', err);
    } finally {
      setUpdatingPayment(false);
    }
  };

  // Change booking status
  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      setIsUpdatingStatus(true);
      const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ bookingStatus: newStatus }),
      });

      const data = await res.json();
      if (data.success && data.booking) {
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, bookingStatus: newStatus } : b))
        );
        if (selectedBooking && selectedBooking._id === bookingId) {
          setSelectedBooking({ ...selectedBooking, bookingStatus: newStatus });
        }
      }
    } catch (err) {
      console.error('Status update error:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Save admin notes
  const handleSaveNotes = async () => {
    if (!selectedBooking) return;
    try {
      setSavingNote(true);
      const res = await fetch(`${API_BASE_URL}/bookings/${selectedBooking._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ adminNotes: adminNoteText }),
      });

      const data = await res.json();
      if (data.success) {
        setSelectedBooking((prev) => ({ ...prev, adminNotes: adminNoteText }));
        setBookings((prev) =>
          prev.map((b) =>
            b._id === selectedBooking._id ? { ...b, adminNotes: adminNoteText } : b
          )
        );
      }
    } catch (err) {
      console.error('Save notes error:', err);
    } finally {
      setSavingNote(false);
    }
  };

  // Delete booking
  const handleDeleteBooking = async (id, ref) => {
    if (!window.confirm(`Are you sure you want to delete booking ${ref}? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json();
      if (data.success) {
        setBookings((prev) => prev.filter((b) => b._id !== id));
        if (selectedBooking && selectedBooking._id === id) {
          setSelectedBooking(null);
        }
      }
    } catch (err) {
      console.error('Delete booking error:', err);
    }
  };

  // Open details modal
  const handleOpenDetails = (booking) => {
    setSelectedBooking(booking);
    setAdminNoteText(booking.adminNotes || '');
    setAmountPaidInput(booking.pricing?.amountPaidNow ?? booking.paymentDetails?.amountPaid ?? 0);
  };

  // Status badge styling helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3 h-3" />
            <span>Confirmed</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            <span>Payment Pending</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle className="w-3 h-3" />
            <span>Completed</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-neutral-100 text-neutral-600">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header Section ── */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-orange-50 text-[#FF6B16]">
                <CalendarCheck className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-extrabold text-[#1A384C]">
                Booking Management
              </h1>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Track traveler reservations, manage departure manifests, payments, and booking statuses.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchBookings}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* ── 4 Key Metric Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-5 border-t border-neutral-100">
          {/* Card 1: Total Bookings */}
          <div className="bg-[#FAFBFD] p-3.5 sm:p-4 rounded-xl border border-neutral-100">
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              Total Bookings
            </p>
            <p className="text-xl sm:text-2xl font-black text-[#1A384C] mt-1">
              {stats.total}
            </p>
          </div>

          {/* Card 2: Confirmed Bookings */}
          <div className="bg-emerald-50/60 p-3.5 sm:p-4 rounded-xl border border-emerald-100/80">
            <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
              Confirmed
            </p>
            <p className="text-xl sm:text-2xl font-black text-emerald-800 mt-1">
              {stats.confirmed}
            </p>
          </div>

          {/* Card 3: Total Travelers */}
          <div className="bg-orange-50/60 p-3.5 sm:p-4 rounded-xl border border-orange-100/80">
            <p className="text-[11px] font-bold text-[#FF6B16] uppercase tracking-wider">
              Total Travelers
            </p>
            <p className="text-xl sm:text-2xl font-black text-[#FF6B16] mt-1">
              {stats.totalTravelers}
            </p>
          </div>

          {/* Card 4: Revenue Collected */}
          <div className="bg-blue-50/60 p-3.5 sm:p-4 rounded-xl border border-blue-100/80">
            <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
              Collected Deposit
            </p>
            <p className="text-xl sm:text-2xl font-black text-blue-900 mt-1">
              {formatCurrency(stats.totalCollected)}
            </p>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'confirmed', label: `Confirmed (${stats.confirmed})` },
            { id: 'all', label: `All Verified (${stats.total})` },
            { id: 'pending', label: `Pending Payment (${stats.pending})` },
            { id: 'completed', label: `Completed (${stats.completed})` },
            { id: 'cancelled', label: `Cancelled (${stats.cancelled})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedStatus === tab.id
                  ? 'bg-[#1A384C] text-white shadow-xs'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Ref, Name, Phone..."
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-neutral-300 text-xs text-neutral-700 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B16] focus:border-transparent transition-all"
            />
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
          </div>
        </div>
      </div>

      {/* ── Bookings Data Table ── */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-neutral-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#FF6B16] mb-3" />
            <p className="text-xs font-semibold">Loading bookings from database...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-16 text-center text-neutral-500 space-y-2">
            <CalendarCheck className="w-10 h-10 text-neutral-300 mx-auto" />
            <p className="text-sm font-bold text-neutral-700">No bookings found</p>
            <p className="text-xs text-neutral-400">
              {search || selectedStatus !== 'all'
                ? 'Try adjusting your search filters.'
                : 'Customer bookings submitted from the website will appear here in real time.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-neutral-200 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Tour &amp; Date</th>
                  <th className="py-3 px-4">Travelers</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {bookings.map((booking) => {
                  const primary = booking.primaryContact || {};
                  const pricing = booking.pricing || {};

                  return (
                    <tr
                      key={booking._id}
                      className="hover:bg-neutral-50/80 transition-colors group cursor-pointer"
                      onClick={() => handleOpenDetails(booking)}
                    >
                      {/* Booking Ref */}
                      <td className="py-3 px-4 font-mono font-bold text-neutral-900">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#1A384C] font-black">{booking.bookingRef}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyRef(booking.bookingRef);
                            }}
                            className="text-neutral-400 hover:text-neutral-700 p-1 rounded"
                            title="Copy Ref"
                          >
                            {copiedRef === booking.bookingRef ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <span className="text-[10px] text-neutral-400 font-sans block">
                          {new Date(booking.createdAt).toLocaleDateString('en-GB')}
                        </span>
                        {booking.bookingSource === 'offline_registration' && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black bg-purple-50 text-purple-700 border border-purple-200 mt-1">
                            Offline (UTR)
                          </span>
                        )}
                      </td>

                      {/* Customer / Primary Contact */}
                      <td className="py-3 px-4">
                        <p className="font-bold text-neutral-900">{primary.name || 'Anonymous'}</p>
                        <p className="text-[11px] text-neutral-500">{primary.phone}</p>
                        <p className="text-[10px] text-neutral-400 truncate max-w-[160px]">
                          {primary.email}
                        </p>
                      </td>

                      {/* Tour Package & Date */}
                      <td className="py-3 px-4">
                        <p className="font-bold text-[#1A384C]">{booking.packageName}</p>
                        <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 mt-1 flex-wrap">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#FF6B16]" />
                            <span>{booking.friendlyTravelDate || booking.travelDate}</span>
                          </div>
                          {booking.departureCity && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                              <MapPin className="w-2.5 h-2.5 text-sky-600" />
                              {booking.departureCity}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Travelers & Occupancy */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-semibold text-neutral-800">
                          <Users className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{booking.totalPersons} Person(s)</span>
                        </div>
                        {booking.sharingType && (
                          <span className="text-[10px] text-neutral-500 font-medium block truncate max-w-[130px]" title={booking.sharingType}>
                            {booking.sharingType}
                          </span>
                        )}
                      </td>

                      {/* Payment & Balance */}
                      <td className="py-3 px-4">
                        {booking.paymentStatus === 'unpaid' ? (
                          <span className="inline-block text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                            Unpaid (₹0)
                          </span>
                        ) : (
                          <p className="font-black text-[#1A384C]">
                            Paid: {formatCurrency(pricing.amountPaidNow || 0)}
                          </p>
                        )}
                        {booking.paymentDetails?.utrNumber && (
                          <p className="text-[10px] font-mono text-sky-700 font-bold truncate max-w-[140px]" title={`UTR: ${booking.paymentDetails.utrNumber}`}>
                            UTR: {booking.paymentDetails.utrNumber}
                          </p>
                        )}
                        {pricing.remainingBalance > 0 ? (
                          <p className="text-[10px] font-bold text-amber-700">
                            Due: {formatCurrency(pricing.remainingBalance)} (Basecamp)
                          </p>
                        ) : (
                          <p className="text-[10px] font-bold text-emerald-600">Fully Cleared</p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {getStatusBadge(booking.bookingStatus)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {/* Direct WhatsApp link to customer */}
                          {primary.phone && (
                            <a
                              href={
                                getCustomWhatsAppUrl
                                  ? getCustomWhatsAppUrl(
                                      `Hi ${primary.name}, Weekend Escapes regarding your booking ${booking.bookingRef} for ${booking.packageName}.`
                                    )
                                  : `https://wa.me/91${primary.phone.replace(/\D/g, '')}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition"
                              title="Message Customer on WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          )}

                          {/* View details */}
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(booking)}
                            className="p-1.5 rounded-lg text-neutral-500 hover:text-[#1A384C] hover:bg-neutral-100 transition"
                            title="View Full Booking Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteBooking(booking._id, booking.bookingRef)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete Booking"
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

      {/* ══════════════════════════════════════════════════════════════
          BOOKING DETAILS MODAL / DRAWER
          ══════════════════════════════════════════════════════════════ */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="bg-white rounded-3xl border border-neutral-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-[#FAFBFD]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-lg text-[#1A384C]">
                    {selectedBooking.bookingRef}
                  </span>
                  {getStatusBadge(selectedBooking.bookingStatus)}
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Registered on {new Date(selectedBooking.createdAt).toLocaleString('en-GB')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="p-2 rounded-xl text-neutral-500 hover:bg-neutral-100 transition"
                  title="Print manifest voucher"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-neutral-700">
              {/* Tour Overview Banner */}
              <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF6B16]">
                    Expedition Package
                  </span>
                  <h3 className="text-base font-black text-[#1A384C]">
                    {selectedBooking.packageName}
                  </h3>
                  <div className="flex items-center gap-2.5 text-neutral-600 mt-1.5 flex-wrap">
                    <span>Date: <strong>{selectedBooking.friendlyTravelDate || selectedBooking.travelDate}</strong></span>
                    <span>•</span>
                    <span>Travelers: <strong>{selectedBooking.totalPersons} Person(s)</strong></span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200 font-bold">
                      <MapPin className="w-3 h-3 text-sky-600" />
                      Boarding: {selectedBooking.departureCity || 'Ahmedabad'}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200 font-bold">
                      <Tag className="w-3 h-3 text-orange-600" />
                      {selectedBooking.sharingType || 'Standard Sharing'}
                    </span>
                  </div>
                </div>

                {/* Status Switcher Dropdowns */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
                  <div className="flex items-center gap-1.5">
                    <label className="text-[11px] font-bold text-neutral-600">Booking:</label>
                    <select
                      value={selectedBooking.bookingStatus}
                      onChange={(e) => handleStatusChange(selectedBooking._id, e.target.value)}
                      disabled={isUpdatingStatus}
                      className="px-2.5 py-1.5 rounded-xl border border-neutral-300 font-bold bg-white text-xs outline-hidden focus:ring-2 focus:ring-[#FF6B16]"
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <label className="text-[11px] font-bold text-neutral-600">Trek Stage:</label>
                    <select
                      value={selectedBooking.tripStatus || 'AUTO'}
                      onChange={(e) => handleTripStatusChange(selectedBooking._id, e.target.value)}
                      disabled={updatingTripStage}
                      className="px-2.5 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 font-extrabold text-xs outline-hidden focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="AUTO">🤖 Auto (By Date)</option>
                      <option value="BOOKED">1️⃣ Booked</option>
                      <option value="DEPARTURE">2️⃣ Departure</option>
                      <option value="EXPLORING">3️⃣ Exploring</option>
                      <option value="COMPLETED">4️⃣ Explored</option>
                      <option value="CANCELLED">❌ Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              
              {/* Primary Contact Card */}
              <div className="p-4 rounded-xl border border-neutral-200 space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-400">
                  Primary Contact Person
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <p className="text-[10px] text-neutral-400">Name</p>
                    <p className="font-bold text-neutral-900">{selectedBooking.primaryContact?.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-400">Phone</p>
                    <p className="font-bold text-neutral-900">{selectedBooking.primaryContact?.phone}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-400">Email</p>
                    <p className="font-bold text-neutral-900 truncate">{selectedBooking.primaryContact?.email || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Emergency Contact & Payment UTR (For Offline Registrations) */}
              {(selectedBooking.emergencyContact?.name || selectedBooking.paymentDetails?.utrNumber) && (
                <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-800">
                      Emergency Contact &amp; Offline Verification
                    </span>
                    {selectedBooking.paymentDetails?.utrNumber && (
                      <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-sky-200 text-sky-900">
                        UTR: {selectedBooking.paymentDetails.utrNumber} ({selectedBooking.paymentDetails.paymentMethod || 'UPI'})
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                    <div>
                      <p className="text-[10px] text-sky-600 font-medium">Contact Person</p>
                      <p className="font-bold text-neutral-900">{selectedBooking.emergencyContact?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-sky-600 font-medium">Relationship</p>
                      <p className="font-bold text-neutral-900">{selectedBooking.emergencyContact?.relationship || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-sky-600 font-medium">Emergency Phone</p>
                      <p className="font-bold text-neutral-900">{selectedBooking.emergencyContact?.phone || 'N/A'}</p>
                    </div>
                  </div>
                  {selectedBooking.emergencyContact?.healthInfo && (
                    <div className="mt-2 text-xs bg-white p-2.5 rounded-lg border border-sky-100 text-neutral-700">
                      <span className="font-bold text-rose-600">Health Disclosures:</span> {selectedBooking.emergencyContact.healthInfo}
                    </div>
                  )}
                  {selectedBooking.paymentDetails?.remarks && (
                    <div className="text-xs text-neutral-600">
                      <span className="font-semibold">Customer Remarks:</span> {selectedBooking.paymentDetails.remarks}
                    </div>
                  )}
                </div>
              )}

              
              {/* Travelers Manifest */}
              <div className="space-y-3">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-400 block">
                  Travelers Manifest ({selectedBooking.travelers?.length || 0})
                </span>
                <div className="space-y-2">
                  {selectedBooking.travelers?.map((t, idx) => (
                    <div
                      key={t.id || idx}
                      className="p-3 rounded-xl border border-neutral-200/90 bg-[#FAFBFD] space-y-1.5"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#1A384C] text-white text-[10px] font-black flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-neutral-900">{t.name}</span>
                          {idx === 0 && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                              Primary
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-neutral-500 text-[11px] flex-wrap">
                          <span>{t.gender || 'N/A'}</span>
                          <span>•</span>
                          <span>Age: {t.age || 'N/A'}</span>
                          {t.phone && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-neutral-700 font-bold flex items-center gap-1">
                                <Phone className="w-3 h-3 text-neutral-400" />
                                {t.phone}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Medical alert for this traveler */}
                      {t.medical && (
                        <div className="bg-rose-50 border border-rose-200/80 rounded-lg p-2 text-rose-800 text-[11px] flex items-start gap-1.5">
                          <HeartPulse className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-rose-600" />
                          <div>
                            <span className="font-bold">Medical / Health Note:</span> {t.medical}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              
              {/* Pricing & Financial Breakdown */}
              <div className="p-4 rounded-xl border border-neutral-200 space-y-2 bg-[#FAFBFD]">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-400">
                  Financial Breakdown
                </span>
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-neutral-600">
                    <span>Base Package Price (x{selectedBooking.totalPersons}) - {selectedBooking.sharingType || 'Standard'}:</span>
                    <span>{formatCurrency(selectedBooking.pricing?.subtotal || 0)}</span>
                  </div>
                  {selectedBooking.pricing?.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Discount (Coupon: {selectedBooking.pricing?.couponCode || 'PROMO'}):</span>
                      <span>-{formatCurrency(selectedBooking.pricing?.discountAmount)}</span>
                    </div>
                  )}
                  {Number(selectedBooking.pricing?.gstAmount) > 0 && (
                    <div className="flex justify-between text-neutral-600">
                      <span>GST ({selectedBooking.pricing?.gstRate ?? 5}%):</span>
                      <span>{formatCurrency(selectedBooking.pricing?.gstAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-neutral-900 border-t border-neutral-200 pt-1.5">
                    <span>Total Package Payable:</span>
                    <span>{formatCurrency(selectedBooking.pricing?.totalPayable || 0)}</span>
                  </div>
                  <div className="flex justify-between text-[#FF6B16] font-black">
                    <span>Amount Paid Now ({selectedBooking.pricing?.paymentOption === 'advance' ? 'Advance Deposit' : 'Full'}):</span>
                    <span>{formatCurrency(selectedBooking.pricing?.amountPaidNow || 0)}</span>
                  </div>
                  {selectedBooking.pricing?.remainingBalance > 0 && (
                    <div className="flex justify-between text-amber-800 font-bold bg-amber-50 p-2 rounded-lg">
                      <span>Remaining Balance Due at Basecamp:</span>
                      <span>{formatCurrency(selectedBooking.pricing?.remainingBalance)}</span>
                    </div>
                  )}

                  {/* Payment Received Live Editor */}
                  <div className="pt-2 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-[11px] font-extrabold text-neutral-700">
                      Update Payment Received (₹):
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={amountPaidInput}
                        onChange={(e) => setAmountPaidInput(e.target.value)}
                        placeholder="Amount"
                        className="w-28 px-2.5 py-1 rounded-lg border border-neutral-300 text-xs font-bold bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdatePaymentReceived(selectedBooking._id, amountPaidInput)}
                        disabled={updatingPayment}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50"
                      >
                        {updatingPayment ? 'Updating...' : 'Save Payment'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              
              {/* Admin Internal Notes */}
              <div className="space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-400 block">
                  Admin Internal Notes
                </span>
                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    value={adminNoteText}
                    onChange={(e) => setAdminNoteText(e.target.value)}
                    placeholder="Add operational notes (e.g. Forest permit verified, vegetarian meals noted, requested rental poles)..."
                    className="flex-1 p-3 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-[#FF6B16] focus:border-transparent outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    disabled={savingNote}
                    className="px-4 bg-[#1A384C] hover:bg-[#254c66] text-white font-bold rounded-xl flex items-center justify-center transition disabled:opacity-50 cursor-pointer"
                  >
                    {savingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  </button>
                </div>
              </div>

                          </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-neutral-100 flex items-center justify-between bg-neutral-50">
              <button
                type="button"
                onClick={() => handleDeleteBooking(selectedBooking._id, selectedBooking.bookingRef)}
                className="text-rose-600 hover:text-rose-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Booking</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="px-5 py-2 bg-neutral-800 hover:bg-neutral-900 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
