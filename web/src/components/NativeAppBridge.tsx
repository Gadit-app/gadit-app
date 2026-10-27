"use client";

import { useEffect, useRef } from "react";
import { beforeAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { isExpoPushToken, isIosApp, postToNative } from "@/lib/native-app";
import { claimPurchases, type NativePurchase } from "@/lib/native-iap";

type TokenWindow = Window & { __gaditPushToken?: string };

/**
 * Web side of the Gadit iOS app's native push (ios-app/). Renders nothing and
 * does nothing outside the iOS app.
 *
 *   1. When someone is signed in, tell the shell ({type:"auth", state:"signed-in"}).
 *      The shell then asks for push permission (in context, after sign-in) and
 *      gets its Expo push token. Signed out: {state:"signed-out"}.
 *   2. The shell hands the token back by setting window.__gaditPushToken and
 *      dispatching a "gadit-push-token" event.
 *   3. We store it on users/{uid}.expoPushTokens through /api/push/native
 *      (the browser cannot write users/{uid}, Firestore rules). lib/push.ts
 *      sends every parent alert to those tokens as well as to web push.
 *   4. Right before the session changes (sign out, another person signs in on
 *      the same phone) the token is removed from the outgoing user, so a
 *      parent's alerts never land on a child who later signs in on that phone.
 */
export function NativeAppBridge() {
  const { user, loading } = useAuth();
  const registered = useRef<{ uid: string; token: string } | null>(null);

  // 1. Signal auth state to the native shell.
  useEffect(() => {
    if (!isIosApp() || loading) return;
    if (user) postToNative({ type: "auth", state: "signed-in", uid: user.uid });
    else postToNative({ type: "auth", state: "signed-out" });
  }, [user, loading]);

  // 2+3. Receive the token and store it for the signed-in user.
  useEffect(() => {
    if (!isIosApp() || !user) return;
    const u = user;
    const save = async (token: string | undefined) => {
      if (!isExpoPushToken(token)) return;
      const t = token as string;
      if (registered.current?.uid === u.uid && registered.current.token === t) return;
      try {
        const idToken = await u.getIdToken();
        const res = await fetch("/api/push/native", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
          body: JSON.stringify({ token: t }),
        });
        if (res.ok) registered.current = { uid: u.uid, token: t };
      } catch (e) {
        console.warn("native push token save failed:", e);
      }
    };
    void save((window as TokenWindow).__gaditPushToken);
    const onToken = (e: Event) => void save((e as CustomEvent<{ token?: string }>).detail?.token);
    window.addEventListener("gadit-push-token", onToken);
    return () => window.removeEventListener("gadit-push-token", onToken);
  }, [user]);

  // 5. App Store purchases that finish outside the subscribe screen (a
  // purchase interrupted earlier, Ask to Buy approved, a renewal replayed at
  // launch) arrive as {id:"update"}: the server checks each one, then the
  // shell finishes it (lib/native-iap.ts).
  useEffect(() => {
    if (!isIosApp() || !user) return;
    const u = user;
    const onIap = (e: Event) => {
      const d = (e as CustomEvent<{ id?: string; purchases?: NativePurchase[] }>).detail;
      if (d?.id !== "update" || !Array.isArray(d.purchases) || !d.purchases.length) return;
      void u.getIdToken().then((t) => claimPurchases(d.purchases!, t)).catch(() => {});
    };
    window.addEventListener("gadit-native-iap", onIap);
    return () => window.removeEventListener("gadit-native-iap", onIap);
  }, [user]);

  // 4. Unlink the token from the outgoing user while they are still signed
  // in (their ID token proves who they are). Never blocks the auth change:
  // errors are swallowed and the wait is capped.
  useEffect(() => {
    if (!isIosApp()) return;
    return beforeAuthStateChanged(auth, async (next) => {
      const reg = registered.current;
      if (!reg || next?.uid === reg.uid) return;
      registered.current = null;
      const current = auth.currentUser;
      if (!current || current.uid !== reg.uid) return;
      await Promise.race([
        (async () => {
          try {
            const idToken = await current.getIdToken();
            await fetch("/api/push/native", {
              method: "DELETE",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
              body: JSON.stringify({ token: reg.token }),
              keepalive: true,
            });
          } catch {
            /* best effort */
          }
        })(),
        new Promise((r) => setTimeout(r, 2000)),
      ]);
    });
  }, []);

  return null;
}
