/**
 * Generate per-language Open Graph thumbnails — the social-card image
 * platforms (WhatsApp, Twitter, Facebook, Telegram, Slack, iMessage)
 * fetch and display when a Gadit link is shared.
 *
 * Outputs: web/public/og/<lang>.jpg  ·  1200 × 630, one per language.
 *
 * Source of truth: scripts/og-source.png
 *   The canonical design lives in this single file. To refresh the
 *   look, replace scripts/og-source.png with a new PNG (any size,
 *   1.91:1 aspect or close to it) and rerun this script. We keep the
 *   source PNG in scripts/ rather than public/ so it's not served
 *   to the web — only the rendered /og/<lang>.jpg files ship.
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
 * Format note (2026-06-18 incident):
 *   WhatsApp's OG scraper silently dropped our 928 KB PNG — the title
 *   + description rendered but the thumbnail slot stayed empty. The
 *   scraper has a tight per-image budget; PNG of a gradient-heavy
 *   design balloons to ~1 MB while a mozjpeg q85 of the SAME pixels
 *   is ~25 KB with no visible quality loss. We now ship .jpg.
 *
 * Because nothing in the image is language-specific, every
 * /og/<lang>.jpg is byte-identical — we keep one file per lang anyway
 * so layout.tsx can stay pointing at /og/<lang>.jpg without a
 * special fallback rule.
 *
 * WhatsApp note: WhatsApp crops landscape OG images to a square
 * thumbnail (center 630×630 of the 1200×630 canvas). The source PNG
 * has the wordmark inside that center region with breathing room,
 * so the square crop reads cleanly.
 */

import sharp from "sharp";
import { mkdir, unlink } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot   = resolve(__dirname, "..");
const sourcePath = resolve(webRoot, "scripts/og-source.png");
const outDir    = resolve(webRoot, "public/og");

await mkdir(outDir, { recursive: true });

const LANGS = ["he", "en", "ar", "ru", "es", "pt", "fr", "de", "cs", "sk", "it", "ja"];

console.log(`Rendering OG cards from ${sourcePath} …`);

// Encode once into a JPEG buffer, then write 13 identical files
// (12 langs + default). mozjpeg + q85 gives ~25 KB at 1200×630 for
// this gradient-heavy design with no visually detectable loss.
const buf = await sharp(sourcePath)
  .resize(1200, 630, { fit: "cover", position: "center" })
  .jpeg({ quality: 85, mozjpeg: true })
  .toBuffer();

async function writeTo(outFile) {
  await sharp(buf).jpeg({ quality: 85, mozjpeg: true }).toFile(outFile);
  console.log(`  wrote ${outFile}`);
}

for (const lang of LANGS) {
  await writeTo(resolve(outDir, `${lang}.jpg`));
}
await writeTo(resolve(outDir, "default.jpg"));

// Remove any leftover .png files from the previous design so neither
// stale CDN caches nor old crawler caches keep serving them.
const STALE_PNGS = [...LANGS, "default"].map((n) => resolve(outDir, `${n}.png`));
for (const p of STALE_PNGS) {
  try { await unlink(p); console.log(`  removed stale ${p}`); }
  catch { /* missing is fine */ }
}

console.log("Done.");
