const fs = require('fs');
const path = require('path');
const jpeg = require('jpeg-js');
const { PNG } = require('pngjs');

const inputPath = 'C:/Users/hajar/.gemini/antigravity/brain/1b62cd6b-37a2-43f0-9db9-9304361358cb/shark_aggressive_logo_v2_1794100266858.jpg';
const outputPath = 'C:/Users/hajar/.gemini/antigravity/scratch/trades_for_you_app/assets/shark_aggressive_logo.png';

const jpegData = fs.readFileSync(inputPath);
const raw = jpeg.decode(jpegData, { useTArray: true });
const { width, height, data } = raw;

console.log('Image dimensions:', width, height);

// Let us inspect the boundary between jaws:
// Snout upper edge: goes down to (850, 420)
// Lower jaw edge: goes up to (815, 750)
// To prevent exterior flood-fill from penetrating inside the roaring mouth,
// we can place a barrier blocking line between upper jaw and lower jaw during BFS.
// Or we can observe that all background is connected to image borders, BUT the mouth cavity is on the left side of the teeth!

// Let's create a visited array and an isBg array
const isBg = new Uint8Array(width * height);
const visited = new Uint8Array(width * height);
const barrier = new Uint8Array(width * height);

// Draw barrier line connecting upper snout/lip to lower jaw/lip:
// From (855, 380) down to (815, 755) with a slight curve outward (e.g. x around 860)
function drawBarrierLine(x0, y0, x1, y1, thickness = 6) {
  const steps = Math.hypot(x1 - x0, y1 - y0) * 2;
  for (let s = 0; s <= steps; s++) {
    const t = s / steps;
    const cx = Math.round(x0 + (x1 - x0) * t);
    const cy = Math.round(y0 + (y1 - y0) * t);
    for (let dy = -thickness; dy <= thickness; dy++) {
      for (let dx = -thickness; dx <= thickness; dx++) {
        const px = cx + dx;
        const py = cy + dy;
        if (px >= 0 && px < width && py >= 0 && py < height) {
          barrier[py * width + px] = 1;
        }
      }
    }
  }
}

// Upper jaw lip tip: around (850, 390)
// Lower jaw lip tip: around (815, 750)
drawBarrierLine(850, 385, 815, 755, 8);

// Edge seed for BFS
const queue = [];
for (let x = 0; x < width; x++) {
  queue.push(x, 0);
  queue.push(x, height - 1);
  visited[x] = 1;
  visited[(height - 1) * width + x] = 1;
}
for (let y = 0; y < height; y++) {
  queue.push(0, y);
  queue.push(width - 1, y);
  visited[y * width] = 1;
  visited[y * width + (width - 1)] = 1;
}

// Background flood fill
let head = 0;
while (head < queue.length) {
  const cx = queue[head++];
  const cy = queue[head++];
  const cIdx = cy * width + cx;
  const dIdx = cIdx << 2;

  const r = data[dIdx];
  const g = data[dIdx + 1];
  const b = data[dIdx + 2];
  const brightness = (r + g + b) / 3;

  // If it's a barrier pixel, do NOT cross it!
  if (barrier[cIdx]) {
    continue;
  }

  // Exterior background threshold:
  // The background in the original image is black (brightness < 30).
  // Shark outer border has white contour or dark grey skin (brightness > 35 or green).
  if (brightness < 30) {
    isBg[cIdx] = 1;

    const neighbors = [
      [cx + 1, cy],
      [cx - 1, cy],
      [cx, cy + 1],
      [cx, cy - 1]
    ];

    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nIdx = ny * width + nx;
        if (!visited[nIdx]) {
          visited[nIdx] = 1;
          queue.push(nx, ny);
        }
      }
    }
  }
}

console.log('Background flood fill completed.');

// Build output PNG
// We want:
// 1. Exterior background (isBg == 1) -> alpha = 0 (100% transparent!)
// 2. Interior dark throat / shark body -> keep dark, solid charcoal (#0B0F17 or original dark)
// 3. Green colors -> map directly to electric Toxic Neon Green (#00FF66 / rgb(0, 255, 102))
// 4. Teeth -> razor sharp bright white (#FFFFFF)
const png = new PNG({ width, height });

let bgCount = 0;
let greenCount = 0;
let throatCount = 0;

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = y * width + x;
    const dIdx = idx << 2;
    const outIdx = dIdx;

    if (isBg[idx]) {
      // Background pixel: totally transparent
      png.data[outIdx] = 0;
      png.data[outIdx + 1] = 0;
      png.data[outIdx + 2] = 0;
      png.data[outIdx + 3] = 0;
      bgCount++;
      continue;
    }

    // Inside shark!
    let r = data[dIdx];
    let g = data[dIdx + 1];
    let b = data[dIdx + 2];
    const brightness = (r + g + b) / 3;

    // Check if green:
    // Green highlights in the original artwork have strong green dominance:
    // g > 50 && g > r * 1.2 && g > b * 1.1
    const isGreen = g > 50 && (g > r * 1.15) && (g > b * 1.1);

    if (isGreen) {
      // Map to vibrant electric Toxic Neon Green #00FF66
      // Normalize intensity from original green
      const intensity = Math.min(255, Math.max(180, g * 1.2));
      png.data[outIdx] = Math.round(intensity * 0.05); // slight r for richness
      png.data[outIdx + 1] = Math.round(intensity);     // 100% green
      png.data[outIdx + 2] = Math.round(intensity * 0.40); // 0.40 * 255 = ~102 (#00FF66)
      png.data[outIdx + 3] = 255;
      greenCount++;
    } else if (r > 190 && g > 190 && b > 190) {
      // Razor sharp white teeth & highlights
      png.data[outIdx] = 255;
      png.data[outIdx + 1] = 255;
      png.data[outIdx + 2] = 255;
      png.data[outIdx + 3] = 255;
    } else if (brightness < 20) {
      // Dark throat / deep body shading: keep rich dark predatory charcoal
      // Give it a subtle deep blue-black tone so it feels solid and premium
      png.data[outIdx] = 11;
      png.data[outIdx + 1] = 15;
      png.data[outIdx + 2] = 22;
      png.data[outIdx + 3] = 255;
      throatCount++;
    } else {
      // Midtones (metallic graphite shark skin)
      png.data[outIdx] = r;
      png.data[outIdx + 1] = g;
      png.data[outIdx + 2] = b;
      png.data[outIdx + 3] = 255;
    }
  }
}

console.log('Stats:', { bgCount, greenCount, throatCount });

const buffer = PNG.sync.write(png);
fs.writeFileSync(outputPath, buffer);
console.log('Saved transparent aggressive logo to:', outputPath, 'Size:', buffer.length);

