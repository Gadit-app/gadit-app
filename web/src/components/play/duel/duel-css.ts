/** Styles for Word Duel screens (hub, online game, same-device game).
 *  Every color comes from the --d-* tokens below, which follow the page
 *  theme: the kid skin or the adult dark mode (Gadi 2026-10-11: on a dark
 *  skin the hub, the wins table and the code were light text on white). */
export const DUEL_CSS = `
.duel {
  --d-surface: var(--surface, #fff); --d-ink: var(--ink, #14201f); --d-soft: var(--ink-soft, #55625f); --d-muted: var(--ink-muted, #6F7C79);
  --d-line: rgba(15,111,108,0.18); --d-line-2: rgba(15,111,108,0.28); --d-line-soft: rgba(15,111,108,0.08);
  --d-strong: #0F6F6C; --d-btn: #0F6F6C; --d-on-btn: #fff; --d-tint: rgba(14,165,165,0.12); --d-panel: #F4F8F7;
  --d-good: #15803D; --d-good-bg: #DCFCE7; --d-good-line: #16A34A; --d-bad: #B91C1C; --d-bad-bg: #FEE2E2; --d-bad-line: #DC2626;
  --d-warm: #8A5A00; --d-warm-bg: #FFF7E6; --d-vs: #B45309; --d-gold: #E3B341;
  --d-win: #FFF6DA; --d-lose: #EAF4FF; --d-tie: #EEF7F5; --d-pass: #E6F6F4; --d-shadow: 0 6px 24px rgba(15,60,58,0.06);
}
html[data-theme="dark"] .duel, html:is([data-theme="space"],[data-theme="ocean"],[data-theme="jungle"],[data-theme="neon"],[data-theme="sunset"],[data-theme="aurora"],[data-theme="cosmos"],[data-theme="lava"],[data-theme="royal"]) .wb-kid-area .duel {
  --d-line: rgba(255,255,255,0.14); --d-line-2: rgba(255,255,255,0.26); --d-line-soft: rgba(255,255,255,0.07);
  --d-strong: var(--accent, #2DD4BF); --d-btn: var(--accent, #2DD4BF); --d-on-btn: var(--accent-ink, #04241F); --d-tint: rgba(255,255,255,0.09); --d-panel: rgba(255,255,255,0.06);
  --d-good: #4ADE80; --d-good-bg: rgba(34,197,94,0.20); --d-good-line: #22C55E; --d-bad: #FCA5A5; --d-bad-bg: rgba(239,68,68,0.20); --d-bad-line: #F87171;
  --d-warm: #FCD34D; --d-warm-bg: rgba(251,191,36,0.14); --d-vs: #FBBF24; --d-gold: #FBBF24;
  --d-win: rgba(251,191,36,0.18); --d-lose: rgba(96,165,250,0.16); --d-tie: rgba(45,212,191,0.14); --d-pass: rgba(255,255,255,0.07); --d-shadow: 0 6px 24px rgba(0,0,0,0.28);
  color-scheme: dark;
}
.duel { max-width: 720px; margin: 0 auto; padding: 16px 16px 48px; font-family: var(--wb-sans, system-ui, sans-serif); color: var(--d-ink); }
.duel-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
.duel-title { font-family: var(--wb-font-display, inherit); font-weight: 800; font-size: 20px; }
.duel-link { background: none; border: 0; padding: 6px 2px; font: inherit; font-weight: 700; color: var(--d-strong); cursor: pointer; }
.duel-card { background: var(--d-surface); border: 1px solid var(--d-line); border-radius: 22px; padding: 22px 20px; display: grid; gap: 14px; box-shadow: var(--d-shadow); }
.duel-h { margin: 0; font-size: 22px; font-weight: 800; text-align: center; text-wrap: balance; }
.duel-final { font-size: 28px; color: var(--d-strong); }
.duel-sub { margin: 0; text-align: center; color: var(--d-soft); font-size: 15px; line-height: 1.55; }
.duel-msg { text-align: center; color: var(--d-soft); }
.duel-wait { margin: 0; text-align: center; color: var(--d-strong); font-weight: 700; animation: duelPulse 1.4s ease-in-out infinite; }
@keyframes duelPulse { 50% { opacity: 0.45; } }
@media (prefers-reduced-motion: reduce) { .duel-wait { animation: none; } }
.duel-row { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
.duel-btn { display: inline-flex; align-items: center; justify-content: center; min-height: 46px; padding: 0 22px; border-radius: 999px; border: 0; background: var(--d-btn); color: var(--d-on-btn); font: inherit; font-weight: 800; font-size: 16px; cursor: pointer; text-decoration: none; }
.duel-btn.is-soft { background: var(--d-tint); color: var(--d-strong); }
.duel-btn:disabled { opacity: 0.5; cursor: default; }
.duel-btn:focus-visible, .duel-opt:focus-visible, .duel-mode:focus-visible { outline: 3px solid var(--d-strong); outline-offset: 2px; }
.duel-code { font-size: 44px; font-weight: 800; letter-spacing: 0.18em; text-align: center; color: var(--d-strong); font-variant-numeric: tabular-nums; }
.duel-count { font-size: 72px; font-weight: 800; text-align: center; color: var(--d-strong); font-variant-numeric: tabular-nums; line-height: 1; }
.duel-board { display: grid; grid-template-columns: minmax(0,1fr) auto minmax(0,1fr); gap: 10px; align-items: center; }
.duel-vs { font-weight: 900; color: var(--d-vs); font-size: 15px; }
.duel-chip { display: flex; align-items: center; gap: 10px; background: var(--d-panel); border-radius: 16px; padding: 8px 10px; min-width: 0; }
.duel-chip.is-me { background: var(--d-tint); }
.duel-chip.is-empty { justify-content: center; color: var(--d-muted); font-size: 22px; font-weight: 800; min-height: 56px; }
.duel-chip-text { display: grid; min-width: 0; flex: 1; }
.duel-chip-name { font-weight: 800; font-size: 15px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.duel-chip-status { font-size: 12.5px; color: var(--d-strong); font-weight: 700; }
.duel-tag { font-size: 11.5px; color: var(--d-warm); font-weight: 700; }
.duel-score { font-size: 22px; font-weight: 900; font-variant-numeric: tabular-nums; color: var(--d-strong); }
.duel-face { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; flex: none; background: #fff; }
.duel-face.is-glyph { display: grid; place-items: center; background: var(--d-btn); color: var(--d-on-btn); font-weight: 800; font-size: 18px; }
.duel-progress { text-align: center; font-size: 13.5px; font-weight: 700; color: var(--d-soft); }
.duel-timer { height: 8px; border-radius: 999px; background: var(--d-tint); overflow: hidden; }
.duel-timer span { display: block; height: 100%; background: linear-gradient(90deg, var(--d-btn), var(--d-strong)); border-radius: 999px; transition: width 100ms linear; }
.duel-prompt { font-size: 30px; font-weight: 800; text-align: center; padding: 10px 0; overflow-wrap: anywhere; white-space: pre-line; line-height: 1.35; }
.duel-prompt.is-long { font-size: 20px; font-weight: 700; }
.duel-options { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
@media (max-width: 520px) { .duel-options { grid-template-columns: 1fr; } .duel-prompt { font-size: 26px; } }
.duel-opt { position: relative; min-height: 64px; padding: 12px 16px; border-radius: 16px; border: 2px solid var(--d-line); background: var(--d-surface); font: inherit; font-size: 17px; font-weight: 700; color: inherit; cursor: pointer; text-align: center; overflow-wrap: anywhere; }
.duel-opt:hover:not(:disabled):not([aria-disabled="true"]) { border-color: var(--d-strong); }
.duel-opt.is-picked { border-color: var(--d-strong); background: var(--d-tint); }
.duel-opt.is-right { border-color: var(--d-good-line); background: var(--d-good-bg); }
.duel-opt.is-wrong { border-color: var(--d-bad-line); background: var(--d-bad-bg); }
.duel-opt:disabled, .duel-opt[aria-disabled="true"] { cursor: default; }
.duel-their { position: absolute; inset-inline-end: 6px; top: 6px; }
.duel-their .duel-face { width: 26px; height: 26px; font-size: 13px; }
.duel-result { margin: 0; text-align: center; font-weight: 800; font-size: 18px; }
.is-good { color: var(--d-good); }
.is-bad { color: var(--d-bad); }
.duel-recap { display: grid; gap: 6px; background: var(--d-panel); border-radius: 16px; padding: 12px 14px; }
.duel-recap-h { font-weight: 800; font-size: 14px; color: var(--d-soft); }
.duel-recap-row { display: grid; grid-template-columns: 20px minmax(0,1fr) minmax(0,1fr); gap: 8px; font-size: 15px; align-items: baseline; }
.duel-recap-row > * { min-width: 0; overflow-wrap: anywhere; }
.duel-modes { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.duel-modes > :last-child:nth-child(odd) { grid-column: 1 / -1; }
@media (max-width: 560px) { .duel-modes { grid-template-columns: 1fr; } }
.duel-mode { display: grid; gap: 4px; text-align: start; padding: 16px; border-radius: 18px; border: 2px solid var(--d-line); background: var(--d-surface); font: inherit; color: inherit; cursor: pointer; }
.duel-mode:hover { border-color: var(--d-strong); }
.duel-mode b { font-size: 17px; }
.duel-mode span { font-size: 14px; color: var(--d-soft); line-height: 1.45; }
.duel-mode .duel-mode-icon { font-size: 26px; }
.duel-note { margin: 0; padding: 10px 14px; border-radius: 14px; background: var(--d-warm-bg); color: var(--d-warm); font-size: 14.5px; font-weight: 600; text-align: center; }
.duel-input { width: 100%; max-width: 260px; margin: 0 auto; display: block; padding: 12px 14px; font: inherit; font-size: 24px; letter-spacing: 0.2em; text-align: center; border-radius: 14px; border: 2px solid var(--d-line-2); background: var(--d-surface); color: var(--d-ink); font-variant-numeric: tabular-nums; }
.duel-names { display: grid; gap: 10px; max-width: 360px; margin: 0 auto; width: 100%; }
.duel-names input { padding: 12px 14px; font: inherit; font-size: 17px; border-radius: 14px; border: 2px solid var(--d-line-2); background: var(--d-surface); color: var(--d-ink); }
.duel-pass { min-height: 260px; display: grid; place-items: center; text-align: center; gap: 10px; cursor: pointer; border: 0; width: 100%; background: linear-gradient(160deg, var(--d-pass), var(--d-surface)); border-radius: 22px; font: inherit; color: inherit; }
.duel-pass b { font-size: 26px; }
.duel-stats { margin-top: 14px; }
.duel-table { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.duel-table li { display: grid; grid-template-columns: 32px 40px minmax(0,1fr) auto; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 14px; background: var(--d-panel); }
.duel-table.is-vs li { grid-template-columns: 40px minmax(0,1fr) auto; }
.duel-table li.is-me { background: var(--d-tint); }
.duel-rank { text-align: center; font-weight: 900; font-size: 18px; font-variant-numeric: tabular-nums; }
.duel-table-name { font-weight: 800; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.duel-table-num { font-size: 13.5px; font-weight: 700; color: var(--d-strong); font-variant-numeric: tabular-nums; white-space: nowrap; }
@media (max-width: 420px) { .duel-table li { grid-template-columns: 28px 36px minmax(0,1fr); } .duel-table.is-vs li { grid-template-columns: 36px minmax(0,1fr); } .duel-table-num { grid-column: 1 / -1; text-align: end; } }
.duel-end { gap: 16px; }
.duel-end-banner { display: grid; justify-items: center; gap: 4px; padding: 14px 12px 6px; border-radius: 18px; }
.duel-end-banner.is-win { background: linear-gradient(160deg, var(--d-win), var(--d-surface)); }
.duel-end-banner.is-lose { background: linear-gradient(160deg, var(--d-lose), var(--d-surface)); }
.duel-end-banner.is-tie { background: linear-gradient(160deg, var(--d-tie), var(--d-surface)); }
.duel-end-emoji { font-size: 44px; line-height: 1; }
.duel-end-scores { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.duel-end-player { display: grid; justify-items: center; gap: 4px; padding: 14px 10px; border-radius: 18px; background: var(--d-panel); border: 2px solid transparent; min-width: 0; }
.duel-end-player.is-me { background: var(--d-tint); }
.duel-end-player.is-lead { border-color: var(--d-gold); }
.duel-end-player .duel-face { width: 52px; height: 52px; font-size: 22px; }
.duel-end-name { font-weight: 800; font-size: 15px; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.duel-end-score { font-size: 34px; font-weight: 900; color: var(--d-strong); font-variant-numeric: tabular-nums; line-height: 1.1; }
.duel-end-right { font-size: 13px; font-weight: 700; color: var(--d-soft); }
.duel-rtable-wrap { overflow-x: auto; border-radius: 16px; border: 1px solid var(--d-line); }
.duel-rtable { width: 100%; border-collapse: collapse; font-size: 15px; }
.duel-rtable caption { caption-side: top; text-align: start; font-weight: 800; font-size: 14px; color: var(--d-soft); padding: 12px 14px 8px; }
.duel-rtable th { text-align: start; font-size: 12.5px; font-weight: 800; color: var(--d-soft); padding: 8px 14px; background: var(--d-panel); border-bottom: 1px solid var(--d-line); white-space: nowrap; }
.duel-rtable td { text-align: start; padding: 10px 14px; border-bottom: 1px solid var(--d-line-soft); vertical-align: middle; }
.duel-rtable tbody tr:nth-child(even) td { background: var(--d-panel); }
.duel-rtable tbody tr:last-child td { border-bottom: 0; }
.duel-rt-word { font-weight: 800; }
.duel-mark { display: inline-flex; align-items: baseline; gap: 6px; font-weight: 900; font-size: 16px; }
.duel-mark small { font-size: 12px; font-weight: 700; }
.duel-mark.is-good { color: var(--d-good); }
.duel-mark.is-bad { color: var(--d-bad); }
.duel-mark.is-bad small { color: var(--d-bad); text-decoration: line-through; text-decoration-color: currentColor; }
.duel-mark.is-none { color: var(--d-muted); }
@media (max-width: 480px) { .duel-rtable { font-size: 14px; } .duel-rtable th, .duel-rtable td { padding: 8px 10px; } .duel-mark small { display: none; } }
.duel-games { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 8px; }
.duel-game { display: flex; align-items: center; gap: 10px; padding: 6px 10px 6px 6px; border-radius: 14px; border: 1.5px solid var(--d-line); background: var(--d-surface); font: inherit; font-size: 14px; font-weight: 700; color: inherit; cursor: pointer; text-align: start; min-width: 0; }
.duel-game:hover { border-color: var(--d-strong); }
.duel-game img { width: 56px; height: 40px; object-fit: cover; border-radius: 9px; flex: none; background: var(--d-panel); }
.duel-game span { min-width: 0; line-height: 1.25; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
`;
