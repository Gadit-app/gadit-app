import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { applyAnswer, movePointer, pickSession, wordKey, type LearnItem, type WordState } from "@/lib/learn/engine";
import { ENGLISH_BANK } from "@/lib/learn/english-bank";
import { HEBREW_BANK } from "@/lib/learn/hebrew-bank";
import { ENGLISH_BANK_T } from "@/lib/learn/english-bank-langs";
import { alphabetFrom, lettersOf, spellable, NO_SPELL_LANGS } from "@/lib/world/letters";
import { LANGUAGES } from "@/lib/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Words for spelling in the child's OWN language in the world game (Gadi
 * 2026-11-01: "a Hebrew-speaking child can practise Hebrew too"). The
 * learning languages (English, Hebrew as a second language) stay on
 * /api/learn; this is the mother-tongue track, for every UI language that
 * has letters (not Chinese or Japanese).
 *
 * Words: the learning bank in that language (English as is, Hebrew from
 * its own bank with niqqud, the rest from the bank's child-friendly
 * translations), so every word already has a picture (its English word).
 * Difficulty for a native speaker is the spelling itself: word length.
 *
 *   GET  ?lang=de                       → { pool, alphabet, reads }
 *   POST { lang, results:[{w, ok}] }    → { ok }
 *
 * Mastery: users/{uid}/spellWords/{lang_word}; pointer on users/{uid}.spell.
 */

type Row = { w: string; nq?: string; en: string };
type SpellDoc = { d?: Record<string, number>; answered?: Record<string, number>; streak?: Record<string, number> };

const UI_LANGS = new Set<string>(LANGUAGES.map((l) => l.code));
const banks = new Map<string, { items: LearnItem[]; alphabet: string[] }>();

function rowsFor(lang: string): Row[] {
  if (lang === "en") return ENGLISH_BANK.map((x) => ({ w: x.w, en: x.w }));
  if (lang === "he") return HEBREW_BANK.map((x) => ({ w: x.w, nq: x.nq, en: x.en }));
  if (lang === "ar" || lang === "ru") return ENGLISH_BANK.map((x) => ({ w: x[lang], en: x.w }));
  const t = ENGLISH_BANK_T[lang] ?? {};
  return ENGLISH_BANK.map((x) => ({ w: (t[x.w] ?? "").trim(), en: x.w }));
}

function bank(lang: string) {
  let b = banks.get(lang);
  if (!b) {
    const seen = new Set<string>();
    const items: LearnItem[] = [];
    for (const r of rowsFor(lang)) {
      if (!r.w || !spellable(r.w, lang)) continue;
      const k = wordKey(lang, r.w);
      if (seen.has(k)) continue;
      seen.add(k);
      const n = lettersOf(r.w, lang).length;
      const d = n <= 3 ? 1 : n === 4 ? 2 : n === 5 ? 3 : n === 6 ? 4 : 5;
      items.push({ w: r.w, nq: r.nq, en: r.en, t: "", d, topic: "spell", src: "bank" });
    }
    b = { items, alphabet: alphabetFrom(items.map((x) => x.w), lang) };
    banks.set(lang, b);
  }
  return b;
}

async function uidOf(req: NextRequest): Promise<string | null> {
  const h = req.headers.get("Authorization") || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!token) return null;
  try { return (await getAdminAuth().verifyIdToken(token)).uid; } catch { return null; }
}

const okLang = (x: unknown): x is string => typeof x === "string" && UI_LANGS.has(x) && !NO_SPELL_LANGS.has(x);

export async function GET(req: NextRequest) {
  const uid = await uidOf(req);
  if (!uid) return NextResponse.json({ error: "login_required" }, { status: 401 });
  const lang = req.nextUrl.searchParams.get("lang");
  if (!okLang(lang)) return NextResponse.json({ error: "unknown_lang" }, { status: 400 });
  const ref = getAdminDb().collection("users").doc(uid);
  const [user, snap] = await Promise.all([
    ref.get(),
    ref.collection("spellWords").where("lang", "==", lang).get(),
  ]);
  const states: Record<string, WordState> = {};
  for (const d of snap.docs) states[d.id] = d.data() as WordState;
  const spell = (user.get("spell") as SpellDoc | undefined) ?? {};
  const reads = (user.get("learn") as { reads?: string } | undefined)?.reads ?? null;
  const { items, alphabet } = bank(lang);
  const pool = pickSession(items, states, lang, spell.d?.[lang] ?? 1, Date.now(), 16);
  return NextResponse.json({ pool: pool.map((x) => ({ w: x.w, t: "", nq: x.nq, en: x.en })), alphabet, reads });
}

export async function POST(req: NextRequest) {
  const uid = await uidOf(req);
  if (!uid) return NextResponse.json({ error: "login_required" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { lang?: unknown; results?: unknown } | null;
  const lang = body?.lang;
  const results = Array.isArray(body?.results) ? (body.results as Array<{ w?: unknown; ok?: unknown }>).slice(0, 60) : [];
  if (!okLang(lang) || !results.length) return NextResponse.json({ ok: true });
  const db = getAdminDb();
  const ref = db.collection("users").doc(uid);
  const spell = ((await ref.get()).get("spell") as SpellDoc | undefined) ?? {};
  let d = spell.d?.[lang] ?? 1;
  let answered = spell.answered?.[lang] ?? 0;
  let streak = spell.streak?.[lang] ?? 0;
  const keys = [...new Set(results.map((r) => wordKey(lang, String(r.w ?? ""))))].filter((k) => k.length > lang.length + 1);
  const snaps = keys.length ? await db.getAll(...keys.map((k) => ref.collection("spellWords").doc(k))) : [];
  const states: Record<string, WordState> = {};
  snaps.forEach((s) => { if (s.exists) states[s.id] = s.data() as WordState; });
  const now = Date.now();
  const touched = new Map<string, string>();
  for (const r of results) {
    const w = String(r.w ?? "").trim().slice(0, 40);
    if (!w) continue;
    const ok = r.ok === true;
    const k = wordKey(lang, w);
    streak = ok ? streak + 1 : 0;
    d = movePointer(d, ok, answered, streak);
    answered += 1;
    states[k] = applyAnswer(states[k], ok, now);
    touched.set(k, w);
  }
  const batch = db.batch();
  for (const [k, w] of touched) batch.set(ref.collection("spellWords").doc(k), { ...states[k], lang, w }, { merge: true });
  batch.set(ref, { spell: { d: { [lang]: d }, answered: { [lang]: answered }, streak: { [lang]: streak } } }, { merge: true });
  await batch.commit();
  return NextResponse.json({ ok: true });
}
