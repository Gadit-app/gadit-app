import webpush from "web-push";
import { getAdminDb } from "@/lib/firebase-admin";

/**
 * Web Push sender (VAPID). Subscriptions are stored per family owner at
 *   families/{ownerUid}/pushSubs/{id} = { subscription, endpoint, createdAt }
 * so a parent who enabled "notify me when my child looks up a word" gets
 * a real phone banner. Requires VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY /
 * VAPID_SUBJECT in the environment; without them the sender is a no-op
 * (the email fallback in family-notify still fires).
 */

let configured: boolean | null = null;
function ensureConfigured(): boolean {
  if (configured !== null) return configured;
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:notify@gadit.app";
  if (!pub || !priv) {
    configured = false;
    return false;
  }
  webpush.setVapidDetails(subject, pub, priv);
  configured = true;
  return true;
}

export type PushPayload = { title: string; body: string; url?: string; tag?: string };

/**
 * Send a push to every subscription a family owner has registered.
 * Dead subscriptions (404/410 Gone) are pruned so the collection stays
 * clean. Returns the number of successful deliveries.
 */
export async function sendPushToOwner(ownerUid: string, payload: PushPayload): Promise<number> {
  if (!ensureConfigured()) return 0;
  const db = getAdminDb();
  const subsSnap = await db.collection("families").doc(ownerUid).collection("pushSubs").get();
  let sent = 0;
  await Promise.all(
    subsSnap.docs.map(async (d) => {
      const sub = d.data()?.subscription;
      if (!sub) return;
      try {
        await webpush.sendNotification(sub, JSON.stringify(payload));
        sent++;
      } catch (e) {
        const code = (e as { statusCode?: number })?.statusCode;
        if (code === 404 || code === 410) {
          await d.ref.delete().catch(() => {});
        }
      }
    }),
  );
  return sent;
}
