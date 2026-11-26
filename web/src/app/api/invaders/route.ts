import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { dayKeyOf } from "@/lib/journey/scheduler";
import { INV_SETS, INV_VARIANTS } from "@/lib/invaders/content";
import { INV_SCENE, invPicKey, invSceneKey } from "@/lib/invaders/keys";
import { applyRound, cleanSense, CLUES, type Clue, type SenseEvent, type WordState } from "@/lib/invaders/progress";
import { baseOf } from "@/lib/invaders/rules";
import { SIGNS, STATIONS, type NqWord, type SignId } from "@/lib/invaders/niqqud";
import { applyNqRound, cleanNq, NQ, type NqCall, type NqRound } from "@/lib/invaders/niqqud-progress";
import nqHe from "@/lib/invaders/niqqud-he.json";
import { lookupImages } from "@/lib/play-images";
import { cachedPickImages } from "@/lib/classroom-image";

/**
 * The Invading Words (Gadi 2026-11-24). Testers and the admin only for now.
 *
 * GET  /api/invaders?lang=he
 *   The words, each meaning with its gloss and the URLs of its pictures
 *   (only drawn pictures are listed), the impostor rules, and this profile's
 *   progress per meaning.
 * POST /api/invaders  { lang, w, ids, events:[{id, r:"caught"|"missed", c:"p1"|"p2"|"g"}], mistakes, tz }
 *   One round of one word. Keeps the progress in users/{uid}/invaders/{lang}_{w}
 *   (written by the server only) and pays Wordies for learning
 *   (lib/invaders/progress.ts) into users/{uid}/journey/state.bonus, the same
 *   balance as the journey and the shop.
 *
 * The niqqud door (Gadi 2026-11-25, lib/invaders/niqqud.ts):
 * GET  /api/invaders?door=niqqud
 *   The words with their pictures (only words that have one), this profile's
 *   progress, and whether it may jump to any station (the admin and testers).
 * POST /api/invaders  { door: "niqqud", rid, station, stage, calls:[{clean, ok, mix}], tz }
 *   One round. Keeps the progress in users/{uid}/invaders/niqqud_he (no `lang`
 *   field, so the words door never reads it) and pays its Wordies into the
 *   same journey balance (lib/invaders/niqqud-progress.ts).
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "gadibenlavi@gmail.com";

async function who(req: NextRequest): Promise<{ uid: string; canJump: boolean } | { error: string; status: number }> {
  const h = req.headers.get("authorization") || "";
  const token = h.toLowerCase().startsWith("bearer ") ? h.slice(7).trim() : "";
  if (!token) return { error: "login_required", status: 401 };
  let d: Awaited<ReturnType<ReturnType<typeof getAdminAuth>["verifyIdToken"]>>;
  try {
    d = await getAdminAuth().verifyIdToken(token);
  } catch {
    return { error: "login_required", status: 401 };
  }
  const admin = d.email === ADMIN_EMAIL && d.email_verified === true;
  if (!admin) {
    // a failed read here is the server's failure (500), not a bad sign-in: the device keeps its round and sends it again
    const u = await getAdminDb().collection("users").doc(d.uid).get();
    if (u.data()?.tester !== true) return { error: "not_open", status: 403 };
  }
  // Everyone who may open the game today may also jump (the admin and testers).
  return { uid: d.uid, canJump: true };
}

const progressOf = (uid: string) => getAdminDb().collection("users").doc(uid).collection("invaders");

/* ---------- the niqqud door ---------- */
const NQ_DOC = "niqqud_he";
const NQ_WORDS = (nqHe as { words: NqWord[] }).words;
const STATION_IDS = STATIONS.map((s) => s.id);
const SIGN_IDS = Object.keys(SIGNS);

async function niqqudGet(uid: string, canJump: boolean) {
  const pics = await lookupImages(NQ_WORDS.map((w) => w.p), { pick: true });
  // A pick picture stored under a capitalized word ("Tail") escapes the word query; its key does not.
  const missing = [...new Set(NQ_WORDS.map((w) => w.p).filter((p) => !pics[p]))];
  if (missing.length) Object.assign(pics, await cachedPickImages(missing));
  const snap = await progressOf(uid).doc(NQ_DOC).get();
  return {
    words: NQ_WORDS.filter((w) => pics[w.p]).map((w) => ({ ...w, pic: pics[w.p] })),
    progress: cleanNq(snap.data(), STATION_IDS, SIGN_IDS),
    canJump,
  };
}

/** The round as sent, made safe; null = not a round. Unknown signs are dropped. */
function readRound(b: Record<string, unknown> | null): NqRound | null {
  const rid = typeof b?.rid === "string" && /^[A-Za-z0-9-]{6,40}$/.test(b.rid) ? b.rid : null;
  const station = typeof b?.station === "string" && STATION_IDS.includes(b.station) ? b.station : null;
  const stage = b?.stage === 1 || b?.stage === 2 || b?.stage === 3 ? b.stage : null;
  if (!rid || !station || !stage || !Array.isArray(b?.calls) || b.calls.length > NQ.calls) return null;
  const sign = (x: unknown): x is SignId => typeof x === "string" && SIGN_IDS.includes(x);
  const calls: NqCall[] = (b.calls as Array<Record<string, unknown>>).map((c) => ({
    clean: c?.clean === true,
    ok: Array.isArray(c?.ok) ? c.ok.filter(sign).slice(0, 10) : [],
    mix: Array.isArray(c?.mix)
      ? (c.mix as unknown[]).filter((m): m is [SignId, SignId] => Array.isArray(m) && m.length === 2 && sign(m[0]) && sign(m[1])).slice(0, 20)
      : [],
  }));
  return { rid, station, stage, calls };
}

async function niqqudPost(uid: string, canJump: boolean, b: Record<string, unknown> | null) {
  const r = readRound(b);
  if (!r) return NextResponse.json({ error: "bad_round" }, { status: 400 });
  const tz = typeof b?.tz === "string" && b.tz.length <= 64 ? b.tz : "UTC";
  let today: string;
  try { today = dayKeyOf(new Date(), tz); } catch { today = dayKeyOf(new Date(), "UTC"); }
  const db = getAdminDb();
  const ref = progressOf(uid).doc(NQ_DOC);
  const out = await db.runTransaction(async (tx) => {
    const prev = cleanNq((await tx.get(ref)).data(), STATION_IDS, SIGN_IDS);
    const res = applyNqRound(prev, r, STATION_IDS, today, canJump);
    if (res.counted) tx.set(ref, { door: "niqqud", ...res.state, updated: new Date().toISOString() });
    if (res.wordies > 0) tx.set(db.collection("users").doc(uid).collection("journey").doc("state"), { bonus: FieldValue.increment(res.wordies) }, { merge: true });
    return res;
  });
  return NextResponse.json({ ok: true, counted: out.counted, passed: out.passed, firstPass: out.firstPass, stationDone: out.stationDone, wordies: out.wordies, state: out.state });
}
const docId = (lang: string, w: string) => `${lang}_${w}`;

function readWord(d: FirebaseFirestore.DocumentData | undefined): WordState {
  const s: WordState["s"] = {};
  const raw = d?.s && typeof d.s === "object" ? (d.s as Record<string, unknown>) : {};
  for (const [k, v] of Object.entries(raw)) if (/^[a-z0-9-]{1,40}$/.test(k)) s[k] = cleanSense(v);
  return {
    s,
    cleared: typeof d?.cleared === "string" ? d.cleared : null,
    mistakes: typeof d?.mistakes === "number" && d.mistakes > 0 ? Math.floor(d.mistakes) : 0,
  };
}

export async function GET(req: NextRequest) {
  const me = await who(req);
  if ("error" in me) return NextResponse.json({ error: me.error }, { status: me.status });
  if (req.nextUrl.searchParams.get("door") === "niqqud") return NextResponse.json(await niqqudGet(me.uid, me.canJump));
  const lang = req.nextUrl.searchParams.get("lang") || "he";
  const set = INV_SETS[lang];
  if (!set) return NextResponse.json({ error: "no_words", words: [] }, { status: 200 });

  const db = getAdminDb();
  const keys: { w: string; id: string; v: number; key: string }[] = [];
  for (const word of set.words) for (const s of word.s) if (s.b) for (let v = 1; v <= INV_VARIANTS; v++) keys.push({ w: word.w, id: s.id, v, key: invPicKey(lang, baseOf(word), s.id, v) });
  const pics = new Map<string, string[]>();
  for (let i = 0; i < keys.length; i += 100) {
    const part = keys.slice(i, i + 100);
    const snaps = await db.getAll(...part.map((k) => db.collection("imageCache").doc(k.key)));
    snaps.forEach((snap, j) => {
      const url = snap.get("url");
      if (typeof url !== "string") return;
      const k = `${part[j].w}:${part[j].id}`;
      const list = pics.get(k) ?? [];
      list[part[j].v - 1] = url;
      pics.set(k, list);
    });
  }
  const progressSnap = await progressOf(me.uid).where("lang", "==", lang).limit(200).get();
  const progress: Record<string, WordState> = {};
  for (const d of progressSnap.docs) { const x = d.data(); if (typeof x.w === "string") progress[x.w] = readWord(x); }
  const sceneNames = Object.keys(INV_SCENE);
  const sceneSnaps = await db.getAll(...sceneNames.map((n) => db.collection("imageCache").doc(invSceneKey(n))));
  const scene: Record<string, string> = {};
  sceneSnaps.forEach((s, i) => { const u = s.get("url"); if (typeof u === "string") scene[sceneNames[i]] = u; });

  return NextResponse.json({
    lang,
    scene,
    no: set.no,
    words: set.words.map((word) => ({
      w: word.w,
      n: word.n,
      ...(word.pk ? { pk: word.pk } : {}),
      t: word.t,
      s: word.s.map((s) => ({ id: s.id, g: s.g, pics: (pics.get(`${word.w}:${s.id}`) ?? []).filter(Boolean) })),
    })),
    progress,
  });
}

export async function POST(req: NextRequest) {
  const me = await who(req);
  if ("error" in me) return NextResponse.json({ error: me.error }, { status: me.status });
  const b = (await req.json().catch(() => null)) as { door?: unknown; lang?: unknown; w?: unknown; ids?: unknown; events?: unknown; mistakes?: unknown; tz?: unknown } | null;
  if (b?.door === "niqqud") return niqqudPost(me.uid, me.canJump, b as Record<string, unknown>);
  const lang = typeof b?.lang === "string" ? b.lang : "";
  const set = INV_SETS[lang];
  const word = set?.words.find((x) => x.w === b?.w);
  if (!set || !word) return NextResponse.json({ error: "unknown_word" }, { status: 400 });
  const known = new Set(word.s.map((s) => s.id));
  const ids = Array.isArray(b?.ids) ? [...new Set(b.ids.filter((x): x is string => typeof x === "string" && known.has(x)))] : [];
  const events: SenseEvent[] = Array.isArray(b?.events)
    ? (b.events as Array<Record<string, unknown>>).slice(0, 40).flatMap((e) => {
        const id = typeof e?.id === "string" && known.has(e.id) ? e.id : null;
        const r = e?.r === "caught" || e?.r === "missed" ? e.r : null;
        const c = (CLUES as unknown[]).includes(e?.c) ? (e.c as Clue) : null;
        return id && r && c ? [{ id, r, c }] : [];
      })
    : [];
  const mistakes = typeof b?.mistakes === "number" && b.mistakes > 0 ? Math.min(20, Math.floor(b.mistakes)) : 0;
  const tz = typeof b?.tz === "string" && b.tz.length <= 64 ? b.tz : "UTC";
  let today: string;
  try { today = dayKeyOf(new Date(), tz); } catch { today = dayKeyOf(new Date(), "UTC"); }
  if (!ids.length) return NextResponse.json({ error: "no_meanings" }, { status: 400 });

  const db = getAdminDb();
  const ref = progressOf(me.uid).doc(docId(lang, word.w));
  const out = await db.runTransaction(async (tx) => {
    const prev = readWord((await tx.get(ref)).data());
    const r = applyRound(prev, ids, events, mistakes, today);
    tx.set(ref, { lang, w: word.w, s: r.state.s, cleared: r.state.cleared, mistakes: r.state.mistakes, updated: new Date().toISOString() });
    if (r.wordies > 0) tx.set(db.collection("users").doc(me.uid).collection("journey").doc("state"), { bonus: FieldValue.increment(r.wordies) }, { merge: true });
    return r;
  });
  return NextResponse.json({ ok: true, wordies: out.wordies, met: out.met, known: out.known, state: out.state });
}
