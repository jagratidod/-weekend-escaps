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
import TrustedCompanies from '../components/home/TrustedCompanies';
import FinalCTA from '../components/home/FinalCTA';
import { useSettings } from '../context/SettingsContext';
import { DEFAULT_SECTION_ORDER, DEFAULT_SECTION_VISIBILITY } from '../utils/defaultHomeSections';

const SECTION_COMPONENTS = {
  hero: <Hero key="hero" />,
  reels: (
    <div key="reels" className="bg-white py-10 sm:py-14 md:py-16 w-full overflow-hidden" style={{ overflowX: 'clip' }}>
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
  trustedCompanies: <TrustedCompanies key="trustedCompanies" />,
  finalCta: <FinalCTA key="finalCta" />,
};

export function Home() {
  const { homeSections } = useSettings();
  const rawOrder = homeSections?.sectionOrder;
  let sectionOrder = Array.isArray(rawOrder) && rawOrder.length > 0 ? rawOrder : DEFAULT_SECTION_ORDER;

  // Gracefully ensure trustedCompanies is rendered directly above finalCta
  if (!sectionOrder.includes('trustedCompanies')) {
    const finalCtaIndex = sectionOrder.indexOf('finalCta');
    if (finalCtaIndex !== -1) {
      sectionOrder = [
        ...sectionOrder.slice(0, finalCtaIndex),
        'trustedCompanies',
        ...sectionOrder.slice(finalCtaIndex),
      ];
    } else {
      sectionOrder = [...sectionOrder, 'trustedCompanies'];
    }
  }

  const visibility = homeSections?.sectionVisibility || DEFAULT_SECTION_VISIBILITY;

  return (
    <div className="flex flex-col min-h-screen">
      {sectionOrder
        .filter((sectionId) => visibility[sectionId] !== false)
        .map((sectionId) => SECTION_COMPONENTS[sectionId] || null)}
    </div>
  );
}

export default Home;
