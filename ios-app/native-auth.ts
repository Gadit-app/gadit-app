import { Platform } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import { GoogleSignin, isErrorWithCode, statusCodes } from "@react-native-google-signin/google-signin";

// Native sign-in sheets for the Gadit iOS app. The web app (www.gadit.app, inside the
// WebView) cannot run Google OAuth in an embedded WebView (Google blocks it)
// and has no web config for Sign in with Apple, so it asks the shell over the
// bridge ("auth:apple" / "auth:google"). We run the system sheet and hand the
// raw tokens back; the web side signs in to Firebase with signInWithCredential.
// Nothing here talks to Firebase and nothing is stored on the device.

// OAuth clients of the Firebase project gadit-app (public identifiers,
// not secrets). iOS client from GoogleService-Info.plist; the web client is the
// one the Firebase Google provider is configured with.
const GOOGLE_IOS_CLIENT_ID = "11084221528-24flg3qfpkevrackjnag0l6p8iufaplh.apps.googleusercontent.com";
const GOOGLE_WEB_CLIENT_ID = "11084221528-vfsfo0t1n3e4jgpe27qn9gbl0as1hdtl.apps.googleusercontent.com";

export type NativeAuthProvider = "apple" | "google";

/** Error codes the web side understands (web/src/lib/native-auth.ts). */
export type NativeAuthErrorCode = "cancelled" | "unavailable" | "in-progress" | "no-token" | "failed";

export type NativeAuthResult =
  | {
      ok: true;
      provider: NativeAuthProvider;
      idToken: string;
      /** Apple only: the nonce we generated (its SHA-256 went to Apple). */
      rawNonce?: string;
      /** Google only. */
      accessToken?: string;
      /** Apple only: one-time code, used by the web to revoke on account deletion. */
      authorizationCode?: string;
      /** Apple sends the name only on the very first sign-in. */
      fullName?: string;
      email?: string;
    }
  | { ok: false; provider: NativeAuthProvider; error: NativeAuthErrorCode; message?: string };

/** Providers this build can run, advertised to the web in window.GaditNative. */
export const NATIVE_AUTH_PROVIDERS: NativeAuthProvider[] = Platform.OS === "ios" ? ["apple", "google"] : [];

let googleConfigured = false;
function configureGoogle() {
  if (googleConfigured) return;
  GoogleSignin.configure({
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
    scopes: ["email", "profile"],
  });
  googleConfigured = true;
}

/** Random 32-byte hex nonce. */
function makeNonce(): string {
  const bytes = Crypto.getRandomBytes(32);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function joinName(n: AppleAuthenticationFullNameLike | null | undefined): string | undefined {
  if (!n) return undefined;
  const s = [n.givenName, n.middleName, n.familyName].filter((x) => !!x && String(x).trim()).join(" ").trim();
  return s || undefined;
}
type AppleAuthenticationFullNameLike = { givenName: string | null; middleName: string | null; familyName: string | null };

async function signInWithApple(): Promise<NativeAuthResult> {
  const provider = "apple" as const;
  try {
    if (!(await AppleAuthentication.isAvailableAsync())) return { ok: false, provider, error: "unavailable" };
    const rawNonce = makeNonce();
    const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);
    const cred = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });
    if (!cred.identityToken) return { ok: false, provider, error: "no-token" };
    return {
      ok: true,
      provider,
      idToken: cred.identityToken,
      rawNonce,
      authorizationCode: cred.authorizationCode ?? undefined,
      fullName: joinName(cred.fullName),
      email: cred.email ?? undefined,
    };
  } catch (e) {
    const code = (e as { code?: string } | null)?.code ?? "";
    if (code === "ERR_REQUEST_CANCELED" || code === "ERR_CANCELED") return { ok: false, provider, error: "cancelled" };
    return { ok: false, provider, error: "failed", message: String((e as Error)?.message ?? e).slice(0, 200) };
  }
}

async function signInWithGoogle(): Promise<NativeAuthResult> {
  const provider = "google" as const;
  try {
    configureGoogle();
    // Start clean so the account chooser shows every time (a parent and a
    // co-parent may share the phone; the web session is already signed out).
    await GoogleSignin.signOut().catch(() => null);
    const res = await GoogleSignin.signIn();
    if (res.type !== "success") return { ok: false, provider, error: "cancelled" };
    const tokens = await GoogleSignin.getTokens().catch(() => null);
    const idToken = tokens?.idToken || res.data.idToken;
    if (!idToken) return { ok: false, provider, error: "no-token" };
    return {
      ok: true,
      provider,
      idToken,
      accessToken: tokens?.accessToken || undefined,
      fullName: res.data.user.name ?? undefined,
      email: res.data.user.email ?? undefined,
    };
  } catch (e) {
    if (isErrorWithCode(e)) {
      if (e.code === statusCodes.SIGN_IN_CANCELLED) return { ok: false, provider, error: "cancelled" };
      if (e.code === statusCodes.IN_PROGRESS) return { ok: false, provider, error: "in-progress" };
      if (e.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) return { ok: false, provider, error: "unavailable" };
    }
    return { ok: false, provider, error: "failed", message: String((e as Error)?.message ?? e).slice(0, 200) };
  }
}

let busy = false;

/** Run one native sign-in sheet. Never throws. */
export async function runNativeAuth(provider: NativeAuthProvider): Promise<NativeAuthResult> {
  if (!NATIVE_AUTH_PROVIDERS.includes(provider)) return { ok: false, provider, error: "unavailable" };
  if (busy) return { ok: false, provider, error: "in-progress" };
  busy = true;
  try {
    return provider === "apple" ? await signInWithApple() : await signInWithGoogle();
  } finally {
    busy = false;
  }
}
