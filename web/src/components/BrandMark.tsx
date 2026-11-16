"use client";

/**
 * The Gadit logo on every page (Gadi 2026-11-15: "the logo must appear
 * everywhere, on every page of the site, even small so it does not disturb
 * the eye, and always 'all rights reserved to Gadit'; and from every page
 * there must be a way back to Gadit, the index had none").
 *
 * Gadi 2026-11-16: only the word "Gadit", quiet, with no white box around it
 * and no rights line ("it must not catch the eye, just something on every
 * page that shows Gadit"). The rights line stays in the page footers.
 *
 * Most pages carry the logo in their header. BrandMark appears only where no
 * logo is in sight: it looks for a header logo that is really visible (not
 * covered) after every navigation.
 *   - On a page without a header: a small "Gadit" in the bottom left corner
 *     that leads home (one fixed place, Gadi 2026-11-16).
 *   - Over a full-screen game (the word worlds, Context Detective): a quiet
 *     mark in the bottom corner opposite the child's avatar, which never
 *     takes a tap (the game's own exit button is the way back).
 * Screens with their own top row (the fortress) place <GaditBrand /> there
 * instead, so nothing floats over their buttons.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import BRAND from "@/lib/brand-i18n.json";

const LOGOS = ".wb-wordmark, .wb-shell-wordmark, .wb-classroom-wordmark, .fam-wordmark, .cb-wordmark, img[alt='Gadit'], [data-gadit-brand]";
const GAME_STAGES = ".wst, .ctx-world";

const rightsOf = (lang: string) => ((BRAND as Record<string, { rights: string; home: string }>)[lang] ?? BRAND.en);

/** A logo near the top of the page that can really be seen (not this mark, not covered). */
function visibleLogo(): boolean {
  for (const el of Array.from(document.querySelectorAll<HTMLElement>(LOGOS))) {
    if (el.closest("[data-brandmark]")) continue;
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0 || r.bottom < 0) continue;
    if (r.top + window.scrollY > 220) continue;
    const st = getComputedStyle(el);
    if (st.visibility === "hidden" || st.opacity === "0") continue;
    // Covered by a full-screen game? Then it is not seen.
    const x = Math.min(window.innerWidth - 1, Math.max(0, r.left + r.width / 2));
    const y = Math.min(window.innerHeight - 1, Math.max(0, r.top + r.height / 2));
    const hit = r.top < window.innerHeight ? document.elementFromPoint(x, y) : null;
    if (hit && !(el === hit || el.contains(hit) || hit.contains(el))) continue;
    return true;
  }
  return false;
}

/** The logo alone, for a screen's own top row. */
export function GaditBrand({ tone = "light" }: { tone?: "light" | "dark" }) {
  const { lang } = useLang();
  const href = useHref();
  const t = rightsOf(lang);
  return (
    <span className={`gb-inline is-${tone}`} data-gadit-brand="">
      <style>{GB_INLINE_CSS}</style>
      <Link href={href("/")} className="gb-inline-word" dir="ltr" aria-label={t.home} title={t.home}>Gad<span className="gb-inline-it">it</span></Link>
    </span>
  );
}

export function BrandMark() {
  const { lang, dir } = useLang();
  const href = useHref();
  const pathname = usePathname() ?? "/";
  const [mode, setMode] = useState<"none" | "page" | "game">("none");
  const bare = pathname.replace(/^\/[a-z]{2}(?:-[A-Za-z]{2,4})?(?=\/|$)/, "") || "/";
  const admin = /^\/admin(\/|$)/.test(bare);

  useEffect(() => {
    if (admin) return;
    const check = () => setMode(visibleLogo() ? "none" : document.querySelector(GAME_STAGES) ? "game" : "page");
    // Pages render in steps, and a game opens over a page: look again now and then.
    const ids = [250, 900, 2200].map((ms) => window.setTimeout(check, ms));
    const every = window.setInterval(check, 2500);
    return () => { ids.forEach((id) => window.clearTimeout(id)); window.clearInterval(every); };
  }, [pathname, admin]);

  if (admin || mode === "none") return null;
  const t = rightsOf(lang);
  return (
    <div data-brandmark="" className={`gbm is-${mode}`} dir={dir}>
      <style>{GBM_CSS}</style>
      {mode === "page" ? (
        <Link href={href("/")} className="gbm-link" aria-label={t.home} title={t.home}>
          <span className="gbm-word" dir="ltr">Gad<span className="gbm-it">it</span></span>
        </Link>
      ) : (
        <span className="gbm-word" dir="ltr">Gad<span className="gbm-it">it</span></span>
      )}
    </div>
  );
}

const GBM_CSS = `
/* One fixed place in every language: the bottom left corner. */
.gbm { position: fixed; z-index: 70; left: calc(env(safe-area-inset-left, 0px) + 14px); bottom: calc(env(safe-area-inset-bottom, 0px) + 12px); pointer-events: none; line-height: 1; opacity: .78; }
.gbm.is-game { z-index: 61; opacity: .6; }
/* Above the games' "found a mistake" button, which sits in that corner too. */
body:has(.wb-play-header-report) .gbm { bottom: calc(env(safe-area-inset-bottom, 0px) + 46px); }
/* Left-to-right pages keep the help button in that corner: the word stands above it. */
:root[dir="ltr"] body:has(.hc-fab) .gbm { bottom: calc(env(safe-area-inset-bottom, 0px) + 78px); }
.gbm-link { pointer-events: auto; text-decoration: none; line-height: 1; }
/* No box: a soft light halo keeps the word readable over any picture. */
/* The official wordmark, exactly as in the site header (.wb-wordmark): Inter
   600, "it" teal italic 500. This mark lives outside .wordbook, so the font is
   named here and not taken from a .wordbook token (that fell back to Georgia,
   Gadi 2026-11-16: "the logo is in the wrong font"). */
.gbm .gbm-word { font-family: var(--font-inter, "Inter"), "Inter", system-ui, sans-serif; font-size: 18px; font-weight: 600; letter-spacing: -0.015em; color: #0B1220; line-height: 1; text-shadow: 0 0 4px rgba(255,255,255,.85), 0 0 10px rgba(255,255,255,.55); }
.gbm.is-game .gbm-word { font-size: 15px; }
/* Named on the span too: ":lang(he)" gives every element on a Hebrew page Rubik
   directly, so the "it" would not inherit the word's font. */
.gbm .gbm-it { font-family: var(--font-inter, "Inter"), "Inter", system-ui, sans-serif; color: #0E7490; font-style: italic; font-weight: 500; letter-spacing: inherit; line-height: 1; }
@media print { .gbm { display: none; } }
`;

const GB_INLINE_CSS = `
.gb-inline { display: inline-flex; line-height: 1; opacity: .85; }
.gb-inline .gb-inline-word { font-family: var(--font-inter, "Inter"), "Inter", system-ui, sans-serif; font-size: 19px; font-weight: 600; letter-spacing: -0.015em; text-decoration: none; color: #0B1220; }
.gb-inline .gb-inline-it { font-family: var(--font-inter, "Inter"), "Inter", system-ui, sans-serif; color: #0E7490; font-style: italic; font-weight: 500; letter-spacing: inherit; line-height: 1; }
.gb-inline.is-dark .gb-inline-word { color: #fff; }
.gb-inline.is-dark .gb-inline-it { color: #7fe0db; }
`;
