/** Styles for Word Duel screens (hub, online game, same-device game). */
export const DUEL_CSS = `
.duel { max-width: 720px; margin: 0 auto; padding: 16px 16px 48px; font-family: var(--wb-sans, system-ui, sans-serif); color: var(--wb-ink, #14201f); }
.duel-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
.duel-title { font-family: var(--wb-font-display, inherit); font-weight: 800; font-size: 20px; }
.duel-link { background: none; border: 0; padding: 6px 2px; font: inherit; font-weight: 700; color: #0F6F6C; cursor: pointer; }
.duel-card { background: #fff; border: 1px solid rgba(15,111,108,0.18); border-radius: 22px; padding: 22px 20px; display: grid; gap: 14px; box-shadow: 0 6px 24px rgba(15,60,58,0.06); }
.duel-h { margin: 0; font-size: 22px; font-weight: 800; text-align: center; text-wrap: balance; }
.duel-final { font-size: 28px; color: #0F6F6C; }
.duel-sub { margin: 0; text-align: center; color: var(--wb-ink-soft, #55625f); font-size: 15px; line-height: 1.55; }
.duel-msg { text-align: center; color: var(--wb-ink-soft, #55625f); }
.duel-wait { margin: 0; text-align: center; color: #0F6F6C; font-weight: 700; animation: duelPulse 1.4s ease-in-out infinite; }
@keyframes duelPulse { 50% { opacity: 0.45; } }
@media (prefers-reduced-motion: reduce) { .duel-wait { animation: none; } }
.duel-row { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
.duel-btn { display: inline-flex; align-items: center; justify-content: center; min-height: 46px; padding: 0 22px; border-radius: 999px; border: 0; background: #0F6F6C; color: #fff; font: inherit; font-weight: 800; font-size: 16px; cursor: pointer; text-decoration: none; }
.duel-btn.is-soft { background: rgba(14,165,165,0.12); color: #0F6F6C; }
.duel-btn:disabled { opacity: 0.5; cursor: default; }
.duel-btn:focus-visible, .duel-opt:focus-visible, .duel-mode:focus-visible { outline: 3px solid rgba(14,165,165,0.45); outline-offset: 2px; }
.duel-code { font-size: 44px; font-weight: 800; letter-spacing: 0.18em; text-align: center; color: #0F6F6C; font-variant-numeric: tabular-nums; }
.duel-count { font-size: 72px; font-weight: 800; text-align: center; color: #0F6F6C; font-variant-numeric: tabular-nums; line-height: 1; }
.duel-board { display: grid; grid-template-columns: minmax(0,1fr) auto minmax(0,1fr); gap: 10px; align-items: center; }
.duel-vs { font-weight: 900; color: #B45309; font-size: 15px; }
.duel-chip { display: flex; align-items: center; gap: 10px; background: #F4F8F7; border-radius: 16px; padding: 8px 10px; min-width: 0; }
.duel-chip.is-me { background: rgba(14,165,165,0.12); }
.duel-chip.is-empty { justify-content: center; color: #9AA7A4; font-size: 22px; font-weight: 800; min-height: 56px; }
.duel-chip-text { display: grid; min-width: 0; flex: 1; }
.duel-chip-name { font-weight: 800; font-size: 15px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.duel-chip-status { font-size: 12.5px; color: #0F6F6C; font-weight: 700; }
.duel-tag { font-size: 11.5px; color: #8A5A00; font-weight: 700; }
.duel-score { font-size: 22px; font-weight: 900; font-variant-numeric: tabular-nums; color: #0F6F6C; }
.duel-face { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; flex: none; background: #fff; }
.duel-face.is-glyph { display: grid; place-items: center; background: #0F6F6C; color: #fff; font-weight: 800; font-size: 18px; }
.duel-progress { text-align: center; font-size: 13.5px; font-weight: 700; color: var(--wb-ink-soft, #55625f); }
.duel-timer { height: 8px; border-radius: 999px; background: rgba(14,165,165,0.12); overflow: hidden; }
.duel-timer span { display: block; height: 100%; background: linear-gradient(90deg, #0EA5A5, #0F6F6C); border-radius: 999px; transition: width 100ms linear; }
.duel-prompt { font-size: 30px; font-weight: 800; text-align: center; padding: 10px 0; overflow-wrap: anywhere; white-space: pre-line; line-height: 1.35; }
.duel-prompt.is-long { font-size: 20px; font-weight: 700; }
.duel-options { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
@media (max-width: 520px) { .duel-options { grid-template-columns: 1fr; } .duel-prompt { font-size: 26px; } }
.duel-opt { position: relative; min-height: 64px; padding: 12px 16px; border-radius: 16px; border: 2px solid rgba(15,111,108,0.18); background: #fff; font: inherit; font-size: 17px; font-weight: 700; color: inherit; cursor: pointer; text-align: center; overflow-wrap: anywhere; }
.duel-opt:hover:not(:disabled) { border-color: #0EA5A5; }
.duel-opt.is-picked { border-color: #0F6F6C; background: rgba(14,165,165,0.10); }
.duel-opt.is-right { border-color: #16A34A; background: #DCFCE7; }
.duel-opt.is-wrong { border-color: #DC2626; background: #FEE2E2; }
.duel-opt:disabled { cursor: default; }
.duel-their { position: absolute; inset-inline-end: 6px; top: 6px; }
.duel-their .duel-face { width: 26px; height: 26px; font-size: 13px; }
.duel-result { margin: 0; text-align: center; font-weight: 800; font-size: 18px; }
.is-good { color: #15803D; }
.is-bad { color: #B91C1C; }
.duel-recap { display: grid; gap: 6px; background: #F7FAF9; border-radius: 16px; padding: 12px 14px; }
.duel-recap-h { font-weight: 800; font-size: 14px; color: var(--wb-ink-soft, #55625f); }
.duel-recap-row { display: grid; grid-template-columns: 20px minmax(0,1fr) minmax(0,1fr); gap: 8px; font-size: 15px; align-items: baseline; }
.duel-recap-row > * { min-width: 0; overflow-wrap: anywhere; }
.duel-modes { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.duel-modes > :last-child:nth-child(odd) { grid-column: 1 / -1; }
@media (max-width: 560px) { .duel-modes { grid-template-columns: 1fr; } }
.duel-mode { display: grid; gap: 4px; text-align: start; padding: 16px; border-radius: 18px; border: 2px solid rgba(15,111,108,0.16); background: #fff; font: inherit; color: inherit; cursor: pointer; }
.duel-mode:hover { border-color: #0EA5A5; }
.duel-mode b { font-size: 17px; }
.duel-mode span { font-size: 14px; color: var(--wb-ink-soft, #55625f); line-height: 1.45; }
.duel-mode .duel-mode-icon { font-size: 26px; }
.duel-note { margin: 0; padding: 10px 14px; border-radius: 14px; background: #FFF7E6; color: #8A5A00; font-size: 14.5px; font-weight: 600; text-align: center; }
.duel-input { width: 100%; max-width: 260px; margin: 0 auto; display: block; padding: 12px 14px; font: inherit; font-size: 24px; letter-spacing: 0.2em; text-align: center; border-radius: 14px; border: 2px solid rgba(15,111,108,0.25); font-variant-numeric: tabular-nums; }
.duel-names { display: grid; gap: 10px; max-width: 360px; margin: 0 auto; width: 100%; }
.duel-names input { padding: 12px 14px; font: inherit; font-size: 17px; border-radius: 14px; border: 2px solid rgba(15,111,108,0.25); }
.duel-pass { min-height: 260px; display: grid; place-items: center; text-align: center; gap: 10px; cursor: pointer; border: 0; width: 100%; background: linear-gradient(160deg, #E6F6F4, #fff); border-radius: 22px; font: inherit; color: inherit; }
.duel-pass b { font-size: 26px; }
.duel-stats { margin-top: 14px; }
.duel-table { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.duel-table li { display: grid; grid-template-columns: 32px 40px minmax(0,1fr) auto; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 14px; background: #F7FAF9; }
.duel-table.is-vs li { grid-template-columns: 40px minmax(0,1fr) auto; }
.duel-table li.is-me { background: rgba(14,165,165,0.12); }
.duel-rank { text-align: center; font-weight: 900; font-size: 18px; font-variant-numeric: tabular-nums; }
.duel-table-name { font-weight: 800; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.duel-table-num { font-size: 13.5px; font-weight: 700; color: #0F6F6C; font-variant-numeric: tabular-nums; white-space: nowrap; }
@media (max-width: 420px) { .duel-table li { grid-template-columns: 28px 36px minmax(0,1fr); } .duel-table.is-vs li { grid-template-columns: 36px minmax(0,1fr); } .duel-table-num { grid-column: 1 / -1; text-align: end; } }
.duel-end { gap: 16px; }
.duel-end-banner { display: grid; justify-items: center; gap: 4px; padding: 14px 12px 6px; border-radius: 18px; }
.duel-end-banner.is-win { background: linear-gradient(160deg, #FFF6DA, #FFFFFF); }
.duel-end-banner.is-lose { background: linear-gradient(160deg, #EAF4FF, #FFFFFF); }
.duel-end-banner.is-tie { background: linear-gradient(160deg, #EEF7F5, #FFFFFF); }
.duel-end-emoji { font-size: 44px; line-height: 1; }
.duel-end-scores { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.duel-end-player { display: grid; justify-items: center; gap: 4px; padding: 14px 10px; border-radius: 18px; background: #F4F8F7; border: 2px solid transparent; min-width: 0; }
.duel-end-player.is-me { background: rgba(14,165,165,0.10); }
.duel-end-player.is-lead { border-color: #E3B341; }
.duel-end-player .duel-face { width: 52px; height: 52px; font-size: 22px; }
.duel-end-name { font-weight: 800; font-size: 15px; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.duel-end-score { font-size: 34px; font-weight: 900; color: #0F6F6C; font-variant-numeric: tabular-nums; line-height: 1.1; }
.duel-end-right { font-size: 13px; font-weight: 700; color: var(--wb-ink-soft, #55625f); }
.duel-rtable-wrap { overflow-x: auto; border-radius: 16px; border: 1px solid rgba(15,111,108,0.14); }
.duel-rtable { width: 100%; border-collapse: collapse; font-size: 15px; }
.duel-rtable caption { caption-side: top; text-align: start; font-weight: 800; font-size: 14px; color: var(--wb-ink-soft, #55625f); padding: 12px 14px 8px; }
.duel-rtable th { text-align: start; font-size: 12.5px; font-weight: 800; color: var(--wb-ink-soft, #55625f); padding: 8px 14px; background: #F4F8F7; border-bottom: 1px solid rgba(15,111,108,0.12); white-space: nowrap; }
.duel-rtable td { text-align: start; padding: 10px 14px; border-bottom: 1px solid rgba(15,111,108,0.08); vertical-align: middle; }
.duel-rtable tbody tr:nth-child(even) td { background: #FAFCFB; }
.duel-rtable tbody tr:last-child td { border-bottom: 0; }
.duel-rt-word { font-weight: 800; }
.duel-mark { display: inline-flex; align-items: baseline; gap: 6px; font-weight: 900; font-size: 16px; }
.duel-mark small { font-size: 12px; font-weight: 700; }
.duel-mark.is-good { color: #15803D; }
.duel-mark.is-bad { color: #B91C1C; }
.duel-mark.is-bad small { color: #9B5C5C; text-decoration: line-through; text-decoration-color: rgba(185,28,28,0.4); }
.duel-mark.is-none { color: #9AA7A4; }
@media (max-width: 480px) { .duel-rtable { font-size: 14px; } .duel-rtable th, .duel-rtable td { padding: 8px 10px; } .duel-mark small { display: none; } }
.duel-games { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 8px; }
.duel-game { display: flex; align-items: center; gap: 10px; padding: 6px 10px 6px 6px; border-radius: 14px; border: 1.5px solid rgba(15,111,108,0.16); background: #fff; font: inherit; font-size: 14px; font-weight: 700; color: inherit; cursor: pointer; text-align: start; min-width: 0; }
.duel-game:hover { border-color: #0EA5A5; }
.duel-game img { width: 56px; height: 40px; object-fit: cover; border-radius: 9px; flex: none; background: #F4F8F7; }
.duel-game span { min-width: 0; line-height: 1.25; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
`;
