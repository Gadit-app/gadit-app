"use client";

/**
 * My monthly pay (Gadi 2026-11-02): a game tester's month, for Osher (12) and
 * Din (8). Built only on things they DID: test runs, bugs, ideas. Ideas from
 * the developers' world: every note is a numbered ticket with a status, a
 * tester level by approved tickets, and a "fixed thanks to you" list.
 * Hebrew and English, with a switch (Din reads English).
 */

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { gameName } from "@/lib/tester-games";
import type { PayRow, PaySlip } from "@/lib/tester-pay";
import { TesterChecklist } from "./TesterChecklist";

type L = "he" | "en";
const T = {
  he: {
    tabPay: "💰 התשלום שלי", tabChecks: "✅ רשימת הבדיקות",
    title: "התשלום החודשי שלי", back: "חזרה למשחקים", thisWeek: "החודש", lastWeek: "חודש קודם", loading: "טוענים את התשלום",
    earned: "הרווחת החודש", toYou: "לך ב-Yooniz", paid: "✅ שולם ב-Yooniz", notPaid: "⏳ עוד לא שולם",
    pending: (n: number) => `⏳ מחכה לאישור: עוד ${n} Yoon`, cap: (_n: number, c: number) => `אפשר להרוויח עד ${c} Yoon בכל שבוע`, capped: "באחד השבועות הגעת לתקרה 🎉",
    did: "מה עשית החודש", none: "עוד אין כלום החודש. נכנסים למשחק, משחקים, ושולחים 🧪",
    how: "איך מרוויחים", rules: [["🎮", "בדיקת משחק: שיחקת 5 סיבובים ודירגת ב-🧪", 5], ["🐞", "באג שאושר", 10], ["💡", "רעיון שאהבו", 5], ["🎤", "עם הקלטה: פי 1.5", "×1.5"], ["🚀", "רעיון שנבנה", 50], ["🤝", "שניכם מצאתם דברים באותו משחק", 5]] as [string, string, number | string][],
    fixed: "תוקן בזכותך 🚀", levelNext: (n: number) => `עוד ${n} כרטיסים לדרגה הבאה`, levelTop: "הדרגה הכי גבוהה!",
    levels: { junior: "🐣 בודק מתחיל", tester: "🛠️ בודק", senior: "⭐ בודק בכיר", lead: "👑 ראש צוות בדיקות" },
    type: { run: "🎮 בדיקת משחק", bug: "🐞 באג", idea: "💡 רעיון", built: "🚀 הרעיון נבנה!", team: "🤝 בונוס צוות", note: "🎤 הקלטה", royalty: "🎡 תמלוגים מהמשחק שלך" },
    myGame: "🎡 המשחק שהמצאת", players: "ילדים שיחקו בו", newMonth: "חדשים החודש", notOpen: "עוד לא פתוח לכולם, רק לבודקים. כשייפתח, כל ילד חדש שמשחק בו = Yoon", royaltyRule: "כל ילד חדש שמשחק = Yoon (עד 100 בחודש)",
    playMore: (n: number) => `עוד ${n} סיבובים היום וזה נספר`, noCount: "לא נספר", notPaidRow: "לא לתשלום", waiting: "מחכה",
  },
  en: {
    tabPay: "💰 My pay", tabChecks: "✅ My checklist",
    title: "My monthly pay", back: "Back to games", thisWeek: "This month", lastWeek: "Last month", loading: "Loading your pay",
    earned: "You earned this month", toYou: "To you in Yooniz", paid: "✅ Paid in Yooniz", notPaid: "⏳ Not paid yet",
    pending: (n: number) => `⏳ Waiting for approval: ${n} more Yoon`, cap: (_n: number, c: number) => `You can earn up to ${c} Yoon each week`, capped: "You hit the top in one of the weeks! 🎉",
    did: "What you did this month", none: "Nothing yet this month. Open a game, play, and send a 🧪",
    how: "How to earn", rules: [["🎮", "Test run: play 5 rounds and rate it with 🧪", 5], ["🐞", "A bug that was approved", 10], ["💡", "An idea we liked", 5], ["🎤", "With a voice note: ×1.5", "×1.5"], ["🚀", "An idea that got built", 50], ["🤝", "You both found things in the same game", 5]] as [string, string, number | string][],
    fixed: "Fixed thanks to you 🚀", levelNext: (n: number) => `${n} more tickets to the next level`, levelTop: "The top level!",
    levels: { junior: "🐣 Junior Tester", tester: "🛠️ Tester", senior: "⭐ Senior Tester", lead: "👑 Lead Tester" },
    type: { run: "🎮 Test run", bug: "🐞 Bug", idea: "💡 Idea", built: "🚀 Your idea got built!", team: "🤝 Team bonus", note: "🎤 Voice note", royalty: "🎡 Royalties from your game" },
    myGame: "🎡 The game you invented", players: "kids played it", newMonth: "new this month", notOpen: "Not open to everyone yet, only testers. Once it opens, every new kid who plays it = 1 Yoon", royaltyRule: "Every new kid who plays = 1 Yoon (up to 100 a month)",
    playMore: (n: number) => `${n} more rounds today and it counts`, noCount: "Didn't count", notPaidRow: "Not paid", waiting: "Waiting",
  },
};

const LS = "gadit-tester-lang";
const addMonths = (month: string, n: number) => { const [y, m] = month.split("-").map(Number); const d = new Date(Date.UTC(y, m - 1 + n, 15)); return d.toISOString().slice(0, 7); };

export function TesterPayClient() {
  const { user, tester, planReady, loading: authLoading, promptLogin } = useAuth();
  const { lang: uiLang } = useLang();
  const href = useHref();
  const [l, setL] = useState<L>(uiLang === "he" ? "he" : "en");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    try { const v = localStorage.getItem(LS); if (v === "he" || v === "en") setL(v); } catch { /* fine */ }
  }, []);
  const pick = (v: L) => { setL(v); try { localStorage.setItem(LS, v); } catch { /* fine */ } };
  const t = T[l];
  const dir = l === "he" ? "rtl" : "ltr";

  const [week, setWeek] = useState<string | null>(null);
  const [thisWeek, setThisWeek] = useState<string | null>(null); // months (YYYY-MM)
  const [slip, setSlip] = useState<PaySlip | null>(null);
  const [err, setErr] = useState(false);
  // The ✅ button opens /tester#checks straight on the checklist.
  const hash = useSyncExternalStore(
    (f) => { window.addEventListener("hashchange", f); return () => window.removeEventListener("hashchange", f); },
    () => window.location.hash,
    () => "",
  );
  const [picked, setTab] = useState<"pay" | "checks" | null>(null);
  const tab = picked ?? (hash === "#checks" ? "checks" : "pay");

  const router = useRouter();
  useEffect(() => { if (!authLoading && !user) promptLogin(t.title); }, [authLoading, user, promptLogin, t.title]);
  // testers only
  useEffect(() => { if (user && planReady && !tester) router.replace(href("/play")); }, [user, planReady, tester, router, href]);

  const load = useCallback(async (w: string | null) => {
    if (!user) return;
    setSlip(null);
    try {
      const r = await fetch(`/api/tester/pay${w ? `?month=${w}` : ""}`, { headers: { Authorization: `Bearer ${await user.getIdToken()}` } });
      if (!r.ok) { setErr(true); return; }
      const j = (await r.json()) as { slip: PaySlip; thisMonth: string };
      setSlip(j.slip); setThisWeek(j.thisMonth); setWeek(j.slip.month);
    } catch { setErr(true); }
  }, [user]);
  useEffect(() => {
    if (!user || !planReady || !tester) return;
    let alive = true;
    (async () => { if (alive) await load(null); })();
    return () => { alive = false; };
  }, [user, planReady, tester, load]);

  const rowText = (r: PayRow) => {
    const g = gameName(r.game, l);
    const head = `${t.type[r.type]}${r.ticket ? ` #${r.ticket}` : ""}`;
    return { head, sub: [g, r.text].filter(Boolean).join(" · ") };
  };
  const rowState = (r: PayRow) => {
    if (r.state === "paid") return { badge: `+${r.yoon}`, cls: "is-paid", note: "" };
    if (r.state === "pending") return { badge: r.yoon ? `+${r.yoon}` : "⏳", cls: "is-wait", note: r.type === "run" && r.need ? t.playMore(r.need) : t.waiting };
    return { badge: "—", cls: "is-no", note: r.type === "run" ? t.noCount : t.notPaidRow };
  };

  const isThis = week && thisWeek && week === thisWeek;
  const lv = slip?.level;

  return (
    <div className="tp-root" dir={dir}>
      <style>{CSS}</style>
      <div className="tp-wrap">
        <div className="tp-top">
          <Link href={href("/play")} className="tp-back">{dir === "rtl" ? "→" : "←"} {t.back}</Link>
          <div className="tp-lang" role="group" aria-label="Language">
            <button type="button" className={l === "he" ? "is-on" : ""} onClick={() => pick("he")}>עב</button>
            <button type="button" className={l === "en" ? "is-on" : ""} onClick={() => pick("en")}>EN</button>
          </div>
        </div>

        <div className="tp-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={tab === "pay"} className={tab === "pay" ? "is-on" : ""} onClick={() => setTab("pay")}>{t.tabPay}</button>
          <button type="button" role="tab" aria-selected={tab === "checks"} className={tab === "checks" ? "is-on" : ""} onClick={() => setTab("checks")}>{t.tabChecks}</button>
        </div>
        {tab === "checks" && user ? <TesterChecklist user={user} l={l} /> : null}
        {tab === "pay" ? <>
        <h1 className="tp-title">🧪 {t.title}</h1>
        {slip ? (
          <div className="tp-who">
            <strong>{slip.name}</strong>
            {lv ? <span className="tp-level">{t.levels[lv.key]}</span> : null}
            {lv ? <span className="tp-levelnext">{lv.next ? t.levelNext(lv.next - lv.tickets) : t.levelTop}</span> : null}
          </div>
        ) : null}

        {week ? (
          <div className="tp-weeknav">
            <button type="button" onClick={() => load(addMonths(week, -1))} aria-label={t.lastWeek}>{dir === "rtl" ? "›" : "‹"}</button>
            <span>{isThis ? t.thisWeek : new Date(`${week}-15T12:00:00Z`).toLocaleDateString(l === "he" ? "he-IL" : "en-GB", { month: "long", year: "numeric" })}</span>
            <button type="button" onClick={() => load(addMonths(week, 1))} disabled={!!isThis} aria-label={t.thisWeek}>{dir === "rtl" ? "‹" : "›"}</button>
          </div>
        ) : null}

        {!slip && !err ? <p className="tp-muted">{t.loading}…</p> : null}

        {slip ? (
          <>
            <section className="tp-money">
              <span className="tp-money-label">{t.earned}</span>
              <span className="tp-money-big">{slip.earned} <small>Yoon</small></span>
              <div className="tp-split">
                <span>💰 {t.toYou}: <b>{slip.net}</b></span>
              </div>
              <span className="tp-small">{slip.capped ? t.capped : t.cap(slip.earned, 250)}</span>
              {slip.pending ? <span className="tp-pending">{t.pending(slip.pending)}</span> : null}
              <span className={`tp-paid${slip.paid ? " is-paid" : ""}`}>{slip.paid ? t.paid : t.notPaid}</span>
            </section>

            <section className="tp-card">
              <h2>{t.did}</h2>
              {!slip.rows.length ? <p className="tp-muted">{t.none}</p> : (
                <ul className="tp-rows">
                  {slip.rows.map((r) => {
                    const x = rowText(r), s = rowState(r);
                    return (
                      <li key={r.id} className={`tp-row ${s.cls}`}>
                        <div className="tp-row-main">
                          <strong>{x.head}</strong>
                          {x.sub ? <span className="tp-row-sub">{x.sub}</span> : null}
                          {s.note ? <span className="tp-row-note">{s.note}</span> : null}
                        </div>
                        <span className="tp-row-yoon">{s.badge}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            {slip.games.map((g) => (
              <section key={g.prefix} className="tp-card is-game">
                <h2>{t.myGame}: {l === "he" ? g.he : g.en}</h2>
                <div className="tp-game-stats">
                  <div><b>{g.players}</b><span>{t.players}</span></div>
                  <div><b>{g.month}</b><span>{t.newMonth}</span></div>
                  <div><b>{Math.min(100, g.month)}</b><span>Yoon</span></div>
                </div>
                <p className="tp-muted">{g.isPublic ? t.royaltyRule : t.notOpen}</p>
              </section>
            ))}

            {slip.shipped.length ? (
              <section className="tp-card is-ship">
                <h2>{t.fixed}</h2>
                <ul className="tp-ship">
                  {slip.shipped.map((s) => <li key={s.id}>{s.type === "bug" ? "🐞" : "💡"} {gameName(s.game, l)}{s.text ? ` · ${s.text}` : ""}</li>)}
                </ul>
              </section>
            ) : null}

            <section className="tp-card">
              <h2>{t.how}</h2>
              <ul className="tp-rules">
                {t.rules.map(([e, txt, n]) => (
                  <li key={txt}><span className="tp-rule-e">{e}</span><span>{txt}</span><b>{typeof n === "number" ? `+${n}` : n}</b></li>
                ))}
              </ul>
            </section>
          </>
        ) : null}
        </> : null}
      </div>
    </div>
  );
}

const CSS = `
.tp-root{min-height:100vh;background:linear-gradient(180deg,#eef2ff,#f5f3ff 40%,#fff);color:#1e1b4b;font-family:inherit;padding-block:16px 40px}
.tp-wrap{max-width:560px;margin:0 auto;padding-inline:16px;display:grid;gap:14px}
.tp-top{display:flex;justify-content:space-between;align-items:center;gap:10px}
.tp-back{color:#4338ca;font-weight:700;text-decoration:none}
.tp-lang{display:flex;background:#e0e7ff;border-radius:999px;padding:3px}
.tp-lang button{border:0;background:none;border-radius:999px;padding:6px 14px;font:inherit;font-weight:800;color:#4338ca;cursor:pointer}
.tp-lang button.is-on{background:#4338ca;color:#fff}
.tp-title{margin:0;font-size:30px;text-align:center}
.tp-tabs{display:grid;grid-template-columns:1fr 1fr;gap:6px;background:#e0e7ff;border-radius:999px;padding:4px}
.tp-tabs button{border:0;background:none;border-radius:999px;padding:10px 8px;font:inherit;font-weight:800;font-size:15px;color:#4338ca;cursor:pointer}
.tp-tabs button.is-on{background:#fff;box-shadow:0 2px 8px #4338ca22}
.tp-who{display:grid;justify-items:center;gap:4px;text-align:center}
.tp-who strong{font-size:20px}
.tp-level{background:#fef3c7;color:#92400e;border-radius:999px;padding:4px 14px;font-weight:800}
.tp-levelnext{font-size:13px;color:#6b7280}
.tp-weeknav{display:flex;justify-content:center;align-items:center;gap:14px;font-weight:800}
.tp-weeknav button{width:38px;height:38px;border-radius:50%;border:0;background:#fff;box-shadow:0 2px 8px #0001;font-size:22px;color:#4338ca;cursor:pointer}
.tp-weeknav button:disabled{opacity:.35;cursor:default}
.tp-muted{color:#6b7280;text-align:center;margin:0}
.tp-money{background:linear-gradient(135deg,#4338ca,#7c3aed);color:#fff;border-radius:26px;padding:20px 18px;display:grid;gap:8px;justify-items:center;text-align:center;box-shadow:0 10px 30px #4338ca44}
.tp-money-label{font-weight:700;opacity:.9}
.tp-money-big{font-size:56px;font-weight:900;line-height:1}
.tp-money-big small{font-size:20px;font-weight:800}
.tp-split{display:flex;flex-wrap:wrap;gap:8px 16px;justify-content:center;font-size:15px}
.tp-bar{width:100%;height:10px;border-radius:999px;background:#ffffff33;overflow:hidden}
.tp-bar i{display:block;height:100%;background:#fde68a;border-radius:999px}
.tp-small{font-size:13px;opacity:.85}
.tp-pending{background:#ffffff22;border-radius:999px;padding:4px 12px;font-size:14px;font-weight:700}
.tp-paid{background:#ffffff26;border-radius:999px;padding:6px 14px;font-weight:800}
.tp-paid.is-paid{background:#22c55e}
.tp-card{background:#fff;border-radius:22px;padding:14px 16px;box-shadow:0 4px 16px #1e1b4b12}
.tp-card h2{margin:0 0 10px;font-size:18px}
.tp-card.is-ship{background:#ecfdf5}
.tp-card.is-game{background:#fff7ed}
.tp-game-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;text-align:center;margin-bottom:8px}
.tp-game-stats div{background:#fff;border-radius:14px;padding:10px 4px;display:grid;gap:2px}
.tp-game-stats b{font-size:28px;color:#c2410c}
.tp-game-stats span{font-size:12px;color:#6b7280}
.tp-rows,.tp-rules,.tp-ship{list-style:none;margin:0;padding:0;display:grid;gap:8px}
.tp-row{display:flex;gap:10px;align-items:center;justify-content:space-between;border:2px solid #eef2ff;border-radius:16px;padding:10px 12px}
.tp-row-main{display:grid;gap:2px;min-width:0}
.tp-row-main strong{font-size:16px}
.tp-row-sub{font-size:13px;color:#6b7280;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tp-row-note{font-size:12px;color:#b45309;font-weight:700}
.tp-row-yoon{flex:0 0 auto;min-width:52px;text-align:center;border-radius:999px;padding:6px 10px;font-weight:900;font-size:17px}
.tp-row.is-paid .tp-row-yoon{background:#dcfce7;color:#166534}
.tp-row.is-wait .tp-row-yoon{background:#fef3c7;color:#92400e}
.tp-row.is-no{opacity:.55}
.tp-row.is-no .tp-row-yoon{background:#f3f4f6;color:#6b7280}
.tp-rules li{display:grid;grid-template-columns:34px 1fr auto;gap:8px;align-items:center;font-size:15px}
.tp-rule-e{font-size:24px;text-align:center}
.tp-rules b{color:#4338ca}
.tp-ship li{font-size:15px}
`;
