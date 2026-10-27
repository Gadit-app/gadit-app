/**
 * Web side of App Store purchases in the Gadit iOS app (ios-app/App.tsx,
 * server: lib/apple-iap.ts). The page never talks to StoreKit itself: it
 * asks the shell, and the shell answers with a "gadit-native-iap" event
 * carrying the same request id.
 *
 *   {type:"iap:products", id, skus}        → {id, ok, products:[{id, displayPrice, trial}]}
 *   {type:"iap:buy", id, sku, token}       → {id, ok, purchases:[...]} or {id, ok:false, error}
 *   {type:"iap:restore", id}               → {id, ok, purchases:[...]}
 *   {type:"iap:finish", transactionId}     (after the server said ok)
 *   {type:"iap:manage"}                    (Apple's subscription settings)
 *
 * A purchase that completes later (Ask to Buy, an interrupted purchase,
 * a renewal) arrives unasked as {id:"update", purchases:[...]};
 * NativeAppBridge sends those to the server too.
 */
import { postToNative, isIosApp, hasNativeBridge } from "@/lib/native-app";

export const APPLE_SKUS = {
  individual: { monthly: "com.gadit.app.individual.monthly", yearly: "com.gadit.app.individual.yearly" },
  family: { monthly: "com.gadit.app.family.monthly", yearly: "com.gadit.app.family.yearly" },
} as const;
export type AppleInterval = "monthly" | "yearly";

export type NativeProduct = { id: string; displayPrice: string; trial: boolean };
export type NativePurchase = { jws: string; productId: string; transactionId: string };
type Reply = { id: string; ok: boolean; products?: NativeProduct[]; purchases?: NativePurchase[]; error?: string };

/** The shell can sell (a build with purchases; the first build could not). */
export function canBuyInApp(): boolean {
  if (!isIosApp() || !hasNativeBridge()) return false;
  const n = (window as unknown as { GaditNative?: { iap?: boolean } }).GaditNative;
  return n?.iap === true;
}

function ask(msg: Record<string, unknown>, timeoutMs: number): Promise<Reply> {
  const id = Math.random().toString(36).slice(2, 12);
  return new Promise((resolve) => {
    const done = (r: Reply) => {
      window.removeEventListener("gadit-native-iap", onEvent);
      clearTimeout(timer);
      resolve(r);
    };
    const onEvent = (e: Event) => {
      const d = (e as CustomEvent<Reply>).detail;
      if (d?.id === id) done(d);
    };
    const timer = setTimeout(() => done({ id, ok: false, error: "timeout" }), timeoutMs);
    window.addEventListener("gadit-native-iap", onEvent);
    // The bridge's message type list is the shell's contract.
    postToNative({ ...msg, id } as unknown as Parameters<typeof postToNative>[0]);
  });
}

export async function fetchNativeProducts(): Promise<NativeProduct[]> {
  const r = await ask({ type: "iap:products", skus: Object.values(APPLE_SKUS).flatMap((k) => [k.monthly, k.yearly]) }, 15000);
  return r.ok && Array.isArray(r.products) ? r.products : [];
}

/** Buy; resolves when StoreKit is done (the purchase sheet can stay open a while). */
export function nativeBuy(sku: string, token: string): Promise<Reply> {
  return ask({ type: "iap:buy", sku, token }, 10 * 60 * 1000);
}

export function nativeRestore(): Promise<Reply> {
  return ask({ type: "iap:restore" }, 60000);
}

export function nativeFinish(transactionId: string): void {
  postToNative({ type: "iap:finish", transactionId });
}

export function nativeManageSubscriptions(): void {
  postToNative({ type: "iap:manage" });
}

/** Send each purchase to the server; finish the ones it accepted. */
export async function claimPurchases(purchases: NativePurchase[], idToken: string): Promise<{ ok: number; error: string | null }> {
  let ok = 0;
  let error: string | null = null;
  for (const p of purchases) {
    if (!p?.jws) continue;
    try {
      const res = await fetch("/api/apple/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ jws: p.jws }),
      });
      const j = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (res.ok && j.ok) {
        ok += 1;
        nativeFinish(p.transactionId);
      } else {
        error = j.error ?? "verify_failed";
      }
    } catch {
      error = "network";
    }
  }
  return { ok, error };
}
