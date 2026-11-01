import React, { useState, useEffect } from 'react';
import {
  FileText,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Loader2,
  Layers,
  Calendar,
  Sparkles,
  Palette,
  Eye,
  Type,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

const PRESET_BG_COLORS = [
  { name: 'Warm Ivory (Default)', value: '#F8F8F2' },
  { name: 'Clean White', value: '#FFFFFF' },
  { name: 'Soft Gray', value: '#F8FAFC' },
  { name: 'Warm Cream', value: '#FFFBF5' },
  { name: 'Soft Orange', value: '#FFF7ED' },
  { name: 'Deep Navy', value: '#1A384C' },
];

const PRESET_TEXT_COLORS = [
  { name: 'Charcoal Dark (Default)', value: '#1F2432' },
  { name: 'Deep Navy', value: '#1A384C' },
  { name: 'Neutral Gray', value: '#475569' },
  { name: 'Pure White', value: '#FFFFFF' },
  { name: 'Brand Orange', value: '#FF6B16' },
];

export default function PagesManager({ initialSlug = 'terms-and-conditions' }) {
  const { token } = useAuth();
  const { API_BASE_URL } = useSettings();

  const [activeSlug, setActiveSlug] = useState(initialSlug);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Sync activeSlug if initialSlug prop changes from sidebar navigation
  useEffect(() => {
    if (initialSlug && initialSlug !== activeSlug) {
      setActiveSlug(initialSlug);
    }
  }, [initialSlug]);

  // Page Header state (Fully Dynamic)
  const [pageTitle, setPageTitle] = useState('Terms & Conditions');
  const [subtitle, setSubtitle] = useState(
    'Please review our expedition guidelines, booking rules, and adventure travel policies.'
  );
  const [badge, setBadge] = useState('Legal & Policies');
  const [headerBgColor, setHeaderBgColor] = useState('#F8F8F2');
  const [headerTextColor, setHeaderTextColor] = useState('#1F2432');
  const [showLastUpdated, setShowLastUpdated] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('March 22, 2026');

  // Sections state
  const [sections, setSections] = useState([]);

  // Fetch page data on mount or slug change
  const fetchPage = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/pages/${activeSlug}`);
      const data = await res.json();
      if (data.success && data.page) {
        setPageTitle(data.page.title || 'Terms & Conditions');
        setSubtitle(
          data.page.subtitle !== undefined
            ? data.page.subtitle
            : 'Please review our expedition guidelines, booking rules, and adventure travel policies.'
        );
        setBadge(data.page.badge !== undefined ? data.page.badge : 'Legal & Policies');
        setHeaderBgColor(data.page.headerBgColor || '#F8F8F2');
        setHeaderTextColor(data.page.headerTextColor || '#1F2432');
        setShowLastUpdated(
          data.page.showLastUpdated !== undefined ? data.page.showLastUpdated : true
        );
        setLastUpdated(data.page.lastUpdated || 'March 22, 2026');
        setSections(
          Array.isArray(data.page.sections)
            ? data.page.sections.map((s, idx) => ({
                id: s.id || `sec_${Date.now()}_${idx}`,
                title: s.title || '',
                content: s.content || '',
                items: Array.isArray(s.items) ? [...s.items] : [],
                order: s.order !== undefined ? s.order : idx + 1,
              }))
            : []
        );
      }
    } catch (err) {
      console.error('Failed to load page data:', err);
      setStatusMessage({
        type: 'error',
        text: 'Could not connect to server. Displaying cached template.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage();
  }, [activeSlug]);

  // Set last updated to today's formatted date
  const handleSetToday = () => {
    const today = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    setLastUpdated(today);
  };

  // Convert date picker value to formatted text
  const handleDatePickerChange = (e) => {
    if (!e.target.value) return;
    const parts = e.target.value.split('-');
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      const formatted = d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      setLastUpdated(formatted);
    }
  };

  // Save changes
  const handleSave = async () => {
    try {
      setSaving(true);
      setStatusMessage({ type: '', text: '' });

      const cleanedSections = sections.map((sec, idx) => ({
        id: sec.id || `sec_${Date.now()}_${idx}`,
        title: sec.title.trim(),
        content: sec.content || '',
        items: (sec.items || []).filter((item) => item.trim().length > 0),
        order: idx + 1,
      }));

      const res = await fetch(`${API_BASE_URL}/pages/${activeSlug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: pageTitle,
          subtitle,
          badge,
          headerBgColor,
          headerTextColor,
          showLastUpdated,
          lastUpdated,
          sections: cleanedSections,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: 'Terms & Conditions header & sections saved successfully to database! Live page is updated.',
        });
        if (data.page?.sections) {
          setSections(data.page.sections);
        }
      } else {
        throw new Error(data.message || 'Failed to save');
      }
    } catch (err) {
      console.error('Save error:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Error updating page. Please check your credentials.',
      });
    } finally {
      setSaving(false);
    }
  };

  // Reset to default
  const handleReset = async () => {
    if (
      !window.confirm(
        'Are you sure you want to restore the default Terms & Conditions template? Any custom edits will be replaced.'
      )
    ) {
      return;
    }

    try {
      setSaving(true);
      setStatusMessage({ type: '', text: '' });

      const res = await fetch(`${API_BASE_URL}/pages/${activeSlug}/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json();
      if (data.success && data.page) {
        setPageTitle(data.page.title);
        setSubtitle(data.page.subtitle || '');
        setBadge(data.page.badge || '');
        setHeaderBgColor(data.page.headerBgColor || '#F8F8F2');
        setHeaderTextColor(data.page.headerTextColor || '#1F2432');
        setShowLastUpdated(
          data.page.showLastUpdated !== undefined ? data.page.showLastUpdated : true
        );
        setLastUpdated(data.page.lastUpdated);
        setSections(data.page.sections);
        setStatusMessage({
          type: 'success',
          text: 'Restored default Terms & Conditions template successfully!',
        });
      } else {
        throw new Error(data.message || 'Reset failed');
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to reset page to defaults.',
      });
    } finally {
      setSaving(false);
    }
  };

  // Section manipulation
  const handleAddSection = () => {
    const newSection = {
      id: `sec_${Date.now()}`,
      title: 'New Section Title',
      content: '',
      items: ['Add bullet item details here...'],
      order: sections.length + 1,
    };
    setSections([...sections, newSection]);
  };

  const handleUpdateSectionTitle = (index, value) => {
    const updated = [...sections];
    updated[index].title = value;
    setSections(updated);
  };

  const handleUpdateSectionContent = (index, value) => {
    const updated = [...sections];
    updated[index].content = value;
    setSections(updated);
  };

  const handleDeleteSection = (index) => {
    if (window.confirm(`Delete section "${sections[index].title || 'Untitled'}"?`)) {
      const updated = sections.filter((_, i) => i !== index);
      setSections(updated);
    }
  };

  const handleMoveSection = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;
    const updated = [...sections];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);
    setSections(updated);
  };

  // Bullet manipulation
  const handleAddBullet = (sectionIndex) => {
    const updated = [...sections];
    if (!Array.isArray(updated[sectionIndex].items)) {
      updated[sectionIndex].items = [];
    }
    updated[sectionIndex].items.push('');
    setSections(updated);
  };

  const handleUpdateBullet = (sectionIndex, bulletIndex, value) => {
    const updated = [...sections];
    updated[sectionIndex].items[bulletIndex] = value;
    setSections(updated);
  };

  const handleDeleteBullet = (sectionIndex, bulletIndex) => {
    const updated = [...sections];
    updated[sectionIndex].items.splice(bulletIndex, 1);
    setSections(updated);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-12 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF6B16] mb-3" />
        <p className="text-sm font-semibold text-neutral-500">Loading page content from database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Top Bar / Sub Navigation ── */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-orange-50 text-[#FF6B16]">
                <FileText className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-extrabold text-[#1A384C]">
                Pages Management
              </h1>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Create, edit, and organize dynamic content sections for your legal &amp; policy pages.
            </p>
          </div>

          {/* Quick Page Selector Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveSlug('terms-and-conditions')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSlug === 'terms-and-conditions'
                  ? 'bg-[#1A384C] text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <span>Terms &amp; Conditions</span>
              <span className="text-[10px] bg-[#FF6B16] text-white px-1.5 py-0.5 rounded-full font-bold">
                Live
              </span>
            </button>

            <button
              onClick={() => setActiveSlug('cancellation-policy')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSlug === 'cancellation-policy'
                  ? 'bg-[#1A384C] text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <span>Cancellation &amp; Refund Policy</span>
              <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-full font-bold">
                Live
              </span>
            </button>
          </div>
        </div>

        {/* Action Controls Banner */}
        <div className="mt-6 pt-5 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <a
              href={activeSlug === 'cancellation-policy' ? '/cancellation-policy' : '/terms'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Preview Live {activeSlug === 'cancellation-policy' ? 'Cancellation' : 'Terms'} Page</span>
            </a>

            <button
              type="button"
              onClick={handleReset}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-600 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Template</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleAddSection}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-dashed border-[#FF6B16] text-xs font-bold text-[#FF6B16] bg-orange-50/50 hover:bg-orange-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Section</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6B16] hover:bg-[#e05a0d] text-white text-xs font-black shadow-sm transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving to DB...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Status Toast ── */}
      {statusMessage.text && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* ── Fully Dynamic Page Header Settings Card ── */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <h2 className="text-sm font-extrabold text-[#1A384C] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FF6B16]" />
            <span>Page Header Settings (Fully Dynamic)</span>
          </h2>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Realtime DB Sync
          </span>
        </div>

        {/* Header Content Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Main Title */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5 flex items-center justify-between">
              <span>Page Main Title (Displayed in Header Banner)</span>
              <span className="text-[10px] text-neutral-400 font-normal">Serif Font</span>
            </label>
            <input
              type="text"
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              placeholder="e.g. Terms & Conditions"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm font-semibold focus:ring-2 focus:ring-[#FF6B16] focus:border-transparent outline-none transition"
            />
          </div>

          {/* Badge / Pill */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5 flex items-center justify-between">
              <span>Header Category Badge (Pill Above Title)</span>
              <span className="text-[10px] text-neutral-400 font-normal">Optional</span>
            </label>
            <input
              type="text"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="e.g. Legal & Policies or Official Terms"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm font-medium focus:ring-2 focus:ring-[#FF6B16] focus:border-transparent outline-none transition"
            />
          </div>

          {/* Subtitle / Description */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-neutral-700 mb-1.5">
              Header Subtitle / Tagline (Displayed below Main Title)
            </label>
            <textarea
              rows={2}
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Please review our expedition guidelines, booking rules, and adventure travel policies."
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs text-neutral-700 font-medium focus:ring-2 focus:ring-[#FF6B16] focus:border-transparent outline-none transition"
            />
          </div>

          {/* Last Updated Notice + Quick Buttons */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-neutral-700">
                Last Updated Notice Text
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSetToday}
                  className="text-[11px] font-bold text-[#FF6B16] hover:underline"
                >
                  Set to Today
                </button>
                <span className="text-neutral-300">|</span>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showLastUpdated}
                    onChange={(e) => setShowLastUpdated(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-[#FF6B16] focus:ring-[#FF6B16]"
                  />
                  <span className="text-[11px] font-semibold text-neutral-500">
                    Visible
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={lastUpdated}
                  onChange={(e) => setLastUpdated(e.target.value)}
                  placeholder="e.g. March 22, 2026"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm font-medium focus:ring-2 focus:ring-[#FF6B16] focus:border-transparent outline-none transition"
                />
                <Calendar className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              </div>
              <input
                type="date"
                onChange={handleDatePickerChange}
                title="Pick date from calendar"
                className="px-2.5 py-2 rounded-xl border border-neutral-300 text-xs text-neutral-600 cursor-pointer hover:bg-neutral-50 transition"
              />
            </div>
          </div>

          {/* Banner Colors & Styling */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5">
              Banner Background Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={headerBgColor}
                onChange={(e) => setHeaderBgColor(e.target.value)}
                className="w-10 h-10 rounded-xl border border-neutral-200 cursor-pointer p-0.5"
                title="Choose custom background color"
              />
              <div className="flex flex-wrap gap-1.5 flex-1">
                {PRESET_BG_COLORS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setHeaderBgColor(preset.value)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border flex items-center gap-1 transition ${
                      headerBgColor.toLowerCase() === preset.value.toLowerCase()
                        ? 'border-[#FF6B16] bg-orange-50 text-[#FF6B16]'
                        : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-neutral-300"
                      style={{ backgroundColor: preset.value }}
                    />
                    <span>{preset.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Text Color Selection */}
        <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-neutral-400" />
            <span className="text-xs font-bold text-neutral-700">
              Banner Text Color:
            </span>
            <div className="flex items-center gap-1.5 ml-2">
              {PRESET_TEXT_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setHeaderTextColor(color.value)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    headerTextColor.toLowerCase() === color.value.toLowerCase()
                      ? 'border-[#FF6B16] scale-110 shadow-xs'
                      : 'border-neutral-200 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {headerTextColor.toLowerCase() === color.value.toLowerCase() && (
                    <Check
                      className={`w-3 h-3 ${
                        color.value === '#FFFFFF' ? 'text-black' : 'text-white'
                      }`}
                    />
                  )}
                </button>
              ))}
              <input
                type="color"
                value={headerTextColor}
                onChange={(e) => setHeaderTextColor(e.target.value)}
                className="w-6 h-6 rounded-full border border-neutral-300 cursor-pointer ml-1"
                title="Custom text color"
              />
            </div>
          </div>

          <div className="text-[11px] text-neutral-400">
            Hex: <span className="font-mono font-bold text-neutral-600">{headerBgColor}</span> (Bg) / <span className="font-mono font-bold text-neutral-600">{headerTextColor}</span> (Text)
          </div>
        </div>

        {/* ── Realtime Live Mini Preview Banner ── */}
        <div className="mt-4 pt-4 border-t border-neutral-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[#FF6B16]" />
              <span>Live Header Mini Preview</span>
            </span>
            <span className="text-[10px] text-neutral-400 italic">
              Matches public /terms header banner
            </span>
          </div>

          <div
            style={{
              backgroundColor: headerBgColor,
              color: headerTextColor,
            }}
            className="rounded-2xl p-6 sm:p-8 text-center border border-neutral-200/80 shadow-xs transition-colors space-y-2"
          >
            {badge && (
              <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-black/5 text-current/80">
                {badge}
              </span>
            )}
            <h3 className="text-2xl sm:text-3xl font-serif font-normal tracking-tight">
              {pageTitle || 'Terms & Conditions'}
            </h3>
            {subtitle && (
              <p className="text-xs sm:text-[13px] opacity-80 max-w-lg mx-auto leading-relaxed">
                {subtitle}
              </p>
            )}
            {showLastUpdated && (
              <p className="text-[11px] font-bold opacity-70 pt-1">
                Last Updated: {lastUpdated}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Section-Wise Content Editor ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#FF6B16]" />
            <h2 className="text-sm font-extrabold text-[#1A384C]">
              Terms Sections ({sections.length})
            </h2>
          </div>
          <span className="text-xs text-neutral-400">
            Drag or use arrows to reorder sections. Bullet points are rendered cleanly on the public page.
          </span>
        </div>

        {sections.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center space-y-3">
            <p className="text-sm text-neutral-500">No sections added yet.</p>
            <button
              type="button"
              onClick={handleAddSection}
              className="px-4 py-2 bg-[#FF6B16] text-white text-xs font-bold rounded-xl"
            >
              Add First Section
            </button>
          </div>
        ) : (
          sections.map((section, sIdx) => (
            <div
              key={section.id || sIdx}
              className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs hover:border-neutral-300 transition-all p-5 sm:p-6 space-y-4"
            >
              {/* Section Header Bar */}
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="w-7 h-7 rounded-lg bg-orange-100 text-[#FF6B16] text-xs font-black flex items-center justify-center flex-shrink-0">
                    {sIdx + 1}
                  </span>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => handleUpdateSectionTitle(sIdx, e.target.value)}
                    placeholder="Enter section title (e.g. User Eligibility & Accounts)"
                    className="w-full text-base font-bold text-[#1A384C] bg-transparent border-b border-transparent hover:border-neutral-300 focus:border-[#FF6B16] outline-none px-1 py-0.5 transition"
                  />
                </div>

                {/* Section Controls */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMoveSection(sIdx, 'up')}
                    disabled={sIdx === 0}
                    title="Move Section Up"
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-20"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveSection(sIdx, 'down')}
                    disabled={sIdx === sections.length - 1}
                    title="Move Section Down"
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-20"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <div className="h-4 w-px bg-neutral-200 mx-1" />
                  <button
                    type="button"
                    onClick={() => handleDeleteSection(sIdx)}
                    title="Delete Section"
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Section Body Paragraph */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Introductory Paragraph / Body Text (Optional)
                </label>
                <textarea
                  rows={2}
                  value={section.content || ''}
                  onChange={(e) => handleUpdateSectionContent(sIdx, e.target.value)}
                  placeholder="Introductory description or paragraph for this section..."
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs text-neutral-700 leading-relaxed focus:ring-2 focus:ring-[#FF6B16] focus:border-transparent outline-none transition"
                />
              </div>

              {/* Bullet Points Subsection */}
              <div className="bg-[#FAFBFD] rounded-xl p-4 border border-neutral-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                    Bullet Points ({section.items?.length || 0})
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddBullet(sIdx)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FF6B16] hover:underline"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Bullet Point</span>
                  </button>
                </div>

                {!section.items || section.items.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic">
                    No bullet points. Click &quot;Add Bullet Point&quot; above to add specific clauses.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {section.items.map((bullet, bIdx) => (
                      <div key={bIdx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 mt-3 flex-shrink-0" />
                        <textarea
                          rows={2}
                          value={bullet}
                          onChange={(e) => handleUpdateBullet(sIdx, bIdx, e.target.value)}
                          placeholder="Clause or bullet detail..."
                          className="flex-1 px-3 py-1.5 rounded-lg border border-neutral-200 text-xs text-neutral-700 focus:ring-1 focus:ring-[#FF6B16] focus:border-transparent outline-none transition"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteBullet(sIdx, bIdx)}
                          title="Remove bullet"
                          className="p-1.5 rounded-md text-neutral-300 hover:text-red-500 hover:bg-red-50 transition flex-shrink-0 mt-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Bottom Add Section Button */}
        {sections.length > 0 && (
          <div className="pt-2 flex justify-between items-center">
            <button
              type="button"
              onClick={handleAddSection}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[#FF6B16] text-xs font-bold text-[#FF6B16] bg-orange-50/40 hover:bg-orange-50 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Another Section</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FF6B16] hover:bg-[#e05a0d] text-white text-xs font-black shadow-sm transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save All Changes</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
