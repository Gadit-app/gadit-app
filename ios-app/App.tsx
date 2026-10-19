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
  window.GaditNative = { platform: ${JSON.stringify(Platform.OS)}, version: ${JSON.stringify(VERSION)}, auth: ${JSON.stringify(NATIVE_AUTH_PROVIDERS)} };
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

  /** Hand the push token to the page (the native bridge in web/src). */
  const deliverToken = useCallback((token: string) => {
    const t = JSON.stringify(token);
    webRef.current?.injectJavaScript(`
      window.__gaditPushToken = ${t};
      window.dispatchEvent(new CustomEvent("gadit-push-token", { detail: { token: ${t} } }));
      true;
    `);
  }, []);

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
      let msg: { type?: string; state?: string; id?: unknown; url?: unknown; text?: unknown } | null = null;
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
      if (msg?.type === "share") {
        if (!isAppPage(e.nativeEvent.url)) return;
        const url = typeof msg.url === "string" ? msg.url.slice(0, 2000) : "";
        const text = typeof msg.text === "string" ? msg.text.slice(0, 1000) : "";
        if (url || text) Share.share(url ? { url, message: text || url } : { message: text }).catch(() => {});
        return;
      }
      if (msg?.type !== "auth" || msg.state !== "signed-in") return;
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
    [deliverToken, deliverAuth]
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
