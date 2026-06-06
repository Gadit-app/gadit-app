"use client";

/**
 * WordPopover — quick-look definition that floats next to a tapped word.
 *
 * Triggered by long-press (touch) or right-click (desktop) on any word
 * inside a definition. Fetches a one-line preview from /api/quick-define
 * and lets the user open the full result page with a single tap.
 *
 * Lifecycle: caller owns the open/closed state and the anchor element.
 * This component renders into the DOM via a portal so its absolute
 * positioning isn't constrained by the parent's overflow.
 */

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import type { Lang } from "@/lib/i18n";

type Props = {
  /** The word the user tapped. Used to look up the quick definition
   *  and to build the URL of the full result page. */
  word: string;
  /** The DOM element to anchor the popover to (the tapped word span). */
  anchor: HTMLElement;
  /** UI language — drives the API call and localized chrome. */
  lang: Lang;
  /** The HEADWORD of the page the popover was opened from. Becomes a
   *  ?from=<fromWord> query param on the 'Open full definition' link
   *  so the destination page can render a 'back to <fromWord>' chip. */
  fromWord?: string;
  /** Close-on-outside-click / Escape / link-tap. */
  onClose: () => void;
};

type QuickDef =
  | { status: "loading" }
  | { status: "ready"; meaning: string; example: string; language: string }
  | { status: "not-cached" }
  | { status: "error" };

const COPY: Record<Lang, { openFull: string; loading: string; noPreview: string }> = {
  en: { openFull: "Open full definition",   loading: "Loading…",   noPreview: "Tap below to see the full definition." },
  he: { openFull: "פתח הגדרה מלאה",          loading: "טוען...",     noPreview: "הקישו למטה כדי לראות את ההגדרה המלאה." },
  ar: { openFull: "افتح التعريف الكامل",     loading: "جارٍ التحميل…", noPreview: "اضغط أدناه لعرض التعريف الكامل." },
  ru: { openFull: "Открыть полностью",       loading: "Загрузка…",   noPreview: "Нажмите ниже, чтобы открыть полное определение." },
  es: { openFull: "Ver definición completa", loading: "Cargando…",   noPreview: "Toca abajo para ver la definición completa." },
  pt: { openFull: "Ver definição completa",  loading: "Carregando…", noPreview: "Toque abaixo para ver a definição completa." },
  fr: { openFull: "Voir la définition",      loading: "Chargement…", noPreview: "Appuyez ci-dessous pour voir la définition." },
  de: { openFull: "Volle Definition öffnen", loading: "Lädt…",       noPreview: "Tippe unten für die vollständige Definition." },
  cs: { openFull: "Otevřít celou definici",  loading: "Načítání…",   noPreview: "Klepněte níže pro plnou definici." },
};

export function WordPopover({ word, anchor, lang, fromWord, onClose }: Props) {
  const { dir } = useLang();
  const href = useHref();
  const [def, setDef] = useState<QuickDef>({ status: "loading" });
  const popRef = useRef<HTMLDivElement | null>(null);

  // Fetch quick definition. Cache-only on the server — a 404 means the
  // word hasn't been cached yet, and we just offer the 'open full' link
  // without a preview. No fresh OpenAI calls fire from the popover.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/quick-define?word=${encodeURIComponent(word)}&lang=${encodeURIComponent(lang)}`,
        );
        if (cancelled) return;
        if (res.status === 404) {
          setDef({ status: "not-cached" });
          return;
        }
        if (!res.ok) {
          setDef({ status: "error" });
          return;
        }
        const json = (await res.json()) as { meaning?: string; example?: string; language?: string };
        setDef({
          status: "ready",
          meaning: json.meaning ?? "",
          example: json.example ?? "",
          language: json.language ?? "",
        });
      } catch {
        if (!cancelled) setDef({ status: "error" });
      }
    })();
    return () => { cancelled = true; };
  }, [word, lang]);

  // Close on outside click + Escape
  useEffect(() => {
    const onPointer = (e: PointerEvent) => {
      if (!popRef.current?.contains(e.target as Node) && !anchor.contains(e.target as Node)) {
        onClose();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [anchor, onClose]);

  // Position the popover relative to the anchor word. Prefer above the
  // word so it doesn't cover what comes next in the line. Fall back to
  // below when there's no room up top.
  const [position, setPosition] = useState<CSSProperties>({
    position: "absolute",
    visibility: "hidden",
  });
  useEffect(() => {
    if (!popRef.current) return;
    const a = anchor.getBoundingClientRect();
    const p = popRef.current.getBoundingClientRect();
    const margin = 12;
    const viewportW = window.innerWidth;
    const above = a.top - p.height - margin;
    const below = a.bottom + margin;
    const top = above > 8 ? above : below;
    // Center horizontally on the anchor; clamp to viewport so the
    // popover never sticks out past either edge.
    let left = a.left + a.width / 2 - p.width / 2;
    left = Math.max(8, Math.min(viewportW - p.width - 8, left));
    setPosition({
      position: "absolute",
      top: top + window.scrollY,
      left: left + window.scrollX,
      visibility: "visible",
    });
  }, [anchor, def]);

  const c = COPY[lang] ?? COPY.en;

  // Portal target — defer until mounted in the browser
  if (typeof window === "undefined") return null;

  return createPortal(
    <div
      ref={popRef}
      role="dialog"
      aria-label={word}
      dir={dir}
      style={{
        ...position,
        zIndex: 1000,
        maxWidth: "min(360px, calc(100vw - 16px))",
        background: "var(--surface, #FFFFFF)",
        border: "1px solid var(--hairline, #E5E7EB)",
        borderRadius: 14,
        boxShadow: "0 16px 40px rgba(13,22,38,0.18), 0 2px 6px rgba(13,22,38,0.08)",
        padding: 16,
        fontFamily:
          lang === "he" ? "var(--wb-he)"
            : lang === "ar" ? "var(--wb-ar)"
              : "var(--wb-sans, Inter, system-ui, sans-serif)",
      }}
    >
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: "var(--ink, #0B1220)",
          marginBottom: 6,
          overflowWrap: "anywhere",
        }}
      >
        {word}
      </div>
      {/* Meaning — full first definition. This is the answer the user
          is here for; the open-full link below is for the cases where
          they want examples + etymology + idioms. */}
      <div
        style={{
          fontSize: 14,
          color: "var(--ink, #0B1220)",
          lineHeight: 1.55,
          marginBottom: def.status === "ready" && def.example ? 10 : 14,
        }}
      >
        {def.status === "loading"
          ? c.loading
          : def.status === "ready"
            ? def.meaning || c.noPreview
            : c.noPreview}
      </div>
      {/* First example — gives the meaning some context. Italic and
          muted so it doesn't fight with the meaning above. Hidden if
          the API didn't return one. */}
      {def.status === "ready" && def.example && (
        <div
          style={{
            fontSize: 13,
            color: "var(--ink-muted, #6B7280)",
            lineHeight: 1.5,
            marginBottom: 14,
            paddingInlineStart: 10,
            borderInlineStart: "2px solid var(--hairline, #E5E7EB)",
            fontStyle: lang === "he" || lang === "ar" ? "normal" : "italic",
          }}
        >
          {def.example}
        </div>
      )}
      <Link
        href={
          fromWord
            ? href(`/word/${encodeURIComponent(word)}?back=${encodeURIComponent(fromWord)}`)
            : href(`/word/${encodeURIComponent(word)}`)
        }
        onClick={onClose}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 14px",
          borderRadius: 10,
          background: "var(--teal, #0EA5A5)",
          color: "white",
          textDecoration: "none",
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        {c.openFull}
        <span aria-hidden="true">{dir === "rtl" ? "←" : "→"}</span>
      </Link>
    </div>,
    document.body,
  );
}
