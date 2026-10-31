import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BLOGS } from '../data/blogs';
import Container from '../components/common/Container';
import { Calendar, Clock, User, ArrowLeft, ArrowRight, Share2, BookOpen } from 'lucide-react';

export function BlogsPage() {
  const { id } = useParams();
  const selectedBlog = id ? BLOGS.find((b) => b.id === id) : null;

  return (
    <div className="pt-28 pb-24 bg-[#F7F7F5] min-h-screen">
      <Container>
        {selectedBlog ? (
          /* Single Blog Article View */
          <article className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-12 border border-neutral-100 shadow-md">
            <Link
              to="/blogs"
              className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-[#FF6B16] mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to all travel stories</span>
            </Link>

            <div className="flex items-center gap-3 mb-4">
              <span className="px-3.5 py-1 rounded-full bg-[#FF6B16] text-white text-xs font-black uppercase tracking-wider">
                {selectedBlog.category}
              </span>
              <span className="text-xs text-neutral-400 font-semibold">
                {selectedBlog.readTime}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#111111] leading-tight mb-4">
              {selectedBlog.title}
            </h1>

            <div className="flex items-center gap-4 text-xs text-neutral-500 pb-8 border-b border-neutral-100 mb-8">
              <span className="flex items-center gap-1.5 font-bold text-neutral-800">
                <User className="w-3.5 h-3.5 text-[#FF6B16]" />
                {selectedBlog.author}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {selectedBlog.date}
              </span>
            </div>

            {/* Featured Image */}
            <div className="rounded-2xl overflow-hidden aspect-[16/9] mb-8 bg-neutral-900">
              <img
                src={selectedBlog.image}
                alt={selectedBlog.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content Body */}
            <div className="prose prose-neutral max-w-none text-neutral-700 leading-relaxed space-y-6 text-base sm:text-lg">
              <p className="font-semibold text-xl text-neutral-900 border-l-4 border-[#FF6B16] pl-4 italic">
                {selectedBlog.excerpt}
              </p>
              <div className="whitespace-pre-line text-neutral-700 leading-loose">
                {selectedBlog.content}
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
                className="px-6 py-3 rounded-full bg-[#FF6B16] hover:bg-[#e05809] text-white text-xs font-black uppercase tracking-wider shadow-md"
              >
                Plan My Trip
              </Link>
            </div>
          </article>
        ) : (
          /* All Blogs Index View */
          <div>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-[#FF6B16]"></span>
                <span className="text-[#FF6B16] font-bold text-xs uppercase tracking-widest">
                  TRAVEL STORIES & INSIGHTS
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-[#111111] tracking-tight">
                Latest Travel Stories
              </h1>
              <p className="mt-3 text-neutral-600 text-base sm:text-lg">
                Expert tips, detailed trail guides, and breathtaking expedition updates from our on-ground leaders.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {BLOGS.map((blog) => (
                <article
                  key={blog.id}
                  className="group flex flex-col rounded-3xl overflow-hidden bg-white p-4 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 border border-neutral-100"
                >
                  <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-neutral-100">
                    <img
                      src={blog.image}
                      alt={blog.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/10">
                        {blog.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 flex flex-col flex-1 justify-between">
                    <div>
                      <div className="flex items-center gap-4 text-xs font-semibold text-neutral-400 mb-2">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#FF6B16]" />
                          {blog.date}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {blog.readTime}
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-[#111111] group-hover:text-[#FF6B16] transition-colors line-clamp-2 leading-snug">
                        {blog.title}
                      </h3>

                      <p className="mt-2 text-xs sm:text-sm text-neutral-600 line-clamp-2 leading-relaxed">
                        {blog.excerpt}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-100">
                      <Link
                        to={`/blogs/${blog.id}`}
                        className="inline-flex items-center gap-2 text-xs font-black text-[#FF6B16] hover:text-[#e05809] uppercase tracking-wider group-hover:gap-3 transition-all"
                      >
                        <span>Read Full Guide</span>
                        <ArrowRight className="w-3.5 h-3.5" />
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
