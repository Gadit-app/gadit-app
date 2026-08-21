"use client";

/**
 * StartFreeCTA — visible signup entry point in every topbar.
 *
 * Gadi's friend tried Gadit on mobile and asked "but where do I sign
 * up?" — the only auth entry was "Sign in" hidden inside the burger
 * menu, which doesn't read as "create new account" to first-timers.
 *
 * Click opens the signup-mode LoginModalV2 — same modal as Sign in
 * but defaults to the "create account" view. Inside the modal both
 * options are visible (Continue with Google + email/password form),
 * so users who can't or won't use Google have an obvious fallback.
 * An earlier version called signInWithGoogle() directly; that worked
 * but offered no choice and Gadi's feedback (2026-06-14) was that
 * the desktop modal flow felt more inviting and gave parity with
 * how Sign in already behaves.
 *
 * Translates to all 30+ UI languages via the `startFree` key in
 * i18n-v2. Hebrew uses "התחילו חינם" (plural imperative, gender-
 * neutral) per Gadi's explicit choice.
 */

import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { v2 } from "@/lib/i18n-v2";

export function StartFreeCTA() {
  const { user, loading, promptLogin } = useAuth();
  const { lang } = useLang();

  // Hide while auth is still resolving. Firebase takes ~1-2s to verify
  // the session from the cookie / IndexedDB on cold load — during that
  // window `user` is null even for signed-in returning visitors. If we
  // render the CTA in that window it appears, then snaps to null when
  // auth resolves. Gadi 2026-06-25 flagged the visible side effect: on
  // mobile the absolute-centered CTA briefly overlapped the language
  // switcher because both were trying to live in the same px range.
  // Waiting for loading === false eliminates the flash and the overlap
  // it caused.
  if (loading || user) return null;

  // A "Sign in" link sits before the Start-free pill for RETURNING users.
  // It is hidden by default and only shown inside the mobile CTA wrapper
  // (≤1023px) — on desktop the actions row already has its own Sign in link,
  // and on mobile the topbar previously showed ONLY "Start free" with no
  // visible way in for an existing user (Gadi 2026-08-15).
  return (
    <span className="wb-shell-auth-pair">
      <button
        type="button"
        onClick={() => promptLogin({ mode: "signin" })}
        className="wb-shell-signin-mobile"
        aria-label={v2(lang, "signIn")}
        title={v2(lang, "signIn")}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5.5 20c0-3.6 2.9-5.6 6.5-5.6s6.5 2 6.5 5.6" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => promptLogin({ mode: "signup" })}
        className="wb-shell-startfree"
        aria-label={v2(lang, "startFree")}
      >
        {v2(lang, "startFree")}
      </button>
    </span>
  );
}
