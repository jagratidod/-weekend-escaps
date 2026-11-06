import React, { useState, useEffect } from 'react';
import {
  Send,
  Radio,
  Bell,
  Smartphone,
  Globe,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Loader2,
  ExternalLink,
  Users,
  Info,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePushNotifications } from '../../hooks/usePushNotifications';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function BroadcastManager() {
  const { token: adminToken } = useAuth();
  const {
    isSubscribed,
    permission,
    requestNotificationPermission,
    token: adminDeviceToken,
  } = usePushNotifications();

  // State
  const [stats, setStats] = useState({
    totalDevices: 0,
    adminDevices: 0,
    webDevices: 0,
    mobileDevices: 0,
  });
  const [recentLogs, setRecentLogs] = useState([]);
  const [isFirebaseLive, setIsFirebaseLive] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    link: '/packages',
    category: 'promotion',
  });
  const [sending, setSending] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Fetch stats and logs
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/stats`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setRecentLogs(data.recentLogs || []);
        setIsFirebaseLive(Boolean(data.isFirebaseLive));
      }
    } catch (err) {
      console.error('Error fetching notification stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [adminToken]);

  // Handle Admin device self-registration (Forces fresh token generation)
  const handleEnableAdminNotifications = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const reg of regs) {
          const sub = await reg.pushManager.getSubscription();
          if (sub) await sub.unsubscribe();
        }
      }
      localStorage.removeItem('we_fcm_token');
    } catch (_) {
      // Ignore unsubscribe error
    }

    const res = await requestNotificationPermission({ isAdmin: true });
    if (res && res.token) {
      setStatusMessage({
        type: 'success',
        text: '🎉 Browser registered successfully with Google FCM! Ready to receive alerts.',
      });
    } else if (res && res.message) {
      setStatusMessage({ type: 'error', text: res.message });
    }
    fetchStats();
  };

  // Send Test Notification to Admin's own device
  const handleSendTest = async () => {
    setTestSending(true);
    setStatusMessage(null);

    let activeToken = adminDeviceToken;
    if (!activeToken) {
      const reg = await requestNotificationPermission({ isAdmin: true });
      if (reg && reg.token) {
        activeToken = reg.token;
      }
    }

    if (!activeToken) {
      setTestSending(false);
      setStatusMessage({
        type: 'error',
        text: 'Could not obtain FCM token. Please allow notifications in browser address bar (padlock icon) and retry.',
      });
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/fcm-tokens/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          token: activeToken,
          title: '⚡ Weekend Escapes Test Push',
          body: 'This is a test notification confirming your admin device is properly registered for alerts!',
          link: '/admin',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: '🎉 Test notification triggered successfully! Check your notification popup.',
        });
        fetchStats();
      } else {
        throw new Error(data.message || 'Failed to send test push');
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setTestSending(false);
    }
  };

  // Dispatch Broadcast Notification
  const handleSendBroadcast = async () => {
    if (!formData.title.trim() || !formData.body.trim()) {
      setStatusMessage({ type: 'error', text: 'Title and message body are required' });
      return;
    }

    setSending(true);
    setStatusMessage(null);
    setShowConfirmModal(false);

    try {
      const res = await fetch(`${API_BASE_URL}/notifications/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: `🎉 Broadcast sent successfully! Dispatched to ${stats.totalDevices} active subscriber(s).`,
        });
        setFormData({
          title: '',
          body: '',
          link: '/packages',
          category: 'promotion',
        });
        fetchStats();
      } else {
        throw new Error(data.message || 'Failed to send broadcast');
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-[#1A384C] tracking-tight">
              Push Notifications & Broadcast Center
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                isFirebaseLive
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isFirebaseLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              {isFirebaseLive ? 'FCM Live' : 'Simulated Mode (Dummy Credentials)'}
            </span>
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            Dispatch instant notifications to customers, alert admins on new bookings, and broadcast
            tour promotions.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            disabled={loadingStats}
            className="p-2.5 rounded-xl border border-neutral-200 text-neutral-600 hover:text-[#1A384C] hover:bg-neutral-50 transition-colors cursor-pointer"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-4 h-4 ${loadingStats ? 'animate-spin' : ''}`} />
          </button>

          {stats.adminDevices === 0 ? (
            <button
              onClick={handleEnableAdminNotifications}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF6B16] text-white text-xs font-bold hover:bg-[#e05809] transition-colors cursor-pointer shadow-md shadow-[#FF6B16]/20 animate-pulse"
            >
              <Bell className="w-4 h-4" />
              <span>Register This Device for Admin Alerts</span>
            </button>
          ) : (
            <button
              onClick={handleSendTest}
              disabled={testSending}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold transition-colors cursor-pointer"
            >
              {testSending ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#FF6B16]" />
              ) : (
                <Radio className="w-4 h-4 text-[#FF6B16]" />
              )}
              <span>Send Test Push to Me</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Status Feedback Banner ── */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center justify-between gap-3 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs font-bold hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Metrics Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Devices */}
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FF6B16]/10 text-[#FF6B16] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Total Subscribers
            </p>
            <h3 className="text-2xl font-black text-[#1A384C] mt-0.5">
              {stats.totalDevices.toLocaleString('en-IN')}
            </h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">Subscribed devices audience</p>
          </div>
        </div>

        {/* Card 2: Admin Devices */}
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Admin Devices
            </p>
            <h3 className="text-2xl font-black text-[#1A384C] mt-0.5">
              {stats.adminDevices.toLocaleString('en-IN')}
            </h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">Receiving booking & lead alerts</p>
          </div>
        </div>

        {/* Card 3: Web Browsers */}
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Web Browsers
            </p>
            <h3 className="text-2xl font-black text-[#1A384C] mt-0.5">
              {stats.webDevices.toLocaleString('en-IN')}
            </h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">Desktop & mobile web</p>
          </div>
        </div>

        {/* Card 4: Mobile Apps */}
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Mobile Platforms
            </p>
            <h3 className="text-2xl font-black text-[#1A384C] mt-0.5">
              {stats.mobileDevices.toLocaleString('en-IN')}
            </h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">Android & iOS devices</p>
          </div>
        </div>
      </div>

      {/* ── Main Section: Compose Broadcast & Live Preview ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Compose Broadcast (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-2xl border border-neutral-200/80 shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-100">
            <Send className="w-5 h-5 text-[#FF6B16]" />
            <h2 className="text-lg font-bold text-[#1A384C]">Compose Broadcast Notification</h2>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setShowConfirmModal(true);
            }}
            className="space-y-4"
          >
            {/* Category Selector */}
            <div>
              <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
                Campaign Category
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'promotion', label: 'Tour Promotion' },
                  { id: 'announcement', label: 'Announcement' },
                  { id: 'flash_sale', label: 'Flash Sale' },
                ].map((cat) => (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setFormData({ ...formData, category: cat.id })}
                    className={`px-3 py-2 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                      formData.category === cat.id
                        ? 'bg-[#1A384C] text-white shadow-sm'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notification Title */}
            <div>
              <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
                Notification Title *
              </label>
              <input
                type="text"
                required
                maxLength={80}
                placeholder="e.g. 🏔️ Flash Deal: 20% OFF Kedarkantha Trek!"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-[#FF6B16] focus:ring-2 focus:ring-[#FF6B16]/20 outline-none text-sm font-semibold transition-all"
              />
              <div className="flex justify-between items-center mt-1">
                <span className="text-[11px] text-neutral-400">Keep it punchy & exciting</span>
                <span className="text-[11px] text-neutral-400">{formData.title.length}/80</span>
              </div>
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
                Message Body *
              </label>
              <textarea
                required
                rows={3}
                maxLength={200}
                placeholder="e.g. Limited snow batches open for this weekend. Reserve your basecamp tent before slots sell out!"
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-[#FF6B16] focus:ring-2 focus:ring-[#FF6B16]/20 outline-none text-sm transition-all resize-none"
              />
              <div className="flex justify-between items-center mt-1">
                <span className="text-[11px] text-neutral-400">Displayed in device notification shade</span>
                <span className="text-[11px] text-neutral-400">{formData.body.length}/200</span>
              </div>
            </div>

            {/* Target Link */}
            <div>
              <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
                Target URL / Route (Opened on Click)
              </label>
              <input
                type="text"
                placeholder="e.g. /packages/kedarkantha-trek or /packages"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-[#FF6B16] focus:ring-2 focus:ring-[#FF6B16]/20 outline-none text-sm transition-all font-mono text-xs"
              />
              <p className="text-[11px] text-neutral-400 mt-1">
                Where travelers land when they click the notification
              </p>
            </div>

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={sending || !formData.title.trim() || !formData.body.trim()}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#FF6B16] to-[#ff843a] text-white font-bold text-sm shadow-lg shadow-[#FF6B16]/30 hover:shadow-xl hover:shadow-[#FF6B16]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                {sending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                <span>Send Broadcast to All Subscribers</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Mock Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#1A384C] text-white p-6 sm:p-7 rounded-2xl shadow-md space-y-4">
            <div className="flex items-center gap-2 text-amber-300">
              <Bell className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">Device Notification Preview</h3>
            </div>
            <p className="text-xs text-white/70">
              This is how your broadcast will appear on subscribers' desktops and mobile screens.
            </p>

            {/* Desktop Notification Card Mockup */}
            <div className="bg-[#111111]/90 rounded-2xl p-4 border border-white/10 shadow-2xl backdrop-blur-sm space-y-3 mt-4">
              <div className="flex items-center justify-between text-[11px] text-white/60">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[#FF6B16] flex items-center justify-center text-[10px] font-black text-white">
                    W
                  </div>
                  <span className="font-semibold text-white/80">WEEKEND ESCAPES</span>
                </div>
                <span>now</span>
              </div>

              <div className="flex items-start gap-3 pt-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF6B16] to-amber-400 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Bell className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">
                    {formData.title || 'Notification Title Preview'}
                  </h4>
                  <p className="text-xs text-white/80 mt-1 line-clamp-3 leading-relaxed">
                    {formData.body ||
                      'Your notification message body will appear right here as travelers browse or work.'}
                  </p>
                  <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FF6B16] mt-2">
                    <span>{formData.link || '/'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>

            {/* Notice Box */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-white/80 space-y-2">
              <div className="flex items-center gap-2 font-bold text-white">
                <Info className="w-4 h-4 text-[#FF6B16]" />
                <span>Zero Duplicate Guarantee</span>
              </div>
              <p className="text-white/70 leading-relaxed text-[11px]">
                Every broadcast is assigned a unique idempotency lock in the backend database. Users
                with multiple open tabs or windows will receive exactly one notification without
                duplicates.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Broadcast & Notification Logs Table ── */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#1A384C]">Recent Notification Dispatch Logs</h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Live audit trail of broadcast and triggered event notifications
            </p>
          </div>
          <span className="text-xs font-bold text-neutral-400">
            Last {recentLogs.length} logs
          </span>
        </div>

        {recentLogs.length === 0 ? (
          <div className="p-12 text-center text-neutral-400 space-y-2">
            <Bell className="w-8 h-8 mx-auto text-neutral-300" />
            <p className="text-sm font-semibold">No notification logs recorded yet.</p>
            <p className="text-xs">
              When bookings are made, leads submitted, or broadcasts sent, logs will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200/70 text-neutral-500 uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-5">Target</th>
                  <th className="py-3 px-5">Title & Message</th>
                  <th className="py-3 px-5">Delivered</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {recentLogs.map((log) => (
                  <tr key={log._id || log.notificationId} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-bold">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold ${
                          log.recipient === 'broadcast'
                            ? 'bg-purple-100 text-purple-800'
                            : log.recipient === 'admin'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {log.recipient?.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 max-w-md">
                      <div className="font-bold text-[#1A384C] text-sm">{log.title}</div>
                      <div className="text-neutral-500 truncate mt-0.5">{log.body}</div>
                      <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                        ID: {log.notificationId}
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="font-semibold text-neutral-700">
                        {log.sentCount || 0} device(s)
                      </span>
                      {log.failedCount > 0 && (
                        <span className="text-red-500 text-[10px] block">
                          ({log.failedCount} failed)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-flex items-center gap-1 font-bold ${
                          log.status === 'sent'
                            ? 'text-emerald-600'
                            : log.status === 'simulated'
                            ? 'text-amber-600'
                            : 'text-red-600'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            log.status === 'sent'
                              ? 'bg-emerald-500'
                              : log.status === 'simulated'
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`}
                        />
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-neutral-500 whitespace-nowrap">
                      {log.createdAt
                        ? new Date(log.createdAt).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Confirmation Modal ── */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-[#FF6B16]/10 text-[#FF6B16] flex items-center justify-center mx-auto">
              <Send className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-[#1A384C]">Confirm Broadcast Dispatch</h3>
              <p className="text-xs text-neutral-500">
                You are about to send this push notification to{' '}
                <strong className="text-neutral-800">{stats.totalDevices} registered device(s)</strong>.
              </p>
            </div>

            <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 text-left space-y-1">
              <div className="text-xs font-bold text-[#1A384C]">{formData.title}</div>
              <div className="text-xs text-neutral-600">{formData.body}</div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-200 font-bold text-xs text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendBroadcast}
                className="flex-1 py-2.5 rounded-xl bg-[#FF6B16] font-bold text-xs text-white hover:bg-[#e05809] transition-colors cursor-pointer shadow-md shadow-[#FF6B16]/20"
              >
                Yes, Send Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
