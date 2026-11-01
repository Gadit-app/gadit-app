/**
 * Friends in Word Worlds (Gadi 2026-11-01, from the AI panel: "visit a
 * friend's world and leave a word as a gift"). Server only.
 *
 * Safety (child safety is the moat): no text between children at all. A
 * friend is added only with their friend code, and a child's side of the
 * friendship needs a parent's OK before anything is visible. Friends see a
 * first name, an avatar and the words in each other's worlds; a gift is one
 * word the sender already spelled in their own world.
 *
 *   users/{uid}.friendCode            the child's code (6 letters/digits)
 *   friendCodes/{code}                → { uid }
 *   friendships/{a__b}                { users:[a,b], ok:{a:bool,b:bool}, status, by, at }
 *   users/{uid}/gifts/{id}            { from, fromName, fromAvatar, w, lang, t, pic, at, openedAt? }
 */
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

export type Profile = { uid: string; name: string; avatar: string | null; familyId: string | null; isKid: boolean };
export type Friendship = { users: [string, string]; ok: Record<string, boolean>; status: "pending" | "active"; by: string; at: number };

// No look-alikes (0/O, 1/I/L) so a child can read the code to a friend.
const ALPHA = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export async function uidOf(req: { headers: { get(n: string): string | null } }): Promise<string | null> {
  const h = req.headers.get("Authorization") || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!token) return null;
  try { return (await getAdminAuth().verifyIdToken(token)).uid; } catch { return null; }
}

export const pairId = (a: string, b: string) => (a < b ? `${a}__${b}` : `${b}__${a}`);

/** The child's friend code, made on first use. */
export async function friendCodeFor(uid: string): Promise<string> {
  const db = getAdminDb();
  const ref = db.collection("users").doc(uid);
  const have = (await ref.get()).get("friendCode") as string | undefined;
  if (have) return have;
  for (let t = 0; t < 8; t++) {
    let code = "";
    for (let i = 0; i < 6; i++) code += ALPHA[Math.floor(Math.random() * ALPHA.length)];
    const cref = db.collection("friendCodes").doc(code);
    const ok = await db.runTransaction(async (tx) => {
      if ((await tx.get(cref)).exists) return false;
      tx.set(cref, { uid, at: Date.now() });
      tx.set(ref, { friendCode: code }, { merge: true });
      return true;
    });
    if (ok) return code;
  }
  throw new Error("no_code");
}

export async function uidForCode(code: string): Promise<string | null> {
  const c = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (c.length !== 6) return null;
  const snap = await getAdminDb().collection("friendCodes").doc(c).get();
  return snap.exists ? ((snap.get("uid") as string) ?? null) : null;
}

/** First name and avatar as a friend sees them; family and whether the child needs a parent's OK. */
export async function profileOf(uid: string): Promise<Profile> {
  const db = getAdminDb();
  const u = (await db.collection("users").doc(uid).get()).data() ?? {};
  const familyId = (u.familyId as string | undefined) ?? null;
  const isKid = u.familyRole === "kid";
  let name = "", avatar: string | null = (u.avatarId as string | undefined) ?? null;
  if (familyId) {
    const m = await db.collection("families").doc(familyId).collection("members").where("userId", "==", uid).limit(1).get();
    const md = m.docs[0]?.data() as { name?: string; avatarId?: string | null } | undefined;
    if (md) { name = md.name ?? ""; avatar = md.avatarId ?? avatar; }
  }
  if (!name) name = (u.displayName as string | undefined) ?? "";
  // A first name only: never a surname to another child.
  name = name.trim().split(/\s+/)[0]?.slice(0, 20) ?? "";
  return { uid, name, avatar, familyId, isKid };
}

/** Whether `caller` may approve for child `kid`: a parent in the child's family. */
export async function isParentOf(caller: string, kid: Profile): Promise<boolean> {
  if (!kid.familyId) return false;
  if (caller === kid.familyId) return true;
  const c = (await getAdminDb().collection("users").doc(caller).get()).data() ?? {};
  return c.familyId === kid.familyId && c.familyRole === "parent";
}

export async function friendshipOf(a: string, b: string): Promise<Friendship | null> {
  const snap = await getAdminDb().collection("friendships").doc(pairId(a, b)).get();
  return snap.exists ? (snap.data() as Friendship) : null;
}

export async function friendshipsOf(uid: string): Promise<Friendship[]> {
  const snap = await getAdminDb().collection("friendships").where("users", "array-contains", uid).get();
  return snap.docs.map((d) => d.data() as Friendship);
}

/** The owner's language for a push (as family-notify does). */
export async function ownerLang(ownerUid: string): Promise<string> {
  const db = getAdminDb();
  try {
    const fam = await db.collection("families").doc(ownerUid).get();
    const pref = fam.data()?.notifyPrefs?.lang as string | undefined;
    if (pref) return pref;
    const u = (await db.collection("users").doc(ownerUid).get()).data() as { uiLang?: string } | undefined;
    return u?.uiLang || "en";
  } catch { return "en"; }
}
