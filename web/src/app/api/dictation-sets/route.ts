/**
 * /api/dictation-sets — a kid's practiced spelling/dictation sets.
 *
 * Stored per user under `users/{uid}/dictationSets/{setId}` so a kid can come
 * back and re-practice the SAME series (especially words they missed), listed
 * under "Dictations" in their notebook — NOT mixed into "My words" (Gadi
 * 2026-09-19). Signed-in only.
 *
 *   POST { setId, title, icon, words:[{en,he}], direction, score, total }
 *        → upserts the set, bumps timesPracticed + lastPracticedAt. { ok }
 *        + saveOnly: true → saves a list the child just made (Gat's request,
 *          Gadi 2026-10-15) without counting a practice
 *   GET                → { sets: [...] }  (this user's sets, newest first)
 *   GET ?id=<setId>    → { set }          (one set, for re-practice)
 *   PATCH { setId, title } → renames a list ("Ziv's list 1")
 *   DELETE ?id=<setId>     → removes a list from "My practice"
 */
import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Pair = { en: string; he: string };

async function uidFromReq(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get("authorization") || "";
  const idToken = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : "";
  if (!idToken) return null;
  try {
    return (await getAdminAuth().verifyIdToken(idToken)).uid;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const uid = await uidFromReq(req);
  if (!uid) return NextResponse.json({ error: "login_required" }, { status: 401 });

  let setId = "", title = "", icon = "", direction = "he2en";
  let words: Pair[] = [];
  let score = 0, total = 0, saveOnly = false;
  try {
    const b = (await req.json()) as {
      setId?: unknown; title?: unknown; icon?: unknown; direction?: unknown;
      words?: unknown; score?: unknown; total?: unknown; saveOnly?: unknown;
    };
    saveOnly = b.saveOnly === true;
    if (typeof b.setId === "string") setId = b.setId.trim().slice(0, 80).replace(/[^A-Za-z0-9_-]/g, "");
    if (typeof b.title === "string") title = b.title.trim().slice(0, 60);
    if (typeof b.icon === "string") icon = b.icon.trim().slice(0, 8);
    if (typeof b.direction === "string" && ["he2en", "en2he", "he2he", "en2en"].includes(b.direction)) direction = b.direction;
    if (typeof b.score === "number") score = Math.max(0, Math.floor(b.score));
    if (typeof b.total === "number") total = Math.max(0, Math.floor(b.total));
    if (Array.isArray(b.words)) {
      words = b.words
        .map((w) => {
          const o = (w ?? {}) as { en?: unknown; he?: unknown };
          return { en: typeof o.en === "string" ? o.en.slice(0, 40) : "", he: typeof o.he === "string" ? o.he.slice(0, 40) : "" };
        })
        .filter((w) => w.en && w.he)
        .slice(0, 50);
    }
  } catch {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }
  if (!setId || words.length < 2) return NextResponse.json({ error: "bad_set" }, { status: 400 });

  const ref = getAdminDb().collection("users").doc(uid).collection("dictationSets").doc(setId);
  try {
    const snap = await ref.get();
    const now = new Date().toISOString();
    if (saveOnly) {
      // A new list: listed at once ("not practiced yet"); an existing one keeps its results.
      await ref.set(
        {
          setId, title, icon, direction, words, custom: true,
          ...(snap.exists ? {} : { createdAt: now, lastPracticedAt: now, timesPracticed: 0 }),
        },
        { merge: true },
      );
      return NextResponse.json({ ok: true });
    }
    await ref.set(
      {
        setId, icon, direction, words,
        // A list the child named keeps its name.
        ...(snap.exists && snap.get("custom") === true && snap.get("title") ? {} : { title }),
        lastScore: score, lastTotal: total,
        lastPracticedAt: now,
        timesPracticed: FieldValue.increment(1),
        ...(snap.exists ? {} : { createdAt: now }),
      },
      { merge: true },
    );
  } catch (e) {
    return NextResponse.json({ error: "write_failed", details: String(e) }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const uid = await uidFromReq(req);
  if (!uid) return NextResponse.json({ error: "login_required" }, { status: 401 });

  const col = getAdminDb().collection("users").doc(uid).collection("dictationSets");
  const id = req.nextUrl.searchParams.get("id");
  try {
    if (id) {
      const snap = await col.doc(id).get();
      if (!snap.exists) return NextResponse.json({ error: "not_found" }, { status: 404 });
      return NextResponse.json({ set: snap.data() });
    }
    const q = await col.orderBy("lastPracticedAt", "desc").limit(50).get();
    const sets = q.docs.map((d) => d.data());
    return NextResponse.json({ sets });
  } catch (e) {
    // Missing index / empty collection → return empty rather than error.
    return NextResponse.json({ sets: [], note: String(e) });
  }
}

function cleanId(v: unknown): string {
  return typeof v === "string" ? v.trim().slice(0, 80).replace(/[^A-Za-z0-9_-]/g, "") : "";
}

export async function PATCH(req: NextRequest) {
  const uid = await uidFromReq(req);
  if (!uid) return NextResponse.json({ error: "login_required" }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as { setId?: unknown; title?: unknown };
  const setId = cleanId(b.setId);
  const title = typeof b.title === "string" ? b.title.replace(/\s+/g, " ").trim().slice(0, 60) : "";
  if (!setId || !title) return NextResponse.json({ error: "bad_body" }, { status: 400 });
  const ref = getAdminDb().collection("users").doc(uid).collection("dictationSets").doc(setId);
  if (!(await ref.get()).exists) return NextResponse.json({ error: "not_found" }, { status: 404 });
  await ref.set({ title, custom: true }, { merge: true });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const uid = await uidFromReq(req);
  if (!uid) return NextResponse.json({ error: "login_required" }, { status: 401 });
  const setId = cleanId(req.nextUrl.searchParams.get("id"));
  if (!setId) return NextResponse.json({ error: "bad_id" }, { status: 400 });
  await getAdminDb().collection("users").doc(uid).collection("dictationSets").doc(setId).delete();
  return NextResponse.json({ ok: true });
}
