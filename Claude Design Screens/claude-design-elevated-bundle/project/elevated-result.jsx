/* Elevated Word Result — Page layouts (A / B / C × desktop / mobile).
   One component, switched by `variant` prop.
*/

const VARIANTS = {
  A: { icons: IconsA, name: 'Editorial',  bgClass: '',         cardClass: 'card-A', tileClass: 'tile-A' },
  B: { icons: IconsB, name: 'Luminous',   bgClass: 'bg-B',     cardClass: 'card-B', tileClass: 'tile-B' },
  C: { icons: IconsC, name: 'Marginalia', bgClass: '',         cardClass: 'card-C', tileClass: 'tile-C' },
};

// ─── Top nav (shared, RTL) ────────────────────────────────────
function TopNav({ mobile, variant }) {
  // Source order matters in RTL: first child = visual RIGHT (start), last child = visual LEFT (end).
  // Wordmark is the start (right in RTL); Sign-in pill is the end (left in RTL).
  if (mobile) {
    return (
      <div className="nav nav-mobile" dir="rtl">
        <span className="wordmark">Gad<i>it</i></span>
        <button className="lang-chip">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M2 8h12M8 2a8 8 0 0 1 0 12M8 2a8 8 0 0 0 0 12" stroke="currentColor" strokeWidth="1.2"/>
          </svg>
          <span style={{ fontSize: 13 }}>{CONTENT.labels.langName}</span>
          <svg width="11" height="11" viewBox="0 0 14 14" fill="none" style={{ opacity: 0.6 }}>
            <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
        </button>
        <button className={`pill-signin v${variant}`}>{CONTENT.labels.signIn}</button>
      </div>
    );
  }
  return (
    <div className="nav" dir="rtl">
      <span className="wordmark">Gad<i>it</i></span>
      <div className="nav-center">
        <a className="nav-link">{CONTENT.labels.search}</a>
        <a className="nav-link">{CONTENT.labels.pricing}</a>
      </div>
      <button className="lang-chip">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M2 8h12M8 2a8 8 0 0 1 0 12M8 2a8 8 0 0 0 0 12" stroke="currentColor" strokeWidth="1.2"/>
        </svg>
        <span style={{ fontSize: 13 }}>{CONTENT.labels.langName}</span>
        <svg width="11" height="11" viewBox="0 0 14 14" fill="none" style={{ opacity: 0.6 }}>
          <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      </button>
      <button className={`pill-signin v${variant}`}>{CONTENT.labels.signIn}</button>
    </div>
  );
}

// ─── Title block (per variant) ────────────────────────────────
function TitleBlock({ variant, mobile }) {
  const { word, meta, labels } = CONTENT;
  return (
    <div className={`title-block v${variant} ${mobile ? 'mob' : ''}`} dir="rtl">
      {variant === 'A' && (
        <div className="eyebrow-A">
          <span className="rule-A"/>
          <span className="caps-A">מילון · LEXICON</span>
        </div>
      )}
      {variant === 'B' && (
        <div className="eyebrow-B">
          <MicroStar size={12} color="#6366F1"/>
          <span className="caps-B">{meta.pos} · {meta.lang}</span>
        </div>
      )}
      {variant === 'C' && (
        <div className="eyebrow-C">
          <span className="bracket-C">「</span>
          <span className="caps-C">{meta.pos} · {meta.lang}</span>
          <span className="bracket-C">」</span>
        </div>
      )}

      <h1 className={`word v${variant}`}>{word}</h1>

      {variant === 'A' && (
        <div className="swoop-A"><PencilSwoop width={mobile ? 180 : 240}/></div>
      )}
      {variant === 'A' && (
        <div className="meta-A">{meta.pos} · {meta.lang}</div>
      )}
      {variant === 'C' && (
        <div className="fleuron-C"><Fleuron size={20} color="#9CA3AF"/></div>
      )}

      <div className="title-actions">
        <button className={`save-btn v${variant}`}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M4 2.5 a1 1 0 0 1 1-1 h6 a1 1 0 0 1 1 1 V14 L8 11.5 L4 14 Z"/>
          </svg>
          <span>{labels.save}</span>
        </button>
        <button className={`share-btn v${variant}`} aria-label="Share">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
            <circle cx="4" cy="8" r="1.6"/>
            <circle cx="12" cy="4" r="1.6"/>
            <circle cx="12" cy="12" r="1.6"/>
            <path d="m5.5 7.2 5-2.4M5.5 8.8l5 2.4" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Section header (with icon) ───────────────────────────────
function SectionHeader({ variant, IconCmp, label, count }) {
  return (
    <div className={`sec-head v${variant}`}>
      {count != null && <span className="sec-count">{count}</span>}
      <div className="sec-label-wrap">
        <span className="sec-label">{label}</span>
        <span className="sec-icon"><IconCmp/></span>
      </div>
    </div>
  );
}

// ─── Definitions panel (sky-blue, LOCKED bg) ──────────────────
function DefinitionsPanel({ variant }) {
  const Icon = VARIANTS[variant].icons.Definitions;
  return (
    <div className={`def-panel v${variant}`} dir="rtl">
      <SectionHeader variant={variant} IconCmp={Icon}
                     label={CONTENT.labels.definitions} count={CONTENT.meanings.length}/>
      <div className="meanings">
        {CONTENT.meanings.map((m, i) => (
          <React.Fragment key={m.n}>
            <div className="meaning-row">
              <div className={`mnum v${variant}`}>{m.n}</div>
              <div className="mbody">
                <div className="mdef">{m.def}</div>
                <ul className="mex">
                  {m.examples.map((ex, j) => (
                    <li key={j}><span className="dash">—</span>{ex}</li>
                  ))}
                </ul>
              </div>
            </div>
            {i < CONTENT.meanings.length - 1 && <div className="meaning-sep"/>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ─── Word Origin (no bg) ──────────────────────────────────────
function OriginSection({ variant }) {
  const Icon = VARIANTS[variant].icons.Origin;
  return (
    <section className={`origin-sec v${variant}`} dir="rtl">
      <SectionHeader variant={variant} IconCmp={Icon} label={CONTENT.labels.origin}/>
      <div className="origin-table">
        {CONTENT.origin.rows.map(([key, val], i) => (
          <div key={i} className="origin-row">
            <div className="origin-key">{key}</div>
            <div className="origin-val">{val}</div>
          </div>
        ))}
      </div>
      <p className="origin-narrative">{CONTENT.origin.narrative}</p>
    </section>
  );
}

// ─── Visual (no bg, empty state) ──────────────────────────────
function VisualSection({ variant, mobile }) {
  const Icon = VARIANTS[variant].icons.Visual;
  return (
    <section className={`visual-sec v${variant}`} dir="rtl">
      <SectionHeader variant={variant} IconCmp={Icon} label={CONTENT.labels.visual}/>
      <div className={`visual-empty v${variant}`}>
        {variant === 'B' && (
          <svg className="visual-illust" width={mobile ? 88 : 110} height={mobile ? 88 : 110} viewBox="0 0 110 110" fill="none" aria-hidden="true">
            <circle cx="55" cy="55" r="42" stroke="#D8B4FE" strokeWidth="1.2" strokeDasharray="2 5"/>
            <MicroStar size={20} color="#A78BFA"/>
            <g transform="translate(34 42)">
              <MicroStar size={10} color="#C4B5FD"/>
            </g>
            <g transform="translate(72 64)">
              <MicroStar size={8} color="#C4B5FD"/>
            </g>
          </svg>
        )}
        {variant === 'C' && (
          <Fleuron size={30} color="#D4D4D8"/>
        )}
        <button className={`create-img-btn v${variant}`}>
          <span className="ci-plus">+</span>
          <span>{CONTENT.labels.createImage}</span>
        </button>
      </div>
    </section>
  );
}

// ─── Take it further (no bg, 4 tiles) ─────────────────────────
function TakeFurtherSection({ variant, mobile }) {
  const Icon = VARIANTS[variant].icons.Further;
  const TileIcon = {
    kids: VARIANTS[variant].icons.Kids,
    compose: VARIANTS[variant].icons.Compose,
    compare: VARIANTS[variant].icons.Compare,
    quiz: VARIANTS[variant].icons.Quiz,
  };
  return (
    <section className={`further-sec v${variant}`} dir="rtl">
      <SectionHeader variant={variant} IconCmp={Icon} label={CONTENT.labels.further}/>
      <div className={`tile-grid ${mobile ? 'mob' : ''}`}>
        {CONTENT.tiles.map((t) => {
          const I = TileIcon[t.id];
          return (
            <div key={t.id} className={`tile v${variant}`}>
              <div className="tile-icon"><I/></div>
              <div className="tile-label">{t.label}</div>
              <div className={`tier-badge ${t.tier.toLowerCase()}`}>{t.tier}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── Mobile sticky bottom bar ─────────────────────────────────
function MobileBottomBar({ variant }) {
  return (
    <div className="mob-bottom" dir="rtl">
      <button className={`mob-save v${variant}`}>
        <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2.5 a1 1 0 0 1 1-1 h6 a1 1 0 0 1 1 1 V14 L8 11.5 L4 14 Z"/></svg>
        <span>{CONTENT.labels.save}</span>
      </button>
      <div className="mob-avatar">N</div>
    </div>
  );
}

// ─── Page composition ────────────────────────────────────────
function ResultPage({ variant, mobile = false }) {
  const v = VARIANTS[variant];
  return (
    <div className={`page v${variant} ${mobile ? 'mob' : ''} ${v.bgClass}`}>
      {variant === 'B' && !mobile && <div className="paper-grain" aria-hidden="true"/>}
      <TopNav mobile={mobile} variant={variant}/>
      <main className={`shell ${mobile ? 'mob' : ''}`}>
        <article className={`reading-card ${v.cardClass} ${mobile ? 'mob' : ''}`}>
          <TitleBlock variant={variant} mobile={mobile}/>
          <DefinitionsPanel variant={variant}/>
          <OriginSection variant={variant}/>
          <VisualSection variant={variant} mobile={mobile}/>
          <TakeFurtherSection variant={variant} mobile={mobile}/>
        </article>
      </main>
      {mobile && <MobileBottomBar variant={variant}/>}
    </div>
  );
}

Object.assign(window, { ResultPage, VARIANTS });
