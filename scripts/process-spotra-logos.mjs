import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");
const assetsDir = join(__dirname, "brand-assets");

function matchesColor(raw, idx, color, threshold = 28) {
  const r = raw[idx];
  const g = raw[idx + 1];
  const b = raw[idx + 2];
  return (
    Math.abs(r - color.r) <= threshold &&
    Math.abs(g - color.g) <= threshold &&
    Math.abs(b - color.b) <= threshold
  );
}

/** Remove only background connected to image edges (keeps interior holes). */
function floodRemoveEdgeBackground(raw, info, bgColor) {
  const { width, height, channels } = info;
  const visited = new Uint8Array(width * height);
  const queue = [];

  function trySeed(x, y) {
    const p = y * width + x;
    if (visited[p]) return;
    const idx = p * channels;
    if (!matchesColor(raw, idx, bgColor)) return;
    visited[p] = 1;
    queue.push(p);
  }

  for (let x = 0; x < width; x++) {
    trySeed(x, 0);
    trySeed(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    trySeed(0, y);
    trySeed(width - 1, y);
  }

  while (queue.length > 0) {
    const p = queue.pop();
    const x = p % width;
    const y = (p - x) / width;
    raw[p * channels + 3] = 0;

    const neighbors = [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ];
    for (const [nx, ny] of neighbors) {
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const np = ny * width + nx;
      if (visited[np]) continue;
      const idx = np * channels;
      if (!matchesColor(raw, idx, bgColor)) continue;
      visited[np] = 1;
      queue.push(np);
    }
  }

  return raw;
}

async function processRaster(src, out, bgColor) {
  const { data, info } = await sharp(src)
    .trim({ threshold: 20 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  floodRemoveEdgeBackground(data, info, bgColor);

  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: info.channels },
  })
    .png()
    .toFile(out);

  const meta = await sharp(out).metadata();
  console.log(`Wrote ${out} (${meta.width}x${meta.height})`);
  return meta;
}

async function padSquare(src, out, size) {
  await sharp(src)
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(out);
}

const logoSrc = join(assetsDir, "spotra-logo-source.png");
const iconSrc = join(assetsDir, "spotra-icon-source.png");
const iconInvertedSrc = join(assetsDir, "spotra-icon-inverted-source.png");

const logoOut = join(publicDir, "spotra-logo.png");
const iconOut = join(publicDir, "spotra-icon.png");
const iconInvertedOut = join(publicDir, "spotra-icon-inverted.png");

await processRaster(logoSrc, logoOut, { r: 0, g: 0, b: 0 });
await processRaster(iconSrc, iconOut, { r: 255, g: 255, b: 255 });
await processRaster(iconInvertedSrc, iconInvertedOut, { r: 255, g: 255, b: 255 });

const iconSquare = join(publicDir, "spotra-icon-square.png");
const iconInvertedSquare = join(publicDir, "spotra-icon-inverted-square.png");
await padSquare(iconOut, iconSquare, 512);
await padSquare(iconInvertedOut, iconInvertedSquare, 512);

await padSquare(iconInvertedOut, join(__dirname, "..", "app", "icon.png"), 32);
await padSquare(iconOut, join(__dirname, "..", "app", "apple-icon.png"), 180);

for (const size of [48, 72, 96, 128, 192, 512]) {
  await padSquare(
    iconInvertedOut,
    join(publicDir, `spotra-icon-inverted-${size}.png`),
    size,
  );
}
