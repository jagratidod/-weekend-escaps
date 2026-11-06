import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export function DestinationCard({ destination }) {
  const { id, name, subtitle, category, image } = destination;

  return (
    <Link
      to={`/packages/${id}`}
      className="group flex flex-col rounded-2xl overflow-hidden bg-white p-2 shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-neutral-100"
    >
      {/* Image container with rounded top and zoom effect */}
      <div className="relative aspect-[4/4.6] w-full rounded-xl overflow-hidden bg-neutral-100">
        <img
          src={image}
          alt={`${name} travel destination`}
          loading="lazy"
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />
        {/* Soft category badge on top left */}
        <div className="absolute top-2.5 left-2.5">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/10 uppercase tracking-wider">
            {category.split('&')[0]}
          </span>
        </div>
      </div>

      {/* Card Info Bottom */}
      <div className="pt-2.5 pb-1 px-1.5 flex items-center justify-between">
        <div>
          <h3 className="text-sm sm:text-base font-black text-[#111111] group-hover:text-[#FF6B16] transition-colors leading-tight">
            {name}
          </h3>
          <p className="text-[11px] font-semibold text-neutral-500 mt-0.5">
            {subtitle}
          </p>
        </div>

        {/* Orange Circular Icon Button */}
        <div className="w-7 h-7 rounded-full bg-[#FF6B16] text-white flex items-center justify-center shadow-sm shadow-[#FF6B16]/25 group-hover:bg-[#111111] group-hover:scale-105 transition-all duration-300 shrink-0 ml-1.5">
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </Link>
  );
}

export default DestinationCard;
