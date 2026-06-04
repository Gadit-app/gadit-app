/**
 * Generate per-language Open Graph thumbnails — the social-card image
 * platforms (WhatsApp, Twitter, Facebook, Telegram, Slack, iMessage)
 * fetch and display when a Gadit link is shared.
 *
 * Outputs: web/public/og/<lang>.png  ·  1200 × 630, one per language.
 *
 * Run from web/ workspace:    node scripts/build-og.mjs
 *
 * Layout per image:
 *   · Teal background (#0EA5A5)
 *   · 'Gadit' wordmark, large, centered upper area
 *   · Tagline in the relevant language, smaller, centered below
 *   · Subtle decorative G icon mark bottom-right
 *
 * Rendering uses sharp via SVG. Fonts are not embedded — sharp falls
 * back to whatever fonts the rendering environment has (we render on
 * Gadi's local machine before committing). Hebrew / Arabic fall back
 * to system Noto / Arial Unicode, which is acceptable for a static
 * OG image — the visual is dominated by the Latin 'Gadit' anyway.
 */

import sharp from "sharp";
import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot   = resolve(__dirname, "..");
const outDir    = resolve(webRoot, "public/og");

await mkdir(outDir, { recursive: true });

const TAGLINES = {
  he: "להבין מילים עד הסוף",
  en: "Understand words to the end",
  ar: "افهم الكلمات حتى النهاية",
  ru: "Понять слова до конца",
  es: "Entender palabras hasta el final",
  pt: "Entender palavras até o fim",
  fr: "Comprendre les mots jusqu'au bout",
};

const FONT_STACK = {
  // Latin scripts use the modern sans default; HE/AR fall back to a
  // wider stack so the system can pick whatever's installed.
  latin: "'Inter', 'Helvetica Neue', 'Arial', sans-serif",
  he: "'Rubik', 'Heebo', 'Arial Hebrew', 'Arial', sans-serif",
  ar: "'Cairo', 'Noto Naskh Arabic', 'Arial', sans-serif",
};

function fontFor(lang) {
  if (lang === "he") return FONT_STACK.he;
  if (lang === "ar") return FONT_STACK.ar;
  return FONT_STACK.latin;
}

// Hebrew/Arabic need RTL direction on the text element. The text is
// already in logical order in the source string, but the SVG must
// declare direction so the renderer doesn't reverse it.
function dirFor(lang) {
  return lang === "he" || lang === "ar" ? "rtl" : "ltr";
}

function makeSvg(lang) {
  const tagline = TAGLINES[lang];
  const direction = dirFor(lang);
  const font = fontFor(lang);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
    <!-- Solid teal background, with a soft top gradient for depth -->
    <rect width="1200" height="630" fill="#0EA5A5"/>
    <rect width="1200" height="315" fill="url(#topGloss)" opacity="0.10"/>
    <defs>
      <linearGradient id="topGloss" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
      </linearGradient>
    </defs>

    <!-- Gadit wordmark — Latin always, so direction stays LTR and
         font is Inter from the latin stack. 'it' tinted slightly
         off-white to echo the in-app teal italic 'it' on white. -->
    <text x="600" y="305"
          font-family="${FONT_STACK.latin}"
          font-size="180" font-weight="700"
          letter-spacing="-8"
          text-anchor="middle"
          fill="#FFFFFF"
          direction="ltr">Gad<tspan font-style="italic" font-weight="500" fill="#CDEFEA">it</tspan></text>

    <!-- Tagline — language-specific. RTL for HE/AR. -->
    <text x="600" y="410"
          font-family="${font}"
          font-size="46" font-weight="500"
          text-anchor="middle"
          fill="rgba(255,255,255,0.92)"
          direction="${direction}">${tagline}</text>

    <!-- Small ‘gadit.app’ host line at the bottom, low-key, LTR. -->
    <text x="600" y="560"
          font-family="${FONT_STACK.latin}"
          font-size="22" font-weight="500"
          letter-spacing="2"
          text-anchor="middle"
          fill="rgba(255,255,255,0.55)"
          direction="ltr">GADIT.APP</text>
  </svg>`;
}

console.log("Rendering OG images per language…");
for (const lang of Object.keys(TAGLINES)) {
  const out = resolve(outDir, `${lang}.png`);
  const svg = makeSvg(lang);
  await sharp(Buffer.from(svg), { density: 200 })
    .resize(1200, 630, { fit: "contain", background: { r: 14, g: 165, b: 165, alpha: 1 } })
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log(`  wrote ${out}`);
}

// Also write a default `default.png` = the English one — used as the
// fallback OG when the page can't determine a specific language.
const enSvg = makeSvg("en");
await sharp(Buffer.from(enSvg), { density: 200 })
  .resize(1200, 630, { fit: "contain", background: { r: 14, g: 165, b: 165, alpha: 1 } })
  .png({ compressionLevel: 9 })
  .toFile(resolve(outDir, "default.png"));
console.log(`  wrote default.png (= en)`);

console.log("Done.");
