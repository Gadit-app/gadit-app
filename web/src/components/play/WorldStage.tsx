"use client";

/**
 * Every game played inside a word world (Gadi 2026-11-01: "all the games
 * with graphics like the worlds, more colour and life").
 *
 * The stage is full screen over one of the worlds the child has opened (each
 * game has its own, so the games feel different and locked worlds stay a
 * surprise). The games keep their own markup: the shared play classes are
 * re-dressed here, so the question hangs on a parchment sign in a wooden
 * frame, answers are bright chunky buttons, letters are stones, memory
 * cards carry the world on their backs, and the child's avatar stands on
 * the ground and reacts to every right or wrong answer (sfx sends a mood).
 */
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { avatarUrl } from "@/lib/family";
import { WORLDS, WORLD_ORDER, isWorldId, worldArt, wordsToOpen, type WorldId } from "@/lib/world/worlds";

let openWorlds: Promise<WorldId[]> | null = null;

/** The worlds the child has opened (fetched once per visit). */
function loadOpenWorlds(token: Promise<string>): Promise<WorldId[]> {
  if (!openWorlds) {
    openWorlds = (async () => {
      try {
        const r = await fetch("/api/world", { headers: { Authorization: `Bearer ${await token}` } });
        const j = r.ok ? ((await r.json()) as { worlds?: Record<string, { items?: unknown[] }> }) : null;
        const counts: Record<string, number> = {};
        for (const [k, v] of Object.entries(j?.worlds ?? {})) counts[k] = Array.isArray(v.items) ? v.items.length : 0;
        const open = WORLD_ORDER.filter((k) => isWorldId(k) && wordsToOpen(k, counts) === 0) as WorldId[];
        return open.length ? open : ["jungle"];
      } catch { openWorlds = null; return ["jungle"]; }
    })();
  }
  return openWorlds;
}

/** The word-nerd games play in a calm study, not a cartoon world (council
 *  2026-11-01: the game decides the look, never the viewer, so a grown-up or a
 *  teen never meets a candy jungle in an etymology game). */
export const STUDY_ROOMS: Record<string, "library" | "observatory" | "maproom"> = {
  artist: "library", friends: "library", idiom: "library", root: "library",
  time: "observatory", twin: "observatory", lens: "observatory",
  passport: "maproom", shade: "maproom", build: "maproom",
};

const hash = (s: string) => { let h = 7; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };

/** world: a fixed world (previews); otherwise one of the child's open worlds. */
export function WorldStage({ game, children, world }: { game: string; children: React.ReactNode; world?: WorldId }) {
  const { user, avatarId, avatarPhotoUrl } = useAuth();
  const [worldId, setWorldId] = useState<WorldId>("jungle");
  const [mood, setMood] = useState<"idle" | "happy" | "oops">("idle");

  useEffect(() => {
    if (!user) return;
    let alive = true;
    void loadOpenWorlds(user.getIdToken()).then((open) => {
      if (alive) setWorldId(open[hash(game) % open.length]);
    });
    return () => { alive = false; };
  }, [user, game]);

  // Right and wrong answers come from the shared sounds (lib/game-sfx).
  useEffect(() => {
    let tm: ReturnType<typeof setTimeout> | undefined;
    const on = (e: Event) => {
      const m = (e as CustomEvent<"happy" | "oops">).detail;
      setMood("idle");
      requestAnimationFrame(() => setMood(m));
      clearTimeout(tm);
      tm = setTimeout(() => setMood("idle"), 1400);
    };
    window.addEventListener("gadit-mood", on);
    return () => { window.removeEventListener("gadit-mood", on); clearTimeout(tm); };
  }, []);

  // A game with its own world scene (Context Detective) passes no game.
  if (!game) return <>{children}</>;
  const room = world ? undefined : STUDY_ROOMS[game];
  const art = room ? `/play/study/${room}.webp` : worldArt(WORLDS[world ?? worldId], "clearing");
  const av = avatarUrl(avatarId) ?? avatarPhotoUrl ?? null;
  return (
    <div className={`wst${room ? " is-study" : ""}`} style={{ backgroundImage: `url(${art})`, ["--wst-art" as string]: `url(${art})` }}>
      <div className="wst-scroll">{children}</div>
      {!room && (
        <div className={`wst-avatar is-${mood}`} aria-hidden="true">
          {av ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={av} alt="" />
          ) : <span>🙂</span>}
        </div>
      )}
      <style>{WST_CSS}</style>
    </div>
  );
}

/* Scoped under .wordbook .wst so it wins over the plain play styles. */
const S = "html body .wordbook .wst";
const T = "html body .wordbook .wst.is-study";
export const WST_CSS = `
${S} { position: fixed; inset: 0; z-index: 60; background-color: #bfe3d0; background-size: cover; background-position: center; color: #14202b; -webkit-tap-highlight-color: transparent; }
${S}::before { content: ""; position: absolute; inset: 0; background: linear-gradient(#0000 50%, #0003); pointer-events: none; }
${S} .wst-scroll { position: absolute; inset: 0; overflow-y: auto; overscroll-behavior: contain; padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 116px); }
${S} .wb-play-stage { min-height: 0; padding: calc(env(safe-area-inset-top, 0px) + 12px) 16px 24px; gap: 16px; position: relative; }

/* header: round white buttons and pills, like the worlds */
${S} .wb-play-header { gap: 10px; padding: 0; flex-wrap: wrap; }
${S} .wb-play-exit { width: 44px; height: 44px; border: 0; background: #fffe; color: #14202b; box-shadow: 0 2px 8px #0003; }
${S} .wb-play-header-title { flex: 1 1 140px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; background: #fffe; color: #14202b; border-radius: 999px; padding: 9px 16px; font-size: 15px; font-weight: 800; box-shadow: 0 2px 8px #0003; text-align: center; min-width: 0; }
${S} .wb-play-header-meta { margin-inline-start: auto; background: #fffe; color: #14202b; border-radius: 999px; padding: 8px 12px; font-weight: 800; box-shadow: 0 2px 8px #0003; font-size: 14px; }
${S} .wb-play-score { color: #b45309; }
${S} .wb-play-score::before { content: "⭐ "; }
${S} .wb-play-timer { background: #ffd23f; color: #6b4e00; }
${S} .wb-play-timer.is-urgent { background: #ff8787; color: #fff; }

/* the question sits on a frosted glass panel over the world (Gadi 2026-11-01:
   the cream parchment looked old fashioned) */
${S} .wb-play-question { position: relative; background: rgba(255,255,255,.84); -webkit-backdrop-filter: blur(16px) saturate(1.3); backdrop-filter: blur(16px) saturate(1.3); border: 1.5px solid rgba(255,255,255,.95); box-shadow: 0 18px 44px rgba(10,30,40,.30); border-radius: 28px; padding: 24px 18px; color: #14202b; }
${S} .wb-play-question-eyebrow { color: #0a7472; font-weight: 800; letter-spacing: 0.02em; text-transform: none; font-size: 14px; }
${S} .wb-play-prompt, ${S} .wb-play-prompt-word, ${S} .wb-tf-meaning, ${S} .wb-play-sentence { color: #14202b; }
${S} .wb-play-explain { background: #fff; border: 1.5px solid #e3e8ec; color: #14202b; border-radius: 14px; box-shadow: 0 6px 16px #0003; }

/* answers: chunky bright buttons, each its own colour */
${S} .wb-play-options { gap: 12px; }
${S} .wb-play-option { --c: #0a7472; --d: #075452; background: #fff; border: 3px solid var(--c); border-radius: 18px; color: #14202b; font-size: 17px; font-weight: 800; box-shadow: 0 5px 0 var(--d), 0 9px 16px #0003; min-height: 60px; }
${S} .wb-play-option:nth-child(4n+2) { --c: #f08c00; --d: #b86a00; }
${S} .wb-play-option:nth-child(4n+3) { --c: #7048e8; --d: #5332b8; }
${S} .wb-play-option:nth-child(4n+4) { --c: #e64980; --d: #b02d5e; }
${S} .wb-play-option:hover:not(:disabled):not([aria-disabled="true"]) { background: #fff; border-color: var(--c); transform: translateY(-1px); }
${S} .wb-play-option:active:not(:disabled):not([aria-disabled="true"]) { transform: translateY(4px); box-shadow: 0 1px 0 var(--d), 0 3px 8px #0003; }
${S} .wb-play-option.is-correct { background: #2f9e44; border-color: #2f9e44; color: #fff; box-shadow: 0 5px 0 #1f6b2f, 0 9px 16px #0003; }
${S} .wb-play-option.is-wrong { background: #fa5252; border-color: #fa5252; color: #fff; box-shadow: 0 5px 0 #c92a2a, 0 9px 16px #0003; }
${S} .wb-play-option.is-dimmed { opacity: 0.55; }
${S} .wb-tf-btn { font-size: 20px; }

/* main buttons */
${S} .wb-play-next, ${S} .wb-play-cta-primary, ${S} .wb-flash-yes, ${S} .wb-flash-make-btn { background: #0a7472; border: 0; color: #fff; border-radius: 999px; font-size: 18px; font-weight: 800; padding: 13px 30px; box-shadow: 0 4px 0 #075452, 0 8px 16px #0004; }
${S} .wb-play-cta-ghost, ${S} .wb-flash-no { background: #fff; color: #0a7472; border: 0; border-radius: 999px; font-weight: 800; box-shadow: 0 0 0 2px #0a7472 inset, 0 6px 14px #0003; }
${S} .wb-play-cta-duel { box-shadow: 0 6px 14px #0003; }

/* result: on glass too, with a big gold score */
${S} .wb-play-result { margin-top: 10px; background: rgba(255,255,255,.84); -webkit-backdrop-filter: blur(16px) saturate(1.3); backdrop-filter: blur(16px) saturate(1.3); border: 1.5px solid rgba(255,255,255,.95); box-shadow: 0 18px 44px rgba(10,30,40,.30); border-radius: 28px; padding: 28px 18px; min-height: 0; }
${S} .wb-play-result-headline, ${S} .wb-play-result-sub, ${S} .wb-play-result-missed-label, ${S} .wb-play-result-missed-word, ${S} .wb-play-result-missed-mean { color: #14202b; }
${S} .wb-play-result-score-num { color: #e67700; text-shadow: none; }

/* letters (anagram, build a word): stones, like the gate of the worlds */
${S} .wb-play-anagram-tile, ${S} .wb-play-build-pool button { border: 0; border-radius: 18px 14px 20px 13px; background: radial-gradient(120% 90% at 30% 25%, #f4f1ea, #cfc8b8 70%, #a9a190); color: #2b2418; font-weight: 800; box-shadow: 0 5px 0 #7d7565, 0 9px 14px #0005; }
${S} .wb-play-anagram-slot, ${S} .wb-play-build-slot { background: #ffffffcc; border: 2px dashed #9fb3bd; color: #0a7472; border-radius: 14px; }
${S} .wb-play-anagram-tray, ${S} .wb-play-build-pool { background: #0000001f; border-radius: 22px; padding: 12px; }
${S} .wb-play-anagram-hint { background: #fff; border: 1.5px solid #e3e8ec; border-radius: 14px; color: #14202b; }

/* memory: tiles with the world painted on their backs */
${S} .wb-play-memcard-back { background: var(--wst-art) center / cover; border: 4px solid #fff; box-shadow: 0 8px 18px #0004; color: transparent; }
${S} .wb-play-memcard-back::after { content: "?"; position: absolute; inset: 0; display: grid; place-items: center; font-size: 34px; font-weight: 900; color: #fff; text-shadow: 0 2px 6px #0008; background: #0000002a; border-radius: 8px; }
${S} .wb-play-memcard-face { background: #fff; border: 4px solid #f08c00; color: #14202b; font-size: 13px; font-weight: 700; box-shadow: 0 5px 0 #b86a00; }
${S} .wb-play-memcard.is-matched .wb-play-memcard-face, ${S} .wb-play-memcard.is-done .wb-play-memcard-face { border-color: #2f9e44; box-shadow: 0 5px 0 #1f6b2f; background: #e3f7e6; }

/* flash cards: a clean card that turns over */
${S} .wb-flash-front { background: #fff; border: 1.5px solid #fff; box-shadow: 0 18px 44px rgba(10,30,40,.30); }
${S} .wb-flash-back { background: #e6f6f4; border: 1.5px solid #fff; box-shadow: 0 18px 44px rgba(10,30,40,.30); }
${S} .wb-flash-word, ${S} .wb-flash-meaning { color: #14202b; }
${S} .wb-flash-src, ${S} .wb-flash-make { background: #fff; box-shadow: 0 0 0 1.5px #e3e8ec, 0 8px 18px #0003; }
${S} .wb-flash-pick-h { color: #fff; text-shadow: 0 2px 8px #0009; }

/* root rush, shade slider: wooden pieces */
${S} .wb-play-root-tile { --c: #0a7472; --d: #075452; background: #fff; border: 3px solid var(--c); border-radius: 16px; color: #14202b; font-weight: 800; box-shadow: 0 4px 0 var(--d), 0 8px 14px #0003; }
${S} .wb-play-root-tile:nth-child(4n+2) { --c: #f08c00; --d: #b86a00; }
${S} .wb-play-root-tile:nth-child(4n+3) { --c: #7048e8; --d: #5332b8; }
${S} .wb-play-root-tile:nth-child(4n+4) { --c: #e64980; --d: #b02d5e; }
${S} .wb-play-root-tile.is-correct, ${S} .wb-play-root-tile.is-correct-reveal { background: #2f9e44; border-color: #2f9e44; color: #fff; box-shadow: 0 4px 0 #1f6b2f; }
${S} .wb-play-root-tile.is-wrong { background: #fa5252; border-color: #fa5252; color: #fff; box-shadow: 0 4px 0 #c92a2a; }
${S} .wb-play-root-card { background: #fff; border: 3px solid #7048e8; box-shadow: 0 5px 0 #5332b8, 0 9px 14px #0003; color: #14202b; }
${S} .wb-play-shade-slot { background: #ffffffcc; border: 2px dashed #9fb3bd; color: #14202b; }
${S} .wb-play-shade-pool button { background: #fff; border: 3px solid #f08c00; box-shadow: 0 4px 0 #b86a00; color: #14202b; font-weight: 800; }

/* speed: the countdown in big gold */
${S} .wb-play-countdown-num { color: #ffd23f; text-shadow: 0 4px 0 #b86a00, 0 8px 24px #0008; }
${S} .wb-play-countdown-eyebrow { color: #fff; text-shadow: 0 2px 6px #0009; }

/* lessons: the step bar on a white strip so it reads over the world */
${S} .wb-lesson-steps { background: #fffe; border-radius: 999px; padding: 6px 12px; box-shadow: 0 2px 8px #0003; margin: calc(env(safe-area-inset-top, 0px) + 10px) 12px 0; }

/* Word Duel: cards are glass panels, answers are chunky buttons. The --d-*
   tokens are forced light here, because the world (not the kid skin) is behind. */
${S} .duel { --d-surface: #fff; --d-ink: #14202b; --d-soft: #4a5a66; --d-muted: #7a8894; --d-line: #e3e8ec; --d-line-2: #d5dde3; --d-line-soft: #edf1f4;
  --d-strong: #0a7472; --d-btn: #0a7472; --d-on-btn: #fff; --d-tint: #d6f2ee; --d-panel: #f1f5f7; --d-good: #1f6b2f; --d-good-bg: #2f9e44; --d-good-line: #2f9e44;
  --d-bad: #c92a2a; --d-bad-bg: #fa5252; --d-bad-line: #fa5252; --d-warm: #7a4a14; --d-warm-bg: #eef7f6; --d-vs: #e67700; --d-gold: #f59f00;
  --d-win: #ffe8a3; --d-lose: #dbeafe; --d-tie: #d6f2ee; --d-pass: #f1f5f7; --d-shadow: 0 18px 44px rgba(10,30,40,.30); color-scheme: light; color: #14202b;
  padding-top: calc(env(safe-area-inset-top, 0px) + 12px); }
${S} .duel-top { gap: 10px; }
${S} .duel-title { display: inline-flex; align-items: center; gap: 6px; background: #fffe; color: #14202b; border-radius: 999px; padding: 6px 16px 6px 8px; font-size: 17px; box-shadow: 0 2px 8px #0003; min-width: 0; }
${S} .duel-link { background: #fffe; color: #0a7472; border-radius: 999px; padding: 9px 16px; box-shadow: 0 2px 8px #0003; }
${S} .duel-card { background: rgba(255,255,255,.84); -webkit-backdrop-filter: blur(16px) saturate(1.3); backdrop-filter: blur(16px) saturate(1.3); border: 1.5px solid rgba(255,255,255,.95); box-shadow: 0 18px 44px rgba(10,30,40,.30); border-radius: 28px; }
${S} .duel-final, ${S} .duel-code, ${S} .duel-count { color: #e67700; text-shadow: none; }
${S} .duel-btn { box-shadow: 0 4px 0 #075452, 0 8px 16px #0004; font-size: 17px; }
${S} .duel-btn.is-soft { background: #fff; color: #0a7472; box-shadow: 0 0 0 2px #0a7472 inset, 0 6px 14px #0003; }
${S} .duel-mode, ${S} .duel-game { background: #fff; border: 3px solid #0a7472; box-shadow: 0 4px 0 #075452, 0 8px 14px #0003; }
${S} .duel-mode:nth-child(4n+2) { border-color: #f08c00; box-shadow: 0 4px 0 #b86a00, 0 8px 14px #0003; }
${S} .duel-mode:nth-child(4n+3) { border-color: #7048e8; box-shadow: 0 4px 0 #5332b8, 0 8px 14px #0003; }
${S} .duel-mode:nth-child(4n+4) { border-color: #e64980; box-shadow: 0 4px 0 #b02d5e, 0 8px 14px #0003; }
${S} .duel-opt { --c: #0a7472; --d: #075452; background: #fff; border: 3px solid var(--c); border-radius: 18px; color: #14202b; font-weight: 800; box-shadow: 0 5px 0 var(--d), 0 9px 16px #0003; }
${S} .duel-opt:nth-child(4n+2) { --c: #f08c00; --d: #b86a00; }
${S} .duel-opt:nth-child(4n+3) { --c: #7048e8; --d: #5332b8; }
${S} .duel-opt:nth-child(4n+4) { --c: #e64980; --d: #b02d5e; }
${S} .duel-opt:hover:not(:disabled):not([aria-disabled="true"]) { border-color: var(--c); transform: translateY(-1px); }
${S} .duel-opt:active:not(:disabled):not([aria-disabled="true"]) { transform: translateY(4px); box-shadow: 0 1px 0 var(--d), 0 3px 8px #0003; }
${S} .duel-opt.is-picked { background: #eef7f6; }
${S} .duel-opt.is-right { background: #2f9e44; border-color: #2f9e44; color: #fff; box-shadow: 0 5px 0 #1f6b2f, 0 9px 16px #0003; }
${S} .duel-opt.is-wrong { background: #fa5252; border-color: #fa5252; color: #fff; box-shadow: 0 5px 0 #c92a2a, 0 9px 16px #0003; }
${S} .duel-chip, ${S} .duel-end-player { background: #fff; box-shadow: 0 2px 8px rgba(10,30,40,.14); }
${S} .duel-chip.is-me, ${S} .duel-end-player.is-me { background: #d6f2ee; }
@media (max-width: 480px) { ${S} .duel-chip { flex-wrap: wrap; justify-content: center; gap: 4px 8px; padding: 8px; } ${S} .duel-chip .duel-score { flex-basis: 100%; text-align: center; } ${S} .duel-chip .duel-face { width: 32px; height: 32px; font-size: 15px; } }
${S} .duel-pass { background: rgba(255,255,255,.84); -webkit-backdrop-filter: blur(16px) saturate(1.3); backdrop-filter: blur(16px) saturate(1.3); border: 1.5px solid rgba(255,255,255,.95); box-shadow: 0 18px 44px rgba(10,30,40,.30); border-radius: 28px; }
${S} .duel-timer { background: #fff; box-shadow: inset 0 0 0 2px #e3e8ec; height: 12px; }
${S} .duel-timer span { background: linear-gradient(90deg, #ffd23f, #f08c00); }
${S} .duel-input, ${S} .duel-names input { background: #fff; color: #14202b; }
${S} .duel-rtable-wrap { background: #fff; }

/* the avatar stands on the ground and reacts */
${S} .wst-avatar { position: absolute; z-index: 2; inset-inline-start: 14px; bottom: calc(env(safe-area-inset-bottom, 0px) + 14px); width: clamp(64px, 18vw, 92px); aspect-ratio: 1; border-radius: 50%; border: 4px solid #fff; background: #fff; box-shadow: 0 6px 14px #0004; overflow: hidden; display: grid; place-items: center; font-size: 40px; pointer-events: none; }
${S} .wst-avatar img { width: 100%; height: 100%; object-fit: cover; }
${S} .wst-avatar.is-happy { animation: wst-jump .5s ease-out 2; }
${S} .wst-avatar.is-oops { animation: wst-tilt 1s ease-in-out 1; }
@keyframes wst-jump { 0%, 100% { transform: translateY(0); } 40% { transform: translateY(-26px) scale(1.06); } }
@keyframes wst-tilt { 0%, 100% { transform: rotate(0); } 25% { transform: rotate(-10deg); } 60% { transform: rotate(8deg); } }
@media (prefers-reduced-motion: reduce) { ${S} .wst-avatar.is-happy, ${S} .wst-avatar.is-oops { animation: none; } }
/* The study (word-nerd games): quiet ivory cards and plain buttons over a
   calm painted room. Same markup, a grown-up finish. */
${T} { background-color: #2a2420; color: #1f2a30; }
${T}::before { background: linear-gradient(#00000040, #00000080); }
${T} .wst-scroll { padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 32px); }
${T} .wb-play-exit, ${T} .wb-play-header-title, ${T} .wb-play-header-meta { background: #fffdf8f2; color: #1f2a30; box-shadow: 0 1px 4px #0003; }
${T} .wb-play-header-title { font-weight: 700; }
${T} .wb-play-score { color: #0a7472; }
${T} .wb-play-score::before { content: none; }
${T} .wb-play-timer { background: #f3ead7; color: #5a4630; }
${T} .wb-play-timer.is-urgent { background: #c92a2a; color: #fff; }
${T} .wb-play-question, ${T} .wb-play-result { background: #fffdf8; border: 1px solid #e3d9c6; border-radius: 16px; box-shadow: 0 10px 30px #0005; color: #1f2a30; }
${T} .wb-play-question { padding: 22px 20px; }
${T} .wb-play-question::before, ${T} .wb-play-question::after { content: none; }
${T} .wb-play-question-eyebrow { color: #8a6a3a; font-weight: 700; letter-spacing: 0.04em; font-size: 13px; }
${T} .wb-play-prompt, ${T} .wb-play-prompt-word, ${T} .wb-tf-meaning, ${T} .wb-play-sentence,
${T} .wb-play-result-headline, ${T} .wb-play-result-sub, ${T} .wb-play-result-missed-label, ${T} .wb-play-result-missed-word, ${T} .wb-play-result-missed-mean { color: #1f2a30; }
${T} .wb-play-result-score-num { color: #0a7472; text-shadow: none; }
${T} .wb-play-explain, ${T} .wb-play-anagram-hint { background: #fffdf8; border: 1px solid #e3d9c6; border-radius: 12px; color: #1f2a30; box-shadow: 0 6px 18px #0004; }
${T} .wb-play-option, ${T} .wb-play-root-tile, ${T} .wb-play-shade-pool button, ${T} .wb-play-anagram-tile, ${T} .wb-play-build-pool button {
  background: #fffdf8; border: 1px solid #d9cdb6; border-radius: 12px; color: #1f2a30; font-weight: 600; box-shadow: 0 2px 6px #0003; }
${T} .wb-play-option { font-size: 16px; min-height: 54px; }
${T} .wb-play-option:hover:not(:disabled):not([aria-disabled="true"]) { background: #fff; border-color: #0a7472; transform: none; }
${T} .wb-play-option:active:not(:disabled):not([aria-disabled="true"]) { transform: translateY(1px); box-shadow: 0 1px 3px #0003; }
${T} .wb-play-option.is-correct, ${T} .wb-play-root-tile.is-correct, ${T} .wb-play-root-tile.is-correct-reveal { background: #2b8a3e; border-color: #2b8a3e; color: #fff; box-shadow: 0 2px 6px #0003; }
${T} .wb-play-option.is-wrong, ${T} .wb-play-root-tile.is-wrong { background: #c92a2a; border-color: #c92a2a; color: #fff; box-shadow: 0 2px 6px #0003; }
${T} .wb-play-root-card { background: #fffdf8; border: 1px solid #d9cdb6; box-shadow: 0 2px 6px #0003; color: #1f2a30; }
${T} .wb-play-shade-slot, ${T} .wb-play-anagram-slot, ${T} .wb-play-build-slot { background: #fffdf8d9; border: 1px dashed #b8a888; border-radius: 10px; color: #5a4630; }
${T} .wb-play-anagram-tray, ${T} .wb-play-build-pool { background: #0000002e; }
${T} .wb-play-next, ${T} .wb-play-cta-primary { background: #0a7472; border-radius: 12px; font-size: 16px; font-weight: 700; padding: 12px 26px; box-shadow: 0 2px 8px #0004; }
${T} .wb-play-cta-ghost { background: #fffdf8; color: #0a7472; border-radius: 12px; font-weight: 700; box-shadow: 0 0 0 1px #0a7472 inset, 0 2px 8px #0003; }
${T} .wb-play-countdown-num { color: #fffdf8; text-shadow: 0 4px 20px #0008; }
`;
