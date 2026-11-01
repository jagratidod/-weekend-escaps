import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BLOGS as DEFAULT_STATIC_BLOGS } from '../data/blogs';
import Container from '../components/common/Container';
import { getImageUrl } from '../utils/imageHelper';
import { useSettings } from '../context/SettingsContext';
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Search,
  Compass,
  Loader2,
} from 'lucide-react';

export function BlogsPage() {
  const { id } = useParams();
  const { API_BASE_URL } = useSettings();

  const [blogs, setBlogs] = useState(DEFAULT_STATIC_BLOGS);
  const [categories, setCategories] = useState([
    'All',
    'Trek Guide',
    'Travel Tips',
    'Adventure',
    'Expedition',
    'International',
  ]);
  const [heroSettings, setHeroSettings] = useState({
    tagline: 'WEEKEND ESCAPES JOURNAL',
    title: 'Travel Stories & Guides',
    subtitle: 'Inspiring trail notes, high-altitude pass guides, and gear tips',
    featuredImage: '/newimage/exploresection/kedarkantha.png',
    featuredBlogId: '',
  });

  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArticle, setActiveArticle] = useState(null);

  // Fetch dynamic blogs, categories, and hero settings
  useEffect(() => {
    let isMounted = true;
    const fetchBlogData = async () => {
      setLoading(true);
      try {
        const [blogsRes, catsRes, heroRes] = await Promise.all([
          fetch(`${API_BASE_URL}/blogs`),
          fetch(`${API_BASE_URL}/blogs/categories/all`),
          fetch(`${API_BASE_URL}/blogs/hero/settings`),
        ]);

        const [blogsData, catsData, heroData] = await Promise.all([
          blogsRes.json().catch(() => ({})),
          catsRes.json().catch(() => ({})),
          heroRes.json().catch(() => ({})),
        ]);

        if (isMounted) {
          if (blogsData && blogsData.success && Array.isArray(blogsData.blogs) && blogsData.blogs.length > 0) {
            setBlogs(blogsData.blogs);
          }
          if (catsData && catsData.success && Array.isArray(catsData.categories) && catsData.categories.length > 0) {
            const dynamicCatNames = ['All', ...catsData.categories.map((c) => c.name)];
            setCategories(dynamicCatNames);
          }
          if (heroData && heroData.success && heroData.blogHero) {
            setHeroSettings(heroData.blogHero);
          }
        }
      } catch (err) {
        console.warn('Could not fetch dynamic blog data, using initial data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBlogData();
    return () => {
      isMounted = false;
    };
  }, [API_BASE_URL]);

  // When article ID is present in URL
  useEffect(() => {
    if (!id) {
      setActiveArticle(null);
      return;
    }

    // First check in loaded blogs
    const found = blogs.find((b) => b.slug === id || b.id === id || b._id === id);
    if (found) {
      setActiveArticle(found);
      return;
    }

    // Otherwise fetch specifically from backend API
    fetch(`${API_BASE_URL}/blogs/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.blog) {
          setActiveArticle(data.blog);
        }
      })
      .catch((e) => console.warn('Fetch single blog error:', e));
  }, [id, blogs, API_BASE_URL]);

  // Determine Primary Featured Blog for Hero Card
  const featuredBlog =
    blogs.find((b) => b.isFeatured) ||
    (heroSettings.featuredBlogId && blogs.find((b) => b.id === heroSettings.featuredBlogId || b.slug === heroSettings.featuredBlogId)) ||
    blogs[0] ||
    DEFAULT_STATIC_BLOGS[0];

  // Next 4 latest posts for Right Column list
  const latestPosts = blogs
    .filter((b) => (b.slug || b.id || b._id) !== (featuredBlog?.slug || featuredBlog?.id || featuredBlog?._id))
    .slice(0, 4);

  // Filtered Blogs Grid
  const filteredBlogs = blogs.filter((b) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      b.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      searchQuery === '' ||
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pt-28 pb-24 bg-[#F7F7F5] min-h-screen text-[#111111]">
      <Container>
        {activeArticle ? (
          /* ============================================================== */
          /* ── SINGLE BLOG ARTICLE VIEW ── */
          /* ============================================================== */
          <article className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-12 border border-neutral-200/80 shadow-md">
            <Link
              to="/blogs"
              className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-[#FF6B16] mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to all travel stories</span>
            </Link>

            <div className="flex items-center gap-3 mb-4">
              <span className="px-3.5 py-1 rounded-full bg-[#FF6B16] text-white text-xs font-black uppercase tracking-wider">
                {activeArticle.category}
              </span>
              <span className="text-xs text-neutral-400 font-semibold">
                {activeArticle.readTime}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#111111] leading-tight mb-4">
              {activeArticle.title}
            </h1>

            <div className="flex items-center gap-4 text-xs text-neutral-500 pb-8 border-b border-neutral-100 mb-8">
              <span className="flex items-center gap-1.5 font-bold text-neutral-800">
                <User className="w-3.5 h-3.5 text-[#FF6B16]" />
                {activeArticle.author}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {activeArticle.date}
              </span>
            </div>

            {/* Featured Image */}
            <div className="rounded-2xl overflow-hidden aspect-[16/9] mb-8 bg-neutral-900 border border-neutral-200 shadow-sm">
              <img
                src={getImageUrl(activeArticle.image)}
                alt={activeArticle.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content Body */}
            <div className="prose prose-neutral max-w-none text-neutral-700 leading-relaxed space-y-6 text-base sm:text-lg">
              <p className="font-semibold text-xl text-neutral-900 border-l-4 border-[#FF6B16] pl-4 italic">
                {activeArticle.excerpt}
              </p>
              <div className="whitespace-pre-line text-neutral-700 leading-loose">
                {activeArticle.content}
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="mt-12 pt-8 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-black text-neutral-900">Inspired by this story?</h4>
                <p className="text-xs text-neutral-500">Plan your custom trip with Weekend Escapes today.</p>
              </div>
              <Link
                to="/plan-trip"
                className="px-6 py-3 rounded-full bg-[#FF6B16] hover:bg-[#e05809] text-white text-xs font-black uppercase tracking-wider shadow-md transition-all cursor-pointer"
              >
                Plan My Trip
              </Link>
            </div>
          </article>
        ) : (
          /* ============================================================== */
          /* ── ALL BLOGS INDEX VIEW (DYNAMIC HERO + CATEGORIES) ── */
          /* ============================================================== */
          <div>
            {/* Top Page Sub-Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <div className="inline-flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-[#FF6B16]"></span>
                  <span className="text-[#FF6B16] font-black text-[11px] uppercase tracking-[0.25em]">
                    {heroSettings.tagline || 'WEEKEND ESCAPES JOURNAL'}
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-[#111111] tracking-tight">
                  {heroSettings.title || 'Travel Stories & Guides'}
                </h1>
              </div>

              {/* Quick Search Input */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search stories, passes, gear..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-neutral-200/90 rounded-full pl-10 pr-4 py-2 text-xs font-semibold text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-[#FF6B16] transition-colors shadow-sm"
                />
              </div>
            </div>

            {/* ── HERO SECTION MATCHING DESIGN ── */}
            {featuredBlog && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-16">
                {/* Left Column: Big Featured Editorial Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="lg:col-span-7 xl:col-span-8 flex"
                >
                  <Link
                    to={`/blogs/${featuredBlog.slug || featuredBlog.id}`}
                    className="group relative w-full rounded-3xl overflow-hidden aspect-[16/10] sm:aspect-[16/9] lg:aspect-auto lg:min-h-[460px] bg-neutral-900 border border-neutral-200 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-end"
                  >
                    {/* Background Image: Uses blog image or hero settings image */}
                    <img
                      src={getImageUrl(heroSettings.featuredImage || featuredBlog.image)}
                      alt={featuredBlog.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent transition-opacity" />

                    {/* Bottom Content Card */}
                    <div className="relative z-10 p-6 sm:p-8 flex flex-col justify-end">
                      {/* Category Pill with Orange Dot */}
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-neutral-900 text-xs font-bold shadow-sm w-fit mb-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B16]"></span>
                        <span>{featuredBlog.category}</span>
                      </div>

                      {/* Headline Title */}
                      <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight group-hover:text-[#FF6B16] transition-colors line-clamp-2 sm:line-clamp-3">
                        {featuredBlog.title}
                      </h2>

                      {/* Date & Read Time */}
                      <p className="text-xs text-white/80 mt-3 font-semibold tracking-wide">
                        {featuredBlog.date} • {featuredBlog.readTime}
                      </p>
                    </div>
                  </Link>
                </motion.div>

                {/* Right Column: "Latest post" List */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  className="lg:col-span-5 xl:col-span-4 flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-2xl font-bold text-neutral-900 mb-5 tracking-tight">
                      Latest post
                    </h3>

                    <div className="flex flex-col gap-3.5 sm:gap-4">
                      {latestPosts.map((post) => (
                        <Link
                          key={post.slug || post.id || post._id}
                          to={`/blogs/${post.slug || post.id || post._id}`}
                          className="group flex items-center gap-4 p-2.5 rounded-2xl bg-white/60 hover:bg-white border border-transparent hover:border-neutral-200/80 shadow-none hover:shadow-md transition-all duration-200 cursor-pointer"
                        >
                          {/* Rounded Square Thumbnail */}
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 bg-neutral-100 border border-neutral-200/80">
                            <img
                              src={getImageUrl(post.image)}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                            />
                          </div>

                          {/* Title & Metadata */}
                          <div className="flex-1 min-w-0 pr-1">
                            <h4 className="text-sm font-bold text-neutral-900 group-hover:text-[#FF6B16] transition-colors line-clamp-2 leading-snug">
                              {post.title}
                            </h4>
                            <span className="text-xs text-neutral-500 mt-1.5 block font-medium">
                              {post.date} • {post.readTime}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* ── CATEGORY FILTER NAVIGATION (DYNAMIC DATABASE PILLS) ── */}
            <div className="flex items-center justify-between flex-wrap gap-4 border-t border-b border-neutral-200/80 py-4 mb-10">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                      selectedCategory.toLowerCase() === cat.toLowerCase()
                        ? 'bg-[#111111] text-white shadow-sm'
                        : 'bg-white text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 border border-neutral-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <span className="text-xs font-bold text-neutral-500">
                Showing {filteredBlogs.length} {filteredBlogs.length === 1 ? 'article' : 'articles'}
              </span>
            </div>

            {/* ── EXPEDITION STORIES GRID ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBlogs.map((blog) => (
                <article
                  key={blog.slug || blog.id || blog._id}
                  className="group flex flex-col rounded-3xl overflow-hidden bg-white p-4 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 border border-neutral-200/80"
                >
                  <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-neutral-100">
                    <img
                      src={getImageUrl(blog.image)}
                      alt={blog.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-neutral-900 text-xs font-bold shadow-sm">
                        {blog.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col flex-grow p-4">
                    <div className="flex items-center gap-3 text-xs text-neutral-400 font-semibold mb-3">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {blog.date}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {blog.readTime}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-neutral-900 group-hover:text-[#FF6B16] transition-colors leading-snug line-clamp-2 mb-2">
                      <Link to={`/blogs/${blog.slug || blog.id || blog._id}`}>
                        {blog.title}
                      </Link>
                    </h3>

                    <p className="text-xs text-neutral-600 line-clamp-3 leading-relaxed mb-4 flex-grow">
                      {blog.excerpt}
                    </p>

                    <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                      <span className="font-semibold text-neutral-700 truncate max-w-[160px]">
                        By {blog.author}
                      </span>
                      <Link
                        to={`/blogs/${blog.slug || blog.id || blog._id}`}
                        className="inline-flex items-center gap-1 font-bold text-[#FF6B16] hover:translate-x-1 transition-transform"
                      >
                        Read <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}

export default BlogsPage;
