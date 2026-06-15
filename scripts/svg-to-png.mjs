#!/usr/bin/env node
/**
 * One-shot SVG → PNG converter for the Gadit wordmark.
 *
 * Uses @resvg/resvg-js (zero deps, ~10MB, pure Node) installed on
 * the fly via npm cache. No global tooling required.
 *
 * Usage:
 *   node scripts/svg-to-png.mjs web/public/wordmark-stripe.svg \
 *        web/public/wordmark-stripe.png 1200
 */

import { readFileSync, writeFileSync } from "node:fs";
import { Resvg } from "@resvg/resvg-js";

const [, , inputPath, outputPath, widthArg] = process.argv;
if (!inputPath || !outputPath) {
  console.error("Usage: node svg-to-png.mjs <input.svg> <output.png> [width]");
  process.exit(1);
}

const svg = readFileSync(inputPath, "utf8");
const width = parseInt(widthArg || "1200", 10);

const resvg = new Resvg(svg, {
  fitTo: { mode: "width", value: width },
  font: {
    loadSystemFonts: true,
    defaultFontFamily: "Inter",
  },
});
const pngData = resvg.render().asPng();
writeFileSync(outputPath, pngData);

console.log(`wrote ${outputPath} (${pngData.length} bytes, ${width}px wide)`);
