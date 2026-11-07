export const BRAND = {
  name: "Weekend Escapes",
  tagline: "Your Next Adventure Awaits",
  subTagline: "From majestic mountains to serene valleys, we craft unforgettable travel experiences for every explorer.",
  phone: "+91 98765 43210",
  email: "hello@weekendescapes.com",
  address: "Himalayan Ridge View, Sector 4, Manali / Dehradun, India",
  whatsappUrl: "https://wa.me/919876543210?text=Hi%20Weekend%20Escapes!%20I%20would%20like%20to%20plan%20my%20next%20adventure.",
  socials: {
    instagram: "https://instagram.com/weekendescapes",
    facebook: "https://facebook.com/weekendescapes",
    youtube: "https://youtube.com/@weekendescapes",
    twitter: "https://twitter.com/weekendescapes"
  }
};

export const COLORS = {
  primaryOrange: "#FF6B16",
  darkBlack: "#111111",
  pureWhite: "#FFFFFF",
  lightBg: "#F7F7F5",
  secondaryGrey: "#777777"
};

export function formatDurationBadge(durationStr) {
  if (!durationStr) return '';
  if (/\(\d+D\/\d+N\)/i.test(durationStr)) return durationStr;
  if (/^\d+D\/\d+N$/i.test(durationStr)) return `(${durationStr})`;

  const match = durationStr.match(/(\d+)\s*Days?\s*[\/\-&,]?\s*(\d+)\s*Nights?/i);
  if (match) {
    return `(${match[1]}D/${match[2]}N)`;
  }
  const dayMatch = durationStr.match(/(\d+)\s*Days?/i);
  if (dayMatch) {
    return `(${dayMatch[1]}D)`;
  }
  return `(${durationStr})`;
}

export function getPackageDropdownName(pkg) {
  if (!pkg) return '';
  const durBadge = formatDurationBadge(pkg.duration);
  if (!durBadge) return pkg.name;
  if (pkg.name.includes('(')) return pkg.name;
  return `${pkg.name} ${durBadge}`;
}

export const NAV_LINKS = [
  { name: "Home", path: "/" },
  {
    name: "Tour Packages",
    path: "/packages",
    hasDropdown: true,
    sublinks: [
      { name: "Kedarkantha Trek (6D/5N)", path: "/packages/kedarkantha-trek" },
      { name: "Kashmir Getaway (7D/6N)", path: "/packages/kashmir-getaway" },
      { name: "Manali Adventure (5D/4N)", path: "/packages/manali-adventure" },
      { name: "Bali Escape (7D/6N)", path: "/packages/bali-escape" }
    ]
  },
  { name: "My Bookings", path: "/my-bookings" },
  { name: "Blog", path: "/blogs" },
  { name: "Gallery", path: "/gallery" },
  { name: "About Us", path: "/about" },
  { name: "Contact", path: "/contact" }
];
