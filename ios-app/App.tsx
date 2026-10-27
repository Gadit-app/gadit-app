import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  WebView,
  type WebViewMessageEvent,
  type WebViewNavigation,
} from "react-native-webview";
import type { ShouldStartLoadRequest } from "react-native-webview/lib/WebViewTypes";

// react-native-webview 14 ships class typings that resolve to `props: never`
// under React 19.3 types + RN 0.88 (type-level only; runtime is unaffected).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const WebViewView = WebView as unknown as React.ComponentType<any>;
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
import Constants from "expo-constants";
import { NATIVE_AUTH_PROVIDERS, runNativeAuth, type NativeAuthProvider } from "./native-auth";
import {
  initConnection,
  fetchProducts,
  requestPurchase,
  finishTransaction,
  restorePurchases,
  getAvailablePurchases,
  purchaseUpdatedListener,
  purchaseErrorListener,
  deepLinkToSubscriptions,
  ErrorCode,
  type Purchase,
} from "expo-iap";

// The native shell for Gadit on iOS: a full-screen WebView over www.gadit.app,
// plus native sign-in (Apple + Google), native push and the native share sheet,
// so the app is a real product, not just a website (Apple review 4.2). Built and
// submitted with EAS, no Mac needed. Same pattern as the Yooniz iOS app.
//
// How the web app knows it runs here: the WebView appends "GaditApp-iOS/<version>"
// to its user agent and injects window.GaditNative before any page script. The
// web side (web/src/lib/native-app.ts) then runs in the same consumption-only
// mode as the Android Play app: no price, plan or checkout anywhere (Apple
// 3.1.1), and it tells us when someone is signed in so we can register for push.
//
// Sign-in: Google blocks OAuth inside embedded WebViews and Apple requires Sign
// in with Apple next to Google (4.8), so the web asks us to run the native sheet
// ({type:"auth:apple"|"auth:google", id}) and gets the tokens back as a
// "gadit-native-auth" event (native-auth.ts and web/src/lib/native-auth.ts).

const APP_ORIGIN = "https://www.gadit.app";
// ?src=play turns on the consumption-only mode from the very first request.
const START_URL = `${APP_ORIGIN}/?src=play`;
const BRAND = "#0EA5A5";
const VERSION = Constants.expoConfig?.version ?? "1.0.0";
const UA_SUFFIX = `${Platform.OS === "ios" ? "GaditApp-iOS" : "GaditApp-Android"}/${VERSION}`;

// Hosts that stay inside the WebView. Everything else (mailto:, other sites,
// the purchase host gadit.app) opens in the system (Mail / Safari). The Firebase
// auth host stays in-app so email-link sign-in keeps working.
const IN_APP_HOSTS = [
  "www.gadit.app",
  "gadit-app.firebaseapp.com",
];

const INJECT_BEFORE_LOAD = `
  window.GaditNative = { platform: ${JSON.stringify(Platform.OS)}, version: ${JSON.stringify(VERSION)}, auth: ${JSON.stringify(NATIVE_AUTH_PROVIDERS)}, iap: true };
  true;
`;

/** Only our own pages may ask for a sign-in sheet or receive its tokens. */
function isAppPage(url: string | undefined): boolean {
  const host = url ? hostOf(url) : null;
  return host === "www.gadit.app";
}

SplashScreen.preventAutoHideAsync().catch(() => {});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** Ask for push permission and get the native (APNs-backed) Expo push token. */
async function registerForPush(): Promise<string | null> {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let status = existing;
    if (existing !== "granted") {
      status = (await Notifications.requestPermissionsAsync()).status;
    }
    if (status !== "granted") return null;
    const raw = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    // Placeholder until `eas init` writes the real project id into app.json.
    const projectId = raw && !String(raw).startsWith("REPLACE") ? String(raw) : undefined;
    const token = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
    return token.data;
  } catch {
    return null;
  }
}

/** Turn a notification's data.url ("/family" or a www.gadit.app URL) into a safe
 * absolute www.gadit.app URL, or null. Never navigates the app to another site. */
function appUrlFrom(data: unknown): string | null {
  const url = (data as { url?: unknown } | null | undefined)?.url;
  if (typeof url !== "string" || !url) return null;
  if (url.startsWith("/") && !url.startsWith("//")) return `${APP_ORIGIN}${url}`;
  try {
    const u = new URL(url);
    return u.protocol === "https:" && u.host === "www.gadit.app" ? u.toString() : null;
  } catch {
    return null;
  }
}

// App Store purchases (Gadi 2026-10-27, App Review 3.1.1): the web page asks,
// StoreKit sells, and the page sends the signed transaction to our server
// (web/src/lib/native-iap.ts, web/src/lib/apple-iap.ts). Only our products.
const IAP_SKUS = ["com.gadit.app.individual.monthly", "com.gadit.app.family.monthly"];

type WebPurchase = { jws: string; productId: string; transactionId: string };
function toWeb(p: Purchase): WebPurchase | null {
  const jws = p.purchaseToken ?? "";
  if (!jws || !IAP_SKUS.includes(p.productId)) return null;
  return { jws, productId: p.productId, transactionId: p.id };
}

function hostOf(url: string): string | null {
  const m = /^https?:\/\/([^/?#:]+)/i.exec(url);
  return m ? m[1].toLowerCase() : null;
}

export default function App() {
  const webRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sourceUri, setSourceUri] = useState(START_URL);
  const pushToken = useRef<string | null>(null);
  const loaded = useRef(false);
  // StoreKit: the open purchase request, purchases waiting to be finished
  // (after the server accepted them), and ones that arrived before the page
  // was signed in.
  const buyId = useRef<string | null>(null);
  const unfinished = useRef(new Map<string, Purchase>());
  const queued = useRef<WebPurchase[]>([]);
  const signedIn = useRef(false);

  /** Hand the push token to the page (the native bridge in web/src). */
  const deliverToken = useCallback((token: string) => {
    const t = JSON.stringify(token);
    webRef.current?.injectJavaScript(`
      window.__gaditPushToken = ${t};
      window.dispatchEvent(new CustomEvent("gadit-push-token", { detail: { token: ${t} } }));
      true;
    `);
  }, []);

  /** Answer the page's purchase requests ("gadit-native-iap"). */
  const deliverIap = useCallback((payload: object) => {
    const body = JSON.stringify(payload);
    webRef.current?.injectJavaScript(`
      (function(){
        if (location.hostname !== "www.gadit.app") return;
        window.dispatchEvent(new CustomEvent("gadit-native-iap", { detail: ${body} }));
      })();
      true;
    `);
  }, []);

  /** Purchases StoreKit hands us: the answer to a buy, or a later update. */
  const onStorePurchase = useCallback((p: Purchase) => {
    const w = toWeb(p);
    if (!w) return;
    unfinished.current.set(w.transactionId, p);
    if (buyId.current) {
      const id = buyId.current;
      buyId.current = null;
      deliverIap({ id, ok: true, purchases: [w] });
    } else if (signedIn.current) {
      deliverIap({ id: "update", purchases: [w] });
    } else {
      queued.current.push(w);
    }
  }, [deliverIap]);

  useEffect(() => {
    if (Platform.OS !== "ios") return;
    let alive = true;
    const up = purchaseUpdatedListener((p) => { if (alive) onStorePurchase(p); });
    const err = purchaseErrorListener((e) => {
      if (!buyId.current) return;
      const id = buyId.current;
      buyId.current = null;
      deliverIap({ id, ok: false, error: e.code === ErrorCode.UserCancelled ? "cancelled" : "failed" });
    });
    initConnection().catch(() => {});
    return () => {
      alive = false;
      up.remove();
      err.remove();
    };
  }, [onStorePurchase, deliverIap]);

  /** Open a URL inside the app's WebView. */
  const openInApp = useCallback((url: string) => {
    if (!loaded.current) {
      setSourceUri(url);
      return;
    }
    webRef.current?.injectJavaScript(`window.location.assign(${JSON.stringify(url)}); true;`);
  }, []);

  /** Hand a native sign-in result to the page. The injected script checks the
   * page is still www.gadit.app before exposing the tokens to it. */
  const deliverAuth = useCallback((id: string, result: object) => {
    const payload = JSON.stringify({ id, ...result });
    webRef.current?.injectJavaScript(`
      (function(){
        var h = location.hostname;
        if (h !== "www.gadit.app") return;
        window.dispatchEvent(new CustomEvent("gadit-native-auth", { detail: ${payload} }));
      })();
      true;
    `);
  }, []);

  // Messages from the web app.
  //  - {type:"auth", state:"signed-in"}: ask for push permission in context and
  //    send the Expo token back to be stored for that user. The token is cached
  //    so later sign-ins reuse it without a new prompt.
  //  - {type:"auth:apple"|"auth:google", id}: run the native sign-in sheet and
  //    answer with a "gadit-native-auth" event carrying the same id.
  //  - {type:"share", url, text}: the native share sheet.
  const onMessage = useCallback(
    (e: WebViewMessageEvent) => {
      let msg: { type?: string; state?: string; id?: unknown; url?: unknown; text?: unknown; sku?: unknown; token?: unknown; transactionId?: unknown } | null = null;
      try {
        msg = JSON.parse(e.nativeEvent.data);
      } catch {
        return;
      }
      if (msg?.type === "auth:apple" || msg?.type === "auth:google") {
        if (!isAppPage(e.nativeEvent.url)) return;
        const id = typeof msg.id === "string" ? msg.id.slice(0, 64) : "";
        if (!id) return;
        const provider: NativeAuthProvider = msg.type === "auth:apple" ? "apple" : "google";
        runNativeAuth(provider).then((result) => deliverAuth(id, result));
        return;
      }
      if (msg?.type?.startsWith("iap:")) {
        if (!isAppPage(e.nativeEvent.url) || Platform.OS !== "ios") return;
        const id = typeof msg.id === "string" ? msg.id.slice(0, 64) : "";
        if (msg.type === "iap:products" && id) {
          fetchProducts({ skus: IAP_SKUS, type: "subs" })
            .then((list) => deliverIap({
              id, ok: true,
              products: (list ?? []).map((p) => {
                const q = p as { id: string; displayPrice: string; introductoryPricePaymentModeIOS?: string };
                return { id: q.id, displayPrice: q.displayPrice, trial: q.introductoryPricePaymentModeIOS === "free-trial" };
              }),
            }))
            .catch(() => deliverIap({ id, ok: false, error: "unavailable" }));
        } else if (msg.type === "iap:buy" && id) {
          const sku = typeof msg.sku === "string" && IAP_SKUS.includes(msg.sku) ? msg.sku : "";
          const token = typeof msg.token === "string" && /^[0-9a-f-]{36}$/i.test(msg.token) ? msg.token : "";
          if (!sku || !token) { deliverIap({ id, ok: false, error: "failed" }); return; }
          buyId.current = id;
          requestPurchase({ request: { apple: { sku, appAccountToken: token } }, type: "subs" }).catch(() => {
            if (buyId.current === id) { buyId.current = null; deliverIap({ id, ok: false, error: "failed" }); }
          });
        } else if (msg.type === "iap:restore" && id) {
          restorePurchases()
            .then(() => getAvailablePurchases())
            .then((list) => {
              const out: WebPurchase[] = [];
              for (const p of list ?? []) {
                const w = toWeb(p);
                if (w) { unfinished.current.set(w.transactionId, p); out.push(w); }
              }
              deliverIap({ id, ok: true, purchases: out });
            })
            .catch(() => deliverIap({ id, ok: false, error: "failed" }));
        } else if (msg.type === "iap:finish") {
          const tid = typeof msg.transactionId === "string" ? msg.transactionId : "";
          const p = unfinished.current.get(tid);
          if (p) {
            unfinished.current.delete(tid);
            finishTransaction({ purchase: p, isConsumable: false }).catch(() => {});
          }
        } else if (msg.type === "iap:manage") {
          deepLinkToSubscriptions().catch(() => Linking.openURL("https://apps.apple.com/account/subscriptions").catch(() => {}));
        }
        return;
      }
      if (msg?.type === "share") {
        if (!isAppPage(e.nativeEvent.url)) return;
        const url = typeof msg.url === "string" ? msg.url.slice(0, 2000) : "";
        const text = typeof msg.text === "string" ? msg.text.slice(0, 1000) : "";
        if (url || text) Share.share(url ? { url, message: text || url } : { message: text }).catch(() => {});
        return;
      }
      if (msg?.type === "auth") signedIn.current = msg.state === "signed-in";
      if (msg?.type !== "auth" || msg.state !== "signed-in") return;
      // Purchases that came in before anyone was signed in.
      if (queued.current.length) {
        deliverIap({ id: "update", purchases: queued.current.splice(0) });
      }
      if (pushToken.current) {
        deliverToken(pushToken.current);
        return;
      }
      registerForPush().then((token) => {
        if (!token) return;
        pushToken.current = token;
        deliverToken(token);
      });
    },
    [deliverToken, deliverAuth, deliverIap]
  );

  // Tapping a notification opens its url in the app: while running, and on a
  // cold start from the notification.
  useEffect(() => {
    let cancelled = false;
    Notifications.getLastNotificationResponseAsync()
      .then((res) => {
        const url = appUrlFrom(res?.notification.request.content.data);
        if (!cancelled && url) openInApp(url);
      })
      .catch(() => {});
    const sub = Notifications.addNotificationResponseReceivedListener((res) => {
      const url = appUrlFrom(res.notification.request.content.data);
      if (url) openInApp(url);
    });
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, [openInApp]);

  // Android hardware back navigates the WebView; iOS uses the swipe-back gesture.
  useEffect(() => {
    if (Platform.OS !== "android") return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (canGoBack) {
        webRef.current?.goBack();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [canGoBack]);

  const onNav = useCallback((navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
  }, []);

  const onLoadEnd = useCallback(() => {
    loaded.current = true;
    setLoading(false);
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    webRef.current?.reload();
    setTimeout(() => setRefreshing(false), 1200);
  }, []);

  // Keep Gadit in the app; send mail links and other sites to the system.
  const onShouldStart = useCallback((req: ShouldStartLoadRequest) => {
    const url = req.url;
    if (url.startsWith("about:") || url.startsWith("data:") || url.startsWith("blob:")) return true;
    if (/^(mailto|tel|sms):/i.test(url)) {
      Linking.openURL(url).catch(() => {});
      return false;
    }
    // Sub-frames (embedded video, analytics) load normally.
    if (req.isTopFrame === false) return true;
    const host = hostOf(url);
    if (!host) return true;
    if (IN_APP_HOSTS.includes(host)) return true;
    Linking.openURL(url).catch(() => {});
    return false;
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <StatusBar style="dark" />
        <WebViewView
          ref={webRef}
          source={{ uri: sourceUri }}
          applicationNameForUserAgent={UA_SUFFIX}
          injectedJavaScriptBeforeContentLoaded={INJECT_BEFORE_LOAD}
          onMessage={onMessage}
          onShouldStartLoadWithRequest={onShouldStart}
          onNavigationStateChange={onNav}
          onLoadEnd={onLoadEnd}
          allowsBackForwardNavigationGestures
          originWhitelist={["https://*", "http://*", "mailto:*", "tel:*"]}
          pullToRefreshEnabled
          startInLoadingState
          sharedCookiesEnabled
          // Read-aloud and game sounds play without an extra tap.
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback
          // Say it records the microphone; the page photo uses the camera.
          mediaCapturePermissionGrantType="grantIfSameHostElsePrompt"
          setSupportMultipleWindows={false}
          renderLoading={() => (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color={BRAND} />
            </View>
          )}
          // A hidden ScrollView host gives iOS a native pull-to-refresh feel.
          renderError={() => (
            <ScrollView
              contentContainerStyle={styles.loader}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
              <ActivityIndicator size="large" color={BRAND} />
            </ScrollView>
          )}
        />
        {loading && (
          <View style={styles.loader} pointerEvents="none">
            <ActivityIndicator size="large" color={BRAND} />
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  loader: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
});
