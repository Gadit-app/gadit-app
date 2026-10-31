import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { isWorldId } from "@/lib/world/worlds";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The child's worlds in the world game (Gadi 2026-10-30).
 *
 * Every word the child spells at a world's gate comes to live in that world
 * (its picture shows in the world's clearing). Kept on users/{uid}.world,
 * written here because the browser cannot write the user doc.
 *
 *   GET                                   → { worlds: { jungle: { items, stars } } }
 *   POST { world, w, lang, t, pic, stars } → { ok, items: n, isNew }
 */

type Item = { w: string; lang: string; t: string; pic: string | null; at: number };
type WorldState = { items?: Item[]; stars?: number };

async function uidOf(req: NextRequest): Promise<string | null> {
  const h = req.headers.get("Authorization") || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!token) return null;
  try { return (await getAdminAuth().verifyIdToken(token)).uid; } catch { return null; }
}

const str = (x: unknown, max: number) => (typeof x === "string" ? x.trim().slice(0, max) : "");

export async function GET(req: NextRequest) {
  const uid = await uidOf(req);
  if (!uid) return NextResponse.json({ error: "login_required" }, { status: 401 });
  const snap = await getAdminDb().collection("users").doc(uid).get();
  const worlds = (snap.get("world") as Record<string, WorldState> | undefined) ?? {};
  return NextResponse.json({ worlds });
}

export async function POST(req: NextRequest) {
  const uid = await uidOf(req);
  if (!uid) return NextResponse.json({ error: "login_required" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const world = body?.world;
  if (!isWorldId(world)) return NextResponse.json({ error: "unknown_world" }, { status: 400 });
  const w = str(body?.w, 40);
  const lang = str(body?.lang, 8);
  if (!w || !lang) return NextResponse.json({ error: "word_required" }, { status: 400 });
  const t = str(body?.t, 80);
  const picRaw = str(body?.pic, 600);
  const pic = /^https:\/\//.test(picRaw) || picRaw.startsWith("/") ? picRaw : null;
  const stars = Math.max(0, Math.min(20, Math.floor(Number(body?.stars) || 0)));

  const ref = getAdminDb().collection("users").doc(uid);
  const out = await getAdminDb().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const all = (snap.get("world") as Record<string, WorldState> | undefined) ?? {};
    const cur = all[world] ?? {};
    const items = Array.isArray(cur.items) ? cur.items.slice() : [];
    const i = items.findIndex((x) => x.w === w && x.lang === lang);
    const isNew = i < 0;
    if (isNew) items.push({ w, lang, t, pic, at: Date.now() });
    else if (pic && !items[i].pic) items[i] = { ...items[i], pic };
    const next: WorldState = { items: items.slice(-300), stars: (cur.stars ?? 0) + stars };
    tx.set(ref, { world: { [world]: next } }, { merge: true });
    return { items: next.items!.length, isNew };
  });
  return NextResponse.json({ ok: true, ...out });
}
