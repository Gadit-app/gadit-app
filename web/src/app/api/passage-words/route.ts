/**
 * POST /api/passage-words  — body { text, lang } → { gist, words: [{word, meaning}] }
 *
 * The Reader's "key words" companion. A parent pastes their child's homework and
 * wants help fast, without tapping word by word. Instead of translating the whole
 * text (deliberately rejected — that would make Gadit a translator and undercut
 * vocabulary building, per the July + Sept 2026 positioning councils), this does
 * the VOCABULARY job on the whole passage in one shot:
 *
 *   - `words`: the handful of words most worth learning FROM this text, each with
 *     a short meaning in the reader's own language. These are the product — the
 *     parent hands the phone to the child and they learn the real words.
 *   - `gist`: one short orientation line in the reader's language saying what the
 *     text is ABOUT. Deliberately NOT a line-by-line translation and NOT long
 *     enough to do the homework from — it orients; the words do the work.
 *
 * The gist is capped hard (a summary that grows with input length IS a
 * translation): fixed max_tokens + a length rule in the prompt. Cached per
 * (lang, text) so re-taps don't re-bill. Auth: any signed-in user (the Reader is
 * a paid feature; this is a light gate so the endpoint isn't public). Gadi 2026-09-09.
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

type KeyWord = { word: string; meaning: string };

function hashKey(lang: string, text: string): string {
  return crypto.createHash("sha256").update("pw1:" + lang + ":" + text).digest("hex").slice(0, 40);
}

async function analyze(text: string, langName: string): Promise<{ gist: string; words: KeyWord[] }> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 320,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You help a learner (often a parent helping a child) who is reading a passage in a language that is not their own. Their language is ${langName}. Return a JSON object:
{
  "gist": "ONE short plain sentence in ${langName} saying what the passage is ABOUT (the situation or topic). At most 30 words. This is an orientation line, NOT a translation and NOT a sentence-by-sentence retelling. Never reproduce the text line by line.",
  "words": [ up to 5 items, the words from THIS passage most worth learning (the hardest or most useful content words), in the order they appear. Each: { "word": "the word exactly as it appears in the passage", "meaning": "a 2 to 5 word explanation in ${langName}" }. Choose real content words (nouns, verbs, adjectives). Never pick articles, pronouns, prepositions or other function words. Fewer than 5 is fine for a short text. ]
}
Output ONLY the JSON object. No markdown, no preamble.`,
        },
        { role: "user", content: text },
      ],
    }),
  });
  if (!res.ok) throw new Error("openai_" + res.status);
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const u = usageFrom(json);
  void logAiUsage({ feature: "passage_words", model: "gpt-4o-mini", tokensIn: u.tokensIn, tokensOut: u.tokensOut });

  const content = json.choices?.[0]?.message?.content ?? "{}";
  let parsed: { gist?: unknown; words?: unknown } = {};
  try { parsed = JSON.parse(content); } catch { /* fall through to empty */ }

  const gist = typeof parsed.gist === "string" ? parsed.gist.trim() : "";
  const words: KeyWord[] = Array.isArray(parsed.words)
    ? parsed.words
        .map((w) => {
          const o = (w ?? {}) as { word?: unknown; meaning?: unknown };
          return {
            word: typeof o.word === "string" ? o.word.trim().slice(0, 60) : "",
            meaning: typeof o.meaning === "string" ? o.meaning.trim().slice(0, 120) : "",
          };
        })
        .filter((w) => w.word.length > 0)
        .slice(0, 5)
    : [];

  return { gist, words };
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const idToken = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : "";
  if (!idToken) return NextResponse.json({ error: "login_required" }, { status: 401 });
  try {
    await getAdminAuth().verifyIdToken(idToken);
  } catch {
    return NextResponse.json({ error: "login_required" }, { status: 401 });
  }

  let text = "";
  let lang = "en";
  try {
    const b = (await req.json()) as { text?: unknown; lang?: unknown };
    if (typeof b.text === "string") text = b.text.trim().slice(0, 4000);
    if (typeof b.lang === "string" && LANG_NAME[b.lang]) lang = b.lang;
  } catch {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }
  // Nothing to summarise for a stray word or two — the tap-a-word flow covers that.
  if (text.split(/\s+/).filter(Boolean).length < 6) {
    return NextResponse.json({ error: "too_short" }, { status: 400 });
  }

  const db = getAdminDb();
  const ref = db.collection("passageWords").doc(hashKey(lang, text));
  try {
    const snap = await ref.get();
    if (snap.exists) {
      const d = snap.data() as { gist?: string; words?: KeyWord[] };
      if (d.words) return NextResponse.json({ gist: d.gist ?? "", words: d.words, cached: true });
    }
  } catch { /* cache read best-effort */ }

  try {
    const out = await analyze(text, LANG_NAME[lang]);
    if (out.words.length === 0 && !out.gist) return NextResponse.json({ error: "empty" }, { status: 502 });
    try { await ref.set({ lang, gist: out.gist, words: out.words, at: new Date().toISOString() }); } catch { /* ignore */ }
    return NextResponse.json(out);
  } catch {
    return NextResponse.json({ error: "generate_failed" }, { status: 502 });
  }
}
