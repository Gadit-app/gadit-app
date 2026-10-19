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

const MAX_WORDS = 30;
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
  const usage = getAdminDb().collection("users").doc(user.userId).collection("imageUsage").doc(`pick-${monthKey()}`);
  const img = await pickImage(word, topic, {
    allowNew: async () => (((await usage.get()).get("count") as number | undefined) ?? 0) < PICK_MONTHLY_NEW,
    onGenerated: async () => { await usage.set({ count: FieldValue.increment(1), updatedAt: new Date().toISOString() }, { merge: true }); },
  });
  if (img.status === "error") {
    console.error("[pick-pictures] draw:", img.error);
    return NextResponse.json({ error: "image_generation_failed" }, { status: 502 });
  }
  if (img.status === "skipped") return NextResponse.json({ error: "monthly_limit_reached" }, { status: 429 });
  return NextResponse.json({ images: { [word]: img.url } });
}
