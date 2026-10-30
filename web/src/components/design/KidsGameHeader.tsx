"use client";

import { GaditIcon } from "./GaditIcon";
import { useEffect, useMemo, useState } from "react";
import { computeGamification, toLocalDateStr, RANKS } from "@/lib/gamification";
import { useServerRank, type ServerRank } from "@/lib/use-rank-state";
import { gameCopy, rankLabel } from "@/lib/gamification-labels";
import { rankIconSrc } from "@/lib/rank-icons";
import { KID_THEMES, themeName } from "@/lib/appearance";
import { KidsCelebration } from "./KidsCelebration";
import { useAuth } from "@/lib/auth-context";
import { SkinsPanel, skinCopy } from "@/components/KidSkins";
import { LOOKS, nextLook } from "@/lib/looks";
import { avatarUrl } from "@/lib/family";

// Streak days that earn a celebration. streakTier() returns the highest one
// reached, so we can tell when the child crosses into a new tier.
const STREAK_TIERS = [3, 7, 14, 30, 60, 100];
function streakTier(streak: number): number {
  let t = 0;
  for (const m of STREAK_TIERS) if (streak >= m) t = m;
  return t;
}
// Progress (0..100) toward the next streak milestone, so the streak tile has
// a bar too and all three tiles line up (Gadi 2026-08-18).
function streakProgress(streak: number): number {
  let prev = 0, next = STREAK_TIERS[0];
  for (const m of STREAK_TIERS) { if (streak >= m) prev = m; else { next = m; break; } }
  if (streak >= STREAK_TIERS[STREAK_TIERS.length - 1]) return 100;
  const denom = next - prev;
  return denom > 0 ? Math.min(100, Math.round(((streak - prev) / denom) * 100)) : 0;
}

/**
 * Kids gamification header (Gadi 2026-08-12, premium redesign 2026-08-18) —
 * three tiles in ONE row from data that already exists (the notebook's
 * addedAt dates): a FORGIVING daily streak, a weekly new-words goal, and an
 * explorer rank. Clean surface cards (theme-aware, light + dark) with a
 * coloured icon chip per loop. Tapping the rank tile opens the full ranks
 * table so a child can see every rank and how far to the next. No
 * leaderboards, no punishing streaks. Pure logic in lib/gamification.ts.
 */

// One per rank tier (see RANKS). The 6 long-tail tiers (champion..grandmaster)
// escalate past the crown so the ladder keeps feeling like it grows.
// The rank pictures replaced the emoji (2026-10-17): lib/rank-icons.ts.

// Small local copy for the ranks table (he + en, en fallback) so a new
// surface doesn't force a full gamification-labels sweep.
const RANKS_COPY: Record<string, { title: string; sub: (n: number) => string; words: string; you: string; locked: string; close: string }> = {
  en: { title: "Your ranks", sub: (n) => `You've collected ${n} words. Every new word moves you up`, words: "words", you: "You're here", locked: "Locked", close: "Close" },
  he: { title: "הדרגות שלכם", sub: (n) => `אספתם ${n} מילים. כל מילה חדשה מקדמת אתכם לדרגה הבאה`, words: "מילים", you: "אתם כאן", locked: "נעול", close: "סגירה" },
};

// Ranks-table modal copy for the other 31 languages (was en+he only),
// added 2026-08-22 so the ranks modal is native everywhere.
Object.assign(RANKS_COPY, {
  "ar": { title: "رتبك", sub: (n) => `جمعتم ${n} ${n % 100 >= 3 && n % 100 <= 10 ? "كلمات" : "كلمة"}. كل كلمة جديدة تقدّمكم إلى الأعلى`, words: "كلمة", you: "أنت هنا", locked: "مقفل", close: "إغلاق" },
  "ru": { title: "Твои ранги", sub: (n) => `Собрано слов: ${n}. Каждое новое слово поднимает вас выше`, words: "слов", you: "Ты здесь", locked: "Закрыто", close: "Закрыть" },
  "es": { title: "Tus rangos", sub: (n) => `Han reunido ${n} palabras. Cada palabra nueva los hace subir`, words: "palabras", you: "Estás aquí", locked: "Bloqueado", close: "Cerrar" },
  "pt": { title: "Seus níveis", sub: (n) => `Vocês reuniram ${n} palavras. Cada palavra nova faz vocês subirem`, words: "palavras", you: "Você está aqui", locked: "Bloqueado", close: "Fechar" },
  "fr": { title: "Tes rangs", sub: (n) => `Vous avez collecté ${n} mots. Chaque nouveau mot vous fait monter`, words: "mots", you: "Tu es ici", locked: "Verrouillé", close: "Fermer" },
  "de": { title: "Deine Ränge", sub: (n) => `Ihr habt ${n} Wörter gesammelt. Jedes neue Wort bringt euch weiter nach oben`, words: "Wörter", you: "Du bist hier", locked: "Gesperrt", close: "Schließen" },
  "cs": { title: "Tvoje hodnosti", sub: (n) => `Počet nasbíraných slov: ${n}. Každé nové slovo vás posune výš`, words: "slov", you: "Tady jsi", locked: "Zamčeno", close: "Zavřít" },
  "sk": { title: "Tvoje hodnosti", sub: (n) => `Počet nazbieraných slov: ${n}. Každé nové slovo vás posunie vyššie`, words: "slov", you: "Tu si", locked: "Zamknuté", close: "Zavrieť" },
  "it": { title: "I tuoi gradi", sub: (n) => `Avete raccolto ${n} parole. Ogni parola nuova vi fa salire`, words: "parole", you: "Sei qui", locked: "Bloccato", close: "Chiudi" },
  "ja": { title: "あなたのランク", sub: (n) => `${n}語を集めました。新しい言葉ひとつごとに、ランクが上がっていきます`, words: "語", you: "ここだよ", locked: "ロック中", close: "閉じる" },
  "hi": { title: "तुम्हारे रैंक", sub: (n) => `आपने ${n} शब्द जमा किए हैं। हर नया शब्द आपको आगे बढ़ाता है`, words: "शब्द", you: "तुम यहाँ हो", locked: "बंद", close: "बंद करें" },
  "am": { title: "ደረጃዎችህ", sub: (n) => `${n} ቃላት ሰብስባችኋል። እያንዳንዱ አዲስ ቃል ወደ ላይ ያሳድጋችኋል`, words: "ቃላት", you: "እዚህ ነህ", locked: "ተቆልፏል", close: "ዝጋ" },
  "uk": { title: "Твої ранги", sub: (n) => `Зібрано слів: ${n}. Кожне нове слово підіймає вас вище`, words: "слів", you: "Ти тут", locked: "Закрито", close: "Закрити" },
  "tr": { title: "Rütbelerin", sub: (n) => `${n} kelime topladınız. Her yeni kelime sizi yukarı taşır`, words: "kelime", you: "Buradasın", locked: "Kilitli", close: "Kapat" },
  "pl": { title: "Twoje rangi", sub: (n) => `Zebrane słowa: ${n}. Każde nowe słowo przesuwa was wyżej`, words: "słów", you: "Tu jesteś", locked: "Zablokowane", close: "Zamknij" },
  "fa": { title: "رتبه‌های تو", sub: (n) => `شما ${n} کلمه جمع کرده‌اید. هر کلمه‌ی جدید شما را بالاتر می‌برد`, words: "کلمه", you: "تو اینجایی", locked: "قفل", close: "بستن" },
  "id": { title: "Peringkatmu", sub: (n) => `Kalian sudah mengumpulkan ${n} kata. Setiap kata baru membuat kalian naik`, words: "kata", you: "Kamu di sini", locked: "Terkunci", close: "Tutup" },
  "nl": { title: "Jouw rangen", sub: (n) => `Jullie hebben ${n} woorden verzameld. Elk nieuw woord brengt jullie hoger`, words: "woorden", you: "Jij bent hier", locked: "Vergrendeld", close: "Sluiten" },
  "el": { title: "Οι βαθμοί σου", sub: (n) => `Μαζέψατε ${n} λέξεις. Κάθε νέα λέξη σας ανεβάζει`, words: "λέξεις", you: "Εδώ είσαι", locked: "Κλειδωμένο", close: "Κλείσιμο" },
  "zu": { title: "Amazinga akho", sub: (n) => `Niqoqe amagama angu-${n}. Igama ngalinye elisha linikhuphula phezulu`, words: "amagama", you: "Ulapha", locked: "Kukhiyiwe", close: "Vala" },
  xh: { title: "Amanqanaba akho", sub: (n) => `Niqokelele amagama angama-${n}. Igama ngalinye elitsha linenyusela phezulu`, words: "amagama", you: "Ulapha", locked: "Kutshixiwe", close: "Vala" },
  nso: { title: "Maemo a gago", sub: (n) => `Le kgobokeditše mantšu a ${n}. Lentšu le lengwe le le lengwe le lefsa le le rotošetša godimo`, words: "mantšu", you: "O mo", locked: "E notletšwe", close: "Tswalela" },
  tn: { title: "Maemo a gago", sub: (n) => `Lo kokoantse mafoko a le ${n}. Lefoko lengwe le lengwe le lesha le lo tlhatlosetsa kwa godimo`, words: "mafoko", you: "O fano", locked: "E notletswe", close: "Tswala" },
  st: { title: "Maemo a hao", sub: (n) => `Le bokeletse mantswe a ${n}. Lentswe le leng le le leng le letjha le le nyolla hodimo`, words: "mantswe", you: "O mona", locked: "E notletswe", close: "Kwala" },
  ts: { title: "Swiyimo swa wena", sub: (n) => `Mi hlengelete marito ya ${n}. Rito rin'wana ni rin'wana lerintshwa ri mi tlakusela ehenhla`, words: "marito", you: "U laha", locked: "Yi lotleriwile", close: "Pfala" },
  ss: { title: "Tikhundla takho", sub: (n) => `Nibute emagama langu-${n}. Ligama ngalinye lelisha linikhuphula etulu`, words: "emagama", you: "Ulapha", locked: "Kuvaliwe", close: "Vala" },
  ve: { title: "Vhuimo haṋu", sub: (n) => `No kuvhanganya maipfi a ${n}. Ipfi ḽiṅwe na ḽiṅwe ḽiswa ḽi ni gonyisa nṱha`, words: "maipfi", you: "Ni fhano", locked: "Zwo valwa", close: "Valani" },
  nr: { title: "Amazinga wakho", sub: (n) => `Nibuthe amezwi ali-${n}. Ilizwi ngalinye elitjha linikhuphula phezulu`, words: "amezwi", you: "Ulapha", locked: "Kukhiyiwe", close: "Vala" },
  "af": { title: "Jou range", sub: (n) => `Julle het ${n} woorde versamel. Elke nuwe woord skuif julle hoër op`, words: "woorde", you: "Jy is hier", locked: "Gesluit", close: "Maak toe" },
  "bn": { title: "তোমার র‍্যাঙ্ক", sub: (n) => `আপনারা ${n}টি শব্দ জমিয়েছেন। প্রতিটি নতুন শব্দ আপনাদের আরও ওপরে তোলে`, words: "শব্দ", you: "তুমি এখানে", locked: "লক করা", close: "বন্ধ করো" },
  "da": { title: "Dine niveauer", sub: (n) => `I har samlet ${n} ord. Hvert nyt ord rykker jer højere op`, words: "ord", you: "Du er her", locked: "Låst", close: "Luk" },
  "fil": { title: "Mga ranggo mo", sub: (n) => `Nakaipon na kayo ng ${n} salita. Bawat bagong salita ay nagpapaangat sa inyo`, words: "salita", you: "Nandito ka", locked: "Naka-lock", close: "Isara" },
  "hu": { title: "A rangjaid", sub: (n) => `${n} szót gyűjtöttetek. Minden új szóval feljebb léptek`, words: "szó", you: "Itt vagy", locked: "Zárolva", close: "Bezárás" },
  "ko": { title: "내 랭크", sub: (n) => `단어 ${n}개를 모았어요. 새 단어 하나하나가 등급을 올려 줘요`, words: "단어", you: "여기예요", locked: "잠김", close: "닫기" },
  "sw": { title: "Vyeo vyako", sub: (n) => `Mmekusanya maneno ${n}. Kila neno jipya linawapandisha juu`, words: "maneno", you: "Uko hapa", locked: "Imefungwa", close: "Funga" },
  "th": { title: "อันดับของคุณ", sub: (n) => `คุณเก็บได้ ${n} คำแล้ว ทุกคำใหม่ช่วยให้คุณเลื่อนขึ้น`, words: "คำ", you: "คุณอยู่นี่", locked: "ล็อก", close: "ปิด" },
  "vi": { title: "Cấp bậc của bạn", sub: (n) => `Các bạn đã thu thập ${n} từ. Mỗi từ mới giúp các bạn lên cao hơn`, words: "từ", you: "Bạn ở đây", locked: "Đã khóa", close: "Đóng" },
  "zh-CN": { title: "你的段位", sub: (n) => `您已收集 ${n} 个单词。每个新单词都会让您升得更高`, words: "单词", you: "你在这里", locked: "未解锁", close: "关闭" },
  "zh-TW": { title: "你的段位", sub: (n) => `您已收集 ${n} 個單字。每個新單字都會讓您升得更高`, words: "單字", you: "你在這裡", locked: "未解鎖", close: "關閉" },
} satisfies Record<string, { title: string; sub: (n: number) => string; words: string; you: string; locked: string; close: string }>);

function ranksCopy(lang: string) { return RANKS_COPY[lang] ?? RANKS_COPY.en; }

/** The ranks table for a grown up (Gadi 2026-10-19): grown-up wording. The
 *  "how points are earned" line is one line for everyone since 2026-10-21
 *  (RANKS_COPY.sub). Other languages use the table copy above. */
const RANKS_COPY_ADULT: Record<string, Partial<(typeof RANKS_COPY)["en"]>> = {
  en: { title: "Your ranks", you: "You're here" },
  he: { title: "הדרגות שלכם", you: "אתם כאן" },
};
function ranksCopyFor(lang: string, adult: boolean) {
  const base = ranksCopy(lang);
  return adult ? { ...base, ...(RANKS_COPY_ADULT[lang] ?? {}) } : base;
}

/** Points and rank from the SERVER (/api/rank: new words + completed
 *  practices, never below the rank floor) once loaded; until then the local
 *  words alone, so the tile is never empty. A word added on this page since
 *  the server answered still counts (max of the two word counts). */
function gameFrom(addedAtDates: string[], server: ServerRank | null) {
  const now = Date.now();
  return computeGamification(addedAtDates, now, toLocalDateStr(new Date(now).toISOString()), server
    ? { words: Math.max(server.words, addedAtDates.length), practices: server.practices, practiceDays: server.days, rankFloor: server.rankFloor }
    : {});
}

export function KidsGameHeader({
  addedAtDates,
  lang,
  dir,
}: {
  addedAtDates: string[];
  lang: string;
  dir: "rtl" | "ltr";
}) {
  // Practice days (games, lessons, homework, reading, "say it") also keep
  // the streak alive (Gadi 2026-10-12); completed practices unlock avatar
  // skins (2026-10-30). Both come from the server.
  const { user, familyRole, avatarId } = useAuth();
  const [skinsOpen, setSkinsOpen] = useState(false);
  const server = useServerRank(user);
  const g = useMemo(() => gameFrom(addedAtDates, server), [addedAtDates, server]);

  const [celebrateId, setCelebrateId] = useState(0);
  const [ranksOpen, setRanksOpen] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const KEY = "gadit-kids-celebrate";
    try {
      const prev = JSON.parse(window.localStorage.getItem(KEY) || "null") as
        | { rankIndex: number; streakTier: number; weeklyDone: boolean }
        | null;
      const curTier = streakTier(g.streak);
      const weeklyDone = g.weekly >= g.weeklyGoal;
      const next = { rankIndex: g.rank.index, streakTier: curTier, weeklyDone };
      window.localStorage.setItem(KEY, JSON.stringify(next));
      // Publish the earned rank so the skin picker (which may be mounted on a
      // page without this header) knows which unlockable skins are available.
      try { window.sessionStorage.setItem("gadit-kid-rankindex", String(g.rank.index)); } catch { /* ignore */ }
      if (prev) {
        const crossed =
          g.rank.index > prev.rankIndex ||
          curTier > (prev.streakTier ?? 0) ||
          (weeklyDone && !prev.weeklyDone);
        if (crossed) setCelebrateId((x) => x + 1);
      }
    } catch { /* localStorage blocked — no celebration, no harm */ }
  }, [g.streak, g.rank.index, g.weekly, g.weeklyGoal]);

  const c = gameCopy(lang);
  const weeklyPct = Math.min(100, Math.round((g.weekly / g.weeklyGoal) * 100));
  const weeklyDone = g.weekly >= g.weeklyGoal;
  const toNext = g.rank.next === null ? 0 : Math.max(0, g.rank.next - g.points);

  const AMBER = "#F59E0B", TEAL = "#0EA5A5", PURPLE = "#8B5CF6";

  return (
    <>
      <div dir={dir} className="wb-kids-tiles">
        <KidsCelebration runId={celebrateId} />

        {/* Streak */}
        <div className="wb-kids-tile">
          <div className="wb-kids-tile-head">
            <Chip icon="streak" dim={g.streak === 0} />
            <div>
              <div className="wb-kids-tile-label">{c.streakTitle}</div>
              <div className="wb-kids-tile-num" style={{ color: TEAL }}>{g.streak}</div>
            </div>
          </div>
          <Bar pct={streakProgress(g.streak)} color={TEAL} />
          <div className="wb-kids-tile-cap">{g.streak > 0 ? c.streakDays(g.streak) : c.streakStart}</div>
        </div>

        {/* Weekly goal */}
        <div className="wb-kids-tile">
          <div className="wb-kids-tile-head">
            <Chip icon="goal" />
            <div>
              <div className="wb-kids-tile-label">{c.weeklyTitle}</div>
              <div className="wb-kids-tile-num" style={{ color: AMBER }}>{g.weekly}<span className="wb-kids-tile-of">/{g.weeklyGoal}</span></div>
            </div>
          </div>
          <Bar pct={weeklyPct} color={weeklyDone ? "#059669" : AMBER} />
          <div className="wb-kids-tile-cap">{weeklyDone ? `✅ ${c.weeklyDone}` : c.weeklyProgress(g.weekly, g.weeklyGoal)}</div>
        </div>

        {/* Explorer rank — tap for the full ranks table */}
        <button type="button" className="wb-kids-tile wb-kids-tile-btn" onClick={() => setRanksOpen(true)}>
          <div className="wb-kids-tile-head">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={rankIconSrc(g.rank.key)} alt="" width={52} height={52} style={{ width: 52, height: 52, flexShrink: 0, objectFit: "contain" }} />
            <div style={{ minWidth: 0, textAlign: dir === "rtl" ? "right" : "left" }}>
              <div className="wb-kids-tile-label">{c.rankTitle}</div>
              <div className="wb-kids-tile-num is-rank" style={{ color: PURPLE }}>{rankLabel(g.rank.key, lang)}</div>
            </div>
          </div>
          <Bar pct={Math.round(g.rank.progress * 100)} color={PURPLE} />
          <div className="wb-kids-tile-cap">{g.rank.next === null ? `⭐ ${c.topRank}` : c.toNext(toNext)}</div>
        </button>
      </div>

      {familyRole === "kid" && user && server && (
        <NextSkinStrip practices={server.practices} lang={lang} dir={dir} onOpen={() => setSkinsOpen(true)} />
      )}
      {skinsOpen && user && server && (
        <SkinsPanel user={user} lang={lang} dir={dir} practices={server.practices} avatarId={avatarId} onClose={() => setSkinsOpen(false)} />
      )}

      {ranksOpen && (
        <RanksModal
          onClose={() => setRanksOpen(false)}
          points={g.points}
          currentIndex={g.rank.index}
          lang={lang}
          dir={dir}
        />
      )}
    </>
  );
}

/** "My skins" strip under the tiles: the next locked skin and how many
 *  completed practices it still needs (the chase, Gadi 2026-10-30). Tap opens
 *  all skins. When every skin is open it shows the count. */
function NextSkinStrip({ practices, lang, dir, onOpen }: { practices: number; lang: string; dir: "rtl" | "ltr"; onOpen: () => void }) {
  const c = skinCopy(lang);
  const nx = nextLook(practices);
  const prevAt = nx ? Math.max(0, ...LOOKS.filter((l) => l.unlockAt < nx.look.unlockAt).map((l) => l.unlockAt)) : 0;
  const pct = nx ? Math.round(((practices - prevAt) / Math.max(1, nx.look.unlockAt - prevAt)) * 100) : 100;
  const src = avatarUrl(nx ? nx.look.id : LOOKS[LOOKS.length - 1].id);
  return (
    <button type="button" dir={dir} className="wb-kids-tile wb-kids-tile-btn" onClick={onOpen} style={{ marginTop: -10, marginBottom: 22, flexDirection: "row", alignItems: "center", gap: 14 }}>
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" width={52} height={52} style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", flexShrink: 0, filter: nx ? "grayscale(1) brightness(0.8)" : "none", opacity: nx ? 0.7 : 1 }} />
      )}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8, textAlign: dir === "rtl" ? "right" : "left" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
          <span className="wb-kids-tile-label">{c.open}</span>
          <span className="wb-kids-tile-cap" style={{ fontWeight: 700 }}>{nx ? c.locked(nx.missing) : c.sub(LOOKS.length, LOOKS.length)}</span>
        </div>
        <Bar pct={Math.max(0, Math.min(100, pct))} color="#EC4899" />
      </div>
    </button>
  );
}

/** The tile's icon: Gadit's own 3D icons (Gadi 2026-10-12), grey while the streak is 0. */
function Chip({ icon, dim }: { icon: "streak" | "goal" | "rank"; dim?: boolean }) {
  return (
    <span style={{ width: 46, height: 46, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", filter: dim ? "grayscale(1) opacity(0.55)" : "none" }}>
      <GaditIcon name={icon} size={46} />
    </span>
  );
}

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ background: "color-mix(in srgb, var(--ink) 10%, transparent)", borderRadius: 999, height: 8, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 999, transition: "width 400ms cubic-bezier(0.23,1,0.32,1)" }} />
    </div>
  );
}

function RanksModal({ onClose, points, currentIndex, lang, dir, adult = false }: {
  onClose: () => void; points: number; currentIndex: number; lang: string; dir: "rtl" | "ltr";
  /** A grown up: grown-up wording and no kid skins in the list. */
  adult?: boolean;
}) {
  const rc = ranksCopyFor(lang, adult);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div
      role="dialog" aria-modal="true" onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(10,14,20,0.55)", backdropFilter: "blur(3px)" }}
    >
      <div
        className="wordbook" dir={dir} onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 460, maxHeight: "88dvh", overflowY: "auto", background: "var(--surface)", color: "var(--ink)", borderRadius: 22, padding: "24px 22px", boxShadow: "0 24px 70px rgba(0,0,0,0.34)" }}
      >
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{rc.title}</div>
        <div style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 16 }}>{rc.sub(points)}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {RANKS.map((r, i) => {
            // At or below the rank shown (the rank floor keeps it) or reached.
            const unlocked = i <= currentIndex || points >= r.min;
            const isCurrent = i === currentIndex;
            return (
              <div key={r.key} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "11px 13px", borderRadius: 13,
                border: isCurrent ? "1.5px solid #8B5CF6" : "1px solid var(--rule)",
                background: isCurrent ? "color-mix(in srgb, #8B5CF6 10%, transparent)" : "transparent",
                opacity: unlocked ? 1 : 0.55,
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={rankIconSrc(r.key)} alt="" width={48} height={48} loading="lazy" style={{ width: 48, height: 48, flexShrink: 0, objectFit: "contain", filter: unlocked ? "none" : "grayscale(1)" }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>{rankLabel(r.key, lang)}</div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-muted)" }}>{r.min}+ {rc.words}</div>
                  {!adult && (() => {
                    const skins = KID_THEMES.filter((t) => t.unlockAtRank === i);
                    return skins.length ? (
                      <div style={{ fontSize: 12.5, marginTop: 3, display: "flex", gap: 8, flexWrap: "wrap", color: unlocked ? "var(--accent, #0EA5A5)" : "var(--ink-muted)" }}>
                        {skins.map((t) => (
                          <span key={t.id} style={{ display: "inline-flex", alignItems: "center", gap: 3, fontWeight: 600 }}>
                            <span aria-hidden="true">{unlocked ? t.emoji : "🔒"}</span>{themeName(t, lang)}
                          </span>
                        ))}
                      </div>
                    ) : null;
                  })()}
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: isCurrent ? "#8B5CF6" : "var(--ink-faint)" }}>
                  {isCurrent ? rc.you : unlocked ? "✓" : rc.locked}
                </span>
              </div>
            );
          })}
        </div>
        <button type="button" onClick={onClose} style={{ marginTop: 18, width: "100%", background: "#0EA5A5", color: "#fff", border: "none", borderRadius: 999, padding: "12px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{rc.close}</button>
      </div>
    </div>
  );
}

/**
 * The rank for a grown up (Gadi 2026-10-18, made visible 2026-10-19): parents
 * and Individual subscribers see their rank in the notebook as a full card,
 * the tree picture, the rank name, a bar to the next rank, and a tap opens the
 * whole ladder. Moving up a rank gets a celebration, so they know they are
 * climbing. No streak and no weekly goal (those stay for the children). Same
 * points and the same pictures as the children, so a family shares one ladder.
 */
export function AdultRankLine({
  addedAtDates,
  lang,
  dir,
}: {
  addedAtDates: string[];
  lang: string;
  dir: "rtl" | "ltr";
}) {
  const c = gameCopy(lang);
  const { user } = useAuth();
  const server = useServerRank(user);
  const g = useMemo(() => gameFrom(addedAtDates, server), [addedAtDates, server]);
  const toNext = g.rank.next === null ? 0 : Math.max(0, g.rank.next - g.points);
  const [open, setOpen] = useState(false);
  const [celebrateId, setCelebrateId] = useState(0);
  // A new rank since the last visit: celebrate once (its own key, so a parent
  // and a child on one browser do not share it).
  useEffect(() => {
    try {
      const KEY = "gadit-adult-rank";
      const prev = window.localStorage.getItem(KEY);
      window.localStorage.setItem(KEY, String(g.rank.index));
      if (prev !== null && g.rank.index > Number(prev)) setCelebrateId((x) => x + 1);
    } catch { /* storage blocked: no celebration, no harm */ }
  }, [g.rank.index]);
  const PURPLE = "#8B5CF6";
  return (
    <>
      <KidsCelebration runId={celebrateId} />
      <button
        type="button"
        dir={dir}
        onClick={() => setOpen(true)}
        className="wb-adult-rank"
        style={{
          display: "flex", alignItems: "center", gap: 14, width: "100%", maxWidth: 460, margin: "4px 0 18px",
          padding: "14px 16px", borderRadius: 18, border: "1px solid color-mix(in srgb, #8B5CF6 28%, var(--rule, #E5E7EB))",
          background: "linear-gradient(135deg, color-mix(in srgb, #8B5CF6 9%, var(--surface, #fff)), var(--surface, #fff))",
          boxShadow: "0 8px 22px -14px rgba(76, 29, 149, 0.45)", cursor: "pointer", font: "inherit", color: "inherit",
          textAlign: dir === "rtl" ? "right" : "left",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={rankIconSrc(g.rank.key)} alt="" width={60} height={60} style={{ width: 60, height: 60, flexShrink: 0, objectFit: "contain" }} />
        <div style={{ minWidth: 0, flex: 1, display: "grid", gap: 4 }}>
          <div style={{ fontSize: 12.5, color: "var(--ink-muted, #6B7280)", fontWeight: 600 }}>{c.rankTitle}</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: PURPLE, lineHeight: 1.2 }}>{rankLabel(g.rank.key, lang)}</div>
          <Bar pct={Math.round(g.rank.progress * 100)} color={PURPLE} />
          <div style={{ fontSize: 12.5, color: "var(--ink-muted, #6B7280)" }}>{g.rank.next === null ? `⭐ ${c.topRank}` : c.toNext(toNext)}</div>
        </div>
        <span aria-hidden="true" style={{ fontSize: 20, color: "var(--ink-faint, #9CA3AF)", flexShrink: 0 }}>{dir === "rtl" ? "‹" : "›"}</span>
      </button>
      {open && (
        <RanksModal onClose={() => setOpen(false)} points={g.points} currentIndex={g.rank.index} lang={lang} dir={dir} adult />
      )}
    </>
  );
}

/**
 * The rank badge in the top bar (Gadi 2026-10-19): a grown up sees their rank
 * as a small tree picture next to the avatar on every page, phone and desktop,
 * quietly. Tapping it opens the ladder. Points come from the server
 * (/api/rank: one per word, ten per completed practice), cached for a few
 * minutes per visit so the bar does not refetch on every page.
 */
export function TopRankBadge({ lang, dir }: { lang: string; dir: "rtl" | "ltr" }) {
  const { user, familyRole } = useAuth();
  const server = useServerRank(user, !!user && familyRole !== "kid");
  const g = useMemo(() => (server ? gameFrom([], server) : null), [server]);
  const [open, setOpen] = useState(false);
  const [celebrateId, setCelebrateId] = useState(0);
  useEffect(() => {
    if (!g) return;
    try {
      const KEY = "gadit-adult-rank";
      const prev = window.localStorage.getItem(KEY);
      window.localStorage.setItem(KEY, String(g.rank.index));
      if (prev !== null && g.rank.index > Number(prev)) setCelebrateId((x) => x + 1);
    } catch { /* no celebration */ }
  }, [g]);
  if (!user || familyRole === "kid" || !g || !server || server.words === 0) return null;
  const c = gameCopy(lang);
  const name = rankLabel(g.rank.key, lang);
  const toNext = g.rank.next === null ? 0 : Math.max(0, g.rank.next - g.points);
  const tip = `${c.rankTitle}: ${name}. ${g.rank.next === null ? c.topRank : c.toNext(toNext)}`;
  return (
    <>
      <KidsCelebration runId={celebrateId} />
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={tip}
        aria-label={tip}
        className="wb-rank-badge"
        style={{
          width: 36, height: 36, flexShrink: 0, padding: 0, borderRadius: 999, cursor: "pointer",
          border: "1.5px solid color-mix(in srgb, #8B5CF6 35%, transparent)",
          background: "color-mix(in srgb, #8B5CF6 10%, var(--surface, #fff))",
          display: "inline-flex", alignItems: "center", justifyContent: "center", position: "relative",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={rankIconSrc(g.rank.key)} alt="" width={30} height={30} style={{ width: 30, height: 30, objectFit: "contain" }} />
        {/* How far to the next rank, as a thin ring segment under the picture. */}
        <span aria-hidden="true" style={{ position: "absolute", insetInline: 6, bottom: -3, height: 3, borderRadius: 999, background: "color-mix(in srgb, var(--ink, #111) 12%, transparent)", overflow: "hidden" }}>
          <span style={{ display: "block", height: "100%", width: `${Math.round(g.rank.progress * 100)}%`, background: "#8B5CF6", borderRadius: 999 }} />
        </span>
      </button>
      {open && (
        <RanksModal onClose={() => setOpen(false)} points={g.points} currentIndex={g.rank.index} lang={lang} dir={dir} adult />
      )}
    </>
  );
}
