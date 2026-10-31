import fs from 'fs';
import sharp from 'sharp';

/**
 * Pure-alpha, tactile Hand-Stamped Brush Print SVG Generator
 * Uses pure transparent canvas - no fake background fills.
 * Creates genuine dry-brush bristle drag lines, frayed hair ends, and paper-tooth texture.
 */

function generatePureBrushPrint({
  direction = 'down', // 'down' (root at top, bristles drag down) or 'up' (root at bottom, bristles drag up)
  color = '#111111',
  width = 1920,
  height = 90
}) {
  const isDown = direction === 'down';
  const mapY = (y) => isDown ? y : (height - y);

  // 1. Dynamic continuous sweeping macro gesture (No sinusoidal repetitive hills!)
  // Sweeps from left to right with subtle paper-grain micro-variation
  const numSteps = 160;
  const edgePoints = [];

  for (let i = 0; i <= numSteps; i++) {
    const x = (i / numSteps) * width;
    const t = i / numSteps;

    // Organic non-repeating gesture across 1920px:
    // Left: y ~ 36 -> gentle dip to y ~ 50 at 35% width -> rises to y ~ 34 at 70% width -> soft taper to y ~ 40 at right
    const macro = Math.sin(t * Math.PI * 1.2) * 14 + Math.cos(t * Math.PI * 2.1) * 5;
    
    // Paper tooth texture (micro-steps 0.5px to 2.2px)
    const n = Math.sin(i * 15.71 + 33.1) * 10000;
    const tooth = (n - Math.floor(n) - 0.5) * 3.0;

    const y = 35 + macro + tooth;
    edgePoints.push({ x: Math.round(x * 10) / 10, y: Math.round(mapY(y) * 10) / 10 });
  }

  // Main Dense Paint Body
  let mainBodyD = '';
  if (isDown) {
    mainBodyD = `M 0,0 L ${width},0 L ${width},${edgePoints[edgePoints.length - 1].y}`;
    for (let i = edgePoints.length - 2; i >= 0; i--) {
      mainBodyD += ` L ${edgePoints[i].x},${edgePoints[i].y}`;
    }
    mainBodyD += ' Z';
  } else {
    mainBodyD = `M 0,${height} L ${width},${height} L ${width},${edgePoints[edgePoints.length - 1].y}`;
    for (let i = edgePoints.length - 2; i >= 0; i--) {
      mainBodyD += ` L ${edgePoints[i].x},${edgePoints[i].y}`;
    }
    mainBodyD += ' Z';
  }

  // 2. Realistic Stiff-Bristle Hair Scratch Lines (Filaments)
  // These create the iconic "bristle drag" lines where individual brush hairs leave marks
  const bristleLines = [];
  const filamentDefs = [
    // [x, len, yBase, sw, opacity, deltaY]
    [10, 240, 42, 1.8, 0.9, 3],
    [50, 310, 46, 2.4, 0.85, -2],
    [120, 180, 40, 1.2, 0.75, 1],
    [180, 290, 52, 2.0, 0.85, 4],
    [260, 340, 45, 1.6, 0.8, -3],
    [320, 220, 54, 2.5, 0.9, 2],
    [410, 380, 50, 2.2, 0.85, 3],
    [490, 280, 58, 1.8, 0.8, -4],
    [570, 350, 52, 2.6, 0.9, 3],
    [660, 260, 62, 1.5, 0.75, -2],
    [730, 390, 53, 2.4, 0.85, 4],
    [840, 320, 48, 2.0, 0.8, -3],
    [920, 290, 56, 1.6, 0.75, 3],
    [1010, 360, 49, 2.5, 0.9, -3],
    [1100, 270, 44, 1.4, 0.7, 2],
    [1180, 340, 52, 2.2, 0.85, 4],
    [1270, 290, 46, 1.8, 0.8, -2],
    [1350, 330, 50, 2.5, 0.9, 2],
    [1440, 260, 42, 1.5, 0.75, -3],
    [1520, 310, 48, 2.3, 0.85, 3],
    [1610, 240, 44, 1.6, 0.8, -2],
    [1690, 210, 40, 1.9, 0.85, 2],
    [1770, 150, 38, 1.4, 0.75, -1]
  ];

  for (const [x, len, yBase, sw, op, dY] of filamentDefs) {
    const xEnd = Math.min(width, x + len);
    const midX = (x + xEnd) / 2;
    const y1 = mapY(yBase);
    const y2 = mapY(yBase + dY);
    const midY = mapY(yBase + dY * 0.5 + (isDown ? 2 : -2));

    bristleLines.push(
      `<path d="M ${x},${y1} Q ${midX},${midY} ${xEnd},${y2}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" fill="none" opacity="${op}"/>`
    );
  }

  // 3. Frayed Bristle Peaks (Tapered fine brush strokes sticking out organically)
  const frayedPeaks = [];
  const peakDefs = [
    // [x, width, reachY]
    [35, 16, 56], [90, 22, 62], [165, 18, 59], [250, 24, 66],
    [340, 20, 63], [435, 26, 70], [530, 24, 72], [630, 28, 76],
    [735, 22, 69], [840, 26, 73], [945, 20, 67], [1055, 24, 70],
    [1165, 22, 65], [1280, 26, 68], [1400, 20, 62], [1515, 24, 64],
    [1625, 18, 58], [1730, 22, 56], [1835, 16, 52]
  ];

  for (const [px, pw, reach] of peakDefs) {
    const rootY = mapY(36);
    const tipY = mapY(reach);
    const tipX = px + pw * 0.45;
    const endX = px + pw;
    const controlY = mapY(36 + (reach - 36) * 0.4);

    frayedPeaks.push(
      `<path d="M ${px},${rootY} Q ${tipX},${tipY} ${endX},${rootY} Q ${tipX},${controlY} ${px},${rootY} Z" fill="${color}" opacity="0.95"/>`
    );
  }

  // 4. Fine Splatter Flecks / Bristle Droplets
  const splatterDots = [];
  const dotDefs = [
    [70, 64, 1.8], [145, 60, 1.4], [230, 67, 2.0], [315, 62, 1.5],
    [405, 71, 1.9], [500, 75, 1.7], [605, 78, 2.2], [705, 73, 1.4],
    [810, 75, 2.0], [915, 70, 1.6], [1020, 72, 2.1], [1125, 67, 1.5],
    [1235, 69, 1.9], [1345, 64, 1.4], [1455, 66, 2.0], [1565, 61, 1.6],
    [1675, 59, 1.8], [1785, 55, 1.3]
  ];

  for (const [cx, cy, r] of dotDefs) {
    splatterDots.push(
      `<circle cx="${cx}" cy="${mapY(cy)}" r="${r}" fill="${color}" opacity="0.8"/>`
    );
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" preserveAspectRatio="none">
  <!-- 1. Solid Painted Anchor Base -->
  ${isDown ? `<rect x="0" y="0" width="${width}" height="22" fill="${color}"/>` : `<rect x="0" y="${height - 22}" width="${width}" height="22" fill="${color}"/>`}

  <!-- 2. Main Paint Body with Paper-Tooth Edge -->
  <path d="${mainBodyD}" fill="${color}"/>

  <!-- 3. Frayed Dry Bristle Tips -->
  <g>
    ${frayedPeaks.join('\n    ')}
  </g>

  <!-- 4. Real Dry-Brush Bristle Drag Filaments -->
  <g>
    ${bristleLines.join('\n    ')}
  </g>

  <!-- 5. Paint Splatters & Bristle Droplets -->
  <g>
    ${splatterDots.join('\n    ')}
  </g>
</svg>`;
}

// 1. finalcta-top-brush.svg: Solid #F7F7F5 at top, dry brush drag marks pointing DOWN into mountain sky
const finalctaTop = generatePureBrushPrint({
  direction: 'down',
  color: '#F7F7F5',
  width: 1920,
  height: 85
});
fs.writeFileSync('public/images/decorations/finalcta-top-brush.svg', finalctaTop);

// 2. hero-brush-down.svg & brush-stroke-bottom.svg: Solid #111111 at top, bristles pointing DOWN into #F7F7F5
const brushDown = generatePureBrushPrint({
  direction: 'down',
  color: '#111111',
  width: 1920,
  height: 90
});
fs.writeFileSync('public/images/decorations/hero-brush-down.svg', brushDown);
fs.writeFileSync('public/images/decorations/brush-stroke-bottom.svg', brushDown);

// 3. hero-brush-up.svg & brush-stroke-top.svg: Solid #111111 at bottom, bristles pointing UP
const brushUp = generatePureBrushPrint({
  direction: 'up',
  color: '#111111',
  width: 1920,
  height: 90
});
fs.writeFileSync('public/images/decorations/hero-brush-up.svg', brushUp);
fs.writeFileSync('public/images/decorations/brush-stroke-top.svg', brushUp);

console.log('Saved pure-alpha tactile brush print SVGs successfully!');

// Test visual render with sharp
async function test() {
  await sharp(Buffer.from(finalctaTop)).png().toFile('public/images/decorations/test-pure-finalcta.png');
  await sharp(Buffer.from(brushDown)).png().toFile('public/images/decorations/test-pure-down.png');
  console.log('Rendered test-pure PNGs successfully!');
}
test();
