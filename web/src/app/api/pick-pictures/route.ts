/**
 * POST /api/pick-pictures  (Bearer)  "Listen and pick the picture" in Homework
 * (approved 2026-10-14), for children who don't read yet.
 *
 *   { words: string[] }                 → { images: { word: url } }   cached only, free
 *   { words: [word], create: true }     → { images: { word: url } }   draws it if missing
 *
 * One picture per English word of the ready topics (lib/picture-pick.ts),
 * shared by every child and every language, so each word is drawn once
 * (~0.65 cents). Family and schools only (Homework's own gate). A child can
 * draw at most PICK_MONTHLY_NEW new pictures a month; cached ones are free.
 *
 * Speed (Gadi 2026-10-19): the lookup takes a set's words and the other
 * topics' words in one request (one Firestore read for all), and the page
 * draws the missing ones a few at a time in parallel. The month's count is
 * reserved in a transaction before drawing (so parallel calls never pass
 * the limit) and given back when a drawing fails.
 */
import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb, verifyUserAndGetPlan } from "@/lib/firebase-admin";
import { cachedPickImages, pickImage } from "@/lib/classroom-image";
import { picWordTopic } from "@/lib/picture-pick";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// One picture at low quality takes about 5 to 15 seconds.
export const maxDuration = 60;

// A set's words plus the other topics' words its rounds may use.
const MAX_WORDS = 80;
const PICK_MONTHLY_NEW = 150;

function monthKey(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const idToken = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : null;
  const user = await verifyUserAndGetPlan(idToken);
  if (!user) return NextResponse.json({ error: "login_required" }, { status: 401 });
  if (user.plan !== "deep") return NextResponse.json({ error: "upgrade_required" }, { status: 402 });

  let words: string[] = [];
  let create = false;
  try {
    const b = (await req.json()) as { words?: unknown; create?: unknown };
    if (Array.isArray(b.words)) {
      words = [...new Set(b.words.filter((w): w is string => typeof w === "string").map((w) => w.trim()).filter((w) => w && w.length <= 60))].slice(0, MAX_WORDS);
    }
    create = b.create === true;
  } catch {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }
  if (words.length === 0) return NextResponse.json({ images: {} });

  if (!create) {
    try {
      return NextResponse.json({ images: await cachedPickImages(words) });
    } catch (e) {
      console.error("[pick-pictures] lookup:", String(e).slice(0, 200));
      return NextResponse.json({ images: {} });
    }
  }

  // Drawing: one word per call, and only a word of the ready topics.
  if (words.length !== 1) return NextResponse.json({ error: "one_word" }, { status: 400 });
  const word = words[0];
  const topic = picWordTopic(word);
  if (!topic) return NextResponse.json({ error: "not_a_ready_word" }, { status: 400 });
  const db = getAdminDb();
  const usage = db.collection("users").doc(user.userId).collection("imageUsage").doc(`pick-${monthKey()}`);
  let reserved = false;
  const img = await pickImage(word, topic, {
    // Reserve one of the month's pictures before drawing it.
    allowNew: async () => {
      reserved = await db.runTransaction(async (tx) => {
        const n = ((await tx.get(usage)).get("count") as number | undefined) ?? 0;
        if (n >= PICK_MONTHLY_NEW) return false;
        tx.set(usage, { count: n + 1, updatedAt: new Date().toISOString() }, { merge: true });
        return true;
      });
      return reserved;
    },
  });
  if (img.status === "error") {
    // The drawing failed: the reserved picture goes back to the month.
    if (reserved) await usage.set({ count: FieldValue.increment(-1), updatedAt: new Date().toISOString() }, { merge: true }).catch(() => {});
    console.error("[pick-pictures] draw:", img.error);
    return NextResponse.json({ error: "image_generation_failed" }, { status: 502 });
  }
  if (img.status === "skipped") return NextResponse.json({ error: "monthly_limit_reached" }, { status: 429 });
  return NextResponse.json({ images: { [word]: img.url } });
}
