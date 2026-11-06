import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  ChevronDown,
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

/**
 * Generate smart, trek-specific default FAQs if no custom FAQs are saved on the package.
 */
export function getDefaultPackageFAQs(pkg = {}) {
  const isGeneric = !pkg?.name && !pkg?.title;
  const name = pkg?.name || pkg?.title || 'Weekend Escapes Himalayan Treks';
  const location = pkg?.location || 'Uttarakhand, Himachal & Kashmir';
  const duration = pkg?.duration || 'Flexible Weekend & Weeklong Itineraries';
  const difficulty = pkg?.difficulty || 'Easy to Moderate';
  const season = pkg?.season || 'All Year Round';

  if (isGeneric) {
    return [
      {
        id: 'faq-g1',
        category: 'Preparation & Fitness',
        question: 'How do I choose the right trek or tour package for my fitness level?',
        answer: 'Each of our tour packages is tagged with clear difficulty levels—ranging from **Easy** (suitable for beginners and families) to **Moderate** and **Challenging** (requiring good stamina and prior trekking experience). If you are a beginner, we recommend starting with iconic treks like Tungnath-Chandrashila, Kedarkantha, or Triund. Our trek marshals are also happy to evaluate your fitness and recommend the perfect expedition.',
      },
      {
        id: 'faq-g2',
        category: 'Booking & Cancellation',
        question: 'How does the booking process work and can I reserve dates with a deposit?',
        answer: 'You can book directly on our website or connect with our expedition marshals on WhatsApp. We allow you to confirm your slot with an advance deposit. We offer flexible cancellation policies: Free cancellation or full credit voucher up to 15 days prior to departure, with partial vouchers between 7–14 days.',
      },
      {
        id: 'faq-g3',
        category: 'Stays & Meals',
        question: 'What type of accommodation and food are provided during the trips?',
        answer: 'We provide sanitized alpine dome tents, mountain guesthouses, or boutique eco-stays depending on the itinerary. All meals provided on the trek are freshly cooked, hygienic, and nutritious vegetarian menus designed to replenish energy at high altitudes.',
      },
      {
        id: 'faq-g4',
        category: 'Safety & Permits',
        question: 'Are government permits, environmental taxes, and entry passes included?',
        answer: 'Yes! All required forest permits, local sanctuary entry fees, camping permissions, and environmental passes are handled by Weekend Escapes and included in your package cost.',
      },
      {
        id: 'faq-g5',
        category: 'Safety & Permits',
        question: 'What medical support and emergency protocols are in place?',
        answer: 'Every expedition is led by certified Trek Leaders (BMC/AMC certified) equipped with comprehensive first-aid kits, pulse oximeters, blood pressure monitors, and emergency oxygen cylinders with pre-arranged evacuation protocols.',
      },
      {
        id: 'faq-g6',
        category: 'Booking & Cancellation',
        question: 'Can I book a private trek or customize dates for our college/corporate group?',
        answer: 'Absolutely! We offer customized private batches for corporate teams, colleges, families, and couples with tailor-made pick-up points, custom menus, and dedicated trek captains. Simply click the WhatsApp button to request a custom quote.',
      },
    ];
  }

  return [
    {
      id: 'faq-1',
      category: 'Preparation & Fitness',
      question: `How physically demanding is the ${name} trek and who can do it?`,
      answer: `The ${name} expedition is rated as **${difficulty}**. It is well-suited for beginners with reasonable fitness, families, and seasoned trekkers alike. You will be trekking an average of 4 to 6 hours daily along well-marked alpine paths. We recommend starting light cardio (brisk walking, jogging, or cycling) 2 to 3 weeks prior to your departure date to maximize comfort on the trail.`,
    },
    {
      id: 'faq-2',
      category: 'Preparation & Fitness',
      question: `What is the best season and weather to experience ${name}?`,
      answer: `The recommended season for ${name} is **${season}**. Summer and spring months (April to June) offer lush green meadows, blooming rhododendrons, and pleasant daytime temperatures (12°C to 18°C). Autumn (September to November) brings crystal clear skies and panoramic views of snow-capped peaks. Winter batches experience crisp snowscapes with nighttime temperatures dropping below freezing, for which proper 3-layer winter gear is required.`,
    },
    {
      id: 'faq-3',
      category: 'Stays & Meals',
      question: `What kind of accommodation and meals are provided during the trip?`,
      answer: `Depending on the itinerary (${duration}), accommodation consists of clean, cozy guesthouses / homestays at base camps and high-quality 4-season alpine dome tents on higher campsites. Stays are on twin, triple, or quad sharing as per your selected booking tier. We provide freshly prepared, nutritious, and hygienic vegetarian meals (energizing breakfast, packed or hot lunch, evening tea & snacks, and wholesome dinner) curated specifically for high-altitude energy.`,
    },
    {
      id: 'faq-4',
      category: 'Safety & Permits',
      question: `Are forest permits, environmental passes, and entry fees included?`,
      answer: `Yes, absolutely! All required forest department permits, state entry fees, camping charges, and environmental trail passes for ${name} (${location}) are arranged and included in your package cost. You will only need to carry a valid government-issued photo ID (Aadhaar Card, Passport, or Voter ID) for verification at checkpoints.`,
    },
    {
      id: 'faq-5',
      category: 'Safety & Permits',
      question: `What safety protocols and medical support are maintained on the trail?`,
      answer: `Safety is our top priority. Every batch is accompanied by certified Trek Marshals (Basic & Advanced Mountaineering Certified) trained in Wilderness First Aid. Leaders carry dedicated first-aid kits, pulse oximeters, blood pressure monitors, and emergency oxygen cylinders. Daily health check-ups and acclimatization briefings are conducted at camp before each push.`,
    },
    {
      id: 'faq-6',
      category: 'Preparation & Fitness',
      question: `Is mobile network and electricity available during the trek?`,
      answer: `Mobile connectivity (primarily Jio and Airtel) is reliable at basecamp villages and major transit hubs in ${location}. As you hike higher up the trail, signals become intermittent or unavailable. We strongly advise completing urgent calls before departing the basecamp and carrying a fully charged 10,000 to 20,000 mAh power bank, as charging points are unavailable at alpine tent campsites.`,
    },
    {
      id: 'faq-7',
      category: 'Preparation & Fitness',
      question: `Can I offload my backpack during the trek?`,
      answer: `Yes. While we encourage trekkers to carry their own gear for the authentic trekking experience, backpack offloading onto mules or porters is available if requested in advance. You can trek comfortably with just a light 10–20L daypack containing your water bottle, rain poncho, warm layer, and personal medications. Offloading charges can be settled directly at basecamp.`,
    },
    {
      id: 'faq-8',
      category: 'Booking & Cancellation',
      question: `What is the booking process and cancellation policy?`,
      answer: `You can secure your spot instantly online with an advance deposit or full payment. We offer flexible cancellation policies: Full refund or 100% credit voucher on cancellations made 15+ days prior to departure; 50% credit voucher between 7–14 days. If the trek is interrupted due to extreme unforeseen weather or government advisories, our team provides alternative dates or credit vouchers valid for 12 months.`,
    },
  ];
}

export default function PackageFAQ({ packageData }) {
  const { packageFaqSection } = useSettings();
  const packageName = packageData?.name || packageData?.title || 'this tour';

  const badgeText = packageFaqSection?.badge || "Got Questions? We've Got Answers";
  const titleText = packageFaqSection?.title || 'Frequently Asked Questions';
  const subtitleText =
    packageFaqSection?.subtitle ||
    `Everything you need to know about preparation, safety, stays, permits, and booking for ${packageName}.`;

  // Merge custom package FAQs, or global default FAQs, or code fallback defaults
  const allFaqs = useMemo(() => {
    if (Array.isArray(packageData?.faqs) && packageData.faqs.length > 0) {
      return packageData.faqs.map((f, idx) => ({
        id: f._id || f.id || `custom-faq-${idx}`,
        category: f.category || 'General',
        question: f.question,
        answer: f.answer,
      }));
    }
    if (
      Array.isArray(packageFaqSection?.defaultFaqs) &&
      packageFaqSection.defaultFaqs.length > 0
    ) {
      return packageFaqSection.defaultFaqs.map((f, idx) => ({
        id: f._id || f.id || `global-faq-${idx}`,
        category: f.category || 'General',
        question: f.question,
        answer: f.answer,
      }));
    }
    return getDefaultPackageFAQs(packageData);
  }, [packageData, packageFaqSection]);

  // Expand / collapse states: default first question open
  const [openIds, setOpenIds] = useState(() => {
    return allFaqs.length > 0 ? [allFaqs[0].id] : [];
  });

  const toggleFAQ = (id) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const renderTitle = () => {
    const words = titleText.trim().split(' ');
    if (words.length <= 1) {
      return <span className="text-[#FF6B16]">{titleText}</span>;
    }
    const lastWord = words.pop();
    return (
      <>
        {words.join(' ')} <span className="text-[#FF6B16]">{lastWord}</span>
      </>
    );
  };

  return (
    <section
      id="package-faqs-section"
      className="w-full py-16 sm:py-20 bg-white border-t border-neutral-200/80"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header Badge & Title */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-100/70 border border-orange-200/80 text-[#FF6B16] text-[11px] font-black uppercase tracking-wider mb-3 shadow-2xs">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{badgeText}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#111111] tracking-tight">
            {renderTitle()}
          </h2>

          <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-2 max-w-lg mx-auto">
            {subtitleText}
          </p>
        </div>

        {/* FAQs Accordion List */}
        <div className="mt-10 space-y-3">
          {allFaqs.map((faq) => {
              const isOpen = openIds.includes(faq.id);
              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'bg-white border-[#FF6B16]/40 shadow-xs'
                      : 'bg-[#F7F7F5] hover:bg-neutral-50/80 border-neutral-200/80 shadow-2xs'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFAQ(faq.id)}
                    aria-expanded={isOpen}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4 cursor-pointer select-none transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isOpen
                            ? 'bg-[#FF6B16] text-white'
                            : 'bg-orange-50 text-[#FF6B16] border border-orange-100'
                        }`}
                      >
                        <HelpCircle className="w-4 h-4" />
                      </div>
                      <span className="text-sm sm:text-base font-bold text-[#111111] leading-snug">
                        {faq.question}
                      </span>
                    </div>

                    <div className="shrink-0">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-200 ${
                          isOpen
                            ? 'rotate-180 bg-orange-100 text-[#FF6B16]'
                            : 'bg-white text-neutral-400 border border-neutral-200'
                        }`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-1 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-neutral-100 bg-white">
                      <div className="prose prose-sm max-w-none text-neutral-600 font-medium pl-10 sm:pl-10">
                        {faq.answer.split('\n\n').map((para, pIdx) => {
                          // Format bold text **text** nicely
                          const formatted = para.split(/(\*\*.*?\*\*)/g).map((chunk, cIdx) => {
                            if (chunk.startsWith('**') && chunk.endsWith('**')) {
                              return (
                                <strong key={cIdx} className="font-extrabold text-neutral-900">
                                  {chunk.slice(2, -2)}
                                </strong>
                              );
                            }
                            return chunk;
                          });
                          return (
                            <p key={pIdx} className="mb-2 last:mb-0">
                              {formatted}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </section>
  );
}
