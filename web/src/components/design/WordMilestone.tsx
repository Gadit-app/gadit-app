"use client";

import { useEffect, useState } from "react";
import { KidsCelebration } from "./KidsCelebration";

/**
 * Every 10th word in the notebook (Gadi 2026-10-21: kids want life and
 * animation, but fireworks on every search is too much): a short banner
 * "10 more words in your vocabulary", with fireworks for children (a kid
 * account or Kids Mode). The caller passes the notebook's new size after a
 * save; nothing shows unless it is a multiple of 10.
 */
const MILESTONE: Record<string, string> = {
  en: "Well done! 10 more words in your vocabulary. You now have {n} words.",
  he: "כל הכבוד! עוד 10 מילים נכנסו לאוצר המילים שלכם. יש לכם עכשיו {n} מילים.",
  ar: "أحسنتم! أُضيفت 10 كلمات أخرى إلى مفرداتكم. لديكم الآن {n} كلمة.",
  ru: "Молодцы! Ещё 10 слов в вашем словаре. Всего слов: {n}.",
  es: "¡Muy bien! 10 palabras más en tu vocabulario. Ya tienes {n} palabras.",
  pt: "Muito bem! Mais 10 palavras no seu vocabulário. Agora você tem {n} palavras.",
  fr: "Bravo ! 10 mots de plus dans ton vocabulaire. Tu as maintenant {n} mots.",
  de: "Super! 10 Wörter mehr in deinem Wortschatz. Du hast jetzt {n} Wörter.",
  cs: "Výborně! Dalších 10 slov ve vaší slovní zásobě. Slov celkem: {n}.",
  sk: "Výborne! Ďalších 10 slov vo vašej slovnej zásobe. Slov spolu: {n}.",
  it: "Bravo! Altre 10 parole nel tuo vocabolario. Ora hai {n} parole.",
  ja: "すごい！語彙に10語増えました。いまは{n}語です。",
  hi: "शाबाश! आपकी शब्दावली में 10 और शब्द जुड़ गए। अब आपके पास {n} शब्द हैं।",
  am: "በጣም ጥሩ! በቃላት ክምችትዎ ላይ ሌሎች 10 ቃላት ተጨመሩ። አሁን {n} ቃላት አሉዎት።",
  uk: "Молодці! Ще 10 слів у вашому словнику. Усього слів: {n}.",
  tr: "Harika! Kelime hazinene 10 kelime daha eklendi. Artık {n} kelimen var.",
  pl: "Brawo! 10 nowych słów w Twoim słowniku. Łącznie słów: {n}.",
  fa: "آفرین! ۱۰ واژهٔ دیگر به گنجینهٔ واژگان شما اضافه شد. اکنون {n} واژه دارید.",
  id: "Hebat! 10 kata lagi masuk ke kosakatamu. Sekarang kamu punya {n} kata.",
  nl: "Goed zo! 10 woorden erbij in je woordenschat. Je hebt nu {n} woorden.",
  el: "Μπράβο! Άλλες 10 λέξεις στο λεξιλόγιό σας. Τώρα έχετε {n} λέξεις.",
  zu: "Wenze kahle! Amanye amagama ayi-10 angene esilulumagameni sakho. Manje unamagama angu-{n}.",
  xh: "Wenze kakuhle! Amanye amagama ali-10 ongezwe kwisigama sakho. Ngoku unamagama ali-{n}.",
  nso: "O dirile gabotse! Mantšu a mangwe a 10 a tsentšwe ka gare ga mantšu a gago. Bjale o na le mantšu a {n}.",
  tn: "O dirile sentle! Mafoko a mangwe a le 10 a tsentswe mo mafokong a gago. Jaanong o na le mafoko a le {n}.",
  st: "O entse hantle! Mantswe a mang a 10 a kentswe ho mantswe a hao. Jwale o na le mantswe a {n}.",
  ts: "U endle kahle! Marito man'wana ya 10 ma engeteriwile eka marito ya wena. Sweswi u na marito ya {n}.",
  ss: "Wente kahle! Lamanye emagama la-10 angenile esichazamagama sakho. Nyalo unemagama langu-{n}.",
  ve: "No ita zwavhuḓi! Maipfi manwe a 10 o engedzwa kha maipfi aṋu. Zwino ni na maipfi a {n}.",
  nr: "Wenze kuhle! Amanye amagama ali-10 angezelelwe emagameni wakho. Nje unamagama ali-{n}.",
  vi: "Giỏi lắm! Thêm 10 từ vào vốn từ của bạn. Giờ bạn có {n} từ.",
  fil: "Galing! 10 pang salita ang nadagdag sa bokabularyo mo. May {n} salita ka na ngayon.",
  af: "Mooi so! Nog 10 woorde in jou woordeskat. Jy het nou {n} woorde.",
  sw: "Hongera! Maneno 10 zaidi yameongezwa kwenye msamiati wako. Sasa una maneno {n}.",
  "zh-CN": "太棒了！你的词汇又多了10个词，现在一共有{n}个词。",
  "zh-TW": "太棒了！你的詞彙又多了10個詞，現在一共有{n}個詞。",
  ko: "잘했어요! 어휘에 단어 10개가 더해졌어요. 이제 {n}개예요.",
  th: "เก่งมาก! คลังคำของคุณเพิ่มขึ้นอีก 10 คำ ตอนนี้มี {n} คำแล้ว",
  bn: "দারুণ! তোমার শব্দভান্ডারে আরও ১০টি শব্দ যোগ হলো। এখন তোমার {n}টি শব্দ।",
  da: "Godt gået! 10 ord mere i dit ordforråd. Du har nu {n} ord.",
  hu: "Szép munka! Újabb 10 szó a szókincsedben. Most {n} szavad van.",
};

export function WordMilestone({ count, lang, fireworks }: { count: number | null; lang: string; fireworks: boolean }) {
  const [shown, setShown] = useState<number | null>(null);
  const [run, setRun] = useState(0);
  useEffect(() => {
    if (!count || count % 10 !== 0) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one banner per milestone
    setShown(count);
    if (fireworks) setRun((r) => r + 1);
    const t = window.setTimeout(() => setShown(null), 5200);
    return () => window.clearTimeout(t);
  }, [count, fireworks]);
  const text = (MILESTONE[lang] ?? MILESTONE.en).replace("{n}", String(shown ?? ""));
  return (
    <>
      {fireworks && <KidsCelebration runId={run} />}
      {shown !== null && (
        <div role="status" aria-live="polite" className="wb-word-milestone">
          <span aria-hidden="true" className="wb-word-milestone-ico">🎉</span>
          <span>{text}</span>
        </div>
      )}
    </>
  );
}
