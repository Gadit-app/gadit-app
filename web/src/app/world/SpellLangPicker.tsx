"use client";

/**
 * "Which language are we spelling in?": the language picker of the world
 * map, shared with Letter Catch (Gadi 2026-11-10: the app in Hebrew still
 * gave English words in the fireflies and the coaster, and there was no way
 * to pick). The pick is kept per child on the device (lib/world/spell-choice)
 * and both games read it.
 */
import { useEffect, useState } from "react";
import { LangSearchList } from "@/components/LangSearch";
import { langNameIn } from "@/lib/i18n";
import { toggleLangGroup } from "@/lib/lang-groups";
import { learnTargets } from "@/lib/learn/targets";
import { NO_SPELL_LANGS } from "@/lib/world/letters";
import { spellOptions } from "@/lib/world/spell-choice";

export function SpellLangPicker({ lang, spell, label, onPick }: {
  /** The UI language. */
  lang: string;
  /** The language shown as picked ("…" while unknown). */
  spell: string | null;
  label: string;
  onPick: (lang: string) => void;
}) {
  const opts = spellOptions();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  const nameOf = (l: string) => { const n = langNameIn(l, lang); return n.charAt(0).toLocaleUpperCase(lang) + n.slice(1); };
  const pick = (l: string) => { if (!opts.includes(l)) return; setOpen(false); onPick(l); };
  const learned = (code: string) => learnTargets(lang).includes(code as "en" | "he");

  return (
    <div className="wm-spell">
      <style>{CSS}</style>
      <span className="wm-spell-q" id="wm-spell-q">{label}</span>
      <button type="button" className="wm-spell-btn" aria-haspopup="listbox" aria-expanded={open} aria-labelledby="wm-spell-q" disabled={!spell} onClick={() => setOpen((o) => !o)}>
        <span aria-hidden="true">🌐</span>
        <span>{spell ? nameOf(spell) : "…"}</span>
        <span className="wm-spell-caret" aria-hidden="true">▾</span>
      </button>
      {open ? (
        <>
          <div className="wm-spell-scrim" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="wm-spell-list" role="listbox" aria-labelledby="wm-spell-q">
            <LangSearchList lang={lang} item="div" onPick={pick} onClose={() => setOpen(false)}>
              {(rows) => [
                // The child's own language, then the ones they learn, then A to Z.
                ...rows.filter((r) => !r.group && (r.code === lang || learned(r.code))).sort((x) => (x.code === lang ? -1 : 1)),
                ...rows.filter((r) => r.group || (r.code !== lang && !learned(r.code))),
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
                    onClick={() => { if (toggleLangGroup(l.code)) return; pick(l.code); }}
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
  );
}

const CSS = `
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
