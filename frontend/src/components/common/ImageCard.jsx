import React from 'react';

export function ImageCard({
  image,
  alt = 'Travel scene',
  children,
  className = '',
  aspectRatio = 'aspect-[4/5]',
  overlay = true,
  onClick
}) {
  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl bg-neutral-900 shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer ${className}`}
    >
      <div className={`w-full h-full overflow-hidden ${aspectRatio}`}>
        <img
          src={image}
          alt={alt}
          loading="lazy"
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
        />
      </div>

      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none transition-opacity duration-300 group-hover:opacity-90" />
      )}

      {children && (
        <div className="absolute inset-0 p-5 flex flex-col justify-end text-white z-10">
          {children}
        </div>
      )}
    </div>
  );
}

export default ImageCard;
