import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Maximize2, X, ChevronLeft, ChevronRight, MapPin, Camera } from 'lucide-react';
import { GALLERY_ITEMS } from '../../data/gallery';
import SectionHeading from '../common/SectionHeading';
import Container from '../common/Container';
import TripReelsRow from './TripReelsRow';

export function Gallery() {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);

  const openLightbox = (index) => setSelectedPhotoIndex(index);
  const closeLightbox = () => setSelectedPhotoIndex(null);

  const nextPhoto = (e) => {
    e.stopPropagation();
    setSelectedPhotoIndex((prev) => (prev + 1) % GALLERY_ITEMS.length);
  };

  const prevPhoto = (e) => {
    e.stopPropagation();
    setSelectedPhotoIndex((prev) => (prev - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length);
  };

  return (
    <section className="pt-12 md:pt-16 pb-6 md:pb-8 bg-[#F7F7F5] overflow-hidden w-full">
      {/* 1. Full Screen Width "What Our Travellers Say" 3D Video Reels */}
      <div className="w-full overflow-hidden">
        <TripReelsRow />
      </div>

      {/* 2. Photo Snapshots Gallery */}
      <Container>
        <div className="pt-8 mt-6 border-t border-neutral-200/80">
          <SectionHeading
            size="compact"
            eyebrow="Memories For A Lifetime"
            title="Moments From Our Trips"
            subtitle="Real people. Real adventures. Real memories."
            action={
              <Link
                to="/about#gallery"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[#FF6B16]/70 hover:border-[#FF6B16] hover:bg-[#FF6B16] text-xs sm:text-sm font-bold text-neutral-800 hover:text-white transition-all bg-white shadow-xs group"
              >
                <span>View Gallery</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            }
          />

          {/* Photo Snapshots Header Subtitle */}
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#FF6B16]" />
              <span className="text-xs sm:text-sm font-bold text-neutral-800 uppercase tracking-wider">
                Captured Snapshots
              </span>
            </div>
            <span className="text-xs text-neutral-500 font-medium">Click any photo to enlarge</span>
          </div>

          {/* Gallery Grid (6 Images matching screenshot) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
            {GALLERY_ITEMS.map((item, index) => (
              <div
                key={item.id}
                onClick={() => openLightbox(index)}
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 bg-neutral-900"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3.5 text-white">
                  <div className="self-end w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B16] block">
                      {item.category}
                    </span>
                    <p className="text-xs font-bold leading-tight truncate">
                      {item.title}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* Lightbox Modal */}
      {selectedPhotoIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-[#FF6B16] text-white flex items-center justify-center transition-all cursor-pointer z-50"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Prev / Next controls */}
          <button
            onClick={prevPhoto}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-[#FF6B16] text-white flex items-center justify-center transition-all cursor-pointer z-50"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextPhoto}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-[#FF6B16] text-white flex items-center justify-center transition-all cursor-pointer z-50"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Current Image & Details */}
          <div
            className="max-w-4xl max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={GALLERY_ITEMS[selectedPhotoIndex].image}
              alt={GALLERY_ITEMS[selectedPhotoIndex].title}
              className="max-h-[70vh] w-auto rounded-2xl object-contain shadow-2xl border border-white/10"
            />
            <div className="mt-4 text-center text-white">
              <span className="text-xs uppercase tracking-widest text-[#FF6B16] font-bold">
                {GALLERY_ITEMS[selectedPhotoIndex].category}
              </span>
              <h3 className="text-xl font-bold mt-1">
                {GALLERY_ITEMS[selectedPhotoIndex].title}
              </h3>
              <p className="text-xs text-neutral-400 flex items-center justify-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-[#FF6B16]" />
                {GALLERY_ITEMS[selectedPhotoIndex].location}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Gallery;
