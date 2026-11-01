"use client";

/**
 * The map of word worlds (Gadi 2026-10-30): the child's path from world to
 * world. The jungle is open; each next world opens after UNLOCK_WORDS words
 * spelled in the world before it, and the map says exactly how many are
 * left (a visible goal, never a random one). Worlds without art yet show
 * "coming soon" so the child sees where the path goes.
 */

import { WaitText } from "@/components/WaitText";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { WORLDS, WORLD_ICON, WORLD_ORDER, isWorldId, worldArt, wordsToOpen } from "@/lib/world/worlds";
import { worldCopy } from "@/lib/world/world-i18n";
import { langNameIn, type Lang } from "@/lib/i18n";
import { toggleLangGroup } from "@/lib/lang-groups";
import { LangSearchList } from "@/components/LangSearch";
import { NO_SPELL_LANGS } from "@/lib/world/letters";
import { learnTargets } from "@/lib/learn/targets";
import { readSpellChoice, spellOptions, writeSpellChoice } from "@/lib/world/spell-choice";

type Counts = Partial<Record<string, number>>;

export function WorldMap({ demo }: { demo?: Counts }) {
  const { user, plan, planReady, loading, promptLogin } = useAuth();
  const { lang, dir } = useLang();
  const href = useHref();
  const router = useRouter();
  const c = worldCopy(lang);
  const [counts, setCounts] = useState<Counts | null>(demo ?? null);
  // The language the child spells in (Gadi 2026-11-01): any language with letters.
  const opts = spellOptions();
  const [spell, setSpell] = useState<string | null>(demo ? lang : null);
  const [pickerOpen, setPickerOpen] = useState(false);
  useEffect(() => {
    if (demo || !user) return;
    let alive = true;
    (async () => {
      const saved = readSpellChoice(user.uid, lang);
      if (saved) { setSpell(saved); return; }
      // No pick yet: the game uses the learning-mode language, so the map shows it.
      try {
        const r = await fetch(`/api/learn?ui=${encodeURIComponent(lang)}`, { headers: { Authorization: `Bearer ${await user.getIdToken()}` } });
        const j = r.ok ? ((await r.json()) as { profile?: { lang?: string | null } }) : null;
        const l = j?.profile?.lang;
        if (alive) setSpell(l && opts.includes(l) ? l : learnTargets(lang)[0] ?? opts[0]);
      } catch { if (alive) setSpell(learnTargets(lang)[0] ?? opts[0]); }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo, user, lang]);
  const pickSpell = (l: string) => { setSpell(l); setPickerOpen(false); if (user) writeSpellChoice(user.uid, lang, l); };
  useEffect(() => {
    if (!pickerOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setPickerOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [pickerOpen]);
  const nameOf = (l: string) => { const n = langNameIn(l, lang); return n.charAt(0).toLocaleUpperCase(lang) + n.slice(1); };

  useEffect(() => {
    if (demo || loading) return;
    if (!user) { promptLogin(c.mapTitle); return; }
    if (!planReady) return;
    if (plan === "basic" || plan === "clear") { router.replace(href("/pricing")); return; }
    let alive = true;
    (async () => {
      try {
        const r = await fetch("/api/world", { headers: { Authorization: `Bearer ${await user.getIdToken()}` } });
        const j = r.ok ? ((await r.json()) as { worlds?: Record<string, { items?: unknown[] }> }) : null;
        const out: Counts = {};
        for (const [k, v] of Object.entries(j?.worlds ?? {})) out[k] = Array.isArray(v.items) ? v.items.length : 0;
        if (alive) setCounts(out);
      } catch { if (alive) setCounts({}); }
    })();
    return () => { alive = false; };
  }, [demo, loading, user, planReady, plan, promptLogin, router, href, c.mapTitle]);

  return (
    <div className="wm-root" dir={dir}>
      <style>{CSS}</style>
      <header className="wm-head">
        <Link href={href("/play")} className="wm-back" aria-label={c.back}>✕</Link>
        <div className="wm-titles">
          <h1>{c.mapTitle}</h1>
          <p>{c.mapSub}</p>
        </div>
      </header>
      {demo || user ? (
        <div className="wm-spell">
          <span className="wm-spell-q" id="wm-spell-q">{c.spellIn}</span>
          <button type="button" className="wm-spell-btn" aria-haspopup="listbox" aria-expanded={pickerOpen} aria-labelledby="wm-spell-q" disabled={!spell} onClick={() => setPickerOpen((o) => !o)}>
            <span aria-hidden="true">🌐</span>
            <span>{spell ? nameOf(spell) : "…"}</span>
            <span className="wm-spell-caret" aria-hidden="true">▾</span>
          </button>
          {pickerOpen ? (
            <>
              <div className="wm-spell-scrim" onClick={() => setPickerOpen(false)} aria-hidden="true" />
              <div className="wm-spell-list" role="listbox" aria-labelledby="wm-spell-q">
                <LangSearchList lang={lang} item="div" onPick={(code) => { if (opts.includes(code)) pickSpell(code); }} onClose={() => setPickerOpen(false)}>
                  {(rows) => [
                    // The child's own language, then the ones they learn, then A to Z.
                    ...rows.filter((r) => !r.group && (r.code === lang || learnTargets(lang).includes(r.code as "en" | "he"))).sort((x) => (x.code === lang ? -1 : 1)),
                    ...rows.filter((r) => r.group || (r.code !== lang && !learnTargets(lang).includes(r.code as "en" | "he"))),
                  ].map((l) => {
                    if (!l.group && NO_SPELL_LANGS.has(l.code)) return null;
                    const name = langNameIn(l.code, lang);
                    return (
                      <button
                        key={l.code}
                        type="button"
                        role={l.group ? undefined : "option"}
                        aria-selected={l.group ? undefined : spell === l.code}
                        className={`wm-spell-row${spell === l.code ? " is-on" : ""}${l.group ? " is-group" : ""}`}
                        onClick={() => { if (toggleLangGroup(l.code)) return; pickSpell(l.code as Lang); }}
                      >
                        <span>{name}</span>
                        {!l.group && name !== l.label ? <span className="wm-spell-native" dir={l.dir}>{l.label}</span> : null}
                      </button>
                    );
                  })}
                </LangSearchList>
              </div>
            </>
          ) : null}
        </div>
      ) : null}
      <ol className="wm-path">
        {WORLD_ORDER.map((k, i) => {
          const names = c.worlds[k];
          const built = isWorldId(k);
          const need = counts ? wordsToOpen(k, counts) : 0;
          const open = built && !!counts && need === 0;
          const n = counts?.[k] ?? 0;
          const prevTitle = i > 0 ? c.worlds[WORLD_ORDER[i - 1]].title : "";
          const cover = built ? worldArt(WORLDS[k], "clearing") : null;
          const body = (
            <>
              <span className={`wm-cover${open ? "" : " is-dim"}`} style={cover ? { backgroundImage: `url(${cover})` } : undefined}>
                {!cover ? <span className="wm-icon" aria-hidden="true">{WORLD_ICON[k]}</span> : null}
                {built && !open && counts ? <span className="wm-lock" aria-hidden="true">🔒</span> : null}
              </span>
              <span className="wm-text">
                <strong>{WORLD_ICON[k]} {names.title}</strong>
                {!built ? <span className="wm-note">{c.soon}</span>
                  : !counts ? <span className="wm-note"><WaitText text={c.loading} live /></span>
                  : open ? <span className="wm-note">{n > 0 ? names.wordsIn(n) : names.empty}</span>
                  : <span className="wm-note">{c.locked(need, prevTitle)}</span>}
              </span>
              {open ? <span className="wm-play">{c.play}</span> : null}
            </>
          );
          return (
            <li key={k} className={`wm-stop${open ? " is-open" : built ? " is-locked" : " is-soon"}`}>
              {open ? <Link href={href(`/world/${k}`)} className="wm-card">{body}</Link> : <div className="wm-card">{body}</div>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

const CSS = `
.wm-root{min-height:100dvh;background:linear-gradient(#0f3b2c,#16533c 40%,#1d2350);color:#fff;padding:calc(env(safe-area-inset-top,0px) + 14px) 16px calc(env(safe-area-inset-bottom,0px) + 28px)}
.wm-head{max-width:620px;margin:0 auto 18px;display:grid;grid-template-columns:44px 1fr 44px;gap:12px;align-items:center}
.wm-titles{text-align:center;min-width:0}
.wm-back{width:44px;height:44px;flex:0 0 44px;border-radius:50%;background:#ffffff26;color:#fff;display:grid;place-items:center;font-size:20px;text-decoration:none}
.wm-titles h1{margin:0;font-size:clamp(26px,7vw,36px);line-height:1.15;text-wrap:balance}
.wm-titles p{margin:4px 0 0;opacity:.85;font-size:15px}
.wm-path{list-style:none;margin:0 auto;padding:0;max-width:620px;display:grid;gap:22px;position:relative}
.wm-path::before{content:"";position:absolute;inset-inline-start:46px;top:30px;bottom:30px;border-inline-start:4px dotted #ffffff55}
.wm-stop{position:relative}
.wm-card{display:grid;grid-template-columns:96px 1fr auto;gap:14px;align-items:center;background:#ffffff1a;border:1px solid #ffffff2e;border-radius:22px;padding:10px;color:inherit;text-decoration:none;min-width:0}
.wm-stop.is-open .wm-card{background:#fff;color:#14202b;box-shadow:0 10px 28px #0006}
.wm-stop.is-open .wm-card:active{transform:scale(.98)}
.wm-cover{width:96px;height:96px;border-radius:18px;background:#ffffff22 center/cover;display:grid;place-items:center;position:relative;overflow:hidden}
.wm-cover.is-dim{filter:grayscale(.7) brightness(.8)}
.wm-icon{font-size:46px;filter:grayscale(.4)}
.wm-lock{position:absolute;inset:auto 6px 6px auto;font-size:22px;filter:none}
.wm-text{display:grid;gap:4px;min-width:0}
.wm-text strong{font-size:19px}
.wm-note{font-size:14px;opacity:.85}
.wm-stop.is-open .wm-note{color:#5f6b73;opacity:1}
.wm-play{background:#0a7472;color:#fff;border-radius:999px;padding:10px 18px;font-weight:800;box-shadow:0 4px 0 #075452}
.wm-stop.is-soon .wm-card{opacity:.7}
.wm-spell{max-width:620px;margin:0 auto 20px;display:grid;gap:10px;justify-items:center;text-align:center;position:relative}
.wm-spell-q{font-size:16px;font-weight:700}
.wm-spell-btn{min-height:48px;display:inline-flex;align-items:center;gap:10px;padding:10px 22px;border-radius:999px;border:2px solid #fff;background:#fff;color:#0a7472;font:inherit;font-size:18px;font-weight:800;cursor:pointer;box-shadow:0 4px 0 #0005}
.wm-spell-btn:disabled{opacity:.6}
.wm-spell-caret{font-size:13px;opacity:.7}
.wm-spell-scrim{position:fixed;inset:0;z-index:40}
.wm-spell-list{position:absolute;top:calc(100% + 8px);left:50%;transform:translateX(-50%);z-index:41;width:min(320px,calc(100vw - 32px));max-height:min(60vh,440px);overflow-y:auto;background:#fff;color:#14202b;border-radius:18px;padding:6px;box-shadow:0 18px 40px #0008;text-align:start}
.wm-spell-row{display:flex;flex-direction:column;align-items:flex-start;width:100%;padding:9px 14px;border:0;border-radius:10px;background:transparent;color:inherit;font:inherit;font-size:16px;cursor:pointer;text-align:start;line-height:1.25}
.wm-spell-row:hover{background:#eef6f5}
.wm-spell-row.is-on{background:#0a7472;color:#fff}
.wm-spell-row.is-group{font-weight:800}
.wm-spell-native{font-size:12px;opacity:.6;unicode-bidi:isolate}
`;
