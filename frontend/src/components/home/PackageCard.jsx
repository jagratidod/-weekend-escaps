import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Star, MapPin } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

export function PackageCard({ pkg }) {
  const { id, name, badge, duration, price, rating, reviewsCount, image, location } = pkg;

  return (
    <div className="group flex flex-col rounded-2xl overflow-hidden bg-white p-2.5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-neutral-100">
      {/* Top Image with Badges */}
      <div className="relative aspect-[16/10.5] w-full rounded-xl overflow-hidden bg-neutral-100">
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Badge on Top Left */}
        {badge && (
          <div className="absolute top-2.5 left-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide bg-[#FF6B16] text-white shadow-sm">
              {badge}
            </span>
          </div>
        )}

        {/* Rating on Top Right */}
        <div className="absolute top-2.5 right-2.5">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold border border-white/10">
            <Star className="w-3 h-3 fill-[#FF6B16] text-[#FF6B16]" />
            <span>{rating}</span>
          </div>
        </div>
      </div>

      {/* Package Content */}
      <div className="pt-2.5 pb-0.5 px-1 flex flex-col flex-1 justify-between">
        <div>
          {/* Duration & Location tag */}
          <div className="flex items-center justify-between text-[11px] text-neutral-500 font-semibold mb-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#FF6B16]" />
              {duration}
            </span>
            <span className="truncate max-w-[110px]">
              {location.split(',')[0]}
            </span>
          </div>

          {/* Package Title */}
          <h3 className="text-sm sm:text-base font-black text-[#111111] group-hover:text-[#FF6B16] transition-colors line-clamp-1 leading-snug">
            {name}
          </h3>

          {/* Pricing */}
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-lg sm:text-xl font-black text-[#111111]">
              {formatCurrency(price)}
            </span>
            <span className="text-[11px] font-semibold text-neutral-500">
              / per person
            </span>
          </div>
        </div>

        {/* Orange View Details CTA Button */}
        <div className="mt-3.5">
          <Link
            to={`/packages/${id}`}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#FF6B16] hover:bg-[#e05809] text-white font-extrabold text-xs sm:text-[13px] shadow-sm shadow-[#FF6B16]/25 hover:shadow-md hover:shadow-[#FF6B16]/35 transition-all duration-200"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PackageCard;
