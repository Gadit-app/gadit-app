"use client";

/**
 * Friends on the world map (Gadi 2026-11-01): gifts waiting to be opened,
 * the child's friend code, adding a friend by code, and the friends list
 * (visit an active friend's world). No text between children ever: only
 * codes, names, avatars and words.
 */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "firebase/auth";
import { useHref } from "@/lib/href";
import { avatarUrl } from "@/lib/family";
import { friendsCopy } from "@/lib/world/friends-i18n";
import { WaitText } from "@/components/WaitText";
import { worldCopy } from "@/lib/world/world-i18n";

type Friend = { uid: string; name: string; avatar: string | null; status: "pending" | "active" };
type Gift = { id: string; fromName: string; fromAvatar: string | null; w: string };
export type FriendsData = { code: string; friends: Friend[]; gifts: Gift[] };

/** The child's friends, loaded once for the map (gifts at the top, the rest below). */
export function useFriends(user: User | null, demo?: FriendsData) {
  const [data, setData] = useState<FriendsData | null>(demo ?? null);
  const load = useCallback(async () => {
    if (demo || !user) return;
    try {
      const r = await fetch("/api/friends", { headers: { Authorization: `Bearer ${await user.getIdToken()}` } });
      if (r.ok) setData((await r.json()) as FriendsData);
    } catch { /* the map still works */ }
  }, [demo, user]);
  useEffect(() => {
    let alive = true;
    (async () => { if (alive) await load(); })();
    return () => { alive = false; };
  }, [load]);
  return { data, reload: load };
}

/** Gifts from friends, waiting to be spelled open (top of the map). */
export function FriendGifts({ data, lang, giftWorld }: { data: FriendsData | null; lang: string; giftWorld: string }) {
  const fc = friendsCopy(lang);
  const href = useHref();
  if (!data?.gifts.length) return null;
  return (
    <ul className="wf-gifts wf-gifts-top">
      {data.gifts.map((g) => (
        <li key={g.id}>
          <Link className="wf-gift" href={href(`/world/${giftWorld}?gift=${encodeURIComponent(g.id)}`)}>
            <span className="wf-gift-box" aria-hidden="true">🎁</span>
            <span className="wf-gift-text">
              <strong>{fc.giftFrom(g.fromName)}</strong>
              <span>{fc.openGift}</span>
            </span>
          </Link>
        </li>
      ))}
      <style>{CSS}</style>
    </ul>
  );
}

export function FriendsPanel({ user, lang, data, reload }: { user: User | null; lang: string; data: FriendsData | null; reload: () => Promise<void> }) {
  const fc = friendsCopy(lang);
  const href = useHref();
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const add = async () => {
    const c = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (c.length !== 6 || !user || busy) return;
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` },
        body: JSON.stringify({ action: "add", code: c }),
      });
      const j = (await r.json().catch(() => ({}))) as { error?: string };
      if (r.ok) { setMsg({ ok: true, text: fc.sent }); setCode(""); await reload(); }
      else setMsg({ ok: false, text: j.error === "self" ? fc.errSelf : j.error === "already" ? fc.errAlready : fc.errNotFound });
    } catch { setMsg({ ok: false, text: fc.errNotFound }); }
    setBusy(false);
  };

  const copy = async () => {
    if (!data) return;
    try { await navigator.clipboard.writeText(data.code); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { /* the code is on screen */ }
  };

  return (
    <section className="wf-panel" aria-labelledby="wf-title">
      <h2 id="wf-title" className="wf-title">👫 {fc.title}</h2>

      {!data ? <p className="wf-note"><WaitText text={worldCopy(lang).loading} /></p> : (
        <>
          <ul className="wf-list">
            {data.friends.length === 0 ? <li className="wf-note">{fc.empty}</li> : data.friends.map((f) => {
              const src = avatarUrl(f.avatar);
              const body = (
                <>
                  <span className="wf-av">
                    {src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={src} alt="" />
                    ) : <span aria-hidden="true">🙂</span>}
                  </span>
                  <span className="wf-name">
                    <strong>{f.name || "?"}</strong>
                    {f.status !== "active" ? <span>{fc.waiting}</span> : null}
                  </span>
                  {f.status === "active" ? <span className="wf-visit">{fc.visit}</span> : null}
                </>
              );
              return (
                <li key={f.uid}>
                  {f.status === "active"
                    ? <Link className="wf-friend" href={href(`/world/friend/${encodeURIComponent(f.uid)}`)}>{body}</Link>
                    : <div className="wf-friend is-wait">{body}</div>}
                </li>
              );
            })}
          </ul>

          <div className="wf-code">
            <span className="wf-label">{fc.myCode}</span>
            <div className="wf-code-row">
              <strong className="wf-code-val" dir="ltr">{data.code}</strong>
              <button type="button" className="wf-small" onClick={copy}>{copied ? fc.copied : fc.copy}</button>
            </div>
            <span className="wf-hint">{fc.codeHint}</span>
          </div>

          <form className="wf-add" onSubmit={(e) => { e.preventDefault(); void add(); }}>
            <input
              className="wf-input"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
              placeholder={fc.addPh}
              aria-label={fc.addPh}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              inputMode="text"
            />
            <button type="submit" className="wf-btn" disabled={code.length !== 6 || busy}>{fc.addBtn}</button>
          </form>
          {msg ? <p className={`wf-msg${msg.ok ? " is-ok" : ""}`} role="status">{msg.text}</p> : null}
        </>
      )}
      <style>{CSS}</style>
    </section>
  );
}

const CSS = `
.wf-panel{max-width:620px;margin:26px auto 0;background:#ffffffeb;color:#14202b;border-radius:22px;padding:16px;display:grid;grid-template-columns:minmax(0,1fr);gap:14px;box-shadow:0 10px 28px #0005}
.wf-title{margin:0;font-size:20px}
.wf-note{margin:0;color:#5f6b73;font-size:15px;list-style:none}
.wf-panel,.wf-panel *,.wf-gifts,.wf-gifts *{box-sizing:border-box}
.wf-gifts-top{max-width:620px;margin:0 auto 22px}
.wf-gifts,.wf-list{list-style:none;margin:0;padding:0;display:grid;gap:10px}
.wf-gift{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:16px;background:linear-gradient(135deg,#fff3c4,#ffe08a);color:#14202b;text-decoration:none;box-shadow:0 4px 0 #e3b341}
.wf-gift-box{font-size:34px;animation:wf-wiggle 1.6s ease-in-out infinite}
.wf-gift-text{display:grid;gap:2px}
.wf-gift-text strong{font-size:17px}
.wf-gift-text span{font-size:14px;color:#6b4e00}
@keyframes wf-wiggle{0%,70%,100%{transform:rotate(0)}75%{transform:rotate(-12deg)}85%{transform:rotate(10deg)}}
.wf-friend{display:flex;align-items:center;gap:12px;padding:8px 10px;min-width:0;border-radius:16px;background:#f1f6f5;color:inherit;text-decoration:none;min-height:56px}
.wf-friend.is-wait{opacity:.75}
.wf-av{width:44px;height:44px;border-radius:50%;overflow:hidden;background:#fff;display:grid;place-items:center;flex:0 0 44px;font-size:24px}
.wf-av img{width:100%;height:100%;object-fit:cover}
.wf-name{display:grid;gap:2px;flex:1;min-width:0}
.wf-name strong{font-size:17px}
.wf-name span{font-size:13px;color:#5f6b73}
.wf-visit{flex:0 0 auto;background:#0a7472;color:#fff;border-radius:999px;padding:8px 16px;font-weight:800;box-shadow:0 3px 0 #075452}
.wf-code{display:grid;gap:4px;padding-top:4px;border-top:1px solid #0001}
.wf-label{font-weight:700;font-size:15px}
.wf-code-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.wf-code-val{font-size:28px;letter-spacing:.18em;font-family:ui-monospace,Menlo,Consolas,monospace}
.wf-hint{font-size:13px;color:#5f6b73}
.wf-small{border:2px solid #0a7472;background:#fff;color:#0a7472;border-radius:999px;padding:6px 14px;font:inherit;font-weight:700;cursor:pointer;min-height:40px}
.wf-add{display:flex;gap:10px}
.wf-input{flex:1 1 0;width:0;min-width:0;min-height:48px;border-radius:14px;border:2px solid #cfdcda;padding:8px 14px;font-size:20px;letter-spacing:.14em;font-family:ui-monospace,Menlo,Consolas,monospace;text-transform:uppercase;background:#fff;color:#14202b}
.wf-input::placeholder{letter-spacing:normal;font-family:inherit;font-size:16px}
.wf-btn{min-height:48px;padding:0 20px;border:0;border-radius:14px;background:#0a7472;color:#fff;font:inherit;font-weight:800;cursor:pointer;box-shadow:0 4px 0 #075452}
.wf-btn:disabled{opacity:.5;cursor:default}
.wf-msg{margin:0;font-size:15px;color:#b42318}
.wf-msg.is-ok{color:#0a7a3d}
`;
