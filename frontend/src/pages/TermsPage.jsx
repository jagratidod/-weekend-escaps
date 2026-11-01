import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { Loader2 } from 'lucide-react';

const DEFAULT_TERMS = {
  title: 'Terms & Conditions',
  subtitle: 'Please review our expedition guidelines, booking rules, and adventure travel policies.',
  badge: 'Legal & Policies',
  headerBgColor: '#F8F8F2',
  headerTextColor: '#1F2432',
  showLastUpdated: true,
  lastUpdated: 'March 22, 2026',
  sections: [
    {
      id: 'sec_intro',
      title: 'Introduction',
      content:
        'Welcome to Weekend Escapes. These Terms & Conditions govern your use of our website, tour packages, high-altitude treks, and adventure travel services. By accessing or using Weekend Escapes, you agree to comply with and be bound by these terms. If you do not agree, please do not use our platform or confirm any booking.',
      items: [],
    },
    {
      id: 'sec_defs',
      title: 'Definitions',
      content: '',
      items: [
        '"Weekend Escapes" refers to our adventure travel operating platform, certified guides, trek leaders, company marshals, and travel planning services.',
        '"User" or "Traveler" refers to anyone accessing our website, inquiring about itineraries, or booking trips with us.',
        '"Booking" refers to confirmed travel reservations for treks, trips, camps, transport, or custom tour itineraries made through our platform.',
        '"Content" refers to itineraries, guides, videos, images, descriptions, and written material provided by Weekend Escapes or its marshals.',
      ],
    },
    {
      id: 'sec_eligibility',
      title: 'User Eligibility & Accounts',
      content: '',
      items: [
        'You must be at least 18 years old to book an expedition independently. Travelers under 18 must be accompanied by an adult or have formal written consent from a legal guardian.',
        'You are responsible for maintaining the accuracy of the traveler information and contact details you provide during the booking flow.',
        'Providing false identification, incorrect age details, or using another person\'s credentials without authorization is strictly prohibited.',
      ],
    },
    {
      id: 'sec_booking',
      title: 'Trip Booking & Seat Confirmation',
      content: '',
      items: [
        'Upon booking an expedition and paying the required advance deposit or full package amount, you will receive an official booking confirmation voucher.',
        'Departure slots are allocated on a first-come, first-served basis and remain subject to weather permits, basecamp clearance, and minimum batch requirements.',
        'Bookings are non-transferable to other individuals without prior written authorization from Weekend Escapes expedition desk.',
      ],
    },
    {
      id: 'sec_pricing',
      title: 'Payments, Refunds & Pricing',
      content: '',
      items: [
        'All payments are processed securely through certified payment gateways (PhonePe, UPI, cards, and net banking).',
        'A booking advance of ₹2,000 per person is required to reserve seats. The remaining balance must be cleared prior to trip departure as advised in your confirmation voucher.',
        'Prices are listed in Indian Rupees (INR) and include designated package inclusions such as accommodation, meals, trek gear, permits, and leadership.',
        'Promotional coupon codes (such as EARLYBIRD or WEEKEND10) must be applied during checkout and cannot be redeemed retroactively.',
      ],
    },
    {
      id: 'sec_cancellation',
      title: 'Cancellation & Rescheduling Policy',
      content: '',
      items: [
        '30+ days prior to departure: 90% refund of the total package fee, or 100% credit shell valid for 12 months.',
        '15 to 29 days prior to departure: 50% refund, or 75% credit shell valid for future departures.',
        'Within 14 days of departure: Non-refundable due to advance logistics, campsite rentals, and guide reservations already committed.',
        'Force Majeure: In the event of extreme weather, landslides, snowfall closures, or government restrictions, Weekend Escapes reserves the right to alter itineraries or provide a full credit voucher for future travel.',
      ],
    },
    {
      id: 'sec_conduct',
      title: 'User Conduct & Restrictions',
      content: '',
      items: [
        'Travelers must strictly comply with all safety instructions, trail regulations, and advisories given by certified Trek Leaders and Mountain Marshals.',
        'Any form of harassment, discrimination, or abusive conduct toward fellow travelers, guides, or local Himalayan villagers is strictly prohibited and results in immediate termination without refund.',
        'Possession or consumption of illegal substances or reckless alcohol abuse on mountain trails is forbidden under Indian law and company policy.',
        'Travelers must practice strict Leave No Trace (LNT) principles. Littering plastic or disturbing wildlife will lead to immediate fines and expedition disqualification.',
      ],
    },
    {
      id: 'sec_health',
      title: 'Health, Medical & Risk Assumption',
      content: '',
      items: [
        'Outdoor adventure activities and high-altitude trekking carry inherent hazards, including altitude sickness (AMS), extreme temperature drops, rugged terrain, and remote locations.',
        'By booking, you affirm that you are in good cardiovascular and physical health. You agree to disclose any chronic medical conditions or prescription dependencies beforehand.',
        'Emergency evacuation expenses (helicopter, vehicle rescue, or hospitalization) resulting from undisclosed conditions are the sole financial responsibility of the traveler.',
      ],
    },
    {
      id: 'sec_ip',
      title: 'Intellectual Property Rights',
      content: '',
      items: [
        'All content on Weekend Escapes, including trek designs, logos, route descriptions, images, and branding assets, is the exclusive property of Weekend Escapes.',
        'Users must not copy, reproduce, scrape, resell, or distribute our itineraries, graphics, or site materials without prior written consent.',
      ],
    },
    {
      id: 'sec_contact',
      title: 'Contact Information & Support',
      content:
        'For queries, cancellations, or clarifications regarding these Terms & Conditions, please contact our support desk via our official WhatsApp or email support@weekendescapes.com.',
      items: [],
    },
  ],
};

export function TermsPage() {
  const { API_BASE_URL, contactInfo, whatsappUrl } = useSettings();

  const [pageData, setPageData] = useState(DEFAULT_TERMS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchPageData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/pages/terms-and-conditions`);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const data = await res.json();
        if (isMounted && data.success && data.page) {
          setPageData({
            title: data.page.title || DEFAULT_TERMS.title,
            subtitle: data.page.subtitle !== undefined ? data.page.subtitle : DEFAULT_TERMS.subtitle,
            badge: data.page.badge !== undefined ? data.page.badge : DEFAULT_TERMS.badge,
            headerBgColor: data.page.headerBgColor || DEFAULT_TERMS.headerBgColor,
            headerTextColor: data.page.headerTextColor || DEFAULT_TERMS.headerTextColor,
            showLastUpdated: data.page.showLastUpdated !== undefined ? data.page.showLastUpdated : true,
            lastUpdated: data.page.lastUpdated || DEFAULT_TERMS.lastUpdated,
            sections: Array.isArray(data.page.sections) && data.page.sections.length > 0
              ? data.page.sections
              : DEFAULT_TERMS.sections,
          });
        }
      } catch (err) {
        // Fallback to default in-memory terms if API call fails
        console.warn('[TermsPage] Using cached terms template:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPageData();

    return () => {
      isMounted = false;
    };
  }, [API_BASE_URL]);

  return (
    <div className="min-h-screen bg-white text-[#1F2432]">
      {/* ── Top Header Section (Fully Dynamic Banner) ── */}
      <section
        style={{
          backgroundColor: pageData.headerBgColor || '#F8F8F2',
          color: pageData.headerTextColor || '#1F2432',
        }}
        className="pt-32 pb-14 sm:pt-36 sm:pb-18 md:pt-40 md:pb-20 border-b border-neutral-200/50 text-center select-none transition-colors"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-3">
          {pageData.badge && (
            <span className="inline-block px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-black/5 opacity-80">
              {pageData.badge}
            </span>
          )}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif tracking-tight font-normal">
            {pageData.title}
          </h1>
          {pageData.subtitle && (
            <p className="max-w-2xl mx-auto text-xs sm:text-sm opacity-80 leading-relaxed font-sans">
              {pageData.subtitle}
            </p>
          )}
        </div>
      </section>

      {/* ── Document Body Content ── */}
      <main className="max-w-3xl mx-auto px-5 sm:px-8 py-12 sm:py-16 md:py-20 space-y-8 sm:space-y-10 leading-relaxed text-[13px] sm:text-sm text-neutral-600">
        {/* Last Updated Date (Controlled by showLastUpdated toggle) */}
        {pageData.showLastUpdated !== false && (
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-[13px] font-bold text-neutral-800">
              Last Updated: {pageData.lastUpdated}
            </p>
            {loading && (
              <span className="flex items-center gap-1.5 text-xs text-neutral-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF6B16]" />
                <span>Syncing...</span>
              </span>
            )}
          </div>
        )}

        {/* Dynamic Section-Wise Content */}
        {pageData.sections.map((section, idx) => (
          <section key={section.id || idx} className="space-y-3">
            <h2 className="text-lg sm:text-xl font-serif font-bold text-[#1F2432]">
              {section.title}
            </h2>

            {/* Optional Introductory or Body paragraph */}
            {section.content && (
              <p className="whitespace-pre-line text-neutral-600">
                {section.content}
              </p>
            )}

            {/* Optional Bullet Points */}
            {Array.isArray(section.items) && section.items.length > 0 && (
              <ul className="list-disc pl-5 space-y-2 text-neutral-600">
                {section.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {/* Dynamic Contact Box (Directly linked to Live WhatsApp and Email Settings) */}
        <section className="space-y-3 pt-6 border-t border-neutral-100">
          <h2 className="text-lg sm:text-xl font-serif font-bold text-[#1F2432]">
            Contact &amp; Official Inquiries
          </h2>
          <p>
            For any queries, cancellations, or clarifications regarding these terms, reach out to our team:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-[13px]">
            <li>
              Email:{' '}
              <a
                href={`mailto:${contactInfo?.emailPrimary || 'hello@weekendescapes.com'}`}
                className="text-[#FF6B16] font-semibold underline"
              >
                {contactInfo?.emailPrimary || 'hello@weekendescapes.com'}
              </a>
            </li>
            <li>
              Phone:{' '}
              <a
                href={`tel:${contactInfo?.phone || '+91 98765 43210'}`}
                className="text-[#FF6B16] font-semibold"
              >
                {contactInfo?.phone || '+91 98765 43210'}
              </a>
            </li>
            {whatsappUrl && (
              <li>
                WhatsApp Support:{' '}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 font-semibold underline"
                >
                  Chat with Expedition Desk &rarr;
                </a>
              </li>
            )}
          </ul>
        </section>

        {/* Back to Home Link */}
        <div className="pt-8 border-t border-neutral-100">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#FF6B16] hover:underline"
          >
            <span>&larr; Back to Weekend Escapes Home</span>
          </Link>
        </div>
      </main>
    </div>
  );
}

export default TermsPage;
