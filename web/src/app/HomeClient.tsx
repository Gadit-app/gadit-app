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
import { StartFreeCTA } from "@/components/StartFreeCTA";
import { GadVerbStamp } from "@/components/GadVerbStamp";
import { WbUserMenu } from "@/components/design/WbUserMenu";
import VoiceInput from "@/components/VoiceInput";
import { KidsModeToggle } from "@/components/KidsModeToggle";
import { UpgradeModal, type UpgradeTrigger } from "@/components/UpgradeModal";
import { LangSwitchMobile } from "@/components/LangSwitchMobile";

const LANGS = [
  { code: "he", label: "עברית", flag: "il" },
  { code: "en", label: "English", flag: "gb" },
  { code: "ar", label: "العربية", flag: "sa" },
  { code: "ru", label: "Русский", flag: "ru" },
  { code: "es", label: "Español", flag: "es" },
  { code: "pt", label: "Português", flag: "pt" },
  { code: "fr", label: "Français", flag: "fr" },
  { code: "de", label: "Deutsch", flag: "de" },
  { code: "cs", label: "Čeština", flag: "cz" },
  { code: "sk", label: "Slovenčina", flag: "sk" },
  { code: "it", label: "Italiano", flag: "it" },
  { code: "ja", label: "日本語", flag: "jp" },
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
                <img className="wb-lang-flag" src={`https://flagcdn.com/40x30/${l.flag}.png`} srcSet={`https://flagcdn.com/80x60/${l.flag}.png 2x`} width="20" height="15" alt="" loading="lazy" />{l.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

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
    founderNote: string;
    founderSign: string;
  }
> = {
  he: { tagline: "להבין מילים עד הסוף", placeholder: "הקלידו מילה",       tryLabel: "לדוגמה", signin: "התחברות",     pricing: "תמחור", search: "חיפוש", features: "פיצ'רים", addSentence: "הוסיפו את המשפט שבו מופיעה המילה כדי לקבל הגדרה אחת מדויקת", sentencePlaceholder: "הקלידו את המשפט שבו מופיעה המילה כדי לקבל הגדרה אחת מדויקת", founderNote: "בכל פעם שמשהו לא ברור, יש שם מילה אחת. תפסת אותה, הבנת הכל.", founderSign: "גדי, מייסד Gadit" },
  en: { tagline: "Understand words to the end", placeholder: "Type a word", tryLabel: "Try", signin: "Sign in", pricing: "Pricing", search: "Search", features: "Features", addSentence: "Add the sentence where the word appears to get one precise definition", sentencePlaceholder: "Type the sentence where the word appears to get one precise definition", founderNote: "Every time something doesn't click, there's one word in the way. Catch it, and everything opens.", founderSign: "Gadi, founder of Gadit" },
  ar: { tagline: "افهم الكلمات حتى النهاية", placeholder: "اكتب كلمة",     tryLabel: "جرّب", signin: "تسجيل دخول",  pricing: "الأسعار", search: "بحث", features: "المزايا", addSentence: "أضف الجملة التي تظهر فيها الكلمة للحصول على تعريف واحد دقيق", sentencePlaceholder: "اكتب الجملة التي تظهر فيها الكلمة للحصول على تعريف واحد دقيق", founderNote: "في كل مرة لا يتضح فيها شيء، هناك كلمة واحدة في الطريق. التقطها، وكل شيء ينفتح.", founderSign: "غادي، مؤسس Gadit" },
  ru: { tagline: "Понять слова до конца",   placeholder: "Введите слово", tryLabel: "Пример", signin: "Войти",     pricing: "Цены", search: "Поиск", features: "Возможности", addSentence: "Добавьте предложение со словом, чтобы получить одно точное определение", sentencePlaceholder: "Введите предложение со словом, чтобы получить одно точное определение", founderNote: "Каждый раз, когда что-то не складывается, на пути есть одно слово. Найди его, и всё открывается.", founderSign: "Гади, основатель Gadit" },
  es: { tagline: "Entender palabras hasta el final", placeholder: "Escribe una palabra", tryLabel: "Prueba", signin: "Iniciar sesión", pricing: "Precios", search: "Búsqueda", features: "Funciones", addSentence: "Añade la frase donde aparece la palabra para obtener una definición precisa", sentencePlaceholder: "Escribe la frase donde aparece la palabra para obtener una definición precisa", founderNote: "Cada vez que algo no encaja, hay una palabra en el camino. Atrápala, y todo se abre.", founderSign: "Gadi, fundador de Gadit" },
  pt: { tagline: "Entender palavras até o fim", placeholder: "Escreva uma palavra", tryLabel: "Exemplo", signin: "Entrar", pricing: "Preços", search: "Buscar", features: "Recursos", addSentence: "Adicione a frase onde a palavra aparece para obter uma definição precisa", sentencePlaceholder: "Escreva a frase onde a palavra aparece para obter uma definição precisa", founderNote: "Toda vez que algo não faz sentido, há uma palavra no caminho. Pegue-a, e tudo se abre.", founderSign: "Gadi, fundador do Gadit" },
  fr: { tagline: "Comprendre les mots jusqu'au bout", placeholder: "Tapez un mot", tryLabel: "Essayez", signin: "Connexion", pricing: "Tarifs", search: "Recherche", features: "Fonctionnalités", addSentence: "Ajoutez la phrase où le mot apparaît pour obtenir une définition précise", sentencePlaceholder: "Tapez la phrase où le mot apparaît pour obtenir une définition précise", founderNote: "Chaque fois que quelque chose ne tilte pas, il y a un mot sur le chemin. Saisissez-le, et tout s'ouvre.", founderSign: "Gadi, fondateur de Gadit" },
  de: { tagline: "Wörter bis zum Ende verstehen", placeholder: "Wort eingeben", tryLabel: "Beispiel", signin: "Anmelden", pricing: "Preise", search: "Suche", features: "Funktionen", addSentence: "Füge den Satz hinzu, in dem das Wort vorkommt, um eine genaue Definition zu erhalten", sentencePlaceholder: "Tippe den Satz ein, in dem das Wort vorkommt, um eine genaue Definition zu erhalten", founderNote: "Jedes Mal, wenn etwas nicht klickt, steht ein Wort im Weg. Fang es ein, und alles öffnet sich.", founderSign: "Gadi, Gründer von Gadit" },
  cs: { tagline: "Pochopit slova až do konce", placeholder: "Napiš slovo", tryLabel: "Příklad", signin: "Přihlásit se", pricing: "Ceník", search: "Hledat", features: "Funkce", addSentence: "Přidej větu, ve které se slovo objevuje, abys získal přesnou definici", sentencePlaceholder: "Napiš větu, ve které se slovo objevuje, abys získal jednu přesnou definici", founderNote: "Pokaždé, když něco nedává smysl, je v cestě jedno slovo. Zachyť ho, a všechno se otevře.", founderSign: "Gadi, zakladatel Gaditu" },
  sk: { tagline: "Pochopiť slová až do konca", placeholder: "Napíš slovo", tryLabel: "Príklad", signin: "Prihlásiť sa", pricing: "Cenník", search: "Hľadať", features: "Funkcie", addSentence: "Pridaj vetu, v ktorej sa slovo nachádza, aby si získal presnú definíciu", sentencePlaceholder: "Napíš vetu, v ktorej sa slovo nachádza, aby si získal jednu presnú definíciu", founderNote: "Zakaždým, keď niečo nedáva zmysel, stojí v ceste jedno slovo. Zachyť ho, a všetko sa otvorí.", founderSign: "Gadi, zakladateľ Gaditu" },
  it: { tagline: "Capire le parole fino in fondo", placeholder: "Scrivi una parola", tryLabel: "Prova", signin: "Accedi", pricing: "Prezzi", search: "Cerca", features: "Funzionalità", addSentence: "Aggiungi la frase in cui appare la parola per ottenere una definizione precisa", sentencePlaceholder: "Scrivi la frase in cui appare la parola per ottenere una definizione precisa", founderNote: "Ogni volta che qualcosa non torna, c'è una parola sulla strada. Coglila, e tutto si apre.", founderSign: "Gadi, fondatore di Gadit" },
  ja: { tagline: "言葉を最後まで理解する", placeholder: "単語を入力", tryLabel: "例", signin: "ログイン", pricing: "料金", search: "検索", features: "機能", addSentence: "単語が出てくる文を追加すると、ぴったりの意味が一つだけ表示されます", sentencePlaceholder: "単語が出てくる文を入力すると、ぴったりの意味が一つだけ表示されます", founderNote: "何かがしっくりこないとき、必ず一つの言葉が間にある。それを掴めば、すべてが開く。", founderSign: "ガディ、Gadit 創業者" },
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
  const [upgradeTrigger, setUpgradeTrigger] = useState<UpgradeTrigger | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const c = COPY[lang] ?? COPY.en;

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
          {user && plan === "deep" && (
            <Link href={href("/play")} className="wb-shell-navlink">{v2(lang, "navPlay")}</Link>
          )}
          <Link href={href("/pricing")} className="wb-shell-navlink">{c.pricing}</Link>
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
                {c.signin}
              </button>
            </>
          )}
        </div>
        <div className="wb-shell-mobile-cta">
          <StartFreeCTA />
        </div>
        <div className="wb-shell-share-mobile-wrap">
          {user && (
            <ShareButton
              url="https://www.gadit.app/"
              title={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).title}
              text=""
              shareLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).shareLabel}
              copiedLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).copiedLabel}
            />
          )}
        </div>
        <LangSwitchMobile />
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
              {/* Submit pill — sits at the END of the row so it always
                  appears on the side opposite to where the user starts
                  typing. LTR English: types left → finishes near the
                  right → the green Search button is on the right.
                  RTL Hebrew/Arabic: types right → finishes near the
                  left → the button is on the left. Enter still submits;
                  the button just makes the same action discoverable
                  visually. */}
              <button
                type="submit"
                className="wb-home-search-submit"
                aria-label={c.search}
                title={c.search}
              >
                <SearchIcon size={16} />
                <span className="wb-home-search-submit-label">{c.search}</span>
              </button>
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

            <div className="wb-home-kids-row">
              <KidsModeToggle
                plan={plan}
                onBasicGate={() => {
                  // Anonymous: nudge to sign up first; Basic: show the
                  // existing UpgradeModal with the kids pitch (the
                  // modal already ships a feature="kids" pitch in 11
                  // languages, so we get it for free).
                  if (!user) {
                    promptLogin(v2(lang, "kidsModeBasicGate"));
                    return;
                  }
                  setUpgradeTrigger({ feature: "kids", tier: "clear" });
                }}
              />
            </div>
          </form>
        </div>
      </main>

      <UpgradeModal
        trigger={upgradeTrigger}
        lang={lang as "he" | "en" | "ar" | "ru" | "es" | "pt" | "fr" | "de" | "cs" | "sk" | "it" | "ja"}
        dir={dir}
        onClose={() => setUpgradeTrigger(null)}
      />

      <GadVerbStamp />

      <footer className="wb-home-footer">
        <span>© 2026 Gadit</span>
        <span>·</span>
        <Link href={href("/pricing")}>{c.pricing}</Link>
        <span>·</span>
        <Link href={href("/contact")}>{v2(lang, "footerContact")}</Link>
        <span>·</span>
        <Link href={href("/privacy")}>{v2(lang, "footerPrivacy")}</Link>
        <span>·</span>
        <Link href={href("/terms")}>{v2(lang, "footerTerms")}</Link>
      </footer>
    </div>
  );
}
