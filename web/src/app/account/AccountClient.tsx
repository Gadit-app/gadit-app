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
import { useHref } from "@/lib/href";
import { countCached, setCachedWord } from "@/lib/offline-db";

type Plan = "basic" | "clear" | "deep";

// Per-language font stacks. The wordbook surface inherits Inter as
// default; Hebrew and Arabic explicitly switch to the Rubik / Noto
// Naskh families so neither display nor body text falls back to a
// system Hebrew font (which read flat against the rest of the design).
function fontDisplay(lang: Lang): string {
  if (lang === "he") return "var(--wb-he)";
  if (lang === "ar") return "var(--wb-ar)";
  return "var(--wb-serif)";
}
function fontBody(lang: Lang): string {
  if (lang === "he") return "var(--wb-he)";
  if (lang === "ar") return "var(--wb-ar)";
  return "var(--wb-sans)";
}
// Italic is a Latin-only typographic device. Hebrew and Arabic don't
// have italic forms — applying font-style:italic just slants the glyphs
// crudely, which looks worse than upright. Suppress italic for both.
function displayItalic(lang: Lang): "italic" | "normal" {
  return lang === "he" || lang === "ar" ? "normal" : "italic";
}

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
                fontFamily: fontBody(lang),
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
  const { user, plan, loading: authLoading, promptLogin, logout } = useAuth();
  const { lang, dir } = useLang();
  const router = useRouter();
  const href = useHref();

  const [data, setData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>("");
  // How many word definitions the user has cached for offline use.
  // Only meaningful for Clear/Deep — Basic never writes to the cache.
  const [offlineCount, setOfflineCount] = useState<number | null>(null);
  // Pack-download state: "idle" → "downloading" → "done"; errors get
  // surfaced via packError so the user knows the action didn't silently
  // fail (e.g. an offline → tap → still offline situation).
  const [packState, setPackState] = useState<"idle" | "downloading" | "done">("idle");
  const [packError, setPackError] = useState<string | null>(null);
  useEffect(() => {
    if (!user) return;
    void countCached().then((n) => setOfflineCount(n));
  }, [user]);

  async function handleDownloadPack() {
    if (!user) return;
    setPackState("downloading");
    setPackError(null);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(`/api/popular-words?lang=${encodeURIComponent(lang)}&limit=500`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
        throw new Error(j.message ?? j.error ?? `HTTP ${res.status}`);
      }
      const data = (await res.json()) as {
        words: Array<{
          word: string;
          language: string;
          result: { meanings?: Array<{ meaning?: string }> } & Record<string, unknown>;
        }>;
      };
      // Two writes per word:
      // 1. IndexedDB so the full result is available offline (pinned=true
      //    protects it from any future auto-prune).
      // 2. The user's Firestore Notebook so the words actually SHOW UP
      //    somewhere the user can browse them — without this they would
      //    sit invisibly in IDB with no UI surface.
      const notebookEntries: Array<{ word: string; language: string; meaning: string }> = [];
      for (const w of data.words) {
        await setCachedWord(lang, w.word, w.result, { pinned: true });
        // Short meaning for the Notebook card — use the first meaning
        // line, trimmed. Same shape the per-word save path uses.
        const firstMeaning = w.result?.meanings?.[0]?.meaning ?? "";
        if (firstMeaning) {
          notebookEntries.push({
            word: w.word,
            language: w.language || "",
            meaning: firstMeaning,
          });
        }
      }
      // Bulk-add to the Notebook via PUT /api/notebook. Chunked to 500
      // to match the endpoint's per-request cap (it'll reject larger).
      const CHUNK = 500;
      for (let i = 0; i < notebookEntries.length; i += CHUNK) {
        const slice = notebookEntries.slice(i, i + CHUNK);
        await fetch("/api/notebook", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ entries: slice }),
        });
      }
      const fresh = await countCached();
      setOfflineCount(fresh);
      setPackState("done");
    } catch (e) {
      console.warn("[pack] download failed:", e);
      setPackError(String(e instanceof Error ? e.message : e));
      setPackState("idle");
    }
  }

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
    router.push(href("/"));
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
      router.push(href("/"));
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
        lang === "sk" ? "sk-SK" :
        lang === "es" ? "es-ES" :
        lang === "pt" ? "pt-BR" :
        lang === "fr" ? "fr-FR" : "en-US";
      return new Intl.DateTimeFormat(localeId, {
        year: "numeric", month: "short", day: "numeric",
      }).format(d);
    } catch { return null; }
  })();

  // Pull first name. Prefer Firebase Auth displayName because Google sign-in
  // provides the real "Sharon Ben Lavi" with spaces, which splits cleanly
  // on whitespace. Fall back to the email local part (split on . _ -) for
  // email/password users who don't have a displayName. Capitalize the
  // first letter so "sharon" → "Sharon" in the hero.
  const effectiveEmail = data?.email ?? user?.email ?? null;
  const rawFirst =
    user?.displayName?.split(/\s+/)[0] ||
    effectiveEmail?.split("@")[0].split(/[._-]/)[0] ||
    "";
  const firstName = rawFirst
    ? rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1)
    : "";

  return (
    <div className="wordbook wb-shell-page" dir={dir}>
      <header className="wb-shell-topbar">
        <Link href={href("/")} className="wb-wordmark" dir="ltr">
          Gad<span className="wb-wordmark-it">it</span>
        </Link>
        <nav className="wb-shell-nav">
          <Link href={href("/")} className="wb-shell-navlink wb-shell-navlink-icon" aria-label={v2(lang, "navSearch")} title={v2(lang, "navSearch")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m20 20-4-4" />
            </svg>
          </Link>
          <Link href={href("/features")} className="wb-shell-navlink">{v2(lang, "navFeatures")}</Link>
          <Link href={href("/notebook")} className="wb-shell-navlink">{v2(lang, "navNotebook")}</Link>
          <Link href={href("/play")} className="wb-shell-navlink">{v2(lang, "navPlay")}</Link>
          <Link href={href("/pricing")} className="wb-shell-navlink">{v2(lang, "navPricing")}</Link>
          <Link href={href("/affiliates")} className="wb-shell-navlink">{v2(lang, "navAffiliates")}</Link>
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
          maxWidth: 880,
          margin: "0 auto",
          padding: "clamp(28px, 5vw, 56px) clamp(24px, 5vw, 32px)",
          minHeight: "calc(100vh - 220px)",
        }}
      >
        {/* HERO — centered above the card so the user's name sits
            optically over the page, not anchored to the start edge.
            The card below can still span the full main width. */}
        <div
          style={{
            marginBottom: "clamp(28px, 5vw, 48px)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: fontBody(lang),
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
              fontFamily: fontDisplay(lang),
              fontStyle: displayItalic(lang),
              fontWeight: lang === "he" || lang === "ar" ? 700 : 400,
              fontSize: "clamp(32px, 6vw, 56px)",
              lineHeight: 1.05,
              letterSpacing: lang === "he" || lang === "ar" ? 0 : "-0.02em",
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

        {/* Each topic group lives in its own bordered card. The earlier
            single-outer-card layout grouped everything visually but
            users couldn't see WHERE plan ended and usage began without
            tracing the hairline divider with their eyes. One card per
            topic ('plan', 'usage', 'offline', 'account') makes the
            boundaries unmistakable. */}
        {loading ? (
          <SectionCard>
            <div style={{ textAlign: "center", padding: "32px 0", color: "var(--ink-muted)" }}>
              {v2(lang, "srLoading")}
            </div>
          </SectionCard>
        ) : errorMsg || !data ? (
          <SectionCard>
            <div style={{ textAlign: "center", padding: "32px 0", color: "var(--ink-muted)" }}>
              {errorMsg || "—"}
            </div>
          </SectionCard>
        ) : (
          <>
            <SectionCard>
              <PlanSection
                data={data}
                renewalDate={renewalDate}
                onManageBilling={handleManageBilling}
                onUpgrade={() => router.push(href("/pricing"))}
                onChangePlan={() => router.push(href("/pricing"))}
              />
            </SectionCard>
            <SectionCard>
              <UsageSection
                data={data}
                offlineCount={offlineCount}
              />
            </SectionCard>
            {data.plan !== "basic" && (
              <SectionCard>
                <OfflinePackSection
                  data={data}
                  packState={packState}
                  packError={packError}
                  onDownloadPack={handleDownloadPack}
                />
              </SectionCard>
            )}
            <SectionCard>
              <AccountSection
                data={data}
                emailFallback={user?.email ?? null}
                onSignOut={handleSignOut}
                onDeleteAccount={handleDeleteAccount}
              />
            </SectionCard>
          </>
        )}
      </main>

      <footer className="wb-home-footer">
        <div className="wb-home-footer-inner">
          <Link href={href("/")} className="wb-home-footer-link">{v2(lang, "navSearch")}</Link>
          <Link href={href("/pricing")} className="wb-home-footer-link">{v2(lang, "navPricing")}</Link>
          <Link href={href("/features")} className="wb-home-footer-link">{v2(lang, "navFeatures")}</Link>
        </div>
      </footer>
    </div>
  );
}

/**
 * One bordered tile per topic group. The whole reason this exists is
 * the scan-ability test: a user opening /account should be able to
 * answer "where do I change my plan?" / "where do I sign out?" by
 * pattern-matching distinct rectangles, not by reading paragraph
 * headings inside one long card.
 */
function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--hairline, #E5E7EB)",
        borderRadius: 18,
        padding: "clamp(24px, 4vw, 36px)",
        boxShadow: "0 1px 2px rgba(13,22,38,0.04), 0 6px 18px rgba(13,22,38,0.04)",
        marginBottom: 16,
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  const { lang } = useLang();
  // Section headings used to render as a tiny 11.5px tracked-out
  // uppercase eyebrow — easy to miss, hard to use as a scan anchor.
  // Now: 16px, bold, lower-case, in the body font with extra space
  // below so each section's content reads as 'belonging to' the
  // heading. This is the line the user is meant to scan to find
  // 'plan' vs 'usage' vs 'account'.
  return (
    <h2
      style={{
        fontFamily: fontBody(lang),
        fontSize: 16,
        fontWeight: 700,
        letterSpacing: 0,
        textTransform: "none",
        color: "var(--ink)",
        margin: "0 0 24px",
        lineHeight: 1.2,
      }}
    >
      {children}
    </h2>
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
  const href = useHref();
  const plan = data.plan;

  // Help-link text for the "Need help with billing?" deep-link to
  // /contact#billing. We add this for paying users because that's
  // where billing issues hit (wrong card, refund question, can't
  // open the portal) — inlined here rather than added to v2 so we
  // can ship without a 12-locale translation pass. Locales that
  // aren't covered fall through to the EN string, which is fine
  // for a small contextual link.
  const billingHelp =
    lang === "he" ? "בעיה? המדריך לחיוב ›" :
    lang === "ar" ? "مشكلة؟ دليل الفوترة ›" :
    lang === "ru" ? "Нужна помощь? Руководство по оплате ›" :
    lang === "es" ? "¿Problemas? Guía de facturación ›" :
    lang === "pt" ? "Problema? Guia de faturamento ›" :
    lang === "fr" ? "Un souci ? Guide de facturation ›" :
    lang === "de" ? "Probleme? Hilfe zur Abrechnung ›" :
    lang === "cs" ? "Problém? Návod k fakturaci ›" :
    lang === "sk" ? "Problém? Návod k fakturácii ›" :
    lang === "it" ? "Problemi? Guida alla fatturazione ›" :
    lang === "ja" ? "お困りですか? 請求の手引き ›" :
    "Need help with billing? See the guide ›";

  // Every signed-in user is on a plan — Basic is the free baseline, not
  // an absence of subscription. The earlier "No active subscription" empty
  // state confused first-time signed-in users into thinking something
  // was wrong; now we always show the plan name with a context-appropriate
  // CTA below.
  const tierName = plan === "deep" ? "Deep" : plan === "clear" ? "Clear" : "Basic";

  const tColor = tierColor(plan);
  const tBg = tierBg(plan);

  return (
    <section>
      <SectionLabel>{v2(lang, "accountPlanLabel")}</SectionLabel>

      <>
          {data.isTrial && data.trialDaysLeft > 0 && (
            <div
              style={{
                display: "inline-block",
                padding: "5px 12px",
                borderRadius: 999,
                background: tBg,
                color: tColor,
                fontFamily: fontBody(lang),
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
              fontFamily: fontDisplay(lang),
              fontStyle: displayItalic(lang),
              fontWeight: lang === "he" || lang === "ar" ? 700 : 400,
              // Slightly smaller than before — 'Deep' / 'Clear' is a
              // proper noun at this point, not a hero heading, so it
              // doesn't need display-sized treatment to feel right.
              fontSize: "clamp(22px, 2.8vw, 34px)",
              lineHeight: 1,
              color: tColor,
              letterSpacing: lang === "he" || lang === "ar" ? 0 : "-0.02em",
              // Negative top margin pulls it back toward the 'Plan'
              // SectionLabel above. The label has 24px below it by
              // default; this brings the tier name about 12px closer
              // so the pair reads as 'label: value' rather than two
              // separate floating pieces of type.
              margin: "-12px 0 0",
            }}
          >
            {tierName}
          </h2>
          {/* One-line summary of the tier, sourced from the same string
              shown on /pricing so the user reads consistent copy across
              both pages. */}
          <p
            style={{
              marginTop: 10,
              color: "var(--ink-muted, #6B7280)",
              fontSize: 15,
              lineHeight: 1.5,
              fontFamily: fontBody(lang),
            }}
          >
            {plan === "deep"  ? v2(lang, "tierDeepPitch")
              : plan === "clear" ? v2(lang, "tierClearPitch")
              :                    v2(lang, "tierBasicPitch")}
          </p>
          {(data.cancelAtPeriodEnd || renewalDate) && (
            <p
              style={{
                marginTop: 8,
                color: "var(--ink-muted, #6B7280)",
                fontSize: 14,
                fontFamily: fontBody(lang),
              }}
            >
              {data.cancelAtPeriodEnd
                ? v2(lang, "accountCancelsAtPeriodEnd")
                : renewalDate ? v2(lang, "accountRenewsOnTemplate", renewalDate) : ""}
            </p>
          )}
          <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 10 }}>
            {plan === "basic" ? (
              // Basic only has one direction to go: up. A "Change plan"
              // ghost button next to Upgrade was redundant (both routed
              // to /pricing) and read as ambiguous ("change to what?").
              <PrimaryBtn onClick={onUpgrade}>{v2(lang, "accountUpgrade")}</PrimaryBtn>
            ) : (
              <>
                <GhostBtn onClick={onManageBilling}>{v2(lang, "accountManageBilling")}</GhostBtn>
                <GhostBtn onClick={onChangePlan}>{v2(lang, "accountChangePlan")}</GhostBtn>
              </>
            )}
          </div>
          {/* Contextual self-service link to the billing section of the
              Help Center. Shown to anyone — Basic gets it for "how do
              I upgrade / what plans / can I trial" type questions,
              paying users for "wrong card / cancel / refund" cases.
              Deep-link via #billing hits the right Help Center section
              directly; scroll-margin-top in CSS keeps it below the
              sticky topbar. */}
          <div style={{ marginTop: 14 }}>
            <Link
              href={href("/contact") + "#billing"}
              style={{
                fontFamily: fontBody(lang),
                fontSize: 13,
                color: "var(--teal-deep, #0E7490)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              {billingHelp}
            </Link>
          </div>
        </>
    </section>
  );
}

function UsageSection({
  data,
  offlineCount,
}: {
  data: AccountData;
  offlineCount: number | null;
}) {
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
      {/* Offline availability — Clear/Deep only. Same label/value row
          shape as the meters above so the three usage stats read as
          one coherent group, not a boxed 'extra'. */}
      {data.plan !== "basic" && offlineCount !== null && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 4,
            fontFamily: fontBody(lang),
          }}
        >
          <span style={{ fontSize: 14, color: "var(--ink)", fontWeight: 500 }}>
            {lang === "he" ? "זמין אופליין"
              : lang === "ar" ? "متاح بدون إنترنت"
              : lang === "ru" ? "Доступно офлайн"
              : lang === "es" ? "Disponible sin conexión"
              : lang === "pt" ? "Disponível offline"
              : lang === "fr" ? "Disponible hors ligne"
              : lang === "de" ? "Offline verfügbar"
              : lang === "cs" ? "Dostupné offline"
              : lang === "sk" ? "Dostupné offline"
              : "Available offline"}
          </span>
          <span style={{ fontSize: 14, color: tierColor(data.plan), fontWeight: 600 }}>
            {offlineCount.toLocaleString()}
            {" "}
            {lang === "he" ? "מילים"
              : lang === "ar" ? "كلمات"
              : lang === "ru" ? "слов"
              : lang === "es" ? "palabras"
              : lang === "pt" ? "palavras"
              : lang === "fr" ? "mots"
              : lang === "de" ? "Wörter"
              : lang === "cs" ? "slov"
              : lang === "sk" ? "slov"
              : "words"}
          </span>
        </div>
      )}
    </section>
  );
}

function OfflinePackSection({
  data,
  packState,
  packError,
  onDownloadPack,
}: {
  data: AccountData;
  packState: "idle" | "downloading" | "done";
  packError: string | null;
  onDownloadPack: () => void;
}) {
  const { lang } = useLang();
  const href = useHref();
  if (data.plan === "basic") return null;
  return (
    <section style={{ fontFamily: fontBody(lang) }}>
      <SectionLabel>{v2(lang, "offlinePackHeader")}</SectionLabel>
      <div style={{ fontSize: 14, color: "var(--ink-muted, #6B7280)", marginBottom: 16, lineHeight: 1.5 }}>
        {v2(lang, "offlinePackDescription")}
      </div>
      {packError && (
        <div style={{ fontSize: 12, color: "#B91C1C", marginBottom: 8 }}>{packError}</div>
      )}
      {/* The CTA sits in a flex row aligned to the section's inline-start
          so it lines up with the SectionLabel and description text above
          it. Without an explicit alignment cue the inline-block button
          drifted off-axis on some viewports. */}
      <div style={{ display: "flex", justifyContent: "flex-start" }}>
        {packState === "done" ? (
            // After a successful download, swap the button for a confirmation
            // line + a direct link to /notebook so the user sees where the
            // words actually went. The whole 'download offline pack' flow
            // is meaningless without this hand-off — the user just spent a
            // tap on something and needs the payoff visible.
            <div style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.5 }}>
              <div style={{ color: tierColor(data.plan), fontWeight: 600, marginBottom: 6 }}>
                {lang === "he" ? "✓ נוסף למחברת שלכם"
                  : lang === "ar" ? "✓ تمت الإضافة إلى دفترك"
                  : lang === "ru" ? "✓ Добавлено в тетрадь"
                  : lang === "es" ? "✓ Añadido a tu cuaderno"
                  : lang === "pt" ? "✓ Adicionado ao seu caderno"
                  : lang === "fr" ? "✓ Ajouté à votre carnet"
                  : lang === "de" ? "✓ Zum Notizbuch hinzugefügt"
                  : lang === "cs" ? "✓ Přidáno do sešitu"
                  : lang === "sk" ? "✓ Pridané do zošita"
                  : "✓ Added to your Notebook"}
              </div>
              <a
                href={href("/notebook")}
                style={{
                  color: tierColor(data.plan),
                  textDecoration: "underline",
                  fontWeight: 500,
                }}
              >
                {lang === "he" ? "פתח את המחברת ←"
                  : lang === "ar" ? "← افتح الدفتر"
                  : lang === "ru" ? "Открыть тетрадь →"
                  : lang === "es" ? "Abrir cuaderno →"
                  : lang === "pt" ? "Abrir caderno →"
                  : lang === "fr" ? "Ouvrir le carnet →"
                  : lang === "de" ? "Notizbuch öffnen →"
                  : lang === "cs" ? "Otevřít sešit →"
                  : lang === "sk" ? "Otvoriť zošit →"
                  : "Open Notebook →"}
              </a>
            </div>
          ) : (
            <button
              type="button"
              onClick={onDownloadPack}
              disabled={packState === "downloading"}
              style={{
                padding: "9px 18px",
                borderRadius: 10,
                background: packState === "downloading" ? "var(--ink-muted, #9CA3AF)" : tierColor(data.plan),
                color: "white",
                border: "none",
                cursor: packState === "downloading" ? "default" : "pointer",
                fontFamily: fontBody(lang),
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {packState === "downloading"
                ? v2(lang, "offlineDownloadingPack")
                : v2(lang, "offlineDownloadPack")}
            </button>
          )}
      </div>
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
            fontFamily: fontBody(lang),
            fontSize: 14,
            fontWeight: 500,
            color: "var(--ink)",
          }}
        >
          {label}
        </span>
        <span
          style={{ fontFamily: fontBody(lang), fontSize: 14 }}
          dir="ltr"
        >
          {locked ? (
            <span style={{ color: "var(--ink-muted, #6B7280)" }}>{v2(lang, "accountLocked")}</span>
          ) : isUnlimited ? (
            // For uncapped meters, surfacing '0 / unlimited' read as
            // a half-broken counter to several beta testers. Show just
            // the word 'unlimited' instead — the meter bar itself is
            // a soft hint that there's no ceiling.
            <span style={{ color: "var(--ink-muted, #6B7280)" }}>{v2(lang, "accountUnlimited")}</span>
          ) : (
            <>
              <span style={{ color: "var(--ink)" }}>{used}</span>
              <span style={{ color: "var(--ink-muted, #6B7280)" }}>
                {" / "}{limit}
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
  data, emailFallback, onSignOut, onDeleteAccount,
}: {
  data: AccountData;
  /** Firebase Auth email — used when /api/account returns null because
   *  the user has no Firestore doc yet (free Basic users created without
   *  a Stripe webhook). Without this fallback the row renders blank. */
  emailFallback: string | null;
  onSignOut: () => void;
  onDeleteAccount: () => void;
}) {
  const { lang } = useLang();
  const email = data.email ?? emailFallback ?? "";
  return (
    <section>
      {/* Section header restored — once each topic lives in its own
          card, having a label per card is the consistency cue users
          expect (the previous 'no header at the bottom' looked like
          someone forgot to label this card). 'חשבון / Account' here
          refers to login + email, not the page as a whole. */}
      <SectionLabel>{v2(lang, "accountSectionLabel")}</SectionLabel>

      {/* Email row — label and value on the same line so they read as
          one fact. The address itself is wrapped in unicode-bidi:isolate
          so its Latin characters stay LTR even on RTL pages, but the
          row's text-align follows the parent direction, which puts the
          whole row on the start side. */}
      <div
        style={{
          marginBottom: 24,
          fontFamily: fontBody(lang),
          fontSize: 15,
          color: "var(--ink)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "baseline",
          gap: "0.6em",
        }}
      >
        <span
          style={{
            fontSize: 11.5,
            color: "var(--ink-muted, #6B7280)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          {v2(lang, "accountEmailLabel")}
        </span>
        <span
          style={{
            unicodeBidi: "isolate",
            wordBreak: "break-all",
          }}
        >
          {email}
        </span>
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
            fontFamily: fontBody(lang),
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
// A minWidth so single-word labels like "Upgrade" and "Sign out" render
// at identical sizes — the same uniformity Gadi flagged when the two
// buttons looked visually different even though they live in the same
// primary tier.
function PrimaryBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  const { lang } = useLang();
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minWidth: 160,
        padding: "12px 24px",
        borderRadius: 12,
        background: "var(--teal, #0EA5A5)",
        color: "white",
        border: "none",
        cursor: "pointer",
        fontFamily: fontBody(lang),
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
  const { lang } = useLang();
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
        fontFamily: fontBody(lang),
        fontSize: 14,
        fontWeight: 500,
      }}
    >
      {children}
    </button>
  );
}
