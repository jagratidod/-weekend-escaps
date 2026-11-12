import React, { useState, useMemo, useRef, useEffect } from 'react';
import { usePackages } from '../../context/PackageContext';
import { useNavigate } from 'react-router-dom';
import { MapPin, Compass, Calendar, Users, Search, Plus, Minus, Check, CalendarDays, SlidersHorizontal, X } from 'lucide-react';

export function TravelSearch({ onSearch }) {
  const navigate = useNavigate();
  const { packages, categories } = usePackages();

  const [destination, setDestination] = useState('');
  const [destinationSearchQuery, setDestinationSearchQuery] = useState('');
  const [travelType, setTravelType] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  const [openDropdown, setOpenDropdown] = useState(null); // 'destination', 'type', 'travelers', null
  const searchBarRef = useRef(null);
  const destInputRef = useRef(null);

  // Close dropdown when clicking anywhere outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBarRef.current && !searchBarRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openDropdown]);

  // Focus destination search input when dropdown opens
  useEffect(() => {
    if (openDropdown === 'destination' && destInputRef.current) {
      setTimeout(() => destInputRef.current?.focus(), 50);
    }
  }, [openDropdown]);

  // Real packages from context (filtered for active ones)
  const realPackages = useMemo(() => {
    if (!Array.isArray(packages) || packages.length === 0) return [];
    return packages.filter((p) => p && p.isActive !== false && p.name && p.name.trim() !== '');
  }, [packages]);

  // Filtered packages inside the search dropdown
  const filteredPackages = useMemo(() => {
    if (!destinationSearchQuery.trim()) return realPackages;
    const q = destinationSearchQuery.toLowerCase().trim();
    return realPackages.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const location = (p.location || '').toLowerCase();
      const travelType = (p.travelType || '').toLowerCase();
      return name.includes(q) || location.includes(q) || travelType.includes(q);
    });
  }, [realPackages, destinationSearchQuery]);

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
        .filter((c) => c.isActive !== false && c.name)
        .sort((a, b) => (a.order || 99) - (b.order || 99))
        .map((c) => c.name.trim());
    }

    if (names.length === 0) {
      names = defaultList;
    }

    return ['All Types', ...names];
  }, [categories]);

  const handleSearch = (e) => {
    e.preventDefault();
    setOpenDropdown(null);

    const queryParams = new URLSearchParams();
    if (destination) queryParams.set('destination', destination);
    if (travelType && travelType !== 'All Types') queryParams.set('type', travelType);
    if (travelDate) queryParams.set('date', travelDate);
    queryParams.set('travelers', adults + children);

    if (onSearch) {
      onSearch({ destination, travelType, travelDate, travelers: adults + children });
    }

    navigate(`/packages?${queryParams.toString()}`);
  };

  return (
    <div id="search-bar" ref={searchBarRef} className="w-full max-w-4xl lg:max-w-[920px] mx-auto px-4 sm:px-6 relative z-30">
      {/* Signature Search Bar Container: Strictly Locked in ONE ROW */}
      <div className="bg-[#141414]/95 backdrop-blur-2xl border-[1.5px] border-[#FF6B16] rounded-full px-3 py-1.5 sm:px-4 sm:py-2 shadow-[0_10px_35px_rgba(0,0,0,0.85),0_0_20px_rgba(255,107,22,0.2)] text-white overflow-visible">
        <form onSubmit={handleSearch} className="flex flex-row flex-nowrap items-center justify-between w-full gap-1 sm:gap-2">
          
          {/* 1. Destination Field (Where to? - Real Packages) */}
          <div className="flex-1 min-w-0 relative px-2 py-0.5 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer">
            <div
              onClick={() => {
                setDestinationSearchQuery('');
                setOpenDropdown(openDropdown === 'destination' ? null : 'destination');
              }}
              className="flex items-center gap-2 sm:gap-2.5 select-none"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-neutral-800/90 border border-neutral-700/80 flex items-center justify-center text-[#FF6B16] shrink-0 shadow-sm">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FF6B16]" />
              </div>
              <div className="text-left overflow-hidden min-w-0">
                <span className="block text-xs sm:text-sm font-bold text-white leading-tight truncate">
                  Where to?
                </span>
                <span className="block text-[10px] sm:text-xs text-neutral-400 font-medium truncate mt-0.5">
                  {destination ? destination : 'Search destination'}
                </span>
              </div>
            </div>

            {/* Real Packages Dropdown Menu */}
            {openDropdown === 'destination' && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute top-full left-0 mt-3 w-72 sm:w-80 bg-neutral-900 border border-neutral-700 rounded-2xl p-2.5 shadow-2xl z-50 text-white"
              >
                {/* Search Input Filter for Packages */}
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    ref={destInputRef}
                    type="text"
                    value={destinationSearchQuery}
                    onChange={(e) => setDestinationSearchQuery(e.target.value)}
                    placeholder="Search trip or destination..."
                    className="w-full pl-8 pr-7 py-1.5 bg-neutral-800/90 border border-neutral-700/80 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF6B16]"
                  />
                  {destinationSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setDestinationSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] font-black text-neutral-400 px-3 py-1 uppercase tracking-wider">
                  <span>Available Trips</span>
                  <span className="text-[#FF6B16] font-bold">{realPackages.length} Packages</span>
                </div>

                {/* Package Options Scroll Area */}
                <div className="max-h-60 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-neutral-700">
                  {/* All Destinations Option */}
                  <button
                    type="button"
                    onClick={() => {
                      setDestination('');
                      setOpenDropdown(null);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                      !destination ? 'bg-neutral-800 text-white' : 'text-neutral-300 hover:bg-neutral-800/60'
                    }`}
                  >
                    <span>All Destinations</span>
                    {!destination && <Check className="w-3.5 h-3.5 text-[#FF6B16]" />}
                  </button>

                  {/* Real Packages List */}
                  {filteredPackages.length > 0 ? (
                    filteredPackages.map((pkg) => {
                      const isSelected = destination.toLowerCase() === pkg.name.toLowerCase();
                      return (
                        <button
                          key={pkg._id || pkg.id || pkg.name}
                          type="button"
                          onClick={() => {
                            setDestination(pkg.name);
                            setOpenDropdown(null);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-xl flex items-center justify-between transition-colors cursor-pointer group ${
                            isSelected ? 'bg-neutral-800 text-white' : 'text-neutral-300 hover:bg-neutral-800/60'
                          }`}
                        >
                          <div className="truncate mr-2">
                            <span className="block truncate text-white group-hover:text-[#FF6B16] transition-colors">
                              {pkg.name}
                            </span>
                            {(pkg.location || pkg.travelType) && (
                              <span className="block text-[10px] text-neutral-400 truncate mt-0.5">
                                {[pkg.location, pkg.travelType].filter(Boolean).join(' • ')}
                              </span>
                            )}
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#FF6B16] shrink-0" />}
                        </button>
                      );
                    })
                  ) : (
                    <div className="px-3 py-3 text-center text-xs text-neutral-500">
                      No packages match &quot;{destinationSearchQuery}&quot;
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Divider 1 */}
          <div className="w-px h-6 bg-neutral-700/60 shrink-0 mx-0.5 sm:mx-1" />

          {/* 2. Travel Type */}
          <div className="flex-1 min-w-0 relative px-2 py-0.5 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer">
            <div
              onClick={() => setOpenDropdown(openDropdown === 'type' ? null : 'type')}
              className="flex items-center gap-2 sm:gap-2.5 select-none"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-neutral-800/90 border border-neutral-700/80 flex items-center justify-center text-[#FF6B16] shrink-0 shadow-sm">
                <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FF6B16]" />
              </div>
              <div className="text-left overflow-hidden min-w-0">
                <span className="block text-xs sm:text-sm font-bold text-white leading-tight truncate">
                  Travel Type
                </span>
                <span className="block text-[10px] sm:text-xs text-neutral-400 font-medium truncate mt-0.5">
                  {travelType ? travelType : 'Treks, Adventure...'}
                </span>
              </div>
            </div>

            {openDropdown === 'type' && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute top-full left-0 mt-3 w-56 bg-neutral-900 border border-neutral-700 rounded-2xl p-2 shadow-2xl z-50 max-h-60 overflow-y-auto"
              >
                <div className="text-[11px] font-black text-neutral-400 px-3 py-1.5 uppercase tracking-wider">
                  Travel Styles
                </div>
                {travelTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => { setTravelType(type); setOpenDropdown(null); }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-neutral-800 rounded-xl flex items-center justify-between text-neutral-200 cursor-pointer"
                  >
                    <span>{type}</span>
                    {travelType === type && <Check className="w-3.5 h-3.5 text-[#FF6B16]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Divider 2 */}
          <div className="w-px h-6 bg-neutral-700/60 shrink-0 mx-0.5 sm:mx-1" />

          {/* 3. Travel Date */}
          <div className="flex-1 min-w-0 relative px-2 py-0.5 rounded-2xl hover:bg-white/5 transition-colors">
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 w-full">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-neutral-800/90 border border-neutral-700/80 flex items-center justify-center text-[#FF6B16] shrink-0 shadow-sm">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FF6B16]" />
                </div>
                <div className="text-left overflow-hidden min-w-0 w-full">
                  <label htmlFor="travel-date-input-field" className="block text-xs sm:text-sm font-bold text-white leading-tight truncate cursor-pointer">
                    Travel Date
                  </label>
                  <input
                    id="travel-date-input-field"
                    type="date"
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="bg-transparent text-[10px] sm:text-xs text-neutral-400 font-medium focus:outline-none w-full cursor-pointer [color-scheme:dark] mt-0.5 truncate"
                  />
                </div>
              </div>
              <CalendarDays className="w-3.5 h-3.5 text-neutral-500 shrink-0 hidden md:block pointer-events-none" />
            </div>
          </div>

          {/* Divider 3 */}
          <div className="w-px h-6 bg-neutral-700/60 shrink-0 mx-0.5 sm:mx-1" />

          {/* 4. Travelers Selector */}
          <div className="flex-1 min-w-0 relative px-2 py-0.5 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer">
            <div
              onClick={() => setOpenDropdown(openDropdown === 'travelers' ? null : 'travelers')}
              className="flex items-center justify-between select-none"
            >
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-neutral-800/90 border border-neutral-700/80 flex items-center justify-center text-[#FF6B16] shrink-0 shadow-sm">
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FF6B16]" />
                </div>
                <div className="text-left min-w-0">
                  <span className="block text-xs sm:text-sm font-bold text-white leading-tight truncate">
                    Travelers
                  </span>
                  <span className="block text-[10px] sm:text-xs text-neutral-400 font-medium mt-0.5 truncate">
                    {adults + children} {adults + children === 1 ? 'Traveler' : 'Travelers'}
                  </span>
                </div>
              </div>
              <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-500 shrink-0 hidden md:block" />
            </div>

            {openDropdown === 'travelers' && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute top-full right-0 mt-3 w-64 bg-neutral-900 border border-neutral-700 rounded-2xl p-4 shadow-2xl z-50 space-y-3"
              >
                {/* Adults */}
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold block text-white">Adults</span>
                    <span className="text-neutral-400 text-[10px]">Ages 12+</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      className="w-7 h-7 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-white cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center font-bold text-white">{adults}</span>
                    <button
                      type="button"
                      onClick={() => setAdults(adults + 1)}
                      className="w-7 h-7 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-white cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-800">
                  <div>
                    <span className="font-bold block text-white">Children</span>
                    <span className="text-neutral-400 text-[10px]">Ages 2-11</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      className="w-7 h-7 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-white cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center font-bold text-white">{children}</span>
                    <button
                      type="button"
                      onClick={() => setChildren(children + 1)}
                      className="w-7 h-7 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-white cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setOpenDropdown(null)}
                  className="w-full mt-2 py-1.5 rounded-lg bg-[#FF6B16] text-white text-xs font-bold cursor-pointer hover:bg-[#e05809] transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </div>

          {/* 5. Orange Search Action Button */}
          <div className="shrink-0 pl-1">
            <button
              type="submit"
              aria-label="Search Trips"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#FF6B16] hover:bg-[#e05809] text-white shadow-lg shadow-[#FF6B16]/50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer shrink-0"
            >
              <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.5]" />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default TravelSearch;
