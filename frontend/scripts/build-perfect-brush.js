import fs from 'fs';

/**
 * Builds the authentic hand-painted brush stroke assets matching media_1793382287434_e37f6c46.png
 * Color palette:
 * - Paint fill: #111111
 * - Canvas gap: #F7F7F5 (and transparent variants)
 * Width: 1920, Height: 160
 */

function generateBristlePeaks(direction = 'down') {
  // direction 'down': solid at top (y=0..50), bristles reach down towards y=155
  // direction 'up': solid at bottom (y=110..160), bristles reach up towards y=5
  const isDown = direction === 'down';
  
  // Height coordinates mapping
  const mapY = (val) => isDown ? val : (160 - val);

  // 1. Organic Base Heavy Paint Silhouette
  const basePoints = [
    { x: -10, y: mapY(90) },
    { x: 60, y: mapY(105) },
    { x: 140, y: mapY(85) },
    { x: 230, y: mapY(112) },
    { x: 310, y: mapY(95) },
    { x: 400, y: mapY(118) },
    { x: 480, y: mapY(98) },
    { x: 570, y: mapY(122) },
    { x: 660, y: mapY(100) },
    { x: 750, y: mapY(125) },
    { x: 840, y: mapY(92) },
    { x: 930, y: mapY(128) },
    { x: 1020, y: mapY(105) },
    { x: 1110, y: mapY(130) },
    { x: 1200, y: mapY(98) },
    { x: 1290, y: mapY(132) },
    { x: 1380, y: mapY(108) },
    { x: 1470, y: mapY(134) },
    { x: 1560, y: mapY(104) },
    { x: 1650, y: mapY(135) },
    { x: 1740, y: mapY(110) },
    { x: 1830, y: mapY(138) },
    { x: 1930, y: mapY(105) },
  ];

  let pathD = isDown 
    ? `M -10,0 L 1930,0 L 1930,${basePoints[basePoints.length-1].y}`
    : `M -10,160 L 1930,160 L 1930,${basePoints[basePoints.length-1].y}`;

  for (let i = basePoints.length - 1; i >= 0; i--) {
    const pt = basePoints[i];
    if (i === basePoints.length - 1) {
      pathD += ` L ${pt.x},${pt.y}`;
    } else {
      const prev = basePoints[i + 1];
      const cx = (prev.x + pt.x) / 2;
      pathD += ` Q ${cx},${pt.y + (isDown ? 8 : -8)} ${pt.x},${pt.y}`;
    }
  }
  pathD += isDown ? ' L -10,0 Z' : ' L -10,160 Z';

  // 2. Individual Extended Brush Strokes at different heights (matching user prompt)
  const extendedStrokes = [
    // [startX, peakX, peakY, endX, backControlY]
    [20, 80, 138, 140, 108],
    [90, 160, 148, 230, 114],
    [180, 260, 155, 340, 120],
    [290, 370, 142, 450, 110],
    [410, 490, 154, 570, 122],
    [520, 610, 146, 690, 115],
    [640, 730, 158, 810, 126],
    [760, 850, 144, 930, 112],
    [870, 970, 160, 1060, 128],
    [1000, 1100, 152, 1190, 120],
    [1130, 1230, 157, 1320, 124],
    [1260, 1360, 150, 1440, 118],
    [1390, 1490, 159, 1570, 126],
    [1510, 1620, 148, 1700, 116],
    [1640, 1740, 156, 1820, 124],
    [1760, 1850, 152, 1920, 120]
  ].map(([sX, pX, pY, eX, bcY]) => {
    const realPY = mapY(pY);
    const realBCY = mapY(bcY);
    const baseY = mapY(isDown ? 70 : 90);
    return `<path d="M ${sX},${baseY} Q ${pX},${realPY} ${eX},${baseY} Q ${pX},${realBCY} ${sX},${baseY} Z" fill="#111111"/>`;
  }).join('\n    ');

  // 3. Dry-brush horizontal filaments / scratch lines (1.5px to 2.8px)
  const dryFilaments = [
    [15, 125, 110, 135, 2.4],
    [70, 134, 180, 142, 1.8],
    [150, 138, 270, 147, 2.2],
    [240, 143, 370, 149, 1.6],
    [350, 136, 480, 144, 2.6],
    [460, 142, 590, 150, 1.9],
    [580, 147, 710, 154, 2.4],
    [700, 140, 830, 148, 1.7],
    [810, 148, 950, 156, 2.8],
    [940, 144, 1070, 152, 1.8],
    [1060, 148, 1190, 155, 2.4],
    [1180, 142, 1310, 150, 1.9],
    [1300, 149, 1430, 157, 2.6],
    [1420, 144, 1550, 152, 1.7],
    [1540, 147, 1680, 154, 2.5],
    [1670, 143, 1800, 151, 2.0],
    [1790, 148, 1920, 154, 2.7]
  ].map(([x1, y1, x2, y2, sw]) => {
    const ry1 = mapY(y1);
    const ry2 = mapY(y2);
    const midX = (x1 + x2) / 2;
    const midY = mapY((y1 + y2) / 2 + (isDown ? 3 : -3));
    return `<path d="M ${x1},${ry1} Q ${midX},${midY} ${x2},${ry2}" stroke="#111111" stroke-width="${sw}" stroke-linecap="round" fill="none"/>`;
  }).join('\n    ');

  // 4. Paint skips and canvas gaps (White gaps matching user prompt: "Use black brush strokes mixed with white gaps to create a natural hand-painted appearance")
  const whiteGaps = [
    [90, 95, 170, 90, 250, 98],
    [230, 102, 320, 96, 410, 105],
    [390, 98, 480, 92, 570, 100],
    [550, 104, 640, 98, 730, 106],
    [710, 99, 810, 93, 900, 102],
    [880, 105, 980, 99, 1080, 107],
    [1060, 100, 1160, 94, 1260, 103],
    [1240, 106, 1340, 100, 1440, 108],
    [1420, 101, 1520, 95, 1620, 104],
    [1600, 107, 1700, 101, 1800, 109],
  ].map(([x1, y1, x2, y2, x3, y3]) => {
    const ry1 = mapY(y1);
    const ry2 = mapY(y2);
    const ry3 = mapY(y3);
    const by = mapY(isDown ? ((y1+y2+y3)/3 + 4) : ((y1+y2+y3)/3 - 4));
    return `<path d="M ${x1},${ry1} Q ${x2},${ry2} ${x3},${ry3} Q ${x2},${by} ${x1},${ry1} Z" fill="#F7F7F5" opacity="0.95"/>`;
  }).join('\n    ');

  // 5. Paint Flecks and Bristle Tip Splatters
  const splatters = [
    [75, 146, 2.2], [145, 154, 1.8], [240, 159, 2.4], [350, 149, 1.9],
    [470, 158, 2.5], [590, 152, 2.0], [710, 162, 2.8], [830, 149, 1.8],
    [950, 164, 2.6], [1080, 156, 2.2], [1210, 161, 2.7], [1340, 154, 1.9],
    [1470, 163, 2.8], [1600, 153, 2.1], [1720, 160, 2.5], [1830, 155, 2.4],
    [1905, 158, 3.0]
  ].map(([cx, cy, r]) => {
    const rcy = mapY(cy);
    return `<circle cx="${cx}" cy="${rcy}" r="${r}" fill="#111111"/>`;
  }).join('\n    ');

  // Solid bar at root
  const solidBar = isDown
    ? `<rect x="0" y="0" width="1920" height="55" fill="#111111"/>`
    : `<rect x="0" y="105" width="1920" height="55" fill="#111111"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 165" width="100%" height="100%" preserveAspectRatio="none">
  <defs>
    <!-- Organic Edge Turbulence Filter for Realistic Torn-Paper & Rough Bristle Edges -->
    <filter id="roughEdge-${direction}" x="-5%" y="-10%" width="110%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04 0.09" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </defs>

  <!-- 1. Solid Root Base -->
  ${solidBar}

  <!-- 2. Main Rough Paint Stroke Edge -->
  <path d="${pathD}" fill="#111111" filter="url(#roughEdge-${direction})"/>

  <!-- 3. Extended Brush Strokes at Different Heights -->
  <g>
    ${extendedStrokes}
  </g>

  <!-- 4. Dry-Brush Filament Scratch Lines -->
  <g>
    ${dryFilaments}
  </g>

  <!-- 5. Canvas Gaps & Skips (White Gaps) -->
  <g>
    ${whiteGaps}
  </g>

  <!-- 6. Splatter Flecks & Bristle Tips -->
  <g>
    ${splatters}
  </g>
</svg>`;
}

const brushDown = generateBristlePeaks('down');
const brushUp = generateBristlePeaks('up');

fs.writeFileSync('public/images/decorations/hero-brush-down.svg', brushDown);
fs.writeFileSync('public/images/decorations/hero-brush-up.svg', brushUp);
fs.writeFileSync('public/images/decorations/hero-brush-bottom.svg', brushDown);
fs.writeFileSync('public/images/decorations/brush-stroke-bottom.svg', brushDown);
fs.writeFileSync('public/images/decorations/brush-stroke-top.svg', brushUp);

console.log('Successfully generated hero brush SVG assets!');
