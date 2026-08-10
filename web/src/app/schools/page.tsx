import type { Metadata } from "next";
import { SchoolsLandingClient } from "./SchoolsLandingClient";
import { shareMetadata, type ShareCopy } from "@/lib/landing-metadata";

/** Localized share (OG/WhatsApp) copy for the Schools landing, reused by
 *  the in-site page and the standalone /schools/landing campaign page. */
export const SCHOOLS_OG: Record<string, ShareCopy> = {
  he: { title: "Gadit לבתי ספר · כל תלמיד מבין את השיעור", description: "כשתלמיד לא מבין מילה, הוא לא מבין את החומר. Gadit נותן לכל תלמיד להבין כל מילה קשה, בשפה שלו, ב-21 שפות. בלי חשבונות לתלמידים, בלי הקמה. מנוי שנתי, הזמנה פשוטה." },
  en: { title: "Gadit for Schools · Every student understands the lesson", description: "When a student doesn't understand a word, they don't understand the material. Gadit explains any hard word, in the student's own language, across 21 languages. No student accounts, no setup. Simple annual plan." },
  ar: { title: "Gadit للمدارس · كل طالب يفهم الدرس", description: "حين لا يفهم الطالب كلمة، لا يفهم المادة. يشرح Gadit أي كلمة صعبة، بلغة الطالب نفسه، بـ 21 لغة. بلا حسابات للطلاب، بلا إعداد. خطة سنوية بسيطة." },
  ru: { title: "Gadit для школ · Каждый ученик понимает урок", description: "Когда ученик не понимает слово, он не понимает материал. Gadit объясняет любое трудное слово на языке самого ученика, на 21 языках. Без аккаунтов для учеников, без настройки. Простой годовой план." },
  es: { title: "Gadit para Colegios · Cada alumno entiende la clase", description: "Cuando un alumno no entiende una palabra, no entiende la materia. Gadit explica cualquier palabra difícil, en el idioma del alumno, en 21 idiomas. Sin cuentas de alumnos, sin configuración. Un plan anual sencillo." },
  pt: { title: "Gadit para Escolas · Cada aluno entende a aula", description: "Quando um aluno não entende uma palavra, ele não entende a matéria. O Gadit explica qualquer palavra difícil, no idioma do próprio aluno, em 21 idiomas. Sem contas de alunos, sem configuração. Um plano anual simples." },
  fr: { title: "Gadit pour les Écoles · Chaque élève comprend le cours", description: "Quand un élève ne comprend pas un mot, il ne comprend pas la matière. Gadit explique n'importe quel mot difficile, dans la langue de l'élève, dans 21 langues. Aucun compte élève, aucune configuration. Un forfait annuel simple." },
  de: { title: "Gadit für Schulen · Jeder Schüler versteht den Unterricht", description: "Wenn ein Schüler ein Wort nicht versteht, versteht er den Stoff nicht. Gadit erklärt jedes schwere Wort, in der Sprache des Schülers, in 21 Sprachen. Keine Schülerkonten, keine Einrichtung. Ein einfaches Jahresabo." },
  cs: { title: "Gadit pro Školy · Každý žák rozumí výuce", description: "Když žák nerozumí slovu, nerozumí ani látce. Gadit vysvětlí jakékoli těžké slovo, v jazyce samotného žáka, ve 20 jazycích. Žádné žákovské účty, žádné nastavení. Jednoduchý roční plán." },
  sk: { title: "Gadit pre Školy · Každý žiak rozumie hodine", description: "Keď žiak nerozumie slovu, nerozumie ani učivu. Gadit vysvetlí akékoľvek ťažké slovo, v jazyku samotného žiaka, v 20 jazykoch. Žiadne žiacke účty, žiadne nastavenie. Jednoduchý ročný plán." },
  it: { title: "Gadit per le Scuole · Ogni studente capisce la lezione", description: "Quando uno studente non capisce una parola, non capisce la materia. Gadit spiega qualsiasi parola difficile, nella lingua dello studente, in 21 lingue. Nessun account studente, nessuna configurazione. Un semplice piano annuale." },
  ja: { title: "Gadit for Schools · すべての生徒が授業を理解できる", description: "生徒が言葉を理解できないと、教材そのものが理解できません。Gaditはどんな難しい言葉でも、生徒自身の言語で、20の言語にわたって説明します。生徒用アカウントも初期設定も不要。シンプルな年間プランです。" },
  hi: { title: "Gadit स्कूलों के लिए · हर छात्र पाठ समझता है", description: "जब कोई छात्र किसी शब्द को नहीं समझता, तो वह विषय को भी नहीं समझता। Gadit किसी भी कठिन शब्द को, छात्र की अपनी भाषा में, 21 भाषाओं में समझाता है। कोई छात्र खाता नहीं, कोई सेटअप नहीं। सरल वार्षिक योजना।" },
  am: { title: "Gadit ለትምህርት ቤቶች · እያንዳንዱ ተማሪ ትምህርቱን ይረዳል", description: "አንድ ተማሪ ቃል ካልተረዳ፣ ትምህርቱን አይረዳም። Gadit ማንኛውንም ከባድ ቃል፣ በተማሪው ቋንቋ፣ በ21 ቋንቋዎች ያብራራል። የተማሪ መለያ የለም፣ ማዋቀር የለም። ቀላል ዓመታዊ ዕቅድ።" },
  uk: { title: "Gadit для Шкіл · Кожен учень розуміє урок", description: "Коли учень не розуміє слова, він не розуміє й матеріалу. Gadit пояснює будь-яке складне слово, мовою самого учня, 21 мовами. Жодних учнівських акаунтів, жодного налаштування. Простий річний план." },
  tr: { title: "Okullar için Gadit · Her öğrenci dersi anlar", description: "Bir öğrenci bir kelimeyi anlamadığında, konuyu da anlamaz. Gadit her zor kelimeyi, öğrencinin kendi dilinde, 21 dilde açıklar. Öğrenci hesabı yok, kurulum yok. Basit bir yıllık plan." },
  pl: { title: "Gadit dla Szkół · Każdy uczeń rozumie lekcję", description: "Gdy uczeń nie rozumie słowa, nie rozumie materiału. Gadit wyjaśnia każde trudne słowo, w języku samego ucznia, w 21 językach. Bez kont uczniowskich, bez konfiguracji. Prosty plan roczny." },
  fa: { title: "Gadit برای مدارس · هر دانش‌آموز درس را می‌فهمد", description: "وقتی دانش‌آموزی واژه‌ای را نمی‌فهمد، مطلب را هم نمی‌فهمد. Gadit هر واژه دشوار را، به زبان خود دانش‌آموز، در 21 زبان توضیح می‌دهد. بدون حساب دانش‌آموزی، بدون راه‌اندازی. یک طرح سالانه ساده." },
  id: { title: "Gadit untuk Sekolah · Setiap siswa memahami pelajaran", description: "Ketika seorang siswa tidak memahami sebuah kata, ia tidak memahami materinya. Gadit menjelaskan kata sulit apa pun, dalam bahasa siswa itu sendiri, dalam 21 bahasa. Tanpa akun siswa, tanpa penyiapan. Paket tahunan yang sederhana." },
  nl: { title: "Gadit voor Scholen · Elke leerling begrijpt de les", description: "Als een leerling een woord niet begrijpt, begrijpt hij de stof niet. Gadit legt elk moeilijk woord uit, in de eigen taal van de leerling, in 21 talen. Geen leerlingaccounts, geen installatie. Een eenvoudig jaarabonnement." },
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
