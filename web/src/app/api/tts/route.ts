import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { verifyUserAndGetPlan, getDefaultBucket } from "@/lib/firebase-admin";

/**
 * Text-to-speech for paid tiers (Clear/Deep).
 *
 * Returns MP3 audio for the given text. Two-stage caching makes repeat
 * requests effectively free:
 *
 *   1. Firebase Storage cache, keyed by sha256(text + voice + model).
 *      The first request for a (text, voice) pair pays OpenAI; every
 *      subsequent request — by anyone, on any device — streams the
 *      cached MP3 straight from Storage. Same definition = same hash =
 *      same audio file, indefinitely.
 *
 *   2. HTTP CDN cache (1 year, immutable). The cache key is the hash,
 *      so the URL is content-addressed — safe to cache forever, never
 *      goes stale.
 *
 * Why server-side cache instead of just letting the client cache
 * blob URLs: blob URLs die when the tab closes, so even one user's
 * second listen would re-bill us. Storage means a Clear user reading
 * 50 definitions a day costs ~$0.10 the first day and ~$0 every day
 * after that (as the popular subset gets pre-warmed).
 *
 * USAGE:
 *   POST /api/tts
 *   Headers: Authorization: Bearer <id token>
 *   Body: { text: string, lang?: string, voice?: string }
 *
 * Tier gate: Clear or Deep only. Basic users get 403; the client
 * already has Web Speech as the free fallback for shorter content.
 *
 * Response: audio/mpeg stream. ETag = content hash so the browser
 * can validate cached copies cheaply.
 */

export const maxDuration = 60;

// Cap inputs so a runaway tap-to-listen flow can't burn the budget.
// 600 chars is long enough for a typical definition + an example or two.
const MAX_TEXT_LENGTH = 1200;

// OpenAI voices — pick by language to get something close to a native
// accent. 'alloy' and 'nova' are the most neutral / multilingual; for
// langs with named speakers we use them. Caller can override via the
// voice param (advanced users).
// The gpt-4o-mini-tts model detects the spoken language from the input
// text itself, so `voice` picks the timbre, not the language. We still
// map every one of the 30+ UI languages to a warm, capable voice so the
// listening experience is consistent across the whole app. Anything not
// listed falls back to 'alloy' (the most neutral / multilingual voice).
function pickVoice(lang: string | undefined): string {
  const map: Record<string, string> = {
    he: "nova", ar: "nova", ru: "shimmer", es: "nova", pt: "nova",
    fr: "shimmer", de: "onyx", cs: "alloy", sk: "alloy", en: "alloy",
    it: "nova", nl: "shimmer", uk: "shimmer", tr: "nova", pl: "alloy",
    fa: "nova", id: "nova", el: "shimmer", hi: "nova", ja: "nova",
    am: "nova", zu: "nova",
  };
  return (lang && map[lang]) || "alloy";
}

// Audio format we ask OpenAI to produce. Christopher (early tester,
// 2026-06-20, WhatsApp) reported the voice "sounded broken" on Chrome
// 149+ and Brave (both Chromium), while Safari played the same audio
// cleanly. The MP3 stream coming out of gpt-4o-mini-tts is what
// triggered it — Chromium's MP3 decoder has been getting stricter
// release-over-release and chokes on edge-case framing the new model
// occasionally produces. AAC is the universal podcast standard,
// natively supported in every modern browser, and the same model
// produces it cleanly. Cost is identical.
const AUDIO_FORMAT = "aac" as const;
const AUDIO_EXT = "aac";
const AUDIO_MIME = "audio/aac";

function contentHash(text: string, voice: string, model: string, format: string): string {
  return crypto
    .createHash("sha256")
    .update(`${model}|${voice}|${format}|${text}`)
    .digest("hex");
}

export async function POST(req: NextRequest) {
  // Tier gate
  const authHeader = req.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const userInfo = await verifyUserAndGetPlan(idToken);
  if (!userInfo) {
    return NextResponse.json({ error: "login_required" }, { status: 401 });
  }
  if (userInfo.plan !== "clear" && userInfo.plan !== "deep") {
    return NextResponse.json(
      { error: "upgrade_required", message: "TTS is a Clear/Deep feature." },
      { status: 403 },
    );
  }

  // Validate input
  let body: { text?: unknown; lang?: unknown; voice?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const text = typeof body.text === "string" ? body.text.trim() : "";
  const lang = typeof body.lang === "string" ? body.lang : undefined;
  const requestedVoice = typeof body.voice === "string" ? body.voice : undefined;
  if (!text) {
    return NextResponse.json({ error: "text_required" }, { status: 400 });
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json(
      { error: "text_too_long", limit: MAX_TEXT_LENGTH },
      { status: 400 },
    );
  }

  const voice = requestedVoice ?? pickVoice(lang);
  // gpt-4o-mini-tts replaces tts-1. The older model gave Christopher
  // (early tester, 2026-06-19) the "robot with asthma" sound he
  // flagged on WhatsApp — flat affect, hard consonants on Hebrew,
  // mechanical pacing. The 4o-mini-tts model is markedly more
  // natural across HE/AR/RU/EN and accepts an `instructions` param
  // so we can steer it toward a warm dictionary-reader tone instead
  // of a default assistant register. Bumping the model is also a
  // cache-key change, so every prior cached MP3 effectively becomes
  // stale; common words re-cache within hours of normal traffic.
  const model = "gpt-4o-mini-tts";
  const hash = contentHash(text, voice, model, AUDIO_FORMAT);
  const cachePath = `tts-cache/${hash}.${AUDIO_EXT}`;

  // Check Firebase Storage cache
  try {
    const bucket = getDefaultBucket();
    const file = bucket.file(cachePath);
    const [exists] = await file.exists();
    if (exists) {
      const [buffer] = await file.download();
      return new Response(buffer as unknown as BodyInit, {
        headers: {
          "Content-Type": AUDIO_MIME,
          // Content-addressed: same hash always means same audio, so
          // it's safe to cache forever. immutable tells the browser
          // not to even revalidate.
          "Cache-Control": "public, max-age=31536000, immutable",
          ETag: `"${hash}"`,
          "X-Gadit-TTS-Cache": "HIT",
        },
      });
    }
  } catch (err) {
    // Storage failure shouldn't break TTS — fall through to a fresh
    // OpenAI generation and skip caching this round.
    console.warn("[tts] storage read failed:", err);
  }

  // Cache miss — generate with OpenAI. Direct REST call (the rest of
  // the codebase calls /v1/* via raw fetch, no SDK installed).
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "tts_not_configured" },
        { status: 503 },
      );
    }
    // Voice instructions — the steering prompt that makes the new
    // gpt-4o-mini-tts model sound warm and human instead of flat.
    // Generic enough to work for every dictionary entry in every
    // language; the model uses the input text's natural pacing
    // (commas, periods, dashes) to phrase, so we don't try to
    // micromanage prosody here.
    const ttsInstructions =
      "Speak naturally and warmly, like a thoughtful friend reading a dictionary entry aloud. " +
      "Clear, calm, conversational tone — not robotic, not announcer-style. " +
      "Pronounce every word accurately in the source language, including any non-English words.";
    const ttsResp = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        voice,
        input: text,
        instructions: ttsInstructions,
        response_format: AUDIO_FORMAT,
      }),
    });
    if (!ttsResp.ok) {
      const errText = await ttsResp.text().catch(() => "");
      console.error("[tts] OpenAI HTTP", ttsResp.status, errText.slice(0, 200));
      return NextResponse.json(
        { error: "tts_upstream_error", status: ttsResp.status },
        { status: 502 },
      );
    }
    const arrayBuffer = await ttsResp.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Write to Storage cache fire-and-forget — we don't want a slow
    // cache write to delay the user's playback.
    void (async () => {
      try {
        const bucket = getDefaultBucket();
        await bucket.file(cachePath).save(buffer, {
          contentType: AUDIO_MIME,
          metadata: {
            cacheControl: "public, max-age=31536000, immutable",
            metadata: {
              voice,
              model,
              format: AUDIO_FORMAT,
              lang: lang ?? "",
              textPreview: text.slice(0, 100),
            },
          },
        });
      } catch (err) {
        console.warn("[tts] storage write failed:", err);
      }
    })();

    return new Response(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": AUDIO_MIME,
        "Cache-Control": "public, max-age=31536000, immutable",
        ETag: `"${hash}"`,
        "X-Gadit-TTS-Cache": "MISS",
      },
    });
  } catch (err) {
    console.error("[tts] OpenAI generation failed:", err);
    return NextResponse.json(
      { error: "tts_failed", details: String(err) },
      { status: 500 },
    );
  }
}
