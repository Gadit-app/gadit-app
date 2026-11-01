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
import { langNameIn } from "@/lib/i18n";
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
  // The language the child spells in (Gadi 2026-11-01): their own or one they learn.
  const opts = spellOptions(lang);
  const [spell, setSpell] = useState<string | null>(demo ? opts[0] ?? null : null);
  useEffect(() => {
    if (demo || !user || opts.length < 2) return;
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
  const pickSpell = (l: string) => { setSpell(l); if (user) writeSpellChoice(user.uid, lang, l); };
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
      {opts.length > 1 && (demo || user) ? (
        <div className="wm-spell">
          <span className="wm-spell-q">{c.spellIn}</span>
          <div className="wm-spell-row" role="group" aria-label={c.spellIn}>
            {opts.map((l) => (
              <button key={l} type="button" className="wm-spell-btn" aria-pressed={spell === l} disabled={!spell} onClick={() => pickSpell(l)}>
                {nameOf(l)}
              </button>
            ))}
          </div>
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
.wm-spell{max-width:620px;margin:0 auto 20px;display:grid;gap:10px;justify-items:center;text-align:center}
.wm-spell-q{font-size:16px;font-weight:700}
.wm-spell-row{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}
.wm-spell-btn{min-height:46px;padding:10px 22px;border-radius:999px;border:2px solid #ffffff66;background:#ffffff1a;color:#fff;font:inherit;font-size:17px;font-weight:700;cursor:pointer}
.wm-spell-btn[aria-pressed="true"]{background:#fff;color:#0a7472;border-color:#fff;box-shadow:0 4px 0 #0005}
.wm-spell-btn:disabled{opacity:.6}
`;
