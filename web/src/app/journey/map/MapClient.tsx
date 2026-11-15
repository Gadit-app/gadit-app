"use client";

/**
 * The map of the journey (wave 2 of the AI review, Gadi 2026-11-15).
 *
 * Every fortress stands on an island of its own. The islands the child has
 * opened are lit, and their monster stays there as a friend: the album of
 * monsters. The island the child stands at is marked, and the next ones show
 * only a shadow. The world grows with what the child knows: every word in the
 * index plants one tree, six to an island, from the first island on.
 *
 * Nothing here can be lost: an island never goes dark and a tree never dies.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { JRN_CSS, demoData, zone, type Data } from "../JourneyClient";
import { Monster, monsterNames, roadNames } from "../run/RunClient";
import { THEMES } from "../run/engine";

const TREES_PER_ISLAND = 6;
const AHEAD = 2;

const COPY = {
  he: {
    title: "המפה שלי", trees: (n: number) => (n === 1 ? "מילה אחת באינדקס שתלה עץ אחד בעולם שלכם" : `${n} מילים באינדקס שתלו ${n} עצים בעולם שלכם`),
    none: "כל מילה שתדעו תשתול עץ בעולם שלכם", fort: (n: number) => `מבצר ${n}`, here: "אתם כאן", friend: (name: string) => `${name} כבר חברה שלכם`,
    waits: "מחכה לכם", run: "רצים אל המבצר", back: "חזרה לאינדקס", signIn: "כדי לראות את המפה צריך להתחבר", loading: "פורשים את המפה", failed: "המפה לא נטענה", retry: "לנסות שוב",
  },
  en: {
    title: "My map", trees: (n: number) => (n === 1 ? "One word in your index planted one tree in your world" : `${n} words in your index planted ${n} trees in your world`),
    none: "Every word you know will plant a tree in your world", fort: (n: number) => `Fortress ${n}`, here: "You are here", friend: (name: string) => `${name} is your friend now`,
    waits: "Waiting for you", run: "Run to the fortress", back: "Back to the index", signIn: "Sign in to see your map", loading: "Unrolling the map", failed: "The map did not load", retry: "Try again",
  },
};

const hex = (n: number) => `#${n.toString(16).padStart(6, "0")}`;
// Where the trees stand on an island, back to front.
const SPOTS: Array<[number, number]> = [[34, 76], [186, 78], [58, 96], [164, 98], [86, 108], [140, 110]];

function Island({ theme, trees, state }: { theme: number; trees: number; state: "open" | "here" | "ahead" }) {
  const th = THEMES[theme % THEMES.length];
  const dim = state === "ahead";
  return (
    <svg className="map-island" viewBox="0 0 220 170" role="img" aria-hidden="true" style={dim ? { filter: "grayscale(1) opacity(.55)" } : undefined}>
      {/* The rock under the island. */}
      <path d="M22 92 Q40 150 78 138 Q96 166 118 140 Q150 158 168 132 Q196 128 198 92 Z" fill={hex(th.fortDark)} />
      <ellipse cx="110" cy="92" rx="92" ry="30" fill={hex(th.ground)} />
      <ellipse cx="110" cy="96" rx="34" ry="9" fill={hex(th.path)} />
      {/* The fortress. */}
      <rect x="84" y="46" width="52" height="44" rx="5" fill={hex(th.fort)} />
      <rect x="76" y="34" width="20" height="56" rx="5" fill={hex(th.fortDark)} />
      <rect x="124" y="34" width="20" height="56" rx="5" fill={hex(th.fortDark)} />
      <path d="M72 36 L86 16 L100 36 Z M120 36 L134 16 L148 36 Z" fill={hex(th.roof)} />
      <path d="M101 90 V72 Q110 60 119 72 V90 Z" fill={state === "open" ? "#fff1b8" : "#5b3a1c"} />
      <rect x="109" y="20" width="2.5" height="26" fill="#4b5563" /><path d="M111.5 20 L128 26 L111.5 32 Z" fill={hex(th.flag)} />
      {/* A tree for every word the child knows. */}
      {SPOTS.slice(0, trees).map(([x, y], i) => (
        th.prop === "cactus"
          ? <g key={i}><rect x={x - 4} y={y - 22} width="8" height="24" rx="4" fill="#3f9d57" /><rect x={x - 11} y={y - 14} width="6" height="10" rx="3" fill="#3f9d57" /><rect x={x + 5} y={y - 17} width="6" height="10" rx="3" fill="#3f9d57" /></g>
          : <g key={i}><rect x={x - 2} y={y - 6} width="4" height="8" fill="#7a4a22" /><path d={`M${x - 11} ${y - 4} L${x} ${y - 30} L${x + 11} ${y - 4} Z`} fill={th.prop === "ice" ? "#e8f6ff" : "#2f8f4a"} /></g>
      ))}
    </svg>
  );
}

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
            <header className="jrn-head">
              <h1 className="jrn-title">{c.title}</h1>
              <div className="jrn-note">{known > 0 ? c.trees(known) : c.none}</div>
            </header>
            <ol className="map-road">
              {Array.from({ length: stage + 1 + AHEAD }, (_, s) => {
                const st = s < stage ? "open" : s === stage ? "here" : "ahead";
                const trees = s <= stage ? Math.max(0, Math.min(TREES_PER_ISLAND, known - s * TREES_PER_ISLAND)) : 0;
                return (
                  <li key={s} className={`map-stop is-${st}`}>
                    <Island theme={roadOf(s)} trees={trees} state={st} />
                    <div className="map-monster"><Monster kind={s} sad={false} shadow={st === "ahead"} /></div>
                    <div className="map-name">{c.fort(s + 1)} · {roads[roadOf(s)]}</div>
                    <div className="jrn-small">{st === "open" ? c.friend(names[s % names.length]) : st === "here" ? `${c.here} · ${names[s % names.length]} ${c.waits}` : "?"}</div>
                  </li>
                );
              })}
            </ol>
            <div className="map-foot">
              <Link className="jrn-btn" href="/journey/run">{c.run}</Link>
              <Link className="jrn-btn is-ghost" href="/journey">{c.back}</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const MAP_CSS = `
.map { min-height: 100dvh; background: linear-gradient(#1f2a44 0%, #2f4a6b 100%); }
.map .jrn-wrap { color: #fff; }
.map .jrn-note, .map .jrn-small { color: #d6e2f0; }
.map-road { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 18px 14px; }
.map-stop { position: relative; display: grid; gap: 4px; justify-items: center; text-align: center; padding: 10px 8px 12px; border-radius: 20px; min-width: 0; }
.map-stop.is-here { background: rgba(255,255,255,.1); box-shadow: 0 0 0 3px #ffd34d inset; }
.map-island { width: 100%; max-width: 230px; height: auto; display: block; }
.map-monster { margin-top: -34px; }
.map-monster .run-monster { width: 64px; height: auto; display: block; }
.map-monster .run-monster.is-shadow { width: 54px; filter: brightness(0); opacity: .45; }
.map-name { font-weight: 800; font-size: 16px; }
.map .jrn-btn.is-ghost { color: #fff; box-shadow: 0 0 0 2px #fff inset; }
.map-foot { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
`;
