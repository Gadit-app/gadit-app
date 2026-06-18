/**
 * Generate per-language Open Graph thumbnails — the social-card image
 * platforms (WhatsApp, Twitter, Facebook, Telegram, Slack, iMessage)
 * fetch and display when a Gadit link is shared.
 *
 * Outputs: web/public/og/<lang>.png  ·  1200 × 630, one per language.
 *
 * Run from web/ workspace:    node scripts/build-og.mjs
 *
 * Layout per image (matches the Wordbook shell wordmark visually):
 *   · Paper background (#F4F5F8) — same surface used across all chrome
 *   · 'Gad' in ink (#0B1220) + 'it' in teal italic (#0E7490) — the
 *     wordmark, same color split as the topbar
 *   · Tagline in slate (#3F4856) below
 *   · 'GADIT.APP' watermark at the bottom in faint ink
 *
 * Rendering uses sharp via SVG. Fonts are not embedded — sharp falls
 * back to whatever fonts the rendering environment has (we render on
 * Gadi's local machine before committing). Hebrew / Arabic / Japanese
 * fall back to system Noto / Arial Unicode, which is acceptable for a
 * static OG image — the visual is dominated by the Latin 'Gadit'.
 */

import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot   = resolve(__dirname, "..");
const outDir    = resolve(webRoot, "public/og");

await mkdir(outDir, { recursive: true });

// Taglines — these must match the META titles in src/app/layout.tsx
// (minus the "Gadit — " prefix) so the social-card wording is
// consistent with the OpenGraph <meta> the same scrapers pull.
const TAGLINES = {
  he: "להבין מילים עד הסוף",
  en: "Understand words to the end",
  ar: "لفهم الكلمات حتى النهاية",
  ru: "Понять слова до конца",
  es: "Entender las palabras hasta el final",
  pt: "Entender as palavras até o fim",
  fr: "Comprendre les mots jusqu'au bout",
  de: "Wörter bis zum Ende verstehen",
  cs: "Pochopit slova do konce",
  sk: "Pochopiť slová do konca",
  it: "Capire le parole fino in fondo",
  ja: "言葉を最後まで理解する",
};

// Pulled from globals.css :root tokens so the OG looks like an
// extension of the in-app chrome rather than a separate brand asset.
const COLORS = {
  paper: "#F4F5F8",   // --paper
  ink:   "#0B1220",   // --ink (Gad)
  teal:  "#0E7490",   // --teal (it)
  slate: "#3F4856",   // --ink-soft (tagline)
  faint: "#9CA3AF",   // --ink-faint (GADIT.APP watermark)
};

const FONT_STACK = {
  // Latin scripts use a system stack with Inter first (used in-app);
  // sharp/libvips will fall back to whatever the rendering machine has.
  latin: "'Inter', 'Helvetica Neue', 'Arial', sans-serif",
  he: "'Rubik', 'Heebo', 'Arial Hebrew', 'Arial', sans-serif",
  ar: "'Cairo', 'Noto Naskh Arabic', 'Arial', sans-serif",
  ja: "'Noto Sans JP', 'Yu Gothic', 'Hiragino Sans', sans-serif",
};

function fontFor(lang) {
  if (lang === "he") return FONT_STACK.he;
  if (lang === "ar") return FONT_STACK.ar;
  if (lang === "ja") return FONT_STACK.ja;
  return FONT_STACK.latin;
}

// Hebrew/Arabic need RTL direction. Japanese reads LTR for our short
// taglines (vertical writing would look strange on a 16:9 card).
function dirFor(lang) {
  return lang === "he" || lang === "ar" ? "rtl" : "ltr";
}

function makeSvg(lang) {
  const tagline = TAGLINES[lang];
  const direction = dirFor(lang);
  const font = fontFor(lang);

  // Tagline length varies a lot across languages; the longest (es/fr)
  // need a slightly smaller font size to fit one line at 1200px wide
  // with breathing room. Quick heuristic: shrink past 28 chars.
  const tagSize = tagline.length > 30 ? 52 : 60;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
    <!-- Paper background, same surface token used in-app -->
    <rect width="1200" height="630" fill="${COLORS.paper}"/>

    <!-- Subtle gradient overlay top→bottom for a hint of depth without
         making it look like a marketing banner. -->
    <defs>
      <linearGradient id="depth" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#depth)"/>

    <!-- Gadit wordmark — ink 'Gad' + teal italic 'it', same color
         split the topbar uses everywhere. Always LTR. -->
    <text x="600" y="310"
          font-family="${FONT_STACK.latin}"
          font-size="220" font-weight="600"
          letter-spacing="-6"
          text-anchor="middle"
          fill="${COLORS.ink}"
          direction="ltr">Gad<tspan font-style="italic" font-weight="500" fill="${COLORS.teal}">it</tspan></text>

    <!-- Tagline in slate, language-specific. RTL for HE/AR. -->
    <text x="600" y="420"
          font-family="${font}"
          font-size="${tagSize}" font-weight="500"
          text-anchor="middle"
          fill="${COLORS.slate}"
          direction="${direction}">${tagline}</text>

    <!-- GADIT.APP watermark at the bottom, low-contrast, LTR. -->
    <text x="600" y="565"
          font-family="${FONT_STACK.latin}"
          font-size="22" font-weight="600"
          letter-spacing="3"
          text-anchor="middle"
          fill="${COLORS.faint}"
          direction="ltr">GADIT.APP</text>
  </svg>`;
}

console.log("Rendering OG images per language…");
for (const lang of Object.keys(TAGLINES)) {
  const out = resolve(outDir, `${lang}.png`);
  const svg = makeSvg(lang);
  await sharp(Buffer.from(svg), { density: 200 })
    .resize(1200, 630, { fit: "contain", background: { r: 244, g: 245, b: 248, alpha: 1 } })
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log(`  wrote ${out}`);
}

// Default fallback = English. Used when language can't be resolved.
const enSvg = makeSvg("en");
await sharp(Buffer.from(enSvg), { density: 200 })
  .resize(1200, 630, { fit: "contain", background: { r: 244, g: 245, b: 248, alpha: 1 } })
  .png({ compressionLevel: 9 })
  .toFile(resolve(outDir, "default.png"));
console.log(`  wrote default.png (= en)`);

console.log("Done.");
