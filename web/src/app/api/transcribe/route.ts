import { NextRequest, NextResponse } from "next/server";
import { verifyUserAndGetPlan } from "@/lib/firebase-admin";
import { logAiUsage, whisperCostUsd } from "@/lib/ai-cost";

// Whisper expects ISO-639-1 language hints; map our UI codes
const LANG_HINT: Record<string, string> = {
  he: "he",
  en: "en",
  ar: "ar",
  ru: "ru",
  es: "es",
  pt: "pt",
  fr: "fr",
  de: "de",
  cs: "cs",
  sk: "sk",
  it: "it",
  ja: "ja",
  hi: "hi",
  am: "am",
  uk: "uk",
  tr: "tr",
  pl: "pl",
  fa: "fa",
  id: "id",
  nl: "nl",
  el: "el",
  zu: "zu",
  xh: "xh",
  nso: "nso",
  tn: "tn",
  st: "st",
  ts: "ts",
  ss: "ss",
  ve: "ve",
  nr: "nr",
  vi: "vi",
  fil: "tl",
  af: "af",
  sw: "sw",
  "zh-CN": "zh",
  "zh-TW": "zh",
  ko: "ko",
  th: "th",
  bn: "bn",
  da: "da",
  hu: "hu",
};

// Languages whisper-1 accepts as a language hint. For any other (Zulu, Xhosa,
// Sepedi, Setswana, Sesotho, Xitsonga, siSwati, Tshivenda, isiNdebele,
// Amharic, Bengali) OpenAI rejects the call with unsupported_language, so a
// learner practising Zulu in Say it got no score at all (Gadi 2026-10-26).
// Those go to gpt-4o-transcribe with the language named in the prompt, which
// heard "Sawubona, mama. Unjani?" exactly in a test.
const WHISPER_LANGS = new Set(["af", "ar", "hy", "az", "be", "bs", "bg", "ca", "zh", "hr", "cs", "da", "nl", "en", "et", "fi", "fr", "gl", "de", "el", "he", "hi", "hu", "is", "id", "it", "ja", "kn", "kk", "ko", "lv", "lt", "mk", "ms", "mr", "mi", "ne", "no", "fa", "pl", "pt", "ro", "ru", "sr", "sk", "sl", "es", "sw", "sv", "tl", "ta", "th", "tr", "uk", "ur", "vi", "cy"]);
// Whisper-supported, but gpt-4o-transcribe heard them clearly better in the
// Say it check of every language (2026-10-26).
const PREFER_4O = new Set(["fa", "af"]);
// Whisper writes Mandarin in traditional characters by default; a short prompt
// in the right script keeps simplified for zh-CN (it scored 2 stars before).
const WHISPER_PROMPT: Record<string, string> = {
  "zh-CN": "以下是普通话的句子，用简体中文书写。",
  "zh-TW": "以下是國語的句子，用繁體中文書寫。",
};
const LANG_NAME: Record<string, string> = {
  fa: "Persian (Farsi)", af: "Afrikaans",
  zu: "isiZulu (Zulu)", xh: "isiXhosa (Xhosa)", nso: "Sepedi (Northern Sotho)", tn: "Setswana (Tswana)", st: "Sesotho (Southern Sotho)",
  ts: "Xitsonga (Tsonga)", ss: "siSwati (Swati)", ve: "Tshivenda (Venda)", nr: "isiNdebele (South Ndebele)", am: "Amharic", bn: "Bengali",
};

export async function POST(req: NextRequest) {
  try {
    // Auth — Clear/Deep only
    const authHeader = req.headers.get("Authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const userInfo = await verifyUserAndGetPlan(idToken);
    if (!userInfo) {
      return NextResponse.json({ error: "login_required" }, { status: 401 });
    }
    if (userInfo.plan === "basic") {
      return NextResponse.json(
        { error: "upgrade_required", requiredPlan: "clear" },
        { status: 402 }
      );
    }

    // Read multipart form: audio file + optional uiLang
    const incomingForm = await req.formData();
    const audioFile = incomingForm.get("audio");
    const uiLangRaw = incomingForm.get("uiLang");
    if (!(audioFile instanceof Blob)) {
      return NextResponse.json({ error: "no audio file" }, { status: 400 });
    }
    if (audioFile.size === 0) {
      return NextResponse.json({ error: "empty audio" }, { status: 400 });
    }
    if (audioFile.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: "audio too large (max 25MB)" }, { status: 413 });
    }

    const langHint =
      typeof uiLangRaw === "string" && LANG_HINT[uiLangRaw] ? LANG_HINT[uiLangRaw] : undefined;

    // Forward to OpenAI Whisper
    const upstreamForm = new FormData();
    // Use the original blob's content type if present, default to webm
    const contentType = audioFile.type || "audio/webm";
    const ext = contentType.includes("mp4")
      ? "m4a"
      : contentType.includes("mpeg")
      ? "mp3"
      : contentType.includes("ogg")
      ? "ogg"
      : "webm";
    upstreamForm.append("file", audioFile, `audio.${ext}`);
    const viaWhisper = !langHint || (WHISPER_LANGS.has(langHint) && !PREFER_4O.has(langHint));
    const model = viaWhisper ? "whisper-1" : "gpt-4o-transcribe";
    upstreamForm.append("model", model);
    if (viaWhisper) {
      // verbose_json adds the audio duration, which prices the call.
      upstreamForm.append("response_format", "verbose_json");
      if (langHint) upstreamForm.append("language", langHint);
      const wp = typeof uiLangRaw === "string" ? WHISPER_PROMPT[uiLangRaw] : undefined;
      if (wp) upstreamForm.append("prompt", wp);
    } else {
      upstreamForm.append("response_format", "json");
      upstreamForm.append("prompt", `The speaker is speaking ${LANG_NAME[langHint!] ?? langHint}. Transcribe exactly what is said, in that language and its usual spelling.`);
    }

    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: upstreamForm,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Whisper error:", res.status, errText);
      return NextResponse.json(
        { error: "transcription_failed", details: errText.slice(0, 300) },
        { status: 502 }
      );
    }

    const data = (await res.json()) as { text?: string; duration?: number; usage?: { input_tokens?: number; output_tokens?: number } };
    // gpt-4o-transcribe bills tokens: audio in about $6 per million, text out $10 per million.
    const costUsd = viaWhisper
      ? whisperCostUsd(Number(data.duration ?? 0))
      : (Number(data.usage?.input_tokens ?? 0) * 6 + Number(data.usage?.output_tokens ?? 0) * 10) / 1e6;
    void logAiUsage({ feature: "transcribe", model, costUsd, plan: userInfo.plan });
    return NextResponse.json({ text: (data.text || "").trim() });
  } catch (err) {
    console.error("transcribe error:", err);
    return NextResponse.json(
      { error: "internal_error", details: String(err) },
      { status: 500 }
    );
  }
}
