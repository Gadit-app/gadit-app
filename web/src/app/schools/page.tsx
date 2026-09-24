import type { Metadata } from "next";
import { SchoolsLandingClient } from "./SchoolsLandingClient";
import { shareMetadata, type ShareCopy } from "@/lib/landing-metadata";

/** Localized share (OG/WhatsApp) copy for the Schools landing, reused by
 *  the in-site page and the standalone /schools/landing campaign page. */
export const SCHOOLS_OG: Record<string, ShareCopy> = {
  he: { title: "Gadit לבתי ספר · כל תלמיד מבין את השיעור", description: "כשתלמיד לא מבין מילה, הוא לא מבין את החומר. Gadit נותן לכל תלמיד להבין כל מילה קשה, בשפה שלו, ב-30+ שפות. בלי חשבונות לתלמידים, בלי הקמה. מנוי שנתי, הזמנה פשוטה." },
  en: { title: "Gadit for Schools · Every student understands the lesson", description: "When a student doesn't understand a word, they don't understand the material. Gadit explains any hard word, in the student's own language, across 30+ languages. No student accounts, no setup. Simple annual plan." },
  ar: { title: "Gadit للمدارس · كل طالب يفهم الدرس", description: "حين لا يفهم الطالب كلمة، لا يفهم المادة. يشرح Gadit أي كلمة صعبة، بلغة الطالب نفسه، بـ 30+ لغة. بلا حسابات للطلاب، بلا إعداد. خطة سنوية بسيطة." },
  ru: { title: "Gadit для школ · Каждый ученик понимает урок", description: "Когда ученик не понимает слово, он не понимает материал. Gadit объясняет любое трудное слово на языке самого ученика, на 30+ языках. Без аккаунтов для учеников, без настройки. Простой годовой план." },
  es: { title: "Gadit para Colegios · Cada alumno entiende la clase", description: "Cuando un alumno no entiende una palabra, no entiende la materia. Gadit explica cualquier palabra difícil, en el idioma del alumno, en 30+ idiomas. Sin cuentas de alumnos, sin configuración. Un plan anual sencillo." },
  pt: { title: "Gadit para Escolas · Cada aluno entende a aula", description: "Quando um aluno não entende uma palavra, ele não entende a matéria. O Gadit explica qualquer palavra difícil, no idioma do próprio aluno, em 30+ idiomas. Sem contas de alunos, sem configuração. Um plano anual simples." },
  fr: { title: "Gadit pour les Écoles · Chaque élève comprend le cours", description: "Quand un élève ne comprend pas un mot, il ne comprend pas la matière. Gadit explique n'importe quel mot difficile, dans la langue de l'élève, dans 30+ langues. Aucun compte élève, aucune configuration. Un forfait annuel simple." },
  de: { title: "Gadit für Schulen · Jeder Schüler versteht den Unterricht", description: "Wenn ein Schüler ein Wort nicht versteht, versteht er den Stoff nicht. Gadit erklärt jedes schwere Wort, in der Sprache des Schülers, in 30+ Sprachen. Keine Schülerkonten, keine Einrichtung. Ein einfaches Jahresabo." },
  cs: { title: "Gadit pro Školy · Každý žák rozumí výuce", description: "Když žák nerozumí slovu, nerozumí ani látce. Gadit vysvětlí jakékoli těžké slovo, v jazyce samotného žáka, ve 20 jazycích. Žádné žákovské účty, žádné nastavení. Jednoduchý roční plán." },
  sk: { title: "Gadit pre Školy · Každý žiak rozumie hodine", description: "Keď žiak nerozumie slovu, nerozumie ani učivu. Gadit vysvetlí akékoľvek ťažké slovo, v jazyku samotného žiaka, v 20 jazykoch. Žiadne žiacke účty, žiadne nastavenie. Jednoduchý ročný plán." },
  it: { title: "Gadit per le Scuole · Ogni studente capisce la lezione", description: "Quando uno studente non capisce una parola, non capisce la materia. Gadit spiega qualsiasi parola difficile, nella lingua dello studente, in 30+ lingue. Nessun account studente, nessuna configurazione. Un semplice piano annuale." },
  ja: { title: "Gadit for Schools · すべての生徒が授業を理解できる", description: "生徒が言葉を理解できないと、教材そのものが理解できません。Gaditはどんな難しい言葉でも、生徒自身の言語で、30+の言語にわたって説明します。生徒用アカウントも初期設定も不要。シンプルな年間プランです。" },
  hi: { title: "Gadit स्कूलों के लिए · हर छात्र पाठ समझता है", description: "जब कोई छात्र किसी शब्द को नहीं समझता, तो वह विषय को भी नहीं समझता। Gadit किसी भी कठिन शब्द को, छात्र की अपनी भाषा में, 30+ भाषाओं में समझाता है। कोई छात्र खाता नहीं, कोई सेटअप नहीं। सरल वार्षिक योजना।" },
  am: { title: "Gadit ለትምህርት ቤቶች · እያንዳንዱ ተማሪ ትምህርቱን ይረዳል", description: "አንድ ተማሪ ቃል ካልተረዳ፣ ትምህርቱን አይረዳም። Gadit ማንኛውንም ከባድ ቃል፣ በተማሪው ቋንቋ፣ በ30+ ቋንቋዎች ያብራራል። የተማሪ መለያ የለም፣ ማዋቀር የለም። ቀላል ዓመታዊ ዕቅድ።" },
  uk: { title: "Gadit для Шкіл · Кожен учень розуміє урок", description: "Коли учень не розуміє слова, він не розуміє й матеріалу. Gadit пояснює будь-яке складне слово, мовою самого учня, 30+ мовами. Жодних учнівських акаунтів, жодного налаштування. Простий річний план." },
  tr: { title: "Okullar için Gadit · Her öğrenci dersi anlar", description: "Bir öğrenci bir kelimeyi anlamadığında, konuyu da anlamaz. Gadit her zor kelimeyi, öğrencinin kendi dilinde, 30+ dilde açıklar. Öğrenci hesabı yok, kurulum yok. Basit bir yıllık plan." },
  pl: { title: "Gadit dla Szkół · Każdy uczeń rozumie lekcję", description: "Gdy uczeń nie rozumie słowa, nie rozumie materiału. Gadit wyjaśnia każde trudne słowo, w języku samego ucznia, w 30+ językach. Bez kont uczniowskich, bez konfiguracji. Prosty plan roczny." },
  fa: { title: "Gadit برای مدارس · هر دانش‌آموز درس را می‌فهمد", description: "وقتی دانش‌آموزی واژه‌ای را نمی‌فهمد، مطلب را هم نمی‌فهمد. Gadit هر واژه دشوار را، به زبان خود دانش‌آموز، در 30+ زبان توضیح می‌دهد. بدون حساب دانش‌آموزی، بدون راه‌اندازی. یک طرح سالانه ساده." },
  id: { title: "Gadit untuk Sekolah · Setiap siswa memahami pelajaran", description: "Ketika seorang siswa tidak memahami sebuah kata, ia tidak memahami materinya. Gadit menjelaskan kata sulit apa pun, dalam bahasa siswa itu sendiri, dalam 30+ bahasa. Tanpa akun siswa, tanpa penyiapan. Paket tahunan yang sederhana." },
  nl: { title: "Gadit voor Scholen · Elke leerling begrijpt de les", description: "Als een leerling een woord niet begrijpt, begrijpt hij de stof niet. Gadit legt elk moeilijk woord uit, in de eigen taal van de leerling, in 30+ talen. Geen leerlingaccounts, geen installatie. Een eenvoudig jaarabonnement." },
  el: { title: "Gadit για Σχολεία · Κάθε μαθητής καταλαβαίνει το μάθημα", description: "Όταν ένας μαθητής δεν καταλαβαίνει μια λέξη, δεν καταλαβαίνει την ύλη. Το Gadit εξηγεί κάθε δύσκολη λέξη, στη γλώσσα του ίδιου του μαθητή, σε 30+ γλώσσες. Χωρίς λογαριασμούς μαθητών, χωρίς εγκατάσταση. Απλό ετήσιο πρόγραμμα." },
  zu: { title: "Gadit Yezikole · Wonke umfundi uyasiqonda isifundo", description: "Uma umfundi engaliqondi igama, akayiqondi nendaba efundwayo. I-Gadit ichaza noma yiliphi igama elinzima, ngolimi lomfundi uqobo, ezilimini ezingu-30+. Awekho ama-akhawunti abafundi, akukho ukusetha. Uhlelo lonyaka olulula." },
  vi: { title: "Gadit cho Trường học · Mọi học sinh đều hiểu bài", description: "Khi học sinh không hiểu một từ, các em sẽ không hiểu bài học. Gadit giải thích bất kỳ từ khó nào, bằng chính ngôn ngữ của học sinh, trên 30+ ngôn ngữ. Không cần tài khoản học sinh, không cần cài đặt. Gói năm đơn giản." },
  fil: { title: "Gadit para sa mga Paaralan · Naiintindihan ng bawat estudyante ang aralin", description: "Kapag hindi naiintindihan ng estudyante ang isang salita, hindi rin niya naiintindihan ang aralin. Ipinapaliwanag ng Gadit ang anumang mahirap na salita, sa sariling wika ng estudyante, sa 30+ na wika. Walang account para sa estudyante, walang setup. Simpleng taunang plano." },
  af: { title: "Gadit vir Skole · Elke leerder verstaan die les", description: "Wanneer 'n leerder 'n woord nie verstaan nie, verstaan hulle nie die leerstof nie. Gadit verduidelik enige moeilike woord, in die leerder se eie taal, in 30+ tale. Geen leerderrekeninge nie, geen opstelling nie. 'n Eenvoudige jaarplan." },
  sw: { title: "Gadit kwa Shule · Kila mwanafunzi anaelewa somo", description: "Mwanafunzi asipoelewa neno, haelewi somo. Gadit inaeleza neno lolote gumu, kwa lugha ya mwanafunzi mwenyewe, katika lugha 30+. Hakuna akaunti za wanafunzi, hakuna usanidi. Mpango rahisi wa mwaka." },
  "zh-CN": { title: "Gadit 学校版 · 让每个学生都听懂课堂", description: "学生不懂一个词，就读不懂整段内容。Gadit 用学生自己的语言解释任何难词，支持 30+ 种语言。无需学生账号，无需设置。简单的年度方案。" },
  "zh-TW": { title: "Gadit 學校版 · 讓每位學生都聽懂課堂", description: "學生不懂一個詞，就讀不懂整段內容。Gadit 以學生自己的語言解釋任何難詞，支援 30+ 種語言。無需學生帳號，無需設定。簡單的年度方案。" },
  ko: { title: "학교용 Gadit · 모든 학생이 수업을 이해합니다", description: "학생이 단어 하나를 이해하지 못하면 수업 내용도 이해하지 못합니다. Gadit은 어려운 단어를 학생 자신의 언어로, 30+개 언어에서 설명합니다. 학생 계정도, 설정도 필요 없습니다. 간단한 연간 요금제." },
  th: { title: "Gadit สำหรับโรงเรียน · นักเรียนทุกคนเข้าใจบทเรียน", description: "เมื่อนักเรียนไม่เข้าใจคำหนึ่งคำ ก็จะไม่เข้าใจเนื้อหา Gadit อธิบายคำยากทุกคำด้วยภาษาของนักเรียนเอง ใน 30+ ภาษา ไม่ต้องมีบัญชีนักเรียน ไม่ต้องตั้งค่า แผนรายปีที่เรียบง่าย" },
  bn: { title: "স্কুলের জন্য Gadit · প্রত্যেক শিক্ষার্থী পাঠ বোঝে", description: "একজন শিক্ষার্থী কোনো শব্দ না বুঝলে, সে বিষয়বস্তুও বোঝে না। Gadit যেকোনো কঠিন শব্দ শিক্ষার্থীর নিজের ভাষায়, 30+ ভাষায় ব্যাখ্যা করে। শিক্ষার্থীর কোনো অ্যাকাউন্ট নেই, কোনো সেটআপ নেই। সহজ বার্ষিক প্ল্যান।" },
  da: { title: "Gadit til Skoler · Hver elev forstår undervisningen", description: "Når en elev ikke forstår et ord, forstår eleven ikke stoffet. Gadit forklarer ethvert svært ord, på elevens eget sprog, på 30+ sprog. Ingen elevkonti, ingen opsætning. En enkel årsplan." },
  hu: { title: "Gadit iskoláknak · Minden diák megérti az órát", description: "Ha egy diák nem ért egy szót, a tananyagot sem érti. A Gadit bármilyen nehéz szót elmagyaráz, a diák saját nyelvén, 30+ nyelven. Nincs diákfiók, nincs beállítás. Egyszerű éves csomag." },
};

/**
 * /schools — public marketing landing page for the Schools tier.
 *
 * Architecture (after Gadi's 2026-06-29 council synthesis + 3-AI
 * review):
 *   1. Hero            — H1 + sub + sticky price chip + CTA
 *   2. The Problem     — pedagogical, "words you don't see kids miss"
 *   3. How It Works    — 3-step setup (code → join → see)
 *   4. Teacher View    — annotated dashboard mockup
 *   5. Privacy Moat    — diagram + "Kahoot-style classroom code"
 *   6. Pricing         — 2 cards, 14-day trial
 *   7. FAQ             — 8 blocker-removal questions
 *   8. Final CTA       — same button repeated
 *
 * Dashboard for paying school owners lives at /schools/manage now;
 * the landing client auto-redirects them on mount so the principal
 * who clicks "Schools" in the topbar lands in their dashboard
 * (not on marketing copy).
 */
export function generateMetadata(): Promise<Metadata> {
  return shareMetadata(SCHOOLS_OG);
}

export default function SchoolsLandingRoute() {
  return <SchoolsLandingClient />;
}
