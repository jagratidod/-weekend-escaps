import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Film,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Play,
  UploadCloud,
  Check,
  X,
  Search,
  Filter,
  RefreshCw,
  HardDrive,
  Eye,
  Loader2,
  FileVideo,
  ArrowUpDown,
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const MAX_VIDEO_SIZE_MB = 20;
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

export default function ReelManager() {
  const { token } = useAuth();

  const [reels, setReels] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [alert, setAlert] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReel, setEditingReel] = useState(null);
  const [formData, setFormData] = useState({
    author: '',
    trek: '',
    video: '',
    videoPublicId: '',
    poster: '',
    posterPublicId: '',
    order: 0,
    isActive: true,
    fileSize: 0,
    duration: 0,
  });

  // Video Upload State
  const [videoFile, setVideoFile] = useState(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const videoInputRef = useRef(null);

  // Preview Modal
  const [previewReel, setPreviewReel] = useState(null);

  // Fetch admin reels
  const fetchReels = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/reels/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        setReels(data.data || []);
        if (data.stats) setStats(data.stats);
      } else {
        // Fallback to public reels if admin route fails
        const pubRes = await fetch(`${API_BASE_URL}/reels`);
        const pubData = await pubRes.json();
        if (pubData.success) {
          setReels(pubData.data || []);
          setStats({
            total: pubData.data?.length || 0,
            active: pubData.data?.filter((r) => r.isActive).length || 0,
            inactive: 0,
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch reels:', err);
      showAlert('Failed to connect to reels server. Using local cache.', 'error');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchReels();
  }, [fetchReels]);

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingReel(null);
    setFormData({
      author: '',
      trek: '',
      video: '',
      videoPublicId: '',
      poster: '',
      posterPublicId: '',
      order: (reels.length + 1) * 1,
      isActive: true,
      fileSize: 0,
      duration: 0,
    });
    setVideoFile(null);
    setUploadError('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (reel) => {
    setEditingReel(reel);
    setFormData({
      author: reel.author || '',
      trek: reel.trek || '',
      video: reel.video || '',
      videoPublicId: reel.videoPublicId || '',
      poster: reel.poster || '',
      posterPublicId: reel.posterPublicId || '',
      order: reel.order || 0,
      isActive: reel.isActive !== false,
      fileSize: reel.fileSize || 0,
      duration: reel.duration || 0,
    });
    setVideoFile(null);
    setUploadError('');
    setIsModalOpen(true);
  };

  // Handle Video Selection with Client-side 20MB check
  const handleVideoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Strict 20MB validation
    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      const actualSizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setUploadError(
        `Video size (${actualSizeMB} MB) exceeds the strict ${MAX_VIDEO_SIZE_MB}MB limit. Please compress the video before uploading.`
      );
      if (videoInputRef.current) videoInputRef.current.value = '';
      return;
    }

    setUploadError('');
    setVideoFile(file);

    // Auto upload directly to Cloudinary via backend
    await uploadFileToBackend(file);
  };

  // Upload video helper (auto generates poster thumbnail from video starting frame)
  const uploadFileToBackend = async (file) => {
    try {
      setUploadingVideo(true);
      setUploadProgress(20);

      const body = new FormData();
      body.append('file', file);

      setUploadProgress(50);

      const res = await fetch(`${API_BASE_URL}/reels/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body,
      });

      setUploadProgress(85);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'File upload failed');
      }

      setUploadProgress(100);

      // Auto-derive poster image from Cloudinary video first frame
      const derivedPoster = data.posterUrl || (data.url && data.url.includes('cloudinary.com') ? data.url.replace(/\.[^/.]+$/, '.jpg') : '');

      setFormData((prev) => ({
        ...prev,
        video: data.url,
        videoPublicId: data.publicId || '',
        poster: derivedPoster,
        fileSize: data.fileSize || file.size,
        duration: data.duration || 0,
      }));
      showAlert(`Video uploaded successfully to Cloudinary! (${(file.size / (1024 * 1024)).toFixed(1)} MB)`, 'success');
    } catch (err) {
      console.error('Upload Error:', err);
      setUploadError(err.message || 'Failed to upload file to Cloudinary.');
      showAlert(err.message || 'Upload failed', 'error');
    } finally {
      setUploadingVideo(false);
      setUploadProgress(0);
    }
  };

  // Submit Reel Form
  const handleSubmitReel = async (e) => {
    e.preventDefault();

    if (!formData.author.trim() || !formData.trek.trim()) {
      setUploadError('Please fill in both Author Name and Trek Destination.');
      return;
    }

    if (!formData.video.trim()) {
      setUploadError('Please upload a video file or provide a video URL.');
      return;
    }

    try {
      setUploadingVideo(true);

      // Auto-derive poster from Cloudinary video first frame if not set
      let autoPoster = formData.poster;
      if (!autoPoster && formData.video && formData.video.includes('cloudinary.com')) {
        autoPoster = formData.video.replace(/\.[^/.]+$/, '.jpg');
      }

      const payload = {
        ...formData,
        poster: autoPoster,
      };

      const url = editingReel
        ? `${API_BASE_URL}/reels/${editingReel._id}`
        : `${API_BASE_URL}/reels`;

      const method = editingReel ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save reel');
      }

      showAlert(
        editingReel ? 'Reel updated successfully!' : 'New reel added successfully!',
        'success'
      );
      setIsModalOpen(false);
      fetchReels();
    } catch (err) {
      console.error('Save Reel Error:', err);
      setUploadError(err.message || 'Failed to save reel.');
      showAlert(err.message || 'Failed to save reel', 'error');
    } finally {
      setUploadingVideo(false);
    }
  };

  // Toggle active status
  const handleToggleStatus = async (reel) => {
    try {
      setActionLoadingId(reel._id);
      const res = await fetch(`${API_BASE_URL}/reels/${reel._id}/toggle`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        setReels((prev) =>
          prev.map((r) => (r._id === reel._id ? { ...r, isActive: !r.isActive } : r))
        );
        showAlert(`Reel status updated to ${!reel.isActive ? 'Active' : 'Inactive'}`);
      }
    } catch (err) {
      console.error('Toggle status error:', err);
      showAlert('Failed to update status', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete Reel
  const handleDeleteReel = async (reel) => {
    if (!window.confirm(`Are you sure you want to delete the reel by "${reel.author}"? This will also remove the video from Cloudinary storage.`)) {
      return;
    }

    try {
      setActionLoadingId(reel._id);
      const res = await fetch(`${API_BASE_URL}/reels/${reel._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        setReels((prev) => prev.filter((r) => r._id !== reel._id));
        showAlert('Reel and associated Cloudinary assets deleted successfully.');
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error('Delete Reel Error:', err);
      showAlert(err.message || 'Failed to delete reel', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered reels list
  const filteredReels = reels.filter((reel) => {
    const matchesSearch =
      (reel.author || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (reel.trek || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && reel.isActive) ||
      (statusFilter === 'inactive' && !reel.isActive);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 select-none font-sans">
      {/* ── Alert Toast ── */}
      {alert && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl border flex items-center gap-3 transition-all transform animate-in slide-in-from-top-2 ${
            alert.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {alert.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-600" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          )}
          <span className="text-xs sm:text-sm font-semibold">{alert.message}</span>
        </div>
      )}

      {/* ── Top Header & Action Bar ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#FF6B16] flex items-center justify-center shadow-xs">
              <Film className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#1A384C] tracking-tight">
                Travel Video Reels
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 font-medium">
                Manage 3D coverflow traveler videos featured on the homepage section
              </p>
            </div>
          </div>

          {/* Strict Size Restriction Badge */}
          <div className="mt-3.5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/70 text-blue-800 text-[11px] font-semibold">
            <HardDrive className="w-3.5 h-3.5 text-blue-600" />
            <span>Strict File Limit: <strong>Maximum {MAX_VIDEO_SIZE_MB}MB</strong> per video • Stored on Cloudinary CDN</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={fetchReels}
            disabled={loading}
            className="p-3 rounded-2xl border border-neutral-200 hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900 transition-all cursor-pointer"
            title="Refresh reels"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="px-5 py-3 rounded-2xl bg-[#FF6B16] hover:bg-[#ff7d33] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-[#FF6B16]/25 hover:shadow-[#FF6B16]/40 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Reel</span>
          </button>
        </div>
      </div>

      {/* ── Stats Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#FF6B16] flex items-center justify-center font-bold">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-[#1A384C]">{stats.total || reels.length}</p>
            <p className="text-xs font-semibold text-neutral-400">Total Video Reels</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-[#1A384C]">
              {stats.active || reels.filter((r) => r.isActive).length}
            </p>
            <p className="text-xs font-semibold text-neutral-400">Active on Homepage</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-neutral-100 text-neutral-500 flex items-center justify-center">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-[#1A384C]">
              {stats.inactive || reels.filter((r) => !r.isActive).length}
            </p>
            <p className="text-xs font-semibold text-neutral-400">Hidden / Draft</p>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="bg-white rounded-2xl p-4 border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by traveler or trek..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-neutral-200 text-xs sm:text-sm bg-neutral-50 focus:bg-white focus:border-[#FF6B16] focus:ring-2 focus:ring-[#FF6B16]/10 outline-none transition-all"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-neutral-400" />
          <div className="flex bg-neutral-100 p-1 rounded-xl">
            {['all', 'active', 'inactive'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                  statusFilter === status
                    ? 'bg-white text-[#FF6B16] shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Reels Grid / List ── */}
      {loading ? (
        <div className="bg-white rounded-3xl p-16 border border-neutral-200/80 text-center flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF6B16]" />
          <p className="mt-3 text-xs sm:text-sm text-neutral-500 font-medium">Loading travel reels...</p>
        </div>
      ) : filteredReels.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 border border-neutral-200/80 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-orange-50 text-[#FF6B16] flex items-center justify-center mb-4">
            <Film className="w-8 h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[#1A384C]">No travel reels found</h3>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-sm">
            {searchQuery ? 'Try adjusting your search query or status filter.' : 'Upload your first short video reel to showcase real traveler moments.'}
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="mt-5 px-5 py-2.5 rounded-xl bg-[#FF6B16] hover:bg-[#ff7d33] text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            Upload First Reel
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredReels.map((reel) => (
            <div
              key={reel._id || reel.id}
              className="bg-white rounded-3xl overflow-hidden border border-neutral-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group relative"
            >
              {/* Aspect 9:16 Video Poster Preview */}
              <div className="relative aspect-[9/16] bg-neutral-950 overflow-hidden cursor-pointer">
                <video
                  src={`${reel.video}#t=0.001`}
                  poster={reel.poster || (reel.video?.includes('cloudinary.com') ? reel.video.replace(/\.(mp4|mov|webm|mkv)$/i, '.jpg') : undefined)}
                  muted
                  preload="metadata"
                  playsInline
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none"
                />

                {/* Status Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md ${
                      reel.isActive
                        ? 'bg-emerald-500/90 text-white shadow-sm'
                        : 'bg-neutral-800/90 text-neutral-300'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${reel.isActive ? 'bg-white' : 'bg-neutral-400'}`} />
                    {reel.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Order Badge */}
                <div className="absolute top-3 right-3 z-10">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-white">
                    Order #{reel.order || 0}
                  </span>
                </div>

                {/* Hover Play Splash Button */}
                <button
                  onClick={() => setPreviewReel(reel)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  title="Preview video"
                >
                  <div className="w-12 h-12 rounded-full bg-[#FF6B16] text-white flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                    <Play className="w-5 h-5 ml-0.5 fill-current" />
                  </div>
                </button>

                {/* Overlay details */}
                <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white">
                  <h3 className="text-sm font-bold truncate drop-shadow-sm">{reel.author}</h3>
                  <p className="text-[10px] font-semibold text-neutral-300 uppercase tracking-wider mt-0.5 truncate drop-shadow-sm">
                    {reel.trek}
                  </p>
                  {reel.fileSize > 0 && (
                    <p className="text-[9px] text-neutral-400 mt-1">
                      Size: {(reel.fileSize / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom Actions Card Footer */}
              <div className="p-3.5 bg-neutral-50 border-t border-neutral-150 flex items-center justify-between gap-2">
                {/* 1-Click Toggle Active */}
                <button
                  onClick={() => handleToggleStatus(reel)}
                  disabled={actionLoadingId === reel._id}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    reel.isActive
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {reel.isActive ? 'Active' : 'Show on Site'}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditModal(reel)}
                    className="p-2 rounded-xl text-neutral-600 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                    title="Edit reel"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteReel(reel)}
                    disabled={actionLoadingId === reel._id}
                    className="p-2 rounded-xl text-neutral-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete reel"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── CREATE / EDIT MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-neutral-150 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#1A384C]">
                  {editingReel ? 'Edit Travel Reel' : 'Upload New Travel Reel'}
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Video is uploaded to Cloudinary and showcased on the homepage
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitReel} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              {uploadError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Author & Trek Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                    Traveler / Explorer Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Xplorer Anil"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:border-[#FF6B16] text-xs sm:text-sm outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                    Trek / Destination *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KEDARKANTHA TREK"
                    value={formData.trek}
                    onChange={(e) => setFormData({ ...formData, trek: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:border-[#FF6B16] text-xs sm:text-sm outline-none transition-all uppercase"
                  />
                </div>
              </div>

              {/* Video Upload Section with 20MB Restriction */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-neutral-700">Video File *</label>
                  <span className="text-[11px] font-bold text-[#FF6B16]">
                    Max {MAX_VIDEO_SIZE_MB}MB Limit
                  </span>
                </div>

                <div
                  onClick={() => videoInputRef.current?.click()}
                  className="border-2 border-dashed border-neutral-300 hover:border-[#FF6B16] rounded-2xl p-4 text-center cursor-pointer transition-colors bg-neutral-50 hover:bg-orange-50/20 group relative overflow-hidden"
                >
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/mp4,video/quicktime,video/webm"
                    onChange={handleVideoSelect}
                    className="hidden"
                  />

                  {uploadingVideo ? (
                    <div className="py-4 flex flex-col items-center">
                      <Loader2 className="w-8 h-8 animate-spin text-[#FF6B16]" />
                      <p className="text-xs font-bold text-[#1A384C] mt-2">
                        Uploading to Cloudinary... ({uploadProgress}%)
                      </p>
                      <div className="w-48 bg-neutral-200 rounded-full h-1.5 mt-2 overflow-hidden">
                        <div
                          className="bg-[#FF6B16] h-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : formData.video ? (
                    <div className="flex items-center justify-between gap-3 p-2 bg-white rounded-xl border border-neutral-200">
                      <div className="flex items-center gap-2.5 truncate">
                        <FileVideo className="w-6 h-6 text-[#FF6B16] shrink-0" />
                        <div className="text-left truncate">
                          <p className="text-xs font-bold text-neutral-800 truncate">
                            {videoFile ? videoFile.name : 'Cloudinary Video Ready'}
                          </p>
                          <p className="text-[10px] text-neutral-400 truncate max-w-xs">
                            {formData.video}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#FF6B16] shrink-0 underline">
                        Change
                      </span>
                    </div>
                  ) : (
                    <div className="py-3 flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-orange-100 text-[#FF6B16] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-neutral-800">
                        Click to browse or drag video here
                      </p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        MP4, MOV, or WEBM up to <strong>{MAX_VIDEO_SIZE_MB}MB</strong>
                      </p>
                    </div>
                  )}
                </div>

                {/* Direct Video URL Fallback */}
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Or enter direct video URL (e.g. Cloudinary or CDN URL)"
                    value={formData.video}
                    onChange={(e) => setFormData({ ...formData, video: e.target.value })}
                    className="w-full px-3 py-1.5 text-[11px] rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-600 focus:bg-white outline-none"
                  />
                </div>
              </div>

              {/* Auto First Frame Poster Info */}
              <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-neutral-800">Auto Starting Frame Poster</p>
                    <p className="text-[11px] text-neutral-400 truncate">
                      Starting frame of the video is captured automatically as the thumbnail
                    </p>
                  </div>
                </div>
                {formData.video && (
                  <div className="w-10 h-14 rounded-lg overflow-hidden border border-neutral-300 shrink-0 bg-black">
                    <video
                      src={`${formData.video}#t=0.001`}
                      poster={formData.poster || (formData.video.includes('cloudinary.com') ? formData.video.replace(/\.[^/.]+$/, '.jpg') : undefined)}
                      preload="metadata"
                      muted
                      playsInline
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  </div>
                )}
              </div>

              {/* Order & Active Options */}
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5 flex items-center gap-1.5">
                    <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Display Order</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-xs sm:text-sm font-semibold outline-none"
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">Lower numbers appear first</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">Visibility Status</label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    className={`w-full py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      formData.isActive
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-neutral-200 bg-neutral-100 text-neutral-500'
                    }`}
                  >
                    {formData.isActive ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Active on Site</span>
                      </>
                    ) : (
                      <>
                        <X className="w-3.5 h-3.5" />
                        <span>Hidden / Draft</span>
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-neutral-400 mt-1">Toggle to publish or draft</p>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-3 border-t border-neutral-150 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-xs font-bold text-neutral-600 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingVideo}
                  className="px-6 py-2.5 rounded-xl bg-[#FF6B16] hover:bg-[#ff7d33] text-white text-xs font-bold shadow-lg shadow-[#FF6B16]/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {uploadingVideo ? 'Saving...' : editingReel ? 'Update Reel' : 'Publish Reel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── VIDEO PREVIEW LIGHTBOX MODAL ── */}
      {previewReel && (
        <div
          onClick={() => setPreviewReel(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[340px] aspect-[9/16] rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/20 flex flex-col"
          >
            <video
              src={previewReel.video}
              autoPlay
              controls
              playsInline
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => setPreviewReel(null)}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-[#FF6B16] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black via-black/60 to-transparent text-white pointer-events-none">
              <h3 className="text-sm font-bold">{previewReel.author}</h3>
              <p className="text-[11px] text-neutral-300 uppercase tracking-wider">{previewReel.trek}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
