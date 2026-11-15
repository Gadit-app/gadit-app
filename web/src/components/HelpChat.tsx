"use client";

/**
 * The help assistant's window (Gadi 2026-11-15, built on the Yooniz advisor;
 * the council's guardrails). A round button in the bottom corner on the
 * reading side opens a chat: a greeting, six common questions, answers from
 * the knowledge base in the user's language, one link to the right guide or
 * page, "helpful / not helpful" under each answer, and a hand-off to a person
 * by email when the assistant cannot help.
 *
 * Shown only when the server says so (GET /api/help-chat: the switch in
 * config/helpChat, testers first). Never for a child profile, in Kids Mode,
 * signed out, in a game, in the fortress, at checkout or in the admin.
 * Opens on its own with ?help=1 in the address, or on the window event
 * "gadit:open-help".
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { useKidsMode } from "@/lib/use-kids-mode";
import { isIosApp } from "@/lib/native-app";
import { linkTarget } from "@/lib/help-chat/links";
import { setHelpReady } from "@/lib/help-chat/ready";
import { HELP_UI_EN, HELP_UI_HE, type HelpUi } from "@/lib/help-chat/ui-base";

// A local build only (NEXT_PUBLIC_BUILD_ID "dev"), with ?helpdemo=1: the window
// opens without signing in and answers with a sample, to look at the layout.
const DEV = process.env.NEXT_PUBLIC_BUILD_ID === "dev";
const SAMPLE_HE = "ב'המשפחה שלי', בלשונית 'בני המשפחה', לוחצים **'חיבור מכשיר'** בכרטיס של הילד. במכשיר של הילד סורקים את קוד ה-QR, או נכנסים ל-gadit.app/join ומקלידים את הקוד בן 6 הספרות.";
const SAMPLE_EN = "In 'My family', open the 'Family members' tab and tap **'Connect device'** on your child's card. On the child's device, scan the QR code, or open gadit.app/join and type the 6 digit code.";

type Msg = { role: "user" | "assistant"; content: string; linkId?: string; logId?: string; handoff?: boolean; email?: string; note?: "limit" | "error"; helped?: boolean };

// Where the window stays out of the way: games, the fortress, checkout, admin, a child's own screens.
const HIDDEN = /^\/(play|world|duel|catch|journey|checkout|admin|kids|join|auth|c|tester|say)(\/|$)/;

function Bold({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return <>{parts.map((p, i) => (p.startsWith("**") && p.endsWith("**") ? <b key={i}>{p.slice(2, -2)}</b> : <span key={i}>{p}</span>))}</>;
}

export function HelpChat() {
  const { user, familyRole } = useAuth();
  const [kidsMode] = useKidsMode();
  const { lang, dir } = useLang();
  const href = useHref();
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const bare = pathname.replace(/^\/[a-z]{2}(?:-[A-Za-z]{2,4})?(?=\/|$)/, "") || "/";
  const hiddenHere = HIDDEN.test(bare);

  const [cfg, setCfg] = useState<{ ui: HelpUi; email: string; test: boolean } | null>(null);
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [showFaq, setShowFaq] = useState(true);
  const convId = useRef("");
  const listRef = useRef<HTMLDivElement | null>(null);

  const kid = familyRole === "kid" || kidsMode;
  // Tell the contact page and the cancel flow that the assistant can be offered.
  useEffect(() => { setHelpReady(cfg && user && !kid ? cfg.ui : null); }, [cfg, user, kid]);
  const [demo, setDemo] = useState(false);
  useEffect(() => {
    if (!DEV) return;
    const id = window.setTimeout(() => {
      const mode = new URLSearchParams(window.location.search).get("helpdemo");
      if (mode) {
        const ui = lang === "he" ? HELP_UI_HE : HELP_UI_EN;
        setDemo(true);
        setCfg({ ui, email: "parent@example.com", test: true });
        setOpen(true);
        // ?helpdemo=talk: a sample exchange, an answer with a guide and a hand-off.
        if (mode === "talk") {
          setShowFaq(false);
          setMsgs([
            { role: "user", content: ui.starters[0] },
            { role: "assistant", content: lang === "he" ? SAMPLE_HE : SAMPLE_EN, linkId: "guide:pair", logId: "demo" },
            { role: "user", content: lang === "he" ? "חייבו אותי פעמיים החודש" : "I was charged twice this month" },
            { role: "assistant", content: "", handoff: true, email: "parent@example.com" },
          ]);
        }
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, [lang]);

  // Is the assistant on for this user? The server decides; asked once per user and language.
  useEffect(() => {
    if (!user || kid) return;
    let gone = false;
    void (async () => {
      try {
        const res = await fetch(`/api/help-chat?lang=${encodeURIComponent(lang)}`, { headers: { Authorization: `Bearer ${await user.getIdToken()}` } });
        const j = (await res.json()) as { enabled?: boolean; ui?: HelpUi; email?: string; test?: boolean };
        if (!gone) setCfg(j.enabled && j.ui ? { ui: j.ui, email: j.email ?? "", test: !!j.test } : null);
      } catch { if (!gone) setCfg(null); }
    })();
    return () => { gone = true; };
  }, [user, kid, lang]);

  // Open from a link (?help=1) or from anywhere in the app. The address is read
  // directly (as GuideOverlay does), so the root layout needs no Suspense.
  useEffect(() => {
    const t = window.setTimeout(() => {
      try { if (new URLSearchParams(window.location.search).get("help") === "1") setOpen(true); } catch { /* no address */ }
    }, 0);
    const onOpen = () => setOpen(true);
    window.addEventListener("gadit:open-help", onOpen);
    return () => { window.clearTimeout(t); window.removeEventListener("gadit:open-help", onOpen); };
  }, [pathname]);

  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }); }, [msgs, busy]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const ask = useCallback(async (q: string) => {
    const question = q.trim();
    if (!question || busy) return;
    if (demo) {
      setMsgs((m) => [...m, { role: "user", content: question }]); setText(""); setShowFaq(false); setBusy(true);
      window.setTimeout(() => {
        setBusy(false);
        const handoff = /חיוב|החזר|refund|charge/i.test(question);
        setMsgs((m) => [...m, handoff ? { role: "assistant", content: "", handoff: true, email: "parent@example.com" } : { role: "assistant", content: lang === "he" ? SAMPLE_HE : SAMPLE_EN, linkId: "guide:pair", logId: "demo" }]);
      }, 700);
      return;
    }
    if (!user) return;
    if (!convId.current) convId.current = Math.random().toString(36).slice(2, 12);
    const next: Msg[] = [...msgs, { role: "user", content: question }];
    setMsgs(next); setText(""); setBusy(true); setShowFaq(false);
    const platform = isIosApp() ? "ios" : document.documentElement.getAttribute("data-play") === "1" ? "play" : "web";
    try {
      const res = await fetch("/api/help-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` },
        body: JSON.stringify({
          lang, platform, convId: convId.current, kidsMode,
          messages: next.filter((m) => !m.note).map((m) => ({ role: m.role, content: m.content || (m.handoff ? "(handed to the team)" : "") })),
        }),
      });
      const j = (await res.json()) as { reply?: string; escalate?: boolean; linkId?: string; logId?: string; email?: string; limited?: boolean; failed?: boolean };
      if (j.limited) setMsgs((m) => [...m, { role: "assistant", content: "", note: "limit" }]);
      else if (!res.ok || j.failed) setMsgs((m) => [...m, { role: "assistant", content: "", note: "error" }]);
      else setMsgs((m) => [...m, { role: "assistant", content: j.reply ?? "", linkId: j.linkId, logId: j.logId, handoff: !!j.escalate, email: j.email }]);
    } catch {
      setMsgs((m) => [...m, { role: "assistant", content: "", note: "error" }]);
    } finally {
      setBusy(false);
    }
  }, [busy, user, msgs, lang, kidsMode, demo]);

  const feedback = async (i: number, helped: boolean) => {
    const m = msgs[i];
    if (!m.logId || m.helped !== undefined) return;
    setMsgs((all) => all.map((x, k) => (k === i ? { ...x, helped } : x)));
    if (demo || !user) return;
    try {
      await fetch("/api/help-chat", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` }, body: JSON.stringify({ feedback: { logId: m.logId, helped } }) });
    } catch { /* the thanks stays; the log simply has no answer */ }
  };

  const follow = (linkId: string) => {
    const t = linkTarget(linkId);
    if (!t) return;
    if (t.kind === "guide") window.dispatchEvent(new CustomEvent("gadit:open-guide", { detail: t.guide }));
    else router.push(href(t.path));
    if (window.innerWidth < 640) setOpen(false);
  };

  if (!cfg || (!user && !demo) || hiddenHere || kid) return null;
  const ui = cfg.ui;

  return (
    <div className="hc" dir={dir}>
      <style>{HC_CSS}</style>
      {!open && (
        <button type="button" className="hc-fab" onClick={() => setOpen(true)} aria-label={ui.fab}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.2 3.6c-.5.4-1.3.1-1.3-.6V16A2.5 2.5 0 0 1 4 13.5z" fill="currentColor" /><circle cx="8.5" cy="9.5" r="1.2" fill="#0a7472" /><circle cx="12" cy="9.5" r="1.2" fill="#0a7472" /><circle cx="15.5" cy="9.5" r="1.2" fill="#0a7472" /></svg>
          <span className="hc-fab-text">{ui.fab}</span>
        </button>
      )}
      {open && (
        <section className="hc-win" role="dialog" aria-label={ui.title}>
          <header className="hc-head">
            <div className="hc-head-text">
              <b>{ui.title}{cfg.test && <span className="hc-test">{ui.test}</span>}</b>
              <small>{ui.sub}</small>
            </div>
            <button type="button" className="hc-head-btn" onClick={() => setShowFaq((v) => !v)}>{ui.faq}</button>
            <button type="button" className="hc-x" onClick={() => setOpen(false)} aria-label={ui.close}>×</button>
          </header>
          <div className="hc-list" ref={listRef} aria-live="polite">
            <div className="hc-msg is-bot">{ui.hello}</div>
            {showFaq && (
              <div className="hc-faq">
                {ui.starters.map((s) => <button key={s} type="button" onClick={() => void ask(s)} disabled={busy}>{s}</button>)}
              </div>
            )}
            {msgs.map((m, i) => m.role === "user" ? (
              <div key={i} className="hc-msg is-me" dir="auto">{m.content}</div>
            ) : (
              <div key={i} className="hc-bot">
                <div className={`hc-msg is-bot${m.handoff ? " is-handoff" : ""}${m.note ? " is-note" : ""}`} dir="auto">
                  {m.note === "limit" ? ui.limit : m.note === "error" ? ui.error : <Bold text={m.content || (m.handoff ? ui.handoff : "")} />}
                </div>
                {m.handoff && m.email && <div className="hc-small">{ui.replyTo} <bdi>{m.email}</bdi></div>}
                {m.linkId && m.linkId !== "none" && linkTarget(m.linkId) && (
                  <button type="button" className="hc-link" onClick={() => follow(m.linkId!)}>{linkTarget(m.linkId)!.kind === "guide" ? ui.openGuide : ui.openPage} <span aria-hidden="true">{dir === "rtl" ? "←" : "→"}</span></button>
                )}
                {m.logId && !m.handoff && (
                  m.helped === undefined
                    ? <div className="hc-rate"><button type="button" onClick={() => void feedback(i, true)}>👍 {ui.helped}</button><button type="button" onClick={() => void feedback(i, false)}>👎 {ui.notHelped}</button></div>
                    : <div className="hc-small">{ui.thanks}</div>
                )}
              </div>
            ))}
            {busy && <div className="hc-msg is-bot hc-dots" aria-label={ui.thinking}><i /><i /><i /></div>}
          </div>
          <form className="hc-form" onSubmit={(e) => { e.preventDefault(); void ask(text); }}>
            <input value={text} onChange={(e) => setText(e.target.value.slice(0, 1000))} placeholder={ui.placeholder} dir="auto" aria-label={ui.placeholder} />
            <button type="submit" disabled={busy || !text.trim()} aria-label={ui.send}>
              <svg viewBox="0 0 24 24" aria-hidden="true" style={{ transform: dir === "rtl" ? "scaleX(-1)" : undefined }}><path d="M4 12l15-7-5 15-2.5-6.5z" fill="currentColor" /></svg>
            </button>
          </form>
        </section>
      )}
    </div>
  );
}

const HC_CSS = `
.hc-fab { position: fixed; z-index: 90; inset-inline-start: 16px; bottom: calc(env(safe-area-inset-bottom, 0px) + 16px); display: inline-flex; align-items: center; gap: 8px; height: 50px; padding: 0 16px 0 14px; border: 0; border-radius: 999px; background: #0a7472; color: #fff; font: inherit; font-weight: 700; font-size: 15px; cursor: pointer; box-shadow: 0 6px 18px rgba(10,116,114,.35); }
.hc-fab svg { width: 24px; height: 24px; }
.hc-fab:hover { background: #086361; }
@media (max-width: 640px) { .hc-fab { width: 50px; padding: 0; justify-content: center; } .hc-fab-text { display: none; } }
.hc-win { position: fixed; z-index: 96; inset-inline-start: 16px; bottom: calc(env(safe-area-inset-bottom, 0px) + 16px); width: min(390px, calc(100vw - 32px)); height: min(580px, calc(100dvh - 40px)); display: grid; grid-template-rows: auto minmax(0, 1fr) auto; border-radius: 20px; overflow: hidden; background: #fff; color: #14202b; box-shadow: 0 18px 50px rgba(20,32,43,.28); font-size: 15px; }
@media (max-width: 640px) { .hc-win { inset-inline: 8px; width: auto; bottom: calc(env(safe-area-inset-bottom, 0px) + 8px); height: min(620px, calc(100dvh - 24px)); } }
.hc-head { display: flex; align-items: center; gap: 8px; padding: 12px 12px 12px 16px; background: #0a7472; color: #fff; }
.hc-head-text { flex: 1; display: grid; min-width: 0; }
.hc-head-text b { font-size: 16px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.hc-head-text small { font-size: 12.5px; opacity: .85; }
.hc-test { padding: 1px 8px; border-radius: 999px; background: #ffd34d; color: #3b2a00; font-size: 11px; font-weight: 800; }
.hc-head-btn { border: 1px solid rgba(255,255,255,.5); background: transparent; color: #fff; border-radius: 999px; padding: 4px 10px; font: inherit; font-size: 12.5px; cursor: pointer; white-space: nowrap; }
.hc-x { width: 32px; height: 32px; border: 0; border-radius: 50%; background: rgba(255,255,255,.15); color: #fff; font-size: 20px; line-height: 1; cursor: pointer; }
.hc-list { overflow-y: auto; padding: 14px; display: grid; align-content: start; gap: 10px; background: #f5f8f8; overscroll-behavior: contain; }
.hc-msg { max-width: 88%; padding: 9px 13px; border-radius: 16px; line-height: 1.55; white-space: pre-wrap; overflow-wrap: anywhere; }
.hc-msg.is-bot { justify-self: start; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.08); border-start-start-radius: 4px; }
.hc-msg.is-me { justify-self: end; background: #0a7472; color: #fff; border-start-end-radius: 4px; }
.hc-msg.is-handoff { background: #fff7e0; box-shadow: 0 0 0 1px #f3d58a inset; }
.hc-msg.is-note { background: #fdecec; }
.hc-bot { display: grid; gap: 5px; justify-items: start; }
.hc-small { font-size: 12.5px; color: #5b6b78; padding-inline: 4px; }
.hc-link { border: 0; background: #e3f3f2; color: #0a7472; font: inherit; font-weight: 700; font-size: 13.5px; padding: 6px 12px; border-radius: 999px; cursor: pointer; }
.hc-rate { display: flex; gap: 6px; }
.hc-rate button { border: 1px solid #d7e0e5; background: #fff; color: #33424f; font: inherit; font-size: 12.5px; padding: 3px 10px; border-radius: 999px; cursor: pointer; }
.hc-faq { display: grid; gap: 6px; justify-items: start; }
.hc-faq button { border: 1px solid #bfe3e0; background: #fff; color: #0a5c5a; font: inherit; font-size: 14px; text-align: start; padding: 7px 12px; border-radius: 14px; cursor: pointer; }
.hc-faq button:hover { background: #ecf8f7; }
.hc-dots { display: inline-flex; gap: 4px; }
.hc-dots i { width: 7px; height: 7px; border-radius: 50%; background: #9fb3c2; animation: hc-dot 1s infinite ease-in-out; }
.hc-dots i:nth-child(2) { animation-delay: .15s; } .hc-dots i:nth-child(3) { animation-delay: .3s; }
@keyframes hc-dot { 0%, 80%, 100% { transform: translateY(0); opacity: .5; } 40% { transform: translateY(-4px); opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .hc-dots i { animation: none; } }
.hc-form { display: flex; gap: 8px; padding: 10px; border-top: 1px solid #e3e9ec; background: #fff; }
.hc-form input { flex: 1; min-width: 0; height: 42px; padding: 0 14px; border: 1px solid #cdd8de; border-radius: 999px; font: inherit; font-size: 16px; color: #14202b; background: #fff; }
.hc-form input:focus { outline: 2px solid #0a7472; outline-offset: 1px; }
.hc-form button { width: 42px; height: 42px; border: 0; border-radius: 50%; background: #0a7472; color: #fff; display: grid; place-items: center; cursor: pointer; }
.hc-form button:disabled { opacity: .45; cursor: default; }
.hc-form button svg { width: 20px; height: 20px; }
`;
