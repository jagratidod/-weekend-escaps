import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Check, Loader2, Calendar, AlertCircle } from 'lucide-react';
import { usePackages } from '../../context/PackageContext';
import { useSettings } from '../../context/SettingsContext';

export default function AvailableDatesSection({
  pkg,
  selectedDate,
  onSelectDate,
  selectedCity: parentSelectedCity,
  onSelectCity,
  hideTitle = false,
}) {
  const { getUpcomingSlots } = usePackages();
  const { themeColor = '#FF6B16' } = useSettings();

  const [backendCities, setBackendCities] = useState([]);

  // Cities list from backend response, package object or safe defaults
  const availableCities = useMemo(() => {
    if (backendCities.length > 0) {
      return backendCities;
    }
    if (Array.isArray(pkg?.departureCities) && pkg.departureCities.length > 0) {
      return pkg.departureCities;
    }
    return ['Ahmedabad', 'Mumbai', 'Pune'];
  }, [backendCities, pkg?.departureCities]);

  const [selectedCity, setSelectedCity] = useState(
    parentSelectedCity || availableCities[0] || 'Ahmedabad'
  );
  const [slotsData, setSlotsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync city if parent changes
  useEffect(() => {
    if (parentSelectedCity && parentSelectedCity !== selectedCity) {
      setSelectedCity(parentSelectedCity);
    }
  }, [parentSelectedCity]);

  // If selectedCity is not in availableCities, fallback to first available city
  useEffect(() => {
    if (availableCities.length > 0) {
      const match = availableCities.find(
        (c) => c.toLowerCase() === (selectedCity || '').toLowerCase()
      );
      if (!match) {
        setSelectedCity(availableCities[0]);
        if (onSelectCity) onSelectCity(availableCities[0]);
      }
    }
  }, [availableCities]);

  // Fetch slots from backend whenever package or selected city changes
  useEffect(() => {
    let isCancelled = false;
    async function loadSlots() {
      if (!pkg?.id && !pkg?._id) return;
      try {
        setLoading(true);
        setError(null);
        const pkgId = pkg.id || pkg._id;
        const res = await getUpcomingSlots(pkgId, selectedCity);
        if (!isCancelled) {
          if (res && Array.isArray(res.departureCities) && res.departureCities.length > 0) {
            setBackendCities(res.departureCities);
          }
          if (res && Array.isArray(res.slots)) {
            setSlotsData(res.slots);
          } else {
            setSlotsData([]);
          }
        }
      } catch (err) {
        if (!isCancelled) {
          console.warn('[AvailableDatesSection] Error loading slots:', err);
          setError(err.message);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadSlots();
    return () => {
      isCancelled = true;
    };
  }, [pkg?.id, pkg?._id, selectedCity, getUpcomingSlots]);

  // Group slots by Month Year (e.g. "March 2027", "April 2026", etc.)
  const monthGroups = useMemo(() => {
    const map = new Map();

    const formatMonthYear = (dateStr) => {
      try {
        const d = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
        return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      } catch {
        return 'Upcoming Dates';
      }
    };

    (slotsData || []).forEach((slot) => {
      const dateStr = slot.startDate || slot.date;
      if (!dateStr) return;
      const monthKey = dateStr.slice(0, 7); // e.g. "2027-03"
      const label = formatMonthYear(dateStr);

      if (!map.has(monthKey)) {
        map.set(monthKey, {
          key: monthKey,
          label,
          slots: [],
        });
      }
      map.get(monthKey).slots.push(slot);
    });

    // If no slots exist yet, provide fallback months starting from next month
    if (map.size === 0) {
      const now = new Date();
      for (let i = 0; i < 3; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
        const key = d.toISOString().slice(0, 7);
        const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        map.set(key, { key, label, slots: [] });
      }
    }

    return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
  }, [slotsData]);

  // Active month index
  const [activeMonthIdx, setActiveMonthIdx] = useState(0);

  // Auto-focus the month that has the selectedDate if set, or first month with slots
  useEffect(() => {
    if (selectedDate && monthGroups.length > 0) {
      const targetMonthKey = selectedDate.slice(0, 7);
      const foundIdx = monthGroups.findIndex((m) => m.key === targetMonthKey);
      if (foundIdx !== -1) {
        setActiveMonthIdx(foundIdx);
        return;
      }
    }

    // Default to first month with batches
    const firstWithSlots = monthGroups.findIndex((m) => m.slots.length > 0);
    if (firstWithSlots !== -1) {
      setActiveMonthIdx(firstWithSlots);
    } else {
      setActiveMonthIdx(0);
    }
  }, [selectedDate, monthGroups]);

  const currentMonthGroup = monthGroups[activeMonthIdx] || monthGroups[0] || {
    label: 'Upcoming Dates',
    slots: [],
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    if (onSelectCity) {
      onSelectCity(city);
    }
  };

  const handlePrevMonth = () => {
    if (activeMonthIdx > 0) {
      setActiveMonthIdx(activeMonthIdx - 1);
    }
  };

  const handleNextMonth = () => {
    if (activeMonthIdx < monthGroups.length - 1) {
      setActiveMonthIdx(activeMonthIdx + 1);
    }
  };

  return (
    <section id="available-dates-section" className="scroll-mt-28 py-6 my-4">
      {/* 1. Main Heading */}
      {!hideTitle && (
        <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight mb-4">
          Available Dates
        </h2>
      )}

      {/* 2. City Selector */}
      <div className="mb-4">
        <label className="block text-xs sm:text-sm font-bold text-neutral-900 mb-2">
          Select a City:
        </label>
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {availableCities.map((city) => {
            const isSelected = selectedCity.toLowerCase() === city.toLowerCase();
            return (
              <button
                key={city}
                type="button"
                onClick={() => handleCitySelect(city)}
                style={
                  isSelected
                    ? { backgroundColor: `${themeColor}12`, borderColor: themeColor }
                    : {}
                }
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'shadow-xs text-neutral-900 border'
                    : 'bg-white border border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:text-neutral-900'
                }`}
              >
                <span
                  style={
                    isSelected
                      ? { backgroundColor: themeColor, borderColor: themeColor }
                      : {}
                  }
                  className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                    isSelected ? 'text-white' : 'border-neutral-300 bg-white'
                  }`}
                >
                  {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </span>
                <span>{city}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Subtitle for Selected City */}
      <div className="text-xs sm:text-sm font-bold text-neutral-900 mb-3">
        Available Dates for {selectedCity}:
      </div>

      {/* 4. Calendar / Month Card Container */}
      <div className="rounded-2xl border border-neutral-300 bg-white p-5 sm:p-7 shadow-xs relative">
        {/* Month Navigation Bar */}
        <div className="flex items-center justify-between mb-8 px-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={activeMonthIdx <= 0}
            title="Previous month"
            className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="text-sm sm:text-base font-extrabold text-neutral-900 tracking-tight">
            {currentMonthGroup?.label}
          </div>

          <button
            type="button"
            onClick={handleNextMonth}
            disabled={activeMonthIdx >= monthGroups.length - 1}
            title="Next month"
            className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Date Batches Row */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-neutral-500">
            <Loader2 className="w-6 h-6 animate-spin text-[#FF6B16]" />
            <span className="text-xs font-semibold">Loading departure batches for {selectedCity}...</span>
          </div>
        ) : currentMonthGroup?.slots && currentMonthGroup.slots.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {currentMonthGroup.slots.map((batch, idx) => {
              const batchDate = batch.startDate || batch.date;
              const isSelected = selectedDate === batchDate;
              const isSoldOut = batch.status === 'sold_out' || batch.seatsLeft === 0;

              return (
                <div
                  key={batch._id || batchDate || idx}
                  onClick={() => {
                    if (!isSoldOut && onSelectDate) {
                      onSelectDate(batchDate, batch);
                    }
                  }}
                  className={`relative pt-3.5 group transition-all duration-200 ${
                    isSoldOut ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                  }`}
                >
                  {/* Top Floating Badge */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                    <span
                      style={
                        !isSoldOut && batch.status !== 'filling_fast'
                          ? { backgroundColor: themeColor }
                          : {}
                      }
                      className={`inline-block px-5 py-1 rounded-full text-[11px] font-extrabold tracking-wide text-white shadow-xs ${
                        isSoldOut
                          ? 'bg-rose-500'
                          : batch.status === 'filling_fast'
                          ? 'bg-amber-500'
                          : 'bg-[#FF6B16]'
                      }`}
                    >
                      {isSoldOut
                        ? 'Sold Out'
                        : batch.status === 'filling_fast'
                        ? 'Filling Fast'
                        : 'Available'}
                    </span>
                  </div>

                  {/* Card Box */}
                  <div
                    style={
                      isSelected
                        ? { borderColor: themeColor, backgroundColor: `${themeColor}0a` }
                        : {}
                    }
                    className={`pt-5 pb-4 px-3 sm:px-4 rounded-xl border text-center transition-all bg-white ${
                      isSelected
                        ? 'border-2 ring-2 ring-[#FF6B16]/20 shadow-md'
                        : 'border-neutral-300 hover:border-neutral-400 hover:shadow-xs'
                    }`}
                  >
                    <div className="text-xs sm:text-sm font-extrabold text-neutral-800 tracking-tight">
                      {batch.rangeLabel || batch.label || batchDate}
                    </div>

                    <div className="mt-1 flex items-center justify-center gap-1.5 flex-wrap">
                      {isSoldOut ? (
                        <span className="text-[10px] font-bold text-rose-600">Batch Full</span>
                      ) : batch.seatsLeft !== undefined ? (
                        <span
                          className="text-[10px] font-bold"
                          style={{ color: isSelected ? themeColor : '#10B981' }}
                        >
                          {batch.seatsLeft} seat(s) left
                        </span>
                      ) : null}

                      {batch.priceOverride && (
                        <span
                          className="text-[11px] font-black"
                          style={{ color: themeColor }}
                        >
                          ₹{batch.priceOverride.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    {batch.note && (
                      <span className="block text-[10px] text-neutral-400 font-medium truncate mt-0.5">
                        {batch.note}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 text-neutral-500">
            <Calendar className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-xs sm:text-sm font-bold text-neutral-700">
              No fixed batches scheduled for {currentMonthGroup?.label} from {selectedCity}.
            </p>
            <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
              You can pick any custom date from the calendar on the right or message us on WhatsApp for custom private batches.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
