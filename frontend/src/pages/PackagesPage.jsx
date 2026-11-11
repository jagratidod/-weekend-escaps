import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useLocation, Link } from 'react-router-dom';
import { usePackages } from '../context/PackageContext';
import { useSettings } from '../context/SettingsContext';
import { getImageUrl } from '../utils/imageHelper';
import { formatCurrency } from '../utils/helpers';
import PackageCard from '../components/home/PackageCard';
import Container from '../components/common/Container';
import TripReelsRow from '../components/home/TripReelsRow';
import PackageFAQ from '../components/packages/PackageFAQ';
import {
  Search,
  RotateCcw,
  Users,
  MessageCircle,
  Shield,
  Calendar,
  Clock,
  Star,
  MapPin,
  X,
  Loader2,
  SlidersHorizontal,
} from 'lucide-react';

export function PackagesPage() {
  const { packages: contextPackages, categories, loading: contextLoading } = usePackages();
  const { whatsappUrl, getCustomWhatsAppUrl, API_BASE_URL } = useSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // Read initial values from URL (supports both 'search' and 'destination' from home search bar)
  const initialSearch = searchParams.get('search') || searchParams.get('destination') || '';
  const initialType = searchParams.get('type') || 'All';
  const initialMaxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : null;

  // Filter states
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedType, setSelectedType] = useState(initialType);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice || 80000);

  // Backend packages list & loading state
  const [backendPackages, setBackendPackages] = useState(null); // null = not yet queried, fall back to contextPackages
  const [isFilterLoading, setIsFilterLoading] = useState(false);

  // Compute dynamic price boundaries from available packages
  const priceStats = useMemo(() => {
    const list = Array.isArray(contextPackages) && contextPackages.length > 0 ? contextPackages : [];
    const validPrices = list.map((p) => Number(p.price)).filter((p) => !isNaN(p) && p > 0);
    const min = validPrices.length > 0 ? Math.min(...validPrices) : 3000;
    const max = validPrices.length > 0 ? Math.max(...validPrices, 80000) : 80000;
    return { min, max };
  }, [contextPackages]);

  // Ensure default maxPrice aligns with package price bounds if not specified
  useEffect(() => {
    if (!initialMaxPrice && priceStats.max && maxPrice < priceStats.max) {
      setMaxPrice(priceStats.max);
    }
  }, [priceStats.max, initialMaxPrice]);

  // Private Treks (Custom batches with WhatsApp direct booking)
  const basePackages = backendPackages !== null ? backendPackages : contextPackages || [];
  const privateTrekPackages = basePackages.filter((pkg) => {
    if (pkg.isActive === false) return false;
    return pkg.isPrivateTrek === true;
  });

  const displayPrivateTreks =
    privateTrekPackages.length > 0
      ? privateTrekPackages
      : (contextPackages || [])
          .filter(
            (pkg) =>
              pkg.isActive !== false &&
              (pkg.travelType === 'Trekking' ||
                pkg.name?.toLowerCase().includes('trek') ||
                pkg.price >= 5000)
          )
          .slice(0, 4);

  // ── DYNAMIC REAL CATEGORIES (STRICTLY FROM ADMIN / BACKEND CATEGORIES) ──
  const travelTypes = useMemo(() => {
    const defaultList = [
      'Backpacking Trips',
      'Weekend Getaways',
      'Treks',
      'Spiritual Tours',
      'International',
      'Adventure',
    ];

    let names = [];
    if (Array.isArray(categories) && categories.length > 0) {
      names = categories
        .filter((cat) => cat.isActive !== false && cat.name)
        .sort((a, b) => (a.order || 99) - (b.order || 99))
        .map((cat) => cat.name.trim());
    }

    if (names.length === 0) {
      names = defaultList;
    }

    return [
      { name: 'All', label: 'Style: All Categories' },
      ...names.map((name) => ({
        name,
        label: `Style: ${name}`,
      })),
    ];
  }, [categories]);

  // Normalize aliases (e.g. 'Trekking' -> 'Treks') or reset invalid selections
  useEffect(() => {
    if (selectedType && selectedType !== 'All' && travelTypes.length > 1) {
      const st = selectedType.toLowerCase().trim();
      const matched = travelTypes.find((t) => {
        const tn = t.name.toLowerCase().trim();
        if (tn === st) return true;
        if (tn === 'treks' && (st === 'trekking' || st === 'trek')) return true;
        if (tn === 'weekend getaways' && (st === 'weekend escapes' || st === 'honeymoon & leisure' || st === 'honeymoon')) return true;
        return false;
      });

      if (matched && matched.name !== selectedType) {
        setSelectedType(matched.name);
      } else if (!matched) {
        setSelectedType('All');
      }
    }
  }, [travelTypes, selectedType]);

  // Handle URL query changes from outside (e.g. back/forward navigation or clicking external links)
  useEffect(() => {
    const qSearch = searchParams.get('search') || searchParams.get('destination') || '';
    const qType = searchParams.get('type') || 'All';
    const qMax = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : null;

    if (qSearch !== searchTerm) setSearchTerm(qSearch);
    if (qType !== selectedType) setSelectedType(qType);
    if (qMax && qMax !== maxPrice) setMaxPrice(qMax);
  }, [searchParams]);

  // Handle hash scrolling (e.g. #packages-grid-top or #private-treks)
  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    }
  }, [location.hash]);

  // ── BACKEND CONNECTED FILTER QUERY WITH DEBOUNCE ──
  const isFirstRender = useRef(true);
  useEffect(() => {
    let isCancelled = false;
    setIsFilterLoading(true);

    const debounceDelay = isFirstRender.current ? 0 : 250;
    isFirstRender.current = false;

    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        const trimmedSearch = searchTerm.trim();
        if (trimmedSearch) {
          params.set('search', trimmedSearch);
        }
        if (selectedType && selectedType !== 'All') {
          params.set('type', selectedType);
        }
        if (maxPrice && maxPrice < priceStats.max) {
          params.set('maxPrice', maxPrice);
        }

        // Keep URL in sync with active filters
        setSearchParams(params, { replace: true });

        // Query Backend API endpoint /api/packages
        const baseUrl = API_BASE_URL || 'http://localhost:5000/api';
        const url = `${baseUrl}/packages?${params.toString()}`;

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled && data.success && Array.isArray(data.packages)) {
            setBackendPackages(data.packages);
            setIsFilterLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('[PackagesPage] Backend query error, falling back to local dataset:', err);
      }

      if (!isCancelled) {
        setIsFilterLoading(false);
      }
    }, debounceDelay);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [searchTerm, selectedType, maxPrice, priceStats.max, API_BASE_URL, setSearchParams]);

  // Fallback in-memory filter if backend query is in transit or offline
  const displayPackages = useMemo(() => {
    if (backendPackages !== null) {
      return backendPackages;
    }

    return (contextPackages || []).filter((pkg) => {
      if (pkg.isActive === false) return false;

      const s = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !s ||
        (pkg.name && pkg.name.toLowerCase().includes(s)) ||
        (pkg.location && pkg.location.toLowerCase().includes(s)) ||
        (pkg.travelType && pkg.travelType.toLowerCase().includes(s));

      let matchesType = selectedType === 'All';
      if (!matchesType && selectedType) {
        const pt = (pkg.travelType || '').toLowerCase().trim();
        const pn = (pkg.name || '').toLowerCase().trim();
        const st = selectedType.toLowerCase().trim();

        if (pt === st || pt.includes(st) || st.includes(pt)) {
          matchesType = true;
        } else {
          // Check stem matching (e.g. "Treks" vs "Trekking" / "Kedarkantha Trek")
          const words = st
            .split(/[&,/ \-_]+/)
            .map((w) => w.trim().toLowerCase())
            .filter((w) => w.length >= 3 && !['trips', 'tours', 'escapes'].includes(w));

          matchesType = words.some((w) => {
            let stem = w;
            if (stem.endsWith('ing') && stem.length > 5) stem = stem.slice(0, -3);
            else if (stem.endsWith('s') && stem.length > 3) stem = stem.slice(0, -1);
            return (pt && pt.includes(stem)) || (pn && pn.includes(stem));
          });
        }
      }

      const matchesPrice = !maxPrice || Number(pkg.price) <= maxPrice;

      return matchesSearch && matchesType && matchesPrice;
    });
  }, [backendPackages, contextPackages, searchTerm, selectedType, maxPrice]);

  // Reset all filters to default
  const handleReset = () => {
    setSearchTerm('');
    setSelectedType('All');
    setMaxPrice(priceStats.max || 80000);
    setBackendPackages(null);
    setSearchParams({}, { replace: true });
  };

  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
      (selectedType && selectedType !== 'All') ||
      (maxPrice && maxPrice < priceStats.max)
  );

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
                className="px-4 py-1.5 rounded-full bg-white border border-neutral-200 text-xs font-bold text-neutral-800 hover:border-[#FF6B16] hover:text-[#FF6B16] transition-all shadow-xs flex items-center gap-1.5"
              >
                <span>Group Expeditions</span>
                <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-[11px] font-black">
                  {displayPackages.length}
                </span>
              </a>
              <a
                href="#private-treks"
                className="px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-xs font-black text-emerald-800 hover:bg-emerald-100 transition-all shadow-xs flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Private Treks ({displayPrivateTreks.length})</span>
              </a>
              <a
                href={
                  getCustomWhatsAppUrl
                    ? getCustomWhatsAppUrl('Hi Weekend Escapes! I would like to connect with a trip expert to help plan our tour package.')
                    : whatsappUrl || 'https://wa.me/919876543210'
                }
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-1.5 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-black transition-all shadow-xs flex items-center gap-1.5 hover:scale-105 active:scale-95 cursor-pointer shadow-emerald-900/20"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-white text-[#25D366]" />
                <span>Connect with Expert</span>
              </a>
            </div>
          </div>

          {/* ── BACKEND CONNECTED FILTER & SEARCH BAR ── */}
          <div className="bg-white rounded-3xl p-5 md:p-6 shadow-md border border-neutral-100 mb-10 transition-all">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* 1. Search Input */}
              <div className="md:col-span-5 relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search trip name, destination, or highlights..."
                  className="w-full pl-11 pr-10 py-3 rounded-2xl bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:border-[#FF6B16] focus:bg-white text-[#111111] transition-all font-medium"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    title="Clear search"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-200/60 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* 2. Travel Type / Style Select */}
              <div className="md:col-span-3">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:border-[#FF6B16] focus:bg-white text-neutral-800 font-semibold cursor-pointer transition-all"
                >
                  {travelTypes.map((item) => (
                    <option key={item.name} value={item.name}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Budget Max Slider */}
              <div className="md:col-span-3 px-2">
                <div className="flex justify-between items-center text-xs font-bold text-neutral-600 mb-1">
                  <span>Budget Max:</span>
                  <span className="text-[#FF6B16] text-sm font-black">
                    ₹{maxPrice.toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  min={priceStats.min || 3000}
                  max={priceStats.max || 80000}
                  step={1000}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#FF6B16] cursor-pointer h-2 bg-neutral-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-neutral-400 font-semibold mt-0.5">
                  <span>₹{(priceStats.min || 3000).toLocaleString('en-IN')}</span>
                  <span>₹{(priceStats.max || 80000).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* 4. Reset Button */}
              <div className="md:col-span-1 flex justify-center">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={!hasActiveFilters && !isFilterLoading}
                  title={hasActiveFilters ? 'Reset all filters' : 'Filters at default'}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-center ${
                    hasActiveFilters
                      ? 'border-[#FF6B16] text-[#FF6B16] bg-[#FF6B16]/5 hover:bg-[#FF6B16] hover:text-white shadow-xs'
                      : 'border-neutral-200 text-neutral-400 hover:border-neutral-300 hover:text-neutral-600'
                  }`}
                >
                  <RotateCcw className={`w-4 h-4 ${isFilterLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Active Filters Summary Strip */}
            {hasActiveFilters && (
              <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-1.5 flex-wrap text-neutral-500">
                  <span className="font-bold text-neutral-700">Active Filters:</span>
                  {searchTerm.trim() && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-800 font-semibold">
                      Keyword: "{searchTerm.trim()}"
                      <button onClick={() => setSearchTerm('')} className="hover:text-rose-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {selectedType !== 'All' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-800 font-semibold">
                      Category: {selectedType}
                      <button onClick={() => setSelectedType('All')} className="hover:text-rose-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {maxPrice < priceStats.max && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-800 font-semibold">
                      Max Price: ₹{maxPrice.toLocaleString('en-IN')}
                      <button onClick={() => setMaxPrice(priceStats.max)} className="hover:text-rose-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>

                <div className="text-[11px] font-bold text-neutral-400">
                  {isFilterLoading ? (
                    <span className="inline-flex items-center gap-1 text-[#FF6B16]">
                      <Loader2 className="w-3 h-3 animate-spin" /> Querying database...
                    </span>
                  ) : (
                    <span>{displayPackages.length} package{displayPackages.length === 1 ? '' : 's'} matched</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Packages Results Grid ── */}
          {isFilterLoading && displayPackages.length === 0 ? (
            <div className="py-24 text-center">
              <div className="w-10 h-10 border-4 border-[#FF6B16]/20 border-t-[#FF6B16] rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-bold text-neutral-600">Querying packages from database...</p>
            </div>
          ) : displayPackages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayPackages.map((pkg) => (
                <PackageCard key={pkg._id || pkg.id} pkg={pkg} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200">
              <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 mx-auto mb-3">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-lg font-bold text-neutral-800">No packages match your criteria.</p>
              <p className="text-sm text-neutral-500 mt-1 max-w-md mx-auto">
                We couldn't find any trips matching your current search terms or budget. Try clearing your filters or exploring another category!
              </p>
              <button
                onClick={handleReset}
                className="mt-5 px-6 py-2.5 rounded-full bg-[#FF6B16] hover:bg-[#e05809] text-white text-xs font-bold shadow-md cursor-pointer transition-all inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
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
          </div>

          {/* 4 Featured Private Treks Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayPrivateTreks.map((pkg) => {
              const inquiryMessage = `Hi Weekend Escapes! I would like to inquire about a Private Custom Batch for *${pkg.name}* (${pkg.location || 'Himalayas'}). Please connect me with a trek leader.`;
              const finalWhatsappLink = getCustomWhatsAppUrl
                ? getCustomWhatsAppUrl(inquiryMessage)
                : `${whatsappUrl || 'https://wa.me/917983695277'}?text=${encodeURIComponent(inquiryMessage)}`;

              return (
                <div
                  key={`private-${pkg._id || pkg.id}`}
                  className="bg-white rounded-3xl overflow-hidden border border-emerald-200/90 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1 relative"
                >
                  {/* Image container */}
                  <div className="aspect-[4/3] w-full relative overflow-hidden bg-neutral-100">
                    <img
                      src={getImageUrl(pkg.image)}
                      alt={pkg.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                    {/* Private Batch Badge */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                      <span className="px-3 py-1 rounded-full text-[11px] font-black tracking-wide uppercase shadow-md bg-emerald-600 text-white flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        <span>Private Trek</span>
                      </span>
                    </div>

                    {/* Difficulty Badge */}
                    <div className="absolute bottom-3 left-3 z-10">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-black/60 backdrop-blur-xs text-white">
                        {pkg.difficulty || 'Custom Pace'}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex flex-col flex-grow justify-between bg-white">
                    <div>
                      {/* Location & Duration */}
                      <div className="flex items-center justify-between text-xs text-neutral-500 font-semibold mb-1.5">
                        <span className="flex items-center gap-1 truncate max-w-[60%]">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{pkg.location}</span>
                        </span>
                        <span className="flex items-center gap-1 shrink-0">
                          <Clock className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{pkg.duration}</span>
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-black text-neutral-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                        {pkg.name}
                      </h3>

                      {/* Custom note */}
                      <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                        {pkg.privateTrekNote || 'Custom dates for your squad • Dedicated trek marshal & private camps.'}
                      </p>
                    </div>

                    {/* Pricing & WhatsApp CTA */}
                    <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between gap-2">
                      <div>
                        <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                          Starts From
                        </div>
                        <div className="text-sm font-black text-neutral-900">
                          {formatCurrency(pkg.price)}
                          <span className="text-[10px] text-neutral-400 font-normal"> / person</span>
                        </div>
                      </div>

                      <a
                        href={finalWhatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all shadow-md flex items-center gap-1.5 hover:scale-105 active:scale-95 cursor-pointer shrink-0"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-white text-emerald-600" />
                        <span>Inquire</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Banner under Private Treks */}
          <div className="mt-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-neutral-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-1.5 text-center md:text-left">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-black uppercase tracking-wider border border-emerald-400/30">
                Custom Dates • Dedicated Marshals • Tailored Menus
              </span>
              <h3 className="text-xl sm:text-2xl font-black">
                Have a Specific Peak or Off-Beat Trail in Mind?
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-xl">
                Tell us your group size, preferred dates, and fitness level. We handle high-altitude camping logistics, forest permits, gear, and safety marshals.
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
      </Container>

      {/* ── Travel Reels Showcase Section (5 Reels, Dynamic from Admin, Above Footer) ── */}
      <section className="w-full pt-10 pb-2 mt-10 border-t border-neutral-200/70 overflow-hidden bg-[#F7F7F5]">
        <TripReelsRow
          title="What Our Travellers Say"
          subtitle="Real moments and unfiltered trail memories captured by explorers"
          maxReels={5}
        />
      </section>

      {/* ── Frequently Asked Questions Section ── */}
      <PackageFAQ />
    </div>
  );
}

export default PackagesPage;
