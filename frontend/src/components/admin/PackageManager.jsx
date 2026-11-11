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
  MessageCircle,
  Shield,
  HelpCircle,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  Film,
  Video,
} from 'lucide-react';
import { getDefaultPackageFAQs } from '../packages/PackageFAQ';

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
    gstRate: 5,
    rating: 4.9,
    reviewsCount: 150,
    image: '/newimage/exploresection/kedarkantha.png',
    travelType: categories[0]?.name || 'Treks',
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
    availability: {
      scheduleType: 'daily', // 'daily' | 'weekends' | 'batches' | 'custom'
      defaultSeatsPerBatch: 16,
      minAdvanceNoticeDays: 1,
      batches: [],
      blackoutDates: [],
    },
    pricingType: 'standard', // 'standard' | 'sharing' | 'distance' | 'custom'
    pricingTiers: [],
    isFeatured: false,
    isTrending: true,
    isPrivateTrek: false,
    privateTrekNote: 'Direct WhatsApp Booking • Custom Batches',
    isActive: true,
    order: 0,
    faqs: [],
    reels: [],
  };

  const [formData, setFormData] = useState(initialFormData);

  // Package Reels State (Max 5 Reels per package)
  const [newReel, setNewReel] = useState({
    video: '',
    poster: '',
    author: '',
    location: '',
  });
  const [uploadingReelVideo, setUploadingReelVideo] = useState(false);
  const [reelUploadProgress, setReelUploadProgress] = useState(0);
  const [reelUploadError, setReelUploadError] = useState('');
  const packageReelInputRef = React.useRef(null);

  // Handle Reel Video Upload (Direct file to /api/reels/upload, max 20MB)
  const handleUploadReelVideo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setReelUploadError(`Video size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds 20MB limit. Please compress before uploading.`);
      showToast('error', 'Video exceeds 20MB limit. Please compress.');
      if (packageReelInputRef.current) packageReelInputRef.current.value = '';
      return;
    }

    try {
      setUploadingReelVideo(true);
      setReelUploadError('');
      setReelUploadProgress(25);

      const uploadBody = new FormData();
      uploadBody.append('file', file);

      setReelUploadProgress(50);
      const res = await fetch(`${API_BASE_URL}/reels/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadBody,
      });

      setReelUploadProgress(85);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to upload video');
      }

      setReelUploadProgress(100);
      const derivedPoster =
        data.posterUrl ||
        (data.url && data.url.includes('cloudinary.com')
          ? data.url.replace(/\.[^/.]+$/, '.jpg')
          : '');

      setNewReel((prev) => ({
        ...prev,
        video: data.url,
        poster: derivedPoster || prev.poster,
        location: prev.location || formData.location || formData.name || '',
      }));

      showToast('success', 'Video uploaded successfully to Cloudinary!');
    } catch (err) {
      console.error('Reel Upload Error:', err);
      setReelUploadError(err.message || 'Upload failed');
      showToast('error', err.message || 'Failed to upload video');
    } finally {
      setUploadingReelVideo(false);
      setReelUploadProgress(0);
      if (packageReelInputRef.current) packageReelInputRef.current.value = '';
    }
  };

  // Add reel to package list
  const handleAddReelToPackage = () => {
    const currentReels = Array.isArray(formData.reels) ? formData.reels : [];
    if (currentReels.length >= 5) {
      showToast('error', 'Maximum 5 reels allowed per package');
      return;
    }

    if (!newReel.video || !newReel.video.trim()) {
      showToast('error', 'Please upload a video file or enter a video URL');
      return;
    }

    const reelToAdd = {
      id: `reel_${Date.now()}`,
      video: newReel.video.trim(),
      poster: newReel.poster.trim(),
      author: newReel.author.trim() || 'Weekend Explorer',
      location: newReel.location.trim() || formData.location || formData.name || 'Expedition',
      order: currentReels.length,
    };

    setFormData((prev) => ({
      ...prev,
      reels: [...(Array.isArray(prev.reels) ? prev.reels : []), reelToAdd],
    }));

    setNewReel({
      video: '',
      poster: '',
      author: '',
      location: '',
    });
    showToast('success', `Reel added! (${currentReels.length + 1}/5 reels)`);
  };

  // Remove reel from package
  const handleRemoveReelFromPackage = (index) => {
    setFormData((prev) => ({
      ...prev,
      reels: (prev.reels || []).filter((_, idx) => idx !== index),
    }));
    showToast('info', 'Reel removed');
  };

  // Move reel up / down
  const handleMoveReel = (index, direction) => {
    const list = [...(formData.reels || [])];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    setFormData((prev) => ({ ...prev, reels: list }));
  };

  // FAQ Builder Temp State
  const [newFaq, setNewFaq] = useState({
    question: '',
    answer: '',
  });

  const handleAddFaq = () => {
    if (!newFaq.question.trim() || !newFaq.answer.trim()) return;
    setFormData((prev) => ({
      ...prev,
      faqs: [...(prev.faqs || []), { question: newFaq.question.trim(), answer: newFaq.answer.trim() }],
    }));
    setNewFaq({ question: '', answer: '' });
  };

  const handleRemoveFaq = (idx) => {
    setFormData((prev) => ({
      ...prev,
      faqs: (prev.faqs || []).filter((_, i) => i !== idx),
    }));
  };

  const handleLoadDefaultsForPackage = () => {
    const defaults = getDefaultPackageFAQs(formData);
    setFormData((prev) => ({
      ...prev,
      faqs: defaults.map((d) => ({
        question: d.question,
        answer: d.answer,
      })),
    }));
  };

  const handleUpdateFaqItem = (idx, field, val) => {
    setFormData((prev) => {
      const next = [...(prev.faqs || [])];
      next[idx] = { ...next[idx], [field]: val };
      return { ...prev, faqs: next };
    });
  };

  const handleMoveFaq = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || !formData.faqs || targetIdx >= formData.faqs.length) return;
    setFormData((prev) => {
      const next = [...(prev.faqs || [])];
      const [item] = next.splice(idx, 1);
      next.splice(targetIdx, 0, item);
      return { ...prev, faqs: next };
    });
  };

  // Availability Builder Temp States
  const [newBatch, setNewBatch] = useState({
    startDate: '',
    endDate: '',
    totalSeats: 16,
    status: 'auto',
    note: '',
  });
  const [newBlackout, setNewBlackout] = useState({
    date: '',
    reason: '',
  });

  // Dynamic Pricing Tier Temp State
  const [newTier, setNewTier] = useState({
    name: '',
    subtext: '',
    price: '',
    originalPrice: '',
  });

  const showToast = (type, text) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    refreshPackages(true);
    refreshCategories(true);
  }, [refreshPackages, refreshCategories]);

  // Open Add Package Modal
  const handleOpenAddModal = (isPrivate = false) => {
    setEditingPackage(null);
    setFormData({
      ...initialFormData,
      travelType: categories[0]?.name || 'Treks',
      isPrivateTrek: isPrivate,
      badge: isPrivate ? 'Private Trek' : '',
      badgeColor: isPrivate ? 'bg-emerald-600 text-white' : 'bg-[#FF6B16] text-white',
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
      gstRate: pkg.gstRate !== undefined && pkg.gstRate !== null ? Number(pkg.gstRate) : 5,
      rating: pkg.rating || 4.9,
      reviewsCount: pkg.reviewsCount || 100,
      image: pkg.image || '/newimage/exploresection/kedarkantha.png',
      travelType: pkg.travelType || categories[0]?.name || 'Treks',
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
      availability: pkg.availability ? {
        scheduleType: pkg.availability.scheduleType || 'daily',
        defaultSeatsPerBatch: pkg.availability.defaultSeatsPerBatch || 16,
        minAdvanceNoticeDays: pkg.availability.minAdvanceNoticeDays ?? 1,
        batches: Array.isArray(pkg.availability.batches) ? [...pkg.availability.batches] : [],
        blackoutDates: Array.isArray(pkg.availability.blackoutDates) ? [...pkg.availability.blackoutDates] : [],
      } : {
        scheduleType: 'daily',
        defaultSeatsPerBatch: 16,
        minAdvanceNoticeDays: 1,
        batches: [],
        blackoutDates: [],
      },
      pricingType: pkg.pricingType || 'standard',
      pricingTiers: Array.isArray(pkg.pricingTiers) ? [...pkg.pricingTiers] : [],
      isFeatured: !!pkg.isFeatured,
      isTrending: pkg.isTrending !== undefined ? !!pkg.isTrending : true,
      isPrivateTrek: !!pkg.isPrivateTrek,
      privateTrekNote: pkg.privateTrekNote || 'Direct WhatsApp Booking • Custom Batches',
      isActive: pkg.isActive !== undefined ? !!pkg.isActive : true,
      order: pkg.order || 0,
      faqs: Array.isArray(pkg.faqs) ? [...pkg.faqs] : [],
      reels: Array.isArray(pkg.reels)
        ? pkg.reels.map((r, i) => ({ ...r, id: r._id || r.id || `reel_${Date.now()}_${i}` }))
        : [],
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

  // Availability & Batch helpers
  const handleUpdateAvailabilityField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      availability: {
        ...(prev.availability || {}),
        [field]: value,
      },
    }));
  };

  const handleAddBatch = () => {
    if (!newBatch.startDate) {
      showToast('error', 'Batch start date is required');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      availability: {
        ...(prev.availability || {}),
        batches: [
          ...(prev.availability?.batches || []),
          {
            ...newBatch,
            totalSeats: Number(newBatch.totalSeats) || 16,
            bookedSeats: 0,
          },
        ],
      },
    }));
    setNewBatch({
      startDate: '',
      endDate: '',
      totalSeats: formData.availability?.defaultSeatsPerBatch || 16,
      status: 'auto',
      note: '',
    });
    showToast('success', 'Departure batch added!');
  };

  const handleRemoveBatch = (index) => {
    setFormData((prev) => ({
      ...prev,
      availability: {
        ...(prev.availability || {}),
        batches: (prev.availability?.batches || []).filter((_, i) => i !== index),
      },
    }));
  };

  const handleUpdateBatch = (index, field, value) => {
    setFormData((prev) => {
      const updatedBatches = [...(prev.availability?.batches || [])];
      updatedBatches[index] = { ...updatedBatches[index], [field]: value };
      return {
        ...prev,
        availability: {
          ...(prev.availability || {}),
          batches: updatedBatches,
        },
      };
    });
  };

  const handleAddBlackout = () => {
    if (!newBlackout.date) {
      showToast('error', 'Blackout date is required');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      availability: {
        ...(prev.availability || {}),
        blackoutDates: [
          ...(prev.availability?.blackoutDates || []),
          {
            date: newBlackout.date,
            reason: newBlackout.reason.trim() || 'Operational closure / Maintenance',
          },
        ],
      },
    }));
    setNewBlackout({ date: '', reason: '' });
    showToast('success', 'Blackout date added');
  };

  const handleRemoveBlackout = (index) => {
    setFormData((prev) => ({
      ...prev,
      availability: {
        ...(prev.availability || {}),
        blackoutDates: (prev.availability?.blackoutDates || []).filter((_, i) => i !== index),
      },
    }));
  };

  // ── DYNAMIC PRICING TIERS HELPERS (SHARING & DISTANCE) ──
  const handleLoadSharingPresets = () => {
    const baseP = Number(formData.price) || 8999;
    setFormData((prev) => ({
      ...prev,
      pricingType: 'sharing',
      pricingTiers: [
        { name: 'Quad Sharing', subtext: 'Camp in Kedarnath', price: baseP, originalPrice: Math.round(baseP * 1.3), isDefault: true },
        { name: 'Triple Sharing', subtext: 'Camp in Kedarnath', price: baseP + 500, originalPrice: Math.round((baseP + 500) * 1.3), isDefault: false },
        { name: 'Double Sharing', subtext: 'Camp in Kedarnath', price: baseP + 1000, originalPrice: Math.round((baseP + 1000) * 1.3), isDefault: false },
      ],
    }));
    showToast('success', 'Loaded Quad, Triple, and Double sharing preset tiers!');
  };

  const handleLoadDistancePresets = () => {
    const baseP = Number(formData.price) || 5999;
    const dest = formData.name?.split(' ')[0] || 'Manali';
    setFormData((prev) => ({
      ...prev,
      pricingType: 'distance',
      pricingTiers: [
        { name: `${dest} to ${dest}`, subtext: 'Ex-Basecamp (Direct Report)', price: baseP, originalPrice: Math.round(baseP * 1.4), isDefault: true },
        { name: 'Delhi to Delhi', subtext: 'Including AC Volvo Bus Transfers', price: baseP + 2000, originalPrice: Math.round((baseP + 2000) * 1.4), isDefault: false },
      ],
    }));
    showToast('success', 'Loaded Route / Distance based preset tiers!');
  };

  const handleAddPricingTier = () => {
    if (!newTier.name.trim() || !newTier.price) {
      showToast('error', 'Tier name and price are required');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      pricingTiers: [
        ...(prev.pricingTiers || []),
        {
          name: newTier.name.trim(),
          subtext: newTier.subtext.trim(),
          price: Number(newTier.price),
          originalPrice: newTier.originalPrice ? Number(newTier.originalPrice) : null,
          isDefault: (prev.pricingTiers || []).length === 0,
        },
      ],
    }));
    setNewTier({ name: '', subtext: '', price: '', originalPrice: '' });
    showToast('success', 'Pricing tier added!');
  };

  const handleRemovePricingTier = (index) => {
    setFormData((prev) => ({
      ...prev,
      pricingTiers: (prev.pricingTiers || []).filter((_, i) => i !== index),
    }));
  };

  const handleUpdatePricingTier = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...(prev.pricingTiers || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, pricingTiers: updated };
    });
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
      const payload = {
        ...formData,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
        gstRate: formData.gstRate !== undefined && formData.gstRate !== '' ? Number(formData.gstRate) : 5,
      };

      if (editingPackage) {
        const targetId = editingPackage._id || editingPackage.id;
        const res = await updatePackage(targetId, payload);
        if (res.success) {
          showToast('success', `Package "${formData.name}" updated successfully!`);
          setShowModal(false);
        } else {
          showToast('error', res.message || 'Update failed');
        }
      } else {
        const res = await createPackage(payload);
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
      (selectedStatusFilter === 'Inactive' && pkg.isActive === false) ||
      (selectedStatusFilter === 'Private' && pkg.isPrivateTrek === true);

    return matchesSearch && matchesType && matchesStatus;
  });

  // KPI counts
  const totalCount = packages.length;
  const activeCount = packages.filter((p) => p.isActive !== false).length;
  const trendingCount = packages.filter((p) => p.isTrending !== false).length;
  const privateCount = packages.filter((p) => p.isPrivateTrek === true).length;
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
                  onClick={() => handleOpenAddModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  title="Create a package specifically for Private Treks section (Direct WhatsApp Booking)"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>+ Private Trek</span>
                </button>

                <button
                  onClick={() => handleOpenAddModal(false)}
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

        {/* 5 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
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
              <span className="text-xs font-bold text-neutral-500">Trending</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-600 mt-2">{trendingCount}</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-500">Private Treks</span>
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <MessageCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-teal-600 mt-2">{privateCount}</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-500">Categories</span>
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
                <option value="Private">Private Treks (WhatsApp)</option>
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
                    <th className="py-3 px-4 text-center">Private Trek</th>
                    <th className="py-3 px-4 text-center">Trending</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-xs">
                  {filteredPackages.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-neutral-400">
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
                              <div className="flex items-center gap-3 text-neutral-500 text-[11px] mt-1 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-[#FF6B16]" />
                                  {pkg.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-neutral-400" />
                                  {pkg.duration}
                                </span>
                                <span
                                  className={`flex items-center gap-1 font-bold px-1.5 py-0.5 rounded text-[10px] ${
                                    (pkg.reels?.length || 0) > 0
                                      ? 'bg-orange-100 text-[#FF6B16]'
                                      : 'bg-neutral-100 text-neutral-400'
                                  }`}
                                  title="Package specific experience reels"
                                >
                                  <Film className="w-3 h-3" />
                                  {pkg.reels?.length || 0}/5 Reels
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-1 rounded-lg bg-orange-50 text-[#FF6B16] font-bold text-[11px]">
                            {pkg.travelType || 'Treks'}
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

                        {/* Private Trek Toggle */}
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(pkg, 'isPrivateTrek')}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                              pkg.isPrivateTrek === true
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                                : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'
                            }`}
                            title={
                              pkg.isPrivateTrek
                                ? 'Private Trek Active: Direct WhatsApp booking'
                                : 'Click to enable as Private Trek (WhatsApp)'
                            }
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>{pkg.isPrivateTrek ? 'WhatsApp' : 'Regular'}</span>
                          </button>
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
              const packageCount = packages.filter((p) => {
                const pt = (p.travelType || '').toLowerCase().trim();
                const pn = (p.name || '').toLowerCase().trim();
                const ct = (cat.name || '').toLowerCase().trim();
                if (pt === ct || pt.includes(ct) || ct.includes(pt)) return true;
                const words = ct
                  .split(/[&,/ \-_]+/)
                  .map((w) => w.trim().toLowerCase())
                  .filter((w) => w.length >= 3 && !['trips', 'tours', 'escapes'].includes(w));
                return words.some((w) => {
                  let stem = w;
                  if (stem.endsWith('ing') && stem.length > 5) stem = stem.slice(0, -3);
                  else if (stem.endsWith('s') && stem.length > 3) stem = stem.slice(0, -1);
                  return (pt && pt.includes(stem)) || (pn && pn.includes(stem));
                });
              }).length;

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
                { id: 'reels', label: `Reels (${formData.reels?.length || 0}/5)` },
                { id: 'itinerary', label: 'Itinerary Builder' },
                { id: 'availability', label: 'Batches & Availability' },
                { id: 'inclusions', label: 'Inclusions & Highlights' },
                { id: 'faqs', label: 'FAQs' },
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

                    {/* Private Trek Direct WhatsApp Toggle */}
                    <div className="w-full">
                      <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 cursor-pointer hover:bg-emerald-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.isPrivateTrek}
                          onChange={(e) => setFormData({ ...formData, isPrivateTrek: e.target.checked })}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-0.5 shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-emerald-950">
                              Show in "Private Treks & Custom Batches" Section
                            </span>
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                              Direct WhatsApp Only
                            </span>
                          </div>
                          <p className="text-[11px] text-emerald-800 font-medium mt-0.5">
                            When enabled, online checkout is replaced with a direct WhatsApp booking and custom batch inquiry button, allowing your team to consult and quote custom prices directly.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 2: PRICING & BADGES ── */}
              {activeFormTab === 'pricing' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Selling Price (₹ / person) <span className="text-rose-500">*</span>
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
                        Original / Strikethrough (₹)
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

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-neutral-700">
                          GST Rate (%)
                        </label>
                        <span className="text-[10px] font-black text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                          +{Number(formData.gstRate !== undefined ? formData.gstRate : 5)}% GST
                        </span>
                      </div>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="28"
                        value={formData.gstRate !== undefined ? formData.gstRate : 5}
                        onChange={(e) => setFormData({ ...formData, gstRate: e.target.value })}
                        placeholder="5"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none focus:border-[#FF6B16]"
                      />
                    </div>
                  </div>

                  {/* GST Calculation Preview Strip */}
                  <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-700">Live Breakdown:</span>
                      <span className="text-neutral-500">
                        Base ₹{Number(formData.price || 0).toLocaleString('en-IN')} + ₹{((Number(formData.price || 0) * Number(formData.gstRate !== undefined ? formData.gstRate : 5)) / 100).toFixed(2)} ({formData.gstRate !== undefined ? formData.gstRate : 5}% GST)
                      </span>
                    </div>
                    <div className="font-black text-teal-700 text-sm">
                      Total: ₹{(Number(formData.price || 0) + ((Number(formData.price || 0) * Number(formData.gstRate !== undefined ? formData.gstRate : 5)) / 100)).toFixed(2)}
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

                  {/* ── DYNAMIC PRICING TIERS SECTION (SHARING & DISTANCE BASED) ── */}
                  <div className="pt-4 border-t border-neutral-200 space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-black text-neutral-800 uppercase tracking-wider">
                          Package Pricing Format (Dynamic Tiers)
                        </label>
                        <span className="text-[11px] font-bold text-[#FF6B16] bg-orange-50 px-2 py-0.5 rounded-full">
                          Sharing & Distance Options
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Choose whether this package has sharing-based pricing (Quad, Triple, Double) or route/distance-based pricing (Delhi to Delhi, Manali to Manali).
                      </p>
                    </div>

                    {/* Mode Selector Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        {
                          id: 'standard',
                          label: 'Standard',
                          desc: 'Single base price',
                          icon: '🏷️',
                        },
                        {
                          id: 'sharing',
                          label: 'Sharing Based',
                          desc: 'Quad, Triple, Double',
                          icon: '👥',
                        },
                        {
                          id: 'distance',
                          label: 'Route / Distance',
                          desc: 'Delhi, Manali, etc.',
                          icon: '🚌',
                        },
                        {
                          id: 'custom',
                          label: 'Custom Tiers',
                          desc: 'Custom variants',
                          icon: '⚙️',
                        },
                      ].map((mode) => {
                        const isSelected = (formData.pricingType || 'standard') === mode.id;
                        return (
                          <div
                            key={mode.id}
                            onClick={() => setFormData({ ...formData, pricingType: mode.id })}
                            className={`p-3 rounded-xl border-2 transition-all cursor-pointer text-center ${
                              isSelected
                                ? 'border-[#FF6B16] bg-orange-50/60 ring-1 ring-[#FF6B16]'
                                : 'border-neutral-200 bg-white hover:border-neutral-300'
                            }`}
                          >
                            <span className="text-lg block mb-0.5">{mode.icon}</span>
                            <div className="text-xs font-bold text-[#1A384C]">{mode.label}</div>
                            <div className="text-[10px] text-neutral-400">{mode.desc}</div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Tiers Editor if not standard */}
                    {formData.pricingType && formData.pricingType !== 'standard' && (
                      <div className="space-y-3 bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
                        {/* Preset Buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-neutral-200">
                          <span className="text-xs font-bold text-neutral-700">Quick 1-Click Presets:</span>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={handleLoadSharingPresets}
                              className="px-2.5 py-1 bg-white hover:bg-neutral-100 text-neutral-700 text-[11px] font-bold rounded-lg border border-neutral-200 transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                            >
                              <span>👥 Load Sharing Presets</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleLoadDistancePresets}
                              className="px-2.5 py-1 bg-white hover:bg-neutral-100 text-neutral-700 text-[11px] font-bold rounded-lg border border-neutral-200 transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                            >
                              <span>🚌 Load Route / Distance Presets</span>
                            </button>
                          </div>
                        </div>

                        {/* Add Tier Bar */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end pt-1">
                          <div className="sm:col-span-4">
                            <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                              Tier Name <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder={
                                formData.pricingType === 'sharing'
                                  ? 'e.g. Quad Sharing'
                                  : 'e.g. Delhi to Delhi'
                              }
                              value={newTier.name}
                              onChange={(e) => setNewTier({ ...newTier, name: e.target.value })}
                              className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-neutral-200 text-xs font-medium focus:outline-none focus:border-[#FF6B16]"
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                              Subtext / Stay Details
                            </label>
                            <input
                              type="text"
                              placeholder={
                                formData.pricingType === 'sharing'
                                  ? 'e.g. Camp in Kedarnath'
                                  : 'e.g. Volvo AC Bus Included'
                              }
                              value={newTier.subtext}
                              onChange={(e) => setNewTier({ ...newTier, subtext: e.target.value })}
                              className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-neutral-200 text-xs font-medium focus:outline-none focus:border-[#FF6B16]"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                              Price (₹) <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="number"
                              min="0"
                              placeholder="8999"
                              value={newTier.price}
                              onChange={(e) => setNewTier({ ...newTier, price: e.target.value })}
                              className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-neutral-200 text-xs font-medium focus:outline-none focus:border-[#FF6B16]"
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <button
                              type="button"
                              onClick={handleAddPricingTier}
                              className="w-full py-1.5 px-3 bg-[#FF6B16] hover:bg-[#E55A0B] text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Option</span>
                            </button>
                          </div>
                        </div>

                        {/* Tiers List */}
                        {formData.pricingTiers?.length > 0 ? (
                          <div className="space-y-2 pt-2">
                            {formData.pricingTiers.map((tier, tIdx) => (
                              <div
                                key={tIdx}
                                className="p-3 bg-white rounded-xl border border-neutral-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs"
                              >
                                <div className="flex-1 min-w-[200px]">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={tier.name}
                                      onChange={(e) =>
                                        handleUpdatePricingTier(tIdx, 'name', e.target.value)
                                      }
                                      className="font-bold text-xs text-neutral-900 border-b border-transparent hover:border-neutral-300 focus:border-[#FF6B16] outline-none"
                                    />
                                    <span className="text-[10px] text-neutral-400 font-semibold">
                                      Tier {tIdx + 1}
                                    </span>
                                  </div>
                                  <input
                                    type="text"
                                    value={tier.subtext || ''}
                                    onChange={(e) =>
                                      handleUpdatePricingTier(tIdx, 'subtext', e.target.value)
                                    }
                                    placeholder="Optional subtext (e.g. Camp in Kedarnath)"
                                    className="text-[11px] text-neutral-500 w-full border-b border-transparent hover:border-neutral-300 focus:border-[#FF6B16] outline-none mt-0.5"
                                  />
                                </div>

                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs font-bold text-neutral-600">₹</span>
                                    <input
                                      type="number"
                                      value={tier.price}
                                      onChange={(e) =>
                                        handleUpdatePricingTier(tIdx, 'price', Number(e.target.value))
                                      }
                                      className="w-20 px-2 py-1 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-black text-emerald-600 focus:outline-none focus:border-[#FF6B16]"
                                    />
                                    <span className="text-[10px] text-neutral-400">/ person</span>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleRemovePricingTier(tIdx)}
                                    className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                    title="Delete Tier"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl border border-dashed border-neutral-200 text-center text-xs text-neutral-400">
                            No pricing tiers added yet. Click a preset above or add custom tiers.
                          </div>
                        )}

                        {/* Live Visual Preview of Section */}
                        {formData.pricingTiers?.length > 0 && (
                          <div className="pt-3 border-t border-neutral-200">
                            <span className="block text-[11px] font-black text-neutral-400 uppercase tracking-wider mb-2">
                              Live UI Preview on Website (Package Details)
                            </span>
                            <div className="space-y-2.5 p-3.5 bg-white rounded-2xl border border-neutral-200 shadow-2xs">
                              {formData.pricingTiers.map((tier, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-3.5 rounded-2xl border border-neutral-200 hover:border-neutral-300 transition-all bg-white"
                                >
                                  <div>
                                    <div className="font-bold text-sm text-neutral-900">
                                      {tier.name || 'Tier Option'}
                                    </div>
                                    {tier.subtext && (
                                      <div className="text-xs text-neutral-400 mt-0.5">
                                        {tier.subtext}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="text-right">
                                      <div className="text-lg font-black text-[#0E9F6E]">
                                        ₹{(Number(tier.price) || 0).toLocaleString('en-IN')}
                                      </div>
                                      <div className="text-[10px] text-neutral-400">per person</div>
                                    </div>
                                    <span className="px-3.5 py-1.5 rounded-full bg-[#ECFDF5] text-[#0E9F6E] font-bold text-xs border border-[#A7F3D0]">
                                      Book Now
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
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

              {/* ── TAB: PACKAGE REELS (MAX 5) ── */}
              {activeFormTab === 'reels' && (
                <div className="space-y-6">
                  {/* Header Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50/40 to-neutral-50 border border-orange-200/60 shadow-xs">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Film className="w-4 h-4 text-[#FF6B16]" />
                        <h3 className="text-sm font-black text-neutral-800">
                          Package Experience Reels (Max 5)
                        </h3>
                      </div>
                      <p className="text-xs text-neutral-600 leading-relaxed">
                        Upload short vertical reels (like Instagram Reels/Shorts) specifically for this tour package. Explorers will see these on this package's detail page!
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-black shadow-xs ${
                          (formData.reels?.length || 0) >= 5
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-white text-[#FF6B16] border border-orange-200'
                        }`}
                      >
                        {formData.reels?.length || 0} / 5 Reels
                      </span>
                    </div>
                  </div>

                  {/* Add New Reel Card (if < 5) */}
                  {(formData.reels?.length || 0) < 5 ? (
                    <div className="p-5 rounded-2xl border border-neutral-200 bg-white shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                          <Plus className="w-3.5 h-3.5 text-[#FF6B16]" />
                          Add Reel #{(formData.reels?.length || 0) + 1}
                        </h4>
                        <span className="text-[11px] text-neutral-400 font-medium">
                          MP4, MOV, WebM (Max 20MB)
                        </span>
                      </div>

                      {/* Video Upload Box */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border-2 border-dashed border-neutral-200 rounded-xl p-4 text-center hover:border-[#FF6B16] transition-colors bg-neutral-50/60 flex flex-col items-center justify-center min-h-[140px]">
                          <input
                            type="file"
                            id="package-reel-video-file"
                            ref={packageReelInputRef}
                            accept="video/mp4,video/quicktime,video/webm,video/x-matroska"
                            onChange={handleUploadReelVideo}
                            disabled={uploadingReelVideo}
                            className="hidden"
                          />
                          <label
                            htmlFor="package-reel-video-file"
                            className="cursor-pointer flex flex-col items-center justify-center w-full"
                          >
                            <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF6B16] flex items-center justify-center mb-2 shadow-xs">
                              <Video className={`w-5 h-5 ${uploadingReelVideo ? 'animate-bounce' : ''}`} />
                            </div>
                            <span className="text-xs font-extrabold text-neutral-800">
                              {uploadingReelVideo ? 'Uploading to Cloudinary...' : 'Click to Upload Video File'}
                            </span>
                            <span className="text-[10px] text-neutral-400 mt-0.5">
                              Short vertical clip (under 20MB)
                            </span>
                          </label>

                          {uploadingReelVideo && (
                            <div className="w-full mt-3 px-2">
                              <div className="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-[#FF6B16] h-full transition-all duration-300"
                                  style={{ width: `${reelUploadProgress}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-neutral-500 mt-1 block font-bold">
                                Uploading {reelUploadProgress}%
                              </span>
                            </div>
                          )}

                          {reelUploadError && (
                            <p className="text-[11px] text-rose-600 font-semibold mt-2">
                              {reelUploadError}
                            </p>
                          )}
                        </div>

                        {/* Or Video URL input */}
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                              Or Paste Video URL (Cloudinary / MP4) <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={newReel.video}
                              onChange={(e) => setNewReel({ ...newReel, video: e.target.value })}
                              placeholder="https://res.cloudinary.com/.../video.mp4"
                              className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none focus:border-[#FF6B16]"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2.5">
                            <div>
                              <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                                Traveler / Author
                              </label>
                              <input
                                type="text"
                                value={newReel.author}
                                onChange={(e) => setNewReel({ ...newReel, author: e.target.value })}
                                placeholder="e.g. Priya & Rahul"
                                className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none focus:border-[#FF6B16]"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                                Location / Tag
                              </label>
                              <input
                                type="text"
                                value={newReel.location}
                                onChange={(e) => setNewReel({ ...newReel, location: e.target.value })}
                                placeholder="e.g. Summit Camp"
                                className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none focus:border-[#FF6B16]"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                              Poster / Thumbnail URL (Optional)
                            </label>
                            <input
                              type="text"
                              value={newReel.poster}
                              onChange={(e) => setNewReel({ ...newReel, poster: e.target.value })}
                              placeholder="Auto-derived or paste image URL"
                              className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none focus:border-[#FF6B16]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Video Live Preview if URL is set */}
                      {newReel.video && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                          <div className="w-16 h-24 rounded-lg bg-black overflow-hidden shrink-0 shadow-xs relative">
                            <video
                              src={newReel.video}
                              muted
                              playsInline
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-block mb-1">
                              Ready to Add
                            </span>
                            <p className="text-xs font-bold text-neutral-800 truncate">
                              {newReel.author || 'Weekend Explorer'} • {newReel.location || formData.name}
                            </p>
                            <p className="text-[11px] text-neutral-500 truncate mt-0.5 font-mono">
                              {newReel.video}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleAddReelToPackage}
                            className="px-4 py-2 rounded-xl bg-[#FF6B16] hover:bg-[#e05809] text-white text-xs font-bold shadow-md shadow-[#FF6B16]/25 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Reel</span>
                          </button>
                        </div>
                      )}

                      {!newReel.video && (
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={handleAddReelToPackage}
                            disabled={!newReel.video}
                            className="px-4 py-2 rounded-xl bg-neutral-200 text-neutral-400 text-xs font-bold cursor-not-allowed flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Upload or Enter Video to Add</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-neutral-100 border border-neutral-200 text-center text-xs font-bold text-neutral-600">
                      Maximum 5 reels limit reached for this package. Remove a reel below if you wish to upload a new one.
                    </div>
                  )}

                  {/* List of Current Package Reels */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-wider text-neutral-700">
                        Added Reels ({formData.reels?.length || 0} of 5)
                      </h4>
                      {(formData.reels?.length || 0) > 1 && (
                        <span className="text-[11px] text-neutral-400 font-medium">
                          Use arrows to change display order
                        </span>
                      )}
                    </div>

                    {(!formData.reels || formData.reels.length === 0) ? (
                      <div className="p-8 rounded-2xl border-2 border-dashed border-neutral-200 text-center bg-neutral-50/50">
                        <Film className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                        <p className="text-xs font-bold text-neutral-700">
                          No custom reels uploaded for this package yet
                        </p>
                        <p className="text-[11px] text-neutral-400 max-w-sm mx-auto mt-1">
                          When empty, the package details page will automatically display global testimonial reels as fallback. Upload custom reels above to show package-specific explorer videos!
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {formData.reels.map((reel, idx) => (
                          <div
                            key={reel.id || reel._id || idx}
                            className="relative rounded-2xl border border-neutral-200 bg-white p-3 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                          >
                            <div className="flex gap-3">
                              {/* Video thumbnail preview */}
                              <div className="w-20 h-28 rounded-xl bg-neutral-900 overflow-hidden relative shrink-0 shadow-inner group">
                                {reel.poster ? (
                                  <img
                                    src={getImageUrl(reel.poster)}
                                    alt={reel.author}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <video
                                    src={`${reel.video}#t=0.001`}
                                    preload="metadata"
                                    muted
                                    className="w-full h-full object-cover"
                                  />
                                )}
                                <div className="absolute top-1 left-1 bg-black/70 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                                  #{idx + 1}
                                </div>
                              </div>

                              {/* Details */}
                              <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
                                <div>
                                  <span className="text-xs font-black text-neutral-800 block truncate">
                                    {reel.author || 'Weekend Explorer'}
                                  </span>
                                  <span className="text-[11px] font-medium text-neutral-500 block truncate mt-0.5">
                                    📍 {reel.location || formData.name}
                                  </span>
                                  <a
                                    href={reel.video}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-[#FF6B16] hover:underline font-mono truncate block mt-1"
                                    title={reel.video}
                                  >
                                    View Video Link ↗
                                  </a>
                                </div>

                                {/* Order & Delete Controls */}
                                <div className="flex items-center gap-1.5 mt-2">
                                  <button
                                    type="button"
                                    onClick={() => handleMoveReel(idx, 'up')}
                                    disabled={idx === 0}
                                    title="Move reel left/up"
                                    className="w-7 h-7 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveReel(idx, 'down')}
                                    disabled={idx === (formData.reels?.length || 0) - 1}
                                    title="Move reel right/down"
                                    className="w-7 h-7 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveReelFromPackage(idx)}
                                    title="Delete reel"
                                    className="w-7 h-7 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 flex items-center justify-center ml-auto transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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

              {/* ── TAB: BATCHES & AVAILABILITY ── */}
              {activeFormTab === 'availability' && (
                <div className="space-y-6">
                  {/* Schedule Mode Selector */}
                  <div>
                    <label className="block text-xs font-black text-neutral-800 uppercase tracking-wider mb-2">
                      Departure Schedule Mode <span className="text-rose-500">*</span>
                    </label>
                    <p className="text-xs text-neutral-500 mb-3">
                      Choose how this package operates so travelers see the correct departure dates and instant availability.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {[
                        {
                          id: 'daily',
                          title: 'Every Day (Daily)',
                          badge: '365 Days',
                          desc: 'Trip operates every day. Open booking for any calendar date.',
                          icon: '🌟',
                        },
                        {
                          id: 'weekends',
                          title: 'Every Weekend',
                          badge: 'Fri & Sat Batches',
                          desc: 'Automatic departures on Fridays and Saturdays for weekend escapes.',
                          icon: '🎒',
                        },
                        {
                          id: 'batches',
                          title: 'Fixed Batches',
                          badge: 'Specific Dates',
                          desc: 'Strict departures only on the specific scheduled batches listed below.',
                          icon: '📅',
                        },
                        {
                          id: 'custom',
                          title: 'Flexible / Any Day',
                          badge: 'On Request',
                          desc: 'Travelers can pick any random date, subject to advance notice & capacity.',
                          icon: '🗺️',
                        },
                      ].map((mode) => {
                        const isSelected = (formData.availability?.scheduleType || 'daily') === mode.id;
                        return (
                          <div
                            key={mode.id}
                            onClick={() => handleUpdateAvailabilityField('scheduleType', mode.id)}
                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'border-[#FF6B16] bg-orange-50/50 shadow-xs ring-1 ring-[#FF6B16]'
                                : 'border-neutral-200 bg-white hover:border-neutral-300'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xl">{mode.icon}</span>
                                <span
                                  className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                    isSelected
                                      ? 'bg-[#FF6B16] text-white'
                                      : 'bg-neutral-100 text-neutral-600'
                                  }`}
                                >
                                  {mode.badge}
                                </span>
                              </div>
                              <h4 className="text-xs font-black text-[#1A384C] mb-1">{mode.title}</h4>
                              <p className="text-[11px] text-neutral-500 leading-snug">{mode.desc}</p>
                            </div>
                            <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center gap-1.5 text-[11px] font-bold">
                              <span
                                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                  isSelected ? 'border-[#FF6B16] bg-[#FF6B16]' : 'border-neutral-300'
                                }`}
                              >
                                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </span>
                              <span className={isSelected ? 'text-[#FF6B16]' : 'text-neutral-500'}>
                                {isSelected ? 'Selected' : 'Select'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Capacity & Booking Notice Rules */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Default Seats per Departure / Batch
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={formData.availability?.defaultSeatsPerBatch || 16}
                        onChange={(e) =>
                          handleUpdateAvailabilityField(
                            'defaultSeatsPerBatch',
                            Math.max(1, Number(e.target.value) || 16)
                          )
                        }
                        className="w-full px-3 py-2 bg-white rounded-xl border border-neutral-200 text-xs font-bold focus:outline-none focus:border-[#FF6B16]"
                      />
                      <span className="text-[11px] text-neutral-400 mt-1 block">
                        Maximum passenger capacity per batch or per day.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Minimum Advance Notice (Days)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={formData.availability?.minAdvanceNoticeDays ?? 1}
                        onChange={(e) =>
                          handleUpdateAvailabilityField(
                            'minAdvanceNoticeDays',
                            Math.max(0, Number(e.target.value) || 0)
                          )
                        }
                        className="w-full px-3 py-2 bg-white rounded-xl border border-neutral-200 text-xs font-bold focus:outline-none focus:border-[#FF6B16]"
                      />
                      <span className="text-[11px] text-neutral-400 mt-1 block">
                        Days before departure booking cutoff (e.g. 1 = book at least 24h before).
                      </span>
                    </div>
                  </div>

                  {/* Scheduled Specific Batches */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="text-xs font-black text-neutral-800 uppercase tracking-wider">
                          Specific Scheduled Batches
                        </h4>
                        <p className="text-xs text-neutral-500">
                          Add custom departure dates with fixed seat limits and special tags (e.g. "Diwali Long Weekend", "Snow Trek Batch").
                        </p>
                      </div>
                      <span className="text-xs font-bold text-neutral-400">
                        {formData.availability?.batches?.length || 0} Batches Configured
                      </span>
                    </div>

                    {/* Quick Add Batch Form Bar */}
                    <div className="p-3 bg-orange-50/60 rounded-2xl border border-orange-100 mb-3 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                          Start Date <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={newBatch.startDate}
                          onChange={(e) => setNewBatch({ ...newBatch, startDate: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-neutral-200 text-xs font-semibold focus:outline-none focus:border-[#FF6B16]"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                          End Date (Optional)
                        </label>
                        <input
                          type="date"
                          value={newBatch.endDate}
                          onChange={(e) => setNewBatch({ ...newBatch, endDate: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-neutral-200 text-xs font-semibold focus:outline-none focus:border-[#FF6B16]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                          Seats
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={newBatch.totalSeats}
                          onChange={(e) =>
                            setNewBatch({ ...newBatch, totalSeats: Number(e.target.value) || 16 })
                          }
                          className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-neutral-200 text-xs font-semibold focus:outline-none focus:border-[#FF6B16]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                          Batch Label
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Weekend Special"
                          value={newBatch.note}
                          onChange={(e) => setNewBatch({ ...newBatch, note: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-neutral-200 text-xs font-semibold focus:outline-none focus:border-[#FF6B16]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <button
                          type="button"
                          onClick={handleAddBatch}
                          className="w-full py-1.5 px-3 bg-[#FF6B16] hover:bg-[#E55A0B] text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Batch</span>
                        </button>
                      </div>
                    </div>

                    {/* Batches Table / List */}
                    {formData.availability?.batches?.length > 0 ? (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {formData.availability.batches.map((batch, bIdx) => {
                          const total = batch.totalSeats || 16;
                          const booked = batch.bookedSeats || 0;
                          const left = Math.max(0, total - booked);

                          return (
                            <div
                              key={bIdx}
                              className="p-3 bg-white rounded-xl border border-neutral-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs hover:border-neutral-300 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#FF6B16] flex items-center justify-center font-black text-xs">
                                  {bIdx + 1}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-black text-neutral-900">
                                      {batch.startDate}
                                      {batch.endDate ? ` → ${batch.endDate}` : ''}
                                    </span>
                                    {batch.note && (
                                      <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-[10px] font-bold text-neutral-700">
                                        {batch.note}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-0.5">
                                    <span>Total: <b>{total}</b></span>
                                    <span>•</span>
                                    <span>Booked: <b>{booked}</b></span>
                                    <span>•</span>
                                    <span
                                      className={`font-black ${
                                        left === 0
                                          ? 'text-rose-600'
                                          : left <= 4
                                          ? 'text-amber-600'
                                          : 'text-emerald-600'
                                      }`}
                                    >
                                      {left} Seats Available
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <select
                                  value={batch.status || 'auto'}
                                  onChange={(e) =>
                                    handleUpdateBatch(bIdx, 'status', e.target.value)
                                  }
                                  className="px-2 py-1 bg-neutral-50 rounded-lg border border-neutral-200 text-xs font-bold cursor-pointer"
                                >
                                  <option value="auto">Auto (Calculate from seats)</option>
                                  <option value="available">Force Available</option>
                                  <option value="filling_fast">Force Filling Fast</option>
                                  <option value="sold_out">Force Sold Out</option>
                                </select>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveBatch(bIdx)}
                                  className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Delete Batch"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl border border-dashed border-neutral-200 text-center text-xs text-neutral-400">
                        No specific departure batches added yet.
                        {formData.availability?.scheduleType === 'weekends'
                          ? ' Since "Every Weekend" is selected, the system will automatically open all upcoming Friday and Saturday dates.'
                          : formData.availability?.scheduleType === 'daily'
                          ? ' Since "Every Day" is selected, all calendar dates are open for booking.'
                          : ' Click "+ Add Batch" above to set specific dates.'}
                      </div>
                    )}
                  </div>

                  {/* Blackout / Blocked Dates */}
                  <div className="pt-2 border-t border-neutral-200">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="text-xs font-black text-rose-600 uppercase tracking-wider">
                          Blackout / Blocked Dates
                        </h4>
                        <p className="text-xs text-neutral-500">
                          Select dates when this trip cannot operate (e.g. extreme weather, festival closure, maintenance).
                        </p>
                      </div>
                      <span className="text-xs font-bold text-neutral-400">
                        {formData.availability?.blackoutDates?.length || 0} Blocked Dates
                      </span>
                    </div>

                    {/* Add Blackout Date */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <input
                        type="date"
                        value={newBlackout.date}
                        onChange={(e) => setNewBlackout({ ...newBlackout, date: e.target.value })}
                        className="px-3 py-1.5 bg-white rounded-lg border border-neutral-200 text-xs font-semibold focus:outline-none focus:border-rose-500"
                      />
                      <input
                        type="text"
                        placeholder="Reason (e.g. Trail Maintenance)"
                        value={newBlackout.reason}
                        onChange={(e) =>
                          setNewBlackout({ ...newBlackout, reason: e.target.value })
                        }
                        className="flex-1 min-w-[200px] px-3 py-1.5 bg-white rounded-lg border border-neutral-200 text-xs font-semibold focus:outline-none focus:border-rose-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddBlackout}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Block Date</span>
                      </button>
                    </div>

                    {/* Blackout List */}
                    <div className="flex flex-wrap gap-2">
                      {formData.availability?.blackoutDates?.map((b, bIdx) => (
                        <span
                          key={bIdx}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold"
                        >
                          <span>🔒 {b.date} ({b.reason})</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveBlackout(bIdx)}
                            className="hover:text-rose-900 cursor-pointer"
                            title="Unblock Date"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
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

              {/* ── TAB 7: FAQS BUILDER ── */}
              {activeFormTab === 'faqs' && (
                <div className="space-y-6">
                  <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-100 flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-[#FF6B16] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900">
                        Package Frequently Asked Questions
                      </h4>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        Add custom questions and answers for this package. If no custom FAQs are added here, Weekend Escapes automatically provides comprehensive, trail-tested default FAQs tailored to this package's name, difficulty, stays, and duration.
                      </p>
                    </div>
                  </div>

                  {/* Add New FAQ Form */}
                  <div className="p-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-800">Add New Question</span>
                      <span className="text-[10px] text-neutral-400">Custom Q&A</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                        Question
                      </label>
                      <input
                        type="text"
                        value={newFaq.question}
                        onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                        placeholder="e.g. Is trekking pole mandatory?"
                        className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-medium bg-white focus:outline-none focus:border-[#FF6B16]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                        Answer
                      </label>
                      <textarea
                        rows={3}
                        value={newFaq.answer}
                        onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                        placeholder="Provide detailed, helpful answer for travelers..."
                        className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-medium bg-white focus:outline-none focus:border-[#FF6B16]"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleAddFaq}
                        disabled={!newFaq.question.trim() || !newFaq.answer.trim()}
                        className="px-4 py-2 rounded-xl bg-[#FF6B16] hover:bg-[#E55A0B] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Question</span>
                      </button>
                    </div>
                  </div>

                  {/* List of Current Custom FAQs */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-xs font-bold text-neutral-800">
                          Active Questions for {formData.name || 'Package'} ({formData.faqs?.length || 0})
                        </span>
                        <p className="text-[10px] text-neutral-400 mt-0.5">
                          Edit questions & answers inline. Order here controls display sequence on package details.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleLoadDefaultsForPackage}
                        className="px-3 py-1.5 rounded-xl border border-neutral-200 hover:border-[#FF6B16] hover:bg-orange-50/50 text-neutral-700 text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <RotateCcw className="w-3 h-3 text-[#FF6B16]" />
                        <span>Load Recommended FAQs</span>
                      </button>
                    </div>

                    {(!formData.faqs || formData.faqs.length === 0) ? (
                      <div className="p-6 rounded-2xl border-2 border-dashed border-neutral-200 text-center">
                        <HelpCircle className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                        <p className="text-xs text-neutral-600 font-bold">
                          No custom questions configured yet.
                        </p>
                        <p className="text-[11px] text-neutral-400 mt-1 max-w-sm mx-auto">
                          Standard comprehensive trail FAQs are automatically active on this package page. Click below to load them into this package for custom editing.
                        </p>
                        <button
                          type="button"
                          onClick={handleLoadDefaultsForPackage}
                          className="mt-3 px-4 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#FF6B16] text-xs font-bold transition-colors cursor-pointer"
                        >
                          Load & Customize Trail FAQs
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {formData.faqs.map((faq, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 sm:p-4 rounded-2xl border border-neutral-200/90 bg-[#F7F7F5] space-y-2.5 shadow-2xs"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-md bg-white border border-neutral-200 flex items-center justify-center text-[10px] font-black text-neutral-700 shrink-0">
                                  {idx + 1}
                                </span>
                                <span className="text-xs font-bold text-neutral-800">
                                  Question #{idx + 1}
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => handleMoveFaq(idx, -1)}
                                  className="w-6 h-6 rounded-md bg-white border border-neutral-200 hover:bg-neutral-50 flex items-center justify-center text-neutral-600 disabled:opacity-30 cursor-pointer"
                                  title="Move Up"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === formData.faqs.length - 1}
                                  onClick={() => handleMoveFaq(idx, 1)}
                                  className="w-6 h-6 rounded-md bg-white border border-neutral-200 hover:bg-neutral-50 flex items-center justify-center text-neutral-600 disabled:opacity-30 cursor-pointer"
                                  title="Move Down"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFaq(idx)}
                                  className="w-6 h-6 rounded-md bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                                  title="Delete Question"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            <input
                              type="text"
                              value={faq.question}
                              onChange={(e) => handleUpdateFaqItem(idx, 'question', e.target.value)}
                              placeholder="Question text..."
                              className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-xs font-bold text-neutral-900 focus:outline-none focus:border-[#FF6B16]"
                            />

                            <textarea
                              rows={2}
                              value={faq.answer}
                              onChange={(e) => handleUpdateFaqItem(idx, 'answer', e.target.value)}
                              placeholder="Answer text..."
                              className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-xs font-medium text-neutral-700 focus:outline-none focus:border-[#FF6B16]"
                            />
                          </div>
                        ))}
                      </div>
                    )}
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
