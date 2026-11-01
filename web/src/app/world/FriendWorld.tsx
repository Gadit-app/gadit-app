"use client";

/**
 * A friend's world (Gadi 2026-11-01): the child visits an approved
 * friend's clearing, read only, picks which of the friend's worlds to look
 * at, and can send one of their own spelled words as a gift. Nothing to
 * type, nothing to say: only words.
 */
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { WORLDS, WORLD_ICON, WORLD_ORDER, isWorldId, type WorldId } from "@/lib/world/worlds";
import { worldCopy } from "@/lib/world/world-i18n";
import { friendsCopy } from "@/lib/world/friends-i18n";
import { RTL_SPELL } from "@/lib/world/letters";
import { WaitText } from "@/components/WaitText";
import { sfx } from "@/lib/game-sfx";
import { Clearing, CSS, type Decor, type WorldItem } from "./WorldClient";

type Visit = { name: string; avatar: string | null; worlds: Record<string, { items: WorldItem[]; decor?: Decor[] }> };

export function FriendWorld({ uid, demo }: { uid: string; demo?: { visit: Visit; mine: WorldItem[] } }) {
  const { user, loading, promptLogin } = useAuth();
  const { lang } = useLang();
  const href = useHref();
  const router = useRouter();
  const c = worldCopy(lang);
  const fc = friendsCopy(lang);
  const [visit, setVisit] = useState<Visit | null>(demo?.visit ?? null);
  const [failed, setFailed] = useState(false);
  const [mine, setMine] = useState<WorldItem[] | null>(demo?.mine ?? null);
  const [picked, setPicked] = useState<WorldId | null>(null);
  const [picking, setPicking] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (demo || loading) return;
    if (!user) { promptLogin(c.mapTitle); return; }
    let alive = true;
    (async () => {
      try {
        const token = await user.getIdToken();
        const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
        const [v, w] = await Promise.all([
          fetch("/api/friends", { method: "POST", headers, body: JSON.stringify({ action: "visit", uid }) }),
          fetch("/api/world", { headers }),
        ]);
        if (!alive) return;
        if (!v.ok) { setFailed(true); return; }
        setVisit((await v.json()) as Visit);
        const wj = w.ok ? ((await w.json()) as { worlds?: Record<string, { items?: WorldItem[] }> }) : null;
        // Every word the child spelled, once, newest first.
        const all = Object.values(wj?.worlds ?? {}).flatMap((x) => x.items ?? []);
        const seen = new Set<string>();
        setMine(all.sort((a, b) => b.at - a.at).filter((x) => { const k = `${x.lang}:${x.w}`; if (seen.has(k)) return false; seen.add(k); return true; }));
      } catch { if (alive) setFailed(true); }
    })();
    return () => { alive = false; };
  }, [demo, loading, user, uid, promptLogin, c.mapTitle]);

  const withWords = useMemo(() => WORLD_ORDER.filter((k) => isWorldId(k) && ((visit?.worlds[k]?.items?.length ?? 0) + (visit?.worlds[k]?.decor?.length ?? 0)) > 0) as WorldId[], [visit]);
  const worldId: WorldId = picked ?? withWords[0] ?? "jungle";
  const items = visit?.worlds[worldId]?.items ?? [];

  const send = async (x: WorldItem) => {
    setPicking(false);
    if (demo) { setToast(fc.giftSent(visit?.name ?? "")); sfx.win(); return; }
    if (!user) return;
    try {
      const r = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` },
        body: JSON.stringify({ action: "gift", uid, w: x.w, lang: x.lang }),
      });
      if (r.ok) { setToast(fc.giftSent(visit?.name ?? "")); sfx.win(); }
      else setToast(r.status === 429 ? fc.giftLimit : fc.errNotFound);
    } catch { setToast(fc.errNotFound); }
    setTimeout(() => setToast(null), 3200);
  };

  if (failed) {
    return (
      <div className="wt-root fw-center"><style>{CSS + FW_CSS}</style>
        <p>{fc.errNotFound}</p>
        <button type="button" className="wt-btn" onClick={() => router.push(href("/world"))}>🗺️ {c.mapTitle}</button>
      </div>
    );
  }
  if (!visit) return <div className="wt-root fw-center"><style>{CSS + FW_CSS}</style><WaitText text={c.loading} live /></div>;

  const foot = (
    <div className="fw-foot">
      {withWords.length > 1 ? (
        <div className="fw-tabs" role="tablist">
          {withWords.map((k) => (
            <button key={k} type="button" role="tab" aria-selected={k === worldId} className="fw-tab" onClick={() => setPicked(k)} aria-label={c.worlds[k].title}>
              {WORLD_ICON[k]}
            </button>
          ))}
        </div>
      ) : null}
      {items.length === 0 ? <div className="wt-area">{fc.noWords}</div> : null}
      {toast ? <div className="wt-arrived" role="status">{toast}</div> : null}
      <div className="wt-row">
        <button type="button" className="wt-btn" onClick={() => setPicking(true)}>🎁 {fc.sendGift}</button>
        <button type="button" className="wt-btn is-ghost" onClick={() => router.push(href("/world"))}>🗺️ {c.mapTitle}</button>
      </div>
    </div>
  );

  return (
    <div className="wt-root" style={{ position: "fixed", inset: 0 }}>
      <style>{CSS + FW_CSS}</style>
      <Clearing
        world={WORLDS[worldId]}
        c={c}
        items={items}
        fresh={null}
        onNext={() => undefined}
        onBack={() => router.push(href("/world"))}
        ui={lang}
        onLayout={() => undefined}
        visit={{ title: `${WORLD_ICON[worldId]} ${fc.friendWorld(visit.name)}`, foot }}
        bank={{ left: 0, decor: visit.worlds[worldId]?.decor ?? [] }}
      />
      {picking ? (
        <div className="fw-sheet-wrap" onClick={() => setPicking(false)}>
          <div className="fw-sheet" role="dialog" aria-label={fc.pickGift} onClick={(e) => e.stopPropagation()}>
            <strong className="fw-sheet-title">{fc.pickGift}</strong>
            {!mine ? <WaitText text={c.loading} /> : mine.length === 0 ? <p className="fw-empty">{fc.noGiftWords}</p> : (
              <div className="fw-words">
                {mine.map((x) => (
                  <button key={`${x.lang}:${x.w}`} type="button" className="fw-word" onClick={() => void send(x)}>
                    {x.pic ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={x.pic} alt="" />
                    ) : <span aria-hidden="true">🌱</span>}
                    <span dir={RTL_SPELL.has(x.lang) ? "rtl" : "ltr"}>{x.w}</span>
                  </button>
                ))}
              </div>
            )}
            <button type="button" className="wt-btn is-ghost" onClick={() => setPicking(false)}>{c.back}</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const FW_CSS = `
.fw-center{position:fixed;inset:0;display:grid;place-content:center;gap:14px;justify-items:center;background:#16533c;color:#fff;font-size:18px}
.fw-foot{display:grid;gap:10px;justify-items:center}
.fw-tabs{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
.fw-tab{width:48px;height:48px;border-radius:50%;border:3px solid #fff;background:#ffffffcc;font-size:24px;cursor:pointer}
.fw-tab[aria-selected="true"]{background:#0a7472;box-shadow:0 4px 0 #075452}
.fw-sheet-wrap{position:fixed;inset:0;z-index:20;background:#0007;display:grid;align-items:end;justify-items:center}
.fw-sheet{width:min(560px,100%);max-height:75vh;overflow:auto;background:#fff;color:#14202b;border-radius:24px 24px 0 0;padding:18px 16px calc(18px + env(safe-area-inset-bottom,0px));display:grid;gap:14px;justify-items:center}
.fw-sheet-title{font-size:20px}
.fw-empty{margin:0;color:#5f6b73;text-align:center}
.fw-words{display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:10px;width:100%}
.fw-word{display:grid;justify-items:center;gap:4px;padding:8px 6px;border:2px solid #e3ecea;border-radius:16px;background:#f7fbfa;font:inherit;font-weight:800;font-size:14px;cursor:pointer;min-height:44px}
.fw-word img,.fw-word>span:first-child{width:56px;height:56px;border-radius:50%;object-fit:cover;display:grid;place-items:center;font-size:28px;background:#fff}
.fw-word:active{transform:scale(.97)}
`;
