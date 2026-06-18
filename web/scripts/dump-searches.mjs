/**
 * One-time analytics dump — read every cached word lookup out of
 * Firestore and write per-language CSVs to scripts/out/.
 *
 * Run from web/ workspace:    node scripts/dump-searches.mjs
 *
 * Reads:
 *   - cache              every word ever searched (no counts — Firestore
 *                        caches one entry per (lang, tier, word, ctx),
 *                        subsequent searches just hit the cache so the
 *                        doc is created once and never bumped)
 *   - wordSearches       per-word counter, if the collection exists yet
 *                        (the counter ships with this change; older data
 *                        won't be there until the new code is live for
 *                        a bit)
 *
 * Writes (to scripts/out/):
 *   - searches-all-time-<lang>.csv     every unique word from `cache`,
 *                                       one row per word, no counts
 *   - searches-top-<lang>.csv           top words from `wordSearches`,
 *                                       sorted by count desc
 *
 * Env: requires FIREBASE_SERVICE_ACCOUNT to be set (same JSON the API
 * uses). Auto-loads it from web/.env.local if present.
 *
 * IMPORTANT: scripts/out/ is gitignored — the CSVs may contain
 * personal info (rare-spelled words can identify a user). Keep them
 * local; share Sheets via paste rather than the file itself if needed.
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot   = resolve(__dirname, "..");
const outDir    = resolve(webRoot, "scripts/out");

// --- 1) Load .env.local so the script picks up FIREBASE_SERVICE_ACCOUNT
//        when run outside Next's build pipeline ------------------------
async function loadEnvLocal() {
  const envPath = resolve(webRoot, ".env.local");
  if (!existsSync(envPath)) return;
  const text = await readFile(envPath, "utf8");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    // strip surrounding single or double quotes if present
    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

await loadEnvLocal();

const sa = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!sa) {
  console.error(
    "FIREBASE_SERVICE_ACCOUNT not set — copy it from Vercel " +
    "(vercel env pull web/.env.local) and try again."
  );
  process.exit(1);
}
let parsed;
try {
  parsed = JSON.parse(sa);
} catch {
  console.error("FIREBASE_SERVICE_ACCOUNT is not valid JSON.");
  process.exit(1);
}

if (getApps().length === 0) {
  initializeApp({ credential: cert(parsed), projectId: parsed.project_id });
}
const db = getFirestore();

await mkdir(outDir, { recursive: true });

// --- 2) Read the `cache` collection ---------------------------------
// Cache doc IDs come in two shapes:
//   auto2_<lang>_<tier>_<word>
//   ctx2_<lang>_<tier>_<word>_<ctx-up-to-60-chars>
// We extract (lang, word). For ctx2 we take everything up to the first
// `_` after the tier as the word (best-effort — words don't typically
// contain underscores).
const KEY_RE = /^(auto2|ctx2)_([a-z]+)_([a-z]+)_(.+)$/;

function parseCacheKey(id) {
  const m = id.match(KEY_RE);
  if (!m) return null;
  const [, kind, lang, tier, rest] = m;
  let word = rest;
  if (kind === "ctx2") {
    const ix = rest.indexOf("_");
    if (ix !== -1) word = rest.slice(0, ix);
  }
  return { kind, lang, tier, word };
}

console.log("Reading `cache` collection …");
const cacheSnap = await db.collection("cache").get();
console.log(`  ${cacheSnap.size} cache docs.`);

const perLang = new Map(); // lang -> Set<word>
let skipped = 0;
for (const doc of cacheSnap.docs) {
  const parsedKey = parseCacheKey(doc.id);
  if (!parsedKey) { skipped++; continue; }
  const { lang, word } = parsedKey;
  if (!perLang.has(lang)) perLang.set(lang, new Set());
  perLang.get(lang).add(word);
}
if (skipped) console.log(`  ${skipped} docs had unrecognised key shape — skipped.`);

// --- 3) Write per-language all-time CSVs ---------------------------
function csvEscape(s) {
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

for (const [lang, words] of perLang.entries()) {
  const sorted = [...words].sort();
  const lines = ["word"];
  for (const w of sorted) lines.push(csvEscape(w));
  const file = resolve(outDir, `searches-all-time-${lang}.csv`);
  await writeFile(file, lines.join("\n") + "\n", "utf8");
  console.log(`  wrote ${file} (${sorted.length} unique words)`);
}

// --- 4) Read `wordSearches` (may not exist yet) -------------------
console.log("Reading `wordSearches` collection (counter — may be empty if just deployed) …");
let wsSnap;
try {
  wsSnap = await db.collection("wordSearches").get();
  console.log(`  ${wsSnap.size} wordSearches docs.`);
} catch (e) {
  console.log("  wordSearches collection not accessible — skipping (this is fine if the counter just shipped):", e.message);
  wsSnap = null;
}

if (wsSnap && wsSnap.size > 0) {
  const perLangTop = new Map(); // lang -> Array<{word, count, lastAt}>
  for (const doc of wsSnap.docs) {
    const d = doc.data();
    if (!d.lang || !d.word) continue;
    if (!perLangTop.has(d.lang)) perLangTop.set(d.lang, []);
    perLangTop.get(d.lang).push({
      word: d.word,
      count: typeof d.count === "number" ? d.count : 0,
      lastAt: d.lastAt?.toDate?.()?.toISOString() ?? "",
    });
  }

  for (const [lang, rows] of perLangTop.entries()) {
    rows.sort((a, b) => b.count - a.count);
    const lines = ["word,count,lastAt"];
    for (const r of rows) {
      lines.push([csvEscape(r.word), r.count, r.lastAt].join(","));
    }
    const file = resolve(outDir, `searches-top-${lang}.csv`);
    await writeFile(file, lines.join("\n") + "\n", "utf8");
    console.log(`  wrote ${file} (${rows.length} words, top: ${rows[0]?.word} ×${rows[0]?.count})`);
  }
}

console.log("\nDone. CSVs are in scripts/out/ — open in Excel/Sheets.");
