"use client";

import { DuelPrompt, duelOpt } from "./DuelPrompt";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { avatarUrl } from "@/lib/family";
import { ROUND_MS, type DuelPlayerPublic, type DuelView, type Seat } from "@/lib/duel";
import { duelCopy } from "./duel-i18n";
import { DUEL_CSS } from "./duel-css";

/**
 * One online Word Duel (invite, online match, recorded game or Word Bot).
 * The server owns the clock: we poll the room, keep the offset between our
 * clock and the server's, and only draw timers from it.
 */
export function DuelGame({ code: firstCode, lang, dir, onExit, onAgain }: {
  code: string;
  lang: string;
  dir: "rtl" | "ltr";
  onExit: () => void;
  onAgain?: () => void;
}) {
  const { user } = useAuth();
  const t = duelCopy(lang);
  const [view, setView] = useState<DuelView | null>(null);
  const [error, setError] = useState("");
  const [picked, setPicked] = useState<{ round: number; choice: number } | null>(null);
  const [, setTick] = useState(0);
  const offset = useRef(0);
  const [copied, setCopied] = useState(false);
  // "Play again" moves this screen to the next room with the same opponent.
  const [code, setCode] = useState(firstCode);
  const [asking, setAsking] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const r = await fetch(`/api/duel?code=${encodeURIComponent(code)}`, { headers: { Authorization: `Bearer ${await user.getIdToken()}` }, cache: "no-store" });
      const j = await r.json();
      if (!r.ok) { setError(j.error === "expired" ? t.errExpired : j.error === "not_found" ? t.errNotFound : t.errGeneric); return; }
      if ("phase" in j) {
        offset.current = (j as DuelView).serverNow - Date.now();
        setView(j as DuelView);
      }
    } catch { /* the next poll retries */ }
  }, [user, code, t]);

  // Poll the room: fast while playing, slower while waiting for a player.
  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    const loop = async () => {
      await load();
      if (!alive) return;
      // After the game: slower, to see whether the other player wants a rematch.
      const k = view?.phase.kind;
      timer = setTimeout(loop, k === "done" ? 2500 : k === "waiting" ? 1500 : 700);
    };
    void loop();
    return () => { alive = false; clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, view?.phase.kind]);

  // Redraw timers ten times a second.
  useEffect(() => {
    const i = setInterval(() => setTick((n) => n + 1), 100);
    return () => clearInterval(i);
  }, []);

  const answer = async (round: number, choice: number) => {
    if (!user || picked?.round === round) return;
    setPicked({ round, choice });
    try {
      await fetch("/api/duel", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` },
        body: JSON.stringify({ action: "answer", code, round, choice }),
      });
    } catch { /* the reveal shows what the server took */ }
    void load();
  };

  const rematch = async () => {
    if (!user || asking) return;
    setAsking(true);
    try {
      const r = await fetch("/api/duel", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` },
        body: JSON.stringify({ action: "rematch", code }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.code) { setView(null); setPicked(null); setCode(String(j.code)); }
    } finally { setAsking(false); }
  };

  if (error) {
    return (
      <div className="duel" dir={dir}>
        <style>{DUEL_CSS}</style>
        <div className="duel-card"><p className="duel-msg">{error}</p>
          <button type="button" className="duel-btn" onClick={onExit}>{t.backToGames}</button></div>
      </div>
    );
  }
  if (!view) return <div className="duel" dir={dir}><style>{DUEL_CSS}</style><p className="duel-msg">…</p></div>;

  const now = Date.now() + offset.current;
  const me: Seat = view.you;
  const other: Seat = me === "a" ? "b" : "a";
  const meP = view.players[me] ?? view.players.a;
  const otherP = view.players[other];
  const ph = view.phase;
  const link = typeof window !== "undefined" ? `${window.location.origin}${lang === "en" ? "" : `/${lang}`}/duel/${view.code}` : "";

  const board = (
    <div className="duel-board">
      <PlayerChip p={meP} label={t.you} score={view.scores[me]} mine t={t} />
      <span className="duel-vs">VS</span>
      {otherP ? <PlayerChip p={otherP} label={otherP.name} score={view.scores[other]} t={t}
        status={ph.kind === "round" ? (view.answered[other] ? t.opponentAnswered : t.opponentThinking) : undefined} />
        : <div className="duel-chip is-empty">?</div>}
    </div>
  );

  return (
    <div className="duel" dir={dir}>
      <style>{DUEL_CSS}</style>
      <div className="duel-top">
        <button type="button" className="duel-link" onClick={onExit}>{t.back}</button>
        <span className="duel-title">{t.title}</span>
      </div>

      {ph.kind === "waiting" && view.rematchOf && (
        <div className="duel-card">
          {board}
          <p className="duel-wait">{t.rematchWaiting(otherP?.name ?? "")}</p>
          <div className="duel-row"><button type="button" className="duel-btn is-soft" onClick={onExit}>{t.backToGames}</button></div>
        </div>
      )}

      {ph.kind === "waiting" && !view.rematchOf && (
        <div className="duel-card">
          <h2 className="duel-h">{t.shareTitle}</h2>
          <div className="duel-code" dir="ltr">{view.code}</div>
          <p className="duel-sub">{t.shareHint}</p>
          <div className="duel-row">
            <button type="button" className="duel-btn" onClick={async () => {
              try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* the link is on screen */ }
            }}>{copied ? t.copied : t.copyLink}</button>
            <a className="duel-btn is-soft" href={`https://wa.me/?text=${encodeURIComponent(t.shareText(view.code, link))}`} target="_blank" rel="noreferrer">{t.shareWhatsapp}</a>
          </div>
          <p className="duel-wait">{t.waitingOpponent}</p>
        </div>
      )}

      {ph.kind === "countdown" && (
        <div className="duel-card">
          {board}
          {view.mode === "ghost" && otherP?.kind === "ghost" && <p className="duel-sub">{t.recordedNote}</p>}
          <p className="duel-sub">{t.startsIn}</p>
          <div className="duel-count">{Math.max(1, Math.ceil((ph.until - now) / 1000))}</div>
        </div>
      )}

      {(ph.kind === "round" || ph.kind === "reveal") && view.question && (
        <div className="duel-card">
          {board}
          <div className="duel-progress">{t.round(ph.round + 1, view.total)}</div>
          {ph.kind === "round" && (
            <div className="duel-timer"><span style={{ width: `${Math.max(0, Math.min(100, ((ph.endsAt - now) / ROUND_MS) * 100))}%` }} /></div>
          )}
          <DuelPrompt prompt={view.question.prompt} options={view.question.options} />
          <div className="duel-options">
            {view.question.options.map((o, i) => {
              const mine = picked?.round === ph.round ? picked.choice : null;
              let cls = "duel-opt";
              if (ph.kind === "reveal" && view.reveal) {
                if (i === view.reveal.correctIdx) cls += " is-right";
                else if (view.reveal[me].choice === i) cls += " is-wrong";
              } else if (mine === i) cls += " is-picked";
              const theirs = ph.kind === "reveal" && view.reveal?.[other].choice === i;
              return (
                <button key={i} type="button" className={cls} dir="auto"
                  disabled={ph.kind !== "round" || mine != null}
                  onClick={() => ph.kind === "round" && void answer(ph.round, i)}>
                  <span>{duelOpt(o)}</span>
                  {theirs && otherP && <span className="duel-their" aria-label={otherP.name}><Face p={otherP} /></span>}
                </button>
              );
            })}
          </div>
          {ph.kind === "round" && picked?.round === ph.round && <p className="duel-wait">{t.waitingForThem}</p>}
          {ph.kind === "reveal" && view.reveal && (
            <p className={`duel-result ${view.reveal[me].points > 0 ? "is-good" : "is-bad"}`}>
              {view.reveal[me].choice == null ? t.noAnswer : view.reveal[me].points > 0 ? `${t.correct} +${view.reveal[me].points}` : t.wrong}
            </p>
          )}
        </div>
      )}

      {ph.kind === "done" && otherP && (() => {
        const outcome = view.scores[me] > view.scores[other] ? "win" : view.scores[me] < view.scores[other] ? "lose" : "tie";
        const rights = (s: Seat) => (view.recap ?? []).filter((r) => r[s] === r.correctIdx).length;
        const mark = (r: NonNullable<DuelView["recap"]>[number], s: Seat) => {
          const choice = r[s];
          const text = s === "a" ? r.aText : r.bText;
          const pts = s === "a" ? r.aPoints : r.bPoints;
          if (choice == null) return <span className="duel-mark is-none" title={t.noAnswer}>⏱</span>;
          if (choice === r.correctIdx) return <span className="duel-mark is-good">✓{pts ? <small>+{pts}</small> : null}</span>;
          return <span className="duel-mark is-bad">✗{text ? <small><bdi>{text}</bdi></small> : null}</span>;
        };
        return (
        <div className="duel-card duel-end">
          <div className={`duel-end-banner is-${outcome}`}>
            <span className="duel-end-emoji" aria-hidden="true">{outcome === "win" ? "🏆" : outcome === "lose" ? "💪" : "🤝"}</span>
            <h2 className="duel-h duel-final">{outcome === "win" ? t.win : outcome === "lose" ? t.lose(otherP.name) : t.tie}</h2>
          </div>
          <div className="duel-end-scores">
            {([me, other] as Seat[]).map((s) => {
              const p = view.players[s] ?? meP;
              const lead = view.scores[s] > view.scores[s === "a" ? "b" : "a"];
              return (
                <div key={s} className={`duel-end-player${s === me ? " is-me" : ""}${lead ? " is-lead" : ""}`}>
                  <Face p={p} />
                  <span className="duel-end-name" dir="auto">{s === me ? t.you : p.name}</span>
                  <span className="duel-end-score">{view.scores[s]}</span>
                  <span className="duel-end-right">{t.correctCount(rights(s), view.total)}</span>
                </div>
              );
            })}
          </div>
          {view.recap && (
            <div className="duel-rtable-wrap">
              <table className="duel-rtable">
                <caption>{t.recapTitle}</caption>
                <thead>
                  <tr><th scope="col">{t.colWord}</th><th scope="col">{t.colAnswer}</th><th scope="col">{t.you}</th><th scope="col"><bdi>{otherP.name}</bdi></th></tr>
                </thead>
                <tbody>
                  {view.recap.map((r, i) => (
                    <tr key={i}>
                      <td className="duel-rt-word"><bdi>{r.prompt}</bdi></td>
                      <td><bdi>{r.answer}</bdi></td>
                      <td>{mark(r, me)}</td>
                      <td>{mark(r, other)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {otherP.kind === "person" && view.rematch && !view.rematch.mine && (
            <p className="duel-note">{t.rematchAsked(otherP.name)}</p>
          )}
          <div className="duel-row">
            {otherP.kind === "person"
              ? <button type="button" className="duel-btn" disabled={asking} onClick={() => void rematch()}>
                  {view.rematch && !view.rematch.mine ? t.rematchYes : t.rematchBtn(otherP.name)}
                </button>
              : onAgain && <button type="button" className="duel-btn" onClick={onAgain}>{t.playAgain}</button>}
            <button type="button" className="duel-btn is-soft" onClick={onExit}>{t.backToGames}</button>
          </div>
        </div>
        );
      })()}
    </div>
  );
}

function Face({ p }: { p: DuelPlayerPublic }) {
  const src = avatarUrl(p.avatar);
  // eslint-disable-next-line @next/next/no-img-element
  if (src) return <img src={src} alt="" className="duel-face" />;
  const glyph = p.kind === "bot" ? "🤖" : p.kind === "ghost" ? "⏱️" : (p.name.trim()[0] ?? "?").toUpperCase();
  return <span className="duel-face is-glyph">{glyph}</span>;
}

function PlayerChip({ p, label, score, mine, status, t }: {
  p: DuelPlayerPublic; label: string; score: number; mine?: boolean; status?: string; t: ReturnType<typeof duelCopy>;
}) {
  return (
    <div className={`duel-chip${mine ? " is-me" : ""}`}>
      <Face p={p} />
      <div className="duel-chip-text">
        <span className="duel-chip-name" dir="auto">{label}</span>
        {p.kind !== "person" && <span className="duel-tag">{p.kind === "bot" ? t.tagBot : t.tagRecorded}</span>}
        {status && <span className="duel-chip-status">{status}</span>}
      </div>
      <span className="duel-score">{score}</span>
    </div>
  );
}
