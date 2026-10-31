import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function useScrollAnimation(animationCallback, dependencies = []) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      if (typeof animationCallback === 'function') {
        animationCallback(containerRef.current, gsap, ScrollTrigger);
      }
    }, containerRef);

    return () => ctx.revert();
  }, dependencies);

  return containerRef;
}

export default useScrollAnimation;
