import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Mail,
  Phone,
  Send,
  CheckCircle2,
  Heart,
  MessageCircle,
} from 'lucide-react';
import { BRAND } from '../../utils/constants';
import { useSettings } from '../../context/SettingsContext';

function WhatsAppIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.03C9.36 7.03 9.09 7.1 8.87 7.33C8.64 7.57 8 8.17 8 9.4C8 10.62 8.89 11.8 9.01 11.97C9.14 12.13 10.74 14.6 13.21 15.66C13.8 15.92 14.25 16.07 14.61 16.19C15.21 16.38 15.75 16.35 16.18 16.29C16.66 16.22 17.65 15.69 17.86 15.11C18.06 14.54 18.06 14.04 18 13.94C17.94 13.85 17.8 13.79 17.58 13.69C17.36 13.58 16.28 13.05 16.08 12.98C15.88 12.9 15.74 12.87 15.6 13.09C15.45 13.31 15.05 13.79 14.92 13.94C14.8 14.08 14.68 14.1 14.46 13.99C14.24 13.88 13.54 13.65 12.71 12.91C12.06 12.33 11.63 11.62 11.5 11.41C11.38 11.19 11.49 11.07 11.6 10.96C11.7 10.86 11.82 10.7 11.93 10.57C12.05 10.44 12.09 10.34 12.16 10.2C12.23 10.05 12.2 9.93 12.14 9.82C12.09 9.71 11.65 8.62 11.46 8.18C11.29 7.75 11.11 7.81 10.97 7.8C10.84 7.8 10.69 7.79 10.55 7.79C10.4 7.79 10.16 7.85 9.96 8.07C9.75 8.29 9.53 7.03 9.53 7.03Z"/>
    </svg>
  );
}

function InstagramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  );
}

function FacebookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}

function YoutubeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
    </svg>
  );
}

function TwitterIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
    </svg>
  );
}

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');
  const { logoUrl, footerLogoUrl, darkLogoUrl, footerLogoHeight, contactInfo, whatsappUrl, whatsappNumber } = useSettings();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 5000);
  };

  return (
    <footer className="bg-[#111111] text-white pt-16 pb-10 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-14 border-b border-neutral-800">
          {/* Col 1: Brand & Logo */}
          <div className="lg:col-span-2 space-y-4 text-center md:text-left flex flex-col items-center md:items-start">
            <Link to="/" className="inline-block">
              {/* Logo with light styling */}
              <div className="flex items-center justify-center md:justify-start gap-3">
                <img
                  src={
                    (footerLogoUrl && !footerLogoUrl.includes('/logo/weekend-escapes-logo.svg'))
                      ? footerLogoUrl
                      : (darkLogoUrl && !darkLogoUrl.includes('/logo/weekend-escapes-logo.svg'))
                      ? darkLogoUrl
                      : footerLogoUrl || darkLogoUrl || logoUrl || "/logo/weekend-escapes-logo.svg"
                  }
                  alt="Weekend Escapes"
                  style={{ height: `${footerLogoHeight || 48}px` }}
                  className={`w-auto object-contain max-w-[280px] ${
                    (!footerLogoUrl || footerLogoUrl.includes('/logo/weekend-escapes-logo.svg')) &&
                    (!darkLogoUrl || darkLogoUrl.includes('/logo/weekend-escapes-logo.svg')) &&
                    (logoUrl?.includes('/logo/weekend-escapes-logo.svg') || !logoUrl)
                      ? 'invert brightness-200'
                      : ''
                  }`}
                />
              </div>
            </Link>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-sm mx-auto md:mx-0">
              Crafting adventures, creating unforgettable memories. From high-altitude Himalayan summits to tropical island sanctuaries, we turn travel dreams into reality.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Govt. Registered Adventure Tour Operator
              </span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-4 text-center md:text-left">
            <h4 className="text-sm font-bold tracking-wider uppercase text-white/90">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-neutral-400 hover:text-[#FF6B16] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/packages" className="text-neutral-400 hover:text-[#FF6B16] transition-colors">
                  Tour Packages
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-neutral-400 hover:text-[#FF6B16] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-neutral-400 hover:text-[#FF6B16] transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Travel Info */}
          <div className="space-y-4 text-center md:text-left">
            <h4 className="text-sm font-bold tracking-wider uppercase text-white/90">
              Travel Info
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/blogs" className="text-neutral-400 hover:text-[#FF6B16] transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/about#faqs" className="text-neutral-400 hover:text-[#FF6B16] transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/cancellation-policy" className="text-neutral-400 hover:text-[#FF6B16] transition-colors">
                  Cancellation Policy
                </Link>
              </li>
              <li>
                <Link to="/contact#privacy" className="text-neutral-400 hover:text-[#FF6B16] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-neutral-400 hover:text-[#FF6B16] transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Subscribe */}
          <div className="space-y-4 text-center md:text-left">
            <h4 className="text-sm font-bold tracking-wider uppercase text-white/90">
              Contact Us
            </h4>
            <div className="space-y-2.5 text-xs text-neutral-400">
              <p className="flex items-start justify-center md:justify-start gap-2.5 text-center md:text-left">
                <MapPin className="w-4 h-4 text-[#FF6B16] shrink-0 mt-0.5" />
                <span>{contactInfo?.address || BRAND.address}</span>
              </p>
              <p className="flex items-center justify-center md:justify-start gap-2.5">
                <Mail className="w-4 h-4 text-[#FF6B16] shrink-0" />
                <a href={`mailto:${contactInfo?.emailPrimary || BRAND.email}`} className="hover:text-white transition-colors">
                  {contactInfo?.emailPrimary || BRAND.email}
                </a>
              </p>
              <p className="flex items-center justify-center md:justify-start gap-2.5">
                <Phone className="w-4 h-4 text-[#FF6B16] shrink-0" />
                <a href={`tel:${contactInfo?.phone || BRAND.phone}`} className="hover:text-white transition-colors">
                  {contactInfo?.phone || BRAND.phone}
                </a>
              </p>
              {whatsappNumber && (
                <p className="flex items-center justify-center md:justify-start gap-2.5">
                  <MessageCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">
                    {whatsappNumber}
                  </a>
                </p>
              )}
            </div>

            {/* Social Icons */}
            <div className="flex items-center justify-center md:justify-start gap-2.5 pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                title="Chat on WhatsApp"
                className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-emerald-600 text-neutral-300 hover:text-white flex items-center justify-center transition-all duration-200"
              >
                <WhatsAppIcon />
              </a>
              <a
                href={(contactInfo?.socials && contactInfo.socials.instagram) || BRAND.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-[#FF6B16] text-neutral-300 hover:text-white flex items-center justify-center transition-all duration-200"
              >
                <InstagramIcon />
              </a>
              <a
                href={(contactInfo?.socials && contactInfo.socials.facebook) || BRAND.socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-[#FF6B16] text-neutral-300 hover:text-white flex items-center justify-center transition-all duration-200"
              >
                <FacebookIcon />
              </a>
              <a
                href={(contactInfo?.socials && contactInfo.socials.youtube) || BRAND.socials.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-[#FF6B16] text-neutral-300 hover:text-white flex items-center justify-center transition-all duration-200"
              >
                <YoutubeIcon />
              </a>
              <a
                href={(contactInfo?.socials && contactInfo.socials.twitter) || BRAND.socials.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-[#FF6B16] text-neutral-300 hover:text-white flex items-center justify-center transition-all duration-200"
              >
                <TwitterIcon />
              </a>
            </div>

            {/* Newsletter Subscription */}
            <div className="pt-2">
              <h5 className="text-xs font-bold text-neutral-300 mb-2">Subscribe for Travel Updates</h5>
              <form onSubmit={handleSubscribe} className="relative flex items-center max-w-sm mx-auto md:mx-0">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-full px-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF6B16] pr-10"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="absolute right-1 w-7 h-7 rounded-full bg-[#FF6B16] hover:bg-[#e05809] text-white flex items-center justify-center transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
              {error && <p className="text-[11px] text-red-400 mt-1">{error}</p>}
              {subscribed && (
                <p className="flex items-center justify-center md:justify-start gap-1 text-[11px] text-emerald-400 mt-1">
                  <CheckCircle2 className="w-3 h-3" /> Subscribed successfully!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 text-center sm:text-left">
          <p>© {new Date().getFullYear()} Weekend Escapes. All rights reserved.</p>
          <p className="flex items-center justify-center sm:justify-start gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-[#FF6B16] fill-[#FF6B16]" /> for explorers & wanderers
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
