import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { isWorldId } from "@/lib/world/worlds";
import {
  friendCodeFor, friendshipOf, friendshipsOf, ownerLang, pairId, profileOf, uidForCode, uidOf,
  type Friendship,
} from "@/lib/world/friends-server";
import { friendsCopy } from "@/lib/world/friends-i18n";
import { sendPushToOwner } from "@/lib/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * A child's friends in Word Worlds (Gadi 2026-11-01). See lib/world/friends-server.
 *
 *   GET                                   → { code, friends, gifts }
 *   POST { action: "add", code }          → { ok, status } | { error }
 *   POST { action: "visit", uid }         → { name, avatar, worlds }
 *   POST { action: "gift", uid, w, lang } → { ok } | { error: "limit" }
 *   POST { action: "open", id, world }    → { ok }   (after the child spelled it)
 */

type WorldItem = { w: string; lang: string; t: string; pic: string | null; at: number; x?: number; y?: number; from?: string };
type WorldState = { items?: WorldItem[]; stars?: number };
type Gift = { from: string; fromName: string; fromAvatar: string | null; w: string; lang: string; t: string; pic: string | null; at: number; openedAt?: number };

const DAY = 86_400_000;
const GIFTS_PER_FRIEND_PER_DAY = 3;
const str = (x: unknown, max: number) => (typeof x === "string" ? x.trim().slice(0, max) : "");

export async function GET(req: NextRequest) {
  const uid = await uidOf(req);
  if (!uid) return NextResponse.json({ error: "login_required" }, { status: 401 });
  const db = getAdminDb();
  const [code, fs, giftSnap] = await Promise.all([
    friendCodeFor(uid),
    friendshipsOf(uid),
    db.collection("users").doc(uid).collection("gifts").orderBy("at", "desc").limit(30).get(),
  ]);
  const friends = await Promise.all(fs.map(async (f) => {
    const other = f.users[0] === uid ? f.users[1] : f.users[0];
    const p = await profileOf(other);
    return { uid: other, name: p.name, avatar: p.avatar, status: f.status };
  }));
  const gifts = giftSnap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Gift) }))
    .filter((g) => !g.openedAt)
    .map((g) => ({ id: g.id, fromName: g.fromName, fromAvatar: g.fromAvatar, w: g.w, lang: g.lang, t: g.t, pic: g.pic }));
  return NextResponse.json({ code, friends, gifts });
}

export async function POST(req: NextRequest) {
  const uid = await uidOf(req);
  if (!uid) return NextResponse.json({ error: "login_required" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const action = body?.action;
  const db = getAdminDb();

  if (action === "add") {
    const other = await uidForCode(str(body?.code, 12));
    if (!other) return NextResponse.json({ error: "not_found" }, { status: 404 });
    if (other === uid) return NextResponse.json({ error: "self" }, { status: 400 });
    const ref = db.collection("friendships").doc(pairId(uid, other));
    const [me, them] = await Promise.all([profileOf(uid), profileOf(other)]);
    const out = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (snap.exists) return { already: true, f: snap.data() as Friendship };
      // A child's side waits for a parent; a grown-up's side is OK at once.
      const ok: Record<string, boolean> = { [uid]: !me.isKid, [other]: !them.isKid };
      const f: Friendship = { users: [uid, other], ok, status: ok[uid] && ok[other] ? "active" : "pending", by: uid, at: Date.now() };
      tx.set(ref, f);
      return { already: false, f };
    });
    if (out.already) return NextResponse.json({ error: "already", status: out.f.status }, { status: 409 });
    // Tell each child's parent (the family owner) that a request waits.
    for (const [kid, friend] of [[me, them], [them, me]] as const) {
      if (!kid.isKid || !kid.familyId) continue;
      const fc = friendsCopy(await ownerLang(kid.familyId));
      void sendPushToOwner(kid.familyId, { title: fc.pushTitle, body: fc.pushBody(friend.name || "?", kid.name || "?"), url: "/family", tag: `friend-${pairId(uid, other)}` }).catch(() => 0);
    }
    return NextResponse.json({ ok: true, status: out.f.status });
  }

  if (action === "visit") {
    const other = str(body?.uid, 128);
    const f = other ? await friendshipOf(uid, other) : null;
    if (!f || f.status !== "active") return NextResponse.json({ error: "not_friends" }, { status: 403 });
    const [p, snap] = await Promise.all([profileOf(other), db.collection("users").doc(other).get()]);
    const all = (snap.get("world") as Record<string, WorldState> | undefined) ?? {};
    // Only the words and where they stand: nothing else about the friend.
    const worlds: Record<string, { items: WorldItem[] }> = {};
    for (const [k, v] of Object.entries(all)) {
      if (!isWorldId(k) || !Array.isArray(v.items)) continue;
      worlds[k] = { items: v.items.map((x) => ({ w: x.w, lang: x.lang, t: x.t, pic: x.pic, at: x.at, x: x.x, y: x.y, from: x.from })) };
    }
    return NextResponse.json({ name: p.name, avatar: p.avatar, worlds });
  }

  if (action === "gift") {
    const other = str(body?.uid, 128);
    const w = str(body?.w, 40), lang = str(body?.lang, 8);
    const f = other ? await friendshipOf(uid, other) : null;
    if (!f || f.status !== "active") return NextResponse.json({ error: "not_friends" }, { status: 403 });
    // Only a word the child already spelled in one of their own worlds.
    const mine = (await db.collection("users").doc(uid).get()).get("world") as Record<string, WorldState> | undefined;
    const item = Object.values(mine ?? {}).flatMap((v) => v.items ?? []).find((x) => x.w === w && x.lang === lang);
    if (!item) return NextResponse.json({ error: "not_yours" }, { status: 400 });
    const gifts = db.collection("users").doc(other).collection("gifts");
    const recent = await gifts.where("from", "==", uid).get();
    if (recent.docs.filter((d) => (d.get("at") as number) > Date.now() - DAY).length >= GIFTS_PER_FRIEND_PER_DAY) {
      return NextResponse.json({ error: "limit" }, { status: 429 });
    }
    const me = await profileOf(uid);
    const g: Gift = { from: uid, fromName: me.name, fromAvatar: me.avatar, w: item.w, lang: item.lang, t: item.t ?? "", pic: item.pic ?? null, at: Date.now() };
    await gifts.add(g);
    return NextResponse.json({ ok: true });
  }

  if (action === "open") {
    const id = str(body?.id, 64);
    const world = body?.world;
    if (!id || !isWorldId(world)) return NextResponse.json({ error: "bad_request" }, { status: 400 });
    const ref = db.collection("users").doc(uid);
    const gref = ref.collection("gifts").doc(id);
    await db.runTransaction(async (tx) => {
      const [gs, us] = await Promise.all([tx.get(gref), tx.get(ref)]);
      if (!gs.exists || gs.get("openedAt")) return;
      const g = gs.data() as Gift;
      const all = (us.get("world") as Record<string, WorldState> | undefined) ?? {};
      const cur = all[world] ?? {};
      const items = Array.isArray(cur.items) ? cur.items.slice() : [];
      const i = items.findIndex((x) => x.w === g.w && x.lang === g.lang);
      // The word lives in the child's world, marked with who gave it.
      if (i >= 0) items[i] = { ...items[i], from: g.fromName };
      else items.push({ w: g.w, lang: g.lang, t: g.t, pic: g.pic, at: Date.now(), from: g.fromName });
      tx.set(ref, { world: { [world]: { items: items.slice(-300) } } }, { merge: true });
      tx.set(gref, { openedAt: Date.now() }, { merge: true });
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "unknown_action" }, { status: 400 });
}
