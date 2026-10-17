#!/usr/bin/env node
// Checks a landing copy file against the English master (2026-10-17):
// same keys, same list lengths, the same image names, every {placeholder}
// kept, no long dashes, "Gadit" written in Latin letters, nothing left in
// English by mistake (a string identical to the English one is reported).
// Usage (from web/): node scripts/landing/check-i18n.mjs <lang> [<lang> ...]   (or "all")
import { readdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";

const PAGES = ["individuals", "families", "schools"];
const KEEP = new Set(["img", "img2", "icon", "phone"]);
// Strings that may stay the same as the English (names, brand, numbers).
const SAME_OK = /^(Gadit|Individual|Family|Gadit Family|\{\w+\}.*|[\d\s$,.%{}a-z_-]*)$/;
const load = async (page, lang) => (await import(pathToFileURL(path.resolve(`src/app/${page}/i18n/${lang}.ts`)).href)).default;

function walk(en, x, p, out) {
  if (typeof en === "string") {
    if (typeof x !== "string") return out.push(`${p}: not text`);
    const ph = (s) => (s.match(/\{\w+\}/g) ?? []).sort().join();
    if (ph(en) !== ph(x)) out.push(`${p}: placeholders ${ph(en)} != ${ph(x)}`);
    if (/[–—]/.test(x)) out.push(`${p}: long dash`);
    if (/Gadit/.test(en) && !/Gadit/.test(x)) out.push(`${p}: "Gadit" missing (keep it in Latin letters)`);
    if (en.length > 12 && x === en && !SAME_OK.test(en)) out.push(`${p}: identical to English`);
    if ((en.match(/\n/g) ?? []).length !== (x.match(/\n/g) ?? []).length) out.push(`${p}: line breaks ${(en.match(/\n/g) ?? []).length} != ${(x.match(/\n/g) ?? []).length}`);
    return;
  }
  if (Array.isArray(en)) {
    if (!Array.isArray(x)) return out.push(`${p}: not a list`);
    if (en.length !== x.length) out.push(`${p}: ${x.length} items, English has ${en.length}`);
    en.forEach((v, i) => x[i] !== undefined && walk(v, x[i], `${p}[${i}]`, out));
    return;
  }
  if (en && typeof en === "object") {
    if (!x || typeof x !== "object") return out.push(`${p}: not an object`);
    for (const k of Object.keys(en)) {
      if (!(k in x)) { out.push(`${p}.${k}: missing`); continue; }
      if (KEEP.has(k)) { if (JSON.stringify(en[k]) !== JSON.stringify(x[k])) out.push(`${p}.${k}: must stay ${JSON.stringify(en[k])}`); continue; }
      walk(en[k], x[k], `${p}.${k}`, out);
    }
    for (const k of Object.keys(x)) if (!(k in en)) out.push(`${p}.${k}: not in English`);
    return;
  }
  if (en !== x) out.push(`${p}: ${JSON.stringify(x)} != ${JSON.stringify(en)}`);
}

let langs = process.argv.slice(2);
if (langs[0] === "all") langs = [...new Set(PAGES.flatMap((p) => readdirSync(`src/app/${p}/i18n`).filter((f) => f.endsWith(".ts") && !["types.ts", "index.ts", "en.ts", "he.ts"].includes(f)).map((f) => f.slice(0, -3))))].sort();
let bad = 0;
for (const lang of langs) {
  for (const page of PAGES) {
    let x;
    try { x = await load(page, lang); } catch (e) { console.log(`${lang} ${page}: MISSING or broken (${String(e.message).split("\n")[0]})`); bad++; continue; }
    const out = [];
    walk(await load(page, "en"), x, page, out);
    console.log(`${lang} ${page}: ${out.length ? `${out.length} problems` : "OK"}`);
    for (const o of out.slice(0, 40)) console.log(`   ${o}`);
    bad += out.length;
  }
}
process.exit(bad ? 1 : 0);
