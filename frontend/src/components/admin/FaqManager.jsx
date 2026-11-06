import React, { useState, useEffect, useMemo } from 'react';
import {
  HelpCircle,
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Package,
  Layers,
  Edit3,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { usePackages } from '../../context/PackageContext';
import { getDefaultPackageFAQs } from '../packages/PackageFAQ';

export default function FaqManager() {
  const { token } = useAuth();
  const { packageFaqSection, updateFaqSectionSettings, refreshSettings, API_BASE_URL } = useSettings();
  const { packages, refreshPackages, updatePackage, seedPackageFaqs } = usePackages();

  // Mode: 'global' or package id (e.g. 'tungnath')
  const [selectedTarget, setSelectedTarget] = useState('global');

  // Header settings for the FAQ section
  const [badge, setBadge] = useState("Got Questions? We've Got Answers");
  const [title, setTitle] = useState('Frequently Asked Questions');
  const [subtitle, setSubtitle] = useState(
    'Everything you need to know about preparation, safety, stays, permits, and booking.'
  );

  // FAQs list state
  const [faqsList, setFaqsList] = useState([]);

  // New question form state
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  // UI state
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [previewOpenId, setPreviewOpenId] = useState(null);

  const showToast = (type, text) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSeedAllPackages = async () => {
    setSeeding(true);
    try {
      const res = await seedPackageFaqs();
      if (res.success) {
        showToast('success', res.message || 'Seeded FAQs for all packages!');
        await refreshPackages(true);
      } else {
        showToast('error', res.message || 'Failed to seed FAQs');
      }
    } catch (err) {
      showToast('error', err.message || 'Error seeding FAQs');
    } finally {
      setSeeding(false);
    }
  };

  // Find currently selected package (if not global)
  const currentPackage = useMemo(() => {
    if (selectedTarget === 'global') return null;
    return packages.find((p) => p.id === selectedTarget || p._id === selectedTarget) || null;
  }, [packages, selectedTarget]);

  // Load FAQs when target changes
  useEffect(() => {
    if (selectedTarget === 'global') {
      setBadge(packageFaqSection?.badge || "Got Questions? We've Got Answers");
      setTitle(packageFaqSection?.title || 'Frequently Asked Questions');
      setSubtitle(
        packageFaqSection?.subtitle ||
          'Everything you need to know about preparation, safety, stays, permits, and booking.'
      );

      if (Array.isArray(packageFaqSection?.defaultFaqs) && packageFaqSection.defaultFaqs.length > 0) {
        setFaqsList(
          packageFaqSection.defaultFaqs.map((f, i) => ({
            id: f.id || `faq-g-${i}`,
            question: f.question || '',
            answer: f.answer || '',
            category: f.category || 'General',
          }))
        );
      } else {
        // Fallback to high-quality defaults
        const defaults = getDefaultPackageFAQs();
        setFaqsList(defaults);
      }
    } else if (currentPackage) {
      if (Array.isArray(currentPackage.faqs) && currentPackage.faqs.length > 0) {
        setFaqsList(
          currentPackage.faqs.map((f, i) => ({
            id: f._id || f.id || `faq-p-${i}`,
            question: f.question || '',
            answer: f.answer || '',
            category: f.category || 'General',
          }))
        );
      } else {
        // Fallback to defaults customized for this package
        const defaults = getDefaultPackageFAQs(currentPackage);
        setFaqsList(defaults);
      }
    }
  }, [selectedTarget, currentPackage, packageFaqSection]);

  // Add question
  const handleAddQuestion = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      showToast('error', 'Please provide both question and answer text.');
      return;
    }
    const newItem = {
      id: `faq-${Date.now()}`,
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
    };
    setFaqsList((prev) => [...prev, newItem]);
    setNewQuestion('');
    setNewAnswer('');
    showToast('success', 'Question added to list.');
  };

  // Update question inline
  const handleUpdateItem = (index, field, value) => {
    setFaqsList((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Reorder items
  const handleMove = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= faqsList.length) return;
    setFaqsList((prev) => {
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.splice(targetIdx, 0, item);
      return next;
    });
  };

  // Delete item
  const handleDeleteItem = (index) => {
    setFaqsList((prev) => prev.filter((_, i) => i !== index));
    showToast('info', 'Question removed.');
  };

  // Load Recommended Defaults
  const handleLoadDefaults = () => {
    const defaults = getDefaultPackageFAQs(currentPackage || {});
    setFaqsList(defaults);
    showToast('success', 'Recommended trail FAQs loaded.');
  };

  // Save changes
  const handleSave = async () => {
    setSaving(true);
    try {
      if (selectedTarget === 'global') {
        const payload = {
          badge: badge.trim(),
          title: title.trim(),
          subtitle: subtitle.trim(),
          defaultFaqs: faqsList.map((f) => ({
            question: f.question,
            answer: f.answer,
          })),
        };
        const res = await updateFaqSectionSettings(token, payload);
        if (res.success) {
          showToast('success', 'Global FAQ Section updated successfully!');
          refreshSettings();
        } else {
          showToast('error', res.message || 'Failed to update FAQ settings');
        }
      } else if (currentPackage) {
        const pkgId = currentPackage.id || currentPackage._id;
        const res = await updatePackage(pkgId, {
          faqs: faqsList.map((f) => ({
            question: f.question,
            answer: f.answer,
          })),
        });
        if (res.success) {
          showToast('success', `FAQs for ${currentPackage.name} updated successfully!`);
          refreshPackages();
        } else {
          showToast('error', res.message || 'Failed to update package FAQs');
        }
      }
    } catch (err) {
      console.error('Save FAQ Error:', err);
      showToast('error', err.message || 'Failed to save FAQs');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-xs font-bold transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-600 text-white shadow-emerald-600/30'
              : toastMessage.type === 'error'
              ? 'bg-rose-600 text-white shadow-rose-600/30'
              : 'bg-neutral-800 text-white shadow-neutral-800/30'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-[#FF6B16] text-[11px] font-black uppercase tracking-wider mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Interactive FAQ Manager</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
            Frequently Asked <span className="text-[#FF6B16]">Questions Editor</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-1">
            Customize question text, answers, and section badges dynamically for all packages or specific treks.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleSeedAllPackages}
            disabled={seeding}
            className="px-4 py-2.5 rounded-xl border border-neutral-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-neutral-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Ensure all existing packages in MongoDB have FAQs populated"
          >
            {seeding ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            )}
            <span>{seeding ? 'Seeding FAQs...' : 'Seed FAQs to All Packages'}</span>
          </button>

          <button
            type="button"
            onClick={handleLoadDefaults}
            className="px-4 py-2.5 rounded-xl border border-neutral-200 hover:border-[#FF6B16] hover:bg-orange-50/50 text-neutral-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#FF6B16]" />
            <span>Load Recommended FAQs</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-[#FF6B16] hover:bg-[#E55A0B] text-white text-xs font-bold transition-all shadow-md shadow-[#FF6B16]/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Target Selector: Global vs Specific Package */}
      <div className="bg-white rounded-3xl p-5 border border-neutral-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#FF6B16]" />
          <span className="text-xs font-black text-neutral-800 uppercase tracking-wider">
            Edit Scope:
          </span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => setSelectedTarget('global')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedTarget === 'global'
                ? 'bg-[#FF6B16] text-white shadow-sm shadow-[#FF6B16]/30'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
            }`}
          >
            Global Default FAQs (All Packages)
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 font-bold">or specific package:</span>
            <select
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              className="px-3 py-2 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-800 bg-white focus:outline-none focus:border-[#FF6B16]"
            >
              <option value="global">Select a package to customize...</option>
              {packages.map((pkg) => (
                <option key={pkg.id || pkg._id} value={pkg.id || pkg._id}>
                  {pkg.name} ({pkg.location || 'Himalayas'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Global Section Header Editor (Only when editing Global) */}
      {selectedTarget === 'global' && (
        <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
            <Edit3 className="w-4 h-4 text-[#FF6B16]" />
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-800">
              Section Header Typography & Badge
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Small Pill Badge
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-800 focus:outline-none focus:border-[#FF6B16]"
                placeholder="e.g. Got Questions? We've Got Answers"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Main Headline
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-800 focus:outline-none focus:border-[#FF6B16]"
                placeholder="Frequently Asked Questions"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Subtitle Description
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-800 focus:outline-none focus:border-[#FF6B16]"
                placeholder="Brief intro line explaining FAQs"
              />
            </div>
          </div>
        </div>
      )}

      {/* Add New Question Card */}
      <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#FF6B16]" />
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-800">
              Add New FAQ Question
            </h3>
          </div>
          <span className="text-[11px] text-neutral-400 font-bold">
            Target: {selectedTarget === 'global' ? 'Global Default' : currentPackage?.name}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-12">
            <label className="block text-xs font-bold text-neutral-700 mb-1">Question</label>
            <input
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="e.g. Is trekking pole mandatory on this trail?"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-800 focus:outline-none focus:border-[#FF6B16]"
            />
          </div>

          <div className="md:col-span-12">
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Answer (Supports Markdown & **bold** text)
            </label>
            <textarea
              rows={3}
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Write a clear, helpful answer for your travelers..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-800 focus:outline-none focus:border-[#FF6B16]"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleAddQuestion}
            disabled={!newQuestion.trim() || !newAnswer.trim()}
            className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-[#FF6B16] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            <Plus className="w-4 h-4" />
            <span>Add to Questions List</span>
          </button>
        </div>
      </div>

      {/* Current Questions List */}
      <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <h3 className="text-sm font-black text-neutral-900">
              Active Questions ({faqsList.length})
            </h3>
            <p className="text-[11px] text-neutral-400 font-medium mt-0.5">
              Edit question text or answers inline. Use arrows to reorder questions.
            </p>
          </div>

          <span className="text-xs font-bold text-[#FF6B16] bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
            {selectedTarget === 'global' ? 'Global Scope' : currentPackage?.name}
          </span>
        </div>

        {faqsList.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-neutral-200 rounded-2xl">
            <HelpCircle className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-neutral-600">No questions in this list</p>
            <button
              type="button"
              onClick={handleLoadDefaults}
              className="mt-3 px-4 py-2 rounded-xl bg-orange-50 text-[#FF6B16] hover:bg-orange-100 text-xs font-bold transition-colors cursor-pointer"
            >
              Load Recommended Trail FAQs
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {faqsList.map((faq, index) => (
              <div
                key={faq.id || index}
                className="p-4 sm:p-5 rounded-2xl border border-neutral-200/90 bg-[#F7F7F5] hover:border-neutral-300 transition-all space-y-3 shadow-2xs"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-[11px] font-black text-neutral-600 shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-xs font-black text-neutral-800">
                      Question #{index + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(index, -1)}
                      className="w-7 h-7 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-50 flex items-center justify-center text-neutral-600 disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === faqsList.length - 1}
                      onClick={() => handleMove(index, 1)}
                      className="w-7 h-7 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-50 flex items-center justify-center text-neutral-600 disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(index)}
                      className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                      title="Delete Question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => handleUpdateItem(index, 'question', e.target.value)}
                    placeholder="Enter question text..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-xs font-bold text-neutral-900 focus:outline-none focus:border-[#FF6B16]"
                  />
                  <textarea
                    rows={3}
                    value={faq.answer}
                    onChange={(e) => handleUpdateItem(index, 'answer', e.target.value)}
                    placeholder="Enter detailed answer..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-xs font-medium text-neutral-700 leading-relaxed focus:outline-none focus:border-[#FF6B16]"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button at Bottom */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 rounded-2xl bg-[#FF6B16] hover:bg-[#E55A0B] text-white text-xs font-bold transition-all shadow-lg shadow-[#FF6B16]/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
        </button>
      </div>
    </div>
  );
}
