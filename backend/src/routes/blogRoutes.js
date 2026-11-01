import express from 'express';
import {
  getBlogs,
  getBlogByIdOrSlug,
  createBlog,
  updateBlog,
  deleteBlog,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getBlogHero,
  updateBlogHero,
} from '../controllers/blogController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ── Hero Section Settings ──
router.get('/hero/settings', getBlogHero);
router.put('/hero/settings', protect, updateBlogHero);

// ── Category Endpoints ──
router.get('/categories/all', getCategories);
router.post('/categories', protect, createCategory);
router.put('/categories/:id', protect, updateCategory);
router.delete('/categories/:id', protect, deleteCategory);

// ── Blog Post Endpoints ──
router.get('/', getBlogs);
router.get('/:identifier', getBlogByIdOrSlug);
router.post('/', protect, createBlog);
router.put('/:id', protect, updateBlog);
router.delete('/:id', protect, deleteBlog);

export default router;
