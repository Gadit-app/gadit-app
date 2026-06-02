/* Screen 2 — Homepage + Search.
   Hybrid hero (search-as-CTA) · quiet & literary · 4 value props · tier strip · minimal footer.
*/

// ─── Hero ──────────────────────────────────────────────────────
function HomeHero({ t, locale, mobile = false, rtl = false }) {
  const meta = LOCALE_META[locale];
  const script = meta.script;
  const titleFont = script === 'he' ? 'font-he' : script === 'ar' ? 'font-ar' : 'font-display';

  const titleSize = mobile
    ? { fontSize: 'clamp(40px, 11vw, 56px)', lineHeight: 1.05 }
    : { fontSize: 'clamp(64px, 7vw, 96px)', lineHeight: 1.02 };

  const headlines = {
    en: { l1: 'Understand', l2: 'more.' },
    he: { l1: 'להבין', l2: 'יותר.' },
    ar: { l1: 'افهم', l2: 'أكثر.' },
    es: { l1: 'Entiende', l2: 'más.' },
    fr: { l1: 'Comprendre', l2: 'plus.' },
    de: { l1: 'Mehr', l2: 'verstehen.' },
    ru: { l1: 'Понимать', l2: 'больше.' },
  };
  const sub = {
    en: 'A dictionary that meets you in context — meanings, origins, idioms, and a vivid image, in 7 languages.',
    he: 'מילון שמבין הקשר — משמעויות, מקור, ביטויים ותמונה חיה, ב־7 שפות.',
    ar: 'قاموس يفهم السياق — معانٍ وأصول وتعابير وصورة حيّة، بسبع لغات.',
    es: 'Un diccionario que entiende el contexto — significados, orígenes, modismos y una imagen vívida, en 7 idiomas.',
    fr: 'Un dictionnaire qui comprend le contexte — sens, origines, expressions et une image vive, en 7 langues.',
    de: 'Ein Wörterbuch, das den Kontext versteht — Bedeutungen, Herkunft, Redewendungen und ein lebendiges Bild, in 7 Sprachen.',
    ru: 'Словарь, который понимает контекст — значения, происхождение, идиомы и живой образ, на 7 языках.',
  };
  const head = headlines[locale] || headlines.en;
  const subline = sub[locale] || sub.en;

  return (
    <div style={{ paddingBlockStart: mobile ? 56 : 120, paddingBlockEnd: mobile ? 28 : 60 }}>
      <div style={{ maxWidth: mobile ? 'none' : 920, margin: '0 auto', textAlign: rtl ? 'right' : 'left' }}>
        <div className="font-sans-ui inline-flex items-center gap-2 mb-6"
          style={{
            fontSize: 11.5, letterSpacing: '0.16em', textTransform: 'uppercase',
            color: 'oklch(0.85 0.05 245)', fontWeight: 600,
            padding: '5px 12px', borderRadius: 999,
            background: 'oklch(0.72 0.19 245 / 0.1)',
            boxShadow: 'inset 0 0 0 1px oklch(0.72 0.19 245 / 0.3)',
          }}>
          <span className="gd-tier-dot" />
          {locale === 'he' ? 'משיקים 1 במאי' : locale === 'ar' ? 'الإطلاق في 1 مايو' : 'Launching May 1'}
        </div>
        <h1 className={titleFont}
            style={{
              ...titleSize,
              ...(script === 'latin' ? { fontVariationSettings: '"opsz" 144, "SOFT" 80', fontWeight: 400, letterSpacing: '-0.025em' } : {}),
              color: 'oklch(0.97 0.008 265)',
            }}>
          <span style={{ display: 'block' }}>{head.l1}</span>
          <span style={{
            display: 'block',
            color: 'oklch(0.82 0.1 245)',
            fontStyle: script === 'latin' ? 'italic' : 'normal',
          }}>{head.l2}</span>
        </h1>
        <p className="mt-6 font-sans-ui"
           style={{
             fontSize: mobile ? 16 : 19, lineHeight: 1.55,
             color: 'oklch(0.78 0.02 265)',
             maxWidth: rtl ? 'none' : 620,
             marginInlineStart: 0,
           }}>
          {subline}
        </p>
      </div>
    </div>
  );
}

// ─── Big homepage search bar (visually distinct from Screen 1's compact one) ──
function HomeSearch({ t, locale, mobile = false, rtl = false }) {
  const suggestions =
    locale === 'he' ? ['חלום', 'נוסטלגיה', 'ephemeral', 'serendipity']
    : locale === 'ar' ? ['حُلم', 'حنين', 'ephemeral', 'serendipity']
    : ['dream', 'ephemeral', 'serendipity', 'חלום'];

  return (
    <div style={{ maxWidth: 920, margin: '0 auto' }}>
      <div className="relative"
        style={{
          background: 'oklch(1 0 0 / 0.04)',
          borderRadius: 22,
          padding: mobile ? 6 : 8,
          boxShadow:
            'inset 0 0 0 1px oklch(0.72 0.19 245 / 0.25), ' +
            '0 0 0 6px oklch(0.72 0.19 245 / 0.06), ' +
            '0 30px 60px -20px oklch(0.5 0.2 250 / 0.4)',
          backdropFilter: 'blur(18px)',
        }}>
        <div className="flex items-center gap-3"
          style={{ padding: mobile ? '14px 16px' : '18px 22px',
                   background: 'oklch(0.16 0.05 265 / 0.6)',
                   borderRadius: 16 }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"
               style={{ color: 'oklch(0.82 0.1 245)', flexShrink: 0 }}>
            <circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="1.5" />
            <path d="m15 15 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            className="flex-1 bg-transparent outline-none font-sans-ui"
            style={{ color: 'white', fontSize: mobile ? 16 : 19 }}
            placeholder={t('searchPlaceholder')}
            dir={rtl ? 'rtl' : 'ltr'}
          />
          {!mobile && (
            <button className="font-sans-ui text-[12.5px] flex items-center gap-1.5"
              style={{ color: 'oklch(0.82 0.1 245)', padding: '7px 12px',
                       borderRadius: 999, background: 'oklch(0.72 0.19 245 / 0.14)',
                       boxShadow: 'inset 0 0 0 1px oklch(0.72 0.19 245 / 0.25)' }}>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              {t('addContext')}
            </button>
          )}
          <button
            className="font-sans-ui font-medium"
            style={{
              fontSize: mobile ? 13 : 14,
              padding: mobile ? '10px 16px' : '12px 22px',
              borderRadius: 12,
              background: 'linear-gradient(180deg, oklch(0.78 0.17 245), oklch(0.62 0.2 250))',
              color: 'white',
              boxShadow: '0 0 0 1px oklch(0.5 0.2 250 / 0.6), 0 8px 22px oklch(0.5 0.2 250 / 0.4)',
            }}>
            {t('explain')}
          </button>
        </div>
      </div>

      {/* Suggestion chips */}
      <div className={`mt-5 flex items-center gap-2 ${mobile ? 'flex-wrap' : ''} ${rtl ? 'justify-end' : ''}`}
           style={{ paddingInlineStart: 8 }}>
        <span className="font-sans-ui text-[11.5px]"
              style={{ color: 'oklch(0.62 0.02 265)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
          {locale === 'he' ? 'נסו' : locale === 'ar' ? 'جرّب' : 'Try'}
        </span>
        {suggestions.map((s) => {
          const isHe = /[\u0590-\u05ff]/.test(s);
          const isAr = /[\u0600-\u06ff]/.test(s);
          const fontClass = isHe ? 'font-he' : isAr ? 'font-ar' : 'font-display';
          return (
            <button key={s}
              className={`${fontClass} transition-colors hover:bg-white/10`}
              style={{
                fontSize: 14, fontStyle: !isHe && !isAr ? 'italic' : 'normal',
                color: 'oklch(0.92 0.01 265)',
                padding: '5px 13px',
                borderRadius: 999,
                background: 'oklch(1 0 0 / 0.05)',
                boxShadow: 'inset 0 0 0 1px oklch(1 0 0 / 0.1)',
              }}>
              {s}
            </button>
          );
        })}
      </div>

      <div className={`mt-3 font-sans-ui text-[12px] ${rtl ? 'text-right' : ''}`}
           style={{ color: 'oklch(0.55 0.02 265)', paddingInlineStart: 8 }}>
        {t('contextHint')}
      </div>
    </div>
  );
}

// ─── Value props (4-up) ────────────────────────────────────────
function ValueProps({ t, locale, mobile = false, rtl = false }) {
  const PROPS = {
    en: [
      { eyebrow: 'Context-aware', title: 'The right meaning, every time', body: 'Paste a sentence — Gadit picks the sense that fits, not just the most common one.' },
      { eyebrow: 'Visual', title: 'A vivid image, just for this word', body: 'Generated for each entry. A visual anchor for how a word feels — not a stock photo.' },
      { eyebrow: 'Etymology', title: 'A history note, not a Wikipedia dump', body: 'Where the word came from, told as a paragraph — the kind a curious friend would write.' },
      { eyebrow: '7 languages', title: 'Hebrew & Arabic, fully native', body: 'Real RTL, real fonts, real idioms — not a translated UI bolted on.' },
    ],
    he: [
      { eyebrow: 'מודע להקשר', title: 'המשמעות הנכונה, בכל פעם', body: 'הדביקו משפט — Gadit יבחר את המשמעות שמתאימה, לא רק את הנפוצה.' },
      { eyebrow: 'ויזואלי', title: 'תמונה חיה, במיוחד למילה הזו', body: 'נוצרת לכל ערך. עוגן ויזואלי לתחושת המילה — לא תמונת סטוק.' },
      { eyebrow: 'אטימולוגיה', title: 'הערה היסטורית, לא ויקיפדיה', body: 'מאיפה המילה הגיעה, מסופר כפסקה — כמו שחבר סקרן היה כותב.' },
      { eyebrow: '7 שפות', title: 'עברית וערבית, ילידיות', body: 'RTL אמיתי, גופנים אמיתיים, ביטויים אמיתיים — לא ממשק מתורגם.' },
    ],
    ar: [
      { eyebrow: 'مدرك للسياق', title: 'المعنى الصحيح في كل مرة', body: 'ألصق الجملة — يختار Gadit المعنى الملائم لا الأكثر شيوعًا.' },
      { eyebrow: 'بصري', title: 'صورة حيّة لهذه الكلمة', body: 'تُنشَأ لكل مدخل. مرساة بصرية لشعور الكلمة — لا صورة جاهزة.' },
      { eyebrow: 'الأصل', title: 'ملاحظة تاريخية، لا مدخل ويكيبيديا', body: 'من أين أتت الكلمة، يُروى كفقرة — كما يكتب صديق فضولي.' },
      { eyebrow: '7 لغات', title: 'العربية والعبرية، بكامل أصالتهما', body: 'RTL حقيقي، خطوط حقيقية، تعابير حقيقية — لا واجهة مترجمة.' },
    ],
  };
  const items = PROPS[locale] || PROPS.en;

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto',
                  paddingBlockStart: mobile ? 64 : 130, paddingBlockEnd: mobile ? 30 : 60,
                  paddingInline: mobile ? 4 : 0 }}>
      <div className={`mb-10 ${rtl ? 'text-right' : ''}`}>
        <Eyebrow style={{ color: 'oklch(0.82 0.008 265)' }}>
          {locale === 'he' ? 'מה Gadit עושה אחרת' : locale === 'ar' ? 'ما الذي يفعله Gadit بشكل مختلف' : 'What Gadit does differently'}
        </Eyebrow>
        <h2 className={LOCALE_META[locale].script === 'latin' ? 'font-display' : LOCALE_META[locale].script === 'he' ? 'font-he' : 'font-ar'}
            style={{
              fontSize: mobile ? 28 : 40, lineHeight: 1.15,
              color: 'oklch(0.95 0.008 265)', marginTop: 8,
              maxWidth: 760,
              ...(LOCALE_META[locale].script === 'latin' ? { fontVariationSettings: '"opsz" 60', fontStyle: 'italic' } : {}),
            }}>
          {locale === 'he' ? 'יותר מהגדרה — דרך לחיות עם המילה.'
           : locale === 'ar' ? 'أكثر من تعريف — طريقة للعيش مع الكلمة.'
           : 'More than a definition — a way to live with a word.'}
        </h2>
      </div>
      <div className={`grid gap-4 ${mobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {items.map((p, i) => (
          <div key={i}
            style={{
              borderRadius: 18,
              padding: mobile ? '22px 22px' : '28px 30px',
              background: 'oklch(0.21 0.05 265 / 0.55)',
              boxShadow: 'inset 0 0 0 1px oklch(1 0 0 / 0.07), 0 4px 18px oklch(0.08 0.08 260 / 0.35)',
              backdropFilter: 'blur(10px)',
            }}>
            <Eyebrow style={{ color: 'oklch(0.82 0.1 245)' }}>{p.eyebrow}</Eyebrow>
            <div className={LOCALE_META[locale].script === 'latin' ? 'font-display' : LOCALE_META[locale].script === 'he' ? 'font-he' : 'font-ar'}
                 style={{
                   fontSize: mobile ? 21 : 25, lineHeight: 1.25,
                   color: 'oklch(0.96 0.008 265)',
                   marginTop: 10,
                   ...(LOCALE_META[locale].script === 'latin' ? { fontVariationSettings: '"opsz" 32' } : {}),
                 }}>
              {p.title}
            </div>
            <p className={`mt-3 font-sans-ui ${LOCALE_META[locale].dir === 'rtl' ? 'rtl-body' : ''}`}
               style={{ fontSize: mobile ? 14 : 15, lineHeight: 1.55, color: 'oklch(0.74 0.02 265)' }}>
              {p.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tier strip ────────────────────────────────────────────────
function TierStrip({ t, locale, mobile = false, rtl = false }) {
  const TIERS = {
    en: [
      { name: 'Free', price: '$0', tag: '', bullets: ['20 searches per day', 'All meanings', '3 examples per meaning', 'Basic etymology'] },
      { name: 'Clear', price: '$2.99', tag: '/mo', bullets: ['Everything in Free', 'Unlimited searches', 'Kids explanation', 'AI image generation (30/mo)', 'Compose sentence with feedback', 'Common idioms', 'Search history'], highlight: true },
      { name: 'Deep', price: '$4.99', tag: '/mo', bullets: ['Everything in Clear', 'Practice quizzes', 'Personal notebook (galaxy view)', 'Spaced repetition', 'Word comparisons', 'AI image generation (100/mo)'] },
    ],
    he: [
      { name: 'Free', price: '₪0', tag: '', bullets: ['20 חיפושים ביום', 'כל המשמעויות', '3 דוגמאות לכל משמעות', 'אטימולוגיה בסיסית'] },
      { name: 'Clear', price: '₪10', tag: '/חודש', bullets: ['כל מה שיש ב־Free', 'חיפושים ללא הגבלה', 'הסבר לילדים', 'יצירת תמונות AI (30 בחודש)', 'חיבור משפטים עם משוב', 'ביטויים נפוצים', 'היסטוריית חיפוש'], highlight: true },
      { name: 'Deep', price: '₪17', tag: '/חודש', bullets: ['כל מה שיש ב־Clear', 'תרגולים ומבחנים', 'מחברת אישית (תצוגת גלקסיה)', 'חזרה מרווחת', 'השוואת מילים', 'יצירת תמונות AI (100 בחודש)'] },
    ],
    ar: [
      { name: 'Free', price: '$0', tag: '', bullets: ['20 بحثًا في اليوم', 'جميع المعاني', '3 أمثلة لكل معنى', 'أصل أساسي'] },
      { name: 'Clear', price: '$2.99', tag: '/شهر', bullets: ['كل ما في Free', 'بحث بلا حدود', 'شرح للأطفال', 'توليد صور بالذكاء الاصطناعي (30 شهريًا)', 'تأليف الجمل مع مراجعة', 'تعابير شائعة', 'سجلّ البحث'], highlight: true },
      { name: 'Deep', price: '$4.99', tag: '/شهر', bullets: ['كل ما في Clear', 'اختبارات تدريب', 'دفتر شخصي (تصوير المجرّة)', 'مراجعة موزّعة', 'مقارنة الكلمات', 'توليد صور بالذكاء الاصطناعي (100 شهريًا)'] },
    ],
  };
  const trustLine = {
    en: 'Cancel anytime · 14-day trial on Clear monthly · No charge until trial ends',
    he: 'ביטול בכל עת · ניסיון 14 ימים על Clear חודשי · ללא חיוב עד סוף הניסיון',
    ar: 'ألغِ في أي وقت · تجربة 14 يومًا على Clear الشهري · بلا رسوم حتى نهاية التجربة',
  }[locale] || 'Cancel anytime · 14-day trial on Clear monthly · No charge until trial ends';
  const tiers = TIERS[locale] || TIERS.en;

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto',
                  paddingBlockStart: mobile ? 50 : 100, paddingBlockEnd: mobile ? 40 : 80 }}>
      <div className={`mb-8 ${rtl ? 'text-right' : ''}`}>
        <Eyebrow style={{ color: 'oklch(0.82 0.008 265)' }}>
          {locale === 'he' ? 'תמחור' : locale === 'ar' ? 'الأسعار' : 'Pricing'}
        </Eyebrow>
        <div className={LOCALE_META[locale].script === 'latin' ? 'font-display' : LOCALE_META[locale].script === 'he' ? 'font-he' : 'font-ar'}
             style={{ fontSize: mobile ? 26 : 34, color: 'oklch(0.95 0.008 265)', marginTop: 6,
                      ...(LOCALE_META[locale].script === 'latin' ? { fontVariationSettings: '"opsz" 48', fontStyle: 'italic' } : {}) }}>
          {locale === 'he' ? 'שלוש רמות. כולן עם תוכן אמיתי.'
           : locale === 'ar' ? 'ثلاث مستويات. كلّها بمحتوى حقيقي.'
           : 'Three tiers. All with real content.'}
        </div>
      </div>
      <div className={`grid gap-3 ${mobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
        {tiers.map((tier) => (
          <div key={tier.name}
            style={{
              borderRadius: 18,
              padding: mobile ? '22px 22px' : '28px 26px',
              background: tier.highlight
                ? 'linear-gradient(180deg, oklch(0.24 0.07 260 / 0.85), oklch(0.18 0.06 265 / 0.85))'
                : 'oklch(0.20 0.05 265 / 0.55)',
              boxShadow: tier.highlight
                ? 'inset 0 0 0 1px oklch(0.72 0.19 245 / 0.5), 0 0 0 4px oklch(0.72 0.19 245 / 0.06), 0 16px 36px -12px oklch(0.5 0.2 250 / 0.5)'
                : 'inset 0 0 0 1px oklch(1 0 0 / 0.07), 0 4px 18px oklch(0.08 0.08 260 / 0.3)',
            }}>
            <div className="flex items-baseline justify-between mb-4">
              <div className="font-sans-ui font-semibold"
                   style={{ fontSize: 15, color: 'oklch(0.96 0.008 265)' }}>{tier.name}</div>
              {tier.highlight && <TierBadge tier="clear" small />}
            </div>
            <div className="font-display flex items-baseline gap-1"
                 style={{ fontSize: 38, color: 'oklch(0.97 0.008 265)',
                          fontVariationSettings: '"opsz" 96', letterSpacing: '-0.02em' }}>
              {tier.price}
              <span className="font-sans-ui" style={{ fontSize: 13, color: 'oklch(0.62 0.02 265)' }}>{tier.tag}</span>
            </div>
            <ul className="mt-5 space-y-2.5">
              {tier.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2 font-sans-ui"
                    style={{ fontSize: 13.5, color: 'oklch(0.85 0.015 265)' }}>
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{ color: 'oklch(0.82 0.1 245)', marginTop: 4, flexShrink: 0 }}>
                    <path d="M3 7.5l2.5 2.5L11 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {/* Trust microcopy */}
      <div className={`mt-6 font-sans-ui ${rtl ? 'text-right' : 'text-center'}`}
           style={{ fontSize: 12.5, color: 'oklch(0.62 0.02 265)' }}>
        {trustLine}
      </div>
    </div>
  );
}

// ─── Live preview tease ────────────────────────────────────────
// Shows a tiny "what a result looks like" card under the hero — proof
// without making them search.
function ResultTease({ t, locale, mobile = false, rtl = false }) {
  const meta = LOCALE_META[locale];
  const sample = locale === 'he'
    ? { word: 'חלום', def: 'רצף של דימויים שמופיעים בתודעה בזמן השינה.', ex: 'הוא התעורר מחלום מוזר על עיר שצפה מעל הים.' }
    : locale === 'ar'
    ? { word: 'حُلم', def: 'سلسلة من الصور والأفكار تمر في الذهن أثناء النوم.', ex: 'رأى في حلمه مدينةً تطفو فوق البحر.' }
    : { word: 'dream', def: 'A series of thoughts, images, or sensations occurring in the mind during sleep.', ex: 'I had a strange dream last night about flying over a forest of glass.' };

  const titleFont = meta.script === 'he' ? 'font-he' : meta.script === 'ar' ? 'font-ar' : 'font-display';

  return (
    <div className="relative" style={{ maxWidth: 920, margin: '0 auto',
                                       marginBlockStart: mobile ? 36 : 72,
                                       paddingInline: mobile ? 0 : 0 }}>
      <div className="font-sans-ui mb-3 inline-flex items-center gap-2 ms-2"
           style={{ fontSize: 11, color: 'oklch(0.62 0.02 265)', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600 }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: 'oklch(0.72 0.19 245)' }} />
        {locale === 'he' ? 'תצוגה מקדימה' : locale === 'ar' ? 'معاينة' : 'Preview'}
      </div>
      <div className="gd-card relative" style={{ padding: mobile ? '22px 22px' : '32px 36px' }}>
        <div className="flex items-baseline gap-3 mb-2">
          <Eyebrow>{meta.label}</Eyebrow>
          <span style={{ color: 'var(--gd-ink-300)' }}>·</span>
          <span className="font-sans-ui text-[10.5px] italic" style={{ color: 'var(--gd-ink-500)' }}>noun</span>
        </div>
        <div className={`flex ${mobile ? 'flex-col gap-3' : 'items-baseline gap-6 justify-between'}`}>
          <h3 className={titleFont}
              style={{ fontSize: mobile ? 44 : 60, color: 'var(--gd-ink-900)',
                       letterSpacing: meta.script === 'latin' ? '-0.025em' : 0,
                       lineHeight: 1.05,
                       ...(meta.script === 'latin' ? { fontVariationSettings: '"opsz" 96', fontWeight: 400 } : {}) }}>
            {sample.word}
          </h3>
          <TierBadge tier="clear" />
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4">
          <div className="flex items-start gap-3">
            <MeaningBadge n={1} />
            <div className="flex-1">
              <p className={meta.script === 'latin' ? 'font-display' : meta.script === 'he' ? 'font-he rtl-body' : 'font-ar rtl-body'}
                 style={{ fontSize: mobile ? 17 : 19, lineHeight: 1.4, color: 'var(--gd-ink-900)',
                          ...(meta.script === 'latin' ? { fontVariationSettings: '"opsz" 24' } : {}) }}>
                {sample.def}
              </p>
              <p className={`mt-2 ${meta.script === 'latin' ? 'font-display' : meta.script === 'he' ? 'font-he rtl-body' : 'font-ar rtl-body'}`}
                 style={{ fontSize: mobile ? 14.5 : 15.5, lineHeight: 1.55, color: 'var(--gd-ink-500)',
                          fontStyle: meta.script === 'latin' ? 'italic' : 'normal' }}>
                {sample.ex}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* "see full result" arrow */}
      <div className="mt-4 flex items-center justify-center">
        <a className="font-sans-ui inline-flex items-center gap-2 hover:text-white transition-colors"
           style={{ fontSize: 12.5, color: 'oklch(0.78 0.05 245)' }}>
          {locale === 'he' ? 'ראו תוצאה מלאה' : locale === 'ar' ? 'انظر النتيجة الكاملة' : 'See the full result'}
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M3 6h6m0 0L6 3m3 3L6 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </a>
      </div>
    </div>
  );
}

// ─── Footer (minimal) ──────────────────────────────────────────
function HomeFooter({ locale, rtl, mobile }) {
  const groups = {
    en: [
      ['Product', ['Compare', 'Notebook', 'Pricing']],
      ['Legal',   ['Privacy', 'Terms', 'Contact']],
    ],
    he: [
      ['מוצר', ['השוואה', 'מחברת', 'תמחור']],
      ['משפטי', ['פרטיות', 'תנאים', 'צור קשר']],
    ],
    ar: [
      ['المنتج', ['مقارنة', 'الدفتر', 'الأسعار']],
      ['قانوني', ['الخصوصية', 'الشروط', 'تواصل']],
    ],
  };
  const cols = groups[locale] || groups.en;

  return (
    <footer style={{ maxWidth: 1120, margin: '0 auto',
                     paddingBlockStart: mobile ? 36 : 60, paddingBlockEnd: mobile ? 28 : 36,
                     borderTop: '1px solid oklch(1 0 0 / 0.06)' }}>
      <div className={`flex ${mobile ? 'flex-col gap-8' : 'items-start justify-between'}`}>
        <div style={{ maxWidth: 320 }}>
          <Wordmark />
          <p className="mt-3 font-sans-ui"
             style={{ fontSize: 12.5, color: 'oklch(0.6 0.02 265)', lineHeight: 1.55 }}>
            {locale === 'he' ? 'מילון חכם ל־7 שפות. בנוי לקריאה אמיתית.'
             : locale === 'ar' ? 'قاموس ذكي بسبع لغات. مبنيّ للقراءة الحقيقية.'
             : 'A smart dictionary for 7 languages. Built for real reading.'}
          </p>
        </div>
        <div className={`grid grid-cols-2 ${mobile ? 'gap-6' : 'gap-12'}`}>
          {cols.map(([title, items]) => (
            <div key={title}>
              <Eyebrow style={{ color: 'oklch(0.82 0.008 265)' }}>{title}</Eyebrow>
              <ul className="mt-3 space-y-2 font-sans-ui">
                {items.map((it) => (
                  <li key={it}>
                    <a className="hover:text-white transition-colors"
                       style={{ fontSize: 13, color: 'oklch(0.78 0.02 265)' }}>{it}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-10 pt-6 flex items-center justify-between font-sans-ui"
           style={{ fontSize: 11, color: 'oklch(0.5 0.02 265)',
                    borderTop: '1px solid oklch(1 0 0 / 0.04)' }}>
        <span>© 2026 Gadit</span>
        <span>{LOCALE_META[locale].label} · 7 languages</span>
      </div>
    </footer>
  );
}

Object.assign(window, { HomeHero, HomeSearch, ValueProps, TierStrip, ResultTease, HomeFooter });
