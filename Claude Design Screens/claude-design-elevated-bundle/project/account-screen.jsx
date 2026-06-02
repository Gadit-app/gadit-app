/* Screen 10 — Account / Profile.
   Calm, mature. Three sections (Plan, Usage, Account) on a single
   max-720 column. NOT a settings panel — about who you ARE on Gadit. */

// ─── Sample account states ─────────────────────────────────────
const ACCOUNT_STATES = {
  clearTrial: {
    plan: 'clear', email: 'lena.rosenberg@protonmail.com', firstName: 'Lena',
    isTrial: true, trialDaysLeft: 6,
    renewDate: 'Apr 26, 2026', cancelAtPeriodEnd: false,
    images: { used: 23, limit: 30 },
    searches: { used: 127, limit: null },
  },
  free: {
    plan: 'free', email: 'sam@hey.com', firstName: 'Sam',
    isTrial: false,
    images: { used: 0, limit: 0, locked: true },
    searches: { used: 12, limit: 20, daily: true },
  },
  deep: {
    plan: 'deep', email: 'maria.santos@gmail.com', firstName: 'Maria',
    isTrial: false,
    renewDate: 'May 26, 2026', cancelAtPeriodEnd: false,
    images: { used: 47, limit: 100 },
    searches: { used: 412, limit: null },
  },
  noSub: {
    plan: 'free', email: 'a.cohen@walla.co.il', firstName: 'אבי',
    noSubscription: true,
    images: { used: 0, limit: 0, locked: true },
    searches: { used: 3, limit: 20, daily: true },
  },
  clearHe: {
    plan: 'clear', email: 'noa@gmail.com', firstName: 'נעה',
    isTrial: true, trialDaysLeft: 6,
    renewDate: '26.04.2026', cancelAtPeriodEnd: false,
    images: { used: 23, limit: 30 },
    searches: { used: 127, limit: null },
  },
};

// ─── Hairline section header ───────────────────────────────────
function AccountSectionHeader({ children, rtl }) {
  return (
    <div className={`pb-3 mb-5 ${rtl ? 'text-right' : ''}`}
         style={{ borderBottom: '1px solid oklch(0.85 0.005 265)' }}>
      <Eyebrow style={{ color: 'oklch(0.4 0.14 250)' }}>{children}</Eyebrow>
    </div>
  );
}

// ─── Plan section ──────────────────────────────────────────────
function PlanSection({ data, locale, mobile, t }) {
  const meta = LOCALE_META[locale];
  const titleFont = meta.script === 'he' ? 'font-he' : meta.script === 'ar' ? 'font-ar' : 'font-display';
  const rtl = meta.dir === 'rtl';
  const plan = data.plan;

  const tierColor = plan === 'deep'
    ? 'oklch(0.42 0.15 250)'
    : plan === 'clear'
      ? 'oklch(0.5 0.18 250)'
      : 'oklch(0.4 0.02 265)';
  const tierName = plan === 'deep' ? 'Deep' : plan === 'clear' ? 'Clear' : t('onPlanFree');

  return (
    <section style={{ marginBlockEnd: 44 }}>
      <AccountSectionHeader rtl={rtl}>{t('planLabel')}</AccountSectionHeader>

      {data.noSubscription ? (
        // ─── Empty plan state ───
        <div>
          <h2 className={titleFont}
              style={{
                fontSize: mobile ? 36 : 48, color: 'var(--gd-ink-700)',
                fontStyle: meta.script === 'latin' ? 'italic' : 'normal',
                letterSpacing: meta.script === 'latin' ? '-0.02em' : 0, lineHeight: 1.05,
                ...(meta.script === 'latin' ? { fontVariationSettings: '"opsz" 96', fontWeight: 400 } : { fontWeight: 600 }),
              }}>
            {t('noActiveSubscription')}
          </h2>
          <p className="font-sans-ui mt-3" style={{ fontSize: 14.5, color: 'var(--gd-ink-500)', lineHeight: 1.5 }}>
            {t('chooseAPlan')}
          </p>
          <div className={`mt-6 flex gap-3 ${mobile ? 'flex-col' : ''} ${rtl && !mobile ? 'flex-row-reverse' : ''}`}>
            <PrimaryBtn>{t('upgrade')}</PrimaryBtn>
          </div>
        </div>
      ) : (
        <div>
          {/* Trial badge */}
          {data.isTrial && (
            <div className="font-sans-ui inline-flex items-center gap-2 mb-3"
                 style={{
                   fontSize: 11.5, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600,
                   padding: '5px 12px', borderRadius: 999,
                   color: 'oklch(0.45 0.16 250)',
                   background: 'oklch(0.72 0.19 245 / 0.1)',
                   boxShadow: 'inset 0 0 0 1px oklch(0.72 0.19 245 / 0.3)',
                 }}>
              <span className="gd-tier-dot" />
              {t('trialBadge', data.trialDaysLeft)}
            </div>
          )}

          {/* Tier name — italic Fraunces, signature color */}
          <div className={`flex items-baseline gap-3 ${rtl ? 'flex-row-reverse' : ''}`}>
            <h2 className="font-display"
                style={{
                  fontSize: mobile ? 56 : 72,
                  color: tierColor,
                  fontStyle: 'italic',
                  letterSpacing: '-0.025em',
                  lineHeight: 1,
                  fontVariationSettings: '"opsz" 144, "SOFT" 80',
                  fontWeight: 400,
                  textShadow: plan === 'deep' ? '0 0 40px oklch(0.5 0.2 250 / 0.2)' : 'none',
                }}>
              {tierName}
            </h2>
            {plan === 'deep' && (
              <span style={{
                width: 8, height: 8, borderRadius: 999,
                background: 'oklch(0.5 0.18 250)',
                boxShadow: '0 0 0 4px oklch(0.5 0.18 250 / 0.18), 0 0 20px oklch(0.5 0.18 250 / 0.4)',
                marginBlockEnd: 14,
              }}/>
            )}
          </div>

          {/* Renewal */}
          {data.renewDate && (
            <p className={`font-sans-ui mt-3 ${rtl ? 'text-right' : ''}`}
               style={{ fontSize: 14, color: 'var(--gd-ink-500)' }}>
              {data.cancelAtPeriodEnd ? t('cancelsAtPeriodEnd') : t('renewsOn', data.renewDate)}
            </p>
          )}

          {/* CTAs */}
          <div className={`mt-6 flex gap-2 flex-wrap ${rtl ? 'flex-row-reverse' : ''}`}>
            {plan === 'free' ? (
              <>
                <PrimaryBtn>{t('upgrade')}</PrimaryBtn>
                <GhostBtn>{t('changePlan')}</GhostBtn>
              </>
            ) : (
              <>
                <GhostBtn>{t('manageBilling')}</GhostBtn>
                <GhostBtn>{t('changePlan')}</GhostBtn>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Usage section ─────────────────────────────────────────────
function UsageMeter({ label, used, limit, locale, t, locked, daily, rtl }) {
  const isUnlimited = limit === null;
  const pct = locked ? 0 : isUnlimited ? Math.min(100, (used / 500) * 100) : Math.min(100, (used / limit) * 100);
  const nearing = !locked && !isUnlimited && pct > 90;

  const valueText = locked
    ? t('locked')
    : isUnlimited
      ? <><span style={{ color: 'var(--gd-ink-900)' }}>{used}</span> <span style={{ color: 'var(--gd-ink-500)' }}>/ {t('unlimited')}</span></>
      : <><span style={{ color: 'var(--gd-ink-900)' }}>{used}</span> <span style={{ color: 'var(--gd-ink-500)' }}>/ {limit}{daily ? ' ' + t('todaySuffix') : ''}</span></>;

  return (
    <div style={{ marginBlockEnd: 22 }}>
      <div className={`flex items-baseline justify-between mb-2 ${rtl ? 'flex-row-reverse' : ''}`}>
        <span className="font-sans-ui" style={{ fontSize: 14, color: 'var(--gd-ink-700)', fontWeight: 500 }}>{label}</span>
        <span className="font-sans-ui" style={{ fontSize: 14 }}>{valueText}</span>
      </div>
      <div style={{
        height: 6, borderRadius: 999,
        background: 'oklch(0.94 0.005 265)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', insetBlock: 0, insetInlineStart: 0,
          width: locked ? '100%' : `${pct}%`,
          background: locked
            ? 'repeating-linear-gradient(45deg, oklch(0.85 0.005 265), oklch(0.85 0.005 265) 4px, oklch(0.92 0.005 265) 4px, oklch(0.92 0.005 265) 8px)'
            : isUnlimited
              ? 'linear-gradient(90deg, oklch(0.7 0.13 250 / 0.4), oklch(0.7 0.13 250 / 0.7))'
              : nearing
                ? 'linear-gradient(90deg, oklch(0.78 0.15 75), oklch(0.65 0.18 60))'
                : 'linear-gradient(90deg, oklch(0.78 0.17 245), oklch(0.62 0.2 250))',
          transition: 'width 300ms',
        }}/>
      </div>
      {nearing && (
        <p className="font-sans-ui mt-1.5"
           style={{ fontSize: 11.5, color: 'oklch(0.55 0.16 60)' }}>
          {t('nearingLimit')}
        </p>
      )}
    </div>
  );
}

function UsageSection({ data, locale, mobile, t }) {
  const rtl = LOCALE_META[locale].dir === 'rtl';
  return (
    <section style={{ marginBlockEnd: 44 }}>
      <AccountSectionHeader rtl={rtl}>{t('usageThisMonth')}</AccountSectionHeader>
      <UsageMeter
        label={t('imageGeneration')}
        used={data.images.used} limit={data.images.limit}
        locked={data.images.locked}
        locale={locale} t={t} rtl={rtl} />
      <UsageMeter
        label={t('searches')}
        used={data.searches.used} limit={data.searches.limit}
        daily={data.searches.daily}
        locale={locale} t={t} rtl={rtl} />
    </section>
  );
}

// ─── Account section ───────────────────────────────────────────
function AccountInfoSection({ data, locale, mobile, t }) {
  const rtl = LOCALE_META[locale].dir === 'rtl';
  return (
    <section>
      <AccountSectionHeader rtl={rtl}>{t('accountSection')}</AccountSectionHeader>

      <div className={`flex items-baseline justify-between gap-3 mb-5 ${rtl ? 'flex-row-reverse' : ''}`}
           style={{ flexWrap: mobile ? 'wrap' : 'nowrap' }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="font-sans-ui mb-1"
               style={{ fontSize: 11.5, color: 'var(--gd-ink-500)', letterSpacing: '0.06em',
                        textTransform: 'uppercase', fontWeight: 600 }}>
            {t('emailLabel')}
          </div>
          <div className="font-sans-ui"
               style={{ fontSize: 15, color: 'var(--gd-ink-900)', wordBreak: 'break-all' }}>
            {data.email}
          </div>
        </div>
        <a className="font-sans-ui hover:text-[oklch(0.4_0.14_250)] transition-colors"
           style={{ fontSize: 13, color: 'oklch(0.5 0.16 250)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
          {t('changeEmail')}
        </a>
      </div>

      <GhostBtn>{t('signOut')}</GhostBtn>

      {/* Delete — very low prominence, footer-style */}
      <div className={`mt-12 pt-5 ${rtl ? 'text-right' : ''}`}
           style={{ borderTop: '1px dashed oklch(0.88 0.005 265)' }}>
        <a className="font-sans-ui hover:text-[oklch(0.5_0.13_25)] transition-colors"
           style={{ fontSize: 12, color: 'var(--gd-ink-500)', cursor: 'pointer' }}>
          {t('deleteAccount')}
        </a>
      </div>
    </section>
  );
}

// ─── Buttons ───────────────────────────────────────────────────
function PrimaryBtn({ children }) {
  return (
    <button className="font-sans-ui font-medium"
      style={{
        padding: '11px 22px', borderRadius: 12,
        background: 'linear-gradient(180deg, oklch(0.78 0.17 245), oklch(0.62 0.2 250))',
        color: 'white', fontSize: 14,
        boxShadow: '0 0 0 1px oklch(0.5 0.2 250 / 0.6), 0 8px 22px oklch(0.5 0.2 250 / 0.4)',
      }}>
      {children}
    </button>
  );
}
function GhostBtn({ children }) {
  return (
    <button className="font-sans-ui"
      style={{
        padding: '11px 18px', borderRadius: 12,
        background: 'transparent', color: 'var(--gd-ink-900)',
        fontSize: 14, fontWeight: 500,
        boxShadow: 'inset 0 0 0 1px oklch(0.85 0.005 265)',
      }}>
      {children}
    </button>
  );
}

// ─── Hero strip ────────────────────────────────────────────────
function AccountHero({ data, locale, mobile, t }) {
  const meta = LOCALE_META[locale];
  const titleFont = meta.script === 'he' ? 'font-he' : meta.script === 'ar' ? 'font-ar' : 'font-display';
  const rtl = meta.dir === 'rtl';
  const initials = (data.firstName || data.email[0]).slice(0, 1).toUpperCase();

  return (
    <div style={{ marginBlockEnd: mobile ? 36 : 56, textAlign: rtl ? 'right' : 'left' }}>
      <Eyebrow style={{ color: 'oklch(0.85 0.05 245)' }}>{t('accountEyebrow')}</Eyebrow>
      <h1 className={titleFont}
          style={{
            fontSize: mobile ? 38 : 60, color: 'oklch(0.97 0.008 265)',
            marginTop: 12, lineHeight: 1.05,
            ...(meta.script === 'latin' ? { fontVariationSettings: '"opsz" 144, "SOFT" 80', fontWeight: 400, letterSpacing: '-0.025em' } : { fontWeight: 600 }),
          }}>
        {data.firstName ? t('namedSpace', data.firstName) : t('yourSpace')}
      </h1>
      <div className={`mt-5 flex items-center gap-3 ${rtl ? 'flex-row-reverse' : ''}`}>
        <div style={{
          width: 32, height: 32, borderRadius: 999,
          background: 'linear-gradient(135deg, oklch(0.55 0.18 250), oklch(0.42 0.15 260))',
          color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 600, fontFamily: 'Geist, system-ui, sans-serif',
          boxShadow: 'inset 0 0 0 1px oklch(1 0 0 / 0.15)',
        }}>{initials}</div>
        <span className="font-sans-ui" style={{ fontSize: 14, color: 'oklch(0.7 0.02 265)' }}>
          {data.email}
        </span>
      </div>
    </div>
  );
}

// ─── Frame ─────────────────────────────────────────────────────
function AccountScreen({ data, locale, mobile, label }) {
  const t = makeT(locale);
  const meta = LOCALE_META[locale];

  return (
    <div data-screen-label={label}
         className="gd-stage"
         dir={meta.dir}
         style={{ minHeight: '100%' }}>
      <div className="gd-stars" />
      <div className="relative" style={{ zIndex: 1 }}>
        {mobile ? <MobileHeader /> : <MarketingHeader locale={locale} rtl={meta.dir === 'rtl'} signedIn={data} />}
      </div>

      {/* Body — light card on navy */}
      <div className="relative" style={{ zIndex: 1, padding: mobile ? '36px 16px 64px' : '72px 40px 90px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <AccountHero data={data} locale={locale} mobile={mobile} t={t} />

          <div className="gd-card" style={{ padding: mobile ? '28px 24px' : '44px 48px' }}>
            <PlanSection data={data} locale={locale} mobile={mobile} t={t} />
            <UsageSection data={data} locale={locale} mobile={mobile} t={t} />
            <AccountInfoSection data={data} locale={locale} mobile={mobile} t={t} />
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ACCOUNT_STATES, AccountScreen });
