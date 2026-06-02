/* Screen 9 — Spaced Repetition Practice (Deep tier).
   Flashcard: Phase 1 (front) → Phase 2 (back) → Phase 3 (summary)
   Plus: empty state.
   Mature, calm. No streaks/points/confetti. */

// ─── Sample review queue ───────────────────────────────────────
const SR_QUEUE = {
  en: [
    { word: 'serendipity', meaning: 'The occurrence of finding pleasant things by chance.',
      examples: ['It was pure serendipity that we met at the same bookstore on the same rainy afternoon.',
                 'Most great discoveries owe something to serendipity.'] },
    { word: 'ephemeral', meaning: 'Lasting for a very short time.',
      examples: ['Cherry blossoms are beautiful precisely because they are ephemeral.',
                 'The ephemeral glow of fireflies on a summer night.'] },
    { word: 'petrichor', meaning: 'The earthy smell produced when rain falls on dry soil.',
      examples: ['The first thing she noticed stepping outside was the petrichor.'] },
    { word: 'liminal', meaning: 'Occupying a position at, or on both sides of, a boundary or threshold.',
      examples: ['Airports have a liminal quality — neither here nor there.'] },
    { word: 'sonder', meaning: 'The realization that each passerby has a life as vivid and complex as your own.',
      examples: ['Standing on the bridge at dusk, a quiet sonder washed over him.'] },
  ],
  he: [
    { word: 'חלום', meaning: 'רצף של דימויים, רעיונות ותחושות שעוברים בתודעה במהלך השינה.',
      examples: ['הוא התעורר מחלום מוזר על עיר שצפה מעל הים.',
                 'היה לה חלום על אישה שלבשה גלימה של אור.'] },
    { word: 'נוסטלגיה', meaning: 'געגוע אל תקופה או מקום מן העבר, מהול בעצב מתוק.',
      examples: ['ריח התפוזים הציף אותה בנוסטלגיה לבית סבתה.'] },
  ],
  ar: [
    { word: 'حُلم', meaning: 'سلسلة من الصور والأفكار والأحاسيس التي تمر في الذهن أثناء النوم.',
      examples: ['رأى في حلمه مدينةً تطفو فوق البحر.'] },
  ],
};

// ─── Phase 1 — Front of card ───────────────────────────────────
function SRFront({ entry, index, total, onReveal, onSkip, locale, mobile, t }) {
  const meta = LOCALE_META[locale];
  const titleFont = meta.script === 'he' ? 'font-he' : meta.script === 'ar' ? 'font-ar' : 'font-display';
  const dir = meta.dir;
  const rtl = dir === 'rtl';

  return (
    <div className="gd-card relative cursor-pointer"
         onClick={onReveal}
         dir={dir}
         style={{
           width: '100%', maxWidth: 720,
           padding: mobile ? '40px 28px 32px' : '64px 56px 48px',
           minHeight: mobile ? 380 : 460,
           display: 'flex', flexDirection: 'column',
           textAlign: 'center',
         }}>
      {/* Top row: eyebrow · counter | skip */}
      <div className={`flex items-center justify-between ${rtl ? 'flex-row-reverse' : ''}`}
           style={{ marginInline: mobile ? -4 : -12 }}>
        <div className={`flex items-center gap-2.5 ${rtl ? 'flex-row-reverse' : ''}`}>
          <Eyebrow style={{ color: 'oklch(0.4 0.14 250)' }}>{t('srEyebrow')}</Eyebrow>
          <span style={{ color: 'var(--gd-ink-300)', fontSize: 11 }}>·</span>
          <span className="font-sans-ui" style={{ fontSize: 11, color: 'var(--gd-ink-500)', letterSpacing: '0.06em' }}>
            {t('srWordNofM', index + 1, total)}
          </span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onSkip(); }}
          className="font-sans-ui hover:text-[oklch(0.5_0.05_265)] transition-colors"
          style={{ fontSize: 12, color: 'var(--gd-ink-400)', padding: '4px 8px' }}>
          {t('srSkip')}
        </button>
      </div>

      {/* Progress pips */}
      <div className={`mt-5 flex items-center gap-1.5 ${rtl ? 'flex-row-reverse justify-end' : ''}`}>
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} style={{
            width: i === index ? 18 : 10, height: 4, borderRadius: 999,
            background: i < index
              ? 'oklch(0.7 0.13 155 / 0.55)'
              : i === index
                ? 'oklch(0.5 0.18 250)'
                : 'oklch(0.85 0.005 265)',
            transition: 'all 200ms',
          }}/>
        ))}
      </div>

      {/* Center: word */}
      <div className="flex-1 flex flex-col items-center justify-center" style={{ marginBlock: mobile ? 36 : 56 }}>
        <h2 className={titleFont}
            style={{
              fontSize: mobile ? 56 : 88,
              lineHeight: 1.05,
              color: 'oklch(0.4 0.14 250)',
              fontStyle: meta.script === 'latin' ? 'italic' : 'normal',
              letterSpacing: meta.script === 'latin' ? '-0.02em' : 0,
              ...(meta.script === 'latin' ? { fontVariationSettings: '"opsz" 144, "SOFT" 80', fontWeight: 400 } : { fontWeight: 600 }),
            }}>
          {entry.word}
        </h2>
      </div>

      {/* Reveal hint */}
      <div className={`font-sans-ui flex items-center justify-center gap-2 ${rtl ? 'flex-row-reverse' : ''}`}
           style={{ fontSize: 12.5, color: 'var(--gd-ink-500)', letterSpacing: '0.04em' }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 3v8M3 7l4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {mobile ? t('srTapToReveal') : t('srClickToReveal')}
      </div>
    </div>
  );
}

// ─── Phase 2 — Back of card ────────────────────────────────────
function SRBack({ entry, index, total, onKnew, onForgot, locale, mobile, t }) {
  const meta = LOCALE_META[locale];
  const titleFont = meta.script === 'he' ? 'font-he' : meta.script === 'ar' ? 'font-ar' : 'font-display';
  const bodyFont = meta.script === 'he' ? 'font-he rtl-body' : meta.script === 'ar' ? 'font-ar rtl-body' : 'font-display';
  const dir = meta.dir;
  const rtl = dir === 'rtl';

  return (
    <div className="gd-card relative"
         dir={dir}
         style={{
           width: '100%', maxWidth: 720,
           padding: mobile ? '32px 28px' : '52px 56px 44px',
         }}>
      {/* Same header */}
      <div className={`flex items-center ${rtl ? 'flex-row-reverse' : ''} gap-2.5`}
           style={{ marginInline: mobile ? -4 : -12 }}>
        <Eyebrow style={{ color: 'oklch(0.4 0.14 250)' }}>{t('srEyebrow')}</Eyebrow>
        <span style={{ color: 'var(--gd-ink-300)', fontSize: 11 }}>·</span>
        <span className="font-sans-ui" style={{ fontSize: 11, color: 'var(--gd-ink-500)', letterSpacing: '0.06em' }}>
          {t('srWordNofM', index + 1, total)}
        </span>
      </div>

      {/* Word — smaller now */}
      <h3 className={titleFont}
          style={{
            fontSize: mobile ? 32 : 40,
            color: 'oklch(0.4 0.14 250)',
            fontStyle: meta.script === 'latin' ? 'italic' : 'normal',
            letterSpacing: meta.script === 'latin' ? '-0.02em' : 0,
            marginTop: 18,
            ...(meta.script === 'latin' ? { fontVariationSettings: '"opsz" 60', fontWeight: 400 } : { fontWeight: 600 }),
          }}>
        {entry.word}
      </h3>

      {/* Meaning */}
      <div className="mt-5">
        <div className={`font-sans-ui mb-2 ${rtl ? 'text-right' : ''}`}
             style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase',
                      color: 'var(--gd-ink-500)', fontWeight: 600 }}>
          {t('srPrimaryMeaningLabel')}
        </div>
        <p className={bodyFont}
           style={{
             fontSize: mobile ? 19 : 22,
             lineHeight: 1.4,
             color: 'var(--gd-ink-900)',
             ...(meta.script === 'latin' ? { fontVariationSettings: '"opsz" 32' } : {}),
           }}>
          {entry.meaning}
        </p>
      </div>

      {/* Examples */}
      <div className="mt-6">
        <div className={`font-sans-ui mb-2 ${rtl ? 'text-right' : ''}`}
             style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase',
                      color: 'var(--gd-ink-500)', fontWeight: 600 }}>
          {t('srExamplesLabel')}
        </div>
        <ul className="space-y-2">
          {entry.examples.map((ex, i) => (
            <li key={i}
                className={bodyFont}
                style={{
                  fontSize: mobile ? 14.5 : 16,
                  lineHeight: 1.55,
                  color: 'var(--gd-ink-700)',
                  fontStyle: meta.script === 'latin' ? 'italic' : 'normal',
                  paddingInlineStart: 14,
                  borderInlineStart: '2px solid oklch(0.85 0.04 250)',
                }}>
              {ex}
            </li>
          ))}
        </ul>
      </div>

      {/* Response buttons — equal weight, only tint differs */}
      <div className={`mt-8 grid grid-cols-2 gap-3 ${rtl ? 'direction-rtl' : ''}`}>
        <button
          onClick={onForgot}
          className="font-sans-ui font-medium transition-all hover:translate-y-[-1px]"
          style={{
            padding: mobile ? '14px 14px' : '16px 18px',
            borderRadius: 12,
            background: 'oklch(0.99 0.012 75)',
            color: 'oklch(0.42 0.14 75)',
            fontSize: mobile ? 14.5 : 15,
            boxShadow: 'inset 0 0 0 1.5px oklch(0.78 0.13 75 / 0.55), 0 1px 2px oklch(0.5 0.1 75 / 0.1)',
          }}>
          {t('srIForgot')}
        </button>
        <button
          onClick={onKnew}
          className="font-sans-ui font-medium transition-all hover:translate-y-[-1px]"
          style={{
            padding: mobile ? '14px 14px' : '16px 18px',
            borderRadius: 12,
            background: 'oklch(0.98 0.018 155)',
            color: 'oklch(0.4 0.13 155)',
            fontSize: mobile ? 14.5 : 15,
            boxShadow: 'inset 0 0 0 1.5px oklch(0.74 0.13 155 / 0.55), 0 1px 2px oklch(0.5 0.1 155 / 0.1)',
          }}>
          {t('srIKnewIt')}
        </button>
      </div>

      {/* Scheduling hint */}
      <p className={`font-sans-ui mt-3 ${rtl ? 'text-right' : 'text-center'}`}
         style={{ fontSize: 11.5, color: 'var(--gd-ink-500)', lineHeight: 1.5 }}>
        {t('srSchedulingHint')}
      </p>
    </div>
  );
}

// ─── Phase 3 — Summary ─────────────────────────────────────────
function SRSummary({ knew, forgot, locale, mobile, t, onDone, onMore }) {
  const meta = LOCALE_META[locale];
  const dir = meta.dir;
  const rtl = dir === 'rtl';
  const total = knew + forgot;
  const due = forgot;

  return (
    <div className="gd-card relative"
         dir={dir}
         style={{
           width: '100%', maxWidth: 720,
           padding: mobile ? '40px 28px 32px' : '60px 56px 48px',
           textAlign: rtl ? 'right' : 'left',
         }}>
      <Eyebrow style={{ color: 'oklch(0.4 0.14 250)' }}>{t('srEyebrow')}</Eyebrow>

      {/* Big number */}
      <div className="font-display flex items-baseline gap-3 mt-3"
           style={{ flexDirection: rtl ? 'row-reverse' : 'row' }}>
        <span style={{
          fontSize: mobile ? 88 : 132,
          lineHeight: 0.95,
          color: 'oklch(0.4 0.14 250)',
          fontVariationSettings: '"opsz" 144, "SOFT" 80',
          fontWeight: 400,
          fontStyle: 'italic',
          letterSpacing: '-0.03em',
        }}>{total}</span>
        <span className="font-sans-ui" style={{ fontSize: mobile ? 17 : 20, color: 'var(--gd-ink-700)', maxWidth: 200, lineHeight: 1.3 }}>
          {locale === 'he' ? 'מילים תרגלתם' : locale === 'ar' ? 'كلمات تدرّبت عليها' : 'words practiced'}
        </span>
      </div>

      {/* Stat line */}
      <p className="font-sans-ui mt-5"
         style={{ fontSize: mobile ? 15 : 17, color: 'var(--gd-ink-700)', lineHeight: 1.5 }}>
        {t('srSummaryStat', knew, forgot)}
      </p>

      {/* Calendar preview */}
      <div className="mt-7"
           style={{
             padding: mobile ? '14px 18px' : '16px 22px',
             borderRadius: 12,
             background: 'oklch(0.96 0.012 250 / 0.6)',
             boxShadow: 'inset 0 0 0 1px oklch(0.5 0.18 250 / 0.18)',
           }}>
        <div className={`flex items-center gap-3 ${rtl ? 'flex-row-reverse' : ''}`}>
          {/* Mini calendar glyph */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ color: 'oklch(0.5 0.16 250)', flexShrink: 0 }}>
            <rect x="3.5" y="5" width="17" height="15" rx="2" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M3.5 9h17M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            <circle cx="12" cy="14" r="1.6" fill="currentColor"/>
          </svg>
          <p className="font-sans-ui"
             style={{ fontSize: mobile ? 14 : 15, color: 'var(--gd-ink-900)', lineHeight: 1.5 }}>
            {t('srNextReview', t('srTomorrow'), due > 0 ? due : 3)}
          </p>
        </div>
      </div>

      {/* CTAs */}
      <div className={`mt-7 flex gap-3 ${mobile ? 'flex-col' : ''} ${rtl && !mobile ? 'flex-row-reverse' : ''}`}>
        <button
          onClick={onDone}
          className="font-sans-ui font-medium"
          style={{
            padding: mobile ? '13px 18px' : '14px 24px',
            borderRadius: 12,
            background: 'linear-gradient(180deg, oklch(0.78 0.17 245), oklch(0.62 0.2 250))',
            color: 'white',
            fontSize: mobile ? 14.5 : 15,
            boxShadow: '0 0 0 1px oklch(0.5 0.2 250 / 0.6), 0 8px 22px oklch(0.5 0.2 250 / 0.4)',
          }}>
          {t('srDoneForToday')}
        </button>
        <button
          onClick={onMore}
          className="font-sans-ui"
          style={{
            padding: mobile ? '13px 18px' : '14px 24px',
            borderRadius: 12,
            background: 'transparent',
            color: 'var(--gd-ink-700)',
            fontSize: mobile ? 14.5 : 15,
            boxShadow: 'inset 0 0 0 1px oklch(0.85 0.005 265)',
          }}>
          {t('srPracticeMore')}
        </button>
      </div>
    </div>
  );
}

// ─── Empty state ───────────────────────────────────────────────
function SREmpty({ locale, mobile, t, onBack }) {
  const meta = LOCALE_META[locale];
  const titleFont = meta.script === 'he' ? 'font-he' : meta.script === 'ar' ? 'font-ar' : 'font-display';
  const dir = meta.dir;
  const rtl = dir === 'rtl';

  return (
    <div className="gd-card relative"
         dir={dir}
         style={{
           width: '100%', maxWidth: 720,
           padding: mobile ? '50px 28px 40px' : '80px 56px 64px',
           textAlign: 'center',
         }}>
      <Eyebrow style={{ color: 'oklch(0.4 0.14 250)' }}>{t('srEyebrow')}</Eyebrow>

      {/* Quiet glyph: a sparse star/dot — calm, not celebratory */}
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none"
           style={{ display: 'block', margin: '32px auto 24px', color: 'oklch(0.7 0.1 250)' }}>
        <circle cx="24" cy="24" r="2" fill="currentColor"/>
        <circle cx="24" cy="24" r="10" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.4"/>
        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="0.6" strokeOpacity="0.2"/>
      </svg>

      <h3 className={titleFont}
          style={{
            fontSize: mobile ? 28 : 36,
            color: 'var(--gd-ink-900)',
            fontStyle: meta.script === 'latin' ? 'italic' : 'normal',
            letterSpacing: meta.script === 'latin' ? '-0.02em' : 0,
            ...(meta.script === 'latin' ? { fontVariationSettings: '"opsz" 60', fontWeight: 400 } : { fontWeight: 600 }),
          }}>
        {t('srEmptyTitle')}
      </h3>
      <p className="font-sans-ui mt-3"
         style={{ fontSize: mobile ? 14.5 : 16, color: 'var(--gd-ink-700)', lineHeight: 1.5 }}>
        {t('srEmptyBody')}
      </p>

      <button
        onClick={onBack}
        className="font-sans-ui mt-8"
        style={{
          padding: mobile ? '12px 22px' : '13px 26px',
          borderRadius: 12,
          background: 'transparent',
          color: 'var(--gd-ink-900)',
          fontSize: mobile ? 14 : 15,
          fontWeight: 500,
          boxShadow: 'inset 0 0 0 1px oklch(0.85 0.005 265)',
        }}>
        {t('srBackToNotebook')}
      </button>
    </div>
  );
}

// ─── Frame: header + stage + content ───────────────────────────
function SRFrame({ children, locale, mobile, label }) {
  return (
    <div data-screen-label={label}
         className="gd-stage"
         dir={LOCALE_META[locale].dir}
         style={{ minHeight: '100%' }}>
      <div className="gd-stars" />
      <div className="relative" style={{ zIndex: 1 }}>
        {mobile ? <MobileHeader /> : <DarkHeader lang={LOCALE_META[locale].label} />}
      </div>
      <div className="relative" style={{
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: mobile ? '40px 16px 56px' : '90px 40px 90px',
      }}>
        {children}
      </div>
    </div>
  );
}

Object.assign(window, { SR_QUEUE, SRFront, SRBack, SRSummary, SREmpty, SRFrame });
