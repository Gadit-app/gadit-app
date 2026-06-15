"use client";

/**
 * /contact — full Help Center.
 *
 * Uses the wordbook shell (warm paper) — same chrome as /account,
 * /pricing, /features, /affiliates. Earlier version (June 10 first
 * pass) wrapped the content in gd-stage (dark space theme used by
 * login/marketing screens) which clashed badly with the light Help
 * Center cards. Gadi flagged it the moment he opened the page.
 *
 * The actual content is in @/components/HelpCenter (categorised
 * accordion of troubleshooting + FAQ) and the strings in
 * @/lib/help-i18n.ts.
 */

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useLang } from "@/lib/lang-context";
import { useAuth } from "@/lib/auth-context";
import { useHref } from "@/lib/href";
import { v2 } from "@/lib/i18n-v2";
import { ShareButton, APP_SHARE_COPY } from "@/components/ShareButton";
import { StartFreeCTA } from "@/components/StartFreeCTA";
import { GadVerbStamp } from "@/components/GadVerbStamp";
import { WbUserMenu } from "@/components/design/WbUserMenu";
import { LANGUAGES, type Lang } from "@/lib/i18n";
import { HelpCenter } from "@/components/HelpCenter";

function LangSwitch() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const active = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[1];
  return (
    <div ref={wrapRef} className="wb-lang-chip-wrap">
      <button type="button" className="wb-lang-chip" onClick={() => setOpen((v) => !v)}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" />
        </svg>
        {active.label}
      </button>
      {open && (
        <ul className="wb-lang-menu" role="listbox">
          {LANGUAGES.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                className={l.code === lang ? "is-active" : ""}
                onClick={() => { setLang(l.code as Lang); setOpen(false); }}
              >
                <img className="wb-lang-flag" src={`https://flagcdn.com/40x30/${l.flag}.png`} srcSet={`https://flagcdn.com/80x60/${l.flag}.png 2x`} width="20" height="15" alt="" loading="lazy" />
                {l.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ContactClient() {
  const { lang, dir } = useLang();
  const { user, plan, promptLogin } = useAuth();
  const href = useHref();

  return (
    <div className="wordbook wb-shell-page" dir={dir}>
      <header className="wb-shell-topbar">
        <Link href={href("/")} className="wb-wordmark" dir="ltr">
          Gad<span className="wb-wordmark-it">it</span>
        </Link>
        <nav className="wb-shell-nav">
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
          <Link href={href("/features")} className="wb-shell-navlink">
            {v2(lang, "navFeatures")}
          </Link>
          {user && (plan === "clear" || plan === "deep") && (
            <Link href={href("/notebook")} className="wb-shell-navlink">{v2(lang, "navNotebook")}</Link>
          )}
          {user && plan === "deep" && (
            <Link href={href("/play")} className="wb-shell-navlink">{v2(lang, "navPlay")}</Link>
          )}
          <Link href={href("/pricing")} className="wb-shell-navlink">{v2(lang, "navPricing")}</Link>
          {user && (plan === "clear" || plan === "deep") && (
            <Link href={href("/affiliates")} className="wb-shell-navlink">{v2(lang, "navAffiliates")}</Link>
          )}
        </nav>
        <div className="wb-shell-actions">
          {user && (
            <ShareButton
              url="https://www.gadit.app/"
              title={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).title}
              text=""
              shareLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).shareLabel}
              copiedLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).copiedLabel}
            />
          )}
          <LangSwitch />
          {user ? (
            <WbUserMenu />
          ) : (
            <>
              <StartFreeCTA />
              <button
                type="button"
                className="wb-shell-link"
                onClick={() => promptLogin({ mode: "signin" })}
              >
                {v2(lang, "signIn")}
              </button>
            </>
          )}
        </div>
        <div className="wb-shell-mobile-cta">
          <StartFreeCTA />
        </div>
      </header>

      <main
        style={{
          maxWidth: 880,
          margin: "0 auto",
          padding: "clamp(40px, 6vw, 72px) clamp(20px, 3vw, 32px) clamp(56px, 8vw, 96px)",
        }}
      >
        <HelpCenter />
      </main>

      <GadVerbStamp />
    </div>
  );
}
