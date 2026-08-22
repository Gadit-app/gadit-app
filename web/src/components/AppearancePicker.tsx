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
import { RANKS, rankFor, POINTS } from "@/lib/gamification";
import { rankLabel } from "@/lib/gamification-labels";

// Store micro-copy (en + he, English fallback — matches the existing picker
// label pattern; full-language coverage is a follow-up).
const STORE_COPY: Record<string, { balance: string; buy: string; owned: string; ask: string; need: string; orRank: string }> = {
  en: { balance: "Gift points", buy: "Get for", owned: "Yours", ask: "Ask a parent to unlock skins", need: "{n} 🎁 to go", orRank: "or reach {rank}" },
  ar: { balance: "نقاط الهدايا", buy: "احصل عليه بـ", owned: "لك", ask: "اطلب من أحد الوالدين فتح المظاهر", need: "باقي {n} 🎁", orRank: "أو تصل إلى {rank}" },
  ru: { balance: "Подарочные очки", buy: "Купить за", owned: "У тебя есть", ask: "Попроси родителей открыть образы", need: "Осталось {n} 🎁", orRank: "или дойди до {rank}" },
  es: { balance: "Puntos de regalo", buy: "Consíguelo por", owned: "Tuyo", ask: "Pide a mamá o papá que desbloqueen skins", need: "Faltan {n} 🎁", orRank: "o llega a {rank}" },
  pt: { balance: "Pontos de presente", buy: "Comprar por", owned: "Seu", ask: "Peça a um dos pais para desbloquear skins", need: "Faltam {n} 🎁", orRank: "ou chegue a {rank}" },
  fr: { balance: "Points cadeaux", buy: "Obtenir pour", owned: "À toi", ask: "Demande à un parent de débloquer les skins", need: "Encore {n} 🎁", orRank: "ou atteins {rank}" },
  de: { balance: "Geschenkpunkte", buy: "Holen für", owned: "Dir gehört's", ask: "Bitte ein Elternteil, Skins freizuschalten", need: "Noch {n} 🎁", orRank: "oder erreiche {rank}" },
  cs: { balance: "Dárkové body", buy: "Pořiď za", owned: "Máš", ask: "Požádej rodiče, ať odemkne vzhledy", need: "Zbývá {n} 🎁", orRank: "nebo dosáhni na {rank}" },
  sk: { balance: "Darčekové body", buy: "Získaj za", owned: "Máš", ask: "Popros rodiča, nech odomkne vzhľady", need: "Zostáva {n} 🎁", orRank: "alebo dosiahni {rank}" },
  it: { balance: "Punti regalo", buy: "Ottieni per", owned: "Tuo", ask: "Chiedi a un genitore di sbloccare gli skin", need: "Mancano {n} 🎁", orRank: "o raggiungi {rank}" },
  ja: { balance: "ギフトポイント", buy: "こうかんする", owned: "もっているよ", ask: "おうちの人にスキンをひらいてもらおう", need: "あと {n} 🎁", orRank: "または {rank} にとうたつ" },
  hi: { balance: "गिफ्ट पॉइंट", buy: "पाओ इतने में", owned: "तुम्हारा", ask: "स्किन खोलने के लिए मम्मी-पापा से कहो", need: "बस {n} 🎁 और", orRank: "या {rank} तक पहुँचो" },
  am: { balance: "የስጦታ ነጥቦች", buy: "ግዛ በ", owned: "ያንተ", ask: "ስኪኖችን ለመክፈት ወላጅ ጠይቅ", need: "ቀሪ {n} 🎁", orRank: "ወይም {rank} ደረጃ ድረስ" },
  uk: { balance: "Подарункові бали", buy: "Купити за", owned: "Твій", ask: "Попроси батьків відкрити образи", need: "Ще {n} 🎁", orRank: "або досягни рангу {rank}" },
  tr: { balance: "Hediye puanları", buy: "Şununla al", owned: "Senin", ask: "Görünümleri açmak için bir yetişkinden yardım iste", need: "{n} 🎁 kaldı", orRank: "ya da {rank} seviyesine ulaş" },
  pl: { balance: "Punkty prezentowe", buy: "Kup za", owned: "Twoje", ask: "Poproś rodzica o odblokowanie skórek", need: "Jeszcze {n} 🎁", orRank: "albo zdobądź rangę {rank}" },
  fa: { balance: "امتیازهای هدیه", buy: "بخر با", owned: "مال توست", ask: "از یکی از والدین بخواه ظاهرها را باز کند", need: "{n} 🎁 مانده", orRank: "یا به رتبه {rank} برس" },
  id: { balance: "Poin hadiah", buy: "Ambil seharga", owned: "Milikmu", ask: "Minta orang tua membuka tampilan", need: "Kurang {n} 🎁 lagi", orRank: "atau capai peringkat {rank}" },
  nl: { balance: "Cadeaupunten", buy: "Haal voor", owned: "Van jou", ask: "Vraag een ouder om skins te ontgrendelen", need: "Nog {n} 🎁", orRank: "of bereik {rank}" },
  el: { balance: "Πόντοι δώρου", buy: "Πάρε με", owned: "Δικό σου", ask: "Ζήτα από έναν γονιό να ξεκλειδώσει εμφανίσεις", need: "Απομένουν {n} 🎁", orRank: "ή φτάσε στο {rank}" },
  zu: { balance: "Amaphuzu esipho", buy: "Thenga ngo", owned: "Okwakho", ask: "Cela umzali avule izimo", need: "Kusele {n} 🎁", orRank: "noma ufinyelele ku {rank}" },
  vi: { balance: "Điểm quà tặng", buy: "Đổi với", owned: "Của bạn", ask: "Nhờ bố mẹ mở khóa giao diện", need: "Còn thiếu {n} 🎁", orRank: "hoặc đạt hạng {rank}" },
  fil: { balance: "Mga gift point", buy: "Kunin sa", owned: "Sa iyo na", ask: "Humingi sa magulang para ma-unlock ang mga skin", need: "{n} 🎁 na lang", orRank: "o abutin ang {rank}" },
  af: { balance: "Geskenkpunte", buy: "Kry vir", owned: "Joune", ask: "Vra 'n ouer om skins oop te sluit", need: "{n} 🎁 oor", orRank: "of bereik {rank}" },
  sw: { balance: "Pointi za zawadi", buy: "Pata kwa", owned: "Yako", ask: "Muombe mzazi afungue skini", need: "{n} 🎁 zimebaki", orRank: "au fikia {rank}" },
  "zh-CN": { balance: "礼物点数", buy: "兑换", owned: "已拥有", ask: "让家长来解锁皮肤吧", need: "还差 {n} 🎁", orRank: "或升到 {rank}" },
  "zh-TW": { balance: "禮物點數", buy: "兌換", owned: "已擁有", ask: "讓家長來解鎖造型吧", need: "還差 {n} 🎁", orRank: "或升到 {rank}" },
  ko: { balance: "선물 포인트", buy: "교환하기", owned: "보유 중", ask: "부모님께 스킨 잠금 해제를 부탁해 보세요", need: "{n} 🎁 남았어요", orRank: "또는 {rank} 달성하기" },
  th: { balance: "แต้มของขวัญ", buy: "แลกด้วย", owned: "ของคุณแล้ว", ask: "ขอให้ผู้ปกครองช่วยปลดล็อกสกินให้", need: "อีก {n} 🎁", orRank: "หรือไปให้ถึง {rank}" },
  bn: { balance: "উপহার পয়েন্ট", buy: "কিনে নাও", owned: "তোমার", ask: "স্কিন আনলক করতে অভিভাবককে বলো", need: "আর {n} 🎁 বাকি", orRank: "অথবা {rank} পর্যন্ত পৌঁছাও" },
  da: { balance: "Gavepoint", buy: "Få for", owned: "Din", ask: "Bed en voksen om at låse skins op", need: "{n} 🎁 tilbage", orRank: "eller nå {rank}" },
  hu: { balance: "Ajándékpontok", buy: "Beszerzés", owned: "A tiéd", ask: "Kérj meg egy szülőt, hogy oldja fel a skineket", need: "Még {n} 🎁", orRank: "vagy érd el a(z) {rank} szintet" },
  he: { balance: "נקודות מתנה", buy: "קבל תמורת", owned: "שלך", ask: "בקש מההורה כדי לפתוח סקינים", need: "עוד {n} 🎁", orRank: "או בדרגת {rank}" },
};
function storeCopy(lang: string) { return STORE_COPY[lang] ?? STORE_COPY.en; }

// Session cache of the kid's earned rank index. The KidsGameHeader writes it
// on every compute; the picker reads it here (or fetches once if absent, e.g.
// on the word page where no header is mounted). Shared key.
const RANK_CACHE = "gadit-kid-rankindex";

export function AppearancePicker({ scope = "kid" }: { scope?: "all" | "kid" | "adult" }) {
  const { lang } = useLang();
  const { user } = useAuth();
  const [theme, setTheme] = useTheme();
  const [open, setOpen] = useState(false);
  const [rankIndex, setRankIndex] = useState(0);
  const [giftPoints, setGiftPoints] = useState(0);
  const [ownedSkins, setOwnedSkins] = useState<string[]>([]);
  const [buying, setBuying] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);
  const copy = storeCopy(lang);

  const list: ThemeMeta[] =
    scope === "kid"
      ? [THEMES[0], ...KID_THEMES] // Light (classic) + the skins
      : scope === "adult"
        ? ADULT_THEMES
        : THEMES;

  const current = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  // Resolve the kid's earned rank so we know which skins are unlocked.
  useEffect(() => {
    if (scope !== "kid") return;
    try {
      const cached = sessionStorage.getItem(RANK_CACHE);
      if (cached != null) { setRankIndex(Number(cached) || 0); return; }
    } catch { /* sessionStorage blocked */ }
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch("/api/notebook", { headers: { Authorization: `Bearer ${idToken}` } });
        if (!res.ok) return;
        const data = (await res.json()) as { items?: Array<{ understood?: boolean }> };
        const items = data.items ?? [];
        const points = items.length + items.filter((i) => i.understood).length * POINTS.understood;
        const idx = rankFor(points).index;
        if (!cancelled) {
          setRankIndex(idx);
          try { sessionStorage.setItem(RANK_CACHE, String(idx)); } catch { /* ignore */ }
        }
      } catch { /* gamification gating is best-effort */ }
    })();
    return () => { cancelled = true; };
  }, [scope, user]);

  // Load the kid's gift wallet (balance + owned skins) for the store. Refetch
  // when the menu opens so a fresh parent gift shows without a reload.
  useEffect(() => {
    if (scope !== "kid" || !user) return;
    let cancelled = false;
    (async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch("/api/kids/wallet", { headers: { Authorization: `Bearer ${idToken}` } });
        if (!res.ok) return;
        const w = (await res.json()) as { giftPoints?: number; ownedSkins?: string[] };
        if (cancelled) return;
        setGiftPoints(Number(w.giftPoints) || 0);
        setOwnedSkins(Array.isArray(w.ownedSkins) ? w.ownedSkins : []);
      } catch { /* wallet is best-effort; store just shows 0 */ }
    })();
    return () => { cancelled = true; };
  }, [scope, user, open]);

  async function buySkin(t: ThemeMeta) {
    if (!user || t.price == null || buying) return;
    setBuying(t.id);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/kids/buy-skin", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ themeId: t.id }),
      });
      const data = (await res.json()) as { owned?: boolean; giftPoints?: number; ownedSkins?: string[] };
      if (res.ok && data.owned) {
        setGiftPoints(Number(data.giftPoints) || 0);
        setOwnedSkins(Array.isArray(data.ownedSkins) ? data.ownedSkins : ownedSkins);
        setTheme(t.id); // wear it right away — the reward moment
        setOpen(false);
      }
    } catch { /* leave state as-is on failure */ } finally {
      setBuying(null);
    }
  }

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

  // A skin can be reached two ways: EARNED by climbing ranks (free) or BOUGHT
  // with gift points. It is selectable if free, rank-reached, or owned; else
  // it is for sale (and affordable when the wallet covers the price).
  function skinState(t: ThemeMeta) {
    const rankReached = t.unlockAtRank != null && rankIndex >= t.unlockAtRank;
    const isFree = t.unlockAtRank == null && t.price == null;
    const isOwned = t.price != null && ownedSkins.includes(t.id);
    const selectable = isFree || rankReached || isOwned;
    const forSale = !selectable && t.price != null;
    const affordable = forSale && giftPoints >= (t.price ?? Infinity);
    return { selectable, isOwned, forSale, affordable, rankReached };
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
          {scope === "kid" && (
            <div className="wb-skin-dd-wallet-wrap">
              <div className="wb-skin-dd-wallet" aria-hidden="true">
                <span>🎁 {copy.balance}</span>
                <strong>{giftPoints}</strong>
              </div>
              {giftPoints === 0 && <div className="wb-skin-dd-ask">{copy.ask}</div>}
            </div>
          )}
          {list.map((t) => {
            const st = skinState(t);
            const justUnlocked = t.unlockAtRank != null && t.unlockAtRank === rankIndex;
            const busy = buying === t.id;
            // The whole row acts as: select (selectable) | buy (for sale &
            // affordable) | inert (for sale & too dear).
            const onClick = () => {
              if (busy) return;
              if (st.selectable) { setTheme(t.id); setOpen(false); return; }
              if (st.forSale && st.affordable) { void buySkin(t); }
            };
            const inert = st.forSale && !st.affordable;
            return (
              <button
                key={t.id}
                type="button"
                role="option"
                aria-selected={theme === t.id}
                aria-disabled={inert}
                className={`wb-skin-dd-item${theme === t.id ? " is-active" : ""}`}
                style={inert ? { cursor: "not-allowed", opacity: 0.65 } : busy ? { opacity: 0.7 } : undefined}
                onClick={onClick}
              >
                <span className="wb-skin-emoji" aria-hidden="true">{st.forSale ? "🔒" : t.emoji}</span>
                <span className="wb-skin-name" style={{ display: "flex", flexDirection: "column", lineHeight: 1.25, minWidth: 0 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    {themeName(t, lang)}
                    {justUnlocked && st.selectable && <span aria-hidden="true">✨</span>}
                    {st.isOwned && <span className="wb-skin-owned" aria-hidden="true">{copy.owned}</span>}
                  </span>
                  {st.forSale && (
                    <>
                      <span
                        className="wb-skin-price"
                        style={{ color: st.affordable ? "var(--accent, #0EA5A5)" : "var(--ink-muted, #94a3b8)", opacity: st.affordable ? 1 : 0.85 }}
                      >
                        {st.affordable
                          ? `${copy.buy} 🎁 ${t.price}`
                          : copy.need.replace("{n}", String((t.price ?? 0) - giftPoints))}
                      </span>
                      {/* Dual path: a rank skin can ALSO be earned by climbing —
                          show both ways so the child sees they can wait and earn it. */}
                      {t.unlockAtRank != null && !st.rankReached && (
                        <span className="wb-skin-earnhint">
                          {copy.orRank.replace("{rank}", rankLabel(RANKS[t.unlockAtRank].key, lang))}
                        </span>
                      )}
                    </>
                  )}
                </span>
                <span className="wb-skin-dots" aria-hidden="true" style={st.forSale ? { filter: "grayscale(0.7)" } : undefined}>
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
