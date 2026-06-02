/* Screen 8 — Notebook with Galaxy view (Deep tier).
   /beta/notebook · the brand differentiator.
*/

const NOTEBOOK_DATA = {
  en: [
    { word: 'dream',        meaning: 'A series of thoughts, images, or sensations occurring in the mind during sleep.', saved: 'Apr 24', recent: true,  mastery: 0 },
    { word: 'ephemeral',    meaning: 'Lasting for a very short time; transitory.',                                      saved: 'Apr 22', recent: true,  mastery: 1 },
    { word: 'serendipity',  meaning: 'The occurrence of events by chance in a happy or beneficial way.',                saved: 'Apr 18', recent: false, mastery: 3 },
    { word: 'juxtaposition',meaning: 'The fact of placing two things close together for contrasting effect.',           saved: 'Apr 15', recent: false, mastery: 2 },
    { word: 'ineffable',    meaning: 'Too great or extreme to be expressed in words.',                                  saved: 'Mar 30', recent: false, mastery: 0, faded: true },
    { word: 'sonder',       meaning: 'The realisation that each passerby is living a life as vivid and complex as your own.', saved: 'Mar 22', recent: false, mastery: 0, faded: true },
  ],
  he: [
    { word: 'חלום',  meaning: 'רצף של דימויים, רגשות או רעיונות שעוברים בתודעה בזמן השינה.', saved: '24 באפריל', recent: true,  mastery: 0 },
    { word: 'שלום',  meaning: 'מצב של רוגע, היעדר מלחמה — וגם ברכה.',                          saved: '22 באפריל', recent: true,  mastery: 2 },
    { word: 'אמת',   meaning: 'מה שתואם את המציאות; היפוכו של שקר.',                           saved: '18 באפריל', recent: false, mastery: 3 },
    { word: 'נשמה',  meaning: 'החלק הרוחני של האדם — נשימה, חיים, פנימיות.',                   saved: '15 באפריל', recent: false, mastery: 1 },
    { word: 'רגע',   meaning: 'יחידת זמן קצרה — וגם תחושת השתהות.',                            saved: '30 במרץ',   recent: false, mastery: 0, faded: true },
    { word: 'חופש',  meaning: 'מצב של שחרור ממגבלות; היכולת לבחור.',                           saved: '22 במרץ',   recent: false, mastery: 0, faded: true },
  ],
};

// Deterministic hash → 0..1 for star scatter
function hash01(str, salt = 0) {
  let h = 5381 ^ salt;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return ((h >>> 0) % 10000) / 10000;
}

// View toggle
function NotebookToggle({ t, view, rtl }) {
  const items = [
    { id: 'list',   label: t('listView') },
    { id: 'galaxy', label: t('galaxyView') },
  ];
  return (
    <div className={`inline-flex items-center gap-1 ${rtl ? 'flex-row-reverse' : ''}`}
      style={{
        padding: 4, borderRadius: 12,
        background: 'oklch(1 0 0 / 0.05)',
        boxShadow: 'inset 0 0 0 1px oklch(1 0 0 / 0.08)',
      }}>
      {items.map((it) => (
        <button key={it.id}
          className="font-sans-ui font-medium"
          style={{
            fontSize: 13,
            padding: '7px 16px',
            borderRadius: 9,
            color: view === it.id ? 'oklch(0.18 0.04 265)' : 'oklch(0.85 0.02 265)',
            background: view === it.id ? 'oklch(0.97 0.01 265)' : 'transparent',
            boxShadow: view === it.id ? '0 2px 6px oklch(0 0 0 / 0.2)' : 'none',
            display: 'inline-flex', alignItems: 'center', gap: 7,
          }}>
          {it.id === 'galaxy' && (
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="1.2" fill="currentColor"/>
              <circle cx="2" cy="3" r="0.7" fill="currentColor" opacity="0.6"/>
              <circle cx="10" cy="4" r="0.7" fill="currentColor" opacity="0.6"/>
              <circle cx="3" cy="9" r="0.7" fill="currentColor" opacity="0.6"/>
              <circle cx="9.5" cy="9" r="0.7" fill="currentColor" opacity="0.6"/>
            </svg>
          )}
          {it.id === 'list' && (
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 3.5h7M2.5 6h7M2.5 8.5h7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          )}
          {it.label}
        </button>
      ))}
    </div>
  );
}

function WordCard({ entry, locale, rtl, mobile }) {
  const meta = LOCALE_META[locale];
  const wordFont = meta.script === 'he' ? 'font-he' : meta.script === 'ar' ? 'font-ar' : 'font-display';
  return (
    <div className="gd-card relative group"
      style={{
        padding: mobile ? '20px 22px' : '24px 26px',
        textAlign: rtl ? 'right' : 'left',
        opacity: entry.faded ? 0.7 : 1,
      }}>
      <div className={`flex items-baseline ${rtl ? 'flex-row-reverse' : ''} justify-between`}>
        <h3 className={wordFont}
          style={{
            fontSize: mobile ? 28 : 32,
            color: 'oklch(0.5 0.18 250)',
            lineHeight: 1.1,
            ...(meta.script === 'latin' ? { fontVariationSettings: '"opsz" 60', fontWeight: 400, fontStyle: 'italic', letterSpacing: '-0.015em' } : {}),
          }}>
          {entry.word}
        </h3>
      </div>
      <div className={`mt-2 flex items-center gap-2 ${rtl ? 'flex-row-reverse' : ''}`}>
        <span className="font-sans-ui"
          style={{ fontSize: 10.5, color: 'var(--gd-ink-500)',
                   letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600,
                   padding: '2px 7px', borderRadius: 4,
                   background: 'oklch(0.92 0.01 80)' }}>
          {meta.label}
        </span>
        <span className="font-sans-ui" style={{ fontSize: 11, color: 'var(--gd-ink-300)' }}>·</span>
        <span className="font-sans-ui" style={{ fontSize: 11, color: 'var(--gd-ink-500)', fontStyle: 'italic' }}>
          {entry.saved}
        </span>
      </div>
      <p className={`mt-3 ${meta.script === 'latin' ? 'font-display' : meta.script === 'he' ? 'font-he rtl-body' : 'font-ar rtl-body'}`}
        style={{
          fontSize: mobile ? 14 : 14.5,
          lineHeight: 1.45,
          color: 'var(--gd-ink-700)',
          display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          ...(meta.script === 'latin' ? { fontVariationSettings: '"opsz" 22' } : {}),
        }}>
        {entry.meaning}
      </p>
      {/* mastery dots (subtle, bottom-edge) */}
      <div className={`mt-4 flex items-center gap-1.5 ${rtl ? 'flex-row-reverse' : ''}`}>
        {[0,1,2].map((i) => (
          <span key={i} style={{
            width: 5, height: 5, borderRadius: 999,
            background: i < entry.mastery ? 'oklch(0.5 0.18 250)' : 'oklch(0 0 0 / 0.1)',
          }} />
        ))}
        {entry.mastery >= 3 && (
          <span className="font-sans-ui" style={{
            fontSize: 9.5, color: 'oklch(0.5 0.18 250)',
            letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600,
            marginInlineStart: 4,
          }}>{LOCALE_META[locale].dir === 'rtl' ? '★' : '★ Mastered'}</span>
        )}
      </div>
      {/* remove button */}
      <button aria-label="Remove"
        style={{
          position: 'absolute',
          insetBlockStart: 12,
          insetInlineEnd: 12,
          width: 24, height: 24, borderRadius: 999,
          color: 'var(--gd-ink-500)',
          background: 'oklch(0 0 0 / 0.04)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          opacity: 0.5,
        }}>
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
          <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}

function ListView({ t, locale, mobile, rtl, entries }) {
  if (!entries || entries.length === 0) {
    const meta = LOCALE_META[locale];
    return (
      <div style={{ paddingBlock: mobile ? 60 : 100, textAlign: 'center' }}>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none"
             style={{ color: 'oklch(0.45 0.05 265)', margin: '0 auto', opacity: 0.6 }}>
          <rect x="9" y="6" width="30" height="36" rx="3" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M14 14h20M14 20h20M14 26h13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        <h2 className={meta.script === 'latin' ? 'font-display' : meta.script === 'he' ? 'font-he' : 'font-ar'}
          style={{
            marginTop: 24,
            fontSize: mobile ? 26 : 36,
            color: 'oklch(0.92 0.01 265)',
            ...(meta.script === 'latin' ? { fontVariationSettings: '"opsz" 60', fontStyle: 'italic' } : {}),
          }}>
          {t('notebookEmpty')}
        </h2>
        <button className="mt-6 font-sans-ui font-medium"
          style={{
            fontSize: 14, padding: '12px 22px', borderRadius: 12,
            color: 'white',
            background: 'linear-gradient(180deg, oklch(0.78 0.17 245), oklch(0.62 0.2 250))',
            boxShadow: '0 0 0 1px oklch(0.5 0.2 250 / 0.6), 0 8px 22px oklch(0.5 0.2 250 / 0.4)',
          }}>
          {t('searchToBegin')}
        </button>
      </div>
    );
  }
  return (
    <div className={`grid gap-4 ${mobile ? 'grid-cols-1' : 'grid-cols-3'}`}
      style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(3, 1fr)', gap: 16 }}>
      {entries.map((e, i) => <WordCard key={i} entry={e} locale={locale} rtl={rtl} mobile={mobile} />)}
    </div>
  );
}

function GalaxyView({ t, locale, mobile, rtl, entries, tooltipFor = null }) {
  const meta = LOCALE_META[locale];
  const wordFont = meta.script === 'he' ? 'font-he' : meta.script === 'ar' ? 'font-ar' : 'font-display';
  // Stage dimensions
  const W = mobile ? 343 : 1080;
  const H = mobile ? 480 : 540;

  // Ambient stars (decorative, deterministic)
  const ambient = Array.from({ length: 30 }).map((_, i) => ({
    x: hash01('ambient' + i, 1) * W,
    y: hash01('ambient' + i, 2) * H,
    r: 0.4 + hash01('ambient' + i, 3) * 0.9,
    op: 0.18 + hash01('ambient' + i, 4) * 0.4,
  }));

  // Word stars: deterministic scatter inside an inner rect (avoid edges)
  const padX = mobile ? 30 : 90;
  const padY = mobile ? 30 : 60;
  const stars = entries.map((entry) => {
    const x = padX + hash01(entry.word, 7) * (W - padX * 2);
    const y = padY + hash01(entry.word, 11) * (H - padY * 2);
    return { ...entry, x, y };
  });

  return (
    <div className="relative"
      style={{
        width: '100%',
        height: H,
        borderRadius: 18,
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at 50% 30%, oklch(0.22 0.07 260 / 0.9), oklch(0.14 0.04 265 / 0.95) 70%)',
        boxShadow: 'inset 0 0 0 1px oklch(1 0 0 / 0.08), inset 0 0 80px oklch(0 0 0 / 0.5)',
      }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice"
           style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id="gd-star-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="oklch(0.95 0.05 245)" stopOpacity="1"/>
            <stop offset="40%"  stopColor="oklch(0.72 0.19 245)" stopOpacity="0.5"/>
            <stop offset="100%" stopColor="oklch(0.5 0.2 250)"   stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="gd-star-dim" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="oklch(0.85 0.02 265)" stopOpacity="0.7"/>
            <stop offset="100%" stopColor="oklch(0.5 0.05 265)"  stopOpacity="0"/>
          </radialGradient>
        </defs>
        {/* Ambient stars */}
        {ambient.map((s, i) => (
          <circle key={'a' + i} cx={s.x} cy={s.y} r={s.r} fill="white" opacity={s.op}/>
        ))}
        {/* Word stars */}
        {stars.map((s, i) => {
          const isMastered = s.mastery >= 3;
          const isFaded = s.faded;
          const baseR = isMastered ? 4 : 3;
          const glowR = isMastered ? 22 : s.recent ? 18 : 14;
          const opacity = isFaded ? 0.4 : 1;
          return (
            <g key={'s' + i} opacity={opacity} style={{ cursor: 'pointer' }}>
              {/* Glow halo */}
              <circle cx={s.x} cy={s.y} r={glowR}
                fill={isFaded ? 'url(#gd-star-dim)' : 'url(#gd-star-glow)'} />
              {/* Core */}
              <circle cx={s.x} cy={s.y} r={baseR}
                fill={isFaded ? 'oklch(0.7 0.02 265)' : 'oklch(0.97 0.02 245)'}/>
              {/* Recent pulse ring */}
              {s.recent && (
                <circle cx={s.x} cy={s.y} r={baseR + 4}
                  fill="none" stroke="oklch(0.82 0.1 245)" strokeWidth="1" opacity="0.45"/>
              )}
            </g>
          );
        })}
      </svg>

      {/* Tooltip overlay (HTML for crisp text + RTL) */}
      {tooltipFor && (() => {
        const star = stars.find((s) => s.word === tooltipFor);
        if (!star) return null;
        const tooltipW = 200;
        const tx = Math.min(W - tooltipW - 12, Math.max(12, star.x + 14));
        const ty = Math.max(12, star.y - 56);
        return (
          <div style={{
            position: 'absolute',
            left: `${(tx / W) * 100}%`,
            top: `${(ty / H) * 100}%`,
            width: tooltipW,
            padding: '12px 14px',
            borderRadius: 10,
            background: 'oklch(0.97 0.01 265 / 0.97)',
            boxShadow: '0 12px 30px oklch(0 0 0 / 0.5), inset 0 0 0 1px oklch(0 0 0 / 0.08)',
            backdropFilter: 'blur(8px)',
            textAlign: rtl ? 'right' : 'left',
            zIndex: 3,
          }} dir={meta.dir}>
            <div className={wordFont} style={{
              fontSize: 22, color: 'oklch(0.5 0.18 250)', lineHeight: 1.1,
              ...(meta.script === 'latin' ? { fontVariationSettings: '"opsz" 32', fontStyle: 'italic', fontWeight: 400 } : {}),
            }}>{star.word}</div>
            <div className="font-sans-ui mt-1" style={{
              fontSize: 11, color: 'var(--gd-ink-500)',
              letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600,
            }}>{t('savedOn', star.saved)}</div>
            {/* connecting dot */}
            <div style={{
              position: 'absolute',
              left: rtl ? 'auto' : -7, right: rtl ? -7 : 'auto',
              top: 28, width: 7, height: 7, borderRadius: 999,
              background: 'oklch(0.97 0.01 265)',
              boxShadow: 'inset 0 0 0 1px oklch(0 0 0 / 0.08)',
            }}/>
          </div>
        );
      })()}

      {/* Legend strip */}
      <div className={`absolute font-sans-ui ${rtl ? 'flex-row-reverse' : ''}`}
        style={{
          insetBlockEnd: 16,
          insetInlineStart: 16,
          display: 'flex', alignItems: 'center', gap: 16,
          fontSize: 11, color: 'oklch(0.65 0.03 265)',
          padding: '8px 14px', borderRadius: 999,
          background: 'oklch(0.1 0.04 265 / 0.6)',
          boxShadow: 'inset 0 0 0 1px oklch(1 0 0 / 0.06)',
        }}>
        <span className="inline-flex items-center gap-2">
          <span style={{ width: 6, height: 6, borderRadius: 999, background: 'oklch(0.97 0.02 245)',
                         boxShadow: '0 0 6px oklch(0.72 0.19 245 / 0.6)' }}/>
          {t('legendRecent')}
        </span>
        <span className="inline-flex items-center gap-2">
          <span style={{ width: 7, height: 7, borderRadius: 999, background: 'oklch(0.97 0.02 245)',
                         boxShadow: '0 0 12px oklch(0.72 0.19 245 / 0.9)' }}/>
          {t('legendMastered')}
        </span>
        <span className="inline-flex items-center gap-2">
          <span style={{ width: 6, height: 6, borderRadius: 999, background: 'oklch(0.7 0.02 265 / 0.5)' }}/>
          {t('legendNeedsReview')}
        </span>
      </div>
    </div>
  );
}

function NotebookScreen({ t, locale, mobile = false, rtl = false,
                         view = 'list', empty = false, tooltipFor = null }) {
  const meta = LOCALE_META[locale];
  const titleFont = meta.script === 'he' ? 'font-he' : meta.script === 'ar' ? 'font-ar' : 'font-display';
  const entries = empty ? [] : (NOTEBOOK_DATA[locale] || NOTEBOOK_DATA.en);
  const reviewQueue = entries.filter((e) => e.faded).length;
  const total = empty ? 0 : 127;

  return (
    <div dir={meta.dir}
         data-screen-label={`08 Notebook · ${locale.toUpperCase()} · ${mobile ? 'mobile · ' : ''}${empty ? 'empty' : view}`}
         className="gd-stage" style={{ minHeight: '100%' }}>
      <div className="gd-stars" />
      <div className="relative" style={{ zIndex: 1 }}>
        {mobile ? <MobileHeader /> : <MarketingHeader locale={locale} rtl={rtl} />}

        <div style={{ paddingInline: mobile ? 16 : 28, paddingBlockEnd: 60 }}>
          {/* Hero strip */}
          <div style={{ maxWidth: 1120, margin: '0 auto',
                        paddingBlockStart: mobile ? 32 : 56,
                        textAlign: rtl ? 'right' : 'left' }}>
            <Eyebrow style={{ color: 'oklch(0.82 0.1 245)' }}>{t('notebookEyebrow')}</Eyebrow>
            <h1 className={titleFont}
                style={{
                  marginTop: 8,
                  fontSize: mobile ? 36 : 56,
                  lineHeight: 1.05,
                  color: 'oklch(0.97 0.008 265)',
                  ...(meta.script === 'latin' ? { fontVariationSettings: '"opsz" 144, "SOFT" 80', fontWeight: 400, letterSpacing: '-0.025em' } : {}),
                }}>
              {t('notebookTitle')}
            </h1>
            <p className="mt-3 font-sans-ui"
               style={{ fontSize: mobile ? 15 : 17, lineHeight: 1.55,
                        color: 'oklch(0.72 0.02 265)', maxWidth: 640 }}>
              {t('notebookSubtitle')}
            </p>

            {/* Counter + practice CTA */}
            {!empty && (
              <div className={`mt-8 flex items-end gap-6 ${rtl ? 'flex-row-reverse' : ''}`}
                style={{ flexWrap: 'wrap' }}>
                <div className={titleFont}
                  style={{
                    fontSize: mobile ? 64 : 96, lineHeight: 1,
                    color: 'oklch(0.97 0.008 265)',
                    ...(meta.script === 'latin' ? { fontVariationSettings: '"opsz" 144', fontWeight: 400, letterSpacing: '-0.04em' } : {}),
                  }}>
                  {t('wordsExplored', total)}
                </div>
                {reviewQueue > 0 && (
                  <button className={`font-sans-ui font-medium inline-flex items-center gap-2.5 ${rtl ? 'flex-row-reverse' : ''}`}
                    style={{
                      fontSize: 14, padding: '12px 18px', borderRadius: 12,
                      color: 'white',
                      background: 'linear-gradient(180deg, oklch(0.78 0.17 245), oklch(0.62 0.2 250))',
                      boxShadow: '0 0 0 1px oklch(0.5 0.2 250 / 0.6), 0 8px 22px oklch(0.5 0.2 250 / 0.4)',
                      marginBottom: mobile ? 0 : 12,
                    }}>
                    {t('practiceNow')}
                    <span style={{
                      fontSize: 11, fontWeight: 700,
                      padding: '3px 8px', borderRadius: 999,
                      background: 'oklch(1 0 0 / 0.22)',
                      boxShadow: 'inset 0 0 0 1px oklch(1 0 0 / 0.3)',
                    }}>{t('dueToday', reviewQueue)}</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Toggle row */}
          {!empty && (
            <div style={{ maxWidth: 1120, margin: '0 auto',
                          marginBlockStart: mobile ? 24 : 36,
                          display: 'flex', justifyContent: rtl ? 'flex-end' : 'flex-start' }}>
              <NotebookToggle t={t} view={view} rtl={rtl} />
            </div>
          )}

          {/* Body */}
          <div style={{ maxWidth: 1120, margin: '0 auto',
                        marginBlockStart: empty ? (mobile ? 12 : 30) : (mobile ? 18 : 24) }}>
            {empty ? (
              <ListView t={t} locale={locale} mobile={mobile} rtl={rtl} entries={[]} />
            ) : view === 'list' ? (
              <ListView t={t} locale={locale} mobile={mobile} rtl={rtl} entries={entries} />
            ) : (
              <GalaxyView t={t} locale={locale} mobile={mobile} rtl={rtl}
                          entries={entries} tooltipFor={tooltipFor} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { NotebookScreen, NOTEBOOK_DATA });
