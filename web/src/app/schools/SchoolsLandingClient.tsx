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
    heroSub: "Any hard word, in any of 22 languages, explained on the spot.",
    heroCta: "See pricing and order",
    heroPriceChip: "From ₪3,490 / year",
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
      "Student UI in 22 languages",
      "Simple annual order, below the procurement threshold",
    ],
    priceCta: "See pricing and order",
    priceLarger: "Need more than 500 students? Contact us about district plans.",
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
        a: "Use Schools Large ($149/month, up to 500 students) for any school under 500. For 500+ students or multi-site districts, contact us for a custom plan that fits your school's structure.",
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
    heroPriceChip: "Kusukela ku-₪3,490 / ngonyaka",
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
    ],
    priceCta: "Buka amanani bese uodola",
    priceLarger: "Udinga abafundi abangaphezu kwabangu-500? Xhumana nathi mayelana nezinhlelo zesifunda.",
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
        a: "Sebenzisa i-Izikole Ezinkulu ($149/ngenyanga, kufika kubafundi abangu-500) kunoma yisiphi isikole esingaphansi kuka-500. Kubafundi abangu-500+ noma izifunda ezinezindawo eziningi, xhumana nathi ukuze uthole uhlelo olwenzelwe wena oluhambisana nesakhiwo sesikole sakho.",
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
    heroSub: "Κάθε δύσκολη λέξη, σε οποιαδήποτε από τις 22 γλώσσες, εξηγείται επιτόπου.",
    heroCta: "Δείτε τις τιμές και παραγγείλετε",
    heroPriceChip: "Από ₪3,490 / έτος",
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
      "Περιβάλλον μαθητή σε 22 γλώσσες",
      "Απλή ετήσια παραγγελία, κάτω από το όριο των διαγωνισμών προμηθειών",
    ],
    priceCta: "Δείτε τις τιμές και παραγγείλετε",
    priceLarger: "Χρειάζεστε περισσότερους από 500 μαθητές; Επικοινωνήστε μαζί μας για πακέτα περιφέρειας.",
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
        a: "Χρησιμοποιήστε το Σχολεία Μεγάλα ($149/μήνα, έως 500 μαθητές) για κάθε σχολείο κάτω από 500. Για 500+ μαθητές ή περιφέρειες με πολλές τοποθεσίες, επικοινωνήστε μαζί μας για ένα προσαρμοσμένο πακέτο που ταιριάζει στη δομή του σχολείου σας.",
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
    heroSub: "Будь-яке складне слово, будь-якою з 22 мов, пояснене одразу.",
    heroCta: "Почати 14-денний безкоштовний період",
    heroPriceChip: "Від $69 / місяць",
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
      "Інтерфейс учня 22 мовами",
      "14-денний безкоштовний період",
    ],
    priceCta: "Почати 14-денний безкоштовний період",
    priceLarger: "Потрібно більше ніж 500 учнів? Зв'яжіться з нами щодо планів для округів.",
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
        a: "Використовуйте Школи Великі ($149/місяць, до 500 учнів) для будь-якої школи до 500. Для 500+ учнів або мультисайтових округів зв'яжіться з нами щодо індивідуального плану, що підходить структурі вашої школи.",
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
    heroSub: "Zor herhangi bir kelime, 22 dilden herhangi birinde, anında açıklanır.",
    heroCta: "14 günlük ücretsiz denemeyi başlat",
    heroPriceChip: "Aylık $69'dan başlayan fiyatlarla",
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
      "22 dilde öğrenci arayüzü",
      "14 günlük ücretsiz deneme",
    ],
    priceCta: "14 günlük ücretsiz denemeyi başlat",
    priceLarger: "500'den fazla öğrenciye mi ihtiyacınız var? İlçe planları için bizimle iletişime geçin.",
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
        a: "500'ün altındaki her okul için Okullar Büyük'ü ($149/ay, 500 öğrenciye kadar) kullanın. 500+ öğrenci ya da çok kampüslü ilçeler için, okulunuzun yapısına uyan özel bir plan için bizimle iletişime geçin.",
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
    heroSub: "Każde trudne słowo, w dowolnym z 22 języków, wyjaśnione od razu.",
    heroCta: "Rozpocznij 14-dniowy bezpłatny okres próbny",
    heroPriceChip: "Od $69 / miesiąc",
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
      "Interfejs ucznia w 22 językach",
      "14-dniowy bezpłatny okres próbny",
    ],
    priceCta: "Rozpocznij 14-dniowy bezpłatny okres próbny",
    priceLarger: "Potrzebujesz więcej niż 500 uczniów? Skontaktuj się z nami w sprawie planów dla okręgów.",
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
        a: "Użyj Szkoły Large ($149/miesiąc, do 500 uczniów) dla każdej szkoły poniżej 500. Dla 500+ uczniów lub okręgów wieloplacówkowych skontaktuj się z nami po plan dopasowany do struktury Twojej szkoły.",
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
    heroSub: "هر واژه‌ی دشوار، در هر یک از 22 زبان، همان‌جا توضیح داده می‌شود.",
    heroCta: "دوره‌ی آزمایشی رایگان 14 روزه را شروع کن",
    heroPriceChip: "از $69 / ماه",
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
      "رابط کاربری دانش‌آموز در 22 زبان",
      "دوره‌ی آزمایشی رایگان 14 روزه",
    ],
    priceCta: "دوره‌ی آزمایشی رایگان 14 روزه را شروع کن",
    priceLarger: "بیش از 500 دانش‌آموز نیاز داری؟ درباره‌ی طرح‌های ناحیه‌ای با ما تماس بگیر.",
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
        a: "برای هر مدرسه‌ی زیر 500، از مدرسه‌های بزرگ ($149 در ماه، تا 500 دانش‌آموز) استفاده کن. برای بیش از 500 دانش‌آموز یا نواحی چندمکانی، برای طرحی سفارشی که با ساختار مدرسه‌ات جور درآید با ما تماس بگیر.",
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
    heroSub: "Kata sulit apa pun, dalam salah satu dari 22 bahasa, dijelaskan saat itu juga.",
    heroCta: "Mulai uji coba gratis 14 hari",
    heroPriceChip: "Mulai $69 / bulan",
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
      "Antarmuka murid dalam 22 bahasa",
      "Uji coba gratis 14 hari",
    ],
    priceCta: "Mulai uji coba gratis 14 hari",
    priceLarger: "Butuh lebih dari 500 murid? Hubungi kami tentang paket distrik.",
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
        a: "Gunakan Sekolah Besar ($149/bulan, hingga 500 murid) untuk sekolah mana pun di bawah 500. Untuk 500+ murid atau distrik multi-lokasi, hubungi kami untuk paket khusus yang sesuai dengan struktur sekolah Anda.",
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
    heroSub: "כל מילה קשה, ב-22 שפות, מוסברת מיד.",
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
      "ממשק תלמיד ב-22 שפות",
      "הזמנה שנתית פשוטה, מתחת לסף הרכש",
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
        a: "יש שלוש חבילות לפי גודל בית הספר, עד 1,000 תלמידים. למעלה מ-1,000 תלמידים או לרשתות בתי ספר, אפשר ליצור קשר לתוכנית מותאמת.",
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
    heroSub: "Любое трудное слово, на любом из 14 языков, объяснено сразу.",
    heroCta: "Цены и заказ",
    heroPriceChip: "От ₪3,490 в год",
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
      "Интерфейс ученика на 14 языках",
      "14-дневный пробный период",
    ],
    priceCta: "Цены и заказ",
    priceLarger: "Больше 500 учеников? Свяжитесь с нами для тарифа района.",
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
        a: "Используйте Schools Large ($149 в месяц, до 500 учеников) для любой школы меньше 500. Для 500+ учеников или многоплощадочных районов свяжитесь с нами для индивидуального плана.",
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
    heroSub: "Elk moeilijk woord, in een van de 22 talen, meteen uitgelegd.",
    heroCta: "Start gratis proefperiode van 14 dagen",
    heroPriceChip: "Vanaf $69 / maand",
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
      "Leerlinginterface in 22 talen",
      "Gratis proefperiode van 14 dagen",
    ],
    priceCta: "Start gratis proefperiode van 14 dagen",
    priceLarger: "Meer dan 500 leerlingen nodig? Neem contact met ons op over districtsplannen.",
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
        a: "Gebruik Schools Large ($149/maand, tot 500 leerlingen) voor elke school onder de 500. Voor meer dan 500 leerlingen of districten met meerdere locaties kun je contact met ons opnemen voor een plan op maat dat past bij de structuur van je school.",
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
    heroSub: "أي كلمة صعبة، بأي من 14 لغة، تُشرح في الحال.",
    heroCta: "الأسعار والطلب",
    heroPriceChip: "ابتداءً من ₪3,490 سنويًا",
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
      "واجهة طالب بـ 14 لغة",
      "تجربة مجانية لـ 14 يومًا",
    ],
    priceCta: "الأسعار والطلب",
    priceLarger: "أكثر من 500 طالب؟ تواصل معنا لخطة منطقة.",
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
        a: "استخدم Schools Large (149 دولارًا شهريًا، حتى 500 طالب) لأي مدرسة دون 500. لـ 500+ طالب أو شبكات متعدّدة المواقع، تواصل معنا لخطة مخصّصة.",
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
    heroPriceChip: "Od $69 měsíčně",
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
    ],
    priceCta: "Začít 14denní zkušební období",
    priceLarger: "Více než 500 žáků? Kontaktujte nás ohledně okresního plánu.",
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
        a: "Použijte Schools Large ($149 měsíčně, až 500 žáků) pro jakoukoli školu pod 500. Pro 500+ žáků nebo víceokresní sítě nás kontaktujte ohledně plánu na míru.",
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
    heroPriceChip: "Od $69 mesačne",
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
    ],
    priceCta: "Začať 14-dňovú skúšobnú dobu",
    priceLarger: "Viac ako 500 žiakov? Kontaktujte nás ohľadom okresného plánu.",
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
        a: "Použite Schools Large ($149 mesačne, až 500 žiakov) pre akúkoľvek školu pod 500. Pre 500+ žiakov alebo viacokresné siete nás kontaktujte ohľadom plánu na mieru.",
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
    heroPriceChip: "$69 / माह से",
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
      "22 भाषाओं में छात्र इंटरफ़ेस",
      "14 दिन का मुफ्त ट्रायल",
    ],
    priceCta: "14 दिन का मुफ्त ट्रायल शुरू करें",
    priceLarger: "500 से अधिक छात्र? ज़िला योजना के लिए संपर्क करें।",
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
        a: "500 से कम के किसी भी स्कूल के लिए Schools Large ($149 / माह, 500 छात्रों तक) का उपयोग करें। 500 से अधिक छात्रों या बहु-साइट ज़िलों के लिए, कस्टम योजना के लिए संपर्क करें।",
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
    heroSub: "ማንኛውም አስቸጋሪ ቃል፣ ከ22 ቋንቋዎች በአንዱ፣ ወዲያውኑ ይብራራል።",
    heroCta: "የ 14 ቀን ነጻ ሙከራ ይጀምሩ",
    heroPriceChip: "ከ $69 / ወር ጀምሮ",
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
      "የተማሪ ገጽታ በ 22 ቋንቋዎች",
      "የ 14 ቀን ነጻ ሙከራ",
    ],
    priceCta: "የ 14 ቀን ነጻ ሙከራ ይጀምሩ",
    priceLarger: "ከ 500 በላይ ተማሪዎች? ለዲስትሪክት ዕቅድ ያግኙን።",
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
        a: "ከ 500 በታች ለሆነ ማንኛውም ትምህርት ቤት Schools Large ($149 / ወር፣ እስከ 500 ተማሪዎች) ይጠቀሙ። ከ 500 በላይ ተማሪዎች ወይም ባለብዙ ቅርንጫፍ ዲስትሪክቶች ከሆነ ለብጁ ዕቅድ ያግኙን።",
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
    heroSub: "Cualquier palabra difícil, en cualquiera de 22 idiomas, explicada al instante.",
    heroCta: "Comenzar prueba gratuita de 14 días",
    heroPriceChip: "Desde $69 al mes",
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
      "Interfaz del estudiante en 22 idiomas",
      "Prueba gratuita de 14 días",
    ],
    priceCta: "Comenzar prueba gratuita de 14 días",
    priceLarger: "¿Más de 500 estudiantes? Contáctenos para un plan de distrito.",
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
        a: "Use Schools Large ($149 al mes, hasta 500 estudiantes) para cualquier escuela menor a 500. Para más de 500 estudiantes o redes con varias sedes, contáctenos para un plan personalizado.",
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
    heroSub: "Qualquer palavra difícil, em qualquer um dos 22 idiomas, explicada na hora.",
    heroCta: "Iniciar teste gratuito de 14 dias",
    heroPriceChip: "A partir de $69 por mês",
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
      "Interface do aluno em 22 idiomas",
      "Teste gratuito de 14 dias",
    ],
    priceCta: "Iniciar teste gratuito de 14 dias",
    priceLarger: "Mais de 500 alunos? Entre em contato para um plano distrital.",
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
        a: "Use Schools Large ($149 por mês, até 500 alunos) para qualquer escola menor que 500. Para mais de 500 alunos ou redes com várias unidades, entre em contato para um plano personalizado.",
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
    heroSub: "Chaque mot difficile, dans l'une des 22 langues, expliqué aussitôt.",
    heroCta: "Commencer l'essai gratuit de 14 jours",
    heroPriceChip: "À partir de $69 par mois",
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
      "Interface élève en 22 langues",
      "Essai gratuit de 14 jours",
    ],
    priceCta: "Commencer l'essai gratuit de 14 jours",
    priceLarger: "Plus de 500 élèves ? Contactez-nous pour un plan de district.",
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
        a: "Utilisez Schools Large ($149 par mois, jusqu'à 500 élèves) pour toute école de moins de 500. Pour plus de 500 élèves ou réseaux multi-sites, contactez-nous pour un plan personnalisé.",
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
    heroSub: "Jedes schwierige Wort, in einer von 22 Sprachen, sofort erklärt.",
    heroCta: "14 Tage kostenlos testen",
    heroPriceChip: "Ab $69 pro Monat",
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
      "Schüler-Oberfläche in 22 Sprachen",
      "14 Tage kostenlose Testphase",
    ],
    priceCta: "14 Tage kostenlos testen",
    priceLarger: "Mehr als 500 Schüler? Kontaktieren Sie uns für einen Bezirksplan.",
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
        a: "Verwenden Sie Schools Large ($149 pro Monat, bis zu 500 Schüler) für jede Schule unter 500. Für mehr als 500 Schüler oder Mehrstandortnetzwerke kontaktieren Sie uns für einen maßgeschneiderten Plan.",
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
    heroSub: "Ogni parola difficile, in una delle 22 lingue, spiegata all'istante.",
    heroCta: "Inizia la prova gratuita di 14 giorni",
    heroPriceChip: "Da $69 al mese",
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
      "Interfaccia studente in 22 lingue",
      "Prova gratuita di 14 giorni",
    ],
    priceCta: "Inizia la prova gratuita di 14 giorni",
    priceLarger: "Più di 500 studenti? Contattaci per un piano distrettuale.",
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
        a: "Usa Schools Large ($149 al mese, fino a 500 studenti) per qualsiasi scuola sotto i 500. Per più di 500 studenti o reti con più sedi, contattaci per un piano personalizzato.",
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
    heroSub: "どんな難しい単語も、14の言語のいずれかで、その場で説明。",
    heroCta: "14日間の無料トライアルを開始",
    heroPriceChip: "$69 / 月から",
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
      "22言語の生徒インターフェース",
      "14日間の無料トライアル",
    ],
    priceCta: "14日間の無料トライアルを開始",
    priceLarger: "500人を超える生徒は?学区プランについてお問い合わせください。",
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
        a: "500人未満の学校にはSchools Large($149/月、生徒500人まで)をご利用ください。500人を超える生徒や複数拠点のネットワークについては、カスタムプランについてお問い合わせください。",
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
const PRICE_SCHOOLS_MONTHLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_SCHOOLS_MONTHLY ?? "";
const PRICE_SCHOOLS_YEARLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_SCHOOLS_YEARLY ?? "";
const PRICE_SCHOOLS_LARGE_MONTHLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_SCHOOLS_LARGE_MONTHLY ?? "";
const PRICE_SCHOOLS_LARGE_YEARLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_SCHOOLS_LARGE_YEARLY ?? "";

const USD_TIERS = [
  { key: "small" as const, large: false, monthly: "$69", yearly: "$690" },
  { key: "large" as const, large: true, monthly: "$149", yearly: "$1,490" },
];

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
// en/ar/ru; the other 18 languages fall back to English, same he+en-primary
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
};

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
    note: "This is not only for new immigrants. It is for every student who hits a hard word, in any of 22 languages. The goal is understanding the material; this is the strongest tool for it.",
  },
  he: {
    tag: "חוצה שפות",
    h2: "ומה קורה כשהמילה בשפה שהתלמיד עדיין לא שולט בה?",
    body1: "ילד קורא את החומר בשפת ההוראה, אבל עדיין חושב ברוסית, באמהרית או בערבית. הוא נתקל במילה שאינו מכיר, לא מרים יד, וטובע בשקט בזמן שהכיתה ממשיכה הלאה.",
    body2: "ב-Gadit אותו תלמיד מחפש את המילה ומקבל את המשמעות המלאה בשפה שלו, וממשיך לקרוא את השיעור. מחסום ההבנה נעלם בהקשה אחת.",
    keyline: "התלמידים הרב-לשוניים שלך מפסיקים לפגר בכל מקצוע אחר, כי סוף סוף הם מצליחים לקרוא את החומר.",
    demoWordLabel: "בשיעור כתוב",
    demoMeaningLabel: "התלמיד מבין",
    note: "זה לא רק לעולים חדשים. זה לכל תלמיד שנתקל במילה קשה, בכל אחת מ-22 שפות. המטרה היא הבנת החומר, וזה הכלי החזק ביותר עבורה.",
  },
  ar: {
    tag: "عبر اللغات",
    h2: "وماذا لو كانت الكلمة بلغة لم يتقنها الطالب بعد؟",
    body1: "يقرأ الطفل الدرس بلغة التدريس لكنه لا يزال يفكر بالروسية أو الأمهرية أو العربية. يصادف كلمة لا يعرفها، لا يرفع يده، ويغرق بصمت بينما يمضي الصف قدمًا.",
    body2: "في Gadit يبحث ذلك الطالب عن الكلمة فيحصل على معناها الكامل بلغته، ثم يواصل قراءة الدرس. يختفي حاجز الفهم بنقرة واحدة.",
    keyline: "طلابك متعددو اللغات يتوقفون عن التأخر في كل مادة أخرى، لأنهم أخيرًا يستطيعون قراءة المحتوى.",
    demoWordLabel: "الدرس يقول",
    demoMeaningLabel: "الطالب يفهم",
    note: "هذا ليس للقادمين الجدد فقط. إنه لكل طالب يصادف كلمة صعبة، بأي من 14 لغة. الهدف هو فهم المحتوى، وهذه أقوى أداة لذلك.",
  },
  ru: {
    tag: "Между языками",
    h2: "А если слово на языке, которым ученик ещё не владеет?",
    body1: "Ребёнок читает урок на языке обучения, но всё ещё думает по-русски, на амхарском или арабском. Он встречает незнакомое слово, не поднимает руку и молча тонет, пока класс движется дальше.",
    body2: "В Gadit этот ученик ищет слово и получает полное значение на своём языке, а затем продолжает читать урок. Барьер понимания исчезает одним касанием.",
    keyline: "Ваши многоязычные ученики перестают отставать по всем другим предметам, потому что наконец могут читать материал.",
    demoWordLabel: "В уроке написано",
    demoMeaningLabel: "Ученик понимает",
    note: "Это не только для новых репатриантов. Это для каждого ученика, который встречает трудное слово, на любом из 14 языков. Цель — понимание материала, и это самый сильный инструмент для этого.",
  },
};

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
  function clickSchoolsTier(large: boolean) {
    const priceId = large
      ? billing === "yearly" ? PRICE_SCHOOLS_LARGE_YEARLY : PRICE_SCHOOLS_LARGE_MONTHLY
      : billing === "yearly" ? PRICE_SCHOOLS_YEARLY : PRICE_SCHOOLS_MONTHLY;
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
  // specific checkout would silently pick the $69 tier for the user.
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
              url="https://www.gadit.app/"
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
              url="https://www.gadit.app/"
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
          <LangSwitcher variant="muted" />
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
                ועוד 19 שפות
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
              max-width: 720px; margin-inline: auto;
              grid-template-columns: 1fr; gap: 20px;
            }
            @media (min-width: 620px) {
              .wordbook .wb-schools-price-grid.sl-price-grid-usd { grid-template-columns: 1fr 1fr; }
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
            {USD_TIERS.map((tier) => (
              <div
                key={tier.key}
                className={`wb-schools-price-card${tier.large ? " wb-schools-price-card-large" : ""}`}
              >
                <div className="wb-schools-price-name">{tier.large ? upu.largeName : upu.smallName}</div>
                <div className="wb-schools-price-amount">
                  <span className="wb-schools-price-amount-num" dir="ltr">
                    {billing === "yearly" ? tier.yearly : tier.monthly}
                  </span>
                  <span className="wb-schools-price-amount-period">
                    {billing === "yearly" ? upu.perYear : upu.perMonth}
                  </span>
                </div>
                <div className="wb-schools-price-students">
                  {tier.large ? upu.largeStudents : upu.smallStudents}
                </div>
                <button
                  type="button"
                  className="wb-schools-cta wb-schools-cta-block"
                  onClick={() => clickSchoolsTier(tier.large)}
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
