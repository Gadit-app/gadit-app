"use client";

/**
 * PracticePage — spaced-repetition practice screen on the current
 * "wordbook" design shell. Migrated off the old dark "galaxy" stage +
 * MarketingHeader on 2026-08-16. Tier gating unchanged:
 *   anonymous → login modal
 *   non-Deep → /pricing
 *   Deep → renders PracticeV2
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { v2 } from "@/lib/i18n-v2";
import { useHref } from "@/lib/href";
import { WbShellNav, WbShellBurger } from "@/components/design/WbShellChrome";
import { WbUserMenu } from "@/components/design/WbUserMenu";
import { LangSwitcher } from "@/components/design/LangSwitcher";
import { PracticeV2 } from "@/components/design/PracticeV2";

export function PracticePage() {
  const { user, plan, loading, promptLogin } = useAuth();
  const { lang, dir } = useLang();
  const href = useHref();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      promptLogin(v2(lang, "srEyebrow"));
      return;
    }
    if (plan !== "deep") {
      router.replace(href("/pricing"));
    }
  }, [loading, user, plan, lang, promptLogin, router, href]);

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

      <main
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "clamp(24px, 4vw, 48px) clamp(16px, 3vw, 40px) clamp(56px, 8vw, 90px)",
          minHeight: "calc(100dvh - 200px)",
        }}
      >
        {!loading && user && plan === "deep" && <PracticeV2 />}
      </main>

      <footer className="wb-home-footer">
        <span>© 2026 Gadit</span>
        <span>·</span>
        <Link href={href("/")}>{lang === "he" ? "בית" : "Home"}</Link>
      </footer>
    </div>
  );
}
