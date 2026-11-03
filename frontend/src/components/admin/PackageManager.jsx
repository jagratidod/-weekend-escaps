import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { usePackages } from '../../context/PackageContext';
import { getImageUrl } from '../../utils/imageHelper';
import {
  Package,
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Star,
  RefreshCw,
  Upload,
  Calendar,
  Clock,
  MapPin,
  Users,
  X,
  AlertTriangle,
  ArrowUpRight,
  Tag,
  TrendingUp,
  Flame,
  Award,
  Compass,
  Check,
  ChevronDown,
  ChevronUp,
  FolderTree,
} from 'lucide-react';

const DIFFICULTY_LEVELS = [
  'Easy',
  'Easy to Moderate',
  'Moderate',
  'Challenging',
  'Strenuous',
];

const BADGE_PRESETS = [
  { label: 'Best Seller', color: 'bg-[#FF6B16] text-white' },
  { label: 'Trending', color: 'bg-gradient-to-r from-amber-500 to-red-500 text-white' },
  { label: 'Popular', color: 'bg-emerald-600 text-white' },
  { label: 'New', color: 'bg-sky-600 text-white' },
  { label: 'Limited Seats', color: 'bg-rose-600 text-white' },
  { label: 'Special Offer', color: 'bg-purple-600 text-white' },
];

export function PackageManager() {
  const { token } = useAuth();
  const { API_BASE_URL } = useSettings();
  const {
    packages,
    categories,
    categoryNames,
    loading,
    refreshPackages,
    refreshCategories,
    createPackage,
    updatePackage,
    deletePackage,
    seedPackages,
    createCategory,
    updateCategory,
    deleteCategory,
  } = usePackages();

  // Sub-tabs: 'packages' or 'categories'
  const [managerTab, setManagerTab] = useState('packages');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All'); // 'All', 'Active', 'Inactive'

  // Package Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [deleteConfirmPkg, setDeleteConfirmPkg] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingDayIdx, setUploadingDayIdx] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Category Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteConfirmCategory, setDeleteConfirmCategory] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    order: 0,
    isActive: true,
  });

  // Quick inline add category inside package modal
  const [showQuickAddCat, setShowQuickAddCat] = useState(false);
  const [quickCatName, setQuickCatName] = useState('');

  // Active form tab inside the package modal
  const [activeFormTab, setActiveFormTab] = useState('basic');

  // Temporary item inputs for array builders
  const [tempIncluded, setTempIncluded] = useState('');
  const [tempExcluded, setTempExcluded] = useState('');
  const [tempHighlight, setTempHighlight] = useState('');

  // Initial Form State for Package
  const initialFormData = {
    name: '',
    id: '',
    badge: 'Best Seller',
    badgeColor: 'bg-[#FF6B16] text-white',
    duration: '6 Days / 5 Nights',
    location: 'Uttarakhand, India',
    price: 8999,
    originalPrice: 12999,
    rating: 4.9,
    reviewsCount: 150,
    image: '/newimage/exploresection/kedarkantha.png',
    travelType: categories[0]?.name || 'Trekking',
    difficulty: 'Easy to Moderate',
    season: 'All Year Round',
    groupSize: '12 - 18 Explorers',
    description: '',
    included: [
      'Experienced Trip Marshal',
      'All Meals & High Altitude Camps',
      'Permits and Safety Gears',
    ],
    excluded: [
      'Personal expenses & shopping',
      'Travel Insurance',
      'Emergency evacuation costs',
    ],
    highlights: [
      'Summit sunrise panoramic view',
      'Stargazing at campsite',
      'Certified local wilderness guide',
    ],
    itinerary: [
      { day: 'Day 1', title: 'Arrival & Basecamp Briefing', desc: 'Arrive at destination, check-in to camps/hotel, safety briefing and welcome dinner.' },
      { day: 'Day 2', title: 'Acclimatization & Trail Walk', desc: 'Scenic gentle trek through pine forest and alpine viewpoints.' },
    ],
    isFeatured: false,
    isTrending: true,
    isActive: true,
    order: 0,
  };

  const [formData, setFormData] = useState(initialFormData);

  const showToast = (type, text) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    refreshPackages(true);
    refreshCategories(true);
  }, [refreshPackages, refreshCategories]);

  // Open Add Package Modal
  const handleOpenAddModal = () => {
    setEditingPackage(null);
    setFormData({
      ...initialFormData,
      travelType: categories[0]?.name || 'Trekking',
    });
    setActiveFormTab('basic');
    setShowQuickAddCat(false);
    setQuickCatName('');
    setShowModal(true);
  };

  // Open Edit Package Modal
  const handleOpenEditModal = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name || '',
      id: pkg.id || '',
      badge: pkg.badge || '',
      badgeColor: pkg.badgeColor || 'bg-[#FF6B16] text-white',
      duration: pkg.duration || '',
      location: pkg.location || '',
      price: pkg.price || 0,
      originalPrice: pkg.originalPrice || '',
      rating: pkg.rating || 4.9,
      reviewsCount: pkg.reviewsCount || 100,
      image: pkg.image || '/newimage/exploresection/kedarkantha.png',
      travelType: pkg.travelType || categories[0]?.name || 'Trekking',
      difficulty: pkg.difficulty || 'Easy to Moderate',
      season: pkg.season || 'All Year Round',
      groupSize: pkg.groupSize || '12 - 18 Explorers',
      description: pkg.description || '',
      included: Array.isArray(pkg.included) ? [...pkg.included] : [],
      excluded: Array.isArray(pkg.excluded) ? [...pkg.excluded] : [],
      highlights: Array.isArray(pkg.highlights) ? [...pkg.highlights] : [],
      itinerary: Array.isArray(pkg.itinerary) && pkg.itinerary.length > 0
        ? pkg.itinerary.map((it) => ({ ...it, image: it.image || '' }))
        : [
            { day: 'Day 1', title: 'Arrival & Welcome', desc: 'Reach destination and check-in.' },
          ],
      isFeatured: !!pkg.isFeatured,
      isTrending: pkg.isTrending !== undefined ? !!pkg.isTrending : true,
      isActive: pkg.isActive !== undefined ? !!pkg.isActive : true,
      order: pkg.order || 0,
    });
    setActiveFormTab('basic');
    setShowQuickAddCat(false);
    setQuickCatName('');
    setShowModal(true);
  };

  // Handle Quick Create Category from inside package modal
  const handleQuickCreateCategory = async (e) => {
    e.preventDefault();
    if (!quickCatName.trim()) return;

    try {
      setActionLoading(true);
      const res = await createCategory({
        name: quickCatName.trim(),
        order: categories.length + 1,
      });

      if (res.success) {
        showToast('success', `Category "${quickCatName.trim()}" created!`);
        setFormData((prev) => ({ ...prev, travelType: res.category.name }));
        setQuickCatName('');
        setShowQuickAddCat(false);
      } else {
        showToast('error', res.message || 'Failed to create category');
      }
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Open Category Create / Edit Modal
  const handleOpenCategoryModal = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryFormData({
        name: cat.name || '',
        description: cat.description || '',
        order: cat.order !== undefined ? cat.order : 0,
        isActive: cat.isActive !== undefined ? cat.isActive : true,
      });
    } else {
      setEditingCategory(null);
      setCategoryFormData({
        name: '',
        description: '',
        order: categories.length + 1,
        isActive: true,
      });
    }
    setShowCategoryModal(true);
  };

  // Save Category Form
  const handleSubmitCategoryForm = async (e) => {
    e.preventDefault();
    if (!categoryFormData.name.trim()) {
      showToast('error', 'Category name is required');
      return;
    }

    try {
      setActionLoading(true);
      if (editingCategory) {
        const targetId = editingCategory._id || editingCategory.slug;
        const res = await updateCategory(targetId, categoryFormData);
        if (res.success) {
          showToast('success', `Category "${categoryFormData.name}" updated!`);
          setShowCategoryModal(false);
        } else {
          showToast('error', res.message || 'Failed to update category');
        }
      } else {
        const res = await createCategory(categoryFormData);
        if (res.success) {
          showToast('success', `Category "${categoryFormData.name}" created!`);
          setShowCategoryModal(false);
        } else {
          showToast('error', res.message || 'Failed to create category');
        }
      }
    } catch (err) {
      showToast('error', err.message || 'An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = async () => {
    if (!deleteConfirmCategory) return;
    try {
      setActionLoading(true);
      const targetId = deleteConfirmCategory._id || deleteConfirmCategory.slug;
      const res = await deleteCategory(targetId);
      if (res.success) {
        showToast('success', `Category "${deleteConfirmCategory.name}" deleted.`);
        setDeleteConfirmCategory(null);
      } else {
        showToast('error', res.message || 'Failed to delete category');
      }
    } catch (err) {
      showToast('error', err.message || 'Failed to delete');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Image Upload via Backend
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('error', 'Image size must be less than 10MB');
      return;
    }

    try {
      setIsUploading(true);
      const uploadData = new FormData();
      uploadData.append('image', file);

      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Image upload failed');
      }

      setFormData((prev) => ({ ...prev, image: data.url }));
      showToast('success', 'Cover image uploaded successfully!');
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setIsUploading(false);
    }
  };


  // Handle Itinerary Day Image Upload
  const handleItineraryImageUpload = async (index, file) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('error', 'Image size must be less than 10MB');
      return;
    }

    try {
      setUploadingDayIdx(index);
      const uploadData = new FormData();
      uploadData.append('image', file);

      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Image upload failed');
      }

      handleUpdateItineraryDay(index, 'image', data.url);
      showToast('success', `Day ${index + 1} photo uploaded successfully!`);
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setUploadingDayIdx(null);
    }
  };

  // Array item helpers
  const addArrayItem = (field, value, clearFn) => {
    if (!value || !value.trim()) return;
    setFormData((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), value.trim()],
    }));
    clearFn('');
  };

  const removeArrayItem = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  // Itinerary Item helpers
  const handleAddItineraryDay = () => {
    const nextDayNum = (formData.itinerary?.length || 0) + 1;
    setFormData((prev) => ({
      ...prev,
      itinerary: [
        ...(prev.itinerary || []),
        {
          day: `Day ${nextDayNum}`,
          title: `Day ${nextDayNum} Exploration`,
          desc: 'Exciting day activities and scenic sightseeing.',
          image: '',
        },
      ],
    }));
  };

  const handleUpdateItineraryDay = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.itinerary];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, itinerary: updated };
    });
  };

  const handleRemoveItineraryDay = (index) => {
    setFormData((prev) => ({
      ...prev,
      itinerary: prev.itinerary.filter((_, i) => i !== index),
    }));
  };

  // Toggle active / trending status directly from table
  const handleToggleStatus = async (pkg, field) => {
    try {
      const newValue = !pkg[field];
      const targetId = pkg._id || pkg.id;
      const res = await updatePackage(targetId, { [field]: newValue });
      if (res.success) {
        showToast('success', `Updated ${pkg.name} status`);
      }
    } catch (err) {
      showToast('error', err.message || 'Failed to update status');
    }
  };

  // Submit Add / Edit Package Form
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.duration.trim() || !formData.location.trim() || !formData.price) {
      showToast('error', 'Please fill in all required fields (Name, Duration, Location, Price)');
      return;
    }

    try {
      setActionLoading(true);
      if (editingPackage) {
        const targetId = editingPackage._id || editingPackage.id;
        const res = await updatePackage(targetId, formData);
        if (res.success) {
          showToast('success', `Package "${formData.name}" updated successfully!`);
          setShowModal(false);
        } else {
          showToast('error', res.message || 'Update failed');
        }
      } else {
        const res = await createPackage(formData);
        if (res.success) {
          showToast('success', `Package "${formData.name}" created successfully!`);
          setShowModal(false);
        } else {
          showToast('error', res.message || 'Creation failed');
        }
      }
    } catch (err) {
      showToast('error', err.message || 'An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Package Action
  const handleDeletePackage = async () => {
    if (!deleteConfirmPkg) return;
    try {
      setActionLoading(true);
      const targetId = deleteConfirmPkg._id || deleteConfirmPkg.id;
      const res = await deletePackage(targetId);
      if (res.success) {
        showToast('success', `Package "${deleteConfirmPkg.name}" deleted.`);
        setDeleteConfirmPkg(null);
      } else {
        showToast('error', res.message || 'Delete failed');
      }
    } catch (err) {
      showToast('error', err.message || 'Failed to delete');
    } finally {
      setActionLoading(false);
    }
  };

  // Sync Defaults
  const handleSeedDefaults = async () => {
    if (
      !window.confirm(
        'Are you sure you want to sync default packages? This will ensure the 4 core packages exist in the database.'
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await seedPackages();
      if (res.success) {
        showToast('success', 'Default packages synced and restored!');
      } else {
        showToast('error', 'Could not sync defaults');
      }
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered packages
  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      (pkg.name && pkg.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (pkg.location && pkg.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (pkg.travelType && pkg.travelType.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType =
      selectedTypeFilter === 'All' ||
      (pkg.travelType && pkg.travelType.toLowerCase().includes(selectedTypeFilter.toLowerCase()));

    const matchesStatus =
      selectedStatusFilter === 'All' ||
      (selectedStatusFilter === 'Active' && pkg.isActive !== false) ||
      (selectedStatusFilter === 'Inactive' && pkg.isActive === false);

    return matchesSearch && matchesType && matchesStatus;
  });

  // KPI counts
  const totalCount = packages.length;
  const activeCount = packages.filter((p) => p.isActive !== false).length;
  const trendingCount = packages.filter((p) => p.isTrending !== false).length;
  const typesCount = categories.length;

  return (
    <div className="space-y-6 select-none">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold text-white transition-all transform animate-bounce ${
            toastMessage.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header & Stats Cards */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B16]"></span>
              <span className="text-xs font-black uppercase tracking-wider text-[#FF6B16]">
                Catalog Management
              </span>
            </div>
            <h1 className="text-2xl font-black text-[#1A384C]">Tour Packages & Categories</h1>
            <p className="text-sm text-neutral-500">
              Create tour packages, customize travel styles/categories, manage itineraries, pricing, and live website visibility.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                refreshPackages(true);
                refreshCategories(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-white border border-neutral-200 text-neutral-700 hover:border-[#FF6B16] text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="Refresh Packages & Categories"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            {managerTab === 'packages' ? (
              <>
                <button
                  onClick={handleSeedDefaults}
                  className="px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  title="Restore / Seed 4 default packages into MongoDB"
                >
                  <Award className="w-3.5 h-3.5 text-[#FF6B16]" />
                  <span>Sync Defaults</span>
                </button>

                <button
                  onClick={handleOpenAddModal}
                  className="px-4 py-2 rounded-xl bg-[#FF6B16] hover:bg-[#E55A0B] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Package</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => handleOpenCategoryModal()}
                className="px-4 py-2 rounded-xl bg-[#FF6B16] hover:bg-[#E55A0B] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-500">Total Packages</span>
              <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF6B16] flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#1A384C] mt-2">{totalCount}</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-500">Active Live</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-2">{activeCount}</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-500">Trending on Home</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-600 mt-2">{trendingCount}</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-500">Travel Categories</span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#1A384C] mt-2">{typesCount}</div>
          </div>
        </div>
      </div>

      {/* ── Sub-Navigation Tabs: Packages vs Categories ── */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
        <button
          onClick={() => setManagerTab('packages')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            managerTab === 'packages'
              ? 'bg-[#1A384C] text-white shadow-sm'
              : 'bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Tour Packages ({packages.length})</span>
        </button>

        <button
          onClick={() => setManagerTab('categories')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            managerTab === 'categories'
              ? 'bg-[#1A384C] text-white shadow-sm'
              : 'bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Compass className="w-4 h-4 text-[#FF6B16]" />
          <span>Manage Categories / Travel Types ({categories.length})</span>
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════
          TAB 1: TOUR PACKAGES VIEW
         ════════════════════════════════════════════════════════════ */}
      {managerTab === 'packages' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-neutral-100 shadow-xs flex flex-col md:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by package name, location or category..."
                className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-medium focus:outline-none focus:border-[#FF6B16]"
              />
            </div>

            {/* Travel Type Filter */}
            <div className="w-full md:w-52">
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-semibold text-neutral-700 cursor-pointer focus:outline-none focus:border-[#FF6B16]"
              >
                <option value="All">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id || cat.slug || cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-40">
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-semibold text-neutral-700 cursor-pointer focus:outline-none focus:border-[#FF6B16]"
              >
                <option value="All">All Status</option>
                <option value="Active">Active Only</option>
                <option value="Inactive">Inactive / Draft</option>
              </select>
            </div>
          </div>

          {/* Packages Table */}
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-100 text-[11px] font-black uppercase tracking-wider text-neutral-500">
                    <th className="py-3 px-4">Package</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price / Person</th>
                    <th className="py-3 px-4">Rating</th>
                    <th className="py-3 px-4 text-center">Trending</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-xs">
                  {filteredPackages.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-neutral-400">
                        <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="font-bold">No packages found</p>
                        <p className="text-[11px]">Try adjusting your search or filters</p>
                      </td>
                    </tr>
                  ) : (
                    filteredPackages.map((pkg) => (
                      <tr key={pkg._id || pkg.id} className="hover:bg-neutral-50/70 transition-colors">
                        {/* Package Info & Thumbnail */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={pkg.image ? getImageUrl(pkg.image) : '/newimage/exploresection/kedarkantha.png'}
                              alt={pkg.name}
                              className="w-14 h-14 rounded-xl object-cover border border-neutral-100 shadow-xs shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h3 className="font-extrabold text-[#1A384C] text-sm">{pkg.name}</h3>
                                {pkg.badge && (
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      pkg.badgeColor || 'bg-[#FF6B16] text-white'
                                    }`}
                                  >
                                    {pkg.badge}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-neutral-500 text-[11px] mt-1">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-[#FF6B16]" />
                                  {pkg.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-neutral-400" />
                                  {pkg.duration}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-1 rounded-lg bg-orange-50 text-[#FF6B16] font-bold text-[11px]">
                            {pkg.travelType || 'Trekking'}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="py-3 px-4">
                          <div className="font-black text-[#1A384C]">
                            ₹{Number(pkg.price).toLocaleString('en-IN')}
                          </div>
                          {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                            <div className="text-[10px] text-neutral-400 line-through">
                              ₹{Number(pkg.originalPrice).toLocaleString('en-IN')}
                            </div>
                          )}
                        </td>

                        {/* Rating */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 font-bold text-neutral-800">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{pkg.rating || 4.9}</span>
                            <span className="text-[10px] text-neutral-400 font-normal">
                              ({pkg.reviewsCount || 100})
                            </span>
                          </div>
                        </td>

                        {/* Trending Toggle */}
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleToggleStatus(pkg, 'isTrending')}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              pkg.isTrending !== false
                                ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                                : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'
                            }`}
                            title={pkg.isTrending !== false ? 'Trending: Click to toggle' : 'Not Trending'}
                          >
                            <Flame className="w-4 h-4" />
                          </button>
                        </td>

                        {/* Status Toggle */}
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleToggleStatus(pkg, 'isActive')}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                              pkg.isActive !== false
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                pkg.isActive !== false ? 'bg-emerald-500' : 'bg-neutral-500'
                              }`}
                            />
                            <span>{pkg.isActive !== false ? 'Active' : 'Draft'}</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <a
                              href={`/packages/${pkg.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg text-neutral-500 hover:text-[#FF6B16] hover:bg-neutral-100 transition-colors"
                              title="View on website"
                            >
                              <ArrowUpRight className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => handleOpenEditModal(pkg)}
                              className="p-1.5 rounded-lg text-neutral-600 hover:text-[#FF6B16] hover:bg-neutral-100 transition-colors cursor-pointer"
                              title="Edit Package"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmPkg(pkg)}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Package"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          TAB 2: TRAVEL CATEGORIES VIEW
         ════════════════════════════════════════════════════════════ */}
      {managerTab === 'categories' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-[#1A384C]">
                Travel Categories & Styles
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Categories appear in the Package Creation form, filter dropdowns, and category tags across the website.
              </p>
            </div>
            <button
              onClick={() => handleOpenCategoryModal()}
              className="px-4 py-2 rounded-xl bg-[#FF6B16] hover:bg-[#E55A0B] text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Category</span>
            </button>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat, idx) => {
              const packageCount = packages.filter(
                (p) => p.travelType && p.travelType.toLowerCase() === cat.name.toLowerCase()
              ).length;

              return (
                <div
                  key={cat._id || cat.slug || idx}
                  className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-xs flex flex-col justify-between hover:border-[#FF6B16]/50 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF6B16] flex items-center justify-center font-bold text-xs">
                          {cat.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-sm text-[#1A384C]">{cat.name}</h3>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            /{cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          cat.isActive !== false
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-neutral-100 text-neutral-500'
                        }`}
                      >
                        {cat.isActive !== false ? 'Active' : 'Disabled'}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-500 line-clamp-2 min-h-[32px]">
                      {cat.description || 'Custom tour style category for travel packages.'}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-600 flex items-center gap-1">
                      <Package className="w-3.5 h-3.5 text-[#FF6B16]" />
                      <span>{packageCount} Packages</span>
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenCategoryModal(cat)}
                        className="p-1.5 rounded-lg text-neutral-600 hover:text-[#FF6B16] hover:bg-neutral-100 transition-colors cursor-pointer"
                        title="Edit Category"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmCategory(cat)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── ADD / EDIT PACKAGE MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#FF6B16] flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-[#1A384C]">
                    {editingPackage ? `Edit: ${editingPackage.name}` : 'Create New Tour Package'}
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Fill in package details, day-by-day itinerary, inclusions and pricing
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-white border border-neutral-200 text-neutral-500 hover:text-neutral-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-neutral-200 px-6 gap-2 bg-white overflow-x-auto no-scrollbar shrink-0">
              {[
                { id: 'basic', label: 'Basic Info' },
                { id: 'pricing', label: 'Pricing & Badges' },
                { id: 'media', label: 'Cover Image' },
                { id: 'itinerary', label: 'Itinerary Builder' },
                { id: 'inclusions', label: 'Inclusions & Highlights' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFormTab(tab.id)}
                  className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                    activeFormTab === tab.id
                      ? 'border-[#FF6B16] text-[#FF6B16]'
                      : 'border-transparent text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleSubmitForm} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* ── TAB 1: BASIC INFO ── */}
              {activeFormTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Package Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Kedarkantha Snow Summit"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none focus:border-[#FF6B16]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        URL Slug / Identifier
                      </label>
                      <input
                        type="text"
                        value={formData.id}
                        onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                        placeholder="e.g. kedarkantha-trek (leave blank to auto-generate)"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none focus:border-[#FF6B16]"
                      />
                    </div>
                  </div>

                  {/* Category Selection with Quick Add */}
                  <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-neutral-700">
                        Category / Travel Type <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowQuickAddCat(!showQuickAddCat)}
                        className="text-[11px] font-bold text-[#FF6B16] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{showQuickAddCat ? 'Close' : 'Add New Category'}</span>
                      </button>
                    </div>

                    {showQuickAddCat && (
                      <div className="p-2.5 rounded-xl bg-orange-50/80 border border-orange-200 flex items-center gap-2 animate-scale-up">
                        <input
                          type="text"
                          value={quickCatName}
                          onChange={(e) => setQuickCatName(e.target.value)}
                          placeholder="Type new category name (e.g. Wildlife Safari)"
                          className="flex-1 px-3 py-1.5 rounded-lg border border-neutral-300 text-xs bg-white focus:outline-none focus:border-[#FF6B16]"
                        />
                        <button
                          type="button"
                          disabled={actionLoading || !quickCatName.trim()}
                          onClick={handleQuickCreateCategory}
                          className="px-3 py-1.5 rounded-lg bg-[#FF6B16] text-white text-xs font-bold hover:bg-[#e05809] cursor-pointer disabled:opacity-50"
                        >
                          Save & Select
                        </button>
                      </div>
                    )}

                    <select
                      value={formData.travelType}
                      onChange={(e) => setFormData({ ...formData, travelType: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-800 cursor-pointer focus:outline-none focus:border-[#FF6B16] bg-white"
                    >
                      {categories.map((cat) => (
                        <option key={cat._id || cat.slug || cat.name} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Duration <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        placeholder="e.g. 6 Days / 5 Nights"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none focus:border-[#FF6B16]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Location / Destination <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g. Uttarakhand, India"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none focus:border-[#FF6B16]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Difficulty
                      </label>
                      <select
                        value={formData.difficulty}
                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-800 cursor-pointer focus:outline-none focus:border-[#FF6B16]"
                      >
                        {DIFFICULTY_LEVELS.map((lvl) => (
                          <option key={lvl} value={lvl}>
                            {lvl}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Best Season
                      </label>
                      <input
                        type="text"
                        value={formData.season}
                        onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                        placeholder="e.g. Dec - Apr (Winter Snow)"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none focus:border-[#FF6B16]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Group Size
                      </label>
                      <input
                        type="text"
                        value={formData.groupSize}
                        onChange={(e) => setFormData({ ...formData, groupSize: e.target.value })}
                        placeholder="e.g. 12 - 18 Explorers"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none focus:border-[#FF6B16]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Overview Description
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief overview of the expedition, route highlights and what makes this trip special..."
                      className="w-full p-3 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none focus:border-[#FF6B16]"
                    />
                  </div>

                  {/* Visibility Toggles */}
                  <div className="pt-2 border-t border-neutral-100 flex flex-wrap items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4 rounded text-[#FF6B16] focus:ring-[#FF6B16]"
                      />
                      <span className="text-xs font-bold text-neutral-800">
                        Active & Published on Live Website
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isTrending}
                        onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                        className="w-4 h-4 rounded text-[#FF6B16] focus:ring-[#FF6B16]"
                      />
                      <span className="text-xs font-bold text-neutral-800">
                        Feature in "Trending Tour Packages" Section
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* ── TAB 2: PRICING & BADGES ── */}
              {activeFormTab === 'pricing' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Selling Price (₹ per person) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="8999"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none focus:border-[#FF6B16]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Original / Strikethrough Price (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.originalPrice}
                        onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                        placeholder="12999"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none focus:border-[#FF6B16]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Rating (out of 5.0)
                      </label>
                      <input
                        type="number"
                        step="0.05"
                        min="1"
                        max="5"
                        value={formData.rating}
                        onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                        placeholder="4.9"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none focus:border-[#FF6B16]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Reviews Count
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.reviewsCount}
                        onChange={(e) => setFormData({ ...formData, reviewsCount: e.target.value })}
                        placeholder="320"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none focus:border-[#FF6B16]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Badge Text
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {BADGE_PRESETS.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              badge: preset.label,
                              badgeColor: preset.color,
                            })
                          }
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                            formData.badge === preset.label
                              ? 'border-[#FF6B16] bg-orange-50 text-[#FF6B16]'
                              : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                      placeholder="Custom Badge label (e.g. Early Bird, High Altitude)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none focus:border-[#FF6B16]"
                    />
                  </div>
                </div>
              )}

              {/* ── TAB 3: COVER IMAGE ── */}
              {activeFormTab === 'media' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Cover Image URL
                    </label>
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://... or /newimage/exploresection/..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none focus:border-[#FF6B16]"
                    />
                  </div>

                  {/* Upload box */}
                  <div className="border-2 border-dashed border-neutral-200 rounded-2xl p-6 text-center hover:border-[#FF6B16] transition-colors bg-neutral-50/50">
                    <input
                      type="file"
                      id="package-cover-upload"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                    <label
                      htmlFor="package-cover-upload"
                      className="cursor-pointer flex flex-col items-center justify-center"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#FF6B16] flex items-center justify-center mb-2 shadow-xs">
                        <Upload className={`w-5 h-5 ${isUploading ? 'animate-bounce' : ''}`} />
                      </div>
                      <span className="text-xs font-extrabold text-neutral-800">
                        {isUploading ? 'Uploading Image...' : 'Click to Upload Cover Image'}
                      </span>
                      <span className="text-[11px] text-neutral-400 mt-0.5">
                        PNG, JPG, WebP up to 10MB
                      </span>
                    </label>
                  </div>

                  {/* Live Preview */}
                  {formData.image && (
                    <div>
                      <span className="block text-xs font-bold text-neutral-700 mb-1.5">
                        Image Preview:
                      </span>
                      <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-neutral-200 shadow-xs bg-neutral-900">
                        <img
                          src={getImageUrl(formData.image)}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md ${
                              formData.badgeColor || 'bg-[#FF6B16] text-white'
                            }`}
                          >
                            {formData.badge || 'Featured'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB 4: ITINERARY BUILDER ── */}
              {activeFormTab === 'itinerary' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-black text-neutral-800">Day-by-Day Timeline</h3>
                      <p className="text-[11px] text-neutral-500">
                        Add structured days showing route, activities, and night stays
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddItineraryDay}
                      className="px-3 py-1.5 rounded-xl bg-orange-50 text-[#FF6B16] hover:bg-[#FF6B16] hover:text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Day</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.itinerary?.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl border border-neutral-200 bg-neutral-50/50 space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="text"
                              value={item.day}
                              onChange={(e) => handleUpdateItineraryDay(idx, 'day', e.target.value)}
                              placeholder="Day 1"
                              className="w-24 px-2.5 py-1.5 rounded-lg border border-neutral-300 text-xs font-black text-[#FF6B16] bg-white focus:outline-none"
                            />
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) =>
                                handleUpdateItineraryDay(idx, 'title', e.target.value)
                              }
                              placeholder="Day Title (e.g. Drive from Dehradun to Sankri)"
                              className="flex-1 px-3 py-1.5 rounded-lg border border-neutral-300 text-xs font-bold text-neutral-800 bg-white focus:outline-none"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveItineraryDay(idx)}
                            className="w-7 h-7 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                            title="Remove Day"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <textarea
                          rows={2}
                          value={item.desc}
                          onChange={(e) => handleUpdateItineraryDay(idx, 'desc', e.target.value)}
                          placeholder="Activities, scenic points, elevation, and stay info for this day..."
                          className="w-full p-2.5 rounded-lg border border-neutral-300 text-xs font-medium text-neutral-700 bg-white focus:outline-none"
                        />

                        {/* Day Photo Upload & URL Row */}
                        <div className="pt-2 border-t border-neutral-200/70 flex flex-col sm:flex-row sm:items-center gap-3">
                          {item.image ? (
                            <div className="relative w-28 h-20 rounded-xl overflow-hidden border border-neutral-300 shadow-xs shrink-0 group bg-neutral-900">
                              <img
                                src={getImageUrl(item.image)}
                                alt={item.title || item.day}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => handleUpdateItineraryDay(idx, 'image', '')}
                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/80 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer"
                                title="Remove photo"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="w-28 h-20 rounded-xl border-2 border-dashed border-neutral-300 bg-white flex flex-col items-center justify-center text-neutral-400 shrink-0">
                              <Upload className="w-4 h-4 mb-0.5 text-neutral-400" />
                              <span className="text-[9px] font-bold">No Photo</span>
                            </div>
                          )}

                          <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <div className="flex-1">
                              <input
                                type="text"
                                value={item.image || ''}
                                onChange={(e) => handleUpdateItineraryDay(idx, 'image', e.target.value)}
                                placeholder="Day photo URL or upload file..."
                                className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs text-neutral-700 bg-white focus:outline-none focus:border-[#FF6B16]"
                              />
                            </div>

                            <label
                              className={`px-3 py-2 rounded-lg bg-orange-50 hover:bg-orange-100 text-[#FF6B16] text-xs font-bold border border-orange-200 flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors shadow-2xs ${
                                uploadingDayIdx === idx ? 'opacity-50 pointer-events-none' : ''
                              }`}
                            >
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleItineraryImageUpload(idx, e.target.files?.[0])}
                                className="hidden"
                              />
                              <Upload className={`w-3.5 h-3.5 ${uploadingDayIdx === idx ? 'animate-bounce' : ''}`} />
                              <span>{uploadingDayIdx === idx ? 'Uploading...' : 'Upload Day Photo'}</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── TAB 5: INCLUSIONS & HIGHLIGHTS ── */}
              {activeFormTab === 'inclusions' && (
                <div className="space-y-5">
                  {/* Highlights */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Key Highlights
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={tempHighlight}
                        onChange={(e) => setTempHighlight(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addArrayItem('highlights', tempHighlight, setTempHighlight);
                          }
                        }}
                        placeholder="Add key highlight and press Enter..."
                        className="flex-1 px-3 py-2 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none focus:border-[#FF6B16]"
                      />
                      <button
                        type="button"
                        onClick={() => addArrayItem('highlights', tempHighlight, setTempHighlight)}
                        className="px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-neutral-700 cursor-pointer"
                      >
                        Add
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {formData.highlights?.map((h, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 text-[#FF6B16] text-[11px] font-bold"
                        >
                          <span>{h}</span>
                          <button
                            type="button"
                            onClick={() => removeArrayItem('highlights', i)}
                            className="hover:text-neutral-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Inclusions */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      What's Included
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={tempIncluded}
                        onChange={(e) => setTempIncluded(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addArrayItem('included', tempIncluded, setTempIncluded);
                          }
                        }}
                        placeholder="e.g. Experienced Trek Leader, All Meals..."
                        className="flex-1 px-3 py-2 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none focus:border-[#FF6B16]"
                      />
                      <button
                        type="button"
                        onClick={() => addArrayItem('included', tempIncluded, setTempIncluded)}
                        className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold cursor-pointer"
                      >
                        Add
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {formData.included?.map((inc, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-bold"
                        >
                          <Check className="w-3 h-3" />
                          <span>{inc}</span>
                          <button
                            type="button"
                            onClick={() => removeArrayItem('included', i)}
                            className="hover:text-emerald-900"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Exclusions */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      What's Excluded
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={tempExcluded}
                        onChange={(e) => setTempExcluded(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addArrayItem('excluded', tempExcluded, setTempExcluded);
                          }
                        }}
                        placeholder="e.g. Personal Porter, Airfare..."
                        className="flex-1 px-3 py-2 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none focus:border-[#FF6B16]"
                      />
                      <button
                        type="button"
                        onClick={() => addArrayItem('excluded', tempExcluded, setTempExcluded)}
                        className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold cursor-pointer"
                      >
                        Add
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {formData.excluded?.map((exc, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 text-[11px] font-bold"
                        >
                          <X className="w-3 h-3" />
                          <span>{exc}</span>
                          <button
                            type="button"
                            onClick={() => removeArrayItem('excluded', i)}
                            className="hover:text-rose-900"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 text-neutral-700 text-xs font-bold hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 rounded-xl bg-[#FF6B16] hover:bg-[#E55A0B] text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>{editingPackage ? 'Update Package' : 'Create Package'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CREATE / EDIT CATEGORY MODAL ── */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scale-up space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#FF6B16] flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-[#1A384C]">
                  {editingCategory ? 'Edit Travel Category' : 'Create New Category'}
                </h3>
              </div>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="w-7 h-7 rounded-full bg-neutral-100 text-neutral-500 hover:text-neutral-800 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitCategoryForm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={categoryFormData.name}
                  onChange={(e) =>
                    setCategoryFormData({ ...categoryFormData, name: e.target.value })
                  }
                  placeholder="e.g. Wildlife Safari, Beach & Island"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none focus:border-[#FF6B16]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={categoryFormData.description}
                  onChange={(e) =>
                    setCategoryFormData({ ...categoryFormData, description: e.target.value })
                  }
                  placeholder="Short description of this travel style..."
                  className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none focus:border-[#FF6B16]"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={categoryFormData.order}
                    onChange={(e) =>
                      setCategoryFormData({ ...categoryFormData, order: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none focus:border-[#FF6B16]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="cat-active"
                    checked={categoryFormData.isActive}
                    onChange={(e) =>
                      setCategoryFormData({ ...categoryFormData, isActive: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-[#FF6B16] focus:ring-[#FF6B16]"
                  />
                  <label htmlFor="cat-active" className="text-xs font-bold text-neutral-800 cursor-pointer">
                    Active
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 text-neutral-700 text-xs font-bold hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-[#FF6B16] hover:bg-[#E55A0B] text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CATEGORY CONFIRMATION MODAL ── */}
      {deleteConfirmCategory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl animate-scale-up space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#1A384C]">Delete Category?</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Are you sure you want to delete category <b>{deleteConfirmCategory.name}</b>?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmCategory(null)}
                className="px-4 py-2 rounded-xl border border-neutral-200 text-neutral-700 text-xs font-bold hover:bg-neutral-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCategory}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer shadow-md disabled:opacity-50"
              >
                {actionLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE PACKAGE CONFIRMATION MODAL ── */}
      {deleteConfirmPkg && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl animate-scale-up space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#1A384C]">Delete Package?</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Are you sure you want to delete <b>{deleteConfirmPkg.name}</b>? This action cannot be
                undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmPkg(null)}
                className="px-4 py-2 rounded-xl border border-neutral-200 text-neutral-700 text-xs font-bold hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeletePackage}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-md disabled:opacity-50"
              >
                {actionLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PackageManager;
