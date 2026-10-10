"use client";

/**
 * /auth/finish — where an emailed sign-in link lands (/api/auth/email-link).
 * Signs the visitor in and sends them on to where they asked from. The
 * email address rides in the link (?e=); if it is missing (an older link,
 * a mail app that trims it), the visitor types it once.
 */

import { useEffect, useState } from "react";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { finishCopy } from "@/lib/login-help-copy";

export default function AuthFinish() {
  const { lang, dir } = useLang();
  const href = useHref();
  const c = finishCopy(lang);
  const [state, setState] = useState<"working" | "ask" | "failed">("working");
  const [email, setEmail] = useState("");

  async function finish(addr: string) {
    setState("working");
    try {
      await signInWithEmailLink(auth, addr.trim(), window.location.href);
      const next = new URLSearchParams(window.location.search).get("next") || "";
      window.location.replace(next.startsWith("/") && !next.startsWith("//") ? next : href("/"));
    } catch {
      setState("failed");
    }
  }

  useEffect(() => {
    if (!isSignInWithEmailLink(auth, window.location.href)) { setState("failed"); return; }
    const e = new URLSearchParams(window.location.search).get("e") || "";
    if (e) void finish(e);
    else setState("ask");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main dir={dir} style={{ minHeight: "70vh", display: "grid", placeItems: "center", padding: "40px 16px", fontFamily: "inherit" }}>
      <div style={{ maxWidth: 420, width: "100%", textAlign: "center", display: "grid", gap: 14 }}>
        <div style={{ fontSize: 30, fontWeight: 800, direction: "ltr" }}>Gad<span style={{ color: "#0EA5A5", fontStyle: "italic" }}>it</span></div>
        {state === "working" && <p style={{ fontSize: 18, margin: 0 }}>{c.signingIn}</p>}
        {state === "ask" && (
          <form onSubmit={(e) => { e.preventDefault(); if (email.trim()) void finish(email); }} style={{ display: "grid", gap: 10 }}>
            <label htmlFor="finish-email" style={{ fontSize: 16 }}>{c.askEmail}</label>
            <input id="finish-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" autoComplete="email" required
              style={{ font: "inherit", fontSize: 16, padding: "11px 14px", borderRadius: 12, border: "1.5px solid #D1D5DB" }} />
            <button type="submit" style={{ font: "inherit", fontWeight: 700, fontSize: 16, padding: "12px 20px", borderRadius: 999, border: 0, background: "#0F6F6C", color: "#fff", cursor: "pointer" }}>{c.cont}</button>
          </form>
        )}
        {state === "failed" && (
          <>
            <p style={{ fontSize: 17, margin: 0, lineHeight: 1.6 }}>{c.expired}</p>
            <a href={href("/")} style={{ color: "#0F6F6C", fontWeight: 700 }}>{c.home}</a>
          </>
        )}
      </div>
    </main>
  );
}
