import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { Loader2, ArrowLeft, ShieldCheck, Clock, RefreshCw, AlertCircle, FileText } from 'lucide-react';

const DEFAULT_CANCELLATION_POLICY = {
  title: 'Cancellation & Refund Policy',
  subtitle:
    'Clear, transparent refund schedules, credit shells, and weather force majeure guidelines for Weekend Escapes expeditions.',
  badge: 'Returns & Cancellations',
  headerBgColor: '#F8F8F2',
  headerTextColor: '#1F2432',
  showLastUpdated: true,
  lastUpdated: 'March 22, 2026',
  sections: [
    {
      id: 'sec_cancel_overview',
      title: '1. Overview & Commitment',
      content:
        'At Weekend Escapes, we plan high-altitude Himalayan treks, weekend departures, and adventure tours with extensive logistical preparation. Campsites, mountain permits, certified trek leaders, safety gear, and vehicles are reserved well in advance. Our cancellation policy is designed to balance participant flexibility with committed operational expenses.',
      items: [],
    },
    {
      id: 'sec_cancel_slabs',
      title: '2. Cancellation Timeline & Refund Slabs',
      content:
        'Refund eligibility is calculated based on the timestamp when the cancellation request is received relative to the scheduled departure date:',
      items: [
        '30 or more days prior to departure: 90% refund of the total package amount, OR 100% Credit Shell Voucher valid for 12 months.',
        '15 to 29 days prior to departure: 50% refund of the total package amount, OR 75% Credit Shell Voucher valid for 12 months.',
        '7 to 14 days prior to departure: 25% refund of the total package amount, OR 50% Credit Shell Voucher valid for 6 months.',
        'Less than 7 days prior to departure or No-Show: Non-refundable (0% refund) as permits, basecamp logistics, and rations are non-recoverable.',
      ],
    },
    {
      id: 'sec_credit_shell',
      title: '3. Credit Shell Voucher Guidelines',
      content:
        'To give travelers maximum flexibility, Weekend Escapes offers a Credit Shell voucher option as an alternative to cash refunds:',
      items: [
        'Credit Shell vouchers can be redeemed for any upcoming trek, tour, or weekend escape within the specified validity period.',
        'Vouchers are fully transferable to friends or immediate family members upon written email authorization.',
        'If the rescheduled trip fee is higher than the voucher value, the difference can be settled easily during checkout.',
      ],
    },
    {
      id: 'sec_refund_processing',
      title: '4. Refund Processing Time & Payment Modes',
      content:
        'All approved cash refunds are processed back to the original payment source (PhonePe, UPI, Net Banking, or Credit/Debit Card) used during the initial booking checkout.',
      items: [
        'Refund processing typically takes 5 to 7 business days from the date of approval depending on banking networks.',
        'Gateway convenience charges and promotional discount coupons applied during checkout are non-refundable.',
      ],
    },
    {
      id: 'sec_force_majeure',
      title: '5. Weather, Landslides & Force Majeure',
      content:
        'Mountain conditions can be unpredictable. In the event an expedition is disrupted due to landslides, heavy snowfall, flash floods, road closures, or government restrictions before departure:',
      items: [
        'Weekend Escapes will offer an alternate safe itinerary or provide a 100% Credit Shell Voucher valid for 12 months.',
        'If a trek is cut short mid-way due to adverse weather or safety hazards, leaders prioritize rescue and safety; unused services in the mountains cannot be refunded.',
      ],
    },
    {
      id: 'sec_medical_dropout',
      title: '6. Participant Medical Dropout on Trail',
      content:
        'If a participant develops Acute Mountain Sickness (AMS), physical fatigue, or injury during the trek and has to descend early:',
      items: [
        'Our marshals will facilitate medical evacuation to the nearest roadhead or medical center.',
        'No cash refund or credit voucher is issued for early voluntary or medical descents once the expedition has flagged off.',
      ],
    },
    {
      id: 'sec_reschedule',
      title: '7. Rescheduling & Batch Changes',
      content:
        'Need to change your departure date? We accommodate batch change requests subject to slot availability in the target departure:',
      items: [
        'Requests made 15+ days prior to departure are rescheduled free of charge for the first occurrence.',
        'Requests made 7 to 14 days prior to departure incur a nominal rescheduling fee of ₹500 per person to cover forest permit re-issuance.',
      ],
    },
    {
      id: 'sec_support',
      title: '8. How to Submit a Cancellation Request',
      content:
        'To submit a cancellation or reschedule request, please reach out with your Booking Reference ID (e.g. WE-2026-XXXXX) via our official support channels:',
      items: [
        'Email our cancellation desk at cancellations@weekendescapes.com or support@weekendescapes.com.',
        'Send a message to our Basecamp Support desk on official WhatsApp for immediate assistance.',
      ],
    },
  ],
};

export function CancellationPolicyPage() {
  const { API_BASE_URL, contactInfo, whatsappUrl } = useSettings();

  const [pageData, setPageData] = useState(DEFAULT_CANCELLATION_POLICY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchPageData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/pages/cancellation-policy`);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const data = await res.json();
        if (isMounted && data.success && data.page) {
          setPageData({
            title: data.page.title || DEFAULT_CANCELLATION_POLICY.title,
            subtitle:
              data.page.subtitle !== undefined
                ? data.page.subtitle
                : DEFAULT_CANCELLATION_POLICY.subtitle,
            badge:
              data.page.badge !== undefined
                ? data.page.badge
                : DEFAULT_CANCELLATION_POLICY.badge,
            headerBgColor:
              data.page.headerBgColor || DEFAULT_CANCELLATION_POLICY.headerBgColor,
            headerTextColor:
              data.page.headerTextColor || DEFAULT_CANCELLATION_POLICY.headerTextColor,
            showLastUpdated:
              data.page.showLastUpdated !== undefined
                ? data.page.showLastUpdated
                : true,
            lastUpdated:
              data.page.lastUpdated || DEFAULT_CANCELLATION_POLICY.lastUpdated,
            sections:
              Array.isArray(data.page.sections) && data.page.sections.length > 0
                ? data.page.sections
                : DEFAULT_CANCELLATION_POLICY.sections,
          });
        }
      } catch (err) {
        console.warn(
          '[CancellationPolicyPage] Using cached template:',
          err.message
        );
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
      {/* ── Top Header Section (Fully Dynamic Banner based on Theme) ── */}
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
        {/* Last Updated Date */}
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
              <p className="whitespace-pre-line text-neutral-600 leading-relaxed">
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

        {/* Dynamic Contact Box (Connected to Live WhatsApp & Email) */}
        <section className="space-y-3 pt-6 border-t border-neutral-100">
          <h2 className="text-lg sm:text-xl font-serif font-bold text-[#1F2432]">
            Cancellation Desk &amp; Inquiries
          </h2>
          <p>
            To submit a cancellation, claim a credit shell voucher, or ask questions:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-[13px]">
            <li>
              Email:{' '}
              <a
                href={`mailto:${contactInfo?.emailSupport || contactInfo?.emailPrimary || 'cancellations@weekendescapes.com'}`}
                className="text-[#FF6B16] font-semibold underline"
              >
                {contactInfo?.emailSupport || contactInfo?.emailPrimary || 'cancellations@weekendescapes.com'}
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
                WhatsApp Helpdesk:{' '}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 font-semibold underline"
                >
                  Chat with Cancellations Marshal &rarr;
                </a>
              </li>
            )}
          </ul>
        </section>

        {/* Reciprocal Links */}
        <div className="pt-8 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#FF6B16] hover:underline"
          >
            <span>&larr; Back to Home</span>
          </Link>

          <Link
            to="/terms"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-[#FF6B16] transition"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Read Terms &amp; Conditions &rarr;</span>
          </Link>
        </div>
      </main>
    </div>
  );
}

export default CancellationPolicyPage;
