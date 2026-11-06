import React, { useState } from 'react';
import {
  Shirt,
  Footprints,
  HardHat,
  Flashlight,
  HeartPulse,
  Backpack,
  Check,
} from 'lucide-react';

export const DEFAULT_PACKING_CATEGORIES = [
  {
    id: 'clothing',
    label: 'Clothing',
    icon: Shirt,
    items: [
      'Heavy down jacket / windcheater',
      'Thermal inner upper & lower',
      '2-3 dry-fit full sleeve tees',
      'Waterproof rain jacket / poncho',
      '2 trek pants (no jeans)',
    ],
  },
  {
    id: 'footwear',
    label: 'Footwear',
    icon: Footprints,
    items: [
      'Trekking shoes with ankle support',
      'Sandals for camp use',
      '3 pairs woolen socks',
      'Waterproof gloves',
      'Warm inner gloves',
    ],
  },
  {
    id: 'headwear',
    label: 'Headwear',
    icon: HardHat,
    items: [
      'Woolen cap / balaclava',
      'Neck warmer / scarf',
      'Sun cap for daytime',
      'UV protected sunglasses',
      'Sunscreen SPF 50+',
    ],
  },
  {
    id: 'accessories',
    label: 'Accessories',
    icon: Flashlight,
    items: [
      'Trekking pole (strongly recommended)',
      'Headlamp with extra batteries',
      'Power bank & mobile charger',
      'Reusable water bottle 1L+',
      'Camera / action camera',
    ],
  },
  {
    id: 'toiletries',
    label: 'Toiletries',
    icon: HeartPulse,
    items: [
      'Personal medicines (mandatory)',
      'Basic first aid kit',
      'Lip balm & moisturizer',
      'Hand sanitizer & tissues',
      'Diamox (altitude sickness tablet)',
    ],
  },
  {
    id: 'bags',
    label: 'Bags',
    icon: Backpack,
    items: [
      'Backpack (40-60L) with waterproof rain cover',
      'Daypack (10-20L) for summit day / side excursions',
      'Waterproof dry bags / zip lock pouches for electronics',
      'Luggage tag & sturdy combination lock',
      'Foldable duffle bag / extra pack for basecamp storage',
    ],
  },
];

export default function WhatToPack({ packageData }) {
  const [activeCategory, setActiveCategory] = useState('clothing');

  // Allow custom packing categories if specified on packageData, otherwise fallback to defaults
  const categories =
    Array.isArray(packageData?.whatToPack) && packageData.whatToPack.length > 0
      ? packageData.whatToPack
      : DEFAULT_PACKING_CATEGORIES;

  const currentCategory =
    categories.find((c) => c.id === activeCategory) || categories[0] || DEFAULT_PACKING_CATEGORIES[0];

  const packageName = packageData?.name || 'this trek';

  return (
    <section className="w-full py-16 sm:py-20 bg-[#F7F7F5] border-t border-neutral-200/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Theme Header Badge & Title */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-100/70 border border-orange-200/80 text-[#FF6B16] text-[11px] font-black uppercase tracking-wider mb-3 shadow-2xs">
            <Backpack className="w-3.5 h-3.5" />
            <span>Trail Gear & Packing Checklist</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#111111] tracking-tight">
            What to <span className="text-[#FF6B16]">Pack</span>
          </h2>

          <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-2 max-w-md mx-auto">
            Essential clothing, sturdy footwear, and gear curated for high-altitude comfort and safety on {packageName}.
          </p>
        </div>

        {/* Category Switcher Tabs - Compact Single Row without Scroll or Cutoff */}
        <div className="flex items-center justify-center gap-1 sm:gap-2.5 mt-6 mb-8 w-full max-w-3xl mx-auto px-1">
          {categories.map((cat) => {
            const Icon = cat.icon || Shirt;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`group inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs md:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer select-none ${
                  isActive
                    ? 'bg-[#FF6B16] text-white shadow-sm shadow-[#FF6B16]/25 ring-2 ring-[#FF6B16]/20'
                    : 'bg-white hover:bg-orange-50/70 text-neutral-700 hover:text-[#FF6B16] border border-neutral-200/80 shadow-2xs'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-neutral-400 group-hover:text-[#FF6B16]'
                  }`}
                />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Checklist Item Cards Styled with Theme Orange Accents */}
        <div className="space-y-3">
          {currentCategory.items.map((item, idx) => (
            <div
              key={idx}
              className="group flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white hover:bg-neutral-50/70 border border-neutral-200/80 hover:border-[#FF6B16]/40 shadow-2xs hover:shadow-xs transition-all duration-150"
            >
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF6B16] group-hover:bg-[#FF6B16] group-hover:text-white flex items-center justify-center shrink-0 transition-colors shadow-2xs">
                  <Check className="w-4 h-4 stroke-[2.8]" />
                </div>
                <span className="text-[#111111] text-sm sm:text-base font-bold tracking-tight">
                  {item}
                </span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-neutral-300 group-hover:text-[#FF6B16] transition-colors shrink-0 hidden sm:inline-block">
                Must Have
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
