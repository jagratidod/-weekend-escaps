import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePackages } from '../../context/PackageContext';
import PackageCard from './PackageCard';
import SectionHeading from '../common/SectionHeading';
import Container from '../common/Container';
import FadeIn from '../animations/FadeIn';

export function Packages() {
  const { trendingPackages, packages } = usePackages();
  const displayPackages = trendingPackages && trendingPackages.length > 0 ? trendingPackages : packages;

  const scrollContainerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Track active slide on scroll for mobile pagination dots & controls
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const card = container.children[0];
    const cardWidth = card ? card.offsetWidth + 16 : 295;
    const newIndex = Math.round(container.scrollLeft / cardWidth);
    setActiveIndex(Math.min(Math.max(newIndex, 0), displayPackages.length - 1));
  };

  const scrollToIndex = (idx) => {
    if (!scrollContainerRef.current) return;
    const cards = scrollContainerRef.current.children;
    if (cards[idx]) {
      cards[idx].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      setActiveIndex(idx);
    }
  };

  const handlePrev = () => {
    if (!scrollContainerRef.current) return;
    const prevIdx = Math.max(activeIndex - 1, 0);
    scrollToIndex(prevIdx);
  };

  const handleNext = () => {
    if (!scrollContainerRef.current) return;
    const nextIdx = Math.min(activeIndex + 1, displayPackages.length - 1);
    scrollToIndex(nextIdx);
  };

  return (
    <section className="py-8 sm:py-10 md:py-14 bg-[#F7F7F5]">
      <Container>
        {/* Section Heading matching screenshot */}
        <FadeIn direction="up">
          <SectionHeading
            eyebrow="Popular Packages"
            title="Trending Tour Packages"
            subtitle="Handpicked trips with the best experiences, explorations and value."
            size="compact"
            action={
              <div className="w-full sm:w-auto">
                {/* ── Mobile View Control Bar (Full Width, Balanced & Touch-Friendly) ── */}
                <div className="flex sm:hidden items-center justify-between w-full pt-1">
                  {/* Left: Quick Navigation Arrows + Slide Counter */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handlePrev}
                        disabled={activeIndex === 0}
                        className={`w-9 h-9 rounded-full bg-white border flex items-center justify-center transition-all shadow-xs cursor-pointer ${
                          activeIndex === 0
                            ? 'border-neutral-200 text-neutral-300 opacity-40 cursor-not-allowed'
                            : 'border-neutral-200 hover:border-[#FF6B16] text-neutral-700 hover:text-[#FF6B16] active:scale-95'
                        }`}
                        aria-label="Previous package"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleNext}
                        disabled={activeIndex === displayPackages.length - 1}
                        className={`w-9 h-9 rounded-full bg-white border flex items-center justify-center transition-all shadow-xs cursor-pointer ${
                          activeIndex === displayPackages.length - 1
                            ? 'border-neutral-200 text-neutral-300 opacity-40 cursor-not-allowed'
                            : 'border-neutral-200 hover:border-[#FF6B16] text-neutral-700 hover:text-[#FF6B16] active:scale-95'
                        }`}
                        aria-label="Next package"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Active slide badge */}
                    <span className="text-[11px] font-bold text-neutral-400 pl-0.5 tracking-wider tabular-nums">
                      <span className="text-neutral-900 font-extrabold">{String(activeIndex + 1).padStart(2, '0')}</span>
                      {' / '}
                      {String(displayPackages.length).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Right: View All Pill Button */}
                  <Link
                    to="/packages"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-neutral-200 hover:border-[#FF6B16] bg-white text-xs font-bold text-neutral-800 hover:text-[#FF6B16] transition-all shadow-xs active:scale-95 group"
                  >
                    <span className="hidden xs:inline">View All Packages</span>
                    <span className="xs:hidden inline">View All</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>

                {/* ── Desktop & Tablet View Button (sm and up) ── */}
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    to="/packages"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-neutral-300 hover:border-[#FF6B16] text-xs font-bold text-neutral-800 hover:text-[#FF6B16] transition-all bg-white shadow-xs group"
                  >
                    <span>View All Packages</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            }
          />
        </FadeIn>

        {/* Packages: Horizontal scrollable on mobile (right-to-left swipe), 4-col Grid on desktop */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar snap-x snap-mandatory scroll-smooth"
        >
          {displayPackages.map((pkg, idx) => (
            <div
              key={pkg._id || pkg.id}
              className="shrink-0 w-[82vw] max-w-[295px] sm:w-auto sm:max-w-none snap-center sm:snap-align-none"
            >
              <FadeIn direction="up" delay={idx * 0.1}>
                <PackageCard pkg={pkg} />
              </FadeIn>
            </div>
          ))}
        </div>

        {/* Mobile Swipe Pagination Indicator Dots */}
        <div className="flex sm:hidden items-center justify-center gap-1.5 mt-3">
          {displayPackages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollToIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                activeIndex === idx
                  ? 'w-6 bg-[#FF6B16]'
                  : 'w-1.5 bg-neutral-300 hover:bg-neutral-400'
              }`}
              aria-label={`Go to package ${idx + 1}`}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

export default Packages;
