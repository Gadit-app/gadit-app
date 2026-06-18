/**
 * Generate per-language Open Graph thumbnails — the social-card image
 * platforms (WhatsApp, Twitter, Facebook, Telegram, Slack, iMessage)
 * fetch and display when a Gadit link is shared.
 *
 * Outputs: web/public/og/<lang>.png  ·  1200 × 630, one per language.
 *
 * Source of truth: scripts/og-source.png
 *   The canonical design lives in this single file. To refresh the
 *   look, replace scripts/og-source.png with a new PNG (any size,
 *   1.91:1 aspect or close to it) and rerun this script. We keep the
 *   source PNG in scripts/ rather than public/ so it's not served
 *   to the web — only the rendered /og/<lang>.png files ship.
 *
 * Run from web/ workspace:    node scripts/build-og.mjs
 *
 * Current design (2026-06-18, locked by Gadi via ChatGPT image-gen):
 *   · Warm cream / off-white background with a faint vignette
 *   · 'Gad' in deep navy + 'it' italic in dark teal
 *   · A subtle teal arc in the bottom-right corner for depth
 *   · No tagline, no domain — wordmark only, so language-specific
 *     copy can live entirely in the meta description
 *
 * Because nothing in the image is language-specific, every
 * /og/<lang>.png is byte-identical — we keep one file per lang anyway
 * so layout.tsx can stay pointing at /og/<lang>.png without a
 * special fallback rule.
 *
 * WhatsApp note: WhatsApp crops landscape OG images to a square
 * thumbnail (center 630×630 of the 1200×630 canvas). The source PNG
 * has the wordmark inside that center region with breathing room,
 * so the square crop reads cleanly.
 */

import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot   = resolve(__dirname, "..");
const sourcePath = resolve(webRoot, "scripts/og-source.png");
const outDir    = resolve(webRoot, "public/og");

await mkdir(outDir, { recursive: true });

const LANGS = ["he", "en", "ar", "ru", "es", "pt", "fr", "de", "cs", "sk", "it", "ja"];

console.log(`Rendering OG cards from ${sourcePath} …`);

// Resize once into a buffer, then write 13 identical files (12 langs + default).
// `fit: "cover"` would crop if the source aspect drifted; `fit: "inside"` would
// letterbox. The source is exactly 1.904:1 (target 1.905:1) so the values are
// effectively equivalent — using "cover" so any small future aspect drift in a
// hand-replaced source crops cleanly instead of leaving paper-coloured bars.
const buf = await sharp(sourcePath)
  .resize(1200, 630, { fit: "cover", position: "center" })
  .png({ compressionLevel: 9 })
  .toBuffer();

async function writeTo(outFile) {
  await sharp(buf).png({ compressionLevel: 9 }).toFile(outFile);
  console.log(`  wrote ${outFile}`);
}

for (const lang of LANGS) {
  await writeTo(resolve(outDir, `${lang}.png`));
}
await writeTo(resolve(outDir, "default.png"));

console.log("Done.");
