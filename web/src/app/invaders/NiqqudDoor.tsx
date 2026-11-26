"use client";

/**
 * The niqqud door of מילים פולשות (Gadi 2026-11-25, design doc
 * 2026-11-25-niqqud-door-design.md). A vowel sign is shown and named at the
 * top; signs, syllables or pictured words fall on the shared engine
 * (FallStage), and the child catches those that carry it, watching out for
 * the impostors. 11 stations of 3 stages; a round is 5 calls; 4 clean calls
 * pass the stage (lib/invaders/niqqud.ts, lib/invaders/niqqud-progress.ts).
 *
 * The server keeps the progress; this device keeps a copy so the stations
 * open at once, and a round whose save failed waits on the device and is
 * sent again on the next visit (the round's id makes a resend harmless).
 * Everything in this door is always vowelled, so it has no niqqud switch.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { WaitText } from "@/components/WaitText";
import { SfxToggle } from "@/components/SfxToggle";
import { TesterButton } from "@/components/TesterButton";
import { useSpeech } from "@/components/play/GameSyllables";
import { useAuth } from "@/lib/auth-context";
import { notifyActivity } from "@/lib/notify-activity-client";
import { sfx } from "@/lib/game-sfx";
import { setTesterGame } from "@/lib/tester";
import { buildCall, SIGNS, soundOf, STATIONS, type NqItem, type NqWord, type SignId, type Station } from "@/lib/invaders/niqqud";
import { applyNqRound, cleanNq, emptyNq, NQ, unlocked, type NqCall, type NqRound, type NqState } from "@/lib/invaders/niqqud-progress";
import { FallStage, type Drop } from "./FallStage";
import { invCopy } from "./inv-i18n";
import { nqCopy } from "./nq-i18n";

export type NqApiWord = NqWord & { pic: string };
export type NqData = { words: NqApiWord[]; progress: NqState; canJump: boolean };

const ORDER = STATIONS.map((s) => s.id);
const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/* ---------- this device: a copy of the progress, and the rounds not saved yet ---------- */
const copyKey = (uid: string) => `gadit-nq:${uid}`;
const pendingKey = (uid: string) => `gadit-nq-pending:${uid}`;
/** The server read the round and said no (not a round, or the game is not open): sending it again changes nothing. */
const REFUSED = (status: number) => status === 400 || status === 403;
const SIGN_IDS = Object.keys(SIGNS);
function readJson<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; }
}
function writeJson(key: string, v: unknown) {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* private window: this visit only */ }
}

/* ---------- pictures: a word card falls with its picture once the picture is here ---------- */
const picState = new Map<string, "loading" | "ok" | "bad">();
const held = new Set<HTMLImageElement>();
function warm(url: string | undefined) {
  if (!url || picState.has(url) || typeof window === "undefined") return;
  picState.set(url, "loading");
  const im = new Image();
  im.decoding = "async";
  held.add(im);
  const done = (s: "ok" | "bad") => { picState.set(url, s); held.delete(im); };
  im.onload = () => { (im.decode ? im.decode() : Promise.resolve()).then(() => done("ok"), () => done("ok")); };
  im.onerror = () => done("bad");
  im.src = url;
}
const isReady = (url: string | undefined) => !!url && picState.get(url) === "ok";

/** A word with its first letter (and that letter's marks) apart, to colour it. */
const splitFirst = (w: string): [string, string] => { const m = w.match(/^[א-ת][֑-ׇ]*/); return m ? [m[0], w.slice(m[0].length)] : ["", w]; };
/** The signs shown at the top of a station's intro: every sign its calls name. */
const topsOf = (st: Station): SignId[] => [...new Set(st.calls.flatMap((t) => t.top))];

/**
 * A vowel sign on its own, drawn: a dashed circle where the letter goes and the
 * sign in its place. A mark with no letter under it does not render reliably
 * in fonts (in Chrome "◌" + kamatz collapsed to nothing), so the shapes are
 * drawn here as the fonts draw them. The signs written with a vav (וֹ, וּ)
 * have their letter and are plain text. Its label is the sign's name.
 */
export function SignGlyph({ sign, size }: { sign: SignId; size: number }) {
  const ink = "#2a2350";
  const dot = (cx: number, cy: number) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={5.5} fill={ink} />;
  if (sign === "holamMale" || sign === "shuruk") {
    return (
      <svg className="nq-glyph" width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={SIGNS[sign].name}>
        <text x="50" y="66" textAnchor="middle" fontSize="64" fontWeight="800" fill={ink} style={{ fontFamily: "var(--wb-font-display, Rubik, system-ui, sans-serif)" }}>{sign === "holamMale" ? "וֹ" : "וּ"}</text>
      </svg>
    );
  }
  const male = sign === "hiriqMale";
  const cx = male ? 62 : 50; // hirik with a yod: the yod sits after the letter, on its left
  const marks: Record<string, React.ReactNode> = {
    kamatz: <g fill={ink}><rect x={cx - 14} y={70} width={28} height={6} rx={2} /><rect x={cx - 3} y={70} width={6} height={15} rx={2} /></g>,
    patah: <rect x={cx - 14} y={71} width={28} height={6} rx={2} fill={ink} />,
    tsere: <g>{dot(cx - 9, 76)}{dot(cx + 9, 76)}</g>,
    segol: <g>{dot(cx - 9, 72)}{dot(cx + 9, 72)}{dot(cx, 86)}</g>,
    hiriqHaser: dot(cx, 76),
    hiriqMale: dot(cx, 76),
    holamHaser: dot(cx - 27, 16),
    kubutz: <g>{dot(cx - 12, 70)}{dot(cx, 79)}{dot(cx + 12, 88)}</g>,
    shva: <g>{dot(cx, 70)}{dot(cx, 86)}</g>,
  };
  return (
    <svg className="nq-glyph" width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={SIGNS[sign].name}>
      <circle cx={cx} cy={38} r={23} fill="none" stroke="#9aa5b1" strokeWidth={3.5} strokeDasharray="6 6" />
      {marks[sign]}
      {male ? <text x="22" y="47" textAnchor="middle" fontSize="66" fontWeight="800" fill={ink} style={{ fontFamily: "var(--wb-font-display, Rubik, system-ui, sans-serif)" }}>י</text> : null}
    </svg>
  );
}

type CardData = { item: NqItem; pic?: string };

/* ---------- one call: the sky ---------- */
function NqSky({ station, callIndex, stage, words, fallS, avatar, imp, lang, speak, onDone, onExit, calls }: {
  station: Station; callIndex: number; stage: 1 | 2 | 3; words: NqApiWord[]; fallS: number; avatar: string; imp: string | null; lang: string;
  speak: (text: string) => Promise<boolean>; onDone: (r: NqCall) => void; onExit: () => void; calls: NqCall[];
}) {
  const nc = nqCopy(lang);
  const picOf = useMemo(() => new Map(words.map((w) => [w.w, w.pic])), [words]);
  // built once: the words arriving from the server mid-call must not change what is falling
  const [built] = useState(() => buildCall(station, callIndex, stage, words));
  const { tpl, trues, imps } = built;

  const queue = useRef<NqItem[]>([...trues]);
  const misses = useRef(new Map<string, number>());
  const caught = useRef(new Set<string>());
  const lost = useRef(new Set<string>());
  const mistakes = useRef(0);
  const ok = useRef<SignId[]>([]);
  const mix = useRef<[SignId, SignId][]>([]);
  const doneRef = useRef(false);
  const sinceTrue = useRef(1);
  const wantSince = useRef(new Map<string, number>());
  const [filled, setFilled] = useState(0);
  const [tip, setTip] = useState<string | null>(null);
  const tipTm = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const endTm = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => { clearTimeout(tipTm.current); endTm.current.forEach(clearTimeout); }, []);

  // the call is said as it starts; the next pictures start coming
  useEffect(() => {
    const tm = setTimeout(() => { void speak(tpl.hear); }, 350);
    for (const it of [...trues, ...imps]) if (it.p) warm(picOf.get(it.text));
    return () => clearTimeout(tm);
  }, [speak, tpl.hear, trues, imps, picOf]);

  const say = useCallback((text: string) => {
    clearTimeout(tipTm.current);
    setTip(text);
    tipTm.current = setTimeout(() => setTip(null), 1700);
  }, []);

  const toDrop = useCallback((item: NqItem, pic: string | undefined): Drop<CardData> => ({
    kind: item.ok ? "true" : "imp",
    data: { item, pic },
    isPic: !!pic,
    face: (S) => {
      if (item.stage === 3) {
        const [first, rest] = splitFirst(item.text);
        return (
          <span className={`nq-face is-word${pic ? " has-pic" : ""}`}>
            {pic ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={pic} alt="" draggable={false} onError={(e) => { e.currentTarget.style.display = "none"; }} />
            ) : null}
            <span className="nq-text" dir="rtl" style={{ fontSize: clamp(S * (pic ? 0.19 : 0.26), 18, 34) }}><b className="nq-first">{first}</b>{rest}</span>
          </span>
        );
      }
      if (item.stage === 1) return <span className="nq-face"><SignGlyph sign={item.sign} size={Math.round(S * 0.86)} /></span>;
      return <span className="nq-face nq-text" dir="rtl" style={{ fontSize: clamp(S * 0.46, 40, 72) }}>{item.text}</span>;
    },
    back: () => (
      <>
        {imp ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imp} alt="" draggable={false} />
        ) : <span className="iv-imp-face" aria-hidden="true">😜</span>}
        {item.stage === 1 ? <SignGlyph sign={item.sign} size={44} /> : <b dir="rtl">{item.text}</b>}
      </>
    ),
  }), [imp]);

  /** The next card: a true one when there is room (a word waits up to 3 s for its picture), else an impostor. */
  const next = useCallback((live: Drop<CardData>[]): Drop<CardData> | null => {
    const trueLive = live.filter((d) => d.kind === "true").length;
    const free = queue.current.filter((it) => !live.some((d) => d.data.item.key === it.key));
    if (free.length && trueLive < 2 && (sinceTrue.current >= 2 || Math.random() < 0.45)) {
      const it = free[0];
      let pic: string | undefined;
      let ready = true;
      if (it.stage === 3) {
        const url = picOf.get(it.text);
        warm(url);
        const now = performance.now();
        if (!wantSince.current.has(it.key)) wantSince.current.set(it.key, now);
        const waited = (now - wantSince.current.get(it.key)!) / 1000;
        if (isReady(url)) pic = url;
        // still coming: an impostor falls meanwhile; after 3 s the word falls without it
        else if (picState.get(url ?? "") !== "bad" && waited <= 3) ready = false;
      }
      if (ready) {
        queue.current = queue.current.filter((x) => x.key !== it.key);
        wantSince.current.delete(it.key);
        sinceTrue.current = 0;
        return toDrop(it, pic);
      }
    }
    if (!imps.length) return null;
    const onScreen = new Set(live.map((d) => d.data.item.key));
    const pool = imps.filter((it) => !onScreen.has(it.key));
    let it = pick(pool.length ? pool : imps);
    let pic: string | undefined;
    if (it.stage === 3) {
      // an impostor word whose picture is here; else one whose picture failed falls as its word
      const ready = (pool.length ? pool : imps).filter((x) => isReady(picOf.get(x.text)));
      if (ready.length) { it = pick(ready); pic = picOf.get(it.text); }
    }
    sinceTrue.current += 1;
    return toDrop(it, pic);
  }, [imps, picOf, toDrop]);

  const finishIfDone = useCallback(() => {
    if (doneRef.current) return;
    if (caught.current.size + lost.current.size < trues.length) return;
    doneRef.current = true;
    const clean = lost.current.size === 0 && mistakes.current === 0;
    // left before the call closed (✕): it is not counted, in this round or the next
    endTm.current.push(
      setTimeout(() => (clean ? sfx.magic() : sfx.star()), 200),
      setTimeout(() => onDone({ clean, ok: ok.current, mix: mix.current }), 1300),
    );
  }, [onDone, trues.length]);

  const onCatch = useCallback((d: Drop<CardData>): "caught" | "flip" | "gone" => {
    const it = d.data.item;
    if (d.kind === "true") {
      if (caught.current.has(it.key)) return "gone";
      caught.current.add(it.key);
      ok.current.push(it.sign);
      sfx.letter(caught.current.size - 1);
      void speak(it.say);
      setFilled(caught.current.size);
      finishIfDone();
      return "caught";
    }
    mistakes.current += 1;
    mix.current.push([tpl.ok[0], it.sign]);
    sfx.wrong();
    say(tpl.by === "name" ? nc.impostorName(SIGNS[it.sign].name) : nc.impostorSound(soundOf(it.sign)));
    // what the impostor says, then what was asked
    void speak(it.say).then((whole) => { if (whole) void speak(tpl.hear); });
    return "flip";
  }, [finishIfDone, nc, say, speak, tpl]);

  const onLand = useCallback((d: Drop<CardData>) => {
    // a true card that lands comes back once
    const it = d.data.item;
    const n = (misses.current.get(it.key) ?? 0) + 1;
    misses.current.set(it.key, n);
    if (n >= 2) lost.current.add(it.key); else queue.current.push(it);
    finishIfDone();
  }, [finishIfDone]);

  const done = useCallback(() => doneRef.current, []);
  const line = tpl.by === "name" ? nc.callName(SIGNS[tpl.ok[0]].name) : nc.callSound(tpl.hear);

  const hud = (
    <div className="iv-hud">
      <div className="iv-hud-side">
        <button type="button" className="iv-round" onClick={onExit} aria-label={nc.toStations}>✕</button>
        <SfxToggle className="iv-round" />
      </div>
      <div className="iv-word nq-hud" dir="rtl">
        <button type="button" className="iv-tts" onClick={() => { void speak(tpl.hear); }} aria-label={nc.hear}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" /><path d="M16 8.5a4.5 4.5 0 0 1 0 7M18.5 6a8 8 0 0 1 0 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>
        </button>
        <span className="nq-tops">{tpl.top.map((s) => <span key={s} className="nq-top"><SignGlyph sign={s} size={48} /></span>)}</span>
        <span className="iv-slots">
          {trues.map((t, i) => <span key={t.key} className={`iv-slot${i < filled ? " is-on" : ""}`}>{i < filled ? "✓" : null}</span>)}
        </span>
        <span className="nq-dots" aria-hidden="true">
          {Array.from({ length: NQ.calls }, (_, i) => (
            <i key={i} className={i < calls.length ? (calls[i].clean ? "is-clean" : "is-done") : i === callIndex ? "is-now" : undefined} />
          ))}
        </span>
      </div>
      <div className="iv-hud-side is-end">
        <TesterButton game="invaders-niqqud" word={station.id} className="iv-round" />
      </div>
    </div>
  );

  return (
    <FallStage<CardData>
      fallS={fallS}
      next={next}
      onCatch={onCatch}
      onLand={onLand}
      done={done}
      avatar={avatar}
      hud={hud}
      tip={tip ?? line}
      tipAlert={!!tip}
    />
  );
}

/* ---------- the door ---------- */
type Result = { clean: number; passed: boolean; firstPass: boolean; stationDone: boolean; wordies: number; saved: boolean };

export function NiqqudDoor({ fallS, avatar, imp, lang, demo, onBack }: {
  /** Seconds for a fall at pace 1: the words door's slowest base × the chosen speed. */
  fallS: number; avatar: string; imp: string | null; lang: string; demo?: NqData; onBack: () => void;
}) {
  const { user, loading, planReady } = useAuth();
  const nc = nqCopy(lang);
  const c = invCopy(lang);
  const dir = lang === "he" || lang === "ar" || lang === "fa" ? "rtl" : "ltr";
  const { speak, stop } = useSpeech();

  const [data, setData] = useState<NqData | null>(demo ?? null);
  const [error, setError] = useState<"not_open" | "failed" | null>(null);
  const [phase, setPhase] = useState<"stations" | "intro" | "play" | "result">("stations");
  const [station, setStation] = useState<Station>(STATIONS[0]);
  const [stage, setStage] = useState<1 | 2 | 3>(1);
  const [calls, setCalls] = useState<NqCall[]>([]);
  const callsRef = useRef<NqCall[]>([]);
  const [round, setRound] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const introSaid = useRef("");

  /** Sends the rounds still waiting on this device, oldest first; the server's state wins. */
  const flush = useCallback(async (): Promise<NqState | null> => {
    if (demo || !user) return null;
    let state: NqState | null = null;
    const gone: string[] = [];
    for (const r of readJson<NqRound[]>(pendingKey(user.uid), [])) {
      try {
        const res = await fetch("/api/invaders", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` },
          body: JSON.stringify({ door: "niqqud", ...r, tz: Intl.DateTimeFormat().resolvedOptions().timeZone }),
        });
        if (res.ok) { state = ((await res.json()) as { state: NqState }).state; gone.push(r.rid); }
        else if (REFUSED(res.status)) gone.push(r.rid);
      } catch { /* stays for the next visit */ }
    }
    // a round added while this ran stays
    if (gone.length) writeJson(pendingKey(user.uid), readJson<NqRound[]>(pendingKey(user.uid), []).filter((x) => !gone.includes(x.rid)));
    return state;
  }, [demo, user]);

  useEffect(() => {
    if (demo || loading || !user || !planReady) return;
    let alive = true;
    // this device's copy opens the stations at once
    const raw = readJson<unknown>(copyKey(user.uid), null);
    const mine = raw ? cleanNq(raw, ORDER, SIGN_IDS) : null;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the device's copy is read once the profile is known
    if (mine) setData((d) => d ?? { words: [], progress: mine, canJump: false });
    (async () => {
      try {
        await flush();
        const r = await fetch("/api/invaders?door=niqqud", { headers: { Authorization: `Bearer ${await user.getIdToken()}` } });
        if (!alive) return;
        if (r.status === 403) { setError("not_open"); return; }
        if (!r.ok) { setError("failed"); return; }
        const d = (await r.json()) as NqData;
        if (!alive) return;
        setData(d);
        writeJson(copyKey(user.uid), d.progress);
      } catch { if (alive) setError("failed"); }
    })();
    return () => { alive = false; };
  }, [demo, loading, user, planReady, flush]);

  useEffect(() => { setTesterGame("invaders-niqqud", phase === "stations" ? undefined : station.id); }, [phase, station]);
  useEffect(() => () => { setTesterGame(""); stop(); }, [stop]);

  const progress = data?.progress ?? emptyNq();
  const canJump = !!data?.canJump;
  const words = useMemo(() => data?.words ?? [], [data]);
  /** The word stage needs 3 pictured words to catch in every call of the station; without them a call would never end. */
  const wordsReady = useMemo(() => new Set(STATIONS.filter((st) => st.calls.every((t) => words.filter((w) => t.okWords.includes(w.g)).length >= 3)).map((st) => st.id)), [words]);

  // the station is introduced by its sound or its name, once
  useEffect(() => {
    if (phase !== "intro") return;
    const key = `${station.id}:${stage}:${round}`;
    if (introSaid.current === key) return;
    const tm = setTimeout(() => { introSaid.current = key; void speak(station.calls[0].hear); }, 500);
    // a word stage: its pictures start coming now
    if (stage === 3) for (const w of words) warm(w.pic);
    return () => clearTimeout(tm);
  }, [phase, station, stage, round, speak, words]);

  const open = (st: Station, sg: 1 | 2 | 3) => {
    sfx.whoosh();
    setStation(st);
    setStage(sg);
    callsRef.current = [];
    setCalls([]);
    setResult(null);
    setRound((x) => x + 1);
    setPhase("intro");
  };

  const finishRound = useCallback(async (all: NqCall[]) => {
    const r: NqRound = { rid: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`, station: station.id, stage, calls: all };
    const clean = all.filter((x) => x.clean).length;
    // what the rules say on this device, shown at once; the server's answer replaces it
    const local = applyNqRound(progress, r, ORDER, new Date().toISOString().slice(0, 10), canJump);
    setResult({ clean, passed: local.passed, firstPass: local.firstPass, stationDone: local.stationDone, wordies: local.wordies, saved: !!demo });
    setPhase("result");
    if (local.passed) setTimeout(() => sfx.win(), 300);
    if (demo || !user) { setData((d) => (d ? { ...d, progress: local.state } : d)); return; }
    const pend = readJson<NqRound[]>(pendingKey(user.uid), []);
    writeJson(pendingKey(user.uid), [...pend, r]);
    writeJson(copyKey(user.uid), local.state);
    setData((d) => (d ? { ...d, progress: local.state } : d));
    try {
      const res = await fetch("/api/invaders", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` },
        body: JSON.stringify({ door: "niqqud", ...r, tz: Intl.DateTimeFormat().resolvedOptions().timeZone }),
      });
      if (!res.ok) {
        // refused: nothing to send again. Anything else (sign-in expired, busy, server failure) waits on this device
        if (REFUSED(res.status)) {
          writeJson(pendingKey(user.uid), readJson<NqRound[]>(pendingKey(user.uid), []).filter((x) => x.rid !== r.rid));
          setResult((x) => (x ? { ...x, saved: true } : x));
        }
        return;
      }
      const j = (await res.json()) as { passed: boolean; firstPass: boolean; stationDone: boolean; wordies: number; state: NqState };
      writeJson(pendingKey(user.uid), readJson<NqRound[]>(pendingKey(user.uid), []).filter((x) => x.rid !== r.rid));
      writeJson(copyKey(user.uid), j.state);
      setData((d) => (d ? { ...d, progress: j.state } : d));
      setResult({ clean, passed: j.passed, firstPass: j.firstPass, stationDone: j.stationDone, wordies: j.wordies, saved: true });
      if (j.wordies > 0) setTimeout(() => sfx.star(), 400);
      void notifyActivity(user, { kind: "game", label: `${c.title} · ${nc.stationName[station.id] ?? station.id}`, score: clean, total: NQ.calls });
    } catch { /* it waits on this device and goes on the next visit */ }
  }, [station, stage, progress, canJump, demo, user, c.title, nc.stationName]);

  const callDone = useCallback((r: NqCall) => {
    const all = [...callsRef.current, r];
    callsRef.current = all;
    setCalls(all);
    if (all.length >= NQ.calls) void finishRound(all);
  }, [finishRound]);

  const toStations = () => { stop(); sfx.whoosh(); setPhase("stations"); };

  /* the next thing to play after a result */
  const nextOf = (): [Station, 1 | 2 | 3] | null => {
    if (!result?.passed) return null;
    if (stage < 3) return [station, (stage + 1) as 2 | 3];
    const i = ORDER.indexOf(station.id);
    return i + 1 < STATIONS.length ? [STATIONS[i + 1], 1] : null;
  };

  return (
    <>
      <style>{NQ_CSS}</style>

      {phase === "play" && calls.length < NQ.calls ? (
        <NqSky
          key={`${round}:${calls.length}`}
          station={station} callIndex={calls.length} stage={stage} words={words}
          fallS={fallS} avatar={avatar} imp={imp} lang={lang} speak={speak}
          onDone={callDone} onExit={toStations} calls={calls}
        />
      ) : null}

      {phase === "stations" ? (
        <div className="iv-wrap" dir={dir}>
          <button type="button" className="iv-round iv-x" onClick={() => { stop(); onBack(); }} aria-label={nc.back}>✕</button>
          <div className="iv-card-big nq-stations">
            <strong className="iv-title is-big">{nc.stationsTitle}</strong>
            {canJump ? <p className="iv-note">{nc.jumpNote}</p> : null}
            {error === "not_open" ? <p className="iv-note">{c.notOpen}</p>
              : error === "failed" && !data ? <p className="iv-note">{nc.failed}</p>
              : !data ? <span className="iv-note"><WaitText text={nc.loading} /></span>
              : (
                <ol className="nq-list">
                  {STATIONS.map((st) => {
                    const passed = progress.st[st.id] ?? 0;
                    const openAt = unlocked(progress, ORDER, st.id, 1);
                    return (
                      <li key={st.id} className={openAt || canJump ? undefined : "is-locked"}>
                        <span className="nq-n">{st.n}</span>
                        <span className="nq-name">
                          <b dir="rtl">{nc.stationName[st.id]}</b>
                          {!openAt && !canJump ? <small>{nc.locked}</small> : null}
                        </span>
                        <span className="nq-stages">
                          {([1, 2, 3] as const).map((sg) => {
                            const may = (canJump || unlocked(progress, ORDER, st.id, sg)) && (sg < 3 || wordsReady.has(st.id));
                            return (
                              <button key={sg} type="button" disabled={!may} className={sg <= passed ? "is-passed" : undefined} onClick={() => open(st, sg)}>
                                {nc.stageName[sg - 1]}
                              </button>
                            );
                          })}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              )}
            <button type="button" className="iv-link" onClick={() => { stop(); onBack(); }}>{nc.back}</button>
          </div>
        </div>
      ) : null}

      {phase === "intro" ? (
        <div className="iv-wrap" dir={dir}>
          <button type="button" className="iv-round iv-x" onClick={toStations} aria-label={nc.toStations}>✕</button>
          <div className="iv-card-big">
            <span className="iv-label">{nc.stationName[station.id]} · {nc.stageName[stage - 1]}</span>
            <span className="nq-intro-signs" dir="rtl">
              {topsOf(station).map((s) => (
                <span key={s} className="nq-sign"><SignGlyph sign={s} size={96} /><small>{SIGNS[s].name}</small></span>
              ))}
            </span>
            <button type="button" className="iv-tts nq-hear" onClick={() => { void speak(station.calls[0].hear); }} aria-label={nc.hear}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" /><path d="M16 8.5a4.5 4.5 0 0 1 0 7M18.5 6a8 8 0 0 1 0 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>
            </button>
            <p className="iv-goal">{nc.stationIntro[station.id]}</p>
            <button type="button" className="iv-btn" onClick={() => { stop(); sfx.whoosh(); setPhase("play"); }}>{nc.start}</button>
          </div>
        </div>
      ) : null}

      {phase === "result" && result ? (
        <div className="iv-wrap" dir={dir}>
          <button type="button" className="iv-round iv-x" onClick={toStations} aria-label={nc.toStations}>✕</button>
          <div className="iv-card-big">
            <span className="iv-label">{nc.stationName[station.id]} · {nc.stageName[stage - 1]}</span>
            <span className="nq-dots is-big" aria-hidden="true">{calls.map((x, i) => <i key={i} className={x.clean ? "is-clean" : "is-done"} />)}</span>
            <strong className="iv-title">{nc.cleanCalls(result.clean, NQ.calls)}</strong>
            <p className="iv-goal">{result.passed ? nc.passed : nc.notPassed}</p>
            {result.stationDone ? <strong className="iv-title is-big">{nc.stationDone}</strong> : null}
            {result.wordies > 0 ? <span className="iv-wordies">{nc.wordies(result.wordies)}</span> : null}
            {!result.saved ? <p className="iv-note">{nc.savedLater}</p> : null}
            <div className="iv-row">
              {(() => { const n = nextOf(); return n ? <button type="button" className="iv-btn" onClick={() => open(n[0], n[1])}>{nc.nextStage}</button> : null; })()}
              <button type="button" className={`iv-btn${result.passed ? " is-ghost" : ""}`} onClick={() => open(station, stage)}>{nc.again}</button>
              <button type="button" className="iv-btn is-ghost" onClick={toStations}>{nc.toStations}</button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

const NQ_CSS = `
.nq-face{position:absolute;inset:0;display:grid;place-items:center;color:#2a2350;font-weight:800;line-height:1.55;font-family:var(--wb-font-display,inherit)}
.nq-face.is-word{grid-template-rows:1fr auto;place-items:stretch}
.nq-face.is-word img{position:static;width:100%;height:100%;min-height:0;object-fit:cover;display:block}
.nq-face.is-word .nq-text{display:block;text-align:center;padding:2px 4px 4px;background:#fff;white-space:nowrap}
.nq-face.is-word:not(.has-pic){grid-template-rows:1fr;place-items:center}
.nq-first{color:#7c3aed;font-weight:900}
.nq-hud{gap:4px 12px}
.nq-tops{display:inline-flex;gap:10px}
.nq-top{display:inline-grid;place-items:center;line-height:0}
.nq-dots{display:inline-flex;gap:5px;align-items:center}
.nq-dots i{width:10px;height:10px;border-radius:50%;background:#e2e8f0;display:block}
.nq-dots i.is-now{background:#c4b5fd}
.nq-dots i.is-done{background:#fdba74}
.nq-dots i.is-clean{background:#22c55e}
.nq-dots.is-big i{width:16px;height:16px}
.nq-stations{max-width:520px;max-height:calc(100dvh - 40px);overflow-y:auto}
.nq-list{list-style:none;margin:0;padding:0;display:grid;gap:8px;width:100%}
.nq-list li{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:10px;padding:8px 10px;border-radius:16px;background:#f5f3ff;text-align:start}
.nq-list li.is-locked{opacity:.55}
.nq-n{width:30px;height:30px;border-radius:50%;background:#7c3aed;color:#fff;display:grid;place-items:center;font-weight:900}
.nq-name{display:grid;gap:2px;min-width:0}
.nq-name b{font-size:17px}
.nq-name small{color:#5f6b73;font-weight:700}
.nq-stages{display:inline-flex;gap:4px}
.nq-stages button{border:0;border-radius:999px;background:#fff;color:#4c3d8f;font:inherit;font-weight:800;font-size:14px;padding:6px 10px;cursor:pointer;box-shadow:0 1px 4px #0002}
.nq-stages button.is-passed{background:#22c55e;color:#fff}
.nq-stages button:disabled{opacity:.45;cursor:default;box-shadow:none}
.nq-intro-signs{display:flex;gap:22px;justify-content:center}
.nq-sign{display:grid;justify-items:center;gap:2px}
.nq-sign small{font-size:17px;color:#4c3d8f;font-weight:800}
.nq-hear{width:52px;height:52px}
.nq-hear svg{width:30px;height:30px}
@media (max-width:560px){.nq-list li{grid-template-columns:auto minmax(0,1fr);}.nq-stages{grid-column:1 / -1;justify-content:flex-end}.nq-sign .nq-glyph{width:80px;height:80px}}
`;
