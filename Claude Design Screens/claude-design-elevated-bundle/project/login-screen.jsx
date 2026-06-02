/* Screen 4 — Login Modal.
   Centered card over backdrop blur. Empty + error states.
   Reuses gd-card surface + i18n.
*/

// ─── Google "G" mark ───────────────────────────────────────────
function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.61z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.92-2.26c-.8.54-1.83.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34A9 9 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.97 10.71A5.41 5.41 0 0 1 3.68 9c0-.59.1-1.17.29-1.71V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.34z"/>
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 9 0 9 9 0 0 0 .96 4.95l3.01 2.34C4.68 5.17 6.66 3.58 9 3.58z"/>
    </svg>
  );
}

// ─── Eye / Eye-off (show/hide password) ────────────────────────
function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M1 9s2.7-5 8-5 8 5 8 5-2.7 5-8 5-8-5-8-5z" stroke="currentColor" strokeWidth="1.4"/>
      <circle cx="9" cy="9" r="2.2" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M2 9s2.7-5 8-5c1.5 0 2.8.4 3.9 1M16 9s-2.7 5-8 5c-1.5 0-2.8-.4-3.9-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M2 16 16 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

// ─── The modal itself ──────────────────────────────────────────
function LoginModal({
  t, locale, mobile = false, rtl = false,
  mode = 'signin',           // 'signin' | 'signup'
  reasonKey = 'reasonHomepage',
  state = 'empty',           // 'empty' | 'error' | 'loading'
  errorKey = 'errWrongCreds',
  prefilledEmail = '',
}) {
  const meta = LOCALE_META[locale];
  const titleFont = meta.script === 'he' ? 'font-he' : meta.script === 'ar' ? 'font-ar' : 'font-display';

  const titleKey = mode === 'signup' ? 'createYourAccount' : 'welcomeBack';
  const submitKey = state === 'loading'
    ? (mode === 'signup' ? 'signingUp' : 'signingIn')
    : (mode === 'signup' ? 'signUp' : 'signIn');
  const toggleKey = mode === 'signup' ? 'haveAccountSignIn' : 'noAccountSignUp';

  const reasonLine = t(reasonKey);
  const passwordVisible = state === 'empty' && false; // visual default

  return (
    <div
      role="dialog" aria-modal="true"
      style={{
        width: mobile ? '100%' : 440,
        maxWidth: '100%',
        margin: '0 auto',
      }}
    >
      <div className="gd-card relative" style={{
        padding: mobile ? '24px 22px 26px' : '32px 36px 34px',
        textAlign: rtl ? 'right' : 'left',
      }}>
        {/* close X */}
        <button
          aria-label={t('closeLabel')}
          style={{
            position: 'absolute', insetBlockStart: 14,
            insetInlineEnd: 14,
            width: 30, height: 30, borderRadius: 999,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--gd-ink-500)',
            background: 'transparent',
          }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </button>

        {/* wordmark */}
        <div className="mb-3">
          <Wordmark />
        </div>

        {/* title */}
        <div className={titleFont}
             style={{
               fontSize: mobile ? 24 : 28, lineHeight: 1.18,
               color: 'var(--gd-ink-900)',
               ...(meta.script === 'latin' ? { fontVariationSettings: '"opsz" 36', fontStyle: 'italic', fontWeight: 400, letterSpacing: '-0.015em' } : {}),
             }}>
          {t(titleKey)}
        </div>

        {/* reason line */}
        <p className="mt-1.5 font-sans-ui"
           style={{ fontSize: 13.5, color: 'var(--gd-ink-500)', lineHeight: 1.5 }}>
          {reasonLine}
        </p>

        {/* Google button */}
        <button
          className="mt-6 w-full font-sans-ui font-medium inline-flex items-center justify-center gap-2.5"
          style={{
            background: 'white',
            color: 'var(--gd-ink-900)',
            fontSize: 14, padding: '12px 14px',
            borderRadius: 12,
            boxShadow: 'inset 0 0 0 1px oklch(0 0 0 / 0.12), 0 1px 0 oklch(0 0 0 / 0.04)',
          }}>
          <GoogleG />
          <span>{t('continueWithGoogle')}</span>
        </button>

        {/* "or" separator */}
        <div className="my-5 flex items-center gap-3">
          <div className="flex-1" style={{ height: 1, background: 'oklch(0 0 0 / 0.1)' }} />
          <span className="font-sans-ui" style={{ fontSize: 11.5, color: 'var(--gd-ink-400)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {t('orSep')}
          </span>
          <div className="flex-1" style={{ height: 1, background: 'oklch(0 0 0 / 0.1)' }} />
        </div>

        {/* inline error */}
        {state === 'error' && (
          <div className="font-sans-ui mb-3"
               style={{ fontSize: 13, color: 'oklch(0.55 0.18 28)', lineHeight: 1.4 }}>
            {t(errorKey)}
          </div>
        )}

        {/* email */}
        <label className="block">
          <div className="font-sans-ui mb-1.5"
               style={{ fontSize: 11.5, color: 'var(--gd-ink-500)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
            {t('emailLabel')}
          </div>
          <input
            type="email"
            defaultValue={prefilledEmail}
            dir={rtl ? 'rtl' : 'ltr'}
            placeholder={meta.script === 'he' ? 'name@example.com' : meta.script === 'ar' ? 'name@example.com' : 'name@example.com'}
            className="w-full font-sans-ui outline-none"
            style={{
              background: 'oklch(0 0 0 / 0.025)',
              color: 'var(--gd-ink-900)',
              fontSize: 14.5, padding: '11px 14px',
              borderRadius: 10,
              boxShadow: state === 'error'
                ? 'inset 0 0 0 1.5px oklch(0.55 0.18 28 / 0.6)'
                : 'inset 0 0 0 1px oklch(0 0 0 / 0.12)',
            }}
          />
        </label>

        {/* password */}
        <label className="block mt-3">
          <div className="font-sans-ui mb-1.5"
               style={{ fontSize: 11.5, color: 'var(--gd-ink-500)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
            {t('passwordLabel')}
          </div>
          <div className="relative">
            <input
              type={passwordVisible ? 'text' : 'password'}
              dir="ltr"
              defaultValue={state === 'error' ? '••••••••' : ''}
              className="w-full font-sans-ui outline-none"
              style={{
                background: 'oklch(0 0 0 / 0.025)',
                color: 'var(--gd-ink-900)',
                fontSize: 14.5, padding: rtl ? '11px 14px 11px 40px' : '11px 40px 11px 14px',
                borderRadius: 10,
                boxShadow: state === 'error'
                  ? 'inset 0 0 0 1.5px oklch(0.55 0.18 28 / 0.6)'
                  : 'inset 0 0 0 1px oklch(0 0 0 / 0.12)',
                letterSpacing: passwordVisible ? 'normal' : '0.1em',
              }}
            />
            <button
              type="button"
              aria-label={passwordVisible ? t('hidePassword') : t('showPassword')}
              style={{
                position: 'absolute',
                insetBlockStart: '50%', transform: 'translateY(-50%)',
                insetInlineEnd: 10,
                width: 28, height: 28, borderRadius: 6,
                color: 'var(--gd-ink-400)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: 'transparent',
              }}>
              <EyeIcon open={passwordVisible} />
            </button>
          </div>
        </label>

        {/* submit */}
        <button
          className="mt-5 w-full font-sans-ui font-medium inline-flex items-center justify-center gap-2"
          disabled={state === 'loading'}
          style={{
            fontSize: 14.5, padding: '13px 18px',
            borderRadius: 12,
            background: state === 'loading'
              ? 'linear-gradient(180deg, oklch(0.62 0.1 245), oklch(0.5 0.12 250))'
              : 'linear-gradient(180deg, oklch(0.78 0.17 245), oklch(0.62 0.2 250))',
            color: 'white',
            boxShadow: '0 0 0 1px oklch(0.5 0.2 250 / 0.6), 0 8px 22px oklch(0.5 0.2 250 / 0.4)',
            opacity: state === 'loading' ? 0.85 : 1,
          }}>
          {state === 'loading' && (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ animation: 'gd-spin 0.7s linear infinite' }}>
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5" />
              <path d="M12 7a5 5 0 0 0-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          )}
          {t(submitKey)}
        </button>

        {/* mode toggle */}
        <div className="mt-4 text-center font-sans-ui"
             style={{ fontSize: 13, color: 'var(--gd-ink-500)' }}>
          <a style={{ color: 'oklch(0.5 0.18 250)', cursor: 'pointer' }}>
            {t(toggleKey)}
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Modal staged over a backdrop (with ghosted Screen 1/Homepage behind) ──
function ModalScene({
  t, locale, mobile = false, rtl = false,
  modalProps = {}, behind = 'home',
}) {
  return (
    <div className="gd-stage relative" style={{ minHeight: mobile ? 720 : 820, overflow: 'hidden' }}>
      <div className="gd-stars" />
      {/* Ghosted background — implied surface */}
      <div className="absolute inset-0" style={{ zIndex: 1, opacity: 0.5 }}>
        {behind === 'home' ? <BehindHome locale={locale} mobile={mobile} rtl={rtl} /> : null}
      </div>
      {/* Heavy backdrop blur scrim */}
      <div className="absolute inset-0" style={{
        zIndex: 2,
        background: 'oklch(0.12 0.04 265 / 0.55)',
        backdropFilter: 'blur(14px)',
      }} />
      {/* The modal, vertically centered */}
      <div className="relative flex items-center justify-center"
           style={{ zIndex: 3, minHeight: mobile ? 720 : 820, padding: mobile ? '0 16px' : 32 }}>
        <LoginModal t={t} locale={locale} mobile={mobile} rtl={rtl} {...modalProps} />
      </div>
    </div>
  );
}

// Lightweight ghost of the homepage hero — purely atmospheric.
function BehindHome({ locale, mobile, rtl }) {
  const meta = LOCALE_META[locale];
  const head = locale === 'he' ? { l1: 'להבין', l2: 'יותר.' }
    : locale === 'ar' ? { l1: 'افهم', l2: 'أكثر.' }
    : { l1: 'Understand', l2: 'more.' };
  return (
    <div dir={meta.dir}>
      {mobile ? <MobileHeader /> : <MarketingHeader locale={locale} rtl={rtl} />}
      <div style={{ paddingInline: mobile ? 16 : 28, paddingBlockStart: mobile ? 56 : 120 }}>
        <div style={{ maxWidth: 920, margin: '0 auto', textAlign: rtl ? 'right' : 'left' }}>
          <h1 className={meta.script === 'latin' ? 'font-display' : meta.script === 'he' ? 'font-he' : 'font-ar'}
              style={{
                fontSize: mobile ? 48 : 96, lineHeight: 1.02,
                color: 'oklch(0.97 0.008 265)',
                ...(meta.script === 'latin' ? { fontVariationSettings: '"opsz" 144', fontWeight: 400, letterSpacing: '-0.025em' } : {}),
              }}>
            <span style={{ display: 'block' }}>{head.l1}</span>
            <span style={{ display: 'block', color: 'oklch(0.82 0.1 245)', fontStyle: meta.script === 'latin' ? 'italic' : 'normal' }}>{head.l2}</span>
          </h1>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LoginModal, ModalScene });
