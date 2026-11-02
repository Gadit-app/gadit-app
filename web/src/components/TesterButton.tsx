"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { sfx } from "@/lib/game-sfx";
import { TESTER_CHOICES, TESTER_EMOJI, TESTER_SAY_FIRST, testerCopy, testerGame, type TesterKind } from "@/lib/tester";

/**
 * The tester's 🧪 button (Gadi 2026-11-02). Only testers see it. Fixed
 * choices, and a microphone: a bug or an idea opens the recorder first, so
 * the child just says it. Every note reaches Gadi by email at once (with the
 * recording and its transcript).
 *
 * Games with their own top bar render it inline; everywhere else in the
 * games, <TesterFab/> (in the root layout) floats it in a corner.
 */

/* inline buttons on screen: the floating one hides while any is mounted */
let inline = 0;
const subs = new Set<() => void>();
const ping = () => subs.forEach((f) => f());
const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };

const MAX_SEC = 60;

export function TesterButton({ game, word, className, floating }: { game: string; word?: string; className?: string; floating?: boolean }) {
  const { user, tester } = useAuth();
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"pick" | "say" | "sending" | "sent">("pick");
  const [kind, setKind] = useState<TesterKind>("voice");
  const [recording, setRecording] = useState(false);
  const [secs, setSecs] = useState(0);
  const [noMic, setNoMic] = useState(false);
  const [heard, setHeard] = useState("");
  const recRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    if (floating) return;
    inline += 1; ping();
    return () => { inline -= 1; ping(); };
  }, [floating]);

  const stopAll = () => {
    clearInterval(tickRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };
  useEffect(() => () => { try { recRef.current?.stop(); } catch { /* fine */ } stopAll(); }, []);

  if (!user || !tester) return null;
  const c = testerCopy(lang);
  const ctx = floating ? { game: testerGame().game || game, word: testerGame().word ?? word } : { game, word };

  const close = () => {
    try { if (recRef.current?.state === "recording") { recRef.current.onstop = null; recRef.current.stop(); } } catch { /* fine */ }
    stopAll();
    setRecording(false);
    setOpen(false);
    setView("pick");
    setNoMic(false);
    setHeard("");
  };

  const send = async (k: TesterKind, audio?: Blob) => {
    setView("sending");
    let transcript = "";
    try {
      const token = await user.getIdToken();
      const path = typeof window !== "undefined" ? window.location.pathname : "";
      const res = audio
        ? await (async () => {
            const f = new FormData();
            f.append("game", ctx.game); f.append("kind", k); f.append("word", ctx.word ?? ""); f.append("path", path); f.append("lang", lang);
            f.append("audio", audio, audio.type.includes("mp4") ? "note.m4a" : "note.webm");
            return fetch("/api/tester-feedback", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: f });
          })()
        : await fetch("/api/tester-feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ game: ctx.game, kind: k, word: ctx.word, path, lang }),
          });
      transcript = ((await res.json().catch(() => null)) as { transcript?: string } | null)?.transcript ?? "";
    } catch { /* a lost note is fine */ }
    sfx.correct();
    setHeard(transcript);
    setView("sent");
    setTimeout(close, transcript ? 3200 : 1500);
  };

  const startRec = async () => {
    setNoMic(false);
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch { setNoMic(true); return; }
    streamRef.current = stream;
    const mime = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((m) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported?.(m)) ?? "";
    let rec: MediaRecorder;
    try { rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined); } catch { stopAll(); setNoMic(true); return; }
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    rec.onstop = () => {
      stopAll();
      setRecording(false);
      const blob = new Blob(chunks, { type: rec.mimeType || mime || "audio/webm" });
      if (blob.size > 0) void send(kind, blob);
      else void send(kind);
    };
    recRef.current = rec;
    rec.start();
    sfx.tap();
    setRecording(true);
    setSecs(0);
    tickRef.current = setInterval(() => {
      setSecs((s) => {
        if (s + 1 >= MAX_SEC) { try { rec.stop(); } catch { /* fine */ } }
        return s + 1;
      });
    }, 1000);
  };
  const stopRec = () => { try { recRef.current?.stop(); } catch { /* fine */ } };

  const pick = (k: TesterKind) => {
    sfx.tap();
    setKind(k);
    if (TESTER_SAY_FIRST.has(k) || k === "voice") setView("say");
    else void send(k);
  };

  const prompt = kind === "bug" ? c.sayBug : kind === "idea" ? c.sayIdea : c.sayAny;

  return (
    <>
      <style>{CSS}</style>
      <button
        type="button"
        className={floating ? "tst-fab" : `tst-btn ${className ?? ""}`}
        onClick={(e) => { e.stopPropagation(); sfx.tap(); setOpen(true); }}
        aria-label={c.badge}
        title={c.badge}
      >🧪</button>
      {open ? (
        <div className="tst-wrap" onClick={(e) => { e.stopPropagation(); if (!recording) close(); }} dir={lang === "he" ? "rtl" : "ltr"}>
          <div className="tst-card" role="dialog" aria-label={c.title} onClick={(e) => e.stopPropagation()}>
            <span className="tst-badge">🧪 {c.badge}</span>

            {view === "pick" ? (
              <>
                <strong className="tst-title">{c.title}</strong>
                <button type="button" className="tst-mic-big" onClick={() => pick("voice")}>🎤 {c.kinds.voice}</button>
                <div className="tst-grid">
                  {TESTER_CHOICES.map((k) => (
                    <button key={k} type="button" className="tst-kind" onClick={() => pick(k)}>
                      <span className="tst-emoji">{TESTER_EMOJI[k]}</span>
                      <span>{c.kinds[k]}</span>
                    </button>
                  ))}
                </div>
                <a className="tst-pay" href={`${lang === "en" ? "" : `/${lang}`}/tester`}>{c.myPay}</a>
                <button type="button" className="tst-close" onClick={close}>{c.close}</button>
              </>
            ) : null}

            {view === "say" ? (
              <>
                <span className="tst-emoji is-big">{TESTER_EMOJI[kind]}</span>
                <strong className="tst-title">{prompt}</strong>
                {recording ? (
                  <button type="button" className="tst-rec is-on" onClick={stopRec}>
                    <span className="tst-dot" /> {c.stop} · {secs}s
                  </button>
                ) : (
                  <button type="button" className="tst-rec" onClick={startRec}>{c.record}</button>
                )}
                {noMic ? <p className="tst-nomic">{c.noMic}</p> : null}
                {!recording && kind !== "voice" ? <button type="button" className="tst-close" onClick={() => send(kind)}>{c.sendPlain}</button> : null}
                {!recording ? <button type="button" className="tst-close" onClick={close}>{c.close}</button> : null}
              </>
            ) : null}

            {view === "sending" ? <strong className="tst-title">{c.sending}…</strong> : null}

            {view === "sent" ? (
              <>
                <strong className="tst-title">{c.thanks}</strong>
                <span className="tst-sent">{TESTER_EMOJI[kind]}</span>
                {heard ? <p className="tst-heard"><b>{c.heard}</b> {heard}</p> : null}
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}

/** The floating 🧪 for game pages without their own (root layout). */
const GAME_PATHS = new Set(["play", "world", "catch", "spell", "say", "read", "duel", "practice", "exercises", "homework", "sets", "notebook", "kids"]);
const LANG_SEG = /^[a-z]{2,3}(-[A-Z]{2})?$/;

export function TesterFab() {
  const { tester } = useAuth();
  const pathname = usePathname() ?? "";
  const inlineCount = useSyncExternalStore(subscribe, () => inline, () => 0);
  if (!tester || inlineCount > 0) return null;
  const segs = pathname.split("/").filter(Boolean);
  const first = segs.length && LANG_SEG.test(segs[0]) && !GAME_PATHS.has(segs[0]) ? segs[1] : segs[0];
  if (!first || !GAME_PATHS.has(first)) return null;
  const lang = segs.length && LANG_SEG.test(segs[0]) && !GAME_PATHS.has(segs[0]) ? segs[0] : "";
  // My monthly pay sits right above the 🧪, not among the games (Gadi 2026-11-02)
  return (
    <>
      <a className="tst-fab is-pay" href={`${lang ? `/${lang}` : ""}/tester`} aria-label={lang === "he" ? "התשלום החודשי שלי" : "My monthly pay"} title={lang === "he" ? "התשלום החודשי שלי" : "My monthly pay"}>💰</a>
      <TesterButton game={first} floating />
    </>
  );
}

const CSS = `
.tst-btn{width:44px;height:44px;flex:0 0 44px;border-radius:50%;border:0;background:#fffe;box-shadow:0 2px 8px #0002;font-size:20px;display:grid;place-items:center;cursor:pointer}
.tst-fab{position:fixed;z-index:95;inset-inline-start:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 84px);width:46px;height:46px;border-radius:50%;border:2px solid #c4b5fd;background:#f5f3ff;box-shadow:0 4px 14px #0003;font-size:21px;display:grid;place-items:center;cursor:pointer}
.tst-fab.is-pay{bottom:calc(env(safe-area-inset-bottom,0px) + 140px);text-decoration:none;border-color:#fcd34d;background:#fffbeb}
.tst-wrap{position:fixed;inset:0;z-index:100;background:#0008;display:grid;place-items:center;padding:16px}
.tst-card{width:min(420px,100%);background:#fff;color:#14202b;border-radius:26px;padding:18px 16px;display:grid;gap:12px;justify-items:center;text-align:center;box-shadow:0 18px 50px #0006;font-family:inherit}
.tst-badge{background:#ede9fe;color:#5b21b6;border-radius:999px;padding:4px 12px;font-weight:800;font-size:13px}
.tst-title{font-size:20px;line-height:1.35}
.tst-mic-big{width:100%;border:0;border-radius:18px;background:#7c3aed;color:#fff;font:inherit;font-weight:800;font-size:19px;padding:14px;cursor:pointer;box-shadow:0 4px 0 #5b21b6}
.tst-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;width:100%}
.tst-kind{display:grid;justify-items:center;gap:4px;padding:12px 4px;border:2px solid #e5e7eb;border-radius:18px;background:#f9fafb;font:inherit;font-weight:800;font-size:14px;color:#14202b;cursor:pointer}
.tst-kind:active,.tst-rec:active,.tst-mic-big:active{transform:scale(.96)}
.tst-emoji{font-size:30px;line-height:1}
.tst-emoji.is-big{font-size:48px}
.tst-rec{min-width:220px;border:0;border-radius:999px;background:#dc2626;color:#fff;font:inherit;font-weight:800;font-size:20px;padding:16px 26px;cursor:pointer;box-shadow:0 4px 0 #991b1b;display:inline-flex;align-items:center;justify-content:center;gap:10px}
.tst-rec.is-on{background:#111827;box-shadow:0 4px 0 #000}
.tst-dot{width:14px;height:14px;border-radius:50%;background:#ef4444;animation:tst-blink 1s infinite}
.tst-nomic{margin:0;color:#b45309;font-size:14px}
.tst-heard{margin:0;background:#f5f3ff;border-radius:14px;padding:10px 14px;font-size:16px;line-height:1.5}
.tst-sent{font-size:54px;animation:tst-pop .4s}
.tst-pay{color:#4338ca;font-weight:800;text-decoration:none;background:#eef2ff;border-radius:999px;padding:8px 16px}
.tst-close{border:0;background:none;color:#5f6b73;font:inherit;font-weight:700;text-decoration:underline;cursor:pointer}
@keyframes tst-pop{from{transform:scale(.4)}to{transform:scale(1)}}
@keyframes tst-blink{50%{opacity:.25}}
`;
