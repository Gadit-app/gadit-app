import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { cleanLook } from "@/lib/journey/shop";

/**
 * Who else is on the road to a fortress right now (Gadi 2026-11-15: "any
 * child in Gadit who is playing at this moment, anywhere in the world; they
 * only see that another player is there, with the name, and that is all").
 *
 * POST /api/journey/now
 *   Marks the caller as running now (journeyNow/{uid}: name, look, at) and
 *   returns up to three other profiles that ran in the last three minutes:
 *   { others: [{ name, look }] }.
 *
 * What a child can learn about another child is deliberately tiny:
 *   - the FIRST name only (the first word of the profile's name, letters
 *     only, at most 12), never a family name, a picture, an age, a place, a
 *     grade or an id;
 *   - the look of the runner (shirt, hat, back, companion);
 *   - nothing else, and no way to write, wave, follow or find them again.
 * A profile with no name is never listed. Written by the server only.
 */

const WINDOW_MS = 3 * 60 * 1000;
const MAX_OTHERS = 3;
/** Profiles that ran earlier today: named in one line, never drawn as runners on the road. */
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_EARLIER = 4;

/** The first word of a name, letters only, at most 12. */
function firstName(v: unknown): string {
  if (typeof v !== "string") return "";
  const w = v.trim().split(/\s+/)[0] ?? "";
  return (w.match(/[\p{L}\p{M}'’-]+/u)?.[0] ?? "").slice(0, 12);
}

export async function POST(req: NextRequest) {
  const h = req.headers.get("authorization") || "";
  const token = h.toLowerCase().startsWith("bearer ") ? h.slice(7).trim() : null;
  if (!token) return NextResponse.json({ error: "login_required" }, { status: 401 });
  try {
    const d = await getAdminAuth().verifyIdToken(token);
    const db = getAdminDb();
    const uid = d.uid;
    // The name of the profile that is playing: the family member, else the account.
    let name = "";
    if (typeof d.familyId === "string" && typeof d.memberId === "string") {
      const m = await db.collection("families").doc(d.familyId).collection("members").doc(d.memberId).get();
      name = firstName(m.get("name"));
    }
    if (!name) name = firstName((await db.collection("users").doc(uid).get()).get("displayName")) || firstName(d.name);
    const now = Date.now();
    if (name && !d.impersonating) {
      const state = (await db.collection("users").doc(uid).collection("journey").doc("state").get()).data() ?? {};
      await db.collection("journeyNow").doc(uid).set({ name, look: cleanLook(state.look), at: now });
    }
    const snap = await db.collection("journeyNow").where("at", ">", now - DAY_MS).orderBy("at", "desc").limit(60).get();
    const earlier = [...new Set(snap.docs
      .filter((x) => x.id !== uid && (x.get("at") as number) <= now - WINDOW_MS)
      .map((x) => firstName(x.get("name")))
      .filter(Boolean))]
      .slice(0, MAX_EARLIER);
    const others = snap.docs
      .filter((x) => x.id !== uid && (x.get("at") as number) > now - WINDOW_MS)
      .map((x) => ({ name: firstName(x.get("name")), look: cleanLook(x.get("look")) }))
      .filter((x) => x.name)
      .sort(() => Math.random() - 0.5)
      .slice(0, MAX_OTHERS);
    return NextResponse.json({ others, earlier });
  } catch {
    return NextResponse.json({ error: "login_required" }, { status: 401 });
  }
}
