import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PACKAGES } from '../data/packages';
import PackageCard from '../components/home/PackageCard';
import Container from '../components/common/Container';
import { Search, Filter, SlidersHorizontal, RotateCcw } from 'lucide-react';

export function PackagesPage() {
  const [searchParams] = useSearchParams();
  const initialDestination = searchParams.get('destination') || '';
  const initialType = searchParams.get('type') || 'All';

  const [searchTerm, setSearchTerm] = useState(initialDestination);
  const [selectedType, setSelectedType] = useState(initialType);
  const [maxPrice, setMaxPrice] = useState(60000);

  const travelTypes = ['All', 'Trekking', 'Honeymoon & Leisure', 'Adventure', 'International'];

  const filteredPackages = PACKAGES.filter((pkg) => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'All' || pkg.travelType.toLowerCase().includes(selectedType.toLowerCase());
    const matchesPrice = pkg.price <= maxPrice;

    return matchesSearch && matchesType && matchesPrice;
  });

  const handleReset = () => {
    setSearchTerm('');
    setSelectedType('All');
    setMaxPrice(60000);
  };

  return (
    <div className="pt-28 pb-24 bg-[#F7F7F5] min-h-screen">
      <Container>
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
                max="60000"
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
                className="p-3 rounded-2xl border border-neutral-200 hover:border-[#FF6B16] text-neutral-500 hover:text-[#FF6B16] transition-colors"
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
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200">
            <p className="text-lg font-bold text-neutral-800">No packages match your criteria.</p>
            <p className="text-sm text-neutral-500 mt-1">Try resetting the filters or modifying your search terms.</p>
            <button
              onClick={handleReset}
              className="mt-4 px-6 py-2.5 rounded-full bg-[#FF6B16] text-white text-xs font-bold shadow-md hover:bg-[#e05809]"
            >
              Reset Filters
            </button>
          </div>
        )}
      </Container>
    </div>
  );
}

export default PackagesPage;
