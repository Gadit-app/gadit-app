import type { Metadata } from "next";
import { PartnersClient } from "./PartnersClient";
import { shareMetadata, type ShareCopy } from "@/lib/landing-metadata";

const PARTNERS_OG: Record<string, ShareCopy> = {
  he: { title: "תוכנית השותפים של Gadit · להרוויח על כל מנוי", description: "אפשר לשתף את הלינק האישי ולהרוויח עמלה על כל מנוי חדש: 25% בשנה הראשונה, 10% לכל החיים. ההצטרפות חינם." },
  en: { title: "Gadit Partner Program · Earn on every subscription", description: "Share your personal link and earn recurring commission on every new subscriber: 25% in year one, 10% for life. Free to join." },
  ar: { title: "برنامج شركاء Gadit · اربح على كل اشتراك", description: "شارك رابطك الشخصي واربح عمولة على كل مشترك جديد: 25% في السنة الأولى، 10% مدى الحياة. الانضمام مجاني." },
  ru: { title: "Партнёрская программа Gadit · Зарабатывайте на каждой подписке", description: "Делитесь личной ссылкой и получайте комиссию с каждого нового подписчика: 25% в первый год, 10% пожизненно. Участие бесплатно." },
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
