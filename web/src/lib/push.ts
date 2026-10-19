import webpush from "web-push";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { isExpoPushToken } from "@/lib/native-app";

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
  // The iOS app's native push (Expo) runs alongside web push and never
  // depends on VAPID being configured. Errors never reach the caller.
  const [web, native] = await Promise.all([
    sendWebPushToOwner(ownerUid, payload).catch((e) => {
      console.error("[push] web push failed:", e);
      return 0;
    }),
    sendExpoPushToUser(ownerUid, payload).catch((e) => {
      console.error("[push] expo push failed:", e);
      return 0;
    }),
  ]);
  return web + native;
}

async function sendWebPushToOwner(ownerUid: string, payload: PushPayload): Promise<number> {
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

/**
 * Native push to the Gadit iOS app (ios-app/). Its Expo push tokens are stored
 * on users/{uid}.expoPushTokens by /api/push/native. Sent through Expo's push
 * service; tokens Expo reports as DeviceNotRegistered (app deleted,
 * notifications turned off for good) are removed. Returns the number of
 * tickets Expo accepted.
 */
const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

export async function sendExpoPushToUser(uid: string, payload: PushPayload): Promise<number> {
  const db = getAdminDb();
  const ref = db.collection("users").doc(uid);
  const snap = await ref.get();
  const raw = snap.data()?.expoPushTokens;
  const tokens = (Array.isArray(raw) ? raw : []).filter(
    (t): t is string => typeof t === "string" && isExpoPushToken(t),
  );
  if (tokens.length === 0) return 0;

  // A site path, so the app opens it inside its WebView.
  const url = payload.url && payload.url.startsWith("/") ? payload.url : "/";
  const messages = tokens.map((to) => ({
    to,
    title: payload.title,
    body: payload.body,
    sound: "default",
    data: { url },
    ...(payload.tag ? { threadId: payload.tag } : {}),
  }));

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (process.env.EXPO_ACCESS_TOKEN) headers.Authorization = `Bearer ${process.env.EXPO_ACCESS_TOKEN}`;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  type ExpoTicket = { status?: string; details?: { error?: string } };
  let tickets: ExpoTicket[] = [];
  try {
    const res = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(messages),
      signal: ctrl.signal,
    });
    const json = (await res.json().catch(() => null)) as { data?: unknown } | null;
    if (!res.ok) {
      console.error("[push] expo HTTP", res.status, JSON.stringify(json).slice(0, 300));
      return 0;
    }
    if (Array.isArray(json?.data)) tickets = json.data as ExpoTicket[];
  } finally {
    clearTimeout(timer);
  }

  let sent = 0;
  const dead: string[] = [];
  tickets.forEach((t, i) => {
    if (t?.status === "ok") sent++;
    else if (t?.details?.error === "DeviceNotRegistered" && tokens[i]) dead.push(tokens[i]);
  });
  if (dead.length) {
    await ref.update({ expoPushTokens: FieldValue.arrayRemove(...dead) }).catch(() => {});
  }
  return sent;
}
