"use client";

/**
 * NotebookPage — Clear/Deep tier. Lists every word the user has saved.
 *
 * CrispTech aesthetic — white page, teal accent. Replaces the V2 navy
 * starscape design that this route had inherited. Each saved word is a
 * compact white card with the word in teal, language tag, and short
 * meaning summary; the card whole-area links to /word/<word>.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { v2 } from "@/lib/i18n-v2";
import { ShareButton, APP_SHARE_COPY } from "@/components/ShareButton";
import { WbUserMenu } from "@/components/design/WbUserMenu";
import { useHref } from "@/lib/href";
import { listRecentCached } from "@/lib/offline-db";

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
  { code: "it", label: "Italiano", flag: "it" },
  { code: "ja", label: "日本語", flag: "jp" },
] as const;

type NotebookItem = {
  id: string;
  word: string;
  language: string;
  meaning: string;
  addedAt: string;
};

const COPY: Record<string, {
  title: string;
  subtitle: string;
  empty: string;
  emptyHint: string;
  goSearch: string;
}> = {
  he: {
    title: "המחברת שלי",
    subtitle: "כל המילים שאספת — שמורות ומסודרות.",
    empty: "המחברת שלך עדיין ריקה.",
    emptyHint: "מצא מילה וחפש את הכפתור 'שמירה במחברת'.",
    goSearch: "חזרה לחיפוש",
  },
  en: {
    title: "My Notebook",
    subtitle: "Every word you've collected — saved and organized.",
    empty: "Your notebook is empty.",
    emptyHint: "Find a word and tap 'Save to Notebook'.",
    goSearch: "Back to search",
  },
  ar: {
    title: "دفتر كلماتي",
    subtitle: "كل الكلمات التي جمعتها — محفوظة ومنظمة.",
    empty: "دفترك فارغ.",
    emptyHint: "ابحث عن كلمة واضغط على 'احفظ في الدفتر'.",
    goSearch: "العودة إلى البحث",
  },
  ru: {
    title: "Моя тетрадь",
    subtitle: "Все слова, которые вы собрали — сохранены и упорядочены.",
    empty: "Ваша тетрадь пуста.",
    emptyHint: "Найдите слово и нажмите 'В мою тетрадь'.",
    goSearch: "Вернуться к поиску",
  },
  es: {
    title: "Mi cuaderno",
    subtitle: "Todas las palabras que has recopilado — guardadas y organizadas.",
    empty: "Tu cuaderno está vacío.",
    emptyHint: "Busca una palabra y pulsa 'Guardar en el cuaderno'.",
    goSearch: "Volver a buscar",
  },
  pt: {
    title: "Meu caderno",
    subtitle: "Todas as palavras que você coletou — salvas e organizadas.",
    empty: "Seu caderno está vazio.",
    emptyHint: "Encontre uma palavra e toque em 'Salvar no caderno'.",
    goSearch: "Voltar à busca",
  },
  fr: {
    title: "Mon carnet",
    subtitle: "Tous les mots que vous avez collectés — enregistrés et organisés.",
    empty: "Votre carnet est vide.",
    emptyHint: "Trouvez un mot et touchez 'Enregistrer dans le carnet'.",
    goSearch: "Retour à la recherche",
  },
  de: {
    title: "Mein Notizbuch",
    subtitle: "Alle Wörter, die du gesammelt hast — gespeichert und geordnet.",
    empty: "Dein Notizbuch ist leer.",
    emptyHint: "Such ein Wort und tippe auf 'Im Notizbuch speichern'.",
    goSearch: "Zurück zur Suche",
  },
  cs: {
    title: "Můj sešit",
    subtitle: "Všechna slova, která jsi nasbíral — uložená a uspořádaná.",
    empty: "Tvůj sešit je prázdný.",
    emptyHint: "Najdi slovo a klepni na 'Uložit do sešitu'.",
    goSearch: "Zpět na vyhledávání",
  },
};

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
  const active = LANGS.find((l) => l.code === lang) ?? LANGS[1];
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
          {LANGS.map((l) => (
            <li key={l.code}>
              <button
                type="button"
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

export function NotebookPage() {
  const { user, plan, loading, promptLogin } = useAuth();
  const { lang, dir } = useLang();
  const router = useRouter();
  const href = useHref();
  const c = COPY[lang] ?? COPY.en;

  const [items, setItems] = useState<NotebookItem[] | null>(null);
  // Lowercase set of every word the user has cached locally — drives
  // the per-card 'available offline' badge below. Recomputed on mount;
  // V3 doesn't auto-refresh after new caches (next mount is enough).
  const [offlineWords, setOfflineWords] = useState<Set<string>>(new Set());
  // Network status — drives the 'you're offline' banner at the top.
  // Initialised from navigator.onLine and kept fresh via the online /
  // offline events the browser fires.
  const [online, setOnline] = useState<boolean>(
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cached = await listRecentCached(2000);
        if (cancelled) return;
        setOfflineWords(new Set(cached.map((c) => c.word.toLowerCase())));
      } catch { /* ignore — best-effort badge */ }
    })();
    return () => { cancelled = true; };
  }, []);
  const [fetchError, setFetchError] = useState<string>("");

  // Auth + tier gate
  useEffect(() => {
    if (loading) return;
    if (!user) {
      promptLogin(c.title);
      return;
    }
    if (plan === "basic") {
      router.replace(href("/pricing"));
    }
  }, [loading, user, plan, c.title, promptLogin, router]);

  // Load notebook contents once authorized
  useEffect(() => {
    if (loading || !user) return;
    if (plan === "basic") return;
    let cancelled = false;
    (async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch("/api/notebook", {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (!res.ok) {
          setFetchError(`HTTP ${res.status}`);
          return;
        }
        const data = (await res.json()) as { items: NotebookItem[] };
        if (!cancelled) setItems(data.items ?? []);
      } catch (e) {
        if (!cancelled) setFetchError(String(e));
      }
    })();
    return () => { cancelled = true; };
  }, [loading, user, plan]);

  return (
    <div className="wordbook wb-shell-page" dir={dir}>
      {/* Offline banner — top-of-page strip that appears whenever the
          browser thinks the network is down. Tells the user how many
          words they have available locally so 'offline' doesn't feel
          like 'broken'. Hidden the moment we're back online. */}
      {!online && (
        <div className="wb-offline-banner" role="status" aria-live="polite">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M16 16h.01" />
            <path d="M8.5 16.5a5 5 0 0 1 7 0" />
            <path d="M5 13a10 10 0 0 1 14 0" />
            <path d="M1.5 9.5a15 15 0 0 1 21 0" />
            <line x1="2" y1="2" x2="22" y2="22" />
          </svg>
          {lang === "he" ? `אין חיבור לאינטרנט · ${offlineWords.size} מילים זמינות`
            : lang === "ar" ? `لا يوجد اتصال · ${offlineWords.size} كلمات متاحة بدون إنترنت`
            : lang === "ru" ? `Нет интернета · ${offlineWords.size} слов доступны офлайн`
            : lang === "es" ? `Sin conexión · ${offlineWords.size} palabras disponibles offline`
            : lang === "pt" ? `Sem conexão · ${offlineWords.size} palavras disponíveis offline`
            : lang === "fr" ? `Hors ligne · ${offlineWords.size} mots disponibles`
            : lang === "de" ? `Offline · ${offlineWords.size} Wörter verfügbar`
            : lang === "cs" ? `Bez připojení · ${offlineWords.size} slov dostupných offline`
            : `You're offline · ${offlineWords.size} words available`}
        </div>
      )}
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
          <Link href={href("/notebook")} className="wb-shell-navlink is-active">
            {v2(lang, "navNotebook")}
          </Link>
          <Link href={href("/play")} className="wb-shell-navlink">
            {v2(lang, "navPlay")}
          </Link>
          <Link href={href("/pricing")} className="wb-shell-navlink">
            {v2(lang, "navPricing")}
          </Link>
          <Link href={href("/affiliates")} className="wb-shell-navlink">
            {v2(lang, "navAffiliates")}
          </Link>
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
          {user ? <WbUserMenu /> : null}
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

      </header>

      <main className="wb-notebook-main">
        <div className="wb-notebook-hero">
          <h1 className="wb-notebook-title">{c.title}</h1>
          <p className="wb-notebook-sub">{c.subtitle}</p>
        </div>

        {items === null && !fetchError && (
          <div className="wb-notebook-loading">…</div>
        )}

        {fetchError && (
          <div className="wb-notebook-error">{fetchError}</div>
        )}

        {items && items.length === 0 && (
          <div className="wb-notebook-empty">
            <p>{c.empty}</p>
            <p className="wb-notebook-empty-hint">{c.emptyHint}</p>
            <Link href={href("/")} className="wb-notebook-cta">
              {c.goSearch}
            </Link>
          </div>
        )}

        {items && items.length > 0 && (
          <ul className="wb-notebook-grid">
            {items.map((item) => {
              const offline = offlineWords.has(item.word.toLowerCase());
              return (
                <li key={item.id} className="wb-notebook-card">
                  <Link
                    href={href(`/word/${encodeURIComponent(item.word)}`)}
                    className="wb-notebook-card-link"
                  >
                    <div className="wb-notebook-card-head">
                      <span className="wb-notebook-card-word">{item.word}</span>
                      <span className="wb-notebook-card-lang">{item.language}</span>
                    </div>
                    {item.meaning && (
                      <p className="wb-notebook-card-meaning">{item.meaning}</p>
                    )}
                    {offline && (
                      <div className="wb-notebook-card-offline" aria-label="Available offline">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {lang === "he" ? "זמין אופליין"
                          : lang === "ar" ? "متاح بدون إنترنت"
                          : lang === "ru" ? "Доступно офлайн"
                          : lang === "es" ? "Sin conexión"
                          : lang === "pt" ? "Offline"
                          : lang === "fr" ? "Hors ligne"
                          : lang === "de" ? "Offline"
                          : lang === "cs" ? "Offline"
                          : "Offline"}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      <footer className="wb-home-footer">
        <span>© 2026 Gadit</span>
        <span>·</span>
        <Link href={href("/pricing")}>{v2(lang, "navPricing")}</Link>
        <span>·</span>
        <Link href={href("/privacy")}>Privacy</Link>
        <span>·</span>
        <Link href={href("/terms")}>Terms</Link>
      </footer>
    </div>
  );
}
