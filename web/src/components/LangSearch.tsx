"use client";

/**
 * LangSearchList: the search field at the top of a language picker, and the
 * rows it filters (Gadi 2026-10-26: 41 languages are hard to find in a long
 * list). Render it INSIDE the picker's scrolling list, only while the picker
 * is open, in place of `useLangRows(lang).map(...)`:
 *
 *   <LangSearchList lang={lang} onPick={pick} onClose={close}>
 *     {(rows) => rows.map((l) => <li key={l.code}>...</li>)}
 *   </LangSearchList>
 *
 * It filters as the viewer types (the name in the viewer's language, the
 * native name, the English name, the code and a few aliases; see
 * searchLangs in lang-groups.ts), shows the languages flat while searching,
 * picks the first match on Enter, clears on Escape (a second Escape closes),
 * and sticks to the top while the list scrolls. On a desktop it takes the
 * focus when the picker opens; on a phone it does not (the keyboard would
 * cover the list). `item` is "li" inside a <ul>, "div" elsewhere.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { getLangDir, type Lang } from "@/lib/i18n";
import { useLangRows, type LangRow } from "@/lib/lang-groups";

/** [placeholder, no results], native in every UI language. */
const COPY: Record<string, [string, string]> = {
  en: ["Search language", "No language found"],
  he: ["חיפוש שפה", "לא נמצאה שפה"],
  ar: ["ابحث عن لغة", "لم يتم العثور على لغة"],
  ru: ["Поиск языка", "Язык не найден"],
  es: ["Buscar idioma", "No se encontró el idioma"],
  pt: ["Pesquisar idioma", "Nenhum idioma encontrado"],
  fr: ["Rechercher une langue", "Aucune langue trouvée"],
  de: ["Sprache suchen", "Keine Sprache gefunden"],
  cs: ["Hledat jazyk", "Jazyk nenalezen"],
  sk: ["Hľadať jazyk", "Jazyk sa nenašiel"],
  it: ["Cerca lingua", "Nessuna lingua trovata"],
  ja: ["言語を検索", "言語が見つかりません"],
  hi: ["भाषा खोजें", "कोई भाषा नहीं मिली"],
  am: ["ቋንቋ ይፈልጉ", "ቋንቋ አልተገኘም"],
  uk: ["Пошук мови", "Мову не знайдено"],
  tr: ["Dil ara", "Dil bulunamadı"],
  pl: ["Szukaj języka", "Nie znaleziono języka"],
  fa: ["جستجوی زبان", "زبانی پیدا نشد"],
  id: ["Cari bahasa", "Bahasa tidak ditemukan"],
  nl: ["Taal zoeken", "Geen taal gevonden"],
  el: ["Αναζήτηση γλώσσας", "Δεν βρέθηκε γλώσσα"],
  zu: ["Sesha ulimi", "Alukho ulimi olutholakele"],
  vi: ["Tìm ngôn ngữ", "Không tìm thấy ngôn ngữ"],
  fil: ["Maghanap ng wika", "Walang nahanap na wika"],
  af: ["Soek taal", "Geen taal gevind nie"],
  sw: ["Tafuta lugha", "Hakuna lugha iliyopatikana"],
  "zh-CN": ["搜索语言", "未找到语言"],
  "zh-TW": ["搜尋語言", "找不到語言"],
  ko: ["언어 검색", "언어를 찾을 수 없습니다"],
  th: ["ค้นหาภาษา", "ไม่พบภาษา"],
  bn: ["ভাষা খুঁজুন", "কোনো ভাষা পাওয়া যায়নি"],
  da: ["Søg efter sprog", "Intet sprog fundet"],
  hu: ["Nyelv keresése", "Nem található nyelv"],
  xh: ["Khangela ulwimi", "Akukho lwimi lufunyenweyo"],
  nso: ["Nyaka polelo", "Ga go polelo yeo e hweditšwego"],
  tn: ["Batla puo", "Ga go puo e e bonweng"],
  st: ["Batla puo", "Ha ho puo e fumanweng"],
  ts: ["Lava ririmi", "A ku na ririmi leri kumekeke"],
  ss: ["Sesha lulwimi", "Akukho lulwimi lolutfolakele"],
  ve: ["Ṱoḓa luambo", "A hu na luambo lwo wanalaho"],
  nr: ["Funa ilimi", "Akukho limi elitholakeleko"],
};
export const langSearchCopy = (lang: string): [string, string] => COPY[lang] ?? COPY.en;

export function LangSearchList({
  lang,
  onPick,
  onClose,
  item = "li",
  children,
}: {
  /** The viewer's UI language. */
  lang: string;
  /** A language chosen with Enter (the first match). */
  onPick: (code: Lang) => void;
  /** Escape on an empty field. Pickers that already close on Escape may leave it out. */
  onClose?: () => void;
  item?: "li" | "div";
  /** Renders the rows exactly as the picker always has. */
  children: (rows: LangRow[]) => ReactNode;
}) {
  const [query, setQuery] = useState("");
  const rows = useLangRows(lang, query);
  const inputRef = useRef<HTMLInputElement>(null);
  const [placeholder, none] = langSearchCopy(lang);
  const dir = getLangDir(lang as Lang);
  const Item = item;

  // Desktop only: a mouse and a hover-capable screen. A phone would pop its keyboard over the list.
  useEffect(() => {
    try {
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) inputRef.current?.focus({ preventScroll: true });
    } catch { /* no matchMedia: no autofocus */ }
  }, []);

  const searching = query.trim() !== "";
  return (
    <>
      <Item className="lang-search" role="presentation" dir={dir}>
        <svg className="lang-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          className="lang-search-input"
          dir={dir}
          value={query}
          placeholder={placeholder}
          aria-label={placeholder}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="go"
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const first = searching ? rows.find((r) => !r.group) : undefined;
              if (first) { e.preventDefault(); onPick(first.code); }
            } else if (e.key === "Escape") {
              if (query) {
                // Clear first; the picker's own Escape listener (on document) must not close it too.
                e.preventDefault();
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
                setQuery("");
              } else {
                onClose?.();
              }
            }
          }}
        />
        {/* Lists are as wide as their rows; this invisible copy of the placeholder makes room for it too. */}
        <span className="lang-search-sizer" aria-hidden="true">{placeholder}</span>
      </Item>
      {children(rows)}
      {searching && rows.length === 0 && (
        <Item className="lang-search-empty" role="presentation" dir={dir}>{none}</Item>
      )}
    </>
  );
}
