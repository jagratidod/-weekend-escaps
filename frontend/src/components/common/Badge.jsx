import React from 'react';

export function Badge({ children, variant = 'orange', className = '' }) {
  const variantStyles = {
    orange: 'bg-[#FF6B16] text-white',
    dark: 'bg-[#111111] text-white border border-white/10',
    light: 'bg-white/90 text-[#111111] backdrop-blur-md shadow-sm',
    outline: 'border border-[#FF6B16] text-[#FF6B16]',
    green: 'bg-emerald-600 text-white'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${variantStyles[variant] || variantStyles.orange} ${className}`}>
      {children}
    </span>
  );
}

export default Badge;
