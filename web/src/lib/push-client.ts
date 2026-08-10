"use client";

/**
 * Client-side Web Push enrolment for the family owner. Requests
 * notification permission, subscribes through the already-registered
 * service worker (/sw.js), and hands the subscription to the server.
 * Needs NEXT_PUBLIC_VAPID_PUBLIC_KEY at build time.
 */

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export type EnableResult =
  | { ok: true }
  | { ok: false; reason: "unsupported" | "no_vapid" | "denied" | "server" | "error" };

export async function enableOwnerPush(idToken: string): Promise<EnableResult> {
  try {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window)
    ) {
      return { ok: false, reason: "unsupported" };
    }
    const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapid) return { ok: false, reason: "no_vapid" };

    const perm = await Notification.requestPermission();
    if (perm !== "granted") return { ok: false, reason: "denied" };

    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid) as BufferSource,
      });
    }

    const res = await fetch("/api/family/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ subscription: sub.toJSON() }),
    });
    return res.ok ? { ok: true } : { ok: false, reason: "server" };
  } catch {
    return { ok: false, reason: "error" };
  }
}

export async function disableOwnerPush(idToken: string): Promise<void> {
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    const endpoint = sub?.endpoint;
    if (sub) await sub.unsubscribe().catch(() => {});
    await fetch("/api/family/push/subscribe", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ endpoint }),
    }).catch(() => {});
  } catch {
    /* best effort */
  }
}
