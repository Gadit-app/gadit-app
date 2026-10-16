import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin";
import { sendPushToOwner } from "@/lib/push";
import { NOTIF_STRINGS } from "@/lib/family-notify-strings";
import { ACTIVITY_ALERT_EXTRA } from "@/lib/spell-i18n";
import { activityNotifyCopy } from "@/lib/activity-notify-i18n";
import { duelCopy } from "@/components/play/duel/duel-i18n";
import { Resend } from "resend";

/**
 * Deliver "your child looked up a word" alerts to a family owner across
 * both channels: a Web Push banner (when they enabled it on a device)
 * and an email fallback (always, so it lands even on an iPhone that
 * never installed the PWA). Copy is rendered in the OWNER'S language, so
 * a Hebrew parent gets Hebrew, a German parent gets German, etc.
 *
 * Language priority: the language the owner was using when they turned
 * notifications on (families/{owner}.notifyPrefs.lang) → their stored
 * uiLang/dripLang → English. Falls back to English per-key for any
 * language not yet in NOTIF_STRINGS.
 *
 * Two shapes:
 *   - instant: one word, sent the moment the child searches it.
 *   - digest:  an end-of-day summary listing the day's words.
 */

const RTL_LANGS = new Set(["he", "ar", "fa"]);

async function resolveOwner(ownerUid: string): Promise<{ email: string | null; lang: string }> {
  let email: string | null = null;
  try {
    email = (await getAdminAuth().getUser(ownerUid)).email ?? null;
  } catch {
    email = null;
  }

  const db = getAdminDb();
  let lang = "en";
  try {
    // 1) what the parent was using when they enabled notifications.
    const fam = await db.collection("families").doc(ownerUid).get();
    const prefLang = fam.data()?.notifyPrefs?.lang as string | undefined;
    if (prefLang && typeof prefLang === "string") {
      lang = prefLang;
    } else {
      // 2) fall back to whatever language we have stored for the user.
      const u = (await db.collection("users").doc(ownerUid).get()).data() as
        | { uiLang?: string; dripLang?: string }
        | undefined;
      lang = u?.uiLang || u?.dripLang || "en";
    }
  } catch {
    lang = "en";
  }
  return { email, lang };
}

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
}

function fill(tpl: string, vars: Record<string, string | number>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  try {
    await new Resend(key).emails.send({
      from: "Gadit <notify@gadit.app>",
      to,
      subject,
      html,
    });
  } catch (e) {
    console.error("[family-notify] email error:", e);
  }
}

const emailShell = (lang: string, inner: string) =>
  `<div dir="${RTL_LANGS.has(lang) ? "rtl" : "ltr"}" style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1c1917">${inner}<div style="margin-top:20px;font-size:12px;color:#a8a29e">Gadit</div></div>`;

/** One word, right now. */
export async function notifyOwnerInstant(ownerUid: string, kidName: string, word: string): Promise<void> {
  const { email, lang } = await resolveOwner(ownerUid);
  const t = NOTIF_STRINGS[lang] ?? NOTIF_STRINGS.en;

  await sendPushToOwner(ownerUid, {
    title: fill(t.instantTitle, { kid: kidName }),
    body: word,
    url: "/family",
    tag: "kid-search",
  });

  if (email) {
    const subject = fill(t.instantSubject, { kid: kidName, word });
    const lead = fill(t.instantLead, { kid: esc(kidName) });
    const html = emailShell(
      lang,
      `<p style="margin:0 0 12px;font-size:15px">${lead}</p>` +
        `<p style="margin:0;font-size:26px;font-weight:700;color:#0EA5A5">${esc(word)}</p>`,
    );
    await sendEmail(email, subject, html);
  }
}

/**
 * A learning ACTIVITY finished (a dictation practice or a "Say it" session),
 * not just a word lookup. Gadi 2026-09-19: parents wanted to feel they see
 * everything the child does, so the app feels valuable. he/en copy, English
 * fallback for every other parent language.
 */
export type ActivityKind = "spell" | "say" | "pick" | "lesson" | "game" | "read" | "duel";
const ACTIVITY_STRINGS: Record<string, {
  spellTitle: string; spellLead: string;
  sayTitle: string; sayLead: string;
  score: string; // uses {a}/{b}
}> = {
  en: {
    spellTitle: "{kid} practiced a dictation",
    spellLead: "{kid} just finished a spelling practice:",
    sayTitle: "{kid} practiced pronunciation",
    sayLead: "{kid} just practiced saying words out loud:",
    score: "{a} of {b} correct",
  },
  he: {
    spellTitle: "{kid} תרגל/ה הכתבה",
    spellLead: "{kid} סיים/ה עכשיו תרגול הכתבה:",
    sayTitle: "{kid} תרגל/ה הגייה",
    sayLead: "{kid} תרגל/ה עכשיו להגיד מילים בקול:",
    score: "{a} מתוך {b} נכון",
  },
  ar: {
    spellTitle: "{kid}: تمرين إملاء",
    spellLead: "أنهى {kid} للتو تمرين إملاء:",
    sayTitle: "{kid}: تمرين نطق",
    sayLead: "تدرّب {kid} للتو على نطق الكلمات بصوت عالٍ:",
    score: "{a} من {b} صحيحة",
  },
  ru: {
    spellTitle: "{kid}: тренировка диктанта",
    spellLead: "Новая тренировка правописания от {kid}:",
    sayTitle: "{kid}: тренировка произношения",
    sayLead: "Новая тренировка произношения от {kid}. Слова вслух:",
    score: "{a} из {b} верно",
  },
  es: {
    spellTitle: "{kid} practicó un dictado",
    spellLead: "{kid} acaba de terminar una práctica de ortografía:",
    sayTitle: "{kid} practicó la pronunciación",
    sayLead: "{kid} acaba de practicar cómo decir palabras en voz alta:",
    score: "{a} de {b} correctas",
  },
  pt: {
    spellTitle: "{kid} praticou um ditado",
    spellLead: "{kid} acabou de terminar uma prática de ortografia:",
    sayTitle: "{kid} praticou a pronúncia",
    sayLead: "{kid} acabou de praticar como dizer palavras em voz alta:",
    score: "{a} de {b} corretas",
  },
  fr: {
    spellTitle: "{kid} a fait une dictée",
    spellLead: "{kid} vient de terminer un exercice d'orthographe :",
    sayTitle: "{kid} a travaillé la prononciation",
    sayLead: "{kid} vient de s'entraîner à dire des mots à voix haute :",
    score: "{a} sur {b} corrects",
  },
  de: {
    spellTitle: "{kid} hat ein Diktat geübt",
    spellLead: "{kid} hat gerade eine Rechtschreibübung beendet:",
    sayTitle: "{kid} hat die Aussprache geübt",
    sayLead: "{kid} hat gerade geübt, Wörter laut auszusprechen:",
    score: "{a} von {b} richtig",
  },
  cs: {
    spellTitle: "{kid} procvičuje diktát",
    spellLead: "Nové cvičení pravopisu od {kid}:",
    sayTitle: "{kid} procvičuje výslovnost",
    sayLead: "Nové cvičení výslovnosti od {kid}:",
    score: "{a} z {b} správně",
  },
  sk: {
    spellTitle: "{kid} si precvičuje diktát",
    spellLead: "Nové cvičenie pravopisu od {kid}:",
    sayTitle: "{kid} si precvičuje výslovnosť",
    sayLead: "Nové cvičenie výslovnosti od {kid}:",
    score: "{a} z {b} správne",
  },
  it: {
    spellTitle: "{kid} ha fatto un dettato",
    spellLead: "{kid} ha appena finito un esercizio di ortografia:",
    sayTitle: "{kid} ha esercitato la pronuncia",
    sayLead: "{kid} ha appena provato a dire parole ad alta voce:",
    score: "{a} su {b} corrette",
  },
  ja: {
    spellTitle: "{kid}さんが書き取りを練習しました",
    spellLead: "{kid}さんがつづりの練習を終えました：",
    sayTitle: "{kid}さんが発音を練習しました",
    sayLead: "{kid}さんが単語を声に出して言う練習をしました：",
    score: "{b}問中{a}問正解",
  },
  hi: {
    spellTitle: "{kid} का श्रुतलेख अभ्यास",
    spellLead: "{kid} ने अभी एक वर्तनी अभ्यास पूरा किया:",
    sayTitle: "{kid} का उच्चारण अभ्यास",
    sayLead: "{kid} ने अभी शब्दों को ज़ोर से बोलने का अभ्यास किया:",
    score: "{b} में से {a} सही",
  },
  am: {
    spellTitle: "የ{kid} የፊደል መልመጃ",
    spellLead: "ከ{kid} አዲስ የፊደል መልመጃ:",
    sayTitle: "የ{kid} የአነባበብ መልመጃ",
    sayLead: "ከ{kid} አዲስ የአነባበብ መልመጃ:",
    score: "ከ{b} {a} ትክክል",
  },
  uk: {
    spellTitle: "{kid}: тренування диктанту",
    spellLead: "Нове тренування правопису від {kid}:",
    sayTitle: "{kid}: тренування вимови",
    sayLead: "Нове тренування вимови від {kid}. Слова вголос:",
    score: "{a} з {b} правильно",
  },
  tr: {
    spellTitle: "{kid} dikte alıştırması yaptı",
    spellLead: "{kid} az önce bir yazım alıştırmasını tamamladı:",
    sayTitle: "{kid} telaffuz alıştırması yaptı",
    sayLead: "{kid} az önce kelimeleri sesli söyleme alıştırması yaptı:",
    score: "{b} sorudan {a} doğru",
  },
  pl: {
    spellTitle: "{kid} ćwiczy dyktando",
    spellLead: "Nowe ćwiczenie z pisowni od {kid}:",
    sayTitle: "{kid} ćwiczy wymowę",
    sayLead: "Nowe ćwiczenie wymowy od {kid}:",
    score: "{a} z {b} poprawnie",
  },
  fa: {
    spellTitle: "{kid} یک دیکته تمرین کرد",
    spellLead: "{kid} همین الان یک تمرین املا را تمام کرد:",
    sayTitle: "{kid} تلفظ را تمرین کرد",
    sayLead: "{kid} همین الان گفتن کلمات با صدای بلند را تمرین کرد:",
    score: "{a} از {b} درست",
  },
  id: {
    spellTitle: "{kid} berlatih dikte",
    spellLead: "{kid} baru saja menyelesaikan latihan ejaan:",
    sayTitle: "{kid} berlatih pengucapan",
    sayLead: "{kid} baru saja berlatih mengucapkan kata dengan lantang:",
    score: "{a} dari {b} benar",
  },
  nl: {
    spellTitle: "{kid} heeft een dictee geoefend",
    spellLead: "{kid} heeft net een spellingoefening afgerond:",
    sayTitle: "{kid} heeft de uitspraak geoefend",
    sayLead: "{kid} heeft net geoefend met woorden hardop zeggen:",
    score: "{a} van {b} goed",
  },
  el: {
    spellTitle: "{kid}: άσκηση ορθογραφίας",
    spellLead: "Νέα άσκηση ορθογραφίας από {kid}:",
    sayTitle: "{kid}: εξάσκηση στην προφορά",
    sayLead: "Νέα εξάσκηση προφοράς από {kid}. Λέξεις φωναχτά:",
    score: "{a} από {b} σωστά",
  },
  zu: {
    spellTitle: "{kid} uzijwayeze ukupela amagama",
    spellLead: "{kid} usanda kuqeda ukuzijwayeza ukupela:",
    sayTitle: "{kid} uzijwayeze ukuphimisela",
    sayLead: "{kid} usanda kuzijwayeza ukusho amagama ngokuzwakalayo:",
    score: "{a}/{b} kulungile",
  },
  xh: {
    spellTitle: "U-{kid} uziqhelise ngopelo",
    spellLead: "U-{kid} usandula ukugqiba ukuziqhelisa upelo:",
    sayTitle: "U-{kid} uziqhelise ukubiza",
    sayLead: "U-{kid} usandula ukuziqhelisa ukuthetha amagama ngokuvakalayo:",
    score: "{a} kwe-{b} ichanekile",
  },
  nso: {
    spellTitle: "{kid} o itlwaeditše mopeleto",
    spellLead: "{kid} o sa tšwa go fetša tlwaetšo ya mopeleto:",
    sayTitle: "{kid} o itlwaeditše go bitša",
    sayLead: "{kid} o sa tšwa go itlwaetša go bolela mantšu ka lentšu le legolo:",
    score: "{a} go {b} a nepagetše",
  },
  tn: {
    spellTitle: "{kid} o ikatisitse mopeleto",
    spellLead: "{kid} o sa tswa go fetsa boikatiso jwa mopeleto:",
    sayTitle: "{kid} o ikatisitse go bitsa mafoko",
    sayLead: "{kid} o sa tswa go ikatisa go bua mafoko ka lentswe:",
    score: "{a} mo go {b} a nepagetse",
  },
  st: {
    spellTitle: "{kid} o ikwetlisitse mopeleto",
    spellLead: "{kid} o sa tswa qeta boikwetliso ba mopeleto:",
    sayTitle: "{kid} o ikwetlisitse ho bitsa mantswe",
    sayLead: "{kid} o sa tswa ikwetlisa ho bua mantswe ka lentswe le phahameng:",
    score: "{a} ho {b} di nepahetse",
  },
  ts: {
    spellTitle: "{kid} u titolovete mapeletelo",
    spellLead: "{kid} u ha ku heta ntoloveto wa mapeletelo:",
    sayTitle: "{kid} u titolovete mpfumawulo",
    sayLead: "{kid} u ha ku titoloveta ku vula marito hi rito ra le henhla:",
    score: "{a} eka {b} swi lulamile",
  },
  ss: {
    spellTitle: "{kid} uticeceshe kupela",
    spellLead: "{kid} usandza kucedza kuticecesha kupela:",
    sayTitle: "{kid} uticeceshe kuphimisa",
    sayLead: "{kid} usandza kuticecesha kusho emagama ngelivi:",
    score: "{a} kwa-{b} kulungile",
  },
  ve: {
    spellTitle: "{kid} o ḓowela mupeleto",
    spellLead: "{kid} o kha ḓi fhedza nḓowelo ya mupeleto:",
    sayTitle: "{kid} o ḓowela u bula",
    sayLead: "{kid} o kha ḓi ḓowela u amba maipfi nga ipfi ḽa nṱha:",
    score: "{a} kha {b} zwo vha zwone",
  },
  nr: {
    spellTitle: "U-{kid} uzilolonge ukupela",
    spellLead: "U-{kid} usanda kuqeda ukuzilolonga ukupela:",
    sayTitle: "U-{kid} uzilolonge ukuphimisa",
    sayLead: "U-{kid} usanda kuzilolonga ukutjho amezwi ngelizwi eliphezulu:",
    score: "{a} kwa-{b} kulungile",
  },
  vi: {
    spellTitle: "{kid} đã luyện chính tả",
    spellLead: "{kid} vừa hoàn thành một bài luyện chính tả:",
    sayTitle: "{kid} đã luyện phát âm",
    sayLead: "{kid} vừa luyện nói to các từ:",
    score: "Đúng {a} trên {b}",
  },
  fil: {
    spellTitle: "Nagsanay si {kid} ng dikta",
    spellLead: "Katatapos lang ni {kid} ng pagsasanay sa ispeling:",
    sayTitle: "Nagsanay si {kid} ng pagbigkas",
    sayLead: "Katatapos lang ni {kid} magsanay magsabi ng mga salita nang malakas:",
    score: "{a} sa {b} ang tama",
  },
  af: {
    spellTitle: "{kid} het 'n diktee geoefen",
    spellLead: "{kid} het pas 'n speloefening voltooi:",
    sayTitle: "{kid} het uitspraak geoefen",
    sayLead: "{kid} het pas geoefen om woorde hardop te sê:",
    score: "{a} uit {b} korrek",
  },
  sw: {
    spellTitle: "{kid} amefanya mazoezi ya imla",
    spellLead: "{kid} amemaliza zoezi la tahajia:",
    sayTitle: "{kid} amefanya mazoezi ya matamshi",
    sayLead: "{kid} amejizoeza kutamka maneno kwa sauti:",
    score: "{a} kati ya {b} sahihi",
  },
  "zh-CN": {
    spellTitle: "{kid} 练习了听写",
    spellLead: "{kid} 刚刚完成了一次拼写练习：",
    sayTitle: "{kid} 练习了发音",
    sayLead: "{kid} 刚刚练习了大声说出单词：",
    score: "{b} 个中答对 {a} 个",
  },
  "zh-TW": {
    spellTitle: "{kid} 練習了聽寫",
    spellLead: "{kid} 剛剛完成了一次拼寫練習：",
    sayTitle: "{kid} 練習了發音",
    sayLead: "{kid} 剛剛練習了大聲說出單字：",
    score: "{b} 題中答對 {a} 題",
  },
  ko: {
    spellTitle: "{kid}: 받아쓰기 연습을 마쳤어요",
    spellLead: "{kid}의 새 맞춤법 연습:",
    sayTitle: "{kid}: 발음 연습을 마쳤어요",
    sayLead: "{kid}의 새 발음 연습 (단어 소리 내어 말하기):",
    score: "{b}개 중 {a}개 정답",
  },
  th: {
    spellTitle: "{kid} ฝึกเขียนตามคำบอกแล้ว",
    spellLead: "{kid} เพิ่งฝึกสะกดคำเสร็จ:",
    sayTitle: "{kid} ฝึกออกเสียงแล้ว",
    sayLead: "{kid} เพิ่งฝึกพูดคำออกเสียงดังๆ:",
    score: "ถูก {a} จาก {b}",
  },
  bn: {
    spellTitle: "{kid} একটি শ্রুতিলিখন অনুশীলন করেছে",
    spellLead: "{kid} এইমাত্র একটি বানান অনুশীলন শেষ করেছে:",
    sayTitle: "{kid} উচ্চারণ অনুশীলন করেছে",
    sayLead: "{kid} এইমাত্র শব্দ জোরে বলার অনুশীলন করেছে:",
    score: "{b}টির মধ্যে {a}টি সঠিক",
  },
  da: {
    spellTitle: "{kid} har øvet diktat",
    spellLead: "{kid} er lige blevet færdig med en staveøvelse:",
    sayTitle: "{kid} har øvet udtale",
    sayLead: "{kid} har lige øvet sig i at sige ord højt:",
    score: "{a} ud af {b} rigtige",
  },
  hu: {
    spellTitle: "{kid} tollbamondást gyakorolt",
    spellLead: "{kid} most fejezett be egy helyesírási gyakorlatot:",
    sayTitle: "{kid} kiejtést gyakorolt",
    sayLead: "{kid} most gyakorolta a szavak hangos kimondását:",
    score: "{a}/{b} helyes",
  },
};

export async function notifyOwnerActivity(
  ownerUid: string,
  kidName: string,
  kind: ActivityKind,
  opts: { label: string; score?: number; total?: number },
): Promise<void> {
  const { email, lang } = await resolveOwner(ownerUid);
  const t = ACTIVITY_STRINGS[lang] ?? ACTIVITY_ALERT_EXTRA[lang] ?? ACTIVITY_STRINGS.en;
  // Dictation and Say it keep their own lines; everything else a child
  // finishes (Gadi 2026-10-12) uses one "{kid} finished: {act}" line.
  const a = activityNotifyCopy(lang);
  const act = kind === "spell" || kind === "say" ? "" : kind === "duel" ? duelCopy(lang).title : a[kind];
  const title = kind === "spell" ? fill(t.spellTitle, { kid: kidName })
    : kind === "say" ? fill(t.sayTitle, { kid: kidName })
    : fill(a.title, { kid: kidName, act });
  const lead = kind === "spell" ? fill(t.spellLead, { kid: kidName })
    : kind === "say" ? fill(t.sayLead, { kid: kidName })
    : `${fill(a.lead, { kid: kidName })} ${act}`;
  const hasScore = typeof opts.score === "number" && typeof opts.total === "number";
  const scoreLine = hasScore ? fill(t.score, { a: opts.score!, b: opts.total! }) : "";
  const bodyLine = opts.label + (scoreLine ? ` · ${scoreLine}` : "");

  await sendPushToOwner(ownerUid, {
    title,
    body: bodyLine,
    url: "/family",
    tag: `kid-${kind}`,
  });

  if (email) {
    const html = emailShell(
      lang,
      `<p style="margin:0 0 12px;font-size:15px">${esc(lead)}</p>` +
        `<p style="margin:0 0 6px;font-size:20px;font-weight:700;color:#0EA5A5">${esc(opts.label)}</p>` +
        (scoreLine ? `<p style="margin:0;font-size:15px;color:#44403c">${esc(scoreLine)}</p>` : ""),
    );
    await sendEmail(email, title, html);
  }
}

export type DigestActivity = { kidName: string; kind: ActivityKind; label: string; score?: number | null; total?: number | null };

/** One readable line for an activity in the daily summary. */
function activityLine(lang: string, x: DigestActivity): string {
  const t = ACTIVITY_STRINGS[lang] ?? ACTIVITY_ALERT_EXTRA[lang] ?? ACTIVITY_STRINGS.en;
  const a = activityNotifyCopy(lang);
  const name = x.kind === "spell" ? fill(t.spellTitle, { kid: "" }).replace(/^[\s:：,،]+|[\s:：,،]+$/g, "")
    : x.kind === "say" ? fill(t.sayTitle, { kid: "" }).replace(/^[\s:：,،]+|[\s:：,،]+$/g, "")
    : x.kind === "duel" ? duelCopy(lang).title
    : a[x.kind];
  const score = typeof x.score === "number" && typeof x.total === "number" ? ` · ${fill(t.score, { a: x.score, b: x.total })}` : "";
  return `${name}${x.label ? `: ${x.label}` : ""}${score}`;
}

/** End-of-day summary: the words looked up and everything finished
 *  (Gadi 2026-10-12). items = [{ kidName, word }]. */
export async function notifyOwnerDigest(
  ownerUid: string,
  items: { kidName: string; word: string }[],
  acts: DigestActivity[] = [],
): Promise<void> {
  if (items.length === 0 && acts.length === 0) return;
  const { email, lang } = await resolveOwner(ownerUid);
  const t = NOTIF_STRINGS[lang] ?? NOTIF_STRINGS.en;
  const a = activityNotifyCopy(lang);
  const title = items.length ? fill(t.digestTitle, { n: items.length }) : fill(a.actsTitle, { n: acts.length });
  const preview = items.length ? items.slice(0, 4).map((i) => i.word).join(", ") : acts.slice(0, 3).map((x) => activityLine(lang, x)).join(" · ");

  await sendPushToOwner(ownerUid, { title, body: preview, url: "/family", tag: "kid-digest" });

  if (email) {
    // Group words by child for a readable list.
    const byKid = new Map<string, string[]>();
    for (const it of items) {
      const arr = byKid.get(it.kidName) ?? [];
      arr.push(it.word);
      byKid.set(it.kidName, arr);
    }
    const blocks = Array.from(byKid.entries())
      .map(
        ([kid, words]) =>
          `<p style="margin:0 0 6px;font-weight:600;font-size:14px">${esc(kid)}</p>` +
          `<p style="margin:0 0 16px;font-size:15px;color:#44403c;line-height:1.7">${words.map(esc).join(" · ")}</p>`,
      )
      .join("");
    const actsByKid = new Map<string, string[]>();
    for (const x of acts) {
      const arr = actsByKid.get(x.kidName) ?? [];
      arr.push(activityLine(lang, x));
      actsByKid.set(x.kidName, arr);
    }
    const actBlocks = Array.from(actsByKid.entries())
      .map(
        ([kid, lines]) =>
          `<p style="margin:0 0 6px;font-weight:600;font-size:14px">${esc(kid)}</p>` +
          `<p style="margin:0 0 16px;font-size:15px;color:#44403c;line-height:1.8">${lines.map((l) => `✓ ${esc(l)}`).join("<br>")}</p>`,
      )
      .join("");
    const html = emailShell(
      lang,
      (items.length ? `<p style="margin:0 0 14px;font-size:15px">${esc(fill(t.digestLead, {}))}</p>${blocks}` : "") +
        (acts.length ? `<p style="margin:${items.length ? "8px" : "0"} 0 14px;font-size:15px">${esc(a.actsLead)}</p>${actBlocks}` : ""),
    );
    await sendEmail(email, title, html);
  }
}
