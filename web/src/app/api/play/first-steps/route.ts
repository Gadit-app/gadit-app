import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, verifyUserAndGetPlan } from "@/lib/firebase-admin";

/**
 * First steps in reading: where a child is on the vowel steps
 * (GameVowelSteps) and on the letter steps (GameLetterSounds, 2026-11-16),
 * kept on the account so a coach who enters the child's profile from another
 * device finds the same step.
 *
 * Storage: users/{uid}/stats/firstSteps
 *   { vowels: { step: 0..4, known: { a, i, o, u, e: boolean } },
 *     letters: { step: 0..4, known: { words, g1..g4: boolean } }, updatedAt }
 *
 * GET   -> { vowels: {...} | null, letters: {...} | null }
 * POST  { vowels: { step, known } } or { letters: { step, known } } -> { ok }
 * Any signed-in profile (the game is open to every plan).
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VOWELS = ["a", "i", "o", "u", "e"] as const;
/** The letter steps: the words, then four groups of letters. */
const LETTER_STEPS = ["words", "g1", "g2", "g3", "g4"] as const;

function ref(uid: string) {
  return getAdminDb().collection("users").doc(uid).collection("stats").doc("firstSteps");
}
const bearer = (req: NextRequest) => {
  const h = req.headers.get("authorization") || "";
  return h.toLowerCase().startsWith("bearer ") ? h.slice(7).trim() : null;
};

export async function GET(req: NextRequest) {
  const user = await verifyUserAndGetPlan(bearer(req));
  if (!user) return NextResponse.json({ error: "login_required" }, { status: 401 });
  const d = (await ref(user.userId).get()).data();
  return NextResponse.json({ vowels: d?.vowels ?? null, letters: d?.letters ?? null });
}

export async function POST(req: NextRequest) {
  const user = await verifyUserAndGetPlan(bearer(req));
  if (!user) return NextResponse.json({ error: "login_required" }, { status: 401 });
  let body: { vowels?: { step?: unknown; known?: unknown }; letters?: { step?: unknown; known?: unknown } };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }
  if (body.letters) {
    const l = body.letters;
    const ls = Math.floor(Number(l.step));
    if (!Number.isFinite(ls) || ls < 0 || ls >= LETTER_STEPS.length) return NextResponse.json({ error: "bad_step" }, { status: 400 });
    const kin = (l.known && typeof l.known === "object" ? l.known : {}) as Record<string, unknown>;
    const lk: Record<string, boolean> = {};
    for (const k of LETTER_STEPS) lk[k] = kin[k] === true;
    await ref(user.userId).set({ letters: { step: ls, known: lk }, updatedAt: new Date().toISOString() }, { merge: true });
    return NextResponse.json({ ok: true });
  }
  const v = body.vowels;
  const step = Math.floor(Number(v?.step));
  if (!v || !Number.isFinite(step) || step < 0 || step >= VOWELS.length) return NextResponse.json({ error: "bad_step" }, { status: 400 });
  const knownIn = (v.known && typeof v.known === "object" ? v.known : {}) as Record<string, unknown>;
  const known: Record<string, boolean> = {};
  for (const k of VOWELS) known[k] = knownIn[k] === true;
  await ref(user.userId).set({ vowels: { step, known }, updatedAt: new Date().toISOString() }, { merge: true });
  return NextResponse.json({ ok: true });
}
