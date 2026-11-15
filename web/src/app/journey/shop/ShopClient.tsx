"use client";

/**
 * The shop of the journey (Gadi 2026-11-15).
 *
 * The child's runner stands in a window and turns slowly. Under it, four
 * shelves: shirt, hat, on the back, companion. Tapping a thing puts it on the
 * runner in the window (trying on is free); a thing the child owns is worn at
 * once, a thing not yet owned shows its price and a button to buy it.
 *
 * The coins are those of the words the child knows, less what was spent. A
 * bought thing is the child's for good. No money, no timer, no surprise box.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { GaditBrand } from "@/components/BrandMark";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { sfx } from "@/lib/game-sfx";
import { DEFAULT_LOOK, SHOP, SLOTS, owns, shopItem, type Look, type Slot } from "@/lib/journey/shop";
import { JRN_CSS, zone, type Data } from "../JourneyClient";
import { startPreview, type PreviewHandle } from "../run/figure";

type Copy = {
  title: string; coins: string; slots: Record<Slot, string>; free: string; mine: string; wearing: string;
  buy: (n: number) => string; short: (n: number) => string; how: string; back: string; run: string;
  signIn: string; loading: string; failed: string; retry: string; bought: string; price: (n: number) => string;
  earn: (n: number) => string; earnMore: (n: number) => string;
};
const COPY: Record<"he" | "en", Copy> = {
  he: {
    title: "החנות", coins: "מטבעות", slots: { shirt: "חולצה", hat: "כובע", back: "על הגב", pet: "חיה מלווה" },
    free: "חינם", mine: "שלי", wearing: "עליי עכשיו",
    buy: (n) => `קונים ב-${n} מטבעות`, short: (n) => (n === 1 ? "חסר עוד מטבע אחד" : `חסרים עוד ${n} מטבעות`),
    how: "מטבעות מקבלים על כל מילה שיודעים. מה שקונים נשאר שלכם לתמיד",
    back: "חזרה לקלפים שלי", run: "רצים אל המבצר",
    signIn: "כדי להיכנס לחנות צריך להתחבר", loading: "פותחים את החנות", failed: "החנות לא נטענה", retry: "לנסות שוב",
    bought: "קניתם! זה שלכם לתמיד", price: (n) => `${n} מטבעות`,
    earn: (n) => `ב-${n} מילים`, earnMore: (n) => (n === 1 ? "עוד מילה אחת באוסף, וזה שלכם. את זה לא קונים" : `עוד ${n} מילים באוסף, וזה שלכם. את זה לא קונים`),
  },
  en: {
    title: "The shop", coins: "coins", slots: { shirt: "Shirt", hat: "Hat", back: "On the back", pet: "Companion" },
    free: "Free", mine: "Mine", wearing: "Wearing now",
    buy: (n) => `Buy for ${n} coins`, short: (n) => (n === 1 ? "One more coin needed" : `${n} more coins needed`),
    how: "You get coins for every word you know. What you buy is yours for good",
    back: "Back to my cards", run: "Run to the fortress",
    signIn: "Sign in to enter the shop", loading: "Opening the shop", failed: "The shop did not load", retry: "Try again",
    bought: "Bought! It is yours for good", price: (n) => `${n} coins`,
    earn: (n) => `At ${n} words`, earnMore: (n) => (n === 1 ? "One more word in your collection and it is yours. This one is not for sale" : `${n} more words in your index and it is yours. This one is not for sale`),
  },
};

export function ShopClient({ demo = false }: { demo?: boolean }) {
  const { user: realUser, loading: authLoading } = useAuth();
  // The sample shop (?demo=1): 500 coins and 30 words to try things with. Nothing is read or saved.
  const user = demo ? null : realUser;
  const { lang, dir } = useLang();
  const c = COPY[lang === "he" ? "he" : "en"];
  const [state, setState] = useState<"loading" | "ready" | "failed">(demo ? "ready" : "loading");
  const [earned, setEarned] = useState(demo ? 500 : 0);
  const [owned, setOwned] = useState<string[]>([]);
  const [look, setLook] = useState<Look>(DEFAULT_LOOK);
  const [spent, setSpent] = useState(0);
  // Words in the index: some things are earned by them, not bought.
  const [known, setKnown] = useState(demo ? 30 : 0);
  const [slot, setSlot] = useState<Slot>("hat");
  // The thing being tried on in the window (not bought yet), if any.
  const [trying, setTrying] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [justBought, setJustBought] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const preview = useRef<PreviewHandle | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/journey?tz=${encodeURIComponent(zone())}&ui=${encodeURIComponent(lang)}`, { headers: { Authorization: `Bearer ${await user.getIdToken()}` } });
      if (!res.ok) throw new Error(String(res.status));
      const d = (await res.json()) as Data;
      setEarned(d.coins);
      setOwned(d.shop?.owned ?? []);
      setLook({ ...DEFAULT_LOOK, ...(d.shop?.look ?? {}) });
      setSpent(d.shop?.spent ?? 0);
      setKnown(d.summary?.index ?? 0);
      setState("ready");
    } catch { setState("failed"); }
  }, [user, lang]);
  useEffect(() => { const id = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(id); }, [load]);

  // What the window shows: the worn look, with the thing being tried on.
  const shown = useMemo((): Look => { const it = trying ? shopItem(trying) : undefined; return it ? { ...look, [it.slot]: it.id } : look; }, [look, trying]);
  const ready = (!!user || demo) && state === "ready";
  useEffect(() => {
    if (!ready || !canvasRef.current) return;
    let gone = false;
    void startPreview(canvasRef.current, shown).then((h) => { if (gone) h.dispose(); else preview.current = h; }).catch(() => undefined);
    return () => { gone = true; preview.current?.dispose(); preview.current = null; };
    // The window is built once; a new look is handed to it below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);
  useEffect(() => { preview.current?.setLook(shown); }, [shown]);

  const balance = Math.max(0, earned - spent);
  const tried = trying ? shopItem(trying) : undefined;

  async function send(body: { buy?: string; wear?: string }): Promise<boolean> {
    if (demo) {
      const it = shopItem(body.buy ?? body.wear ?? "");
      if (!it) return false;
      if (body.buy) { setOwned((o) => [...o, it.id]); setSpent((x) => x + it.price); }
      setLook((l) => ({ ...l, [it.slot]: it.id }));
      return true;
    }
    if (!user) return false;
    setBusy(true);
    try {
      const res = await fetch("/api/journey", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` }, body: JSON.stringify(body) });
      const d = (await res.json()) as { ok?: boolean; shop?: { owned: string[]; look: Look; spent: number } };
      if (d.shop) { setOwned(d.shop.owned); setLook({ ...DEFAULT_LOOK, ...d.shop.look }); setSpent(d.shop.spent); }
      return !!d.ok;
    } catch { return false; } finally { setBusy(false); }
  }

  function tap(id: string) {
    if (busy) return;
    sfx.tap();
    setJustBought(false);
    if (owns(owned, id, known)) { setTrying(null); const it = shopItem(id); if (it && look[it.slot] !== id) { setLook({ ...look, [it.slot]: id }); void send({ wear: id }); } return; }
    setTrying(id);
  }
  async function buy() {
    if (!tried || tried.need || busy || balance < tried.price) return;
    const ok = await send({ buy: tried.id });
    if (ok) { sfx.win(); setTrying(null); setJustBought(true); } else sfx.wrong();
  }

  return (
    <div className="wordbook jrn shop" dir={dir}>
      <style>{JRN_CSS}</style>
      <style>{SHOP_CSS}</style>
      <div className="jrn-wrap">
        {!demo && !authLoading && !user && <p className="jrn-note">{c.signIn}</p>}
        {user && state === "loading" && <p className="jrn-note">{c.loading}…</p>}
        {user && state === "failed" && (
          <p className="jrn-note">{c.failed} <button type="button" className="jrn-btn is-ghost" onClick={() => { setState("loading"); void load(); }}>{c.retry}</button></p>
        )}

        {ready && (
          <>
            {/* The way back sits at the top (Gadi 2026-11-15: "I looked for the back button"). */}
            <header className="jrn-head shop-head">
              <Link className="jrn-back" href={demo ? "/journey?demo=1" : "/journey"}><span aria-hidden="true">{dir === "rtl" ? "→" : "←"}</span> {c.back}</Link>
              <h1 className="jrn-title">{c.title}</h1>
              <span className="shop-brand-narrow"><GaditBrand /></span>
              <div className="shop-head-end">
                <div className="jrn-coins" title={c.coins}><span aria-hidden="true">●</span> {balance} {c.coins}</div>
                <Link className="jrn-btn shop-run" href={demo ? "/journey/run?demo=1" : "/journey/run"}>{c.run}</Link>
                <span className="shop-brand-wide"><GaditBrand /></span>
              </div>
            </header>

            {/* One screen (Gadi 2026-11-15): the figure stands beside the shelves, so a
                thing tried on is seen while the shelves scroll in their own place. */}
            <div className="shop-layout">
            <div className="shop-stage">
            <div className="shop-window"><canvas ref={canvasRef} className="shop-canvas" /></div>

            <div className="shop-act" aria-live="polite">
              {tried ? (
                tried.need ? <span className="shop-short">{c.earnMore(Math.max(1, tried.need - known))}</span>
                : balance >= tried.price
                  ? <button type="button" className="jrn-btn" onClick={() => void buy()} disabled={busy}>{c.buy(tried.price)}</button>
                  : <span className="shop-short">{c.short(tried.price - balance)}</span>
              ) : justBought ? <span className="shop-ok">{c.bought}</span> : <span className="jrn-small">{c.how}</span>}
            </div>
            </div>

            <div className="shop-side">
            <div className="shop-tabs" role="tablist">
              {SLOTS.map((s) => (
                <button key={s} type="button" role="tab" aria-selected={slot === s} className={`shop-tab${slot === s ? " is-on" : ""}`} onClick={() => { sfx.tap(); setSlot(s); setTrying(null); setJustBought(false); }}>{c.slots[s]}</button>
              ))}
            </div>

            <div className="shop-scroll">
            <div className="shop-grid">
              {SHOP.filter((i) => i.slot === slot).map((i) => {
                const mine = owns(owned, i.id, known);
                const on = look[i.slot] === i.id && !trying;
                const sel = trying === i.id;
                return (
                  <button key={i.id} type="button" className={`shop-item${on ? " is-on" : ""}${sel ? " is-try" : ""}`} onClick={() => tap(i.id)} aria-pressed={on || sel}>
                    <span className="shop-icon" aria-hidden="true" style={i.color !== undefined ? { color: `#${i.color.toString(16).padStart(6, "0")}` } : undefined}>{i.icon}</span>
                    <span className="shop-name">{lang === "he" ? i.he : i.en}</span>
                    <span className={`shop-tag${mine ? " is-mine" : ""}`}>{on ? c.wearing : mine ? (i.price === 0 && !i.need ? c.free : c.mine) : i.need ? c.earn(i.need) : c.price(i.price)}</span>
                  </button>
                );
              })}
            </div>
            </div>

            </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const SHOP_CSS = `
.shop .jrn-wrap { max-width: 1120px; height: 100dvh; padding-block: 12px; display: grid; grid-template-rows: auto minmax(0, 1fr); gap: 12px; overflow: hidden; }
.shop .jrn-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; }
.shop-layout { display: grid; grid-template-columns: minmax(280px, 440px) minmax(0, 1fr); gap: 22px; min-height: 0; }
.shop-stage { display: grid; grid-template-rows: minmax(0, 1fr) auto; gap: 10px; min-height: 0; }
.shop-window { width: 100%; height: 100%; min-height: 0; border-radius: 24px; background: radial-gradient(ellipse at 50% 30%, #ffffff 0, #dff3ff 45%, #c7e7da 100%); box-shadow: 0 0 0 1px rgba(10,116,114,.12) inset, 0 12px 30px rgba(20,32,43,.12); overflow: hidden; }
.shop-canvas { width: 100%; height: 100%; display: block; }
.shop-act { min-height: 52px; display: flex; align-items: center; justify-content: center; text-align: center; }
.shop-short { font-weight: 700; color: #8a5a00; background: #fff3c4; padding: 8px 18px; border-radius: 999px; }
.shop-ok { font-weight: 800; color: #0a6b3b; }
.shop-side { display: grid; grid-template-rows: auto minmax(0, 1fr); gap: 12px; min-height: 0; }
.shop-tabs { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
.shop-tab { min-height: 44px; padding: 8px 18px; border: 0; border-radius: 999px; background: var(--j-surface); color: var(--j-ink); font: inherit; font-weight: 700; font-size: 16px; cursor: pointer; box-shadow: 0 0 0 2px var(--j-line) inset; }
.shop-tab.is-on { background: var(--j-teal); color: #fff; box-shadow: none; }
.shop-scroll { min-height: 0; overflow-y: auto; padding: 4px; border-radius: 18px; overscroll-behavior: contain; }
.shop-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px; align-content: start; }
.shop-item { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 10px 6px; border: 0; border-radius: 16px; background: var(--j-surface); color: var(--j-ink); font: inherit; cursor: pointer; box-shadow: 0 0 0 2px var(--j-line) inset; min-width: 0; }
.shop-item.is-try { box-shadow: 0 0 0 3px #e0a100 inset; }
.shop-item.is-on { box-shadow: 0 0 0 3px var(--j-teal) inset; }
.shop-icon { font-size: 32px; line-height: 1.1; }
.shop-name { font-weight: 700; font-size: 14px; text-align: center; }
.shop-tag { font-size: 12.5px; font-weight: 700; color: #8a5a00; background: #fff3c4; padding: 2px 10px; border-radius: 999px; font-variant-numeric: tabular-nums; }
.shop-tag.is-mine { color: var(--j-teal); background: transparent; }
.shop-head { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; }
.shop-head .jrn-title { font-size: clamp(22px, 4vw, 30px); }
.shop-head-end { display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-end; gap: 8px; }
.shop-brand-narrow { display: none; }
.shop-run { min-height: 40px; padding: 6px 18px; font-size: 15px; }
/* A phone: the figure on top, the shelves under it, each in its own part of the screen. */
@media (max-width: 760px) {
  .shop .jrn-wrap { padding-block: 8px; gap: 8px; }
  .shop-head { grid-template-columns: auto 1fr auto; }
  .shop-brand-narrow { display: inline-flex; }
  .shop .jrn-head { flex-wrap: wrap; }
  .shop .jrn-head .jrn-back { padding-inline: 10px; font-size: 13.5px; }
  .shop-head .jrn-title { font-size: 21px; }
  .shop-brand-wide { display: none; }
  .shop-head .jrn-title { text-align: center; }
  .shop-head-end { grid-column: 1 / -1; justify-content: center; }
  .shop-layout { grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(150px, 34dvh) minmax(0, 1fr); gap: 8px; }
  .shop-act { min-height: 44px; }
  .shop-grid { grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 8px; }
  .shop-tab { min-height: 38px; padding: 6px 14px; font-size: 15px; }
}
`;
