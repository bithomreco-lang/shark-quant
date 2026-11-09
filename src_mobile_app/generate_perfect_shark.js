const fs = require('fs');
const jpeg = require('jpeg-js');
const { PNG } = require('pngjs');

const inputPath = 'C:/Users/hajar/.gemini/antigravity/brain/1b62cd6b-37a2-43f0-9db9-9304361358cb/shark_aggressive_logo_v2_1794100266858.jpg';
const outputPath = 'C:/Users/hajar/.gemini/antigravity/scratch/trades_for_you_app/assets/shark_aggressive_logo.png';

const raw = jpeg.decode(fs.readFileSync(inputPath), { useTArray: true });
const { width, height, data } = raw;

// 1. Compute shark profile (minX and maxX per row where br > 20)
const minXByRow = new Int32Array(height).fill(-1);
const maxXByRow = new Int32Array(height).fill(-1);

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * 4;
    const r = data[idx], g = data[idx+1], b = data[idx+2];
    const br = (r + g + b) / 3;
    if (br > 18 || (g > 35 && g > r * 1.1 && g > b * 1.1)) {
      if (minXByRow[y] === -1) minXByRow[y] = x;
      maxXByRow[y] = x;
    }
  }
}

// 2. Barrier along teeth perimeter to seal gaps during flood fill
const barrier = new Uint8Array(width * height);

for (let y = 350; y < 780; y++) {
  for (let x = 500; x < 860; x++) {
    const idx = (y * width + x) * 4;
    const r = data[idx], g = data[idx+1], b = data[idx+2];
    if ((r > 160 && g > 160 && b > 160) || (g > 55 && g > r * 1.2 && g > b * 1.1)) {
      for (let dy = -7; dy <= 7; dy++) {
        for (let dx = -7; dx <= 7; dx++) {
          const px = x + dx;
          const py = y + dy;
          if (px >= 0 && px < width && py >= 0 && py < height) {
            barrier[py * width + px] = 1;
          }
        }
      }
    }
  }
}

// 3. Flood fill from 4 outer edges
const visited = new Uint8Array(width * height);
const isBg = new Uint8Array(width * height);
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

let head = 0;
while (head < queue.length) {
  const cx = queue[head++];
  const cy = queue[head++];
  const cIdx = cy * width + cx;
  const dIdx = cIdx << 2;

  if (barrier[cIdx]) continue;

  const r = data[dIdx];
  const g = data[dIdx + 1];
  const b = data[dIdx + 2];
  const br = (r + g + b) / 3;

  if (br < 10) {
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

// 4. Any pixel strictly outside minX / maxX is 100% background
for (let y = 0; y < height; y++) {
  const minX = minXByRow[y];
  const maxX = maxXByRow[y];
  if (minX === -1) {
    for (let x = 0; x < width; x++) isBg[y * width + x] = 1;
  } else {
    for (let x = 0; x < minX; x++) isBg[y * width + x] = 1;
    for (let x = maxX + 1; x < width; x++) isBg[y * width + x] = 1;
  }
}

// 5. Build final PNG with exact colors
const png = new PNG({ width, height });

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = y * width + x;
    const dIdx = idx << 2;

    if (isBg[idx]) {
      png.data[dIdx] = 0;
      png.data[dIdx + 1] = 0;
      png.data[dIdx + 2] = 0;
      png.data[dIdx + 3] = 0;
      continue;
    }

    let r = data[dIdx];
    let g = data[dIdx + 1];
    let b = data[dIdx + 2];
    const brightness = (r + g + b) / 3;

    // Green detection (eye, gums, tongue, glowing stripes)
    const isGreen = g > 40 && (g > r * 1.15) && (g > b * 1.08);

    if (isGreen) {
      // Signature Toxic Neon Green (#00FF66)
      const factor = Math.min(1.0, Math.max(0.7, g / 255));
      png.data[dIdx] = Math.round(0 * factor);       // 0
      png.data[dIdx + 1] = Math.round(255 * factor); // 255
      png.data[dIdx + 2] = Math.round(102 * factor); // 102 -> #00FF66
      png.data[dIdx + 3] = 255;
    } else if (r > 175 && g > 175 && b > 175) {
      // White razor sharp fangs & contour highlights (#FFFFFF)
      png.data[dIdx] = 255;
      png.data[dIdx + 1] = 255;
      png.data[dIdx + 2] = 255;
      png.data[dIdx + 3] = 255;
    } else if (brightness < 12) {
      // Deep predatory mouth throat cavity
      png.data[dIdx] = 7;
      png.data[dIdx + 1] = 10;
      png.data[dIdx + 2] = 15;
      png.data[dIdx + 3] = 255;
    } else {
      // Dark metallic shark skin shading
      png.data[dIdx] = r;
      png.data[dIdx + 1] = g;
      png.data[dIdx + 2] = b;
      png.data[dIdx + 3] = 255;
    }
  }
}

// Outer edge anti-aliasing
for (let y = 1; y < height - 1; y++) {
  for (let x = 1; x < width - 1; x++) {
    const dIdx = (y * width + x) * 4;
    if (png.data[dIdx + 3] > 0) {
      let bgNeighbors = 0;
      if (isBg[(y - 1) * width + x]) bgNeighbors++;
      if (isBg[(y + 1) * width + x]) bgNeighbors++;
      if (isBg[y * width + (x - 1)]) bgNeighbors++;
      if (isBg[y * width + (x + 1)]) bgNeighbors++;

      if (bgNeighbors > 0) {
        png.data[dIdx + 3] = Math.round(255 * (1 - bgNeighbors * 0.22));
      }
    }
  }
}

const buffer = PNG.sync.write(png);
fs.writeFileSync(outputPath, buffer);
console.log('Saved 100% clean aggressive logo to:', outputPath);
