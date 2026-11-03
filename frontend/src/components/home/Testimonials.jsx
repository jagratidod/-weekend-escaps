import React, { useRef, useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle2,
  User,
  MapPin,
  Compass,
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TESTIMONIALS as INITIAL_TESTIMONIALS } from '../../data/testimonials';
import Container from '../common/Container';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const BACKEND_ROOT = API_BASE_URL.replace(/\/api$/, '');

const DEFAULT_AVATAR = '/images/testimonials/priya-sharma-card.png';

const BADGE_OPTIONS = [
  'Solo Hiker',
  'Couples Tour',
  'Family Group',
  'Road Tripper',
  'Weekend Explorer',
  'Adventure Enthusiast',
];

const RATING_LABELS = {
  1: '1/5 - Needs Improvement',
  2: '2/5 - Fair Experience',
  3: '3/5 - Good Trip',
  4: '4/5 - Very Good Adventure!',
  5: '5/5 - Exceptional & Unforgettable! ⭐',
};

// Helper for image URLs
const getFullImageUrl = (img) => {
  if (!img) return DEFAULT_AVATAR;
  if (img.startsWith('data:') || img.startsWith('http://') || img.startsWith('https://')) {
    return img;
  }
  if (img.startsWith('/uploads/')) {
    return `${BACKEND_ROOT}${img}`;
  }
  return img;
};

export function Testimonials() {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const fileInputRef = useRef(null);

  // Toggle review write form
  const [isWritingReview, setIsWritingReview] = useState(false);

  // Testimonials list state (starts with INITIAL_TESTIMONIALS + merges DB reviews)
  const [testimonialsList, setTestimonialsList] = useState(INITIAL_TESTIMONIALS);

  // Review Form state
  const [formData, setFormData] = useState({
    name: '',
    trip: '',
    location: '',
    badge: 'Adventure Enthusiast',
    rating: 5,
    quote: '',
  });

  // Image Upload state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  // Fetch submitted reviews from backend API on mount
  useEffect(() => {
    let isMounted = true;
    const fetchApiTestimonials = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/testimonials`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0 && isMounted) {
          const dbItems = data.data.map((item) => ({
            id: item._id,
            name: item.name,
            trip: item.trip,
            location: item.location || '',
            image: getFullImageUrl(item.image),
            rating: item.rating || 5,
            quote: item.quote,
            badge: item.badge || 'Verified Traveler',
          }));

          setTestimonialsList((prev) => {
            const existingIds = new Set(prev.map((t) => t.id));
            const freshItems = dbItems.filter((t) => !existingIds.has(t.id));
            return [...freshItems, ...prev];
          });
        }
      } catch (err) {
        console.debug('Could not load dynamic testimonials:', err.message);
      }
    };

    fetchApiTestimonials();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError('');
  };

  const handleRatingClick = (ratingVal) => {
    setFormData((prev) => ({ ...prev, rating: ratingVal }));
  };

  // Image file handler
  const processImageFile = (file) => {
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|jpg|png|webp|svg\+xml)$/)) {
      setFormError('Please upload a valid image (PNG, JPG, JPEG, or WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError('Image size should be less than 5MB.');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
    if (formError) setFormError('');
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim() || !formData.trip.trim() || !formData.quote.trim()) {
      setFormError('Please enter your name, trip/package name, and review text.');
      return;
    }

    setIsSubmitting(true);

    try {
      let finalImageUrl = imagePreview || DEFAULT_AVATAR;

      // If a file was selected, attempt to upload to backend server
      if (imageFile) {
        try {
          const uploadFormData = new FormData();
          uploadFormData.append('image', imageFile);

          const uploadRes = await fetch(`${API_BASE_URL}/testimonials/upload`, {
            method: 'POST',
            body: uploadFormData,
          });

          const uploadData = await uploadRes.json();
          if (uploadData.success && uploadData.imageUrl) {
            finalImageUrl = uploadData.imageUrl;
          }
        } catch (uploadErr) {
          console.warn('Image upload endpoint unavailable, falling back to data URL:', uploadErr.message);
          // finalImageUrl remains imagePreview (base64)
        }
      }

      const payload = {
        name: formData.name.trim(),
        trip: formData.trip.trim(),
        location: formData.location.trim() || 'India',
        image: finalImageUrl,
        rating: formData.rating,
        quote: formData.quote.trim(),
        badge: formData.badge,
      };

      let newId = `user-review-${Date.now()}`;

      try {
        const res = await fetch(`${API_BASE_URL}/testimonials`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const resData = await res.json();
        if (resData.success && resData.data?._id) {
          newId = resData.data._id;
        }
      } catch (networkErr) {
        console.warn('Backend API unavailable:', networkErr.message);
      }

      setSubmitSuccess(true);
      setIsSubmitting(false);

      // Auto close after 4.5 seconds or user can close manually
      setTimeout(() => {
        setIsWritingReview(false);
        setSubmitSuccess(false);
        // Reset form
        setFormData({
          name: '',
          trip: '',
          location: '',
          badge: 'Adventure Enthusiast',
          rating: 5,
          quote: '',
        });
        handleRemoveImage();
      }, 4500);
    } catch (err) {
      setIsSubmitting(false);
      setFormError('Failed to submit review. Please try again.');
    }
  };

  return (
    <section className="relative bg-[#111111] text-white pt-14 pb-20 md:pt-16 md:pb-24 overflow-x-clip z-20">
      {/* Top Brush Stroke Transition from light BookingProcess into dark Testimonials */}
      <div className="absolute top-0 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none -translate-y-[98%] z-30">
        <img
          src="/images/decorations/hero-brush-up.svg"
          alt=""
          className="w-full h-8 sm:h-12 md:h-14 object-cover"
        />
      </div>

      <Container className="relative z-10">
        <AnimatePresence mode="wait">
          {!isWritingReview ? (
            /* ================= VIEW 1: TESTIMONIALS SLIDER SECTION ================= */
            <motion.div
              key="testimonials-slider"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, transition: { duration: 0.28 } }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              {/* Header with Title, Underlined Review trigger, and Slider Navigation */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 sm:mb-12">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[#FF6B16] font-bold text-xs md:text-sm tracking-widest uppercase">
                      TRAVELER STORIES
                    </span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                    What Our Travelers Say
                  </h2>

                  <div className="mt-2.5 flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                    <p className="text-neutral-400 font-medium">
                      Real experiences from real adventurers.
                    </p>
                    <span className="text-neutral-600 hidden sm:inline">•</span>
                    {/* Underlined "Write your review" link as requested by user */}
                    <button
                      type="button"
                      onClick={() => setIsWritingReview(true)}
                      className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white hover:text-[#FF6B16] transition-colors cursor-pointer border-b-2 border-[#FF6B16] pb-0.5 tracking-wide"
                    >
                      <span>Write your review</span>
                      <span className="text-[#FF6B16] group-hover:translate-x-0.5 transition-transform duration-200">
                        ✍️
                      </span>
                    </button>
                  </div>
                </div>

                {/* Right controls: Desktop review trigger + Navigation Arrows */}
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setIsWritingReview(true)}
                    className="hidden lg:inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#FF6B16] hover:text-white transition-colors cursor-pointer border-b-2 border-[#FF6B16] hover:border-white pb-0.5"
                  >
                    <span>Share your story</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      ref={prevRef}
                      aria-label="Previous testimonial"
                      className="w-10 h-10 rounded-full bg-white hover:bg-[#FF6B16] text-[#111111] hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md disabled:opacity-40"
                    >
                      <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                    </button>
                    <button
                      ref={nextRef}
                      aria-label="Next testimonial"
                      className="w-10 h-10 rounded-full bg-white hover:bg-[#FF6B16] text-[#111111] hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md disabled:opacity-40"
                    >
                      <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Swiper Slider rendering 3 Horizontal Cards (matches screenshot) */}
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={20}
                slidesPerView={1}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                pagination={{ clickable: true, dynamicBullets: true }}
                navigation={{
                  prevEl: prevRef.current,
                  nextEl: nextRef.current,
                }}
                onBeforeInit={(swiper) => {
                  swiper.params.navigation.prevEl = prevRef.current;
                  swiper.params.navigation.nextEl = nextRef.current;
                }}
                breakpoints={{
                  640: {
                    slidesPerView: 2,
                    spaceBetween: 18,
                  },
                  1024: {
                    slidesPerView: 3,
                    spaceBetween: 20,
                  },
                }}
                className="pb-10"
              >
                {testimonialsList.map((item) => (
                  <SwiperSlide key={item.id} className="h-auto">
                    {/* Horizontal Testimonial Card matching screenshot */}
                    <div className="bg-white rounded-2xl p-4 sm:p-5 text-[#111111] shadow-xl flex flex-row items-center gap-4 h-full border border-neutral-100 transition-all duration-300 hover:-translate-y-1">
                      {/* Traveler Photo */}
                      <img
                        src={getFullImageUrl(item.image)}
                        alt={item.name}
                        className="w-20 sm:w-24 md:w-28 h-28 sm:h-32 md:h-36 rounded-xl sm:rounded-2xl object-cover shrink-0 shadow-sm"
                        onError={(e) => {
                          e.target.src = DEFAULT_AVATAR;
                        }}
                      />

                      {/* Review Content */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
                        {/* Quote */}
                        <p className="text-[11px] sm:text-xs text-neutral-700 font-medium leading-relaxed italic line-clamp-4">
                          "{item.quote}"
                        </p>

                        <div className="mt-3">
                          {/* 5 Stars */}
                          <div className="flex items-center gap-0.5 mb-1.5">
                            {[...Array(item.rating || 5)].map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-[#FF6B16] text-[#FF6B16]" />
                            ))}
                          </div>

                          {/* Name */}
                          <h4 className="text-xs sm:text-sm font-black text-[#111111] leading-tight truncate">
                            {item.name}
                          </h4>

                          {/* Destination / Trip */}
                          <p className="text-[10px] sm:text-[11px] font-semibold text-neutral-500 mt-0.5 truncate">
                            {item.trip}
                          </p>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </motion.div>
          ) : (
            /* ================= VIEW 2: WRITE TESTIMONIAL FORM SECTION ================= */
            <motion.div
              key="testimonials-form"
              initial={{ opacity: 0, y: 25, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.25 } }}
              transition={{ duration: 0.38, ease: 'easeOut' }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-[#181818] border border-neutral-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-[#FF6B16]/10 rounded-full blur-3xl pointer-events-none" />

                {/* Form Header with Back/Close button */}
                <div className="flex items-start justify-between gap-4 pb-6 border-b border-neutral-800/80 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[#FF6B16] font-bold text-xs tracking-widest uppercase">
                        SHARE YOUR JOURNEY
                      </span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-white">
                      Write Your Review
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                      Traveled with Weekend Escapes recently? Help fellow travelers with your real story!
                    </p>
                  </div>

                  {/* Back button with underline */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsWritingReview(false);
                      setSubmitSuccess(false);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-300 hover:text-[#FF6B16] transition-colors cursor-pointer border-b border-neutral-600 hover:border-[#FF6B16] pb-0.5 shrink-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back to Reviews</span>
                  </button>
                </div>

                {submitSuccess ? (
                  /* Success Confirmation Screen */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-12 px-4 text-center flex flex-col items-center justify-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-[#FF6B16]/20 border-2 border-[#FF6B16] text-[#FF6B16] flex items-center justify-center mb-4 shadow-lg shadow-[#FF6B16]/20">
                      <CheckCircle2 className="w-9 h-9" />
                    </div>
                    <h4 className="text-2xl font-black text-white mb-2">
                      Thank You, {formData.name || 'Adventurer'}!
                    </h4>
                    <p className="text-neutral-300 text-sm max-w-md mx-auto mb-3">
                      Your review has been submitted for verification and will appear live on our website once approved by our expedition team.
                    </p>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-6">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Pending Admin Approval</span>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsWritingReview(false);
                          setSubmitSuccess(false);
                        }}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FF6B16] hover:bg-[#ff5500] text-white font-bold text-sm transition-all duration-200 cursor-pointer shadow-lg shadow-[#FF6B16]/25"
                      >
                        <span>Back to Reviews</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  /* Review Input Form */
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {formError && (
                      <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs sm:text-sm font-medium">
                        {formError}
                      </div>
                    )}

                    {/* Interactive Star Rating */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                        How would you rate your experience? <span className="text-[#FF6B16]">*</span>
                      </label>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-[#202020] px-4 py-2 rounded-xl border border-neutral-700">
                          {[1, 2, 3, 4, 5].map((starVal) => {
                            const isFilled = starVal <= (hoverRating || formData.rating);
                            return (
                              <button
                                key={starVal}
                                type="button"
                                onClick={() => handleRatingClick(starVal)}
                                onMouseEnter={() => setHoverRating(starVal)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="p-1 cursor-pointer transition-transform hover:scale-120 focus:outline-none"
                              >
                                <Star
                                  className={`w-6 h-6 transition-colors ${
                                    isFilled
                                      ? 'fill-[#FF6B16] text-[#FF6B16]'
                                      : 'fill-transparent text-neutral-500'
                                  }`}
                                />
                              </button>
                            );
                          })}
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-[#FF6B16]">
                          {RATING_LABELS[hoverRating || formData.rating]}
                        </span>
                      </div>
                    </div>

                    {/* Two-column inputs: Name & Trip */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                          Your Full Name <span className="text-[#FF6B16]">*</span>
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Rahul Mehta"
                            className="w-full bg-[#202020] border border-neutral-700 focus:border-[#FF6B16] focus:ring-1 focus:ring-[#FF6B16] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 transition-colors outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                          Trip / Package Taken <span className="text-[#FF6B16]">*</span>
                        </label>
                        <div className="relative">
                          <Compass className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            name="trip"
                            value={formData.trip}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Kedarkantha Trek, Kashmir Tour"
                            className="w-full bg-[#202020] border border-neutral-700 focus:border-[#FF6B16] focus:ring-1 focus:ring-[#FF6B16] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 transition-colors outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Location & Traveler Category */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                          Your City / Location
                        </label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="e.g. Mumbai, Bangalore, Delhi NCR"
                            className="w-full bg-[#202020] border border-neutral-700 focus:border-[#FF6B16] focus:ring-1 focus:ring-[#FF6B16] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 transition-colors outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                          Traveler Tag / Category
                        </label>
                        <select
                          name="badge"
                          value={formData.badge}
                          onChange={handleChange}
                          className="w-full bg-[#202020] border border-neutral-700 focus:border-[#FF6B16] focus:ring-1 focus:ring-[#FF6B16] rounded-xl px-4 py-2.5 text-sm text-white transition-colors outline-none cursor-pointer"
                        >
                          {BADGE_OPTIONS.map((badge) => (
                            <option key={badge} value={badge} className="bg-[#1c1c1c] text-white">
                              {badge}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* ================= IMAGE UPLOAD SECTION (Replaces Avatar Select) ================= */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider">
                          Upload Traveler Photo
                        </label>
                        <span className="text-[11px] text-neutral-400">
                          Recommended ratio 3:4 (Portrait)
                        </span>
                      </div>

                      {/* Hidden File Input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />

                      {!imagePreview ? (
                        /* Dropzone / Upload Box */
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all duration-200 flex flex-col sm:flex-row items-center justify-center gap-4 bg-[#202020] hover:bg-[#242424] ${
                            isDragging
                              ? 'border-[#FF6B16] bg-[#FF6B16]/10 scale-[1.01]'
                              : 'border-neutral-700 hover:border-[#FF6B16]'
                          }`}
                        >
                          <div className="w-12 h-12 rounded-xl bg-[#2a2a2a] border border-neutral-700 text-[#FF6B16] flex items-center justify-center shrink-0 shadow-inner">
                            <UploadCloud className="w-6 h-6" />
                          </div>
                          <div className="text-center sm:text-left">
                            <p className="text-xs sm:text-sm font-bold text-white">
                              Click to upload photo{' '}
                              <span className="text-[#FF6B16] font-normal">or drag & drop</span>
                            </p>
                            <p className="text-[11px] text-neutral-400 mt-0.5">
                              PNG, JPG, or WebP up to 5MB
                            </p>
                          </div>
                        </div>
                      ) : (
                        /* Image Preview Card */
                        <div className="flex items-center gap-4 bg-[#202020] border border-neutral-700 rounded-2xl p-3.5">
                          {/* Image preview in exact card style */}
                          <div className="relative w-20 sm:w-24 h-24 sm:h-28 rounded-xl overflow-hidden shrink-0 border-2 border-[#FF6B16] bg-neutral-900 shadow-md">
                            <img
                              src={imagePreview}
                              alt="Uploaded traveler preview"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-1 right-1 bg-[#FF6B16] rounded-full p-0.5 shadow">
                              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Photo attached successfully</span>
                            </div>
                            <p className="text-xs sm:text-sm text-white font-medium truncate">
                              {imageFile?.name || 'Custom Traveler Photo'}
                            </p>
                            <p className="text-[11px] text-neutral-400 mt-0.5">
                              {imageFile ? `${(imageFile.size / 1024).toFixed(1)} KB` : 'Image ready'}
                            </p>

                            {/* Change / Remove photo actions */}
                            <div className="flex items-center gap-3 mt-2.5">
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF6B16] hover:text-white transition-colors cursor-pointer border-b border-[#FF6B16] hover:border-white pb-0.5"
                              >
                                <RefreshCw className="w-3 h-3" />
                                <span>Change Photo</span>
                              </button>
                              <span className="text-neutral-600">•</span>
                              <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Review Text */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                        Your Story & Feedback <span className="text-[#FF6B16]">*</span>
                      </label>
                      <div className="relative">
                        <textarea
                          name="quote"
                          value={formData.quote}
                          onChange={handleChange}
                          required
                          rows={4}
                          placeholder="How was your trip? Tell us about the trek guide, logistics, stays, views, and what made the experience memorable..."
                          className="w-full bg-[#202020] border border-neutral-700 focus:border-[#FF6B16] focus:ring-1 focus:ring-[#FF6B16] rounded-xl p-3.5 text-sm text-white placeholder-neutral-500 transition-colors outline-none resize-none"
                        />
                      </div>
                      <div className="text-right text-[11px] text-neutral-500 mt-1">
                        {formData.quote.length} / 1000 characters
                      </div>
                    </div>

                    {/* Form Action Buttons */}
                    <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setIsWritingReview(false)}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-neutral-700 hover:border-neutral-500 text-neutral-300 hover:text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-7 py-2.5 rounded-xl bg-[#FF6B16] hover:bg-[#ff5500] disabled:bg-neutral-700 text-white font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer shadow-lg shadow-[#FF6B16]/25 flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Submit Review</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>

      {/* Bottom Brush Transition into next section */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none translate-y-1">
        <img
          src="/images/decorations/brush-stroke-bottom.svg"
          alt=""
          className="w-full h-8 sm:h-12 md:h-14 object-cover"
        />
      </div>
    </section>
  );
}

export default Testimonials;
