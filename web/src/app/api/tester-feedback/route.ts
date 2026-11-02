import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { sendMail } from "@/lib/mail";
import { TESTER_KINDS, type TesterKind } from "@/lib/tester";

/**
 * A game tester's quick note from inside a game (Gadi 2026-11-02: Osher and
 * Din test the new games). Fixed choices only, never free text from a child.
 * Kept in testerFeedback and sent to Gadi by email right away.
 *
 * POST { game, kind, word? }  (Bearer token)
 */
const DAILY_MAX = 40;

const KIND_HE: Record<TesterKind, string> = {
  fun: "😍 כיף",
  boring: "😴 משעמם",
  hard: "😵 קשה מדי",
  easy: "🥱 קל מדי",
  bug: "🐞 יש באג",
  idea: "💡 יש לי רעיון (כדאי לשאול אותו)",
};

export async function POST(req: NextRequest) {
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  let uid = "";
  try { uid = (await getAdminAuth().verifyIdToken(token)).uid; } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as { game?: string; kind?: string; word?: string } | null;
  const game = String(body?.game ?? "").slice(0, 40).replace(/[^\w-]/g, "");
  const kind = String(body?.kind ?? "") as TesterKind;
  const word = String(body?.word ?? "").slice(0, 40);
  if (!game || !TESTER_KINDS.includes(kind)) return NextResponse.json({ error: "bad request" }, { status: 400 });

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

  await db.collection("testerFeedback").add({ uid, name, game, kind, word, at: FieldValue.serverTimestamp() });

  if (process.env.NOTIFY_EMAIL) {
    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    void sendMail({
      from: "Gadit <notify@gadit.app>",
      to: process.env.NOTIFY_EMAIL,
      subject: `🧪 ${name}: ${KIND_HE[kind]} (${game})`,
      html: `<div dir="rtl" style="font-family:Arial,sans-serif;font-size:15px;line-height:1.7">
<p><b>${esc(name)}</b> בודק את המשחק <b>${esc(game)}</b> וסימן: <b>${KIND_HE[kind]}</b>${word ? `, במילה ⁨${esc(word)}⁩` : ""}.</p>
</div>`,
    }).catch(() => {});
  }
  return NextResponse.json({ ok: true });
}
