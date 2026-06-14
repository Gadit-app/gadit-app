"use client";

/**
 * StartFreeCTA — visible signup entry point in every topbar.
 *
 * Gadi's friend tried Gadit on mobile and asked "but where do I sign
 * up?" — the only auth entry was "Sign in" hidden inside the burger
 * menu, which doesn't read as "create new account" to first-timers.
 *
 * This button is the fix. It renders ONLY for non-logged-in users,
 * visible on both mobile and desktop, and clicks straight into the
 * Google sign-up popup (no modal intermediary). Returning users who
 * prefer email/password can still reach the email form via the
 * existing "Sign in" entry in the burger menu.
 *
 * Translates to all 12 UI languages via the `startFree` key in
 * i18n-v2. Hebrew uses "התחילו חינם" (plural imperative, gender-
 * neutral) per Gadi's explicit choice.
 */

import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { v2 } from "@/lib/i18n-v2";

export function StartFreeCTA() {
  const { user, signInWithGoogle } = useAuth();
  const { lang } = useLang();

  if (user) return null;

  const handleClick = async () => {
    try {
      await signInWithGoogle();
    } catch (e) {
      // Google popup blocked, user dismissed, or network failed.
      // Silent — the auth layer already logs the specific error and
      // a follow-up click is cheap. Surfacing a toast here would
      // clutter every page that mounts this CTA.
      console.warn("[start-free] signInWithGoogle failed:", e);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="wb-shell-startfree"
      aria-label={v2(lang, "startFree")}
    >
      {v2(lang, "startFree")}
    </button>
  );
}
