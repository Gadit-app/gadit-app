/* Gadit — shared primitives used across all screens.
   Exports components to window so they're accessible from other
   <script type="text/babel"> blocks.
*/
const { useState, useEffect, useRef } = React;

// ─── Logo mark ─────────────────────────────────────────────────
// Echoes the icon: white G inside electric-blue ring. Small scale.
function GaditMark({ size = 28 }) {
  const s = size;
  return (
    <div
      style={{
        width: s, height: s, borderRadius: 999,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 50%, oklch(0.22 0.08 260) 0%, oklch(0.13 0.05 265) 100%)',
        boxShadow:
          'inset 0 0 0 1.2px oklch(0.72 0.19 245), ' +
          '0 0 0 1px oklch(0.72 0.19 245 / 0.25), ' +
          '0 0 10px oklch(0.72 0.19 245 / 0.5)',
        color: 'white', fontFamily: 'Fraunces, serif', fontWeight: 500,
        fontSize: s * 0.52, lineHeight: 1, letterSpacing: '-0.02em',
      }}
    >
      <span style={{ transform: 'translateY(-1px)' }}>G</span>
    </div>
  );
}

function Wordmark() {
  return (
    <div className="flex items-center gap-2.5">
      <GaditMark size={26} />
      <span className="font-display text-[22px] tracking-tight" style={{ fontWeight: 500 }}>
        Gadit
      </span>
    </div>
  );
}

// ─── Top header (dark) ─────────────────────────────────────────
function DarkHeader({ lang = 'English', compact = false }) {
  const items = compact
    ? ['Search', 'Notebook', 'Pricing']
    : ['Search', 'How it works', 'Compare', 'Notebook', 'Pricing'];
  return (
    <header className="w-full flex items-center justify-between px-8 py-5"
      style={{ borderBottom: '1px solid oklch(1 0 0 / 0.06)' }}>
      <Wordmark />
      <nav className="flex items-center gap-7 font-sans-ui text-[13.5px]"
           style={{ color: 'oklch(0.78 0.008 265)' }}>
        {items.map((i) => (
          <a key={i} href="#" className="hover:text-white transition-colors">{i}</a>
        ))}
      </nav>
      <div className="flex items-center gap-4 font-sans-ui text-[13px]"
           style={{ color: 'oklch(0.78 0.008 265)' }}>
        <button className="flex items-center gap-1.5 hover:text-white transition-colors">
          <span style={{ opacity: 0.7 }}>◐</span>
          <span>{lang}</span>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2.5 4l2.5 2.5L7.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </button>
        <div className="w-8 h-8 rounded-full"
             style={{
               background: 'linear-gradient(135deg, oklch(0.7 0.08 45), oklch(0.55 0.12 30))',
               boxShadow: '0 0 0 1px oklch(1 0 0 / 0.08)'
             }} />
      </div>
    </header>
  );
}

function MobileHeader() {
  return (
    <header className="w-full flex items-center justify-between px-5 py-4"
      style={{ borderBottom: '1px solid oklch(1 0 0 / 0.06)' }}>
      <Wordmark />
      <div className="flex items-center gap-3">
        <button style={{ color: 'oklch(0.78 0.008 265)' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 6h12M4 10h12M4 14h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </header>
  );
}

// ─── Persistent search bar (lives on dark canvas) ──────────────
function SearchBar({ value = 'dream', placeholder, contextHint = true, compact = false, rtl = false }) {
  return (
    <div className="w-full">
      <div
        className="flex items-center gap-3 rounded-2xl"
        style={{
          background: 'oklch(1 0 0 / 0.05)',
          border: '1px solid oklch(1 0 0 / 0.08)',
          padding: compact ? '10px 14px' : '14px 18px',
          backdropFilter: 'blur(14px)',
          boxShadow: '0 1px 0 oklch(1 0 0 / 0.04) inset',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ color: 'oklch(0.78 0.008 265)', flexShrink: 0 }}>
          <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.4" />
          <path d="m13.5 13.5 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <input
          className="flex-1 bg-transparent outline-none font-sans-ui text-[16px]"
          style={{ color: 'white' }}
          defaultValue={value}
          dir={rtl ? 'rtl' : 'ltr'}
          placeholder={placeholder}
        />
        <button className="font-sans-ui text-[12px] flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{ color: 'oklch(0.85 0.05 245)', background: 'oklch(0.72 0.19 245 / 0.14)' }}>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          {rtl ? 'הוסף הקשר' : 'Add context'}
        </button>
        <button
          className="font-sans-ui text-[13.5px] font-medium rounded-xl"
          style={{
            padding: '9px 18px',
            background: 'linear-gradient(180deg, oklch(0.78 0.17 245), oklch(0.62 0.2 250))',
            color: 'white',
            boxShadow: '0 0 0 1px oklch(0.5 0.2 250 / 0.6), 0 6px 18px oklch(0.5 0.2 250 / 0.35)',
          }}
        >
          {rtl ? 'הסבר' : 'Explain'}
        </button>
      </div>
      {contextHint && (
        <div className="mt-2 ms-5 font-sans-ui text-[12px]"
             style={{ color: 'oklch(0.64 0.01 265)' }}>
          {rtl
            ? 'קוראים משהו? הדביקו את המשפט שהמילה מופיעה בו — Gadit יבחר את המשמעות הנכונה.'
            : 'Reading something? Paste the sentence to disambiguate meaning.'}
        </div>
      )}
    </div>
  );
}

// ─── Tier badge ────────────────────────────────────────────────
function TierBadge({ tier, small = false }) {
  if (!tier || tier === 'free') return null;
  const isDeep = tier === 'deep';
  return (
    <span
      className="inline-flex items-center gap-1.5 font-sans-ui"
      style={{
        fontSize: small ? 10 : 11,
        letterSpacing: '0.1em',
        fontWeight: 600,
        textTransform: 'uppercase',
        color: 'oklch(0.72 0.19 245)',
        padding: small ? '2px 8px' : '3px 10px',
        borderRadius: 999,
        background: 'oklch(0.72 0.19 245 / 0.1)',
        boxShadow: `inset 0 0 0 1px oklch(0.72 0.19 245 / ${isDeep ? 0.55 : 0.35})`,
      }}
    >
      <span style={{
        width: 5, height: 5, borderRadius: 999,
        background: 'oklch(0.72 0.19 245)',
        boxShadow: isDeep ? '0 0 6px oklch(0.72 0.19 245)' : 'none',
      }} />
      {isDeep ? 'Deep' : 'Clear'}
    </span>
  );
}

// ─── Report flag ───────────────────────────────────────────────
function ReportFlag({ rtl = false }) {
  return (
    <button className="gd-flag-btn inline-flex items-center gap-1.5 font-sans-ui text-[11.5px]">
      <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
        <path d="M3 1.5v11M3 2h6.5l-1 2 1 2H3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {rtl ? 'דיווח' : 'Report'}
    </button>
  );
}

// ─── Numbered meaning badge — ring echoes the logo ─────────────
function MeaningBadge({ n }) {
  return (
    <span
      className="inline-flex items-center justify-center font-sans-ui"
      style={{
        width: 30, height: 30, borderRadius: 999,
        fontWeight: 500, fontSize: 13,
        color: 'oklch(0.56 0.2 250)',
        background: 'oklch(0.985 0.008 85)',
        boxShadow:
          'inset 0 0 0 1.5px oklch(0.72 0.19 245), ' +
          '0 0 0 3px oklch(0.72 0.19 245 / 0.1)',
      }}
    >
      {n}
    </span>
  );
}

// ─── Eyebrow label ─────────────────────────────────────────────
function Eyebrow({ children, className = '', style }) {
  return <div className={`gd-eyebrow ${className}`} style={style}>{children}</div>;
}

// ─── Kids glyph (original, not emoji) ──────────────────────────
// Small crescent + sparkle — evokes "dream" + "child imagination",
// not a literal face.
function KidsGlyph({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         style={{ color: 'oklch(0.55 0.15 60)' }}>
      <path d="M16 4a8 8 0 1 0 4 12 6 6 0 0 1-4-12z" fill="currentColor" opacity="0.95"/>
      <path d="M7 6l.7 1.8L9.5 8.5 7.7 9.2 7 11l-.7-1.8L4.5 8.5l1.8-.7L7 6z" fill="currentColor"/>
    </svg>
  );
}

// ─── Lock glyph ────────────────────────────────────────────────
function LockGlyph({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <path d="M4 6V4.5a3 3 0 0 1 6 0V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <rect x="2.5" y="6" width="9" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  );
}

// ─── Signed-out marketing header (homepage) ────────────────────
function MarketingHeader({ rtl = false, locale = 'en' }) {
  const signIn = locale === 'he' ? 'התחברות' : locale === 'ar' ? 'تسجيل الدخول' : 'Sign in';
  return (
    <header className="w-full flex items-center justify-between px-8 py-5"
      style={{ borderBottom: '1px solid oklch(1 0 0 / 0.06)' }}>
      <Wordmark />
      <button className="font-sans-ui font-medium"
        style={{
          fontSize: 13, padding: '8px 18px', borderRadius: 999,
          color: 'oklch(0.92 0.01 265)',
          background: 'oklch(1 0 0 / 0.06)',
          boxShadow: 'inset 0 0 0 1px oklch(1 0 0 / 0.12)',
        }}>
        {signIn}
      </button>
    </header>
  );
}

Object.assign(window, {
  GaditMark, Wordmark, DarkHeader, MobileHeader, MarketingHeader,
  SearchBar, TierBadge, ReportFlag, MeaningBadge,
  Eyebrow, KidsGlyph, LockGlyph,
});
