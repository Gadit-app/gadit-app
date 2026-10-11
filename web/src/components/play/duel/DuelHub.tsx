"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { buildQuizQuestions, type PlayWord } from "@/lib/play-engine";
import { DUEL_ROUNDS, topicQuestions, type DuelQuestion } from "@/lib/duel";
import { duelCopy } from "./duel-i18n";
import { DUEL_CSS } from "./duel-css";
import { DuelGame } from "./DuelGame";
import { DuelLocal } from "./DuelLocal";
import { DuelStats } from "./DuelStats";

/**
 * Word Duel hub on /play (Gadi 2026-10-11): play on one device, invite with
 * a code, join with a code, be matched with someone online now (Hebrew, kids
 * only with the parent's permission), or play Word Bot.
 */
type Mode = "local" | "invite" | "online" | "bot";
type Screen =
  | { kind: "menu" }
  | { kind: "source"; mode: Mode }
  | { kind: "join" }
  | { kind: "local"; questions: DuelQuestion[] }
  | { kind: "searching"; ticket: string | null; since: number }
  | { kind: "nobody" }
  | { kind: "game"; code: string; again?: () => void };

export function DuelHub({ pool, lang, dir, onExit, initialCode, preset }: {
  pool: PlayWord[];
  lang: string;
  dir: "rtl" | "ltr";
  onExit: () => void;
  initialCode?: string;
  /** Opened from a game card: that game's questions (Gadi 2026-10-11). */
  preset?: { title: string; questions: DuelQuestion[] };
}) {
  const { user } = useAuth();
  const t = duelCopy(lang);
  const [screen, setScreen] = useState<Screen>(initialCode ? { kind: "game", code: initialCode } : { kind: "menu" });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState("");
  const searchRef = useRef<{ stop: boolean }>({ stop: false });
  const bucketRef = useRef("");
  const canTopics = lang === "he" || lang === "en";

  const ownQuestions = (): DuelQuestion[] | null => {
    if (pool.length < 4) return null;
    const qs = buildQuizQuestions(pool, DUEL_ROUNDS).map((q) => ({ prompt: q.prompt, options: q.options, correctIdx: q.correctIdx }));
    return qs.length >= 3 ? qs : null;
  };

  const api = async (body: object) => {
    if (!user) throw new Error("login");
    const r = await fetch("/api/duel", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` },
      body: JSON.stringify({ lang, ...body }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(String(j.error ?? r.status));
    return j as Record<string, unknown>;
  };

  const errText = (e: unknown) => {
    const m = e instanceof Error ? e.message : "";
    return m === "not_found" ? t.errNotFound : m === "full" ? t.errFull : m === "expired" ? t.errExpired
      : m === "plan_required" ? t.errPlan : m === "parent_permission" ? t.parentNeeded : m === "lang_unsupported" ? t.onlineHeOnly : t.errGeneric;
  };

  const startWith = async (mode: Mode, source: "own" | "topic" | "preset") => {
    setMsg("");
    const questions = source === "preset" ? preset?.questions ?? null : source === "own" ? ownQuestions() : topicQuestions();
    if (!questions) { setMsg(t.notEnough); return; }
    if (mode === "local") { setScreen({ kind: "local", questions }); return; }
    setBusy(true);
    try {
      if (mode === "invite") {
        const j = await api({ action: "create", ...(source === "topic" ? { topic: "all" } : { questions }) });
        setScreen({ kind: "game", code: String(j.code) });
      } else {
        const j = await api({ action: "ghost", bot: true, questions });
        setScreen({ kind: "game", code: String(j.code), again: () => void startWith("bot", source) });
      }
    } catch (e) { setMsg(errText(e)); } finally { setBusy(false); }
  };

  const playGhost = async (bot: boolean) => {
    setBusy(true); setMsg("");
    try {
      const j = await api({ action: "ghost", bot });
      setScreen({ kind: "game", code: String(j.code), again: () => void playGhost(bot) });
    } catch (e) { setMsg(errText(e)); setScreen({ kind: "menu" }); } finally { setBusy(false); }
  };

  // Match with someone online: queue, then poll every 1.5s for half a minute.
  const searchOnline = async () => {
    setMsg("");
    searchRef.current = { stop: false };
    const run = searchRef.current;
    let ticket: string | null = null;
    let bucket = "";
    try {
      const j = await api({ action: "queue" });
      if (j.code) { setScreen({ kind: "game", code: String(j.code), again: () => void searchOnline() }); return; }
      ticket = String(j.ticket ?? "");
      bucket = String(j.bucket ?? "");
      bucketRef.current = bucket;
      const since = Date.now();
      setScreen({ kind: "searching", ticket, since });
      while (!run.stop && Date.now() - since < 30_000) {
        await new Promise((r) => setTimeout(r, 1500));
        if (run.stop) return;
        const p = await api({ action: "poll", ticket, bucket });
        if (p.code) { setScreen({ kind: "game", code: String(p.code), again: () => void searchOnline() }); return; }
        if (p.gone) { const q = await api({ action: "queue" }); if (q.code) { setScreen({ kind: "game", code: String(q.code), again: () => void searchOnline() }); return; } ticket = String(q.ticket ?? ticket); bucket = String(q.bucket ?? bucket); bucketRef.current = bucket; }
      }
      if (!run.stop) { await api({ action: "cancel", ticket, bucket }).catch(() => null); setScreen({ kind: "nobody" }); }
    } catch (e) {
      setMsg(errText(e));
      setScreen({ kind: "menu" });
    }
  };

  const stopSearch = (ticket: string | null) => {
    searchRef.current.stop = true;
    if (ticket) void api({ action: "cancel", ticket, bucket: bucketRef.current }).catch(() => null);
    setScreen({ kind: "menu" });
  };

  useEffect(() => () => { searchRef.current.stop = true; }, []);

  const joinWith = async () => {
    const c = code.replace(/\D/g, "");
    if (c.length !== 6) { setMsg(t.errNotFound); return; }
    setBusy(true); setMsg("");
    try {
      await api({ action: "join", code: c });
      setScreen({ kind: "game", code: c });
    } catch (e) { setMsg(errText(e)); } finally { setBusy(false); }
  };

  if (screen.kind === "game") {
    return <DuelGame code={screen.code} lang={lang} dir={dir} onExit={() => setScreen({ kind: "menu" })} onAgain={screen.again} />;
  }
  if (screen.kind === "local") {
    return <DuelLocal questions={screen.questions} lang={lang} dir={dir} onExit={() => setScreen({ kind: "menu" })} />;
  }

  return (
    <div className="duel" dir={dir}>
      <style>{DUEL_CSS}</style>
      <div className="duel-top">
        <button type="button" className="duel-link" onClick={screen.kind === "menu" ? onExit : () => { setMsg(""); setScreen({ kind: "menu" }); }}>{t.back}</button>
        <span className="duel-title">{t.title}</span>
      </div>

      {screen.kind === "menu" && preset && (
        <div className="duel-card">
          <h2 className="duel-h">{preset.title}</h2>
          <p className="duel-sub">{t.hubSub}</p>
          <div className="duel-modes">
            <ModeCard icon="📱" title={t.optLocal} desc={t.optLocalDesc} disabled={busy} onClick={() => void startWith("local", "preset")} />
            <ModeCard icon="✉️" title={t.optInvite} desc={t.optInviteDesc} disabled={busy} onClick={() => void startWith("invite", "preset")} />
            <ModeCard icon="🤖" title={t.optBot} desc={t.optBotDesc} disabled={busy} onClick={() => void startWith("bot", "preset")} />
          </div>
          {busy && <p className="duel-wait">{t.creating}</p>}
          {msg && <p className="duel-note">{msg}</p>}
        </div>
      )}

      {screen.kind === "menu" && !preset && (
        <div className="duel-card">
          <p className="duel-sub">{t.hubSub}</p>
          <div className="duel-modes">
            <ModeCard icon="📱" title={t.optLocal} desc={t.optLocalDesc} onClick={() => setScreen({ kind: "source", mode: "local" })} />
            <ModeCard icon="✉️" title={t.optInvite} desc={t.optInviteDesc} onClick={() => setScreen({ kind: "source", mode: "invite" })} />
            <ModeCard icon="🔢" title={t.optJoin} desc={t.optJoinDesc} onClick={() => setScreen({ kind: "join" })} />
            {lang === "he" && <ModeCard icon="🌍" title={t.optOnline} desc={t.optOnlineDesc} onClick={() => void searchOnline()} />}
            <ModeCard icon="🤖" title={t.optBot} desc={t.optBotDesc} onClick={() => (lang === "he" ? void playGhost(true) : setScreen({ kind: "source", mode: "bot" }))} />
          </div>
          {msg && <p className="duel-note">{msg}</p>}
        </div>
      )}
      {screen.kind === "menu" && !preset && <DuelStats lang={lang} />}

      {screen.kind === "source" && (
        <div className="duel-card">
          <h2 className="duel-h">{t.sourceTitle}</h2>
          <div className="duel-modes">
            <ModeCard icon="📒" title={t.srcOwn} desc={t.srcOwnDesc} disabled={busy} onClick={() => void startWith(screen.mode, "own")} />
            {canTopics && <ModeCard icon="🎨" title={t.srcTopic} desc={t.srcTopicDesc} disabled={busy} onClick={() => void startWith(screen.mode, "topic")} />}
          </div>
          {busy && <p className="duel-wait">{t.creating}</p>}
          {msg && <p className="duel-note">{msg}</p>}
        </div>
      )}

      {screen.kind === "join" && (
        <div className="duel-card">
          <h2 className="duel-h">{t.optJoin}</h2>
          <input id="duel-join-code" className="duel-input" dir="ltr" inputMode="numeric" autoComplete="off" maxLength={6}
            placeholder={t.codePlaceholder} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            onKeyDown={(e) => { if (e.key === "Enter") void joinWith(); }} />
          <div className="duel-row">
            <button type="button" className="duel-btn" disabled={busy || code.length !== 6} onClick={() => void joinWith()}>{t.joinBtn}</button>
          </div>
          {msg && <p className="duel-note">{msg}</p>}
        </div>
      )}

      {screen.kind === "searching" && (
        <div className="duel-card">
          <h2 className="duel-h">{t.searching}</h2>
          <p className="duel-sub">{t.searchingSub}</p>
          <div className="duel-count" aria-hidden="true">🌍</div>
          <div className="duel-row"><button type="button" className="duel-btn is-soft" onClick={() => stopSearch(screen.ticket)}>{t.cancel}</button></div>
        </div>
      )}

      {screen.kind === "nobody" && (
        <div className="duel-card">
          <h2 className="duel-h">{t.nobody}</h2>
          <div className="duel-row">
            <button type="button" className="duel-btn" disabled={busy} onClick={() => void playGhost(false)}>{t.playRecorded}</button>
            <button type="button" className="duel-btn is-soft" disabled={busy} onClick={() => void playGhost(true)}>{t.playBot}</button>
          </div>
          {msg && <p className="duel-note">{msg}</p>}
        </div>
      )}
    </div>
  );
}

function ModeCard({ icon, title, desc, onClick, disabled }: { icon: string; title: string; desc: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" className="duel-mode" onClick={onClick} disabled={disabled}>
      <span className="duel-mode-icon" aria-hidden="true">{icon}</span>
      <b>{title}</b>
      <span>{desc}</span>
    </button>
  );
}
