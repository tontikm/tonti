import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

const src = join(publicDir, "tonti-logo-full.jpg");
const out = join(publicDir, "tonti-logo.png");

// Trim the solid black border so the wordmark sits flush, then keep a
// transparent background so the logo drops onto any dark surface cleanly.
const { data, info } = await sharp(src)
  .trim({ threshold: 20 })
  .toBuffer({ resolveWithObject: true });

// Make near-black pixels transparent so only the white wordmark shows.
const { width, height } = info;

await sharp(data)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })
  .then(({ data: raw, info: rawInfo }) => {
    const channels = rawInfo.channels;
    for (let i = 0; i < raw.length; i += channels) {
      const r = raw[i];
      const g = raw[i + 1];
      const b = raw[i + 2];
      if (r < 24 && g < 24 && b < 24) {
        raw[i + 3] = 0;
      }
    }
    return sharp(raw, {
      raw: { width: rawInfo.width, height: rawInfo.height, channels },
    })
      .png()
      .toFile(out);
  });

console.log(`Wrote ${out} (${width}x${height})`);
