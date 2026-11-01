import Page from '../models/Page.js';

export const getDefaultTermsPageData = () => ({
  slug: 'terms-and-conditions',
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
      order: 1,
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
      order: 2,
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
      order: 3,
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
      order: 4,
    },
    {
      id: 'sec_pricing',
      title: 'Payments, Refunds & Pricing',
      content: '',
      items: [
        'All payments are processed securely through certified payment gateways (PhonePe, UPI, cards, and net banking).',
        'A mandatory advance deposit per person is required to lock slots; the remaining balance must be cleared before or upon basecamp arrival as indicated on the booking voucher.',
        'All listed prices are in Indian Rupees (INR) and inclusive of applicable government taxes unless specified otherwise.',
      ],
      order: 5,
    },
    {
      id: 'sec_cancellation',
      title: 'Cancellations & Rescheduling Policy',
      content: '',
      items: [
        'Cancellations made 15 days or more prior to departure are eligible for a 70% refund or a 100% credit shell voucher valid for 12 months.',
        'Cancellations made between 7 to 14 days prior to departure are eligible for a 40% refund or credit voucher.',
        'Cancellations made less than 7 days prior to departure are non-refundable due to pre-booked camps, transportation, and forest permits.',
      ],
      order: 6,
    },
    {
      id: 'sec_conduct',
      title: 'Traveler Conduct, Safety & Mountain Discipline',
      content: '',
      items: [
        'Travelers must adhere strictly to environmental ethics: littering, dumping plastics, or causing harm to wildlife and local flora is strictly prohibited.',
        'Possession or consumption of narcotics, non-prescribed intoxicating substances, or misconduct toward locals or fellow travelers will result in immediate expedition termination without refund.',
        'Instructions given by trek marshals, certified mountaineers, and local safety leads must be followed at all times.',
      ],
      order: 7,
    },
    {
      id: 'sec_health',
      title: 'Health, Fitness & Medical Disclaimers',
      content: '',
      items: [
        'High-altitude expeditions involve inherent physical risks including Acute Mountain Sickness (AMS), hypothermia, and extreme weather shifts.',
        'Participants must disclose any pre-existing medical conditions (asthma, cardiac history, epilepsy, joint surgeries) during the traveler booking flow.',
        'Weekend Escapes reserves the right to halt or evacuate any traveler whose medical condition poses a danger to their safety or the group\'s wellbeing.',
      ],
      order: 8,
    },
    {
      id: 'sec_force_majeure',
      title: 'Force Majeure & Itinerary Modifications',
      content:
        'In the event of unforeseen natural events (landslides, flash floods, heavy snowfall, road blockages) or administrative closures, Weekend Escapes reserves the right to alter itineraries, change destinations, or adjust duration to ensure safety. Extra costs incurred due to road blockages or hotel stays beyond original schedule will be borne by travelers.',
      items: [],
      order: 9,
    },
    {
      id: 'sec_contact',
      title: 'Contact Information & Support',
      content:
        'For queries, cancellations, or clarifications regarding these Terms & Conditions, please contact our support desk via our official WhatsApp or email support@weekendescapes.com.',
      items: [],
      order: 10,
    },
  ],
  isActive: true,
});

export const getDefaultCancellationPageData = () => ({
  slug: 'cancellation-policy',
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
      order: 1,
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
      order: 2,
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
      order: 3,
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
      order: 4,
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
      order: 5,
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
      order: 6,
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
      order: 7,
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
      order: 8,
    },
  ],
  isActive: true,
});

// GET /api/pages/:slug
export const getPageBySlug = async (req, res) => {
  try {
    let { slug } = req.params;
    slug = slug.toLowerCase().trim();

    // Map alternative aliases
    if (slug === 'terms') {
      slug = 'terms-and-conditions';
    } else if (
      slug === 'cancellation' ||
      slug === 'refund' ||
      slug === 'cancellation-and-refund' ||
      slug === 'cancellation-and-refund-policy' ||
      slug === 'refund-policy'
    ) {
      slug = 'cancellation-policy';
    }

    let page = await Page.findOne({ slug });

    // Seed default if not found
    if (!page) {
      let defaultData = null;
      if (slug === 'terms-and-conditions') {
        defaultData = getDefaultTermsPageData();
      } else if (slug === 'cancellation-policy') {
        defaultData = getDefaultCancellationPageData();
      }

      if (defaultData) {
        try {
          page = await Page.create(defaultData);
        } catch (err) {
          return res.status(200).json({
            success: true,
            page: defaultData,
          });
        }
      }
    }

    if (!page) {
      return res.status(404).json({
        success: false,
        message: `Page not found for slug: ${slug}`,
      });
    }

    res.status(200).json({
      success: true,
      page,
    });
  } catch (error) {
    console.error('[getPageBySlug Error]:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve page content',
      error: error.message,
    });
  }
};

// PUT /api/pages/:slug (Protected Admin)
export const updatePage = async (req, res) => {
  try {
    let { slug } = req.params;
    slug = slug.toLowerCase().trim();
    if (slug === 'terms') {
      slug = 'terms-and-conditions';
    } else if (
      slug === 'cancellation' ||
      slug === 'refund' ||
      slug === 'cancellation-and-refund' ||
      slug === 'cancellation-and-refund-policy' ||
      slug === 'refund-policy'
    ) {
      slug = 'cancellation-policy';
    }

    const {
      title,
      subtitle,
      badge,
      headerBgColor,
      headerTextColor,
      showLastUpdated,
      lastUpdated,
      sections,
      isActive,
    } = req.body;

    let page = await Page.findOne({ slug });

    if (!page) {
      page = new Page({
        slug,
        title: title || (slug === 'cancellation-policy' ? 'Cancellation & Refund Policy' : 'Terms & Conditions'),
        subtitle: subtitle !== undefined ? subtitle : '',
        badge: badge !== undefined ? badge : '',
        headerBgColor: headerBgColor || '#F8F8F2',
        headerTextColor: headerTextColor || '#1F2432',
        showLastUpdated: showLastUpdated !== undefined ? showLastUpdated : true,
        lastUpdated:
          lastUpdated ||
          new Date().toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          }),
        sections: sections || [],
        isActive: isActive !== undefined ? isActive : true,
      });
    } else {
      if (title !== undefined) page.title = title;
      if (subtitle !== undefined) page.subtitle = subtitle;
      if (badge !== undefined) page.badge = badge;
      if (headerBgColor !== undefined) page.headerBgColor = headerBgColor;
      if (headerTextColor !== undefined) page.headerTextColor = headerTextColor;
      if (showLastUpdated !== undefined) page.showLastUpdated = showLastUpdated;
      if (lastUpdated !== undefined) page.lastUpdated = lastUpdated;
      if (sections !== undefined) page.sections = sections;
      if (isActive !== undefined) page.isActive = isActive;
    }

    await page.save();

    res.status(200).json({
      success: true,
      message: 'Page updated successfully',
      page,
    });
  } catch (error) {
    console.error('[updatePage Error]:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update page content',
      error: error.message,
    });
  }
};

// POST /api/pages/:slug/reset (Protected Admin)
export const resetPage = async (req, res) => {
  try {
    let { slug } = req.params;
    slug = slug.toLowerCase().trim();
    if (slug === 'terms') {
      slug = 'terms-and-conditions';
    } else if (
      slug === 'cancellation' ||
      slug === 'refund' ||
      slug === 'cancellation-and-refund' ||
      slug === 'cancellation-and-refund-policy' ||
      slug === 'refund-policy'
    ) {
      slug = 'cancellation-policy';
    }

    let defaultData = null;
    if (slug === 'terms-and-conditions') {
      defaultData = getDefaultTermsPageData();
    } else if (slug === 'cancellation-policy') {
      defaultData = getDefaultCancellationPageData();
    }

    if (!defaultData) {
      return res.status(400).json({
        success: false,
        message: `Reset is not supported for slug: ${slug}`,
      });
    }

    let page = await Page.findOneAndUpdate(
      { slug },
      {
        title: defaultData.title,
        subtitle: defaultData.subtitle,
        badge: defaultData.badge,
        headerBgColor: defaultData.headerBgColor,
        headerTextColor: defaultData.headerTextColor,
        showLastUpdated: defaultData.showLastUpdated,
        lastUpdated: defaultData.lastUpdated,
        sections: defaultData.sections,
        isActive: true,
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: `${defaultData.title} reset to default template`,
      page,
    });
  } catch (error) {
    console.error('[resetPage Error]:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to reset page content',
      error: error.message,
    });
  }
};
