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

const LABELS: Record<string, { notebook: string; games: string; say: string }> = {
  en: { notebook: "Class Notebook", games: "Word Games", say: "Say it" },
  he: { notebook: "מחברת הכיתה", games: "משחקי מילים", say: "תגיד את זה" },
  zu: { notebook: "Incwadi Yekilasi", games: "Imidlalo Yamagama", say: "Yisho" },
  el: { notebook: "Τετράδιο τάξης", games: "Παιχνίδια λέξεων", say: "Πες το" },
  hi: { notebook: "कक्षा की नोटबुक", games: "शब्द खेल", say: "कहो" },
  am: { notebook: "የክፍል ማስታወሻ ደብተር", games: "የቃላት ጨዋታዎች", say: "ተናገረው" },
};

export function ClassroomTopbar({ code, lang }: { code: string; lang: string }) {
  const href = useHref();
  const c = LABELS[lang] ?? LABELS.en;
  return (
    <header className="wb-shell-topbar">
      <Link href={href(`/c/${code}`)} className="wb-shell-wordmark" dir="ltr" aria-label="Gadit">
        Gad<span className="wb-shell-wordmark-it">it</span>
      </Link>
      <nav className="wb-shell-nav">
        <Link href={href(`/c/${code}/notebook`)} className="wb-shell-navlink">{c.notebook}</Link>
        <Link href={href(`/c/${code}/games`)} className="wb-shell-navlink">{c.games}</Link>
        <Link href={href(`/say`)} className="wb-shell-navlink">{c.say}</Link>
      </nav>
    </header>
  );
}
