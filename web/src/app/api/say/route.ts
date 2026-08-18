import { NextRequest, NextResponse } from "next/server";
import { verifyUserAndGetPlan } from "@/lib/firebase-admin";

/**
 * "Say it in ___" — pronunciation-practice translator (Gadi 2026-08-18).
 *
 * A language learner types a sentence in a language they know and gets
 * it back in the language they're learning, so they can then hear it
 * pronounced (the client plays it through /api/tts, which now speaks all
 * 22 languages in their own locale). Born from a South-African parent
 * whose son is learning Zulu at school and needs to hear how a sentence
 * is actually said.
 *
 * This is NOT a general translator UI — it's framed as speaking practice
 * for learners, and always paired with audio. Text-only for the copy;
 * the audio (and its paid gate) lives in /api/tts.
 *
 *   POST /api/say
 *   Headers: Authorization: Bearer <id token>
 *   Body: { text, targetLang, sourceLang? }
 *   Returns: { translation, romanization?, tip? }
 */

export const maxDuration = 30;

const MAX_TEXT_LENGTH = 500;

// The 22 UI languages, code → English name for the prompt.
const LANG_NAMES: Record<string, string> = {
  en: "English", he: "Hebrew", ar: "Arabic", ru: "Russian", es: "Spanish",
  pt: "Portuguese", fr: "French", de: "German", it: "Italian", nl: "Dutch",
  cs: "Czech", sk: "Slovak", uk: "Ukrainian", tr: "Turkish", pl: "Polish",
  fa: "Persian", id: "Indonesian", el: "Greek", hi: "Hindi", ja: "Japanese",
  am: "Amharic", zu: "Zulu",
};

// Languages written in a non-Latin script — for these we ask the model
// for a Latin romanization so a learner can read the sounds too.
const NON_LATIN = new Set(["he", "ar", "ru", "uk", "fa", "el", "hi", "ja", "am"]);

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const userInfo = await verifyUserAndGetPlan(idToken);
  if (!userInfo) {
    return NextResponse.json({ error: "login_required" }, { status: 401 });
  }
  // Paid feature: Clear / Deep / Family / Schools only (Family and Schools
  // both resolve to the "deep" feature-plan). Basic (free) is excluded.
  if (userInfo.plan !== "clear" && userInfo.plan !== "deep") {
    return NextResponse.json(
      { error: "upgrade_required", message: "Say it is a paid feature." },
      { status: 403 },
    );
  }

  let body: { text?: unknown; targetLang?: unknown; sourceLang?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  const targetLang = typeof body.targetLang === "string" ? body.targetLang : "";
  const sourceLang = typeof body.sourceLang === "string" ? body.sourceLang : "";

  if (!text) return NextResponse.json({ error: "text_required" }, { status: 400 });
  if (text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json({ error: "text_too_long", limit: MAX_TEXT_LENGTH }, { status: 400 });
  }
  const target = LANG_NAMES[targetLang];
  if (!target) return NextResponse.json({ error: "bad_target_lang" }, { status: 400 });
  const source = LANG_NAMES[sourceLang] || "the language it is written in";

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const wantRoman = NON_LATIN.has(targetLang);
  const systemPrompt =
    `You help a language learner practise speaking. Translate the user's text from ${source} into ${target}, ` +
    `the way a native speaker would naturally say it out loud (natural, spoken, not stiff or overly literal). ` +
    `Keep it at the same length and register as the input. ` +
    `Respond ONLY as JSON with these keys: ` +
    `"translation" (the sentence in ${target}, in its native script), ` +
    (wantRoman
      ? `"romanization" (a simple Latin-letter guide to how it sounds, for a learner who cannot read the script), `
      : ``) +
    `"tip" (one short, optional pronunciation tip in ${source}; empty string if nothing useful). ` +
    `No extra keys, no commentary.`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        temperature: 0.3,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text },
        ],
      }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("[say] OpenAI HTTP", res.status, errText.slice(0, 200));
      return NextResponse.json({ error: "upstream_error", status: res.status }, { status: 502 });
    }
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return NextResponse.json({ error: "empty" }, { status: 502 });
    const parsed = JSON.parse(content) as {
      translation?: string; romanization?: string; tip?: string;
    };
    const translation = (parsed.translation || "").trim();
    if (!translation) return NextResponse.json({ error: "empty" }, { status: 502 });
    return NextResponse.json({
      translation,
      romanization: (parsed.romanization || "").trim(),
      tip: (parsed.tip || "").trim(),
      targetLang,
    });
  } catch (err) {
    console.error("[say] failed:", err);
    return NextResponse.json({ error: "failed", details: String(err) }, { status: 500 });
  }
}
