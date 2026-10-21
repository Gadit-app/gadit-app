// ONE-TIME migration for the new rank points model (Gadi 2026-10-21).
//
// The rank now counts new words (1 point) + completed practices (10 points,
// max 10 a day) instead of new words + understood words (10 points), and the
// thresholds moved. So that NO CHILD EVER GOES DOWN, every user with a notebook
// gets users/{uid}.rankFloor = the rank they have TODAY under the OLD formula
// and the OLD thresholds. The app then shows max(rank from points, rankFloor)
// (web/src/lib/rank-points.ts). An existing higher rankFloor is never lowered.
// Scout is everyone's start, so a scout floor is not written.
//
// Old "today" is computed generously (every notebook doc counts as a word,
// every understood:true doc adds 10), so it is at least what any surface
// showed (the notebook API hid "not found" lookups and capped at 500).
//
//   node scripts/rank-floor-migrate.mjs                      dry run (default): counts only
//   node scripts/rank-floor-migrate.mjs --apply              write rankFloor
//   node scripts/rank-floor-migrate.mjs --backfill-practices also seed users/{uid}.practiceCount
//        from families/*/kidActivity (kids' finished activities since 2026-10-12), only for days
//        not already counted; combine with --apply to write
//
// Admin SDK via C:\Users\gadib\.secrets\gadit-firebase-sa.json. With --apply a
// backup JSON of every touched users/{uid} doc (as it was) is written to the
// scratchpad dir first. A plan JSON is written on every run.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const admin = require("../../node_modules/firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require("C:/Users/gadib/.secrets/gadit-firebase-sa.json")) });
const db = admin.firestore();

const APPLY = process.argv.includes("--apply");
const BACKFILL = process.argv.includes("--backfill-practices");
const OUT_DIR = "C:/Users/gadib/AppData/Local/Temp/claude/c--Users-gadib-gadit-app/a58faa26-e863-4fc7-a78f-e012b1299627/scratchpad";
const STAMP = new Date().toISOString().replace(/[:.]/g, "-");

const OLD_RANKS = [
  ["scout", 0], ["explorer", 10], ["tracker", 30], ["ranger", 75], ["guide", 150], ["master", 300],
  ["champion", 450], ["sage", 650], ["virtuoso", 900], ["legend", 1200], ["wizard", 1600], ["grandmaster", 2200],
];
const NEW_RANKS = [
  ["scout", 0], ["explorer", 20], ["tracker", 60], ["ranger", 120], ["guide", 200], ["master", 320],
  ["champion", 480], ["sage", 700], ["virtuoso", 950], ["legend", 1250], ["wizard", 1650], ["grandmaster", 2200],
];
const KEYS = OLD_RANKS.map(([k]) => k);
const idxOf = (k) => KEYS.indexOf(k);
const rankIdx = (table, pts) => { let i = 0; table.forEach(([, min], j) => { if (pts >= min) i = j; }); return i; };
const PRACTICE_KINDS = new Set(["spell", "say", "pick", "lesson", "game", "read"]);
const CAP = 10;

// 1. Every notebook doc, grouped by owner uid (users/{uid}/notebook/{id} only).
const nb = await db.collectionGroup("notebook").select("understood").get();
const per = new Map(); // uid -> { words, understood }
for (const d of nb.docs) {
  const owner = d.ref.parent.parent;
  if (!owner || owner.parent.id !== "users") continue;
  const p = per.get(owner.id) ?? { words: 0, understood: 0 };
  p.words++;
  if (d.get("understood") === true) p.understood++;
  per.set(owner.id, p);
}

// 2. Optional: kids' finished activities -> practices per local day.
const backfill = new Map(); // uid -> { day: n }
if (BACKFILL) {
  const fams = await db.collection("families").select().get();
  const dayOf = (iso) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));
  for (const f of fams.docs) {
    const [members, acts] = await Promise.all([
      f.ref.collection("members").get(),
      f.ref.collection("kidActivity").get(),
    ]);
    const uidOfMember = new Map(members.docs.map((m) => [m.id, m.get("userId")]).filter(([, u]) => typeof u === "string" && u));
    for (const a of acts.docs) {
      const x = a.data();
      if (!PRACTICE_KINDS.has(x.kind) || typeof x.at !== "string") continue;
      const uid = uidOfMember.get(x.memberId);
      if (!uid) continue;
      const day = dayOf(x.at);
      const m = backfill.get(uid) ?? {};
      m[day] = (m[day] ?? 0) + 1;
      backfill.set(uid, m);
    }
  }
}

// 3. Read the user docs we may touch, plan the writes.
const uids = [...new Set([...per.keys(), ...backfill.keys()])];
const userDocs = new Map();
for (let i = 0; i < uids.length; i += 300) {
  const refs = uids.slice(i, i + 300).map((u) => db.collection("users").doc(u));
  for (const s of await db.getAll(...refs)) userDocs.set(s.id, s);
}

const byOld = Object.fromEntries(KEYS.map((k) => [k, 0]));
const floorsByRank = Object.fromEntries(KEYS.map((k) => [k, 0]));
let floorsKids = 0, wouldDrop = 0, keptHigher = 0, practiceUsers = 0, practiceAdded = 0, missingUserDoc = 0;
const plan = [];
for (const uid of uids) {
  const snap = userDocs.get(uid);
  const data = snap?.exists ? snap.data() : null;
  if (!data) missingUserDoc++;
  const update = {};
  const p = per.get(uid);
  let row = { uid };
  if (p) {
    const oldPts = p.words + p.understood * 10;
    const oldI = rankIdx(OLD_RANKS, oldPts);
    byOld[KEYS[oldI]]++;
    // What the new model alone gives today (no practices recorded yet, unless backfilled below).
    const newI = rankIdx(NEW_RANKS, p.words);
    if (oldI > newI) wouldDrop++;
    const existing = idxOf(data?.rankFloor);
    if (oldI > 0 && oldI > existing) {
      update.rankFloor = KEYS[oldI];
      floorsByRank[KEYS[oldI]]++;
      if (data?.familyRole === "kid") floorsKids++;
    } else if (existing >= oldI && existing > 0) keptHigher++;
    row = { ...row, words: p.words, understood: p.understood, oldPoints: oldPts, oldRank: KEYS[oldI], newRankFromWords: KEYS[newI], existingFloor: data?.rankFloor ?? null };
  }
  const bf = backfill.get(uid);
  if (bf) {
    const have = data?.practiceCount && typeof data.practiceCount === "object" ? data.practiceCount : {};
    const add = {};
    for (const [day, n] of Object.entries(bf)) if (!(day in have)) add[day] = n;
    if (Object.keys(add).length) {
      update.practiceCount = add;
      practiceUsers++;
      practiceAdded += Object.values(add).reduce((s, n) => s + Math.min(CAP, n), 0);
      row.practiceBackfill = add;
    }
  }
  if (Object.keys(update).length) plan.push({ ...row, update });
}

const summary = {
  mode: APPLY ? "APPLY" : "DRY RUN",
  notebookDocs: nb.size,
  usersWithNotebook: per.size,
  oldRankToday: byOld,
  floorsToWrite: plan.filter((r) => r.update.rankFloor).length,
  floorsToWriteKids: floorsKids,
  floorsToWriteByRank: Object.fromEntries(Object.entries(floorsByRank).filter(([, n]) => n > 0)),
  scoutNoFloorNeeded: byOld.scout,
  alreadyHadEqualOrHigherFloor: keptHigher,
  wouldGoDownWithoutFloor: wouldDrop,
  missingUserDoc,
  ...(BACKFILL ? { practiceBackfillUsers: practiceUsers, practiceBackfillCountedPractices: practiceAdded } : {}),
};
fs.mkdirSync(OUT_DIR, { recursive: true });
const planFile = path.join(OUT_DIR, `rank-floor-plan-${STAMP}.json`);
fs.writeFileSync(planFile, JSON.stringify({ summary, plan }, null, 2));
console.log(JSON.stringify(summary, null, 2));
console.log("plan:", planFile);

if (!APPLY) {
  console.log("Dry run: nothing written. Re-run with --apply to write.");
  process.exit(0);
}

// 4. Backup every doc we touch, then write in batches.
const backupFile = path.join(OUT_DIR, `rank-floor-backup-${STAMP}.json`);
fs.writeFileSync(backupFile, JSON.stringify(plan.map((r) => {
  const s = userDocs.get(r.uid);
  return { uid: r.uid, exists: !!s?.exists, data: s?.exists ? s.data() : null };
}), null, 2));
console.log("backup:", backupFile);
let written = 0;
for (let i = 0; i < plan.length; i += 400) {
  const batch = db.batch();
  for (const r of plan.slice(i, i + 400)) batch.set(db.collection("users").doc(r.uid), r.update, { merge: true });
  await batch.commit();
  written += Math.min(400, plan.length - i);
}
console.log(`written: ${written} user docs`);
