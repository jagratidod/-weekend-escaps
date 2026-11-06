import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Navigation, Mousewheel } from 'swiper/modules';
import { TRIP_REELS } from '../../data/reels';
import { getImageUrl } from '../../utils/imageHelper';

// Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';

/**
 * Returns a lightweight static poster image for side cards or fallback
 */
const getReelThumbnail = (reel) => {
  if (!reel) return getImageUrl('/newimage/exploresection/kedarkantha.png');
  if (reel.poster && typeof reel.poster === 'string' && reel.poster.trim() !== '') {
    return reel.poster.startsWith('http') ? reel.poster : getImageUrl(reel.poster);
  }
  if (typeof reel.video === 'string' && reel.video.includes('cloudinary.com')) {
    // Cloudinary dynamic video frame capture (0.5s offset JPG)
    return reel.video.replace('/video/upload/', '/video/upload/so_0.5/').replace(/\.(mp4|mov|webm|mkv)$/i, '.jpg');
  }
  return getImageUrl('/newimage/exploresection/kedarkantha.png');
};

/**
 * Robust Reel Card Media that guarantees the starting frame is displayed
 * without any black screen or broken image icons.
 */
function ReelCardMedia({ reel, alt = '' }) {
  const [imgError, setImgError] = useState(false);
  const posterUrl = getReelThumbnail(reel);

  return (
    <div className="relative w-full h-full bg-neutral-900 overflow-hidden pointer-events-none">
      {/* Starting frame video fallback: immediately cues to 0.001s without autoplay */}
      {reel?.video && (
        <video
          src={`${reel.video}#t=0.001`}
          preload="metadata"
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
      )}
      {/* Poster image overlay if valid */}
      {!imgError && posterUrl && (
        <img
          src={posterUrl}
          alt={alt || reel?.author || 'Travel Reel'}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 pointer-events-none"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      )}
    </div>
  );
}

/**
 * Active Center Reel Card
 * Permanently anchored in the center of the viewport by Swiper centeredSlides.
 * Plays/pauses in-place without opening any fullscreen modal.
 */
function ActiveCenterReelCard({
  reel,
  isPlaying,
  isAudioOn,
  onTogglePlay,
  onToggleSound,
}) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!isPlaying) {
      video.pause();
      try {
        if (video.currentTime === 0) video.currentTime = 0.001;
      } catch (_) {}
      return;
    }

    video.muted = !isAudioOn;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {});
    }
  }, [isPlaying, isAudioOn, reel.video]);

  return (
    <div
      onClick={onTogglePlay}
      className="group relative z-30 w-full h-[330px] sm:h-[385px] md:h-[425px] lg:h-[465px] xl:h-[490px] rounded-[22px] sm:rounded-[26px] overflow-hidden shadow-2xl shadow-black/45 ring-3 ring-white/95 border border-white/20 bg-neutral-950 transition-all duration-300 transform scale-100 cursor-pointer"
    >
      <video
        ref={videoRef}
        key={reel.video}
        src={`${reel.video}#t=0.001`}
        loop
        playsInline
        preload="auto"
        poster={getReelThumbnail(reel)}
        muted={!isAudioOn}
        className="w-full h-full object-cover"
        onLoadedData={(e) => {
          if (!isPlaying && e.target.currentTime === 0) {
            try {
              e.target.currentTime = 0.001;
            } catch (_) {}
          }
        }}
      />

      {/* Center Play Button Overlay when paused */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-black/65 backdrop-blur-md text-white flex items-center justify-center shadow-xl ring-2 ring-white/60 transition-transform group-hover:scale-110">
            <Play className="w-5 h-5 fill-white text-white ml-0.5" />
          </div>
        </div>
      )}

      {/* Top-Left: Play / Pause Toggle Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onTogglePlay();
        }}
        className="absolute top-3 left-3 z-20 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:scale-110 transition-transform cursor-pointer shadow-md"
        title={isPlaying ? 'Pause video' : 'Play video'}
      >
        {isPlaying ? (
          <Pause className="w-3.5 h-3.5 text-white fill-white" />
        ) : (
          <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
        )}
      </button>

      {/* Top-Right: Sound Toggle Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleSound();
        }}
        className="absolute top-3 right-3 z-20 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:scale-110 transition-transform cursor-pointer shadow-md"
        title={isAudioOn ? 'Mute audio' : 'Play audio with sound'}
      >
        {isAudioOn ? (
          <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <VolumeX className="w-3.5 h-3.5 text-white" />
        )}
      </button>

      {/* Bottom Overlay: Author & Trek Name */}
      <div className="absolute bottom-0 inset-x-0 p-3.5 sm:p-4 bg-gradient-to-t from-black/90 via-black/45 to-transparent text-white z-20 pointer-events-none">
        <h3 className="text-sm sm:text-base font-black text-white leading-tight drop-shadow-md truncate">
          {reel.author}
        </h3>
        <p className="text-[10px] font-bold text-neutral-300 uppercase tracking-wider mt-0.5 drop-shadow-sm truncate">
          {reel.trek}
        </p>
      </div>
    </div>
  );
}

/**
 * Side Poster Card
 * Lightweight static thumbnail. Clicking it smoothly glides it into the center.
 */
function SidePosterCard({ reel }) {
  return (
    <div className="group relative w-full h-[330px] sm:h-[385px] md:h-[425px] lg:h-[465px] xl:h-[490px] rounded-[22px] sm:rounded-[26px] overflow-hidden shadow-lg shadow-black/25 bg-neutral-900 border border-white/20 cursor-pointer transition-all duration-300 hover:border-white/40">
      <ReelCardMedia reel={reel} alt={reel.author} />
      <div className="absolute inset-0 bg-black/35 group-hover:bg-black/15 transition-colors pointer-events-none" />

      {/* Top-Left: Play Outline Icon */}
      <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none drop-shadow-md opacity-80">
        <Play className="w-3.5 h-3.5 text-white stroke-[2.2] fill-transparent" />
      </div>

      {/* Top-Right: Sound Icon */}
      <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none drop-shadow-md opacity-80">
        <VolumeX className="w-3.5 h-3.5 text-white" />
      </div>

      {/* Bottom Overlay */}
      <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/85 via-black/40 to-transparent text-white z-10 pointer-events-none">
        <h3 className="text-xs sm:text-sm font-bold text-white leading-tight drop-shadow-md truncate">
          {reel.author}
        </h3>
        <p className="text-[9px] font-semibold text-neutral-300 uppercase tracking-wider mt-0.5 drop-shadow-sm truncate">
          {reel.trek}
        </p>
      </div>
    </div>
  );
}

export function TripReelsRow({
  title = 'What Our Travellers Say',
  subtitle = '',
  maxReels = 5,
  className = '',
}) {
  const [allReels, setAllReels] = useState(TRIP_REELS);
  const [activeRealIndex, setActiveRealIndex] = useState(0);
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const swiperRef = useRef(null);

  // Fetch dynamic reels from backend with graceful fallback to TRIP_REELS
  useEffect(() => {
    let isMounted = true;
    const fetchDynamicReels = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        const res = await fetch(`${API_BASE}/reels`);
        if (!res.ok) return;
        const json = await res.json();
        if (isMounted && json.success && Array.isArray(json.data) && json.data.length > 0) {
          setAllReels(json.data);
        }
      } catch (err) {
        // Silently fallback to bundled default reels
      }
    };
    fetchDynamicReels();
    return () => {
      isMounted = false;
    };
  }, []);

  const reels = useMemo(() => {
    const list = Array.isArray(allReels) && allReels.length > 0 ? allReels : TRIP_REELS;
    return maxReels && list.length > maxReels ? list.slice(0, maxReels) : list;
  }, [allReels, maxReels]);

  const baseTotal = reels.length;

  // Prepare display array for seamless infinite looping in Swiper Coverflow
  const displayReels = useMemo(() => {
    if (!reels || reels.length === 0) return [];
    if (reels.length < 6) {
      // Repeat 3 times to provide plenty of perspective slides on both sides
      return [...reels, ...reels, ...reels];
    }
    return [...reels, ...reels];
  }, [reels]);

  const initialSlideIndex = useMemo(() => {
    if (reels.length < 6) {
      return reels.length; // Start in middle set
    }
    return 0;
  }, [reels.length]);

  // Toggle play/pause for active center video
  const handleTogglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  // Toggle sound for active center video
  const handleToggleSound = useCallback(() => {
    setIsAudioOn((prev) => !prev);
  }, []);

  // Keyboard navigation (Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        swiperRef.current?.slidePrev();
      } else if (e.key === 'ArrowRight') {
        swiperRef.current?.slideNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!reels || reels.length === 0) return null;

  return (
    <div className={`mb-8 w-full ${className}`}>
      {/* ── Section Title ── */}
      {title && (
        <div className="text-center mb-5 px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#111111] tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1.5 text-xs sm:text-sm text-neutral-500 font-medium max-w-lg mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* ── 3D Coverflow Stage with Visibly Animated Scrolling ── */}
      <div className="relative flex items-center justify-center min-h-[350px] sm:min-h-[400px] md:min-h-[440px] lg:min-h-[480px] w-full px-2 sm:px-4 md:px-6 overflow-hidden select-none py-2">
        {/* Navigation Arrow Left */}
        <button
          type="button"
          onClick={() => swiperRef.current?.slidePrev()}
          className="absolute left-2 sm:left-4 md:left-6 z-40 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/95 hover:bg-[#FF6B16] text-neutral-800 hover:text-white shadow-xl flex items-center justify-center transition-all cursor-pointer border border-neutral-200/80 active:scale-95"
          aria-label="Previous reel"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Navigation Arrow Right */}
        <button
          type="button"
          onClick={() => swiperRef.current?.slideNext()}
          className="absolute right-2 sm:right-4 md:right-6 z-40 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/95 hover:bg-[#FF6B16] text-neutral-800 hover:text-white shadow-xl flex items-center justify-center transition-all cursor-pointer border border-neutral-200/80 active:scale-95"
          aria-label="Next reel"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Swiper Coverflow Carousel */}
        <div className="w-full max-w-[1380px] mx-auto overflow-hidden">
          <Swiper
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            modules={[EffectCoverflow, Navigation, Mousewheel]}
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            slidesPerView="auto"
            spaceBetween={14}
            slideToClickedSlide={true}
            loop={displayReels.length >= 6}
            initialSlide={initialSlideIndex}
            speed={550}
            mousewheel={{
              forceToAxis: true,
              releaseOnEdges: true,
              sensitivity: 0.8,
            }}
            coverflowEffect={{
              rotate: 0,
              stretch: 0,
              depth: 95,
              modifier: 1.3,
              scale: 0.88,
              slideShadows: false,
            }}
            onSlideChange={(swiper) => {
              setActiveRealIndex(swiper.realIndex % baseTotal);
            }}
            className="w-full py-4 select-none !overflow-visible"
          >
            {displayReels.map((reel, idx) => {
              const slideKey = `reel-slide-${reel._id || reel.id || 'item'}-${idx}`;
              return (
                <SwiperSlide
                  key={slideKey}
                  className="!w-[190px] xs:!w-[215px] sm:!w-[240px] md:!w-[265px] lg:!w-[285px] !shrink-0"
                >
                  {({ isActive }) =>
                    isActive ? (
                      <ActiveCenterReelCard
                        reel={reel}
                        isPlaying={isPlaying}
                        isAudioOn={isAudioOn}
                        onTogglePlay={handleTogglePlay}
                        onToggleSound={handleToggleSound}
                      />
                    ) : (
                      <SidePosterCard reel={reel} />
                    )
                  }
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>

      {/* ── Dot Indicators ── */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {reels.map((_, idx) => {
          const isCurrent = activeRealIndex === idx;
          return (
            <button
              key={`reel-dot-${idx}`}
              type="button"
              onClick={() => {
                if (swiperRef.current) {
                  swiperRef.current.slideToLoop(idx);
                }
              }}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                isCurrent
                  ? 'w-7 h-2 bg-[#FF6B16]'
                  : 'w-2 h-2 bg-neutral-300 hover:bg-neutral-400'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
}

export default TripReelsRow;
