import React from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronDown, ArrowRight, PhoneCall } from 'lucide-react';
import { NAV_LINKS, BRAND } from '../../utils/constants';
import { useSettings } from '../../context/SettingsContext';

export function MobileMenu({
  isOpen,
  onClose,
  activeDropdown,
  onToggleDropdown,
  currentPath
}) {
  const { logoUrl } = useSettings();
  return (
    <div
      className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <div
        className={`absolute top-0 right-0 w-4/5 max-w-sm h-full bg-white shadow-2xl p-6 overflow-y-auto transition-transform duration-300 ease-out flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-neutral-100">
            <img src={logoUrl || "/logo/weekend-escapes-logo.svg"} alt="Weekend Escapes" className="h-9 w-auto" />
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Links */}
          <nav className="mt-6 space-y-1">
            {NAV_LINKS.map((link) => {
              const isActive = currentPath === link.path;
              const hasSub = link.hasDropdown && link.sublinks;
              const isSubOpen = activeDropdown === link.name;

              return (
                <div key={link.name} className="border-b border-neutral-50 pb-1">
                  <div className="flex items-center justify-between">
                    <Link
                      to={link.path}
                      className={`block py-3 text-base font-bold ${
                        isActive ? 'text-[#FF6B16]' : 'text-neutral-800'
                      }`}
                      onClick={() => !hasSub && onClose()}
                    >
                      {link.name}
                    </Link>
                    {hasSub && (
                      <button
                        type="button"
                        onClick={() => onToggleDropdown(link.name)}
                        className="p-2 text-neutral-400"
                        aria-label={`Toggle ${link.name} sub-links`}
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform ${isSubOpen ? 'rotate-180 text-[#FF6B16]' : ''}`} />
                      </button>
                    )}
                  </div>

                  {hasSub && isSubOpen && (
                    <div className="pl-4 pb-2 space-y-2 border-l-2 border-[#FF6B16]/20 ml-2">
                      {link.sublinks.map((sub) => (
                        <Link
                          key={sub.name}
                          to={sub.path}
                          className="block py-1 text-sm text-neutral-600 hover:text-[#FF6B16]"
                          onClick={onClose}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer CTAs */}
        <div className="pt-6 border-t border-neutral-100 space-y-4">
          <Link
            to="/plan-trip"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-bold bg-[#FF6B16] text-white shadow-lg shadow-[#FF6B16]/30 text-center"
          >
            <span>Plan My Trip</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href={`tel:${BRAND.phone}`}
            className="flex items-center justify-center gap-2 text-xs font-semibold text-neutral-600 hover:text-[#FF6B16]"
          >
            <PhoneCall className="w-3.5 h-3.5 text-[#FF6B16]" />
            <span>{BRAND.phone}</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default MobileMenu;
