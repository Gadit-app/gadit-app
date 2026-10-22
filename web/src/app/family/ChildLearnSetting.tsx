"use client";

/**
 * The parent's learning setting for one child on the family dashboard
 * (2026-10-22): which language the child learns (or off), and "do they
 * already read it?" ("not yet" plays the lessons as pictures and sound).
 * Saved through /api/family/child-learn, which checks the caller owns the
 * family and writes the same fields as the child's own setup.
 */
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import type { LearnLang, Reads } from "@/lib/learn/engine";
import { learnTargets } from "@/lib/learn/targets";
import { learnCopy } from "@/components/play/learn/learn-i18n";
import { learnExtraCopy } from "@/components/play/learn/learn-extra-i18n";

export type LearnSetup = { lang: LearnLang | null; reads: Reads | null; ui: string | null };

export function ChildLearnSetting({ memberId, setup, lang, onSaved }: {
  memberId: string;
  setup: LearnSetup;
  /** The dashboard's UI language. */
  lang: string;
  onSaved?: () => void;
}) {
  const { user } = useAuth();
  const lc = learnCopy(lang);
  const xc = learnExtraCopy(lang);
  const [cur, setCur] = useState<{ lang: LearnLang | null; reads: Reads | null }>({ lang: setup.lang, reads: setup.reads });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<"" | "saved" | "error">("");
  const targets = learnTargets(setup.ui || lang);
  const name = (l: LearnLang) => (l === "en" ? lc.english : lc.hebrew);

  async function save(next: { lang: LearnLang | null; reads: Reads | null }) {
    if (!user || busy) return;
    const before = cur;
    setCur(next);
    setBusy(true);
    setMsg("");
    try {
      const r = await fetch("/api/family/child-learn", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` },
        body: JSON.stringify({ memberId, lang: next.lang, reads: next.reads ?? "little", ui: lang }),
      });
      if (!r.ok) throw new Error(String(r.status));
      setMsg("saved");
      onSaved?.();
    } catch {
      setCur(before);
      setMsg("error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fam-dash-learnset">
      <div className="fam-dash-learnset-h">🎒 {xc.setTitle}</div>
      <div className="fam-dash-learnset-chips" role="radiogroup" aria-label={xc.setTitle}>
        {targets.map((l) => (
          <button key={l} type="button" role="radio" aria-checked={cur.lang === l} disabled={busy}
            className={`fam-dash-learnset-chip${cur.lang === l ? " is-on" : ""}`}
            onClick={() => void save({ lang: l, reads: cur.reads ?? "little" })}>
            {name(l)}
          </button>
        ))}
        <button type="button" role="radio" aria-checked={cur.lang === null} disabled={busy}
          className={`fam-dash-learnset-chip${cur.lang === null ? " is-on" : ""}`}
          onClick={() => void save({ lang: null, reads: cur.reads })}>
          {xc.setOff}
        </button>
      </div>
      {cur.lang && (
        <>
          <div className="fam-dash-learnset-q">{xc.setReadsQ}</div>
          <div className="fam-dash-learnset-chips" role="radiogroup" aria-label={xc.setReadsQ}>
            {(["no", "little", "yes"] as Reads[]).map((r) => (
              <button key={r} type="button" role="radio" aria-checked={cur.reads === r} disabled={busy}
                className={`fam-dash-learnset-chip${cur.reads === r ? " is-on" : ""}`}
                onClick={() => void save({ lang: cur.lang, reads: r })}>
                {lc.reads[r]}
              </button>
            ))}
          </div>
          <div className="fam-dash-learnset-note">{xc.setNote}</div>
        </>
      )}
      {msg && <div className="fam-dash-learnset-msg" role="status">{msg === "saved" ? `✓ ${xc.setSaved}` : lc.error}</div>}
    </div>
  );
}
