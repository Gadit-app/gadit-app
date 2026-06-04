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

const LANGS = [
  { code: "he", label: "עברית" },
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
  { code: "ru", label: "Русский" },
  { code: "es", label: "Español" },
  { code: "pt", label: "Português" },
  { code: "fr", label: "Français" },
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
                {l.label}
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
  const c = COPY[lang] ?? COPY.en;

  const [items, setItems] = useState<NotebookItem[] | null>(null);
  const [fetchError, setFetchError] = useState<string>("");

  // Auth + tier gate
  useEffect(() => {
    if (loading) return;
    if (!user) {
      promptLogin(c.title);
      return;
    }
    if (plan === "basic") {
      router.replace("/pricing");
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
      <header className="wb-shell-topbar">
        <Link href="/" className="wb-wordmark" dir="ltr">
          Gad<span className="wb-wordmark-it">it</span>
        </Link>
        <nav className="wb-shell-nav">
          <Link href="/" className="wb-shell-navlink">
            {v2(lang, "navSearch")}
          </Link>
          <Link href="/notebook" className="wb-shell-navlink is-active">
            {v2(lang, "navNotebook")}
          </Link>
          <Link href="/pricing" className="wb-shell-navlink">
            {v2(lang, "navPricing")}
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
          {user ? (
            <Link href="/account" className="wb-avatar" aria-label="Account">
              {user.photoURL ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={user.photoURL} alt="" />
              ) : (
                <span>{(user.email?.[0] || "G").toUpperCase()}</span>
              )}
            </Link>
          ) : null}
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
            <Link href="/" className="wb-notebook-cta">
              {c.goSearch}
            </Link>
          </div>
        )}

        {items && items.length > 0 && (
          <ul className="wb-notebook-grid">
            {items.map((item) => (
              <li key={item.id} className="wb-notebook-card">
                <Link
                  href={`/word/${encodeURIComponent(item.word)}`}
                  className="wb-notebook-card-link"
                >
                  <div className="wb-notebook-card-head">
                    <span className="wb-notebook-card-word">{item.word}</span>
                    <span className="wb-notebook-card-lang">{item.language}</span>
                  </div>
                  {item.meaning && (
                    <p className="wb-notebook-card-meaning">{item.meaning}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>

      <footer className="wb-home-footer">
        <span>© 2026 Gadit</span>
        <span>·</span>
        <Link href="/pricing">{v2(lang, "navPricing")}</Link>
        <span>·</span>
        <Link href="/privacy">Privacy</Link>
        <span>·</span>
        <Link href="/terms">Terms</Link>
      </footer>
    </div>
  );
}
