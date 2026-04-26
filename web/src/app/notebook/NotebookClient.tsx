"use client";

/**
 * NotebookPage — composes the Notebook screen on the dark stage.
 * Tier gate: anonymous → login modal; non-Deep → /pricing.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { v2 } from "@/lib/i18n-v2";
import { MarketingHeader } from "@/components/design/MarketingHeader";
import { NotebookV2 } from "@/components/design/NotebookV2";
import { HomeFooter } from "@/components/design/home";

export function NotebookPage() {
  const { user, plan, loading, promptLogin } = useAuth();
  const { lang, dir } = useLang();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      promptLogin(v2(lang, "notebookEyebrow"));
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
        {!loading && user && plan === "deep" && <NotebookV2 />}
        <HomeFooter />
      </div>
    </div>
  );
}
