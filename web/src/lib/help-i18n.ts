/**
 * Help Center content — categorised troubleshooting Q&A rendered on
 * /contact. Each category becomes a section; each item renders as a
 * native <details> accordion so we get free open/close + a11y without
 * shipping client-side state.
 *
 * Editorial rules (Gadi, June 10 2026):
 *   - **No em-dashes (—) or en-dashes (–) anywhere.** They read as
 *     "AI wrote this" and break the founder voice. Use periods,
 *     commas, or restructure. See [[feedback_no_em_dashes]].
 *   - Startup-collective voice. "We read every message", not "I'll get back".
 *     Never use "I"/"me"/"my" — Gadit is a team, not one founder. Never
 *     mention "AI" — the mechanism is irrelevant to the user.
 *   - Every answer ends with a concrete next step.
 *   - Email address shown in the footer is the canonical contact;
 *     answers don't need to repeat "email me at <address>" since the
 *     same address appears under the CTA at the bottom of the page.
 *
 * Coverage philosophy:
 * - Lead with billing. That's where real users (Ziv) actually get
 *   stuck and pull Gadi onto WhatsApp. Cover every Stripe Customer
 *   Portal surface so the user solves it themself.
 * - Account & sign-in next. Firebase auth gotchas, verification
 *   email spam-folder issue, and so on.
 * - Product / usage third. Kids mode, voice, offline, reporting
 *   wrong content.
 * - Partner program fourth. The in-house program (/partners, /p/<code>,
 *   partner dashboard): standard 25% year one, 10% for life after,
 *   plus payout questions.
 * - General last. What Gadit is, languages, kids safety, data.
 */

import { planCopy } from "./plan-copy";
import { LANGUAGES, type Lang } from "./i18n";
import { HELP_MORE_1 } from "./help-i18n-more-1";
import { HELP_MORE_2 } from "./help-i18n-more-2";
import { HELP_MORE_3 } from "./help-i18n-more-3";
import { HELP_MORE_4 } from "./help-i18n-more-4";
import { HELP_MORE_5 } from "./help-i18n-more-5";

export interface HelpItem {
  /** Stable id so we can deep-link via #q-<id>. */
  id: string;
  q: string;
  /** Multi-paragraph answer. Each entry becomes a <p>. Keep paragraphs
      short. Readers skim. */
  a: string[];
}

export interface HelpCategory {
  /** Stable id so /account can deep-link via #billing, #account, etc. */
  id: string;
  /** Single-character emoji or short svg-friendly label; rendered as
      a small leading chip on each category header. */
  icon: string;
  title: string;
  items: HelpItem[];
}

export interface HelpContent {
  eyebrow: string;
  heading: string;
  lede: string;
  stillNeedHelpHeading: string;
  stillNeedHelpBody: string;
  emailCta: string;
  responseTime: string;
  categories: HelpCategory[];
}

export const HELP = {} as Record<Lang, HelpContent>;

Object.assign(HELP, {
  en: {
    eyebrow: "Help Center",
    heading: "Find an answer, fast",
    lede: "Common questions and step by step fixes, organised by area. If you don't see your issue, get in touch with the team at the bottom.",
    stillNeedHelpHeading: "Still stuck?",
    stillNeedHelpBody: "Write to us directly. Every message gets read by the team, and a reply usually comes within a day or two.",
    emailCta: "Email us",
    responseTime: "Typical reply: within 24 to 48 hours.",
    categories: [
      {
        id: "billing",
        icon: "💳",
        title: "Billing & subscription",
        items: [
          {
            id: "change-card",
            q: "How do I change the credit card on my subscription?",
            a: [
              "You can switch to a new card in under a minute without cancelling. Your current subscription keeps running, just on the new card.",
              "1. Sign in at gadit.app and open \"Account\" from the account menu. 2. Click \"Manage billing\". 3. A secure Stripe page opens. Add the new card as a payment method and mark it as the default. 4. Optionally remove the old card.",
              "From the next billing cycle on, everything goes to the new card. The previous charge (already collected) stays on the old card. No refund needed unless you want one specifically.",
            ],
          },
          {
            id: "cancel",
            q: "How do I cancel my subscription?",
            a: [
              "Self-serve, any time. Sign in, open Account, and tap Cancel subscription under your plan.",
              "Bought your subscription in the iPhone or iPad app? Cancel it in your Apple subscription settings. The \"Manage subscription\" link on your Account page takes you there.",
              "On a paid subscription, your access continues until the end of the period you already paid for. After that the account moves to Basic (free). Your saved words and history stay safe.",
              "During the 14-day free trial, cancelling ends the trial right away and nothing is charged. If the automatic charge is your only worry, pick that reason in the cancel window and you can turn off the renewal instead, keeping the trial until its last day.",
              "If you cancel a paid subscription by mistake or change your mind, you can resume it from the same page before the period ends.",
            ],
          },
          {
            id: "switch-plan",
            q: "How do I switch between Individual and Family?",
            a: [
              "To move to Family, open your Account page and tap \"Switch to Family\". Your current subscription is updated on the same card, without entering it again.",
              "Stripe works out the difference for the days left in the current period, so you only pay the difference. To move from Family to Individual, write to us from this page and the team will switch it for you.",
            ],
          },
          {
            id: "invoice",
            q: "How do I download an invoice or receipt?",
            a: [
              "Account, then Manage billing, then Invoice history. Every charge has a downloadable PDF receipt with the billing details you saved.",
              "If you need a different name, address, or tax ID on the invoice (for example a company name for tax purposes), update your billing details on the same page before downloading. The next receipt will use the new details.",
            ],
          },
          {
            id: "portal-error",
            q: "I clicked Manage billing but got an error. What now?",
            a: [
              "Two common causes. First, your account doesn't have an active Stripe subscription. Second, Stripe may not have a complete billing profile for your account yet.",
              "Easy first check: sign out, sign back in with the email you used at checkout, and try again. If it still fails, contact us with your account email and the team will fix it from our side in a minute.",
            ],
          },
          {
            id: "autorenew",
            q: "Will my subscription auto-renew?",
            a: [
              "Yes. Monthly plans renew every month, annual plans renew every year on the same date. You can see the next billing date in your account and on Stripe's portal.",
              "If you don't want auto-renew, cancel any time before the renewal date. Cancellation isn't immediate. You keep access through the period you already paid for.",
            ],
          },
          {
            id: "refund",
            q: "Can I get a refund?",
            a: [
              "Yes. If the purchase was less than 14 days ago and the service hasn't been used much, write to us with your account email and a short note about why. Those refunds get approved without a fight.",
              "If it's been more than 14 days, the team handles it case by case. Cancel the subscription so it doesn't keep renewing, and email us.",
            ],
          },
          {
            id: "unknown-charge",
            q: "What is this charge on my card?",
            a: [
              "Charges appear as GADIT or GADIT.APP. The amount matches your plan (Individual or Family, monthly or yearly) in your country's currency, as shown on the pricing page. Subscriptions that started before October 2026 keep the price they started with. If the amount doesn't match, it may be from a different service.",
              "If you're certain it's not yours, don't dispute through your bank yet. Write to us directly first with the date and amount. The team will find it, explain what it is, and refund if needed. A bank dispute can make future billing harder, so resolving it through support is usually faster and safer.",
            ],
          },
          {
            id: "failed-payment",
            q: "My payment failed. What should I do?",
            a: [
              "Stripe automatically retries failed payments a few times over the following days. Most failures resolve on their own once the bank releases the hold or the card has enough balance.",
              "A bar at the top of the page will say the charge didn't go through, and your access is kept for a few more days. Tap \"Update card\" there, enter a working card, and we'll try the charge on it right away. If your subscription has already moved to Basic, you can subscribe again from the Pricing page and your notebook stays intact.",
            ],
          },
          {
            id: "plan-comparison",
            q: "What's the difference between Basic, Individual and Family?",
            a: [
              "Basic (free): up to 10 word lookups a day, every meaning, examples, idioms, the word's origin, the right meaning from a sentence, and a notebook of up to 30 words.",
              "Individual: one person, every learning tool. Unlimited lookups, a picture for every meaning, more examples and questions about every word, compose a sentence with feedback, Every Word, Say it, a natural read-aloud voice and voice search, offline use, games, quizzes and word duels, and smart practice with test prep and dictation.",
              "Family: everything in Individual for up to 5 children and the parents, plus Kids Mode, a space of its own for every child, homework help, and the parent board with an alert for every word. Schools have a plan of their own. The prices for your country and the 14-day free trial are on the pricing page.",
            ],
          },
        ],
      },
      {
        id: "account",
        icon: "👤",
        title: "Account & sign-in",
        items: [
          {
            id: "no-verification-email",
            q: "I didn't receive my verification email",
            a: [
              "Check spam and promotions folders first. Gmail and Outlook sometimes route account emails there until you mark one as \"Not spam\".",
              "If it's not there, the email might have been mistyped at signup. Try signing up again and double-check the address. If you used Google sign-up, no verification email is needed.",
            ],
          },
          {
            id: "forgot-password",
            q: "I forgot my password",
            a: [
              "In the sign-in window, type your email, then tap \"Forgot password?\". A reset link usually arrives in your inbox within a minute or two. You can also tap \"Email me a sign-in link\" and sign in with no password.",
              "If the email doesn't arrive, check spam. If it still doesn't arrive, you might have signed up with Google instead of email and password. Try the \"Continue with Google\" button.",
            ],
          },
          {
            id: "wrong-credentials",
            q: "My password is right, but it says the email and password don't match",
            a: [
              "Three things to check. First, Caps Lock. Second, an extra space at the end after copy-pasting. Third, maybe you signed up with Google rather than a password (use \"Continue with Google\" instead).",
              "Still stuck? In the same message tap \"Email me a sign-in link\" to get in without a password, or \"Choose a new password\".",
            ],
          },
          {
            id: "google-fails",
            q: "Google sign-in doesn't work",
            a: [
              "Inside apps such as Instagram, Facebook or TikTok, the Google button is hidden. Open the link in your regular browser, or sign in with your email. If you joined with Google, type that email and tap \"Email me a sign-in link\".",
              "In a private (incognito) window, blocked cookies can stop Google sign-in, so try a normal window.",
            ],
          },
          {
            id: "change-email",
            q: "How do I change the email on my account?",
            a: [
              "Changing your account email is done by the team. Email us from your current address and write the new address in the message. The team will update it, and your subscription, history and notebook stay as they are.",
            ],
          },
          {
            id: "delete-account",
            q: "How do I delete my account?",
            a: [
              "At the bottom of the Account page, tap \"Delete account\" and type your account email to confirm. This is permanent: your subscription is cancelled, your notebook and history are erased, and the email is freed up for a fresh signup.",
              "The one exception is a subscription bought in the App Store: deleting the account doesn't cancel it, so cancel it first in your Apple subscription settings.",
              "Records of past charges stay, because the law requires us to keep them for accounting.",
            ],
          },
          {
            id: "share-account",
            q: "Can my partner or child share my account?",
            a: [
              "Each account has one person signed in at a time. For a household, the Family plan is built for this: up to 5 children and the parents, each with a space of their own, their own notebook and progress, plus Kids Mode for the children and a parent board.",
              "For one adult on their own, Individual covers one person with every learning tool. Compare the plans and the prices for your country on the pricing page.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "I think I have two accounts by mistake. What now?",
            a: [
              "This usually happens when someone signs up once with Google and once with email and password using the same address, or when you sign up twice with different email addresses. Each signup creates a separate Gadit account with its own notebook, history, and subscription state.",
              "Email us from one of the two addresses, and write the other address and which account you'd like to keep. The team will merge the notebooks and history onto the account you choose, then close the other one cleanly. No data lost.",
            ],
          },
        ],
      },
      {
        id: "product",
        icon: "🔍",
        title: "Using Gadit",
        items: [
          {
            id: "wrong-definition",
            q: "I think the definition is wrong. What do I do?",
            a: [
              "Next to every meaning, and on the idioms and word origin cards, there's a small flag icon. Tap it, choose what's wrong, and add a short note if you like. It comes straight to the team, and every report gets reviewed.",
              "Don't worry about being too picky. The dictionary improves from this feedback faster than from anything else.",
            ],
          },
          {
            id: "kids-not-working",
            q: "Kids Mode isn't changing the explanation",
            a: [
              "Kids Mode only changes the text where the word already has a kid-friendly explanation. For a word you've just looked up for the first time, give it 10 to 15 seconds while the kid-friendly version is prepared.",
              "Kids Mode is part of the Family plan. On Individual you'll see an \"In simple words\" switch instead, which gives a simpler explanation of each meaning. On Basic or without an account there is no switch. Subscribers who joined Clear or Deep before October 2026 keep Kids Mode. To get it, see Family on the pricing page.",
            ],
          },
          {
            id: "voice-fails",
            q: "Voice search doesn't work",
            a: [
              "Voice search needs microphone permission. Most browsers ask once per site. If you blocked it by mistake, tap the icon next to gadit.app in the address bar and allow the microphone in the site permissions.",
              "On iPhone and iPad, also allow the microphone for Safari in the device's Settings app. Voice search is part of the Individual and Family plans, so on Basic and without an account the microphone button doesn't appear. To upgrade, open the pricing page.",
            ],
          },
          {
            id: "no-image",
            q: "I can't get a picture for the word",
            a: [
              "Pictures are part of the Individual and Family plans, with up to 100 new pictures a month. A picture that already exists for that meaning opens without counting. The older Clear plan has 30 a month, and Basic doesn't include pictures. When the month's pictures are used up you'll see a notice, and the count starts again at the beginning of each month.",
              "If you're under the quota and still seeing failures, it's usually transient. Try again in 30 seconds. Persistent failures are a bug. Please report from the word page.",
            ],
          },
          {
            id: "save-word",
            q: "How do I save a word to my notebook?",
            a: [
              "You don't need to. When you're signed in, every word you look up is saved to your notebook on its own. On Basic the notebook holds up to 30 words. On Individual and Family it has no limit and includes smart practice, which brings your words back for review at the right time.",
              "On Individual and Family, the words you look up are also kept on your device, so they open without internet. To see your words, open the notebook from the menu.",
            ],
          },
          {
            id: "offline",
            q: "How do I use Gadit offline?",
            a: [
              "Offline use is part of the Individual and Family plans. Every word you look up is kept on your device, so it opens again instantly without internet. You can also tap \"Download offline pack\" on your Account page to save our dictionary's words in your language on this device.",
              "Looking up a brand-new word still needs a connection, because Gadit has to prepare the full result for it. The offline copy covers the words already on your device. If you're on Basic, see the plans on the pricing page.",
            ],
          },
          {
            id: "slow",
            q: "The app feels slow",
            a: [
              "The first lookup of a word is the slowest because Gadit generates the full result from scratch: usually a few seconds, sometimes longer for complex words. Subsequent lookups of the same word are instant, served from cache.",
              "If everything feels slow, try a hard refresh: Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows. If the slowness persists across pages, please email us with your country and browser so the team can check the network route to our servers from your region.",
            ],
          },
          {
            id: "word-not-found",
            q: "I searched a word and didn't get a result. What's going on?",
            a: [
              "First, check the spelling. If there was a typo, Gadit usually shows the corrected word, with a link to search for what you typed anyway.",
              "Very rare words or slang don't always get a result. If you're sure the word exists, write to us from this page and the team will check.",
            ],
          },
          {
            id: "change-language",
            q: "How do I change the UI language?",
            a: [
              "At the top of the page there's a globe icon with your current language. Tap it and choose a language.",
              "Your choice is saved on this device. Everything reloads in the new language: the interface, the menus, future word definitions, examples, kid explanations, even the word's origin. Words you already looked up in the old language show in it until you search them again.",
            ],
          },
        ],
      },
      {
        id: "partner",
        icon: "🤝",
        title: "Partner program",
        items: [
          {
            id: "join-partner",
            q: "How do I become a Gadit partner?",
            a: [
              "Go to gadit.app/partners and tap \"Join free\". Enter your name and email, then tap \"Get my partner code\". Your personal link and partner dashboard, with clicks and commissions, are ready right away, with no wait for approval. The code and link also arrive by email.",
              "Joining is free and open to anyone. You don't need a Gadit subscription to become a partner.",
            ],
          },
          {
            id: "commission-model",
            q: "How are commissions calculated?",
            a: [
              "The standard terms are 25% of every payment a customer makes in their first year. After that first year, you earn 10% of every payment for as long as the customer keeps paying. Bring 5 paying customers and your share after the first year rises to 15% for life.",
              "This works the same for monthly and annual plans, because commission is counted on each actual payment. If a customer cancels, your commission stops with their last payment.",
              "The team can set different rates for specific partners. Your own rates always show in your partner dashboard.",
            ],
          },
          {
            id: "payout",
            q: "When do I get paid?",
            a: [
              "Once a month, when your balance reaches the minimum shown in your partner dashboard. We send it to the PayPal account you set there. The minimum is a threshold, not a cap: you can earn far more, and you receive the payout once you cross it.",
              "Commissions release 30 days after the subscription payment, to allow for the refund window. So a January subscription releases in early February and lands in your next payout once your balance reaches the minimum.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "I joined but my dashboard is empty",
            a: [
              "Stats show after the first click on your link. Empty just means nobody's clicked yet. Go share the link. The dashboard updates in near real time once activity starts.",
              "If you've shared and someone's signed up but the dashboard isn't reflecting it, write to us with the rough time of signup and the team will check where the signup came from.",
            ],
          },
          {
            id: "attribution-window",
            q: "How long does my referral link keep tracking a visitor?",
            a: [
              "Sixty days. When a visitor clicks your link, we set a cookie identifying you as the referrer. If they sign up and subscribe any time in the next 60 days (even if they leave the site and come back later through a Google search), the attribution still credits you.",
              "Cookie clearance: if the visitor clears their cookies or switches browser/device before they sign up, attribution can be lost. There's no workaround for that, but 60 days is a generous window compared to most partner programs.",
            ],
          },
          {
            id: "missing-commission",
            q: "Someone signed up through my link but I don't see the commission",
            a: [
              "Most often this is timing: the signup shows up in the dashboard within minutes, but the commission only books once the subscription is actually paid (which can be days later if they're on a free trial). Check back after the trial ends.",
              "If the subscription paid but you still don't see the commission after 48 hours, write to us with the rough signup time and the email or rough name of the subscriber if you know it. The team will check where the signup came from and fix any miss manually.",
            ],
          },
        ],
      },
      {
        id: "general",
        icon: "❓",
        title: "General",
        items: [
          {
            id: "what-is-gadit",
            q: "What is Gadit?",
            a: [
              "Gadit helps you understand every word all the way through, not just get a one-line definition. Every word opens with all its meanings, real examples for each meaning, idioms and the word's origin. The paid plans add a picture for every meaning, practice, games and more, and Family adds Kids Mode and a space for every child.",
              "Gadit works in 41 languages. Internally the team calls it GAD a word: to understand a word all the way through, not just translate it. To see what each plan includes, open the pricing page.",
            ],
          },
          {
            id: "languages",
            q: "Which languages do you support?",
            a: [
              "Gadit works in 41 languages, including English, Hebrew, Arabic, Spanish, French, German, Russian, Chinese, Japanese, Hindi, isiZulu, isiXhosa and Afrikaans.",
              "You can look up a word in any of these languages and get the meanings, examples and everything else in the language you chose for the interface. Hebrew, Arabic and Persian read right to left, with their own fonts. To switch, tap the language button at the top of any page.",
            ],
          },
          {
            id: "kid-safety",
            q: "Is Gadit safe for kids?",
            a: [
              "Gadit is designed for a parent to use safely alongside a child. Kids mode produces explanations that are simple, concrete, and age-appropriate (around the 5 to 10 year old level), using the same engine that powers adult content with explicit instructions to simplify. No user-generated content is ever shown to kids.",
              "In line with our policies and child-privacy rules around the world, an account of your own is for ages 13 and up. Children use Gadit through a parent: on the Family plan the parent adds each child from the Family page, every child gets a space of their own with Kids Mode, and the parent board shows the words each child looks up. To set it up, start with Family on the pricing page.",
            ],
          },
          {
            id: "data",
            q: "Where is my data stored? Do you sell it?",
            a: [
              "Account, history, notebook, and generated images are stored securely in Firebase, encrypted in storage. We don't sell your data to anyone. We only share what's needed to run Gadit (storage, payments, content providers), as spelled out in the Privacy Policy.",
              "You can delete your account at any time from the Account page. To get a copy of your notebook or any other data we hold, write to us from this page.",
            ],
          },
          {
            id: "contact-direct",
            q: "How do I reach you directly?",
            a: [
              "Use the email button at the bottom of this page. It goes straight to the team inbox. Every message gets read and a reply within 24 to 48 hours (often faster).",
              "Email beats chat for support: it gives the team a chance to read carefully and reply thoughtfully. Phone support isn't offered yet.",
            ],
          },
        ],
      },
    ],
  },
  zu: {
    eyebrow: "Isikhungo Sosizo",
    heading: "Thola impendulo, ngokushesha",
    lede: "Imibuzo evamile nezixazululo isinyathelo nesinyathelo, zihlelwe ngezindawo. Uma ungayiboni inkinga yakho, xhumana neqembu ngezansi.",
    stillNeedHelpHeading: "Usabambekile?",
    stillNeedHelpBody: "Sibhalele ngqo. Wonke umyalezo ufundwa iqembu futhi ngokuvamile uthola impendulo phakathi kosuku noma ezimbili.",
    emailCta: "Sithumelele i-imeyili",
    responseTime: "Impendulo evamile: phakathi kwamahora angu-24 kuya kwangu-48.",
    categories: [
      {
        id: "billing",
        icon: "💳",
        title: "Ukukhokha nokubhalisa",
        items: [
          {
            id: "change-card",
            q: "Ngiyishintsha kanjani ikhadi lesikweletu ekubhaliseni kwami?",
            a: [
              "Ungashintshela ekhadini elisha ngaphansi komzuzu, ngaphandle kokukhansela. Ukubhalisa kwakho kwamanje kuqhubeka kusebenza, kodwa manje sekusebenzisa ikhadi elisha.",
              "1. Ngena ku-gadit.app bese uvula okuthi \"I-akhawunti\" kumenyu ye-akhawunti. 2. Chofoza \"Phatha ukukhokha\". 3. Kuvuleka ikhasi elivikelekile le-Stripe. Engeza ikhadi elisha njengendlela yokukhokha bese ulimaka njengeliyinhloko. 4. Uma uthanda, susa ikhadi elidala.",
              "Kusukela emjikelezweni olandelayo wokukhokha, konke kuzoya ekhadini elisha. Inkokhelo yangaphambilini, esivele iqoqiwe, ihlala ekhadini elidala. Akudingeki ukubuyiselwa imali ngaphandle uma uyifuna ngokuqondile.",
            ],
          },
          {
            id: "cancel",
            q: "Ngikukhansela kanjani ukubhalisa kwami?",
            a: [
              "Ungakwenza wena, noma nini. Ngena, uvule i-akhawunti, bese uthepha okuthi Khansela ukubhalisa ngaphansi kohlelo lwakho.",
              "Uthenge ukubhalisa kwakho kuhlelo lokusebenza lwe-iPhone noma lwe-iPad? Kukhansela kuzilungiselelo zakho zokubhalisa ze-Apple. Isixhumanisi esithi \"Phatha ukubhalisa\" ekhasini lakho le-akhawunti sikuyisa khona.",
              "Uma unokubhalisa okukhokhelwayo, ukufinyelela kwakho kuqhubeka kuze kube sekupheleni kwesikhathi osuvele usikhokhele. Ngemva kwalokho i-akhawunti iya ku-Basic, yamahhala. Amagama akho alondoloziwe nomlando kuhlala kuphephile.",
              "Phakathi nesikhathi sokuzama samahhala sezinsuku ezingu-14, ukukhansela kuqeda leso sikhathi sokuzama ngokushesha futhi akukho okukhokhiswayo. Uma okukukhathazayo kuphela kuyinkokhelo ezenzakalelayo, khetha leso sizathu efasiteleni lokukhansela, bese ungacisha ukuvuselela esikhundleni salokho, ugcine isikhathi sokuzama kuze kube usuku lwaso lokugcina.",
              "Uma ukhansela ukubhalisa okukhokhelwayo ngephutha noma ushintsha umqondo, ungakuqalisa futhi kusuka kulelo khasi elifanayo ngaphambi kokuphela kwesikhathi.",
            ],
          },
          {
            id: "switch-plan",
            q: "Ngishintsha kanjani phakathi kwe-Individual ne-Family?",
            a: [
              "Ukuze ushintshele ku-Family, vula ikhasi le-akhawunti yakho bese uthepha okuthi \"Shintshela ku-Family\". Ukubhalisa kwakho kwamanje kubuyekezwa ekhadini elifanayo, ngaphandle kokulifaka futhi.",
              "I-Stripe ibala umehluko wezinsuku ezisele esikhathini samanje, ngakho ukhokha umehluko kuphela. Ukuze ushintshe kusuka ku-Family uye ku-Individual, sibhalele kuleli khasi futhi iqembu lizokushintshela.",
            ],
          },
          {
            id: "invoice",
            q: "Ngiyilanda kanjani i-invoyisi noma irisidi?",
            a: [
              "I-Account, bese Manage billing, bese Invoice history. Yonke inkokhelo inerisidi ye-PDF elandekayo enemininingwane yokukhokha oyigcinile.",
              "Uma udinga igama, ikheli, noma i-ID yentela ehlukile ku-invoyisi (isibonelo igama lenkampani ngezinjongo zentela), buyekeza imininingwane yakho yokukhokha kuleli khasi elifanayo ngaphambi kokulanda. Irisidi elandelayo lizosebenzisa imininingwane emisha.",
            ],
          },
          {
            id: "portal-error",
            q: "Ngichofozile Manage billing kodwa ngathola iphutha. Manje kwenziwani?",
            a: [
              "Izimbangela ezimbili ezivamile. Okokuqala, i-akhawunti yakho ayinakho ukubhalisa kwe-Stripe okusebenzayo. Okwesibili, kungenzeka i-Stripe ingakabi nephrofayela egcwele yokukhokha ye-akhawunti yakho okwamanje.",
              "Ukuhlola kokuqala okulula: phuma, ubuye ungene nge-imeyili oyisebenzisile lapho ukhokha, bese uzama futhi. Uma kusehluleka, xhumana nathi nge-imeyili ye-akhawunti yakho futhi iqembu lizokulungisa ohlangothini lwethu ngomzuzu.",
            ],
          },
          {
            id: "autorenew",
            q: "Ingabe ukubhalisa kwami kuzozivuselela ngokuzenzakalelayo?",
            a: [
              "Yebo. Amahlelo enyanga avuselela njalo ngenyanga, amahlelo onyaka avuselela njalo ngonyaka ngosuku olufanayo. Ungabona usuku olulandelayo lokukhokha ku-akhawunti yakho nasephothalini ye-Stripe.",
              "Uma ungakufuni ukuzivuselela okuzenzakalelayo, khansela nganoma yisiphi isikhathi ngaphambi kosuku lokuvuselela. Ukukhansela akwenzeki ngokushesha. Ugcina ukufinyelela kuze kube sekupheleni kwesikhathi osuvele usikhokhele.",
            ],
          },
          {
            id: "refund",
            q: "Ngingawuthola umbuyiselo?",
            a: [
              "Yebo. Uma ukuthenga kwenzeke ngaphansi kwezinsuku ezingu-14 ezedlule futhi insizakalo ingasetshenzisiwe kakhulu, sibhalele nge-imeyili ye-akhawunti yakho nenothi elifushane ngesizathu. Leyo mibuyiselo iyagunyazwa ngaphandle kwempikiswano.",
              "Uma sekwedlule izinsuku ezingaphezu kuka-14, iqembu likuphatha icala ngecala. Khansela ukubhalisa ukuze kungaqhubeki kuvuselela, bese usithumelela i-imeyili.",
            ],
          },
          {
            id: "unknown-charge",
            q: "Iyini le nkokhelo ekhadini lami?",
            a: [
              "Izinkokhelo zivela njenge-GADIT noma i-GADIT.APP. Inani lihambisana nohlelo lwakho (Individual noma Family, ngenyanga noma ngonyaka) ngemali yezwe lakho, njengoba kuboniswe ekhasini lamanani. Okubhaliswe ngaphambi kuka-Okthoba 2026 kugcina inani okuqale ngalo. Uma inani lingahambisani, kungenzeka ivela kwenye insizakalo.",
              "Uma uqinisekile ukuthi akuyona eyakho, ungaqali ngokuphikisa ngebhange lakho. Sibhalele ngqo kuqala ngosuku nenani. Iqembu lizoyithola, lichaze ukuthi iyini, futhi libuyisele uma kudingeka. Ukuphikisa ngebhange kungenza ukukhokha kwesikhathi esizayo kube nzima, ngakho ukukuxazulula ngosizo ngokuvamile kushesha futhi kuphephe kakhulu.",
            ],
          },
          {
            id: "failed-payment",
            q: "Inkokhelo yami yehlulekile. Kufanele ngenzeni?",
            a: [
              "I-Stripe izama kabusha ngokuzenzakalelayo izinkokhelo ezihlulekile izikhathi ezimbalwa ezinsukwini ezilandelayo. Iningi lokwehluleka liyazilungisa lona uma ibhange selikhulule ukubamba, noma ikhadi selinebhalansi eyanele.",
              "Ibha phezulu ekhasini izosho ukuthi inkokhelo ayiphumelelanga, futhi ukufinyelela kwakho kugcinwa izinsuku ezimbalwa ezengeziwe. Thepha okuthi \"Buyekeza ikhadi\" lapho, ufake ikhadi elisebenzayo, bese sizama inkokhelo kulona ngokushesha. Uma ukubhalisa kwakho sekubuyisele ku-Basic, ungabhalisa futhi ekhasini le-Pricing futhi incwadi yakho yamanothi ihlala injalo.",
            ],
          },
          {
            id: "plan-comparison",
            q: "Uyini umehluko phakathi kwe-Basic, Individual ne-Family?",
            a: [
              "I-Basic (yamahhala): kufika ekubhekeni amagama angu-10 ngosuku, zonke izincazelo, izibonelo, izisho, umsuka wegama, incazelo efanele evela emshweni, nencwadi yamanothi enamagama afinyelela ku-30.",
              "Individual: umuntu oyedwa, wonke amathuluzi okufunda. Ukubheka okungenamkhawulo, isithombe sencazelo ngayinye, izibonelo eziningi nemibuzo ngegama ngalinye, Bhala umusho uthole impendulo, Wonke amagama, Yisho, izwi lemvelo elifundayo nokusesha ngezwi, ukusebenzisa ungaxhunyiwe ku-inthanethi, imidlalo, ama-quiz nemiqhudelwano yamagama, nokuzijwayeza okuhlakaniphile nokulungiselela izivivinyo nedikiteshini.",
              "Family: konke okuku-Individual kufika ezinganeni ezi-5 nabazali, kanye nemodi yezingane, indawo eyayo yengane ngayinye, usizo ngomsebenzi wasekhaya, nebhodi lomzali nesaziso segama ngalinye. Izikole zinohlelo lwazo. Amanani ezwe lakho nesikhathi sokuzama samahhala sezinsuku ezingu-14 akukhasi lamanani.",
            ],
          },
        ],
      },
      {
        id: "account",
        icon: "👤",
        title: "I-akhawunti nokungena",
        items: [
          {
            id: "no-verification-email",
            q: "Angiyitholanga i-imeyili yami yokuqinisekisa",
            a: [
              "Hlola amafolda e-spam nawezikhangiso kuqala. I-Gmail ne-Outlook kwesinye isikhathi zithumela ama-imeyili e-akhawunti lapho kuze kube yilapho umaka elilodwa njenge \"Not spam\".",
              "Uma lingekho, kungenzeka i-imeyili yabhalwa ngephutha ngesikhathi sokubhalisa. Zama ukubhalisa futhi bese uhlola kabili ikheli. Uma usebenzise ukubhalisa nge-Google, akudingeki i-imeyili yokuqinisekisa.",
            ],
          },
          {
            id: "forgot-password",
            q: "Ngiyikhohliwe iphasiwedi yami",
            a: [
              "Ewindini lokungena, thayipha i-imeyili yakho, bese uthepha \"Ukhohlwe iphasiwedi?\". Isixhumanisi sokusetha kabusha sivame ukufika ebhokisini lakho lokungenayo kungakapheli umzuzu noma emibili. Ungaphinda uthephe \"Ngithumelele isixhumanisi sokungena nge-imeyili\" ungene ngaphandle kwephasiwedi.",
              "Uma i-imeyili ingafiki, hlola i-spam. Uma isengafiki, kungenzeka wabhalisa nge-Google esikhundleni se-imeyili nephasiwedi. Zama inkinobho ethi \"Qhubeka nge-Google\".",
            ],
          },
          {
            id: "wrong-credentials",
            q: "Iphasiwedi yami ilungile, kodwa ithi i-imeyili nephasiwedi akuhambisani",
            a: [
              "Izinto ezintathu okufanele uzihlole. Okokuqala, i-Caps Lock. Okwesibili, isikhala esengeziwe ekugcineni ngemva kokukopisha nokunamathisela. Okwesithathu, kungenzeka wabhalisa nge-Google kunokuba usebenzise iphasiwedi, sebenzisa \"Qhubeka nge-Google\" esikhundleni salokho.",
              "Usabambekile? Kulo mlayezo ofanayo thepha \"Ngithumelele isixhumanisi sokungena nge-imeyili\" ukuze ungene ngaphandle kwephasiwedi, noma \"Khetha iphasiwedi entsha\".",
            ],
          },
          {
            id: "google-fails",
            q: "Ukungena nge-Google akusebenzi",
            a: [
              "Ngaphakathi kwezinhlelo zokusebenza ezifana ne-Instagram, Facebook noma TikTok, inkinobho ye-Google iyafihlwa. Vula isixhumanisi kusiphequluli sakho esijwayelekile, noma ungene nge-imeyili yakho. Uma wajoyina nge-Google, thayipha leyo imeyili bese uthepha \"Ngithumelele isixhumanisi sokungena nge-imeyili\".",
              "Ewindini eliyimfihlo, ama-cookie avinjiwe angamisa ukungena nge-Google, ngakho zama iwindi elijwayelekile.",
            ],
          },
          {
            id: "change-email",
            q: "Ngiyishintsha kanjani i-imeyili ku-akhawunti yami?",
            a: [
              "Ukushintsha i-imeyili ye-akhawunti yakho kwenziwa yithimba. Sithumelele i-imeyili usuka ekhelini lakho lamanje bese ubhala ikheli elisha emlayezweni. Ithimba lizolibuyekeza, futhi ukubhalisa kwakho, umlando nencwadi yamanothi kuhlala kunje.",
            ],
          },
          {
            id: "delete-account",
            q: "Ngiyisusa kanjani i-akhawunti yami?",
            a: [
              "Ezansi kwekhasi le-\"I-akhawunti\", thepha \"Susa i-akhawunti\" bese uthayipha i-imeyili ye-akhawunti yakho ukuze uqinisekise. Lokhu kuhlala unomphela: ukubhalisa kwakho kuyakhanselwa, incwadi yakho yamanothi nomlando kuyasuswa, futhi i-imeyili iyakhululwa ukuze ubhalise kabusha.",
              "Okuhlukile kuphela ukubhalisa okuthengwe ku-App Store, ukususa i-akhawunti akukukhanseli, ngakho kukhansele kuqala kuzilungiselelo zakho zokubhalisa ze-Apple.",
              "Amarekhodi ezinkokhelo ezedlule ayahlala, ngoba umthetho usiphoqa ukuthi siwagcine ngezokubalwa kwezimali.",
            ],
          },
          {
            id: "share-account",
            q: "Ingabe umlingani wami noma ingane yami bangayabelana nge-akhawunti yami?",
            a: [
              "I-akhawunti ngayinye inomuntu oyedwa ongene ngemvume ngesikhathi esisodwa. Ekhaya, uhlelo lwe-Family lwakhelwe lokhu: kufika ezinganeni ezi-5 nabazali, ngamunye enendawo yakhe, incwadi yakhe yamanothi nenqubekela phambili yakhe, kanye nemodi yezingane yezingane nebhodi lomzali.",
              "Kumuntu omdala oyedwa, i-Individual ingeyomuntu oyedwa futhi inawo wonke amathuluzi okufunda. Qhathanisa amahlelo namanani ezwe lakho ekhasini lamanani.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "Ngicabanga ukuthi nginama-akhawunti amabili ngephutha. Manje kwenziwani?",
            a: [
              "Lokhu kuvame ukwenzeka lapho umuntu ebhalisa kanye nge-Google bese ebhalisa futhi nge-imeyili nephasiwedi esebenzisa ikheli elifanayo, noma lapho ubhalisa kabili ngamakheli e-imeyili ahlukene. Ukubhalisa ngakunye kwakha i-akhawunti ye-Gadit ehlukile enencwadi yamanothi yayo, umlando wayo, nesimo sayo sokubhalisa.",
              "Sithumele i-imeyili usuka kwelinye lalawo makheli amabili, bese ubhala elinye ikheli nokuthi iyiphi i-akhawunti ofuna ukuyigcina. Iqembu lizohlanganisa incwadi yamanothi nomlando ku-akhawunti oyikhethayo, bese livala enye kahle. Ayikho idatha elahlekayo.",
            ],
          },
        ],
      },
      {
        id: "product",
        icon: "🔍",
        title: "Ukusebenzisa i-Gadit",
        items: [
          {
            id: "wrong-definition",
            q: "Ngicabanga ukuthi incazelo ayilungile. Ngenzani?",
            a: [
              "Eceleni kwencazelo ngayinye, futhi nasemakhadini ezisho nawomsuka wegama, kunophawu oluncane lwefulegi. Luthephe, ukhethe okungalungile, bese ungeza inothi elifushane uma uthanda. Kufika ngqo eqenjini, futhi wonke umbiko uyabuyekezwa.",
              "Ungakhathazeki ngokuba nokukhetha okweqile. Isichazamazwi sithuthuka kule mpendulo ngokushesha kunanoma yini enye.",
            ],
          },
          {
            id: "kids-not-working",
            q: "Imodi yezingane ayiyishintshi incazelo",
            a: [
              "Imodi yezingane ishintsha umbhalo kuphela lapho igama selivele linencazelo elungele izingane. Egameni osanda kulibheka okokuqala, linike imizuzwana engu-10 kuya kwengu-15 ngenkathi kulungiswa inguqulo yezingane.",
              "Imodi yezingane iyingxenye yohlelo lwe-Family. Ku-Individual uzobona iswishi ethi \"Ngamagama alula\" esikhundleni sayo, enikeza incazelo elula kakhudlwana yencazelo ngayinye. Ku-Basic noma ngaphandle kwe-akhawunti akukho swishi. Ababhalisile abajoyine i-Clear noma i-Deep ngaphambi kuka-Okthoba 2026 bagcina Imodi yezingane. Ukuze uyithole, bheka i-Family ekhasini lamanani.",
            ],
          },
          {
            id: "voice-fails",
            q: "Usesho ngezwi alusebenzi",
            a: [
              "Usesho ngezwi ludinga imvume yemakrofoni. Iziphequluli eziningi zibuza kanye ngesayithi ngalinye. Uma uyivimbe ngephutha, thepha isithonjana esiseduze kwe-gadit.app ebharini yekheli bese uvumela imakrofoni kuzimvume zesayithi.",
              "Ku-iPhone naku-iPad, vumela futhi imakrofoni ye-Safari kuhlelo lokusebenza lwe-Settings lwedivayisi. Usesho ngezwi luyingxenye yamahlelo e-Individual ne-Family, ngakho ku-Basic nangaphandle kwe-akhawunti inkinobho yemakrofoni ayiveli. Ukuze uthuthukise, vula ikhasi lamanani.",
            ],
          },
          {
            id: "no-image",
            q: "Angikwazi ukuthola isithombe segama",
            a: [
              "Izithombe ziyingxenye yamahlelo e-Individual ne-Family, ezinezithombe ezintsha ezifika ku-100 ngenyanga. Isithombe esivele sikhona saleyo ncazelo siyavuleka ngaphandle kokubalwa. Uhlelo oludala lwe-Clear lunezingu-30 ngenyanga, futhi i-Basic ayinazo izithombe. Uma izithombe zenyanga seziphelile uzobona isaziso, futhi ukubala kuqala kabusha ekuqaleni kwenyanga ngayinye.",
              "Uma ungaphansi kwesabelo kodwa usabona ukwehluleka, ngokuvamile kuyedlula. Zama futhi ngemva kwemizuzwana engu-30. Ukwehluleka okuqhubekayo kuyiphutha lohlelo. Sicela ubike kusuka ekhasini legama.",
            ],
          },
          {
            id: "save-word",
            q: "Ngiligcina kanjani igama encwadini yami yamanothi?",
            a: [
              "Akudingeki. Uma ungene ngemvume, wonke amagama owabhekayo agcinwa encwadini yakho yamanothi ngokwawo. Ku-Basic incwadi yamanothi ithatha amagama afinyelela ku-30. Ku-Individual naku-Family ayinamkhawulo futhi inokuzijwayeza okuhlakaniphile, okubuyisa amagama akho ukuze uwabuyekeze ngesikhathi esifanele.",
              "Ku-Individual naku-Family, amagama owabhekayo nawo agcinwa kudivayisi yakho, ngakho avuleka ngaphandle kwe-inthanethi. Ukuze ubone amagama akho, vula incwadi yamanothi kumenyu.",
            ],
          },
          {
            id: "offline",
            q: "Ngiyisebenzisa kanjani i-Gadit ngaphandle kwe-inthanethi?",
            a: [
              "Ukusebenzisa ngaphandle kwe-inthanethi kuyingxenye yamahlelo e-Individual ne-Family. Wonke amagama owabhekayo agcinwa kudivayisi yakho, ngakho avuleka futhi ngokushesha ngaphandle kwe-inthanethi. Ungathepha futhi okuthi \"Landa iphakethe lokungaxhumeki\" ekhasini lakho le-\"I-akhawunti\" ukuze ulondoloze amagama esichazamazwi sethu ngolimi lwakho kule divayisi.",
              "Ukubheka igama elisha ngokuphelele kusadinga uxhumano, ngoba i-Gadit kufanele ilungiselele umphumela ogcwele walo. Ikhophi yokungaxhunyiwe imboza amagama asevele ekudivayisi yakho. Uma uku-Basic, bheka amahlelo ekhasini lamanani.",
            ],
          },
          {
            id: "slow",
            q: "Uhlelo lokusebenza luzwakala luhamba kancane",
            a: [
              "Ukubheka kokuqala kwegama kuhamba kancane kakhulu ngoba i-Gadit ikhiqiza umphumela ophelele kusukela ekuqaleni: ngokuvamile imizuzwana embalwa, kwesinye isikhathi isikhathi eside kumagama ayinkimbinkimbi. Ukubheka okulandelayo kwegama elifanayo kusheshayo, kulethwa kusuka enqolobaneni.",
              "Uma konke kuzwakala kuhamba kancane, zama ukuvuselela okuqinile: Cmd+Shift+R ku-Mac, Ctrl+Shift+R ku-Windows. Uma ukuhamba kancane kuqhubeka kuwo wonke amakhasi, sicela usithumelele i-imeyili nezwe lakho nesiphequluli ukuze iqembu lihlole indlela yenethiwekhi eya kumaseva ethu kusuka esifundeni sakho.",
            ],
          },
          {
            id: "word-not-found",
            q: "Ngiseshe igama kodwa angitholanga mphumela. Kwenzekani?",
            a: [
              "Okokuqala, hlola upelo. Uma kube nephutha lokuthayipha, i-Gadit ivamise ukukhombisa igama elilungisiwe, kanye nesixhumanisi sokusesha lokho okubhale noma kunjalo.",
              "Amagama angavamile kakhulu noma esilingi awahlali enomphumela. Uma uqinisekile ukuthi igama likhona, sibhalele usuka kuleli khasi bese ithimba lizokuhlola.",
            ],
          },
          {
            id: "change-language",
            q: "Ngilushintsha kanjani ulimi lwesixhumi (UI)?",
            a: [
              "Phezulu ekhasini kunesithonjana sembulunga esinolimi lwakho lwamanje. Sithephe bese ukhetha ulimi.",
              "Ukukhetha kwakho kugcinwa kule divayisi. Konke kulayisha kabusha ngolimi olusha, isixhumi, amamenyu, izincazelo zamagama zesikhathi esizayo, izibonelo, izincazelo zezingane, ngisho nomsuka wegama. Amagama osuvele wawabheka ngolimi oludala azohlala ekulo kuze kube yilapho uwasesha futhi.",
            ],
          },
        ],
      },
      {
        id: "partner",
        icon: "🤝",
        title: "Uhlelo lwabalingani",
        items: [
          {
            id: "join-partner",
            q: "Ngiba kanjani umlingani we-Gadit?",
            a: [
              "Iya ku-gadit.app/partners bese uthepha \"Joyina mahhala\". Faka igama lakho ne-imeyili, bese uthepha \"Thola ikhodi yami yomlingani\". Isixhumanisi sakho siqu nedeshibhodi yabalingani, enokuchofozwa namakhomishini, kuba sekulungile ngokushesha, ngaphandle kokulinda ukugunyazwa. Ikhodi nesixhumanisi nakho kufika nge-imeyili.",
              "Ukujoyina kumahhala futhi kuvulekele wonke umuntu. Awudingi ukubhalisa ku-Gadit ukuze ube umlingani.",
            ],
          },
          {
            id: "commission-model",
            q: "Amakhomishini abalwa kanjani?",
            a: [
              "Imigomo ejwayelekile ingu-25% wayo yonke inkokhelo eyenziwa ikhasimende onyakeni walo wokuqala. Ngemva kwalowo nyaka wokuqala, uhola u-10% wayo yonke inkokhelo inqobo nje uma ikhasimende liqhubeka likhokha. Uma uletha amakhasimende akhokhayo angu-5, isabelo sakho ngemva konyaka wokuqala sikhuphukela ku-15% impilo yonke.",
              "Lokhu kusebenza ngendlela efanayo ezinhlelweni zenyanga nezonyaka, ngoba ikhomishini ibalwa enkokhelweni ngayinye eyenziwe ngempela. Uma ikhasimende likhansela, ikhomishini yakho iyama ngenkokhelo yalo yokugcina.",
              "Iqembu lingasetha amazinga ahlukile kwabanye abalingani. Amazinga akho ahlala ebonakala kudeshibhodi yakho yabalingani.",
            ],
          },
          {
            id: "payout",
            q: "Ngikhokhelwa nini?",
            a: [
              "Kanye ngenyanga, uma ibhalansi yakho isifinyelele ubuncane obukhonjiswe kudeshibhodi yakho yabalingani. Siyithumela ku-akhawunti ye-PayPal oyisethe lapho. Ubuncane buyisilinganiso sokuqala, akuwona umkhawulo ophezulu. Ungahola kakhulu ngaphezu kwalokho, futhi uthola inkokhelo uma usuweqile lowo mkhawulo.",
              "Amakhomishini akhululwa ezinsukwini ezingu-30 ngemva kwenkokhelo yokubhalisa, ukuze kuvumeleke isikhathi sembuyiselo. Ngakho ukubhalisa kukaJanuwari kukhululwa ekuqaleni kukaFebhuwari, bese kufika enkokhelweni yakho elandelayo uma ibhalansi yakho isifinyelele ubuncane.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "Ngijoyinile kodwa ideshibhodi yami ayinalutho",
            a: [
              "Izibalo ziyavela ngemva kokuchofoza kokuqala esixhumanisini sakho. Okungenalutho kusho nje ukuthi akekho osechofozile okwamanje. Hamba wabelane ngesixhumanisi. Ideshibhodi ibuyekeza cishe ngesikhathi sangempela uma umsebenzi usuqalile.",
              "Uma wabelane futhi othile ebhalisile kodwa ideshibhodi ingakubonisi lokho, sibhalele ngesikhathi esilinganiselwe sokubhalisa, iqembu lizohlola ukuthi ukubhalisa kuvelaphi.",
            ],
          },
          {
            id: "attribution-window",
            q: "Isixhumanisi sami sokudlulisela siqhubeka isikhathi esingakanani silandelela isivakashi?",
            a: [
              "Izinsuku ezingamashumi ayisithupha. Lapho isivakashi sichofoza isixhumanisi sakho, sibeka ikhukhi elikuhlonza njengomdlulisi. Uma bebhalisa futhi bebhalisela nganoma yisiphi isikhathi ezinsukwini ezingu-60 ezizayo (ngisho noma beshiya isayithi bese bebuya kamuva ngosesho lwe-Google), ukwabelwa kusakubalela wena.",
              "Ukususwa kwamakhukhi: uma isivakashi sisusa amakhukhi aso noma sishintsha isiphequluli noma idivayisi ngaphambi kokuthi babhalise, ukwabelwa kungalahleka. Alikho isu lokusijikela lokho, kodwa izinsuku ezingu-60 ziyiwindi elivulelekile uma kuqhathaniswa nezinhlelo eziningi zabalingani.",
            ],
          },
          {
            id: "missing-commission",
            q: "Umuntu othile ubhalise ngesixhumanisi sami kodwa angiyiboni ikhomishini",
            a: [
              "Ngokuvamile lokhu kuba yindaba yesikhathi. Ukubhalisa kuvela kudeshibhodi phakathi kwemizuzu, kodwa ikhomishini ibhalwa kuphela uma ukubhalisa sekukhokhelwe ngempela, okungaba izinsuku kamuva uma besesikhathini sokulinga samahhala. Bheka futhi ngemva kokuphela kwesikhathi sokulinga.",
              "Uma ukubhalisa kukhokhelwe kodwa usangayiboni ikhomishini ngemva kwamahora angu-48, sibhalele ngesikhathi esilinganiselwe sokubhalisa kanye ne-imeyili noma igama elilinganiselwe lombhalisi uma ukwazi. Iqembu lizohlola ukuthi ukubhalisa kuvelaphi futhi lilungise noma yini ephuthelwe ngesandla.",
            ],
          },
        ],
      },
      {
        id: "general",
        icon: "❓",
        title: "Okujwayelekile",
        items: [
          {
            id: "what-is-gadit",
            q: "Yini i-Gadit?",
            a: [
              "I-Gadit ikusiza uqonde igama ngalinye ngokuphelele, hhayi nje ukuthola incazelo yomugqa owodwa. Igama ngalinye livuleka nazo zonke izincazelo zalo, izibonelo zangempela zencazelo ngayinye, izisho nomsuka wegama. Amahlelo akhokhelwayo engeza isithombe sencazelo ngayinye, ukuzijwayeza, imidlalo nokunye, futhi i-Family yengeza imodi yezingane nendawo yengane ngayinye.",
              "I-Gadit isebenza ngezilimi ezingu-41. Ngaphakathi iqembu likubiza ngokuthi uku-GAD igama: ukuqonda igama ngokuphelele, hhayi nje ukulihumusha. Ukuze ubone ukuthi uhlelo ngalunye luneni, vula ikhasi lamanani.",
            ],
          },
          {
            id: "languages",
            q: "Yiziphi izilimi enizisekelayo?",
            a: [
              "I-Gadit isebenza ngezilimi ezingu-41, kuhlanganise isiNgisi, isiHeberu, isi-Arabhu, isiSpanish, isiFulentshi, isiJalimane, isiRashiya, isiShayina, isiJaphane, isiHindi, isiZulu, isiXhosa nesiBhunu.",
              "Ungabheka igama nganoma yiluphi lwalezi zilimi bese uthola izincazelo, izibonelo nakho konke okunye ngolimi olukhethele isixhumi. IsiHeberu, isi-Arabhu nesiPheresiya zibhalwa kusuka ngakwesokudla kuya ngakwesobunxele, ngamafonti azo. Ukuze ushintshe, thepha inkinobho yolimi phezulu kwanoma yiliphi ikhasi.",
            ],
          },
          {
            id: "kid-safety",
            q: "Ingabe i-Gadit iphephile ezinganeni?",
            a: [
              "I-Gadit yakhelwe ukuthi umzali ayisebenzise ngokuphepha eceleni kwengane. Imodi yezingane ikhiqiza izincazelo ezilula, ezibonakalayo, nezifanele ubudala (cishe izinga leminyaka engu-5 kuya kwengu-10), isebenzisa injini efanayo enika amandla okuqukethwe kwabadala nemiyalo ecacile yokwenza kube lula. Akukho okuqukethwe okwenziwe umsebenzisi okuke kuboniswe ezinganeni.",
              "Ngokuhambisana nezinqubomgomo zethu nemithetho yobumfihlo bezingane emhlabeni wonke, i-akhawunti yakho siqu ingeyabaneminyaka engu-13 nangaphezulu. Izingane zisebenzisa i-Gadit ngomzali: kuhlelo lwe-Family umzali wengeza ingane ngayinye ekhasini le-Family, ingane ngayinye ithola indawo yayo enemodi yezingane, futhi ibhodi lomzali likhombisa amagama ingane ngayinye ewabhekayo. Ukuze ukusethe, qala nge-Family ekhasini lamanani.",
            ],
          },
          {
            id: "data",
            q: "Idatha yami igcinwaphi? Ingabe niyayithengisa?",
            a: [
              "I-akhawunti, umlando, incwadi yamanothi, nezithombe ezikhiqiziwe zigcinwa ngokuphephile ku-Firebase, zibethelwe endaweni yokugcina. Asiyithengisi idatha yakho kunoma ubani. Sabelana kuphela ngalokho okudingekayo ukusebenzisa i-Gadit (indawo yokugcina, izinkokhelo, abahlinzeki bokuqukethwe), njengoba kuchaziwe kuNqubomgomo Yobumfihlo.",
              "Ungasusa i-akhawunti yakho nganoma yisiphi isikhathi ekhasini le-Akhawunti. Ukuze uthole ikhophi yencwadi yakho yamanothi noma enye idatha esinayo, sibhalele kuleli khasi.",
            ],
          },
          {
            id: "contact-direct",
            q: "Ngingafinyelela kanjani kini ngqo?",
            a: [
              "Sebenzisa inkinobho ye-imeyili engezansi kwaleli khasi. Iya ngqo enqolobaneni yemiyalezo yeqembu. Wonke umyalezo uyafundwa futhi uthola impendulo phakathi kwamahora angu-24 kuya kwangu-48 (ngokuvamile ngokushesha okukhulu).",
              "I-imeyili ingcono kunengxoxo ekusekeleni: inika iqembu ithuba lokufunda ngokucophelela nokuphendula ngokucabanga. Ukusekelwa ngefoni akukatholakali okwamanje.",
            ],
          },
        ],
      },
    ],
  },
  xh: {
    eyebrow: "Iziko loncedo",
    heading: "Fumana impendulo, ngokukhawuleza",
    lede: "Imibuzo eqhelekileyo nezisombululo inyathelo ngenyathelo, zicwangciswe ngamacandelo. Ukuba awuyiboni ingxaki yakho, qhagamshelana neqela ezantsi.",
    stillNeedHelpHeading: "Usabambekile?",
    stillNeedHelpBody: "Sibhalele ngqo. Wonke umyalezo ufundwa liqela kwaye ngokuqhelekileyo uphendulwa kwisithuba sosuku okanye ezimbini.",
    emailCta: "Sithumelele i-imeyile",
    responseTime: "Impendulo eqhelekileyo: kwiiyure ezingama-24 ukuya kwezingama-48.",
    categories: [
      {
        id: "billing",
        icon: "💳",
        title: "Iintlawulo nomrhumo",
        items: [
          {
            id: "change-card",
            q: "Ndilitshintsha njani ikhadi letyala kumrhumo wam?",
            a: [
              "Ungatshintshela kwikhadi elitsha ngaphantsi komzuzu ngaphandle kokurhoxisa. Umrhumo wakho wangoku uyaqhubeka, kodwa usebenzisa ikhadi elitsha.",
              "1. Ngena kwi-gadit.app uze uvule \"Iakhawunti\" kwimenyu yeakhawunti. 2. Cofa \"Lawula iintlawulo\". 3. Kuvuleka iphepha le-Stripe elikhuselekileyo. Yongeza ikhadi elitsha njengendlela yokuhlawula uze ulibeke njengolungagqibekanga. 4. Ukuba uyafuna, susa ikhadi elidala.",
              "Ukususela kumjikelo olandelayo wokuhlawula, yonke into iya kwikhadi elitsha. Intlawulo yangaphambili, esele iqokelelwe, ihlala kwikhadi elidala. Akufuneki mbuyekezo ngaphandle kokuba uyifuna ngokuthe ngqo.",
            ],
          },
          {
            id: "cancel",
            q: "Ndiwurhoxisa njani umrhumo wam?",
            a: [
              "Uzenzela ngokwakho, nanini na. Ngena, uvule iAkhawunti, uze ucofe ukurhoxisa umrhumo phantsi kwesicwangciso sakho.",
              "Uthenge umrhumo wakho kwi-app ye-iPhone okanye ye-iPad? Wurhoxise kwiisetingi zomrhumo ze-Apple. Ilinki ethi \"Lawula umrhumo\" kwiphepha lakho leAkhawunti ikusa apho.",
              "Kumrhumo ohlawulelwayo, ukufikelela kwakho kuyaqhubeka de kuphele ixesha osele ulihlawulele. Emva koko iakhawunti iya kwi-Basic, simahla. Amagama akho agciniweyo nembali yakho zihlala zikhuselekile.",
              "Ngexesha lovavanyo lwasimahla lweentsuku ezili-14, ukurhoxisa kuphelisa uvavanyo ngoko nangoko kwaye akukho nto ihlawuliswayo. Ukuba ukhathazwa kuphela yintlawulo ezenzekelayo, khetha eso sizathu kwifestile yokurhoxisa, uze ucime ukuhlaziywa endaweni yoko, ugcine uvavanyo de kube lusuku lwalo lokugqibela.",
              "Ukuba urhoxisa umrhumo ohlawulelwayo ngempazamo okanye utshintsha ingqondo, ungawuqalisa kwakhona kwakwelo phepha ngaphambi kokuba ixesha liphele.",
            ],
          },
          {
            id: "switch-plan",
            q: "Nditshintsha njani phakathi kwe-Individual ne-Family?",
            a: [
              "Ukuze utshintshele kwi-Family, vula iphepha leAkhawunti yakho uze ucofe \"Tshintshela kwi-Family\". Umrhumo wakho wangoku uhlaziywa kwikhadi elifanayo, ngaphandle kokuphinda ulifake.",
              "I-Stripe ibala umahluko ngeentsuku ezisele kwixesha langoku, ngoko uhlawula umahluko kuphela. Ukuze utshintshe ukusuka kwi-Family ukuya kwi-Individual, sibhalele kweli phepha kwaye iqela liza kukutshintshela.",
            ],
          },
          {
            id: "invoice",
            q: "Ndiyikhuphela njani i-invoyisi okanye irisithi?",
            a: [
              "IAkhawunti, emva koko Lawula iintlawulo, emva koko Invoice history. Yonke intlawulo inerisithi ye-PDF onokuyikhuphela eneenkcukacha zokuhlawula ozigcinileyo.",
              "Ukuba ufuna igama elahlukileyo, idilesi okanye inombolo yerhafu kwi-invoyisi (umzekelo igama lenkampani ngenjongo zerhafu), hlaziya iinkcukacha zakho zokuhlawula kwakwiphepha elo ngaphambi kokukhuphela. Irisithi elandelayo iza kusebenzisa iinkcukacha ezintsha.",
            ],
          },
          {
            id: "portal-error",
            q: "Ndicofe Lawula iintlawulo kodwa ndafumana impazamo. Ndenze ntoni ngoku?",
            a: [
              "Kukho izizathu ezibini eziqhelekileyo. Okokuqala, iakhawunti yakho ayinawo umrhumo we-Stripe osebenzayo. Okwesibini, i-Stripe isenokuba ayikabi neprofayile epheleleyo yokuhlawula yeakhawunti yakho.",
              "Into elula yokuqala ukuyijonga: phuma, ungene kwakhona nge-imeyile oyisebenzise xa ubuhlawula, uze uzame kwakhona. Ukuba isasilela, qhagamshelana nathi nge-imeyile yeakhawunti yakho kwaye iqela liza kuyilungisa kwicala lethu ngomzuzu.",
            ],
          },
          {
            id: "autorenew",
            q: "Ingaba umrhumo wam uza kuzihlaziya ngokwawo?",
            a: [
              "Ewe. Izicwangciso zenyanga zihlaziywa inyanga nganye, izicwangciso zonyaka zihlaziywa unyaka ngamnye ngomhla ofanayo. Ungawubona umhla olandelayo wokuhlawula kwiakhawunti yakho nakwiphothali ye-Stripe.",
              "Ukuba awufuni kuhlaziywa ngokuzenzekelayo, rhoxisa nanini na ngaphambi komhla wokuhlaziya. Ukurhoxisa akwenzeki ngoko nangoko. Ugcina ukufikelela kulo lonke ixesha osele ulihlawulele.",
            ],
          },
          {
            id: "refund",
            q: "Ndingayifumana imali yam ibuyiswe?",
            a: [
              "Ewe. Ukuba uthenge kwiintsuku ezingaphantsi kwe-14 ezidlulileyo kwaye inkonzo ayikasetyenziswa kakhulu, sibhalele nge-imeyile yeakhawunti yakho kunye nenqaku elifutshane elichaza isizathu. Ezo mbuyekezo zivunywa ngaphandle kwengxabano.",
              "Ukuba sele kudlule iintsuku ezingaphezu kwe-14, iqela liyiphatha ngokwemeko nganye. Rhoxisa umrhumo ukuze ungaqhubeki uzihlaziya, uze usithumelele i-imeyile.",
            ],
          },
          {
            id: "unknown-charge",
            q: "Yintoni le ntlawulo ikwikhadi lam?",
            a: [
              "Iintlawulo zivela njenge-GADIT okanye i-GADIT.APP. Imali ihambelana nesicwangciso sakho (Individual okanye Family, ngenyanga okanye ngonyaka) ngemali yelizwe lakho, njengoko kubonisiwe kwiphepha lamaxabiso. Imirhumo eqale ngaphambi kuka-Okthobha 2026 igcina ixabiso eyaqala ngalo. Ukuba imali ayihambelani, isenokuba ivela kwenye inkonzo.",
              "Ukuba uqinisekile ukuba asiyiyo eyakho, musa ukuyiphikisa ngebhanki yakho okwangoku. Qala usibhalele ngqo ngomhla nemali. Iqela liza kuyifumana, likuchazele ukuba yintoni, kwaye libuyise imali ukuba kuyimfuneko. Ukuphikisa ngebhanki kunokwenza iintlawulo ezizayo zibe nzima, ngoko ukuyisombulula ngenkxaso kudla ngokukhawuleza nokukhuseleka ngakumbi.",
            ],
          },
          {
            id: "failed-payment",
            q: "Intlawulo yam ayiphumelelanga. Ndenze ntoni?",
            a: [
              "I-Stripe izama ngokuzenzekelayo kwakhona iintlawulo ezingaphumelelanga izihlandlo ezimbalwa kwiintsuku ezilandelayo. Uninzi lweengxaki luzisombulula ngokwalo xa ibhanki ikhulula imali ebibanjiwe okanye ikhadi sele linemali eyaneleyo.",
              "Ibha ephezulu ephepheni iya kuthi intlawulo ayiphumelelanga, kwaye ukufikelela kwakho kugcinwa ezinye iintsuku ezimbalwa. Cofa \"Hlaziya ikhadi\" apho, ufake ikhadi elisebenzayo, size sizame intlawulo kulo ngoko nangoko. Ukuba umrhumo wakho sele ubuyele kwi-Basic, ungabhalisa kwakhona kwiphepha lamaXabiso kwaye incwadi yakho ihlala injalo.",
            ],
          },
          {
            id: "plan-comparison",
            q: "Yintoni umahluko phakathi kwe-Basic, Individual ne-Family?",
            a: [
              "I-Basic (simahla): ukuya kutsho kukhangelo lwamagama oluli-10 ngosuku, zonke iintsingiselo, imizekelo, izaci, imvelaphi yegama, intsingiselo efanelekileyo ngokwesivakalisi, neNcwadi yamagama enamagama ukuya kutsho kuma-30.",
              "Individual: umntu omnye, zonke izixhobo zokufunda. Ukukhangela okungenamda, umfanekiso kwintsingiselo nganye, imizekelo emininzi nemibuzo ngegama ngalinye, Yakha isivakalisi ufumane ingxelo, Lonke igama, Yithethe, ilizwi lendalo lokufunda ngokuvakalayo nokukhangela ngelizwi, ukusetyenziswa ngaphandle kwe-intanethi, imidlalo, iikhwizi namadabi amagama, nokuziqhelanisa okukrelekrele nokulungiselela uvavanyo nedikteshini.",
              "Family: yonke into ekwi-Individual ukuya kutsho kubantwana aba-5 nabazali, kunye neMo yabantwana, indawo eyeyomntwana ngamnye, uncedo ngomsebenzi wasekhaya, nebhodi yomzali nesaziso kwigama ngalinye. Izikolo zinesicwangciso sazo. Amaxabiso elizwe lakho novavanyo lwasimahla lweentsuku ezili-14 akwiphepha lamaxabiso.",
            ],
          },
        ],
      },
      {
        id: "account",
        icon: "👤",
        title: "Iakhawunti nokungena",
        items: [
          {
            id: "no-verification-email",
            q: "Andiyifumananga i-imeyile yokuqinisekisa",
            a: [
              "Qala ujonge kwiifolda ze-spam nezentengiso. I-Gmail ne-Outlook ngamanye amaxesha zithumela ii-imeyile zeakhawunti apho de uphawule enye njenge-\"Not spam\".",
              "Ukuba ayikho apho, i-imeyile isenokuba ichwethezwe ngempazamo xa ububhalisa. Zama ukubhalisa kwakhona uze uphinde ujonge idilesi. Ukuba ubhalise nge-Google, akufuneki imeyile yokuqinisekisa.",
            ],
          },
          {
            id: "forgot-password",
            q: "Ndiyilibele iphasiwedi yam",
            a: [
              "Kwifestile yokungena, chwetheza i-imeyile yakho, uze ucofe \"Uyilibele iphasiwedi?\". Ilinki yokuseta kwakhona idla ngokufika kwi-inbox yakho kwisithuba somzuzu okanye emibini. Unokucinezela no \"Ndithumelele ilinki yokungena nge-imeyile\" uze ungene ngaphandle kwephasiwedi.",
              "Ukuba i-imeyile ayifiki, jonga kwi-spam. Ukuba ayikafiki, usenokuba ubhalise nge-Google endaweni ye-imeyile nephasiwedi. Zama iqhosha elithi \"Qhubeka nge-Google\".",
            ],
          },
          {
            id: "wrong-credentials",
            q: "Iphasiwedi yam ichanekile, kodwa ithi i-imeyile nephasiwedi azingqinelani",
            a: [
              "Zintathu izinto onokuzijonga. Okokuqala, i-Caps Lock. Okwesibini, isithuba esongezelekileyo ekugqibeleni emva kokukopa nokuncamathisela. Okwesithathu, usenokuba ubhalise nge-Google kungekhona ngephasiwedi, sebenzisa \"Qhubeka nge-Google\" endaweni yoko.",
              "Usabambekile? Kwakuloo myalezo, cofa \"Ndithumelele ilinki yokungena nge-imeyile\" ukuze ungene ngaphandle kwephasiwedi, okanye \"Khetha iphasiwedi entsha\".",
            ],
          },
          {
            id: "google-fails",
            q: "Ukungena nge-Google akusebenzi",
            a: [
              "Ngaphakathi kwii-app ezifana no Instagram, Facebook okanye TikTok, iqhosha lika-Google liyafihlwa. Vula ilinki kwibhrawuza yakho yesiqhelo, okanye ungene nge-imeyile yakho. Ukuba ubhalise nge-Google, chwetheza loo imeyile uze ucofe \"Ndithumelele ilinki yokungena nge-imeyile\".",
              "Kwifestile yabucala, ii-cookie ezivaliweyo zinokumisa ukungena nge-Google, ngoko zama ifestile eqhelekileyo.",
            ],
          },
          {
            id: "change-email",
            q: "Ndiyitshintsha njani i-imeyile kwiakhawunti yam?",
            a: [
              "Ukutshintsha i-imeyile yeakhawunti yakho kwenziwa liqela. Sithumelele i-imeyile isuka kwidilesi yakho yangoku uze ubhale idilesi entsha kumyalezo. Iqela liza kuyihlaziya, kwaye umrhumo wakho, imbali nencwadi yakho zihlala zinjalo.",
            ],
          },
          {
            id: "delete-account",
            q: "Ndiyicima njani iakhawunti yam?",
            a: [
              "Ezantsi kwephepha elithi \"Iakhawunti\", cofa \"Cima iakhawunti\" uze uchwetheze i-imeyile yeakhawunti yakho ukuqinisekisa. Oku kungunaphakade. Umrhumo wakho uyarhoxiswa, incwadi nembali yakho ziyacinywa, kwaye i-imeyile iyakhululeka ukuze ubhalise ngokutsha.",
              "Okukodwa kuphela ngumrhumo othengwe kwi-App Store. Ukucima iakhawunti akuwurhoxisi, ngoko kuqala wurhoxise kuseto lomrhumo lwe-Apple.",
              "Iirekhodi zeentlawulo ezidlulileyo zihlala zikhona, kuba umthetho usifuna ukuba sizigcine ngenxa yobalo-mali.",
            ],
          },
          {
            id: "share-account",
            q: "Ingaba iqabane lam okanye umntwana wam angabelana ngeakhawunti yam?",
            a: [
              "Kwiakhawunti nganye kungena umntu omnye ngexesha. Kusapho, isicwangciso se-Family senzelwe oku: ukuya kutsho kubantwana aba-5 nabazali, ngamnye enendawo yakhe, incwadi yakhe nenkqubela yakhe, kunye neMo yabantwana yabantwana nebhodi yomzali.",
              "Kumntu omdala omnye, i-Individual yenzelwe umntu omnye kwaye inazo zonke izixhobo zokufunda. Thelekisa izicwangciso namaxabiso elizwe lakho kwiphepha lamaxabiso.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "Ndicinga ukuba ndineeakhawunti ezimbini ngempazamo. Ndenze ntoni ngoku?",
            a: [
              "Oku kudla ngokwenzeka xa umntu ebhalisa kanye nge-Google aze aphinde abhalise nge-imeyile nephasiwedi esebenzisa idilesi enye, okanye xa ubhalisa kabini ngeedilesi ze-imeyile ezahlukeneyo. Ukubhalisa ngakunye kwenza iakhawunti ye-Gadit eyahlukileyo eneyayo incwadi, imbali nemeko yomrhumo.",
              "Sithumelele i-imeyile usuka kwenye yezo dilesi zimbini, uze ubhale nenye idilesi kunye nokuba yeyiphi iakhawunti ofuna ukuyigcina. Iqela liza kudibanisa iincwadi nembali kwiakhawunti oyikhethayo, emva koko livale enye ngokucocekileyo. Akukho nkcukacha zilahlekileyo.",
            ],
          },
        ],
      },
      {
        id: "product",
        icon: "🔍",
        title: "Ukusebenzisa i-Gadit",
        items: [
          {
            id: "wrong-definition",
            q: "Ndicinga ukuba inkcazelo ayichanekanga. Ndenze ntoni?",
            a: [
              "Ecaleni kwentsingiselo nganye, nakumakhadi ezaci nawemvelaphi yegama, kukho uphawu oluncinci lweflegi. Licofe, ukhethe into engalunganga, uze wongeze inqaku elifutshane ukuba uyafuna. Lifika ngqo kwiqela, kwaye yonke ingxelo iyajongwa.",
              "Musa ukukhathazeka ngokuba ngqongqo kakhulu. Isichazi-magama siphucuka ngokukhawuleza ngale ngxelo kunayo nantoni na enye.",
            ],
          },
          {
            id: "kids-not-working",
            q: "Imo yabantwana ayiyitshintshi inkcazelo",
            a: [
              "Imo yabantwana itshintsha isicatshulwa kuphela apho igama sele linenkcazelo elungele abantwana. Kwigama osandula ukulikhangela okokuqala, linda imizuzwana eli-10 ukuya kweli-15 ngelixa kulungiswa inguqulelo yabantwana.",
              "Imo yabantwana iyinxalenye yesicwangciso se-Family. Kwi-Individual uza kubona iswitshi ethi \"Ngamagama alula\" endaweni yayo, enika inkcazelo elula ngakumbi yentsingiselo nganye. Kwi-Basic okanye ngaphandle kweakhawunti akukho switshi. Ababhalise kwi-Clear okanye kwi-Deep ngaphambi kuka-Okthobha 2026 bayaqhubeka nokuba neMo yabantwana. Ukuze uyifumane, jonga i-Family kwiphepha lamaxabiso.",
            ],
          },
          {
            id: "voice-fails",
            q: "Ukukhangela ngelizwi akusebenzi",
            a: [
              "Ukukhangela ngelizwi kufuna imvume yemayikrofoni. Uninzi lweebhrawuza zibuza kanye kwisiza ngasinye. Ukuba uyivalile ngempazamo, cofa umqondiso osecaleni kwe-gadit.app kwibha yedilesi uze uvumele imayikrofoni kwiimvume zesiza.",
              "Kwi-iPhone nakwi-iPad, kufuneka uvumele imayikrofoni ne-Safari kwi-app ye-Settings yesixhobo. Ukukhangela ngelizwi yinxalenye yezicwangciso ze-Individual ne-Family, ngoko kwi-Basic nangaphandle kweakhawunti iqhosha lemayikrofoni aliveli. Ukuze unyusele, vula iphepha lamaxabiso.",
            ],
          },
          {
            id: "no-image",
            q: "Andikwazi ukufumana umfanekiso wegama",
            a: [
              "Imifanekiso yinxalenye yezicwangciso ze-Individual ne-Family, ngemifanekiso emitsha ukuya kutsho kwi-100 ngenyanga. Umfanekiso osele ukhona wale ntsingiselo uyavuleka ngaphandle kokubalwa. Isicwangciso esidala se-Clear sine-30 ngenyanga, kwaye i-Basic ayinayo imifanekiso. Xa imifanekiso yenyanga iphelile uza kubona isaziso, kwaye ukubala kuqala ngokutsha ekuqaleni kwenyanga nganye.",
              "Ukuba ungaphantsi kwesabelo kwaye usabona ukusilela, kudla ngokuba yingxaki yethutyana. Zama kwakhona emva kwemizuzwana engama-30. Ukusilela okuqhubekayo yimpazamo kwinkqubo. Nceda uyixele kwiphepha legama.",
            ],
          },
          {
            id: "save-word",
            q: "Ndiligcina njani igama kwincwadi yam?",
            a: [
              "Akufuneki. Xa ungene, lonke igama olikhangelayo ligcinwa kwincwadi yakho ngokwalo. Kwi-Basic incwadi ithatha amagama ukuya kutsho kuma-30. Kwi-Individual nakwi-Family ayinamda kwaye inokuziqhelanisa okukrelekrele, okubuyisa amagama akho ukuze uwaphinde ngexesha elifanelekileyo.",
              "Kwi-Individual nakwi-Family, amagama owakhangelayo akwagcinwa kwisixhobo sakho, ngoko ayavuleka ngaphandle kwe-intanethi. Ukuze ubone amagama akho, vula incwadi kwimenyu.",
            ],
          },
          {
            id: "offline",
            q: "Ndiyisebenzisa njani i-Gadit ngaphandle kwe-intanethi?",
            a: [
              "Ukusetyenziswa ngaphandle kwe-intanethi yinxalenye yezicwangciso ze-Individual ne-Family. Lonke igama olikhangelayo ligcinwa kwisixhobo sakho, ngoko liyavuleka kwakhona ngoko nangoko ngaphandle kwe-intanethi. Ungacofa no-\"Khuphela ipakethe yokufunda ungekho kwi-intanethi\" kwiphepha lakho le-\"Iakhawunti\" ukuze ugcine amagama esichazi-magama sethu kulwimi lwakho kwesi sixhobo.",
              "Ukukhangela igama elitsha ngokupheleleyo kusafuna unxibelelwano, kuba Gadit kufuneka ilungiselele isiphumo esipheleleyo salo. Ikopi engekho kwi-intanethi iquka amagama asele ekwisixhobo sakho. Ukuba ukwi-Basic, jonga izicwangciso kwiphepha lamaxabiso.",
            ],
          },
          {
            id: "slow",
            q: "Iapp ibonakala icotha",
            a: [
              "Ukhangelo lokuqala lwegama lolona lucothayo kuba i-Gadit yenza isiphumo esipheleleyo ukusukela ekuqaleni: kudla ngokuba yimizuzwana embalwa, ngamanye amaxesha ixesha elide kumagama antsonkothileyo. Ukhangelo olulandelayo lwegama elo lukhawuleza kakhulu, luvela kwi-cache.",
              "Ukuba yonke into ibonakala icotha, zama ukuhlaziya ngokupheleleyo: Cmd+Shift+R kwi-Mac, Ctrl+Shift+R kwi-Windows. Ukuba ukucotha kuqhubeka kuwo onke amaphepha, nceda usithumelele i-imeyile ngelizwe lakho nebhrawuza yakho ukuze iqela lijonge indlela yenethiwekhi ukusuka kummandla wakho ukuya kwiiseva zethu.",
            ],
          },
          {
            id: "word-not-found",
            q: "Ndikhangele igama kodwa andafumana siphumo. Kwenzeka ntoni?",
            a: [
              "Okokuqala, jonga upelo. Ukuba bekukho impazamo yokuchwetheza, Gadit idla ngokubonisa igama elilungisiweyo, kunye nelinki yokukhangela le uyichwethezileyo nokuba kunjalo.",
              "Amagama anqabileyo kakhulu okanye awesitsotsi awasoloko efumana isiphumo. Ukuba uqinisekile ukuba igama likhona, sibhalele usuka kweli phepha, iqela liza kujonga.",
            ],
          },
          {
            id: "change-language",
            q: "Ndilutshintsha njani ulwimi lojongano?",
            a: [
              "Phezulu ephepheni kukho umqondiso weglowubhu onolwimi lwakho lwangoku. Wucofe uze ukhethe ulwimi.",
              "Ukhetho lwakho lugcinwa kwesi sixhobo. Yonke into iphinda ilayishe ngolwimi olutsha: ujongano, iimenyu, iintsingiselo zamagama oza kuwakhangela emva koko, imizekelo, iinkcazelo zabantwana, nkqu nemvelaphi yegama. Amagama osele uwakhangele ngolwimi oludala aya kuhlala eboniswa ngalo de uwakhangele kwakhona.",
            ],
          },
        ],
      },
      {
        id: "partner",
        icon: "🤝",
        title: "Inkqubo yamaqabane",
        items: [
          {
            id: "join-partner",
            q: "Ndiba njani liqabane le-Gadit?",
            a: [
              "Yiya ku-gadit.app/partners uze ucofe u-\"Joyina simahla\". Faka igama lakho ne-imeyile, uze ucofe u-\"Ndinike ikhowudi yam yeqabane\". Ilinki yakho yobuqu nebhodi yeqabane, enokulandelela ukucofa neekhomishini, zilunga kwangoko, akukho kulinda kuvunywa. Ikhowudi nelinki zithunyelwa nange-imeyile.",
              "Ukujoyina kusimahla kwaye kuvulelekile kuwo wonke umntu. Akufuneki ube nomrhumo we-Gadit ukuze ube liqabane.",
            ],
          },
          {
            id: "commission-model",
            q: "Zibalwa njani iikhomishini?",
            a: [
              "Imiqathango eqhelekileyo yi-25% yayo yonke intlawulo eyenziwa ngumthengi kunyaka wakhe wokuqala. Emva kwaloo nyaka wokuqala, ufumana i-10% yayo yonke intlawulo lo gama nje umthengi eqhubeka ehlawula. Ukuba uzisa abathengi abahlawulayo aba-5, isabelo sakho emva konyaka wokuqala sinyuka siye kwi-15% ubomi bonke.",
              "Oku kusebenza ngendlela efanayo kwizicwangciso zenyanga nezonyaka, kuba ikhomishini ibalwa kwintlawulo nganye yokwenyani. Ukuba umthengi uyarhoxisa, ikhomishini yakho iyayeka kwintlawulo yakhe yokugqibela.",
              "Iqela lingamisela amazinga ahlukeneyo kumaqabane athile. Amazinga akho asoloko ebonakala kwibhodi yakho yeqabane.",
            ],
          },
          {
            id: "payout",
            q: "Ndihlawulwa nini?",
            a: [
              "Kanye ngenyanga, xa ibhalansi yakho ifikelela kweyona mali incinci iboniswe kwibhodi yakho yeqabane. Siyithumela kwiakhawunti ye-PayPal oyimisele apho. Le mali incinci ngumda osezantsi, ayingomda ophezulu. Ungafumana ngaphezulu kakhulu, kwaye ufumana intlawulo xa sele uwugqithile loo mda.",
              "Iikhomishini zikhutshwa kwiintsuku ezingama-30 emva kwentlawulo yomrhumo, ukuze kubekho ixesha lembuyekezo. Ngoko umrhumo kaJanuwari ukhutshwa ekuqaleni kukaFebruwari, uze ungene kwintlawulo yakho elandelayo xa ibhalansi yakho ifikelela kweyona mali incinci.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "Ndijoyinile kodwa ibhodi yam ayinanto",
            a: [
              "Amanani abonakala emva kokucofa kokuqala kwilinki yakho. Ukungabi nanto kuthetha nje ukuba akukabikho mntu uyicofileyo. Hamba wabelane ngelinki. Ibhodi ihlaziywa phantse ngexesha lokwenyani xa umsebenzi uqala.",
              "Ukuba wabelene kwaye umntu ubhalisile kodwa ibhodi ayikubonisi oko, sibhalele ngexesha eliqikelelweyo lokubhalisa kwaye iqela liza kujonga ukuba ubhaliso luvela phi.",
            ],
          },
          {
            id: "attribution-window",
            q: "Ilinki yam yokucebisa iyamlandela umtyeleli ixesha elingakanani?",
            a: [
              "Iintsuku ezingamashumi amathandathu. Xa umtyeleli ecofa ilinki yakho, sibeka i-cookie ekuchonga njengomcebisi. Ukuba bayabhalisa kwaye bahlawule umrhumo nanini na kwiintsuku ezingama-60 ezilandelayo (nokuba bayasishiya isiza baze babuye kamva ngokukhangela kwi-Google), ukubalelwa kusaya kuwe.",
              "Ukucocwa kwee-cookie: ukuba umtyeleli ucoca ii-cookie zakhe okanye utshintsha ibhrawuza/isixhobo ngaphambi kokuba abhalise, ukubalelwa kunokulahleka. Akukho ndlela yokukuphepha oko, kodwa iintsuku ezingama-60 lixesha elide xa uthelekisa neenkqubo ezininzi zamaqabane.",
            ],
          },
          {
            id: "missing-commission",
            q: "Umntu ubhalise ngelinki yam kodwa andiyiboni ikhomishini",
            a: [
              "Amaxesha amaninzi oku kungenxa yexesha. Ubhaliso buvela kwibhodi kwimizuzu embalwa, kodwa ikhomishini ibhalwa kuphela xa umrhumo sele uhlawulwe ngokwenene, kwaye loo nto ingenzeka kwiintsuku ezimbalwa kamva ukuba bakuvavanyo lwasimahla. Phinda ujonge emva kokuba uvavanyo luphelile.",
              "Ukuba umrhumo uhlawulwe kodwa usayiboni ikhomishini emva kweeyure ezingama-48, sibhalele ngexesha eliqikelelweyo lokubhalisa kunye ne-imeyile okanye igama eliqikelelweyo lombhalisi, ukuba uyalazi. Iqela liza kujonga ukuba ubhaliso luvela phi kwaye lilungise ngesandla nantoni na ephosiweyo.",
            ],
          },
        ],
      },
      {
        id: "general",
        icon: "❓",
        title: "Ngokubanzi",
        items: [
          {
            id: "what-is-gadit",
            q: "Yintoni i-Gadit?",
            a: [
              "I-Gadit ikunceda uqonde igama ngalinye ukuya esiphelweni, hayi nje ukufumana intsingiselo yomgca omnye. Igama ngalinye livuleka nazo zonke iintsingiselo zalo, imizekelo yokwenyani kwintsingiselo nganye, izaci nemvelaphi yegama. Izicwangciso ezihlawulelwayo zongeza umfanekiso kwintsingiselo nganye, ukuziqhelanisa, imidlalo nokunye, kwaye i-Family yongeza iMo yabantwana nendawo yomntwana ngamnye.",
              "I-Gadit isebenza ngeelwimi ezingama-41. Ngaphakathi, iqela likubiza ngokuthi yenza i-GAD kwigama: ukuqonda igama ukuya esiphelweni, hayi nje ukuliguqulela. Ukuze ubone okukwisicwangciso ngasinye, vula iphepha lamaxabiso.",
            ],
          },
          {
            id: "languages",
            q: "Zeziphi iilwimi enizixhasayo?",
            a: [
              "I-Gadit isebenza ngeelwimi ezingama-41, kuquka isiNgesi, isiHebhere, isiArabhu, isiSpanish, isiFrentshi, isiJamani, isiRashiya, isiTshayina, isiJapan, isiHindi, isiZulu, isiXhosa nesiBhulu.",
              "Ungakhangela igama nangaluphi na kwezi lwimi uze ufumane iintsingiselo, imizekelo nayo yonke enye into ngolwimi olukhethele ujongano. IsiHebhere, isiArabhu nesiPersi zibhalwa ukusuka ekunene ukuya ekhohlo, ngoonobumba bazo. Ukuze utshintshe, cofa iqhosha lolwimi phezulu kulo naliphi na iphepha.",
            ],
          },
          {
            id: "kid-safety",
            q: "Ingaba i-Gadit ikhuselekile kubantwana?",
            a: [
              "Gadit yenzelwe ukuba umzali ayisebenzise ngokukhuselekileyo ecaleni komntwana. Imo yabantwana ivelisa iinkcazelo ezilula, ezicacileyo nezifanele ubudala (malunga nenqanaba leminyaka emi-5 ukuya kweli-10), isebenzisa injini efanayo eqhuba umxholo wabantu abadala enemiyalelo ecacileyo yokwenza lula. Akukho mxholo wenziwe ngabasebenzisi ukhe uboniswe abantwana.",
              "Ngokuhambelana nemigaqo-nkqubo yethu nemithetho yobucala babantwana kwihlabathi liphela, iakhawunti yakho ngokwakho ingeyabaneminyaka eli-13 nangaphezulu. Abantwana basebenzisa i-Gadit ngomzali: kwisicwangciso se-Family umzali wongeza umntwana ngamnye kwiphepha le-Family, umntwana ngamnye ufumana indawo yakhe eneMo yabantwana, kwaye ibhodi yomzali ibonisa amagama akhangelwa ngumntwana ngamnye. Ukuze uqalise, qala nge-Family kwiphepha lamaxabiso.",
            ],
          },
          {
            id: "data",
            q: "Zigcinwa phi iinkcukacha zam? Ingaba niyazithengisa?",
            a: [
              "Iakhawunti, imbali, incwadi nemifanekiso eyenziweyo zigcinwa ngokukhuselekileyo kwi-Firebase, zifihlwe ngekhowudi xa zigciniwe. Asizithengiseli mntu iinkcukacha zakho. Sabelana kuphela ngoko kufunekayo ukuqhuba i-Gadit (ukugcina, iintlawulo, ababoneleli bomxholo), njengoko kuchaziwe kuMgaqo-nkqubo wabucala.",
              "Ungayicima iakhawunti yakho nanini na kwiphepha leAkhawunti. Ukuze ufumane ikopi yencwadi yakho okanye nayiphi na enye inkcukacha esinayo, sibhalele kweli phepha.",
            ],
          },
          {
            id: "contact-direct",
            q: "Ndinifikelela njani ngqo?",
            a: [
              "Sebenzisa iqhosha le-imeyile elingezantsi kweli phepha. Liya ngqo kwibhokisi yeposi yeqela. Wonke umyalezo uyafundwa kwaye uphendulwa kwiiyure ezingama-24 ukuya kwezingama-48 (kaninzi ngokukhawuleza).",
              "I-imeyile ingcono kunencoko kwinkxaso: inika iqela ithuba lokufunda ngononophelo nokuphendula ngokucingisisa. Inkxaso ngefowuni ayikanikezelwa okwangoku.",
            ],
          },
        ],
      },
    ],
  },
  nso: {
    eyebrow: "Senthara ya Thušo",
    heading: "Hwetša karabo, ka pela",
    lede: "Dipotšišo tše di tlwaelegilego le ditharollo tša kgato ka kgato, di rulagantšwe go ya ka dihlogo. Ge o sa bone bothata bja gago, ikgokaganye le sehlopha ka fase.",
    stillNeedHelpHeading: "O sa kgomaretšwe?",
    stillNeedHelpBody: "Re ngwalele thwii. Molaetša o mongwe le o mongwe o balwa ke sehlopha gomme gantši o hwetša karabo ka gare ga letšatši goba a mabedi.",
    emailCta: "Re romele imeile",
    responseTime: "Gantši re araba: ka gare ga diiri tše 24 go ya go tše 48.",
    categories: [
      {
        id: "billing",
        icon: "💳",
        title: "Ditefo le peeletšo",
        items: [
          {
            id: "change-card",
            q: "Nka fetoša bjang karata ya sekoloto ya peeletšo ya ka?",
            a: [
              "O ka fetogela go karata ye mpsha ka nako ye nnyane go feta motsotso ntle le go khansela. Peeletšo ya gago ya bjale e tšwela pele, feela e šomiša karata ye mpsha.",
              "1. Tsena go gadit.app gomme o bule \"Akhaonto\" go tšwa go menu ya akhaonto. 2. Kgotla \"Laola ditefo\". 3. Letlakala le le šireletšegilego la Stripe le a bulega. Tsenya karata ye mpsha bjalo ka mokgwa wa tefo gomme o e swaye bjalo ka ya motheo. 4. Ge o rata, tloša karata ya kgale.",
              "Go tloga potologong ye e latelago ya tefo, tšohle di ya go karata ye mpsha. Tefo ya pele, ye e šetšego e kgobokeditšwe, e dula go karata ya kgale. Ga go nyakege pusetšo ya tšhelete ntle le ge o e nyaka ka go lebanya.",
            ],
          },
          {
            id: "cancel",
            q: "Nka khansela bjang peeletšo ya ka?",
            a: [
              "O ka e dira ka bowena, nako efe goba efe. Tsena, bula Akhaonto, gomme o kgotle Khansela peeletšo ka tlase ga leano la gago.",
              "Na o rekile peeletšo ya gago ka gare ga app ya iPhone goba iPad? E khansele ka dipeakanyo tša gago tša peeletšo tša Apple. Linki ya \"Laola peeletšo\" letlakaleng la gago la Akhaonto e go iša moo.",
              "Ge o na le peeletšo ye e lefelwago, phihlelelo ya gago e tšwela pele go fihla mafelelong a nako yeo o šetšego o e lefetše. Ka morago ga moo akhaonto e fetogela go Basic, ya mahala. Mantšu ao o a bolokilego le histori di dula di bolokegile.",
              "Nakong ya teko ya mahala ya matšatši a 14, go khansela go fediša teko gateetee gomme ga go na tefo. Ge se sego feela se go tshwenyago e le tefo ya go itiragalela, kgetha lebaka leo ka lefasetereng la go khansela gomme o ka tima go mpshafatša, wa boloka teko go fihla letšatšing la yona la mafelelo.",
              "Ge o khansela peeletšo ye e lefelwago ka phošo goba o fetola monagano, o ka e tšwetša pele gape go tšwa letlakaleng leo leo pele nako e fela.",
            ],
          },
          {
            id: "switch-plan",
            q: "Ke fetoga bjang magareng ga Individual le Family?",
            a: [
              "Go fetogela go Family, bula letlakala la gago la Akhaonto gomme o kgotle \"Fetogela go Family\". Peeletšo ya gago ya bjale e mpshafatšwa ka karata ye e swanago, ntle le go e tsenya gape.",
              "Stripe e bala phapano ya matšatši ao a šetšego a nako ya bjale, ka fao o lefa phapano fela. Go fetoga go tloga go Family go ya go Individual, re ngwalele go tšwa letlakaleng le, gomme sehlopha se tla go fetošetša.",
            ],
          },
          {
            id: "invoice",
            q: "Nka laolla bjang invoice goba rasiti?",
            a: [
              "Akhaonto, ke moka Laola ditefo, ke moka Invoice history. Tefo ye nngwe le ye nngwe e na le rasiti ya PDF ye e laollegago ye e nago le dintlha tša tefo tšeo o di bolokilego.",
              "Ge o nyaka leina, aterese goba nomoro ya motšhelo ye e fapanego go invoice (mohlala leina la khamphani bakeng sa motšhelo), mpshafatša dintlha tša gago tša tefo letlakaleng le le swanago pele o laolla. Rasiti ye e latelago e tla šomiša dintlha tše mpsha.",
            ],
          },
          {
            id: "portal-error",
            q: "Ke kgotlile Laola ditefo eupša ka hwetša phošo. Bjale?",
            a: [
              "Go na le mabaka a mabedi a tlwaelegilego. La pele, akhaonto ya gago ga e na peeletšo ya Stripe ye e šomago. La bobedi, Stripe e ka ba e se na profaele ye e feletšego ya ditefo ya akhaonto ya gago.",
              "Tekolo ya mathomo ye bonolo: tšwa, o tsene gape ka imeile ye o e šomišitšego ge o be o lefa, o leke gape. Ge e sa palelwa, ikgokaganye le rena ka imeile ya akhaonto ya gago gomme sehlopha se tla e lokiša ka lehlakoreng la rena ka motsotso.",
            ],
          },
          {
            id: "autorenew",
            q: "Na peeletšo ya ka e tla mpshafala ka bowona?",
            a: [
              "Ee. Maano a kgwedi a mpshafala kgwedi ye nngwe le ye nngwe, maano a ngwaga a mpshafala ngwaga o mongwe le o mongwe ka letšatši le le swanago. O ka bona letšatši la tefo ye e latelago akhaontong ya gago le phothaleng ya Stripe.",
              "Ge o sa nyake go mpshafatšwa ka bowona, khansela nako efe goba efe pele ga letšatši la mpshafatšo. Go khansela ga go direge gateetee. O dula o na le phihlelelo go fihla mafelelong a nako yeo o šetšego o e lefetše.",
            ],
          },
          {
            id: "refund",
            q: "Na nka bušetšwa tšhelete?",
            a: [
              "Ee. Ge theko e dirilwe ka gare ga matšatši a 14 gomme tirelo e sa šomišwa kudu, re ngwalele ka imeile ya akhaonto ya gago le lengwalwana le lekopana la gore ke ka lebaka la eng. Dipušetšo tšeo di dumelelwa ntle le kgang.",
              "Ge e le go feta matšatši a 14, sehlopha se e lekola ka nngwe ka nngwe. Khansela peeletšo gore e se tšwele pele e mpshafala, gomme o re romele imeile.",
            ],
          },
          {
            id: "unknown-charge",
            q: "Tefo ye ka karateng ya ka ke eng?",
            a: [
              "Ditefo di tšwelela bjalo ka GADIT goba GADIT.APP. Tšhelete e swana le leano la gago (Individual goba Family, ka kgwedi goba ka ngwaga) ka tšhelete ya naga ya gago, bjalo ka ge go bontšhwa letlakaleng la ditheko. Dipeeletšo tšeo di thomilego pele ga October 2026 di boloka theko ye di thomilego ka yona. Ge tšhelete e sa swane, e ka ba e tšwa tirelong ye nngwe.",
              "Ge o kgonthišegile gore ga se ya gago, o se ke wa ganetša ka panka ya gago gabjale. Re ngwalele thwii pele ka letšatši le tšhelete. Sehlopha se tla e hwetša, sa hlaloša gore ke eng, gomme sa bušetša tšhelete ge go nyakega. Kganetšo ya panka e ka dira gore ditefo tša ka moso di be thata, ka fao go e rarolla ka thušo gantši go a akgofa e bile go bolokegile.",
            ],
          },
          {
            id: "failed-payment",
            q: "Tefo ya ka e paletšwe. Ke dire eng?",
            a: [
              "Stripe e leka gape ka boyona ditefo tše di paletšwego ga mmalwa matšatšing a a latelago. Bontši bja diphošo bo a itokiša ge panka e lokolla go swara tšhelete goba ge karata e boela go ba le tšhelete ye e lekanego.",
              "Bareng ya godimo ga letlakala go tla tšwelela molaetša wa gore tefo ga se ya feta, gomme phihlelelo ya gago e tla bolokwa matšatši a se makae gape. Kgotla \"Mpshafatša karata\" moo, tsenya karata ye e šomago, gomme re tla leka tefo ka yona gateetee. Ge peeletšo ya gago e šetše e boetše go Basic, o ka ingwadiša gape go tšwa letlakaleng la Ditheko gomme puku ya gago ya mantšu e dula e sa senyega.",
            ],
          },
          {
            id: "plan-comparison",
            q: "Phapano magareng ga Basic, Individual le Family ke eng?",
            a: [
              "Basic (mahala): go fihla go dinyakišišo tša mantšu tše 10 ka letšatši, ditlhalošo ka moka, mehlala, dika, mothopo wa lentšu, tlhalošo ye e nepagetšego go ya ka lefoko, le puku ya mantšu ya go fihla go mantšu a 30.",
              "Individual: motho o tee, didirišwa ka moka tša go ithuta. Dinyakišišo tše di sa lekanyetšwego, seswantšho sa tlhalošo ye nngwe le ye nngwe, mehlala ye mentši le dipotšišo ka lentšu le lengwe le le lengwe, Bopa lefoko o hwetše dikarabelo, Lentšu le Lengwe le le Lengwe, E bolele, lentšu la tlhago la go balela godimo le go nyaka ka lentšu, tšhomišo ntle le inthanete, dipapadi, di-quiz le dintwa tša mantšu, le boitlwaetšo bja bohlale ka go itokišetša teko le diktesene.",
              "Family: tšohle tša ka go Individual bakeng sa bana ba go fihla go ba 5 le batswadi, gotee le Mokgwa wa bana, sebaka sa gagwe sa ngwana yo mongwe le yo mongwe, thušo ka mošomo wa gae, le letlakala la taolo la motswadi le temošo ya lentšu le lengwe le le lengwe. Dikolo di na le leano la tšona. Ditheko tša naga ya gago le teko ya mahala ya matšatši a 14 di mo letlakaleng la ditheko.",
            ],
          },
        ],
      },
      {
        id: "account",
        icon: "👤",
        title: "Akhaonto le go tsena",
        items: [
          {
            id: "no-verification-email",
            q: "Ga ke a hwetša imeile ya ka ya go kgonthiša",
            a: [
              "Lekola pele difoltara tša spam le tša dipapatšo. Ka nako ye nngwe Gmail le Outlook di romela diimeile tša akhaonto moo go fihlela o swaya e nngwe bjalo ka \"Not spam\".",
              "Ge e se gona, imeile e ka ba e ngwadilwe ka phošo ge o ingwadiša. Leka go ingwadiša gape gomme o lekole aterese gabotse. Ge o ingwadišitše ka Google, ga go nyakege imeile ya go kgonthiša.",
            ],
          },
          {
            id: "forgot-password",
            q: "Ke lebetše phasewete ya ka",
            a: [
              "Ka lefasetereng la go tsena, thaepe imeile ya gago, gomme o kgotle \"O lebetše phasewete?\". Linki ya go beakanya phasewete leswa gantši e fihla ka inbox ya gago ka motsotso o tee goba ye mebedi. O ka kgotla le \"Nthomele linki ya go tsena ka imeile\" gomme wa tsena ntle le phasewete.",
              "Ge imeile e sa fihle, lekola spam. Ge e sa fihle le gona, o ka ba o ingwadišitše ka Google go e na le imeile le phasewete. Leka konopo ya \"Tšwela pele ka Google\".",
            ],
          },
          {
            id: "wrong-credentials",
            q: "Phasewete ya ka e nepagetše, eupša e re imeile le phasewete ga di swane",
            a: [
              "Go na le dilo tše tharo tša go lekola. Sa pele, Caps Lock. Sa bobedi, sekgoba se sengwe mafelelong ka morago ga go kopiša le go kgomaretša. Sa boraro, mohlomongwe o ingwadišitše ka Google go e na le phasewete, ka gona šomiša \"Tšwela pele ka Google\".",
              "O sa kgomaretšwe? Molaetšeng wo mongwe woo, kgotla \"Nthomele linki ya go tsena ka imeile\" gore o tsene ntle le phasewete, goba \"Kgetha phasewete ye mpsha\".",
            ],
          },
          {
            id: "google-fails",
            q: "Go tsena ka Google ga go šome",
            a: [
              "Ka gare ga di-app tša go swana le Instagram, Facebook goba TikTok, konopo ya Google e a utelwa. Bula linki ka sefetleki sa gago sa tlwaelo, goba o tsene ka imeile ya gago. Ge e ba o tsene pele ka Google, thaepe imeile yeo gomme o kgotle \"Nthomele linki ya go tsena ka imeile\".",
              "Ka lefasetereng la sephiri, blocked cookies di ka emiša go tsena ka Google, ka fao leka lefasetere la tlwaelo.",
            ],
          },
          {
            id: "change-email",
            q: "Nka fetoša bjang imeile ya akhaonto ya ka?",
            a: [
              "Go fetoša imeile ya akhaonto ya gago go dirwa ke sehlopha. Re romele imeile go tšwa atereseng ya gago ya bjale gomme o ngwale aterese ye mpsha molaetšeng. Sehlopha se tla e mpshafatša, gomme peeletšo ya gago, histori le puku ya mantšu di tla dula di le ka moo di lego ka gona.",
            ],
          },
          {
            id: "delete-account",
            q: "Nka phumola bjang akhaonto ya ka?",
            a: [
              "Ka fase ga letlakala la \"Akhaonto\", kgotla \"Phumola akhaonto\" gomme o thaepe imeile ya akhaonto ya gago go netefatša. Se ke sa ruri, peeletšo ya gago e a khanselwa, puku ya gago ya mantšu le histori di a phumolwa, gomme imeile e lokologela go ingwadiša lefsa.",
              "Go na le taba e tee fela ya go fapana, ge e le peeletšo ye e rekilwego ka App Store, go phumola akhaonto ga go e khansela, ka fao e khansele pele ka dipeakanyo tša gago tša peeletšo tša Apple.",
              "Direkoto tša ditefišo tša kgale di a dula, ka gobane molao o re nyaka gore re di boloke bakeng sa dipalo tša ditšhelete.",
            ],
          },
          {
            id: "share-account",
            q: "Na molekane wa ka goba ngwana wa ka a ka abelana akhaonto ya ka?",
            a: [
              "Akhaonto ye nngwe le ye nngwe e na le motho o tee yo a tsenego ka nako. Bakeng sa lapa, leano la Family le dirilwe se: go fihla go bana ba 5 le batswadi, yo mongwe le yo mongwe a na le sebaka sa gagwe, puku ya gagwe ya mantšu le tšwelopele ya gagwe, gotee le Mokgwa wa bana bakeng sa bana le letlakala la taolo la motswadi.",
              "Bakeng sa motho o tee yo mogolo a le noši, Individual e šomela motho o tee ka didirišwa ka moka tša go ithuta. Bapetša maano le ditheko tša naga ya gago letlakaleng la ditheko.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "Ke nagana gore ke na le diakhaonto tše pedi ka phošo. Bjale?",
            a: [
              "Se gantši se direga ge motho a ingwadiša gatee ka Google gomme gape a ingwadiša ka imeile le phasewete a diriša aterese ye e swanago, goba ge o ingwadiša gabedi ka diaterese tša imeile tše di fapanego. Go ingwadiša mo gongwe le mo gongwe go dira akhaonto ye e arogilego ya Gadit ye e nago le puku ya yona ya mantšu, histori le boemo bja peeletšo.",
              "Re romelele imeile go tšwa go ye nngwe ya diaterese tše pedi, gomme o ngwale aterese ye nngwe le gore o nyaka go boloka akhaonto efe. Sehlopha se tla kopanya dipuku tša mantšu le histori akhaontong ye o e kgethago, ke moka sa tswalela ye nngwe gabotse. Ga go na tshedimošo ye e lahlegago.",
            ],
          },
        ],
      },
      {
        id: "product",
        icon: "🔍",
        title: "Go šomiša Gadit",
        items: [
          {
            id: "wrong-definition",
            q: "Ke nagana gore tlhalošo e fošagetše. Ke dire eng?",
            a: [
              "Kgauswi le tlhalošo ye nngwe le ye nngwe, le godimo ga dikarata tša maele le mothopo wa lentšu, go na le seswantšho se sennyane sa folaga. Se kgotle, kgetha seo se fošagetšego, gomme ge o rata o oketše tshwayotshwayo ye kopana. Se ya thwii go sehlopha, gomme pego ye nngwe le ye nngwe e a lekolwa.",
              "O se tshwenyege ka go ba yo a hlokomelago kudu. Pukuntšu e kaonafala ka pela ka ditshwayotshwayo tše go feta ka selo se sengwe le se sengwe.",
            ],
          },
          {
            id: "kids-not-working",
            q: "Mokgwa wa bana ga o fetoše tlhalošo",
            a: [
              "Mokgwa wa bana o fetoša fela sengwalwa moo lentšu le šetšego le na le tlhalošo ye e loketšego bana. Bakeng sa lentšu leo o sa tšwago go le nyaka la mathomo, e fe metsotswana ye 10 go ya go ye 15 ge tlhathollo ya bana e lokišwa.",
              "Mokgwa wa bana ke karolo ya leano la Family. Go Individual o tla bona sefetoši sa \"Ka mantšu a bonolo\" legatong la yona, seo se neago tlhalošo ye bonolo ya tlhalošo e nngwe le e nngwe. Go Basic goba ntle le akhaonto ga go na sefetoši. Bangwadiši bao ba tsenetšego Clear goba Deep pele ga October 2026 ba boloka Mokgwa wa bana. Go e hwetša, bona Family letlakaleng la ditheko.",
            ],
          },
          {
            id: "voice-fails",
            q: "Go nyaka ka lentšu ga go šome",
            a: [
              "Go nyaka ka lentšu go nyaka tumelelo ya maekrofouno. Bontši bja difetleki di botšiša gatee saete e nngwe le e nngwe. Ge o e thibetše ka phošo, kgotla leswao kgauswi le gadit.app bareng ya aterese gomme o dumelele maekrofouno ditumelelwaneng tša saete.",
              "Go iPhone le iPad, gape dumelela maekrofouno go Safari ka app ya Settings ya sedirišwa. Go nyaka ka lentšu ke karolo ya maano a Individual le Family, ka fao go Basic le ntle le akhaonto konopo ya maekrofouno ga e tšwelele. Go kaonafatša, bula letlakala la ditheko.",
            ],
          },
          {
            id: "no-image",
            q: "Ga ke kgone go hwetša seswantšho sa lentšu",
            a: [
              "Diswantšho ke karolo ya maano a Individual le Family, ka diswantšho tše diswa tše go fihla go 100 ka kgwedi. Seswantšho seo se šetšego se le gona bakeng sa tlhalošo yeo se a bulega ntle le go balwa. Leano la kgale la Clear le na le tše 30 ka kgwedi, gomme Basic ga e na diswantšho. Ge diswantšho tša kgwedi di fedile o tla bona tsebišo, gomme palo e thoma lefsa mathomong a kgwedi ye nngwe le ye nngwe.",
              "Ge o sa le ka tlase ga palo gomme o sa bona diphošo, gantši ke tša nakwana. Leka gape ka morago ga metsotswana ye 30. Diphošo tše di tšwelago pele ke bothata. Hle bega go tšwa letlakaleng la lentšu.",
            ],
          },
          {
            id: "save-word",
            q: "Nka boloka bjang lentšu pukung ya ka ya mantšu?",
            a: [
              "Ga go nyakege. Ge o tsenile, lentšu le lengwe le le lengwe leo o le nyakago le bolokwa pukung ya gago ya mantšu ka bolona. Go Basic puku ya mantšu e swara go fihla go mantšu a 30. Go Individual le Family ga e na moedi gomme e na le boitlwaetšo bja bohlale, bjo bo bušetšago mantšu a gago gore o a boeletše ka nako ye e nepagetšego.",
              "Go Individual le Family, mantšu ao o a nyakago gape a bolokwa sedirišweng sa gago, ka fao a bulega ntle le inthanete. Go bona mantšu a gago, bula puku ya mantšu go tšwa lenaneong.",
            ],
          },
          {
            id: "offline",
            q: "Nka diriša bjang Gadit ntle le inthanete?",
            a: [
              "Tšhomišo ntle le inthanete ke karolo ya maano a Individual le Family. Lentšu le lengwe le le lengwe leo o le nyakago le bolokwa sedirišweng sa gago, ka fao le bulega gape gateetee le ge inthanete e se gona. O ka kgotla gape \"Laolla sephuthelwana sa ntle le inthanete\" letlakaleng la gago la \"Akhaonto\" go boloka mantšu a pukuntšu ya rena ka polelo ya gago sedirišweng se.",
              "Go nyaka lentšu le leswa ka botlalo go sa nyaka kgokagano, ka gobane Gadit e swanetše go lokiša sephetho ka moka sa lona. Kopi ya ntle le inthanete e akaretša mantšu ao a šetšego a le sedirišweng sa gago. Ge o le go Basic, bona maano letlakaleng la ditheko.",
            ],
          },
          {
            id: "slow",
            q: "Tirišo e bonagala e nanya",
            a: [
              "Nyakišišo ya mathomo ya lentšu ke yona ye e nanyago kudu ka gobane Gadit e dira sephetho ka moka go tloga mathomong: gantši metsotswana ye mmalwa, ka nako ye nngwe go feta bakeng sa mantšu a a raraganego. Dinyakišišo tše di latelago tša lentšu le le swanago di a akgofa, di tšwa polokelong.",
              "Ge tšohle di bonagala di nanya, leka go mpshafatša ka matla: Cmd+Shift+R go Mac, Ctrl+Shift+R go Windows. Ge go nanya go tšwela pele matlakaleng ka moka, hle re romele imeile ka naga ya gago le sefetleki gore sehlopha se lekole tsela ya neteweke go ya diseborong tša rena go tšwa tikologong ya gago.",
            ],
          },
          {
            id: "word-not-found",
            q: "Ke nyakile lentšu eupša ka se hwetše sephetho. Go direga eng?",
            a: [
              "Sa pele, lekola mopeleto. Ge go bile le phošo ya go thaepa, Gadit gantši e bontšha lentšu leo le lokišitšwego, ka linki ya go nyaka seo o se thaepilego le ge go le bjalo.",
              "Mantšu a sa tlwaelegago kudu goba a polelo ya mmileng ga se ka mehla a hwetšago sephetho. Ge o kgonthišegile gore lentšu le gona, re ngwalele go tšwa letlakaleng le gomme sehlopha se tla le lekola.",
            ],
          },
          {
            id: "change-language",
            q: "Nka fetoša bjang polelo ya tšhebedišo?",
            a: [
              "Godimo ga letlakala go na le leswao la globe le polelo ya gago ya bjale. Le kgotle gomme o kgethe polelo.",
              "Kgetho ya gago e bolokwa sedirišweng se. Tšohle di laišega gape ka polelo ye mpsha, tšhebedišo, mananeo, ditlhalošo tša mantšu tša ka moso, mehlala, ditlhalošo tša bana, gaešita le mothopo wa lentšu. Mantšu ao o šetšego o a nyakile ka polelo ya kgale a tla bontšhwa ka yona go fihlela o a nyaka gape.",
            ],
          },
        ],
      },
      {
        id: "partner",
        icon: "🤝",
        title: "Lenaneo la balekane",
        items: [
          {
            id: "join-partner",
            q: "Nka ba bjang molekane wa Gadit?",
            a: [
              "Eya go gadit.app/partners gomme o kgotle \"Tsena ka mahala\". Tsenya leina la gago le imeile, morago o kgotle \"Hwetša khoutu ya ka ya molekane\". Linki ya gago ya sebele le letlakala la gago la taolo la molekane, ka dikgotlo le dikhomišene, di lokile gateetee, ntle le go leta tumelelo. Khoutu le linki di bile di romelwa go wena ka imeile.",
              "Go tsena ke mahala gomme go bulegetše mang le mang. Ga o nyake peeletšo ya Gadit gore o be molekane.",
            ],
          },
          {
            id: "commission-model",
            q: "Dikhomišene di balwa bjang?",
            a: [
              "Melawana ya tlwaelo ke 25% ya tefo ye nngwe le ye nngwe ye moreki a e dirago ngwageng wa gagwe wa mathomo. Ka morago ga ngwaga woo wa mathomo, o hwetša 10% ya tefo ye nngwe le ye nngwe ge feela moreki a tšwela pele a lefa. Ge o tliša bareki ba 5 ba ba lefelago, kabelo ya gago ka morago ga ngwaga wa mathomo e hlatloga go 15% bophelo ka moka.",
              "Se se šoma ka tsela ye e swanago go maano a kgwedi le a ngwaga, ka gobane khomišene e balwa go tefo ye nngwe le ye nngwe ya nnete. Ge moreki a khansela, khomišene ya gago e ema ka tefo ya gagwe ya mafelelo.",
              "Sehlopha se ka beakanya diphesente tše di fapanego bakeng sa balekane ba itšego. Diphente tša gago ka mehla di bonagala letlakaleng la gago la taolo la molekane.",
            ],
          },
          {
            id: "payout",
            q: "Ke lefelwa neng?",
            a: [
              "Gape ka kgwedi, ge tšhelete ya gago e fihla go bonyenyane bjo bo bontšhitšwego letlakaleng la gago la taolo la molekane. Re e romela akhaontong ya PayPal ye o e beakantšego moo. Bonyenyane bjoo ke moedi wa go lokolla tefo, ga se mollwane. O ka hwetša go feta kudu, gomme o amogela tefo ge o šetše o bo fetile.",
              "Dikhomišene di lokollwa matšatši a 30 ka morago ga tefo ya peeletšo, go dumelela sebaka sa go bušetša tšhelete. Ka fao peeletšo ya Janaware e lokollwa mathomong a Feberware gomme e tsena tefong ya gago ye e latelago ge tšhelete ya gago e fihla go bonyenyane.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "Ke tsene eupša letlakala la ka la taolo ga le na selo",
            a: [
              "Dipalo di bonagala ka morago ga kgotlo ya mathomo go linki ya gago. Go se be le selo go ra feela gore ga go yo a šetšego a e kgotla. Abelana ka linki. Letlakala la taolo le mpshafala kgauswi le nako ya nnete ge mošomo o thoma.",
              "Ge o abelane gomme motho a ingwadišitše eupša letlakala la taolo le sa e bontšhe, re ngwalele ka nako ye e ka bago ya go ingwadiša gomme sehlopha se tla lekola gore go ingwadiša go tšwile kae.",
            ],
          },
          {
            id: "attribution-window",
            q: "Linki ya ka ya go šišinya e latela moeti nako ye kae?",
            a: [
              "Matšatši a masometshela. Ge moeti a kgotla linki ya gago, re bea khukhi ye e go laetšago bjalo ka yo a mo rometšego. Ge a ingwadiša gomme a ngwadiša peeletšo nako efe goba efe matšatšing a 60 a a latelago (le ge a ka tloga weposaeteng gomme a boa ka morago ka nyakišišo ya Google), go balelwa go sa ya go wena.",
              "Go phumolwa ga dikhukhi: ge moeti a phumola dikhukhi tša gagwe goba a fetoša sefetleki/sedirišwa pele a ingwadiša, go balelwa go ka lahlega. Ga go tsela ya go phema seo, eupša matšatši a 60 ke nako ye telele ge e bapetšwa le mananeo a mantši a balekane.",
            ],
          },
          {
            id: "missing-commission",
            q: "Motho o ingwadišitše ka linki ya ka eupša ga ke bone khomišene",
            a: [
              "Gantši ke taba ya nako. Go ingwadiša go bonagala letlakaleng la taolo ka gare ga metsotso, eupša khomišene e ngwalwa fela ge peeletšo e lefilwe ka nnete, gomme seo se ka ba matšatši ka morago ge e ba ba le tekong ya mahala. Lekola gape ka morago ga ge teko e fela.",
              "Ge peeletšo e lefilwe eupša o sa bone khomišene ka morago ga diiri tše 48, re ngwalele ka nako ye e ka bago ya go ingwadiša le imeile goba leina le le ka bago la mongwadiši, ge o le tseba. Sehlopha se tla lekola gore go ingwadiša go tšwile kae gomme se lokiše ka seatla ge sengwe se fošitšwe.",
            ],
          },
        ],
      },
      {
        id: "general",
        icon: "❓",
        title: "Kakaretšo",
        items: [
          {
            id: "what-is-gadit",
            q: "Gadit ke eng?",
            a: [
              "Gadit e go thuša go kwešiša lentšu le lengwe le le lengwe ka botlalo, e sego fela go hwetša tlhalošo ya mothalo o tee. Lentšu le lengwe le le lengwe le bulega le na le ditlhalošo tša lona ka moka, mehlala ya nnete ya tlhalošo ye nngwe le ye nngwe, dika le mothopo wa lentšu. Maano ao a lefelwago a oketša seswantšho sa tlhalošo ye nngwe le ye nngwe, boitlwaetšo, dipapadi le tše dingwe, gomme Family e oketša Mokgwa wa bana le sebaka sa ngwana yo mongwe le yo mongwe.",
              "Gadit e šoma ka dipolelo tše 41. Ka gare ga sehlopha re e bitša go GAD lentšu: go kwešiša lentšu ka botlalo, e sego fela go le fetolela. Go bona seo leano le lengwe le le lengwe le se akaretšago, bula letlakala la ditheko.",
            ],
          },
          {
            id: "languages",
            q: "Le thekga dipolelo dife?",
            a: [
              "Gadit e šoma ka dipolelo tše 41, go akaretša Seisemane, Seheberu, Searabia, Sepanish, Sefora, Sejeremane, Serashia, Setšhaena, Sejapane, SeHindi, Sezulu, Sexhosa le Seafrikanse.",
              "O ka nyaka lentšu ka efe goba efe ya dipolelo tše gomme wa hwetša ditlhalošo, mehlala le tšohle tše dingwe ka polelo ye o e kgethilego ya tšhebedišo. Seheberu, Searabia le Sepersia di balwa go tloga go le letona go ya go le letshadi, ka difonte tša tšona. Go fetoša, kgotla konopo ya polelo godimo ga letlakala lefe goba lefe.",
            ],
          },
          {
            id: "kid-safety",
            q: "Na Gadit e bolokegile bakeng sa bana?",
            a: [
              "Gadit e diretšwe gore motswadi a e šomiše ka polokego gotee le ngwana. Mokgwa wa bana o tšweletša ditlhalošo tše bonolo, tše di kwagalago le tše di loketšego mengwaga (maemong a mengwaga ye 5 go ya go ye 10), o šomiša enjene ye e swanago le ye e dirago diteng tša batho ba bagolo, ka ditaelo tše di kwagalago tša go nolofatša. Ga go diteng tše di dirilwego ke badiriši tšeo di kilego tša bontšhwa bana.",
              "Go ya ka dipholisi tša rena le melao ya sephiri sa bana lefaseng ka bophara, akhaonto ya gago ka noši ke ya mengwaga ye 13 go ya godimo. Bana ba šomiša Gadit ka motswadi: go leano la Family motswadi o oketša ngwana yo mongwe le yo mongwe go tšwa letlakaleng la Family, ngwana yo mongwe le yo mongwe o hwetša sebaka sa gagwe le Mokgwa wa bana, gomme letlakala la taolo la motswadi le bontšha mantšu ao ngwana yo mongwe le yo mongwe a a nyakago. Go thoma, thoma ka Family letlakaleng la ditheko.",
            ],
          },
          {
            id: "data",
            q: "Tshedimošo ya ka e bolokwa kae? Na le a e rekiša?",
            a: [
              "Akhaonto, histori, puku ya mantšu le diswantšho tše di dirilwego di bolokwa ka polokego go Firebase, di notletšwe polokelong. Ga re rekišetše motho le ge e le ofe tshedimošo ya gago. Re abelana fela seo se nyakegago go šomiša Gadit (polokelo, ditefo, bafepi ba diteng), bjalo ka ge go hlalošitšwe ka go Pholisi ya Sephiri.",
              "O ka phumola akhaonto ya gago nako efe goba efe go tšwa letlakaleng la Akhaonto. Go hwetša kopi ya puku ya gago ya mantšu goba tshedimošo efe goba efe ye nngwe ye re e swerego, re ngwalele go tšwa letlakaleng le.",
            ],
          },
          {
            id: "contact-direct",
            q: "Nka le hwetša bjang thwii?",
            a: [
              "Šomiša konopo ya imeile ka fase ga letlakala le. E ya thwii lepokising la diimeile la sehlopha. Molaetša o mongwe le o mongwe o a balwa gomme o hwetša karabo ka gare ga diiri tše 24 go ya go tše 48 (gantši ka pela go feta).",
              "Imeile e phala poledišano bakeng sa thušo: e fa sehlopha sebaka sa go bala ka tlhokomelo le go araba ka kelohloko. Thušo ka mogala ga e eso fiwe.",
            ],
          },
        ],
      },
    ],
  },
  tn: {
    eyebrow: "Lefelo la Thuso",
    heading: "Bona karabo, ka bonako",
    lede: "Dipotso tse di tlwaelegileng le ditharabololo kgato ka kgato, di rulagantswe ka dikarolo. Fa o sa bone bothata jwa gago, ikgolaganye le setlhopha kwa tlase.",
    stillNeedHelpHeading: "A o sa ntse o kgoreletsegile?",
    stillNeedHelpBody: "Re kwalele ka tlhamalalo. Molaetsa mongwe le mongwe o balwa ke setlhopha mme gantsi o bona karabo mo letsatsing kgotsa a mabedi.",
    emailCta: "Re romelele imeile",
    responseTime: "Gantsi re araba mo diureng di le 24 go ya go 48.",
    categories: [
      {
        id: "billing",
        icon: "💳",
        title: "Dituelo le ikwadiso",
        items: [
          {
            id: "change-card",
            q: "Ke fetola jang karata ya sekoloto mo ikwadisong ya me?",
            a: [
              "O ka fetolela go karata e ntšha mo nakong e e kwa tlase ga motsotso kwa ntle ga go khansela. Ikwadiso ya gago ya jaanong e tswelela, fela ka karata e ntšha.",
              "1. Tsena mo gadit.app mme o bule \"Akhaonto\" go tswa mo menung ya akhaonto. 2. Tobetsa \"Laola dituelo\". 3. Tsebe e e sireletsegileng ya Stripe e a bulega. Tsenya karata e ntšha e le mokgwa wa tefo mme o e tshwaye e le ya ka metlha. 4. Fa o batla, tlosa karata ya kgale.",
              "Go tloga mo nakong e e latelang ya tefo, tsotlhe di ya mo karateng e ntšha. Tefo e e fetileng, e e setseng e duetswe, e nna mo karateng ya kgale. Ga go tlhokege pusetso ya madi ntle le fa o e batla ka tlhamalalo.",
            ],
          },
          {
            id: "cancel",
            q: "Ke khansela jang ikwadiso ya me?",
            a: [
              "O itirela, nako nngwe le nngwe. Tsena, bula Akhaonto, mme o tobetse go khansela ikwadiso fa tlase ga leano la gago.",
              "A o rekile ikwadiso ya gago mo app ya iPhone kgotsa iPad? E khansela mo dipeakanyong tsa gago tsa ikwadiso tsa Apple. Kgolagano ya \"Laola ikwadiso\" mo tsebeng ya gago ya Akhaonto e go isa koo.",
              "Fa o na le ikwadiso e o e duelelang, phitlhelelo ya gago e tswelela go fitlha kwa bofelong jwa nako e o setseng o e duetse. Morago ga foo akhaonto e fetogela go Basic, e e sa duelelweng. Mafoko a o a bolokileng le hisitori di nna di babalesegile.",
              "Mo nakong ya teko ya mahala ya malatsi a le 14, go khansela go fetsa teko ka bonako mme ga go na tefo. Fa o tshwenyega fela ka tefo e e itiragalelang, tlhopha lebaka leo mo lefesetereng la go khansela, mme o ka tima go ntšhafala ga ikwadiso, wa tswelela ka teko go fitlha letsatsing la yone la bofelo.",
              "Fa o khanseditse ikwadiso e o e duelelang ka phoso kgotsa o fetotse mogopolo, o ka e simolola gape go tswa mo tsebeng e e tshwanang pele nako e fela.",
            ],
          },
          {
            id: "switch-plan",
            q: "Ke fetola jang magareng ga Individual le Family?",
            a: [
              "Go fetogela go Family, bula tsebe ya gago ya Akhaonto mme o tobetse \"Fetogela go Family\". Ikwadiso ya gago ya jaanong e ntšhafadiwa mo karateng e e tshwanang, o sa e tsenye gape.",
              "Stripe e bala pharologano ya malatsi a a setseng a nako ya jaanong, ka jalo o duela pharologano fela. Go fetoga go tswa mo Family go ya go Individual, re kwalele go tswa mo tsebeng e, mme setlhopha se tla go fetolela.",
            ],
          },
          {
            id: "invoice",
            q: "Ke laolela jang inwoisi kgotsa resiti?",
            a: [
              "Akhaonto, morago Laola dituelo, morago Hisitori ya diinwoisi. Tefo nngwe le nngwe e na le resiti ya PDF e o ka e laolelang e e nang le dintlha tsa tefo tse o di bolokileng.",
              "Fa o tlhoka leina le lengwe, aterese, kgotsa nomoro ya lekgetho mo inwoising (sekai leina la khampani ka ntlha ya lekgetho), ntšhafatsa dintlha tsa gago tsa tefo mo tsebeng e e tshwanang pele o laolela. Resiti e e latelang e tla dirisa dintlha tse dintšha.",
            ],
          },
          {
            id: "portal-error",
            q: "Ke tobeditse Laola dituelo mme ka bona phoso. Jaanong?",
            a: [
              "Go na le mabaka a mabedi a a tlwaelegileng. La ntlha, akhaonto ya gago ga e na ikwadiso e e dirang ya Stripe. La bobedi, Stripe e ka tswa e ise e nne le porofaele e e feletseng ya tefo ya akhaonto ya gago.",
              "Tlhatlhobo ya ntlha e e bonolo: tswa, o boe o tsene ka imeile e o e dirisitseng fa o duela, mme o leke gape. Fa e sa ntse e palelwa, ikgolaganye le rona ka imeile ya akhaonto ya gago mme setlhopha se tla e baakanya ka fa letlhakoreng la rona mo motsotsong.",
            ],
          },
          {
            id: "autorenew",
            q: "A ikwadiso ya me e tla ntšhafala ka bo yone?",
            a: [
              "Ee. Maano a kgwedi a ntšhafala kgwedi nngwe le nngwe, maano a ngwaga a ntšhafala ngwaga nngwe le nngwe ka letlha le le tshwanang. O ka bona letlha la tefo e e latelang mo akhaontong ya gago le mo potaleng ya Stripe.",
              "Fa o sa batle go ntšhafala ka bo yone, khansela nako nngwe le nngwe pele ga letlha la go ntšhafatsa. Go khansela ga go diragale ka bonako. O nna le phitlhelelo go fitlha kwa bofelong jwa nako e o setseng o e duetse.",
            ],
          },
          {
            id: "refund",
            q: "A nka busediwa madi?",
            a: [
              "Ee. Fa theko e dirilwe mo malatsing a a kwa tlase ga 14 a a fetileng mme tirelo e sa dirisiwa thata, re kwalele ka imeile ya akhaonto ya gago le molaetsa o mokhutshwane wa gore goreng. Dituelo tseo di dumelelwa kwa ntle ga kgang.",
              "Fa go fetile malatsi a a fetang 14, setlhopha se tsamaisa kgang nngwe le nngwe ka bo yone. Khansela ikwadiso gore e se ka ya tswelela go ntšhafala, mme o re romelele imeile.",
            ],
          },
          {
            id: "unknown-charge",
            q: "Tefo e mo karateng ya me ke eng?",
            a: [
              "Dituelelo di bonala e le GADIT kgotsa GADIT.APP. Madi a tsamaisana le leano la gago (Individual kgotsa Family, ka kgwedi kgotsa ka ngwaga) mo mading a naga ya gago, jaaka go bontshiwa mo tsebeng ya ditlhwatlhwa. Dikwadiso tse di simologileng pele ga Diphalane 2026 di tswelela ka tlhwatlhwa e di simologileng ka yone. Fa madi a sa tsamaisane, go ka tswa e le tirelo e nngwe.",
              "Fa o tlhomamisegile gore ga se ya gago, o se ka wa ngongorega kwa bankeng ya gago jaanong. Pele re kwalele ka tlhamalalo ka letlha le palo ya madi. Setlhopha se tla e bona, se tlhalose gore ke eng, mme se busetse madi fa go tlhokega. Ngongorego ya banka e ka dira gore dituelo tsa isago di nne thata, ka jalo go e rarabolola ka thuso gantsi go bonako mme go babalesegile.",
            ],
          },
          {
            id: "failed-payment",
            q: "Tefo ya me e padile. Ke dire eng?",
            a: [
              "Stripe e leka gape dituelo tse di paletsweng ka bo yone makgetlho a le mmalwa mo malatsing a a latelang. Bontsi jwa go palelwa go a rarabologa fa banka e lokolola thibelo kgotsa fa karata e na le madi a a lekaneng.",
              "Bara e e kwa godimo ga tsebe e tla re tefo ga e a feta, mme phitlhelelo ya gago e bolokwa malatsi a sekae gape. Tobetsa \"Ntšhafatsa karata\" foo, tsenya karata e e dirang, mme re tla leka tefo ka yone ka bonako. Fa ikwadiso ya gago e setse e falletse kwa Basic, o ka ikwadisa gape go tswa mo tsebeng ya Ditlhwatlhwa mme bukana ya gago e sala e siame.",
            ],
          },
          {
            id: "plan-comparison",
            q: "Pharologano ke eng magareng ga Basic, Individual le Family?",
            a: [
              "Basic (mahala): go fitlha dipatlo tsa mafoko di le 10 ka letsatsi, ditlhaloso tsotlhe, dikai, dikapolelo, tshimologo ya lefoko, bokao jo bo nepagetseng go ya ka polelo, le bukana ya go fitlha mafoko a le 30.",
              "Individual: motho a le mongwe, didirisiwa tsotlhe tsa go ithuta. Dipatlo tse di sa lekanyediwang, setshwantsho sa tlhaloso nngwe le nngwe, dikai le dipotso tse dingwe ka lefoko lengwe le lengwe, Kwala polelo mme o amogele maikutlo, Lefoko Lengwe le Lengwe, E bue, lentswe la tlhago la go buisa le patlo ka lentswe, tiriso ntle le inthanete, metshameko, dipotso le dikgaisano tsa mafoko, le boikatiso jo botlhale ka ipaakanyetso ya teko le dikteshene.",
              "Family: tsotlhe tsa Individual bakeng sa bana ba ka fitlha go 5 le batsadi, mmogo le Mokgwa wa bana, lefelo la gagwe la ngwana mongwe le mongwe, thuso ka tirogae, le lebota la batsadi le kitsiso ya lefoko lengwe le lengwe. Dikolo di na le leano la tsone. Ditlhwatlhwa tsa naga ya gago le teko ya mahala ya malatsi a le 14 di mo tsebeng ya ditlhwatlhwa.",
            ],
          },
        ],
      },
      {
        id: "account",
        icon: "👤",
        title: "Akhaonto le go tsena",
        items: [
          {
            id: "no-verification-email",
            q: "Ga ke a amogela imeile ya go netefatsa",
            a: [
              "Pele, tlhola mo difoleteng tsa spam le tsa dipapatso. Gmail le Outlook ka dinako tse dingwe di isa diimeile tsa akhaonto koo go fitlha o tshwaya nngwe e le \"Not spam\".",
              "Fa e se koo, imeile e ka tswa e kwadilwe phoso fa o ikwadisa. Leka go ikwadisa gape mme o tlhole aterese sentle. Fa o ikwadisitse ka Google, ga go tlhokege imeile ya go netefatsa.",
            ],
          },
          {
            id: "forgot-password",
            q: "Ke lebetse lefoko la me la sephiri",
            a: [
              "Mo lebokosong la go tsena, thaepe imeile ya gago, morago o tobetsa \"O lebetse lefoko la sephiri?\". Kgolagano ya go le fetola gantsi e goroga mo inbox ya gago mo motsotsong kgotsa e le mebedi. O ka tobetsa gape \"Nthomelele kgolagano ya go tsena ka imeile\" mme o tsene ntle le lefoko la sephiri.",
              "Fa imeile e sa goroge, tlhola spam. Fa e sa ntse e sa goroge, o ka tswa o ikwadisitse ka Google go na le imeile le lefoko la sephiri. Leka konopo ya \"Tswelela ka Google\".",
            ],
          },
          {
            id: "wrong-credentials",
            q: "Lefoko la me la sephiri le siame, mme go tweng imeile le lefoko la sephiri ga di dumalane",
            a: [
              "Dilo di le tharo tsa go tlhola. Sa ntlha, Caps Lock. Sa bobedi, sekgala se sengwe kwa bofelong morago ga go kopolola le go pega. Sa boraro, gongwe o ikwadisitse ka Google go na le lefoko la sephiri, dirisa \"Tswelela ka Google\".",
              "A o sa ntse o kgoreletsegile? Mo molaetseng oo oo, tobetsa \"Nthomelele kgolagano ya go tsena ka imeile\" gore o tsene ntle le lefoko la sephiri, kgotsa \"Tlhopha lefoko le leša la sephiri\".",
            ],
          },
          {
            id: "google-fails",
            q: "Go tsena ka Google ga go dire",
            a: [
              "Mo teng ga di-app tse di jaaka Instagram, Facebook kgotsa TikTok, konopo ya Google e fitlhilwe. Bula kgolagano mo sebatling sa gago se se tlwaelegileng, kgotsa tsenya ka imeile ya gago. Fa o tsene ka Google, thaepe imeile eo mme o tobetsa \"Nthomelele kgolagano ya go tsena ka imeile\".",
              "Mo letlhabaphefong la poraefete, incognito, di-cookie tse di thibetsweng di ka emisa go tsena ka Google, jalo leka letlhabaphefo le le tlwaelegileng.",
            ],
          },
          {
            id: "change-email",
            q: "Ke fetola jang imeile mo akhaontong ya me?",
            a: [
              "Go fetola imeile ya akhaonto go dirwa ke setlhopha. Re romele imeile go tswa mo atereseng ya gago ya jaana mme o kwale aterese e ntšha mo molaetseng. Setlhopha se tla e ntšhafatsa, mme ikwadiso ya gago, hisitori le bukana di tla sala tsotlhe jaaka di ntse.",
            ],
          },
          {
            id: "delete-account",
            q: "Ke phimola jang akhaonto ya me?",
            a: [
              "Kwa tlase ga tsebe ya \"Akhaonto\", tobetsa \"Phimola akhaonto\" mme o thaepe imeile ya akhaonto ya gago go tlhomamisa. Se ke sa ka metlha, ikwadiso ya gago e a khanselwa, bukana le hisitori di a phimolwa, mme imeile e a gololwa gore o kgone go ikwadisa sešwa.",
              "Pharologanyo e le nngwe ke ikwadiso e e rekilweng mo App Store, go phimola akhaonto ga go e khansole, jalo e khansole pele mo ditlhophong tsa gago tsa ikwadiso tsa Apple.",
              "Direkoto tsa dituelo tse di fetileng di a sala, ka gonne molao o re patelela go di boloka ka ntlha ya dibuka tsa madi.",
            ],
          },
          {
            id: "share-account",
            q: "A molekane wa me kgotsa ngwana wa me a ka abelana akhaonto ya me?",
            a: [
              "Akhaonto nngwe le nngwe e na le motho a le mongwe yo o tsenyeng ka nako. Bakeng sa lelapa, leano la Family le diretswe se: go fitlha bana ba le 5 le batsadi, mongwe le mongwe a na le lefelo la gagwe, bukana ya gagwe le kgatelopele ya gagwe, mmogo le Mokgwa wa bana bakeng sa bana le lebota la batsadi.",
              "Bakeng sa mogolo a le mongwe a le esi, Individual e direla motho a le mongwe ka didirisiwa tsotlhe tsa go ithuta. Bapisa maano le ditlhwatlhwa tsa naga ya gago mo tsebeng ya ditlhwatlhwa.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "Ke akanya gore ke na le diakhaonto di le pedi ka phoso. Jaanong?",
            a: [
              "Se gantsi se diragala fa motho a ikwadisa gangwe ka Google mme gangwe ka imeile le lefoko la sephiri a dirisa aterese e e tshwanang, kgotsa fa o ikwadisa gabedi ka diaterese tse di farologaneng tsa imeile. Go ikwadisa gongwe le gongwe go dira akhaonto ya Gadit e e farologaneng e e nang le bukana, hisitori le seemo sa ikwadiso sa yone.",
              "Re romele imeile go tswa mo go nngwe ya diaterese tseo tse pedi, mme o kwale aterese e nngwe le gore o batla go boloka akhaonto efe. Setlhopha se tla kopanya dibukana le hisitori mo akhaontong e o e tlhophang, mme morago se tswale e nngwe sentle. Ga go na tshedimosetso e e latlhegang.",
            ],
          },
        ],
      },
      {
        id: "product",
        icon: "🔍",
        title: "Go dirisa Gadit",
        items: [
          {
            id: "wrong-definition",
            q: "Ke akanya gore tlhaloso e phoso. Ke dire eng?",
            a: [
              "Fa thoko ga bokao bongwe le bongwe, le mo dikarateng tsa maele le tshimologo ya lefoko, go na le letshwao le lennye la folaga. Le tobetse, tlhopha se se phoso, mme fa o batla o tsenye le ntlhanyana e khutshwane. E ya ka tlhamalalo kwa setlhopheng, mme pego nngwe le nngwe e a sekasekwa.",
              "O se tshwenyege ka go nna kelotlhoko thata. Thanodi e tokafala ka bonako go tswa mo maikutlong ano go feta sengwe le sengwe se sengwe.",
            ],
          },
          {
            id: "kids-not-working",
            q: "Mokgwa wa bana ga o fetole tlhaloso",
            a: [
              "Mokgwa wa bana o fetola mokwalo fela fa lefoko le setse le na le tlhaloso e e siametseng bana. Fa o sa tswa go batla lefoko ka lekgetlo la ntlha, ema metsotswana e le 10 go ya go 15 fa mofuta wa bana o ntse o baakanngwa.",
              "Mokgwa wa bana ke karolo ya leano la Family. Mo Individual o tla bona switch ya \"Ka mafoko a a bonolo\" go na le yone, e e nayang tlhaloso e e motlhofo ya bokao bongwe le bongwe. Mo Basic kgotsa kwa ntle ga akhaonto ga go na switch. Ba ba ikwadisitseng mo Clear kgotsa Deep pele ga Diphalane 2026 ba tswelela ba na le Mokgwa wa bana. Go e bona, leba Family mo tsebeng ya ditlhwatlhwa.",
            ],
          },
          {
            id: "voice-fails",
            q: "Go batla ka lentswe ga go dire",
            a: [
              "Go batla ka lentswe go tlhoka tetla ya maekerofouno. Bontsi jwa dibatli di botsa gangwe fela mo setsheng sengwe le sengwe. Fa o e thibetse ka phoso, tobetsa setshwantsho se se fa thoko ga gadit.app mo moleng wa aterese mme o letlele maekerofouno mo ditetleng tsa saete.",
              "Mo iPhone le mo iPad, gape letlelela maekerofouno ya Safari mo app ya Settings ya sedirisiwa. Go batla ka lentswe ke karolo ya maano a Individual le Family, ka jalo mo Basic le kwa ntle ga akhaonto konopo ya maekerofouno ga e tlhagele. Go tlhatlosa, bula tsebe ya ditlhwatlhwa.",
            ],
          },
          {
            id: "no-image",
            q: "Ga ke kgone go bona setshwantsho sa lefoko",
            a: [
              "Ditshwantsho ke karolo ya maano a Individual le Family, ka ditshwantsho tse dišwa di ka fitlha go 100 ka kgwedi. Setshwantsho se se setseng se le teng sa tlhaloso eo se a bulega se sa balwe. Leano la kgale la Clear le na le di le 30 ka kgwedi, mme Basic ga e na ditshwantsho. Fa ditshwantsho tsa kgwedi di fedile o tla bona kitsiso, mme palo e simolola sešwa kwa tshimologong ya kgwedi nngwe le nngwe.",
              "Fa o le kwa tlase ga selekanyo mme o sa ntse o bona go palelwa, gantsi ke ga nakwana. Leka gape morago ga metsotswana e le 30. Go palelwa go go tswelelang ke phoso. Tsweetswee e bege go tswa mo tsebeng ya lefoko.",
            ],
          },
          {
            id: "save-word",
            q: "Ke boloka jang lefoko mo bukaneng ya me?",
            a: [
              "Ga o tlhoke go dira jalo. Fa o tsenye, lefoko lengwe le lengwe le o le batlang le bolokwa mo bukaneng ya gago ka bo lone. Mo Basic bukana e tshola go fitlha mafoko a le 30. Mo Individual le Family ga e na selekanyo mme e na le boikatiso jo botlhale, jo bo busetsang mafoko a gago gore o a boeletse ka nako e e siameng.",
              "Mo Individual le Family, mafoko a o a batlang a bolokwa gape mo sedirisweng sa gago, ka jalo a bulega kwa ntle ga inthanete. Go bona mafoko a gago, bula bukana go tswa mo lenaaneng.",
            ],
          },
          {
            id: "offline",
            q: "Ke dirisa Gadit jang kwa ntle ga inthanete?",
            a: [
              "Tiriso ya kwa ntle ga inthanete ke karolo ya maano a Individual le Family. Lefoko lengwe le lengwe le o le batlang le bolokwa mo sedirisweng sa gago, ka jalo le bula gape ka bonako ntle le inthanete. O ka tobetsa \"Laolola sephuthelo sa kwa ntle ga inthanete\" mo tsebeng ya gago ya \"Akhaonto\" gore o boloke mafoko a thanodi ya rona mo puong ya gago mo sedirisweng seno.",
              "Go batla lefoko le lesha gotlhelele go sa ntse go tlhoka kgolagano, ka gonne Gadit e tshwanetse go le baakanyetsa dipholo tsotlhe. Khopi ya kwa ntle ga inthanete e akaretsa mafoko a a setseng a le mo sedirisweng sa gago. Fa o le mo Basic, leba maano mo tsebeng ya ditlhwatlhwa.",
            ],
          },
          {
            id: "slow",
            q: "Tiriso e bonala e le bonya",
            a: [
              "Patlo ya ntlha ya lefoko ke yone e e bonya thata ka gonne Gadit e dira dipholo tsotlhe go simolola kwa tshimologong: gantsi metsotswana e le mmalwa, ka dinako tse dingwe go feta mo mafokong a a raraaneng. Dipatlo tse di latelang tsa lefoko le le tshwanang di diragala ka bonako, go tswa mo polokelong.",
              "Fa sengwe le sengwe se bonala se le bonya, leka go simolola sešwa ka thata: Cmd+Shift+R mo Mac, Ctrl+Shift+R mo Windows. Fa bonya bo tswelela mo ditsebeng tsotlhe, tsweetswee re romelele imeile ka naga ya gago le sebatli gore setlhopha se tlhole tsela ya neteweke go ya kwa diserefareng tsa rona go tswa mo kgaolong ya gago.",
            ],
          },
          {
            id: "word-not-found",
            q: "Ke batlile lefoko mme ka se bone dipholo. Go diragala eng?",
            a: [
              "Pele, tlhola mopeleto. Fa go ne go na le phoso ya go thaepa, Gadit gantsi e bontsha lefoko le le siameng, ka kgolagano ya go batla se o se thaepileng le fa go ntse jalo.",
              "Mafoko a a sa tlwaelegang thata kgotsa a puo ya mmila ga a nne le dipholo ka tsotlhe. Fa o tlhomamisegile gore lefoko le teng, re kwaleleng go tswa mo tsebeng eno mme setlhopha se tla le tlhola.",
            ],
          },
          {
            id: "change-language",
            q: "Ke fetola jang puo ya tiriso?",
            a: [
              "Kwa godimo ga tsebe go na le setshwantsho sa lefatshe se se nang le puo ya gago ya jaanong. Se tobetse mme o tlhophe puo.",
              "Tlhopho ya gago e bolokwa mo sedirisweng seno. Sengwe le sengwe se laisiwa gape ka puo e ntšha, interface, dimenu, ditlhaloso tsa mafoko tse o tla di batlang morago, dikai, ditlhaloso tsa bana, tota le tshimologo ya lefoko. Mafoko a o setseng o a batlile ka puo ya kgale a tla bontshiwa ka yone go fitlha o a batla gape.",
            ],
          },
        ],
      },
      {
        id: "partner",
        icon: "🤝",
        title: "Lenaneo la balekane",
        items: [
          {
            id: "join-partner",
            q: "Ke nna jang molekane wa Gadit?",
            a: [
              "Ya kwa gadit.app/partners mme o tobetse \"Tsena mahala\". Tsenya leina le imeile ya gago, mme o bo o tobetse \"Nnaya khoutu ya me ya molekane\". Kgolagano ya gago ya sebele le lebota la molekane, le le nang le go latela ditobetso le dikomishene, di siametse tsotlhe ka yone nako eo, ntle le go letela tetla. Khoutu le kgolagano le tsone di goroga ka imeile.",
              "Go tsena ke mahala mme go bulegetse mongwe le mongwe. Ga o tlhoke ikwadiso ya Gadit gore o nne molekane.",
            ],
          },
          {
            id: "commission-model",
            q: "Dikomishene di balwa jang?",
            a: [
              "Melawana e e tlwaelegileng ke 25% ya tefo nngwe le nngwe e moreki a e dirang mo ngwageng wa gagwe wa ntlha. Morago ga ngwaga oo wa ntlha, o bona 10% ya tefo nngwe le nngwe fa fela moreki a ntse a duela. Fa o tlisa bareki ba le 5 ba ba duelang, kabelo ya gago morago ga ngwaga wa ntlha e tlhatlogela go 15% botshelo jotlhe.",
              "Se se dira ka tsela e e tshwanang mo maanong a kgwedi le a ngwaga, ka gonne komishene e balwa mo tefong nngwe le nngwe ya nnete. Fa moreki a khansela, komishene ya gago e emisa ka tefo ya gagwe ya bofelo.",
              "Setlhopha se ka baya diperesente tse dingwe mo balekaneng ba ba rileng. Diperesente tsa gago tsotlhe di bonala ka metlha mo lebotong la gago la molekane.",
            ],
          },
          {
            id: "payout",
            q: "Ke duelwa leng?",
            a: [
              "Gangwe ka kgwedi, fa madi a gago a fitlha mo bonnyeng jo bo bontshitsweng mo lebotong la gago la molekane. Re a romela kwa akhaontong ya PayPal e o e beileng koo. Bonnye joo ke selekanyo sa go simolola, e seng bokhutlo, o ka bona go feta moo thata, mme o amogela tefo fa o sena go bo feta.",
              "Dikomishene di lokollwa malatsi a le 30 morago ga tefo ya ikwadiso, go letla nako ya go busetsa madi. Ka jalo ikwadiso ya Ferikgong e lokollwa kwa tshimologong ya Tlhakole, mme e tsena mo tefong ya gago e e latelang fa madi a gago a fitlha mo bonnyeng jo bo tlhokegang.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "Ke tsene mme lebota la me ga le na sepe",
            a: [
              "Dipalo di bonala morago ga go tobetsa ga ntlha mo kgolaganong ya gago. Fa go se na sepe go raya fela gore ga go ise go nne le ope yo o e tobeditseng. Tsaya o abelane ka kgolagano eo. Lebota le ntšhafala gaufi le nako ya nnete fa tiro e simolola.",
              "Fa o abelane mme mongwe a ikwadisitse, mme lebota le sa bontshe seo, re kwalele ka nako e e ka nnang ya go ikwadisa, mme setlhopha se tla tlhola gore go ikwadisa goo go tswa kae.",
            ],
          },
          {
            id: "attribution-window",
            q: "Kgolagano ya me e latela moeti nako e e kae?",
            a: [
              "Malatsi a le masome a marataro. Fa moeti a tobetsa kgolagano ya gago, re baya cookie e e go supang jaaka yo o mo romileng. Fa a ikwadisa mme a duela nako nngwe le nngwe mo malatsing a le 60 a a latelang (le fa a tswa mo setsheng mme a boa moragonyana ka patlo ya Google), o sa ntse o bonwa e le wena.",
              "Go phimola di-cookie: fa moeti a phimola di-cookie tsa gagwe kgotsa a fetola sebatli/sedirisiwa pele a ikwadisa, kgolagano le wena e ka latlhega. Ga go na tsela ya go thibela seo, mme malatsi a le 60 ke nako e telele fa e bapisiwa le mananeo a mantsi a balekane.",
            ],
          },
          {
            id: "missing-commission",
            q: "Mongwe o ikwadisitse ka kgolagano ya me mme ga ke bone komishene",
            a: [
              "Gantsi se ke kgang ya nako. Go ikwadisa go bonala mo lebotong mo metsotsong e le mmalwa, mme komishene e kwalwa fela fa ikwadiso e duelwa tota, mme seo se ka nna malatsi moragonyana fa ba le mo tekong ya mahala. Tlhola gape morago ga fa teko e fela.",
              "Fa ikwadiso e duetswe mme o sa ntse o sa bone komishene morago ga diura di le 48, re kwalele ka nako e e ka nnang ya go ikwadisa le imeile kgotsa leina le le ka nnang la moikwadisi fa o le itse. Setlhopha se tla tlhola gore go ikwadisa goo go tswa kae mme se baakanye sengwe le sengwe se se fositsweng ka seatla.",
            ],
          },
        ],
      },
      {
        id: "general",
        icon: "❓",
        title: "Kakaretso",
        items: [
          {
            id: "what-is-gadit",
            q: "Gadit ke eng?",
            a: [
              "Gadit e go thusa go tlhaloganya lefoko lengwe le lengwe go fitlha kwa bofelong, e seng go bona tlhaloso ya mola o le mongwe fela. Lefoko lengwe le lengwe le bulega le na le ditlhaloso tsotlhe tsa lone, dikai tsa nnete tsa tlhaloso nngwe le nngwe, dikapolelo le tshimologo ya lefoko. Maano a a duelelwang a oketsa setshwantsho sa tlhaloso nngwe le nngwe, boikatiso, metshameko le tse dingwe, mme Family e oketsa Mokgwa wa bana le lefelo la ngwana mongwe le mongwe.",
              "Gadit e dira ka dipuo di le 41. Mo setlhopheng re e bitsa go GAD lefoko: go tlhaloganya lefoko go fitlha kwa bofelong, e seng go le fetolela fela. Go bona se leano lengwe le lengwe le se akaretsang, bula tsebe ya ditlhwatlhwa.",
            ],
          },
          {
            id: "languages",
            q: "Lo dirisa dipuo dife?",
            a: [
              "Gadit e dira ka dipuo di le 41, go akaretsa Sekgoa, Sehebera, Searabia, Sesepanishe, Sefora, Sejeremane, Serashia, Setšhaena, Sejapane, Sehindi, Sezulu, Sexhosa le Seaforikanse.",
              "O ka batla lefoko ka nngwe ya dipuo tse mme o bone ditlhaloso, dikai le sengwe le sengwe se sengwe ka puo e o e tlhophileng ya tiriso. Sehebera, Searabia le Sepereshia di balwa go tswa mojeng go ya molemeng, ka mekwalo ya tsone. Go fetola, tobetsa konopo ya puo kwa godimo ga tsebe nngwe le nngwe.",
            ],
          },
          {
            id: "kid-safety",
            q: "A Gadit e babalesegile mo baneng?",
            a: [
              "Gadit e diretswe gore motsadi a e dirise ka polokesego mmogo le ngwana. Mokgwa wa bana o dira ditlhaloso tse di bonolo, tse di tlhamaletseng, tse di tshwanetseng dingwaga (ka nna maemo a dingwaga di le 5 go ya go 10), o dirisa enjene e e tshwanang e e dirang dikagare tsa bagolo ka ditaelo tse di tlhamaletseng tsa go nolofatsa. Ga go na dikagare tse di kwadilweng ke badirisi tse di bontshiwang bana.",
              "Go ya ka dipholisi tsa rona le melao ya sephiri sa bana mo lefatsheng lotlhe, akhaonto ya gago a le esi ke ya dingwaga di le 13 le go feta. Bana ba dirisa Gadit ka motsadi: mo leanong la Family motsadi o oketsa ngwana mongwe le mongwe go tswa mo tsebeng ya Family, ngwana mongwe le mongwe o bona lefelo la gagwe le Mokgwa wa bana, mme lebota la batsadi le bontsha mafoko a ngwana mongwe le mongwe a a batlang. Go simolola, simolola ka Family mo tsebeng ya ditlhwatlhwa.",
            ],
          },
          {
            id: "data",
            q: "Tshedimosetso ya me e bolokwa kae? A lo a e rekisa?",
            a: [
              "Akhaonto, hisitori, bukana, le ditshwantsho tse di dirilweng di bolokwa ka tsela e e sireletsegileng mo Firebase, di khoutilwe mo polokelong. Ga re rekisetse ope tshedimosetso ya gago. Re abelana fela se se tlhokegang go tsamaisa Gadit (polokelo, dituelo, batlamedi ba dikagare), jaaka go tlhalositswe mo Pholising ya Sephiri.",
              "O ka phimola akhaonto ya gago nako nngwe le nngwe go tswa mo tsebeng ya Akhaonto. Go bona khopi ya bukana ya gago kgotsa tshedimosetso epe e nngwe e re e tshotseng, re kwalele go tswa mo tsebeng e.",
            ],
          },
          {
            id: "contact-direct",
            q: "Nka lo fitlhelela jang ka tlhamalalo?",
            a: [
              "Dirisa konopo ya imeile kwa tlase ga tsebe e. E ya ka tlhamalalo kwa lebokosong la setlhopha. Molaetsa mongwe le mongwe o a balwa mme o bona karabo mo diureng di le 24 go ya go 48 (gantsi ka bonako go feta).",
              "Imeile e botoka go feta puisano ya chat mo thusong: e naya setlhopha sebaka sa go bala ka kelotlhoko le go araba sentle. Thuso ka mogala ga e ise e nne teng.",
            ],
          },
        ],
      },
    ],
  },
  st: {
    eyebrow: "Setsi sa Thuso",
    heading: "Fumana karabo, kapele",
    lede: "Dipotso tse tlwaelehileng le ditharollo mohato ka mohato, di hlophisitswe ka dikarolo. Haeba o sa bone bothata ba hao, ikopanye le sehlopha ka tlase.",
    stillNeedHelpHeading: "O ntse o thatafallwa?",
    stillNeedHelpBody: "Re ngolle ka kotloloho. Molaetsa o mong le o mong o balwa ke sehlopha mme hangata o fumana karabo nakong ya letsatsi kapa a mabedi.",
    emailCta: "Re romele imeile",
    responseTime: "Karabo e tlwaelehileng: nakong ya dihora tse 24 ho isa ho tse 48.",
    categories: [
      {
        id: "billing",
        icon: "💳",
        title: "Ditefo le ngodiso",
        items: [
          {
            id: "change-card",
            q: "Nka fetola karete ya mokitlane ngodisong ya ka jwang?",
            a: [
              "O ka fetohela karete e ntjha ka nako e ka tlase ho motsotso ntle le ho emisa. Ngodiso ya hao ya hajwale e tswela pele, empa ka karete e ntjha.",
              "1. Kena ho gadit.app mme o bule \"Akhaonte\" ho menu ya akhaonte. 2. Tobetsa \"Laola ditefo\". 3. Leqephe le sireletsehileng la Stripe le a buleha. Kenya karete e ntjha e le mokgwa wa tefo mme o e tshwaye e le ya kamehla. 4. Ha o rata, tlosa karete ya kgale.",
              "Ho tloha nakong e latelang ya tefo, tsohle di ya kareteng e ntjha. Tefo e fetileng, e seng e nkuwe, e dula kareteng ya kgale. Ha ho hlokahale ho kgutliswa tjhelete ntle le haeba o e batla ka ho kgetheha.",
            ],
          },
          {
            id: "cancel",
            q: "Nka emisa ngodiso ya ka jwang?",
            a: [
              "O iketsetsa yona, nako efe kapa efe. Kena, bula Akhaonte, mme o tobetse ho emisa ngodiso tlasa leano la hao.",
              "Na o rekile ngodiso ya hao ho app ya iPhone kapa iPad? E emise ho disetting tsa ngodiso tsa Apple. Lehokela la \"Laola ngodiso ya hao\" leqepheng la hao la Akhaonte le o isa moo.",
              "Ha o na le ngodiso eo o e lefellang, phihlello ya hao e tswela pele ho fihlela qetellong ya nako eo o seng o e lefetse. Ka mora moo akhaonte e fetohela ho Basic, mahala. Mantswe ao o a bolokileng le nalane di dula di bolokehile.",
              "Nakong ya teko ya mahala ya matsatsi a 14, ho emisa ho fedisa teko hang hang mme ha ho na tefo. Haeba o tshwenyeha feela ka tefo e iketsahallang, kgetha lebaka leo fensetereng ya ho emisa, mme o ka tima ntjhafatso, wa boloka teko ho fihlela letsatsing la yona la ho qetela.",
              "Haeba o emisitse ngodiso eo o e lefellang ka phoso kapa o fetola mohopolo, o ka e tswela pele leqepheng lona leo pele nako e fela.",
            ],
          },
          {
            id: "switch-plan",
            q: "Nka fetoha jwang pakeng tsa Individual le Family?",
            a: [
              "Ho fetohela ho Family, bula leqephe la hao la Akhaonte mme o tobetse \"Fetohela ho Family\". Ngodiso ya hao ya hajwale e ntjhafatswa karete e tshwanang, ntle le ho e kenya hape.",
              "Stripe e bala phapang bakeng sa matsatsi a setseng nakong ya hajwale, kahoo o lefa phapang feela. Ho fetoha ho tloha ho Family ho ya ho Individual, re ngolle ho tswa leqepheng lena, mme sehlopha se tla o fetolela.",
            ],
          },
          {
            id: "invoice",
            q: "Nka jarolla invoice kapa rasiti jwang?",
            a: [
              "Akhaonte, ebe Laola ditefo, ebe Invoice history. Tefo e nngwe le e nngwe e na le rasiti ya PDF e ka jarollwang e nang le dintlha tsa tefo tseo o di bolokileng.",
              "Haeba o hloka lebitso, aterese, kapa nomoro ya lekgetho e fapaneng ho invoice (mohlala lebitso la khampani bakeng sa lekgetho), ntjhafatsa dintlha tsa hao tsa tefo leqepheng lona leo pele o jarolla. Rasiti e latelang e tla sebedisa dintlha tse ntjha.",
            ],
          },
          {
            id: "portal-error",
            q: "Ke tobeditse Laola ditefo empa ka fumana phoso. Ke etse eng jwale?",
            a: [
              "Ho na le disosa tse pedi tse tlwaelehileng. Ya pele, akhaonte ya hao ha e na ngodiso ya Stripe e sebetsang. Ya bobedi, Stripe e kanna ya se be le profaele e felletseng ya tefo bakeng sa akhaonte ya hao hajwale.",
              "Tlhahlobo ya pele e bonolo: tswa, o kene hape ka imeile eo o e sebedisitseng ha o lefa, mme o leke hape. Haeba e ntse e hloleha, ikopanye le rona ka imeile ya akhaonte ya hao mme sehlopha se tla e lokisa ka motsotso.",
            ],
          },
          {
            id: "autorenew",
            q: "Na ngodiso ya ka e tla ntjhafala ka bo yona?",
            a: [
              "E. Merero ya kgwedi e ntjhafala kgwedi le kgwedi, merero ya selemo e ntjhafala selemo le selemo ka letsatsi lona leo. O ka bona letsatsi la tefo e latelang akhaonteng ya hao le portal ya Stripe.",
              "Haeba o sa batle hore e ntjhafale ka bo yona, emisa nako efe kapa efe pele ho letsatsi la ntjhafatso. Ho emisa hase hang hang. O ntse o kena ho fihlela qetellong ya nako eo o seng o e lefetse.",
            ],
          },
          {
            id: "refund",
            q: "Na nka kgutlisetswa tjhelete?",
            a: [
              "E. Haeba theko e entswe nakong e ka tlase ho matsatsi a 14 mme tshebeletso e sa sebediswa haholo, re ngolle ka imeile ya akhaonte ya hao le molaetsa o mokgutshwane wa hore hobaneng. Ho kgutlisa tjhelete hoo ho dumellwa ntle le ngangisano.",
              "Haeba ho fetile matsatsi a 14, sehlopha se sheba taba ka nngwe ka nngwe. Emisa ngodiso hore e se ke ya tswela pele ho ntjhafala, mme o re romele imeile.",
            ],
          },
          {
            id: "unknown-charge",
            q: "Tefo ena kareteng ya ka ke eng?",
            a: [
              "Ditefo di hlaha e le GADIT kapa GADIT.APP. Tjhelete e tshwana le leano la hao (Individual kapa Family, ka kgwedi kapa ka selemo) ka tjhelete ya naha ya hao, jwalo ka ha ho bontshitswe leqepheng la ditheko. Dingodiso tse qadileng pele ho Mphalane 2026 di boloka theko eo di qadileng ka yona. Haeba tjhelete e sa tshwane, e ka nna ya ba ya tshebeletso e nngwe.",
              "Haeba o na le bonnete ba hore hase ya hao, o se ke wa e hanyetsa bankeng ya hao hajwale. Re ngolle pele ka kotloloho ka letsatsi le tjhelete. Sehlopha se tla e fumana, se hlalose hore ke eng, mme se kgutlise tjhelete ha ho hlokahala. Kganetso ya banka e ka thatafatsa ditefo tsa nakong e tlang, kahoo ho e rarolla ka thuso ya rona hangata ho potlakile ebile ho bolokehile haholwanyane.",
            ],
          },
          {
            id: "failed-payment",
            q: "Tefo ya ka e hlolehile. Ke lokela ho etsa eng?",
            a: [
              "Stripe e leka hape ditefo tse hlolehileng ka bo yona ka makgetlo a mmalwa matsatsing a latelang. Boholo ba ho hloleha ho a itokisa ha banka e lokolla thibelo kapa karete e na le tjhelete e lekaneng.",
              "Bareng e hodimo ho leqephe ho tla hlaha molaetsa o reng tefo ha e a feta, mme phihlello ya hao e bolokwa matsatsi a seng makae hape. Tobetsa \"Ntjhafatsa karete\" moo, kenya karete e sebetsang, mme re tla leka tefo hang hang ka yona. Haeba ngodiso ya hao e se e fetetse ho Basic, o ka ngodisa hape leqepheng la Ditheko mme bukana ya hao e dula e le teng.",
            ],
          },
          {
            id: "plan-comparison",
            q: "Phapang ke efe pakeng tsa Basic, Individual le Family?",
            a: [
              "Basic (mahala): ho fihla ho dipatlo tse 10 tsa mantswe ka letsatsi, meelelo yohle, mehlala, dikapolelo, tshimoloho ya lentswe, moelelo o nepahetseng ho ya ka polelo, le bukana ya ho fihla ho mantswe a 30.",
              "Individual: motho a le mong, disebediswa tsohle tsa ho ithuta. Dipatlo tse sa lekanyetswang, setshwantsho bakeng sa moelelo o mong le o mong, mehlala le dipotso tse ngata ka lentswe ka leng, Ngola polelo mme o fumane maikutlo, Lentswe ka Leng, E bue, lentswe la tlhaho la ho balla hodimo le ho batla ka lentswe, tshebediso ntle le inthanete, dipapadi, dipotso le dintwa tsa mantswe, le boikwetliso bo bohlale ka boitokisetso ba teko le qolotso.",
              "Family: tsohle tse ho Individual bakeng sa bana ba fihlang ho ba 5 le batswadi, hammoho le Mokgwa wa bana, sebaka sa hae bakeng sa ngwana e mong le e mong, thuso ka mosebetsi wa sekolo, le leqephe la taolo la motswadi le tsebiso bakeng sa lentswe ka leng. Dikolo di na le leano la tsona. Ditheko tsa naha ya hao le teko ya mahala ya matsatsi a 14 di leqepheng la ditheko.",
            ],
          },
        ],
      },
      {
        id: "account",
        icon: "👤",
        title: "Akhaonte le ho kena",
        items: [
          {
            id: "no-verification-email",
            q: "Ha ke a fumana imeile ya netefatso",
            a: [
              "Sheba pele difoldareng tsa spam le tsa dipapatso. Ka nako e nngwe Gmail le Outlook di isa diimeile tsa akhaonte moo ho fihlela o tshwaya e nngwe e le \"Not spam\".",
              "Haeba e le sieo moo, imeile e kanna ya ba e ngotswe hampe ha o ngodisa. Leka ho ngodisa hape mme o hlahlobe aterese habedi. Haeba o ngodisitse ka Google, ha ho hlokahale imeile ya netefatso.",
            ],
          },
          {
            id: "forgot-password",
            q: "Ke lebetse phasewete ya ka",
            a: [
              "Fensetereng ya ho kena, thaepe imeile ya hao, ebe o tobetsa \"O lebetse phasewete?\". Lehokela la ho seta botjha hangata le fihla inbox ya hao nakong ya motsotso kapa e mmedi. O ka boela wa tobetsa \"Nthomele lehokela la ho kena ka imeile\" mme wa kena ntle le phasewete.",
              "Haeba imeile e sa fihle, sheba spam. Haeba e ntse e sa fihle, mohlomong o ngodisitse ka Google ho ena le imeile le phasewete. Leka konopo ya \"Tswela pele ka Google\".",
            ],
          },
          {
            id: "wrong-credentials",
            q: "Phasewete ya ka e nepahetse, empa e re imeile le phasewete ha di tsamaisane",
            a: [
              "Dintho tse tharo tsa ho hlahloba. Ya pele, Caps Lock. Ya bobedi, sebaka se eketsehileng qetellong ka mora ho kopitsa le ho kgomaretsa. Ya boraro, mohlomong o ngodisitse ka Google ho ena le phasewete, sebedisa \"Tswela pele ka Google\".",
              "O ntse o thatafallwa? Molaetseng wona oo, tobetsa \"Nthomele lehokela la ho kena ka imeile\" hore o kene ntle le phasewete, kapa \"Kgetha phasewete e ntjha\".",
            ],
          },
          {
            id: "google-fails",
            q: "Ho kena ka Google ha ho sebetse",
            a: [
              "Ka hare ho di-app tse kang Instagram, Facebook kapa TikTok, konopo ya Google e patilwe. Bula lehokela sebading sa hao se tlwaelehileng, kapa o kene ka imeile ya hao. Haeba o kene ka Google, thaepe imeile eo mme o tobetse \"Nthomele lehokela la ho kena ka imeile\".",
              "Ka fensetereng ya sephiri, blocked cookies di ka emisa ho kena ka Google, kahoo leka fensetere e tlwaelehileng.",
            ],
          },
          {
            id: "change-email",
            q: "Nka fetola imeile ya akhaonte ya ka jwang?",
            a: [
              "Ho fetola imeile ya akhaonte ya hao ho etswa ke sehlopha. Re romelle imeile ho tswa atereseng ya hao ya jwale mme o ngole aterese e ntjha molaetseng. Sehlopha se tla e ntjhafatsa, mme ngodiso ya hao, nalane le bukana di tla sala di le jwalo.",
            ],
          },
          {
            id: "delete-account",
            q: "Nka hlakola akhaonte ya ka jwang?",
            a: [
              "Botlaseng ba leqephe la \"Akhaonte\", tobetsa \"Hlakola akhaonte\" mme o thaepe imeile ya akhaonte ya hao ho netefatsa. Sena ke sa ka ho sa feleng, ngodiso ya hao e a emiswa, bukana le nalane ya hao di a hlakolwa, mme imeile e a lokollwa bakeng sa ngodiso e ntjha.",
              "Ntho e le nngwe e sa tshwaneng ke ngodiso e rekilweng ho App Store, ho hlakola akhaonte ha ho e emise, kahoo e emise pele ho disetting tsa hao tsa dingodiso tsa Apple.",
              "Direkoto tsa ditefiso tse fetileng di a sala, hobane molao o re qobella ho di boloka bakeng sa tsa ditjhelete.",
            ],
          },
          {
            id: "share-account",
            q: "Na molekane wa ka kapa ngwana wa ka a ka arolelana akhaonte ya ka?",
            a: [
              "Akhaonte ka nngwe e na le motho a le mong ya keneng ka nako. Bakeng sa lelapa, leano la Family le etseditswe sena: ho fihla ho bana ba 5 le batswadi, e mong le e mong a na le sebaka sa hae, bukana ya hae le tswelopele ya hae, hammoho le Mokgwa wa bana bakeng sa bana le leqephe la taolo la motswadi.",
              "Bakeng sa motho e moholo a le mong a le mong, Individual e sebeletsa motho a le mong ka disebediswa tsohle tsa ho ithuta. Bapisa maano le ditheko tsa naha ya hao leqepheng la ditheko.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "Ke nahana hore ke na le diakhaonte tse pedi ka phoso. Ke etse eng jwale?",
            a: [
              "Hangata sena se etsahala ha motho a ngodisa hang ka Google le hang ka imeile le phasewete a sebedisa aterese e le nngwe, kapa ha o ngodisa habedi ka diaterese tsa imeile tse fapaneng. Ngodiso e nngwe le e nngwe e etsa akhaonte e arohileng ya Gadit e nang le bukana ya yona, nalane, le boemo ba ngodiso.",
              "Re romelle imeile o sebedisa e nngwe ya diaterese tseo tse pedi, mme o ngole aterese e nngwe le hore na o batla ho boloka akhaonte efe. Sehlopha se tla kopanya dibukana le nalane ho akhaonte eo o e kgethang, ebe se kwala e nngwe ka hloko. Ha ho na dintlha tse lahlehang.",
            ],
          },
        ],
      },
      {
        id: "product",
        icon: "🔍",
        title: "Ho sebedisa Gadit",
        items: [
          {
            id: "wrong-definition",
            q: "Ke nahana hore tlhaloso e fosahetse. Ke etse eng?",
            a: [
              "Haufi le moelelo o mong le o mong, le dikareteng tsa maele le tshimoloho ya lentswe, ho na le letshwao le lenyenyane la folaga. Le tobetse, kgetha se sa nepahalang, mme ha o rata o kenye le molaetsa o mokgutshwane. E fihla ka kotloloho ho sehlopha, mme tlaleho e nngwe le e nngwe e a hlahlojwa.",
              "O se ke wa tshwenyeha ka ho ba ya batlisisang haholo. Bukantswe e ntlafala ka maikutlo ana kapele ho feta ka eng kapa eng e nngwe.",
            ],
          },
          {
            id: "kids-not-working",
            q: "Mokgwa wa bana ha o fetole tlhaloso",
            a: [
              "Mokgwa wa bana o fetola sengolwa feela moo lentswe le seng le na le tlhaloso e loketseng bana. Bakeng sa lentswe leo o sa tswang ho le batla lekgetlo la pele, e fe metsotswana e 10 ho isa ho e 15 ha tlhaloso ya bana e ntse e lokiswa.",
              "Mokgwa wa bana ke karolo ya leano la Family. Ho Individual o tla bona switch ya \"Ka mantswe a bonolo\" ho e na le yona, e fanang ka tlhaloso e bonolo ho feta bakeng sa moelelo ka mong. Ho Basic kapa ntle le akhaonte ha ho na switch. Ba ngodisitseng ho Clear kapa Deep pele ho Mphalane 2026 ba boloka Mokgwa wa bana. Ho e fumana, sheba Family leqepheng la ditheko.",
            ],
          },
          {
            id: "voice-fails",
            q: "Ho batla ka lentswe ha ho sebetse",
            a: [
              "Ho batla ka lentswe ho hloka tumello ya maekrofounu. Dibadi tse ngata di botsa hang bakeng sa saete ka nngwe. Haeba o e thibetse ka phoso, tobetsa letshwao le haufi le gadit.app bareng ya aterese mme o dumelle maekrofounu ditumellong tsa saete.",
              "Ho iPhone le iPad, boela o dumelle maekrofounu bakeng sa Safari ho app ya Settings ya sesebediswa. Ho batla ka lentswe ke karolo ya maano a Individual le Family, kahoo ho Basic le ntle le akhaonte konopo ya maekrofounu ha e hlahe. Ho ntlafatsa, bula leqephe la ditheko.",
            ],
          },
          {
            id: "no-image",
            q: "Ha ke kgone ho fumana setshwantsho sa lentswe",
            a: [
              "Ditshwantsho ke karolo ya maano a Individual le Family, ka ditshwantsho tse ntjha tse ka fihlang ho 100 ka kgwedi. Setshwantsho se seng se le teng bakeng sa moelelo oo se a buleha ntle le ho balwa. Leano la kgale la Clear le na le tse 30 ka kgwedi, mme Basic ha e na ditshwantsho. Ha ditshwantsho tsa kgwedi di fedile o tla bona tsebiso, mme palo e qala botjha qalong ya kgwedi ka nngwe.",
              "Haeba o ka tlase ho moeli mme o ntse o bona ho hloleha, hangata ke ha nakwana. Leka hape ka mora metsotswana e 30. Ho hloleha ho phehellang ke phoso. Ka kopo tlaleha leqepheng la lentswe.",
            ],
          },
          {
            id: "save-word",
            q: "Nka boloka lentswe bukaneng ya ka jwang?",
            a: [
              "Ha ho hlokahale. Ha o kene, lentswe ka leng leo o le batlang le bolokwa bukaneng ya hao ka bo lona. Ho Basic bukana e tshwara ho fihla ho mantswe a 30. Ho Individual le Family ha e na moeli mme e na le boikwetliso bo bohlale, bo kgutlisang mantswe a hao hore o a phete ka nako e nepahetseng.",
              "Ho Individual le Family, mantswe ao o a batlang a boetse a bolokwa sesebedisweng sa hao, kahoo a buleha ntle le inthanete. Ho bona mantswe a hao, bula bukana ho tswa lenaneng.",
            ],
          },
          {
            id: "offline",
            q: "Nka sebedisa Gadit ntle le inthanete jwang?",
            a: [
              "Tshebediso ntle le inthanete ke karolo ya maano a Individual le Family. Lentswe ka leng leo o le batlang le bolokwa sesebedisweng sa hao, kahoo le buleha hape hang hang ntle le inthanete. O ka boela wa tobetsa \"Jarolla sephutheloana sa ntle le inthanete\" leqepheng la hao la \"Akhaonte\" ho boloka mantswe a bukantswe ya rona ka puo ya hao sesebedisweng sena.",
              "Ho batla lentswe le letjha ka ho felletseng ho ntse ho hloka kgokelo, hobane Gadit e tlameha ho lokisa sephetho se felletseng bakeng sa lona. Kopi ya ntle le inthanete e akaretsa mantswe a seng a le sesebedisweng sa hao. Haeba o ho Basic, sheba maano leqepheng la ditheko.",
            ],
          },
          {
            id: "slow",
            q: "App e utlwahala e lieha",
            a: [
              "Patlo ya pele ya lentswe ke yona e liehang ka ho fetisisa hobane Gadit e etsa sephetho se felletseng ho tloha qalong: hangata metsotswana e mmalwa, ka nako e nngwe ho feta bakeng sa mantswe a rarahaneng. Dipatlo tse latelang tsa lentswe lona leo di potlakile hang hang, di tswa polokelong.",
              "Haeba tsohle di utlwahala di lieha, leka ho nchafatsa ka matla: Cmd+Shift+R ho Mac, Ctrl+Shift+R ho Windows. Haeba ho lieha ho tswela pele maqepheng ohle, ka kopo re romele imeile ka naha ya hao le sebadi sa hao hore sehlopha se hlahlobe tsela ya marangrang ho ya diseva tsa rona ho tswa sebakeng sa hao.",
            ],
          },
          {
            id: "word-not-found",
            q: "Ke batlile lentswe mme ha ke a fumana sephetho. Ho etsahalang?",
            a: [
              "Pele, hlahloba mopeleto. Haeba ho bile le phoso ya ho thaepa, Gadit hangata e bontsha lentswe le lokisitsweng, ka lehokela la ho batla seo o se thaepileng leha ho le jwalo.",
              "Mantswe a sa tlwaelehang haholo kapa a puo ya seterata ha se ka mehla a fumanang sephetho. Haeba o na le bonnete ba hore lentswe le teng, re ngolle ho tswa leqepheng lena mme sehlopha se tla hlahloba.",
            ],
          },
          {
            id: "change-language",
            q: "Nka fetola puo ya sebopeho jwang?",
            a: [
              "Hodimo ho leqephe ho na le letshwao la lefatshe le nang le puo ya hao ya hajwale. Le tobetse mme o kgethe puo.",
              "Kgetho ya hao e bolokwa sesebedisweng sena. Tsohle di laela hape ka puo e ntjha: sebopeho, manane, ditlhaloso tsa mantswe tse tlang, mehlala, ditlhaloso tsa bana, esita le tshimoloho ya lentswe. Mantswe ao o seng o a batlile ka puo ya kgale a tla bontshwa ka yona ho fihlela o a batla hape.",
            ],
          },
        ],
      },
      {
        id: "partner",
        icon: "🤝",
        title: "Lenaneo la balekane",
        items: [
          {
            id: "join-partner",
            q: "Nka ba molekane wa Gadit jwang?",
            a: [
              "Eya ho gadit.app/partners mme o tobetse \"Kena mahala\". Kenya lebitso la hao le imeile, ebe o tobetsa \"Mphe khoutu ya ka ya molekane\". Lehokela la hao la botho le leqephe la hao la taolo la molekane, le nang le ho tobetsa le dikhomishene, di ba teng hanghang, ntle le ho emela tumello. Khoutu le lehokela di boetse di romelwa ka imeile.",
              "Ho kena ke mahala mme ho bulehetse bohle. Ha o hloke ngodiso ya Gadit ho ba molekane.",
            ],
          },
          {
            id: "commission-model",
            q: "Dikhomishene di balwa jwang?",
            a: [
              "Dipehelo tse tlwaelehileng ke 25% ya tefo e nngwe le e nngwe eo moreki a e etsang selemong sa hae sa pele. Ka mora selemo seo sa pele, o fumana 10% ya tefo e nngwe le e nngwe ha feela moreki a ntse a lefa. Ha o tlisa bareki ba 5 ba lefang, kabelo ya hao ka mora selemo sa pele e nyolohela ho 15% ka ho sa feleng.",
              "Sena se sebetsa ka tsela e tshwanang bakeng sa merero ya kgwedi le ya selemo, hobane khomishene e balwa tefong e nngwe le e nngwe ya nnete. Haeba moreki a hlakola, khomishene ya hao e emisa ka tefo ya hae ya ho qetela.",
              "Sehlopha se ka beha ditekanyetso tse fapaneng bakeng sa balekane ba itseng. Ditekanyetso tsa hao di dula di bonahala leqepheng la hao la taolo la molekane.",
            ],
          },
          {
            id: "payout",
            q: "Ke lefuwa neng?",
            a: [
              "Hang ka kgwedi, ha tjhelete ya hao e fihla bonyaneng bo bontshitsweng leqepheng la hao la taolo la molekane. Re e romela akhaonteng ya PayPal eo o e behileng moo. Bonyane boo ke moedi wa ho qala, eseng moedi wa ho qetela. O ka fumana ho feta haholo, mme o fumana tefo hang ha o bo feta.",
              "Dikhomishene di lokollwa matsatsi a 30 ka mora tefo ya ngodiso, ho dumella nako ya ho kgutlisa tjhelete. Kahoo ngodiso ya Pherekgong e lokollwa qalong ya Hlakola mme e kena tefong ya hao e latelang hang ha tjhelete ya hao e fihla bonyaneng.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "Ke kene empa leqephe la ka la taolo ha le na letho",
            a: [
              "Dipalo di hlaha ka mora ho tobetsa ha pele lehokeleng la hao. Ho se be le letho ho bolela feela hore ha ho eso be le ya tobetsang. Eya o arolelane lehokela. Leqephe la taolo le ntjhafala hoo e batlang e le ka nako ya nnete hang ha mosebetsi o qala.",
              "Haeba o arolelane mme motho a ngodisitse empa leqephe la taolo le sa e bontshe, re ngolle ka nako e ka bang ya ngodiso mme sehlopha se tla hlahloba hore na ngodiso e tswile hokae.",
            ],
          },
          {
            id: "attribution-window",
            q: "Lehokela la ka la ho kgothaletsa le latela moeti nako e kae?",
            a: [
              "Matsatsi a mashome a tsheletseng. Ha moeti a tobetsa lehokela la hao, re beha khukhi e o tsebahatsang jwalo ka ya kgothaditseng. Haeba a ngodisa mme a ngodisetsa moralo nako efe kapa efe matsatsing a 60 a latelang (leha a ka tloha wepesaeteng mme a kgutla hamorao ka patlo ya Google), o ntse o balelwa.",
              "Ho hlakolwa ha dikhukhi: haeba moeti a hlakola dikhukhi tsa hae kapa a fetola sebadi/sesebediswa pele a ngodisa, ho balelwa ho ka lahleha. Ha ho tsela e potolohang seo, empa matsatsi a 60 ke nako e telele ha e bapiswa le mananeo a mangata a balekane.",
            ],
          },
          {
            id: "missing-commission",
            q: "Motho o ngodisitse ka lehokela la ka empa ha ke bone khomishene",
            a: [
              "Hangata ke taba ya nako. Ngodiso e hlaha leqepheng la taolo nakong ya metsotso, empa khomishene e ngolwa feela hang ha ngodiso e lefilwe ka nnete, mme seo se ka nka matsatsi haeba a le nakong ya teko ya mahala. Hlahloba hape ka mora hore nako ya teko e fele.",
              "Haeba ngodiso e lefilwe empa o ntse o sa bone khomishene ka mora dihora tse 48, re ngolle ka nako e ka bang ya ngodiso le imeile kapa lebitso le hakanyeditsweng la mongodisi, haeba o le tseba. Sehlopha se tla hlahloba hore na ngodiso e tswile hokae mme se lokise phoso efe kapa efe ka letsoho.",
            ],
          },
        ],
      },
      {
        id: "general",
        icon: "❓",
        title: "Kakaretso",
        items: [
          {
            id: "what-is-gadit",
            q: "Gadit ke eng?",
            a: [
              "Gadit e o thusa ho utlwisisa lentswe ka leng ka botlalo, eseng feela ho fumana tlhaloso ya mola o le mong. Lentswe ka leng le buleha ka meelelo yohle ya lona, mehlala ya nnete bakeng sa moelelo ka mong, dikapolelo le tshimoloho ya lentswe. Maano a lefellwang a eketsa setshwantsho bakeng sa moelelo ka mong, boikwetliso, dipapadi le tse ding, mme Family e eketsa Mokgwa wa bana le sebaka bakeng sa ngwana e mong le e mong.",
              "Gadit e sebetsa ka dipuo tse 41. Ka hare sehlopha se e bitsa ho GAD lentswe: ho utlwisisa lentswe ka botlalo, eseng feela ho le fetolela. Ho bona seo leano ka leng le se kenyeletsang, bula leqephe la ditheko.",
            ],
          },
          {
            id: "languages",
            q: "Le tshehetsa dipuo dife?",
            a: [
              "Gadit e sebetsa ka dipuo tse 41, ho kenyeletswa Senyesemane, Seheberu, Searabia, Sespanishe, Sefora, Sejeremane, Serashea, Setjhaena, Sejapane, Sehindi, Sezulu, Sexhosa le Seafrikanse.",
              "O ka batla lentswe ka efe kapa efe ya dipuo tsena mme o fumane meelelo, mehlala le tsohle tse ding ka puo eo o e kgethileng bakeng sa sebopeho. Seheberu, Searabia le Sepersia di balwa ho tloha ka ho le letona ho ya ho le letshehadi, ka difonte tsa tsona. Ho fetola, tobetsa konopo ya puo hodimo leqepheng lefe kapa lefe.",
            ],
          },
          {
            id: "kid-safety",
            q: "Na Gadit e bolokehile bakeng sa bana?",
            a: [
              "Gadit e etseditswe hore motswadi a e sebedise ka polokeho hammoho le ngwana. Mokgwa wa bana o etsa ditlhaloso tse bonolo, tse hlakileng, le tse loketseng dilemo (hoo e ka bang boemong ba dilemo tse 5 ho isa ho tse 10), o sebedisa enjene e tshwanang e etsang dikahare tsa batho ba baholo ka ditaelo tse hlakileng tsa ho nolofatsa. Ha ho dikahare tse etswang ke basebedisi tse kileng tsa bontshwa bana.",
              "Ho ya ka maano a rona le melao ya lekunutu la bana lefatsheng ka bophara, akhaonte ya hao o le mong ke ya dilemo tse 13 le ho feta. Bana ba sebedisa Gadit ka motswadi: leanong la Family motswadi o eketsa ngwana e mong le e mong ho tswa leqepheng la Family, ngwana e mong le e mong o fumana sebaka sa hae le Mokgwa wa bana, mme leqephe la taolo la motswadi le bontsha mantswe ao ngwana e mong le e mong a a batlang. Ho qala, qala ka Family leqepheng la ditheko.",
            ],
          },
          {
            id: "data",
            q: "Dintlha tsa ka di bolokwa kae? Na le a di rekisa?",
            a: [
              "Akhaonte, nalane, bukana, le ditshwantsho tse entsweng di bolokwa ka polokeho ho Firebase, di notletswe polokelong. Ha re rekisetse motho ofe kapa ofe dintlha tsa hao. Re arolelana feela se hlokahalang ho tsamaisa Gadit (polokelo, ditefo, bafani ba dikahare), jwalo ka ha ho hlalositswe Leanong la Lekunutu.",
              "O ka hlakola akhaonte ya hao nako efe kapa efe leqepheng la Akhaonte. Ho fumana kopi ya bukana ya hao kapa dintlha dife kapa dife tse ding tseo re di bolokileng, re ngolle ho tswa leqepheng lena.",
            ],
          },
          {
            id: "contact-direct",
            q: "Nka le fihlela ka kotloloho jwang?",
            a: [
              "Sebedisa konopo ya imeile tlase leqepheng lena. E ya ka kotloloho lebokoseng la diimeile la sehlopha. Molaetsa o mong le o mong o a balwa mme o fumana karabo nakong ya dihora tse 24 ho isa ho tse 48 (hangata kapele).",
              "Imeile e molemo ho feta moqoqo bakeng sa thuso: e fa sehlopha monyetla wa ho bala ka hloko le ho araba ka kelello. Thuso ka mohala ha e eso fumanehe.",
            ],
          },
        ],
      },
    ],
  },
  ts: {
    eyebrow: "Ndhawu ya Mpfuno",
    heading: "Kumani nhlamulo, hi ku hatlisa",
    lede: "Swivutiso leswi tolovelekeke na ndlela yo lulamisa swiphiqo goza hi goza, swi hleriwile hi swiphemu. Loko mi nga voni xiphiqo xa n'wina, vulavulani na ntlawa laha hansi.",
    stillNeedHelpHeading: "Xana ma ha khomekile?",
    stillNeedHelpBody: "Hi tsaleleni hi ku kongoma. Rungula rin'wana na rin'wana ri hlayiwa hi ntlawa naswona ri hlamuriwa hakanyingi endzhaku ka siku rin'we kumbe mambirhi.",
    emailCta: "Hi rhumeleni imeyili",
    responseTime: "Nhlamulo ya ntolovelo: endzhaku ka tiawara ta 24 ku ya eka 48.",
    categories: [
      {
        id: "billing",
        icon: "💳",
        title: "Ku hakela & mbhaliso",
        items: [
          {
            id: "change-card",
            q: "Ndzi cinca njhani khadi ra xikweleti eka mbhaliso wa mina?",
            a: [
              "Mi nga cincela eka khadi lerintshwa hi nkarhi wa le hansi ka minete handle ka ku khansela. Mbhaliso wa n'wina wa sweswi wu tshama wu ri karhi wu tirha, ntsena hi khadi lerintshwa.",
              "1. Nghenani eka gadit.app kutani mi pfula \"Akhawunti\" eka menyu ya akhawunti. 2. Thintani \"Lawula ku hakela\". 3. Tluka leri sirhelelekeke ra Stripe ri ta pfuleka. Engetelani khadi lerintshwa tanihi ndlela yo hakela kutani mi ri veka tanihi ra ntolovelo. 4. Loko mi lava, susani khadi ra khale.",
              "Ku sukela eka nkarhi lowu landzelaka wa ku hakela, hinkwaswo swi ta ya eka khadi lerintshwa. Ku hakerisiwa ka khale, loku se ku hakeriweke, ku tshama eka khadi ra khale. A ku laveki ku vuyiseriwa mali handle ka loko mi swi lava hi ku kongoma.",
            ],
          },
          {
            id: "cancel",
            q: "Ndzi khansela njhani mbhaliso wa mina?",
            a: [
              "Mi swi endla hi n'wexe, nkarhi wun'wana na wun'wana. Nghenani, pfulani Akhawunti, kutani mi thinta ku khansela mbhaliso ehansi ka pulani ya n'wina.",
              "Mi xave mbhaliso wa n'wina eka app ya iPhone kumbe iPad? Wu khanseleni eka swiyimiso swa mbhaliso swa Apple. Linki ya \"Lawula mbhaliso\" eka tluka ra n'wina ra Akhawunti yi mi yisa kwalaho.",
              "Eka mbhaliso lowu hakeriwaka, ku nghena ka n'wina ku ya emahlweni ku fikela emakumu ka nkarhi lowu mi wu hakeleke. Endzhaku ka sweswo akhawunti yi hundzukela eka Basic, ya mahala. Marito lawa mi ma hlayiseke na matimu swi tshama swi hlayisekile.",
              "Hi nkarhi wa ndzingo wa mahala wa masiku ya 14, ku khansela swi hetisa ndzingo hi ku hatlisa naswona a ku hakerisiwi nchumu. Loko leswi mi vilelisaka ku ri ntsena ku hakerisiwa hi ku tiendlela, hlawulani xivangelo xexo eka fasitere ro khansela, kutani mi nga tima ku pfuxetiwa, mi hlayisa ndzingo ku fikela siku ra wona ro hetelela.",
              "Loko mi khansela mbhaliso lowu hakeriwaka hi xihoxo kumbe mi cinca miehleketo, mi nga tlhela mi wu sungula eka tluka rero rero emahlweni ka loko nkarhi wu hela.",
            ],
          },
          {
            id: "switch-plan",
            q: "Ndzi cinca njhani exikarhi ka Individual na Family?",
            a: [
              "Ku ya eka Family, pfulani tluka ra n'wina ra Akhawunti kutani mi thinta \"Cinca u ya eka Family\". Mbhaliso wa n'wina wa sweswi wu pfuxetiwa eka khadi rero, handle ka ku ri nghenisa nakambe.",
              "Stripe yi hlayela ku hambana ka masiku lama saleke eka nkarhi wa sweswi, hikwalaho mi hakela ku hambana ntsena. Ku suka eka Family ku ya eka Individual, hi tsaleleni ku suka eka tluka leri kutani ntlawa wu ta mi cincela.",
            ],
          },
          {
            id: "invoice",
            q: "Ndzi dawuniloda njhani inivhoyisi kumbe rhisiti?",
            a: [
              "Akhawunti, kutani Lawula ku hakela, kutani \"Invoice history\". Ku hakerisiwa kun'wana na kun'wana ku na rhisiti ya PDF leyi dawunilodekaka leyi nga na vuxokoxoko bya ku hakela lebyi mi byi hlayiseke.",
              "Loko mi lava vito, adirese kumbe nomboro ya xibalo yo hambana eka inivhoyisi (xikombiso vito ra khampani hikwalaho ka xibalo), pfuxetani vuxokoxoko bya n'wina bya ku hakela eka tluka rero emahlweni ka ku dawuniloda. Rhisiti leyi landzelaka yi ta tirhisa vuxokoxoko lebyintshwa.",
            ],
          },
          {
            id: "portal-error",
            q: "Ndzi thintile Lawula ku hakela kambe ndzi kumile xihoxo. Ndzi endla yini?",
            a: [
              "Ku na swivangelo swimbirhi leswi tolovelekeke. Xo sungula, akhawunti ya n'wina a yi na mbhaliso wa Stripe lowu tirhaka. Xa vumbirhi, Stripe yi nga ha va yi nga si va na vuxokoxoko hinkwabyo bya ku hakela bya akhawunti ya n'wina.",
              "Ku kambela ko olova ko sungula: humani, nghenani nakambe hi imeyili leyi mi yi tirhiseke loko mi hakela, kutani mi ringeta nakambe. Loko swi nga si tirha, vulavulani na hina hi imeyili ya akhawunti ya n'wina kutani ntlawa wu ta swi lulamisa hi tlhelo ra hina hi minete.",
            ],
          },
          {
            id: "autorenew",
            q: "Xana mbhaliso wa mina wu ta pfuxetiwa hi ku tiendlela?",
            a: [
              "Ina. Tipulani ta n'hweti ti pfuxetiwa n'hweti yin'wana na yin'wana, tipulani ta lembe ti pfuxetiwa lembe rin'wana na rin'wana hi siku leri fanaka. Mi nga vona siku leri landzelaka ra ku hakela eka akhawunti ya n'wina na le ka phortali ya Stripe.",
              "Loko mi nga lavi ku pfuxetiwa hi ku tiendlela, khanselani nkarhi wun'wana na wun'wana emahlweni ka siku ra ku pfuxetiwa. Ku khansela a ku tirhi hi ku hatlisa. Mi ya emahlweni mi nghena ku fikela emakumu ka nkarhi lowu mi wu hakeleke.",
            ],
          },
          {
            id: "refund",
            q: "Xana ndzi nga vuyiseriwa mali?",
            a: [
              "Ina. Loko ku xava ku endliwe emahlweni ka masiku ya 14 naswona vukorhokeri byi nga tirhisiwanga ngopfu, hi tsaleleni hi imeyili ya akhawunti ya n'wina na rungula ro koma leri hlamuselaka xivangelo. Ku vuyiseriwa mali koloko ku pfumeleriwa handle ka ku lwisana.",
              "Loko ku hundze masiku yo tlula 14, ntlawa wu languta xiyimo xin'wana na xin'wana hi xoxe. Khanselani mbhaliso leswaku wu nga yi emahlweni wu pfuxetiwa, kutani mi hi rhumela imeyili.",
            ],
          },
          {
            id: "unknown-charge",
            q: "Xana ku hakerisiwa loku eka khadi ra mina i ka yini?",
            a: [
              "Ku hakerisiwa ku humelela tanihi GADIT kumbe GADIT.APP. Mali yi fambelana na pulani ya n'wina (Individual kumbe Family, hi n'hweti kumbe hi lembe) hi mali ya tiko ra n'wina, hilaha swi kombisiweke hakona eka tluka ra minxavo. Mimbhaliso leyi sunguleke emahlweni ka October 2026 yi tshama hi nxavo lowu yi sunguleke ha wona. Loko mali yi nga fambelani, swi nga ha huma eka vukorhokeri byin'wana.",
              "Loko mi tiyisile leswaku a hi ka n'wina, mi nga si kaneta hi bangi ya n'wina. Hi tsaleleni hi ku kongoma ku sungula, mi ri na siku na mali. Ntlawa wu ta ku kuma, wu hlamusela leswaku i yini, naswona wu vuyisa mali loko swi laveka. Ku kaneta hi bangi swi nga endla ku hakela ka nkarhi lowu taka ku tika, hikwalaho ku swi lulamisa hi mpfuno hi ntolovelo swa hatlisa naswona swi hlayisekile.",
            ],
          },
          {
            id: "failed-payment",
            q: "Ku hakela ka mina a ku tirhanga. Ndzi fanele ku endla yini?",
            a: [
              "Stripe yi ringeta hi ku tiendlela ku hakela loku nga tirhangiki minkarhi yi nga ri yingani eka masiku lama landzelaka. Swiphiqo swo tala swa tilulamisela hi swoxe loko bangi yi humesa ku khomiwa kumbe khadi ri tlhela ri va ni mali leyi ringaneke.",
              "Bara ehenhla ka tluka yi ta vula leswaku ku hakerisiwa a ku fambanga, naswona ku nghena ka n'wina ku hlayisiwa masiku ma nga ri mangani lama engetelekeke. Thintani \"Pfuxeta khadi\" kwalaho, nghenisani khadi leri tirhaka, kutani hi ta ringeta ku hakerisa eka rona hi ku hatlisa. Loko mbhaliso wa n'wina wu se wu hundzuke Basic, mi nga tsarisa nakambe eka tluka ra minxavo naswona buku ya n'wina ya marito yi tshama yi hlayisekile.",
            ],
          },
          {
            id: "plan-comparison",
            q: "Ku hambana ka Basic, Individual na Family i yini?",
            a: [
              "Basic (mahala): ku fika eka ku lava marito ka 10 hi siku, tinhlamuselo hinkwato, swikombiso, swivulavulelo, masungulo ya rito, nhlamuselo leyi lulameke hi ku ya hi xivulwa, na buku ya marito ya ku fika eka marito ya 30.",
              "Individual: munhu un'we, switirhisiwa hinkwaswo swo dyondza. Ku lava loku nga pimiwangiki, xifaniso eka nhlamuselo yin'wana na yin'wana, swikombiso swo tala na swivutiso hi rito rin'wana na rin'wana, ku tsala xivulwa mi kuma switsundzuxo, Rito rin'wana na rin'wana, Swi vule, rito ra ntumbuluko ro hlaya na ku lava hi rito, ku tirhisa handle ka inthanete, mitlangu, swivutiso na mimpikizano ya marito, na ku titoloveta hi vutlhari ku lunghekela xikambelo na dikiteshini.",
              "Family: hinkwaswo leswi nga eka Individual swa vana vo fika eka 5 na vatswari, ku katsa Xiyimo xa vana, ndhawu ya yena eka n'wana un'wana na un'wana, mpfuno eka ntirho wa le kaya, na dashibodo ya vatswari na xitsundzuxo eka rito rin'wana na rin'wana. Swikolo swi na pulani ya swona. Minxavo ya tiko ra n'wina na ndzingo wa mahala wa masiku ya 14 swi le tlukeni ra minxavo.",
            ],
          },
        ],
      },
      {
        id: "account",
        icon: "👤",
        title: "Akhawunti & ku nghena",
        items: [
          {
            id: "no-verification-email",
            q: "A ndzi yi kumanga imeyili yo tiyisisa",
            a: [
              "Kambelani tifolda ta spam na ta swinavelo ku sungula. Gmail na Outlook minkarhi yin'wana swi yisa timeyili ta tiakhawunti kwalaho ku fikela loko mi funga yin'we tanihi \"Not spam\".",
              "Loko yi nga ri kona, imeyili yi nga ha va yi tsariwe hi xihoxo loko mi tsarisa. Ringetani ku tsarisa nakambe mi kambela adirese kahle. Loko mi tsarise hi Google, a ku laveki imeyili yo tiyisisa.",
            ],
          },
          {
            id: "forgot-password",
            q: "Ndzi rivele phasiwedi ya mina",
            a: [
              "Eka fasitere ro nghena, thaepani imeyili ya n'wina, kutani mi thinta \"Mi rivele phasiwedi?\". Linki yo tlhela mi veka phasiwedi hi ntolovelo yi fika eka inbox ya n'wina endzhaku ka minete yin'we kumbe timbirhi. Mi nga ha tlhela mi thinta \"Ndzi rhumeleni linki yo nghena hi imeyili\" kutani mi nghena handle ka phasiwedi.",
              "Loko imeyili yi nga fiki, kambelani spam. Loko yi ya emahlweni yi nga fiki, swi nga endleka mi tsarise hi Google ematshan'weni ya imeyili na phasiwedi. Ringetani buthoni ya \"Yisa emahlweni hi Google\".",
            ],
          },
          {
            id: "wrong-credentials",
            q: "Phasiwedi ya mina yi lulamile, kambe yi ri imeyili na phasiwedi a swi fambelani",
            a: [
              "Ku na swilo swinharhu swo kambela. Xo sungula, Caps Lock. Xa vumbirhi, ndhawu leyi engetelekeke emakumu endzhaku ka ku kopa no nameka. Xa vunharhu, swi nga endleka mi tsarise hi Google ku nga ri hi phasiwedi, tirhisani \"Yisa emahlweni hi Google\" ematshan'weni ya sweswo.",
              "Xana ma ha khomekile? Eka rungula rero ro fana, thintani \"Ndzi rhumeleni linki yo nghena hi imeyili\" leswaku mi nghena handle ka phasiwedi, kumbe \"Hlawula phasiwedi leyintshwa\".",
            ],
          },
          {
            id: "google-fails",
            q: "Ku nghena hi Google a ku tirhi",
            a: [
              "Endzeni ka ti-app to tanihi Instagram, Facebook kumbe TikTok, buthoni ya Google ya fihliwa. Pfulani linki eka bulawuza ya n'wina ya ntolovelo, kumbe mi nghena hi imeyili ya n'wina. Loko mi nghene hi Google, thaepani imeyili yoleyo kutani mi thinta \"Ndzi rhumeleni linki yo nghena hi imeyili\".",
              "Eka fasitere ra private, ku siveriwa ka cookies ku nga yimisa ku nghena hi Google, hikwalaho ringetani fasitere ra ntolovelo.",
            ],
          },
          {
            id: "change-email",
            q: "Ndzi cinca njhani imeyili eka akhawunti ya mina?",
            a: [
              "Ku cinca imeyili ya akhawunti swi endliwa hi xipano. Hi rhumeleni imeyili hi adirese ya n'wina ya sweswi kutani mi tsala adirese leyintshwa eka rungula rero. Xipano xi ta yi pfuxeta, naswona mbhaliso, matimu na buku ya marito swi tshama hilaha swi nga hakona.",
            ],
          },
          {
            id: "delete-account",
            q: "Ndzi susa njhani akhawunti ya mina?",
            a: [
              "Ehansi ka tluka ra \"Akhawunti\", thintani \"Susa akhawunti\" kutani mi thaepa imeyili ya akhawunti ya n'wina leswaku mi tiyisisa. Leswi i swa masiku hinkwawo, mbhaliso wa n'wina wu khanseriwa, buku ya marito na matimu swi suriwa, naswona imeyili yi ntshunxeka leswaku yi tirhisiwa eka ku tsarisa lokuntshwa.",
              "Ku na nchumu wun'we ntsena lowu hambaneke, mbhaliso lowu xaviweke eka App Store. Ku sula akhawunti a ku wu khanseli, hikwalaho wu khanseleni ku sungula eka swiyimiso swa mbhaliso swa Apple.",
              "Rhekhodo ya ku hakerisiwa ka khale yi tshama, hikuva nawu wu hi boha ku yi hlayisa hikwalaho ka tibuku ta timali.",
            ],
          },
          {
            id: "share-account",
            q: "Xana munghana wa mina wa vutomi kumbe n'wana wa mina a nga avelana akhawunti ya mina?",
            a: [
              "Eka akhawunti yin'wana na yin'wana ku nghena munhu un'we hi nkarhi. Eka ndyangu, pulani ya Family yi endleriwe leswi: ku fika eka vana va 5 na vatswari, un'wana na un'wana a ri na ndhawu ya yena, buku ya yena ya marito na ku ya emahlweni ka yena, ku katsa Xiyimo xa vana xa vana na dashibodo ya vatswari.",
              "Eka munhu lonkulu un'we a ri yexe, Individual yi tirhela munhu un'we na switirhisiwa hinkwaswo swo dyondza. Pimanisani tipulani na minxavo ya tiko ra n'wina eka tluka ra minxavo.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "Ndzi ehleketa leswaku ndzi na tiakhawunti timbirhi hi xihoxo. Ndzi endla yini?",
            a: [
              "Leswi hi ntolovelo swi humelela loko munhu a tsarisa kan'we hi Google na kan'we hi imeyili na phasiwedi hi adirese yin'we, kumbe loko mi tsarisa kambirhi hi tiadirese ta imeyili to hambana. Ku tsarisa kun'wana na kun'wana ku endla akhawunti yo hambana ya Gadit leyi nga ni buku ya yona ya marito, matimu na xiyimo xa mbhaliso.",
              "Hi rhumeleni imeyili hi yin'we ya tiadirese leti timbirhi, kutani mi tsala adirese leyin'wana na akhawunti leyi mi lavaka ku yi hlayisa. Ntlawa wu ta hlanganisa buku ya marito na matimu eka akhawunti leyi mi yi hlawulaka, kutani wu pfala leyin'wana hi ndlela leyinene. A ku na vuxokoxoko lebyi lahlekaka.",
            ],
          },
        ],
      },
      {
        id: "product",
        icon: "🔍",
        title: "Ku tirhisa Gadit",
        items: [
          {
            id: "wrong-definition",
            q: "Ndzi ehleketa leswaku nhlamuselo yi hoxile. Ndzi endla yini?",
            a: [
              "Ekusuhi ni nhlamuselo yin'wana na yin'wana, ni le ka tikhadi ta swivulavulelo ni masungulo ya rito, ku ni xifaniso lexitsongo xa baendela. Xi thinteni, hlawulani leswi hoxeke, kutani mi engetela rungula ro koma loko mi swi lava. Swi ya hi ku kongoma eka ntlawa, naswona xiviko xin'wana na xin'wana xa kamberiwa.",
              "Mi nga vileli hi ku va mi hlawula ngopfu. Dikixinari yi antswa hi switsundzuxo leswi hi ku hatlisa ku tlula nchumu wun'wana na wun'wana.",
            ],
          },
          {
            id: "kids-not-working",
            q: "Xiyimo xa vana a xi cinci nhlamuselo",
            a: [
              "Xiyimo xa vana xi cinca tsalwa ntsena laha rito ri nga ni nhlamuselo leyi se yi lulamiseriweke vana. Eka rito leri mi ha ku ri lava ro sungula, yimelani tisekoni ta 10 ku ya eka 15 loko ku ri karhi ku lunghiseleriwa vhidiyo ra vana.",
              "Xiyimo xa vana i xiphemu xa pulani ya Family. Eka Individual mi ta vona swichi ya \"Hi marito yo olova\" ematshan'weni ya xona, leyi nyikaka nhlamuselo yo olova eka nhlamuselo yin'wana na yin'wana. Eka Basic kumbe handle ka akhawunti a ku na swichi. Lava tsariseke eka Clear kumbe Deep emahlweni ka October 2026 va tshama va ri na Xiyimo xa vana. Ku xi kuma, vonani Family eka tluka ra minxavo.",
            ],
          },
          {
            id: "voice-fails",
            q: "Ku lava hi rito a ku tirhi",
            a: [
              "Ku lava hi rito ku lava mpfumelelo wa maykrofoni. Tibulawuza to tala ti vutisa kan'we eka sayiti yin'wana na yin'wana. Loko mi yi siverile hi xihoxo, thintani ayikhoni leyi nga ekusuhi na gadit.app eka bara ya adirese kutani mi pfumelela maykrofoni eka mipfumelelo ya sayiti.",
              "Eka iPhone na iPad, mi fanele mi tlhela mi pfumelela maykrofoni eka Safari eka app ya Settings ya xitirhisiwa. Ku lava hi rito i xiphemu xa tipulani ta Individual na Family, hikwalaho eka Basic ni handle ka akhawunti buthoni ya maykrofoni a yi humeleli. Ku tlakusa, pfulani tluka ra minxavo.",
            ],
          },
          {
            id: "no-image",
            q: "A ndzi swi koti ku kuma xifaniso xa rito",
            a: [
              "Swifaniso i xiphemu xa tipulani ta Individual na Family, ku fika eka swifaniso leswintshwa swa 100 hi n'hweti. Xifaniso lexi se xi nga kona xa nhlamuselo yoleyo xi pfuleka handle ko hlayiwa. Pulani ya khale ya Clear yi na 30 hi n'hweti, naswona Basic a yi katsi swifaniso. Loko swifaniso swa n'hweti swi herile mi ta vona xitsundzuxo, naswona nhlayo yi sungula nakambe eku sunguleni ka n'hweti yin'wana na yin'wana.",
              "Loko mi nga si fika eka ndzilakano naswona ma ha vona swi nga tirhi, hi ntolovelo i xiphiqo xa nkarhinyana. Ringetani nakambe endzhaku ka tisekoni ta 30. Swiphiqo leswi tshamaka i xihoxo xa sisiteme. Hi kombela mi xi vika ku suka eka tluka ra rito.",
            ],
          },
          {
            id: "save-word",
            q: "Ndzi hlayisa njhani rito ebukwini ya mina ya marito?",
            a: [
              "A swi laveki. Loko mi nghenile, rito rin'wana na rin'wana leri mi ri lavaka ri hlayisiwa ebukwini ya marito hi ri ri ntsena. Eka Basic buku ya marito yi khoma ku fika eka marito ya 30. Eka Individual na Family a yi na ndzilakano naswona yi katsa ku titoloveta hi vutlhari, loku vuyisaka marito ya n'wina leswaku mi ma vuyelela hi nkarhi lowu faneleke.",
              "Eka Individual na Family, marito lawa mi ma lavaka ma hlayisiwa na le ka xitirhisiwa xa n'wina, hikwalaho ma pfuleka handle ka inthanete. Ku vona marito ya n'wina, pfulani buku ya marito eka menyu.",
            ],
          },
          {
            id: "offline",
            q: "Xana ku tirhisa handle ka inthanete swi tirha njhani?",
            a: [
              "Ku tirhisa handle ka inthanete i xiphemu xa tipulani ta Individual na Family. Rito rin'wana na rin'wana leri mi ri lavaka ri hlayisiwa eka xitirhisiwa xa n'wina, hikwalaho ri tlhela ri pfuleka hi ku hatlisa handle ka inthanete. Mi nga tlhela mi thinta \"Dawuniloda phakete yo tirhisa handle ka inthanete\" eka tluka ra n'wina ra \"Akhawunti\" leswaku mi hlayisa marito ya xihlamusela-marito xa hina hi ririmi ra n'wina eka xitirhisiwa lexi.",
              "Ku lava rito lerintshwa hi ku helela swa ha lava ku va ni nhlanganiso, hikuva Gadit yi fanele ku ri lunghiselela mbuyelo hinkwawo. Khopi ya handle ka inthanete yi katsa marito lama se ma nga eka xitirhisiwa xa n'wina. Loko mi ri eka Basic, langutani tipulani eka tluka ra minxavo.",
            ],
          },
          {
            id: "slow",
            q: "App yi titwa yi nonoka",
            a: [
              "Ku lava ko sungula ka rito hi kona ku nonokaka ngopfu hikuva Gadit yi endla mbuyelo hinkwawo ku sukela eku sunguleni: hi ntolovelo tisekoni ti nga ri tingani, minkarhi yin'wana ku tlula eka marito yo tika. Ku lava loku landzelaka ka rito rero i ka xihatla, ku humaka eka vuhlayiselo.",
              "Loko hinkwaswo swi titwa swi nonoka, ringetani ku pfuxeta hi matimba: Cmd+Shift+R eka Mac, Ctrl+Shift+R eka Windows. Loko ku nonoka ku ya emahlweni eka matluka hinkwawo, hi kombela mi hi rhumela imeyili mi ri na tiko na bulawuza ya n'wina leswaku ntlawa wu kambela ndlela ya netiweke ku ya eka tisevha ta hina ku suka eka xifundzha xa n'wina.",
            ],
          },
          {
            id: "word-not-found",
            q: "Ndzi lave rito kambe a ndzi kumanga mbuyelo. Ku humelela yini?",
            a: [
              "Xo sungula, kambelani mapeletelo. Loko ku ri ni xihoxo xo thaepa, Gadit hakanyingi yi kombisa rito leri lulamisiweke, ni linki yo lava leswi mi swi thaepeke hambiswiritano.",
              "Marito lama nga taliki ngopfu kumbe ya xiluva a ma vuyi mbuyelo minkarhi hinkwayo. Loko mi tiyisile leswaku rito ri kona, mi tsalela eka hina mi ri eka tluka leri, kutani ntlawa wu ta kambela.",
            ],
          },
          {
            id: "change-language",
            q: "Ndzi cinca njhani ririmi ra xitirhisiwa?",
            a: [
              "Ehenhla ka tluka ku ni ayikhoni ya globu leyi nga ni ririmi ra n'wina ra sweswi. Yi thinteni kutani mi hlawula ririmi.",
              "Leswi mi swi hlawulaka swi hlayisiwa eka xitirhisiwa lexi. Hinkwaswo swi tlhela swi layicha hi ririmi lerintshwa, xitirhisiwa, timenyu, tinhlamuselo ta marito leti taka, swikombiso, tinhlamuselo ta vana, hambi ku ri masungulo ya rito. Marito lawa mi se mi ma lavile hi ririmi ra khale ma ta tshama ma kombisa rona ku fikela loko mi tlhela mi ma lava.",
            ],
          },
        ],
      },
      {
        id: "partner",
        icon: "🤝",
        title: "Nongonoko wa vatirhisani",
        items: [
          {
            id: "join-partner",
            q: "Ndzi va njhani mutirhisani wa Gadit?",
            a: [
              "Yana eka gadit.app/partners kutani mi thinta \"Nghenani mahala\". Nghenisani vito na imeyili ya n'wina, kutani mi thinta \"Kuma khodi ya mina ya mutirhisani\". Linki ya n'wina ya munhu hi xiyexe na dashibodo ya mutirhisani, leyi nga ni ku landzelela ku thinta na tikhomixini, swi tshama swi lunghekile hi ku hatlisa, mi nga yimelanga mpfumelelo. Khodi na linki swi tlhela swi mi fika hi imeyili.",
              "Ku nghena i mahala naswona ku pfulekele un'wana na un'wana. A mi lavi mbhaliso wa Gadit leswaku mi va mutirhisani.",
            ],
          },
          {
            id: "commission-model",
            q: "Xana tikhomixini ti hlayiwa njhani?",
            a: [
              "Swipimelo swa ntolovelo i 25% ya ku hakela kun'wana na kun'wana loku muxavi a ku endlaka hi lembe ra yena ro sungula. Endzhaku ka lembe rero ro sungula, mi kuma 10% ya ku hakela kun'wana na kun'wana loko muxavi a ya emahlweni a hakela. Loko mi tisa vaxavi va 5 lava hakelaka, xiphemu xa n'wina endzhaku ka lembe ro sungula xi tlakuka xi va 15% vutomi hinkwabyo.",
              "Leswi swi tirha hi ndlela yin'we eka tipulani ta n'hweti na ta lembe, hikuva khomixini yi hlayiwa eka ku hakela kun'wana na kun'wana ka xiviri. Loko muxavi a khansela, khomixini ya n'wina yi yima eka ku hakela ka yena ko hetelela.",
              "Ntlawa wu nga veka mimpimo yo hambana eka vatirhisani vo karhi. Mimpimo ya n'wina yi tshama yi kombisiwa eka dashibodo ya n'wina ya mutirhisani.",
            ],
          },
          {
            id: "payout",
            q: "Ndzi hakeriwa rini?",
            a: [
              "Kan'we hi n'hweti, loko mali ya n'wina yi fika eka ntsengo wa le hansi lowu kombisiweke eka dashibodo ya n'wina ya mutirhisani. Hi yi rhumela eka akhawunti ya PayPal leyi mi yi vekeke kwalaho. Ntsengo wa le hansi i ndzilakano wa ku sungula, a hi wa le henhla. Mi nga kuma swo tala swinene, naswona mi amukela ku hakeriwa loko mi wu tlula.",
              "Tikhomixini ti humesiwa endzhaku ka masiku ya 30 ku sukela eka ku hakela ka mbhaliso, leswaku ku va na nkarhi wa ku vuyiseriwa mali. Hikwalaho khomixini ya mbhaliso wa Sunguti yi humesiwa eku sunguleni ka Nyenyanyana, kutani yi nghena eka ku hakeriwa ka n'wina loku landzelaka loko mali ya n'wina yi fika eka ntsengo wa le hansi.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "Ndzi nghenile kambe dashibodo ya mina a yi na nchumu",
            a: [
              "Tinhlayo ti humelela endzhaku ka ku thinta ko sungula eka linki ya n'wina. Ku pfumala nchumu swi vula ntsena leswaku a ku si va na loyi a thinteke. Yanani mi avelana linki. Dashibodo yi pfuxetiwa kwalomu ka hi nkarhi wa xiviri loko ntirho wu sungula.",
              "Loko mi avelanile naswona munhu a tsarisile kambe dashibodo yi nga swi kombisi, hi tsaleleni mi ri na nkarhi wa kwalomu ka ku tsarisa kutani ntlawa wu ta kambela laha ku tsarisa ku humaka kona.",
            ],
          },
          {
            id: "attribution-window",
            q: "Xana linki ya mina yo bumabumela yi landzelela muendzi ku ringana nkarhi muni?",
            a: [
              "Masiku ya makume ntsevu. Loko muendzi a thinta linki ya n'wina, hi veka cookie leyi mi tivisaka tanihi loyi a n'wi rhumeleke. Loko a tsarisa a hakela nkarhi wun'wana na wun'wana eka masiku ya 60 lama landzelaka (hambi a huma eka websayiti a tlhela a vuya endzhaku hi ku lava eka Google), ku hlayeriwa ka ha mi nyika.",
              "Ku sula ti-cookie: loko muendzi a sula ti-cookie ta yena kumbe a cinca bulawuza/xitirhisiwa emahlweni ka loko a tsarisa, ku hlayeriwa ku nga lahleka. A ku na ndlela yo swi papalata, kambe masiku ya 60 i nkarhi wo anama loko swi pimanisiwa na minongonoko yo tala ya vatirhisani.",
            ],
          },
          {
            id: "missing-commission",
            q: "Munhu u tsarise hi linki ya mina kambe a ndzi voni khomixini",
            a: [
              "Hakanyingi i swa nkarhi. Ku tsarisa ku humelela eka dashibodo endzhaku ka timinete, kambe khomixini yi tsariwa ntsena loko mbhaliso wu hakeriwile hakunene, leswi swi nga tekaka masiku loko va ri eka ndzingo wa mahala. Languteni nakambe endzhaku ka loko ndzingo wu herile.",
              "Loko mbhaliso wu hakeriwile kambe ma ha nga voni khomixini endzhaku ka tiawara ta 48, hi tsaleleni mi ri na nkarhi wa kwalomu ka ku tsarisa na imeyili kumbe vito ra kwalomu ra loyi a tsariseke, loko mi ri tiva. Ntlawa wu ta kambela laha ku tsarisa ku humaka kona kutani wu lulamisa ku hundza kwihi na kwihi hi voko.",
            ],
          },
        ],
      },
      {
        id: "general",
        icon: "❓",
        title: "Swa ntolovelo",
        items: [
          {
            id: "what-is-gadit",
            q: "Xana Gadit i yini?",
            a: [
              "Gadit yi mi pfuna ku twisisa rito rin'wana na rin'wana ku fikela emakumu, ku nga ri ku kuma nhlamuselo ya layini yin'we ntsena. Rito rin'wana na rin'wana ri pfuleka na tinhlamuselo ta rona hinkwato, swikombiso swa xiviri eka nhlamuselo yin'wana na yin'wana, swivulavulelo na masungulo ya rito. Tipulani leti hakeriwaka ti engetela xifaniso eka nhlamuselo yin'wana na yin'wana, ku titoloveta, mitlangu na swin'wana, naswona Family yi engetela Xiyimo xa vana na ndhawu ya n'wana un'wana na un'wana.",
              "Gadit yi tirha hi tindzimi ta 41. Endzeni ka ntlawa hi swi vitana ku GAD rito: ku twisisa rito ku fikela emakumu, ku nga ri ku ri hundzuluxela ntsena. Ku vona leswi pulani yin'wana na yin'wana yi swi katsaka, pfulani tluka ra minxavo.",
            ],
          },
          {
            id: "languages",
            q: "Xana mi seketela tindzimi tihi?",
            a: [
              "Gadit yi tirha hi tindzimi ta 41, ku katsa Xinghezi, Xiheberu, Xiarabu, Xipaniya, Xifurwa, Xijarimani, Xirhaxiya, Xichayina, Xijapani, Xihindi, Xizulu, Xixhosa na Xibunu.",
              "Mi nga lava rito hi ririmi rin'wana na rin'wana ra tindzimi teto kutani mi kuma tinhlamuselo, swikombiso na swin'wana hinkwaswo hi ririmi leri mi ri hlawuleke eka xitirhisiwa. Xiheberu, Xiarabu na Xiperesiya swi hlayiwa ku suka exineneni ku ya eximatsini, swi ri na titsalwa ta swona. Ku cinca, thintani buthoni ya ririmi ehenhla ka tluka rin'wana na rin'wana.",
            ],
          },
          {
            id: "kid-safety",
            q: "Xana Gadit yi hlayisekile eka vana?",
            a: [
              "Gadit yi endleriwe leswaku mutswari a yi tirhisa hi ndlela leyi hlayisekeke a ri na n'wana. Xiyimo xa vana xi endla tinhlamuselo to olova, leti kongomeke, leti fambelanaka na malembe (kwalomu ka xiyimo xa malembe ya 5 ku ya eka 10), hi ku tirhisa njini leyi fanaka na leyi endlaka vuxokoxoko bya vanhu lavakulu yi ri na swiletelo swo kongoma swo olovisa. A ku na vuxokoxoko lebyi tsariweke hi vatirhisi lebyi kombisiwaka vana nikatsongo.",
              "Hi ku landza tipholisi ta hina na milawu ya xihundla xa vana emisaveni hinkwayo, akhawunti ya wena hi wexe i ya malembe ya 13 ku ya ehenhla. Vana va tirhisa Gadit hi ku tirhisa mutswari: eka pulani ya Family mutswari u engetela n'wana un'wana na un'wana eka tluka ra Family, n'wana un'wana na un'wana u kuma ndhawu ya yena na Xiyimo xa vana, naswona dashibodo ya vatswari yi kombisa marito lawa n'wana un'wana na un'wana a ma lavaka. Ku swi lulamisa, sungulani hi Family eka tluka ra minxavo.",
            ],
          },
          {
            id: "data",
            q: "Xana vuxokoxoko bya mina byi hlayisiwa kwihi? Xana ma byi xavisa?",
            a: [
              "Akhawunti, matimu, buku ya marito, na swifaniso leswi endliweke swi hlayisiwa hi ndlela leyi sirhelelekeke eka Firebase, swi fihliwile hi khodi eka vuhlayiselo. A hi xavisi vuxokoxoko bya n'wina eka munhu na un'we. Hi avelana ntsena leswi lavekaka ku tirhisa Gadit (vuhlayiselo, ku hakela, vanyiki va vuxokoxoko), hilaha swi hlamuseriweke hakona eka Pholisi ya Xihundla.",
              "Mi nga susa akhawunti ya n'wina nkarhi wun'wana na wun'wana eka tluka ra Akhawunti. Ku kuma khopi ya buku ya n'wina ya marito kumbe vuxokoxoko byin'wana lebyi hi nga na byona, hi tsaleleni ku suka eka tluka leri.",
            ],
          },
          {
            id: "contact-direct",
            q: "Ndzi mi kuma njhani hi ku kongoma?",
            a: [
              "Tirhisani buthoni ya imeyili ehansi ka tluka leri. Yi kongoma eka bokisi ra timeyili ra ntlawa. Rungula rin'wana na rin'wana ri hlayiwa naswona ri hlamuriwa endzhaku ka tiawara ta 24 ku ya eka 48 (hakanyingi hi ku hatlisa).",
              "Imeyili yi antswa ku tlula bulo eka mpfuno: yi nyika ntlawa nkarhi wo hlaya hi vukheta no hlamula hi ku ehleketa. Mpfuno hi riqingho a wu si nyikiwa.",
            ],
          },
        ],
      },
    ],
  },
  ss: {
    eyebrow: "Sikhungo Selusito",
    heading: "Tfola imphendvulo, masinyane",
    lede: "Imibuto levamile netisombululo tesinyatselo ngesinyatselo, letihlelwe ngetindzawo. Uma ungayiboni inkinga yakho, xhumana nelicembu ngentasi.",
    stillNeedHelpHeading: "Usabambekile?",
    stillNeedHelpBody: "Sibhalele ngco. Wonkhe umlayeto ufundvwa licembu futsi ngokuvamile uphendvulwa ngekhatsi kwelilanga linye nobe lamabili.",
    emailCta: "Sitfumelele i-imeyili",
    responseTime: "Imphendvulo levamile: ngekhatsi kwemahora langu-24 kuya ku-48.",
    categories: [
      {
        id: "billing",
        icon: "💳",
        title: "Tinkhokhelo nekubhalisa",
        items: [
          {
            id: "change-card",
            q: "Ngilishintja njani likhadi lesikweleti ekubhaliseni kwami?",
            a: [
              "Ungashintjela kulikhadi lelisha ngaphansi kwemzuzu ngaphandle kwekukhansela. Kubhalisa kwakho kwanyalo kuchubeka, kodvwa ngelikhadi lelisha.",
              "1. Ngena ku-gadit.app bese uvula \"I-akhawunti\" kumenyu ye-akhawunti. 2. Cindzetela \"Phatsa tinkhokhelo\". 3. Kuvuleka likhasi le-Stripe lelivikelekile. Faka likhadi lelisha njengendlela yekukhokha bese ulibeka njengaleliyinhloko. 4. Uma utsandza, susa likhadi lelidzala.",
              "Kusukela emjikelezweni lolandzelako wekukhokha, konkhe kuya kulikhadi lelisha. Inkhokhelo yangaphambilini, lese ivele yakhokhwa, ihlala kulikhadi lelidzala. Akudzingeki kubuyiselwa imali ngaphandle uma uyifuna ngco.",
            ],
          },
          {
            id: "cancel",
            q: "Ngikukhansela njani kubhalisa kwami?",
            a: [
              "Utentela wena, nobe nini. Ngena, vula I-akhawunti, bese ucindzetela Khansela kubhalisa ngaphansi kwelihlelo lakho.",
              "Utsenge kubhalisa kwakho ku-app ye-iPhone nobe ye-iPad? Kukhansela ku-Apple subscription settings yakho. Lilinki lelitsi \"Phatsa kubhalisa kwakho\" ekhasini lakho le-I-akhawunti likusa khona.",
              "Kubhalisa lokukhokhelwako, kungena kwakho kuchubeka kuze kuphele sikhatsi lesuvele usikhokhele. Ngemuva kwaloko i-akhawunti ibuyela ku-Basic, mahhala. Emagama lowagcinile nemlandvo kuhlala kuphephile.",
              "Esikhatsini sekuzama samahhala semalanga langu-14, kukhansela kuphelisa kuzama khona manjalo futsi kute lokukhokhiswako. Nangabe ukhatsateke ngenkhokhelo letentekelako kuphela, khetsa leso sizatfu efasitelweni lekukhansela, bese ungacisha kuvuselela esikhundleni saloko, ugcine kuzama kuze kube lilanga lako lekugcina.",
              "Uma ukhansela kubhalisa lokukhokhelwako ngephutsa nobe ushintja umcondvo, ungakuchubekisela futsi kulelo khasi ngaphambi kwekutsi sikhatsi siphele.",
            ],
          },
          {
            id: "switch-plan",
            q: "Ngishintja njani emkhatsini we-Individual ne-Family?",
            a: [
              "Kute ushintjele ku-Family, vula likhasi lakho le-Akhawunti bese ucindzetela \"Shintjela ku-Family\". Kubhalisa kwakho kwanyalo kuvuselelwa ngelikhadi lelifanako, ngaphandle kwekulifaka futsi.",
              "I-Stripe ibala umehluko wemalanga lasele esikhatsini sanyalo, ngako ukhokha umehluko kuphela. Kute ushintje kusuka ku-Family kuya ku-Individual, sibhalele kulelikhasi futsi licembu litakushintjela.",
            ],
          },
          {
            id: "invoice",
            q: "Ngilandza njani i-invoyisi nobe lirisidi?",
            a: [
              "I-Akhawunti, bese Phatsa tinkhokhelo, bese Umlandvo wema-invoyisi. Yonkhe inkhokhelo inelirisidi le-PDF lelilandzekako lelinemininingwane yekukhokha loyigcinile.",
              "Uma udzinga libito lelehlukile, likheli, nobe inombolo yentsela ku-invoyisi (sibonelo libito lenkampani ngetinjongo tentsela), vuselela imininingwane yekukhokha kulelo khasi ngaphambi kwekulandza. Lirisidi lelilandzelako litawusebentisa imininingwane lemisha.",
            ],
          },
          {
            id: "portal-error",
            q: "Ngicindzetele Phatsa tinkhokhelo kodvwa ngatfola liphutsa. Ngentenjani nyalo?",
            a: [
              "Kunetimbangela letimbili letivamile. Kwekucala, i-akhawunti yakho ayinako kubhalisa kwe-Stripe lokusebentako. Kwesibili, i-Stripe kungenteka ingakabi naphrofayili yekukhokha lephelele ye-akhawunti yakho.",
              "Kuhlola lokulula kwekucala: phuma, ungene futsi nge-imeyili lowayisebentisa ekukhokheni, bese uphindza uzama. Uma kusehluleka, xhumana natsi une-imeyili ye-akhawunti yakho futsi licembu litakulungisa ngasohlangotsini lwetfu ngemzuzu.",
            ],
          },
          {
            id: "autorenew",
            q: "Kubhalisa kwami kutawuvuseleleka ngekwako yini?",
            a: [
              "Yebo. Emahlelo enyanga avuseleleka nyanga yonkhe, emahlelo emnyaka avuseleleka minyaka yonkhe ngelilanga lelifanako. Ungabona lilanga lekukhokha lelilandzelako ku-akhawunti yakho nasesangweni le-Stripe.",
              "Uma ungafuni kuvuselelwa ngekwako, khansela nobe nini ngaphambi kwelilanga lekuvuselela. Kukhansela akwenteki masinyane. Ugcina kungena kuze kuphele sikhatsi lesesikhokhele.",
            ],
          },
          {
            id: "refund",
            q: "Ngingabuyiselwa imali yini?",
            a: [
              "Yebo. Uma kutsenga kwenteke emalanga langaphansi kwa-14 lendlulile futsi lusito lungakasetjentiswa kakhulu, sibhalele une-imeyili ye-akhawunti yakho kanye nenchazelo lefishane yekutsi kungani. Leto timali letibuyiselwako tiyavunywa ngaphandle kwenkinga.",
              "Uma sekudlule emalanga langetulu kwa-14, licembu likubuka ngalinye ngalinye. Khansela kubhalisa kute kungachubeki nekuvuseleleka, bese usitfumelela i-imeyili.",
            ],
          },
          {
            id: "unknown-charge",
            q: "Iyini lenkhokhelo lesekhadini lami?",
            a: [
              "Tinkhokhelo tivela njenge-GADIT nobe GADIT.APP. Linani lihambisana nelihlelo lakho (Individual nobe Family, ngenyanga nobe ngemnyaka) ngemali yelive lakho, njengobe kukhonjiswe ekhasini lematengo. Kubhalisa lokwacala ngaphambi kwa-October 2026 kugcina intengo lokwacala ngayo. Uma linani lingafanani, kungenteka ivela kulolunye lusito.",
              "Uma uciniseka kutsi akusiyo yakho, ungakayiphikisi ebhange okwamanje. Sibhalele ngco kucala, usitjele lilanga nelinani lemali. Licembu litayitfola, lichaze kutsi iyini, futsi libuyisele imali uma kudzingeka. Kuphikisa ebhange kungenta tinkhokhelo letitako tibe lukhuni, ngako kuyilungisa ngelusito kuvame kusheshe futsi kuphephe kakhulu.",
            ],
          },
          {
            id: "failed-payment",
            q: "Inkhokhelo yami yehlulekile. Kufanele ngentenjani?",
            a: [
              "Stripe iphinda ngekwayo tinkhokhelo letehlulekile tikhatsi letimbalwa emalangeni lalandzelako. Kwehluleka lokunyenti kuyalungiseka ngekwako nangabe libhange likhulula kubanjwa nobe likhadi liba nemali leyenele.",
              "Kunelitjelelo etulu ekhasini lelitawutsi inkhokhelo ayikadluli, futsi kungena kwakho kugcinwa eminye imalanga lembalwa. Cindzetela \"Vuselela likhadi\" lapho, ufake likhadi lelisebentako, futsi sitawetama inkhokhelo khona lapho. Uma kubhalisa kwakho sekubuyele ku-Basic, ungabhalisa futsi ekhasini lemaNani, futsi incwadzi yakho ihlala injalo.",
            ],
          },
          {
            id: "plan-comparison",
            q: "Uyini umehluko emkhatsini we-Basic, Individual ne-Family?",
            a: [
              "Basic (mahhala): kufika kusesha emagama la-10 ngelilanga, tonkhe tinchazelo, tibonelo, tisho, imvelaphi yeligama, inchazelo lefanele ngekwemusho, kanye nencwadzi yemagama lefika emagameni langu-30.",
              "Individual: umuntfu munye, onkhe emathulusi ekufundza. Kusesha lokungapheli, sitfombe senchazelo ngayinye, tibonelo letinyenti nemibuto ngeligama ngalinye, Bhala umusho bese utfola imibono, Onkhe Emagama, Kusho, livi lemvelo lekufundza ngekuphimisela nekusesha ngekukhuluma, kusebenta ungekho ku-inthanethi, imidlalo, emakhwizi netincintiswano temagama, nekutiniketa lokuhlakaniphile nekulungiselela sivivinyo nedikiteshini.",
              "Family: konkhe lokuku-Individual kubantfwana labafika ku-5 nebatali, kanye neSimo sebantfwana, indzawo yakhe yemntfwana ngamunye, lusito ngemsebenti wasekhaya, nelibhodi lemtali nesatiso ngeligama ngalinye. Tikolo tinelihlelo lato. Ematengo elive lakho nekuzama kwamahhala kwemalanga langu-14 akhona ekhasini lematengo.",
            ],
          },
        ],
      },
      {
        id: "account",
        icon: "👤",
        title: "I-akhawunti nekungena",
        items: [
          {
            id: "no-verification-email",
            q: "Angikayitfoli i-imeyili yekucinisekisa",
            a: [
              "Hlola emafolda e-spam ne-promotions kucala. I-Gmail ne-Outlook ngaletinye tikhatsi tiyisa ema-imeyili e-akhawunti lapho kuze uphawule leyinye njenge-\"Not spam\".",
              "Uma ingekho lapho, kungenteka i-imeyili ibhalwe kabi ekubhaliseni. Zama kubhalisa futsi uhlole kahle likheli. Uma ubhalise nge-Google, akudzingeki i-imeyili yekucinisekisa.",
            ],
          },
          {
            id: "forgot-password",
            q: "Ngikhohlwe liphasiwedi lami",
            a: [
              "Efasiteleni lekungena, thayipha i-imeyili yakho, bese ucindzetela \"Ukhohlwe liphasiwedi?\". Lilinki lekusetha kabusha livamise kufika ku-inbox yakho ngekhatsi kwemzuzu munye nobe lemibili. Ungaphindze ucindzetele \"Ngitfumelele lilinki lekungena nge-imeyili\" bese ungena ngaphandle kweliphasiwedi.",
              "Uma i-imeyili ingafiki, hlola ku-spam. Uma isengafiki, kungenteka ubhalise nge-Google esikhundleni se-imeyili neliphasiwedi. Zama inkinobho letsi \"Chubeka nge-Google\".",
            ],
          },
          {
            id: "wrong-credentials",
            q: "Ngiciniseka kutsi liphasiwedi lami lilungile kodvwa kutsi \"I-imeyili nobe liphasiwedi akulungi\"",
            a: [
              "Tintfo letintsatfu tekuhlola. Kwekucala, Caps Lock. Kwesibili, sikhala lesengetiwe ekugcineni ngemva kwekukopisha nokunamatselisa. Kwesitsatfu, mhlawumbe ubhalise nge-Google kunekutsi ubhalise ngeliphasiwedi, sebentisa \"Chubeka nge-Google\" esikhundleni saloko.",
              "Usabambekile? Kulo lowomlayeto lofanako, cindzetela \"Ngitfumelele lilinki lekungena nge-imeyili\" kute ungene ngaphandle kweliphasiwedi, nobe \"Khetsa liphasiwedi lelisha\".",
            ],
          },
          {
            id: "google-fails",
            q: "Kungena nge-Google akusebenti",
            a: [
              "Ngaphakathi kuma-app lafana ne-Instagram, Facebook nobe TikTok, inkinobho ye-Google iyafihlwa. Vula lilinki ku-browser yakho lejwayelekile, nobe ungene nge-imeyili yakho. Uma wajoyina nge-Google, thayipha leyo imeyili bese ucindzetela \"Ngitfumelele lilinki lekungena nge-imeyili\".",
              "Efasiteleni leliyimfihlo, incognito, ema-cookie lavinjiwe angamisa kungena nge-Google, ngako zama lifasitelo lelijwayelekile.",
            ],
          },
          {
            id: "change-email",
            q: "Ngiyishintja njani i-imeyili ku-akhawunti yami?",
            a: [
              "Kushintja i-imeyili ye-akhawunti kwentiwa yithimba. Sitfumelele i-imeyili isuka kulelikheli lakho lamanje, bese ubhala likheli lelisha emlayetweni. Lithimba litawulivuselela, futsi kubhalisa kwakho, umlandvo nencwadzi yakho kutawuhlala kunjalo.",
            ],
          },
          {
            id: "delete-account",
            q: "Ngiyicisha njani i-akhawunti yami?",
            a: [
              "Ngentasi kwelikhasi le-Akhawunti, cindzetela \"Cisha i-akhawunti\" bese uthayipha i-imeyili ye-akhawunti yakho kute ucinisekise. Loku kwanomphela, kubhalisa kwakho kuyakhanselwa, incwadzi yakho nemlandvo kuyasulwa, futsi i-imeyili iyakhululeka kute kubhaliswe kabusha.",
              "Lokunye kuphela kubhalisa lokutsengwe ku-App Store, kucisha i-akhawunti akulukhanseli, ngako lukhanseli kucala ku-Apple subscription settings yakho.",
              "Emarekhodi etinkhokhelo tangaphambilini ayahlala, ngobe umtsetfo usibophelela kutsi siwagcine ngetinjongo tekubalwa kwemali.",
            ],
          },
          {
            id: "share-account",
            q: "Umlingani wami nobe umntfwana wami angayisebentisa nami i-akhawunti yami?",
            a: [
              "Ku-akhawunti ngayinye kungena umuntfu munye ngesikhatsi. Emndenini, lihlelo le-Family lakhelwe loku: kufika ebantfwaneni labangu-5 nebatali, ngamunye anendzawo yakhe, incwadzi yakhe nenchubekelembili yakhe, kanye neSimo sebantfwana sebantfwana nelibhodi lemtali.",
              "Kumuntfu lomdzala munye, i-Individual yentelwe umuntfu munye futsi inawo onkhe emathulusi ekufundza. Catsanisa emahlelo nematengo elive lakho ekhasini lematengo.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "Ngicabanga kutsi nginema-akhawunti lamabili ngephutsa. Ngentenjani nyalo?",
            a: [
              "Loku kuvame kwenteka nangabe umuntfu abhalisa kanye nge-Google futsi kanye nge-imeyili neliphasiwedi asebentisa likheli lelifanako, nobe nangabe ubhalisa kabili ngemakheli e-imeyili lehlukene. Kubhalisa ngakunye kudala i-akhawunti ye-Gadit lehlukile lenencwadzi yayo, umlandvo wayo, nesimo sayo sekubhalisa.",
              "Sibhalele nge-imeyili usuka kulelinye kulamakheli lamabili, futsi ubhale lelinye likheli kanye nekutsi nguyiphi i-akhawunti lofuna kuyigcina. Licembu litawuhlanganisa tincwadzi nemlandvo ku-akhawunti loyikhetsile, bese livala lenye kahle. Kute imininingwane lelahlekako.",
            ],
          },
        ],
      },
      {
        id: "product",
        icon: "🔍",
        title: "Kusebentisa Gadit",
        items: [
          {
            id: "wrong-definition",
            q: "Ngicabanga kutsi inchazelo ayilungi. Ngentenjani?",
            a: [
              "Eceleni kwayo yonkhe inchazelo, futsi nakumakhadi etaga nemvelaphi yeligama, kukhona sithonjana lesincane selifulegi. Sicindzetele, ukhetse lokungakalungi, bese ufaka liphawulo lelifisha nangabe uyatsandza. Kufika ngco elicenjini, futsi wonkhe umbiko uyabuketwa.",
              "Ungakhatsateki ngekutsi ucophelela kakhulu. Sichazamagama siba ncono ngalemibono masinyane kunanobe yini lenye.",
            ],
          },
          {
            id: "kids-not-working",
            q: "Simo sebantfwana asiyishintji inchazelo",
            a: [
              "Simo sebantfwana sishintja umbhalo kuphela lapho ligama selinenchazelo lefanele bantfwana. Eligameni losandza kulisesha kwekucala, linda imizuzwana lesuka ku-10 kuya ku-15 ngesikhatsi inchazelo yebantfwana ilungiswa.",
              "Simo sebantfwana siyincenye yelihlelo le-Family. Ku-Individual utawubona inkinobho letsi \"Ngemagama lalula\" esikhundleni saso, lenika inchazelo lelula kakhulu kuyo yonkhe inchazelo. Ku-Basic nobe ngaphandle kwe-akhawunti ayikho inkinobho. Labo lababhalisa ku-Clear nobe ku-Deep ngaphambi kwa-October 2026 bagcina Simo sebantfwana. Kute usitfole, buka i-Family ekhasini lematengo.",
            ],
          },
          {
            id: "voice-fails",
            q: "Kusesha ngelivi akusebenti",
            a: [
              "Kusesha ngelivi kudzinga imvumo ye-microphone. Ema-browser lamanyenti abuta kanye kusayithi ngalinye. Uma uyivimbe ngephutsa, cindzetela lithonjana leliseceleni kwa-gadit.app emugceni wekheli bese uvumela i-microphone etimvumeni tesayithi.",
              "Ku-iPhone naku-iPad, vuma futsi i-microphone ku-Safari kuhlelo lwe-Settings lwedivayisi. Kusesha ngelivi kuyincenye yemahlelo e-Individual ne-Family, ngako ku-Basic nangaphandle kwe-akhawunti inkinobho ye-microphone ayiveli. Kute ukhuphule, vula likhasi lematengo.",
            ],
          },
          {
            id: "no-image",
            q: "Angikhoni kutfola sitfombe saleligama",
            a: [
              "Titfombe tiyincenye yemahlelo e-Individual ne-Family, ngetitfombe letinsha letifika ku-100 ngenyanga. Sitfombe lesesikhona salenchazelo siyavuleka ngaphandle kwekubalwa. Lihlelo lelidzala le-Clear linetingu-30 ngenyanga, futsi i-Basic ayinato titfombe. Uma titfombe tenyanga setiphelile utawubona satiso, futsi kubala kucala kabusha ekucaleni kwenyanga ngayinye.",
              "Uma ungakafiki esabelweni futsi usabona kwehluleka, kuvame kuba ngulokwesikhashana. Phindza uzame ngemuva kwemizuzwana lengu-30. Kwehluleka lokuchubekako kuyinkinga yesistimu. Sicela ubike kusuka ekhasini leligama.",
            ],
          },
          {
            id: "save-word",
            q: "Ngiligcina njani ligama encwadzini yami?",
            a: [
              "Akudzingeki. Uma ungenile, ligama ngalinye loliseshako ligcinwa encwadzini yakho ngalokwalo. Ku-Basic incwadzi ingemukela emagama lafika ku-30. Ku-Individual naku-Family ayinamkhawulo futsi inekutiniketa lokuhlakaniphile, lokubuyisa emagama akho kute uwabuyeketa ngesikhatsi lesifanele.",
              "Ku-Individual naku-Family, emagama lowaseshako agcinwa nasedivayisini yakho, ngako ayavuleka ngaphandle kwe-inthanethi. Kute ubone emagama akho, vula incwadzi kumenyu.",
            ],
          },
          {
            id: "offline",
            q: "Ngiyisebentisa njani i-Gadit ngaphandle kwe-inthanethi?",
            a: [
              "Kusebentisa ngaphandle kwe-inthanethi kuyincenye yemahlelo e-Individual ne-Family. Ligama ngalinye loliseshako ligcinwa edivayisini yakho, ngako livuleka futsi masinyane ngaphandle kwe-inthanethi. Ungacindzetela futsi \"Landza liphakethe lekufundza ngaphandle kwe-inthanethi\" ekhasini lakho le-\"I-akhawunti\" kute ugcine emagama esichazimagama selulwimi lwakho kule divayisi.",
              "Kusesha ligama lelisha nya kusadzinga kuxhumana, ngobe Gadit kufanele ilungise umphumela lophelele walo. Likhophi langaphandle kwe-inthanethi lifaka emagama lasesedivayisini yakho. Uma use-Basic, buka emahlelo ekhasini lematengo.",
            ],
          },
          {
            id: "slow",
            q: "I-app ibonakala ihamba kancane",
            a: [
              "Kusesha kwekucala kweligama kuhamba kancane kakhulu ngobe Gadit idala umphumela lophelele kusukela ekucaleni: imizuzwana lembalwa kuvamile, ngaletinye tikhatsi kudze kakhulu kumagama lalukhuni. Kusesha lokulandzelako kwaleligama lelifanako kwenteka masinyane, kusuka ku-cache.",
              "Uma konkhe kuhamba kancane, zama kuvuselela ngemandla: Cmd+Shift+R ku-Mac, Ctrl+Shift+R ku-Windows. Uma kuhamba kancane kuchubeka kuwo onkhe emakhasi, sicela usitfumelele i-imeyili unelive lakho ne-browser kute licembu lihlole indlela ye-network leya kuma-server etfu kusuka esifundzeni sakho.",
            ],
          },
          {
            id: "word-not-found",
            q: "Ngiseshe ligama kodvwa angitfolanga umphumela. Kwentekani?",
            a: [
              "Kwekucala, hlola kupela. Uma kube neliphutsa lekubhala, Gadit ivamise kukhombisa ligama lelungisiwe, kanye nelilinki lekusesha loko lokubhalile noma kunjalo.",
              "Emagama langavamile kakhulu nobe esitsetselo awatfoli umphumela sonkhe sikhatsi. Uma uciniseka kutsi ligama likhona, sibhalele kulelikhasi futsi licembu litawuhlola.",
            ],
          },
          {
            id: "change-language",
            q: "Ngilushintja njani lulwimi lwesikrini?",
            a: [
              "Etulu kwelikhasi kunelithonjana lembulunga lelunelulwimi lwakho lwanyalo. Licindzetele bese ukhetsa lulwimi.",
              "Lokukhetsile kugcinwa kule divayisi. Konkhe kulayisha kabusha ngelulwimi lolusha, sikrini, ema-menyu, tinchazelo temagama lotawasesha embili, tibonelo, tinchazelo tebantfwana, ngisho nemvelaphi yeligama. Emagama losewuwaseshile ngelulwimi lwakudzala atawuchubeka avela ngalolo lulwimi uze uwaseshe futsi.",
            ],
          },
        ],
      },
      {
        id: "partner",
        icon: "🤝",
        title: "Luhlelo lwebalingani",
        items: [
          {
            id: "join-partner",
            q: "Ngiba njani ngumlingani we-Gadit?",
            a: [
              "Yani ku-gadit.app/partners bese ucindzetela \"Joyina mahhala\". Faka libito lakho ne-imeyili, bese ucindzetela \"Ngitfolele ikhodi yami yemlingani\". Lilinki lakho lemuntfu kanye nelibhodi lakho lemlingani, lelinekucindzetelwa netikhomishini, kulungele masinyane, ngaphandle kwekulindza kuvunywa. Ikhodi nelilinki nako kutfunyelwa nge-imeyili.",
              "Kujoyina kumahhala futsi kuvulekele wonkhe umuntfu. Awudzingi kubhalisa ku-Gadit kute ube ngumlingani.",
            ],
          },
          {
            id: "commission-model",
            q: "Tikhomishini tibalwa njani?",
            a: [
              "Imigomo lejwayelekile ngu-25% wayo yonkhe inkhokhelo likhasimende leliyenta emnyakeni walo wekucala. Ngemuva kwalowo mnyaka wekucala, utfola 10% wayo yonkhe inkhokhelo uma nje likhasimende lisachubeka likhokha. Uma uletsa emakhasimende la-5 lakhokhako, sabelo sakho ngemuva kwemnyaka wekucala siyakhuphuka sibe ngu-15% kuze kube phakadze.",
              "Loku kusebenta ngendlela lefanako kumahlelo enyanga nawemnyaka, ngobe ikhomishini ibalwa enkhokhelweni ngayinye yangempela. Uma likhasimende likhansela, ikhomishini yakho iyema enkhokhelweni yalo yekugcina.",
              "Licembu lingabeka emazinga lehlukene kubalingani labatsite. Emazinga akho ahlala abonakala elibhodini lakho lemlingani.",
            ],
          },
          {
            id: "payout",
            q: "Ngikhokhelwa nini?",
            a: [
              "Kanye ngenyanga, uma ibhalansi yakho ifinyelela kusayizi lomncane lokhonjisiwe elibhodini lakho lemlingani. Siyitfumela ku-akhawunti ye-PayPal loyibeke khona. Lowomncane usilinganiselo, hhayi siphetfo. Ungahola lokunyenti kakhulu, futsi utfola inkhokhelo uma sewuwedlulile.",
              "Tikhomishini tikhululwa emalanga langu-30 ngemuva kwenkhokhelo yekubhalisa, kute kube nesikhatsi sekubuyiselwa kwemali. Ngako kubhalisa kwaJanuwari kukhululwa ekucaleni kwaFebruwari futsi kungena enkhokhelweni yakho lelandzelako uma ibhalansi yakho ifinyelela kulowo mncane.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "Ngijoyinile kodvwa libhodi lami alinalutfo",
            a: [
              "Tibalo tivela ngemuva kwekucindzetelwa kwekucala kwelilinki lakho. Kungabi nalutfo kusho nje kutsi kute losalicindzetelile. Hamba wabelane ngelilinki. Libhodi liyavuseleleka cishe ngesikhathi mbamba uma sekucale kusebenta.",
              "Uma wabelene futsi umuntfu abhalisile kodvwa libhodi lingakukhombisi loko, sibhalele usitjele sikhatsi lesilinganisiwe sekubhalisa, futsi licembu litawuhlola kutsi kubhalisa kuvelaphi.",
            ],
          },
          {
            id: "attribution-window",
            q: "Lilinki lami lekuncoma lichubeka lilandzelela sivakashi sikhatsi lesingakanani?",
            a: [
              "Emalanga langu-60. Nangabe sivakashi sicindzetela lilinki lakho, sibeka i-cookie lekukhomba njengalowo locomile. Uma sibhalisa futsi sikhokha nobe nini emalangeni langu-60 latako (ngisho nangabe sishiya lisayithi bese sibuya ngemuva nge-Google), kubalwa kusakwakho.",
              "Kusulwa kwema-cookie: uma sivakashi sisula ema-cookie aso nobe sishintja i-browser/lithuluzi ngaphambi kwekubhalisa, kubalwa kungalahleka. Kute indlela yekugwema loko, kodvwa emalanga langu-60 sikhatsi lesinyenti uma kucatsaniswa nemahlelo lamanyenti ebalingani.",
            ],
          },
          {
            id: "missing-commission",
            q: "Umuntfu ubhalise ngelilinki lami kodvwa angiyiboni ikhomishini",
            a: [
              "Kuvame kuba yindzaba yesikhatsi. Kubhalisa kuvela elibhodini ngekhatsi kwemizuzu, kodvwa ikhomishini ibhalwa kuphela uma kubhalisa sekukhokhelwe ngempela, lokungaba ngemalanga latsite kamuva uma basekulingeni kwamahhala. Phindza uhlole ngemuva kwekuphela kwekulinga.",
              "Uma kubhalisa kukhokhelwe kodvwa usayiboni ikhomishini ngemuva kwemahora langu-48, sibhalele usitjele sikhatsi lesilinganisiwe sekubhalisa kanye ne-imeyili nobe libito lelinganisiwe lembhalisi, uma ulati. Licembu litawuhlola kutsi kubhalisa kuvelaphi futsi lilungise ngesandla noma nguyiphi lengekho.",
            ],
          },
        ],
      },
      {
        id: "general",
        icon: "❓",
        title: "Lokuvamile",
        items: [
          {
            id: "what-is-gadit",
            q: "Iyini Gadit?",
            a: [
              "Gadit ikusita kutsi ucondze ligama ngalinye kuze kube sekugcineni, hhayi kutfola inchazelo yemugca munye nje. Ligama ngalinye livuleka nato tonkhe tinchazelo talo, tibonelo tangempela kunchazelo ngayinye, tisho nemvelaphi yeligama. Emahlelo lakhokhelwako engeta sitfombe kunchazelo ngayinye, kuticecesha, imidlalo nalokunye, futsi i-Family yengeta Simo sebantfwana nendzawo yemntfwana ngamunye.",
              "Gadit isebenta ngetilwimi letingu-41. Ngekhatsi licembu likubita ngekutsi ku-GAD ligama: kucondza ligama kuze kube sekugcineni, hhayi kulihumusha nje. Kute ubone loko lokusehlelweni ngalinye, vula likhasi lematengo.",
            ],
          },
          {
            id: "languages",
            q: "Nisekela tiphi tilwimi?",
            a: [
              "Gadit isebenta ngetilwimi letingu-41, kufaka ekhatsi siNgisi, siHebheru, si-Arabhu, siSpanishi, siFulentshi, siJalimane, siRashiya, siShayina, siJaphani, siHindi, siZulu, siXhosa nesiBhunu.",
              "Ungasesha ligama nganobe nguluphi kuleti tilwimi futsi utfole tinchazelo, tibonelo nako konkhe lokunye ngelulwimi lolukhetsele sikrini. SiHebheru, si-Arabhu nesiPheshiya tibhalwa kusuka ngesekudla kuya ngesencele, ngemafonti ato. Kute ushintje, cindzetela inkinobho yelulwimi etulu kunobe nguliphi likhasi.",
            ],
          },
          {
            id: "kid-safety",
            q: "Gadit iphephile yini kubantfwana?",
            a: [
              "Gadit yakhelwe kutsi umtali ayisebentise ngekuphepha ahlanganyela nemntfwana. Simo sebantfwana sikhicita tinchazelo letilula, leticacile, letifanele iminyaka (cishe lizinga leminyaka lesuka ku-5 kuya ku-10), sisebentisa injini lefanako lesebentela lokucuketfwe kwebantfu labadzala kanye netinkhombandlela letibonakalako tekwenta kube lula. Kute lokucuketfwe lokubhalwe ngubasebentisi lokukhonjiswa bantfwana.",
              "Ngekuvumelana netinchubomgomo tetfu nemitsetfo yemfihlo yebantfwana emhlabeni wonkhe, i-akhawunti yakho uwedvwa ingeyalabaneminyaka leli-13 kuya etulu. Bantfwana basebentisa Gadit ngemtali: kulihlelo le-Family umtali wengeta umntfwana ngamunye ekhasini le-Family, umntfwana ngamunye utfola indzawo yakhe lenaSimo sebantfwana, futsi libhodi lemtali likhombisa emagama umntfwana ngamunye lawaseshako. Kute ucale, cala nge-Family ekhasini lematengo.",
            ],
          },
          {
            id: "data",
            q: "Imininingwane yami igcinwa kuphi? Niyayitsengisa yini?",
            a: [
              "I-akhawunti, umlandvo, incwadzi, netitfombe letidaliwe kugcinwa ngekuphepha ku-Firebase, kubetelwe ngekhodi ekugcinweni. Asiyitsengisi imininingwane yakho kunobe ngubani. Sabelana kuphela ngaloko lokudzingekako kute Gadit isebente (kugcina, tinkhokhelo, labanikela ngalokucuketfwe), njengobe kuchaziwe ku-Inchubomgomo Yemfihlo.",
              "Ungacisha i-akhawunti yakho nobe nini ekhasini le-Akhawunti. Kute utfole likhophi lencwadzi yakho nobe leminye imininingwane lesinayo, sibhalele kulelikhasi.",
            ],
          },
          {
            id: "contact-direct",
            q: "Nginitfola njani ngco?",
            a: [
              "Sebentisa inkinobho ye-imeyili ngentasi kwalelikhasi. Iya ngco ebhokisini lemiyalezo lelicembu. Wonkhe umlayeto uyafundvwa futsi uphendvulwa ngekhatsi kwemahora langu-24 kuya ku-48 (kaninyenti masinyane).",
              "I-imeyili incono kunengcoco ekutfoleni lusito: inika licembu litfuba lekufundza kahle nekuphendvula ngekucabangisisa. Lusito ngelucingo alukanikwa okwamanje.",
            ],
          },
        ],
      },
    ],
  },
  ve: {
    eyebrow: "Fhethu ha Thuso",
    heading: "Wanani phindulo, nga u ṱavhanya",
    lede: "Mbudziso dzi ḓivheaho na nḓila dza u lugisa tshiṱepe nga tshiṱepe, dzo dzudzanywa nga masia. Arali ni sa vhoni thaidzo yaṋu, kwamani tshigwada afho fhasi.",
    stillNeedHelpHeading: "Ni kha ḓi kundwa?",
    stillNeedHelpBody: "Ri ṅwaleleni. Mulaedza muṅwe na muṅwe u vhalwa nga tshigwada nahone nga tlwaelo u fhindulwa nga ḓuvha ḽithihi kana mavhili.",
    emailCta: "Ri rumeleni imeiḽi",
    responseTime: "Kanzhi ri fhindula nga awara dza 24 u swika 48.",
    categories: [
      {
        id: "billing",
        icon: "💳",
        title: "Mbadelo na ṅwaliso",
        items: [
          {
            id: "change-card",
            q: "Ndi shandukisa hani garaṱa ya tshelede ya ṅwaliso wanga?",
            a: [
              "Ni nga shandukela kha garaṱa ntswa nga fhasi ha minithi, ni sa khansele. Ṅwaliso waṋu wa zwino u bvela phanḓa u tshi shuma, fhedzi nga garaṱa ntswa.",
              "1. Dzhenani kha gadit.app ni vule \"Akhaunthu\" kha menu ya akhaunthu. 2. Kiḽikani \"Langani mbadelo\". 3. Siaṱari ḽo tsireledzeaho ḽa Stripe ḽi ḓo vulea. Engedzani garaṱa ntswa sa ndila ya mbadelo nahone ni i swaye sa ya default. 4. Arali ni tshi ṱoḓa, bvisani garaṱa ya kale.",
              "U bva kha murendelo wa mbadelo u tevhelaho, zwoṱhe zwi ḓo ya kha garaṱa ntswa. Mbadelo yo fhiraho, ye ya no kuvhanganywa kale, i dzula kha garaṱa ya kale. A hu ṱoḓei u humiselwa tshelede nga nnḓa ha musi ni tshi i ṱoḓa nga ho khetheaho.",
            ],
          },
          {
            id: "cancel",
            q: "Ndi khansela hani ṅwaliso wanga?",
            a: [
              "Ni zwi ita inwi vhaṋe, tshifhinga tshiṅwe na tshiṅwe. Dzhenani, vulani Akhaunthu, ni kwame u khansela ṅwaliso fhasi ha pulane yaṋu.",
              "No renga ṅwaliso waṋu kha app ya iPhone kana iPad? U khansela zwi iteni kha nzudzanyo dzaṋu dza ṅwaliso dza Apple. Vhukwamani ha \"Langani ṅwaliso\" kha siaṱari ḽaṋu ḽa Akhaunthu vhu ni isa henefho.",
              "Kha ṅwaliso une wa badelwa, ni dzula ni tshi dzhena u swika magumoni a tshifhinga tshe na tshi badela. Nga murahu akhaunthu i humela kha Basic, ya mahala. Maipfi aṋu o vhulungwaho na ḓivhazwakale yaṋu zwi dzula zwo tsireledzea.",
              "Tshifhingani tsha nyingo ya mahala ya maḓuvha a 14, u khansela hu fhedza nyingo nga u ṱavhanya nahone a hu na tshine tsha badelwa. Arali zwine zwa ni vhilaedzisa hu mbadelo ya othomethiki fhedzi, khethani itsho tshiitisi kha fasiṱere ḽa u khansela, nahone ni nga dzima u vusuluswa, ni tshi kha ḓiṋea nyingo u swika ḓuvha layo ḽa u fhedza.",
              "Arali na khansela ṅwaliso une wa badelwa nga vhukhakhi kana na shandula muhumbulo, ni nga u dovha na u bvela phanḓa nawo kha siaṱari ḽeneḽo phanḓa ha musi tshifhinga tshi tshi fhela.",
            ],
          },
          {
            id: "switch-plan",
            q: "Ndi shandukela hani vhukati ha Individual na Family?",
            a: [
              "U ya kha Family, vulani siaṱari ḽaṋu ḽa Akhaunthu ni kwame \"Shandukelani kha Family\". Ṅwaliso waṋu wa zwino u khwiniswa kha garaṱa yeneyo, ni sa ḓo i dzhenisa hafhu.",
              "Stripe i vhalela phambano ya maḓuvha o salaho a tshifhinga tsha zwino, nga zwenezwo ni badela phambano fhedzi. U bva kha Family u ya kha Individual, ri ṅwaleleni u bva kha siaṱari iḽi nahone tshigwada tshi ḓo ni shandukisela.",
            ],
          },
          {
            id: "invoice",
            q: "Ndi ḓaunuḽoda hani invoisi kana rasiti?",
            a: [
              "Akhaunthu, nga murahu Langani mbadelo, nga murahu Invoice history. Mbadelo iṅwe na iṅwe i na rasiti ya PDF ine ya nga ḓaunuḽodiwa i na zwidodombedzwa zwa mbadelo zwe na zwi vhulunga.",
              "Arali ni tshi ṱoḓa dzina, adiresi, kana nomboro ya muthelo yo fhambanaho kha invoisi (tsumbo, dzina ḽa khamphani u itela muthelo), vusuluseni zwidodombedzwa zwaṋu zwa mbadelo kha siaṱari ḽeneḽo phanḓa ha u ḓaunuḽoda. Rasiti i tevhelaho i ḓo shumisa zwidodombedzwa zwiswa.",
            ],
          },
          {
            id: "portal-error",
            q: "Ndo kiḽika Langani mbadelo fhedzi nda wana vhukhakhi. Ndi ite mini?",
            a: [
              "Hu na zwiitisi zwivhili zwi ḓivheaho. Tsha u thoma, akhaunthu yaṋu a i na ṅwaliso wa Stripe u khou shumaho. Tsha vhuvhili, Stripe i nga vha i si athu u vha na phrofaiḽi yo fhelelaho ya mbadelo ya akhaunthu yaṋu.",
              "Ṱhoḓisiso ya u thoma yo leluwaho: bvani, dzhenani hafhu nga imeiḽi ye na i shumisa musi ni tshi badela, ni lingedze hafhu. Arali zwi tshi kha ḓi kundelwa, ri kwameni nga imeiḽi ya akhaunthu yaṋu nahone tshigwada tshi ḓo zwi lugisa nga minithi.",
            ],
          },
          {
            id: "autorenew",
            q: "Naa ṅwaliso wanga u ḓo vusuluswa nga woṱhe?",
            a: [
              "Ee. Pulane dza nga ṅwedzi dzi vusuluswa ṅwedzi muṅwe na muṅwe, pulane dza nga ṅwaha dzi vusuluswa ṅwaha muṅwe na muṅwe nga ḓuvha ḽeneḽo. Ni nga vhona ḓuvha ḽi tevhelaho ḽa mbadelo kha akhaunthu yaṋu na kha fhethu ha Stripe.",
              "Arali ni sa ṱoḓi u vusuluswa nga woṱhe, khanselani tshifhinga tshiṅwe na tshiṅwe phanḓa ha ḓuvha ḽa u vusulusa. U khansela a zwi iteli nga u ṱavhanya. Ni dzula ni tshi dzhena u swika magumoni a tshifhinga tshe na tshi badela.",
            ],
          },
          {
            id: "refund",
            q: "Naa ndi nga humiselwa tshelede?",
            a: [
              "Ee. Arali na renga hu sa athu u fhela maḓuvha a 14 nahone tshumelo i songo shumiswa nga maanḓa, ri ṅwaleleni nga imeiḽi ya akhaunthu yaṋu na mulaedza mupfufhi wa uri ndi ngani. U humiselwa honoho hu tendelwa hu si na nndwa.",
              "Arali ho fhira maḓuvha a 14, tshigwada tshi sedza nga nḓila ya mulandu muṅwe na muṅwe. Khanselani ṅwaliso uri u si bvele phanḓa u tshi vusuluswa, ni ri rumele imeiḽi.",
            ],
          },
          {
            id: "unknown-charge",
            q: "Ndi mbadelo ifhio iyi kha garaṱa yanga?",
            a: [
              "Mbadelo dzi vhonala sa GADIT kana GADIT.APP. Tshelede i tshimbilelana na pulane yaṋu (Individual kana Family, nga ṅwedzi kana nga ṅwaha) nga tshelede ya shango ḽaṋu, sa zwine zwa sumbedzwa kha siaṱari ḽa mitengo. Ṅwaliso wo thomaho phanḓa ha October 2026 u dzula nga mutengo we wa thoma ngawo. Arali tshelede i sa tshimbilelani, i nga vha i tshi bva kha tshumelo iṅwe.",
              "Arali no khwaṱha uri a si yaṋu, ni songo thoma u i hanedza nga bannga yaṋu. Ri ṅwaleleni u thoma ni tshi ri ṋea ḓuvha na tshelede. Tshigwada tshi ḓo i wana, tsha ṱalutshedza uri ndi mini, nahone tsha humisa tshelede arali zwi tshi ṱoḓea. U hanedza nga bannga zwi nga konḓisa mbadelo dza tshifhingani tshi ḓaho, ngauralo u zwi lugisa nga thuso kanzhi zwi a ṱavhanya nahone zwo tsireledzea.",
            ],
          },
          {
            id: "failed-payment",
            q: "Mbadelo yanga yo kundelwa. Ndi ite mini?",
            a: [
              "Stripe i lingedza hafhu mbadelo dzo kundelwaho lu si gathi nga maḓuvha a tevhelaho. Vhunzhi ha u kundelwa hu a ḓilugisa musi bannga i tshi bvisa u farelwa kana garaṱa i tshi vha na tshelede yo linganaho.",
              "Hu ḓo vha na bara nṱha ha siaṱari i tshi amba uri mbadelo a yo ngo fhira, nahone ni kha ḓiṋewa u dzhena lwa maḓuvha ma si gathi. Kwamani \"Vusuluseni garaṱa\" henefho, ni dzhenise garaṱa i shumaho, nahone ri ḓo lingedza mbadelo khayo nga u ṱavhanya. Arali ṅwaliso waṋu wo no humela kha Basic, ni nga ḓiṅwalisa hafhu kha siaṱari ḽa mitengo nahone bugu yaṋu i dzula i si na tsho tshinyalaho.",
            ],
          },
          {
            id: "plan-comparison",
            q: "Ndi phambano ifhio vhukati ha Basic, Individual na Family?",
            a: [
              "Basic (mahala): u swika kha u ṱoḓa maipfi ha 10 nga ḓuvha, ndeme dzoṱhe, tsumbo, mirero, vhubvo ha ipfi, ndeme yo teaho u ya nga mutaladzi, na bugu ya u swika kha maipfi a 30.",
              "Individual: muthu muthihi, zwishumiswa zwoṱhe zwa u guda. U ṱoḓa hu si na mikano, tshifanyiso kha ndeme iṅwe na iṅwe, tsumbo na mbudziso zwinzhi kha ipfi ḽiṅwe na ḽiṅwe, u vhumba mutaladzi ni wane vhuṱanzi, Ipfi ḽiṅwe na ḽiṅwe, Ḽi ambeni, ipfi ḽa mupo ḽa u vhala na u ṱoḓa nga ipfi, u shumisa hu si na inthanethe, mitambo, mbudziso na ndwa dza maipfi, na nḓowenḓowe ya vhuṱali ya u lugiselela mulingo na dikitesheni.",
              "Family: zwoṱhe zwa kha Individual zwa vhana vha u swika kha 5 na vhabebi, hu tshi engedzwa Tshiimo tsha vhana, fhethu hawe ha ṅwana muṅwe na muṅwe, thuso ya mishumo ya hayani, na tshikirini tsha vhabebi na ndivhadzo kha ipfi ḽiṅwe na ḽiṅwe. Zwikolo zwi na pulane yazwo. Mitengo ya shango ḽaṋu na nyingo ya mahala ya maḓuvha a 14 zwi kha siaṱari ḽa mitengo.",
            ],
          },
        ],
      },
      {
        id: "account",
        icon: "👤",
        title: "Akhaunthu na u dzhena",
        items: [
          {
            id: "no-verification-email",
            q: "A tho ngo wana imeiḽi ya u khwaṱhisa",
            a: [
              "Ṱolani u thoma kha spam na kha phuromoshini. Gmail na Outlook zwiṅwe zwifhinga dzi isa imeiḽi dza akhaunthu henefho u swika ni tshi swaya nthihi sa \"Not spam\".",
              "Arali i siho henefho, imeiḽi i nga vha yo ṅwalwa zwi si zwone musi ni tshi ḓiṅwalisa. Lingedzani u ḓiṅwalisa hafhu ni ṱole adiresi zwavhuḓi. Arali no ḓiṅwalisa nga Google, a hu ṱoḓei imeiḽi ya u khwaṱhisa.",
            ],
          },
          {
            id: "forgot-password",
            q: "Ndo hangwa phasiwedi yanga",
            a: [
              "Kha windo ḽa u dzhena, thaiphani imeiḽi yaṋu, nga murahu ni puṱedze \"No hangwa phasiwedi?\". Vhukwamani ha u vusulusa kanzhi vhu swika kha inbox yaṋu nga minithi nthihi kana mbili. Ni nga dovha hafhu na puṱedza \"Nthumeleni vhukwamani ha u dzhena nga imeiḽi\" nahone na dzhena hu si na phasiwedi.",
              "Arali imeiḽi i sa swiki, ṱolani spam. Arali i tshi kha ḓi sa swika, ni nga vha no ḓiṅwalisa nga Google hu si nga imeiḽi na phasiwedi. Lingedzani bathoni ya \"Bvelani phanḓa nga Google\".",
            ],
          },
          {
            id: "wrong-credentials",
            q: "Phasiwedi yanga ndi yone, fhedzi i ri imeiḽi na phasiwedi a zwi elani",
            a: [
              "Hu na zwithu zwiraru zwa u ṱola. Tsha u thoma, Caps Lock. Tsha vhuvhili, tshikhala tshi songo fanela magumoni nga murahu ha u kopa na u dzhenisa. Tsha vhuraru, ni nga vha no ḓiṅwalisa nga Google hu si nga phasiwedi, ngauralo shumisani \"Bvelani phanḓa nga Google\".",
              "Ni kha ḓi kundwa? Kha wonoyo mulaedza muthihi, puṱedzani \"Nthumeleni vhukwamani ha u dzhena nga imeiḽi\" uri ni dzhene hu si na phasiwedi, kana \"Khethani phasiwedi ntswa\".",
            ],
          },
          {
            id: "google-fails",
            q: "U dzhena nga Google a zwi shumi",
            a: [
              "Ngomu ha dziapp dzine dza nga Instagram, Facebook kana TikTok, bathoni ya Google i a dzumbama. Vulani vhukwamani kha burausa yaṋu ya misi yoṱhe, kana ni dzhene nga imeiḽi yaṋu. Arali no ḓiṅwalisa nga Google, thaiphani yeneyo imeiḽi nahone ni puṱedze \"Nthumeleni vhukwamani ha u dzhena nga imeiḽi\".",
              "Kha windo ḽa private, cookies dzo thivhelwaho dzi nga imisa u dzhena nga Google, ngauralo lingedzani windo ḽa misi yoṱhe.",
            ],
          },
          {
            id: "change-email",
            q: "Ndi shandukisa hani imeiḽi kha akhaunthu yanga?",
            a: [
              "U shandukisa imeiḽi ya akhaunthu yaṋu zwi itwa nga tshigwada. Ri rumeleni imeiḽi i bvaho kha adiresi yaṋu ya zwino nahone ni ṅwale adiresi ntswa kha mulaedza. Tshigwada tshi ḓo i vusulusa, nahone ṅwaliso waṋu, ḓivhazwakale na bugu yaṋu zwi ḓo sala zwo ralo.",
            ],
          },
          {
            id: "delete-account",
            q: "Ndi phumula hani akhaunthu yanga?",
            a: [
              "Fhasi ha siaṱari ḽa Akhaunthu, puṱedzani \"Phumulani akhaunthu\" nahone ni thaiphe imeiḽi ya akhaunthu yaṋu u khwaṱhisa. Hezwi ndi zwa lini na lini. Ṅwaliso waṋu u a khanselwa, bugu yaṋu na ḓivhazwakale zwi a phumulwa, nahone imeiḽi i a vhofhololwa uri hu kone u itwa u ḓiṅwalisa huswa.",
              "Tshi no nga si tshi fane ndi ṅwaliso wo rengwaho kha App Store. U phumula akhaunthu a zwi khanseli wonoyo, ngauralo ni fanela u u khansela u thoma kha nzudzanyo dza ṅwaliso dza Apple.",
              "Rekhodo dza mbadelo dzo fhiraho dzi a sala, ngauri mulayo u ri kombetshedza u dzi vhulunga u itela zwa u vhala tshelede.",
            ],
          },
          {
            id: "share-account",
            q: "Naa mufarisi wanga kana ṅwana wanga a nga shumisa akhaunthu yanga?",
            a: [
              "Kha akhaunthu iṅwe na iṅwe hu dzhena muthu muthihi nga tshifhinga. Kha muṱa, pulane ya Family yo itelwa izwi: u swika kha vhana vha 5 na vhabebi, muṅwe na muṅwe e na fhethu hawe, bugu yawe na mvelaphanḓa yawe, hu tshi engedzwa Tshiimo tsha vhana tsha vhana na tshikirini tsha vhabebi.",
              "Kha muhulwane muthihi e eṱhe, Individual i shumela muthu muthihi na zwishumiswa zwoṱhe zwa u guda. Vhambedzani pulane na mitengo ya shango ḽaṋu kha siaṱari ḽa mitengo.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "Ndi humbula uri ndi na akhaunthu mbili nga vhukhakhi. Ndi ite mini?",
            a: [
              "Hezwi kanzhi zwi itea musi muthu a tshi ḓiṅwalisa luthihi nga Google na luthihi nga imeiḽi na phasiwedi a tshi shumisa adiresi nthihi, kana musi ni tshi ḓiṅwalisa luvhili nga adiresi dza imeiḽi dzo fhambanaho. U ḓiṅwalisa huṅwe na huṅwe hu ita akhaunthu ya Gadit yo khethekanaho i na bugu yayo, ḓivhazwakale yayo, na tshiimo tshayo tsha ṅwaliso.",
              "Ri rumeleni imeiḽi ni tshi shumisa nthihi ya adiresi mbili, ni ṅwale na iṅwe adiresi na uri ndi ifhio akhaunthu ine na ṱoḓa u i vhulunga. Tshigwada tshi ḓo ṱanganyisa bugu na ḓivhazwakale kha akhaunthu ine na i khetha, nga murahu tsha vala iṅwe zwavhuḓi. A hu na mafhungo ane a xela.",
            ],
          },
        ],
      },
      {
        id: "product",
        icon: "🔍",
        title: "U shumisa Gadit",
        items: [
          {
            id: "wrong-definition",
            q: "Ndi humbula uri ṱhalutshedzo yo khakhea. Ndi ite mini?",
            a: [
              "Tsini na ṱhalutshedzo iṅwe na iṅwe, na kha garaṱa dza mirero na dza vhubvo ha ipfi, hu na tshiga tshiṱuku tsha fulaga. Tshi kwameni, ni khethe zwine zwa khou khakhea, nahone ni engedze na maṅwalo mapfufhi arali ni tshi ṱoḓa. Zwi swika thwii kha tshigwada, nahone muvhigo muṅwe na muṅwe wa sedzwa.",
              "Ni songo vhilaela nga ha u ṱola-ṱola nga maanḓa. Bugu ya maipfi i khwinifhala nga u ṱavhanya nga mutevhe uyu wa mbuelo u fhira nga tshiṅwe tshithu.",
            ],
          },
          {
            id: "kids-not-working",
            q: "Tshiimo tsha vhana a tshi khou shandukisa ṱhalutshedzo",
            a: [
              "Tshiimo tsha vhana tshi shandukisa ḽiṅwalwa fhedzi hune ipfi ḽa vha ḽo no vha na ṱhalutshedzo yo teaho vhana. Kha ipfi ḽe na touḽi ṱoḓa lwa u thoma, lindani tshekoni dza 10 u swika 15 musi ṱhalutshedzo ya vhana i tshi khou lugiselelwa.",
              "Tshiimo tsha vhana ndi tshipiḓa tsha pulane ya Family. Kha Individual ni ḓo vhona switshi ya \"Nga maipfi a leluwaho\" nṱhani hayo, ine ya ṋea ṱhalutshedzo i leluwaho ya ṱhalutshedzo iṅwe na iṅwe. Kha Basic kana hu si na akhaunthu a hu na switshi. Vhaṅwali vhe vha dzhena kha Clear kana Deep phanḓa ha October 2026 vha dzula na Tshiimo tsha vhana. U tshi wana, sedzani Family kha siaṱari ḽa mitengo.",
            ],
          },
          {
            id: "voice-fails",
            q: "U ṱoḓa nga ipfi a zwi shumi",
            a: [
              "U ṱoḓa nga ipfi hu ṱoḓa thendelo ya maikhirofoni. Burausa nnzhi dzi vhudzisa luthihi kha saiti iṅwe na iṅwe. Arali no i thivhela nga vhukhakhi, kwamisani aikhoni i re tsini na gadit.app kha bara ya adiresi nahone ni tendele maikhirofoni kha thendelo dza saiti.",
              "Kha iPhone na iPad, dovhani na ni tendele maikhirofoni ya Safari kha app ya Settings ya tshishumiswa. U ṱoḓa nga ipfi ndi tshipiḓa tsha pulane dza Individual na Family, zwenezwo kha Basic na hu si na akhaunthu gunubu ya maikhirofoni a i vhonali. U itela u khwinifhadza, vulani siaṱari ḽa mitengo.",
            ],
          },
          {
            id: "no-image",
            q: "A thi koni u wana tshifanyiso tsha ipfi",
            a: [
              "Zwifanyiso ndi tshipiḓa tsha pulane dza Individual na Family, u swika kha zwifanyiso zwiswa zwa 100 nga ṅwedzi. Tshifanyiso tshi re hone kale tsha ndeme iyo tshi vulea tshi sa vhalwi. Pulane ya kale ya Clear i na 30 nga ṅwedzi, nahone Basic a i na zwifanyiso. Musi zwifanyiso zwa ṅwedzi zwo fhela ni ḓo vhona ndivhadzo, nahone u vhala hu thoma hafhu mathomoni a ṅwedzi muṅwe na muṅwe.",
              "Arali ni fhasi ha mukano nahone ni tshi kha ḓi vhona u kundelwa, kanzhi ndi zwa tshifhinganyana. Lingedzani hafhu nga murahu ha tshekoni dza 30. U kundelwa hu sa fheli ndi vhukhakhi. Ri humbela ni vhige u bva kha siaṱari ḽa ipfi.",
            ],
          },
          {
            id: "save-word",
            q: "Ndi vhulunga hani ipfi kha bugu yanga?",
            a: [
              "A zwi ṱoḓei. Musi no dzhena, ipfi ḽiṅwe na ḽiṅwe ḽine na ḽi ṱoḓa ḽi vhulungwa kha bugu yaṋu ḽoṱhe. Kha Basic bugu i dzhenisa u swika kha maipfi a 30. Kha Individual na Family a i na mukano nahone i na nḓowenḓowe ya vhuṱali, ine ya humisa maipfi aṋu uri ni a dovhololole nga tshifhinga tsho teaho.",
              "Kha Individual na Family, maipfi ane na a ṱoḓa a vhulungwa na kha tshishumiswa tshaṋu, nga zwenezwo a vulea hu si na inthanethe. U vhona maipfi aṋu, vulani bugu kha menyu.",
            ],
          },
          {
            id: "offline",
            q: "U shumisa Gadit hu si na inthanethe zwi shuma hani?",
            a: [
              "U shumisa hu si na inthanethe ndi tshipiḓa tsha pulane dza Individual na Family. Ipfi ḽiṅwe na ḽiṅwe ḽine na ḽi ṱoḓa ḽi vhulungwa kha tshishumiswa tshaṋu, nga zwenezwo ḽi vulea hafhu nga u ṱavhanya hu si na inthanethe. Ni nga dovha na kwama \"Ḓaunuḽodani phakhethe ya hu si na inthanethe\" kha siaṱari ḽaṋu ḽa Akhaunthu u itela u vhulunga maipfi a ḓikishinari yashu nga luambo lwaṋu kha tshishumiswa itshi.",
              "U ṱoḓa ipfi ḽiswa tshoṱhe zwi kha ḓi ṱoḓa ṱhumanyo, ngauri Gadit i fanela u lugiselela mvelelo yo fhelelaho yaḽo. Khophi ya hu si na inthanethe i katela maipfi o no vha kha tshishumiswa tshaṋu. Arali ni kha Basic, sedzani pulane kha siaṱari ḽa mitengo.",
            ],
          },
          {
            id: "slow",
            q: "Apuḽikhesheni i a ongolowa",
            a: [
              "U ṱoḓa ha u thoma ha ipfi ndi hone hu ongolowaho nga maanḓa ngauri Gadit i ita mvelelo yoṱhe u bva mathomoni: kanzhi tshekoni dzi si gathi, zwiṅwe zwifhinga zwi lapfa kha maipfi a konḓaho. U ṱoḓa hu tevhelaho ha ipfi ḽeneḽo hu a ṱavhanya, hu tshi bva kha zwo vhulungwaho.",
              "Arali zwoṱhe zwi tshi ongolowa, lingedzani u vusulusa nga maanḓa: Cmd+Shift+R kha Mac, Ctrl+Shift+R kha Windows. Arali u ongolowa hu tshi bvela phanḓa kha masiaṱari oṱhe, ri rumeleni imeiḽi ni tshi ri vhudza shango ḽaṋu na burausa uri tshigwada tshi ṱole nḓila ya inthanethe u bva tshiṱirikini tshaṋu u ya kha maseva ashu.",
            ],
          },
          {
            id: "word-not-found",
            q: "Ndo ṱoḓa ipfi fhedzi a tho ngo wana mvelelo. Hu khou itea mini?",
            a: [
              "Tsha u thoma, ṱolani mupeleto. Arali ho vha na vhukhakhi ha u thaipa, Gadit kanzhi i sumbedza ipfi ḽo lugiswaho, na vhukwamani ha u ṱoḓa zwe na thaipa naho zwo ralo.",
              "Maipfi a sa wanali kanzhi kana a slang a si misi oṱhe a tshi wana mvelelo. Arali ni na vhuṱanzi ha uri ipfi ḽi hone, ri ṅwaleleni ni tshi bva kha heḽi siaṱari, nahone tshigwada tshi ḓo ṱola.",
            ],
          },
          {
            id: "change-language",
            q: "Ndi shandukisa hani luambo lwa tshikirini?",
            a: [
              "Nṱha ha siaṱari hu na aikhoni ya globe ine ya vha na luambo lwaṋu lwa zwino. I kwameni ni khethe luambo.",
              "Khetho yaṋu i vhulungwa kha tshishumiswa itshi. Zwoṱhe zwi dovha zwa longelwa nga luambo luswa, tshikirini, menyu, ṱhalutshedzo dza maipfi a tshifhingani tshi ḓaho, tsumbo, ṱhalutshedzo dza vhana, na vhubvo ha ipfi. Maipfi e na no no a ṱoḓa nga luambo lwa kale a ḓo dzula a tshi sumbedza ngalwo u swika ni tshi a ṱoḓa hafhu.",
            ],
          },
        ],
      },
      {
        id: "partner",
        icon: "🤝",
        title: "Mbekanyamushumo ya vhashumisani",
        items: [
          {
            id: "join-partner",
            q: "Ndi vha hani mushumisani wa Gadit?",
            a: [
              "Iyani kha gadit.app/partners ni puṱedze \"Dzhenani mahala\". Dzhenisani dzina ḽaṋu na imeiḽi, ni dovhe ni puṱedze \"Wanani khoudu yanga ya mushumisani\". Vhukwamani haṋu haṋu na tshikirini tsha mushumisani, tshine tsha sumbedza u puṱedza na khomishini, zwi lugela nga u ṱavhanya, hu si na u lindela thendelo. Khoudu na vhukwamani zwi dovha zwa swika nga imeiḽi.",
              "U dzhena ndi mahala nahone ho vulelwa muthu muṅwe na muṅwe. A ni ṱoḓi ṅwaliso wa Gadit uri ni vhe mushumisani.",
            ],
          },
          {
            id: "commission-model",
            q: "Khomishini dzi vhalelwa hani?",
            a: [
              "Milayo ya misi yoṱhe ndi 25% ya mbadelo iṅwe na iṅwe ine muthengi a i ita kha ṅwaha wawe wa u thoma. Nga murahu ha wonoyo ṅwaha wa u thoma, ni wana 10% ya mbadelo iṅwe na iṅwe tshifhinga tshoṱhe tshine muthengi a bvela phanḓa a tshi badela. Arali na ḓisa vharengi vha 5 vhane vha badela, mukovhe waṋu nga murahu ha ṅwaha wa u thoma u gonya wa vha 15% lwa tshoṱhe.",
              "Hezwi zwi shuma nga nḓila i fanaho kha pulane dza nga ṅwedzi na dza nga ṅwaha, ngauri khomishini i vhalelwa kha mbadelo iṅwe na iṅwe ya vhukuma. Arali muthengi a khansela, khomishini yaṋu i ima nga mbadelo yawe ya u fhedza.",
              "Tshigwada tshi nga vhea mipesente yo fhambanaho kha vhashumisani vho khetheaho. Mipesente yaṋu i dzulela u sumbedzwa kha tshikirini tshaṋu tsha mushumisani.",
            ],
          },
          {
            id: "payout",
            q: "Ndi ḓo badelwa lini?",
            a: [
              "Luthihi nga ṅwedzi, musi tshelede yaṋu i tshi swika kha minimamu i sumbedzwaho kha tshikirini tshaṋu tsha mushumisani. Ri i rumela kha akhaunthu ya PayPal ye na i vhea henefho. Minimamu ndi mukano, a si mupimo wa nṱha, ni nga wana zwinzhi u fhira zwenezwo, nahone ni ṱanganedza mbadelo musi ni tshi i fhira.",
              "Khomishini dzi bviswa nga murahu ha maḓuvha a 30 a mbadelo ya ṅwaliso, u itela fasiṱere ya u humiselwa tshelede. Ngauralo, khomishini ya ṅwaliso wa January i bviswa mathomoni a February nahone i dzhena kha mbadelo yaṋu i tevhelaho musi tshelede yaṋu i tshi swika kha minimamu.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "Ndo dzhena fhedzi tshikirini tshanga a tshi na tshithu",
            a: [
              "Zwiyelo zwi vhonala nga murahu ha u puṱedza ha u thoma kha vhukwamani haṋu. U sa vha na tshithu zwi amba fhedzi uri a hu athu u vha na muthu o puṱedzaho. Iyani ni kovhekane vhukwamani. Tshikirini tshi vusuluswa tsini na tshifhinga tsha vhukuma musi mushumo u tshi thoma.",
              "Arali no kovhekana nahone muṅwe o ḓiṅwalisa fhedzi tshikirini tshi sa sumbedzi izwo, ri ṅwaleleni ni tshi ri vhudza tshifhinga tsha tsini tsha musi o ḓiṅwalisa, nahone tshigwada tshi ḓo ṱola he u ḓiṅwalisa honoho ha bva hone.",
            ],
          },
          {
            id: "attribution-window",
            q: "Vhukwamani haṋu ha u themendela vhu tevhela mudaleli lwa tshifhinga tshingafhani?",
            a: [
              "Maḓuvha a 60. Musi mudaleli a tshi kwama vhukwamani haṋu, ri vhea cookie ine ya ni sumbedza sa ane a themendela. Arali vha ḓiṅwalisa nahone vha badela ṅwaliso tshifhinga tshiṅwe na tshiṅwe kha maḓuvha a 60 a tevhelaho (naho vha bva kha saiti vha vhuya nga murahu nga u ṱoḓa kha Google), zwi kha ḓi ṋewa inwi.",
              "U phumula cookies: arali mudaleli a phumula cookies dzawe kana a shandukisa burausa/tshishumiswa phanḓa ha u ḓiṅwalisa, zwi nga xela. A hu na nḓila ya u zwi thivhela, fhedzi maḓuvha a 60 ndi tshifhinga tshilapfu u vhambedza na mbekanyamushumo nnzhi dza vhashumisani.",
            ],
          },
          {
            id: "missing-commission",
            q: "Muṅwe o ḓiṅwalisa nga vhukwamani hanga fhedzi a thi vhoni khomishini",
            a: [
              "Kanzhi ndi zwa tshifhinga. U ḓiṅwalisa hu vhonala kha tshikirini nga murahu ha mitshelo i si gathi, fhedzi khomishini i ṅwaliwa fhedzi musi ṅwaliso wo no badelwa vhukuma, zwine zwa nga dzhia maḓuvha arali vha kha tshilingo tsha mahala. Ṱolani hafhu nga murahu ha musi tshilingo tsho fhela.",
              "Arali ṅwaliso wo badelwa fhedzi ni sa athu u vhona khomishini nga murahu ha awara dza 48, ri ṅwaleleni ni tshi ri vhudza tshifhinga tsha tsini tsha u ḓiṅwalisa na imeiḽi kana dzina ḽa tsini ḽa o ḓiṅwalisaho, arali ni tshi ḓivha. Tshigwada tshi ḓo ṱola he u ḓiṅwalisa honoho ha bva hone nahone tsha lugisa zwo pfukwaho nga tshanḓa.",
            ],
          },
        ],
      },
      {
        id: "general",
        icon: "❓",
        title: "Zwa misi yoṱhe",
        items: [
          {
            id: "what-is-gadit",
            q: "Gadit ndi mini?",
            a: [
              "Gadit i ni thusa u pfesesa ipfi ḽiṅwe na ḽiṅwe u swika magumoni, hu si u wana ṱhalutshedzo ya mutalo muthihi fhedzi. Ipfi ḽiṅwe na ḽiṅwe ḽi vulea na ndeme dzaḽo dzoṱhe, tsumbo dza vhukuma kha ndeme iṅwe na iṅwe, mirero na vhubvo ha ipfi. Pulane dzine dza badelwa dzi engedza tshifanyiso kha ndeme iṅwe na iṅwe, nḓowenḓowe, mitambo na zwiṅwe, nahone Family i engedza Tshiimo tsha vhana na fhethu ha ṅwana muṅwe na muṅwe.",
              "Gadit i shuma nga nyambo dza 41. Ngomu tshigwada tshi zwi vhidza u GAD ipfi: u pfesesa ipfi u swika magumoni, hu si u ḽi ṱalutshedzela fhedzi. U vhona zwine pulane iṅwe na iṅwe ya vha nazwo, vulani siaṱari ḽa mitengo.",
            ],
          },
          {
            id: "languages",
            q: "Ni shuma nga nyambo dzifhio?",
            a: [
              "Gadit i shuma nga nyambo dza 41, hu tshi katelwa Luisimane, Luheberu, Luarabu, Lusipenishi, Lufurentshi, Lujeremane, Lurashia, Lushaina, Lujapani, Luhindi, Luzulu, Luxhosa na Luburu.",
              "Ni nga ṱoḓa ipfi nga luṅwe lwa nyambo idzi ni wane ndeme, tsumbo na zwiṅwe zwoṱhe nga luambo lwe na lu khetha kha tshikirini. Luheberu, Luarabu na Luperesia zwi vhalwa u bva tshanḓa tshi ḽa u ya tshanḓa tshi monyi, nga fonte dzazwo. U shandukisa, kwamani bathoni ya luambo nṱha kha siaṱari ḽiṅwe na ḽiṅwe.",
            ],
          },
          {
            id: "kid-safety",
            q: "Naa Gadit yo tsireledzea kha vhana?",
            a: [
              "Gadit yo itelwa uri mubebi a i shumise nga nḓila yo tsireledzeaho e na ṅwana. Tshiimo tsha vhana tshi ita ṱhalutshedzo dzo leluwaho, dzi pfeseseaho, nahone dzi tshimbilelanaho na miṅwaha (tsini na vhuimo ha miṅwaha ya 5 u swika 10), hu tshi shumiswa tshishumiswa tshine tsha ita zwithu zwa vhahulwane hu na ndaela dzo khetheaho dza u leludza. A hu na zwithu zwo ṅwalwaho nga vhashumisi zwine zwa sumbedzwa vhana.",
              "U ya nga mbekanyamaitele dzashu na milayo ya tshiphiri tsha vhana shangoni ḽoṱhe, akhaunthu ya muthu e eṱhe ndi ya miṅwaha ya 13 u ya nṱha. Vhana vha shumisa Gadit nga kha mubebi: kha pulane ya Family mubebi u engedza ṅwana muṅwe na muṅwe u bva kha siaṱari ḽa Family, ṅwana muṅwe na muṅwe u wana fhethu hawe na Tshiimo tsha vhana, nahone tshikirini tsha vhabebi tshi sumbedza maipfi ane ṅwana muṅwe na muṅwe a a ṱoḓa. U zwi thoma, thomani nga Family kha siaṱari ḽa mitengo.",
            ],
          },
          {
            id: "data",
            q: "Mafhungo anga a vhulungwa ngafhi? Naa ni a rengisa?",
            a: [
              "Akhaunthu, zwe na ṱoḓa, bugu, na zwifanyiso zwo itwaho zwi vhulungwa nga nḓila yo tsireledzeaho kha Firebase, zwo dzumbiwa kha vhuvhulungelo. A ri rengisi mafhungo aṋu kha muthu. Ri kovhekana fhedzi zwine zwa ṱoḓea u shumisa Gadit (vhuvhulungelo, mbadelo, vhaṋei vha zwithu), sa zwo ṅwalwaho kha Mbekanyamaitele ya Tshiphiri.",
              "Ni nga phumula akhaunthu yaṋu tshifhinga tshiṅwe na tshiṅwe u bva kha siaṱari ḽa Akhaunthu. U wana khophi ya bugu yaṋu kana ya mafhungo maṅwe e ra a vhulunga, ri ṅwaleleni u bva kha siaṱari iḽi.",
            ],
          },
          {
            id: "contact-direct",
            q: "Ndi nga ni kwama hani nga u ṱavhanya?",
            a: [
              "Shumisani bathoni ya imeiḽi i re fhasi ha siaṱari iḽi. I ya kha bogisi ḽa imeiḽi ḽa tshigwada. Mulaedza muṅwe na muṅwe u a vhalwa nahone u fhindulwa nga awara dza 24 u swika 48 (kanzhi nga u ṱavhanya).",
              "Imeiḽi i fhira u davhidzana kha thuso: i ṋea tshigwada tshikhala tsha u vhala nga vhuronwane na u fhindula nga ṱhogomelo. Thuso nga founu a i athu u ṋewa.",
            ],
          },
        ],
      },
    ],
  },
  nr: {
    eyebrow: "Isikhungo Sesizo",
    heading: "Thola ipendulo, msinyana",
    lede: "Imibuzo evamileko nezilungiso zegadango ngegadango, zihlelwe ngeendawo. Nange ungaboni umraro wakho, thintana nethimba ngezansi.",
    stillNeedHelpHeading: "Usabambekile?",
    stillNeedHelpBody: "Sitlolele ngokuqondileko. Umlayezo ngamunye ufundwa lithimba begodu ngokuvamileko uthola ipendulo phakathi kwelanga linye namkha amabili.",
    emailCta: "Sithumelele i-imeyili",
    responseTime: "Ipendulo ejayelekileko: phakathi kwamahora ama-24 ukuya kwama-48.",
    categories: [
      {
        id: "billing",
        icon: "💳",
        title: "Ukubhadela nokubhalisela",
        items: [
          {
            id: "change-card",
            q: "Ngiyitjhentjha njani ikarada yesikweletu ekubhaliseleni kwami?",
            a: [
              "Ungatjhentjhela kukarada etjha ngaphasi komzuzu ngaphandle kokukhansela. Ukubhalisela kwakho kwanje kuragela phambili, kwaphela ngekarada etjha.",
              "1. Ngena ku-gadit.app bese uvula \"I-akhawunti\" kusuka kumenyu ye-akhawunti. 2. Qhwarhaza \"Lawula ukubhadela\". 3. Kuzokuvuleka ikhasi le-Stripe eliphephileko. Faka ikarada etjha njengendlela yokubhadela bese uyibeka njengejayelekileko. 4. Nawufuna, susa ikarada endala.",
              "Kusukela esikhathini sokubhadela esilandelako, koke kuya kukarada etjha. Ukubhadeliswa kwangaphambili, osekuqoqiwe, kuhlala kukarada endala. Akutlhogeki ukubuyiselwa imali ngaphandle kobana uyifuna ngokuqondileko.",
            ],
          },
          {
            id: "cancel",
            q: "Ngikukhansela njani ukubhalisela kwami?",
            a: [
              "Uzenzela wena, nanyana kunini. Ngena, vula I-akhawunti, bese uthinta ukukhansela ukubhalisela ngaphasi kwehlelo lakho.",
              "Uthenge ukubhalisela kwakho ku-app ye-iPhone namkha ye-iPad? Kukhansela kuzilungiselelo zakho zokubhalisela ze-Apple. Ilinki ethi \"Lawula ukubhalisela\" ekhasini lakho le-I-akhawunti ikusa khona.",
              "Ekubhaliseleni okubhadelwako, ukungena kwakho kuragela phambili bekube kuphela isikhathi osele usibhadelele. Ngemva kwalokho i-akhawunti ibuyela ku-Basic, mahala. Amezwi owabulungileko nomlando wakho kuhlala kuphephile.",
              "Ngesikhathi sokulinga samahala samalanga ali-14, ukukhansela kuqeda isikhathi sokulinga khona manjalo begodu akubhadeliswa litho. Nange okukukhathazako kukubhadeliswa okuzenzakalelako kwaphela, khetha isizathu leso efasiteleni lokukhansela, bese ungacima ukuvuselelwa kunalokho, ugcine isikhathi sokulinga bekube lilanga laso lokugcina.",
              "Nange ukhansele ukubhalisela okubhadelwako ngephutha namkha utjhentjha umkhumbulo, ungakuvuselela ekhasini elifanako ngaphambi kobana isikhathi siphele.",
            ],
          },
          {
            id: "switch-plan",
            q: "Ngitjhentjha njani hlangana ne-Individual ne-Family?",
            a: [
              "Bona utjhentjhele ku-Family, vula ikhasi lakho le-Akhawunti bese uthinta \"Tjhentjhela ku-Family\". Ukubhalisela kwakho kwanje kubuyekezwa ekarada efanako, ngaphandle kokuyifaka godu.",
              "I-Stripe ibala umehluko wamalanga asele esikhathini sanje, ngalokho ubhadela umehluko kwaphela. Bona utjhentjhe ukusuka ku-Family ukuya ku-Individual, sitlolele ekhasini leli begodu ithimba lizakutjhentjhela wena.",
            ],
          },
          {
            id: "invoice",
            q: "Ngiyidawuniloda njani i-invoyisi namkha irisidi?",
            a: [
              "I-Akhawunti, bese Lawula ukubhadela, bese Umlando wee-invoyisi. Ukubhadeliswa ngakunye kunerisidi ye-PDF engadawunilodwa enemininingwana yokubhadela oyibulungileko.",
              "Nange utlhoga ibizo elihlukileko, ikheli, namkha inomboro yerhumo ku-invoyisi (isibonelo ibizo lekhampani ngeenhloso zerhumo), vuselela imininingwana yakho yokubhadela ekhasini elifanako ngaphambi kokudawuniloda. Irisidi elandelako izakusebenzisa imininingwana etjha.",
            ],
          },
          {
            id: "portal-error",
            q: "Ngiqhwarhaze Lawula ukubhadela kodwana ngathola iphutha. Ngenzeni nje?",
            a: [
              "Kuneenzathu ezimbili ezivamileko. Kokuthoma, i-akhawunti yakho ayinakho ukubhalisela kwe-Stripe okusebenzako. Kwesibili, i-Stripe kungenzeka ingakabi nephrofayili yokubhadela epheleleko ye-akhawunti yakho.",
              "Into elula yokuthoma: phuma, ungene godu nge-imeyili oyisebenzise ekubhadeleni, bese ulinga godu. Nange kusehluleka, thintana nathi nge-imeyili ye-akhawunti yakho, ithimba lizakulungisa ngehlangothini lethu ngomzuzu.",
            ],
          },
          {
            id: "autorenew",
            q: "Ukubhalisela kwami kuzakuzivuselela?",
            a: [
              "Iye. Amahlelo wenyanga avuseleleka qobe nyanga, amahlelo wonyaka avuseleleka qobe mnyaka ngelanga elifanako. Ungabona ilanga lokubhadela elilandelako ku-akhawunti yakho naphothalini ye-Stripe.",
              "Nange ungafuni ukuzivuselela, khansela nanyana kunini ngaphambi kwelanga lokuvuselela. Ukukhansela akwenzeki khonokho. Ugcina ukungena bekube kuphela isikhathi osele usibhadelele.",
            ],
          },
          {
            id: "refund",
            q: "Ngingabuyiselwa imali?",
            a: [
              "Iye. Nange ukuthenga kwenzeke ngaphasi kwamalanga ali-14 adlulileko begodu umsebenzi ungakasetjenziswa khulu, sitlolele nge-imeyili ye-akhawunti yakho nombhalo omfitjhani wesizathu. Ukubuyiselwa imali okunjalo kuvunyelwa ngaphandle kobudisi.",
              "Nange sekudlule amalanga ali-14, ithimba likuphatha ngokwesimo ngasinye. Khansela ukubhalisela bona kungaragi kuzivuselela, bese usithumelela i-imeyili.",
            ],
          },
          {
            id: "unknown-charge",
            q: "Kuyini ukubhadeliswa lokhu ekaradeni yami?",
            a: [
              "Ukubhadeliswa kuvela njenge-GADIT namkha i-GADIT.APP. Inani lifana nehlelo lakho (Individual namkha Family, ngenyanga namkha ngomnyaka) ngemali yelizwe lakho, njengokutjengiswa ekhasini lamanani. Ukubhalisela okwathoma ngaphambi kuka-Oktoba 2026 kugcina intengo eyaqala ngayo. Nange inani lingafani, kungenzeka livela kwenye isevisi.",
              "Nange uqinisekile bona akusikho kwakho, ungakuphikisi ebhanga lakho okwanje. Sitlolele ngokuqondileko kuqala ngelanga nenani. Ithimba lizakukuthola, lihlathulule bona kuyini, begodu libuyise imali nange kutlhogeka. Ukuphikisa ebhanga kungenza ukubhadela kwesikhathi esizako kube budisi, ngalokho ukukulungisa ngesizo kanengi kusheshe begodu kuphephile khulu.",
            ],
          },
          {
            id: "failed-payment",
            q: "Ukubhadela kwami kwehlulekile. Kufuze ngenzeni?",
            a: [
              "I-Stripe ilinga godu ngokuzenzakalela ukubhadela okwehlulekileko kanengana emalangeni alandelako. Ukwehluleka okunengi kuzilungisa ngokwako lokha ibhanga nalikhulula ukubanjwa namkha ikarada isinemali eneleko.",
              "Phezulu ekhasini kuzovela ibha ethi ukubhadeliswa akukaphumeleli, begodu ukungena kwakho kugcinwa amalanga ambalwa angeziweko. Thinta \"Vuselela ikarada\" lapho, ufake ikarada esebenzako, bese sizalinga ukubhadelisa khona manjalo. Nange ukubhalisela kwakho sele kubuyele ku-Basic, ungabhalisela godu ekhasini lamaNanini begodu ibhuku lakho lihlala liphelele.",
            ],
          },
          {
            id: "plan-comparison",
            q: "Uyini umehluko phakathi kwe-Basic, Individual ne-Family?",
            a: [
              "I-Basic (mahala): ukufuna amezwi okufika ku-10 ngelanga, zoke iinhlathululo, izibonelo, izaga, umsuka welizwi, ihlathululo efaneleko ngokomutjho, nebhuku lamezwi elinamezwi afika ku-30.",
              "Individual: umuntu oyedwa, woke amathulusi wokufunda. Ukufuna okungapheliko, isithombe sehlathululo ngayinye, izibonelo ezinengi nemibuzo ngelizwi ngalinye, tlola umutjho uthole amazwana, Ilizwi Ngalinye, Kutjho, iphimbo lemvelo lokufundela phezulu nokufuna ngelizwi, ukusebenzisa ngaphandle kwe-inthanethi, imidlalo, imibuzo nemincintiswano yamezwi, nokuzilolonga okuhlakaniphileko nokulungiselela iimvivinyo nedikitheyishini.",
              "Family: koke okuku-Individual kwabantwana abafika ku-5 nababelethi, kunye neModi yabantwana, indawo yakhe yomntwana ngamunye, isizo ngomsebenzi wekhaya, nebhodi yababelethi enesaziso selizwi ngalinye. Iinkolo zinehlelo lazo. Amanani welizwe lakho kunye nesikhathi sokulinga samahala samalanga ali-14 kutholakala ekhasini lamanani.",
            ],
          },
        ],
      },
      {
        id: "account",
        icon: "👤",
        title: "I-akhawunti nokungena",
        items: [
          {
            id: "no-verification-email",
            q: "Angikayitholi i-imeyili yokuqinisekisa",
            a: [
              "Hlola kuqala iinqoqwana ze-spam nezokukhangisa. I-Gmail ne-Outlook kwesinye isikhathi zithumela ama-imeyili we-akhawunti lapho bekube uphawula enye njengethi \"Not spam\".",
              "Nange ingekho lapho, i-imeyili kungenzeka itlolwe ngephutha ekubhaliseni. Linga ukubhalisa godu bese uhlola ikheli kuhle. Nange ubhalise nge-Google, ayitlhogeki i-imeyili yokuqinisekisa.",
            ],
          },
          {
            id: "forgot-password",
            q: "Ngikhohlwe iphasiwedi yami",
            a: [
              "Efasiteleni lokungena, tlola i-imeyili yakho, bese uqhwarhaza \"Ukhohlwe iphasiwedi?\". Ilinki yokuyitjhentjha ijayele ukufika ku-imeyili yakho ngemizuzu emibili namkha ngaphasi kwalokho. Ungaqhwarhaza godu \"Ngithumelela ilinki yokungena nge-imeyili\" bese ungena ngaphandle kwephasiwedi.",
              "Nange i-imeyili ingafiki, hlola i-spam. Nange isengafiki, kungenzeka ubhalise nge-Google esikhundleni se-imeyili nephasiwedi. Linga ikunupu ethi \"Raga nge-Google\".",
            ],
          },
          {
            id: "wrong-credentials",
            q: "Ngiqinisekile bona iphasiwedi yami ilungile kodwana kuthiwa \"I-imeyili namkha iphasiwedi akukalungi\"",
            a: [
              "Izinto ezintathu okufuze uzihlole. Kokuthoma, i-Caps Lock. Kwesibili, isikhala esingeziweko ekugcineni ngemva kokukopa nokunamathisela. Kwesithathu, kungenzeka ubhalise nge-Google esikhundleni sephasiwedi, sebenzisa \"Raga nge-Google\" kunalokho.",
              "Usabambekile? Emlayezweni ofanako qhwarhaza \"Ngithumelela ilinki yokungena nge-imeyili\" bona ungene ngaphandle kwephasiwedi, namkha \"Khetha iphasiwedi etjha\".",
            ],
          },
          {
            id: "google-fails",
            q: "Ukungena nge-Google akusebenzi",
            a: [
              "Ngaphakathi kwama-app afana ne-Instagram, Facebook namkha TikTok, ikunupu ye-Google ifihlekile. Vula ilinki kubhrawuza yakho ejayelekileko, namkha ungene nge-imeyili yakho. Nange ubhalise nge-Google, tlola leyo imeyili bese uqhwarhaza \"Ngithumelela ilinki yokungena nge-imeyili\".",
              "Efasiteleni langasese, i-incognito, ama-cookie avinjiweko angavimba ukungena nge-Google, ngalokho linga ifasitela elijayelekileko.",
            ],
          },
          {
            id: "change-email",
            q: "Ngiyitjhentjha njani i-imeyili ku-akhawunti yami?",
            a: [
              "Ukutjhentjha i-imeyili ye-akhawunti yakho kwenziwa liqembu. Sithumele i-imeyili usuka ekhelini lakho lamanje begodu utlolo ikheli elitjha emlayezweni. Ithimba lizakulitjhentjha, begodu ukubhalisela kwakho, umlando nebhuku lamezwi kuzohlala kunjengombana kunjalo.",
            ],
          },
          {
            id: "delete-account",
            q: "Ngiyisula njani i-akhawunti yami?",
            a: [
              "Ezansi kwekhasi le-akhawunti, qhwarhaza \"Sula i-akhawunti\" bese utlola i-imeyili ye-akhawunti yakho ukuqinisekisa. Lokhu kungokwaphakade. Ukubhalisela kwakho kuyakhanselwa, ibhuku lakho lamezwi nomlando kuyasulwa, begodu i-imeyili iyakhululwa bona ubhalise butjha.",
              "Okukodwa okuhlukileko kubhaliselo obuthengwe ku-App Store, ukusula i-akhawunti akukhanseli lokho, ngalokho khansela qangi kuzilungiselelo zakho zokubhalisela ze-Apple.",
              "Amarekhodi wemali ebhadelwe ngaphambilini ayahlala, ngombana umthetho usibophelela ukuwugcina ngebanga lokubalwa kweencwadi zemali.",
            ],
          },
          {
            id: "share-account",
            q: "Umlingani wami namkha umntwana wami angabelana nami nge-akhawunti yami?",
            a: [
              "Ku-akhawunti ngayinye kungena umuntu munye ngesikhathi. Emndenini, ihlelo le-Family lakhelwe lokhu: abantwana abafika ku-5 nababelethi, ngamunye unendawo yakhe, ibhuku lakhe lamezwi nokuthuthuka kwakhe, kunye neModi yabantwana yabantwana nebhodi yababelethi.",
              "Emuntwini omdala munye, i-Individual ifaka umuntu oyedwa nawo woke amathulusi wokufunda. Bona amahlelo namanani welizwe lakho ekhasini lamanani.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "Ngicabanga bona nginama-akhawunti amabili ngephutha. Ngenzeni nje?",
            a: [
              "Lokhu kuvame ukwenzeka lokha umuntu abhalisa kanye nge-Google bese kanye nge-imeyili nephasiwedi asebenzisa ikheli elifanako, namkha nawubhalisa kabili ngamakheli we-imeyili ahlukeneko. Ukubhalisa ngakunye kwenza i-akhawunti ye-Gadit ehlukileko enebhuku layo, umlando, nesimo saso sokubhalisela.",
              "Sithumele i-imeyili isuka kwelinye lamakheli amabili, bese utlola elinye ikheli nokobana ngiyiphi i-akhawunti ofuna ukuyigcina. Ithimba lizakuhlanganisa ibhuku nomlando ku-akhawunti oyikhethileko, bese livala enye ngokuhlanzekileko. Akulahleki idatha.",
            ],
          },
        ],
      },
      {
        id: "product",
        icon: "🔍",
        title: "Ukusebenzisa i-Gadit",
        items: [
          {
            id: "wrong-definition",
            q: "Ngicabanga bona ihlathululo ayikalungi. Ngenzani?",
            a: [
              "Eceleni kwencazelo ngayinye, begodu nakumakhadi wezitjho nomlando welizwi, kunesithonjana esincani sefulegi. Sithinte, ukhethe okungalungileko, bese ungezelela inothi emfitjhani nawufuna. Uya ngqo ethimbeni, begodu umbiko ngamunye uyahlolwa.",
              "Ungatshwenyeki ngokuba necophelelo khulu. Isihlathululimezwi sithuthuka msinyana ngalempendulo ukudlula nanyana yini enye.",
            ],
          },
          {
            id: "kids-not-working",
            q: "Imodi yabantwana ayitjhentjhi ihlathululo",
            a: [
              "Imodi yabantwana itjhentjha umtlolo kwaphela lapho ilizwi sele linehlathululo efanele abantwana. Elizwini osanda kulifuna kokuthoma, lindela imizuzwana eli-10 ukuya kwe-15 kusalungiswa ihlathululo yabantwana.",
              "Imodi yabantwana iyingcenye yehlelo le-Family. Ku-Individual uzakubona isitjhintjhi esithi \"Ngamagama alula\" esikhundleni salokho, esinika ihlathululo elula khudlwana yencazelo ngayinye. Ku-Basic namkha ngaphandle kwe-akhawunti akunasitjhintjhi. Ababhaliseli abajoyina i-Clear namkha i-Deep ngaphambi kuka-Oktoba 2026 bagcina iModi yabantwana. Bona uyithole, bona i-Family ekhasini lamanani.",
            ],
          },
          {
            id: "voice-fails",
            q: "Ukufuna ngelizwi akusebenzi",
            a: [
              "Ukufuna ngelizwi kutlhoga imvumo yemakrofoni. Amabhrawuza amanengi abuza kanye ngesayithi ngayinye. Nange uyivimbe ngephutha, thinta itjhwayo eliseceleni kwe-gadit.app ebhaweni lekheli bese uvumela imakrofoni eemvumeni zesayithi.",
              "Ku-iPhone ne-iPad, godu vumela imakrofoni ye-Safari kuhlelo lwe-Settings yedivayisi. Ukufuna ngelizwi kuyingcenye yamahlelo we-Individual ne-Family, ngalokho ku-Basic nangaphandle kwe-akhawunti ikunupu yemakrofoni ayiveli. Bona uthuthukise, vula ikhasi lamanani.",
            ],
          },
          {
            id: "no-image",
            q: "Angikghoni ukuthola isithombe selizwi",
            a: [
              "Izithombe ziyingcenye yamahlelo we-Individual ne-Family, kufika ezithombeni ezitjha ezili-100 ngenyanga. Isithombe esele sikhona sehlathululo leyo siyavuleka ngaphandle kokubalwa. Ihlelo elidala le-Clear linezithombe ezima-30 ngenyanga, begodu i-Basic ayinazo izithombe. Nange izithombe zenyanga ziphelile uzakubona isaziso, begodu ukubala kuthoma butjha ekuthomeni kwenyanga ngayinye.",
              "Nange ungakafiki esabelweni kodwana usabona ukwehluleka, kanengi kwesikhatjhana. Linga godu ngemva kwemizuzwana ema-30. Ukwehluleka okuraga kungaba liphutha lesistimu. Sibawa ubike ekhasini lelizwi.",
            ],
          },
          {
            id: "save-word",
            q: "Ngilibulunga njani ilizwi ebhukwini lami lamezwi?",
            a: [
              "Akutlhogeki. Nawungenileko, ilizwi ngalinye olifunako libulungwa ebhukwini lakho lamezwi ngokwalo. Ku-Basic ibhuku lamezwi liphatha amezwi afika ku-30. Ku-Individual ne-Family alinamkhawulo begodu linokuzilolonga okuhlakaniphileko, okubuyisa amezwi wakho bona uwabuyekeze ngesikhathi esifaneleko.",
              "Ku-Individual ne-Family, amezwi owafunako abulungwa nakudivayisi yakho, ngalokho avuleka ngaphandle kwe-inthanethi. Bona ubone amezwi wakho, vula ibhuku lamezwi kumenyu.",
            ],
          },
          {
            id: "offline",
            q: "Imodi yangaphandle kwe-inthanethi isebenza njani?",
            a: [
              "Ukusebenzisa ngaphandle kwe-inthanethi kuyingcenye yamahlelo we-Individual ne-Family. Ilizwi ngalinye olifunako libulungwa kudivayisi yakho, ngalokho livuleka godu khonokho ngaphandle kwe-inthanethi. Ungathinta futhi \"Dawuniloda iphakethe langaphandle kwe-inthanethi\" ekhasini lakho le-\"I-akhawunti\" ukuze ubulunge amezwi wesichazamazwi sethu ngelimi lakho kudivayisi le.",
              "Ukufuna ilizwi elitjha ngokupheleleko kusatlhoga ukuxhumana, ngombana i-Gadit kufuze ilungiselele umphumela opheleleko walo. Ikhophi yangaphandle kwe-inthanethi ifaka amezwi asele akudivayisi yakho. Nange use-Basic, bona amahlelo ekhasini lamanani.",
            ],
          },
          {
            id: "slow",
            q: "I-app ibonakala iphuza",
            a: [
              "Ukufuna kokuthoma kwelizwi kuphuza khulu ngombana i-Gadit yenza umphumela woke kusukela ekuthomeni: kanengi imizuzwana embalwa, kwesinye isikhathi kude kwamezwi abudisi. Ukufuna okulandelako kwelizwi elifanako kwenzeka khonokho, kuvela ku-cache.",
              "Nange koke kuphuza, linga ukuvuselela ngamandla: Cmd+Shift+R ku-Mac, Ctrl+Shift+R ku-Windows. Nange ukuphuza kuraga emakhasini woke, sibawa usithumelele i-imeyili ngenarha yakho nebhrawuza bona ithimba lihlole indlela ye-inthanethi ukuya emaseva wethu ukusuka esifundeni sakho.",
            ],
          },
          {
            id: "word-not-found",
            q: "Ngifune ilizwi angakhenge ngithole umphumela. Kwenzekani?",
            a: [
              "Kokuthoma, hlola ukupela. Nange bekunephutha lokutlola, i-Gadit ivamise ukutshengisa ilizwi elilungisiweko, ibe nelinki yokufuna lokho okutlolileko nanyana kunjalo.",
              "Amezwi angajayelekiko khulu namkha wesitsotsi awahlali athola umphumela. Nange uqinisekile bona ilizwi likhona, sitlolele usuka ekhasini leli, ithimu izokuhlola.",
            ],
          },
          {
            id: "change-language",
            q: "Ngilitjhentjha njani ilimi lokusebenzisa?",
            a: [
              "Phezulu kwekhasi kunetjhwayo leglobe elinelimi lakho lanje. Lithinte bese ukhetha ilimi.",
              "Ukhetho lwakho lubulungwa kudivayisi le. Koke kulayitha godu ngelimi elitjha, ukusebenzisa, iimenyu, iinhlathululo zamezwi ezizako, izibonelo, iinhlathululo zabantwana, ngitjho nomsuka welizwi. Amezwi osuvele uwafunile ngelimi elidala azohlala atjengiswa ngalo bekube uwafuna godu.",
            ],
          },
        ],
      },
      {
        id: "partner",
        icon: "🤝",
        title: "Uhlelo lwabalingani",
        items: [
          {
            id: "join-partner",
            q: "Ngiba njani mlingani we-Gadit?",
            a: [
              "Iya ku-gadit.app/partners bese uqhwarhaza \"Joyina mahala\". Faka ibizo lakho ne-imeyili, bese uqhwarhaza \"Ngifuna ikhowudi yami yomlingani\". Ilinki yakho yomuntu mathupha nedeshibhodi yomlingani, enokuqhwarhaza neenkhomitjhini, kulungela msinyana, ngaphandle kokulinda imvumo. Ikhowudi nelinki kuthunyelwa kuwe nange-imeyili.",
              "Ukujoyina kumahala begodu kuvulekele woke umuntu. Awutlhogi ukubhalisela kwe-Gadit bona ube mlingani.",
            ],
          },
          {
            id: "commission-model",
            q: "Iinkhomitjhini zibalwa njani?",
            a: [
              "Imibandela ejayelekileko yi-25% yembhadelo ngayinye ikhasimende eliyenza emnyakeni walo wokuthoma. Ngemva komnyaka wokuthoma, uzuza i-10% yembhadelo ngayinye isikhathi soke ikhasimende lisabhadela. Nawuletha amakhasimende ama-5 abhadelako, isabelo sakho ngemva komnyaka wokuthoma sikhuphukela ku-15% ipilo yoke.",
              "Lokhu kusebenza ngokufanako emahlelweni wenyanga nawonyaka, ngombana ikhomitjhini ibalwa embhadelweni ngamunye wamambala. Nange ikhasimende likhansela, ikhomitjhini yakho iyajama embhadelweni walo wokugcina.",
              "Ithimba lingabeka amazinga ahlukeneko wabalingani abathileko. Amazinga wakho ahlala atjengiswa edeshibhodini yakho yomlingani.",
            ],
          },
          {
            id: "payout",
            q: "Ngibhadelwa nini?",
            a: [
              "Kanye ngenyanga, lokha ibhalansi yakho nayifika enanini elincani elitjengiswe edeshibhodini yakho yomlingani. Siyithumela ku-akhawunti ye-PayPal oyibeke khona. Lelo nani elincani lisilinganiso sokuthoma, akusimkhawulo ophezulu. Ungazuza okunengi khulu, begodu uthola umbhadelo nawudlula khona.",
              "Iinkhomitjhini zikhululwa ngemva kwamalanga ama-30 ngemva kokubhadelela ukubhalisela, bona kube nesikhathi sokubuyiselwa imali. Ngalokho ikhomitjhini yokubhalisela kwakaJanabari ikhululwa ekuthomeni kwakaFebherbari, bese ingena embhadelweni wakho olandelako lokha ibhalansi yakho nayifika enanini elincani.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "Ngijoyinile kodwana ideshibhodi yami ayinalitho",
            a: [
              "Iinomboro zivela ngemva kokuqhwarhaza kokuthoma elinkini yakho. Ukungabi nalitho kutjho kwaphela bona akukabi khona oqhwarhazileko. Iya uyokwabelana ngelinki. Ideshibhodi ivuseleleka ngokuseduze ngesikhathi sinye lokha ukusebenza nakuthomako.",
              "Nange wabelene begodu umuntu wabhalisa kodwana ideshibhodi ingakutjengisi, sitlolele ngesikhathi esiseduze sokubhalisa, ithimba lizakuhlola bona ukubhalisa kuvele ngaphi.",
            ],
          },
          {
            id: "attribution-window",
            q: "Ilinki yami yokuncoma ilandelela umvakatjheli isikhathi esingangani?",
            a: [
              "Amalanga ama-60. Lokha umvakatjheli aqhwarhaza ilinki yakho, sibeka i-cookie ekutjengisa njengomncomi. Nange abhalisa begodu abhalisele nanyana kunini emalangeni ama-60 alandelako (ngitjho nanyana aphuma esayithini bese abuya ngemva kwalokho ngokufuna ku-Google), ukubalelwa kusaya kuwe.",
              "Ukusulwa kwama-cookie: nange umvakatjheli asula ama-cookie wakhe namkha atjhentjha ibhrawuza/idivayisi ngaphambi kokubhalisa, ukubalelwa kungalahleka. Ayikho indlela yokugwema lokho, kodwana amalanga ama-60 sikhathi esikhulu uma kumadaniswa nezinye izinhlelo ezinengi zabalingani.",
            ],
          },
          {
            id: "missing-commission",
            q: "Umuntu ubhalise ngelinki yami kodwana angiyiboni ikhomitjhini",
            a: [
              "Kanengi lokhu kusikhathi. Ukubhalisa kuvela edeshibhodini phakathi kwemizuzu, kodwana ikhomitjhini ibhalwa kwaphela lokha ukubhalisela nakubhadelwe ngamambala, begodu lokho kungathatha amalanga nange basekulingeni kwamahala. Buyela uhlole ngemva kobana ukulinga kuphele.",
              "Nange ukubhalisela kubhadelwe kodwana usayiboni ikhomitjhini ngemva kwamahora ama-48, sitlolele ngesikhathi esiseduze sokubhalisa ne-imeyili namkha ibizo elisondeleko lombhaliseli nawulazi. Ithimba lizakuhlola bona ukubhalisa kuvele ngaphi bese lilungisa okuphosiweko ngesandla.",
            ],
          },
        ],
      },
      {
        id: "general",
        icon: "❓",
        title: "Okujayelekileko",
        items: [
          {
            id: "what-is-gadit",
            q: "Iyini i-Gadit?",
            a: [
              "I-Gadit ikusiza uzwisise ilizwi ngalinye ngokuzeleko, ingasi ukufumana ihlathululo yomugca munye kwaphela. Ilizwi ngalinye livuleka nazo zoke iinhlathululo zalo, izibonelo zamambala zehlathululo ngayinye, izaga nomsuka welizwi. Amahlelo abhadelwako angezelela isithombe sehlathululo ngayinye, ukuzilolonga, imidlalo nokhunye okunengi, begodu i-Family ingezelela iModi yabantwana nendawo yomntwana ngamunye.",
              "I-Gadit isebenza ngamalimi ama-41. Ngaphakathi ithimba likubiza ngokuthi kwenza i-GAD elizwini: ukuzwisisa ilizwi ngokuzeleko, ingasi ukulitjhugulula kwaphela. Bona ubone lokho ihlelo ngalinye elinakho, vula ikhasi lamanani.",
            ],
          },
          {
            id: "languages",
            q: "Nisekela maphi amalimi?",
            a: [
              "I-Gadit isebenza ngamalimi ama-41, kuhlanganise nesiNgisi, isiHebheru, isi-Arabhu, isiPanitjhi, isiFurentjhi, isiJarimani, isiRhashiya, isiTjhayina, isiJapani, isiHindi, isiZulu, isiXhosa ne-Afrikaans.",
              "Ungafuna ilizwi ngelinye nelinye lamalimi lawo bese uthola iinhlathululo, izibonelo nakho koke okhunye ngelimi olikhethileko lokusebenzisa. IsiHebheru, isi-Arabhu nesiPheresiya zifundwa kusukela kwesokudla ukuya kwesobunxele, ngeemfonti zazo. Bona utjhentjhe, thinta itjhwayo lelimi phezulu kwekhasi nanyana ngiliphi.",
            ],
          },
          {
            id: "kid-safety",
            q: "I-Gadit iphephile kubantwana?",
            a: [
              "I-Gadit yakhelwe bona umbelethi ayisebenzise ngokuphephileko kunye nomntwana. Imodi yabantwana yenza iinhlathululo ezilula, eziqondileko nezifanele ubudala (ezingeni leminyaka ema-5 ukuya kweli-10 ngokuseduze), isebenzisa injini efanako esebenzisela okuqukethwe kwabadala kunye neenyeleliso eziqondileko zokwenza kube lula. Okuqukethwe okwenziwe ngabasebenzisi akukhe kwatjengiswa abantwana.",
              "Ngokuvumelana nemithetho yethu nemithetho yefihlo yabantwana ephasini loke, i-akhawunti yakho ngokwakho ngeyeminyaka eli-13 nangaphezulu. Abantwana basebenzisa i-Gadit ngombelethi: ehlelweni le-Family umbelethi ufaka umntwana ngamunye ekhasini lomndeni, umntwana ngamunye uthola indawo yakhe eneModi yabantwana, begodu ibhodi yababelethi itjengisa amezwi umntwana ngamunye awafunako. Bona ukulungiselele, thoma nge-Family ekhasini lamanani.",
            ],
          },
          {
            id: "data",
            q: "Imininingwana yami ibulungwa kuphi? Niyayithengisa?",
            a: [
              "I-akhawunti, umlando, ibhuku lamezwi nezithombe ezenziweko kubulungwa ngokuphephileko ku-Firebase, kubethelwe esitorweni. Asithengisi imininingwana yakho kunanyana ngubani. Sabelana kwaphela ngalokho okutlhogekako bona i-Gadit isebenze (ukubulunga, ukubhadela, abaletha okuqukethwe), njengokutlolwe eMthethomgomweni Wefihlo.",
              "Ungasula i-akhawunti yakho nanyana kunini ekhasini le-Akhawunti. Bona uthole ikhophi yebhuku lakho lamezwi namkha yenye imininingwana esinayo, sitlolele ekhasini leli.",
            ],
          },
          {
            id: "contact-direct",
            q: "Nginifikelela njani ngokuqondileko?",
            a: [
              "Sebenzisa ikunupu ye-imeyili ngezansi kwekhasi leli. Iya ngokuqondileko ebhokisini lethimba. Umlayezo ngamunye uyafundwa begodu uthola ipendulo phakathi kwamahora ama-24 ukuya kwama-48 (kanengi msinyana).",
              "I-imeyili ingcono kunokukhulumisana ngesizo: inikela ithimba ithuba lokufunda kuhle nokuphendula ngokucabangisisa. Isizo ngefowuni alikanikelwa okwanje.",
            ],
          },
        ],
      },
    ],
  },
  el: {
    eyebrow: "Κέντρο βοήθειας",
    heading: "Βρες μια απάντηση, γρήγορα",
    lede: "Συχνές ερωτήσεις και λύσεις βήμα προς βήμα, οργανωμένες ανά περιοχή. Αν δεν βλέπεις το ζήτημά σου, επικοινώνησε με την ομάδα στο κάτω μέρος.",
    stillNeedHelpHeading: "Ακόμα κολλημένος;",
    stillNeedHelpBody: "Γράψε μας απευθείας. Κάθε μήνυμα διαβάζεται από την ομάδα και παίρνει συνήθως απάντηση μέσα σε μία ή δύο ημέρες.",
    emailCta: "Στείλε μας email",
    responseTime: "Τυπική απάντηση: μέσα σε 24 με 48 ώρες.",
    categories: [
      {
        id: "billing",
        icon: "💳",
        title: "Χρέωση και συνδρομή",
        items: [
          {
            id: "change-card",
            q: "Πώς αλλάζω την πιστωτική κάρτα στη συνδρομή μου;",
            a: [
              "Μπορείς να περάσεις σε νέα κάρτα σε λιγότερο από ένα λεπτό, χωρίς να ακυρώσεις τίποτα. Η τρέχουσα συνδρομή σου συνεχίζει κανονικά, απλώς με τη νέα κάρτα.",
              "1. Συνδέσου στο gadit.app και άνοιξε το \"Λογαριασμός\" από το μενού λογαριασμού. 2. Πάτησε \"Διαχείριση χρέωσης\". 3. Ανοίγει μια ασφαλής σελίδα του Stripe. Πρόσθεσε τη νέα κάρτα ως τρόπο πληρωμής και όρισέ την ως προεπιλογή. 4. Προαιρετικά, αφαίρεσε την παλιά κάρτα.",
              "Από τον επόμενο κύκλο χρέωσης και μετά, όλα πηγαίνουν στη νέα κάρτα. Η προηγούμενη χρέωση, που έχει ήδη εισπραχθεί, παραμένει στην παλιά κάρτα. Δεν χρειάζεται επιστροφή χρημάτων, εκτός αν τη θέλεις ειδικά.",
            ],
          },
          {
            id: "cancel",
            q: "Πώς ακυρώνω τη συνδρομή μου;",
            a: [
              "Μόνος σου, οποιαδήποτε στιγμή. Συνδέσου, άνοιξε το Λογαριασμός και πάτησε Ακύρωση συνδρομής κάτω από το πλάνο σου.",
              "Αγόρασες τη συνδρομή σου στην εφαρμογή για iPhone ή iPad; Ακύρωσέ τη από τις ρυθμίσεις συνδρομών της Apple. Ο σύνδεσμος \"Διαχείριση συνδρομής\" στη σελίδα Λογαριασμός σε πηγαίνει εκεί.",
              "Σε συνδρομή επί πληρωμή, η πρόσβασή σου συνεχίζεται μέχρι το τέλος της περιόδου που έχεις ήδη πληρώσει. Μετά ο λογαριασμός περνά στο Basic, δωρεάν. Οι αποθηκευμένες λέξεις σου και το ιστορικό σου μένουν ασφαλή.",
              "Κατά τη δωρεάν δοκιμή 14 ημερών, η ακύρωση τερματίζει τη δοκιμή αμέσως και δεν γίνεται καμία χρέωση. Αν σε ανησυχεί μόνο η αυτόματη χρέωση, διάλεξε αυτόν τον λόγο στο παράθυρο ακύρωσης και μπορείς αντί γι' αυτό να απενεργοποιήσεις την ανανέωση, κρατώντας τη δοκιμή μέχρι την τελευταία της μέρα.",
              "Αν ακυρώσεις μια συνδρομή επί πληρωμή κατά λάθος ή αλλάξεις γνώμη, μπορείς να τη συνεχίσεις από την ίδια σελίδα πριν λήξει η περίοδος.",
            ],
          },
          {
            id: "switch-plan",
            q: "Πώς αλλάζω ανάμεσα σε Individual και Family;",
            a: [
              "Για να περάσεις στο Family, άνοιξε τη σελίδα Λογαριασμός και πάτησε «Άλλαξε σε Family». Η τωρινή συνδρομή σου ενημερώνεται στην ίδια κάρτα, χωρίς να την ξαναβάλεις.",
              "Το Stripe υπολογίζει τη διαφορά για τις μέρες που απομένουν στην τρέχουσα περίοδο, οπότε πληρώνεις μόνο τη διαφορά. Για να περάσεις από Family σε Individual, γράψε μας από αυτή τη σελίδα και η ομάδα θα κάνει την αλλαγή για σένα.",
            ],
          },
          {
            id: "invoice",
            q: "Πώς κατεβάζω τιμολόγιο ή απόδειξη;",
            a: [
              "Λογαριασμός, μετά Διαχείριση χρέωσης, μετά Ιστορικό τιμολογίων. Κάθε χρέωση έχει μια απόδειξη PDF για κατέβασμα, με τα στοιχεία χρέωσης που αποθήκευσες.",
              "Αν χρειάζεσαι διαφορετικό όνομα, διεύθυνση ή ΑΦΜ στο τιμολόγιο (για παράδειγμα την επωνυμία μιας εταιρείας για φορολογικούς λόγους), ενημέρωσε τα στοιχεία χρέωσης στην ίδια σελίδα πριν το κατεβάσεις. Η επόμενη απόδειξη θα χρησιμοποιήσει τα νέα στοιχεία.",
            ],
          },
          {
            id: "portal-error",
            q: "Πάτησα Διαχείριση χρέωσης αλλά πήρα σφάλμα. Τι κάνω τώρα;",
            a: [
              "Δύο συνηθισμένες αιτίες. Πρώτον, ο λογαριασμός σου δεν έχει ενεργή συνδρομή στο Stripe. Δεύτερον, μπορεί το Stripe να μην έχει ακόμα πλήρες προφίλ χρέωσης για τον λογαριασμό σου.",
              "Εύκολος πρώτος έλεγχος: αποσυνδέσου, ξανασυνδέσου με το email που χρησιμοποίησες κατά την αγορά και δοκίμασε ξανά. Αν συνεχίζει να αποτυγχάνει, επικοινώνησε μαζί μας με το email του λογαριασμού σου και η ομάδα θα το διορθώσει από την πλευρά μας σε ένα λεπτό.",
            ],
          },
          {
            id: "autorenew",
            q: "Θα ανανεωθεί αυτόματα η συνδρομή μου;",
            a: [
              "Ναι. Τα μηνιαία πλάνα ανανεώνονται κάθε μήνα, τα ετήσια πλάνα ανανεώνονται κάθε χρόνο την ίδια ημερομηνία. Μπορείς να δεις την επόμενη ημερομηνία χρέωσης στον λογαριασμό σου και στην πύλη του Stripe.",
              "Αν δεν θέλεις αυτόματη ανανέωση, ακύρωσε όποτε θέλεις πριν από την ημερομηνία ανανέωσης. Η ακύρωση δεν είναι άμεση. Κρατάς την πρόσβασή σου μέχρι το τέλος της περιόδου που έχεις ήδη πληρώσει.",
            ],
          },
          {
            id: "refund",
            q: "Μπορώ να πάρω επιστροφή χρημάτων;",
            a: [
              "Ναι. Αν η αγορά έγινε πριν από λιγότερο από 14 ημέρες και η υπηρεσία δεν έχει χρησιμοποιηθεί πολύ, γράψε μας με το email του λογαριασμού σου και μια σύντομη σημείωση για τον λόγο. Αυτές οι επιστροφές εγκρίνονται χωρίς τριβές.",
              "Αν έχουν περάσει πάνω από 14 ημέρες, η ομάδα το εξετάζει κατά περίπτωση. Ακύρωσε τη συνδρομή για να μην ανανεώνεται και στείλε μας email.",
            ],
          },
          {
            id: "unknown-charge",
            q: "Τι είναι αυτή η χρέωση στην κάρτα μου;",
            a: [
              "Οι χρεώσεις εμφανίζονται ως GADIT ή GADIT.APP. Το ποσό αντιστοιχεί στο πλάνο σου (Individual ή Family, μηνιαίο ή ετήσιο) στο νόμισμα της χώρας σου, όπως φαίνεται στη σελίδα τιμών. Οι συνδρομές που ξεκίνησαν πριν τον Οκτώβριο του 2026 κρατούν την τιμή με την οποία ξεκίνησαν. Αν το ποσό δεν ταιριάζει, μπορεί να προέρχεται από άλλη υπηρεσία.",
              "Αν είσαι σίγουρος ότι δεν είναι δική σου, μην κάνεις ακόμα αμφισβήτηση μέσω της τράπεζάς σου. Γράψε μας πρώτα απευθείας με την ημερομηνία και το ποσό. Η ομάδα θα τη βρει, θα σου εξηγήσει τι είναι και θα κάνει επιστροφή αν χρειάζεται. Μια αμφισβήτηση στην τράπεζα μπορεί να δυσκολέψει τις μελλοντικές χρεώσεις, οπότε η επίλυση μέσω της υποστήριξης είναι συνήθως πιο γρήγορη και ασφαλής.",
            ],
          },
          {
            id: "failed-payment",
            q: "Η πληρωμή μου απέτυχε. Τι πρέπει να κάνω;",
            a: [
              "Το Stripe επαναλαμβάνει αυτόματα τις αποτυχημένες πληρωμές μερικές φορές μέσα στις επόμενες μέρες. Οι περισσότερες αποτυχίες λύνονται από μόνες τους μόλις η τράπεζα απελευθερώσει τη δέσμευση ή η κάρτα έχει αρκετό υπόλοιπο.",
              "Μια μπάρα στο πάνω μέρος της σελίδας θα λέει ότι η χρέωση δεν πέρασε και η πρόσβασή σου διατηρείται για λίγες ακόμα μέρες. Πάτησε εκεί \"Ενημέρωση κάρτας\", βάλε μια κάρτα που λειτουργεί και θα δοκιμάσουμε αμέσως τη χρέωση σε αυτήν. Αν η συνδρομή σου έχει ήδη περάσει σε Basic, μπορείς να γραφτείς ξανά από τη σελίδα Pricing και το σημειωματάριό σου μένει ανέπαφο.",
            ],
          },
          {
            id: "plan-comparison",
            q: "Ποια είναι η διαφορά ανάμεσα στα Basic, Individual και Family;",
            a: [
              "Basic (δωρεάν): έως 10 αναζητήσεις λέξεων τη μέρα, όλες οι σημασίες, παραδείγματα, ιδιωματισμοί, η προέλευση της λέξης, η σωστή σημασία μέσα από μια πρόταση και ένα τετράδιο με έως 30 λέξεις.",
              "Individual: ένα άτομο, όλα τα εργαλεία μάθησης. Απεριόριστες αναζητήσεις, μια εικόνα για κάθε σημασία, περισσότερα παραδείγματα και ερωτήσεις για κάθε λέξη, σύνθεση πρότασης με σχόλια, Κάθε λέξη, Πες το, φυσική φωνή ανάγνωσης και φωνητική αναζήτηση, χρήση χωρίς σύνδεση, παιχνίδια, κουίζ και μονομαχίες λέξεων, και έξυπνη εξάσκηση με προετοιμασία για τεστ και ορθογραφία.",
              "Family: όλα όσα έχει το Individual για έως 5 παιδιά και τους γονείς, συν τη λειτουργία για παιδιά, ξεχωριστό χώρο για κάθε παιδί, βοήθεια με τα μαθήματα και τον πίνακα γονέα με ειδοποίηση για κάθε λέξη. Τα σχολεία έχουν δικό τους πλάνο. Οι τιμές για τη χώρα σου και η δωρεάν δοκιμή 14 ημερών είναι στη σελίδα τιμών.",
            ],
          },
        ],
      },
      {
        id: "account",
        icon: "👤",
        title: "Λογαριασμός και σύνδεση",
        items: [
          {
            id: "no-verification-email",
            q: "Δεν έλαβα το email επιβεβαίωσης",
            a: [
              "Έλεγξε πρώτα τους φακέλους ανεπιθύμητης αλληλογραφίας και προσφορών. Το Gmail και το Outlook μερικές φορές δρομολογούν εκεί τα emails λογαριασμού, μέχρι να επισημάνεις κάποιο ως \"Not spam\".",
              "Αν δεν είναι εκεί, ίσως το email γράφτηκε λάθος κατά την εγγραφή. Δοκίμασε να εγγραφείς ξανά και έλεγξε προσεκτικά τη διεύθυνση. Αν χρησιμοποίησες εγγραφή με Google, δεν χρειάζεται email επιβεβαίωσης.",
            ],
          },
          {
            id: "forgot-password",
            q: "Ξέχασα τον κωδικό μου",
            a: [
              "Στο παράθυρο σύνδεσης, πληκτρολόγησε το email σου και μετά πάτησε \"Ξέχασες τον κωδικό;\". Ένας σύνδεσμος επαναφοράς φτάνει συνήθως στο email σου μέσα σε ένα ή δύο λεπτά. Μπορείς επίσης να πατήσεις \"Στείλτε μου σύνδεσμο σύνδεσης\" και να συνδεθείς χωρίς κωδικό.",
              "Αν το email δεν φτάσει, έλεγξε τα ανεπιθύμητα. Αν πάλι δεν φτάσει, μπορεί να έκανες εγγραφή με Google αντί για email και κωδικό. Δοκίμασε το κουμπί \"Συνέχισε με Google\".",
            ],
          },
          {
            id: "wrong-credentials",
            q: "Είμαι σίγουρος ότι ο κωδικός μου είναι σωστός αλλά λέει \"Λάθος email ή κωδικός\"",
            a: [
              "Τρία πράγματα να ελέγξεις. Πρώτον, το Caps Lock. Δεύτερον, ένα έξτρα κενό στο τέλος μετά από αντιγραφή και επικόλληση. Τρίτον, μπορεί να έκανες εγγραφή με Google αντί για κωδικό, οπότε χρησιμοποίησε το \"Συνέχισε με Google\".",
              "Ακόμα κολλημένος; Στο ίδιο μήνυμα πάτησε \"Στείλτε μου σύνδεσμο σύνδεσης\" για να μπεις χωρίς κωδικό, ή \"Ορισμός νέου κωδικού\".",
            ],
          },
          {
            id: "google-fails",
            q: "Η σύνδεση με Google δεν λειτουργεί",
            a: [
              "Μέσα σε εφαρμογές όπως Instagram, Facebook ή TikTok, το κουμπί Google είναι κρυμμένο. Άνοιξε τον σύνδεσμο στον κανονικό σου browser ή συνδέσου με το email σου. Αν έκανες εγγραφή με Google, πληκτρολόγησε εκείνο το email και πάτησε \"Στείλτε μου σύνδεσμο σύνδεσης\".",
              "Σε ιδιωτικό παράθυρο, τα μπλοκαρισμένα cookies μπορεί να εμποδίζουν τη σύνδεση με Google, οπότε δοκίμασε ένα κανονικό παράθυρο.",
            ],
          },
          {
            id: "change-email",
            q: "Πώς αλλάζω το email του λογαριασμού μου;",
            a: [
              "Η αλλαγή του email του λογαριασμού γίνεται από την ομάδα. Στείλε μας email από την τωρινή σου διεύθυνση και γράψε το νέο email στο μήνυμα. Η ομάδα θα το ενημερώσει και η συνδρομή, το ιστορικό και το σημειωματάριό σου θα μείνουν όπως είναι.",
            ],
          },
          {
            id: "delete-account",
            q: "Πώς διαγράφω τον λογαριασμό μου;",
            a: [
              "Στο κάτω μέρος της σελίδας \"Λογαριασμός\", πάτησε \"Διαγραφή λογαριασμού\" και πληκτρολόγησε το email του λογαριασμού σου για επιβεβαίωση. Αυτό είναι μόνιμο: η συνδρομή σου ακυρώνεται, το σημειωματάριο και το ιστορικό σου διαγράφονται και το email απελευθερώνεται για νέα εγγραφή.",
              "Η μόνη εξαίρεση είναι μια συνδρομή που αγοράστηκε στο App Store: η διαγραφή του λογαριασμού δεν την ακυρώνει, οπότε ακύρωσέ την πρώτα από τις ρυθμίσεις συνδρομών της Apple.",
              "Τα αρχεία παλιών χρεώσεων παραμένουν, γιατί ο νόμος μάς υποχρεώνει να τα κρατάμε για λογιστικούς λόγους.",
            ],
          },
          {
            id: "share-account",
            q: "Μπορεί ο σύντροφος ή το παιδί μου να μοιραστεί τον λογαριασμό μου;",
            a: [
              "Σε κάθε λογαριασμό είναι συνδεδεμένο ένα άτομο κάθε φορά. Για ένα νοικοκυριό, το πλάνο Family είναι φτιαγμένο ακριβώς γι' αυτό: έως 5 παιδιά και οι γονείς, ο καθένας με τον δικό του χώρο, το δικό του τετράδιο και τη δική του πρόοδο, συν τη λειτουργία για παιδιά για τα παιδιά και έναν πίνακα γονέα.",
              "Για έναν ενήλικα μόνο του, το Individual καλύπτει ένα άτομο με όλα τα εργαλεία μάθησης. Σύγκρινε τα πλάνα και τις τιμές για τη χώρα σου στη σελίδα τιμών.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "Νομίζω ότι έχω δύο λογαριασμούς κατά λάθος. Τι κάνω τώρα;",
            a: [
              "Αυτό συνήθως συμβαίνει όταν κάποιος εγγράφεται μία φορά με Google και μία φορά με email και κωδικό χρησιμοποιώντας την ίδια διεύθυνση, ή όταν εγγράφεσαι δύο φορές με διαφορετικές διευθύνσεις email. Κάθε εγγραφή δημιουργεί έναν ξεχωριστό λογαριασμό Gadit με δικό του σημειωματάριο, ιστορικό και κατάσταση συνδρομής.",
              "Στείλε μας email από μία από τις δύο διευθύνσεις και γράψε και την άλλη διεύθυνση, μαζί με ποιον λογαριασμό θέλεις να κρατήσεις. Η ομάδα θα συγχωνεύσει το σημειωματάριο και το ιστορικό στον λογαριασμό που θα επιλέξεις και μετά θα κλείσει τον άλλον καθαρά. Δεν θα χαθεί κανένα δεδομένο.",
            ],
          },
        ],
      },
      {
        id: "product",
        icon: "🔍",
        title: "Χρήση του Gadit",
        items: [
          {
            id: "wrong-definition",
            q: "Νομίζω ότι ο ορισμός είναι λάθος. Τι κάνω;",
            a: [
              "Δίπλα σε κάθε σημασία, και στις κάρτες ιδιωματισμών και προέλευσης λέξης, υπάρχει ένα μικρό εικονίδιο σημαίας. Πάτησέ το, διάλεξε τι δεν πάει καλά και, αν θέλεις, πρόσθεσε μια σύντομη σημείωση. Έρχεται κατευθείαν στην ομάδα και κάθε αναφορά εξετάζεται.",
              "Μην ανησυχείς αν είσαι πολύ σχολαστικός. Το λεξικό βελτιώνεται από αυτή την ανατροφοδότηση πιο γρήγορα από οτιδήποτε άλλο.",
            ],
          },
          {
            id: "kids-not-working",
            q: "Η λειτουργία για παιδιά δεν αλλάζει την επεξήγηση",
            a: [
              "Η λειτουργία για παιδιά αλλάζει το κείμενο μόνο όταν η λέξη έχει ήδη επεξήγηση φιλική προς τα παιδιά. Για μια λέξη που μόλις αναζήτησες για πρώτη φορά, δώσε 10 με 15 δευτερόλεπτα μέχρι να ετοιμαστεί η έκδοση για παιδιά.",
              "Η λειτουργία για παιδιά είναι μέρος του πλάνου Family. Στο Individual θα δεις αντί γι' αυτήν τον διακόπτη \"Με απλά λόγια\", που δίνει πιο απλή επεξήγηση για κάθε σημασία. Στο Basic ή χωρίς λογαριασμό δεν υπάρχει διακόπτης. Οι συνδρομητές που μπήκαν στο Clear ή στο Deep πριν τον Οκτώβριο του 2026 κρατούν τη λειτουργία για παιδιά. Για να την αποκτήσεις, δες το Family στη σελίδα τιμών.",
            ],
          },
          {
            id: "voice-fails",
            q: "Η φωνητική αναζήτηση δεν λειτουργεί",
            a: [
              "Η φωνητική αναζήτηση χρειάζεται άδεια μικροφώνου. Οι περισσότεροι browsers ρωτούν μία φορά για κάθε ιστότοπο. Αν το μπλόκαρες κατά λάθος, πάτησε το εικονίδιο δίπλα στο gadit.app στη γραμμή διευθύνσεων και επέτρεψε το μικρόφωνο στις άδειες του ιστότοπου.",
              "Σε iPhone και iPad, επέτρεψε επίσης το μικρόφωνο για το Safari από την εφαρμογή Ρυθμίσεις της συσκευής. Η φωνητική αναζήτηση είναι μέρος των πλάνων Individual και Family, οπότε στο Basic και χωρίς λογαριασμό το κουμπί του μικροφώνου δεν εμφανίζεται. Για αναβάθμιση, άνοιξε τη σελίδα τιμών.",
            ],
          },
          {
            id: "no-image",
            q: "Δεν μπορώ να πάρω εικόνα για τη λέξη",
            a: [
              "Οι εικόνες είναι μέρος των πλάνων Individual και Family, με έως 100 νέες εικόνες τον μήνα. Μια εικόνα που υπάρχει ήδη για αυτή τη σημασία ανοίγει χωρίς να μετράει. Το παλαιότερο πλάνο Clear έχει 30 τον μήνα, και το Basic δεν περιλαμβάνει εικόνες. Όταν τελειώσουν οι εικόνες του μήνα θα δεις μια ειδοποίηση, και η μέτρηση ξεκινά ξανά στην αρχή κάθε μήνα.",
              "Αν είσαι κάτω από το όριο και εξακολουθείς να βλέπεις αποτυχίες, συνήθως είναι παροδικό. Δοκίμασε ξανά σε 30 δευτερόλεπτα. Οι επίμονες αποτυχίες είναι σφάλμα. Κάνε αναφορά από τη σελίδα της λέξης.",
            ],
          },
          {
            id: "save-word",
            q: "Πώς αποθηκεύω μια λέξη στο τετράδιό μου;",
            a: [
              "Δεν χρειάζεται. Όταν είσαι συνδεδεμένος, κάθε λέξη που αναζητάς αποθηκεύεται μόνη της στο τετράδιό σου. Στο Basic το τετράδιο χωράει έως 30 λέξεις. Στα Individual και Family δεν έχει όριο και περιλαμβάνει έξυπνη εξάσκηση, που σου φέρνει πίσω τις λέξεις σου για επανάληψη την κατάλληλη στιγμή.",
              "Στα Individual και Family, οι λέξεις που αναζητάς κρατιούνται επίσης στη συσκευή σου, ώστε να ανοίγουν χωρίς ίντερνετ. Για να δεις τις λέξεις σου, άνοιξε το τετράδιο από το μενού.",
            ],
          },
          {
            id: "offline",
            q: "Πώς χρησιμοποιώ το Gadit χωρίς σύνδεση;",
            a: [
              "Η χρήση χωρίς σύνδεση είναι μέρος των πλάνων Individual και Family. Κάθε λέξη που αναζητάς κρατιέται στη συσκευή σου, ώστε να ανοίγει ξανά αμέσως χωρίς ίντερνετ. Μπορείς επίσης να πατήσεις \"Κατέβασε πακέτο εκτός σύνδεσης\" στη σελίδα \"Λογαριασμός\" για να αποθηκεύσεις σε αυτή τη συσκευή τις λέξεις του λεξικού μας στη γλώσσα σου.",
              "Η αναζήτηση μιας εντελώς καινούριας λέξης χρειάζεται ακόμα σύνδεση, γιατί το Gadit πρέπει να ετοιμάσει το πλήρες αποτέλεσμα γι' αυτήν. Το αντίγραφο χωρίς σύνδεση καλύπτει τις λέξεις που είναι ήδη στη συσκευή σου. Αν είσαι στο Basic, δες τα πλάνα στη σελίδα τιμών.",
            ],
          },
          {
            id: "slow",
            q: "Η εφαρμογή μοιάζει αργή",
            a: [
              "Η πρώτη αναζήτηση μιας λέξης είναι η πιο αργή, γιατί το Gadit δημιουργεί ολόκληρο το αποτέλεσμα από την αρχή: συνήθως λίγα δευτερόλεπτα, μερικές φορές περισσότερο για σύνθετες λέξεις. Οι επόμενες αναζητήσεις της ίδιας λέξης είναι ακαριαίες, σερβίρονται από τη μνήμη.",
              "Αν όλα μοιάζουν αργά, δοκίμασε μια σκληρή ανανέωση: Cmd+Shift+R σε Mac, Ctrl+Shift+R σε Windows. Αν η βραδύτητα επιμένει σε όλες τις σελίδες, στείλε μας email με τη χώρα και τον browser σου, ώστε η ομάδα να ελέγξει τη διαδρομή του δικτύου προς τους διακομιστές μας από την περιοχή σου.",
            ],
          },
          {
            id: "word-not-found",
            q: "Αναζήτησα μια λέξη και δεν πήρα αποτέλεσμα. Τι συμβαίνει;",
            a: [
              "Πρώτα, έλεγξε την ορθογραφία. Αν υπήρχε τυπογραφικό λάθος, το Gadit συνήθως δείχνει τη διορθωμένη λέξη, με σύνδεσμο για να ψάξεις παρ' όλα αυτά αυτό που πληκτρολόγησες.",
              "Πολύ σπάνιες λέξεις ή αργκό δεν δίνουν πάντα αποτέλεσμα. Αν είσαι σίγουρος ότι η λέξη υπάρχει, γράψε μας από αυτή τη σελίδα και η ομάδα θα το ελέγξει.",
            ],
          },
          {
            id: "change-language",
            q: "Πώς αλλάζω τη γλώσσα του περιβάλλοντος;",
            a: [
              "Στην κορυφή της σελίδας υπάρχει ένα εικονίδιο υδρογείου με την τρέχουσα γλώσσα σου. Πάτησέ το και διάλεξε γλώσσα.",
              "Η επιλογή σου αποθηκεύεται σε αυτή τη συσκευή. Όλα ξαναφορτώνουν στη νέα γλώσσα: το περιβάλλον, τα μενού, οι μελλοντικοί ορισμοί λέξεων, τα παραδείγματα, οι επεξηγήσεις για παιδιά, ακόμα και η προέλευση της λέξης. Οι λέξεις που έχεις ήδη αναζητήσει στην παλιά γλώσσα θα εμφανίζονται σε αυτήν μέχρι να τις αναζητήσεις ξανά.",
            ],
          },
        ],
      },
      {
        id: "partner",
        icon: "🤝",
        title: "Πρόγραμμα συνεργατών",
        items: [
          {
            id: "join-partner",
            q: "Πώς γίνομαι συνεργάτης του Gadit;",
            a: [
              "Πήγαινε στο gadit.app/partners και πάτησε \"Μπες δωρεάν\". Βάλε το όνομά σου και το email σου και μετά πάτησε \"Πάρε τον κωδικό συνεργάτη μου\". Ο προσωπικός σου σύνδεσμος και ο πίνακας συνεργατών σου, με κλικ και προμήθειες, είναι έτοιμα αμέσως, χωρίς αναμονή για έγκριση. Ο κωδικός και ο σύνδεσμος έρχονται και με email.",
              "Η συμμετοχή είναι δωρεάν και ανοιχτή σε όλους. Δεν χρειάζεσαι συνδρομή στο Gadit για να γίνεις συνεργάτης.",
            ],
          },
          {
            id: "commission-model",
            q: "Πώς υπολογίζονται οι προμήθειες;",
            a: [
              "Οι κανονικοί όροι είναι 25% από κάθε πληρωμή που κάνει ένας πελάτης τον πρώτο του χρόνο. Μετά τον πρώτο χρόνο, κερδίζεις 10% από κάθε πληρωμή για όσο ο πελάτης συνεχίζει να πληρώνει. Αν φέρεις 5 πελάτες που πληρώνουν, το ποσοστό σου μετά τον πρώτο χρόνο ανεβαίνει στο 15% για πάντα.",
              "Αυτό ισχύει το ίδιο για μηνιαία και ετήσια πλάνα, γιατί η προμήθεια υπολογίζεται σε κάθε πραγματική πληρωμή. Αν ένας πελάτης ακυρώσει, η προμήθειά σου σταματά με την τελευταία του πληρωμή.",
              "Η ομάδα μπορεί να ορίσει διαφορετικά ποσοστά για συγκεκριμένους συνεργάτες. Τα δικά σου ποσοστά φαίνονται πάντα στον πίνακα συνεργατών σου.",
            ],
          },
          {
            id: "payout",
            q: "Πότε πληρώνομαι;",
            a: [
              "Μία φορά τον μήνα, όταν το υπόλοιπό σου φτάσει το ελάχιστο ποσό που φαίνεται στον πίνακα συνεργατών σου. Το στέλνουμε στον λογαριασμό PayPal που ορίζεις εκεί. Το ελάχιστο είναι όριο, όχι ταβάνι. Μπορείς να κερδίσεις πολύ περισσότερα και λαμβάνεις την πληρωμή μόλις το ξεπεράσεις.",
              "Οι προμήθειες αποδεσμεύονται 30 ημέρες μετά την πληρωμή της συνδρομής, ώστε να υπάρχει το παράθυρο επιστροφών. Έτσι, μια συνδρομή του Ιανουαρίου αποδεσμεύεται στις αρχές Φεβρουαρίου και μπαίνει στην επόμενη πληρωμή σου μόλις το υπόλοιπό σου φτάσει το ελάχιστο.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "Εγγράφηκα αλλά ο πίνακάς μου είναι άδειος",
            a: [
              "Τα στατιστικά εμφανίζονται μετά το πρώτο κλικ στον σύνδεσμό σου. Άδειος σημαίνει απλώς ότι κανείς δεν έχει κάνει κλικ ακόμα. Πήγαινε να μοιραστείς τον σύνδεσμο. Ο πίνακας ενημερώνεται σχεδόν σε πραγματικό χρόνο μόλις ξεκινήσει η δραστηριότητα.",
              "Αν έχεις μοιραστεί τον σύνδεσμο και κάποιος έχει εγγραφεί αλλά ο πίνακας δεν το δείχνει, γράψε μας με τον κατά προσέγγιση χρόνο της εγγραφής και η ομάδα θα ελέγξει από πού ήρθε η εγγραφή.",
            ],
          },
          {
            id: "attribution-window",
            q: "Για πόσο καιρό ο σύνδεσμος παραπομπής μου συνεχίζει να παρακολουθεί έναν επισκέπτη;",
            a: [
              "Εξήντα ημέρες. Όταν ένας επισκέπτης κάνει κλικ στον σύνδεσμό σου, ορίζουμε ένα cookie που σε αναγνωρίζει ως τον παραπέμποντα. Αν εγγραφεί και κάνει συνδρομή οποιαδήποτε στιγμή μέσα στις επόμενες 60 ημέρες (ακόμα κι αν φύγει από τον ιστότοπο και επιστρέψει αργότερα μέσω αναζήτησης στο Google), η απόδοση εξακολουθεί να πιστώνεται σε εσένα.",
              "Εκκαθάριση cookies: αν ο επισκέπτης καθαρίσει τα cookies του ή αλλάξει browser ή συσκευή πριν εγγραφεί, η απόδοση μπορεί να χαθεί. Δεν υπάρχει λύση γι' αυτό, αλλά οι 60 ημέρες είναι ένα γενναιόδωρο παράθυρο σε σύγκριση με τα περισσότερα προγράμματα συνεργατών.",
            ],
          },
          {
            id: "missing-commission",
            q: "Κάποιος εγγράφηκε μέσω του συνδέσμου μου αλλά δεν βλέπω την προμήθεια",
            a: [
              "Τις περισσότερες φορές είναι θέμα χρονισμού. Η εγγραφή εμφανίζεται στον πίνακα μέσα σε λίγα λεπτά, αλλά η προμήθεια καταχωρείται μόνο όταν η συνδρομή πληρωθεί πραγματικά, κάτι που μπορεί να γίνει μέρες αργότερα αν είναι σε δωρεάν δοκιμή. Έλεγξε ξανά αφού λήξει η δοκιμή.",
              "Αν η συνδρομή πληρώθηκε αλλά εξακολουθείς να μη βλέπεις την προμήθεια μετά από 48 ώρες, γράψε μας με τον κατά προσέγγιση χρόνο εγγραφής και το email ή το κατά προσέγγιση όνομα του συνδρομητή, αν το ξέρεις. Η ομάδα θα ελέγξει από πού ήρθε η εγγραφή και θα διορθώσει χειροκίνητα οποιαδήποτε αστοχία.",
            ],
          },
        ],
      },
      {
        id: "general",
        icon: "❓",
        title: "Γενικά",
        items: [
          {
            id: "what-is-gadit",
            q: "Τι είναι το Gadit;",
            a: [
              "Το Gadit σε βοηθά να καταλάβεις κάθε λέξη μέχρι το τέλος, όχι απλώς να πάρεις έναν ορισμό μιας γραμμής. Κάθε λέξη ανοίγει με όλες τις σημασίες της, πραγματικά παραδείγματα για κάθε σημασία, ιδιωματισμούς και την προέλευση της λέξης. Τα πλάνα επί πληρωμή προσθέτουν μια εικόνα για κάθε σημασία, εξάσκηση, παιχνίδια και πολλά άλλα, και το Family προσθέτει τη λειτουργία για παιδιά και έναν χώρο για κάθε παιδί.",
              "Το Gadit λειτουργεί σε 41 γλώσσες. Εσωτερικά, η ομάδα το λέει «να κάνεις GAD σε μια λέξη»: να την καταλάβεις μέχρι το τέλος, όχι απλώς να τη μεταφράσεις. Για να δεις τι περιλαμβάνει κάθε πλάνο, άνοιξε τη σελίδα τιμών.",
            ],
          },
          {
            id: "languages",
            q: "Ποιες γλώσσες υποστηρίζετε;",
            a: [
              "Το Gadit λειτουργεί σε 41 γλώσσες, ανάμεσά τους Αγγλικά, Εβραϊκά, Αραβικά, Ισπανικά, Γαλλικά, Γερμανικά, Ρωσικά, Κινεζικά, Ιαπωνικά, Χίντι, Ζουλού, Κόσα και Αφρικάανς.",
              "Μπορείς να αναζητήσεις μια λέξη σε οποιαδήποτε από αυτές τις γλώσσες και να πάρεις τις σημασίες, τα παραδείγματα και όλα τα υπόλοιπα στη γλώσσα που διάλεξες για το περιβάλλον. Τα Εβραϊκά, τα Αραβικά και τα Περσικά διαβάζονται από δεξιά προς τα αριστερά, με τις δικές τους γραμματοσειρές. Για αλλαγή, πάτησε το κουμπί γλώσσας στο πάνω μέρος κάθε σελίδας.",
            ],
          },
          {
            id: "kid-safety",
            q: "Είναι το Gadit ασφαλές για παιδιά;",
            a: [
              "Το Gadit σχεδιάστηκε για να το χρησιμοποιεί ένας γονέας με ασφάλεια δίπλα σε ένα παιδί. Η λειτουργία για παιδιά παράγει επεξηγήσεις που είναι απλές, συγκεκριμένες και κατάλληλες για την ηλικία (γύρω στο επίπεδο 5 με 10 ετών), χρησιμοποιώντας τον ίδιο μηχανισμό που τροφοδοτεί το περιεχόμενο για ενήλικες, με ρητές οδηγίες για απλοποίηση. Κανένα περιεχόμενο που δημιουργείται από χρήστες δεν εμφανίζεται ποτέ σε παιδιά.",
              "Σύμφωνα με τις πολιτικές μας και τους κανόνες για την ιδιωτικότητα των παιδιών σε όλο τον κόσμο, ένας δικός σου λογαριασμός είναι για ηλικίες 13 και άνω. Τα παιδιά χρησιμοποιούν το Gadit μέσω ενός γονέα: στο πλάνο Family ο γονέας προσθέτει κάθε παιδί από τη σελίδα Οικογένεια, κάθε παιδί παίρνει τον δικό του χώρο με τη λειτουργία για παιδιά, και ο πίνακας γονέα δείχνει τις λέξεις που αναζητά κάθε παιδί. Για να το ρυθμίσεις, ξεκίνα με το Family στη σελίδα τιμών.",
            ],
          },
          {
            id: "data",
            q: "Πού αποθηκεύονται τα δεδομένα μου; Τα πουλάτε;",
            a: [
              "Ο λογαριασμός, το ιστορικό, το τετράδιο και οι εικόνες που δημιουργήθηκαν αποθηκεύονται με ασφάλεια στο Firebase, κρυπτογραφημένα στην αποθήκευση. Δεν πουλάμε τα δεδομένα σου σε κανέναν. Μοιραζόμαστε μόνο ό,τι χρειάζεται για να λειτουργεί το Gadit (αποθήκευση, πληρωμές, πάροχοι περιεχομένου), όπως περιγράφεται στην Πολιτική Απορρήτου.",
              "Μπορείς να διαγράψεις τον λογαριασμό σου οποιαδήποτε στιγμή από τη σελίδα Λογαριασμός. Για να πάρεις αντίγραφο του τετραδίου σου ή άλλων δεδομένων που κρατάμε, γράψε μας από αυτή τη σελίδα.",
            ],
          },
          {
            id: "contact-direct",
            q: "Πώς επικοινωνώ μαζί σας απευθείας;",
            a: [
              "Χρησιμοποίησε το κουμπί email στο κάτω μέρος αυτής της σελίδας. Πηγαίνει κατευθείαν στα εισερχόμενα της ομάδας. Κάθε μήνυμα διαβάζεται και λαμβάνει απάντηση μέσα σε 24 με 48 ώρες (συχνά πιο γρήγορα).",
              "Το email υπερτερεί του chat για υποστήριξη: δίνει στην ομάδα την ευκαιρία να διαβάσει προσεκτικά και να απαντήσει στοχευμένα. Τηλεφωνική υποστήριξη δεν προσφέρεται ακόμα.",
            ],
          },
        ],
      },
    ],
  },
  he: {
    eyebrow: "מרכז עזרה",
    heading: "מצאו תשובה מהר",
    lede: "שאלות נפוצות ופתרונות שלב שלב, מסודרים לפי תחום. לא רואים את הבעיה שלכם? אפשר לפנות אלינו ישירות למטה.",
    stillNeedHelpHeading: "עדיין תקועים?",
    stillNeedHelpBody: "כתבו לנו ישירות. כל הודעה נקראת על ידי הצוות, ותגובה תגיע בדרך כלל תוך יום או יומיים.",
    emailCta: "שלחו לנו מייל",
    responseTime: "זמן תגובה אופייני: עד 48 שעות.",
    categories: [
      {
        id: "billing",
        icon: "💳",
        title: "חיוב ומנוי",
        items: [
          {
            id: "change-card",
            q: "איך מחליפים את כרטיס האשראי של המנוי?",
            a: [
              "אפשר להחליף לכרטיס חדש בפחות מדקה, בלי לבטל. המנוי הנוכחי שלכם ממשיך, פשוט עם הכרטיס החדש.",
              "1. היכנסו ל-gadit.app ופתחו את \"החשבון שלי\" מתפריט החשבון. 2. לחצו על \"ניהול חיוב\". 3. ייפתח מסך מאובטח של Stripe. הוסיפו בו את הכרטיס החדש כאמצעי תשלום וסמנו אותו כברירת מחדל. 4. אם תרצו, מחקו את הכרטיס הישן.",
              "מהחיוב הבא והלאה הכל ילך לכרטיס החדש. החיוב הקודם (שכבר נגבה) נשאר על הכרטיס הישן. אין צורך בהחזר אלא אם תרצו אחד באופן ספציפי.",
            ],
          },
          {
            id: "cancel",
            q: "איך מבטלים מנוי?",
            a: [
              "בעצמכם, בכל רגע. מתחברים, נכנסים לחשבון ולוחצים \"ביטול המנוי\" מתחת למסלול.",
              "קניתם את המנוי באפליקציה לאייפון או לאייפד? מבטלים אותו בהגדרות המנויים של Apple, והקישור \"ניהול המנוי\" בעמוד החשבון מוביל לשם.",
              "במנוי בתשלום, הגישה ממשיכה עד סוף התקופה ששילמתם עליה. אחר כך החשבון עובר ל-Basic (חינמי), והמילים השמורות וההיסטוריה נשארות שמורות.",
              "בתקופת הניסיון של 14 הימים, ביטול מסיים את הניסיון מיד, ולא יהיה שום חיוב. אם מה שמדאיג אתכם הוא רק החיוב האוטומטי, בחרו בסיבה הזאת בחלון הביטול, ותוכלו לכבות את החידוש ולהמשיך את הניסיון עד היום האחרון שלו.",
              "ביטלתם מנוי בתשלום בטעות או שיניתם את דעתכם? אפשר לחדש אותו מאותו עמוד לפני שהתקופה מסתיימת.",
            ],
          },
          {
            id: "switch-plan",
            q: "איך עוברים בין Individual ל-Family?",
            a: [
              "כדי לעבור ל-Family, היכנסו לעמוד החשבון ולחצו על \"מעבר ל-Family\". המנוי הנוכחי מתעדכן על אותו כרטיס, בלי להזין אותו מחדש.",
              "Stripe מחשב את ההפרש לפי הימים שנשארו בתקופה הנוכחית, כך שתשלמו רק את ההפרש. כדי לעבור מ-Family ל-Individual, כתבו לנו מהעמוד הזה והצוות יעביר אתכם.",
            ],
          },
          {
            id: "invoice",
            q: "איך מורידים חשבונית או קבלה?",
            a: [
              "חשבון, ואז ניהול חיוב, ואז Invoice history. לכל חיוב יש קבלת PDF להורדה עם פרטי החיוב ששמרתם.",
              "אם צריך שם, כתובת או מספר עוסק שונים על החשבונית (למשל שם חברה לצרכי מס), עדכנו את פרטי החיוב באותו עמוד לפני ההורדה. הקבלה הבאה תשתמש בפרטים החדשים.",
            ],
          },
          {
            id: "portal-error",
            q: "לחצתי על ניהול חיוב וקיבלתי שגיאה. מה לעשות?",
            a: [
              "שתי סיבות נפוצות. ראשית, לחשבון שלכם אין מנוי Stripe פעיל. שנית, ייתכן שפרופיל הלקוח שלכם ב-Stripe לא נוצר או לא הושלם כמו שצריך.",
              "בדיקה ראשונה פשוטה: צאו, היכנסו שוב עם האימייל שבו רכשתם, ונסו שוב. אם זה עדיין לא עובד, כתבו לנו עם האימייל של החשבון והצוות יסדר את זה מהצד שלנו בדקה.",
            ],
          },
          {
            id: "autorenew",
            q: "המנוי יתחדש אוטומטית?",
            a: [
              "כן. מנויים חודשיים מתחדשים כל חודש, מנויים שנתיים מתחדשים כל שנה באותו תאריך. אפשר לראות את תאריך החיוב הבא בעמוד החשבון וב-Stripe portal.",
              "אם אתם לא רוצים חידוש אוטומטי, בטלו בכל רגע לפני תאריך החידוש. הביטול אינו מיידי. אתם שומרים על הגישה עד סוף התקופה ששילמתם.",
            ],
          },
          {
            id: "refund",
            q: "אפשר לקבל החזר כספי?",
            a: [
              "כן. אם רכשתם לפני פחות מ-14 ימים ולא השתמשתם בשירות הרבה, כתבו לנו עם האימייל של החשבון והסבר קצר. החזרים כאלה מאושרים בלי להתעקש.",
              "אם עבר יותר מ-14 ימים, הצוות יטפל מקרה מקרה. בטלו את המנוי כדי שלא יתחדש, ושלחו לנו מייל.",
            ],
          },
          {
            id: "unknown-charge",
            q: "מה החיוב הזה בכרטיס שלי?",
            a: [
              "החיובים מופיעים בשם GADIT או GADIT.APP. בישראל החיוב בשקלים: Individual עולה ₪14.90 לחודש או ₪149 לשנה, ו-Family עולה ₪19.90 לחודש או ₪199 לשנה. מנויים שהתחילו לפני אוקטובר 2026 נשארים במחיר שבו התחילו. אם הסכום לא מתאים, ייתכן שהחיוב משירות אחר.",
              "אם אתם בטוחים שזה לא שלכם, אל תפנו לבנק עם מחלוקת עדיין. כתבו לנו קודם עם התאריך והסכום. הצוות ימצא, יסביר מה זה, ויחזיר אם צריך. פתיחת מחלוקת דרך הבנק עלולה לסבך את החיוב ואת החשבון שלכם בהמשך, לכן פנייה לתמיכה היא מהירה ובטוחה יותר.",
            ],
          },
          {
            id: "failed-payment",
            q: "התשלום שלי נכשל. מה לעשות?",
            a: [
              "Stripe מנסה אוטומטית לחייב מחדש כמה פעמים בימים שלאחר הכישלון. רוב הכשלים מסתדרים מעצמם ברגע שהבנק משחרר את ההקפאה או שהכרטיס חוזר ליתרה חיובית.",
              "בראש העמוד תופיע הודעה שהחיוב לא עבר, והגישה נשמרת עוד כמה ימים. לחצו שם \"עדכון כרטיס\", הזינו כרטיס תקין, וננסה לחייב אותו מיד. אם המנוי כבר ירד ל-Basic, אפשר להירשם שוב מעמוד המחירים, והמחברת שלכם נשארת שלמה.",
            ],
          },
          {
            id: "plan-comparison",
            q: "מה ההבדל בין Basic, Individual ו-Family?",
            a: [
              "Basic (חינם): עד 10 חיפושי מילים ביום, כל המשמעויות, דוגמאות, ניבים, מקור המילה, המשמעות הנכונה לפי המשפט, ומחברת של עד 30 מילים.",
              "Individual (₪14.90 לחודש או ₪149 לשנה): לאדם אחד, כל כלי הלימוד. חיפושים ללא הגבלה, תמונה לכל משמעות, עוד דוגמאות ושאלות על כל מילה, חיבור משפט עם משוב, כל מילה, תגיד את זה, הקראה בקול טבעי וחיפוש בקול, שימוש בלי אינטרנט, משחקים, חידונים ודו-קרב מילים, ותרגול חכם עם הכנה למבחן והכתבה.",
              "Family (₪19.90 לחודש או ₪199 לשנה): כל מה שיש ב-Individual לעד 5 ילדים ולהורים, ובנוסף מצב ילדים, אזור משלו לכל ילד, עזרה בשיעורי בית, ולוח הורה עם התראה על כל מילה. לבתי ספר יש מסלול נפרד. כל הפרטים ו-14 ימי הניסיון בחינם מחכים לכם בעמוד המחירים.",
            ],
          },
        ],
      },
      {
        id: "account",
        icon: "👤",
        title: "חשבון וכניסה",
        items: [
          {
            id: "no-verification-email",
            q: "לא קיבלתי מייל אימות",
            a: [
              "בדקו קודם את תיקיית הספאם והקידומים. Gmail ו-Outlook לפעמים מפנים מיילי חשבון לשם עד שמסמנים אחד כ\"לא ספאם\".",
              "אם זה לא שם, אולי הייתה טעות באימייל בהרשמה. נסו להירשם שוב ובדקו את הכתובת. אם נרשמתם דרך Google, לא נדרש מייל אימות.",
            ],
          },
          {
            id: "forgot-password",
            q: "שכחתי סיסמה",
            a: [
              "בחלון ההתחברות הקלידו את האימייל ולחצו \"שכחתם סיסמה?\". קישור לאיפוס מגיע למייל בדרך כלל תוך דקה או שתיים. אפשר גם ללחוץ \"שלחו לי קישור כניסה למייל\" ולהיכנס בלי סיסמה.",
              "אם המייל לא מגיע, בדקו ספאם. אם הוא עדיין לא מגיע, אולי נרשמתם עם Google ולא עם אימייל וסיסמה. נסו את הכפתור \"המשיכו עם Google\".",
            ],
          },
          {
            id: "wrong-credentials",
            q: "הסיסמה נכונה, אבל כתוב שהמייל או הסיסמה לא מתאימים",
            a: [
              "שלושה דברים לבדוק. ראשית, Caps Lock. שנית, רווח מיותר בסוף אחרי העתקה. שלישית, אולי נרשמתם עם Google ולא עם סיסמה (השתמשו ב-\"המשיכו עם Google\").",
              "עדיין תקועים? באותה הודעה לחצו \"שלחו לי קישור כניסה למייל\" כדי להיכנס בלי סיסמה, או \"בחירת סיסמה חדשה\".",
            ],
          },
          {
            id: "google-fails",
            q: "התחברות עם Google לא עובדת",
            a: [
              "בתוך אפליקציות כמו Instagram, Facebook או TikTok כפתור Google מוסתר. פתחו את הקישור בדפדפן הרגיל, או היכנסו עם האימייל. אם נרשמתם עם Google, הקלידו את האימייל הזה ולחצו \"שלחו לי קישור כניסה למייל\".",
              "בגלישה בסתר, חסימת cookies עלולה לעצור את הכניסה עם Google, לכן נסו בחלון רגיל.",
            ],
          },
          {
            id: "change-email",
            q: "איך משנים את האימייל של החשבון?",
            a: [
              "שינוי האימייל של החשבון נעשה דרך הצוות. שלחו לנו מייל מהכתובת הנוכחית וכתבו בו את הכתובת החדשה. הצוות יעדכן אותה, והמנוי, ההיסטוריה והמחברת נשארים כמו שהם.",
            ],
          },
          {
            id: "delete-account",
            q: "איך מוחקים חשבון?",
            a: [
              "בתחתית עמוד החשבון לחצו \"מחיקת חשבון\" והקלידו את האימייל של החשבון לאישור. זה לצמיתות: המנוי מבוטל, המחברת וההיסטוריה נמחקות, והאימייל מתפנה להרשמה חדשה.",
              "יוצא מן הכלל הוא מנוי שנקנה ב-App Store: מחיקת החשבון לא מבטלת אותו, ולכן בטלו אותו קודם בהגדרות המנויים של Apple.",
              "רשומות של חיובים קודמים נשארות, כי החוק מחייב אותנו לשמור אותן לצורכי הנהלת חשבונות.",
            ],
          },
          {
            id: "share-account",
            q: "בן הזוג או הילד שלי יכולים לחלוק את החשבון שלי?",
            a: [
              "בכל חשבון מחובר אדם אחד בכל רגע. למשפחה, מסלול Family בנוי בדיוק לזה: עד 5 ילדים וההורים, לכל אחד אזור משלו, מחברת והתקדמות משלו, ובנוסף מצב ילדים לילדים ולוח הורה.",
              "למבוגר אחד לבד, Individual מתאים לאדם אחד עם כל כלי הלימוד. השוו בין המסלולים והמחירים בעמוד המחירים.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "נראה שיש לי שני חשבונות בטעות. מה עושים?",
            a: [
              "זה קורה בדרך כלל כשמישהו נרשם פעם אחת עם Google ופעם נוספת עם אימייל וסיסמה לאותה הכתובת, או כשנרשמים פעמיים בכתובות שונות. כל הרשמה יוצרת חשבון נפרד ב-Gadit עם מחברת, היסטוריה ומנוי משלו.",
              "שלחו לנו מייל מאחת משתי הכתובות, וכתבו בו את הכתובת השנייה ואיזה חשבון תרצו להשאיר. הצוות יאחד את המחברת וההיסטוריה אל החשבון שבחרתם, ויסגור את השני בצורה נקייה. שום מידע לא יאבד.",
            ],
          },
        ],
      },
      {
        id: "product",
        icon: "🔍",
        title: "שימוש ב-Gadit",
        items: [
          {
            id: "wrong-definition",
            q: "ההגדרה לא נכונה. מה לעשות?",
            a: [
              "ליד כל משמעות, וגם בכרטיסי הניבים ומקור המילה, יש סמל קטן של דגל. לחצו עליו, בחרו מה לא בסדר, ואם רוצים, הוסיפו הערה קצרה. הדיווח מגיע ישירות לצוות, וכל דיווח נבדק.",
              "אל תדאגו להיות יותר מדי קפדנים. המילון משתפר מהפידבק הזה מהר יותר מכל דבר אחר.",
            ],
          },
          {
            id: "kids-not-working",
            q: "מצב ילדים לא מחליף את ההסבר",
            a: [
              "מצב ילדים מחליף את הטקסט רק כשלמילה כבר יש הסבר מותאם לילדים. אם חיפשתם מילה בפעם הראשונה, חכו 10 עד 15 שניות עד שההסבר לילדים יהיה מוכן.",
              "מצב ילדים הוא חלק ממסלול Family. ב-Individual מופיע במקומו המתג \"במילים פשוטות\", שמציג הסבר פשוט יותר לכל משמעות. ב-Basic או בלי חשבון אין מתג. מי שנרשמו ל-Clear או ל-Deep לפני אוקטובר 2026 ממשיכים ליהנות ממצב ילדים. כדי לקבל אותו, היכנסו ל-Family בעמוד המחירים.",
            ],
          },
          {
            id: "voice-fails",
            q: "חיפוש קולי לא עובד",
            a: [
              "חיפוש קולי דורש הרשאת מיקרופון. רוב הדפדפנים שואלים פעם אחת לכל אתר. אם חסמתם את המיקרופון בטעות, לחצו על הסמל שליד gadit.app בשורת הכתובת ואפשרו את המיקרופון בהרשאות האתר.",
              "באייפון ובאייפד צריך לאפשר את המיקרופון ל-Safari גם באפליקציית ההגדרות של המכשיר. חיפוש קולי הוא חלק ממסלולי Individual ו-Family, ולכן ב-Basic ובלי חשבון כפתור המיקרופון לא מופיע. כדי לשדרג, היכנסו לעמוד המחירים.",
            ],
          },
          {
            id: "no-image",
            q: "לא מצליחים לקבל תמונה למילה",
            a: [
              "תמונות הן חלק ממסלולי Individual ו-Family, עם עד 100 תמונות חדשות בחודש. תמונה שכבר קיימת למשמעות הזאת נפתחת בלי להיספר. במסלול Clear הישן יש 30 בחודש, ו-Basic לא כולל תמונות. כשהתמונות של החודש נגמרות תופיע הודעה, והספירה מתחילה מחדש בתחילת כל חודש.",
              "אם אתם מתחת למכסה ועדיין רואים כשלים, זה בדרך כלל זמני. נסו שוב בעוד 30 שניות. כשלים מתמשכים זה באג. אנא דווחו מעמוד המילה.",
            ],
          },
          {
            id: "save-word",
            q: "איך שומרים מילה במחברת?",
            a: [
              "אין צורך. כשאתם מחוברים, כל מילה שאתם מחפשים נשמרת במחברת מעצמה. ב-Basic המחברת מכילה עד 30 מילים. ב-Individual וב-Family אין הגבלה, ויש גם תרגול חכם שמחזיר אליכם את המילים לחזרה בזמן הנכון.",
              "ב-Individual וב-Family המילים שחיפשתם נשמרות גם במכשיר, כך שהן נפתחות גם בלי אינטרנט. כדי לראות את המילים שלכם, פתחו את המחברת מהתפריט.",
            ],
          },
          {
            id: "offline",
            q: "איך משתמשים ב-Gadit בלי אינטרנט?",
            a: [
              "שימוש בלי אינטרנט הוא חלק ממסלולי Individual ו-Family. כל מילה שאתם מחפשים נשמרת במכשיר, כך שהיא נפתחת שוב מיד גם בלי אינטרנט. אפשר גם ללחוץ \"הורדת חבילת אופליין\" בעמוד החשבון, ומילות המילון בשפה שלכם יישמרו במכשיר.",
              "חיפוש של מילה חדשה לגמרי עדיין דורש חיבור, כי Gadit צריך להכין בשבילה את התוצאה המלאה. העותק במכשיר כולל את המילים שכבר נמצאות בו. אם אתם ב-Basic, הציצו במסלולים בעמוד המחירים.",
            ],
          },
          {
            id: "slow",
            q: "האפליקציה מרגישה אטית",
            a: [
              "החיפוש הראשון של מילה הוא האטי ביותר, כי המערכת מייצרת את התוצאה המלאה מאפס. לרוב מדובר בכמה שניות, לפעמים יותר על מילים מורכבות. חיפושים חוזרים של אותה המילה מיידיים, כי הם מגיעים מהמטמון.",
              "אם הכל מרגיש אטי, נסו לרענן את הדף ברענון קשה: Cmd+Shift+R במק, או Ctrl+Shift+R בווינדוס. אם האיטיות נמשכת בכל העמודים, שלחו לנו מייל עם המדינה והדפדפן שלכם, כדי שהצוות יוכל לבדוק אם יש בעיית ניתוב מהאזור שלכם לשרתים.",
            ],
          },
          {
            id: "word-not-found",
            q: "חיפשתי מילה ולא קיבלתי תוצאה. מה קורה?",
            a: [
              "קודם כל בדקו את הכתיב. אם הייתה טעות הקלדה, Gadit מציג בדרך כלל את המילה המתוקנת, עם קישור לחפש בכל זאת את מה שהקלדתם.",
              "מילים נדירות מאוד או סלנג לא תמיד מקבלות תוצאה. אם אתם בטוחים שהמילה קיימת, כתבו לנו מהעמוד הזה, והצוות יבדוק.",
            ],
          },
          {
            id: "change-language",
            q: "איך משנים את שפת הממשק?",
            a: [
              "בראש העמוד יש סמל של גלובוס עם השפה הנוכחית. לחצו עליו ובחרו שפה.",
              "הבחירה נשמרת במכשיר. הכל ייטען מחדש בשפה החדשה: הממשק, התפריטים, הגדרות מילים עתידיות, הדוגמאות, ההסבר לילדים ואפילו מקור המילה. מילים שכבר חיפשתם בשפה הקודמת יוצגו בה עד שתחפשו אותן שוב.",
            ],
          },
        ],
      },
      {
        id: "partner",
        icon: "🤝",
        title: "תוכנית שותפים",
        items: [
          {
            id: "join-partner",
            q: "איך מצטרפים כשותפים ל-Gadit?",
            a: [
              "היכנסו ל-gadit.app/partners ולחצו \"הצטרפות בחינם\". מלאו שם ואימייל ולחצו \"קבלת קוד שותף\". הקישור האישי ואזור השותפים, עם מעקב אחרי קליקים ועמלות, מוכנים מיד, בלי המתנה לאישור. הקוד והקישור נשלחים אליכם גם במייל.",
              "ההצטרפות חינמית ופתוחה לכולם. לא צריך מנוי ל-Gadit כדי להיות שותפים.",
            ],
          },
          {
            id: "commission-model",
            q: "איך מחושבות העמלות?",
            a: [
              "התנאים הרגילים הם 25% מכל תשלום של לקוח בשנה הראשונה שלו. אחרי השנה הראשונה תקבלו 10% מכל תשלום, כל עוד הלקוח ממשיך לשלם. הבאתם 5 לקוחות משלמים? העמלה אחרי השנה הראשונה עולה ל-15% לכל החיים.",
              "זה עובד אותו דבר במנוי חודשי ובמנוי שנתי, כי העמלה מחושבת על כל תשלום בפועל. אם לקוח מבטל, העמלה שלכם נעצרת בתשלום האחרון שלו.",
              "הצוות יכול לקבוע אחוזים אחרים לשותפים מסוימים. האחוזים שלכם תמיד מופיעים באזור השותפים.",
            ],
          },
          {
            id: "payout",
            q: "מתי מקבלים את הכסף?",
            a: [
              "פעם בחודש, כשהיתרה לתשלום מגיעה לסכום המינימום שמופיע באזור השותפים. התשלום נשלח לחשבון ה-PayPal שהגדרתם שם. המינימום הוא סף, לא תקרה: אפשר להרוויח הרבה יותר, והתשלום מגיע כשעוברים אותו.",
              "העמלות משתחררות 30 יום אחרי תשלום המנוי, כדי לאפשר חלון להחזרים. כך עמלה על מנוי מינואר משתחררת בתחילת פברואר, ונכנסת לתשלום הבא כשהיתרה שלכם מגיעה למינימום.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "הצטרפתם ואזור השותפים ריק?",
            a: [
              "הסטטיסטיקות מופיעות אחרי הקליק הראשון על הקישור שלכם. ריק פירושו פשוט שאף אחד לא לחץ עדיין. צאו ושתפו את הקישור. אזור השותפים מתעדכן כמעט בזמן אמת ברגע שמתחילה פעילות.",
              "אם שיתפתם ומישהו נרשם אבל זה לא מופיע באזור השותפים, כתבו לנו עם הזמן המשוער שבו הוא נרשם, והצוות יבדוק מאיפה הגיעה ההרשמה.",
            ],
          },
          {
            id: "attribution-window",
            q: "כמה זמן לינק ההפניה שלי ממשיך לעקוב אחרי מבקרים?",
            a: [
              "60 ימים. כשמבקר לוחץ על הלינק שלכם, אנחנו שותלים cookie שמזהה אתכם כמפנים. אם הוא ירשם או יקנה מנוי בכל זמן ב-60 הימים הבאים, גם אם הוא יצא מהאתר וחזר מאוחר יותר דרך חיפוש בגוגל, השיוך עדיין יתייחס אליכם.",
              "אם המבקר מנקה cookies או עובר דפדפן או מכשיר לפני שהוא נרשם, השיוך יכול לאבד. אין דרך לעקוף את זה, אבל 60 ימים זה חלון נדיב יחסית לרוב תוכניות השותפים בשוק.",
            ],
          },
          {
            id: "missing-commission",
            q: "מישהו נרשם דרך הקישור שלכם והעמלה לא מופיעה?",
            a: [
              "ברוב המקרים זה עניין של תזמון: ההרשמה מופיעה באזור השותפים תוך דקות, אבל העמלה נרשמת רק כשהמנוי משולם בפועל, וזה יכול להיות כמה ימים אחר כך אם הוא בתקופת ניסיון. בדקו שוב אחרי שתקופת הניסיון נגמרת.",
              "אם המנוי שולם ועדיין אין עמלה אחרי 48 שעות, כתבו לנו עם הזמן המשוער של ההרשמה ועם האימייל או השם המשוער של הנרשם, אם אתם יודעים. הצוות יבדוק מאיפה הגיעה ההרשמה ויתקן ידנית כל פספוס.",
            ],
          },
        ],
      },
      {
        id: "general",
        icon: "❓",
        title: "כללי",
        items: [
          {
            id: "what-is-gadit",
            q: "מה זה Gadit?",
            a: [
              "Gadit עוזר להבין כל מילה עד הסוף, ולא רק לקבל הגדרה של שורה אחת. כל מילה נפתחת עם כל המשמעויות שלה, דוגמאות אמיתיות לכל משמעות, ניבים ומקור המילה. המסלולים בתשלום מוסיפים תמונה לכל משמעות, תרגול, משחקים ועוד, ו-Family מוסיף מצב ילדים ואזור משלו לכל ילד.",
              "Gadit עובד ב-41 שפות. אצלנו אומרים לעשות GAD למילה, כלומר להבין אותה עד הסוף, לא רק לתרגם אותה. כדי לראות מה כולל כל מסלול, היכנסו לעמוד המחירים.",
            ],
          },
          {
            id: "languages",
            q: "באילו שפות Gadit עובד?",
            a: [
              "Gadit עובד ב-41 שפות, ביניהן עברית, אנגלית, ערבית, ספרדית, צרפתית, גרמנית, רוסית, סינית, יפנית, הינדי, זולו, קוסה ואפריקאנס.",
              "אפשר לחפש מילה בכל אחת מהשפות האלה ולקבל את המשמעויות, הדוגמאות וכל השאר בשפה שבחרתם לממשק. עברית, ערבית ופרסית נכתבות מימין לשמאל, עם הגופנים שלהן. כדי להחליף שפה, לחצו על כפתור השפה בראש כל עמוד.",
            ],
          },
          {
            id: "kid-safety",
            q: "Gadit בטוח לילדים?",
            a: [
              "Gadit נבנה כך שהורה יוכל להשתמש בו עם הילד בצורה בטוחה ומבוקרת. מצב ילדים מייצר הסברים פשוטים, קונקרטיים ומתאימים לגיל (רמת 5 עד 10 שנים), עם אותו מנוע שמייצר את התוכן למבוגרים, רק עם הוראות מפורשות לפישוט. אף תוכן שמשתמשים יוצרים לא מוצג לילדים.",
              "בהתאם למדיניות שלנו ולכללי פרטיות ילדים בעולם, חשבון עצמאי מיועד לגיל 13 ומעלה. ילדים משתמשים ב-Gadit דרך ההורה: במסלול Family ההורה מוסיף כל ילד מעמוד המשפחה, כל ילד מקבל אזור משלו עם מצב ילדים, ולוח ההורה מראה את המילים שכל ילד מחפש. כדי להתחיל, היכנסו ל-Family בעמוד המחירים.",
            ],
          },
          {
            id: "data",
            q: "איפה הנתונים שלי שמורים? אתם מוכרים אותם?",
            a: [
              "חשבון, היסטוריה, מחברת ותמונות שנוצרו נשמרים באופן מאובטח אצל Firebase, מוצפנים באחסון. אנחנו לא מוכרים את הנתונים שלכם לאיש. אנחנו משתפים מידע רק עם השירותים שמפעילים את Gadit (אחסון, תשלומים, ספקי תוכן), בדיוק כפי שמפורט במדיניות הפרטיות.",
              "אפשר למחוק את החשבון בכל רגע מעמוד החשבון. כדי לקבל עותק של המחברת או של כל מידע אחר שנשמר אצלנו, כתבו לנו מהעמוד הזה.",
            ],
          },
          {
            id: "contact-direct",
            q: "איך אפשר להגיע אליכם ישירות?",
            a: [
              "השתמשו בכפתור המייל בתחתית העמוד. הוא מגיע ישירות לצוות. כל הודעה נקראת ומקבלת מענה תוך 24 עד 48 שעות (לרוב מהר יותר).",
              "מייל עדיף על צ'אט בתמיכה: הוא נותן לצוות לקרוא בעיון ולענות במחשבה. תמיכה טלפונית עדיין לא מוצעת.",
            ],
          },
        ],
      },
    ],
  },
} satisfies Partial<Record<Lang, HelpContent>>);

// The other 29 UI languages, one file per group (2026-10-10 i18n sweep).
Object.assign(HELP, HELP_MORE_1, HELP_MORE_2, HELP_MORE_3, HELP_MORE_4, HELP_MORE_5);
// Safety net: a language without its own block reads English.
for (const { code } of LANGUAGES) {
  if (!HELP[code]) HELP[code] = HELP.en;
}


// New plans (Gadi 2026-10-06): the plan answers come from plan-copy, so the
// help center says Basic / Individual / Family in every language.
// The plan answers are filled in when a language is first shown (not for all
// languages at load), because plan-copy loads one language at a time (2026-10-31).
const PLAN_FILLED = new Set<HelpContent>();
export function helpFor(lang: Lang): HelpContent {
  const h = HELP[lang] ?? HELP.en;
  if (PLAN_FILLED.has(h)) return h;
  PLAN_FILLED.add(h);
  const billing = h?.categories?.find((c) => c.id === "billing");
  if (!billing) return h;
  const L = h === HELP.en ? "en" : lang;
  for (const it of billing.items) {
    if (it.id === "switch-plan") {
      it.q = planCopy(L, "helpSwitchQ");
      it.a = [planCopy(L, "helpSwitchA1"), planCopy(L, "helpSwitchA2")];
    } else if (it.id === "unknown-charge") {
      it.a = [planCopy(L, "helpChargeA1"), ...it.a.slice(1)];
    } else if (it.id === "plan-comparison") {
      it.q = planCopy(L, "helpCompareQ");
      it.a = [planCopy(L, "helpCompareA1"), planCopy(L, "helpCompareA2"), planCopy(L, "helpCompareA3")];
    }
  }
  return h;
}
