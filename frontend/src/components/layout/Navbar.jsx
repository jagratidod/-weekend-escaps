import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, X, User } from 'lucide-react';
import { NAV_LINKS } from '../../utils/constants';
import { useSettings } from '../../context/SettingsContext';

export function Navbar({
  mobileMenuOpen = false,
  onToggleMobileMenu,
  activeDropdown = null,
  setActiveDropdown
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { logoUrl } = useSettings();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md py-3'
          : 'bg-transparent py-4 md:py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none">
            <img
              src={logoUrl || "/logo/weekend-escapes-logo.svg"}
              alt="Weekend Escapes"
              className="h-10 sm:h-12 w-auto transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.path;
              const hasSub = link.hasDropdown && link.sublinks;
              const isDropdownOpen = activeDropdown === link.name;

              return (
                <div
                  key={link.name}
                  className="relative group"
                  onMouseEnter={() => hasSub && setActiveDropdown && setActiveDropdown(link.name)}
                  onMouseLeave={() => hasSub && setActiveDropdown && setActiveDropdown(null)}
                >
                  <Link
                    to={link.path}
                    className={`inline-flex items-center gap-1.5 text-sm font-semibold tracking-wide transition-colors duration-200 py-2 ${
                      isActive
                        ? 'text-[#FF6B16]'
                        : 'text-[#111111] hover:text-[#FF6B16]'
                    }`}
                  >
                    <span>{link.name}</span>
                    {hasSub && (
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isDropdownOpen ? 'rotate-180 text-[#FF6B16]' : 'text-neutral-500'
                        }`}
                      />
                    )}
                  </Link>

                  {/* Submenu Dropdown */}
                  {hasSub && (
                    <div
                      className={`absolute top-full left-0 w-64 pt-2 transition-all duration-200 ${
                        isDropdownOpen
                          ? 'opacity-100 translate-y-0 pointer-events-auto visible'
                          : 'opacity-0 translate-y-2 pointer-events-none invisible'
                      }`}
                    >
                      <div className="bg-white rounded-2xl shadow-xl border border-neutral-100 p-2 overflow-hidden">
                        {link.sublinks.map((sub) => (
                          <Link
                            key={sub.name}
                            to={sub.path}
                            className="block px-4 py-2.5 text-xs font-semibold text-neutral-700 hover:text-[#FF6B16] hover:bg-[#FF6B16]/5 rounded-xl transition-all duration-150"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right CTAs */}
          <div className="hidden sm:flex items-center gap-4">
            {/* Profile icon */}
            <button
              type="button"
              aria-label="User Profile"
              className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-700 hover:text-[#FF6B16] hover:border-[#FF6B16] transition-all duration-200 bg-white shadow-sm cursor-pointer"
            >
              <User className="w-4 h-4" />
            </button>

            {/* Plan My Trip Button (Orange) */}
            <Link
              to="/plan-trip"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold bg-[#FF6B16] hover:bg-[#e05809] text-white shadow-lg shadow-[#FF6B16]/30 hover:shadow-xl hover:shadow-[#FF6B16]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              <span>Plan My Trip</span>
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            </Link>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex lg:hidden items-center gap-3">
            <Link
              to="/plan-trip"
              className="sm:hidden px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#FF6B16] text-white"
            >
              Plan Trip
            </Link>
            <button
              type="button"
              onClick={onToggleMobileMenu}
              className="p-2 rounded-xl text-neutral-800 hover:bg-neutral-100 transition-colors focus:outline-none cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
