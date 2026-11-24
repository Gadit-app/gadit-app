import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { toWebp } from "@/lib/image-webp";
import { getAdminDb, getDefaultBucket } from "@/lib/firebase-admin";
import { logAiUsage, IMAGE_MODEL, IMAGE_COST } from "@/lib/ai-cost";
import { adminBudgetExceeded } from "@/lib/ai-budget";
import { kidsBriefImage, kidsSceneImage } from "@/lib/classroom-image";
import { INV_SETS, INV_VARIANTS } from "@/lib/invaders/content";
import { INV_SCENE, invPicKey, invSceneKey, variantBrief } from "@/lib/invaders/keys";

/**
 * Admin: draw the pictures of The Invading Words (Gadi 2026-11-24, about
 * $1.2 for the 90 drawn meanings of the 59 Hebrew words, two pictures each).
 * Each drawn meaning gets INV_VARIANTS pictures in the kids house style,
 * from its hand-written brief, stored once in imageCache/img_inv_<lang>_<hash>.
 * Already drawn pictures are skipped, so a run can be repeated safely.
 *
 *   GET  /api/admin/invaders-pics?secret=$ADMIN_SECRET&lang=he   → how many are drawn
 *   POST /api/admin/invaders-pics?secret=$ADMIN_SECRET
 *        { lang, words?: string[], max?: number }               → draws up to `max` (default 20, at most 60)
 *        { scene: true }                                        → the sky and the impostor, once (about $0.03)
 *        { lang, redraw: ["כוכב:shape:1", ...] }                → draws those pictures again (one that came out wrong)
 *
 * Bounded: 3 at a time, and the admin daily spend cap.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

type Task = { w: string; id: string; v: number; brief: string; key: string };

function tasksOf(lang: string, only?: Set<string>): Task[] {
  const set = INV_SETS[lang];
  if (!set) return [];
  const out: Task[] = [];
  for (const word of set.words) {
    if (only && !only.has(word.w)) continue;
    for (const s of word.s) {
      if (!s.b) continue;
      for (let v = 1; v <= INV_VARIANTS; v++) out.push({ w: word.w, id: s.id, v, brief: variantBrief(s.b, v), key: invPicKey(lang, word.w, s.id, v) });
    }
  }
  return out;
}

function authorized(req: NextRequest): NextResponse | null {
  const expected = process.env.ADMIN_SECRET;
  if (!expected) return NextResponse.json({ error: "ADMIN_SECRET not configured" }, { status: 503 });
  if ((req.nextUrl.searchParams.get("secret") ?? "") !== expected) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return null;
}

async function drawnKeys(keys: string[]): Promise<Set<string>> {
  const db = getAdminDb();
  const have = new Set<string>();
  for (let i = 0; i < keys.length; i += 100) {
    const part = keys.slice(i, i + 100);
    const snaps = await db.getAll(...part.map((k) => db.collection("imageCache").doc(k)));
    snaps.forEach((s, j) => { if (s.get("url")) have.add(part[j]); });
  }
  return have;
}

export async function GET(req: NextRequest) {
  const bad = authorized(req);
  if (bad) return bad;
  const lang = req.nextUrl.searchParams.get("lang") || "he";
  const tasks = tasksOf(lang);
  const have = await drawnKeys(tasks.map((t) => t.key));
  return NextResponse.json({ lang, pictures: tasks.length, drawn: have.size, left: tasks.length - have.size });
}

export async function POST(req: NextRequest) {
  const bad = authorized(req);
  if (bad) return bad;
  if (await adminBudgetExceeded()) return NextResponse.json({ error: "admin_budget" }, { status: 429 });

  let lang = "he";
  let max = 20;
  let only: Set<string> | undefined;
  let scene = false;
  let redraw: Set<string> | undefined;
  try {
    const b = (await req.json()) as { lang?: unknown; words?: unknown; max?: unknown; scene?: unknown; redraw?: unknown };
    if (typeof b.lang === "string") lang = b.lang;
    if (typeof b.max === "number") max = Math.max(1, Math.min(60, Math.floor(b.max)));
    if (Array.isArray(b.words)) only = new Set(b.words.filter((w): w is string => typeof w === "string"));
    scene = b.scene === true;
    // { redraw: ["word:id:variant", ...] }: draw these again although they exist (a picture that came out wrong)
    if (Array.isArray(b.redraw)) redraw = new Set(b.redraw.filter((x): x is string => typeof x === "string").slice(0, 20));
  } catch { /* defaults */ }
  if (!INV_SETS[lang]) return NextResponse.json({ error: "unknown_lang" }, { status: 400 });

  // { scene: true }: the game's own art (the sky, the unmasked impostor), once.
  if (scene) {
    const db = getAdminDb();
    const bucket = getDefaultBucket();
    const done: string[] = [];
    let cost = 0;
    for (const [name, art] of Object.entries(INV_SCENE)) {
      const ref = db.collection("imageCache").doc(invSceneKey(name));
      if ((await ref.get()).get("url")) continue;
      const out = await kidsSceneImage(art.prompt, art.quality);
      const c = out.cost ?? IMAGE_COST[art.quality];
      cost += c;
      void logAiUsage({ feature: "image_invaders", model: IMAGE_MODEL, images: 1, imageQuality: art.quality, costUsd: c, admin: true });
      const storagePath = `word-images/${invSceneKey(name)}-${crypto.randomBytes(4).toString("hex")}.webp`;
      const file = bucket.file(storagePath);
      await file.save(await toWebp(Buffer.from(out.b64, "base64")), { contentType: "image/webp", metadata: { cacheControl: "public, max-age=31536000, immutable", metadata: { game: "invaders", art: name } } });
      await file.makePublic();
      await ref.set({ url: `https://storage.googleapis.com/${bucket.name}/${storagePath}`, kind: "invaders-scene", art: name, storagePath, createdAt: new Date().toISOString() });
      done.push(name);
    }
    return NextResponse.json({ scene: done, costUsd: Number(cost.toFixed(4)) });
  }

  const all = tasksOf(lang, only);
  const tasks = redraw ? all.filter((t) => redraw.has(`${t.w}:${t.id}:${t.v}`)) : all;
  const have = redraw ? new Set<string>() : await drawnKeys(tasks.map((t) => t.key));
  const pending = tasks.filter((t) => !have.has(t.key)).slice(0, max);

  const db = getAdminDb();
  const bucket = getDefaultBucket();
  let drawn = 0, cost = 0;
  const failed: string[] = [];
  let i = 0;
  async function worker() {
    while (i < pending.length) {
      const t = pending[i++];
      try {
        const out = await kidsBriefImage(t.brief);
        const c = out.cost ?? IMAGE_COST.low;
        cost += c;
        void logAiUsage({ feature: "image_invaders", model: IMAGE_MODEL, images: 1, imageQuality: "low", costUsd: c, admin: true });
        const storagePath = `word-images/${t.key}-${crypto.randomBytes(4).toString("hex")}.webp`;
        const file = bucket.file(storagePath);
        await file.save(await toWebp(Buffer.from(out.b64, "base64")), {
          contentType: "image/webp",
          metadata: { cacheControl: "public, max-age=31536000, immutable", metadata: { word: t.w, sense: t.id, variant: String(t.v), game: "invaders" } },
        });
        await file.makePublic();
        const url = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
        await db.collection("imageCache").doc(t.key).set({ url, word: t.w, uiLang: lang, sense: t.id, variant: t.v, brief: t.brief.slice(0, 500), kind: "invaders", style: "kids", storagePath, createdAt: new Date().toISOString() });
        drawn++;
      } catch (e) {
        failed.push(`${t.w}:${t.id}:${t.v} ${String(e).slice(0, 120)}`);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(3, pending.length) }, () => worker()));
  const leftAfter = tasks.length - have.size - drawn;
  return NextResponse.json({ lang, drawn, failed, costUsd: Number(cost.toFixed(4)), left: leftAfter });
}
