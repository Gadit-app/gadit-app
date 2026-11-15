"use client";

/**
 * The Gadit logo on every page (Gadi 2026-11-15: "the logo must appear
 * everywhere, on every page of the site, even small so it does not disturb
 * the eye, and always 'all rights reserved to Gadit'; and from every page
 * there must be a way back to Gadit, the index had none").
 *
 * Most pages carry the logo in their header. BrandMark appears only where no
 * logo is in sight: it looks for a header logo that is really visible (not
 * covered) after every navigation.
 *   - On a page without a header: a small "Gadit" in the top corner that
 *     leads home, with the rights line under it.
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

/** The logo and the rights line, for a screen's own top row. */
export function GaditBrand({ tone = "light" }: { tone?: "light" | "dark" }) {
  const { lang } = useLang();
  const href = useHref();
  const t = rightsOf(lang);
  return (
    <span className={`gb-inline is-${tone}`} data-gadit-brand="">
      <style>{GB_INLINE_CSS}</style>
      <Link href={href("/")} className="gb-inline-word" dir="ltr" aria-label={t.home} title={t.home}>Gad<span className="gb-inline-it">it</span></Link>
      <small className="gb-inline-rights">© {t.rights}</small>
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
      <span className="gbm-rights">© {t.rights}</span>
    </div>
  );
}

const GBM_CSS = `
.gbm { position: fixed; z-index: 70; display: grid; justify-items: center; gap: 1px; padding: 4px 10px 3px; border-radius: 12px; background: rgba(255,255,255,.74); box-shadow: 0 1px 6px rgba(0,0,0,.12); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); pointer-events: none; }
.gbm.is-page { top: calc(env(safe-area-inset-top, 0px) + 8px); inset-inline-end: 10px; }
.gbm.is-game { z-index: 61; bottom: calc(env(safe-area-inset-bottom, 0px) + 10px); inset-inline-end: 10px; opacity: .82; padding: 3px 8px 2px; }
.gbm-link { pointer-events: auto; text-decoration: none; line-height: 1; }
.gbm-word { font-family: var(--wb-serif, Georgia, "Times New Roman", serif); font-size: 19px; font-weight: 500; letter-spacing: -0.02em; color: #14202b; line-height: 1; }
.gbm.is-game .gbm-word { font-size: 15px; }
.gbm-it { color: #0a7472; font-style: italic; font-weight: 400; }
.gbm-rights { font-size: 9.5px; line-height: 1.2; color: #47586a; white-space: nowrap; font-family: system-ui, sans-serif; }
.gbm.is-game .gbm-rights { font-size: 8.5px; }
@media print { .gbm { display: none; } }
`;

const GB_INLINE_CSS = `
.gb-inline { display: inline-grid; justify-items: center; gap: 0; line-height: 1; }
.gb-inline-word { font-family: var(--wb-serif, Georgia, "Times New Roman", serif); font-size: 20px; font-weight: 500; letter-spacing: -0.02em; text-decoration: none; color: #14202b; }
.gb-inline-it { color: #0a7472; font-style: italic; font-weight: 400; }
.gb-inline-rights { font-size: 9px; line-height: 1.3; white-space: nowrap; color: #47586a; font-family: system-ui, sans-serif; }
.gb-inline.is-dark .gb-inline-word { color: #fff; }
.gb-inline.is-dark .gb-inline-it { color: #7fe0db; }
.gb-inline.is-dark .gb-inline-rights { color: rgba(255,255,255,.72); }
`;
