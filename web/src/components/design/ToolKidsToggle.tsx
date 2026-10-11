"use client";

/**
 * Kids Mode in the top bar, beside the logo (Gadi 2026-10-12: one small
 * switch for the whole app instead of a strip under every title). The
 * mascot is awake when Kids Mode is on and asleep when it is off; the
 * label is just "Kids Mode", the mascot says the state. Family members only.
 */
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useKidsMode } from "@/lib/use-kids-mode";
import { KIDS_BANNER_COPY } from "@/lib/kids-banner-copy";

/** "Kids Mode" alone; the mascot shows whether it is on. */
const NAME: Record<string, string> = {
  en: "Kids Mode", he: "מצב ילדים", ar: "وضع الأطفال", ru: "Детский режим", es: "Modo niños", pt: "Modo infantil",
  fr: "Mode enfants", de: "Kindermodus", cs: "Dětský režim", sk: "Detský režim", it: "Modalità bambini", ja: "キッズモード",
  hi: "बच्चों का मोड", am: "የልጆች ሁነታ", uk: "Дитячий режим", tr: "Çocuk modu", pl: "Tryb dziecięcy", fa: "حالت کودک",
  id: "Mode anak", nl: "Kindermodus", el: "Λειτουργία παιδιών", zu: "Imodi yezingane", vi: "Chế độ trẻ em", fil: "Kids Mode",
  af: "Kindermodus", sw: "Hali ya watoto", "zh-CN": "儿童模式", "zh-TW": "兒童模式", ko: "어린이 모드", th: "โหมดเด็ก",
  bn: "শিশু মোড", da: "Børnetilstand", hu: "Gyerekmód",
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
      <img src={on ? "/play/kids-mascot.webp" : "/play/kids-mascot-sleep.webp"} alt="" width={28} height={28} />
      <span className="wb-kids-mini-label">{NAME[lang] ?? NAME.en}</span>
    </button>
  );
}
