import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb, verifyUserAndGetPlan } from "@/lib/firebase-admin";
import { sendMail } from "@/lib/mail";
import { logAiUsage, whisperCostUsd } from "@/lib/ai-cost";

/**
 * "Invent a learning game" (Gadi 2026-11-12): a child tells us, by voice or
 * in writing, a game they would like to learn with. Subscribers only.
 *
 * The idea lands where the testers' notes land (testerFeedback, game
 * "new-game", kind "idea", status "new"), so it shows in /admin/testers and
 * nothing is built until Gadi approves it there. Gadi gets an email at once.
 *
 * A child's voice is not kept: the recording is transcribed and dropped, and
 * only the words are stored.
 *
 * POST multipart: audio (up to 90 s) and/or text, lang. Bearer token.
 */
export const maxDuration = 60;
const DAILY_MAX = 5;
const MAX_AUDIO = 6 * 1024 * 1024;
const MAX_TEXT = 1200;

const extOf = (t: string) => (t.includes("mp4") ? "m4a" : t.includes("mpeg") ? "mp3" : t.includes("ogg") ? "ogg" : t.includes("wav") ? "wav" : "webm");
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const PROMPT_HE = "ילד מספר על רעיון למשחק לימודי חדש ב-Gadit: איך משחקים, מה רואים על המסך, ומה לומדים. אותיות, מילים, ניקוד, הברות, תשבץ, גלגל, נקודות, שלבים.";
const PROMPT_EN = "A child describes an idea for a new learning game in Gadit: how you play, what is on the screen, what you learn. Letters, words, spelling, levels, points.";

async function transcribe(audio: Blob, lang: string, plan: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) return "";
  const f = new FormData();
  f.append("file", audio, `idea.${extOf(audio.type)}`);
  f.append("model", "gpt-transcribe");
  f.append("response_format", "json");
  if (lang === "he" || lang === "en" || lang === "ar" || lang === "ru") f.append("language", lang);
  const prompt = lang === "he" ? PROMPT_HE : PROMPT_EN;
  f.append("prompt", prompt);
  try {
    const r = await fetch("https://api.openai.com/v1/audio/transcriptions", { method: "POST", headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: f });
    if (!r.ok) return "";
    const d = (await r.json()) as { text?: string; duration?: number; usage?: { seconds?: number } };
    void logAiUsage({ feature: "game_idea", model: "gpt-transcribe", costUsd: d.usage?.seconds != null ? (d.usage.seconds / 60) * 0.0045 : whisperCostUsd(Number(d.duration ?? 0)), plan });
    const text = (d.text ?? "").trim();
    // a silent clip comes back as the prompt itself
    const bare = text.replace(/[.\s]+$/, "");
    if (!bare || (bare.length >= 20 && prompt.includes(bare))) return "";
    return text;
  } catch { return ""; }
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  const user = await verifyUserAndGetPlan(authHeader.replace(/^Bearer\s+/i, "") || null);
  if (!user) return NextResponse.json({ error: "login_required" }, { status: 401 });
  if (user.plan !== "clear" && user.plan !== "deep") return NextResponse.json({ error: "upgrade_required" }, { status: 402 });
  const uid = user.userId;

  let text = "";
  let lang = "he";
  let audio: Blob | null = null;
  try {
    const form = await req.formData();
    text = String(form.get("text") ?? "").trim().slice(0, MAX_TEXT);
    lang = String(form.get("lang") ?? "he").slice(0, 8);
    const a = form.get("audio");
    if (a instanceof Blob && a.size > 0) {
      if (a.size > MAX_AUDIO) return NextResponse.json({ error: "audio_too_large" }, { status: 413 });
      audio = a;
    }
  } catch { return NextResponse.json({ error: "bad_request" }, { status: 400 }); }
  if (!text && !audio) return NextResponse.json({ error: "empty" }, { status: 400 });

  const db = getAdminDb();
  const ref = db.collection("users").doc(uid);
  const d = (await ref.get()).data() ?? {};
  const day = new Date().toISOString().slice(0, 10);
  const count = d.gameIdeaDay === day ? Number(d.gameIdeaCount ?? 0) : 0;
  if (count >= DAILY_MAX) return NextResponse.json({ error: "daily_limit" }, { status: 429 });

  const transcript = audio ? await transcribe(audio, lang, user.plan) : "";
  const idea = [text, transcript].filter(Boolean).join("\n");
  // A recording nobody could make out: the child is asked to say it again.
  if (!idea) return NextResponse.json({ error: "not_heard" }, { status: 422 });
  await ref.set({ gameIdeaDay: day, gameIdeaCount: count + 1 }, { merge: true });

  // The child's name: a kid profile's uid is <familyId>_<memberId>.
  let name = (d.displayName as string | undefined) ?? "";
  const cut = uid.indexOf("_");
  if (!name && cut > 0) {
    const m = (await db.doc(`families/${uid.slice(0, cut)}/members/${uid.slice(cut + 1)}`).get()).data();
    name = (m?.name as string | undefined) ?? "";
  }
  if (!name) name = (d.email as string | undefined) ?? uid;

  await db.collection("testerFeedback").doc().set({
    uid, name, game: "new-game", kind: "idea", word: "", path: "/play", lang,
    transcript: idea, audioPath: null, source: "game-idea",
    status: "new", // new → approved (Gadi lets Claude build it) / skip / done
    at: FieldValue.serverTimestamp(),
  });

  if (process.env.NOTIFY_EMAIL) {
    await sendMail({
      from: "Gadit <notify@gadit.app>",
      to: process.env.NOTIFY_EMAIL,
      subject: `💡 רעיון למשחק חדש מ-${name}: ${idea.slice(0, 60)}`,
      html: `<div dir="rtl" style="font-family:Arial,sans-serif;font-size:15px;line-height:1.7">
<p><b>${esc(name)}</b> שלח רעיון למשחק לימודי חדש:</p>
<p style="background:#fff7df;border-radius:12px;padding:12px 16px;font-size:17px;white-space:pre-wrap">${esc(idea)}</p>
<p><a href="https://www.gadit.app/admin/testers">כל הרעיונות, ולאשר ל-Claude לבנות</a></p>
</div>`,
    }).catch(() => {});
  }
  return NextResponse.json({ ok: true, heard: transcript });
}
