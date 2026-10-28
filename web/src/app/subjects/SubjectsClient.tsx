"use client";

/**
 * /subjects: key words by subject (מילות מפתח במקצועות, Gadi 2026-10-26),
 * for Family and Individual. Pick a subject, then a topic, and see its key
 * words, each with ONLY the meaning that fits the subject. Tapping a word
 * opens the word page in context mode (?sentence=), so it explains just that
 * meaning. Hebrew, English and (once its data exists) German.
 *
 * Data: /api/subjects (read-only, paying plans). Nothing is saved unless the
 * reader taps "add these words to my notebook".
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ToolPage } from "@/components/design/ToolPage";
import { TTSButton } from "@/components/design/TTSButton";
import { WaitDots } from "@/components/WaitText";
import { AppIntentPing } from "@/components/AppIntentPing";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref, wordPath } from "@/lib/href";
import { playNotActive } from "@/lib/play-copy";
import { misc } from "@/lib/misc-i18n";
import { track } from "@/lib/track";
import { subjectsLangFor, type SubjectsUiLang } from "@/lib/subjects-langs";

type Age = "younger" | "older";
type Topic = { id: string; title: string; age: Age };
/** One subject card of one level: the cards differ by level (elementary first). */
type Subject = { key: string; age: Age; name: string; icon: string; topics: Topic[] };
type TopicWords = { id: string; subject: string; subjectName: string; icon?: string; title: string; age: Age; words: Array<{ w: string; d: string }> };

const STR = {
  he: {
    title: "מילות מפתח במקצועות",
    sub: "בוחרים מקצוע ונושא ורואים את המילים החשובות שלו, כל מילה עם הפירוש שמתאים למקצוע.",
    ageAria: "גיל",
    younger: "צעירים",
    older: "בוגרים",
    pickSubject: "בחרו מקצוע",
    topics: (n: number) => (n === 1 ? "נושא אחד" : `${n} נושאים`),
    allSubjects: "כל המקצועות",
    allTopics: "כל הנושאים",
    pickTopic: "בחרו נושא",
    words: (n: number) => (n === 1 ? "מילה אחת" : `${n} מילים`),
    tapHint: "לחיצה על מילה פותחת הסבר מלא שלה, בדיוק במשמעות של המקצוע הזה.",
    listen: "האזנה",
    add: "הוספת המילים למחברת",
    adding: "מוסיפים למחברת",
    addedPlay: "נוספו למחברת. אפשר לתרגל אותן במשחקים",
    playLink: "למשחקים",
    addedNb: "נוספו למחברת",
    nbLink: "למחברת",
    addErr: "לא הצלחנו להוסיף את כל המילים. נסו שוב.",
    loadErr: "משהו השתבש. נסו לרענן את הדף.",
    empty: "עדיין אין נושאים לגיל הזה.",
    loginTitle: "התחברו כדי לראות את מילות המפתח במקצועות",
    loginBtn: "התחברות",
    lockedTitle: "מילות המפתח במקצועות הן חלק מ-Individual ומ-Family",
    lockedBody: "בכל מקצוע ונושא: המילים החשובות, כל מילה עם הפירוש שמתאים למקצוע.",
  },
  en: {
    title: "Key words by subject",
    sub: "Pick a subject and a topic to see its key words, each with the meaning that fits the subject.",
    ageAria: "Age",
    younger: "Younger",
    older: "Older",
    pickSubject: "Pick a subject",
    topics: (n: number) => (n === 1 ? "1 topic" : `${n} topics`),
    allSubjects: "All subjects",
    allTopics: "All topics",
    pickTopic: "Pick a topic",
    words: (n: number) => (n === 1 ? "1 word" : `${n} words`),
    tapHint: "Tap a word for its full explanation, in exactly this subject's meaning.",
    listen: "Listen",
    add: "Add these words to my notebook",
    adding: "Adding to your notebook",
    addedPlay: "Added to your notebook. Practice them in Play",
    playLink: "Go to Play",
    addedNb: "Added to your notebook",
    nbLink: "Open my notebook",
    addErr: "Some words could not be added. Please try again.",
    loadErr: "Something went wrong. Please refresh the page.",
    empty: "No topics for this age yet.",
    loginTitle: "Sign in to see key words by subject",
    loginBtn: "Sign in",
    lockedTitle: "Key words by subject is part of Individual and Family",
    lockedBody: "For every subject and topic: the key words, each with the meaning that fits the subject.",
  },
  // Swiss spelling (ss, never ß), the informal "du" of family apps.
  de: {
    title: "Schlüsselwörter nach Fach",
    sub: "Wähle ein Fach und ein Thema und sieh dir die wichtigsten Wörter an, jedes mit der Bedeutung, die zum Fach passt.",
    ageAria: "Alter",
    younger: "Jüngere",
    older: "Ältere",
    pickSubject: "Wähle ein Fach",
    topics: (n: number) => (n === 1 ? "1 Thema" : `${n} Themen`),
    allSubjects: "Alle Fächer",
    allTopics: "Alle Themen",
    pickTopic: "Wähle ein Thema",
    words: (n: number) => (n === 1 ? "1 Wort" : `${n} Wörter`),
    tapHint: "Tippe auf ein Wort: Es wird dir genau in der Bedeutung für dieses Fach erklärt.",
    listen: "Anhören",
    add: "Diese Wörter ins Notizbuch aufnehmen",
    adding: "Wird ins Notizbuch aufgenommen",
    addedPlay: "Ins Notizbuch aufgenommen. Übe sie in den Spielen",
    playLink: "Zu den Spielen",
    addedNb: "Ins Notizbuch aufgenommen",
    nbLink: "Zum Notizbuch",
    addErr: "Nicht alle Wörter konnten aufgenommen werden. Versuch es noch einmal.",
    loadErr: "Etwas ist schiefgelaufen. Lade die Seite neu.",
    empty: "Für dieses Alter gibt es noch keine Themen.",
    loginTitle: "Melde dich an, um die Schlüsselwörter nach Fach zu sehen",
    loginBtn: "Anmelden",
    lockedTitle: "Schlüsselwörter nach Fach gehören zu Individual und Family",
    lockedBody: "Zu jedem Fach und Thema die wichtigsten Wörter, jedes mit der Bedeutung, die zum Fach passt.",
  },
  // Modern Standard Arabic, the usual singular of app instructions.
  ar: {
    title: "الكلمات المفتاحية في المواد",
    sub: "اختر مادة وموضوعا لترى كلماته المهمة، كل كلمة بالمعنى الذي يناسب المادة.",
    ageAria: "العمر",
    younger: "الصغار",
    older: "الكبار",
    pickSubject: "اختر مادة",
    topics: (n: number) => (n === 1 ? "موضوع واحد" : n === 2 ? "موضوعان" : n <= 10 ? `${n} مواضيع` : `${n} موضوعا`),
    allSubjects: "كل المواد",
    allTopics: "كل المواضيع",
    pickTopic: "اختر موضوعا",
    words: (n: number) => (n === 1 ? "كلمة واحدة" : n === 2 ? "كلمتان" : n <= 10 ? `${n} كلمات` : `${n} كلمة`),
    tapHint: "اضغط على كلمة لترى شرحها الكامل، بمعناها في هذه المادة بالضبط.",
    listen: "استماع",
    add: "إضافة هذه الكلمات إلى دفتري",
    adding: "جار الإضافة إلى الدفتر",
    addedPlay: "أضيفت إلى الدفتر. يمكن التدرب عليها في الألعاب",
    playLink: "إلى الألعاب",
    addedNb: "أضيفت إلى الدفتر",
    nbLink: "إلى الدفتر",
    addErr: "لم نتمكن من إضافة كل الكلمات. حاول مرة أخرى.",
    loadErr: "حدث خطأ ما. حدّث الصفحة.",
    empty: "لا توجد مواضيع لهذا العمر بعد.",
    loginTitle: "سجّل الدخول لترى الكلمات المفتاحية في المواد",
    loginBtn: "تسجيل الدخول",
    lockedTitle: "الكلمات المفتاحية في المواد جزء من Individual وFamily",
    lockedBody: "في كل مادة وموضوع: الكلمات المهمة، كل كلمة بالمعنى الذي يناسب المادة.",
  },
} satisfies Record<SubjectsUiLang, Record<string, unknown>>;
type Strings = (typeof STR)[SubjectsUiLang];

/** The language name the dictionary stores a word under (notebook ids match its own saves). */
const WORD_LANGUAGE: Record<SubjectsUiLang, string> = { he: "Hebrew", en: "English", de: "German", ar: "Arabic" };

const AGE_KEY = "gadit_subjects_age";
const WIDTH = 760;

export function SubjectsClient() {
  const { user, plan, planReady, loading, promptLogin } = useAuth();
  const { lang } = useLang();
  const href = useHref();
  // Another UI language falls back to English (the menu shows the tab only in he/en/de/ar).
  const ui: SubjectsUiLang = subjectsLangFor(lang) ?? "en";
  const T = STR[ui];

  if (loading || (user && !planReady)) {
    return <ToolPage active="subjects" width={WIDTH} title={T.title}><div className="wb-subj-wait"><WaitDots className="gd-wait-big" /></div></ToolPage>;
  }
  if (!user) {
    return (
      <ToolPage active="subjects" width={WIDTH} title={T.title} sub={T.sub}>
        <div className="wb-subj-gate">
          <p className="wb-subj-gate-title">{T.loginTitle}</p>
          <button type="button" className="wb-subj-btn" onClick={() => promptLogin({ mode: "signin" })}>{T.loginBtn}</button>
        </div>
      </ToolPage>
    );
  }
  if (plan !== "clear" && plan !== "deep") {
    return (
      <ToolPage active="subjects" width={WIDTH} title={T.title}>
        <div className="wb-subj-gate">
          {/* Inside the Play / iOS app: one neutral line, no plan or link (store rules). */}
          <p className="wb-subj-gate-title gd-buy">{T.lockedTitle}</p>
          <p className="wb-subj-gate-body gd-buy">{T.lockedBody}</p>
          <p className="wb-subj-gate-title gd-play-only">{playNotActive(lang)}</p>
          <AppIntentPing feature="subjects" />
          <Link href={href("/pricing")} className="wb-subj-btn gd-buy">{misc("seePlans", ui)}</Link>
        </div>
      </ToolPage>
    );
  }
  return (
    <ToolPage active="subjects" width={WIDTH} title={T.title} sub={T.sub}>
      <SubjectsBrowser key={ui} ui={ui} deep={plan === "deep"} getToken={() => user.getIdToken()} />
    </ToolPage>
  );
}

/** The three steps (subject, topic, words). State lives in the address
 *  (?a=&s=&t=) so the browser's back button, and coming back from a word
 *  page, return to the same step. */
export function SubjectsBrowser({ ui, deep, getToken }: { ui: SubjectsUiLang; deep: boolean; getToken: () => Promise<string> }) {
  const T = STR[ui];
  const { familyRole } = useAuth();
  const sp = useSearchParams();
  const router = useRouter();
  const subjectKey = sp?.get("s") ?? "";
  const topicId = sp?.get("t") ?? "";
  const urlAge = sp?.get("a");

  // younger / older: the address first, then the last choice on this device,
  // then a child's profile starts on "younger".
  // (Rendered only in the browser, after sign-in, so storage can be read here.)
  const [savedAge, setSavedAge] = useState<Age | null>(() => {
    try {
      const v = typeof window === "undefined" ? null : localStorage.getItem(AGE_KEY);
      return v === "younger" || v === "older" ? v : null;
    } catch {
      return null;
    }
  });
  const age: Age = urlAge === "younger" || urlAge === "older" ? urlAge : savedAge ?? (familyRole === "kid" ? "younger" : "older");

  // The catalog, once per language.
  const [subjects, setSubjects] = useState<Subject[] | null>(null);
  const [loadErr, setLoadErr] = useState(false);

  const go = useCallback((next: { a?: Age; s?: string; t?: string }, replace = false) => {
    const q = new URLSearchParams();
    q.set("a", next.a ?? age);
    if (next.s) q.set("s", next.s);
    if (next.t) q.set("t", next.t);
    const url = `${window.location.pathname}?${q.toString()}`;
    if (replace) router.replace(url, { scroll: false });
    else router.push(url);
  }, [age, router]);

  // On a subject's page, a level that has the same subject stays on it
  // (geometry, history...); otherwise back to the subject cards.
  const setAge = (a: Age) => {
    setSavedAge(a);
    try { localStorage.setItem(AGE_KEY, a); } catch { /* storage blocked */ }
    const keep = subjectKey && (subjects ?? []).some((s) => s.key === subjectKey && s.age === a) ? subjectKey : undefined;
    go({ a, s: keep }, true);
  };

  useEffect(() => {
    // One language per mount (the parent keys this component by language).
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/subjects?lang=${ui}`, { headers: { Authorization: `Bearer ${await getToken()}` } });
        if (!res.ok) throw new Error(String(res.status));
        const j = (await res.json()) as { subjects?: Subject[] };
        if (!cancelled) setSubjects(j.subjects ?? []);
      } catch {
        if (!cancelled) setLoadErr(true);
      }
    })();
    track("subjects_open", { lang: ui });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui]);

  // The cards of this level, in the server's order (kids' most common first).
  const visible = useMemo(
    () => (subjects ?? []).filter((s) => s.age === age).map((s) => ({ ...s, topics: s.topics.filter((t) => t.age === age) })).filter((s) => s.topics.length > 0),
    [subjects, age],
  );
  // The card of this level; a link from another level still finds its subject.
  const subject = (subjects ?? []).find((s) => s.key === subjectKey && s.age === age) ?? (subjects ?? []).find((s) => s.key === subjectKey);

  if (loadErr) return <p className="wb-subj-note">{T.loadErr}</p>;

  if (topicId) {
    return <TopicView key={topicId} ui={ui} T={T} deep={deep} topicId={topicId} getToken={getToken} subject={subject} onBack={() => go({ s: subjectKey || undefined })} />;
  }
  if (!subjects) return <div className="wb-subj-wait"><WaitDots className="gd-wait-big" /></div>;

  if (subject) {
    const topics = subject.topics.filter((t) => t.age === age);
    return (
      <div className="wb-subj">
        <button type="button" className="wb-subj-back" onClick={() => go({})}>
          <BackArrow /> {T.allSubjects}
        </button>
        <div className="wb-subj-hero">
          <span className="wb-subj-hero-img"><img src={subject.icon} alt="" width={88} height={88} /></span>
          <div>
            <h2 className="wb-subj-h2">{subject.name}</h2>
            <div className="wb-subj-meta">{T.topics(topics.length)}</div>
          </div>
        </div>
        <AgeSwitch T={T} age={age} onAge={setAge} />
        {topics.length ? (
          <>
            <h3 className="wb-subj-h3">{T.pickTopic}</h3>
            <ul className="wb-subj-topics">
              {topics.map((t) => (
                <li key={t.id}>
                  <button type="button" className="wb-subj-topic" onClick={() => go({ s: subject.key, t: t.id })}>
                    <span className="wb-subj-topic-title">{t.title}</span>
                    <Chevron />
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="wb-subj-note">{T.empty}</p>
        )}
      </div>
    );
  }

  return (
    <div className="wb-subj">
      <AgeSwitch T={T} age={age} onAge={setAge} />
      <h2 className="wb-subj-h3">{T.pickSubject}</h2>
      {visible.length ? (
        <div className="wb-subj-grid">
          {visible.map((s) => (
            <button key={s.key} type="button" className="wb-subj-card" onClick={() => go({ s: s.key })}>
              <span className="wb-subj-card-img"><img src={s.icon} alt="" width={72} height={72} loading="lazy" /></span>
              <span className="wb-subj-card-name">{s.name}</span>
              <span className="wb-subj-card-meta">{T.topics(s.topics.length)}</span>
            </button>
          ))}
        </div>
      ) : (
        <p className="wb-subj-note">{T.empty}</p>
      )}
    </div>
  );
}

function AgeSwitch({ T, age, onAge }: { T: Strings; age: Age; onAge: (a: Age) => void }) {
  return (
    <div className="wb-subj-age" role="radiogroup" aria-label={T.ageAria}>
      {(["younger", "older"] as const).map((a) => (
        <button key={a} type="button" role="radio" aria-checked={age === a} className={age === a ? "is-on" : ""} onClick={() => onAge(a)}>
          {T[a]}
        </button>
      ))}
    </div>
  );
}

function TopicView({ ui, T, deep, topicId, getToken, subject, onBack }: {
  ui: SubjectsUiLang; T: Strings; deep: boolean; topicId: string; getToken: () => Promise<string>;
  subject?: Subject; onBack: () => void;
}) {
  const href = useHref();
  const [data, setData] = useState<TopicWords | null>(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/subjects?lang=${ui}&topic=${encodeURIComponent(topicId)}`, { headers: { Authorization: `Bearer ${await getToken()}` } });
        if (!res.ok) throw new Error(String(res.status));
        const j = (await res.json()) as TopicWords;
        if (!cancelled) setData(j);
      } catch {
        if (!cancelled) setErr(true);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui, topicId]);

  // "Add these words to my notebook": only on a tap, never by itself.
  const [adding, setAdding] = useState<"idle" | "busy" | "done" | "error">("idle");
  async function addAll() {
    if (!data || adding === "busy") return;
    setAdding("busy");
    const token = await getToken().catch(() => "");
    let failed = 0;
    const queue = [...data.words];
    const worker = async () => {
      for (let x = queue.shift(); x; x = queue.shift()) {
        try {
          const res = await fetch("/api/notebook", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            // A word already in the notebook comes back { alreadySaved } and is left as it is.
            body: JSON.stringify({ word: x.w, language: WORD_LANGUAGE[ui], meaning: x.d }),
          });
          if (!res.ok) failed++;
        } catch {
          failed++;
        }
      }
    };
    await Promise.all([worker(), worker(), worker()]);
    setAdding(failed ? "error" : "done");
    if (!failed) track("subjects_add_notebook", { lang: ui, n: data.words.length });
  }

  const back = (
    <button type="button" className="wb-subj-back" onClick={onBack}>
      <BackArrow /> {subject ? `${T.allTopics} · ${subject.name}` : T.allSubjects}
    </button>
  );
  if (err) return <div className="wb-subj">{back}<p className="wb-subj-note">{T.loadErr}</p></div>;
  if (!data) return <div className="wb-subj">{back}<div className="wb-subj-wait"><WaitDots className="gd-wait-big" /></div></div>;

  const icon = data.icon ?? subject?.icon ?? `/subjects/${data.subject}.webp`;
  return (
    <div className="wb-subj">
      {back}
      <div className="wb-subj-hero">
        <span className="wb-subj-hero-img"><img src={icon} alt="" width={88} height={88} /></span>
        <div>
          <div className="wb-subj-hero-cat">{data.subjectName}</div>
          <h2 className="wb-subj-h2">{data.title}</h2>
          <div className="wb-subj-meta">{T.words(data.words.length)}</div>
        </div>
      </div>
      <p className="wb-subj-hint">{T.tapHint}</p>
      <ul className="wb-subj-words">
        {data.words.map((x, i) => {
          // Context mode on the word page: the subject and the word open the
          // sentence (the dictionary caches context answers by its first 60 characters).
          const ctx = `${data.subjectName}: ${x.w}, ${x.d}`;
          return (
            <li key={`${x.w}-${i}`} className="wb-subj-word">
              <div className="wb-subj-word-head">
                <Link href={href(wordPath(x.w, `sentence=${encodeURIComponent(ctx)}`))} className="wb-subj-word-w">{x.w}</Link>
                <TTSButton text={x.w} audioLang={ui} useOpenAI ariaLabel={`${T.listen}: ${x.w}`} className="wb-subj-listen" />
              </div>
              <Link href={href(wordPath(x.w, `sentence=${encodeURIComponent(ctx)}`))} className="wb-subj-word-d" tabIndex={-1}>{x.d}</Link>
            </li>
          );
        })}
      </ul>
      <div className="wb-subj-add">
        {adding === "done" ? (
          <p className="wb-subj-added" role="status">
            {deep ? T.addedPlay : T.addedNb}
            <Link href={href(deep ? "/play" : "/notebook")} className="wb-subj-added-link">{deep ? T.playLink : T.nbLink}</Link>
          </p>
        ) : (
          <>
            <button type="button" className="wb-subj-btn" onClick={addAll} disabled={adding === "busy"}>
              {adding === "busy" ? <>{T.adding} <WaitDots /></> : T.add}
            </button>
            {adding === "error" && <p className="wb-subj-note" role="alert">{T.addErr}</p>}
          </>
        )}
      </div>
    </div>
  );
}

/** A back arrow that points the right way in both directions. */
function BackArrow() {
  return (
    <svg className="wb-subj-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}
function Chevron() {
  return (
    <svg className="wb-subj-arrow wb-subj-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}
