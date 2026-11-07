import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Navigation, Mousewheel } from 'swiper/modules';
import { TRIP_REELS } from '../../data/reels';
import { getImageUrl } from '../../utils/imageHelper';

// Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';

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
 * Reel Card Media for Side Cards:
 * Shows the video frame cued to its starting timestamp, or poster fallback.
 */
function ReelCardMedia({ reel, alt = '' }) {
  const [imgError, setImgError] = useState(false);
  const posterUrl = getReelThumbnail(reel);
  const timeOffset = reel?.timeOffset ?? 0.001;

  return (
    <div className="relative w-full h-full bg-neutral-900 overflow-hidden pointer-events-none">
      {reel?.video ? (
        <video
          src={`${reel.video}#t=${timeOffset}`}
          preload="metadata"
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
      ) : (
        !imgError && posterUrl && (
          <img
            src={posterUrl}
            alt={alt || reel?.author || 'Travel Reel'}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )
      )}
    </div>
  );
}

/**
 * Active Center Reel Card:
 * Centered prominently in the viewport with higher elevation and scale.
 * Plays the reel in loop. Tapping toggles play/pause, top-right toggles audio.
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
      className="group relative z-30 w-full h-[360px] xs:h-[400px] sm:h-[450px] md:h-[490px] lg:h-[520px] rounded-[24px] sm:rounded-[28px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.38)] bg-neutral-950 transition-all duration-300 cursor-pointer select-none"
    >
      <video
        ref={videoRef}
        key={reel.video}
        src={reel.video}
        loop
        playsInline
        preload="auto"
        poster={getReelThumbnail(reel)}
        muted={!isAudioOn}
        className="w-full h-full object-cover pointer-events-none"
      />

      {/* Top-Left: Play / Pause Icon (clean white, matching screenshot) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onTogglePlay();
        }}
        className="absolute top-3.5 left-3.5 sm:top-4 sm:left-4 z-20 text-white/95 hover:text-white transition-transform hover:scale-110 cursor-pointer drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
        title={isPlaying ? 'Pause video' : 'Play video'}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 sm:w-[18px] sm:h-[18px] stroke-[2.2] fill-transparent" />
        ) : (
          <Play className="w-4 h-4 sm:w-[18px] sm:h-[18px] stroke-[2.2] fill-white/20 ml-0.5" />
        )}
      </button>

      {/* Top-Right: Sound Toggle Button (clean white, matching screenshot) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleSound();
        }}
        className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-20 text-white/95 hover:text-white transition-transform hover:scale-110 cursor-pointer drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
        title={isAudioOn ? 'Mute audio' : 'Play audio with sound'}
      >
        {isAudioOn ? (
          <Volume2 className="w-4 h-4 sm:w-[18px] sm:h-[18px] stroke-[2]" />
        ) : (
          <VolumeX className="w-4 h-4 sm:w-[18px] sm:h-[18px] stroke-[2]" />
        )}
      </button>

      {/* Bottom Overlay: Author & Trek Name with smooth fade */}
      <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 pb-5 sm:pb-6 bg-gradient-to-t from-black/85 via-black/35 to-transparent text-white z-20 pointer-events-none">
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg lg:text-[19px] font-bold text-white tracking-wide leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] truncate">
              {reel.author}
            </h3>
            <p className="text-[10px] sm:text-[11px] font-semibold text-neutral-300 uppercase tracking-wider drop-shadow-sm mt-0.5 truncate">
              {reel.trek}
            </p>
          </div>
          {reel.location && (
            <span className="shrink-0 text-[9px] sm:text-[10px] font-bold text-neutral-300/90 tracking-wide uppercase drop-shadow-sm flex items-center gap-0.5 pb-0.5">
              📍 {reel.location}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Side Poster Card:
 * Scaled-down side preview card with flat front-facing perspective.
 * Clicking glides it smoothly into the center.
 */
function SidePosterCard({ reel }) {
  return (
    <div className="group relative w-full h-[360px] xs:h-[400px] sm:h-[450px] md:h-[490px] lg:h-[520px] rounded-[22px] sm:rounded-[26px] overflow-hidden shadow-[0_10px_25px_rgba(0,0,0,0.2)] bg-neutral-900 cursor-pointer select-none transition-all duration-300">
      <ReelCardMedia reel={reel} alt={reel.author} />
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors pointer-events-none" />

      {/* Top-Left: Play Outline Icon */}
      <div className="absolute top-3.5 left-3.5 sm:top-4 sm:left-4 z-10 pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] opacity-85">
        <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white stroke-[2.2] fill-transparent" />
      </div>

      {/* Top-Right: Sound Icon */}
      <div className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-10 pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] opacity-85">
        <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white stroke-[2]" />
      </div>

      {/* Bottom Overlay: Author & Trek Name */}
      <div className="absolute bottom-0 inset-x-0 p-3.5 sm:p-4 pb-4 sm:pb-5 bg-gradient-to-t from-black/85 via-black/35 to-transparent text-white z-10 pointer-events-none">
        <div className="flex items-end justify-between gap-1.5">
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm md:text-[15px] font-bold text-white leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] truncate">
              {reel.author}
            </h3>
            <p className="text-[9px] sm:text-[10px] font-semibold text-neutral-300 uppercase tracking-wider mt-0.5 drop-shadow-sm truncate">
              {reel.trek}
            </p>
          </div>
          {reel.location && (
            <span className="shrink-0 text-[8px] sm:text-[9px] font-semibold text-neutral-300/80 uppercase tracking-wide drop-shadow-sm flex items-center gap-0.5 pb-0.5">
              📍 {reel.location}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function TripReelsRow({
  title = 'What Our Travellers Say',
  subtitle = '',
  maxReels = 10,
  className = '',
}) {
  const [allReels, setAllReels] = useState(TRIP_REELS);
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

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

  // Find index of Anil Yogi to start centered as in screenshot, or default to index 2
  const centerItemIndex = useMemo(() => {
    const foundIdx = reels.findIndex(
      (r) => (r.author || '').toLowerCase().includes('anil yogi')
    );
    return foundIdx !== -1 ? foundIdx : Math.min(2, Math.max(0, reels.length - 1));
  }, [reels]);

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
      return reels.length + centerItemIndex; // Start in middle set at centerItemIndex
    }
    return centerItemIndex;
  }, [reels.length, centerItemIndex]);

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
    <div className={`w-full bg-white ${className}`}>
      {/* ── Section Title ── */}
      {title && (
        <div className="text-center mb-6 sm:mb-10 px-4">
          <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold text-[#111111] tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1.5 text-xs sm:text-sm text-neutral-500 font-medium max-w-lg mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* ── Carousel Stage with Centered Focus ── */}
      <div className="relative flex items-center justify-center min-h-[380px] xs:min-h-[420px] sm:min-h-[470px] md:min-h-[510px] lg:min-h-[550px] w-full px-2 sm:px-4 md:px-6 overflow-hidden select-none py-2">
        <div className="w-full max-w-[1400px] mx-auto overflow-hidden">
          <Swiper
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            modules={[EffectCoverflow, Navigation, Mousewheel]}
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            slidesPerView="auto"
            spaceBetween={20}
            slideToClickedSlide={true}
            loop={displayReels.length >= 6}
            initialSlide={initialSlideIndex}
            speed={500}
            mousewheel={{
              forceToAxis: true,
              releaseOnEdges: true,
              sensitivity: 0.8,
            }}
            coverflowEffect={{
              rotate: 0,
              stretch: 0,
              depth: 60,
              modifier: 1,
              scale: 0.84,
              slideShadows: false,
            }}
            className="w-full py-4 select-none !overflow-visible"
          >
            {displayReels.map((reel, idx) => {
              const slideKey = `reel-slide-${reel._id || reel.id || 'item'}-${idx}`;
              return (
                <SwiperSlide
                  key={slideKey}
                  className="!w-[195px] xs:!w-[220px] sm:!w-[245px] md:!w-[270px] lg:!w-[290px] !shrink-0"
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
    </div>
  );
}

export default TripReelsRow;
