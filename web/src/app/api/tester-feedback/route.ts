import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb, getDefaultBucket } from "@/lib/firebase-admin";
import { sendMail } from "@/lib/mail";
import { logAiUsage, whisperCostUsd } from "@/lib/ai-cost";
import { TESTER_KINDS, type TesterKind } from "@/lib/tester";
import { gameName } from "@/lib/tester-games";

/**
 * A game tester's note from inside a game (Gadi 2026-11-02: Osher and Din
 * test the games). A fixed choice, optionally with a VOICE note (Gadi: "a
 * microphone so they can say the idea or the bug"). Never typed text.
 *
 * Every note: kept in testerFeedback (status "new": Claude reads these but
 * acts only after Gadi approves one in /admin/testers), the voice saved in
 * Storage, transcribed, and emailed to Gadi right away with the recording
 * attached.
 *
 * POST JSON { game, kind, word?, path? }  or  multipart with the same
 * fields plus `audio` (Bearer token).
 */
const DAILY_MAX = 60;
const MAX_AUDIO = 6 * 1024 * 1024;

const KIND_HE: Record<TesterKind, string> = {
  fun: "😍 כיף",
  boring: "😴 משעמם",
  hard: "😵 קשה מדי",
  easy: "🥱 קל מדי",
  bug: "🐞 יש באג",
  idea: "💡 יש רעיון",
  voice: "🎤 הקלטה",
};

const extOf = (t: string) => (t.includes("mp4") ? "m4a" : t.includes("mpeg") ? "mp3" : t.includes("ogg") ? "ogg" : t.includes("wav") ? "wav" : "webm");
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function transcribe(audio: Blob, lang: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) return "";
  const f = new FormData();
  f.append("file", audio, `note.${extOf(audio.type)}`);
  f.append("model", "gpt-transcribe");
  f.append("response_format", "json");
  if (lang === "he" || lang === "en") f.append("language", lang);
  try {
    const r = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: f,
    });
    if (!r.ok) return "";
    const d = (await r.json()) as { text?: string; duration?: number; usage?: { seconds?: number } };
    void logAiUsage({ feature: "tester-voice", model: "gpt-transcribe", costUsd: d.usage?.seconds != null ? (d.usage.seconds / 60) * 0.0045 : whisperCostUsd(Number(d.duration ?? 0)), plan: "deep" });
    return (d.text ?? "").trim();
  } catch { return ""; }
}

export async function POST(req: NextRequest) {
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  let uid = "";
  try { uid = (await getAdminAuth().verifyIdToken(token)).uid; } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let f: Record<string, string> = {};
  let audio: Blob | null = null;
  if ((req.headers.get("content-type") ?? "").includes("multipart/form-data")) {
    const form = await req.formData();
    for (const k of ["game", "kind", "word", "path", "lang"]) f[k] = String(form.get(k) ?? "");
    const a = form.get("audio");
    if (a instanceof Blob && a.size > 0) {
      if (a.size > MAX_AUDIO) return NextResponse.json({ error: "audio too large" }, { status: 413 });
      audio = a;
    }
  } else {
    f = ((await req.json().catch(() => null)) ?? {}) as Record<string, string>;
  }
  const game = String(f.game ?? "").slice(0, 40).replace(/[^\w-]/g, "") || "site";
  const kind = String(f.kind ?? "") as TesterKind;
  const word = String(f.word ?? "").slice(0, 40);
  const path = String(f.path ?? "").slice(0, 120);
  const lang = String(f.lang ?? "he").slice(0, 8);
  if (!TESTER_KINDS.includes(kind)) return NextResponse.json({ error: "bad request" }, { status: 400 });

  const db = getAdminDb();
  const ref = db.collection("users").doc(uid);
  const d = (await ref.get()).data() ?? {};
  if (d.tester !== true) return NextResponse.json({ error: "not a tester" }, { status: 403 });

  // A child can tap fast: a daily cap keeps the inbox sane.
  const day = new Date().toISOString().slice(0, 10);
  const count = d.testerDay === day ? Number(d.testerCount ?? 0) : 0;
  if (count >= DAILY_MAX) return NextResponse.json({ ok: true, capped: true });
  await ref.set({ testerDay: day, testerCount: count + 1 }, { merge: true });

  // The tester's name: a kid profile's uid is <familyId>_<memberId>.
  let name = (d.displayName as string | undefined) ?? "";
  const cut = uid.indexOf("_");
  if (!name && cut > 0) {
    const m = (await db.doc(`families/${uid.slice(0, cut)}/members/${uid.slice(cut + 1)}`).get()).data();
    name = (m?.name as string | undefined) ?? "";
  }
  if (!name) name = (d.email as string | undefined) ?? uid;

  const doc = db.collection("testerFeedback").doc();
  let transcript = "";
  let audioPath: string | null = null;
  let audioBuf: Buffer | null = null;
  let audioType = "";
  if (audio) {
    audioBuf = Buffer.from(await audio.arrayBuffer());
    audioType = audio.type || "audio/webm";
    audioPath = `tester-audio/${doc.id}.${extOf(audioType)}`;
    const [t] = await Promise.all([
      transcribe(audio, lang),
      getDefaultBucket().file(audioPath).save(audioBuf, { contentType: audioType }).catch(() => { audioPath = null; }),
    ]);
    transcript = t;
  }

  await doc.set({
    uid, name, game, kind, word, path, lang, transcript, audioPath,
    status: "new", // new → approved (Gadi lets Claude act) / skip / done
    at: FieldValue.serverTimestamp(),
  });

  if (process.env.NOTIFY_EMAIL) {
    const ext = extOf(audioType);
    await sendMail({
      from: "Gadit <notify@gadit.app>",
      to: process.env.NOTIFY_EMAIL,
      subject: `🧪 ${name}: ${KIND_HE[kind]} (${gameName(game, "he")})${transcript ? `: ${transcript.slice(0, 60)}` : ""}`,
      html: `<div dir="rtl" style="font-family:Arial,sans-serif;font-size:15px;line-height:1.7">
<p><b>${esc(name)}</b> בודק את <b>${esc(gameName(game, "he"))}</b> וסימן: <b>${KIND_HE[kind]}</b>${word ? `, במילה ⁨${esc(word)}⁩` : ""}.</p>
${transcript ? `<p style="background:#f5f3ff;border-radius:12px;padding:12px 16px;font-size:17px">🎤 "${esc(transcript)}"</p>` : audio ? `<p>🎤 יש הקלטה מצורפת (התמלול לא הצליח).</p>` : ""}
${path ? `<p style="color:#666;font-size:13px">עמוד: ${esc(path)}</p>` : ""}
<p><a href="https://www.gadit.app/admin/testers">כל ההערות, ולאשר ל-Claude לטפל</a></p>
</div>`,
      ...(audioBuf ? { attachments: [{ filename: `${name}-${game}.${ext}`, content: audioBuf, contentType: audioType }] } : {}),
    }).catch(() => {});
  }
  return NextResponse.json({ ok: true, transcript });
}
