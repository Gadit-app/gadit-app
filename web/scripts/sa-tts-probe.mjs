#!/usr/bin/env node
// South African languages: a 10-word read-aloud sample per language, to hear
// whether the read-aloud model we use (/api/tts: gpt-4o-mini-tts) pronounces
// each language before we rely on it (2026-10-15).
//
// SAFE BY DEFAULT: without --run it only prints the words and the estimated
// cost. With --run it calls the paid model once per word and saves the mp3
// files under --out (default: a folder in the system temp directory).
//
//   node scripts/sa-tts-probe.mjs                 # dry run: words + cost
//   node scripts/sa-tts-probe.mjs --run --lang=xh # one language
//   node scripts/sa-tts-probe.mjs --run           # all 8 (needs OPENAI_API_KEY)
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)(?:=(.*))?$/); return m ? [m[1], m[2] ?? true] : [a, true]; }));
const CODES = ["xh", "nso", "tn", "st", "ts", "ss", "ve", "nr"];
const langs = typeof args.lang === "string" ? args.lang.split(",") : CODES;
const OUT = path.resolve(typeof args.out === "string" ? args.out : path.join(os.tmpdir(), "gadit-sa-tts-probe"));

// The curated dictation words, read from the source file (no TypeScript runtime needed).
const src = readFileSync(path.join(HERE, "../src/lib/dictation-sets-native.ts"), "utf8");
const sets = JSON.parse(src.slice(src.indexOf("= {") + 2, src.lastIndexOf("};") + 1));
const sample = (lang) => {
  const all = Object.values(sets[lang] ?? {}).flatMap((s) => s.words.map((w) => w.he));
  const step = Math.max(1, Math.floor(all.length / 10));
  return all.filter((_, i) => i % step === 0).slice(0, 10);
};
// Same estimate as src/lib/ai-cost.ts ttsCostUsd (about 14 characters a second, $0.015 a minute).
const cost = (chars) => (chars / 14 / 60) * 0.015;

let total = 0;
for (const l of langs) {
  const words = sample(l);
  const c = words.reduce((s, w) => s + cost(w.length), 0);
  total += c;
  console.log(`${l}: ${words.join(", ")}  (~$${c.toFixed(4)})`);
}
console.log(`ESTIMATED TOTAL: ~$${total.toFixed(3)} for ${langs.length} languages x 10 words`);
if (!args.run) { console.log("DRY RUN: nothing was called. Add --run to generate the audio."); process.exit(0); }
const key = process.env.OPENAI_API_KEY;
if (!key) { console.error("OPENAI_API_KEY is not set"); process.exit(2); }
mkdirSync(OUT, { recursive: true });
for (const l of langs) for (const [i, w] of sample(l).entries()) {
  const r = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: "gpt-4o-mini-tts", voice: "nova", input: w, response_format: "mp3",
      instructions: "Pronounce this word accurately in its own South African language, clearly and slowly, like a teacher." }),
  });
  if (!r.ok) { console.error(`${l} ${w}: HTTP ${r.status}`); continue; }
  const f = path.join(OUT, `${l}-${String(i + 1).padStart(2, "0")}.mp3`);
  writeFileSync(f, Buffer.from(await r.arrayBuffer()));
  console.log(`saved ${f}  (${w})`);
}
