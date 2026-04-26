"use client";

/**
 * MarketingHeader — header for V2 surfaces.
 *
 * Two layouts driven by auth state:
 *   - Signed-out: Wordmark on start, Sign in pill on end. No nav —
 *     marketing-funnel surfaces don't need it.
 *   - Signed-in: Wordmark on start, primary nav in the middle
 *     (Search / Compare / Notebook / Pricing), avatar on end with a
 *     link to /beta/account.
 *
 * Compare and Notebook are tier-gated (Deep-only) but we still render
 * them in the nav for non-Deep users — clicking through bounces them
 * to /beta/pricing, which is consistent with the "promise not wall"
 * pattern from Screen 1 (locked features visible but gated). Hiding
 * them entirely for non-Deep would make the redesign feel inconsistent
 * (Take it further always shows all four actions, even when locked).
 *
 * The active nav item gets an electric-blue underline + brighter text;
 * inactive items are muted ink and animate to white on hover.
 *
 * Mobile (<640px): nav links collapse into a single "Menu" button
 * that opens a small dropdown panel below the header. We keep that
 * minimal — V2 navigation is shallow (5 routes), so a hamburger sheet
 * would be overkill.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { v2 } from "@/lib/i18n-v2";
import type { Lang } from "@/lib/i18n";
import { Wordmark } from "./primitives";

type NavItem = { href: string; labelKey: keyof import("@/lib/i18n-v2").V2Strings };

const NAV_ITEMS: NavItem[] = [
  { href: "/beta", labelKey: "navSearch" },
  { href: "/beta/compare", labelKey: "navCompare" },
  { href: "/beta/notebook", labelKey: "navNotebook" },
  { href: "/beta/pricing", labelKey: "navPricing" },
];

function isActive(currentPath: string | null, itemHref: string) {
  if (!currentPath) return false;
  if (itemHref === "/beta") {
    // Search is the homepage — only active on the bare /beta path
    // (don't highlight it on /beta/word/[w] since that's a sub-state of
    // search but not the search page itself).
    return currentPath === "/beta" || currentPath.startsWith("/beta/word");
  }
  return currentPath === itemHref || currentPath.startsWith(itemHref + "/");
}

function NavLink({
  item,
  active,
  lang,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  lang: Lang;
  onClick?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className="gd-font-sans-ui transition-colors relative"
      style={{
        fontSize: 13,
        fontWeight: 500,
        color: active ? "oklch(0.97 0.008 265)" : "oklch(0.72 0.02 265)",
        padding: "6px 2px",
      }}
    >
      {v2(lang, item.labelKey)}
      {active && (
        <span
          style={{
            position: "absolute",
            insetBlockEnd: -2,
            insetInlineStart: 0,
            insetInlineEnd: 0,
            height: 2,
            background: "oklch(0.72 0.19 245)",
            borderRadius: 999,
            boxShadow: "0 0 8px oklch(0.72 0.19 245 / 0.6)",
          }}
        />
      )}
    </Link>
  );
}

export function MarketingHeader() {
  const { user, promptLogin } = useAuth();
  const { lang } = useLang();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const initial = (user?.displayName ?? user?.email ?? "U")[0].toUpperCase();

  return (
    <header
      className="w-full"
      style={{
        position: "relative",
        borderBottom: "1px solid oklch(1 0 0 / 0.06)",
      }}
    >
      <div
        className="flex items-center justify-between gap-6"
        style={{ padding: "20px clamp(20px, 3vw, 32px)" }}
      >
        <Link href="/beta" className="flex items-center" aria-label="Gadit">
          <Wordmark />
        </Link>

        {/* Desktop nav — signed-in only */}
        {user && (
          <nav
            className="hidden md:flex items-center gap-7"
            style={{ flex: 1, justifyContent: "center" }}
            aria-label="Primary"
          >
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={isActive(pathname, item.href)}
                lang={lang}
              />
            ))}
          </nav>
        )}

        {/* Right side: avatar (signed in) or Sign in (signed out) */}
        <div className="flex items-center gap-2">
          {/* Mobile menu trigger — signed-in only */}
          {user && (
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden inline-flex items-center justify-center"
              aria-label="Menu"
              aria-expanded={mobileOpen}
              style={{
                width: 36,
                height: 36,
                borderRadius: 999,
                background: "oklch(1 0 0 / 0.06)",
                boxShadow: "inset 0 0 0 1px oklch(1 0 0 / 0.12)",
                color: "oklch(0.92 0.01 265)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M3 5h12M3 9h12M3 13h12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}

          {user ? (
            <Link
              href="/beta/account"
              aria-label="Account"
              className="inline-flex items-center justify-center transition-shadow hover:shadow-md"
              style={{
                width: 36,
                height: 36,
                borderRadius: 999,
                background:
                  "linear-gradient(135deg, oklch(0.7 0.08 45), oklch(0.55 0.12 30))",
                boxShadow: "0 0 0 1px oklch(1 0 0 / 0.08)",
                color: "white",
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              {initial}
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => promptLogin(v2(lang, "signIn"))}
              className="gd-font-sans-ui font-medium transition-colors"
              style={{
                fontSize: 13,
                padding: "8px 18px",
                borderRadius: 999,
                color: "oklch(0.92 0.01 265)",
                background: "oklch(1 0 0 / 0.06)",
                boxShadow: "inset 0 0 0 1px oklch(1 0 0 / 0.12)",
              }}
            >
              {v2(lang, "signIn")}
            </button>
          )}
        </div>
      </div>

      {/* Mobile dropdown — signed-in only, only when open */}
      {user && mobileOpen && (
        <nav
          className="md:hidden flex flex-col"
          style={{
            padding: "8px clamp(20px, 3vw, 32px) 16px",
            borderTop: "1px solid oklch(1 0 0 / 0.06)",
            background: "oklch(0.16 0.04 265 / 0.85)",
            backdropFilter: "blur(8px)",
          }}
          aria-label="Primary"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="gd-font-sans-ui transition-colors"
              style={{
                fontSize: 14,
                fontWeight: 500,
                padding: "12px 4px",
                color: isActive(pathname, item.href)
                  ? "oklch(0.97 0.008 265)"
                  : "oklch(0.78 0.02 265)",
                borderBottom: "1px solid oklch(1 0 0 / 0.04)",
              }}
            >
              {v2(lang, item.labelKey)}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
