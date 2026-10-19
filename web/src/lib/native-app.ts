/**
 * The Gadit iOS app (ios-app/, an Expo WebView over www.gadit.app/?src=play)
 * identifies itself by appending "GaditApp-iOS/<version>" to the WebView user
 * agent, and injects `window.GaditNative = { platform: "ios", version, auth }`
 * before any page script runs. Normal browsers, the Android Play app (TWA) and
 * the home-screen PWA never carry this marker, so nothing here changes them.
 *
 * Why it matters (Apple App Review 3.1.1): a digital subscription sold inside
 * an iOS app must go through Apple In-App Purchase, and the app may not show
 * prices, plans or any link or text that sends the user to buy elsewhere. So
 * the iOS app is ALWAYS Play mode (consumption only): middleware.ts treats the
 * UA as Play mode, the layout script marks the tab, and .gd-buy is hidden.
 *
 * Pure module (no React, no "use client") so middleware and API routes can use
 * the UA check too.
 */

export const IOS_APP_UA_MARKER = "GaditApp-iOS";

/** True when a user-agent string belongs to the Gadit iOS app. */
export function isIosAppUA(ua: string | null | undefined): boolean {
  return !!ua && ua.includes(IOS_APP_UA_MARKER);
}

type NativeGlobal = {
  GaditNative?: { platform?: string; version?: string; auth?: string[] };
  ReactNativeWebView?: { postMessage: (msg: string) => void };
};

/**
 * Client-side check: running inside the Gadit iOS app. Either signal is
 * enough: the UA marker or the injected `window.GaditNative`. Always false on
 * the server.
 */
export function isIosApp(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as NativeGlobal;
  if (w.GaditNative?.platform === "ios") return true;
  return isIosAppUA(typeof navigator !== "undefined" ? navigator.userAgent : "");
}

/** Messages the web app sends to the native shell. */
export type NativeMessage =
  | { type: "auth"; state: "signed-in"; uid: string }
  | { type: "auth"; state: "signed-out" }
  /** Run the native Apple / Google sign-in sheet (lib/native-auth.ts). */
  | { type: "auth:apple" | "auth:google"; id: string }
  /** Open the native share sheet. */
  | { type: "share"; url: string; text?: string };

/** True when the native bridge is there to receive messages. */
export function hasNativeBridge(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window as unknown as NativeGlobal).ReactNativeWebView;
}

/** Send a message to the native shell. No-op outside the app. */
export function postToNative(msg: NativeMessage): void {
  if (typeof window === "undefined") return;
  const bridge = (window as unknown as NativeGlobal).ReactNativeWebView;
  if (!bridge) return;
  try {
    bridge.postMessage(JSON.stringify(msg));
  } catch {
    /* bridge gone (page unloading) */
  }
}

/**
 * Share fallback for the iOS app: when the WebView has no navigator.share,
 * ask the shell for its native share sheet. Returns true when the request was
 * handed to the shell (the caller then stops), false everywhere else so the
 * caller keeps its own fallback (clipboard, download).
 */
export function nativeShareFallback(url: string, text?: string): boolean {
  if (!isIosApp() || !hasNativeBridge()) return false;
  if (typeof navigator !== "undefined" && typeof (navigator as Navigator & { share?: unknown }).share === "function") return false;
  const abs = url.startsWith("http") ? url : `https://www.gadit.app${url.startsWith("/") ? "" : "/"}${url}`;
  postToNative({ type: "share", url: abs, ...(text ? { text } : {}) });
  return true;
}

/** Expo push tokens look like ExponentPushToken[xxxx] (older: ExpoPushToken[xxxx]). */
export function isExpoPushToken(token: string | null | undefined): boolean {
  return !!token && /^Expo(nent)?PushToken\[.+\]$/.test(token) && token.length <= 200;
}
