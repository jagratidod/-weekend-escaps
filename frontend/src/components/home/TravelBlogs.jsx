import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { BLOGS } from '../../data/blogs';
import SectionHeading from '../common/SectionHeading';
import Container from '../common/Container';

export function TravelBlogs() {
  return (
    <section className="py-10 md:py-14 bg-[#F7F7F5]">
      <Container>
        <SectionHeading
          size="compact"
          eyebrow="Travel Guides & Tips"
          title="Latest Travel Stories"
          subtitle="Ideas, guides and inspiration for your next adventure."
          action={
            <Link
              to="/blogs"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[#FF6B16]/70 hover:border-[#FF6B16] hover:bg-[#FF6B16] text-xs sm:text-sm font-bold text-neutral-800 hover:text-white transition-all bg-white shadow-xs group"
            >
              <span>View All Blogs</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {BLOGS.map((blog) => (
            <Link
              key={blog.id}
              to={`/blogs/${blog.id}`}
              className="group relative block rounded-2xl overflow-hidden aspect-[16/9] shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
            >
              <img
                src={blog.image}
                alt={blog.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
              <div className="absolute inset-x-3 bottom-3 rounded-xl bg-white px-4 py-3 shadow-sm">
                <h3 className="text-sm sm:text-[15px] font-extrabold text-[#111111] leading-snug line-clamp-2 group-hover:text-[#FF6B16] transition-colors">
                  {blog.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

export default TravelBlogs;
