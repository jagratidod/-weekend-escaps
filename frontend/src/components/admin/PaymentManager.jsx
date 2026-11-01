import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import {
  CreditCard,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Eye,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Code2,
  X,
  FileText,
} from 'lucide-react';

export function PaymentManager() {
  const { token } = useAuth();
  const { API_BASE_URL } = useSettings();

  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalSuccess: 0,
    totalPending: 0,
    totalRefunded: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals state
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('Customer cancellation');
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (type, text) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        search: searchTerm,
        status: statusFilter,
        page: page.toString(),
        limit: '15',
      });

      const res = await fetch(`${API_BASE_URL}/payments/admin/all?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch payments');
      }

      setPayments(data.payments || []);
      setTotalPages(data.pages || 1);
      setTotalCount(data.total || 0);
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Fetch payments error:', err);
      showToast('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter, page, token]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPayments();
  };

  // Re-verify status with PhonePe
  const handleVerifyStatus = async (payment) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/payments/phonepe/status/${payment.merchantOrderId}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Verification inquiry failed');
      }

      showToast('success', `Status updated to: ${data.status}`);
      fetchPayments();
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Open refund dialog
  const openRefundDialog = (payment) => {
    setSelectedPayment(payment);
    setRefundAmount(payment.amount.toString());
    setShowRefundModal(true);
  };

  // Execute refund
  const handleProcessRefund = async (e) => {
    e.preventDefault();
    if (!selectedPayment) return;

    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/payments/phonepe/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentId: selectedPayment._id,
          amount: Number(refundAmount),
          reason: refundReason,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Refund processing failed');
      }

      showToast('success', data.message || 'Refund successfully processed');
      setShowRefundModal(false);
      fetchPayments();
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-semibold flex items-center gap-2 transition-all ${
            toastMessage.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
          }`}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-800">PhonePe Gateway Ledger</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Live payment tracking, PhonePe order reconciliation & instant refund processor
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchPayments}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Analytics Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Collected</span>
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">
            ₹{Number(stats.totalRevenue || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-500 mt-1">Verified Gateway Settlements</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Success Orders</span>
            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-800 mt-2">{stats.totalSuccess || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Confirmed Transactions</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending</span>
            <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">{stats.totalPending || 0}</p>
          <p className="text-xs text-slate-500 mt-1">In Process / Awaiting</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Refunded Total</span>
            <span className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-rose-600 mt-2">
            ₹{Number(stats.totalRefunded || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-500 mt-1">Processed Refunds</p>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filters */}
        <div className="flex flex-wrap gap-1.5">
          {['ALL', 'SUCCESS', 'PENDING', 'FAILED', 'REFUNDED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                statusFilter === st
                  ? 'bg-[#1A384C] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-sm w-full">
          <div className="relative flex-grow">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Order ID, Ref, Name..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FF6B16]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#FF6B16] hover:bg-[#e05809] text-white text-xs font-bold rounded-xl transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 uppercase font-black text-slate-400 tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Merchant Order ID / Booking</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Amount & Plan</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <div className="w-8 h-8 border-2 border-slate-300 border-t-[#FF6B16] rounded-full animate-spin mx-auto mb-2" />
                    Loading payment records...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    No payment records match the current filters.
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const statusColor =
                    p.paymentStatus === 'SUCCESS'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : p.paymentStatus === 'PENDING'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : p.paymentStatus === 'REFUNDED'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-red-50 text-red-700 border-red-200';

                  return (
                    <tr key={p._id} className="hover:bg-slate-50/80 transition">
                      <td className="px-5 py-4">
                        <div className="font-mono font-bold text-slate-800 text-xs">{p.merchantOrderId}</div>
                        <div className="text-[11px] text-[#FF6B16] font-semibold mt-0.5">
                          Ref: {p.bookingRef}
                        </div>
                        {p.bookingId?.packageName && (
                          <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                            {p.bookingId.packageName}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-800">{p.customer?.name || 'Guest Traveler'}</div>
                        <div className="text-[11px] text-slate-500">{p.customer?.phone}</div>
                        <div className="text-[11px] text-slate-400">{p.customer?.email}</div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-sm font-extrabold text-slate-900">
                          ₹{Number(p.amount).toLocaleString('en-IN')}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 inline-block mt-1">
                          {p.paymentType === 'FULL' ? '100% Full' : 'Advance'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusColor}`}>
                          {p.paymentStatus === 'SUCCESS' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : p.paymentStatus === 'PENDING' ? (
                            <Clock className="w-3 h-3" />
                          ) : p.paymentStatus === 'REFUNDED' ? (
                            <RotateCcw className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          {p.paymentStatus}
                        </span>
                        {p.paymentRail && (
                          <div className="text-[10px] text-slate-400 uppercase font-mono mt-0.5">
                            via {p.paymentRail}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4 text-slate-500 text-[11px]">
                        <div>{new Date(p.createdAt).toLocaleDateString('en-IN')}</div>
                        <div className="text-slate-400">{new Date(p.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>

                      <td className="px-5 py-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleVerifyStatus(p)}
                          title="Re-verify Status with PhonePe"
                          disabled={actionLoading}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPayment(p);
                            setShowJsonModal(true);
                          }}
                          title="View Raw PhonePe Payload"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition"
                        >
                          <Code2 className="w-3.5 h-3.5" />
                        </button>

                        {p.paymentStatus === 'SUCCESS' && (
                          <button
                            type="button"
                            onClick={() => openRefundDialog(p)}
                            title="Initiate PhonePe Refund"
                            className="px-2.5 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-bold text-[11px] transition inline-flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Refund
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing page <span className="font-bold text-slate-800">{page}</span> of{' '}
              <span className="font-bold text-slate-800">{totalPages}</span> ({totalCount} total)
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* JSON Audit Modal */}
      {showJsonModal && selectedPayment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-800 text-sm">
                  PhonePe Audit Payload: {selectedPayment.merchantOrderId}
                </h3>
              </div>
              <button
                onClick={() => setShowJsonModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-grow bg-slate-900 text-emerald-400 font-mono text-xs">
              <pre className="whitespace-pre-wrap break-all">
                {JSON.stringify(
                  {
                    merchantOrderId: selectedPayment.merchantOrderId,
                    phonePeOrderId: selectedPayment.phonePeOrderId,
                    phonePeTransactionId: selectedPayment.phonePeTransactionId,
                    amount: selectedPayment.amount,
                    amountInPaise: selectedPayment.amountInPaise,
                    paymentStatus: selectedPayment.paymentStatus,
                    paymentRail: selectedPayment.paymentRail,
                    gatewayResponse: selectedPayment.gatewayResponse,
                    refundDetails: selectedPayment.refundDetails,
                    updatedAt: selectedPayment.updatedAt,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowJsonModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Processor Modal */}
      {showRefundModal && selectedPayment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
              <div className="flex items-center gap-2 text-rose-700">
                <RotateCcw className="w-5 h-5" />
                <h3 className="font-bold text-slate-800 text-sm">Initiate PhonePe Refund</h3>
              </div>
              <button
                onClick={() => setShowRefundModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProcessRefund} className="p-5 space-y-4 text-xs">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-900 leading-relaxed">
                Warning: Initiating a refund will cancel the associated booking ({selectedPayment.bookingRef}) and credit the customer via PhonePe standard payout rails.
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Refund Amount (Max ₹{selectedPayment.amount.toLocaleString('en-IN')})
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedPayment.amount}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-bold focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Refund</label>
                <input
                  type="text"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  required
                  placeholder="e.g. Customer trip cancellation or weather advisory"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowRefundModal(false)}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-md shadow-rose-600/20 disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                  Confirm & Process Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentManager;
