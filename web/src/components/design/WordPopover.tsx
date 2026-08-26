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
import { stripLookupDiacritics } from "@/lib/tokenize-words";
import type { Lang } from "@/lib/i18n";

type Props = {
  /** The word the user tapped. Used to look up the quick definition
   *  and to build the URL of the full result page. */
  word: string;
  /** The DOM element to anchor the popover to (the tapped word span). */
  anchor: HTMLElement;
  /** UI language, drives the API call and localized chrome. */
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

const COPY: Record<string, { openFull: string; loading: string; noPreview: string }> = {
  en: { openFull: "Open full definition",   loading: "Loading…",   noPreview: "Tap below to see the full definition." },
  zu: { openFull: "Vula incazelo egcwele",  loading: "Iyalayisha…", noPreview: "Thinta ngezansi ukuze ubone incazelo egcwele." },
  el: { openFull: "Άνοιξε τον πλήρη ορισμό", loading: "Φόρτωση…",    noPreview: "Πάτησε παρακάτω για να δεις τον πλήρη ορισμό." },
  he: { openFull: "פתח הגדרה מלאה",          loading: "טוען...",     noPreview: "הקישו למטה כדי לראות את ההגדרה המלאה." },
  ar: { openFull: "افتح التعريف الكامل",     loading: "جارٍ التحميل…", noPreview: "اضغط أدناه لعرض التعريف الكامل." },
  ru: { openFull: "Открыть полностью",       loading: "Загрузка…",   noPreview: "Нажмите ниже, чтобы открыть полное определение." },
  es: { openFull: "Ver definición completa", loading: "Cargando…",   noPreview: "Toca abajo para ver la definición completa." },
  pt: { openFull: "Ver definição completa",  loading: "Carregando…", noPreview: "Toque abaixo para ver a definição completa." },
  fr: { openFull: "Voir la définition",      loading: "Chargement…", noPreview: "Appuyez ci-dessous pour voir la définition." },
  de: { openFull: "Volle Definition öffnen", loading: "Lädt…",       noPreview: "Tippe unten für die vollständige Definition." },
  cs: { openFull: "Otevřít celou definici",  loading: "Načítání…",   noPreview: "Klepněte níže pro plnou definici." },
  sk: { openFull: "Otvoriť celú definíciu",  loading: "Načítavam…",  noPreview: "Klikni nižšie pre plnú definíciu." },
  it: { openFull: "Apri la definizione completa", loading: "Caricamento…", noPreview: "Tocca sotto per la definizione completa." },
  ja: { openFull: "完全な定義を開く",         loading: "読み込み中…",    noPreview: "下をタップして完全な定義を表示。" },
  hi: { openFull: "पूरी परिभाषा खोलें",      loading: "लोड हो रहा है…", noPreview: "पूरी परिभाषा देखने के लिए नीचे दबाएँ।" },
  am: { openFull: "ሙሉውን ፍቺ ክፈት",          loading: "በመጫን ላይ…",   noPreview: "ሙሉውን ፍቺ ለማየት ከታች ይንኩ።" },
  uk: { openFull: "Відкрити повне визначення", loading: "Завантаження…", noPreview: "Торкніться нижче, щоб побачити повне визначення." },
  tr: { openFull: "Tam tanımı aç", loading: "Yükleniyor…", noPreview: "Tam tanımı görmek için aşağıya dokunun." },
  pl: { openFull: "Otwórz pełną definicję", loading: "Ładowanie…", noPreview: "Dotknij poniżej, aby zobaczyć pełną definicję." },
  fa: { openFull: "باز کردن تعریف کامل", loading: "در حال بارگذاری…", noPreview: "برای دیدن تعریف کامل، پایین را لمس کنید." },
  id: { openFull: "Buka definisi lengkap", loading: "Memuat…", noPreview: "Ketuk di bawah untuk melihat definisi lengkap." },
  nl: { openFull: "Volledige definitie openen", loading: "Laden…", noPreview: "Tik hieronder om de volledige definitie te bekijken." },
  vi: { openFull: "Mở định nghĩa đầy đủ", loading: "Đang tải…", noPreview: "Nhấn bên dưới để xem định nghĩa đầy đủ." },
  fil: { openFull: "Buksan ang buong depinisyon", loading: "Naglo-load…", noPreview: "I-tap sa ibaba para makita ang buong depinisyon." },
  af: { openFull: "Maak volledige definisie oop", loading: "Laai tans…", noPreview: "Tik hieronder om die volledige definisie te sien." },
  sw: { openFull: "Fungua ufafanuzi kamili", loading: "Inapakia…", noPreview: "Gusa hapa chini ili kuona ufafanuzi kamili." },
  "zh-CN": { openFull: "打开完整释义", loading: "加载中…", noPreview: "点击下方查看完整释义。" },
  "zh-TW": { openFull: "開啟完整釋義", loading: "載入中…", noPreview: "點按下方查看完整釋義。" },
  ko: { openFull: "전체 뜻풀이 열기", loading: "불러오는 중…", noPreview: "아래를 눌러 전체 뜻풀이를 확인하세요." },
  th: { openFull: "เปิดคำนิยามฉบับเต็ม", loading: "กำลังโหลด…", noPreview: "แตะด้านล่างเพื่อดูคำนิยามฉบับเต็ม" },
  bn: { openFull: "সম্পূর্ণ সংজ্ঞা খুলুন", loading: "লোড হচ্ছে…", noPreview: "সম্পূর্ণ সংজ্ঞা দেখতে নিচে ট্যাপ করুন।" },
  da: { openFull: "Åbn fuld definition", loading: "Indlæser…", noPreview: "Tryk nedenfor for at se den fulde definition." },
  hu: { openFull: "Teljes meghatározás megnyitása", loading: "Betöltés…", noPreview: "Koppintson lentebb a teljes meghatározás megtekintéséhez." },
};

export function WordPopover({ word, anchor, lang, fromWord, onClose }: Props) {
  const { dir } = useLang();
  const href = useHref();
  const [def, setDef] = useState<QuickDef>({ status: "loading" });
  const popRef = useRef<HTMLDivElement | null>(null);

  // Vowel points (Hebrew niqqud, Arabic tashkeel) are display-only — the cache
  // and word pages are keyed by the plain word. Strip them for every LOOKUP
  // (quick-define fetch + the full-word link) while still showing the vowelized
  // form the user tapped. Without this, tapping a niqqud'd word never resolves.
  const lookupWord = stripLookupDiacritics(word);

  // Fetch quick definition. Cache-only on the server — a 404 means the
  // word hasn't been cached yet, and we just offer the 'open full' link
  // without a preview. No fresh OpenAI calls fire from the popover.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/quick-define?word=${encodeURIComponent(lookupWord)}&lang=${encodeURIComponent(lang)}`,
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
  }, [lookupWord, lang]);

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
              : lang === "ja" ? "var(--wb-jp)"
                : lang === "hi" ? "var(--wb-hi)"
                  : lang === "am" ? "var(--font-noto-am)"
                    : lang === "zh-CN" ? "var(--wb-sc)"
                      : lang === "zh-TW" ? "var(--wb-tc)"
                        : lang === "ko" ? "var(--wb-ko)"
                          : lang === "th" ? "var(--wb-th)"
                            : lang === "bn" ? "var(--wb-bn)"
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
      {/* Meaning, full first definition. This is the answer the user
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
      {/* First example, gives the meaning some context. Italic and
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
            fontStyle: lang === "he" || lang === "ar" || lang === "fa" ? "normal" : "italic",
          }}
        >
          {def.example}
        </div>
      )}
      <Link
        href={
          fromWord
            ? href(`/word/${encodeURIComponent(lookupWord)}?back=${encodeURIComponent(fromWord)}`)
            : href(`/word/${encodeURIComponent(lookupWord)}`)
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
