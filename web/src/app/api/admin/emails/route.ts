import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

/**
 * Admin — email delivery ledger for /admin/emails.
 *
 * Source of truth is OUR Firestore data, not Resend: every drip send
 * stamps dripSent.<mailKey>.sentAt on the user doc (that stamp is also
 * the duplicate-send guard), and the signup notification stamps
 * notifiedSignup/notifiedSignupAt. Resend's own dashboard only retains
 * history for a short window on the free plan; this ledger is
 * permanent. Gadi 2026-07-08, pre-marketing-campaign visibility ask.
 *
 * Auth: same ADMIN_SECRET query-param gate as every /api/admin route.
 *
 * Returns:
 *   counts: per-mail-key totals + funnel (how many users got 1st, 2nd,
 *           ... 5th drip mail), split by drip language
 *   users:  one row per user who received at least one email, with a
 *           sentAt timestamp per mail key
 */

export const maxDuration = 60;

// Keep in sync with web/src/lib/email-drip/registry.ts. Order matters:
// this is the funnel order the dashboard renders.
const DRIP_STEPS = ["welcome", "meanings", "etymology", "visual", "summary"] as const;
const DRIP_LANGS = ["he", "en"] as const;

type EmailUserRow = {
  uid: string;
  email: string | null;
  createdAt: string | null;
  dripLang: "he" | "en" | null;
  /** mail key → ISO timestamp of the send. */
  sent: Record<string, string>;
  notifiedSignupAt: string | null;
};

function tsToIso(v: unknown): string | null {
  if (!v) return null;
  if (typeof v === "object" && v !== null && "toDate" in v && typeof (v as { toDate: () => Date }).toDate === "function") {
    return (v as { toDate: () => Date }).toDate().toISOString();
  }
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "number") return new Date(v).toISOString();
  if (typeof v === "string") return v;
  return null;
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret") ?? "";
  const expected = process.env.ADMIN_SECRET;
  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_SECRET env var not configured, refusing to run" },
      { status: 503 },
    );
  }
  if (secret !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const db = getAdminDb();
  // One collection scan. dripSent is a map field, so we can't filter
  // server-side without a composite index per key — at the current
  // user count (<10k) a full scan is cheap and keeps this simple.
  const snap = await db.collection("users").select("email", "dripSent", "createdAt", "notifiedSignupAt").limit(20000).get();

  const users: EmailUserRow[] = [];
  const perKey: Record<string, number> = {};

  for (const doc of snap.docs) {
    const d = doc.data();
    const dripSent = (d.dripSent as Record<string, { sentAt?: unknown }> | undefined) ?? {};
    const notifiedSignupAt = tsToIso(d.notifiedSignupAt);
    const keys = Object.keys(dripSent);
    // Only users who actually RECEIVED a drip email belong in this
    // ledger. notifiedSignupAt alone doesn't qualify: that email goes
    // to the ADMIN (new-signup alert), not to the user, and part of
    // those stamps came from the historical backfill that never sent
    // anything. Counting them inflated "users reached" to 60 when only
    // 24 welcome emails had gone out. Gadi 2026-07-08.
    if (keys.length === 0) continue;

    const sent: Record<string, string> = {};
    for (const k of keys) {
      const iso = tsToIso(dripSent[k]?.sentAt);
      if (iso) {
        sent[k] = iso;
        perKey[k] = (perKey[k] ?? 0) + 1;
      }
    }
    if (Object.keys(sent).length === 0) continue;

    // Drip language: inferred from whichever key family the user is in.
    const dripLang = keys.some((k) => k.endsWith("-he"))
      ? ("he" as const)
      : keys.some((k) => k.endsWith("-en"))
        ? ("en" as const)
        : null;

    users.push({
      uid: doc.id,
      email: (d.email as string) ?? null,
      createdAt: tsToIso(d.createdAt),
      dripLang,
      sent,
      notifiedSignupAt,
    });
  }

  // Funnel: for each drip step, how many users (per language) got it.
  const funnel = DRIP_STEPS.map((step) => {
    const row: Record<string, number | string> = { step };
    let total = 0;
    for (const l of DRIP_LANGS) {
      const n = perKey[`${step}-${l}`] ?? 0;
      row[l] = n;
      total += n;
    }
    row.total = total;
    return row;
  });

  // Most recent sends first.
  users.sort((a, b) => {
    const aLast = Object.values(a.sent).sort().pop() ?? a.notifiedSignupAt ?? "";
    const bLast = Object.values(b.sent).sort().pop() ?? b.notifiedSignupAt ?? "";
    return bLast.localeCompare(aLast);
  });

  const now = Date.now();
  const sentLast7Days = users.reduce((acc, u) => {
    return (
      acc +
      Object.values(u.sent).filter((iso) => now - new Date(iso).getTime() < 7 * 86_400_000).length
    );
  }, 0);

  return NextResponse.json({
    counts: {
      usersWithEmails: users.length,
      totalSends: Object.values(perKey).reduce((a, b) => a + b, 0),
      sentLast7Days,
      perKey,
      funnel,
    },
    users,
  });
}
