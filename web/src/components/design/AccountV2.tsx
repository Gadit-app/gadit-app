"use client";

/**
 * AccountV2 — Screen 10 from the redesign pass.
 *
 * The user's profile + subscription dashboard. Three sections stacked
 * on a single warm-paper card: Plan / Usage / Account. Calm and
 * informational — explicitly NOT a settings panel.
 *
 * Schema: /api/account returns:
 *   { plan, email, stripeCustomerId, subscriptionId,
 *     subscriptionStatus, isTrial, trialDaysLeft, trialEnd,
 *     cancelAtPeriodEnd, images: { used, limit, monthKey } }
 *
 * The "no active subscription" state is detected by stripeCustomerId
 * being null — the user is signed in but never subscribed/checked out.
 *
 * Searches usage isn't returned by the API today; rendered as
 * "unlimited" for paid tiers, hidden for Basic until rate-limit
 * counters get plumbed through (post-launch). The Basic-tier daily
 * search counter (X / 20 today) is sourced from a forthcoming API
 * field — for now we render "unlimited" placeholder text.
 */

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { v2 } from "@/lib/i18n-v2";
import { Eyebrow } from "./primitives";

type Script = "latin" | "he" | "ar";
function scriptFor(lang: string): Script {
  if (lang === "he") return "he";
  if (lang === "ar") return "ar";
  return "latin";
}
function fontDisplay(s: Script) {
  return s === "he" ? "gd-font-he" : s === "ar" ? "gd-font-ar" : "gd-font-display";
}

interface AccountData {
  plan: "basic" | "clear" | "deep";
  email: string | null;
  stripeCustomerId: string | null;
  subscriptionStatus: string | null;
  isTrial: boolean;
  trialDaysLeft: number;
  trialEnd: number | null;
  cancelAtPeriodEnd: boolean;
  images: { used: number; limit: number; monthKey: string };
}

// ─── Section header (with hairline rule) ────────────────────
function SectionHeader({ children }: { children: ReactNode }) {
  const { dir } = useLang();
  const isRtl = dir === "rtl";
  return (
    <div
      className={`pb-3 mb-5 ${isRtl ? "text-right" : ""}`}
      style={{ borderBottom: "1px solid oklch(0.85 0.005 265)" }}
    >
      <Eyebrow style={{ color: "oklch(0.4 0.14 250)" }}>{children}</Eyebrow>
    </div>
  );
}

// ─── Buttons ────────────────────────────────────────────────
function PrimaryBtn({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="gd-font-sans-ui font-medium"
      style={{
        padding: "11px 22px",
        borderRadius: 12,
        background:
          "linear-gradient(180deg, oklch(0.78 0.17 245), oklch(0.62 0.2 250))",
        color: "white",
        fontSize: 14,
        boxShadow:
          "0 0 0 1px oklch(0.5 0.2 250 / 0.6), 0 8px 22px oklch(0.5 0.2 250 / 0.4)",
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? "default" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

function GhostBtn({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="gd-font-sans-ui"
      style={{
        padding: "11px 18px",
        borderRadius: 12,
        background: "transparent",
        color: "var(--gd-ink-900)",
        fontSize: 14,
        fontWeight: 500,
        boxShadow: "inset 0 0 0 1px oklch(0.85 0.005 265)",
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "default" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

// ─── Plan section ──────────────────────────────────────────
function PlanSection({
  data,
  onManageBilling,
  onChangePlan,
  onUpgrade,
}: {
  data: AccountData;
  onManageBilling: () => void;
  onChangePlan: () => void;
  onUpgrade: () => void;
}) {
  const { lang, dir } = useLang();
  const isRtl = dir === "rtl";
  const script = scriptFor(lang);

  const plan = data.plan;
  const noSubscription = !data.stripeCustomerId && plan === "basic";

  const tierColor =
    plan === "deep"
      ? "oklch(0.42 0.15 250)"
      : plan === "clear"
        ? "oklch(0.5 0.18 250)"
        : "oklch(0.4 0.02 265)";
  const tierName =
    plan === "deep"
      ? "Deep"
      : plan === "clear"
        ? "Clear"
        : v2(lang, "accountOnPlanFree");

  // Locale-aware renewal date from trialEnd (when trialing) — for paid
  // users without trial we don't have an exact next-charge date in the
  // API response, so we omit the line. Stripe portal shows the canonical.
  const renewalDate: string | null = (() => {
    if (!data.trialEnd) return null;
    try {
      const d = new Date(data.trialEnd * 1000);
      const localeId =
        lang === "he" ? "he-IL" : lang === "ar" ? "ar" : "en-US";
      return new Intl.DateTimeFormat(localeId, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(d);
    } catch {
      return null;
    }
  })();

  return (
    <section style={{ marginBlockEnd: 44 }}>
      <SectionHeader>{v2(lang, "accountPlanLabel")}</SectionHeader>

      {noSubscription ? (
        <div>
          <h2
            className={fontDisplay(script)}
            style={{
              fontSize: "clamp(36px, 5vw, 48px)",
              color: "var(--gd-ink-700)",
              fontStyle: script === "latin" ? "italic" : "normal",
              letterSpacing: script === "latin" ? "-0.02em" : 0,
              lineHeight: 1.05,
              ...(script === "latin"
                ? { fontVariationSettings: '"opsz" 96', fontWeight: 400 }
                : { fontWeight: 600 }),
            }}
          >
            {v2(lang, "accountNoActiveSubscription")}
          </h2>
          <p
            className="gd-font-sans-ui mt-3"
            style={{
              fontSize: 14.5,
              color: "var(--gd-ink-500)",
              lineHeight: 1.5,
            }}
          >
            {v2(lang, "accountChooseAPlan")}
          </p>
          <div
            className={`mt-6 flex gap-3 flex-wrap ${isRtl ? "flex-row-reverse" : ""}`}
          >
            <PrimaryBtn onClick={onUpgrade}>
              {v2(lang, "accountUpgrade")}
            </PrimaryBtn>
          </div>
        </div>
      ) : (
        <div>
          {/* Trial badge */}
          {data.isTrial && data.trialDaysLeft > 0 && (
            <div
              className="gd-font-sans-ui inline-flex items-center gap-2 mb-3"
              style={{
                fontSize: 11.5,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontWeight: 600,
                padding: "5px 12px",
                borderRadius: 999,
                color: "oklch(0.45 0.16 250)",
                background: "oklch(0.72 0.19 245 / 0.1)",
                boxShadow: "inset 0 0 0 1px oklch(0.72 0.19 245 / 0.3)",
              }}
            >
              <span className="gd-tier-dot" />
              {v2(lang, "accountTrialBadgeTemplate", data.trialDaysLeft)}
            </div>
          )}

          {/* Tier name in display Fraunces */}
          <div
            className={`flex items-baseline gap-3 ${isRtl ? "flex-row-reverse" : ""}`}
          >
            <h2
              className="gd-font-display"
              style={{
                fontSize: "clamp(56px, 9vw, 72px)",
                color: tierColor,
                fontStyle: "italic",
                letterSpacing: "-0.025em",
                lineHeight: 1,
                fontVariationSettings: '"opsz" 144, "SOFT" 80',
                fontWeight: 400,
                textShadow:
                  plan === "deep"
                    ? "0 0 40px oklch(0.5 0.2 250 / 0.2)"
                    : "none",
              }}
            >
              {tierName}
            </h2>
            {plan === "deep" && (
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: "oklch(0.5 0.18 250)",
                  boxShadow:
                    "0 0 0 4px oklch(0.5 0.18 250 / 0.18), 0 0 20px oklch(0.5 0.18 250 / 0.4)",
                  marginBlockEnd: 14,
                }}
              />
            )}
          </div>

          {/* Renewal/cancellation line */}
          {(data.cancelAtPeriodEnd || renewalDate) && (
            <p
              className={`gd-font-sans-ui mt-3 ${isRtl ? "text-right" : ""}`}
              style={{ fontSize: 14, color: "var(--gd-ink-500)" }}
            >
              {data.cancelAtPeriodEnd
                ? v2(lang, "accountCancelsAtPeriodEnd")
                : renewalDate
                  ? v2(lang, "accountRenewsOnTemplate", renewalDate)
                  : ""}
            </p>
          )}

          {/* CTAs */}
          <div
            className={`mt-6 flex gap-2 flex-wrap ${isRtl ? "flex-row-reverse" : ""}`}
          >
            {plan === "basic" ? (
              <>
                <PrimaryBtn onClick={onUpgrade}>
                  {v2(lang, "accountUpgrade")}
                </PrimaryBtn>
                <GhostBtn onClick={onChangePlan}>
                  {v2(lang, "accountChangePlan")}
                </GhostBtn>
              </>
            ) : (
              <>
                <GhostBtn onClick={onManageBilling}>
                  {v2(lang, "accountManageBilling")}
                </GhostBtn>
                <GhostBtn onClick={onChangePlan}>
                  {v2(lang, "accountChangePlan")}
                </GhostBtn>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Usage meter ───────────────────────────────────────────
function UsageMeter({
  label,
  used,
  limit,
  locked = false,
  daily = false,
}: {
  label: string;
  used: number;
  limit: number | null; // null = unlimited
  locked?: boolean;
  daily?: boolean;
}) {
  const { lang, dir } = useLang();
  const isRtl = dir === "rtl";
  const isUnlimited = limit === null;
  const pct = locked
    ? 0
    : isUnlimited
      ? Math.min(100, (used / 500) * 100)
      : Math.min(100, (used / limit!) * 100);
  const nearing = !locked && !isUnlimited && pct > 90;

  return (
    <div style={{ marginBlockEnd: 22 }}>
      <div
        className={`flex items-baseline justify-between mb-2 ${isRtl ? "flex-row-reverse" : ""}`}
      >
        <span
          className="gd-font-sans-ui"
          style={{
            fontSize: 14,
            color: "var(--gd-ink-700)",
            fontWeight: 500,
          }}
        >
          {label}
        </span>
        <span className="gd-font-sans-ui" style={{ fontSize: 14 }}>
          {locked ? (
            <span style={{ color: "var(--gd-ink-500)" }}>
              {v2(lang, "accountLocked")}
            </span>
          ) : (
            <>
              <span style={{ color: "var(--gd-ink-900)" }}>{used}</span>
              <span style={{ color: "var(--gd-ink-500)" }}>
                {" "}
                / {isUnlimited ? v2(lang, "accountUnlimited") : limit}
                {daily ? " " + v2(lang, "accountTodaySuffix") : ""}
              </span>
            </>
          )}
        </span>
      </div>
      <div
        style={{
          height: 6,
          borderRadius: 999,
          background: "oklch(0.94 0.005 265)",
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
              ? "repeating-linear-gradient(45deg, oklch(0.85 0.005 265), oklch(0.85 0.005 265) 4px, oklch(0.92 0.005 265) 4px, oklch(0.92 0.005 265) 8px)"
              : isUnlimited
                ? "linear-gradient(90deg, oklch(0.7 0.13 250 / 0.4), oklch(0.7 0.13 250 / 0.7))"
                : nearing
                  ? "linear-gradient(90deg, oklch(0.78 0.15 75), oklch(0.65 0.18 60))"
                  : "linear-gradient(90deg, oklch(0.78 0.17 245), oklch(0.62 0.2 250))",
            transition: "width 300ms",
          }}
        />
      </div>
      {nearing && (
        <p
          className="gd-font-sans-ui mt-1.5"
          style={{ fontSize: 11.5, color: "oklch(0.55 0.16 60)" }}
        >
          {v2(lang, "accountNearingLimit")}
        </p>
      )}
    </div>
  );
}

function UsageSection({ data }: { data: AccountData }) {
  const { lang } = useLang();
  return (
    <section style={{ marginBlockEnd: 44 }}>
      <SectionHeader>{v2(lang, "accountUsageThisMonth")}</SectionHeader>
      <UsageMeter
        label={v2(lang, "accountImageGeneration")}
        used={data.images.used}
        limit={data.images.limit > 0 ? data.images.limit : 0}
        locked={data.plan === "basic"}
      />
      {/* Searches: paid tiers are unlimited; Basic shows daily counter
          if the API ever surfaces one. For now we render unlimited for
          paid and just hide the meter for Basic to avoid a misleading
          0/20 placeholder. */}
      {data.plan !== "basic" && (
        <UsageMeter
          label={v2(lang, "accountSearches")}
          used={0}
          limit={null}
        />
      )}
    </section>
  );
}

// ─── Account info section ──────────────────────────────────
function AccountInfoSection({
  data,
  onSignOut,
  onDeleteAccount,
}: {
  data: AccountData;
  onSignOut: () => void;
  onDeleteAccount: () => void;
}) {
  const { lang, dir } = useLang();
  const isRtl = dir === "rtl";

  return (
    <section>
      <SectionHeader>{v2(lang, "accountSectionLabel")}</SectionHeader>

      <div
        className={`flex items-baseline justify-between gap-3 mb-5 flex-wrap ${isRtl ? "flex-row-reverse" : ""}`}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            className="gd-font-sans-ui mb-1"
            style={{
              fontSize: 11.5,
              color: "var(--gd-ink-500)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            {v2(lang, "accountEmailLabel")}
          </div>
          <div
            className="gd-font-sans-ui"
            style={{
              fontSize: 15,
              color: "var(--gd-ink-900)",
              wordBreak: "break-all",
            }}
          >
            {data.email ?? ""}
          </div>
        </div>
      </div>

      <GhostBtn onClick={onSignOut}>{v2(lang, "accountSignOut")}</GhostBtn>

      {/* Delete — very low prominence, footer-style under a dashed rule */}
      <div
        className={`mt-12 pt-5 ${isRtl ? "text-right" : ""}`}
        style={{ borderTop: "1px dashed oklch(0.88 0.005 265)" }}
      >
        <button
          type="button"
          onClick={onDeleteAccount}
          className="gd-font-sans-ui hover:text-[oklch(0.5_0.13_25)] transition-colors"
          style={{
            fontSize: 12,
            color: "var(--gd-ink-500)",
            cursor: "pointer",
            background: "transparent",
            padding: 0,
          }}
        >
          {v2(lang, "accountDeleteAccount")}
        </button>
      </div>
    </section>
  );
}

// ─── Hero strip ────────────────────────────────────────────
function AccountHero({ data }: { data: AccountData }) {
  const { lang, dir } = useLang();
  const isRtl = dir === "rtl";
  const script = scriptFor(lang);

  // First name fallback from email local-part
  const firstName = data.email
    ? data.email.split("@")[0].split(/[._-]/)[0]
    : "";
  const initials = (firstName || data.email || "U").slice(0, 1).toUpperCase();

  return (
    <div
      style={{
        marginBlockEnd: "clamp(36px, 5vw, 56px)",
        textAlign: isRtl ? "right" : "left",
      }}
    >
      <Eyebrow style={{ color: "oklch(0.85 0.05 245)" }}>
        {v2(lang, "accountEyebrow")}
      </Eyebrow>
      <h1
        className={fontDisplay(script)}
        style={{
          fontSize: "clamp(38px, 6vw, 60px)",
          color: "oklch(0.97 0.008 265)",
          marginTop: 12,
          lineHeight: 1.05,
          ...(script === "latin"
            ? {
                fontVariationSettings: '"opsz" 144, "SOFT" 80',
                fontWeight: 400,
                letterSpacing: "-0.025em",
              }
            : { fontWeight: 600 }),
        }}
      >
        {firstName
          ? v2(lang, "accountNamedSpaceTemplate", firstName)
          : v2(lang, "accountYourSpace")}
      </h1>
      {data.email && (
        <div
          className={`mt-5 flex items-center gap-3 ${isRtl ? "flex-row-reverse" : ""}`}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              background:
                "linear-gradient(135deg, oklch(0.55 0.18 250), oklch(0.42 0.15 260))",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 600,
              boxShadow: "inset 0 0 0 1px oklch(1 0 0 / 0.15)",
            }}
          >
            {initials}
          </div>
          <span
            className="gd-font-sans-ui"
            style={{ fontSize: 14, color: "oklch(0.7 0.02 265)" }}
          >
            {data.email}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Main AccountV2 ───────────────────────────────────────
export function AccountV2() {
  const { user, logout } = useAuth();
  const { lang } = useLang();
  const router = useRouter();

  const [data, setData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const idToken = await user.getIdToken();
        const res = await fetch("/api/account", {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (!res.ok) {
          if (cancelled) return;
          setErrorMsg("Could not load account data.");
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
    return () => {
      cancelled = true;
    };
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
        url?: string;
        error?: string;
        message?: string;
        details?: string;
      };
      if (json.url) {
        window.location.href = json.url;
        return;
      }
      console.error("Portal error:", { status: res.status, body: json });
      const friendly =
        json.error === "no_subscription"
          ? lang === "he"
            ? "לא נמצא חשבון Stripe פעיל למשתמש הזה."
            : lang === "ar"
              ? "لا يوجد حساب Stripe نشط لهذا المستخدم."
              : "No active Stripe subscription found for this account."
          : lang === "he"
            ? "לא הצלחנו לפתוח את עמוד הבילינג. נסה שוב."
            : lang === "ar"
              ? "تعذر فتح صفحة الفوترة. حاول مرة أخرى."
              : "Could not open the billing portal. Please try again.";
      window.alert(friendly);
    } catch (err) {
      console.error("Portal request failed:", err);
      window.alert(
        lang === "he"
          ? "לא הצלחנו לפתוח את עמוד הבילינג. נסה שוב."
          : lang === "ar"
            ? "تعذر فتح صفحة الفوترة. حاول مرة أخرى."
            : "Could not open the billing portal. Please try again."
      );
    }
  }

  function handleChangePlan() {
    router.push("/pricing");
  }

  function handleUpgrade() {
    router.push("/pricing");
  }

  async function handleSignOut() {
    await logout();
    router.push("/");
  }

  function handleDeleteAccount() {
    // Confirmation modal is post-launch; for now require confirm() as a
    // safety net so accidental clicks don't delete anything in the API.
    const ok = window.confirm(
      lang === "he"
        ? "פעולת מחיקת חשבון אינה הפיכה. להמשיך?"
        : lang === "ar"
          ? "حذف الحساب لا يمكن التراجع عنه. الاستمرار؟"
          : "Account deletion is permanent. Continue?"
    );
    if (!ok) return;
    // No /api/account/delete endpoint yet — log and surface a friendly
    // notice. Wired properly post-launch.
    console.warn("Delete account requested — endpoint not implemented yet.");
  }

  if (loading) {
    return (
      <div
        className="gd-card"
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "60px 40px",
          textAlign: "center",
          opacity: 0.6,
        }}
      >
        <span
          className="gd-font-sans-ui"
          style={{ fontSize: 14, color: "oklch(0.65 0.03 265)" }}
        >
          {/* Use sr-loading for now; an account-specific spinner string
              is overkill. */}
          {v2(lang, "srLoading")}
        </span>
      </div>
    );
  }

  if (errorMsg || !data) {
    return (
      <div
        className="gd-card"
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "60px 40px",
          textAlign: "center",
        }}
      >
        <span
          className="gd-font-sans-ui"
          style={{ fontSize: 14, color: "var(--gd-ink-700)" }}
        >
          {errorMsg || "—"}
        </span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", paddingInline: 24 }}>
      <AccountHero data={data} />

      <div
        className="gd-card"
        style={{
          padding: "clamp(28px, 4vw, 44px) clamp(24px, 4vw, 48px)",
        }}
      >
        <PlanSection
          data={data}
          onManageBilling={handleManageBilling}
          onChangePlan={handleChangePlan}
          onUpgrade={handleUpgrade}
        />
        <UsageSection data={data} />
        <AccountInfoSection
          data={data}
          onSignOut={handleSignOut}
          onDeleteAccount={handleDeleteAccount}
        />
      </div>
    </div>
  );
}
