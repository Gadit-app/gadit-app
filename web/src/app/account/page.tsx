"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";

interface AccountData {
  plan: "basic" | "clear" | "deep";
  email: string | null;
  stripeCustomerId: string | null;
  subscriptionId: string | null;
  subscriptionStatus: string | null;
  isTrial: boolean;
  trialDaysLeft: number;
  trialEnd: number | null;
  cancelAtPeriodEnd: boolean;
  images: { used: number; limit: number; monthKey: string };
}

export default function AccountPage() {
  const { user, loading: authLoading, promptLogin } = useAuth();
  const { t, dir } = useLang();
  const router = useRouter();
  const [data, setData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      promptLogin("Sign in to view your account");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch("/api/account", {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const json = (await res.json()) as AccountData;
        if (!cancelled) setData(json);
      } catch (e) {
        console.error("account fetch:", e);
        if (!cancelled) setErrorMsg(t.accountErrorLoading);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, promptLogin, t.accountErrorLoading]);

  async function openPortal() {
    if (!user) return;
    setPortalLoading(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/portal", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const json = await res.json();
      if (json.url) window.location.href = json.url;
      else throw new Error(json.error || "no URL returned");
    } catch (e) {
      console.error("portal error:", e);
      alert("Could not open subscription portal. Please try again.");
    } finally {
      setPortalLoading(false);
    }
  }

  const planLabel = (plan: AccountData["plan"]) =>
    plan === "deep" ? t.accountDeepPlan : plan === "clear" ? t.accountClearPlan : t.accountFreePlan;

  const statusLabel = (status: string | null) => {
    if (status === "active" || status === "trialing") return t.accountStatusActive;
    if (status === "canceled") return t.accountStatusCanceled;
    if (status === "past_due" || status === "unpaid") return t.accountStatusPastDue;
    return null;
  };

  const statusColor = (status: string | null) => {
    if (status === "active" || status === "trialing") return { bg: "rgb(220 252 231)", text: "rgb(22 101 52)" };
    if (status === "canceled") return { bg: "rgb(254 226 226)", text: "rgb(153 27 27)" };
    if (status === "past_due" || status === "unpaid") return { bg: "rgb(254 249 195)", text: "rgb(133 77 14)" };
    return { bg: "rgb(241 245 249)", text: "rgb(71 85 105)" };
  };

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] pt-28 pb-20 px-4" dir={dir}>
        <div className="max-w-2xl mx-auto text-center text-slate-400 text-sm">{t.accountLoading}</div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] pt-28 pb-20 px-4" dir={dir}>
        <div className="max-w-2xl mx-auto text-center text-slate-400 text-sm">{t.accountSignedInAs}…</div>
      </main>
    );
  }

  if (errorMsg || !data) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] pt-28 pb-20 px-4" dir={dir}>
        <div className="max-w-2xl mx-auto text-center text-amber-700 text-sm">{errorMsg || t.accountErrorLoading}</div>
      </main>
    );
  }

  const isPaid = data.plan === "clear" || data.plan === "deep";
  const usagePct = data.images.limit > 0 ? Math.min(100, Math.round((data.images.used / data.images.limit) * 100)) : 0;
  const status = statusLabel(data.subscriptionStatus);
  const statusStyles = statusColor(data.subscriptionStatus);

  return (
    <main className="min-h-screen bg-[#F8FAFC] pt-28 pb-20 px-4" dir={dir}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: "#0F172A", letterSpacing: "-0.5px" }}>
            {t.accountTitle}
          </h1>
          <p className="text-slate-400 text-sm">
            {t.accountSignedInAs} <span className="font-medium text-slate-600">{user.email}</span>
          </p>
        </div>

        {/* Plan card */}
        <div className="bg-white rounded-3xl p-6" style={{ border: "1px solid rgb(226 232 240 / 0.9)", boxShadow: "0 2px 8px 0 rgb(0 0 0 / 0.04)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{t.accountYourPlan}</p>
              <p className="text-2xl font-bold" style={{ color: "#0F172A" }}>{planLabel(data.plan)}</p>
            </div>
            {data.isTrial ? (
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: "rgb(219 234 254)", color: "rgb(29 78 216)" }}
              >
                {t.accountTrialBadge.replace("{days}", String(data.trialDaysLeft))}
              </span>
            ) : status && (
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: statusStyles.bg, color: statusStyles.text }}
              >
                {status}
              </span>
            )}
          </div>

          {data.isTrial && data.trialEnd && (
            <p className="text-xs text-slate-500 mb-3">
              {t.accountTrialNote.replace(
                "{date}",
                new Date(data.trialEnd * 1000).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              )}
            </p>
          )}

          <div className="flex flex-wrap gap-2 mt-4">
            {isPaid ? (
              <button
                onClick={openPortal}
                disabled={portalLoading || !data.stripeCustomerId}
                className="btn-primary px-5 py-2.5 text-sm rounded-xl disabled:opacity-50"
              >
                {portalLoading ? "…" : t.accountManageSubscription}
              </button>
            ) : (
              <Link href="/pricing" className="btn-primary px-5 py-2.5 text-sm rounded-xl">
                {t.accountUpgrade}
              </Link>
            )}
          </div>
        </div>

        {/* Image usage card — only for paid users */}
        {isPaid && data.images.limit > 0 && (
          <div className="bg-white rounded-3xl p-6" style={{ border: "1px solid rgb(226 232 240 / 0.9)", boxShadow: "0 2px 8px 0 rgb(0 0 0 / 0.04)" }}>
            <div className="flex items-baseline justify-between mb-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.accountImagesUsage}</p>
              <p className="text-sm font-medium" style={{ color: "#0F172A" }}>
                <span className="text-2xl font-bold">{data.images.used}</span>
                <span className="text-slate-400"> / {data.images.limit}</span>
              </p>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgb(241 245 249)" }}>
              <div
                className="h-full transition-all"
                style={{
                  width: `${usagePct}%`,
                  background: usagePct >= 90 ? "rgb(239 68 68)" : usagePct >= 70 ? "rgb(245 158 11)" : "rgb(37 99 235)",
                }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-3">{t.accountImagesUsageNote}</p>
          </div>
        )}

        {/* Back to search */}
        <Link
          href="/"
          className="block text-center text-sm text-slate-500 hover:text-blue-600 transition-colors"
        >
          ← {t.searchAnother}
        </Link>
      </div>
    </main>
  );
}
