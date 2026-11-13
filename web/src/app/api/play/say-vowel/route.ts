import { NextRequest, NextResponse } from "next/server";
import { verifyUserAndGetPlan, getAdminApp } from "@/lib/firebase-admin";
import { logAiUsage } from "@/lib/ai-cost";
import { limitBump } from "@/lib/rate-limit";

/**
 * The ear of the Letter Wheel game (Gadi 2026-11-12, Shirli's idea): the child
 * says one open syllable out loud ("חוֹ") and this tells which of the five
 * Hebrew vowels was heard.
 *
 * Two listeners were compared on 60 recorded syllables (2026-11-12):
 * Gemini, asked to pick one of a/e/i/o/u, was right on 52 and said "none" on
 * 5 clipped recordings; gpt-transcribe with a Latin-letters prompt was right
 * on 38 (it answers in Cyrillic, Korean or Hebrew letters, or with nothing).
 * So Gemini listens (on Vertex AI, signed in with the site's service account,
 * like the Hebrew voice), and the transcriber is only the second try.
 *
 * Only the vowel is judged, never the consonant.
 *
 * POST multipart: audio (a 1 to 4 second clip), want (a | e | i | o | u).
 * Answers { ok, vowel }: `vowel` is null when nothing clear was heard, so the
 * game asks again instead of calling it a mistake. The clip is not stored.
 * Paid plans only, like /api/transcribe; without it the game falls back to
 * "say it, then hear it".
 */

export const maxDuration = 30;

type Vowel = "a" | "e" | "i" | "o" | "u";
const VOWELS: Vowel[] = ["a", "e", "i", "o", "u"];
const VERTEX_PROJECT = process.env.VERTEX_PROJECT || "gen-lang-client-0395022300";
const EAR_MODEL = "gemini-3.8-flash";
const ASK =
  "A child reads one Hebrew syllable out loud: one consonant and one vowel. Which vowel sound is it? " +
  "Answer with exactly one of: a, e, i, o, u. If there is no clear speech, answer: none.";

/** Gemini's answer: a vowel, null for "none", undefined when it could not be asked. */
async function geminiEar(audio: Buffer, mimeType: string): Promise<{ vowel: Vowel | null; tokensIn: number; tokensOut: number } | undefined> {
  try {
    const token = await getAdminApp().options.credential?.getAccessToken();
    if (!token?.access_token) return undefined;
    const res = await fetch(
      `https://aiplatform.googleapis.com/v1/projects/${VERTEX_PROJECT}/locations/global/publishers/google/models/${EAR_MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token.access_token}` },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ inlineData: { mimeType, data: audio.toString("base64") } }, { text: ASK }] }],
          generationConfig: { temperature: 0, maxOutputTokens: 200 },
        }),
      },
    );
    if (!res.ok) { console.warn("[say-vowel] vertex:", res.status); return undefined; }
    const j = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; thoughtsTokenCount?: number };
    };
    const said = (j.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "").trim().toLowerCase().replace(/[^a-z]/g, "");
    const vowel = (VOWELS as string[]).includes(said) ? (said as Vowel) : null;
    return { vowel, tokensIn: j.usageMetadata?.promptTokenCount ?? 0, tokensOut: (j.usageMetadata?.candidatesTokenCount ?? 0) + (j.usageMetadata?.thoughtsTokenCount ?? 0) };
  } catch (err) {
    console.warn("[say-vowel] vertex:", err);
    return undefined;
  }
}

/** Is `v` the vowel of the Latin spelling `t`? English habits included (ee = i, oo = u, ay = e). */
function heardAs(v: Vowel, t: string): boolean {
  const x = t.replace(/[^a-z]/g, "");
  if (!x || x.length > 8) return false;
  if (v === "a") return /a/.test(x) && !/ay|ai/.test(x) && !/^[^a]*e[^a]*$/.test(x);
  if (v === "e") return /e/.test(x.replace(/ee/g, "")) || /ay|ei|ai/.test(x);
  if (v === "i") return /ee|y$/.test(x) || (/i/.test(x) && !/ai|ei/.test(x));
  if (v === "o") return /o/.test(x.replace(/oo|ou/g, "")) || /aw/.test(x);
  return /u|oo/.test(x);
}

/** The second try: a transcript in Latin letters, read for its vowel. */
async function transcriberEar(audio: Blob, ext: string): Promise<{ vowel: Vowel | null; seconds: number } | undefined> {
  if (!process.env.OPENAI_API_KEY) return undefined;
  const up = new FormData();
  up.append("file", audio, `say.${ext}`);
  up.append("model", "gpt-transcribe");
  up.append("response_format", "json");
  up.append("prompt", "A single syllable, written in Latin letters, e.g. ka, be, mi, lo, tsu.");
  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", { method: "POST", headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: up });
  if (!res.ok) { console.warn("[say-vowel] transcriber:", res.status); return undefined; }
  const data = (await res.json()) as { text?: string; usage?: { seconds?: number } };
  const heard = (data.text ?? "").trim().toLowerCase();
  return { vowel: VOWELS.find((v) => heardAs(v, heard)) ?? null, seconds: Number(data.usage?.seconds ?? 2) };
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const userInfo = await verifyUserAndGetPlan(authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null);
    if (!userInfo) return NextResponse.json({ error: "login_required" }, { status: 401 });
    if (userInfo.plan === "basic") return NextResponse.json({ error: "upgrade_required" }, { status: 402 });

    const form = await req.formData();
    const audio = form.get("audio");
    const want = String(form.get("want") ?? "") as Vowel;
    if (!(audio instanceof Blob) || audio.size === 0) return NextResponse.json({ error: "no_audio" }, { status: 400 });
    if (audio.size > 2 * 1024 * 1024) return NextResponse.json({ error: "audio_too_large" }, { status: 413 });
    if (!VOWELS.includes(want)) return NextResponse.json({ error: "bad_want" }, { status: 400 });
    // A daily ceiling per profile, far above a child's real practice. Past
    // it the game falls back to "check yourselves", as when the ear is down.
    if ((await limitBump("sayvowel", userInfo.userId, 86400)) > 1500) return NextResponse.json({ error: "daily_limit" }, { status: 429 });

    const type = (audio.type || "audio/webm").split(";")[0];
    const ext = type.includes("mp4") ? "m4a" : type.includes("ogg") ? "ogg" : type.includes("wav") ? "wav" : "webm";

    let vowel: Vowel | null;
    const g = await geminiEar(Buffer.from(await audio.arrayBuffer()), type);
    if (g) {
      vowel = g.vowel;
      void logAiUsage({ feature: "say_vowel", model: EAR_MODEL, tokensIn: g.tokensIn, tokensOut: g.tokensOut, plan: userInfo.plan });
    } else {
      const o = await transcriberEar(audio, ext);
      if (!o) return NextResponse.json({ error: "listener_unavailable" }, { status: 502 });
      vowel = o.vowel;
      void logAiUsage({ feature: "say_vowel", model: "gpt-transcribe", costUsd: (o.seconds / 60) * 0.0045, plan: userInfo.plan });
    }
    return NextResponse.json({ ok: vowel === want, vowel });
  } catch (err) {
    console.error("[say-vowel] error:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
