import { NextRequest, NextResponse } from "next/server";
import { verifyUserAndGetPlan } from "@/lib/firebase-admin";

// Whisper expects ISO-639-1 language hints; map our UI codes
const LANG_HINT: Record<string, string> = {
  he: "he",
  en: "en",
  ar: "ar",
  ru: "ru",
  es: "es",
  pt: "pt",
  fr: "fr",
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
    upstreamForm.append("model", "whisper-1");
    upstreamForm.append("response_format", "json");
    if (langHint) upstreamForm.append("language", langHint);

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

    const data = (await res.json()) as { text?: string };
    return NextResponse.json({ text: (data.text || "").trim() });
  } catch (err) {
    console.error("transcribe error:", err);
    return NextResponse.json(
      { error: "internal_error", details: String(err) },
      { status: 500 }
    );
  }
}
