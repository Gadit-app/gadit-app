"use client";

import { useEffect, useState } from "react";
import { duelCopy } from "./duel-i18n";

/**
 * Family settings: may the kids play Word Duel with other kids who are
 * online? Off until a parent turns it on (Gadi 2026-10-11). Playing inside
 * the family, with a code, or against Word Bot never needs it.
 */
export function DuelPermission({ user, lang, dir }: {
  user: { getIdToken: () => Promise<string> } | null;
  lang: string;
  dir: "ltr" | "rtl";
}) {
  const t = duelCopy(lang);
  const [allow, setAllow] = useState<boolean | null>(null);
  const [owner, setOwner] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!user) return;
      try {
        const r = await fetch("/api/duel?permission=1", { headers: { Authorization: `Bearer ${await user.getIdToken()}` } });
        const j = await r.json();
        if (alive && r.ok) { setAllow(j.allow === true); setOwner(j.owner === true); }
      } catch { /* the switch stays hidden */ }
    })();
    return () => { alive = false; };
  }, [user]);

  if (allow === null || !owner) return null;

  const flip = async () => {
    if (!user || busy) return;
    const next = !allow;
    setBusy(true);
    setAllow(next);
    try {
      const r = await fetch("/api/duel", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` },
        body: JSON.stringify({ action: "permission", allow: next }),
      });
      if (!r.ok) setAllow(!next);
    } catch { setAllow(!next); } finally { setBusy(false); }
  };

  return (
    <div className="fam-set-row duel-perm" dir={dir}>
      <style>{`.duel-perm{display:flex;align-items:flex-start;gap:14px;flex-wrap:wrap}.duel-perm-text{flex:1 1 260px;min-width:0;display:grid;gap:4px}.duel-perm-text b{font-size:16px}.duel-perm-text span{font-size:14px;line-height:1.55;color:var(--wb-ink-soft,#55625f)}.duel-perm-switch{flex:none;min-width:84px;min-height:40px;border-radius:999px;border:0;font:inherit;font-weight:800;cursor:pointer;background:rgba(15,111,108,.12);color:#0F6F6C}.duel-perm-switch.is-on{background:#0F6F6C;color:#fff}html[data-theme="dark"] .duel-perm-switch{background:rgba(45,212,191,.14);color:#5EEAD4}html[data-theme="dark"] .duel-perm-switch.is-on{background:#2DD4BF;color:#04241F}`}</style>
      <span aria-hidden="true" style={{ fontSize: 24 }}>⚔️</span>
      <div className="duel-perm-text">
        <b>{t.permTitle}</b>
        <span>{t.permDesc}</span>
      </div>
      <button type="button" role="switch" aria-checked={allow} aria-label={t.permTitle} className={`duel-perm-switch${allow ? " is-on" : ""}`} disabled={busy} onClick={() => void flip()}>
        {allow ? t.permOn : t.permOff}
      </button>
    </div>
  );
}
