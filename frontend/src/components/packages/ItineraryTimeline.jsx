import React from 'react';
import { motion } from 'framer-motion';

// Curated high-res photos for itinerary milestones
const ITINERARY_PHOTOS = {
  'kedarkantha-trek': [
    '/images/gallery/gallery-2.webp', // Day 1: Mountain drive
    '/images/gallery/gallery-4.webp', // Day 2: Pine forest & Juda Ka Talab lake
    '/images/gallery/gallery-1.webp', // Day 3: Snow camp at Basecamp
    '/newimage/exploresection/kedarkantha.png', // Day 4: Kedarkantha Summit
    '/images/gallery/gallery-5.webp', // Day 5: Mountain village & orchards
    '/images/gallery/gallery-6.webp', // Day 6: River valley return
  ],
  default: [
    '/images/gallery/gallery-1.webp',
    '/images/gallery/gallery-2.webp',
    '/images/gallery/gallery-3.webp',
    '/images/gallery/gallery-4.webp',
    '/images/gallery/gallery-5.webp',
    '/images/gallery/gallery-6.webp',
  ],
};

const DEFAULT_TIMINGS = [
  'DAY 01 • SCENIC DRIVE',
  'DAY 02 • APPROX. 4-5 HOURS TREK',
  'DAY 03 • ALTITUDE 11,250 FT',
  'DAY 04 • SUMMIT DAY 12,500 FT',
  'DAY 05 • VILLAGE DESCENT',
  'DAY 06 • JOURNEY WRAP-UP',
];

export default function ItineraryTimeline({ itinerary = [], packageId = 'kedarkantha-trek' }) {
  if (!itinerary || itinerary.length === 0) return null;

  const photoList = ITINERARY_PHOTOS[packageId] || ITINERARY_PHOTOS.default;

  const firstDay = itinerary[0];
  const middleDays = itinerary.slice(1, itinerary.length - 1);
  const lastDay = itinerary.length > 1 ? itinerary[itinerary.length - 1] : null;

  return (
    <div className="py-6 select-none font-sans overflow-hidden">
      {/* ── Top Step 1 (Centered Header with Loop Curve from Reference) ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
        className="flex flex-col items-center text-center max-w-md mx-auto"
      >
        <span className="px-3.5 py-1 rounded-full border border-neutral-900/60 text-[10px] font-mono tracking-widest uppercase font-semibold text-neutral-800 bg-white/60">
          {DEFAULT_TIMINGS[0] || firstDay.day}
        </span>

        <h3 className="text-xl sm:text-2xl font-black text-[#111111] tracking-tight mt-2.5">
          {firstDay.title}
        </h3>

        <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mt-2 max-w-sm">
          {firstDay.desc}
        </p>
      </motion.div>

      {/* ── Whimsical Loop Curve SVG from Reference Image ── */}
      <div className="flex flex-col items-center justify-center my-3">
        <div className="w-0.5 h-7 bg-neutral-900" />
        <svg
          className="w-10 h-16 text-neutral-900 -my-0.5"
          viewBox="0 0 40 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 20,0 L 20,16 C 20,26 34,28 34,38 C 34,48 10,48 10,38 C 10,28 20,30 20,44 L 20,64"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <div className="w-0.5 h-7 bg-neutral-900" />
      </div>

      {/* ── Alternating Timeline Body (Desktop: Center spine; Mobile: Left spine) ── */}
      <div className="relative">
        {/* Continuous Center Vertical Line (Desktop md+) */}
        <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-neutral-900" />

        {/* Continuous Left Vertical Line (Mobile <md) */}
        <div className="md:hidden absolute left-4 top-0 bottom-0 w-0.5 bg-neutral-900" />

        <div className="space-y-12 sm:space-y-16">
          {middleDays.map((day, idx) => {
            const actualIndex = idx + 1; // 1-based index for photos
            const photoUrl = photoList[actualIndex % photoList.length];
            const timingBadge = DEFAULT_TIMINGS[actualIndex] || day.day;
            const isTextOnLeft = idx % 2 === 0; // Alternating zig-zag

            return (
              <div
                key={`itinerary-${actualIndex}`}
                className="relative flex flex-col md:flex-row items-center pl-10 md:pl-0"
              >
                {/* ── Center / Left Milestone Dot on the Line ── */}
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 top-4 w-3 h-3 rounded-full bg-neutral-900 border-2 border-[#F7F7F5] z-10 shadow-xs" />

                {/* ── Desktop Left Side ── */}
                <div className="hidden md:flex w-1/2 pr-10 justify-end">
                  {isTextOnLeft ? (
                    // Text block on Left (fade in)
                    <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
                      className="text-right max-w-sm"
                    >
                      <span className="px-3.5 py-1 rounded-full border border-neutral-900/60 text-[10px] font-mono tracking-widest uppercase font-semibold text-neutral-800 bg-white/60 inline-block">
                        {timingBadge}
                      </span>
                      <h4 className="text-lg sm:text-xl font-black text-[#111111] tracking-tight mt-2.5">
                        {day.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mt-2">
                        {day.desc}
                      </p>
                    </motion.div>
                  ) : (
                    // Photo on Left (enters from RIGHT to LEFT with smooth cubic-bezier animation)
                    <motion.div
                      initial={{ opacity: 0, x: 80 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.25 }}
                      transition={{ duration: 0.9, ease: [0.25, 1, 0.5, 1] }}
                      className="w-full max-w-md rounded-2xl overflow-hidden shadow-md border border-neutral-200/60 bg-neutral-100 group"
                    >
                      <img
                        src={photoUrl}
                        alt={day.title}
                        className="w-full h-52 lg:h-60 object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </motion.div>
                  )}
                </div>

                {/* ── Desktop Right Side ── */}
                <div className="hidden md:flex w-1/2 pl-10 justify-start">
                  {!isTextOnLeft ? (
                    // Text block on Right
                    <motion.div
                      initial={{ opacity: 0, x: 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
                      className="text-left max-w-sm"
                    >
                      <span className="px-3.5 py-1 rounded-full border border-neutral-900/60 text-[10px] font-mono tracking-widest uppercase font-semibold text-neutral-800 bg-white/60 inline-block">
                        {timingBadge}
                      </span>
                      <h4 className="text-lg sm:text-xl font-black text-[#111111] tracking-tight mt-2.5">
                        {day.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mt-2">
                        {day.desc}
                      </p>
                    </motion.div>
                  ) : (
                    // Photo on Right (enters from RIGHT to LEFT with smooth animation)
                    <motion.div
                      initial={{ opacity: 0, x: 90 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.25 }}
                      transition={{ duration: 0.9, ease: [0.25, 1, 0.5, 1] }}
                      className="w-full max-w-md rounded-2xl overflow-hidden shadow-md border border-neutral-200/60 bg-neutral-100 group"
                    >
                      <img
                        src={photoUrl}
                        alt={day.title}
                        className="w-full h-52 lg:h-60 object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </motion.div>
                  )}
                </div>

                {/* ── Mobile Layout (Stacked Vertically, Image slides right to left) ── */}
                <div className="md:hidden w-full space-y-3">
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6 }}
                  >
                    <span className="px-3 py-0.5 rounded-full border border-neutral-900/60 text-[9px] font-mono tracking-widest uppercase font-semibold text-neutral-800 bg-white/60 inline-block">
                      {timingBadge}
                    </span>
                    <h4 className="text-base font-black text-[#111111] tracking-tight mt-1.5">
                      {day.title}
                    </h4>
                    <p className="text-xs text-neutral-600 leading-relaxed mt-1">
                      {day.desc}
                    </p>
                  </motion.div>

                  {/* Mobile image slides right to left */}
                  <motion.div
                    initial={{ opacity: 0, x: 60 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.85, ease: [0.25, 1, 0.5, 1] }}
                    className="rounded-xl overflow-hidden shadow-sm border border-neutral-200/60 bg-neutral-100"
                  >
                    <img
                      src={photoUrl}
                      alt={day.title}
                      className="w-full h-44 object-cover"
                    />
                  </motion.div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Final Wrap-Up Step (Last Day) ── */}
      {lastDay && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
          className="relative mt-12 sm:mt-16 pt-8 border-t border-neutral-200"
        >
          {/* Milestone dot at center */}
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2 -top-1.5 w-3 h-3 rounded-full bg-neutral-900 border-2 border-[#F7F7F5]" />

          <div className="flex flex-col items-center text-center max-w-md mx-auto">
            <span className="px-3.5 py-1 rounded-full border border-neutral-900/60 text-[10px] font-mono tracking-widest uppercase font-semibold text-neutral-800 bg-white/60">
              {DEFAULT_TIMINGS[DEFAULT_TIMINGS.length - 1] || lastDay.day}
            </span>

            <h3 className="text-xl sm:text-2xl font-black text-[#111111] tracking-tight mt-2.5">
              {lastDay.title}
            </h3>

            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mt-2 max-w-sm">
              {lastDay.desc}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
