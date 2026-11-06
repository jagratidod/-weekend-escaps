import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Save,
  RotateCcw,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  Sliders,
  Award,
  ShieldCheck,
  Heart,
  Flame,
  Compass,
  Users,
  MapPin,
  HelpCircle,
  FileText,
  MoveUp,
  MoveDown,
  Image as ImageIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DEFAULT_ABOUT_DATA } from '../../utils/defaultAboutData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const AVAILABLE_ICONS = [
  { name: 'ShieldCheck', icon: ShieldCheck, label: 'Shield / Safety' },
  { name: 'Heart', icon: Heart, label: 'Heart / Care' },
  { name: 'Flame', icon: Flame, label: 'Flame / Passion' },
  { name: 'Compass', icon: Compass, label: 'Compass / Explore' },
  { name: 'Award', icon: Award, label: 'Award / Quality' },
  { name: 'Users', icon: Users, label: 'Users / Community' },
  { name: 'MapPin', icon: MapPin, label: 'MapPin / Location' },
  { name: 'Sparkles', icon: Sparkles, label: 'Sparkles / Magic' },
];

export default function AboutManager() {
  const { token } = useAuth();

  const [activeTab, setActiveTab] = useState('hero');
  const [aboutData, setAboutData] = useState(DEFAULT_ABOUT_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingTarget, setUploadingTarget] = useState(null);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Slide modal state
  const [editingSlide, setEditingSlide] = useState(null);
  const [isNewSlide, setIsNewSlide] = useState(false);

  // Core value modal state
  const [editingValue, setEditingValue] = useState(null);
  const [isNewValue, setIsNewValue] = useState(false);

  // Reset confirmation modal
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // File upload callback
  const fileInputRef = useRef(null);
  const [uploadCallback, setUploadCallback] = useState(null);

  const showToast = (type, text) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage({ type: '', text: '' });
    }, 4500);
  };

  // Fetch about data from backend
  const fetchAboutData = async () => {
    try {
      setLoading(true);
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
      console.error('[About Fetch Error]:', err);
      showToast('error', 'Failed to load About page data. Using defaults.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAboutData();
  }, []);

  // Upload image to Cloudinary via POST /api/upload
  const handleUploadImage = async (file, onUploadedUrl) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showToast('error', 'Image file exceeds 10MB limit.');
      return;
    }

    try {
      setUploadingTarget('uploading');
      const fd = new FormData();
      fd.append('image', file);
      fd.append('folder', 'weekend_escapes/about');

      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: fd,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Image upload failed');
      }

      onUploadedUrl(data.url);
      showToast('success', 'Image uploaded to Cloudinary successfully!');
    } catch (err) {
      console.error('[Upload Error]:', err);
      showToast('error', err.message || 'Failed to upload image.');
    } finally {
      setUploadingTarget(null);
    }
  };

  const triggerUpload = (callback) => {
    setUploadCallback(() => callback);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file && uploadCallback) {
      handleUploadImage(file, uploadCallback);
    }
  };

  // Save changes to API
  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch(`${API_BASE_URL}/about`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(aboutData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save About page');
      }

      showToast('success', 'About Us page saved successfully!');
    } catch (err) {
      console.error('[Save Error]:', err);
      showToast('error', err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  // Reset to original defaults
  const handleResetDefaults = async () => {
    try {
      setSaving(true);
      const res = await fetch(`${API_BASE_URL}/about/reset`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to reset About page');
      }

      setAboutData(DEFAULT_ABOUT_DATA);
      setShowResetConfirm(false);
      showToast('success', 'About Us page reset to default content!');
    } catch (err) {
      console.error('[Reset Error]:', err);
      showToast('error', err.message || 'Failed to reset settings');
    } finally {
      setSaving(false);
    }
  };

  // ── Slide Handlers ──
  const handleMoveSlide = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= aboutData.hero.slides.length) return;
    const slides = [...aboutData.hero.slides];
    const [moved] = slides.splice(index, 1);
    slides.splice(targetIdx, 0, moved);
    setAboutData({
      ...aboutData,
      hero: { ...aboutData.hero, slides },
    });
  };

  const handleDeleteSlide = (index) => {
    if (aboutData.hero.slides.length <= 1) {
      showToast('error', 'Must have at least one hero slide.');
      return;
    }
    const slides = aboutData.hero.slides.filter((_, i) => i !== index);
    setAboutData({
      ...aboutData,
      hero: { ...aboutData.hero, slides },
    });
    showToast('success', 'Slide removed.');
  };

  const handleSaveSlideModal = () => {
    if (!editingSlide.title || !editingSlide.image) {
      showToast('error', 'Please provide a title and an image.');
      return;
    }

    let nextSlides;
    if (isNewSlide) {
      nextSlides = [
        ...aboutData.hero.slides,
        {
          ...editingSlide,
          id: 'slide_' + Math.random().toString(36).substring(2, 9),
        },
      ];
    } else {
      nextSlides = aboutData.hero.slides.map((s) =>
        s.id === editingSlide.id ? editingSlide : s
      );
    }

    setAboutData({
      ...aboutData,
      hero: { ...aboutData.hero, slides: nextSlides },
    });
    setEditingSlide(null);
    showToast('success', isNewSlide ? 'New slide added!' : 'Slide updated!');
  };

  // ── Stats Handlers ──
  const handleStatChange = (id, field, value) => {
    setAboutData({
      ...aboutData,
      stats: aboutData.stats.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    });
  };

  const handleAddStat = () => {
    const newStat = {
      id: 'stat_' + Math.random().toString(36).substring(2, 9),
      value: '100+',
      label: 'New Statistic',
    };
    setAboutData({
      ...aboutData,
      stats: [...aboutData.stats, newStat],
    });
  };

  const handleDeleteStat = (id) => {
    if (aboutData.stats.length <= 1) {
      showToast('error', 'Must have at least one stat.');
      return;
    }
    setAboutData({
      ...aboutData,
      stats: aboutData.stats.filter((s) => s.id !== id),
    });
  };

  // ── Core Values Handlers ──
  const handleDeleteValue = (id) => {
    if (aboutData.coreValues.length <= 1) {
      showToast('error', 'Must have at least one core value.');
      return;
    }
    setAboutData({
      ...aboutData,
      coreValues: aboutData.coreValues.filter((v) => v.id !== id),
    });
    showToast('success', 'Core value card removed.');
  };

  const handleSaveValueModal = () => {
    if (!editingValue.title || !editingValue.description) {
      showToast('error', 'Please provide title and description.');
      return;
    }

    let nextValues;
    if (isNewValue) {
      nextValues = [
        ...aboutData.coreValues,
        {
          ...editingValue,
          id: 'val_' + Math.random().toString(36).substring(2, 9),
        },
      ];
    } else {
      nextValues = aboutData.coreValues.map((v) =>
        v.id === editingValue.id ? editingValue : v
      );
    }

    setAboutData({
      ...aboutData,
      coreValues: nextValues,
    });
    setEditingValue(null);
    showToast('success', isNewValue ? 'New value card added!' : 'Value card updated!');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-16 text-center border border-neutral-200/80 shadow-xs flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-[#FF6B16] mb-4" />
        <h3 className="text-base font-bold text-[#1A384C]">Loading About Page Editor...</h3>
        <p className="text-xs text-neutral-500 mt-1">Fetching dynamic content and media...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none pb-12">
      {/* Hidden file input for uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* ── Status Toast ── */}
      {statusMessage.text && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold transition-all border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200 shadow-emerald-900/10'
              : 'bg-rose-50 text-rose-900 border-rose-200 shadow-rose-900/10'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span>{statusMessage.text}</span>
          <button
            onClick={() => setStatusMessage({ type: '', text: '' })}
            className="text-neutral-400 hover:text-neutral-700 ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Header Bar ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6B16]/10 text-[#FF6B16] text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dynamic Page Manager</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1A384C] tracking-tight">
            About Us Page Editor
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-0.5">
            Customize hero slider, mission, counters, story narrative, and core value cards in real time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* View Live */}
          <a
            href="/about"
            target="_blank"
            rel="noreferrer"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 hover:border-[#1A384C] text-xs font-bold text-neutral-700 hover:text-[#1A384C] transition-all bg-white shadow-xs"
          >
            <Eye className="w-3.5 h-3.5 text-[#1A384C]" />
            <span>View Live</span>
          </a>

          {/* Reset Defaults */}
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 hover:border-rose-400 text-xs font-bold text-rose-700 hover:bg-rose-50 transition-all bg-white shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
            <span>Reset</span>
          </button>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6B16] hover:bg-[#e05809] text-white text-xs font-bold shadow-md shadow-[#FF6B16]/30 hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* ── Section Navigation Tabs ── */}
      <div className="flex items-center gap-2 border-b border-neutral-200/80 pb-2 overflow-x-auto">
        {[
          { id: 'hero', label: '1. Hero Slider' },
          { id: 'mission', label: '2. Mission & Stats' },
          { id: 'story', label: '3. How We Started' },
          { id: 'values', label: '4. Core Values' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#1A384C] text-white shadow-md'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 1. HERO SLIDER TAB */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'hero' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-[#1A384C]">
                Interactive Carousel Slides ({aboutData.hero.slides.length})
              </h3>
              <p className="text-xs text-neutral-500 font-medium mt-0.5">
                Full-screen animated slides shown at the top of the About Us page.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 px-3 py-1.5 rounded-xl text-xs">
                <span className="text-neutral-500 font-medium">Interval:</span>
                <input
                  type="number"
                  min="2000"
                  max="10000"
                  step="500"
                  value={aboutData.hero.autoInterval || 4500}
                  onChange={(e) =>
                    setAboutData({
                      ...aboutData,
                      hero: {
                        ...aboutData.hero,
                        autoInterval: parseInt(e.target.value, 10) || 4500,
                      },
                    })
                  }
                  className="w-16 px-1.5 py-0.5 bg-white border border-neutral-300 rounded font-bold text-center text-xs"
                />
                <span className="text-neutral-400">ms</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingSlide({
                    image: '',
                    subtitle: 'Scenic Escape',
                    title: 'NEW DESTINATION',
                    description: 'Brief description of this destination.',
                  });
                  setIsNewSlide(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1A384C] hover:bg-[#254d68] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Slide</span>
              </button>
            </div>
          </div>

          {/* Slides Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {aboutData.hero.slides.map((slide, idx) => (
              <div
                key={slide.id || idx}
                className="bg-white rounded-3xl border border-neutral-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Image Preview */}
                <div className="relative aspect-[16/10] bg-neutral-900 overflow-hidden group">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider border border-white/20">
                      Slide {idx + 1}
                    </span>
                  </div>

                  {/* Quick Change Image */}
                  <button
                    type="button"
                    onClick={() =>
                      triggerUpload((url) => {
                        const nextSlides = aboutData.hero.slides.map((s, i) =>
                          i === idx ? { ...s, image: url } : s
                        );
                        setAboutData({
                          ...aboutData,
                          hero: { ...aboutData.hero, slides: nextSlides },
                        });
                      })
                    }
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 hover:bg-[#FF6B16] text-white transition-colors cursor-pointer"
                    title="Upload new image"
                  >
                    <Upload className="w-3.5 h-3.5" />
                  </button>

                  {/* Title Preview overlay */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <p className="text-[10px] font-black uppercase text-amber-300 tracking-wider">
                      {slide.subtitle}
                    </p>
                    <h4 className="text-base font-black truncate">{slide.title}</h4>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-neutral-600 line-clamp-2 mb-4">
                    {slide.description}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveSlide(idx, -1)}
                        disabled={idx === 0}
                        className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-500 disabled:opacity-30 cursor-pointer"
                        title="Move Left"
                      >
                        <MoveUp className="w-3.5 h-3.5 -rotate-90" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveSlide(idx, 1)}
                        disabled={idx === aboutData.hero.slides.length - 1}
                        className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-500 disabled:opacity-30 cursor-pointer"
                        title="Move Right"
                      >
                        <MoveDown className="w-3.5 h-3.5 -rotate-90" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSlide({ ...slide });
                          setIsNewSlide(false);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition-all cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3 text-[#1A384C]" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteSlide(idx)}
                        className="p-1.5 rounded-xl hover:bg-rose-50 text-neutral-400 hover:text-rose-600 transition-all cursor-pointer"
                        title="Delete Slide"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 2. MISSION & STATS TAB */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'mission' && (
        <div className="space-y-6">
          {/* Mission Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-[#1A384C]">
                Mission & Purpose Header
              </h3>
              <p className="text-xs text-neutral-500 font-medium mt-0.5">
                The primary intro heading and paragraph positioned below the hero.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Eyebrow Badge
                </label>
                <input
                  type="text"
                  value={aboutData.mission.eyebrow}
                  onChange={(e) =>
                    setAboutData({
                      ...aboutData,
                      mission: { ...aboutData.mission, eyebrow: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Main Title
                </label>
                <input
                  type="text"
                  value={aboutData.mission.title}
                  onChange={(e) =>
                    setAboutData({
                      ...aboutData,
                      mission: { ...aboutData.mission, title: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Mission Description Statement
              </label>
              <textarea
                rows={3}
                value={aboutData.mission.description}
                onChange={(e) =>
                  setAboutData({
                    ...aboutData,
                    mission: { ...aboutData.mission, description: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
              />
            </div>
          </div>

          {/* Stats Counter Strip */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-[#1A384C]">
                  Key Statistics Counters ({aboutData.stats.length})
                </h3>
                <p className="text-xs text-neutral-500 font-medium mt-0.5">
                  Highlighted metrics showing your experience, summits, and trust factor.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddStat}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Metric</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {aboutData.stats.map((stat, idx) => (
                <div
                  key={stat.id || idx}
                  className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/60 flex flex-col justify-between space-y-3 relative group"
                >
                  <button
                    type="button"
                    onClick={() => handleDeleteStat(stat.id)}
                    className="absolute top-2 right-2 p-1 text-neutral-400 hover:text-rose-500 transition-colors cursor-pointer"
                    title="Delete Metric"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                      Counter Value
                    </label>
                    <input
                      type="text"
                      value={stat.value}
                      onChange={(e) => handleStatChange(stat.id, 'value', e.target.value)}
                      className="w-full px-3 py-1.5 text-base font-black text-[#FF6B16] bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-[#FF6B16]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                      Metric Label
                    </label>
                    <input
                      type="text"
                      value={stat.label}
                      onChange={(e) => handleStatChange(stat.id, 'label', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-bold text-neutral-700 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-[#FF6B16]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 3. OUR STORY TAB */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'story' && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-[#1A384C]">
              How We Started (Story Narrative)
            </h3>
            <p className="text-xs text-neutral-500 font-medium mt-0.5">
              The two-column section with founding story on left and featured image on right.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Narrative Controls */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Section Eyebrow
                </label>
                <input
                  type="text"
                  value={aboutData.story.eyebrow}
                  onChange={(e) =>
                    setAboutData({
                      ...aboutData,
                      story: { ...aboutData.story, eyebrow: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Story Heading
                </label>
                <input
                  type="text"
                  value={aboutData.story.title}
                  onChange={(e) =>
                    setAboutData({
                      ...aboutData,
                      story: { ...aboutData.story, title: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Paragraph 1 (Origin Story)
                </label>
                <textarea
                  rows={4}
                  value={aboutData.story.paragraph1}
                  onChange={(e) =>
                    setAboutData({
                      ...aboutData,
                      story: { ...aboutData.story, paragraph1: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Paragraph 2 (Current Operations & Philosophy)
                </label>
                <textarea
                  rows={4}
                  value={aboutData.story.paragraph2}
                  onChange={(e) =>
                    setAboutData({
                      ...aboutData,
                      story: { ...aboutData.story, paragraph2: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
                />
              </div>
            </div>

            {/* Right Image Controls */}
            <div className="lg:col-span-5 space-y-4">
              <label className="block text-xs font-bold text-neutral-700">
                Featured Story Image
              </label>

              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-200 shadow-md group">
                <img
                  src={aboutData.story.image}
                  alt={aboutData.story.imageAlt || 'Story image'}
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      triggerUpload((url) => {
                        setAboutData({
                          ...aboutData,
                          story: { ...aboutData.story, image: url },
                        });
                      })
                    }
                    className="px-4 py-2 rounded-xl bg-[#FF6B16] text-white text-xs font-bold shadow-lg flex items-center gap-1.5 cursor-pointer hover:bg-[#e05809]"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload New Image</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1">
                  Image URL (or upload above)
                </label>
                <input
                  type="text"
                  value={aboutData.story.image}
                  onChange={(e) =>
                    setAboutData({
                      ...aboutData,
                      story: { ...aboutData.story, image: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl font-mono text-neutral-700 focus:outline-none focus:border-[#FF6B16]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1">
                  Image Alt Text
                </label>
                <input
                  type="text"
                  value={aboutData.story.imageAlt || ''}
                  onChange={(e) =>
                    setAboutData({
                      ...aboutData,
                      story: { ...aboutData.story, imageAlt: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 4. CORE VALUES TAB */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'values' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-[#1A384C]">
                Core Value Cards ({aboutData.coreValues.length})
              </h3>
              <p className="text-xs text-neutral-500 font-medium mt-0.5">
                The three key pillars (Safety, Sustainability, Unmatched Value) displayed at bottom.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingValue({
                  icon: 'ShieldCheck',
                  title: 'New Value',
                  description: 'Description of our standard and commitment to excellence.',
                });
                setIsNewValue(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1A384C] hover:bg-[#254d68] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Value Card</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {aboutData.coreValues.map((val, idx) => {
              const matched = AVAILABLE_ICONS.find((i) => i.name === val.icon);
              const ValueIcon = matched ? matched.icon : ShieldCheck;

              return (
                <div
                  key={val.id || idx}
                  className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#FF6B16]/10 text-[#FF6B16] flex items-center justify-center">
                        <ValueIcon className="w-6 h-6" />
                      </div>

                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        Pillar {idx + 1}
                      </span>
                    </div>

                    <h4 className="text-base font-black text-[#111111] mb-2">{val.title}</h4>
                    <p className="text-xs text-neutral-600 leading-relaxed">{val.description}</p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-4 mt-6 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingValue({ ...val });
                        setIsNewValue(false);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition-all cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3 text-[#1A384C]" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteValue(val.id)}
                      className="p-1.5 rounded-xl hover:bg-rose-50 text-neutral-400 hover:text-rose-600 transition-all cursor-pointer"
                      title="Delete Value Card"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: EDIT HERO SLIDE */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {editingSlide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-neutral-200 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-black text-[#1A384C]">
                {isNewSlide ? 'Add Hero Carousel Slide' : 'Edit Hero Carousel Slide'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingSlide(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image Preview & Upload */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Slide Image
              </label>
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-neutral-900 mb-2 border border-neutral-200">
                {editingSlide.image ? (
                  <img
                    src={editingSlide.image}
                    alt={editingSlide.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400">
                    <ImageIcon className="w-8 h-8 mb-2" />
                    <span className="text-xs">No image selected</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    triggerUpload((url) => {
                      setEditingSlide({ ...editingSlide, image: url });
                    })
                  }
                  className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Image</span>
                </button>
                <input
                  type="text"
                  placeholder="Or enter image URL..."
                  value={editingSlide.image}
                  onChange={(e) =>
                    setEditingSlide({ ...editingSlide, image: e.target.value })
                  }
                  className="flex-1 px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl font-mono text-neutral-700 focus:outline-none focus:border-[#FF6B16]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Subtitle / Category
              </label>
              <input
                type="text"
                placeholder="e.g. Tropical Paradise"
                value={editingSlide.subtitle}
                onChange={(e) =>
                  setEditingSlide({ ...editingSlide, subtitle: e.target.value })
                }
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Main Slide Title
              </label>
              <input
                type="text"
                placeholder="e.g. BALI"
                value={editingSlide.title}
                onChange={(e) =>
                  setEditingSlide({ ...editingSlide, title: e.target.value })
                }
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Slide Description
              </label>
              <textarea
                rows={3}
                placeholder="Brief narrative for this slide..."
                value={editingSlide.description}
                onChange={(e) =>
                  setEditingSlide({ ...editingSlide, description: e.target.value })
                }
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setEditingSlide(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSlideModal}
                className="px-5 py-2 rounded-xl bg-[#FF6B16] hover:bg-[#e05809] text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Save Slide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: EDIT CORE VALUE */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {editingValue && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-neutral-200 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-black text-[#1A384C]">
                {isNewValue ? 'Add Core Value' : 'Edit Core Value'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingValue(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Icon Picker */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-2">
                Select Icon
              </label>
              <div className="grid grid-cols-4 gap-2">
                {AVAILABLE_ICONS.map((item) => {
                  const Icon = item.icon;
                  const isSelected = editingValue.icon === item.name;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setEditingValue({ ...editingValue, icon: item.name })}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#FF6B16] bg-[#FF6B16]/10 text-[#FF6B16] font-bold shadow-xs'
                          : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-[9px] truncate max-w-[65px]">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Value Title
              </label>
              <input
                type="text"
                placeholder="e.g. Safety Above All"
                value={editingValue.title}
                onChange={(e) =>
                  setEditingValue({ ...editingValue, title: e.target.value })
                }
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Value Description
              </label>
              <textarea
                rows={3}
                placeholder="Describe your commitment..."
                value={editingValue.description}
                onChange={(e) =>
                  setEditingValue({ ...editingValue, description: e.target.value })
                }
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setEditingValue(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveValueModal}
                className="px-5 py-2 rounded-xl bg-[#FF6B16] hover:bg-[#e05809] text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Save Value Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: RESET CONFIRMATION */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-neutral-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-black text-neutral-900">Reset About Us Page?</h3>
              <p className="text-xs text-neutral-500 mt-1">
                This will restore all hero slides, narrative story, counters, and values to the original default state.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/30 cursor-pointer"
              >
                Yes, Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
