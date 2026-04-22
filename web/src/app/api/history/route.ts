import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, verifyUserAndGetPlan } from "@/lib/firebase-admin";

const MAX_HISTORY = 10;

interface HistoryEntry {
  word: string;
  uiLang: string;
  timestamp: string;
}

async function authPaid(req: NextRequest) {
  const authHeader = req.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const userInfo = await verifyUserAndGetPlan(idToken);
  if (!userInfo) return { error: "login_required", status: 401 as const };
  if (userInfo.plan === "basic") return { error: "upgrade_required", status: 402 as const };
  return { userId: userInfo.userId };
}

export async function GET(req: NextRequest) {
  const auth = await authPaid(req);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    const docRef = getAdminDb().collection("users").doc(auth.userId).collection("meta").doc("history");
    const snap = await docRef.get();
    const items = (snap.data()?.items as HistoryEntry[] | undefined) ?? [];
    return NextResponse.json({ items });
  } catch (err) {
    console.error("history GET error:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await authPaid(req);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    const { word, uiLang } = await req.json();
    if (!word?.trim()) {
      return NextResponse.json({ error: "word required" }, { status: 400 });
    }
    const cleanWord = word.trim();
    const cleanLang = typeof uiLang === "string" ? uiLang : "en";

    const docRef = getAdminDb().collection("users").doc(auth.userId).collection("meta").doc("history");
    const snap = await docRef.get();
    const existing = (snap.data()?.items as HistoryEntry[] | undefined) ?? [];

    // Skip if the most-recent entry is the exact same word + lang (no-op)
    const last = existing[0];
    if (last && last.word === cleanWord && last.uiLang === cleanLang) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    // Remove any earlier occurrence of the same word+lang (avoid duplicates)
    const filtered = existing.filter((e) => !(e.word === cleanWord && e.uiLang === cleanLang));

    const newEntry: HistoryEntry = {
      word: cleanWord,
      uiLang: cleanLang,
      timestamp: new Date().toISOString(),
    };

    const updated = [newEntry, ...filtered].slice(0, MAX_HISTORY);
    await docRef.set({ items: updated, updatedAt: new Date().toISOString() }, { merge: true });

    return NextResponse.json({ ok: true, items: updated });
  } catch (err) {
    console.error("history POST error:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await authPaid(req);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    await getAdminDb()
      .collection("users")
      .doc(auth.userId)
      .collection("meta")
      .doc("history")
      .set({ items: [], updatedAt: new Date().toISOString() }, { merge: true });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("history DELETE error:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
