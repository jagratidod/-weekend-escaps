import Blog from '../models/Blog.js';
import BlogCategory from '../models/BlogCategory.js';
import Setting from '../models/Setting.js';

// Helper to slugify string
const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');

/**
 * GET /api/blogs
 * Public & Admin: Fetch blogs with category filter, search, and pagination
 */
export const getBlogs = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 50, all = 'false' } = req.query;

    const query = {};
    if (all !== 'true') {
      query.isPublished = true;
    }

    if (category && category !== 'All' && category !== 'all') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: regex }, { excerpt: regex }, { category: regex }];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageLimit = Math.max(1, parseInt(limit, 10) || 50);
    const skip = (pageNum - 1) * pageLimit;

    const [blogs, total] = await Promise.all([
      Blog.find(query).sort({ isFeatured: -1, createdAt: -1 }).skip(skip).limit(pageLimit),
      Blog.countDocuments(query),
    ]);

    // Determine featured blog (explicitly marked featured or the first post)
    const featuredBlog = blogs.find((b) => b.isFeatured) || blogs[0] || null;
    const latestPosts = blogs.filter((b) => b._id.toString() !== featuredBlog?._id?.toString()).slice(0, 4);

    return res.status(200).json({
      success: true,
      blogs,
      featuredBlog,
      latestPosts,
      total,
      page: pageNum,
      pages: Math.ceil(total / pageLimit),
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch blogs',
    });
  }
};

/**
 * GET /api/blogs/:identifier
 * Public: Fetch single blog by slug or ID
 */
export const getBlogByIdOrSlug = async (req, res) => {
  try {
    const { identifier } = req.params;

    let blog = null;
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      blog = await Blog.findById(identifier);
    }

    if (!blog) {
      blog = await Blog.findOne({ $or: [{ slug: identifier }, { id: identifier }] });
    }

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog article not found',
      });
    }

    // Increment view count asynchronously
    blog.viewsCount += 1;
    await blog.save();

    // Related blogs in same category
    const relatedBlogs = await Blog.find({
      category: blog.category,
      _id: { $ne: blog._id },
      isPublished: true,
    })
      .limit(3)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      blog,
      relatedBlogs,
    });
  } catch (error) {
    console.error('Get blog by identifier error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch blog article',
    });
  }
};

/**
 * POST /api/blogs
 * Admin: Create a new blog post
 */
export const createBlog = async (req, res) => {
  try {
    const {
      title,
      category,
      excerpt,
      content,
      image,
      author,
      authorRole,
      readTime,
      isFeatured,
      isPublished,
    } = req.body;

    if (!title || !category || !excerpt || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title, Category, Excerpt, and Content are required.',
      });
    }

    let slug = slugify(title);
    let existing = await Blog.findOne({ slug });
    let count = 1;
    while (existing) {
      slug = `${slugify(title)}-${count}`;
      existing = await Blog.findOne({ slug });
      count += 1;
    }

    // Link Category ID if exists
    const catDoc = await BlogCategory.findOne({
      $or: [{ name: { $regex: new RegExp(`^${category}$`, 'i') } }, { slug: slugify(category) }],
    });

    // If marked as featured, unset previous featured if necessary
    if (isFeatured) {
      await Blog.updateMany({ isFeatured: true }, { $set: { isFeatured: false } });
    }

    const newBlog = new Blog({
      id: slug,
      title: title.trim(),
      slug,
      category: catDoc ? catDoc.name : category.trim(),
      categoryId: catDoc ? catDoc._id : null,
      excerpt: excerpt.trim(),
      content: content.trim(),
      image: image || '/newimage/exploresection/kedarkantha.png',
      author: author ? author.trim() : 'Weekend Escapes Team',
      authorRole: authorRole ? authorRole.trim() : 'Travel Curator',
      readTime: readTime ? readTime.trim() : '5 min read',
      isFeatured: !!isFeatured,
      isPublished: isPublished !== undefined ? !!isPublished : true,
    });

    await newBlog.save();

    return res.status(201).json({
      success: true,
      message: 'Blog post created successfully',
      blog: newBlog,
    });
  } catch (error) {
    console.error('Create blog error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create blog post',
    });
  }
};

/**
 * PUT /api/blogs/:id
 * Admin: Update existing blog
 */
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      category,
      excerpt,
      content,
      image,
      author,
      authorRole,
      readTime,
      isFeatured,
      isPublished,
    } = req.body;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found',
      });
    }

    if (title && title.trim() !== blog.title) {
      blog.title = title.trim();
      let newSlug = slugify(title);
      let existing = await Blog.findOne({ slug: newSlug, _id: { $ne: blog._id } });
      let count = 1;
      while (existing) {
        newSlug = `${slugify(title)}-${count}`;
        existing = await Blog.findOne({ slug: newSlug, _id: { $ne: blog._id } });
        count += 1;
      }
      blog.slug = newSlug;
      blog.id = newSlug;
    }

    if (category) {
      const catDoc = await BlogCategory.findOne({
        $or: [{ name: { $regex: new RegExp(`^${category}$`, 'i') } }, { slug: slugify(category) }],
      });
      blog.category = catDoc ? catDoc.name : category.trim();
      blog.categoryId = catDoc ? catDoc._id : null;
    }

    if (excerpt !== undefined) blog.excerpt = excerpt.trim();
    if (content !== undefined) blog.content = content.trim();
    if (image !== undefined) blog.image = image;
    if (author !== undefined) blog.author = author.trim();
    if (authorRole !== undefined) blog.authorRole = authorRole.trim();
    if (readTime !== undefined) blog.readTime = readTime.trim();
    if (isPublished !== undefined) blog.isPublished = !!isPublished;

    if (isFeatured !== undefined) {
      if (isFeatured && !blog.isFeatured) {
        await Blog.updateMany({ isFeatured: true }, { $set: { isFeatured: false } });
      }
      blog.isFeatured = !!isFeatured;
    }

    await blog.save();

    return res.status(200).json({
      success: true,
      message: 'Blog post updated successfully',
      blog,
    });
  } catch (error) {
    console.error('Update blog error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update blog post',
    });
  }
};

/**
 * DELETE /api/blogs/:id
 * Admin: Delete a blog post
 */
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Blog.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Blog post deleted successfully',
    });
  } catch (error) {
    console.error('Delete blog error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete blog post',
    });
  }
};

/**
 * GET /api/blogs/categories/all
 * Public & Admin: Fetch all active categories with blog count
 */
export const getCategories = async (req, res) => {
  try {
    const categories = await BlogCategory.find({ isActive: true }).sort({ order: 1, name: 1 });

    // Aggregate counts of published blogs per category
    const counts = await Blog.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    counts.forEach((c) => {
      if (c._id) countMap[c._id.toLowerCase()] = c.count;
    });

    const enrichedCategories = categories.map((cat) => ({
      _id: cat._id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      order: cat.order,
      blogCount: countMap[cat.name.toLowerCase()] || 0,
    }));

    return res.status(200).json({
      success: true,
      categories: enrichedCategories,
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch categories',
    });
  }
};

/**
 * POST /api/blogs/categories
 * Admin: Create a new category
 */
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }

    const trimmedName = name.trim();
    const slug = slugify(trimmedName);

    const existing = await BlogCategory.findOne({
      $or: [{ name: { $regex: new RegExp(`^${trimmedName}$`, 'i') } }, { slug }],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Category "${trimmedName}" already exists.`,
      });
    }

    const count = await BlogCategory.countDocuments();
    const newCategory = new BlogCategory({
      name: trimmedName,
      slug,
      description: description ? description.trim() : '',
      order: count + 1,
    });

    await newCategory.save();

    return res.status(201).json({
      success: true,
      message: `Category "${trimmedName}" created successfully`,
      category: newCategory,
    });
  } catch (error) {
    console.error('Create category error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create category',
    });
  }
};

/**
 * PUT /api/blogs/categories/:id
 * Admin: Update category
 */
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, order } = req.body;

    const cat = await BlogCategory.findById(id);
    if (!cat) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    const oldName = cat.name;

    if (name && name.trim() !== cat.name) {
      const trimmedName = name.trim();
      const newSlug = slugify(trimmedName);

      const duplicate = await BlogCategory.findOne({
        _id: { $ne: cat._id },
        $or: [{ name: { $regex: new RegExp(`^${trimmedName}$`, 'i') } }, { slug: newSlug }],
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Category name "${trimmedName}" is already in use`,
        });
      }

      cat.name = trimmedName;
      cat.slug = newSlug;

      // Also update any blogs that were using the old category name
      await Blog.updateMany({ category: oldName }, { $set: { category: trimmedName } });
    }

    if (description !== undefined) cat.description = description.trim();
    if (order !== undefined) cat.order = Number(order) || cat.order;

    await cat.save();

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category: cat,
    });
  } catch (error) {
    console.error('Update category error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update category',
    });
  }
};

/**
 * DELETE /api/blogs/categories/:id
 * Admin: Delete category
 */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const cat = await BlogCategory.findById(id);
    if (!cat) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Check if any blogs use this category
    const blogCount = await Blog.countDocuments({ category: cat.name });
    if (blogCount > 0) {
      // Reassign blogs to 'Adventure' or first category
      const fallbackCat = await BlogCategory.findOne({ _id: { $ne: cat._id } });
      const fallbackName = fallbackCat ? fallbackCat.name : 'Adventure';
      await Blog.updateMany({ category: cat.name }, { $set: { category: fallbackName } });
    }

    await BlogCategory.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: `Category "${cat.name}" removed successfully`,
    });
  } catch (error) {
    console.error('Delete category error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete category',
    });
  }
};

/**
 * GET /api/blogs/hero/settings
 * Public: Get blog page hero section settings
 */
export const getBlogHero = async (req, res) => {
  try {
    let setting = await Setting.findOne({ key: 'site_settings' });
    if (!setting) {
      setting = new Setting({ key: 'site_settings' });
      await setting.save();
    }

    const blogHero = setting.blogHero || {
      tagline: 'WEEKEND ESCAPES JOURNAL',
      title: 'Travel Stories & Guides',
      subtitle: 'Inspiring trail notes, high-altitude pass guides, and gear tips',
      featuredImage: '/newimage/exploresection/kedarkantha.png',
      featuredBlogId: '',
    };

    return res.status(200).json({
      success: true,
      blogHero,
    });
  } catch (error) {
    console.error('Get blog hero error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch hero settings',
    });
  }
};

/**
 * PUT /api/blogs/hero/settings
 * Admin: Update blog page hero section settings
 */
export const updateBlogHero = async (req, res) => {
  try {
    const { tagline, title, subtitle, featuredImage, featuredBlogId } = req.body;

    let setting = await Setting.findOne({ key: 'site_settings' });
    if (!setting) {
      setting = new Setting({ key: 'site_settings' });
    }

    if (!setting.blogHero) {
      setting.blogHero = {};
    }

    if (tagline !== undefined) setting.blogHero.tagline = tagline.trim();
    if (title !== undefined) setting.blogHero.title = title.trim();
    if (subtitle !== undefined) setting.blogHero.subtitle = subtitle.trim();
    if (featuredImage !== undefined) setting.blogHero.featuredImage = featuredImage;
    if (featuredBlogId !== undefined) setting.blogHero.featuredBlogId = featuredBlogId;

    await setting.save();

    return res.status(200).json({
      success: true,
      message: 'Blog hero section updated successfully',
      blogHero: setting.blogHero,
    });
  } catch (error) {
    console.error('Update blog hero error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update hero settings',
    });
  }
};
