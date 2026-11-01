import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      index: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BlogCategory',
      default: null,
    },
    excerpt: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: '/newimage/exploresection/kedarkantha.png',
    },
    author: {
      type: String,
      default: 'Weekend Escapes Team',
      trim: true,
    },
    authorRole: {
      type: String,
      default: 'Travel Curator',
      trim: true,
    },
    date: {
      type: String,
      default: () =>
        new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
    },
    readTime: {
      type: String,
      default: '5 min read',
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

blogSchema.index({ createdAt: -1 });
blogSchema.index({ category: 1, createdAt: -1 });
blogSchema.index({ title: 'text', excerpt: 'text', content: 'text' });

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;
