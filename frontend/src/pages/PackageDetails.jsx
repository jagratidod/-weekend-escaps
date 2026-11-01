import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
import { useSettings } from '../context/SettingsContext';
import ItineraryTimeline from '../components/packages/ItineraryTimeline';

export function PackageDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pkg = PACKAGES.find((p) => p.id === id) || PACKAGES[0];
  const { whatsappUrl, getCustomWhatsAppUrl } = useSettings();
  const packageWaUrl = getCustomWhatsAppUrl
    ? getCustomWhatsAppUrl(`Hi Weekend Escapes! I would like to inquire about the package: ${pkg.name || pkg.title}`)
    : whatsappUrl;

  const [activeTab, setActiveTab] = useState('itinerary');
  const [selectedDate, setSelectedDate] = useState('');
  const [travelersCount, setTravelersCount] = useState(2);

  const handleCheckAvailability = (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (selectedDate) query.append('date', selectedDate);
    query.append('travelers', String(travelersCount));
    query.append('step', '1');
    navigate(`/book/${pkg.id}?${query.toString()}`);
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
              {/* Price Row (Matches Image 1) */}
              <div className="flex items-center justify-between pb-6 border-b border-neutral-100">
                <div>
                  <span className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-400">
                    STARTING FROM
                  </span>
                  <div className="flex items-baseline gap-2.5 mt-0.5">
                    <span className="text-3xl font-black text-[#111111]">
                      {formatCurrency(pkg.price)}
                    </span>
                    <span className="text-sm text-neutral-400 font-semibold line-through">
                      {formatCurrency(pkg.originalPrice || Math.round(pkg.price * 1.4))}
                    </span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#FFF4EE] text-[#FF6B16] border border-[#FED7AA] text-xs font-black">
                  Save 30%
                </span>
              </div>

              {/* Booking Availability Form (Image 1) */}
              <form onSubmit={handleCheckAvailability} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-black text-neutral-600 uppercase tracking-wider mb-1.5">
                    SELECT TRAVEL DATE
                  </label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm font-medium focus:outline-none focus:border-[#FF6B16] focus:ring-2 focus:ring-[#FF6B16]/10 transition-all cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-neutral-600 uppercase tracking-wider mb-1.5">
                    NUMBER OF TRAVELERS
                  </label>
                  <select
                    value={travelersCount}
                    onChange={(e) => setTravelersCount(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm font-medium focus:outline-none focus:border-[#FF6B16] focus:ring-2 focus:ring-[#FF6B16]/10 transition-all cursor-pointer"
                  >
                    <option value={1}>1 Traveler (Solo)</option>
                    <option value={2}>2 Travelers (Pair/Couple)</option>
                    <option value={3}>3 Travelers (Small Group)</option>
                    <option value={4}>4 Travelers (Group)</option>
                    <option value={5}>5+ Travelers (Group Batch)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between items-center text-sm font-bold text-neutral-800 pb-2">
                    <span className="text-neutral-900 font-bold">Total Estimated Cost</span>
                    <span className="text-[#FF6B16] text-xl font-black">
                      {formatCurrency(pkg.price * travelersCount)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-full bg-[#FF6B16] hover:bg-[#e05809] active:scale-[0.99] text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-[#FF6B16]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>CHECK AVAILABILITY</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-center gap-3">
                <a
                  href={packageWaUrl || BRAND.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-full border border-neutral-300 hover:border-emerald-500 hover:bg-emerald-50/50 text-neutral-800 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
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
