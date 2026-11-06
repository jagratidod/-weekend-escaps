import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

const DEFAULT_SLIDES = [
  {
    image: '/newimage/about/bali.png',
    subtitle: 'Tropical Paradise',
    title: 'BALI',
    description:
      'Discover pristine beaches, ancient temples, and lush rice terraces in the Island of Gods.',
  },
  {
    image: '/newimage/about/kashmir.png',
    subtitle: 'Heaven on Earth',
    title: 'KASHMIR',
    description:
      'Float on Dal Lake houseboats, wander through saffron fields, and gaze at snow-capped peaks.',
  },
  {
    image: '/newimage/about/kedarkantha.png',
    subtitle: 'Summit the Peaks',
    title: 'KEDARKANTHA',
    description:
      'Trek through dense pine forests to a pristine summit with 360° Himalayan panoramas.',
  },
  {
    image: '/newimage/about/manali.png',
    subtitle: 'Mountain Magic',
    title: 'MANALI',
    description:
      'Rohtang Pass adventures, riverside camping, and old-town charm in the heart of Himachal.',
  },
  {
    image: '/newimage/about/vally.png',
    subtitle: 'Valley of Flowers',
    title: 'VALLEY OF FLOWERS',
    description:
      'UNESCO-listed alpine meadows bursting with rare Himalayan wildflowers and butterflies.',
  },
  {
    image: '/newimage/about/image1.png',
    subtitle: 'Wild Escapes',
    title: 'WEEKEND ESCAPES',
    description:
      'Handpicked trails, curated stays, and unforgettable moments — your next adventure starts here.',
  },
];

const DEFAULT_AUTO_INTERVAL = 4500;
const DURATION_MS = 1100;
const CARD_WIDTH = 195; // px
const CARD_GAP = 16; // px
const SHIFT_DISTANCE = CARD_WIDTH + CARD_GAP; // ~211px

export default function AboutHero({ slides: propSlides, autoInterval: propInterval }) {
  const slides = propSlides && propSlides.length > 0 ? propSlides : DEFAULT_SLIDES;
  const AUTO_INTERVAL = propInterval || DEFAULT_AUTO_INTERVAL;
  const totalSlides = slides.length;

  const [activeIndex, setActiveIndex] = useState(0);
  const [textVisible, setTextVisible] = useState(true);

  // Transition state
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [zoomTarget, setZoomTarget] = useState(null);
  const [zoomStyle, setZoomStyle] = useState({});
  const [trackShift, setTrackShift] = useState(0);

  const timerRef = useRef(null);
  const slot0Ref = useRef(null);
  const sectionRef = useRef(null);

  // Keep activeIndex within bounds if slide count changes
  useEffect(() => {
    if (activeIndex >= totalSlides) {
      setActiveIndex(0);
    }
  }, [totalSlides, activeIndex]);

  // Preload all images on mount or when slides change
  useEffect(() => {
    slides.forEach((s) => {
      if (s.image) {
        const img = new Image();
        img.src = s.image;
      }
    });
  }, [slides]);

  // Upcoming cards: up to 4 upcoming thumbnail offsets
  const thumbIndices = [1, 2, 3, 4]
    .slice(0, Math.min(4, Math.max(1, totalSlides - 1)))
    .map((offset) => (activeIndex + offset) % totalSlides);

  const runNextTransition = useCallback(() => {
    if (isTransitioning) return;

    const nextIdx = (activeIndex + 1) % totalSlides;
    const slot0El = slot0Ref.current;
    const sectionEl = sectionRef.current;

    if (!slot0El || !sectionEl) {
      setActiveIndex(nextIdx);
      return;
    }

    const slotRect = slot0El.getBoundingClientRect();
    const sectionRect = sectionEl.getBoundingClientRect();

    const startLeft = slotRect.left - sectionRect.left;
    const startTop = slotRect.top - sectionRect.top;
    const startWidth = slotRect.width;
    const startHeight = slotRect.height;

    // 1. Prepare zoom overlay at Slot 0's initial position (z-index 10: BEHIND the cards at z-35)
    setZoomTarget(nextIdx);
    setIsTransitioning(true);
    setZoomStyle({
      position: 'absolute',
      left: `${startLeft}px`,
      top: `${startTop}px`,
      width: `${startWidth}px`,
      height: `${startHeight}px`,
      borderRadius: '16px',
      zIndex: 10, // Underneath text (z-25) and thumbnails (z-35)
      transition: 'none',
      overflow: 'hidden',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
    });

    // Fade out text slightly
    setTextVisible(false);

    // 2. Animate simultaneously:
    //    - Zoom overlay expands to 100% full screen
    //    - Thumbnail track translates left by exactly 1 card + gap so other cards move forward
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Track slides left forward
        setTrackShift(SHIFT_DISTANCE);

        // Zoom card expands to fill screen
        setZoomStyle({
          position: 'absolute',
          left: '0px',
          top: '0px',
          width: '100%',
          height: '100%',
          borderRadius: '0px',
          zIndex: 10,
          transition: `all ${DURATION_MS}ms cubic-bezier(0.25, 1, 0.5, 1)`,
          overflow: 'hidden',
          boxShadow: 'none',
        });
      });
    });

    // 3. Reset after transition finishes
    setTimeout(() => {
      setActiveIndex(nextIdx);
      setIsTransitioning(false);
      setZoomTarget(null);
      setZoomStyle({});
      setTrackShift(0); // instant reset (now that activeIndex advanced, indices naturally shifted)
      setTimeout(() => setTextVisible(true), 60);
    }, DURATION_MS + 40);
  }, [activeIndex, isTransitioning, totalSlides]);

  // Auto-play timer
  useEffect(() => {
    timerRef.current = setInterval(runNextTransition, AUTO_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [runNextTransition]);

  // Manual Previous
  const handlePrev = useCallback(() => {
    if (isTransitioning) return;
    clearInterval(timerRef.current);

    const prevIdx = (activeIndex - 1 + totalSlides) % totalSlides;
    setTextVisible(false);

    setTimeout(() => {
      setActiveIndex(prevIdx);
      setTimeout(() => setTextVisible(true), 60);
      timerRef.current = setInterval(runNextTransition, AUTO_INTERVAL);
    }, 250);
  }, [activeIndex, isTransitioning, totalSlides, runNextTransition]);

  // Manual Next
  const handleNext = useCallback(() => {
    if (isTransitioning) return;
    clearInterval(timerRef.current);
    runNextTransition();
    timerRef.current = setInterval(runNextTransition, AUTO_INTERVAL);
  }, [isTransitioning, runNextTransition]);

  // Click on a specific thumbnail
  const handleCardClick = useCallback(
    (indexInThumbs) => {
      if (isTransitioning) return;
      clearInterval(timerRef.current);

      if (indexInThumbs === 0) {
        runNextTransition();
      } else {
        const targetSlideIdx = thumbIndices[indexInThumbs];
        setTextVisible(false);
        setTimeout(() => {
          setActiveIndex(targetSlideIdx);
          setTimeout(() => setTextVisible(true), 60);
          timerRef.current = setInterval(runNextTransition, AUTO_INTERVAL);
        }, 250);
      }
    },
    [isTransitioning, thumbIndices, runNextTransition]
  );

  const currentSlide = slides[activeIndex] || slides[0] || {};

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen overflow-hidden select-none bg-[#0a0a0a]"
    >
      {/* ── Layer 1: Base Background Image (z-0) ── */}
      <div className="absolute inset-0 z-0">
        <img
          key={`hero-bg-${activeIndex}`}
          src={currentSlide.image || '/newimage/about/bali.png'}
          alt={currentSlide.title || 'Hero slide'}
          className="w-full h-full object-cover animate-kenBurns"
        />
      </div>

      {/* ── Layer 2: Zoom Overlay (Card 1 expanding to cover full screen at z-10) ── */}
      {zoomTarget !== null && (
        <div style={zoomStyle}>
          <img
            src={slides[zoomTarget].image}
            alt={slides[zoomTarget].title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
      )}

      {/* ── Layer 3: Vignette & Gradient Overlays (z-15, above zoom but below text/thumbnails) ── */}
      <div className="absolute inset-0 z-[15] bg-gradient-to-r from-black/85 via-black/45 to-transparent pointer-events-none" />
      <div className="absolute inset-0 z-[15] bg-gradient-to-t from-black/75 via-transparent to-black/30 pointer-events-none" />

      {/* ── Layer 4: Left Content Details (z-25) ── */}
      <div
        className={`absolute z-[25] left-0 top-0 h-full flex flex-col justify-center px-6 sm:px-10 md:px-16 lg:px-20 max-w-2xl transition-all duration-500 ease-out ${
          textVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-8 pointer-events-none'
        }`}
      >
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B16] animate-pulse"></span>
          <span className="text-[#FF6B16] font-extrabold text-xs sm:text-sm uppercase tracking-[0.25em]">
            {currentSlide.subtitle}
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[0.92] tracking-tight mb-4 sm:mb-6 drop-shadow-2xl">
          {currentSlide.title}
        </h1>

        <p className="text-white/80 text-sm sm:text-base md:text-lg leading-relaxed max-w-lg mb-6 sm:mb-8 font-medium">
          {currentSlide.description}
        </p>

        <div className="flex items-center gap-4">
          <button className="group flex items-center gap-2.5 bg-[#FF6B16] hover:bg-[#ff7d33] text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg shadow-[#FF6B16]/30 hover:shadow-[#FF6B16]/50 transition-all duration-300 transform hover:-translate-y-0.5">
            <MapPin className="w-4 h-4" />
            Discover Location
          </button>
        </div>
      </div>

      {/* ── Layer 5: Right Thumbnail Carousel Track (z-35: NEVER COVERED OR HIDDEN) ── */}
      <div className="absolute z-[35] right-6 sm:right-10 md:right-12 lg:right-16 bottom-[10%] md:bottom-1/2 md:translate-y-1/2 hidden md:block">
        {/* Track holding the 4 cards (Slot 0, 1, 2, 3) */}
        <div
          className="flex items-center"
          style={{
            gap: `${CARD_GAP}px`,
            transform: `translateX(-${trackShift}px)`,
            transition: isTransitioning
              ? `transform ${DURATION_MS}ms cubic-bezier(0.25, 1, 0.5, 1)`
              : 'none',
          }}
        >
          {thumbIndices.map((slideIdx, i) => {
            const isSlot0 = i === 0;
            // The card sliding into position 0 gets highlighted
            const isTargetHighlight = !isTransitioning ? (i === 0) : (i === 1);

            return (
              <div
                key={`thumb-card-${activeIndex}-${slideIdx}-${i}`}
                ref={isSlot0 ? slot0Ref : null}
                onClick={() => handleCardClick(i)}
                style={{
                  width: `${CARD_WIDTH}px`,
                  height: '275px',
                  opacity: isTransitioning && isSlot0 ? 0 : 1,
                  transition: 'opacity 0.3s ease-out',
                }}
                className={`relative rounded-2xl overflow-hidden shadow-2xl cursor-pointer flex-shrink-0 group border-2 transition-all duration-500 ${
                  isTargetHighlight
                    ? 'border-[#FF6B16] ring-4 ring-[#FF6B16]/35 shadow-xl shadow-[#FF6B16]/25 scale-[1.02]'
                    : 'border-white/20 hover:border-white/60 scale-100 opacity-90'
                }`}
              >
                <img
                  src={slides[slideIdx].image}
                  alt={slides[slideIdx].title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Vignette gradient inside card */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                {/* Card labels */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white/60 text-[10px] uppercase tracking-widest font-bold">
                    {slides[slideIdx].subtitle}
                  </p>
                  <p className="text-white text-sm lg:text-base font-black leading-tight mt-0.5 tracking-wide">
                    {slides[slideIdx].title}
                  </p>
                </div>

                {/* Active Glowing Dot */}
                {isTargetHighlight && (
                  <div className="absolute top-3 right-3 flex items-center justify-center">
                    <span className="absolute w-3.5 h-3.5 rounded-full bg-[#FF6B16] animate-ping opacity-75"></span>
                    <span className="relative w-2.5 h-2.5 rounded-full bg-[#FF6B16] shadow-md shadow-[#FF6B16]"></span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Carousel Navigation Controls (< > and progress line) */}
        <div className="flex items-center justify-between mt-6 px-1">
          {/* Arrow Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              disabled={isTransitioning}
              className="w-10 h-10 rounded-full border border-white/30 hover:border-white bg-black/50 backdrop-blur-md text-white flex items-center justify-center transition-all hover:bg-white hover:text-black hover:scale-105 active:scale-95 disabled:opacity-40"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              disabled={isTransitioning}
              className="w-10 h-10 rounded-full border border-white/30 hover:border-white bg-black/50 backdrop-blur-md text-white flex items-center justify-center transition-all hover:bg-white hover:text-black hover:scale-105 active:scale-95 disabled:opacity-40"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Indicator line */}
          <div className="flex items-center gap-3">
            <div className="w-28 sm:w-36 h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FF6B16] rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${((activeIndex + 1) / totalSlides) * 100}%`,
                }}
              />
            </div>
            <span className="text-white/70 font-mono text-xs font-bold">
              0{activeIndex + 1}
            </span>
          </div>
        </div>
      </div>

      {/* ── Mobile Thumbnail Preview Strip (z-35) ── */}
      <div className="absolute z-[35] bottom-16 left-4 right-4 flex md:hidden gap-2 justify-center">
        {thumbIndices.slice(0, 3).map((idx, i) => (
          <div
            key={`mob-thumb-${idx}-${i}`}
            onClick={() => handleCardClick(i)}
            className={`relative w-24 h-28 rounded-xl overflow-hidden cursor-pointer flex-shrink-0 border-2 ${
              i === 0 ? 'border-[#FF6B16]' : 'border-white/20'
            }`}
          >
            <img
              src={slides[idx].image}
              alt={slides[idx].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <p className="absolute bottom-1.5 left-1.5 right-1.5 text-white text-[10px] font-bold truncate">
              {slides[idx].title}
            </p>
          </div>
        ))}
      </div>

      {/* ── Slide Dots (bottom center on mobile, z-35) ── */}
      <div className="absolute z-[35] bottom-5 left-1/2 -translate-x-1/2 flex md:hidden items-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={`mob-dot-${idx}`}
            onClick={() => {
              if (!isTransitioning && idx !== activeIndex) {
                setActiveIndex(idx);
              }
            }}
            className={`rounded-full transition-all duration-300 ${
              idx === activeIndex
                ? 'w-6 h-2 bg-[#FF6B16]'
                : 'w-2 h-2 bg-white/40'
            }`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
