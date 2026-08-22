"use client";

import { useEffect, useMemo, useState } from "react";
import { computeGamification, toLocalDateStr, RANKS } from "@/lib/gamification";
import { gameCopy, rankLabel } from "@/lib/gamification-labels";
import { KID_THEMES, themeName } from "@/lib/appearance";
import { KidsCelebration } from "./KidsCelebration";

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
const RANK_EMOJI = ["🌱", "🔍", "🧭", "🗺️", "🎖️", "👑", "🏆", "🦉", "🎨", "🌟", "🧙", "🐉"];

// Small local copy for the ranks table (he + en, en fallback) so a new
// surface doesn't force a full gamification-labels sweep.
const RANKS_COPY: Record<string, { title: string; sub: (n: number) => string; words: string; you: string; locked: string; close: string }> = {
  en: { title: "Your ranks", sub: (n) => `You've earned ${n} points. Understand words to earn more and climb.`, words: "points", you: "You're here", locked: "Locked", close: "Close" },
  he: { title: "הדרגות שלך", sub: (n) => `צברת ${n} נקודות. תבין מילים כדי לצבור עוד ולעלות.`, words: "נקודות", you: "כאן את/ה", locked: "נעול", close: "סגירה" },
};

// Ranks-table modal copy for the other 31 languages (was en+he only),
// added 2026-08-22 so the ranks modal is native everywhere.
Object.assign(RANKS_COPY, {
  "ar": { title: "رتبك", sub: (n) => "لقد جمعت " + n + " نقطة. افهم الكلمات لتجمع المزيد وتتقدم.", words: "نقطة", you: "أنت هنا", locked: "مقفل", close: "إغلاق" },
  "ru": { title: "Твои ранги", sub: (n) => "Ты набрал " + n + " очков. Понимай слова, чтобы набрать больше и подняться выше.", words: "очков", you: "Ты здесь", locked: "Закрыто", close: "Закрыть" },
  "es": { title: "Tus rangos", sub: (n) => "Has ganado " + n + " puntos. Entiende palabras para ganar más y subir.", words: "puntos", you: "Estás aquí", locked: "Bloqueado", close: "Cerrar" },
  "pt": { title: "Seus níveis", sub: (n) => "Você ganhou " + n + " pontos. Entenda palavras para ganhar mais e subir.", words: "pontos", you: "Você está aqui", locked: "Bloqueado", close: "Fechar" },
  "fr": { title: "Tes rangs", sub: (n) => "Tu as gagné " + n + " points. Comprends des mots pour en gagner plus et grimper.", words: "points", you: "Tu es ici", locked: "Verrouillé", close: "Fermer" },
  "de": { title: "Deine Ränge", sub: (n) => "Du hast " + n + " Punkte gesammelt. Verstehe Wörter, um mehr zu sammeln und aufzusteigen.", words: "Punkte", you: "Du bist hier", locked: "Gesperrt", close: "Schließen" },
  "cs": { title: "Tvoje hodnosti", sub: (n) => "Získal jsi " + n + " bodů. Rozuměj slovům, ať získáš víc a postoupíš výš.", words: "bodů", you: "Tady jsi", locked: "Zamčeno", close: "Zavřít" },
  "sk": { title: "Tvoje hodnosti", sub: (n) => "Získal si " + n + " bodov. Rozumej slovám, aby si získal viac a postúpil vyššie.", words: "bodov", you: "Tu si", locked: "Zamknuté", close: "Zavrieť" },
  "it": { title: "I tuoi gradi", sub: (n) => "Hai guadagnato " + n + " punti. Capisci le parole per guadagnarne di più e salire.", words: "punti", you: "Sei qui", locked: "Bloccato", close: "Chiudi" },
  "ja": { title: "あなたのランク", sub: (n) => "" + n + "ポイントを獲得しました。言葉を理解してもっと集めて、上を目指そう。", words: "ポイント", you: "ここだよ", locked: "ロック中", close: "閉じる" },
  "hi": { title: "तुम्हारे रैंक", sub: (n) => "तुमने " + n + " अंक कमाए हैं। और कमाने और ऊपर चढ़ने के लिए शब्दों को समझो।", words: "अंक", you: "तुम यहाँ हो", locked: "बंद", close: "बंद करें" },
  "am": { title: "ደረጃዎችህ", sub: (n) => "" + n + " ነጥብ አግኝተሃል። ተጨማሪ ለማግኘት እና ወደ ላይ ለመውጣት ቃላትን ተረዳ።", words: "ነጥብ", you: "እዚህ ነህ", locked: "ተቆልፏል", close: "ዝጋ" },
  "uk": { title: "Твої ранги", sub: (n) => "Ти набрав " + n + " балів. Розумій слова, щоб набрати більше й піднятися вище.", words: "балів", you: "Ти тут", locked: "Закрито", close: "Закрити" },
  "tr": { title: "Rütbelerin", sub: (n) => "" + n + " puan kazandın. Daha fazla kazanmak ve yükselmek için kelimeleri anla.", words: "puan", you: "Buradasın", locked: "Kilitli", close: "Kapat" },
  "pl": { title: "Twoje rangi", sub: (n) => "Zdobyłeś " + n + " punktów. Rozumiej słowa, aby zdobyć więcej i awansować.", words: "punktów", you: "Tu jesteś", locked: "Zablokowane", close: "Zamknij" },
  "fa": { title: "رتبه‌های تو", sub: (n) => "تو " + n + " امتیاز گرفتی. کلمه‌ها را بفهم تا بیشتر بگیری و بالاتر بروی.", words: "امتیاز", you: "تو اینجایی", locked: "قفل", close: "بستن" },
  "id": { title: "Peringkatmu", sub: (n) => "Kamu sudah mengumpulkan " + n + " poin. Pahami kata untuk mengumpulkan lebih banyak dan naik.", words: "poin", you: "Kamu di sini", locked: "Terkunci", close: "Tutup" },
  "nl": { title: "Jouw rangen", sub: (n) => "Je hebt " + n + " punten verdiend. Begrijp woorden om er meer te verdienen en te stijgen.", words: "punten", you: "Jij bent hier", locked: "Vergrendeld", close: "Sluiten" },
  "el": { title: "Οι βαθμοί σου", sub: (n) => "Κέρδισες " + n + " πόντους. Κατάλαβε λέξεις για να κερδίσεις κι άλλους και να ανέβεις.", words: "πόντοι", you: "Εδώ είσαι", locked: "Κλειδωμένο", close: "Κλείσιμο" },
  "zu": { title: "Amazinga akho", sub: (n) => "Uthole amaphuzu angu-" + n + ". Qonda amagama ukuze uthole amaningi futhi ukhuphuke.", words: "amaphuzu", you: "Ulapha", locked: "Kukhiyiwe", close: "Vala" },
  "af": { title: "Jou range", sub: (n) => "Jy het " + n + " punte verdien. Verstaan woorde om meer te verdien en te klim.", words: "punte", you: "Jy is hier", locked: "Gesluit", close: "Maak toe" },
  "bn": { title: "তোমার র‍্যাঙ্ক", sub: (n) => "তুমি " + n + " পয়েন্ট পেয়েছ। আরও পেতে আর উপরে উঠতে শব্দ বোঝো।", words: "পয়েন্ট", you: "তুমি এখানে", locked: "লক করা", close: "বন্ধ করো" },
  "da": { title: "Dine niveauer", sub: (n) => "Du har tjent " + n + " point. Forstå ord for at tjene flere og rykke op.", words: "point", you: "Du er her", locked: "Låst", close: "Luk" },
  "fil": { title: "Mga ranggo mo", sub: (n) => "Nakakuha ka na ng " + n + " puntos. Unawain ang mga salita para makakuha pa at umakyat.", words: "puntos", you: "Nandito ka", locked: "Naka-lock", close: "Isara" },
  "hu": { title: "A rangjaid", sub: (n) => "" + n + " pontot gyűjtöttél. Értsd meg a szavakat, hogy többet gyűjts és feljebb juss.", words: "pont", you: "Itt vagy", locked: "Zárolva", close: "Bezárás" },
  "ko": { title: "내 랭크", sub: (n) => "" + n + "점을 모았어요. 단어를 이해해서 더 모으고 위로 올라가요.", words: "점", you: "여기예요", locked: "잠김", close: "닫기" },
  "sw": { title: "Vyeo vyako", sub: (n) => "Umepata pointi " + n + ". Elewa maneno ili upate zaidi na upande juu.", words: "pointi", you: "Uko hapa", locked: "Imefungwa", close: "Funga" },
  "th": { title: "อันดับของคุณ", sub: (n) => "คุณได้ " + n + " คะแนนแล้ว เข้าใจคำศัพท์เพื่อรับเพิ่มและไต่อันดับขึ้นไป", words: "คะแนน", you: "คุณอยู่นี่", locked: "ล็อก", close: "ปิด" },
  "vi": { title: "Cấp bậc của bạn", sub: (n) => "Bạn đã kiếm được " + n + " điểm. Hiểu từ để kiếm thêm và leo lên cao.", words: "điểm", you: "Bạn ở đây", locked: "Đã khóa", close: "Đóng" },
  "zh-CN": { title: "你的段位", sub: (n) => "你已获得 " + n + " 分。理解词语，赚取更多分数，向上攀登。", words: "分", you: "你在这里", locked: "未解锁", close: "关闭" },
  "zh-TW": { title: "你的段位", sub: (n) => "你已獲得 " + n + " 分。理解詞語，賺取更多分數，往上攀登。", words: "分", you: "你在這裡", locked: "未解鎖", close: "關閉" },
} satisfies Record<string, { title: string; sub: (n: number) => string; words: string; you: string; locked: string; close: string }>);

function ranksCopy(lang: string) { return RANKS_COPY[lang] ?? RANKS_COPY.en; }

export function KidsGameHeader({
  addedAtDates,
  understoodCount = 0,
  lang,
  dir,
}: {
  addedAtDates: string[];
  /** How many of these words the child has proven they understand (passed a
   *  quiz/game). Drives the rank via earned points; 0 falls back to one point
   *  per word. See computeGamification. */
  understoodCount?: number;
  lang: string;
  dir: "rtl" | "ltr";
}) {
  const g = useMemo(() => {
    const now = Date.now();
    const todayStr = toLocalDateStr(new Date(now).toISOString());
    return computeGamification(addedAtDates, now, todayStr, understoodCount);
  }, [addedAtDates, understoodCount]);

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
            <Chip color={AMBER} emoji="🔥" dim={g.streak === 0} />
            <div>
              <div className="wb-kids-tile-label">{c.streakTitle}</div>
              <div className="wb-kids-tile-num" style={{ color: AMBER }}>{g.streak}</div>
            </div>
          </div>
          <Bar pct={streakProgress(g.streak)} color={AMBER} />
          <div className="wb-kids-tile-cap">{g.streak > 0 ? c.streakDays(g.streak) : c.streakStart}</div>
        </div>

        {/* Weekly goal */}
        <div className="wb-kids-tile">
          <div className="wb-kids-tile-head">
            <Chip color={TEAL} emoji="🎯" />
            <div>
              <div className="wb-kids-tile-label">{c.weeklyTitle}</div>
              <div className="wb-kids-tile-num" style={{ color: TEAL }}>{g.weekly}<span className="wb-kids-tile-of">/{g.weeklyGoal}</span></div>
            </div>
          </div>
          <Bar pct={weeklyPct} color={weeklyDone ? "#059669" : TEAL} />
          <div className="wb-kids-tile-cap">{weeklyDone ? `✅ ${c.weeklyDone}` : c.weeklyProgress(g.weekly, g.weeklyGoal)}</div>
        </div>

        {/* Explorer rank — tap for the full ranks table */}
        <button type="button" className="wb-kids-tile wb-kids-tile-btn" onClick={() => setRanksOpen(true)}>
          <div className="wb-kids-tile-head">
            <Chip color={PURPLE} emoji={RANK_EMOJI[g.rank.index] ?? "🏅"} />
            <div style={{ minWidth: 0, textAlign: dir === "rtl" ? "right" : "left" }}>
              <div className="wb-kids-tile-label">{c.rankTitle}</div>
              <div className="wb-kids-tile-num" style={{ color: PURPLE }}>{rankLabel(g.rank.key, lang)}</div>
            </div>
          </div>
          <Bar pct={Math.round(g.rank.progress * 100)} color={PURPLE} />
          <div className="wb-kids-tile-cap">{g.rank.next === null ? `⭐ ${c.topRank}` : c.toNext(toNext)}</div>
        </button>
      </div>

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

function Chip({ color, emoji, dim }: { color: string; emoji: string; dim?: boolean }) {
  return (
    <span
      style={{
        width: 44, height: 44, flexShrink: 0, borderRadius: 13,
        background: `color-mix(in srgb, ${color} 16%, transparent)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22, lineHeight: 1, filter: dim ? "grayscale(1) opacity(0.55)" : "none",
      }}
    >{emoji}</span>
  );
}

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ background: "color-mix(in srgb, var(--ink) 10%, transparent)", borderRadius: 999, height: 8, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 999, transition: "width 400ms cubic-bezier(0.23,1,0.32,1)" }} />
    </div>
  );
}

function RanksModal({ onClose, points, currentIndex, lang, dir }: {
  onClose: () => void; points: number; currentIndex: number; lang: string; dir: "rtl" | "ltr";
}) {
  const rc = ranksCopy(lang);
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
            const unlocked = points >= r.min;
            const isCurrent = i === currentIndex;
            return (
              <div key={r.key} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "11px 13px", borderRadius: 13,
                border: isCurrent ? "1.5px solid #8B5CF6" : "1px solid var(--rule)",
                background: isCurrent ? "color-mix(in srgb, #8B5CF6 10%, transparent)" : "transparent",
                opacity: unlocked ? 1 : 0.55,
              }}>
                <span style={{ fontSize: 26, lineHeight: 1, flexShrink: 0, filter: unlocked ? "none" : "grayscale(1)" }}>{RANK_EMOJI[i]}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>{rankLabel(r.key, lang)}</div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-muted)" }}>{r.min}+ {rc.words}</div>
                  {(() => {
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
