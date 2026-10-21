/**
 * POST /api/reading-check
 *   body { text, lang, kids, tapped: string[], hard: string[] }
 *   →    { language, words: [{ word, sentence, options[4], answer, explain }],
 *          questions: [{ q, options[4], answer }] }
 *
 * The Reader's "done reading, let's check" step (Gadi 2026-10-20). A child
 * reads a text alone, taps the words they are not sure about, and at the end
 * Gadit checks two things in ONE model call:
 *   - WORDS: every tapped word (max 8) plus up to 3 hard words the child did
 *     not tap, each as "what does the word mean HERE?" with 4 options.
 *   - COMPREHENSION: 3 to 5 questions on the content, answerable only from
 *     the text.
 *
 * Access: the same gate as the Reader's paid parts (/api/ocr): signed in and
 * not on the free plan. Cached per (lang, kids, text, words) in
 * readingChecks/{sha256}, so the same check is free the second time; the text
 * itself is not stored. Up to DAILY_LIMIT fresh checks per user per UTC day
 * (cache hits are not counted). Options are shuffled on every response, so the
 * right answer is never always first.
 */
import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getAdminDb, verifyUserAndGetPlan } from "@/lib/firebase-admin";
import { logAiUsage, costWithCache, SMART_MODEL } from "@/lib/ai-cost";
import { tokenizeWords, wordKey } from "@/lib/tokenize-words";
import { LANG_NAME, noDashes, readingCheckRequest } from "@/lib/reading-check-prompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const DAILY_LIMIT = 30;
const MAX_TAPPED = 8;
const MAX_HARD = 3;

type CheckWord = { word: string; sentence: string; options: string[]; answer: number; explain: string };
type CheckQuestion = { q: string; options: string[]; answer: number };
type Check = { language: string; words: CheckWord[]; questions: CheckQuestion[] };

function cacheKey(lang: string, kids: boolean, text: string, words: string[]): string {
  const sorted = [...words].map(wordKey).sort().join(",");
  return crypto.createHash("sha256").update(`rc1|${lang}|${kids ? 1 : 0}|${text}|${sorted}`).digest("hex");
}

function cleanStr(v: unknown, max: number): string {
  return typeof v === "string" ? noDashes(v.replace(/\s+/g, " ")).slice(0, max) : "";
}

/** 4 non-empty, distinct options and an answer index in range, or null. */
function cleanOptions(opts: unknown, answer: unknown): { options: string[]; answer: number } | null {
  if (!Array.isArray(opts) || opts.length !== 4) return null;
  const options = opts.map((o) => cleanStr(o, 140));
  if (options.some((o) => !o)) return null;
  if (new Set(options.map((o) => o.toLowerCase())).size !== 4) return null;
  const a = typeof answer === "number" ? answer : typeof answer === "string" ? Number(answer) : NaN;
  if (!Number.isInteger(a) || a < 0 || a > 3) return null;
  return { options, answer: a };
}

/** The sentence of the text that holds the word (fallback when the model
 *  leaves `sentence` out). */
function sentenceWith(text: string, word: string): string {
  const k = wordKey(word);
  const parts = text.split(/(?<=[.!?؟।。！？\n])\s+/);
  for (const p of parts) {
    if (tokenizeWords(p).some((t) => t.type === "word" && wordKey(t.value) === k)) return p.trim().slice(0, 400);
  }
  return "";
}

const KNOWN_LANGS = new Set(Object.values(LANG_NAME).map((n) => n.split(" (")[0]));

/** The language name the notebook uses ("Hebrew", "English"...), from the
 *  model when it gives a known one, else from the text's script. */
function textLanguage(raw: unknown, text: string): string {
  const s = typeof raw === "string" ? raw.trim() : "";
  const cap = s ? s[0].toUpperCase() + s.slice(1).toLowerCase() : "";
  if (KNOWN_LANGS.has(cap)) return cap;
  if (/[֐-׿]/.test(text)) return "Hebrew";
  if (/[؀-ۿ]/.test(text)) return "Arabic";
  if (/[Ѐ-ӿ]/.test(text)) return "Russian";
  return "English";
}

function validate(raw: unknown, text: string, asked: string[]): { check: Check; complete: boolean } {
  const o = (raw ?? {}) as { language?: unknown; words?: unknown; questions?: unknown };
  const items = Array.isArray(o.words) ? o.words : [];
  const words: CheckWord[] = [];
  for (const w of asked) {
    const k = wordKey(w);
    const it = items.find((x) => wordKey(typeof (x as { word?: unknown })?.word === "string" ? (x as { word: string }).word : "") === k) as
      | { sentence?: unknown; options?: unknown; answer?: unknown; explain?: unknown }
      | undefined;
    if (!it) continue;
    const opts = cleanOptions(it.options, it.answer);
    const explain = cleanStr(it.explain, 300);
    if (!opts || !explain) continue;
    // The sentence is the text's own words: never rewritten, only trimmed.
    let sentence = typeof it.sentence === "string" ? it.sentence.trim().slice(0, 400) : "";
    if (!sentence || !tokenizeWords(sentence).some((t) => t.type === "word" && wordKey(t.value) === k)) {
      sentence = sentenceWith(text, w) || sentence;
    }
    if (!sentence) continue;
    words.push({ word: w, sentence, options: opts.options, answer: opts.answer, explain });
  }
  const questions: CheckQuestion[] = [];
  for (const it of Array.isArray(o.questions) ? o.questions : []) {
    const q = it as { q?: unknown; options?: unknown; answer?: unknown };
    const qq = cleanStr(q.q, 300);
    const opts = cleanOptions(q.options, q.answer);
    if (qq && opts) questions.push({ q: qq, options: opts.options, answer: opts.answer });
    if (questions.length === 5) break;
  }
  return {
    check: { language: textLanguage(o.language, text), words, questions },
    complete: words.length === asked.length && questions.length >= 3,
  };
}

function shuffled<T extends { options: string[]; answer: number }>(item: T): T {
  const idx = [0, 1, 2, 3];
  for (let i = 3; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return { ...item, options: idx.map((i) => item.options[i]), answer: idx.indexOf(item.answer) };
}

function forClient(c: Check): Check {
  return { language: c.language, words: c.words.map(shuffled), questions: c.questions.map(shuffled) };
}

async function generate(text: string, lang: string, kids: boolean, words: string[], plan: string): Promise<{ raw: unknown; cost: number }> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify(readingCheckRequest(SMART_MODEL, text, lang, kids, words)),
  });
  if (!res.ok) throw new Error("openai_" + res.status);
  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number; prompt_tokens_details?: { cached_tokens?: number } };
  };
  const tIn = json.usage?.prompt_tokens ?? 0;
  const tOut = json.usage?.completion_tokens ?? 0;
  const cost = costWithCache(SMART_MODEL, tIn, json.usage?.prompt_tokens_details?.cached_tokens ?? 0, tOut);
  void logAiUsage({ feature: "reading_check", model: SMART_MODEL, tokensIn: tIn, tokensOut: tOut, costUsd: cost, plan });
  let raw: unknown = {};
  try { raw = JSON.parse(json.choices?.[0]?.message?.content ?? "{}"); } catch { /* invalid → empty */ }
  return { raw, cost };
}

/** Local UI tests only: a fixed sample, never in a deployed app (the emulator
 *  host is never set there) and only when the request asks for it. */
function fixture(text: string, words: string[], lang: string): Check {
  const he = lang === "he";
  const w = words.map((word) => ({
    word,
    sentence: sentenceWith(text, word) || text.slice(0, 120),
    options: he ? ["הפירוש הנכון", "פירוש לא נכון", "פירוש אחר", "משהו אחר לגמרי"] : ["the right meaning", "a wrong meaning", "another meaning", "something else"],
    answer: 0,
    explain: he ? `כאן «${word}» מופיעה בפירוש הנכון.` : `Here "${word}" has the right meaning.`,
  }));
  const q = (n: number) => ({
    q: he ? `שאלת בדיקה מספר ${n} על הטקסט?` : `Test question number ${n} about the text?`,
    options: he ? ["תשובה נכונה", "תשובה שגויה", "עוד תשובה שגויה", "תשובה רחוקה"] : ["right answer", "wrong answer", "another wrong one", "far off"],
    answer: 0,
  });
  return { language: textLanguage("", text), words: w, questions: [q(1), q(2), q(3)] };
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const idToken = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : null;
  const userInfo = await verifyUserAndGetPlan(idToken);
  if (!userInfo) return NextResponse.json({ error: "login_required" }, { status: 401 });
  // Same gate as the Reader's paid parts (OCR): everything but the free plan.
  if (userInfo.plan === "basic") {
    return NextResponse.json({ error: "upgrade_required", requiredPlan: "clear" }, { status: 402 });
  }

  let text = "";
  let lang = "en";
  let kids = false;
  let tapped: string[] = [];
  let hard: string[] = [];
  try {
    const b = (await req.json()) as { text?: unknown; lang?: unknown; kids?: unknown; tapped?: unknown; hard?: unknown };
    if (typeof b.text === "string") text = b.text.trim().slice(0, 4000);
    if (typeof b.lang === "string" && LANG_NAME[b.lang]) lang = b.lang;
    kids = b.kids === true;
    const list = (v: unknown) =>
      Array.isArray(v)
        ? v.filter((x): x is string => typeof x === "string").map((x) => x.trim().slice(0, 60)).filter((x) => x.length > 0)
        : [];
    const seen = new Set<string>();
    const uniq = (arr: string[], max: number) => {
      const out: string[] = [];
      for (const w of arr) {
        const k = wordKey(w);
        if (!k || seen.has(k)) continue;
        seen.add(k);
        out.push(w);
        if (out.length === max) break;
      }
      return out;
    };
    tapped = uniq(list(b.tapped), MAX_TAPPED);
    hard = uniq(list(b.hard), MAX_HARD);
  } catch {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }
  // Only words that are really in the text.
  const inText = new Set(tokenizeWords(text).filter((t) => t.type === "word").map((t) => wordKey(t.value)));
  const words = [...tapped, ...hard].filter((w) => inText.has(wordKey(w)));
  if (text.split(/\s+/).filter(Boolean).length < 12) {
    return NextResponse.json({ error: "too_short" }, { status: 400 });
  }

  if (req.headers.get("x-test-fixture") === "1" && process.env.FIRESTORE_EMULATOR_HOST && !process.env.VERCEL) {
    return NextResponse.json({ ...forClient(fixture(text, words, lang)), fixture: true });
  }

  const db = getAdminDb();
  const ref = db.collection("readingChecks").doc(cacheKey(lang, kids, text, words));
  try {
    const snap = await ref.get();
    if (snap.exists) {
      const d = snap.data() as Partial<Check>;
      if (Array.isArray(d.questions) && Array.isArray(d.words)) {
        return NextResponse.json({ ...forClient({ language: d.language ?? "English", words: d.words, questions: d.questions }), cached: true });
      }
    }
  } catch { /* cache read best-effort */ }

  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  // Daily limit on fresh checks (cache hits above are free).
  const usageRef = db.collection("readingCheckUsage").doc(userInfo.userId);
  try {
    const allowed = await db.runTransaction(async (tx) => {
      const s = await tx.get(usageRef);
      const d = s.data() as { day?: string; count?: number } | undefined;
      const count = d?.day === today() ? d.count ?? 0 : 0;
      if (count >= DAILY_LIMIT) return false;
      tx.set(usageRef, { day: today(), count: count + 1, at: new Date().toISOString() });
      return true;
    });
    if (!allowed) return NextResponse.json({ error: "daily_limit", limit: DAILY_LIMIT }, { status: 429 });
  } catch { /* counter best-effort: never block a child on a Firestore hiccup */ }

  try {
    let { check, complete } = validate((await generate(text, lang, kids, words, userInfo.plan)).raw, text, words);
    if (!complete) {
      // One more try; keep whichever came out fuller.
      const second = validate((await generate(text, lang, kids, words, userInfo.plan)).raw, text, words);
      const score = (c: Check) => c.words.length + c.questions.length;
      if (second.complete || score(second.check) > score(check)) ({ check, complete } = second);
    }
    if (check.questions.length < 3) return NextResponse.json({ error: "generate_failed" }, { status: 502 });
    if (complete) {
      try { await ref.set({ lang, kids, language: check.language, words: check.words, questions: check.questions, at: new Date().toISOString() }); } catch { /* ignore */ }
    }
    return NextResponse.json(forClient(check));
  } catch {
    return NextResponse.json({ error: "generate_failed" }, { status: 502 });
  }
}
