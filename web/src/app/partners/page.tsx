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
  el: { title: "Πρόγραμμα Συνεργατών Gadit · Κέρδισε από κάθε συνδρομή", description: "Μοιράσου τον προσωπικό σου σύνδεσμο και κέρδισε επαναλαμβανόμενη προμήθεια από κάθε νέο συνδρομητή: 25% τον πρώτο χρόνο, 10% για πάντα. Η συμμετοχή είναι δωρεάν." },
  zu: { title: "Uhlelo Lozakwethu lwe-Gadit · Zuza kukho konke ukubhalisa", description: "Yabelana ngesixhumanisi sakho somuntu siqu futhi uzuze ikhomishani ebuyayo kuwo wonke umbhalisi omusha: 25% onyakeni wokuqala, 10% impilo yonke. Ukujoyina kumahhala." },
  xh: { title: "Inkqubo yamaQabane e-Gadit · Fumana imali kuwo wonke umrhumo", description: "Yabelana ngelinki yakho kwaye ufumane ikhomishini ephindaphindwayo kuwo wonke umbhalisi omtsha: 25% kunyaka wokuqala, 10% ubomi bonke. Ukujoyina kusimahla." },
  nso: { title: "Lenaneo la Balekane la Gadit · Hwetša tšhelete peeletšong ye nngwe le ye nngwe", description: "Abelana linki ya gago gomme o hwetše khomišene ye e boelelwago mongwadišing yo mongwe le yo mongwe yo moswa: 25% ngwageng wa mathomo, 10% bophelo ka moka. Go tsena ke mahala." },
  tn: { title: "Lenaneo la Balekane la Gadit · Kuna mo ikwadisong nngwe le nngwe", description: "Abelana kgolagano ya gago mme o kune komishene e e boelelang mo moikwadising mongwe le mongwe yo moša: 25% mo ngwageng wa ntlha, 10% ka botshelo jotlhe. Go tsena ke mahala." },
  st: { title: "Lenaneo la Balekane la Gadit · Fumana moputso ngodisong e nngwe le e nngwe", description: "Arolelana lehokela la hao mme o fumane khomishene e iphetang ka bangodisi ba batjha kaofela: 25% selemong sa pele, 10% bophelo bohle. Ho kena ke mahala." },
  ts: { title: "Nongonoko wa Vatirhisani wa Gadit · Kumani mali eka mbhaliso wun'wana na wun'wana", description: "Avelanani linki ya n'wina kutani mi kuma khomixini leyi vuyelelaka eka mutsarisi un'wana na un'wana lowuntshwa: 25% hi lembe ro sungula, 10% vutomi hinkwabyo. Ku nghena i mahala." },
  ss: { title: "Luhlelo Lwebalingani be-Gadit · Tfola imali kuko konkhe kubhalisa", description: "Yabelana ngelilinki lakho futsi utfole ikhomishini leyiphindzaphindzwako kuye wonkhe umbhalisi lomusha: 25% emnyakeni wekucala, 10% kuze kube phakadze. Kujoyina kumahhala." },
  ve: { title: "Mbekanyamushumo ya Vhashumisani ya Gadit · Wanani tshelede kha ṅwaliso muṅwe na muṅwe", description: "Kovhekanyani vhukwamani haṋu ni wane khomishini ine ya dzula i tshi vhuya kha muṅwalisi muṅwe na muṅwe muswa: 25% kha ṅwaha wa u thoma, 10% vhutshilo hoṱhe. U dzhena ndi mahala." },
  nr: { title: "Uhlelo Lwabalingani be-Gadit · Zuza ekubhaliseleni ngakunye", description: "Abelana ngelinki yakho bese uzuza ikhomitjhini ephindaphindwako kumbhaliseli omutjha ngamunye: 25% emnyakeni wokuthoma, 10% ipilo yoke. Ukujoyina kumahala." },
  vi: { title: "Chương trình Đối tác Gadit · Kiếm tiền từ mỗi gói đăng ký", description: "Chia sẻ liên kết cá nhân của bạn và nhận hoa hồng định kỳ từ mỗi người đăng ký mới: 25% trong năm đầu, 10% trọn đời. Tham gia miễn phí." },
  fil: { title: "Gadit Partner Program · Kumita sa bawat subscription", description: "Ibahagi ang personal mong link at kumita ng paulit-ulit na komisyon sa bawat bagong subscriber: 25% sa unang taon, 10% habambuhay. Libre ang pagsali." },
  af: { title: "Gadit Vennootprogram · Verdien op elke intekening", description: "Deel jou persoonlike skakel en verdien herhalende kommissie op elke nuwe intekenaar: 25% in die eerste jaar, 10% lewenslank. Gratis om aan te sluit." },
  sw: { title: "Mpango wa Washirika wa Gadit · Pata mapato kwa kila usajili", description: "Shiriki kiungo chako binafsi na upate kamisheni inayojirudia kwa kila msajili mpya: 25% mwaka wa kwanza, 10% maisha yote. Kujiunga ni bure." },
  "zh-CN": { title: "Gadit 合作伙伴计划 · 每笔订阅都有收益", description: "分享你的专属链接，每位新订阅用户都为你带来持续佣金：第一年 25%，之后终身 10%。免费加入。" },
  "zh-TW": { title: "Gadit 合作夥伴計畫 · 每筆訂閱都有收益", description: "分享你的專屬連結，每位新訂閱者都為你帶來持續佣金：第一年 25%，之後終身 10%。免費加入。" },
  ko: { title: "Gadit 파트너 프로그램 · 모든 구독에서 수익을", description: "개인 링크를 공유하고 새 구독자마다 반복 수수료를 받으세요. 첫해 25%, 이후 평생 10%. 가입은 무료입니다." },
  th: { title: "โปรแกรมพาร์ทเนอร์ Gadit · รับรายได้จากทุกการสมัครสมาชิก", description: "แชร์ลิงก์ส่วนตัวของคุณและรับค่าคอมมิชชันต่อเนื่องจากสมาชิกใหม่ทุกคน: 25% ในปีแรก และ 10% ตลอดไป สมัครฟรี" },
  bn: { title: "Gadit পার্টনার প্রোগ্রাম · প্রতিটি সাবস্ক্রিপশনে আয় করুন", description: "আপনার ব্যক্তিগত লিংক শেয়ার করুন এবং প্রতিটি নতুন সাবস্ক্রাইবারের জন্য নিয়মিত কমিশন পান: প্রথম বছরে 25%, আজীবন 10%। যোগ দেওয়া বিনামূল্যে।" },
  da: { title: "Gadit Partnerprogram · Tjen på hvert abonnement", description: "Del dit personlige link og tjen tilbagevendende provision på hver ny abonnent: 25% det første år, 10% på livstid. Gratis at deltage." },
  hu: { title: "Gadit Partnerprogram · Keress minden előfizetésen", description: "Oszd meg a személyes linkedet, és kapj ismétlődő jutalékot minden új előfizető után: 25% az első évben, 10% egy életen át. A csatlakozás ingyenes." },
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
