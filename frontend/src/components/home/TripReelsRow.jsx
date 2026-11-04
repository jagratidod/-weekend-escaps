import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
} from 'lucide-react';
import { TRIP_REELS } from '../../data/reels';
import { getImageUrl } from '../../utils/imageHelper';

/**
 * Returns a lightweight static poster image for side cards
 * To preserve Cloudinary bandwidth, side cards NEVER load or stream video.
 */
const getReelThumbnail = (reel) => {
  if (!reel) return getImageUrl('/newimage/exploresection/kedarkantha.png');
  if (reel.poster) {
    return reel.poster.startsWith('http') ? reel.poster : getImageUrl(reel.poster);
  }
  if (typeof reel.video === 'string' && reel.video.includes('cloudinary.com')) {
    return reel.video.replace(/\.(mp4|mov|webm|mkv)$/i, '.jpg');
  }
  return getImageUrl('/newimage/exploresection/kedarkantha.png');
};

export function TripReelsRow() {
  const [reels, setReels] = useState(TRIP_REELS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeModalIndex, setActiveModalIndex] = useState(null);

  const centerVideoRef = useRef(null);
  const modalVideoRef = useRef(null);
  const [modalIsMuted, setModalIsMuted] = useState(false);
  const [modalIsPlaying, setModalIsPlaying] = useState(true);
  const touchStartX = useRef(0);

  const total = reels.length;

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
          setReels(json.data);
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

  // Ensure center video plays with audio (handles browser autoplay policies smoothly)
  useEffect(() => {
    const video = centerVideoRef.current;
    if (!video) return;

    video.muted = !isAudioOn;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // If browser policy blocks unmuted autoplay without prior gesture,
          // temporarily mute to ensure smooth playback
          if (isAudioOn) {
            video.muted = true;
            video.play().catch(() => {});
          }
        });
    }
  }, [currentIndex, isAudioOn]);

  // Unmute on first user interaction if blocked
  const handleUserInteraction = useCallback(() => {
    if (centerVideoRef.current && isAudioOn && centerVideoRef.current.muted) {
      centerVideoRef.current.muted = false;
    }
  }, [isAudioOn]);

  // Carousel Navigation Handlers
  const prevReel = () => {
    handleUserInteraction();
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const nextReel = () => {
    handleUserInteraction();
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const goToOffset = (offset) => {
    handleUserInteraction();
    setCurrentIndex((prev) => (prev + offset + total) % total);
  };

  // Sound toggle on center card
  const toggleSound = (e) => {
    e.stopPropagation();
    setIsAudioOn((prev) => {
      const next = !prev;
      if (centerVideoRef.current) {
        centerVideoRef.current.muted = !next;
        if (next) centerVideoRef.current.play().catch(() => {});
      }
      return next;
    });
  };

  // Modal Fullscreen Handlers
  const openReelModal = (idx) => {
    handleUserInteraction();
    setActiveModalIndex(idx);
    setModalIsMuted(!isAudioOn);
    setModalIsPlaying(true);
  };

  const closeReelModal = () => {
    setActiveModalIndex(null);
  };

  const prevModalReel = (e) => {
    e.stopPropagation();
    setActiveModalIndex((prev) => (prev - 1 + total) % total);
  };

  const nextModalReel = (e) => {
    e.stopPropagation();
    setActiveModalIndex((prev) => (prev + 1) % total);
  };

  // Touch Swipe for Mobile
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 45) {
      nextReel();
    } else if (diff < -45) {
      prevReel();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeModalIndex !== null) {
        if (e.key === 'Escape') closeReelModal();
        if (e.key === 'ArrowRight') nextModalReel(e);
        if (e.key === 'ArrowLeft') prevModalReel(e);
        return;
      }
      if (e.key === 'ArrowLeft') prevReel();
      if (e.key === 'ArrowRight') nextReel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModalIndex]);

  // Offsets for the 5-card perspective coverflow (-2: far-left, -1: mid-left, 0: center, 1: mid-right, 2: far-right)
  const offsets = [-2, -1, 0, 1, 2];

  return (
    <div className="mb-14 w-full">
      {/* ── Section Title matching reference screenshot ── */}
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#111111] tracking-tight">
          What Our Travellers Say
        </h2>
      </div>

      {/* ── Fullscreen-Width 3D Carousel Stage ── */}
      <div
        className="relative flex items-center justify-center min-h-[440px] sm:min-h-[500px] md:min-h-[560px] lg:min-h-[610px] w-full px-2 sm:px-4 md:px-8 overflow-hidden select-none py-4"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Navigation Arrow Left */}
        <button
          onClick={prevReel}
          className="absolute left-2 sm:left-4 md:left-6 lg:left-8 z-40 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white/95 hover:bg-[#FF6B16] text-neutral-800 hover:text-white shadow-xl flex items-center justify-center transition-all cursor-pointer border border-neutral-200/80 active:scale-95"
          aria-label="Previous reel"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Navigation Arrow Right */}
        <button
          onClick={nextReel}
          className="absolute right-2 sm:right-4 md:right-6 lg:right-8 z-40 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white/95 hover:bg-[#FF6B16] text-neutral-800 hover:text-white shadow-xl flex items-center justify-center transition-all cursor-pointer border border-neutral-200/80 active:scale-95"
          aria-label="Next reel"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* 5 Visible Perspective Cards Spread Across Full Width */}
        <div className="flex items-center justify-center gap-2.5 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-8 w-full max-w-[1680px] mx-auto">
          {offsets.map((offset) => {
            const reelIdx = (currentIndex + offset + total) % total;
            const reel = reels[reelIdx];

            // ── 1. CENTER CARD (PLAYING VIDEO WITH AUDIO) ──
            if (offset === 0) {
              return (
                <div
                  key={reel.id}
                  onClick={() => openReelModal(currentIndex)}
                  className="relative z-30 w-[220px] sm:w-[260px] md:w-[290px] lg:w-[325px] xl:w-[345px] h-[390px] sm:h-[450px] md:h-[500px] lg:h-[545px] xl:h-[575px] rounded-[26px] sm:rounded-[32px] overflow-hidden shadow-2xl shadow-black/45 ring-4 ring-white/90 border border-neutral-200/40 bg-neutral-950 transition-all duration-500 ease-out transform scale-100 cursor-pointer shrink-0"
                >
                  {/* ONLY THE CENTER VIDEO LOADS & STREAMS (Saves Cloudinary Bandwidth) */}
                  <video
                    ref={centerVideoRef}
                    src={reel.video}
                    autoPlay
                    loop
                    playsInline
                    preload="auto"
                    muted={!isAudioOn}
                    className="w-full h-full object-cover"
                  />

                  {/* Top-Left: Play Outline Icon */}
                  <div className="absolute top-3.5 left-3.5 z-20 pointer-events-none drop-shadow-md">
                    <Play className="w-5 h-5 text-white stroke-[2.2] fill-transparent" />
                  </div>

                  {/* Top-Right: Sound Toggle Button */}
                  <button
                    onClick={toggleSound}
                    className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:scale-110 transition-transform cursor-pointer shadow-md"
                    title={isAudioOn ? 'Mute audio' : 'Play audio with sound'}
                  >
                    {isAudioOn ? (
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-white" />
                    )}
                  </button>

                  {/* Bottom Overlay: Author & Trek Name */}
                  <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black/90 via-black/45 to-transparent text-white z-20">
                    <h3 className="text-base sm:text-lg font-black text-white leading-tight drop-shadow-md">
                      {reel.author}
                    </h3>
                    <p className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider mt-1 drop-shadow-sm">
                      {reel.trek}
                    </p>
                  </div>
                </div>
              );
            }

            // ── 2. MID-LEFT CARD (PUSHED BACK, STATIC THUMBNAIL) ──
            if (offset === -1) {
              return (
                <div
                  key={reel.id}
                  onClick={() => goToOffset(-1)}
                  className="relative z-20 w-[170px] sm:w-[210px] md:w-[240px] lg:w-[270px] xl:w-[290px] h-[320px] sm:h-[385px] md:h-[435px] lg:h-[475px] xl:h-[500px] rounded-[22px] sm:rounded-[28px] overflow-hidden shadow-xl shadow-black/25 transition-all duration-500 ease-out transform scale-95 opacity-80 hover:opacity-100 hover:scale-[0.98] cursor-pointer bg-neutral-900 border border-white/20 shrink-0"
                >
                  <img
                    src={getReelThumbnail(reel)}
                    alt={reel.author}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/35 hover:bg-black/15 transition-colors" />

                  {/* Top-Left: Play Icon */}
                  <div className="absolute top-3.5 left-3.5 z-10 pointer-events-none drop-shadow-md opacity-80">
                    <Play className="w-4 h-4 text-white stroke-[2.2] fill-transparent" />
                  </div>

                  {/* Top-Right: Sound Icon */}
                  <div className="absolute top-3.5 right-3.5 z-10 pointer-events-none drop-shadow-md opacity-80">
                    <VolumeX className="w-4 h-4 text-white" />
                  </div>

                  {/* Bottom Overlay */}
                  <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/85 via-black/40 to-transparent text-white z-10">
                    <h3 className="text-sm sm:text-base font-bold text-white leading-tight drop-shadow-md truncate">
                      {reel.author}
                    </h3>
                    <p className="text-[10px] font-semibold text-neutral-300 uppercase tracking-wider mt-0.5 drop-shadow-sm truncate">
                      {reel.trek}
                    </p>
                  </div>
                </div>
              );
            }

            // ── 3. MID-RIGHT CARD (PUSHED BACK, STATIC THUMBNAIL) ──
            if (offset === 1) {
              return (
                <div
                  key={reel.id}
                  onClick={() => goToOffset(1)}
                  className="relative z-20 w-[170px] sm:w-[210px] md:w-[240px] lg:w-[270px] xl:w-[290px] h-[320px] sm:h-[385px] md:h-[435px] lg:h-[475px] xl:h-[500px] rounded-[22px] sm:rounded-[28px] overflow-hidden shadow-xl shadow-black/25 transition-all duration-500 ease-out transform scale-95 opacity-80 hover:opacity-100 hover:scale-[0.98] cursor-pointer bg-neutral-900 border border-white/20 shrink-0"
                >
                  <img
                    src={getReelThumbnail(reel)}
                    alt={reel.author}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/35 hover:bg-black/15 transition-colors" />

                  {/* Top-Left: Play Icon */}
                  <div className="absolute top-3.5 left-3.5 z-10 pointer-events-none drop-shadow-md opacity-80">
                    <Play className="w-4 h-4 text-white stroke-[2.2] fill-transparent" />
                  </div>

                  {/* Top-Right: Sound Icon */}
                  <div className="absolute top-3.5 right-3.5 z-10 pointer-events-none drop-shadow-md opacity-80">
                    <VolumeX className="w-4 h-4 text-white" />
                  </div>

                  {/* Bottom Overlay */}
                  <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/85 via-black/40 to-transparent text-white z-10">
                    <h3 className="text-sm sm:text-base font-bold text-white leading-tight drop-shadow-md truncate">
                      {reel.author}
                    </h3>
                    <p className="text-[10px] font-semibold text-neutral-300 uppercase tracking-wider mt-0.5 drop-shadow-sm truncate">
                      {reel.trek}
                    </p>
                  </div>
                </div>
              );
            }

            // ── 4. FAR-LEFT CARD (FURTHER BACK, STATIC THUMBNAIL) ──
            if (offset === -2) {
              return (
                <div
                  key={reel.id}
                  onClick={() => goToOffset(-2)}
                  className="hidden sm:block relative z-10 sm:w-[155px] md:w-[190px] lg:w-[220px] xl:w-[245px] sm:h-[310px] md:h-[365px] lg:h-[405px] xl:h-[430px] rounded-[18px] sm:rounded-[24px] overflow-hidden shadow-lg shadow-black/20 transition-all duration-500 ease-out transform scale-90 opacity-55 hover:opacity-85 cursor-pointer bg-neutral-900 border border-white/10 shrink-0"
                >
                  <img
                    src={getReelThumbnail(reel)}
                    alt={reel.author}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/45 hover:bg-black/20 transition-colors" />

                  <div className="absolute top-3 left-3 z-10 pointer-events-none drop-shadow-md opacity-60">
                    <Play className="w-3.5 h-3.5 text-white stroke-[2] fill-transparent" />
                  </div>

                  <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/85 via-black/40 to-transparent text-white z-10">
                    <h3 className="text-xs sm:text-sm font-bold text-white leading-tight drop-shadow-md truncate">
                      {reel.author}
                    </h3>
                    <p className="text-[9px] font-semibold text-neutral-300 uppercase tracking-wider mt-0.5 truncate">
                      {reel.trek}
                    </p>
                  </div>
                </div>
              );
            }

            // ── 5. FAR-RIGHT CARD (FURTHER BACK, STATIC THUMBNAIL) ──
            if (offset === 2) {
              return (
                <div
                  key={reel.id}
                  onClick={() => goToOffset(2)}
                  className="hidden sm:block relative z-10 sm:w-[155px] md:w-[190px] lg:w-[220px] xl:w-[245px] sm:h-[310px] md:h-[365px] lg:h-[405px] xl:h-[430px] rounded-[18px] sm:rounded-[24px] overflow-hidden shadow-lg shadow-black/20 transition-all duration-500 ease-out transform scale-90 opacity-55 hover:opacity-85 cursor-pointer bg-neutral-900 border border-white/10 shrink-0"
                >
                  <img
                    src={getReelThumbnail(reel)}
                    alt={reel.author}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/45 hover:bg-black/20 transition-colors" />

                  <div className="absolute top-3 left-3 z-10 pointer-events-none drop-shadow-md opacity-60">
                    <Play className="w-3.5 h-3.5 text-white stroke-[2] fill-transparent" />
                  </div>

                  <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/85 via-black/40 to-transparent text-white z-10">
                    <h3 className="text-xs sm:text-sm font-bold text-white leading-tight drop-shadow-md truncate">
                      {reel.author}
                    </h3>
                    <p className="text-[9px] font-semibold text-neutral-300 uppercase tracking-wider mt-0.5 truncate">
                      {reel.trek}
                    </p>
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>

      {/* ── Dot Indicators ── */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {reels.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              handleUserInteraction();
              setCurrentIndex(idx);
            }}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              idx === currentIndex
                ? 'w-7 h-2 bg-[#FF6B16]'
                : 'w-2 h-2 bg-neutral-300 hover:bg-neutral-400'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* ── Fullscreen Reel Lightbox Modal ── */}
      {activeModalIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-2 sm:p-6"
          onClick={closeReelModal}
        >
          {/* Close button */}
          <button
            onClick={closeReelModal}
            className="absolute top-5 right-5 sm:top-8 sm:right-8 w-11 h-11 rounded-full bg-white/10 hover:bg-[#FF6B16] text-white flex items-center justify-center transition-all cursor-pointer z-50 shadow-lg"
            aria-label="Close reel player"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Previous Reel */}
          <button
            onClick={prevModalReel}
            className="hidden md:flex absolute left-6 lg:left-12 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-[#FF6B16] text-white items-center justify-center transition-all cursor-pointer z-50 shadow-lg"
            aria-label="Previous reel"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next Reel */}
          <button
            onClick={nextModalReel}
            className="hidden md:flex absolute right-6 lg:right-12 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-[#FF6B16] text-white items-center justify-center transition-all cursor-pointer z-50 shadow-lg"
            aria-label="Next reel"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Modal Card Player */}
          <div
            className="relative w-full max-w-[380px] sm:max-w-[400px] h-[85vh] max-h-[760px] rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/15 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
              <video
                ref={modalVideoRef}
                src={reels[activeModalIndex].video}
                autoPlay
                loop
                muted={modalIsMuted}
                playsInline
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => {
                  if (!modalVideoRef.current) return;
                  if (modalVideoRef.current.paused) {
                    modalVideoRef.current.play();
                    setModalIsPlaying(true);
                  } else {
                    modalVideoRef.current.pause();
                    setModalIsPlaying(false);
                  }
                }}
              />

              {!modalIsPlaying && (
                <div
                  onClick={() => {
                    if (modalVideoRef.current) {
                      modalVideoRef.current.play();
                      setModalIsPlaying(true);
                    }
                  }}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer z-20"
                >
                  <div className="w-16 h-16 rounded-full bg-[#FF6B16] text-white flex items-center justify-center shadow-xl">
                    <Play className="w-7 h-7 fill-white translate-x-0.5" />
                  </div>
                </div>
              )}

              {/* Top Controls in Modal */}
              <div className="absolute top-0 inset-x-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent z-20">
                <div className="drop-shadow-md">
                  <Play className="w-5 h-5 text-white stroke-[2.2] fill-transparent" />
                </div>

                <button
                  onClick={() => setModalIsMuted(!modalIsMuted)}
                  className="text-white hover:scale-110 transition-transform cursor-pointer drop-shadow-md"
                >
                  {modalIsMuted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-emerald-400" />
                  )}
                </button>
              </div>

              {/* Bottom Reel Details */}
              <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black via-black/60 to-transparent z-20 text-white">
                <h3 className="text-lg font-bold text-white leading-tight drop-shadow-md">
                  {reels[activeModalIndex].author}
                </h3>
                <p className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mt-1 drop-shadow-sm">
                  {reels[activeModalIndex].trek}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TripReelsRow;
