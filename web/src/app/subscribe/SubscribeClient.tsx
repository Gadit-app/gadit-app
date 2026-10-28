"use client";

/**
 * /subscribe: the App Store plans inside the Gadit iOS app (Gadi 2026-10-27,
 * App Review 3.1.1). Individual and Family, priced by Apple in the viewer's
 * own currency, 14 days free, Restore purchases, and the auto-renew terms
 * Apple asks for. Anywhere else (the website, the Android Play app, an iOS
 * build without purchases) the page sends people away: the website sells
 * through /pricing, and the Play app sells nothing.
 */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BackLink } from "@/components/BackLink";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { readKidsMode } from "@/lib/use-kids-mode";
import { planCopy } from "@/lib/plan-copy";
import { isPlayModeClient } from "@/lib/play-copy";
import { subscribeCopy, fill } from "@/lib/subscribe-copy";
import {
  APPLE_SKUS, canBuyInApp, fetchNativeProducts, nativeBuy, nativeRestore, nativeManageSubscriptions, claimPurchases,
  type NativeProduct, type AppleInterval,
} from "@/lib/native-iap";

type Kind = keyof typeof APPLE_SKUS;

export function SubscribeClient() {
  const { user, plan, planReady, familyId, familyRole, setShowLoginModal } = useAuth();
  const { lang, dir } = useLang();
  const href = useHref();
  const router = useRouter();
  const c = subscribeCopy(lang);
  const [ready, setReady] = useState(false);
  const [products, setProducts] = useState<NativeProduct[] | null>(null);
  const [busy, setBusy] = useState<Kind | "restore" | null>(null);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [appleUser, setAppleUser] = useState(false);
  const [interval, setIntervalChoice] = useState<AppleInterval>("monthly");

  // Only inside an iOS build that can sell; kids never see a price.
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    if (!canBuyInApp() || familyRole === "kid" || readKidsMode()) {
      router.replace(isPlayModeClient() || familyRole === "kid" ? href("/") : href("/pricing"));
      return;
    }
    started.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read once from the device
    setReady(true);
    void fetchNativeProducts().then(setProducts);
  }, [familyRole, href, router]);

  const paid = planReady && !!user && plan !== "basic";

  useEffect(() => {
    // Whether the current plan is the App Store one (then "Manage" opens Apple's settings).
    if (!paid || !user) return;
    void (async () => {
      try {
        const { doc, getDoc } = await import("firebase/firestore");
        const { db } = await import("@/lib/firebase");
        const snap = await getDoc(doc(db, "users", user.uid));
        setAppleUser(snap.data()?.billingProvider === "apple");
      } catch { /* the button just stays hidden */ }
    })();
  }, [paid, user]);

  if (!ready) return null;

  const priceOf = (k: Kind) => products?.find((p) => p.id === APPLE_SKUS[k][interval]) ?? null;

  async function buy(k: Kind) {
    if (busy) return;
    if (!user) { setShowLoginModal(true); return; }
    const p = priceOf(k);
    if (!p) return;
    setBusy(k);
    setMsg(null);
    try {
      const idToken = await user.getIdToken();
      const t = await fetch("/api/apple/token", { headers: { Authorization: `Bearer ${idToken}` } });
      const { token } = (await t.json().catch(() => ({}))) as { token?: string };
      if (!token) throw new Error("token");
      const r = await nativeBuy(p.id, token);
      if (!r.ok) {
        setMsg({ text: r.error === "cancelled" ? c.cancelled : c.failed, ok: false });
        return;
      }
      const res = await claimPurchases(r.purchases ?? [], await user.getIdToken());
      if (res.ok) {
        setMsg({ text: k === "family" ? c.doneFamily : c.done, ok: true });
        setTimeout(() => router.push(href(k === "family" ? "/family" : "/")), 1800);
      } else {
        setMsg({ text: res.error === "other_account" ? c.otherAccount : c.failed, ok: false });
      }
    } catch {
      setMsg({ text: c.failed, ok: false });
    } finally {
      setBusy(null);
    }
  }

  async function restore() {
    if (busy) return;
    if (!user) { setShowLoginModal(true); return; }
    setBusy("restore");
    setMsg(null);
    try {
      const r = await nativeRestore();
      const list = r.purchases ?? [];
      if (!r.ok || !list.length) { setMsg({ text: c.restoredNone, ok: false }); return; }
      const res = await claimPurchases(list, await user.getIdToken());
      setMsg(res.ok ? { text: c.done, ok: true } : { text: res.error === "other_account" ? c.otherAccount : c.restoredNone, ok: false });
    } finally {
      setBusy(null);
    }
  }

  const plans: Array<{ k: Kind; name: string; sub: string; rows: string[] }> = [
    { k: "individual", name: c.individual, sub: planCopy(lang, "prIndSub"), rows: [planCopy(lang, "prRowCore"), planCopy(lang, "prRowImages"), planCopy(lang, "prRowSay"), planCopy(lang, "prRowPractice")] },
    { k: "family", name: c.family, sub: planCopy(lang, "prFamSub"), rows: [planCopy(lang, "prRowChildren"), planCopy(lang, "prRowParent"), planCopy(lang, "prRowHomework"), planCopy(lang, "prRowKidsFun")] },
  ];

  return (
    <main dir={dir} style={{ maxWidth: 560, margin: "0 auto", padding: "28px 16px 48px", display: "grid", gap: 18 }}>
      {/* The app has no browser Back button (Eyal's TestFlight run, 2026-10-28). */}
      <BackLink href={href("/")} anyPrevious style={{ justifySelf: "start", fontSize: 15, fontWeight: 600, color: "var(--ink-muted,#6B7280)", textDecoration: "none", padding: "6px 2px" }}>{c.back}</BackLink>
      <header style={{ display: "grid", gap: 6, textAlign: "center" }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, lineHeight: 1.2, color: "var(--ink,#0B1220)" }}>{c.title}</h1>
        <p style={{ margin: 0, fontSize: 15, color: "var(--ink-muted,#6B7280)" }}>{c.sub}</p>
      </header>

      {paid ? (
        <section style={{ background: "var(--surface,#fff)", border: "1px solid var(--hairline,#E5E7EB)", borderRadius: 16, padding: 20, textAlign: "center", display: "grid", gap: 12 }}>
          <div style={{ fontSize: 17, fontWeight: 700 }}>{fill(c.have, { plan: familyId ? c.family : c.individual })}</div>
          {appleUser && (
            <button type="button" onClick={nativeManageSubscriptions} style={btn(false)}>{c.manage}</button>
          )}
        </section>
      ) : (
        <>
          <div role="radiogroup" aria-label={c.title} style={{ display: "flex", justifyContent: "center", gap: 8 }}>
            {(["monthly", "yearly"] as const).map((v) => (
              <button key={v} type="button" role="radio" aria-checked={interval === v} onClick={() => setIntervalChoice(v)}
                style={{ padding: "8px 18px", borderRadius: 999, fontSize: 14.5, fontWeight: 700, cursor: "pointer",
                  border: "1.5px solid var(--teal,#0EA5A5)", background: interval === v ? "var(--teal,#0EA5A5)" : "transparent",
                  color: interval === v ? "#fff" : "var(--teal-deep,#0A7472)" }}>
                {v === "monthly" ? c.monthly : c.yearly}
              </button>
            ))}
          </div>
          {plans.map(({ k, name, sub, rows }) => {
            const p = priceOf(k);
            return (
              <section key={k} style={{ background: "var(--surface,#fff)", border: `1.5px solid ${k === "family" ? "var(--teal,#0EA5A5)" : "var(--hairline,#E5E7EB)"}`, borderRadius: 16, padding: 20, display: "grid", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "var(--ink,#0B1220)" }}>Gadit {name}</div>
                  <div style={{ fontSize: 14, color: "var(--ink-muted,#6B7280)" }}>{sub}</div>
                </div>
                <ul style={{ margin: 0, paddingInlineStart: 18, display: "grid", gap: 4, fontSize: 14.5, color: "var(--ink,#0B1220)" }}>
                  {rows.map((r) => <li key={r}>{r}</li>)}
                </ul>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink,#0B1220)" }}>
                  {products === null ? c.loading : p ? fill(interval === "yearly" ? (p.trial ? c.trialThenYear : c.perYear) : (p.trial ? c.trialThen : c.perMonth), { price: p.displayPrice }) : c.unavailable}
                </div>
                <button type="button" disabled={!p || !!busy} onClick={() => void buy(k)} style={btn(true, !p || !!busy)}>
                  {busy === k ? "…" : p?.trial ? c.startTrial : c.subscribe}
                </button>
              </section>
            );
          })}
          <button type="button" disabled={!!busy} onClick={() => void restore()} style={{ ...btn(false, !!busy), justifySelf: "center" }}>
            {busy === "restore" ? "…" : c.restore}
          </button>
        </>
      )}

      {msg && <p role="status" style={{ margin: 0, textAlign: "center", fontSize: 15, fontWeight: 600, color: msg.ok ? "var(--teal-deep,#0A7472)" : "#B91C1C" }}>{msg.text}</p>}
      {!user && <p style={{ margin: 0, textAlign: "center", fontSize: 14, color: "var(--ink-muted,#6B7280)" }}>{c.signIn}</p>}

      <footer style={{ display: "grid", gap: 8, fontSize: 12.5, lineHeight: 1.55, color: "var(--ink-muted,#6B7280)", textAlign: "center" }}>
        <p style={{ margin: 0 }}>{c.legal}</p>
        <p style={{ margin: 0 }}>
          <Link href={href("/terms")} style={{ color: "inherit", textDecoration: "underline" }}>{c.terms}</Link>
          {" · "}
          <Link href={href("/privacy")} style={{ color: "inherit", textDecoration: "underline" }}>{c.privacy}</Link>
        </p>
      </footer>
    </main>
  );
}

function btn(primary: boolean, disabled = false): React.CSSProperties {
  return {
    padding: "13px 18px", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: disabled ? "default" : "pointer",
    border: primary ? "none" : "1.5px solid var(--teal,#0EA5A5)",
    background: primary ? "var(--teal,#0EA5A5)" : "transparent",
    color: primary ? "#fff" : "var(--teal-deep,#0A7472)",
    opacity: disabled ? 0.6 : 1,
  };
}
