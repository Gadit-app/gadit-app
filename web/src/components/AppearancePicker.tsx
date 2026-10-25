"use client";

/**
 * AppearancePicker — compact "choose your look" DROPDOWN (Gadi 2026-08-16).
 * Lives in the topbar so a kid can change their skin from any screen (word
 * collection, games, search), not from inside one page. Kids pick a playful
 * skin the way they pick a Roblox skin. Sets the global data-theme via
 * useTheme() (localStorage + cross-tab sync in @/lib/appearance); purely
 * visual, no server state.
 *
 * Kids gamification v2 (unlock economy, 2026-08-22): the 5 original skins are
 * free, but new skins (sunset/aurora/cosmos/lava) UNLOCK as the child climbs
 * ranks. Availability is derived from the child's EARNED rank, not gift
 * points, so it can't be faked. Locked skins show a 🔒 and the rank needed.
 */

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/lang-context";
import { useAuth } from "@/lib/auth-context";
import {
  THEMES,
  KID_THEMES,
  ADULT_THEMES,
  useTheme,
  themeName,
  type ThemeMeta,
} from "@/lib/appearance";
import { RANKS } from "@/lib/gamification";
import { useServerRank } from "@/lib/use-rank-state";
import { rankLabel } from "@/lib/gamification-labels";

// Store micro-copy (en + he, English fallback — matches the existing picker
// label pattern; full-language coverage is a follow-up).
const STORE_COPY: Record<string, { balance: string; buy: string; owned: string; ask: string; need: string; orRank: string }> = {
  en: { balance: "Gift points", buy: "Get for", owned: "Yours", ask: "Ask a parent to unlock skins", need: "{n} 🎁 to go", orRank: "Opens at {rank}" },
  ar: { balance: "نقاط الهدايا", buy: "احصل عليه بـ", owned: "لك", ask: "اطلب من أحد الوالدين فتح المظاهر", need: "باقي {n} 🎁", orRank: "يفتح عند {rank}" },
  ru: { balance: "Подарочные очки", buy: "Купить за", owned: "У тебя есть", ask: "Попроси родителей открыть образы", need: "Осталось {n} 🎁", orRank: "Открывается на {rank}" },
  es: { balance: "Puntos de regalo", buy: "Consíguelo por", owned: "Tuyo", ask: "Pide a mamá o papá que desbloqueen skins", need: "Faltan {n} 🎁", orRank: "Se abre en {rank}" },
  pt: { balance: "Pontos de presente", buy: "Comprar por", owned: "Seu", ask: "Peça a um dos pais para desbloquear skins", need: "Faltam {n} 🎁", orRank: "Abre em {rank}" },
  fr: { balance: "Points cadeaux", buy: "Obtenir pour", owned: "À toi", ask: "Demande à un parent de débloquer les skins", need: "Encore {n} 🎁", orRank: "S'ouvre à {rank}" },
  de: { balance: "Geschenkpunkte", buy: "Holen für", owned: "Dir gehört's", ask: "Bitte ein Elternteil, Skins freizuschalten", need: "Noch {n} 🎁", orRank: "Öffnet sich bei {rank}" },
  cs: { balance: "Dárkové body", buy: "Pořiď za", owned: "Máš", ask: "Požádej rodiče, ať odemkne vzhledy", need: "Zbývá {n} 🎁", orRank: "Otevře se na {rank}" },
  sk: { balance: "Darčekové body", buy: "Získaj za", owned: "Máš", ask: "Popros rodiča, nech odomkne vzhľady", need: "Zostáva {n} 🎁", orRank: "Otvorí sa na {rank}" },
  it: { balance: "Punti regalo", buy: "Ottieni per", owned: "Tuo", ask: "Chiedi a un genitore di sbloccare gli skin", need: "Mancano {n} 🎁", orRank: "Si sblocca a {rank}" },
  ja: { balance: "ギフトポイント", buy: "こうかんする", owned: "もっているよ", ask: "おうちの人にスキンをひらいてもらおう", need: "あと {n} 🎁", orRank: "{rank}でひらくよ" },
  hi: { balance: "गिफ्ट पॉइंट", buy: "पाओ इतने में", owned: "तुम्हारा", ask: "स्किन खोलने के लिए मम्मी-पापा से कहो", need: "बस {n} 🎁 और", orRank: "{rank} पर खुलता है" },
  am: { balance: "የስጦታ ነጥቦች", buy: "ግዛ በ", owned: "ያንተ", ask: "ስኪኖችን ለመክፈት ወላጅ ጠይቅ", need: "ቀሪ {n} 🎁", orRank: "በ{rank} ይከፈታል" },
  uk: { balance: "Подарункові бали", buy: "Купити за", owned: "Твій", ask: "Попроси батьків відкрити образи", need: "Ще {n} 🎁", orRank: "Відкривається на {rank}" },
  tr: { balance: "Hediye puanları", buy: "Şununla al", owned: "Senin", ask: "Görünümleri açmak için bir yetişkinden yardım iste", need: "{n} 🎁 kaldı", orRank: "{rank} seviyesinde açılır" },
  pl: { balance: "Punkty prezentowe", buy: "Kup za", owned: "Twoje", ask: "Poproś rodzica o odblokowanie skórek", need: "Jeszcze {n} 🎁", orRank: "Odblokowuje się na poziomie {rank}" },
  fa: { balance: "امتیازهای هدیه", buy: "بخر با", owned: "مال توست", ask: "از یکی از والدین بخواه ظاهرها را باز کند", need: "{n} 🎁 مانده", orRank: "در {rank} باز می‌شود" },
  id: { balance: "Poin hadiah", buy: "Ambil seharga", owned: "Milikmu", ask: "Minta orang tua membuka tampilan", need: "Kurang {n} 🎁 lagi", orRank: "Terbuka di {rank}" },
  nl: { balance: "Cadeaupunten", buy: "Haal voor", owned: "Van jou", ask: "Vraag een ouder om skins te ontgrendelen", need: "Nog {n} 🎁", orRank: "Gaat open bij {rank}" },
  el: { balance: "Πόντοι δώρου", buy: "Πάρε με", owned: "Δικό σου", ask: "Ζήτα από έναν γονιό να ξεκλειδώσει εμφανίσεις", need: "Απομένουν {n} 🎁", orRank: "Ξεκλειδώνει στο {rank}" },
  zu: { balance: "Amaphuzu esipho", buy: "Thenga ngo", owned: "Okwakho", ask: "Cela umzali avule izimo", need: "Kusele {n} 🎁", orRank: "Kuvuleka ku-{rank}" },
  xh: { balance: "Amanqaku ezipho", buy: "Fumana nge", owned: "Yeyakho", ask: "Cela umzali ukuze avule iinkangeleko", need: "Kusele {n} 🎁", orRank: "Iyavuleka ku-{rank}" },
  nso: { balance: "Dintlha tša dimpho", buy: "Hwetša ka", owned: "Ke sa gago", ask: "Kgopela motswadi go bula diaparo", need: "Go šetše {n} 🎁", orRank: "E bula go {rank}" },
  tn: { balance: "Dintlha tsa dimpho", buy: "Bona ka", owned: "Ke sa gago", ask: "Kopa motsadi go bula diaparo tsa sekirini", need: "Go setse {n} 🎁", orRank: "E bulega kwa {rank}" },
  st: { balance: "Dintlha tsa dimpho", buy: "Fumana ka", owned: "Ke ya hao", ask: "Kopa motswadi hore a bule dikhabiso", need: "{n} 🎁 di setse", orRank: "E bula ho {rank}" },
  ts: { balance: "Tinhlayo ta tinyiko", buy: "Kuma hi", owned: "Swa wena", ask: "Kombela mutswari a pfula swiambalo leswi", need: "Ku sale {n} 🎁", orRank: "Yi pfuleka eka {rank}" },
  ss: { balance: "Emaphuzu etipho", buy: "Tfola nga", owned: "Kungekwakho", ask: "Cela umtali akuvulele tikhumba", need: "Kusele {n} 🎁", orRank: "Kuyavuleka ku-{rank}" },
  ve: { balance: "Maraga a mpho", buy: "Wanani nga", owned: "Ndi zwaṋu", ask: "Humbelani mubebi uri a vule zwivhonalo", need: "Ho sala {n} 🎁", orRank: "Zwi vulea kha {rank}" },
  nr: { balance: "Amaphuzu wesipho", buy: "Thola nge", owned: "Ngokwakho", ask: "Bawa umbelethi bona akuvulele iinkhumba", need: "Kusele {n} 🎁", orRank: "Kuvuleka ku-{rank}" },
  vi: { balance: "Điểm quà tặng", buy: "Đổi với", owned: "Của bạn", ask: "Nhờ bố mẹ mở khóa giao diện", need: "Còn thiếu {n} 🎁", orRank: "Mở ở {rank}" },
  fil: { balance: "Mga gift point", buy: "Kunin sa", owned: "Sa iyo na", ask: "Humingi sa magulang para ma-unlock ang mga skin", need: "{n} 🎁 na lang", orRank: "Magbubukas sa {rank}" },
  af: { balance: "Geskenkpunte", buy: "Kry vir", owned: "Joune", ask: "Vra 'n ouer om skins oop te sluit", need: "{n} 🎁 oor", orRank: "Maak oop by {rank}" },
  sw: { balance: "Pointi za zawadi", buy: "Pata kwa", owned: "Yako", ask: "Muombe mzazi afungue skini", need: "{n} 🎁 zimebaki", orRank: "Hufunguka kwenye {rank}" },
  "zh-CN": { balance: "礼物点数", buy: "兑换", owned: "已拥有", ask: "让家长来解锁皮肤吧", need: "还差 {n} 🎁", orRank: "在 {rank} 解锁" },
  "zh-TW": { balance: "禮物點數", buy: "兌換", owned: "已擁有", ask: "讓家長來解鎖造型吧", need: "還差 {n} 🎁", orRank: "在 {rank} 解鎖" },
  ko: { balance: "선물 포인트", buy: "교환하기", owned: "보유 중", ask: "부모님께 스킨 잠금 해제를 부탁해 보세요", need: "{n} 🎁 남았어요", orRank: "{rank}에서 열려" },
  th: { balance: "แต้มของขวัญ", buy: "แลกด้วย", owned: "ของคุณแล้ว", ask: "ขอให้ผู้ปกครองช่วยปลดล็อกสกินให้", need: "อีก {n} 🎁", orRank: "เปิดที่ {rank}" },
  bn: { balance: "উপহার পয়েন্ট", buy: "কিনে নাও", owned: "তোমার", ask: "স্কিন আনলক করতে অভিভাবককে বলো", need: "আর {n} 🎁 বাকি", orRank: "{rank}-এ খুলবে" },
  da: { balance: "Gavepoint", buy: "Få for", owned: "Din", ask: "Bed en voksen om at låse skins op", need: "{n} 🎁 tilbage", orRank: "Åbner ved {rank}" },
  hu: { balance: "Ajándékpontok", buy: "Beszerzés", owned: "A tiéd", ask: "Kérj meg egy szülőt, hogy oldja fel a skineket", need: "Még {n} 🎁", orRank: "{rank} szinten nyílik meg" },
  he: { balance: "נקודות מתנה", buy: "קבל תמורת", owned: "שלך", ask: "בקש מההורה כדי לפתוח סקינים", need: "עוד {n} 🎁", orRank: "נפתח בדרגת {rank}" },
};
function storeCopy(lang: string) { return STORE_COPY[lang] ?? STORE_COPY.en; }

export function AppearancePicker({ scope = "kid" }: { scope?: "all" | "kid" | "adult" }) {
  const { lang } = useLang();
  const { user } = useAuth();
  const [theme, setTheme] = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const copy = storeCopy(lang);

  const list: ThemeMeta[] =
    scope === "kid"
      ? [THEMES[0], ...KID_THEMES] // Light (classic) + the skins
      : scope === "adult"
        ? ADULT_THEMES
        : THEMES;

  const current = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  // The kid's rank as the server computes it (/api/rank: new words +
  // completed practices, never below the rank floor), so the unlocked skins
  // match the rank the child sees.
  const serverRank = useServerRank(user, scope === "kid");
  const rankIndex = serverRank?.rankIndex ?? 0;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // A skin is unlocked PURELY by rank (= distinct words learned). Free skins
  // have no rank gate; earnable skins unlock when their rank is reached. No
  // gift-points / store path anymore (Gadi 2026-08-27).
  function skinState(t: ThemeMeta) {
    const rankReached = t.unlockAtRank != null && rankIndex >= t.unlockAtRank;
    const isFree = t.unlockAtRank == null;
    const selectable = isFree || rankReached;
    return { selectable, rankReached };
  }

  return (
    <div className="wb-skin-dd" ref={ref}>
      <button
        type="button"
        className="wb-skin-dd-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={themeName(current, lang)}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="wb-skin-emoji" aria-hidden="true">{current.emoji}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="wb-skin-dd-menu" role="listbox">
          {list.map((t) => {
            const st = skinState(t);
            const justUnlocked = t.unlockAtRank != null && t.unlockAtRank === rankIndex;
            const locked = !st.selectable;
            const onClick = () => { if (st.selectable) { setTheme(t.id); setOpen(false); } };
            return (
              <button
                key={t.id}
                type="button"
                role="option"
                aria-selected={theme === t.id}
                aria-disabled={locked}
                className={`wb-skin-dd-item${theme === t.id ? " is-active" : ""}`}
                style={locked ? { cursor: "not-allowed", opacity: 0.65 } : undefined}
                onClick={onClick}
              >
                <span className="wb-skin-emoji" aria-hidden="true">{locked ? "🔒" : t.emoji}</span>
                <span className="wb-skin-name" style={{ display: "flex", flexDirection: "column", lineHeight: 1.25, minWidth: 0 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    {themeName(t, lang)}
                    {justUnlocked && st.selectable && <span aria-hidden="true">✨</span>}
                  </span>
                  {/* Locked → show the rank (words) it unlocks at. */}
                  {locked && t.unlockAtRank != null && (
                    <span className="wb-skin-earnhint">
                      {copy.orRank.replace("{rank}", rankLabel(RANKS[t.unlockAtRank].key, lang))}
                    </span>
                  )}
                </span>
                <span className="wb-skin-dots" aria-hidden="true" style={locked ? { filter: "grayscale(0.7)" } : undefined}>
                  {t.swatch.map((c, i) => (
                    <span key={i} style={{ background: c }} />
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
