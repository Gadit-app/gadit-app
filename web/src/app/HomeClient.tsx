"use client";

/**
 * Homepage — CrispTech aesthetic. Search-as-CTA hero, minimal chrome,
 * shares the wordbook palette + typography with the word result page.
 *
 * Designed for the launch demo: land → type a word → /word/<word>.
 * No marketing fluff, no animated chrome, no V2 navy.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/lang-context";
import { v2 } from "@/lib/i18n-v2";
import { useAuth } from "@/lib/auth-context";
import { useHref } from "@/lib/href";
import { ShareButton, APP_SHARE_COPY } from "@/components/ShareButton";
import { WbUserMenu } from "@/components/design/WbUserMenu";
import VoiceInput from "@/components/VoiceInput";

const LANGS = [
  { code: "he", label: "עברית" },
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
  { code: "ru", label: "Русский" },
  { code: "es", label: "Español" },
  { code: "pt", label: "Português" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "cs", label: "Čeština" },
] as const;

function LangSwitch() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  const active = LANGS.find((l) => l.code === lang) ?? LANGS[0];
  return (
    <div ref={wrapRef} className="wb-lang-chip-wrap">
      <button
        type="button"
        className="wb-lang-chip"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" />
        </svg>
        {active.label}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <ul className="wb-lang-menu" role="listbox">
          {LANGS.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                role="option"
                aria-selected={l.code === lang}
                className={l.code === lang ? "is-active" : ""}
                onClick={() => { setLang(l.code); setOpen(false); }}
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const SAMPLES_BY_LANG: Record<string, string[]> = {
  he: ["חלום", "אמת", "תקווה"],
  en: ["ephemeral", "serendipity", "ineffable"],
  ar: ["حلم", "أمل", "حقيقة"],
  ru: ["мечта", "истина", "надежда"],
  es: ["sueño", "verdad", "esperanza"],
  pt: ["sonho", "verdade", "esperança"],
  fr: ["rêve", "vérité", "espoir"],
  de: ["Traum", "Wahrheit", "Hoffnung"],
  cs: ["sen", "pravda", "naděje"],
};

const COPY: Record<
  string,
  {
    tagline: string;
    placeholder: string;
    tryLabel: string;
    signin: string;
    pricing: string;
    search: string;
    features: string;
    addSentence: string;
    sentencePlaceholder: string;
  }
> = {
  he: { tagline: "להבין מילים עד הסוף", placeholder: "הקלידו מילה",       tryLabel: "לדוגמה", signin: "התחברות",     pricing: "תמחור", search: "חיפוש", features: "פיצ'רים", addSentence: "הוסיפו את המשפט שבו מופיעה המילה כדי לקבל הגדרה אחת מדויקת", sentencePlaceholder: "הקלידו את המשפט שבו מופיעה המילה כדי לקבל הגדרה אחת מדויקת" },
  en: { tagline: "Understand words to the end", placeholder: "Type a word", tryLabel: "Try", signin: "Sign in", pricing: "Pricing", search: "Search", features: "Features", addSentence: "Add the sentence where the word appears to get one precise definition", sentencePlaceholder: "Type the sentence where the word appears to get one precise definition" },
  ar: { tagline: "افهم الكلمات حتى النهاية", placeholder: "اكتب كلمة",     tryLabel: "جرّب", signin: "تسجيل دخول",  pricing: "الأسعار", search: "بحث", features: "المزايا", addSentence: "أضف الجملة التي تظهر فيها الكلمة للحصول على تعريف واحد دقيق", sentencePlaceholder: "اكتب الجملة التي تظهر فيها الكلمة للحصول على تعريف واحد دقيق" },
  ru: { tagline: "Понять слова до конца",   placeholder: "Введите слово", tryLabel: "Пример", signin: "Войти",     pricing: "Цены", search: "Поиск", features: "Возможности", addSentence: "Добавьте предложение со словом, чтобы получить одно точное определение", sentencePlaceholder: "Введите предложение со словом, чтобы получить одно точное определение" },
  es: { tagline: "Entender palabras hasta el final", placeholder: "Escribe una palabra", tryLabel: "Prueba", signin: "Iniciar sesión", pricing: "Precios", search: "Búsqueda", features: "Funciones", addSentence: "Añade la frase donde aparece la palabra para obtener una definición precisa", sentencePlaceholder: "Escribe la frase donde aparece la palabra para obtener una definición precisa" },
  pt: { tagline: "Entender palavras até o fim", placeholder: "Escreva uma palavra", tryLabel: "Exemplo", signin: "Entrar", pricing: "Preços", search: "Buscar", features: "Recursos", addSentence: "Adicione a frase onde a palavra aparece para obter uma definição precisa", sentencePlaceholder: "Escreva a frase onde a palavra aparece para obter uma definição precisa" },
  fr: { tagline: "Comprendre les mots jusqu'au bout", placeholder: "Tapez un mot", tryLabel: "Essayez", signin: "Connexion", pricing: "Tarifs", search: "Recherche", features: "Fonctionnalités", addSentence: "Ajoutez la phrase où le mot apparaît pour obtenir une définition précise", sentencePlaceholder: "Tapez la phrase où le mot apparaît pour obtenir une définition précise" },
  de: { tagline: "Wörter bis zum Ende verstehen", placeholder: "Wort eingeben", tryLabel: "Beispiel", signin: "Anmelden", pricing: "Preise", search: "Suche", features: "Funktionen", addSentence: "Füge den Satz hinzu, in dem das Wort vorkommt, um eine genaue Definition zu erhalten", sentencePlaceholder: "Tippe den Satz ein, in dem das Wort vorkommt, um eine genaue Definition zu erhalten" },
  cs: { tagline: "Pochopit slova až do konce", placeholder: "Napiš slovo", tryLabel: "Příklad", signin: "Přihlásit se", pricing: "Ceník", search: "Hledat", features: "Funkce", addSentence: "Přidej větu, ve které se slovo objevuje, abys získal přesnou definici", sentencePlaceholder: "Napiš větu, ve které se slovo objevuje, abys získal jednu přesnou definici" },
};

function SearchIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

export function HomePage() {
  const { lang, dir, setLang } = useLang();
  const { user, plan, promptLogin } = useAuth();
  const router = useRouter();
  const href = useHref();
  const [query, setQuery] = useState("");
  const [sentence, setSentence] = useState("");
  const [sentenceOpen, setSentenceOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const c = COPY[lang] ?? COPY.en;
  const samples = SAMPLES_BY_LANG[lang] ?? SAMPLES_BY_LANG.en;

  useEffect(() => {
    if (!menuOpen) return;
    function onClick(e: MouseEvent) {
      const target = e.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (burgerRef.current?.contains(target)) return;
      setMenuOpen(false);
    }
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setMenuOpen(false); }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  async function getIdToken(): Promise<string | null> {
    if (!user) return null;
    try { return await user.getIdToken(); } catch { return null; }
  }

  function go(word: string, ctxSentence?: string) {
    const trimmed = word.trim();
    if (!trimmed) return;
    const ctx = (ctxSentence ?? sentence).trim();
    const qs = ctx ? `?sentence=${encodeURIComponent(ctx)}` : "";
    router.push(href(`/word/${encodeURIComponent(trimmed)}${qs}`));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    go(query);
  }

  return (
    <div className="wordbook wb-shell-page" dir={dir}>
      <header className="wb-shell-topbar">
        <Link href={href("/")} className="wb-wordmark" dir="ltr">
          Gad<span className="wb-wordmark-it">it</span>
        </Link>
        <nav className="wb-shell-nav">
          <Link href={href("/")} className="wb-shell-navlink wb-shell-navlink-icon is-active" aria-label={c.search}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m20 20-4-4" />
            </svg>
          </Link>
          <Link href={href("/features")} className="wb-shell-navlink">{c.features}</Link>
          {user && (plan === "clear" || plan === "deep") && (
            <Link href={href("/notebook")} className="wb-shell-navlink">{v2(lang, "navNotebook")}</Link>
          )}
          <Link href={href("/pricing")} className="wb-shell-navlink">{c.pricing}</Link>
        </nav>
        <div className="wb-shell-actions">
          <ShareButton
            url="https://www.gadit.app/"
            title={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).title}
            text=""
            shareLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).shareLabel}
            copiedLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).copiedLabel}
          />
          <LangSwitch />
          {user ? (
            <WbUserMenu />
          ) : (
            <button
              type="button"
              className="wb-shell-link"
              onClick={() => promptLogin({ mode: "signin" })}
            >
              {c.signin}
            </button>
          )}
        </div>
        <div className="wb-shell-share-mobile-wrap">
          <ShareButton
            url="https://www.gadit.app/"
            title={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).title}
            text=""
            shareLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).shareLabel}
            copiedLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).copiedLabel}
          />
        </div>
                <button
          ref={burgerRef}
          type="button"
          className="wb-shell-burger"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
        {menuOpen && (
          <div ref={menuRef} className="wb-shell-mobile-menu" role="menu">
            <Link href={href("/features")} className="wb-shell-mobile-link" onClick={() => setMenuOpen(false)}>
              {c.features}
            </Link>
            <Link href={href("/pricing")} className="wb-shell-mobile-link" onClick={() => setMenuOpen(false)}>
              {c.pricing}
            </Link>
            <div className="wb-shell-mobile-menu-sep" />
            <div className="wb-shell-mobile-langs">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  className={l.code === lang ? "is-active" : ""}
                  onClick={() => { setLang(l.code); setMenuOpen(false); }}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <div className="wb-shell-mobile-menu-sep" />
            {user ? (
              <Link href={href("/account")} onClick={() => setMenuOpen(false)}>
                {(user.email?.[0] || "G").toUpperCase()} · {user.email ?? "Account"}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => { setMenuOpen(false); promptLogin({ mode: "signin" }); }}
              >
                {c.signin}
              </button>
            )}
          </div>
        )}
      </header>

      <main className="wb-home-main">
        <div className="wb-home-center">
          <div className="wb-home-logo">
            Gad<span className="wb-home-logo-it">it</span>
          </div>
          <p className="wb-home-tagline">{c.tagline}</p>

          <form className="wb-home-search" onSubmit={onSubmit}>
            <div className="wb-home-search-box">
              <span className="wb-home-search-glyph" aria-hidden="true">
                <SearchIcon size={18} />
              </span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={c.placeholder}
                autoFocus
                className="wb-home-search-input"
                aria-label={c.placeholder}
              />
              <div className="wb-home-search-mic">
                <VoiceInput
                  uiLang={lang}
                  getIdToken={getIdToken}
                  onResult={(text) => {
                    setQuery(text);
                    go(text);
                  }}
                  enabled={true}
                  title="חיפוש קולי"
                  size="sm"
                />
              </div>
            </div>
            <div className="wb-home-samples">
              <span className="wb-home-samples-label">{c.tryLabel}</span>
              {samples.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="wb-home-sample"
                  onClick={() => go(s)}
                >
                  {s}
                </button>
              ))}
            </div>

            {sentenceOpen ? (
              <div className="wb-home-sentence-wrap">
                <textarea
                  value={sentence}
                  onChange={(e) => setSentence(e.target.value)}
                  placeholder={c.sentencePlaceholder}
                  rows={2}
                  className="wb-home-sentence-input"
                  aria-label={c.sentencePlaceholder}
                />
                <button
                  type="button"
                  className="wb-home-sentence-close"
                  onClick={() => { setSentenceOpen(false); setSentence(""); }}
                  aria-label={lang === "he" ? "סגור" : lang === "ar" ? "إغلاق" : lang === "ru" ? "Закрыть" : "Close"}
                >
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                    <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="wb-home-sentence-toggle"
                onClick={() => setSentenceOpen(true)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span>{c.addSentence}</span>
              </button>
            )}
          </form>
        </div>
      </main>

      <footer className="wb-home-footer">
        <span>© 2026 Gadit</span>
        <span>·</span>
        <Link href={href("/pricing")}>{c.pricing}</Link>
        <span>·</span>
        <Link href={href("/privacy")}>Privacy</Link>
        <span>·</span>
        <Link href={href("/terms")}>Terms</Link>
      </footer>
    </div>
  );
}
