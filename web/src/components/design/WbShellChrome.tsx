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
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { resolvePartnerArea } from "@/lib/partner-nav";
import { useLang } from "@/lib/lang-context";
import { v2 } from "@/lib/i18n-v2";
import { useHref } from "@/lib/href";
import { isPwaInstalledOrDone } from "@/components/InstallPwaPrompt";
import { requestInstallOpen } from "@/lib/install-bus";
import { isInAppBrowser } from "@/lib/in-app-browser";
import { track } from "@/lib/track";
import { OPEN_SAY_EVENT } from "@/components/SayModal";

// Nav keys that lead to a purchase surface — tagged .gd-buy so they are
// hidden inside the Google Play consumption-only TWA (html[data-play="1"]).
const BUY_NAV_KEYS = new Set(["pricing", "families", "individuals", "schools"]);
import { useTheme } from "@/lib/appearance";
import { DARK_LABEL } from "@/components/design/WbUserMenu";

// "Say it" opens as a modal over the current (themed) screen rather than
// routing to a separate page, so a kid keeps their skin and a clear way
// back (Gadi 2026-08-18).
function openSay() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(OPEN_SAY_EVENT));
}

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
  | "say"
  | "read"
  | "individuals"
  | "schools"
  | "families"
  | "pricing"
  | "affiliates";

type NavLink = { key: NavKey; href: string; label: string };

// "Families" nav label. Kept local rather than in i18n-v2 so we don't have
// to touch all 30+ language blocks for one word (Gadi 2026-07-29: make the
// three products — individuals, Families, Schools — visible in the top nav).
const FAMILIES_LABEL: Record<string, string> = {
  he: "משפחות", en: "Families", ar: "العائلات", ru: "Семьи", es: "Familias",
  pt: "Famílias", fr: "Familles", de: "Familien", cs: "Rodiny", sk: "Rodiny",
  it: "Famiglie", ja: "ファミリー", hi: "परिवार", am: "ቤተሰቦች",
};

// "Individuals" nav label — the solo/single-user product area (Gadi 2026-08-15,
// multi-AI panel picked "Individuals / יחידים" to keep the three nav tabs
// parallel plural nouns: יחידים / משפחות / בתי ספר). Links to /pricing, which
// leads with the individual tiers. Same local-map pattern as FAMILIES_LABEL;
// en fallback for the other languages.
const INDIVIDUALS_LABEL: Record<string, string> = {
  he: "יחידים", en: "Individuals", ar: "الأفراد", ru: "Индивидуальный",
  es: "Individual", pt: "Individual", fr: "Particuliers", de: "Einzelpersonen",
  cs: "Jednotlivci", sk: "Jednotlivci", it: "Individuale", ja: "個人",
  hi: "व्यक्तिगत", am: "ግለሰቦች",
};

// Kids see their notebook as "אוצר המילים שלי" (= vocabulary in Hebrew,
// playful to a child + mature to a teen; LLM council + Gadi 2026-08-12).
// Short nav form; en fallback for languages not listed.
// "Say it" nav label — the pronunciation-practice tool (/say). Local map
// like the others so a new tool doesn't force a full i18n sweep;
// en fallback for the rest. (Gadi 2026-08-18)
const SAY_NAV: Record<string, string> = {
  en: "Say it", he: "תגיד את זה", ar: "قلها", ru: "Скажи это",
  es: "Dilo", pt: "Diga", fr: "Dis-le", de: "Sag es", cs: "Řekni to",
  sk: "Povedz to", it: "Dillo", nl: "Zeg het", uk: "Скажи це",
  tr: "Söyle", pl: "Powiedz to", fa: "بگو", id: "Ucapkan", el: "Πες το",
  hi: "कहो", ja: "言ってみて", am: "ተናገረው", zu: "Yisho",
};

// "Every Word" nav label for the Reader (/read). Renamed from "Read a text" via
// the LLM naming council (Gadi 2026-08-27): it names the promise that no word is
// left un-understood, straight from the brand tagline, and avoids "read" reading
// as text-to-speech (which would clash with "Say it"). Shown to deep-tier users
// (Family + Deep) and Family kids. All 33 langs.
const READ_NAV: Record<string, string> = {
  en: "Every Word", he: "כל מילה", ar: "كل كلمة", ru: "Каждое слово",
  es: "Cada palabra", pt: "Cada palavra", fr: "Chaque mot", de: "Jedes Wort",
  cs: "Každé slovo", sk: "Každé slovo", it: "Ogni parola", nl: "Elk woord",
  uk: "Кожне слово", tr: "Her kelime", pl: "Każde słowo", fa: "هر واژه",
  id: "Setiap kata", el: "Κάθε λέξη", hi: "हर शब्द", ja: "すべての単語",
  am: "እያንዳንዱ ቃል", zu: "Wonke amagama", vi: "Mọi từ", fil: "Bawat salita",
  af: "Elke woord", sw: "Kila neno", "zh-CN": "每个词", "zh-TW": "每個詞",
  ko: "모든 단어", th: "ทุกคำ", bn: "প্রতিটি শব্দ", da: "Hvert ord", hu: "Minden szó",
};

const TREASURE_NAV: Record<string, string> = {
  en: "My words", he: "אוצר המילים", ar: "كلماتي", ru: "Мои слова",
  es: "Mis palabras", pt: "Minhas palavras", fr: "Mes mots", de: "Meine Wörter",
  cs: "Moje slova", sk: "Moje slová", it: "Le mie parole", ja: "わたしのことば",
  hi: "मेरे शब्द", am: "የእኔ ቃላት", uk: "Мої слова", tr: "Kelimelerim",
  pl: "Moje słowa", fa: "کلمات من", id: "Kata-kataku", nl: "Mijn woorden",
  el: "Οι λέξεις μου", zu: "Amagama ami",
};

function useNavLinks(): NavLink[] {
  const { user, plan, planReady, loading, familyRole } = useAuth();
  const { lang } = useLang();
  const href = useHref();

  // Until auth AND the plan are resolved, render no nav rather than the wrong
  // nav: otherwise a logged-in user briefly sees the anonymous marketing links
  // (or a paid user sees the basic upsell) before it flips to their tools.
  // (Gadi 2026-08-27: kill the topbar flashes.)
  if (loading || (user && !planReady)) return [];

  // A kid on a Family plan gets a stripped-down, commerce-free nav
  // (council 2026-08-04): only their own words + games. No Features,
  // Families, Schools, Pricing or Partners — a child can't buy, can't
  // recruit, can't switch schools, so those links are noise or a trap.
  // The parent/subscriber nav below is unchanged (Gadi's call).
  if (familyRole === "kid") {
    // A kid on a Family plan is "deep", so the Say-it pronunciation tool
    // works for them (it's the literal Zulu-learner use case). Surface it
    // in the stripped kid nav alongside their words + games. Still no
    // commercial links (KidRouteGuard backstops the address bar).
    return [
      { key: "notebook", href: href("/notebook"), label: TREASURE_NAV[lang] ?? TREASURE_NAV.en },
      { key: "say", href: href("/say"), label: SAY_NAV[lang] ?? SAY_NAV.en },
      { key: "read", href: href("/read"), label: READ_NAV[lang] ?? READ_NAV.en },
      { key: "play", href: href("/play"), label: v2(lang, "navPlay") },
    ];
  }

  const paid = !!user && (plan === "clear" || plan === "deep");

  // Context-aware nav (Gadi 2026-08-20): a signed-in user sees only what's
  // relevant to THEIR use, not the marketing pages. This also fixes the nav
  // overflow in long-label languages (Russian/German) — the old 9-item
  // marketing+tools nav couldn't fit. Partners moved to the footer.
  if (user) {
    if (paid) {
      // Paying member — their tools only. No Features/Pricing/Individuals/
      // Schools (noise once subscribed).
      const links: NavLink[] = [
        { key: "notebook", href: href("/notebook"), label: v2(lang, "navNotebook") },
        { key: "say", href: href("/say"), label: SAY_NAV[lang] ?? SAY_NAV.en },
      ];
      // Reader + games are deep-tier tools (Family maps to deep, so Family
      // parents get them too; Clear does not). Gadi 2026-08-26: add the Reader
      // to the Family + Deep nav.
      if (plan === "deep") {
        links.push({ key: "read", href: href("/read"), label: READ_NAV[lang] ?? READ_NAV.en });
        links.push({ key: "play", href: href("/play"), label: v2(lang, "navPlay") });
      }
      return links;
    }
    // Basic (signed in, free) — no paid tools yet, so a single gentle upsell.
    return [{ key: "pricing", href: href("/pricing"), label: v2(lang, "navPricing") }];
  }

  // Anonymous — the marketing nav.
  return [
    { key: "features", href: href("/features"), label: v2(lang, "navFeatures") },
    { key: "individuals", href: href("/individuals"), label: INDIVIDUALS_LABEL[lang] ?? INDIVIDUALS_LABEL.en },
    { key: "families", href: href("/families"), label: FAMILIES_LABEL[lang] ?? FAMILIES_LABEL.en },
    { key: "schools", href: href("/schools"), label: v2(lang, "navSchools") },
    { key: "pricing", href: href("/pricing"), label: v2(lang, "navPricing") },
  ];
}

/** Desktop centre nav. Drop-in replacement for the old inline
 *  <nav className="wb-shell-nav"> blocks. */
export function WbShellNav({ active }: { active?: NavKey }) {
  const links = useNavLinks();
  const { lang } = useLang();
  const href = useHref();
  const { user } = useAuth();
  const router = useRouter();
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
      {links.map((l) =>
        l.key === "say" ? (
          <button
            key={l.key}
            type="button"
            className={`wb-shell-navlink${active === l.key ? " is-active" : ""}`}
            onClick={openSay}
          >
            {l.label}
          </button>
        ) : l.key === "affiliates" ? (
          <button
            key={l.key}
            type="button"
            className={`wb-shell-navlink${active === l.key ? " is-active" : ""}`}
            onClick={async () => router.push(await resolvePartnerArea(user, href))}
          >
            {l.label}
          </button>
        ) : (
          <Link
            key={l.key}
            href={l.href}
            className={`wb-shell-navlink${active === l.key ? " is-active" : ""}${BUY_NAV_KEYS.has(l.key) ? " gd-buy" : ""}`}
          >
            {l.label}
          </Link>
        ),
      )}
    </nav>
  );
}

/** Mobile burger + dropdown. Render inside the topbar's
 *  .wb-shell-mobile-menu-cluster; owns its own open state, closes on
 *  outside tap / Escape / navigation. */
export function WbShellBurger({ active }: { active?: NavKey }) {
  const links = useNavLinks();
  const { user, promptLogin, familyRole } = useAuth();
  const { lang } = useLang();
  const href = useHref();
  const router = useRouter();
  const [theme, setTheme] = useTheme();
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
          {links.map((l) =>
            l.key === "say" ? (
              <button
                key={l.key}
                type="button"
                className={`wb-shell-mobile-link${active === l.key ? " is-active" : ""}`}
                onClick={() => { setOpen(false); openSay(); }}
              >
                {l.label}
              </button>
            ) : l.key === "affiliates" ? (
              <button
                key={l.key}
                type="button"
                className={`wb-shell-mobile-link${active === l.key ? " is-active" : ""}`}
                onClick={async () => { setOpen(false); router.push(await resolvePartnerArea(user, href)); }}
              >
                {l.label}
              </button>
            ) : (
              <Link
                key={l.key}
                href={l.href}
                className={`wb-shell-mobile-link${active === l.key ? " is-active" : ""}${BUY_NAV_KEYS.has(l.key) ? " gd-buy" : ""}`}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ),
          )}
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
          {/* Dark mode also lives here, not only in the avatar menu: people
              open the hamburger looking for settings, so hiding the toggle in
              a different menu made it undiscoverable (Gadi 2026-08-21). Adults
              only, kids get skins instead. */}
          {familyRole !== "kid" && (
            <>
              <div className="wb-shell-mobile-menu-sep" />
              <button
                type="button"
                role="menuitemcheckbox"
                aria-checked={theme === "dark"}
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}
              >
                <span>{DARK_LABEL[lang] ?? DARK_LABEL.en}</span>
                <span aria-hidden="true" style={{ position: "relative", width: 38, height: 22, borderRadius: 999, flexShrink: 0, background: theme === "dark" ? "#2DD4BF" : "var(--rule, #D1D5DB)", transition: "background .16s ease" }}>
                  <span style={{ position: "absolute", top: 2, insetInlineStart: theme === "dark" ? 18 : 2, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "inset-inline-start .16s ease", boxShadow: "0 1px 2px rgba(0,0,0,.3)" }} />
                </span>
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
