import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, X } from 'lucide-react';
import { NAV_LINKS, getPackageDropdownName } from '../../utils/constants';
import { useSettings } from '../../context/SettingsContext';
import { usePackages } from '../../context/PackageContext';
import NotificationBell from '../common/NotificationBell';

export function Navbar({
  mobileMenuOpen = false,
  onToggleMobileMenu,
  activeDropdown = null,
  setActiveDropdown
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [hasDarkPageAttr, setHasDarkPageAttr] = useState(false);
  const location = useLocation();
  const { logoUrl } = useSettings();
  const { packages } = usePackages();

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

  // Check if current route has dark hero background or has data-navbar-theme="dark"
  useEffect(() => {
    const checkDarkTheme = () => {
      const darkEl = document.querySelector('[data-navbar-theme="dark"]');
      setHasDarkPageAttr(Boolean(darkEl));
    };
    checkDarkTheme();
    const timer = setTimeout(checkDarkTheme, 150);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const normalizedPath = location.pathname.replace(/\/$/, '') || '/';
  const DARK_HERO_ROUTES = ['/contact', '/about'];
  const isDarkHeroPage = DARK_HERO_ROUTES.includes(normalizedPath) || hasDarkPageAttr;

  // Use crisp white text only when the navbar is un-scrolled over a dark/black hero
  const useWhiteText = !isScrolled && isDarkHeroPage;

  // Dynamic Tour Packages dropdown sublinks reflecting all created/updated packages
  const packageSublinks = useMemo(() => {
    if (!Array.isArray(packages) || packages.length === 0) return [];
    return packages
      .filter((pkg) => pkg.isActive !== false)
      .map((pkg) => ({
        name: getPackageDropdownName(pkg),
        path: `/packages/${pkg.id || pkg._id}`,
      }));
  }, [packages]);

  // Merge dynamic package sublinks into NAV_LINKS
  const navLinksToRender = useMemo(() => {
    return NAV_LINKS.map((link) => {
      if (link.name === 'Tour Packages' || link.path === '/packages') {
        return {
          ...link,
          sublinks: packageSublinks.length > 0 ? packageSublinks : link.sublinks,
        };
      }
      return link;
    });
  }, [packageSublinks]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md py-3'
          : useWhiteText
          ? 'bg-gradient-to-b from-black/80 via-black/35 to-transparent py-4 md:py-6'
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
              className={`h-10 sm:h-12 w-auto transition-all duration-300 group-hover:scale-105 ${
                useWhiteText && (!logoUrl || logoUrl.endsWith('weekend-escapes-logo.svg'))
                  ? 'bg-white/95 px-2.5 py-1 rounded-xl shadow-sm'
                  : ''
              }`}
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinksToRender.map((link) => {
              const isActive =
                location.pathname === link.path ||
                (link.hasDropdown && location.pathname.startsWith(link.path));
              const hasSub = link.hasDropdown && link.sublinks && link.sublinks.length > 0;
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
                        ? 'text-[#FF6B16] font-bold'
                        : useWhiteText
                        ? 'text-white/90 hover:text-[#FF6B16] drop-shadow-sm'
                        : 'text-[#111111] hover:text-[#FF6B16]'
                    }`}
                  >
                    <span>{link.name}</span>
                    {hasSub && (
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isDropdownOpen
                            ? 'rotate-180 text-[#FF6B16]'
                            : useWhiteText
                            ? 'text-white/70'
                            : 'text-neutral-500'
                        }`}
                      />
                    )}
                  </Link>

                  {/* Submenu Dropdown */}
                  {hasSub && (
                    <div
                      className={`absolute top-full left-0 w-72 pt-2 transition-all duration-200 ${
                        isDropdownOpen
                          ? 'opacity-100 translate-y-0 pointer-events-auto visible'
                          : 'opacity-0 translate-y-2 pointer-events-none invisible'
                      }`}
                    >
                      <div className="bg-white rounded-2xl shadow-xl border border-neutral-100 p-2 overflow-hidden">
                        <div className="max-h-[380px] overflow-y-auto space-y-0.5 pr-1">
                          {link.sublinks.map((sub) => (
                            <Link
                              key={sub.path || sub.name}
                              to={sub.path}
                              className="block px-3.5 py-2 text-xs font-semibold text-neutral-700 hover:text-[#FF6B16] hover:bg-[#FF6B16]/5 rounded-xl transition-all duration-150 truncate"
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                        {link.name === 'Tour Packages' && (
                          <div className="pt-2 mt-1.5 border-t border-neutral-100">
                            <Link
                              to="/packages"
                              className="block px-3.5 py-2 text-[11px] font-bold text-[#FF6B16] hover:bg-[#FF6B16]/5 rounded-xl transition-all text-center"
                            >
                              View All Packages →
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Push Notification Toggle Bell */}
            <NotificationBell isLight={useWhiteText} />
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <NotificationBell isLight={useWhiteText} />
            <button
              type="button"
              onClick={onToggleMobileMenu}
              className={`p-2 rounded-xl transition-colors focus:outline-none cursor-pointer ${
                useWhiteText
                  ? 'text-white hover:bg-white/15'
                  : 'text-neutral-800 hover:bg-neutral-100'
              }`}
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
