import fs from 'fs';
import sharp from 'sharp';

// 1. Mountain Background without trekker
function createMountainHeroBgSvg() {
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

    <!-- Foreground Mountain Slopes -->
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
  </svg>`;
}

// 2. Isolated Trekker on Rocky Cliff with Transparent Background
function createIsolatedTrekkerSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 850" width="700" height="850">
    <defs>
      <linearGradient id="cragRock" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#334155"/>
        <stop offset="50%" stop-color="#1E293B"/>
        <stop offset="100%" stop-color="#0F172A"/>
      </linearGradient>
      <linearGradient id="jacketGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FF7A29"/>
        <stop offset="100%" stop-color="#E05505"/>
      </linearGradient>
      <linearGradient id="packGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#475569"/>
        <stop offset="100%" stop-color="#1E293B"/>
      </linearGradient>
    </defs>

    <!-- Rocky Mountain Crag / Pinnacle Peak -->
    <path d="M40,850 L180,480 L340,380 L520,440 L680,600 L700,850 Z" fill="url(#cragRock)"/>
    <polygon points="340,380 420,430 380,560 260,540" fill="#475569" opacity="0.6"/>
    <polygon points="180,480 340,380 260,540 140,620" fill="#0F172A"/>

    <!-- Rock Detail Ridges -->
    <line x1="280" y1="440" x2="350" y2="520" stroke="#64748B" stroke-width="3" stroke-linecap="round"/>
    <line x1="380" y1="460" x2="480" y2="580" stroke="#64748B" stroke-width="4" stroke-linecap="round"/>
    <line x1="180" y1="580" x2="260" y2="700" stroke="#64748B" stroke-width="3" stroke-linecap="round"/>

    <!-- Lone Adventurous Trekker Standing on the Summit Pinnacle -->
    <g transform="translate(260, 110) scale(1.75)">
      <!-- Boots & Legs -->
      <!-- Left leg -->
      <path d="M42,95 L34,142 L24,147 L46,147 L48,102" fill="#1E293B"/>
      <!-- Right leg forward on rock -->
      <path d="M56,98 L64,138 L54,144 L74,144 L68,98" fill="#1E293B"/>

      <!-- Orange Technical Mountaineering Jacket -->
      <path d="M30,52 L40,44 L64,44 L74,52 L78,98 L26,98 Z" fill="url(#jacketGrad)"/>
      <line x1="52" y1="46" x2="52" y2="98" stroke="#D9480F" stroke-width="2.5"/>

      <!-- Backpack on Back -->
      <rect x="14" y="46" width="24" height="46" rx="8" fill="url(#packGrad)"/>
      <rect x="18" y="52" width="16" height="20" rx="3" fill="#64748B"/>
      <!-- Sleeping bag roll attached to bottom of backpack -->
      <rect x="12" y="90" width="26" height="8" rx="3" fill="#3B82F6"/>

      <!-- Trekking Pole / Hiking Stick in Hand -->
      <line x1="86" y1="58" x2="94" y2="147" stroke="#CBD5E1" stroke-width="3"/>
      <circle cx="86" cy="58" r="4" fill="#0F172A"/>

      <!-- Arms in orange sleeves -->
      <path d="M32,54 L26,82 L32,86" stroke="#FF6B16" stroke-width="8" stroke-linecap="round"/>
      <path d="M72,54 L86,80" stroke="#FF6B16" stroke-width="8" stroke-linecap="round"/>

      <!-- Head & Beanie -->
      <circle cx="52" cy="32" r="12" fill="#0F172A"/>
      <ellipse cx="52" cy="28" rx="11" ry="8" fill="#475569"/>
    </g>
  </svg>`;
}

async function run() {
  console.log('Generating updated hero assets...');
  
  // 1. Mountain Bg
  const bgSvg = createMountainHeroBgSvg();
  fs.writeFileSync('public/images/hero/hero-mountain.svg', bgSvg);
  await sharp(Buffer.from(bgSvg)).webp({ quality: 90 }).toFile('public/images/hero/hero-mountain.webp');
  
  // 2. Trekker Foreground
  const trekkerSvg = createIsolatedTrekkerSvg();
  fs.writeFileSync('public/images/hero/hero-trekker.svg', trekkerSvg);
  await sharp(Buffer.from(trekkerSvg)).webp({ quality: 92 }).toFile('public/images/hero/hero-trekker.webp');
  
  console.log('Hero assets generated successfully!');
}

run();
