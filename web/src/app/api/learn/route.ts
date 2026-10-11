import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { logAiUsage, usageFrom } from "@/lib/ai-cost";
import {
  applyAnswer, bankFor, isLearnLang, learnTargets, LEARNED_BOX, movePointer, pickSession, wordKey,
  type LearnItem, type LearnLang, type Reads, type WordState,
} from "@/lib/learn/engine";

/**
 * Learning mode (Gadi 2026-10-11): "what are you learning now?" for a kid
 * whose app stays in their own language.
 *
 *   GET  ?ui=he[&lang=en]          profile, the next session's words, the numbers
 *   POST {action:"setup", lang|null, reads, ui}
 *   POST {action:"results", lang, results:[{w, ok}]}
 *   POST {action:"list", lang, text, testDate?, ui}   this week's school list
 *   POST {action:"clearList"}
 *
 * Stored on users/{uid}.learn (lang, reads, d per language, the list) and
 * users/{uid}/learnWords/{lang_word} (one mastery record per word).
 */

export const dynamic = "force-dynamic";
const DAY = 86_400_000;

type ListDoc = { lang: LearnLang; items: Array<{ w: string; t: string; nq?: string }>; testDate?: string | null; at: number };
type LearnDoc = {
  lang?: LearnLang | null;
  reads?: Reads;
  d?: Partial<Record<LearnLang, number>>;
  answered?: Partial<Record<LearnLang, number>>;
  streak?: Partial<Record<LearnLang, number>>;
  list?: ListDoc | null;
};

async function uidOf(req: NextRequest): Promise<string | null> {
  const h = req.headers.get("Authorization") || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!token) return null;
  try { return (await getAdminAuth().verifyIdToken(token)).uid; } catch { return null; }
}

/** A list counts until the day after its test (or two weeks with no date). */
function listActive(l: ListDoc | null | undefined, now: number): boolean {
  if (!l || !l.items?.length) return false;
  if (l.testDate) return now <= Date.parse(`${l.testDate}T23:59:59+03:00`) + DAY;
  return now - l.at < 14 * DAY;
}

async function loadStates(uid: string, lang: LearnLang): Promise<Record<string, WordState>> {
  const snap = await getAdminDb().collection("users").doc(uid).collection("learnWords").where("lang", "==", lang).get();
  const out: Record<string, WordState> = {};
  for (const d of snap.docs) out[d.id] = d.data() as WordState;
  return out;
}

export async function GET(req: NextRequest) {
  const uid = await uidOf(req);
  if (!uid) return NextResponse.json({ error: "login_required" }, { status: 401 });
  const ui = (req.nextUrl.searchParams.get("ui") ?? "he").slice(0, 8);
  const doc = (await getAdminDb().collection("users").doc(uid).get()).get("learn") as LearnDoc | undefined;
  const qLang = req.nextUrl.searchParams.get("lang");
  const lang = isLearnLang(qLang) ? qLang : doc?.lang ?? null;
  const targets = learnTargets(ui);
  if (!lang || !targets.includes(lang)) {
    return NextResponse.json({ profile: { lang: null, reads: doc?.reads ?? null }, targets, pool: [], stats: null });
  }
  const now = Date.now();
  const states = await loadStates(uid, lang);
  const items = bankFor(lang, ui);
  const list = doc?.list && doc.list.lang === lang && listActive(doc.list, now)
    ? doc.list.items.map((x): LearnItem => ({ w: x.w, t: x.t, nq: x.nq, d: 0, topic: "list", src: "list" }))
    : undefined;
  const d = doc?.d?.[lang] ?? 1;
  const pool = pickSession(items, states, lang, d, now, 16, list);
  const vals = Object.values(states);
  const weekAgo = now - 7 * DAY;
  const stats = {
    learnedTotal: vals.filter((s) => s.box >= LEARNED_BOX).length,
    learnedWeek: vals.filter((s) => (s.learnedAt ?? 0) >= weekAgo).length,
    reinforce: vals.filter((s) => s.box < LEARNED_BOX && s.wrong > 0).length,
    list: list ? {
      total: list.length,
      ready: list.filter((x) => (states[wordKey(lang, x.w)]?.box ?? 0) >= 2).length,
      testDate: doc?.list?.testDate ?? null,
    } : null,
  };
  return NextResponse.json({ profile: { lang, reads: doc?.reads ?? null }, targets, pool, stats });
}

/** Words of a pasted or photographed list: one per line, or separated by
 *  commas. "word - translation" keeps the parent's translation. */
function parseList(text: string): Array<{ w: string; t?: string }> {
  const out: Array<{ w: string; t?: string }> = [];
  const seen = new Set<string>();
  for (const raw of text.split(/[\n\r,;•·\t]+/)) {
    const line = raw.replace(/^\s*[\d]+[.)]\s*/, "").trim();
    if (!line || line.length > 60) continue;
    const m = line.match(/^(.+?)\s*[-=:–]\s*(.+)$/);
    const w = (m ? m[1] : line).trim();
    const t = m ? m[2].trim() : undefined;
    const k = w.toLowerCase();
    if (!w || seen.has(k) || !/\p{L}/u.test(w)) continue;
    seen.add(k);
    out.push({ w, t });
    if (out.length >= 40) break;
  }
  return out;
}

const LANG_NAME: Record<string, string> = { he: "Hebrew", ar: "Arabic", ru: "Russian", en: "English" };

/** Translate the list words we don't have, in one small call. */
async function translateMissing(words: string[], lang: LearnLang, ui: string): Promise<Record<string, { t: string; nq?: string }>> {
  if (!words.length || !process.env.OPENAI_API_KEY) return {};
  const to = LANG_NAME[ui] ?? "English";
  const from = lang === "en" ? "English" : "Hebrew";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: `You translate a child's school vocabulary list (${from} words) into ${to}. For each word give the most common, child-appropriate translation, one word or a very short phrase, no explanations.${lang === "he" ? " Also give the Hebrew word with full, correct niqqud as \"nq\"." : ""} Reply as JSON: {"items":[{"w":"<word as given>","t":"<translation>"${lang === "he" ? ',"nq":"<word with niqqud>"' : ""}}]}.` },
        { role: "user", content: words.join("\n") },
      ],
    }),
  });
  if (!res.ok) return {};
  const data = await res.json();
  const u = usageFrom(data);
  void logAiUsage({ feature: "learn_list", model: "gpt-4o-mini", tokensIn: u.tokensIn, tokensOut: u.tokensOut });
  try {
    const items = (JSON.parse(data.choices?.[0]?.message?.content ?? "{}").items ?? []) as Array<{ w?: string; t?: string; nq?: string }>;
    const out: Record<string, { t: string; nq?: string }> = {};
    for (const x of items) if (x.w && x.t) out[x.w.trim().toLowerCase()] = { t: String(x.t).slice(0, 60), ...(x.nq ? { nq: String(x.nq).slice(0, 60) } : {}) };
    return out;
  } catch { return {}; }
}

export async function POST(req: NextRequest) {
  const uid = await uidOf(req);
  if (!uid) return NextResponse.json({ error: "login_required" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const action = String(body.action ?? "");
  const db = getAdminDb();
  const ref = db.collection("users").doc(uid);
  const now = Date.now();

  if (action === "setup") {
    const lang = isLearnLang(body.lang) ? body.lang : null;
    const reads: Reads = body.reads === "no" || body.reads === "yes" ? body.reads : "little";
    const doc = ((await ref.get()).get("learn") as LearnDoc | undefined) ?? {};
    const d = { ...(doc.d ?? {}) };
    // Where the hidden pointer starts: a child who reads starts a step up.
    if (lang && d[lang] == null) d[lang] = reads === "yes" ? 2 : reads === "little" ? 1.5 : 1;
    await ref.set({ learn: { ...doc, lang, reads, d } }, { merge: true });
    return NextResponse.json({ ok: true });
  }

  if (action === "results") {
    const lang = isLearnLang(body.lang) ? body.lang : null;
    const results = Array.isArray(body.results) ? (body.results as Array<{ w?: unknown; ok?: unknown }>).slice(0, 60) : [];
    if (!lang || !results.length) return NextResponse.json({ ok: true });
    const doc = ((await ref.get()).get("learn") as LearnDoc | undefined) ?? {};
    let d = doc.d?.[lang] ?? 1;
    let answered = doc.answered?.[lang] ?? 0;
    let streak = doc.streak?.[lang] ?? 0;
    const keys = [...new Set(results.map((r) => wordKey(lang, String(r.w ?? ""))))].filter((k) => k.length > 3);
    const snaps = keys.length ? await db.getAll(...keys.map((k) => ref.collection("learnWords").doc(k))) : [];
    const states: Record<string, WordState> = {};
    snaps.forEach((s) => { if (s.exists) states[s.id] = s.data() as WordState; });
    const touched = new Set<string>();
    for (const r of results) {
      const w = String(r.w ?? "").trim();
      if (!w) continue;
      const ok = r.ok === true;
      const k = wordKey(lang, w);
      streak = ok ? streak + 1 : 0;
      d = movePointer(d, ok, answered, streak);
      answered += 1;
      states[k] = applyAnswer(states[k], ok, now);
      touched.add(k);
      (states[k] as WordState & { w?: string }).w = w;
    }
    const batch = db.batch();
    for (const k of touched) batch.set(ref.collection("learnWords").doc(k), { ...states[k], lang }, { merge: true });
    batch.set(ref, { learn: { d: { [lang]: d }, answered: { [lang]: answered }, streak: { [lang]: streak } } }, { merge: true });
    await batch.commit();
    return NextResponse.json({ ok: true, d });
  }

  if (action === "list") {
    const lang = isLearnLang(body.lang) ? body.lang : null;
    const ui = typeof body.ui === "string" ? body.ui.slice(0, 8) : "he";
    if (!lang) return NextResponse.json({ error: "lang_required" }, { status: 400 });
    const parsed = parseList(String(body.text ?? ""));
    if (parsed.length < 2) return NextResponse.json({ error: "too_few_words" }, { status: 400 });
    const bank = new Map(bankFor(lang, ui).map((x) => [x.w.toLowerCase(), x]));
    const missing = parsed.filter((p) => !p.t && !bank.has(p.w.toLowerCase())).map((p) => p.w);
    const tr = await translateMissing(missing, lang, ui);
    const items = parsed.map((p) => {
      const b = bank.get(p.w.toLowerCase());
      const t = p.t ?? b?.t ?? tr[p.w.toLowerCase()]?.t ?? "";
      const nq = b?.nq ?? tr[p.w.toLowerCase()]?.nq;
      return { w: p.w, t, ...(nq ? { nq } : {}) };
    }).filter((x) => x.t);
    const testDate = typeof body.testDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.testDate) ? body.testDate : null;
    const list: ListDoc = { lang, items, testDate, at: now };
    await ref.set({ learn: { list } }, { merge: true });
    return NextResponse.json({ ok: true, list, translated: missing.length });
  }

  if (action === "clearList") {
    await ref.set({ learn: { list: null } }, { merge: true });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "unknown_action" }, { status: 400 });
}
