import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function RouteAnimation({ className = '' }) {
  const containerRef = useRef(null);
  const pathRef = useRef(null);
  const vanRef = useRef(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches || !pathRef.current || !containerRef.current) return;

    const path = pathRef.current;
    const length = path.getTotalLength ? path.getTotalLength() : 1000;

    // Set initial dasharray and offset
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 75%',
          end: 'bottom 40%',
          scrub: 1.2
        }
      });

      // Animate path drawing
      tl.to(path, {
        strokeDashoffset: 0,
        ease: 'power1.inOut'
      });

      // Animate camper van along path
      if (vanRef.current) {
        tl.fromTo(
          vanRef.current,
          {
            xPercent: 0,
            yPercent: 0,
            rotation: -4
          },
          {
            xPercent: 750,
            yPercent: -15,
            rotation: 4,
            ease: 'power1.inOut'
          },
          0
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className={`relative w-full h-24 overflow-visible pointer-events-none ${className}`}>
      <svg
        className="w-full h-full overflow-visible"
        viewBox="0 0 1000 80"
        fill="none"
        preserveAspectRatio="none"
      >
        {/* Background Guide Line (Faint) */}
        <path
          d="M50,40 Q250,15 450,45 T850,25 T950,40"
          stroke="#FF6B16"
          strokeWidth="3"
          strokeDasharray="6 6"
          strokeOpacity="0.25"
        />

        {/* Animated Drawing Path */}
        <path
          ref={pathRef}
          d="M50,40 Q250,15 450,45 T850,25 T950,40"
          stroke="#FF6B16"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>

      {/* Animated Orange Camper Van driving on the route */}
      <div
        ref={vanRef}
        className="absolute top-1 left-8 w-16 sm:w-20 -translate-y-1/2 drop-shadow-lg"
      >
        <img
          src="/images/process/orange-van.webp"
          alt="Camper Van"
          className="w-full h-auto"
        />
      </div>
    </div>
  );
}

export default RouteAnimation;
