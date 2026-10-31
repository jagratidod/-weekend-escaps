import fs from 'fs';

// 1. Bristles pointing UPWARDS (solid at bottom y=180, bristles reaching up towards y=0)
const brushUp = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 160" width="100%" height="100%" preserveAspectRatio="none">
  <!-- Solid Bottom Bar -->
  <rect y="110" width="1920" height="50" fill="#111111"/>

  <!-- Main Organic Heavy Paint Stroke Body -->
  <path d="
    M-10,160 
    L-10,65
    C35,55 90,82 150,55
    C210,35 270,78 340,48
    C410,28 470,72 550,42
    C620,25 680,78 760,38
    C830,20 900,72 980,32
    C1050,15 1120,68 1200,28
    C1270,12 1340,62 1420,25
    C1490,10 1560,58 1640,22
    C1710,8 1780,52 1860,18
    C1900,10 1920,40 1930,25
    L1930,160 Z
  " fill="#111111"/>

  <!-- Extended Brush Strokes at Different Heights (y=5 to y=45) -->
  <path d="M30,65 Q100,15 200,45 Q120,28 50,60 Z" fill="#111111"/>
  <path d="M120,52 Q200,8 300,35 Q210,18 145,46 Z" fill="#111111"/>
  <path d="M230,42 Q320,2 430,28 Q335,14 260,38 Z" fill="#111111"/>
  <path d="M380,36 Q480,-4 590,24 Q490,12 415,32 Z" fill="#111111"/>
  <path d="M540,30 Q650,-8 760,20 Q660,8 580,26 Z" fill="#111111"/>
  <path d="M710,25 Q820,-12 940,16 Q835,4 750,22 Z" fill="#111111"/>
  <path d="M890,22 Q1000,-14 1120,14 Q1015,2 930,20 Z" fill="#111111"/>
  <path d="M1070,20 Q1180,-10 1300,15 Q1195,4 1110,18 Z" fill="#111111"/>
  <path d="M1250,18 Q1360,-8 1480,14 Q1375,4 1290,16 Z" fill="#111111"/>
  <path d="M1430,16 Q1540,-12 1660,12 Q1555,2 1470,15 Z" fill="#111111"/>
  <path d="M1610,14 Q1720,-14 1840,10 Q1735,0 1650,12 Z" fill="#111111"/>
  <path d="M1780,10 Q1860,-12 1930,8 Q1850,0 1800,8 Z" fill="#111111"/>

  <!-- Horizontal Dry-Brush Bristle Filaments -->
  <g stroke="#111111" stroke-linecap="round" fill="none">
    <path d="M20,30 Q90,20 170,32" stroke-width="2.5"/>
    <path d="M90,22 Q180,12 270,25" stroke-width="1.8"/>
    <path d="M220,16 Q320,6 420,18" stroke-width="2.4"/>
    <path d="M370,12 Q480,2 580,15" stroke-width="1.6"/>
    <path d="M530,8 Q640,-2 740,12" stroke-width="2.6"/>
    <path d="M700,6 Q810,-4 910,10" stroke-width="2"/>
    <path d="M870,5 Q980,-6 1080,8" stroke-width="2.8"/>
    <path d="M1050,6 Q1160,-4 1260,10" stroke-width="1.8"/>
    <path d="M1220,8 Q1330,-2 1430,12" stroke-width="2.4"/>
    <path d="M1400,6 Q1510,-4 1610,10" stroke-width="1.8"/>
    <path d="M1580,5 Q1690,-6 1790,8" stroke-width="2.5"/>
    <path d="M1740,4 Q1830,-8 1920,6" stroke-width="2.8"/>
  </g>

  <!-- Splatter Flecks -->
  <g fill="#111111">
    <circle cx="85" cy="18" r="2.2"/><circle cx="170" cy="10" r="1.8"/>
    <circle cx="280" cy="5" r="2.4"/><circle cx="410" cy="3" r="2"/>
    <circle cx="560" cy="2" r="2.8"/><circle cx="730" cy="1" r="2"/>
    <circle cx="910" cy="3" r="2.5"/><circle cx="1090" cy="2" r="1.8"/>
    <circle cx="1270" cy="3" r="2.4"/><circle cx="1450" cy="1" r="2.6"/>
    <circle cx="1630" cy="2" r="2.2"/><circle cx="1810" cy="1" r="3"/>
  </g>
</svg>`;

// 2. Bristles pointing DOWNWARDS (solid at top y=0, bristles reaching down towards y=160 into the next section)
const brushDown = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 160" width="100%" height="100%" preserveAspectRatio="none">
  <!-- Solid Top Bar -->
  <rect y="0" width="1920" height="50" fill="#111111"/>

  <!-- Main Organic Heavy Paint Stroke Body pointing DOWN -->
  <path d="
    M-10,0 
    L-10,95
    C35,105 90,78 150,105
    C210,125 270,82 340,112
    C410,132 470,88 550,118
    C620,135 680,82 760,122
    C830,140 900,88 980,128
    C1050,145 1120,92 1200,132
    C1270,148 1340,98 1420,135
    C1490,150 1560,102 1640,138
    C1710,152 1780,108 1860,142
    C1900,150 1920,120 1930,135
    L1930,0 Z
  " fill="#111111"/>

  <!-- Extended Brush Strokes reaching downwards at Different Heights (y=115 to y=155) -->
  <path d="M30,95 Q100,145 200,115 Q120,132 50,100 Z" fill="#111111"/>
  <path d="M120,108 Q200,152 300,125 Q210,142 145,114 Z" fill="#111111"/>
  <path d="M230,118 Q320,158 430,132 Q335,146 260,122 Z" fill="#111111"/>
  <path d="M380,124 Q480,164 590,136 Q490,148 415,128 Z" fill="#111111"/>
  <path d="M540,130 Q650,168 760,140 Q660,152 580,134 Z" fill="#111111"/>
  <path d="M710,135 Q820,172 940,144 Q835,156 750,138 Z" fill="#111111"/>
  <path d="M890,138 Q1000,174 1120,146 Q1015,158 930,140 Z" fill="#111111"/>
  <path d="M1070,140 Q1180,170 1300,145 Q1195,156 1110,142 Z" fill="#111111"/>
  <path d="M1250,142 Q1360,168 1480,146 Q1375,156 1290,144 Z" fill="#111111"/>
  <path d="M1430,144 Q1540,172 1660,148 Q1555,158 1470,145 Z" fill="#111111"/>
  <path d="M1610,146 Q1720,174 1840,150 Q1735,160 1650,148 Z" fill="#111111"/>
  <path d="M1780,150 Q1860,172 1930,152 Q1850,160 1800,152 Z" fill="#111111"/>

  <!-- Horizontal Dry-Brush Bristle Filaments pointing down -->
  <g stroke="#111111" stroke-linecap="round" fill="none">
    <path d="M20,130 Q90,140 170,128" stroke-width="2.5"/>
    <path d="M90,138 Q180,148 270,135" stroke-width="1.8"/>
    <path d="M220,144 Q320,154 420,142" stroke-width="2.4"/>
    <path d="M370,148 Q480,158 580,145" stroke-width="1.6"/>
    <path d="M530,152 Q640,162 740,148" stroke-width="2.6"/>
    <path d="M700,154 Q810,164 910,150" stroke-width="2"/>
    <path d="M870,155 Q980,166 1080,152" stroke-width="2.8"/>
    <path d="M1050,154 Q1160,164 1260,150" stroke-width="1.8"/>
    <path d="M1220,152 Q1330,162 1430,148" stroke-width="2.4"/>
    <path d="M1400,154 Q1510,164 1610,150" stroke-width="1.8"/>
    <path d="M1580,155 Q1690,166 1790,152" stroke-width="2.5"/>
    <path d="M1740,156 Q1830,168 1920,154" stroke-width="2.8"/>
  </g>

  <!-- Splatter Flecks pointing down -->
  <g fill="#111111">
    <circle cx="85" cy="142" r="2.2"/><circle cx="170" cy="150" r="1.8"/>
    <circle cx="280" cy="155" r="2.4"/><circle cx="410" cy="157" r="2"/>
    <circle cx="560" cy="158" r="2.8"/><circle cx="730" cy="159" r="2"/>
    <circle cx="910" cy="157" r="2.5"/><circle cx="1090" cy="158" r="1.8"/>
    <circle cx="1270" cy="157" r="2.4"/><circle cx="1450" cy="159" r="2.6"/>
    <circle cx="1630" cy="158" r="2.2"/><circle cx="1810" cy="159" r="3"/>
  </g>
</svg>`;

fs.writeFileSync('public/images/decorations/hero-brush-up.svg', brushUp);
fs.writeFileSync('public/images/decorations/hero-brush-down.svg', brushDown);
console.log('Saved hero-brush-up.svg and hero-brush-down.svg successfully!');
