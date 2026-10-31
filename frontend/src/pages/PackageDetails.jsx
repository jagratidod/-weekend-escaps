import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PACKAGES } from '../data/packages';
import Container from '../components/common/Container';
import {
  Clock,
  MapPin,
  Star,
  CheckCircle,
  XCircle,
  Calendar,
  Users,
  ShieldCheck,
  ArrowRight,
  MessageCircle,
  Sparkles
} from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import { BRAND } from '../utils/constants';
import ItineraryTimeline from '../components/packages/ItineraryTimeline';

export function PackageDetails() {
  const { id } = useParams();
  const pkg = PACKAGES.find((p) => p.id === id) || PACKAGES[0];

  const [activeTab, setActiveTab] = useState('itinerary');
  const [selectedDate, setSelectedDate] = useState('');
  const [travelersCount, setTravelersCount] = useState(2);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const handleBookingEnquiry = (e) => {
    e.preventDefault();
    setBookingConfirmed(true);
  };

  return (
    <div className="pt-24 pb-24 bg-[#F7F7F5] min-h-screen">
      {/* Hero Banner for Package */}
      <div className="relative h-[55vh] min-h-[400px] w-full bg-neutral-900 overflow-hidden">
        <img
          src={pkg.image}
          alt={pkg.name}
          className="w-full h-full object-cover object-center opacity-85 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        <div className="absolute inset-0 flex items-end">
          <Container className="pb-10 text-white">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="px-3.5 py-1 rounded-full bg-[#FF6B16] text-white text-xs font-black uppercase tracking-wider shadow-md">
                {pkg.badge}
              </span>
              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold border border-white/10 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-[#FF6B16] text-[#FF6B16]" />
                {pkg.rating} ({pkg.reviewsCount} reviews)
              </span>
              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold border border-white/10">
                {pkg.season}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
              {pkg.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-6 text-sm text-neutral-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#FF6B16]" />
                {pkg.duration}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#FF6B16]" />
                {pkg.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#FF6B16]" />
                {pkg.groupSize}
              </span>
            </div>
          </Container>
        </div>
      </div>

      {/* Main Details & Booking Grid */}
      <Container className="mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Itinerary, Inclusions, Highlights */}
          <div className="lg:col-span-8 space-y-8">
            {/* Navigation Tabs */}
            <div className="flex border-b border-neutral-200">
              <button
                onClick={() => setActiveTab('itinerary')}
                className={`pb-4 px-6 font-extrabold text-sm border-b-2 transition-all cursor-pointer ${
                  activeTab === 'itinerary'
                    ? 'border-[#FF6B16] text-[#FF6B16]'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Day-by-Day Itinerary
              </button>
              <button
                onClick={() => setActiveTab('inclusions')}
                className={`pb-4 px-6 font-extrabold text-sm border-b-2 transition-all cursor-pointer ${
                  activeTab === 'inclusions'
                    ? 'border-[#FF6B16] text-[#FF6B16]'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                What's Included
              </button>
              <button
                onClick={() => setActiveTab('policy')}
                className={`pb-4 px-6 font-extrabold text-sm border-b-2 transition-all cursor-pointer ${
                  activeTab === 'policy'
                    ? 'border-[#FF6B16] text-[#FF6B16]'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Important Guidelines
              </button>
            </div>

            {/* Tab: Itinerary (Reference UI Match) */}
            {activeTab === 'itinerary' && (
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-neutral-100 shadow-sm">
                <div className="mb-6 pb-4 border-b border-neutral-100 flex items-center justify-between">
                  <div>
                    <span className="text-[#FF6B16] font-bold text-xs uppercase tracking-widest block mb-1">
                      Day-by-Day Experience
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
                      Expedition Itinerary
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-600 text-xs font-bold">
                    {pkg.duration}
                  </span>
                </div>

                <ItineraryTimeline itinerary={pkg.itinerary} packageId={pkg.id} />
              </div>
            )}

            {/* Tab: Inclusions */}
            {activeTab === 'inclusions' && (
              <div className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-neutral-100 shadow-sm">
                <h3 className="text-2xl font-black text-[#111111]">
                  Inclusions & Exclusions
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  <div>
                    <h4 className="text-sm font-extrabold text-emerald-600 uppercase tracking-wider mb-3">
                      Included with Package
                    </h4>
                    <ul className="space-y-3 text-sm text-neutral-700">
                      {pkg.included.map((inc, i) => (
                        <li key={i} className="flex items-center gap-2.5">
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-extrabold text-rose-500 uppercase tracking-wider mb-3">
                      Not Included
                    </h4>
                    <ul className="space-y-3 text-sm text-neutral-700">
                      <li className="flex items-center gap-2.5">
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>Personal expenses and tips</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>Insurance and emergency evacuation</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>Anything not mentioned in inclusions</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Policy */}
            {activeTab === 'policy' && (
              <div className="space-y-4 bg-white p-6 sm:p-8 rounded-3xl border border-neutral-100 shadow-sm text-sm text-neutral-600 leading-relaxed">
                <h3 className="text-2xl font-black text-[#111111] mb-2">
                  Trip Guidelines & Safety
                </h3>
                <p>
                  1. All trekkers must undergo physical conditioning at least 3 weeks prior to high altitude treks.
                </p>
                <p>
                  2. Alcohol consumption, smoking, and littering on trekking trails are strictly prohibited to protect local ecosystems.
                </p>
                <p>
                  3. Weather conditions in mountain passes can change rapidly. The decisions of the trek marshal are final for safety reasons.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Pricing & Booking Card */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xl space-y-6">
              <div className="flex items-baseline justify-between border-b border-neutral-100 pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Starting from
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-[#111111]">
                      {formatCurrency(pkg.price)}
                    </span>
                    <span className="text-xs text-neutral-500 font-semibold line-through">
                      {formatCurrency(pkg.originalPrice)}
                    </span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold">
                  Save 30%
                </span>
              </div>

              {bookingConfirmed ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-black text-emerald-900">
                    Enquiry Received!
                  </h4>
                  <p className="text-xs text-emerald-700">
                    Our travel specialist will reach out to you within 2 hours with customized slots and discounts.
                  </p>
                  <button
                    onClick={() => setBookingConfirmed(false)}
                    className="text-xs text-[#FF6B16] font-bold underline"
                  >
                    Modify Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBookingEnquiry} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                      Select Travel Date
                    </label>
                    <input
                      type="date"
                      required
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-[#FF6B16]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                      Number of Travelers
                    </label>
                    <select
                      value={travelersCount}
                      onChange={(e) => setTravelersCount(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-[#FF6B16]"
                    >
                      <option value={1}>1 Traveler (Solo)</option>
                      <option value={2}>2 Travelers (Pair/Couple)</option>
                      <option value={3}>3-4 Travelers (Small Group)</option>
                      <option value={5}>5+ Travelers (Group Batch)</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <div className="flex justify-between text-sm font-bold text-neutral-800 pb-2">
                      <span>Total Estimated Cost</span>
                      <span className="text-[#FF6B16] text-lg">
                        {formatCurrency(pkg.price * travelersCount)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-full bg-[#FF6B16] hover:bg-[#e05809] text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-[#FF6B16]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Check Availability</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-center gap-3">
                <a
                  href={BRAND.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-full border border-neutral-300 hover:border-emerald-500 hover:bg-emerald-50/50 text-neutral-800 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Talk on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default PackageDetails;
