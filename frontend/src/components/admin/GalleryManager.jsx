import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Image as ImageIcon,
  Upload,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Mountain,
  Compass,
  Bed,
  Users,
  Maximize,
  MapPin,
  Calendar,
  Layers,
  ChevronDown,
  X,
  Eye,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DEFAULT_GALLERY_DATA } from '../../utils/defaultGalleryData';
import { getImageUrl } from '../../utils/imageHelper';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const AVAILABLE_DETAIL_ICONS = ['Users', 'Maximize', 'Bed', 'Mountain', 'Compass', 'MapPin', 'Calendar'];

export default function GalleryManager() {
  const { token } = useAuth();

  const [activeTab, setActiveTab] = useState('masonry');
  const [galleryData, setGalleryData] = useState(DEFAULT_GALLERY_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingTarget, setUploadingTarget] = useState(null);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Masonry item edit modal state
  const [editingMasonryItem, setEditingMasonryItem] = useState(null);
  const [isNewMasonryItem, setIsNewMasonryItem] = useState(false);

  // Accommodation edit modal state
  const [editingAccommodation, setEditingAccommodation] = useState(null);
  const [isNewAccommodation, setIsNewAccommodation] = useState(false);

  // Filmstrip panel edit modal state
  const [editingPanel, setEditingPanel] = useState(null);
  const [isNewPanel, setIsNewPanel] = useState(false);

  // Category raw text inputs
  const [masonryCategoriesInput, setMasonryCategoriesInput] = useState(
    DEFAULT_GALLERY_DATA.masonry.categories?.join(', ') || ''
  );
  const [filmstripCategoriesInput, setFilmstripCategoriesInput] = useState(
    DEFAULT_GALLERY_DATA.filmstrip.categories?.join(', ') || ''
  );
  const [adminPanelCatFilter, setAdminPanelCatFilter] = useState('ALL');

  // Hidden file inputs
  const fileInputRef = useRef(null);
  const [uploadCallback, setUploadCallback] = useState(null);

  const showToast = (type, text) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage({ type: '', text: '' });
    }, 4500);
  };

  // Fetch current gallery data from API
  const fetchGalleryData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/gallery`);
      const data = await res.json();
      if (data.success && data.data) {
        const nextData = {
          hero: { ...DEFAULT_GALLERY_DATA.hero, ...(data.data.hero || {}) },
          philosophy: { ...DEFAULT_GALLERY_DATA.philosophy, ...(data.data.philosophy || {}) },
          filmstrip: {
            categories: data.data.filmstrip?.categories || DEFAULT_GALLERY_DATA.filmstrip.categories,
            panels: data.data.filmstrip?.panels || DEFAULT_GALLERY_DATA.filmstrip.panels,
          },
          accommodations: data.data.accommodations || DEFAULT_GALLERY_DATA.accommodations,
          masonry: {
            eyebrow: data.data.masonry?.eyebrow || DEFAULT_GALLERY_DATA.masonry.eyebrow,
            title: data.data.masonry?.title || DEFAULT_GALLERY_DATA.masonry.title,
            subtitle: data.data.masonry?.subtitle || DEFAULT_GALLERY_DATA.masonry.subtitle,
            categories: data.data.masonry?.categories || DEFAULT_GALLERY_DATA.masonry.categories,
            items: data.data.masonry?.items || DEFAULT_GALLERY_DATA.masonry.items,
          },
        };
        setGalleryData(nextData);
        setMasonryCategoriesInput(nextData.masonry.categories?.join(', ') || '');
        setFilmstripCategoriesInput(nextData.filmstrip.categories?.join(', ') || '');
      }
    } catch (err) {
      console.error('Failed to load gallery settings:', err);
      showToast('error', 'Could not load gallery settings from server. Showing local defaults.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryData();
  }, []);

  // Upload image to Cloudinary via backend POST /api/upload
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
      fd.append('folder', 'weekend_escapes/gallery');

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
      showToast('error', err.message || 'Failed to upload image to Cloudinary');
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

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && uploadCallback) {
      handleUploadImage(file, uploadCallback);
    }
  };

  // Save changes to backend
  const handleSave = async (sectionKey) => {
    try {
      setSaving(true);
      setStatusMessage({ type: '', text: '' });

      const payload = sectionKey ? { [sectionKey]: galleryData[sectionKey] } : galleryData;

      const res = await fetch(`${API_BASE_URL}/gallery`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save changes');
      }

      showToast('success', 'Gallery page updated successfully! Live on site.');
    } catch (err) {
      console.error('[Save Error]:', err);
      showToast('error', err.message || 'Failed to save gallery changes');
    } finally {
      setSaving(false);
    }
  };

  // Reset to original defaults
  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset all Gallery content back to default?')) {
      return;
    }
    try {
      setSaving(true);
      const res = await fetch(`${API_BASE_URL}/gallery/reset`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setGalleryData(data.data);
        setMasonryCategoriesInput(data.data.masonry?.categories?.join(', ') || '');
        setFilmstripCategoriesInput(data.data.filmstrip?.categories?.join(', ') || '');
        showToast('success', 'Gallery restored to initial defaults!');
      }
    } catch (err) {
      console.error('Reset error:', err);
      showToast('error', 'Failed to reset gallery');
    } finally {
      setSaving(false);
    }
  };

  // Helper to format image
  const displayImg = (url) => {
    if (!url) return '';
    return getImageUrl(url);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-9 h-9 animate-spin text-[#FF6B16] mb-3" />
        <p className="text-sm font-bold text-neutral-600">Loading Gallery Manager...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hidden file input for Cloudinary upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Header bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FF6B16]/10 text-[#FF6B16] flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#111111] tracking-tight">
                Gallery Page Editor
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 font-medium">
                Manage all images, text, accommodations, and photo archives on{' '}
                <code className="text-[#FF6B16] font-bold">/gallery</code> with Cloudinary.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <a
            href="/gallery"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-neutral-100 hover:bg-neutral-200/80 text-[#111111] text-xs font-bold transition-all border border-neutral-300"
          >
            <span>Live Preview</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-neutral-100 hover:bg-red-50 text-neutral-600 hover:text-red-600 text-xs font-bold transition-all border border-neutral-300 cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving || uploadingTarget !== null}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#FF6B16] hover:bg-[#ff5500] text-white text-xs font-bold transition-all shadow-md shadow-[#FF6B16]/25 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {statusMessage.text && (
        <div
          className={`p-4 rounded-2xl border text-sm font-semibold flex items-center gap-3 transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl p-2 border border-neutral-200 shadow-sm flex items-center gap-2 overflow-x-auto">
        {[
          { id: 'masonry', label: '1. Curated Masonry Grid', icon: Layers },
          { id: 'hero', label: '2. Hero & Metrics', icon: Sparkles },
          { id: 'philosophy', label: '3. Philosophy & Moments', icon: Mountain },
          { id: 'filmstrip', label: '4. Filmstrip Panels', icon: Compass },
          { id: 'accommodations', label: '5. Expedition Stays', icon: Bed },
        ].map((tab) => {
          const IconComp = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#111111] text-white shadow-sm'
                  : 'text-neutral-600 hover:text-[#111111] hover:bg-neutral-100'
              }`}
            >
              <IconComp className="w-4 h-4 text-[#FF6B16]" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: CURATED MASONRY GRID */}
      {activeTab === 'masonry' && (
        <div className="space-y-6">
          {/* Section Header Settings */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm">
            <h3 className="text-base font-extrabold text-[#111111] mb-4">
              Masonry Section Titles & Filter Tags
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">
                  Eyebrow Tag
                </label>
                <input
                  type="text"
                  value={galleryData.masonry.eyebrow}
                  onChange={(e) =>
                    setGalleryData({
                      ...galleryData,
                      masonry: { ...galleryData.masonry, eyebrow: e.target.value },
                    })
                  }
                  className="w-full bg-[#F7F7F5] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#111111] outline-none focus:border-[#FF6B16]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">
                  Main Section Title
                </label>
                <input
                  type="text"
                  value={galleryData.masonry.title}
                  onChange={(e) =>
                    setGalleryData({
                      ...galleryData,
                      masonry: { ...galleryData.masonry, title: e.target.value },
                    })
                  }
                  className="w-full bg-[#F7F7F5] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#111111] outline-none focus:border-[#FF6B16]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={galleryData.masonry.subtitle}
                  onChange={(e) =>
                    setGalleryData({
                      ...galleryData,
                      masonry: { ...galleryData.masonry, subtitle: e.target.value },
                    })
                  }
                  className="w-full bg-[#F7F7F5] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#111111] outline-none focus:border-[#FF6B16]"
                />
              </div>
            </div>

            {/* Filter Pills list */}
            <div>
              <label className="block text-xs font-bold text-neutral-600 uppercase mb-1.5">
                Filter Pills / Categories
              </label>

              {/* Interactive Chips Preview with (X) remove */}
              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                {galleryData.masonry.categories?.map((cat, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200/80 border border-neutral-300 text-xs font-bold text-[#111111] transition-all"
                  >
                    <span>{cat}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = galleryData.masonry.categories.filter((_, i) => i !== idx);
                        setGalleryData({
                          ...galleryData,
                          masonry: { ...galleryData.masonry, categories: updated },
                        });
                        setMasonryCategoriesInput(updated.join(', '));
                      }}
                      className="w-4 h-4 rounded-full bg-neutral-300/70 hover:bg-red-500 hover:text-white flex items-center justify-center text-neutral-600 transition-colors cursor-pointer"
                      title="Remove category"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>

              <input
                type="text"
                value={masonryCategoriesInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setMasonryCategoriesInput(val);
                  const arr = val
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean);
                  setGalleryData({
                    ...galleryData,
                    masonry: { ...galleryData.masonry, categories: arr },
                  });
                }}
                className="w-full bg-[#F7F7F5] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#111111] outline-none focus:border-[#FF6B16]"
                placeholder="All, Kedarkantha Trek, Kashmir Getaway, Manali Adventure..."
              />
              <p className="text-[11px] text-neutral-400 mt-1">
                Type categories separated by commas or remove badges above.
              </p>
            </div>
          </div>

          {/* Photos Cards List */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-extrabold text-[#111111]">
                  Masonry Grid Photos ({galleryData.masonry.items.length})
                </h3>
                <p className="text-xs text-neutral-500">
                  Click 'Edit' or upload directly to replace any image with Cloudinary.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsNewMasonryItem(true);
                  setEditingMasonryItem({
                    id: 'p_' + Date.now(),
                    trip: 'Kedarkantha Trek',
                    category: 'Himalayan Treks',
                    title: 'New Mountain Capture',
                    location: 'Uttarakhand, India',
                    image: '/newimage/herosecction/heroimage.png',
                    span: 'col-span-1 row-span-1',
                  });
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF6B16] hover:bg-[#ff5500] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Photo</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryData.masonry.items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="group relative rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-50 hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div className="relative aspect-[4/3] bg-neutral-200 overflow-hidden">
                    <img
                      src={displayImg(item.image)}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => {
                          setIsNewMasonryItem(false);
                          setEditingMasonryItem({ ...item });
                        }}
                        className="w-8 h-8 rounded-full bg-white/95 text-[#111111] hover:text-[#FF6B16] flex items-center justify-center shadow-sm cursor-pointer transition-colors"
                        title="Edit Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          triggerUpload((newUrl) => {
                            const updated = [...galleryData.masonry.items];
                            updated[idx].image = newUrl;
                            setGalleryData({
                              ...galleryData,
                              masonry: { ...galleryData.masonry, items: updated },
                            });
                          });
                        }}
                        className="w-8 h-8 rounded-full bg-[#FF6B16] text-white hover:bg-[#ff5500] flex items-center justify-center shadow-sm cursor-pointer transition-colors"
                        title="Upload New to Cloudinary"
                      >
                        <Upload className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Delete this photo from gallery?')) {
                            const updated = galleryData.masonry.items.filter((_, i) => i !== idx);
                            setGalleryData({
                              ...galleryData,
                              masonry: { ...galleryData.masonry, items: updated },
                            });
                          }
                        }}
                        className="w-8 h-8 rounded-full bg-red-600 text-white hover:bg-red-700 flex items-center justify-center shadow-sm cursor-pointer transition-colors"
                        title="Delete Photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="absolute bottom-2 left-2 text-[10px] font-bold uppercase tracking-wider bg-black/75 text-white px-2 py-0.5 rounded-md">
                      {item.span?.replace('col-span-', 'col-') || '1x1'}
                    </span>
                  </div>

                  <div className="p-3.5">
                    <span className="text-[10px] font-bold text-[#FF6B16] uppercase tracking-wider block">
                      {item.trip}
                    </span>
                    <h4 className="text-xs font-bold text-[#111111] truncate mt-0.5" title={item.title}>
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                      {item.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HERO & METRICS */}
      {activeTab === 'hero' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm">
            <h3 className="text-base font-extrabold text-[#111111] mb-4">
              Hero Section Banner & Typography
            </h3>

            {/* Hero Image Preview & Cloudinary Upload */}
            <div className="mb-6 p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row items-center gap-6">
              <div className="relative w-full sm:w-64 h-36 rounded-xl overflow-hidden bg-neutral-200 border border-neutral-300 shrink-0">
                <img
                  src={displayImg(galleryData.hero.bgImage)}
                  alt="Hero Background"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-2 text-center sm:text-left flex-1">
                <h4 className="text-sm font-bold text-[#111111]">Hero Backdrop Image</h4>
                <p className="text-xs text-neutral-500">
                  Upload high-res Himalayan landscape photo directly to Cloudinary.
                </p>
                <div className="flex items-center gap-2 pt-1 justify-center sm:justify-start">
                  <button
                    type="button"
                    onClick={() =>
                      triggerUpload((newUrl) =>
                        setGalleryData({
                          ...galleryData,
                          hero: { ...galleryData.hero, bgImage: newUrl },
                        })
                      )
                    }
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF6B16] hover:bg-[#ff5500] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload to Cloudinary</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Text Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">
                  Badge Text
                </label>
                <input
                  type="text"
                  value={galleryData.hero.badge}
                  onChange={(e) =>
                    setGalleryData({
                      ...galleryData,
                      hero: { ...galleryData.hero, badge: e.target.value },
                    })
                  }
                  className="w-full bg-[#F7F7F5] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#111111] outline-none focus:border-[#FF6B16]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">
                  Pre-Heading
                </label>
                <input
                  type="text"
                  value={galleryData.hero.preHeading}
                  onChange={(e) =>
                    setGalleryData({
                      ...galleryData,
                      hero: { ...galleryData.hero, preHeading: e.target.value },
                    })
                  }
                  className="w-full bg-[#F7F7F5] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#111111] outline-none focus:border-[#FF6B16]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">
                  Main Big Heading
                </label>
                <input
                  type="text"
                  value={galleryData.hero.heading}
                  onChange={(e) =>
                    setGalleryData({
                      ...galleryData,
                      hero: { ...galleryData.hero, heading: e.target.value },
                    })
                  }
                  className="w-full bg-[#F7F7F5] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#111111] outline-none focus:border-[#FF6B16]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">
                Description Subtitle
              </label>
              <textarea
                rows={3}
                value={galleryData.hero.description}
                onChange={(e) =>
                  setGalleryData({
                    ...galleryData,
                    hero: { ...galleryData.hero, description: e.target.value },
                  })
                }
                className="w-full bg-[#F7F7F5] border border-neutral-300 rounded-xl p-3.5 text-xs font-medium text-[#111111] outline-none focus:border-[#FF6B16]"
              />
            </div>
          </div>

          {/* 4 Metrics */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm">
            <h3 className="text-base font-extrabold text-[#111111] mb-4">
              4 Quick Metric Stats
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {galleryData.hero.metrics?.map((metric, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
                  <span className="text-[10px] font-bold text-neutral-400 block mb-2">
                    Metric #{idx + 1}
                  </span>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-600">Value</label>
                      <input
                        type="text"
                        value={metric.value}
                        onChange={(e) => {
                          const updated = [...galleryData.hero.metrics];
                          updated[idx].value = e.target.value;
                          setGalleryData({
                            ...galleryData,
                            hero: { ...galleryData.hero, metrics: updated },
                          });
                        }}
                        className="w-full bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#111111] outline-none focus:border-[#FF6B16]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-600">Label</label>
                      <input
                        type="text"
                        value={metric.label}
                        onChange={(e) => {
                          const updated = [...galleryData.hero.metrics];
                          updated[idx].label = e.target.value;
                          setGalleryData({
                            ...galleryData,
                            hero: { ...galleryData.hero, metrics: updated },
                          });
                        }}
                        className="w-full bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-neutral-600 outline-none focus:border-[#FF6B16]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PHILOSOPHY & MOMENTS */}
      {activeTab === 'philosophy' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm">
            <h3 className="text-base font-extrabold text-[#111111] mb-4">
              Section 2: "More than a tour" Philosophy Header
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">
                  Badge
                </label>
                <input
                  type="text"
                  value={galleryData.philosophy.badge}
                  onChange={(e) =>
                    setGalleryData({
                      ...galleryData,
                      philosophy: { ...galleryData.philosophy, badge: e.target.value },
                    })
                  }
                  className="w-full bg-[#F7F7F5] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#111111] outline-none focus:border-[#FF6B16]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={galleryData.philosophy.title}
                  onChange={(e) =>
                    setGalleryData({
                      ...galleryData,
                      philosophy: { ...galleryData.philosophy, title: e.target.value },
                    })
                  }
                  className="w-full bg-[#F7F7F5] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#111111] outline-none focus:border-[#FF6B16]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={galleryData.philosophy.description}
                onChange={(e) =>
                  setGalleryData({
                    ...galleryData,
                    philosophy: { ...galleryData.philosophy, description: e.target.value },
                  })
                }
                className="w-full bg-[#F7F7F5] border border-neutral-300 rounded-xl p-3.5 text-xs font-medium text-[#111111] outline-none focus:border-[#FF6B16]"
              />
            </div>
          </div>

          {/* Left & Right Side Photos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Card */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm space-y-4">
              <h4 className="text-sm font-extrabold text-[#111111]">Left Featured Photo</h4>
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-neutral-200 border border-neutral-300">
                <img
                  src={displayImg(galleryData.philosophy.leftCard?.image)}
                  alt="Left Photo"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() =>
                    triggerUpload((newUrl) =>
                      setGalleryData({
                        ...galleryData,
                        philosophy: {
                          ...galleryData.philosophy,
                          leftCard: { ...galleryData.philosophy.leftCard, image: newUrl },
                        },
                      })
                    )
                  }
                  className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-[#FF6B16] text-white text-xs font-bold shadow-md cursor-pointer hover:bg-[#ff5500] transition-colors"
                >
                  Upload Cloudinary
                </button>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={galleryData.philosophy.leftCard?.title || ''}
                  onChange={(e) =>
                    setGalleryData({
                      ...galleryData,
                      philosophy: {
                        ...galleryData.philosophy,
                        leftCard: { ...galleryData.philosophy.leftCard, title: e.target.value },
                      },
                    })
                  }
                  className="w-full bg-[#F7F7F5] border border-neutral-300 rounded-xl px-3 py-2 text-xs text-[#111111]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">
                  Trip / Location
                </label>
                <input
                  type="text"
                  value={galleryData.philosophy.leftCard?.trip || ''}
                  onChange={(e) =>
                    setGalleryData({
                      ...galleryData,
                      philosophy: {
                        ...galleryData.philosophy,
                        leftCard: { ...galleryData.philosophy.leftCard, trip: e.target.value },
                      },
                    })
                  }
                  className="w-full bg-[#F7F7F5] border border-neutral-300 rounded-xl px-3 py-2 text-xs text-[#111111]"
                />
              </div>
            </div>

            {/* Right Card */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm space-y-4">
              <h4 className="text-sm font-extrabold text-[#111111]">Right Featured Photo</h4>
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-neutral-200 border border-neutral-300">
                <img
                  src={displayImg(galleryData.philosophy.rightCard?.image)}
                  alt="Right Photo"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() =>
                    triggerUpload((newUrl) =>
                      setGalleryData({
                        ...galleryData,
                        philosophy: {
                          ...galleryData.philosophy,
                          rightCard: { ...galleryData.philosophy.rightCard, image: newUrl },
                        },
                      })
                    )
                  }
                  className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-[#FF6B16] text-white text-xs font-bold shadow-md cursor-pointer hover:bg-[#ff5500] transition-colors"
                >
                  Upload Cloudinary
                </button>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={galleryData.philosophy.rightCard?.title || ''}
                  onChange={(e) =>
                    setGalleryData({
                      ...galleryData,
                      philosophy: {
                        ...galleryData.philosophy,
                        rightCard: { ...galleryData.philosophy.rightCard, title: e.target.value },
                      },
                    })
                  }
                  className="w-full bg-[#F7F7F5] border border-neutral-300 rounded-xl px-3 py-2 text-xs text-[#111111]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">
                    Trip
                  </label>
                  <input
                    type="text"
                    value={galleryData.philosophy.rightCard?.trip || ''}
                    onChange={(e) =>
                      setGalleryData({
                        ...galleryData,
                        philosophy: {
                          ...galleryData.philosophy,
                          rightCard: { ...galleryData.philosophy.rightCard, trip: e.target.value },
                        },
                      })
                    }
                    className="w-full bg-[#F7F7F5] border border-neutral-300 rounded-xl px-3 py-2 text-xs text-[#111111]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">
                    Tag / Altitude
                  </label>
                  <input
                    type="text"
                    value={galleryData.philosophy.rightCard?.tag || ''}
                    onChange={(e) =>
                      setGalleryData({
                        ...galleryData,
                        philosophy: {
                          ...galleryData.philosophy,
                          rightCard: { ...galleryData.philosophy.rightCard, tag: e.target.value },
                        },
                      })
                    }
                    className="w-full bg-[#F7F7F5] border border-neutral-300 rounded-xl px-3 py-2 text-xs text-[#111111]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3 Bottom Cards */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm">
            <h3 className="text-base font-extrabold text-[#111111] mb-4">
              3 Bottom Staggered Cards
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {galleryData.philosophy.bottomCards?.map((card, idx) => (
                <div key={card.id || idx} className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-neutral-200">
                    <img
                      src={displayImg(card.image)}
                      alt={card.title}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        triggerUpload((newUrl) => {
                          const updated = [...galleryData.philosophy.bottomCards];
                          updated[idx].image = newUrl;
                          setGalleryData({
                            ...galleryData,
                            philosophy: { ...galleryData.philosophy, bottomCards: updated },
                          });
                        })
                      }
                      className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-[#FF6B16] text-white text-[10px] font-bold shadow-md cursor-pointer hover:bg-[#ff5500]"
                    >
                      Cloudinary
                    </button>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 uppercase">
                      Category Tag
                    </label>
                    <input
                      type="text"
                      value={card.tag}
                      onChange={(e) => {
                        const updated = [...galleryData.philosophy.bottomCards];
                        updated[idx].tag = e.target.value;
                        setGalleryData({
                          ...galleryData,
                          philosophy: { ...galleryData.philosophy, bottomCards: updated },
                        });
                      }}
                      className="w-full bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#111111]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 uppercase">
                      Title
                    </label>
                    <input
                      type="text"
                      value={card.title}
                      onChange={(e) => {
                        const updated = [...galleryData.philosophy.bottomCards];
                        updated[idx].title = e.target.value;
                        setGalleryData({
                          ...galleryData,
                          philosophy: { ...galleryData.philosophy, bottomCards: updated },
                        });
                      }}
                      className="w-full bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#111111]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 uppercase">
                      Trip
                    </label>
                    <input
                      type="text"
                      value={card.trip}
                      onChange={(e) => {
                        const updated = [...galleryData.philosophy.bottomCards];
                        updated[idx].trip = e.target.value;
                        setGalleryData({
                          ...galleryData,
                          philosophy: { ...galleryData.philosophy, bottomCards: updated },
                        });
                      }}
                      className="w-full bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 text-xs text-neutral-600"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FILMSTRIP PANELS */}
      {activeTab === 'filmstrip' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm">
            <h3 className="text-base font-extrabold text-[#111111] mb-2">
              Panoramic Filmstrip Categories
            </h3>
            <p className="text-xs text-neutral-500 mb-3">
              Enter categories separated by commas (e.g. <code>RAFTING, HIMALAYAN TREKS</code>) or remove badges below.
            </p>

            {/* Interactive Chips Preview with (X) remove */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {galleryData.filmstrip.categories?.map((cat, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200/80 border border-neutral-300 text-xs font-bold text-[#111111] transition-all"
                >
                  <span>{cat}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = galleryData.filmstrip.categories.filter((_, i) => i !== idx);
                      setGalleryData({
                        ...galleryData,
                        filmstrip: { ...galleryData.filmstrip, categories: updated },
                      });
                      setFilmstripCategoriesInput(updated.join(', '));
                    }}
                    className="w-4 h-4 rounded-full bg-neutral-300/70 hover:bg-red-500 hover:text-white flex items-center justify-center text-neutral-600 transition-colors cursor-pointer"
                    title="Remove category"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
            </div>

            <input
              type="text"
              value={filmstripCategoriesInput}
              onChange={(e) => {
                const val = e.target.value;
                setFilmstripCategoriesInput(val);
                const arr = val
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean);
                setGalleryData({
                  ...galleryData,
                  filmstrip: { ...galleryData.filmstrip, categories: arr },
                });
              }}
              className="w-full bg-[#F7F7F5] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#111111] outline-none focus:border-[#FF6B16]"
              placeholder="HIMALAYAN TREKS, SCENIC & LAKES, CAMPS & BONFIRE, ROAD EXPEDITIONS"
            />
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-extrabold text-[#111111]">
                  Filmstrip Panels ({galleryData.filmstrip.panels?.length || 0})
                </h3>
                <p className="text-xs text-neutral-500">
                  Full-height interactive panoramic photo panels.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsNewPanel(true);
                  setEditingPanel({
                    id: 'panel_' + Date.now(),
                    category: galleryData.filmstrip.categories[0] || 'HIMALAYAN TREKS',
                    title: 'NEW EXPEDITION PANEL',
                    subtitle: 'Scenic captures from high altitude expeditions',
                    image: '/newimage/herosecction/heroimage.png',
                    tag: 'Expedition Tag',
                    isCenter: false,
                  });
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF6B16] hover:bg-[#ff5500] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Panel</span>
              </button>
            </div>

            {/* Category Filter Pills in Admin */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 border-b border-neutral-200/80 pt-1">
              <span className="text-[11px] font-bold text-neutral-500 uppercase shrink-0">Filter View:</span>
              {['ALL', ...(galleryData.filmstrip.categories || [])].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAdminPanelCatFilter(c)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    adminPanelCatFilter.toUpperCase() === c.toUpperCase()
                      ? 'bg-[#FF6B16] text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(galleryData.filmstrip.panels || [])
                .filter((p) => {
                  if (!adminPanelCatFilter || adminPanelCatFilter === 'ALL') return true;
                  return p.category?.trim().toLowerCase() === adminPanelCatFilter.trim().toLowerCase();
                })
                .map((panel, idx) => (
                <div
                  key={panel.id || idx}
                  className="rounded-2xl border border-neutral-200 bg-neutral-50 overflow-hidden flex flex-col justify-between"
                >
                  <div className="relative h-48 bg-neutral-200">
                    <img
                      src={displayImg(panel.image)}
                      alt={panel.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setIsNewPanel(false);
                          setEditingPanel({ ...panel });
                        }}
                        className="w-7 h-7 rounded-full bg-white text-[#111111] hover:text-[#FF6B16] flex items-center justify-center shadow-sm cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          triggerUpload((newUrl) => {
                            const realIdx = galleryData.filmstrip.panels.findIndex(
                              (p) => (p.id || p.title) === (panel.id || panel.title)
                            );
                            if (realIdx !== -1) {
                              const updated = [...galleryData.filmstrip.panels];
                              updated[realIdx].image = newUrl;
                              setGalleryData({
                                ...galleryData,
                                filmstrip: { ...galleryData.filmstrip, panels: updated },
                              });
                            }
                          })
                        }
                        className="w-7 h-7 rounded-full bg-[#FF6B16] text-white flex items-center justify-center shadow-sm cursor-pointer"
                        title="Upload Cloudinary"
                      >
                        <Upload className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Delete this panel?')) {
                            const updated = galleryData.filmstrip.panels.filter(
                              (p) => (p.id || p.title) !== (panel.id || panel.title)
                            );
                            setGalleryData({
                              ...galleryData,
                              filmstrip: { ...galleryData.filmstrip, panels: updated },
                            });
                          }
                        }}
                        className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow-sm cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="absolute bottom-2 left-2 text-[10px] font-bold uppercase tracking-wider bg-black/75 text-white px-2 py-0.5 rounded-md">
                      {panel.category}
                    </span>
                  </div>

                  <div className="p-3.5 space-y-1">
                    <span className="text-[10px] font-bold text-[#FF6B16] uppercase block">
                      {panel.tag}
                    </span>
                    <h4 className="text-xs font-bold text-[#111111] line-clamp-1">{panel.title}</h4>
                    <p className="text-[11px] text-neutral-500 line-clamp-2">{panel.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: EXPEDITION ACCOMMODATIONS */}
      {activeTab === 'accommodations' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-extrabold text-[#111111]">
                  Expedition Stays & Accommodations ({galleryData.accommodations?.length || 0})
                </h3>
                <p className="text-xs text-neutral-500">
                  Showcase luxury domes, heritage houseboats, alpine lofts, and homestays.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsNewAccommodation(true);
                  setEditingAccommodation({
                    id: String(Date.now()).slice(-4),
                    number: '0' + (galleryData.accommodations.length + 1) + '. NEW STAY',
                    tripName: 'New Tour Expedition',
                    title: 'LUXURY EXPEDITION CAMP',
                    location: 'Mountain Valley, India',
                    desc: 'Cozy and insulated accommodations with breathtaking mountain views and local amenities.',
                    bathroomImg: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?q=85&w=800&auto=format&fit=crop',
                    mainImg: '/newimage/herosecction/heroimage.png',
                    details: [
                      { icon: 'Users', label: '2 - 4 Travelers' },
                      { icon: 'Maximize', label: 'Cozy Living Area' },
                      { icon: 'Bed', label: 'Comfortable Warm Beds' },
                      { icon: 'Mountain', label: 'Panoramic Views' },
                    ],
                  });
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF6B16] hover:bg-[#ff5500] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Stay</span>
              </button>
            </div>

            <div className="space-y-6">
              {galleryData.accommodations?.map((stay, idx) => (
                <div
                  key={stay.id || idx}
                  className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6 flex flex-col lg:flex-row gap-6 items-start justify-between"
                >
                  <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto shrink-0">
                    <div className="relative w-full sm:w-56 h-36 rounded-2xl overflow-hidden bg-neutral-200 border border-neutral-300">
                      <img
                        src={displayImg(stay.mainImg)}
                        alt="Main Stay"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          triggerUpload((newUrl) => {
                            const updated = [...galleryData.accommodations];
                            updated[idx].mainImg = newUrl;
                            setGalleryData({ ...galleryData, accommodations: updated });
                          })
                        }
                        className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-[#FF6B16] text-white text-[10px] font-bold shadow-md cursor-pointer hover:bg-[#ff5500]"
                      >
                        Main Img (Cloudinary)
                      </button>
                    </div>

                    <div className="relative w-full sm:w-40 h-36 rounded-2xl overflow-hidden bg-neutral-200 border border-neutral-300">
                      <img
                        src={displayImg(stay.bathroomImg)}
                        alt="Bathroom Inset"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          triggerUpload((newUrl) => {
                            const updated = [...galleryData.accommodations];
                            updated[idx].bathroomImg = newUrl;
                            setGalleryData({ ...galleryData, accommodations: updated });
                          })
                        }
                        className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-[#111111] text-white text-[10px] font-bold shadow-md cursor-pointer hover:bg-neutral-800"
                      >
                        En-Suite (Cloudinary)
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <span className="text-[10px] font-bold text-[#FF6B16] uppercase tracking-wider block">
                      {stay.number} • {stay.tripName}
                    </span>
                    <h4 className="text-base font-extrabold text-[#111111]">{stay.title}</h4>
                    <p className="text-xs text-neutral-500 font-semibold">{stay.location}</p>
                    <p className="text-xs text-neutral-600 line-clamp-2 mt-1">{stay.desc}</p>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {stay.details?.map((d, dIdx) => (
                        <span
                          key={dIdx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-neutral-200 text-[10px] font-bold text-neutral-700"
                        >
                          <CheckCircle2 className="w-3 h-3 text-[#FF6B16]" />
                          <span>{d.label}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full lg:w-auto justify-end pt-2 lg:pt-0">
                    <button
                      type="button"
                      onClick={() => {
                        setIsNewAccommodation(false);
                        setEditingAccommodation({ ...stay });
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-neutral-100 text-[#111111] text-xs font-bold border border-neutral-300 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Details</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Delete this accommodation?')) {
                          const updated = galleryData.accommodations.filter((_, i) => i !== idx);
                          setGalleryData({ ...galleryData, accommodations: updated });
                        }
                      }}
                      className="w-9 h-9 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT MASONRY PHOTO ITEM */}
      {editingMasonryItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="text-base font-extrabold text-[#111111]">
                {isNewMasonryItem ? 'Add New Gallery Photo' : 'Edit Gallery Photo'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingMasonryItem(null)}
                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Photo preview & upload */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-600 uppercase">
                Photo Asset
              </label>
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-neutral-200 border border-neutral-300">
                <img
                  src={displayImg(editingMasonryItem.image)}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    triggerUpload((newUrl) =>
                      setEditingMasonryItem({ ...editingMasonryItem, image: newUrl })
                    )
                  }
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FF6B16] text-white text-xs font-bold cursor-pointer hover:bg-[#ff5500]"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Image to Cloudinary</span>
                </button>
              </div>
              <input
                type="text"
                value={editingMasonryItem.image}
                onChange={(e) =>
                  setEditingMasonryItem({ ...editingMasonryItem, image: e.target.value })
                }
                placeholder="Or paste full image URL..."
                className="w-full bg-[#F7F7F5] border border-neutral-300 rounded-xl px-3 py-2 text-xs font-mono text-[#111111]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">
                  Trip Name
                </label>
                <input
                  type="text"
                  value={editingMasonryItem.trip}
                  onChange={(e) =>
                    setEditingMasonryItem({ ...editingMasonryItem, trip: e.target.value })
                  }
                  className="w-full bg-[#F7F7F5] border border-neutral-300 rounded-xl px-3 py-2 text-xs text-[#111111]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">
                  Category Tag
                </label>
                <input
                  type="text"
                  value={editingMasonryItem.category}
                  onChange={(e) =>
                    setEditingMasonryItem({ ...editingMasonryItem, category: e.target.value })
                  }
                  className="w-full bg-[#F7F7F5] border border-neutral-300 rounded-xl px-3 py-2 text-xs text-[#111111]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">
                Title / Caption
              </label>
              <input
                type="text"
                value={editingMasonryItem.title}
                onChange={(e) =>
                  setEditingMasonryItem({ ...editingMasonryItem, title: e.target.value })
                }
                className="w-full bg-[#F7F7F5] border border-neutral-300 rounded-xl px-3 py-2 text-xs text-[#111111]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={editingMasonryItem.location}
                  onChange={(e) =>
                    setEditingMasonryItem({ ...editingMasonryItem, location: e.target.value })
                  }
                  className="w-full bg-[#F7F7F5] border border-neutral-300 rounded-xl px-3 py-2 text-xs text-[#111111]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">
                  Card Span Size
                </label>
                <select
                  value={editingMasonryItem.span}
                  onChange={(e) =>
                    setEditingMasonryItem({ ...editingMasonryItem, span: e.target.value })
                  }
                  className="w-full bg-[#F7F7F5] border border-neutral-300 rounded-xl px-3 py-2 text-xs text-[#111111]"
                >
                  <option value="col-span-1 row-span-1">Standard (1x1)</option>
                  <option value="col-span-1 md:col-span-2 row-span-1">Wide (2x1)</option>
                  <option value="col-span-1 row-span-2">Tall (1x2)</option>
                  <option value="col-span-1 md:col-span-2 row-span-2">Large Featured (2x2)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setEditingMasonryItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  let updated;
                  if (isNewMasonryItem) {
                    updated = [editingMasonryItem, ...galleryData.masonry.items];
                  } else {
                    updated = galleryData.masonry.items.map((it) =>
                      it.id === editingMasonryItem.id ? editingMasonryItem : it
                    );
                  }
                  setGalleryData({
                    ...galleryData,
                    masonry: { ...galleryData.masonry, items: updated },
                  });
                  setEditingMasonryItem(null);
                  showToast('success', 'Photo item updated in local state. Remember to click "Save All Changes"!');
                }}
                className="px-5 py-2 rounded-xl bg-[#FF6B16] text-white text-xs font-bold hover:bg-[#ff5500]"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT FILMSTRIP PANEL */}
      {editingPanel && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="text-base font-extrabold text-[#111111]">
                {isNewPanel ? 'Add Filmstrip Panel' : 'Edit Filmstrip Panel'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingPanel(null)}
                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Photo preview & upload */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-600 uppercase">
                Panel Image
              </label>
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-neutral-200 border border-neutral-300">
                <img
                  src={displayImg(editingPanel.image)}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    triggerUpload((newUrl) =>
                      setEditingPanel({ ...editingPanel, image: newUrl })
                    )
                  }
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FF6B16] text-white text-xs font-bold cursor-pointer hover:bg-[#ff5500]"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Image to Cloudinary</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">
                  Category
                </label>
                <select
                  value={editingPanel.category}
                  onChange={(e) =>
                    setEditingPanel({ ...editingPanel, category: e.target.value })
                  }
                  className="w-full bg-[#F7F7F5] border border-neutral-300 rounded-xl px-3 py-2 text-xs text-[#111111]"
                >
                  {galleryData.filmstrip.categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">
                  Tag / Altitude
                </label>
                <input
                  type="text"
                  value={editingPanel.tag}
                  onChange={(e) =>
                    setEditingPanel({ ...editingPanel, tag: e.target.value })
                  }
                  className="w-full bg-[#F7F7F5] border border-neutral-300 rounded-xl px-3 py-2 text-xs text-[#111111]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">
                Panel Title
              </label>
              <input
                type="text"
                value={editingPanel.title}
                onChange={(e) =>
                  setEditingPanel({ ...editingPanel, title: e.target.value })
                }
                className="w-full bg-[#F7F7F5] border border-neutral-300 rounded-xl px-3 py-2 text-xs text-[#111111]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">
                Subtitle
              </label>
              <input
                type="text"
                value={editingPanel.subtitle}
                onChange={(e) =>
                  setEditingPanel({ ...editingPanel, subtitle: e.target.value })
                }
                className="w-full bg-[#F7F7F5] border border-neutral-300 rounded-xl px-3 py-2 text-xs text-[#111111]"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isCenterCheck"
                checked={editingPanel.isCenter}
                onChange={(e) =>
                  setEditingPanel({ ...editingPanel, isCenter: e.target.checked })
                }
                className="w-4 h-4 accent-[#FF6B16]"
              />
              <label htmlFor="isCenterCheck" className="text-xs font-bold text-neutral-700">
                Pulsing Hotspot Ring on Centerpiece
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setEditingPanel(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  let updated;
                  if (isNewPanel) {
                    updated = [...galleryData.filmstrip.panels, editingPanel];
                  } else {
                    updated = galleryData.filmstrip.panels.map((p) =>
                      p.id === editingPanel.id ? editingPanel : p
                    );
                  }
                  setGalleryData({
                    ...galleryData,
                    filmstrip: { ...galleryData.filmstrip, panels: updated },
                  });
                  setEditingPanel(null);
                  showToast('success', 'Panel updated in local state.');
                }}
                className="px-5 py-2 rounded-xl bg-[#FF6B16] text-white text-xs font-bold hover:bg-[#ff5500]"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT EXPEDITION ACCOMMODATION */}
      {editingAccommodation && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="text-base font-extrabold text-[#111111]">
                {isNewAccommodation ? 'Add Expedition Stay' : 'Edit Expedition Stay'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingAccommodation(null)}
                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">
                  Number / Tab Name
                </label>
                <input
                  type="text"
                  value={editingAccommodation.number}
                  onChange={(e) =>
                    setEditingAccommodation({ ...editingAccommodation, number: e.target.value })
                  }
                  placeholder="01. KEDARKANTHA RIDGE DOME"
                  className="w-full bg-[#F7F7F5] border border-neutral-300 rounded-xl px-3 py-2 text-xs text-[#111111]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">
                  Trip Name
                </label>
                <input
                  type="text"
                  value={editingAccommodation.tripName}
                  onChange={(e) =>
                    setEditingAccommodation({ ...editingAccommodation, tripName: e.target.value })
                  }
                  placeholder="Kedarkantha Trek (6D/5N)"
                  className="w-full bg-[#F7F7F5] border border-neutral-300 rounded-xl px-3 py-2 text-xs text-[#111111]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">
                Stay Title
              </label>
              <input
                type="text"
                value={editingAccommodation.title}
                onChange={(e) =>
                  setEditingAccommodation({ ...editingAccommodation, title: e.target.value })
                }
                className="w-full bg-[#F7F7F5] border border-neutral-300 rounded-xl px-3 py-2 text-xs text-[#111111]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">
                Location
              </label>
              <input
                type="text"
                value={editingAccommodation.location}
                onChange={(e) =>
                  setEditingAccommodation({ ...editingAccommodation, location: e.target.value })
                }
                className="w-full bg-[#F7F7F5] border border-neutral-300 rounded-xl px-3 py-2 text-xs text-[#111111]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={editingAccommodation.desc}
                onChange={(e) =>
                  setEditingAccommodation({ ...editingAccommodation, desc: e.target.value })
                }
                className="w-full bg-[#F7F7F5] border border-neutral-300 rounded-xl p-3 text-xs text-[#111111]"
              />
            </div>

            {/* Images */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">
                  Main Stay Image
                </label>
                <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-neutral-200 border border-neutral-300 mb-1.5">
                  <img
                    src={displayImg(editingAccommodation.mainImg)}
                    alt="Main"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    triggerUpload((newUrl) =>
                      setEditingAccommodation({ ...editingAccommodation, mainImg: newUrl })
                    )
                  }
                  className="w-full py-1.5 rounded-lg bg-[#FF6B16] text-white text-[10px] font-bold"
                >
                  Upload Cloudinary
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">
                  Bathroom / Inset Image
                </label>
                <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-neutral-200 border border-neutral-300 mb-1.5">
                  <img
                    src={displayImg(editingAccommodation.bathroomImg)}
                    alt="Bathroom"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    triggerUpload((newUrl) =>
                      setEditingAccommodation({ ...editingAccommodation, bathroomImg: newUrl })
                    )
                  }
                  className="w-full py-1.5 rounded-lg bg-[#111111] text-white text-[10px] font-bold"
                >
                  Upload Cloudinary
                </button>
              </div>
            </div>

            {/* Details Specs list */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-neutral-600 uppercase">
                  Amenities & Specs (4 items)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const cur = editingAccommodation.details || [];
                    setEditingAccommodation({
                      ...editingAccommodation,
                      details: [...cur, { icon: 'Bed', label: 'New Amenity Spec' }],
                    });
                  }}
                  className="text-[11px] font-bold text-[#FF6B16] hover:underline"
                >
                  + Add Spec
                </button>
              </div>

              <div className="space-y-2">
                {editingAccommodation.details?.map((d, dIdx) => (
                  <div key={dIdx} className="flex items-center gap-2">
                    <select
                      value={d.icon}
                      onChange={(e) => {
                        const updated = [...editingAccommodation.details];
                        updated[dIdx].icon = e.target.value;
                        setEditingAccommodation({ ...editingAccommodation, details: updated });
                      }}
                      className="bg-[#F7F7F5] border border-neutral-300 rounded-lg px-2 py-1.5 text-xs text-[#111111]"
                    >
                      {AVAILABLE_DETAIL_ICONS.map((ic) => (
                        <option key={ic} value={ic}>
                          {ic}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      value={d.label}
                      onChange={(e) => {
                        const updated = [...editingAccommodation.details];
                        updated[dIdx].label = e.target.value;
                        setEditingAccommodation({ ...editingAccommodation, details: updated });
                      }}
                      className="flex-1 bg-[#F7F7F5] border border-neutral-300 rounded-lg px-3 py-1.5 text-xs text-[#111111]"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        const updated = editingAccommodation.details.filter((_, i) => i !== dIdx);
                        setEditingAccommodation({ ...editingAccommodation, details: updated });
                      }}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setEditingAccommodation(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  let updated;
                  if (isNewAccommodation) {
                    updated = [...galleryData.accommodations, editingAccommodation];
                  } else {
                    updated = galleryData.accommodations.map((a) =>
                      a.id === editingAccommodation.id ? editingAccommodation : a
                    );
                  }
                  setGalleryData({ ...galleryData, accommodations: updated });
                  setEditingAccommodation(null);
                  showToast('success', 'Stay updated in local state.');
                }}
                className="px-5 py-2 rounded-xl bg-[#FF6B16] text-white text-xs font-bold hover:bg-[#ff5500]"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
