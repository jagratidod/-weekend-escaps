import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination } from 'swiper/modules';
import { DESTINATIONS } from '../../data/destinations';
import DestinationCard from './DestinationCard';
import SectionHeading from '../common/SectionHeading';
import Container from '../common/Container';
import FadeIn from '../animations/FadeIn';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

const DESTINATION_PACKAGE_COUNTS = {
  manali: '37 Packages',
  kashmir: '24 Packages',
  kedarkantha: '18 Packages',
  spiti: '15 Packages',
  bali: '28 Packages',
};

export function Destinations() {
  const navigate = useNavigate();
  const [swiperInstance, setSwiperInstance] = useState(null);
  const getPackageCount = (id) => DESTINATION_PACKAGE_COUNTS[id] || '20+ Packages';

  return (
    <section id="explore-destinations" className="py-12 md:py-16 bg-[#F7F7F5] scroll-mt-10 overflow-hidden">
      <Container>
        {/* Section Heading matching screenshot */}
        <FadeIn direction="up">
          <SectionHeading
            eyebrow="Top Destinations"
            title="Explore Our Destinations"
            subtitle="Discover breathtaking places handpicked for your perfect getaway."
            size="compact"
            action={
              <div className="flex items-center gap-2">
                {/* Mobile Quick Arrow Navigation */}
                <div className="flex sm:hidden items-center gap-1.5 mr-1">
                  <button
                    onClick={() => swiperInstance?.slidePrev()}
                    className="w-8 h-8 rounded-full bg-white border border-neutral-200 hover:border-[#FF6B16] text-neutral-700 hover:text-[#FF6B16] flex items-center justify-center transition-all shadow-xs cursor-pointer"
                    aria-label="Previous destination"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => swiperInstance?.slideNext()}
                    className="w-8 h-8 rounded-full bg-white border border-neutral-200 hover:border-[#FF6B16] text-neutral-700 hover:text-[#FF6B16] flex items-center justify-center transition-all shadow-xs cursor-pointer"
                    aria-label="Next destination"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <Link
                  to="/packages"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-300 hover:border-[#FF6B16] text-xs font-bold text-neutral-800 hover:text-[#FF6B16] transition-all bg-white shadow-xs group"
                >
                  <span>View All Packages</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            }
          />
        </FadeIn>

        {/* 1. Mobile Carousel with Card Overlap Effect (Smooth swipeable & centered) */}
        <div className="block sm:hidden -mx-4 pt-1 pb-2">
          <Swiper
            onSwiper={setSwiperInstance}
            modules={[EffectCoverflow, Pagination]}
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={1.22}
            initialSlide={1}
            watchSlidesProgress={true}
            touchEventsTarget="container"
            simulateTouch={true}
            allowTouchMove={true}
            touchRatio={1.2}
            touchAngle={45}
            preventClicks={true}
            preventClicksPropagation={true}
            coverflowEffect={{
              rotate: 0,
              stretch: 28, // Overlaps neighboring cards
              depth: 100, // Elevates active card in front on Z-axis
              modifier: 1,
              scale: 0.88, // Scales down background cards
              slideShadows: false, // Disabled to prevent shadow overlay from blocking touch events
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            className="destinations-mobile-swiper pb-10"
          >
            {DESTINATIONS.map((dest) => {
              const displayTitle = dest.id === 'manali' ? 'Himachal' : dest.name;
              const packageCount = getPackageCount(dest.id);

              return (
                <SwiperSlide key={dest.id} className="h-auto select-none">
                  <div
                    onClick={() => navigate(`/packages/${dest.id}`)}
                    className="group relative block w-full aspect-[3/4.4] max-h-[440px] rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-neutral-900 cursor-pointer select-none"
                  >
                    {/* Background Image - pointer-events-none & draggable=false prevent browser image drag hijacking */}
                    <img
                      src={dest.image}
                      alt={displayTitle}
                      loading="lazy"
                      draggable={false}
                      className="w-full h-full object-cover object-center pointer-events-none select-none transition-transform duration-700 ease-out group-hover:scale-105"
                    />

                    {/* Dark Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/25 pointer-events-none" />

                    {/* Centered Content matching screenshot */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white z-10 pointer-events-none">
                      <h3 className="text-2xl font-extrabold text-white tracking-tight drop-shadow-md">
                        {displayTitle}
                      </h3>
                      <p className="text-xs text-neutral-300 font-medium mt-1 drop-shadow-sm">
                        {packageCount}
                      </p>
                      <div className="mt-4 px-6 py-2 rounded-full border border-white/70 bg-white/10 text-white text-xs font-bold transition-all shadow-md">
                        View All
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>

        {/* 2. Desktop & Tablet 5-Column Grid */}
        <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
          {DESTINATIONS.map((dest, idx) => (
            <FadeIn key={dest.id} direction="up" delay={idx * 0.1}>
              <DestinationCard destination={dest} />
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}

export default Destinations;
