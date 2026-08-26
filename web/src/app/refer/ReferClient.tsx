"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { ShareButton } from "@/components/ShareButton";
import { WbUserMenu } from "@/components/design/WbUserMenu";
import type { Lang } from "@/lib/i18n";

/**
 * /refer — the member-gets-member invite page. Shows the user's personal
 * invite link, a copy + native-share button, and their running stats
 * (invited / subscribed / free months earned). Reward payout is admin-granted
 * in v1, so the copy promises a free month (which we honor) without exposing
 * any billing mechanism.
 */

type ReferData = { code: string; link: string; invited: number; joinedPaid: number; rewardsOwed: number };

function fontBody(lang: Lang): string {
  if (lang === "he") return "var(--wb-he)";
  if (lang === "ar") return "var(--wb-ar)";
  if (lang === "ja") return "var(--wb-jp)";
  if (lang === "hi") return "var(--wb-hi)";
  return "var(--wb-sans)";
}

function copy(lang: Lang) {
  const en = {
    eyebrow: "Invite friends",
    title: "A free month for every friend who joins",
    sub: "Share your personal link. When a friend subscribes to Gadit through it, you get a free month.",
    yourLink: "Your invite link",
    copy: "Copy",
    copied: "Copied ✓",
    share: "Share",
    invited: "Invited",
    joined: "Subscribed",
    months: "Free months earned",
    note: "Earned months are credited to your account. We'll let you know when they're applied.",
    loginTitle: "Sign in to get your invite link",
    loginBtn: "Sign in",
    loading: "Loading…",
  };
  const he: typeof en = {
    eyebrow: "הזמנת חברים",
    title: "חודש חינם על כל חבר שמצטרף",
    sub: "לשתף את הקישור האישי. על כל חבר שנרשם למנוי בגדית דרכו, מקבלים חודש חינם.",
    yourLink: "קישור ההזמנה שלך",
    copy: "העתקה",
    copied: "הועתק ✓",
    share: "שיתוף",
    invited: "הוזמנו",
    joined: "נרשמו למנוי",
    months: "חודשים שהרווחת",
    note: "החודשים שנצברו נזקפים לחשבונך. נעדכן אותך כשהם מיושמים.",
    loginTitle: "צריך להתחבר כדי לקבל קישור הזמנה אישי",
    loginBtn: "התחברות",
    loading: "טוען…",
  };
  return lang === "he" ? he : en;
}

export function ReferClient() {
  const { user, loading: authLoading, promptLogin } = useAuth();
  const { lang, dir } = useLang();
  const href = useHref();
  const t = copy(lang);

  const [data, setData] = useState<ReferData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch("/api/referral", { headers: { Authorization: `Bearer ${idToken}` } });
        if (res.ok && !cancelled) setData(await res.json());
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, [user]);

  async function onCopy() {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { /* ignore */ }
  }

  return (
    <div className="wordbook wb-shell-page" dir={dir}>
      <header className="wb-shell-topbar">
        <Link href={href("/")} className="wb-wordmark" dir="ltr">
          Gad<span className="wb-wordmark-it">it</span>
        </Link>
        <div className="wb-shell-actions">
          {user ? <WbUserMenu /> : null}
        </div>
      </header>

      <main style={{ maxWidth: 620, margin: "0 auto", padding: "48px 22px 96px", fontFamily: fontBody(lang) }}>
        <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--teal-deep, #0E7490)" }}>
          {t.eyebrow}
        </p>
        <h1 style={{ margin: "0 0 12px", fontSize: "clamp(28px,5vw,40px)", fontWeight: 800, lineHeight: 1.15, color: "var(--ink, #20272E)" }}>
          {t.title}
        </h1>
        <p style={{ margin: "0 0 28px", fontSize: 17, lineHeight: 1.55, color: "var(--ink-muted, #6B7280)", maxWidth: "52ch" }}>
          {t.sub}
        </p>

        {authLoading ? (
          <div style={{ color: "var(--ink-muted, #6B7280)" }}>{t.loading}</div>
        ) : !user ? (
          <div style={{ background: "var(--card, #fff)", border: "1px solid var(--hairline, #E5E7EB)", borderRadius: 16, padding: 24 }}>
            <p style={{ margin: "0 0 16px", fontSize: 16, color: "var(--ink, #20272E)" }}>{t.loginTitle}</p>
            <button
              type="button"
              onClick={() => promptLogin?.()}
              style={{ background: "var(--teal, #0EA5A5)", color: "#fff", border: "none", borderRadius: 12, padding: "11px 20px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
            >
              {t.loginBtn}
            </button>
          </div>
        ) : (
          <>
            {/* Invite link + actions */}
            <div style={{ background: "var(--card, #fff)", border: "1px solid var(--hairline, #E5E7EB)", borderRadius: 16, padding: 20, marginBottom: 22 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-muted, #9CA3AF)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
                {t.yourLink}
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <div dir="ltr" style={{ flex: "1 1 260px", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "ui-monospace, monospace", fontSize: 15, background: "var(--paper, #F9FAFB)", border: "1px solid var(--hairline, #E5E7EB)", borderRadius: 10, padding: "11px 14px", color: "var(--ink, #20272E)" }}>
                  {data ? data.link : "…"}
                </div>
                <button
                  type="button"
                  onClick={onCopy}
                  disabled={!data}
                  style={{ background: "var(--teal, #0EA5A5)", color: "#fff", border: "none", borderRadius: 10, padding: "11px 18px", fontSize: 14, fontWeight: 700, cursor: data ? "pointer" : "default", fontFamily: "inherit", flex: "none" }}
                >
                  {copied ? t.copied : t.copy}
                </button>
                {data && (
                  <ShareButton url={data.link} title="Gadit" text={t.sub} shareLabel={t.share} copiedLabel={t.copied} />
                )}
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              <Stat label={t.invited} value={data?.invited ?? 0} />
              <Stat label={t.joined} value={data?.joinedPaid ?? 0} />
              <Stat label={t.months} value={data?.rewardsOwed ?? 0} strong />
            </div>

            <p style={{ marginTop: 18, fontSize: 13, color: "var(--ink-muted, #9CA3AF)", lineHeight: 1.5 }}>
              {t.note}
            </p>
          </>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <div style={{ background: "var(--card, #fff)", border: "1px solid var(--hairline, #E5E7EB)", borderRadius: 14, padding: "16px 14px", textAlign: "center" }}>
      <div style={{ fontSize: 26, fontWeight: 800, color: strong ? "var(--teal, #0EA5A5)" : "var(--ink, #20272E)", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--ink-muted, #6B7280)", marginTop: 6 }}>{label}</div>
    </div>
  );
}
