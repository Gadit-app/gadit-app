/**
 * Generate per-language Open Graph thumbnails — the social-card image
 * platforms (WhatsApp, Twitter, Facebook, Telegram, Slack, iMessage)
 * fetch and display when a Gadit link is shared.
 *
 * Outputs: web/public/og/<lang>.png  ·  1200 × 630, one per language.
 *
 * Run from web/ workspace:    node scripts/build-og.mjs
 *
 * Layout (Gadi locked it on 2026-06-18):
 *   · Solid soft-mint background (#E8F5F0) — pale, calm, hints at the
 *     teal brand colour without competing with the wordmark
 *   · 'Gad' in ink (#0B1220) + 'it' in teal italic (#0E7490), big,
 *     centered in the 630-square middle so WhatsApp's square crop
 *     catches it cleanly
 *   · NO tagline, NO domain — the wordmark IS the card. The reason:
 *     WhatsApp crops landscape OG images to a square thumbnail, and
 *     anything sitting below the wordmark gets clipped mid-letter,
 *     which looked messy. Per-language tagline lives in the META
 *     title/description that scrapers also pull, so language signal
 *     isn't lost.
 *
 * Because nothing in the image is language-specific anymore, every
 * /og/<lang>.png is byte-identical — we keep one file per lang anyway
 * so layout.tsx can stay pointing at /og/<lang>.png without a special
 * fallback rule.
 */

import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot   = resolve(__dirname, "..");
const outDir    = resolve(webRoot, "public/og");

await mkdir(outDir, { recursive: true });

const LANGS = ["he", "en", "ar", "ru", "es", "pt", "fr", "de", "cs", "sk", "it", "ja"];

const BG   = "#E8F5F0";  // soft mint paper
const INK  = "#0B1220";  // 'Gad'
const TEAL = "#0E7490";  // 'it' italic

const FONT = "'Inter', 'Helvetica Neue', 'Arial', sans-serif";

function makeSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
    <rect width="1200" height="630" fill="${BG}"/>
    <text x="600" y="380"
          font-family="${FONT}"
          font-size="280" font-weight="600"
          letter-spacing="-8"
          text-anchor="middle"
          fill="${INK}"
          direction="ltr">Gad<tspan font-style="italic" font-weight="500" fill="${TEAL}">it</tspan></text>
  </svg>`;
}

const svg = makeSvg();
const buf = Buffer.from(svg);

// Render once, then write 12 identical files (one per lang) + default.
console.log("Rendering OG card …");
async function renderTo(outFile) {
  await sharp(buf, { density: 200 })
    .resize(1200, 630, { fit: "contain", background: { r: 232, g: 245, b: 240, alpha: 1 } })
    .png({ compressionLevel: 9 })
    .toFile(outFile);
  console.log(`  wrote ${outFile}`);
}

for (const lang of LANGS) {
  await renderTo(resolve(outDir, `${lang}.png`));
}
await renderTo(resolve(outDir, "default.png"));

console.log("Done.");
