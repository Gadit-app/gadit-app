/**
 * Apple In-App Purchase for the Gadit iOS app (Gadi 2026-10-27, App Review
 * 3.1.1 / 3.1.3(c)): Individual and Family are sold inside the iOS app through
 * the App Store, next to the website's Stripe checkout. Both end in the same
 * users/{uid} state the Stripe webhook writes, so every screen, the family
 * sync and the paid-access audit treat an Apple subscriber like any other.
 *
 * Flow: the page asks /api/apple/token for this account's appAccountToken,
 * the app buys with it (StoreKit 2), and hands the signed transaction to
 * /api/apple/verify. Renewals, failed payments, cancels and refunds arrive as
 * App Store Server Notifications V2 at /api/apple/notifications. Every signed
 * payload is verified against Apple's root certificate before it is used.
 *
 * Records: appleSubs/{originalTransactionId} = { uid, productId, status, ... }
 * maps a subscription to its account; users/{uid}.appleAccountToken is the
 * account's token, and appleAccountTokens/{token} = { uid } the way back.
 */
import crypto from "node:crypto";
import {
  SignedDataVerifier,
  Environment,
  type JWSTransactionDecodedPayload,
  type JWSRenewalInfoDecodedPayload,
} from "@apple/app-store-server-library";
import { getAdminDb } from "@/lib/firebase-admin";
import { syncFamilyMembersPlan } from "@/lib/family-plan-sync";
import { bootstrapFamily, stampFamilyActivated, sendFamilyWelcome } from "@/lib/family-bootstrap";
import { autoEnrollPartner } from "@/lib/partner-auto";
import { sendMail } from "@/lib/mail";
import { APPLE_ROOT_CA_G3_B64 } from "@/lib/apple-root-cert";
import { APPLE_INDIVIDUAL_PRODUCT } from "@/lib/individual-prices";

export const APPLE_BUNDLE_ID = "com.gadit.app";
/** App Store Connect app id of "Gadit Vocabulary" (needed to verify Production). */
export const APPLE_APP_ID = 6824663361;
export const APPLE_FAMILY_PRODUCT = "com.gadit.app.family.monthly";
export const APPLE_PRODUCTS: Record<string, "individual" | "family"> = {
  [APPLE_INDIVIDUAL_PRODUCT]: "individual",
  [APPLE_FAMILY_PRODUCT]: "family",
};
/** Apple keeps 15% (Small Business Program). */
export const APPLE_NET_SHARE = 0.85;

let verifiers: { prod: SignedDataVerifier; sandbox: SignedDataVerifier } | null = null;
function getVerifiers() {
  if (!verifiers) {
    const roots = [Buffer.from(APPLE_ROOT_CA_G3_B64, "base64")];
    verifiers = {
      prod: new SignedDataVerifier(roots, true, Environment.PRODUCTION, APPLE_BUNDLE_ID, APPLE_APP_ID),
      // App Review and TestFlight buy in the Sandbox.
      sandbox: new SignedDataVerifier(roots, true, Environment.SANDBOX, APPLE_BUNDLE_ID),
    };
  }
  return verifiers;
}

/** Verify with Production first, then Sandbox (the environment is inside the
 *  payload, and a wrong one fails verification). */
async function verifyEither<T>(fn: (v: SignedDataVerifier) => Promise<T>): Promise<T> {
  const v = getVerifiers();
  try {
    return await fn(v.prod);
  } catch (e) {
    try {
      return await fn(v.sandbox);
    } catch {
      throw e;
    }
  }
}

export function verifyTransaction(jws: string): Promise<JWSTransactionDecodedPayload> {
  return verifyEither((v) => v.verifyAndDecodeTransaction(jws));
}
export function verifyRenewal(jws: string): Promise<JWSRenewalInfoDecodedPayload> {
  return verifyEither((v) => v.verifyAndDecodeRenewalInfo(jws));
}
export function verifyNotification(signedPayload: string) {
  return verifyEither((v) => v.verifyAndDecodeNotification(signedPayload));
}

/** The account's appAccountToken (a UUID), made once and remembered both ways. */
export async function accountTokenFor(uid: string): Promise<string> {
  const db = getAdminDb();
  const ref = db.collection("users").doc(uid);
  const have = (await ref.get()).data()?.appleAccountToken;
  if (typeof have === "string" && have) return have;
  const token = crypto.randomUUID();
  await db.collection("appleAccountTokens").doc(token).set({ uid, at: new Date().toISOString() });
  await ref.set({ appleAccountToken: token }, { merge: true });
  return token;
}

async function uidForToken(token: string | undefined | null): Promise<string | null> {
  if (!token) return null;
  const snap = await getAdminDb().collection("appleAccountTokens").doc(token.toLowerCase()).get();
  const uid = snap.data()?.uid;
  return typeof uid === "string" ? uid : null;
}

async function uidForOriginal(originalTransactionId: string): Promise<string | null> {
  const snap = await getAdminDb().collection("appleSubs").doc(originalTransactionId).get();
  const uid = snap.data()?.uid;
  return typeof uid === "string" ? uid : null;
}

export type AppleState = "active" | "trialing" | "past_due" | "expired";

/**
 * Write the subscription state onto the account, exactly the fields the
 * Stripe webhook writes, plus billingProvider "apple". Paid states give
 * plan "deep" (Individual and Family alike, as with Stripe); expired goes
 * back to Basic. Family owners get their family on the first activation.
 */
export async function applyAppleState(
  uid: string,
  tx: JWSTransactionDecodedPayload,
  state: AppleState,
  opts: { graceUntil?: number | null; autoRenew?: boolean | null; reason?: string } = {},
): Promise<void> {
  const db = getAdminDb();
  const productId = tx.productId ?? "";
  const kind = APPLE_PRODUCTS[productId];
  const original = tx.originalTransactionId ?? tx.transactionId ?? "";
  if (!kind || !original) return;

  const userRef = db.collection("users").doc(uid);
  const user = (await userRef.get()).data() ?? {};
  // Another subscription (e.g. Stripe) owns this account: Apple must not
  // overwrite it, and a later Apple expiry must not end it.
  const otherLive = user.billingProvider !== "apple" && ["active", "trialing", "past_due"].includes(String(user.subscriptionStatus ?? "")) && !!user.subscriptionId;
  const now = new Date().toISOString();

  await db.collection("appleSubs").doc(original).set({
    uid,
    productId,
    kind,
    status: state,
    environment: tx.environment ?? null,
    expiresAt: tx.expiresDate ? new Date(tx.expiresDate).toISOString() : null,
    // price is in milli-units of the currency (3990 = 3.99).
    price: typeof tx.price === "number" ? tx.price / 1000 : null,
    currency: tx.currency ?? null,
    storefront: tx.storefront ?? null,
    trial: tx.offerType === 1 && (tx.price ?? 0) === 0,
    autoRenew: opts.autoRenew ?? null,
    lastTransactionId: tx.transactionId ?? null,
    updatedAt: now,
    ...(opts.reason ? { lastEvent: opts.reason } : {}),
  }, { merge: true });

  if (otherLive && user.subscriptionId !== `apple:${original}`) {
    console.warn(`[apple] ${uid} already has a live ${user.billingProvider ?? "stripe"} subscription; Apple ${original} recorded only`);
    return;
  }

  const paid = state !== "expired";
  const fields: Record<string, unknown> = {
    plan: paid ? "deep" : "basic",
    billingProvider: "apple",
    subscriptionId: `apple:${original}`,
    subscriptionStatus: paid ? state : "canceled",
    priceId: productId,
    trialEnd: state === "trialing" && tx.expiresDate ? Math.floor(tx.expiresDate / 1000) : null,
    cancelAtPeriodEnd: opts.autoRenew === false,
    graceUntil: state === "past_due" && opts.graceUntil ? opts.graceUntil : null,
    appleExpiresAt: tx.expiresDate ? new Date(tx.expiresDate).toISOString() : null,
    updatedAt: now,
  };
  if (paid && kind === "family") fields.familyId = uid;
  await userRef.set(fields, { merge: true });
  await syncFamilyMembersPlan(uid, paid ? "deep" : "basic");

  // The family is made on the first Family state, also after an upgrade
  // from Individual (same subscription, new product).
  if (paid && kind === "family" && user.familyId !== uid) {
    await bootstrapFamily(uid, "monthly");
    await stampFamilyActivated(uid);
    await sendFamilyWelcome(uid, (user.email as string | undefined) ?? null);
  }
  if (paid && !user.notifiedPaid) {
    void autoEnrollPartner(uid, (user.email as string | undefined) ?? null).catch(() => {});
    await notifyApple(uid, user.email as string | undefined, kind, state, tx);
  }
}

/** Internal alert to Gadi, once per account (same flag as Stripe). */
async function notifyApple(uid: string, email: string | undefined, kind: string, state: AppleState, tx: JWSTransactionDecodedPayload) {
  try {
    const to = process.env.NOTIFY_EMAIL;
    if (!process.env.RESEND_API_KEY || !to) return;
    const tier = kind === "family" ? "Family" : "Individual";
    const price = typeof tx.price === "number" && tx.currency ? `${(tx.price / 1000).toFixed(2)} ${tx.currency}` : "";
    const sandbox = tx.environment === "Sandbox" ? " [Sandbox test]" : "";
    const what = state === "trialing" ? `New ${tier} trial via Apple 🍎` : `New ${tier} subscription via Apple 🍎`;
    const esc = (s: string) => s.replace(/[<&]/g, (c) => (c === "<" ? "&lt;" : "&amp;"));
    const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;margin:0 auto;border:1px solid #E5E7EB;border-radius:12px;overflow:hidden">
<div style="background:linear-gradient(135deg,#0EA5A5,#0E7490);padding:22px;color:#fff;font-size:20px;font-weight:700">${what}${sandbox}</div>
<table style="width:100%;font-size:14px;padding:18px;border-collapse:collapse">
<tr><td style="color:#6B7280;padding:6px 18px;width:110px">Plan</td><td style="font-weight:600">${tier} (monthly)</td></tr>
${price ? `<tr><td style="color:#6B7280;padding:6px 18px">Price</td><td>${esc(price)} (we keep 85%)</td></tr>` : ""}
<tr><td style="color:#6B7280;padding:6px 18px">Country</td><td>${esc(tx.storefront ?? "")}</td></tr>
<tr><td style="color:#6B7280;padding:6px 18px">Email</td><td>${esc(email ?? uid)}</td></tr>
</table>
<div style="text-align:center;padding:0 0 20px"><a href="https://www.gadit.app/admin/users" style="background:#0EA5A5;color:#fff;padding:10px 22px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Open admin dashboard</a></div></div>`;
    const res = await sendMail({ from: "Gadit <notify@gadit.app>", to, subject: `🍎 ${what}${sandbox}: ${email ?? uid}`, html });
    if (!res.error) await getAdminDb().collection("users").doc(uid).set({ notifiedPaid: true, notifiedPaidAt: new Date().toISOString() }, { merge: true });
  } catch (e) {
    console.warn("[apple] notify failed:", e);
  }
}

/** State of a just-verified transaction (from the app, before any notification). */
export function stateOfTransaction(tx: JWSTransactionDecodedPayload): AppleState {
  if (tx.revocationDate) return "expired";
  if (tx.expiresDate && tx.expiresDate < Date.now()) return "expired";
  return tx.offerType === 1 && (tx.price ?? 0) === 0 ? "trialing" : "active";
}

/**
 * A purchase the app just made (or restored). The transaction must carry
 * this account's appAccountToken, or belong to a subscription already on
 * this account, so one Apple ID's purchase never unlocks a stranger.
 */
export async function claimTransaction(uid: string, jws: string): Promise<{ ok: true; state: AppleState; kind: string } | { ok: false; error: string }> {
  let tx: JWSTransactionDecodedPayload;
  try {
    tx = await verifyTransaction(jws);
  } catch {
    return { ok: false, error: "invalid_transaction" };
  }
  const kind = tx.productId ? APPLE_PRODUCTS[tx.productId] : undefined;
  if (!kind || !tx.originalTransactionId) return { ok: false, error: "unknown_product" };
  const owner = (await uidForOriginal(tx.originalTransactionId)) ?? (await uidForToken(tx.appAccountToken));
  if (owner && owner !== uid) return { ok: false, error: "other_account" };
  if (!owner) {
    // No token on the transaction: only accept it as a first claim.
    if (tx.appAccountToken) return { ok: false, error: "other_account" };
  }
  const state = stateOfTransaction(tx);
  await applyAppleState(uid, tx, state, { reason: "app" });
  return { ok: true, state, kind };
}

/** A verified App Store Server Notification V2 → the account's new state. */
export async function handleNotification(signedPayload: string): Promise<string> {
  const n = await verifyNotification(signedPayload);
  const type = String(n.notificationType ?? "");
  const subtype = String(n.subtype ?? "");
  if (type === "TEST") return "test";
  const signedTx = n.data?.signedTransactionInfo;
  if (!signedTx) return `ignored:${type}`;
  const tx = await verifyTransaction(signedTx);
  const renewal = n.data?.signedRenewalInfo ? await verifyRenewal(n.data.signedRenewalInfo).catch(() => null) : null;
  const original = tx.originalTransactionId ?? "";
  const uid = (await uidForOriginal(original)) ?? (await uidForToken(tx.appAccountToken));
  if (!uid) return `no_account:${type}`;
  const autoRenew = renewal ? renewal.autoRenewStatus === 1 : null;
  const reason = subtype ? `${type}:${subtype}` : type;

  switch (type) {
    case "SUBSCRIBED":
    case "DID_RENEW":
    case "OFFER_REDEEMED":
    case "REFUND_REVERSED":
    case "RENEWAL_EXTENDED":
      await applyAppleState(uid, tx, stateOfTransaction(tx), { autoRenew, reason });
      break;
    case "DID_CHANGE_RENEWAL_STATUS":
    case "DID_CHANGE_RENEWAL_PREF":
      await applyAppleState(uid, tx, stateOfTransaction(tx), { autoRenew, reason });
      break;
    case "DID_FAIL_TO_RENEW": {
      // With Apple's billing grace period the user keeps access until it ends.
      const grace = renewal?.gracePeriodExpiresDate ?? null;
      if (subtype === "GRACE_PERIOD" && grace && grace > Date.now()) {
        await applyAppleState(uid, tx, "past_due", { graceUntil: grace, autoRenew, reason });
      } else {
        await applyAppleState(uid, tx, "expired", { autoRenew, reason });
      }
      break;
    }
    case "EXPIRED":
    case "GRACE_PERIOD_EXPIRED":
    case "REFUND":
    case "REVOKE":
      await applyAppleState(uid, tx, "expired", { autoRenew: false, reason });
      break;
    default:
      return `ignored:${type}`;
  }
  return reason;
}
