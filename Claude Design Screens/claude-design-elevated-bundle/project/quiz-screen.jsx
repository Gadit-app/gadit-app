/* Screen 6 — Practice Quiz (Deep tier).
   4-question quiz, mixed types A/B/C, modal/inline, AI-driven content.
*/

// Sample quiz content per locale (mockup data — real content from /api/quiz)
const QUIZ_DATA = {
  en: {
    word: 'dream',
    questions: [
      {
        type: 'A',
        prompt: null,
        options: [
          { text: 'A strong wish or hope held over a long time.', correct: false },
          { text: 'An imaginary plan that has no chance of happening.', correct: false },
          { text: 'A series of thoughts, images, or sensations occurring in the mind during sleep.', correct: true },
          { text: 'A vague memory of something that may not have happened.', correct: false },
        ],
        explainWrong: '"A strong wish or hope" is another sense of dream — the aspiration sense, not the sleep-vision one we just looked up.',
        explainRight: 'Yes — that\'s the sleep-vision sense.',
      },
      {
        type: 'B',
        prompt: 'Last night I had a strange ___ about flying over a forest of glass.',
        options: [
          { text: 'idea',     correct: false },
          { text: 'dream',    correct: true },
          { text: 'thought',  correct: false },
          { text: 'memory',   correct: false },
        ],
        explainWrong: '"Thought" is close but more general — "dream" specifically refers to sleeping mental imagery.',
        explainRight: 'Right — the "while sleeping" cue makes "dream" the only natural fit here.',
      },
      {
        type: 'C',
        prompt: null,
        options: [
          { text: 'fantasy',     correct: false },
          { text: 'vision',      correct: true },
          { text: 'wish',        correct: false },
          { text: 'illusion',    correct: false },
        ],
        explainWrong: '"Fantasy" leans toward conscious imagining — "vision" is closer to the involuntary sleep-image meaning.',
        explainRight: 'Yes — "vision" carries the same involuntary, image-during-sleep quality.',
      },
      {
        type: 'A',
        prompt: null,
        options: [
          { text: 'Something experienced while awake but distracted.', correct: false },
          { text: 'A succession of images during sleep.', correct: true },
          { text: 'A loud noise heard at night.', correct: false },
          { text: 'A medical term for sleep paralysis.', correct: false },
        ],
        explainWrong: 'Close, but the core idea is succession of images — not the surrounding circumstances.',
        explainRight: 'Right — succession of images during sleep is the core definition.',
      },
    ],
  },
  he: {
    word: 'חלום',
    questions: [
      {
        type: 'A',
        prompt: null,
        options: [
          { text: 'משאלה עזה לאורך זמן.', correct: false },
          { text: 'רצף של דימויים שעוברים בתודעה בזמן השינה.', correct: true },
          { text: 'תכנית שאין סיכוי שתתממש.', correct: false },
          { text: 'זיכרון מעורפל שאולי לא קרה.', correct: false },
        ],
        explainWrong: '"משאלה עזה" היא משמעות אחרת של חלום — המשמעות השאיפתית, לא זו של חלום־שינה שחיפשנו.',
        explainRight: 'כן — זו המשמעות של חלום־שינה.',
      },
    ],
  },
  ar: {
    word: 'حُلم',
    questions: [
      {
        type: 'C',
        prompt: null,
        options: [
          { text: 'خيال',  correct: false },
          { text: 'رؤيا',  correct: true },
          { text: 'أمنية', correct: false },
          { text: 'وهم',   correct: false },
        ],
        explainWrong: '"خيال" أقرب إلى التصوُّر الواعي — أما "رؤيا" فأقرب إلى الصورة التي تأتي في النوم.',
        explainRight: 'نعم — "رؤيا" تحمل المعنى نفسه: صورة لا إرادية تأتي في النوم.',
      },
    ],
  },
};

// Single option card
function QuizOption({ children, locale, mobile, state, rtl }) {
  // state: 'idle' | 'selected' | 'correct' | 'wrong' | 'dim'
  const meta = LOCALE_META[locale];
  const bodyFont = meta.script === 'he' ? 'font-he rtl-body' : meta.script === 'ar' ? 'font-ar rtl-body' : 'font-display';

  const styles = {
    idle: {
      background: 'oklch(0.98 0.01 80)',
      ring: 'inset 0 0 0 1px oklch(0 0 0 / 0.08)',
      color: 'var(--gd-ink-900)',
      opacity: 1,
    },
    selected: {
      background: 'oklch(0.98 0.01 80)',
      ring: 'inset 0 0 0 1.5px oklch(0.72 0.19 245 / 0.65), 0 0 0 5px oklch(0.72 0.19 245 / 0.1)',
      color: 'var(--gd-ink-900)',
      opacity: 1,
    },
    correct: {
      background: 'oklch(0.96 0.04 150 / 0.7)',
      ring: 'inset 0 0 0 1.5px oklch(0.55 0.18 150 / 0.55)',
      color: 'var(--gd-ink-900)',
      opacity: 1,
    },
    wrong: {
      background: 'oklch(0.96 0.04 35 / 0.6)',
      ring: 'inset 0 0 0 1.5px oklch(0.58 0.2 35 / 0.5)',
      color: 'var(--gd-ink-900)',
      opacity: 1,
    },
    dim: {
      background: 'oklch(0.97 0.01 80 / 0.6)',
      ring: 'inset 0 0 0 1px oklch(0 0 0 / 0.06)',
      color: 'var(--gd-ink-500)',
      opacity: 0.55,
    },
  }[state];

  const showMark = state === 'correct' || state === 'wrong';

  return (
    <div
      className={`flex items-start gap-3 ${rtl ? 'flex-row-reverse text-right' : ''}`}
      style={{
        padding: mobile ? '14px 16px' : '16px 18px',
        borderRadius: 12,
        background: styles.background,
        boxShadow: styles.ring,
        opacity: styles.opacity,
        cursor: 'pointer',
        transition: 'background 0.15s, box-shadow 0.15s',
      }}>
      <div aria-hidden="true"
        style={{
          width: 22, height: 22, borderRadius: 999, flexShrink: 0,
          marginTop: 1,
          background: state === 'correct'
            ? 'oklch(0.55 0.18 150)'
            : state === 'wrong'
              ? 'oklch(0.58 0.2 35)'
              : state === 'selected'
                ? 'oklch(0.72 0.19 245)'
                : 'transparent',
          boxShadow: !showMark && state !== 'selected'
            ? 'inset 0 0 0 1.5px oklch(0 0 0 / 0.18)'
            : state === 'selected'
              ? '0 0 0 4px oklch(0.72 0.19 245 / 0.18)'
              : 'none',
          color: 'white',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
        {state === 'correct' && (
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6.5l2.5 2.5L9.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        {state === 'wrong' && (
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
            <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        )}
        {state === 'selected' && (
          <span style={{ width: 8, height: 8, borderRadius: 999, background: 'white' }} />
        )}
      </div>
      <div className={bodyFont}
           style={{
             flex: 1,
             fontSize: mobile ? 15 : 16, lineHeight: 1.5,
             color: styles.color,
             ...(meta.script === 'latin' ? { fontVariationSettings: '"opsz" 22' } : {}),
           }}>
        {children}
      </div>
    </div>
  );
}

// Question body — renders A/B/C uniformly
function QuizQuestion({ t, locale, rtl, mobile, q, word, selectedIdx, revealed }) {
  const meta = LOCALE_META[locale];
  const titleFont = meta.script === 'he' ? 'font-he' : meta.script === 'ar' ? 'font-ar' : 'font-display';

  let prompt;
  if (q.type === 'A') prompt = t('qTypeADef', word);
  else if (q.type === 'B') prompt = (
    <>
      <span>{t('qTypeBFill')}</span>
      <span style={{ display: 'block', marginTop: 8,
                     fontSize: mobile ? 18 : 22, fontStyle: 'italic',
                     color: 'var(--gd-ink-700)',
                     ...(meta.script === 'latin' ? { fontVariationSettings: '"opsz" 32' } : {}) }}>
        “{q.prompt}”
      </span>
    </>
  );
  else prompt = t('qTypeCSynonym', word);

  // Re-style <em> inside the prompt to match script
  const styledPrompt = React.isValidElement(prompt)
    ? React.cloneElement(prompt, {
        children: React.Children.map(prompt.props.children, (c) =>
          typeof c === 'string' || !React.isValidElement(c) ? c
            : c.type === 'em'
              ? React.cloneElement(c, {
                  className: titleFont,
                  style: {
                    color: 'oklch(0.5 0.18 250)',
                    fontStyle: meta.script === 'latin' ? 'italic' : 'normal',
                    ...(meta.script === 'latin' ? { fontVariationSettings: '"opsz" 36' } : {}),
                  },
                })
              : c,
        ),
      })
    : prompt;

  return (
    <>
      <div className={titleFont}
           style={{
             fontSize: mobile ? 19 : 22, lineHeight: 1.35,
             color: 'var(--gd-ink-900)',
             ...(meta.script === 'latin' ? { fontVariationSettings: '"opsz" 28', fontWeight: 400 } : {}),
           }}>
        {styledPrompt}
      </div>

      <div className="mt-5 grid gap-2.5">
        {q.options.map((opt, i) => {
          let state = 'idle';
          if (!revealed && selectedIdx === i) state = 'selected';
          if (revealed) {
            if (opt.correct) state = 'correct';
            else if (selectedIdx === i) state = 'wrong';
            else state = 'dim';
          }
          return <QuizOption key={i} locale={locale} mobile={mobile} rtl={rtl} state={state}>{opt.text}</QuizOption>;
        })}
      </div>

      {revealed && (
        <div className="mt-5"
             style={{
               background: q.options[selectedIdx]?.correct
                 ? 'oklch(0.96 0.04 150 / 0.5)'
                 : 'oklch(0.96 0.04 80 / 0.7)',
               borderInlineStart: q.options[selectedIdx]?.correct
                 ? '3px solid oklch(0.55 0.18 150 / 0.7)'
                 : '3px solid oklch(0.78 0.13 75 / 0.8)',
               borderRadius: 10,
               padding: '14px 16px',
             }}>
          <div className="font-sans-ui font-semibold"
               style={{ fontSize: 12.5, color: 'var(--gd-ink-700)',
                        letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {q.options[selectedIdx]?.correct ? t('yesCorrect') : t('notQuite')}
          </div>
          <p className={`mt-1.5 ${meta.script === 'he' ? 'rtl-body' : meta.script === 'ar' ? 'rtl-body' : ''}`}
             style={{ fontSize: mobile ? 13.5 : 14.5, lineHeight: 1.55, color: 'var(--gd-ink-900)' }}>
            {q.options[selectedIdx]?.correct ? q.explainRight : q.explainWrong}
          </p>
        </div>
      )}
    </>
  );
}

// Final score screen
function QuizFinal({ t, locale, mobile, rtl, correct, total, missed }) {
  const meta = LOCALE_META[locale];
  const numFont = 'font-display';
  return (
    <div style={{ textAlign: 'center', paddingBlock: mobile ? 20 : 30 }}>
      <Eyebrow style={{ color: 'oklch(0.5 0.18 250)' }}>{t('practiceEyebrow')}</Eyebrow>
      <div className={numFont}
           style={{
             marginTop: 12,
             fontSize: mobile ? 100 : 144,
             lineHeight: 1,
             color: 'var(--gd-ink-900)',
             fontVariationSettings: '"opsz" 144',
             letterSpacing: '-0.04em',
             fontWeight: 400,
           }}>
        <span style={{ color: 'oklch(0.5 0.18 250)' }}>{correct}</span>
        <span style={{ color: 'var(--gd-ink-300)', margin: '0 0.05em' }}>/</span>
        <span>{total}</span>
      </div>
      <p className={`mt-3 ${meta.script === 'latin' ? 'font-display' : meta.script === 'he' ? 'font-he' : 'font-ar'}`}
         style={{
           fontSize: mobile ? 17 : 19, color: 'var(--gd-ink-700)',
           ...(meta.script === 'latin' ? { fontVariationSettings: '"opsz" 24', fontStyle: 'italic' } : {}),
         }}>
        {t('youGotNofM', correct, total)}
      </p>

      {missed && missed.length > 0 && (
        <details className="mt-6 mx-auto" style={{ maxWidth: 420, textAlign: rtl ? 'right' : 'left' }}>
          <summary className="font-sans-ui cursor-pointer"
            style={{ fontSize: 13, color: 'oklch(0.5 0.18 250)' }}>
            {t('reviewMistakes')}
          </summary>
          <ul className="mt-3 space-y-2 font-sans-ui">
            {missed.map((m, i) => (
              <li key={i} className="flex items-start gap-2"
                  style={{ fontSize: 13, color: 'var(--gd-ink-700)', lineHeight: 1.5 }}>
                <span style={{ color: 'oklch(0.58 0.2 35)' }}>·</span>
                <span>Q{m.n}: {m.summary}</span>
              </li>
            ))}
          </ul>
        </details>
      )}

      <div className={`mt-7 flex items-center justify-center gap-3 ${rtl ? 'flex-row-reverse' : ''}`}>
        <button className="font-sans-ui font-medium"
          style={{
            fontSize: 14, padding: '12px 20px', borderRadius: 12,
            color: 'white',
            background: 'linear-gradient(180deg, oklch(0.78 0.17 245), oklch(0.62 0.2 250))',
            boxShadow: '0 0 0 1px oklch(0.5 0.2 250 / 0.6), 0 8px 22px oklch(0.5 0.2 250 / 0.4)',
          }}>
          {t('practiceAnotherWord')}
        </button>
        <button className="font-sans-ui"
          style={{
            fontSize: 14, padding: '12px 20px', borderRadius: 12,
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

// The quiz modal/page
function QuizModal({
  t, locale, mobile = false, rtl = false,
  word = 'dream',
  qIndex = 0,                   // 0..3
  total = 4,
  question,                     // q object
  selectedIdx = null,
  revealed = false,             // showing explanation?
  isLast = false,
  finalState = null,            // null | { correct, missed }
}) {
  const meta = LOCALE_META[locale];
  const titleFont = meta.script === 'he' ? 'font-he' : meta.script === 'ar' ? 'font-ar' : 'font-display';

  if (finalState) {
    return (
      <div role="dialog" aria-modal="true"
        style={{ width: mobile ? '100%' : 'min(580px, calc(100vw - 64px))', maxWidth: '100%', margin: '0 auto' }}>
        <div className="gd-card relative" style={{ padding: mobile ? '24px 22px 26px' : '36px 36px 32px' }}>
          <button aria-label={t('closeLabel')}
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
          <QuizFinal t={t} locale={locale} mobile={mobile} rtl={rtl}
            correct={finalState.correct} total={total} missed={finalState.missed} />
        </div>
      </div>
    );
  }

  const submitLabel = !revealed ? t('submit') : (isLast ? t('finish') : t('nextQuestion'));
  const submitDisabled = !revealed && selectedIdx === null;

  return (
    <div role="dialog" aria-modal="true"
      style={{ width: mobile ? '100%' : 'min(620px, calc(100vw - 64px))', maxWidth: '100%', margin: '0 auto' }}>
      <div className="gd-card relative" style={{
        padding: mobile ? '22px 22px 26px' : '30px 36px 32px',
        textAlign: rtl ? 'right' : 'left',
      }}>
        {/* close X */}
        <button aria-label={t('closeLabel')}
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

        {/* header row: eyebrow+title vs progress */}
        <div className={`flex items-start ${rtl ? 'flex-row-reverse' : ''} justify-between gap-3`}>
          <div>
            <Eyebrow style={{ color: 'oklch(0.5 0.18 250)' }}>{t('practiceEyebrow')}</Eyebrow>
            <h2 className={`mt-1.5 ${titleFont}`}
                style={{
                  fontSize: mobile ? 22 : 26, lineHeight: 1.2,
                  color: 'var(--gd-ink-900)',
                  ...(meta.script === 'latin' ? { fontVariationSettings: '"opsz" 36', fontWeight: 400, letterSpacing: '-0.01em' } : {}),
                }}>
              {(() => {
                const titleEl = t('quizTitle', word);
                return React.cloneElement(titleEl, {
                  children: React.Children.map(titleEl.props.children, (c) => {
                    if (typeof c !== 'string') return c;
                    // Word + dash combined; style word
                    return c;
                  }),
                });
              })()}
            </h2>
          </div>
          {/* progress + segmented pips */}
          <div className={`text-${rtl ? 'left' : 'right'}`} style={{ paddingTop: 4 }}>
            <div className="font-sans-ui"
                 style={{ fontSize: 11.5, color: 'var(--gd-ink-500)',
                          letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
              {t('questionNofM', qIndex + 1, total)}
            </div>
            <div className={`mt-2 flex items-center gap-1.5 ${rtl ? 'justify-start' : 'justify-end'}`}>
              {Array.from({ length: total }).map((_, i) => (
                <span key={i}
                  style={{
                    width: i === qIndex ? 14 : 6, height: 6, borderRadius: 999,
                    background: i < qIndex
                      ? 'oklch(0.5 0.18 250 / 0.7)'
                      : i === qIndex
                        ? 'oklch(0.5 0.18 250)'
                        : 'oklch(0 0 0 / 0.12)',
                    transition: 'all 0.2s',
                  }}/>
              ))}
            </div>
          </div>
        </div>

        {/* divider */}
        <div className="my-5" style={{ height: 1, background: 'oklch(0 0 0 / 0.07)' }} />

        {/* question */}
        <QuizQuestion t={t} locale={locale} rtl={rtl} mobile={mobile}
          q={question} word={word} selectedIdx={selectedIdx} revealed={revealed} />

        {/* submit */}
        <div className={`mt-6 flex items-center ${rtl ? 'justify-start' : 'justify-end'}`}>
          <button
            disabled={submitDisabled}
            className="font-sans-ui font-medium"
            style={{
              fontSize: 14, padding: '12px 22px', borderRadius: 12,
              background: submitDisabled
                ? 'oklch(0 0 0 / 0.06)'
                : 'linear-gradient(180deg, oklch(0.78 0.17 245), oklch(0.62 0.2 250))',
              color: submitDisabled ? 'var(--gd-ink-400)' : 'white',
              boxShadow: submitDisabled
                ? 'inset 0 0 0 1px oklch(0 0 0 / 0.08)'
                : '0 0 0 1px oklch(0.5 0.2 250 / 0.6), 0 8px 22px oklch(0.5 0.2 250 / 0.4)',
              cursor: submitDisabled ? 'not-allowed' : 'pointer',
            }}>
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// Scene wrapper — same pattern as Compose
function QuizScene({ t, locale, mobile = false, rtl = false, modalProps = {} }) {
  if (mobile) {
    return (
      <div className="gd-stage relative" style={{ minHeight: 720, overflow: 'hidden' }}>
        <div className="gd-stars" />
        <div className="relative" style={{ zIndex: 2 }}>
          <MobileHeader />
          <div style={{ paddingInline: 16, paddingBlockStart: 18, paddingBlockEnd: 30 }}>
            <QuizModal t={t} locale={locale} mobile rtl={rtl} {...modalProps} />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="gd-stage relative" style={{ minHeight: 880, overflow: 'hidden' }}>
      <div className="gd-stars" />
      <div className="absolute inset-0" style={{
        background: 'oklch(0.12 0.04 265 / 0.55)',
        backdropFilter: 'blur(14px)', zIndex: 1,
      }}/>
      <div className="relative flex items-start justify-center"
           style={{ zIndex: 2, minHeight: 880, padding: '60px 32px' }}>
        <QuizModal t={t} locale={locale} rtl={rtl} {...modalProps} />
      </div>
    </div>
  );
}

Object.assign(window, { QuizScene, QuizModal, QUIZ_DATA });
