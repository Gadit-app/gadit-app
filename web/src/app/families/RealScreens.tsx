"use client";

import Image from "next/image";

/**
 * Real app screens for the Families landing page (Gadi 2026-09-28, after the
 * Yooniz landing): instead of illustrations, every step and every tool is
 * shown on the actual Gadit screen. Screens are captured from a seeded demo
 * family (mom מיכל, kids נועה 9 and איתי 11) at phone size and live in
 * public/fam/screens/{lang}/{name}.webp. he + en for now; other languages
 * keep the previous illustrated sections until their screens are captured.
 */

export type RealStep = { t: string; b: string; img: string };
export type RealTool = { kicker: string; title: string; body: string; points: string[]; img: string; img2?: string };
export type RealCopy = {
  /** Short proof points under the hero CTA (replace the old trust line + bar). */
  heroPoints: string[];
  /** Credibility pill above the H1 (Yooniz-style hero). */
  credPill: string;
  /** Under the hero CTA: card required, the reminder email, cancel (council 2026-10-08). */
  ctaNote?: string;
  /** Immigrant families section (council 2026-10-08). */
  olim?: { kicker: string; title: string; body: string };
  /** Secondary hero button that scrolls to "how it works". */
  howCta: string;
  /** Header start button label. */
  topCta: string;
  /** The pain section, in Gadi's own words (2026-09-28). */
  pain: { title: string; lead: string; paras: string[]; strong: string; reframe: string };
  howKicker: string;
  howTitle: string;
  steps: RealStep[];
  dash: RealTool;
  tools: RealTool[];
  shotAlt: string;
};

export const REAL_COPY: Record<string, RealCopy> = {
  he: {
    heroPoints: ["עד 5 ילדים", "תמונה לכל משמעות", "לוח בקרה להורה"],
    credPill: "הצוות של Gadit לימד יותר מ-15,000 לומדים ב-15 שנה",
    ctaNote: "נדרש כרטיס אשראי, והחיוב הראשון רק בתום 14 הימים. יומיים לפני כן נשלח תזכורת במייל. ביטול בלחיצה, בלי טלפון.",
    olim: {
      kicker: "גם בשפת הבית",
      title: "כשאתם לא תמיד יכולים להסביר מילה בעברית",
      body: "Gadit מסביר לילד כל מילה בעברית פשוטה, עם תמונה ודוגמאות. את ההסבר אפשר לקבל גם בשפה שמדברים אצלכם בבית. כך הילד מבין לבד, ואתם רואים בלוח ההורה מה הוא למד.",
    },
    howCta: "איך זה עובד",
    topCta: "התחילו עכשיו",
    pain: {
      title: "למה שיעורי הבית נמרחים?",
      lead: "נועה יודעת את החומר. היא פשוט לא הבינה את השאלה.",
      paras: [
        "לפעמים מה שעוצר אותה זו מילה אחת. מילה שהיא לא מכירה, או מכירה רק בערך. היא לא שואלת, היא מנחשת וממשיכה. וככה, בחשבון, במדעים או בהיסטוריה, היא עונה לא נכון על חומר שהיא דווקא יודעת.",
        "ואתם? שוב יושבים לידה, מסבירים מילה אחרי מילה ומנסים להבין מה בדיוק לא ברור.",
      ],
      strong: "חסרות לה מילים. וזה נוגע בהרבה יותר מציון: ילד שלא מבין מתחיל להאמין שהוא פשוט לא טוב בזה.",
      reframe: "Gadit מסביר לה כל מילה במילים פשוטות ועם תמונה. בלי לקרוא לכם ובלי לנחש.",
    },
    howKicker: "איך זה עובד",
    howTitle: "חמישה צעדים, ואוצר המילים מתחיל לגדול",
    shotAlt: "מסך אמיתי מתוך Gadit",
    steps: [
      { t: "מוסיפים את בני המשפחה", b: "לכל ילד שם, גיל וצבע. זה לוקח פחות מדקה. עד 5 ילדים וגם ההורה השני.", img: "add" },
      { t: "מחברים את המכשירים של הילדים", b: "הילד נכנס מהטלפון או מהטאבלט שלו עם קוד QR או קוד בן 6 ספרות, בלי סיסמה. אין לו מכשיר משלו? יש מסך משותף לילדים.", img: "pair" },
      { t: "הילד מחפש מילה", b: "כל מילה מוסברת בשפה של ילדים עם תמונה לכל משמעות, דוגמאות ומקור המילה.", img: "word" },
      { t: "כל מילה נשמרת במחברת שלו", b: "בלי ללחוץ על כלום. המחברת גדלה מילה אחרי מילה עם רצף ימים ויעד שבועי.", img: "notebook" },
      { t: "מתרגלים עד שהמילה נשארת", b: "משחקים וחידונים שנבנים מהמילים שהילד עצמו חיפש.", img: "play" },
    ],
    dash: {
      kicker: "שקיפות מלאה להורה",
      title: "רואים את אוצר המילים גדל מילה אחרי מילה",
      body: "בלוח ההורה רואים את כל הילדים במסך אחד: כמה מילים יש במחברת של כל אחד, כמה נוספו השבוע, רצף הימים והמילים האחרונות שחיפש.",
      points: ["כל הילדים במבט אחד", "מילים חדשות השבוע", "התראה כשהילד מחפש מילה, מיד או בסיכום יומי, ואפשר לכבות בכל רגע"],
      img: "dashboard",
      img2: "alerts",
    },
    tools: [
      {
        kicker: "צילום דף מהספר",
        title: "מצלמים דף מהספר, ומבינים כל מילה בו",
        body: "מצלמים או מדביקים טקסט ו-Gadit פותח אותו כך שאפשר ללחוץ על כל מילה ולקבל את המשמעות שלה. המילים הקשות מסומנות ומילה שכבר פתחו הופכת לירוקה.",
        points: ["צילום דף ישר מהמצלמה", "לחיצה על כל מילה", "הסבר של משפט שלם"],
        img: "read",
        img2: "read-word",
      },
      {
        kicker: "תרגול הכתבה",
        title: "מתכוננים להכתבה של בית הספר",
        body: "מדביקים את רשימת המילים של המורה ו-Gadit מקריא כל מילה בקול. הילד כותב ומקבל תשובה מיד. מילה שטעה בה חוזרת עד שהיא נכונה.",
        points: ["הקראה בקול, כמו בכיתה", "בדיקה של כתיב מדויק", "הודעה להורה בסיום"],
        img: "spell-set",
      },
      {
        kicker: "תגיד את זה",
        title: "שמעו משפט, ואז אמרו אותו בעצמכם",
        body: "כותבים משפט ובוחרים את השפה שלומדים. Gadit מקריא אותו בקול. הילד אומר אותו בעצמו ומקבל כוכבים על ההגייה.",
        points: ["הקראה בקול", "תרגול הגייה עם כוכבים", "הודעה להורה"],
        img: "say",
      },
    ],
  },
  en: {
    heroPoints: ["Up to 5 children", "A picture for every meaning", "30+ interface languages"],
    credPill: "15 years of experience with more than 15,000 parents and students",
    howCta: "How it works",
    topCta: "Start now",
    pain: {
      title: "Why does homework drag on?",
      lead: "They know the material. They just didn't understand the question.",
      paras: [
        "Sometimes what stops them is one word. A word they don't know, or only sort of know. They don't ask, they guess and move on. And so, in math, science or history, they answer wrong on material they actually know.",
        "And you? Sitting next to them again, explaining word after word, trying to work out what exactly isn't clear.",
      ],
      strong: "They're missing words. And it touches far more than a grade: a child who doesn't understand starts to believe they're just not good at this.",
      reframe: "Gadit explains every word in a second, in simple words and with a picture. Without calling you over, and without guessing.",
    },
    howKicker: "How it works",
    howTitle: "Five steps, and the vocabulary starts to grow",
    shotAlt: "A real Gadit screen",
    steps: [
      { t: "Add your family members", b: "Each child with a name, age and color, in under a minute. Up to 5 children, plus the other parent.", img: "add" },
      { t: "Connect your children's devices", b: "Your child signs in on their own phone or tablet with a QR code or a 6-digit code, no password. No device of their own? There's a shared kids screen.", img: "pair" },
      { t: "Your child looks up a word", b: "Every word is explained in kids' language, with a picture for every meaning, examples and the word's origin.", img: "word" },
      { t: "Every word is saved to their notebook", b: "Without tapping anything. The notebook grows word by word, with a day streak and a weekly goal.", img: "notebook" },
      { t: "Practice until the word stays", b: "Games and quizzes built from the words your child looked up.", img: "play" },
    ],
    dash: {
      kicker: "Full transparency for parents",
      title: "Watch the vocabulary grow, word by word",
      body: "The parent board shows all your children on one screen: how many words are in each notebook, how many were added this week, the day streak and the latest words they looked up.",
      points: ["All your children at a glance", "New words this week", "An alert when your child looks up a word, instantly or as a daily summary"],
      img: "dashboard",
      img2: "alerts",
    },
    tools: [
      {
        kicker: "Every Word",
        title: "Photograph a page, and understand every word on it",
        body: "Photograph or paste a text, and Gadit opens it so you can tap any word and get its meaning. Hard words are highlighted, and a word you've opened turns green.",
        points: ["Photograph a page with the camera", "Tap any word", "Understand a whole sentence"],
        img: "read",
        img2: "read-word",
      },
      {
        kicker: "Spelling practice",
        title: "Get ready for the school dictation",
        body: "Paste the teacher's word list, and Gadit reads each word out loud. Your child writes it, gets an answer right away, and a missed word comes back until it's right.",
        points: ["Read out loud, like in class", "Exact spelling check", "A message to the parent when done"],
        img: "spell-set",
      },
      {
        kicker: "Say it",
        title: "Hear a sentence, then say it yourself",
        body: "Type a sentence and choose the language you're learning. Gadit shows how to say it and reads it out loud, then your child says it and gets stars for pronunciation.",
        points: ["Read out loud", "Pronunciation practice with a score", "A message to the parent"],
        img: "say",
      },
      {
        kicker: "The meaning from the sentence",
        title: "One word, the right meaning",
        body: "Many words have more than one meaning. Type the sentence the word appeared in, and Gadit picks the meaning that fits it exactly.",
        points: ["One precise definition", "Works in any language"],
        img: "context",
      },
    ],
  },
};

/** Landing copy rule (Gadi 2026-09-28): a new sentence never continues on
 *  the same line. Each sentence (and a clause after a colon) gets its own line. */
export function Lines({ text }: { text: string }) {
  const parts = text.split(/(?<=[.?!:])\s+/).filter(Boolean);
  return (
    <>
      {parts.map((t, i) => (
        <span key={i} style={{ display: "block" }}>{t}</span>
      ))}
    </>
  );
}

export function PhoneShot({ lang, name, alt, priority = false }: { lang: string; name: string; alt: string; priority?: boolean }) {
  return (
    <div className="fam-phone">
      <div className="fam-phone-screen">
        <Image
          src={`/fam/screens/${lang}/${name}.webp`}
          alt={alt}
          width={780}
          height={1688}
          sizes="(max-width: 760px) 70vw, 300px"
          priority={priority}
        />
      </div>
    </div>
  );
}

export const REAL_CSS = `
.fam-phone {
  width: 100%;
  max-width: 290px;
  margin: 0 auto;
  background: #0E1116;
  border-radius: 38px;
  padding: 9px;
  box-shadow: 0 24px 56px rgba(11,18,32,0.22), 0 6px 16px rgba(11,18,32,0.12);
}
.fam-phone-screen { border-radius: 30px; overflow: hidden; line-height: 0; background: #F2F6F4; aspect-ratio: 390 / 844; }
.fam-phone-screen img { width: 100%; height: 100%; object-fit: cover; object-position: top; display: block; }
.fam-real-hero { display: flex; justify-content: center; align-items: center; max-width: 560px; margin: 0 auto; padding: 18px 0 26px; }
.fam-real-hero .fam-phone { max-width: 250px; flex: 1 1 0; }
.fam-real-hero .fam-phone:first-child { transform: rotate(5deg) translateY(10px); z-index: 2; margin-inline-end: -36px; }
.fam-real-hero .fam-phone:last-child { transform: rotate(-6deg) translateY(34px); z-index: 1; }
.fam-rtop { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 24px; background: #fff; border-bottom: 1px solid rgba(31,41,55,0.08); }
.fam-rtop-end { display: flex; align-items: center; gap: 10px; }
/* Keep the header CTA on one line on narrow phones (QA 2026-10-08). */
@media (max-width: 400px) { .fam-rtop .fam-rtop-cta { white-space: nowrap; padding: 8px 11px; font-size: 12.5px; } }
.fam-rtop-cta { background: #0EA5A5; color: #fff; border: 0; border-radius: 999px; padding: 10px 20px; font-weight: 700; font-size: 14.5px; cursor: pointer; box-shadow: 0 6px 16px rgba(14,165,165,0.28); font-family: inherit; }
.fam-rtop-avatar { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; background: #E3F4F3; color: #0b7d7d; display: inline-flex; align-items: center; justify-content: center; font-weight: 800; text-decoration: none; overflow: hidden; }
.fam-rtop-lang { border: 1px solid rgba(31,41,55,0.14); border-radius: 999px; padding: 2px 6px; }
.fam-hero-real { background: radial-gradient(90% 70% at 85% 0%, rgba(14,165,165,0.10) 0%, rgba(14,165,165,0) 60%), linear-gradient(180deg, #EEF7F6 0%, #FFFFFF 70%); max-width: none; }
.fam-hero-real .fam-hero-grid { max-width: 1060px; margin: 0 auto; }
.fam-cred-pill { display: inline-flex; align-items: center; gap: 10px; background: #fff; border-radius: 999px; padding: 7px 16px 7px 12px; font-weight: 700; font-size: 14px; color: #1f2937; box-shadow: 0 4px 14px rgba(31,41,55,0.08); margin-bottom: 18px; }
.fam-cred-dots { display: inline-flex; }
.fam-cred-dots i { width: 14px; height: 14px; border-radius: 50%; border: 2px solid #fff; margin-inline-start: -5px; }
.fam-hero-ctas { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
.fam-cta-ghost { background: #fff; color: #0b7d7d; border: 1.5px solid rgba(14,165,165,0.35); border-radius: 999px; padding: 14px 24px; font-weight: 700; font-size: 16px; cursor: pointer; text-decoration: none; font-family: inherit; }
.fam-real-steps { display: grid; gap: 40px; margin: 28px auto 0; max-width: 780px; }
.fam-real-step { display: grid; grid-template-columns: 1fr 260px; gap: 40px; align-items: center; text-align: start; }
.fam-real-step:nth-child(even) { grid-template-columns: 260px 1fr; }
.fam-real-step:nth-child(even) .fam-real-step-text { order: 2; }
.fam-real-step-num {
  display: inline-flex; align-items: center; justify-content: center;
  width: 34px; height: 34px; border-radius: 50%;
  background: #0EA5A5; color: #fff; font-weight: 800; font-size: 16px; margin-bottom: 10px;
}
.fam-real-step-title { font-size: 22px; font-weight: 800; color: #111827; margin: 0 0 8px; line-height: 1.3; text-wrap: balance; }
.fam-real-step-body { font-size: 16.5px; line-height: 1.7; color: #374151; margin: 0; }
.fam-real-pair { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; align-items: start; }
.fam-real-pair .fam-phone { max-width: 230px; }
.fam-hero-points { list-style: none; padding: 0; margin: 18px 0 0; display: flex; flex-wrap: wrap; gap: 10px 22px; }
.fam-hero-points li { display: inline-flex; align-items: center; gap: 7px; font-size: 15px; font-weight: 600; color: #1f2937; }
.fam-hero-points li svg { flex: none; }
.fam-cta-note { margin: 12px 0 0; font-size: 13.5px; line-height: 1.6; color: #4b5563; max-width: 460px; }
.fam-cards-more { display: inline-block; margin-top: 24px; }
@media (max-width: 760px) { .fam-cta-note { margin-inline: auto; text-align: center; } }
.fam-pain-lead { font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 14px; text-wrap: balance; }
.fam-real-points { list-style: none; padding: 0; margin: 14px 0 0; display: grid; gap: 8px; }
.fam-real-points li { display: flex; gap: 8px; align-items: flex-start; font-size: 15.5px; color: #1f2937; font-weight: 600; }
.fam-real-points li::before { content: ""; flex: none; width: 8px; height: 8px; margin-top: 8px; border-radius: 50%; background: #0EA5A5; }
@media (max-width: 760px) {
  .fam-hero-points { justify-content: center; }
  .fam-hero-ctas { justify-content: center; }
  .fam-rtop { padding: 10px 14px; }
  .fam-cred-pill { font-size: 12px; padding: 6px 12px 6px 10px; gap: 8px; white-space: nowrap; }
  .fam-cred-dots i { width: 11px; height: 11px; }
  .fam-real-hero .fam-phone { max-width: 190px; }
  .fam-real-step, .fam-real-step:nth-child(even) { grid-template-columns: 1fr; gap: 16px; }
  .fam-real-step:nth-child(even) .fam-real-step-text { order: 0; }
  .fam-phone { max-width: 250px; }
  .fam-real-pair .fam-phone { max-width: 170px; }
}

/* ── Premium layer (Gadi 2026-09-28, modeled on the Yooniz landing): generous
   section rhythm, white 32px cards on soft-tinted bands, layered shadows,
   a heavy 60px H1, glowing CTAs, a sticky blurred top bar. Scoped to
   .fam-premium so the illustrated (classic / other-language) page is untouched. */
.fam-premium {
  --pm-card: inset 0 1px 0 rgba(255,255,255,0.7), 0 2px 4px rgba(16,40,60,0.06), 0 28px 60px -24px rgba(16,40,60,0.30);
  --pm-soft: 0 0 0 1px rgba(15,72,68,0.04), 0 1px 2px rgba(15,72,68,0.05), 0 10px 28px -10px rgba(15,72,68,0.12);
  --pm-ink: #1E293B;
  --pm-body: #475569;
  --pm-tint: #F0F8F8;
}
.fam-premium .fam-rtop { position: sticky; top: 0; z-index: 60; background: rgba(255,255,255,0.86); backdrop-filter: saturate(160%) blur(12px); -webkit-backdrop-filter: saturate(160%) blur(12px); border-bottom: 1px solid rgba(15,72,68,0.08); padding: 14px 32px; }
.fam-premium .fam-hero { padding: 76px 24px 104px; }
.fam-premium .fam-h1 { font-size: clamp(40px, 5.2vw, 62px); font-weight: 800; letter-spacing: -0.035em; line-height: 1.06; color: var(--pm-ink); margin-bottom: 22px; }
.fam-premium .fam-whatis { font-size: 18px; line-height: 1.75; color: var(--pm-body); margin-bottom: 30px; }
.fam-premium .fam-band { padding: 108px 0; border-top: 0; }
.fam-premium .fam-band-cream { background: var(--pm-tint); }
.fam-premium .fam-band-white { background: #fff; }
.fam-premium .fam-band-purple { background: linear-gradient(160deg, #F5F1FF 0%, #FFFFFF 70%); }
.fam-premium .fam-h2 { font-size: clamp(30px, 3.4vw, 42px); font-weight: 800; letter-spacing: -0.02em; line-height: 1.15; color: var(--pm-ink); margin-bottom: 22px; text-wrap: balance; }
.fam-premium .fam-kicker { margin-bottom: 16px; letter-spacing: 0.08em; font-size: 13px; }
.fam-premium .fam-body { font-size: 17.5px; line-height: 1.85; color: var(--pm-body); }
.fam-premium .fam-reframe { font-size: 24px; line-height: 1.5; margin-top: 34px; }
.fam-premium .fam-pain-lead { font-size: 22px; margin-bottom: 26px; }
.fam-premium .fam-cta { box-shadow: 0 12px 26px -8px rgba(14,165,165,0.55); transition: transform .16s ease, box-shadow .16s ease; }
.fam-premium .fam-cta:hover { transform: translateY(-2px); box-shadow: 0 16px 32px -8px rgba(14,165,165,0.6); }
.fam-premium .fam-cta-ghost { box-shadow: var(--pm-soft); transition: transform .16s ease; }
.fam-premium .fam-cta-ghost:hover { transform: translateY(-2px); }
.fam-premium .fam-phone { box-shadow: 0 34px 70px -24px rgba(16,40,60,0.50), 0 10px 22px rgba(16,40,60,0.12); }
.fam-premium .fam-cred-pill { box-shadow: var(--pm-soft); }
/* steps: each a floating white card */
.fam-premium .fam-real-steps { max-width: 940px; gap: 34px; margin-top: 44px; }
.fam-premium .fam-real-step { background: #fff; border-radius: 32px; padding: 44px 52px; box-shadow: var(--pm-card); }
.fam-premium .fam-real-step, .fam-premium .fam-real-step:nth-child(even) { grid-template-columns: 1fr 1fr; gap: 24px; }
.fam-premium .fam-real-step > .fam-phone { max-width: 270px; }
.fam-premium .fam-real-step-text { padding-inline: 12px 8px; }
.fam-premium .fam-real-step-title { font-size: 26px; color: var(--pm-ink); }
.fam-premium .fam-real-step-body { font-size: 17px; line-height: 1.8; color: var(--pm-body); }
.fam-premium .fam-band-white:has(.fam-real-steps) { background: linear-gradient(180deg, #FFFFFF 0%, var(--pm-tint) 18%, var(--pm-tint) 100%); }
/* features: big white card on the band */
.fam-premium .fam-feature { max-width: 1100px; background: #fff; border-radius: 32px; padding: 60px 64px; gap: 60px; box-shadow: var(--pm-card); }
.fam-premium .fam-band-white .fam-feature { box-shadow: var(--pm-card), 0 0 0 1px rgba(15,72,68,0.05); }
.fam-premium .fam-real-points { margin-top: 22px; gap: 12px; }
/* summary grid + other cards */
.fam-premium .fam-how-steps { gap: 22px; margin-top: 34px; }
.fam-premium .fam-mock { border-radius: 22px; border-color: rgba(15,72,68,0.06); box-shadow: var(--pm-soft); }
.fam-premium .fam-chain-turn { background: #fff; border-radius: 32px; box-shadow: var(--pm-card); border: 0; padding: 40px 36px; margin-top: 56px; }
.fam-premium .fam-compare { border-radius: 28px; overflow: hidden; box-shadow: var(--pm-card); border: 0; background: #fff; }
.fam-premium .fam-price-card { border-radius: 32px; box-shadow: var(--pm-card); }
.fam-premium .fam-guarantee { border-radius: 24px; box-shadow: var(--pm-soft); }
.fam-premium .fam-faq-item { border-radius: 20px; box-shadow: var(--pm-soft); border: 0; background: #fff; margin-bottom: 12px; }
.fam-premium .fam-inline-img img, .fam-premium .fam-final-img { border-radius: 28px; box-shadow: var(--pm-card); overflow: hidden; }
.fam-premium .fam-list { background: #fff; border-radius: 28px; box-shadow: var(--pm-card); padding: 34px 38px; }
@media (max-width: 760px) {
  .fam-premium .fam-rtop { padding: 10px 14px; }
  .fam-premium .fam-hero { padding: 40px 18px 64px; }
  .fam-premium .fam-band { padding: 68px 0; }
  .fam-premium .fam-real-step { padding: 28px 22px; border-radius: 26px; }
  .fam-premium .fam-real-step, .fam-premium .fam-real-step:nth-child(even) { grid-template-columns: 1fr; gap: 20px; }
  .fam-premium .fam-real-step:nth-child(even) .fam-real-step-text { order: 0; }
  .fam-premium .fam-real-step > .fam-phone { max-width: 230px; }
  .fam-premium .fam-real-step-title { font-size: 22px; }
  .fam-premium .fam-feature { padding: 30px 22px; border-radius: 26px; gap: 26px; margin-inline: 14px; }
  .fam-premium .fam-reframe { font-size: 20px; }
  .fam-premium .fam-chain-turn { padding: 28px 20px; }
}

/* Fit-to-screen (Gadi 2026-09-29, 14.5" laptop): on desktop the hero and every
   section should fit one screen, like the Yooniz landing. Sizes scale with
   the viewport HEIGHT as well as width. */
@media (min-width: 880px) {
  .fam-premium .fam-hero { min-height: calc(100svh - 68px); display: grid; align-content: center; padding: clamp(20px, 4vh, 48px) 24px clamp(24px, 5vh, 56px); }
  .fam-premium .fam-h1 { font-size: clamp(34px, min(3.8vw, 7.4vh), 60px); margin-bottom: clamp(12px, 2vh, 20px); }
  .fam-premium .fam-whatis { font-size: clamp(15px, min(1.25vw, 2.4vh), 18px); line-height: 1.7; margin-bottom: clamp(16px, 3vh, 28px); }
  .fam-premium .fam-cred-pill { margin-bottom: clamp(10px, 2vh, 18px); font-size: clamp(12px, 1.9vh, 14px); }
  .fam-premium .fam-cta { padding-block: clamp(11px, 1.9vh, 16px); font-size: clamp(15px, 2.3vh, 18px); }
  .fam-premium .fam-cta-ghost { padding-block: clamp(10px, 1.8vh, 14px); font-size: clamp(14px, 2.2vh, 16px); }
  .fam-premium .fam-hero-points { margin-top: clamp(10px, 2vh, 18px); }
  .fam-premium .fam-real-hero { padding: 0; }
  .fam-premium .fam-real-hero .fam-phone { max-width: min(240px, 30vh); }
  .fam-premium .fam-band { padding: clamp(48px, 9vh, 104px) 0; }
  .fam-premium .fam-h2 { font-size: clamp(26px, min(3vw, 5.4vh), 40px); }
  .fam-premium .fam-real-step { padding: clamp(24px, 4vh, 44px) 52px; }
  .fam-premium .fam-real-step > .fam-phone { max-width: min(270px, 30vh); }
  .fam-premium .fam-feature { padding: clamp(28px, 5vh, 60px) 64px; }
  .fam-premium .fam-feature-visual > .fam-phone { max-width: min(270px, 31vh); }
  .fam-premium .fam-real-pair .fam-phone { max-width: min(220px, 27vh); }
}
`;
