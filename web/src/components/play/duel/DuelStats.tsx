"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { avatarUrl } from "@/lib/family";
import type { DuelStatRow, DuelVsRow } from "@/lib/duel";
import { duelCopy } from "./duel-i18n";

/**
 * The wins table on the Word Duel hub (Gadi 2026-10-11): the family,
 * ranked by wins against people, and my record against each opponent.
 * Games against Word Bot are counted apart, so they never fill the table.
 */
export function DuelStats({ lang }: { lang: string }) {
  const { user } = useAuth();
  const t = duelCopy(lang);
  const [data, setData] = useState<{ rows: DuelStatRow[]; vs: DuelVsRow[]; bot: { games: number; wins: number } } | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!user) return;
      try {
        const r = await fetch("/api/duel?stats=1", { headers: { Authorization: `Bearer ${await user.getIdToken()}` }, cache: "no-store" });
        const j = await r.json();
        if (alive && r.ok) setData(j);
      } catch { /* the table is a bonus */ }
    })();
    return () => { alive = false; };
  }, [user]);

  if (!data) return null;
  const played = data.rows.some((r) => r.games > 0) || data.bot.games > 0;
  const medal = (i: number, wins: number) => (wins > 0 && i < 3 ? ["🥇", "🥈", "🥉"][i] : `${i + 1}`);

  return (
    <div className="duel-card duel-stats">
      <h2 className="duel-h">{t.statsTitle}</h2>
      {!played ? (
        <p className="duel-sub">{t.statsEmpty}</p>
      ) : (
        <>
          <ol className="duel-table">
            {data.rows.map((r, i) => (
              <li key={i} className={r.isMe ? "is-me" : ""}>
                <span className="duel-rank">{medal(i, r.wins)}</span>
                <Avatar id={r.avatar} name={r.name} />
                <span className="duel-table-name" dir="auto">{r.name || t.you}{r.isMe && r.name ? ` (${t.you})` : ""}</span>
                <span className="duel-table-num">{t.statsLine(r.wins, r.games)}</span>
              </li>
            ))}
          </ol>
          {data.vs.length > 0 && (
            <>
              <div className="duel-recap-h">{t.vsTitle}</div>
              <ul className="duel-table is-vs">
                {data.vs.filter((v) => v.kind !== "bot").map((v, i) => (
                  <li key={i}>
                    <Avatar id={v.avatar} name={v.name} glyph={v.kind === "ghost" ? "⏱️" : undefined} />
                    <span className="duel-table-name" dir="auto">{v.name}</span>
                    <span className="duel-table-num">{t.vsLine(v.w, v.l, v.t)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {data.bot.games > 0 && <p className="duel-sub">{t.vsBot(data.bot.wins, data.bot.games)}</p>}
        </>
      )}
    </div>
  );
}

function Avatar({ id, name, glyph }: { id: string | null; name: string; glyph?: string }) {
  const src = avatarUrl(id);
  // eslint-disable-next-line @next/next/no-img-element
  if (src) return <img src={src} alt="" className="duel-face" />;
  return <span className="duel-face is-glyph">{glyph ?? (name.trim()[0] ?? "?").toUpperCase()}</span>;
}
