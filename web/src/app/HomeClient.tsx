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
import { useAuth } from "@/lib/auth-context";

const LANGS = [
  { code: "he", label: "עברית" },
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
  { code: "ru", label: "Русский" },
  { code: "es", label: "Español" },
  { code: "pt", label: "Português" },
  { code: "fr", label: "Français" },
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
};

const COPY: Record<
  string,
  { tagline1: string; tagline2: string; subline: string; placeholder: string; tryLabel: string; signin: string; pricing: string }
> = {
  he: {
    tagline1: "להבין",
    tagline2: "עד הסוף.",
    subline: "מילון רב-לשוני שעובד לעומק — משמעויות, ניבים, רקע ותמונה. בעברית, באנגלית, וב-7 שפות.",
    placeholder: "הקלידו מילה…",
    tryLabel: "לדוגמה",
    signin: "התחברות",
    pricing: "תמחור",
  },
  en: {
    tagline1: "Understand",
    tagline2: "to the end.",
    subline: "A dictionary that meets you in context — meanings, idioms, origins and a vivid image, in 7 languages.",
    placeholder: "Type a word…",
    tryLabel: "Try",
    signin: "Sign in",
    pricing: "Pricing",
  },
  ar: { tagline1: "افهم", tagline2: "حتى النهاية.", subline: "قاموس متعدد اللغات يجيبك بعمق — معانٍ، أصول، تعابير وصورة.", placeholder: "اكتب كلمة…", tryLabel: "جرّب", signin: "تسجيل دخول", pricing: "الأسعار" },
  ru: { tagline1: "Понять", tagline2: "до конца.", subline: "Словарь с глубиной — значения, идиомы, происхождение и образ.", placeholder: "Введите слово…", tryLabel: "Пример", signin: "Войти", pricing: "Цены" },
  es: { tagline1: "Entender", tagline2: "hasta el final.", subline: "Un diccionario que va a fondo — significados, modismos, origen e imagen.", placeholder: "Escribe una palabra…", tryLabel: "Prueba", signin: "Iniciar sesión", pricing: "Precios" },
  pt: { tagline1: "Entender", tagline2: "até o fim.", subline: "Um dicionário que vai a fundo — significados, expressões, origem e imagem.", placeholder: "Escreva uma palavra…", tryLabel: "Exemplo", signin: "Entrar", pricing: "Preços" },
  fr: { tagline1: "Comprendre", tagline2: "jusqu'au bout.", subline: "Un dictionnaire qui va au fond — sens, expressions, origine et image.", placeholder: "Tapez un mot…", tryLabel: "Essayez", signin: "Connexion", pricing: "Tarifs" },
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
  const { lang, dir } = useLang();
  const { user, promptLogin } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const c = COPY[lang] ?? COPY.en;
  const samples = SAMPLES_BY_LANG[lang] ?? SAMPLES_BY_LANG.en;

  function go(word: string) {
    const trimmed = word.trim();
    if (!trimmed) return;
    router.push(`/word/${encodeURIComponent(trimmed)}`);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    go(query);
  }

  return (
    <div className="wordbook wb-shell-page" dir={dir}>
      <header className="wb-shell-topbar">
        <Link href="/" className="wb-wordmark">
          Gad<span className="wb-wordmark-it">it</span>
        </Link>
        <nav className="wb-shell-nav">
          <Link href="/pricing" className="wb-shell-navlink">{c.pricing}</Link>
        </nav>
        <div className="wb-shell-actions">
          <LangSwitch />
          {user ? (
            <Link href="/notebook" className="wb-shell-link">{lang === "he" ? "המחברת" : "Notebook"}</Link>
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
      </header>

      <main className="wb-home-main">
        <div className="wb-home-hero">
          <h1 className="wb-home-title">
            <span className="wb-home-title-1">{c.tagline1}</span>
            <span className="wb-home-title-2">{c.tagline2}</span>
          </h1>
          <p className="wb-home-subline">{c.subline}</p>
        </div>

        <form className="wb-home-search" onSubmit={onSubmit}>
          <div className="wb-home-search-box">
            <span className="wb-home-search-icon"><SearchIcon size={18} /></span>
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
            <button type="submit" className="wb-home-search-go" aria-label="Search">
              <SearchIcon size={16} />
            </button>
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
        </form>
      </main>

      <footer className="wb-home-footer">
        <span>© 2026 Gadit</span>
        <span>·</span>
        <Link href="/pricing">{c.pricing}</Link>
        <span>·</span>
        <Link href="/privacy">Privacy</Link>
        <span>·</span>
        <Link href="/terms">Terms</Link>
      </footer>
    </div>
  );
}
