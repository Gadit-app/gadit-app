"use client";

import Link from "next/link";
import { useHref } from "@/lib/href";

/**
 * The classroom topbar for the /c/<CODE> surface: Gadit wordmark, Class
 * Notebook, Word Games, and Say it. ClassroomKidClient renders its own richer
 * header (with the school logo + lang switch), but the WORD page in classroom
 * mode had NO navigation at all — a kid who looked up a word was stranded with
 * no way back to the notebook or games. This shared bar restores that nav.
 *
 * Labels mirror ClassroomKidClient's classroom copy (he/en/zu/el/hi/am, English
 * fallback) so the two surfaces read identically; Say it comes from the same
 * pronunciation-tool nav label used elsewhere.
 */

const LABELS: Record<string, { notebook: string; games: string; say: string; back: string }> = {
  en: { notebook: "Class Notebook", games: "Word Games", say: "Say it", back: "Back" },
  he: { notebook: "מחברת הכיתה", games: "משחקי מילים", say: "תגיד את זה", back: "חזרה" },
  zu: { notebook: "Incwadi Yekilasi", games: "Imidlalo Yamagama", say: "Yisho", back: "Emuva" },
  el: { notebook: "Τετράδιο τάξης", games: "Παιχνίδια λέξεων", say: "Πες το", back: "Πίσω" },
  hi: { notebook: "कक्षा की नोटबुक", games: "शब्द खेल", say: "कहो", back: "वापस" },
  am: { notebook: "የክፍል ማስታወሻ ደብተር", games: "የቃላት ጨዋታዎች", say: "ተናገረው", back: "ተመለስ" },
};

export function ClassroomTopbar({ code, lang }: { code: string; lang: string }) {
  const href = useHref();
  const c = LABELS[lang] ?? LABELS.en;
  const rtl = lang === "he";
  return (
    <header className="wb-shell-topbar">
      {/* Logo is the brand, not a button (Gadi 2026-08-25: "logo is a logo,
          back is back"). It does not navigate. */}
      <span className="wb-shell-wordmark" dir="ltr" aria-label="Gadit">
        Gad<span className="wb-shell-wordmark-it">it</span>
      </span>
      <nav className="wb-shell-nav">
        <Link href={href(`/c/${code}/notebook`)} className="wb-shell-navlink">{c.notebook}</Link>
        <Link href={href(`/c/${code}/games`)} className="wb-shell-navlink">{c.games}</Link>
        <Link href={href(`/say`)} className="wb-shell-navlink">{c.say}</Link>
      </nav>
      {/* Explicit back-to-classroom control: a clear arrowed button, distinct
          from the logo. */}
      <div className="wb-shell-actions">
        <Link
          href={href(`/c/${code}`)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none",
            fontSize: 14, fontWeight: 600, color: "var(--teal, #0EA5A5)",
            padding: "6px 12px", borderRadius: 999, border: "1px solid var(--teal, #0EA5A5)",
          }}
        >
          <span aria-hidden="true">{rtl ? "→" : "←"}</span>{c.back}
        </Link>
      </div>
    </header>
  );
}
