import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { getGradSets, emailHash, phoneHash } from "@/lib/college-grads";
import { autoEnrollPartner } from "@/lib/partner-auto";
import { isPayingStatus } from "@/lib/internal-accounts";

/**
 * One-off match of EVERY existing user against the college's coach-track
 * graduate list (Gadi 2026-10-16). Reports counts only, never a name, e-mail
 * or phone.
 *
 *   GET  /api/admin/college-grads?secret=$ADMIN_SECRET
 *        → { users, matched, byEmail, byPhone, alreadyPartners, toEnroll, paying }
 *   POST /api/admin/college-grads?secret=$ADMIN_SECRET&apply=1
 *        → also enrolls the matched non-partners as founder partners (sends
 *          each one the partner welcome e-mail). Separate approval only.
 *
 * Phones checked here: the auth record and the user doc. The Stripe customer
 * phone is checked per user at signup and payment time (lib/partner-auto).
 */
export const maxDuration = 300;

function authz(req: NextRequest): NextResponse | null {
  const expected = process.env.ADMIN_SECRET;
  if (!expected) return NextResponse.json({ error: "ADMIN_SECRET env var not configured, refusing to run" }, { status: 503 });
  if ((req.nextUrl.searchParams.get("secret") ?? "") !== expected) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return null;
}

type Match = { uid: string; email: string | null; phones: string[]; byEmail: boolean };

async function matchAll(): Promise<
  | { error: string }
  | { users: number; matches: Match[]; byEmail: number; byPhone: number; alreadyPartners: number; paying: number; toEnroll: Match[] }
> {
  const sets = await getGradSets();
  if (!sets) return { error: "college_list_unavailable" };
  const db = getAdminDb();

  const docs = new Map<string, Record<string, unknown>>();
  (await db.collection("users").get()).forEach((d) => docs.set(d.id, d.data()));

  const matches: Match[] = [];
  let users = 0;
  let pageToken: string | undefined;
  do {
    const page = await getAdminAuth().listUsers(1000, pageToken);
    for (const u of page.users) {
      users++;
      const doc = docs.get(u.uid) ?? {};
      const email = u.email ?? (typeof doc.email === "string" ? doc.email : null);
      const phones = [u.phoneNumber, doc.phone, doc.phoneNumber].filter((p): p is string => typeof p === "string" && !!p.trim());
      const eh = emailHash(email);
      const byEmail = !!eh && sets.emails.has(eh);
      const byPhone = phones.some((p) => { const h = phoneHash(p); return !!h && sets.phones.has(h); });
      if (byEmail || byPhone) matches.push({ uid: u.uid, email, phones, byEmail });
    }
    pageToken = page.pageToken;
  } while (pageToken);

  const partnerEmails = new Set<string>();
  const partnerOwners = new Set<string>();
  (await db.collection("partners").get()).forEach((d) => {
    const p = d.data();
    if (typeof p.email === "string") partnerEmails.add(p.email.trim().toLowerCase());
    if (typeof p.ownerUid === "string") partnerOwners.add(p.ownerUid);
  });
  const isPartner = (m: Match) => partnerOwners.has(m.uid) || (!!m.email && partnerEmails.has(m.email.trim().toLowerCase()));
  const toEnroll = matches.filter((m) => !isPartner(m) && !!m.email && !docs.get(m.uid)?.schoolId);

  return {
    users,
    matches,
    byEmail: matches.filter((m) => m.byEmail).length,
    byPhone: matches.filter((m) => !m.byEmail).length,
    alreadyPartners: matches.filter(isPartner).length,
    paying: matches.filter((m) => isPayingStatus(docs.get(m.uid)?.subscriptionStatus)).length,
    toEnroll,
  };
}

export async function GET(req: NextRequest) {
  const denied = authz(req);
  if (denied) return denied;
  const r = await matchAll();
  if ("error" in r) return NextResponse.json(r, { status: 503 });
  return NextResponse.json({
    users: r.users,
    matched: r.matches.length,
    byEmail: r.byEmail,
    byPhone: r.byPhone,
    alreadyPartners: r.alreadyPartners,
    toEnroll: r.toEnroll.length,
    paying: r.paying,
  });
}

export async function POST(req: NextRequest) {
  const denied = authz(req);
  if (denied) return denied;
  if (req.nextUrl.searchParams.get("apply") !== "1") return NextResponse.json({ error: "add apply=1 to enroll" }, { status: 400 });
  const r = await matchAll();
  if ("error" in r) return NextResponse.json(r, { status: 503 });
  let enrolled = 0;
  for (const m of r.toEnroll) {
    await autoEnrollPartner(m.uid, m.email, m.phones);
    enrolled++;
  }
  return NextResponse.json({ matched: r.matches.length, attempted: enrolled });
}
