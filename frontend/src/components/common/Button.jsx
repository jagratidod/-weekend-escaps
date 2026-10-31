import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function Button({
  children,
  to,
  href,
  onClick,
  variant = 'primary', // 'primary', 'secondary', 'outline', 'ghost', 'dark'
  size = 'md', // 'sm', 'md', 'lg'
  icon = true,
  className = '',
  type = 'button',
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center font-bold transition-all duration-300 rounded-full cursor-pointer focus:outline-none select-none';

  const sizeClasses = {
    sm: 'text-xs px-4 py-2 gap-1.5',
    md: 'text-sm px-6 py-3 gap-2',
    lg: 'text-base px-8 py-3.5 gap-2.5'
  };

  const variantClasses = {
    primary: 'bg-[#FF6B16] hover:bg-[#e05809] text-white shadow-lg shadow-[#FF6B16]/25 hover:shadow-xl hover:shadow-[#FF6B16]/35 hover:-translate-y-0.5 active:translate-y-0',
    secondary: 'bg-white hover:bg-neutral-100 text-[#111111] border border-neutral-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0',
    outline: 'bg-transparent hover:bg-[#FF6B16] text-[#111111] hover:text-white border-2 border-[#111111] hover:border-[#FF6B16] hover:-translate-y-0.5',
    outlineOrange: 'bg-transparent hover:bg-[#FF6B16] text-[#FF6B16] hover:text-white border-2 border-[#FF6B16] hover:-translate-y-0.5',
    outlineWhite: 'bg-transparent hover:bg-white text-white hover:text-[#111111] border-2 border-white/60 hover:border-white hover:-translate-y-0.5',
    dark: 'bg-[#111111] hover:bg-neutral-800 text-white shadow-lg hover:-translate-y-0.5 active:translate-y-0',
    ghost: 'bg-transparent hover:bg-black/5 text-[#111111]'
  };

  const combinedClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant] || variantClasses.primary} ${className}`;

  const content = (
    <>
      <span>{children}</span>
      {icon && <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={`group ${combinedClasses}`} {...props}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={`group ${combinedClasses}`} target="_blank" rel="noopener noreferrer" {...props}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} className={`group ${combinedClasses}`} {...props}>
      {content}
    </button>
  );
}

export default Button;
