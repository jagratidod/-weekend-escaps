import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { BRAND } from '../../utils/constants';
import Container from '../common/Container';
import { useSettings } from '../../context/SettingsContext';

function WhatsAppIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fill="#25D366"
        d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.8 7.37 7.5 3.67 12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15ZM16.57 14.39C16.32 14.27 15.1 13.67 14.87 13.59C14.65 13.5 14.48 13.46 14.32 13.71C14.15 13.96 13.68 14.51 13.53 14.68C13.39 14.85 13.25 14.87 13 14.75C12.75 14.62 11.96 14.37 11.02 13.53C10.29 12.87 9.8 12.07 9.65 11.82C9.51 11.58 9.64 11.44 9.76 11.32C9.87 11.21 10.01 11.03 10.14 10.88C10.26 10.74 10.31 10.63 10.39 10.46C10.47 10.3 10.43 10.15 10.37 10.03C10.31 9.9 9.82 8.7 9.61 8.21C9.42 7.73 9.21 7.79 9.06 7.78C8.92 7.78 8.75 7.77 8.59 7.77C8.42 7.77 8.16 7.84 7.93 8.08C7.71 8.33 7.08 8.92 7.08 10.12C7.08 11.32 7.95 12.48 8.08 12.64C8.2 12.81 9.8 15.27 12.25 16.33C12.83 16.58 13.29 16.73 13.64 16.84C14.22 17.03 14.75 17 15.17 16.94C15.64 16.87 16.62 16.35 16.82 15.77C17.03 15.19 17.03 14.7 16.97 14.6C16.91 14.5 16.75 14.44 16.57 14.39Z"
      />
    </svg>
  );
}

export function FinalCTA() {
  const { homeSections, formatImageUrl, footerLogoUrl, whatsappUrl } = useSettings();
  const ctaData = homeSections?.finalCta || {};

  const headingText = ctaData.heading || 'Ready for Your Next Adventure?';
  const subtitleText =
    ctaData.subtitle ||
    "Let's turn your travel dreams into unforgettable memories. Get personalized recommendations and plan your next escape.";
  const bgImg = formatImageUrl(
    ctaData.bgImage || '/newimage/other sections image/footerbanner2.png'
  );
  const primaryButtonText = ctaData.primaryButtonText || 'Plan My Trip';
  const primaryButtonLink = ctaData.primaryButtonLink || '/plan-trip';
  const whatsappButtonText = ctaData.whatsappButtonText || 'Talk on WhatsApp';
  const activeWhatsAppLink = ctaData.whatsappUrl || whatsappUrl || BRAND.whatsappUrl;

  return (
    <section className="relative py-10 sm:py-12 md:py-14 overflow-hidden bg-[#111111] text-white">
      {/* Top Organic Torn/Brush Transition into Mountain Banner */}
      <div className="absolute top-0 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none -translate-y-[1px] z-20">
        <img
          src="/images/decorations/finalcta-top-brush.svg"
          alt=""
          className="w-full h-8 sm:h-12 md:h-16 object-cover"
        />
      </div>

      {/* Cinematic Mountain Sunset Panorama Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src={bgImg}
          alt="Sunset mountains"
          loading="lazy"
          className="w-full h-full object-cover object-center"
        />
        {/* Dark gradient overlay to keep text sharp while preserving vibrant sunset glow */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
      </div>

      <Container className="relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10">
          {/* Left: Weekend Escapes Stacked Logo */}
          <div className="shrink-0 flex items-center justify-center lg:justify-start">
            <Link to="/" className="inline-block transition-transform duration-300 hover:scale-105">
              <img
                src={footerLogoUrl || '/logo/weekend-escapes-logo-stacked-white.svg'}
                alt="Weekend Escapes"
                className="w-28 sm:w-36 md:w-40 h-auto drop-shadow-md"
              />
            </Link>
          </div>

          {/* Center: Main Content (Heading, Subtitle, Buttons) */}
          <div className="flex-1 max-w-2xl text-center mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
              {headingText}
            </h2>

            <p className="mt-2 text-xs sm:text-sm text-neutral-300 font-medium max-w-xl mx-auto leading-relaxed">
              {subtitleText}
            </p>

            <div className="mt-4 sm:mt-5 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {/* Plan My Trip Button */}
              <Link
                to={primaryButtonLink}
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-full bg-[#FF6B16] hover:bg-[#e05809] text-white font-bold text-xs sm:text-sm shadow-lg shadow-[#FF6B16]/30 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 group"
              >
                <span>{primaryButtonText}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              {/* Talk on WhatsApp Button */}
              <div className="relative inline-block">
                <a
                  href={activeWhatsAppLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white font-bold text-xs sm:text-sm border border-white/40 hover:border-white/70 shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                >
                  <WhatsAppIcon className="w-4 h-4 shrink-0" />
                  <span>{whatsappButtonText}</span>
                </a>

                {/* Orange Radiating Burst lines matching screenshot */}
                <div className="absolute -top-3 -right-2.5 pointer-events-none">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M3 11 L1 12.5" stroke="#FF6B16" strokeWidth="2" strokeLinecap="round" />
                    <path d="M5.5 6.5 L4.5 2.5" stroke="#FF6B16" strokeWidth="2" strokeLinecap="round" />
                    <path d="M11 6 L15 3" stroke="#FF6B16" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Right Spacer on desktop to center the content */}
          <div className="hidden lg:block shrink-0 w-28 sm:w-36 md:w-40 pointer-events-none" />
        </div>
      </Container>
    </section>
  );
}

export default FinalCTA;
