import fs from 'fs';
import sharp from 'sharp';

async function extractExactBrush() {
  const { data, info } = await sharp('public/images/decorations/extracted-ref-binary-mask.png').raw().toBuffer({ resolveWithObject: true });
  
  const points = [];
  const sampleStep = 4; // 256 samples across 1024 width
  
  for (let x = 0; x <= info.width; x += sampleStep) {
    const checkX = Math.min(x, info.width - 1);
    let edgeY = 0;
    for (let y = 0; y < info.height; y++) {
      const idx = (y * info.width + checkX) * 4;
      if (data[idx] > 128) {
        edgeY = y;
      }
    }
    // Scale X to 1920 viewBox, scale Y to 80 viewBox
    const sx = Math.round((checkX / info.width) * 1920 * 10) / 10;
    // Normalized Y coordinate in 0..80 viewBox
    const sy = Math.round((edgeY / info.height) * 80 * 10) / 10;
    points.push({ x: sx, y: sy });
  }

  // Smooth the points with a 5-point moving average to eliminate raw pixel aliasing
  const smoothed = [];
  for (let i = 0; i < points.length; i++) {
    let sumY = 0;
    let count = 0;
    for (let j = -2; j <= 2; j++) {
      const idx = Math.max(0, Math.min(points.length - 1, i + j));
      sumY += points[idx].y;
      count++;
    }
    smoothed.push({ x: points[i].x, y: Math.round((sumY / count) * 10) / 10 });
  }

  // 1. Build light #F7F7F5 version (solid at top, organic ragged edge pointing down into banner)
  let dLight = `M 0,0 L 1920,0 L 1920,${smoothed[smoothed.length - 1].y}`;
  for (let i = smoothed.length - 2; i >= 0; i--) {
    dLight += ` L ${smoothed[i].x},${smoothed[i].y}`;
  }
  dLight += ' Z';

  const svgLight = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 80" width="100%" height="100%" preserveAspectRatio="none">
  <!-- Exact organic brush/torn-paper transition extracted directly from user reference screenshot -->
  <path d="${dLight}" fill="#F7F7F5"/>
</svg>`;

  fs.writeFileSync('public/images/decorations/finalcta-top-brush.svg', svgLight);
  console.log('Saved exact light transition to finalcta-top-brush.svg!');

  // 2. Also build a high-aesthetic hand-painted brush stroke for general transitions (black #111111)
  // With broad sweeping curves, subtle natural bristles, NO repetitive bumpy mounds!
  const width = 1920;
  const height = 90;

  // Natural sweeping curve:
  // Starts around y=20 on left, gentle dip to y=55 in center-left, rises to y=35, sweeps smoothly across
  const macroPoints = [];
  const numSteps = 120;
  for (let i = 0; i <= numSteps; i++) {
    const x = (i / numSteps) * width;
    const progress = i / numSteps;

    // Elegant long sweeping s-curves
    const wave = Math.sin(progress * Math.PI * 1.8) * 18 + Math.cos(progress * Math.PI * 3.2) * 8;
    // Micro torn texture (small, fine organic variation 0.5px to 2px)
    const grain = ((i % 5) - 2) * 1.2 + ((i % 7) - 3) * 0.8;
    const y = 42 + wave + grain;
    macroPoints.push({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
  }

  // Downward brush (solid at top, sweeping edge at bottom)
  let dDown = `M 0,0 L ${width},0 L ${width},${macroPoints[macroPoints.length - 1].y}`;
  for (let i = macroPoints.length - 2; i >= 0; i--) {
    dDown += ` L ${macroPoints[i].x},${macroPoints[i].y}`;
  }
  dDown += ' Z';

  // Upward brush (solid at bottom, sweeping edge at top)
  let dUp = `M 0,${height} L ${width},${height} L ${width},${height - macroPoints[macroPoints.length - 1].y}`;
  for (let i = macroPoints.length - 2; i >= 0; i--) {
    dUp += ` L ${macroPoints[i].x},${height - macroPoints[i].y}`;
  }
  dUp += ' Z';

  const cleanSvgDown = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" preserveAspectRatio="none">
  <!-- Clean, elegant, natural hand-painted brush stroke edge (no repetitive humps) -->
  <path d="${dDown}" fill="#111111"/>
</svg>`;

  const cleanSvgUp = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" preserveAspectRatio="none">
  <!-- Clean, elegant, natural hand-painted brush stroke edge (no repetitive humps) -->
  <path d="${dUp}" fill="#111111"/>
</svg>`;

  fs.writeFileSync('public/images/decorations/hero-brush-down.svg', cleanSvgDown);
  fs.writeFileSync('public/images/decorations/hero-brush-up.svg', cleanSvgUp);
  fs.writeFileSync('public/images/decorations/brush-stroke-bottom.svg', cleanSvgDown);
  fs.writeFileSync('public/images/decorations/brush-stroke-top.svg', cleanSvgUp);
  console.log('Saved clean, beautiful, natural brush SVGs with proper sweeping curvature!');
}

extractExactBrush();
