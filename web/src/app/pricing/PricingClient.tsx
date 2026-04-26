"use client";

/**
 * PricingPageRoute — composes the pricing screen on the dark stage.
 * Reuses MarketingHeader so signed-in users see their avatar and
 * signed-out users see a Sign-in pill.
 *
 * Named PricingPageRoute (rather than PricingPage) because the inner
 * component from @/components/design/pricing is already named
 * PricingPage and we don't want a name collision.
 */

import { MarketingHeader } from "@/components/design/MarketingHeader";
import { PricingPage } from "@/components/design/pricing";
import { HomeFooter } from "@/components/design/home";
import { useLang } from "@/lib/lang-context";

export function PricingPageRoute() {
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
