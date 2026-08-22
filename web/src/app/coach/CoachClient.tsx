"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { memberColorFor, avatarUrl } from "@/lib/family";

type Student = {
  grantId: string;
  familyId: string;
  memberId: string;
  memberName: string;
  avatarPhotoUrl: string;
  avatarId: string;
  colorIndex: number;
};

const T: Record<string, {
  title: string; lede: string; signin: string; enter: string; entering: string;
  emptyTitle: string; emptyBody: (email: string) => string; err: string; signedInAs: string;
}> = {
  en: {
    title: "Your students",
    lede: "Enter a student's profile to look up and save words together during a lesson.",
    signin: "Sign in to see your students",
    enter: "Enter",
    entering: "Entering...",
    emptyTitle: "No students yet",
    emptyBody: (email) => `Ask a parent to add you as a coach with this email: ${email}. Once they do, the child appears here.`,
    err: "Something went wrong. Try again.",
    signedInAs: "Signed in as",
  },
  he: {
    title: "התלמידים שלך",
    lede: "היכנס לפרופיל של תלמיד כדי לחפש ולשמור מילים יחד במהלך השיעור.",
    signin: "התחבר כדי לראות את התלמידים שלך",
    enter: "כניסה",
    entering: "נכנס...",
    emptyTitle: "אין עדיין תלמידים",
    emptyBody: (email) => `בקש מהורה להוסיף אותך כמאמן עם האימייל הזה: ${email}. ברגע שיעשה זאת, הילד יופיע כאן.`,
    err: "משהו השתבש. נסה שוב.",
    signedInAs: "מחובר בתור",
  },
};
function t(lang: string) { return T[lang] ?? T.en; }

export function CoachClient() {
  const { user, promptLogin } = useAuth();
  const { lang, dir } = useLang();
  const href = useHref();
  const router = useRouter();
  const c = t(lang);

  const [students, setStudents] = useState<Student[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [entering, setEntering] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/coach/students", { headers: { Authorization: `Bearer ${idToken}` } });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { students?: Student[] };
      setStudents(data.students ?? []);
    } catch {
      setError(c.err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [user, c.err]);

  useEffect(() => { load(); }, [load]);

  async function enter(s: Student) {
    if (!user || entering) return;
    setEntering(s.grantId);
    setError("");
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/coach/enter", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ grantId: s.grantId }),
      });
      const json = (await res.json()) as { token?: string; error?: string };
      if (!res.ok || !json.token) throw new Error(json.error || String(res.status));
      const { signInWithCustomToken, getAuth } = await import("firebase/auth");
      await signInWithCustomToken(getAuth(), json.token);
      // We are now signed in as the child. Land on their home to work together.
      router.push(href("/"));
    } catch {
      setError(c.err);
      setEntering(null);
    }
  }

  return (
    <div className="wordbook wb-shell-page" dir={dir}>
      <header className="wb-shell-topbar">
        <Link href={href("/")} className="wb-wordmark" dir="ltr" aria-label="Gadit home">
          Gad<span className="wb-wordmark-it">it</span>
        </Link>
      </header>

      <main style={{ maxWidth: 620, margin: "0 auto", padding: "32px 20px 80px", width: "100%" }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--ink)", marginBottom: 8 }}>{c.title}</h1>
        <p style={{ fontSize: 16, color: "var(--ink-soft)", marginBottom: 8, maxWidth: 520 }}>{c.lede}</p>
        {user?.email && (
          <p style={{ fontSize: 13, color: "var(--ink-muted)", marginBottom: 24 }}>{c.signedInAs} {user.email}</p>
        )}

        {!user ? (
          <button
            type="button"
            onClick={() => promptLogin({ mode: "signin" })}
            style={{ marginTop: 12, background: "#0EA5A5", color: "#fff", border: "none", borderRadius: 999, padding: "13px 22px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
          >
            {c.signin}
          </button>
        ) : loading ? (
          <div style={{ color: "var(--ink-muted)", padding: "24px 0" }}>…</div>
        ) : students && students.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
            {students.map((s) => {
              const photo = s.avatarPhotoUrl || avatarUrl(s.avatarId);
              return (
                <div key={s.grantId} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 16, border: "1px solid var(--rule)", background: "var(--surface)" }}>
                  <span style={{ width: 48, height: 48, flexShrink: 0, borderRadius: "50%", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: memberColorFor({ colorIndex: s.colorIndex }), color: "#fff", fontSize: 20, fontWeight: 800 }}>
                    {photo ? <img src={photo} alt="" width={48} height={48} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (s.memberName || "?").charAt(0).toUpperCase()}
                  </span>
                  <span style={{ flex: 1, minWidth: 0, fontSize: 17, fontWeight: 700, color: "var(--ink)" }}>{s.memberName || "—"}</span>
                  <button
                    type="button"
                    onClick={() => enter(s)}
                    disabled={!!entering}
                    style={{ background: "#0EA5A5", color: "#fff", border: "none", borderRadius: 999, padding: "10px 20px", fontSize: 15, fontWeight: 700, cursor: entering ? "default" : "pointer", opacity: entering && entering !== s.grantId ? 0.5 : 1, fontFamily: "inherit", flexShrink: 0 }}
                  >
                    {entering === s.grantId ? c.entering : c.enter}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ marginTop: 16, padding: "22px 20px", borderRadius: 16, border: "1px dashed var(--rule)", background: "var(--surface)" }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>{c.emptyTitle}</div>
            <div style={{ fontSize: 14.5, color: "var(--ink-soft)", lineHeight: 1.5 }}>{c.emptyBody(user.email || "")}</div>
          </div>
        )}

        {error && <div style={{ marginTop: 16, color: "#DC2626", fontSize: 14 }}>{error}</div>}
      </main>
    </div>
  );
}
