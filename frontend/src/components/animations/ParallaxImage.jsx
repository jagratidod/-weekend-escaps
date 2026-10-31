import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function ParallaxImage({
  src,
  alt = 'Adventure Image',
  speed = 0.2, // speed multiplier (e.g. 0.1 to 0.4)
  className = '',
  imgClassName = '',
  loading = 'lazy'
}) {
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    // Respect user's motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches || !imageRef.current || !containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        imageRef.current,
        {
          yPercent: -speed * 50
        },
        {
          yPercent: speed * 50,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [speed]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        loading={loading}
        className={`w-full h-full object-cover scale-110 will-change-transform ${imgClassName}`}
      />
    </div>
  );
}

export default ParallaxImage;
