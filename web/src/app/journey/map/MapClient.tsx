"use client";

/**
 * The map of the journey (wave 2 of the AI review; framed cards, Gadi
 * 2026-11-15: "make the map more interesting, a frame around every fortress
 * so the separation is clear").
 *
 * Every fortress has a card of its own, in the colours of its landscape, with
 * the 3D fortress and its monster (pictures of run/models.ts, in
 * public/journey/thumbs). The fortresses the child opened carry a check and
 * their monster stays as a friend: the album of monsters. The fortress the
 * child stands at has a gold frame. The next ones are grey, locked, with the
 * monster as a shadow. The world grows with what the child knows: every word
 * in the index plants one tree, six to a fortress, from the first on.
 *
 * Nothing here can be lost: a fortress never closes again and a tree never dies.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { JRN_CSS, demoData, zone, type Data } from "../JourneyClient";
import { monsterNames, roadNames } from "../run/RunClient";
import { THEMES } from "../run/engine";

const TREES_PER_ISLAND = 6;
const AHEAD = 2;
const TREE = ["🌲", "🌵", "❄️"];

const COPY = {
  he: {
    title: "המפה שלי", trees: (n: number) => (n === 1 ? "מילה אחת באינדקס שתלה עץ אחד בעולם שלכם" : `${n} מילים באינדקס שתלו ${n} עצים בעולם שלכם`),
    none: "כל מילה שתדעו תשתול עץ בעולם שלכם", fort: (n: number) => `מבצר ${n}`, here: "אתם כאן", opened: "נפתח", locked: "נעול",
    friend: (name: string) => `${name} כבר חברה שלכם`, waits: (name: string) => `${name} מחכה לכם`, later: "מחכה בהמשך הדרך",
    treesHere: (n: number) => (n === 1 ? "עץ אחד נשתל כאן" : `${n} עצים נשתלו כאן`),
    run: "רצים אל המבצר", back: "חזרה לאינדקס", signIn: "כדי לראות את המפה צריך להתחבר", loading: "פורשים את המפה", failed: "המפה לא נטענה", retry: "לנסות שוב",
  },
  en: {
    title: "My map", trees: (n: number) => (n === 1 ? "One word in your index planted one tree in your world" : `${n} words in your index planted ${n} trees in your world`),
    none: "Every word you know will plant a tree in your world", fort: (n: number) => `Fortress ${n}`, here: "You are here", opened: "Opened", locked: "Locked",
    friend: (name: string) => `${name} is your friend now`, waits: (name: string) => `${name} waits for you`, later: "Further along the road",
    treesHere: (n: number) => (n === 1 ? "One tree planted here" : `${n} trees planted here`),
    run: "Run to the fortress", back: "Back to the index", signIn: "Sign in to see your map", loading: "Unrolling the map", failed: "The map did not load", retry: "Try again",
  },
};

export function MapClient({ demo = false }: { demo?: boolean }) {
  const { user: realUser, loading: authLoading } = useAuth();
  // The sample map (?demo=1): a child a few fortresses in. Nothing is read or saved.
  const user = demo ? null : realUser;
  const { lang, dir } = useLang();
  const c = COPY[lang === "he" ? "he" : "en"];
  const [realData, setData] = useState<Data | null>(null);
  const [realState, setState] = useState<"loading" | "ready" | "failed">("loading");
  const data = demo ? { ...demoData(lang), stage: 3, roads: { "1": 2, "2": 1 } } : realData;
  const state = demo ? "ready" : realState;

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/journey?tz=${encodeURIComponent(zone())}&ui=${encodeURIComponent(lang)}`, { headers: { Authorization: `Bearer ${await user.getIdToken()}` } });
      if (!res.ok) throw new Error(String(res.status));
      setData((await res.json()) as Data);
      setState("ready");
    } catch { setState("failed"); }
  }, [user, lang]);
  useEffect(() => { const id = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(id); }, [load]);

  const stage = data?.stage ?? 0;
  const known = data?.summary.index ?? 0;
  const names = monsterNames(lang);
  const roads = roadNames(lang);
  const roadOf = (s: number) => data?.roads?.[String(s)] ?? s % THEMES.length;

  return (
    <div className="wordbook jrn map" dir={dir}>
      <style>{JRN_CSS + MAP_CSS}</style>
      <div className="jrn-wrap">
        {!demo && !authLoading && !user && <p className="jrn-note">{c.signIn}</p>}
        {user && state === "loading" && <p className="jrn-note">{c.loading}…</p>}
        {user && state === "failed" && (
          <p className="jrn-note">{c.failed} <button type="button" className="jrn-btn is-ghost" onClick={() => { setState("loading"); void load(); }}>{c.retry}</button></p>
        )}
        {(user || demo) && state === "ready" && data && (
          <>
            <header className="jrn-head map-head">
              <div className="map-top">
                <Link className="jrn-back" href={demo ? "/journey?demo=1" : "/journey"}><span aria-hidden="true">{dir === "rtl" ? "→" : "←"}</span> {c.back}</Link>
                <Link className="jrn-btn map-run" href={demo ? "/journey/run?demo=1" : "/journey/run"}>{c.run}</Link>
              </div>
              <h1 className="jrn-title">{c.title}</h1>
              <div className="jrn-note">{known > 0 ? c.trees(known) : c.none}</div>
            </header>
            <ol className="map-road">
              {Array.from({ length: stage + 1 + AHEAD }, (_, s) => {
                const st = s < stage ? "open" : s === stage ? "here" : "ahead";
                const road = roadOf(s);
                const trees = s <= stage ? Math.max(0, Math.min(TREES_PER_ISLAND, known - s * TREES_PER_ISLAND)) : 0;
                const name = names[s % names.length];
                return (
                  <li key={s} className={`map-stop is-${st} is-r${road}`}>
                    <span className="map-num" aria-hidden="true">{s + 1}</span>
                    <span className={`map-badge is-${st}`}>{st === "open" ? `✓ ${c.opened}` : st === "here" ? c.here : `🔒 ${c.locked}`}</span>
                    <div className="map-scene">
                      {/* eslint-disable-next-line @next/next/no-img-element -- small local pictures */}
                      <img className="map-fort" src={`/journey/thumbs/fortress${road + 1}.webp`} alt="" draggable={false} />
                      {/* eslint-disable-next-line @next/next/no-img-element -- small local pictures */}
                      <img className="map-mon" src={`/journey/thumbs/monster${(s % 3) + 1}.webp`} alt="" draggable={false} />
                    </div>
                    <div className="map-name">{c.fort(s + 1)} · {roads[road]}</div>
                    <div className="map-line">{st === "open" ? c.friend(name) : st === "here" ? c.waits(name) : c.later}</div>
                    {trees > 0 && <div className="map-trees" title={c.treesHere(trees)}><span aria-hidden="true">{TREE[road % TREE.length].repeat(trees)}</span><span className="map-sr">{c.treesHere(trees)}</span></div>}
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </div>
    </div>
  );
}

const MAP_CSS = `
.map { min-height: 100dvh; background:
  radial-gradient(1.5px 1.5px at 12% 18%, rgba(255,255,255,.7), transparent 60%),
  radial-gradient(1.5px 1.5px at 78% 12%, rgba(255,255,255,.6), transparent 60%),
  radial-gradient(1px 1px at 34% 8%, rgba(255,255,255,.6), transparent 60%),
  radial-gradient(1px 1px at 62% 26%, rgba(255,255,255,.5), transparent 60%),
  radial-gradient(1.5px 1.5px at 90% 40%, rgba(255,255,255,.5), transparent 60%),
  radial-gradient(1px 1px at 6% 52%, rgba(255,255,255,.5), transparent 60%),
  radial-gradient(ellipse at 50% 0%, #2b3f6b 0%, transparent 60%),
  linear-gradient(#18213a 0%, #263d5e 100%); }
.map .jrn-wrap { color: #fff; }
.map .jrn-note { color: #d6e2f0; }
.map-head { gap: 6px; }
.map-top { width: 100%; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; }
.map-run { min-height: 40px; padding: 6px 18px; font-size: 15px; }
/* A card for every fortress, in the colours of its landscape, in a centred row joined by a dotted road. */
.map-road { list-style: none; margin: 0 auto; padding: 14px 0 0; display: grid; grid-template-columns: repeat(3, 220px); justify-content: center; gap: 30px 36px; }
.map-stop { position: relative; min-width: 0; display: grid; grid-template-rows: auto auto auto 1fr; gap: 4px; justify-items: center; text-align: center; padding: 30px 12px 14px; border-radius: 24px;
  border: 2px solid rgba(255,255,255,.16); box-shadow: 0 14px 32px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.18); }
.map-stop.is-r0 { background: linear-gradient(170deg, #3f8a5c 0%, #1f4d36 100%); }
.map-stop.is-r1 { background: linear-gradient(170deg, #c08048 0%, #6a3d22 100%); }
.map-stop.is-r2 { background: linear-gradient(170deg, #5b8fc2 0%, #23466e 100%); }
.map-stop.is-here { border: 3px solid #ffd34d; box-shadow: 0 0 0 5px rgba(255,211,77,.22), 0 16px 40px rgba(0,0,0,.45); }
.map-stop.is-ahead { filter: grayscale(.8) brightness(.72); }
.map-stop + .map-stop::before { content: ""; position: absolute; top: 50%; inset-inline-start: -36px; width: 34px; border-top: 4px dotted rgba(255,211,77,.7); }
.map-stop.is-ahead::before { border-top-color: rgba(255,255,255,.3) !important; }
/* No road hangs out of the first card of a row. */
.map-stop:nth-child(3n+1)::before { display: none; }
.map-num { position: absolute; top: -15px; left: 50%; margin-left: -15px; width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; font-weight: 800; font-size: 15px; background: #fffdf5; color: #14202b; box-shadow: 0 3px 8px rgba(0,0,0,.35); }
.map-badge { position: absolute; top: 10px; inset-inline-end: 10px; padding: 2px 9px; border-radius: 999px; font-size: 12px; font-weight: 800; background: rgba(255,255,255,.18); color: #fff; }
.map-badge.is-open { background: #22c55e; }
.map-badge.is-here { background: #ffd34d; color: #3b2a00; }
.map-scene { position: relative; width: 100%; height: 150px; display: grid; place-items: end center; }
.map-scene::after { content: ""; position: absolute; inset-inline: 12%; bottom: 4px; height: 26px; border-radius: 50%; background: radial-gradient(ellipse, rgba(0,0,0,.35), transparent 70%); z-index: 0; }
.map-fort { position: absolute; z-index: 1; inset: 0 4%; width: 92%; height: 100%; object-fit: contain; object-position: center bottom; }
.map-mon { position: absolute; z-index: 2; bottom: -6px; inset-inline-end: 4px; width: 60px; height: 60px; object-fit: contain; filter: drop-shadow(0 4px 4px rgba(0,0,0,.35)); }
.map-stop.is-ahead .map-mon { filter: brightness(0) opacity(.55); }
.map-name { position: relative; z-index: 3; margin-top: 6px; font-weight: 800; font-size: 16px; line-height: 1.3; color: #fff; }
.map-line { font-size: 13.5px; line-height: 1.4; color: rgba(255,255,255,.85); }
.map-trees { align-self: end; margin-top: 4px; padding: 3px 10px; border-radius: 999px; background: rgba(0,0,0,.22); font-size: 15px; letter-spacing: 1px; }
.map-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
@media (max-width: 800px) {
  .map-road { grid-template-columns: repeat(2, minmax(0, 220px)); }
  .map-stop:nth-child(3n+1)::before { display: block; }
  .map-stop:nth-child(2n+1)::before { display: none; }
}
/* A phone: two cards to a row, smaller, with no road between them. */
@media (max-width: 560px) {
  .map-road { grid-template-columns: 1fr 1fr; gap: 24px 10px; }
  .map-stop { padding: 24px 6px 10px; border-radius: 18px; }
  .map-road .map-stop::before { display: none !important; }
  .map-scene { height: 104px; }
  .map-mon { width: 44px; height: 44px; }
  .map-badge { top: 6px; inset-inline-end: 6px; font-size: 10.5px; padding: 1px 7px; }
  .map-name { font-size: 14px; }
  .map-line { font-size: 12px; }
  .map-trees { font-size: 12px; }
}
`;
