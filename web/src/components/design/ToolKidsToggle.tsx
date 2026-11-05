"use client";

/**
 * Kids Mode in the top bar, beside the logo (Gadi 2026-10-12: one small
 * switch for the whole app instead of a strip under every title). The
 * mascot is awake when Kids Mode is on and asleep when it is off, beside
 * the label "Kids" and a small on/off switch. Family members only.
 */
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useKidsMode } from "@/lib/use-kids-mode";
import { KIDS_BANNER_COPY } from "@/lib/kids-banner-copy";
import { simpleWordsLabel, useSimpleWords } from "@/lib/use-simple-words";

/** A small speech bubble with two short lines: plain talk. */
function SimpleIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 5.5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-9l-4.5 3.5V16.5H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1z" />
      <path d="M7.5 9.5h9M7.5 12.8h5.5" />
    </svg>
  );
}

/** "In simple words" for paid accounts without Kids Mode (Individual), Gadi 2026-11-05. */
export function SimpleWordsToggle({ compact }: { compact?: boolean }) {
  const { lang } = useLang();
  const [on, setOn] = useSimpleWords();
  const label = simpleWordsLabel(lang);
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} title={label} className={`wb-kids-mini wb-simple-mini${on ? " is-on" : ""}${compact ? " is-compact" : ""}`} onClick={() => setOn(!on)}>
      <span className="wb-simple-mini-icon"><SimpleIcon /></span>
      <span className="wb-kids-mini-label">{label}</span>
      <span className="wb-kids-mini-track" aria-hidden="true"><span /></span>
    </button>
  );
}

/** Just "Kids" (Gadi 2026-10-12: "Mode" dropped, the switch says the rest). */
const NAME: Record<string, string> = {
  en: "Kids", he: "ילדים", ar: "الأطفال", ru: "Дети", es: "Niños", pt: "Crianças",
  fr: "Enfants", de: "Kinder", cs: "Děti", sk: "Deti", it: "Bambini", ja: "キッズ",
  hi: "बच्चे", am: "ልጆች", uk: "Діти", tr: "Çocuklar", pl: "Dzieci", fa: "کودکان",
  id: "Anak", nl: "Kinderen", el: "Παιδιά", zu: "Izingane", xh: "Abantwana", nso: "Bana", tn: "Bana", st: "Bana", ts: "Vana", ss: "Bantfwana", ve: "Vhana", nr: "Abantwana", vi: "Trẻ em", fil: "Bata",
  af: "Kinders", sw: "Watoto", "zh-CN": "儿童", "zh-TW": "兒童", ko: "어린이", th: "เด็ก",
  bn: "শিশু", da: "Børn", hu: "Gyerekek",
};

export function ToolKidsToggle() {
  const { user, plan, kidsAccess } = useAuth();
  const { lang } = useLang();
  const [on, setOn] = useKidsMode();
  if (!user || (plan !== "clear" && plan !== "deep")) return null;
  // Individual and other paid accounts without Kids Mode get "In simple words" here.
  if (!kidsAccess) return <SimpleWordsToggle />;
  const c = KIDS_BANNER_COPY[lang] ?? KIDS_BANNER_COPY.en;
  const state = (on ? c.onTitle : c.offTitle).replace(/^✓\s*/, "");
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={state} title={state} className={`wb-kids-mini${on ? " is-on" : ""}`} onClick={() => setOn(!on)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {/* Awake when on, asleep when off, so the state shows at a glance (Gadi 2026-10-17: it looked the same). */}
      <img src={on ? "/play/kids-mascot.webp" : "/play/kids-mascot-sleep.webp"} alt="" width={30} height={30} />
      <span className="wb-kids-mini-label">{NAME[lang] ?? NAME.en}</span>
      {/* A real switch, so it reads as a button that turns something on. */}
      <span className="wb-kids-mini-track" aria-hidden="true"><span /></span>
    </button>
  );
}
