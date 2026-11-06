import React from 'react';
import Hero from '../components/home/Hero';
import TripReelsRow from '../components/home/TripReelsRow';
import Experiences from '../components/home/Experiences';
import Packages from '../components/home/Packages';
import WhyChooseUs from '../components/home/WhyChooseUs';
import BookingProcess from '../components/home/BookingProcess';
import Testimonials from '../components/home/Testimonials';
import Gallery from '../components/home/Gallery';
import TravelBlogs from '../components/home/TravelBlogs';
import FinalCTA from '../components/home/FinalCTA';
import { useSettings } from '../context/SettingsContext';
import { DEFAULT_SECTION_ORDER } from '../utils/defaultHomeSections';

const SECTION_COMPONENTS = {
  hero: <Hero key="hero" />,
  reels: (
    <div key="reels" className="bg-[#F7F7F5] pt-12 pb-4 w-full overflow-hidden">
      <TripReelsRow />
    </div>
  ),
  experiences: <Experiences key="experiences" />,
  packages: <Packages key="packages" />,
  whyChooseUs: <WhyChooseUs key="whyChooseUs" />,
  bookingProcess: <BookingProcess key="bookingProcess" />,
  testimonials: <Testimonials key="testimonials" />,
  gallery: <Gallery key="gallery" />,
  blogs: <TravelBlogs key="blogs" />,
  finalCta: <FinalCTA key="finalCta" />,
};

export function Home() {
  const { homeSections } = useSettings();
  const rawOrder = homeSections?.sectionOrder;
  const sectionOrder = Array.isArray(rawOrder) && rawOrder.length > 0 ? rawOrder : DEFAULT_SECTION_ORDER;

  return (
    <div className="flex flex-col min-h-screen">
      {sectionOrder.map((sectionId) => SECTION_COMPONENTS[sectionId] || null)}
    </div>
  );
}

export default Home;
