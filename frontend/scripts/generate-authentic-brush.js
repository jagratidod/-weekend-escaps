import fs from 'fs';

// Highly detailed hand-painted brush stroke SVG asset
// Matching media_1793382287434_e37f6c46.png
// ViewBox: 0 0 1920 180

function createHandPaintedBrushSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 180" width="100%" height="100%" preserveAspectRatio="none">
  <defs>
    <!-- Organic Brush Texture Filter for Torn Paper & Dry Paint Effect -->
    <filter id="brushRough" x="-5%" y="-10%" width="110%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04 0.08" numOctaves="4" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </defs>

  <!-- Solid Bottom Bar connecting seamlessly to the next section -->
  <rect y="125" width="1920" height="55" fill="#111111"/>

  <!-- Main Organic Heavy Paint Stroke Body (Rough Hand-Painted Edge) -->
  <path d="
    M-10,180
    L-10,75
    C35,68 85,92 140,65
    C195,45 250,88 320,52
    C380,32 440,78 510,48
    C575,30 635,82 710,42
    C780,24 845,76 920,38
    C995,20 1060,72 1140,35
    C1215,18 1280,68 1360,32
    C1430,16 1500,64 1580,28
    C1650,14 1720,58 1800,22
    C1860,12 1910,48 1930,30
    L1930,180 Z
  " fill="#111111" filter="url(#brushRough)"/>

  <!-- Layer 2: Uneven Organic Secondary Paint Layer with jagged torn-paper transitions -->
  <path d="
    M-10,180
    L-10,88
    C60,55 120,98 200,60
    C270,38 340,82 420,48
    C490,26 560,74 640,38
    C710,18 780,68 860,32
    C930,15 1010,62 1090,28
    C1170,12 1240,58 1320,24
    C1390,10 1460,54 1540,20
    C1610,8 1690,48 1770,16
    C1840,8 1900,38 1930,22
    L1930,180 Z
  " fill="#111111"/>

  <!-- Layer 3: Extended Brush Strokes at Different Heights (matches screenshot & instructions) -->
  <!-- Left Peaks (heights y=25 to y=55) -->
  <path d="M25,72 Q90,22 180,48 Q110,32 45,68 Z" fill="#111111"/>
  <path d="M95,58 Q165,12 260,38 Q180,22 120,52 Z" fill="#111111"/>
  <path d="M190,48 Q270,6 380,32 Q290,18 220,42 Z" fill="#111111"/>
  <path d="M300,42 Q390,2 500,28 Q405,14 330,38 Z" fill="#111111"/>

  <!-- Center Peaks (heights y=15 to y=45) -->
  <path d="M480,40 Q580,4 690,25 Q590,14 515,35 Z" fill="#111111"/>
  <path d="M630,32 Q740,-4 850,22 Q750,8 665,28 Z" fill="#111111"/>
  <path d="M790,28 Q900,-8 1020,18 Q915,4 825,24 Z" fill="#111111"/>
  <path d="M960,25 Q1070,-10 1190,16 Q1085,2 995,22 Z" fill="#111111"/>

  <!-- Right Peaks (heights y=10 to y=35) sweeping upward -->
  <path d="M1130,24 Q1240,-12 1360,15 Q1255,0 1165,20 Z" fill="#111111"/>
  <path d="M1300,22 Q1410,-8 1530,14 Q1425,2 1335,18 Z" fill="#111111"/>
  <path d="M1470,20 Q1580,-6 1700,12 Q1595,2 1505,16 Z" fill="#111111"/>
  <path d="M1640,16 Q1750,-10 1870,8 Q1765,0 1675,14 Z" fill="#111111"/>
  <path d="M1780,12 Q1860,-12 1930,6 Q1850,0 1800,10 Z" fill="#111111"/>

  <!-- Layer 4: Fine Dry-Brush Bristle Filament Lines (Horizontal Paint Scratch Marks) -->
  <g stroke="#111111" stroke-linecap="round" fill="none">
    <path d="M15,35 Q90,25 170,38" stroke-width="2.5"/>
    <path d="M70,28 Q160,15 250,30" stroke-width="1.8"/>
    <path d="M160,22 Q260,10 360,24" stroke-width="2.2"/>
    <path d="M280,16 Q390,6 490,20" stroke-width="1.6"/>
    <path d="M430,14 Q540,2 640,18" stroke-width="2.6"/>
    <path d="M580,10 Q690,-2 800,15" stroke-width="1.8"/>
    <path d="M740,8 Q850,-4 960,12" stroke-width="2.4"/>
    <path d="M910,6 Q1020,-6 1130,10" stroke-width="3"/>
    <path d="M1080,8 Q1190,-2 1300,12" stroke-width="1.6"/>
    <path d="M1250,6 Q1360,-4 1470,10" stroke-width="2.2"/>
    <path d="M1420,8 Q1530,-2 1640,12" stroke-width="1.8"/>
    <path d="M1590,6 Q1700,-6 1810,8" stroke-width="2.5"/>
    <path d="M1750,4 Q1840,-8 1920,6" stroke-width="2.8"/>
  </g>

  <!-- Layer 5: Cutout Gaps / Dry-Brush Paint Skips where white/canvas gaps show through (matches screenshot) -->
  <g fill="#F7F7F5" opacity="0.95">
    <!-- Horizontal dry slits and gaps -->
    <path d="M80,85 Q160,78 240,86 Q170,90 80,85 Z"/>
    <path d="M220,78 Q310,70 400,80 Q320,84 220,78 Z"/>
    <path d="M380,72 Q470,64 560,74 Q480,78 380,72 Z"/>
    <path d="M540,68 Q640,60 730,70 Q650,74 540,68 Z"/>
    <path d="M720,65 Q820,56 920,66 Q830,70 720,65 Z"/>
    <path d="M900,62 Q1000,54 1100,64 Q1010,68 900,62 Z"/>
    <path d="M1080,58 Q1180,50 1280,60 Q1190,64 1080,58 Z"/>
    <path d="M1260,55 Q1360,46 1460,56 Q1370,60 1260,55 Z"/>
    <path d="M1440,52 Q1540,44 1640,54 Q1550,58 1440,52 Z"/>
    <path d="M1620,48 Q1720,40 1820,50 Q1730,54 1620,48 Z"/>

    <!-- Micro dry-brush pores -->
    <ellipse cx="150,68" rx="18" ry="2"/>
    <ellipse cx="320,62" rx="22" ry="2.5"/>
    <ellipse cx="490,58" rx="25" ry="2"/>
    <ellipse cx="670,54" rx="20" ry="2.5"/>
    <ellipse cx="850,50" rx="26" ry="2"/>
    <ellipse cx="1030,46" rx="24" ry="2"/>
    <ellipse cx="1210,44" rx="28" ry="2.5"/>
    <ellipse cx="1390,42" rx="22" ry="2"/>
    <ellipse cx="1570,38" rx="25" ry="2.5"/>
    <ellipse cx="1750,35" rx="20" ry="2"/>
  </g>

  <!-- Layer 6: Dry Brush Splatters & Frayed Bristle Tips -->
  <g fill="#111111">
    <circle cx="65" cy="28" r="2.2"/>
    <circle cx="130" cy="18" r="1.6"/>
    <circle cx="210" cy="12" r="2"/>
    <circle cx="310" cy="8" r="2.5"/>
    <circle cx="420" cy="5" r="1.8"/>
    <circle cx="550" cy="3" r="2.4"/>
    <circle cx="680" cy="2" r="2"/>
    <circle cx="820" cy="4" r="2.6"/>
    <circle cx="970" cy="1" r="1.8"/>
    <circle cx="1110" cy="2" r="2.5"/>
    <circle cx="1240" cy="3" r="2"/>
    <circle cx="1380" cy="1" r="2.8"/>
    <circle cx="1520" cy="3" r="2"/>
    <circle cx="1660" cy="2" r="2.5"/>
    <circle cx="1800" cy="1" r="2.8"/>
    <circle cx="1890" cy="2" r="3"/>
  </g>
</svg>`;
}

const svgContent = createHandPaintedBrushSvg();
fs.writeFileSync('public/images/decorations/hero-brush-bottom.svg', svgContent);
fs.writeFileSync('public/images/decorations/brush-stroke-bottom.svg', svgContent);

console.log('Saved authentic hand-painted brush stroke SVG asset!');
