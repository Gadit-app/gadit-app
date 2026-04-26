"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";

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
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  showLoginModal: boolean;
  setShowLoginModal: (v: boolean) => void;
  loginReason: string;
  /** Initial mode the LoginModal should open in. The modal itself
   *  still lets the user toggle. */
  loginMode: AuthMode;
  /** Open the login modal — or, if the user is already signed in,
   *  skip the modal and run `opts.onSuccess` directly. The string
   *  shorthand is preserved for the existing "just open it" callers. */
  promptLogin: (opts?: PromptLoginOpts | string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<UserPlan>("basic");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginReason, setLoginReason] = useState("");
  const [loginMode, setLoginMode] = useState<AuthMode>("signin");
  // Pending action runs once after the next successful auth event.
  // Stored in a ref so React state churn during the auth flow doesn't
  // race the firing condition.
  const pendingActionRef = useRef<AuthAction | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
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
  }, []);

  // Subscribe to user's plan changes in Firestore (security rules must allow reading own doc)
  useEffect(() => {
    if (!user) {
      setPlan("basic");
      return;
    }
    const db = getFirebaseDb();
    const unsub = onSnapshot(
      doc(db, "users", user.uid),
      (snap) => {
        const data = snap.data();
        const p = (data?.plan as UserPlan) || "basic";
        setPlan(p);
      },
      () => {
        // If we can't read (e.g. security rules block it), default to basic
        setPlan("basic");
      }
    );
    return unsub;
  }, [user]);

  async function signInWithGoogle() {
    const auth = getFirebaseAuth();
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    setShowLoginModal(false);
  }

  async function signInWithEmail(email: string, password: string) {
    const auth = getFirebaseAuth();
    await signInWithEmailAndPassword(auth, email, password);
    setShowLoginModal(false);
  }

  async function signUpWithEmail(email: string, password: string) {
    const auth = getFirebaseAuth();
    await createUserWithEmailAndPassword(auth, email, password);
    setShowLoginModal(false);
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
  }

  return (
    <AuthContext.Provider value={{
      user, loading, plan,
      signInWithGoogle, signInWithEmail, signUpWithEmail, logout,
      showLoginModal, setShowLoginModal,
      loginReason, loginMode, promptLogin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
