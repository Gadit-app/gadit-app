"use client";

import { useEffect, useState } from "react";
import { PRICE_DISPLAY, type PriceBlock } from "@/lib/pricing-currency";

/**
 * Pricing hook: starts from the USD block (identical to the server default, so
 * the first paint never flashes a wrong price), then fetches /api/pricing to
 * pick up the caller's country currency. usd-only today, so this is a no-op
 * that returns USD; it lights up automatically once markets are added.
 */
const FALLBACK: PriceBlock = PRICE_DISPLAY.usd;

export function usePricing(): PriceBlock {
  const [block, setBlock] = useState<PriceBlock>(FALLBACK);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/pricing")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: PriceBlock | null) => {
        if (!cancelled && d && typeof d.currency === "string") setBlock(d);
      })
      .catch(() => { /* keep USD fallback */ });
    return () => { cancelled = true; };
  }, []);
  return block;
}
