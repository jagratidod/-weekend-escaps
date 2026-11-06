import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  Users,
  Maximize,
  Bed,
  Mountain,
  MapPin,
  Compass,
  ArrowRight,
  Flame,
  Utensils,
  Camera,
  Coffee,
  CheckCircle2,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import Container from '../components/common/Container';
import { getImageUrl } from '../utils/imageHelper';
import { DEFAULT_GALLERY_DATA } from '../utils/defaultGalleryData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const DETAIL_ICONS = {
  Users,
  Maximize,
  Bed,
  Mountain,
  MapPin,
  Compass,
  Flame,
  Utensils,
  Camera,
  Coffee,
  CheckCircle2,
  ShieldCheck,
  Calendar,
};

const getDetailIcon = (iconName) => {
  return DETAIL_ICONS[iconName] || Bed;
};

export default function GalleryPage() {
  const [galleryData, setGalleryData] = useState(DEFAULT_GALLERY_DATA);
  const [activeSplitTab, setActiveSplitTab] = useState('ALL');
  const [activeShowcaseId, setActiveShowcaseId] = useState(
    DEFAULT_GALLERY_DATA.accommodations[0]?.id || '01'
  );
  const [gridFilter, setGridFilter] = useState('All');
  const [lightboxImage, setLightboxImage] = useState(null);
  const filmstripScrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const updateScrollState = useCallback(() => {
    if (!filmstripScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = filmstripScrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(maxScroll > 10 && scrollLeft < maxScroll - 10);
    if (maxScroll > 0) {
      setScrollProgress(Math.min(100, Math.max(0, (scrollLeft / maxScroll) * 100)));
    } else {
      setScrollProgress(0);
    }
  }, []);

  const scrollFilmstrip = (direction) => {
    if (filmstripScrollRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      filmstripScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(updateScrollState, 350);
    }
  };

  // Fetch dynamic gallery settings from backend
  useEffect(() => {
    let isMounted = true;
    const loadGallery = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/gallery`);
        const json = await res.json();
        if (isMounted && json.success && json.data) {
          const d = json.data;
          setGalleryData({
            hero: { ...DEFAULT_GALLERY_DATA.hero, ...(d.hero || {}) },
            philosophy: { ...DEFAULT_GALLERY_DATA.philosophy, ...(d.philosophy || {}) },
            filmstrip: {
              categories:
                d.filmstrip?.categories?.length > 0
                  ? d.filmstrip.categories
                  : DEFAULT_GALLERY_DATA.filmstrip.categories,
              panels:
                d.filmstrip?.panels?.length > 0
                  ? d.filmstrip.panels
                  : DEFAULT_GALLERY_DATA.filmstrip.panels,
            },
            accommodations:
              d.accommodations?.length > 0
                ? d.accommodations
                : DEFAULT_GALLERY_DATA.accommodations,
            masonry: {
              eyebrow: d.masonry?.eyebrow || DEFAULT_GALLERY_DATA.masonry.eyebrow,
              title: d.masonry?.title || DEFAULT_GALLERY_DATA.masonry.title,
              subtitle: d.masonry?.subtitle || DEFAULT_GALLERY_DATA.masonry.subtitle,
              categories:
                d.masonry?.categories?.length > 0
                  ? d.masonry.categories
                  : DEFAULT_GALLERY_DATA.masonry.categories,
              items:
                d.masonry?.items?.length > 0
                  ? d.masonry.items
                  : DEFAULT_GALLERY_DATA.masonry.items,
            },
          });

          if (d.accommodations?.length > 0) {
            setActiveShowcaseId(d.accommodations[0].id);
          }
        }
      } catch (err) {
        console.warn('Falling back to local gallery defaults:', err);
      }
    };

    loadGallery();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeShowcase =
    galleryData.accommodations.find((item) => item.id === activeShowcaseId) ||
    galleryData.accommodations[0] ||
    DEFAULT_GALLERY_DATA.accommodations[0];

  const filteredGrid =
    gridFilter === 'All'
      ? galleryData.masonry.items
      : galleryData.masonry.items.filter(
          (item) => item.category === gridFilter || item.trip === gridFilter
        );

  const filmstripTabs = galleryData.filmstrip?.categories?.some((c) => c.toUpperCase() === 'ALL')
    ? galleryData.filmstrip.categories
    : ['ALL', ...(galleryData.filmstrip?.categories || [])];

  const filteredPanels = (galleryData.filmstrip?.panels || []).filter((panel) => {
    if (!activeSplitTab || activeSplitTab.toUpperCase() === 'ALL') return true;
    return (
      panel.category?.trim().toLowerCase() === activeSplitTab.trim().toLowerCase()
    );
  });

  // Track scroll boundaries and enable smooth horizontal mouse wheel scrolling
  useEffect(() => {
    const el = filmstripScrollRef.current;
    if (!el) return;

    // Check bounds after DOM layout updates
    const t1 = setTimeout(updateScrollState, 60);
    const t2 = setTimeout(updateScrollState, 350);

    const handleScroll = () => {
      updateScrollState();
    };

    const handleResize = () => {
      updateScrollState();
    };

    // Horizontal wheel scrolling for standard desktop mouse
    const handleWheel = (e) => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 5) return; // not scrollable

      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        const isAtLeft = el.scrollLeft <= 5 && e.deltaY < 0;
        const isAtRight = el.scrollLeft >= maxScroll - 5 && e.deltaY > 0;
        if (!isAtLeft && !isAtRight) {
          e.preventDefault();
          el.scrollBy({ left: e.deltaY * 1.3, behavior: 'auto' });
          updateScrollState();
        }
      }
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    el.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      el.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      el.removeEventListener('wheel', handleWheel);
    };
  }, [updateScrollState, filteredPanels.length, activeSplitTab]);

  // Reset scroll position to beginning when switching category tab
  useEffect(() => {
    if (filmstripScrollRef.current) {
      filmstripScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
    const timer = setTimeout(updateScrollState, 150);
    return () => clearTimeout(timer);
  }, [activeSplitTab, updateScrollState]);

  const heroBg = getImageUrl(galleryData.hero?.bgImage || DEFAULT_GALLERY_DATA.hero.bgImage);

  return (
    <div className="bg-[#F7F7F5] text-[#111111] font-sans overflow-x-hidden pt-20 md:pt-24">
      {/* ============================================================== */}
      {/* ── SECTION 1: CINEMATIC LIGHT HERO (Reference 3 Aesthetic) ── */}
      {/* ============================================================== */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden py-24 bg-gradient-to-b from-white via-[#F7F7F5] to-[#F7F7F5]">
        {/* Subtle Himalayan Landscape Backdrop */}
        <div className="absolute inset-0 z-0 opacity-25 pointer-events-none">
          <img
            src={heroBg}
            alt="Himalayan Mountain Range"
            className="w-full h-full object-cover filter blur-[1px]"
            onError={(e) => {
              e.target.src = getImageUrl('/newimage/herosecction/heroimage.png');
            }}
          />
        </div>

        {/* Center Typography */}
        <Container className="relative z-10 text-center flex flex-col items-center select-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-neutral-200/90 shadow-sm mb-4"
          >
            <Camera className="w-3.5 h-3.5 text-[#FF6B16]" />
            <span className="text-[11px] font-black tracking-[0.25em] uppercase text-neutral-600">
              {galleryData.hero.badge}
            </span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-xs sm:text-sm font-bold tracking-[0.35em] uppercase text-neutral-500 mb-2 sm:mb-3"
          >
            {galleryData.hero.preHeading}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, scale: 0.96, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-serif italic text-[#111111] tracking-tight leading-none drop-shadow-sm"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            {galleryData.hero.heading}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="text-xs sm:text-sm md:text-base text-neutral-600 max-w-xl mt-6 font-medium leading-relaxed"
          >
            {galleryData.hero.description}
          </motion.p>

          {/* Quick Metrics Bar in White Theme */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 bg-white border border-neutral-200/90 rounded-3xl p-5 sm:p-6 shadow-sm max-w-2xl w-full"
          >
            {galleryData.hero.metrics?.map((metric, idx) => (
              <div key={idx}>
                <p
                  className="text-2xl sm:text-3xl font-black"
                  style={{ color: metric.highlightColor || (idx % 2 === 0 ? '#FF6B16' : '#111111') }}
                >
                  {metric.value}
                </p>
                <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mt-0.5">
                  {metric.label}
                </p>
              </div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* ============================================================== */}
      {/* ── SECTION 2: "MORE THAN A TOUR" & EXPEDITION SHOWCASE ── */}
      {/* ============================================================== */}
      <section className="py-20 bg-white border-t border-neutral-200/80">
        <Container>
          {/* Asymmetrical Layout matching Reference 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">
            {/* Left Photo with hotspot circle */}
            <motion.div
              initial={{ opacity: 0, x: -35 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-4 relative group cursor-pointer"
              onClick={() =>
                setLightboxImage({
                  url: getImageUrl(galleryData.philosophy.leftCard?.image),
                  title: galleryData.philosophy.leftCard?.title,
                  trip: galleryData.philosophy.leftCard?.trip,
                })
              }
            >
              <div className="relative rounded-3xl overflow-hidden aspect-[4/3] sm:aspect-[16/11] border border-neutral-200 shadow-md group-hover:shadow-xl transition-all duration-300">
                <img
                  src={getImageUrl(galleryData.philosophy.leftCard?.image)}
                  alt={galleryData.philosophy.leftCard?.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = getImageUrl('/newimage/herosecction/heroimage.png');
                  }}
                />
                <div className="absolute inset-0 bg-black/15 group-hover:bg-transparent transition-colors" />

                {/* Hotspot Ring */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center bg-[#FF6B16]/80 backdrop-blur-sm group-hover:scale-110 transition-transform shadow-lg">
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Center Typography */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="lg:col-span-5 text-center lg:text-left px-2"
            >
              <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#FF6B16] block mb-2">
                {galleryData.philosophy.badge}
              </span>
              <h2
                className="text-4xl sm:text-5xl md:text-6xl font-serif text-[#111111] tracking-tight leading-[1.1]"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {galleryData.philosophy.title}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 mt-4 leading-relaxed font-normal">
                {galleryData.philosophy.description}
              </p>
            </motion.div>

            {/* Right Photo */}
            <motion.div
              initial={{ opacity: 0, x: 35 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-3 relative group cursor-pointer"
              onClick={() =>
                setLightboxImage({
                  url: getImageUrl(galleryData.philosophy.rightCard?.image),
                  title: galleryData.philosophy.rightCard?.title,
                  trip: galleryData.philosophy.rightCard?.trip,
                })
              }
            >
              <div className="relative rounded-3xl overflow-hidden aspect-[4/3] border border-neutral-200 shadow-md group-hover:shadow-xl transition-all duration-300">
                <img
                  src={getImageUrl(galleryData.philosophy.rightCard?.image)}
                  alt={galleryData.philosophy.rightCard?.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = getImageUrl('/newimage/herosecction/heroimage.png');
                  }}
                />
                <div className="absolute inset-0 bg-black/15 group-hover:bg-transparent transition-colors" />
                {galleryData.philosophy.rightCard?.tag && (
                  <span className="absolute bottom-3 right-3 text-[10px] font-bold uppercase tracking-wider bg-white/95 text-[#111111] px-2.5 py-1 rounded-lg shadow-sm border border-neutral-200">
                    {galleryData.philosophy.rightCard.tag}
                  </span>
                )}
              </div>
            </motion.div>
          </div>

          {/* ── 3-Column Staggered Grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            {galleryData.philosophy.bottomCards?.map((card, cIdx) => (
              <motion.div
                key={card.id || cIdx}
                initial={{ opacity: 0, y: 40 + cIdx * 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, delay: cIdx * 0.15 }}
                className={`relative group rounded-3xl overflow-hidden border border-neutral-200 shadow-md hover:shadow-xl transition-all cursor-pointer bg-neutral-100 ${
                  cIdx === 0 ? 'aspect-[3/4]' : cIdx === 1 ? 'aspect-square' : 'aspect-[4/3]'
                }`}
                onClick={() =>
                  setLightboxImage({
                    url: getImageUrl(card.image),
                    title: card.title,
                    trip: card.trip,
                  })
                }
              >
                <img
                  src={getImageUrl(card.image)}
                  alt={card.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = getImageUrl('/newimage/herosecction/heroimage.png');
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <span className="text-[10px] font-bold text-[#FF6B16] tracking-widest uppercase">
                    {card.tag}
                  </span>
                  <h4 className="text-base font-bold mt-0.5">{card.title}</h4>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* ============================================================== */}
      {/* ── SECTION 3: PANORAMIC ACCORDION & DINING (Reference 1) ── */}
      {/* ============================================================== */}
      <section className="py-20 bg-[#F2F2EF] border-t border-neutral-300/70">
        {/* Category Navigation Bar + Scroll Arrows matching Reference 1 top */}
        <div className="max-w-6xl mx-auto px-4 mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-neutral-300 pb-4">
            {/* Category tabs */}
            <div className="flex items-center justify-center flex-wrap gap-4 sm:gap-8">
              {filmstripTabs.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveSplitTab(cat)}
                  className={`text-xs sm:text-sm tracking-widest uppercase font-black transition-all cursor-pointer pb-1 relative ${
                    activeSplitTab.toUpperCase() === cat.toUpperCase()
                      ? 'text-[#111111]'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <span>{cat}</span>
                  {activeSplitTab.toUpperCase() === cat.toUpperCase() && (
                    <motion.div
                      layoutId="activeCategoryUnderlineLight"
                      className="absolute -bottom-4 left-0 right-0 h-1 bg-[#FF6B16] rounded-full"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Left / Right Scroll Buttons in Header */}
            {filteredPanels.length > 2 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollFilmstrip('left')}
                  disabled={!canScrollLeft}
                  className={`w-9 h-9 rounded-full border shadow-xs flex items-center justify-center transition-all ${
                    canScrollLeft
                      ? 'bg-white hover:bg-neutral-100 text-[#111111] hover:border-[#FF6B16] cursor-pointer'
                      : 'bg-neutral-100 text-neutral-300 border-neutral-200 cursor-not-allowed opacity-50'
                  }`}
                  title="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollFilmstrip('right')}
                  disabled={!canScrollRight}
                  className={`w-9 h-9 rounded-full border shadow-xs flex items-center justify-center transition-all ${
                    canScrollRight
                      ? 'bg-[#111111] hover:bg-[#FF6B16] text-white border-[#111111] cursor-pointer'
                      : 'bg-neutral-200 text-neutral-400 border-neutral-200 cursor-not-allowed opacity-50'
                  }`}
                  title="Scroll right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Filtered Panoramic Panels Carousel Track */}
        {filteredPanels.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 px-4 bg-white/70 rounded-3xl border border-dashed border-neutral-300 max-w-lg mx-auto my-4 shadow-xs"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#FF6B16]/10 text-[#FF6B16] flex items-center justify-center mx-auto mb-3">
              <Compass className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-[#111111]">
              No moments added in "{activeSplitTab}" yet
            </h4>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              Admin panel se jakar kisi panel ki category <span className="font-bold text-[#FF6B16]">"{activeSplitTab}"</span> select karein ya naya moment panel add karein.
            </p>
          </motion.div>
        ) : (
          <div className="relative group/track w-full">
            {/* Floating Left Arrow */}
            {canScrollLeft && (
              <button
                type="button"
                onClick={() => scrollFilmstrip('left')}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/95 hover:bg-[#FF6B16] text-[#111111] hover:text-white border border-neutral-300 shadow-xl flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
                title="Scroll left"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Floating Right Arrow */}
            {canScrollRight && (
              <button
                type="button"
                onClick={() => scrollFilmstrip('right')}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/95 hover:bg-[#FF6B16] text-[#111111] hover:text-white border border-neutral-300 shadow-xl flex items-center justify-center transition-all cursor-pointer backdrop-blur-md animate-pulse hover:animate-none"
                title="Scroll right"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            <div
              ref={filmstripScrollRef}
              className="w-full overflow-x-auto pb-4 px-4 sm:px-8 scroll-smooth select-none [scrollbar-width:thin] [scrollbar-color:#d4d4d4_transparent]"
            >
              <div
                className={`flex gap-3.5 w-max ${
                  filteredPanels.length <= 2 ? 'mx-auto justify-center min-w-full' : ''
                }`}
              >
                <AnimatePresence mode="popLayout">
                  {filteredPanels.map((panel, idx) => (
                    <motion.div
                      key={panel.id || idx}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4, delay: idx * 0.05 }}
                      className="relative group overflow-hidden cursor-pointer h-[420px] sm:h-[480px] w-[280px] sm:w-[320px] md:w-[350px] shrink-0 rounded-3xl border border-neutral-300/80 shadow-md hover:shadow-2xl transition-all"
                      onClick={() =>
                        setLightboxImage({
                          url: getImageUrl(panel.image),
                          title: panel.title,
                          trip: panel.subtitle,
                        })
                      }
                    >
                      <img
                        src={getImageUrl(panel.image)}
                        alt={panel.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => {
                          e.target.src = getImageUrl('/newimage/herosecction/heroimage.png');
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent group-hover:from-black/85 transition-colors" />

                      {/* Hotspot Ring on Centerpiece */}
                      {panel.isCenter && (
                        <div className="absolute top-[36%] right-[22%]">
                          <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center bg-[#FF6B16]/80 backdrop-blur-sm animate-pulse shadow-lg">
                            <div className="w-2.5 h-2.5 rounded-full bg-white" />
                          </div>
                        </div>
                      )}

                      {/* Panel Footer */}
                      <div className="absolute bottom-6 left-6 right-6 text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold tracking-widest uppercase text-[#FF6B16]">
                              {panel.tag}
                            </span>
                            <h3
                              className="text-lg sm:text-xl font-serif tracking-wide mt-0.5 uppercase"
                              style={{ fontFamily: 'Georgia, serif' }}
                            >
                              {panel.title}
                            </h3>
                            <p className="text-xs text-neutral-300 mt-1 line-clamp-1">
                              {panel.subtitle}
                            </p>
                          </div>

                          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-[#FF6B16] transition-colors shrink-0 pl-3">
                            <span>VIEW</span>
                            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Scroll Indicator & Progress */}
            {(canScrollLeft || canScrollRight) && (
              <div className="flex items-center justify-center gap-3 mt-4">
                <span className="text-[11px] font-bold tracking-wider text-neutral-500 uppercase">
                  Swipe or use arrows to view all {filteredPanels.length} moments
                </span>
                <div className="w-24 sm:w-36 h-1 bg-neutral-300/80 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FF6B16] rounded-full transition-all duration-150"
                    style={{ width: `${Math.max(20, scrollProgress)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ============================================================== */}
      {/* ── SECTION 4: LUXURY SUMMIT CHALET & STAYS (Reference 4) ── */}
      {/* ============================================================== */}
      <section className="py-24 bg-white border-t border-neutral-200 relative">
        <Container>
          {/* Section Sub-Navigation Tabs in Light Theme */}
          <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-10 border-b border-neutral-200">
            {galleryData.accommodations?.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveShowcaseId(item.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  activeShowcase.id === item.id
                    ? 'bg-[#111111] text-white shadow-md'
                    : 'text-neutral-600 hover:text-[#111111] bg-neutral-100 hover:bg-neutral-200/80 border border-neutral-200'
                }`}
              >
                <span>{item.number}</span>
              </button>
            ))}
          </div>

          {/* Active Stay Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            {/* Left Column: Details & Floating Bathroom Inset */}
            <motion.div
              key={`left-${activeShowcase.id}`}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-5 flex flex-col justify-between py-2"
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#FF6B16]">
                  {activeShowcase.tripName} • {activeShowcase.location}
                </span>
                <h3
                  className="text-3xl sm:text-4xl font-serif text-[#111111] tracking-tight mt-1.5 mb-4"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  {activeShowcase.title}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed mb-6">
                  {activeShowcase.desc}
                </p>

                {/* Floating Inset Bathroom Photo with Backlit Mirror */}
                <div
                  className="relative rounded-2xl overflow-hidden aspect-[16/10] max-w-sm border border-neutral-300 shadow-md group cursor-pointer mb-8"
                  onClick={() =>
                    setLightboxImage({
                      url: getImageUrl(activeShowcase.bathroomImg),
                      title: 'Spa En-Suite Bath with Soaking Tub',
                      trip: activeShowcase.number,
                    })
                  }
                >
                  <img
                    src={getImageUrl(activeShowcase.bathroomImg)}
                    alt="Spa Bathroom"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      e.target.src = getImageUrl('/newimage/herosecction/heroimage.png');
                    }}
                  />
                  <div className="absolute inset-0 bg-black/15 group-hover:bg-transparent transition-colors" />
                  <span className="absolute bottom-2.5 left-3 text-[10px] font-bold uppercase tracking-wider bg-white/90 text-[#111111] px-2.5 py-1 rounded-md shadow-sm">
                    En-Suite Bath
                  </span>
                </div>
              </div>

              {/* DETAILS List matching Reference 4 bottom left */}
              <div className="pt-6 border-t border-neutral-200">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-3">
                  EXPEDITION AMENITIES & SPECS
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {activeShowcase.details?.map((detail, dIdx) => {
                    const IconComp = getDetailIcon(detail.icon);
                    return (
                      <div key={dIdx} className="flex items-center gap-2.5 text-xs text-neutral-700 font-semibold">
                        <div className="w-7 h-7 rounded-lg bg-[#FF6B16]/10 flex items-center justify-center text-[#FF6B16] shrink-0">
                          <IconComp className="w-3.5 h-3.5" />
                        </div>
                        <span>{detail.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Right Column: Giant Full-Height Photo */}
            <motion.div
              key={`right-${activeShowcase.id}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 relative group cursor-pointer"
              onClick={() =>
                setLightboxImage({
                  url: getImageUrl(activeShowcase.mainImg),
                  title: activeShowcase.title,
                  trip: `${activeShowcase.tripName} • ${activeShowcase.location}`,
                })
              }
            >
              <div className="relative rounded-3xl overflow-hidden h-[450px] sm:h-[580px] border border-neutral-200 shadow-xl">
                <img
                  src={getImageUrl(activeShowcase.mainImg)}
                  alt={activeShowcase.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = getImageUrl('/newimage/herosecction/heroimage.png');
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                {/* Hotspot circle on ceiling wood/rock */}
                <div className="absolute top-[28%] right-[32%]">
                  <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center bg-[#FF6B16]/80 backdrop-blur-sm animate-pulse shadow-lg">
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-white">
                  <div>
                    <span className="text-xs font-bold text-[#FF6B16] tracking-widest uppercase">
                      HIMALAYAN LIVING & CAMPS
                    </span>
                    <h4 className="text-xl font-serif mt-1">
                      {activeShowcase.tripName}
                    </h4>
                  </div>
                  <span className="px-3.5 py-1.5 rounded-full bg-white text-[#111111] text-xs font-bold shadow-md">
                    Click to Zoom
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* ============================================================== */}
      {/* ── SECTION 5: ALL-TRIP CURATED MASONRY GRID (White Theme) ── */}
      {/* ============================================================== */}
      <section id="masonry-gallery" className="py-24 bg-[#F7F7F5] border-t border-neutral-200/90">
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-bold text-[#FF6B16] tracking-widest uppercase">
                {galleryData.masonry.eyebrow}
              </span>
              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#111111] tracking-tight mt-1"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {galleryData.masonry.title}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-lg">
                {galleryData.masonry.subtitle}
              </p>
            </div>

            {/* Filter Pills in White Theme */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {galleryData.masonry.categories?.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setGridFilter(filter)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    gridFilter === filter
                      ? 'bg-[#FF6B16] text-white shadow-md shadow-[#FF6B16]/25'
                      : 'bg-white text-neutral-600 hover:text-black border border-neutral-300/80 shadow-sm'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Masonry-Style Photo Grid with Light Theme cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[220px]">
            {filteredGrid.map((item, index) => (
              <motion.div
                key={item.id || index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.6, delay: (index % 4) * 0.1 }}
                className={`relative group rounded-3xl overflow-hidden border border-neutral-200/90 shadow-sm hover:shadow-xl transition-all cursor-pointer bg-white ${
                  item.span || 'col-span-1 row-span-1'
                }`}
                onClick={() =>
                  setLightboxImage({
                    url: getImageUrl(item.image),
                    title: item.title,
                    trip: `${item.trip} • ${item.location}`,
                  })
                }
              >
                <img
                  src={getImageUrl(item.image)}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = heroBg;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-75 group-hover:opacity-90 transition-opacity" />

                {/* Hover overlay icon */}
                <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 text-[#111111] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                  <Maximize2 className="w-4 h-4" />
                </div>

                {/* Card Title & Info */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[10px] font-bold text-[#FF6B16] uppercase tracking-widest">
                    {item.trip}
                  </span>
                  <h4 className="text-sm font-bold leading-tight mt-0.5">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-neutral-300 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-[#FF6B16] shrink-0" />
                    <span>{item.location}</span>
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* ============================================================== */}
      {/* ── LIGHTBOX MODAL FULLSCREEN ZOOM VIEW ── */}
      {/* ============================================================== */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex items-center justify-center p-4 sm:p-8"
            onClick={() => setLightboxImage(null)}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Modal Image Card */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-5xl max-h-[85vh] w-full flex flex-col items-center select-none"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-white/15"
              />
              <div className="mt-4 text-center text-white">
                <h3 className="text-lg font-bold">{lightboxImage.title}</h3>
                <p className="text-xs text-neutral-400 mt-1">{lightboxImage.trip}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
