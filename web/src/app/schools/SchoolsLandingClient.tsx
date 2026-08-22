"use client";

/**
 * SchoolsLandingClient — public marketing landing page for the Schools
 * tier. Eight sections, council-vetted copy. See web/src/app/schools/
 * page.tsx for the architecture summary.
 *
 * Auto-redirect: school owners (users with a schoolId on their user
 * doc) who land here get bounced to /schools/manage immediately. This
 * matches what Notion/Canva/Quizlet do — same URL, different surface
 * depending on auth state. Anonymous and Basic/Clear/Deep/Family
 * users see the marketing page.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { v2 } from "@/lib/i18n-v2";
import { LangSwitchMobile } from "@/components/LangSwitchMobile";
import { LangSwitcher } from "@/components/design/LangSwitcher";
import { LANGUAGES } from "@/lib/i18n";
import { SchoolOrderForm } from "./SchoolOrderForm";
import { WbShellNav, WbShellBurger } from "@/components/design/WbShellChrome";
import { WbUserMenu } from "@/components/design/WbUserMenu";
import { ShareButton, APP_SHARE_COPY } from "@/components/ShareButton";
import { StartFreeCTA } from "@/components/StartFreeCTA";
import { SCHOOLS_TIERS, SCHOOLS_TIER_LIST, studentsUpTo, type SchoolsTierKey } from "@/lib/schools-prices";

// Same languages as HomeClient — duplicated rather than refactored so
// the topbar on /schools mirrors the homepage exactly without coupling
// the two files.
// Single source of truth: the shared LANGUAGES registry, so this switcher
// never drifts behind newly-added UI languages.
const LANGS = LANGUAGES;

function LangSwitch() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  const active = LANGS.find((l) => l.code === lang) ?? LANGS[1];
  return (
    <div ref={wrapRef} className="wb-lang-chip-wrap">
      <button type="button" className="wb-lang-chip" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" />
        </svg>
        {active.label}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <ul className="wb-lang-menu" role="listbox">
          {LANGS.map((l) => (
            <li key={l.code}>
              <button type="button" role="option" aria-selected={l.code === lang} className={l.code === lang ? "is-active" : ""} onClick={() => { setLang(l.code); setOpen(false); }}>
                <img className="wb-lang-flag" src={`https://flagcdn.com/40x30/${l.flag}.png`} srcSet={`https://flagcdn.com/80x60/${l.flag}.png 2x`} width="20" height="15" alt="" loading="lazy" />{l.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type T = {
  // Hero
  heroH1: string;
  heroSub: string;
  heroCta: string;
  heroPriceChip: string;
  heroTrust: string;
  // Problem
  probTag: string;
  probH2: string;
  probBody1: string;
  probBody2: string;
  probCallout1Title: string;
  probCallout1Body: string;
  probCallout2Title: string;
  probCallout2Body: string;
  probCallout3Title: string;
  probCallout3Body: string;
  // How It Works
  howTag: string;
  howH2: string;
  howSub: string;
  howStep1Title: string;
  howStep1Body: string;
  howStep2Title: string;
  howStep2Body: string;
  howStep3Title: string;
  howStep3Body: string;
  // Teacher View
  teacherTag: string;
  teacherH2: string;
  teacherSub: string;
  teacherB1: string;
  teacherB2: string;
  teacherB3: string;
  teacherB4: string;
  // Privacy
  privTag: string;
  privH2: string;
  privSub: string;
  privPoint1: string;
  privPoint2: string;
  privPoint3: string;
  privPoint4: string;
  privKahoot: string;
  // Pricing
  priceTag: string;
  priceH2: string;
  priceSub: string;
  priceSmallName: string;
  priceSmallAmount: string;
  priceSmallStudents: string;
  priceLargeName: string;
  priceLargeAmount: string;
  priceLargeStudents: string;
  priceIncludesTitle: string;
  priceIncludes: string[];
  priceCta: string;
  priceLarger: string;
  // FAQ
  faqTag: string;
  faqH2: string;
  faq: Array<{ q: string; a: string }>;
  // Final CTA
  finalH2: string;
  finalBody: string;
  finalCta: string;
  finalNote: string;
  // Mockup labels
  mockupRoster: string;
  mockupSearches: string;
  mockupStudent1: string;
  mockupStudent2: string;
  mockupStudent3: string;
  mockupWordExample: string;
  mockupExampleDef: string;
  mockupExampleEx: string;
};

const COPY: Record<string, T> = {
  en: {
    heroH1: "Every student understands the lesson.",
    heroSub: "Any hard word, in any of 30+ languages, explained on the spot.",
    heroCta: "See pricing and order",
    heroPriceChip: "From $97 / month",
    heroTrust: "Self-serve. Cancel anytime.",
    probTag: "The Problem",
    probH2: "A student who doesn't understand a word can't understand the sentence.",
    probBody1: "A student misses one word. They don't raise their hand. They think they roughly understand. The teacher moves on. Five words later, the paragraph is blurry. Five paragraphs later, the lesson is lost.",
    probBody2: "Most students who fall behind aren't unintelligent. They have a stack of words they never fully understood. Every new word built on those compounds the gap. The cause is invisible to the teacher.",
    probCallout1Title: "The compounding gap",
    probCallout1Body: "Unlearned words build an invisible barrier to every future lesson.",
    probCallout2Title: "The time drain",
    probCallout2Body: "Teachers lose 5–10 minutes per lesson on definitions.",
    probCallout3Title: "The silent dropout",
    probCallout3Body: "Students zone out when a paragraph has too many unknown words.",
    howTag: "How It Works",
    howH2: "Set up in 2 minutes. No IT.",
    howSub: "The same friction-free classroom code pattern that already works for quiz games, built for word comprehension instead.",
    howStep1Title: "Create a classroom code",
    howStep1Body: "The principal or coordinator creates a classroom in the dashboard. The system generates a 6-character code. Print it on a sticker for the classroom computer.",
    howStep2Title: "Students join, no accounts",
    howStep2Body: "Students visit gadit.app/c/CODE in any browser, pick their name from the roster (one click), and start typing words. No app install, no email, no password.",
    howStep3Title: "Teachers see what the class searched",
    howStep3Body: "Every search lands in the dashboard, tagged with the student's name. You see what each student looked up, when, and which words the class struggled with collectively.",
    teacherTag: "The Teacher View",
    teacherH2: "The dashboard you've been asking for.",
    teacherSub: "Not vague engagement metrics. Specific words, specific students, specific moments.",
    teacherB1: "Per-student search history with timestamps",
    teacherB2: "Class-wide most-searched words this week",
    teacherB3: "Repeated lookups that flag fragile understanding",
    teacherB4: "Filterable by date, student, or word",
    privTag: "Privacy by Design",
    privH2: "Total visibility for teachers. Zero data risk for schools.",
    privSub: "We collect no student PII. Not because we hide it well, because we never collect it. The architecture is the compliance.",
    privPoint1: "No student accounts. No emails, no passwords, no IDs.",
    privPoint2: "No personal data leaves the school. Searches are tagged by roster name only.",
    privPoint3: "Classroom codes work only during school hours. Configurable per school.",
    privPoint4: "COPPA, GDPR-K, and Israeli student-privacy law all comfortably handled.",
    privKahoot: "Joins as easily as a classroom quiz game. Built for word comprehension and teacher visibility.",
    priceTag: "Pricing",
    priceH2: "Annual pricing, by school size.",
    priceSub: "Self-serve via Stripe. No sales calls, no demos, no purchase orders.",
    priceSmallName: "Schools",
    priceSmallAmount: "$69",
    priceSmallStudents: "Up to 100 students",
    priceLargeName: "Schools Large",
    priceLargeAmount: "$149",
    priceLargeStudents: "Up to 500 students",
    priceIncludesTitle: "Both plans include",
    priceIncludes: [
      "Unlimited classrooms",
      "Full teacher dashboard",
      "Student picker roster",
      "Time-bound classroom codes",
      "Student UI in 30+ languages",
      "Simple annual order, below the procurement threshold",
      "Pronunciation practice: hear and say any word",
    ],
    priceCta: "See pricing and order",
    priceLarger: "Need more than 1,000 students? Contact us about district plans.",
    faqTag: "FAQ",
    faqH2: "Questions principals ask before they order.",
    faq: [
      {
        q: "If there are no logins, how do I know which student searched what?",
        a: "The teacher pre-loads a roster of first names in the dashboard. When a student visits the classroom URL, they pick their name with one click. Every search is tagged to that name. No email, no password, no PII is collected.",
      },
      {
        q: "Is this COPPA-safe? Will I get a parent complaint?",
        a: "Yes. Gadit collects no student personal information at all. No account creation, no email collection, no birthdays, no IDs. There is no data to misuse. The architecture comfortably exceeds COPPA, GDPR-K, and Israeli student privacy law.",
      },
      {
        q: "Do students need to install an app?",
        a: "No. Any browser works. Students visit gadit.app/c/CODE on the classroom computer (or any device with a browser). No app store, no IT involvement.",
      },
      {
        q: "Does this require IT or SSO setup?",
        a: "No. A principal or grade coordinator creates the classroom in two minutes and shares the code with teachers. IT is not involved at any step.",
      },
      {
        q: "What does the dashboard actually show?",
        a: "Each student's word searches with timestamps, the words the class searched most this week, and patterns of repeated lookups that signal fragile understanding. You see the real classroom comprehension data, not vague engagement metrics.",
      },
      {
        q: "Can it be used outside class hours?",
        a: "Classroom codes are bound to the school's active hours (default Sunday–Thursday 7:30–15:00, configurable). Outside that window the code gives basic dictionary access but no extended features. This prevents the school code from becoming a free 24/7 substitute for the Family tier.",
      },
      {
        q: "What if my school has more than 500 students?",
        a: "Pick by student count: up to 100 students is $97/month, up to 500 is $297/month, and up to 1,000 is $497/month. For more than 1,000 students or multi-site districts, contact us for a custom plan.",
      },
      {
        q: "How does Gadit explain a word? Is it just a translation?",
        a: "Gadit is not a translation dictionary. Gadit defines and explains words. For each word it gives every meaning, three example sentences per meaning, etymology, and a context-aware mode where students paste the sentence and Gadit picks the right meaning. The student's UI is in their language, but the explanation depth is the same in every UI language.",
      },
    ],
    finalH2: "Stop the silent failure mode.",
    finalBody: "Give your teachers the tool to see exactly what their class doesn't understand. Getting started takes 2 minutes. No IT, no procurement, no parent forms.",
    finalCta: "See pricing and order",
    finalNote: "Pay annually by bank transfer against a tax invoice. No tender needed.",
    mockupRoster: "Class roster, 22 students",
    mockupSearches: "Most searched this week",
    mockupStudent1: "Maya searched photosynthesis",
    mockupStudent2: "Yossi searched mitochondria ×2",
    mockupStudent3: "Noa searched democracy",
    mockupWordExample: "photosynthesis",
    mockupExampleDef: "The process by which green plants use sunlight to convert water and carbon dioxide into food.",
    mockupExampleEx: "Photosynthesis takes place mostly in the leaves of the plant.",
  },
  zu: {
    heroH1: "Wonke umfundi uyasiqonda isifundo.",
    heroSub: "Noma yiliphi igama elinzima, kunoma yiziphi izilimi ezingama-21, lichazwa khona lapho.",
    heroCta: "Buka amanani bese uodola",
    heroPriceChip: "Kusukela ku-$97 / ngenyanga",
    heroTrust: "Uzisebenzela wena. Ungakhansela noma nini.",
    probTag: "Inkinga",
    probH2: "Umfundi ongaliqondi igama akakwazi ukuwuqonda umusho.",
    probBody1: "Umfundi uphuthelwa igama elilodwa. Akaphakamisi isandla. Ucabanga ukuthi uqonda cishe. Uthisha uyaqhubeka. Emva kwamagama amahlanu, isigaba sesifiphele. Emva kwezigaba ezinhlanu, isifundo silahlekile.",
    probBody2: "Iningi labafundi abasalela ngemuva akubona abangahlakaniphile. Banenqwaba yamagama abangazange bawaqonde ngokugcwele. Igama elisha ngalinye elakhelwe phezu kwalawo landisa igebe. Imbangela ayibonakali kuthisha.",
    probCallout1Title: "Igebe elandayo",
    probCallout1Body: "Amagama angafundwanga akha uthango olungabonakali kuzo zonke izifundo ezizayo.",
    probCallout2Title: "Ukuchitheka kwesikhathi",
    probCallout2Body: "Othisha balahlekelwa imizuzu emi-5 kuya kwe-10 esifundweni ngasinye bechaza amagama.",
    probCallout3Title: "Ukuyeka okuthulile",
    probCallout3Body: "Abafundi bayaphazamiseka uma isigaba sinamagama amaningi kakhulu angaziwa.",
    howTag: "Isebenza Kanjani",
    howH2: "Sethwa ngemizuzu emi-2. Akudingeki i-IT.",
    howSub: "Iphethini efanayo yekhodi yekilasi elula esivele isebenza emidlalweni yemibuzo, yakhelwe ukuqonda amagama esikhundleni.",
    howStep1Title: "Dala ikhodi yekilasi",
    howStep1Body: "Uthishanhloko noma umqondisi udala ikilasi kudeshibhodi. Uhlelo lukhiqiza ikhodi enezinhlamvu ezi-6. Yiphrinte kusitikha sekhompyutha yekilasi.",
    howStep2Title: "Abafundi bayajoyina, ngaphandle kwama-akhawunti",
    howStep2Body: "Abafundi bavakashela i-gadit.app/c/CODE kunoma yisiphi isiphequluli, bakhethe igama labo ohlwini (ukuchofoza kanye), baqale ukuthayipha amagama. Akukho ukufaka uhlelo lokusebenza, akukho i-imeyili, akukho iphasiwedi.",
    howStep3Title: "Othisha babona lokho ikilasi elikucingile",
    howStep3Body: "Konke ukusesha kufika kudeshibhodi, kunamathiselwe igama lomfundi. Ubona ukuthi umfundi ngamunye ucinge ini, nini, futhi yimaphi amagama ikilasi elibe nobunzima kuwo lonke.",
    teacherTag: "Ukubuka Kukathisha",
    teacherH2: "Ideshibhodi ebeniyicela.",
    teacherSub: "Hhayi izilinganiso ezimfiliba zokuzibandakanya. Amagama athize, abafundi abathize, izikhathi ezithize.",
    teacherB1: "Umlando wokusesha ngomfundi ngamunye nezikhathi",
    teacherB2: "Amagama acinge kakhulu ekilasini lonke kuleli sonto",
    teacherB3: "Ukusesha okuphindaphindiwe okuveza ukuqonda okubuthakathaka",
    teacherB4: "Kungahlungwa ngedethi, umfundi, noma igama",
    privTag: "Ubumfihlo Ngokwakheka",
    privH2: "Ukubona okuphelele kothisha. Akukho ubungozi bedatha ezikoleni.",
    privSub: "Asiqoqi mininingwane yomuntu siqu yomfundi. Hhayi ngoba siyifihla kahle, kodwa ngoba asikaze siyiqoqe. Isakhiwo yiso uqobo ukuthobela.",
    privPoint1: "Akukho ma-akhawunti abafundi. Akukho ma-imeyili, akukho maphasiwedi, akukho bunikazi.",
    privPoint2: "Ayikho idatha yomuntu siqu ephuma esikoleni. Ukusesha kunamathiselwe igama lasohlwini kuphela.",
    privPoint3: "Amakhodi ekilasi asebenza kuphela phakathi namahora esikole. Angalungiswa ngesikole ngasinye.",
    privPoint4: "I-COPPA, i-GDPR-K, kanye nomthetho wobumfihlo womfundi wase-Israel konke kuphathwa ngokukhululekile.",
    privKahoot: "Kujoyinwa kalula njengomdlalo wemibuzo wekilasi. Kwakhelwe ukuqonda amagama nokubona kukathisha.",
    priceTag: "Amanani",
    priceH2: "Amanani onyaka, ngokosayizi wesikole.",
    priceSub: "Uzisebenzela nge-Stripe. Akukho zingcingo zokuthengisa, akukho ukubonisa, akukho ma-oda okuthenga.",
    priceSmallName: "Izikole",
    priceSmallAmount: "$69",
    priceSmallStudents: "Kufika kubafundi abangu-100",
    priceLargeName: "Izikole Ezinkulu",
    priceLargeAmount: "$149",
    priceLargeStudents: "Kufika kubafundi abangu-500",
    priceIncludesTitle: "Zombili izinhlelo zifaka",
    priceIncludes: [
      "Amakilasi angenamkhawulo",
      "Ideshibhodi ephelele kathisha",
      "Uhlu lokukhetha abafundi",
      "Amakhodi ekilasi anemikhawulo yesikhathi",
      "Isikhombimsebenzisi somfundi ngezilimi ezingama-21",
      "I-oda lonyaka elula, ngaphansi komkhawulo wokuthenga",
      "Ukuzijwayeza ukuphimisela: yizwa bese usho noma yiliphi igama",
    ],
    priceCta: "Buka amanani bese uodola",
    priceLarger: "Udinga abafundi abangaphezu kwabangu-1,000? Xhumana nathi mayelana nezinhlelo zesifunda.",
    faqTag: "Imibuzo Evamile",
    faqH2: "Imibuzo othishanhloko abayibuzayo ngaphambi kokuthi baodole.",
    faq: [
      {
        q: "Uma kungekho ukungena, ngazi kanjani ukuthi imuphi umfundi ocinge ini?",
        a: "Uthisha ulayisha kusengaphambili uhlu lwamagama okuqala kudeshibhodi. Uma umfundi evakashela i-URL yekilasi, ukhetha igama lakhe ngokuchofoza kanye. Konke ukusesha kunamathiselwe kulelo gama. Ayikho i-imeyili, ayikho iphasiwedi, ayikho imininingwane yomuntu siqu eqoqwayo.",
      },
      {
        q: "Ingabe lokhu kuphephile nge-COPPA? Ngizothola isikhalazo somzali?",
        a: "Yebo. I-Gadit ayiqoqi neze imininingwane yomuntu siqu yomfundi. Akukho ukudalwa kwe-akhawunti, akukho ukuqoqwa kwe-imeyili, akukho zinsuku zokuzalwa, akukho bunikazi. Ayikho idatha engasetshenziswa kabi. Isakhiwo sidlula ngokukhululekile i-COPPA, i-GDPR-K, nomthetho wobumfihlo womfundi wase-Israel.",
      },
      {
        q: "Ingabe abafundi kudingeka bafake uhlelo lokusebenza?",
        a: "Cha. Noma yisiphi isiphequluli siyasebenza. Abafundi bavakashela i-gadit.app/c/CODE ekhompyutheni yekilasi (noma kunoma iyiphi idivayisi enesiphequluli). Akukho isitolo sezinhlelo, akukho ukubandakanyeka kwe-IT.",
      },
      {
        q: "Ingabe lokhu kudinga i-IT noma ukusethwa kwe-SSO?",
        a: "Cha. Uthishanhloko noma umqondisi webanga udala ikilasi ngemizuzu emibili bese wabelana ngekhodi nothisha. I-IT ayibandakanywa kunoma yisiphi isinyathelo.",
      },
      {
        q: "Ideshibhodi ibonisa ini ngempela?",
        a: "Ukusesha amagama komfundi ngamunye nezikhathi, amagama ikilasi elicinge wona kakhulu kuleli sonto, namaphethini okusesha okuphindaphindiwe akhomba ukuqonda okubuthakathaka. Ubona idatha yangempela yokuqonda kwekilasi, hhayi izilinganiso ezimfiliba zokuzibandakanya.",
      },
      {
        q: "Ingabe ingasetshenziswa ngaphandle kwamahora esikole?",
        a: "Amakhodi ekilasi aboshelwe emahoreni asebenzayo esikole (okuzenzakalelayo iSonto kuya oLwesine 7:30 kuya ku-15:00, kungalungiswa). Ngaphandle kwaleso sikhathi, ikhodi inikeza ukufinyelela okuyisisekelo kwesichazamazwi kodwa ayinazo izici ezengeziwe. Lokhu kuvimbela ikhodi yesikole ekutheni ibe yindawo yamahhala engena esikhundleni sezinga le-Family amahora angama-24.",
      },
      {
        q: "Kuthiwani uma isikole sami sinabafundi abangaphezu kwabangu-500?",
        a: "Khetha ngokwenani labafundi: kufika ku-100 abafundi ku-$97/ngenyanga, kufika ku-500 ku-$297/ngenyanga, futhi kufika ku-1,000 ku-$497/ngenyanga. Kubafundi abangaphezu kuka-1,000 noma izifunda ezinezindawo eziningi, xhumana nathi ukuze uthole uhlelo olwenzelwe wena.",
      },
      {
        q: "I-Gadit ilichaza kanjani igama? Ingabe ukuhumusha nje?",
        a: "I-Gadit akusona isichazamazwi sokuhumusha. I-Gadit ichaza futhi icacise amagama. Kwigama ngalinye inikeza yonke incazelo, imisho emithathu yesibonelo ngencazelo ngayinye, imvelaphi, kanye nendlela eqaphela umongo lapho abafundi benamathisela umusho i-Gadit bese ikhetha incazelo efanele. Isikhombimsebenzisi somfundi sisolimini lwakhe, kodwa ukujula kwencazelo kuyafana kuzo zonke izilimi zesikhombimsebenzisi.",
      },
    ],
    finalH2: "Misa indlela yokwehluleka okuthulile.",
    finalBody: "Nika othisha bakho ithuluzi lokubona ngempela lokho ikilasi labo elingakuqondi. Ukuqalisa kuthatha imizuzu emi-2. Akukho i-IT, akukho ukuthenga, akukho mafomu abazali.",
    finalCta: "Buka amanani bese uodola",
    finalNote: "Khokha ngonyaka ngokudlulisa imali ebhange ngokumelene ne-invoyisi yentela. Akudingeki thenda.",
    mockupRoster: "Uhlu lwekilasi, abafundi abangama-22",
    mockupSearches: "Okucinge kakhulu kuleli sonto",
    mockupStudent1: "UMaya ucinge i-photosynthesis",
    mockupStudent2: "UYossi ucinge i-mitochondria ×2",
    mockupStudent3: "UNoa ucinge i-democracy",
    mockupWordExample: "photosynthesis",
    mockupExampleDef: "Inqubo lapho izitshalo eziluhlaza zisebenzisa ukukhanya kwelanga ukuguqula amanzi ne-carbon dioxide zibe ukudla.",
    mockupExampleEx: "I-photosynthesis yenzeka kakhulu emaqabungeni esitshalo.",
  },
  el: {
    heroH1: "Κάθε μαθητής καταλαβαίνει το μάθημα.",
    heroSub: "Κάθε δύσκολη λέξη, σε οποιαδήποτε από τις 30+ γλώσσες, εξηγείται επιτόπου.",
    heroCta: "Δείτε τις τιμές και παραγγείλετε",
    heroPriceChip: "Από $97 / μήνα",
    heroTrust: "Αυτοεξυπηρέτηση. Ακύρωση οποτεδήποτε.",
    probTag: "Το Πρόβλημα",
    probH2: "Ένας μαθητής που δεν καταλαβαίνει μια λέξη δεν μπορεί να καταλάβει την πρόταση.",
    probBody1: "Ένας μαθητής χάνει μία λέξη. Δεν σηκώνει το χέρι του. Νομίζει ότι καταλαβαίνει περίπου. Ο δάσκαλος προχωράει. Πέντε λέξεις αργότερα, η παράγραφος είναι θολή. Πέντε παραγράφους αργότερα, το μάθημα έχει χαθεί.",
    probBody2: "Οι περισσότεροι μαθητές που μένουν πίσω δεν είναι ανίκανοι. Έχουν έναν σωρό από λέξεις που ποτέ δεν κατάλαβαν πλήρως. Κάθε νέα λέξη που χτίζεται πάνω σε αυτές μεγαλώνει το χάσμα. Η αιτία είναι αόρατη για τον δάσκαλο.",
    probCallout1Title: "Το χάσμα που μεγαλώνει",
    probCallout1Body: "Οι λέξεις που δεν έμαθαν χτίζουν ένα αόρατο εμπόδιο σε κάθε μελλοντικό μάθημα.",
    probCallout2Title: "Η απώλεια χρόνου",
    probCallout2Body: "Οι δάσκαλοι χάνουν 5 έως 10 λεπτά ανά μάθημα σε ορισμούς.",
    probCallout3Title: "Η σιωπηλή εγκατάλειψη",
    probCallout3Body: "Οι μαθητές αποσυντονίζονται όταν μια παράγραφος έχει πάρα πολλές άγνωστες λέξεις.",
    howTag: "Πώς Λειτουργεί",
    howH2: "Ρύθμιση σε 2 λεπτά. Χωρίς τμήμα πληροφορικής.",
    howSub: "Το ίδιο εύκολο μοτίβο κωδικού τάξης που ήδη λειτουργεί για παιχνίδια ερωτήσεων, φτιαγμένο αυτή τη φορά για την κατανόηση λέξεων.",
    howStep1Title: "Δημιουργήστε έναν κωδικό τάξης",
    howStep1Body: "Ο διευθυντής ή ο συντονιστής δημιουργεί μια τάξη στον πίνακα ελέγχου. Το σύστημα δημιουργεί έναν κωδικό 6 χαρακτήρων. Εκτυπώστε τον σε ένα αυτοκόλλητο για τον υπολογιστή της τάξης.",
    howStep2Title: "Οι μαθητές συνδέονται, χωρίς λογαριασμούς",
    howStep2Body: "Οι μαθητές επισκέπτονται το gadit.app/c/CODE σε οποιονδήποτε browser, επιλέγουν το όνομά τους από τη λίστα (ένα κλικ) και αρχίζουν να πληκτρολογούν λέξεις. Χωρίς εγκατάσταση εφαρμογής, χωρίς email, χωρίς κωδικό.",
    howStep3Title: "Οι δάσκαλοι βλέπουν τι αναζήτησε η τάξη",
    howStep3Body: "Κάθε αναζήτηση καταλήγει στον πίνακα ελέγχου, με το όνομα του μαθητή. Βλέπετε τι αναζήτησε κάθε μαθητής, πότε, και με ποιες λέξεις δυσκολεύτηκε η τάξη συνολικά.",
    teacherTag: "Η Προβολή του Δασκάλου",
    teacherH2: "Ο πίνακας ελέγχου που ζητούσατε.",
    teacherSub: "Όχι αόριστες μετρήσεις συμμετοχής. Συγκεκριμένες λέξεις, συγκεκριμένοι μαθητές, συγκεκριμένες στιγμές.",
    teacherB1: "Ιστορικό αναζητήσεων ανά μαθητή με χρονικές σημάνσεις",
    teacherB2: "Οι πιο αναζητημένες λέξεις όλης της τάξης αυτή την εβδομάδα",
    teacherB3: "Επαναλαμβανόμενες αναζητήσεις που επισημαίνουν εύθραυστη κατανόηση",
    teacherB4: "Φιλτράρισμα κατά ημερομηνία, μαθητή ή λέξη",
    privTag: "Ιδιωτικότητα εκ σχεδιασμού",
    privH2: "Πλήρης ορατότητα για τους δασκάλους. Μηδενικός κίνδυνος δεδομένων για τα σχολεία.",
    privSub: "Δεν συλλέγουμε κανένα προσωπικό δεδομένο μαθητή. Όχι επειδή το κρύβουμε καλά, αλλά επειδή ποτέ δεν το συλλέγουμε. Η αρχιτεκτονική είναι η ίδια η συμμόρφωση.",
    privPoint1: "Χωρίς λογαριασμούς μαθητών. Χωρίς email, χωρίς κωδικούς, χωρίς ταυτότητες.",
    privPoint2: "Κανένα προσωπικό δεδομένο δεν φεύγει από το σχολείο. Οι αναζητήσεις επισημαίνονται μόνο με το όνομα από τη λίστα.",
    privPoint3: "Οι κωδικοί τάξης λειτουργούν μόνο κατά τις σχολικές ώρες. Ρυθμίζονται για κάθε σχολείο.",
    privPoint4: "COPPA, GDPR-K και ο ισραηλινός νόμος για την ιδιωτικότητα των μαθητών, όλα καλύπτονται άνετα.",
    privKahoot: "Η σύνδεση είναι τόσο εύκολη όσο ένα σχολικό παιχνίδι ερωτήσεων. Φτιαγμένο για την κατανόηση λέξεων και την ορατότητα για τον δάσκαλο.",
    priceTag: "Τιμές",
    priceH2: "Ετήσια τιμολόγηση, ανά μέγεθος σχολείου.",
    priceSub: "Αυτοεξυπηρέτηση μέσω Stripe. Χωρίς τηλεφωνήματα πωλήσεων, χωρίς επιδείξεις, χωρίς εντολές αγοράς.",
    priceSmallName: "Σχολεία",
    priceSmallAmount: "$69",
    priceSmallStudents: "Έως 100 μαθητές",
    priceLargeName: "Σχολεία Μεγάλα",
    priceLargeAmount: "$149",
    priceLargeStudents: "Έως 500 μαθητές",
    priceIncludesTitle: "Και τα δύο πακέτα περιλαμβάνουν",
    priceIncludes: [
      "Απεριόριστες τάξεις",
      "Πλήρης πίνακας ελέγχου για δασκάλους",
      "Λίστα επιλογής μαθητών",
      "Κωδικοί τάξης με χρονικό περιορισμό",
      "Περιβάλλον μαθητή σε 30+ γλώσσες",
      "Απλή ετήσια παραγγελία, κάτω από το όριο των διαγωνισμών προμηθειών",
      "Εξάσκηση προφοράς: άκου και πες οποιαδήποτε λέξη",
    ],
    priceCta: "Δείτε τις τιμές και παραγγείλετε",
    priceLarger: "Χρειάζεστε περισσότερους από 1,000 μαθητές; Επικοινωνήστε μαζί μας για πακέτα περιφέρειας.",
    faqTag: "Συχνές Ερωτήσεις",
    faqH2: "Ερωτήσεις που κάνουν οι διευθυντές πριν παραγγείλουν.",
    faq: [
      {
        q: "Αν δεν υπάρχουν συνδέσεις, πώς ξέρω ποιος μαθητής αναζήτησε τι;",
        a: "Ο δάσκαλος φορτώνει εκ των προτέρων μια λίστα με μικρά ονόματα στον πίνακα ελέγχου. Όταν ένας μαθητής επισκέπτεται το URL της τάξης, επιλέγει το όνομά του με ένα κλικ. Κάθε αναζήτηση επισημαίνεται με αυτό το όνομα. Δεν συλλέγεται κανένα email, κανένας κωδικός, κανένα προσωπικό δεδομένο.",
      },
      {
        q: "Είναι αυτό ασφαλές κατά COPPA; Θα λάβω παράπονο από γονέα;",
        a: "Ναι. Το Gadit δεν συλλέγει καθόλου προσωπικές πληροφορίες μαθητών. Χωρίς δημιουργία λογαριασμού, χωρίς συλλογή email, χωρίς ημερομηνίες γέννησης, χωρίς ταυτότητες. Δεν υπάρχουν δεδομένα για κακή χρήση. Η αρχιτεκτονική ξεπερνά άνετα το COPPA, το GDPR-K και τον ισραηλινό νόμο για την ιδιωτικότητα των μαθητών.",
      },
      {
        q: "Χρειάζεται οι μαθητές να εγκαταστήσουν εφαρμογή;",
        a: "Όχι. Λειτουργεί οποιοσδήποτε browser. Οι μαθητές επισκέπτονται το gadit.app/c/CODE στον υπολογιστή της τάξης (ή σε οποιαδήποτε συσκευή με browser). Χωρίς app store, χωρίς εμπλοκή του τμήματος πληροφορικής.",
      },
      {
        q: "Απαιτεί αυτό ρύθμιση τμήματος πληροφορικής ή SSO;",
        a: "Όχι. Ένας διευθυντής ή συντονιστής τάξης δημιουργεί την τάξη σε δύο λεπτά και μοιράζεται τον κωδικό με τους δασκάλους. Το τμήμα πληροφορικής δεν εμπλέκεται σε κανένα βήμα.",
      },
      {
        q: "Τι δείχνει στην πραγματικότητα ο πίνακας ελέγχου;",
        a: "Τις αναζητήσεις λέξεων κάθε μαθητή με χρονικές σημάνσεις, τις λέξεις που αναζήτησε περισσότερο η τάξη αυτή την εβδομάδα, και μοτίβα επαναλαμβανόμενων αναζητήσεων που σηματοδοτούν εύθραυστη κατανόηση. Βλέπετε τα πραγματικά δεδομένα κατανόησης της τάξης, όχι αόριστες μετρήσεις συμμετοχής.",
      },
      {
        q: "Μπορεί να χρησιμοποιηθεί εκτός σχολικών ωρών;",
        a: "Οι κωδικοί τάξης είναι δεσμευμένοι στις ενεργές ώρες του σχολείου (προεπιλογή Κυριακή έως Πέμπτη 7:30-15:00, ρυθμιζόμενο). Εκτός αυτού του παραθύρου, ο κωδικός δίνει βασική πρόσβαση στο λεξικό, αλλά χωρίς εκτεταμένες λειτουργίες. Αυτό εμποδίζει τον σχολικό κωδικό να γίνει δωρεάν υποκατάστατο του πακέτου Family όλο το εικοσιτετράωρο.",
      },
      {
        q: "Τι γίνεται αν το σχολείο μου έχει περισσότερους από 500 μαθητές;",
        a: "Επιλέξτε ανάλογα με τον αριθμό μαθητών: έως 100 μαθητές είναι $97/μήνα, έως 500 είναι $297/μήνα και έως 1,000 είναι $497/μήνα. Για περισσότερους από 1,000 μαθητές ή περιφέρειες με πολλές τοποθεσίες, επικοινωνήστε μαζί μας για ένα προσαρμοσμένο πακέτο.",
      },
      {
        q: "Πώς εξηγεί το Gadit μια λέξη; Είναι απλώς μια μετάφραση;",
        a: "Το Gadit δεν είναι λεξικό μετάφρασης. Το Gadit ορίζει και εξηγεί λέξεις. Για κάθε λέξη δίνει κάθε σημασία, τρεις παραδειγματικές προτάσεις ανά σημασία, ετυμολογία, και μια λειτουργία με επίγνωση συμφραζομένων όπου οι μαθητές επικολλούν την πρόταση και το Gadit επιλέγει τη σωστή σημασία. Το περιβάλλον του μαθητή είναι στη γλώσσα του, αλλά το βάθος της εξήγησης είναι το ίδιο σε κάθε γλώσσα του περιβάλλοντος.",
      },
    ],
    finalH2: "Σταματήστε τη σιωπηλή αποτυχία.",
    finalBody: "Δώστε στους δασκάλους σας το εργαλείο για να βλέπουν ακριβώς τι δεν καταλαβαίνει η τάξη τους. Το ξεκίνημα παίρνει 2 λεπτά. Χωρίς τμήμα πληροφορικής, χωρίς διαδικασίες προμηθειών, χωρίς έντυπα για γονείς.",
    finalCta: "Δείτε τις τιμές και παραγγείλετε",
    finalNote: "Πληρώστε ετησίως με τραπεζικό έμβασμα έναντι φορολογικού παραστατικού. Δεν χρειάζεται διαγωνισμός.",
    mockupRoster: "Λίστα τάξης, 22 μαθητές",
    mockupSearches: "Οι πιο αναζητημένες αυτή την εβδομάδα",
    mockupStudent1: "Η Μάγια αναζήτησε φωτοσύνθεση",
    mockupStudent2: "Ο Γιόσι αναζήτησε μιτοχόνδρια ×2",
    mockupStudent3: "Η Νόα αναζήτησε δημοκρατία",
    mockupWordExample: "φωτοσύνθεση",
    mockupExampleDef: "Η διαδικασία με την οποία τα πράσινα φυτά χρησιμοποιούν το φως του ήλιου για να μετατρέψουν το νερό και το διοξείδιο του άνθρακα σε τροφή.",
    mockupExampleEx: "Η φωτοσύνθεση γίνεται κυρίως στα φύλλα του φυτού.",
  },
  uk: {
    heroH1: "Кожен учень розуміє урок.",
    heroSub: "Будь-яке складне слово, будь-якою з 30+ мов, пояснене одразу.",
    heroCta: "Почати 14-денний безкоштовний період",
    heroPriceChip: "Від $97 / місяць",
    heroTrust: "Самообслуговування. Скасування будь-коли.",
    probTag: "Проблема",
    probH2: "Учень, який не розуміє слова, не може зрозуміти речення.",
    probBody1: "Учень пропускає одне слово. Не піднімає руку. Думає, що приблизно розуміє. Учитель йде далі. Через п'ять слів абзац стає розмитим. Через п'ять абзаців урок втрачено.",
    probBody2: "Більшість учнів, які відстають, не є нездібними. У них накопичилася купа слів, які вони так і не зрозуміли повністю. Кожне нове слово, побудоване на них, збільшує розрив. Причина невидима для вчителя.",
    probCallout1Title: "Розрив, що накопичується",
    probCallout1Body: "Невивчені слова будують невидимий бар'єр до кожного майбутнього уроку.",
    probCallout2Title: "Втрата часу",
    probCallout2Body: "Вчителі втрачають 5-10 хвилин на урок на визначення.",
    probCallout3Title: "Тихе відсіювання",
    probCallout3Body: "Учні відключаються, коли в абзаці забагато незнайомих слів.",
    howTag: "Як це працює",
    howH2: "Налаштування за 2 хвилини. Без IT.",
    howSub: "Той самий безперешкодний шаблон класного коду, що вже працює для ігор-вікторин, побудований натомість для розуміння слів.",
    howStep1Title: "Створіть класний код",
    howStep1Body: "Директор або координатор створює клас на панелі. Система генерує код із 6 символів. Роздрукуйте його на наліпці для класного комп'ютера.",
    howStep2Title: "Учні приєднуються, без облікових записів",
    howStep2Body: "Учні відкривають gadit.app/c/CODE у будь-якому браузері, обирають своє ім'я зі списку (один клік) і починають набирати слова. Без встановлення застосунку, без email, без пароля.",
    howStep3Title: "Вчителі бачать, що шукав клас",
    howStep3Body: "Кожен пошук потрапляє на панель, позначений іменем учня. Ви бачите, що шукав кожен учень, коли, і які слова викликали труднощі у всього класу.",
    teacherTag: "Огляд для вчителя",
    teacherH2: "Панель, про яку ви просили.",
    teacherSub: "Не розпливчасті метрики залученості. Конкретні слова, конкретні учні, конкретні моменти.",
    teacherB1: "Історія пошуків кожного учня з позначками часу",
    teacherB2: "Найпопулярніші слова класу цього тижня",
    teacherB3: "Повторні пошуки, що сигналізують про хитке розуміння",
    teacherB4: "Фільтрування за датою, учнем або словом",
    privTag: "Конфіденційність за задумом",
    privH2: "Повна видимість для вчителів. Нуль ризику даних для шкіл.",
    privSub: "Ми не збираємо жодних персональних даних учнів. Не тому, що добре їх ховаємо, а тому, що ніколи їх не збираємо. Архітектура і є відповідністю нормам.",
    privPoint1: "Без облікових записів учнів. Без email, без паролів, без ідентифікаторів.",
    privPoint2: "Жодні персональні дані не залишають школу. Пошуки позначаються лише іменем зі списку.",
    privPoint3: "Класні коди працюють лише в шкільні години. Налаштовується для кожної школи.",
    privPoint4: "COPPA, GDPR-K та ізраїльський закон про приватність учнів усі комфортно дотримані.",
    privKahoot: "Приєднатися так само легко, як до класної гри-вікторини. Побудовано для розуміння слів і видимості для вчителя.",
    priceTag: "Ціни",
    priceH2: "Просто. Нижче порога закупівель.",
    priceSub: "Самообслуговування через Stripe. Без дзвінків з продажу, без демо, без замовлень на закупівлю.",
    priceSmallName: "Школи",
    priceSmallAmount: "$69",
    priceSmallStudents: "До 100 учнів",
    priceLargeName: "Школи Великі",
    priceLargeAmount: "$149",
    priceLargeStudents: "До 500 учнів",
    priceIncludesTitle: "Обидва плани включають",
    priceIncludes: [
      "Необмежену кількість класів",
      "Повну панель для вчителя",
      "Список для вибору учня",
      "Класні коди з обмеженням у часі",
      "Інтерфейс учня 30+ мовами",
      "14-денний безкоштовний період",
      "Практика вимови: почути будь-яке слово й вимовити його",
    ],
    priceCta: "Почати 14-денний безкоштовний період",
    priceLarger: "Потрібно більше ніж 1,000 учнів? Зв'яжіться з нами щодо планів для округів.",
    faqTag: "Часті запитання",
    faqH2: "Питання, які ставлять директори перед пробним періодом.",
    faq: [
      {
        q: "Якщо немає входів, як я дізнаюся, який учень що шукав?",
        a: "Вчитель заздалегідь завантажує список імен на панелі. Коли учень відкриває URL класу, він обирає своє ім'я одним кліком. Кожен пошук позначається цим іменем. Жодних email, паролів чи персональних даних не збирається.",
      },
      {
        q: "Чи безпечно це за COPPA? Чи не отримаю я скаргу від батьків?",
        a: "Так. Gadit взагалі не збирає жодної персональної інформації учнів. Без створення облікового запису, без збору email, без днів народження, без ідентифікаторів. Немає даних, які можна використати не за призначенням. Архітектура комфортно перевищує вимоги COPPA, GDPR-K та ізраїльського закону про приватність учнів.",
      },
      {
        q: "Чи потрібно учням встановлювати застосунок?",
        a: "Ні. Працює будь-який браузер. Учні відкривають gadit.app/c/CODE на класному комп'ютері (або будь-якому пристрої з браузером). Без магазину застосунків, без залучення IT.",
      },
      {
        q: "Чи потребує це налаштування IT або SSO?",
        a: "Ні. Директор або координатор паралелі створює клас за дві хвилини й ділиться кодом з учителями. IT не залучається на жодному кроці.",
      },
      {
        q: "Що насправді показує панель?",
        a: "Пошуки слів кожного учня з позначками часу, слова, які клас шукав найчастіше цього тижня, і закономірності повторних пошуків, що сигналізують про хитке розуміння. Ви бачите справжні дані про розуміння в класі, а не розпливчасті метрики залученості.",
      },
      {
        q: "Чи можна користуватися поза уроками?",
        a: "Класні коди прив'язані до активних годин школи (за замовчуванням неділя-четвер 7:30-15:00, налаштовується). Поза цим вікном код дає базовий доступ до словника, але без розширених функцій. Це запобігає перетворенню шкільного коду на безкоштовну заміну сімейного тарифу цілодобово.",
      },
      {
        q: "Що, якщо в моїй школі понад 500 учнів?",
        a: "Обирайте за кількістю учнів: до 100 учнів це $97/місяць, до 500 це $297/місяць, а до 1,000 це $497/місяць. Для понад 1,000 учнів або мультисайтових округів зв'яжіться з нами щодо індивідуального плану.",
      },
      {
        q: "Як Gadit пояснює слово? Це просто переклад?",
        a: "Gadit це не словник для перекладу. Gadit визначає й пояснює слова. Для кожного слова він дає кожне значення, три приклади речень на значення, етимологію та режим з урахуванням контексту, де учні вставляють речення, а Gadit обирає правильне значення. Інтерфейс учня його мовою, але глибина пояснення однакова в кожній мові інтерфейсу.",
      },
    ],
    finalH2: "Зупиніть тихий режим провалу.",
    finalBody: "Дайте вашим учителям інструмент, щоб бачити точно, чого не розуміє їхній клас. Запуск пробного періоду займає 2 хвилини. Без IT, без закупівель, без батьківських форм.",
    finalCta: "Почати 14-денний безкоштовний період",
    finalNote: "Для пробного періоду картка не потрібна. Скасування будь-коли.",
    mockupRoster: "Список класу, 22 учні",
    mockupSearches: "Найчастіше шукали цього тижня",
    mockupStudent1: "Мая шукала фотосинтез",
    mockupStudent2: "Йосип шукав мітохондрії ×2",
    mockupStudent3: "Ноа шукала демократія",
    mockupWordExample: "фотосинтез",
    mockupExampleDef: "Процес, за допомогою якого зелені рослини використовують сонячне світло, щоб перетворювати воду й вуглекислий газ на поживні речовини.",
    mockupExampleEx: "Фотосинтез відбувається переважно в листках рослини.",
  },
  tr: {
    heroH1: "Her öğrenci dersi anlar.",
    heroSub: "Zor herhangi bir kelime, 30+ dilden herhangi birinde, anında açıklanır.",
    heroCta: "14 günlük ücretsiz denemeyi başlat",
    heroPriceChip: "Aylık $97'dan başlayan fiyatlarla",
    heroTrust: "Kendi kendine kurulum. İstediğiniz zaman iptal.",
    probTag: "Sorun",
    probH2: "Bir kelimeyi anlamayan öğrenci, cümleyi de anlayamaz.",
    probBody1: "Bir öğrenci bir kelimeyi kaçırır. Parmak kaldırmaz. Aşağı yukarı anladığını düşünür. Öğretmen devam eder. Beş kelime sonra paragraf bulanıklaşır. Beş paragraf sonra ders kaybolur.",
    probBody2: "Geri kalan öğrencilerin çoğu zekasız değildir. Tam olarak anlamadıkları bir kelime yığını vardır. Bunların üzerine kurulan her yeni kelime aradaki farkı büyütür. Öğretmen bu nedeni göremez.",
    probCallout1Title: "Katlanan fark",
    probCallout1Body: "Öğrenilmemiş kelimeler, gelecekteki her derse görünmez bir engel örer.",
    probCallout2Title: "Zaman kaybı",
    probCallout2Body: "Öğretmenler ders başına 5-10 dakikayı tanımlara harcar.",
    probCallout3Title: "Sessiz kopuş",
    probCallout3Body: "Bir paragrafta çok fazla bilinmeyen kelime olduğunda öğrenciler kopar.",
    howTag: "Nasıl Çalışır",
    howH2: "2 dakikada kurun. BT gerekmez.",
    howSub: "Test oyunlarında zaten işe yarayan, sürtünmesiz aynı sınıf kodu düzeni, bu kez kelime anlama için tasarlandı.",
    howStep1Title: "Bir sınıf kodu oluşturun",
    howStep1Body: "Müdür ya da koordinatör panelde bir sınıf oluşturur. Sistem 6 karakterli bir kod üretir. Sınıf bilgisayarına yapıştırmak için bir etikete basın.",
    howStep2Title: "Öğrenciler hesapsız katılır",
    howStep2Body: "Öğrenciler herhangi bir tarayıcıda gadit.app/c/CODE adresine gider, listeden adını seçer (tek tık) ve kelime yazmaya başlar. Uygulama kurulumu yok, e-posta yok, şifre yok.",
    howStep3Title: "Öğretmenler sınıfın ne aradığını görür",
    howStep3Body: "Her arama, öğrencinin adıyla etiketlenmiş olarak panele düşer. Her öğrencinin ne aradığını, ne zaman aradığını ve sınıfın toplu olarak hangi kelimelerde zorlandığını görürsünüz.",
    teacherTag: "Öğretmen Görünümü",
    teacherH2: "İsteyip durduğunuz panel.",
    teacherSub: "Muğlak katılım ölçümleri değil. Belirli kelimeler, belirli öğrenciler, belirli anlar.",
    teacherB1: "Zaman damgalı öğrenci bazında arama geçmişi",
    teacherB2: "Bu hafta sınıf genelinde en çok aranan kelimeler",
    teacherB3: "Kırılgan anlamaya işaret eden tekrarlanan aramalar",
    teacherB4: "Tarihe, öğrenciye ya da kelimeye göre filtrelenebilir",
    privTag: "Tasarım Gereği Gizlilik",
    privH2: "Öğretmenler için tam görünürlük. Okullar için sıfır veri riski.",
    privSub: "Hiçbir öğrenci kişisel verisi toplamıyoruz. İyi sakladığımız için değil, hiç toplamadığımız için. Uyumluluğun kendisi mimaridir.",
    privPoint1: "Öğrenci hesabı yok. E-posta yok, şifre yok, kimlik yok.",
    privPoint2: "Hiçbir kişisel veri okuldan çıkmaz. Aramalar yalnızca liste adıyla etiketlenir.",
    privPoint3: "Sınıf kodları yalnızca okul saatlerinde çalışır. Okula göre yapılandırılabilir.",
    privPoint4: "COPPA, GDPR-K ve İsrail öğrenci gizliliği yasasının hepsi rahatça karşılanır.",
    privKahoot: "Bir sınıf test oyunu kadar kolay katılım. Kelime anlama ve öğretmen görünürlüğü için tasarlandı.",
    priceTag: "Fiyatlandırma",
    priceH2: "Basit. Satın alma eşiğinin altında.",
    priceSub: "Stripe üzerinden kendi kendine kurulum. Satış görüşmesi yok, demo yok, satın alma emri yok.",
    priceSmallName: "Okullar",
    priceSmallAmount: "$69",
    priceSmallStudents: "100 öğrenciye kadar",
    priceLargeName: "Okullar Büyük",
    priceLargeAmount: "$149",
    priceLargeStudents: "500 öğrenciye kadar",
    priceIncludesTitle: "Her iki plana da dahil",
    priceIncludes: [
      "Sınırsız sınıf",
      "Tam öğretmen paneli",
      "Öğrenci seçim listesi",
      "Zaman sınırlı sınıf kodları",
      "30+ dilde öğrenci arayüzü",
      "14 günlük ücretsiz deneme",
      "Telaffuz alıştırması: her kelimeyi duy ve söyle",
    ],
    priceCta: "14 günlük ücretsiz denemeyi başlat",
    priceLarger: "1,000'den fazla öğrenciye mi ihtiyacınız var? İlçe planları için bizimle iletişime geçin.",
    faqTag: "SSS",
    faqH2: "Müdürlerin denemeden önce sorduğu sorular.",
    faq: [
      {
        q: "Giriş yoksa, hangi öğrencinin neyi aradığını nasıl bilirim?",
        a: "Öğretmen panelde önceden bir isim listesi yükler. Bir öğrenci sınıf URL'sine gittiğinde adını tek tıkla seçer. Her arama o isme etiketlenir. E-posta, şifre ya da kişisel veri toplanmaz.",
      },
      {
        q: "Bu COPPA açısından güvenli mi? Bir veli şikayeti alır mıyım?",
        a: "Evet. Gadit hiçbir öğrenci kişisel bilgisi toplamaz. Hesap oluşturma yok, e-posta toplama yok, doğum günü yok, kimlik yok. Kötüye kullanılacak veri yoktur. Mimari; COPPA, GDPR-K ve İsrail öğrenci gizliliği yasasını rahatça aşar.",
      },
      {
        q: "Öğrencilerin bir uygulama kurması gerekiyor mu?",
        a: "Hayır. Her tarayıcı çalışır. Öğrenciler sınıf bilgisayarında (ya da tarayıcısı olan herhangi bir cihazda) gadit.app/c/CODE adresine gider. Uygulama mağazası yok, BT müdahalesi yok.",
      },
      {
        q: "Bu, BT ya da SSO kurulumu gerektiriyor mu?",
        a: "Hayır. Bir müdür ya da sınıf koordinatörü iki dakikada sınıfı oluşturur ve kodu öğretmenlerle paylaşır. BT hiçbir adımda devreye girmez.",
      },
      {
        q: "Panel aslında ne gösterir?",
        a: "Her öğrencinin zaman damgalı kelime aramalarını, sınıfın bu hafta en çok aradığı kelimeleri ve kırılgan anlamaya işaret eden tekrarlanan arama örüntülerini. Muğlak katılım ölçümlerini değil, gerçek sınıf anlama verisini görürsünüz.",
      },
      {
        q: "Ders saatleri dışında kullanılabilir mi?",
        a: "Sınıf kodları okulun aktif saatlerine bağlıdır (varsayılan Pazar-Perşembe 7:30-15:00, yapılandırılabilir). Bu pencerenin dışında kod temel sözlük erişimi verir ama genişletilmiş özellikler vermez. Bu, okul kodunun Aile katmanının 7/24 ücretsiz bir alternatifine dönüşmesini engeller.",
      },
      {
        q: "Okulumda 500'den fazla öğrenci varsa ne olur?",
        a: "Öğrenci sayısına göre seçin: 100 öğrenciye kadar aylık $97, 500 öğrenciye kadar aylık $297 ve 1,000 öğrenciye kadar aylık $497. 1,000'den fazla öğrenci ya da çok kampüslü ilçeler için özel bir plan için bizimle iletişime geçin.",
      },
      {
        q: "Gadit bir kelimeyi nasıl açıklar? Sadece bir çeviri mi?",
        a: "Gadit bir çeviri sözlüğü değildir. Gadit kelimeleri tanımlar ve açıklar. Her kelime için her anlamı, anlam başına üç örnek cümle, etimoloji ve öğrencilerin cümleyi yapıştırdığı, Gadit'in doğru anlamı seçtiği bağlam duyarlı bir mod verir. Öğrencinin arayüzü kendi dilindedir ama açıklamanın derinliği her arayüz dilinde aynıdır.",
      },
    ],
    finalH2: "Sessiz başarısızlık kalıbına son verin.",
    finalBody: "Öğretmenlerinize sınıflarının tam olarak neyi anlamadığını görme aracını verin. Denemeyi başlatmak 2 dakika sürer. BT yok, satın alma süreci yok, veli formları yok.",
    finalCta: "14 günlük ücretsiz denemeyi başlat",
    finalNote: "Deneme için kredi kartı gerekmez. İstediğiniz zaman iptal edin.",
    mockupRoster: "Sınıf listesi, 22 öğrenci",
    mockupSearches: "Bu hafta en çok arananlar",
    mockupStudent1: "Elif fotosentez aradı",
    mockupStudent2: "Yusuf mitokondri aradı ×2",
    mockupStudent3: "Deniz demokrasi aradı",
    mockupWordExample: "fotosentez",
    mockupExampleDef: "Yeşil bitkilerin güneş ışığını kullanarak suyu ve karbondioksiti besine dönüştürdüğü süreç.",
    mockupExampleEx: "Fotosentez çoğunlukla bitkinin yapraklarında gerçekleşir.",
  },
  pl: {
    heroH1: "Każdy uczeń rozumie lekcję.",
    heroSub: "Każde trudne słowo, w dowolnym z 30+ języków, wyjaśnione od razu.",
    heroCta: "Rozpocznij 14-dniowy bezpłatny okres próbny",
    heroPriceChip: "Od $97 / miesiąc",
    heroTrust: "Samoobsługa. Anuluj w dowolnym momencie.",
    probTag: "Problem",
    probH2: "Uczeń, który nie rozumie słowa, nie może zrozumieć zdania.",
    probBody1: "Uczeń nie zna jednego słowa. Nie podnosi ręki. Myśli, że mniej więcej rozumie. Nauczyciel idzie dalej. Pięć słów później akapit się rozmywa. Pięć akapitów później lekcja jest stracona.",
    probBody2: "Większość uczniów, którzy zostają w tyle, nie jest niezdolna. Mają stos słów, których nigdy do końca nie zrozumieli. Każde nowe słowo zbudowane na tamtych powiększa lukę. Przyczyna jest dla nauczyciela niewidoczna.",
    probCallout1Title: "Narastająca luka",
    probCallout1Body: "Nieprzyswojone słowa budują niewidzialną barierę przed każdą przyszłą lekcją.",
    probCallout2Title: "Utrata czasu",
    probCallout2Body: "Nauczyciele tracą 5-10 minut na lekcji na definicje.",
    probCallout3Title: "Cicha rezygnacja",
    probCallout3Body: "Uczniowie wyłączają się, gdy w akapicie jest zbyt wiele nieznanych słów.",
    howTag: "Jak to działa",
    howH2: "Konfiguracja w 2 minuty. Bez IT.",
    howSub: "Ten sam bezproblemowy wzorzec kodu klasowego, który już działa w grach quizowych, stworzony do rozumienia słów.",
    howStep1Title: "Utwórz kod klasy",
    howStep1Body: "Dyrektor lub koordynator tworzy klasę w panelu. System generuje 6-znakowy kod. Wydrukuj go na naklejce na komputer klasowy.",
    howStep2Title: "Uczniowie dołączają, bez kont",
    howStep2Body: "Uczniowie wchodzą na gadit.app/c/CODE w dowolnej przeglądarce, wybierają swoje imię z listy (jedno kliknięcie) i zaczynają wpisywać słowa. Bez instalacji aplikacji, bez e-maila, bez hasła.",
    howStep3Title: "Nauczyciele widzą, czego szukała klasa",
    howStep3Body: "Każde wyszukiwanie trafia do panelu, oznaczone imieniem ucznia. Widzisz, co każdy uczeń sprawdzał, kiedy i z jakimi słowami klasa miała wspólnie trudność.",
    teacherTag: "Widok nauczyciela",
    teacherH2: "Panel, o który prosiłeś.",
    teacherSub: "Nie mgliste wskaźniki zaangażowania. Konkretne słowa, konkretni uczniowie, konkretne chwile.",
    teacherB1: "Historia wyszukiwań każdego ucznia ze znacznikami czasu",
    teacherB2: "Najczęściej wyszukiwane słowa w klasie w tym tygodniu",
    teacherB3: "Powtarzające się wyszukiwania, które sygnalizują kruche rozumienie",
    teacherB4: "Filtrowanie według daty, ucznia lub słowa",
    privTag: "Prywatność z założenia",
    privH2: "Pełna widoczność dla nauczycieli. Zero ryzyka dla danych szkoły.",
    privSub: "Nie zbieramy żadnych danych osobowych uczniów. Nie dlatego, że dobrze je ukrywamy, ale dlatego, że nigdy ich nie zbieramy. Ta architektura sama jest zgodnością.",
    privPoint1: "Bez kont uczniów. Bez e-maili, bez haseł, bez identyfikatorów.",
    privPoint2: "Żadne dane osobowe nie opuszczają szkoły. Wyszukiwania oznaczone są tylko imieniem z listy.",
    privPoint3: "Kody klas działają tylko w godzinach szkolnych. Konfigurowalne dla każdej szkoły.",
    privPoint4: "COPPA, GDPR-K i izraelskie prawo o ochronie prywatności uczniów w pełni obsłużone.",
    privKahoot: "Dołączasz tak łatwo jak do klasowej gry quizowej. Stworzone do rozumienia słów i widoczności dla nauczyciela.",
    priceTag: "Cennik",
    priceH2: "Prosto. Poniżej progu zamówień publicznych.",
    priceSub: "Samoobsługa przez Stripe. Bez rozmów sprzedażowych, bez dem, bez zamówień zakupu.",
    priceSmallName: "Szkoły",
    priceSmallAmount: "$69",
    priceSmallStudents: "Do 100 uczniów",
    priceLargeName: "Szkoły Large",
    priceLargeAmount: "$149",
    priceLargeStudents: "Do 500 uczniów",
    priceIncludesTitle: "Oba plany obejmują",
    priceIncludes: [
      "Nieograniczona liczba klas",
      "Pełny panel nauczyciela",
      "Lista uczniów do wyboru",
      "Kody klas ograniczone czasowo",
      "Interfejs ucznia w 30+ językach",
      "14-dniowy bezpłatny okres próbny",
      "Ćwiczenie wymowy: usłysz każde słowo i je wypowiedz",
    ],
    priceCta: "Rozpocznij 14-dniowy bezpłatny okres próbny",
    priceLarger: "Potrzebujesz więcej niż 1,000 uczniów? Skontaktuj się z nami w sprawie planów dla okręgów.",
    faqTag: "FAQ",
    faqH2: "Pytania, które zadają dyrektorzy przed okresem próbnym.",
    faq: [
      {
        q: "Jeśli nie ma logowań, skąd wiem, który uczeń czego szukał?",
        a: "Nauczyciel wcześniej wgrywa listę imion w panelu. Gdy uczeń wchodzi na adres klasy, wybiera swoje imię jednym kliknięciem. Każde wyszukiwanie jest oznaczone tym imieniem. Nie zbieramy e-maila, hasła ani żadnych danych osobowych.",
      },
      {
        q: "Czy to bezpieczne pod kątem COPPA? Czy dostanę skargę od rodzica?",
        a: "Tak. Gadit w ogóle nie zbiera danych osobowych uczniów. Bez zakładania kont, bez zbierania e-maili, bez dat urodzenia, bez identyfikatorów. Nie ma danych, których można by nadużyć. Ta architektura z zapasem przewyższa COPPA, GDPR-K i izraelskie prawo o ochronie prywatności uczniów.",
      },
      {
        q: "Czy uczniowie muszą instalować aplikację?",
        a: "Nie. Działa każda przeglądarka. Uczniowie wchodzą na gadit.app/c/CODE na komputerze klasowym (lub dowolnym urządzeniu z przeglądarką). Bez sklepu z aplikacjami, bez udziału działu IT.",
      },
      {
        q: "Czy to wymaga konfiguracji IT albo SSO?",
        a: "Nie. Dyrektor lub koordynator poziomu tworzy klasę w dwie minuty i udostępnia kod nauczycielom. Dział IT nie jest zaangażowany na żadnym etapie.",
      },
      {
        q: "Co dokładnie pokazuje panel?",
        a: "Wyszukiwania słów każdego ucznia ze znacznikami czasu, słowa, których klasa szukała najczęściej w tym tygodniu, oraz wzorce powtarzających się wyszukiwań, które sygnalizują kruche rozumienie. Widzisz prawdziwe dane o rozumieniu w klasie, a nie mgliste wskaźniki zaangażowania.",
      },
      {
        q: "Czy można z tego korzystać poza godzinami lekcyjnymi?",
        a: "Kody klas są powiązane z aktywnymi godzinami szkoły (domyślnie niedziela-czwartek 7:30-15:00, konfigurowalne). Poza tym oknem kod daje podstawowy dostęp do słownika, ale bez rozszerzonych funkcji. Zapobiega to temu, by kod szkolny stał się darmowym zamiennikiem planu Rodzinnego dostępnym 24/7.",
      },
      {
        q: "Co jeśli moja szkoła ma więcej niż 500 uczniów?",
        a: "Wybierz według liczby uczniów: do 100 uczniów to $97/miesiąc, do 500 to $297/miesiąc, a do 1,000 to $497/miesiąc. Dla ponad 1,000 uczniów lub okręgów wieloplacówkowych skontaktuj się z nami po plan dopasowany do Twojej szkoły.",
      },
      {
        q: "Jak Gadit wyjaśnia słowo? Czy to tylko tłumaczenie?",
        a: "Gadit nie jest słownikiem tłumaczeniowym. Gadit definiuje i wyjaśnia słowa. Dla każdego słowa podaje każde znaczenie, trzy przykładowe zdania na znaczenie, etymologię oraz tryb uwzględniający kontekst, w którym uczeń wkleja zdanie, a Gadit wybiera właściwe znaczenie. Interfejs ucznia jest w jego języku, ale głębia wyjaśnienia jest taka sama w każdym języku interfejsu.",
      },
    ],
    finalH2: "Zatrzymaj cichy scenariusz porażki.",
    finalBody: "Daj swoim nauczycielom narzędzie, które pokaże dokładnie, czego ich klasa nie rozumie. Uruchomienie okresu próbnego zajmuje 2 minuty. Bez IT, bez zamówień publicznych, bez formularzy dla rodziców.",
    finalCta: "Rozpocznij 14-dniowy bezpłatny okres próbny",
    finalNote: "Bez karty kredytowej na okres próbny. Anuluj w dowolnym momencie.",
    mockupRoster: "Lista klasy, 22 uczniów",
    mockupSearches: "Najczęściej wyszukiwane w tym tygodniu",
    mockupStudent1: "Maya szukała fotosynteza",
    mockupStudent2: "Yossi szukał mitochondrium ×2",
    mockupStudent3: "Noa szukała demokracja",
    mockupWordExample: "fotosynteza",
    mockupExampleDef: "Proces, w którym zielone rośliny wykorzystują światło słoneczne, aby przekształcić wodę i dwutlenek węgla w pożywienie.",
    mockupExampleEx: "Fotosynteza zachodzi głównie w liściach rośliny.",
  },
  fa: {
    heroH1: "هر دانش‌آموز درس را می‌فهمد.",
    heroSub: "هر واژه‌ی دشوار، در هر یک از 30+ زبان، همان‌جا توضیح داده می‌شود.",
    heroCta: "دوره‌ی آزمایشی رایگان 14 روزه را شروع کن",
    heroPriceChip: "از $97 / ماه",
    heroTrust: "خودخدمت. هر زمان لغو کن.",
    probTag: "مشکل",
    probH2: "دانش‌آموزی که یک واژه را نمی‌فهمد نمی‌تواند جمله را بفهمد.",
    probBody1: "دانش‌آموزی یک واژه را از دست می‌دهد. دستش را بالا نمی‌برد. فکر می‌کند کمابیش فهمیده است. معلم جلو می‌رود. پنج واژه بعد، پاراگراف تار است. پنج پاراگراف بعد، درس گم شده است.",
    probBody2: "بیشتر دانش‌آموزانی که عقب می‌مانند کم‌هوش نیستند. آن‌ها انبوهی از واژه‌ها دارند که هرگز کامل نفهمیدند. هر واژه‌ی جدیدی که روی آن‌ها ساخته می‌شود شکاف را بزرگ‌تر می‌کند. علت برای معلم نامرئی است.",
    probCallout1Title: "شکاف انباشته‌شونده",
    probCallout1Body: "واژه‌های یادنگرفته سدی نامرئی در برابر هر درس آینده می‌سازند.",
    probCallout2Title: "اتلاف زمان",
    probCallout2Body: "معلمان در هر درس 5 تا 10 دقیقه را صرف تعریف واژه‌ها می‌کنند.",
    probCallout3Title: "افت تحصیلی خاموش",
    probCallout3Body: "وقتی یک پاراگراف واژه‌های ناشناخته‌ی بسیاری دارد، دانش‌آموزان حواسشان پرت می‌شود.",
    howTag: "چطور کار می‌کند",
    howH2: "در 2 دقیقه راه‌اندازی. بدون آی‌تی.",
    howSub: "همان الگوی کد کلاس بدون دردسر که پیش‌تر برای بازی‌های آزمون کار می‌کرد، این‌بار برای درک واژه ساخته شده است.",
    howStep1Title: "یک کد کلاس بساز",
    howStep1Body: "مدیر یا هماهنگ‌کننده در داشبورد یک کلاس می‌سازد. سیستم یک کد 6 نویسه‌ای می‌سازد. آن را روی برچسبی برای رایانه‌ی کلاس چاپ کن.",
    howStep2Title: "دانش‌آموزان می‌پیوندند، بدون حساب",
    howStep2Body: "دانش‌آموزان در هر مرورگری به gadit.app/c/CODE می‌روند، نامشان را از فهرست انتخاب می‌کنند (یک کلیک)، و شروع به تایپ واژه‌ها می‌کنند. بدون نصب اپ، بدون ایمیل، بدون رمز عبور.",
    howStep3Title: "معلمان می‌بینند کلاس چه جست‌وجو کرده",
    howStep3Body: "هر جست‌وجو در داشبورد جای می‌گیرد، با نام دانش‌آموز نشانه‌گذاری شده. می‌بینی هر دانش‌آموز چه جست‌وجو کرده، کِی، و کلاس روی کدام واژه‌ها به‌طور جمعی گیر کرده است.",
    teacherTag: "نمای معلم",
    teacherH2: "داشبوردی که خواسته بودی.",
    teacherSub: "نه سنجه‌های مبهم درگیری. واژه‌های مشخص، دانش‌آموزان مشخص، لحظه‌های مشخص.",
    teacherB1: "تاریخچه‌ی جست‌وجوی هر دانش‌آموز با زمان دقیق",
    teacherB2: "پرجست‌وجوترین واژه‌های کل کلاس در این هفته",
    teacherB3: "جست‌وجوهای تکراری که درک شکننده را نشان می‌دهند",
    teacherB4: "قابل پالایش بر پایه‌ی تاریخ، دانش‌آموز، یا واژه",
    privTag: "حریم خصوصی از پایه",
    privH2: "دید کامل برای معلمان. صفر ریسک داده برای مدرسه‌ها.",
    privSub: "ما هیچ اطلاعات شناسایی‌کننده‌ی شخصی دانش‌آموز جمع نمی‌کنیم. نه چون خوب پنهانش می‌کنیم، بلکه چون هرگز جمعش نمی‌کنیم. معماری همان انطباق است.",
    privPoint1: "بدون حساب دانش‌آموز. بدون ایمیل، بدون رمز عبور، بدون شناسه.",
    privPoint2: "هیچ داده‌ی شخصی از مدرسه بیرون نمی‌رود. جست‌وجوها فقط با نام فهرست نشانه‌گذاری می‌شوند.",
    privPoint3: "کدهای کلاس فقط در ساعات مدرسه کار می‌کنند. برای هر مدرسه قابل تنظیم.",
    privPoint4: "COPPA، GDPR-K، و قانون حریم خصوصی دانش‌آموز اسرائیل همگی به‌راحتی رعایت می‌شوند.",
    privKahoot: "به آسانیِ یک بازی آزمون کلاسی می‌پیوندد. برای درک واژه و دید معلم ساخته شده است.",
    priceTag: "قیمت‌گذاری",
    priceH2: "ساده. زیر آستانه‌ی تدارکات.",
    priceSub: "خودخدمت از راه Stripe. بدون تماس فروش، بدون دمو، بدون سفارش خرید.",
    priceSmallName: "مدرسه‌ها",
    priceSmallAmount: "$69",
    priceSmallStudents: "تا 100 دانش‌آموز",
    priceLargeName: "مدرسه‌های بزرگ",
    priceLargeAmount: "$149",
    priceLargeStudents: "تا 500 دانش‌آموز",
    priceIncludesTitle: "هر دو طرح شامل این‌ها هستند",
    priceIncludes: [
      "کلاس‌های نامحدود",
      "داشبورد کامل معلم",
      "فهرست انتخاب دانش‌آموز",
      "کدهای کلاس زمان‌دار",
      "رابط کاربری دانش‌آموز در 30+ زبان",
      "دوره‌ی آزمایشی رایگان 14 روزه",
      "تمرین تلفظ: هر واژه را بشنوید و بگویید",
    ],
    priceCta: "دوره‌ی آزمایشی رایگان 14 روزه را شروع کن",
    priceLarger: "بیش از 1,000 دانش‌آموز نیاز داری؟ درباره‌ی طرح‌های ناحیه‌ای با ما تماس بگیر.",
    faqTag: "پرسش‌های پرتکرار",
    faqH2: "پرسش‌هایی که مدیران پیش از آزمایش می‌پرسند.",
    faq: [
      {
        q: "اگر ورودی نیست، از کجا بدانم کدام دانش‌آموز چه جست‌وجو کرده؟",
        a: "معلم پیشاپیش فهرستی از نام‌های کوچک را در داشبورد بارگذاری می‌کند. وقتی دانش‌آموزی به نشانی کلاس می‌رود، نامش را با یک کلیک انتخاب می‌کند. هر جست‌وجو به آن نام نشانه‌گذاری می‌شود. هیچ ایمیل، رمز عبور یا اطلاعات شناسایی‌کننده‌ی شخصی جمع نمی‌شود.",
      },
      {
        q: "آیا این از نظر COPPA امن است؟ آیا شکایتی از سوی والدین خواهم داشت؟",
        a: "بله. Gadit اصلاً هیچ اطلاعات شخصی دانش‌آموز جمع نمی‌کند. بدون ساخت حساب، بدون گردآوری ایمیل، بدون تاریخ تولد، بدون شناسه. داده‌ای برای سوءاستفاده وجود ندارد. معماری به‌راحتی از COPPA، GDPR-K و قانون حریم خصوصی دانش‌آموز اسرائیل فراتر می‌رود.",
      },
      {
        q: "آیا دانش‌آموزان باید یک اپ نصب کنند؟",
        a: "نه. هر مرورگری کار می‌کند. دانش‌آموزان روی رایانه‌ی کلاس (یا هر دستگاهی با مرورگر) به gadit.app/c/CODE می‌روند. بدون فروشگاه اپ، بدون دخالت آی‌تی.",
      },
      {
        q: "آیا این به راه‌اندازی آی‌تی یا SSO نیاز دارد؟",
        a: "نه. مدیر یا هماهنگ‌کننده‌ی پایه در دو دقیقه کلاس را می‌سازد و کد را با معلمان به اشتراک می‌گذارد. آی‌تی در هیچ مرحله‌ای دخالت ندارد.",
      },
      {
        q: "داشبورد در واقع چه چیزی نشان می‌دهد؟",
        a: "جست‌وجوهای واژه‌ی هر دانش‌آموز با زمان دقیق، واژه‌هایی که کلاس این هفته بیشترین جست‌وجو را روی آن‌ها داشت، و الگوهای جست‌وجوی تکراری که درک شکننده را نشان می‌دهند. داده‌ی واقعی درک کلاس را می‌بینی، نه سنجه‌های مبهم درگیری.",
      },
      {
        q: "آیا می‌توان بیرون از ساعات کلاس از آن استفاده کرد؟",
        a: "کدهای کلاس به ساعات فعال مدرسه بسته‌اند (پیش‌فرض یکشنبه تا پنجشنبه 7:30 تا 15:00، قابل تنظیم). بیرون از این بازه کد دسترسی پایه‌ی فرهنگ لغت را می‌دهد اما بدون امکانات گسترده. این جلوگیری می‌کند از آنکه کد مدرسه به جایگزینی رایگان و شبانه‌روزی برای طرح خانواده تبدیل شود.",
      },
      {
        q: "اگر مدرسه‌ام بیش از 500 دانش‌آموز داشته باشد چه؟",
        a: "بر اساس تعداد دانش‌آموز انتخاب کن: تا 100 دانش‌آموز ماهی $97، تا 500 دانش‌آموز ماهی $297، و تا 1,000 دانش‌آموز ماهی $497. برای بیش از 1,000 دانش‌آموز یا نواحی چندمکانی، برای طرحی سفارشی با ما تماس بگیر.",
      },
      {
        q: "Gadit چگونه یک واژه را توضیح می‌دهد؟ آیا فقط یک ترجمه است؟",
        a: "Gadit یک فرهنگ لغت ترجمه نیست. Gadit واژه‌ها را تعریف و توضیح می‌دهد. برای هر واژه هر معنا، سه جمله‌ی مثال برای هر معنا، ریشه‌شناسی، و یک حالت آگاه از بافت می‌دهد که در آن دانش‌آموزان جمله را می‌چسبانند و Gadit معنای درست را برمی‌گزیند. رابط کاربری دانش‌آموز به زبان اوست، اما ژرفای توضیح در هر زبان رابط کاربری یکسان است.",
      },
    ],
    finalH2: "به حالت شکست خاموش پایان بده.",
    finalBody: "به معلمانت ابزاری بده تا دقیقاً ببینند کلاسشان چه چیزی را نمی‌فهمد. شروع دوره‌ی آزمایشی 2 دقیقه طول می‌کشد. بدون آی‌تی، بدون تدارکات، بدون فرم‌های والدین.",
    finalCta: "دوره‌ی آزمایشی رایگان 14 روزه را شروع کن",
    finalNote: "برای دوره‌ی آزمایشی کارت اعتباری لازم نیست. هر زمان لغو کن.",
    mockupRoster: "فهرست کلاس، 22 دانش‌آموز",
    mockupSearches: "پرجست‌وجوترین‌های این هفته",
    mockupStudent1: "مایا فتوسنتز را جست‌وجو کرد",
    mockupStudent2: "یوسی میتوکندری را جست‌وجو کرد ×2",
    mockupStudent3: "نوا دموکراسی را جست‌وجو کرد",
    mockupWordExample: "فتوسنتز",
    mockupExampleDef: "فرایندی که در آن گیاهان سبز با کمک نور خورشید، آب و دی‌اکسید کربن را به غذا تبدیل می‌کنند.",
    mockupExampleEx: "فتوسنتز بیشتر در برگ‌های گیاه انجام می‌شود.",
  },
  id: {
    heroH1: "Setiap murid memahami pelajaran.",
    heroSub: "Kata sulit apa pun, dalam salah satu dari 30+ bahasa, dijelaskan saat itu juga.",
    heroCta: "Mulai uji coba gratis 14 hari",
    heroPriceChip: "Mulai $97 / bulan",
    heroTrust: "Layanan mandiri. Batalkan kapan saja.",
    probTag: "Masalahnya",
    probH2: "Murid yang tidak memahami sebuah kata tidak bisa memahami kalimatnya.",
    probBody1: "Seorang murid melewatkan satu kata. Mereka tidak mengangkat tangan. Mereka mengira kurang lebih paham. Guru melanjutkan. Lima kata kemudian, paragrafnya jadi kabur. Lima paragraf kemudian, pelajarannya hilang.",
    probBody2: "Sebagian besar murid yang tertinggal bukanlah anak yang tidak cerdas. Mereka punya tumpukan kata yang tidak pernah benar-benar dipahami. Setiap kata baru yang dibangun di atasnya memperlebar jurangnya. Penyebabnya tak terlihat oleh guru.",
    probCallout1Title: "Jurang yang menumpuk",
    probCallout1Body: "Kata yang tak dipahami membangun penghalang tak terlihat untuk setiap pelajaran mendatang.",
    probCallout2Title: "Waktu yang terkuras",
    probCallout2Body: "Guru kehilangan 5-10 menit per pelajaran untuk menjelaskan definisi.",
    probCallout3Title: "Putus sekolah dalam diam",
    probCallout3Body: "Murid kehilangan fokus ketika sebuah paragraf punya terlalu banyak kata asing.",
    howTag: "Cara Kerjanya",
    howH2: "Siapkan dalam 2 menit. Tanpa IT.",
    howSub: "Pola kode kelas tanpa hambatan yang sama yang sudah berhasil untuk permainan kuis, dibuat untuk pemahaman kata.",
    howStep1Title: "Buat kode kelas",
    howStep1Body: "Kepala sekolah atau koordinator membuat kelas di dasbor. Sistem menghasilkan kode 6 karakter. Cetak di stiker untuk komputer kelas.",
    howStep2Title: "Murid bergabung, tanpa akun",
    howStep2Body: "Murid mengunjungi gadit.app/c/CODE di peramban apa pun, memilih namanya dari daftar (satu klik), dan mulai mengetik kata. Tanpa instal aplikasi, tanpa email, tanpa kata sandi.",
    howStep3Title: "Guru melihat apa yang dicari kelas",
    howStep3Body: "Setiap pencarian masuk ke dasbor, ditandai dengan nama murid. Anda melihat apa yang dicari setiap murid, kapan, dan kata mana yang menyulitkan kelas secara keseluruhan.",
    teacherTag: "Tampilan Guru",
    teacherH2: "Dasbor yang selama ini Anda minta.",
    teacherSub: "Bukan metrik keterlibatan yang samar. Kata spesifik, murid spesifik, momen spesifik.",
    teacherB1: "Riwayat pencarian per murid dengan cap waktu",
    teacherB2: "Kata yang paling dicari sekelas minggu ini",
    teacherB3: "Pencarian berulang yang menandai pemahaman rapuh",
    teacherB4: "Dapat difilter berdasarkan tanggal, murid, atau kata",
    privTag: "Privasi Sejak Awal",
    privH2: "Visibilitas penuh untuk guru. Nol risiko data untuk sekolah.",
    privSub: "Kami tidak mengumpulkan data pribadi murid. Bukan karena kami menyembunyikannya dengan rapi, tapi karena kami tidak pernah mengumpulkannya. Arsitekturnya sendiri adalah kepatuhannya.",
    privPoint1: "Tanpa akun murid. Tanpa email, tanpa kata sandi, tanpa ID.",
    privPoint2: "Tidak ada data pribadi yang meninggalkan sekolah. Pencarian hanya ditandai dengan nama dari daftar.",
    privPoint3: "Kode kelas hanya bekerja selama jam sekolah. Dapat dikonfigurasi per sekolah.",
    privPoint4: "COPPA, GDPR-K, dan hukum privasi murid Israel semua tertangani dengan nyaman.",
    privKahoot: "Bergabung semudah permainan kuis kelas. Dibuat untuk pemahaman kata dan visibilitas guru.",
    priceTag: "Harga",
    priceH2: "Sederhana. Di bawah ambang pengadaan.",
    priceSub: "Layanan mandiri lewat Stripe. Tanpa panggilan penjualan, tanpa demo, tanpa surat pesanan pembelian.",
    priceSmallName: "Sekolah",
    priceSmallAmount: "$69",
    priceSmallStudents: "Hingga 100 murid",
    priceLargeName: "Sekolah Besar",
    priceLargeAmount: "$149",
    priceLargeStudents: "Hingga 500 murid",
    priceIncludesTitle: "Kedua paket mencakup",
    priceIncludes: [
      "Kelas tak terbatas",
      "Dasbor guru lengkap",
      "Daftar pemilih murid",
      "Kode kelas terikat waktu",
      "Antarmuka murid dalam 30+ bahasa",
      "Uji coba gratis 14 hari",
      "Latihan pengucapan: dengar dan ucapkan setiap kata",
    ],
    priceCta: "Mulai uji coba gratis 14 hari",
    priceLarger: "Butuh lebih dari 1,000 murid? Hubungi kami tentang paket distrik.",
    faqTag: "Tanya Jawab",
    faqH2: "Pertanyaan yang diajukan kepala sekolah sebelum mencoba.",
    faq: [
      {
        q: "Jika tidak ada login, bagaimana saya tahu murid mana yang mencari apa?",
        a: "Guru memuat terlebih dahulu daftar nama depan di dasbor. Ketika seorang murid mengunjungi URL kelas, mereka memilih namanya dengan satu klik. Setiap pencarian ditandai ke nama itu. Tidak ada email, kata sandi, atau data pribadi yang dikumpulkan.",
      },
      {
        q: "Apakah ini aman menurut COPPA? Akankah saya menerima keluhan orang tua?",
        a: "Ya. Gadit sama sekali tidak mengumpulkan informasi pribadi murid. Tanpa pembuatan akun, tanpa pengumpulan email, tanpa tanggal lahir, tanpa ID. Tidak ada data yang bisa disalahgunakan. Arsitekturnya dengan nyaman melampaui COPPA, GDPR-K, dan hukum privasi murid Israel.",
      },
      {
        q: "Apakah murid perlu menginstal aplikasi?",
        a: "Tidak. Peramban apa pun bisa. Murid mengunjungi gadit.app/c/CODE di komputer kelas (atau perangkat apa pun dengan peramban). Tanpa toko aplikasi, tanpa keterlibatan IT.",
      },
      {
        q: "Apakah ini memerlukan penyiapan IT atau SSO?",
        a: "Tidak. Kepala sekolah atau koordinator angkatan membuat kelas dalam dua menit dan membagikan kodenya ke guru. IT tidak terlibat di langkah mana pun.",
      },
      {
        q: "Apa yang sebenarnya ditampilkan dasbor?",
        a: "Pencarian kata setiap murid dengan cap waktu, kata yang paling dicari kelas minggu ini, dan pola pencarian berulang yang menandakan pemahaman rapuh. Anda melihat data pemahaman kelas yang nyata, bukan metrik keterlibatan yang samar.",
      },
      {
        q: "Bisakah digunakan di luar jam pelajaran?",
        a: "Kode kelas terikat pada jam aktif sekolah (bawaan Minggu-Kamis 7:30-15:00, dapat dikonfigurasi). Di luar jendela itu kode memberi akses kamus dasar tapi tanpa fitur tambahan. Ini mencegah kode sekolah menjadi pengganti gratis 24/7 untuk tingkat Keluarga.",
      },
      {
        q: "Bagaimana jika sekolah saya punya lebih dari 500 murid?",
        a: "Pilih berdasarkan jumlah murid: hingga 100 murid $97/bulan, hingga 500 murid $297/bulan, dan hingga 1,000 murid $497/bulan. Untuk lebih dari 1,000 murid atau distrik multi-lokasi, hubungi kami untuk paket khusus.",
      },
      {
        q: "Bagaimana Gadit menjelaskan sebuah kata? Apakah hanya terjemahan?",
        a: "Gadit bukan kamus terjemahan. Gadit mendefinisikan dan menjelaskan kata. Untuk setiap kata ia memberi setiap makna, tiga contoh kalimat per makna, etimologi, dan mode sadar konteks tempat murid menempelkan kalimat dan Gadit memilih makna yang tepat. Antarmuka murid dalam bahasanya, tapi kedalaman penjelasannya sama dalam setiap bahasa antarmuka.",
      },
    ],
    finalH2: "Hentikan mode kegagalan dalam diam.",
    finalBody: "Beri guru Anda alat untuk melihat tepat apa yang tidak dipahami kelasnya. Uji coba butuh 2 menit untuk dimulai. Tanpa IT, tanpa pengadaan, tanpa formulir orang tua.",
    finalCta: "Mulai uji coba gratis 14 hari",
    finalNote: "Tanpa kartu kredit untuk uji coba. Batalkan kapan saja.",
    mockupRoster: "Daftar kelas, 22 murid",
    mockupSearches: "Paling banyak dicari minggu ini",
    mockupStudent1: "Maya mencari fotosintesis",
    mockupStudent2: "Yossi mencari mitokondria ×2",
    mockupStudent3: "Noa mencari demokrasi",
    mockupWordExample: "fotosintesis",
    mockupExampleDef: "Proses ketika tumbuhan hijau menggunakan cahaya matahari untuk mengubah air dan karbon dioksida menjadi makanan.",
    mockupExampleEx: "Fotosintesis terutama berlangsung di daun tumbuhan.",
  },
  he: {
    heroH1: "כל תלמיד מבין את השיעור.",
    heroSub: "כל מילה קשה, ב-30+ שפות, מוסברת מיד.",
    heroCta: "לפרטים ולהזמנה",
    heroPriceChip: "מ-₪3,490 לשנה",
    heroTrust: "בשירות עצמי. אפשר לבטל בכל רגע.",
    probTag: "הבעיה",
    probH2: "תלמיד שלא מבין מילה לא יכול להבין את המשפט.",
    probBody1: "תלמיד מפספס מילה. לא מרים את היד. חושב שהוא בערך מבין. המורה ממשיכה הלאה. חמש מילים אחר כך, הפסקה מטושטשת. חמש פסקאות אחר כך, השיעור אבוד.",
    probBody2: "רוב התלמידים שנופלים מאחור אינם פחות חכמים. יש להם ערימה של מילים שלא הבינו עד הסוף. כל מילה חדשה שמתבססת על הערימה מגדילה את הפער. הסיבה בלתי נראית למורה.",
    probCallout1Title: "פער שמתעצם",
    probCallout1Body: "מילים שלא הובנו בונות חומה בלתי נראית לכל שיעור עתידי.",
    probCallout2Title: "זמן שהולך לאיבוד",
    probCallout2Body: "מורים מאבדים 5 עד 10 דקות בכל שיעור על הסברי מילים.",
    probCallout3Title: "הניתוק השקט",
    probCallout3Body: "תלמידים מתנתקים כשפסקה מכילה יותר מדי מילים לא מוכרות.",
    howTag: "איך זה עובד",
    howH2: "הקמה ב-2 דקות. בלי צורך במחשוב.",
    howSub: "אותו דפוס של קוד-כיתה חסר חיכוך שכבר עובד במשחקי חידון, רק לשם הבנת מילים.",
    howStep1Title: "יצירת קוד כיתה",
    howStep1Body: "המנהל או רכז השכבה יוצרים כיתה בדשבורד. המערכת מייצרת קוד בן 6 תווים. מדפיסים על מדבקה ומדביקים על מחשב הכיתה.",
    howStep2Title: "תלמידים מצטרפים בלי חשבון",
    howStep2Body: "התלמידים נכנסים ל-gadit.app/c/CODE בכל דפדפן, בוחרים את השם שלהם מהרשימה (קליק אחד), ומתחילים להקליד מילים. בלי התקנה, בלי מייל, בלי סיסמה.",
    howStep3Title: "המורה רואה מה הכיתה חיפשה",
    howStep3Body: "כל חיפוש נכנס לדשבורד, מתוייג עם שם התלמיד. אפשר לראות מה כל תלמיד חיפש, מתי, ועם אילו מילים הכיתה כולה התקשתה.",
    teacherTag: "מבט המורה",
    teacherH2: "הדשבורד שחיכית לו.",
    teacherSub: "לא מדדי מעורבות מעורפלים. מילים ספציפיות, תלמידים ספציפיים, רגעים ספציפיים.",
    teacherB1: "היסטוריית חיפוש לכל תלמיד עם חותמת זמן",
    teacherB2: "המילים שכל הכיתה חיפשה השבוע",
    teacherB3: "חיפושים חוזרים שמסמנים הבנה שברירית",
    teacherB4: "סינון לפי תאריך, תלמיד או מילה",
    privTag: "פרטיות מובנית בארכיטקטורה",
    privH2: "שקיפות מלאה למורה. אפס סיכון נתונים לבית הספר.",
    privSub: "איננו אוספים נתונים אישיים על תלמידים. לא כי אנחנו מסתירים אותם היטב, אלא כי איננו אוספים אותם בכלל. הארכיטקטורה היא הציות.",
    privPoint1: "בלי חשבונות תלמידים. בלי מיילים, בלי סיסמאות, בלי תעודות זהות.",
    privPoint2: "שום מידע אישי לא יוצא מבית הספר. החיפושים מתויגים רק לפי שם מהרשימה.",
    privPoint3: "קודי כיתה עובדים רק בשעות בית הספר. ניתן להגדיר לכל בית ספר.",
    privPoint4: "עומד בחוק הגנת הפרטיות הישראלי ובתקני הפרטיות המחמירים בעולם.",
    privKahoot: "הצטרפות פשוטה כמו במשחק חידון. נבנה להבנת מילים ולנראות למורה.",
    priceTag: "מחירים",
    priceH2: "תוכניות ומחירים, לפי גודל בית הספר.",
    priceSub: "ממלאים טופס קצר, ואנחנו פותחים את בית הספר ושולחים חשבונית מס. תשלום שנתי בהעברה בנקאית או בהזמנת רכש.",
    priceSmallName: "Schools",
    priceSmallAmount: "$69",
    priceSmallStudents: "עד 100 תלמידים",
    priceLargeName: "Schools Large",
    priceLargeAmount: "$149",
    priceLargeStudents: "עד 500 תלמידים",
    priceIncludesTitle: "כל התוכניות כוללות",
    priceIncludes: [
      "כיתות ללא הגבלה",
      "דשבורד מורה מלא",
      "רשימת בחירת שם תלמיד",
      "קודי כיתה תחומים בזמן",
      "ממשק תלמיד ב-30+ שפות",
      "הזמנה שנתית פשוטה, מתחת לסף הרכש",
      "תרגול הגייה: לשמוע כל מילה ולהגיד אותה",
    ],
    priceCta: "לפרטים ולהזמנה",
    priceLarger: "יותר מ-1,000 תלמידים? אפשר ליצור קשר לתוכנית מותאמת.",
    faqTag: "שאלות נפוצות",
    faqH2: "מה מנהלים שואלים לפני שמזמינים.",
    faq: [
      {
        q: "אם אין התחברות, איך אדע איזה תלמיד חיפש מה?",
        a: "המורה טוענת מראש רשימה של שמות פרטיים בדשבורד. כשהתלמיד נכנס לכתובת הכיתה, הוא בוחר את השם שלו בקליק אחד. כל חיפוש מתוייג לאותו שם. בלי מייל, בלי סיסמה, בלי שום מידע אישי.",
      },
      {
        q: "האם זה עומד בדרישות הפרטיות? אקבל תלונת הורים?",
        a: "כן. Gadit לא אוסף שום מידע אישי על תלמידים. בלי יצירת חשבון, בלי איסוף מייל, בלי תאריכי לידה, בלי תעודות. אין נתונים שאפשר לעשות בהם שימוש לרעה. המערכת עומדת בנוחות בחוק הגנת הפרטיות הישראלי ובתקני הפרטיות המחמירים בעולם.",
      },
      {
        q: "האם תלמידים צריכים להתקין אפליקציה?",
        a: "לא. כל דפדפן עובד. התלמידים נכנסים לכתובת הכיתה על מחשב הכיתה (או על כל מכשיר עם דפדפן). בלי חנות אפליקציות, בלי צורך במחשוב.",
      },
      {
        q: "האם צריך התקנה טכנית מסובכת?",
        a: "לא. המנהל או רכז השכבה יוצרים כיתה בשתי דקות ומשתפים את הקוד עם המורים. אין צורך במעורבות של צוות מחשוב בשום שלב.",
      },
      {
        q: "מה הדשבורד באמת מראה?",
        a: "חיפושי המילים של כל תלמיד עם חותמת זמן, המילים שהכיתה חיפשה הכי הרבה השבוע, ודפוסים של חיפושים חוזרים שמסמנים הבנה שברירית. נתוני הבנה אמיתיים של הכיתה, לא מדדי מעורבות מעורפלים.",
      },
      {
        q: "האם זה עובד מחוץ לשעות הלימודים?",
        a: "קודי כיתה תחומים לשעות הפעילות של בית הספר (ברירת מחדל א' עד ה', 7:30 עד 15:00, ניתן להגדיר). מחוץ לחלון הזה הקוד נותן גישה למילון בסיסי בלבד. זה מונע מהקוד של בית הספר להפוך לתחליף חינמי של תוכנית Family ב-24/7.",
      },
      {
        q: "מה אם בית הספר שלי מעל 1,000 תלמידים?",
        a: "שלוש חבילות לפי מספר התלמידים: עד 100 תלמידים ₪349 לחודש, עד 500 תלמידים ₪649 לחודש, ועד 1,000 תלמידים ₪949 לחודש (או ₪3,490 / ₪6,490 / ₪9,490 לשנה). מעל 1,000 תלמידים או לרשתות בתי ספר, אפשר ליצור קשר להצעת מחיר מותאמת.",
      },
      {
        q: "איך Gadit מסביר מילה? זה תרגום?",
        a: "Gadit הוא לא מילון תרגום. Gadit מגדיר ומסביר מילים. לכל מילה הוא נותן את כל המשמעויות, שלושה משפטי דוגמה לכל משמעות, אטימולוגיה, ומצב הקשרי שבו התלמיד מדביק את המשפט ו-Gadit בוחר את המשמעות הנכונה. ממשק התלמיד בשפה שלו, אבל עומק ההסבר זהה בכל ממשק.",
      },
    ],
    finalH2: "כאן נעצר כשל הלמידה השקט.",
    finalBody: "המורים שלך מקבלים את הכלי לראות בדיוק מה הכיתה לא מבינה. ההתחלה לוקחת 2 דקות. בלי מחשוב, בלי רכש מסובך, בלי טפסי הורים.",
    finalCta: "לפרטים ולהזמנה",
    finalNote: "תשלום שנתי בהעברה בנקאית מול חשבונית מס. אין צורך במכרז.",
    mockupRoster: "רשימת כיתה, 22 תלמידים",
    mockupSearches: "הכי מחופשים השבוע",
    mockupStudent1: "מאיה חיפשה פוטוסינתזה",
    mockupStudent2: "יוסי חיפש מיטוכונדריה ×2",
    mockupStudent3: "נועה חיפשה דמוקרטיה",
    mockupWordExample: "פוטוסינתזה",
    mockupExampleDef: "תהליך שבו צמחים ירוקים משתמשים באור השמש להפיכת מים ופחמן דו-חמצני למזון.",
    mockupExampleEx: "הפוטוסינתזה מתרחשת בעיקר בעלים של הצמח.",
  },

  // ─── Russian ──────────────────────────────────────────────────
  ru: {
    heroH1: "Каждый ученик понимает урок.",
    heroSub: "Любое трудное слово, на любом из 30+ языков, объяснено сразу.",
    heroCta: "Цены и заказ",
    heroPriceChip: "От $97 / месяц",
    heroTrust: "Самообслуживание. Отмена в любой момент.",
    probTag: "Проблема",
    probH2: "Ученик, не понимающий слово, не может понять предложение.",
    probBody1: "Ученик не знает одно слово. Он не поднимает руку. Думает, что примерно понимает. Учитель идёт дальше. Через пять слов абзац уже размытый. Через пять абзацев урок потерян.",
    probBody2: "Большинство учеников, отстающих в учёбе, не глупые. У них накопилась стопка слов, которые они так и не поняли до конца. Каждое новое слово, опирающееся на эту стопку, увеличивает разрыв. Учитель не видит причины.",
    probCallout1Title: "Растущий разрыв",
    probCallout1Body: "Невыученные слова строят невидимую стену для каждого будущего урока.",
    probCallout2Title: "Утечка времени",
    probCallout2Body: "Учителя теряют 5–10 минут на каждом уроке, объясняя слова.",
    probCallout3Title: "Тихий отрыв",
    probCallout3Body: "Ученики отключаются, когда в абзаце слишком много незнакомых слов.",
    howTag: "Как это работает",
    howH2: "Настройка за 2 минуты. Без IT.",
    howSub: "Тот же беспроблемный шаблон классного кода, который уже работает в викторинах, только для понимания слов.",
    howStep1Title: "Создайте код класса",
    howStep1Body: "Директор или координатор класса создаёт класс в панели управления. Система выдаёт код из 6 символов. Распечатайте его наклейкой для классного компьютера.",
    howStep2Title: "Ученики входят без аккаунтов",
    howStep2Body: "Ученики заходят на gadit.app/c/CODE в любом браузере, выбирают своё имя из списка (один клик) и начинают вводить слова. Без установки приложения, без email, без пароля.",
    howStep3Title: "Учитель видит, что искал класс",
    howStep3Body: "Каждый поиск попадает в панель управления с именем ученика. Вы видите, что искал каждый ученик, когда и какие слова вызвали трудности у всего класса.",
    teacherTag: "Взгляд учителя",
    teacherH2: "Панель управления, которую вы ждали.",
    teacherSub: "Не размытые показатели вовлечённости. Конкретные слова, конкретные ученики, конкретные моменты.",
    teacherB1: "История поиска каждого ученика с отметками времени",
    teacherB2: "Самые искомые слова класса за неделю",
    teacherB3: "Повторные поиски, сигнализирующие о шатком понимании",
    teacherB4: "Фильтр по дате, ученику или слову",
    privTag: "Приватность в архитектуре",
    privH2: "Полная видимость для учителей. Ноль риска данных для школы.",
    privSub: "Мы не собираем личные данные учеников. Не потому что хорошо их прячем, а потому что вообще их не собираем. Архитектура — это и есть соответствие требованиям.",
    privPoint1: "Без аккаунтов учеников. Без email, без паролей, без удостоверений.",
    privPoint2: "Никакая личная информация не покидает школу. Поиски помечаются только именем из списка.",
    privPoint3: "Коды классов работают только в школьное время. Настраивается для каждой школы.",
    privPoint4: "COPPA, GDPR-K и израильский закон о защите детей соблюдаются с запасом.",
    privKahoot: "Подключаются так же легко, как к классной викторине. Построено для понимания слов и видимости для учителя.",
    priceTag: "Цены",
    priceH2: "Просто. Ниже порога закупок.",
    priceSub: "Самообслуживание через Stripe. Без звонков от продавцов, без демонстраций, без счетов на оплату.",
    priceSmallName: "Schools",
    priceSmallAmount: "$69",
    priceSmallStudents: "До 100 учеников",
    priceLargeName: "Schools Large",
    priceLargeAmount: "$149",
    priceLargeStudents: "До 500 учеников",
    priceIncludesTitle: "Оба тарифа включают",
    priceIncludes: [
      "Неограниченное число классов",
      "Полная панель учителя",
      "Список выбора имени ученика",
      "Коды классов, привязанные к расписанию",
      "Интерфейс ученика на 30+ языках",
      "14-дневный пробный период",
      "Практика произношения: услышать и произнести любое слово",
    ],
    priceCta: "Цены и заказ",
    priceLarger: "Больше 1,000 учеников? Свяжитесь с нами для тарифа района.",
    faqTag: "Вопросы и ответы",
    faqH2: "Что директора спрашивают перед пробным периодом.",
    faq: [
      {
        q: "Если нет логинов, как я узнаю, какой ученик что искал?",
        a: "Учитель заранее загружает список имён в панель. Когда ученик заходит на URL класса, он выбирает своё имя одним кликом. Каждый поиск помечается этим именем. Без email, без пароля, без личных данных.",
      },
      {
        q: "Это безопасно по COPPA? Не получу ли жалобу от родителей?",
        a: "Да. Gadit вообще не собирает личных данных учеников. Без создания аккаунтов, без email, без дат рождения, без удостоверений. Данных, которыми можно злоупотребить, просто нет. Архитектура с запасом соответствует COPPA, GDPR-K и израильскому закону о защите детей.",
      },
      {
        q: "Нужно ли ученикам устанавливать приложение?",
        a: "Нет. Подойдёт любой браузер. Ученики заходят на gadit.app/c/CODE с классного компьютера (или с любого устройства с браузером). Без магазина приложений, без участия IT.",
      },
      {
        q: "Нужна ли настройка IT или SSO?",
        a: "Нет. Директор или координатор класса создаёт класс за две минуты и делится кодом с учителями. IT не задействован ни на одном этапе.",
      },
      {
        q: "Что именно показывает панель управления?",
        a: "Поиски слов каждого ученика с отметками времени, слова, которые класс искал чаще всего за неделю, и шаблоны повторных поисков, сигнализирующие о шатком понимании. Реальные данные о понимании класса, а не размытые показатели вовлечённости.",
      },
      {
        q: "Можно ли использовать вне школьных часов?",
        a: "Коды классов привязаны к школьному расписанию (по умолчанию воскресенье–четверг 7:30–15:00, настраивается). Вне этого окна код даёт базовый доступ к словарю, но без расширенных функций. Это предотвращает превращение школьного кода в бесплатную замену тарифа Family на 24/7.",
      },
      {
        q: "Что если в моей школе больше 500 учеников?",
        a: "Выбирайте по числу учеников: до 100 учеников $97 в месяц, до 500 учеников $297 в месяц, до 1,000 учеников $497 в месяц. Для более 1,000 учеников или многоплощадочных районов свяжитесь с нами для индивидуального плана.",
      },
      {
        q: "Как Gadit объясняет слово? Это просто перевод?",
        a: "Gadit не словарь переводов. Gadit определяет и объясняет слова. Для каждого слова он даёт все значения, три примера предложений на каждое значение, этимологию и контекстный режим, в котором ученик вставляет предложение, а Gadit выбирает правильное значение. Интерфейс ученика на его языке, но глубина объяснения одинакова на любом языке.",
      },
    ],
    finalH2: "Остановите тихий провал.",
    finalBody: "Дайте учителям инструмент, чтобы видеть, что именно их класс не понимает. Пробный период начинается за 2 минуты. Без IT, без закупок, без родительских форм.",
    finalCta: "Цены и заказ",
    finalNote: "Кредитная карта не нужна для пробного периода. Отмена в любой момент.",
    mockupRoster: "Список класса, 22 ученика",
    mockupSearches: "Самые искомые за неделю",
    mockupStudent1: "Майя искала «фотосинтез»",
    mockupStudent2: "Йоси искал «митохондрия» ×2",
    mockupStudent3: "Ноа искала «демократия»",
    mockupWordExample: "фотосинтез",
    mockupExampleDef: "Процесс, в котором зелёные растения используют солнечный свет для превращения воды и углекислого газа в пищу.",
    mockupExampleEx: "Фотосинтез происходит в основном в листьях растения.",
  },

  // ─── Arabic (MSA) ─────────────────────────────────────────────
  nl: {
    heroH1: "Elke leerling begrijpt de les.",
    heroSub: "Elk moeilijk woord, in een van de 30+ talen, meteen uitgelegd.",
    heroCta: "Start gratis proefperiode van 14 dagen",
    heroPriceChip: "Vanaf $97 / maand",
    heroTrust: "Zelf te regelen. Altijd opzegbaar.",
    probTag: "Het probleem",
    probH2: "Een leerling die een woord niet begrijpt, kan de zin niet begrijpen.",
    probBody1: "Een leerling mist één woord. Hij steekt zijn vinger niet op. Hij denkt dat hij het ongeveer snapt. De docent gaat verder. Vijf woorden later is de alinea wazig. Vijf alinea's later is de les verloren.",
    probBody2: "De meeste leerlingen die achterop raken zijn niet dom. Ze hebben een stapel woorden die ze nooit helemaal begrepen hebben. Elk nieuw woord dat daarop voortbouwt, vergroot de kloof. De oorzaak is onzichtbaar voor de docent.",
    probCallout1Title: "De groeiende kloof",
    probCallout1Body: "Ongeleerde woorden vormen een onzichtbare barrière voor elke volgende les.",
    probCallout2Title: "Het tijdverlies",
    probCallout2Body: "Docenten verliezen 5 tot 10 minuten per les aan uitleg van woorden.",
    probCallout3Title: "Het stille afhaken",
    probCallout3Body: "Leerlingen haken af wanneer een alinea te veel onbekende woorden bevat.",
    howTag: "Hoe het werkt",
    howH2: "In 2 minuten opgezet. Geen IT nodig.",
    howSub: "Hetzelfde wrijvingsloze klascodepatroon dat al werkt bij quizspellen, nu gebouwd voor het begrijpen van woorden.",
    howStep1Title: "Maak een klascode aan",
    howStep1Body: "De directeur of coördinator maakt een klas aan in het dashboard. Het systeem genereert een code van 6 tekens. Print die op een sticker voor de klascomputer.",
    howStep2Title: "Leerlingen doen mee, zonder account",
    howStep2Body: "Leerlingen gaan naar gadit.app/c/CODE in elke browser, kiezen hun naam uit de lijst (één klik) en beginnen woorden te typen. Geen app-installatie, geen e-mail, geen wachtwoord.",
    howStep3Title: "Docenten zien wat de klas heeft opgezocht",
    howStep3Body: "Elke zoekopdracht komt in het dashboard, voorzien van de naam van de leerling. Je ziet wat elke leerling heeft opgezocht, wanneer, en met welke woorden de klas als geheel worstelde.",
    teacherTag: "Het docentenoverzicht",
    teacherH2: "Het dashboard waar je om vroeg.",
    teacherSub: "Geen vage betrokkenheidscijfers. Specifieke woorden, specifieke leerlingen, specifieke momenten.",
    teacherB1: "Zoekgeschiedenis per leerling met tijdstempels",
    teacherB2: "Meest gezochte woorden van de hele klas deze week",
    teacherB3: "Herhaalde zoekopdrachten die op broos begrip wijzen",
    teacherB4: "Te filteren op datum, leerling of woord",
    privTag: "Privacy vanuit het ontwerp",
    privH2: "Volledig inzicht voor docenten. Nul datarisico voor scholen.",
    privSub: "Wij verzamelen geen persoonsgegevens van leerlingen. Niet omdat we ze goed verbergen, maar omdat we ze nooit verzamelen. De architectuur is de naleving.",
    privPoint1: "Geen leerlingaccounts. Geen e-mails, geen wachtwoorden, geen ID's.",
    privPoint2: "Geen persoonlijke gegevens verlaten de school. Zoekopdrachten worden alleen met de naam uit de lijst gemarkeerd.",
    privPoint3: "Klascodes werken alleen tijdens schooltijden. Per school in te stellen.",
    privPoint4: "COPPA, AVG-K en de Israëlische wet op leerlingprivacy worden ruimschoots nageleefd.",
    privKahoot: "Deelnemen gaat net zo makkelijk als bij een quizspel in de klas. Gebouwd voor het begrijpen van woorden en voor inzicht van de docent.",
    priceTag: "Prijzen",
    priceH2: "Eenvoudig. Onder de aanbestedingsdrempel.",
    priceSub: "Zelf te regelen via Stripe. Geen verkoopgesprekken, geen demo's, geen inkooporders.",
    priceSmallName: "Schools",
    priceSmallAmount: "$69",
    priceSmallStudents: "Tot 100 leerlingen",
    priceLargeName: "Schools Large",
    priceLargeAmount: "$149",
    priceLargeStudents: "Tot 500 leerlingen",
    priceIncludesTitle: "Beide plannen bevatten",
    priceIncludes: [
      "Onbeperkt aantal klassen",
      "Volledig docentendashboard",
      "Namenlijst om leerling te kiezen",
      "In tijd begrensde klascodes",
      "Leerlinginterface in 30+ talen",
      "Gratis proefperiode van 14 dagen",
      "Uitspraakoefening: hoor elk woord en zeg het na",
    ],
    priceCta: "Start gratis proefperiode van 14 dagen",
    priceLarger: "Meer dan 1,000 leerlingen nodig? Neem contact met ons op over districtsplannen.",
    faqTag: "Veelgestelde vragen",
    faqH2: "Vragen die directeuren stellen voordat ze een proef starten.",
    faq: [
      {
        q: "Als er geen logins zijn, hoe weet ik dan welke leerling wat heeft gezocht?",
        a: "De docent laadt vooraf een lijst met voornamen in het dashboard. Wanneer een leerling de klas-URL bezoekt, kiest hij zijn naam met één klik. Elke zoekopdracht wordt aan die naam gekoppeld. Er worden geen e-mail, geen wachtwoord en geen persoonsgegevens verzameld.",
      },
      {
        q: "Is dit COPPA-veilig? Krijg ik een klacht van een ouder?",
        a: "Ja. Gadit verzamelt helemaal geen persoonlijke informatie van leerlingen. Geen accountaanmaak, geen e-mailverzameling, geen geboortedata, geen ID's. Er zijn geen gegevens die misbruikt kunnen worden. De architectuur overtreft ruimschoots COPPA, AVG-K en de Israëlische wet op leerlingprivacy.",
      },
      {
        q: "Moeten leerlingen een app installeren?",
        a: "Nee. Elke browser werkt. Leerlingen gaan naar gadit.app/c/CODE op de klascomputer (of op elk apparaat met een browser). Geen appstore, geen IT-betrokkenheid.",
      },
      {
        q: "Is hiervoor IT- of SSO-installatie nodig?",
        a: "Nee. Een directeur of leerjaarcoördinator maakt de klas in twee minuten aan en deelt de code met docenten. IT is bij geen enkele stap betrokken.",
      },
      {
        q: "Wat laat het dashboard eigenlijk zien?",
        a: "De woordzoekopdrachten van elke leerling met tijdstempels, de woorden die de klas deze week het meest zocht, en patronen van herhaalde zoekopdrachten die op broos begrip wijzen. Je ziet de echte begripsdata van de klas, geen vage betrokkenheidscijfers.",
      },
      {
        q: "Kan het buiten schooltijden worden gebruikt?",
        a: "Klascodes zijn gekoppeld aan de actieve uren van de school (standaard zondag tot en met donderdag 7:30 tot 15:00, instelbaar). Buiten dat tijdvenster geeft de code basale woordenboektoegang maar geen uitgebreide functies. Dit voorkomt dat de schoolcode een gratis vervanging 24/7 wordt voor het Family-abonnement.",
      },
      {
        q: "Wat als mijn school meer dan 500 leerlingen heeft?",
        a: "Kies op basis van het aantal leerlingen: tot 100 leerlingen is $97/maand, tot 500 is $297/maand en tot 1,000 is $497/maand. Voor meer dan 1,000 leerlingen of districten met meerdere locaties kun je contact met ons opnemen voor een plan op maat.",
      },
      {
        q: "Hoe legt Gadit een woord uit? Is het gewoon een vertaling?",
        a: "Gadit is geen vertaalwoordenboek. Gadit definieert en verklaart woorden. Voor elk woord geeft het elke betekenis, drie voorbeeldzinnen per betekenis, etymologie, en een contextgevoelige modus waarin leerlingen de zin plakken en Gadit de juiste betekenis kiest. De interface van de leerling is in zijn taal, maar de diepgang van de uitleg is in elke interfacetaal gelijk.",
      },
    ],
    finalH2: "Stop het stille falen.",
    finalBody: "Geef je docenten het gereedschap om precies te zien wat hun klas niet begrijpt. De proef starten kost 2 minuten. Geen IT, geen aanbesteding, geen ouderformulieren.",
    finalCta: "Start gratis proefperiode van 14 dagen",
    finalNote: "Geen creditcard nodig voor de proefperiode. Altijd opzegbaar.",
    mockupRoster: "Klassenlijst, 22 leerlingen",
    mockupSearches: "Meest gezocht deze week",
    mockupStudent1: "Maya zocht fotosynthese",
    mockupStudent2: "Yossi zocht mitochondrium ×2",
    mockupStudent3: "Noa zocht democratie",
    mockupWordExample: "fotosynthese",
    mockupExampleDef: "Het proces waarbij groene planten zonlicht gebruiken om water en koolstofdioxide om te zetten in voedsel.",
    mockupExampleEx: "Fotosynthese vindt vooral plaats in de bladeren van de plant.",
  },
  ar: {
    heroH1: "كل طالب يفهم الدرس.",
    heroSub: "أي كلمة صعبة، بأي من 30+ لغة، تُشرح في الحال.",
    heroCta: "الأسعار والطلب",
    heroPriceChip: "ابتداءً من $97 شهريًا",
    heroTrust: "خدمة ذاتية. ألغِ في أي وقت.",
    probTag: "المشكلة",
    probH2: "طالب لا يفهم كلمة لا يستطيع فهم الجملة.",
    probBody1: "الطالب يفوّت كلمة واحدة. لا يرفع يده. يظنّ أنه يفهم تقريبًا. تنتقل المعلمة إلى التالي. بعد خمس كلمات تصبح الفقرة ضبابية. بعد خمس فقرات يضيع الدرس.",
    probBody2: "معظم الطلاب الذين يتأخّرون ليسوا أقلّ ذكاءً. لديهم كومة من الكلمات التي لم يفهموها تمامًا. كل كلمة جديدة تُبنى على هذه الكومة تُكبّر الفجوة. السبب غير مرئيّ للمعلّم.",
    probCallout1Title: "فجوة تتراكم",
    probCallout1Body: "الكلمات غير المفهومة تبني حاجزًا غير مرئي لكل درس قادم.",
    probCallout2Title: "هدر الوقت",
    probCallout2Body: "المعلمون يفقدون 5 إلى 10 دقائق من كل درس على شرح الكلمات.",
    probCallout3Title: "الانفصال الصامت",
    probCallout3Body: "الطلاب ينفصلون عن الدرس عندما تحتوي الفقرة على كلمات كثيرة غير مألوفة.",
    howTag: "كيف يعمل",
    howH2: "إعداد في دقيقتين. بلا تقنية معلومات.",
    howSub: "نفس نمط كود الصفّ الخالي من الاحتكاك الذي يعمل في ألعاب المسابقات، مبنيًا لفهم الكلمات.",
    howStep1Title: "أنشئ كود الصف",
    howStep1Body: "المدير أو منسّق الصف ينشئ صفًّا في لوحة التحكم. يُنتج النظام كودًا من 6 أحرف. اطبعوه ملصقًا على حاسوب الصف.",
    howStep2Title: "الطلاب ينضمّون بلا حسابات",
    howStep2Body: "الطلاب يدخلون gadit.app/c/CODE من أي متصفح، يختارون اسمهم من القائمة بنقرة واحدة، ويبدؤون بكتابة الكلمات. بلا تطبيق، بلا بريد إلكتروني، بلا كلمة مرور.",
    howStep3Title: "المعلم يرى ماذا بحث الصف",
    howStep3Body: "كل بحث يصل إلى لوحة التحكم مع اسم الطالب. ترى ما بحث عنه كل طالب، ومتى، وأي كلمات صعبت على الصف بأكمله.",
    teacherTag: "نظرة المعلم",
    teacherH2: "لوحة التحكم التي طال انتظارها.",
    teacherSub: "ليست مؤشرات تفاعل ضبابية. كلمات محدّدة، طلاب محدّدون، لحظات محدّدة.",
    teacherB1: "تاريخ البحث لكل طالب مع طوابع زمنية",
    teacherB2: "الكلمات الأكثر بحثًا في الصف هذا الأسبوع",
    teacherB3: "عمليات بحث متكرّرة تشير إلى فهم هشّ",
    teacherB4: "تصفية حسب التاريخ أو الطالب أو الكلمة",
    privTag: "خصوصية مبنية في الهندسة",
    privH2: "رؤية كاملة للمعلمين. صفر مخاطر بيانات للمدرسة.",
    privSub: "نحن لا نجمع أي بيانات شخصية للطلاب. ليس لأننا نخفيها جيدًا، بل لأننا لا نجمعها أصلاً. الهندسة هي الامتثال.",
    privPoint1: "بلا حسابات طلاب. لا بريد، لا كلمات مرور، لا هويات.",
    privPoint2: "لا تخرج معلومات شخصية من المدرسة. الأبحاث تُوسم باسم القائمة فقط.",
    privPoint3: "أكواد الصفوف تعمل فقط خلال ساعات المدرسة. قابلة للضبط لكل مدرسة.",
    privPoint4: "COPPA، GDPR-K، وقانون الخصوصية الإسرائيلي للطلاب مغطّاة براحة.",
    privKahoot: "الانضمام سهل كلعبة مسابقة صفّية. مبني لفهم الكلمات ولرؤية المعلم.",
    priceTag: "الأسعار",
    priceH2: "بسيط. تحت عتبة المشتريات.",
    priceSub: "خدمة ذاتية عبر Stripe. لا مكالمات مبيعات، لا عروض، لا أوامر شراء.",
    priceSmallName: "Schools",
    priceSmallAmount: "$69",
    priceSmallStudents: "حتى 100 طالب",
    priceLargeName: "Schools Large",
    priceLargeAmount: "$149",
    priceLargeStudents: "حتى 500 طالب",
    priceIncludesTitle: "الخطتان تشملان",
    priceIncludes: [
      "صفوف بلا حدود",
      "لوحة معلم كاملة",
      "قائمة اختيار أسماء الطلاب",
      "أكواد صفوف مقيّدة بالوقت",
      "واجهة طالب بـ 30+ لغة",
      "تجربة مجانية لـ 14 يومًا",
      "تدريب على النطق: اسمع أي كلمة وانطقها",
    ],
    priceCta: "الأسعار والطلب",
    priceLarger: "أكثر من 1,000 طالب؟ تواصل معنا لخطة منطقة.",
    faqTag: "أسئلة شائعة",
    faqH2: "ما يسأله المديرون قبل بدء التجربة.",
    faq: [
      {
        q: "إذا لم يكن هناك تسجيل دخول، كيف أعرف أي طالب بحث عن ماذا؟",
        a: "المعلم يحمّل مسبقًا قائمة أسماء في اللوحة. عندما يدخل الطالب رابط الصف، يختار اسمه بنقرة واحدة. كل بحث يُوسم بهذا الاسم. بلا بريد، بلا كلمة مرور، بلا أي معلومات شخصية.",
      },
      {
        q: "هل هذا متوافق مع COPPA؟ هل سأتلقّى شكوى من ولي أمر؟",
        a: "نعم. Gadit لا يجمع أي معلومات شخصية للطلاب على الإطلاق. لا إنشاء حسابات، لا جمع بريد، لا تواريخ ميلاد، لا هويات. لا توجد بيانات يمكن إساءة استخدامها. الهندسة تتجاوز براحة متطلبات COPPA وGDPR-K وقانون الخصوصية الإسرائيلي.",
      },
      {
        q: "هل يحتاج الطلاب لتثبيت تطبيق؟",
        a: "لا. أي متصفح يعمل. الطلاب يدخلون gadit.app/c/CODE على حاسوب الصف (أو على أي جهاز بمتصفح). بلا متجر تطبيقات، بلا مشاركة من تقنية المعلومات.",
      },
      {
        q: "هل يتطلب إعداد تقنية المعلومات أو SSO؟",
        a: "لا. المدير أو منسّق الصف ينشئ الصف في دقيقتين ويشارك الكود مع المعلمين. تقنية المعلومات غير معنيّة في أي خطوة.",
      },
      {
        q: "ماذا تُظهر لوحة التحكم فعلاً؟",
        a: "أبحاث الكلمات لكل طالب مع طوابع زمنية، الكلمات التي بحث عنها الصف أكثر خلال الأسبوع، وأنماط الأبحاث المتكرّرة التي تدلّ على فهم هشّ. بيانات فهم حقيقية للصف، لا مؤشرات تفاعل ضبابية.",
      },
      {
        q: "هل يمكن استخدامه خارج ساعات المدرسة؟",
        a: "أكواد الصفوف مقيّدة بساعات المدرسة الفعّالة (افتراضيًا الأحد–الخميس 7:30–15:00، قابلة للضبط). خارج هذه النافذة يعطي الكود وصولاً قاموسيًا أساسيًا فقط. هذا يمنع تحوّل كود المدرسة إلى بديل مجاني لخطة Family على مدار اليوم.",
      },
      {
        q: "ماذا لو كانت مدرستي أكثر من 500 طالب؟",
        a: "اختر حسب عدد الطلاب: حتى 100 طالب بـ 97 دولارًا شهريًا، حتى 500 طالب بـ 297 دولارًا شهريًا، وحتى 1,000 طالب بـ 497 دولارًا شهريًا. لأكثر من 1,000 طالب أو شبكات متعدّدة المواقع، تواصل معنا لخطة مخصّصة.",
      },
      {
        q: "كيف يشرح Gadit كلمة؟ هل هو ترجمة فقط؟",
        a: "Gadit ليس قاموس ترجمة. Gadit يعرّف ويشرح الكلمات. لكل كلمة يعطي كل معانيها، ثلاث جمل أمثلة لكل معنى، اشتقاق الكلمة، ووضعًا سياقيًّا حيث يلصق الطالب الجملة ويختار Gadit المعنى الصحيح. واجهة الطالب بلغته، لكن عمق الشرح متساوٍ في كل لغة.",
      },
    ],
    finalH2: "أوقف الفشل الصامت.",
    finalBody: "أعطِ معلميك الأداة لرؤية ما لا يفهمه صفّهم بالضبط. تبدأ التجربة في دقيقتين. بلا تقنية معلومات، بلا مشتريات، بلا نماذج لأولياء الأمور.",
    finalCta: "الأسعار والطلب",
    finalNote: "لا حاجة لبطاقة ائتمان للتجربة. ألغِ في أي وقت.",
    mockupRoster: "قائمة الصف، 22 طالبًا",
    mockupSearches: "الأكثر بحثًا هذا الأسبوع",
    mockupStudent1: "مايا بحثت عن «التركيب الضوئي»",
    mockupStudent2: "يوسي بحث عن «الميتوكوندريا» ×2",
    mockupStudent3: "نوعا بحثت عن «الديمقراطية»",
    mockupWordExample: "التركيب الضوئي",
    mockupExampleDef: "العملية التي تستخدم فيها النباتات الخضراء ضوء الشمس لتحويل الماء وثاني أكسيد الكربون إلى غذاء.",
    mockupExampleEx: "يحدث التركيب الضوئي بشكل أساسي في أوراق النبات.",
  },

  // ─── Czech ────────────────────────────────────────────────────
  cs: {
    heroH1: "Každý žák rozumí učivu.",
    heroSub: "Každé těžké slovo, v kterémkoli ze 20 jazyků, hned vysvětlené.",
    heroCta: "Začít 14denní zkušební období",
    heroPriceChip: "Od $97 měsíčně",
    heroTrust: "Samoobsluha. Zrušení kdykoli.",
    probTag: "Problém",
    probH2: "Žák, který nerozumí slovu, nemůže rozumět větě.",
    probBody1: "Žák minul jedno slovo. Nezvedne ruku. Myslí si, že tomu zhruba rozumí. Učitel jde dál. Po pěti slovech je odstavec rozmazaný. Po pěti odstavcích je lekce ztracená.",
    probBody2: "Většina žáků, kteří zaostávají, nejsou méně inteligentní. Mají hromadu slov, kterým nikdy úplně neporozuměli. Každé nové slovo postavené na této hromadě prohlubuje propast. Příčina je pro učitele neviditelná.",
    probCallout1Title: "Narůstající propast",
    probCallout1Body: "Nenaučená slova staví neviditelnou zeď pro každou budoucí lekci.",
    probCallout2Title: "Ztráta času",
    probCallout2Body: "Učitelé ztrácejí 5 až 10 minut z každé lekce vysvětlováním slov.",
    probCallout3Title: "Tiché odpojení",
    probCallout3Body: "Žáci se odpojí, když odstavec obsahuje příliš mnoho neznámých slov.",
    howTag: "Jak to funguje",
    howH2: "Nastavení za 2 minuty. Bez IT.",
    howSub: "Stejný bezproblémový vzor třídního kódu, který už funguje u kvízových her, jen pro porozumění slovům.",
    howStep1Title: "Vytvořte kód třídy",
    howStep1Body: "Ředitel nebo koordinátor ročníku vytvoří třídu v panelu. Systém vygeneruje kód o 6 znacích. Vytiskněte ho jako nálepku pro třídní počítač.",
    howStep2Title: "Žáci se připojí bez účtů",
    howStep2Body: "Žáci navštíví gadit.app/c/CODE v jakémkoli prohlížeči, vyberou si své jméno ze seznamu (jeden klik) a začnou psát slova. Bez instalace aplikace, bez e-mailu, bez hesla.",
    howStep3Title: "Učitelé vidí, co třída hledala",
    howStep3Body: "Každé vyhledávání se zobrazí v panelu se jménem žáka. Vidíte, co každý žák hledal, kdy, a se kterými slovy měla potíže celá třída.",
    teacherTag: "Pohled učitele",
    teacherH2: "Panel, na který jste čekali.",
    teacherSub: "Žádné vágní metriky zapojení. Konkrétní slova, konkrétní žáci, konkrétní okamžiky.",
    teacherB1: "Historie hledání každého žáka s časovými razítky",
    teacherB2: "Nejhledanější slova třídy tento týden",
    teacherB3: "Opakovaná hledání signalizující křehké porozumění",
    teacherB4: "Filtrování podle data, žáka nebo slova",
    privTag: "Soukromí v architektuře",
    privH2: "Plná viditelnost pro učitele. Nulové riziko dat pro školu.",
    privSub: "Neshromažďujeme žádné osobní údaje žáků. Ne proto, že je dobře skrýváme, ale proto, že je vůbec neshromažďujeme. Architektura je dodržování předpisů.",
    privPoint1: "Bez žákovských účtů. Bez e-mailů, bez hesel, bez identifikátorů.",
    privPoint2: "Žádné osobní informace neopouštějí školu. Vyhledávání jsou označena pouze jménem ze seznamu.",
    privPoint3: "Třídní kódy fungují jen ve školních hodinách. Nastavitelné pro každou školu.",
    privPoint4: "COPPA, GDPR-K a izraelský zákon o ochraně dětí jsou pokryty s rezervou.",
    privKahoot: "Připojení jednoduché jako u třídního kvízu. Postaveno pro porozumění slovům a viditelnost pro učitele.",
    priceTag: "Ceny",
    priceH2: "Jednoduše. Pod prahem schvalování.",
    priceSub: "Samoobsluha přes Stripe. Bez prodejních hovorů, bez ukázek, bez objednávek.",
    priceSmallName: "Schools",
    priceSmallAmount: "$69",
    priceSmallStudents: "Až 100 žáků",
    priceLargeName: "Schools Large",
    priceLargeAmount: "$149",
    priceLargeStudents: "Až 500 žáků",
    priceIncludesTitle: "Oba tarify obsahují",
    priceIncludes: [
      "Neomezený počet tříd",
      "Plný panel učitele",
      "Seznam výběru jména žáka",
      "Třídní kódy vázané na čas",
      "Žákovské rozhraní ve 14 jazycích",
      "14denní zkušební období",
      "Nácvik výslovnosti: slyšet a vyslovit jakékoli slovo",
    ],
    priceCta: "Začít 14denní zkušební období",
    priceLarger: "Více než 1,000 žáků? Kontaktujte nás ohledně okresního plánu.",
    faqTag: "Časté dotazy",
    faqH2: "Otázky, které ředitelé kladou před zkouškou.",
    faq: [
      {
        q: "Když nejsou přihlášení, jak poznám, který žák co hledal?",
        a: "Učitel předem nahraje seznam jmen do panelu. Když žák navštíví URL třídy, vybere si své jméno jedním kliknutím. Každé vyhledávání je označeno tímto jménem. Bez e-mailu, bez hesla, bez osobních údajů.",
      },
      {
        q: "Je to v souladu s COPPA? Dostanu stížnost od rodičů?",
        a: "Ano. Gadit vůbec neshromažďuje osobní údaje žáků. Bez zakládání účtů, bez sběru e-mailů, bez data narození, bez identifikátorů. Nejsou žádná data, která by se dala zneužít. Architektura s rezervou splňuje COPPA, GDPR-K i izraelský zákon o ochraně dětí.",
      },
      {
        q: "Musí žáci instalovat aplikaci?",
        a: "Ne. Funguje jakýkoli prohlížeč. Žáci navštíví gadit.app/c/CODE na třídním počítači (nebo na jakémkoli zařízení s prohlížečem). Bez obchodu s aplikacemi, bez IT.",
      },
      {
        q: "Vyžaduje to nastavení IT nebo SSO?",
        a: "Ne. Ředitel nebo koordinátor ročníku vytvoří třídu za dvě minuty a sdílí kód s učiteli. IT se nezúčastní žádného kroku.",
      },
      {
        q: "Co panel skutečně ukazuje?",
        a: "Hledání slov každého žáka s časovými razítky, slova, která třída hledala nejčastěji tento týden, a vzory opakovaných hledání signalizující křehké porozumění. Skutečná data o porozumění třídy, ne vágní metriky zapojení.",
      },
      {
        q: "Lze to použít mimo školní hodiny?",
        a: "Třídní kódy jsou vázány na aktivní hodiny školy (výchozí neděle–čtvrtek 7:30–15:00, nastavitelné). Mimo toto okno dává kód pouze základní přístup ke slovníku. To zabraňuje, aby se školní kód stal volnou náhradou tarifu Family 24 hodin denně.",
      },
      {
        q: "Co když má moje škola více než 500 žáků?",
        a: "Vyberte podle počtu žáků: do 100 žáků $97 měsíčně, do 500 žáků $297 měsíčně a do 1,000 žáků $497 měsíčně. Pro více než 1,000 žáků nebo víceokresní sítě nás kontaktujte ohledně plánu na míru.",
      },
      {
        q: "Jak Gadit vysvětluje slovo? Je to jen překlad?",
        a: "Gadit není překladový slovník. Gadit definuje a vysvětluje slova. Pro každé slovo dává všechny významy, tři ukázkové věty na každý význam, etymologii a kontextový režim, ve kterém žák vloží větu a Gadit vybere správný význam. Rozhraní žáka v jeho jazyce, ale hloubka vysvětlení je stejná v každém jazyce.",
      },
    ],
    finalH2: "Zastavte tiché selhání.",
    finalBody: "Dejte svým učitelům nástroj, aby viděli, čemu přesně jejich třída nerozumí. Zkouška začne za 2 minuty. Bez IT, bez schvalování, bez formulářů pro rodiče.",
    finalCta: "Začít 14denní zkušební období",
    finalNote: "Pro zkoušku není potřeba platební karta. Zrušení kdykoli.",
    mockupRoster: "Seznam třídy, 22 žáků",
    mockupSearches: "Nejhledanější tento týden",
    mockupStudent1: "Maja hledala „fotosyntéza\"",
    mockupStudent2: "Jossi hledal „mitochondrie\" ×2",
    mockupStudent3: "Noa hledala „demokracie\"",
    mockupWordExample: "fotosyntéza",
    mockupExampleDef: "Proces, ve kterém zelené rostliny využívají sluneční světlo k přeměně vody a oxidu uhličitého na potravu.",
    mockupExampleEx: "Fotosyntéza probíhá hlavně v listech rostliny.",
  },

  // ─── Slovak ───────────────────────────────────────────────────
  sk: {
    heroH1: "Každý žiak rozumie učivu.",
    heroSub: "Každé ťažké slovo, v ktoromkoľvek zo 20 jazykov, hneď vysvetlené.",
    heroCta: "Začať 14-dňovú skúšobnú dobu",
    heroPriceChip: "Od $97 mesačne",
    heroTrust: "Samoobsluha. Zrušenie kedykoľvek.",
    probTag: "Problém",
    probH2: "Žiak, ktorý nerozumie slovu, nedokáže rozumieť vete.",
    probBody1: "Žiak nevie jedno slovo. Nezdvíha ruku. Myslí si, že tomu zhruba rozumie. Učiteľ pokračuje. Po piatich slovách je odsek rozmazaný. Po piatich odsekoch je lekcia stratená.",
    probBody2: "Väčšina žiakov, ktorí zaostávajú, nie sú menej inteligentní. Majú kopu slov, ktorým nikdy úplne neporozumeli. Každé nové slovo postavené na tejto kope prehlbuje priepasť. Príčina je pre učiteľa neviditeľná.",
    probCallout1Title: "Narastajúca priepasť",
    probCallout1Body: "Nenaučené slová stavajú neviditeľnú stenu pre každú budúcu lekciu.",
    probCallout2Title: "Strata času",
    probCallout2Body: "Učitelia strácajú 5 až 10 minút z každej hodiny vysvetľovaním slov.",
    probCallout3Title: "Tiché odpojenie",
    probCallout3Body: "Žiaci sa odpoja, keď odsek obsahuje priveľa neznámych slov.",
    howTag: "Ako to funguje",
    howH2: "Nastavenie za 2 minúty. Bez IT.",
    howSub: "Rovnaký bezproblémový vzor triedneho kódu, ktorý už funguje pri kvízových hrách, len pre porozumenie slovám.",
    howStep1Title: "Vytvorte kód triedy",
    howStep1Body: "Riaditeľ alebo koordinátor ročníka vytvorí triedu v paneli. Systém vygeneruje kód zo 6 znakov. Vytlačte ho ako nálepku pre triedny počítač.",
    howStep2Title: "Žiaci sa pripoja bez účtov",
    howStep2Body: "Žiaci navštívia gadit.app/c/CODE v akomkoľvek prehliadači, vyberú si svoje meno zo zoznamu (jeden klik) a začnú písať slová. Bez inštalácie aplikácie, bez e-mailu, bez hesla.",
    howStep3Title: "Učitelia vidia, čo trieda hľadala",
    howStep3Body: "Každé vyhľadávanie sa zobrazí v paneli s menom žiaka. Vidíte, čo každý žiak hľadal, kedy, a s ktorými slovami mala problémy celá trieda.",
    teacherTag: "Pohľad učiteľa",
    teacherH2: "Panel, na ktorý ste čakali.",
    teacherSub: "Žiadne vágne metriky zapojenia. Konkrétne slová, konkrétni žiaci, konkrétne okamihy.",
    teacherB1: "História hľadania každého žiaka s časovými značkami",
    teacherB2: "Najhľadanejšie slová triedy tento týždeň",
    teacherB3: "Opakované hľadania signalizujúce krehké porozumenie",
    teacherB4: "Filtrovanie podľa dátumu, žiaka alebo slova",
    privTag: "Súkromie v architektúre",
    privH2: "Plná viditeľnosť pre učiteľov. Nulové riziko údajov pre školu.",
    privSub: "Nezhromažďujeme žiadne osobné údaje žiakov. Nie preto, že ich dobre skrývame, ale preto, že ich vôbec nezhromažďujeme. Architektúra je dodržiavanie predpisov.",
    privPoint1: "Bez žiackych účtov. Bez e-mailov, bez hesiel, bez identifikátorov.",
    privPoint2: "Žiadne osobné informácie neopúšťajú školu. Hľadania sú označené iba menom zo zoznamu.",
    privPoint3: "Triedne kódy fungujú len v školských hodinách. Nastaviteľné pre každú školu.",
    privPoint4: "COPPA, GDPR-K a izraelský zákon o ochrane detí sú pokryté s rezervou.",
    privKahoot: "Pripojenie jednoduché ako pri triednom kvíze. Postavené pre porozumenie slovám a viditeľnosť pre učiteľa.",
    priceTag: "Ceny",
    priceH2: "Jednoducho. Pod prahom schvaľovania.",
    priceSub: "Samoobsluha cez Stripe. Bez predajných hovorov, bez ukážok, bez objednávok.",
    priceSmallName: "Schools",
    priceSmallAmount: "$69",
    priceSmallStudents: "Až 100 žiakov",
    priceLargeName: "Schools Large",
    priceLargeAmount: "$149",
    priceLargeStudents: "Až 500 žiakov",
    priceIncludesTitle: "Oba tarify obsahujú",
    priceIncludes: [
      "Neobmedzený počet tried",
      "Plný panel učiteľa",
      "Zoznam výberu mena žiaka",
      "Triedne kódy viazané na čas",
      "Žiacke rozhranie v 20 jazykoch",
      "14-dňová skúšobná doba",
      "Nácvik výslovnosti: počuť a vysloviť akékoľvek slovo",
    ],
    priceCta: "Začať 14-dňovú skúšobnú dobu",
    priceLarger: "Viac ako 1,000 žiakov? Kontaktujte nás ohľadom okresného plánu.",
    faqTag: "Časté otázky",
    faqH2: "Otázky, ktoré riaditelia kladú pred skúškou.",
    faq: [
      {
        q: "Keď nie sú prihlásenia, ako spoznám, ktorý žiak čo hľadal?",
        a: "Učiteľ vopred nahrá zoznam mien do panela. Keď žiak navštívi URL triedy, vyberie si svoje meno jedným klikom. Každé hľadanie je označené týmto menom. Bez e-mailu, bez hesla, bez osobných údajov.",
      },
      {
        q: "Je to v súlade s COPPA? Dostanem sťažnosť od rodičov?",
        a: "Áno. Gadit vôbec nezhromažďuje osobné údaje žiakov. Bez zakladania účtov, bez zberu e-mailov, bez dátumov narodenia, bez identifikátorov. Nie sú žiadne údaje, ktoré by sa dali zneužiť. Architektúra s rezervou spĺňa COPPA, GDPR-K aj izraelský zákon o ochrane detí.",
      },
      {
        q: "Musia žiaci inštalovať aplikáciu?",
        a: "Nie. Funguje akýkoľvek prehliadač. Žiaci navštívia gadit.app/c/CODE na triednom počítači (alebo na akomkoľvek zariadení s prehliadačom). Bez obchodu s aplikáciami, bez IT.",
      },
      {
        q: "Vyžaduje to nastavenie IT alebo SSO?",
        a: "Nie. Riaditeľ alebo koordinátor ročníka vytvorí triedu za dve minúty a zdieľa kód s učiteľmi. IT sa nezúčastní žiadneho kroku.",
      },
      {
        q: "Čo panel skutočne ukazuje?",
        a: "Hľadania slov každého žiaka s časovými značkami, slová, ktoré trieda hľadala najčastejšie tento týždeň, a vzory opakovaných hľadaní signalizujúce krehké porozumenie. Skutočné údaje o porozumení triedy, nie vágne metriky zapojenia.",
      },
      {
        q: "Dá sa to použiť mimo školských hodín?",
        a: "Triedne kódy sú viazané na aktívne hodiny školy (predvolene nedeľa–štvrtok 7:30–15:00, nastaviteľné). Mimo tohto okna dáva kód iba základný prístup k slovníku. To zabraňuje, aby sa školský kód stal voľnou náhradou tarifu Family 24 hodín denne.",
      },
      {
        q: "Čo ak má moja škola viac ako 500 žiakov?",
        a: "Vyberte podľa počtu žiakov: do 100 žiakov $97 mesačne, do 500 žiakov $297 mesačne a do 1,000 žiakov $497 mesačne. Pre viac ako 1,000 žiakov alebo viacokresné siete nás kontaktujte ohľadom plánu na mieru.",
      },
      {
        q: "Ako Gadit vysvetľuje slovo? Je to len preklad?",
        a: "Gadit nie je prekladový slovník. Gadit definuje a vysvetľuje slová. Pre každé slovo dáva všetky významy, tri ukážkové vety na každý význam, etymológiu a kontextový režim, v ktorom žiak vloží vetu a Gadit vyberie správny význam. Rozhranie žiaka v jeho jazyku, ale hĺbka vysvetlenia je rovnaká v každom jazyku.",
      },
    ],
    finalH2: "Zastavte tiché zlyhanie.",
    finalBody: "Dajte svojim učiteľom nástroj, aby videli, čomu presne ich trieda nerozumie. Skúška sa začne za 2 minúty. Bez IT, bez schvaľovania, bez formulárov pre rodičov.",
    finalCta: "Začať 14-dňovú skúšobnú dobu",
    finalNote: "Pre skúšku nie je potrebná platobná karta. Zrušenie kedykoľvek.",
    mockupRoster: "Zoznam triedy, 22 žiakov",
    mockupSearches: "Najhľadanejšie tento týždeň",
    mockupStudent1: "Maja hľadala „fotosyntéza\"",
    mockupStudent2: "Jossi hľadal „mitochondrie\" ×2",
    mockupStudent3: "Noa hľadala „demokracia\"",
    mockupWordExample: "fotosyntéza",
    mockupExampleDef: "Proces, v ktorom zelené rastliny využívajú slnečné svetlo na premenu vody a oxidu uhličitého na potravu.",
    mockupExampleEx: "Fotosyntéza prebieha hlavne v listoch rastliny.",
  },

  // ─── Hindi ────────────────────────────────────────────────────
  hi: {
    heroH1: "हर छात्र पाठ समझता है।",
    heroSub: "कोई भी कठिन शब्द, 14 में से किसी भी भाषा में, तुरंत समझाया गया।",
    heroCta: "14 दिन का मुफ्त ट्रायल शुरू करें",
    heroPriceChip: "$97 / माह से",
    heroTrust: "स्वयं-सेवा। कभी भी रद्द करें।",
    probTag: "समस्या",
    probH2: "जो छात्र शब्द को नहीं समझता वह वाक्य को नहीं समझ सकता।",
    probBody1: "एक छात्र एक शब्द चूकता है। हाथ नहीं उठाता। सोचता है कि वह लगभग समझता है। शिक्षक आगे बढ़ जाते हैं। पाँच शब्दों के बाद, अनुच्छेद धुंधला हो जाता है। पाँच अनुच्छेदों के बाद, पाठ खो जाता है।",
    probBody2: "अधिकांश छात्र जो पीछे रह जाते हैं वे कम बुद्धिमान नहीं हैं। उनके पास शब्दों का एक ढेर है जिन्हें उन्होंने कभी पूरी तरह नहीं समझा। हर नया शब्द जो उस ढेर पर बनता है, खाई को बढ़ाता है। शिक्षक के लिए कारण अदृश्य है।",
    probCallout1Title: "बढ़ती खाई",
    probCallout1Body: "अनसीखे शब्द हर भविष्य के पाठ के लिए एक अदृश्य दीवार बनाते हैं।",
    probCallout2Title: "समय की हानि",
    probCallout2Body: "शिक्षक हर पाठ में शब्दों को समझाने पर 5 से 10 मिनट खो देते हैं।",
    probCallout3Title: "मूक वियोग",
    probCallout3Body: "जब अनुच्छेद में बहुत सारे अपरिचित शब्द होते हैं तो छात्र ध्यान देना बंद कर देते हैं।",
    howTag: "यह कैसे काम करता है",
    howH2: "2 मिनट में सेटअप। कोई IT नहीं।",
    howSub: "वही बिना-रुकावट का कक्षा-कोड पैटर्न जो पहले से क्विज़ गेम्स में काम करता है, शब्द समझ के लिए बनाया गया।",
    howStep1Title: "कक्षा कोड बनाएँ",
    howStep1Body: "प्रधानाचार्य या कक्षा समन्वयक डैशबोर्ड में एक कक्षा बनाते हैं। सिस्टम 6 अक्षरों का कोड जनरेट करता है। कक्षा के कंप्यूटर के लिए स्टिकर के रूप में प्रिंट करें।",
    howStep2Title: "छात्र बिना खाते के जुड़ते हैं",
    howStep2Body: "छात्र किसी भी ब्राउज़र में gadit.app/c/CODE पर जाते हैं, सूची से अपना नाम चुनते हैं (एक क्लिक), और शब्द टाइप करना शुरू करते हैं। न ऐप इंस्टॉल, न ईमेल, न पासवर्ड।",
    howStep3Title: "शिक्षक देखते हैं कि कक्षा ने क्या खोजा",
    howStep3Body: "हर खोज छात्र के नाम के साथ डैशबोर्ड में आती है। आप देखते हैं कि हर छात्र ने क्या खोजा, कब, और किन शब्दों से पूरी कक्षा ने संघर्ष किया।",
    teacherTag: "शिक्षक का दृश्य",
    teacherH2: "वह डैशबोर्ड जिसका आप इंतज़ार कर रहे थे।",
    teacherSub: "अस्पष्ट जुड़ाव मेट्रिक्स नहीं। विशिष्ट शब्द, विशिष्ट छात्र, विशिष्ट क्षण।",
    teacherB1: "हर छात्र का खोज इतिहास समय-चिह्न के साथ",
    teacherB2: "इस सप्ताह कक्षा द्वारा सबसे ज़्यादा खोजे गए शब्द",
    teacherB3: "बार-बार खोज जो नाज़ुक समझ का संकेत देती है",
    teacherB4: "तिथि, छात्र या शब्द के अनुसार फ़िल्टर",
    privTag: "वास्तुकला में गोपनीयता",
    privH2: "शिक्षकों के लिए पूर्ण दृश्यता। स्कूल के लिए शून्य डेटा जोखिम।",
    privSub: "हम छात्रों का कोई व्यक्तिगत डेटा एकत्र नहीं करते। इसलिए नहीं कि हम इसे अच्छी तरह छिपाते हैं, बल्कि इसलिए कि हम इसे एकत्र ही नहीं करते। वास्तुकला ही अनुपालन है।",
    privPoint1: "कोई छात्र खाते नहीं। न ईमेल, न पासवर्ड, न पहचानकर्ता।",
    privPoint2: "कोई व्यक्तिगत जानकारी स्कूल से बाहर नहीं जाती। खोजें केवल सूची के नाम से चिह्नित होती हैं।",
    privPoint3: "कक्षा कोड केवल स्कूल के समय में काम करते हैं। हर स्कूल के लिए कॉन्फ़िगर करने योग्य।",
    privPoint4: "COPPA, GDPR-K, और इज़राइली छात्र गोपनीयता कानून आराम से पूरे होते हैं।",
    privKahoot: "कक्षा क्विज़ गेम की तरह आसानी से जुड़ते हैं। शब्द समझ और शिक्षक दृश्यता के लिए बनाया गया।",
    priceTag: "कीमत",
    priceH2: "सरल। खरीद-सीमा से नीचे।",
    priceSub: "Stripe के माध्यम से स्वयं-सेवा। बिक्री कॉल नहीं, डेमो नहीं, खरीद आदेश नहीं।",
    priceSmallName: "Schools",
    priceSmallAmount: "$69",
    priceSmallStudents: "100 छात्रों तक",
    priceLargeName: "Schools Large",
    priceLargeAmount: "$149",
    priceLargeStudents: "500 छात्रों तक",
    priceIncludesTitle: "दोनों योजनाओं में शामिल",
    priceIncludes: [
      "असीमित कक्षाएँ",
      "पूर्ण शिक्षक डैशबोर्ड",
      "छात्र नाम चयन सूची",
      "समय-बद्ध कक्षा कोड",
      "30+ भाषाओं में छात्र इंटरफ़ेस",
      "14 दिन का मुफ्त ट्रायल",
      "उच्चारण अभ्यास: कोई भी शब्द सुनें और बोलें",
    ],
    priceCta: "14 दिन का मुफ्त ट्रायल शुरू करें",
    priceLarger: "1,000 से अधिक छात्र? ज़िला योजना के लिए संपर्क करें।",
    faqTag: "अक्सर पूछे जाने वाले प्रश्न",
    faqH2: "प्रधानाचार्य ट्रायल से पहले क्या पूछते हैं।",
    faq: [
      {
        q: "अगर लॉगिन नहीं है, तो मुझे कैसे पता चलेगा कि किस छात्र ने क्या खोजा?",
        a: "शिक्षक डैशबोर्ड में पहले नामों की सूची लोड करते हैं। जब छात्र कक्षा URL पर जाता है, तो वह एक क्लिक से अपना नाम चुनता है। हर खोज उस नाम से चिह्नित होती है। न ईमेल, न पासवर्ड, न कोई व्यक्तिगत डेटा।",
      },
      {
        q: "क्या यह COPPA-सुरक्षित है? क्या मुझे अभिभावक की शिकायत मिलेगी?",
        a: "हाँ। Gadit छात्रों की कोई व्यक्तिगत जानकारी बिल्कुल भी एकत्र नहीं करता। न खाता निर्माण, न ईमेल संग्रह, न जन्मतिथि, न पहचानकर्ता। दुरुपयोग के लिए कोई डेटा नहीं है। वास्तुकला आराम से COPPA, GDPR-K, और इज़राइली छात्र गोपनीयता कानून को पार करती है।",
      },
      {
        q: "क्या छात्रों को ऐप इंस्टॉल करना होगा?",
        a: "नहीं। कोई भी ब्राउज़र काम करता है। छात्र कक्षा के कंप्यूटर पर (या ब्राउज़र वाले किसी भी डिवाइस पर) gadit.app/c/CODE पर जाते हैं। न ऐप स्टोर, न IT की भागीदारी।",
      },
      {
        q: "क्या इसे IT या SSO सेटअप की आवश्यकता है?",
        a: "नहीं। प्रधानाचार्य या कक्षा समन्वयक दो मिनट में कक्षा बनाते हैं और शिक्षकों के साथ कोड साझा करते हैं। IT किसी भी कदम पर शामिल नहीं है।",
      },
      {
        q: "डैशबोर्ड वास्तव में क्या दिखाता है?",
        a: "हर छात्र की शब्द खोजें समय-चिह्नों के साथ, इस सप्ताह कक्षा ने सबसे ज़्यादा कौन से शब्द खोजे, और बार-बार होने वाली खोजों के पैटर्न जो नाज़ुक समझ का संकेत देते हैं। वास्तविक कक्षा समझ डेटा, अस्पष्ट जुड़ाव मेट्रिक्स नहीं।",
      },
      {
        q: "क्या इसका उपयोग स्कूल समय के बाहर किया जा सकता है?",
        a: "कक्षा कोड स्कूल के सक्रिय घंटों से बंधे हैं (डिफ़ॉल्ट रूप से रविवार से गुरुवार 7:30 से 15:00, कॉन्फ़िगर करने योग्य)। इस विंडो के बाहर कोड केवल बेसिक डिक्शनरी एक्सेस देता है। यह स्कूल कोड को Family प्लान के 24/7 मुफ्त विकल्प बनने से रोकता है।",
      },
      {
        q: "अगर मेरे स्कूल में 500 से अधिक छात्र हैं तो क्या?",
        a: "छात्रों की संख्या के अनुसार चुनें: 100 छात्रों तक $97/माह, 500 छात्रों तक $297/माह, और 1,000 छात्रों तक $497/माह। 1,000 से अधिक छात्रों या बहु-साइट ज़िलों के लिए, कस्टम योजना के लिए संपर्क करें।",
      },
      {
        q: "Gadit एक शब्द को कैसे समझाता है? क्या यह सिर्फ अनुवाद है?",
        a: "Gadit अनुवाद शब्दकोश नहीं है। Gadit शब्दों को परिभाषित और समझाता है। हर शब्द के लिए वह सभी अर्थ देता है, हर अर्थ के लिए तीन उदाहरण वाक्य, व्युत्पत्ति, और एक संदर्भ मोड जहाँ छात्र वाक्य चिपकाते हैं और Gadit सही अर्थ चुनता है। छात्र का इंटरफ़ेस उनकी भाषा में है, लेकिन व्याख्या की गहराई हर भाषा में समान है।",
      },
    ],
    finalH2: "मूक विफलता मोड को रोकें।",
    finalBody: "अपने शिक्षकों को वह उपकरण दें जिससे वे ठीक से देख सकें कि उनकी कक्षा क्या नहीं समझती। ट्रायल 2 मिनट में शुरू होता है। न IT, न खरीद, न अभिभावक फॉर्म।",
    finalCta: "14 दिन का मुफ्त ट्रायल शुरू करें",
    finalNote: "ट्रायल के लिए क्रेडिट कार्ड की आवश्यकता नहीं। कभी भी रद्द करें।",
    mockupRoster: "कक्षा सूची, 22 छात्र",
    mockupSearches: "इस सप्ताह सबसे ज़्यादा खोजे गए",
    mockupStudent1: "माया ने 'प्रकाशसंश्लेषण' खोजा",
    mockupStudent2: "योसी ने 'माइटोकॉन्ड्रिया' ×2 खोजा",
    mockupStudent3: "नोआ ने 'लोकतंत्र' खोजा",
    mockupWordExample: "प्रकाशसंश्लेषण",
    mockupExampleDef: "वह प्रक्रिया जिससे हरे पौधे सूरज की रोशनी का उपयोग पानी और कार्बन डाइऑक्साइड को भोजन में बदलने के लिए करते हैं।",
    mockupExampleEx: "प्रकाशसंश्लेषण मुख्य रूप से पौधे की पत्तियों में होता है।",
  },

  // ─── Amharic ──────────────────────────────────────────────────
  am: {
    heroH1: "እያንዳንዱ ተማሪ ትምህርቱን ይረዳል።",
    heroSub: "ማንኛውም አስቸጋሪ ቃል፣ ከ30+ ቋንቋዎች በአንዱ፣ ወዲያውኑ ይብራራል።",
    heroCta: "የ 14 ቀን ነጻ ሙከራ ይጀምሩ",
    heroPriceChip: "ከ $97 / ወር ጀምሮ",
    heroTrust: "በራስ አገልግሎት። በማንኛውም ጊዜ ይሰርዙ።",
    probTag: "ችግሩ",
    probH2: "ቃሉን ያልተረዳ ተማሪ ዓረፍተ ነገሩን ሊረዳ አይችልም።",
    probBody1: "አንድ ተማሪ አንድ ቃል ያመልጠዋል። እጁን አያነሳም። በግምት እንደገባው ያስባል። መምህሩ ይቀጥላል። ከአምስት ቃላት በኋላ አንቀጹ ይደበዝዛል። ከአምስት አንቀጾች በኋላ ትምህርቱ ይጠፋል።",
    probBody2: "ወደኋላ የሚቀሩ አብዛኞቹ ተማሪዎች የማሰብ ችሎታ ያነሳቸው አይደሉም። ሙሉ በሙሉ ያልተረዷቸው ቃላት ክምር አላቸው። በዚያ ክምር ላይ የሚገነባ እያንዳንዱ አዲስ ቃል ክፍተቱን ያሰፋዋል። ለመምህሩ ግን ምክንያቱ አይታይም።",
    probCallout1Title: "እያደገ የሚሄድ ክፍተት",
    probCallout1Body: "ያልተማሩ ቃላት ለእያንዳንዱ የወደፊት ትምህርት የማይታይ ግድግዳ ይገነባሉ።",
    probCallout2Title: "የጠፋ ጊዜ",
    probCallout2Body: "መምህራን በእያንዳንዱ ትምህርት ቃላትን በማብራራት ከ 5 እስከ 10 ደቂቃ ያጣሉ።",
    probCallout3Title: "ጸጥተኛ መነጠል",
    probCallout3Body: "አንቀጹ ብዙ የማይታወቁ ቃላት ሲይዝ ተማሪዎች ትኩረት መስጠት ያቆማሉ።",
    howTag: "እንዴት እንደሚሠራ",
    howH2: "በ 2 ደቂቃ ዝግጅት። IT አያስፈልግም።",
    howSub: "በኩዊዝ ጨዋታዎች ውስጥ አስቀድሞ የሚሠራው ያለ እንቅፋት የክፍል ኮድ ዘዴ፣ ለቃላት መረዳት ተገንብቶ።",
    howStep1Title: "የክፍል ኮድ ይፍጠሩ",
    howStep1Body: "ርዕሰ መምህሩ ወይም የክፍል አስተባባሪው በዳሽቦርዱ ውስጥ ክፍል ይፈጥራሉ። ሲስተሙ ባለ 6 ቁምፊ ኮድ ያመነጫል። ለክፍሉ ኮምፒውተር እንደ ተለጣፊ ያትሙት።",
    howStep2Title: "ተማሪዎች ያለ መለያ ይቀላቀላሉ",
    howStep2Body: "ተማሪዎች በማንኛውም አሳሽ ወደ gadit.app/c/CODE ይሄዳሉ፣ ከዝርዝሩ ስማቸውን ይመርጣሉ (አንድ ጠቅታ)፣ እና ቃላት መተየብ ይጀምራሉ። መተግበሪያ መጫን የለም፣ ኢሜይል የለም፣ የይለፍ ቃል የለም።",
    howStep3Title: "መምህራን ክፍሉ ምን እንደፈለገ ያያሉ",
    howStep3Body: "እያንዳንዱ ፍለጋ ከተማሪው ስም ጋር ወደ ዳሽቦርዱ ይገባል። እያንዳንዱ ተማሪ ምን እንደፈለገ፣ መቼ እንደፈለገ፣ እና ክፍሉ በሙሉ በየትኞቹ ቃላት እንደተቸገረ ያያሉ።",
    teacherTag: "የመምህሩ እይታ",
    teacherH2: "ሲጠብቁት የነበረው ዳሽቦርድ።",
    teacherSub: "ግልጽ ያልሆኑ የተሳትፎ መለኪያዎች አይደሉም። የተወሰኑ ቃላት፣ የተወሰኑ ተማሪዎች፣ የተወሰኑ ቅጽበቶች።",
    teacherB1: "የእያንዳንዱ ተማሪ የፍለጋ ታሪክ ከጊዜ ማህተም ጋር",
    teacherB2: "በዚህ ሳምንት ክፍሉ በብዛት የፈለጋቸው ቃላት",
    teacherB3: "ደካማ መረዳትን የሚጠቁሙ ተደጋጋሚ ፍለጋዎች",
    teacherB4: "በቀን፣ በተማሪ ወይም በቃል ማጣራት",
    privTag: "ግላዊነት በአወቃቀሩ ውስጥ",
    privH2: "ለመምህራን ሙሉ ታይነት። ለትምህርት ቤቱ ዜሮ የውሂብ ስጋት።",
    privSub: "ስለ ተማሪዎች ምንም የግል ውሂብ አንሰበስብም። በደንብ ስለምንደብቀው አይደለም፣ ጭራሽ ስለማንሰበስበው ነው። አወቃቀሩ ራሱ ተገዢነት ነው።",
    privPoint1: "የተማሪ መለያዎች የሉም። ኢሜይል የለም፣ የይለፍ ቃል የለም፣ መለያ ምልክት የለም።",
    privPoint2: "ምንም የግል መረጃ ከትምህርት ቤቱ አይወጣም። ፍለጋዎች በዝርዝሩ ስም ብቻ ይመዘገባሉ።",
    privPoint3: "የክፍል ኮዶች የሚሠሩት በትምህርት ሰዓት ብቻ ነው። ለእያንዳንዱ ትምህርት ቤት ማስተካከል ይቻላል።",
    privPoint4: "COPPA፣ GDPR-K እና የእስራኤል የተማሪ ግላዊነት ሕግ በሰፊ ልዩነት ይሟላሉ።",
    privKahoot: "እንደ ክፍል የኩዊዝ ጨዋታ በቀላሉ ይቀላቀላሉ። ለቃላት መረዳት እና ለመምህር ታይነት ተገንብቶ።",
    priceTag: "ዋጋ",
    priceH2: "ቀላል። ከግዢ ፈቃድ ገደብ በታች።",
    priceSub: "በ Stripe በኩል በራስ አገልግሎት። የሽያጭ ጥሪ የለም፣ ዴሞ የለም፣ የግዢ ትእዛዝ የለም።",
    priceSmallName: "Schools",
    priceSmallAmount: "$69",
    priceSmallStudents: "እስከ 100 ተማሪዎች",
    priceLargeName: "Schools Large",
    priceLargeAmount: "$149",
    priceLargeStudents: "እስከ 500 ተማሪዎች",
    priceIncludesTitle: "በሁለቱም ዕቅዶች የተካተተ",
    priceIncludes: [
      "ያልተገደቡ ክፍሎች",
      "ሙሉ የመምህር ዳሽቦርድ",
      "የተማሪ ስም መምረጫ ዝርዝር",
      "በሰዓት የተገደቡ የክፍል ኮዶች",
      "የተማሪ ገጽታ በ 30+ ቋንቋዎች",
      "የ 14 ቀን ነጻ ሙከራ",
      "የአነጋገር ልምምድ፦ ማንኛውንም ቃል ስማና ተናገር",
    ],
    priceCta: "የ 14 ቀን ነጻ ሙከራ ይጀምሩ",
    priceLarger: "ከ 1,000 በላይ ተማሪዎች? ለዲስትሪክት ዕቅድ ያግኙን።",
    faqTag: "ተደጋጋሚ ጥያቄዎች",
    faqH2: "ርዕሰ መምህራን ከሙከራው በፊት የሚጠይቁት።",
    faq: [
      {
        q: "መግቢያ ከሌለ የትኛው ተማሪ ምን እንደፈለገ እንዴት አውቃለሁ?",
        a: "መምህራን በዳሽቦርዱ ውስጥ የመጀመሪያ ስሞችን ዝርዝር ይጭናሉ። ተማሪው ወደ ክፍሉ URL ሲገባ በአንድ ጠቅታ ስሙን ይመርጣል። እያንዳንዱ ፍለጋ በዚያ ስም ይመዘገባል። ኢሜይል የለም፣ የይለፍ ቃል የለም፣ ምንም የግል ውሂብ የለም።",
      },
      {
        q: "ይህ ከ COPPA አንጻር ደህንነቱ የተጠበቀ ነው? ከወላጆች ቅሬታ ይደርሰኛል?",
        a: "አዎ። Gadit ስለ ተማሪዎች ምንም ዓይነት የግል መረጃ ጭራሽ አይሰበስብም። መለያ መፍጠር የለም፣ ኢሜይል መሰብሰብ የለም፣ የልደት ቀን የለም፣ መለያ ምልክት የለም። ለአላግባብ አጠቃቀም የሚሆን ውሂብ የለም። አወቃቀሩ COPPA፣ GDPR-K እና የእስራኤልን የተማሪ ግላዊነት ሕግ በሰፊ ልዩነት ያልፋል።",
      },
      {
        q: "ተማሪዎች መተግበሪያ መጫን አለባቸው?",
        a: "አይ። ማንኛውም አሳሽ ይሠራል። ተማሪዎች በክፍሉ ኮምፒውተር ላይ (ወይም አሳሽ ባለው ማንኛውም መሣሪያ) ወደ gadit.app/c/CODE ይሄዳሉ። የመተግበሪያ መደብር የለም፣ የ IT ተሳትፎ የለም።",
      },
      {
        q: "IT ወይም የ SSO ዝግጅት ያስፈልገዋል?",
        a: "አይ። ርዕሰ መምህሩ ወይም የክፍል አስተባባሪው በሁለት ደቂቃ ውስጥ ክፍሎችን ፈጥረው ኮዶቹን ለመምህራን ያካፍላሉ። IT በየትኛውም ደረጃ አይሳተፍም።",
      },
      {
        q: "ዳሽቦርዱ በትክክል ምን ያሳያል?",
        a: "የእያንዳንዱ ተማሪ የቃላት ፍለጋዎች ከጊዜ ማህተም ጋር፣ በዚህ ሳምንት ክፍሉ በብዛት የፈለጋቸው ቃላት፣ እና ደካማ መረዳትን የሚጠቁሙ የተደጋጋሚ ፍለጋ ቅጦች። እውነተኛ የክፍል የመረዳት ውሂብ፣ ግልጽ ያልሆኑ የተሳትፎ መለኪያዎች አይደሉም።",
      },
      {
        q: "ከትምህርት ሰዓት ውጭ መጠቀም ይቻላል?",
        a: "የክፍል ኮዶች ከትምህርት ቤቱ ንቁ ሰዓታት ጋር የተያያዙ ናቸው (በነባሪ ከእሁድ እስከ ሐሙስ ከ 7:30 እስከ 15:00፣ ማስተካከል ይቻላል)። ከዚህ ጊዜ ውጭ ኮዱ መሠረታዊ የመዝገበ ቃላት መዳረሻ ብቻ ይሰጣል። ይህ የትምህርት ቤቱ ኮድ ለ Family ዕቅድ የ 24/7 ነጻ አማራጭ እንዳይሆን ይከላከላል።",
      },
      {
        q: "ትምህርት ቤቴ ከ 500 በላይ ተማሪዎች ካሉትስ?",
        a: "እንደ ተማሪ ብዛት ይምረጡ፦ እስከ 100 ተማሪዎች በወር $97፣ እስከ 500 ተማሪዎች በወር $297፣ እና እስከ 1,000 ተማሪዎች በወር $497። ከ 1,000 በላይ ተማሪዎች ወይም ባለብዙ ቅርንጫፍ ዲስትሪክቶች ከሆነ ለብጁ ዕቅድ ያግኙን።",
      },
      {
        q: "Gadit ቃልን እንዴት ያብራራል? ትርጉም ብቻ ነው?",
        a: "Gadit የትርጉም መዝገበ ቃላት አይደለም። Gadit ለቃላት ትርጓሜ ይሰጣል እና ያብራራል። ለእያንዳንዱ ቃል ሁሉንም ትርጉሞች፣ ለእያንዳንዱ ትርጉም ሦስት የምሳሌ ዓረፍተ ነገሮች፣ ሥርወ ቃል፣ እና ተማሪው ዓረፍተ ነገር ለጥፎ Gadit ትክክለኛውን ትርጉም የሚመርጥበት የአውድ ሁነታ ይሰጣል። የተማሪው ገጽታ በራሱ ቋንቋ ነው፣ የማብራሪያው ጥልቀት ግን በሁሉም ቋንቋ አንድ ነው።",
      },
    ],
    finalH2: "ጸጥተኛውን የውድቀት ሁኔታ ያስቁሙ።",
    finalBody: "መምህራንዎ ክፍላቸው ያልገባውን በትክክል የሚያዩበትን መሣሪያ ይስጧቸው። ሙከራው በ 2 ደቂቃ ይጀምራል። IT የለም፣ ግዢ የለም፣ የወላጅ ቅጽ የለም።",
    finalCta: "የ 14 ቀን ነጻ ሙከራ ይጀምሩ",
    finalNote: "ለሙከራው ክሬዲት ካርድ አያስፈልግም። በማንኛውም ጊዜ ይሰርዙ።",
    mockupRoster: "የክፍል ዝርዝር፣ 22 ተማሪዎች",
    mockupSearches: "በዚህ ሳምንት በብዛት የተፈለጉ",
    mockupStudent1: "ማያ 'ፎቶሲንተሲስ' ፈለገች",
    mockupStudent2: "ዮሲ 'ማይቶኮንድሪያ' ×2 ፈለገ",
    mockupStudent3: "ኖአ 'ዲሞክራሲ' ፈለገች",
    mockupWordExample: "ፎቶሲንተሲስ",
    mockupExampleDef: "አረንጓዴ ተክሎች የፀሐይ ብርሃንን ተጠቅመው ውሃን እና ካርቦን ዳይኦክሳይድን ወደ ምግብ የሚቀይሩበት ሂደት።",
    mockupExampleEx: "ፎቶሲንተሲስ በዋናነት በተክሉ ቅጠሎች ውስጥ ይከናወናል።",
  },

  // ─── Spanish ──────────────────────────────────────────────────
  es: {
    heroH1: "Cada estudiante entiende la lección.",
    heroSub: "Cualquier palabra difícil, en cualquiera de 30+ idiomas, explicada al instante.",
    heroCta: "Comenzar prueba gratuita de 14 días",
    heroPriceChip: "Desde $97 al mes",
    heroTrust: "Autoservicio. Cancele cuando quiera.",
    probTag: "El problema",
    probH2: "Un estudiante que no entiende una palabra no puede entender la oración.",
    probBody1: "Un estudiante se pierde una palabra. No levanta la mano. Cree que entiende más o menos. La maestra sigue adelante. Cinco palabras después, el párrafo se vuelve borroso. Cinco párrafos después, la lección está perdida.",
    probBody2: "La mayoría de los estudiantes que se quedan atrás no son menos inteligentes. Tienen una pila de palabras que nunca entendieron del todo. Cada palabra nueva construida sobre esa pila aumenta la brecha. La causa es invisible para el docente.",
    probCallout1Title: "La brecha que crece",
    probCallout1Body: "Las palabras no aprendidas construyen un muro invisible para cada lección futura.",
    probCallout2Title: "El tiempo perdido",
    probCallout2Body: "Los docentes pierden de 5 a 10 minutos por lección explicando palabras.",
    probCallout3Title: "La desconexión silenciosa",
    probCallout3Body: "Los estudiantes se desconectan cuando un párrafo tiene demasiadas palabras desconocidas.",
    howTag: "Cómo funciona",
    howH2: "Configuración en 2 minutos. Sin IT.",
    howSub: "El mismo patrón de código de aula sin fricciones que ya funciona en juegos de preguntas, construido para la comprensión de palabras.",
    howStep1Title: "Cree un código de aula",
    howStep1Body: "El director o coordinador de grado crea un aula en el panel. El sistema genera un código de 6 caracteres. Imprímalo como adhesivo para la computadora del aula.",
    howStep2Title: "Los estudiantes se unen sin cuentas",
    howStep2Body: "Los estudiantes visitan gadit.app/c/CODE en cualquier navegador, eligen su nombre de la lista (un clic) y empiezan a buscar palabras. Sin instalar aplicación, sin email, sin contraseña.",
    howStep3Title: "Los docentes ven qué buscó el aula",
    howStep3Body: "Cada búsqueda llega al panel con el nombre del estudiante. Usted ve qué buscó cada estudiante, cuándo, y con qué palabras luchó toda el aula.",
    teacherTag: "La vista del docente",
    teacherH2: "El panel que estaba esperando.",
    teacherSub: "No son métricas vagas de participación. Palabras específicas, estudiantes específicos, momentos específicos.",
    teacherB1: "Historial de búsqueda por estudiante con marcas de tiempo",
    teacherB2: "Palabras más buscadas por el aula esta semana",
    teacherB3: "Búsquedas repetidas que indican comprensión frágil",
    teacherB4: "Filtrar por fecha, estudiante o palabra",
    privTag: "Privacidad en la arquitectura",
    privH2: "Visibilidad total para los docentes. Cero riesgo de datos para la escuela.",
    privSub: "No recopilamos ningún dato personal de los estudiantes. No porque los escondamos bien, sino porque no los recopilamos en absoluto. La arquitectura es el cumplimiento.",
    privPoint1: "Sin cuentas de estudiantes. Sin emails, sin contraseñas, sin identificadores.",
    privPoint2: "Ninguna información personal sale de la escuela. Las búsquedas se etiquetan solo con el nombre de la lista.",
    privPoint3: "Los códigos de aula funcionan solo en horario escolar. Configurable por escuela.",
    privPoint4: "COPPA, GDPR-K y la ley israelí de privacidad estudiantil se cumplen con holgura.",
    privKahoot: "Conexión tan simple como un juego de preguntas del aula. Construido para la comprensión de palabras y la visibilidad del docente.",
    priceTag: "Precios",
    priceH2: "Simple. Por debajo del umbral de compras.",
    priceSub: "Autoservicio a través de Stripe. Sin llamadas de ventas, sin demostraciones, sin órdenes de compra.",
    priceSmallName: "Schools",
    priceSmallAmount: "$69",
    priceSmallStudents: "Hasta 100 estudiantes",
    priceLargeName: "Schools Large",
    priceLargeAmount: "$149",
    priceLargeStudents: "Hasta 500 estudiantes",
    priceIncludesTitle: "Ambos planes incluyen",
    priceIncludes: [
      "Aulas ilimitadas",
      "Panel docente completo",
      "Lista de selección de nombre del estudiante",
      "Códigos de aula con horario",
      "Interfaz del estudiante en 30+ idiomas",
      "Prueba gratuita de 14 días",
      "Práctica de pronunciación: escucha y di cualquier palabra",
    ],
    priceCta: "Comenzar prueba gratuita de 14 días",
    priceLarger: "¿Más de 1,000 estudiantes? Contáctenos para un plan de distrito.",
    faqTag: "Preguntas frecuentes",
    faqH2: "Lo que los directores preguntan antes de la prueba.",
    faq: [
      {
        q: "Si no hay logins, ¿cómo sé qué estudiante buscó qué?",
        a: "El docente carga una lista de nombres en el panel. Cuando un estudiante visita la URL del aula, elige su nombre con un clic. Cada búsqueda se etiqueta con ese nombre. Sin email, sin contraseña, sin datos personales.",
      },
      {
        q: "¿Es seguro según COPPA? ¿Recibiré una queja de los padres?",
        a: "Sí. Gadit no recopila ninguna información personal de estudiantes. Sin crear cuentas, sin recopilar emails, sin fechas de nacimiento, sin identificadores. No hay datos que puedan ser mal usados. La arquitectura cumple con holgura COPPA, GDPR-K y la ley israelí de privacidad estudiantil.",
      },
      {
        q: "¿Los estudiantes necesitan instalar una aplicación?",
        a: "No. Cualquier navegador funciona. Los estudiantes visitan gadit.app/c/CODE en la computadora del aula (o cualquier dispositivo con navegador). Sin tienda de aplicaciones, sin IT involucrado.",
      },
      {
        q: "¿Requiere configuración de IT o SSO?",
        a: "No. El director o coordinador de grado crea el aula en dos minutos y comparte el código con los docentes. IT no participa en ningún paso.",
      },
      {
        q: "¿Qué muestra el panel realmente?",
        a: "Búsquedas de palabras por estudiante con marcas de tiempo, las palabras que el aula buscó más esta semana, y patrones de búsquedas repetidas que indican comprensión frágil. Datos reales de comprensión del aula, no métricas vagas de participación.",
      },
      {
        q: "¿Se puede usar fuera del horario escolar?",
        a: "Los códigos de aula están vinculados a las horas activas de la escuela (predeterminado domingo a jueves de 7:30 a 15:00, configurable). Fuera de esa ventana el código da acceso básico al diccionario. Esto evita que el código escolar se convierta en un sustituto gratuito 24/7 del plan Family.",
      },
      {
        q: "¿Qué pasa si mi escuela tiene más de 500 estudiantes?",
        a: "Elija según el número de estudiantes: hasta 100 estudiantes son $97 al mes, hasta 500 son $297 al mes y hasta 1,000 son $497 al mes. Para más de 1,000 estudiantes o redes con varias sedes, contáctenos para un plan personalizado.",
      },
      {
        q: "¿Cómo explica Gadit una palabra? ¿Es solo traducción?",
        a: "Gadit no es un diccionario de traducción. Gadit define y explica palabras. Para cada palabra da todos los significados, tres oraciones de ejemplo por significado, etimología, y un modo de contexto donde el estudiante pega la oración y Gadit elige el significado correcto. La interfaz del estudiante está en su idioma, pero la profundidad de la explicación es la misma en cualquier idioma.",
      },
    ],
    finalH2: "Detenga el modo de fallo silencioso.",
    finalBody: "Dé a sus docentes la herramienta para ver exactamente qué no entiende su aula. La prueba comienza en 2 minutos. Sin IT, sin compras, sin formularios de padres.",
    finalCta: "Comenzar prueba gratuita de 14 días",
    finalNote: "No se requiere tarjeta de crédito para la prueba. Cancele cuando quiera.",
    mockupRoster: "Lista del aula, 22 estudiantes",
    mockupSearches: "Las más buscadas esta semana",
    mockupStudent1: "Maya buscó «fotosíntesis»",
    mockupStudent2: "Yossi buscó «mitocondria» ×2",
    mockupStudent3: "Noa buscó «democracia»",
    mockupWordExample: "fotosíntesis",
    mockupExampleDef: "Proceso por el cual las plantas verdes usan la luz solar para convertir agua y dióxido de carbono en alimento.",
    mockupExampleEx: "La fotosíntesis ocurre principalmente en las hojas de la planta.",
  },

  // ─── Portuguese (Brazilian) ───────────────────────────────────
  pt: {
    heroH1: "Cada aluno entende a aula.",
    heroSub: "Qualquer palavra difícil, em qualquer um dos 30+ idiomas, explicada na hora.",
    heroCta: "Iniciar teste gratuito de 14 dias",
    heroPriceChip: "A partir de $97 por mês",
    heroTrust: "Autoatendimento. Cancele a qualquer momento.",
    probTag: "O problema",
    probH2: "Um aluno que não entende uma palavra não consegue entender a frase.",
    probBody1: "Um aluno perde uma palavra. Não levanta a mão. Pensa que entende mais ou menos. A professora segue em frente. Cinco palavras depois, o parágrafo fica embaçado. Cinco parágrafos depois, a lição está perdida.",
    probBody2: "A maioria dos alunos que ficam para trás não é menos inteligente. Eles têm uma pilha de palavras que nunca entenderam por completo. Cada palavra nova construída sobre essa pilha aumenta a lacuna. A causa é invisível para o professor.",
    probCallout1Title: "A lacuna que cresce",
    probCallout1Body: "Palavras não aprendidas constroem um muro invisível para cada lição futura.",
    probCallout2Title: "O tempo perdido",
    probCallout2Body: "Os professores perdem de 5 a 10 minutos por aula explicando palavras.",
    probCallout3Title: "A desconexão silenciosa",
    probCallout3Body: "Os alunos se desconectam quando um parágrafo tem palavras desconhecidas demais.",
    howTag: "Como funciona",
    howH2: "Configuração em 2 minutos. Sem TI.",
    howSub: "O mesmo padrão sem fricções de código de sala que já funciona em jogos de quiz, construído para a compreensão de palavras.",
    howStep1Title: "Crie um código de sala",
    howStep1Body: "O diretor ou coordenador de série cria uma sala no painel. O sistema gera um código de 6 caracteres. Imprima como adesivo para o computador da sala.",
    howStep2Title: "Alunos entram sem contas",
    howStep2Body: "Os alunos visitam gadit.app/c/CODE em qualquer navegador, escolhem o nome da lista (um clique) e começam a digitar palavras. Sem instalar aplicativo, sem email, sem senha.",
    howStep3Title: "Professores veem o que a turma buscou",
    howStep3Body: "Cada busca chega ao painel com o nome do aluno. Você vê o que cada aluno pesquisou, quando, e com quais palavras a turma toda lutou.",
    teacherTag: "A visão do professor",
    teacherH2: "O painel que você estava esperando.",
    teacherSub: "Não são métricas vagas de engajamento. Palavras específicas, alunos específicos, momentos específicos.",
    teacherB1: "Histórico de busca por aluno com carimbo de hora",
    teacherB2: "Palavras mais buscadas pela turma esta semana",
    teacherB3: "Buscas repetidas que indicam compreensão frágil",
    teacherB4: "Filtre por data, aluno ou palavra",
    privTag: "Privacidade na arquitetura",
    privH2: "Visibilidade total para professores. Zero risco de dados para a escola.",
    privSub: "Não coletamos nenhum dado pessoal de alunos. Não porque os escondemos bem, mas porque não os coletamos. A arquitetura é a conformidade.",
    privPoint1: "Sem contas de aluno. Sem emails, sem senhas, sem identificadores.",
    privPoint2: "Nenhuma informação pessoal sai da escola. As buscas são marcadas apenas pelo nome da lista.",
    privPoint3: "Códigos de sala funcionam só em horário escolar. Configurável por escola.",
    privPoint4: "COPPA, GDPR-K e a lei israelense de privacidade estudantil são cumpridos com folga.",
    privKahoot: "Conexão tão simples quanto um jogo de quiz em sala. Construído para a compreensão de palavras e visibilidade do professor.",
    priceTag: "Preços",
    priceH2: "Simples. Abaixo do limite de compras.",
    priceSub: "Autoatendimento via Stripe. Sem ligações de venda, sem demonstrações, sem ordens de compra.",
    priceSmallName: "Schools",
    priceSmallAmount: "$69",
    priceSmallStudents: "Até 100 alunos",
    priceLargeName: "Schools Large",
    priceLargeAmount: "$149",
    priceLargeStudents: "Até 500 alunos",
    priceIncludesTitle: "Ambos os planos incluem",
    priceIncludes: [
      "Salas ilimitadas",
      "Painel completo do professor",
      "Lista de seleção de nome do aluno",
      "Códigos de sala vinculados ao horário",
      "Interface do aluno em 30+ idiomas",
      "Teste gratuito de 14 dias",
      "Prática de pronúncia: ouça e diga qualquer palavra",
    ],
    priceCta: "Iniciar teste gratuito de 14 dias",
    priceLarger: "Mais de 1,000 alunos? Entre em contato para um plano distrital.",
    faqTag: "Perguntas frequentes",
    faqH2: "O que os diretores perguntam antes do teste.",
    faq: [
      {
        q: "Se não há logins, como sei qual aluno buscou o quê?",
        a: "O professor carrega uma lista de nomes no painel. Quando o aluno visita a URL da sala, escolhe seu nome com um clique. Cada busca é marcada com esse nome. Sem email, sem senha, sem dados pessoais.",
      },
      {
        q: "Isso é seguro segundo COPPA? Vou receber uma reclamação dos pais?",
        a: "Sim. Gadit não coleta nenhuma informação pessoal de alunos. Sem criação de contas, sem coleta de email, sem datas de nascimento, sem identificadores. Não há dados que possam ser mal usados. A arquitetura cumpre com folga COPPA, GDPR-K e a lei israelense de privacidade estudantil.",
      },
      {
        q: "Os alunos precisam instalar um aplicativo?",
        a: "Não. Qualquer navegador funciona. Os alunos visitam gadit.app/c/CODE no computador da sala (ou qualquer dispositivo com navegador). Sem loja de aplicativos, sem envolvimento de TI.",
      },
      {
        q: "Requer configuração de TI ou SSO?",
        a: "Não. O diretor ou coordenador de série cria a sala em dois minutos e compartilha o código com os professores. TI não participa de nenhum passo.",
      },
      {
        q: "O que o painel realmente mostra?",
        a: "Buscas de palavras por aluno com carimbos de hora, as palavras que a turma buscou mais esta semana, e padrões de buscas repetidas que indicam compreensão frágil. Dados reais de compreensão da turma, não métricas vagas de engajamento.",
      },
      {
        q: "Pode ser usado fora do horário escolar?",
        a: "Os códigos de sala estão vinculados às horas ativas da escola (padrão domingo a quinta de 7:30 às 15:00, configurável). Fora dessa janela o código dá acesso básico ao dicionário. Isso evita que o código escolar se torne um substituto gratuito 24/7 do plano Family.",
      },
      {
        q: "E se minha escola tem mais de 500 alunos?",
        a: "Escolha pelo número de alunos: até 100 alunos são $97 por mês, até 500 são $297 por mês e até 1,000 são $497 por mês. Para mais de 1,000 alunos ou redes com várias unidades, entre em contato para um plano personalizado.",
      },
      {
        q: "Como Gadit explica uma palavra? É só tradução?",
        a: "Gadit não é um dicionário de tradução. Gadit define e explica palavras. Para cada palavra dá todos os significados, três frases de exemplo por significado, etimologia, e um modo de contexto onde o aluno cola a frase e Gadit escolhe o significado correto. A interface do aluno está em sua língua, mas a profundidade da explicação é a mesma em qualquer língua.",
      },
    ],
    finalH2: "Pare o modo de falha silenciosa.",
    finalBody: "Dê a seus professores a ferramenta para ver exatamente o que sua turma não entende. O teste começa em 2 minutos. Sem TI, sem compras, sem formulários de pais.",
    finalCta: "Iniciar teste gratuito de 14 dias",
    finalNote: "Não é preciso cartão de crédito para o teste. Cancele a qualquer momento.",
    mockupRoster: "Lista da sala, 22 alunos",
    mockupSearches: "Mais buscadas esta semana",
    mockupStudent1: "Maya buscou «fotossíntese»",
    mockupStudent2: "Yossi buscou «mitocôndria» ×2",
    mockupStudent3: "Noa buscou «democracia»",
    mockupWordExample: "fotossíntese",
    mockupExampleDef: "Processo pelo qual as plantas verdes usam a luz solar para converter água e dióxido de carbono em alimento.",
    mockupExampleEx: "A fotossíntese ocorre principalmente nas folhas da planta.",
  },

  // ─── French ──────────────────────────────────────────────────
  fr: {
    heroH1: "Chaque élève comprend la leçon.",
    heroSub: "Chaque mot difficile, dans l'une des 30+ langues, expliqué aussitôt.",
    heroCta: "Commencer l'essai gratuit de 14 jours",
    heroPriceChip: "À partir de $97 par mois",
    heroTrust: "Libre-service. Annulez à tout moment.",
    probTag: "Le problème",
    probH2: "Un élève qui ne comprend pas un mot ne peut pas comprendre la phrase.",
    probBody1: "Un élève manque un mot. Il ne lève pas la main. Il pense qu'il comprend à peu près. L'enseignant continue. Cinq mots plus tard, le paragraphe devient flou. Cinq paragraphes plus tard, la leçon est perdue.",
    probBody2: "La plupart des élèves qui prennent du retard ne sont pas moins intelligents. Ils ont une pile de mots qu'ils n'ont jamais entièrement compris. Chaque nouveau mot construit sur cette pile creuse l'écart. La cause est invisible pour l'enseignant.",
    probCallout1Title: "L'écart qui grandit",
    probCallout1Body: "Les mots non appris construisent un mur invisible pour chaque leçon future.",
    probCallout2Title: "Le temps perdu",
    probCallout2Body: "Les enseignants perdent 5 à 10 minutes par leçon à expliquer des mots.",
    probCallout3Title: "Le décrochage silencieux",
    probCallout3Body: "Les élèves décrochent quand un paragraphe contient trop de mots inconnus.",
    howTag: "Comment ça marche",
    howH2: "Installation en 2 minutes. Sans informatique.",
    howSub: "Le même modèle de code de classe sans friction qui fonctionne déjà pour les jeux de quiz, conçu pour la compréhension des mots.",
    howStep1Title: "Créez un code de classe",
    howStep1Body: "Le directeur ou le coordinateur de niveau crée une classe dans le tableau de bord. Le système génère un code à 6 caractères. Imprimez-le comme autocollant pour l'ordinateur de la classe.",
    howStep2Title: "Les élèves rejoignent sans compte",
    howStep2Body: "Les élèves visitent gadit.app/c/CODE dans n'importe quel navigateur, choisissent leur nom dans la liste (un clic) et commencent à taper des mots. Sans installation d'application, sans email, sans mot de passe.",
    howStep3Title: "Les enseignants voient ce que la classe a cherché",
    howStep3Body: "Chaque recherche arrive dans le tableau avec le nom de l'élève. Vous voyez ce que chaque élève a cherché, quand, et avec quels mots toute la classe a eu du mal.",
    teacherTag: "La vue de l'enseignant",
    teacherH2: "Le tableau de bord que vous attendiez.",
    teacherSub: "Pas des métriques d'engagement vagues. Des mots précis, des élèves précis, des moments précis.",
    teacherB1: "Historique de recherche par élève avec horodatage",
    teacherB2: "Mots les plus cherchés par la classe cette semaine",
    teacherB3: "Recherches répétées qui signalent une compréhension fragile",
    teacherB4: "Filtrer par date, élève ou mot",
    privTag: "Confidentialité dans l'architecture",
    privH2: "Visibilité totale pour les enseignants. Zéro risque de données pour l'école.",
    privSub: "Nous ne collectons aucune donnée personnelle des élèves. Pas parce que nous les cachons bien, mais parce que nous ne les collectons pas du tout. L'architecture est la conformité.",
    privPoint1: "Pas de comptes d'élèves. Pas d'emails, pas de mots de passe, pas d'identifiants.",
    privPoint2: "Aucune information personnelle ne quitte l'école. Les recherches sont taguées seulement avec le nom de la liste.",
    privPoint3: "Les codes de classe ne fonctionnent que pendant les heures d'école. Configurable par école.",
    privPoint4: "COPPA, GDPR-K et la loi israélienne sur la confidentialité des élèves sont respectés avec marge.",
    privKahoot: "Connexion aussi simple qu'un jeu de quiz en classe. Conçu pour la compréhension des mots et la visibilité de l'enseignant.",
    priceTag: "Tarifs",
    priceH2: "Simple. Sous le seuil d'achat.",
    priceSub: "Libre-service via Stripe. Pas d'appels commerciaux, pas de démos, pas de bons de commande.",
    priceSmallName: "Schools",
    priceSmallAmount: "$69",
    priceSmallStudents: "Jusqu'à 100 élèves",
    priceLargeName: "Schools Large",
    priceLargeAmount: "$149",
    priceLargeStudents: "Jusqu'à 500 élèves",
    priceIncludesTitle: "Les deux forfaits comprennent",
    priceIncludes: [
      "Classes illimitées",
      "Tableau de bord enseignant complet",
      "Liste de sélection du nom de l'élève",
      "Codes de classe liés à l'horaire",
      "Interface élève en 30+ langues",
      "Essai gratuit de 14 jours",
      "Entraînement à la prononciation : entendre et dire n'importe quel mot",
    ],
    priceCta: "Commencer l'essai gratuit de 14 jours",
    priceLarger: "Plus de 1,000 élèves ? Contactez-nous pour un plan de district.",
    faqTag: "Questions fréquentes",
    faqH2: "Ce que les directeurs demandent avant l'essai.",
    faq: [
      {
        q: "S'il n'y a pas de connexion, comment savoir quel élève a cherché quoi ?",
        a: "L'enseignant charge à l'avance une liste de noms dans le tableau. Quand un élève visite l'URL de la classe, il choisit son nom en un clic. Chaque recherche est taguée avec ce nom. Sans email, sans mot de passe, sans données personnelles.",
      },
      {
        q: "Est-ce conforme à COPPA ? Vais-je recevoir une plainte des parents ?",
        a: "Oui. Gadit ne collecte aucune information personnelle des élèves. Pas de création de comptes, pas de collecte d'emails, pas de dates de naissance, pas d'identifiants. Il n'y a aucune donnée pouvant être détournée. L'architecture dépasse confortablement COPPA, GDPR-K et la loi israélienne sur la confidentialité des élèves.",
      },
      {
        q: "Les élèves doivent-ils installer une application ?",
        a: "Non. N'importe quel navigateur fonctionne. Les élèves visitent gadit.app/c/CODE sur l'ordinateur de la classe (ou n'importe quel appareil avec un navigateur). Pas d'app store, pas d'implication informatique.",
      },
      {
        q: "Faut-il une installation informatique ou SSO ?",
        a: "Non. Le directeur ou le coordinateur de niveau crée la classe en deux minutes et partage le code avec les enseignants. L'informatique n'est impliquée à aucune étape.",
      },
      {
        q: "Que montre vraiment le tableau de bord ?",
        a: "Les recherches de mots de chaque élève avec horodatage, les mots que la classe a cherchés le plus cette semaine, et les motifs de recherches répétées qui signalent une compréhension fragile. Données réelles de compréhension de la classe, pas des métriques d'engagement vagues.",
      },
      {
        q: "Peut-on l'utiliser en dehors des heures d'école ?",
        a: "Les codes de classe sont liés aux heures actives de l'école (par défaut dimanche à jeudi 7h30 à 15h, configurable). En dehors de cette fenêtre, le code donne un accès dictionnaire de base. Cela empêche le code école de devenir un substitut gratuit 24h/24 du plan Family.",
      },
      {
        q: "Et si mon école a plus de 500 élèves ?",
        a: "Choisissez selon le nombre d'élèves : jusqu'à 100 élèves c'est $97 par mois, jusqu'à 500 c'est $297 par mois et jusqu'à 1,000 c'est $497 par mois. Pour plus de 1,000 élèves ou réseaux multi-sites, contactez-nous pour un plan personnalisé.",
      },
      {
        q: "Comment Gadit explique-t-il un mot ? Est-ce juste de la traduction ?",
        a: "Gadit n'est pas un dictionnaire de traduction. Gadit définit et explique les mots. Pour chaque mot il donne tous les sens, trois phrases d'exemple par sens, l'étymologie, et un mode contextuel où l'élève colle la phrase et Gadit choisit le bon sens. L'interface élève est dans sa langue, mais la profondeur de l'explication est la même dans toutes les langues.",
      },
    ],
    finalH2: "Arrêtez le mode d'échec silencieux.",
    finalBody: "Donnez à vos enseignants l'outil pour voir exactement ce que leur classe ne comprend pas. L'essai commence en 2 minutes. Sans informatique, sans achats, sans formulaires pour les parents.",
    finalCta: "Commencer l'essai gratuit de 14 jours",
    finalNote: "Pas de carte de crédit requise pour l'essai. Annulez à tout moment.",
    mockupRoster: "Liste de classe, 22 élèves",
    mockupSearches: "Les plus cherchés cette semaine",
    mockupStudent1: "Maya a cherché «photosynthèse»",
    mockupStudent2: "Yossi a cherché «mitochondrie» ×2",
    mockupStudent3: "Noa a cherché «démocratie»",
    mockupWordExample: "photosynthèse",
    mockupExampleDef: "Processus par lequel les plantes vertes utilisent la lumière du soleil pour convertir l'eau et le dioxyde de carbone en nourriture.",
    mockupExampleEx: "La photosynthèse se produit principalement dans les feuilles de la plante.",
  },

  // ─── German ──────────────────────────────────────────────────
  de: {
    heroH1: "Jeder Schüler versteht den Unterricht.",
    heroSub: "Jedes schwierige Wort, in einer von 30+ Sprachen, sofort erklärt.",
    heroCta: "14 Tage kostenlos testen",
    heroPriceChip: "Ab $97 pro Monat",
    heroTrust: "Selbstbedienung. Jederzeit kündbar.",
    probTag: "Das Problem",
    probH2: "Ein Schüler, der ein Wort nicht versteht, kann den Satz nicht verstehen.",
    probBody1: "Ein Schüler verpasst ein Wort. Er hebt nicht die Hand. Er denkt, er versteht es ungefähr. Der Lehrer geht weiter. Fünf Wörter später wird der Absatz unscharf. Fünf Absätze später ist die Stunde verloren.",
    probBody2: "Die meisten Schüler, die zurückbleiben, sind nicht weniger intelligent. Sie haben einen Stapel von Wörtern, die sie nie ganz verstanden haben. Jedes neue Wort, das auf diesem Stapel aufbaut, vergrößert die Lücke. Die Ursache ist für den Lehrer unsichtbar.",
    probCallout1Title: "Die wachsende Lücke",
    probCallout1Body: "Nicht gelernte Wörter bauen eine unsichtbare Mauer für jede zukünftige Stunde.",
    probCallout2Title: "Verlorene Zeit",
    probCallout2Body: "Lehrer verlieren 5 bis 10 Minuten pro Stunde mit Worterklärungen.",
    probCallout3Title: "Stiller Ausstieg",
    probCallout3Body: "Schüler steigen aus, wenn ein Absatz zu viele unbekannte Wörter enthält.",
    howTag: "So funktioniert es",
    howH2: "Einrichtung in 2 Minuten. Ohne IT.",
    howSub: "Das gleiche reibungslose Klassencode-Muster, das schon bei Quizspielen funktioniert, gebaut für Wortverständnis.",
    howStep1Title: "Erstellen Sie einen Klassencode",
    howStep1Body: "Der Direktor oder Stufenkoordinator erstellt eine Klasse im Dashboard. Das System erzeugt einen Code mit 6 Zeichen. Drucken Sie ihn als Aufkleber für den Klassencomputer.",
    howStep2Title: "Schüler treten ohne Konten bei",
    howStep2Body: "Schüler besuchen gadit.app/c/CODE in jedem Browser, wählen ihren Namen aus der Liste (ein Klick) und beginnen, Wörter einzugeben. Keine App-Installation, keine E-Mail, kein Passwort.",
    howStep3Title: "Lehrer sehen, was die Klasse gesucht hat",
    howStep3Body: "Jede Suche landet im Dashboard mit dem Schülernamen. Sie sehen, was jeder Schüler gesucht hat, wann, und mit welchen Wörtern die ganze Klasse Schwierigkeiten hatte.",
    teacherTag: "Die Lehreransicht",
    teacherH2: "Das Dashboard, auf das Sie gewartet haben.",
    teacherSub: "Keine vagen Engagement-Metriken. Konkrete Wörter, konkrete Schüler, konkrete Momente.",
    teacherB1: "Suchverlauf pro Schüler mit Zeitstempeln",
    teacherB2: "Meistgesuchte Wörter der Klasse diese Woche",
    teacherB3: "Wiederholte Suchen, die brüchiges Verständnis signalisieren",
    teacherB4: "Filtern nach Datum, Schüler oder Wort",
    privTag: "Datenschutz in der Architektur",
    privH2: "Volle Sichtbarkeit für Lehrer. Null Datenrisiko für die Schule.",
    privSub: "Wir sammeln keine personenbezogenen Schülerdaten. Nicht weil wir sie gut verstecken, sondern weil wir sie gar nicht sammeln. Die Architektur ist die Compliance.",
    privPoint1: "Keine Schülerkonten. Keine E-Mails, keine Passwörter, keine Kennungen.",
    privPoint2: "Keine persönlichen Informationen verlassen die Schule. Suchen sind nur mit dem Namen aus der Liste markiert.",
    privPoint3: "Klassencodes funktionieren nur während der Schulzeiten. Pro Schule konfigurierbar.",
    privPoint4: "COPPA, GDPR-K und das israelische Schülerdatenschutzgesetz werden mit Reserve erfüllt.",
    privKahoot: "Beitritt so einfach wie bei einem Klassenquiz. Gebaut für Wortverständnis und Lehrersichtbarkeit.",
    priceTag: "Preise",
    priceH2: "Einfach. Unter der Beschaffungsschwelle.",
    priceSub: "Selbstbedienung über Stripe. Keine Vertriebsanrufe, keine Demos, keine Bestellaufträge.",
    priceSmallName: "Schools",
    priceSmallAmount: "$69",
    priceSmallStudents: "Bis zu 100 Schüler",
    priceLargeName: "Schools Large",
    priceLargeAmount: "$149",
    priceLargeStudents: "Bis zu 500 Schüler",
    priceIncludesTitle: "Beide Tarife enthalten",
    priceIncludes: [
      "Unbegrenzte Klassen",
      "Vollständiges Lehrer-Dashboard",
      "Schüler-Namensauswahlliste",
      "Zeitgebundene Klassencodes",
      "Schüler-Oberfläche in 30+ Sprachen",
      "14 Tage kostenlose Testphase",
      "Ausspracheübung: jedes Wort hören und aussprechen",
    ],
    priceCta: "14 Tage kostenlos testen",
    priceLarger: "Mehr als 1,000 Schüler? Kontaktieren Sie uns für einen Bezirksplan.",
    faqTag: "Häufige Fragen",
    faqH2: "Was Direktoren vor der Testphase fragen.",
    faq: [
      {
        q: "Wenn es keine Logins gibt, wie weiß ich, welcher Schüler was gesucht hat?",
        a: "Der Lehrer lädt vorab eine Namensliste ins Dashboard. Wenn ein Schüler die Klassen-URL besucht, wählt er seinen Namen mit einem Klick. Jede Suche ist mit diesem Namen markiert. Ohne E-Mail, ohne Passwort, ohne persönliche Daten.",
      },
      {
        q: "Ist das COPPA-konform? Bekomme ich eine Elternbeschwerde?",
        a: "Ja. Gadit sammelt überhaupt keine persönlichen Schülerdaten. Keine Kontoerstellung, keine E-Mail-Sammlung, keine Geburtsdaten, keine Kennungen. Es gibt keine Daten, die missbraucht werden könnten. Die Architektur übertrifft COPPA, GDPR-K und das israelische Schülerdatenschutzgesetz mit Reserve.",
      },
      {
        q: "Müssen Schüler eine App installieren?",
        a: "Nein. Jeder Browser funktioniert. Schüler besuchen gadit.app/c/CODE auf dem Klassencomputer (oder jedem Gerät mit Browser). Kein App Store, keine IT-Beteiligung.",
      },
      {
        q: "Erfordert es IT-Einrichtung oder SSO?",
        a: "Nein. Der Direktor oder Stufenkoordinator erstellt die Klasse in zwei Minuten und teilt den Code mit den Lehrern. IT ist in keinem Schritt beteiligt.",
      },
      {
        q: "Was zeigt das Dashboard wirklich?",
        a: "Wortsuchen jedes Schülers mit Zeitstempeln, die Wörter, die die Klasse diese Woche am häufigsten gesucht hat, und Muster wiederholter Suchen, die brüchiges Verständnis signalisieren. Echte Klassenverständnisdaten, keine vagen Engagement-Metriken.",
      },
      {
        q: "Kann es außerhalb der Schulzeiten genutzt werden?",
        a: "Klassencodes sind an die aktiven Schulzeiten gebunden (standardmäßig Sonntag bis Donnerstag 7:30 bis 15:00, konfigurierbar). Außerhalb dieses Fensters bietet der Code nur Basis-Wörterbuchzugriff. Das verhindert, dass der Schulcode zu einem kostenlosen 24/7-Ersatz für den Family-Tarif wird.",
      },
      {
        q: "Was, wenn meine Schule mehr als 500 Schüler hat?",
        a: "Wählen Sie nach Schülerzahl: bis 100 Schüler $97 pro Monat, bis 500 Schüler $297 pro Monat und bis 1,000 Schüler $497 pro Monat. Für mehr als 1,000 Schüler oder Mehrstandortnetzwerke kontaktieren Sie uns für einen maßgeschneiderten Plan.",
      },
      {
        q: "Wie erklärt Gadit ein Wort? Ist das nur Übersetzung?",
        a: "Gadit ist kein Übersetzungswörterbuch. Gadit definiert und erklärt Wörter. Für jedes Wort gibt es alle Bedeutungen, drei Beispielsätze pro Bedeutung, Etymologie und einen Kontextmodus, in dem der Schüler den Satz einfügt und Gadit die richtige Bedeutung wählt. Die Schüleroberfläche ist in seiner Sprache, aber die Erklärungstiefe ist in jeder Sprache gleich.",
      },
    ],
    finalH2: "Stoppen Sie den stillen Ausfall.",
    finalBody: "Geben Sie Ihren Lehrern das Werkzeug, um genau zu sehen, was ihre Klasse nicht versteht. Die Testphase startet in 2 Minuten. Ohne IT, ohne Beschaffung, ohne Elternformulare.",
    finalCta: "14 Tage kostenlos testen",
    finalNote: "Für die Testphase ist keine Kreditkarte erforderlich. Jederzeit kündbar.",
    mockupRoster: "Klassenliste, 22 Schüler",
    mockupSearches: "Meistgesucht diese Woche",
    mockupStudent1: "Maja hat „Photosynthese\" gesucht",
    mockupStudent2: "Jossi hat „Mitochondrium\" ×2 gesucht",
    mockupStudent3: "Noa hat „Demokratie\" gesucht",
    mockupWordExample: "Photosynthese",
    mockupExampleDef: "Der Prozess, bei dem grüne Pflanzen Sonnenlicht nutzen, um Wasser und Kohlendioxid in Nahrung umzuwandeln.",
    mockupExampleEx: "Photosynthese findet hauptsächlich in den Blättern der Pflanze statt.",
  },

  // ─── Italian ──────────────────────────────────────────────────
  it: {
    heroH1: "Ogni studente capisce la lezione.",
    heroSub: "Ogni parola difficile, in una delle 30+ lingue, spiegata all'istante.",
    heroCta: "Inizia la prova gratuita di 14 giorni",
    heroPriceChip: "Da $97 al mese",
    heroTrust: "Self-service. Annulla quando vuoi.",
    probTag: "Il problema",
    probH2: "Uno studente che non capisce una parola non può capire la frase.",
    probBody1: "Uno studente perde una parola. Non alza la mano. Pensa di capire più o meno. L'insegnante va avanti. Cinque parole dopo, il paragrafo diventa sfocato. Cinque paragrafi dopo, la lezione è persa.",
    probBody2: "La maggior parte degli studenti che restano indietro non è meno intelligente. Hanno una pila di parole che non hanno mai capito del tutto. Ogni parola nuova costruita su quella pila aumenta il divario. La causa è invisibile all'insegnante.",
    probCallout1Title: "Il divario che cresce",
    probCallout1Body: "Le parole non imparate costruiscono un muro invisibile per ogni lezione futura.",
    probCallout2Title: "Il tempo perso",
    probCallout2Body: "Gli insegnanti perdono dai 5 ai 10 minuti per lezione a spiegare parole.",
    probCallout3Title: "Il distacco silenzioso",
    probCallout3Body: "Gli studenti si disconnettono quando un paragrafo contiene troppe parole sconosciute.",
    howTag: "Come funziona",
    howH2: "Configurazione in 2 minuti. Senza IT.",
    howSub: "Lo stesso modello di codice classe senza attriti che già funziona nei giochi di quiz, costruito per la comprensione delle parole.",
    howStep1Title: "Crea un codice classe",
    howStep1Body: "Il direttore o il coordinatore di anno crea una classe nella dashboard. Il sistema genera un codice di 6 caratteri. Stampalo come adesivo per il computer della classe.",
    howStep2Title: "Gli studenti entrano senza account",
    howStep2Body: "Gli studenti visitano gadit.app/c/CODE in qualsiasi browser, scelgono il loro nome dall'elenco (un clic) e iniziano a digitare parole. Nessuna installazione di app, nessuna email, nessuna password.",
    howStep3Title: "Gli insegnanti vedono cosa ha cercato la classe",
    howStep3Body: "Ogni ricerca arriva nella dashboard con il nome dello studente. Vedi cosa ha cercato ogni studente, quando, e con quali parole tutta la classe ha avuto difficoltà.",
    teacherTag: "La vista dell'insegnante",
    teacherH2: "La dashboard che stavi aspettando.",
    teacherSub: "Non metriche vaghe di coinvolgimento. Parole specifiche, studenti specifici, momenti specifici.",
    teacherB1: "Cronologia di ricerca per studente con timestamp",
    teacherB2: "Parole più cercate dalla classe questa settimana",
    teacherB3: "Ricerche ripetute che segnalano comprensione fragile",
    teacherB4: "Filtra per data, studente o parola",
    privTag: "Privacy nell'architettura",
    privH2: "Visibilità totale per gli insegnanti. Zero rischio dati per la scuola.",
    privSub: "Non raccogliamo nessun dato personale degli studenti. Non perché li nascondiamo bene, ma perché non li raccogliamo affatto. L'architettura è la conformità.",
    privPoint1: "Nessun account studente. Niente email, niente password, niente identificatori.",
    privPoint2: "Nessuna informazione personale lascia la scuola. Le ricerche sono etichettate solo con il nome dall'elenco.",
    privPoint3: "I codici classe funzionano solo durante l'orario scolastico. Configurabile per ogni scuola.",
    privPoint4: "COPPA, GDPR-K e la legge israeliana sulla privacy degli studenti sono soddisfatti con margine.",
    privKahoot: "Accesso semplice come un quiz in classe. Costruito per la comprensione delle parole e la visibilità dell'insegnante.",
    priceTag: "Prezzi",
    priceH2: "Semplice. Sotto la soglia di acquisto.",
    priceSub: "Self-service tramite Stripe. Nessuna chiamata di vendita, nessuna demo, nessun ordine d'acquisto.",
    priceSmallName: "Schools",
    priceSmallAmount: "$69",
    priceSmallStudents: "Fino a 100 studenti",
    priceLargeName: "Schools Large",
    priceLargeAmount: "$149",
    priceLargeStudents: "Fino a 500 studenti",
    priceIncludesTitle: "Entrambi i piani includono",
    priceIncludes: [
      "Classi illimitate",
      "Dashboard insegnante completa",
      "Elenco di selezione del nome dello studente",
      "Codici classe vincolati all'orario",
      "Interfaccia studente in 30+ lingue",
      "Prova gratuita di 14 giorni",
      "Esercizio di pronuncia: ascolta e pronuncia qualsiasi parola",
    ],
    priceCta: "Inizia la prova gratuita di 14 giorni",
    priceLarger: "Più di 1,000 studenti? Contattaci per un piano distrettuale.",
    faqTag: "Domande frequenti",
    faqH2: "Cosa chiedono i direttori prima della prova.",
    faq: [
      {
        q: "Se non ci sono login, come faccio a sapere quale studente ha cercato cosa?",
        a: "L'insegnante carica in anticipo un elenco di nomi nella dashboard. Quando uno studente visita l'URL della classe, sceglie il suo nome con un clic. Ogni ricerca è etichettata con quel nome. Niente email, niente password, niente dati personali.",
      },
      {
        q: "È sicuro secondo COPPA? Riceverò un reclamo dai genitori?",
        a: "Sì. Gadit non raccoglie alcuna informazione personale degli studenti. Niente creazione di account, niente raccolta di email, niente date di nascita, niente identificatori. Non ci sono dati che possono essere abusati. L'architettura supera con margine COPPA, GDPR-K e la legge israeliana sulla privacy degli studenti.",
      },
      {
        q: "Gli studenti devono installare un'app?",
        a: "No. Qualsiasi browser funziona. Gli studenti visitano gadit.app/c/CODE sul computer della classe (o qualsiasi dispositivo con browser). Niente app store, nessun coinvolgimento dell'IT.",
      },
      {
        q: "Richiede configurazione IT o SSO?",
        a: "No. Il direttore o il coordinatore di anno crea la classe in due minuti e condivide il codice con gli insegnanti. L'IT non è coinvolto in nessun passaggio.",
      },
      {
        q: "Cosa mostra davvero la dashboard?",
        a: "Ricerche di parole di ogni studente con timestamp, le parole che la classe ha cercato più questa settimana, e schemi di ricerche ripetute che segnalano comprensione fragile. Dati reali di comprensione della classe, non metriche vaghe di coinvolgimento.",
      },
      {
        q: "Può essere usato fuori dall'orario scolastico?",
        a: "I codici classe sono vincolati alle ore attive della scuola (predefinito da domenica a giovedì 7:30 a 15:00, configurabile). Fuori da quella finestra il codice dà accesso al dizionario di base. Questo impedisce che il codice scolastico diventi un sostituto gratuito 24 ore su 24 del piano Family.",
      },
      {
        q: "E se la mia scuola ha più di 500 studenti?",
        a: "Scegli in base al numero di studenti: fino a 100 studenti $97 al mese, fino a 500 studenti $297 al mese e fino a 1,000 studenti $497 al mese. Per più di 1,000 studenti o reti con più sedi, contattaci per un piano personalizzato.",
      },
      {
        q: "Come spiega Gadit una parola? È solo traduzione?",
        a: "Gadit non è un dizionario di traduzione. Gadit definisce e spiega le parole. Per ogni parola dà tutti i significati, tre frasi di esempio per significato, etimologia, e una modalità di contesto in cui lo studente incolla la frase e Gadit sceglie il significato corretto. L'interfaccia dello studente è nella sua lingua, ma la profondità della spiegazione è la stessa in ogni lingua.",
      },
    ],
    finalH2: "Ferma la modalità di fallimento silenzioso.",
    finalBody: "Dai ai tuoi insegnanti lo strumento per vedere esattamente cosa la classe non capisce. La prova inizia in 2 minuti. Senza IT, senza acquisti, senza moduli per i genitori.",
    finalCta: "Inizia la prova gratuita di 14 giorni",
    finalNote: "Nessuna carta di credito richiesta per la prova. Annulla quando vuoi.",
    mockupRoster: "Elenco classe, 22 studenti",
    mockupSearches: "Più cercate questa settimana",
    mockupStudent1: "Maya ha cercato «fotosintesi»",
    mockupStudent2: "Yossi ha cercato «mitocondrio» ×2",
    mockupStudent3: "Noa ha cercato «democrazia»",
    mockupWordExample: "fotosintesi",
    mockupExampleDef: "Processo con cui le piante verdi usano la luce del sole per trasformare acqua e anidride carbonica in cibo.",
    mockupExampleEx: "La fotosintesi avviene principalmente nelle foglie della pianta.",
  },

  // ─── Japanese ────────────────────────────────────────────────
  ja: {
    heroH1: "すべての生徒が授業を理解する。",
    heroSub: "どんな難しい単語も、30+の言語のいずれかで、その場で説明。",
    heroCta: "14日間の無料トライアルを開始",
    heroPriceChip: "$97 / 月から",
    heroTrust: "セルフサービス。いつでもキャンセル可能。",
    probTag: "課題",
    probH2: "単語を理解していない生徒は文を理解できません。",
    probBody1: "生徒が一つの単語を見逃します。手を挙げません。だいたい分かっていると思っています。教師は先へ進みます。五つの単語の後、段落はぼやけてきます。五つの段落の後、授業は失われます。",
    probBody2: "遅れる生徒のほとんどは知能が低いわけではありません。完全には理解していない単語の山を持っているのです。その山の上に積み上がる新しい単語が、すべて差を広げます。原因は教師には見えません。",
    probCallout1Title: "広がるギャップ",
    probCallout1Body: "学ばれなかった単語は、未来のすべての授業に対する見えない壁を築きます。",
    probCallout2Title: "失われる時間",
    probCallout2Body: "教師は1授業ごとに5〜10分を単語の説明に費やしています。",
    probCallout3Title: "静かな脱落",
    probCallout3Body: "段落に未知の単語が多すぎると、生徒は集中力を失います。",
    howTag: "仕組み",
    howH2: "2分で設定完了。ITは不要。",
    howSub: "クイズゲームですでに機能している摩擦のないクラスコードのパターンを、単語理解のために構築しました。",
    howStep1Title: "クラスコードを作成",
    howStep1Body: "校長または学年主任がダッシュボードでクラスを作成します。システムが6文字のコードを生成します。教室のコンピュータ用のステッカーとして印刷してください。",
    howStep2Title: "生徒はアカウントなしで参加",
    howStep2Body: "生徒は任意のブラウザで gadit.app/c/CODE にアクセスし、リストから自分の名前を選び(ワンクリック)、単語の入力を始めます。アプリのインストール不要、メール不要、パスワード不要。",
    howStep3Title: "教師はクラスが検索したものを確認",
    howStep3Body: "すべての検索が生徒の名前とともにダッシュボードに表示されます。各生徒が何を、いつ検索したか、クラス全体がどの単語に苦労したかがわかります。",
    teacherTag: "教師ビュー",
    teacherH2: "あなたが待っていたダッシュボード。",
    teacherSub: "曖昧なエンゲージメント指標ではありません。具体的な単語、具体的な生徒、具体的な瞬間です。",
    teacherB1: "タイムスタンプ付きの生徒ごとの検索履歴",
    teacherB2: "今週クラスが最も検索した単語",
    teacherB3: "脆弱な理解を示す繰り返しの検索",
    teacherB4: "日付、生徒、単語でフィルタ",
    privTag: "アーキテクチャに組み込まれたプライバシー",
    privH2: "教師には完全な可視性。学校にはゼロのデータリスク。",
    privSub: "生徒の個人データを一切収集しません。上手に隠しているからではなく、そもそも収集していないからです。アーキテクチャがそのままコンプライアンスです。",
    privPoint1: "生徒アカウントなし。メールなし、パスワードなし、識別子なし。",
    privPoint2: "学校から個人情報は出ません。検索はリストの名前でのみタグ付けされます。",
    privPoint3: "クラスコードは学校時間内のみ機能します。学校ごとに設定可能。",
    privPoint4: "COPPA、GDPR-K、イスラエルの生徒プライバシー法をすべて余裕でクリア。",
    privKahoot: "教室のクイズゲームのように簡単に参加できます。単語理解と教師の可視性のために構築されています。",
    priceTag: "料金",
    priceH2: "シンプル。決裁基準額未満。",
    priceSub: "Stripeによるセルフサービス。営業電話なし、デモなし、発注書なし。",
    priceSmallName: "Schools",
    priceSmallAmount: "$69",
    priceSmallStudents: "生徒100人まで",
    priceLargeName: "Schools Large",
    priceLargeAmount: "$149",
    priceLargeStudents: "生徒500人まで",
    priceIncludesTitle: "両プランに含まれるもの",
    priceIncludes: [
      "クラス数無制限",
      "教師ダッシュボード一式",
      "生徒名選択リスト",
      "時間制限付きクラスコード",
      "30+言語の生徒インターフェース",
      "14日間の無料トライアル",
      "発音練習：どんな言葉も聞いて声に出す",
    ],
    priceCta: "14日間の無料トライアルを開始",
    priceLarger: "1,000人を超える生徒は?学区プランについてお問い合わせください。",
    faqTag: "よくある質問",
    faqH2: "校長がトライアル前に聞くこと。",
    faq: [
      {
        q: "ログインがない場合、どの生徒が何を検索したかをどう知るのですか?",
        a: "教師はダッシュボードに名前のリストを事前に読み込みます。生徒がクラスのURLにアクセスすると、ワンクリックで自分の名前を選びます。各検索がその名前でタグ付けされます。メールなし、パスワードなし、個人データなし。",
      },
      {
        q: "COPPAに準拠していますか?保護者から苦情が来ますか?",
        a: "はい。Gaditは生徒の個人情報を一切収集しません。アカウント作成なし、メール収集なし、生年月日なし、識別子なし。悪用できるデータが存在しません。アーキテクチャはCOPPA、GDPR-K、イスラエルの生徒プライバシー法を余裕で上回ります。",
      },
      {
        q: "生徒はアプリをインストールする必要がありますか?",
        a: "いいえ。どのブラウザでも動作します。生徒は教室のコンピュータ(またはブラウザのある任意のデバイス)で gadit.app/c/CODE にアクセスします。アプリストア不要、IT関与不要。",
      },
      {
        q: "IT設定やSSOは必要ですか?",
        a: "いいえ。校長または学年主任が2分でクラスを作成し、教師とコードを共有します。ITはどの段階にも関与しません。",
      },
      {
        q: "ダッシュボードは実際に何を表示しますか?",
        a: "各生徒の単語検索とタイムスタンプ、クラスが今週最も検索した単語、そして脆弱な理解を示す繰り返し検索のパターン。曖昧なエンゲージメント指標ではなく、本物のクラス理解データです。",
      },
      {
        q: "学校時間外に使用できますか?",
        a: "クラスコードは学校の活動時間に紐付けられています(デフォルトは日曜から木曜の7:30から15:00、設定可能)。その時間外ではコードは基本辞書アクセスのみを提供します。これにより、学校コードがFamilyプランの24時間無料代替品になることを防ぎます。",
      },
      {
        q: "学校に500人を超える生徒がいる場合は?",
        a: "生徒数に応じてお選びください。生徒100人まで月額$97、500人まで月額$297、1,000人まで月額$497です。1,000人を超える生徒や複数拠点のネットワークについては、カスタムプランをお問い合わせください。",
      },
      {
        q: "Gaditはどのように単語を説明しますか?ただの翻訳ですか?",
        a: "Gaditは翻訳辞書ではありません。Gaditは単語を定義し説明します。各単語について、すべての意味、意味ごとに3つの例文、語源、そして生徒が文を貼り付けるとGaditが正しい意味を選ぶコンテキストモードを提供します。生徒のインターフェースは自国語ですが、説明の深さはどの言語でも同じです。",
      },
    ],
    finalH2: "静かな失敗を止めましょう。",
    finalBody: "クラスが何を理解していないかを正確に見るためのツールを教師に提供してください。トライアルは2分で開始できます。IT不要、購買手続き不要、保護者向け書類不要。",
    finalCta: "14日間の無料トライアルを開始",
    finalNote: "トライアルにクレジットカードは不要。いつでもキャンセル可能。",
    mockupRoster: "クラス名簿、生徒22人",
    mockupSearches: "今週の検索上位",
    mockupStudent1: "マヤが「光合成」を検索",
    mockupStudent2: "ヨッシが「ミトコンドリア」×2を検索",
    mockupStudent3: "ノアが「民主主義」を検索",
    mockupWordExample: "光合成",
    mockupExampleDef: "緑色の植物が太陽光を使って水と二酸化炭素を栄養に変えるプロセス。",
    mockupExampleEx: "光合成は主に植物の葉で起こります。",
  },
};

// 11 store-locale languages (af/bn/da/fil/hu/ko/sw/th/vi/zh-CN/zh-TW), added 2026-08-22
// so landing copy is native instead of English fallback. satisfies-guarded.
Object.assign(COPY, {
  "af": {"heroH1":"Elke leerder verstaan die les.","heroSub":"Enige moeilike woord, in enige van 30+ tale, op die plek verduidelik.","heroCta":"Sien pryse en bestel","heroPriceChip":"Vanaf $97 / maand","heroTrust":"Selfbediening. Kanselleer enige tyd.","probTag":"Die Probleem","probH2":"'n Leerder wat nie 'n woord verstaan nie, kan nie die sin verstaan nie.","probBody1":"'n Leerder mis een woord. Hulle steek nie hul hand op nie. Hulle dink hulle verstaan min of meer. Die onderwyser gaan aan. Vyf woorde later is die paragraaf wasig. Vyf paragrawe later is die les verlore.","probBody2":"Die meeste leerders wat agterraak is nie onintelligent nie. Hulle het 'n stapel woorde wat hulle nooit ten volle verstaan het nie. Elke nuwe woord wat op daardie gebou word, vergroot die gaping. Die oorsaak is onsigbaar vir die onderwyser.","probCallout1Title":"Die groeiende gaping","probCallout1Body":"Ongeleerde woorde bou 'n onsigbare versperring tot elke toekomstige les.","probCallout2Title":"Die tydverlies","probCallout2Body":"Onderwysers verloor 5 tot 10 minute per les op definisies.","probCallout3Title":"Die stille uitsakker","probCallout3Body":"Leerders raak afgetrokke wanneer 'n paragraaf te veel onbekende woorde het.","howTag":"Hoe Dit Werk","howH2":"Stel op in 2 minute. Geen IT.","howSub":"Dieselfde wrywinglose klaskamerkode-patroon wat reeds vir vasvraspeletjies werk, gebou vir woordbegrip in plaas daarvan.","howStep1Title":"Skep 'n klaskamerkode","howStep1Body":"Die skoolhoof of koördineerder skep 'n klaskamer in die paneel. Die stelsel genereer 'n 6-karakter kode. Druk dit op 'n plakker vir die klaskamerrekenaar.","howStep2Title":"Leerders sluit aan, geen rekeninge","howStep2Body":"Leerders besoek gadit.app/c/KODE in enige blaaier, kies hul naam uit die naamlys (een klik), en begin woorde tik. Geen toepassing-installasie, geen e-pos, geen wagwoord.","howStep3Title":"Onderwysers sien wat die klas gesoek het","howStep3Body":"Elke soektog land in die paneel, gemerk met die leerder se naam. Jy sien wat elke leerder opgesoek het, wanneer, en watter woorde die klas gesamentlik moeilik gevind het.","teacherTag":"Die Onderwyser-aansig","teacherH2":"Die paneel waarvoor jy gevra het.","teacherSub":"Nie vae betrokkenheidsmaatstawwe nie. Spesifieke woorde, spesifieke leerders, spesifieke oomblikke.","teacherB1":"Soekgeskiedenis per leerder met tydstempels","teacherB2":"Die klas se mees gesoekte woorde hierdie week","teacherB3":"Herhaalde opsoeke wat brose begrip uitwys","teacherB4":"Filtreerbaar volgens datum, leerder of woord","privTag":"Privaatheid deur Ontwerp","privH2":"Volle sigbaarheid vir onderwysers. Geen datarisiko vir skole nie.","privSub":"Ons versamel geen leerder se persoonlike inligting nie. Nie omdat ons dit goed wegsteek nie, maar omdat ons dit nooit versamel nie. Die argitektuur is die nakoming.","privPoint1":"Geen leerderrekeninge. Geen e-posse, geen wagwoorde, geen ID's.","privPoint2":"Geen persoonlike data verlaat die skool nie. Soektogte word slegs volgens naamlysnaam gemerk.","privPoint3":"Klaskamerkodes werk slegs gedurende skoolure. Instelbaar per skool.","privPoint4":"COPPA, GDPR-K, en die Israeliese leerderprivaatheidswet word almal gemaklik hanteer.","privKahoot":"Sluit so maklik aan soos 'n klaskamer-vasvraspeletjie. Gebou vir woordbegrip en onderwyser-sigbaarheid.","priceTag":"Pryse","priceH2":"Jaarlikse pryse, volgens skoolgrootte.","priceSub":"Selfbediening via Stripe. Geen verkoopsoproepe, geen demonstrasies, geen aankooporders.","priceSmallName":"Skole","priceSmallAmount":"$69","priceSmallStudents":"Tot 100 leerders","priceLargeName":"Skole Groot","priceLargeAmount":"$149","priceLargeStudents":"Tot 500 leerders","priceIncludesTitle":"Albei planne sluit in","priceIncludes":["Onbeperkte klaskamers","Volledige onderwyserpaneel","Leerderkieser-naamlys","Tydgebonde klaskamerkodes","Leerder-koppelvlak in 30+ tale","Eenvoudige jaarlikse bestelling, onder die verkrygingsdrempel","Uitspraakoefening: hoor en sê enige woord"],"priceCta":"Sien pryse en bestel","priceLarger":"Benodig jy meer as 1,000 leerders? Kontak ons oor distriksplanne.","faqTag":"Vrae","faqH2":"Vrae wat skoolhoofde vra voordat hulle bestel.","faq":[{"q":"As daar geen aanmeldings is nie, hoe weet ek watter leerder wat gesoek het?","a":"Die onderwyser laai vooraf 'n naamlys van voorname in die paneel. Wanneer 'n leerder die klaskamer-URL besoek, kies hulle hul naam met een klik. Elke soektog word by daardie naam gemerk. Geen e-pos, geen wagwoord, geen persoonlike inligting word versamel nie."},{"q":"Is dit COPPA-veilig? Sal ek 'n ouerklagte kry?","a":"Ja. Gadit versamel glad geen leerder se persoonlike inligting nie. Geen rekeningskepping nie, geen e-posinsameling nie, geen verjaarsdae nie, geen ID's nie. Daar is geen data om te misbruik nie. Die argitektuur oortref gemaklik COPPA, GDPR-K, en die Israeliese leerderprivaatheidswet."},{"q":"Moet leerders 'n toepassing installeer?","a":"Nee. Enige blaaier werk. Leerders besoek gadit.app/c/KODE op die klaskamerrekenaar (of enige toestel met 'n blaaier). Geen toepassingwinkel nie, geen IT-betrokkenheid nie."},{"q":"Vereis dit IT- of SSO-opstelling?","a":"Nee. 'n Skoolhoof of graadkoördineerder skep die klaskamer in twee minute en deel die kode met onderwysers. IT is by geen stap betrokke nie."},{"q":"Wat wys die paneel eintlik?","a":"Elke leerder se woordsoektogte met tydstempels, die woorde wat die klas hierdie week die meeste gesoek het, en patrone van herhaalde opsoeke wat brose begrip aandui. Jy sien die werklike klaskamer-begripsdata, nie vae betrokkenheidsmaatstawwe nie."},{"q":"Kan dit buite skoolure gebruik word?","a":"Klaskamerkodes is gebind aan die skool se aktiewe ure (verstek Sondag tot Donderdag 7:30 tot 15:00, instelbaar). Buite daardie venster gee die kode basiese woordeboektoegang maar geen uitgebreide funksies nie. Dit verhoed dat die skoolkode 'n gratis 24/7 plaasvervanger vir die Gesinsvlak word."},{"q":"Wat as my skool meer as 500 leerders het?","a":"Kies volgens leerdertal: tot 100 leerders is $97/maand, tot 500 is $297/maand, en tot 1,000 is $497/maand. Vir meer as 1,000 leerders of veelplek-distrikte, kontak ons vir 'n pasgemaakte plan."},{"q":"Hoe verduidelik Gadit 'n woord? Is dit net 'n vertaling?","a":"Gadit is nie 'n vertaalwoordeboek nie. Gadit definieer en verduidelik woorde. Vir elke woord gee dit elke betekenis, drie voorbeeldsinne per betekenis, etimologie, en 'n konteks-bewuste modus waar leerders die sin plak en Gadit die regte betekenis kies. Die leerder se koppelvlak is in hul taal, maar die verduidelikingsdiepte is dieselfde in elke koppelvlaktaal."}],"finalH2":"Stop die stille faalmodus.","finalBody":"Gee jou onderwysers die hulpmiddel om presies te sien wat hul klas nie verstaan nie. Om te begin neem 2 minute. Geen IT, geen verkryging, geen ouervorms.","finalCta":"Sien pryse en bestel","finalNote":"Betaal jaarliks per bankoorplasing teen 'n belastingfaktuur. Geen tender nodig nie.","mockupRoster":"Klasnaamlys, 22 leerders","mockupSearches":"Mees gesoek hierdie week","mockupStudent1":"Maya het fotosintese gesoek","mockupStudent2":"Yossi het mitochondria ×2 gesoek","mockupStudent3":"Noa het demokrasie gesoek","mockupWordExample":"fotosintese","mockupExampleDef":"Die proses waardeur groen plante sonlig gebruik om water en koolstofdioksied in voedsel om te skakel.","mockupExampleEx":"Fotosintese vind meestal in die blare van die plant plaas."},
  "bn": {"heroH1":"প্রতিটি শিক্ষার্থী পাঠ বোঝে।","heroSub":"যে-কোনো কঠিন শব্দ, ৩০+ ভাষার যে-কোনোটিতে, তখনই ব্যাখ্যা করা।","heroCta":"মূল্য দেখুন আর অর্ডার করুন","heroPriceChip":"মাসে $97 থেকে","heroTrust":"সেল্ফ-সার্ভ। যে-কোনো সময় বাতিল।","probTag":"সমস্যা","probH2":"যে শিক্ষার্থী একটি শব্দ বোঝে না, সে বাক্যটিও বুঝতে পারে না।","probBody1":"একজন শিক্ষার্থী একটি শব্দ মিস করে। সে হাত তোলে না। ভাবে সে মোটামুটি বুঝেছে। শিক্ষক এগিয়ে যান। পাঁচ শব্দ পরে অনুচ্ছেদটি ঝাপসা। পাঁচ অনুচ্ছেদ পরে পাঠটাই হারিয়ে যায়।","probBody2":"যেসব শিক্ষার্থী পিছিয়ে পড়ে তাদের বেশিরভাগই অবুদ্ধিমান নয়। তাদের কাছে জমে থাকে একগাদা শব্দ যা তারা কখনো পুরোপুরি বোঝেনি। প্রতিটি নতুন শব্দ সেগুলোর ওপর গড়ে ওঠে আর ফাঁকটা আরও বাড়ায়। কারণটি শিক্ষকের চোখে অদৃশ্য।","probCallout1Title":"ক্রমবর্ধমান ফাঁক","probCallout1Body":"না-শেখা শব্দ ভবিষ্যতের প্রতিটি পাঠের সামনে একটি অদৃশ্য বাধা গড়ে তোলে।","probCallout2Title":"সময়ের অপচয়","probCallout2Body":"শিক্ষকরা প্রতি পাঠে সংজ্ঞা দিতে ৫-১০ মিনিট হারান।","probCallout3Title":"নীরব ঝরে পড়া","probCallout3Body":"একটি অনুচ্ছেদে অনেক অজানা শব্দ থাকলে শিক্ষার্থীরা মনোযোগ হারিয়ে ফেলে।","howTag":"এটি কীভাবে কাজ করে","howH2":"২ মিনিটে সেটআপ। কোনো আইটি লাগে না।","howSub":"কুইজ গেমের জন্য যে ঝামেলামুক্ত ক্লাসরুম কোড প্যাটার্ন ইতিমধ্যে কাজ করে, সেটিই এবার শব্দ বোঝার জন্য তৈরি।","howStep1Title":"একটি ক্লাসরুম কোড তৈরি করুন","howStep1Body":"প্রধান শিক্ষক বা সমন্বয়ক ড্যাশবোর্ডে একটি ক্লাসরুম তৈরি করেন। সিস্টেম একটি ৬-অক্ষরের কোড তৈরি করে। এটি একটি স্টিকারে ছাপিয়ে ক্লাসরুমের কম্পিউটারে লাগান।","howStep2Title":"শিক্ষার্থীরা যোগ দেয়, কোনো অ্যাকাউন্ট ছাড়া","howStep2Body":"শিক্ষার্থীরা যে-কোনো ব্রাউজারে gadit.app/c/CODE-এ যায়, রোস্টার থেকে নিজের নাম বেছে নেয় (এক ক্লিকে), আর শব্দ টাইপ করা শুরু করে। কোনো অ্যাপ ইনস্টল নেই, ইমেইল নেই, পাসওয়ার্ড নেই।","howStep3Title":"শিক্ষকরা দেখেন ক্লাস কী খুঁজেছে","howStep3Body":"প্রতিটি অনুসন্ধান ড্যাশবোর্ডে জমা হয়, শিক্ষার্থীর নামসহ ট্যাগ করা। আপনি দেখতে পান প্রতিটি শিক্ষার্থী কী খুঁজেছে, কখন খুঁজেছে, আর কোন শব্দগুলো নিয়ে গোটা ক্লাস একসঙ্গে হিমশিম খেয়েছে।","teacherTag":"শিক্ষকের ভিউ","teacherH2":"যে ড্যাশবোর্ডটি আপনি চেয়ে আসছিলেন।","teacherSub":"অস্পষ্ট এনগেজমেন্ট মেট্রিক নয়। নির্দিষ্ট শব্দ, নির্দিষ্ট শিক্ষার্থী, নির্দিষ্ট মুহূর্ত।","teacherB1":"টাইমস্ট্যাম্পসহ প্রতিটি শিক্ষার্থীর অনুসন্ধানের ইতিহাস","teacherB2":"এই সপ্তাহে গোটা ক্লাসে সবচেয়ে বেশি খোঁজা শব্দ","teacherB3":"বারবার খোঁজা যা দুর্বল বোঝাপড়ার ইঙ্গিত দেয়","teacherB4":"তারিখ, শিক্ষার্থী বা শব্দ অনুযায়ী ফিল্টারযোগ্য","privTag":"নকশাতেই গোপনীয়তা","privH2":"শিক্ষকদের জন্য সম্পূর্ণ দৃশ্যমানতা। স্কুলের জন্য শূন্য ডেটা ঝুঁকি।","privSub":"আমরা কোনো শিক্ষার্থীর ব্যক্তিগত তথ্য সংগ্রহ করি না। ভালোভাবে লুকিয়ে রাখি বলে নয়, বরং আমরা কখনো সংগ্রহই করি না বলে। এই স্থাপত্যটাই কমপ্লায়েন্স।","privPoint1":"কোনো শিক্ষার্থী অ্যাকাউন্ট নেই। কোনো ইমেইল নেই, পাসওয়ার্ড নেই, আইডি নেই।","privPoint2":"কোনো ব্যক্তিগত ডেটা স্কুল ছেড়ে যায় না। অনুসন্ধান শুধু রোস্টারের নামে ট্যাগ করা হয়।","privPoint3":"ক্লাসরুম কোড শুধু স্কুল চলাকালীন কাজ করে। প্রতিটি স্কুলের জন্য কনফিগারযোগ্য।","privPoint4":"COPPA, GDPR-K, আর ইসরায়েলি শিক্ষার্থী-গোপনীয়তা আইন সবই স্বচ্ছন্দে সামলানো।","privKahoot":"একটি ক্লাসরুম কুইজ গেমের মতোই সহজে যোগ দেওয়া যায়। শব্দ বোঝা আর শিক্ষকের দৃশ্যমানতার জন্য তৈরি।","priceTag":"মূল্য","priceH2":"স্কুলের আকার অনুযায়ী বার্ষিক মূল্য।","priceSub":"Stripe-এর মাধ্যমে সেল্ফ-সার্ভ। কোনো সেলস কল নেই, ডেমো নেই, পারচেজ অর্ডার নেই।","priceSmallName":"Schools","priceSmallAmount":"$69","priceSmallStudents":"১০০ জন পর্যন্ত শিক্ষার্থী","priceLargeName":"Schools Large","priceLargeAmount":"$149","priceLargeStudents":"৫০০ জন পর্যন্ত শিক্ষার্থী","priceIncludesTitle":"দুটি প্ল্যানেই আছে","priceIncludes":["সীমাহীন ক্লাসরুম","পূর্ণ শিক্ষক ড্যাশবোর্ড","শিক্ষার্থী নির্বাচন রোস্টার","সময়সীমাবদ্ধ ক্লাসরুম কোড","৩০+ ভাষায় শিক্ষার্থী UI","সহজ বার্ষিক অর্ডার, প্রকিউরমেন্ট থ্রেশহোল্ডের নিচে","উচ্চারণ অনুশীলন: যে-কোনো শব্দ শুনুন আর বলুন"],"priceCta":"মূল্য দেখুন আর অর্ডার করুন","priceLarger":"১,০০০-এর বেশি শিক্ষার্থী দরকার? ডিস্ট্রিক্ট প্ল্যান নিয়ে আমাদের সঙ্গে যোগাযোগ করুন।","faqTag":"সচরাচর জিজ্ঞাসা","faqH2":"অর্ডার করার আগে প্রধান শিক্ষকরা যে প্রশ্ন করেন।","faq":[{"q":"যদি কোনো লগইন না থাকে, তবে কোন শিক্ষার্থী কী খুঁজেছে তা আমি কীভাবে জানব?","a":"শিক্ষক ড্যাশবোর্ডে আগে থেকেই নামের একটি রোস্টার লোড করে রাখেন। একজন শিক্ষার্থী ক্লাসরুম URL-এ গেলে সে এক ক্লিকে নিজের নাম বেছে নেয়। প্রতিটি অনুসন্ধান সেই নামে ট্যাগ হয়। কোনো ইমেইল, পাসওয়ার্ড বা ব্যক্তিগত তথ্য সংগ্রহ করা হয় না।"},{"q":"এটি কি COPPA-নিরাপদ? আমি কি কোনো অভিভাবকের অভিযোগ পাব?","a":"হ্যাঁ। Gadit কোনো শিক্ষার্থীর ব্যক্তিগত তথ্য একেবারেই সংগ্রহ করে না। কোনো অ্যাকাউন্ট তৈরি নেই, ইমেইল সংগ্রহ নেই, জন্মদিন নেই, আইডি নেই। অপব্যবহার করার মতো কোনো ডেটাই নেই। এই স্থাপত্য COPPA, GDPR-K, আর ইসরায়েলি শিক্ষার্থী গোপনীয়তা আইনকে স্বচ্ছন্দে ছাড়িয়ে যায়।"},{"q":"শিক্ষার্থীদের কি একটি অ্যাপ ইনস্টল করতে হবে?","a":"না। যে-কোনো ব্রাউজারেই চলে। শিক্ষার্থীরা ক্লাসরুমের কম্পিউটারে (বা ব্রাউজারসহ যে-কোনো ডিভাইসে) gadit.app/c/CODE-এ যায়। কোনো অ্যাপ স্টোর নেই, কোনো আইটি জড়িত নেই।"},{"q":"এতে কি আইটি বা SSO সেটআপ লাগে?","a":"না। একজন প্রধান শিক্ষক বা গ্রেড সমন্বয়ক দুই মিনিটে ক্লাসরুম তৈরি করেন আর কোডটি শিক্ষকদের সঙ্গে শেয়ার করেন। কোনো ধাপেই আইটি জড়িত হয় না।"},{"q":"ড্যাশবোর্ড আসলে কী দেখায়?","a":"টাইমস্ট্যাম্পসহ প্রতিটি শিক্ষার্থীর শব্দ অনুসন্ধান, এই সপ্তাহে ক্লাস সবচেয়ে বেশি যে শব্দগুলো খুঁজেছে, আর বারবার খোঁজার প্যাটার্ন যা দুর্বল বোঝাপড়ার সংকেত দেয়। আপনি ক্লাসরুমের সত্যিকারের বোঝাপড়ার ডেটা দেখেন, অস্পষ্ট এনগেজমেন্ট মেট্রিক নয়।"},{"q":"এটি কি ক্লাসের সময়ের বাইরে ব্যবহার করা যায়?","a":"ক্লাসরুম কোড স্কুলের সক্রিয় সময়ের সঙ্গে বাঁধা (ডিফল্ট রবিবার-বৃহস্পতিবার ৭:৩০-১৫:০০, কনফিগারযোগ্য)। সেই সময়ের বাইরে কোডটি প্রাথমিক অভিধান ব্যবহারের সুযোগ দেয় কিন্তু বাড়তি ফিচার নয়। এটি স্কুল কোডকে Family টিয়ারের বিনামূল্যের ২৪/৭ বিকল্প হয়ে ওঠা থেকে ঠেকায়।"},{"q":"আমার স্কুলে ৫০০-এর বেশি শিক্ষার্থী থাকলে কী হবে?","a":"শিক্ষার্থী সংখ্যা অনুযায়ী বেছে নিন: ১০০ জন পর্যন্ত মাসে $97, ৫০০ জন পর্যন্ত মাসে $297, আর ১,০০০ জন পর্যন্ত মাসে $497। ১,০০০-এর বেশি শিক্ষার্থী বা একাধিক শাখার ডিস্ট্রিক্টের জন্য, একটি কাস্টম প্ল্যানের বিষয়ে আমাদের সঙ্গে যোগাযোগ করুন।"},{"q":"Gadit কীভাবে একটি শব্দ ব্যাখ্যা করে? এটি কি শুধু একটি অনুবাদ?","a":"Gadit কোনো অনুবাদ অভিধান নয়। Gadit শব্দের সংজ্ঞা দেয় আর ব্যাখ্যা করে। প্রতিটি শব্দের জন্য এটি দেয় প্রতিটি অর্থ, প্রতিটি অর্থের জন্য তিনটি উদাহরণ বাক্য, ব্যুৎপত্তি, আর একটি প্রসঙ্গ-সচেতন মোড যেখানে শিক্ষার্থীরা বাক্যটি পেস্ট করে আর Gadit সঠিক অর্থটি বেছে নেয়। শিক্ষার্থীর UI তার নিজের ভাষায়, কিন্তু ব্যাখ্যার গভীরতা প্রতিটি UI ভাষায় একই।"}],"finalH2":"নীরব ব্যর্থতার ধারা থামান।","finalBody":"আপনার শিক্ষকদের সেই টুলটি দিন যা দিয়ে তারা ঠিক দেখতে পাবে তাদের ক্লাস কী বোঝে না। শুরু করতে ২ মিনিট লাগে। কোনো আইটি নেই, প্রকিউরমেন্ট নেই, অভিভাবকের ফর্ম নেই।","finalCta":"মূল্য দেখুন আর অর্ডার করুন","finalNote":"ট্যাক্স ইনভয়েসের বিপরীতে ব্যাংক ট্রান্সফারে বার্ষিক পরিশোধ করুন। কোনো টেন্ডার লাগে না।","mockupRoster":"ক্লাস রোস্টার, ২২ জন শিক্ষার্থী","mockupSearches":"এই সপ্তাহে সবচেয়ে বেশি খোঁজা","mockupStudent1":"মায়া খুঁজেছে সালোকসংশ্লেষণ","mockupStudent2":"ইওসি খুঁজেছে মাইটোকন্ড্রিয়া ×2","mockupStudent3":"নোয়া খুঁজেছে গণতন্ত্র","mockupWordExample":"সালোকসংশ্লেষণ","mockupExampleDef":"যে প্রক্রিয়ায় সবুজ উদ্ভিদ সূর্যের আলো ব্যবহার করে পানি আর কার্বন ডাই অক্সাইডকে খাদ্যে রূপান্তরিত করে।","mockupExampleEx":"সালোকসংশ্লেষণ মূলত উদ্ভিদের পাতায় ঘটে।"},
  "da": {"heroH1":"Hver elev forstår undervisningen.","heroSub":"Ethvert svært ord, på ét af 30+ sprog, forklaret med det samme.","heroCta":"Se priser og bestil","heroPriceChip":"Fra 97 USD / måned","heroTrust":"Selvbetjening. Opsig når som helst.","probTag":"Problemet","probH2":"En elev, der ikke forstår et ord, kan ikke forstå sætningen.","probBody1":"En elev går glip af ét ord. De rækker ikke hånden op. De tror, de nogenlunde forstår. Læreren går videre. Fem ord senere er afsnittet sløret. Fem afsnit senere er undervisningen tabt.","probBody2":"De fleste elever, der kommer bagud, er ikke uintelligente. De har en stak ord, de aldrig forstod helt. Hvert nyt ord bygget oven på dem forstærker afstanden. Årsagen er usynlig for læreren.","probCallout1Title":"Den voksende afstand","probCallout1Body":"Ord, der ikke er lært, bygger en usynlig barriere for hver kommende lektion.","probCallout2Title":"Det tidsspild","probCallout2Body":"Lærere mister 5-10 minutter pr. lektion på definitioner.","probCallout3Title":"Det tavse frafald","probCallout3Body":"Elever falder fra, når et afsnit har for mange ukendte ord.","howTag":"Sådan virker det","howH2":"Sat op på 2 minutter. Ingen it.","howSub":"Det samme gnidningsfrie mønster med klassekoder, der allerede virker til quizspil, bygget til ordforståelse i stedet.","howStep1Title":"Opret en klassekode","howStep1Body":"Skolelederen eller koordinatoren opretter en klasse i oversigten. Systemet genererer en kode på 6 tegn. Print den på et klistermærke til klassens computer.","howStep2Title":"Elever tilslutter sig, uden konti","howStep2Body":"Elever besøger gadit.app/c/KODE i en hvilken som helst browser, vælger deres navn fra listen (ét klik) og begynder at skrive ord. Ingen app-installation, ingen e-mail, ingen adgangskode.","howStep3Title":"Lærere ser, hvad klassen søgte efter","howStep3Body":"Hver søgning lander i oversigten, mærket med elevens navn. Du ser, hvad hver elev slog op, hvornår, og hvilke ord klassen samlet havde svært ved.","teacherTag":"Læreroverblikket","teacherH2":"Den oversigt, du har efterspurgt.","teacherSub":"Ikke vage engagementstal. Konkrete ord, konkrete elever, konkrete øjeblikke.","teacherB1":"Søgehistorik pr. elev med tidsstempler","teacherB2":"Klassens mest søgte ord i denne uge","teacherB3":"Gentagne opslag, der signalerer skrøbelig forståelse","teacherB4":"Kan filtreres efter dato, elev eller ord","privTag":"Privatliv fra bunden","privH2":"Fuldt overblik for lærere. Nul datarisiko for skoler.","privSub":"Vi indsamler ingen personlige oplysninger om elever. Ikke fordi vi skjuler det godt, men fordi vi aldrig indsamler dem. Arkitekturen er efterlevelsen.","privPoint1":"Ingen elevkonti. Ingen e-mails, ingen adgangskoder, ingen ID'er.","privPoint2":"Ingen personlige data forlader skolen. Søgninger mærkes kun med navnet fra listen.","privPoint3":"Klassekoder virker kun i skoletiden. Kan konfigureres pr. skole.","privPoint4":"COPPA, GDPR-K og israelsk lov om elevers privatliv håndteres alle uden problemer.","privKahoot":"Man tilslutter sig lige så let som et quizspil i klassen. Bygget til ordforståelse og lærerens overblik.","priceTag":"Priser","priceH2":"Årlige priser, efter skolens størrelse.","priceSub":"Selvbetjening via Stripe. Ingen salgssamtaler, ingen demoer, ingen indkøbsordrer.","priceSmallName":"Skoler","priceSmallAmount":"69 USD","priceSmallStudents":"Op til 100 elever","priceLargeName":"Skoler Stor","priceLargeAmount":"149 USD","priceLargeStudents":"Op til 500 elever","priceIncludesTitle":"Begge abonnementer inkluderer","priceIncludes":["Ubegrænset antal klasser","Fuld læreroversigt","Elevvælger med navneliste","Tidsbegrænsede klassekoder","Elevbrugerflade på 30+ sprog","Enkel årlig bestilling, under indkøbsgrænsen","Udtaletræning: hør og sig ethvert ord"],"priceCta":"Se priser og bestil","priceLarger":"Har du brug for mere end 1.000 elever? Kontakt os om distriktsabonnementer.","faqTag":"Ofte stillede spørgsmål","faqH2":"Spørgsmål skoleledere stiller, før de bestiller.","faq":[{"q":"Hvis der ikke er nogen logins, hvordan ved jeg så, hvilken elev der søgte på hvad?","a":"Læreren indlæser på forhånd en liste med fornavne i oversigten. Når en elev besøger klassens URL, vælger de deres navn med ét klik. Hver søgning mærkes med det navn. Ingen e-mail, ingen adgangskode, ingen personlige oplysninger indsamles."},{"q":"Er det COPPA-sikkert? Får jeg en forældreklage?","a":"Ja. Gadit indsamler slet ingen personlige oplysninger om elever. Ingen kontooprettelse, ingen indsamling af e-mail, ingen fødselsdage, ingen ID'er. Der er ingen data at misbruge. Arkitekturen overgår uden problemer COPPA, GDPR-K og israelsk lov om elevers privatliv."},{"q":"Skal elever installere en app?","a":"Nej. Enhver browser virker. Elever besøger gadit.app/c/KODE på klassens computer (eller enhver enhed med en browser). Ingen app-butik, ingen it-involvering."},{"q":"Kræver det it eller opsætning af SSO?","a":"Nej. En skoleleder eller årgangskoordinator opretter klassen på to minutter og deler koden med lærerne. It er ikke involveret på noget trin."},{"q":"Hvad viser oversigten egentlig?","a":"Hver elevs ordsøgninger med tidsstempler, de ord klassen søgte mest på i denne uge, og mønstre af gentagne opslag, der signalerer skrøbelig forståelse. Du ser klassens virkelige forståelsesdata, ikke vage engagementstal."},{"q":"Kan det bruges uden for skoletiden?","a":"Klassekoder er bundet til skolens aktive timer (standard søndag-torsdag 7.30-15.00, kan konfigureres). Uden for det tidsrum giver koden basal ordbogsadgang, men ingen udvidede funktioner. Det forhindrer skolekoden i at blive en gratis 24/7-erstatning for Familie-abonnementet."},{"q":"Hvad hvis min skole har mere end 500 elever?","a":"Vælg efter antal elever: op til 100 elever koster 97 USD/måned, op til 500 koster 297 USD/måned, og op til 1.000 koster 497 USD/måned. For mere end 1.000 elever eller distrikter med flere afdelinger, kontakt os for et skræddersyet abonnement."},{"q":"Hvordan forklarer Gadit et ord? Er det bare en oversættelse?","a":"Gadit er ikke en oversættelsesordbog. Gadit definerer og forklarer ord. For hvert ord giver det hver betydning, tre eksempelsætninger pr. betydning, etymologi og en kontekstbevidst tilstand, hvor eleven indsætter sætningen, og Gadit vælger den rigtige betydning. Elevens brugerflade er på deres sprog, men forklaringens dybde er den samme på alle sprog."}],"finalH2":"Stop den tavse fiasko.","finalBody":"Giv dine lærere værktøjet til at se præcis, hvad deres klasse ikke forstår. At komme i gang tager 2 minutter. Ingen it, ingen indkøb, ingen forældreformularer.","finalCta":"Se priser og bestil","finalNote":"Betal årligt via bankoverførsel mod en momsfaktura. Intet udbud nødvendigt.","mockupRoster":"Klasseliste, 22 elever","mockupSearches":"Mest søgte i denne uge","mockupStudent1":"Maya søgte på fotosyntese","mockupStudent2":"Yossi søgte på mitokondrie ×2","mockupStudent3":"Noa søgte på demokrati","mockupWordExample":"fotosyntese","mockupExampleDef":"Den proces, hvor grønne planter bruger sollys til at omdanne vand og kuldioxid til næring.","mockupExampleEx":"Fotosyntese foregår hovedsageligt i plantens blade."},
  "fil": {"heroH1":"Nauunawaan ng bawat mag-aaral ang aralin.","heroSub":"Anumang mahirap na salita, sa alinman sa 30+ na wika, ipinapaliwanag sa mismong sandali.","heroCta":"Tingnan ang presyo at mag-order","heroPriceChip":"Mula sa $97 / buwan","heroTrust":"Self-serve. Kanselahin anumang oras.","probTag":"Ang Problema","probH2":"Ang mag-aaral na hindi nakakaunawa ng isang salita ay hindi makakaunawa ng pangungusap.","probBody1":"May isang salitang hindi nakuha ng mag-aaral. Hindi sila nagtaas ng kamay. Akala nila humigit-kumulang nila itong naiintindihan. Nagpapatuloy ang guro. Limang salita ang lumipas, malabo na ang talata. Limang talata ang lumipas, nawala na ang aralin.","probBody2":"Karamihan sa mga mag-aaral na napag-iiwanan ay hindi kulang sa talino. May tumpok silang mga salitang hindi nila lubos na naunawaan. Bawat bagong salitang nakabatay doon ay nagpapalaki ng agwat. Hindi nakikita ng guro ang sanhi.","probCallout1Title":"Ang lumalaking agwat","probCallout1Body":"Ang mga salitang hindi natutunan ay nagtatayo ng hindi nakikitang harang sa bawat susunod na aralin.","probCallout2Title":"Ang pag-ubos ng oras","probCallout2Body":"Nawawalan ang mga guro ng 5 hanggang 10 minuto bawat aralin sa mga kahulugan.","probCallout3Title":"Ang tahimik na pag-drop","probCallout3Body":"Nawawala ang atensyon ng mga mag-aaral kapag masyadong maraming di-kilalang salita sa isang talata.","howTag":"Paano Ito Gumagana","howH2":"I-setup sa 2 minuto. Walang IT.","howSub":"Ang parehong walang-abalang pattern ng classroom code na umuubra na para sa quiz games, ginawa para sa pag-unawa ng salita sa halip.","howStep1Title":"Gumawa ng classroom code","howStep1Body":"Gumagawa ang punong-guro o coordinator ng silid-aralan sa dashboard. Bumubuo ang sistema ng 6-karakter na code. I-print ito sa isang sticker para sa computer ng silid-aralan.","howStep2Title":"Sumasali ang mga mag-aaral, walang account","howStep2Body":"Binibisita ng mga mag-aaral ang gadit.app/c/CODE sa anumang browser, pinipili ang pangalan nila mula sa roster (isang click), at nagsisimulang mag-type ng mga salita. Walang app na ii-install, walang email, walang password.","howStep3Title":"Nakikita ng mga guro kung ano ang hinanap ng klase","howStep3Body":"Bawat paghahanap ay napupunta sa dashboard, may tatak na pangalan ng mag-aaral. Nakikita mo kung ano ang hinanap ng bawat mag-aaral, kailan, at aling mga salita ang pinaghirapan ng klase nang sama-sama.","teacherTag":"Ang Tanaw ng Guro","teacherH2":"Ang dashboard na matagal mo nang hinihingi.","teacherSub":"Hindi malabong sukatan ng engagement. Tiyak na mga salita, tiyak na mga mag-aaral, tiyak na mga sandali.","teacherB1":"Kasaysayan ng paghahanap bawat mag-aaral na may timestamp","teacherB2":"Pinakahinanap na mga salita ng buong klase ngayong linggo","teacherB3":"Mga paulit-ulit na paghahanap na nagbabandila ng marupok na pag-unawa","teacherB4":"Kayang salain ayon sa petsa, mag-aaral, o salita","privTag":"Privacy sa Disenyo","privH2":"Ganap na visibility para sa mga guro. Walang panganib sa data para sa mga paaralan.","privSub":"Wala kaming kinokolektang PII ng mag-aaral. Hindi dahil magaling namin itong itinatago, kundi dahil hindi namin ito kinokolekta kailanman. Ang arkitektura mismo ang compliance.","privPoint1":"Walang account ng mag-aaral. Walang email, walang password, walang ID.","privPoint2":"Walang personal na datos na umaalis sa paaralan. Ang mga paghahanap ay tinatatakan lang ng pangalan sa roster.","privPoint3":"Gumagana ang classroom code tuwing oras ng paaralan lamang. Nako-configure bawat paaralan.","privPoint4":"COPPA, GDPR-K, at batas ng Israel sa privacy ng mag-aaral, lahat komportableng natutugunan.","privKahoot":"Sumasali nang kasingdali ng quiz game sa silid-aralan. Ginawa para sa pag-unawa ng salita at visibility ng guro.","priceTag":"Presyo","priceH2":"Taunang presyo, ayon sa laki ng paaralan.","priceSub":"Self-serve sa pamamagitan ng Stripe. Walang sales call, walang demo, walang purchase order.","priceSmallName":"Schools","priceSmallAmount":"$69","priceSmallStudents":"Hanggang 100 mag-aaral","priceLargeName":"Schools Large","priceLargeAmount":"$149","priceLargeStudents":"Hanggang 500 mag-aaral","priceIncludesTitle":"Kasama sa parehong plano","priceIncludes":["Walang limitasyong silid-aralan","Buong dashboard ng guro","Roster para sa pagpili ng mag-aaral","Classroom code na may takdang oras","UI ng mag-aaral sa 30+ na wika","Simpleng taunang order, mababa sa procurement threshold","Pagsasanay sa pagbigkas: pakinggan at bigkasin ang anumang salita"],"priceCta":"Tingnan ang presyo at mag-order","priceLarger":"Kailangan ng higit sa 1,000 mag-aaral? Makipag-ugnayan sa amin tungkol sa mga plano ng distrito.","faqTag":"FAQ","faqH2":"Mga tanong ng mga punong-guro bago sila mag-order.","faq":[{"q":"Kung walang login, paano ko malalaman kung sinong mag-aaral ang naghanap ng ano?","a":"Naglo-load nang maaga ang guro ng roster ng mga unang pangalan sa dashboard. Kapag binisita ng mag-aaral ang URL ng silid-aralan, pinipili nila ang pangalan nila sa isang click. Bawat paghahanap ay tinatatakan sa pangalang iyon. Walang email, walang password, walang PII na kinokolekta."},{"q":"Ligtas ba ito sa COPPA? Makakatanggap ba ako ng reklamo ng magulang?","a":"Oo. Wala talagang kinokolektang personal na impormasyon ng mag-aaral ang Gadit. Walang paggawa ng account, walang pagkolekta ng email, walang kaarawan, walang ID. Walang datos na maaaring gamitin nang mali. Ang arkitektura ay komportableng lumalampas sa COPPA, GDPR-K, at batas ng Israel sa privacy ng mag-aaral."},{"q":"Kailangan ba ng mga mag-aaral na mag-install ng app?","a":"Hindi. Gumagana ang anumang browser. Binibisita ng mga mag-aaral ang gadit.app/c/CODE sa computer ng silid-aralan (o anumang device na may browser). Walang app store, walang pakikialam ng IT."},{"q":"Kailangan ba nito ng IT o SSO setup?","a":"Hindi. Gumagawa ang punong-guro o grade coordinator ng silid-aralan sa loob ng dalawang minuto at ibinabahagi ang code sa mga guro. Hindi kasangkot ang IT sa anumang hakbang."},{"q":"Ano ba talaga ang ipinapakita ng dashboard?","a":"Ang mga paghahanap ng salita ng bawat mag-aaral na may timestamp, ang mga salitang pinakahinanap ng klase ngayong linggo, at mga padron ng paulit-ulit na paghahanap na tanda ng marupok na pag-unawa. Nakikita mo ang tunay na datos ng pag-unawa sa silid-aralan, hindi malabong sukatan ng engagement."},{"q":"Puwede bang gamitin ito sa labas ng oras ng klase?","a":"Ang classroom code ay nakatali sa aktibong oras ng paaralan (default na Linggo hanggang Huwebes 7:30 hanggang 15:00, nako-configure). Sa labas ng oras na iyon, nagbibigay ang code ng basic na access sa diksyunaryo pero walang karagdagang feature. Pinipigilan nito ang code ng paaralan na maging libreng 24/7 na kapalit ng Family tier."},{"q":"Paano kung mayroong higit sa 500 mag-aaral ang paaralan ko?","a":"Pumili ayon sa bilang ng mag-aaral: hanggang 100 mag-aaral ay $97/buwan, hanggang 500 ay $297/buwan, at hanggang 1,000 ay $497/buwan. Para sa higit sa 1,000 mag-aaral o mga distritong maraming lokasyon, makipag-ugnayan sa amin para sa custom na plano."},{"q":"Paano ipinapaliwanag ng Gadit ang isang salita? Pagsasalin lang ba ito?","a":"Hindi diksyunaryo ng pagsasalin ang Gadit. Nagbibigay-kahulugan at nagpapaliwanag ng mga salita ang Gadit. Para sa bawat salita nagbibigay ito ng bawat kahulugan, tatlong halimbawang pangungusap bawat kahulugan, etimolohiya, at isang context-aware na mode kung saan ini-paste ng mga mag-aaral ang pangungusap at pinipili ng Gadit ang tamang kahulugan. Ang UI ng mag-aaral ay nasa wika nila, pero pareho ang lalim ng paliwanag sa bawat wika ng UI."}],"finalH2":"Tigilan ang tahimik na pagkabigo.","finalBody":"Bigyan ang mga guro mo ng tool para makita nang eksakto kung ano ang hindi naiintindihan ng klase nila. Ang pagsisimula ay tumatagal ng 2 minuto. Walang IT, walang procurement, walang parent forms.","finalCta":"Tingnan ang presyo at mag-order","finalNote":"Magbayad taunan sa pamamagitan ng bank transfer laban sa tax invoice. Walang tender na kailangan.","mockupRoster":"Roster ng klase, 22 mag-aaral","mockupSearches":"Pinakahinanap ngayong linggo","mockupStudent1":"Naghanap si Maya ng photosynthesis","mockupStudent2":"Naghanap si Yossi ng mitochondria ×2","mockupStudent3":"Naghanap si Noa ng democracy","mockupWordExample":"photosynthesis","mockupExampleDef":"Ang proseso kung saan ginagamit ng mga berdeng halaman ang sikat ng araw para gawing pagkain ang tubig at carbon dioxide.","mockupExampleEx":"Ang photosynthesis ay pangunahing nangyayari sa mga dahon ng halaman."},
  "hu": {"heroH1":"Minden diák megérti a tananyagot.","heroSub":"Bármely nehéz szó, 30+ nyelv bármelyikén, azonnal elmagyarázva.","heroCta":"Árak és rendelés megtekintése","heroPriceChip":"97 $ / hótól","heroTrust":"Önkiszolgáló. Bármikor lemondható.","probTag":"A probléma","probH2":"Az a diák, aki egy szót nem ért, a mondatot sem érti.","probBody1":"A diák lemarad egy szóról. Nem teszi fel a kezét. Azt hiszi, nagyjából érti. A tanár továbblép. Öt szóval később a bekezdés elhomályosul. Öt bekezdéssel később a tananyag elveszett.","probBody2":"A lemaradó diákok többsége nem buta. Egy csomó szó halmozódott fel bennük, amelyeket sosem értettek meg teljesen. Minden új szó, amely ezekre épül, tovább növeli a szakadékot. Az ok láthatatlan a tanár számára.","probCallout1Title":"A halmozódó szakadék","probCallout1Body":"A meg nem tanult szavak láthatatlan gátat emelnek minden jövőbeli tananyag elé.","probCallout2Title":"Az időveszteség","probCallout2Body":"A tanárok óránként 5-10 percet veszítenek definíciókra.","probCallout3Title":"A csendes lemorzsolódás","probCallout3Body":"A diákok kikapcsolnak, amikor egy bekezdésben túl sok az ismeretlen szó.","howTag":"Hogyan működik","howH2":"Beállítás 2 perc alatt. IT nélkül.","howSub":"Ugyanaz a súrlódásmentes osztálytermi kódos minta, amely a kvízjátékoknál már működik, most a szövegértésre építve.","howStep1Title":"Hozz létre egy osztálytermi kódot","howStep1Body":"Az igazgató vagy a koordinátor létrehoz egy osztálytermet az irányítópulton. A rendszer generál egy 6 karakteres kódot. Nyomtasd ki matricára az osztálytermi számítógépre.","howStep2Title":"A diákok csatlakoznak, fiók nélkül","howStep2Body":"A diákok megnyitják a gadit.app/c/KÓD címet bármely böngészőben, egy kattintással kiválasztják a nevüket a névsorból, és elkezdenek szavakat beírni. Nincs alkalmazástelepítés, nincs e-mail, nincs jelszó.","howStep3Title":"A tanárok látják, mire keresett rá az osztály","howStep3Body":"Minden keresés bekerül az irányítópultba, a diák nevével megjelölve. Látod, mit keresett meg minden diák, mikor, és mely szavakkal küzdött az osztály közösen.","teacherTag":"A tanári nézet","teacherH2":"Az irányítópult, amit régóta kérsz.","teacherSub":"Nem homályos elköteleződési mutatók. Konkrét szavak, konkrét diákok, konkrét pillanatok.","teacherB1":"Diákonkénti keresési előzmények időbélyegekkel","teacherB2":"Az osztály által legtöbbet keresett szavak ezen a héten","teacherB3":"Ismételt keresések, amelyek törékeny megértést jeleznek","teacherB4":"Szűrhető dátum, diák vagy szó szerint","privTag":"Adatvédelem a tervezésből","privH2":"Teljes átláthatóság a tanároknak. Nulla adatkockázat az iskoláknak.","privSub":"Nem gyűjtünk diákokra vonatkozó személyes adatot. Nem azért, mert ügyesen elrejtjük, hanem mert sosem gyűjtjük. Maga az architektúra a megfelelőség.","privPoint1":"Nincsenek diákfiókok. Nincsenek e-mailek, jelszavak, azonosítók.","privPoint2":"Semmilyen személyes adat nem hagyja el az iskolát. A kereséseket csak a névsorban szereplő névvel jelöljük.","privPoint3":"Az osztálytermi kódok csak tanítási időben működnek. Iskolánként állítható.","privPoint4":"A COPPA, a GDPR-K és az izraeli diák-adatvédelmi törvény mindegyike kényelmesen teljesül.","privKahoot":"Olyan könnyen csatlakozik, mint egy osztálytermi kvízjáték. A szövegértésre és a tanári átláthatóságra építve.","priceTag":"Árazás","priceH2":"Éves árazás, iskolaméret szerint.","priceSub":"Önkiszolgáló, Stripe-on keresztül. Nincsenek értékesítési hívások, nincsenek bemutatók, nincsenek megrendelőlapok.","priceSmallName":"Iskolák","priceSmallAmount":"69 $","priceSmallStudents":"Akár 100 diák","priceLargeName":"Iskolák Nagy","priceLargeAmount":"149 $","priceLargeStudents":"Akár 500 diák","priceIncludesTitle":"Mindkét csomag tartalmazza","priceIncludes":["Korlátlan számú osztályterem","Teljes tanári irányítópult","Diákválasztó névsor","Időhöz kötött osztálytermi kódok","Diákfelület 30+ nyelven","Egyszerű éves megrendelés, a beszerzési küszöb alatt","Kiejtésgyakorlás: hallj és mondj ki bármely szót"],"priceCta":"Árak és rendelés megtekintése","priceLarger":"Több mint 1000 diákra van szükséged? Vedd fel velünk a kapcsolatot a körzeti csomagokról.","faqTag":"GYIK","faqH2":"Kérdések, amelyeket az igazgatók feltesznek, mielőtt rendelnek.","faq":[{"q":"Ha nincsenek bejelentkezések, honnan tudom, melyik diák mire keresett rá?","a":"A tanár előre feltölt egy keresztnév-névsort az irányítópulton. Amikor egy diák megnyitja az osztálytermi címet, egy kattintással kiválasztja a nevét. Minden keresés ehhez a névhez kötődik. Nem gyűjtünk e-mailt, jelszót vagy személyes adatot."},{"q":"COPPA-biztos ez? Kapok majd szülői panaszt?","a":"Igen. A Gadit egyáltalán nem gyűjt diákokra vonatkozó személyes adatot. Nincs fiókregisztráció, nincs e-mail-gyűjtés, nincsenek születésnapok, nincsenek azonosítók. Nincs adat, amivel vissza lehetne élni. Az architektúra kényelmesen túlteljesíti a COPPA, a GDPR-K és az izraeli diák-adatvédelmi törvény előírásait."},{"q":"Kell a diákoknak alkalmazást telepíteniük?","a":"Nem. Bármely böngésző működik. A diákok megnyitják a gadit.app/c/KÓD címet az osztálytermi számítógépen (vagy bármely böngészővel rendelkező eszközön). Nincs alkalmazásbolt, nincs IT-bevonás."},{"q":"Szükség van IT-re vagy SSO-beállításra?","a":"Nem. Egy igazgató vagy évfolyam-koordinátor két perc alatt létrehozza az osztálytermet, és megosztja a kódot a tanárokkal. Az IT egyetlen lépésbe sem kerül bevonásra."},{"q":"Mit mutat valójában az irányítópult?","a":"Minden diák szókereséseit időbélyegekkel, azokat a szavakat, amelyekre az osztály a legtöbbet keresett ezen a héten, és az ismételt keresések mintázatait, amelyek törékeny megértést jeleznek. A valódi osztálytermi szövegértési adatokat látod, nem homályos elköteleződési mutatókat."},{"q":"Használható a tanítási időn kívül?","a":"Az osztálytermi kódok az iskola aktív óráihoz kötöttek (alapértelmezetten vasárnaptól csütörtökig 7:30 és 15:00 között, állítható). Ezen az időszakon kívül a kód alapvető szótári hozzáférést ad, de bővített funkciókat nem. Ez megakadályozza, hogy az iskolai kód ingyenes, napi 24 órás helyettesítője legyen a Család csomagnak."},{"q":"Mi van, ha az iskolámnak több mint 500 diákja van?","a":"Válassz diákszám szerint: akár 100 diák 97 $/hó, akár 500 diák 297 $/hó, akár 1000 diák 497 $/hó. Több mint 1000 diák vagy több telephelyű körzetek esetén vedd fel velünk a kapcsolatot egyedi csomagért."},{"q":"Hogyan magyaráz el a Gadit egy szót? Ez csak egy fordítás?","a":"A Gadit nem fordítószótár. A Gadit definiál és megmagyaráz szavakat. Minden szóhoz megadja az összes jelentést, jelentésenként három példamondatot, az etimológiát, és egy kontextusérzékeny módot, ahol a diákok beillesztik a mondatot, és a Gadit kiválasztja a helyes jelentést. A diák felülete a saját nyelvén van, de a magyarázat mélysége minden nyelven ugyanaz."}],"finalH2":"Állítsd meg a csendes kudarcot.","finalBody":"Add a tanáraidnak azt az eszközt, amellyel pontosan látják, mit nem ért az osztályuk. A kezdés 2 percet vesz igénybe. Nincs IT, nincs beszerzés, nincsenek szülői űrlapok.","finalCta":"Árak és rendelés megtekintése","finalNote":"Fizess évente banki átutalással, adószámla ellenében. Nincs szükség pályázatra.","mockupRoster":"Osztálynévsor, 22 diák","mockupSearches":"Legtöbbet keresett ezen a héten","mockupStudent1":"Maya rákeresett: fotoszintézis","mockupStudent2":"Yossi rákeresett: mitokondrium ×2","mockupStudent3":"Noa rákeresett: demokrácia","mockupWordExample":"fotoszintézis","mockupExampleDef":"Az a folyamat, amelynek során a zöld növények napfény segítségével vizet és szén-dioxidot alakítanak táplálékká.","mockupExampleEx":"A fotoszintézis többnyire a növény leveleiben zajlik."},
  "ko": {"heroH1":"모든 학생이 수업을 이해합니다.","heroSub":"어떤 어려운 단어든, 30+ 언어 중 어느 것으로든, 그 자리에서 설명됩니다.","heroCta":"요금 보기 및 주문","heroPriceChip":"월 $97부터","heroTrust":"셀프 서비스. 언제든 해지.","probTag":"문제","probH2":"단어 하나를 이해하지 못하는 학생은 그 문장을 이해할 수 없습니다.","probBody1":"한 학생이 단어 하나를 놓칩니다. 손을 들지 않습니다. 대충 이해했다고 생각합니다. 교사는 진도를 나갑니다. 다섯 단어 뒤, 문단이 흐릿해집니다. 다섯 문단 뒤, 수업을 놓칩니다.","probBody2":"뒤처지는 학생들 대부분은 똑똑하지 않은 것이 아닙니다. 끝내 온전히 이해하지 못한 단어들이 쌓여 있는 것입니다. 그 위에 쌓이는 새 단어 하나하나가 격차를 더 벌립니다. 그 원인은 교사에게 보이지 않습니다.","probCallout1Title":"누적되는 격차","probCallout1Body":"익히지 못한 단어들이 앞으로의 모든 수업에 보이지 않는 장벽을 쌓습니다.","probCallout2Title":"시간 낭비","probCallout2Body":"교사는 수업마다 단어 뜻풀이에 5~10분을 잃습니다.","probCallout3Title":"조용한 이탈","probCallout3Body":"문단에 모르는 단어가 너무 많으면 학생은 주의를 놓아 버립니다.","howTag":"이렇게 작동합니다","howH2":"2분이면 준비 완료. IT 부서 필요 없음.","howSub":"퀴즈 게임에서 이미 잘 작동하는, 마찰 없는 그 교실 코드 방식을 단어 이해에 맞게 만들었습니다.","howStep1Title":"교실 코드를 만드세요","howStep1Body":"교장이나 담당자가 대시보드에서 교실을 만듭니다. 시스템이 6자리 코드를 생성합니다. 교실 컴퓨터에 붙일 스티커로 인쇄하세요.","howStep2Title":"학생은 계정 없이 참여합니다","howStep2Body":"학생이 어떤 브라우저에서든 gadit.app/c/CODE에 접속해 명단에서 자기 이름을 고르고(클릭 한 번), 단어를 입력하기 시작합니다. 앱 설치도, 이메일도, 비밀번호도 없습니다.","howStep3Title":"교사는 학급이 무엇을 검색했는지 봅니다","howStep3Body":"모든 검색이 학생 이름과 함께 대시보드에 담깁니다. 학생마다 무엇을, 언제 찾아봤는지, 그리고 학급 전체가 함께 어려워한 단어가 무엇인지 볼 수 있습니다.","teacherTag":"교사 화면","teacherH2":"그동안 원하셨던 바로 그 대시보드.","teacherSub":"막연한 참여 지표가 아닙니다. 구체적인 단어, 구체적인 학생, 구체적인 순간입니다.","teacherB1":"학생별 검색 기록과 시각","teacherB2":"이번 주 학급 전체에서 가장 많이 검색된 단어","teacherB3":"약한 이해를 알려 주는 반복 검색","teacherB4":"날짜, 학생, 단어별로 필터링 가능","privTag":"설계부터 지켜지는 개인정보","privH2":"교사에게는 완전한 가시성. 학교에는 제로 데이터 위험.","privSub":"우리는 학생 개인정보를 수집하지 않습니다. 잘 숨겨서가 아니라, 애초에 수집하지 않기 때문입니다. 그 구조 자체가 규정 준수입니다.","privPoint1":"학생 계정 없음. 이메일도, 비밀번호도, 아이디도 없습니다.","privPoint2":"개인 데이터가 학교 밖으로 나가지 않습니다. 검색은 명단의 이름으로만 표시됩니다.","privPoint3":"교실 코드는 학교 수업 시간에만 작동합니다. 학교별로 설정 가능합니다.","privPoint4":"COPPA, GDPR-K, 이스라엘 학생 개인정보법 모두 넉넉히 충족합니다.","privKahoot":"교실 퀴즈 게임만큼 쉽게 참여합니다. 단어 이해와 교사 가시성을 위해 만들어졌습니다.","priceTag":"요금","priceH2":"학교 규모별 연간 요금.","priceSub":"Stripe를 통한 셀프 서비스. 영업 통화도, 데모도, 구매 발주도 없습니다.","priceSmallName":"Schools","priceSmallAmount":"$69","priceSmallStudents":"최대 100명 학생","priceLargeName":"Schools Large","priceLargeAmount":"$149","priceLargeStudents":"최대 500명 학생","priceIncludesTitle":"두 플랜 모두 포함","priceIncludes":["무제한 교실","전체 교사 대시보드","학생 이름 선택 명단","시간 제한 교실 코드","30+ 언어의 학생 화면","구매 한도 아래의 간단한 연간 주문","발음 연습: 어떤 단어든 듣고 말하기"],"priceCta":"요금 보기 및 주문","priceLarger":"학생이 1,000명을 넘나요? 지역 단위 플랜에 대해 문의해 주세요.","faqTag":"자주 묻는 질문","faqH2":"교장들이 주문 전에 묻는 질문.","faq":[{"q":"로그인이 없다면, 어느 학생이 무엇을 검색했는지 어떻게 알 수 있나요?","a":"교사가 대시보드에 이름 명단을 미리 등록합니다. 학생이 교실 URL에 접속하면 클릭 한 번으로 자기 이름을 고릅니다. 모든 검색이 그 이름에 연결됩니다. 이메일도, 비밀번호도, 어떤 개인정보도 수집하지 않습니다."},{"q":"COPPA를 준수하나요? 학부모 항의가 들어오지는 않을까요?","a":"네. Gadit은 학생 개인정보를 전혀 수집하지 않습니다. 계정 생성도, 이메일 수집도, 생일도, 아이디도 없습니다. 오용될 데이터 자체가 없습니다. 이 구조는 COPPA, GDPR-K, 이스라엘 학생 개인정보법을 넉넉히 넘어섭니다."},{"q":"학생이 앱을 설치해야 하나요?","a":"아니요. 어떤 브라우저든 됩니다. 학생은 교실 컴퓨터(또는 브라우저가 있는 어떤 기기든)에서 gadit.app/c/CODE에 접속합니다. 앱 스토어도, IT 부서 개입도 필요 없습니다."},{"q":"IT나 SSO 설정이 필요한가요?","a":"아니요. 교장이나 학년 담당자가 2분 만에 교실을 만들고 교사들과 코드를 공유합니다. IT 부서는 어느 단계에서도 관여하지 않습니다."},{"q":"대시보드는 실제로 무엇을 보여 주나요?","a":"각 학생의 단어 검색과 시각, 이번 주 학급이 가장 많이 검색한 단어, 그리고 약한 이해를 알려 주는 반복 검색 패턴입니다. 막연한 참여 지표가 아니라 실제 교실 이해도 데이터를 보게 됩니다."},{"q":"수업 시간 외에도 사용할 수 있나요?","a":"교실 코드는 학교의 활동 시간(기본값 일요일~목요일 7:30~15:00, 설정 가능)에 묶여 있습니다. 그 시간 외에는 코드로 기본 사전 기능은 쓸 수 있지만 확장 기능은 쓸 수 없습니다. 이렇게 해서 학교 코드가 패밀리 요금제를 대체하는 무료 24시간 도구가 되지 않도록 막습니다."},{"q":"우리 학교 학생이 500명을 넘으면 어떻게 하나요?","a":"학생 수에 따라 고르세요. 최대 100명은 월 $97, 최대 500명은 월 $297, 최대 1,000명은 월 $497입니다. 학생이 1,000명을 넘거나 여러 캠퍼스가 있는 경우, 맞춤 플랜을 위해 문의해 주세요."},{"q":"Gadit은 단어를 어떻게 설명하나요? 단순한 번역인가요?","a":"Gadit은 번역 사전이 아닙니다. Gadit은 단어를 정의하고 설명합니다. 각 단어마다 모든 의미, 의미당 예문 세 개, 어원, 그리고 학생이 문장을 붙여넣으면 Gadit이 맞는 의미를 골라 주는 문맥 인식 모드를 제공합니다. 학생 화면은 학생의 언어로 표시되지만, 설명의 깊이는 모든 화면 언어에서 동일합니다."}],"finalH2":"조용한 실패의 고리를 끊으세요.","finalBody":"학급이 정확히 무엇을 이해하지 못하는지 볼 수 있는 도구를 교사에게 주세요. 시작하는 데 2분이면 됩니다. IT도, 구매 절차도, 학부모 동의서도 필요 없습니다.","finalCta":"요금 보기 및 주문","finalNote":"세금계산서를 발행하고 계좌이체로 연간 결제하세요. 입찰 절차가 필요 없습니다.","mockupRoster":"학급 명단, 학생 22명","mockupSearches":"이번 주 가장 많이 검색된 단어","mockupStudent1":"마야가 광합성을 검색했습니다","mockupStudent2":"요시가 미토콘드리아를 검색했습니다 ×2","mockupStudent3":"노아가 민주주의를 검색했습니다","mockupWordExample":"광합성","mockupExampleDef":"녹색 식물이 햇빛을 이용해 물과 이산화탄소를 양분으로 바꾸는 과정.","mockupExampleEx":"광합성은 주로 식물의 잎에서 일어납니다."},
  "sw": {"heroH1":"Kila mwanafunzi anaelewa somo.","heroSub":"Neno lolote gumu, kwa lugha yoyote kati ya 30+, likifafanuliwa papo hapo.","heroCta":"Angalia bei na uagize","heroPriceChip":"Kuanzia $97 / mwezi","heroTrust":"Jihudumie mwenyewe. Ghairi wakati wowote.","probTag":"Tatizo","probH2":"Mwanafunzi asiyeelewa neno hawezi kuelewa sentensi.","probBody1":"Mwanafunzi anakosa neno moja. Hanyoshi mkono. Anadhani anaelewa kwa takribani. Mwalimu anaendelea. Maneno matano baadaye, aya inakuwa haieleweki. Aya tano baadaye, somo limepotea.","probBody2":"Wanafunzi wengi wanaobaki nyuma si wajinga. Wana rundo la maneno ambayo hawakuyaelewa kamwe kikamilifu. Kila neno jipya lililojengwa juu ya hayo huongeza pengo. Chanzo hakionekani kwa mwalimu.","probCallout1Title":"Pengo linaloongezeka","probCallout1Body":"Maneno yasiyojifunzwa hujenga kizuizi kisichoonekana kwa kila somo la baadaye.","probCallout2Title":"Kupotea kwa muda","probCallout2Body":"Walimu hupoteza dakika 5 hadi 10 kwa kila somo kwa ufafanuzi.","probCallout3Title":"Kuacha kimyakimya","probCallout3Body":"Wanafunzi huzimika akili aya inapokuwa na maneno mengi mno yasiyojulikana.","howTag":"Jinsi Inavyofanya Kazi","howH2":"Sanidi kwa dakika 2. Bila IT.","howSub":"Mfumo uleule wa msimbo wa darasa usio na msuguano ambao tayari unafanya kazi kwa michezo ya maswali, umejengwa kwa ajili ya uelewa wa maneno badala yake.","howStep1Title":"Tengeneza msimbo wa darasa","howStep1Body":"Mkuu wa shule au mratibu hutengeneza darasa katika dashibodi. Mfumo hutengeneza msimbo wa herufi 6. Uchapishe kwenye kibandiko cha kompyuta ya darasa.","howStep2Title":"Wanafunzi hujiunga, bila akaunti","howStep2Body":"Wanafunzi hutembelea gadit.app/c/CODE katika kivinjari chochote, huchagua jina lao kutoka kwenye orodha (mbofyo mmoja), na kuanza kuandika maneno. Hakuna usakinishaji wa programu, hakuna barua pepe, hakuna nywila.","howStep3Title":"Walimu huona darasa lilichotafuta","howStep3Body":"Kila utafutaji huingia katika dashibodi, ukiwa na alama ya jina la mwanafunzi. Unaona kila mwanafunzi alichotafuta, lini, na maneno yapi darasa lilihangaika nayo kwa pamoja.","teacherTag":"Mwonekano wa Mwalimu","teacherH2":"Dashibodi uliyokuwa ukiiomba.","teacherSub":"Si vipimo visivyo wazi vya ushiriki. Maneno mahususi, wanafunzi mahususi, nyakati mahususi.","teacherB1":"Historia ya utafutaji ya kila mwanafunzi ikiwa na alama za muda","teacherB2":"Maneno yaliyotafutwa zaidi na darasa zima wiki hii","teacherB3":"Utafutaji unaorudiwa unaoashiria uelewa dhaifu","teacherB4":"Inayoweza kuchujwa kwa tarehe, mwanafunzi, au neno","privTag":"Faragha kwa Muundo","privH2":"Uwazi kamili kwa walimu. Hatari sifuri ya data kwa shule.","privSub":"Hatukusanyi taarifa yoyote binafsi ya mwanafunzi. Si kwa sababu tunaificha vizuri, ni kwa sababu hatuikusanyi kamwe. Muundo wenyewe ndio uzingatiaji.","privPoint1":"Hakuna akaunti za wanafunzi. Hakuna barua pepe, hakuna nywila, hakuna vitambulisho.","privPoint2":"Hakuna data binafsi inayotoka shuleni. Utafutaji huwekwa alama kwa jina la orodha pekee.","privPoint3":"Misimbo ya darasa hufanya kazi tu wakati wa saa za shule. Inayoweza kusanidiwa kwa kila shule.","privPoint4":"COPPA, GDPR-K, na sheria ya faragha ya mwanafunzi ya Israeli zote zinashughulikiwa vizuri.","privKahoot":"Hujiunga kwa urahisi kama mchezo wa maswali wa darasani. Umejengwa kwa ajili ya uelewa wa maneno na uwazi kwa mwalimu.","priceTag":"Bei","priceH2":"Bei ya kila mwaka, kulingana na ukubwa wa shule.","priceSub":"Jihudumie mwenyewe kupitia Stripe. Hakuna simu za mauzo, hakuna maonyesho, hakuna maagizo ya ununuzi.","priceSmallName":"Shule","priceSmallAmount":"$69","priceSmallStudents":"Hadi wanafunzi 100","priceLargeName":"Shule Kubwa","priceLargeAmount":"$149","priceLargeStudents":"Hadi wanafunzi 500","priceIncludesTitle":"Mipango yote miwili inajumuisha","priceIncludes":["Madarasa yasiyo na kikomo","Dashibodi kamili ya mwalimu","Orodha ya kuchagua wanafunzi","Misimbo ya darasa iliyofungiwa muda","Kiolesura cha mwanafunzi katika lugha 30+","Agizo rahisi la kila mwaka, chini ya kiwango cha manunuzi","Mazoezi ya matamshi: sikia na useme neno lolote"],"priceCta":"Angalia bei na uagize","priceLarger":"Unahitaji zaidi ya wanafunzi 1,000? Wasiliana nasi kuhusu mipango ya wilaya.","faqTag":"Maswali Yanayoulizwa Mara kwa Mara","faqH2":"Maswali ambayo wakuu wa shule huuliza kabla ya kuagiza.","faq":[{"q":"Ikiwa hakuna kuingia kwa akaunti, nitajuaje ni mwanafunzi yupi alitafuta nini?","a":"Mwalimu hupakia mapema orodha ya majina ya kwanza katika dashibodi. Mwanafunzi anapotembelea URL ya darasa, huchagua jina lake kwa mbofyo mmoja. Kila utafutaji huwekwa alama kwa jina hilo. Hakuna barua pepe, hakuna nywila, hakuna taarifa binafsi inayokusanywa."},{"q":"Je, hii ni salama kwa COPPA? Nitapata malalamiko ya mzazi?","a":"Ndiyo. Gadit haikusanyi taarifa yoyote binafsi ya mwanafunzi kabisa. Hakuna kutengeneza akaunti, hakuna ukusanyaji wa barua pepe, hakuna tarehe za kuzaliwa, hakuna vitambulisho. Hakuna data ya kutumiwa vibaya. Muundo huu unazidi kwa raha COPPA, GDPR-K, na sheria ya faragha ya mwanafunzi ya Israeli."},{"q":"Je, wanafunzi wanahitaji kusakinisha programu?","a":"Hapana. Kivinjari chochote hufanya kazi. Wanafunzi hutembelea gadit.app/c/CODE kwenye kompyuta ya darasa (au kifaa chochote chenye kivinjari). Hakuna duka la programu, hakuna ushiriki wa IT."},{"q":"Je, hii inahitaji usanidi wa IT au SSO?","a":"Hapana. Mkuu wa shule au mratibu wa daraja hutengeneza darasa kwa dakika mbili na kushiriki msimbo na walimu. IT haihusiki katika hatua yoyote."},{"q":"Dashibodi inaonyesha nini hasa?","a":"Utafutaji wa maneno wa kila mwanafunzi ukiwa na alama za muda, maneno ambayo darasa lilitafuta zaidi wiki hii, na mifumo ya utafutaji unaorudiwa unaoashiria uelewa dhaifu. Unaona data halisi ya uelewa wa darasa, si vipimo visivyo wazi vya ushiriki."},{"q":"Je, inaweza kutumika nje ya saa za darasa?","a":"Misimbo ya darasa imefungwa kwa saa za shule zilizo hai (chaguo-msingi Jumapili hadi Alhamisi 7:30 hadi 15:00, inayoweza kusanidiwa). Nje ya kipindi hicho msimbo hutoa ufikiaji wa kamusi wa msingi lakini bila vipengele vilivyopanuliwa. Hili linazuia msimbo wa shule usiwe mbadala wa bure wa saa 24 kwa siku 7 kwa wiki wa kiwango cha Familia."},{"q":"Je, ikiwa shule yangu ina zaidi ya wanafunzi 500?","a":"Chagua kwa idadi ya wanafunzi: hadi wanafunzi 100 ni $97/mwezi, hadi 500 ni $297/mwezi, na hadi 1,000 ni $497/mwezi. Kwa zaidi ya wanafunzi 1,000 au wilaya za maeneo mengi, wasiliana nasi kwa mpango maalum."},{"q":"Je, Gadit hufafanuaje neno? Ni tafsiri tu?","a":"Gadit si kamusi ya tafsiri. Gadit hufafanua na kueleza maneno. Kwa kila neno hutoa kila maana, sentensi tatu za mfano kwa kila maana, etimolojia, na hali inayozingatia muktadha ambapo wanafunzi hubandika sentensi na Gadit huchagua maana sahihi. Kiolesura cha mwanafunzi kiko katika lugha yake, lakini kina cha ufafanuzi ni kilekile katika kila lugha ya kiolesura."}],"finalH2":"Simamisha hali ya kushindwa kimyakimya.","finalBody":"Wape walimu wako zana ya kuona hasa darasa lao lisilochoelewa. Kuanza kunachukua dakika 2. Hakuna IT, hakuna manunuzi, hakuna fomu za wazazi.","finalCta":"Angalia bei na uagize","finalNote":"Lipa kila mwaka kwa uhamisho wa benki dhidi ya ankara ya kodi. Hakuna zabuni inayohitajika.","mockupRoster":"Orodha ya darasa, wanafunzi 22","mockupSearches":"Yaliyotafutwa zaidi wiki hii","mockupStudent1":"Maya alitafuta usanisinuru","mockupStudent2":"Yossi alitafuta mitochondria ×2","mockupStudent3":"Noa alitafuta demokrasia","mockupWordExample":"usanisinuru","mockupExampleDef":"Mchakato ambao mimea ya kijani hutumia mwanga wa jua kubadilisha maji na hewa ya ukaa kuwa chakula.","mockupExampleEx":"Usanisinuru hufanyika zaidi katika majani ya mmea."},
  "th": {"heroH1":"นักเรียนทุกคนเข้าใจบทเรียน","heroSub":"คำยากใดก็ตาม ในภาษาใดก็ได้จาก 30+ ภาษา อธิบายได้ทันที","heroCta":"ดูราคาและสั่งซื้อ","heroPriceChip":"เริ่มต้น $97 / เดือน","heroTrust":"บริการด้วยตัวเอง ยกเลิกได้ทุกเมื่อ","probTag":"ปัญหา","probH2":"นักเรียนที่ไม่เข้าใจคำหนึ่ง ก็เข้าใจทั้งประโยคไม่ได้","probBody1":"นักเรียนพลาดไปคำหนึ่ง เขาไม่ยกมือ เขาคิดว่าพอเข้าใจคร่าวๆ ครูสอนต่อไป ผ่านไปห้าคำ ย่อหน้าก็เริ่มพร่าเลือน ผ่านไปห้าย่อหน้า บทเรียนก็หายไปหมด","probBody2":"นักเรียนส่วนใหญ่ที่เรียนตามไม่ทันไม่ได้โง่ พวกเขามีกองคำที่ไม่เคยเข้าใจอย่างเต็มที่ ทุกคำใหม่ที่สร้างบนคำเหล่านั้นยิ่งขยายช่องว่างให้กว้างขึ้น สาเหตุนี้ครูมองไม่เห็น","probCallout1Title":"ช่องว่างที่ทบต้น","probCallout1Body":"คำที่ไม่ได้เรียนรู้สร้างกำแพงที่มองไม่เห็นขวางทุกบทเรียนในอนาคต","probCallout2Title":"เวลาที่สูญเสียไป","probCallout2Body":"ครูเสียเวลา 5 ถึง 10 นาทีต่อคาบไปกับการอธิบายความหมายของคำ","probCallout3Title":"การหลุดออกอย่างเงียบๆ","probCallout3Body":"นักเรียนเหม่อลอยเมื่อย่อหน้ามีคำที่ไม่รู้จักมากเกินไป","howTag":"มันทำงานอย่างไร","howH2":"ตั้งค่าใน 2 นาที ไม่ต้องพึ่งฝ่าย IT","howSub":"รูปแบบรหัสห้องเรียนที่ไร้แรงเสียดทานแบบเดียวกับที่ใช้ได้ผลกับเกมทดสอบอยู่แล้ว สร้างขึ้นเพื่อความเข้าใจคำศัพท์แทน","howStep1Title":"สร้างรหัสห้องเรียน","howStep1Body":"ผู้อำนวยการหรือผู้ประสานงานสร้างห้องเรียนในแดชบอร์ด ระบบจะสร้างรหัส 6 ตัวอักษร พิมพ์ลงสติกเกอร์ติดที่คอมพิวเตอร์ในห้องเรียน","howStep2Title":"นักเรียนเข้าร่วม ไม่ต้องมีบัญชี","howStep2Body":"นักเรียนเข้า gadit.app/c/CODE ในเบราว์เซอร์ใดก็ได้ เลือกชื่อของตัวเองจากรายชื่อ (คลิกเดียว) แล้วเริ่มพิมพ์คำ ไม่ต้องติดตั้งแอป ไม่ต้องใช้อีเมล ไม่ต้องใช้รหัสผ่าน","howStep3Title":"ครูเห็นว่าทั้งชั้นค้นหาอะไรบ้าง","howStep3Body":"ทุกการค้นหาจะปรากฏในแดชบอร์ด พร้อมชื่อของนักเรียนกำกับไว้ คุณเห็นว่านักเรียนแต่ละคนค้นหาอะไร เมื่อไร และคำไหนที่ทั้งชั้นเรียนติดขัดร่วมกัน","teacherTag":"มุมมองของครู","teacherH2":"แดชบอร์ดที่คุณเรียกร้องมาตลอด","teacherSub":"ไม่ใช่ตัวเลขการมีส่วนร่วมที่คลุมเครือ แต่เป็นคำที่เจาะจง นักเรียนที่เจาะจง ช่วงเวลาที่เจาะจง","teacherB1":"ประวัติการค้นหาของนักเรียนแต่ละคนพร้อมเวลาที่บันทึก","teacherB2":"คำที่ทั้งชั้นค้นหามากที่สุดในสัปดาห์นี้","teacherB3":"การค้นหาซ้ำที่ส่งสัญญาณว่าความเข้าใจยังเปราะบาง","teacherB4":"กรองได้ตามวันที่ นักเรียน หรือคำ","privTag":"ออกแบบมาเพื่อความเป็นส่วนตัว","privH2":"ครูเห็นได้เต็มที่ ความเสี่ยงด้านข้อมูลของโรงเรียนเป็นศูนย์","privSub":"เราไม่เก็บข้อมูลส่วนบุคคลของนักเรียนเลย ไม่ใช่เพราะเราซ่อนมันไว้อย่างแนบเนียน แต่เพราะเราไม่เคยเก็บมันเลย สถาปัตยกรรมนี้เองคือการปฏิบัติตามข้อกำหนด","privPoint1":"ไม่มีบัญชีนักเรียน ไม่มีอีเมล ไม่มีรหัสผ่าน ไม่มีเลขประจำตัว","privPoint2":"ไม่มีข้อมูลส่วนบุคคลออกจากโรงเรียน การค้นหากำกับด้วยชื่อในรายชื่อเท่านั้น","privPoint3":"รหัสห้องเรียนใช้ได้เฉพาะช่วงเวลาเรียนเท่านั้น ตั้งค่าได้ตามแต่ละโรงเรียน","privPoint4":"รองรับ COPPA, GDPR-K และกฎหมายคุ้มครองความเป็นส่วนตัวของนักเรียนอิสราเอลได้อย่างสบายๆ","privKahoot":"เข้าร่วมได้ง่ายเหมือนเกมทดสอบในห้องเรียน สร้างขึ้นเพื่อความเข้าใจคำศัพท์และการมองเห็นข้อมูลของครู","priceTag":"ราคา","priceH2":"ราคารายปี ตามขนาดโรงเรียน","priceSub":"บริการด้วยตัวเองผ่าน Stripe ไม่ต้องคุยกับฝ่ายขาย ไม่ต้องสาธิต ไม่ต้องมีใบสั่งซื้อ","priceSmallName":"โรงเรียน","priceSmallAmount":"$69","priceSmallStudents":"นักเรียนได้ถึง 100 คน","priceLargeName":"โรงเรียนขนาดใหญ่","priceLargeAmount":"$149","priceLargeStudents":"นักเรียนได้ถึง 500 คน","priceIncludesTitle":"ทั้งสองแผนรวม","priceIncludes":["ห้องเรียนไม่จำกัด","แดชบอร์ดครูเต็มรูปแบบ","รายชื่อสำหรับเลือกนักเรียน","รหัสห้องเรียนที่จำกัดเวลา","หน้าจอนักเรียนใน 30+ ภาษา","สั่งซื้อรายปีอย่างง่าย ต่ำกว่าเกณฑ์การจัดซื้อจัดจ้าง","ฝึกออกเสียง ฟังและพูดคำใดก็ได้"],"priceCta":"ดูราคาและสั่งซื้อ","priceLarger":"ต้องการมากกว่า 1,000 คนใช่ไหม ติดต่อเราเรื่องแผนสำหรับเขตพื้นที่การศึกษา","faqTag":"คำถามที่พบบ่อย","faqH2":"คำถามที่ผู้อำนวยการถามก่อนสั่งซื้อ","faq":[{"q":"ถ้าไม่มีการล็อกอิน ฉันจะรู้ได้อย่างไรว่านักเรียนคนไหนค้นหาอะไร","a":"ครูโหลดรายชื่อจริงของนักเรียนไว้ล่วงหน้าในแดชบอร์ด เมื่อนักเรียนเข้าไปที่ URL ของห้องเรียน เขาเลือกชื่อของตัวเองด้วยคลิกเดียว ทุกการค้นหาจะกำกับด้วยชื่อนั้น ไม่มีการเก็บอีเมล รหัสผ่าน หรือข้อมูลส่วนบุคคลใดๆ"},{"q":"ปลอดภัยตาม COPPA ไหม ฉันจะได้รับข้อร้องเรียนจากผู้ปกครองหรือเปล่า","a":"ปลอดภัย Gadit ไม่เก็บข้อมูลส่วนบุคคลของนักเรียนเลย ไม่มีการสร้างบัญชี ไม่เก็บอีเมล ไม่เก็บวันเกิด ไม่เก็บเลขประจำตัว จึงไม่มีข้อมูลให้นำไปใช้ในทางที่ผิด สถาปัตยกรรมนี้เกินมาตรฐาน COPPA, GDPR-K และกฎหมายคุ้มครองความเป็นส่วนตัวของนักเรียนอิสราเอลได้อย่างสบายๆ"},{"q":"นักเรียนต้องติดตั้งแอปไหม","a":"ไม่ต้อง ใช้เบราว์เซอร์ใดก็ได้ นักเรียนเข้าไปที่ gadit.app/c/CODE บนคอมพิวเตอร์ในห้องเรียน (หรืออุปกรณ์ใดก็ได้ที่มีเบราว์เซอร์) ไม่ต้องใช้แอปสโตร์ ไม่ต้องพึ่งฝ่าย IT"},{"q":"จำเป็นต้องตั้งค่า IT หรือ SSO ไหม","a":"ไม่ ผู้อำนวยการหรือหัวหน้าระดับชั้นสร้างห้องเรียนได้ในสองนาทีและแบ่งปันรหัสให้ครู ฝ่าย IT ไม่ต้องเข้ามาเกี่ยวข้องในขั้นตอนใดเลย"},{"q":"จริงๆ แล้วแดชบอร์ดแสดงอะไรบ้าง","a":"การค้นหาคำของนักเรียนแต่ละคนพร้อมเวลาที่บันทึก คำที่ทั้งชั้นค้นหามากที่สุดในสัปดาห์นี้ และรูปแบบการค้นหาซ้ำที่ส่งสัญญาณว่าความเข้าใจยังเปราะบาง คุณเห็นข้อมูลความเข้าใจในห้องเรียนจริงๆ ไม่ใช่ตัวเลขการมีส่วนร่วมที่คลุมเครือ"},{"q":"ใช้นอกเวลาเรียนได้ไหม","a":"รหัสห้องเรียนผูกกับเวลาทำการของโรงเรียน (ค่าเริ่มต้นคืออาทิตย์ถึงพฤหัสบดี 7:30 ถึง 15:00 ปรับตั้งค่าได้) นอกช่วงเวลานั้น รหัสจะให้เข้าถึงพจนานุกรมพื้นฐานได้แต่ไม่มีฟีเจอร์เพิ่มเติม เพื่อป้องกันไม่ให้รหัสของโรงเรียนกลายเป็นตัวแทนฟรีตลอด 24 ชั่วโมงแทนแผนครอบครัว"},{"q":"ถ้าโรงเรียนของฉันมีนักเรียนมากกว่า 500 คนล่ะ","a":"เลือกตามจำนวนนักเรียน นักเรียนได้ถึง 100 คนราคา $97/เดือน ได้ถึง 500 คนราคา $297/เดือน และได้ถึง 1,000 คนราคา $497/เดือน สำหรับนักเรียนมากกว่า 1,000 คนหรือเขตพื้นที่หลายสถานที่ ติดต่อเราเพื่อรับแผนที่ปรับตามความต้องการ"},{"q":"Gadit อธิบายคำอย่างไร เป็นแค่การแปลใช่ไหม","a":"Gadit ไม่ใช่พจนานุกรมแปลภาษา Gadit นิยามและอธิบายคำ สำหรับแต่ละคำ มันให้ทุกความหมาย ตัวอย่างประโยคสามประโยคต่อความหมาย รากศัพท์ และโหมดที่เข้าใจบริบท ซึ่งนักเรียนวางประโยคแล้ว Gadit เลือกความหมายที่ถูกต้องให้ หน้าจอของนักเรียนเป็นภาษาของเขา แต่ความลึกของคำอธิบายเท่ากันในทุกภาษาของหน้าจอ"}],"finalH2":"หยุดโหมดความล้มเหลวอันเงียบงัน","finalBody":"มอบเครื่องมือให้ครูของคุณเห็นอย่างชัดเจนว่าอะไรที่ทั้งชั้นเรียนไม่เข้าใจ การเริ่มต้นใช้เวลาเพียง 2 นาที ไม่ต้องพึ่งฝ่าย IT ไม่ต้องจัดซื้อจัดจ้าง ไม่ต้องมีแบบฟอร์มผู้ปกครอง","finalCta":"ดูราคาและสั่งซื้อ","finalNote":"ชำระรายปีด้วยการโอนเงินผ่านธนาคารพร้อมใบกำกับภาษี ไม่ต้องประมูล","mockupRoster":"รายชื่อชั้นเรียน นักเรียน 22 คน","mockupSearches":"ค้นหามากที่สุดในสัปดาห์นี้","mockupStudent1":"มายาค้นหา การสังเคราะห์แสง","mockupStudent2":"โยสซีค้นหา ไมโทคอนเดรีย ×2","mockupStudent3":"โนอาค้นหา ประชาธิปไตย","mockupWordExample":"การสังเคราะห์แสง","mockupExampleDef":"กระบวนการที่พืชสีเขียวใช้แสงอาทิตย์เปลี่ยนน้ำและคาร์บอนไดออกไซด์ให้เป็นอาหาร","mockupExampleEx":"การสังเคราะห์แสงเกิดขึ้นส่วนใหญ่ที่ใบของพืช"},
  "vi": {"heroH1":"Mọi học sinh đều hiểu bài.","heroSub":"Bất kỳ từ khó nào, trong bất kỳ ngôn ngữ nào của 30+ ngôn ngữ, được giải thích ngay tại chỗ.","heroCta":"Xem giá và đặt mua","heroPriceChip":"Từ $97 / tháng","heroTrust":"Tự phục vụ. Hủy bất cứ lúc nào.","probTag":"Vấn đề","probH2":"Một học sinh không hiểu một từ thì không thể hiểu cả câu.","probBody1":"Một học sinh bỏ lỡ một từ. Em không giơ tay. Em nghĩ mình hiểu đại khái. Giáo viên đi tiếp. Năm từ sau, cả đoạn văn nhòe đi. Năm đoạn văn sau, bài học mất hút.","probBody2":"Phần lớn học sinh bị tụt lại không phải vì kém thông minh. Các em có cả một chồng từ chưa bao giờ hiểu trọn vẹn. Mỗi từ mới dựng trên nền đó lại khoét sâu khoảng cách. Nguyên nhân thì vô hình đối với giáo viên.","probCallout1Title":"Khoảng cách tích tụ","probCallout1Body":"Những từ chưa học tạo nên một rào cản vô hình cho mọi bài học sau này.","probCallout2Title":"Sự hao mòn thời gian","probCallout2Body":"Giáo viên mất 5-10 phút mỗi tiết để giải nghĩa từ.","probCallout3Title":"Sự bỏ cuộc lặng lẽ","probCallout3Body":"Học sinh mất tập trung khi một đoạn văn có quá nhiều từ lạ.","howTag":"Cách hoạt động","howH2":"Thiết lập trong 2 phút. Không cần IT.","howSub":"Vẫn là mẫu mã lớp học không rào cản đã hiệu quả với các trò đố vui, nay được dựng cho việc hiểu từ.","howStep1Title":"Tạo một mã lớp học","howStep1Body":"Hiệu trưởng hoặc điều phối viên tạo một lớp học trong bảng điều khiển. Hệ thống tạo ra một mã gồm 6 ký tự. In lên một miếng dán cho máy tính của lớp.","howStep2Title":"Học sinh tham gia, không cần tài khoản","howStep2Body":"Học sinh vào gadit.app/c/CODE trên bất kỳ trình duyệt nào, chọn tên mình từ danh sách lớp (một cú nhấp), và bắt đầu gõ từ. Không cài ứng dụng, không email, không mật khẩu.","howStep3Title":"Giáo viên thấy cả lớp đã tra những gì","howStep3Body":"Mọi lượt tra đều rơi vào bảng điều khiển, gắn với tên của học sinh. Bạn thấy mỗi em đã tra gì, khi nào, và những từ mà cả lớp cùng vật lộn.","teacherTag":"Góc nhìn của giáo viên","teacherH2":"Bảng điều khiển mà bạn vẫn hằng mong.","teacherSub":"Không phải những chỉ số tương tác mơ hồ. Từ cụ thể, học sinh cụ thể, thời điểm cụ thể.","teacherB1":"Lịch sử tra cứu theo từng học sinh, kèm mốc thời gian","teacherB2":"Những từ được cả lớp tra nhiều nhất trong tuần","teacherB3":"Những lượt tra lặp lại báo hiệu sự hiểu chưa vững","teacherB4":"Lọc theo ngày, học sinh, hoặc từ","privTag":"Riêng tư từ trong thiết kế","privH2":"Toàn quyền nhìn thấy cho giáo viên. Không rủi ro dữ liệu cho nhà trường.","privSub":"Chúng tôi không thu thập bất kỳ thông tin cá nhân nào của học sinh. Không phải vì chúng tôi giấu kỹ, mà vì chúng tôi không bao giờ thu thập. Chính kiến trúc là sự tuân thủ.","privPoint1":"Không có tài khoản học sinh. Không email, không mật khẩu, không mã định danh.","privPoint2":"Không dữ liệu cá nhân nào rời khỏi trường. Các lượt tra chỉ gắn với tên trong danh sách lớp.","privPoint3":"Mã lớp học chỉ hoạt động trong giờ học. Có thể tùy chỉnh cho từng trường.","privPoint4":"COPPA, GDPR-K, và luật bảo vệ quyền riêng tư học sinh của Israel đều được đáp ứng thoải mái.","privKahoot":"Tham gia dễ như một trò đố vui trong lớp. Được dựng cho việc hiểu từ và cho giáo viên nhìn thấy.","priceTag":"Giá","priceH2":"Giá theo năm, tính theo quy mô trường.","priceSub":"Tự phục vụ qua Stripe. Không cuộc gọi bán hàng, không buổi demo, không đơn đặt hàng.","priceSmallName":"Schools","priceSmallAmount":"$69","priceSmallStudents":"Tối đa 100 học sinh","priceLargeName":"Schools Large","priceLargeAmount":"$149","priceLargeStudents":"Tối đa 500 học sinh","priceIncludesTitle":"Cả hai gói đều bao gồm","priceIncludes":["Lớp học không giới hạn","Bảng điều khiển đầy đủ cho giáo viên","Danh sách chọn tên học sinh","Mã lớp học có giới hạn thời gian","Giao diện học sinh bằng 30+ ngôn ngữ","Đặt mua theo năm đơn giản, dưới ngưỡng đấu thầu mua sắm","Luyện phát âm: nghe và nói bất kỳ từ nào"],"priceCta":"Xem giá và đặt mua","priceLarger":"Cần nhiều hơn 1.000 học sinh? Hãy liên hệ với chúng tôi về gói cho cả cụm trường.","faqTag":"Câu hỏi thường gặp","faqH2":"Những câu hiệu trưởng hỏi trước khi đặt mua.","faq":[{"q":"Nếu không có đăng nhập, làm sao tôi biết học sinh nào đã tra gì?","a":"Giáo viên nạp sẵn một danh sách tên gọi trong bảng điều khiển. Khi một học sinh vào đường dẫn của lớp, em chọn tên mình chỉ với một cú nhấp. Mọi lượt tra đều gắn với tên đó. Không thu thập email, mật khẩu hay thông tin cá nhân nào."},{"q":"Cái này có an toàn theo COPPA không? Liệu tôi có bị phụ huynh khiếu nại không?","a":"Có. Gadit hoàn toàn không thu thập thông tin cá nhân nào của học sinh. Không tạo tài khoản, không thu email, không ngày sinh, không mã định danh. Không có dữ liệu nào để lạm dụng. Kiến trúc này vượt xa mức yêu cầu của COPPA, GDPR-K, và luật bảo vệ quyền riêng tư học sinh của Israel."},{"q":"Học sinh có cần cài ứng dụng không?","a":"Không. Bất kỳ trình duyệt nào cũng được. Học sinh vào gadit.app/c/CODE trên máy tính của lớp (hoặc bất kỳ thiết bị nào có trình duyệt). Không cửa hàng ứng dụng, không cần đến IT."},{"q":"Cái này có cần thiết lập IT hay SSO không?","a":"Không. Một hiệu trưởng hoặc điều phối viên khối lớp tạo lớp học trong hai phút và chia sẻ mã cho giáo viên. IT không tham gia ở bất kỳ bước nào."},{"q":"Bảng điều khiển thực sự cho thấy những gì?","a":"Các lượt tra từ của mỗi học sinh kèm mốc thời gian, những từ cả lớp tra nhiều nhất trong tuần, và những mẫu tra lặp lại báo hiệu sự hiểu chưa vững. Bạn thấy dữ liệu hiểu bài thật của lớp, chứ không phải những chỉ số tương tác mơ hồ."},{"q":"Có dùng được ngoài giờ học không?","a":"Mã lớp học được gắn với giờ hoạt động của trường (mặc định Chủ nhật đến Thứ năm 7:30-15:00, có thể tùy chỉnh). Ngoài khung giờ đó, mã chỉ cho phép tra từ điển cơ bản chứ không có các tính năng mở rộng. Điều này ngăn mã của trường trở thành một bản thay thế miễn phí 24/7 cho gói Gia đình."},{"q":"Nếu trường tôi có hơn 500 học sinh thì sao?","a":"Chọn theo số lượng học sinh: tối đa 100 học sinh là $97/tháng, tối đa 500 là $297/tháng, và tối đa 1.000 là $497/tháng. Với hơn 1.000 học sinh hoặc cụm trường nhiều cơ sở, hãy liên hệ với chúng tôi để có gói riêng."},{"q":"Gadit giải thích một từ như thế nào? Có phải chỉ là bản dịch không?","a":"Gadit không phải từ điển dịch thuật. Gadit định nghĩa và giải thích từ ngữ. Với mỗi từ, nó đưa ra mọi nghĩa, ba câu ví dụ cho mỗi nghĩa, nguồn gốc từ, và một chế độ nhận biết ngữ cảnh nơi học sinh dán câu vào và Gadit chọn đúng nghĩa. Giao diện của học sinh bằng ngôn ngữ của các em, nhưng chiều sâu giải thích thì như nhau trong mọi ngôn ngữ giao diện."}],"finalH2":"Chấm dứt kiểu thất bại lặng lẽ.","finalBody":"Hãy trao cho giáo viên của bạn công cụ để thấy chính xác điều cả lớp không hiểu. Bắt đầu chỉ mất 2 phút. Không cần IT, không cần mua sắm đấu thầu, không cần biểu mẫu phụ huynh.","finalCta":"Xem giá và đặt mua","finalNote":"Thanh toán theo năm bằng chuyển khoản ngân hàng kèm hóa đơn thuế. Không cần đấu thầu.","mockupRoster":"Danh sách lớp, 22 học sinh","mockupSearches":"Được tra nhiều nhất trong tuần","mockupStudent1":"Maya đã tra quang hợp","mockupStudent2":"Yossi đã tra ty thể ×2","mockupStudent3":"Noa đã tra dân chủ","mockupWordExample":"quang hợp","mockupExampleDef":"Quá trình cây xanh dùng ánh sáng mặt trời để chuyển nước và khí carbonic thành thức ăn.","mockupExampleEx":"Quang hợp diễn ra chủ yếu ở lá cây."},
  "zh-CN": {"heroH1":"每个学生都听懂这节课。","heroSub":"任何难词，用 30+ 种语言中的任意一种，当场讲清楚。","heroCta":"查看价格并下单","heroPriceChip":"每月 $97 起","heroTrust":"自助开通。随时取消。","probTag":"问题所在","probH2":"一个词都读不懂的学生，整句话都看不明白。","probBody1":"学生漏掉了一个词。他没举手。他以为大概懂了。老师往下讲了。再过五个词，这一段就模糊了。再过五段，整节课就跟丢了。","probBody2":"大多数掉队的学生并不是不聪明。他们攒下了一堆从没真正弄懂的词。每个新词都建在这些词之上，差距越滚越大。而这个根源，老师看不见。","probCallout1Title":"越滚越大的差距","probCallout1Body":"没学会的词，给往后每一节课都筑起一道看不见的墙。","probCallout2Title":"被消耗的时间","probCallout2Body":"老师每节课要花 5 到 10 分钟解释词义。","probCallout3Title":"无声的掉队","probCallout3Body":"一段话里生词太多，学生就走神了。","howTag":"运作方式","howH2":"2 分钟搞定。无需 IT。","howSub":"和已经在测验游戏里跑通的那套零门槛课堂码是同一个模式，这次是为读懂词语而做的。","howStep1Title":"创建一个课堂码","howStep1Body":"校长或协调员在后台创建一个班级，系统生成一个 6 位字符的码。把它打印成贴纸，贴在教室电脑上。","howStep2Title":"学生加入，无需账号","howStep2Body":"学生用任意浏览器打开 gadit.app/c/CODE，从名单里点选自己的名字（一键搞定），就能开始输入词语。不用装应用，不用邮箱，不用密码。","howStep3Title":"老师看得到全班查了什么","howStep3Body":"每一次查词都会进入后台，并标注上学生的名字。你能看到每个学生查了什么、什么时候查的，以及全班共同卡住的是哪些词。","teacherTag":"老师视图","teacherH2":"你一直想要的那个后台。","teacherSub":"不是含糊的参与度指标。是具体的词、具体的学生、具体的时刻。","teacherB1":"每个学生的查词记录，带时间戳","teacherB2":"全班本周查得最多的词","teacherB3":"反复查询，暴露出摇摇欲坠的理解","teacherB4":"可按日期、学生或词语筛选","privTag":"隐私即设计","privH2":"老师全盘可见。学校零数据风险。","privSub":"我们不收集任何学生的个人身份信息。不是因为我们藏得好，而是我们压根不收集。这套架构本身，就是合规。","privPoint1":"没有学生账号。没有邮箱、没有密码、没有身份编号。","privPoint2":"没有个人数据离开学校。查词只按名单上的名字标注。","privPoint3":"课堂码只在上课时段有效。每所学校可自行配置。","privPoint4":"COPPA、GDPR-K 以及以色列学生隐私法，全都从容满足。","privKahoot":"加入起来和课堂测验游戏一样简单。为读懂词语和老师可见性而生。","priceTag":"价格","priceH2":"按学校规模，年度定价。","priceSub":"通过 Stripe 自助开通。没有销售电话，没有演示，没有采购单。","priceSmallName":"学校版","priceSmallAmount":"$69","priceSmallStudents":"最多 100 名学生","priceLargeName":"学校大型版","priceLargeAmount":"$149","priceLargeStudents":"最多 500 名学生","priceIncludesTitle":"两个套餐都包含","priceIncludes":["不限班级数量","完整的老师后台","学生名单选择器","限时有效的课堂码","学生界面支持 30+ 种语言","简单的年度订单，低于采购审批门槛","发音练习：听任何一个词，再说出来"],"priceCta":"查看价格并下单","priceLarger":"需要超过 1,000 名学生？联系我们了解学区套餐。","faqTag":"常见问题","faqH2":"校长下单前会问的问题。","faq":[{"q":"既然没有登录，我怎么知道是哪个学生查了什么？","a":"老师在后台预先导入一份名字名单。学生打开课堂网址时，一键点选自己的名字。每一次查词都会标注到那个名字上。不收集邮箱、不收集密码，不收集任何个人身份信息。"},{"q":"这符合 COPPA 吗？会不会引来家长投诉？","a":"符合。Gadit 完全不收集学生的任何个人信息。不创建账号，不收集邮箱，不收集生日，不收集身份编号。根本没有可被滥用的数据。这套架构从容超越 COPPA、GDPR-K 以及以色列学生隐私法的要求。"},{"q":"学生需要安装应用吗？","a":"不需要。任意浏览器都行。学生在教室电脑上（或任何带浏览器的设备上）打开 gadit.app/c/CODE 即可。不用应用商店，不用 IT 参与。"},{"q":"这需要 IT 或 SSO 配置吗？","a":"不需要。校长或年级协调员两分钟就能创建班级，再把码分享给老师。整个过程 IT 都不需要参与。"},{"q":"后台实际会显示什么？","a":"每个学生的查词记录及时间戳、全班本周查得最多的词，以及暴露理解摇摇欲坠的反复查询规律。你看到的是真实的课堂理解数据，而不是含糊的参与度指标。"},{"q":"可以在上课时间以外使用吗？","a":"课堂码与学校的上课时段绑定（默认周日至周四 7:30 到 15:00，可配置）。在这个时段之外，码只提供基础词典功能，没有扩展功能。这可以防止学校码变成一天 24 小时、免费替代家庭套餐的东西。"},{"q":"如果我的学校超过 500 名学生怎么办？","a":"按学生人数选择：最多 100 名学生每月 $97，最多 500 名每月 $297，最多 1,000 名每月 $497。超过 1,000 名学生或多校区学区，请联系我们定制方案。"},{"q":"Gadit 是怎么讲解一个词的？只是翻译吗？","a":"Gadit 不是翻译词典。Gadit 会给词下定义、讲清楚。每个词它都给出所有含义、每个含义三个例句、词源，还有一个理解上下文的模式：学生把句子粘进来，Gadit 挑出正确的含义。学生的界面是他自己的语言，但每种界面语言里的讲解深度都一样。"}],"finalH2":"别再让失败悄无声息地发生。","finalBody":"把这个工具交给老师，让他们清清楚楚看到全班到底哪里没懂。起步只要 2 分钟。不用 IT，不用采购，不用家长填表。","finalCta":"查看价格并下单","finalNote":"凭税务发票按年银行转账付款。无需招标。","mockupRoster":"班级名单，22 名学生","mockupSearches":"本周查得最多的词","mockupStudent1":"玛雅查了 光合作用","mockupStudent2":"约西查了 线粒体 ×2","mockupStudent3":"诺雅查了 民主","mockupWordExample":"光合作用","mockupExampleDef":"绿色植物利用阳光，把水和二氧化碳转化为养料的过程。","mockupExampleEx":"光合作用主要发生在植物的叶片里。"},
  "zh-TW": {"heroH1":"每一位學生都聽懂這堂課。","heroSub":"任何難字,用 30+ 種語言中的任何一種,當場解釋清楚。","heroCta":"查看價格並訂購","heroPriceChip":"每月 $97 起","heroTrust":"自助開通。隨時可取消。","probTag":"問題所在","probH2":"一個學生連一個字都不懂,就不可能懂整句話。","probBody1":"學生漏掉一個字。他沒有舉手。他以為自己大概懂了。老師繼續往下講。五個字之後,整段變得模糊。五段之後,這堂課已經跟丟了。","probBody2":"大多數跟不上的學生並不是不聰明。他們累積了一疊從來沒真正弄懂的字。每個建立在這些字之上的新字,都讓落差愈滾愈大。而這個根源,老師是看不見的。","probCallout1Title":"愈滾愈大的落差","probCallout1Body":"沒學會的字,會為未來每一堂課築起一道看不見的高牆。","probCallout2Title":"時間的流失","probCallout2Body":"老師每堂課要花 5 到 10 分鐘解釋字義。","probCallout3Title":"沉默的掉隊","probCallout3Body":"當一段文字裡陌生的字太多,學生就會放空。","howTag":"運作方式","howH2":"兩分鐘設定完成。不需要 IT。","howSub":"採用和測驗遊戲一樣、已經行之有效的無摩擦教室代碼模式,只是這次是為了單字理解而打造。","howStep1Title":"建立一個教室代碼","howStep1Body":"校長或協調人員在儀表板上建立一間教室。系統會產生一組 6 碼代碼。把它印成貼紙貼在教室電腦上。","howStep2Title":"學生加入,不需帳號","howStep2Body":"學生用任何瀏覽器造訪 gadit.app/c/CODE,從名單裡點選自己的名字(一鍵完成),就能開始輸入單字。不用裝 App、不用電子郵件、不用密碼。","howStep3Title":"老師看得到全班查了什麼","howStep3Body":"每一次查詢都會進到儀表板,並標上該學生的名字。你能看到每個學生查了什麼、什麼時候查的,以及全班共同卡住的是哪些字。","teacherTag":"老師視角","teacherH2":"你一直在盼望的那個儀表板。","teacherSub":"不是模糊的參與度指標。是具體的字、具體的學生、具體的時刻。","teacherB1":"每位學生的查詢紀錄,附時間戳記","teacherB2":"全班本週查最多的字","teacherB3":"反覆查詢,標示出脆弱的理解","teacherB4":"可依日期、學生或單字篩選","privTag":"以隱私為本的設計","privH2":"老師擁有完整可見度。學校零資料風險。","privSub":"我們不蒐集任何學生個資。不是因為我們藏得好,而是因為我們從一開始就不蒐集。這套架構本身就是合規。","privPoint1":"沒有學生帳號。沒有電子郵件、沒有密碼、沒有身分證號。","privPoint2":"沒有任何個人資料離開學校。查詢只以名單上的名字標示。","privPoint3":"教室代碼只在上課時間有效。每所學校可自行設定。","privPoint4":"COPPA、GDPR-K 和以色列學生隱私法都輕鬆符合。","privKahoot":"加入方式和教室測驗遊戲一樣簡單。專為單字理解和老師可見度而打造。","priceTag":"價格","priceH2":"年費制,依學校規模計價。","priceSub":"透過 Stripe 自助開通。不用業務電話、不用產品展示、不用採購單。","priceSmallName":"學校方案","priceSmallAmount":"$69","priceSmallStudents":"最多 100 位學生","priceLargeName":"學校大型方案","priceLargeAmount":"$149","priceLargeStudents":"最多 500 位學生","priceIncludesTitle":"兩種方案都包含","priceIncludes":["無限間教室","完整的老師儀表板","學生點選名單","有時效的教室代碼","30+ 種語言的學生介面","簡單的年度訂購,低於採購門檻","發音練習:聽任何字、說任何字"],"priceCta":"查看價格並訂購","priceLarger":"需要超過 1,000 位學生?請與我們聯繫,洽詢學區方案。","faqTag":"常見問題","faqH2":"校長在訂購前會問的問題。","faq":[{"q":"如果沒有登入,我怎麼知道是哪個學生查了什麼?","a":"老師先在儀表板上預先載入一份名字的名單。當學生造訪教室網址時,一鍵點選自己的名字。每一次查詢都會標到那個名字上。不蒐集電子郵件、密碼或任何個資。"},{"q":"這符合 COPPA 嗎?我會收到家長投訴嗎?","a":"會符合。Gadit 完全不蒐集任何學生個人資訊。不建立帳號、不蒐集電子郵件、不問生日、不記身分證號。根本沒有資料可以被濫用。這套架構輕鬆超越 COPPA、GDPR-K 和以色列學生隱私法的要求。"},{"q":"學生需要安裝 App 嗎?","a":"不需要。任何瀏覽器都能用。學生在教室電腦(或任何有瀏覽器的裝置)上造訪 gadit.app/c/CODE 即可。不用 App 商店,不用 IT 介入。"},{"q":"這需要 IT 或 SSO 設定嗎?","a":"不需要。校長或年級協調人員兩分鐘就能建立教室,再把代碼分享給老師。整個過程完全不需要 IT 介入。"},{"q":"儀表板實際上會顯示什麼?","a":"每位學生的單字查詢紀錄和時間戳記、全班本週查最多的字,以及反覆查詢、代表理解脆弱的模式。你看到的是真實的課堂理解數據,而不是模糊的參與度指標。"},{"q":"可以在上課時間以外使用嗎?","a":"教室代碼綁定學校的有效時段(預設週日到週四 7:30 至 15:00,可自行設定)。在這個時段之外,代碼只提供基本字典功能,沒有進階功能。這能避免學校代碼變成一個全天候免費取代家庭方案的替代品。"},{"q":"如果我的學校超過 500 位學生怎麼辦?","a":"依學生人數選擇:最多 100 位學生每月 $97,最多 500 位每月 $297,最多 1,000 位每月 $497。若超過 1,000 位學生或屬於多校區學區,請與我們聯繫洽詢客製方案。"},{"q":"Gadit 是怎麼解釋一個字的?只是翻譯嗎?","a":"Gadit 不是翻譯字典。Gadit 會定義並解釋單字。每個字它都會給出所有意思、每個意思三個例句、字源,還有一個懂情境的模式,學生把句子貼上來,Gadit 就挑出正確的意思。學生的介面是他自己的語言,但無論用哪種介面語言,解釋的深度都一樣。"}],"finalH2":"終結那個沉默的失敗模式。","finalBody":"給老師一個工具,讓他們清楚看見全班到底哪裡不懂。開始只要兩分鐘。不用 IT、不用採購流程、不用家長同意書。","finalCta":"查看價格並訂購","finalNote":"以銀行轉帳按年支付,並開立稅務發票。不需要招標。","mockupRoster":"班級名單,22 位學生","mockupSearches":"本週查最多的字","mockupStudent1":"Maya 查了 光合作用","mockupStudent2":"Yossi 查了 粒線體 ×2","mockupStudent3":"Noa 查了 民主","mockupWordExample":"光合作用","mockupExampleDef":"綠色植物利用陽光,把水和二氧化碳轉化成養分的過程。","mockupExampleEx":"光合作用主要發生在植物的葉子裡。"}
} satisfies Record<string, T>);


/**
 * Three school-size tiers (Gadi 2026-08-04, after the pricing council).
 * Prices are in shekels — the Israeli school market is the primary
 * channel and buys in ₪ with a tax invoice; international currency
 * display is a follow-up tied to the billing-routing work. The middle
 * All three tiers are equal weight: the right one is decided by school
 * size, not preference, so there is no "recommended" tier (Gadi
 * 2026-08-04). Each price is a NEW Stripe price, so the three env vars
 * must be set once the Stripe products exist.
 */
// Annual pricing in ₪ (Gadi 2026-08-08, after the market research: Israeli
// schools buy a full year up front, by bank transfer against a tax invoice,
// not by monthly card). ×10 the old monthly = two months free.
// Hebrew ₪ tiers. Monthly-first display (Gadi 2026-08-14: show the small
// per-month number, not the scary annual sum), with a yearly option at
// ×10 the monthly = two months free. Actual payment for Israeli schools is
// still the annual bank-transfer / tax-invoice order form below.
const SCHOOL_TIERS = [
  { key: "small" as const,  monthly: 349, yearly: 3490 },
  { key: "medium" as const, monthly: 649, yearly: 6490 },
  { key: "large" as const,  monthly: 949, yearly: 9490 },
];

// Self-serve USD pricing for the international (non-Hebrew) Schools page.
// Hebrew keeps the ₪ annual bank-transfer order form (Israeli schools buy
// against a tax invoice); every other language buys by card via /checkout
// like the rest of the app. Gadi 2026-08-14: a single global USD price is
// what makes it read as a modern international platform, and monthly-first
// (with a yearly option) means a principal sees the small per-month number,
// not a scary annual sum. Amounts mirror the live Stripe SKUs.
// International USD pricing = the shared 3-tier ladder ($97/$297/$497) from
// @/lib/schools-prices, the same source /pricing uses (Gadi 2026-08-15,
// raised from the old flat $69/$149). Hebrew keeps the ₪ order form below.

type PricingUI = {
  perYear: string;
  orderCta: string;
  plusVat: string;
  netNote: string;
  tiers: { small: string; medium: string; large: string };
};
const PRICING_UI: Record<string, PricingUI> = {
  he: { perYear: "לשנה", orderCta: "לפרטים ולהזמנה",
        plusVat: "+ מע״מ", netNote: "כל המחירים אינם כוללים מע״מ.",
        tiers: { small: "עד 100 תלמידים", medium: "101 עד 500 תלמידים", large: "501 עד 1,000 תלמידים" } },
  en: { perYear: "/ year", orderCta: "Get a quote",
        plusVat: "+ VAT", netNote: "All prices exclude VAT.",
        tiers: { small: "Up to 100 students", medium: "101–500 students", large: "501–1,000 students" } },
  ar: { perYear: "سنويًا", orderCta: "لطلب عرض سعر",
        plusVat: "+ ض.ق.م", netNote: "جميع الأسعار لا تشمل ضريبة القيمة المضافة.",
        tiers: { small: "حتى 100 طالب", medium: "101–500 طالب", large: "501–1,000 طالب" } },
  ru: { perYear: "в год", orderCta: "Запросить счёт",
        plusVat: "+ НДС", netNote: "Все цены указаны без НДС.",
        tiers: { small: "до 100 учеников", medium: "101–500 учеников", large: "501–1,000 учеников" } },
};

// Labels for the international USD pricing block (non-Hebrew). Native for
// en/ar/ru; the other 30+ languages fall back to English, same he+en-primary
// pattern as PRICING_UI above. Plan names ("Schools" / "Schools Large") stay
// in English everywhere, like every other Gadit tier.
type UsdPricingUI = {
  h2: string;
  billedMonthly: string;
  billedYearly: string;
  yearlySave: string;
  perMonth: string;
  perYear: string;
  smallName: string;
  largeName: string;
  smallStudents: string;
  largeStudents: string;
  cta: string;
  afterTrial: string;
};
const USD_PRICING_UI: Record<string, UsdPricingUI> = {
  en: { h2: "One price, every school, everywhere.",
        billedMonthly: "Monthly", billedYearly: "Yearly", yearlySave: "2 months free",
        perMonth: "/ month", perYear: "/ year",
        smallName: "Schools", largeName: "Schools Large",
        smallStudents: "Up to 100 students", largeStudents: "Up to 500 students",
        cta: "Start free trial", afterTrial: "14-day free trial, cancel anytime." },
  ar: { h2: "سعر واحد، لكل مدرسة، في كل مكان.",
        billedMonthly: "شهري", billedYearly: "سنوي", yearlySave: "شهران مجانًا",
        perMonth: "/ شهر", perYear: "/ سنة",
        smallName: "Schools", largeName: "Schools Large",
        smallStudents: "حتى 100 طالب", largeStudents: "حتى 500 طالب",
        cta: "ابدأ النسخة التجريبية المجانية", afterTrial: "نسخة تجريبية مجانية 14 يومًا، ألغِ في أي وقت." },
  ru: { h2: "Одна цена для каждой школы, везде.",
        billedMonthly: "Ежемесячно", billedYearly: "Ежегодно", yearlySave: "2 месяца бесплатно",
        perMonth: "/ месяц", perYear: "/ год",
        smallName: "Schools", largeName: "Schools Large",
        smallStudents: "до 100 учеников", largeStudents: "до 500 учеников",
        cta: "Начать бесплатный период", afterTrial: "14 дней бесплатно, отмена в любое время." },
  he: { h2: "מחיר פשוט, לכל בית ספר, בכל מקום.",
        billedMonthly: "חודשי", billedYearly: "שנתי", yearlySave: "חודשיים חינם",
        perMonth: "/ חודש", perYear: "/ שנה",
        smallName: "Schools", largeName: "Schools Large",
        smallStudents: "עד 100 תלמידים", largeStudents: "עד 500 תלמידים",
        cta: "להתחיל ניסיון חינם", afterTrial: "14 יום ניסיון חינם, אפשר לבטל בכל עת." },
  es: { h2: "Un precio simple, para cada escuela, en todas partes.",
        billedMonthly: "Mensual", billedYearly: "Anual", yearlySave: "2 meses gratis",
        perMonth: "/ mes", perYear: "/ año",
        smallName: "Schools", largeName: "Schools Large",
        smallStudents: "Hasta 100 estudiantes", largeStudents: "Hasta 500 estudiantes",
        cta: "Comenzar prueba gratuita", afterTrial: "Prueba gratuita de 14 días, cancela cuando quieras." },
  pt: { h2: "Um preço simples, para cada escola, em qualquer lugar.",
        billedMonthly: "Mensal", billedYearly: "Anual", yearlySave: "2 meses grátis",
        perMonth: "/ mês", perYear: "/ ano",
        smallName: "Schools", largeName: "Schools Large",
        smallStudents: "Até 100 alunos", largeStudents: "Até 500 alunos",
        cta: "Iniciar teste gratuito", afterTrial: "Teste gratuito de 14 dias, cancele quando quiser." },
  fr: { h2: "Un tarif simple, pour chaque école, partout.",
        billedMonthly: "Mensuel", billedYearly: "Annuel", yearlySave: "2 mois offerts",
        perMonth: "/ mois", perYear: "/ an",
        smallName: "Schools", largeName: "Schools Large",
        smallStudents: "Jusqu'à 100 élèves", largeStudents: "Jusqu'à 500 élèves",
        cta: "Démarrer l'essai gratuit", afterTrial: "Essai gratuit de 14 jours, annulez à tout moment." },
  de: { h2: "Ein einfacher Preis, für jede Schule, überall.",
        billedMonthly: "Monatlich", billedYearly: "Jährlich", yearlySave: "2 Monate gratis",
        perMonth: "/ Monat", perYear: "/ Jahr",
        smallName: "Schools", largeName: "Schools Large",
        smallStudents: "Bis zu 100 Schüler", largeStudents: "Bis zu 500 Schüler",
        cta: "Kostenlose Testphase starten", afterTrial: "14 Tage kostenlos testen, jederzeit kündbar." },
  cs: { h2: "Jednoduchá cena pro každou školu, všude.",
        billedMonthly: "Měsíčně", billedYearly: "Ročně", yearlySave: "2 měsíce zdarma",
        perMonth: "/ měsíc", perYear: "/ rok",
        smallName: "Schools", largeName: "Schools Large",
        smallStudents: "Až 100 studentů", largeStudents: "Až 500 studentů",
        cta: "Spustit bezplatnou zkušební verzi", afterTrial: "14denní bezplatná zkušební verze, zrušte kdykoli." },
  sk: { h2: "Jednoduchá cena pre každú školu, všade.",
        billedMonthly: "Mesačne", billedYearly: "Ročne", yearlySave: "2 mesiace zadarmo",
        perMonth: "/ mesiac", perYear: "/ rok",
        smallName: "Schools", largeName: "Schools Large",
        smallStudents: "Až 100 študentov", largeStudents: "Až 500 študentov",
        cta: "Spustiť bezplatnú skúšobnú verziu", afterTrial: "14-dňová bezplatná skúšobná verzia, zrušte kedykoľvek." },
  it: { h2: "Un prezzo semplice, per ogni scuola, ovunque.",
        billedMonthly: "Mensile", billedYearly: "Annuale", yearlySave: "2 mesi gratis",
        perMonth: "/ mese", perYear: "/ anno",
        smallName: "Schools", largeName: "Schools Large",
        smallStudents: "Fino a 100 studenti", largeStudents: "Fino a 500 studenti",
        cta: "Inizia la prova gratuita", afterTrial: "Prova gratuita di 14 giorni, disdici quando vuoi." },
  ja: { h2: "すべての学校に、どこでも、シンプルな価格。",
        billedMonthly: "月額", billedYearly: "年額", yearlySave: "2か月無料",
        perMonth: "/ 月", perYear: "/ 年",
        smallName: "Schools", largeName: "Schools Large",
        smallStudents: "生徒100人まで", largeStudents: "生徒500人まで",
        cta: "無料トライアルを始める", afterTrial: "14日間の無料トライアル、いつでも解約できます。" },
  hi: { h2: "हर स्कूल के लिए, हर जगह, एक आसान कीमत।",
        billedMonthly: "मासिक", billedYearly: "वार्षिक", yearlySave: "2 महीने मुफ़्त",
        perMonth: "/ माह", perYear: "/ वर्ष",
        smallName: "Schools", largeName: "Schools Large",
        smallStudents: "100 छात्रों तक", largeStudents: "500 छात्रों तक",
        cta: "मुफ़्त ट्रायल शुरू करें", afterTrial: "14 दिन का मुफ़्त ट्रायल, कभी भी रद्द करें।" },
  am: { h2: "ለእያንዳንዱ ትምህርት ቤት፣ በሁሉም ቦታ፣ ቀላል ዋጋ።",
        billedMonthly: "በወር", billedYearly: "በዓመት", yearlySave: "2 ወር ነጻ",
        perMonth: "/ ወር", perYear: "/ ዓመት",
        smallName: "Schools", largeName: "Schools Large",
        smallStudents: "እስከ 100 ተማሪዎች", largeStudents: "እስከ 500 ተማሪዎች",
        cta: "ነጻ ሙከራ ጀምር", afterTrial: "የ14 ቀን ነጻ ሙከራ፣ በማንኛውም ጊዜ ይሰርዙ።" },
  uk: { h2: "Проста ціна для кожної школи, всюди.",
        billedMonthly: "Щомісяця", billedYearly: "Щороку", yearlySave: "2 місяці безкоштовно",
        perMonth: "/ місяць", perYear: "/ рік",
        smallName: "Schools", largeName: "Schools Large",
        smallStudents: "до 100 учнів", largeStudents: "до 500 учнів",
        cta: "Почати безкоштовний період", afterTrial: "14 днів безкоштовно, скасуйте будь-коли." },
  tr: { h2: "Her okul için, her yerde, basit bir fiyat.",
        billedMonthly: "Aylık", billedYearly: "Yıllık", yearlySave: "2 ay ücretsiz",
        perMonth: "/ ay", perYear: "/ yıl",
        smallName: "Schools", largeName: "Schools Large",
        smallStudents: "100 öğrenciye kadar", largeStudents: "500 öğrenciye kadar",
        cta: "Ücretsiz denemeyi başlat", afterTrial: "14 günlük ücretsiz deneme, istediğin zaman iptal et." },
  pl: { h2: "Prosta cena dla każdej szkoły, wszędzie.",
        billedMonthly: "Miesięcznie", billedYearly: "Rocznie", yearlySave: "2 miesiące gratis",
        perMonth: "/ miesiąc", perYear: "/ rok",
        smallName: "Schools", largeName: "Schools Large",
        smallStudents: "Do 100 uczniów", largeStudents: "Do 500 uczniów",
        cta: "Rozpocznij bezpłatny okres próbny", afterTrial: "14-dniowy bezpłatny okres próbny, anuluj w każdej chwili." },
  fa: { h2: "یک قیمت ساده، برای هر مدرسه، در همه‌جا.",
        billedMonthly: "ماهانه", billedYearly: "سالانه", yearlySave: "۲ ماه رایگان",
        perMonth: "/ ماه", perYear: "/ سال",
        smallName: "Schools", largeName: "Schools Large",
        smallStudents: "تا ۱۰۰ دانش‌آموز", largeStudents: "تا ۵۰۰ دانش‌آموز",
        cta: "شروع دورهٔ آزمایشی رایگان", afterTrial: "دورهٔ آزمایشی رایگان ۱۴ روزه، هر زمان لغو کنید." },
  id: { h2: "Satu harga sederhana, untuk setiap sekolah, di mana saja.",
        billedMonthly: "Bulanan", billedYearly: "Tahunan", yearlySave: "2 bulan gratis",
        perMonth: "/ bulan", perYear: "/ tahun",
        smallName: "Schools", largeName: "Schools Large",
        smallStudents: "Hingga 100 siswa", largeStudents: "Hingga 500 siswa",
        cta: "Mulai uji coba gratis", afterTrial: "Uji coba gratis 14 hari, batalkan kapan saja." },
  nl: { h2: "Eén eenvoudige prijs, voor elke school, overal.",
        billedMonthly: "Maandelijks", billedYearly: "Jaarlijks", yearlySave: "2 maanden gratis",
        perMonth: "/ maand", perYear: "/ jaar",
        smallName: "Schools", largeName: "Schools Large",
        smallStudents: "Tot 100 leerlingen", largeStudents: "Tot 500 leerlingen",
        cta: "Start gratis proefperiode", afterTrial: "14 dagen gratis proberen, altijd opzegbaar." },
  el: { h2: "Μία απλή τιμή, για κάθε σχολείο, παντού.",
        billedMonthly: "Μηνιαία", billedYearly: "Ετήσια", yearlySave: "2 μήνες δωρεάν",
        perMonth: "/ μήνα", perYear: "/ έτος",
        smallName: "Schools", largeName: "Schools Large",
        smallStudents: "Έως 100 μαθητές", largeStudents: "Έως 500 μαθητές",
        cta: "Ξεκινήστε δωρεάν δοκιμή", afterTrial: "Δωρεάν δοκιμή 14 ημερών, ακυρώστε οποτεδήποτε." },
  zu: { h2: "Inani elilodwa elilula, kuzo zonke izikole, yonke indawo.",
        billedMonthly: "Ngenyanga", billedYearly: "Ngonyaka", yearlySave: "Izinyanga ezi-2 mahhala",
        perMonth: "/ inyanga", perYear: "/ unyaka",
        smallName: "Schools", largeName: "Schools Large",
        smallStudents: "Kufikela kubafundi abangu-100", largeStudents: "Kufikela kubafundi abangu-500",
        cta: "Qala ukuzama kwamahhala", afterTrial: "Ukuzama kwamahhala kwezinsuku ezingu-14, khansela noma nini." },
};

// 11 store-locale languages (af/bn/da/fil/hu/ko/sw/th/vi/zh-CN/zh-TW), added 2026-08-22
// so the Schools USD pricing card is native instead of English fallback.
Object.assign(USD_PRICING_UI, {
  "af": {"h2":"Een prys, elke skool, oral.","billedMonthly":"Maandeliks","billedYearly":"Jaarliks","yearlySave":"2 maande gratis","perMonth":"/ maand","perYear":"/ jaar","smallName":"Schools","largeName":"Schools Large","smallStudents":"Tot 100 leerders","largeStudents":"Tot 500 leerders","cta":"Begin gratis proeftydperk","afterTrial":"14-dag gratis proeftydperk, kanselleer enige tyd."},
  "bn": {"h2":"একটি মূল্য, প্রতিটি স্কুল, সর্বত্র।","billedMonthly":"মাসিক","billedYearly":"বার্ষিক","yearlySave":"2 মাস বিনামূল্যে","perMonth":"/ মাস","perYear":"/ বছর","smallName":"Schools","largeName":"Schools Large","smallStudents":"100 জন শিক্ষার্থী পর্যন্ত","largeStudents":"500 জন শিক্ষার্থী পর্যন্ত","cta":"বিনামূল্যে ট্রায়াল শুরু করুন","afterTrial":"14 দিনের বিনামূল্যে ট্রায়াল, যেকোনো সময় বাতিল করুন।"},
  "da": {"h2":"Én pris, alle skoler, overalt.","billedMonthly":"Månedligt","billedYearly":"Årligt","yearlySave":"2 måneder gratis","perMonth":"/ måned","perYear":"/ år","smallName":"Schools","largeName":"Schools Large","smallStudents":"Op til 100 elever","largeStudents":"Op til 500 elever","cta":"Start gratis prøveperiode","afterTrial":"14 dages gratis prøveperiode, opsig når som helst."},
  "fil": {"h2":"Isang presyo, bawat paaralan, saanman.","billedMonthly":"Buwanan","billedYearly":"Taunan","yearlySave":"2 buwan libre","perMonth":"/ buwan","perYear":"/ taon","smallName":"Schools","largeName":"Schools Large","smallStudents":"Hanggang 100 mag-aaral","largeStudents":"Hanggang 500 mag-aaral","cta":"Simulan ang libreng subok","afterTrial":"14 na araw na libreng subok, kanselahin anumang oras."},
  "hu": {"h2":"Egy ár, minden iskola, mindenhol.","billedMonthly":"Havonta","billedYearly":"Évente","yearlySave":"2 hónap ingyen","perMonth":"/ hó","perYear":"/ év","smallName":"Schools","largeName":"Schools Large","smallStudents":"Legfeljebb 100 diák","largeStudents":"Legfeljebb 500 diák","cta":"Ingyenes próba indítása","afterTrial":"14 napos ingyenes próba, bármikor lemondható."},
  "ko": {"h2":"하나의 가격, 모든 학교, 어디서나.","billedMonthly":"월간","billedYearly":"연간","yearlySave":"2개월 무료","perMonth":"/ 월","perYear":"/ 년","smallName":"Schools","largeName":"Schools Large","smallStudents":"최대 100명 학생","largeStudents":"최대 500명 학생","cta":"무료 체험 시작","afterTrial":"14일 무료 체험, 언제든지 취소 가능."},
  "sw": {"h2":"Bei moja, kila shule, kila mahali.","billedMonthly":"Kila mwezi","billedYearly":"Kila mwaka","yearlySave":"Miezi 2 bila malipo","perMonth":"/ mwezi","perYear":"/ mwaka","smallName":"Schools","largeName":"Schools Large","smallStudents":"Hadi wanafunzi 100","largeStudents":"Hadi wanafunzi 500","cta":"Anza jaribio la bure","afterTrial":"Jaribio la bure la siku 14, ghairi wakati wowote."},
  "th": {"h2":"ราคาเดียว ทุกโรงเรียน ทุกที่","billedMonthly":"รายเดือน","billedYearly":"รายปี","yearlySave":"ฟรี 2 เดือน","perMonth":"/ เดือน","perYear":"/ ปี","smallName":"Schools","largeName":"Schools Large","smallStudents":"สูงสุด 100 คน","largeStudents":"สูงสุด 500 คน","cta":"เริ่มทดลองใช้ฟรี","afterTrial":"ทดลองใช้ฟรี 14 วัน ยกเลิกได้ทุกเมื่อ"},
  "vi": {"h2":"Một mức giá, mọi trường học, ở khắp nơi.","billedMonthly":"Hàng tháng","billedYearly":"Hàng năm","yearlySave":"Miễn phí 2 tháng","perMonth":"/ tháng","perYear":"/ năm","smallName":"Schools","largeName":"Schools Large","smallStudents":"Tối đa 100 học sinh","largeStudents":"Tối đa 500 học sinh","cta":"Bắt đầu dùng thử miễn phí","afterTrial":"Dùng thử miễn phí 14 ngày, hủy bất cứ lúc nào."},
  "zh-CN": {"h2":"一个价格，所有学校，遍及各地。","billedMonthly":"按月","billedYearly":"按年","yearlySave":"免费 2 个月","perMonth":"/ 月","perYear":"/ 年","smallName":"Schools","largeName":"Schools Large","smallStudents":"最多 100 名学生","largeStudents":"最多 500 名学生","cta":"开始免费试用","afterTrial":"14 天免费试用，随时取消。"},
  "zh-TW": {"h2":"一個價格，所有學校，遍及各地。","billedMonthly":"按月","billedYearly":"按年","yearlySave":"免費 2 個月","perMonth":"/ 月","perYear":"/ 年","smallName":"Schools","largeName":"Schools Large","smallStudents":"最多 100 名學生","largeStudents":"最多 500 名學生","cta":"開始免費試用","afterTrial":"14 天免費試用，隨時取消。"}
} satisfies Record<string, UsdPricingUI>);


/**
 * Cross-language flagship section copy. Rendered from its own object so the
 * 14 main `T` dicts stay untouched; he/en/ar/ru are native, everything else
 * falls back to English (Gadi's he+en-primary pattern). The one goal is
 * comprehension of the material; cross-language is the strongest tool for
 * it, NOT the whole identity — so the copy frames it as "for every student
 * who hits a hard word", with multilingual students as the sharpest case.
 */
type XLang = {
  tag: string;
  h2: string;
  body1: string;
  body2: string;
  keyline: string;
  demoWordLabel: string;
  demoMeaningLabel: string;
  note: string;
};
const XLANG: Record<string, XLang> = {
  en: {
    tag: "Cross-language",
    h2: "And when the word is in a language the student hasn't fully mastered?",
    body1: "A child reads the lesson in the language of instruction but still thinks in Russian, Amharic, or Arabic. They hit a word they don't know, don't raise their hand, and drown quietly while the class moves on.",
    body2: "In Gadit, that student looks the word up and gets the full meaning in their own language, then keeps reading the lesson. The comprehension barrier is gone in one tap.",
    keyline: "Your multilingual students stop falling behind in every other subject, because they can finally read the material.",
    demoWordLabel: "The lesson says",
    demoMeaningLabel: "The student understands",
    note: "This is not only for new immigrants. It is for every student who hits a hard word, in any of 30+ languages. The goal is understanding the material; this is the strongest tool for it.",
  },
  he: {
    tag: "חוצה שפות",
    h2: "ומה קורה כשהמילה בשפה שהתלמיד עדיין לא שולט בה?",
    body1: "ילד קורא את החומר בשפת ההוראה, אבל עדיין חושב ברוסית, באמהרית או בערבית. הוא נתקל במילה שאינו מכיר, לא מרים יד, וטובע בשקט בזמן שהכיתה ממשיכה הלאה.",
    body2: "ב-Gadit אותו תלמיד מחפש את המילה ומקבל את המשמעות המלאה בשפה שלו, וממשיך לקרוא את השיעור. מחסום ההבנה נעלם בהקשה אחת.",
    keyline: "התלמידים הרב-לשוניים שלך מפסיקים לפגר בכל מקצוע אחר, כי סוף סוף הם מצליחים לקרוא את החומר.",
    demoWordLabel: "בשיעור כתוב",
    demoMeaningLabel: "התלמיד מבין",
    note: "זה לא רק לעולים חדשים. זה לכל תלמיד שנתקל במילה קשה, בכל אחת מ-30+ שפות. המטרה היא הבנת החומר, וזה הכלי החזק ביותר עבורה.",
  },
  ar: {
    tag: "عبر اللغات",
    h2: "وماذا لو كانت الكلمة بلغة لم يتقنها الطالب بعد؟",
    body1: "يقرأ الطفل الدرس بلغة التدريس لكنه لا يزال يفكر بالروسية أو الأمهرية أو العربية. يصادف كلمة لا يعرفها، لا يرفع يده، ويغرق بصمت بينما يمضي الصف قدمًا.",
    body2: "في Gadit يبحث ذلك الطالب عن الكلمة فيحصل على معناها الكامل بلغته، ثم يواصل قراءة الدرس. يختفي حاجز الفهم بنقرة واحدة.",
    keyline: "طلابك متعددو اللغات يتوقفون عن التأخر في كل مادة أخرى، لأنهم أخيرًا يستطيعون قراءة المحتوى.",
    demoWordLabel: "الدرس يقول",
    demoMeaningLabel: "الطالب يفهم",
    note: "هذا ليس للقادمين الجدد فقط. إنه لكل طالب يصادف كلمة صعبة، بأي من 30+ لغة. الهدف هو فهم المحتوى، وهذه أقوى أداة لذلك.",
  },
  ru: {
    tag: "Между языками",
    h2: "А если слово на языке, которым ученик ещё не владеет?",
    body1: "Ребёнок читает урок на языке обучения, но всё ещё думает по-русски, на амхарском или арабском. Он встречает незнакомое слово, не поднимает руку и молча тонет, пока класс движется дальше.",
    body2: "В Gadit этот ученик ищет слово и получает полное значение на своём языке, а затем продолжает читать урок. Барьер понимания исчезает одним касанием.",
    keyline: "Ваши многоязычные ученики перестают отставать по всем другим предметам, потому что наконец могут читать материал.",
    demoWordLabel: "В уроке написано",
    demoMeaningLabel: "Ученик понимает",
    note: "Это не только для новых репатриантов. Это для каждого ученика, который встречает трудное слово, на любом из 30+ языков. Цель — понимание материала, и это самый сильный инструмент для этого.",
  },
};

// 30 languages for the cross-language section (was en/he/ar only), added
// 2026-08-22 so it is native instead of English fallback on the schools page.
Object.assign(XLANG, {
  "ru": {"tag":"Межъязыковой доступ","h2":"А если слово на языке, которым ученик ещё не владеет свободно?","body1":"Ребёнок читает урок на языке обучения, но по-прежнему думает на русском, амхарском или арабском. Он натыкается на незнакомое слово, не поднимает руку и тихо тонет, пока класс идёт дальше.","body2":"В Gadit такой ученик находит это слово и получает полное значение на своём родном языке, а затем продолжает читать урок. Барьер понимания исчезает за одно касание.","keyline":"Ваши многоязычные ученики перестают отставать по всем остальным предметам, потому что наконец-то могут прочитать материал.","demoWordLabel":"В уроке сказано","demoMeaningLabel":"Ученик понимает","note":"Это не только для новых репатриантов. Это для каждого ученика, который встречает трудное слово, на любом из более чем 30+ языков. Цель — понять материал, и это самый сильный инструмент для этого."},
  "es": {"tag":"Entre idiomas","h2":"¿Y cuando la palabra está en un idioma que el alumno aún no domina del todo?","body1":"Un niño lee la lección en el idioma de enseñanza, pero sigue pensando en ruso, amárico o árabe. Se topa con una palabra que no conoce, no levanta la mano y se hunde en silencio mientras la clase avanza.","body2":"En Gadit, ese alumno busca la palabra y obtiene el significado completo en su propio idioma, y luego sigue leyendo la lección. La barrera de comprensión desaparece con un solo toque.","keyline":"Tus alumnos multilingües dejan de quedarse atrás en todas las demás materias, porque por fin pueden leer el material.","demoWordLabel":"La lección dice","demoMeaningLabel":"El alumno entiende","note":"Esto no es solo para recién llegados. Es para cada alumno que se topa con una palabra difícil, en cualquiera de más de 30+ idiomas. El objetivo es comprender el material, y esta es la herramienta más potente para lograrlo."},
  "pt": {"tag":"Entre idiomas","h2":"E quando a palavra está num idioma que o aluno ainda não domina por completo?","body1":"Uma criança lê a aula no idioma de ensino, mas continua a pensar em russo, amárico ou árabe. Ela esbarra numa palavra que não conhece, não levanta a mão e afunda em silêncio enquanto a turma segue em frente.","body2":"No Gadit, esse aluno procura a palavra e recebe o significado completo no seu próprio idioma, e depois continua a ler a aula. A barreira de compreensão desaparece com um único toque.","keyline":"Os seus alunos multilíngues param de ficar para trás em todas as outras disciplinas, porque finalmente conseguem ler o material.","demoWordLabel":"A aula diz","demoMeaningLabel":"O aluno entende","note":"Isto não é só para recém-imigrantes. É para cada aluno que esbarra numa palavra difícil, em qualquer um de mais de 30+ idiomas. O objetivo é compreender o material, e esta é a ferramenta mais forte para isso."},
  "fr": {"tag":"Entre les langues","h2":"Et quand le mot est dans une langue que l'élève ne maîtrise pas encore vraiment ?","body1":"Un enfant lit la leçon dans la langue d'enseignement, mais pense toujours en russe, en amharique ou en arabe. Il bute sur un mot qu'il ne connaît pas, ne lève pas la main et coule en silence pendant que la classe avance.","body2":"Dans Gadit, cet élève cherche le mot et obtient le sens complet dans sa propre langue, puis reprend la lecture de la leçon. La barrière de compréhension tombe en une seule touche.","keyline":"Vos élèves multilingues cessent de prendre du retard dans toutes les autres matières, parce qu'ils peuvent enfin lire le contenu.","demoWordLabel":"La leçon dit","demoMeaningLabel":"L'élève comprend","note":"Ce n'est pas seulement pour les nouveaux immigrants. C'est pour chaque élève qui bute sur un mot difficile, dans l'une des plus de 30+ langues. Le but, c'est de comprendre le contenu, et voici l'outil le plus puissant pour y arriver."},
  "de": {"tag":"Sprachübergreifend","h2":"Und wenn das Wort in einer Sprache steht, die der Schüler noch nicht ganz beherrscht?","body1":"Ein Kind liest den Unterrichtsstoff in der Unterrichtssprache, denkt aber weiterhin auf Russisch, Amharisch oder Arabisch. Es stößt auf ein unbekanntes Wort, meldet sich nicht und geht still unter, während die Klasse weitermacht.","body2":"In Gadit schlägt dieser Schüler das Wort nach und erhält die volle Bedeutung in seiner eigenen Sprache, und liest dann weiter im Unterrichtsstoff. Die Verständnisbarriere fällt mit einer einzigen Berührung.","keyline":"Ihre mehrsprachigen Schüler fallen in allen anderen Fächern nicht länger zurück, weil sie den Stoff endlich lesen können.","demoWordLabel":"Im Text steht","demoMeaningLabel":"Der Schüler versteht","note":"Das ist nicht nur für Neuzugewanderte. Es ist für jeden Schüler, der auf ein schwieriges Wort stößt, in einer von mehr als 30+ Sprachen. Das Ziel ist, den Stoff zu verstehen, und dies ist das stärkste Werkzeug dafür."},
  "cs": {"tag":"Napříč jazyky","h2":"A co když je slovo v jazyce, který žák ještě plně neovládá?","body1":"Dítě čte látku ve vyučovacím jazyce, ale stále přemýšlí rusky, amharsky nebo arabsky. Narazí na neznámé slovo, nezvedne ruku a tiše se topí, zatímco třída pokračuje dál.","body2":"V Gadit si takový žák slovo vyhledá a dostane jeho úplný význam ve vlastním jazyce, a pak pokračuje ve čtení látky. Bariéra porozumění zmizí jediným dotykem.","keyline":"Vaši vícejazyční žáci přestanou zaostávat ve všech ostatních předmětech, protože konečně dokážou látku přečíst.","demoWordLabel":"V látce stojí","demoMeaningLabel":"Žák rozumí","note":"Není to jen pro nové přistěhovalce. Je to pro každého žáka, který narazí na těžké slovo, v kterémkoli z více než 30+ jazyků. Cílem je porozumět látce, a tohle je nejsilnější nástroj, jak toho dosáhnout."},
  "sk": {"tag":"Naprieč jazykmi","h2":"A čo keď je slovo v jazyku, ktorý žiak ešte plne neovláda?","body1":"Dieťa číta učivo vo vyučovacom jazyku, ale stále rozmýšľa po rusky, amharsky alebo arabsky. Narazí na neznáme slovo, nezdvihne ruku a ticho sa topí, kým trieda pokračuje ďalej.","body2":"V Gadit si takýto žiak slovo vyhľadá a dostane jeho úplný význam vo vlastnom jazyku, a potom pokračuje v čítaní učiva. Bariéra porozumenia zmizne jediným dotykom.","keyline":"Vaši viacjazyční žiaci prestanú zaostávať vo všetkých ostatných predmetoch, pretože konečne dokážu učivo prečítať.","demoWordLabel":"V učive sa píše","demoMeaningLabel":"Žiak rozumie","note":"Nie je to len pre nových prisťahovalcov. Je to pre každého žiaka, ktorý narazí na ťažké slovo, v ktoromkoľvek z viac než 30+ jazykov. Cieľom je porozumieť učivu, a toto je najsilnejší nástroj, ako to dosiahnuť."},
  "it": {"tag":"Tra le lingue","h2":"E quando la parola è in una lingua che lo studente non padroneggia ancora del tutto?","body1":"Un bambino legge la lezione nella lingua di insegnamento, ma continua a pensare in russo, amarico o arabo. Incontra una parola che non conosce, non alza la mano e affonda in silenzio mentre la classe va avanti.","body2":"In Gadit, quello studente cerca la parola e ottiene il significato completo nella propria lingua, e poi riprende a leggere la lezione. La barriera di comprensione scompare con un solo tocco.","keyline":"I tuoi studenti multilingue smettono di restare indietro in tutte le altre materie, perché finalmente riescono a leggere il materiale.","demoWordLabel":"La lezione dice","demoMeaningLabel":"Lo studente capisce","note":"Non è solo per i nuovi immigrati. È per ogni studente che incontra una parola difficile, in una qualsiasi delle oltre 30+ lingue. L'obiettivo è capire il materiale, e questo è lo strumento più potente per farlo."},
  "ja": {"tag":"言語をまたいで","h2":"その単語が、生徒がまだ十分に習得していない言語だったら?","body1":"子どもは指導言語で授業を読んでいても、頭の中ではまだロシア語やアムハラ語、アラビア語で考えています。知らない単語にぶつかっても手を挙げず、クラスが先へ進むなか、静かに溺れていきます。","body2":"Gaditなら、その生徒は単語を調べて自分の母語で完全な意味を受け取り、そのまま授業を読み続けられます。理解の壁が、ワンタップで消えます。","keyline":"多言語の生徒たちは、他のすべての教科で遅れをとらなくなります。ようやく教材を読めるようになるからです。","demoWordLabel":"授業ではこう書かれている","demoMeaningLabel":"生徒はこう理解する","note":"これは新しく来た移民だけのものではありません。難しい単語にぶつかるすべての生徒のためのもので、30+以上のあらゆる言語に対応します。目的は教材を理解することであり、そのための最も強力なツールです。"},
  "hi": {"tag":"भाषाओं के पार","h2":"और जब शब्द उस भाषा में हो जिस पर छात्र की अभी पूरी पकड़ नहीं है?","body1":"एक बच्चा पाठ शिक्षा की भाषा में पढ़ता है, पर सोचता अब भी रूसी, अम्हारिक या अरबी में है। वह किसी अनजान शब्द पर अटक जाता है, हाथ नहीं उठाता, और जब कक्षा आगे बढ़ती रहती है तो चुपचाप पिछड़ता जाता है।","body2":"Gadit में वह छात्र उस शब्द को खोजता है और उसका पूरा अर्थ अपनी ही भाषा में पा लेता है, और फिर पाठ पढ़ना जारी रखता है। समझ की दीवार एक ही टैप में गिर जाती है।","keyline":"आपके बहुभाषी छात्र हर दूसरे विषय में पिछड़ना बंद कर देते हैं, क्योंकि अब वे आखिरकार सामग्री पढ़ पाते हैं।","demoWordLabel":"पाठ में लिखा है","demoMeaningLabel":"छात्र समझ पाता है","note":"यह केवल नए प्रवासियों के लिए नहीं है। यह हर उस छात्र के लिए है जो किसी कठिन शब्द पर अटकता है, 30+ से अधिक भाषाओं में से किसी में भी। लक्ष्य है सामग्री को समझना, और इसके लिए यह सबसे सशक्त उपकरण है।"},
  "am": {"tag":"በቋንቋዎች መካከል","h2":"ቃሉ ተማሪው ገና ሙሉ በሙሉ ባልተካነበት ቋንቋ ቢሆንስ?","body1":"አንድ ልጅ ትምህርቱን በማስተማሪያ ቋንቋ ያነባል፣ ግን አሁንም በሩስኛ፣ በአማርኛ ወይም በዐረብኛ ያስባል። የማያውቀውን ቃል ሲያጋጥመው እጁን አያነሳም፣ ክፍሉ ወደፊት እየሄደ ሳለ በጸጥታ ይሰጥማል።","body2":"በGadit ውስጥ ያ ተማሪ ቃሉን ይፈልጋል፣ ሙሉ ትርጉሙን በራሱ ቋንቋ ያገኛል፣ ከዚያም ትምህርቱን ማንበብ ይቀጥላል። የመረዳት እንቅፋቱ በአንድ ንክኪ ይጠፋል።","keyline":"ባለብዙ ቋንቋ ተማሪዎችዎ በሁሉም ሌሎች ትምህርቶች ወደኋላ መቅረት ያቆማሉ፣ ምክንያቱም በመጨረሻ ይዘቱን ማንበብ ስለሚችሉ ነው።","demoWordLabel":"ትምህርቱ ይላል","demoMeaningLabel":"ተማሪው ይረዳል","note":"ይህ ለአዲስ ስደተኞች ብቻ አይደለም። ከባድ ቃል ለሚያጋጥመው ለእያንዳንዱ ተማሪ ነው፣ ከ30+ በላይ ቋንቋዎች በማንኛውም። ግቡ ይዘቱን መረዳት ነው፣ ለዚህም ይህ በጣም ኃይለኛ መሣሪያ ነው።"},
  "uk": {"tag":"Між мовами","h2":"А якщо слово тією мовою, якою учень ще не володіє вільно?","body1":"Дитина читає урок мовою навчання, але досі думає російською, амхарською чи арабською. Вона натрапляє на незнайоме слово, не піднімає руку і тихо тоне, поки клас рухається далі.","body2":"У Gadit такий учень знаходить це слово й отримує повне значення своєю рідною мовою, а потім читає урок далі. Бар'єр розуміння зникає за один дотик.","keyline":"Ваші багатомовні учні перестають відставати з усіх інших предметів, бо нарешті можуть прочитати матеріал.","demoWordLabel":"В уроці сказано","demoMeaningLabel":"Учень розуміє","note":"Це не лише для нових репатріантів. Це для кожного учня, який натрапляє на складне слово, будь-якою з понад 30+ мов. Мета — зрозуміти матеріал, і це найпотужніший інструмент для цього."},
  "tr": {"tag":"Diller arası","h2":"Ya kelime, öğrencinin henüz tam olarak hâkim olmadığı bir dildeyse?","body1":"Bir çocuk dersi öğretim dilinde okur ama hâlâ Rusça, Amharca ya da Arapça düşünür. Bilmediği bir kelimeye takılır, elini kaldırmaz ve sınıf ilerlerken sessizce boğulur.","body2":"Gadit'te o öğrenci kelimeyi arar ve tam anlamını kendi dilinde alır, sonra dersi okumaya devam eder. Anlama engeli tek dokunuşla ortadan kalkar.","keyline":"Çok dilli öğrencileriniz diğer tüm derslerde geride kalmayı bırakır, çünkü artık materyali okuyabiliyorlardır.","demoWordLabel":"Derste şöyle diyor","demoMeaningLabel":"Öğrenci şöyle anlıyor","note":"Bu yalnızca yeni göçmenler için değil. Zor bir kelimeye takılan her öğrenci için, 30+ dilden herhangi birinde. Amaç materyali anlamaktır ve bu, bunun için en güçlü araçtır."},
  "pl": {"tag":"Między językami","h2":"A gdy słowo jest w języku, którego uczeń jeszcze w pełni nie opanował?","body1":"Dziecko czyta lekcję w języku nauczania, ale wciąż myśli po rosyjsku, amharsku albo arabsku. Natrafia na nieznane słowo, nie podnosi ręki i po cichu tonie, podczas gdy klasa idzie dalej.","body2":"W Gadit taki uczeń wyszukuje to słowo i dostaje pełne znaczenie we własnym języku, a potem czyta lekcję dalej. Bariera zrozumienia znika za jednym dotknięciem.","keyline":"Twoi wielojęzyczni uczniowie przestają zostawać w tyle we wszystkich innych przedmiotach, bo w końcu potrafią przeczytać materiał.","demoWordLabel":"W lekcji jest napisane","demoMeaningLabel":"Uczeń rozumie","note":"To nie tylko dla nowych imigrantów. To dla każdego ucznia, który natrafia na trudne słowo, w dowolnym z ponad 30+ języków. Celem jest zrozumienie materiału, a to najsilniejsze narzędzie, żeby to osiągnąć."},
  "fa": {"tag":"میان‌زبانی","h2":"و وقتی واژه به زبانی است که دانش‌آموز هنوز کاملاً بر آن مسلط نیست چه؟","body1":"کودکی درس را به زبان آموزش می‌خواند اما هنوز به روسی، امهری یا عربی فکر می‌کند. به واژه‌ای ناآشنا برمی‌خورد، دستش را بلند نمی‌کند و در حالی که کلاس پیش می‌رود، بی‌صدا غرق می‌شود.","body2":"در Gadit، آن دانش‌آموز واژه را جست‌وجو می‌کند و معنای کامل آن را به زبان خودش می‌گیرد، و سپس به خواندن درس ادامه می‌دهد. سد فهم با یک لمس از میان می‌رود.","keyline":"دانش‌آموزان چندزبانه‌ی شما دیگر در همه‌ی درس‌های دیگر عقب نمی‌مانند، چون بالاخره می‌توانند مطلب را بخوانند.","demoWordLabel":"در درس آمده است","demoMeaningLabel":"دانش‌آموز می‌فهمد","note":"این فقط برای مهاجران تازه‌وارد نیست. برای هر دانش‌آموزی است که به واژه‌ای دشوار برمی‌خورد، به هر یک از بیش از 30+ زبان. هدف فهمیدن مطلب است، و این نیرومندترین ابزار برای آن است."},
  "id": {"tag":"Lintas bahasa","h2":"Dan bagaimana kalau katanya dalam bahasa yang belum sepenuhnya dikuasai siswa?","body1":"Seorang anak membaca pelajaran dalam bahasa pengantar, tetapi masih berpikir dalam bahasa Rusia, Amhar, atau Arab. Ia menemukan kata yang tak dikenalnya, tidak mengangkat tangan, dan tenggelam dalam diam sementara kelas terus berjalan.","body2":"Di Gadit, siswa itu mencari katanya dan mendapatkan makna lengkapnya dalam bahasanya sendiri, lalu melanjutkan membaca pelajaran. Penghalang pemahaman lenyap hanya dengan satu ketukan.","keyline":"Siswa multibahasa Anda berhenti tertinggal di semua mata pelajaran lain, karena mereka akhirnya bisa membaca materinya.","demoWordLabel":"Pelajaran mengatakan","demoMeaningLabel":"Siswa memahami","note":"Ini bukan hanya untuk imigran baru. Ini untuk setiap siswa yang menemukan kata sulit, dalam salah satu dari lebih dari 30+ bahasa. Tujuannya adalah memahami materi, dan inilah alat paling ampuh untuk itu."},
  "nl": {"tag":"Tussen talen","h2":"En als het woord in een taal staat die de leerling nog niet helemaal beheerst?","body1":"Een kind leest de les in de instructietaal, maar denkt nog steeds in het Russisch, Amhaars of Arabisch. Het stuit op een woord dat het niet kent, steekt zijn hand niet op en verdrinkt in stilte terwijl de klas verder gaat.","body2":"In Gadit zoekt die leerling het woord op en krijgt de volledige betekenis in de eigen taal, en leest dan verder in de les. De begripsdrempel is met één tik verdwenen.","keyline":"Uw meertalige leerlingen raken niet langer achterop in alle andere vakken, omdat ze de stof eindelijk kunnen lezen.","demoWordLabel":"In de les staat","demoMeaningLabel":"De leerling begrijpt","note":"Dit is niet alleen voor nieuwkomers. Het is voor elke leerling die op een moeilijk woord stuit, in een van de meer dan 30+ talen. Het doel is de stof begrijpen, en dit is daarvoor het krachtigste hulpmiddel."},
  "el": {"tag":"Ανάμεσα στις γλώσσες","h2":"Και όταν η λέξη είναι σε μια γλώσσα που ο μαθητής δεν κατέχει ακόμη πλήρως;","body1":"Ένα παιδί διαβάζει το μάθημα στη γλώσσα διδασκαλίας, αλλά εξακολουθεί να σκέφτεται στα ρωσικά, στα αμχαρικά ή στα αραβικά. Σκοντάφτει σε μια λέξη που δεν ξέρει, δεν σηκώνει το χέρι και πνίγεται σιωπηλά καθώς η τάξη προχωρά.","body2":"Στο Gadit, αυτός ο μαθητής αναζητά τη λέξη και παίρνει την πλήρη σημασία της στη δική του γλώσσα, και μετά συνεχίζει να διαβάζει το μάθημα. Το εμπόδιο της κατανόησης εξαφανίζεται με ένα άγγιγμα.","keyline":"Οι πολύγλωσσοι μαθητές σας σταματούν να μένουν πίσω σε όλα τα άλλα μαθήματα, επειδή επιτέλους μπορούν να διαβάσουν την ύλη.","demoWordLabel":"Το μάθημα λέει","demoMeaningLabel":"Ο μαθητής καταλαβαίνει","note":"Αυτό δεν είναι μόνο για τους νεοφερμένους μετανάστες. Είναι για κάθε μαθητή που σκοντάφτει σε μια δύσκολη λέξη, σε οποιαδήποτε από τις πάνω από 30+ γλώσσες. Ο στόχος είναι να κατανοήσει την ύλη, και αυτό είναι το ισχυρότερο εργαλείο γι' αυτό."},
  "zu": {"tag":"Phakathi kwezilimi","h2":"Kuthiwani-ke uma igama likulimi umfundi angakabi nakho ukulazi ngokugcwele?","body1":"Ingane ifunda isifundo ngolimi lokufundisa, kodwa isacabanga ngesiRashiya, isi-Amharic noma isi-Arabhu. Ihlangana negama engalazi, ayiphakamisi isandla, futhi iyaminza buthule kuyilapho ikilasi liqhubeka.","body2":"Ku-Gadit, lowo mfundi uyalibhukuda igama athole incazelo egcwele ngolimi lwakhe, bese eqhubeka nokufunda isifundo. Isithiyo sokuqonda siyanyamalala ngokuthinta okukodwa.","keyline":"Abafundi bakho abakhuluma izilimi eziningi bayeka ukusalela emuva kuzo zonke ezinye izifundo, ngoba ekugcineni sebekwazi ukufunda izinto.","demoWordLabel":"Isifundo sithi","demoMeaningLabel":"Umfundi uyaqonda","note":"Lokhu akukona nje okwabafiki abasha kuphela. Kungokwawo wonke umfundi ohlangana negama elinzima, kunoma yiluphi ulimi kwezingaphezu kuka-30+. Umgomo ukuqonda okufundwayo, futhi leli yithuluzi elinamandla kunawo wonke ukwenza lokho."},
  "af": {"tag":"Oor tale heen","h2":"En wanneer die woord in 'n taal is wat die leerder nog nie heeltemal bemeester het nie?","body1":"'n Kind lees die les in die onderrigtaal, maar dink steeds in Russies, Amharies of Arabies. Hy stamp teen 'n woord wat hy nie ken nie, steek nie sy hand op nie, en verdrink stil-stil terwyl die klas aangaan.","body2":"In Gadit soek daardie leerder die woord op en kry die volle betekenis in sy eie taal, en lees dan verder aan die les. Die begripsversperring is met een tik weg.","keyline":"Jou veeltalige leerders raak nie meer agter in al die ander vakke nie, want hulle kan die materiaal uiteindelik lees.","demoWordLabel":"Die les sê","demoMeaningLabel":"Die leerder verstaan","note":"Dit is nie net vir nuwe immigrante nie. Dit is vir elke leerder wat teen 'n moeilike woord vasloop, in enige van meer as 30+ tale. Die doel is om die materiaal te verstaan, en dit is die sterkste hulpmiddel daarvoor."},
  "bn": {"tag":"ভাষার সীমা পেরিয়ে","h2":"আর শব্দটি যখন এমন ভাষায় যা শিক্ষার্থী এখনও পুরোপুরি রপ্ত করেনি?","body1":"একটি শিশু পাঠদানের ভাষায় পড়া পড়ে, কিন্তু এখনও ভাবে রুশ, আমহারিক বা আরবিতে। অচেনা একটি শব্দে সে আটকে যায়, হাত তোলে না, আর ক্লাস এগিয়ে যাওয়ার সময় নীরবে ডুবতে থাকে।","body2":"Gadit-এ সেই শিক্ষার্থী শব্দটি খুঁজে নেয় এবং নিজের ভাষায় তার পূর্ণ অর্থ পায়, তারপর পড়া চালিয়ে যায়। বোঝার বাধা এক ছোঁয়াতেই দূর হয়ে যায়।","keyline":"আপনার বহুভাষী শিক্ষার্থীরা আর অন্য সব বিষয়ে পিছিয়ে পড়ে না, কারণ তারা অবশেষে পড়ার বিষয়টি পড়তে পারে।","demoWordLabel":"পাঠে লেখা আছে","demoMeaningLabel":"শিক্ষার্থী বোঝে","note":"এটি কেবল নতুন অভিবাসীদের জন্য নয়। এটি প্রতিটি শিক্ষার্থীর জন্য যে কোনো কঠিন শব্দে আটকে যায়, 30+ এর বেশি ভাষার যেকোনো একটিতে। লক্ষ্য হলো বিষয়টি বোঝা, আর এর জন্য এটিই সবচেয়ে শক্তিশালী হাতিয়ার।"},
  "da": {"tag":"På tværs af sprog","h2":"Og når ordet er på et sprog, eleven endnu ikke helt behersker?","body1":"Et barn læser lektionen på undervisningssproget, men tænker stadig på russisk, amharisk eller arabisk. Det støder på et ord, det ikke kender, rækker ikke hånden op og drukner i stilhed, mens klassen kører videre.","body2":"I Gadit slår den elev ordet op og får den fulde betydning på sit eget sprog, og læser så videre i lektionen. Forståelsesbarrieren er væk med ét tryk.","keyline":"Dine flersprogede elever holder op med at sakke bagud i alle de andre fag, fordi de endelig kan læse stoffet.","demoWordLabel":"I lektionen står der","demoMeaningLabel":"Eleven forstår","note":"Det er ikke kun for nyankomne indvandrere. Det er for hver eneste elev, der støder på et svært ord, på et af de mere end 30+ sprog. Målet er at forstå stoffet, og dette er det stærkeste værktøj til det."},
  "fil": {"tag":"Sa pagitan ng mga wika","h2":"At paano kung ang salita ay nasa wikang hindi pa lubos na nauunawaan ng mag-aaral?","body1":"Binabasa ng isang bata ang aralin sa wikang panturo, ngunit nag-iisip pa rin siya sa Ruso, Amharic, o Arabe. Natitigil siya sa isang salitang hindi niya alam, hindi siya nagtataas ng kamay, at tahimik na nalulunod habang patuloy ang klase.","body2":"Sa Gadit, hinahanap ng mag-aaral na iyon ang salita at nakukuha ang buong kahulugan sa sarili niyang wika, at pagkatapos ay ipinagpapatuloy ang pagbabasa ng aralin. Nawawala ang hadlang sa pag-unawa sa isang tapik lamang.","keyline":"Hindi na naiiwan ang iyong mga mag-aaral na maraming wika sa lahat ng ibang asignatura, dahil sa wakas ay kaya na nilang basahin ang materyal.","demoWordLabel":"Sabi ng aralin","demoMeaningLabel":"Naiintindihan ng mag-aaral","note":"Hindi lamang ito para sa mga bagong dayuhan. Para ito sa bawat mag-aaral na natitigil sa isang mahirap na salita, sa alinman sa mahigit 30+ na wika. Ang layunin ay maunawaan ang materyal, at ito ang pinakamalakas na kasangkapan para roon."},
  "hu": {"tag":"Nyelvek között","h2":"És mi van, ha a szó olyan nyelven van, amelyet a diák még nem sajátított el teljesen?","body1":"A gyerek a tanítás nyelvén olvassa a leckét, de még mindig oroszul, amharául vagy arabul gondolkodik. Belebotlik egy ismeretlen szóba, nem teszi fel a kezét, és csendben elmerül, miközben az osztály halad tovább.","body2":"A Gaditban ez a diák kikeresi a szót, és megkapja a teljes jelentését a saját nyelvén, majd tovább olvassa a leckét. A megértés akadálya egyetlen érintéssel eltűnik.","keyline":"A többnyelvű diákjai nem maradnak le többé az összes többi tantárgyból, mert végre el tudják olvasni az anyagot.","demoWordLabel":"A leckében ez áll","demoMeaningLabel":"A diák így érti","note":"Ez nem csak az újonnan érkezett bevándorlóknak szól. Minden diáknak szól, aki nehéz szóba botlik, a több mint 30+ nyelv bármelyikén. A cél az anyag megértése, és erre ez a legerősebb eszköz."},
  "ko": {"tag":"언어를 넘어","h2":"그런데 그 단어가 학생이 아직 완전히 익히지 못한 언어라면요?","body1":"아이는 수업을 교육 언어로 읽지만 여전히 러시아어, 암하라어, 아랍어로 생각합니다. 모르는 단어에 부딪혀도 손을 들지 않고, 수업이 계속 나아가는 동안 조용히 뒤처져 갑니다.","body2":"Gadit에서는 그 학생이 단어를 찾아 자기 모국어로 완전한 뜻을 얻고, 그런 다음 수업을 계속 읽어 나갑니다. 이해의 장벽이 한 번의 터치로 사라집니다.","keyline":"여러 언어를 쓰는 학생들이 다른 모든 과목에서 뒤처지지 않게 됩니다. 마침내 교재를 읽을 수 있기 때문입니다.","demoWordLabel":"수업에는 이렇게 나와 있습니다","demoMeaningLabel":"학생은 이렇게 이해합니다","note":"이것은 새로 온 이민자만을 위한 것이 아닙니다. 어려운 단어에 부딪히는 모든 학생을 위한 것이며, 30+개가 넘는 언어 어느 것이든 지원합니다. 목표는 교재를 이해하는 것이고, 이것이 그것을 위한 가장 강력한 도구입니다."},
  "sw": {"tag":"Kati ya lugha","h2":"Na je, neno linapokuwa katika lugha ambayo mwanafunzi bado hajaimudu kikamilifu?","body1":"Mtoto husoma somo kwa lugha ya kufundishia, lakini bado anafikiri kwa Kirusi, Kiamhari au Kiarabu. Anakwama kwenye neno asilolijua, hainui mkono, na anazama kimya huku darasa likiendelea mbele.","body2":"Katika Gadit, mwanafunzi huyo hutafuta neno na kupata maana yake kamili kwa lugha yake mwenyewe, kisha anaendelea kusoma somo. Kizuizi cha kuelewa hutoweka kwa mguso mmoja.","keyline":"Wanafunzi wako wanaozungumza lugha nyingi huacha kubaki nyuma katika kila somo lingine, kwa sababu hatimaye wanaweza kusoma yaliyomo.","demoWordLabel":"Somo linasema","demoMeaningLabel":"Mwanafunzi anaelewa","note":"Hii si kwa wahamiaji wapya pekee. Ni kwa kila mwanafunzi anayekwama kwenye neno gumu, katika lugha yoyote kati ya zaidi ya 30+. Lengo ni kuelewa yaliyomo, na hiki ndicho chombo chenye nguvu zaidi kwa ajili hiyo."},
  "th": {"tag":"ข้ามภาษา","h2":"แล้วถ้าคำนั้นอยู่ในภาษาที่นักเรียนยังเชี่ยวชาญไม่เต็มที่ล่ะ?","body1":"เด็กอ่านบทเรียนด้วยภาษาที่ใช้สอน แต่ยังคงคิดเป็นภาษารัสเซีย อัมฮาริก หรืออาหรับ เขาสะดุดคำที่ไม่รู้จัก ไม่ยกมือถาม และค่อยๆ จมลงเงียบๆ ขณะที่ชั้นเรียนเดินหน้าต่อไป","body2":"ใน Gadit นักเรียนคนนั้นค้นหาคำและได้ความหมายเต็มในภาษาของตัวเอง แล้วอ่านบทเรียนต่อได้เลย กำแพงความเข้าใจหายไปในการแตะเพียงครั้งเดียว","keyline":"นักเรียนหลายภาษาของคุณเลิกตามหลังในทุกวิชาที่เหลือ เพราะในที่สุดพวกเขาก็อ่านเนื้อหาได้","demoWordLabel":"บทเรียนบอกว่า","demoMeaningLabel":"นักเรียนเข้าใจว่า","note":"นี่ไม่ใช่แค่สำหรับผู้อพยพใหม่เท่านั้น แต่สำหรับนักเรียนทุกคนที่สะดุดคำยาก ในภาษาใดก็ได้จากกว่า 30+ ภาษา เป้าหมายคือการเข้าใจเนื้อหา และนี่คือเครื่องมือที่ทรงพลังที่สุดสำหรับสิ่งนั้น"},
  "vi": {"tag":"Xuyên ngôn ngữ","h2":"Và khi từ đó thuộc một ngôn ngữ mà học sinh chưa thật sự thành thạo thì sao?","body1":"Một đứa trẻ đọc bài học bằng ngôn ngữ giảng dạy, nhưng vẫn nghĩ bằng tiếng Nga, tiếng Amhara hay tiếng Ả Rập. Em gặp một từ không biết, không giơ tay, và lặng lẽ chìm dần trong khi cả lớp cứ tiến về phía trước.","body2":"Trong Gadit, học sinh ấy tra từ và nhận được nghĩa đầy đủ bằng chính ngôn ngữ của mình, rồi tiếp tục đọc bài học. Rào cản hiểu bài biến mất chỉ với một lần chạm.","keyline":"Học sinh đa ngôn ngữ của bạn thôi tụt lại ở mọi môn học khác, vì cuối cùng các em đã đọc được tài liệu.","demoWordLabel":"Bài học viết","demoMeaningLabel":"Học sinh hiểu","note":"Điều này không chỉ dành cho người nhập cư mới. Nó dành cho mọi học sinh gặp một từ khó, trong bất kỳ ngôn ngữ nào trong hơn 30+ ngôn ngữ. Mục tiêu là hiểu tài liệu, và đây là công cụ mạnh nhất cho việc đó."},
  "zh-CN": {"tag":"跨越语言","h2":"如果这个词所用的语言，学生还没有完全掌握呢？","body1":"孩子用教学语言读课文，脑子里却还在用俄语、阿姆哈拉语或阿拉伯语思考。他撞上一个不认识的词，不举手发问，在全班继续往下讲时悄悄地沉了下去。","body2":"在 Gadit 里，这名学生查一下这个词，就能用自己的母语得到完整的释义，然后继续读课文。理解的障碍，一触即消。","keyline":"你的多语言学生不再在其他每一门科目上掉队，因为他们终于读得懂教材了。","demoWordLabel":"课文写着","demoMeaningLabel":"学生理解为","note":"这不仅仅是为新移民准备的。它面向每一个撞上难词的学生，支持 30+ 种以上的任何一种语言。目标是理解教材，而这是为此而生的最有力的工具。"},
  "zh-TW": {"tag":"跨越語言","h2":"如果這個詞所用的語言，學生還沒有完全掌握呢？","body1":"孩子用教學語言讀課文，腦子裡卻還在用俄語、阿姆哈拉語或阿拉伯語思考。他撞上一個不認識的詞，不舉手發問，在全班繼續往下講時悄悄地沉了下去。","body2":"在 Gadit 裡，這名學生查一下這個詞，就能用自己的母語得到完整的釋義，然後繼續讀課文。理解的障礙，一觸即消。","keyline":"你的多語言學生不再在其他每一門科目上落後，因為他們終於讀得懂教材了。","demoWordLabel":"課文寫著","demoMeaningLabel":"學生理解為","note":"這不只是為新移民準備的。它面向每一個撞上難詞的學生，支援 30+ 種以上的任何一種語言。目標是理解教材，而這是為此而生的最有力的工具。"}
} satisfies Record<string, XLang>);


// Fixed cross-language demo — same content in every UI language (like the
// teacher mockup). A word from the lesson, understood in three of the
// student's languages. Shows the superpower concretely without depending
// on the viewer's language.
const XLANG_DEMO = {
  word: "photosynthesis",
  meanings: [
    { lang: "Русский", text: "Процесс, которым растения превращают свет в пищу." },
    { lang: "العربية", text: "العملية التي تحوّل بها النباتات الضوء إلى غذاء.", dir: "rtl" as const },
    { lang: "አማርኛ", text: "ተክሎች ብርሃንን ወደ ምግብ የሚቀይሩበት ሂደት።" },
  ],
};

export function SchoolsLandingClient({ standalone = false }: { standalone?: boolean } = {}) {
  const { user, schoolId, promptLogin } = useAuth();
  const { lang, dir } = useLang();
  const href = useHref();
  const router = useRouter();
  const t = COPY[lang] ?? COPY.en;
  const xt = XLANG[lang] ?? XLANG.en;
  const pu = PRICING_UI[lang] ?? PRICING_UI.en;
  const upu = USD_PRICING_UI[lang] ?? USD_PRICING_UI.en;
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  // Monthly-first billing toggle for the international USD pricing (non-Hebrew).
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  // Non-Hebrew schools buy by card, self-serve, like the rest of the app:
  // pick the tier's Stripe price for the selected billing cycle, gate anon
  // users through the signup modal, then land them in /checkout (Payment
  // Element, their own language). Mirrors PricingClient.startCheckout.
  function startSchoolsCheckout(priceId: string) {
    if (!priceId) {
      window.alert("Pricing is misconfigured. Please contact support.");
      return;
    }
    window.location.href = `${href("/checkout")}?price=${encodeURIComponent(priceId)}`;
  }
  function clickSchoolsTier(tier: SchoolsTierKey) {
    const t = SCHOOLS_TIERS[tier];
    const priceId = billing === "yearly" ? t.yearly : t.monthly;
    promptLogin({ mode: "signup", onSuccess: () => startSchoolsCheckout(priceId) });
  }

  // Every "See pricing and order" CTA opens the payment page DIRECTLY
  // instead of detouring through /pricing — Gadi 2026-07-08: a principal
  // who already clicked "start trial" on the schools page shouldn't be
  // dropped on a general pricing page to hunt for the button again.
  // Since 2026-07-12 that payment page is the in-app /checkout (Payment
  // Element, user's own language) rather than hosted Stripe Checkout.
  // Anonymous visitors get the signup modal first, then flow straight
  // into checkout (same pattern as PricingClient). checkout_started
  // fires inside /checkout (no duplicates).
  // Israeli schools pay a full year up front by bank transfer against a
  // tax invoice, not by card, so the price cards scroll to the order box
  // instead of opening a checkout.
  function scrollToOrder() {
    document.getElementById("schools-order")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  // Hero + final CTAs don't name a plan, so sending them straight to a
  // specific checkout would silently pick the cheapest tier for the user.
  // Gadi 2026-07-08: scroll them to the in-page pricing section where
  // the Schools / Schools Large choice is explicit; only the two price
  // cards go directly to checkout.
  function scrollToPricing() {
    document.getElementById("schools-pricing")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Auto-redirect for school owners REMOVED (2026-06-29): Gadi wants
  // school owners to be able to see the landing too, e.g. for QA or to
  // share the URL with a colleague. Owners who tap a trial CTA are
  // routed to their dashboard by clickTrial above.

  // Localized "you already have Schools" banner copy. Shown to logged-in
  // school owners so they have a one-click path to their dashboard
  // without losing access to the landing page itself.
  const ownerBannerCopy: Record<string, { text: string; cta: string }> = {
    en: { text: "You're on the Schools plan.", cta: "Go to my dashboard →" },
    he: { text: "מנוי בתי הספר פעיל אצלך.", cta: "מעבר ללוח הבקרה ←" },
    ar: { text: "خطة Schools نشطة لديك.", cta: "إلى لوحة التحكم ←" },
    ru: { text: "У вас активен тариф Schools.", cta: "В мою панель →" },
    cs: { text: "Máte aktivní tarif Schools.", cta: "Přejít na panel →" },
    sk: { text: "Máte aktívny tarif Schools.", cta: "Prejsť na panel →" },
    hi: { text: "आपके पास Schools प्लान सक्रिय है।", cta: "मेरे डैशबोर्ड पर जाएँ →" },
    am: { text: "የ Schools ዕቅድ ገቢር ነው።", cta: "ወደ ዳሽቦርዴ ሂድ →" },
    es: { text: "Tienes el plan Schools activo.", cta: "Ir a mi panel →" },
    pt: { text: "Você tem o plano Schools ativo.", cta: "Ir ao meu painel →" },
    fr: { text: "Vous êtes sur le plan Schools.", cta: "Aller à mon tableau de bord →" },
    de: { text: "Sie haben den Schools-Tarif aktiv.", cta: "Zum Dashboard →" },
    it: { text: "Hai il piano Schools attivo.", cta: "Vai alla mia dashboard →" },
    ja: { text: "Schoolsプランがアクティブです。", cta: "ダッシュボードへ →" },
  };
  const banner = ownerBannerCopy[lang] ?? ownerBannerCopy.en;

  return (
    <div className="wordbook wb-shell-page wb-schools-landing" dir={dir}>
      {/* Owner banner — shown only to users with an active Schools sub.
          Visible just below the topbar, above the hero, so the path to
          their dashboard is one click away without forcing a redirect. */}
      {schoolId && (
        <div className="wb-schools-owner-banner">
          <span>{banner.text}</span>
          <Link href={href("/schools/manage")} className="wb-schools-owner-banner-cta">
            {banner.cta}
          </Link>
        </div>
      )}

      {/* Full Gadit topbar — identical to the homepage so brand chrome
          stays consistent across surfaces. "Schools" is highlighted as
          the active page. Smart routing: for users who already own a
          schools subscription, the Schools link points at their
          dashboard so they don't get bounced from the marketing copy. */}
      {!standalone && (
      <header className="wb-shell-topbar">
        <Link href={href("/")} className="wb-wordmark" dir="ltr" translate="no">
          Gad<span className="wb-wordmark-it">it</span>
        </Link>
        <WbShellNav active="schools" />
        <div className="wb-shell-actions">
          {user && (
            <ShareButton
              url="https://www.gadit.app/" currentPage
              title={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).title}
              text=""
              shareLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).shareLabel}
              copiedLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).copiedLabel}
            />
          )}
          <LangSwitch />
          {user ? (
            <WbUserMenu />
          ) : (
            <>
              <StartFreeCTA />
              <button
                type="button"
                className="wb-shell-link"
                onClick={() => promptLogin({ mode: "signin" })}
              >
                Sign in
              </button>
            </>
          )}
        </div>
        <div className="wb-shell-mobile-cta">
          <StartFreeCTA />
        </div>
        {user && (
          <div className="wb-shell-mobile-identity">
            <ShareButton
              url="https://www.gadit.app/" currentPage
              title={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).title}
              text=""
              shareLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).shareLabel}
              copiedLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).copiedLabel}
            />
            <WbUserMenu />
          </div>
        )}
        <div className="wb-shell-mobile-menu-cluster">
          <LangSwitchMobile />
          <WbShellBurger active="schools" />
        </div>
      </header>
      )}
      {standalone && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "14px 22px",
            maxWidth: 1180,
            margin: "0 auto",
            width: "100%",
          }}
        >
          {lang === "he" ? (
            /* Hebrew shows a big centered Gadit lockup below (like the
               families page), so the corner wordmark is omitted here. */
            <span />
          ) : (
            <Link href={href("/")} className="wb-wordmark" dir="ltr" translate="no">
              Gad<span className="wb-wordmark-it">it</span>
            </Link>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ShareButton
              url="https://www.gadit.app/schools"
              currentPage
              title={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).title}
              text=""
              shareLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).shareLabel}
              copiedLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).copiedLabel}
            />
            <LangSwitcher variant="muted" />
          </div>
        </div>
      )}

      {lang === "he" ? (
      <>
      {/* ═══════════════════════════════════════════════════════════════
          HEBREW REBUILD (2026-08-08) — principal-facing sales page.
          Two ways Gadit works in a school are shown explicitly: on the
          board for the whole class, and personally per student in their
          own language. Plus word sets and games. Branded teal/amber
          bands + real classroom images. Other languages keep the
          original mockup sections in the `else` branch below.
          Privacy / pricing / FAQ / final CTA stay shared under the
          ternary (they already read the Hebrew copy correctly).
          ═══════════════════════════════════════════════════════════ */}

      {/* Centered brand lockup at the very top, like the families page:
          the Gadit wordmark + a one-line tagline pill. */}
      <div style={{ textAlign: "center", padding: "8px 20px 0" }}>
        <Link
          href={href("/")}
          className="wb-wordmark"
          dir="ltr"
          translate="no"
          style={{ fontSize: 38, fontWeight: 800, letterSpacing: "-0.02em", display: "inline-block" }}
        >
          Gad<span className="wb-wordmark-it">it</span>
        </Link>
        <div style={{ marginTop: 12 }}>
          <span className="wb-schools-tag">מילון חזותי וחכם לבתי ספר</span>
        </div>
      </div>

      {/* ─── HE 1. HERO ──────────────────────────────────────────── */}
      <section className="wb-schools-hero">
        <div className="wb-schools-hero-text">
          <h1 className="wb-schools-h1">{t.heroH1}</h1>
          <p className="wb-schools-sub">כל מילה קשה בשיעור נפתחת מיד. על הלוח לכל הכיתה, או אישית לכל תלמיד בשפה שלו.</p>
          <div className="wb-schools-hero-actions">
            <button type="button" className="wb-schools-cta" onClick={scrollToOrder}>
              {t.heroCta}
            </button>
          </div>
          <div className="wb-schools-hero-trust" style={{ marginTop: 14 }}>
            מ-₪349 לחודש · בלי התחברות לתלמידים · בלי התקנה
          </div>
        </div>
        <div className="wb-schools-hero-visual">
          <img src="/schools/hero.webp" alt="" loading="lazy" className="wb-schools-hero-img" />
        </div>
      </section>

      {/* ─── HE 2. THE PROBLEM ───────────────────────────────────── */}
      <section className="wb-schools-section wb-schools-problem" style={{ background: "#FFFFFF" }}>
        <div className="wb-schools-section-inner">
          <span className="wb-schools-tag">{t.probTag}</span>
          <h2 className="wb-schools-h2">{t.probH2}</h2>
          <p className="wb-schools-body">{t.probBody1}</p>
          <p className="wb-schools-body">{t.probBody2}</p>
          <div className="wb-schools-callout-grid">
            <div className="wb-schools-callout">
              <div className="wb-schools-callout-num">01</div>
              <div className="wb-schools-callout-title">{t.probCallout1Title}</div>
              <div className="wb-schools-callout-body">{t.probCallout1Body}</div>
            </div>
            <div className="wb-schools-callout">
              <div className="wb-schools-callout-num">02</div>
              <div className="wb-schools-callout-title">{t.probCallout2Title}</div>
              <div className="wb-schools-callout-body">{t.probCallout2Body}</div>
            </div>
            <div className="wb-schools-callout">
              <div className="wb-schools-callout-num">03</div>
              <div className="wb-schools-callout-title">{t.probCallout3Title}</div>
              <div className="wb-schools-callout-body">{t.probCallout3Body}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HE 3. ON THE BOARD, THE WHOLE CLASS ─────────────────── */}
      <section className="wb-schools-section" style={{ background: "#ECFAF9" }}>
        <div className="wb-schools-feature">
          <div className="wb-schools-feature-text">
            <span className="wb-schools-tag">על הלוח, לכל הכיתה</span>
            <h2 className="wb-schools-h2">המורה מקלידה מילה, וכל הכיתה מבינה יחד.</h2>
            <p className="wb-schools-body">
              באמצע השיעור צצה מילה שחצי מהכיתה לא מכירה. במקום לעצור ולהסביר בעל פה, המורה מקלידה אותה ב-Gadit על הלוח, והמילה נפתחת בשלבים שכולם רואים באותו רגע.
            </p>
            <ol className="wb-schools-stages">
              <li className="wb-schools-stage"><span className="wb-schools-stage-num">1</span>המילה, גדולה וברורה על המסך</li>
              <li className="wb-schools-stage"><span className="wb-schools-stage-num">2</span>הסבר בגובה העיניים, בשפה שילד מבין</li>
              <li className="wb-schools-stage"><span className="wb-schools-stage-num">3</span>תמונה שמראה את המשמעות במבט אחד</li>
              <li className="wb-schools-stage"><span className="wb-schools-stage-num">4</span>שלושה משפטי דוגמה שמראים איך משתמשים בה</li>
            </ol>
          </div>
          <div className="wb-schools-feature-visual">
            <img src="/schools/steps.webp" alt="" loading="lazy" className="wb-schools-feature-img" />
          </div>
        </div>
      </section>

      {/* ─── HE 4. AND PERSONALLY, IN EACH STUDENT'S LANGUAGE ─────── */}
      <section className="wb-schools-section" style={{ background: "#FFFFFF" }}>
        <div className="wb-schools-feature is-flipped">
          <div className="wb-schools-feature-text">
            <span className="wb-schools-tag">וגם אישית, בשפה של כל תלמיד</span>
            <h2 className="wb-schools-h2">תלמיד שחושב ברוסית, אמהרית או ערבית, מקבל את התשובה בשפה שלו.</h2>
            <p className="wb-schools-body">
              לא הכל קורה על הלוח. תלמיד שקורא את החומר בעברית אבל עדיין חושב בשפת האם נתקל במילה, לא מרים יד, וטובע בשקט. עכשיו הוא פשוט מחפש אותה לבד, במחשב הכיתה או בטלפון, ומקבל את המשמעות המלאה בשפה שלו.
            </p>
            <p className="wb-schools-body" style={{ fontWeight: 700, color: "#1C1917" }}>
              מחסום ההבנה נעלם בהקשה אחת, והתלמיד ממשיך לקרוא את השיעור עם כל השאר.
            </p>

            {/* Concrete demo: one lesson word, understood in the student's
                own language. Fixed content, UI-translated labels. */}
            <div style={{ marginTop: 22, background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 16, padding: "18px 20px", maxWidth: 480 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#B45309", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{xt.demoWordLabel}</div>
              <div dir="ltr" style={{ fontSize: 24, fontWeight: 800, color: "#1C1917", marginBottom: 14, textAlign: "right" }}>{XLANG_DEMO.word}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#B45309", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>{xt.demoMeaningLabel}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {XLANG_DEMO.meanings.map((m) => (
                  <div key={m.lang} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ flexShrink: 0, minWidth: 64, fontSize: 13, fontWeight: 700, color: "#92400E" }}>{m.lang}</span>
                    <span dir={m.dir ?? "ltr"} style={{ fontSize: 14, color: "#44403C", lineHeight: 1.5, textAlign: m.dir === "rtl" ? "right" : "left" }}>{m.text}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #FEF3C7", fontSize: 12, color: "#A16207", fontWeight: 600 }}>
                ועוד 30+ שפות
              </div>
            </div>

          </div>
          <div className="wb-schools-feature-visual">
            <img src="/schools/cross-personal.webp" alt="" loading="lazy" className="wb-schools-feature-img" />
          </div>
        </div>
      </section>

      {/* ─── HE 5. READY-MADE WORD SETS BY SUBJECT ───────────────── */}
      <section className="wb-schools-section" style={{ background: "#FFFBEB" }}>
        <div className="wb-schools-feature">
          <div className="wb-schools-feature-text">
            <span className="wb-schools-tag" style={{ color: "#B45309", background: "rgba(202,138,4,0.12)" }}>מאגר מוכן</span>
            <h2 className="wb-schools-h2">רשימות מילים מוכנות לכל מקצוע.</h2>
            <p className="wb-schools-body">
              לא צריך להכין כלום מראש. לכל מקצוע ולכל שכבה מחכה רשימת מילים בנויה. המורה בוחרת נושא, והמילים החשובות של היחידה כבר שם, מוכנות להקרנה על הלוח או לתרגול אישי.
            </p>
            <div className="wb-schools-subjects">
              <span className="wb-schools-subject">מדעים</span>
              <span className="wb-schools-subject">היסטוריה</span>
              <span className="wb-schools-subject">תנ״ך</span>
              <span className="wb-schools-subject">גאוגרפיה</span>
              <span className="wb-schools-subject">אזרחות</span>
              <span className="wb-schools-subject">ספרות</span>
              <span className="wb-schools-subject">אנגלית</span>
            </div>
          </div>
          <div className="wb-schools-feature-visual">
            <img src="/schools/word-sets.webp" alt="" loading="lazy" className="wb-schools-feature-img" />
          </div>
        </div>
      </section>

      {/* ─── HE 6. PRACTICE WITH GAMES ───────────────────────────── */}
      <section className="wb-schools-section" style={{ background: "#FFFFFF" }}>
        <div className="wb-schools-feature is-flipped">
          <div className="wb-schools-feature-text">
            <span className="wb-schools-tag">תרגול</span>
            <h2 className="wb-schools-h2">משחקים קצרים שמקבעים את המילים.</h2>
            <p className="wb-schools-body">
              מילה שהובנה פעם אחת עדיין צריכה חזרה כדי להישאר. אחרי השיעור התלמידים מתרגלים את המילים של הכיתה במשחקים קצרים, וכל מילה שחיפשו הופכת לחלק מהידע שלהם.
            </p>
          </div>
          <div className="wb-schools-feature-visual">
            <img src="/schools/games.webp" alt="" loading="lazy" className="wb-schools-feature-img" />
          </div>
        </div>
      </section>

      {/* ─── HE 7. WHAT THE PRINCIPAL GETS ───────────────────────── */}
      <section className="wb-schools-section" style={{ background: "#ECFAF9" }}>
        <div className="wb-schools-feature">
          <div className="wb-schools-feature-text">
            <span className="wb-schools-tag">מה מקבל המנהל</span>
            <h2 className="wb-schools-h2">כלי שגורם לתלמידים באמת להבין, בלי כאב ראש תפעולי.</h2>
            <p className="wb-schools-body">
              המורים מקבלים דרך פשוטה לוודא שאף תלמיד לא נשאר מאחור בגלל מילה אחת. בלי חשבונות לתלמידים, בלי התקנה, בלי מעורבות של צוות מחשוב.
            </p>
            <ul className="wb-schools-bullets">
              <li>בלי התחברות לתלמידים, בלי סיסמאות לנהל</li>
              <li>בלי התקנה ובלי מעורבות של צוות מחשוב</li>
              <li>עובד על כל מסך: לוח חכם, מחשב או טלפון</li>
              <li>דשבורד שמראה למורה עם אילו מילים הכיתה מתקשה</li>
            </ul>
          </div>
          <div className="wb-schools-feature-visual">
            <img src="/schools/trust.webp" alt="" loading="lazy" className="wb-schools-feature-img" />
          </div>
        </div>
      </section>
      </>
      ) : (
      <>
      {/* ─── 1. HERO ─────────────────────────────────────────────── */}
      <section className="wb-schools-hero">
        <div className="wb-schools-hero-text">
          <h1 className="wb-schools-h1">{t.heroH1}</h1>
          <p className="wb-schools-sub">{t.heroSub}</p>
          <div className="wb-schools-hero-actions">
            <button type="button" className="wb-schools-cta" onClick={scrollToPricing}>
              {t.heroCta}
            </button>
          </div>
        </div>

        {/* Hero visual — pure CSS mockup of teacher dashboard + student dictionary view */}
        <div className="wb-schools-hero-visual" aria-hidden="true">
          <div className="wb-schools-mockup wb-schools-mockup-teacher">
            <div className="wb-schools-mockup-window">
              <div className="wb-schools-mockup-dots">
                <span /><span /><span />
              </div>
              <div className="wb-schools-mockup-title">/schools/manage</div>
            </div>
            <div className="wb-schools-mockup-body">
              <div className="wb-schools-mockup-eyebrow">{t.mockupRoster}</div>
              <div className="wb-schools-mockup-search-row">
                <span className="wb-schools-mockup-dot wb-schools-mockup-dot-1" />
                <span className="wb-schools-mockup-search-text">{t.mockupStudent1}</span>
                <span className="wb-schools-mockup-time">9:42</span>
              </div>
              <div className="wb-schools-mockup-search-row">
                <span className="wb-schools-mockup-dot wb-schools-mockup-dot-2" />
                <span className="wb-schools-mockup-search-text">{t.mockupStudent2}</span>
                <span className="wb-schools-mockup-time">10:08</span>
              </div>
              <div className="wb-schools-mockup-search-row">
                <span className="wb-schools-mockup-dot wb-schools-mockup-dot-3" />
                <span className="wb-schools-mockup-search-text">{t.mockupStudent3}</span>
                <span className="wb-schools-mockup-time">11:15</span>
              </div>
              <div className="wb-schools-mockup-eyebrow wb-schools-mockup-eyebrow-2">{t.mockupSearches}</div>
              <div className="wb-schools-mockup-bars">
                <div className="wb-schools-mockup-bar"><span style={{ width: "92%" }} />photosynthesis</div>
                <div className="wb-schools-mockup-bar"><span style={{ width: "68%" }} />mitochondria</div>
                <div className="wb-schools-mockup-bar"><span style={{ width: "44%" }} />democracy</div>
              </div>
            </div>
          </div>

          <div className="wb-schools-mockup wb-schools-mockup-student" lang={lang}>
            <div className="wb-schools-mockup-window">
              <div className="wb-schools-mockup-dots">
                <span /><span /><span />
              </div>
              <div className="wb-schools-mockup-title">gadit.app/c/XYZ123</div>
            </div>
            <div className="wb-schools-mockup-body">
              <div className="wb-schools-mockup-word">{t.mockupWordExample}</div>
              <div className="wb-schools-mockup-meaning">
                <div className="wb-schools-mockup-meaning-label">1.</div>
                <div className="wb-schools-mockup-meaning-text">{t.mockupExampleDef}</div>
              </div>
              <div className="wb-schools-mockup-example">
                <div className="wb-schools-mockup-example-label">Example</div>
                <div className="wb-schools-mockup-example-text">{t.mockupExampleEx}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. THE PROBLEM ──────────────────────────────────────── */}
      <section className="wb-schools-section wb-schools-problem">
        <div className="wb-schools-section-inner">
          <span className="wb-schools-tag">{t.probTag}</span>
          <h2 className="wb-schools-h2">{t.probH2}</h2>
          <p className="wb-schools-body">{t.probBody1}</p>
          <p className="wb-schools-body">{t.probBody2}</p>
          <div className="wb-schools-callout-grid">
            <div className="wb-schools-callout">
              <div className="wb-schools-callout-num">01</div>
              <div className="wb-schools-callout-title">{t.probCallout1Title}</div>
              <div className="wb-schools-callout-body">{t.probCallout1Body}</div>
            </div>
            <div className="wb-schools-callout">
              <div className="wb-schools-callout-num">02</div>
              <div className="wb-schools-callout-title">{t.probCallout2Title}</div>
              <div className="wb-schools-callout-body">{t.probCallout2Body}</div>
            </div>
            <div className="wb-schools-callout">
              <div className="wb-schools-callout-num">03</div>
              <div className="wb-schools-callout-title">{t.probCallout3Title}</div>
              <div className="wb-schools-callout-body">{t.probCallout3Body}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2.5 CROSS-LANGUAGE (flagship) ───────────────────────── */}
      <section className="wb-schools-section" style={{ background: "#FFFBEB" }}>
        <div className="wb-schools-section-inner">
          <span className="wb-schools-tag" style={{ color: "#B45309" }}>{xt.tag}</span>
          <h2 className="wb-schools-h2">{xt.h2}</h2>
          <p className="wb-schools-body">{xt.body1}</p>
          <p className="wb-schools-body">{xt.body2}</p>

          {/* Concrete demo: one lesson word, understood in the student's
              own language. Fixed content, UI-translated labels. */}
          <div
            style={{
              marginTop: 28,
              background: "#fff",
              border: "1px solid #FDE68A",
              borderRadius: 18,
              padding: "22px 24px",
              maxWidth: 560,
              boxShadow: "0 10px 30px -14px rgba(202,138,4,0.35)",
            }}
          >
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "#B45309", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
              {xt.demoWordLabel}
            </div>
            <div dir="ltr" style={{ fontSize: 28, fontWeight: 800, color: "#1C1917", marginBottom: 18, textAlign: dir === "rtl" ? "right" : "left" }}>
              {XLANG_DEMO.word}
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "#B45309", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
              {xt.demoMeaningLabel}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {XLANG_DEMO.meanings.map((m) => (
                <div key={m.lang} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ flexShrink: 0, minWidth: 74, fontSize: 13.5, fontWeight: 700, color: "#92400E" }}>{m.lang}</span>
                  <span dir={m.dir ?? "ltr"} style={{ fontSize: 14.5, color: "#44403C", lineHeight: 1.5, textAlign: m.dir === "rtl" ? "right" : "left" }}>{m.text}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #FEF3C7", fontSize: 12.5, color: "#A16207", fontWeight: 600 }}>
              {lang === "ar" ? "و11 لغة أخرى" : lang === "ru" ? "и ещё 11 языков" : "+ 11 more languages"}
            </div>
          </div>

          <p className="wb-schools-body" style={{ marginTop: 26, fontSize: 19, fontWeight: 700, color: "#1C1917", maxWidth: 640 }}>
            {xt.keyline}
          </p>
          <p className="wb-schools-body" style={{ marginTop: 12, color: "#78716C" }}>{xt.note}</p>
        </div>
      </section>

      {/* ─── 3. HOW IT WORKS ─────────────────────────────────────── */}
      <section className="wb-schools-section wb-schools-how">
        <div className="wb-schools-section-inner">
          <span className="wb-schools-tag">{t.howTag}</span>
          <h2 className="wb-schools-h2">{t.howH2}</h2>
          <p className="wb-schools-section-sub">{t.howSub}</p>
          <div className="wb-schools-steps">
            <div className="wb-schools-step">
              <div className="wb-schools-step-icon">
                <div className="wb-schools-code-chip" lang="en" dir="ltr">XYZ123</div>
              </div>
              <div className="wb-schools-step-num">Step 1</div>
              <div className="wb-schools-step-title">{t.howStep1Title}</div>
              <div className="wb-schools-step-body">{t.howStep1Body}</div>
            </div>
            <div className="wb-schools-step">
              <div className="wb-schools-step-icon">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <rect x="8" y="14" width="48" height="36" rx="4" fill="#fff" stroke="#0EA5A5" strokeWidth="2" />
                  <rect x="14" y="20" width="36" height="3" rx="1.5" fill="#0EA5A5" opacity="0.3" />
                  <rect x="14" y="27" width="24" height="3" rx="1.5" fill="#0EA5A5" opacity="0.3" />
                  <rect x="14" y="34" width="30" height="3" rx="1.5" fill="#0EA5A5" opacity="0.3" />
                  <circle cx="32" cy="44" r="3" fill="#0EA5A5" />
                </svg>
              </div>
              <div className="wb-schools-step-num">Step 2</div>
              <div className="wb-schools-step-title">{t.howStep2Title}</div>
              <div className="wb-schools-step-body">{t.howStep2Body}</div>
            </div>
            <div className="wb-schools-step">
              <div className="wb-schools-step-icon">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <rect x="6" y="10" width="52" height="40" rx="4" fill="#fff" stroke="#0EA5A5" strokeWidth="2" />
                  <rect x="12" y="18" width="20" height="3" rx="1.5" fill="#0EA5A5" />
                  <rect x="12" y="26" width="36" height="3" rx="1.5" fill="#0EA5A5" opacity="0.4" />
                  <rect x="12" y="34" width="28" height="3" rx="1.5" fill="#0EA5A5" opacity="0.4" />
                  <rect x="12" y="42" width="32" height="3" rx="1.5" fill="#0EA5A5" opacity="0.4" />
                </svg>
              </div>
              <div className="wb-schools-step-num">Step 3</div>
              <div className="wb-schools-step-title">{t.howStep3Title}</div>
              <div className="wb-schools-step-body">{t.howStep3Body}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. TEACHER VIEW ─────────────────────────────────────── */}
      <section className="wb-schools-section wb-schools-teacher">
        <div className="wb-schools-section-inner wb-schools-teacher-grid">
          <div className="wb-schools-teacher-copy">
            <span className="wb-schools-tag">{t.teacherTag}</span>
            <h2 className="wb-schools-h2">{t.teacherH2}</h2>
            <p className="wb-schools-section-sub">{t.teacherSub}</p>
            <ul className="wb-schools-bullets">
              <li>{t.teacherB1}</li>
              <li>{t.teacherB2}</li>
              <li>{t.teacherB3}</li>
              <li>{t.teacherB4}</li>
            </ul>
          </div>
          <div className="wb-schools-teacher-mockup">
            <div className="wb-schools-mockup wb-schools-mockup-big">
              <div className="wb-schools-mockup-window">
                <div className="wb-schools-mockup-dots">
                  <span /><span /><span />
                </div>
                <div className="wb-schools-mockup-title">/schools/manage — Class 7B</div>
              </div>
              <div className="wb-schools-mockup-body">
                <div className="wb-schools-mockup-eyebrow">{t.mockupSearches}</div>
                <div className="wb-schools-mockup-bars">
                  <div className="wb-schools-mockup-bar"><span style={{ width: "92%" }} />photosynthesis <em>14</em></div>
                  <div className="wb-schools-mockup-bar"><span style={{ width: "68%" }} />mitochondria <em>9</em></div>
                  <div className="wb-schools-mockup-bar"><span style={{ width: "55%" }} />democracy <em>7</em></div>
                  <div className="wb-schools-mockup-bar"><span style={{ width: "40%" }} />sovereignty <em>5</em></div>
                  <div className="wb-schools-mockup-bar"><span style={{ width: "28%" }} />equilibrium <em>3</em></div>
                </div>
                <div className="wb-schools-mockup-eyebrow wb-schools-mockup-eyebrow-2">{t.mockupRoster}</div>
                <div className="wb-schools-mockup-search-row">
                  <span className="wb-schools-mockup-dot wb-schools-mockup-dot-1" />
                  <span className="wb-schools-mockup-search-text">{t.mockupStudent1}</span>
                  <span className="wb-schools-mockup-time">9:42</span>
                </div>
                <div className="wb-schools-mockup-search-row">
                  <span className="wb-schools-mockup-dot wb-schools-mockup-dot-2" />
                  <span className="wb-schools-mockup-search-text">{t.mockupStudent2}</span>
                  <span className="wb-schools-mockup-time">10:08</span>
                </div>
                <div className="wb-schools-mockup-search-row">
                  <span className="wb-schools-mockup-dot wb-schools-mockup-dot-3" />
                  <span className="wb-schools-mockup-search-text">{t.mockupStudent3}</span>
                  <span className="wb-schools-mockup-time">11:15</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      </>
      )}

      {/* ─── SHARED (all languages): PRIVACY / PRICING / FAQ / FINAL ─
          These four sections already render the correct per-language
          copy via `t` / `pu`, so they live outside the he/other branch
          and stay identical for every language. */}

      {/* ─── 5. PRIVACY MOAT ─────────────────────────────────────── */}
      <section className="wb-schools-section wb-schools-privacy">
        <div className="wb-schools-section-inner">
          <span className="wb-schools-tag">{t.privTag}</span>
          <h2 className="wb-schools-h2">{t.privH2}</h2>
          <p className="wb-schools-section-sub">{t.privSub}</p>
          <div className="wb-schools-privacy-grid">
            <div className="wb-schools-privacy-card">
              <PrivacyIcon kind="no-account" />
              <div className="wb-schools-privacy-text">{t.privPoint1}</div>
            </div>
            <div className="wb-schools-privacy-card">
              <PrivacyIcon kind="no-pii" />
              <div className="wb-schools-privacy-text">{t.privPoint2}</div>
            </div>
            <div className="wb-schools-privacy-card">
              <PrivacyIcon kind="hours" />
              <div className="wb-schools-privacy-text">{t.privPoint3}</div>
            </div>
            <div className="wb-schools-privacy-card">
              <PrivacyIcon kind="compliance" />
              <div className="wb-schools-privacy-text">{t.privPoint4}</div>
            </div>
          </div>
          <p className="wb-schools-privacy-kahoot">{t.privKahoot}</p>
        </div>
      </section>

      {/* ─── 6. PRICING ──────────────────────────────────────────── */}
      <section id="schools-pricing" className="wb-schools-section wb-schools-pricing">
        <div className="wb-schools-section-inner">
          <span className="wb-schools-tag">{t.priceTag}</span>
          <h2 className="wb-schools-h2">{lang === "he" ? t.priceH2 : upu.h2}</h2>
          {lang === "he" ? (
          <>
          <style>{`
            .wordbook .wb-schools-price-grid.sl-price-grid-3 {
              max-width: 1080px;
              margin-inline: auto;
            }
            @media (min-width: 720px) {
              .wordbook .wb-schools-price-grid.sl-price-grid-3 { grid-template-columns: repeat(3, 1fr); }
            }
            .wordbook .wb-schools-price-grid.sl-price-grid-3 .wb-schools-price-card {
              box-shadow: 0 8px 24px -10px rgba(16, 24, 40, 0.16);
              border: 1px solid #E3E6EA;
            }
            .wordbook .wb-schools-price-grid.sl-price-grid-3 .wb-schools-price-card:hover {
              border-color: rgba(202, 138, 4, 0.5);
              box-shadow: 0 14px 34px -12px rgba(202, 138, 4, 0.28);
            }
            .wordbook .sl-price-grid-3 .wb-schools-price-card { text-align: center; }
            .wordbook .sl-price-grid-3 .wb-schools-price-amount { justify-content: center; }
            .wordbook .sl-price-grid-3 .wb-schools-price-name { text-transform: none; letter-spacing: 0; }
            .wordbook .sl-billing-toggle {
              display: flex; width: fit-content; margin: 0 auto 24px;
              background: #f1f3f5; border-radius: 999px; padding: 4px; gap: 2px;
            }
            .wordbook .sl-billing-toggle button {
              border: none; background: transparent; font-family: var(--wb-he);
              font-weight: 700; font-size: 14px; color: #64748b;
              padding: 8px 18px; border-radius: 999px; cursor: pointer;
              display: inline-flex; align-items: center; gap: 7px;
            }
            .wordbook .sl-billing-toggle button.is-active {
              background: #fff; color: #0b7d7d; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
            }
            .wordbook .sl-billing-save {
              background: #10B981; color: #fff; font-size: 10.5px; font-weight: 800;
              padding: 2px 7px; border-radius: 999px; line-height: 1.5;
            }
          `}</style>
          <div className="sl-billing-toggle" role="tablist" aria-label="billing period">
            <button
              type="button"
              role="tab"
              aria-selected={billing === "monthly"}
              className={billing === "monthly" ? "is-active" : ""}
              onClick={() => setBilling("monthly")}
            >
              חודשי
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={billing === "yearly"}
              className={billing === "yearly" ? "is-active" : ""}
              onClick={() => setBilling("yearly")}
            >
              שנתי
              <span className="sl-billing-save">חודשיים חינם</span>
            </button>
          </div>
          <div className="wb-schools-price-grid sl-price-grid-3">
            {SCHOOL_TIERS.map((tier) => (
              <div key={tier.key} className="wb-schools-price-card">
                <div className="wb-schools-price-name">{pu.tiers[tier.key]}</div>
                <div className="wb-schools-price-amount">
                  <span className="wb-schools-price-amount-num" dir="ltr">{`₪${(billing === "yearly" ? tier.yearly : tier.monthly).toLocaleString()}`}</span>
                  <span className="wb-schools-price-amount-vat">{pu.plusVat}</span>
                  <span className="wb-schools-price-amount-period">{billing === "yearly" ? "לשנה" : "לחודש"}</span>
                </div>
                <button type="button" className="wb-schools-cta wb-schools-cta-block" onClick={scrollToOrder}>
                  {pu.orderCta}
                </button>
              </div>
            ))}
          </div>
          <p className="wb-schools-price-net">{pu.netNote}</p>
          <style>{`
            .wordbook .wb-schools-price-amount-vat {
              font-size: 0.62em;
              font-weight: 600;
              color: #A8734B;
              margin-inline-start: 4px;
              white-space: nowrap;
            }
            .wordbook .wb-schools-price-net {
              margin: 14px auto 0;
              text-align: center;
              font-size: 13px;
              color: #78716C;
            }
          `}</style>
          </>
          ) : (
          <>
          {/* International (non-Hebrew): uniform USD, monthly-first with a
              yearly option, self-serve by card. Same billing-toggle pattern
              as the Families page. Gadi 2026-08-14. */}
          <style>{`
            .wordbook .sl-billing-toggle {
              display: flex; width: fit-content; margin: 4px auto 24px;
              background: #f1f3f5; border-radius: 999px; padding: 4px; gap: 2px;
            }
            .wordbook .sl-billing-toggle button {
              border: none; background: transparent; font-family: var(--wb-sans);
              font-weight: 700; font-size: 14px; color: #64748b;
              padding: 8px 18px; border-radius: 999px; cursor: pointer;
              display: inline-flex; align-items: center; gap: 7px;
            }
            .wordbook .sl-billing-toggle button.is-active {
              background: #fff; color: #0b7d7d; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
            }
            .wordbook .sl-billing-save {
              background: #10B981; color: #fff; font-size: 10.5px; font-weight: 800;
              padding: 2px 7px; border-radius: 999px; line-height: 1.5;
            }
            .wordbook .wb-schools-price-grid.sl-price-grid-usd {
              max-width: 1080px; margin-inline: auto;
              grid-template-columns: 1fr; gap: 20px;
            }
            @media (min-width: 720px) {
              .wordbook .wb-schools-price-grid.sl-price-grid-usd { grid-template-columns: repeat(3, 1fr); }
            }
            .wordbook .sl-price-grid-usd .wb-schools-price-card { text-align: center; }
            .wordbook .sl-price-grid-usd .wb-schools-price-amount { justify-content: center; margin-block: 4px 6px; }
            .wordbook .sl-price-grid-usd .wb-schools-cta-block { margin-top: 18px; }
            .wordbook .wb-schools-price-net {
              margin: 16px auto 0; text-align: center; font-size: 13px; color: #78716C;
            }
          `}</style>
          <div className="sl-billing-toggle" role="tablist" aria-label="billing period">
            <button
              type="button"
              role="tab"
              aria-selected={billing === "monthly"}
              className={billing === "monthly" ? "is-active" : ""}
              onClick={() => setBilling("monthly")}
            >
              {upu.billedMonthly}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={billing === "yearly"}
              className={billing === "yearly" ? "is-active" : ""}
              onClick={() => setBilling("yearly")}
            >
              {upu.billedYearly}
              <span className="sl-billing-save" dir="ltr">{upu.yearlySave}</span>
            </button>
          </div>
          <div className="wb-schools-price-grid sl-price-grid-usd">
            {SCHOOLS_TIER_LIST.map((tier) => (
              <div key={tier.key} className="wb-schools-price-card">
                <div className="wb-schools-price-name">{upu.smallName}</div>
                <div className="wb-schools-price-amount">
                  <span className="wb-schools-price-amount-num" dir="ltr">
                    {billing === "yearly" ? tier.usdYearly : tier.usdMonthly}
                  </span>
                  <span className="wb-schools-price-amount-period">
                    {billing === "yearly" ? upu.perYear : upu.perMonth}
                  </span>
                </div>
                <div className="wb-schools-price-students">
                  {studentsUpTo(tier.maxStudents, lang)}
                </div>
                <button
                  type="button"
                  className="wb-schools-cta wb-schools-cta-block"
                  onClick={() => clickSchoolsTier(tier.key)}
                >
                  {upu.cta}
                </button>
              </div>
            ))}
          </div>
          <p className="wb-schools-price-net">{upu.afterTrial}</p>
          </>
          )}
          <p className="wb-schools-price-larger">{t.priceLarger}</p>
          <div className="wb-schools-includes">
            <div className="wb-schools-includes-title">{t.priceIncludesTitle}</div>
            <div className="wb-schools-includes-list">
              {t.priceIncludes.map((line) => (
                <div key={line} className="wb-schools-includes-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CA8A04" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Israeli schools buy a full year up front by bank transfer /
              purchase order against a tax invoice, not by card. This is
              the primary (and only) payment path, Hebrew page only. */}
          {lang === "he" && (
            <div
              id="schools-order"
              style={{
                maxWidth: 640,
                margin: "26px auto 0",
                background: "#fff",
                border: "1px solid #E3E6EA",
                borderRadius: 14,
                padding: "20px 22px",
                textAlign: "start",
                boxShadow: "0 4px 16px -8px rgba(16,24,40,0.12)",
              }}
              dir="rtl"
            >
              <div style={{ fontSize: 18, fontWeight: 800, color: "#1C1917", marginBottom: 8 }}>
                ההרשמה פשוטה
              </div>
              <div style={{ fontSize: 14, color: "#44403C", lineHeight: 1.75 }}>
                ממלאים טופס קצר עם פרטי בית הספר, ואנחנו פותחים את בית הספר עם שם משתמש וסיסמה ושולחים חשבונית מס. התשלום שנתי בהעברה בנקאית או בהזמנת רכש.
              </div>
              <div style={{ fontSize: 14, color: "#44403C", lineHeight: 1.75, marginTop: 12 }}>
                <strong>לביא טכנולוגיות למידה והדרכה בע״מ</strong>
                <br />
                בנק לאומי (10) · סניף 855 · חשבון 41850031
              </div>
              <SchoolOrderForm />
            </div>
          )}
        </div>
      </section>

      {/* ─── 7. FAQ ─────────────────────────────────────────────── */}
      <section className="wb-schools-section wb-schools-faq">
        <div className="wb-schools-section-inner">
          <span className="wb-schools-tag">{t.faqTag}</span>
          <h2 className="wb-schools-h2">{t.faqH2}</h2>
          <div className="wb-schools-faq-list">
            {t.faq.map((item, i) => (
              <button
                key={i}
                type="button"
                className={`wb-schools-faq-item ${openFaq === i ? "is-open" : ""}`}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                aria-expanded={openFaq === i}
              >
                <div className="wb-schools-faq-q">
                  <span>{item.q}</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="wb-schools-faq-chevron">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
                {openFaq === i && (
                  <div className="wb-schools-faq-a">{item.a}</div>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 8. FINAL CTA ────────────────────────────────────────── */}
      <section className="wb-schools-section wb-schools-final">
        <div className="wb-schools-section-inner wb-schools-final-inner">
          <h2 className="wb-schools-h2 wb-schools-final-h2">{t.finalH2}</h2>
          <p className="wb-schools-final-body">{t.finalBody}</p>
          <button type="button" className="wb-schools-cta wb-schools-cta-big" onClick={scrollToPricing}>
            {t.finalCta}
          </button>
          <div className="wb-schools-final-note">{t.finalNote}</div>
        </div>
      </section>

      <footer className="wb-home-footer">
        <span>© 2026 Gadit</span>
        <span>·</span>
        <Link href={href("/pricing")}>Pricing</Link>
        <span>·</span>
        <Link href={href("/privacy")}>{v2(lang, "footerPrivacy")}</Link>
        <span>·</span>
        <Link href={href("/terms")}>{v2(lang, "footerTerms")}</Link>
      </footer>
    </div>
  );
}

// Inline privacy icons. SVGs kept here to avoid a primitives import
// cycle and to keep the file self-contained.
function PrivacyIcon({ kind }: { kind: "no-account" | "no-pii" | "hours" | "compliance" }) {
  if (kind === "no-account") {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0EA5A5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="9" r="3.5" />
        <path d="M5 20c1-3 4-5 7-5s6 2 7 5" />
        <path d="M4 4l16 16" />
      </svg>
    );
  }
  if (kind === "no-pii") {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0EA5A5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="6" width="18" height="14" rx="2" />
        <path d="M3 9h18" />
        <path d="M7 14h4" />
      </svg>
    );
  }
  if (kind === "hours") {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0EA5A5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  }
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0EA5A5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l8 4v5c0 5-4 9-8 9s-8-4-8-9V7l8-4z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
