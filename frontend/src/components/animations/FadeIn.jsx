import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export function FadeIn({
  children,
  direction = 'up', // 'up', 'down', 'left', 'right', 'none'
  delay = 0,
  duration = 0.6,
  distance = 30,
  className = '',
  viewport = { once: true, margin: '-50px' },
  ...props
}) {
  const shouldReduceMotion = useReducedMotion();

  const getDirectionOffset = () => {
    if (shouldReduceMotion) return { x: 0, y: 0 };
    switch (direction) {
      case 'up':
        return { y: distance, x: 0 };
      case 'down':
        return { y: -distance, x: 0 };
      case 'left':
        return { x: distance, y: 0 };
      case 'right':
        return { x: -distance, y: 0 };
      default:
        return { x: 0, y: 0 };
    }
  };

  const offset = getDirectionOffset();

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: offset.x,
        y: offset.y
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0
      }}
      viewport={viewport}
      transition={{
        duration: shouldReduceMotion ? 0.2 : duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export default FadeIn;
