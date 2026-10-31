import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PACKAGES } from '../../data/packages';
import PackageCard from './PackageCard';
import SectionHeading from '../common/SectionHeading';
import Container from '../common/Container';
import FadeIn from '../animations/FadeIn';

export function Packages() {
  return (
    <section className="py-10 md:py-14 bg-[#F7F7F5]">
      <Container>
        {/* Section Heading matching screenshot */}
        <FadeIn direction="up">
          <SectionHeading
            eyebrow="Popular Packages"
            title="Trending Tour Packages"
            subtitle="Handpicked trips with the best experiences, explorations and value."
            size="compact"
            action={
              <Link
                to="/packages"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-300 hover:border-[#FF6B16] text-xs font-bold text-neutral-800 hover:text-[#FF6B16] transition-all bg-white shadow-xs group"
              >
                <span>View All Packages</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            }
          />
        </FadeIn>

        {/* 4 Packages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {PACKAGES.map((pkg, idx) => (
            <FadeIn key={pkg.id} direction="up" delay={idx * 0.1}>
              <PackageCard pkg={pkg} />
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}

export default Packages;
