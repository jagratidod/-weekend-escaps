import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Film,
  Info,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { TRIP_REELS } from '../../data/reels';

function ReelCard({
  reel,
  cardKey,
  isUnmuted,
  onToggleAudio,
  onOpenModal,
}) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isUnmuted;
      if (isUnmuted) {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [isUnmuted]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <div
      onClick={onOpenModal}
      className="group/card relative w-[190px] sm:w-[220px] md:w-[240px] aspect-[9/16] rounded-3xl overflow-hidden cursor-pointer bg-neutral-900 border border-neutral-200/70 hover:border-[#FF6B16] shadow-md hover:shadow-xl hover:shadow-[#FF6B16]/25 transition-all duration-300 hover:scale-[1.03] shrink-0 select-none"
    >
      {/* Background Auto-Playing Video */}
      <video
        ref={videoRef}
        src={reel.video}
        autoPlay
        loop
        muted={!isUnmuted}
        playsInline
        preload="metadata"
        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-105"
      />

      {/* Top-Left: Play Outline Icon */}
      <div className="absolute top-3.5 left-3.5 z-10 pointer-events-none drop-shadow-md">
        <Play className="w-5 h-5 text-white stroke-[2.2] fill-transparent" />
      </div>

      {/* Top-Right: Sound Toggle Icon */}
      <button
        onClick={(e) => onToggleAudio(e, cardKey)}
        className="absolute top-3.5 right-3.5 z-10 text-white hover:scale-110 transition-transform cursor-pointer drop-shadow-md"
        title={isUnmuted ? 'Mute' : 'Listen with sound'}
      >
        {isUnmuted ? (
          <Volume2 className="w-5 h-5" />
        ) : (
          <VolumeX className="w-5 h-5" />
        )}
      </button>

      {/* Bottom Overlay: Author & Trek Name Only */}
      <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 z-10 bg-gradient-to-t from-black/85 via-black/40 to-transparent text-white">
        <h3 className="text-base sm:text-lg font-bold text-white leading-tight drop-shadow-md">
          {reel.author}
        </h3>
        <p className="text-[11px] font-semibold text-neutral-300 uppercase tracking-wider mt-1 drop-shadow-sm">
          {reel.trek}
        </p>
      </div>
    </div>
  );
}

export function TripReelsRow() {
  const [isAutoRunning, setIsAutoRunning] = useState(true);
  const [activeReelIndex, setActiveReelIndex] = useState(null);
  const [unmutedCardId, setUnmutedCardId] = useState(null);
  const marqueeContainerRef = useRef(null);
  const modalVideoRef = useRef(null);
  const [modalIsPlaying, setModalIsPlaying] = useState(true);
  const [modalIsMuted, setModalIsMuted] = useState(false);

  // Toggle sound for an individual reel card in the marquee
  const toggleCardAudio = (e, cardKey) => {
    e.stopPropagation();
    if (unmutedCardId === cardKey) {
      setUnmutedCardId(null);
    } else {
      setUnmutedCardId(cardKey);
    }
  };

  // Open modal
  const openReelModal = (reel) => {
    const idx = TRIP_REELS.findIndex((r) => r.id === reel.id);
    setActiveReelIndex(idx >= 0 ? idx : 0);
    setModalIsPlaying(true);
    setModalIsMuted(false);
  };

  // Close modal
  const closeReelModal = () => {
    setActiveReelIndex(null);
  };

  const nextModalReel = (e) => {
    e.stopPropagation();
    setActiveReelIndex((prev) => (prev + 1) % TRIP_REELS.length);
    setModalIsPlaying(true);
  };

  const prevModalReel = (e) => {
    e.stopPropagation();
    setActiveReelIndex((prev) => (prev - 1 + TRIP_REELS.length) % TRIP_REELS.length);
    setModalIsPlaying(true);
  };

  // Modal play/pause toggle
  const toggleModalPlay = (e) => {
    e.stopPropagation();
    if (!modalVideoRef.current) return;
    if (modalVideoRef.current.paused) {
      modalVideoRef.current.play();
      setModalIsPlaying(true);
    } else {
      modalVideoRef.current.pause();
      setModalIsPlaying(false);
    }
  };

  // Keyboard navigation for modal
  useEffect(() => {
    if (activeReelIndex === null) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeReelModal();
      if (e.key === 'ArrowRight') setActiveReelIndex((prev) => (prev + 1) % TRIP_REELS.length);
      if (e.key === 'ArrowLeft') setActiveReelIndex((prev) => (prev - 1 + TRIP_REELS.length) % TRIP_REELS.length);
      if (e.key === ' ') {
        e.preventDefault();
        if (modalVideoRef.current) {
          if (modalVideoRef.current.paused) {
            modalVideoRef.current.play();
            setModalIsPlaying(true);
          } else {
            modalVideoRef.current.pause();
            setModalIsPlaying(false);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeReelIndex]);

  // Duplicate items for seamless infinite marquee loop
  const duplicatedReels = [...TRIP_REELS, ...TRIP_REELS];

  return (
    <div className="mb-10 w-full">
      {/* Header bar for the video reels strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-[#FF6B16] to-[#ff8f4d] text-white shadow-sm tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <Film className="w-3.5 h-3.5" />
            Live Trip Reels
          </span>
          <span className="hidden sm:inline-block text-xs font-medium text-neutral-500">
            Real video clips from our active expeditions
          </span>
        </div>

        {/* Auto-running status & controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAutoRunning(!isAutoRunning)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-neutral-200 hover:border-[#FF6B16] text-neutral-700 hover:text-[#FF6B16] transition-all shadow-xs cursor-pointer"
            title={isAutoRunning ? 'Pause auto-running' : 'Resume auto-running'}
          >
            {isAutoRunning ? (
              <>
                <Pause className="w-3 h-3 text-[#FF6B16]" />
                <span>Auto-Running</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-[#FF6B16] text-[#FF6B16]" />
                <span>Auto-Run Paused</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Auto-running Reels Row / Ticker Container */}
      <div
        className="relative overflow-hidden w-full py-2 group/ticker"
        ref={marqueeContainerRef}
      >
        {/* Infinite scrolling track */}
        <div
          className={`flex gap-3.5 sm:gap-4.5 py-2 pl-2 ${
            isAutoRunning ? 'animate-marquee-reels' : ''
          }`}
          style={{ width: 'max-content' }}
        >
          {duplicatedReels.map((reel, index) => {
            const cardKey = `${reel.id}-${index}`;
            const isUnmuted = unmutedCardId === cardKey;

            return (
              <ReelCard
                key={cardKey}
                reel={reel}
                cardKey={cardKey}
                isUnmuted={isUnmuted}
                onToggleAudio={toggleCardAudio}
                onOpenModal={() => openReelModal(reel)}
              />
            );
          })}
        </div>

        {/* Bottom hint banner */}
        <div className="flex items-center justify-center gap-2 mt-3 text-[11px] text-neutral-500 font-medium">
          <Info className="w-3.5 h-3.5 text-[#FF6B16]" />
          <span>Hover over any reel to pause auto-run • Click to open in full screen player</span>
        </div>
      </div>

      {/* Fullscreen Vertical Reel Lightbox Modal */}
      {activeReelIndex !== null && (
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
            {/* Video Element */}
            <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
              <video
                ref={modalVideoRef}
                src={TRIP_REELS[activeReelIndex].video}
                autoPlay
                loop
                muted={modalIsMuted}
                playsInline
                className="w-full h-full object-cover cursor-pointer"
                onClick={toggleModalPlay}
              />

              {/* Pause/Play Center Splash when clicked */}
              {!modalIsPlaying && (
                <div
                  onClick={toggleModalPlay}
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
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Bottom Reel Details */}
              <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black via-black/60 to-transparent z-20 text-white">
                <h3 className="text-lg font-bold text-white leading-tight drop-shadow-md">
                  {TRIP_REELS[activeReelIndex].author}
                </h3>
                <p className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mt-1 drop-shadow-sm">
                  {TRIP_REELS[activeReelIndex].trek}
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
