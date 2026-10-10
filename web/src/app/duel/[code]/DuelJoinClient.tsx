"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import type { DuelPlayerPublic } from "@/lib/duel";
import { DuelGame } from "@/components/play/duel/DuelGame";
import { duelCopy } from "@/components/play/duel/duel-i18n";
import { DUEL_CSS } from "@/components/play/duel/duel-css";

/** The invite link: sign in, see who is inviting, join, play. */
export function DuelJoinClient({ code }: { code: string }) {
  const { user, loading, setShowLoginModal } = useAuth();
  const { lang, dir } = useLang();
  const href = useHref();
  const t = duelCopy(lang);
  const [state, setState] = useState<"loading" | "invite" | "playing" | "error">("loading");
  const [host, setHost] = useState<DuelPlayerPublic | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const check = useCallback(async () => {
    if (!user) return;
    try {
      const r = await fetch(`/api/duel?code=${encodeURIComponent(code)}`, { headers: { Authorization: `Bearer ${await user.getIdToken()}` }, cache: "no-store" });
      const j = await r.json();
      if (!r.ok) { setError(j.error === "expired" ? t.errExpired : t.errNotFound); setState("error"); return; }
      if (j.invite) {
        if (j.full) { setError(t.errFull); setState("error"); return; }
        setHost(j.host as DuelPlayerPublic);
        setState("invite");
      } else setState("playing");
    } catch { setError(t.errGeneric); setState("error"); }
  }, [user, code, t]);

  useEffect(() => { void check(); }, [check]);

  const join = async () => {
    if (!user) return;
    setBusy(true);
    try {
      const r = await fetch("/api/duel", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` },
        body: JSON.stringify({ action: "join", code }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { setError(j.error === "full" ? t.errFull : j.error === "expired" ? t.errExpired : t.errNotFound); setState("error"); return; }
      setState("playing");
    } finally { setBusy(false); }
  };

  const exit = () => { window.location.href = href("/play"); };

  if (user && state === "playing") {
    return (
      <div className="wordbook wb-play-page" dir={dir}>
        <DuelGame code={code} lang={lang} dir={dir} onExit={exit} />
      </div>
    );
  }

  return (
    <div className="wordbook wb-play-page" dir={dir}>
      <div className="duel">
        <style>{DUEL_CSS}</style>
        <div className="duel-top">
          <Link href={href("/")} className="wb-wordmark" dir="ltr">Gad<span className="wb-wordmark-it">it</span></Link>
          <span className="duel-title">{t.title}</span>
        </div>
        <div className="duel-card">
          <div className="duel-count" aria-hidden="true">⚔️</div>
          <h2 className="duel-h">{host ? t.joinTitle(host.name) : t.title}</h2>
          <p className="duel-sub">{t.joinSub}</p>
          {!loading && !user && (
            <div className="duel-row"><button type="button" className="duel-btn" onClick={() => setShowLoginModal(true)}>{t.signIn}</button></div>
          )}
          {user && state === "invite" && (
            <div className="duel-row"><button type="button" className="duel-btn" disabled={busy} onClick={() => void join()}>{t.joinCta}</button></div>
          )}
          {user && state === "loading" && <p className="duel-wait">…</p>}
          {state === "error" && <p className="duel-note">{error}</p>}
        </div>
      </div>
    </div>
  );
}
