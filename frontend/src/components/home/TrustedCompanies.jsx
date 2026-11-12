import React, { useState, useMemo } from 'react';
import Container from '../common/Container';
import { useSettings } from '../../context/SettingsContext';
import { DEFAULT_HOME_SECTIONS } from '../../utils/defaultHomeSections';
import { Building2, Sparkles } from 'lucide-react';

export function TrustedCompanies() {
  const { homeSections, formatImageUrl } = useSettings();
  const data = homeSections?.trustedCompanies || DEFAULT_HOME_SECTIONS.trustedCompanies;

  const badgeText = data?.badge || 'TRUSTED BY GLOBAL TEAMS';
  const titleText = data?.title || 'Trusted by Leading Companies & Travelers';
  const subtitleText =
    data?.subtitle ||
    'From fast-growing startups to enterprise leaders, top teams trust Weekend Escapes for their offsites & expeditions.';

  const rawItems = useMemo(() => {
    const list = Array.isArray(data?.items) && data.items.length > 0
      ? data.items
      : DEFAULT_HOME_SECTIONS.trustedCompanies.items;
    // Filter out invalid items that have neither name nor logo
    const valid = list.filter((item) => item && (item.name || item.logo));
    return valid.length > 0 ? valid : DEFAULT_HOME_SECTIONS.trustedCompanies.items;
  }, [data?.items]);

  // Ensure enough items to create a smooth, gapless infinite continuous marquee
  const items = useMemo(() => {
    if (!rawItems || rawItems.length === 0) return [];
    let list = [...rawItems];
    while (list.length < 12) {
      list = [...list, ...rawItems];
    }
    return list;
  }, [rawItems]);

  if (!items || items.length === 0) return null;

  return (
    <section className="relative py-12 sm:py-16 md:py-20 bg-white overflow-hidden border-t border-neutral-150">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-orange-100/30 via-amber-50/20 to-sky-100/20 blur-3xl pointer-events-none -z-10 rounded-full" />

      <Container className="relative z-10 mb-8 sm:mb-12 text-center">
        {/* Eyebrow Badge */}
        {badgeText && (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-50 border border-orange-200/60 text-[#FF6B16] text-[11px] font-black uppercase tracking-widest mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#FF6B16]" />
            <span>{badgeText}</span>
          </div>
        )}

        {/* Section Title */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#111111] tracking-tight">
          {titleText}
        </h2>

        {/* Section Subtitle */}
        {subtitleText && (
          <p className="mt-2 text-xs sm:text-sm text-neutral-500 font-medium max-w-2xl mx-auto leading-relaxed">
            {subtitleText}
          </p>
        )}
      </Container>

      {/* Marquee Row Container with Gradient Edge Fades */}
      <div className="relative w-full overflow-hidden select-none">
        {/* Left Gradient Edge Fade */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-28 md:w-36 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />

        {/* Right Gradient Edge Fade */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-28 md:w-36 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />

        {/* Continuous Running Marquee Ribbon (Right-to-Left) */}
        <div className="animate-marquee-continuous flex items-center gap-8 sm:gap-12 md:gap-16 py-4 px-4">
          {/* First loop of items */}
          {items.map((company, index) => {
            const key = `company-a-${company.id || index}-${index}`;
            return (
              <CompanyCard
                key={key}
                company={company}
                formatImageUrl={formatImageUrl}
              />
            );
          })}

          {/* Second duplicate loop to create 100% gapless continuous marquee */}
          {items.map((company, index) => {
            const key = `company-b-${company.id || index}-${index}`;
            return (
              <CompanyCard
                key={key}
                company={company}
                formatImageUrl={formatImageUrl}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

/**
 * Single Company Logo rendered directly on the background without enclosing card/box
 * With smooth hover zoom & color reveal
 */
function CompanyCard({ company, formatImageUrl }) {
  const [imgError, setImgError] = useState(false);

  const cardContent = (
    <div
      className="group/logo relative shrink-0 flex items-center justify-center min-w-[120px] sm:min-w-[140px] md:min-w-[160px] h-12 sm:h-14 px-3 sm:px-4 cursor-pointer transition-transform duration-300 ease-out transform hover:scale-115 sm:hover:scale-120 outline-none"
      title={company.name || 'Partner Company'}
    >
      {company.logo && !imgError ? (
        <img
          src={formatImageUrl(company.logo)}
          alt={company.name || 'Company'}
          onError={() => setImgError(true)}
          className="h-8 sm:h-9 md:h-10 w-auto max-w-[120px] sm:max-w-[140px] object-contain filter grayscale opacity-60 group-hover/logo:grayscale-0 group-hover/logo:opacity-100 transition-all duration-300 drop-shadow-2xs select-none pointer-events-none"
        />
      ) : (
        <div className="flex items-center gap-2 text-neutral-600 group-hover/logo:text-[#FF6B16] transition-colors select-none">
          <Building2 className="w-5 h-5 text-neutral-400 group-hover/logo:text-[#FF6B16] transition-colors shrink-0" />
          <span className="text-sm sm:text-base font-extrabold tracking-tight whitespace-nowrap">
            {company.name || 'Company'}
          </span>
        </div>
      )}
    </div>
  );

  if (company.website && typeof company.website === 'string' && company.website.trim() !== '') {
    const href = company.website.startsWith('http')
      ? company.website
      : `https://${company.website}`;

    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 flex items-center justify-center outline-none focus:outline-none no-underline"
      >
        {cardContent}
      </a>
    );
  }

  return <div className="shrink-0 flex items-center justify-center">{cardContent}</div>;
}

export default TrustedCompanies;
