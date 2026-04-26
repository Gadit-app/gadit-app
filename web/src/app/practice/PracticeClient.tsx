"use client";

/**
 * PracticePage — composes the spaced-repetition practice screen on
 * the dark stage. Tier gating identical to /notebook:
 *   anonymous → login modal
 *   non-Deep → /pricing
 *   Deep → renders PracticeV2
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { v2 } from "@/lib/i18n-v2";
import { MarketingHeader } from "@/components/design/MarketingHeader";
import { PracticeV2 } from "@/components/design/PracticeV2";
import { HomeFooter } from "@/components/design/home";

export function PracticePage() {
  const { user, plan, loading, promptLogin } = useAuth();
  const { lang, dir } = useLang();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      promptLogin(v2(lang, "srEyebrow"));
      return;
    }
    if (plan !== "deep") {
      router.replace("/pricing");
    }
  }, [loading, user, plan, lang, promptLogin, router]);

  return (
    <div className="gd-stage" style={{ minHeight: "100vh" }} dir={dir}>
      <div className="gd-stars" />
      <div style={{ position: "relative", zIndex: 1 }}>
        <MarketingHeader />
        <main
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "clamp(40px, 8vw, 90px) clamp(16px, 3vw, 40px) clamp(56px, 8vw, 90px)",
            minHeight: "calc(100vh - 200px)",
          }}
        >
          {!loading && user && plan === "deep" && <PracticeV2 />}
        </main>
        <HomeFooter />
      </div>
    </div>
  );
}
