"use client";

/**
 * LoginModal — CrispTech rethemed.
 *
 * Same auth flow as before (Google + email/password, signup age gate,
 * password policy, Firebase error mapping). Visual language is the
 * wordbook system: clean white card, teal accent, no electric-blue
 * gradients. Matches the home / pricing / features chrome.
 */

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { v2 } from "@/lib/i18n-v2";

type Mode = "signin" | "signup";

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.61z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.92-2.26c-.8.54-1.83.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.71A5.41 5.41 0 0 1 3.68 9c0-.59.1-1.17.29-1.71V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.34z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 9 0 9 9 0 0 0 .96 4.95l3.01 2.34C4.68 5.17 6.66 3.58 9 3.58z" />
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M1 9s2.7-5 8-5 8 5 8 5-2.7 5-8 5-8-5-8-5z" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="9" cy="9" r="2.2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M2 9s2.7-5 8-5c1.5 0 2.8.4 3.9 1M16 9s-2.7 5-8 5c-1.5 0-2.8-.4-3.9-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M2 16 16 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ animation: "gd-spin 0.7s linear infinite" }} aria-hidden="true">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5" />
      <path d="M12 7a5 5 0 0 0-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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
    sendPasswordReset,
  } = useAuth();
  const { lang, dir } = useLang();
  const isRtl = dir === "rtl";

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorKey, setErrorKey] = useState<string>("");
  // COPPA / GDPR self-attestation — we can't verify age, but we make
  // the user click that they're old enough. Industry-standard minimum.
  const [ageAccepted, setAgeAccepted] = useState(false);

  useEffect(() => {
    if (showLoginModal) {
      setMode(loginMode);
      setBusy(false);
      setErrorKey("");
      setShowPwd(false);
      setAgeAccepted(false);
    }
  }, [showLoginModal, loginMode]);

  useEffect(() => {
    if (!showLoginModal) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setShowLoginModal(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showLoginModal, setShowLoginModal]);

  if (!showLoginModal) return null;

  // Signup-mode error mapping. The earlier version collapsed
  // 'email-already-in-use' into the generic message to avoid the
  // signup form becoming an enumeration oracle. In practice that
  // pattern caused real users (e.g. someone signing up their
  // spouse) to get stuck on 'Something went wrong' when the actual
  // issue was simply that they'd already tried with that email.
  // Surfacing the specific case here (with a 'try signing in'
  // hint) gives them a way out; the enumeration risk is the same
  // as the signin error already exposing 'wrong email or password'.
  function mapAuthError(msg: string, mode: Mode): string {
    if (mode === "signup") {
      if (msg.includes("email-already-in-use")) return "loginErrorEmailInUse";
      if (msg.includes("weak-password")) return "loginErrorWeakPassword";
      if (msg.includes("invalid-email")) return "loginErrorInvalidEmail";
      return "loginErrorGeneric";
    }
    if (msg.includes("user-not-found") || msg.includes("wrong-password") || msg.includes("invalid-credential"))
      return "loginErrorWrongCredentials";
    if (msg.includes("invalid-email")) return "loginErrorInvalidEmail";
    return "loginErrorGeneric";
  }

  async function handleGoogle() {
    if (mode === "signup" && !ageAccepted) {
      setErrorKey("loginErrorAgeRequired");
      return;
    }
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

  // Firebase's default 6-char minimum accepts "111111" — bumped to 8
  // with letter+digit mix. Signup only; signin must accept legacy 6-char.
  function validateSignupPassword(pw: string): string | null {
    if (pw.length < 8) return "loginErrorWeakPassword";
    if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) return "loginErrorWeakPassword";
    return null;
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setErrorKey("");
    if (mode === "signup") {
      if (!ageAccepted) {
        setErrorKey("loginErrorAgeRequired");
        return;
      }
      const policyErr = validateSignupPassword(password);
      if (policyErr) {
        setErrorKey(policyErr);
        return;
      }
    }
    setBusy(true);
    try {
      if (mode === "signin") await signInWithEmail(email, password);
      else await signUpWithEmail(email, password);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      // Log the raw Firebase error to the console so we can debug
      // production sign-up failures by asking the user to share their
      // browser console — without exposing the raw text in the UI.
      console.error("[auth] mode=" + mode + " error:", msg);
      setErrorKey(mapAuthError(msg, mode));
    } finally {
      setBusy(false);
    }
  }

  const titleKey = mode === "signup" ? "loginCreateAccount" : "loginWelcomeBack";
  const submitKey = busy
    ? mode === "signup" ? "loginCreatingAccount" : "loginSigningIn"
    : mode === "signup" ? "loginSubmitSignUp" : "loginSubmitSignIn";
  const toggleKey = mode === "signup" ? "loginSwitchToSignIn" : "loginSwitchToSignUp";

  return (
    <div
      className="wordbook wb-login-backdrop"
      onClick={() => setShowLoginModal(false)}
      role="dialog"
      aria-modal="true"
      dir={dir}
    >
      <div
        className="wb-login-card"
        style={{ textAlign: isRtl ? "right" : "left" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setShowLoginModal(false)}
          aria-label={v2(lang, "loginCloseAria")}
          className="wb-login-close"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>

        <div className="wb-login-logo">
          Gad<span className="wb-login-logo-it">it</span>
        </div>

        <h2 className="wb-login-title">{v2(lang, titleKey)}</h2>

        {loginReason && <p className="wb-login-reason">{loginReason}</p>}

        <button
          type="button"
          onClick={handleGoogle}
          disabled={busy}
          className="wb-login-google"
        >
          <GoogleG />
          <span>{v2(lang, "loginContinueWithGoogle")}</span>
        </button>

        <div className="wb-login-sep">
          <span>{v2(lang, "loginOrSeparator")}</span>
        </div>

        <form onSubmit={handleEmail} noValidate>
          {errorKey && (
            <div
              className={`wb-login-error ${errorKey === "loginResetSent" ? "is-success" : ""}`}
              role="alert"
            >
              {v2(lang, errorKey as never)}
            </div>
          )}

          <div className="wb-login-field">
            <label className="wb-login-label">{v2(lang, "loginEmailLabel")}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              dir="ltr"
              placeholder={v2(lang, "loginEmailPlaceholder")}
              disabled={busy}
              className={`wb-login-input ${errorKey ? "is-error" : ""}`}
            />
          </div>

          <div className="wb-login-field">
            <label className="wb-login-label">{v2(lang, "loginPasswordLabel")}</label>
            <div className="wb-login-pwd-wrap">
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                dir="ltr"
                placeholder={v2(lang, "loginPasswordPlaceholder")}
                disabled={busy}
                className={`wb-login-input-pwd ${errorKey ? "is-error" : ""}`}
                style={{ padding: isRtl ? "11px 14px 11px 40px" : "11px 40px 11px 14px" }}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                aria-label={showPwd ? v2(lang, "loginHidePassword") : v2(lang, "loginShowPassword")}
                tabIndex={-1}
                className="wb-login-pwd-toggle"
              >
                <EyeIcon open={showPwd} />
              </button>
            </div>
          </div>

          {mode === "signup" && (
            <label className="wb-login-age">
              <input
                type="checkbox"
                checked={ageAccepted}
                onChange={(e) => setAgeAccepted(e.target.checked)}
              />
              <span>
                {v2(lang, "loginAgeTermsLine")}{" "}
                <a href="/terms" target="_blank" onClick={(e) => e.stopPropagation()}>
                  {v2(lang, "loginTermsLinkLabel")}
                </a>
                {" · "}
                <a href="/privacy" target="_blank" onClick={(e) => e.stopPropagation()}>
                  {v2(lang, "loginPrivacyLinkLabel")}
                </a>
              </span>
            </label>
          )}

          <button
            type="submit"
            disabled={busy}
            className="wb-login-submit"
          >
            {busy && <Spinner />}
            {v2(lang, submitKey)}
          </button>
        </form>

        {/* Forgot-password link — signin mode only. Tapping it triggers
            Firebase's password-reset email to whatever's in the email
            field. The success message is intentionally generic ('if
            an account exists') so we don't leak which addresses are
            registered. If the email field is empty we just nudge the
            user to fill it first instead of sending a malformed
            request. */}
        {mode === "signin" && (
          <div className="wb-login-forgot">
            <button
              type="button"
              className="wb-login-forgot-btn"
              disabled={busy}
              onClick={async () => {
                if (!email.trim()) {
                  setErrorKey("loginForgotPasswordEnterEmail");
                  return;
                }
                setBusy(true);
                setErrorKey("");
                try {
                  await sendPasswordReset(email.trim());
                  setErrorKey("loginResetSent");
                } catch (err) {
                  console.error("[auth] password-reset error:", err);
                  setErrorKey("loginResetError");
                } finally {
                  setBusy(false);
                }
              }}
            >
              {v2(lang, "loginForgotPassword")}
            </button>
          </div>
        )}

        <div className="wb-login-toggle">
          <button
            type="button"
            onClick={() => {
              setMode((m) => (m === "signin" ? "signup" : "signin"));
              setErrorKey("");
            }}
          >
            {v2(lang, toggleKey)}
          </button>
        </div>
      </div>
    </div>
  );
}
