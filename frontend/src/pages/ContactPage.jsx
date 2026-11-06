import React, { useState } from 'react';
import {
  MapPin,
  Mail,
  Phone,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MessageCircle,
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { getVisitorId } from '../hooks/usePushNotifications';

// Social Icon SVGs
function WhatsAppIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.03C9.36 7.03 9.09 7.1 8.87 7.33C8.64 7.57 8 8.17 8 9.4C8 10.62 8.89 11.8 9.01 11.97C9.14 12.13 10.74 14.6 13.21 15.66C13.8 15.92 14.25 16.07 14.61 16.19C15.21 16.38 15.75 16.35 16.18 16.29C16.66 16.22 17.65 15.69 17.86 15.11C18.06 14.54 18.06 14.04 18 13.94C17.94 13.85 17.8 13.79 17.58 13.69C17.36 13.58 16.28 13.05 16.08 12.98C15.88 12.9 15.74 12.87 15.6 13.09C15.45 13.31 15.05 13.79 14.92 13.94C14.8 14.08 14.68 14.1 14.46 13.99C14.24 13.88 13.54 13.65 12.71 12.91C12.06 12.33 11.63 11.62 11.5 11.41C11.38 11.19 11.49 11.07 11.6 10.96C11.7 10.86 11.82 10.7 11.93 10.57C12.05 10.44 12.09 10.34 12.16 10.2C12.23 10.05 12.2 9.93 12.14 9.82C12.09 9.71 11.65 8.62 11.46 8.18C11.29 7.75 11.11 7.81 10.97 7.8C10.84 7.8 10.69 7.79 10.55 7.79C10.4 7.79 10.16 7.85 9.96 8.07C9.75 8.29 9.53 7.03 9.53 7.03Z"/>
    </svg>
  );
}

function FacebookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function TwitterIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
    </svg>
  );
}

function YoutubeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#fff" />
    </svg>
  );
}

export function ContactPage() {
  const { contactInfo, whatsappUrl, whatsappNumber, API_BASE_URL } = useSettings();

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${API_BASE_URL}/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, visitorId: getVisitorId() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit inquiry. Please try again.');
      }

      setSubmitted(true);
      setFormData({
        name: '',
        company: '',
        phone: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (err) {
      console.error('Contact Form Submission Error:', err);
      setErrorMsg(err.message || 'Something went wrong while sending your inquiry.');
    } finally {
      setLoading(false);
    }
  };

  const socials = contactInfo?.socials || {};

  return (
    <div data-navbar-theme="dark" className="bg-[#F7F7F5] min-h-screen select-none font-sans">
      {/* ── 1. Top Hero Header Banner (Dynamic from Admin Settings) ── */}
      <section className="relative h-[380px] sm:h-[420px] w-full bg-[#111111] overflow-hidden flex items-center justify-center text-center px-4">
        <img
          src="/newimage/about/image1.png"
          alt="Contact Weekend Escapes"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-30 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90 pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto -mt-10 sm:-mt-14">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
            {contactInfo?.heroTitle || 'Contact us'}
          </h1>
          <p className="mt-3 text-neutral-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl mx-auto font-medium">
            {contactInfo?.heroSubtitle ||
              'Weekend Escapes is ready to provide the right solution and adventure according to your needs'}
          </p>
        </div>
      </section>

      {/* ── 2. Floating Two-Column Card (Overlapping Banner) ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 sm:-mt-28 relative z-20 pb-16">
        <div className="bg-white rounded-3xl shadow-2xl shadow-black/10 border border-neutral-150 p-6 sm:p-10 lg:p-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* ── Left Column: "Get in touch" (Dynamic Info) ── */}
            <div className="lg:col-span-5 space-y-6 lg:pr-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
                  Get in touch
                </h2>
                <p className="mt-2 text-neutral-500 text-xs sm:text-sm leading-relaxed">
                  Have questions about our treks, personalized itineraries, or group bookings? Reach out to our expedition marshals anytime.
                </p>
              </div>

              {/* Dynamic Contact Details List */}
              <div className="space-y-5 pt-2">
                {/* Head Office */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-[#FF6B16] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#FF6B16]/25 mt-0.5">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#111111]">Head Office</h4>
                    <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                      {contactInfo?.address || 'Himalayan Ridge View, Sector 4, Manali / Dehradun, India'}
                    </p>
                  </div>
                </div>

                {/* Email Us */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-[#FF6B16] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#FF6B16]/25 mt-0.5">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#111111]">Email Us</h4>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      <a
                        href={`mailto:${contactInfo?.emailPrimary || 'hello@weekendescapes.com'}`}
                        className="hover:text-[#FF6B16] transition-colors"
                      >
                        {contactInfo?.emailPrimary || 'hello@weekendescapes.com'}
                      </a>
                    </p>
                    <p className="text-xs text-neutral-500">
                      <a
                        href={`mailto:${contactInfo?.emailSupport || 'support@weekendescapes.com'}`}
                        className="hover:text-[#FF6B16] transition-colors"
                      >
                        {contactInfo?.emailSupport || 'support@weekendescapes.com'}
                      </a>
                    </p>
                  </div>
                </div>

                {/* Call Us */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-[#FF6B16] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#FF6B16]/25 mt-0.5">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#111111]">Call Us</h4>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Phone :{' '}
                      <a
                        href={`tel:${contactInfo?.phone || '+91 98765 43210'}`}
                        className="hover:text-[#FF6B16] transition-colors font-medium"
                      >
                        {contactInfo?.phone || '+91 98765 43210'}
                      </a>
                    </p>
                    <p className="text-xs text-neutral-500">
                      Helpline : {contactInfo?.helpline || '+91 91234 56789 (9 AM - 8 PM)'}
                    </p>
                  </div>
                </div>

                {/* WhatsApp Chat Support */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/25 mt-0.5">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#111111]">WhatsApp Chat</h4>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Direct WhatsApp :{' '}
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-emerald-600 text-emerald-600 transition-colors font-bold"
                      >
                        {whatsappNumber || contactInfo?.whatsapp || '+91 98765 43210'}
                      </a>
                    </p>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 mt-1"
                    >
                      <span>Start Chat on WhatsApp &rarr;</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Follow Our Social Media */}
              <div className="pt-4 border-t border-neutral-100">
                <p className="text-xs font-bold text-neutral-700 uppercase tracking-wider mb-3">
                  Follow our social media
                </p>
                <div className="flex items-center gap-3">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-sm"
                    aria-label="WhatsApp"
                    title="WhatsApp"
                  >
                    <WhatsAppIcon />
                  </a>

                  <a
                    href={socials.facebook || 'https://facebook.com/weekendescapes'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-sm"
                    aria-label="Facebook"
                  >
                    <FacebookIcon />
                  </a>

                  <a
                    href={socials.instagram || 'https://instagram.com/weekendescapes'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-sm"
                    aria-label="Instagram"
                  >
                    <InstagramIcon />
                  </a>

                  <a
                    href={socials.twitter || 'https://twitter.com/weekendescapes'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-neutral-900 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-sm"
                    aria-label="Twitter"
                  >
                    <TwitterIcon />
                  </a>

                  <a
                    href={socials.youtube || 'https://youtube.com/@weekendescapes'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-[#FF0000] text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-sm"
                    aria-label="YouTube"
                  >
                    <YoutubeIcon />
                  </a>
                </div>
              </div>
            </div>

            {/* ── Right Column: "Send us a message" Form ── */}
            <div className="lg:col-span-7 lg:pl-4">
              <h2 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight mb-6">
                Send us a message
              </h2>

              {errorMsg && (
                <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {submitted ? (
                <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h3 className="text-xl font-bold text-emerald-900">Inquiry Delivered to Basecamp!</h3>
                  <p className="text-xs sm:text-sm text-emerald-700 max-w-sm mx-auto">
                    Thank you for reaching out. Your lead has been dispatched to our destination planners. We will contact you shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-3 px-5 py-2.5 rounded-xl bg-[#FF6B16] text-white text-xs font-bold hover:bg-[#ff7d33] transition-all cursor-pointer shadow-md shadow-[#FF6B16]/20"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Row 1: Name & Company */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-600 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your full name"
                        className="w-full h-11 px-3.5 rounded-lg border border-neutral-200 bg-[#F8FAFC] text-neutral-800 placeholder-neutral-400 text-xs sm:text-sm focus:bg-white focus:border-[#FF6B16] focus:ring-2 focus:ring-[#FF6B16]/10 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-600 mb-1">
                        Company / Group Size
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="e.g. 4 Explorers / Solo"
                        className="w-full h-11 px-3.5 rounded-lg border border-neutral-200 bg-[#F8FAFC] text-neutral-800 placeholder-neutral-400 text-xs sm:text-sm focus:bg-white focus:border-[#FF6B16] focus:ring-2 focus:ring-[#FF6B16]/10 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Row 2: Phone & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-600 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full h-11 px-3.5 rounded-lg border border-neutral-200 bg-[#F8FAFC] text-neutral-800 placeholder-neutral-400 text-xs sm:text-sm focus:bg-white focus:border-[#FF6B16] focus:ring-2 focus:ring-[#FF6B16]/10 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-600 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="name@example.com"
                        className="w-full h-11 px-3.5 rounded-lg border border-neutral-200 bg-[#F8FAFC] text-neutral-800 placeholder-neutral-400 text-xs sm:text-sm focus:bg-white focus:border-[#FF6B16] focus:ring-2 focus:ring-[#FF6B16]/10 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Row 3: Subject */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g. Kedarkantha Winter Batch Inquiry"
                      className="w-full h-11 px-3.5 rounded-lg border border-neutral-200 bg-[#F8FAFC] text-neutral-800 placeholder-neutral-400 text-xs sm:text-sm focus:bg-white focus:border-[#FF6B16] focus:ring-2 focus:ring-[#FF6B16]/10 outline-none transition-all"
                    />
                  </div>

                  {/* Row 4: Message */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us about your trip plans, dates, group size, and any special requests..."
                      className="w-full p-3.5 rounded-lg border border-neutral-200 bg-[#F8FAFC] text-neutral-800 placeholder-neutral-400 text-xs sm:text-sm focus:bg-white focus:border-[#FF6B16] focus:ring-2 focus:ring-[#FF6B16]/10 outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 mt-2 bg-[#FF6B16] hover:bg-[#ff7d33] active:scale-[0.99] text-white font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-[#FF6B16]/25 hover:shadow-[#FF6B16]/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting Inquiry...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default ContactPage;
