import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Compass, CalendarDays, ShieldCheck, Plane, MapPin, Sparkles } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function BookingProcess() {
  const sectionRef = useRef(null);

  // Desktop refs
  const desktopActivePathRef = useRef(null);
  const desktopBeaconRef = useRef(null);

  // Mobile refs
  const mobileActivePathRef = useRef(null);
  const mobileBeaconRef = useRef(null);

  // Active step state: 0 (Explore), 1 (Plan), 2 (Book), 3 (Travel)
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: 1,
      stepNumber: "01",
      title: "Explore",
      tagline: "Curated Trails & Stays",
      desc: "Browse our handpicked mountain treks, scenic road trips, and luxury weekend getaways.",
      icon: Compass,
      position: "above" // card sits above node on desktop
    },
    {
      num: 2,
      stepNumber: "02",
      title: "Plan",
      tagline: "Bespoke Itinerary",
      desc: "Customize dates, group sizes, and special preferences with our certified expedition marshals.",
      icon: CalendarDays,
      position: "below" // card sits below node on desktop
    },
    {
      num: 3,
      stepNumber: "03",
      title: "Book",
      tagline: "Instant & Secure",
      desc: "Lock in your slots with 100% verified payment gateways, zero hidden charges, and trip insurance.",
      icon: ShieldCheck,
      position: "above" // card sits above node on desktop
    },
    {
      num: 4,
      stepNumber: "04",
      title: "Travel",
      tagline: "Lifelong Memories",
      desc: "Pack your bags, meet your trip leader at basecamp, and embark on your unforgettable escape.",
      icon: Plane,
      position: "below" // card sits below node on desktop
    }
  ];

  // Full-width edge-to-edge cubic bezier wave path through the 4 steps:
  // Step 1: (125, 170) - Valley
  // Step 2: (375, 80) - Peak
  // Step 3: (625, 170) - Valley
  // Step 4: (875, 80) - Peak
  const desktopPathD = "M 0,170 C 45,170 85,170 125,170 C 220,170 280,80 375,80 C 470,80 530,170 625,170 C 720,170 780,80 875,80 C 925,80 965,80 1000,80";

  // Mobile vertical smooth S-curve path connecting all 4 steps down
  const mobilePathD = "M 24,15 C 24,55 38,80 24,120 C 10,160 38,185 24,225 C 10,265 38,290 24,330 C 10,370 38,395 24,435";

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      // 1. Desktop Auto-Complete Animation (1.5 seconds, triggered on enter)
      const desktopPath = desktopActivePathRef.current;
      const desktopBeacon = desktopBeaconRef.current;

      if (desktopPath && typeof desktopPath.getTotalLength === 'function') {
        const dLength = desktopPath.getTotalLength();
        desktopPath.style.strokeDasharray = `${dLength}`;
        desktopPath.style.strokeDashoffset = `${dLength}`;

        // Initial light placement at start of path
        const startPt = desktopPath.getPointAtLength(0);
        if (desktopBeacon) {
          desktopBeacon.setAttribute('transform', `translate(${startPt.x}, ${startPt.y})`);
        }

        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            if (prefersReducedMotion) {
              desktopPath.style.strokeDashoffset = '0';
              setActiveStep(3);
              return;
            }

            const progressObj = { val: 0 };
            gsap.to(progressObj, {
              val: 1,
              duration: 1.5,
              ease: 'power2.inOut',
              onUpdate: () => {
                const progress = progressObj.val;
                desktopPath.style.strokeDashoffset = `${dLength * (1 - progress)}`;

                const pt = desktopPath.getPointAtLength(progress * dLength);
                if (desktopBeacon) {
                  desktopBeacon.setAttribute('transform', `translate(${pt.x}, ${pt.y})`);
                }

                if (progress < 0.25) {
                  setActiveStep(0);
                } else if (progress < 0.50) {
                  setActiveStep(1);
                } else if (progress < 0.75) {
                  setActiveStep(2);
                } else {
                  setActiveStep(3);
                }
              }
            });
          }
        });
      }

      // 2. Mobile Auto-Complete Animation
      const mobilePath = mobileActivePathRef.current;
      const mobileBeacon = mobileBeaconRef.current;

      if (mobilePath && typeof mobilePath.getTotalLength === 'function') {
        const mLength = mobilePath.getTotalLength();
        mobilePath.style.strokeDasharray = `${mLength}`;
        mobilePath.style.strokeDashoffset = `${mLength}`;

        const mStartPt = mobilePath.getPointAtLength(0);
        if (mobileBeacon) {
          mobileBeacon.setAttribute('transform', `translate(${mStartPt.x}, ${mStartPt.y})`);
        }

        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            if (prefersReducedMotion) {
              mobilePath.style.strokeDashoffset = '0';
              setActiveStep(3);
              return;
            }

            const mProgressObj = { val: 0 };
            gsap.to(mProgressObj, {
              val: 1,
              duration: 1.5,
              ease: 'power2.inOut',
              onUpdate: () => {
                const progress = mProgressObj.val;
                mobilePath.style.strokeDashoffset = `${mLength * (1 - progress)}`;

                const pt = mobilePath.getPointAtLength(progress * mLength);
                if (mobileBeacon) {
                  mobileBeacon.setAttribute('transform', `translate(${pt.x}, ${pt.y})`);
                }

                if (progress < 0.25) {
                  setActiveStep(0);
                } else if (progress < 0.50) {
                  setActiveStep(1);
                } else if (progress < 0.75) {
                  setActiveStep(2);
                } else {
                  setActiveStep(3);
                }
              }
            });
          }
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#FAFAF8] text-[#111111] pt-5 pb-8 sm:pt-6 sm:pb-10 md:pt-7 md:pb-12 overflow-hidden select-none"
    >
      {/* Background Soft Glow Accents */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#FF6B16]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-[#FF6B16]/5 rounded-full blur-3xl pointer-events-none" />

      {/* FULL SCREEN WIDTH CONTAINER (No max-w-7xl restriction, fluid width) */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 relative z-10">
        {/* Compact Header Section */}
        <div className="text-center max-w-xl mx-auto mb-3 sm:mb-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-neutral-200/80 shadow-xs mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B16] animate-pulse" />
            <span className="text-[#FF6B16] font-extrabold text-[10px] tracking-widest uppercase">
              OUR PROCESS
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-[#111111] leading-tight">
            From Dream to Destination<span className="text-[#FF6B16]">.</span>
          </h2>

          <p className="mt-1 text-xs text-neutral-500 font-medium max-w-md mx-auto leading-relaxed">
            One continuous journey designed to make planning, booking, and exploring completely effortless.
          </p>
        </div>

        {/* ============================================================== */}
        {/* 1. DESKTOP TIMELINE (Full-Width Continuous Wave Route)         */}
        {/* ============================================================== */}
        <div className="hidden lg:block relative w-full h-[280px] md:h-[290px]">
          {/* Continuous SVG Route Line Canvas spanning full width */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
            viewBox="0 0 1000 250"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Radial glow filter for travelling orange beacon */}
              <filter id="route-beacon-glow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="4" result="blur1" />
                <feGaussianBlur stdDeviation="8" result="blur2" />
                <feMerge>
                  <feMergeNode in="blur2" />
                  <feMergeNode in="blur1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Base Dotted Route Line spanning edge to edge */}
            <path
              d={desktopPathD}
              fill="none"
              stroke="#FF6B16"
              strokeOpacity="0.25"
              strokeWidth="2.5"
              strokeDasharray="7 7"
              strokeLinecap="round"
            />

            {/* Active Drawing Route Line (animated forward in 1.5s) */}
            <path
              ref={desktopActivePathRef}
              d={desktopPathD}
              fill="none"
              stroke="#FF6B16"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Glowing Light Beacon (travels along route) */}
            <g ref={desktopBeaconRef} filter="url(#route-beacon-glow)">
              <circle cx="0" cy="0" r="10" fill="#FF6B16" opacity="0.4" />
              <circle cx="0" cy="0" r="5" fill="#FF6B16" />
              <circle cx="0" cy="0" r="2" fill="#ffffff" />
            </g>
          </svg>

          {/* 4 Interactive Process Steps Positioned Along the Wave */}
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = activeStep === idx;
            const isPassed = activeStep >= idx;

            // X-Coordinates for the 4 nodes across full width
            const leftPercents = ['12.5%', '37.5%', '62.5%', '87.5%'];
            const leftPos = leftPercents[idx];

            // Y-Coordinates on SVG (170/250 = 68%, 80/250 = 32%)
            const isValley = step.position === 'above';
            const nodeTop = isValley ? '68%' : '32%';

            return (
              <React.Fragment key={step.num}>
                {/* 1. NODE PIN BADGE (Located right on the curve) */}
                <div
                  style={{ left: leftPos, top: nodeTop }}
                  onClick={() => setActiveStep(idx)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                >
                  <div className="relative">
                    {/* Glowing outer pulse rings when active */}
                    {isPassed && (
                      <span className="absolute -inset-1.5 rounded-xl bg-[#FF6B16]/25 animate-ping opacity-60 pointer-events-none" />
                    )}
                    {isPassed && (
                      <span className="absolute -inset-3 rounded-xl bg-[#FF6B16]/15 animate-pulse pointer-events-none" />
                    )}

                    {/* Location Pin Head Indicator */}
                    <div
                      className={`absolute -top-2.5 left-1/2 -translate-x-1/2 transition-all duration-300 ${
                        isPassed ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5 fill-[#FF6B16] text-white drop-shadow-xs" />
                    </div>

                    {/* Hexagon/Squircle Pin Badge Surface */}
                    <div
                      className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all duration-300 overflow-hidden ${
                        isPassed
                          ? 'bg-white border-2 border-[#FF6B16] shadow-[0_4px_18px_rgba(255,107,22,0.35)] scale-105'
                          : 'bg-white/95 border-2 border-neutral-200/90 shadow-xs hover:border-[#FF6B16]/50 hover:scale-105'
                      }`}
                    >
                      {/* Shimmer Sweep Effect across badge */}
                      {isPassed && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent animate-shimmer-sweep pointer-events-none" />
                      )}

                      {/* Icon */}
                      <Icon
                        className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-all duration-300 ${
                          isPassed ? 'text-[#FF6B16] scale-105' : 'text-neutral-500 group-hover:text-[#FF6B16]'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. STEP CONTENT CARD (Alternating above/below the curve) */}
                <div
                  style={{
                    left: leftPos,
                    ...(isValley
                      ? { bottom: '42%' } // card placed above valley node
                      : { top: '42%' })   // card placed below peak node
                  }}
                  className="absolute -translate-x-1/2 w-52 sm:w-56 md:w-[230px] z-10 transition-all duration-300"
                >
                  <div
                    onClick={() => setActiveStep(idx)}
                    className={`relative p-3 sm:p-3.5 rounded-xl transition-all duration-300 cursor-pointer overflow-hidden ${
                      isActive
                        ? 'bg-white border-2 border-[#FF6B16]/60 shadow-[0_6px_20px_rgba(0,0,0,0.05),0_2px_10px_rgba(255,107,22,0.12)] -translate-y-0.5'
                        : 'bg-white/80 hover:bg-white border border-neutral-200/70 hover:border-neutral-300 shadow-xs'
                    }`}
                  >
                    {/* Giant Faint Watermark Number */}
                    <span
                      className={`absolute -top-2.5 -right-1 text-4xl sm:text-5xl font-black select-none pointer-events-none transition-colors duration-300 tracking-tighter ${
                        isActive ? 'text-[#FF6B16]/15' : 'text-neutral-200/40'
                      }`}
                    >
                      {step.stepNumber}
                    </span>

                    {/* Step Tagline / Subtitle */}
                    <div className="relative z-10 flex items-center gap-1 mb-0.5">
                      <Sparkles className={`w-3 h-3 ${isActive ? 'text-[#FF6B16]' : 'text-neutral-400'}`} />
                      <span className="text-[10px] font-bold text-[#FF6B16] uppercase tracking-wider">
                        {step.tagline}
                      </span>
                    </div>

                    {/* Step Title */}
                    <h3 className="relative z-10 text-sm sm:text-base font-black text-[#111111] leading-tight mb-0.5">
                      {step.title}
                    </h3>

                    {/* Step Description */}
                    <p className="relative z-10 text-[11px] text-neutral-600 font-medium leading-snug">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* ============================================================== */}
        {/* 2. MOBILE TIMELINE (Compact Vertical Curving Dotted Route)     */}
        {/* ============================================================== */}
        <div className="lg:hidden relative">
          {/* Vertical Dotted Route Line Canvas */}
          <div className="absolute left-5 sm:left-7 top-4 bottom-4 w-10 pointer-events-none overflow-visible">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 48 460"
              preserveAspectRatio="none"
            >
              <defs>
                <filter id="mobile-beacon-glow" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Base Dotted Vertical Route */}
              <path
                d={mobilePathD}
                fill="none"
                stroke="#FF6B16"
                strokeOpacity="0.25"
                strokeWidth="2"
                strokeDasharray="5 5"
              />

              {/* Active Progressive Vertical Route */}
              <path
                ref={mobileActivePathRef}
                d={mobilePathD}
                fill="none"
                stroke="#FF6B16"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Travelling Orange Beacon */}
              <g ref={mobileBeaconRef} filter="url(#mobile-beacon-glow)">
                <circle cx="0" cy="0" r="9" fill="#FF6B16" opacity="0.35" />
                <circle cx="0" cy="0" r="4.5" fill="#FF6B16" />
                <circle cx="0" cy="0" r="1.8" fill="#ffffff" />
              </g>
            </svg>
          </div>

          {/* Vertical Steps Stack */}
          <div className="space-y-3 sm:space-y-4 pl-11 sm:pl-14 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeStep === idx;
              const isPassed = activeStep >= idx;

              return (
                <div
                  key={step.num}
                  onClick={() => setActiveStep(idx)}
                  className="relative group cursor-pointer"
                >
                  {/* Pin Badge on Left Line */}
                  <div className="absolute -left-11 sm:-left-14 top-3.5 -translate-y-1/2 z-20">
                    <div className="relative">
                      {isPassed && (
                        <span className="absolute -inset-1 rounded-xl bg-[#FF6B16]/25 animate-ping opacity-60 pointer-events-none" />
                      )}

                      <div
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          isPassed
                            ? 'bg-white border-2 border-[#FF6B16] shadow-sm shadow-[#FF6B16]/30 scale-105'
                            : 'bg-white border-2 border-neutral-200 shadow-xs'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isPassed ? 'text-[#FF6B16]' : 'text-neutral-500'}`} />
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div
                    className={`relative p-3 sm:p-3.5 rounded-xl transition-all duration-300 overflow-hidden ${
                      isActive
                        ? 'bg-white border-2 border-[#FF6B16]/60 shadow-sm shadow-[#FF6B16]/10'
                        : 'bg-white/80 border border-neutral-200/80 shadow-xs'
                    }`}
                  >
                    {/* Watermark Number */}
                    <span
                      className={`absolute -top-2 -right-1 text-4xl font-black select-none pointer-events-none tracking-tighter ${
                        isActive ? 'text-[#FF6B16]/15' : 'text-neutral-200/40'
                      }`}
                    >
                      {step.stepNumber}
                    </span>

                    <span className="text-[10px] font-bold text-[#FF6B16] uppercase tracking-wider block mb-0.5">
                      {step.tagline}
                    </span>

                    <h3 className="text-sm sm:text-base font-black text-[#111111] mb-0.5">
                      {step.title}
                    </h3>

                    <p className="text-[11px] sm:text-xs text-neutral-600 font-medium leading-snug">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default BookingProcess;
