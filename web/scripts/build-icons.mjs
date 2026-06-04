/**
 * Regenerate all favicon / PWA icon PNG variants from public/favicon.svg.
 *
 * Run from the web/ workspace:
 *   node scripts/build-icons.mjs
 *
 * Outputs (all written into web/public/):
 *   favicon-32x32.png         · 32x32, standard browser tab icon
 *   favicon-96x96.png         · 96x96, used by some Android setups
 *   apple-touch-icon.png      · 180x180, iOS home-screen
 *   icon-192.png              · 192x192, PWA manifest
 *   icon-512.png              · 512x512, PWA manifest
 *   icon-192-maskable.png     · 192x192, with safe-zone padding
 *   icon-512-maskable.png     · 512x512, with safe-zone padding
 *   src/app/favicon.ico       · 32x32 PNG renamed .ico (Next.js convention)
 *
 * Maskable icons add a 10% safe-zone padding all around so Android's
 * adaptive-icon crop never clips the G regardless of mask shape.
 */

import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot   = resolve(__dirname, "..");
const publicDir = resolve(webRoot, "public");
const appDir    = resolve(webRoot, "src/app");

const svgPath = resolve(publicDir, "favicon.svg");
const svg     = await readFile(svgPath);

async function renderTo(outPath, size) {
  await sharp(svg, { density: 384 })
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(outPath);
  console.log(`  wrote ${outPath}`);
}

// Maskable variant: same icon scaled to 80% of the canvas, centered on
// the teal fill color so Android's adaptive-icon mask never clips
// content. Wrapped in an outer SVG that paints the squircle full-bleed
// then nests the original at the safe-zone scale.
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#0EA5A5"/>
  <g transform="translate(51 51) scale(0.8)">
    ${svg.toString().replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "")}
  </g>
</svg>`;

async function renderMaskable(outPath, size) {
  await sharp(Buffer.from(maskableSvg), { density: 384 })
    .resize(size, size, { fit: "cover" })
    .png({ compressionLevel: 9 })
    .toFile(outPath);
  console.log(`  wrote ${outPath} (maskable)`);
}

console.log("Rendering icons from public/favicon.svg…");

await renderTo(resolve(publicDir, "favicon-32x32.png"),    32);
await renderTo(resolve(publicDir, "favicon-96x96.png"),    96);
await renderTo(resolve(publicDir, "apple-touch-icon.png"), 180);
await renderTo(resolve(publicDir, "icon-192.png"),         192);
await renderTo(resolve(publicDir, "icon-512.png"),         512);
await renderMaskable(resolve(publicDir, "icon-192-maskable.png"), 192);
await renderMaskable(resolve(publicDir, "icon-512-maskable.png"), 512);

// favicon.ico — modern browsers accept a PNG with .ico extension.
// Write a 32×32 PNG to both public/favicon.ico AND src/app/favicon.ico
// (Next.js App Router serves src/app/favicon.ico in preference to
// public/favicon.ico, so both need to be in sync).
const icoBuffer = await sharp(svg, { density: 384 })
  .resize(32, 32, { fit: "contain" })
  .png()
  .toBuffer();
await writeFile(resolve(publicDir, "favicon.ico"), icoBuffer);
console.log(`  wrote ${resolve(publicDir, "favicon.ico")} (32x32 PNG)`);
await writeFile(resolve(appDir, "favicon.ico"), icoBuffer);
console.log(`  wrote ${resolve(appDir, "favicon.ico")} (32x32 PNG)`);

console.log("Done.");
