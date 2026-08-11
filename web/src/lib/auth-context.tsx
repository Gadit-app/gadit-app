"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  getAdditionalUserInfo,
} from "firebase/auth";
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import { track } from "@/lib/track";

function getFirebaseAuth() {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  return getAuth(app);
}

function getFirebaseDb() {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  return getFirestore(app);
}

export type UserPlan = "basic" | "clear" | "deep";

/**
 * Optional callback fired after a successful login/signup, with the
 * freshly authenticated user. Used by surfaces that triggered the
 * login wall but want to *continue* their flow afterward — e.g., a
 * pricing tier CTA that needs to call /api/create-checkout once the
 * user has an ID token. Without this, the user signs in and is
 * stranded back on the source page wondering what to do next.
 */
export type AuthAction = (user: User) => void | Promise<void>;

/** Hint to the LoginModal about whether to open in "sign in" or
 *  "create account" mode. Pricing CTAs hint "signup" because most
 *  people clicking them are new; the search wall hints "signin" or
 *  leaves it default since we don't know either way. */
export type AuthMode = "signin" | "signup";

interface PromptLoginOpts {
  reason?: string;
  mode?: AuthMode;
  /** Run after successful auth. If the user is *already* signed in
   *  when promptLogin is called, the modal is skipped and the action
   *  runs immediately — which is exactly what we want for "Subscribe"
   *  buttons clicked by an already-signed-in visitor. */
  onSuccess?: AuthAction;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  plan: UserPlan;
  /** Owner of a Family subscription has this set to their own uid.
   *  Paired members (kids + secondary parents) have it set to the
   *  family owner's uid. null means no Family membership at all. */
  familyId: string | null;
  /** Owner of a Schools subscription has this set to their own uid.
   *  Schools doesn't pair students — kids reach their classroom via
   *  a code at /c/<CODE> without authenticating — so this is set on
   *  the principal/coordinator account only. null = no Schools sub. */
  schoolId: string | null;
  /** Family membership role for paired members: "kid" or "parent"
   *  (secondary parents). null for the billing owner and for anyone
   *  who is not a paired family member. Kids get a stripped-down,
   *  commerce-free UI (nav + route guard). */
  familyRole: "kid" | "parent" | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  showLoginModal: boolean;
  setShowLoginModal: (v: boolean) => void;
  loginReason: string;
  /** Initial mode the LoginModal should open in. The modal itself
   *  still lets the user toggle. */
  loginMode: AuthMode;
  /** Open the login modal, or, if the user is already signed in,
   *  skip the modal and run `opts.onSuccess` directly. The string
   *  shorthand is preserved for the existing "just open it" callers. */
  promptLogin: (opts?: PromptLoginOpts | string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<UserPlan>("basic");
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [familyRole, setFamilyRole] = useState<"kid" | "parent" | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginReason, setLoginReason] = useState("");
  const [loginMode, setLoginMode] = useState<AuthMode>("signin");
  // A non-blocking welcome banner shown briefly after a brand-new
  // signup. Real users (Eyal, June 2026) finished the signup form and
  // weren't sure anything had happened — the login modal closed
  // silently and the page didn't change. A 5-second confirmation pill
  // at the top of the viewport fills that gap without adding a new
  // navigation step.
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  function showWelcome() {
    setWelcomeOpen(true);
    setTimeout(() => setWelcomeOpen(false), 6000);
  }
  // Pending action runs once after the next successful auth event.
  // Stored in a ref so React state churn during the auth flow doesn't
  // race the firing condition.
  const pendingActionRef = useRef<AuthAction | null>(null);

  // Capture UTM params on first page load — feeds /admin/campaigns
  // attribution. First-touch attribution policy lives inside captureUtm:
  // a fresh UTM-bearing visit only overwrites a stored value after the
  // previous one has expired (30 days).
  useEffect(() => {
    // Async-import keeps the helper out of the auth bundle for users
    // who arrive without any UTM params (the common case).
    void import("./utm").then((m) => m.captureUtmFromUrl());
  }, []);

  useEffect(() => {
    const auth = getFirebaseAuth();
    // Complete a Google sign-in that used the full-page redirect flow
    // (PWAs / popup fallback). Returns null on an ordinary load.
    getRedirectResult(auth)
      .then((cred) => { if (cred) postGoogleSignIn(cred); })
      .catch((err) => { console.warn("getRedirectResult failed:", err); });
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      // Fire any queued post-auth action exactly once. Captured into a
      // local first so a re-entrant promptLogin during the action
      // can't loop.
      if (u && pendingActionRef.current) {
        const action = pendingActionRef.current;
        pendingActionRef.current = null;
        Promise.resolve(action(u)).catch((err) => {
          console.error("Pending auth action failed:", err);
        });
      }
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Subscribe to user's plan changes in Firestore (security rules must allow reading own doc)
  useEffect(() => {
    if (!user) {
      setPlan("basic");
      setFamilyId(null);
      setSchoolId(null);
      setFamilyRole(null);
      return;
    }
    const db = getFirebaseDb();
    const unsub = onSnapshot(
      doc(db, "users", user.uid),
      (snap) => {
        const data = snap.data();
        const p = (data?.plan as UserPlan) || "basic";
        setPlan(p);
        setFamilyId((data?.familyId as string) ?? null);
        setSchoolId((data?.schoolId as string) ?? null);
        const fr = data?.familyRole;
        setFamilyRole(fr === "kid" || fr === "parent" ? fr : null);
      },
      () => {
        // If we can't read (e.g. security rules block it), default to basic.
        // familyRole stays null → treated as an adult, never a kid, so a
        // read failure can never lock a grown-up out of commercial pages.
        setPlan("basic");
        setFamilyId(null);
        setSchoolId(null);
        setFamilyRole(null);
      }
    );
    return unsub;
  }, [user]);

  // Ping the server to email Gadi about a new signup. Server-side
  // dedupe via notifiedSignup flag means duplicate calls are harmless;
  // we just need to fire it after any auth event that could be a first
  // signup. Fire-and-forget — email delivery must never block the UI.
  //
  // Also passes through any UTM params we captured on landing — the
  // server attaches them to /users/{uid} so /admin/campaigns can
  // attribute the signup to its source.
  async function notifySignupSafely(u: User) {
    try {
      const token = await u.getIdToken();
      const { getStoredUtms, clearStoredUtms } = await import("./utm");
      const utm = getStoredUtms();
      // Current UI language from the gadit-lang cookie (set by lang-context)
      // so the server can persist it and send every email / alert in the
      // user's own language, not English.
      const langMatch =
        typeof document !== "undefined" ? document.cookie.match(/(?:^|;\s*)gadit-lang=([^;]+)/) : null;
      const lang = langMatch ? decodeURIComponent(langMatch[1]) : undefined;
      const payload: Record<string, unknown> = {};
      if (utm) payload.utm = utm;
      if (lang) payload.lang = lang;
      await fetch("/api/notify-signup", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      // Clear after a successful attribution — second signup on the
      // same device should re-capture from the next campaign click.
      if (utm) clearStoredUtms();
    } catch (err) {
      console.warn("notify-signup failed (non-blocking):", err);
    }
  }

  // Affonso affiliate attribution — RESTORED 2026-08-05. Runs alongside
  // the in-house partner program: this pairs an Affonso ?ref cookie with
  // the brand-new user so a future Stripe sale is credited to the Affonso
  // marketplace affiliate who referred them. In-house partners are tracked
  // separately by RefCapture, and the two never collide (each ignores the
  // other's codes), so a signup is never double-attributed.
  //
  // Retry loop covers the pixel's afterInteractive load not being ready
  // when auth resolves. Best-effort, never blocks UX. Only fires for
  // genuinely-new users (returning logins would create duplicate leads).
  function trackAffonsoSignup(u: User) {
    if (typeof window === "undefined") return;
    type AffonsoApi = {
      signup: (
        data: { email?: string; externalUserId?: string; name?: string },
      ) => void;
    };
    const fire = (attempt: number): void => {
      const Affonso = (window as Window & { Affonso?: AffonsoApi }).Affonso;
      if (Affonso?.signup) {
        try {
          Affonso.signup({
            email: u.email ?? undefined,
            externalUserId: u.uid,
            name: u.displayName ?? undefined,
          });
        } catch (err) {
          console.warn("Affonso.signup failed (non-blocking):", err);
        }
        return;
      }
      if (attempt >= 5) return;
      window.setTimeout(() => fire(attempt + 1), 500);
    };
    fire(0);
  }

  // Post-sign-in side effects, shared by the popup path and the redirect
  // path (getRedirectResult on load). isNewUser disambiguates first-time
  // signup from a returning login so we only notify/track/welcome once.
  function postGoogleSignIn(cred: import("firebase/auth").UserCredential) {
    const extra = getAdditionalUserInfo(cred);
    if (extra?.isNewUser) {
      void notifySignupSafely(cred.user);
      trackAffonsoSignup(cred.user);
      track("signup_completed", { method: "google" });
      showWelcome();
    }
    setShowLoginModal(false);
  }

  async function signInWithGoogle() {
    const auth = getFirebaseAuth();
    const provider = new GoogleAuthProvider();
    // Popups don't work in an installed PWA (standalone display mode): the
    // popup can't open or postMessage back, so signInWithPopup throws and
    // the user sees "Could not sign in with Google" (Gadi 2026-08-11 on
    // his phone). In standalone, go straight to a full-page redirect;
    // getRedirectResult (in the auth-init effect) completes it on return.
    const standalone =
      typeof window !== "undefined" &&
      ((window.matchMedia?.("(display-mode: standalone)")?.matches ?? false) ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true);
    if (standalone) {
      await signInWithRedirect(auth, provider);
      return;
    }
    try {
      const cred = await signInWithPopup(auth, provider);
      postGoogleSignIn(cred);
    } catch (e) {
      const code = (e as { code?: string })?.code ?? "";
      // Any popup/environment failure → fall back to the redirect flow.
      if (
        code === "auth/popup-blocked" ||
        code === "auth/popup-closed-by-user" ||
        code === "auth/cancelled-popup-request" ||
        code === "auth/operation-not-supported-in-this-environment" ||
        code === "auth/internal-error"
      ) {
        await signInWithRedirect(auth, provider);
        return;
      }
      throw e;
    }
  }

  async function signInWithEmail(email: string, password: string) {
    const auth = getFirebaseAuth();
    await signInWithEmailAndPassword(auth, email, password);
    setShowLoginModal(false);
  }

  async function signUpWithEmail(email: string, password: string) {
    const auth = getFirebaseAuth();
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    // Fire-and-forget the verification email. We don't block sign-up
    // on it succeeding — the network call is unreliable and we'd
    // rather let the user in and surface the verification UX
    // separately. They can use the site (search, save, etc.) while
    // unverified; checkout is what's gated, enforced server-side.
    sendEmailVerification(cred.user).catch((err) => {
      console.warn("sendEmailVerification failed (non-blocking):", err);
    });
    void notifySignupSafely(cred.user);
    trackAffonsoSignup(cred.user);
    track("signup_completed", { method: "email" });
    setShowLoginModal(false);
    showWelcome();
  }

  async function sendPasswordReset(email: string) {
    const auth = getFirebaseAuth();
    // Firebase sends the reset email to whatever address we pass —
    // even one that's not registered, with NO error (intentional
    // anti-enumeration default). Caller gets a generic "if an account
    // exists with this email, a reset link is on the way" message.
    await sendPasswordResetEmail(auth, email);
  }

  async function logout() {
    const auth = getFirebaseAuth();
    await signOut(auth);
  }

  function promptLogin(opts?: PromptLoginOpts | string) {
    const normalized: PromptLoginOpts =
      typeof opts === "string" ? { reason: opts } : opts ?? {};
    const { reason = "", mode = "signin", onSuccess } = normalized;

    // If the user is already signed in, skip the modal and run the
    // action immediately — opening a login wall to a signed-in user
    // is a confusing dead-end (they'd have nothing to do with it).
    if (user && onSuccess) {
      Promise.resolve(onSuccess(user)).catch((err) => {
        console.error("Auth action (already signed in) failed:", err);
      });
      return;
    }

    pendingActionRef.current = onSuccess ?? null;
    setLoginReason(reason);
    setLoginMode(mode);
    setShowLoginModal(true);
    // Funnel event: the login/signup modal actually opened (signed-in
    // users short-circuit above and never see it). reason is capped so
    // long localized strings don't blow up the analytics property.
    track("signup_started", { mode, reason: reason.slice(0, 40) });
  }

  return (
    <AuthContext.Provider value={{
      user, loading, plan, familyId, schoolId, familyRole,
      signInWithGoogle, signInWithEmail, signUpWithEmail, sendPasswordReset, logout,
      showLoginModal, setShowLoginModal,
      loginReason, loginMode, promptLogin,
    }}>
      {children}
      {welcomeOpen && (
        <SignupWelcomeToast onClose={() => setWelcomeOpen(false)} />
      )}
    </AuthContext.Provider>
  );
}

/**
 * Floating "Welcome to Gadit!" pill rendered briefly after a brand-new
 * signup. Pinned to the top-centre of the viewport so it lands inside
 * the user's existing focus area (right where the login modal just
 * closed). Auto-dismisses after 6 seconds; the close button lets a
 * user dismiss it sooner if they want to jump straight into searching.
 */
function SignupWelcomeToast({ onClose }: { onClose: () => void }) {
  // Read the UI language and the just-signed-up display name (if
  // Firebase populated it, e.g. via Google) so we can personalise
  // the greeting without leaking name pieces from elsewhere.
  // useLang lives in a different module — we import lazily to avoid
  // a circular dependency on the lang provider mounting before auth.
  // The strings come from the existing v2 table.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useLang } = require("@/lib/lang-context") as typeof import("@/lib/lang-context");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { v2 } = require("@/lib/i18n-v2") as typeof import("@/lib/i18n-v2");
  const { lang, dir } = useLang();
  return (
    <div className="wb-welcome-toast" role="status" aria-live="polite" dir={dir}>
      <span className="wb-welcome-toast-icon">🎉</span>
      <div className="wb-welcome-toast-text">
        <strong>{v2(lang, "signupWelcomeTitle")}</strong>
        <span>{v2(lang, "signupWelcomeBody")}</span>
      </div>
      <button
        type="button"
        className="wb-welcome-toast-close"
        aria-label={v2(lang, "loginCloseAria")}
        onClick={onClose}
      >
        ×
      </button>
    </div>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
