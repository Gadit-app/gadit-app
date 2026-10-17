import { NextRequest, NextResponse } from "next/server";
import { requestSchool } from "@/lib/school-sets";
import { cleanSetWords, setLangOf, SCHOOL_SET_MAX_WORDS } from "@/lib/school-set-ids";
import { logAiUsage, usageFrom, TEXT_MODEL_FAST } from "@/lib/ai-cost";
import { hardCapReached } from "@/lib/ai-budget";
import { devDryAi } from "@/lib/dev-safety";

/**
 * POST /api/school-sets/words  { from: "photo" | "topic", text }  (Bearer: a school member)
 * → { words: string[] }
 *
 * Suggests the words of a teacher's own set (Gadi 2026-10-17), which the
 * teacher then reviews in the list before saving:
 *   - "photo": the text of a photographed book page, already read by /api/ocr
 *     (the same reader as the homework photo); we keep the page's key terms;
 *   - "topic": the lesson topic the teacher typed; we list its key terms.
 * The homework list maker (/api/spell-set) is not reused here: it pairs
 * English words for a child and refuses topics such as wars, which a history
 * teacher needs. Words stay in the language of the page or topic.
 * One short text call (about a tenth of a cent), never cached.
 */
export const runtime = "nodejs";
export const maxDuration = 45;

const LANG_NAME: Record<string, string> = {
  he: "Hebrew", ar: "Arabic", fa: "Persian", ru: "Russian", uk: "Ukrainian", el: "Greek", hi: "Hindi",
  bn: "Bengali", am: "Amharic", th: "Thai", ko: "Korean", ja: "Japanese", "zh-CN": "Chinese",
};

const RULES = `Rules for every word:
- Its dictionary form: singular, base form, no article unless it is part of the term; Hebrew in full spelling without niqqud; Arabic without tashkeel.
- A term of more than one word stays whole, exactly as it is taught; never split it.
- Real concepts of the lesson only: no general words every student knows, no instructions (read, circle, fill in), no exercise numbers, no names of people unless the lesson is about them.
- No duplicates and no near-duplicates (the same idea in singular and plural).
Return JSON only: {"words": ["..."]}`;

export async function POST(req: NextRequest) {
  const who = await requestSchool(req);
  if (!who) return NextResponse.json({ error: "login_required" }, { status: 401 });
  if (!who.schoolId) return NextResponse.json({ error: "not_a_school" }, { status: 403 });

  const b = (await req.json().catch(() => ({}))) as { from?: unknown; text?: unknown };
  const from = b.from === "topic" ? "topic" : b.from === "photo" ? "photo" : "";
  const text = typeof b.text === "string" ? b.text.trim().slice(0, from === "topic" ? 120 : 6000) : "";
  if (!from || text.length < 2) return NextResponse.json({ error: "bad_body" }, { status: 400 });

  // Local test mode: no model call.
  if (devDryAi()) return NextResponse.json({ words: from === "topic" ? [`[dry] ${text}`] : ["[dry] 1", "[dry] 2"] });
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  if (await hardCapReached()) return NextResponse.json({ error: "busy" }, { status: 503 });

  const lang = setLangOf([text]);
  const langName = LANG_NAME[lang] ?? "the language the text is written in";
  const sys = from === "photo"
    ? `A teacher photographed a page of a school textbook to build a vocabulary set for the lesson. The text was read by OCR, so it may hold exercise numbers, instructions, captions and page furniture. Pick the key words and terms this page teaches: a word list or word bank if there is one, otherwise the highlighted or new terms, otherwise the key concepts of the passage. Keep every word in the page's own language (${langName}) and spelling; fix only obvious OCR misreadings. Between 5 and 25 words, in the order they appear.\n${RULES}`
    : `A teacher is preparing a lesson and wants its key vocabulary for the class. List the 10 to 15 key words and terms of a school lesson on the topic the teacher gives, from basic to advanced: the concepts the teacher teaches and a student must understand to follow the lesson. Write them in the language the topic is written in (${langName}). If the topic is not something a school teaches, return {"words": []}.\n${RULES}`;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: TEXT_MODEL_FAST,
        ...(TEXT_MODEL_FAST.startsWith("gpt-5") ? { reasoning_effort: "low" } : { temperature: 0.2 }),
        response_format: { type: "json_object" },
        messages: [{ role: "system", content: sys }, { role: "user", content: text }],
      }),
    });
    if (!res.ok) return NextResponse.json({ error: "generate_failed" }, { status: 502 });
    const json = await res.json();
    const u = usageFrom(json);
    void logAiUsage({ feature: "school_set_words", model: TEXT_MODEL_FAST, tokensIn: u.tokensIn, tokensOut: u.tokensOut, plan: "schools" });
    let raw: unknown = [];
    try { raw = (JSON.parse(json.choices?.[0]?.message?.content ?? "{}") as { words?: unknown }).words; } catch { /* no words */ }
    const words = cleanSetWords(Array.isArray(raw) ? raw.map((w) => String(w ?? "").replace(/\s*[–—]\s*/g, " ")) : []).slice(0, SCHOOL_SET_MAX_WORDS);
    return NextResponse.json({ words });
  } catch {
    return NextResponse.json({ error: "generate_failed" }, { status: 502 });
  }
}
