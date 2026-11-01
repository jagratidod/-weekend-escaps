import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

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
    siteName: 'Weekend Escapes',
    tagline: 'Crafting Adventures',
    whatsappNumber: '+91 98765 43210',
    whatsappMessage: 'Hi Weekend Escapes! I would like to plan my next adventure.',
    contactInfo: DEFAULT_CONTACT_INFO,
  });
  const [loading, setLoading] = useState(true);

  // Helper to format full logo URL
  const formatLogoUrl = (rawUrl) => {
    if (!rawUrl) return '/logo/weekend-escapes-logo.svg';
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      return rawUrl;
    }
    if (rawUrl.startsWith('/uploads/')) {
      return `${BACKEND_ROOT}${rawUrl}`;
    }
    return rawUrl;
  };

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/settings`);
      const data = await res.json();
      if (data.success && data.settings) {
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
        });
      }
    } catch (err) {
      console.warn('Could not fetch settings from backend, using defaults:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const activeLogoUrl = formatLogoUrl(settings.logoUrl);
  const activeFooterLogoUrl = formatLogoUrl(settings.footerLogoUrl || settings.logoUrl);
  const activeContactInfo = settings.contactInfo || DEFAULT_CONTACT_INFO;
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

  return (
    <SettingsContext.Provider
      value={{
        settings,
        logoUrl: activeLogoUrl,
        rawLogoUrl: settings.logoUrl,
        footerLogoUrl: activeFooterLogoUrl,
        rawFooterLogoUrl: settings.footerLogoUrl || settings.logoUrl,
        siteName: settings.siteName,
        contactInfo: activeContactInfo,
        whatsappNumber: activeWhatsappNumber,
        whatsappMessage: activeWhatsappMessage,
        whatsappUrl,
        getCustomWhatsAppUrl,
        cleanWhatsAppNumber,
        buildWhatsAppUrl,
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
