/* Screen 1 — Result Screen components.
   Each block is a distinct card treatment so the scroll has rhythm.
   Word title → AI image slot → stacked meanings → etymology (pull-quote historyNote)
   → Kids card (tier-aware) → general idioms → Take it further (4-up, tier-gated).
*/

// ─── Word title block ───────────────────────────────────────────
// Sits inside the first/topmost card. Includes language chip + save/share.
function WordHeader({ word, language, langCode = 'EN', pos, ipa, tier, script = 'latin', mobile = false }) {
  const fontClass = script === 'he' ? 'font-he rtl-title' : script === 'ar' ? 'font-ar rtl-title' : 'font-display';
  const sizeStyle = mobile
    ? { fontSize: 'clamp(40px, 11vw, 56px)', lineHeight: 1.05 }
    : { fontSize: 'clamp(56px, 6vw, 88px)', lineHeight: 1.02 };
  const fontSettings = script === 'latin' ? { fontVariationSettings: '"opsz" 144, "SOFT" 60', fontWeight: 400 } : {};

  return (
    <div className="gd-card" style={{ padding: mobile ? '24px 22px 20px' : '36px 40px 30px' }}>
      <div className={`flex ${mobile ? 'flex-col gap-3' : 'items-start justify-between gap-6'}`}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <Eyebrow>{language}</Eyebrow>
            <span style={{ color: 'var(--gd-ink-300)' }}>·</span>
            <span className="font-sans-ui text-[11px]"
                  style={{ color: 'var(--gd-ink-500)', fontWeight: 500 }}>
              {langCode}
            </span>
            {pos && (
              <>
                <span style={{ color: 'var(--gd-ink-300)' }}>·</span>
                <span className="font-sans-ui text-[11px] italic"
                      style={{ color: 'var(--gd-ink-500)' }}>{pos}</span>
              </>
            )}
          </div>
          <h1 className={fontClass}
              style={{ ...sizeStyle, ...fontSettings, color: 'var(--gd-ink-900)', letterSpacing: script === 'latin' ? '-0.025em' : 0 }}>
            {word}
          </h1>
          {ipa && (
            <div className="mt-2 font-sans-ui text-[14px]" style={{ color: 'var(--gd-ink-500)' }}>
              {ipa}
            </div>
          )}
        </div>
        {!mobile && (
          <div className="flex flex-col items-end gap-3">
            {tier && <TierBadge tier={tier} />}
            <div className="flex items-center gap-2">
              <IconButton label="Save">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3.5 2h7v10l-3.5-2.5L3.5 12V2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                </svg>
              </IconButton>
              <IconButton label="Listen">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 5.5h2L8 3v8L5 8.5H3v-3z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                  <path d="M10 5c.7.6.7 3.4 0 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </IconButton>
              <IconButton label="Share">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 9V2m0 0L4.5 4.5M7 2l2.5 2.5M3 8.5V12h8V8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </IconButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function IconButton({ children, label }) {
  return (
    <button
      aria-label={label}
      className="inline-flex items-center gap-1.5 font-sans-ui text-[12px]"
      style={{
        color: 'var(--gd-ink-700)',
        padding: '7px 11px',
        borderRadius: 10,
        background: 'oklch(0.94 0.012 85)',
        boxShadow: 'inset 0 0 0 1px oklch(0.86 0.014 85)',
      }}
    >
      {children}<span>{label}</span>
    </button>
  );
}

// ─── AI Image slot ──────────────────────────────────────────────
// Lives between word title and meanings. THREE states:
//  • 'empty-clear' : Clear/Deep pre-generate — inviting CTA placeholder
//  • 'empty-locked': Free user — same slot, frosted, tier promise
//  • 'filled'      : post-generate, shows the image
function ImageSlot({ state = 'empty-clear', word = 'dream', mobile = false }) {
  const h = mobile ? 240 : 360;
  if (state === 'filled') {
    return (
      <div className="relative overflow-hidden"
           style={{ borderRadius: 20, height: h }}>
        <div className="absolute inset-0 gd-stripe"
             style={{ background:
               'linear-gradient(135deg, oklch(0.4 0.12 260) 0%, oklch(0.25 0.1 270) 50%, oklch(0.35 0.1 30) 100%)'
             }} />
        <div className="absolute inset-0 flex items-center justify-center flex-col gap-2">
          <div className="font-sans-ui text-[10px] tracking-[0.22em] uppercase"
               style={{ color: 'oklch(1 0 0 / 0.55)' }}>Generated image</div>
          <div className="font-display italic text-[15px]"
               style={{ color: 'oklch(1 0 0 / 0.85)' }}>"floating city of clouds at dusk"</div>
        </div>
        <div className="absolute bottom-3 end-3 flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 font-sans-ui text-[11px]"
            style={{ padding: '6px 10px', borderRadius: 999, color: 'white',
                     background: 'oklch(0 0 0 / 0.45)', backdropFilter: 'blur(8px)',
                     boxShadow: 'inset 0 0 0 1px oklch(1 0 0 / 0.15)' }}>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6a4 4 0 1 0 1-2.7M3 1v3h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            Regenerate
          </button>
          <button className="inline-flex items-center gap-1.5 font-sans-ui text-[11px]"
            style={{ padding: '6px 10px', borderRadius: 999, color: 'white',
                     background: 'oklch(0 0 0 / 0.45)', backdropFilter: 'blur(8px)',
                     boxShadow: 'inset 0 0 0 1px oklch(1 0 0 / 0.15)' }}>
            Save
          </button>
        </div>
      </div>
    );
  }

  const locked = state === 'empty-locked';
  return (
    <div
      className="relative overflow-hidden gd-drift"
      style={{
        borderRadius: 20,
        height: h,
        background: locked
          ? 'linear-gradient(135deg, oklch(0.94 0.01 260) 0%, oklch(0.9 0.015 250) 50%, oklch(0.93 0.012 265) 100%)'
          : 'linear-gradient(135deg, oklch(0.93 0.035 250) 0%, oklch(0.88 0.06 245) 45%, oklch(0.92 0.04 260) 100%)',
        boxShadow: locked
          ? 'inset 0 0 0 1px oklch(0.82 0.012 265), 0 1px 0 oklch(1 0 0 / 0.4) inset'
          : 'inset 0 0 0 1px oklch(0.78 0.1 245 / 0.4), 0 0 30px oklch(0.72 0.19 245 / 0.15)',
      }}
    >
      {/* subtle orbit ring — hints imagery */}
      <svg className="absolute" style={{ inset: 0, width: '100%', height: '100%', opacity: 0.4 }} viewBox="0 0 400 300" preserveAspectRatio="none">
        <ellipse cx="200" cy="150" rx="140" ry="90" stroke={locked ? "oklch(0.6 0.01 265 / 0.25)" : "oklch(0.72 0.19 245 / 0.45)"} strokeWidth="0.7" fill="none"/>
        <ellipse cx="200" cy="150" rx="95" ry="60" stroke={locked ? "oklch(0.6 0.01 265 / 0.2)" : "oklch(0.72 0.19 245 / 0.35)"} strokeWidth="0.6" fill="none" strokeDasharray="2 4"/>
        <circle cx="200" cy="150" r="1.8" fill={locked ? "oklch(0.5 0.01 265)" : "oklch(0.72 0.19 245)"}/>
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
        {locked ? (
          <>
            <div className="flex items-center gap-2" style={{ color: 'oklch(0.48 0.08 250)' }}>
              <LockGlyph size={14} />
              <span className="font-sans-ui text-[10.5px] tracking-[0.2em] uppercase font-semibold">
                Clear unlocks this
              </span>
            </div>
            <div className="font-display italic"
                 style={{ fontSize: mobile ? 22 : 28, color: 'var(--gd-ink-900)' }}>
              Visualize <em>{word}</em>
            </div>
            <div className="font-sans-ui text-[13px] max-w-[32ch]"
                 style={{ color: 'var(--gd-ink-500)' }}>
              Generate a vivid, one-of-a-kind image for this word — understanding through sight.
            </div>
            <button className="mt-1 inline-flex items-center gap-2 font-sans-ui text-[12.5px] font-medium"
              style={{
                padding: '9px 16px', borderRadius: 999,
                color: 'oklch(0.4 0.12 245)',
                background: 'oklch(1 0 0 / 0.7)',
                boxShadow: 'inset 0 0 0 1px oklch(0.72 0.19 245 / 0.3), 0 2px 8px oklch(0.4 0.1 245 / 0.08)',
              }}>
              Upgrade to Clear
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M3 6h6m0 0L6 3m3 3L6 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            </button>
          </>
        ) : (
          <>
            <Eyebrow>A visual for this word</Eyebrow>
            <div className="font-display italic"
                 style={{ fontSize: mobile ? 24 : 34, color: 'var(--gd-ink-900)' }}>
              Visualize <span style={{ fontStyle: 'italic', color: 'oklch(0.56 0.2 250)' }}>{word}</span>
            </div>
            <div className="font-sans-ui text-[13px] max-w-[34ch]"
                 style={{ color: 'var(--gd-ink-500)' }}>
              One vivid image, generated by Gadit — a visual anchor for how this word <em>feels</em>.
            </div>
            <button className="mt-1 inline-flex items-center gap-2 font-sans-ui text-[13px] font-medium"
              style={{
                padding: '10px 18px', borderRadius: 999,
                color: 'white',
                background: 'linear-gradient(180deg, oklch(0.78 0.17 245), oklch(0.62 0.2 250))',
                boxShadow: '0 0 0 1px oklch(0.5 0.2 250 / 0.6), 0 8px 24px oklch(0.5 0.2 250 / 0.35)',
              }}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M7 2v3m0 4v3m-5-5h3m4 0h3m-8.5-3.5l2 2m5 5l2 2m0-9l-2 2m-5 5l-2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              Generate image
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Meaning card ───────────────────────────────────────────────
function MeaningCard({ n, pos, definition, examples, idioms, script = 'latin', mobile = false }) {
  const bodyFont = script === 'he' ? 'font-he rtl-body' : script === 'ar' ? 'font-ar rtl-body' : 'font-display';
  const defSize = mobile ? 22 : 26;
  return (
    <div className="gd-card relative" style={{ padding: mobile ? '26px 24px' : '32px 40px' }}>
      <div className="flex items-start gap-4">
        <MeaningBadge n={n} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-2">
            <Eyebrow>Meaning {n}</Eyebrow>
            {pos && (
              <>
                <span style={{ color: 'var(--gd-ink-300)' }}>·</span>
                <span className="font-sans-ui text-[10.5px] italic tracking-wide"
                      style={{ color: 'var(--gd-ink-500)' }}>{pos}</span>
              </>
            )}
          </div>
          <p className={bodyFont}
             style={{ fontSize: defSize, lineHeight: 1.35, color: 'var(--gd-ink-900)',
                      fontVariationSettings: script === 'latin' ? '"opsz" 32' : undefined }}>
            {definition}
          </p>

          <ul className="mt-5 space-y-2.5">
            {examples.map((ex, i) => (
              <li key={i} className="flex gap-3">
                <span style={{
                  color: 'oklch(0.72 0.19 245)',
                  fontSize: 20, lineHeight: '24px', flexShrink: 0,
                }}>·</span>
                <span className={`${bodyFont}`}
                      style={{ fontSize: mobile ? 15 : 17, lineHeight: 1.55,
                               fontStyle: script === 'latin' ? 'italic' : 'normal',
                               color: 'var(--gd-ink-700)' }}>
                  {ex}
                </span>
              </li>
            ))}
          </ul>

          {idioms && idioms.length > 0 && (
            <div className="mt-6 pt-5" style={{ borderTop: '1px solid oklch(0.9 0.012 85)' }}>
              <Eyebrow className="mb-3">Idioms with this meaning</Eyebrow>
              <ul className="space-y-2">
                {idioms.map((idm, i) => (
                  <li key={i} className="flex items-baseline gap-3">
                    <span className="font-display"
                          style={{ fontSize: mobile ? 14.5 : 16, color: 'var(--gd-ink-900)',
                                   fontStyle: 'italic', fontWeight: 500 }}>
                      "{idm.phrase}"
                    </span>
                    <span style={{ color: 'var(--gd-ink-300)' }}>—</span>
                    <span className={bodyFont}
                          style={{ fontSize: mobile ? 13.5 : 15, color: 'var(--gd-ink-500)' }}>
                      {idm.meaning}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <div className="absolute bottom-4 end-4">
        <ReportFlag />
      </div>
    </div>
  );
}

// ─── Etymology card — historyNote as pull quote ─────────────────
function EtymologyCard({ origin, historyNote, timeline, mobile = false }) {
  return (
    <div className="gd-card relative" style={{ padding: mobile ? '26px 24px 32px' : '34px 40px 40px' }}>
      <div className="flex items-baseline gap-3 mb-4">
        <Eyebrow>Origin</Eyebrow>
        <span style={{ color: 'var(--gd-ink-300)' }}>·</span>
        <span className="font-sans-ui text-[10.5px] tracking-wide"
              style={{ color: 'var(--gd-ink-500)' }}>A narrative etymology</span>
      </div>

      <p className="font-display"
         style={{ fontSize: mobile ? 17 : 19, lineHeight: 1.55,
                  color: 'var(--gd-ink-700)',
                  fontVariationSettings: '"opsz" 20' }}>
        {origin}
      </p>

      {/* Pull-quote historyNote — the differentiator */}
      <div className="my-6 py-6 relative"
           style={{
             borderTop: '1px solid oklch(0.88 0.012 85)',
             borderBottom: '1px solid oklch(0.88 0.012 85)',
           }}>
        <div className="absolute start-0 top-6 h-6 w-[3px] rounded-full"
             style={{ background: 'oklch(0.72 0.19 245)', boxShadow: '0 0 8px oklch(0.72 0.19 245 / 0.5)' }} />
        <div className="ps-5">
          <Eyebrow className="mb-2" >History note</Eyebrow>
          <blockquote className="font-display italic"
                      style={{ fontSize: mobile ? 19 : 23, lineHeight: 1.45,
                               color: 'var(--gd-ink-900)',
                               fontVariationSettings: '"opsz" 40' }}>
            {historyNote}
          </blockquote>
        </div>
      </div>

      {timeline && (
        <div className="mt-4">
          <Eyebrow className="mb-3">Through time</Eyebrow>
          <div className="relative">
            <div className="absolute start-0 end-0 top-[9px] h-px"
                 style={{ background: 'oklch(0.88 0.012 85)' }}/>
            <div className="grid grid-cols-4 gap-3 relative">
              {timeline.map((t, i) => (
                <div key={i} className="flex flex-col items-start gap-2">
                  <span className="w-[9px] h-[9px] rounded-full"
                        style={{
                          background: i === timeline.length - 1 ? 'oklch(0.72 0.19 245)' : 'oklch(0.985 0.008 85)',
                          boxShadow: 'inset 0 0 0 1.5px oklch(0.72 0.19 245)' +
                                     (i === timeline.length - 1 ? ', 0 0 8px oklch(0.72 0.19 245 / 0.5)' : '')
                        }} />
                  <div>
                    <div className="font-sans-ui text-[10.5px] tracking-[0.12em] uppercase font-semibold"
                         style={{ color: 'var(--gd-ink-500)' }}>{t.era}</div>
                    <div className="font-display italic mt-0.5"
                         style={{ fontSize: 14, color: 'var(--gd-ink-900)' }}>"{t.form}"</div>
                    <div className="font-sans-ui text-[11.5px] mt-1"
                         style={{ color: 'var(--gd-ink-500)' }}>{t.gloss}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 end-4">
        <ReportFlag />
      </div>
    </div>
  );
}

// ─── Kids card — warm, distinct, tier-aware ─────────────────────
function KidsCard({ locked = false, intro, bullets, mobile = false, script = 'latin' }) {
  const bodyFont = script === 'he' ? 'font-he rtl-body' : script === 'ar' ? 'font-ar rtl-body' : 'font-display';
  const cardStyle = locked ? { filter: 'saturate(0.4)' } : {};
  return (
    <div className={`gd-card-kids relative ${locked ? 'gd-locked' : ''}`}
         style={{ padding: mobile ? '26px 24px 32px' : '34px 40px 40px', ...cardStyle }}>
      {/* inline-start edge accent */}
      <div className="absolute top-8 bottom-8 start-0 w-[3px] rounded-full"
           style={{ background: 'oklch(0.78 0.12 75)', boxShadow: '0 0 10px oklch(0.78 0.12 75 / 0.5)' }} />
      <div className="flex items-baseline gap-3 mb-4 ps-2">
        <KidsGlyph size={20} />
        <Eyebrow style={{ color: 'var(--gd-amber-ink)' }}>For kids</Eyebrow>
        {locked && (
          <>
            <span style={{ color: 'oklch(0.75 0.05 70)' }}>·</span>
            <span className="font-sans-ui text-[10.5px] tracking-[0.15em] uppercase font-semibold inline-flex items-center gap-1"
                  style={{ color: 'oklch(0.55 0.1 65)' }}>
              <LockGlyph size={11} /> Clear
            </span>
          </>
        )}
      </div>

      <div className="ps-2">
        <p className={bodyFont}
           style={{ fontSize: mobile ? 19 : 22, lineHeight: 1.45,
                    color: 'oklch(0.32 0.04 55)',
                    fontVariationSettings: '"opsz" 24' }}>
          {intro}
        </p>

        {bullets && (
          <ul className="mt-5 space-y-2.5">
            {bullets.map((b, i) => (
              <li key={i} className="flex gap-3">
                <span style={{
                  color: 'oklch(0.78 0.12 75)',
                  fontSize: 18, lineHeight: '22px', flexShrink: 0,
                }}>✦</span>
                <span className={bodyFont}
                      style={{ fontSize: mobile ? 15 : 16.5, lineHeight: 1.55,
                               color: 'oklch(0.38 0.05 55)' }}>
                  {b}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {locked && (
        <button className="gd-lock-badge absolute top-6 end-6 inline-flex items-center gap-1.5 font-sans-ui text-[11.5px] font-medium"
          style={{
            padding: '7px 13px', borderRadius: 999,
            color: 'oklch(0.4 0.12 245)',
            background: 'oklch(1 0 0 / 0.85)',
            backdropFilter: 'blur(6px)',
            boxShadow: 'inset 0 0 0 1px oklch(0.72 0.19 245 / 0.4)',
          }}>
          Unlock with Clear
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M3 6h6m0 0L6 3m3 3L6 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
        </button>
      )}
      {!locked && <div className="absolute bottom-4 end-4"><ReportFlag /></div>}
    </div>
  );
}

// ─── General idioms card ────────────────────────────────────────
function IdiomsCard({ items, mobile = false, script = 'latin' }) {
  const bodyFont = script === 'he' ? 'font-he rtl-body' : script === 'ar' ? 'font-ar rtl-body' : 'font-display';
  return (
    <div className="gd-card relative" style={{ padding: mobile ? '26px 24px 32px' : '30px 40px 34px' }}>
      <Eyebrow className="mb-4">Common expressions</Eyebrow>
      <div className={`grid ${mobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-x-10 gap-y-4'}`}>
        {items.map((it, i) => (
          <div key={i} className="flex items-baseline gap-3"
               style={{ borderBottom: i < items.length - (mobile ? 1 : 2) ? '1px solid oklch(0.93 0.012 85)' : 'none',
                        paddingBottom: i < items.length - (mobile ? 1 : 2) ? 14 : 0 }}>
            <span className="font-display"
                  style={{ fontSize: mobile ? 15 : 17, color: 'var(--gd-ink-900)',
                           fontStyle: 'italic', fontWeight: 500, flexShrink: 0 }}>
              "{it.phrase}"
            </span>
            <span className={bodyFont}
                  style={{ fontSize: mobile ? 13.5 : 14.5, color: 'var(--gd-ink-500)',
                           lineHeight: 1.45 }}>
              {it.meaning}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-5 pt-3">
        <ReportFlag />
      </div>
    </div>
  );
}

// ─── Take it further — tier-gated 4-up ──────────────────────────
const ACTIONS = [
  {
    id: 'save', label: 'Save to notebook',
    hint: 'Return to "dream" later — organized, searchable.',
    tier: 'free',
    icon: (
      <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
        <path d="M6 3.5h10v15l-5-3.5-5 3.5v-15z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'image', label: 'Generate image',
    hint: 'A vivid AI-made visual, just for this word.',
    tier: 'clear',
    icon: (
      <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="4" width="16" height="13" rx="2" stroke="currentColor" strokeWidth="1.3"/>
        <circle cx="8" cy="9" r="1.3" fill="currentColor"/>
        <path d="M3 14l4-3 5 4 4-3 3 2" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="none"/>
      </svg>
    ),
  },
  {
    id: 'compose', label: 'Compose a sentence',
    hint: 'Write your own — Gadit reviews for tone and fit.',
    tier: 'clear',
    icon: (
      <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
        <path d="M4 17.5V15l9-9 2.5 2.5-9 9H4zM13 6l2.5 2.5M15 4l3 3-1.5 1.5-3-3L15 4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'practice', label: 'Practice this word',
    hint: 'A short quiz tuned to how you learn.',
    tier: 'deep',
    icon: (
      <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="7.5" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M8.5 10.8l2 2 3.5-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

function TakeItFurther({ currentTier = 'free', mobile = false }) {
  const tierRank = { free: 0, clear: 1, deep: 2 };
  return (
    <div>
      <div className={`flex items-baseline justify-between mb-4 ${mobile ? 'px-1' : ''}`}>
        <div>
          <Eyebrow style={{ color: 'oklch(0.82 0.008 265)' }}>Take it further</Eyebrow>
          <div className="font-display mt-1"
               style={{ fontSize: mobile ? 20 : 24, color: 'oklch(0.95 0.008 265)',
                        fontVariationSettings: '"opsz" 32', fontStyle: 'italic' }}>
            Do more with <span style={{ fontStyle: 'italic', color: 'oklch(0.82 0.1 245)' }}>dream</span>
          </div>
        </div>
      </div>
      <div className={`grid gap-3 ${mobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
        {ACTIONS.map((a) => {
          const locked = tierRank[a.tier] > tierRank[currentTier];
          return <ActionTile key={a.id} action={a} locked={locked} mobile={mobile} />;
        })}
      </div>
    </div>
  );
}

function ActionTile({ action, locked, mobile }) {
  const tierLabel = action.tier === 'deep' ? 'Deep' : action.tier === 'clear' ? 'Clear' : null;
  return (
    <div
      className={`relative overflow-hidden ${locked ? 'gd-locked' : ''}`}
      style={{
        borderRadius: 16,
        padding: mobile ? '16px 14px 14px' : '20px 18px 16px',
        minHeight: mobile ? 140 : 150,
        background: 'oklch(0.22 0.05 265 / 0.7)',
        backdropFilter: 'blur(12px)',
        boxShadow:
          'inset 0 0 0 1px oklch(1 0 0 / 0.08), ' +
          '0 4px 18px oklch(0.08 0.08 260 / 0.4)',
      }}
    >
      <div className="flex items-start justify-between">
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: 'oklch(0.72 0.19 245 / 0.12)',
          color: 'oklch(0.82 0.15 245)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'inset 0 0 0 1px oklch(0.72 0.19 245 / 0.3)',
        }}>
          {action.icon}
        </div>
        {tierLabel && <TierBadge tier={action.tier} small />}
      </div>
      <div className="mt-4 font-sans-ui font-medium"
           style={{ fontSize: mobile ? 14 : 15, color: 'oklch(0.97 0.008 265)' }}>
        {action.label}
      </div>
      <div className="mt-1 font-sans-ui"
           style={{ fontSize: mobile ? 11.5 : 12.5, lineHeight: 1.45,
                    color: 'oklch(0.72 0.02 265)' }}>
        {action.hint}
      </div>
      {locked && (
        <div className="gd-lock-badge absolute bottom-3 end-3 inline-flex items-center gap-1 font-sans-ui"
          style={{ fontSize: 10.5, color: 'oklch(0.82 0.1 245)',
                   padding: '3px 8px', borderRadius: 999,
                   background: 'oklch(0.15 0.06 265 / 0.8)',
                   boxShadow: 'inset 0 0 0 1px oklch(0.72 0.19 245 / 0.35)' }}>
          <LockGlyph size={10} /> {tierLabel}
        </div>
      )}
    </div>
  );
}

Object.assign(window, {
  WordHeader, ImageSlot, MeaningCard, EtymologyCard,
  KidsCard, IdiomsCard, TakeItFurther,
});
