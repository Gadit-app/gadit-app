"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useRouter } from "next/navigation";

const PLANS = [
  {
    id: "basic",
    name: "Basic",
    description: "Start understanding words for free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    monthlyPriceId: null,
    yearlyPriceId: null,
    features: [
      "20 searches per day",
      "Full definition",
      "Examples",
      "For Kids explanation",
      "Basic etymology",
      "All 10 languages",
    ],
    missing: ["Unlimited searches", "AI images", "History & Favorites", "Quiz mode"],
    cta: "Start understanding",
    popular: false,
    note: null,
  },
  {
    id: "clear",
    name: "Clear",
    description: "Everything you need to fully understand any word",
    monthlyPrice: 1.99,
    yearlyPrice: 15.99,
    monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CLEAR_MONTHLY,
    yearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CLEAR_YEARLY,
    features: [
      "Unlimited searches",
      "All Basic features",
      "Opposite & Confusable",
      "Register & Frequency",
      "Word family",
      "History & Favorites",
      "Quiz mode",
      "Use this word + AI feedback",
      "All 10 languages",
    ],
    missing: ["AI word images"],
    cta: "Start understanding fully",
    popular: true,
    note: "Most people choose this",
  },
  {
    id: "deep",
    name: "Deep",
    description: "Go beyond understanding — into mastery",
    monthlyPrice: 3.99,
    yearlyPrice: 31.99,
    monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_DEEP_MONTHLY,
    yearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_DEEP_YEARLY,
    features: [
      "Everything in Clear",
      "AI word images",
      "Word collections",
      "Word of the Day (personal)",
      "Advanced insights",
      "All 10 languages",
    ],
    missing: [],
    cta: "Unlock Deep",
    popular: false,
    note: null,
  },
];

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const { user, promptLogin } = useAuth();
  const { t, dir } = useLang();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

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

  const PLANS_T = [
    {
      id: "basic", name: "Basic",
      description: t.basicDesc,
      monthlyPrice: 0, yearlyPrice: 0,
      monthlyPriceId: null, yearlyPriceId: null,
      features: [t.searchesPerDay, t.fullDefinition, t.examples, t.forKidsFeature, t.basicEtymology, t.allLanguages],
      missing: [t.unlimitedSearches, t.aiImages, t.historyFavorites, t.quizMode],
      cta: t.startUnderstanding, popular: false, note: null,
    },
    {
      id: "clear", name: "Clear",
      description: t.clearDesc,
      monthlyPrice: 1.99, yearlyPrice: 15.99,
      monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CLEAR_MONTHLY,
      yearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CLEAR_YEARLY,
      features: [t.unlimitedSearches, t.allBasicFeatures, t.oppositeConfusable, t.registerFrequency, t.wordFamilyFeature, t.historyFavorites, t.quizMode, t.useThisWordFeature, t.allLanguages],
      missing: [t.aiImages],
      cta: t.startUnderstandingFully, popular: true, note: t.mostPeopleChoose,
    },
    {
      id: "deep", name: "Deep",
      description: t.deepDesc,
      monthlyPrice: 3.99, yearlyPrice: 31.99,
      monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_DEEP_MONTHLY,
      yearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_DEEP_YEARLY,
      features: [t.everythingInClear, t.aiImages, t.wordCollections, t.wordOfDay, t.advancedInsights, t.allLanguages],
      missing: [],
      cta: t.unlockDeep, popular: false, note: null,
    },
  ];

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
          {PLANS_T.map((plan) => {
            const price = billing === "yearly" && plan.yearlyPrice > 0
              ? (plan.yearlyPrice / 12).toFixed(2)
              : plan.monthlyPrice.toFixed(2);
            const billed = billing === "yearly" && plan.yearlyPrice > 0
              ? `$${plan.yearlyPrice}/year`
              : null;

            return (
              <div
                key={plan.id}
                className="relative bg-white rounded-3xl flex flex-col transition-all duration-200"
                style={plan.popular ? {
                  border: "1.5px solid rgb(147 197 253)",
                  boxShadow: "0 8px 32px 0 rgb(37 99 235 / 0.13), 0 2px 8px 0 rgb(37 99 235 / 0.08)",
                  transform: "scale(1.025)",
                  padding: "1.75rem",
                } : {
                  border: "1px solid rgb(226 232 240 / 0.9)",
                  boxShadow: "0 2px 8px 0 rgb(0 0 0 / 0.05)",
                  padding: "1.75rem",
                }}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ background: "#2563EB", boxShadow: "0 2px 8px rgb(37 99 235 / 0.35)" }}>
                    {t.mostPopular}
                  </div>
                )}

                <div className="mb-5">
                  <h2 className="text-xl font-bold mb-1" style={{ color: "#0F172A" }}>{plan.name}</h2>
                  <p className="text-slate-400 text-sm leading-relaxed">{plan.description}</p>
                </div>

                <div className="mb-6 pb-6 border-b border-slate-100">
                  {plan.monthlyPrice === 0 ? (
                    <span className="text-3xl font-bold" style={{ color: "#0F172A" }}>Free</span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold" style={{ color: "#0F172A" }}>${price}</span>
                      <span className="text-slate-400 text-sm">/month</span>
                      {billed && <p className="text-xs text-slate-400 mt-1">{t.billedYearly} {billed}</p>}
                    </>
                  )}
                </div>

                <ul className="space-y-2.5 mb-7 flex-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-600">
                      <span className="shrink-0 font-semibold" style={{ color: "#10B981" }}>✓</span> {f}
                    </li>
                  ))}
                  {plan.missing.map((f, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-300">
                      <span className="shrink-0">✗</span> {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={loading === plan.id}
                  className={`w-full py-3 rounded-xl font-semibold text-sm disabled:opacity-50 transition-all ${
                    plan.popular
                      ? "text-white hover:opacity-90"
                      : "border border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-600 bg-white"
                  }`}
                  style={plan.popular ? {
                    background: "#2563EB",
                    boxShadow: "0 4px 14px rgb(37 99 235 / 0.25)",
                  } : {
                    boxShadow: "0 1px 3px rgb(0 0 0 / 0.05)",
                  }}
                >
                  {loading === plan.id ? "…" : plan.cta}
                </button>

                {plan.note && (
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
