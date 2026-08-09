import type { Metadata } from "next";
import { PartnersClient } from "./PartnersClient";
import { shareMetadata, type ShareCopy } from "@/lib/landing-metadata";

const PARTNERS_OG: Record<string, ShareCopy> = {
  he: { title: "תוכנית השותפים של Gadit · להרוויח על כל מנוי", description: "אפשר לשתף את הלינק האישי ולהרוויח עמלה על כל מנוי חדש: 25% בשנה הראשונה, 10% לכל החיים. ההצטרפות חינם." },
  en: { title: "Gadit Partner Program · Earn on every subscription", description: "Share your personal link and earn recurring commission on every new subscriber: 25% in year one, 10% for life. Free to join." },
  ar: { title: "برنامج شركاء Gadit · اربح على كل اشتراك", description: "شارك رابطك الشخصي واربح عمولة على كل مشترك جديد: 25% في السنة الأولى، 10% مدى الحياة. الانضمام مجاني." },
  ru: { title: "Партнёрская программа Gadit · Зарабатывайте на каждой подписке", description: "Делитесь личной ссылкой и получайте комиссию с каждого нового подписчика: 25% в первый год, 10% пожизненно. Участие бесплатно." },
  es: { title: "Programa de Socios de Gadit · Gana con cada suscripción", description: "Comparte tu enlace personal y gana comisión recurrente por cada nuevo suscriptor: 25% el primer año, 10% de por vida. Únete gratis." },
  pt: { title: "Programa de Parceiros da Gadit · Ganhe em cada assinatura", description: "Compartilhe seu link pessoal e ganhe comissão recorrente por cada novo assinante: 25% no primeiro ano, 10% para sempre. Participe grátis." },
  fr: { title: "Programme Partenaires de Gadit · Gagnez sur chaque abonnement", description: "Partagez votre lien personnel et gagnez une commission récurrente sur chaque nouvel abonné : 25% la première année, 10% à vie. Adhésion gratuite." },
  de: { title: "Gadit Partnerprogramm · Verdiene an jedem Abo", description: "Teile deinen persönlichen Link und verdiene wiederkehrende Provision für jeden neuen Abonnenten: 25% im ersten Jahr, 10% auf Lebenszeit. Kostenlos beitreten." },
  cs: { title: "Partnerský program Gadit · Vydělávejte na každém předplatném", description: "Sdílejte svůj osobní odkaz a získejte opakovanou provizi za každého nového předplatitele: 25% v prvním roce, 10% navždy. Registrace zdarma." },
  sk: { title: "Partnerský program Gadit · Zarábajte na každom predplatnom", description: "Zdieľajte svoj osobný odkaz a získajte opakovanú províziu za každého nového predplatiteľa: 25% v prvom roku, 10% navždy. Registrácia zdarma." },
  it: { title: "Programma Partner di Gadit · Guadagna su ogni abbonamento", description: "Condividi il tuo link personale e guadagna una commissione ricorrente per ogni nuovo abbonato: 25% il primo anno, 10% a vita. Iscrizione gratuita." },
  ja: { title: "Gadit パートナープログラム · すべてのサブスクリプションで報酬を", description: "個人リンクを共有して、新規登録者ごとに継続報酬を獲得。初年度25%、以降は生涯10%。参加は無料です。" },
  hi: { title: "Gadit पार्टनर प्रोग्राम · हर सब्सक्रिप्शन पर कमाएं", description: "अपना निजी लिंक साझा करें और हर नए सब्सक्राइबर पर आवर्ती कमीशन कमाएं: पहले साल 25%, जीवन भर 10%. शामिल होना मुफ्त है।" },
  am: { title: "የGadit አጋር ፕሮግራም · በእያንዳንዱ ደንበኝነት ገቢ ያግኙ", description: "የግል አገናኝዎን ያጋሩ እና በእያንዳንዱ አዲስ ደንበኛ ተደጋጋሚ ኮሚሽን ያግኙ፦ በመጀመሪያው ዓመት 25%, ለዘላለም 10%. መቀላቀል ነጻ ነው።" },
  uk: { title: "Партнерська програма Gadit · Заробляйте на кожній підписці", description: "Діліться своїм персональним посиланням і отримуйте регулярну комісію за кожного нового підписника: 25% у перший рік, 10% назавжди. Приєднання безкоштовне." },
  tr: { title: "Gadit Ortaklık Programı · Her abonelikten kazanın", description: "Kişisel bağlantınızı paylaşın ve her yeni abone için yinelenen komisyon kazanın: ilk yıl 25%, ömür boyu 10%. Katılım ücretsiz." },
  pl: { title: "Program Partnerski Gadit · Zarabiaj na każdej subskrypcji", description: "Udostępnij swój osobisty link i zarabiaj powtarzalną prowizję za każdego nowego subskrybenta: 25% w pierwszym roku, 10% na zawsze. Dołączenie jest darmowe." },
  fa: { title: "برنامه همکاری Gadit · از هر اشتراک درآمد کسب کنید", description: "لینک شخصی خود را به اشتراک بگذارید و برای هر مشترک جدید کمیسیون مکرر دریافت کنید: 25% در سال اول، 10% مادام‌العمر. عضویت رایگان است." },
  id: { title: "Program Mitra Gadit · Hasilkan dari setiap langganan", description: "Bagikan tautan pribadi Anda dan dapatkan komisi berulang untuk setiap pelanggan baru: 25% di tahun pertama, 10% seumur hidup. Gratis untuk bergabung." },
  nl: { title: "Gadit Partnerprogramma · Verdien aan elk abonnement", description: "Deel je persoonlijke link en verdien terugkerende commissie voor elke nieuwe abonnee: 25% in het eerste jaar, 10% voor het leven. Gratis deelname." },
};

/**
 * /partners — the native partner (affiliate) program marketing + signup
 * page, modelled on yooniz.com/partners. Runs in parallel with the older
 * Affonso surface at /affiliates for now (Gadi 2026-07-30).
 */
export function generateMetadata(): Promise<Metadata> {
  return shareMetadata(PARTNERS_OG);
}

export default function PartnersRoute() {
  return <PartnersClient />;
}
