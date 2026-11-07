import React from 'react';

export function SectionHeading({
  eyebrow,
  title,
  highlight,
  subtitle,
  align = 'left', // 'left', 'center'
  theme = 'light', // 'light', 'dark'
  size = 'default', // 'default', 'compact'
  action,
  className = ''
}) {
  const isDark = theme === 'dark';

  return (
    <div className={`w-full ${size === 'compact' ? 'mb-5 sm:mb-6 md:mb-8' : 'mb-8 sm:mb-10 md:mb-14'} ${className}`}>
      <div className={`flex flex-col md:flex-row md:items-end justify-between ${size === 'compact' ? 'gap-3 sm:gap-4' : 'gap-5 sm:gap-6'} ${align === 'center' ? 'items-center text-center' : 'items-start text-left'}`}>
        <div className={`max-w-2xl ${align === 'center' ? 'mx-auto' : ''}`}>
          {eyebrow && (
            <div className={`flex items-center gap-2 ${size === 'compact' ? 'mb-1 sm:mb-1.5' : 'mb-2 sm:mb-2.5'}`}>
              <span className="w-2 h-2 rounded-full bg-[#FF6B16] inline-block animate-pulse"></span>
              <span className="text-[#FF6B16] font-bold text-xs md:text-sm tracking-widest uppercase">
                {eyebrow}
              </span>
            </div>
          )}

          <h2 className={`${size === 'compact' ? 'text-[22px] xs:text-2xl sm:text-3xl md:text-[34px]' : 'text-2xl sm:text-4xl md:text-5xl'} font-black tracking-tight leading-tight ${isDark ? 'text-white' : 'text-[#111111]'}`}>
            {title}{' '}
            {highlight && <span className="text-[#FF6B16]">{highlight}</span>}
          </h2>

          {subtitle && (
            <p className={`${size === 'compact' ? 'mt-1 text-xs sm:text-sm md:text-base' : 'mt-2 text-sm sm:text-base md:text-lg'} font-normal max-w-xl ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
              {subtitle}
            </p>
          )}
        </div>

        {action && (
          <div className="shrink-0 w-full md:w-auto">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}

export default SectionHeading;
