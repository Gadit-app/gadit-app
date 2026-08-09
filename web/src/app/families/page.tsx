import type { Metadata } from "next";
import { Suspense } from "react";
import FamiliesLandingClient from "./FamiliesLandingClient";
import { shareMetadata, type ShareCopy } from "@/lib/landing-metadata";

/** Localized share (OG/WhatsApp) copy for the Family landing, reused by
 *  the in-site page and the standalone /families/landing campaign page. */
export const FAMILIES_OG: Record<string, ShareCopy> = {
  he: { title: "Gadit למשפחות · מילון חזותי וחכם לכל המשפחה", description: "כל מילה מקבלת הסבר בגובה של ילד, תמונה, דוגמאות ומשחקים. אוצר המילים גדל, ההבנה משתפרת, והילד מצליח יותר בבית הספר. עד 5 ילדים, 14 ימי ניסיון חינם." },
  en: { title: "Gadit for Families · A visual, smart dictionary for the whole family", description: "Every word gets a kid-level explanation, a picture, examples and games. Vocabulary grows, comprehension improves, and your child does better at school. Up to 5 kids, 14-day free trial." },
  ar: { title: "Gadit للعائلات · قاموس ذكي ومصوَّر لكل أفراد العائلة", description: "كل كلمة تحصل على شرح بمستوى الطفل، وصورة، وأمثلة، وألعاب. تنمو الحصيلة اللغوية، ويتحسّن الفهم، ويتقدّم طفلك في المدرسة. حتى 5 أطفال، تجربة مجانية 14 يوماً." },
  ru: { title: "Gadit для семьи · Умный визуальный словарь для всей семьи", description: "Каждое слово получает объяснение на уровне ребёнка, картинку, примеры и игры. Словарный запас растёт, понимание улучшается, ребёнок лучше учится. До 5 детей, 14 дней бесплатно." },
  es: { title: "Gadit para familias · Un diccionario visual e inteligente para toda la familia", description: "Cada palabra recibe una explicación a la altura de los niños, una imagen, ejemplos y juegos. El vocabulario crece, la comprensión mejora y tu hijo rinde mejor en la escuela. Hasta 5 niños, 14 días de prueba gratis." },
  pt: { title: "Gadit para famílias · Um dicionário visual e inteligente para toda a família", description: "Cada palavra recebe uma explicação ao nível das crianças, uma imagem, exemplos e jogos. O vocabulário cresce, a compreensão melhora e o seu filho vai melhor na escola. Até 5 crianças, 14 dias de teste grátis." },
  fr: { title: "Gadit pour les familles · Un dictionnaire visuel et intelligent pour toute la famille", description: "Chaque mot reçoit une explication adaptée aux enfants, une image, des exemples et des jeux. Le vocabulaire s'enrichit, la compréhension s'améliore et votre enfant réussit mieux à l'école. Jusqu'à 5 enfants, 14 jours d'essai gratuit." },
  de: { title: "Gadit für Familien · Ein visuelles, smartes Wörterbuch für die ganze Familie", description: "Jedes Wort bekommt eine kindgerechte Erklärung, ein Bild, Beispiele und Spiele. Der Wortschatz wächst, das Verständnis verbessert sich und Ihr Kind kommt in der Schule besser mit. Bis zu 5 Kinder, 14 Tage kostenlos testen." },
  cs: { title: "Gadit pro rodiny · Vizuální a chytrý slovník pro celou rodinu", description: "Každé slovo dostane vysvětlení srozumitelné dětem, obrázek, příklady a hry. Slovní zásoba roste, porozumění se zlepšuje a vaše dítě si vede ve škole lépe. Až 5 dětí, 14denní zkušební verze zdarma." },
  sk: { title: "Gadit pre rodiny · Vizuálny a inteligentný slovník pre celú rodinu", description: "Každé slovo dostane vysvetlenie zrozumiteľné deťom, obrázok, príklady a hry. Slovná zásoba rastie, porozumenie sa zlepšuje a vaše dieťa sa v škole zlepší. Až 5 detí, 14-dňová skúšobná verzia zadarmo." },
  it: { title: "Gadit per le famiglie · Un dizionario visivo e intelligente per tutta la famiglia", description: "Ogni parola riceve una spiegazione a misura di bambino, un'immagine, esempi e giochi. Il vocabolario cresce, la comprensione migliora e tuo figlio va meglio a scuola. Fino a 5 bambini, 14 giorni di prova gratuita." },
  ja: { title: "Gadit for Families · 家族みんなのためのビジュアルで賢い辞書", description: "どの単語も、子どもにわかる説明、イラスト、例文、ゲームで学べます。語彙が増え、読解力が伸び、お子さまの学校の成績も上がります。最大5人まで、14日間無料でお試しいただけます。" },
  hi: { title: "Gadit परिवारों के लिए · पूरे परिवार के लिए एक सचित्र, स्मार्ट शब्दकोश", description: "हर शब्द के लिए बच्चों के स्तर की व्याख्या, एक चित्र, उदाहरण और खेल मिलते हैं। शब्दावली बढ़ती है, समझ बेहतर होती है और आपका बच्चा स्कूल में बेहतर करता है। 5 बच्चों तक, 14 दिन का मुफ़्त ट्रायल।" },
  am: { title: "Gadit ለቤተሰቦች · ለመላው ቤተሰብ የሚሆን ምስላዊ እና ብልህ መዝገበ ቃላት", description: "እያንዳንዱ ቃል ለልጆች የሚስማማ ማብራሪያ፣ ስዕል፣ ምሳሌዎችና ጨዋታዎች ያገኛል። የቃላት ክምችት ያድጋል፣ ግንዛቤ ይሻሻላል፣ ልጅዎም በትምህርት ቤት የተሻለ ውጤት ያመጣል። እስከ 5 ልጆች ድረስ፣ የ14 ቀናት ነጻ ሙከራ።" },
  uk: { title: "Gadit для родин · Візуальний та розумний словник для всієї родини", description: "Кожне слово отримує пояснення на рівні дитини, зображення, приклади та ігри. Словниковий запас зростає, розуміння покращується, а ваша дитина краще вчиться у школі. До 5 дітей, 14 днів безкоштовно." },
  tr: { title: "Aileler için Gadit · Tüm aile için görsel ve akıllı bir sözlük", description: "Her kelime için çocuk seviyesinde bir açıklama, bir resim, örnekler ve oyunlar gelir. Kelime dağarcığı büyür, anlama gelişir ve çocuğunuz okulda daha başarılı olur. 5 çocuğa kadar, 14 gün ücretsiz deneme." },
  pl: { title: "Gadit dla rodzin · Wizualny i inteligentny słownik dla całej rodziny", description: "Każde słowo otrzymuje wyjaśnienie dostosowane do dzieci, obrazek, przykłady i gry. Słownictwo rośnie, rozumienie się poprawia, a Twoje dziecko lepiej radzi sobie w szkole. Do 5 dzieci, 14-dniowy darmowy okres próbny." },
  fa: { title: "Gadit برای خانواده‌ها · یک فرهنگ لغت تصویری و هوشمند برای کل خانواده", description: "هر واژه توضیحی در سطح کودکان، یک تصویر، مثال‌ها و بازی‌ها دریافت می‌کند. دایره واژگان گسترش می‌یابد، درک مطلب بهتر می‌شود و فرزند شما در مدرسه عملکرد بهتری خواهد داشت. تا 5 کودک، 14 روز آزمایش رایگان." },
  id: { title: "Gadit untuk Keluarga · Kamus visual dan cerdas untuk seluruh keluarga", description: "Setiap kata mendapat penjelasan setingkat anak, gambar, contoh, dan permainan. Kosakata bertambah, pemahaman meningkat, dan anak Anda lebih berprestasi di sekolah. Hingga 5 anak, uji coba gratis 14 hari." },
  nl: { title: "Gadit voor gezinnen · Een visueel, slim woordenboek voor het hele gezin", description: "Elk woord krijgt uitleg op kindniveau, een afbeelding, voorbeelden en spelletjes. De woordenschat groeit, het begrip verbetert en je kind presteert beter op school. Tot 5 kinderen, 14 dagen gratis proberen." },
};

/**
 * /families — the Family-plan campaign landing page.
 *
 * Born from the July 2026 marketing synthesis (our council + three
 * external AIs, unanimous): the cold funnel leads with FAMILY (annual
 * anchor $59/₪199), not Clear; safety is the closer, pain is the
 * hook. This page is the destination for the warm-list email test and
 * later for cold Meta traffic.
 *
 * ?v=relief|anxiety|safe swaps the hero angle so three email variants
 * can share one page while we measure which angle converts. Default:
 * relief (the "stop being the house dictionary" interruption angle).
 *
 * Hebrew-first (the first campaign is the Israeli warm list), English
 * fallback for every other locale.
 */

export function generateMetadata(): Promise<Metadata> {
  return shareMetadata(FAMILIES_OG);
}

export default function FamiliesPage() {
  // In-site version: WITH the top nav, so it lives inside the site and the
  // three products (individuals, Families, Schools) stay reachable. The
  // no-nav campaign version lives at /families/landing.
  return (
    <Suspense fallback={null}>
      <FamiliesLandingClient withNav />
    </Suspense>
  );
}
