import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { verifyUserAndGetPlan, getDefaultBucket } from "@/lib/firebase-admin";
import { logAiUsage, ttsCostUsd } from "@/lib/ai-cost";

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
    xh: "nova", nso: "nova", tn: "nova", st: "nova", ts: "nova", ss: "nova", ve: "nova", nr: "nova",
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

// Hebrew voice (see the Hebrew branch in POST).
const GEMINI_TTS_MODEL = "gemini-3.8-flash-tts";
const GEMINI_VOICE = "Aoede";
const HEBREW_RE = /[א-ת]/;

/** Gemini speech for `text` as a WAV file (Gemini returns raw 24 kHz 16-bit
 *  mono PCM, which every browser plays once it has a WAV header). */
async function geminiSpeech(text: string, apiKey: string): Promise<{ wav: Buffer; tokensIn: number; tokensOut: number }> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TTS_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }],
        generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: GEMINI_VOICE } } } },
      }),
    },
  );
  if (!res.ok) throw new Error(`gemini_${res.status}`);
  const json = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ inlineData?: { data?: string; mimeType?: string } }> } }>;
    usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
  };
  const inline = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data)?.inlineData;
  if (!inline?.data) throw new Error("gemini_no_audio");
  const rate = Number((inline.mimeType ?? "").match(/rate=(\d+)/)?.[1] ?? 24000);
  return { wav: cleanWav(Buffer.from(inline.data, "base64"), rate), tokensIn: json.usageMetadata?.promptTokenCount ?? 0, tokensOut: json.usageMetadata?.candidatesTokenCount ?? 0 };
}

/** A WAV header for 16-bit mono PCM. */
function wavOf(pcm: Buffer, rate: number): Buffer {
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + pcm.length, 4); h.write("WAVE", 8);
  h.write("fmt ", 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write("data", 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

/**
 * Only the sound (Gadi 2026-10-17, "a strange noise at the end of every
 * word"). Gemini used to return raw PCM; it now returns a whole WAV file with
 * a C2PA provenance chunk (a ~6 KB signature) after the audio. Wrapping that
 * in another header played the inner header as a click at the start and the
 * signature as a loud burst of noise at the end. This keeps just the PCM of
 * the innermost "data" chunk, at its own sample rate, and drops every other
 * chunk. Raw PCM and our own clean files pass through as they are; files
 * cached before the fix are cleaned when they are read.
 */
function cleanWav(buf: Buffer, rate = 24000, depth = 0): Buffer {
  if (buf.length < 12 || buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WAVE") {
    return depth === 0 ? wavOf(buf, rate) : buf;
  }
  let fmtRate = rate;
  let data: Buffer | null = null;
  for (let at = 12; at + 8 <= buf.length; ) {
    const id = buf.toString("ascii", at, at + 4);
    const size = buf.readUInt32LE(at + 4);
    const body = buf.subarray(at + 8, Math.min(buf.length, at + 8 + size));
    if (id === "fmt " && body.length >= 8) fmtRate = body.readUInt32LE(4);
    if (id === "data") { data = body; break; }
    at += 8 + size + (size % 2);
  }
  if (!data) return depth === 0 ? wavOf(Buffer.alloc(0), fmtRate) : buf;
  // A WAV inside the data chunk (our old header around Gemini's own file).
  if (depth < 2 && data.length >= 12 && data.toString("ascii", 0, 4) === "RIFF") return cleanWav(data, fmtRate, depth + 1);
  return wavOf(Buffer.from(data.subarray(0, data.length - (data.length % 2))), fmtRate);
}

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

  // Hebrew is read by Gemini's "Aoede" voice (Gadi 2026-10-10): the OpenAI
  // voices read Hebrew with an American accent ("זהבי" came out "סבאבי"),
  // while Aoede reads it like a native speaker, even without niqqud. Plain
  // text only: a style instruction in the prompt was sometimes read aloud.
  // Any failure (the key's rate limit, an outage) falls through to OpenAI
  // below, so the speaker always plays something.
  if (!requestedVoice && (lang === "he" || HEBREW_RE.test(text)) && process.env.GEMINI_API_KEY) {
    const gHash = contentHash(text, GEMINI_VOICE, GEMINI_TTS_MODEL, "wav");
    const gPath = `tts-cache/${gHash}.wav`;
    const audioHeaders = (cache: string) => ({
      "Content-Type": "audio/wav",
      "Cache-Control": "public, max-age=31536000, immutable",
      ETag: `"${gHash}"`,
      "X-Gadit-TTS-Cache": cache,
    });
    try {
      const file = getDefaultBucket().file(gPath);
      const [exists] = await file.exists();
      if (exists) {
        const [buffer] = await file.download();
        const clean = cleanWav(buffer);
        // A file cached before the fix: store the clean one once.
        if (clean.length !== buffer.length) void file.save(clean, { contentType: "audio/wav", metadata: { cacheControl: "public, max-age=31536000, immutable" } }).catch(() => {});
        return new Response(clean as unknown as BodyInit, { headers: audioHeaders("HIT") });
      }
    } catch (err) {
      console.warn("[tts] storage read failed (gemini):", err);
    }
    try {
      const { wav, tokensIn, tokensOut } = await geminiSpeech(text, process.env.GEMINI_API_KEY);
      void logAiUsage({ feature: "tts_he", model: GEMINI_TTS_MODEL, tokensIn, tokensOut, plan: userInfo.plan });
      void getDefaultBucket()
        .file(gPath)
        .save(wav, {
          contentType: "audio/wav",
          metadata: { cacheControl: "public, max-age=31536000, immutable", metadata: { voice: GEMINI_VOICE, model: GEMINI_TTS_MODEL, lang: lang ?? "", textPreview: text.slice(0, 100) } },
        })
        .catch((err: unknown) => console.warn("[tts] storage write failed (gemini):", err));
      return new Response(wav as unknown as BodyInit, { headers: audioHeaders("MISS") });
    } catch (err) {
      console.warn("[tts] gemini failed, falling back to OpenAI:", err);
    }
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
  // A single word said on its own (games, dictation, word cards) is easy to
  // swallow: "boat" came out like "bow" (Gadi 2026-10-22). Single words get
  // their own instructions and their own cache key ("|word1"), so they are
  // regenerated once, clearly, with the full vowel and the final sound.
  const singleWord = !/\s/.test(text.trim()) && text.trim().length <= 24;
  const hash = contentHash(singleWord ? `${text}|word1` : text, voice, model, AUDIO_FORMAT);
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
    const ttsInstructions = singleWord
      ? "Say this one word on its own for a child who is learning it. Speak slowly and very clearly, " +
        "with a standard neutral accent, and pronounce every sound fully, including the full vowel and the last consonant " +
        "(for example boat ends in a clear t, and is never said like bow). Say only the word, once, with no other words."
      : "Speak naturally and warmly, like a thoughtful friend reading a dictionary entry aloud. " +
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
    // Cache hits return before this point, so only real generations log.
    void logAiUsage({ feature: lang === "he" ? "tts_he_fallback" : "tts", model, costUsd: ttsCostUsd(text.length), plan: userInfo.plan });

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
