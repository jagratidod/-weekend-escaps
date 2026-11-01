import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { getImageUrl } from '../../utils/imageHelper';
import {
  FileText,
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Sparkles,
  Star,
  RefreshCw,
  FolderTree,
  Layout,
  Upload,
  Calendar,
  Clock,
  User,
  X,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';

export function BlogManager() {
  const { token } = useAuth();
  const { API_BASE_URL } = useSettings();

  const [activeTab, setActiveTab] = useState('posts'); // 'posts', 'categories', 'hero'
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [heroSettings, setHeroSettings] = useState({
    tagline: 'WEEKEND ESCAPES JOURNAL',
    title: 'Travel Stories & Guides',
    subtitle: 'Inspiring trail notes, high-altitude pass guides, and gear tips',
    featuredImage: '/newimage/exploresection/kedarkantha.png',
    featuredBlogId: '',
  });

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');

  // Modal State
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [blogFormData, setBlogFormData] = useState({
    title: '',
    category: '',
    excerpt: '',
    content: '',
    image: '/newimage/exploresection/kedarkantha.png',
    author: 'Weekend Escapes Team',
    authorRole: 'Travel Curator',
    readTime: '5 min read',
    isFeatured: false,
    isPublished: true,
  });

  // Category Modal / Form State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
  });

  const [uploadingTarget, setUploadingTarget] = useState(null); // 'image' or 'heroImage'
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (type, text) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch all blogs, categories, and hero settings
  const fetchData = async () => {
    setLoading(true);
    try {
      const [blogsRes, catsRes, heroRes] = await Promise.all([
        fetch(`${API_BASE_URL}/blogs?all=true`),
        fetch(`${API_BASE_URL}/blogs/categories/all`),
        fetch(`${API_BASE_URL}/blogs/hero/settings`),
      ]);

      const [blogsData, catsData, heroData] = await Promise.all([
        blogsRes.json(),
        catsRes.json(),
        heroRes.json(),
      ]);

      if (blogsData.success) setBlogs(blogsData.blogs || []);
      if (catsData.success) setCategories(catsData.categories || []);
      if (heroData.success && heroData.blogHero) setHeroSettings(heroData.blogHero);
    } catch (err) {
      console.error('Fetch blog admin data error:', err);
      showToast('error', 'Failed to load blog data from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Handle Image Upload to Cloudinary
  const handleImageUpload = async (e, targetField = 'image') => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('image', file);

    setActionLoading(true);
    setUploadingTarget(targetField);
    try {
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Image upload failed');
      }

      if (targetField === 'heroImage') {
        setHeroSettings((prev) => ({ ...prev, featuredImage: data.url }));
      } else {
        setBlogFormData((prev) => ({ ...prev, image: data.url }));
      }

      showToast('success', 'Image uploaded successfully!');
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setActionLoading(false);
      setUploadingTarget(null);
    }
  };

  // Open Blog Create / Edit Modal
  const openBlogModal = (blog = null) => {
    if (blog) {
      setEditingBlog(blog);
      setBlogFormData({
        title: blog.title || '',
        category: blog.category || (categories[0]?.name || 'Trek Guide'),
        excerpt: blog.excerpt || '',
        content: blog.content || '',
        image: blog.image || '/newimage/exploresection/kedarkantha.png',
        author: blog.author || 'Weekend Escapes Team',
        authorRole: blog.authorRole || 'Travel Curator',
        readTime: blog.readTime || '5 min read',
        isFeatured: !!blog.isFeatured,
        isPublished: blog.isPublished !== undefined ? !!blog.isPublished : true,
      });
    } else {
      setEditingBlog(null);
      setBlogFormData({
        title: '',
        category: categories[0]?.name || 'Trek Guide',
        excerpt: '',
        content: '',
        image: '/newimage/exploresection/kedarkantha.png',
        author: 'Weekend Escapes Team',
        authorRole: 'Travel Curator',
        readTime: '6 min read',
        isFeatured: false,
        isPublished: true,
      });
    }
    setShowBlogModal(true);
  };

  // Submit Blog Form (Create or Update)
  const handleBlogSubmit = async (e) => {
    e.preventDefault();
    if (!blogFormData.title.trim()) {
      showToast('error', 'Blog title is required');
      return;
    }

    setActionLoading(true);
    try {
      const url = editingBlog
        ? `${API_BASE_URL}/blogs/${editingBlog._id}`
        : `${API_BASE_URL}/blogs`;

      const method = editingBlog ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(blogFormData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Operation failed');
      }

      showToast('success', editingBlog ? 'Blog article updated!' : 'New blog article created!');
      setShowBlogModal(false);
      fetchData();
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Blog
  const handleDeleteBlog = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/blogs/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete');
      }

      showToast('success', 'Blog article deleted');
      fetchData();
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Featured Status
  const handleToggleFeatured = async (blog) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/blogs/${blog._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isFeatured: !blog.isFeatured }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      showToast('success', !blog.isFeatured ? 'Set as Hero Featured Story!' : 'Removed from Featured');
      fetchData();
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Category Actions
  const openCategoryModal = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryFormData({
        name: cat.name,
        description: cat.description || '',
      });
    } else {
      setEditingCategory(null);
      setCategoryFormData({ name: '', description: '' });
    }
    setShowCategoryModal(true);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryFormData.name.trim()) return;

    setActionLoading(true);
    try {
      const url = editingCategory
        ? `${API_BASE_URL}/blogs/categories/${editingCategory._id}`
        : `${API_BASE_URL}/blogs/categories`;

      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(categoryFormData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      showToast('success', editingCategory ? 'Category updated' : 'Category created');
      setShowCategoryModal(false);
      fetchData();
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"? Blogs in this category will be preserved.`)) return;

    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/blogs/categories/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      showToast('success', `Category "${name}" removed`);
      fetchData();
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Save Hero Section Settings
  const handleSaveHeroSettings = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/blogs/hero/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(heroSettings),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      showToast('success', 'Hero section updated successfully!');
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered blogs for table
  const filteredBlogs = blogs.filter((b) => {
    const matchesCat =
      selectedCategoryFilter === 'All' ||
      b.category?.toLowerCase() === selectedCategoryFilter.toLowerCase();
    const matchesSearch =
      searchQuery === '' ||
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-2xl text-white text-xs font-bold flex items-center gap-2 transition-all ${
            toastMessage.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
          }`}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* ── Top Header ── */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6B16] flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800">Blog & Story Journal</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage travel stories, dynamic category tags, and the public blog Hero section
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => openBlogModal()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF6B16] hover:bg-[#e05809] text-white text-xs font-bold shadow-md shadow-orange-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Write New Blog
          </button>
        </div>
      </div>

      {/* ── Sub Navigation Tabs ── */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('posts')}
          className={`pb-3 px-4 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
            activeTab === 'posts' ? 'text-[#FF6B16] border-b-2 border-[#FF6B16]' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>All Articles ({blogs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`pb-3 px-4 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
            activeTab === 'categories' ? 'text-[#FF6B16] border-b-2 border-[#FF6B16]' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>Categories ({categories.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('hero')}
          className={`pb-3 px-4 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
            activeTab === 'hero' ? 'text-[#FF6B16] border-b-2 border-[#FF6B16]' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layout className="w-4 h-4" />
          <span>Hero Section Settings</span>
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          TAB 1: BLOG POSTS LIST
          ════════════════════════════════════════════════════════════════ */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-slate-400 mr-1">Category:</span>
              <button
                type="button"
                onClick={() => setSelectedCategoryFilter('All')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedCategoryFilter === 'All'
                    ? 'bg-[#1A384C] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c._id}
                  type="button"
                  onClick={() => setSelectedCategoryFilter(c.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    selectedCategoryFilter === c.name
                      ? 'bg-[#1A384C] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search articles by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#FF6B16]"
              />
            </div>
          </div>

          {/* Blogs Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 uppercase font-black text-slate-400 tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5">Article</th>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5">Author & Date</th>
                    <th className="px-5 py-3.5 text-center">Hero Featured</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#FF6B16]" />
                        Loading blog posts...
                      </td>
                    </tr>
                  ) : filteredBlogs.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-400">
                        No blog articles found.
                      </td>
                    </tr>
                  ) : (
                    filteredBlogs.map((b) => (
                      <tr key={b._id} className="hover:bg-slate-50/80 transition">
                        <td className="px-5 py-3.5 max-w-sm">
                          <div className="flex items-center gap-3">
                            <img
                              src={getImageUrl(b.image)}
                              alt={b.title}
                              className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-slate-200"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 line-clamp-1 text-sm">{b.title}</p>
                              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{b.excerpt}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          <span className="px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#FF6B16] font-bold text-[10px] uppercase">
                            {b.category}
                          </span>
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-slate-800">{b.author}</div>
                          <div className="text-[11px] text-slate-400">{b.date} • {b.readTime}</div>
                        </td>

                        <td className="px-5 py-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleFeatured(b)}
                            title="Toggle Hero Main Card"
                            className={`p-1.5 rounded-lg border transition ${
                              b.isFeatured
                                ? 'bg-amber-50 border-amber-300 text-amber-500'
                                : 'bg-slate-50 border-slate-200 text-slate-300 hover:text-amber-400'
                            }`}
                          >
                            <Star className={`w-4 h-4 ${b.isFeatured ? 'fill-amber-400' : ''}`} />
                          </button>
                        </td>

                        <td className="px-5 py-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              b.isPublished
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {b.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-right space-x-1 whitespace-nowrap">
                          <a
                            href={`/blogs/${b.slug || b.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 inline-block transition"
                            title="View Public Article"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => openBlogModal(b)}
                            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition"
                            title="Edit Article"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBlog(b._id, b.title)}
                            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete Article"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* ════════════════════════════════════════════════════════════════
          TAB 2: DYNAMIC CATEGORIES MANAGER
          ════════════════════════════════════════════════════════════════ */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Manage the category filter pills shown on the blog page. When writing a blog, you can choose from these categories.
            </p>
            <button
              type="button"
              onClick={() => openCategoryModal()}
              className="px-4 py-2 bg-[#FF6B16] hover:bg-[#e05809] text-white text-xs font-bold rounded-xl transition inline-flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((c) => (
              <div
                key={c._id}
                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-sm text-slate-800">{c.name}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px]">
                      {c.blogCount || 0} blogs
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {c.description || 'No description provided.'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-2">slug: {c.slug}</p>
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-4 border-t border-slate-100 mt-4">
                  <button
                    type="button"
                    onClick={() => openCategoryModal(c)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(c._id, c.name)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          TAB 3: HERO SECTION SETTINGS
          ════════════════════════════════════════════════════════════════ */}
      {activeTab === 'hero' && (
        <form onSubmit={handleSaveHeroSettings} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Inputs */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4 text-xs">
              <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
                Blog Page Header & Hero Customization
              </h2>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hero Sub-Tagline</label>
                <input
                  type="text"
                  value={heroSettings.tagline}
                  onChange={(e) => setHeroSettings({ ...heroSettings, tagline: e.target.value })}
                  placeholder="e.g. WEEKEND ESCAPES JOURNAL"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold focus:border-[#FF6B16] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hero Main Title</label>
                <input
                  type="text"
                  value={heroSettings.title}
                  onChange={(e) => setHeroSettings({ ...heroSettings, title: e.target.value })}
                  placeholder="e.g. Travel Stories & Guides"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-sm focus:border-[#FF6B16] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hero Subtitle / Description</label>
                <textarea
                  rows="2"
                  value={heroSettings.subtitle}
                  onChange={(e) => setHeroSettings({ ...heroSettings, subtitle: e.target.value })}
                  placeholder="Inspiring trail notes and mountain guides"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#FF6B16] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Hero Featured Background / Editorial Image (Upload Direct Image)
                </label>

                <label className="border-2 border-dashed border-slate-200 hover:border-[#FF6B16] rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50/60 hover:bg-[#FF6B16]/5 transition-all group relative overflow-hidden block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'heroImage')}
                    className="hidden"
                    disabled={actionLoading}
                  />

                  {uploadingTarget === 'heroImage' ? (
                    <div className="py-8 flex flex-col items-center">
                      <RefreshCw className="w-8 h-8 text-[#FF6B16] animate-spin mb-2" />
                      <p className="text-xs font-bold text-slate-700">Uploading hero image to server...</p>
                    </div>
                  ) : heroSettings.featuredImage ? (
                    <div className="w-full flex flex-col items-center">
                      <div className="w-full h-44 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 relative mb-2 shadow-sm">
                        <img
                          src={getImageUrl(heroSettings.featuredImage)}
                          alt="Hero Preview"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-xs">
                          <Upload className="w-4 h-4" />
                          <span>Click here to change hero image</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Click box to select a new image from your computer
                      </p>
                    </div>
                  ) : (
                    <div className="py-8 flex flex-col items-center">
                      <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#FF6B16] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-slate-800">
                        Click to upload hero background image
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        PNG, JPG, or WebP up to 5MB
                      </p>
                    </div>
                  )}
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-xl bg-[#FF6B16] hover:bg-[#e05809] text-white font-bold transition shadow-md shadow-orange-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? 'Saving...' : 'Save Hero Settings'}
                </button>
              </div>
            </div>

            {/* Right Live Preview Card */}
            <div className="lg:col-span-5 space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Hero Section Preview
              </p>
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[#FF6B16] font-black text-[10px] uppercase tracking-wider mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B16]" />
                    {heroSettings.tagline}
                  </div>
                  <h3 className="text-xl font-black text-slate-900 leading-tight">
                    {heroSettings.title}
                  </h3>
                </div>

                <div className="rounded-2xl overflow-hidden aspect-[16/10] bg-neutral-900 relative shadow-md">
                  <img
                    src={getImageUrl(heroSettings.featuredImage)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
                    <span className="px-2.5 py-0.5 rounded-full bg-white text-slate-900 font-bold text-[10px] w-fit mb-2">
                      Featured Story
                    </span>
                    <p className="font-bold text-sm leading-snug">
                      Hero banner preview for your travel journal
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ════════════════════════════════════════════════════════════════
          MODAL: CREATE / EDIT BLOG POST
          ════════════════════════════════════════════════════════════════ */}
      {showBlogModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#FF6B16]" />
                <h3 className="font-bold text-slate-900 text-sm">
                  {editingBlog ? 'Edit Blog Article' : 'Write New Travel Blog Post'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBlogModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleBlogSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Title */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Article Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kedarkantha Winter Trek: Summiting at 12,500 ft"
                  value={blogFormData.title}
                  onChange={(e) => setBlogFormData({ ...blogFormData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold text-sm focus:border-[#FF6B16] outline-none"
                />
              </div>

              {/* Category & Read Time Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={blogFormData.category}
                    onChange={(e) => setBlogFormData({ ...blogFormData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold focus:border-[#FF6B16] outline-none bg-white cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estimated Read Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 8 min read"
                    value={blogFormData.readTime}
                    onChange={(e) => setBlogFormData({ ...blogFormData, readTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#FF6B16] outline-none"
                  />
                </div>
              </div>

              {/* Author & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Author Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Arjun Rawat (Lead Mountaineer)"
                    value={blogFormData.author}
                    onChange={(e) => setBlogFormData({ ...blogFormData, author: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#FF6B16] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Author Role / Badge</label>
                  <input
                    type="text"
                    placeholder="e.g. Trek Leader / Expedition Specialist"
                    value={blogFormData.authorRole}
                    onChange={(e) => setBlogFormData({ ...blogFormData, authorRole: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#FF6B16] outline-none"
                  />
                </div>
              </div>

              {/* Cover Image - Direct Upload Only */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Article Cover Image (Click box to upload from computer)
                </label>

                <label className="border-2 border-dashed border-slate-200 hover:border-[#FF6B16] rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50/60 hover:bg-[#FF6B16]/5 transition-all group relative overflow-hidden block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'image')}
                    className="hidden"
                    disabled={actionLoading}
                  />

                  {uploadingTarget === 'image' ? (
                    <div className="py-8 flex flex-col items-center">
                      <RefreshCw className="w-8 h-8 text-[#FF6B16] animate-spin mb-2" />
                      <p className="text-xs font-bold text-slate-700">Uploading cover image to server...</p>
                    </div>
                  ) : blogFormData.image ? (
                    <div className="w-full flex flex-col items-center">
                      <div className="w-full h-44 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 relative mb-2 shadow-sm">
                        <img
                          src={getImageUrl(blogFormData.image)}
                          alt="Cover Preview"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-xs">
                          <Upload className="w-4 h-4" />
                          <span>Click here to change cover image</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Click box to select a new cover photo
                      </p>
                    </div>
                  ) : (
                    <div className="py-8 flex flex-col items-center">
                      <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#FF6B16] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-slate-800">
                        Click to upload article cover image
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        PNG, JPG, or WebP up to 5MB
                      </p>
                    </div>
                  )}
                </label>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Excerpt / Summary *</label>
                <textarea
                  rows="2"
                  required
                  placeholder="Short teaser shown on blog cards..."
                  value={blogFormData.excerpt}
                  onChange={(e) => setBlogFormData({ ...blogFormData, excerpt: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#FF6B16] outline-none"
                />
              </div>

              {/* Full Content */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Article Content *</label>
                <textarea
                  rows="8"
                  required
                  placeholder="Write the full travel story. You can use markdown headings (### Heading) and paragraphs..."
                  value={blogFormData.content}
                  onChange={(e) => setBlogFormData({ ...blogFormData, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:border-[#FF6B16] outline-none leading-relaxed"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={blogFormData.isFeatured}
                    onChange={(e) =>
                      setBlogFormData({ ...blogFormData, isFeatured: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-[#FF6B16] focus:ring-[#FF6B16]"
                  />
                  <span>Pin as Left Featured Hero Story</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={blogFormData.isPublished}
                    onChange={(e) =>
                      setBlogFormData({ ...blogFormData, isPublished: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Publish Immediately</span>
                </label>
              </div>

              {/* Footer */}
              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBlogModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-[#FF6B16] hover:bg-[#e05809] text-white font-bold transition shadow-sm disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : editingBlog ? 'Update Post' : 'Publish Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          MODAL: ADD / EDIT CATEGORY
          ════════════════════════════════════════════════════════════════ */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wildlife Safari, Trek Guide"
                  value={categoryFormData.name}
                  onChange={(e) =>
                    setCategoryFormData({ ...categoryFormData, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold focus:border-[#FF6B16] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  placeholder="Brief summary for this category..."
                  value={categoryFormData.description}
                  onChange={(e) =>
                    setCategoryFormData({ ...categoryFormData, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#FF6B16] outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-[#FF6B16] hover:bg-[#e05809] text-white font-bold transition shadow-sm disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BlogManager;
