/* Screen 7 — Compare Confusable Words (Deep tier).
   /beta/compare. Two-input form, AI comparison result on a warm-paper card.
*/

const COMPARE_DATA = {
  en: {
    pair: ['affect', 'effect'],
    word1Definition: 'To have an influence on; to bring about a change in.',
    word1Pos: 'verb',
    word2Definition: 'A change that is the result of an action or cause.',
    word2Pos: 'noun',
    theDifference: 'Affect is almost always a verb — the act of influencing. Effect is almost always a noun — the result of that influence. If you can replace it with "result", use effect.',
    examples1: [
      'The drought affected every farm in the valley.',
      'Her quiet voice affected the whole room.',
    ],
    examples2: [
      'The new policy had an immediate effect on housing.',
      'The medicine took effect within minutes.',
    ],
    commonMistake: 'Writing "the effects of a policy" but "how policy affects us" — most native English speakers reverse them at least once a week.',
  },
  he: {
    pair: ['אומנות', 'אמנות'],
    word1Definition: 'מקצוע או מלאכה שדורשים מיומנות — נגרות, צורפות, אומנות הבישול.',
    word1Pos: 'שם עצם',
    word2Definition: 'יצירה של יופי או ביטוי — ציור, פיסול, מוזיקה.',
    word2Pos: 'שם עצם',
    theDifference: 'אומנות (עם וי״ו) היא מלאכה ומיומנות מקצועית. אמנות (בלי וי״ו) היא יצירה אסתטית. הראשונה היא לעשות, השנייה היא לבטא.',
    examples1: [
      'הוא למד את אומנות הצורפות מסבו.',
      'אין אומנות שאי־אפשר ללמוד.',
    ],
    examples2: [
      'התערוכה הציגה את חשיבות האמנות העכשווית.',
      'היא לומדת תולדות האמנות באוניברסיטה.',
    ],
    commonMistake: 'הוספת וי״ו ל"אמנות" או השמטתה מ"אומנות" — שיבוש כתיב נפוץ אפילו בעיתונות.',
  },
  ar: {
    pair: ['ضادّ', 'ظاءّ'],
    word1Definition: 'الحرف الخامس عشر من الأبجدية العربية، صوت احتكاكي مفخَّم.',
    word1Pos: 'حرف',
    word2Definition: 'الحرف السابع عشر من الأبجدية العربية، صوت احتكاكي مفخَّم أيضًا.',
    word2Pos: 'حرف',
    theDifference: 'كلاهما حرفان مفخَّمان قريبا المخرج، غير أن الضاد شديد ينطلق به الصوت، أما الظاء فرخو يستمرّ به الصوت دون انفجار.',
    examples1: [
      'الضاد لغةُ القرآن.',
      'النطق بالضاد يميِّز العربية عن سائر اللغات.',
    ],
    examples2: [
      'الظاء حرف عربي قائم بذاته.',
      'يخلط بعض الناطقين بين الظاء والضاد في الكتابة.',
    ],
    commonMistake: 'الخلط بين الضاد والظاء في الكتابة شائع جدًا — والقاعدة أن الظاء أقلّ ورودًا فإن شككتَ فالأرجح ضاد.',
  },
};

function CompareInput({ t, locale, mobile, rtl, value1 = '', value2 = '', loading = false }) {
  const meta = LOCALE_META[locale];
  const wordFont = meta.script === 'he' ? 'font-he' : meta.script === 'ar' ? 'font-ar' : 'font-display';

  const Field = ({ label, value, placeholder }) => (
    <div className="flex-1" style={{ minWidth: 0 }}>
      <label className="font-sans-ui block mb-2"
        style={{ fontSize: 11, color: 'oklch(0.62 0.02 265)',
                 letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600 }}>
        {label}
      </label>
      <div style={{
        background: 'oklch(1 0 0 / 0.04)',
        borderRadius: 14,
        padding: 5,
        boxShadow: 'inset 0 0 0 1px oklch(1 0 0 / 0.1)',
      }}>
        <input
          dir={rtl ? 'rtl' : 'ltr'}
          disabled={loading}
          defaultValue={value}
          placeholder={placeholder}
          className={`w-full bg-transparent outline-none ${wordFont}`}
          style={{
            color: 'white', fontSize: mobile ? 22 : 28,
            padding: mobile ? '12px 14px' : '14px 18px',
            fontStyle: meta.script === 'latin' ? 'italic' : 'normal',
            letterSpacing: meta.script === 'latin' ? '-0.01em' : 0,
            ...(meta.script === 'latin' ? { fontVariationSettings: '"opsz" 48' } : {}),
            opacity: loading ? 0.5 : 1,
          }}
        />
      </div>
    </div>
  );

  return (
    <div className={`${mobile ? 'space-y-3' : `flex items-end gap-4 ${rtl ? 'flex-row-reverse' : ''}`}`}>
      <Field label={t('word1Label')} value={value1} placeholder={t('word1Placeholder')} />
      {!mobile && (
        <div style={{
          width: 38, height: 1, marginBottom: 26, flexShrink: 0,
          background: 'oklch(1 0 0 / 0.18)',
        }} />
      )}
      <Field label={t('word2Label')} value={value2} placeholder={t('word2Placeholder')} />
      <button
        disabled={loading}
        className={`font-sans-ui font-medium ${mobile ? 'w-full mt-1' : ''}`}
        style={{
          fontSize: 14,
          padding: mobile ? '14px 22px' : '16px 26px',
          borderRadius: 14,
          marginBottom: mobile ? 0 : 0,
          alignSelf: mobile ? 'stretch' : 'flex-end',
          background: loading
            ? 'oklch(0.4 0.06 250 / 0.5)'
            : 'linear-gradient(180deg, oklch(0.78 0.17 245), oklch(0.62 0.2 250))',
          color: 'white',
          boxShadow: loading ? 'none' : '0 0 0 1px oklch(0.5 0.2 250 / 0.6), 0 8px 22px oklch(0.5 0.2 250 / 0.4)',
          flexShrink: 0,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
        {loading && (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
               style={{ animation: 'gd-spin 0.8s linear infinite' }}>
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20 30" strokeLinecap="round" opacity="0.9"/>
          </svg>
        )}
        {loading ? t('comparing') : t('compareCta')}
      </button>
    </div>
  );
}

function CompareEmpty({ t, locale, rtl, mobile }) {
  const meta = LOCALE_META[locale];
  return (
    <div style={{
      borderRadius: 18,
      padding: mobile ? '40px 24px' : '64px 32px',
      background: 'oklch(1 0 0 / 0.03)',
      boxShadow: 'inset 0 0 0 1px oklch(1 0 0 / 0.08)',
      textAlign: 'center',
    }}>
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none"
           style={{ color: 'oklch(0.5 0.05 265)', margin: '0 auto', opacity: 0.7 }}>
        <circle cx="13" cy="13" r="6" stroke="currentColor" strokeWidth="1.4"/>
        <circle cx="23" cy="23" r="6" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
      <p className={`mt-4 ${meta.script === 'latin' ? 'font-display' : meta.script === 'he' ? 'font-he' : 'font-ar'}`}
         style={{
           fontSize: mobile ? 17 : 19,
           color: 'oklch(0.65 0.02 265)',
           ...(meta.script === 'latin' ? { fontVariationSettings: '"opsz" 24', fontStyle: 'italic' } : {}),
         }}>
        {t('compareEmpty')}
      </p>
    </div>
  );
}

function CompareError({ t, locale, rtl, mobile, errorKey }) {
  return (
    <div style={{
      borderRadius: 14,
      padding: mobile ? '18px 18px' : '22px 24px',
      background: 'oklch(0.4 0.12 35 / 0.18)',
      boxShadow: 'inset 0 0 0 1px oklch(0.7 0.18 35 / 0.4)',
      display: 'flex', alignItems: 'flex-start', gap: 14,
      flexDirection: rtl ? 'row-reverse' : 'row',
      textAlign: rtl ? 'right' : 'left',
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 999,
        background: 'oklch(0.65 0.2 35 / 0.9)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, color: 'white',
      }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 3v5M7 10.5v0.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      </div>
      <div className="font-sans-ui" style={{ fontSize: 14.5, lineHeight: 1.5, color: 'oklch(0.95 0.02 35)' }}>
        {t(errorKey)}
      </div>
    </div>
  );
}

function CompareResult({ t, locale, rtl, mobile, data }) {
  const meta = LOCALE_META[locale];
  const wordFont = meta.script === 'he' ? 'font-he' : meta.script === 'ar' ? 'font-ar' : 'font-display';
  const bodyFont = meta.script === 'latin' ? 'font-display' : meta.script === 'he' ? 'font-he rtl-body' : 'font-ar rtl-body';

  const WordCol = ({ word, def, pos }) => (
    <div style={{ flex: 1, minWidth: 0 }}>
      <h3 className={wordFont}
          style={{
            fontSize: mobile ? 38 : 52,
            lineHeight: 1.05,
            color: 'oklch(0.5 0.18 250)',
            ...(meta.script === 'latin' ? { fontVariationSettings: '"opsz" 96', fontWeight: 400, letterSpacing: '-0.02em', fontStyle: 'italic' } : {}),
          }}>
        {word}
      </h3>
      <div className="font-sans-ui mt-2" style={{ fontSize: 11, color: 'var(--gd-ink-500)',
                                                  letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}>
        {LOCALE_META[locale].label} <span style={{ color: 'var(--gd-ink-300)' }}>·</span> <em style={{ fontStyle: 'italic', textTransform: 'none', letterSpacing: 0 }}>{pos}</em>
      </div>
      <p className={`mt-3 ${bodyFont}`}
         style={{
           fontSize: mobile ? 15.5 : 16.5,
           lineHeight: 1.5,
           color: 'var(--gd-ink-900)',
           ...(meta.script === 'latin' ? { fontVariationSettings: '"opsz" 22' } : {}),
         }}>
        {def}
      </p>
    </div>
  );

  return (
    <div className="gd-card" style={{
      padding: mobile ? '24px 22px' : '36px 40px',
      textAlign: rtl ? 'right' : 'left',
    }}>
      {/* 1. Side-by-side definitions */}
      <div className={`flex ${mobile ? 'flex-col gap-7' : `gap-12 ${rtl ? 'flex-row-reverse' : ''}`}`}>
        <WordCol word={data.pair[0]} def={data.word1Definition} pos={data.word1Pos} />
        {!mobile && <div style={{ width: 1, background: 'oklch(0 0 0 / 0.08)', alignSelf: 'stretch' }} />}
        <WordCol word={data.pair[1]} def={data.word2Definition} pos={data.word2Pos} />
      </div>

      {/* divider */}
      <div className="my-8" style={{ height: 1, background: 'oklch(0 0 0 / 0.08)' }} />

      {/* 2. The difference (blue-bar pull-quote) */}
      <div style={{
        borderInlineStart: '3px solid oklch(0.5 0.18 250)',
        paddingInlineStart: mobile ? 16 : 20,
      }}>
        <Eyebrow style={{ color: 'oklch(0.5 0.18 250)' }}>{t('theDifferenceLabel')}</Eyebrow>
        <p className={`mt-2 ${bodyFont}`}
           style={{
             fontSize: mobile ? 17 : 19,
             lineHeight: 1.5,
             color: 'var(--gd-ink-900)',
             ...(meta.script === 'latin' ? { fontVariationSettings: '"opsz" 28' } : {}),
           }}>
          {data.theDifference}
        </p>
      </div>

      {/* 3. Examples (two columns) */}
      <div className="mt-8">
        <Eyebrow>{t('examplesLabel')}</Eyebrow>
        <div className={`mt-3 grid gap-x-10 gap-y-3 ${mobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
          <div>
            {data.examples1.map((ex, i) => (
              <p key={i} className={`${bodyFont} ${i > 0 ? 'mt-3' : ''}`}
                 style={{
                   fontSize: mobile ? 15 : 16,
                   lineHeight: 1.5,
                   color: 'var(--gd-ink-700)',
                   fontStyle: meta.script === 'latin' ? 'italic' : 'normal',
                   ...(meta.script === 'latin' ? { fontVariationSettings: '"opsz" 22' } : {}),
                 }}>
                “{ex}”
              </p>
            ))}
          </div>
          <div>
            {data.examples2.map((ex, i) => (
              <p key={i} className={`${bodyFont} ${i > 0 ? 'mt-3' : ''}`}
                 style={{
                   fontSize: mobile ? 15 : 16,
                   lineHeight: 1.5,
                   color: 'var(--gd-ink-700)',
                   fontStyle: meta.script === 'latin' ? 'italic' : 'normal',
                   ...(meta.script === 'latin' ? { fontVariationSettings: '"opsz" 22' } : {}),
                 }}>
                “{ex}”
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Common mistake (amber card) */}
      <div className="mt-8" style={{
        borderRadius: 14,
        padding: mobile ? '16px 18px' : '20px 22px',
        background: 'oklch(0.97 0.05 80)',
        boxShadow: 'inset 0 0 0 1px oklch(0.85 0.09 75 / 0.55)',
      }}>
        <Eyebrow style={{ color: 'oklch(0.55 0.13 60)' }}>{t('commonMistakeLabel')}</Eyebrow>
        <p className={`mt-1.5 ${bodyFont}`}
           style={{
             fontSize: mobile ? 14.5 : 15.5,
             lineHeight: 1.55,
             color: 'oklch(0.32 0.06 60)',
             ...(meta.script === 'latin' ? { fontVariationSettings: '"opsz" 22' } : {}),
           }}>
          {data.commonMistake}
        </p>
      </div>
    </div>
  );
}

function CompareScreen({ t, locale, mobile = false, rtl = false, state = 'success' }) {
  // state: 'empty' | 'loading' | 'error:not_a_real_word' | 'error:different_languages' | 'error:same_word' | 'success'
  const data = COMPARE_DATA[locale] || COMPARE_DATA.en;
  const meta = LOCALE_META[locale];
  const titleFont = meta.script === 'he' ? 'font-he' : meta.script === 'ar' ? 'font-ar' : 'font-display';

  const isError = state.startsWith('error');
  const errorKey = isError
    ? ({ not_a_real_word: 'errNotARealWord', different_languages: 'errDifferentLanguages', same_word: 'errSameWord' }[state.slice(6)])
    : null;

  // For empty: blank inputs. Loading/error/success: pre-filled with the pair.
  const v1 = state === 'empty' ? '' : data.pair[0];
  const v2 = state === 'empty' ? '' : data.pair[1];

  return (
    <div dir={meta.dir}
         data-screen-label={`07 Compare · ${locale.toUpperCase()} · ${mobile ? 'mobile · ' : ''}${state}`}
         className="gd-stage" style={{ minHeight: '100%' }}>
      <div className="gd-stars" />
      <div className="relative" style={{ zIndex: 1 }}>
        {mobile ? <MobileHeader /> : <MarketingHeader locale={locale} rtl={rtl} />}
        <div style={{ paddingInline: mobile ? 16 : 28, paddingBlockEnd: 60 }}>
          {/* Hero strip */}
          <div style={{ maxWidth: 1080, margin: '0 auto',
                        paddingBlockStart: mobile ? 32 : 64,
                        textAlign: rtl ? 'right' : 'left' }}>
            <Eyebrow style={{ color: 'oklch(0.82 0.1 245)' }}>{t('compareEyebrow')}</Eyebrow>
            <h1 className={titleFont}
                style={{
                  marginTop: 8,
                  fontSize: mobile ? 36 : 56,
                  lineHeight: 1.05,
                  color: 'oklch(0.97 0.008 265)',
                  ...(meta.script === 'latin' ? { fontVariationSettings: '"opsz" 144, "SOFT" 80', fontWeight: 400, letterSpacing: '-0.025em' } : {}),
                }}>
              {t('compareTitle')}
            </h1>
            <p className="mt-4 font-sans-ui"
               style={{ fontSize: mobile ? 15 : 17, lineHeight: 1.55,
                        color: 'oklch(0.72 0.02 265)', maxWidth: 720 }}>
              {t('compareSubtitle')}
            </p>
          </div>

          {/* Inputs */}
          <div style={{ maxWidth: 1080, margin: '0 auto',
                        marginBlockStart: mobile ? 28 : 44 }}>
            <CompareInput t={t} locale={locale} mobile={mobile} rtl={rtl}
                          value1={v1} value2={v2} loading={state === 'loading'} />
          </div>

          {/* Result area */}
          <div style={{ maxWidth: 1080, margin: '0 auto',
                        marginBlockStart: mobile ? 28 : 40 }}>
            {state === 'empty' && <CompareEmpty t={t} locale={locale} rtl={rtl} mobile={mobile} />}
            {state === 'loading' && <CompareEmpty t={t} locale={locale} rtl={rtl} mobile={mobile} />}
            {isError && (
              <div style={{ maxWidth: 720, margin: rtl ? '0 0 0 auto' : '0 auto 0 0' }}>
                <CompareError t={t} locale={locale} rtl={rtl} mobile={mobile} errorKey={errorKey} />
              </div>
            )}
            {state === 'success' && <CompareResult t={t} locale={locale} rtl={rtl} mobile={mobile} data={data} />}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CompareScreen, COMPARE_DATA });
