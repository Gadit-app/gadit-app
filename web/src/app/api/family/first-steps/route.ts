import { NextRequest, NextResponse } from "next/server";
import type { DocumentData } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

/**
 * First steps of a new Family (Gadi 2026-10-21: 20 of 63 paying families had
 * never added a child, 18 subscribers had never looked up a word). Feeds the
 * FIRST STEPS card on the home page and on /family. Read-only.
 *
 * Auth: Bearer ID token of the Family OWNER only (users/{uid}.familyId ===
 * uid, a families/{uid} doc, a paid plan, not a school). Anyone else (a kid,
 * a paired parent, a coach, an individual, a school) gets { eligible: false },
 * so the card never shows for them.
 *
 * Steps, all from real data across the whole family (the owner plus every
 * linked member account):
 *   child        families/{uid}/members has a "boy" or "girl"
 *   word         any account has searchCount > 0, or a notebook word that
 *                was looked up (offline "popular-pack" words do not count)
 *   game         any account finished a practice: practiceCount has a day
 *                with a count, or practiceDays is not empty (every /play
 *                game, lesson, dictation, duel... reports there)
 *   secondParent the roster has a second "father"/"mother" (optional step)
 * The home-screen step is device-local and stays in the browser.
 *
 * `startMs` is when the paid plan or trial started (same rule as the
 * activation emails), falling back to the family's creation; `inWindow` is
 * true during the first 14 days.
 */

const DAY = 24 * 3600_000;
const WINDOW_DAYS = 14;
const PAID = new Set(["clear", "deep"]);

const tsMs = (v: unknown): number => {
  if (!v) return 0;
  if (typeof v === "number") return v;
  if (typeof v === "string") return Date.parse(v) || 0;
  const t = v as { toMillis?: () => number };
  return t.toMillis ? t.toMillis() : 0;
};

function planStart(d: DocumentData, family: DocumentData | undefined): number {
  const paid = tsMs(d.notifiedPaidAt) || tsMs(d.familyActivatedAt);
  if (paid) return paid;
  if (typeof d.trialEnd === "number") return d.trialEnd * 1000 - 14 * DAY;
  return tsMs(family?.createdAt);
}

const hasPractice = (d: DocumentData | undefined): boolean => {
  if (!d) return false;
  const pc = d.practiceCount;
  if (pc && typeof pc === "object" && Object.values(pc as Record<string, unknown>).some((n) => typeof n === "number" && n > 0)) return true;
  return Array.isArray(d.practiceDays) && d.practiceDays.length > 0;
};

const NOT_ELIGIBLE = { eligible: false } as const;

export async function GET(req: NextRequest) {
  const noStore = { headers: { "Cache-Control": "no-store" } };
  try {
    const authHeader = req.headers.get("authorization") || "";
    const idToken = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : "";
    if (!idToken) return NextResponse.json({ error: "login_required" }, { status: 401 });

    let uid = "";
    try {
      const decoded = await getAdminAuth().verifyIdToken(idToken);
      // A coach or a paired member's custom token is never the owner.
      if (decoded.coach === true || decoded.role === "kid" || decoded.role === "parent") {
        return NextResponse.json(NOT_ELIGIBLE, noStore);
      }
      uid = decoded.uid;
    } catch {
      return NextResponse.json({ error: "login_required" }, { status: 401 });
    }

    const db = getAdminDb();
    const [userSnap, famSnap] = await Promise.all([
      db.collection("users").doc(uid).get(),
      db.collection("families").doc(uid).get(),
    ]);
    const d = userSnap.data() ?? {};
    if (!famSnap.exists || d.familyId !== uid || d.schoolId || !PAID.has(d.plan)) {
      return NextResponse.json(NOT_ELIGIBLE, noStore);
    }

    const [membersSnap, linkedSnap] = await Promise.all([
      db.collection("families").doc(uid).collection("members").get(),
      db.collection("users").where("familyId", "==", uid).get(),
    ]);
    const members = membersSnap.docs.map((m) => m.data());
    const child = members.some((m) => m.role === "boy" || m.role === "girl");
    const parents = members.filter((m) => m.role === "father" || m.role === "mother").length;
    const secondParent = parents > 1;

    // Every account of this family: the owner, every users doc that points
    // at the family, and every linked member (shared-device profiles too).
    const docs = new Map<string, DocumentData | undefined>();
    docs.set(uid, d);
    for (const u of linkedSnap.docs) docs.set(u.id, u.data());
    for (const m of members) {
      const mu = typeof m.userId === "string" && m.userId ? m.userId : null;
      if (mu && !docs.has(mu)) docs.set(mu, undefined);
    }
    const missing = [...docs.entries()].filter(([, v]) => v === undefined).map(([k]) => k);
    if (missing.length) {
      const snaps = await db.getAll(...missing.map((k) => db.collection("users").doc(k)));
      for (const s of snaps) docs.set(s.id, s.data());
    }

    let word = [...docs.values()].some((x) => typeof x?.searchCount === "number" && x.searchCount > 0);
    const game = [...docs.values()].some(hasPractice);
    if (!word) {
      const found = await Promise.all(
        [...docs.keys()].map(async (k) => {
          const nb = await db.collection("users").doc(k).collection("notebook").limit(25).get();
          return nb.docs.some((x) => x.get("source") !== "popular-pack");
        }),
      );
      word = found.some(Boolean);
    }

    const startMs = planStart(d, famSnap.data());
    const now = Date.now();
    const inWindow = !startMs || now - startMs <= WINDOW_DAYS * DAY;

    return NextResponse.json(
      { eligible: true, inWindow, startMs: startMs || null, steps: { child, word, game, secondParent } },
      noStore,
    );
  } catch (e) {
    console.error("[family/first-steps] failed:", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
