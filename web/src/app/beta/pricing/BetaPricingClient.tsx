"use client";

/**
 * BetaPricingPage — composes the V2 pricing screen on the dark stage.
 * Reuses MarketingHeader from the homepage so signed-in users see
 * their avatar and signed-out users see a Sign-in pill.
 */

import { MarketingHeader } from "@/components/design/MarketingHeader";
import { PricingPage } from "@/components/design/pricing";
import { HomeFooter } from "@/components/design/home";
import { useLang } from "@/lib/lang-context";

export function BetaPricingPage() {
  const { dir } = useLang();

  return (
    <div className="gd-stage" style={{ minHeight: "100vh" }} dir={dir}>
      <div className="gd-stars" />
      <div style={{ position: "relative", zIndex: 1 }}>
        <MarketingHeader />
        <PricingPage />
        <HomeFooter />
      </div>
    </div>
  );
}
