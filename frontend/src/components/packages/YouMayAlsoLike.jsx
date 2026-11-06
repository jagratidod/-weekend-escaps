import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass } from 'lucide-react';
import { usePackages } from '../../context/PackageContext';
import PackageCard from '../home/PackageCard';

export default function YouMayAlsoLike({ currentPackage }) {
  const { packages } = usePackages();

  const currentCategory = currentPackage?.travelType || 'Trekking';
  const currentId = currentPackage?.id || currentPackage?._id;
  const currentName = (currentPackage?.name || currentPackage?.title || '').trim().toLowerCase();

  // Smart filtering: exclude current package and prioritize matching category, location, and difficulty
  const relatedPackages = useMemo(() => {
    if (!Array.isArray(packages) || packages.length === 0) return [];

    const currentTravelType = (currentPackage?.travelType || '').toLowerCase().trim();
    const currentLocation = (currentPackage?.location || '').toLowerCase();
    const currentDifficulty = (currentPackage?.difficulty || '').toLowerCase();

    // 1. Exclude the current package (check id, _id, and name)
    const available = packages.filter((p) => {
      if (p.isActive === false) return false;
      const pId = p.id || p._id;
      const pName = (p.name || p.title || '').trim().toLowerCase();
      if (currentId && (pId === currentId || p._id === currentId || p.id === currentPackage?._id)) {
        return false;
      }
      if (currentName && pName === currentName) {
        return false;
      }
      return true;
    });

    if (available.length === 0) return [];

    // 2. Score each candidate
    const scored = available.map((p) => {
      let score = 0;
      const pTravelType = (p.travelType || '').toLowerCase().trim();
      const pLocation = (p.location || '').toLowerCase();
      const pDifficulty = (p.difficulty || '').toLowerCase();

      // Primary criteria: Category / travelType match
      if (currentTravelType && pTravelType === currentTravelType) {
        score += 100;
      } else if (
        currentTravelType &&
        (pTravelType.includes(currentTravelType) || currentTravelType.includes(pTravelType))
      ) {
        score += 60;
      }

      // Secondary criteria: Destination / Location keyword match (e.g. Uttarakhand, Himachal, Kashmir)
      if (currentLocation && pLocation) {
        const locKeywords = currentLocation
          .split(/[,\s]+/)
          .map((w) => w.trim())
          .filter((w) => w.length > 3 && !['india', 'state', 'near', 'north', 'south'].includes(w));

        for (const kw of locKeywords) {
          if (pLocation.includes(kw)) {
            score += 35;
            break;
          }
        }
      }

      // Tertiary criteria: Similar trek difficulty
      if (currentDifficulty && pDifficulty && currentDifficulty === pDifficulty) {
        score += 15;
      }

      // Bonus for high ratings / featured
      if (p.rating) {
        score += Math.min(Number(p.rating), 5) * 2;
      }
      if (p.badge) {
        score += 5;
      }

      return { pkg: p, score };
    });

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);

    // Take top 4 packages
    return scored.slice(0, 4).map((item) => item.pkg);
  }, [packages, currentPackage, currentId, currentName]);

  // Don't render section if there are no other packages to display
  if (!relatedPackages || relatedPackages.length === 0) {
    return null;
  }

  return (
    <section
      id="you-may-also-like-section"
      className="w-full py-16 sm:py-20 bg-[#F7F7F5] border-t border-neutral-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#111111] tracking-tight">
              You May Also <span className="text-[#FF6B16]">Like</span>
            </h2>

            <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-2 max-w-xl">
              Handpicked {currentCategory} journeys and high-altitude adventures with similar thrills,
              curated for passionate travelers.
            </p>
          </div>

          {/* Quick link to view category packages */}
          <Link
            to={`/packages?type=${encodeURIComponent(currentCategory)}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-neutral-900 text-neutral-800 hover:text-white border border-neutral-200/80 hover:border-neutral-900 text-xs sm:text-sm font-bold shadow-2xs transition-all duration-200 group self-start md:self-auto cursor-pointer"
          >
            <span>More in {currentCategory}</span>
            <ArrowRight className="w-4 h-4 text-[#FF6B16] group-hover:text-white group-hover:translate-x-1 transition-all" />
          </Link>
        </div>

        {/* Responsive Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {relatedPackages.map((item) => (
            <PackageCard key={item.id || item._id} pkg={item} />
          ))}
        </div>

        {/* Bottom Explore All CTA */}
        <div className="mt-12 text-center pt-8 border-t border-neutral-200/60">
          <Link
            to="/packages"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-neutral-900 hover:bg-[#FF6B16] text-white font-extrabold text-xs sm:text-sm tracking-wide transition-all shadow-md hover:shadow-lg shadow-neutral-900/10 cursor-pointer"
          >
            <Compass className="w-4 h-4 text-orange-400" />
            <span>Explore All Tour Packages</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
