"use client";

/**
 * LoginModalV2 — Screen 4 from the redesign pass.
 *
 * The site-wide login modal. Uses the same auth-context (showLoginModal /
 * setShowLoginModal / loginReason / signInWithGoogle / signInWithEmail /
 * signUpWithEmail) so promptLogin() calls from anywhere in the app
 * trigger this modal.
 *
 * Visual: dark navy backdrop with blur, warm-paper card centered,
 * Wordmark + reason header, Google button, email/password with
 * show/hide toggle, gradient submit, mode toggle below.
 *
 * Notes for the careful reader:
 * - Password input is locked to dir="ltr" regardless of locale
 *   (passwords aren't bidi text). Container padding flips so the
 *   eye toggle stays on the trailing edge in RTL.
 * - Close X uses logical insetInlineEnd so it auto-flips in RTL.
 * - ESC closes. Backdrop click closes. Card click does not propagate.
 * - Loading state disables inputs and shows a spinner in the submit.
 */

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { v2 } from "@/lib/i18n-v2";
import { Wordmark } from "./primitives";

type Mode = "signin" | "signup";

// Inline Google G mark — keeps the modal self-contained, no extra
// asset to ship.
function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.61z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.92-2.26c-.8.54-1.83.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.71A5.41 5.41 0 0 1 3.68 9c0-.59.1-1.17.29-1.71V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.34z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 9 0 9 9 0 0 0 .96 4.95l3.01 2.34C4.68 5.17 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M1 9s2.7-5 8-5 8 5 8 5-2.7 5-8 5-8-5-8-5z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle cx="9" cy="9" r="2.2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ) : (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 9s2.7-5 8-5c1.5 0 2.8.4 3.9 1M16 9s-2.7 5-8 5c-1.5 0-2.8-.4-3.9-1"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M2 16 16 2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      style={{ animation: "gd-spin 0.7s linear infinite" }}
      aria-hidden="true"
    >
      <circle
        cx="7"
        cy="7"
        r="5"
        stroke="currentColor"
        strokeOpacity="0.3"
        strokeWidth="1.5"
      />
      <path
        d="M12 7a5 5 0 0 0-5-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LoginModalV2() {
  const {
    showLoginModal,
    setShowLoginModal,
    loginReason,
    loginMode,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
  } = useAuth();
  const { lang, dir } = useLang();
  const isRtl = dir === "rtl";

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorKey, setErrorKey] = useState<string>("");

  // Reset transient state every time the modal opens fresh.
  // Initial mode comes from auth-context (caller-supplied) — pricing
  // tier CTAs hint "signup" so first-time visitors aren't greeted
  // with "Welcome BACK", which the beta tester rightly flagged as
  // confusing for someone who's never visited before.
  useEffect(() => {
    if (showLoginModal) {
      setMode(loginMode);
      setBusy(false);
      setErrorKey("");
      setShowPwd(false);
    }
  }, [showLoginModal, loginMode]);

  // ESC closes
  useEffect(() => {
    if (!showLoginModal) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setShowLoginModal(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showLoginModal, setShowLoginModal]);

  if (!showLoginModal) return null;

  // Map Firebase auth error codes to translated messages.
  //
  // Security note: in SIGNUP mode we deliberately collapse
  // "email-already-in-use" into the generic message. Otherwise the
  // signup form turns into a user-enumeration oracle: an attacker
  // can probe `target@example.com` and learn whether that user has
  // an account, which leaks the existence of the user (a privacy
  // failure on its own) and lets them target follow-up phishing.
  // In SIGNIN mode the user has presumably already established that
  // they have an account, so a clear "wrong email or password" is
  // OK — and dropping back to a generic message there ruins UX.
  // (Same call as Stripe / Notion / Linear make.)
  function mapAuthError(msg: string, mode: Mode): string {
    if (mode === "signup") {
      // Generic for everything signup-related — the only exception
      // is the local-only validation hints we control ourselves
      // (weak password, invalid email format), where the attacker
      // can't gain anything by knowing the verdict.
      if (msg.includes("weak-password")) return "loginErrorWeakPassword";
      if (msg.includes("invalid-email")) return "loginErrorInvalidEmail";
      return "loginErrorGeneric";
    }
    // Signin path — original behavior.
    if (
      msg.includes("user-not-found") ||
      msg.includes("wrong-password") ||
      msg.includes("invalid-credential")
    )
      return "loginErrorWrongCredentials";
    if (msg.includes("invalid-email")) return "loginErrorInvalidEmail";
    return "loginErrorGeneric";
  }

  async function handleGoogle() {
    setBusy(true);
    setErrorKey("");
    try {
      await signInWithGoogle();
    } catch {
      setErrorKey("loginErrorGoogleFailed");
    } finally {
      setBusy(false);
    }
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrorKey("");
    try {
      if (mode === "signin") {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setErrorKey(mapAuthError(msg, mode));
    } finally {
      setBusy(false);
    }
  }

  const titleKey = mode === "signup" ? "loginCreateAccount" : "loginWelcomeBack";
  const submitKey = busy
    ? mode === "signup"
      ? "loginCreatingAccount"
      : "loginSigningIn"
    : mode === "signup"
      ? "loginSubmitSignUp"
      : "loginSubmitSignIn";
  const toggleKey =
    mode === "signup" ? "loginSwitchToSignIn" : "loginSwitchToSignUp";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: "oklch(0.12 0.04 265 / 0.55)",
        backdropFilter: "blur(14px)",
        padding: 16,
      }}
      onClick={() => setShowLoginModal(false)}
      role="dialog"
      aria-modal="true"
      dir={dir}
    >
      <div
        className="relative"
        style={{
          width: "100%",
          maxWidth: 440,
          padding: "clamp(24px, 3vw, 32px) clamp(22px, 3vw, 36px) clamp(26px, 3vw, 34px)",
          textAlign: isRtl ? "right" : "left",
          // Electric-blue card — high contrast against the dark navy
          // backdrop AND against the white input fields inside, so
          // the wordmark + form structure read clearly. The deep
          // navy-to-blue gradient echoes the wordmark gradient.
          borderRadius: 20,
          background:
            "linear-gradient(180deg, oklch(0.4 0.18 250) 0%, oklch(0.32 0.16 255) 100%)",
          boxShadow:
            "0 0 0 1px oklch(0.72 0.19 245 / 0.45), " +
            "0 0 0 6px oklch(0.72 0.19 245 / 0.08), " +
            "0 30px 60px -20px oklch(0.08 0.08 260 / 0.7), " +
            "0 8px 22px -10px oklch(0.08 0.08 260 / 0.5)",
          color: "white",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close X */}
        <button
          type="button"
          onClick={() => setShowLoginModal(false)}
          aria-label={v2(lang, "loginCloseAria")}
          style={{
            position: "absolute",
            insetBlockStart: 8,
            insetInlineEnd: 8,
            // 44×44 hit area; the visible X icon is still small.
            width: 44,
            height: 44,
            borderRadius: 999,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "oklch(1 0 0 / 0.7)",
            background: "transparent",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M3 3l8 8M11 3l-8 8"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Wordmark — centered above the title regardless of UI
            language. Beta tester reported the "G" was clipping out
            of the card on RTL, where the inline-flow direction
            collided with the close X positioned at insetInlineEnd.
            Centering side-steps the collision entirely and reads
            cleaner — the wordmark belongs to the brand header, not
            to a side. We force `direction: ltr` on the wrapper so
            the wordmark image itself stays in its natural
            left-to-right shape on RTL pages. */}
        <div
          className="mb-3"
          style={{
            display: "flex",
            justifyContent: "center",
            direction: "ltr",
          }}
        >
          <Wordmark />
        </div>

        {/* Title */}
        <div
          className={
            lang === "he"
              ? "gd-font-he"
              : lang === "ar"
                ? "gd-font-ar"
                : "gd-font-display"
          }
          style={{
            fontSize: "clamp(24px, 2.6vw, 28px)",
            lineHeight: 1.18,
            color: "white",
            ...(lang !== "he" && lang !== "ar"
              ? {
                  fontVariationSettings: '"opsz" 36',
                  fontStyle: "italic",
                  fontWeight: 400,
                  letterSpacing: "-0.015em",
                }
              : {}),
          }}
        >
          {v2(lang, titleKey)}
        </div>

        {/* Reason line */}
        {loginReason && (
          <p
            className="mt-1.5 gd-font-sans-ui"
            style={{
              fontSize: 13.5,
              color: "oklch(1 0 0 / 0.75)",
              lineHeight: 1.5,
            }}
          >
            {loginReason}
          </p>
        )}

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={busy}
          className="mt-6 w-full gd-font-sans-ui font-medium inline-flex items-center justify-center gap-2.5 transition-shadow hover:shadow-md disabled:opacity-60"
          style={{
            background: "white",
            color: "var(--gd-ink-900)",
            fontSize: 14,
            padding: "12px 14px",
            borderRadius: 12,
            boxShadow:
              "inset 0 0 0 1px oklch(0 0 0 / 0.12), 0 1px 0 oklch(0 0 0 / 0.04)",
          }}
        >
          <GoogleG />
          <span>{v2(lang, "loginContinueWithGoogle")}</span>
        </button>

        {/* "or" separator */}
        <div className="my-5 flex items-center gap-3">
          <div
            className="flex-1"
            style={{ height: 1, background: "oklch(1 0 0 / 0.18)" }}
          />
          <span
            className="gd-font-sans-ui"
            style={{
              fontSize: 11.5,
              color: "oklch(1 0 0 / 0.6)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            {v2(lang, "loginOrSeparator")}
          </span>
          <div
            className="flex-1"
            style={{ height: 1, background: "oklch(1 0 0 / 0.18)" }}
          />
        </div>

        <form onSubmit={handleEmail} noValidate>
          {/* Inline error */}
          {errorKey && (
            <div
              className="gd-font-sans-ui mb-3"
              style={{
                fontSize: 13,
                color: "oklch(0.55 0.18 28)",
                lineHeight: 1.4,
              }}
              role="alert"
            >
              {v2(lang, errorKey as never)}
            </div>
          )}

          {/* Email */}
          <label className="block">
            <div
              className="gd-font-sans-ui mb-1.5"
              style={{
                fontSize: 11.5,
                color: "oklch(1 0 0 / 0.85)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              {v2(lang, "loginEmailLabel")}
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              dir="ltr"
              placeholder={v2(lang, "loginEmailPlaceholder")}
              disabled={busy}
              className="w-full gd-font-sans-ui outline-none transition-shadow"
              style={{
                // Solid white fill instead of a translucent dark tint.
                // On the new electric-blue card, the previous near-
                // transparent input read as "decorative outline only" —
                // users couldn't tell the field was tappable. Pure white
                // matches the Google button above and gives the form a
                // clear "input here" affordance.
                background: "white",
                color: "var(--gd-ink-900)",
                // 16px floor — anything below triggers iOS Safari
                // auto-zoom, which on a centered modal pushes the
                // close X off-screen and traps the user.
                fontSize: 16,
                padding: "11px 14px",
                borderRadius: 10,
                boxShadow: errorKey
                  ? "inset 0 0 0 1.5px oklch(0.55 0.18 28 / 0.6)"
                  : "inset 0 0 0 1px oklch(0 0 0 / 0.12)",
              }}
            />
          </label>

          {/* Password */}
          <label className="block mt-3">
            <div
              className="gd-font-sans-ui mb-1.5"
              style={{
                fontSize: 11.5,
                color: "oklch(1 0 0 / 0.85)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              {v2(lang, "loginPasswordLabel")}
            </div>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
                dir="ltr"
                placeholder={v2(lang, "loginPasswordPlaceholder")}
                disabled={busy}
                className="w-full gd-font-sans-ui outline-none transition-shadow"
                style={{
                  // Solid white — same rationale as the email input.
                  background: "white",
                  color: "var(--gd-ink-900)",
                  // 16px floor — see email input above. iOS auto-zoom
                  // hits password fields too.
                  fontSize: 16,
                  padding: isRtl
                    ? "11px 14px 11px 40px"
                    : "11px 40px 11px 14px",
                  borderRadius: 10,
                  boxShadow: errorKey
                    ? "inset 0 0 0 1.5px oklch(0.55 0.18 28 / 0.6)"
                    : "inset 0 0 0 1px oklch(0 0 0 / 0.12)",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                aria-label={
                  showPwd
                    ? v2(lang, "loginHidePassword")
                    : v2(lang, "loginShowPassword")
                }
                tabIndex={-1}
                style={{
                  position: "absolute",
                  insetBlockStart: "50%",
                  transform: "translateY(-50%)",
                  insetInlineEnd: 10,
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  color: "var(--gd-ink-400)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "transparent",
                }}
              >
                <EyeIcon open={showPwd} />
              </button>
            </div>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={busy}
            className="mt-5 w-full gd-font-sans-ui font-medium inline-flex items-center justify-center gap-2"
            style={{
              fontSize: 14.5,
              padding: "13px 18px",
              borderRadius: 12,
              background: busy
                ? "linear-gradient(180deg, oklch(0.62 0.1 245), oklch(0.5 0.12 250))"
                : "linear-gradient(180deg, oklch(0.78 0.17 245), oklch(0.62 0.2 250))",
              color: "white",
              boxShadow:
                "0 0 0 1px oklch(0.5 0.2 250 / 0.6), 0 8px 22px oklch(0.5 0.2 250 / 0.4)",
              opacity: busy ? 0.85 : 1,
              cursor: busy ? "default" : "pointer",
            }}
          >
            {busy && <Spinner />}
            {v2(lang, submitKey)}
          </button>
        </form>

        {/* Mode toggle */}
        <div
          className="mt-4 text-center gd-font-sans-ui"
          style={{ fontSize: 13, color: "oklch(1 0 0 / 0.7)" }}
        >
          <button
            type="button"
            onClick={() => {
              setMode((m) => (m === "signin" ? "signup" : "signin"));
              setErrorKey("");
            }}
            style={{
              color: "white",
              fontWeight: 500,
              textDecoration: "underline",
              cursor: "pointer",
              background: "transparent",
            }}
          >
            {v2(lang, toggleKey)}
          </button>
        </div>
      </div>
    </div>
  );
}
