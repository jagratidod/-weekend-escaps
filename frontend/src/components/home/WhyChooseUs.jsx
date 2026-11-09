import React from 'react';
import { Mountain } from 'lucide-react';
import Container from '../common/Container';
import {
  TORN_PAPER_VIEWBOX,
  TORN_PAPER_OUTER,
  TORN_PHOTO_INNER,
} from './tornPhotoPaths';
import { useSettings } from '../../context/SettingsContext';
import { getHomeIcon } from '../../utils/homeIconHelper';

function SunMark({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="7" fill="#FF6B16" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <rect
          key={deg}
          x="22.4"
          y="2"
          width="3.2"
          height="9"
          rx="1.6"
          fill="#FF6B16"
          transform={`rotate(${deg} 24 24)`}
        />
      ))}
    </svg>
  );
}

export function WhyChooseUs() {
  const { homeSections, formatImageUrl } = useSettings();
  const whyData = homeSections?.whyChooseUs || {};

  const badgeText = whyData.badge || 'WHY CHOOSE WEEKEND ESCAPES';
  const titleText = whyData.title || 'More Than Just A Trip';
  const subtitleText =
    whyData.subtitle ||
    'We create meaningful travel experiences with care, expertise and a passion for exploration.';
  const imgSrc = formatImageUrl(whyData.image || '/newimage/other sections image/image1.png');
  const [displayedImg, setDisplayedImg] = React.useState(imgSrc);

  React.useEffect(() => {
    if (!imgSrc || imgSrc === displayedImg) return;
    let isMounted = true;
    const img = new Image();
    img.src = imgSrc;
    img.onload = () => {
      if (isMounted) setDisplayedImg(imgSrc);
    };
    return () => {
      isMounted = false;
    };
  }, [imgSrc, displayedImg]);
  const handwrittenNote = whyData.handwrittenNote || 'Travel even\nRepeat';

  const defaultBenefits = [
    {
      icon: 'Mountain',
      title: 'Curated Experiences',
      desc: 'Handpicked destinations and verified stays',
    },
    {
      icon: 'Users',
      title: 'Expert Guidance',
      desc: 'Experienced travel leaders and local support',
    },
    {
      icon: 'Handshake',
      title: 'Safe & Secure Travel',
      desc: 'Your safety is our priority',
    },
    {
      icon: 'UsersRound',
      title: 'Best Price Guarantee',
      desc: 'Value-packed trips with no hidden costs',
    },
  ];

  const benefits =
    Array.isArray(whyData.benefits) && whyData.benefits.length > 0
      ? whyData.benefits
      : defaultBenefits;

  return (
    <section className="relative bg-[#111111] text-white pt-14 pb-14 md:pt-16 md:pb-16 overflow-x-clip z-20">
      {/* Top Brush Stroke Transition (matching Hero section's bottom brush border) */}
      <div className="absolute top-0 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none -translate-y-[98%] z-30">
        <img
          src="/images/decorations/hero-brush-up.svg"
          alt=""
          className="w-full h-8 sm:h-12 md:h-16 object-cover"
        />
      </div>

      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          <div className="lg:col-span-7">
            <div className="mb-7 md:mb-8">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FF6B16]"></span>
                <span className="text-[#FF6B16] font-bold text-xs md:text-sm tracking-widest uppercase">
                  {badgeText}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-[34px] font-black tracking-tight text-white leading-tight">
                {titleText}
              </h2>

              <p className="mt-2 text-sm md:text-base text-neutral-400 font-medium max-w-xl">
                {subtitleText}
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-4">
              {benefits.map((item, idx) => {
                const Icon = getHomeIcon(item.icon, Mountain);
                return (
                  <div key={item.title || idx} className="flex flex-col items-start gap-2.5 group">
                    <div className="w-12 h-12 rounded-full border-[1.5px] border-[#FF6B16] flex items-center justify-center text-[#FF6B16] group-hover:bg-[#FF6B16] group-hover:text-white transition-all duration-300">
                      <Icon className="w-5 h-5" strokeWidth={1.8} />
                    </div>
                    <h3 className="text-sm font-black text-white leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-[12px] text-neutral-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <svg
                viewBox={TORN_PAPER_VIEWBOX}
                className="w-full h-auto overflow-visible drop-shadow-[0_18px_32px_rgba(0,0,0,0.5)]"
                role="img"
                aria-label="Adventure traveler looking at mountain views"
              >
                <defs>
                  <clipPath id="whyChooseTornClip">
                    <path d={TORN_PHOTO_INNER} />
                  </clipPath>
                </defs>
                <path d={TORN_PAPER_OUTER} fill="#ffffff" />
                <image
                  href={displayedImg}
                  width="800"
                  height="500"
                  preserveAspectRatio="xMidYMid slice"
                  clipPath="url(#whyChooseTornClip)"
                  className="transition-opacity duration-500 ease-in-out"
                />
              </svg>

              <SunMark className="absolute top-[12%] right-[18%] w-8 h-8 sm:w-9 sm:h-9 drop-shadow-md pointer-events-none" />

              <p className="font-handwriting absolute bottom-[14%] right-[8%] text-xl sm:text-2xl md:text-[28px] text-white font-semibold leading-[0.95] drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)] rotate-[-12deg] pointer-events-none text-right whitespace-pre-line">
                {handwrittenNote}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default WhyChooseUs;
