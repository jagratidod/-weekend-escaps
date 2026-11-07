import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  Mountain,
  EyeOff,
  ToggleLeft,
  ToggleRight,
  Compass,
  Heart,
  Save,
  RotateCcw,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  Image as ImageIcon,
  Flame,
  Globe,
  Users,
  Handshake,
  UsersRound,
  ShieldCheck,
  Plane,
  CalendarDays,
  ExternalLink,
  MessageCircle,
  Film,
  GripVertical,
  ChevronLeft,
  ChevronRight,
  Star,
  Layers,
} from 'lucide-react';
import ReelManager from './ReelManager';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { AVAILABLE_ICON_OPTIONS, getHomeIcon } from '../../utils/homeIconHelper';
import { DEFAULT_HOME_SECTIONS, DEFAULT_SECTION_ORDER, DEFAULT_SECTION_VISIBILITY } from '../../utils/defaultHomeSections';

const SECTION_METADATA = {
  hero: { id: 'hero', label: 'Hero Section', icon: Sparkles, editable: true },
  reels: { id: 'reels', label: 'Travel Reels', icon: Film, editable: true },
  experiences: { id: 'experiences', label: 'Choose Experience', icon: Compass, editable: true },
  packages: { id: 'packages', label: 'Tour Packages', icon: Mountain, editable: false, managerLink: '/admin/packages' },
  whyChooseUs: { id: 'whyChooseUs', label: 'Why Choose Us', icon: ShieldCheck, editable: true },
  bookingProcess: { id: 'bookingProcess', label: 'Process & Welfare', icon: Handshake, editable: true },
  testimonials: { id: 'testimonials', label: 'Traveler Reviews', icon: Star, editable: false, managerLink: '/admin/testimonials' },
  gallery: { id: 'gallery', label: 'Memories Gallery', icon: ImageIcon, editable: true },
  blogs: { id: 'blogs', label: 'Travel Blogs', icon: ExternalLink, editable: false, managerLink: '/admin/blogs' },
  finalCta: { id: 'finalCta', label: 'Ready For Adventure (CTA)', icon: Flame, editable: true },
};

export const ensureSixGalleryItems = (existing) => {
  const defaults = DEFAULT_HOME_SECTIONS.gallery?.items || [];
  const list = Array.isArray(existing) ? existing : [];
  const res = [];
  for (let i = 0; i < 6; i++) {
    const item = list[i];
    const def = defaults[i] || {
      id: `g${i + 1}`,
      title: `Trip Photo ${i + 1}`,
      category: 'Mountain Trekking',
      image: '/newimage/exploresection/kedarkantha.png',
      location: 'India',
    };
    if (item && (item.image || item.title)) {
      res.push({
        id: item.id || `g${i + 1}`,
        title: item.title !== undefined ? item.title : def.title,
        category: item.category !== undefined ? item.category : def.category,
        image: item.image || def.image,
        location: item.location !== undefined ? item.location : def.location,
      });
    } else {
      res.push({ ...def });
    }
  }
  return res;
};

export default function HomeSectionsManager() {
  const { homeSections, refreshSettings, formatImageUrl, API_BASE_URL, updateHomeSectionVisibility } = useSettings();
  const { token } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();

  const getInitialSectionTab = () => {
    const fromSearch = searchParams.get('section');
    if (fromSearch && SECTION_METADATA[fromSearch]) return fromSearch;
    try {
      const saved = localStorage.getItem('admin_home_section_tab');
      if (saved && SECTION_METADATA[saved]) return saved;
    } catch (e) {}
    return 'hero';
  };

  const [activeTab, setActiveTabState] = useState(getInitialSectionTab);

  const setActiveTab = (newTab) => {
    setActiveTabState(newTab);
    try {
      localStorage.setItem('admin_home_section_tab', newTab);
    } catch (e) {}
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newTab === 'hero') {
        next.delete('section');
      } else {
        next.set('section', newTab);
      }
      return next;
    }, { replace: true });
  };
  const [formData, setFormData] = useState(() => {
    const init = JSON.parse(JSON.stringify(DEFAULT_HOME_SECTIONS));
    if (init.gallery) {
      init.gallery.items = ensureSixGalleryItems(init.gallery.items);
    }
    return init;
  });
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Section Visibility (Active / Inactive Toggle) State
  const [sectionVisibility, setSectionVisibility] = useState(DEFAULT_SECTION_VISIBILITY);
  const [togglingSection, setTogglingSection] = useState(null);

  // Drag and Drop Section Reordering State
  const [sectionOrder, setSectionOrder] = useState(DEFAULT_SECTION_ORDER);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [savingOrder, setSavingOrder] = useState(false);

  // File upload input refs
  const heroImageInputRef = useRef(null);
  const whyChooseImageInputRef = useRef(null);
  const finalCtaImageInputRef = useRef(null);

  useEffect(() => {
    if (homeSections) {
      const cloned = JSON.parse(JSON.stringify(homeSections));
      cloned.gallery = {
        ...DEFAULT_HOME_SECTIONS.gallery,
        ...(cloned.gallery || {}),
        items: ensureSixGalleryItems(cloned.gallery?.items),
      };
      setFormData(cloned);
      if (Array.isArray(homeSections.sectionOrder) && homeSections.sectionOrder.length > 0) {
        const merged = [...homeSections.sectionOrder];
        DEFAULT_SECTION_ORDER.forEach((secId) => {
          if (!merged.includes(secId)) merged.push(secId);
        });
        setSectionOrder(merged);
      } else {
        setSectionOrder(DEFAULT_SECTION_ORDER);
      }
      if (homeSections.sectionVisibility && typeof homeSections.sectionVisibility === 'object') {
        setSectionVisibility({
          ...DEFAULT_SECTION_VISIBILITY,
          ...homeSections.sectionVisibility,
        });
      }
    }
  }, [homeSections]);

  const showToast = (type, text) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage({ type: '', text: '' });
    }, 4500);
  };

  // Upload an image via the backend upload endpoint
  const handleUploadImage = async (file, onUploadedUrl) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      showToast('error', 'Image file exceeds 8MB limit.');
      return;
    }

    try {
      setUploadingImage(true);
      const fd = new FormData();
      fd.append('image', file);

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
      showToast('success', 'Image uploaded successfully!');
    } catch (err) {
      console.error('[Upload Error]:', err);
      showToast('error', err.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  // Save changes to backend
  const handleSave = async (sectionKey) => {
    try {
      setSaving(true);
      setStatusMessage({ type: '', text: '' });

      const payload = sectionKey ? { [sectionKey]: formData[sectionKey] } : formData;
      if (sectionKey === 'gallery' && payload.gallery) {
        payload.gallery = {
          ...payload.gallery,
          items: ensureSixGalleryItems(payload.gallery.items),
        };
      }

      const res = await fetch(`${API_BASE_URL}/settings/home-sections`, {
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

      await refreshSettings();
      showToast('success', 'Home section updated successfully!');
    } catch (err) {
      console.error('[Save Error]:', err);
      showToast('error', err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  // Reset section to default
  const handleReset = async (sectionKey) => {
    if (!window.confirm(`Are you sure you want to reset the "${sectionKey}" section to default?`)) {
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`${API_BASE_URL}/settings/home-sections/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ section: sectionKey }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to reset section');
      }

      await refreshSettings();
      if (data.homeSections) {
        const updated = JSON.parse(JSON.stringify(data.homeSections));
        updated.gallery = {
          ...DEFAULT_HOME_SECTIONS.gallery,
          ...(updated.gallery || {}),
          items: ensureSixGalleryItems(updated.gallery?.items),
        };
        setFormData(updated);
      }
      showToast('success', `"${sectionKey}" reset to default values!`);
    } catch (err) {
      console.error('[Reset Error]:', err);
      showToast('error', err.message || 'Failed to reset section');
    } finally {
      setSaving(false);
    }
  };

  // Drag and Drop Handlers for Reordering Homepage Sections
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragEnter = (e, index) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = async (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...sectionOrder];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, moved);

    setSectionOrder(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);

    await saveOrderToBackend(updated);
  };

  const moveSection = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sectionOrder.length) return;

    const updated = [...sectionOrder];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    setSectionOrder(updated);
    await saveOrderToBackend(updated);
  };

  // Toggle Section Visibility (Active / Inactive on Homepage)
  const handleToggleSectionVisibility = async (sectionId) => {
    const currentVal = sectionVisibility[sectionId] !== false;
    const newVal = !currentVal;
    const updated = {
      ...sectionVisibility,
      [sectionId]: newVal,
    };
    setSectionVisibility(updated);
    setTogglingSection(sectionId);

    try {
      const res = await updateHomeSectionVisibility(token, updated);
      if (res && res.success) {
        showToast(
          'success',
          `${SECTION_METADATA[sectionId]?.label || sectionId} is now ${newVal ? 'ACTIVE (Visible)' : 'INACTIVE (Hidden)'} on homepage!`
        );
      } else {
        throw new Error(res?.message || 'Failed to update section visibility');
      }
    } catch (err) {
      setSectionVisibility((prev) => ({ ...prev, [sectionId]: currentVal }));
      showToast('error', err.message || 'Failed to update section status');
    } finally {
      setTogglingSection(null);
    }
  };

  const saveOrderToBackend = async (orderList) => {
    try {
      setSavingOrder(true);
      const res = await fetch(`${API_BASE_URL}/settings/home-sections`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sectionOrder: orderList }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save section order');
      }

      await refreshSettings();
      showToast('success', 'Homepage layout order updated live!');
    } catch (err) {
      console.error('[Save Section Order Error]:', err);
      showToast('error', err.message || 'Failed to save section order');
    } finally {
      setSavingOrder(false);
    }
  };

  const handleResetOrder = async () => {
    if (!window.confirm('Reset the homepage section order back to default layout?')) {
      return;
    }
    setSectionOrder(DEFAULT_SECTION_ORDER);
    await saveOrderToBackend(DEFAULT_SECTION_ORDER);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ── Top Header ── */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-neutral-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B16] animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-black text-[#1A384C]">Home Page Sections Editor</h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Customize hero artwork, headlines, category badges, why choose us features, process timeline, and call-to-actions live.
          </p>
        </div>

        {/* Global Save Button */}
        {activeTab !== 'reels' && !['packages', 'testimonials', 'blogs'].includes(activeTab) && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSave(activeTab)}
              disabled={saving || uploadingImage}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6B16] hover:bg-[#e05809] text-white font-extrabold text-xs sm:text-sm shadow-md shadow-[#FF6B16]/30 hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save This Section</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Toast Notification ── */}
      {statusMessage.text && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-xs sm:text-sm font-semibold transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span className="flex-1">{statusMessage.text}</span>
        </div>
      )}

      {/* ── 1. HOMEPAGE LAYOUT & SECTION REORDERING BAR ── */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-neutral-150 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6B16] flex items-center justify-center shrink-0 border border-orange-200 shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-[#1A384C]">
                  Homepage Layout & Section Ordering
                </h2>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wide">
                  Live Website
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Drag cards or click the <span className="font-bold text-[#FF6B16]">Earlier ←</span> / <span className="font-bold text-[#FF6B16]">→ Later</span> buttons to change the vertical order of sections on your homepage.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => saveOrderToBackend(sectionOrder)}
              disabled={savingOrder}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1A384C] hover:bg-[#254d66] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              title="Save current order"
            >
              {savingOrder ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Order</span>
                </>
              )}
            </button>
            <button
              onClick={handleResetOrder}
              disabled={savingOrder}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              title="Reset layout order to default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>
          </div>
        </div>

        {/* Horizontal Drag & Drop / Arrow Reordering Ribbon */}
        <div className="relative">
          <div className="flex items-stretch gap-3 overflow-x-auto pb-3 pt-1 px-0.5 no-scrollbar">
            {sectionOrder.map((sectionId, index) => {
              const meta = SECTION_METADATA[sectionId] || {
                id: sectionId,
                label: sectionId,
                icon: Sparkles,
                editable: true,
              };
              const Icon = meta.icon;
              const isDragging = draggedIndex === index;
              const isDragOver = dragOverIndex === index;
              const isFirst = index === 0;
              const isLast = index === sectionOrder.length - 1;

              const isSectionActive = sectionVisibility[sectionId] !== false;

              return (
                <div
                  key={sectionId}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnter={(e) => handleDragEnter(e, index)}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`group relative flex flex-col justify-between min-w-[220px] sm:min-w-[245px] p-3.5 rounded-2xl border transition-all duration-200 select-none ${
                    isDragging
                      ? 'opacity-30 scale-95 border-dashed border-[#FF6B16] bg-orange-50/50'
                      : ''
                  } ${
                    isDragOver
                      ? 'ring-2 ring-[#FF6B16] border-[#FF6B16] bg-orange-50/80 scale-[1.03] shadow-md z-10'
                      : !isSectionActive
                      ? 'bg-neutral-100/70 border-dashed border-neutral-300 opacity-70 shadow-2xs hover:opacity-90'
                      : 'bg-white hover:bg-neutral-50/80 border-neutral-200/90 shadow-2xs hover:shadow-xs'
                  }`}
                >
                  {/* Card Top: Position Badge, Active Toggle Switch, and Drag Grip */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 pointer-events-none">
                      <span className={`w-6 h-6 rounded-lg text-[11px] font-black flex items-center justify-center shadow-xs ${
                        isSectionActive ? 'bg-[#1A384C] text-white' : 'bg-neutral-300 text-neutral-600'
                      }`}>
                        #{index + 1}
                      </span>
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        Pos
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pointer-events-auto">
                      {/* Active / Inactive Toggle Switch */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSectionVisibility(sectionId);
                        }}
                        disabled={togglingSection === sectionId}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                          isSectionActive ? 'bg-emerald-500' : 'bg-neutral-300'
                        } ${togglingSection === sectionId ? 'opacity-50 cursor-wait' : ''}`}
                        title={isSectionActive ? 'Section is Active (Click to hide from homepage)' : 'Section is Inactive (Click to show on homepage)'}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                            isSectionActive ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>

                      <div
                        className="cursor-grab active:cursor-grabbing text-neutral-400 group-hover:text-[#FF6B16] transition-colors p-1 rounded hover:bg-neutral-100"
                        title="Drag to reorder section"
                      >
                        <GripVertical className="w-4 h-4 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Card Middle: Icon, Title, and Status Badge */}
                  <div className="my-2.5 flex items-center gap-2.5 pointer-events-none">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                      isSectionActive
                        ? 'bg-orange-50 text-[#FF6B16] border-orange-100'
                        : 'bg-neutral-200 text-neutral-500 border-neutral-300'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className={`text-xs font-black truncate leading-tight ${
                        isSectionActive ? 'text-[#1A384C]' : 'text-neutral-500 line-through'
                      }`}>
                        {meta.label}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full inline-flex items-center gap-1 ${
                          isSectionActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-neutral-200/80 text-neutral-600 border border-neutral-300'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isSectionActive ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
                          {isSectionActive ? 'Active' : 'Off / Hidden'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Always-Visible Arrow Controls & Edit Link */}
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100 gap-1.5 pointer-events-auto">
                    {/* Left Move Arrow */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveSection(index, -1);
                      }}
                      disabled={isFirst || savingOrder}
                      className={`flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all ${
                        isFirst
                          ? 'bg-neutral-100 text-neutral-300 cursor-not-allowed'
                          : 'bg-neutral-100 hover:bg-[#FF6B16] text-neutral-700 hover:text-white cursor-pointer active:scale-95'
                      }`}
                      title={isFirst ? 'Already first' : `Move ${meta.label} left (earlier)`}
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Earlier</span>
                    </button>

                    {/* Right Move Arrow */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveSection(index, 1);
                      }}
                      disabled={isLast || savingOrder}
                      className={`flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all ${
                        isLast
                          ? 'bg-neutral-100 text-neutral-300 cursor-not-allowed'
                          : 'bg-neutral-100 hover:bg-[#FF6B16] text-neutral-700 hover:text-white cursor-pointer active:scale-95'
                      }`}
                      title={isLast ? 'Already last' : `Move ${meta.label} right (later)`}
                    >
                      <span>Later</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    {/* Quick jump to editor */}
                    {meta.editable ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTab(sectionId);
                        }}
                        className={`p-1.5 rounded-lg text-[11px] font-bold transition-all ${
                          activeTab === sectionId
                            ? 'bg-[#1A384C] text-white'
                            : 'bg-orange-50 text-[#FF6B16] hover:bg-orange-100'
                        }`}
                        title="Edit section content below"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <a
                        href={meta.managerLink}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-lg text-[11px] font-bold bg-neutral-100 text-neutral-500 hover:bg-neutral-200 transition-all"
                        title="Open inventory manager"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Homepage Vertical Flow Timeline Indicator */}
        <div className="pt-2 border-t border-neutral-150">
          <div className="flex items-center gap-2 text-[11px] font-extrabold text-neutral-500 overflow-x-auto pb-1 no-scrollbar">
            <span className="shrink-0 px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-700 uppercase tracking-wider text-[10px]">
              Page Top
            </span>
            {sectionOrder.map((secId, i) => {
              const meta = SECTION_METADATA[secId];
              return (
                <React.Fragment key={secId}>
                  <ChevronRight className="w-3 h-3 text-neutral-300 shrink-0" />
                  <span
                    onClick={() => meta?.editable && setActiveTab(secId)}
                    className={`shrink-0 px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                      activeTab === secId
                        ? 'bg-[#1A384C] text-white'
                        : 'bg-neutral-50 hover:bg-orange-50 text-neutral-600 hover:text-[#FF6B16] border border-neutral-200/60'
                    }`}
                  >
                    #{i + 1} {meta?.label || secId}
                  </span>
                </React.Fragment>
              );
            })}
            <ChevronRight className="w-3 h-3 text-neutral-300 shrink-0" />
            <span className="shrink-0 px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-700 uppercase tracking-wider text-[10px]">
              Footer
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. SECTION CONTENT EDITORS (TABS) ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF6B16]" />
            <h3 className="text-sm font-black text-[#1A384C] uppercase tracking-wider">
              Edit Section Content
            </h3>
          </div>
          <span className="text-xs text-neutral-400 font-medium">
            Active: <strong className="text-[#1A384C]">{SECTION_METADATA[activeTab]?.label}</strong> (Homepage Position #{sectionOrder.indexOf(activeTab) + 1})
          </span>
        </div>

        {/* Clean, dedicated Editor Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar border-b border-neutral-200">
          {[
            { id: 'hero', label: '1. Hero Section', icon: Sparkles },
            { id: 'reels', label: '2. Travel Reels', icon: Film },
            { id: 'experiences', label: '3. Choose Experience', icon: Compass },
            { id: 'whyChooseUs', label: '4. Why Choose Us', icon: ShieldCheck },
            { id: 'bookingProcess', label: '5. Process & Welfare', icon: Handshake },
            { id: 'gallery', label: '6. Memories Gallery', icon: ImageIcon },
            { id: 'finalCta', label: '7. Ready For Adventure (CTA)', icon: Flame },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const livePos = sectionOrder.indexOf(tab.id) + 1;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all cursor-pointer border-b-2 ${
                  isActive
                    ? 'border-[#FF6B16] text-[#FF6B16] bg-orange-50/60 font-black'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#FF6B16]' : 'text-neutral-400'}`} />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                    isActive ? 'bg-[#FF6B16] text-white' : 'bg-neutral-200 text-neutral-600'
                  }`}
                  title={`Currently at position #${livePos} on homepage`}
                >
                  #{livePos}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── ACTIVE SECTION STATUS & QUICK TOGGLE BAR ── */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-3.5 h-3.5 rounded-full shrink-0 ${
            sectionVisibility[activeTab] !== false
              ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
              : 'bg-neutral-300'
          }`} />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-black text-[#1A384C]">
                {SECTION_METADATA[activeTab]?.label || activeTab}
              </h3>
              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider inline-flex items-center gap-1.5 ${
                sectionVisibility[activeTab] !== false
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-neutral-100 text-neutral-600 border-neutral-300'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sectionVisibility[activeTab] !== false ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
                {sectionVisibility[activeTab] !== false ? 'Active on Homepage' : 'Inactive (Hidden from Homepage)'}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              {sectionVisibility[activeTab] !== false
                ? 'Visitors will see this section on the live homepage.'
                : 'This section is currently disabled and hidden from visitors on the live homepage.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => handleToggleSectionVisibility(activeTab)}
            disabled={togglingSection === activeTab}
            className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              sectionVisibility[activeTab] !== false
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-800'
            } ${togglingSection === activeTab ? 'opacity-50 cursor-wait' : ''}`}
            title={sectionVisibility[activeTab] !== false ? 'Click to turn off this section' : 'Click to turn on this section'}
          >
            <span className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              sectionVisibility[activeTab] !== false ? 'bg-white/40' : 'bg-neutral-400'
            }`}>
              <span
                className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  sectionVisibility[activeTab] !== false ? 'translate-x-3' : 'translate-x-0'
                }`}
              />
            </span>
            <span>{sectionVisibility[activeTab] !== false ? 'Section Active (Click to Hide)' : 'Section Hidden (Click to Show)'}</span>
          </button>
        </div>
      </div>

      {/* ── TAB 1: HERO SECTION ── */}
      {activeTab === 'hero' && (
        <div className="space-y-6">
          {/* Live Preview Box */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-neutral-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                <Eye className="w-4 h-4 text-[#FF6B16]" /> Live Hero Preview
              </span>
              <button
                type="button"
                onClick={() => handleReset('hero')}
                className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-rose-600 font-bold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Hero to Defaults</span>
              </button>
            </div>

            {/* Simulated Hero Card */}
            <div className="relative rounded-2xl overflow-hidden min-h-[340px] p-6 sm:p-8 flex flex-col justify-center border border-neutral-200 bg-[#F7F7F5]">
              <img
                src={formatImageUrl(formData.hero?.heroImage || '/newimage/herosecction/heroimage.png')}
                alt="Preview Hero"
                className="absolute inset-0 w-full h-full object-cover object-right opacity-85 pointer-events-none"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#F7F7F5]/95 via-[#F7F7F5]/80 to-transparent pointer-events-none" />

              <div className="relative z-10 max-w-lg">
                <span className="text-[#FF6B16] font-black text-[11px] tracking-widest uppercase">
                  {formData.hero?.badge || 'EXPLORE • DISCOVER • ESCAPE'}
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-[#111111] leading-tight mt-2">
                  {formData.hero?.titleLine1 || 'Your Next'}{' '}
                  <span className="text-[#FF6B16]">{formData.hero?.titleHighlight || 'Adventure'}</span>{' '}
                  {formData.hero?.titleLine2 || 'Awaits'}
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-neutral-700 font-medium line-clamp-2">
                  {formData.hero?.subtitle || 'From majestic mountains to serene valleys...'}
                </p>
                <div className="mt-4">
                  <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-[#FF6B16] text-white text-xs font-bold shadow-md">
                    {formData.hero?.primaryButtonText || 'Explore Packages'}
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-neutral-800">
                  <span>★ {formData.hero?.socialProof?.rating || '4.9'}</span>
                  <span>{formData.hero?.socialProof?.travelersText || '500+ Happy Travelers'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Controls */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-neutral-200/80 shadow-xs space-y-6">
            <h3 className="text-base font-black text-[#1A384C] border-b pb-3">Hero Background Artwork Image</h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-4">
                <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-neutral-200 bg-neutral-100 shadow-inner">
                  <img
                    src={formatImageUrl(formData.hero?.heroImage || '/newimage/herosecction/heroimage.png')}
                    alt="Hero banner"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="md:col-span-8 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="file"
                    ref={heroImageInputRef}
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleUploadImage(file, (uploadedUrl) => {
                          setFormData({
                            ...formData,
                            hero: { ...formData.hero, heroImage: uploadedUrl },
                          });
                        });
                      }
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => heroImageInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1A384C] hover:bg-[#244b66] text-white text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    <span>Upload New Hero Image</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        hero: { ...formData.hero, heroImage: '/newimage/herosecction/heroimage.png' },
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-xs font-semibold text-neutral-700 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Image</span>
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 uppercase mb-1">
                    Or Enter Direct Image URL
                  </label>
                  <input
                    type="text"
                    value={formData.hero?.heroImage || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hero: { ...formData.hero, heroImage: e.target.value },
                      })
                    }
                    placeholder="/newimage/herosecction/heroimage.png or https://..."
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16] bg-neutral-50 font-mono"
                  />
                </div>
              </div>
            </div>

            <h3 className="text-base font-black text-[#1A384C] border-b pb-3 pt-4">Headline & Typography</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Top Eyebrow Badge</label>
                <input
                  type="text"
                  value={formData.hero?.badge || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hero: { ...formData.hero, badge: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Headline Part 1</label>
                <input
                  type="text"
                  value={formData.hero?.titleLine1 || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hero: { ...formData.hero, titleLine1: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Highlight Word <span className="text-[#FF6B16]">(Orange Accent)</span>
                </label>
                <input
                  type="text"
                  value={formData.hero?.titleHighlight || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hero: { ...formData.hero, titleHighlight: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-[#FF6B16]/50 rounded-xl focus:outline-none focus:border-[#FF6B16] font-bold text-[#FF6B16]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Headline Part 2</label>
                <input
                  type="text"
                  value={formData.hero?.titleLine2 || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hero: { ...formData.hero, titleLine2: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">CTA Button Text</label>
                <input
                  type="text"
                  value={formData.hero?.primaryButtonText || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hero: { ...formData.hero, primaryButtonText: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">CTA Button Link</label>
                <input
                  type="text"
                  value={formData.hero?.primaryButtonLink || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hero: { ...formData.hero, primaryButtonLink: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Supporting Subtitle Text</label>
              <textarea
                rows={2}
                value={formData.hero?.subtitle || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hero: { ...formData.hero, subtitle: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
              />
            </div>

            <h3 className="text-base font-black text-[#1A384C] border-b pb-3 pt-4">Social Proof & Ratings</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Happy Travelers Text</label>
                <input
                  type="text"
                  value={formData.hero?.socialProof?.travelersText || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hero: {
                        ...formData.hero,
                        socialProof: { ...formData.hero.socialProof, travelersText: e.target.value },
                      },
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Rating Score</label>
                <input
                  type="text"
                  value={formData.hero?.socialProof?.rating || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hero: {
                        ...formData.hero,
                        socialProof: { ...formData.hero.socialProof, rating: e.target.value },
                      },
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Reviews Count Text</label>
                <input
                  type="text"
                  value={formData.hero?.socialProof?.reviewsText || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hero: {
                        ...formData.hero,
                        socialProof: { ...formData.hero.socialProof, reviewsText: e.target.value },
                      },
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Avatar Stack Count</label>
                <input
                  type="text"
                  value={formData.hero?.socialProof?.badgeCount || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hero: {
                        ...formData.hero,
                        socialProof: { ...formData.hero.socialProof, badgeCount: e.target.value },
                      },
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => handleSave('hero')}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FF6B16] hover:bg-[#e05809] text-white font-bold text-sm shadow-md cursor-pointer"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Hero Section</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: TRAVEL REELS ── */}
      {activeTab === 'reels' && (
        <div>
          <ReelManager />
        </div>
      )}

      {/* ── TAB 3: CHOOSE YOUR EXPERIENCE ── */}
      {activeTab === 'experiences' && (
        <div className="space-y-6">
          {/* Live Preview Box */}
          <div className="bg-[#111111] rounded-2xl p-5 sm:p-6 border border-neutral-800 shadow-md text-white">
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                <Eye className="w-4 h-4 text-[#FF6B16]" /> Live Experiences Grid Preview
              </span>
              <button
                type="button"
                onClick={() => handleReset('experiences')}
                className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-rose-400 font-bold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Defaults</span>
              </button>
            </div>

            <div className="text-center max-w-xl mx-auto mb-6">
              <span className="text-[#FF6B16] font-bold text-[10px] tracking-widest uppercase">
                {formData.experiences?.badge || 'TRAVEL YOUR WAY'}
              </span>
              <h3 className="text-xl sm:text-2xl font-black mt-1">
                {formData.experiences?.title || 'Choose Your Experience'}
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                {formData.experiences?.subtitle || 'Every journey is unique. Find the travel style that matches you.'}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {(formData.experiences?.items || []).map((exp, idx) => {
                const Icon = getHomeIcon(exp.icon, Mountain);
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white text-[#111111] flex flex-col items-center justify-center shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#FF6B16]/10 text-[#FF6B16] flex items-center justify-center mb-1.5">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-extrabold text-center truncate w-full">{exp.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Controls */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-neutral-200/80 shadow-xs space-y-6">
            <h3 className="text-base font-black text-[#1A384C] border-b pb-3">Section Headers</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Badge Tag</label>
                <input
                  type="text"
                  value={formData.experiences?.badge || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      experiences: { ...formData.experiences, badge: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Section Title</label>
                <input
                  type="text"
                  value={formData.experiences?.title || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      experiences: { ...formData.experiences, title: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Section Subtitle</label>
              <input
                type="text"
                value={formData.experiences?.subtitle || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    experiences: { ...formData.experiences, subtitle: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
              />
            </div>

            {/* Experience Cards dynamic editor */}
            <div className="flex items-center justify-between border-b pb-3 pt-2">
              <h3 className="text-base font-black text-[#1A384C]">Experience Category Cards</h3>
              <button
                type="button"
                onClick={() => {
                  const newItems = [
                    ...(formData.experiences?.items || []),
                    {
                      id: `exp_${Date.now()}`,
                      name: 'New Style',
                      icon: 'Compass',
                      link: '/packages',
                    },
                  ];
                  setFormData({
                    ...formData,
                    experiences: { ...formData.experiences, items: newItems },
                  });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-[#FF6B16]" />
                <span>Add Category Card</span>
              </button>
            </div>

            <div className="space-y-3">
              {(formData.experiences?.items || []).map((exp, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 flex flex-col md:flex-row md:items-center gap-3"
                >
                  <span className="w-6 h-6 rounded-full bg-neutral-200 text-neutral-700 text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-0.5">Name</label>
                      <input
                        type="text"
                        value={exp.name || ''}
                        onChange={(e) => {
                          const updated = [...formData.experiences.items];
                          updated[idx].name = e.target.value;
                          setFormData({
                            ...formData,
                            experiences: { ...formData.experiences, items: updated },
                          });
                        }}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-[#FF6B16]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-0.5">Icon</label>
                      <select
                        value={exp.icon || 'Mountain'}
                        onChange={(e) => {
                          const updated = [...formData.experiences.items];
                          updated[idx].icon = e.target.value;
                          setFormData({
                            ...formData,
                            experiences: { ...formData.experiences, items: updated },
                          });
                        }}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-[#FF6B16]"
                      >
                        {AVAILABLE_ICON_OPTIONS.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-0.5">Link Path</label>
                      <input
                        type="text"
                        value={exp.link || ''}
                        onChange={(e) => {
                          const updated = [...formData.experiences.items];
                          updated[idx].link = e.target.value;
                          setFormData({
                            ...formData,
                            experiences: { ...formData.experiences, items: updated },
                          });
                        }}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-[#FF6B16]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 self-end md:self-center">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => {
                        const updated = [...formData.experiences.items];
                        const temp = updated[idx];
                        updated[idx] = updated[idx - 1];
                        updated[idx - 1] = temp;
                        setFormData({
                          ...formData,
                          experiences: { ...formData.experiences, items: updated },
                        });
                      }}
                      className="p-1.5 text-neutral-500 hover:text-neutral-900 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === formData.experiences.items.length - 1}
                      onClick={() => {
                        const updated = [...formData.experiences.items];
                        const temp = updated[idx];
                        updated[idx] = updated[idx + 1];
                        updated[idx + 1] = temp;
                        setFormData({
                          ...formData,
                          experiences: { ...formData.experiences, items: updated },
                        });
                      }}
                      className="p-1.5 text-neutral-500 hover:text-neutral-900 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = formData.experiences.items.filter((_, i) => i !== idx);
                        setFormData({
                          ...formData,
                          experiences: { ...formData.experiences, items: updated },
                        });
                      }}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => handleSave('experiences')}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FF6B16] hover:bg-[#e05809] text-white font-bold text-sm shadow-md cursor-pointer"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Experiences Section</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: WHY CHOOSE US ── */}
      {activeTab === 'whyChooseUs' && (
        <div className="space-y-6">
          {/* Live Preview Box */}
          <div className="bg-[#111111] rounded-2xl p-5 sm:p-6 border border-neutral-800 shadow-md text-white">
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                <Eye className="w-4 h-4 text-[#FF6B16]" /> Live Why Choose Us Preview
              </span>
              <button
                type="button"
                onClick={() => handleReset('whyChooseUs')}
                className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-rose-400 font-bold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Defaults</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8">
                <span className="text-[#FF6B16] font-bold text-[10px] tracking-widest uppercase">
                  {formData.whyChooseUs?.badge || 'WHY CHOOSE WEEKEND ESCAPES'}
                </span>
                <h3 className="text-xl sm:text-2xl font-black mt-1">
                  {formData.whyChooseUs?.title || 'More Than Just A Trip'}
                </h3>
                <p className="text-xs text-neutral-400 mt-1 max-w-lg">
                  {formData.whyChooseUs?.subtitle || 'We create meaningful travel experiences with care...'}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  {(formData.whyChooseUs?.benefits || []).map((b, idx) => {
                    const Icon = getHomeIcon(b.icon, Mountain);
                    return (
                      <div key={idx} className="flex flex-col items-start gap-1">
                        <div className="w-8 h-8 rounded-full border border-[#FF6B16] text-[#FF6B16] flex items-center justify-center">
                          <Icon className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-black text-white">{b.title}</h4>
                        <p className="text-[10px] text-neutral-400 leading-snug">{b.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-4 relative flex justify-center">
                <div className="relative w-48 aspect-[4/3] rounded-xl overflow-hidden border-2 border-white/20 shadow-lg">
                  <img
                    src={formatImageUrl(formData.whyChooseUs?.image || '/newimage/other sections image/image1.png')}
                    alt="Torn Photo Preview"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2 right-2 text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded rotate-[-6deg]">
                    {formData.whyChooseUs?.handwrittenNote || 'Travel even\nRepeat'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Controls */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-neutral-200/80 shadow-xs space-y-6">
            <h3 className="text-base font-black text-[#1A384C] border-b pb-3">Torn Photo Right Image</h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-4">
                <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-neutral-200 bg-neutral-100 shadow-inner">
                  <img
                    src={formatImageUrl(formData.whyChooseUs?.image || '/newimage/other sections image/image1.png')}
                    alt="Torn banner preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="md:col-span-8 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="file"
                    ref={whyChooseImageInputRef}
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleUploadImage(file, (uploadedUrl) => {
                          setFormData({
                            ...formData,
                            whyChooseUs: { ...formData.whyChooseUs, image: uploadedUrl },
                          });
                        });
                      }
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => whyChooseImageInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1A384C] hover:bg-[#244b66] text-white text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    <span>Upload New Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        whyChooseUs: {
                          ...formData.whyChooseUs,
                          image: '/newimage/other sections image/image1.png',
                        },
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-xs font-semibold text-neutral-700 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Image</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-500 uppercase mb-1">
                      Direct Photo URL
                    </label>
                    <input
                      type="text"
                      value={formData.whyChooseUs?.image || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          whyChooseUs: { ...formData.whyChooseUs, image: e.target.value },
                        })
                      }
                      placeholder="/newimage/... or https://..."
                      className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16] bg-neutral-50 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-500 uppercase mb-1">
                      Handwritten Note Overlay
                    </label>
                    <input
                      type="text"
                      value={formData.whyChooseUs?.handwrittenNote || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          whyChooseUs: { ...formData.whyChooseUs, handwrittenNote: e.target.value },
                        })
                      }
                      placeholder="Travel even\nRepeat"
                      className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16] font-handwriting"
                    />
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-base font-black text-[#1A384C] border-b pb-3 pt-4">Headers & 4 Core Benefits</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Badge Tag</label>
                <input
                  type="text"
                  value={formData.whyChooseUs?.badge || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      whyChooseUs: { ...formData.whyChooseUs, badge: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Section Title</label>
                <input
                  type="text"
                  value={formData.whyChooseUs?.title || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      whyChooseUs: { ...formData.whyChooseUs, title: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Subtitle</label>
              <textarea
                rows={2}
                value={formData.whyChooseUs?.subtitle || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    whyChooseUs: { ...formData.whyChooseUs, subtitle: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {(formData.whyChooseUs?.benefits || []).map((b, idx) => (
                <div key={idx} className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-500 uppercase">Benefit #{idx + 1}</span>
                    <select
                      value={b.icon || 'Mountain'}
                      onChange={(e) => {
                        const updated = [...formData.whyChooseUs.benefits];
                        updated[idx].icon = e.target.value;
                        setFormData({
                          ...formData,
                          whyChooseUs: { ...formData.whyChooseUs, benefits: updated },
                        });
                      }}
                      className="px-2 py-1 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-[#FF6B16]"
                    >
                      {AVAILABLE_ICON_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <input
                    type="text"
                    value={b.title || ''}
                    placeholder="Benefit Title"
                    onChange={(e) => {
                      const updated = [...formData.whyChooseUs.benefits];
                      updated[idx].title = e.target.value;
                      setFormData({
                        ...formData,
                        whyChooseUs: { ...formData.whyChooseUs, benefits: updated },
                      });
                    }}
                    className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-[#FF6B16]"
                  />

                  <textarea
                    rows={2}
                    value={b.desc || ''}
                    placeholder="Description"
                    onChange={(e) => {
                      const updated = [...formData.whyChooseUs.benefits];
                      updated[idx].desc = e.target.value;
                      setFormData({
                        ...formData,
                        whyChooseUs: { ...formData.whyChooseUs, benefits: updated },
                      });
                    }}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-[#FF6B16]"
                  />
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => handleSave('whyChooseUs')}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FF6B16] hover:bg-[#e05809] text-white font-bold text-sm shadow-md cursor-pointer"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Why Choose Us</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: BOOKING PROCESS & WELFARE ── */}
      {activeTab === 'bookingProcess' && (
        <div className="space-y-6">
          {/* Live Preview Box */}
          <div className="bg-[#FAFAF8] rounded-2xl p-5 sm:p-6 border border-neutral-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                <Eye className="w-4 h-4 text-[#FF6B16]" /> Live Process Timeline Preview
              </span>
              <button
                type="button"
                onClick={() => handleReset('bookingProcess')}
                className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-rose-600 font-bold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Defaults</span>
              </button>
            </div>

            <div className="text-center max-w-xl mx-auto mb-6">
              <span className="text-[#FF6B16] font-bold text-[10px] tracking-widest uppercase">
                {formData.bookingProcess?.badge || 'OUR PROCESS'}
              </span>
              <h3 className="text-xl sm:text-2xl font-black mt-1 text-[#111111]">
                {formData.bookingProcess?.title || 'From Dream to Destination.'}
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                {formData.bookingProcess?.subtitle || 'One continuous journey...'}
              </p>
            </div>

            {/* 4 Steps preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(formData.bookingProcess?.steps || []).map((s, idx) => (
                <div key={idx} className="p-3.5 bg-white rounded-xl border border-neutral-200 shadow-xs relative">
                  <span className="text-[10px] font-bold text-[#FF6B16] uppercase block">{s.tagline}</span>
                  <h4 className="text-sm font-black text-[#111111] mt-0.5">{s.title}</h4>
                  <p className="text-[11px] text-neutral-600 mt-1 line-clamp-2">{s.desc}</p>
                  <span className="absolute top-2 right-2 text-2xl font-black text-neutral-200">
                    {s.stepNumber || `0${idx + 1}`}
                  </span>
                </div>
              ))}
            </div>

            {/* Welfare Banner preview */}
            <div className="mt-5 p-4 rounded-xl bg-orange-50/70 border border-orange-200 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#FF6B16] text-white flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5 fill-white" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-[#FF6B16] bg-white px-2 py-0.5 rounded-full border border-orange-200">
                  {formData.bookingProcess?.welfare?.badge || 'Every Booking Gives Back'}
                </span>
                <h4 className="text-xs sm:text-sm font-black text-[#111111] mt-1">
                  {formData.bookingProcess?.welfare?.title || 'A Part of Your Trip Cost is Donated'}
                </h4>
              </div>
            </div>
          </div>

          {/* Form Controls */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-neutral-200/80 shadow-xs space-y-6">
            <h3 className="text-base font-black text-[#1A384C] border-b pb-3">Process Section Header</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Process Badge</label>
                <input
                  type="text"
                  value={formData.bookingProcess?.badge || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bookingProcess: { ...formData.bookingProcess, badge: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Process Title</label>
                <input
                  type="text"
                  value={formData.bookingProcess?.title || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bookingProcess: { ...formData.bookingProcess, title: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Process Subtitle</label>
              <textarea
                rows={2}
                value={formData.bookingProcess?.subtitle || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bookingProcess: { ...formData.bookingProcess, subtitle: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
              />
            </div>

            <h3 className="text-base font-black text-[#1A384C] border-b pb-3 pt-4">4 Continuous Timeline Steps</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(formData.bookingProcess?.steps || []).map((step, idx) => (
                <div key={idx} className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-neutral-700">Step {idx + 1}</span>
                    <select
                      value={step.icon || 'Compass'}
                      onChange={(e) => {
                        const updated = [...formData.bookingProcess.steps];
                        updated[idx].icon = e.target.value;
                        setFormData({
                          ...formData,
                          bookingProcess: { ...formData.bookingProcess, steps: updated },
                        });
                      }}
                      className="px-2 py-1 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-[#FF6B16]"
                    >
                      {AVAILABLE_ICON_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase">Number</label>
                      <input
                        type="text"
                        value={step.stepNumber || ''}
                        onChange={(e) => {
                          const updated = [...formData.bookingProcess.steps];
                          updated[idx].stepNumber = e.target.value;
                          setFormData({
                            ...formData,
                            bookingProcess: { ...formData.bookingProcess, steps: updated },
                          });
                        }}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-[#FF6B16]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase">Tagline</label>
                      <input
                        type="text"
                        value={step.tagline || ''}
                        onChange={(e) => {
                          const updated = [...formData.bookingProcess.steps];
                          updated[idx].tagline = e.target.value;
                          setFormData({
                            ...formData,
                            bookingProcess: { ...formData.bookingProcess, steps: updated },
                          });
                        }}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-[#FF6B16]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase">Title</label>
                    <input
                      type="text"
                      value={step.title || ''}
                      onChange={(e) => {
                        const updated = [...formData.bookingProcess.steps];
                        updated[idx].title = e.target.value;
                        setFormData({
                          ...formData,
                          bookingProcess: { ...formData.bookingProcess, steps: updated },
                        });
                      }}
                      className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-[#FF6B16]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase">Description</label>
                    <textarea
                      rows={2}
                      value={step.desc || ''}
                      onChange={(e) => {
                        const updated = [...formData.bookingProcess.steps];
                        updated[idx].desc = e.target.value;
                        setFormData({
                          ...formData,
                          bookingProcess: { ...formData.bookingProcess, steps: updated },
                        });
                      }}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-[#FF6B16]"
                    />
                  </div>
                </div>
              ))}
            </div>

            <h3 className="text-base font-black text-[#1A384C] border-b pb-3 pt-4">
              Welfare / Purpose Box ("Every Booking Gives Back")
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Welfare Badge Text</label>
                <input
                  type="text"
                  value={formData.bookingProcess?.welfare?.badge || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bookingProcess: {
                        ...formData.bookingProcess,
                        welfare: { ...formData.bookingProcess.welfare, badge: e.target.value },
                      },
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Tagline</label>
                <input
                  type="text"
                  value={formData.bookingProcess?.welfare?.tagline || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bookingProcess: {
                        ...formData.bookingProcess,
                        welfare: { ...formData.bookingProcess.welfare, tagline: e.target.value },
                      },
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Welfare Headline</label>
              <input
                type="text"
                value={formData.bookingProcess?.welfare?.title || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bookingProcess: {
                      ...formData.bookingProcess,
                      welfare: { ...formData.bookingProcess.welfare, title: e.target.value },
                    },
                  })
                }
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Welfare Description</label>
              <textarea
                rows={2}
                value={formData.bookingProcess?.welfare?.description || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bookingProcess: {
                      ...formData.bookingProcess,
                      welfare: { ...formData.bookingProcess.welfare, description: e.target.value },
                    },
                  })
                }
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(formData.bookingProcess?.welfare?.items || []).map((wItem, idx) => (
                <div key={idx} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase block">Impact Card #{idx + 1}</span>
                  <input
                    type="text"
                    value={wItem.title || ''}
                    placeholder="Title"
                    onChange={(e) => {
                      const updated = [...formData.bookingProcess.welfare.items];
                      updated[idx].title = e.target.value;
                      setFormData({
                        ...formData,
                        bookingProcess: {
                          ...formData.bookingProcess,
                          welfare: { ...formData.bookingProcess.welfare, items: updated },
                        },
                      });
                    }}
                    className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-[#FF6B16]"
                  />
                  <textarea
                    rows={2}
                    value={wItem.desc || ''}
                    placeholder="Short description"
                    onChange={(e) => {
                      const updated = [...formData.bookingProcess.welfare.items];
                      updated[idx].desc = e.target.value;
                      setFormData({
                        ...formData,
                        bookingProcess: {
                          ...formData.bookingProcess,
                          welfare: { ...formData.bookingProcess.welfare, items: updated },
                        },
                      });
                    }}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-[#FF6B16]"
                  />
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => handleSave('bookingProcess')}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FF6B16] hover:bg-[#e05809] text-white font-bold text-sm shadow-md cursor-pointer"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Process & Welfare</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: READY FOR ADVENTURE (FINAL CTA) ── */}
      {activeTab === 'finalCta' && (
        <div className="space-y-6">
          {/* Live Preview Box */}
          <div className="bg-[#111111] rounded-2xl p-5 sm:p-6 border border-neutral-800 shadow-md text-white">
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                <Eye className="w-4 h-4 text-[#FF6B16]" /> Live Final CTA Banner Preview
              </span>
              <button
                type="button"
                onClick={() => handleReset('finalCta')}
                className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-rose-400 font-bold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Defaults</span>
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden p-6 sm:p-8 flex flex-col items-center text-center">
              <img
                src={formatImageUrl(
                  formData.finalCta?.bgImage || '/newimage/other sections image/footerbanner2.png'
                )}
                alt="Banner preview"
                className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
              />
              <div className="absolute inset-0 bg-black/40" />

              <div className="relative z-10 max-w-xl mx-auto">
                <h3 className="text-xl sm:text-3xl font-black text-white leading-tight">
                  {formData.finalCta?.heading || 'Ready for Your Next Adventure?'}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-neutral-300">
                  {formData.finalCta?.subtitle || "Let's turn your travel dreams into unforgettable memories..."}
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                  <span className="px-5 py-2 rounded-full bg-[#FF6B16] text-white text-xs font-bold shadow-md">
                    {formData.finalCta?.primaryButtonText || 'Explore Packages'} →
                  </span>
                  <span className="px-5 py-2 rounded-full bg-black/60 border border-white/40 text-white text-xs font-bold flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                    {formData.finalCta?.whatsappButtonText || 'Talk on WhatsApp'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Controls */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-neutral-200/80 shadow-xs space-y-6">
            <h3 className="text-base font-black text-[#1A384C] border-b pb-3">Sunset Panorama Background Image</h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-4">
                <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-neutral-200 bg-neutral-100 shadow-inner">
                  <img
                    src={formatImageUrl(
                      formData.finalCta?.bgImage || '/newimage/other sections image/footerbanner2.png'
                    )}
                    alt="CTA banner"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="md:col-span-8 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="file"
                    ref={finalCtaImageInputRef}
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleUploadImage(file, (uploadedUrl) => {
                          setFormData({
                            ...formData,
                            finalCta: { ...formData.finalCta, bgImage: uploadedUrl },
                          });
                        });
                      }
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => finalCtaImageInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1A384C] hover:bg-[#244b66] text-white text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    <span>Upload New Banner Image</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        finalCta: {
                          ...formData.finalCta,
                          bgImage: '/newimage/other sections image/footerbanner2.png',
                        },
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-xs font-semibold text-neutral-700 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Image</span>
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 uppercase mb-1">
                    Direct Image URL
                  </label>
                  <input
                    type="text"
                    value={formData.finalCta?.bgImage || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        finalCta: { ...formData.finalCta, bgImage: e.target.value },
                      })
                    }
                    placeholder="/newimage/... or https://..."
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16] bg-neutral-50 font-mono"
                  />
                </div>
              </div>
            </div>

            <h3 className="text-base font-black text-[#1A384C] border-b pb-3 pt-4">Headline & Buttons</h3>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">CTA Headline</label>
              <input
                type="text"
                value={formData.finalCta?.heading || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    finalCta: { ...formData.finalCta, heading: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">CTA Subtitle</label>
              <textarea
                rows={2}
                value={formData.finalCta?.subtitle || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    finalCta: { ...formData.finalCta, subtitle: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Plan Button Text</label>
                <input
                  type="text"
                  value={formData.finalCta?.primaryButtonText || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      finalCta: { ...formData.finalCta, primaryButtonText: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Plan Button Link</label>
                <input
                  type="text"
                  value={formData.finalCta?.primaryButtonLink || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      finalCta: { ...formData.finalCta, primaryButtonLink: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">WhatsApp Button Text</label>
                <input
                  type="text"
                  value={formData.finalCta?.whatsappButtonText || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      finalCta: { ...formData.finalCta, whatsappButtonText: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Custom WhatsApp URL (Leave empty for default WhatsApp)
                </label>
                <input
                  type="text"
                  value={formData.finalCta?.whatsappUrl || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      finalCta: { ...formData.finalCta, whatsappUrl: e.target.value },
                    })
                  }
                  placeholder="https://wa.me/..."
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => handleSave('finalCta')}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FF6B16] hover:bg-[#e05809] text-white font-bold text-sm shadow-md cursor-pointer"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Final CTA Banner</span>
              </button>
            </div>
          </div>
        </div>
      )}

      
      {/* ── 7. MEMORIES GALLERY SECTION EDITOR ── */}
      {activeTab === 'gallery' && (
        <div className="bg-white rounded-2xl p-5 sm:p-7 border border-neutral-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-150 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#FF6B16]" />
                <h2 className="text-lg font-black text-[#1A384C]">
                  Moments From Our Trips (Memories Gallery)
                </h2>
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Customize the snapshots strip, section headlines, and destination tags rendered on your homepage.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleReset('gallery')}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Default</span>
              </button>
              <button
                type="button"
                onClick={() => handleSave('gallery')}
                disabled={saving || uploadingImage}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#FF6B16] hover:bg-[#e05809] text-white text-xs font-bold transition-all shadow-md shadow-[#FF6B16]/25 cursor-pointer disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Gallery</span>
              </button>
            </div>
          </div>

          {/* Section Headers & CTA Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-[#1A384C] uppercase tracking-wider text-neutral-400">
              1. Section Header & Actions
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Eyebrow Tag
                </label>
                <input
                  type="text"
                  value={formData.gallery?.eyebrow || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gallery: { ...formData.gallery, eyebrow: e.target.value },
                    })
                  }
                  placeholder="Memories For A Lifetime"
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Section Title
                </label>
                <input
                  type="text"
                  value={formData.gallery?.title || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gallery: { ...formData.gallery, title: e.target.value },
                    })
                  }
                  placeholder="Moments From Our Trips"
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Snapshots Subtitle Label
                </label>
                <input
                  type="text"
                  value={formData.gallery?.snapshotsLabel || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gallery: { ...formData.gallery, snapshotsLabel: e.target.value },
                    })
                  }
                  placeholder="Captured Snapshots"
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Button Text
                </label>
                <input
                  type="text"
                  value={formData.gallery?.buttonText || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gallery: { ...formData.gallery, buttonText: e.target.value },
                    })
                  }
                  placeholder="View Gallery"
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Button Link Target
                </label>
                <input
                  type="text"
                  value={formData.gallery?.buttonLink || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gallery: { ...formData.gallery, buttonLink: e.target.value },
                    })
                  }
                  placeholder="/about#gallery"
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Subtitle Description
              </label>
              <textarea
                rows={2}
                value={formData.gallery?.subtitle || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    gallery: { ...formData.gallery, subtitle: e.target.value },
                  })
                }
                placeholder="Real people. Real adventures. Real memories."
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-[#FF6B16]"
              />
            </div>
          </div>

          {/* Snapshot Photos Cards Editor (6 Fixed Slots Matching UI) */}
          <div className="space-y-4 pt-3 border-t border-neutral-150">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-[#1A384C]">
                    Homepage Snapshot Photos (6 Photos)
                  </h3>
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-orange-100 text-[#FF6B16]">
                    6 Slots Fixed
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Change any of the 6 trip photos displayed in the homepage snapshot row. Replace images, edit captions, tags, and locations.
                </p>
              </div>
            </div>

            {/* List of 6 Photo Cards */}
            <div className="space-y-3.5">
              {ensureSixGalleryItems(formData.gallery?.items).map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80 flex flex-col md:flex-row gap-4 items-start md:items-center"
                >
                  {/* Photo Slot Badge & Preview */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#FF6B16] font-black text-xs flex items-center justify-center shrink-0 border border-orange-200">
                      #{idx + 1}
                    </div>
                    <div className="relative w-28 sm:w-32 aspect-[4/3] rounded-xl overflow-hidden bg-neutral-900 border border-neutral-300 shrink-0 group">
                      <img
                        src={formatImageUrl(item.image)}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white text-[11px] font-bold p-1 text-center">
                        <Upload className="w-4 h-4 mb-1 text-[#FF6B16]" />
                        <span>Change Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleUploadImage(file, (url) => {
                                const currentList = ensureSixGalleryItems(formData.gallery?.items);
                                const updated = [...currentList];
                                updated[idx] = { ...updated[idx], image: url };
                                setFormData({
                                  ...formData,
                                  gallery: { ...formData.gallery, items: updated },
                                });
                              });
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Photo Details Inputs */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-0.5">
                        Title / Caption
                      </label>
                      <input
                        type="text"
                        value={item.title || ''}
                        onChange={(e) => {
                          const currentList = ensureSixGalleryItems(formData.gallery?.items);
                          const updated = [...currentList];
                          updated[idx] = { ...updated[idx], title: e.target.value };
                          setFormData({
                            ...formData,
                            gallery: { ...formData.gallery, items: updated },
                          });
                        }}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-[#FF6B16]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-0.5">
                        Category Tag
                      </label>
                      <input
                        type="text"
                        value={item.category || ''}
                        onChange={(e) => {
                          const currentList = ensureSixGalleryItems(formData.gallery?.items);
                          const updated = [...currentList];
                          updated[idx] = { ...updated[idx], category: e.target.value };
                          setFormData({
                            ...formData,
                            gallery: { ...formData.gallery, items: updated },
                          });
                        }}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-[#FF6B16]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-0.5">
                        Location Details
                      </label>
                      <input
                        type="text"
                        value={item.location || ''}
                        onChange={(e) => {
                          const currentList = ensureSixGalleryItems(formData.gallery?.items);
                          const updated = [...currentList];
                          updated[idx] = { ...updated[idx], location: e.target.value };
                          setFormData({
                            ...formData,
                            gallery: { ...formData.gallery, items: updated },
                          });
                        }}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-[#FF6B16]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-0.5">
                        Image URL / Cloudinary
                      </label>
                      <input
                        type="text"
                        value={item.image || ''}
                        onChange={(e) => {
                          const currentList = ensureSixGalleryItems(formData.gallery?.items);
                          const updated = [...currentList];
                          updated[idx] = { ...updated[idx], image: e.target.value };
                          setFormData({
                            ...formData,
                            gallery: { ...formData.gallery, items: updated },
                          });
                        }}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-[#FF6B16]"
                      />
                    </div>
                  </div>

                  {/* Actions (Reorder Photo Slots) */}
                  <div className="flex items-center gap-1 shrink-0 self-end md:self-center">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => {
                        const currentList = ensureSixGalleryItems(formData.gallery?.items);
                        const updated = [...currentList];
                        const temp = updated[idx];
                        updated[idx] = updated[idx - 1];
                        updated[idx - 1] = temp;
                        setFormData({
                          ...formData,
                          gallery: { ...formData.gallery, items: updated },
                        });
                      }}
                      className="p-1.5 text-neutral-500 hover:text-neutral-900 disabled:opacity-30 cursor-pointer"
                      title="Move photo left"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === 5}
                      onClick={() => {
                        const currentList = ensureSixGalleryItems(formData.gallery?.items);
                        const updated = [...currentList];
                        const temp = updated[idx];
                        updated[idx] = updated[idx + 1];
                        updated[idx + 1] = temp;
                        setFormData({
                          ...formData,
                          gallery: { ...formData.gallery, items: updated },
                        });
                      }}
                      className="p-1.5 text-neutral-500 hover:text-neutral-900 disabled:opacity-30 cursor-pointer"
                      title="Move photo right"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Save Bar */}
          <div className="pt-4 border-t border-neutral-150 flex items-center justify-between">
            <span className="text-xs text-neutral-500">
              Changes will immediately reflect on the live homepage.
            </span>
            <button
              type="button"
              onClick={() => handleSave('gallery')}
              disabled={saving || uploadingImage}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FF6B16] hover:bg-[#e05809] text-white text-xs font-bold transition-all shadow-md shadow-[#FF6B16]/30 cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Memories Gallery</span>
            </button>
          </div>
        </div>
      )}

      {/* ── INFO TABS FOR INVENTORY-DRIVEN SECTIONS ── */}
      {['packages', 'testimonials', 'blogs'].includes(activeTab) && (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200/80 shadow-xs max-w-2xl mx-auto text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 text-[#FF6B16] flex items-center justify-center mx-auto shadow-xs">
            {activeTab === 'packages' && <Mountain className="w-8 h-8" />}
            {activeTab === 'testimonials' && <Star className="w-8 h-8" />}
                        {activeTab === 'blogs' && <ExternalLink className="w-8 h-8" />}
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF6B16] bg-orange-100/70 px-3 py-1 rounded-full">
              Homepage Position #{sectionOrder.indexOf(activeTab) + 1}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#1A384C] mt-3">
              {SECTION_METADATA[activeTab]?.label}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1.5 max-w-md mx-auto">
              This section is rendered at position <strong>#{sectionOrder.indexOf(activeTab) + 1}</strong> on your live website. Drag and drop its tab above to change where it appears on the homepage.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-xs text-neutral-600 text-left space-y-1.5 max-w-md mx-auto">
            <p className="font-bold text-neutral-800">Dynamic Content Source:</p>
            <p className="text-neutral-500">
              {activeTab === 'packages' && 'Displays your active tour packages and expedition itineraries.'}
              {activeTab === 'testimonials' && 'Displays verified traveler reviews, ratings, and quotes.'}
                            {activeTab === 'blogs' && 'Displays your published travel guide articles and stories.'}
            </p>
          </div>

          <div className="pt-2">
            <a
              href={SECTION_METADATA[activeTab]?.managerLink}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A384C] hover:bg-[#254d66] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <span>Open {SECTION_METADATA[activeTab]?.label} Manager</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
