import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import {
  getAdminAuth,
  getAdminDb,
  verifyUserAndGetPlan,
} from "@/lib/firebase-admin";
import { logDeletion } from "@/lib/deletion-log";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/** Alert Gadi that an account was self-deleted, with the exit survey. Non-blocking. */
async function notifyAccountDeleted(email: string | null, plan: string | null, canceledSubs: number, reason: string | null, comment: string | null) {
  try {
    const resendKey = process.env.RESEND_API_KEY;
    const notifyTo = process.env.NOTIFY_EMAIL;
    if (!resendKey || !notifyTo) return;
    const when = new Date().toLocaleString("en-IL", {
      timeZone: "Asia/Jerusalem",
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
    const safeEmail = (email ?? "(none)").replace(/</g, "&lt;");
    const esc = (s: string) => s.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const surveyRows =
      (reason ? `<tr><td style="padding:8px 0;color:#6B7280;">Reason</td><td style="padding:8px 0;font-weight:600;">${esc(reason)}</td></tr>` : "") +
      (comment ? `<tr><td style="padding:8px 0;color:#6B7280;vertical-align:top;">Their note</td><td style="padding:8px 0;font-style:italic;">“${esc(comment)}”</td></tr>` : "");
    const html = `<!DOCTYPE html><html><body style="margin:0;padding:24px;font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#F9FAFB;color:#111827;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #E5E7EB;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#DC2626,#991B1B);padding:24px;color:#fff;">
      <div style="font-size:13px;font-weight:600;letter-spacing:1px;opacity:.85;">GADIT</div>
      <div style="font-size:22px;font-weight:700;margin-top:4px;">Account deleted 🗑️</div>
    </div>
    <div style="padding:24px;">
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:8px 0;color:#6B7280;width:130px;">Email</td><td style="padding:8px 0;font-weight:600;">${safeEmail}</td></tr>
        <tr><td style="padding:8px 0;color:#6B7280;">Was on plan</td><td style="padding:8px 0;">${plan ?? "basic"}</td></tr>
        <tr><td style="padding:8px 0;color:#6B7280;">Subs canceled</td><td style="padding:8px 0;">${canceledSubs}</td></tr>
        ${surveyRows}
        <tr><td style="padding:8px 0;color:#6B7280;">Deleted by</td><td style="padding:8px 0;">the user (self-service)</td></tr>
        <tr><td style="padding:8px 0;color:#6B7280;">When</td><td style="padding:8px 0;">${when} (Israel time)</td></tr>
      </table>
      <div style="margin-top:24px;padding-top:24px;border-top:1px solid #F3F4F6;text-align:center;">
        <a href="https://www.gadit.app/admin/deletions" style="display:inline-block;background:#DC2626;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">View deletion log</a>
      </div>
    </div>
  </div>
</body></html>`;
    const resend = new Resend(resendKey);
    const res = await resend.emails.send({
      from: "Gadit <notify@gadit.app>",
      to: notifyTo,
      subject: `🗑️ Account deleted: ${email ?? "(no email)"}`,
      html,
    });
    if (res.error) console.error("[account/delete] notify resend error:", res.error);
  } catch (e) {
    console.warn("[account/delete] notifyAccountDeleted failed:", e);
  }
}

/**
 * /api/account/delete — permanently remove the requesting user.
 *
 * Beta security review caught that the AccountV2 "Delete account"
 * button was a no-op (the comment in code literally said
 * "endpoint not implemented yet"). For a B2C app shipping with
 * paid subscriptions and personal data (notebook entries, search
 * history), this is a GDPR / consumer-trust hole — and an
 * embarrassing one when a tester finds it on day one.
 *
 * Order matters here:
 *   1. Cancel any live Stripe subscription (so we don't keep
 *      charging a card after the user is gone).
 *   2. Delete Firestore documents we own:
 *        - users/{uid}                   (plan, customer ID, etc.)
 *        - notebook/{uid}/entries/*      (saved words)
 *        - dailyUsage/{uid}_*            (quota counters)
 *   3. Delete the Firebase Auth user (auth record).
 *
 * If any step fails partway, we return 500 and ask the user to retry
 * or email support — Stripe customer cancellation is idempotent so
 * a retry is safe; Firestore deletes likewise. The auth deletion is
 * last specifically because once it's gone, the client can no longer
 * present a token to retry the earlier steps.
 *
 * Note: /api/webhook still runs on Stripe events for this user
 * post-deletion (cancellation event arrives async). It just won't
 * find the user doc anymore, which is fine — the webhook is
 * idempotent.
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const idToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;
    const userInfo = await verifyUserAndGetPlan(idToken);
    if (!userInfo) {
      return NextResponse.json({ error: "login_required" }, { status: 401 });
    }
    const { userId } = userInfo;
    const db = getAdminDb();

    // Capture audit fields BEFORE we delete the user doc, so the deletion
    // log has the plan/email even after the account is gone.
    let auditEmail: string | null = null;
    let auditPlan: string | null = null;
    let auditStatus: string | null = null;
    let auditFamily = false;
    let auditSchool = false;
    let canceledCount = 0;

    // Read the account's real email up-front for the typed-confirmation gate.
    const preDoc = await db.collection("users").doc(userId).get();
    const realEmail =
      ((preDoc.data()?.email as string | undefined) ?? null) ||
      (await getAdminAuth().getUser(userId).then((u) => u.email ?? null).catch(() => null));

    // Typed-confirmation gate (Gadi 2026-08-13): a confused user deleted
    // her own account TWICE by clicking through a one-tap confirm dialog,
    // losing her Family trial. Deleting now REQUIRES the client to echo the
    // account's exact email, so an accidental click can never nuke an
    // account. Enforced server-side, not just in the UI.
    let confirmEmail = "";
    let reason: string | null = null;
    let comment: string | null = null;
    try {
      const body = (await req.json()) as { confirmEmail?: string; reason?: string; comment?: string };
      confirmEmail = (body.confirmEmail ?? "").trim().toLowerCase();
      reason = (body.reason ?? "").trim().slice(0, 120) || null;
      comment = (body.comment ?? "").trim().slice(0, 1000) || null;
    } catch { /* no body */ }
    if (realEmail && confirmEmail !== realEmail.trim().toLowerCase()) {
      return NextResponse.json(
        { error: "confirm_email_mismatch", message: "Type your account email exactly to confirm deletion." },
        { status: 400 },
      );
    }

    // 1. Cancel Stripe subscription if any.
    try {
      const userDoc = await db.collection("users").doc(userId).get();
      const ud = userDoc.data() ?? {};
      auditEmail = (ud.email as string | undefined) ?? null;
      auditPlan = (ud.plan as string | undefined) ?? null;
      auditStatus = (ud.subscriptionStatus as string | undefined) ?? null;
      auditFamily = !!ud.familyId;
      auditSchool = !!ud.schoolId;
      if (!auditEmail) {
        try { auditEmail = (await getAdminAuth().getUser(userId)).email ?? null; } catch { /* ignore */ }
      }
      const customerId = ud.stripeCustomerId as string | undefined;
      if (customerId) {
        // List active subs and cancel each. Most users have at most
        // one, but list-then-loop handles edge cases (e.g. someone
        // who briefly had two from a glitched checkout).
        const subs = await stripe.subscriptions.list({
          customer: customerId,
          status: "all",
          limit: 10,
        });
        for (const sub of subs.data) {
          if (
            sub.status !== "canceled" &&
            sub.status !== "incomplete_expired"
          ) {
            try {
              await stripe.subscriptions.cancel(sub.id);
              canceledCount++;
            } catch (err) {
              console.error(`Stripe cancel failed for ${sub.id}:`, err);
            }
          }
        }
      }
    } catch (err) {
      console.error("Stripe cleanup failed (non-fatal):", err);
    }

    // 2. Delete Firestore documents owned by this user.
    // Sub-collections are not deleted automatically by deleting the
    // parent doc, so we walk them explicitly.
    try {
      const notebookRef = db
        .collection("notebook")
        .doc(userId)
        .collection("entries");
      const entries = await notebookRef.get();
      const batch = db.batch();
      entries.forEach((d) => batch.delete(d.ref));
      await batch.commit();

      // Daily usage docs use composite IDs (userId_YYYY-MM-DD); we
      // query by userId field so the future-dated ones are caught too.
      const usage = await db
        .collection("dailyUsage")
        .where("userId", "==", userId)
        .get();
      const usageBatch = db.batch();
      usage.forEach((d) => usageBatch.delete(d.ref));
      await usageBatch.commit();

      // Top-level user doc.
      await db.collection("users").doc(userId).delete();
    } catch (err) {
      console.error("Firestore cleanup failed:", err);
      return NextResponse.json(
        {
          error: "partial_failure",
          message:
            "Account data partially removed. Please email support@gadit.app to complete deletion.",
        },
        { status: 500 }
      );
    }

    // 3. Delete the Firebase Auth user. Once this lands, no future
    // tokens can be minted for this UID, so this MUST be last.
    try {
      await getAdminAuth().deleteUser(userId);
    } catch (err) {
      console.error("Auth deletion failed:", err);
      return NextResponse.json(
        {
          error: "partial_failure",
          message:
            "Account data removed but the auth record persists. Please email support@gadit.app.",
        },
        { status: 500 }
      );
    }

    // Audit: record the self-deletion (non-blocking).
    await logDeletion({
      uid: userId,
      email: auditEmail,
      source: "self",
      plan: auditPlan,
      subscriptionStatus: auditStatus,
      isFamily: auditFamily,
      isSchool: auditSchool,
      canceledSubs: canceledCount,
      reason,
      comment,
    });

    // Real-time alert to Gadi so an account deletion is never a surprise
    // again (2026-08-13), now with the exit-survey reason/comment.
    void notifyAccountDeleted(auditEmail, auditPlan, canceledCount, reason, comment);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Account deletion error:", err);
    return NextResponse.json(
      { error: "internal_error", details: String(err) },
      { status: 500 }
    );
  }
}
