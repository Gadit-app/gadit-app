/** Styles for the learning mode card on /play (same family as the Kids Mode card). */
export const LEARN_CSS = `
.wb-learn-card { margin: 26px 0 0; padding: 14px 18px; border-radius: 16px; background: #FFFFFF; box-shadow: 0 0 0 0.5px rgba(15,23,42,0.14), 0 1px 2px rgba(15,23,42,0.05), 0 6px 16px -10px rgba(15,23,42,0.22); display: grid; gap: 12px; }
.wb-learn-card.is-on { background: #FFF8E8; box-shadow: 0 0 0 1px #F1DDAE; }
.wb-learn-head { display: flex; align-items: center; gap: 14px; }
.wb-learn-icon { font-size: 34px; line-height: 1; flex: none; }
.wb-learn-text { flex: 1; min-width: 0; display: grid; gap: 2px; }
.wb-learn-text b { font-size: 16.5px; font-weight: 700; color: #172320; display: inline-flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.wb-learn-text span { font-size: 13.5px; line-height: 1.5; color: #5C6B66; }
.wb-learn-beta { font-size: 11px; font-weight: 800; color: #8A5A00; background: #FFE7B3; border-radius: 999px; padding: 2px 8px; }
.wb-learn-chips, .wb-learn-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.wb-learn-chip { display: inline-flex; align-items: center; gap: 6px; min-height: 40px; padding: 0 16px; border-radius: 999px; border: 1.5px solid rgba(15,111,108,0.3); background: #FFFFFF; color: #0F3B39; font: inherit; font-size: 15px; font-weight: 700; cursor: pointer; }
.wb-learn-chip small { font-size: 11px; font-weight: 800; color: #8A5A00; }
.wb-learn-chip:hover { border-color: #0F6F6C; }
.wb-learn-chip.is-on { background: #0F6F6C; border-color: #0F6F6C; color: #FFFFFF; }
.wb-learn-chip.is-soft { border-color: transparent; background: rgba(15,111,108,0.08); color: #0F6F6C; font-size: 14px; }
.wb-learn-chip:disabled, .wb-learn-btn:disabled { opacity: 0.55; cursor: default; }
.wb-learn-btn { min-height: 42px; padding: 0 18px; border-radius: 999px; border: 0; background: #0F6F6C; color: #FFFFFF; font: inherit; font-size: 15px; font-weight: 800; cursor: pointer; }
.wb-learn-btn:hover { background: #0B5A57; }
.wb-learn-stats { display: flex; flex-wrap: wrap; gap: 8px 18px; font-size: 14px; color: #4A5A55; }
.wb-learn-stats b { font-size: 18px; color: #0F3B39; font-variant-numeric: tabular-nums; }
.wb-learn-stats .is-list b { color: #B45309; }
.wb-learn-text-area { width: 100%; box-sizing: border-box; min-height: 120px; padding: 10px 12px; border-radius: 12px; border: 1.5px solid rgba(15,111,108,0.25); font: inherit; font-size: 15.5px; line-height: 1.5; resize: vertical; background: #FFFFFF; color: #172320; }
.wb-learn-date { display: inline-flex; align-items: center; gap: 8px; font-size: 13.5px; color: #4A5A55; }
.wb-learn-date input { min-height: 40px; padding: 0 10px; border-radius: 10px; border: 1.5px solid rgba(15,111,108,0.25); font: inherit; background: #FFFFFF; color: #172320; color-scheme: light; }
.wb-learn-msg { margin: 0; font-size: 14px; color: #8A5A00; }
.wb-learn-card.is-slim { display: flex; align-items: center; flex-wrap: wrap; gap: 8px 12px; margin-top: 18px; padding: 10px 14px; border-radius: 14px; background: transparent; box-shadow: 0 0 0 1px var(--rule, rgba(15,111,108,0.18)); }
.wb-learn-card.is-slim .wb-learn-icon { font-size: 22px; }
.wb-learn-card.is-slim .wb-learn-text { flex: 1 1 240px; }
.wb-learn-card.is-slim .wb-learn-text b { font-size: 14.5px; color: var(--ink, #172320); }
.wb-learn-card.is-slim .wb-learn-text span { font-size: 13px; color: var(--ink-soft, #5C6B66); }
.wb-learn-card.is-slim .wb-learn-chips { margin-inline-start: auto; gap: 6px; }
.wb-learn-card.is-slim .wb-learn-chip { min-height: 36px; padding: 0 14px; font-size: 14px; background: var(--surface, #FFFFFF); color: var(--ink, #0F3B39); border-color: var(--rule, rgba(15,111,108,0.3)); }
.wb-learn-card.is-slim .wb-learn-chip:hover { border-color: var(--accent, #0F6F6C); }
.wb-learn-card.is-slim .wb-learn-chip small { color: var(--ink-soft, #8A5A00); }
.wb-learn-card.is-slim .wb-learn-chip.is-soft { background: transparent; color: var(--ink-soft, #0F6F6C); }
.wb-learn-reopen { display: inline-flex; align-items: center; gap: 6px; margin-top: 14px; padding: 6px 2px; border: 0; background: none; font: inherit; font-size: 13.5px; font-weight: 700; color: var(--ink-soft, #55625f); cursor: pointer; text-decoration: underline; text-underline-offset: 3px; }
.wb-learn-lesson { display: flex; align-items: center; flex-wrap: wrap; gap: 10px 14px; padding: 12px 14px; border-radius: 14px; background: #E8F6F4; }
.wb-learn-lesson .wb-learn-text b { color: #0F3B39; }
.wb-learn-lessons { display: grid; gap: 10px; justify-items: start; }
.wb-learn-lessons .wb-learn-lesson { width: 100%; box-sizing: border-box; }
.wb-learn-lesson-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.wb-learn-topics { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); align-items: start; gap: 10px; width: 100%; }
.wb-learn-topic { display: flex; flex-direction: column; gap: 8px; padding: 10px 12px; border-radius: 14px; border: 1.5px solid rgba(15,111,108,0.18); background: #FFFFFF; min-width: 0; }
.wb-learn-topic-h { display: flex; align-items: center; gap: 6px; font-size: 14.5px; font-weight: 700; color: #0F3B39; }
.wb-learn-topic-n { margin-inline-start: auto; font-size: 12px; font-weight: 600; color: #5B7D7B; font-variant-numeric: tabular-nums; }
.wb-learn-topic-steps { display: flex; flex-wrap: wrap; gap: 6px; }
.wb-learn-step { width: 34px; height: 34px; border-radius: 50%; border: 1.5px solid rgba(15,111,108,0.3); background: #FFFFFF; color: #0F3B39; font: inherit; font-size: 14px; font-weight: 700; cursor: pointer; padding: 0; }
.wb-learn-step.is-done { background: #0F6F6C; border-color: #0F6F6C; color: #FFFFFF; }
.wb-learn-step.is-next { border-color: #0F6F6C; box-shadow: 0 0 0 3px rgba(15,111,108,0.25); }
.wb-learn-step:disabled { cursor: progress; }
.wb-learn-lesson-chip { font: inherit; font-size: 14px; font-weight: 700; min-height: 38px; padding: 0 14px; border-radius: 999px; border: 1.5px solid rgba(15,111,108,0.25); background: #FFFFFF; color: #0F3B39; cursor: pointer; }
.wb-learn-lesson-chip.is-done { background: #E8F6F4; color: #0F6F6C; }
.wb-learn-lesson-chip.is-next { border-color: #0F6F6C; box-shadow: 0 0 0 2px rgba(15,111,108,0.25); }
.wb-learn-chip:focus-visible, .wb-learn-btn:focus-visible { outline: 3px solid #0EA5A5; outline-offset: 2px; }
`;
