import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import type { UserRecord } from "firebase-admin/auth";
import { getDripForLang, buildUnsubUrl } from "@/lib/email-drip/registry";
import { FAMILY_DRIP } from "@/lib/email-drip/family-drip";
import { sendDripEmail } from "@/lib/email-drip/send";

/**
 * Daily drip cron. Vercel Cron hits this at 07:00 UTC (10:00 IL DST).
 * It sweeps every signed-up user and sends the right mail in their
 * drip sequence based on (a) which UI language they use, (b) how many
 * days since signup, (c) whether they've unsubscribed, (d) whether
 * that specific mail key has already been sent to them.
 *
 * Idempotent: re-running the cron the same day for the same user is
 * a no-op (the dripSent.<key> flag blocks the second attempt).
 *
 * Day-0 welcome is NOT sent from here — it's fired immediately by
 * /api/notify-signup so new users get a confirmation in their inbox
 * within seconds rather than up to 24 hours after signup. The cron
 * only handles day >= 1.
 *
 * Auth: Vercel Cron requests carry an Authorization: Bearer
 * <CRON_SECRET> header. We refuse anything without it.
 *
 * USAGE:
 *   GET /api/cron/email-drip  (Vercel Cron)
 *   GET /api/cron/email-drip?secret=$ADMIN_SECRET&dryRun=1  (manual dry run)
 */

export const maxDuration = 60;

type SendResult = {
  uid: string;
  email: string;
  mailKey: string;
  status: "sent" | "skipped" | "failed";
  reason?: string;
};

function daysBetween(a: number, b: number): number {
  // Floor to whole days in UTC so a signup at 23:59 UTC and the cron
  // at 07:00 UTC the next morning count as 1 day, not 0.
  const dayMs = 86_400_000;
  return Math.floor((b - a) / dayMs);
}

function authorise(req: NextRequest): { ok: true } | { ok: false; status: number; reason: string } {
  const auth = req.headers.get("authorization") || "";
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && auth === `Bearer ${cronSecret}`) return { ok: true };

  // Fallback: admin-secret query param for manual dry-runs.
  const secret = req.nextUrl.searchParams.get("secret") || "";
  const adminSecret = process.env.ADMIN_SECRET;
  if (adminSecret && secret === adminSecret) return { ok: true };

  return { ok: false, status: 401, reason: "unauthorized" };
}

export async function GET(req: NextRequest) {
  const authz = authorise(req);
  if (!authz.ok) return NextResponse.json({ error: authz.reason }, { status: authz.status });

  const dryRun = req.nextUrl.searchParams.get("dryRun") === "1";
  const auth = getAdminAuth();
  const db = getAdminDb();
  const now = Date.now();

  // ---------- 1) List every signed-up user (paginated) ----------
  const authUsers: UserRecord[] = [];
  let pageToken: string | undefined;
  do {
    const page = await auth.listUsers(1000, pageToken);
    authUsers.push(...page.users);
    pageToken = page.pageToken;
    if (authUsers.length >= 5000) break;
  } while (pageToken);

  // ---------- 2) Bulk-load user docs ----------
  const userDocs = new Map<string, FirebaseFirestore.DocumentData>();
  const CHUNK = 400;
  for (let i = 0; i < authUsers.length; i += CHUNK) {
    const refs = authUsers.slice(i, i + CHUNK).map((u) => db.collection("users").doc(u.uid));
    const snaps = await db.getAll(...refs);
    for (const snap of snaps) {
      if (snap.exists) userDocs.set(snap.id, snap.data() ?? {});
    }
  }

  // ---------- 3) Per-user: decide which (if any) drip mail to send ----------
  const results: SendResult[] = [];

  for (const u of authUsers) {
    const email = u.email;
    if (!email) continue;
    const d = userDocs.get(u.uid) ?? {};

    // Respect unsubscribe.
    if (d.dripUnsubscribed === true) continue;

    // Language gate. We only ship Hebrew drip today. English coming next.
    // Fall back to the user's UI language preference if stored on doc;
    // otherwise use the explicitly-tracked `dripLang` field.
    const lang: "he" | "en" =
      d.dripLang === "he" || d.dripLang === "en"
        ? d.dripLang
        : d.uiLang === "he" || d.country === "IL"
          ? "he"
          : "en";

    const he = lang === "he";

    // ── Family onboarding drip (keyed on Family activation) ──────
    // A Family owner gets the 3-step setup series (connect kids, turn on
    // alerts, how it works) instead of the general signup drip, which
    // ends in an upgrade CTA irrelevant to a paying parent. familyActivatedAt
    // is stamped once by the webhook when the Family plan activates.
    const famActivatedIso = d.familyActivatedAt as string | undefined;
    if (famActivatedIso) {
      const famActivated = Date.parse(famActivatedIso);
      if (Number.isFinite(famActivated)) {
        const famDayN = daysBetween(famActivated, now);
        const famSent = (d.familyDripSent as Record<string, unknown> | undefined) ?? {};
        let famCand: (typeof FAMILY_DRIP)[number] | null = null;
        for (const m of FAMILY_DRIP) {
          if (m.dayOffset > famDayN) continue;
          if (famSent[m.key]) continue;
          if (!famCand || m.dayOffset > famCand.dayOffset) famCand = m;
        }
        if (famCand) {
          const built = famCand.build({ he, unsubscribeUrl: buildUnsubUrl(u.uid) });
          if (dryRun) {
            results.push({ uid: u.uid, email, mailKey: famCand.key, status: "skipped", reason: "dryRun" });
          } else {
            const sent = await sendDripEmail({ to: email, subject: built.subject, html: built.html });
            if (sent.ok) {
              await db.collection("users").doc(u.uid).set(
                { familyDripSent: { [famCand.key]: { sentAt: FieldValue.serverTimestamp(), messageId: sent.id ?? null } } },
                { merge: true },
              );
              results.push({ uid: u.uid, email, mailKey: famCand.key, status: "sent" });
            } else {
              results.push({ uid: u.uid, email, mailKey: famCand.key, status: "failed", reason: sent.reason });
            }
          }
        }
      }
      continue; // Family owners skip the general signup drip.
    }

    const drip = getDripForLang(lang);
    if (drip.length === 0) continue;

    // Days since signup.
    const created = u.metadata.creationTime
      ? new Date(u.metadata.creationTime).getTime()
      : 0;
    if (!created) continue;
    const dayN = daysBetween(created, now);

    // Pick the mail whose dayOffset best matches today's dayN. We send
    // the mail with the LARGEST dayOffset <= dayN that hasn't been sent
    // yet — that way a user who somehow misses day 2 still gets it
    // when the cron next sees them past day 2.
    // Day-0 (welcome) is sent from notify-signup, not here.
    const sentMap = (d.dripSent as Record<string, unknown> | undefined) ?? {};

    let candidate: typeof drip[number] | null = null;
    for (const mail of drip) {
      if (mail.dayOffset === 0) continue; // welcome handled elsewhere
      if (mail.dayOffset > dayN) continue;
      if (sentMap[mail.key]) continue;
      if (!candidate || mail.dayOffset > candidate.dayOffset) candidate = mail;
    }

    if (!candidate) continue;

    const displayName =
      typeof u.displayName === "string" && u.displayName.trim()
        ? u.displayName.trim()
        : typeof d.displayName === "string"
          ? (d.displayName as string).trim()
          : undefined;

    const built = candidate.build({
      displayName,
      unsubscribeUrl: buildUnsubUrl(u.uid),
    });

    if (dryRun) {
      results.push({
        uid: u.uid,
        email,
        mailKey: candidate.key,
        status: "skipped",
        reason: "dryRun",
      });
      continue;
    }

    const sent = await sendDripEmail({
      to: email,
      subject: built.subject,
      html: built.html,
    });

    if (sent.ok) {
      // Mark sent atomically so a concurrent run can't double-send.
      await db.collection("users").doc(u.uid).set(
        {
          dripSent: {
            [candidate.key]: {
              sentAt: FieldValue.serverTimestamp(),
              messageId: sent.id ?? null,
            },
          },
        },
        { merge: true },
      );
      results.push({ uid: u.uid, email, mailKey: candidate.key, status: "sent" });
    } else {
      results.push({
        uid: u.uid,
        email,
        mailKey: candidate.key,
        status: "failed",
        reason: sent.reason,
      });
    }
  }

  return NextResponse.json({
    dryRun,
    scanned: authUsers.length,
    sent: results.filter((r) => r.status === "sent").length,
    skipped: results.filter((r) => r.status === "skipped").length,
    failed: results.filter((r) => r.status === "failed").length,
    results,
  });
}
