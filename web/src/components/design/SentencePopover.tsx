"use client";

/**
 * SentencePopover — the Reader's sentence-level companion to WordPopover.
 *
 * Tap the "understand this sentence" control after a sentence and this floats
 * next to it with a short, plain explanation of what the sentence means, in the
 * reader's own language (/api/understand-sentence). Deliberately a comprehension
 * aid, not a raw translation (positioning: Gadit teaches understanding, it is
 * not a translator). Mental model: tap a word -> the word's meaning; tap a
 * sentence -> the sentence's meaning. Gadi 2026-09-03.
 */

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useLang } from "@/lib/lang-context";
import { useAuth } from "@/lib/auth-context";
import type { Lang } from "@/lib/i18n";

type Props = {
  sentence: string;
  anchor: HTMLElement;
  lang: Lang;
  onClose: () => void;
};

type State =
  | { status: "loading" }
  | { status: "ready"; meaning: string }
  | { status: "login" }
  | { status: "error" };

const COPY: Record<string, { title: string; loading: string; error: string; login: string }> = {
  en: { title: "What this sentence means", loading: "Reading…", error: "Could not load. Try again.", login: "Sign in to use this." },
  he: { title: "מה המשפט הזה אומר", loading: "קורא…", error: "לא הצלחנו לטעון. נסו שוב.", login: "התחברו כדי להשתמש בזה." },
  ar: { title: "ماذا تعني هذه الجملة", loading: "جارٍ القراءة…", error: "تعذّر التحميل. حاول مرة أخرى.", login: "سجّل الدخول لاستخدام هذا." },
  ru: { title: "Что означает это предложение", loading: "Читаю…", error: "Не удалось загрузить. Попробуйте снова.", login: "Войдите, чтобы использовать это." },
  es: { title: "Qué significa esta frase", loading: "Leyendo…", error: "No se pudo cargar. Inténtalo de nuevo.", login: "Inicia sesión para usar esto." },
  pt: { title: "O que esta frase significa", loading: "Lendo…", error: "Não foi possível carregar. Tente novamente.", login: "Entre para usar isto." },
  fr: { title: "Ce que signifie cette phrase", loading: "Lecture…", error: "Échec du chargement. Réessayez.", login: "Connectez-vous pour l'utiliser." },
  de: { title: "Was dieser Satz bedeutet", loading: "Wird gelesen…", error: "Laden fehlgeschlagen. Erneut versuchen.", login: "Melde dich an, um dies zu nutzen." },
  uk: { title: "Що означає це речення", loading: "Читаю…", error: "Не вдалося завантажити. Спробуйте ще раз.", login: "Увійдіть, щоб скористатися цим." },
  fa: { title: "این جمله یعنی چه", loading: "در حال خواندن…", error: "بارگذاری نشد. دوباره تلاش کنید.", login: "برای استفاده وارد شوید." },
};

export function SentencePopover({ sentence, anchor, lang, onClose }: Props) {
  const { dir } = useLang();
  const { user } = useAuth();
  const [state, setState] = useState<State>({ status: "loading" });
  const popRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!user) { if (!cancelled) setState({ status: "login" }); return; }
        const idToken = await user.getIdToken();
        const res = await fetch("/api/understand-sentence", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
          body: JSON.stringify({ sentence, lang }),
        });
        if (cancelled) return;
        if (res.status === 401) { setState({ status: "login" }); return; }
        if (!res.ok) { setState({ status: "error" }); return; }
        const json = (await res.json()) as { meaning?: string };
        setState(json.meaning ? { status: "ready", meaning: json.meaning } : { status: "error" });
      } catch {
        if (!cancelled) setState({ status: "error" });
      }
    })();
    return () => { cancelled = true; };
  }, [sentence, lang, user]);

  // Close on outside click + Escape.
  useEffect(() => {
    const onPointer = (e: PointerEvent) => {
      if (!popRef.current?.contains(e.target as Node) && !anchor.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [anchor, onClose]);

  const [position, setPosition] = useState<CSSProperties>({ position: "absolute", visibility: "hidden" });
  useEffect(() => {
    if (!popRef.current) return;
    const a = anchor.getBoundingClientRect();
    const p = popRef.current.getBoundingClientRect();
    const margin = 12;
    const above = a.top - p.height - margin;
    const below = a.bottom + margin;
    const top = above > 8 ? above : below;
    let left = a.left + a.width / 2 - p.width / 2;
    left = Math.max(8, Math.min(window.innerWidth - p.width - 8, left));
    setPosition({ position: "absolute", top: top + window.scrollY, left: left + window.scrollX, visibility: "visible" });
  }, [anchor, state]);

  const c = COPY[lang] ?? COPY.en;
  if (typeof window === "undefined") return null;

  return createPortal(
    <div
      ref={popRef}
      role="dialog"
      dir={dir}
      style={{
        ...position, zIndex: 1000, maxWidth: "min(380px, calc(100vw - 16px))",
        background: "var(--surface, #FFFFFF)", border: "1px solid var(--hairline, #E5E7EB)",
        borderRadius: 14, boxShadow: "0 16px 40px rgba(13,22,38,0.18), 0 2px 6px rgba(13,22,38,0.08)",
        padding: 16, fontFamily: "var(--wb-sans, Inter, system-ui, sans-serif)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: "0.02em", color: "var(--teal-deep, #0E7490)", textTransform: "uppercase" }}>
          {c.title}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            flex: "none", width: 26, height: 26, marginTop: -2, display: "grid", placeItems: "center",
            background: "var(--paper, #F3F4F6)", color: "var(--ink-muted, #6B7280)",
            border: "1px solid var(--hairline, #E5E7EB)", borderRadius: 8, cursor: "pointer", fontSize: 15, lineHeight: 1, padding: 0,
          }}
        >
          ✕
        </button>
      </div>
      <div style={{ fontSize: 15, color: "var(--ink, #0B1220)", lineHeight: 1.6 }}>
        {state.status === "loading" ? c.loading
          : state.status === "ready" ? state.meaning
            : state.status === "login" ? c.login
              : c.error}
      </div>
    </div>,
    document.body,
  );
}
