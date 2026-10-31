import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { DESTINATIONS } from '../../data/destinations';
import DestinationCard from './DestinationCard';
import SectionHeading from '../common/SectionHeading';
import Container from '../common/Container';
import FadeIn from '../animations/FadeIn';

export function Destinations() {
  return (
    <section id="explore-destinations" className="py-12 md:py-16 bg-[#F7F7F5] scroll-mt-10">
      <Container>
        {/* Section Heading matching screenshot */}
        <FadeIn direction="up">
          <SectionHeading
            eyebrow="Top Destinations"
            title="Explore Our Destinations"
            subtitle="Discover breathtaking places handpicked for your perfect getaway."
            size="compact"
            action={
              <Link
                to="/destinations"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-300 hover:border-[#FF6B16] text-xs font-bold text-neutral-800 hover:text-[#FF6B16] transition-all bg-white shadow-xs group"
              >
                <span>View All Destinations</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            }
          />
        </FadeIn>

        {/* 5 Destination Cards in Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
          {DESTINATIONS.map((dest, idx) => (
            <FadeIn key={dest.id} direction="up" delay={idx * 0.1}>
              <DestinationCard destination={dest} />
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}

export default Destinations;
