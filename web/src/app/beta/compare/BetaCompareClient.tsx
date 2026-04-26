"use client";

/**
 * BetaComparePage — composes the V2 compare screen on the dark stage.
 * Reuses MarketingHeader + HomeFooter for consistency with /beta and
 * /beta/pricing.
 */

import { MarketingHeader } from "@/components/design/MarketingHeader";
import { CompareV2 } from "@/components/design/CompareV2";
import { HomeFooter } from "@/components/design/home";
import { useLang } from "@/lib/lang-context";

export function BetaComparePage() {
  const { dir } = useLang();

  return (
    <div className="gd-stage" style={{ minHeight: "100vh" }} dir={dir}>
      <div className="gd-stars" />
      <div style={{ position: "relative", zIndex: 1 }}>
        <MarketingHeader />
        <CompareV2 />
        <HomeFooter />
      </div>
    </div>
  );
}
