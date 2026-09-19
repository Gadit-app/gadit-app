/**
 * POST /api/word-idioms  — body { word, uiLang, wordLang } → { idioms: [...] }
 *
 * A dedicated, focused idiom generator. The main /api/define call (gpt-4o, ~20K
 * token prompt) was returning idioms unreliably — often 0 for idiom-rich words
 * like "chicken"/"dog" — because the idiom instruction sits deep in a huge
 * prompt. This small gpt-4o-mini call does ONE job: list the well-known idioms,
 * proverbs and set phrases for the word, each with a plain meaning AND a
 * kid-friendly meaning. Reliable and complete, cached per (lang, word) forever,
 * so it also enriches words whose define cache already has sparse idioms without
 * re-running define. Gadi 2026-09-19 (from Romi's video: rich idiom lists).
 *
 * Auth: any signed-in user (idioms are a free-tier feature; this is a light gate
 * so the endpoint isn't public).
 */
import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { logAiUsage, usageFrom } from "@/lib/ai-cost";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 25;

const LANG_NAME: Record<string, string> = {
  en: "English", he: "Hebrew", ar: "Arabic", ru: "Russian", es: "Spanish",
  pt: "Portuguese", fr: "French", de: "German", cs: "Czech", sk: "Slovak",
  it: "Italian", ja: "Japanese", hi: "Hindi", am: "Amharic", uk: "Ukrainian",
  tr: "Turkish", pl: "Polish", fa: "Persian", id: "Indonesian", nl: "Dutch",
  el: "Greek", zu: "Zulu", vi: "Vietnamese", fil: "Filipino", af: "Afrikaans",
  sw: "Swahili", "zh-CN": "Simplified Chinese", "zh-TW": "Traditional Chinese",
  ko: "Korean", th: "Thai", bn: "Bengali", da: "Danish", hu: "Hungarian",
};

type Idiom = { phrase: string; meaning: string; kidsMeaning: string };

function hashKey(lang: string, word: string): string {
  return crypto.createHash("sha256").update("wi1:" + lang + ":" + word.toLowerCase()).digest("hex").slice(0, 40);
}

async function generate(word: string, uiLangName: string, wordLangName: string): Promise<Idiom[]> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 900,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You list the well-known idioms, proverbs and fixed expressions that use a given word. The word is written in ${wordLangName}. The user reads ${uiLangName}.

Return STRICT JSON: {"idioms":[{"phrase":"...","meaning":"...","kidsMeaning":"..."}]}
- "phrase": the expression in ${wordLangName} (the word's own language), exactly as speakers say it.
- "meaning": what it actually means, in ${uiLangName}. Plain and clear.
- "kidsMeaning": the SAME meaning for a child of about 8, in ${uiLangName}: very simple everyday words, no hard or abstract vocabulary (e.g. replace "illegible" with "so messy it is hard to read").

BE COMPLETE for idiom-rich words (animals, body parts, common verbs, colors, weather): list ALL the expressions a fluent speaker would recognize, commonly 4 to 8. For "chicken" that includes: chicken out, chicken feed, chicken scratch, count your chickens before they hatch, don't count your chickens before they hatch, running around like a chicken with its head cut off, spring chicken, chicken and egg. Only return few or none for words that genuinely have no real expressions. NEVER invent an expression that no one actually uses. For a ${wordLangName} word, prefer ${wordLangName} expressions.

No foreign scripts beyond light transliteration. Everything must be safe for children. Output ONLY the JSON object.`,
        },
        { role: "user", content: word },
      ],
    }),
  });
  if (!res.ok) throw new Error("openai_" + res.status);
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const u = usageFrom(json);
  void logAiUsage({ feature: "word_idioms", model: "gpt-4o-mini", tokensIn: u.tokensIn, tokensOut: u.tokensOut });

  const content = json.choices?.[0]?.message?.content ?? "{}";
  let parsed: { idioms?: unknown } = {};
  try { parsed = JSON.parse(content); } catch { /* fall through */ }
  const list = Array.isArray(parsed.idioms) ? parsed.idioms : [];
  return list
    .map((it) => {
      const o = (it ?? {}) as { phrase?: unknown; meaning?: unknown; kidsMeaning?: unknown };
      return {
        phrase: typeof o.phrase === "string" ? o.phrase.trim().slice(0, 120) : "",
        meaning: typeof o.meaning === "string" ? o.meaning.trim().slice(0, 300) : "",
        kidsMeaning: typeof o.kidsMeaning === "string" ? o.kidsMeaning.trim().slice(0, 300) : "",
      };
    })
    .filter((i) => i.phrase && i.meaning)
    .slice(0, 10);
}

export async function POST(req: NextRequest) {
  // Admin refresh (x-gadit-refresh) bypasses both the cache and the auth gate,
  // so idiom sets can be pre-warmed from a script without a user token.
  const isRefresh = !!process.env.ADMIN_SECRET && req.headers.get("x-gadit-refresh") === process.env.ADMIN_SECRET;
  if (!isRefresh) {
    const authHeader = req.headers.get("authorization") || "";
    const idToken = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : "";
    if (!idToken) return NextResponse.json({ error: "login_required" }, { status: 401 });
    try {
      await getAdminAuth().verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ error: "login_required" }, { status: 401 });
    }
  }

  let word = "";
  let lang = "en";
  let wordLangName = "";
  try {
    const b = (await req.json()) as { word?: unknown; uiLang?: unknown; wordLang?: unknown };
    if (typeof b.word === "string") word = b.word.trim().slice(0, 80);
    if (typeof b.uiLang === "string" && LANG_NAME[b.uiLang]) lang = b.uiLang;
    if (typeof b.wordLang === "string") wordLangName = b.wordLang.replace(/[^A-Za-z ]/g, "").trim().slice(0, 30);
  } catch {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }
  if (!word) return NextResponse.json({ error: "no_word" }, { status: 400 });

  const db = getAdminDb();
  const ref = db.collection("wordIdioms").doc(hashKey(lang, word));
  if (!isRefresh) {
    try {
      const snap = await ref.get();
      if (snap.exists) {
        const d = snap.data() as { idioms?: Idiom[] };
        if (Array.isArray(d.idioms)) return NextResponse.json({ idioms: d.idioms, cached: true });
      }
    } catch { /* cache read best-effort */ }
  }

  try {
    const idioms = await generate(word, LANG_NAME[lang], wordLangName || LANG_NAME[lang]);
    try { await ref.set({ lang, word, idioms, at: new Date().toISOString() }); } catch { /* ignore */ }
    return NextResponse.json({ idioms });
  } catch {
    return NextResponse.json({ error: "generate_failed" }, { status: 502 });
  }
}
