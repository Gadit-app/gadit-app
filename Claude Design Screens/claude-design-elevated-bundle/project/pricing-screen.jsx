/* Screen 3 — Pricing (full page).
   Hero · monthly/yearly toggle · 3 tier cards · trust strip · FAQ accordion · footer.
   USD prices everywhere; only period suffix localizes.
*/

const { useState: useS3 } = React;

// ─── Hero strip ─────────────────────────────────────────────────
function PricingHero({ locale, mobile, rtl, billing, setBilling }) {
  const meta = LOCALE_META[locale];
  const titleFont = meta.script === 'latin' ? 'font-display' : meta.script === 'he' ? 'font-he' : 'font-ar';

  const headlines = {
    en: { l1: 'Three tiers. All with real content.', sub: 'Start free. Upgrade when the depth helps you.' },
    he: { l1: 'שלוש רמות. כולן עם תוכן אמיתי.', sub: 'התחילו חינם. שדרגו כשהעומק מועיל לכם.' },
    ar: { l1: 'ثلاثة مستويات. كلّها بمحتوى حقيقي.', sub: 'ابدأ مجانًا. ارتقِ حين يعينك العمق.' },
  };
  const h = headlines[locale] || headlines.en;
  const monthly = locale === 'he' ? 'חודשי' : locale === 'ar' ? 'شهري' : 'Monthly';
  const yearly  = locale === 'he' ? 'שנתי'  : locale === 'ar' ? 'سنوي'  : 'Yearly';
  const save    = locale === 'he' ? 'חסכון 17%' : locale === 'ar' ? 'وفّر 17%' : 'Save 17%';

  return (
    <div style={{ paddingBlockStart: mobile ? 56 : 110, paddingBlockEnd: mobile ? 24 : 40 }}>
      <div style={{ maxWidth: 920, margin: '0 auto', textAlign: 'center' }}>
        <h1 className={titleFont}
            style={{
              fontSize: mobile ? 36 : 60, lineHeight: 1.1,
              color: 'oklch(0.97 0.008 265)',
              ...(meta.script === 'latin' ? { fontVariationSettings: '"opsz" 96', fontWeight: 400, letterSpacing: '-0.02em' } : {}),
            }}>
          {h.l1}
        </h1>
        <p className="mt-5 font-sans-ui mx-auto"
           style={{ fontSize: mobile ? 15.5 : 18, lineHeight: 1.55, color: 'oklch(0.78 0.02 265)', maxWidth: 560 }}>
          {h.sub}
        </p>

        {/* Billing toggle */}
        <div className="mt-10 inline-flex items-center gap-3">
          <div className="relative inline-flex"
            style={{
              padding: 4, borderRadius: 999,
              background: 'oklch(0.18 0.05 265 / 0.7)',
              boxShadow: 'inset 0 0 0 1px oklch(1 0 0 / 0.08)',
            }}>
            {[['monthly', monthly], ['yearly', yearly]].map(([key, label]) => {
              const active = billing === key;
              return (
                <button key={key} onClick={() => setBilling(key)}
                  className="font-sans-ui font-medium relative"
                  style={{
                    fontSize: 13, padding: '8px 18px', borderRadius: 999,
                    color: active ? 'white' : 'oklch(0.7 0.02 265)',
                    background: active ? 'linear-gradient(180deg, oklch(0.78 0.17 245), oklch(0.62 0.2 250))' : 'transparent',
                    boxShadow: active ? '0 0 0 1px oklch(0.5 0.2 250 / 0.55), 0 4px 14px oklch(0.5 0.2 250 / 0.35)' : 'none',
                    transition: 'all .15s',
                  }}>
                  {label}
                </button>
              );
            })}
          </div>
          {billing === 'yearly' && (
            <span className="font-sans-ui inline-flex items-center gap-1.5"
              style={{
                fontSize: 11.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
                color: 'oklch(0.82 0.1 245)', padding: '5px 11px', borderRadius: 999,
                background: 'oklch(0.72 0.19 245 / 0.12)',
                boxShadow: 'inset 0 0 0 1px oklch(0.72 0.19 245 / 0.35)',
              }}>
              <span className="gd-tier-dot" />
              {save}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tier card ──────────────────────────────────────────────────
function TierCard({ locale, mobile, rtl, billing, tier }) {
  const meta = LOCALE_META[locale];
  const titleFont = meta.script === 'latin' ? 'font-display' : meta.script === 'he' ? 'font-he' : 'font-ar';
  const periodMo = locale === 'he' ? '/חודש' : locale === 'ar' ? '/شهر' : '/mo';
  const periodYr = locale === 'he' ? '/שנה'  : locale === 'ar' ? '/سنة'  : '/yr';

  const showYearly = billing === 'yearly' && tier.yearly;
  const price = showYearly ? tier.yearly : tier.price;
  const period = tier.price === '$0' ? '' : showYearly ? periodYr : periodMo;
  const subPrice = showYearly && tier.priceCompare ? tier.priceCompare : null;

  return (
    <div className="relative h-full"
      style={{
        borderRadius: 22,
        padding: mobile ? '26px 24px 28px' : '34px 30px 30px',
        background: tier.highlight
          ? 'linear-gradient(180deg, oklch(0.24 0.07 260 / 0.9), oklch(0.18 0.06 265 / 0.9))'
          : 'oklch(0.20 0.05 265 / 0.55)',
        boxShadow: tier.highlight
          ? 'inset 0 0 0 1.5px oklch(0.72 0.19 245 / 0.65), 0 0 0 6px oklch(0.72 0.19 245 / 0.08), 0 24px 48px -16px oklch(0.5 0.2 250 / 0.5)'
          : 'inset 0 0 0 1px oklch(1 0 0 / 0.08), 0 8px 22px -10px oklch(0.08 0.08 260 / 0.35)',
      }}>
      {tier.badge && (
        <div className="absolute -top-3 start-6 font-sans-ui"
          style={{
            fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700,
            color: 'oklch(0.18 0.06 265)',
            padding: '5px 11px', borderRadius: 999,
            background: 'linear-gradient(180deg, oklch(0.88 0.1 245), oklch(0.78 0.16 245))',
            boxShadow: '0 0 0 1px oklch(0.5 0.2 250 / 0.5), 0 4px 12px oklch(0.5 0.2 250 / 0.4)',
          }}>
          {tier.badge}
        </div>
      )}

      <div className="flex items-baseline justify-between mb-1">
        <div className="font-sans-ui font-semibold" style={{ fontSize: 16, color: 'oklch(0.96 0.008 265)' }}>
          {tier.name}
        </div>
        <span className="font-sans-ui italic" style={{ fontSize: 12, color: 'oklch(0.72 0.05 245)' }}>
          {tier.tagline}
        </span>
      </div>
      <p className="font-sans-ui mt-3"
         style={{ fontSize: 13.5, lineHeight: 1.5, color: 'oklch(0.78 0.02 265)', minHeight: mobile ? 'auto' : 42 }}>
        {tier.pitch}
      </p>

      <div className="mt-6 flex items-baseline gap-1.5">
        <span className="font-display"
              style={{ fontSize: 48, lineHeight: 1, color: 'oklch(0.97 0.008 265)',
                       fontVariationSettings: '"opsz" 96', letterSpacing: '-0.025em', fontWeight: 400 }}>
          {price}
        </span>
        {period && (
          <span className="font-sans-ui" style={{ fontSize: 14, color: 'oklch(0.62 0.02 265)' }}>
            {period}
          </span>
        )}
      </div>
      {subPrice && (
        <div className="font-sans-ui mt-1" style={{ fontSize: 11.5, color: 'oklch(0.55 0.02 265)' }}>
          {subPrice}
        </div>
      )}

      {/* CTA */}
      <button
        className="w-full mt-6 font-sans-ui font-medium"
        style={{
          fontSize: 13.5, padding: '12px 18px', borderRadius: 12,
          ...(tier.highlight
            ? {
                color: 'white',
                background: 'linear-gradient(180deg, oklch(0.78 0.17 245), oklch(0.62 0.2 250))',
                boxShadow: '0 0 0 1px oklch(0.5 0.2 250 / 0.55), 0 8px 22px oklch(0.5 0.2 250 / 0.4)',
              }
            : {
                color: 'oklch(0.95 0.01 265)',
                background: 'oklch(1 0 0 / 0.06)',
                boxShadow: 'inset 0 0 0 1px oklch(1 0 0 / 0.14)',
              }),
        }}>
        {billing === 'yearly' && tier.ctaYearly ? tier.ctaYearly : tier.cta}
      </button>

      {tier.trust && (
        <div className="mt-3 font-sans-ui text-center"
             style={{ fontSize: 11.5, color: 'oklch(0.6 0.02 265)' }}>
          {tier.trust}
        </div>
      )}

      {/* Features */}
      <ul className="mt-7 space-y-3">
        {tier.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5 font-sans-ui"
              style={{ fontSize: 13.5, lineHeight: 1.5, color: 'oklch(0.85 0.015 265)' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                 style={{ color: 'oklch(0.82 0.1 245)', marginTop: 4, flexShrink: 0 }}>
              <path d="M3 7.5l2.5 2.5L11 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PricingTiers({ locale, mobile, rtl, billing }) {
  const meta = LOCALE_META[locale];

  const T = {
    en: [
      {
        name: 'Basic', tagline: 'Understand',
        pitch: 'Start with the essentials.',
        price: '$0', yearly: null, badge: null,
        cta: 'Get started',
        trust: null,
        features: [
          '20 word searches per day',
          'All meanings (not just primary)',
          '3 examples per meaning',
          'Basic etymology — origin + history note',
          'Sign-in required',
        ],
      },
      {
        name: 'Clear', tagline: 'Visualize',
        pitch: 'Bring words to life with images, kids mode, and feedback.',
        price: '$2.99', yearly: '$29.99',
        priceCompare: 'Equivalent to $2.50/mo',
        badge: 'Most popular', highlight: true,
        cta: 'Start 14-day free trial', ctaYearly: 'Subscribe yearly',
        trust: 'Cancel anytime · No charge during trial',
        features: [
          'Everything in Basic',
          'Unlimited searches',
          'Kids explanations (child-friendly mode)',
          'AI-generated images (30/month)',
          'Compose your own sentence + grammar feedback',
          'Common idioms across all meanings',
          'Search history (last 30 days)',
        ],
      },
      {
        name: 'Deep', tagline: 'Practice',
        pitch: 'Build a personal vocabulary library that gets stronger over time.',
        price: '$4.99', yearly: '$49.99',
        priceCompare: 'Equivalent to $4.17/mo',
        badge: null,
        cta: 'Subscribe to Deep', ctaYearly: 'Subscribe to Deep',
        trust: null,
        features: [
          'Everything in Clear',
          'Practice quizzes (mixed-type, AI-generated)',
          'Personal notebook (Galaxy view)',
          'Spaced repetition (smart practice algorithm)',
          'Compare confusable words (affect/effect, אומנות/אמנות)',
          'AI-generated images (100/month, vs 30 in Clear)',
        ],
      },
    ],
    he: [
      {
        name: 'Basic', tagline: 'להבין',
        pitch: 'התחילו עם היסודות.',
        price: '$0', yearly: null, badge: null,
        cta: 'יאללה נתחיל',
        features: [
          '20 חיפושי מילים ביום',
          'כל המשמעויות (לא רק העיקרית)',
          '3 דוגמאות לכל משמעות',
          'אטימולוגיה בסיסית — מקור והערה היסטורית',
          'נדרשת התחברות',
        ],
      },
      {
        name: 'Clear', tagline: 'לראות',
        pitch: 'הביאו מילים לחיים — תמונות, הסבר לילדים ומשוב.',
        price: '$2.99', yearly: '$29.99',
        priceCompare: 'שווה ל־$2.50 לחודש',
        badge: 'הכי פופולרי', highlight: true,
        cta: 'נסיון חינם ל־14 ימים', ctaYearly: 'הרשמה שנתית',
        trust: 'ביטול בכל עת · ללא חיוב בתקופת הניסיון',
        features: [
          'כל מה שיש ב־Basic',
          'חיפושים ללא הגבלה',
          'הסבר לילדים (מצב ידידותי)',
          'יצירת תמונות AI (30 בחודש)',
          'חיבור משפטים עם משוב דקדוקי',
          'ביטויים נפוצים על פני כל המשמעויות',
          'היסטוריית חיפוש (30 ימים אחרונים)',
        ],
      },
      {
        name: 'Deep', tagline: 'לתרגל',
        pitch: 'בנו אוצר מילים אישי שמתחזק עם הזמן.',
        price: '$4.99', yearly: '$49.99',
        priceCompare: 'שווה ל־$4.17 לחודש',
        badge: null,
        cta: 'הרשמה ל־Deep', ctaYearly: 'הרשמה ל־Deep',
        features: [
          'כל מה שיש ב־Clear',
          'תרגולים ומבחנים (סוגים שונים, נוצרים ב־AI)',
          'מחברת אישית (תצוגת גלקסיה)',
          'חזרה מרווחת (אלגוריתם תרגול חכם)',
          'השוואת מילים מתבלבלות (אומנות/אמנות, affect/effect)',
          'יצירת תמונות AI (100 בחודש, לעומת 30 ב־Clear)',
        ],
      },
    ],
    ar: [
      {
        name: 'Basic', tagline: 'افهم',
        pitch: 'ابدأ بالأساسيات.',
        price: '$0', yearly: null, badge: null,
        cta: 'لنبدأ',
        features: [
          '20 بحثًا في اليوم',
          'جميع المعاني (لا الأول وحده)',
          '3 أمثلة لكل معنى',
          'أصل أساسي — المصدر وملاحظة تاريخية',
          'يلزم تسجيل الدخول',
        ],
      },
      {
        name: 'Clear', tagline: 'تخيّل',
        pitch: 'أحيِ الكلمات بالصور وشرح الأطفال والمراجعة.',
        price: '$2.99', yearly: '$29.99',
        priceCompare: 'ما يعادل $2.50 شهريًا',
        badge: 'الأكثر شيوعًا', highlight: true,
        cta: 'تجربة 14 يومًا مجانًا', ctaYearly: 'اشتراك سنوي',
        trust: 'ألغِ في أي وقت · بلا رسوم في فترة التجربة',
        features: [
          'كل ما في Basic',
          'بحث بلا حدود',
          'شرح الأطفال (وضع ملائم للصغار)',
          'توليد صور بالذكاء الاصطناعي (30 شهريًا)',
          'تأليف جملك الخاصة مع مراجعة نحوية',
          'تعابير شائعة عبر جميع المعاني',
          'سجلّ البحث (آخر 30 يومًا)',
        ],
      },
      {
        name: 'Deep', tagline: 'تدرَّب',
        pitch: 'ابنِ مكتبة مفردات شخصية تزداد قوّة مع الزمن.',
        price: '$4.99', yearly: '$49.99',
        priceCompare: 'ما يعادل $4.17 شهريًا',
        badge: null,
        cta: 'اشترك في Deep', ctaYearly: 'اشترك في Deep',
        features: [
          'كل ما في Clear',
          'اختبارات تدريب (متنوعة، بالذكاء الاصطناعي)',
          'دفتر شخصي (تصوير المجرّة)',
          'مراجعة موزَّعة (خوارزمية تدريب ذكية)',
          'مقارنة الكلمات المتشابهة (affect/effect، أمنية/أمانة)',
          'توليد صور بالذكاء الاصطناعي (100 شهريًا، مقابل 30 في Clear)',
        ],
      },
    ],
  };
  const tiers = T[locale] || T.en;

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', paddingBlockStart: mobile ? 24 : 16,
                  paddingBlockEnd: mobile ? 24 : 40 }}>
      <div className={`grid gap-4 ${mobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
        {tiers.map((tier, i) => (
          <TierCard key={i} locale={locale} mobile={mobile} rtl={rtl} billing={billing} tier={tier} />
        ))}
      </div>
    </div>
  );
}

// ─── Trust strip ────────────────────────────────────────────────
function TrustStrip({ locale, mobile, rtl }) {
  const items = {
    en: [
      'Cancel anytime through Stripe portal',
      '14-day money-back on first purchase',
      'Your data is yours — export anytime',
      'No ads, no third-party tracking',
    ],
    he: [
      'ביטול בכל עת דרך פורטל Stripe',
      'החזר כספי תוך 14 ימים ברכישה ראשונה',
      'הנתונים שלכם — ייצוא מתי שתרצו',
      'ללא פרסומות וללא מעקב צד ג׳',
    ],
    ar: [
      'ألغِ في أي وقت عبر بوابة Stripe',
      'استرداد خلال 14 يومًا للشراء الأول',
      'بياناتك ملكك — تُصدَّر متى شئت',
      'لا إعلانات ولا تتبّع طرف ثالث',
    ],
  };
  const list = items[locale] || items.en;
  return (
    <div style={{ maxWidth: 1180, margin: '0 auto',
                  paddingBlockStart: mobile ? 24 : 36, paddingBlockEnd: mobile ? 30 : 50 }}>
      <div className={`grid ${mobile ? 'grid-cols-1 gap-3' : 'grid-cols-4 gap-4'}`}>
        {list.map((item, i) => (
          <div key={i} className="flex items-start gap-2.5 font-sans-ui"
               style={{ fontSize: 12.5, lineHeight: 1.45, color: 'oklch(0.72 0.02 265)',
                        padding: '14px 16px', borderRadius: 12,
                        background: 'oklch(1 0 0 / 0.025)',
                        boxShadow: 'inset 0 0 0 1px oklch(1 0 0 / 0.05)' }}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none"
                 style={{ color: 'oklch(0.72 0.1 245)', marginTop: 2, flexShrink: 0 }}>
              <path d="M7 1.5l1.5 4.5h4.5l-3.5 2.5 1.3 4.5L7 10.5l-3.8 2.5 1.3-4.5L1 6h4.5L7 1.5z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
            </svg>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── FAQ accordion ──────────────────────────────────────────────
function FAQ({ locale, mobile, rtl }) {
  const Q = {
    en: [
      ['Can I switch plans?', 'Yes, upgrade or downgrade anytime. Proration is handled automatically — you only pay the difference.'],
      ['What happens if I cancel?', 'You keep access until the end of your billing period, then revert to Basic. No data is lost.'],
      ['Is the trial really free?', 'Yes. We require a card to prevent abuse, but you\'re not charged until day 15. Cancel before then = zero cost.'],
      ['Why three tiers?', 'Different users need different depth. We\'d rather meet you where you are than upsell a single bloated plan.'],
      ['Are kids\' explanations safe?', 'Yes. They\'re AI-generated with the same care as adult content, reviewed by our content rules. No user-generated child content.'],
    ],
    he: [
      ['אפשר להחליף תוכנית?', 'כן, אפשר לשדרג או לרדת בכל עת. החיוב היחסי מטופל אוטומטית — תשלמו רק את ההפרש.'],
      ['מה קורה אם אני מבטל?', 'הגישה נשמרת עד סוף תקופת החיוב, ואז חוזרים ל־Basic. שום נתון לא הולך לאיבוד.'],
      ['הניסיון באמת חינם?', 'כן. אנחנו דורשים כרטיס כדי למנוע ניצול, אבל החיוב מתחיל רק ביום ה־15. ביטול לפני כן = אפס עלות.'],
      ['למה שלוש רמות?', 'משתמשים שונים צריכים עומק שונה. עדיף לנו לפגוש אתכם איפה שאתם מאשר למכור תוכנית אחת מנופחת.'],
      ['ההסברים לילדים בטוחים?', 'כן. הם נוצרים ב־AI באותה זהירות כמו תוכן למבוגרים, ועוברים סקירה לפי כללי התוכן שלנו. אין תוכן ילדים ממשתמשים.'],
    ],
    ar: [
      ['هل يمكنني تغيير الخطة؟', 'نعم، ارتقِ أو انزل في أي وقت. يُحسَب الفرق آليًّا — تدفع الفارق فقط.'],
      ['ماذا لو ألغيت؟', 'يبقى الوصول حتى نهاية فترة الفوترة، ثم تعود إلى Basic. لا تُفقَد أي بيانات.'],
      ['هل التجربة مجانية فعلًا؟', 'نعم. نطلب البطاقة لمنع الاستغلال، لكن لا تُحاسَب حتى اليوم الخامس عشر. ألغِ قبل ذلك = بلا تكلفة.'],
      ['لمَ ثلاثة مستويات؟', 'يحتاج كل مستخدم عمقًا مختلفًا. نفضّل لقاءك حيث أنت لا بيع خطة واحدة منتفخة.'],
      ['هل شرح الأطفال آمن؟', 'نعم. يُولَّد بالذكاء الاصطناعي بالعناية نفسها للبالغين، ويُراجَع وفق قواعد المحتوى لدينا. لا محتوى أطفال من المستخدمين.'],
    ],
  };
  const items = Q[locale] || Q.en;
  const [open, setOpen] = useS3(0);

  const titleFont = LOCALE_META[locale].script === 'latin' ? 'font-display' : LOCALE_META[locale].script === 'he' ? 'font-he' : 'font-ar';

  return (
    <div style={{ maxWidth: 760, margin: '0 auto',
                  paddingBlockStart: mobile ? 30 : 70, paddingBlockEnd: mobile ? 40 : 80 }}>
      <div className="text-center mb-8">
        <Eyebrow style={{ color: 'oklch(0.82 0.008 265)' }}>FAQ</Eyebrow>
        <div className={titleFont}
             style={{ fontSize: mobile ? 24 : 32, color: 'oklch(0.95 0.008 265)', marginTop: 6,
                      ...(LOCALE_META[locale].script === 'latin' ? { fontVariationSettings: '"opsz" 48', fontStyle: 'italic' } : {}) }}>
          {locale === 'he' ? 'שאלות שכיחות'
           : locale === 'ar' ? 'أسئلة شائعة'
           : 'Questions, answered'}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {items.map(([q, a], i) => {
          const isOpen = open === i;
          return (
            <button key={i} onClick={() => setOpen(isOpen ? -1 : i)}
              className="text-start w-full"
              style={{
                background: 'oklch(0.20 0.05 265 / 0.55)',
                borderRadius: 14,
                padding: mobile ? '16px 18px' : '20px 24px',
                boxShadow: 'inset 0 0 0 1px oklch(1 0 0 / 0.07)',
                cursor: 'pointer',
              }}>
              <div className="flex items-start justify-between gap-4">
                <span className="font-sans-ui font-medium"
                      style={{ fontSize: mobile ? 14.5 : 15.5, color: 'oklch(0.95 0.008 265)' }}>
                  {q}
                </span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                     style={{ color: 'oklch(0.7 0.05 245)', flexShrink: 0, marginTop: 4,
                              transform: isOpen ? 'rotate(45deg)' : 'rotate(0)', transition: 'transform .2s' }}>
                  <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </div>
              {isOpen && (
                <p className={`mt-3 font-sans-ui ${rtl ? 'rtl-body' : ''}`}
                   style={{ fontSize: mobile ? 13.5 : 14.5, lineHeight: 1.6, color: 'oklch(0.78 0.02 265)' }}>
                  {a}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { PricingHero, PricingTiers, TrustStrip, FAQ });
