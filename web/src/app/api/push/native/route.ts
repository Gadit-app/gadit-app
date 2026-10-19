import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { isExpoPushToken } from "@/lib/native-app";

/**
 * Expo push tokens from the Gadit iOS app (components/NativeAppBridge.tsx).
 *
 *   POST   { token }  store on users/{uid}.expoPushTokens (deduped, newest
 *                     last, at most 5). The same phone token is removed from
 *                     any OTHER user first, so one phone only ever alerts the
 *                     person signed in on it.
 *   DELETE { token }  remove it from the caller (sign out, user switch).
 *
 * Auth: Firebase ID token (Bearer). lib/push.ts sends to these tokens.
 */

const MAX_TOKENS = 5;

async function uidFrom(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return null;
  try {
    return (await getAdminAuth().verifyIdToken(idToken)).uid;
  } catch {
    return null;
  }
}

async function tokenFrom(req: NextRequest): Promise<string | null> {
  const body = (await req.json().catch(() => null)) as { token?: unknown } | null;
  const token = typeof body?.token === "string" ? body.token.trim() : "";
  return isExpoPushToken(token) ? token : null;
}

export async function POST(req: NextRequest) {
  const uid = await uidFrom(req);
  if (!uid) return NextResponse.json({ error: "login_required" }, { status: 401 });
  const token = await tokenFrom(req);
  if (!token) return NextResponse.json({ error: "bad_token" }, { status: 400 });

  const db = getAdminDb();
  try {
    // This phone now belongs to `uid`: drop it from anyone else.
    const others = await db.collection("users").where("expoPushTokens", "array-contains", token).get();
    await Promise.all(
      others.docs
        .filter((d) => d.id !== uid)
        .map((d) => d.ref.update({ expoPushTokens: FieldValue.arrayRemove(token) }).catch(() => {})),
    );

    const ref = db.collection("users").doc(uid);
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const raw = snap.data()?.expoPushTokens;
      const list = (Array.isArray(raw) ? raw : []).filter((t): t is string => typeof t === "string" && t !== token);
      list.push(token);
      tx.set(
        ref,
        { expoPushTokens: list.slice(-MAX_TOKENS), expoPushUpdatedAt: Date.now(), iosAppUser: true },
        { merge: true },
      );
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[push/native] save failed:", e);
    return NextResponse.json({ error: "save_failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const uid = await uidFrom(req);
  if (!uid) return NextResponse.json({ error: "login_required" }, { status: 401 });
  const token = await tokenFrom(req);
  if (!token) return NextResponse.json({ error: "bad_token" }, { status: 400 });
  try {
    await getAdminDb()
      .collection("users")
      .doc(uid)
      .set({ expoPushTokens: FieldValue.arrayRemove(token) }, { merge: true });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[push/native] remove failed:", e);
    return NextResponse.json({ error: "remove_failed" }, { status: 500 });
  }
}
