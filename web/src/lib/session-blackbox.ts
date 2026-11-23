/**
 * Black box for sessions that end on their own (Gadi 2026-11-23: signed out on
 * his computer three times in one day, in the middle of work; two of the three
 * left no error at Firebase, so the session was erased inside the browser).
 *
 * When a session ends without the person pressing "התנתקו", or a page loads
 * with no session although this browser had one, it records:
 * - which code called signOut (a short stack: our code, or Firebase's own
 *   logout after a rejected token), and the reason when our code knows it;
 * - the last failed answers from Firebase Auth in this tab (status and error
 *   code only: never the URL, a token or a request body);
 * - whether the stored session was still there when the page started (key
 *   names only, never the stored values);
 * - host, page (route names only), frame, parent or child profile, seconds
 *   since load, online, visible, minutes left on the token.
 * Sent to /api/auth/lost (collection authLost). Nothing shows on screen, and
 * every step is wrapped so it can never stand in the way of signing in.
 */
import type { Auth, User } from "firebase/auth";

const MARK = "gadit-session-mark"; // { uid, at } while signed in, shared by all tabs
const BY_USER = "gadit-signout-by-user"; // time "התנתקו" was pressed, seen by other tabs
const loadedAt = Date.now();
const tab = Math.random().toString(36).slice(2, 8);

type ApiFail = { api: string; status: number; code: string; at: number };
const fails: ApiFail[] = [];
let signOutCall: { stack: string; reason: string; at: number } | null = null;
let pendingReason = "";
let storedAtStart: "yes" | "no" | "no-db" | "unknown" = "unknown";
let prev: { uid: string; providers: string; exp: number } | null = null;
let firstEvent = true;

function safe<T>(f: () => T, fallback: T): T {
  try { return f(); } catch { return fallback; }
}

function shortStack(): string {
  const s = safe(() => new Error().stack || "", "");
  return s
    .split("\n")
    .slice(2, 14)
    .map((l) => l.trim().replace(/https?:\/\/[^/\s)]+/g, "").replace(/\?[^:\s)]*/g, ""))
    .join(" | ")
    .slice(0, 1500);
}

/** Route names only: a segment that is not plain ASCII (a word, a code) becomes "_". */
function pagePath(): string {
  return location.pathname
    .split("/")
    .map((p) => (/^[a-z0-9-]{0,40}$/i.test(p) ? p : "_"))
    .join("/")
    .slice(0, 160);
}

function noteFail(api: string, status: number, code: string) {
  fails.push({ api, status, code: code.slice(0, 80), at: Date.now() });
  if (fails.length > 8) fails.shift();
}

/** Our own deliberate sign-outs say why, just before calling signOut. */
export function noteSignOutReason(reason: string) {
  pendingReason = reason;
  if (reason === "user") safe(() => localStorage.setItem(BY_USER, String(Date.now())), undefined);
}

function readMark(): { uid?: string; at?: number } | null {
  return safe(() => {
    const raw = localStorage.getItem(MARK);
    return raw ? (JSON.parse(raw) as { uid?: string; at?: number }) : null;
  }, null);
}

function pressedRecently(): boolean {
  if (pendingReason === "user") return true;
  const t = safe(() => Number(localStorage.getItem(BY_USER) || 0), 0);
  return Date.now() - t < 30_000;
}

export function installSessionBlackbox(auth: Auth) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { __gaditBlackbox?: boolean };
  if (w.__gaditBlackbox) return;
  w.__gaditBlackbox = true;

  // 1. Every signOut on this Auth goes through here: ours (signOut(auth) calls
  //    the instance method) and Firebase's own logout of a rejected token.
  try {
    const a = auth as unknown as { signOut: () => Promise<void> };
    const original = a.signOut.bind(auth);
    a.signOut = () => {
      signOutCall = { stack: shortStack(), reason: pendingReason, at: Date.now() };
      return original();
    };
  } catch { /* leave signOut as it is */ }

  // 2. Failed answers from Firebase Auth (token refresh, account lookup).
  //    Firebase reads window.fetch at call time, so it goes through here.
  try {
    const originalFetch = window.fetch;
    const wrapped = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      const p = originalFetch.call(window, input, init);
      try {
        const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
        const m = url.match(/^https:\/\/(securetoken|identitytoolkit)\.googleapis\.com\/v\d+\/(?:projects\/[^/]+\/)?([a-zA-Z:]+)/);
        if (m) {
          const api = `${m[1]}:${m[2]}`.slice(0, 60);
          p.then(
            (res) => {
              if (res.ok) return;
              const copy = safe<Response | null>(() => res.clone(), null);
              if (!copy) { noteFail(api, res.status, ""); return; }
              copy.json().then(
                (j: { error?: { message?: string } }) => noteFail(api, res.status, String(j?.error?.message ?? "")),
                () => noteFail(api, res.status, ""),
              );
            },
            () => noteFail(api, 0, "network"),
          );
        }
      } catch { /* never in the way of the request */ }
      return p;
    };
    window.fetch = wrapped as typeof window.fetch;
  } catch { /* leave fetch as it is */ }

  // 3. Was a stored session there when this page started? Key names only.
  //    Never opens (and so never creates) the database when it is not there.
  void (async () => {
    try {
      if (typeof indexedDB === "undefined" || typeof indexedDB.databases !== "function") return;
      const list = await indexedDB.databases();
      if (!list.some((d) => d.name === "firebaseLocalStorageDb")) { storedAtStart = "no-db"; return; }
      const req = indexedDB.open("firebaseLocalStorageDb");
      req.onupgradeneeded = () => { safe(() => req.transaction?.abort(), undefined); };
      req.onsuccess = () => {
        const db = req.result;
        try {
          if (!db.objectStoreNames.contains("firebaseLocalStorage")) { storedAtStart = "no"; db.close(); return; }
          const keys = db.transaction("firebaseLocalStorage", "readonly").objectStore("firebaseLocalStorage").getAllKeys();
          keys.onsuccess = () => {
            storedAtStart = keys.result.some((k) => String(k).startsWith("firebase:authUser:")) ? "yes" : "no";
            db.close();
          };
          keys.onerror = () => db.close();
        } catch { safe(() => db.close(), undefined); }
      };
    } catch { /* stays unknown */ }
  })();
}

function send(kind: "lost" | "lost-at-load", uid: string, extra: Record<string, unknown>) {
  const t = Date.now();
  const call = signOutCall && t - signOutCall.at < 20_000 ? signOutCall : null;
  const body = JSON.stringify({
    kind,
    uid,
    child: uid.includes("_"),
    tab,
    reason: call?.reason || "",
    signOutStack: call?.stack || "",
    signOutAgoMs: call ? t - call.at : null,
    fails: fails
      .filter((f) => t - f.at < 15 * 60_000)
      .map((f) => ({ api: f.api, status: f.status, code: f.code, agoSec: Math.round((t - f.at) / 1000) })),
    storedAtStart,
    host: location.hostname,
    path: pagePath(),
    inFrame: safe(() => window.parent !== window, false),
    visible: document.visibilityState,
    online: navigator.onLine,
    sinceLoadSec: Math.round((t - loadedAt) / 1000),
    build: (process.env.NEXT_PUBLIC_BUILD_ID || "").slice(0, 12),
    ...extra,
  });
  try {
    if (navigator.sendBeacon && navigator.sendBeacon("/api/auth/lost", new Blob([body], { type: "application/json" }))) return;
  } catch { /* fall back to fetch */ }
  void fetch("/api/auth/lost", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
}

/** Called on every Firebase auth state change (lib/auth-context.tsx). */
export function blackboxOnAuth(u: User | null) {
  if (typeof window === "undefined") return;
  const first = firstEvent;
  firstEvent = false;
  try {
    if (u) {
      const mine = { uid: u.uid, providers: u.providerData.map((p) => p.providerId).join("+") || "custom", exp: 0 };
      prev = mine;
      u.getIdTokenResult().then((r) => { mine.exp = Date.parse(r.expirationTime) || 0; }, () => {});
      safe(() => localStorage.setItem(MARK, JSON.stringify({ uid: u.uid, at: Date.now() })), undefined);
      return;
    }
    const byUser = pressedRecently();
    if (prev) {
      if (!byUser) {
        send("lost", prev.uid, {
          providers: prev.providers,
          tokenLeftMin: prev.exp ? Math.round((prev.exp - Date.now()) / 60_000) : null,
        });
      }
      prev = null;
      safe(() => localStorage.removeItem(MARK), undefined);
    } else if (first) {
      const m = readMark();
      if (m?.uid && !byUser) {
        send("lost-at-load", String(m.uid), { lastSeenMinAgo: m.at ? Math.round((Date.now() - Number(m.at)) / 60_000) : null });
      }
      safe(() => localStorage.removeItem(MARK), undefined);
    }
    pendingReason = "";
  } catch { /* never in the way */ }
}
