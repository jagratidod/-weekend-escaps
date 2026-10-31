import fs from 'fs';

// Highly detailed hand-painted brush stroke matching user screenshot media_1793382287434_e37f6c46.png
// Width: 1920, Height: 140
// Features:
// - Uneven, organic hand-painted brush stroke edge
// - Random dry-brush paint streaks and torn-paper textures
// - Black brush strokes (#111111) mixed with white gaps
// - Extended flick strokes at varying heights (y=8 to y=110)
// - Frayed bristle ends on left and right edges

function generateHeroBrushSvg(fillColor = "#111111", bgColor = "#F7F7F5") {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 140" width="100%" height="100%" preserveAspectRatio="none">
  <!-- Solid bottom base connecting into next section -->
  <path d="M0,140 L1920,140 L1920,95 L0,95 Z" fill="${fillColor}"/>

  <!-- Main Heavy Dry-Brush Paint Body with Uneven Peaks and Dips -->
  <path d="
    M-10,140 
    L-10,48
    C45,35 110,65 180,42
    C240,22 310,58 390,38
    C470,18 530,62 610,45
    C690,28 760,70 840,40
    C920,12 990,68 1080,35
    C1160,10 1240,55 1320,28
    C1400,8 1470,60 1560,32
    C1650,15 1730,52 1810,25
    C1870,12 1910,45 1930,30
    L1930,140 Z
  " fill="${fillColor}"/>

  <!-- Layer 2: Extended Jagged Bristle Peaks & Dry Paint Slashes at Different Heights -->
  <path d="
    M0,60
    C80,32 140,78 220,25
    C260,8 310,42 360,18
    C410,-2 460,55 520,22
    C580,5 640,65 710,15
    C780,2 830,58 890,26
    C960,8 1020,62 1090,14
    C1150,-4 1220,52 1280,20
    C1350,6 1420,65 1490,18
    C1560,4 1630,58 1710,22
    C1780,5 1840,48 1920,15
    L1920,85 L0,85 Z
  " fill="${fillColor}"/>

  <!-- Layer 3: Extended Bristle Strokes protruding higher (matches screenshot) -->
  <!-- Left high flick -->
  <path d="M40,55 Q120,8 240,32 Q160,18 80,48 Z" fill="${fillColor}"/>
  <path d="M110,38 Q180,5 290,28 Q200,12 130,42 Z" fill="${fillColor}"/>
  <path d="M260,30 Q340,-2 430,22 Q350,8 280,35 Z" fill="${fillColor}"/>

  <!-- Mid-left flick strokes -->
  <path d="M480,35 Q560,2 660,25 Q570,12 500,40 Z" fill="${fillColor}"/>
  <path d="M620,28 Q700,-6 810,20 Q710,6 640,35 Z" fill="${fillColor}"/>
  <path d="M780,32 Q860,4 960,24 Q870,12 800,38 Z" fill="${fillColor}"/>

  <!-- Center & Mid-right high flick strokes -->
  <path d="M940,26 Q1030,-8 1140,18 Q1040,4 960,32 Z" fill="${fillColor}"/>
  <path d="M1100,24 Q1190,-10 1310,16 Q1200,2 1120,30 Z" fill="${fillColor}"/>
  <path d="M1260,28 Q1350,-4 1460,22 Q1360,6 1280,35 Z" fill="${fillColor}"/>

  <!-- Right sweeping high brush flick strokes -->
  <path d="M1420,30 Q1520,-2 1630,20 Q1530,6 1440,36 Z" fill="${fillColor}"/>
  <path d="M1580,24 Q1680,-8 1790,15 Q1690,2 1600,30 Z" fill="${fillColor}"/>
  <path d="M1740,22 Q1830,-12 1930,12 Q1840,-2 1760,28 Z" fill="${fillColor}"/>

  <!-- Fine Dry-Brush Filament Lines (Horizontal Paint Scratch Marks) -->
  <g stroke="${fillColor}" stroke-linecap="round" fill="none">
    <path d="M20,24 Q90,16 160,28" stroke-width="2.5"/>
    <path d="M80,18 Q170,8 250,22" stroke-width="1.8"/>
    <path d="M210,14 Q300,5 380,18" stroke-width="2.2"/>
    <path d="M350,12 Q440,2 530,15" stroke-width="1.5"/>
    <path d="M510,10 Q600,0 690,14" stroke-width="2.8"/>
    <path d="M670,8 Q760,-2 850,12" stroke-width="1.8"/>
    <path d="M830,12 Q920,2 1010,16" stroke-width="2.4"/>
    <path d="M990,6 Q1080,-4 1180,10" stroke-width="3"/>
    <path d="M1160,8 Q1250,-2 1350,12" stroke-width="1.6"/>
    <path d="M1330,10 Q1420,0 1520,15" stroke-width="2.5"/>
    <path d="M1500,8 Q1600,-4 1700,12" stroke-width="2.2"/>
    <path d="M1680,6 Q1780,-6 1880,10" stroke-width="2.8"/>
  </g>

  <!-- Cutout Gaps / Dry-brush Skips where canvas / background shows through (matches screenshot) -->
  <!-- These are shaped cutouts in the paint body -->
  <g fill="${bgColor}">
    <!-- Slits and paint gaps -->
    <path d="M120,68 Q180,62 250,70 Q190,74 120,68 Z"/>
    <path d="M310,64 Q380,58 460,66 Q390,70 310,64 Z"/>
    <path d="M540,62 Q610,56 690,64 Q620,68 540,62 Z"/>
    <path d="M760,66 Q830,60 910,68 Q840,72 760,66 Z"/>
    <path d="M980,60 Q1060,54 1140,62 Q1070,66 980,60 Z"/>
    <path d="M1210,64 Q1290,58 1380,66 Q1300,70 1210,64 Z"/>
    <path d="M1440,62 Q1520,56 1610,65 Q1530,69 1440,62 Z"/>
    <path d="M1670,58 Q1750,52 1840,60 Q1760,65 1670,58 Z"/>

    <!-- Smaller micro dry gaps -->
    <ellipse cx="180" cy="54" rx="16" ry="2"/>
    <ellipse cx="390" cy="50" rx="20" ry="2.5"/>
    <ellipse cx="610" cy="48" rx="24" ry="2"/>
    <ellipse cx="840" cy="52" rx="18" ry="2.5"/>
    <ellipse cx="1060" cy="46" rx="22" ry="2"/>
    <ellipse cx="1290" cy="50" rx="25" ry="2.5"/>
    <ellipse cx="1520" cy="48" rx="20" ry="2"/>
    <ellipse cx="1740" cy="44" rx="22" ry="2.5"/>
  </g>

  <!-- Splatter Flecks & Dry Brush Bristle Tips -->
  <g fill="${fillColor}">
    <circle cx="95" cy="18" r="2.5"/>
    <circle cx="150" cy="12" r="1.8"/>
    <circle cx="230" cy="8" r="2.2"/>
    <circle cx="340" cy="6" r="3"/>
    <circle cx="470" cy="4" r="2"/>
    <circle cx="590" cy="2" r="2.6"/>
    <circle cx="720" cy="4" r="2.2"/>
    <circle cx="860" cy="6" r="3.2"/>
    <circle cx="1010" cy="1" r="2"/>
    <circle cx="1150" cy="3" r="2.8"/>
    <circle cx="1280" cy="5" r="2.4"/>
    <circle cx="1420" cy="2" r="3"/>
    <circle cx="1560" cy="4" r="2.2"/>
    <circle cx="1710" cy="2" r="2.8"/>
    <circle cx="1850" cy="1" r="3.2"/>
  </g>
</svg>`;
}

// Generate the bottom brush stroke:
// 1. Black brush stroke going into light (#F7F7F5)
const heroBrushSvg = generateHeroBrushSvg("#111111", "#F7F7F5");
fs.writeFileSync('public/images/decorations/hero-brush-bottom.svg', heroBrushSvg);

// 2. Inverted version for transition from white to black:
// Used as top border of black sections
const brushTopSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 140" width="100%" height="100%" preserveAspectRatio="none">
  <!-- Same detailed brush stroke as top border of black section -->
  ${generateHeroBrushSvg("#111111", "#F7F7F5").replace('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 140" width="100%" height="100%" preserveAspectRatio="none">', '').replace('</svg>', '')}
</svg>`;
fs.writeFileSync('public/images/decorations/brush-stroke-top.svg', brushTopSvg);

console.log('Generated highly detailed hand-painted brush stroke SVG assets successfully!');
