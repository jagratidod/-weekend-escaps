import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import TravelSearch from './TravelSearch';

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-between pt-24 sm:pt-28 overflow-x-clip bg-[#F7F7F5]">
      {/* 1. Background Cinematic Hero Artwork Image */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/newimage/herosecction/heroimage.png"
          alt="Weekend Escapes Mountain Adventure"
          loading="eager"
          className="w-full h-full object-cover object-right lg:object-center"
        />
        {/* Soft top gradient blend for navbar readability */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#F7F7F5]/90 via-[#F7F7F5]/30 to-transparent pointer-events-none" />
      </div>

      {/* 2. Hero Content Grid on Left */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-6 pb-8 my-auto">
        <div className="max-w-2xl">
          {/* Eyebrow Pill */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 mb-4"
          >
            <span className="text-[#FF6B16] font-black text-xs tracking-widest uppercase">
              EXPLORE • DISCOVER • ESCAPE
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-[72px] font-black tracking-tight text-[#111111] leading-[1.06]"
          >
            Your Next <br />
            <span className="text-[#FF6B16] inline-block">Adventure</span> <br />
            Awaits
          </motion.h1>

          {/* Supporting Text */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 sm:mt-5 text-sm sm:text-base text-neutral-700 max-w-lg font-medium leading-relaxed"
          >
            From majestic mountains to serene valleys, we craft unforgettable travel experiences for every explorer.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 sm:mt-8 flex flex-wrap items-center gap-4"
          >
            <Link
              to="/destinations"
              className="inline-flex items-center gap-2 px-6 sm:px-7 py-3 rounded-full font-bold text-xs sm:text-sm bg-[#FF6B16] hover:bg-[#e05809] text-white shadow-lg shadow-[#FF6B16]/30 hover:shadow-xl hover:shadow-[#FF6B16]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 group cursor-pointer"
            >
              <span>Explore Destinations</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>

          {/* Social Proof Stack (matches screenshot) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4"
          >
            {/* 4 Avatars Stack */}
            <div className="flex -space-x-2.5">
              <img
                src="/images/testimonials/priya-sharma.webp"
                alt="Traveler"
                className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-xs"
              />
              <img
                src="/images/testimonials/rahul-verma.webp"
                alt="Traveler"
                className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-xs"
              />
              <img
                src="/images/testimonials/sneha-patel.webp"
                alt="Traveler"
                className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-xs"
              />
              <div className="w-9 h-9 rounded-full border-2 border-white bg-[#111111] text-[#FF6B16] text-[10px] font-black flex items-center justify-center shadow-xs">
                500+
              </div>
            </div>

            {/* Ratings Text matching screenshot */}
            <div className="text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-neutral-800">500+ Happy Travelers</span>
                <div className="flex items-center gap-0.5 ml-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#FF6B16] text-[#FF6B16]" />
                  ))}
                </div>
                <span className="font-bold text-neutral-800 ml-1">4.9</span>
                <span className="text-neutral-500 font-medium">(200+ Reviews)</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 3. Bottom Hero Area: Search Bar Locked Exactly Between Hero Image and Black Section */}
      <div className="relative z-30 w-full mt-auto">
        {/* Dark Topographic Background Container */}
        <div className="relative bg-[#111111] pt-8 sm:pt-9 pb-3 sm:pb-4">
          {/* Top Artistic Brush-Stroke Transition (blends bottom of hero image) */}
          <div className="absolute top-0 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none -translate-y-[98%] z-30">
            <img
              src="/images/decorations/hero-brush-up.svg"
              alt=""
              className="w-full h-8 sm:h-12 md:h-16 object-cover"
            />
          </div>

          {/* Search Bar Container: Exactly 50/50 on Seam Between Hero Image and Black Section */}
          <div className="absolute top-0 left-0 right-0 -translate-y-1/2 z-40">
            <TravelSearch />
          </div>

          {/* Subtle Topographic Contour Lines SVG Pattern */}
          <div className="absolute inset-0 overflow-hidden opacity-40 pointer-events-none">
            <img
              src="/images/decorations/topography-pattern.svg"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
