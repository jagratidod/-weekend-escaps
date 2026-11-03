import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation, Link } from 'react-router-dom';
import { usePackages } from '../context/PackageContext';
import { useSettings } from '../context/SettingsContext';
import { EXPERIENCES } from '../data/experiences';
import { getImageUrl } from '../utils/imageHelper';
import { formatCurrency } from '../utils/helpers';
import PackageCard from '../components/home/PackageCard';
import Container from '../components/common/Container';
import {
  Search,
  RotateCcw,
  ArrowRight,
  Mountain,
  Compass,
  Heart,
  Users,
  Flame,
  Globe,
  MessageCircle,
  Shield,
  Calendar,
  Clock,
  Star,
  MapPin,
} from 'lucide-react';

const iconMap = {
  Mountain,
  Compass,
  Heart,
  Users,
  Flame,
  Globe,
};

// Visual theme for each experience matching photo board style
const EXPERIENCE_VISUALS = {
  trekking: {
    bg: getImageUrl('/images/gallery/gallery-4.webp'),
    kicker: 'BEYOND THE',
    highlight: 'TOURIST TRAPS:',
    subheading: 'UNIQUE HIMALAYAN TREKS',
    tagline: 'Explore the hidden trails of Uttarakhand & Kashmir.',
    polaroids: [
      { img: getImageUrl('/newimage/exploresection/kedarkantha.png'), alt: 'Kedarkantha Summit' },
      { img: getImageUrl('/images/gallery/gallery-1.webp'), alt: 'Summit Ridge Push' },
      { img: getImageUrl('/newimage/about/kedarkantha.png'), alt: 'Alpine Ridge Camp' },
      { img: getImageUrl('/newimage/other sections image/image1.png'), alt: 'Himalayan Trekker' },
    ],
  },
  adventure: {
    bg: getImageUrl('/newimage/exploresection/manali.png'),
    kicker: 'BEYOND THE',
    highlight: 'ORDINARY:',
    subheading: 'HIGH-ALTITUDE ADVENTURES',
    tagline: 'Feel the adrenaline on snow slopes and rapids.',
    polaroids: [
      { img: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=85&w=600&auto=format&fit=crop', alt: 'Solang Skiing' },
      { img: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?q=85&w=600&auto=format&fit=crop', alt: 'Gulmarg Gondola' },
      { img: 'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?q=85&w=600&auto=format&fit=crop', alt: 'White Water Rafting' },
      { img: getImageUrl('/newimage/exploresection/vally.png'), alt: 'Spiti 4x4 Expedition' },
    ],
  },
  honeymoon: {
    bg: getImageUrl('/images/gallery/gallery-2.webp'),
    kicker: 'BEYOND THE',
    highlight: 'TOURIST TRAPS:',
    subheading: 'ROMANTIC MOUNTAIN ESCAPES',
    tagline: 'Private sanctuaries crafted for intimate memories.',
    polaroids: [
      { img: getImageUrl('/newimage/exploresection/kashmir.png'), alt: 'Sunset Shikara' },
      { img: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=85&w=600&auto=format&fit=crop', alt: 'Alpine Chalet Bed' },
      { img: getImageUrl('/newimage/exploresection/bali.png'), alt: 'Bali Sunset Cliff' },
      { img: 'https://images.unsplash.com/photo-1517824806704-9040b037703b?q=85&w=600&auto=format&fit=crop', alt: 'Stargazing Camp' },
    ],
  },
  family: {
    bg: getImageUrl('/images/gallery/gallery-5.webp'),
    kicker: 'BEYOND THE',
    highlight: 'ORDINARY:',
    subheading: 'CAREFREE FAMILY CIRCUITS',
    tagline: 'Comforting, scenic journeys for every generation.',
    polaroids: [
      { img: getImageUrl('/newimage/about/kashmir.png'), alt: 'Kashmir Valley' },
      { img: getImageUrl('/newimage/about/manali.png'), alt: 'Manali Apple Orchards' },
      { img: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=85&w=600&auto=format&fit=crop', alt: 'Heritage Houseboat' },
      { img: getImageUrl('/newimage/exploresection/manali.png'), alt: 'Pine Valley' },
    ],
  },
  group: {
    bg: getImageUrl('/newimage/herosecction/heroimage.png'),
    kicker: 'BEYOND THE',
    highlight: 'COMMUTE:',
    subheading: 'EPIC GROUP EXPEDITIONS',
    tagline: 'Join fellow wanderers for stories around the bonfire.',
    polaroids: [
      { img: getImageUrl('/images/gallery/gallery-1.webp'), alt: 'Group Summit' },
      { img: 'https://images.unsplash.com/photo-1659187313578-66ec5323bc2f?q=85&w=600&auto=format&fit=crop', alt: 'Acoustic Bonfire' },
      { img: getImageUrl('/newimage/about/vally.png'), alt: 'Spiti Pass' },
      { img: 'https://images.unsplash.com/photo-1517824806704-9040b037703b?q=85&w=600&auto=format&fit=crop', alt: 'Campfire Galaxy' },
    ],
  },
  international: {
    bg: getImageUrl('/images/gallery/gallery-6.webp'),
    kicker: 'BEYOND THE',
    highlight: 'USUAL HORIZONS:',
    subheading: 'CURATED GLOBAL GETAWAYS',
    tagline: 'Explore tropical paradises and ancient sacred culture.',
    polaroids: [
      { img: getImageUrl('/newimage/exploresection/bali.png'), alt: 'Nusa Penida Cliff' },
      { img: getImageUrl('/newimage/about/bali.png'), alt: 'Bali Rice Terraces' },
      { img: getImageUrl('/images/gallery/gallery-6.webp'), alt: 'Water Temple' },
      { img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=85&w=600&auto=format&fit=crop', alt: 'Tropical Beach' },
    ],
  },
};

export function PackagesPage({ scrollToExperiences = false }) {
  const { packages, categories, loading } = usePackages();
  const { whatsappUrl, getCustomWhatsAppUrl } = useSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const initialDestination = searchParams.get('destination') || '';
  const initialType = searchParams.get('type') || 'All';

  const [searchTerm, setSearchTerm] = useState(initialDestination);
  const [selectedType, setSelectedType] = useState(initialType);
  const [maxPrice, setMaxPrice] = useState(80000);

  // Private Treks (Custom batches with WhatsApp direct booking)
  const privateTrekPackages = packages.filter((pkg) => {
    if (pkg.isActive === false) return false;
    return pkg.isPrivateTrek === true;
  });

  // If admin has not yet marked any package as private, provide curated defaults
  const displayPrivateTreks =
    privateTrekPackages.length > 0
      ? privateTrekPackages
      : packages
          .filter(
            (pkg) =>
              pkg.isActive !== false &&
              (pkg.travelType === 'Trekking' ||
                pkg.name?.toLowerCase().includes('trek') ||
                pkg.price >= 5000)
          )
          .slice(0, 4);

  // Dynamic travel types from active categories & packages
  const activeCategoryNames = Array.isArray(categories)
    ? categories.filter((c) => c.isActive !== false).map((c) => c.name)
    : [];

  const dynamicTypes = Array.from(
    new Set([
      'All',
      ...activeCategoryNames,
      ...packages.map((p) => p.travelType).filter(Boolean),
    ])
  );
  const travelTypes =
    dynamicTypes.length > 1
      ? dynamicTypes
      : ['All', 'Trekking', 'Honeymoon & Leisure', 'Adventure', 'International'];

  // Handle URL query changes
  useEffect(() => {
    const qType = searchParams.get('type');
    if (qType) {
      setSelectedType(qType);
    }
  }, [searchParams]);

  // Handle hash scrolling (e.g. #experiences or #trekking or scrollToExperiences prop)
  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    } else if (scrollToExperiences) {
      const el = document.getElementById('experiences');
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    }
  }, [location.hash, scrollToExperiences]);

  const filteredPackages = packages.filter((pkg) => {
    if (pkg.isActive === false) return false;

    const matchesSearch =
      (pkg.name && pkg.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (pkg.location && pkg.location.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType =
      selectedType === 'All' ||
      (pkg.travelType && pkg.travelType.toLowerCase().includes(selectedType.toLowerCase()));

    const matchesPrice = Number(pkg.price) <= maxPrice;

    return matchesSearch && matchesType && matchesPrice;
  });

  const handleReset = () => {
    setSearchTerm('');
    setSelectedType('All');
    setMaxPrice(80000);
  };

  // Filter packages by clicked experience and scroll back up
  const handleFilterByExperience = (experienceTitle) => {
    const matched =
      travelTypes.find(
        (t) =>
          t.toLowerCase() === experienceTitle.toLowerCase() ||
          experienceTitle.toLowerCase().includes(t.toLowerCase())
      ) || experienceTitle;

    setSelectedType(matched);

    const topGrid = document.getElementById('packages-grid-top');
    if (topGrid) {
      topGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="pt-28 pb-24 bg-[#F7F7F5] min-h-screen text-[#111111]">
      <Container>
        {/* ── SECTION 1: PACKAGES & EXPEDITIONS ── */}
        <div id="packages-grid-top" className="scroll-mt-32">
          {/* Page Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#FF6B16]"></span>
              <span className="text-[#FF6B16] font-bold text-xs uppercase tracking-widest">
                CURATED ITINERARIES
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-[#111111] tracking-tight">
              Tour Packages & Expeditions
            </h1>
            <p className="mt-3 text-neutral-600 text-base sm:text-lg">
              Discover handcrafted travel packages with experienced trip marshals, top-rated stays, and all-inclusive logistics.
            </p>

            {/* Quick Section Switcher Pills */}
            <div className="flex items-center justify-center gap-2.5 mt-5 flex-wrap">
              <a
                href="#packages-grid-top"
                className="px-4 py-1.5 rounded-full bg-white border border-neutral-200 text-xs font-bold text-neutral-800 hover:border-[#FF6B16] hover:text-[#FF6B16] transition-all shadow-xs"
              >
                Group Expeditions ({filteredPackages.length})
              </a>
              <a
                href="#private-treks"
                className="px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-xs font-black text-emerald-800 hover:bg-emerald-100 transition-all shadow-xs flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Private Treks ({displayPrivateTreks.length})</span>
              </a>
              <a
                href="#experiences"
                className="px-4 py-1.5 rounded-full bg-white border border-neutral-200 text-xs font-bold text-neutral-600 hover:border-[#FF6B16] hover:text-[#FF6B16] transition-all shadow-xs"
              >
                Curated Experiences
              </a>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white rounded-3xl p-5 md:p-6 shadow-md border border-neutral-100 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Search Input */}
              <div className="md:col-span-4 relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search trip name or location..."
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:border-[#FF6B16] text-[#111111]"
                />
              </div>

              {/* Travel Type Select */}
              <div className="md:col-span-4">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:border-[#FF6B16] text-neutral-800 font-semibold cursor-pointer"
                >
                  {travelTypes.map((type) => (
                    <option key={type} value={type}>
                      Style: {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Slider */}
              <div className="md:col-span-3 px-2">
                <div className="flex justify-between text-xs font-bold text-neutral-600 mb-1">
                  <span>Budget Max:</span>
                  <span className="text-[#FF6B16]">₹{maxPrice.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="80000"
                  step="2000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#FF6B16] cursor-pointer"
                />
              </div>

              {/* Reset Button */}
              <div className="md:col-span-1 flex justify-center">
                <button
                  type="button"
                  onClick={handleReset}
                  title="Reset Filters"
                  className="p-3 rounded-2xl border border-neutral-200 hover:border-[#FF6B16] text-neutral-500 hover:text-[#FF6B16] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Packages Results Grid */}
          {filteredPackages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredPackages.map((pkg) => (
                <PackageCard key={pkg._id || pkg.id} pkg={pkg} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200">
              <p className="text-lg font-bold text-neutral-800">No packages match your criteria.</p>
              <p className="text-sm text-neutral-500 mt-1">Try resetting the filters or modifying your search terms.</p>
              <button
                onClick={handleReset}
                className="mt-4 px-6 py-2.5 rounded-full bg-[#FF6B16] text-white text-xs font-bold shadow-md hover:bg-[#e05809] cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* ── SECTION 2: PRIVATE TREKS & CUSTOM BATCHES (DIRECT WHATSAPP INQUIRY) ── */}
        <div id="private-treks" className="pt-24 mt-24 border-t border-neutral-200/90 scroll-mt-28">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 mb-3 px-3.5 py-1 rounded-full bg-emerald-100/90 text-emerald-800 text-xs font-black uppercase tracking-wider">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>CUSTOM BATCHES • DIRECT WHATSAPP INQUIRY</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-[#111111] tracking-tight">
              Private Treks for Your Group
            </h2>
            <p className="mt-3 text-neutral-600 text-base sm:text-lg">
              Want to trek exclusively with your friends, family, or corporate team? Pick any date, trek at your own pace with a dedicated trek leader, and get instant custom quotes directly on WhatsApp.
            </p>

            {/* 4 Feature Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 text-left">
              <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-xs flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-neutral-900">100% Private</div>
                  <div className="text-[10px] text-neutral-500 font-semibold">No outside strangers</div>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-xs flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-neutral-900">Your Own Dates</div>
                  <div className="text-[10px] text-neutral-500 font-semibold">365 Days availability</div>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-xs flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-neutral-900">Dedicated Guide</div>
                  <div className="text-[10px] text-neutral-500 font-semibold">Custom pace & safety</div>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-xs flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-neutral-900">WhatsApp Connect</div>
                  <div className="text-[10px] text-neutral-500 font-semibold">Direct custom quote</div>
                </div>
              </div>
            </div>
          </div>

          {/* Private Treks Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayPrivateTreks.map((pkg) => {
              const waMessage = `Hi Weekend Escapes! I would like to inquire about booking a *Private Trek* for *${pkg.name}*. We have our own group and want to discuss custom departure dates and pricing.`;
              const waUrl = getCustomWhatsAppUrl ? getCustomWhatsAppUrl(waMessage) : (whatsappUrl || 'https://wa.me/917983695277');

              return (
                <div
                  key={pkg._id || pkg.id}
                  className="group flex flex-col rounded-3xl overflow-hidden bg-white p-3 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 border border-emerald-100 hover:border-emerald-300"
                >
                  {/* Image with Private Badges */}
                  <div className="relative aspect-[16/10.5] w-full rounded-2xl overflow-hidden bg-neutral-100">
                    <img
                      src={getImageUrl(pkg.image)}
                      alt={pkg.name}
                      loading="lazy"
                      className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                    />

                    {/* Top Left: Private Trek Badge */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide shadow-md bg-emerald-600 text-white flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        <span>Private Trek</span>
                      </span>
                    </div>

                    {/* Top Right: WhatsApp Direct Badge */}
                    <div className="absolute top-2.5 right-2.5">
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-emerald-400 text-[10px] font-black border border-emerald-500/30">
                        <MessageCircle className="w-3 h-3 text-emerald-400" />
                        <span>WhatsApp Only</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="pt-3 pb-1 px-1 flex flex-col flex-1 justify-between">
                    <div>
                      {/* Duration & Location */}
                      <div className="flex items-center justify-between text-[11px] text-neutral-500 font-bold mb-1.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-emerald-600" />
                          {pkg.duration}
                        </span>
                        <span className="truncate max-w-[120px] text-neutral-600">
                          {pkg.location ? pkg.location.split(',')[0] : 'Uttarakhand'}
                        </span>
                      </div>

                      {/* Trek Title */}
                      <Link
                        to={`/packages/${pkg.id || pkg._id}`}
                        className="text-base font-black text-[#111111] group-hover:text-emerald-700 transition-colors line-clamp-1 leading-snug block"
                      >
                        {pkg.name}
                      </Link>

                      {/* Custom Inclusions Pill */}
                      <div className="mt-2 flex flex-wrap gap-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600">
                          Dedicated Guide
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                          Custom Dates
                        </span>
                      </div>

                      {/* Pricing */}
                      <div className="mt-3 flex items-baseline justify-between border-t border-neutral-100 pt-2">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase text-neutral-400 block">
                            Starting from
                          </span>
                          <span className="text-lg sm:text-xl font-black text-neutral-900">
                            {formatCurrency(pkg.price)}
                          </span>
                          <span className="text-[10px] font-semibold text-neutral-400 ml-1">
                            / person
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800">
                          Custom Group
                        </span>
                      </div>
                    </div>

                    {/* WhatsApp Action Button (NO ONLINE BOOKING, DIRECT WHATSAPP) */}
                    <div className="mt-4 space-y-2">
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-black text-xs sm:text-[13px] shadow-md shadow-[#25D366]/25 hover:shadow-lg hover:shadow-[#25D366]/35 transition-all duration-200 cursor-pointer text-center"
                      >
                        <MessageCircle className="w-4 h-4 fill-white" />
                        <span>Connect on WhatsApp</span>
                      </a>

                      <Link
                        to={`/packages/${pkg.id || pkg._id}`}
                        className="w-full block text-center py-1 text-[11px] font-bold text-neutral-500 hover:text-emerald-700 transition-colors"
                      >
                        View Trek Itinerary & Details →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom Private Trek Callout Banner */}
          <div className="mt-12 bg-gradient-to-r from-emerald-900 to-[#1A384C] rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-1.5 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-black uppercase tracking-wider">
                <Shield className="w-3 h-3" />
                <span>Custom Mountain Expeditions</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black">
                Have a Custom Route, Peak or College / Corporate Group?
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl">
                We craft bespoke private expeditions across Uttarakhand, Himachal, Kashmir, and Ladakh tailored precisely to your team size, fitness level, and budget.
              </p>
            </div>

            <a
              href={
                getCustomWhatsAppUrl
                  ? getCustomWhatsAppUrl(
                      'Hi Weekend Escapes! I would like to design a Custom Private Expedition for our group. Please connect us with a senior trek leader.'
                    )
                  : whatsappUrl || 'https://wa.me/917983695277'
              }
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 whitespace-nowrap active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Chat with Trek Leader</span>
            </a>
          </div>
        </div>

        {/* ── SECTION 3: CURATED EXPERIENCES (MERGED FROM /experiences) ── */}
        <div id="experiences" className="pt-24 mt-24 border-t border-neutral-200/90 scroll-mt-28">
          {/* Experiences Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#FF6B16]"></span>
              <span className="text-[#FF6B16] font-bold text-xs uppercase tracking-widest">
                TRAVEL YOUR WAY
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-[#111111] tracking-tight">
              Curated Experiences
            </h2>
            <p className="mt-3 text-neutral-600 text-base sm:text-lg">
              No two explorers seek the exact same journey. Select your favorite adventure style and let us tailor every mile.
            </p>
          </div>

          {/* Experience Blocks */}
          <div className="space-y-14">
            {EXPERIENCES.map((exp, idx) => {
              const Icon = iconMap[exp.icon] || Mountain;
              const isReversed = idx % 2 === 1;
              const visual = EXPERIENCE_VISUALS[exp.id] || EXPERIENCE_VISUALS.trekking;

              return (
                <div
                  key={exp.id}
                  id={exp.id}
                  className={`bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-neutral-200 shadow-md flex flex-col ${
                    isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'
                  } gap-8 lg:gap-12 items-center justify-between transition-all duration-300 hover:shadow-xl scroll-mt-32`}
                >
                  {/* Visual Postcard & Polaroids Card matching Reference Photo Board Style */}
                  <div className="w-full lg:w-1/2 aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3] rounded-3xl relative overflow-hidden flex flex-col items-center justify-center border border-neutral-200/90 shadow-lg group">
                    {/* Scenic Mountain Backdrop Image */}
                    <img
                      src={visual.bg}
                      alt={exp.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    {/* Subtle dark vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/15 to-black/25" />

                    {/* Centered Cream Plaque */}
                    <div className="relative z-10 w-[88%] sm:w-[82%] bg-[#FAF8F5] border border-[#E3DDD1] shadow-2xl rounded-2xl p-5 sm:p-7 pt-6 sm:pt-8 text-center flex flex-col items-center select-none -translate-y-6 sm:-translate-y-8">
                      <span className="text-[11px] sm:text-xs font-black tracking-[0.25em] uppercase text-neutral-800">
                        {visual.kicker}
                      </span>
                      <h3
                        className="text-lg sm:text-xl md:text-2xl font-serif font-black tracking-tight text-neutral-700 uppercase mt-0.5"
                        style={{ fontFamily: 'Georgia, serif' }}
                      >
                        {visual.highlight}
                      </h3>
                      <h4 className="text-xs sm:text-sm md:text-base font-black tracking-wider text-neutral-900 uppercase mt-1">
                        {visual.subheading}
                      </h4>
                      <p className="text-xs sm:text-sm text-neutral-600 mt-2 font-normal italic">
                        {visual.tagline}
                      </p>
                    </div>

                    {/* Overlapping 4 Polaroids fanned out at bottom */}
                    <div className="absolute -bottom-2 left-0 right-0 z-20 flex justify-center items-end px-2 pb-3 pointer-events-none">
                      <div className="flex items-end justify-center -space-x-3 sm:-space-x-5 pointer-events-auto">
                        {visual.polaroids.map((p, pIdx) => {
                          const rotations = [
                            'transform -rotate-6 sm:-rotate-12 hover:rotate-0 hover:scale-115 hover:z-30',
                            'transform -rotate-2 sm:-rotate-4 hover:rotate-0 hover:scale-115 hover:z-30 z-10',
                            'transform rotate-2 sm:rotate-4 hover:rotate-0 hover:scale-115 hover:z-30 z-10',
                            'transform rotate-6 sm:rotate-12 hover:rotate-0 hover:scale-115 hover:z-30',
                          ];

                          return (
                            <div
                              key={pIdx}
                              className={`${rotations[pIdx]} transition-all duration-300 bg-white p-1.5 pb-4 sm:p-2 sm:pb-6 rounded-sm shadow-2xl border border-neutral-200/80 w-18 sm:w-24 md:w-28 shrink-0 cursor-pointer`}
                            >
                              <div className="aspect-square overflow-hidden bg-neutral-100 rounded-[1px]">
                                <img
                                  src={p.img}
                                  alt={p.alt}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Details Side */}
                  <div className="w-full lg:w-1/2 space-y-5">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF6B16]/10 text-[#FF6B16] text-xs font-black uppercase tracking-wider">
                      <Icon className="w-3.5 h-3.5" />
                      <span>{exp.count}</span>
                    </div>

                    <h3 className="text-3xl sm:text-4xl font-black text-[#111111] tracking-tight">
                      {exp.title} Trips
                    </h3>

                    <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
                      {exp.description}
                    </p>

                    <div>
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-neutral-400 mb-2.5">
                        Popular Trips in this Style:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {exp.popularTrips.map((trip, i) => (
                          <span
                            key={i}
                            className="px-3.5 py-1.5 rounded-xl bg-[#F7F7F5] border border-neutral-200/80 text-xs font-bold text-neutral-800 hover:border-[#FF6B16] transition-colors"
                          >
                            {trip}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => handleFilterByExperience(exp.title)}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FF6B16] hover:bg-[#ff7d33] text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer"
                      >
                        <span>Explore {exp.title} Packages</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </div>
  );
}

export default PackagesPage;
