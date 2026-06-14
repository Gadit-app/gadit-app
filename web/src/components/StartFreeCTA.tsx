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
 * Translates to all 12 UI languages via the `startFree` key in
 * i18n-v2. Hebrew uses "התחילו חינם" (plural imperative, gender-
 * neutral) per Gadi's explicit choice.
 */

import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { v2 } from "@/lib/i18n-v2";

export function StartFreeCTA() {
  const { user, promptLogin } = useAuth();
  const { lang } = useLang();

  if (user) return null;

  return (
    <button
      type="button"
      onClick={() => promptLogin({ mode: "signup" })}
      className="wb-shell-startfree"
      aria-label={v2(lang, "startFree")}
    >
      {v2(lang, "startFree")}
    </button>
  );
}
