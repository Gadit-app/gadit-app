/**
 * POST /api/spell-set  — body { topic, uiLang } → { safe, title, words: [{en, he}] }
 *
 * "Create your own set" for the spelling trainer (/spell): a kid types a TOPIC
 * they want to practice (e.g. "aliens", "dinosaurs", "space") and Gadit
 * instantly generates ~10 English/Hebrew word pairs on that topic to practice.
 *
 * CHILD SAFETY: the topic is FREE TEXT typed by a child, so the model must
 * refuse anything not appropriate for a young child (violence, adult, drugs,
 * hate, self-harm, etc.) → returns { safe: false }. The client then asks for a
 * different topic. Output is a fixed word list, never chat. Gadi 2026-09-19.
 *
 * Cached per (lang, topic) so a repeat topic is free. Signed-in only.
 */
import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { logAiUsage, usageFrom } from "@/lib/ai-cost";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 20;

const LANG_NAME: Record<string, string> = {
  en: "English", he: "Hebrew", ar: "Arabic", ru: "Russian", es: "Spanish",
  pt: "Portuguese", fr: "French", de: "German", cs: "Czech", sk: "Slovak",
  it: "Italian", ja: "Japanese", hi: "Hindi", am: "Amharic", uk: "Ukrainian",
  tr: "Turkish", pl: "Polish", fa: "Persian", id: "Indonesian", nl: "Dutch",
  el: "Greek", zu: "Zulu", vi: "Vietnamese", fil: "Filipino", af: "Afrikaans",
  sw: "Swahili", "zh-CN": "Simplified Chinese", "zh-TW": "Traditional Chinese",
  ko: "Korean", th: "Thai", bn: "Bengali", da: "Danish", hu: "Hungarian",
};

type Pair = { en: string; he: string };

function hashKey(lang: string, topic: string): string {
  return crypto.createHash("sha256").update("ss1:" + lang + ":" + topic.toLowerCase()).digest("hex").slice(0, 40);
}

async function generate(topic: string, uiLangName: string, nativeLangName: string): Promise<{ safe: boolean; title: string; words: Pair[] }> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.4,
      max_tokens: 500,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You build a short spelling-practice word set for a child about 8 to 10 years old, on a topic the CHILD typed. The child reads ${uiLangName} and is learning English.

CHILD SAFETY FIRST. The topic is free text typed by a child. If it is NOT appropriate for a young child — anything involving violence, weapons, sex or adult content, drugs, alcohol, gambling, hate, self-harm, gore, or otherwise unsafe — return {"safe": false, "title": "", "words": []}. When unsure, refuse.

If the topic IS safe, return {"safe": true, "title": "<the topic as a short clean label in ${uiLangName}>", "words": [ up to 10 items ]}. Each word item is {"en": "<a common English word on this topic>", "he": "<its ${nativeLangName} translation>"}. IMPORTANT: the "he" field must hold the ${nativeLangName} translation (NOT necessarily Hebrew — the field is named "he" for legacy reasons). Pick simple, common, concrete words a child would actually learn for this topic (nouns first). English words in lowercase (proper nouns keep their capital). Write the "he" field in ${nativeLangName}. No phrases longer than 2 words. No duplicates. Output ONLY the JSON object.`,
        },
        { role: "user", content: topic },
      ],
    }),
  });
  if (!res.ok) throw new Error("openai_" + res.status);
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const u = usageFrom(json);
  void logAiUsage({ feature: "spell_set", model: "gpt-4o-mini", tokensIn: u.tokensIn, tokensOut: u.tokensOut });

  const content = json.choices?.[0]?.message?.content ?? "{}";
  let parsed: { safe?: unknown; title?: unknown; words?: unknown } = {};
  try { parsed = JSON.parse(content); } catch { /* fall through */ }
  if (parsed.safe === false) return { safe: false, title: "", words: [] };

  const words: Pair[] = Array.isArray(parsed.words)
    ? parsed.words
        .map((w) => {
          const o = (w ?? {}) as { en?: unknown; he?: unknown };
          return {
            en: typeof o.en === "string" ? o.en.trim().slice(0, 40) : "",
            he: typeof o.he === "string" ? o.he.trim().slice(0, 40) : "",
          };
        })
        .filter((w) => w.en && w.he)
        .slice(0, 10)
    : [];
  const title = typeof parsed.title === "string" ? parsed.title.trim().slice(0, 40) : "";
  if (words.length < 3) return { safe: false, title: "", words: [] };
  return { safe: true, title, words };
}

// A pasted list: each line is a single word (Hebrew or English) OR a
// "word - translation" pair. Return {en, he} for each, filling the missing
// language, child-safe. Gadi 2026-09-19 ("paste your own list").
async function generateList(list: string, uiLangName: string, nativeLangName: string): Promise<{ safe: boolean; title: string; words: Pair[] }> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 900,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `A user pasted a spelling-practice word list for a child who reads ${uiLangName} and is learning English. Turn it into English / ${nativeLangName} pairs.

Return STRICT JSON: {"safe": true, "title": "My list", "words": [{"en":"...","he":"..."}]}.
- Each input line is either a single word (in English OR ${nativeLangName}) or a "word - translation" pair (separated by -, =, tab, or a dash). For each line, output one item with BOTH "en" (the English word) and "he" (the ${nativeLangName} word) filled: translate the missing side; if a pair is given, keep it.
- IMPORTANT: the "he" field must hold the ${nativeLangName} word (NOT necessarily Hebrew — the field is named "he" for legacy reasons).
- Keep the user's own words; only add the translation. English lowercase (proper nouns keep their capital). Skip empty lines, numbers-only lines, and duplicates. Up to 20 words.
- CHILD SAFETY: skip any single word not appropriate for a young child. If the WHOLE list is inappropriate (violence, adult, drugs, hate, etc.), return {"safe": false, "title": "", "words": []}.
Output ONLY the JSON object.`,
        },
        { role: "user", content: list },
      ],
    }),
  });
  if (!res.ok) throw new Error("openai_" + res.status);
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const u = usageFrom(json);
  void logAiUsage({ feature: "spell_set_list", model: "gpt-4o-mini", tokensIn: u.tokensIn, tokensOut: u.tokensOut });
  const content = json.choices?.[0]?.message?.content ?? "{}";
  let parsed: { safe?: unknown; title?: unknown; words?: unknown } = {};
  try { parsed = JSON.parse(content); } catch { /* fall through */ }
  if (parsed.safe === false) return { safe: false, title: "", words: [] };
  const words: Pair[] = Array.isArray(parsed.words)
    ? parsed.words.map((w) => {
        const o = (w ?? {}) as { en?: unknown; he?: unknown };
        return { en: typeof o.en === "string" ? o.en.trim().slice(0, 40) : "", he: typeof o.he === "string" ? o.he.trim().slice(0, 40) : "" };
      }).filter((w) => w.en && w.he).slice(0, 20)
    : [];
  if (words.length < 2) return { safe: false, title: "", words: [] };
  const t = typeof parsed.title === "string" ? parsed.title.trim().slice(0, 40) : "";
  return { safe: true, title: t || (uiLangName === "Hebrew" ? "הרשימה שלי" : "My list"), words };
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

  let topic = "";
  let list = "";
  let lang = "he";
  // The NON-English side of every pair is the learner's own language. Defaults
  // to uiLang; English UI falls back to Hebrew (there's no en↔en dictation).
  let nativeLang = "he";
  try {
    const b = (await req.json()) as { topic?: unknown; list?: unknown; uiLang?: unknown; nativeLang?: unknown };
    if (typeof b.topic === "string") topic = b.topic.trim().slice(0, 40);
    if (typeof b.list === "string") list = b.list.trim().slice(0, 800);
    if (typeof b.uiLang === "string" && LANG_NAME[b.uiLang]) lang = b.uiLang;
    if (typeof b.nativeLang === "string" && LANG_NAME[b.nativeLang]) nativeLang = b.nativeLang;
    else nativeLang = lang === "en" ? "he" : lang;
  } catch {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }
  const nativeName = LANG_NAME[nativeLang] ?? "Hebrew";

  // Pasted-list path (not cached — lists are one-off and varied).
  if (list) {
    if (list.length < 2) return NextResponse.json({ error: "list_too_short" }, { status: 400 });
    try {
      const out = await generateList(list, LANG_NAME[lang], nativeName);
      return NextResponse.json(out);
    } catch {
      return NextResponse.json({ error: "generate_failed" }, { status: 502 });
    }
  }

  if (topic.length < 2) return NextResponse.json({ error: "topic_too_short" }, { status: 400 });

  const db = getAdminDb();
  // Cache key includes nativeLang: the same topic yields different word pairs
  // per learner language (colors → red/אדום for he, red/rojo for es).
  const ref = db.collection("spellSets").doc(hashKey(nativeLang + ":" + lang, topic));
  try {
    const snap = await ref.get();
    if (snap.exists) {
      const d = snap.data() as { safe?: boolean; title?: string; words?: Pair[] };
      return NextResponse.json({ safe: d.safe ?? false, title: d.title ?? "", words: d.words ?? [], cached: true });
    }
  } catch { /* cache read best-effort */ }

  try {
    const out = await generate(topic, LANG_NAME[lang], nativeName);
    try { await ref.set({ lang, nativeLang, topic, ...out, at: new Date().toISOString() }); } catch { /* ignore */ }
    return NextResponse.json(out);
  } catch {
    return NextResponse.json({ error: "generate_failed" }, { status: 502 });
  }
}
