"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";

export default function LoginModal() {
  const { showLoginModal, setShowLoginModal, loginReason, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const { t, dir } = useLang();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!showLoginModal) return null;

  async function handleGoogle() {
    setBusy(true);
    setError("");
    try {
      await signInWithGoogle();
    } catch {
      setError("Could not sign in with Google. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (mode === "login") {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("user-not-found") || msg.includes("wrong-password") || msg.includes("invalid-credential")) {
        setError("Wrong email or password.");
      } else if (msg.includes("email-already-in-use")) {
        setError("Email already in use. Try logging in.");
      } else if (msg.includes("weak-password")) {
        setError("Password must be at least 6 characters.");
      } else {
        setError("Something went wrong. Try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={() => setShowLoginModal(false)}
    >
      <div
        className="bg-white rounded-3xl shadow-xl w-full max-w-sm mx-4 p-8 space-y-5"
        dir={dir}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold" style={{ color: "#0F172A" }}>
            <span style={{ color: "#2563EB" }}>Gad</span>it
          </h2>
          {loginReason ? (
            <p className="text-slate-500 text-sm mt-1">{loginReason}</p>
          ) : (
            <p className="text-slate-500 text-sm mt-1">
              {mode === "login" ? t.welcomeBack : t.createAccount}
            </p>
          )}
        </div>

        {/* Google */}
        <button
          onClick={handleGoogle}
          disabled={busy}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-all disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
          </svg>
          {t.continueWithGoogle}
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-100" />
          <span className="text-xs text-slate-400">or</span>
          <div className="flex-1 h-px bg-slate-100" />
        </div>

        {/* Email form */}
        <form onSubmit={handleEmail} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.emailPlaceholder}
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t.passwordPlaceholder}
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm disabled:opacity-50 transition-all"
            style={{ background: "#2563EB" }}
          >
            {busy ? "…" : mode === "login" ? t.logIn : t.createAccount}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          {mode === "login" ? (
            <>{t.noAccount}{" "}
              <button onClick={() => { setMode("signup"); setError(""); }} className="text-blue-500 hover:underline">{t.signUp}</button>
            </>
          ) : (
            <>{t.haveAccount}{" "}
              <button onClick={() => { setMode("login"); setError(""); }} className="text-blue-500 hover:underline">{t.logIn}</button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
