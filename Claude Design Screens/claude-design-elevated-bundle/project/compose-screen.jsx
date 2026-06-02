/* Screen 5 — Compose Your Own Sentence.
   Clear+ feature. Centered modal on desktop, full inline page on mobile.
   Auto-grow modal (no fixed height). Single scroll context on tiny viewports.
   Warm/teacherly feedback tone, precise.
*/

// ─── Indicator row (Grammar / Word usage) ──────────────────────
function FeedbackIndicator({ label, ok, body, rtl, mobile, locale }) {
  const meta = LOCALE_META[locale];
  const bodyFont = meta.script === 'he' ? 'font-he rtl-body' : meta.script === 'ar' ? 'font-ar rtl-body' : 'font-display';
  return (
    <div className="flex items-start gap-3" style={{ flex: 1 }}>
      <div
        aria-hidden="true"
        style={{
          width: 22, height: 22, borderRadius: 999, flexShrink: 0,
          marginTop: 2,
          background: ok
            ? 'oklch(0.78 0.13 150 / 0.18)'
            : 'oklch(0.78 0.16 35 / 0.16)',
          color: ok ? 'oklch(0.55 0.18 150)' : 'oklch(0.58 0.2 35)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: ok
            ? 'inset 0 0 0 1px oklch(0.55 0.18 150 / 0.4)'
            : 'inset 0 0 0 1px oklch(0.58 0.2 35 / 0.4)',
        }}>
        {ok ? (
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6.5l2.5 2.5L9.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
            <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <div className="font-sans-ui"
             style={{ fontSize: 11.5, color: 'var(--gd-ink-500)',
                      letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
          {label}
        </div>
        <p className={`mt-1 ${bodyFont}`}
           style={{
             fontSize: mobile ? 14.5 : 15.5, lineHeight: 1.5,
             color: 'var(--gd-ink-900)',
             ...(meta.script === 'latin' ? { fontVariationSettings: '"opsz" 22' } : {}),
           }}>
          {body}
        </p>
      </div>
    </div>
  );
}

// ─── Result card (appears below textarea, never replaces) ──────
function ComposeResult({ t, locale, rtl, mobile, scenario }) {
  const meta = LOCALE_META[locale];

  // Per-scenario, per-locale teacher copy.
  const COPY = {
    en: {
      mixed: {
        grammar: { ok: true,  body: "Reads naturally — your tense and clause structure are solid." },
        usage:   { ok: false, body: '"dream" usually takes a possessive in this kind of clause ("her dream", "a dream of mine"). Without one, the sentence feels incomplete.' },
        rewrite: 'I had a strange dream of mine last night about flying over a forest of glass.',
        explain: 'Possessives anchor the dream to a dreamer, which English wants for narrative phrasing like this.',
      },
      success: {
        grammar: { ok: true, body: "Reads naturally — your tense and rhythm work." },
        usage:   { ok: true, body: '"dream" lands well here. The possessive "her" anchors it firmly to the speaker.' },
      },
    },
    he: {
      mixed: {
        grammar: { ok: true,  body: 'נשמע טבעי — הזמן הדקדוקי ומבנה המשפט יציבים.' },
        usage:   { ok: false, body: '"חלום" בעברית מבקש בדרך־כלל יחס שייכות בהקשר כזה ("חלום שלה", "חלום שלי"). בלעדיו המשפט מרגיש חסר.' },
        rewrite: 'אתמול בלילה היה לי חלום מוזר על מעוף מעל יער של זכוכית.',
        explain: 'יחס שייכות מקשר את החלום אל החולם — מה שעברית רוצה לפסקה נרטיבית.',
      },
      success: {
        grammar: { ok: true, body: 'נשמע טבעי — זמן ומקצב עובדים.' },
        usage:   { ok: true, body: '"חלום" משתבץ יפה. השייכות מעגנת אותו לדובר.' },
      },
    },
    ar: {
      mixed: {
        grammar: { ok: true,  body: 'يبدو طبيعيًّا — الأزمنة وبنية الجمل سليمة.' },
        usage:   { ok: false, body: 'كلمة "حُلم" تأخذ عادة ضميرًا يربطها بالحالم في هذا النوع من الجمل ("حُلمها"، "حُلمي"). من دون ذلك تبدو الجملة ناقصة.' },
        rewrite: 'رأيتُ حُلمًا غريبًا لي الليلةَ الماضية أطير فيه فوق غابة من زجاج.',
        explain: 'الضمير يربط الحُلم بصاحبه، وهو ما تتطلَّبه العربية في صياغة سرديَّة كهذه.',
      },
      success: {
        grammar: { ok: true, body: 'يبدو طبيعيًّا — الأزمنة والإيقاع متماسكان.' },
        usage:   { ok: true, body: '"حُلم" يستقرّ جيدًا هنا. الضمير "ها" يربطه بالشخصية.' },
      },
    },
  };
  const copy = (COPY[locale] || COPY.en)[scenario];
  if (!copy) return null;

  const rewriteFont = meta.script === 'he' ? 'font-he' : meta.script === 'ar' ? 'font-ar' : 'font-display';

  return (
    <div
      className="mt-5"
      style={{
        background: 'oklch(0.97 0.012 80 / 0.7)',
        borderRadius: 16,
        padding: mobile ? '20px 18px' : '22px 24px',
        boxShadow: 'inset 0 0 0 1px oklch(0 0 0 / 0.06)',
      }}>
      {/* Two indicator rows */}
      <div className={`flex ${mobile ? 'flex-col gap-4' : 'gap-6'}`}>
        <FeedbackIndicator label={t('grammarLabel')} ok={copy.grammar.ok}
                           body={copy.grammar.body} rtl={rtl} mobile={mobile} locale={locale} />
        <FeedbackIndicator label={t('usageLabel')} ok={copy.usage.ok}
                           body={copy.usage.body} rtl={rtl} mobile={mobile} locale={locale} />
      </div>

      {/* Suggested rewrite (only when there's one) */}
      {copy.rewrite && (
        <div className="mt-5 pt-5"
             style={{ borderTop: '1px dashed oklch(0 0 0 / 0.1)' }}>
          <div className="font-sans-ui"
               style={{ fontSize: 11.5, color: 'var(--gd-ink-500)',
                        letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
            {t('suggestedRewrite')}
          </div>
          <blockquote className={`mt-2 ${rewriteFont}`}
            style={{
              fontSize: mobile ? 17 : 19, lineHeight: 1.45,
              color: 'var(--gd-ink-900)',
              fontStyle: meta.script === 'latin' ? 'italic' : 'normal',
              borderInlineStart: '3px solid oklch(0.72 0.19 245 / 0.7)',
              paddingInlineStart: 14,
              ...(meta.script === 'latin' ? { fontVariationSettings: '"opsz" 32' } : {}),
            }}>
            {copy.rewrite}
          </blockquote>
          {copy.explain && (
            <p className="mt-3 font-sans-ui"
               style={{ fontSize: 13, color: 'var(--gd-ink-500)', lineHeight: 1.55 }}>
              {copy.explain}
            </p>
          )}
        </div>
      )}

      {/* Action row */}
      <div className={`mt-6 flex items-center gap-3 ${rtl ? 'flex-row-reverse' : ''}`}>
        <button className="font-sans-ui font-medium"
          style={{
            fontSize: 13, padding: '10px 16px', borderRadius: 10,
            color: 'white',
            background: 'linear-gradient(180deg, oklch(0.78 0.17 245), oklch(0.62 0.2 250))',
            boxShadow: '0 0 0 1px oklch(0.5 0.2 250 / 0.5), 0 6px 16px oklch(0.5 0.2 250 / 0.3)',
          }}>
          {t('tryAnother')}
        </button>
        <button className="font-sans-ui"
          style={{
            fontSize: 13, padding: '10px 16px', borderRadius: 10,
            color: 'var(--gd-ink-700)',
            background: 'oklch(0 0 0 / 0.04)',
            boxShadow: 'inset 0 0 0 1px oklch(0 0 0 / 0.08)',
          }}>
          {t('backToWord')}
        </button>
      </div>
    </div>
  );
}

// ─── The compose modal/page ────────────────────────────────────
function ComposeModal({
  t, locale, mobile = false, rtl = false,
  word = 'dream',
  state = 'empty',           // 'empty' | 'typing' | 'loading' | 'success' | 'mixed' | 'tooShort'
  draft = '',
}) {
  const meta = LOCALE_META[locale];
  const titleFont = meta.script === 'he' ? 'font-he' : meta.script === 'ar' ? 'font-ar' : 'font-display';
  const wordFont = titleFont;

  const isLoading = state === 'loading';
  const showResult = state === 'mixed' || state === 'success';
  const showError  = state === 'tooShort';

  return (
    <div
      role="dialog" aria-modal="true"
      style={{
        width: mobile ? '100%' : 'min(620px, calc(100vw - 64px))',
        maxWidth: '100%', margin: '0 auto',
      }}>
      <div className="gd-card relative"
           style={{
             padding: mobile ? '24px 22px 26px' : '32px 36px 30px',
             textAlign: rtl ? 'right' : 'left',
           }}>
        {/* close X */}
        <button
          aria-label={t('closeLabel')}
          style={{
            position: 'absolute', insetBlockStart: 14, insetInlineEnd: 14,
            width: 30, height: 30, borderRadius: 999,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--gd-ink-500)', background: 'transparent',
          }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </button>

        {/* eyebrow */}
        <Eyebrow style={{ color: 'oklch(0.5 0.18 250)' }}>{t('composeEyebrow')}</Eyebrow>

        {/* title with word */}
        <h2 className={`mt-2 ${titleFont}`}
            style={{
              fontSize: mobile ? 22 : 28, lineHeight: 1.25,
              color: 'var(--gd-ink-900)',
              ...(meta.script === 'latin' ? { fontVariationSettings: '"opsz" 36', fontWeight: 400, letterSpacing: '-0.01em' } : {}),
            }}>
          {(() => {
            const titleEl = t('composeTitle', word);
            // Re-cast the <em> for proper script font
            return React.cloneElement(titleEl, {
              children: React.Children.map(titleEl.props.children, (c) =>
                typeof c === 'string' ? c
                  : React.cloneElement(c, {
                      className: wordFont,
                      style: {
                        ...(meta.script === 'latin' ? { fontStyle: 'italic', fontVariationSettings: '"opsz" 60' } : {}),
                        color: 'oklch(0.5 0.18 250)',
                        fontStyle: meta.script === 'latin' ? 'italic' : 'normal',
                      },
                    }),
              ),
            });
          })()}
        </h2>

        {/* subtitle */}
        <p className="mt-2 font-sans-ui"
           style={{ fontSize: mobile ? 13.5 : 14.5, lineHeight: 1.5, color: 'var(--gd-ink-500)' }}>
          {t('composeSubtitle')}
        </p>

        {/* textarea */}
        <div className="mt-5 relative">
          <textarea
            dir={rtl ? 'rtl' : 'ltr'}
            disabled={isLoading}
            defaultValue={draft}
            placeholder={t('composePlaceholder')}
            className={`w-full font-sans-ui outline-none ${meta.script === 'latin' ? 'font-display' : meta.script === 'he' ? 'font-he' : 'font-ar'}`}
            style={{
              background: 'oklch(0 0 0 / 0.025)',
              color: 'var(--gd-ink-900)',
              fontSize: mobile ? 16 : 17,
              lineHeight: 1.55,
              padding: '14px 16px',
              borderRadius: 12,
              minHeight: mobile ? 110 : 130,
              resize: 'vertical',
              boxShadow: showError
                ? 'inset 0 0 0 1.5px oklch(0.55 0.18 28 / 0.6)'
                : 'inset 0 0 0 1px oklch(0 0 0 / 0.12)',
              opacity: isLoading ? 0.7 : 1,
              ...(meta.script === 'latin' ? { fontVariationSettings: '"opsz" 22' } : {}),
            }}
          />
          {/* char count, only when draft >100 */}
          {draft.length > 100 && !showResult && (
            <div className="absolute font-sans-ui"
                 style={{
                   insetBlockEnd: 8, insetInlineEnd: 12,
                   fontSize: 11, color: 'var(--gd-ink-400)',
                 }}>
              {t('charCount', draft.length)}
            </div>
          )}
        </div>

        {/* error */}
        {showError && (
          <div className="mt-2 font-sans-ui"
               style={{ fontSize: 13, color: 'oklch(0.55 0.18 28)', lineHeight: 1.4 }}>
            {t('errTooShort')}
          </div>
        )}

        {/* submit */}
        <div className={`mt-5 flex items-center ${rtl ? 'justify-start' : 'justify-end'}`}>
          <button
            className="font-sans-ui font-medium inline-flex items-center justify-center gap-2"
            disabled={isLoading}
            style={{
              fontSize: 14, padding: '12px 22px', borderRadius: 12,
              background: isLoading
                ? 'linear-gradient(180deg, oklch(0.62 0.1 245), oklch(0.5 0.12 250))'
                : 'linear-gradient(180deg, oklch(0.78 0.17 245), oklch(0.62 0.2 250))',
              color: 'white',
              boxShadow: '0 0 0 1px oklch(0.5 0.2 250 / 0.6), 0 8px 22px oklch(0.5 0.2 250 / 0.4)',
              opacity: isLoading ? 0.85 : 1,
            }}>
            {isLoading && (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ animation: 'gd-spin 0.7s linear infinite' }}>
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5"/>
                <path d="M12 7a5 5 0 0 0-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            )}
            {isLoading ? t('checking') : t('checkSentence')}
          </button>
        </div>

        {/* result card */}
        {showResult && (
          <ComposeResult
            t={t} locale={locale} rtl={rtl} mobile={mobile}
            scenario={state === 'mixed' ? 'mixed' : 'success'} />
        )}
      </div>
    </div>
  );
}

// ─── Scene: modal over the result page (desktop) / full page (mobile) ──
function ComposeScene({
  t, locale, mobile = false, rtl = false, modalProps = {},
}) {
  if (mobile) {
    // Full inline page on mobile
    return (
      <div className="gd-stage relative" style={{ minHeight: 720, overflow: 'hidden' }}>
        <div className="gd-stars" />
        <div className="relative" style={{ zIndex: 2 }}>
          <MobileHeader />
          <div style={{ paddingInline: 16, paddingBlockStart: 18, paddingBlockEnd: 30 }}>
            <ComposeModal t={t} locale={locale} mobile rtl={rtl} {...modalProps} />
          </div>
        </div>
      </div>
    );
  }

  // Desktop: backdrop-blur over a faint result page
  return (
    <div className="gd-stage relative" style={{ minHeight: 900, overflow: 'hidden' }}>
      <div className="gd-stars" />
      {/* Ghosted result behind */}
      <div className="absolute inset-0" style={{ zIndex: 1, opacity: 0.45 }}>
        <BehindResult locale={locale} rtl={rtl} />
      </div>
      <div className="absolute inset-0" style={{
        zIndex: 2,
        background: 'oklch(0.12 0.04 265 / 0.55)',
        backdropFilter: 'blur(14px)',
      }}/>
      <div className="relative flex items-start justify-center"
           style={{ zIndex: 3, minHeight: 900, padding: '60px 32px' }}>
        <ComposeModal t={t} locale={locale} rtl={rtl} {...modalProps} />
      </div>
    </div>
  );
}

// Lightweight ghost of a result page — atmospheric only
function BehindResult({ locale, rtl }) {
  const meta = LOCALE_META[locale];
  const word = locale === 'he' ? 'חלום' : locale === 'ar' ? 'حُلم' : 'dream';
  const titleFont = meta.script === 'he' ? 'font-he' : meta.script === 'ar' ? 'font-ar' : 'font-display';
  return (
    <div dir={meta.dir}>
      <DarkHeader lang={meta.label} />
      <div style={{ paddingInline: 28, paddingBlockStart: 60 }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', textAlign: rtl ? 'right' : 'left' }}>
          <h1 className={titleFont}
              style={{
                fontSize: 110, lineHeight: 1, color: 'oklch(0.97 0.008 265)',
                ...(meta.script === 'latin' ? { fontVariationSettings: '"opsz" 144', letterSpacing: '-0.025em' } : {}),
              }}>
            {word}
          </h1>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ComposeModal, ComposeScene, ComposeResult });
