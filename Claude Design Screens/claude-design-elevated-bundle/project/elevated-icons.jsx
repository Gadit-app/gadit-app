/* Elevated Word Result — Variants A / B / C
   Shared content + locked product decisions; variant-specific chrome.
   Each variant exports a Desktop and Mobile component.

   Variant A — Editorial:   magazine-clean, hand-drawn underline
   Variant B — Luminous:    paper-with-light, starburst signature
   Variant C — Marginalia:  scholar's notebook, fleuron ornament
*/

// ─────────────────────────────────────────────────────────────
// SHARED CONTENT — same string set across all variants
// ─────────────────────────────────────────────────────────────
const CONTENT = {
  word: 'חלום',
  meta: { pos: 'שם עצם', lang: 'עברית' },
  meanings: [
    {
      n: 1,
      def: 'תמונות, מחשבות או חוויות שמתרחשות בזמן שינה.',
      examples: [
        'היה לי חלום מוזר בלילה שעבר.',
        'בחלום שלי הייתי יכול לעוף מעל העיר.',
        'היא סיפרה לי על חלום שבו היא פגשה את הסבא שלה.',
      ],
    },
    {
      n: 2,
      def: 'שאיפה או מטרה שאדם רוצה להשיג בעתיד.',
      examples: [
        'החלום שלי הוא להיות רופא.',
        'הוא עובד קשה כדי להגשים את החלום שלו.',
        'לכל אחד יש חלום שהוא רוצה להגשים.',
      ],
    },
  ],
  origin: {
    rows: [
      ['שפה', 'עברית מקראית'],
      ['משמעות מקורית', 'חזיונות או תמונות בזמן שינה'],
    ],
    narrative: 'המילה מופיעה רבות בתנ"ך, כמו בסיפור חלומות יוסף בספר בראשית.',
  },
  labels: {
    definitions: 'הגדרות',
    origin: 'מקור המילה',
    visual: 'תמונה',
    further: 'קחו את זה הלאה',
    save: 'שמירה במחברת',
    signIn: 'התחברות',
    search: 'חיפוש',
    pricing: 'תמחור',
    langName: 'עברית',
    createImage: 'צרו תמונה',
  },
  tiles: [
    { id: 'kids',    label: 'הסבר לילדים', tier: 'CLEAR' },
    { id: 'compose', label: 'חברו משפט',   tier: 'CLEAR' },
    { id: 'compare', label: 'השוואת מילים', tier: 'DEEP'  },
    { id: 'quiz',    label: 'חידון',       tier: 'DEEP'  },
  ],
};

// Section accent colors (used only in icons, never in section bg per spec)
const ACCENT = {
  definitions: '#2563EB', // book — anchor blue (matches the sky panel)
  origin:      '#D97706', // scroll — amber
  visual:      '#DB2777', // picture — pink-magenta
  further:     '#7C3AED', // compass — violet
  kids:        '#EAB308', // sun — yellow
  compose:     '#EA580C', // pen — orange
  compare:     '#16A34A', // green for green-book; the other book uses #DC2626
  compareAlt:  '#DC2626',
  quiz:        '#F97316', // question chat — orange-coral
};

// ═════════════════════════════════════════════════════════════
// VARIANT A — EDITORIAL  · line-only icons, hand-drawn underline
// ═════════════════════════════════════════════════════════════
const IconsA = {
  Definitions: ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={ACCENT.definitions} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 5.5C3 4.7 3.7 4 4.5 4H11v15H4.5C3.7 19 3 18.3 3 17.5V5.5Z"/>
      <path d="M21 5.5C21 4.7 20.3 4 19.5 4H13v15h6.5C20.3 19 21 18.3 21 17.5V5.5Z"/>
      <path d="M6 8h2.5M6 11h2.5M15.5 8H18M15.5 11H18"/>
    </svg>
  ),
  Origin: ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={ACCENT.origin} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 5h11a2.5 2.5 0 0 1 2.5 2.5V18a2 2 0 0 1-2 2H7"/>
      <path d="M5 5a2 2 0 0 0-2 2v2h2"/>
      <path d="M7 20a2 2 0 0 1-2-2V9"/>
      <path d="M9 9h6M9 12h6M9 15h4"/>
    </svg>
  ),
  Visual: ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={ACCENT.visual} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="1.5"/>
      <circle cx="8" cy="10" r="1.5"/>
      <path d="M3 16.5l4-3.5 4 3 4-4 6 4"/>
    </svg>
  ),
  Further: ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={ACCENT.further} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <path d="m9.5 14.5 1.5-5 5-1.5-1.5 5z"/>
      <circle cx="12" cy="12" r="0.8" fill={ACCENT.further} stroke="none"/>
    </svg>
  ),
  Kids: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={ACCENT.kids} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="16" cy="16" r="5"/>
      <path d="M16 5v3M16 24v3M27 16h-3M8 16H5M23.78 8.22l-2.12 2.12M10.34 21.66l-2.12 2.12M23.78 23.78l-2.12-2.12M10.34 10.34 8.22 8.22"/>
    </svg>
  ),
  Compose: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={ACCENT.compose} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a2 2 0 0 1 2-2h11l5 5v13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8Z"/>
      <path d="M19 6v5h5"/>
      <path d="m13 21 6.5-6.5a1.5 1.5 0 1 1 2.1 2.1L15.1 23H13v-2z"/>
    </svg>
  ),
  Compare: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 7h7v18H5z" stroke={ACCENT.compareAlt}/>
      <path d="M20 7h7v18h-7z" stroke={ACCENT.compare}/>
      <path d="M8 11h3M8 14h2M23 11h3M23 14h2" stroke="#9CA3AF"/>
      <path d="M14 16h4" stroke="#9CA3AF"/>
    </svg>
  ),
  Quiz: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={ACCENT.quiz} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-6l-5 4v-4H9a3 3 0 0 1-3-3z"/>
      <path d="M13 11a3 3 0 1 1 4.5 2.6c-.9.5-1.5 1.2-1.5 2.4"/>
      <circle cx="16" cy="18.5" r="0.9" fill={ACCENT.quiz} stroke="none"/>
    </svg>
  ),
};

// Hand-drawn underline for the word title (Variant A signature)
function PencilSwoop({ width = 240 }) {
  return (
    <svg width={width} height="14" viewBox="0 0 240 14" fill="none" aria-hidden="true"
         style={{ display: 'block' }}>
      <path d="M2 8 C 30 4, 70 2, 110 5 S 200 11, 238 6"
            stroke="#6366F1" strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round" fill="none"
            style={{ filter: 'blur(0.15px)' }}/>
    </svg>
  );
}

// ═════════════════════════════════════════════════════════════
// VARIANT B — LUMINOUS  · line + subtle gradient fill, starburst
// ═════════════════════════════════════════════════════════════
const IconsB = {
  Definitions: ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="iconBDef" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#DBEAFE"/>
          <stop offset="1" stopColor="#BFDBFE"/>
        </linearGradient>
      </defs>
      <path d="M3 5.5C3 4.7 3.7 4 4.5 4H11v15H4.5C3.7 19 3 18.3 3 17.5V5.5Z" fill="url(#iconBDef)" stroke={ACCENT.definitions} strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M21 5.5C21 4.7 20.3 4 19.5 4H13v15h6.5C20.3 19 21 18.3 21 17.5V5.5Z" fill="url(#iconBDef)" stroke={ACCENT.definitions} strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M6 8h2.5M6 11h2.5M15.5 8H18M15.5 11H18" stroke={ACCENT.definitions} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  Origin: ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="iconBOri" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FEF3C7"/><stop offset="1" stopColor="#FDE68A"/>
        </linearGradient>
      </defs>
      <path d="M5 5h11a2.5 2.5 0 0 1 2.5 2.5V18a2 2 0 0 1-2 2H7" fill="url(#iconBOri)" stroke={ACCENT.origin} strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M5 5a2 2 0 0 0-2 2v2h2" fill="none" stroke={ACCENT.origin} strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M7 20a2 2 0 0 1-2-2V9" stroke={ACCENT.origin} strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M9 9h6M9 12h6M9 15h4" stroke={ACCENT.origin} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  Visual: ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="iconBVis" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FCE7F3"/><stop offset="1" stopColor="#FBCFE8"/>
        </linearGradient>
      </defs>
      <rect x="3" y="5" width="18" height="14" rx="1.5" fill="url(#iconBVis)" stroke={ACCENT.visual} strokeWidth="1.4"/>
      <circle cx="8" cy="10" r="1.5" fill="#FFF" stroke={ACCENT.visual} strokeWidth="1.4"/>
      <path d="M3 16.5l4-3.5 4 3 4-4 6 4" stroke={ACCENT.visual} strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
    </svg>
  ),
  Further: ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="iconBFur" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#EDE9FE"/><stop offset="1" stopColor="#DDD6FE"/>
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="9" fill="url(#iconBFur)" stroke={ACCENT.further} strokeWidth="1.4"/>
      <path d="m9.5 14.5 1.5-5 5-1.5-1.5 5z" fill="#FFF" stroke={ACCENT.further} strokeWidth="1.4" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="0.9" fill={ACCENT.further}/>
    </svg>
  ),
  Kids: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="iconBKid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FEF9C3"/><stop offset="1" stopColor="#FDE68A"/>
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="5" fill="url(#iconBKid)" stroke={ACCENT.kids} strokeWidth="1.5"/>
      <g stroke={ACCENT.kids} strokeWidth="1.6" strokeLinecap="round">
        <path d="M16 5v3M16 24v3M27 16h-3M8 16H5M23.78 8.22l-2.12 2.12M10.34 21.66l-2.12 2.12M23.78 23.78l-2.12-2.12M10.34 10.34 8.22 8.22"/>
      </g>
    </svg>
  ),
  Compose: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="iconBCom" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFEDD5"/><stop offset="1" stopColor="#FED7AA"/>
        </linearGradient>
      </defs>
      <path d="M6 8a2 2 0 0 1 2-2h11l5 5v13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8Z" fill="url(#iconBCom)" stroke={ACCENT.compose} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M19 6v5h5" stroke={ACCENT.compose} strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
      <path d="m13 21 6.5-6.5a1.5 1.5 0 1 1 2.1 2.1L15.1 23H13v-2z" fill="#FFF" stroke={ACCENT.compose} strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  ),
  Compare: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="iconBCmp1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FEE2E2"/><stop offset="1" stopColor="#FECACA"/></linearGradient>
        <linearGradient id="iconBCmp2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#DCFCE7"/><stop offset="1" stopColor="#BBF7D0"/></linearGradient>
      </defs>
      <rect x="5" y="7" width="7" height="18" fill="url(#iconBCmp1)" stroke={ACCENT.compareAlt} strokeWidth="1.5"/>
      <rect x="20" y="7" width="7" height="18" fill="url(#iconBCmp2)" stroke={ACCENT.compare} strokeWidth="1.5"/>
      <path d="M8 11h3M8 14h2M23 11h3M23 14h2" stroke="#A1A1AA" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M14 16h4" stroke="#A1A1AA" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  Quiz: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="iconBQz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFEDD5"/><stop offset="1" stopColor="#FED7AA"/></linearGradient>
      </defs>
      <path d="M6 8a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-6l-5 4v-4H9a3 3 0 0 1-3-3z" fill="url(#iconBQz)" stroke={ACCENT.quiz} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M13 11a3 3 0 1 1 4.5 2.6c-.9.5-1.5 1.2-1.5 2.4" stroke={ACCENT.quiz} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <circle cx="16" cy="18.5" r="0.9" fill={ACCENT.quiz}/>
    </svg>
  ),
};

// 4-point starburst that signs Variant B (callback to the wordmark)
function MicroStar({ size = 14, color = '#6366F1' }) {
  return (
    <svg width={size} height={size} viewBox="-20 -20 40 40" aria-hidden="true">
      <defs>
        <radialGradient id="msCore" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFFFFF"/>
          <stop offset="0.45" stopColor="#E8F0FF"/>
          <stop offset="1" stopColor={color}/>
        </radialGradient>
      </defs>
      <path d="M 0 -18 L 3 0 L 0 18 L -3 0 Z" fill="url(#msCore)"/>
      <path d="M -18 0 L 0 -3 L 18 0 L 0 3 Z" fill="url(#msCore)"/>
      <circle r="3" fill="#FFFFFF"/>
    </svg>
  );
}

// ═════════════════════════════════════════════════════════════
// VARIANT C — MARGINALIA  · solid silhouettes with highlight notch, fleuron
// ═════════════════════════════════════════════════════════════
const IconsC = {
  Definitions: ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 5.5C3 4.7 3.7 4 4.5 4H11v15H4.5C3.7 19 3 18.3 3 17.5V5.5Z" fill={ACCENT.definitions}/>
      <path d="M21 5.5C21 4.7 20.3 4 19.5 4H13v15h6.5C20.3 19 21 18.3 21 17.5V5.5Z" fill={ACCENT.definitions}/>
      <path d="M6 8h2.5M6 11h2.5M15.5 8H18M15.5 11H18" stroke="#FFFFFF" strokeOpacity="0.7" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M3 4.5 11 4.5" stroke="#FFFFFF" strokeOpacity="0.3" strokeWidth="0.8"/>
    </svg>
  ),
  Origin: ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M5 5h11a2.5 2.5 0 0 1 2.5 2.5V18a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 0-2 2h2" fill={ACCENT.origin} fillRule="evenodd"/>
      <path d="M9 9h6M9 12h6M9 15h4" stroke="#FFFFFF" strokeOpacity="0.75" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  Visual: ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="14" rx="1.5" fill={ACCENT.visual}/>
      <circle cx="8" cy="10" r="1.5" fill="#FFFFFF"/>
      <path d="M3 16.5l4-3.5 4 3 4-4 6 4 v2.5H3z" fill="#FFFFFF" fillOpacity="0.55"/>
    </svg>
  ),
  Further: ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" fill={ACCENT.further}/>
      <path d="m9.5 14.5 1.5-5 5-1.5-1.5 5z" fill="#FFFFFF"/>
      <circle cx="12" cy="12" r="0.9" fill={ACCENT.further}/>
    </svg>
  ),
  Kids: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="5" fill={ACCENT.kids}/>
      <g stroke={ACCENT.kids} strokeWidth="2.2" strokeLinecap="round">
        <path d="M16 5v3M16 24v3M27 16h-3M8 16H5M23.78 8.22l-2.12 2.12M10.34 21.66l-2.12 2.12M23.78 23.78l-2.12-2.12M10.34 10.34 8.22 8.22"/>
      </g>
    </svg>
  ),
  Compose: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M6 8a2 2 0 0 1 2-2h11l5 5v13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8Z" fill={ACCENT.compose}/>
      <path d="M19 6v5h5" fill="#FFF" fillOpacity="0.45"/>
      <path d="m13 21 6.5-6.5a1.5 1.5 0 1 1 2.1 2.1L15.1 23H13v-2z" fill="#FFFFFF"/>
    </svg>
  ),
  Compare: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="5" y="7" width="7" height="18" fill={ACCENT.compareAlt}/>
      <rect x="20" y="7" width="7" height="18" fill={ACCENT.compare}/>
      <path d="M8 11h3M8 14h2M23 11h3M23 14h2" stroke="#FFFFFF" strokeOpacity="0.7" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M14 16h4" stroke="#A1A1AA" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  Quiz: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M6 8a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-6l-5 4v-4H9a3 3 0 0 1-3-3z" fill={ACCENT.quiz}/>
      <path d="M13 11a3 3 0 1 1 4.5 2.6c-.9.5-1.5 1.2-1.5 2.4" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <circle cx="16" cy="18.5" r="1.1" fill="#FFFFFF"/>
    </svg>
  ),
};

// Fleuron ornament for Variant C
function Fleuron({ size = 14, color = '#9CA3AF' }) {
  return (
    <svg width={size} height={size * 0.5} viewBox="-30 -8 60 16" fill={color} aria-hidden="true">
      <path d="M -22 0 L -10 -4 L -8 0 L -10 4 Z"/>
      <circle cx="0" cy="0" r="2.2"/>
      <path d="M 22 0 L 10 -4 L 8 0 L 10 4 Z"/>
      <path d="M -16 0 h 4 M 12 0 h 4" stroke={color} strokeWidth="0.8"/>
    </svg>
  );
}

Object.assign(window, { CONTENT, ACCENT, IconsA, IconsB, IconsC, PencilSwoop, MicroStar, Fleuron });
