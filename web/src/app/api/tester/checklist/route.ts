import { NextRequest, NextResponse } from "next/server";
import { FieldPath, FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { CHECK_IDS } from "@/lib/tester-checklist";

/**
 * A tester's QA checklist ticks (Gadi 2026-11-02), in users/{uid}.testerChecks
 * as { itemId: timeMs }. GET → { checks }. POST { id, done } ticks or unticks.
 */
async function testerUid(req: NextRequest): Promise<string | null> {
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  try {
    const uid = (await getAdminAuth().verifyIdToken(token)).uid;
    const d = (await getAdminDb().collection("users").doc(uid).get()).data();
    return d?.tester === true ? uid : null;
  } catch { return null; }
}

export async function GET(req: NextRequest) {
  const uid = await testerUid(req);
  if (!uid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const d = (await getAdminDb().collection("users").doc(uid).get()).data();
  return NextResponse.json({ checks: (d?.testerChecks ?? {}) as Record<string, number> });
}

export async function POST(req: NextRequest) {
  const uid = await testerUid(req);
  if (!uid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const b = (await req.json().catch(() => null)) as { id?: string; done?: boolean } | null;
  const id = String(b?.id ?? "");
  if (!CHECK_IDS.includes(id)) return NextResponse.json({ error: "bad request" }, { status: 400 });
  // ids hold a dot ("start.me"): a FieldPath keeps it one key, not a nested map
  await getAdminDb().collection("users").doc(uid).update(new FieldPath("testerChecks", id), b?.done ? Date.now() : FieldValue.delete());
  return NextResponse.json({ ok: true });
}
