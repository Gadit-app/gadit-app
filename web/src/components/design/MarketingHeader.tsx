"use client";

/**
 * MarketingHeader — the lean header for signed-out marketing surfaces.
 *
 * Used on /beta (V2 homepage) and /pricing-v2. Just Wordmark + a Sign-in
 * pill. No nav (Compare/Notebook are paid-only and not surfaced here),
 * no language picker (post-launch), no avatar (signed-out by definition).
 *
 * If the user is already signed in when this header renders, the pill
 * is replaced with the user's first initial — same visual rhythm, no
 * dead end.
 */

import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { v2 } from "@/lib/i18n-v2";
import { Wordmark } from "./primitives";

export function MarketingHeader() {
  const { user, promptLogin } = useAuth();
  const { lang } = useLang();

  return (
    <header
      className="w-full flex items-center justify-between"
      style={{
        padding: "20px 32px",
        borderBottom: "1px solid oklch(1 0 0 / 0.06)",
      }}
    >
      <Wordmark />

      {user ? (
        <a
          href="/account"
          aria-label="Account"
          className="inline-flex items-center justify-center"
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            background:
              "linear-gradient(135deg, oklch(0.7 0.08 45), oklch(0.55 0.12 30))",
            boxShadow: "0 0 0 1px oklch(1 0 0 / 0.08)",
            color: "white",
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          {(user.displayName ?? user.email ?? "U")[0].toUpperCase()}
        </a>
      ) : (
        <button
          type="button"
          onClick={() => promptLogin(v2(lang, "signIn"))}
          className="gd-font-sans-ui font-medium transition-colors"
          style={{
            fontSize: 13,
            padding: "8px 18px",
            borderRadius: 999,
            color: "oklch(0.92 0.01 265)",
            background: "oklch(1 0 0 / 0.06)",
            boxShadow: "inset 0 0 0 1px oklch(1 0 0 / 0.12)",
          }}
        >
          {v2(lang, "signIn")}
        </button>
      )}
    </header>
  );
}
