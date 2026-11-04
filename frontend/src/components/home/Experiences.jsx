import React from 'react';
import { Link } from 'react-router-dom';
import Container from '../common/Container';
import { useSettings } from '../../context/SettingsContext';
import { getHomeIcon } from '../../utils/homeIconHelper';
import { Mountain } from 'lucide-react';

export function Experiences() {
  const { homeSections } = useSettings();
  const expData = homeSections?.experiences || {};

  const badgeText = expData.badge || 'TRAVEL YOUR WAY';
  const titleText = expData.title || 'Choose Your Experience';
  const subtitleText =
    expData.subtitle || 'Every journey is unique. Find the travel style that matches you.';

  const defaultExperiences = [
    { id: 'trekking', name: 'Trekking', icon: 'Mountain', link: '/experiences#trekking' },
    { id: 'adventure', name: 'Adventure', icon: 'Compass', link: '/experiences#adventure' },
    { id: 'honeymoon', name: 'Honeymoon', icon: 'Heart', link: '/experiences#honeymoon' },
    { id: 'family', name: 'Family Trips', icon: 'Users', link: '/experiences#family' },
    { id: 'group', name: 'Group Tours', icon: 'Flame', link: '/experiences#group' },
    { id: 'international', name: 'International', icon: 'Globe', link: '/experiences#international' },
  ];

  const experiences =
    Array.isArray(expData.items) && expData.items.length > 0
      ? expData.items
      : defaultExperiences;

  return (
    <section className="relative bg-[#111111] text-white pt-4 pb-6 sm:pt-5 sm:pb-8 md:pt-6 md:pb-10 overflow-x-clip z-20">
      {/* Top Brush Stroke Transition */}
      <div className="absolute top-0 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none -translate-y-[98%] z-30">
        <img
          src="/images/decorations/hero-brush-up.svg"
          alt=""
          className="w-full h-6 sm:h-8 md:h-10 object-cover"
        />
      </div>

      <Container className="relative z-10 pt-0">
        {/* Section Heading Center Aligned */}
        <div className="text-center max-w-2xl mx-auto mb-4 sm:mb-5">
          <div className="inline-flex items-center gap-1.5 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B16]"></span>
            <span className="text-[#FF6B16] font-bold text-[11px] sm:text-xs tracking-widest uppercase">
              {badgeText}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
            {titleText}
          </h2>

          <p className="mt-1 text-xs sm:text-sm text-neutral-400 font-medium">
            {subtitleText}
          </p>
        </div>

        {/* Dynamic Category Cards in Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
          {experiences.map((exp, idx) => {
            const Icon = getHomeIcon(exp.icon, Mountain);
            return (
              <Link
                key={exp.id || idx}
                to={exp.link || '/packages'}
                className="group flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-xl bg-white hover:bg-neutral-50 shadow-md hover:shadow-xl hover:shadow-[#FF6B16]/20 transition-all duration-300 hover:-translate-y-1 border border-white/10"
              >
                {/* Orange Icon Container */}
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#FF6B16]/10 flex items-center justify-center text-[#FF6B16] group-hover:bg-[#FF6B16] group-hover:text-white transition-all duration-300 mb-1.5 group-hover:scale-105">
                  <Icon className="w-5 h-5" />
                </div>

                {/* Experience Name */}
                <span className="text-xs sm:text-[13px] font-extrabold text-[#111111] text-center tracking-tight">
                  {exp.name}
                </span>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

export default Experiences;
