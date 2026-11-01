import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { DECOR_COST, WORLDS, isWorldId } from "@/lib/world/worlds";

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
 *   POST { action: "layout", world, items: [{ w, lang, x, y }] } → { ok }
 *        where the child dragged the words in the clearing (% of the meadow);
 *        a decoration is { lang: "decor", w: <its id> }
 *   POST { action: "buy", world, kind } → { ok, decor, stars, spent } | { error: "stars" }
 *        a decoration for the clearing, DECOR_COST stars (Gadi 2026-11-01:
 *        "what does a star give me?"). Stars are earned and spent per world.
 */


type Item = { w: string; lang: string; t: string; pic: string | null; at: number; x?: number; y?: number };
type Decor = { id: string; kind: string; at: number; x?: number; y?: number };
type WorldState = { items?: Item[]; stars?: number; spent?: number; decor?: Decor[] };

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
  if (body?.action === "layout") {
    const list = Array.isArray(body.items) ? (body.items as Array<Record<string, unknown>>).slice(0, 300) : [];
    const pos = new Map<string, { x: number; y: number }>();
    const pct = (v: unknown) => { const n = Number(v); return Number.isFinite(n) ? Math.round(Math.max(0, Math.min(100, n)) * 10) / 10 : null; };
    for (const it of list) {
      const x = pct(it.x), y = pct(it.y);
      if (x != null && y != null) pos.set(`${str(it.lang, 8)}:${str(it.w, 40)}`, { x, y });
    }
    if (!pos.size) return NextResponse.json({ ok: true });
    const ref = getAdminDb().collection("users").doc(uid);
    await getAdminDb().runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const cur = ((snap.get("world") as Record<string, WorldState> | undefined) ?? {})[world] ?? {};
      const items = (cur.items ?? []).map((x) => { const p = pos.get(`${x.lang}:${x.w}`); return p ? { ...x, ...p } : x; });
      const decor = (cur.decor ?? []).map((d) => { const p = pos.get(`decor:${d.id}`); return p ? { ...d, ...p } : d; });
      tx.set(ref, { world: { [world]: { items, decor } } }, { merge: true });
    });
    return NextResponse.json({ ok: true });
  }
  if (body?.action === "buy") {
    const kind = str(body.kind, 24);
    const def = WORLDS[world];
    if (![...def.spots, ...def.animals].includes(kind)) return NextResponse.json({ error: "unknown_kind" }, { status: 400 });
    const ref = getAdminDb().collection("users").doc(uid);
    const out = await getAdminDb().runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const cur = ((snap.get("world") as Record<string, WorldState> | undefined) ?? {})[world] ?? {};
      const stars = cur.stars ?? 0, spent = cur.spent ?? 0;
      if (stars - spent < DECOR_COST) return null;
      const d: Decor = { id: Math.random().toString(36).slice(2, 10), kind, at: Date.now() };
      const decor = [...(cur.decor ?? []), d].slice(-60);
      tx.set(ref, { world: { [world]: { decor, spent: spent + DECOR_COST } } }, { merge: true });
      return { decor: d, stars, spent: spent + DECOR_COST };
    });
    if (!out) return NextResponse.json({ error: "stars" }, { status: 402 });
    return NextResponse.json({ ok: true, ...out });
  }
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
