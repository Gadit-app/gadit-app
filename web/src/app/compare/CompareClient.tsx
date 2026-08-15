"use client";

/**
 * ComparePage — composes the confusable-word compare screen on the
 * current "wordbook" design shell (light page + standard topbar), the
 * same chrome as /notebook, /pricing, /schools. Migrated off the old
 * dark "galaxy" stage + MarketingHeader on 2026-08-16.
 */

import Link from "next/link";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { useAuth } from "@/lib/auth-context";
import { WbShellNav, WbShellBurger } from "@/components/design/WbShellChrome";
import { WbUserMenu } from "@/components/design/WbUserMenu";
import { LangSwitcher } from "@/components/design/LangSwitcher";
import { CompareV2 } from "@/components/design/CompareV2";

export function ComparePage() {
  const { lang, dir } = useLang();
  const { user } = useAuth();
  const href = useHref();

  return (
    <div
      className="wordbook"
      dir={dir}
      style={{ minHeight: "100dvh", background: "var(--paper, #F4F5F8)" }}
    >
      <header className="wb-shell-topbar">
        <Link href={href("/")} className="wb-wordmark" dir="ltr">
          Gad<span className="wb-wordmark-it">it</span>
        </Link>
        <WbShellNav />
        <div className="wb-shell-actions">
          <LangSwitcher variant="muted" />
          {user ? <WbUserMenu /> : null}
        </div>
        <div className="wb-shell-mobile-identity">
          <WbShellBurger />
        </div>
      </header>

      <main style={{ position: "relative" }}>
        <CompareV2 />
      </main>

      <footer className="wb-home-footer">
        <span>© 2026 Gadit</span>
        <span>·</span>
        <Link href={href("/")}>{lang === "he" ? "בית" : "Home"}</Link>
      </footer>
    </div>
  );
}
