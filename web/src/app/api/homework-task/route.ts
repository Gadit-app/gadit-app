/**
 * /api/homework-task: the one thing a grown-up set for the child to do
 * (Gadi 2026-10-12, Homework stage 2: photograph or paste, confirm what it
 * is, pick the test day). One task per child; a new one replaces the old.
 * Stored on the user doc as `homeworkTask`, so it shows on every device the
 * child signs in on. No model call here: the words of a list are paired by
 * /api/spell-set and a workbook lesson is built by /api/learn before saving.
 *
 *   GET            → { task | null }
 *   POST { kind: "list" | "text" | "pages", title, testDate?, words?, text? } → { ok, task }
 *   DELETE         → { ok }
 */
import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Pair = { en: string; he: string };
type HomeworkTask = {
  kind: "list" | "text" | "pages";
  title: string;
  testDate: string | null;
  words?: Pair[];
  text?: string;
  at: number;
};

async function uidFromReq(req: NextRequest): Promise<string | null> {
  const h = req.headers.get("authorization") || "";
  const idToken = h.toLowerCase().startsWith("bearer ") ? h.slice(7).trim() : "";
  if (!idToken) return null;
  try {
    return (await getAdminAuth().verifyIdToken(idToken)).uid;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const uid = await uidFromReq(req);
  if (!uid) return NextResponse.json({ error: "login_required" }, { status: 401 });
  const snap = await getAdminDb().collection("users").doc(uid).get();
  const task = (snap.get("homeworkTask") as HomeworkTask | undefined) ?? null;
  return NextResponse.json({ task });
}

export async function POST(req: NextRequest) {
  const uid = await uidFromReq(req);
  if (!uid) return NextResponse.json({ error: "login_required" }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const kind = b.kind === "list" || b.kind === "text" || b.kind === "pages" ? b.kind : null;
  if (!kind) return NextResponse.json({ error: "bad_kind" }, { status: 400 });
  const title = typeof b.title === "string" ? b.title.trim().slice(0, 60) : "";
  const testDate = typeof b.testDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(b.testDate) ? b.testDate : null;
  const task: HomeworkTask = { kind, title, testDate, at: Date.now() };
  if (kind === "list") {
    const words = Array.isArray(b.words)
      ? (b.words as Array<{ en?: unknown; he?: unknown }>)
          .map((w) => ({ en: typeof w?.en === "string" ? w.en.slice(0, 40) : "", he: typeof w?.he === "string" ? w.he.slice(0, 40) : "" }))
          .filter((w) => w.en && w.he)
          .slice(0, 40)
      : [];
    if (words.length < 2) return NextResponse.json({ error: "too_few_words" }, { status: 400 });
    task.words = words;
  }
  if (kind === "text") {
    const text = typeof b.text === "string" ? b.text.trim().slice(0, 10000) : "";
    if (text.length < 10) return NextResponse.json({ error: "too_short" }, { status: 400 });
    task.text = text;
  }
  await getAdminDb().collection("users").doc(uid).set({ homeworkTask: task }, { merge: true });
  return NextResponse.json({ ok: true, task });
}

export async function DELETE(req: NextRequest) {
  const uid = await uidFromReq(req);
  if (!uid) return NextResponse.json({ error: "login_required" }, { status: 401 });
  await getAdminDb().collection("users").doc(uid).set({ homeworkTask: FieldValue.delete() }, { merge: true });
  return NextResponse.json({ ok: true });
}
