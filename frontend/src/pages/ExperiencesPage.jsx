import React from 'react';
import { Link } from 'react-router-dom';
import { EXPERIENCES } from '../data/experiences';
import Container from '../components/common/Container';
import { ArrowRight, Mountain, Compass, Heart, Users, Flame, Globe, Check } from 'lucide-react';

const iconMap = {
  Mountain,
  Compass,
  Heart,
  Users,
  Flame,
  Globe
};

export function ExperiencesPage() {
  return (
    <div className="pt-28 pb-24 bg-[#F7F7F5] min-h-screen">
      <Container>
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#FF6B16]"></span>
            <span className="text-[#FF6B16] font-bold text-xs uppercase tracking-widest">
              TRAVEL YOUR WAY
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-[#111111] tracking-tight">
            Curated Experiences
          </h1>
          <p className="mt-3 text-neutral-600 text-base sm:text-lg">
            No two explorers seek the exact same journey. Select your favorite adventure style and let us tailor every mile.
          </p>
        </div>

        {/* Experience Blocks */}
        <div className="space-y-12">
          {EXPERIENCES.map((exp, idx) => {
            const Icon = iconMap[exp.icon] || Mountain;
            const isReversed = idx % 2 === 1;

            return (
              <div
                key={exp.id}
                id={exp.id}
                className={`bg-white rounded-3xl p-6 sm:p-10 border border-neutral-100 shadow-md flex flex-col ${
                  isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'
                } gap-8 items-center justify-between`}
              >
                {/* Visual Icon Art side */}
                <div className="w-full lg:w-5/12 aspect-[16/10] rounded-2xl bg-[#111111] flex flex-col items-center justify-center p-8 text-white relative overflow-hidden group">
                  <div className="w-20 h-20 rounded-full bg-[#FF6B16]/20 border border-[#FF6B16]/40 flex items-center justify-center text-[#FF6B16] mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-10 h-10" />
                  </div>
                  <span className="text-xs uppercase tracking-widest text-[#FF6B16] font-extrabold">
                    {exp.tagline}
                  </span>
                  <h3 className="text-2xl font-black mt-1 text-center">
                    {exp.title}
                  </h3>
                  <span className="mt-3 text-xs bg-white/10 px-3 py-1 rounded-full text-neutral-300">
                    {exp.count}
                  </span>
                </div>

                {/* Details side */}
                <div className="w-full lg:w-7/12 space-y-5">
                  <div className="inline-block px-3 py-1 rounded-full bg-[#FF6B16]/10 text-[#FF6B16] text-xs font-bold uppercase tracking-wider">
                    {exp.count}
                  </div>
                  <h2 className="text-3xl font-black text-[#111111]">
                    {exp.title} Trips
                  </h2>
                  <p className="text-neutral-600 text-base leading-relaxed">
                    {exp.description}
                  </p>

                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-neutral-400 mb-2">
                      Popular Trips in this Style:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {exp.popularTrips.map((trip, i) => (
                        <span
                          key={i}
                          className="px-3.5 py-1.5 rounded-xl bg-neutral-100 text-xs font-bold text-neutral-800"
                        >
                          {trip}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      to={`/packages?type=${exp.title}`}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FF6B16] hover:bg-[#e05809] text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
                    >
                      <span>Explore {exp.title} Packages</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </div>
  );
}

export default ExperiencesPage;
