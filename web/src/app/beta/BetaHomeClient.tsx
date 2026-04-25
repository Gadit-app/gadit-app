"use client";

/**
 * BetaHomePage — composes the V2 homepage from individual home.tsx
 * components. The page lives on the dark navy stage with an
 * atmospheric starfield overlay; everything inside positions on top.
 *
 * The layout's <Header /> and <LoginModal /> are still rendered above
 * (from layout.tsx) — but the dark stage extends to the top of the
 * viewport, so this beta page intentionally sits behind/around them.
 * Once V2 ships and the legacy Header retires, the beta route can hide
 * the legacy chrome via a layout segment override.
 */

import {
  HomeHero,
  HomeSearch,
  ResultTease,
  ValueProps,
  TierStrip,
  HomeFooter,
} from "@/components/design/home";
import { MarketingHeader } from "@/components/design/MarketingHeader";
import { useLang } from "@/lib/lang-context";

export function BetaHomePage() {
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
        <TierStrip />
        <HomeFooter />
      </div>
    </div>
  );
}
