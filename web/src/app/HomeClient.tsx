"use client";

/**
 * HomePage — composes the homepage from individual home.tsx components.
 * The page lives on the dark navy stage with an atmospheric starfield
 * overlay; everything inside positions on top.
 */

import {
  HomeHero,
  HomeSearch,
  ResultTease,
  ValueProps,
  HomeFooter,
} from "@/components/design/home";
import { HomePricingTeaser } from "@/components/design/pricing";
import { MarketingHeader } from "@/components/design/MarketingHeader";
import { useLang } from "@/lib/lang-context";

export function HomePage() {
  const { dir } = useLang();

  return (
    <div className="gd-stage" style={{ minHeight: "100vh" }} dir={dir}>
      <div className="gd-stars" />
      <div style={{ position: "relative", zIndex: 1 }}>
        <MarketingHeader />
        <HomeHero />
        <HomeSearch />
        <ResultTease />
        <ValueProps />
        {/* HomePricingTeaser uses the same TierCards as /pricing
            (warm-paper cards, active CTAs that go to Stripe Checkout)
            instead of the legacy in-page TierStrip teaser, so the
            homepage can convert directly without a click-through. */}
        <HomePricingTeaser />
        <HomeFooter />
      </div>
    </div>
  );
}
