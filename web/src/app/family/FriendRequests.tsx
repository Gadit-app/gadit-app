"use client";

/**
 * Friends in Word Worlds, the parent's side (Gadi 2026-11-01). A child's
 * friendship waits for a parent's OK; here the parent approves or declines,
 * and can remove a friend later. Hidden while no child has a friend or a
 * request. Kids never exchange text: only words they already spelled.
 */
import { useCallback, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { avatarUrl } from "@/lib/family";
import { friendsCopy } from "@/lib/world/friends-i18n";

type F = { uid: string; name: string; avatar: string | null; status: "pending" | "active"; needsMe: boolean };
type Kid = { uid: string; name: string; avatar: string | null; friends: F[] };

function Av({ id }: { id: string | null }) {
  const src = avatarUrl(id);
  return (
    <span className="ffr-av">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" />
      ) : <span aria-hidden="true">🙂</span>}
    </span>
  );
}

export function FriendRequests({ user, lang, dir }: { user: User | null; lang: string; dir: "rtl" | "ltr" }) {
  const fc = friendsCopy(lang);
  const [kids, setKids] = useState<Kid[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const r = await fetch("/api/friends/parent", { headers: { Authorization: `Bearer ${await user.getIdToken()}` } });
      if (r.ok) setKids(((await r.json()) as { kids: Kid[] }).kids);
    } catch { /* stays hidden */ }
  }, [user]);
  useEffect(() => {
    let alive = true;
    (async () => { if (alive) await load(); })();
    return () => { alive = false; };
  }, [load]);

  const act = async (action: "approve" | "decline" | "remove", kid: string, friend: string) => {
    if (!user) return;
    setBusy(`${kid}:${friend}`);
    try {
      await fetch("/api/friends/parent", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` },
        body: JSON.stringify({ action, kid, friend }),
      });
      await load();
    } catch { /* try again */ }
    setBusy(null);
  };

  if (!kids?.length) return null;
  const requests = kids.flatMap((k) => k.friends.filter((f) => f.needsMe).map((f) => ({ k, f })));
  return (
    <section className="ffr" dir={dir}>
      <style>{CSS}</style>
      <h2 className="fam-shell-h2">{fc.pTitle}</h2>
      <p className="ffr-sub">{fc.pSub.split("\n").map((l, i) => <span key={i}>{l}</span>)}</p>
      {requests.map(({ k, f }) => (
        <div key={`${k.uid}:${f.uid}`} className="ffr-req">
          <span className="ffr-pair"><Av id={f.avatar} /><Av id={k.avatar} /></span>
          <strong className="ffr-text">{fc.pRequest(f.name || "?", k.name || "?")}</strong>
          <span className="ffr-actions">
            <button type="button" className="ffr-btn is-ok" disabled={busy === `${k.uid}:${f.uid}`} onClick={() => void act("approve", k.uid, f.uid)}>{fc.pApprove}</button>
            <button type="button" className="ffr-btn" disabled={busy === `${k.uid}:${f.uid}`} onClick={() => void act("decline", k.uid, f.uid)}>{fc.pDecline}</button>
          </span>
        </div>
      ))}
      {kids.map((k) => {
        const active = k.friends.filter((f) => !f.needsMe);
        if (!active.length) return null;
        return (
          <div key={k.uid} className="ffr-kid">
            <b>{fc.pFriendsOf(k.name || "?")}</b>
            <ul>
              {active.map((f) => (
                <li key={f.uid}>
                  <Av id={f.avatar} />
                  <span className="ffr-name">{f.name || "?"}{f.status !== "active" ? <small> · {fc.waiting}</small> : null}</span>
                  <button type="button" className="ffr-btn is-small" disabled={busy === `${k.uid}:${f.uid}`} onClick={() => void act("remove", k.uid, f.uid)}>{fc.pRemove}</button>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
}

const CSS = `
.ffr{display:grid;gap:12px;margin:18px 0}
.ffr .fam-shell-h2{margin:0}
.ffr-sub{margin:0;display:grid;color:var(--ink-soft,#5f6b73);font-size:14px}
.ffr-req{display:flex;flex-wrap:wrap;align-items:center;gap:12px;padding:14px;border-radius:16px;background:var(--surface,#fff);border:2px solid #f5c84c;box-shadow:0 6px 18px -12px #0004}
.ffr-pair{display:flex}
.ffr-pair .ffr-av+.ffr-av{margin-inline-start:-10px}
.ffr-av{width:40px;height:40px;border-radius:50%;overflow:hidden;background:#eef4f3;display:grid;place-items:center;border:2px solid var(--surface,#fff);font-size:20px;flex:0 0 40px}
.ffr-av img{width:100%;height:100%;object-fit:cover}
.ffr-text{flex:1;min-width:160px;font-size:16px}
.ffr-actions{display:flex;gap:8px}
.ffr-btn{min-height:42px;padding:0 16px;border-radius:999px;border:2px solid var(--rule,#d6e0de);background:var(--surface,#fff);color:inherit;font:inherit;font-weight:700;cursor:pointer}
.ffr-btn.is-ok{background:#0a7472;border-color:#0a7472;color:#fff}
.ffr-btn.is-small{min-height:36px;padding:0 12px;font-size:14px}
.ffr-btn:disabled{opacity:.5}
.ffr-kid{display:grid;gap:8px;padding:12px 14px;border-radius:16px;background:var(--surface,#fff);border:1px solid var(--rule,#e3ecea)}
.ffr-kid ul{list-style:none;margin:0;padding:0;display:grid;gap:8px}
.ffr-kid li{display:flex;align-items:center;gap:10px}
.ffr-name{flex:1;min-width:0}
.ffr-name small{color:var(--ink-soft,#5f6b73)}
`;
