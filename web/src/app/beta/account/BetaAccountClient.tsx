"use client";

/**
 * BetaAccountPage — composes the V2 account dashboard on the dark
 * stage. Anonymous users get the login modal; all signed-in tiers
 * (Basic / Clear / Deep) see the page — they need to view their plan
 * to upgrade.
 */

import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { v2 } from "@/lib/i18n-v2";
import { MarketingHeader } from "@/components/design/MarketingHeader";
import { AccountV2 } from "@/components/design/AccountV2";
import { HomeFooter } from "@/components/design/home";

export function BetaAccountPage() {
  const { user, loading, promptLogin } = useAuth();
  const { lang, dir } = useLang();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      promptLogin(v2(lang, "accountEyebrow"));
    }
  }, [loading, user, lang, promptLogin]);

  return (
    <div className="gd-stage" style={{ minHeight: "100vh" }} dir={dir}>
      <div className="gd-stars" />
      <div style={{ position: "relative", zIndex: 1 }}>
        <MarketingHeader />
        <main
          style={{
            padding: "clamp(36px, 6vw, 72px) clamp(16px, 3vw, 40px) clamp(64px, 8vw, 90px)",
          }}
        >
          {!loading && user && <AccountV2 />}
        </main>
        <HomeFooter />
      </div>
    </div>
  );
}
