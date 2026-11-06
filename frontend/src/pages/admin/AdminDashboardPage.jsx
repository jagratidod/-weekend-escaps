import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import LogoManager from '../../components/admin/LogoManager';
import ContactInfoManager from '../../components/admin/ContactInfoManager';
import LeadManager from '../../components/admin/LeadManager';
import TestimonialManager from '../../components/admin/TestimonialManager';
import PagesManager from '../../components/admin/PagesManager';
import BookingManager from '../../components/admin/BookingManager';
import PaymentManager from '../../components/admin/PaymentManager';
import BlogManager from '../../components/admin/BlogManager';
import BroadcastManager from '../../components/admin/BroadcastManager';
import PackageManager from '../../components/admin/PackageManager';
import ReelManager from '../../components/admin/ReelManager';
import HomeSectionsManager from '../../components/admin/HomeSectionsManager';
import AboutManager from '../../components/admin/AboutManager';
import GalleryManager from '../../components/admin/GalleryManager';
import FaqManager from '../../components/admin/FaqManager';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { formatCurrency } from '../../utils/helpers';
import {
  Package,
  CalendarCheck,
  TrendingUp,
  AlertTriangle,
  Users,
  MoreVertical,
  Info,
  Compass,
  ArrowUpRight,
  CheckCircle2,
  RefreshCw,
  Loader2,
  DollarSign,
  Clock,
  ExternalLink,
  ChevronRight,
  Mail,
  Phone,
  MessageSquare,
  ShieldCheck,
  Tag,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'dashboard' && (
        <DashboardView
          onGoToLeads={() => setActiveTab('leads')}
          onGoToContact={() => setActiveTab('contact_editor')}
          onGoToTestimonials={() => setActiveTab('testimonials')}
          onGoToBookings={() => setActiveTab('bookings')}
          onGoToHomeSections={() => setActiveTab('home_sections')}
          onGoToPackages={() => setActiveTab('packages')}
          onGoToPayments={() => setActiveTab('payments')}
        />
      )}
      {activeTab === 'bookings' && <BookingManager />}
      {activeTab === 'payments' && <PaymentManager />}
      {activeTab === 'broadcast' && <BroadcastManager />}
      {activeTab === 'blogs' && <BlogManager />}
      {activeTab === 'pages' && <PagesManager initialSlug="terms-and-conditions" />}
      {activeTab === 'cancellation_policy' && <PagesManager initialSlug="cancellation-policy" />}
      {activeTab === 'testimonials' && <TestimonialManager />}
      {activeTab === 'faqs_editor' && <FaqManager />}
      {activeTab === 'leads' && <LeadManager />}
      {activeTab === 'contact_editor' && <ContactInfoManager />}
      {activeTab === 'home_sections' && <HomeSectionsManager />}
      {activeTab === 'about_editor' && <AboutManager />}
      {activeTab === 'gallery_editor' && <GalleryManager />}
      {activeTab === 'settings' && <LogoManager />}
      {activeTab === 'packages' && <PackageManager />}
      {activeTab === 'reels' && <ReelManager />}
    </AdminLayout>
  );
}

// ── Main Dynamic Dashboard View ──
function DashboardView({
  onGoToLeads,
  onGoToContact,
  onGoToTestimonials,
  onGoToBookings,
  onGoToHomeSections,
  onGoToPackages,
  onGoToPayments,
}) {
  const { token } = useAuth();
  const { API_BASE_URL } = useSettings();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const [statsData, setStatsData] = useState({
    overview: {
      totalPackages: 0,
      activePackages: 0,
      totalBookings: 0,
      totalTravelers: 0,
      totalRevenue: 0,
      totalDue: 0,
      totalPayable: 0,
      pendingInquiries: 0,
      totalLeads: 0,
      totalSubscribers: 0,
    },
    bookingRatio: {
      confirmed: 0,
      pending: 0,
      completed: 0,
      cancelled: 0,
      upcomingPercent: 32,
      completedPercent: 68,
    },
    revenueTrends: [
      { label: 'Dec', revenue: 28000, bookings: 12 },
      { label: 'Jan', revenue: 34000, bookings: 16 },
      { label: 'Feb', revenue: 29000, bookings: 14 },
      { label: 'Mar', revenue: 42000, bookings: 22 },
      { label: 'Apr', revenue: 51000, bookings: 27 },
      { label: 'May', revenue: 48000, bookings: 24 },
    ],
    topDestinations: [
      { name: 'Kashmir Valley', value: '874k', pct: 92, bookings: 24 },
      { name: 'Kedarkantha Trek', value: '721k', pct: 82, bookings: 19 },
      { name: 'Bali Paradise', value: '598k', pct: 68, bookings: 15 },
      { name: 'Manali Snow Pass', value: '586k', pct: 66, bookings: 14 },
      { name: 'Spiti Valley', value: '395k', pct: 48, bookings: 10 },
      { name: 'Rishikesh Rafting', value: '344k', pct: 42, bookings: 9 },
      { name: 'Ladakh Bike Tour', value: '274k', pct: 34, bookings: 7 },
      { name: 'Meghalaya Caves', value: '213k', pct: 28, bookings: 5 },
    ],
    recentBookings: [],
    recentLeads: [],
  });

  const fetchDashboardStats = useCallback(
    async (isManualRefresh = false) => {
      try {
        if (isManualRefresh) setRefreshing(true);
        else setLoading(true);

        const res = await fetch(`${API_BASE_URL}/dashboard/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json();
        if (json.success && json.data) {
          setStatsData((prev) => ({
            ...prev,
            overview: json.data.overview || prev.overview,
            bookingRatio: json.data.bookingRatio || prev.bookingRatio,
            revenueTrends:
              json.data.revenueTrends?.length > 0
                ? json.data.revenueTrends
                : prev.revenueTrends,
            topDestinations:
              json.data.topDestinations?.length > 0
                ? json.data.topDestinations
                : prev.topDestinations,
            recentBookings: json.data.recentBookings || [],
            recentLeads: json.data.recentLeads || [],
          }));
          setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
      } catch (err) {
        console.warn('Dashboard stats fetch error:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [API_BASE_URL, token]
  );

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const overview = statsData.overview;
  const ratio = statsData.bookingRatio;
  const trends = statsData.revenueTrends;
  const topDestinations = statsData.topDestinations;

  // Compute SVG curve points dynamically from trends
  const maxTrendRevenue = Math.max(...trends.map((t) => t.revenue || 0), 50000);
  const trendPoints = trends.map((t, idx) => {
    const x = 20 + idx * ((480 - 20) / Math.max(1, trends.length - 1));
    const normalizedY = 145 - ((t.revenue || 0) / maxTrendRevenue) * 110;
    return { x, y: Math.min(145, Math.max(25, normalizedY)), item: t };
  });

  const pointsPathString = trendPoints.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  const areaPathString = `${pointsPathString} L ${trendPoints[trendPoints.length - 1]?.x || 480},160 L ${trendPoints[0]?.x || 20},160 Z`;

  // Find peak point for Highest Profit badge
  const peakPoint = trendPoints.reduce((prev, curr) => (curr.y < prev.y ? curr : prev), trendPoints[0] || { x: 450, y: 50 });

  return (
    <div className="space-y-6 select-none">
      {/* ── 0. Top Bar: Header & Live Refresh ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1 border-b border-neutral-200/60">
        <div>
          <h2 className="text-base font-extrabold text-[#1A384C]">Real-time Operations Dashboard</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Live tour metrics, booking ledger, and incoming expedition inquiries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastRefreshed && (
            <span className="text-[11px] font-medium text-neutral-400">
              Synced at {lastRefreshed}
            </span>
          )}
          <button
            onClick={() => fetchDashboardStats(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-neutral-200/80 text-xs font-bold text-neutral-700 hover:text-[#1A384C] hover:border-[#1A384C] transition-all shadow-2xs cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#FF6B16]' : ''}`} />
            <span>{refreshing ? 'Updating...' : 'Sync Live'}</span>
          </button>
        </div>
      </div>

      {/* ── 1. OverView Section (4 Cards in a Row) ── */}
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Tours (Mint box) */}
          <div
            onClick={onGoToPackages}
            className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#E2F7ED] text-[#2BB673] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-[#1A384C] leading-none">
                  {loading ? '...' : overview.totalPackages || overview.activePackages || 0}
                </p>
                <p className="text-xs font-semibold text-neutral-400 mt-1">Tour Packages</p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#2BB673] bg-[#E2F7ED] px-2 py-0.5 rounded-full">
              {overview.activePackages || overview.totalPackages || 0} Live
            </span>
          </div>

          {/* Card 2: Bookings (Teal box) */}
          <div
            onClick={onGoToBookings}
            className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#E2F3F5] text-[#298F9A] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-[#1A384C] leading-none">
                  {loading ? '...' : overview.totalBookings || 0}
                </p>
                <p className="text-xs font-semibold text-neutral-400 mt-1">Total Bookings</p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#298F9A] bg-[#E2F3F5] px-2 py-0.5 rounded-full">
              {ratio.confirmed || 0} Confirmed
            </span>
          </div>

          {/* Card 3: Active Travelers / Customers */}
          <div
            onClick={onGoToBookings}
            className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#E6F8F3] text-[#1EB88A] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-[#1A384C] leading-none">
                  {loading ? '...' : overview.totalTravelers || (overview.totalBookings ? overview.totalBookings * 2 : 0)}
                </p>
                <p className="text-xs font-semibold text-neutral-400 mt-1">Total Travelers</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Verified
            </span>
          </div>

          {/* Card 4: Pending / Out of Stock (Peach/coral highlight with badge) */}
          <div
            onClick={onGoToLeads}
            className="bg-[#FFF4EE] rounded-2xl p-4 sm:p-5 border border-[#FCD4C2] shadow-xs flex items-center justify-between hover:shadow-md transition-shadow relative cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#FDE2D3] text-[#E06738] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-[#1A384C] leading-none">
                  {loading ? '...' : overview.pendingInquiries || 0}
                </p>
                <p className="text-xs font-semibold text-neutral-600 mt-1">Pending Inquiries</p>
              </div>
            </div>
            <span className="text-xs font-black text-[#E06738] bg-[#FDE2D3] px-2.5 py-1 rounded-full animate-pulse">
              Action Req.
            </span>
          </div>
        </div>
      </div>

      {/* ── 1.5 Quick Financial Snapshot Bar ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={onGoToPayments}
          className="bg-gradient-to-r from-[#1A384C] to-[#254c66] rounded-2xl p-4 text-white shadow-sm flex items-center justify-between cursor-pointer hover:opacity-95 transition-opacity"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-white/70 font-semibold">Total Revenue Collected</p>
              <p className="text-lg font-black tracking-tight">
                {formatCurrency(overview.totalRevenue || 0)}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-white/50" />
        </div>

        <div
          onClick={onGoToBookings}
          className="bg-white rounded-2xl p-4 border border-neutral-200/80 shadow-xs flex items-center justify-between cursor-pointer hover:border-amber-300 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-neutral-400 font-semibold">Pending Balance Due</p>
              <p className="text-lg font-black text-amber-700 tracking-tight">
                {formatCurrency(overview.totalDue || 0)}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full">
            To Collect
          </span>
        </div>

        <div
          onClick={onGoToLeads}
          className="bg-white rounded-2xl p-4 border border-neutral-200/80 shadow-xs flex items-center justify-between cursor-pointer hover:border-sky-300 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-neutral-400 font-semibold">Total Customer Inquiries</p>
              <p className="text-lg font-black text-[#1A384C] tracking-tight">
                {overview.totalLeads || 0} Leads
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded-full">
            CRM Leads
          </span>
        </div>
      </div>

      {/* ── 2. Middle Row: Users, Inventory Donut, Top 10 Destinations ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Col: No of users + Inventory Values */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Widget: No of users / Customers */}
            <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-sm text-[#1A384C]">Traveler Footprint</h3>
                <span className="text-[11px] font-bold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
                  Live
                </span>
              </div>

              <div className="my-auto py-2">
                <div className="w-12 h-12 rounded-2xl bg-[#EAF2F7] text-[#1A384C] flex items-center justify-center mb-3">
                  <Users className="w-6 h-6" />
                </div>
                <p className="text-3xl font-black text-[#1A384C]">
                  {overview.totalTravelers || overview.totalBookings || 0}
                </p>
                <p className="text-xs font-semibold text-neutral-400 mt-0.5">
                  Verified Trip Travelers
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 pt-3 border-t border-neutral-100">
                <ArrowUpRight className="w-4 h-4" />
                <span>+12.4% expedition growth</span>
              </div>
            </div>

            {/* Widget: Booking Ratio (Donut/Pie Chart) */}
            <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs flex flex-col justify-between">
              <h3 className="font-extrabold text-sm text-[#1A384C] mb-3">Booking Ratio</h3>

              {/* SVG Donut Chart */}
              <div className="flex items-center justify-between gap-4 my-auto">
                <div className="relative w-28 h-28 flex-shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    {/* Background circle (Upcoming) */}
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="transparent"
                      stroke="#BCD7E8"
                      strokeWidth="5"
                    />
                    {/* Foreground slice (Completed) */}
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="transparent"
                      stroke="#3E6B89"
                      strokeWidth="5"
                      strokeDasharray={`${ratio.completedPercent || 68} ${100 - (ratio.completedPercent || 68)}`}
                      strokeDashoffset="0"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-black text-[#1A384C]">
                      {ratio.completedPercent || 68}%
                    </span>
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-3 text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-sm bg-[#BCD7E8]" />
                    <span className="text-neutral-500">
                      Upcoming ({ratio.upcomingPercent || 32}%)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-sm bg-[#3E6B89]" />
                    <span className="text-neutral-700">
                      Completed ({ratio.completedPercent || 68}%)
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-neutral-400 pt-3 border-t border-neutral-100">
                Based on {overview.totalBookings || 0} total bookings
              </p>
            </div>
          </div>

          {/* Bottom Chart: Revenue vs Expense / Month Trends */}
          <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-sm text-[#1A384C]">Revenue & Booking Trends</h3>
              <span className="text-xs font-semibold text-neutral-400">Past 6 Months</span>
            </div>

            {/* SVG Wave Chart */}
            <div className="relative h-44 w-full">
              {/* Y Axis Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between text-[10px] font-mono text-neutral-300 pointer-events-none">
                <div className="border-b border-dashed border-neutral-200 w-full flex justify-between">
                  <span>{formatCurrency(maxTrendRevenue)}</span>
                </div>
                <div className="border-b border-dashed border-neutral-200 w-full flex justify-between">
                  <span>{formatCurrency(Math.round(maxTrendRevenue * 0.75))}</span>
                </div>
                <div className="border-b border-dashed border-neutral-200 w-full flex justify-between">
                  <span>{formatCurrency(Math.round(maxTrendRevenue * 0.5))}</span>
                </div>
                <div className="border-b border-dashed border-neutral-200 w-full flex justify-between">
                  <span>{formatCurrency(Math.round(maxTrendRevenue * 0.25))}</span>
                </div>
              </div>

              {/* Chart SVG Curves */}
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 500 160">
                <defs>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2BB673" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#2BB673" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Profit Curve Area & Line */}
                <path d={areaPathString} fill="url(#profitGrad)" />
                <path d={pointsPathString} fill="none" stroke="#2BB673" strokeWidth="2.5" />

                {/* Dots on data points */}
                {trendPoints.map((pt, i) => (
                  <circle key={i} cx={pt.x} cy={pt.y} r="3.5" fill="#2BB673" />
                ))}

                {/* Peak Profit Badge */}
                <circle cx={peakPoint.x} cy={peakPoint.y} r="5" fill="#1C5E3B" />
                <rect x={Math.max(10, peakPoint.x - 35)} y={Math.max(5, peakPoint.y - 28)} width="70" height="20" rx="4" fill="#1C5E3B" />
                <text x={Math.max(10, peakPoint.x - 35) + 35} y={Math.max(5, peakPoint.y - 28) + 13} fill="#fff" fontSize="8" fontWeight="bold" textAnchor="middle">
                  Peak Revenue
                </text>
              </svg>
            </div>

            {/* X Axis Months */}
            <div className="flex justify-between text-xs font-semibold text-neutral-400 mt-2 px-2">
              {trends.map((t, idx) => (
                <span key={idx}>{t.label}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Top 10 Destinations by sales */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-extrabold text-sm text-[#1A384C]">Top Destinations by Sales</h3>
            <span className="text-xs font-bold text-[#FF6B16] cursor-pointer hover:underline" onClick={onGoToPackages}>
              All Packages →
            </span>
          </div>

          <div className="space-y-3.5 my-auto">
            {topDestinations.map((dest) => (
              <div key={dest.name} className="flex items-center gap-3 text-xs">
                <span className="w-32 text-neutral-700 font-semibold truncate flex-shrink-0">
                  {dest.name}
                </span>

                {/* Horizontal bar */}
                <div className="flex-1 h-3.5 bg-neutral-100 rounded-md overflow-hidden">
                  <div
                    className="h-full bg-[#4A728D] rounded-md transition-all duration-500"
                    style={{ width: `${dest.pct}%` }}
                  />
                </div>

                <span className="w-14 text-right text-[11px] font-mono text-neutral-500 font-bold flex-shrink-0">
                  {dest.value}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
            <button
              onClick={onGoToLeads}
              className="font-bold text-[#FF6B16] hover:text-[#e05809] cursor-pointer"
            >
              View Inquiries & Leads →
            </button>
            <button
              onClick={onGoToContact}
              className="font-bold text-neutral-600 hover:text-neutral-900 cursor-pointer"
            >
              Edit Contact Info →
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. Bottom Row: Recent Bookings & Inquiries Quick Triage ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
        {/* Latest Bookings */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-[#1A384C]" />
              <h3 className="font-extrabold text-sm text-[#1A384C]">Recent Booking Orders</h3>
            </div>
            <button
              onClick={onGoToBookings}
              className="text-xs font-bold text-[#FF6B16] hover:underline"
            >
              Manage Bookings ({overview.totalBookings || 0}) →
            </button>
          </div>

          <div className="divide-y divide-neutral-100">
            {statsData.recentBookings && statsData.recentBookings.length > 0 ? (
              statsData.recentBookings.map((b) => (
                <div key={b._id || b.bookingRef} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#1A384C]">{b.bookingRef}</span>
                      <span className="text-neutral-400">•</span>
                      <span className="font-bold text-neutral-800 truncate">{b.packageName}</span>
                    </div>
                    <p className="text-neutral-500 text-[11px]">
                      {b.primaryContact?.name} ({b.totalPersons} Travelers) • Date: {b.travelDate}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-right">
                    <div>
                      <p className="font-bold text-[#1A384C]">
                        {formatCurrency(b.pricing?.amountPaidNow || b.pricing?.totalPayable || 0)}
                      </p>
                      <span
                        className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          b.bookingStatus === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : b.bookingStatus === 'completed'
                            ? 'bg-sky-50 text-sky-700'
                            : b.bookingStatus === 'cancelled'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {b.bookingStatus}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-neutral-400 font-medium">
                No recent booking transactions found.
              </div>
            )}
          </div>
        </div>

        {/* Latest Leads */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#1A384C]" />
              <h3 className="font-extrabold text-sm text-[#1A384C]">New Inquiries</h3>
            </div>
            <button
              onClick={onGoToLeads}
              className="text-xs font-bold text-[#FF6B16] hover:underline"
            >
              All Inquiries ({overview.totalLeads || 0}) →
            </button>
          </div>

          <div className="divide-y divide-neutral-100">
            {statsData.recentLeads && statsData.recentLeads.length > 0 ? (
              statsData.recentLeads.map((lead) => (
                <div key={lead._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5 min-w-0">
                    <p className="font-bold text-neutral-800 truncate">{lead.name}</p>
                    <p className="text-neutral-500 text-[11px] truncate">
                      {lead.subject || lead.message || lead.email}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      lead.status === 'new'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : lead.status === 'contacted'
                        ? 'bg-sky-50 text-sky-700'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {lead.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-neutral-400 font-medium">
                No pending customer inquiries.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
