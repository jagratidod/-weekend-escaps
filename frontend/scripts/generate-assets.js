import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const dirs = [
  'public/logo',
  'public/images/hero',
  'public/images/destinations',
  'public/images/packages',
  'public/images/experiences',
  'public/images/why-us',
  'public/images/process',
  'public/images/testimonials',
  'public/images/gallery',
  'public/images/blogs',
  'public/images/cta',
  'public/images/decorations',
  'public/icons'
];

for (const dir of dirs) {
  fs.mkdirSync(dir, { recursive: true });
}

// 1. Logo SVG & PNG
const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 100" width="320" height="100">
  <defs>
    <linearGradient id="sunGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#FF6B16" />
      <stop offset="100%" stop-color="#FFA24C" />
    </linearGradient>
    <linearGradient id="mntnGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2D3748" />
      <stop offset="100%" stop-color="#1A202C" />
    </linearGradient>
  </defs>
  <!-- Sun Disk -->
  <circle cx="48" cy="46" r="34" fill="url(#sunGrad)" />
  <!-- Mountain Silhouette in Logo -->
  <polygon points="18,74 48,26 78,74" fill="url(#mntnGrad)" />
  <polygon points="48,26 48,74 78,74" fill="#111111" />
  <!-- Snow Cap -->
  <polygon points="48,26 40,39 48,44 56,39" fill="#FFFFFF" />
  <!-- Second Peak -->
  <polygon points="36,74 62,38 88,74" fill="#3A475C" opacity="0.8" />
  <polygon points="62,38 56,48 62,52 68,48" fill="#FFFFFF" />
  <!-- Base Ground Curve -->
  <ellipse cx="48" cy="74" rx="38" ry="4" fill="#111111" />
  <!-- Typography -->
  <text x="96" y="44" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="25" fill="#111111" letter-spacing="1.5">WEEKEND</text>
  <text x="96" y="70" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="20" fill="#FF6B16" letter-spacing="4">ESCAPES</text>
  <text x="96" y="84" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="500" font-size="8.5" fill="#777777" letter-spacing="2">CRAFTING ADVENTURES</text>
</svg>`;

// Save Logo
fs.writeFileSync('public/logo/weekend-escapes-logo.svg', logoSvg);

// Brush stroke SVGs for section separators
const brushTopSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 80" preserveAspectRatio="none" width="100%" height="80">
  <path d="M0,0 C150,45 350,15 500,48 C680,85 850,22 1050,55 C1220,78 1350,25 1440,40 L1440,80 L0,80 Z" fill="#111111"/>
  <path d="M0,20 C180,60 380,25 580,58 C780,90 980,35 1180,68 C1320,88 1400,38 1440,50 L1440,80 L0,80 Z" fill="#111111" opacity="0.8"/>
  <path d="M0,45 C220,75 420,38 640,68 C860,95 1060,48 1260,74 C1360,86 1420,52 1440,62 L1440,80 L0,80 Z" fill="#111111" opacity="0.9"/>
</svg>`;
fs.writeFileSync('public/images/decorations/brush-stroke-top.svg', brushTopSvg);

const brushBottomSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 80" preserveAspectRatio="none" width="100%" height="80">
  <path d="M0,0 L1440,0 L1440,40 C1350,15 1220,68 1050,35 C850,62 680,15 500,48 C350,20 150,55 0,0 Z" fill="#111111"/>
  <path d="M0,0 L1440,0 L1440,30 C1380,48 1240,15 1080,45 C880,18 720,52 540,25 C360,50 180,20 0,0 Z" fill="#111111" opacity="0.8"/>
</svg>`;
fs.writeFileSync('public/images/decorations/brush-stroke-bottom.svg', brushBottomSvg);

// Torn paper edge SVG
const tornPaperSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 800" preserveAspectRatio="none" width="100" height="800">
  <path d="M100,0 L20,0 L25,40 L15,80 L30,120 L10,160 L28,200 L12,240 L35,280 L18,320 L30,360 L14,400 L32,440 L16,480 L36,520 L20,560 L38,600 L15,640 L32,680 L18,720 L35,760 L22,800 L100,800 Z" fill="#111111"/>
</svg>`;
fs.writeFileSync('public/images/decorations/torn-paper.svg', tornPaperSvg);

// Helper function to build scenic SVG images
function createMountainHeroSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#F97316"/>
        <stop offset="35%" stop-color="#FB923C"/>
        <stop offset="65%" stop-color="#FED7AA"/>
        <stop offset="90%" stop-color="#FEF3C7"/>
        <stop offset="100%" stop-color="#F7F7F5"/>
      </linearGradient>
      <radialGradient id="sunGlow" cx="72%" cy="38%" r="40%">
        <stop offset="0%" stop-color="#FF6B16" stop-opacity="0.95"/>
        <stop offset="45%" stop-color="#F97316" stop-opacity="0.75"/>
        <stop offset="70%" stop-color="#FDBA74" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#FFF" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="farSnow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="40%" stop-color="#E2E8F0"/>
        <stop offset="100%" stop-color="#94A3B8"/>
      </linearGradient>
      <linearGradient id="midSnow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="50%" stop-color="#CBD5E1"/>
        <stop offset="100%" stop-color="#64748B"/>
      </linearGradient>
      <linearGradient id="rockFront" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#334155"/>
        <stop offset="50%" stop-color="#1E293B"/>
        <stop offset="100%" stop-color="#0F172A"/>
      </linearGradient>
      <linearGradient id="closeRock" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1E293B"/>
        <stop offset="100%" stop-color="#0A0A0A"/>
      </linearGradient>
    </defs>

    <!-- Sky Background -->
    <rect width="1920" height="1080" fill="url(#sky)"/>

    <!-- Glowing Sun Disc on the right (matches screenshot) -->
    <circle cx="1380" cy="400" r="300" fill="url(#sunGlow)"/>
    <circle cx="1380" cy="400" r="230" fill="#FF6B16" opacity="0.9"/>
    <circle cx="1380" cy="400" r="226" fill="#FFA500" opacity="0.5"/>

    <!-- Soft Cloud Layers -->
    <path d="M0,450 Q300,410 600,440 T1200,430 T1920,460 L1920,600 L0,600 Z" fill="#FFFFFF" opacity="0.45"/>
    <path d="M0,480 Q450,440 900,470 T1800,460 L1920,480 L1920,650 L0,650 Z" fill="#FFFFFF" opacity="0.6"/>

    <!-- Distant Himalayan Snowy Peaks -->
    <polygon points="150,550 480,260 780,550" fill="url(#farSnow)"/>
    <polygon points="480,260 780,550 780,620 480,620" fill="#94A3B8" opacity="0.7"/>
    <polygon points="650,550 950,220 1280,550" fill="url(#farSnow)"/>
    <polygon points="950,220 1280,550 1280,620 950,620" fill="#64748B" opacity="0.6"/>

    <!-- Primary Dramatic Snow Mountain Range under the Sun -->
    <polygon points="920,650 1320,180 1680,650" fill="url(#midSnow)"/>
    <polygon points="1320,180 1480,380 1680,650 1320,650" fill="#475569" opacity="0.75"/>
    <!-- Ridge Snow highlights -->
    <polygon points="1320,180 1260,340 1310,380 1280,450 1330,480 1300,560 1350,650 1320,650" fill="#FFFFFF"/>

    <polygon points="1450,650 1720,290 1920,580" fill="url(#midSnow)"/>
    <polygon points="1720,290 1860,450 1920,580 1720,650" fill="#334155" opacity="0.7"/>

    <!-- Foreground Mountain & Crags -->
    <path d="M0,720 Q240,620 550,680 T1100,740 L1100,1080 L0,1080 Z" fill="url(#rockFront)"/>
    <path d="M600,760 Q950,660 1400,720 T1920,750 L1920,1080 L600,1080 Z" fill="url(#rockFront)"/>

    <!-- Pine Forest Silhouettes on Left & Middle Slopes -->
    <g fill="#0F172A">
      <polygon points="120,700 115,730 125,730"/><polygon points="140,690 134,730 146,730"/>
      <polygon points="170,680 162,730 178,730"/><polygon points="210,670 200,730 220,730"/>
      <polygon points="260,690 252,740 268,740"/><polygon points="310,660 300,740 320,740"/>
      <polygon points="380,670 370,750 390,750"/><polygon points="460,680 448,760 472,760"/>
      <polygon points="540,695 528,770 552,770"/>
    </g>

    <!-- Flying birds in sky -->
    <g fill="#1E293B" opacity="0.7">
      <path d="M840,280 Q850,270 860,280 Q870,270 880,280 Q860,288 840,280 Z"/>
      <path d="M890,260 Q898,252 906,260 Q914,252 922,260 Q906,267 890,260 Z"/>
      <path d="M820,310 Q826,304 832,310 Q838,304 844,310 Q832,316 820,310 Z"/>
    </g>

    <!-- Foreground Mountain Cliff on Right where Trekker stands (matches screenshot) -->
    <path d="M960,1080 L1080,720 L1260,660 L1420,740 L1680,820 L1920,860 L1920,1080 Z" fill="url(#closeRock)"/>

    <!-- Lone Adventurous Trekker Standing on the Summit Peak (matches screenshot) -->
    <!-- Positioned around (1260, 660) -->
    <g transform="translate(1220, 520) scale(0.95)">
      <!-- Trekker Legs -->
      <path d="M42,105 L36,145 L28,147 L46,147 L48,110 L58,110 L62,145 L54,147 L72,147 L66,105 Z" fill="#1E293B"/>
      <!-- Orange Technical Jacket (Signature Weekend Escapes Orange) -->
      <path d="M32,58 L40,50 L64,50 L72,58 L76,105 L28,105 Z" fill="#FF6B16"/>
      <!-- Backpack on Back -->
      <rect x="18" y="52" width="22" height="42" rx="7" fill="#334155"/>
      <rect x="22" y="56" width="14" height="18" rx="3" fill="#64748B"/>
      <!-- Trekking Pole -->
      <line x1="82" y1="62" x2="88" y2="147" stroke="#94A3B8" stroke-width="2.5"/>
      <circle cx="82" cy="62" r="3" fill="#111"/>
      <!-- Arms & Gloves -->
      <path d="M34,58 L28,88 L34,92" stroke="#FF6B16" stroke-width="7" stroke-linecap="round"/>
      <path d="M70,58 L82,85" stroke="#FF6B16" stroke-width="7" stroke-linecap="round"/>
      <!-- Head & Beanie -->
      <circle cx="52" cy="38" r="11" fill="#111111"/>
      <ellipse cx="52" cy="34" rx="10" ry="7" fill="#334155"/>
    </g>

    <!-- Base Fog blending into next section -->
    <rect y="980" width="1920" height="100" fill="url(#sky)" opacity="0.3"/>
  </svg>`;
}

// Destination scenic cards generator
function createScenicCardSvg(title, primaryColor, accentColor, type) {
  let innerElements = '';
  
  if (type === 'kedarkantha') {
    // Snowy summit and trekking tents
    innerElements = `
      <defs>
        <linearGradient id="kkSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0284C7"/>
          <stop offset="70%" stop-color="#BAE6FD"/>
          <stop offset="100%" stop-color="#F0F9FF"/>
        </linearGradient>
      </defs>
      <rect width="600" height="750" fill="url(#kkSky)"/>
      <polygon points="50,500 300,120 550,500" fill="#FFFFFF"/>
      <polygon points="300,120 420,320 550,500 300,500" fill="#93C5FD" opacity="0.7"/>
      <path d="M0,450 Q200,400 400,440 T600,450 L600,750 L0,750 Z" fill="#E2E8F0"/>
      <!-- Pine Trees -->
      <g fill="#0F172A">
        <polygon points="80,520 70,570 90,570"/><polygon points="120,500 110,560 130,560"/>
        <polygon points="160,530 150,580 170,580"/><polygon points="460,510 450,570 470,570"/>
        <polygon points="510,490 500,560 520,560"/>
      </g>
      <!-- Yellow & Orange Trekking Tents -->
      <polygon points="260,620 290,570 320,620" fill="#FF6B16"/>
      <polygon points="290,570 305,620 320,620" fill="#C2410C"/>
      <polygon points="340,625 370,580 400,625" fill="#EAB308"/>
      <!-- Hikers on Snow -->
      <g fill="#0F172A">
        <circle cx="210" cy="590" r="5"/><line x1="210" y1="595" x2="210" y2="615" stroke="#0F172A" stroke-width="4"/>
        <circle cx="230" cy="592" r="5"/><line x1="230" y1="597" x2="230" y2="617" stroke="#0F172A" stroke-width="4"/>
      </g>
    `;
  } else if (type === 'kashmir') {
    // Dal Lake, Shikara boat & snow reflections
    innerElements = `
      <defs>
        <linearGradient id="kmSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#38BDF8"/>
          <stop offset="50%" stop-color="#FBCFE8"/>
          <stop offset="100%" stop-color="#FEF08A"/>
        </linearGradient>
        <linearGradient id="lake" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0284C7"/>
          <stop offset="100%" stop-color="#0369A1"/>
        </linearGradient>
      </defs>
      <rect width="600" height="750" fill="url(#kmSky)"/>
      <!-- Snow Mountains in Background -->
      <polygon points="0,380 200,160 400,380" fill="#E0F2FE"/>
      <polygon points="250,380 440,180 600,380" fill="#F8FAFC"/>
      <!-- Dal Lake Water -->
      <rect y="380" width="600" height="370" fill="url(#lake)"/>
      <path d="M0,400 Q300,420 600,400 L600,750 L0,750 Z" fill="#0284C7" opacity="0.6"/>
      <!-- Famous Shikara Boat with Canopy -->
      <path d="M120,560 L480,560 L440,610 L160,610 Z" fill="#78350F"/>
      <!-- Canopy/Curtains -->
      <path d="M180,510 L420,510 L410,560 L190,560 Z" fill="#FF6B16"/>
      <rect x="200" y="520" width="200" height="8" fill="#FDE047"/>
      <!-- Boatman with Heart-shaped Oar -->
      <circle cx="450" cy="540" r="8" fill="#1E293B"/>
      <path d="M450,548 L450,575 L430,620" stroke="#78350F" stroke-width="4"/>
      <!-- Water Lilies & Lotus on Lake -->
      <ellipse cx="140" cy="670" rx="30" ry="10" fill="#15803D" opacity="0.8"/>
      <ellipse cx="280" cy="700" rx="40" ry="12" fill="#15803D" opacity="0.8"/>
    `;
  } else if (type === 'manali') {
    // Lush green pines, Beas river, Himalayan peaks
    innerElements = `
      <defs>
        <linearGradient id="mnSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0EA5E9"/>
          <stop offset="60%" stop-color="#BAE6FD"/>
          <stop offset="100%" stop-color="#E0F2FE"/>
        </linearGradient>
      </defs>
      <rect width="600" height="750" fill="url(#mnSky)"/>
      <!-- Snow Crests -->
      <polygon points="100,320 300,100 500,320" fill="#F8FAFC"/>
      <polygon points="300,100 400,240 500,320 300,320" fill="#94A3B8" opacity="0.5"/>
      <!-- Lush Green Pine Slopes -->
      <path d="M0,320 Q250,260 600,340 L600,600 L0,600 Z" fill="#166534"/>
      <path d="M0,420 Q300,360 600,440 L600,750 L0,750 Z" fill="#14532D"/>
      <!-- Beas Rushing River -->
      <path d="M350,450 Q280,560 220,750 L380,750 Q410,580 430,460 Z" fill="#38BDF8"/>
      <path d="M310,520 Q280,620 260,750" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity="0.8"/>
      <!-- Pines Cluster in Foreground -->
      <g fill="#052E16">
        <polygon points="80,520 60,650 100,650"/><polygon points="130,490 105,640 155,640"/>
        <polygon points="500,500 475,650 525,650"/><polygon points="540,530 520,660 560,660"/>
      </g>
    `;
  } else if (type === 'spiti') {
    // High-altitude cold desert, stark canyons, monastery
    innerElements = `
      <defs>
        <linearGradient id="spSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0284C7"/>
          <stop offset="60%" stop-color="#7DD3FC"/>
          <stop offset="100%" stop-color="#FDE047"/>
        </linearGradient>
      </defs>
      <rect width="600" height="750" fill="url(#spSky)"/>
      <!-- Brown Stark Canyon Ridges -->
      <polygon points="0,420 220,180 480,420" fill="#9A3412"/>
      <polygon points="250,420 450,220 600,420" fill="#7C2D12"/>
      <path d="M0,380 Q300,320 600,400 L600,750 L0,750 Z" fill="#C2410C"/>
      <path d="M0,480 Q250,420 600,520 L600,750 L0,750 Z" fill="#9A3412"/>
      <!-- Key Monastery Clifftop Architecture -->
      <rect x="220" y="320" width="80" height="60" fill="#FFFFFF"/>
      <rect x="240" y="290" width="40" height="30" fill="#B91C1C"/>
      <polygon points="230,290 260,260 290,290" fill="#F59E0B"/>
      <!-- Winding Mountain Road -->
      <path d="M120,750 Q280,680 340,620 T420,540" fill="none" stroke="#FDBA74" stroke-width="24" stroke-linecap="round"/>
      <path d="M120,750 Q280,680 340,620 T420,540" fill="none" stroke="#FFFFFF" stroke-dasharray="10 8" stroke-width="3"/>
    `;
  } else if (type === 'bali') {
    // Iconic Ulun Danu Beratan Water Temple
    innerElements = `
      <defs>
        <linearGradient id="baliSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FB923C"/>
          <stop offset="40%" stop-color="#FDE047"/>
          <stop offset="80%" stop-color="#A7F3D0"/>
          <stop offset="100%" stop-color="#0284C7"/>
        </linearGradient>
      </defs>
      <rect width="600" height="750" fill="url(#baliSky)"/>
      <!-- Volcanic Tropical Hills in Mist -->
      <path d="M0,420 Q300,260 600,400 L600,550 L0,550 Z" fill="#065F46" opacity="0.75"/>
      <!-- Calm Lake Water -->
      <rect y="440" width="600" height="310" fill="#0369A1"/>
      <!-- Iconic Balinese Meru Pagoda Roofs -->
      <g fill="#1F2937">
        <!-- Roof 1 (bottom) -->
        <polygon points="200,480 300,440 400,480"/>
        <!-- Roof 2 -->
        <polygon points="220,445 300,410 380,445"/>
        <!-- Roof 3 -->
        <polygon points="240,415 300,385 360,415"/>
        <!-- Roof 4 -->
        <polygon points="255,390 300,365 345,390"/>
        <!-- Roof 5 (top) -->
        <polygon points="270,368 300,345 330,368"/>
        <!-- Spire tip -->
        <line x1="300" y1="345" x2="300" y2="320" stroke="#F59E0B" stroke-width="4"/>
      </g>
      <!-- Base Temple Platform -->
      <rect x="230" y="475" width="140" height="35" fill="#B45309"/>
      <!-- Water Reflection & Lilies -->
      <ellipse cx="300" cy="540" rx="90" ry="12" fill="#047857" opacity="0.6"/>
      <ellipse cx="160" cy="620" rx="40" ry="8" fill="#10B981" opacity="0.7"/>
    `;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 750" width="600" height="750">
    ${innerElements}
    <!-- Vignette / Contrast gradient for text readability -->
    <rect y="450" width="600" height="300" fill="url(#bottomShadow)" opacity="0.75"/>
    <defs>
      <linearGradient id="bottomShadow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0.8"/>
      </linearGradient>
    </defs>
  </svg>`;
}

// Experience cards & backgrounds
function createExperienceBgSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 600" width="1920" height="600">
    <defs>
      <linearGradient id="expSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#111111"/>
        <stop offset="30%" stop-color="#7C2D12"/>
        <stop offset="70%" stop-color="#EA580C"/>
        <stop offset="100%" stop-color="#FF6B16"/>
      </linearGradient>
      <linearGradient id="expFade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#111111" stop-opacity="0.2"/>
        <stop offset="100%" stop-color="#111111" stop-opacity="0.95"/>
      </linearGradient>
    </defs>
    <rect width="1920" height="600" fill="url(#expSky)"/>
    <!-- Golden sunset sun -->
    <circle cx="500" cy="300" r="160" fill="#FFA500" opacity="0.9"/>
    <!-- Mountain Ridges Silhouette -->
    <polygon points="0,500 240,280 500,480" fill="#1C1917"/>
    <polygon points="350,550 700,240 1100,550" fill="#0C0A09"/>
    <polygon points="900,550 1350,300 1750,550" fill="#1C1917"/>
    <polygon points="1500,550 1800,320 1920,450" fill="#0C0A09"/>
    <!-- Two Hikers on Ridge Silhouette (matches screenshot) -->
    <g transform="translate(340, 240) scale(0.7)" fill="#111111">
      <!-- Hiker 1 -->
      <circle cx="50" cy="40" r="9"/>
      <path d="M38,50 L62,50 L66,95 L34,95 Z"/>
      <rect x="25" y="52" width="16" height="35" rx="5"/>
      <line x1="72" y1="58" x2="78" y2="135" stroke="#111" stroke-width="4"/>
      <path d="M42,95 L36,135 L48,135 L52,102 L58,102 L64,135 L76,135 L68,95 Z"/>
      <!-- Hiker 2 -->
      <g transform="translate(90, 10)">
        <circle cx="50" cy="40" r="9"/>
        <path d="M38,50 L62,50 L66,95 L34,95 Z"/>
        <rect x="25" y="52" width="16" height="35" rx="5"/>
        <line x1="72" y1="58" x2="78" y2="135" stroke="#111" stroke-width="4"/>
        <path d="M42,95 L36,135 L48,135 L52,102 L58,102 L64,135 L76,135 L68,95 Z"/>
      </g>
    </g>
    <!-- Overlay darkness for contrast -->
    <rect width="1920" height="600" fill="url(#expFade)"/>
  </svg>`;
}

// Why Choose Us Traveler with Backpack
function createWhyUsTravelerSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 700" width="800" height="700">
    <defs>
      <linearGradient id="whySky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0284C7"/>
        <stop offset="50%" stop-color="#7DD3FC"/>
        <stop offset="100%" stop-color="#FEF08A"/>
      </linearGradient>
    </defs>
    <rect width="800" height="700" fill="url(#whySky)"/>
    <!-- Layered mountain ranges in distance -->
    <polygon points="0,450 350,200 700,450" fill="#64748B"/>
    <polygon points="200,480 500,260 800,480" fill="#475569"/>
    <polygon points="0,520 400,340 800,520" fill="#334155"/>
    <path d="M0,500 Q400,420 800,530 L800,700 L0,700 Z" fill="#1E293B"/>
    <!-- Adventurous Traveler with backpack looking across mountains -->
    <g transform="translate(380, 260) scale(1.6)">
      <!-- Beanie -->
      <circle cx="50" cy="35" r="14" fill="#0F172A"/>
      <ellipse cx="50" cy="32" rx="12" ry="8" fill="#FF6B16"/>
      <!-- Head / Neck -->
      <circle cx="50" cy="42" r="11" fill="#78350F"/>
      <!-- Orange Trekking Jacket -->
      <path d="M25,58 L40,50 L60,50 L75,58 L80,140 L20,140 Z" fill="#FF6B16"/>
      <!-- Big Explorer Backpack -->
      <rect x="28" y="55" width="44" height="70" rx="10" fill="#1E293B"/>
      <rect x="36" y="65" width="28" height="35" rx="5" fill="#334155"/>
      <line x1="32" y1="90" x2="68" y2="90" stroke="#FF6B16" stroke-width="4"/>
      <!-- Straps -->
      <line x1="38" y1="55" x2="30" y2="120" stroke="#0F172A" stroke-width="5"/>
      <line x1="62" y1="55" x2="70" y2="120" stroke="#0F172A" stroke-width="5"/>
    </g>
    <!-- Handwritten text: Travel. Explore. Repeat. -->
    <text x="560" y="420" font-family="'Caveat', cursive, sans-serif" font-size="34" font-weight="700" fill="#FFFFFF" transform="rotate(-8 560 420)">
      Travel.
    </text>
    <text x="575" y="460" font-family="'Caveat', cursive, sans-serif" font-size="34" font-weight="700" fill="#FFFFFF" transform="rotate(-8 575 460)">
      Explore.
    </text>
    <text x="590" y="500" font-family="'Caveat', cursive, sans-serif" font-size="34" font-weight="700" fill="#FF6B16" transform="rotate(-8 590 500)">
      Repeat.
    </text>
  </svg>`;
}

// Orange Camper Van & Route Icons for Booking Process
function createOrangeVanSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120" width="200" height="120">
    <!-- Van Body -->
    <rect x="25" y="30" width="130" height="55" rx="12" fill="#FF6B16"/>
    <!-- Roof Rack with Surfboard / Luggage -->
    <line x1="35" y1="24" x2="135" y2="24" stroke="#111111" stroke-width="4" stroke-linecap="round"/>
    <rect x="45" y="16" width="35" height="8" rx="2" fill="#F59E0B"/>
    <rect x="90" y="18" width="30" height="6" rx="2" fill="#3B82F6"/>
    <!-- Windows -->
    <path d="M40,38 L75,38 L75,56 L40,56 Z" fill="#E0F2FE"/>
    <path d="M85,38 L120,38 L142,56 L85,56 Z" fill="#E0F2FE"/>
    <!-- White Bottom Half Stripe -->
    <rect x="25" y="60" width="130" height="14" fill="#FFFFFF"/>
    <circle cx="152" cy="65" r="5" fill="#FEF08A"/>
    <!-- Wheels -->
    <circle cx="55" cy="85" r="16" fill="#111111"/>
    <circle cx="55" cy="85" r="7" fill="#E5E7EB"/>
    <circle cx="125" cy="85" r="16" fill="#111111"/>
    <circle cx="125" cy="85" r="7" fill="#E5E7EB"/>
  </svg>`;
}

// Gallery and Blog images generator
function createPhotoSvg(label, theme) {
  let bg = '#1E293B';
  let accents = '';
  if (theme === 'campfire') {
    bg = `
      <defs>
        <radialGradient id="fire" cx="50%" cy="80%" r="50%">
          <stop offset="0%" stop-color="#FEF08A"/>
          <stop offset="30%" stop-color="#FF6B16"/>
          <stop offset="60%" stop-color="#9A3412"/>
          <stop offset="100%" stop-color="#0F172A"/>
        </radialGradient>
      </defs>
      <rect width="800" height="600" fill="url(#fire)"/>
      <!-- Campfire logs -->
      <line x1="360" y1="520" x2="440" y2="480" stroke="#78350F" stroke-width="12"/>
      <line x1="440" y1="520" x2="360" y2="480" stroke="#78350F" stroke-width="12"/>
      <!-- Flames -->
      <polygon points="380,500 400,410 420,500" fill="#FEF08A"/>
      <polygon points="370,510 395,430 410,510" fill="#F97316"/>
      <polygon points="400,510 415,440 430,510" fill="#EF4444"/>
      <!-- Friends sitting around fire -->
      <circle cx="300" cy="460" r="16" fill="#1E293B"/><rect x="285" y="480" width="30" height="40" rx="6" fill="#1E293B"/>
      <circle cx="500" cy="460" r="16" fill="#1E293B"/><rect x="485" y="480" width="30" height="40" rx="6" fill="#1E293B"/>
      <!-- Tent in background -->
      <polygon points="120,480 180,390 240,480" fill="#FF6B16"/>
      <!-- Stars in sky -->
      <circle cx="200" cy="120" r="2" fill="#FFF"/><circle cx="450" cy="80" r="2.5" fill="#FFF"/>
      <circle cx="650" cy="140" r="2" fill="#FFF"/><circle cx="720" cy="90" r="2" fill="#FFF"/>
    `;
  } else if (theme === 'sunset-clouds') {
    bg = `
      <defs>
        <linearGradient id="cloudSea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#C2410C"/>
          <stop offset="35%" stop-color="#FB923C"/>
          <stop offset="70%" stop-color="#FEF08A"/>
          <stop offset="100%" stop-color="#CBD5E1"/>
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#cloudSea)"/>
      <circle cx="400" cy="220" r="120" fill="#FFF7ED" opacity="0.9"/>
      <!-- Billowing clouds below summit -->
      <path d="M0,380 Q100,340 220,370 T440,360 T660,370 T800,350 L800,600 L0,600 Z" fill="#F8FAFC" opacity="0.9"/>
      <path d="M0,420 Q160,390 320,430 T640,410 T800,430 L800,600 L0,600 Z" fill="#E2E8F0"/>
    `;
  } else if (theme === 'portrait-priya') {
    bg = `
      <defs>
        <linearGradient id="ptPriya" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0284C7"/>
          <stop offset="100%" stop-color="#38BDF8"/>
        </linearGradient>
      </defs>
      <rect width="500" height="500" fill="url(#ptPriya)"/>
      <!-- Mountains behind -->
      <polygon points="50,300 250,150 450,300" fill="#E0F2FE"/>
      <!-- Hiker Person Avatar -->
      <circle cx="250" cy="190" r="60" fill="#FDBA74"/>
      <!-- Beanie -->
      <ellipse cx="250" cy="155" rx="55" ry="30" fill="#1E293B"/>
      <circle cx="250" cy="125" r="10" fill="#FF6B16"/>
      <!-- Big Puffer Jacket -->
      <path d="M120,290 Q250,240 380,290 L400,500 L100,500 Z" fill="#111111"/>
      <path d="M220,290 L250,340 L280,290 Z" fill="#FF6B16"/>
    `;
  } else if (theme === 'portrait-rahul') {
    bg = `
      <defs>
        <linearGradient id="ptRahul" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#166534"/>
          <stop offset="100%" stop-color="#4ADE80"/>
        </linearGradient>
      </defs>
      <rect width="500" height="500" fill="url(#ptRahul)"/>
      <!-- Two trekking friends smiling -->
      <circle cx="180" cy="200" r="50" fill="#FDBA74"/>
      <path d="M90,290 Q180,250 260,290 L270,500 L80,500 Z" fill="#FF6B16"/>
      <circle cx="320" cy="210" r="50" fill="#FED7AA"/>
      <path d="M240,300 Q320,260 410,300 L420,500 L230,500 Z" fill="#0284C7"/>
    `;
  } else if (theme === 'portrait-sneha') {
    bg = `
      <defs>
        <linearGradient id="ptSneha" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#EA580C"/>
          <stop offset="100%" stop-color="#FDE047"/>
        </linearGradient>
      </defs>
      <rect width="500" height="500" fill="url(#ptSneha)"/>
      <circle cx="250" cy="190" r="60" fill="#FDBA74"/>
      <!-- Bucket hat / Sun hat -->
      <ellipse cx="250" cy="160" rx="75" ry="24" fill="#D97706"/>
      <path d="M120,300 Q250,260 380,300 L400,500 L100,500 Z" fill="#0D9488"/>
    `;
  } else {
    bg = `
      <rect width="800" height="600" fill="#1E293B"/>
      <polygon points="100,500 400,200 700,500" fill="#475569"/>
      <polygon points="400,200 550,350 700,500 400,500" fill="#334155"/>
      <rect y="460" width="800" height="140" fill="#0F172A"/>
    `;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
    ${bg}
  </svg>`;
}

// Final CTA Panoramic Mountain Sunset
function createCtaMountainSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 600" width="1920" height="600">
    <defs>
      <linearGradient id="ctaSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#431407"/>
        <stop offset="30%" stop-color="#9A3412"/>
        <stop offset="60%" stop-color="#EA580C"/>
        <stop offset="85%" stop-color="#FF6B16"/>
        <stop offset="100%" stop-color="#111111"/>
      </linearGradient>
    </defs>
    <rect width="1920" height="600" fill="url(#ctaSky)"/>
    <!-- Deep sunset glowing sun -->
    <circle cx="960" cy="380" r="220" fill="#FEF08A" opacity="0.6"/>
    <!-- Dramatic black mountain silhouettes -->
    <polygon points="0,550 320,280 650,550" fill="#1C1917"/>
    <polygon points="450,550 820,220 1200,550" fill="#0A0A0A"/>
    <polygon points="980,550 1420,240 1850,550" fill="#1C1917"/>
    <polygon points="1600,550 1820,310 1920,400" fill="#0A0A0A"/>
    <rect y="480" width="1920" height="120" fill="#111111"/>
  </svg>`;
}

async function renderAssets() {
  console.log('Rendering high resolution webp images...');

  // 1. Logo
  const logoBuffer = Buffer.from(logoSvg);
  await sharp(logoBuffer).png().toFile('public/logo/weekend-escapes-logo.png');

  // 2. Hero Mountain & Trekker
  const heroSvg = createMountainHeroSvg();
  fs.writeFileSync('public/images/hero/hero-mountain.svg', heroSvg);
  await sharp(Buffer.from(heroSvg)).webp({ quality: 90 }).toFile('public/images/hero/hero-mountain.webp');
  await sharp(Buffer.from(heroSvg)).webp({ quality: 90 }).toFile('public/images/hero/hero-trekker.webp');

  // 3. Destinations
  const destinations = ['kedarkantha', 'kashmir', 'manali', 'spiti', 'bali'];
  for (const dest of destinations) {
    const svg = createScenicCardSvg(dest, '#FF6B16', '#FFFFFF', dest);
    fs.writeFileSync(`public/images/destinations/${dest}.svg`, svg);
    await sharp(Buffer.from(svg)).webp({ quality: 88 }).toFile(`public/images/destinations/${dest}.webp`);
  }

  // 4. Packages
  const packages = [
    { id: 'kedarkantha-trek', type: 'kedarkantha' },
    { id: 'kashmir-getaway', type: 'kashmir' },
    { id: 'manali-adventure', type: 'manali' },
    { id: 'bali-escape', type: 'bali' }
  ];
  for (const pkg of packages) {
    const svg = createScenicCardSvg(pkg.id, '#FF6B16', '#FFFFFF', pkg.type);
    fs.writeFileSync(`public/images/packages/${pkg.id}.svg`, svg);
    await sharp(Buffer.from(svg)).webp({ quality: 88 }).toFile(`public/images/packages/${pkg.id}.webp`);
  }

  // 5. Experiences
  const expBgSvg = createExperienceBgSvg();
  fs.writeFileSync('public/images/experiences/experience-bg.svg', expBgSvg);
  await sharp(Buffer.from(expBgSvg)).webp({ quality: 88 }).toFile('public/images/experiences/experience-bg.webp');

  const exps = ['trekking', 'adventure', 'honeymoon', 'family', 'group', 'international'];
  for (const exp of exps) {
    const svg = createScenicCardSvg(exp, '#FF6B16', '#FFFFFF', 'kedarkantha');
    await sharp(Buffer.from(svg)).webp({ quality: 80 }).toFile(`public/images/experiences/${exp}.webp`);
  }

  // 6. Why Us
  const whyUsSvg = createWhyUsTravelerSvg();
  fs.writeFileSync('public/images/why-us/why-us-traveler.svg', whyUsSvg);
  await sharp(Buffer.from(whyUsSvg)).webp({ quality: 88 }).toFile('public/images/why-us/why-us-traveler.webp');

  // 7. Booking Process
  const vanSvg = createOrangeVanSvg();
  fs.writeFileSync('public/images/process/orange-van.svg', vanSvg);
  await sharp(Buffer.from(vanSvg)).webp({ quality: 90 }).toFile('public/images/process/orange-van.webp');

  for (const step of ['step-explore', 'step-plan', 'step-book', 'step-travel']) {
    await sharp(Buffer.from(vanSvg)).webp({ quality: 80 }).toFile(`public/images/process/${step}.webp`);
  }

  // 8. Testimonials
  const testimonials = [
    { id: 'priya-sharma', theme: 'portrait-priya' },
    { id: 'rahul-verma', theme: 'portrait-rahul' },
    { id: 'sneha-patel', theme: 'portrait-sneha' }
  ];
  for (const t of testimonials) {
    const svg = createPhotoSvg(t.id, t.theme);
    fs.writeFileSync(`public/images/testimonials/${t.id}.svg`, svg);
    await sharp(Buffer.from(svg)).webp({ quality: 88 }).toFile(`public/images/testimonials/${t.id}.webp`);
  }

  // 9. Gallery
  const galleryItems = [
    { id: 'gallery-1', theme: 'kedarkantha' },
    { id: 'gallery-2', theme: 'kashmir' },
    { id: 'gallery-3', theme: 'campfire' },
    { id: 'gallery-4', theme: 'sunset-clouds' },
    { id: 'gallery-5', theme: 'manali' },
    { id: 'gallery-6', theme: 'bali' }
  ];
  for (const g of galleryItems) {
    const svg = (g.theme === 'campfire' || g.theme === 'sunset-clouds')
      ? createPhotoSvg(g.id, g.theme)
      : createScenicCardSvg(g.id, '#FF6B16', '#FFF', g.theme);
    fs.writeFileSync(`public/images/gallery/${g.id}.svg`, svg);
    await sharp(Buffer.from(svg)).webp({ quality: 88 }).toFile(`public/images/gallery/${g.id}.webp`);
  }

  // 10. Blogs
  const blogs = [
    { id: 'blog-kedarkantha', theme: 'kedarkantha' },
    { id: 'blog-kashmir', theme: 'kashmir' },
    { id: 'blog-bali', theme: 'bali' }
  ];
  for (const b of blogs) {
    const svg = createScenicCardSvg(b.id, '#FF6B16', '#FFF', b.theme);
    fs.writeFileSync(`public/images/blogs/${b.id}.svg`, svg);
    await sharp(Buffer.from(svg)).webp({ quality: 88 }).toFile(`public/images/blogs/${b.id}.webp`);
  }

  // 11. Final CTA
  const ctaSvg = createCtaMountainSvg();
  fs.writeFileSync('public/images/cta/cta-mountain.svg', ctaSvg);
  await sharp(Buffer.from(ctaSvg)).webp({ quality: 88 }).toFile('public/images/cta/cta-mountain.webp');

  console.log('All image assets generated successfully in public/images/!');
}

renderAssets().catch(err => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
