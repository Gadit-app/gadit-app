import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { gameOwners } from "@/lib/tester-pay";

/**
 * A child finished a word in a game that a tester invented (Gadi 2026-11-02:
 * royalties, 1 Yoon per new child who plays it). Records the player once per
 * game, in gamePlayers/{prefix}/players/{uid}. The inventor's own family and
 * the testers never count. POST { game } with a Bearer token.
 */
export async function POST(req: NextRequest) {
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  let uid = "";
  try { uid = (await getAdminAuth().verifyIdToken(token)).uid; } catch {
    return NextResponse.json({ ok: true, skipped: "auth" });
  }
  const b = (await req.json().catch(() => null)) as { game?: string } | null;
  const game = String(b?.game ?? "").slice(0, 40);
  const owner = (await gameOwners()).find((o) => game === o.prefix || game.startsWith(`${o.prefix}-`));
  if (!owner) return NextResponse.json({ ok: true, skipped: "not_owned" });
  const fam = owner.uid.includes("_") ? owner.uid.slice(0, owner.uid.indexOf("_")) : owner.uid;
  if (uid === fam || uid.startsWith(`${fam}_`)) return NextResponse.json({ ok: true, skipped: "family" });
  const db = getAdminDb();
  if ((await db.collection("users").doc(uid).get()).data()?.tester === true) return NextResponse.json({ ok: true, skipped: "tester" });
  try {
    await db.collection("gamePlayers").doc(owner.prefix).collection("players").doc(uid).create({ game, firstAt: FieldValue.serverTimestamp() });
  } catch { /* already counted */ }
  return NextResponse.json({ ok: true });
}
