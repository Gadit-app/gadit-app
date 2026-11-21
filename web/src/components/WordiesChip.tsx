"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useHref } from "@/lib/href";
import { useKidsMode } from "@/lib/use-kids-mode";
import { useWordies } from "@/lib/use-wordies";

/**
 * The child's Wordies, next to the avatar on every page (Gadi 2026-11-20:
 * "it is always written somewhere how many Wordies they have"). Shown to a
 * child profile, in Kids Mode, and to anyone who already has some. A tap
 * opens the shop. "Wordies" stays in Latin letters in every language.
 *
 * Hidden under 600px (globals.css, .gd-wordies-chip): on a phone the top bar
 * of a child profile has no room for it, and it pushed the menu button off
 * the screen (found 2026-11-21). The balance still shows in the shop.
 */
export function WordiesChip() {
  const { user, planReady, familyRole } = useAuth();
  const [kidsOn] = useKidsMode();
  const href = useHref();
  const n = useWordies(user, planReady);
  // Signed out: the hook keeps the last number, the chip is simply not shown.
  if (!user || !planReady || n === null) return null;
  if (!(familyRole === "kid" || kidsOn || n > 0)) return null;
  return (
    <Link
      href={href("/journey/shop")}
      aria-label={`${n} Wordies`}
      title="Wordies"
      className="gd-wordies-chip"
      style={{
        display: "inline-flex", alignItems: "center", gap: 6, minHeight: 32, padding: "3px 12px", borderRadius: 999,
        background: "linear-gradient(180deg, #ffe58a, #f5c542)", color: "#4a3300", fontWeight: 800, fontSize: 14,
        textDecoration: "none", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap",
      }}
    >
      <span aria-hidden="true" style={{ color: "#b47d00" }}>●</span>
      <span dir="ltr" style={{ unicodeBidi: "isolate" }}>{n} Wordies</span>
    </Link>
  );
}
