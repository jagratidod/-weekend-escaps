import React from 'react';
import Hero from '../components/home/Hero';
import Experiences from '../components/home/Experiences';
import Packages from '../components/home/Packages';
import WhyChooseUs from '../components/home/WhyChooseUs';
import BookingProcess from '../components/home/BookingProcess';
import Testimonials from '../components/home/Testimonials';
import Gallery from '../components/home/Gallery';
import TravelBlogs from '../components/home/TravelBlogs';
import FinalCTA from '../components/home/FinalCTA';

export function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Cinematic Hero Section with Integrated Bottom Search & Topography */}
      <Hero />

      {/* 2. Travel Experiences (Dark with brush strokes) */}
      <Experiences />

      {/* 4. Trending Tour Packages */}
      <Packages />

      {/* 5. Why Choose Weekend Escapes (More Than Just A Trip) */}
      <WhyChooseUs />

      {/* 6. Our Booking Process (From Dream to Destination) */}
      <BookingProcess />

      {/* 7. Traveler Testimonials (What Our Travelers Say) */}
      <Testimonials />

      {/* 8. Travel Memories Gallery (Moments From Our Trips) */}
      <Gallery />

      {/* 9. Travel Guides and Blogs (Latest Travel Stories) */}
      <TravelBlogs />

      {/* 10. Final CTA Section (Ready for Your Next Adventure?) */}
      <FinalCTA />
    </div>
  );
}

export default Home;
