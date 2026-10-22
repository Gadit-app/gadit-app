"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useHref } from "@/lib/href";
import { useKidsMode } from "@/lib/use-kids-mode";
import { QText } from "@/components/play/QText";

/**
 * "What's new" for the reading check (Gadi 2026-10-22): shown once per
 * account on the home page, from the morning the launch email goes out
 * (23.10, 08:00 Israel) for two weeks, to paying subscribers. A child (a
 * kid profile or Kids Mode) is sent to the homework reading, a grown-up to
 * Every Word, where the check runs. Seen once per account in this browser.
 */

const START = Date.parse("2026-10-23T05:00:00Z"); // 08:00 Israel
const END = START + 14 * 86_400_000;
const seenKey = (uid: string) => `gadit-whatsnew-reading-check:${uid}`;

type Copy = { title: string; line: string; cta: string; close: string };
const COPY: Record<string, Copy> = {
  he: { title: "חדש: בדיקת הבנה אחרי קריאה", line: "קוראים, לוחצים על מילים לא ברורות, ובסוף Gadit בודק שהבנתם.", cta: "לנסות עכשיו", close: "אחר כך" },
  en: { title: "New: a comprehension check after reading", line: "Read, tap the words that aren't clear, and at the end Gadit checks you understood.", cta: "Try it now", close: "Later" },
  ar: { title: "جديد: فحص الفهم بعد القراءة", line: "اقرؤوا، واضغطوا على الكلمات غير الواضحة، وفي النهاية يتحقق Gadit من أنكم فهمتم.", cta: "جرّبوا الآن", close: "لاحقًا" },
  ru: { title: "Новое: проверка понимания после чтения", line: "Читайте, нажимайте на непонятные слова, а в конце Gadit проверит, что вы поняли.", cta: "Попробовать", close: "Позже" },
  es: { title: "Nuevo: comprobación de comprensión después de leer", line: "Lee, toca las palabras que no estén claras y al final Gadit comprueba que entendiste.", cta: "Probar ahora", close: "Más tarde" },
  pt: { title: "Novo: verificação de compreensão depois da leitura", line: "Leia, toque nas palavras que não estão claras e, no fim, o Gadit verifica se você entendeu.", cta: "Experimentar agora", close: "Depois" },
  fr: { title: "Nouveau : vérifier la compréhension après la lecture", line: "Lisez, touchez les mots pas clairs, et à la fin Gadit vérifie que vous avez compris.", cta: "Essayer", close: "Plus tard" },
  de: { title: "Neu: Verständnischeck nach dem Lesen", line: "Lesen, auf unklare Wörter tippen, und am Ende prüft Gadit, ob alles verstanden wurde.", cta: "Jetzt ausprobieren", close: "Später" },
  cs: { title: "Novinka: kontrola porozumění po čtení", line: "Čtěte, klepněte na nejasná slova a na konci Gadit ověří, že jste porozuměli.", cta: "Vyzkoušet", close: "Později" },
  sk: { title: "Novinka: kontrola porozumenia po čítaní", line: "Čítajte, ťuknite na nejasné slová a na konci Gadit overí, že ste porozumeli.", cta: "Vyskúšať", close: "Neskôr" },
  it: { title: "Novità: verifica della comprensione dopo la lettura", line: "Leggi, tocca le parole poco chiare e alla fine Gadit controlla che tu abbia capito.", cta: "Prova ora", close: "Più tardi" },
  ja: { title: "新機能:読んだあとの理解チェック", line: "読んで、わからない言葉をタップ。最後に Gadit が理解できたか確かめます。", cta: "試してみる", close: "あとで" },
  hi: { title: "नया: पढ़ने के बाद समझ की जाँच", line: "पढ़िए, जो शब्द साफ़ न हों उन पर टैप कीजिए, और आख़िर में Gadit जाँचता है कि आप समझ गए।", cta: "अभी आज़माएँ", close: "बाद में" },
  am: { title: "አዲስ፦ ከንባብ በኋላ የመረዳት ፈተና", line: "ያንብቡ፣ ግልጽ ያልሆኑ ቃላትን ይንኩ፣ በመጨረሻ Gadit እንደተረዱ ያረጋግጣል።", cta: "አሁን ይሞክሩ", close: "በኋላ" },
  uk: { title: "Нове: перевірка розуміння після читання", line: "Читайте, натискайте на незрозумілі слова, а наприкінці Gadit перевірить, що ви зрозуміли.", cta: "Спробувати", close: "Пізніше" },
  tr: { title: "Yeni: okuduktan sonra anlama kontrolü", line: "Okuyun, net olmayan kelimelere dokunun, sonunda Gadit anladığınızı kontrol etsin.", cta: "Şimdi dene", close: "Sonra" },
  pl: { title: "Nowość: sprawdzanie zrozumienia po czytaniu", line: "Czytaj, stukaj w niejasne słowa, a na końcu Gadit sprawdzi, czy wszystko jest zrozumiałe.", cta: "Wypróbuj", close: "Później" },
  fa: { title: "تازه: سنجش فهم بعد از خواندن", line: "بخوانید، روی واژه‌های نامفهوم بزنید، و در پایان Gadit بررسی می‌کند که فهمیده‌اید.", cta: "همین حالا امتحان کنید", close: "بعداً" },
  id: { title: "Baru: cek pemahaman setelah membaca", line: "Baca, ketuk kata yang belum jelas, dan di akhir Gadit memeriksa bahwa kamu sudah paham.", cta: "Coba sekarang", close: "Nanti" },
  nl: { title: "Nieuw: begripscheck na het lezen", line: "Lees, tik op woorden die niet duidelijk zijn, en aan het eind checkt Gadit of je het begreep.", cta: "Nu proberen", close: "Later" },
  el: { title: "Νέο: έλεγχος κατανόησης μετά την ανάγνωση", line: "Διαβάστε, πατήστε τις λέξεις που δεν είναι σαφείς, και στο τέλος το Gadit ελέγχει ότι καταλάβατε.", cta: "Δοκιμάστε τώρα", close: "Αργότερα" },
  zu: { title: "Okusha: ukuhlola ukuqonda ngemva kokufunda", line: "Funda, uthinte amagama angacacile, bese ekugcineni i-Gadit ihlola ukuthi uqondile.", cta: "Zama manje", close: "Kamuva" },
  xh: { title: "Okutsha: ukuhlola ukuqonda emva kokufunda", line: "Funda, uchukumise amagama angacacanga, kwaye ekugqibeleni i-Gadit ihlola ukuba uqondile.", cta: "Zama ngoku", close: "Kamva" },
  nso: { title: "Se seswa: go lekola kwešišo ka morago ga go bala", line: "Bala, kgwatha mantšu ao a sa kwagalego, gomme mafelelong Gadit e lekola gore o kwešišitše.", cta: "Leka bjale", close: "Ka morago" },
  tn: { title: "Se sesha: go tlhatlhoba go tlhaloganya morago ga go bala", line: "Bala, tobetsa mafoko a a sa tlhaloganngweng, mme kwa bofelong Gadit e tlhatlhoba gore o tlhalogantse.", cta: "Leka jaanong", close: "Moragonyana" },
  st: { title: "Se setjha: ho hlahloba kutlwisiso ka mora ho bala", line: "Bala, tobetsa mantswe a sa hlakang, mme qetellong Gadit e hlahloba hore o utlwisisitse.", cta: "Leka hona jwale", close: "Hamorao" },
  ts: { title: "Leswintshwa: ku kambela ku twisisa endzhaku ka ku hlaya", line: "Hlaya, khumba marito lama nga twisisekiki, kutani eku heleni Gadit yi kambela leswaku u twisisile.", cta: "Ringeta sweswi", close: "Endzhaku" },
  ss: { title: "Lokusha: kuhlola kucondza ngemuva kwekufundza", line: "Fundza, uncindze emagama langakacaci, bese ekugcineni i-Gadit ihlola kutsi ucondzile.", cta: "Zama nyalo", close: "Ngemuva" },
  ve: { title: "Zwiswa: u ṱola u pfesesa nga murahu ha u vhala", line: "Vhalani, ni kwame maipfi ane a si pfale, nahone kha magumo Gadit i ṱola uri no pfesesa.", cta: "Lingedzani zwino", close: "Nga murahu" },
  nr: { title: "Okutjha: ukuhlola ukuzwisisa ngemva kokufunda", line: "Funda, uthinte amagama angakazwisiseki, bese ekugcineni i-Gadit ihlola bona uzwisisile.", cta: "Linga nje", close: "Ngemva" },
  vi: { title: "Mới: kiểm tra mức hiểu sau khi đọc", line: "Đọc, chạm vào từ chưa rõ, và cuối cùng Gadit kiểm tra xem bạn đã hiểu chưa.", cta: "Thử ngay", close: "Để sau" },
  fil: { title: "Bago: pagsusuri ng pag-unawa pagkatapos magbasa", line: "Magbasa, i-tap ang mga salitang hindi malinaw, at sa dulo susuriin ng Gadit kung naintindihan mo.", cta: "Subukan ngayon", close: "Mamaya" },
  af: { title: "Nuut: 'n begripstoets ná die lees", line: "Lees, tik op woorde wat nie duidelik is nie, en aan die einde kyk Gadit of jy verstaan het.", cta: "Probeer nou", close: "Later" },
  sw: { title: "Mpya: ukaguzi wa kuelewa baada ya kusoma", line: "Soma, gusa maneno yasiyo wazi, na mwishoni Gadit hukagua kama umeelewa.", cta: "Jaribu sasa", close: "Baadaye" },
  "zh-CN": { title: "新功能:读完后的理解检查", line: "阅读时点一下不明白的词,最后 Gadit 会检查你是否读懂了。", cta: "现在试试", close: "以后再说" },
  "zh-TW": { title: "新功能:讀完後的理解檢查", line: "閱讀時點一下不明白的詞,最後 Gadit 會檢查你是否讀懂了。", cta: "現在試試", close: "以後再說" },
  ko: { title: "새 기능: 읽은 뒤 이해 확인", line: "읽으면서 모르는 단어를 누르면, 마지막에 Gadit이 이해했는지 확인해요.", cta: "지금 해 보기", close: "나중에" },
  th: { title: "ใหม่: ตรวจความเข้าใจหลังอ่าน", line: "อ่าน แตะคำที่ไม่เข้าใจ แล้วตอนท้าย Gadit จะตรวจว่าคุณเข้าใจแล้ว", cta: "ลองเลย", close: "ไว้ทีหลัง" },
  bn: { title: "নতুন: পড়ার পরে বোঝার যাচাই", line: "পড়ুন, অস্পষ্ট শব্দে ট্যাপ করুন, আর শেষে Gadit দেখে নেয় আপনি বুঝেছেন কি না।", cta: "এখনই চেষ্টা করুন", close: "পরে" },
  da: { title: "Nyt: forståelsestjek efter læsning", line: "Læs, tryk på de ord, der ikke er klare, og til sidst tjekker Gadit, at du har forstået.", cta: "Prøv nu", close: "Senere" },
  hu: { title: "Új: szövegértés-ellenőrzés olvasás után", line: "Olvass, koppints a nem világos szavakra, és a végén a Gadit ellenőrzi, hogy megértetted.", cta: "Kipróbálom", close: "Később" },
};

export function WhatsNewReadingCheck({ lang }: { lang: string }) {
  const { user, plan, familyRole, planReady } = useAuth();
  const [kidsMode] = useKidsMode();
  const router = useRouter();
  const href = useHref();
  const [open, setOpen] = useState(false);
  const c = COPY[lang] ?? COPY.en;
  const kid = familyRole === "kid" || kidsMode;

  useEffect(() => {
    if (!user || !planReady || plan !== "deep") return;
    // ?whatsnew=preview shows it any time (for checking before the launch).
    const preview = new URLSearchParams(window.location.search).get("whatsnew") === "preview";
    const now = Date.now();
    if (!preview && (now < START || now > END)) return;
    try { if (!preview && localStorage.getItem(seenKey(user.uid))) return; } catch { return; }
    const t = setTimeout(() => setOpen(true), 1500);
    return () => clearTimeout(t);
  }, [user, plan, planReady]);

  if (!open || !user) return null;
  const done = () => {
    try { localStorage.setItem(seenKey(user.uid), String(Date.now())); } catch { /* private mode */ }
    setOpen(false);
  };
  const rtl = ["he", "ar", "fa"].includes(lang);
  return (
    <>
    <style>{WHATSNEW_CSS}</style>
    <div className="gd-whatsnew-backdrop" role="dialog" aria-modal="true" aria-labelledby="gd-whatsnew-title" dir={rtl ? "rtl" : "ltr"} onClick={done}>
      <div className="gd-whatsnew" onClick={(e) => e.stopPropagation()}>
        <div className="gd-whatsnew-icon" aria-hidden>📖</div>
        <h2 id="gd-whatsnew-title" className="gd-whatsnew-title">{c.title}</h2>
        <p className="gd-whatsnew-line"><QText text={c.line} /></p>
        <div className="gd-whatsnew-actions">
          <button type="button" className="gd-whatsnew-later" onClick={done}>{c.close}</button>
          <button type="button" className="gd-whatsnew-cta" onClick={() => { done(); router.push(href(kid ? "/read?from=homework" : "/read")); }}>{c.cta}</button>
        </div>
      </div>
    </div>
    </>
  );
}

const WHATSNEW_CSS = `
.gd-whatsnew-backdrop{position:fixed;inset:0;z-index:1200;background:rgba(17,24,39,0.45);display:flex;align-items:center;justify-content:center;padding:20px}
.gd-whatsnew{background:var(--paper,#fff);color:var(--ink);border-radius:18px;padding:26px 24px 20px;max-width:420px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.25);border:1px solid var(--hairline,#E5E7EB)}
.gd-whatsnew-icon{font-size:34px;line-height:1;margin-bottom:10px}
.gd-whatsnew-title{margin:0 0 10px;font-size:20px;font-weight:800;line-height:1.25;text-wrap:balance}
.gd-whatsnew-line{margin:0 0 20px;font-size:15px;line-height:1.6;color:var(--ink-muted,#6B7280)}
.gd-whatsnew-actions{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.gd-whatsnew-cta{padding:11px 22px;border-radius:12px;border:none;background:var(--teal,#0EA5A5);color:#fff;font:inherit;font-size:15px;font-weight:700;cursor:pointer}
.gd-whatsnew-later{padding:11px 18px;border-radius:12px;border:1px solid var(--hairline,#E5E7EB);background:transparent;color:var(--ink);font:inherit;font-size:15px;font-weight:500;cursor:pointer}
`;
