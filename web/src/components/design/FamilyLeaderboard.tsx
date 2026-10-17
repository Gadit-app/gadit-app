"use client";

/**
 * Family leaderboard card (Gadi 2026-10-17): who in the family looked up the
 * most words, parents and children together. Shown on the parent dashboard
 * (/family) and in a family member's own notebook. Data: GET
 * /api/family/leaderboard (distinct words from each member's notebook, this
 * week = last 7 days). Hides itself when the caller has no family, the call
 * fails, or fewer than two members are linked (nothing to compete with).
 */

import { useEffect, useState, type CSSProperties } from "react";
import { useAuth } from "@/lib/auth-context";
import { avatarUrl, defaultMemberName, memberColorFor, type MemberRole } from "@/lib/family";
import { type RankKey } from "@/lib/gamification";
import { rankLabel } from "@/lib/gamification-labels";
import { rankIconSrc } from "@/lib/rank-icons";

type Row = {
  memberId: string;
  name: string;
  role: string;
  colorIndex: number;
  avatarId: string;
  photoUrl: string;
  isYou: boolean;
  week: number;
  allTime: number;
  rankKey: RankKey;
};

type Copy = {
  title: string;
  week: string;
  all: string;
  subWeek: string;
  subAll: string;
  you: string;
  emptyWeek: string;
  emptyAll: string;
};

// [title, week, all, subWeek, subAll, you, emptyWeek, emptyAll]
const C: Record<string, [string, string, string, string, string, string, string, string]> = {
  en: ["Family leaderboard", "This week", "All time", "Different words each person looked up in the last 7 days", "Different words each person has looked up so far", "You", "Nobody has looked up a word this week yet. Who will be first?", "Nobody has looked up a word yet. Who will be first?"],
  he: ["לוח המובילים של המשפחה", "השבוע", "מאז ומעולם", "כמה מילים שונות כל אחד חיפש ב-7 הימים האחרונים", "כמה מילים שונות כל אחד חיפש עד היום", "את/ה", "השבוע עוד אף אחד לא חיפש מילה. מי יהיה הראשון?", "עוד אף אחד לא חיפש מילה. מי יהיה הראשון?"],
  ar: ["لوحة صدارة العائلة", "هذا الأسبوع", "كل الأوقات", "عدد الكلمات المختلفة التي بحث عنها كل واحد في آخر 7 أيام", "عدد الكلمات المختلفة التي بحث عنها كل واحد حتى الآن", "أنت", "لم يبحث أحد عن كلمة هذا الأسبوع بعد. من سيكون الأول؟", "لم يبحث أحد عن كلمة بعد. من سيكون الأول؟"],
  ru: ["Семейная таблица лидеров", "Эта неделя", "За всё время", "Сколько разных слов каждый искал за последние 7 дней", "Сколько разных слов каждый искал за всё время", "Ты", "На этой неделе ещё никто не искал слов. Кто будет первым?", "Ещё никто не искал слов. Кто будет первым?"],
  es: ["Clasificación familiar", "Esta semana", "Desde siempre", "Palabras distintas que cada uno buscó en los últimos 7 días", "Palabras distintas que cada uno ha buscado hasta hoy", "Tú", "Esta semana nadie ha buscado una palabra todavía. ¿Quién será el primero?", "Nadie ha buscado una palabra todavía. ¿Quién será el primero?"],
  pt: ["Ranking da família", "Esta semana", "Desde sempre", "Palavras diferentes que cada um pesquisou nos últimos 7 dias", "Palavras diferentes que cada um pesquisou até hoje", "Você", "Ninguém pesquisou uma palavra esta semana ainda. Quem será o primeiro?", "Ninguém pesquisou uma palavra ainda. Quem será o primeiro?"],
  fr: ["Classement de la famille", "Cette semaine", "Depuis toujours", "Mots différents cherchés par chacun ces 7 derniers jours", "Mots différents cherchés par chacun jusqu'ici", "Toi", "Personne n'a encore cherché de mot cette semaine. Qui sera le premier ?", "Personne n'a encore cherché de mot. Qui sera le premier ?"],
  de: ["Familien-Bestenliste", "Diese Woche", "Insgesamt", "Verschiedene Wörter, die jeder in den letzten 7 Tagen nachgeschlagen hat", "Verschiedene Wörter, die jeder bisher nachgeschlagen hat", "Du", "Diese Woche hat noch niemand ein Wort nachgeschlagen. Wer ist zuerst dran?", "Noch hat niemand ein Wort nachgeschlagen. Wer ist zuerst dran?"],
  cs: ["Rodinný žebříček", "Tento týden", "Celkově", "Kolik různých slov každý vyhledal za posledních 7 dní", "Kolik různých slov každý zatím vyhledal", "Ty", "Tento týden zatím nikdo nevyhledal žádné slovo. Kdo bude první?", "Zatím nikdo nevyhledal žádné slovo. Kdo bude první?"],
  sk: ["Rodinný rebríček", "Tento týždeň", "Celkovo", "Koľko rôznych slov každý vyhľadal za posledných 7 dní", "Koľko rôznych slov každý zatiaľ vyhľadal", "Ty", "Tento týždeň zatiaľ nikto nevyhľadal žiadne slovo. Kto bude prvý?", "Zatiaľ nikto nevyhľadal žiadne slovo. Kto bude prvý?"],
  it: ["Classifica di famiglia", "Questa settimana", "Da sempre", "Parole diverse cercate da ciascuno negli ultimi 7 giorni", "Parole diverse cercate da ciascuno finora", "Tu", "Questa settimana nessuno ha ancora cercato una parola. Chi sarà il primo?", "Nessuno ha ancora cercato una parola. Chi sarà il primo?"],
  ja: ["家族ランキング", "今週", "これまで", "この7日間にそれぞれが調べた異なる単語の数", "これまでにそれぞれが調べた異なる単語の数", "あなた", "今週はまだ誰も単語を調べていません。最初は誰かな？", "まだ誰も単語を調べていません。最初は誰かな？"],
  hi: ["परिवार की लीडरबोर्ड", "इस हफ़्ते", "अब तक", "पिछले 7 दिनों में हर किसी ने कितने अलग शब्द खोजे", "अब तक हर किसी ने कितने अलग शब्द खोजे", "तुम", "इस हफ़्ते अभी तक किसी ने कोई शब्द नहीं खोजा। पहला कौन होगा?", "अभी तक किसी ने कोई शब्द नहीं खोजा। पहला कौन होगा?"],
  am: ["የቤተሰብ መሪዎች ሰሌዳ", "በዚህ ሳምንት", "ከመጀመሪያው ጀምሮ", "በመጨረሻዎቹ 7 ቀናት እያንዳንዱ የፈለጋቸው የተለያዩ ቃላት", "እስካሁን እያንዳንዱ የፈለጋቸው የተለያዩ ቃላት", "አንተ", "በዚህ ሳምንት እስካሁን ማንም ቃል አልፈለገም። መጀመሪያ ማን ይሆናል?", "እስካሁን ማንም ቃል አልፈለገም። መጀመሪያ ማን ይሆናል?"],
  uk: ["Сімейна таблиця лідерів", "Цей тиждень", "За весь час", "Скільки різних слів кожен шукав за останні 7 днів", "Скільки різних слів кожен шукав за весь час", "Ти", "Цього тижня ще ніхто не шукав слів. Хто буде першим?", "Ще ніхто не шукав слів. Хто буде першим?"],
  tr: ["Aile liderlik tablosu", "Bu hafta", "Tüm zamanlar", "Herkesin son 7 günde aradığı farklı kelime sayısı", "Herkesin bugüne kadar aradığı farklı kelime sayısı", "Sen", "Bu hafta henüz kimse kelime aramadı. İlk kim olacak?", "Henüz kimse kelime aramadı. İlk kim olacak?"],
  pl: ["Rodzinny ranking", "Ten tydzień", "Od początku", "Ile różnych słów każdy wyszukał w ostatnich 7 dniach", "Ile różnych słów każdy wyszukał do tej pory", "Ty", "W tym tygodniu nikt jeszcze nie wyszukał słowa. Kto będzie pierwszy?", "Nikt jeszcze nie wyszukał słowa. Kto będzie pierwszy?"],
  fa: ["جدول برترین‌های خانواده", "این هفته", "از اول تا حالا", "تعداد واژه‌های متفاوتی که هر کس در ۷ روز گذشته جست‌وجو کرد", "تعداد واژه‌های متفاوتی که هر کس تا حالا جست‌وجو کرده", "تو", "این هفته هنوز کسی واژه‌ای جست‌وجو نکرده. چه کسی اول می‌شود؟", "هنوز کسی واژه‌ای جست‌وجو نکرده. چه کسی اول می‌شود؟"],
  id: ["Papan peringkat keluarga", "Minggu ini", "Sepanjang waktu", "Jumlah kata berbeda yang dicari tiap orang dalam 7 hari terakhir", "Jumlah kata berbeda yang dicari tiap orang sejauh ini", "Kamu", "Minggu ini belum ada yang mencari kata. Siapa yang pertama?", "Belum ada yang mencari kata. Siapa yang pertama?"],
  nl: ["Familieranglijst", "Deze week", "Altijd", "Verschillende woorden die ieder de afgelopen 7 dagen opzocht", "Verschillende woorden die ieder tot nu toe opzocht", "Jij", "Deze week heeft nog niemand een woord opgezocht. Wie is de eerste?", "Nog niemand heeft een woord opgezocht. Wie is de eerste?"],
  el: ["Κατάταξη της οικογένειας", "Αυτή την εβδομάδα", "Από την αρχή", "Πόσες διαφορετικές λέξεις έψαξε ο καθένας τις τελευταίες 7 ημέρες", "Πόσες διαφορετικές λέξεις έχει ψάξει ο καθένας μέχρι τώρα", "Εσύ", "Αυτή την εβδομάδα κανείς δεν έψαξε ακόμα λέξη. Ποιος θα είναι πρώτος;", "Κανείς δεν έψαξε ακόμα λέξη. Ποιος θα είναι πρώτος;"],
  zu: ["Ibhodi labaholi bomndeni", "Kuleli sonto", "Sonke isikhathi", "Amagama ahlukene lowo nalowo awafune ezinsukwini ezi-7 ezedlule", "Amagama ahlukene lowo nalowo asewafunile kuze kube manje", "Wena", "Akekho osefune igama kuleli sonto. Ubani ozoba ngowokuqala?", "Akekho osefune igama okwamanje. Ubani ozoba ngowokuqala?"],
  xh: ["Ibhodi leenkokeli zosapho", "Kule veki", "Ukusukela ekuqaleni", "Amagama awahlukeneyo umntu ngamnye awakhangeleyo kwiintsuku ezi-7 ezidlulileyo", "Amagama awahlukeneyo umntu ngamnye awakhangeleyo ukuza kuthi ga ngoku", "Wena", "Akukho mntu ukhangele igama kule veki okwangoku. Ngubani oza kuba ngowokuqala?", "Akukho mntu ukhangele igama okwangoku. Ngubani oza kuba ngowokuqala?"],
  nso: ["Lenaneo la baetapele ba lapa", "Beke ye", "Go tloga mathomong", "Mantšu a fapanego ao yo mongwe le yo mongwe a a nyakilego matšatšing a 7 a go feta", "Mantšu a fapanego ao yo mongwe le yo mongwe a a nyakilego go fihla bjale", "Wena", "Ga go yo a nyakilego lentšu bekeng ye. Ke mang yo a tlago go ba wa mathomo?", "Ga go yo a nyakilego lentšu go fihla bjale. Ke mang yo a tlago go ba wa mathomo?"],
  tn: ["Lenaane la baeteledipele ba lelapa", "Beke eno", "Go tswa kwa tshimologong", "Mafoko a a farologaneng a mongwe le mongwe a a batlileng mo malatsing a le 7 a a fetileng", "Mafoko a a farologaneng a mongwe le mongwe a a batlileng go fitlha jaanong", "Wena", "Ga go ope yo o batlileng lefoko mo bekeng eno. Ke mang yo o tla nnang wa ntlha?", "Ga go ope yo o batlileng lefoko go fitlha jaanong. Ke mang yo o tla nnang wa ntlha?"],
  st: ["Lenane la baetapele ba lelapa", "Bekeng ena", "Ho tloha qalong", "Mantswe a fapaneng ao e mong le e mong a a batlileng matsatsing a 7 a fetileng", "Mantswe a fapaneng ao e mong le e mong a a batlileng ho fihlela jwale", "Wena", "Ha ho motho ya batlileng lentswe bekeng ena. Ke mang ya tla ba wa pele?", "Ha ho motho ya batlileng lentswe ho fihlela jwale. Ke mang ya tla ba wa pele?"],
  ts: ["Xiyimo xa varhangeri va ndyangu", "Vhiki leri", "Ku sukela eku sunguleni", "Marito yo hambana lawa un'wana na un'wana a ma laveke eka masiku ya 7 lama hundzeke", "Marito yo hambana lawa un'wana na un'wana a ma laveke ku fikela sweswi", "Wena", "A ku na loyi a laveke rito evhikini leri. I mani loyi a nga ta va wo sungula?", "A ku na loyi a laveke rito ku fikela sweswi. I mani loyi a nga ta va wo sungula?"],
  ss: ["Libhodi lebaholi bemndeni", "Leliviki", "Kusukela ekucaleni", "Emagama lehlukene lowo nalowo latifune emalangeni la-7 langetulu", "Emagama lehlukene lowo nalowo lasatifunile kute kube nyalo", "Wena", "Kute namunye losafune ligama kuleliviki. Ngubani lotawuba wekucala?", "Kute namunye losafune ligama. Ngubani lotawuba wekucala?"],
  ve: ["Bodo ya vharangaphanḓa vha muṱa", "Vhege iyi", "U bva mathomoni", "Maipfi o fhambanaho ane muthu munwe na munwe a a ṱoḓa maḓuvhani a 7 o fhiraho", "Maipfi o fhambanaho ane muthu munwe na munwe o a ṱoḓa u swika zwino", "Iwe", "A hu na we a ṱoḓa ipfi vhegeni iyi. Ndi nnyi ane a ḓo vha wa u thoma?", "A hu na we a ṱoḓa ipfi u swika zwino. Ndi nnyi ane a ḓo vha wa u thoma?"],
  nr: ["Ibhodi labarholi bomndeni", "Kileveke", "Kusukela ekuthomeni", "Amezwi ahlukeneko loyo naloyo awafunileko emalangeni ali-7 adlulileko", "Amezwi ahlukeneko loyo naloyo awafunileko bekube nje", "Wena", "Akakho ofune ilizwi kileveke. Ngubani ozokuba ngowokuthoma?", "Akakho ofune ilizwi bekube nje. Ngubani ozokuba ngowokuthoma?"],
  vi: ["Bảng xếp hạng gia đình", "Tuần này", "Từ trước đến nay", "Số từ khác nhau mỗi người đã tra trong 7 ngày qua", "Số từ khác nhau mỗi người đã tra từ trước đến nay", "Bạn", "Tuần này chưa ai tra từ nào. Ai sẽ là người đầu tiên?", "Chưa ai tra từ nào. Ai sẽ là người đầu tiên?"],
  fil: ["Leaderboard ng pamilya", "Ngayong linggo", "Mula noon", "Bilang ng magkakaibang salitang hinanap ng bawat isa sa nakaraang 7 araw", "Bilang ng magkakaibang salitang hinanap ng bawat isa hanggang ngayon", "Ikaw", "Wala pang naghanap ng salita ngayong linggo. Sino ang mauuna?", "Wala pang naghanap ng salita. Sino ang mauuna?"],
  af: ["Familie-ranglys", "Hierdie week", "Nog altyd", "Verskillende woorde wat elkeen die afgelope 7 dae opgesoek het", "Verskillende woorde wat elkeen tot dusver opgesoek het", "Jy", "Niemand het hierdie week nog 'n woord opgesoek nie. Wie sal eerste wees?", "Niemand het nog 'n woord opgesoek nie. Wie sal eerste wees?"],
  sw: ["Ubao wa viongozi wa familia", "Wiki hii", "Tangu mwanzo", "Idadi ya maneno tofauti ambayo kila mmoja alitafuta katika siku 7 zilizopita", "Idadi ya maneno tofauti ambayo kila mmoja ametafuta hadi sasa", "Wewe", "Bado hakuna aliyetafuta neno wiki hii. Nani atakuwa wa kwanza?", "Bado hakuna aliyetafuta neno. Nani atakuwa wa kwanza?"],
  "zh-CN": ["家庭排行榜", "本周", "全部", "每个人在过去 7 天查过的不同单词数", "每个人至今查过的不同单词数", "你", "本周还没有人查过单词。谁会是第一个？", "还没有人查过单词。谁会是第一个？"],
  "zh-TW": ["家庭排行榜", "本週", "全部", "每個人在過去 7 天查過的不同單字數", "每個人至今查過的不同單字數", "你", "本週還沒有人查過單字。誰會是第一個？", "還沒有人查過單字。誰會是第一個？"],
  ko: ["가족 순위표", "이번 주", "전체", "지난 7일 동안 각자 찾아본 서로 다른 단어 수", "지금까지 각자 찾아본 서로 다른 단어 수", "나", "이번 주에는 아직 아무도 단어를 찾지 않았어요. 누가 처음일까요?", "아직 아무도 단어를 찾지 않았어요. 누가 처음일까요?"],
  th: ["กระดานผู้นำของครอบครัว", "สัปดาห์นี้", "ทั้งหมด", "จำนวนคำที่ไม่ซ้ำกันที่แต่ละคนค้นหาใน 7 วันที่ผ่านมา", "จำนวนคำที่ไม่ซ้ำกันที่แต่ละคนค้นหามาจนถึงตอนนี้", "คุณ", "สัปดาห์นี้ยังไม่มีใครค้นหาคำเลย ใครจะเป็นคนแรก?", "ยังไม่มีใครค้นหาคำเลย ใครจะเป็นคนแรก?"],
  bn: ["পরিবারের লিডারবোর্ড", "এই সপ্তাহে", "সব সময়", "গত ৭ দিনে প্রত্যেকে কতগুলো আলাদা শব্দ খুঁজেছে", "এখন পর্যন্ত প্রত্যেকে কতগুলো আলাদা শব্দ খুঁজেছে", "তুমি", "এই সপ্তাহে এখনো কেউ কোনো শব্দ খোঁজেনি। কে হবে প্রথম?", "এখনো কেউ কোনো শব্দ খোঁজেনি। কে হবে প্রথম?"],
  da: ["Familiens rangliste", "Denne uge", "Altid", "Forskellige ord, hver især har slået op de sidste 7 dage", "Forskellige ord, hver især har slået op indtil nu", "Dig", "Ingen har slået et ord op i denne uge endnu. Hvem bliver den første?", "Ingen har slået et ord op endnu. Hvem bliver den første?"],
  hu: ["Családi ranglista", "Ezen a héten", "Összesen", "Hány különböző szót keresett ki mindenki az elmúlt 7 napban", "Hány különböző szót keresett ki mindenki eddig", "Te", "Ezen a héten még senki sem keresett szót. Ki lesz az első?", "Még senki sem keresett szót. Ki lesz az első?"],
};

function copyFor(lang: string): Copy {
  const a = C[lang] ?? C.en;
  return { title: a[0], week: a[1], all: a[2], subWeek: a[3], subAll: a[4], you: a[5], emptyWeek: a[6], emptyAll: a[7] };
}

const MEDAL = ["#D4A017", "#9AA4AF", "#B87333"]; // gold, silver, bronze

const CSS = `
.fam-lb {
  background: var(--surface, #fff);
  border: 1px solid var(--rule, rgba(31,41,55,0.09));
  border-radius: 22px;
  padding: 20px 20px 14px;
  box-shadow: 0 8px 24px rgba(31,41,55,0.06);
  margin: 0 0 22px;
  color: var(--ink, #1f2937);
}
.fam-lb-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.fam-lb-title { margin: 0; font-size: 17px; font-weight: 800; display: flex; align-items: center; gap: 8px; }
.fam-lb-toggle { display: inline-flex; background: color-mix(in srgb, var(--ink, #1f2937) 6%, transparent); border-radius: 999px; padding: 3px; }
.fam-lb-toggle button {
  border: 0; background: transparent; color: var(--ink-muted, #6b7280);
  font: inherit; font-size: 13px; font-weight: 700; padding: 6px 12px; border-radius: 999px; cursor: pointer;
  transition: background 140ms ease, color 140ms ease;
}
.fam-lb-toggle button[aria-pressed="true"] { background: var(--surface, #fff); color: var(--ink, #1f2937); box-shadow: 0 1px 4px rgba(31,41,55,0.12); }
.fam-lb-sub { margin: 8px 0 12px; font-size: 13px; color: var(--ink-muted, #6b7280); line-height: 1.45; }
.fam-lb-empty { margin: 0 0 10px; font-size: 14px; font-weight: 600; color: var(--ink-soft, #3f4856); }
.fam-lb-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; }
.fam-lb-row { display: flex; align-items: center; gap: 11px; padding: 8px 10px; border-radius: 14px; }
.fam-lb-row.is-you { background: color-mix(in srgb, var(--accent, #0EA5A5) 12%, transparent); }
.fam-lb-pos {
  width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 800; color: var(--ink-muted, #6b7280);
  font-variant-numeric: tabular-nums;
}
.fam-lb-pos.is-medal { color: #fff; background: var(--medal); box-shadow: 0 0 0 3px color-mix(in srgb, var(--medal) 25%, transparent); }
.fam-lb-av {
  width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-weight: 800; font-size: 15px;
}
.fam-lb-av img { width: 100%; height: 100%; object-fit: cover; }
.fam-lb-who { flex: 1; min-width: 0; display: grid; gap: 1px; }
.fam-lb-name { font-weight: 800; font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.fam-lb-you { margin-inline-start: 6px; font-size: 11.5px; font-weight: 800; color: var(--accent, #0EA5A5); }
.fam-lb-rank { font-size: 12.5px; color: var(--ink-muted, #6b7280); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.fam-lb-num { font-size: 20px; font-weight: 800; font-variant-numeric: tabular-nums; color: var(--ink, #1f2937); }
.fam-lb-num.is-zero { color: var(--ink-faint, #9ca3af); }
`;

export function FamilyLeaderboard({ lang, dir }: { lang: string; dir: "ltr" | "rtl" }) {
  const { user } = useAuth();
  const t = copyFor(lang);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [view, setView] = useState<"week" | "all">("week");

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch("/api/family/leaderboard", { headers: { Authorization: `Bearer ${idToken}` } });
        if (!res.ok) return;
        const data = (await res.json()) as { members?: Row[] };
        if (!cancelled && Array.isArray(data.members)) setRows(data.members);
      } catch {
        /* the board is a nice-to-have; never disturb the page */
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  if (!rows || rows.length < 2) return null;

  const val = (r: Row) => (view === "week" ? r.week : r.allTime);
  const sorted = [...rows].sort((a, b) => val(b) - val(a) || b.allTime - a.allTime || a.name.localeCompare(b.name));
  // Ties share a place (1, 1, 3), so two kids with the same count both get gold.
  const places: number[] = [];
  sorted.forEach((r, i) => { places.push(i > 0 && val(r) === val(sorted[i - 1]) ? places[i - 1] : i + 1); });
  const nobody = sorted.every((r) => val(r) === 0);

  return (
    <section className="fam-lb" dir={dir} aria-label={t.title}>
      <style>{CSS}</style>
      <div className="fam-lb-head">
        <h2 className="fam-lb-title"><span aria-hidden>🏆</span>{t.title}</h2>
        <div className="fam-lb-toggle" role="group" aria-label={t.title}>
          <button type="button" aria-pressed={view === "week"} onClick={() => setView("week")}>{t.week}</button>
          <button type="button" aria-pressed={view === "all"} onClick={() => setView("all")}>{t.all}</button>
        </div>
      </div>
      <p className="fam-lb-sub">{view === "week" ? t.subWeek : t.subAll}</p>
      {nobody && <p className="fam-lb-empty">{view === "week" ? t.emptyWeek : t.emptyAll}</p>}
      <ol className="fam-lb-list">
        {sorted.map((r, i) => {
          const place = places[i];
          const n = val(r);
          const medal = n > 0 && place <= 3 ? MEDAL[place - 1] : null;
          const name = r.name || defaultMemberName((r.role as MemberRole) || "boy", lang);
          const img = r.photoUrl || avatarUrl(r.avatarId);
          return (
            <li key={r.memberId} className={`fam-lb-row${r.isYou ? " is-you" : ""}`}>
              <span
                className={`fam-lb-pos${medal ? " is-medal" : ""}`}
                style={medal ? ({ ["--medal" as string]: medal } as CSSProperties) : undefined}
              >
                {place}
              </span>
              <span className="fam-lb-av" style={{ background: memberColorFor(r) }} aria-hidden>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {img ? <img src={img} alt="" /> : (name.trim().charAt(0).toUpperCase() || "?")}
              </span>
              <span className="fam-lb-who">
                <span className="fam-lb-name">
                  <bdi>{name}</bdi>
                  {r.isYou && <span className="fam-lb-you">{t.you}</span>}
                </span>
                <span className="fam-lb-rank">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={rankIconSrc(r.rankKey)} alt="" width={20} height={20} style={{ width: 20, height: 20, objectFit: "contain", verticalAlign: "-5px", marginInlineEnd: 4 }} />
                  {rankLabel(r.rankKey, lang)}
                </span>
              </span>
              <span className={`fam-lb-num${n === 0 ? " is-zero" : ""}`}>{n}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
