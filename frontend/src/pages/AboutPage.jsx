import React, { useState, useEffect } from 'react';
import Container from '../components/common/Container';
import AboutHero from '../components/about/AboutHero';
import {
  ShieldCheck,
  Award,
  Heart,
  Users,
  MapPin,
  Flame,
  Compass,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { DEFAULT_ABOUT_DATA } from '../utils/defaultAboutData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const ICON_MAP = {
  ShieldCheck,
  Heart,
  Flame,
  Compass,
  Award,
  Users,
  MapPin,
  Sparkles,
};

export function AboutPage() {
  const [aboutData, setAboutData] = useState(DEFAULT_ABOUT_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/about`);
        const data = await res.json();
        if (data.success && data.data) {
          setAboutData({
            hero: {
              autoInterval: data.data.hero?.autoInterval || DEFAULT_ABOUT_DATA.hero.autoInterval,
              slides: data.data.hero?.slides?.length ? data.data.hero.slides : DEFAULT_ABOUT_DATA.hero.slides,
            },
            mission: {
              ...DEFAULT_ABOUT_DATA.mission,
              ...(data.data.mission || {}),
            },
            stats: data.data.stats?.length ? data.data.stats : DEFAULT_ABOUT_DATA.stats,
            story: {
              ...DEFAULT_ABOUT_DATA.story,
              ...(data.data.story || {}),
            },
            coreValues: data.data.coreValues?.length ? data.data.coreValues : DEFAULT_ABOUT_DATA.coreValues,
          });
        }
      } catch (err) {
        console.error('[AboutPage fetch error]:', err);
        // Fallback to default state
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  const heroSlides = aboutData.hero?.slides || DEFAULT_ABOUT_DATA.hero.slides;
  const heroInterval = aboutData.hero?.autoInterval || DEFAULT_ABOUT_DATA.hero.autoInterval;
  const mission = aboutData.mission || DEFAULT_ABOUT_DATA.mission;
  const stats = aboutData.stats || DEFAULT_ABOUT_DATA.stats;
  const story = aboutData.story || DEFAULT_ABOUT_DATA.story;
  const coreValues = aboutData.coreValues || DEFAULT_ABOUT_DATA.coreValues;

  return (
    <div data-navbar-theme="dark" className="bg-[#F7F7F5] min-h-screen">
      {/* Full-screen Hero Carousel */}
      <AboutHero slides={heroSlides} autoInterval={heroInterval} />

      <div className="pb-24">
        <Container>
          {/* Mission & Purpose Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 pt-16">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#FF6B16]"></span>
              <span className="text-[#FF6B16] font-bold text-xs uppercase tracking-widest">
                {mission.eyebrow || 'OUR MISSION & PURPOSE'}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-[#111111] tracking-tight">
              {mission.title || 'About Weekend Escapes'}
            </h1>
            <p className="mt-4 text-neutral-600 text-base sm:text-lg leading-relaxed">
              {mission.description}
            </p>
          </div>

          {/* Stats Strip */}
          {stats && stats.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-16">
              {stats.map((s, idx) => (
                <div
                  key={s.id || idx}
                  className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm text-center"
                >
                  <span className="text-3xl sm:text-4xl font-black text-[#FF6B16] block">
                    {s.value}
                  </span>
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider mt-1 block">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Story Section with Visual (How We Started) */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-100 shadow-md grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-16">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-black text-[#FF6B16] uppercase tracking-wider">
                {story.eyebrow || 'HOW WE STARTED'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#111111]">
                {story.title}
              </h2>
              {story.paragraph1 && (
                <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
                  {story.paragraph1}
                </p>
              )}
              {story.paragraph2 && (
                <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
                  {story.paragraph2}
                </p>
              )}
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-neutral-900 shadow-xl border border-neutral-100">
                <img
                  src={story.image || '/images/gallery/gallery-3.webp'}
                  alt={story.imageAlt || 'Our Story'}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Core Values Section */}
          {coreValues && coreValues.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {coreValues.map((val, idx) => {
                const IconComponent = ICON_MAP[val.icon] || ShieldCheck;

                return (
                  <div
                    key={val.id || idx}
                    className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm text-center flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-14 h-14 rounded-full bg-[#FF6B16]/10 text-[#FF6B16] flex items-center justify-center mx-auto mb-4">
                        <IconComponent className="w-7 h-7" />
                      </div>
                      <h3 className="text-xl font-bold text-neutral-900 mb-2">
                        {val.title}
                      </h3>
                      <p className="text-sm text-neutral-600 leading-relaxed">
                        {val.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Container>
      </div>
    </div>
  );
}

export default AboutPage;
