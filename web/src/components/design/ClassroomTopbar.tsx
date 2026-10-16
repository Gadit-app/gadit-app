"use client";

import Link from "next/link";
import { useHref } from "@/lib/href";
import { BackLink } from "@/components/BackLink";

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
  xh: { notebook: "Incwadi yeklasi", games: "Imidlalo yamagama", say: "Yithethe", back: "Buyela umva" },
  nso: { notebook: "Puku ya Mantšu ya Phapoši", games: "Dipapadi tša Mantšu", say: "E bolele", back: "Morago" },
  tn: { notebook: "Bukana ya Phaposi", games: "Metshameko ya Mafoko", say: "E bue", back: "Morago" },
  st: { notebook: "Bukana ya Tlelase", games: "Dipapadi tsa Mantswe", say: "E bue", back: "Morao" },
  ts: { notebook: "Buku ya Marito ya Tlilasi", games: "Mintlangu ya Marito", say: "Swi vule", back: "Endzhaku" },
  ss: { notebook: "Incwadzi Yelikilasi", games: "Imidlalo Yemagama", say: "Kusho", back: "Emuva" },
  ve: { notebook: "Bugu ya kilasi", games: "Mitambo ya maipfi", say: "Ḽi ambeni", back: "Murahu" },
  nr: { notebook: "Ibhuku Lekilasi", games: "Imidlalo Yamezwi", say: "Kutjho", back: "Emuva" },
  el: { notebook: "Τετράδιο τάξης", games: "Παιχνίδια λέξεων", say: "Πες το", back: "Πίσω" },
  hi: { notebook: "कक्षा की नोटबुक", games: "शब्द खेल", say: "कहो", back: "वापस" },
  am: { notebook: "የክፍል ማስታወሻ ደብተር", games: "የቃላት ጨዋታዎች", say: "ተናገረው", back: "ተመለስ" },
  ar: { notebook: "دفتر الصف", games: "ألعاب الكلمات", say: "قلها", back: "رجوع" },
  ru: { notebook: "Тетрадь класса", games: "Игры со словами", say: "Скажи это", back: "Назад" },
  es: { notebook: "Cuaderno de la clase", games: "Juegos de palabras", say: "Dilo", back: "Volver" },
  pt: { notebook: "Caderno da turma", games: "Jogos de palavras", say: "Fale", back: "Voltar" },
  fr: { notebook: "Cahier de la classe", games: "Jeux de mots", say: "Dis-le", back: "Retour" },
  de: { notebook: "Klassenheft", games: "Wortspiele", say: "Sag es", back: "Zurück" },
  cs: { notebook: "Sešit třídy", games: "Slovní hry", say: "Řekni to", back: "Zpět" },
  sk: { notebook: "Zošit triedy", games: "Slovné hry", say: "Povedz to", back: "Späť" },
  it: { notebook: "Quaderno della classe", games: "Giochi di parole", say: "Dillo", back: "Indietro" },
  ja: { notebook: "クラスのノート", games: "ことばゲーム", say: "言ってみよう", back: "もどる" },
  uk: { notebook: "Зошит класу", games: "Ігри зі словами", say: "Скажи це", back: "Назад" },
  tr: { notebook: "Sınıf Defteri", games: "Kelime Oyunları", say: "Söyle", back: "Geri" },
  pl: { notebook: "Zeszyt klasy", games: "Gry słowne", say: "Powiedz to", back: "Wstecz" },
  fa: { notebook: "دفتر کلاس", games: "بازی‌های کلمه", say: "بگو", back: "بازگشت" },
  id: { notebook: "Buku Catatan Kelas", games: "Permainan Kata", say: "Ucapkan", back: "Kembali" },
  nl: { notebook: "Klassenschrift", games: "Woordspellen", say: "Zeg het", back: "Terug" },
  vi: { notebook: "Sổ tay của lớp", games: "Trò chơi từ vựng", say: "Nói thử", back: "Quay lại" },
  fil: { notebook: "Kuwaderno ng Klase", games: "Mga Laro sa Salita", say: "Sabihin mo", back: "Bumalik" },
  af: { notebook: "Klasnotaboek", games: "Woordspeletjies", say: "Sê dit", back: "Terug" },
  sw: { notebook: "Daftari la Darasa", games: "Michezo ya Maneno", say: "Sema", back: "Rudi" },
  "zh-CN": { notebook: "班级笔记本", games: "单词游戏", say: "说一说", back: "返回" },
  "zh-TW": { notebook: "班級筆記本", games: "單字遊戲", say: "說說看", back: "返回" },
  ko: { notebook: "우리 반 공책", games: "낱말 게임", say: "말해 보기", back: "뒤로" },
  th: { notebook: "สมุดของห้องเรียน", games: "เกมคำศัพท์", say: "พูดดูสิ", back: "กลับ" },
  bn: { notebook: "ক্লাসের খাতা", games: "শব্দের খেলা", say: "বলো", back: "ফিরে যাও" },
  da: { notebook: "Klassens notesbog", games: "Ordspil", say: "Sig det", back: "Tilbage" },
  hu: { notebook: "Osztályfüzet", games: "Szójátékok", say: "Mondd ki", back: "Vissza" },
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
        <BackLink
          href={href(`/c/${code}`)}
          anyPrevious
          style={{
            display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none",
            fontSize: 14, fontWeight: 600, color: "var(--teal, #0EA5A5)",
            padding: "6px 12px", borderRadius: 999, border: "1px solid var(--teal, #0EA5A5)",
          }}
        >
          <span aria-hidden="true">{rtl ? "→" : "←"}</span>{c.back}
        </BackLink>
      </div>
    </header>
  );
}
