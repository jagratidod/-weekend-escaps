import React, { useState } from 'react';
import { DESTINATIONS } from '../data/destinations';
import DestinationCard from '../components/home/DestinationCard';
import Container from '../components/common/Container';
import SectionHeading from '../components/common/SectionHeading';
import { Compass, Filter, MapPin } from 'lucide-react';

export function DestinationsPage() {
  const [selectedFilter, setSelectedFilter] = useState('All');

  const categories = [
    'All',
    'Trekking',
    'Honeymoon & Leisure',
    'Adventure & Hill Station',
    'Expedition & Desert',
    'International Island'
  ];

  const filteredDestinations = selectedFilter === 'All'
    ? DESTINATIONS
    : DESTINATIONS.filter((d) => d.category.toLowerCase().includes(selectedFilter.toLowerCase()) || d.subtitle.toLowerCase().includes(selectedFilter.toLowerCase()));

  return (
    <div className="pt-28 pb-24 bg-[#F7F7F5] min-h-screen">
      <Container>
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#FF6B16]"></span>
            <span className="text-[#FF6B16] font-bold text-xs uppercase tracking-widest">
              HANDPICKED LOCATIONS
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-[#111111] tracking-tight">
            Explore All Destinations
          </h1>
          <p className="mt-3 text-neutral-600 text-base sm:text-lg">
            From towering snow-capped Himalayan peaks to tranquil turquoise tropical bays, find the ideal backdrop for your next escape.
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-14">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === cat
                  ? 'bg-[#FF6B16] text-white shadow-md shadow-[#FF6B16]/30'
                  : 'bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid of Destination Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredDestinations.map((dest) => (
            <DestinationCard key={dest.id} destination={dest} />
          ))}
        </div>
      </Container>
    </div>
  );
}

export default DestinationsPage;
