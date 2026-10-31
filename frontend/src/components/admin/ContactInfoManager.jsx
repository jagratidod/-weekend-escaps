import React, { useState, useEffect } from 'react';
import {
  Save,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Loader2,
  MapPin,
  Mail,
  Phone,
  Share2,
  Globe,
} from 'lucide-react';
import { useSettings, DEFAULT_CONTACT_INFO } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';

export default function ContactInfoManager() {
  const { contactInfo, refreshSettings, API_BASE_URL } = useSettings();
  const { token } = useAuth();

  const [form, setForm] = useState({
    heroTitle: '',
    heroSubtitle: '',
    address: '',
    emailPrimary: '',
    emailSupport: '',
    phone: '',
    helpline: '',
    mapUrl: '',
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: '',
  });

  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Load from context
  useEffect(() => {
    if (contactInfo) {
      setForm({
        heroTitle: contactInfo.heroTitle || DEFAULT_CONTACT_INFO.heroTitle,
        heroSubtitle: contactInfo.heroSubtitle || DEFAULT_CONTACT_INFO.heroSubtitle,
        address: contactInfo.address || DEFAULT_CONTACT_INFO.address,
        emailPrimary: contactInfo.emailPrimary || DEFAULT_CONTACT_INFO.emailPrimary,
        emailSupport: contactInfo.emailSupport || DEFAULT_CONTACT_INFO.emailSupport,
        phone: contactInfo.phone || DEFAULT_CONTACT_INFO.phone,
        helpline: contactInfo.helpline || DEFAULT_CONTACT_INFO.helpline,
        mapUrl: contactInfo.mapUrl || DEFAULT_CONTACT_INFO.mapUrl,
        facebook: contactInfo.socials?.facebook || DEFAULT_CONTACT_INFO.socials.facebook,
        instagram: contactInfo.socials?.instagram || DEFAULT_CONTACT_INFO.socials.instagram,
        twitter: contactInfo.socials?.twitter || DEFAULT_CONTACT_INFO.socials.twitter,
        youtube: contactInfo.socials?.youtube || DEFAULT_CONTACT_INFO.socials.youtube,
      });
    }
  }, [contactInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const payload = {
        heroTitle: form.heroTitle,
        heroSubtitle: form.heroSubtitle,
        address: form.address,
        emailPrimary: form.emailPrimary,
        emailSupport: form.emailSupport,
        phone: form.phone,
        helpline: form.helpline,
        mapUrl: form.mapUrl,
        socials: {
          facebook: form.facebook,
          instagram: form.instagram,
          twitter: form.twitter,
          youtube: form.youtube,
        },
      };

      const res = await fetch(`${API_BASE_URL}/settings/contact`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update contact info');
      }

      await refreshSettings();
      setStatusMessage({
        type: 'success',
        text: 'Contact page information updated successfully! Live page updated.',
      });
    } catch (err) {
      console.error('Save contact error:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Error updating contact information',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setForm({
      heroTitle: DEFAULT_CONTACT_INFO.heroTitle,
      heroSubtitle: DEFAULT_CONTACT_INFO.heroSubtitle,
      address: DEFAULT_CONTACT_INFO.address,
      emailPrimary: DEFAULT_CONTACT_INFO.emailPrimary,
      emailSupport: DEFAULT_CONTACT_INFO.emailSupport,
      phone: DEFAULT_CONTACT_INFO.phone,
      helpline: DEFAULT_CONTACT_INFO.helpline,
      mapUrl: DEFAULT_CONTACT_INFO.mapUrl,
      facebook: DEFAULT_CONTACT_INFO.socials.facebook,
      instagram: DEFAULT_CONTACT_INFO.socials.instagram,
      twitter: DEFAULT_CONTACT_INFO.socials.twitter,
      youtube: DEFAULT_CONTACT_INFO.socials.youtube,
    });
    setStatusMessage({
      type: 'success',
      text: 'Default fields loaded into form. Click "Save Contact Information" to apply.',
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-150 shadow-sm select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100">
        <div>
          <div className="inline-flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FF6B16]"></span>
            <span className="text-[#FF6B16] font-bold text-xs uppercase tracking-wider">
              Website Customization
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#111111]">
            Contact Page Information Editor
          </h2>
          <p className="text-neutral-500 text-xs sm:text-sm mt-0.5">
            Update your office address, phone numbers, support emails, Google Maps URL, and social media handles.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetDefaults}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 text-xs font-semibold transition-all w-fit cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Load Defaults
        </button>
      </div>

      {/* Status Alert */}
      {statusMessage.text && (
        <div
          className={`mt-6 p-4 rounded-2xl flex items-start gap-3 text-sm ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          )}
          <span className="font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* Editor Form */}
      <form onSubmit={handleSave} className="mt-8 space-y-6">
        {/* 1. Hero Texts */}
        <div className="bg-[#F8FAFC] p-5 sm:p-6 rounded-2xl border border-neutral-200/80 space-y-4">
          <div className="flex items-center gap-2 text-[#1A384C] font-extrabold text-sm pb-2 border-b border-neutral-200">
            <Globe className="w-4 h-4 text-[#FF6B16]" />
            <span>Hero Header Texts</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1">
                Contact Page Title
              </label>
              <input
                type="text"
                name="heroTitle"
                value={form.heroTitle}
                onChange={handleChange}
                placeholder="Contact us"
                className="w-full h-11 px-3.5 rounded-xl border border-neutral-200 bg-white text-xs sm:text-sm text-neutral-800 focus:border-[#FF6B16] focus:ring-2 focus:ring-[#FF6B16]/10 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1">
                Contact Page Subtitle
              </label>
              <input
                type="text"
                name="heroSubtitle"
                value={form.heroSubtitle}
                onChange={handleChange}
                placeholder="Subtitle description..."
                className="w-full h-11 px-3.5 rounded-xl border border-neutral-200 bg-white text-xs sm:text-sm text-neutral-800 focus:border-[#FF6B16] focus:ring-2 focus:ring-[#FF6B16]/10 outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2. Office & Contact Numbers */}
        <div className="bg-[#F8FAFC] p-5 sm:p-6 rounded-2xl border border-neutral-200/80 space-y-4">
          <div className="flex items-center gap-2 text-[#1A384C] font-extrabold text-sm pb-2 border-b border-neutral-200">
            <Phone className="w-4 h-4 text-[#FF6B16]" />
            <span>Head Office, Phone & Email Channels</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1">
                Head Office Address
              </label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Himalayan Ridge View, Sector 4, Manali..."
                className="w-full h-11 px-3.5 rounded-xl border border-neutral-200 bg-white text-xs sm:text-sm text-neutral-800 focus:border-[#FF6B16] focus:ring-2 focus:ring-[#FF6B16]/10 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1">
                  Primary Email (hello@...)
                </label>
                <input
                  type="email"
                  name="emailPrimary"
                  value={form.emailPrimary}
                  onChange={handleChange}
                  placeholder="hello@weekendescapes.com"
                  className="w-full h-11 px-3.5 rounded-xl border border-neutral-200 bg-white text-xs sm:text-sm text-neutral-800 focus:border-[#FF6B16] focus:ring-2 focus:ring-[#FF6B16]/10 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1">
                  Support Email (support@...)
                </label>
                <input
                  type="email"
                  name="emailSupport"
                  value={form.emailSupport}
                  onChange={handleChange}
                  placeholder="support@weekendescapes.com"
                  className="w-full h-11 px-3.5 rounded-xl border border-neutral-200 bg-white text-xs sm:text-sm text-neutral-800 focus:border-[#FF6B16] focus:ring-2 focus:ring-[#FF6B16]/10 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full h-11 px-3.5 rounded-xl border border-neutral-200 bg-white text-xs sm:text-sm text-neutral-800 focus:border-[#FF6B16] focus:ring-2 focus:ring-[#FF6B16]/10 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1">
                  Helpline / Timings
                </label>
                <input
                  type="text"
                  name="helpline"
                  value={form.helpline}
                  onChange={handleChange}
                  placeholder="+91 91234 56789 (9 AM - 8 PM)"
                  className="w-full h-11 px-3.5 rounded-xl border border-neutral-200 bg-white text-xs sm:text-sm text-neutral-800 focus:border-[#FF6B16] focus:ring-2 focus:ring-[#FF6B16]/10 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Social Handles & Google Maps URL */}
        <div className="bg-[#F8FAFC] p-5 sm:p-6 rounded-2xl border border-neutral-200/80 space-y-4">
          <div className="flex items-center gap-2 text-[#1A384C] font-extrabold text-sm pb-2 border-b border-neutral-200">
            <Share2 className="w-4 h-4 text-[#FF6B16]" />
            <span>Social Handles & Google Map Embed</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1">
                Facebook URL
              </label>
              <input
                type="url"
                name="facebook"
                value={form.facebook}
                onChange={handleChange}
                placeholder="https://facebook.com/..."
                className="w-full h-11 px-3.5 rounded-xl border border-neutral-200 bg-white text-xs sm:text-sm text-neutral-800 focus:border-[#FF6B16] focus:ring-2 focus:ring-[#FF6B16]/10 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1">
                Instagram URL
              </label>
              <input
                type="url"
                name="instagram"
                value={form.instagram}
                onChange={handleChange}
                placeholder="https://instagram.com/..."
                className="w-full h-11 px-3.5 rounded-xl border border-neutral-200 bg-white text-xs sm:text-sm text-neutral-800 focus:border-[#FF6B16] focus:ring-2 focus:ring-[#FF6B16]/10 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1">
                Twitter / X URL
              </label>
              <input
                type="url"
                name="twitter"
                value={form.twitter}
                onChange={handleChange}
                placeholder="https://twitter.com/..."
                className="w-full h-11 px-3.5 rounded-xl border border-neutral-200 bg-white text-xs sm:text-sm text-neutral-800 focus:border-[#FF6B16] focus:ring-2 focus:ring-[#FF6B16]/10 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1">
                YouTube Channel URL
              </label>
              <input
                type="url"
                name="youtube"
                value={form.youtube}
                onChange={handleChange}
                placeholder="https://youtube.com/@..."
                className="w-full h-11 px-3.5 rounded-xl border border-neutral-200 bg-white text-xs sm:text-sm text-neutral-800 focus:border-[#FF6B16] focus:ring-2 focus:ring-[#FF6B16]/10 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-600 mb-1">
              Google Maps Iframe Embed URL
            </label>
            <input
              type="text"
              name="mapUrl"
              value={form.mapUrl}
              onChange={handleChange}
              placeholder="https://www.google.com/maps/embed?..."
              className="w-full h-11 px-3.5 rounded-xl border border-neutral-200 bg-white text-xs sm:text-sm text-neutral-800 focus:border-[#FF6B16] focus:ring-2 focus:ring-[#FF6B16]/10 outline-none"
            />
            <p className="text-[11px] text-neutral-400 mt-1">
              Paste the <code className="bg-neutral-200 px-1 rounded">src</code> URL from Google Maps Embed HTML iframe.
            </p>
          </div>
        </div>

        {/* Submit Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="h-12 px-7 bg-[#FF6B16] hover:bg-[#ff7d33] active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#FF6B16]/25 hover:shadow-[#FF6B16]/40 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Contact Information</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
