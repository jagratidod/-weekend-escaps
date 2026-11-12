import React from 'react';
import Container from '../common/Container';
import { useSettings } from '../../context/SettingsContext';
import { DEFAULT_HOME_SECTIONS } from '../../utils/defaultHomeSections';
import { Building2, Sparkles, ExternalLink } from 'lucide-react';

export function TrustedCompanies() {
  const { homeSections, formatImageUrl } = useSettings();
  const data = homeSections?.trustedCompanies || DEFAULT_HOME_SECTIONS.trustedCompanies;

  const badgeText = data?.badge || 'TRUSTED BY GLOBAL TEAMS';
  const titleText = data?.title || 'Trusted by Leading Companies & Travelers';
  const subtitleText =
    data?.subtitle ||
    'From fast-growing startups to enterprise leaders, top teams trust Weekend Escapes for their offsites & expeditions.';

  const rawItems = Array.isArray(data?.items) && data.items.length > 0
    ? data.items
    : DEFAULT_HOME_SECTIONS.trustedCompanies.items;

  // Ensure minimum items for a smooth infinite marquee without gaps on large viewports
  const items = React.useMemo(() => {
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

      <Container className="relative z-10 mb-8 sm:mb-10 text-center">
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
      <div className="relative w-full overflow-hidden group select-none">
        {/* Left Gradient Edge Fade */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-28 md:w-36 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />

        {/* Right Gradient Edge Fade */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-28 md:w-36 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />

        {/* Continuous Running Marquee Ribbon (Right-to-Left) */}
        <div className="animate-marquee-continuous flex items-center gap-4 sm:gap-6 md:gap-8 py-3 px-2">
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
 * Single Company Card with Hover Zoom & Transition Effects
 */
function CompanyCard({ company, formatImageUrl }) {
  const [imgError, setImgError] = React.useState(false);

  const cardContent = (
    <div
      className="group/card relative h-14 sm:h-16 md:h-18 px-6 sm:px-8 py-2.5 sm:py-3 rounded-2xl bg-neutral-50/90 hover:bg-white border border-neutral-200/80 hover:border-[#FF6B16]/50 shadow-2xs hover:shadow-lg transition-all duration-300 ease-out transform hover:scale-110 sm:hover:scale-115 flex items-center justify-center shrink-0 cursor-pointer min-w-[130px] sm:min-w-[150px]"
      title={company.name || 'Partner Company'}
    >
      {company.logo && !imgError ? (
        <img
          src={formatImageUrl(company.logo)}
          alt={company.name || 'Company'}
          onError={() => setImgError(true)}
          className="max-h-7 sm:max-h-8 md:max-h-9 max-w-[110px] sm:max-w-[130px] w-auto object-contain filter grayscale opacity-70 group-hover/card:grayscale-0 group-hover/card:opacity-100 transition-all duration-300"
          loading="lazy"
        />
      ) : (
        <div className="flex items-center gap-2 text-neutral-700 group-hover/card:text-[#FF6B16] transition-colors">
          <Building2 className="w-4 h-4 text-neutral-400 group-hover/card:text-[#FF6B16]" />
          <span className="text-xs sm:text-sm font-extrabold tracking-tight whitespace-nowrap">
            {company.name || 'Company'}
          </span>
        </div>
      )}

      {/* Subtle indicator icon if link is present */}
      {company.website && (
        <span className="absolute top-1.5 right-1.5 opacity-0 group-hover/card:opacity-100 transition-opacity text-neutral-400 hover:text-[#FF6B16]">
          <ExternalLink className="w-2.5 h-2.5" />
        </span>
      )}
    </div>
  );

  if (company.website && company.website.trim() !== '') {
    return (
      <a
        href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block"
      >
        {cardContent}
      </a>
    );
  }

  return cardContent;
}

export default TrustedCompanies;
