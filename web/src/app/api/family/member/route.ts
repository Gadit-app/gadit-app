import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { MEMBER_COLORS, isParentRole, kidLimitFor, type MemberRole } from "@/lib/family";

/**
 * POST /api/family/member
 *
 * The family owner adds a member, or edits one (with `memberId`). These two
 * writes used to go straight from the browser to Firestore, which let an
 * owner store any field on a member doc and skip the child limit. Here only
 * the known fields are written, each one checked (2026-11-13).
 *
 *   add:  { role, name, colorIndex, age? }                         -> { id }
 *   edit: { memberId, role, name, avatarPhotoUrl, avatarId, age? } -> { ok }
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ROLES: MemberRole[] = ["father", "mother", "boy", "girl"];
// The page stores a small square picture inline (about 10 to 20 KB).
const PHOTO = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
const PHOTO_MAX = 200_000;

function cleanAge(v: unknown): number | null {
  const n = typeof v === "number" ? v : parseInt(String(v ?? ""), 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.max(3, Math.min(18, Math.floor(n)));
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return NextResponse.json({ error: "login_required" }, { status: 401 });
  let ownerUid: string;
  try {
    ownerUid = (await getAdminAuth().verifyIdToken(idToken)).uid;
  } catch {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }
  const role = body.role as MemberRole;
  if (!ROLES.includes(role)) return NextResponse.json({ error: "bad_role" }, { status: 400 });
  const name = String(body.name ?? "").trim().slice(0, 60);
  const kid = !isParentRole(role);

  const db = getAdminDb();
  // Only the owner manages members: the family doc id is the owner uid.
  const familyRef = db.collection("families").doc(ownerUid);
  if (!(await familyRef.get()).exists) return NextResponse.json({ error: "family_not_found" }, { status: 404 });
  const members = familyRef.collection("members");

  const kidsNow = async (exceptId?: string) => {
    const snap = await members.get();
    return snap.docs.filter((d) => d.id !== exceptId && !d.get("isOwner") && !isParentRole(d.get("role") as MemberRole)).length;
  };
  const limit = async () =>
    kidLimitFor(((await db.collection("users").doc(ownerUid).get()).data() as { maxKids?: unknown } | undefined)?.maxKids);

  const memberId = typeof body.memberId === "string" ? body.memberId : "";
  if (!memberId) {
    if (kid && (await kidsNow()) >= (await limit())) return NextResponse.json({ error: "kid_cap" }, { status: 403 });
    const ci = Math.floor(Number(body.colorIndex));
    const age = kid ? cleanAge(body.age) : null;
    const ref = await members.add({
      role,
      name,
      colorIndex: Number.isFinite(ci) && ci >= 0 && ci < MEMBER_COLORS.length ? ci : 0,
      isOwner: false,
      ...(age ? { age } : {}),
      createdAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ id: ref.id });
  }

  if (memberId.includes("/")) return NextResponse.json({ error: "member_not_found" }, { status: 404 });
  const ref = members.doc(memberId);
  const snap = await ref.get();
  if (!snap.exists) return NextResponse.json({ error: "member_not_found" }, { status: 404 });
  const was = snap.data() as { role?: MemberRole; avatarPhotoUrl?: string | null; isOwner?: boolean };
  // A parent profile turned into a child counts against the child limit.
  if (kid && !was.isOwner && was.role && isParentRole(was.role) && (await kidsNow(memberId)) >= (await limit())) {
    return NextResponse.json({ error: "kid_cap" }, { status: 403 });
  }
  // A photo is a small inline picture, or the one already stored.
  const photoIn = typeof body.avatarPhotoUrl === "string" ? body.avatarPhotoUrl : "";
  let photo: string | null = null;
  if (photoIn) {
    if (photoIn === was.avatarPhotoUrl) photo = photoIn;
    else if (photoIn.length <= PHOTO_MAX && PHOTO.test(photoIn)) photo = photoIn;
    else return NextResponse.json({ error: "bad_photo" }, { status: 400 });
  }
  const avatarId = typeof body.avatarId === "string" && /^[a-z0-9_-]{1,40}$/i.test(body.avatarId) ? body.avatarId : null;
  await ref.update({
    name,
    role,
    avatarPhotoUrl: photo,
    avatarId,
    ...(kid ? { age: cleanAge(body.age) } : {}),
  });
  return NextResponse.json({ ok: true });
}
