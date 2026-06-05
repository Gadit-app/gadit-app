"use client";

/**
 * AccountPage — CrispTech surface (light paper, teal/purple accents).
 *
 * Replaces the previous dark "navy + stars" stage that pre-dated the
 * wordbook redesign. Structure follows NotebookClient/PricingClient:
 * inline wb-shell-topbar, single white card with sections, wb-home-footer.
 *
 * Sections in the card:
 *   1. Hero — "Your space" eyebrow + first-name welcome in Lora italic.
 *   2. Plan — tier name in tier color, trial badge if trialing,
 *      Manage/Upgrade/Change CTAs.
 *   3. Usage — image generation meter (Basic gets Locked; Clear/Deep
 *      see X/N this month). Searches meter for paid tiers only.
 *   4. Email + Sign out — surfaces the email and a primary-style
 *      sign-out button (the one Gadi flagged was missing inline).
 *   5. Delete account — small low-prominence link under a dashed rule.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { v2 } from "@/lib/i18n-v2";
import { ShareButton, APP_SHARE_COPY } from "@/components/ShareButton";
import { WbUserMenu } from "@/components/design/WbUserMenu";
import { LANGUAGES, type Lang } from "@/lib/i18n";

type Plan = "basic" | "clear" | "deep";

interface AccountData {
  plan: Plan;
  email: string | null;
  stripeCustomerId: string | null;
  subscriptionStatus: string | null;
  isTrial: boolean;
  trialDaysLeft: number;
  trialEnd: number | null;
  cancelAtPeriodEnd: boolean;
  images: { used: number; limit: number; monthKey: string };
}

function tierColor(plan: Plan): string {
  if (plan === "deep") return "#7C3AED";
  if (plan === "clear") return "#0EA5A5";
  return "#6B7280"; // gray
}

function tierBg(plan: Plan): string {
  if (plan === "deep") return "#F3EEFF";
  if (plan === "clear") return "#E0F6F4";
  return "#F3F4F6";
}

// Inline language switch matching the one in NotebookClient — single
// chip that opens a tiny popover with the 9 langs.
function LangSwitch() {
  const { lang, setLang, dir } = useLang();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];
  return (
    <div style={{ position: "relative", display: "inline-flex" }}>
      <button
        type="button"
        className="wb-shell-link"
        onClick={() => setOpen((v) => !v)}
        aria-label="Language"
      >
        🌐 {current.label}
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            insetBlockStart: "calc(100% + 8px)",
            insetInlineEnd: dir === "rtl" ? "auto" : 0,
            insetInlineStart: dir === "rtl" ? 0 : "auto",
            background: "var(--surface)",
            border: "1px solid var(--hairline)",
            borderRadius: 12,
            boxShadow: "0 12px 32px rgba(13,22,38,0.10)",
            padding: 6,
            zIndex: 100,
            minWidth: 160,
          }}
        >
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => { setLang(l.code as Lang); setOpen(false); }}
              style={{
                display: "block",
                width: "100%",
                textAlign: dir === "rtl" ? "right" : "left",
                padding: "8px 12px",
                borderRadius: 8,
                background: l.code === lang ? "var(--paper)" : "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--ink)",
                fontSize: 14,
                fontFamily: "var(--wb-sans)",
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function AccountPage() {
  const { user, loading: authLoading, promptLogin, logout } = useAuth();
  const { lang, dir } = useLang();
  const router = useRouter();

  const [data, setData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Prompt login if not signed in
  useEffect(() => {
    if (authLoading) return;
    if (!user) promptLogin(v2(lang, "accountEyebrow"));
  }, [authLoading, user, lang, promptLogin]);

  // Fetch /api/account once we have a user
  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!user) { setLoading(false); return; }
      try {
        const idToken = await user.getIdToken();
        const res = await fetch("/api/account", {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (!res.ok) {
          if (!cancelled) setErrorMsg("Could not load account data.");
          return;
        }
        const json = (await res.json()) as AccountData;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setErrorMsg("Could not load account data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [user]);

  async function handleManageBilling() {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/portal", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const json = (await res.json().catch(() => ({}))) as {
        url?: string; error?: string;
      };
      if (json.url) { window.location.href = json.url; return; }
      const friendly =
        json.error === "no_subscription"
          ? lang === "he" ? "לא נמצא חשבון Stripe פעיל." :
            lang === "ar" ? "لا يوجد حساب Stripe نشط." :
            "No active Stripe subscription found."
          : lang === "he" ? "לא הצלחנו לפתוח את עמוד הבילינג." :
            lang === "ar" ? "تعذر فتح صفحة الفوترة." :
            "Could not open the billing portal.";
      window.alert(friendly);
    } catch (err) {
      console.error("Portal request failed:", err);
    }
  }

  async function handleSignOut() {
    await logout();
    router.push("/");
  }

  async function handleDeleteAccount() {
    const ok = window.confirm(
      lang === "he"
        ? "פעולת מחיקת חשבון אינה הפיכה. כל המנויים שלכם יבוטלו וכל הנתונים יימחקו. להמשיך?"
        : lang === "ar"
        ? "حذف الحساب لا يمكن التراجع عنه. سيتم إلغاء جميع اشتراكاتكم وستُحذف كل البيانات. الاستمرار؟"
        : "Account deletion is permanent. Any active subscriptions will be canceled and all data wiped. Continue?"
    );
    if (!ok || !user) return;
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) {
        window.alert(
          lang === "he" ? "מחיקת החשבון נכשלה." :
          lang === "ar" ? "فشل حذف الحساب." :
          "Account deletion failed."
        );
        return;
      }
      await logout();
      router.push("/");
    } catch (err) {
      console.error("Delete account failed:", err);
    }
  }

  // Renewal date string from trial end timestamp
  const renewalDate: string | null = (() => {
    if (!data?.trialEnd) return null;
    try {
      const d = new Date(data.trialEnd * 1000);
      const localeId =
        lang === "he" ? "he-IL" :
        lang === "ar" ? "ar" :
        lang === "ru" ? "ru-RU" :
        lang === "de" ? "de-DE" :
        lang === "cs" ? "cs-CZ" :
        lang === "es" ? "es-ES" :
        lang === "pt" ? "pt-BR" :
        lang === "fr" ? "fr-FR" : "en-US";
      return new Intl.DateTimeFormat(localeId, {
        year: "numeric", month: "short", day: "numeric",
      }).format(d);
    } catch { return null; }
  })();

  const firstName = data?.email ? data.email.split("@")[0].split(/[._-]/)[0] : "";

  return (
    <div className="wordbook wb-shell-page" dir={dir}>
      <header className="wb-shell-topbar">
        <Link href="/" className="wb-wordmark" dir="ltr">
          Gad<span className="wb-wordmark-it">it</span>
        </Link>
        <nav className="wb-shell-nav">
          <Link href="/" className="wb-shell-navlink wb-shell-navlink-icon" aria-label={v2(lang, "navSearch")} title={v2(lang, "navSearch")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m20 20-4-4" />
            </svg>
          </Link>
          <Link href="/pricing" className="wb-shell-navlink">{v2(lang, "navPricing")}</Link>
        </nav>
        <div className="wb-shell-actions">
          <ShareButton
            url="https://www.gadit.app/"
            title={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).title}
            text=""
            shareLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).shareLabel}
            copiedLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).copiedLabel}
          />
          <LangSwitch />
          {user ? <WbUserMenu /> : null}
        </div>
      </header>

      <main
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "clamp(28px, 5vw, 56px) clamp(20px, 4vw, 32px)",
          minHeight: "calc(100vh - 220px)",
        }}
      >
        {/* HERO */}
        <div style={{ marginBottom: "clamp(24px, 4vw, 40px)" }}>
          <div
            style={{
              fontFamily: "var(--wb-sans)",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--teal)",
            }}
          >
            {v2(lang, "accountEyebrow")}
          </div>
          <h1
            style={{
              fontFamily: "var(--wb-serif)",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "clamp(32px, 6vw, 56px)",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              color: "var(--ink)",
              marginTop: 12,
              overflowWrap: "anywhere",
            }}
          >
            {firstName
              ? v2(lang, "accountNamedSpaceTemplate", firstName)
              : v2(lang, "accountYourSpace")}
          </h1>
        </div>

        {/* CARD */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--hairline, #E5E7EB)",
            borderRadius: 18,
            padding: "clamp(24px, 4vw, 40px)",
            boxShadow: "0 1px 2px rgba(13,22,38,0.04), 0 12px 32px rgba(13,22,38,0.06)",
          }}
        >
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--ink-muted)" }}>
              {v2(lang, "srLoading")}
            </div>
          ) : errorMsg || !data ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--ink-muted)" }}>
              {errorMsg || "—"}
            </div>
          ) : (
            <>
              <PlanSection
                data={data}
                renewalDate={renewalDate}
                onManageBilling={handleManageBilling}
                onUpgrade={() => router.push("/pricing")}
                onChangePlan={() => router.push("/pricing")}
              />
              <Divider />
              <UsageSection data={data} />
              <Divider />
              <AccountSection
                data={data}
                onSignOut={handleSignOut}
                onDeleteAccount={handleDeleteAccount}
              />
            </>
          )}
        </div>
      </main>

      <footer className="wb-home-footer">
        <div className="wb-home-footer-inner">
          <Link href="/" className="wb-home-footer-link">{v2(lang, "navSearch")}</Link>
          <Link href="/pricing" className="wb-home-footer-link">{v2(lang, "navPricing")}</Link>
          <Link href="/features" className="wb-home-footer-link">{v2(lang, "navFeatures")}</Link>
        </div>
      </footer>
    </div>
  );
}

function Divider() {
  return (
    <div
      style={{
        height: 1,
        background: "var(--hairline, #E5E7EB)",
        margin: "32px 0",
      }}
    />
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "var(--wb-sans)",
        fontSize: 11.5,
        fontWeight: 600,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "var(--ink-muted, #6B7280)",
        marginBottom: 16,
      }}
    >
      {children}
    </div>
  );
}

function PlanSection({
  data, renewalDate, onManageBilling, onUpgrade, onChangePlan,
}: {
  data: AccountData;
  renewalDate: string | null;
  onManageBilling: () => void;
  onUpgrade: () => void;
  onChangePlan: () => void;
}) {
  const { lang } = useLang();
  const plan = data.plan;
  const noSubscription = !data.stripeCustomerId && plan === "basic";

  const tierName =
    plan === "deep" ? "Deep" :
    plan === "clear" ? "Clear" :
    v2(lang, "accountOnPlanFree");

  const tColor = tierColor(plan);
  const tBg = tierBg(plan);

  return (
    <section>
      <SectionLabel>{v2(lang, "accountPlanLabel")}</SectionLabel>

      {noSubscription ? (
        <>
          <h2
            style={{
              fontFamily: "var(--wb-serif)",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "clamp(28px, 4vw, 40px)",
              lineHeight: 1.1,
              color: "var(--ink)",
              letterSpacing: "-0.02em",
            }}
          >
            {v2(lang, "accountNoActiveSubscription")}
          </h2>
          <p
            style={{
              marginTop: 8,
              color: "var(--ink-muted, #6B7280)",
              fontSize: 14.5,
              lineHeight: 1.5,
              fontFamily: "var(--wb-sans)",
            }}
          >
            {v2(lang, "accountChooseAPlan")}
          </p>
          <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 10 }}>
            <PrimaryBtn onClick={onUpgrade}>{v2(lang, "accountUpgrade")}</PrimaryBtn>
          </div>
        </>
      ) : (
        <>
          {data.isTrial && data.trialDaysLeft > 0 && (
            <div
              style={{
                display: "inline-block",
                padding: "5px 12px",
                borderRadius: 999,
                background: tBg,
                color: tColor,
                fontFamily: "var(--wb-sans)",
                fontSize: 11.5,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              {v2(lang, "accountTrialBadgeTemplate", data.trialDaysLeft)}
            </div>
          )}
          <h2
            style={{
              fontFamily: "var(--wb-serif)",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "clamp(48px, 7vw, 72px)",
              lineHeight: 1,
              color: tColor,
              letterSpacing: "-0.025em",
            }}
          >
            {tierName}
          </h2>
          {(data.cancelAtPeriodEnd || renewalDate) && (
            <p
              style={{
                marginTop: 12,
                color: "var(--ink-muted, #6B7280)",
                fontSize: 14,
                fontFamily: "var(--wb-sans)",
              }}
            >
              {data.cancelAtPeriodEnd
                ? v2(lang, "accountCancelsAtPeriodEnd")
                : renewalDate ? v2(lang, "accountRenewsOnTemplate", renewalDate) : ""}
            </p>
          )}
          <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 10 }}>
            {plan === "basic" ? (
              <>
                <PrimaryBtn onClick={onUpgrade}>{v2(lang, "accountUpgrade")}</PrimaryBtn>
                <GhostBtn onClick={onChangePlan}>{v2(lang, "accountChangePlan")}</GhostBtn>
              </>
            ) : (
              <>
                <GhostBtn onClick={onManageBilling}>{v2(lang, "accountManageBilling")}</GhostBtn>
                <GhostBtn onClick={onChangePlan}>{v2(lang, "accountChangePlan")}</GhostBtn>
              </>
            )}
          </div>
        </>
      )}
    </section>
  );
}

function UsageSection({ data }: { data: AccountData }) {
  const { lang } = useLang();
  return (
    <section>
      <SectionLabel>{v2(lang, "accountUsageThisMonth")}</SectionLabel>
      <Meter
        label={v2(lang, "accountImageGeneration")}
        used={data.images.used}
        limit={data.images.limit > 0 ? data.images.limit : 0}
        locked={data.plan === "basic"}
        plan={data.plan}
      />
      {data.plan !== "basic" && (
        <Meter
          label={v2(lang, "accountSearches")}
          used={0}
          limit={null}
          plan={data.plan}
        />
      )}
    </section>
  );
}

function Meter({
  label, used, limit, locked = false, plan,
}: {
  label: string;
  used: number;
  limit: number | null;
  locked?: boolean;
  plan: Plan;
}) {
  const { lang, dir } = useLang();
  const isUnlimited = limit === null;
  const pct = locked
    ? 0
    : isUnlimited
    ? Math.min(100, (used / 500) * 100)
    : Math.min(100, (used / limit!) * 100);
  const accent = tierColor(plan);

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span
          style={{
            fontFamily: "var(--wb-sans)",
            fontSize: 14,
            fontWeight: 500,
            color: "var(--ink)",
          }}
        >
          {label}
        </span>
        <span
          style={{ fontFamily: "var(--wb-sans)", fontSize: 14 }}
          dir="ltr"
        >
          {locked ? (
            <span style={{ color: "var(--ink-muted, #6B7280)" }}>{v2(lang, "accountLocked")}</span>
          ) : (
            <>
              <span style={{ color: "var(--ink)" }}>{used}</span>
              <span style={{ color: "var(--ink-muted, #6B7280)" }}>
                {" / "}{isUnlimited ? v2(lang, "accountUnlimited") : limit}
              </span>
            </>
          )}
        </span>
      </div>
      <div
        style={{
          height: 6,
          borderRadius: 999,
          background: "#F3F4F6",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            insetBlock: 0,
            insetInlineStart: 0,
            width: locked ? "100%" : `${pct}%`,
            background: locked
              ? "repeating-linear-gradient(45deg, #E5E7EB, #E5E7EB 4px, #F3F4F6 4px, #F3F4F6 8px)"
              : accent,
            transition: "width 300ms",
          }}
        />
      </div>
      {/* explicit dir for left/right text alignment cohesion */}
      <span style={{ display: "none" }} dir={dir} />
    </div>
  );
}

function AccountSection({
  data, onSignOut, onDeleteAccount,
}: {
  data: AccountData;
  onSignOut: () => void;
  onDeleteAccount: () => void;
}) {
  const { lang } = useLang();
  return (
    <section>
      <SectionLabel>{v2(lang, "accountSectionLabel")}</SectionLabel>

      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            fontFamily: "var(--wb-sans)",
            fontSize: 11.5,
            color: "var(--ink-muted, #6B7280)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            fontWeight: 600,
            marginBottom: 6,
          }}
        >
          {v2(lang, "accountEmailLabel")}
        </div>
        <div
          dir="ltr"
          style={{
            fontFamily: "var(--wb-sans)",
            fontSize: 15,
            color: "var(--ink)",
            wordBreak: "break-all",
          }}
        >
          {data.email ?? ""}
        </div>
      </div>

      <PrimaryBtn onClick={onSignOut}>{v2(lang, "accountSignOut")}</PrimaryBtn>

      <div
        style={{
          marginTop: 48,
          paddingTop: 20,
          borderTop: "1px dashed #D1D5DB",
        }}
      >
        <button
          type="button"
          onClick={onDeleteAccount}
          style={{
            background: "transparent",
            border: "none",
            padding: 0,
            color: "var(--ink-muted, #6B7280)",
            fontSize: 12,
            cursor: "pointer",
            fontFamily: "var(--wb-sans)",
            textDecoration: "underline",
          }}
        >
          {v2(lang, "accountDeleteAccount")}
        </button>
      </div>
    </section>
  );
}

// ─── Buttons ───────────────────────────────────────────────
function PrimaryBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "11px 22px",
        borderRadius: 12,
        background: "var(--teal, #0EA5A5)",
        color: "white",
        border: "none",
        cursor: "pointer",
        fontFamily: "var(--wb-sans)",
        fontSize: 14,
        fontWeight: 600,
        boxShadow: "0 1px 2px rgba(11,138,138,0.2), 0 4px 12px rgba(11,138,138,0.15)",
      }}
    >
      {children}
    </button>
  );
}

function GhostBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "11px 18px",
        borderRadius: 12,
        background: "transparent",
        color: "var(--ink)",
        border: "1px solid var(--hairline, #E5E7EB)",
        cursor: "pointer",
        fontFamily: "var(--wb-sans)",
        fontSize: 14,
        fontWeight: 500,
      }}
    >
      {children}
    </button>
  );
}
