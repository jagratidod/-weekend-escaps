import React from 'react';
import Container from '../components/common/Container';
import AboutHero from '../components/about/AboutHero';
import { ShieldCheck, Award, Heart, Users, MapPin, Flame } from 'lucide-react';
import { BRAND } from '../utils/constants';

export function AboutPage() {
  const stats = [
    { label: "Happy Explorers", value: "15,000+" },
    { label: "Expeditions Led", value: "850+" },
    { label: "Himalayan Summits", value: "24" },
    { label: "Safety Record", value: "99.9%" }
  ];

  return (
    <div className="bg-[#F7F7F5] min-h-screen">
      {/* Full-screen Hero */}
      <AboutHero />

      <div className="pb-24">
      <Container>
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 pt-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#FF6B16]"></span>
            <span className="text-[#FF6B16] font-bold text-xs uppercase tracking-widest">
              OUR MISSION & PURPOSE
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-[#111111] tracking-tight">
            About Weekend Escapes
          </h1>
          <p className="mt-4 text-neutral-600 text-base sm:text-lg leading-relaxed">
            We are a team of certified mountaineers, nature lovers, and obsessive explorers dedicated to taking you beyond ordinary tourist traps into wild, authentic experiences.
          </p>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-16">
          {stats.map((s, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm text-center">
              <span className="text-3xl sm:text-4xl font-black text-[#FF6B16] block">
                {s.value}
              </span>
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider mt-1 block">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Story Section with Visual */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-100 shadow-md grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-16">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-black text-[#FF6B16] uppercase tracking-wider">
              HOW WE STARTED
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#111111]">
              Born Out of a Passion for High Altitudes
            </h2>
            <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
              Weekend Escapes started with three friends who spent their weekends escaping urban monotony to conquer Uttarakhand's snow passes. What began as weekend hikes soon grew into India’s most trusted adventure travel community.
            </p>
            <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
              Today, we organize certified treks, private honeymoon sanctuaries, thrilling group expeditions, and overseas road adventures—all while adhering to strict Leave No Trace eco-principles.
            </p>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-neutral-900 shadow-xl">
              <img
                src="/images/gallery/gallery-3.webp"
                alt="Our Story Bonfire"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm text-center">
            <div className="w-14 h-14 rounded-full bg-[#FF6B16]/10 text-[#FF6B16] flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">Safety Above All</h3>
            <p className="text-sm text-neutral-600">
              Certified leaders with Wilderness First Responder (WFR) credentials, high-altitude oxygen reserves, and state-of-the-art satellite tracking.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm text-center">
            <div className="w-14 h-14 rounded-full bg-[#FF6B16]/10 text-[#FF6B16] flex items-center justify-center mx-auto mb-4">
              <Heart className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">Sustainable & Eco-First</h3>
            <p className="text-sm text-neutral-600">
              We empower local mountain communities, hire native village homestays, and rigorously collect trail waste on every descent.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm text-center">
            <div className="w-14 h-14 rounded-full bg-[#FF6B16]/10 text-[#FF6B16] flex items-center justify-center mx-auto mb-4">
              <Flame className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">Unmatched Value</h3>
            <p className="text-sm text-neutral-600">
              Direct ground operations with zero broker markups mean premium quality camps, food, and hospitality at competitive prices.
            </p>
          </div>
        </div>
      </Container>
      </div>
    </div>
  );
}

export default AboutPage;
