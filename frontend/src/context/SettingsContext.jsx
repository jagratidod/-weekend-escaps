import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DEFAULT_HOME_SECTIONS } from '../utils/defaultHomeSections';

const SettingsContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const BACKEND_ROOT = API_BASE_URL.replace(/\/api$/, '');

export const cleanWhatsAppNumber = (rawPhone) => {
  if (!rawPhone) return '919876543210';
  const digits = String(rawPhone).replace(/\D/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits || '919876543210';
};

export const buildWhatsAppUrl = (phone, text) => {
  const cleanNum = cleanWhatsAppNumber(phone);
  const defaultMsg = 'Hi Weekend Escapes! I would like to plan my next adventure.';
  const message = text !== undefined ? text : defaultMsg;
  if (!message) {
    return `https://wa.me/${cleanNum}`;
  }
  return `https://wa.me/${cleanNum}?text=${encodeURIComponent(message)}`;
};

export const DEFAULT_FAQ_SECTION = {
  badge: "Got Questions? We've Got Answers",
  title: 'Frequently Asked Questions',
  subtitle:
    'Everything you need to know about preparation, safety, stays, permits, and booking for our expeditions.',
  defaultFaqs: [],
};

export const DEFAULT_CONTACT_INFO = {
  heroTitle: 'Contact us',
  heroSubtitle:
    'Weekend Escapes is ready to provide the right solution and adventure according to your needs',
  address: 'Himalayan Ridge View, Sector 4, Manali / Dehradun, India',
  emailPrimary: 'hello@weekendescapes.com',
  emailSupport: 'support@weekendescapes.com',
  phone: '+91 98765 43210',
  helpline: '+91 91234 56789 (9 AM - 8 PM)',
  whatsapp: '+91 98765 43210',
  mapUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108861.32598379051!2d77.10898544976735!3d32.2396324905322!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390487081634b2f7%3A0x7292a870d0617302!2sManali%2C%20Himachal%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
  socials: {
    facebook: 'https://facebook.com/weekendescapes',
    instagram: 'https://instagram.com/weekendescapes',
    twitter: 'https://twitter.com/weekendescapes',
    youtube: 'https://youtube.com/@weekendescapes',
  },
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    logoUrl: '/logo/weekend-escapes-logo.svg',
    footerLogoUrl: '/logo/weekend-escapes-logo.svg',
    darkLogoUrl: '/logo/weekend-escapes-logo.svg',
    siteName: 'Weekend Escapes',
    tagline: 'Crafting Adventures',
    whatsappNumber: '+91 98765 43210',
    whatsappMessage: 'Hi Weekend Escapes! I would like to plan my next adventure.',
    contactInfo: DEFAULT_CONTACT_INFO,
    homeSections: DEFAULT_HOME_SECTIONS,
    packageFaqSection: DEFAULT_FAQ_SECTION,
  });
  const [loading, setLoading] = useState(true);

  // Helper to format any image URL (Cloudinary, local /uploads/, or static asset)
  const formatImageUrl = useCallback((rawUrl) => {
    if (!rawUrl) return '';
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://') || rawUrl.startsWith('data:')) {
      return rawUrl;
    }
    if (rawUrl.startsWith('/uploads/')) {
      return `${BACKEND_ROOT}${rawUrl}`;
    }
    return rawUrl;
  }, []);

  // Helper to format full logo URL
  const formatLogoUrl = (rawUrl) => {
    if (!rawUrl) return '/logo/weekend-escapes-logo.svg';
    return formatImageUrl(rawUrl);
  };

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/settings`);
      const data = await res.json();
      if (data.success && data.settings) {
        const serverHome = data.settings.homeSections || {};
        setSettings({
          ...data.settings,
          contactInfo: {
            ...DEFAULT_CONTACT_INFO,
            ...(data.settings.contactInfo || {}),
            socials: {
              ...DEFAULT_CONTACT_INFO.socials,
              ...((data.settings.contactInfo && data.settings.contactInfo.socials) || {}),
            },
          },
          homeSections: {
            hero: { ...DEFAULT_HOME_SECTIONS.hero, ...(serverHome.hero || {}) },
            experiences: {
              ...DEFAULT_HOME_SECTIONS.experiences,
              ...(serverHome.experiences || {}),
              items:
                Array.isArray(serverHome.experiences?.items) && serverHome.experiences.items.length > 0
                  ? serverHome.experiences.items
                  : DEFAULT_HOME_SECTIONS.experiences.items,
            },
            whyChooseUs: {
              ...DEFAULT_HOME_SECTIONS.whyChooseUs,
              ...(serverHome.whyChooseUs || {}),
              benefits:
                Array.isArray(serverHome.whyChooseUs?.benefits) && serverHome.whyChooseUs.benefits.length > 0
                  ? serverHome.whyChooseUs.benefits
                  : DEFAULT_HOME_SECTIONS.whyChooseUs.benefits,
            },
            bookingProcess: {
              ...DEFAULT_HOME_SECTIONS.bookingProcess,
              ...(serverHome.bookingProcess || {}),
              steps:
                Array.isArray(serverHome.bookingProcess?.steps) && serverHome.bookingProcess.steps.length > 0
                  ? serverHome.bookingProcess.steps
                  : DEFAULT_HOME_SECTIONS.bookingProcess.steps,
              welfare: {
                ...DEFAULT_HOME_SECTIONS.bookingProcess.welfare,
                ...(serverHome.bookingProcess?.welfare || {}),
                items:
                  Array.isArray(serverHome.bookingProcess?.welfare?.items) &&
                  serverHome.bookingProcess.welfare.items.length > 0
                    ? serverHome.bookingProcess.welfare.items
                    : DEFAULT_HOME_SECTIONS.bookingProcess.welfare.items,
              },
            },
            finalCta: { ...DEFAULT_HOME_SECTIONS.finalCta, ...(serverHome.finalCta || {}) },
            sectionOrder: (() => {
              if (Array.isArray(serverHome.sectionOrder) && serverHome.sectionOrder.length > 0) {
                const merged = [...serverHome.sectionOrder];
                DEFAULT_HOME_SECTIONS.sectionOrder.forEach((sec) => {
                  if (!merged.includes(sec)) merged.push(sec);
                });
                return merged;
              }
              return DEFAULT_HOME_SECTIONS.sectionOrder;
            })(),
          },
          packageFaqSection: {
            ...DEFAULT_FAQ_SECTION,
            ...(data.settings.packageFaqSection || {}),
            defaultFaqs:
              Array.isArray(data.settings.packageFaqSection?.defaultFaqs)
                ? data.settings.packageFaqSection.defaultFaqs
                : [],
          },
        });
      }
    } catch (err) {
      console.warn('Could not fetch settings from backend, using defaults:', err.message);
    } finally {
      setLoading(false);
    }
  }, [formatImageUrl]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const activeLogoUrl = formatLogoUrl(settings.logoUrl);
  const activeFooterLogoUrl = formatLogoUrl(settings.footerLogoUrl || settings.logoUrl);
  const activeDarkLogoUrl = formatLogoUrl(settings.darkLogoUrl || settings.logoUrl);
  const activeContactInfo = settings.contactInfo || DEFAULT_CONTACT_INFO;
  const activeHomeSections = settings.homeSections || DEFAULT_HOME_SECTIONS;
  const activeWhatsappNumber =
    settings.whatsappNumber ||
    (settings.contactInfo && settings.contactInfo.whatsapp) ||
    DEFAULT_CONTACT_INFO.whatsapp;
  const activeWhatsappMessage =
    settings.whatsappMessage || 'Hi Weekend Escapes! I would like to plan my next adventure.';
  const whatsappUrl = buildWhatsAppUrl(activeWhatsappNumber, activeWhatsappMessage);

  const getCustomWhatsAppUrl = useCallback(
    (customMsg) => buildWhatsAppUrl(activeWhatsappNumber, customMsg),
    [activeWhatsappNumber]
  );

  const updateFaqSectionSettings = useCallback(
    async (token, payload) => {
      try {
        const res = await fetch(`${API_BASE_URL}/settings/faq-section`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          await fetchSettings();
        }
        return data;
      } catch (err) {
        console.error('Failed to update FAQ section:', err);
        return { success: false, message: err.message };
      }
    },
    [fetchSettings]
  );

  return (
    <SettingsContext.Provider
      value={{
        settings,
        homeSections: activeHomeSections,
        packageFaqSection: settings.packageFaqSection || DEFAULT_FAQ_SECTION,
        updateFaqSectionSettings,
        logoUrl: activeLogoUrl,
        rawLogoUrl: settings.logoUrl,
        footerLogoUrl: activeFooterLogoUrl,
        rawFooterLogoUrl: settings.footerLogoUrl || settings.logoUrl,
        darkLogoUrl: activeDarkLogoUrl,
        rawDarkLogoUrl: settings.darkLogoUrl || settings.logoUrl,
        siteName: settings.siteName,
        contactInfo: activeContactInfo,
        whatsappNumber: activeWhatsappNumber,
        whatsappMessage: activeWhatsappMessage,
        whatsappUrl,
        getCustomWhatsAppUrl,
        cleanWhatsAppNumber,
        buildWhatsAppUrl,
        formatImageUrl,
        loading,
        refreshSettings: fetchSettings,
        API_BASE_URL,
        BACKEND_ROOT,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
export default SettingsContext;
