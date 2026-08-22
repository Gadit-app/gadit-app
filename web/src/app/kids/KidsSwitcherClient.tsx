"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { memberColorFor, avatarUrl } from "@/lib/family";

type Member = {
  id: string; name: string; role: string; colorIndex: number;
  avatarPhotoUrl: string; avatarId: string; isOwner: boolean; pin: string;
};

const T: Record<string, {
  who: string; signin: string; enterPin: (name: string) => string; wrong: string;
  exit: string; back: string;
}> = {
  en: {
    who: "Who's using?",
    signin: "Sign in to use Kids Mode",
    enterPin: (n) => `${n}'s code`,
    wrong: "Try again",
    exit: "Exit Kids Mode",
    back: "Back",
  },
  he: {
    who: "מי משתמש עכשיו?",
    signin: "התחבר כדי להשתמש במצב ילדים",
    enterPin: (n) => `הקוד של ${n}`,
    wrong: "נסה שוב",
    exit: "יציאה ממצב ילדים",
    back: "חזרה",
  },
};
function t(lang: string) { return T[lang] ?? T.en; }

export function KidsSwitcherClient() {
  const { user, promptLogin } = useAuth();
  const { lang, dir } = useLang();
  const href = useHref();
  const router = useRouter();
  const c = t(lang);

  const [members, setMembers] = useState<Member[] | null>(null);
  const [selected, setSelected] = useState<Member | null>(null);
  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(false);
  const [entering, setEntering] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/family/switch-member", { headers: { Authorization: `Bearer ${idToken}` } });
      if (!res.ok) return;
      const data = (await res.json()) as { members?: Member[] };
      setMembers(data.members ?? []);
    } catch { setMembers([]); }
  }, [user]);
  useEffect(() => { load(); }, [load]);

  const kids = (members ?? []).filter((m) => !m.isOwner);
  const owner = (members ?? []).find((m) => m.isOwner) || null;

  async function enter(m: Member, opts?: { exit?: boolean }) {
    if (!user || entering) return;
    setEntering(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/family/switch-member", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ memberId: m.id }),
      });
      const json = (await res.json()) as { token?: string };
      if (!res.ok || !json.token) throw new Error();
      const { signInWithCustomToken, getAuth } = await import("firebase/auth");
      await signInWithCustomToken(getAuth(), json.token);
      try {
        if (opts?.exit) sessionStorage.removeItem("gadit-kids-mode");
        else sessionStorage.setItem("gadit-kids-mode", "1");
      } catch { /* ignore */ }
      router.push(href("/"));
    } catch {
      setEntering(false);
    }
  }

  function tapKid(m: Member) {
    if (m.pin && /^\d{4}$/.test(m.pin)) { setSelected(m); setPin(""); }
    else void enter(m);
  }

  function pressDigit(d: string) {
    if (!selected) return;
    const next = (pin + d).slice(0, 4);
    setPin(next);
    if (next.length === 4) {
      if (next === selected.pin) { void enter(selected); }
      else { setShake(true); setTimeout(() => { setShake(false); setPin(""); }, 450); }
    }
  }

  if (!user) {
    return (
      <div className="wordbook wb-shell-page" dir={dir} style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <button type="button" onClick={() => promptLogin({ mode: "signin" })} style={btnTeal}>{c.signin}</button>
      </div>
    );
  }

  return (
    <div className="wordbook wb-shell-page" dir={dir} style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", gap: 34 }}>
      {!selected ? (
        <>
          <h1 style={{ fontSize: 34, fontWeight: 800, color: "var(--ink)", textAlign: "center", letterSpacing: "-0.02em" }}>{c.who}</h1>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 26, justifyContent: "center", maxWidth: 720 }}>
            {kids.map((m) => {
              const photo = m.avatarPhotoUrl || avatarUrl(m.avatarId);
              return (
                <button key={m.id} type="button" onClick={() => tapKid(m)} disabled={entering}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, background: "transparent", border: "none", cursor: entering ? "default" : "pointer", fontFamily: "inherit", width: 130 }}>
                  <span style={{ width: 108, height: 108, borderRadius: "50%", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: memberColorFor({ colorIndex: m.colorIndex }), color: "#fff", fontSize: 44, fontWeight: 800, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.35)" }}>
                    {photo ? <img src={photo} alt="" width={108} height={108} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (m.name || "?").charAt(0).toUpperCase()}
                  </span>
                  <span style={{ fontSize: 19, fontWeight: 700, color: "var(--ink)" }}>
                    {m.name || "—"}{m.pin ? " 🔒" : ""}
                  </span>
                </button>
              );
            })}
          </div>
          {owner && (
            <button type="button" onClick={() => enter(owner, { exit: true })} disabled={entering}
              style={{ marginTop: 10, background: "transparent", border: "none", color: "var(--ink-muted)", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", textDecoration: "underline" }}>
              {c.exit}
            </button>
          )}
        </>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22, animation: shake ? "wb-shake 0.4s" : undefined }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--ink)" }}>{c.enterPin(selected.name || "")}</h2>
          <div style={{ display: "flex", gap: 14 }}>
            {[0, 1, 2, 3].map((i) => (
              <span key={i} style={{ width: 18, height: 18, borderRadius: "50%", background: i < pin.length ? "#0EA5A5" : "color-mix(in srgb, var(--ink) 18%, transparent)" }} />
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 74px)", gap: 14 }}>
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
              <button key={d} type="button" onClick={() => pressDigit(d)} style={keyStyle}>{d}</button>
            ))}
            <button type="button" onClick={() => { setSelected(null); setPin(""); }} style={{ ...keyStyle, fontSize: 15, fontWeight: 700 }}>{c.back}</button>
            <button type="button" onClick={() => pressDigit("0")} style={keyStyle}>0</button>
            <button type="button" onClick={() => setPin((p) => p.slice(0, -1))} style={{ ...keyStyle, fontSize: 24 }}>⌫</button>
          </div>
        </div>
      )}
      <style>{`@keyframes wb-shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-9px)}40%,80%{transform:translateX(9px)}}`}</style>
    </div>
  );
}

const btnTeal: React.CSSProperties = { background: "#0EA5A5", color: "#fff", border: "none", borderRadius: 999, padding: "13px 24px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" };
const keyStyle: React.CSSProperties = { width: 74, height: 74, borderRadius: "50%", border: "1px solid var(--rule)", background: "var(--surface)", color: "var(--ink)", fontSize: 28, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" };
