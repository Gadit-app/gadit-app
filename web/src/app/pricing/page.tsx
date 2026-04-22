"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const { user, promptLogin } = useAuth();
  const { t, dir } = useLang();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const PLANS = [
    {
      id: "basic",
      name: "Basic",
      description: t.basicDesc,
      monthlyPrice: 0,
      yearlyPrice: 0,
      monthlyPriceId: null as string | null,
      yearlyPriceId: null as string | null,
      features: [t.searchesPerDay, t.fullDefinition, t.examples, t.basicEtymology],
      cta: t.startFree,
      popular: false,
      note: null as string | null,
    },
    {
      id: "clear",
      name: "Clear",
      description: t.clearDesc,
      monthlyPrice: 1.99,
      yearlyPrice: 15.99,
      monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CLEAR_MONTHLY ?? null,
      yearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CLEAR_YEARLY ?? null,
      features: [t.allBasicFeatures, t.unlimitedSearches, t.forKidsFeature, t.aiImages, t.quizMode],
      cta: t.startUnderstanding,
      popular: true,
      note: t.mostPeopleChoose,
    },
    {
      id: "deep",
      name: "Deep",
      description: t.deepDesc,
      monthlyPrice: 3.99,
      yearlyPrice: 31.99,
      monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_DEEP_MONTHLY ?? null,
      yearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_DEEP_YEARLY ?? null,
      features: [t.everythingInClear, t.useThisWordFeature, t.wordCollections, t.wordOfDay, t.advancedInsights],
      cta: t.unlockDeep,
      popular: false,
      note: null,
    },
  ];

  async function handleSubscribe(plan: typeof PLANS[0]) {
    if (plan.id === "basic") { router.push("/"); return; }
    if (!user) { promptLogin("Log in to upgrade your plan"); return; }

    const priceId = billing === "monthly" ? plan.monthlyPriceId : plan.yearlyPriceId;
    if (!priceId) return;

    setLoading(plan.id);
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, userId: user.uid, userEmail: user.email }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] pt-28 pb-20 px-4" dir={dir}>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3 whitespace-pre-line" style={{ color: "#0F172A", letterSpacing: "-1px" }}>
            {t.pricingHeadline}
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">{t.pricingSubline}</p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <button
            onClick={() => setBilling("monthly")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${billing === "monthly" ? "bg-white shadow-sm border border-slate-200 text-slate-700" : "text-slate-400"}`}
          >
            {t.monthly}
          </button>
          <button
            onClick={() => setBilling("yearly")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${billing === "yearly" ? "bg-white shadow-sm border border-slate-200 text-slate-700" : "text-slate-400"}`}
          >
            {t.yearly}
            <span className="ms-2 px-2 py-0.5 rounded-full text-xs font-semibold text-white" style={{ background: "#10B981" }}>
              {t.yearlyBadge}
            </span>
          </button>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 items-start">
          {PLANS.map((plan) => {
            const price = billing === "yearly" && plan.yearlyPrice > 0
              ? (plan.yearlyPrice / 12).toFixed(2)
              : plan.monthlyPrice.toFixed(2);
            const billed = billing === "yearly" && plan.yearlyPrice > 0
              ? `$${plan.yearlyPrice}/year`
              : null;
            const isComingSoon = plan.id === "deep";

            return (
              <div
                key={plan.id}
                className="relative bg-white rounded-3xl flex flex-col transition-all duration-200 text-center"
                dir="ltr"
                style={plan.popular ? {
                  border: "1.5px solid rgb(147 197 253)",
                  boxShadow: "0 8px 32px 0 rgb(37 99 235 / 0.13), 0 2px 8px 0 rgb(37 99 235 / 0.08)",
                  transform: "scale(1.025)",
                  padding: "1.75rem",
                } : {
                  border: "1px solid rgb(226 232 240 / 0.9)",
                  boxShadow: "0 2px 8px 0 rgb(0 0 0 / 0.05)",
                  padding: "1.75rem",
                  ...(isComingSoon ? { opacity: 0.85 } : {}),
                }}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold text-white whitespace-nowrap"
                    style={{ background: "#2563EB", boxShadow: "0 2px 8px rgb(37 99 235 / 0.35)" }}>
                    {t.mostPopular}
                  </div>
                )}
                {isComingSoon && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold text-white whitespace-nowrap"
                    style={{ background: "#64748B", boxShadow: "0 2px 8px rgb(100 116 139 / 0.35)" }}>
                    {t.comingSoon}
                  </div>
                )}

                <div className="mb-5" dir={dir}>
                  <h2 className="text-xl font-bold mb-1" style={{ color: "#0F172A" }}>{plan.name}</h2>
                  <p className="text-slate-400 text-sm leading-relaxed">{plan.description}</p>
                  {isComingSoon && (
                    <p className="text-xs text-slate-400 italic mt-2">{t.comingSoonNote}</p>
                  )}
                </div>

                <div className="mb-6 pb-6 border-b border-slate-100" dir={dir}>
                  {plan.monthlyPrice === 0 ? (
                    <span className="text-3xl font-bold" style={{ color: "#0F172A" }}>{t.freeLabel}</span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold" style={{ color: "#0F172A" }}>${price}</span>
                      <span className="text-slate-400 text-sm">{t.perMonth}</span>
                      {billed && <p className="text-xs text-slate-400 mt-1">{t.billedYearly} {billed}</p>}
                    </>
                  )}
                </div>

                <ul className="mb-7 flex-1 space-y-2.5 mx-auto w-fit" dir={dir}>
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-600 items-start text-start">
                      <span className="shrink-0 font-semibold mt-0.5" style={{ color: "#10B981" }}>✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => !isComingSoon && handleSubscribe(plan)}
                  disabled={loading === plan.id || isComingSoon}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                    isComingSoon
                      ? "border border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed"
                      : plan.popular
                      ? "text-white hover:opacity-90 disabled:opacity-50"
                      : "border border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-600 bg-white disabled:opacity-50"
                  }`}
                  style={isComingSoon ? {} : plan.popular ? {
                    background: "#2563EB",
                    boxShadow: "0 4px 14px rgb(37 99 235 / 0.25)",
                  } : {
                    boxShadow: "0 1px 3px rgb(0 0 0 / 0.05)",
                  }}
                >
                  {isComingSoon ? t.comingSoon : loading === plan.id ? "…" : plan.cta}
                </button>

                {plan.note && !isComingSoon && (
                  <p className="text-center text-xs text-slate-400 mt-2">{plan.note}</p>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-slate-400 text-xs mt-8">
          {t.cancelAnytime}
        </p>
      </div>
    </main>
  );
}
