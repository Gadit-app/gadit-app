"use client";

/**
 * ToolPage: one frame for the learning tools (Gadi 2026-10-11: the word
 * bank, games, dictation, Every Word and Say it each looked like a
 * different site). The same top bar with the tool's nav item active, the
 * same centred title and subtitle, the same footer, and a kid's skin.
 * Pages pass their own content width; the frame is identical.
 */
import { GaditIcon } from "@/components/design/GaditIcon";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { useAuth } from "@/lib/auth-context";
import { LANGUAGES, langNameIn, type Lang } from "@/lib/i18n";
import { v2 } from "@/lib/i18n-v2";
import { ShareButton, APP_SHARE_COPY } from "@/components/ShareButton";
import { LangSwitchMobile } from "@/components/LangSwitchMobile";
import { WbShellNav, WbShellBurger, type NavKey } from "@/components/design/WbShellChrome";
import { WbUserMenu } from "@/components/design/WbUserMenu";
import { AppearancePicker } from "@/components/AppearancePicker";
import { ToolKidsToggle } from "@/components/design/ToolKidsToggle";

export function ToolPage({ active, title, titleExtra, sub, width = 880, children }: {
  active: NavKey;
  title?: ReactNode;
  /** Beside the title, e.g. a guide button. */
  titleExtra?: ReactNode;
  sub?: ReactNode;
  /** Content width in px; the bar and the title are the same everywhere. */
  width?: number;
  children: ReactNode;
}) {
  const { lang, dir } = useLang();
  const href = useHref();
  const { user, familyRole } = useAuth();
  const isKid = familyRole === "kid";
  const share = APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en;
  return (
    <div className={`wordbook wb-shell-page${isKid ? " wb-kid-area" : ""}`} dir={dir}>
      <header className="wb-shell-topbar">
        <Link href={href("/")} className="wb-wordmark" dir="ltr">
          Gad<span className="wb-wordmark-it">it</span>
        </Link>
        <ToolKidsToggle />
        <WbShellNav active={active} />
        <div className="wb-shell-actions">
          {isKid && <AppearancePicker scope="kid" />}
          <ShareButton url="https://www.gadit.app/" title={share.title} text="" shareLabel={share.shareLabel} copiedLabel={share.copiedLabel} />
          <ToolLangSwitch />
          {user ? <WbUserMenu /> : null}
        </div>
        {user && (
          <div className="wb-shell-mobile-identity">
            {isKid && <AppearancePicker scope="kid" />}
            <ShareButton url="https://www.gadit.app/" title={share.title} text="" shareLabel={share.shareLabel} copiedLabel={share.copiedLabel} />
            <WbUserMenu />
          </div>
        )}
        <div className="wb-shell-mobile-menu-cluster">
          <WbShellBurger active={active} />
          <LangSwitchMobile />
        </div>
      </header>

      <main className="wb-tool-main" style={{ maxWidth: width }}>
        {title && (
          <div className="wb-tool-hero">
            <h1 className="wb-tool-title">
              {(active === "notebook" || active === "spell" || active === "read" || active === "say" || active === "play") && <GaditIcon name={active} size={48} className="wb-title-icon is-3d" />}
              {title}
              {titleExtra}
            </h1>
            {sub && <p className="wb-tool-sub">{sub}</p>}
          </div>
        )}
        {children}
      </main>

      <footer className="wb-home-footer">
        <span>© 2026 Gadit</span>
        <span>·</span>
        <Link href={href("/pricing")}>{v2(lang, "navPricing")}</Link>
        <span>·</span>
        <Link href={href("/privacy")}>{v2(lang, "footerPrivacy")}</Link>
        <span>·</span>
        <Link href={href("/terms")}>{v2(lang, "footerTerms")}</Link>
      </footer>
    </div>
  );
}

/** The desktop language chip (the same one the other pages carry). */
function ToolLangSwitch() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => { if (!wrapRef.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);
  const active = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];
  return (
    <div ref={wrapRef} className="wb-lang-chip-wrap">
      <button type="button" className="wb-lang-chip" onClick={() => setOpen((v) => !v)}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" />
        </svg>
        {langNameIn(active.code, lang)}
      </button>
      {open && (
        <ul className="wb-lang-menu" role="listbox">
          {LANGUAGES.map((l) => (
            <li key={l.code}>
              <button type="button" className={l.code === lang ? "is-active" : ""} onClick={() => { setLang(l.code as Lang); setOpen(false); }}>
                <span style={{ display: "inline-flex", flexDirection: "column", lineHeight: 1.2 }}>
                  <span>{langNameIn(l.code, lang)}</span>
                  {langNameIn(l.code, lang) !== l.label && (
                    <span dir={l.dir} style={{ fontSize: 11, opacity: 0.5, unicodeBidi: "isolate" }}>{l.label}</span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
