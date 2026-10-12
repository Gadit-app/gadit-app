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

/** Just "Kids" (Gadi 2026-10-12: "Mode" dropped, the switch says the rest). */
const NAME: Record<string, string> = {
  en: "Kids", he: "ילדים", ar: "الأطفال", ru: "Дети", es: "Niños", pt: "Crianças",
  fr: "Enfants", de: "Kinder", cs: "Děti", sk: "Deti", it: "Bambini", ja: "キッズ",
  hi: "बच्चे", am: "ልጆች", uk: "Діти", tr: "Çocuklar", pl: "Dzieci", fa: "کودکان",
  id: "Anak", nl: "Kinderen", el: "Παιδιά", zu: "Izingane", vi: "Trẻ em", fil: "Bata",
  af: "Kinders", sw: "Watoto", "zh-CN": "儿童", "zh-TW": "兒童", ko: "어린이", th: "เด็ก",
  bn: "শিশু", da: "Børn", hu: "Gyerekek",
};

export function ToolKidsToggle() {
  const { user, plan, kidsAccess } = useAuth();
  const { lang } = useLang();
  const [on, setOn] = useKidsMode();
  if (!user || !kidsAccess || (plan !== "clear" && plan !== "deep")) return null;
  const c = KIDS_BANNER_COPY[lang] ?? KIDS_BANNER_COPY.en;
  const state = (on ? c.onTitle : c.offTitle).replace(/^✓\s*/, "");
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={state} title={state} className={`wb-kids-mini${on ? " is-on" : ""}`} onClick={() => setOn(!on)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={on ? "/play/kids-mascot.webp" : "/play/kids-mascot-sleep.webp"} alt="" width={30} height={30} />
      <span className="wb-kids-mini-label">{NAME[lang] ?? NAME.en}</span>
      {/* A real switch, so it reads as a button that turns something on. */}
      <span className="wb-kids-mini-track" aria-hidden="true"><span /></span>
    </button>
  );
}
