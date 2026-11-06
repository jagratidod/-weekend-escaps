/**
 * Weekend Escapes - Global Theme Color Utilities
 * Manages dynamic brand primary color customization across the application.
 */

export const DEFAULT_THEME_COLOR = '#FF6B16';
export const DEFAULT_THEME_HOVER = '#e05809';

/**
 * Checks if a string is a valid 3 or 6 digit hex code
 */
export function isValidHex(hex) {
  if (!hex || typeof hex !== 'string') return false;
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex.trim());
}

/**
 * Comprehensive Color Palettes covering the full color spectrum (10 families, 80+ shades)
 */
export const FULL_COLOR_PALETTES = [
  {
    id: 'orange',
    family: 'Oranges & Warmth',
    category: 'Brand Signature',
    description: 'Energetic, warm adventure hues',
    colors: [
      { name: 'Original Weekend Orange', hex: '#FF6B16' },
      { name: 'Flame Orange', hex: '#F97316' },
      { name: 'Burnt Tangerine', hex: '#EA580C' },
      { name: 'Deep Rust', hex: '#C2410C' },
      { name: 'Coral Sunset', hex: '#FB923C' },
      { name: 'Warm Terracotta', hex: '#D9531E' },
      { name: 'Canyon Ochre', hex: '#E65100' },
      { name: 'Safety Blaze', hex: '#FF5722' },
    ],
  },
  {
    id: 'red',
    family: 'Crimson & Reds',
    category: 'Vibrant & Bold',
    description: 'Bold, passionate & striking',
    colors: [
      { name: 'Sunset Crimson', hex: '#E11D48' },
      { name: 'Ruby Red', hex: '#DC2626' },
      { name: 'Deep Scarlet', hex: '#B91C1C' },
      { name: 'Maroon Peak', hex: '#991B1B' },
      { name: 'Rose Red', hex: '#F43F5E' },
      { name: 'Vibrant Cherry', hex: '#EF4444' },
      { name: 'Wine Velvet', hex: '#881337' },
      { name: 'Brick Rust', hex: '#9A3412' },
    ],
  },
  {
    id: 'amber',
    family: 'Ambers & Golds',
    category: 'Warm Sunlight',
    description: 'Golden hour, desert sand & warmth',
    colors: [
      { name: 'Desert Gold', hex: '#D97706' },
      { name: 'Warm Amber', hex: '#F59E0B' },
      { name: 'Honey Ochre', hex: '#B45309' },
      { name: 'Goldenrod', hex: '#CA8A04' },
      { name: 'Bright Canary', hex: '#EAB308' },
      { name: 'Bronze Sand', hex: '#92400E' },
      { name: 'Sahara Sun', hex: '#FBBF24' },
      { name: 'Caramel Earth', hex: '#78350F' },
    ],
  },
  {
    id: 'green',
    family: 'Emeralds & Greens',
    category: 'Alpine Nature',
    description: 'Lush alpine valleys & forest pine',
    colors: [
      { name: 'Alpine Emerald', hex: '#059669' },
      { name: 'Forest Green', hex: '#16A34A' },
      { name: 'Deep Pine', hex: '#15803D' },
      { name: 'Mint Jade', hex: '#10B981' },
      { name: 'Bright Green', hex: '#22C55E' },
      { name: 'Olive Hunter', hex: '#14532D' },
      { name: 'Jungle Moss', hex: '#047857' },
      { name: 'Spruce Woods', hex: '#064E3B' },
    ],
  },
  {
    id: 'teal',
    family: 'Teals & Aquas',
    category: 'Coastal Explorer',
    description: 'Glacial alpine lakes & coastal lagoons',
    colors: [
      { name: 'Oceanic Teal', hex: '#0D9488' },
      { name: 'Glacier Cyan', hex: '#06B6D4' },
      { name: 'Deep Sea Teal', hex: '#0F766E' },
      { name: 'Vibrant Aqua', hex: '#14B8A6' },
      { name: 'Pacific Blue', hex: '#0891B2' },
      { name: 'Caribbean Wave', hex: '#0E7490' },
      { name: 'Abyss Emerald', hex: '#115E59' },
      { name: 'Arctic Frost', hex: '#155E75' },
    ],
  },
  {
    id: 'blue',
    family: 'Sky & Azure Blues',
    category: 'Sky & Ocean',
    description: 'High altitude Himalayan sky & clear ocean',
    colors: [
      { name: 'Himalayan Azure', hex: '#0284C7' },
      { name: 'Electric Sky', hex: '#0EA5E9' },
      { name: 'Royal Sapphire', hex: '#2563EB' },
      { name: 'Cobalt Peak', hex: '#1D4ED8' },
      { name: 'Bright Blue', hex: '#3B82F6' },
      { name: 'Deep Navy', hex: '#1E40AF' },
      { name: 'Aegean Sea', hex: '#0369A1' },
      { name: 'Midnight Azure', hex: '#075985' },
    ],
  },
  {
    id: 'indigo',
    family: 'Indigos & Violets',
    category: 'Modern Summit',
    description: 'Twilight summit trails & starry night skies',
    colors: [
      { name: 'Twilight Indigo', hex: '#4F46E5' },
      { name: 'Electric Indigo', hex: '#6366F1' },
      { name: 'Deep Night', hex: '#4338CA' },
      { name: 'Midnight Violet', hex: '#3730A3' },
      { name: 'Summit Blue', hex: '#312E81' },
      { name: 'Ultramarine', hex: '#5B21B6' },
      { name: 'Nebula Violet', hex: '#4C1D95' },
      { name: 'Space Indigo', hex: '#1E1B4B' },
    ],
  },
  {
    id: 'purple',
    family: 'Purples & Magentas',
    category: 'Royal Luxury',
    description: 'Royal luxury, mystical twilight & blooms',
    colors: [
      { name: 'Royal Purple', hex: '#7C3AED' },
      { name: 'Electric Violet', hex: '#8B5CF6' },
      { name: 'Imperial Violet', hex: '#6D28D9' },
      { name: 'Deep Orchid', hex: '#9333EA' },
      { name: 'Neon Fuchsia', hex: '#D946EF' },
      { name: 'Bright Magenta', hex: '#C026D3' },
      { name: 'Velvet Plum', hex: '#7E22CE' },
      { name: 'Dark Amethyst', hex: '#581C87' },
    ],
  },
  {
    id: 'pink',
    family: 'Pinks & Roses',
    category: 'Playful Energy',
    description: 'Cherry blossoms, playful energy & vibrancy',
    colors: [
      { name: 'Hot Pink', hex: '#EC4899' },
      { name: 'Wild Rose', hex: '#DB2777' },
      { name: 'Deep Berry', hex: '#BE185D' },
      { name: 'Flamingo', hex: '#F43F5E' },
      { name: 'Strawberry', hex: '#E11D48' },
      { name: 'Raspberry', hex: '#9D174D' },
      { name: 'Coral Rose', hex: '#FB7185' },
      { name: 'Candy Pink', hex: '#F472B6' },
    ],
  },
  {
    id: 'slate',
    family: 'Modern Slates & Dark',
    category: 'Monochrome Elite',
    description: 'Minimalist, luxury monochrome & stone',
    colors: [
      { name: 'Slate Steel', hex: '#475569' },
      { name: 'Graphite Stone', hex: '#334155' },
      { name: 'Deep Charcoal', hex: '#1E293B' },
      { name: 'Obsidian Black', hex: '#0F172A' },
      { name: 'Zinc Pewter', hex: '#52525B' },
      { name: 'Carbon Dark', hex: '#27272A' },
      { name: 'Gunmetal Peak', hex: '#3F3F46' },
      { name: 'Granite Rock', hex: '#18181B' },
    ],
  },
];

/**
 * Backward-compatible 8 curated presets
 */
export const THEME_PRESETS = [
  {
    name: 'Weekend Orange (Default)',
    color: '#FF6B16',
    hover: '#e05809',
    description: 'Signature adventure warm orange',
    badge: 'Original',
  },
  {
    name: 'Himalayan Azure',
    color: '#0284C7',
    hover: '#0369A1',
    description: 'High altitude mountain sky blue',
    badge: 'Sky & Water',
  },
  {
    name: 'Alpine Emerald',
    color: '#059669',
    hover: '#047857',
    description: 'Lush valley pine green',
    badge: 'Nature',
  },
  {
    name: 'Royal Purple',
    color: '#7C3AED',
    hover: '#6D28D9',
    description: 'Majestic evening twilight & luxury',
    badge: 'Luxury',
  },
  {
    name: 'Sunset Crimson',
    color: '#E11D48',
    hover: '#BE123C',
    description: 'Vibrant sunset glow & energy',
    badge: 'Vibrant',
  },
  {
    name: 'Desert Gold',
    color: '#D97706',
    hover: '#B45309',
    description: 'Golden sand dunes & warm sunlight',
    badge: 'Warmth',
  },
  {
    name: 'Oceanic Teal',
    color: '#0D9488',
    hover: '#0F766E',
    description: 'Deep coastal lagoons & alpine lakes',
    badge: 'Explorer',
  },
  {
    name: 'Twilight Indigo',
    color: '#4F46E5',
    hover: '#4338CA',
    description: 'Night summit trails & modern expedition',
    badge: 'Modern',
  },
];

/**
 * Converts Hex string to { r, g, b } numbers
 */
export function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return null;
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  if (clean.length !== 6) return null;
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  return { r, g, b };
}

/**
 * Converts HSL to Hex (h: 0-360, s: 0-100, l: 0-100)
 */
export function hslToHex(h, s, l) {
  const hNorm = ((h % 360) + 360) % 360;
  const sNorm = Math.max(0, Math.min(100, s)) / 100;
  const lNorm = Math.max(0, Math.min(100, l)) / 100;

  const a = sNorm * Math.min(lNorm, 1 - lNorm);
  const f = (n) => {
    const k = (n + hNorm / 30) % 12;
    const color = lNorm - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

/**
 * Converts Hex to HSL { h: 0-360, s: 0-100, l: 0-100 }
 */
export function hexToHsl(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return { h: 22, s: 100, l: 54 }; // default orange
  let { r, g, b } = rgb;
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Computes a darker hover shade from a hex color (multiplies channels by factor ~0.86)
 */
export function computeHoverShade(hex, factor = 0.86) {
  const rgb = hexToRgb(hex);
  if (!rgb) return DEFAULT_THEME_HOVER;
  const r = Math.max(0, Math.floor(rgb.r * factor));
  const g = Math.max(0, Math.floor(rgb.g * factor));
  const b = Math.max(0, Math.floor(rgb.b * factor));
  const toHex = (n) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Injects CSS custom properties into document.documentElement and persists to localStorage
 */
export function applyThemeColor(themeColor, themeColorHover) {
  if (typeof document === 'undefined') return;
  const color = themeColor || DEFAULT_THEME_COLOR;
  const hover = themeColorHover || computeHoverShade(color);
  const rgb = hexToRgb(color);

  const root = document.documentElement;
  root.style.setProperty('--theme-color', color);
  root.style.setProperty('--theme-hover', hover);
  root.style.setProperty('--primary-orange', color);

  if (rgb) {
    root.style.setProperty('--theme-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
  }

  try {
    localStorage.setItem('we_theme_color', color);
    localStorage.setItem('we_theme_hover', hover);
  } catch (err) {
    // ignore
  }
}
