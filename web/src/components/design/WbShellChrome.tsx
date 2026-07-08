"use client";

/**
 * WbShellNav + WbShellBurger — THE canonical topbar navigation.
 *
 * Before 2026-07-08 every shell page carried its own inline copy of
 * the nav, each with a different subset of links: Schools existed only
 * on the homepage, Play's nav lacked Schools, and five pages (word,
 * notebook, play, account, contact) had no mobile burger at all — on
 * a phone those pages showed no navigation whatsoever. Gadi: "דברים
 * לא צריכים להיעלם מהתפריט" (links must not vanish when moving
 * between pages).
 *
 * One component pair, one link list, one gating policy:
 *   - Search icon → home        (hidden on the homepage itself — the
 *                                 big search box IS the homepage)
 *   - Features                   always
 *   - Notebook                   signed-in Clear/Deep
 *   - Play                       signed-in Deep
 *   - Schools                    always
 *   - Pricing                    always
 *   - Affiliates                 signed-in Clear/Deep
 *
 * Plan gating is identical on every page, so the set the user sees is
 * stable across the whole app (it only changes when they sign in or
 * upgrade, which is expected).
 *
 * The kid classroom topbar (/c/CODE) intentionally does NOT use this —
 * its two links (Class Notebook / Word Games) are a separate, minimal
 * surface for shared classroom devices.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { v2 } from "@/lib/i18n-v2";
import { useHref } from "@/lib/href";

export type NavKey =
  | "home"
  | "features"
  | "notebook"
  | "play"
  | "schools"
  | "pricing"
  | "affiliates";

type NavLink = { key: NavKey; href: string; label: string };

function useNavLinks(): NavLink[] {
  const { user, plan } = useAuth();
  const { lang } = useLang();
  const href = useHref();
  const paid = !!user && (plan === "clear" || plan === "deep");
  const links: NavLink[] = [
    { key: "features", href: href("/features"), label: v2(lang, "navFeatures") },
  ];
  if (paid) links.push({ key: "notebook", href: href("/notebook"), label: v2(lang, "navNotebook") });
  if (user && plan === "deep") links.push({ key: "play", href: href("/play"), label: v2(lang, "navPlay") });
  links.push({ key: "schools", href: href("/schools"), label: v2(lang, "navSchools") });
  links.push({ key: "pricing", href: href("/pricing"), label: v2(lang, "navPricing") });
  if (paid) links.push({ key: "affiliates", href: href("/affiliates"), label: v2(lang, "navAffiliates") });
  return links;
}

/** Desktop centre nav. Drop-in replacement for the old inline
 *  <nav className="wb-shell-nav"> blocks. */
export function WbShellNav({ active }: { active?: NavKey }) {
  const links = useNavLinks();
  const { lang } = useLang();
  const href = useHref();
  return (
    <nav className="wb-shell-nav">
      {active !== "home" && (
        <Link
          href={href("/")}
          className="wb-shell-navlink wb-shell-navlink-icon"
          aria-label={v2(lang, "navSearch")}
          title={v2(lang, "navSearch")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="6.5" />
            <path d="m20 20-4-4" />
          </svg>
        </Link>
      )}
      {links.map((l) => (
        <Link
          key={l.key}
          href={l.href}
          className={`wb-shell-navlink${active === l.key ? " is-active" : ""}`}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}

/** Mobile burger + dropdown. Render inside the topbar's
 *  .wb-shell-mobile-menu-cluster; owns its own open state, closes on
 *  outside tap / Escape / navigation. */
export function WbShellBurger({ active }: { active?: NavKey }) {
  const links = useNavLinks();
  const { user, promptLogin } = useAuth();
  const { lang } = useLang();
  const href = useHref();
  const [open, setOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (
        !menuRef.current?.contains(e.target as Node) &&
        !burgerRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        ref={burgerRef}
        type="button"
        className="wb-shell-burger"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        )}
      </button>
      {open && (
        <div ref={menuRef} className="wb-shell-mobile-menu" role="menu">
          {active !== "home" && (
            <Link href={href("/")} className="wb-shell-mobile-link" onClick={() => setOpen(false)}>
              {v2(lang, "navSearch")}
            </Link>
          )}
          {links.map((l) => (
            <Link
              key={l.key}
              href={l.href}
              className={`wb-shell-mobile-link${active === l.key ? " is-active" : ""}`}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div className="wb-shell-mobile-menu-sep" />
          {user ? (
            <Link href={href("/account")} onClick={() => setOpen(false)}>
              {(user.email?.[0] || "G").toUpperCase()} · {user.email ?? "Account"}
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                promptLogin({ mode: "signin" });
              }}
            >
              {v2(lang, "signIn")}
            </button>
          )}
        </div>
      )}
    </>
  );
}
