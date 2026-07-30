import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

/**
 * One-shot notify Gadi by email when a brand-new user signs up.
 *
 * Called by the client right after a successful signup (either Google
 * popup → isNewUser=true, or email/password createUser). The server
 * verifies the ID token, checks if we've already notified for this UID
 * (notifiedSignup flag on /users/{uid}), and if not — sends the email
 * via Resend and atomically sets the flag.
 *
 * Dedupe is server-side so duplicate client calls are harmless. Existing
 * users get marked as notified by the one-time backfill at
 * /api/admin/backfill-mark-notified.
 *
 * USAGE:
 *   POST /api/notify-signup
 *   Headers: Authorization: Bearer <firebase id token>
 *
 * Response: { sent: bool, reason?: string }
 */

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!idToken) {
      return NextResponse.json({ sent: false, reason: "no_token" }, { status: 401 });
    }

    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const uid = decoded.uid;
    const email = decoded.email ?? null;

    // Optional UTM payload from the client — first-touch attribution
    // captured at landing (gadit.app/he?utm_source=instagram&...).
    // Persisted on the user doc so /admin/campaigns can attribute the
    // signup to its source. Body is JSON; client may also send no body
    // (older clients), so parse defensively.
    let utm: {
      source?: string; medium?: string; campaign?: string;
      term?: string; content?: string; landingPath?: string;
    } | null = null;
    try {
      const body = await req.json().catch(() => null);
      if (body && typeof body === "object" && body.utm) {
        const u = body.utm as Record<string, unknown>;
        const pick = (k: string): string | undefined =>
          typeof u[k] === "string" && (u[k] as string).length > 0
            ? (u[k] as string).slice(0, 100)
            : undefined;
        utm = {
          source: pick("source"),
          medium: pick("medium"),
          campaign: pick("campaign"),
          term: pick("term"),
          content: pick("content"),
          landingPath: pick("landingPath"),
        };
        // If every field is empty, treat as no UTM at all.
        if (!utm.source && !utm.medium && !utm.campaign) utm = null;
      }
    } catch {
      utm = null;
    }

    const db = getAdminDb();
    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();
    const data = userSnap.data() ?? {};

    // Persist UTM (first-touch) even if we've already notified — the
    // client only sends one in the first ~30 days post-signup anyway,
    // and writing once is idempotent. Use setWhereMissing semantics so
    // we don't overwrite existing attribution data from a later visit.
    if (utm && !data.utmSource) {
      await userRef.set(
        {
          ...(utm.source ? { utmSource: utm.source } : {}),
          ...(utm.medium ? { utmMedium: utm.medium } : {}),
          ...(utm.campaign ? { utmCampaign: utm.campaign } : {}),
          ...(utm.term ? { utmTerm: utm.term } : {}),
          ...(utm.content ? { utmContent: utm.content } : {}),
          ...(utm.landingPath ? { utmLandingPath: utm.landingPath } : {}),
          utmCapturedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    }

    // Partner (affiliate) attribution — if this signup arrived through a
    // /p/<code> referral link, the /p route dropped a `gadit_ref` cookie
    // carrying the partner's id. Stamp it on the user doc (once) so every
    // future Stripe payment on this account accrues a commission. Runs
    // before the notify dedupe so it still lands on repeat calls, and is
    // itself idempotent (only writes when referredBy is not already set).
    try {
      const refPartnerId = req.cookies.get("gadit_ref")?.value;
      if (refPartnerId && !data.referredBy) {
        const partnerSnap = await db.collection("partners").doc(refPartnerId).get();
        const partner = partnerSnap.data();
        if (partnerSnap.exists && partner?.status !== "suspended" && partner?.ownerUid !== uid) {
          await userRef.set(
            {
              referredBy: partner?.code ?? null,
              referredPartnerId: refPartnerId,
              referredAt: Date.now(),
            },
            { merge: true },
          );
          await partnerSnap.ref.update({ signups: FieldValue.increment(1) });
        }
      }
    } catch (e) {
      console.warn("[notify-signup] partner attribution failed (non-blocking):", e);
    }

    if (data.notifiedSignup === true) {
      return NextResponse.json({ sent: false, reason: "already_notified", utmStored: !!utm });
    }

    // Look up the Firebase Auth metadata for richer detail in the email.
    const authUser = await getAdminAuth().getUser(uid);
    const providers = authUser.providerData.map((p) =>
      p.providerId.replace(".com", "").replace("password", "email"),
    );
    const country =
      req.headers.get("x-vercel-ip-country") ||
      (data.country as string | undefined) ||
      null;

    const resendKey = process.env.RESEND_API_KEY;
    const notifyTo  = process.env.NOTIFY_EMAIL;
    if (!resendKey || !notifyTo) {
      console.warn("[notify-signup] missing RESEND_API_KEY or NOTIFY_EMAIL, skipping");
      return NextResponse.json({ sent: false, reason: "not_configured" });
    }

    const resend = new Resend(resendKey);

    const signupTime = authUser.metadata.creationTime
      ? new Date(authUser.metadata.creationTime)
      : new Date();
    const signupTimeStr = signupTime.toLocaleString("en-IL", {
      timeZone: "Asia/Jerusalem",
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

    const flagEmoji = country && country.length === 2
      ? String.fromCodePoint(
          ...[...country.toUpperCase()].map((c) => 0x1f1e6 + (c.charCodeAt(0) - 65)),
        )
      : "🌐";

    const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>New Gadit signup</title></head>
<body style="margin:0;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F9FAFB;color:#111827;">
  <div style="max-width:520px;margin:0 auto;background:white;border-radius:12px;border:1px solid #E5E7EB;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#0EA5A5,#0E7490);padding:24px;color:white;">
      <div style="font-size:13px;font-weight:600;letter-spacing:1px;opacity:0.85;">GADIT</div>
      <div style="font-size:22px;font-weight:700;margin-top:4px;">New signup 🎉</div>
    </div>
    <div style="padding:24px;">
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:8px 0;color:#6B7280;width:120px;">Email</td><td style="padding:8px 0;color:#111827;font-weight:500;">${escapeHtml(email ?? "(none)")}</td></tr>
        <tr><td style="padding:8px 0;color:#6B7280;">Signed up via</td><td style="padding:8px 0;color:#111827;">${escapeHtml(providers.join(", "))}</td></tr>
        <tr><td style="padding:8px 0;color:#6B7280;">Country</td><td style="padding:8px 0;color:#111827;">${flagEmoji} ${escapeHtml(country ?? "unknown")}</td></tr>
        <tr><td style="padding:8px 0;color:#6B7280;">When</td><td style="padding:8px 0;color:#111827;">${escapeHtml(signupTimeStr)} (Israel time)</td></tr>
        <tr><td style="padding:8px 0;color:#6B7280;">UID</td><td style="padding:8px 0;color:#9CA3AF;font-family:ui-monospace,monospace;font-size:12px;">${escapeHtml(uid)}</td></tr>
      </table>
      <div style="margin-top:24px;padding-top:24px;border-top:1px solid #F3F4F6;text-align:center;">
        <a href="https://www.gadit.app/admin/users" style="display:inline-block;background:#0EA5A5;color:white;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Open admin dashboard</a>
      </div>
    </div>
    <div style="background:#F9FAFB;padding:16px 24px;font-size:12px;color:#9CA3AF;text-align:center;">
      You're receiving this because you're the admin of gadit.app.
    </div>
  </div>
</body>
</html>`;

    const subject = `🎉 New Gadit signup: ${email ?? "(no email)"} ${flagEmoji}`;

    const result = await resend.emails.send({
      // Verified sender on gadit.app domain (Resend verified the domain
      // 2026-06-12). The `notify@` mailbox is admin-only so we can
      // separate it from `welcome@`, `support@`, etc. when sequenced
      // emails ship. Note: there's no real mailbox at notify@; replies
      // to this address aren't read. That's intentional — these are
      // outbound-only system notifications. Use support@gadit.app for
      // anything customer-facing that expects a reply.
      from: "Gadit <notify@gadit.app>",
      to: notifyTo,
      subject,
      html,
    });

    if (result.error) {
      console.error("[notify-signup] Resend error:", result.error);
      return NextResponse.json(
        { sent: false, reason: `resend_error: ${result.error.message}` },
        { status: 500 },
      );
    }

    // Atomically mark notified so duplicate client calls / retries don't
    // double-send. Use set+merge in case the user doc didn't exist yet.
    await userRef.set(
      {
        notifiedSignup: true,
        notifiedSignupAt: FieldValue.serverTimestamp(),
        email: email ?? data.email ?? null,
      },
      { merge: true },
    );

    // Welcome (day 0) email to the user themselves. The rest of the
    // drip (days 2/5/9/14) is sent by /api/cron/email-drip. We send
    // the welcome here rather than waiting for the cron because new
    // users expect a confirmation in their inbox within seconds, not
    // up to 24 hours.
    //
    // Language gate: today only Hebrew is shipped. Use country=IL as
    // the proxy for "Hebrew speaker" since the auth flow doesn't
    // expose UI language. English drip is the next file to land.
    const dripLang: "he" | "en" =
      country?.toUpperCase() === "IL" || (data.uiLang as string | undefined) === "he"
        ? "he"
        : "en";

    // Pick the right welcome by user's drip language and fire it now
    // rather than waiting for the daily cron — first-impression cost
    // of a 24-hour delay is too high.
    const welcomeKey = dripLang === "he" ? "welcome-he" : "welcome-en";
    const alreadySent = (data.dripSent as Record<string, unknown> | undefined)?.[welcomeKey];

    if (email && !alreadySent) {
      try {
        const { HE_DRIP, EN_DRIP, buildUnsubUrl } = await import("@/lib/email-drip/registry");
        const { sendDripEmail } = await import("@/lib/email-drip/send");
        const drip = dripLang === "he" ? HE_DRIP : EN_DRIP;
        const welcome = drip.find((m) => m.key === welcomeKey);
        if (welcome) {
          const built = welcome.build({
            displayName:
              (typeof authUser.displayName === "string" && authUser.displayName.trim()) ||
              undefined,
            unsubscribeUrl: buildUnsubUrl(uid),
          });
          const sent = await sendDripEmail({
            to: email,
            subject: built.subject,
            html: built.html,
          });
          if (sent.ok) {
            await userRef.set(
              {
                dripLang,
                dripSent: {
                  [welcomeKey]: {
                    sentAt: FieldValue.serverTimestamp(),
                    messageId: sent.id ?? null,
                  },
                },
              },
              { merge: true },
            );
          } else {
            console.warn("[notify-signup] welcome send failed:", sent.reason);
          }
        }
      } catch (err) {
        console.warn("[notify-signup] welcome send threw:", err);
      }
    } else {
      // No email or already sent — still record the chosen language
      // so the cron picks the right drip from day 2 onwards.
      await userRef.set({ dripLang }, { merge: true });
    }

    return NextResponse.json({ sent: true });
  } catch (e) {
    console.error("[notify-signup] failed:", e);
    return NextResponse.json(
      { sent: false, reason: `internal: ${String(e)}` },
      { status: 500 },
    );
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
