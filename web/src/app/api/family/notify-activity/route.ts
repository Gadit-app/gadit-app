import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin";
import { notifyOwnerActivity } from "@/lib/family-notify";

/**
 * Called by the client when a CHILD finishes a learning ACTIVITY that isn't a
 * plain word lookup: a dictation practice (/spell) or a "Say it" pronunciation
 * session. Records it to the family activity feed and, in instant mode, sends
 * the parent a push + email so they feel they see everything the child learns
 * (Gadi 2026-09-19). Mirrors notify-search: non-kids / non-family are a silent
 * no-op, and any error is swallowed so it never disrupts the child's flow.
 *
 *   POST { kind: "spell" | "say", label, score?, total? }
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!idToken) return NextResponse.json({ ok: true, skipped: "no_auth" });

    let uid: string;
    try {
      uid = (await getAdminAuth().verifyIdToken(idToken)).uid;
    } catch {
      return NextResponse.json({ ok: true, skipped: "bad_token" });
    }

    const body = (await req.json().catch(() => null)) as
      | { kind?: string; label?: string; score?: number; total?: number }
      | null;
    const kind = body?.kind === "say" ? "say" : body?.kind === "spell" ? "spell" : null;
    const label = (body?.label ?? "").toString().trim().slice(0, 120);
    if (!kind) return NextResponse.json({ ok: true, skipped: "bad_kind" });
    const score = typeof body?.score === "number" ? Math.max(0, Math.floor(body.score)) : undefined;
    const total = typeof body?.total === "number" ? Math.max(0, Math.floor(body.total)) : undefined;

    const db = getAdminDb();
    const userDoc = await db.collection("users").doc(uid).get();
    const u = userDoc.data() as
      | { familyRole?: string; familyId?: string; memberId?: string }
      | undefined;
    if (!u || u.familyRole !== "kid" || !u.familyId) {
      return NextResponse.json({ ok: true, skipped: "not_kid" });
    }
    const ownerUid = u.familyId;

    let kidName = "Your child";
    if (u.memberId) {
      const member = await db.collection("families").doc(ownerUid).collection("members").doc(u.memberId).get();
      const mn = member.data()?.name;
      if (typeof mn === "string" && mn.trim()) kidName = mn.trim();
    }

    const nowIso = new Date().toISOString();
    await db.collection("families").doc(ownerUid).collection("kidActivity").add({
      kind, label, score: score ?? null, total: total ?? null,
      memberId: u.memberId ?? null, kidName, at: nowIso,
    });

    const famRef = db.collection("families").doc(ownerUid);
    const prefs = (await famRef.get()).data()?.notifyPrefs as
      | { enabled?: boolean; mode?: string }
      | undefined;
    if (prefs?.enabled && prefs.mode !== "daily") {
      await notifyOwnerActivity(ownerUid, kidName, kind, { label, score, total });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[notify-activity] error:", e);
    return NextResponse.json({ ok: true, skipped: "error" });
  }
}
