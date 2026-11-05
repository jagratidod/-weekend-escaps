import React, { useState } from 'react';
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
import GalleryManager from '../../components/admin/GalleryManager';
import { Sparkles } from 'lucide-react';
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
        />
      )}
      {activeTab === 'bookings' && <BookingManager />}
      {activeTab === 'payments' && <PaymentManager />}
      {activeTab === 'broadcast' && <BroadcastManager />}
      {activeTab === 'blogs' && <BlogManager />}
      {activeTab === 'pages' && <PagesManager initialSlug="terms-and-conditions" />}
      {activeTab === 'cancellation_policy' && <PagesManager initialSlug="cancellation-policy" />}
      {activeTab === 'testimonials' && <TestimonialManager />}
      {activeTab === 'leads' && <LeadManager />}
      {activeTab === 'contact_editor' && <ContactInfoManager />}
      {activeTab === 'home_sections' && <HomeSectionsManager />}
      {activeTab === 'gallery_editor' && <GalleryManager />}
      {activeTab === 'settings' && <LogoManager />}
      {activeTab === 'destinations' && <PlaceholderModule title="Destinations Management" icon={Compass} />}
      {activeTab === 'packages' && <PackageManager />}
      {activeTab === 'reels' && <ReelManager />}
    </AdminLayout>
  );
}

// ── Main Dashboard View (Reference UI Match) ──
function DashboardView({ onGoToLeads, onGoToContact, onGoToTestimonials, onGoToBookings, onGoToHomeSections }) {
  // Top 10 destinations ranking (from reference "Top 10 Stores by sales")
  const topDestinations = [
    { name: 'Kashmir Valley', value: '874k', pct: 92 },
    { name: 'Kedarkantha Trek', value: '721k', pct: 82 },
    { name: 'Bali Paradise', value: '598k', pct: 68 },
    { name: 'Manali Snow Pass', value: '586k', pct: 66 },
    { name: 'Spiti Valley', value: '395k', pct: 48 },
    { name: 'Rishikesh Rafting', value: '344k', pct: 42 },
    { name: 'Ladakh Bike Tour', value: '274k', pct: 34 },
    { name: 'Meghalaya Caves', value: '213k', pct: 28 },
    { name: 'Goa Coastal Cruise', value: '183k', pct: 23 },
    { name: 'Valley of Flowers', value: '170k', pct: 20 },
  ];

  return (
    <div className="space-y-6 select-none">
      {/* ── 1. OverView Section (4 Cards in a Row) ── */}
      <div>
        <h2 className="text-base font-extrabold text-[#1A384C] mb-3">Over View</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Tours (Mint box) */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/80 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-[#E2F7ED] text-[#2BB673] flex items-center justify-center flex-shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-[#1A384C] leading-none">5483</p>
              <p className="text-xs font-semibold text-neutral-400 mt-1">Total Tours</p>
            </div>
          </div>

          {/* Card 2: Bookings (Teal box) */}
          <div
            onClick={onGoToBookings}
            className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/80 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-[#E2F3F5] text-[#298F9A] flex items-center justify-center flex-shrink-0">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-[#1A384C] leading-none">2859</p>
              <p className="text-xs font-semibold text-neutral-400 mt-1">Bookings Management</p>
            </div>
          </div>

          {/* Card 3: Active Travelers / Stock (Green trend box) */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/80 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-[#E6F8F3] text-[#1EB88A] flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-[#1A384C] leading-none">5483</p>
              <p className="text-xs font-semibold text-neutral-400 mt-1">Total Travelers</p>
            </div>
          </div>

          {/* Card 4: Pending / Out of Stock (Peach/coral highlight with info badge) */}
          <div className="bg-[#FFF4EE] rounded-2xl p-4 sm:p-5 border border-[#FCD4C2] shadow-xs flex items-center justify-between hover:shadow-md transition-shadow relative">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#FDE2D3] text-[#E06738] flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-[#1A384C] leading-none">38</p>
                <p className="text-xs font-semibold text-neutral-600 mt-1">Pending Inquiries</p>
              </div>
            </div>
            <span className="w-5 h-5 rounded-full border border-neutral-400/50 flex items-center justify-center text-neutral-400 hover:text-neutral-600 text-xs cursor-pointer">
              <Info className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. Middle Row: Users, Inventory Donut, Top 10 Destinations ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Col: No of users + Inventory Values */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Widget: No of users */}
            <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-sm text-[#1A384C]">No of users</h3>
                <button className="text-neutral-400 hover:text-neutral-600" aria-label="Menu">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <div className="my-auto py-2">
                <div className="w-12 h-12 rounded-2xl bg-[#EAF2F7] text-[#1A384C] flex items-center justify-center mb-3">
                  <Users className="w-6 h-6" />
                </div>
                <p className="text-3xl font-black text-[#1A384C]">583 K</p>
                <p className="text-xs font-semibold text-neutral-400 mt-0.5">Total Customers</p>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 pt-3 border-t border-neutral-100">
                <ArrowUpRight className="w-4 h-4" />
                <span>+12.4% from last month</span>
              </div>
            </div>

            {/* Widget: Inventory Values (Donut/Pie Chart) */}
            <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs flex flex-col justify-between">
              <h3 className="font-extrabold text-sm text-[#1A384C] mb-3">Booking Ratio</h3>

              {/* SVG Donut Chart */}
              <div className="flex items-center justify-between gap-4 my-auto">
                <div className="relative w-28 h-28 flex-shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    {/* Background circle 32% */}
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="transparent"
                      stroke="#BCD7E8"
                      strokeWidth="5"
                    />
                    {/* Foreground slice 68% */}
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="transparent"
                      stroke="#3E6B89"
                      strokeWidth="5"
                      strokeDasharray="68 32"
                      strokeDashoffset="0"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-black text-[#1A384C]">68%</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-3 text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-sm bg-[#BCD7E8]" />
                    <span className="text-neutral-500">Upcoming (32%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-sm bg-[#3E6B89]" />
                    <span className="text-neutral-700">Completed (68%)</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-neutral-400 pt-3 border-t border-neutral-100">
                Based on 2,859 total verified trip bookings
              </p>
            </div>
          </div>

          {/* Bottom Chart: Expense vs Profit (Area Chart) */}
          <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-sm text-[#1A384C]">Revenue vs Expense</h3>
              <span className="text-xs font-semibold text-neutral-400">Last 6 months</span>
            </div>

            {/* SVG Wave Chart matching reference */}
            <div className="relative h-44 w-full">
              {/* Y Axis Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between text-[10px] font-mono text-neutral-300 pointer-events-none">
                <div className="border-b border-dashed border-neutral-200 w-full flex justify-between">
                  <span>40k</span>
                </div>
                <div className="border-b border-dashed border-neutral-200 w-full flex justify-between">
                  <span>30k</span>
                </div>
                <div className="border-b border-dashed border-neutral-200 w-full flex justify-between">
                  <span>20k</span>
                </div>
                <div className="border-b border-dashed border-neutral-200 w-full flex justify-between">
                  <span>10k</span>
                </div>
              </div>

              {/* Chart SVG Curves */}
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 500 160">
                <defs>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2BB673" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#2BB673" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E06738" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#E06738" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Expense Curve Area & Line */}
                <path
                  d="M 10,110 Q 90,80 170,120 T 330,70 T 490,95 L 490,160 L 10,160 Z"
                  fill="url(#expenseGrad)"
                />
                <path
                  d="M 10,110 Q 90,80 170,120 T 330,70 T 490,95"
                  fill="none"
                  stroke="#E06738"
                  strokeWidth="2.5"
                />

                {/* Profit Curve Area & Line */}
                <path
                  d="M 10,95 Q 90,120 170,90 T 330,85 T 490,50 L 490,160 L 10,160 Z"
                  fill="url(#profitGrad)"
                />
                <path
                  d="M 10,95 Q 90,120 170,90 T 330,85 T 490,50"
                  fill="none"
                  stroke="#2BB673"
                  strokeWidth="2.5"
                />

                {/* Highest Expense Badge at x=330, y=70 */}
                <circle cx="330" cy="70" r="4" fill="#E06738" />
                <rect x="300" y="44" width="60" height="18" rx="4" fill="#B9582E" />
                <text x="330" y="56" fill="#fff" fontSize="8" fontWeight="bold" textAnchor="middle">
                  Peak Expense
                </text>

                {/* Highest Profit Badge at x=490, y=50 */}
                <circle cx="490" cy="50" r="4" fill="#2BB673" />
                <rect x="450" y="24" width="55" height="18" rx="4" fill="#1C5E3B" />
                <text x="477" y="36" fill="#fff" fontSize="8" fontWeight="bold" textAnchor="middle">
                  Highest Profit
                </text>
              </svg>
            </div>

            {/* X Axis Months */}
            <div className="flex justify-between text-xs font-semibold text-neutral-400 mt-2 px-2">
              <span>Dec</span>
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>April</span>
              <span>May</span>
              <span>Jun</span>
            </div>
          </div>
        </div>

        {/* Right Col: Top 10 Stores / Destinations by sales */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-extrabold text-sm text-[#1A384C]">Top Destinations by sales</h3>
          </div>

          <div className="space-y-3 my-auto">
            {topDestinations.map((dest, i) => (
              <div key={dest.name} className="flex items-center gap-3 text-xs">
                <span className="w-28 text-neutral-600 font-medium truncate flex-shrink-0">
                  {dest.name}
                </span>

                {/* Horizontal bar */}
                <div className="flex-1 h-3.5 bg-neutral-100 rounded-md overflow-hidden">
                  <div
                    className="h-full bg-[#4A728D] rounded-md transition-all duration-500"
                    style={{ width: `${dest.pct}%` }}
                  />
                </div>

                <span className="w-10 text-right text-[11px] font-mono text-neutral-500 font-semibold flex-shrink-0">
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
              Edit Contact Page →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Generic Placeholder Module for Future Pages ──
function PlaceholderModule({ title, icon: Icon }) {
  return (
    <div className="bg-white rounded-3xl p-10 border border-neutral-200/80 shadow-xs text-center select-none">
      <div className="w-16 h-16 rounded-3xl bg-[#EBF2F7] text-[#1A384C] flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-black text-[#1A384C]">{title}</h2>
      <p className="text-sm text-neutral-500 max-w-md mx-auto mt-2">
        This section is ready for future operations, CRUD tables, and management workflows.
      </p>
      <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
        <CheckCircle2 className="w-4 h-4" />
        Modular Section — Ready for Expansion
      </div>
    </div>
  );
}
