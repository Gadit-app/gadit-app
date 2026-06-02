/* Screen 11 — Report Modal.
   Multi-select category checkboxes + textarea + submit.
   States: empty / filled / submitting / sent / error.
   Anonymous-OK; centered card on a dimmed navy backdrop. */

const REPORT_CATS = [
  ['incorrectDef',  'reportCatIncorrectDef'],
  ['wrongEty',      'reportCatWrongEty'],
  ['badExample',    'reportCatBadExample'],
  ['kidsIssue',     'reportCatKids'],
  ['idiomIssue',    'reportCatIdiom'],
  ['wrongImage',    'reportCatWrongImage'],
  ['quizWrong',     'reportCatQuizWrong'],
  ['composeIssue',  'reportCatComposeIssue'],
  ['compareIssue',  'reportCatCompareIssue'],
  ['other',         'reportCatOther'],
];

function ReportCheckbox({ label, selected, rtl }) {
  return (
    <button className="font-sans-ui transition-all"
      style={{
        textAlign: rtl ? 'right' : 'left',
        padding: '12px 14px', borderRadius: 12,
        background: selected ? 'oklch(0.72 0.19 245 / 0.08)' : 'oklch(1 0 0 / 0)',
        boxShadow: selected
          ? 'inset 0 0 0 1.5px oklch(0.5 0.18 250), 0 0 0 4px oklch(0.5 0.18 250 / 0.08)'
          : 'inset 0 0 0 1px oklch(0.85 0.005 265)',
        display: 'flex', alignItems: 'center', gap: 10,
        flexDirection: rtl ? 'row-reverse' : 'row',
      }}>
      <span style={{
        width: 18, height: 18, borderRadius: 6, flexShrink: 0,
        background: selected ? 'oklch(0.5 0.18 250)' : 'transparent',
        boxShadow: selected ? 'none' : 'inset 0 0 0 1.5px oklch(0.78 0.005 265)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {selected && (
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6.5l2.5 2.5L9.5 4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </span>
      <span style={{ fontSize: 13.5, color: 'var(--gd-ink-900)', lineHeight: 1.3 }}>{label}</span>
    </button>
  );
}

function ReportModal({ locale, mobile, state = 'empty', selected = [], textValue = '', label }) {
  const t = makeT(locale);
  const meta = LOCALE_META[locale];
  const rtl = meta.dir === 'rtl';
  const titleFont = meta.script === 'he' ? 'font-he' : meta.script === 'ar' ? 'font-ar' : 'font-display';
  const isSent = state === 'sent';
  const isSubmitting = state === 'submitting';
  const hasError = state === 'error';
  const hasSelection = selected.length > 0;

  return (
    <div data-screen-label={label}
         className="gd-stage"
         dir={meta.dir}
         style={{ minHeight: '100%', position: 'relative' }}>
      <div className="gd-stars" />
      {/* dimmed-backdrop ghost of underlying screen */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'oklch(0.1 0.04 265 / 0.65)',
        backdropFilter: 'blur(12px)',
      }}/>
      {/* modal */}
      <div style={{
        position: 'relative', zIndex: 2, minHeight: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: mobile ? '24px 16px' : '60px 40px',
      }}>
        <div className="gd-card relative"
             style={{
               width: '100%', maxWidth: 460,
               padding: mobile ? '28px 24px' : '36px 36px',
             }}>
          {/* close */}
          <button style={{
            position: 'absolute', top: 14, [rtl ? 'left' : 'right']: 14,
            width: 30, height: 30, borderRadius: 999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--gd-ink-500)',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>

          {isSent ? (
            <div style={{ textAlign: 'center', padding: mobile ? '36px 0 16px' : '52px 0 32px' }}>
              <div style={{
                width: 56, height: 56, borderRadius: 999, margin: '0 auto 18px',
                background: 'oklch(0.95 0.04 155)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'inset 0 0 0 1.5px oklch(0.7 0.13 155 / 0.55)',
              }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M7 14.5l4.5 4.5L21 9" stroke="oklch(0.5 0.14 155)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className={titleFont}
                 style={{
                   fontSize: 22, color: 'var(--gd-ink-900)',
                   fontStyle: meta.script === 'latin' ? 'italic' : 'normal',
                   ...(meta.script === 'latin' ? { fontVariationSettings: '"opsz" 32', fontWeight: 400 } : { fontWeight: 600 }),
                 }}>
                {t('reportThanks')}
              </p>
            </div>
          ) : (
            <>
              <Eyebrow style={{ color: 'oklch(0.4 0.14 250)' }}>{t('reportEyebrow')}</Eyebrow>
              <h2 className={titleFont}
                  style={{
                    fontSize: mobile ? 26 : 32, color: 'var(--gd-ink-900)',
                    marginTop: 8, lineHeight: 1.15,
                    fontStyle: meta.script === 'latin' ? 'italic' : 'normal',
                    ...(meta.script === 'latin' ? { fontVariationSettings: '"opsz" 48', fontWeight: 400, letterSpacing: '-0.01em' } : { fontWeight: 600 }),
                  }}>
                {t('reportTitle')}
              </h2>

              {/* Categories */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: mobile ? '1fr' : '1fr 1fr',
                gap: 8,
                marginTop: 24,
              }}>
                {REPORT_CATS.map(([key, lblKey]) => (
                  <ReportCheckbox key={key}
                                  label={t(lblKey)}
                                  selected={selected.includes(key)}
                                  rtl={rtl} />
                ))}
              </div>

              {/* Textarea */}
              <div className="mt-5">
                <label className={`font-sans-ui block mb-2 ${rtl ? 'text-right' : ''}`}
                       style={{ fontSize: 11.5, color: 'var(--gd-ink-500)',
                                letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>
                  {t('reportTellMore')}
                </label>
                <textarea
                  value={textValue} readOnly
                  placeholder={t('reportTellMorePh')}
                  dir={rtl ? 'rtl' : 'ltr'}
                  style={{
                    width: '100%', minHeight: 80, maxHeight: 200,
                    padding: '12px 14px', borderRadius: 12,
                    background: 'oklch(0.98 0.005 265)',
                    boxShadow: 'inset 0 0 0 1px oklch(0.85 0.005 265)',
                    fontFamily: 'inherit', fontSize: 14, lineHeight: 1.5,
                    color: 'var(--gd-ink-900)',
                    resize: 'none', outline: 'none',
                  }}
                />
              </div>

              {hasError && (
                <p className="font-sans-ui mt-3"
                   style={{ fontSize: 12.5, color: 'oklch(0.55 0.18 25)' }}>
                  {t('reportError')}
                </p>
              )}

              {/* Submit */}
              <button
                disabled={!hasSelection || isSubmitting}
                className="font-sans-ui font-medium mt-5 w-full"
                style={{
                  padding: '13px 18px', borderRadius: 12,
                  background: hasSelection
                    ? 'linear-gradient(180deg, oklch(0.78 0.17 245), oklch(0.62 0.2 250))'
                    : 'linear-gradient(180deg, oklch(0.85 0.05 245 / 0.5), oklch(0.7 0.08 250 / 0.5))',
                  color: 'white', fontSize: 14.5,
                  boxShadow: hasSelection
                    ? '0 0 0 1px oklch(0.5 0.2 250 / 0.6), 0 8px 22px oklch(0.5 0.2 250 / 0.4)'
                    : 'none',
                  opacity: hasSelection ? 1 : 0.6,
                  cursor: hasSelection ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                {isSubmitting && (
                  <span style={{
                    width: 14, height: 14, borderRadius: 999,
                    border: '2px solid oklch(1 0 0 / 0.4)',
                    borderTopColor: 'white',
                    animation: 'spin 700ms linear infinite',
                  }}/>
                )}
                {isSubmitting ? t('reportSending') : t('reportSend')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ReportModal });
