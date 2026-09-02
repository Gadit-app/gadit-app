/**
 * POST /api/understand-sentence  — body { sentence, lang } → { meaning }
 *
 * The Reader's sentence-level companion to tap-any-word: given ONE sentence
 * from a pasted passage, return a short, plain explanation of what it means,
 * written in the reader's own language. This is deliberately NOT a raw
 * translation (that would make Gadit a translator and undercut vocabulary
 * building, per the July positioning council); it is a comprehension aid that
 * keeps the reader engaged with the original text. Same interaction as a word
 * tap, one level up: tap a word -> the word's meaning; tap a sentence -> the
 * sentence's meaning. Gadi 2026-09-03.
 *
 * Cached per (lang, sentence) in Firestore so re-taps don't re-bill. Auth: any
 * signed-in user (the Reader is a paid feature, this is a light gate so the
 * endpoint isn't public).
 */
import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

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

function hashKey(lang: string, sentence: string): string {
  return crypto.createHash("sha256").update("us1:" + lang + ":" + sentence).digest("hex").slice(0, 40);
}

async function explain(sentence: string, langName: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 160,
      messages: [
        {
          role: "system",
          content: `You help a language learner understand a sentence from a text they are reading. Explain in plain, simple ${langName} what the given sentence means, in one or two short sentences. Do not translate it word for word; capture the meaning so the learner understands it. Return ONLY the explanation, no preamble, no quotes, no markdown.`,
        },
        { role: "user", content: sentence },
      ],
    }),
  });
  if (!res.ok) throw new Error("openai_" + res.status);
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return json.choices?.[0]?.message?.content?.trim() ?? "";
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

  let sentence = "";
  let lang = "en";
  try {
    const b = (await req.json()) as { sentence?: unknown; lang?: unknown };
    if (typeof b.sentence === "string") sentence = b.sentence.trim().slice(0, 600);
    if (typeof b.lang === "string" && LANG_NAME[b.lang]) lang = b.lang;
  } catch {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }
  if (!sentence) return NextResponse.json({ error: "sentence_required" }, { status: 400 });

  const db = getAdminDb();
  const ref = db.collection("sentenceCache").doc(hashKey(lang, sentence));
  try {
    const snap = await ref.get();
    if (snap.exists) {
      const cached = (snap.data() as { meaning?: string }).meaning;
      if (cached) return NextResponse.json({ meaning: cached, cached: true });
    }
  } catch { /* cache read best-effort */ }

  try {
    const meaning = await explain(sentence, LANG_NAME[lang]);
    if (!meaning) return NextResponse.json({ error: "empty" }, { status: 502 });
    try { await ref.set({ sentence, lang, meaning, at: new Date().toISOString() }); } catch { /* ignore */ }
    return NextResponse.json({ meaning });
  } catch {
    return NextResponse.json({ error: "generate_failed" }, { status: 502 });
  }
}
