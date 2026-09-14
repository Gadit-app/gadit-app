/**
 * POST /api/word-question  — body { word, uiLang, questionId } → { answer }
 *
 * The word page's "ask a question about this word" affordance, built the way the
 * Sept 2026 council insisted: a FIXED, CURATED set of questions rendered as chips,
 * NOT a free-text box. A free-text box on a child-facing word page would break the
 * closed/safe moat (a child could type anything) and invites abuse; a closed enum
 * of questions keeps it safe, cacheable, and cheap. The trigger for this feature
 * (a subscriber asking about a slang sense of "פלואידי") was really a coverage gap,
 * already fixed in /api/define (slang senses + precise source language). These chips
 * cover the follow-ups the word page does NOT already show: synonyms, word family,
 * common mistakes, a memory tip. Anything genuinely missing routes to the existing
 * "report a problem" flow instead. Gadi 2026-09-14.
 *
 * Auth: any signed-in user (light gate, like /api/passage-words). Cached per
 * (lang, word, questionId) in Firestore `wordQuestions` so re-taps never re-bill.
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

// The closed set of questions. Each maps to a tight instruction. Keep this list in
// sync with QUESTION_IDS in WordQuestions.tsx.
const QUESTIONS: Record<string, string> = {
  synonyms:
    "List a few words with a similar meaning to this word. Give the related words in the SAME language as the word itself, and after each one add a 2 to 4 word gloss in {LANG}. Prefer the closest, most common synonyms. If the word has no real synonyms, say so plainly in {LANG}.",
  word_family:
    "List a few words from the same family or root as this word (for example other parts of speech, or words built from the same root). Give them in the SAME language as the word itself, each with a 2 to 4 word gloss in {LANG} explaining how it relates. If there is no meaningful word family, say so plainly in {LANG}.",
  common_mistakes:
    "Explain the most common mistake or confusion people make with this word (for example a word it is often confused with, or a wrong usage), and how to use it correctly. Keep it concrete and short. Write in {LANG}.",
  memory_tip:
    "Give one short, concrete tip to help remember this word and its meaning, simple enough for a child. It can use the word's sound, its origin, or a small mental picture. Write in {LANG}. Do not invent a false etymology.",
};

function hashKey(lang: string, word: string, qid: string): string {
  return crypto.createHash("sha256").update("wq1:" + lang + ":" + word + ":" + qid).digest("hex").slice(0, 40);
}

async function ask(word: string, langName: string, qid: string): Promise<string> {
  const instruction = QUESTIONS[qid].replaceAll("{LANG}", langName);
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 260,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You help someone learning the word below. Their language is ${langName}; the word may be in a different language. Answer this one question about the word:
${instruction}

Rules: Keep the answer short (at most about 60 words). Plain and clear, no linguistic jargon, no foreign scripts except a light transliteration where helpful. Never make up facts. The answer must be safe and appropriate for children.
Return ONLY a JSON object: { "answer": "your answer in ${langName}" }. No markdown, no preamble.`,
        },
        { role: "user", content: word },
      ],
    }),
  });
  if (!res.ok) throw new Error("openai_" + res.status);
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const u = usageFrom(json);
  void logAiUsage({ feature: "word_question", model: "gpt-4o-mini", tokensIn: u.tokensIn, tokensOut: u.tokensOut });

  const content = json.choices?.[0]?.message?.content ?? "{}";
  let parsed: { answer?: unknown } = {};
  try { parsed = JSON.parse(content); } catch { /* fall through */ }
  return typeof parsed.answer === "string" ? parsed.answer.trim().slice(0, 600) : "";
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

  let word = "";
  let lang = "en";
  let questionId = "";
  try {
    const b = (await req.json()) as { word?: unknown; uiLang?: unknown; questionId?: unknown };
    if (typeof b.word === "string") word = b.word.trim().slice(0, 80);
    if (typeof b.uiLang === "string" && LANG_NAME[b.uiLang]) lang = b.uiLang;
    if (typeof b.questionId === "string") questionId = b.questionId;
  } catch {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }
  if (!word) return NextResponse.json({ error: "no_word" }, { status: 400 });
  if (!QUESTIONS[questionId]) return NextResponse.json({ error: "bad_question" }, { status: 400 });

  const db = getAdminDb();
  const ref = db.collection("wordQuestions").doc(hashKey(lang, word, questionId));
  try {
    const snap = await ref.get();
    if (snap.exists) {
      const d = snap.data() as { answer?: string };
      if (d.answer) return NextResponse.json({ answer: d.answer, cached: true });
    }
  } catch { /* cache read best-effort */ }

  try {
    const answer = await ask(word, LANG_NAME[lang], questionId);
    if (!answer) return NextResponse.json({ error: "empty" }, { status: 502 });
    try { await ref.set({ lang, word, questionId, answer, at: new Date().toISOString() }); } catch { /* ignore */ }
    return NextResponse.json({ answer });
  } catch {
    return NextResponse.json({ error: "generate_failed" }, { status: 502 });
  }
}
