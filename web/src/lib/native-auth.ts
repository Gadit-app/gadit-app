/**
 * Native sign-in inside the Gadit iOS app (ios-app/).
 *
 * Google blocks its OAuth pages inside embedded WebViews, and Apple requires
 * Sign in with Apple next to any third-party login (App Review 4.8). So inside
 * the iOS app the web asks the shell to run the system sheet:
 *
 *   web    -> native  {type:"auth:apple"|"auth:google", id}
 *   native -> web     window event "gadit-native-auth", detail {id, ok, ...tokens}
 *
 * and then signs in to Firebase with signInWithCredential (lib/auth-context.tsx).
 * The shell advertises what it can run in window.GaditNative.auth, so an older
 * build without these handlers keeps the regular web flow.
 *
 * Pure module (no React). Everything is a no-op outside the iOS app.
 */
import { isIosApp, postToNative } from "./native-app";

export type NativeAuthProvider = "apple" | "google";

export type NativeAuthSuccess = {
  provider: NativeAuthProvider;
  idToken: string;
  rawNonce?: string;
  accessToken?: string;
  fullName?: string;
  email?: string;
};

type NativeAuthReply =
  | ({ id: string; ok: true } & NativeAuthSuccess)
  | { id: string; ok: false; provider: NativeAuthProvider; error: string; message?: string };

/** Thrown when the native sheet did not produce tokens. `code` is
 * "native/cancelled" | "native/unavailable" | "native/in-progress" |
 * "native/no-token" | "native/failed" | "native/timeout". */
export class NativeAuthError extends Error {
  code: string;
  constructor(code: string, message?: string) {
    super(message || code);
    this.name = "NativeAuthError";
    this.code = code;
  }
}

/** True when this iOS app build can run the native sheet for `provider`. */
export function nativeAuthAvailable(provider: NativeAuthProvider): boolean {
  if (typeof window === "undefined" || !isIosApp()) return false;
  const w = window as unknown as {
    GaditNative?: { auth?: unknown };
    ReactNativeWebView?: unknown;
  };
  const list = w.GaditNative?.auth;
  return !!w.ReactNativeWebView && Array.isArray(list) && list.includes(provider);
}

// The user may sit on the system sheet for a while (2FA, password); after this
// long without an answer the request is treated as lost.
const TIMEOUT_MS = 5 * 60 * 1000;

/** Run the native sign-in sheet and resolve with its tokens. */
export function requestNativeAuth(provider: NativeAuthProvider): Promise<NativeAuthSuccess> {
  if (!nativeAuthAvailable(provider)) return Promise.reject(new NativeAuthError("native/unavailable"));
  const id = `${provider}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return new Promise<NativeAuthSuccess>((resolve, reject) => {
    const finish = () => {
      window.removeEventListener("gadit-native-auth", onReply);
      clearTimeout(timer);
    };
    const onReply = (e: Event) => {
      const d = (e as CustomEvent<NativeAuthReply>).detail;
      if (!d || d.id !== id) return;
      finish();
      if (d.ok && d.idToken) {
        resolve({
          provider: d.provider || provider,
          idToken: d.idToken,
          rawNonce: d.rawNonce,
          accessToken: d.accessToken,
          fullName: d.fullName,
          email: d.email,
        });
      } else {
        const err = d.ok ? "no-token" : d.error || "failed";
        reject(new NativeAuthError(`native/${err}`, d.ok ? undefined : d.message));
      }
    };
    const timer = setTimeout(() => {
      finish();
      reject(new NativeAuthError("native/timeout"));
    }, TIMEOUT_MS);
    window.addEventListener("gadit-native-auth", onReply);
    postToNative({ type: provider === "apple" ? "auth:apple" : "auth:google", id });
  });
}

/** True for the error the user caused by closing the sheet (no message needed). */
export function isNativeAuthCancel(e: unknown): boolean {
  const code = (e as { code?: string } | null)?.code ?? "";
  return code === "native/cancelled" || code === "native/canceled";
}
