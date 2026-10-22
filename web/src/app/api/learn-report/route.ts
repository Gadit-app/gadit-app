import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { isLearnLang, wordKey } from "@/lib/learn/engine";

/**
 * POST /api/learn-report  (Bearer)  "Wrong translation?" on a learning-mode
 * word card (2026-10-22, Hebrew as a second language first: its bank and
 * translations were written by hand).
 *
 *   { lang, w, t, nq?, en?, ui, lessonId?, topic?, pageUrl? }  → { ok }
 *
 * One document per word and person, learnReports/{lang_word}__{uid}: a second
 * tap on the same word only counts again (no flood). Written here with the
 * Admin SDK, never from the browser. Listed in /admin/learn-reports.
 */
export const dynamic = "force-dynamic";

const str = (x: unknown, n: number) => (typeof x === "string" ? x.trim().slice(0, n) : "");

export async function POST(req: NextRequest) {
  const h = req.headers.get("Authorization") || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!token) return NextResponse.json({ error: "login_required" }, { status: 401 });
  let uid = "";
  let email: string | null = null;
  try {
    const d = await getAdminAuth().verifyIdToken(token);
    uid = d.uid;
    email = d.email ?? null;
  } catch {
    return NextResponse.json({ error: "login_required" }, { status: 401 });
  }
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (!isLearnLang(b.lang)) return NextResponse.json({ error: "lang_required" }, { status: 400 });
  const w = str(b.w, 60);
  if (!w || !/\p{L}/u.test(w)) return NextResponse.json({ error: "word_required" }, { status: 400 });
  const key = wordKey(b.lang, w);
  const now = new Date().toISOString();
  const ref = getAdminDb().collection("learnReports").doc(`${key}__${uid}`.slice(0, 1400));
  const first = !(await ref.get()).exists;
  await ref.set({
    ...(first ? { firstAt: now } : {}),
    lang: b.lang,
    wordKey: key,
    word: w,
    translation: str(b.t, 120),
    nq: str(b.nq, 80) || null,
    en: str(b.en, 80) || null,
    ui: str(b.ui, 8) || "en",
    lessonId: str(b.lessonId, 60) || null,
    topic: str(b.topic, 60) || null,
    pageUrl: str(b.pageUrl, 300) || null,
    uid,
    email,
    count: FieldValue.increment(1),
    lastAt: now,
    status: "open",
  }, { merge: true });
  return NextResponse.json({ ok: true });
}
