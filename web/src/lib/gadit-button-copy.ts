/**
 * gadit-button-copy — the "Gad it!" button on the word page (Gadi 2026-10-18,
 * after 7 assistants answered the same prompt). Since 2026-10-24 there is no
 * question: the tap itself marks the word understood in the notebook, once,
 * and gives no rank points (/api/notebook/understood).
 *
 * The brand phrase stays English ("Gad it!", "Now I gad it!") with a small
 * hint in the reader's language, EXCEPT where "gad" sounds bad: in Russian,
 * Ukrainian, Polish, Czech and Slovak "гад/gad" is an insult or "vermin",
 * in Persian "gada" is a beggar and in Hindi "gadha" a donkey. Those
 * languages get a plain local phrase and never show "gad".
 */
import { GADIT_BUTTON_I18N } from "@/lib/gadit-button-i18n";

export type GadKey = "button" | "success" | "doneSub" | "alreadySub";

/** Languages where "gad" must never be shown or said. */
export const NO_GAD_LANGS = new Set(["ru", "uk", "pl", "cs", "sk", "fa", "hi"]);

const BASE: Record<"en" | "he", Record<GadKey, string>> = {
  en: {
    button: "Gad it!",
    success: "Now I gad it!",
    doneSub: "The word is marked as understood in your notebook.",
    alreadySub: "This word is already in your understood words.",
  },
  he: {
    button: "Gad it!",
    success: "Now I gad it!",
    doneSub: "המילה סומנה במחברת כמילה שהבנתם.",
    alreadySub: "המילה הזאת כבר נמצאת אצלכם במילים שהבנתם.",
  },
};

export function gadCopy(lang: string): Record<GadKey, string> {
  const own = (BASE as Record<string, Record<GadKey, string>>)[lang] ?? GADIT_BUTTON_I18N[lang] ?? {};
  const out = { ...BASE.en, ...own } as Record<GadKey, string>;
  // Safety net: a language on the no-gad list never falls back to the English brand phrase.
  if (NO_GAD_LANGS.has(lang) && (/gad/i.test(out.button) || /gad/i.test(out.success))) {
    out.button = "✓";
    out.success = "✓";
  }
  return out;
}

/** The line under the button since 2026-10-24 (Gadi): no question any more,
 *  the tap itself marks the word as understood in the notebook. */
export const GAD_TAP_HINT: Record<string, string> = {
  he: "לחצו כשהבנתם, והמילה תסומן במחברת שלכם כמילה שהבנתם",
  en: "Tap when you've understood, and the word is marked as understood in your notebook",
  ar: "اضغطوا عندما تفهمون، وستُعلَّم الكلمة في دفتركم ككلمة فهمتموها",
  ru: "Нажмите, когда поймёте, и слово будет отмечено в блокноте как понятое",
  es: "Toca cuando lo hayas entendido y la palabra quedará marcada en tu cuaderno como entendida",
  pt: "Toque quando entender, e a palavra fica marcada no seu caderno como entendida",
  fr: "Touchez quand vous avez compris, et le mot sera marqué comme compris dans votre carnet",
  de: "Tipp, wenn du es verstanden hast, und das Wort wird in deinem Heft als verstanden markiert",
  cs: "Klepněte, až to pochopíte, a slovo se v sešitu označí jako pochopené",
  sk: "Ťuknite, keď to pochopíte, a slovo sa v zošite označí ako pochopené",
  it: "Tocca quando hai capito e la parola sarà segnata come capita nel tuo quaderno",
  ja: "わかったらタップ。ノートで「わかった単語」として記録されます",
  hi: "समझ आने पर दबाइए, और शब्द आपकी नोटबुक में समझे गए शब्द के रूप में चिह्नित हो जाएगा",
  am: "ሲገባችሁ ተጫኑ፣ ቃሉ በማስታወሻ ደብተራችሁ እንደተረዳችሁት ይመዘገባል",
  uk: "Натисніть, коли зрозумієте, і слово буде позначено в блокноті як зрозуміле",
  tr: "Anladığında dokun, kelime defterinde anlaşıldı olarak işaretlensin",
  pl: "Dotknij, gdy zrozumiesz, a słowo zostanie oznaczone w zeszycie jako zrozumiane",
  fa: "وقتی فهمیدید بزنید تا واژه در دفترچه‌تان به‌عنوان فهمیده‌شده علامت بخورد",
  id: "Ketuk saat sudah paham, dan kata ini ditandai sebagai dipahami di buku catatanmu",
  nl: "Tik als je het begrijpt, dan wordt het woord in je schrift gemarkeerd als begrepen",
  el: "Πάτησε όταν το καταλάβεις και η λέξη θα σημειωθεί ως κατανοητή στο τετράδιό σου",
  zu: "Thepha uma usuqondile, igama lizophawulwa encwadini yakho njengeliqondiwe",
  vi: "Chạm khi bạn đã hiểu, từ sẽ được đánh dấu là đã hiểu trong sổ tay",
  fil: "I-tap kapag naintindihan mo na, at mamarkahan ang salita bilang naintindihan sa notebook mo",
  af: "Tik wanneer jy dit verstaan, en die woord word in jou notaboek as verstaan gemerk",
  sw: "Gusa ukishaelewa, na neno litawekwa alama kwenye daftari lako kuwa umelielewa",
  "zh-CN": "看懂了就点一下，这个词会在生词本里标记为已理解",
  "zh-TW": "看懂了就點一下，這個詞會在生詞本裡標記為已理解",
  ko: "이해했으면 누르세요. 단어장에 이해한 단어로 표시돼요",
  th: "แตะเมื่อเข้าใจแล้ว คำนี้จะถูกทำเครื่องหมายว่าเข้าใจแล้วในสมุดของคุณ",
  bn: "বুঝে গেলে চাপুন, শব্দটি আপনার খাতায় বোঝা শব্দ হিসেবে চিহ্নিত হবে",
  da: "Tryk, når du har forstået det, så bliver ordet markeret som forstået i dit hæfte",
  hu: "Koppints, ha megértetted, és a szó megértettként kerül a füzetedbe",
  xh: "Cofa xa sele uqondile, igama liza kuphawulwa encwadini yakho njengeliqondiweyo",
  nso: "Kgotla ge o kwešišitše, gomme lentšu le tla swaywa pukung ya gago bjalo ka le le kwešišitšwego",
  tn: "Tobetsa fa o tlhaloganye, mme lefoko le tla tshwaiwa mo bukeng ya gago jaaka le le tlhaloganngwang",
  st: "Tobetsa ha o se o utlwisisitse, mme lentswe le tla tshwaywa bukeng ya hao jwalo ka le utlwisisitsweng",
  ts: "Tsindzisa loko u twisisile, rito ri ta funghiwa ebukwini ya wena tanihi leri twisisekeke",
  ss: "Cindzetela nawusuvisisile, ligama litawuphawulwa encwadzini yakho njengelivisisekile",
  ve: "Kwamani musi no pfesesa, ipfi ḽi ḓo swayiwa bugwini yaṋu sa ḽe na ḽi pfesesa",
  nr: "Thinta nawuzwisisile, ilimi lizokutshwaywa encwadini yakho njengelizwisisekileko",
};
