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
import { isPwaInstalledOrDone } from "@/components/InstallPwaPrompt";
import { requestInstallOpen } from "@/lib/install-bus";
import { isInAppBrowser } from "@/lib/in-app-browser";
import { track } from "@/lib/track";

// "Install the app" burger entry — permanent, discoverable install
// path. Users kept asking Gadi "how do I download it?" because the
// bottom banner is the ONLY install surface and one dismissal hid it
// for days (2026-07-09). Label per language, local to the chrome.
const INSTALL_LABELS: Record<string, string> = {
  he: "התקינו את האפליקציה",
  en: "Install the app",
  ar: "ثبّت التطبيق",
  ru: "Установить приложение",
  es: "Instalar la app",
  pt: "Instalar o app",
  fr: "Installer l'app",
  de: "App installieren",
  cs: "Nainstalovat aplikaci",
  sk: "Nainštalovať aplikáciu",
  it: "Installa l'app",
  ja: "アプリをインストール",
  hi: "ऐप इंस्टॉल करें",
  am: "መተግበሪያውን ይጫኑ",
};

export type NavKey =
  | "home"
  | "features"
  | "notebook"
  | "play"
  | "schools"
  | "families"
  | "pricing"
  | "affiliates";

type NavLink = { key: NavKey; href: string; label: string };

// "Families" nav label. Kept local rather than in i18n-v2 so we don't have
// to touch all 22 language blocks for one word (Gadi 2026-07-29: make the
// three products — individuals, Families, Schools — visible in the top nav).
const FAMILIES_LABEL: Record<string, string> = {
  he: "משפחות", en: "Families", ar: "العائلات", ru: "Семьи", es: "Familias",
  pt: "Famílias", fr: "Familles", de: "Familien", cs: "Rodiny", sk: "Rodiny",
  it: "Famiglie", ja: "ファミリー", hi: "परिवार", am: "ቤተሰቦች",
};

// Kids see their notebook as their "treasure box" (Gadi 2026-08-12). Short
// nav form; en fallback for languages not listed.
const TREASURE_NAV: Record<string, string> = {
  he: "האוצר שלי", en: "My treasure", ar: "كنزي", ru: "Сокровища",
};

function useNavLinks(): NavLink[] {
  const { user, plan, familyRole } = useAuth();
  const { lang } = useLang();
  const href = useHref();

  // A kid on a Family plan gets a stripped-down, commerce-free nav
  // (council 2026-08-04): only their own words + games. No Features,
  // Families, Schools, Pricing or Partners — a child can't buy, can't
  // recruit, can't switch schools, so those links are noise or a trap.
  // The parent/subscriber nav below is unchanged (Gadi's call).
  if (familyRole === "kid") {
    return [
      { key: "notebook", href: href("/notebook"), label: TREASURE_NAV[lang] ?? TREASURE_NAV.en },
      { key: "play", href: href("/play"), label: v2(lang, "navPlay") },
    ];
  }

  const paid = !!user && (plan === "clear" || plan === "deep");
  const links: NavLink[] = [
    { key: "features", href: href("/features"), label: v2(lang, "navFeatures") },
  ];
  if (paid) links.push({ key: "notebook", href: href("/notebook"), label: v2(lang, "navNotebook") });
  if (user && plan === "deep") links.push({ key: "play", href: href("/play"), label: v2(lang, "navPlay") });
  links.push({ key: "families", href: href("/families"), label: FAMILIES_LABEL[lang] ?? FAMILIES_LABEL.en });
  links.push({ key: "schools", href: href("/schools"), label: v2(lang, "navSchools") });
  links.push({ key: "pricing", href: href("/pricing"), label: v2(lang, "navPricing") });
  if (paid) links.push({ key: "affiliates", href: href("/partners"), label: v2(lang, "navAffiliates") });
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
  // Show the install entry only where installing is actually possible:
  // a real mobile browser (not an Instagram/Facebook webview), not
  // already running as the installed app. Resolved post-hydration so
  // SSR markup stays UA-independent.
  const [showInstall, setShowInstall] = useState(false);
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const isMobile = /iphone|ipod|ipad|android/.test(ua) ||
      (/mac/.test(ua) && navigator.maxTouchPoints > 1);
    setShowInstall(isMobile && !isPwaInstalledOrDone() && !isInAppBrowser());
  }, []);
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
          {showInstall && (
            <>
              <div className="wb-shell-mobile-menu-sep" />
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  track("install_menu_tapped", { lang });
                  requestInstallOpen();
                }}
              >
                {INSTALL_LABELS[lang] ?? INSTALL_LABELS.en}
              </button>
            </>
          )}
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
