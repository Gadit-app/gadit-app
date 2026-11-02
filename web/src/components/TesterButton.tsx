"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { sfx } from "@/lib/game-sfx";
import { TESTER_EMOJI, TESTER_KINDS, testerCopy, type TesterKind } from "@/lib/tester";

/**
 * The tester's note button inside a game (Gadi 2026-11-02). Shown only to
 * testers. Fixed choices; each tap goes to Gadi right away.
 */
export function TesterButton({ game, word, className }: { game: string; word?: string; className?: string }) {
  const { user, tester } = useAuth();
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState<TesterKind | null>(null);
  if (!user || !tester) return null;
  const c = testerCopy(lang);

  const send = async (kind: TesterKind) => {
    sfx.tap();
    setSent(kind);
    try {
      await fetch("/api/tester-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` },
        body: JSON.stringify({ game, kind, word }),
      });
    } catch { /* a lost note is fine */ }
    setTimeout(() => { setOpen(false); setSent(null); }, 1300);
  };

  return (
    <>
      <style>{CSS}</style>
      <button type="button" className={`tst-btn ${className ?? ""}`} onClick={(e) => { e.stopPropagation(); sfx.tap(); setOpen(true); }} aria-label={c.badge} title={c.badge}>🧪</button>
      {open ? (
        <div className="tst-wrap" onClick={(e) => { e.stopPropagation(); setOpen(false); }} dir={lang === "he" ? "rtl" : "ltr"}>
          <div className="tst-card" role="dialog" aria-label={c.title} onClick={(e) => e.stopPropagation()}>
            <span className="tst-badge">🧪 {c.badge}</span>
            <strong className="tst-title">{sent ? c.thanks : c.title}</strong>
            {sent ? <span className="tst-sent">{TESTER_EMOJI[sent]}</span> : (
              <div className="tst-grid">
                {TESTER_KINDS.map((k) => (
                  <button key={k} type="button" className="tst-kind" onClick={() => send(k)}>
                    <span className="tst-emoji">{TESTER_EMOJI[k]}</span>
                    <span>{c.kinds[k]}</span>
                  </button>
                ))}
              </div>
            )}
            {!sent ? <button type="button" className="tst-close" onClick={() => setOpen(false)}>{c.close}</button> : null}
          </div>
        </div>
      ) : null}
    </>
  );
}

const CSS = `
.tst-btn{width:44px;height:44px;flex:0 0 44px;border-radius:50%;border:0;background:#fffe;box-shadow:0 2px 8px #0002;font-size:20px;display:grid;place-items:center;cursor:pointer}
.tst-wrap{position:fixed;inset:0;z-index:100;background:#0008;display:grid;place-items:center;padding:16px}
.tst-card{width:min(420px,100%);background:#fff;color:#14202b;border-radius:26px;padding:18px 16px;display:grid;gap:12px;justify-items:center;text-align:center;box-shadow:0 18px 50px #0006;font-family:inherit}
.tst-badge{background:#ede9fe;color:#5b21b6;border-radius:999px;padding:4px 12px;font-weight:800;font-size:13px}
.tst-title{font-size:20px}
.tst-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;width:100%}
.tst-kind{display:grid;justify-items:center;gap:4px;padding:12px 4px;border:2px solid #e5e7eb;border-radius:18px;background:#f9fafb;font:inherit;font-weight:800;font-size:14px;color:#14202b;cursor:pointer}
.tst-kind:active{transform:scale(.95)}
.tst-emoji{font-size:30px;line-height:1}
.tst-sent{font-size:54px;animation:tst-pop .4s}
.tst-close{border:0;background:none;color:#5f6b73;font:inherit;font-weight:700;text-decoration:underline;cursor:pointer}
@keyframes tst-pop{from{transform:scale(.4)}to{transform:scale(1)}}
`;
