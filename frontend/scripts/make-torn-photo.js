import fs from 'fs';

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(19);
const W = 800;
const H = 500;

function walk(count, getPoint) {
  const pts = [];
  let nick = 0;
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    if (nick <= 0 && rng() > 0.9) nick = 4 + Math.floor(rng() * 6);
    const nickAmt = nick > 0 ? Math.sin((nick / 10) * Math.PI) : 0;
    if (nick > 0) nick -= 1;
    pts.push(getPoint(t, nickAmt, i));
  }
  return pts;
}

// Top: left → right, then a large missing corner on the right third
const top = walk(56, (t, nick) => {
  const x = 28 + t * 744;
  let y = 22 + (rng() - 0.5) * 5 + nick * 5;
  if (t > 0.58) {
    const u = (t - 0.58) / 0.42;
    // diagonal rip down into the frame, does not return to the top edge
    y += Math.pow(u, 1.15) * 118 + Math.sin(u * Math.PI * 3.2) * 10;
    y += (rng() - 0.4) * 7;
  }
  return [x, y];
});

const right = walk(28, (t, nick) => {
  const y = top[top.length - 1][1] + t * (H - 28 - top[top.length - 1][1]);
  let x = 772 - nick * 7 + (rng() - 0.5) * 6;
  if (t < 0.22) x -= (1 - t / 0.22) * 18;
  if (t > 0.55 && t < 0.78) x -= Math.sin(((t - 0.55) / 0.23) * Math.PI) * 16;
  return [x, y];
});

const bottom = walk(56, (t, nick) => {
  const x = 772 - t * 744;
  let y = H - 22 + (rng() - 0.5) * 5 - nick * 6;
  if (t > 0.12 && t < 0.22) y -= Math.sin(((t - 0.12) / 0.1) * Math.PI) * 10;
  if (t > 0.7 && t < 0.84) y -= Math.sin(((t - 0.7) / 0.14) * Math.PI) * 9;
  return [x, y];
});

const left = walk(28, (t, nick) => {
  const y = H - 22 - t * (H - 44);
  let x = 28 + nick * 8 + (rng() - 0.5) * 6;
  if (t > 0.15 && t < 0.32) x += Math.sin(((t - 0.15) / 0.17) * Math.PI) * 20;
  if (t > 0.62 && t < 0.8) x += Math.sin(((t - 0.62) / 0.18) * Math.PI) * 14;
  return [x, y];
});

const outer = [...top, ...right, ...bottom, ...left];

function inset(pts, amt) {
  const cx = W / 2;
  const cy = H / 2;
  return pts.map(([x, y]) => {
    const dx = x - cx;
    const dy = y - cy;
    const len = Math.hypot(dx, dy) || 1;
    return [x - (dx / len) * amt, y - (dy / len) * amt];
  });
}

const inner = inset(outer, 16);

function toPath(pts) {
  return (
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ') +
    ' Z'
  );
}

const outerD = toPath(outer);
const innerD = toPath(inner);

const paper = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
  <path fill="#ffffff" d="${outerD}"/>
</svg>
`;

const mask = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
  <path fill="#ffffff" d="${innerD}"/>
</svg>
`;

const frame = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" fill="none">
  <path fill="#ffffff" d="${outerD}"/>
  <path id="photo" fill="#000000" d="${innerD}"/>
</svg>
`;

fs.writeFileSync('public/images/decorations/torn-photo-paper.svg', paper);
fs.writeFileSync('public/images/decorations/torn-photo-mask.svg', mask);
fs.writeFileSync('public/images/decorations/torn-photo-frame.svg', frame);
fs.writeFileSync(
  'src/components/home/tornPhotoPaths.js',
  `export const TORN_PAPER_VIEWBOX = '0 0 ${W} ${H}';\nexport const TORN_PAPER_OUTER = '${outerD}';\nexport const TORN_PHOTO_INNER = '${innerD}';\n`
);

console.log('wrote torn photo assets');
