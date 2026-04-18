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
    <main className="min-h-screen bg-[#F8FAFC] pt-24 pb-16 px-4" dir={dir}>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3 whitespace-pre-line" style={{ color: "#0F172A" }}>
            {t.pricingHeadline}
          </h1>
          <p className="text-slate-400 text-lg">{t.pricingSubline}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
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
                className={`relative bg-white rounded-3xl border p-7 flex flex-col ${plan.popular ? "border-blue-400 shadow-xl shadow-blue-200 scale-[1.02]" : "border-slate-100 shadow-sm"}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold text-white" style={{ background: "#2563EB" }}>
                    {t.mostPopular}
                  </div>
                )}

                <div className="mb-5">
                  <h2 className="text-xl font-bold mb-1" style={{ color: "#0F172A" }}>{plan.name}</h2>
                  <p className="text-slate-400 text-sm">{plan.description}</p>
                </div>

                <div className="mb-5">
                  {plan.monthlyPrice === 0 ? (
                    <span className="text-3xl font-bold" style={{ color: "#0F172A" }}>Free</span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold" style={{ color: "#0F172A" }}>${price}</span>
                      <span className="text-slate-400 text-sm">/month</span>
                      {billed && <p className="text-xs text-slate-400 mt-0.5">{t.billedYearly} {billed}</p>}
                    </>
                  )}
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-600">
                      <span style={{ color: "#10B981" }}>✓</span> {f}
                    </li>
                  ))}
                  {plan.missing.map((f, i) => (
                    <li key={i} className={`flex gap-2 text-sm ${plan.id === "basic" && f === "Unlimited searches" ? "text-slate-400 font-medium" : "text-slate-300"}`}>
                      <span>✗</span> {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={loading === plan.id}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 ${
                    plan.popular
                      ? "text-white"
                      : "border border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-600"
                  }`}
                  style={plan.popular ? { background: "#2563EB" } : {}}
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
