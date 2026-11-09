const fs = require('fs');
const { PNG } = require('pngjs');

const inputPath = 'assets/shark_aggressive_logo.png';
const png = PNG.sync.read(fs.readFileSync(inputPath));

let minX = png.width, maxX = 0, minY = png.height, maxY = 0;
for (let y = 0; y < png.height; y++) {
  for (let x = 0; x < png.width; x++) {
    const idx = (y * png.width + x) * 4;
    if (png.data[idx + 3] > 10) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}

// Add small margin of 10px
const pad = 10;
const cropX = Math.max(0, minX - pad);
const cropY = Math.max(0, minY - pad);
const cropW = Math.min(png.width - cropX, (maxX - minX + 1) + pad * 2);
const cropH = Math.min(png.height - cropY, (maxY - minY + 1) + pad * 2);

console.log('Cropping to:', { cropX, cropY, cropW, cropH });

const cropped = new PNG({ width: cropW, height: cropH });

for (let y = 0; y < cropH; y++) {
  for (let x = 0; x < cropW; x++) {
    const srcIdx = ((cropY + y) * png.width + (cropX + x)) * 4;
    const dstIdx = (y * cropW + x) * 4;
    cropped.data[dstIdx] = png.data[srcIdx];
    cropped.data[dstIdx + 1] = png.data[srcIdx + 1];
    cropped.data[dstIdx + 2] = png.data[srcIdx + 2];
    cropped.data[dstIdx + 3] = png.data[srcIdx + 3];
  }
}

const buffer = PNG.sync.write(cropped);
fs.writeFileSync(inputPath, buffer);
console.log('Tightly cropped shark logo saved! New size:', cropW, 'x', cropH);

