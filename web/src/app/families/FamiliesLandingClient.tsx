"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { track } from "@/lib/track";
import { WbShellNav, WbShellBurger } from "@/components/design/WbShellChrome";
import { WbUserMenu } from "@/components/design/WbUserMenu";
import { StartFreeCTA } from "@/components/StartFreeCTA";
import { ShareButton, APP_SHARE_COPY } from "@/components/ShareButton";
import { LangSwitcher } from "@/components/design/LangSwitcher";
import { LangSwitchMobile } from "@/components/LangSwitchMobile";

/**
 * Family-plan campaign landing page, v2 (2026-07-16).
 *
 * v1 was a lean single-column pitch; Gadi reviewed it against his
 * academy sales page and asked for a full direct-response build:
 * promise hero, live demo, ONE SECTION PER FEATURE each with its own
 * product visual, alternating color blocks, comparison table, value
 * stack, guarantee, shekel pricing for Hebrew visitors (real ILS
 * billing via Stripe currency_options), repeated CTAs.
 *
 * ?v=relief|anxiety|safe still swaps the hero angle so email/ad
 * variants share one page; the angle rides on every analytics event.
 *
 * Product visuals are CSS/JSX mockups of real product surfaces (no
 * fabricated screenshots, no fake testimonials): meanings card, kids
 * mode, context picker, notebook + quiz, profiles, games, English
 * helper. The hero embeds the real GaditDemoAnimation.
 */

const PRICE_FAMILY_YEARLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_FAMILY_YEARLY ?? "";
const PRICE_FAMILY_MONTHLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_FAMILY_MONTHLY ?? "";
const PRICE_DEEP_MONTHLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_DEEP_MONTHLY ?? "";

type Angle = "vocab" | "relief" | "anxiety" | "safe";
const ANGLES: Angle[] = ["vocab", "relief", "anxiety", "safe"];

/* ────────────────────────── copy ────────────────────────── */

type FeatureCopy = { kicker: string; title: string; body: string };

type Copy = {
  heroBadge: string;
  whatIs: string;
  ctaMicro: string;
  trustLine: string;
  credLine: string;
  credKicker: string;
  credTitle: string;
  credBody: string;
  proofTitle: string;
  proofBig: string;
  proofWords: string[];
  angles: Record<Angle, { h1: string; sub: string }>;
  heroCta: string;
  heroTrust: string;
  ownerCta: string;
  stats: string[];
  demoKicker: string;
  demoTitle: string;
  painKicker: string;
  painTitle: string;
  painBody1: string;
  painBody2: string;
  reframe: string;
  puzzleKicker: string;
  puzzleTitle: string;
  puzzleBody: string;
  puzzleBefore: string;
  puzzleAfter: string;
  puzzleLine: string;
  chainKicker: string;
  chainTitle: string;
  chainSteps: string[];
  howBlocks: Array<{ t: string; b: string }>;
  chainCost: string;
  chainTurnTitle: string;
  chainTurnBody: string;
  dashKicker: string;
  dashTitle: string;
  dashBody: string;
  dashKids: Array<{ name: string; total: number; week: number }>;
  dashWordsLabel: string;
  dashWeekLabel: string;
  featuresKicker: string;
  features: FeatureCopy[];
  midCtaTitle: string;
  midCta: string;
  compareKicker: string;
  compareTitle: string;
  compareGadit: string;
  compareOther: string;
  compareRows: Array<{ label: string; gadit: boolean; other: boolean }>;
  safeTitle: string;
  safeBody: string;
  safeLine: string;
  stackTitle: string;
  stackItems: string[];
  priceKicker: string;
  priceTitle: string;
  trialBadge: string;
  yearly: string;
  yearlyNote: string;
  priceAnchor: string;
  monthly: string;
  billedYearly: string;
  billedMonthly: string;
  yearlySave: string;
  priceCta: string;
  cancelNote: string;
  singleChild: string;
  guaranteeTitle: string;
  guaranteeBody: string;
  faqTitle: string;
  faq: Array<{ q: string; a: string }>;
  finalTitle: string;
  finalSub: string;
  finalCta: string;
  footerTerms: string;
  footerPrivacy: string;
};

const COPY: Record<string, Copy> = {
  uk: {
    heroBadge: "Візуальний, розумний словник для всієї родини",
    whatIs: "Gadit це розумний, візуальний словник для дітей: кожне слово отримує пояснення на дитячому рівні, картинку, приклади, а також ігри та вікторини, які роблять вивчення слів цікавим. Словниковий запас зростає, розуміння прочитаного покращується, і ваша дитина краще вчиться в школі.",
    ctaMicro: "",
    trustLine: "До 5 дітей, кожна на своєму рівні",
    credLine: "Створено на основі 15 років досвіду з понад 15 000 батьків, учнів та освітян",
    credKicker: "Хто ми",
    credTitle: "15 років в освіті. Тепер в одному інструменті для вашої дитини.",
    credBody: "Gadit створила команда з 15-річним досвідом в освіті, яка працювала з понад 15 000 батьків, учнів та освітян. Те, що ми знову й знову бачили як робоче, у класі та вдома, ми зібрали в один простий інструмент, яким дитина може користуватися самостійно.",
    proofTitle: "Зошит слів · приклад",
    proofBig: "12 нових слів цього тижня",
    proofWords: ["мрія", "яскравий", "неохочий"],
    angles: {
      vocab: {
        h1: "Словниковий запас вашої дитини зростає. Слово за словом.",
        sub: "Кожне слово, про яке питає ваша дитина, потрапляє до її особистого зошита слів у Gadit: з картинкою, поясненням на дитячому рівні та коротким тренуванням, яке повертає слово, доки воно не стане своїм. Відкрийте зошит наприкінці місяця й побачите, як словниковий запас зростає, слово за словом.",
      },
      relief: {
        h1: "Перестаньте бути сімейним словником",
        sub: "Відсьогодні, коли дитина питає «що це означає?», у неї є одне місце, де знайти відповідь самостійно: кожне значення, картинка до кожного та пояснення на дитячому рівні. Без відкритого чату, без реклами.",
      },
      anxiety: {
        h1: "Дитина читає кожне слово правильно, але насправді не розуміє",
        sub: "Вона не завжди зупиняється, щоб запитати. Пропускає незрозуміле слово, читає далі, і матеріал не засвоюється. З часом це переростає в розчарування школою та відчуття «я не можу». Gadit дає дитині одне місце, де можна зупинитися, справді зрозуміти й повернутися до уроку зі словом у руках.",
      },
      safe: {
        h1: "Єдиний екран, який можна дати дитині без хвилювань",
        sub: "Без відкритого чату. Без нескінченної стрічки. Без реклами. Одне чисте місце, де дитина набирає слово, розуміє його повністю й повертається до домашнього завдання.",
      },
    },
    heroCta: "Почніть 14-денний безкоштовний період",
    heroTrust: "Без відкритого чату · Без реклами · Скасування в один клік",
    ownerCta: "Перейти до сімейного простору",
    stats: ["30+ мов", "Картинка до кожного значення", "До 5 дітей", "Скасування в один клік"],
    demoKicker: "Результат",
    demoTitle: "Ваша дитина розуміє кожне слово, а її словниковий запас зростає щодня",
    painKicker: "Справжній біль",
    painTitle: "Ваша дитина читає, але не завжди по-справжньому розуміє",
    painBody1: "Ви навіть радієте, коли дитина зупиняється, щоб запитати значення слова. Проблема в усіх тих словах, про які вона не зупиняється запитати. Вона їх пропускає, читає далі, і матеріал не засвоюється. Словниковий запас лишається бідним, а розуміння ламається слово за словом.",
    painBody2: "І це стосується набагато більшого, ніж оцінка. Дитина, яка не розуміє, почувається недостатньо доброю, розчаровується в школі й втрачає впевненість. І відбувається це тихо, коли ніхто не може вказати, де порвалася нитка.",
    reframe: "І саме тут з'являється Gadit.",
    puzzleKicker: "Що відбувається в голові дитини",
    puzzleTitle: "Текст це пазл. Кожне слово це фрагмент.",
    puzzleBody: "Коли дитина читає, її розум складає цілу картину зі слів. Кожне зрозуміле слово це фрагмент, що стає на місце. Кожне відсутнє слово це дірка в картині. Лише три чи чотири дірки, і дитина вже не бачить картини, навіть якщо вимовила кожну літеру.",
    puzzleBefore: "Абзац із пропущеними словами",
    puzzleAfter: "З Gadit кожен фрагмент на місці",
    puzzleLine: "Коли кожне слово зрозуміле, дитина бачить цілу картину.",
    chainKicker: "Як це працює",
    chainTitle: "Усе, що ваша дитина отримує, на кожне слово",
    chainSteps: [
      "Ваша дитина набирає слово, якого не розуміє",
      "Отримує пояснення на своєму рівні, картинку та три приклади",
      "Слово зберігається в її особистому зошиті",
      "І повертається в короткому тренуванні, доки не стане по-справжньому своїм",
    ],
    howBlocks: [
      { t: "Набери слово", b: "Ваша дитина набирає будь-яке незрозуміле слово в Дитячому режимі, у чистому й безпечному місці." },
      { t: "Чітке визначення", b: "Пояснення на рівні дитини, без складних слів, що пояснюють складні слова." },
      { t: "Три приклади", b: "Справжні речення, що показують, як слово живе всередині тексту, а не лише суху дефініцію." },
      { t: "Картинка до кожного значення", b: "Бо діти запам'ятовують побачене набагато краще, ніж написане." },
      { t: "Контекст", b: "Вставте речення з книжки, і Gadit позначить саме те значення, яке підходить." },
      { t: "Особистий зошит", b: "Кожне слово, яке дитина шукала, зберігається в її зошиті й не тікає." },
      { t: "Коротка вікторина", b: "Швидке питання, яке повертає слово саме перед тим, як воно вислизне." },
      { t: "Гра", b: "Навчання через гру, на словах, які дитина шукала сама." },
    ],
    chainCost: "",
    chainTurnTitle: "І ось що ви отримуєте",
    chainTurnBody: "Кожне слово, на якому застрягла дитина, стає словом, яке вона знає, і ви бачите це чорним по білому: скільки слів вона закрила, тиждень за тижнем. Замість сподіватися, що щось покращується, ви просто спостерігаєте, як це відбувається.",
    dashKicker: "Панель для батьків",
    dashTitle: "Ви бачите точно, скільки навчилася кожна дитина",
    dashBody: "У кожної дитини є особистий зошит слів, що зростає. На вашій панелі ви бачите з одного погляду, скільки слів вивчила кожна дитина, скільки додано цього тижня та її найновіші слова. Будь-який інший інструмент відповідає дитині й забуває. Gadit пам'ятає, а ви бачите прогрес тиждень за тижнем.",
    dashKids: [
      { name: "Ноа", total: 47, week: 12 },
      { name: "Ідо", total: 31, week: 8 },
      { name: "Мая", total: 63, week: 15 },
    ],
    dashWordsLabel: "слів у зошиті",
    dashWeekLabel: "цього тижня",
    featuresKicker: "Що всередині",
    features: [
      {
        kicker: "Кожне значення",
        title: "Одне слово. Кожне значення. Картинка до кожного.",
        body: "Одне слово часто має кілька різних значень, і саме тут діти плутаються. Gadit показує їх усі в одному місці, кожне з трьома справжніми прикладами та власною картинкою, бо мозок дитини запам'ятовує образи набагато краще за слова.",
      },
      {
        kicker: "Дитячий режим",
        title: "Пояснення на рівні очей вашої дитини",
        body: "Один перемикач, і кожне пояснення перетворюється на мову, яку 8-річна дитина справді розуміє. Без складних слів, що пояснюють складні слова, без замкнених дефініцій. Тільки розуміння.",
      },
      {
        kicker: "Контекст",
        title: "Вставте речення, отримайте правильне значення",
        body: "Більшість слів мають більше одного значення, і саме тут діти губляться. Вставте речення з книжки чи робочого аркуша, і Gadit позначить, яке саме значення підходить.",
      },
      {
        kicker: "Особистий зошит",
        title: "Слова не тікають",
        body: "Кожне слово, яке шукає ваша дитина, потрапляє до її особистого зошита, а коротке розумне тренування повертає його саме перед тим, як воно вислизне. Саме так по-справжньому будується словниковий запас, слово за словом.",
      },
      {
        kicker: "Профіль для кожної дитини",
        title: "Кожна дитина отримує власний простір",
        body: "Кожна дитина в родині отримує окремий профіль: свій зошит, своє тренування, свою історію. Дитячий режим підлаштовує пояснення, просте й чітке для менших і повніше для старших, і ніхто не заступає на чужі слова.",
      },
      {
        kicker: "Ігри зі словами",
        title: "Навчальні ігри на словах вашої дитини",
        body: "Короткі вікторини та ігри, побудовані зі слів, які ваша дитина справді шукала. Кілька хвилин гри, і словниковий запас зростає без зусиль.",
      },
      {
        kicker: "Друга мова",
        title: "Найкращий помічник з домашнім завданням для другої мови",
        body: "Ваша дитина набирає слово англійською й отримує просте пояснення своєю мовою, з картинкою та прикладами. Без блукань між словником, перекладачем і YouTube.",
      },
    ],
    midCtaTitle: "Почніть зараз і спостерігайте, як словниковий запас вашої дитини зростає день за днем",
    midCta: "Почніть 14-денний безкоштовний період",
    compareKicker: "Різниця",
    compareTitle: "Чому б просто не загуглити чи не запитати чат-бота?",
    compareGadit: "Gadit",
    compareOther: "Відкритий інтернет",
    compareRows: [
      { label: "Одна чиста сторінка на слово", gadit: true, other: false },
      { label: "Пояснення на дитячому рівні", gadit: true, other: false },
      { label: "Картинка до кожного значення", gadit: true, other: false },
      { label: "Зошит і тренування, що закріплюють", gadit: true, other: false },
      { label: "Реклама й посилання в усі боки", gadit: false, other: true },
      { label: "Відкритий чат без меж", gadit: false, other: true },
    ],
    safeTitle: "Окрема, чиста зона. Не двері кудись інде.",
    safeBody: "Gadit це повністю закритий простір: без відкритого чату, без стрічки, без реклами, без зовнішніх посилань. Дитину звідси не затягує в TikTok чи будь-який інший застосунок. Тут є одна річ, яку можна зробити: зрозуміти слово й повернутися до навчання.",
    safeLine: "Один екран, який можна дати дитині зі спокійною душею.",
    stackTitle: "Що включає сімейний план",
    stackItems: [
      "Необмежені пошуки для всієї родини",
      "Кожне значення, з картинкою до кожного",
      "Дитячий режим для будь-якого віку",
      "Перевірка речень із миттєвим відгуком",
      "Особистий зошит і розумне тренування для кожної дитини",
      "Ігри зі словами та вікторини",
      "До 5 дітей з окремими профілями",
      "30+ мов з повною підтримкою",
    ],
    priceKicker: "Ціни",
    priceTitle: "Сімейний план",
    trialBadge: "14-денний безкоштовний період",
    yearly: "$59 / рік",
    yearlyNote: "це $4.92 на місяць для всієї родини, і заощаджує вам майже два місяці порівняно з помісячною оплатою",
    priceAnchor: "Менше за одне заняття з репетитором, на цілий рік, для кожної дитини вдома",
    monthly: "$5.99 / місяць",
    billedYearly: "Річна",
    billedMonthly: "Помісячна",
    yearlySave: "-18%",
    priceCta: "Почати період",
    cancelNote: "Перше списання лише після 14 днів. Скасуйте будь-коли на сторінці облікового запису, в один клік.",
    singleChild: "Лише один учень удома? Deep коштує $4.99/місяць. За трохи більше можна додати до 5 дітей.",
    guaranteeTitle: "Ваша перевірка: два тижні",
    guaranteeBody: "Дайте цьому два тижні реального користування, безкоштовно. Якщо до 14-го дня зошит вашої дитини не зібрав щонайменше 20 нових слів, скасуйте в один клік і ви нічого не заплатили.",
    faqTitle: "Питання, які ставлять батьки",
    faq: [
      {
        q: "Що я отримую з Gadit?",
        a: "Кожне слово, яке шукає ваша дитина, отримує одну чисту сторінку: кожне значення, пояснення на дитячому рівні (Дитячий режим), три справжні приклади та картинку до кожного значення. Плюс контекст (вставте речення й отримайте правильне значення), особистий зошит слів із розумним тренуванням, ігри зі словами та вікторини, панель для батьків, що показує, скільки навчилася кожна дитина, до 5 дітей на окремих профілях, усе 30+ мовами, у закритому, безпечному просторі без відкритого чату та без реклами.",
      },
      {
        q: "Чому б просто не запитати чат-бота чи Google?",
        a: "Бо це інструменти для дорослих. Google повертає рекламу й посилання в усі боки, а відкритий чат-бот це безмежна розмова, у якій жоден з батьків не лишить дитину саму. Gadit побудований навпаки: одна закрита, чиста сторінка на слово, на дитячому рівні, без можливості загубитися.",
      },
      {
        q: "Як я дізнаюся, що моя дитина справді прогресує?",
        a: "Ви отримуєте панель для батьків. З одного погляду ви бачите, скільки слів вивчила кожна дитина, скільки додано цього тижня та її найновіші слова. Будь-який інший інструмент відповідає дитині й забуває; Gadit зберігає кожне слово в особистому зошиті дитини, тож ви спостерігаєте, як словниковий запас зростає тиждень за тижнем.",
      },
      {
        q: "Для якого віку це?",
        a: "Серце Gadit це діти шкільного віку, від першого класу до старшої школи. Дитячий режим пояснює просто для менших, а повні пояснення слугують підліткам і батькам теж. Обліковий запис відкриває дорослий.",
      },
      {
        q: "Чи допомагає це з англійською та іншими мовами?",
        a: "Дуже. Дитина може шукати слово англійською й отримати просте пояснення своєю мовою, з картинкою та прикладами, саме той помічник, якого бракує вдома. І це працює 30+ мовами, тож дитина може отримати пояснення й тією мовою, якою ви говорите вдома.",
      },
      {
        q: "Скільки це коштує?",
        a: "$59 на рік або $5.99 на місяць, після 14-денного періоду. Без прихованих платежів, і ви скасовуєте будь-коли в один клік.",
      },
      {
        q: "Скільки дітей я можу додати?",
        a: "До 5 дітей на одному сімейному плані, кожна зі своїм профілем, зошитом і тренуванням.",
      },
      {
        q: "Чи можемо ми спробувати без зобов'язань?",
        a: "Так. Період починається з карткою, але перше списання відбувається лише коли закінчаться 14 днів. Скасуйте будь-коли до цього, в один клік, і ви нічого не платите.",
      },
    ],
    finalTitle: "Почніть сьогодні й спостерігайте, як зростає словниковий запас",
    finalSub: "Два тижні безкоштовно. Скасування в один клік. І дитина, яка вчиться розуміти слова самостійно.",
    finalCta: "Почніть 14-денний безкоштовний період",
    footerTerms: "Умови",
    footerPrivacy: "Конфіденційність",
  },
  tr: {
    heroBadge: "Tüm aile için görsel ve akıllı bir sözlük",
    whatIs: "Gadit, çocuklar için akıllı ve görsel bir sözlüktür: her kelime çocuğun seviyesine uygun bir açıklama, bir resim, örnekler ve kelime öğrenmeyi eğlenceli kılan oyunlar ve testlerle gelir. Kelime dağarcığı büyür, okuduğunu anlama gelişir ve çocuğunuz okulda daha başarılı olur.",
    ctaMicro: "",
    trustLine: "5 çocuğa kadar, her biri kendi seviyesinde",
    credLine: "15.000'den fazla veli, öğrenci ve eğitimciyle geçen 15 yıllık deneyim üzerine kuruldu",
    credKicker: "Biz kimiz",
    credTitle: "Eğitimde 15 yıl. Şimdi çocuğunuz için tek bir araçta.",
    credBody: "Gadit, eğitimde 15 yıllık deneyime sahip, 15.000'den fazla veli, öğrenci ve eğitimciyle çalışmış bir ekip tarafından geliştirildi. Sınıfta ve evde tekrar tekrar işe yaradığını gördüğümüz şeyleri, bir çocuğun tek başına kullanabileceği tek ve basit bir araçta topladık.",
    proofTitle: "Kelime defteri · örnek",
    proofBig: "Bu hafta 12 yeni kelime",
    proofWords: ["hayal", "canlı", "isteksiz"],
    angles: {
      vocab: {
        h1: "Çocuğunuzun kelime dağarcığı büyür. Kelime kelime.",
        sub: "Çocuğunuzun sorduğu her kelime, Gadit'teki kişisel kelime defterine kaydolur: bir resim, çocuğun seviyesine uygun bir açıklama ve kelime tam oturana kadar onu geri getiren kısa alıştırmalarla. Ay sonunda defteri açın ve kelime dağarcığının kelime kelime büyüdüğünü izleyin.",
      },
      relief: {
        h1: "Ailenin sözlüğü olmayı bırakın",
        sub: "Bugünden itibaren çocuğunuz \"bu ne demek?\" diye sorduğunda, cevabı tek başına bulabileceği tek bir yer var: her anlam, her biri için bir resim ve çocuk seviyesinde bir açıklama. Açık sohbet yok, reklam yok.",
      },
      anxiety: {
        h1: "Çocuğunuz her kelimeyi doğru okuyor ama aslında anlamıyor",
        sub: "Her zaman durup sormuyorlar. Anlamadıkları kelimeyi atlıyor, okumaya devam ediyor ve konu kafalarında oturmuyor. Zamanla bu, okula karşı bir bıkkınlığa ve \"ben bunu beceremiyorum\" hissine dönüşüyor. Gadit, çocuğunuza durup gerçekten anlayabileceği ve kelimeyi cebine koyup derse geri dönebileceği tek bir yer sunar.",
      },
      safe: {
        h1: "Bir çocuğa gönül rahatlığıyla verebileceğiniz tek ekran",
        sub: "Açık sohbet yok. Sonu gelmeyen akış yok. Reklam yok. Çocuğun bir kelime yazdığı, onu tam olarak anladığı ve ödevine geri döndüğü tertemiz tek bir yer.",
      },
    },
    heroCta: "14 günlük ücretsiz denemenizi başlatın",
    heroTrust: "Açık sohbet yok · Reklam yok · Tek tıkla iptal",
    ownerCta: "Aile alanınıza gidin",
    stats: ["30+ dil", "Her anlam için bir resim", "5 çocuğa kadar", "Tek tıkla iptal"],
    demoKicker: "Sonuç",
    demoTitle: "Çocuğunuz her kelimeyi anlar ve kelime dağarcığı her gün büyür",
    painKicker: "Asıl sıkıntı",
    painTitle: "Çocuğunuz okuyor ama her zaman gerçekten anlamıyor",
    painBody1: "Çocuğunuz bir kelimenin anlamını sormak için durduğunda aslında sevinirsiniz. Sorun, sormak için durmadıkları tüm o kelimeler. Onları atlıyor, okumaya devam ediyor ve konu kafalarında oturmuyor. Kelime dağarcığı zayıf kalıyor ve anlama kelime kelime kopuyor.",
    painBody2: "Ve bu, sadece bir notun çok ötesine dokunuyor. Anlamayan bir çocuk kendini yeterince iyi hissetmiyor, okuldan soğuyor ve özgüvenini yitiriyor. Üstelik bu sessizce oluyor, ipin nerede koptuğunu kimse gösteremeden.",
    reframe: "Ve Gadit tam da burada devreye giriyor.",
    puzzleKicker: "Bir çocuğun kafasında olup bitenler",
    puzzleTitle: "Metin bir yapbozdur. Her kelime bir parçadır.",
    puzzleBody: "Bir çocuk okurken, zihni kelimelerden bütün bir resim oluşturur. Anladığı her kelime yerine oturan bir parçadır. Eksik olan her kelime resimde bir boşluktur. Sadece üç dört boşluk, ve çocuk her harfi doğru seslendirse bile artık resmi göremez.",
    puzzleBefore: "Eksik kelimelerle bir paragraf",
    puzzleAfter: "Gadit ile her parça yerinde",
    puzzleLine: "Her kelime netleştiğinde, çocuk bütün resmi görür.",
    chainKicker: "Nasıl çalışır",
    chainTitle: "Çocuğunuzun her kelimede aldığı her şey",
    chainSteps: [
      "Çocuğunuz anlamadığı bir kelimeyi yazar",
      "Kendi göz hizasında bir açıklama, bir resim ve üç örnek alır",
      "Kelime kişisel defterine kaydedilir",
      "Ve gerçekten kendi malı olana kadar kısa alıştırmalarla geri gelir",
    ],
    howBlocks: [
      { t: "Kelimeyi yaz", b: "Çocuğunuz anlamadığı herhangi bir kelimeyi Çocuk Modu'nda, tertemiz ve güvenli bir yerde yazar." },
      { t: "Net bir tanım", b: "Çocuğun göz hizasında bir açıklama, zor kelimeleri zor kelimelerle açıklamadan." },
      { t: "Üç örnek", b: "Kelimenin bir metnin içinde nasıl yaşadığını gösteren gerçek cümleler, sadece kuru bir tanım değil." },
      { t: "Her anlam için bir resim", b: "Çünkü çocuklar gördüklerini, kendilerine yazılanlardan çok daha iyi hatırlar." },
      { t: "Bağlam", b: "Kitaptan bir cümle yapıştırın, Gadit ona tam uyan anlamı işaretlesin." },
      { t: "Kişisel defter", b: "Çocuğunuzun aradığı her kelime defterine kaydedilir ve kaçıp gitmez." },
      { t: "Kısa bir test", b: "Kelimeyi kaybolmadan hemen önce geri getiren hızlı bir soru." },
      { t: "Bir oyun", b: "Çocuğunuzun kendi aradığı kelimeler üzerinden oyunla öğrenme." },
    ],
    chainCost: "",
    chainTurnTitle: "Ve işte elde ettiğiniz",
    chainTurnBody: "Çocuğunuzun takıldığı her kelime, bildiği bir kelimeye dönüşür ve bunu siyah beyaz görürsünüz: hafta hafta kaç kelimeyi kapattığını. Bir şeylerin düzeldiğini ummak yerine, olup bittiğini izlemeniz yeter.",
    dashKicker: "Veli paneli",
    dashTitle: "Her çocuğun tam olarak ne kadar öğrendiğini görürsünüz",
    dashBody: "Her çocuğun büyüyen kişisel bir kelime defteri var. Panelinizde bir bakışta her çocuğun kaç kelime öğrendiğini, bu hafta kaç kelime eklendiğini ve en son kelimelerini görürsünüz. Başka her araç çocuğunuza cevap verir ve unutur. Gadit hatırlar ve siz ilerlemeyi hafta hafta görürsünüz.",
    dashKids: [
      { name: "Elif", total: 47, week: 12 },
      { name: "Emir", total: 31, week: 8 },
      { name: "Deniz", total: 63, week: 15 },
    ],
    dashWordsLabel: "defterdeki kelime",
    dashWeekLabel: "bu hafta",
    featuresKicker: "İçinde neler var",
    features: [
      {
        kicker: "Her anlam",
        title: "Tek kelime. Her anlam. Her biri için bir resim.",
        body: "Bir kelimenin çoğu zaman birkaç farklı anlamı vardır ve çocuklar tam da burada kafası karışır. Gadit hepsini tek bir yerde gösterir, her biri üç gerçek örnek ve kendi resmiyle, çünkü bir çocuğun beyni görselleri kelimelerden çok daha iyi hatırlar.",
      },
      {
        kicker: "Çocuk Modu",
        title: "Çocuğunuzun göz hizasında açıklamalar",
        body: "Tek bir düğme, ve her açıklama 8 yaşındaki bir çocuğun gerçekten anladığı bir dile dönüşür. Zor kelimeleri açıklayan zor kelimeler yok, döngüsel tanımlar yok. Sadece anlama.",
      },
      {
        kicker: "Bağlam",
        title: "Bir cümle yapıştırın, doğru anlamı alın",
        body: "Çoğu kelimenin birden fazla anlamı vardır ve çocuklar tam da burada kaybolur. Kitaptaki ya da çalışma kağıdındaki cümleyi yapıştırın, Gadit hangi anlamın uyduğunu tam olarak işaretlesin.",
      },
      {
        kicker: "Kişisel defter",
        title: "Kelimeler kaçıp gitmez",
        body: "Çocuğunuzun aradığı her kelime kişisel defterine düşer ve kısa, akıllı alıştırmalar onu kaybolmadan hemen önce geri getirir. Kelime dağarcığı işte böyle, her seferinde bir kelime, gerçekten inşa edilir.",
      },
      {
        kicker: "Her çocuk için bir profil",
        title: "Her çocuk kendi alanına sahip olur",
        body: "Ailedeki her çocuk ayrı bir profil alır: kendi defteri, kendi alıştırması, kendi geçmişi. Çocuk Modu açıklamayı uyarlar, küçükler için basit ve net, büyükler için daha dolgun, ve kimse kimsenin kelimelerine dokunmaz.",
      },
      {
        kicker: "Kelime oyunları",
        title: "Çocuğunuzun kelimeleri üzerine öğrenme oyunları",
        body: "Çocuğunuzun gerçekten aradığı kelimelerden kurulan kısa testler ve oyunlar. Birkaç dakikalık oyun, ve kelime dağarcığı zahmetsizce büyür.",
      },
      {
        kicker: "İkinci dil",
        title: "İkinci bir dil için en iyi ödev yardımcısı",
        body: "Çocuğunuz İngilizce bir kelime yazar ve kendi dilinde, bir resim ve örneklerle basit bir açıklama alır. Sözlük, çeviri ve YouTube arasında dolaşmak yok.",
      },
    ],
    midCtaTitle: "Hemen başlayın ve çocuğunuzun kelime dağarcığının gün gün büyümesini izleyin",
    midCta: "14 günlük ücretsiz denemenizi başlatın",
    compareKicker: "Fark",
    compareTitle: "Neden sadece Google'da aramak ya da bir sohbet botuna sormak olmasın?",
    compareGadit: "Gadit",
    compareOther: "Açık internet",
    compareRows: [
      { label: "Her kelime için tertemiz tek bir sayfa", gadit: true, other: false },
      { label: "Çocuk seviyesinde açıklamalar", gadit: true, other: false },
      { label: "Her anlam için bir resim", gadit: true, other: false },
      { label: "Aklında kalan bir defter ve alıştırma", gadit: true, other: false },
      { label: "Her yöne reklamlar ve bağlantılar", gadit: false, other: true },
      { label: "Sınırsız, açık uçlu sohbet", gadit: false, other: true },
    ],
    safeTitle: "Ayrı, tertemiz bir alan. Başka hiçbir yere açılan bir kapı değil.",
    safeBody: "Gadit tamamen kapalı bir alandır: açık sohbet yok, akış yok, reklam yok, dışarı çıkan bağlantı yok. Bir çocuk buradan TikTok'a ya da başka bir uygulamaya çekilmez. Burada yapılacak tek bir şey var: bir kelimeyi anlamak ve derse geri dönmek.",
    safeLine: "Bir çocuğa içiniz rahat verebileceğiniz tek ekran.",
    stackTitle: "Aile planına neler dahil",
    stackItems: [
      "Tüm aile için sınırsız arama",
      "Her anlam, her biri için bir resimle",
      "Her yaş için Çocuk Modu",
      "Anında geri bildirimle cümle kontrolü",
      "Her çocuk için kişisel defter ve akıllı alıştırma",
      "Kelime oyunları ve testler",
      "Ayrı profillerle 5 çocuğa kadar",
      "Tam destekle 30+ dil",
    ],
    priceKicker: "Fiyatlandırma",
    priceTitle: "Aile planı",
    trialBadge: "14 günlük ücretsiz deneme",
    yearly: "$59 / yıl",
    yearlyNote: "yani tüm aile için ayda $4.92 ve aylık ödemeye kıyasla neredeyse iki ayınızı kazandırır",
    priceAnchor: "Bir özel ders seansından daha az, koca bir yıl boyunca, evdeki her çocuk için",
    monthly: "$5.99 / ay",
    billedYearly: "Yıllık",
    billedMonthly: "Aylık",
    yearlySave: "-18%",
    priceCta: "Denemeyi başlat",
    cancelNote: "İlk ücret yalnızca 14 günden sonra alınır. Hesap sayfanızdan istediğiniz zaman tek tıkla iptal edin.",
    singleChild: "Evde tek bir öğrenci mi var? Deep aylık $4.99. Biraz daha fazlasına 5 çocuğa kadar ekleyebilirsiniz.",
    guaranteeTitle: "Sizin testiniz: iki hafta",
    guaranteeBody: "Ona iki hafta gerçek kullanım verin, ücretsiz. 14. güne kadar çocuğunuzun defteri en az 20 yeni kelime toplamadıysa, tek tıkla iptal edin ve hiçbir şey ödemeyin.",
    faqTitle: "Velilerin sorduğu sorular",
    faq: [
      {
        q: "Gadit ile ne elde ederim?",
        a: "Çocuğunuzun aradığı her kelime tertemiz tek bir sayfa alır: her anlam, çocuk seviyesinde bir açıklama (Çocuk Modu), üç gerçek örnek ve her anlam için bir resim. Ayrıca bağlam (bir cümle yapıştırın, doğru anlamı alın), akıllı alıştırmalı kişisel bir kelime defteri, kelime oyunları ve testler, her çocuğun ne kadar öğrendiğini gösteren bir veli paneli, ayrı profillerde 5 çocuğa kadar, hepsi 30+ dilde, açık sohbetin ve reklamın olmadığı kapalı ve güvenli bir alanda.",
      },
      {
        q: "Neden sadece bir sohbet botuna ya da Google'a sormayayım?",
        a: "Çünkü onlar yetişkinler için araçlardır. Google her yöne reklamlar ve bağlantılar döndürür, açık bir sohbet botu ise hiçbir velinin çocuğunu yalnız bırakmayacağı sınırsız bir sohbettir. Gadit tam tersi kurulmuştur: her kelime için kapalı, tertemiz tek bir sayfa, çocuk seviyesinde, kaybolmanın imkansız olduğu.",
      },
      {
        q: "Çocuğumun gerçekten ilerlediğini nasıl anlarım?",
        a: "Bir veli paneli alırsınız. Bir bakışta her çocuğun kaç kelime öğrendiğini, bu hafta kaç tane eklendiğini ve en son kelimelerini görürsünüz. Başka her araç çocuğa cevap verir ve unutur; Gadit her kelimeyi çocuğun kişisel defterine kaydeder, böylece kelime dağarcığının hafta hafta büyümesini izlersiniz.",
      },
      {
        q: "Hangi yaşlar için?",
        a: "Gadit'in kalbi okul çağındaki çocuklardır, ilkokul birinci sınıftan liseye kadar. Çocuk Modu küçükler için basitçe açıklar, tam açıklamalar ise gençlere ve velilere de hitap eder. Hesabı veli açar.",
      },
      {
        q: "İngilizce ve diğer dillerde yardımcı olur mu?",
        a: "Çok. Bir çocuk İngilizce bir kelimeyi arayıp kendi dilinde, bir resim ve örneklerle basit bir açıklama alabilir, tam da evde eksik olan yardımcı. Ve 30+ dilde çalışır, böylece çocuk açıklamayı evde konuştuğunuz dilde de alabilir.",
      },
      {
        q: "Ne kadar tutuyor?",
        a: "14 günlük denemeden sonra yılda $59 ya da ayda $5.99. Gizli ücret yok ve istediğiniz zaman tek tıkla iptal edebilirsiniz.",
      },
      {
        q: "Kaç çocuk ekleyebilirim?",
        a: "Tek bir Aile planında 5 çocuğa kadar, her biri kendi profili, defteri ve alıştırmasıyla.",
      },
      {
        q: "Taahhüt vermeden deneyebilir miyiz?",
        a: "Evet. Deneme bir kartla başlar ama ilk ücret yalnızca 14 gün dolduğunda alınır. Bundan önce istediğiniz zaman tek tıkla iptal edin ve hiçbir şey ödemeyin.",
      },
    ],
    finalTitle: "Bugün başlayın ve kelime dağarcığının büyümesini izleyin",
    finalSub: "İki hafta ücretsiz. Tek tıkla iptal. Ve kelimeleri kendi başına anlamayı öğrenen bir çocuk.",
    finalCta: "14 günlük ücretsiz denemenizi başlatın",
    footerTerms: "Şartlar",
    footerPrivacy: "Gizlilik",
  },
  pl: {
    heroBadge: "Wizualny, inteligentny słownik dla całej rodziny",
    whatIs: "Gadit to inteligentny, wizualny słownik dla dzieci: każde słowo dostaje wyjaśnienie na poziomie dziecka, obrazek, przykłady oraz gry i quizy, dzięki którym nauka słów staje się przyjemnością. Słownictwo rośnie, rozumienie tekstu się poprawia, a Twoje dziecko lepiej radzi sobie w szkole.",
    ctaMicro: "",
    trustLine: "Do 5 dzieci, każde na własnym poziomie",
    credLine: "Zbudowany na 15 latach doświadczenia z ponad 15 000 rodziców, uczniów i nauczycieli",
    credKicker: "Kim jesteśmy",
    credTitle: "15 lat w edukacji. Teraz w jednym narzędziu dla Twojego dziecka.",
    credBody: "Gadit powstał dzięki zespołowi z 15-letnim doświadczeniem w edukacji, który pracował z ponad 15 000 rodziców, uczniów i nauczycieli. To, co raz za razem sprawdzało się w klasie i w domu, zebraliśmy w jednym prostym narzędziu, z którego dziecko korzysta samodzielnie.",
    proofTitle: "Zeszyt słów · przykład",
    proofBig: "12 nowych słów w tym tygodniu",
    proofWords: ["marzenie", "wyrazisty", "niechętny"],
    angles: {
      vocab: {
        h1: "Słownictwo Twojego dziecka rośnie. Słowo po słowie.",
        sub: "Każde słowo, o które pyta Twoje dziecko, trafia do jego osobistego zeszytu słów w Gadit: z obrazkiem, wyjaśnieniem na poziomie dziecka i krótkim ćwiczeniem, które przypomina słowo, aż stanie się naprawdę jego. Otwórz zeszyt na koniec miesiąca i zobacz, jak słownictwo rośnie, słowo po słowie.",
      },
      relief: {
        h1: "Przestań być rodzinnym słownikiem",
        sub: "Od dziś, gdy Twoje dziecko pyta „co to znaczy?”, ma jedno miejsce, w którym samo znajdzie odpowiedź: każde znaczenie, obrazek do każdego z nich i wyjaśnienie na poziomie dziecka. Bez otwartego czatu, bez reklam.",
      },
      anxiety: {
        h1: "Twoje dziecko czyta poprawnie każde słowo, ale tak naprawdę nie rozumie",
        sub: "Nie zawsze zatrzymuje się, żeby zapytać. Pomija słowo, którego nie rozumie, czyta dalej, a materiał nie zostaje przyswojony. Z czasem zmienia się to we frustrację szkołą i poczucie „nie dam rady”. Gadit daje Twojemu dziecku jedno miejsce, w którym może się zatrzymać, naprawdę zrozumieć i wrócić do lekcji ze słowem w ręku.",
      },
      safe: {
        h1: "Jedyny ekran, który możesz podać dziecku bez obaw",
        sub: "Bez otwartego czatu. Bez nieskończonego feedu. Bez reklam. Jedno czyste miejsce, w którym dziecko wpisuje słowo, w pełni je rozumie i wraca do zadań domowych.",
      },
    },
    heroCta: "Rozpocznij 14-dniowy bezpłatny okres próbny",
    heroTrust: "Bez otwartego czatu · Bez reklam · Anuluj jednym kliknięciem",
    ownerCta: "Przejdź do przestrzeni rodzinnej",
    stats: ["30+ języków", "Obrazek do każdego znaczenia", "Do 5 dzieci", "Anuluj jednym kliknięciem"],
    demoKicker: "Efekt",
    demoTitle: "Twoje dziecko rozumie każde słowo, a jego słownictwo rośnie każdego dnia",
    painKicker: "Prawdziwy problem",
    painTitle: "Twoje dziecko czyta, ale nie zawsze naprawdę rozumie",
    painBody1: "Tak naprawdę cieszysz się, gdy dziecko zatrzymuje się, by zapytać o znaczenie słowa. Problemem są wszystkie te słowa, o które nie pyta. Pomija je, czyta dalej, a materiał nie zostaje przyswojony. Słownictwo pozostaje ubogie, a rozumienie załamuje się słowo po słowie.",
    painBody2: "A to dotyka o wiele więcej niż ocenę. Dziecko, które nie rozumie, czuje się niewystarczająco dobre, frustruje się szkołą i traci pewność siebie. I dzieje się to po cichu, a nikt nie potrafi wskazać, gdzie zerwała się nić.",
    reframe: "I właśnie tutaj wkracza Gadit.",
    puzzleKicker: "Co dzieje się w głowie dziecka",
    puzzleTitle: "Tekst to układanka. Każde słowo to element.",
    puzzleBody: "Gdy dziecko czyta, jego umysł składa cały obraz ze słów. Każde zrozumiane słowo to element, który wskakuje na swoje miejsce. Każde brakujące słowo to dziura w obrazie. Wystarczą trzy lub cztery dziury i dziecko przestaje widzieć obraz, nawet jeśli przeczytało każdą literę.",
    puzzleBefore: "Akapit z brakującymi słowami",
    puzzleAfter: "Z Gadit każdy element na swoim miejscu",
    puzzleLine: "Gdy każde słowo jest jasne, dziecko widzi cały obraz.",
    chainKicker: "Jak to działa",
    chainTitle: "Wszystko, co Twoje dziecko dostaje przy każdym słowie",
    chainSteps: [
      "Twoje dziecko wpisuje słowo, którego nie rozumie",
      "Otrzymuje wyjaśnienie na swoim poziomie, obrazek i trzy przykłady",
      "Słowo zostaje zapisane w jego osobistym zeszycie",
      "I wraca w krótkim ćwiczeniu, aż stanie się naprawdę jego",
    ],
    howBlocks: [
      { t: "Wpisz słowo", b: "Twoje dziecko wpisuje dowolne słowo, którego nie rozumie, w Trybie dla dzieci, w czystym i bezpiecznym miejscu." },
      { t: "Jasna definicja", b: "Wyjaśnienie na poziomie dziecka, bez trudnych słów tłumaczących trudne słowa." },
      { t: "Trzy przykłady", b: "Prawdziwe zdania, które pokazują, jak słowo żyje w tekście, a nie tylko sucha definicja." },
      { t: "Obrazek do każdego znaczenia", b: "Bo dzieci zapamiętują to, co widzą, o wiele lepiej niż to, co jest im napisane." },
      { t: "Kontekst", b: "Wklej zdanie z książki, a Gadit zaznaczy dokładnie to znaczenie, które pasuje." },
      { t: "Osobisty zeszyt", b: "Każde słowo, które dziecko sprawdziło, zapisuje się w jego zeszycie i nie ucieka." },
      { t: "Krótki quiz", b: "Szybkie pytanie, które przywraca słowo tuż zanim się ulotni." },
      { t: "Gra", b: "Nauka przez zabawę, na słowach, które dziecko samo sprawdziło." },
    ],
    chainCost: "",
    chainTurnTitle: "I to właśnie otrzymujesz",
    chainTurnBody: "Każde słowo, na którym Twoje dziecko utknęło, staje się słowem, które zna, a Ty widzisz to czarno na białym: ile słów zamknęło, tydzień po tygodniu. Zamiast liczyć, że coś się poprawia, po prostu obserwujesz, jak to się dzieje.",
    dashKicker: "Panel rodzica",
    dashTitle: "Widzisz dokładnie, ile nauczyło się każde dziecko",
    dashBody: "Każde dziecko ma osobisty zeszyt słów, który rośnie. W swoim panelu widzisz jednym rzutem oka, ile słów nauczyło się każde dziecko, ile doszło w tym tygodniu i jakie są jego ostatnie słowa. Każde inne narzędzie odpowiada dziecku i zapomina. Gadit pamięta, a Ty widzisz postępy tydzień po tygodniu.",
    dashKids: [
      { name: "Noa", total: 47, week: 12 },
      { name: "Ido", total: 31, week: 8 },
      { name: "Maya", total: 63, week: 15 },
    ],
    dashWordsLabel: "słów w zeszycie",
    dashWeekLabel: "w tym tygodniu",
    featuresKicker: "Co jest w środku",
    features: [
      {
        kicker: "Każde znaczenie",
        title: "Jedno słowo. Każde znaczenie. Obrazek do każdego.",
        body: "Jedno słowo często ma kilka różnych znaczeń i właśnie tu dzieci się gubią. Gadit pokazuje je wszystkie w jednym miejscu, każde z trzema prawdziwymi przykładami i własnym obrazkiem, bo mózg dziecka zapamiętuje obrazy o wiele lepiej niż słowa.",
      },
      {
        kicker: "Tryb dla dzieci",
        title: "Wyjaśnienia na poziomie Twojego dziecka",
        body: "Jedno przełączenie i każde wyjaśnienie zmienia się w język, który 8-latek naprawdę rozumie. Bez trudnych słów tłumaczących trudne słowa, bez definicji w kółko. Po prostu zrozumienie.",
      },
      {
        kicker: "Kontekst",
        title: "Wklej zdanie, otrzymaj właściwe znaczenie",
        body: "Większość słów ma więcej niż jedno znaczenie i właśnie tu dzieci się gubią. Wklej zdanie z książki lub karty pracy, a Gadit zaznaczy dokładnie to znaczenie, które pasuje.",
      },
      {
        kicker: "Osobisty zeszyt",
        title: "Słowa nie uciekają",
        body: "Każde słowo, które sprawdza Twoje dziecko, trafia do jego osobistego zeszytu, a krótkie mądre ćwiczenie przywraca je tuż zanim się ulotni. Właśnie tak naprawdę buduje się słownictwo, słowo po słowie.",
      },
      {
        kicker: "Profil dla każdego dziecka",
        title: "Każde dziecko ma własną przestrzeń",
        body: "Każde dziecko w rodzinie dostaje osobny profil: swój zeszyt, swoje ćwiczenia, swoją historię. Tryb dla dzieci dostosowuje wyjaśnienie, proste i jasne dla najmłodszych, a pełniejsze dla starszych, i nikt nie wchodzi w cudze słowa.",
      },
      {
        kicker: "Gry słowne",
        title: "Gry edukacyjne na słowach Twojego dziecka",
        body: "Krótkie quizy i gry zbudowane ze słów, które Twoje dziecko naprawdę sprawdziło. Kilka minut zabawy i słownictwo rośnie bez wysiłku.",
      },
      {
        kicker: "Drugi język",
        title: "Najlepszy pomocnik w pracy domowej z drugiego języka",
        body: "Twoje dziecko wpisuje słowo po angielsku i dostaje proste wyjaśnienie w swoim języku, z obrazkiem i przykładami. Bez błądzenia między słownikiem, tłumaczem i YouTube.",
      },
    ],
    midCtaTitle: "Zacznij teraz i patrz, jak słownictwo Twojego dziecka rośnie z dnia na dzień",
    midCta: "Rozpocznij 14-dniowy bezpłatny okres próbny",
    compareKicker: "Różnica",
    compareTitle: "Dlaczego nie wygooglować albo nie zapytać czatbota?",
    compareGadit: "Gadit",
    compareOther: "Otwarty internet",
    compareRows: [
      { label: "Jedna czysta strona na słowo", gadit: true, other: false },
      { label: "Wyjaśnienia na poziomie dziecka", gadit: true, other: false },
      { label: "Obrazek do każdego znaczenia", gadit: true, other: false },
      { label: "Zeszyt i ćwiczenia, które zostają", gadit: true, other: false },
      { label: "Reklamy i linki na wszystkie strony", gadit: false, other: true },
      { label: "Otwarty czat bez granic", gadit: false, other: true },
    ],
    safeTitle: "Osobna, czysta strefa. Nie drzwi gdziekolwiek indziej.",
    safeBody: "Gadit to w pełni zamknięta przestrzeń: bez otwartego czatu, bez feedu, bez reklam, bez linków na zewnątrz. Dziecko nie jest stąd wyciągane do TikToka ani żadnej innej aplikacji. Jest tu jedno do zrobienia: zrozumieć słowo i wrócić do nauki.",
    safeLine: "Jeden ekran, który możesz podać dziecku ze spokojną głową.",
    stackTitle: "Co obejmuje plan Rodzinny",
    stackItems: [
      "Nieograniczone wyszukiwania dla całej rodziny",
      "Każde znaczenie, z obrazkiem do każdego",
      "Tryb dla dzieci w każdym wieku",
      "Sprawdzanie zdań z natychmiastową informacją zwrotną",
      "Osobisty zeszyt i mądre ćwiczenia dla każdego dziecka",
      "Gry słowne i quizy",
      "Do 5 dzieci z osobnymi profilami",
      "30+ języków z pełnym wsparciem",
    ],
    priceKicker: "Cennik",
    priceTitle: "Plan Rodzinny",
    trialBadge: "14-dniowy bezpłatny okres próbny",
    yearly: "$59 / rok",
    yearlyNote: "to $4.92 miesięcznie dla całej rodziny i oszczędza prawie dwa miesiące w porównaniu z płatnością miesięczną",
    priceAnchor: "Mniej niż jedna lekcja korepetycji, na cały rok, dla każdego dziecka w domu",
    monthly: "$5.99 / miesiąc",
    billedYearly: "Rocznie",
    billedMonthly: "Miesięcznie",
    yearlySave: "-18%",
    priceCta: "Rozpocznij okres próbny",
    cancelNote: "Pierwsza opłata dopiero po 14 dniach. Anuluj w dowolnym momencie na stronie konta, jednym kliknięciem.",
    singleChild: "Tylko jeden uczeń w domu? Deep kosztuje $4.99/miesiąc. Za trochę więcej możesz dodać do 5 dzieci.",
    guaranteeTitle: "Twój test: dwa tygodnie",
    guaranteeBody: "Daj temu dwa tygodnie prawdziwego użytkowania, za darmo. Jeśli do 14. dnia zeszyt Twojego dziecka nie zbierze co najmniej 20 nowych słów, anuluj jednym kliknięciem i nic nie zapłaciłeś.",
    faqTitle: "Pytania, które zadają rodzice",
    faq: [
      {
        q: "Co dostaję z Gadit?",
        a: "Każde słowo, które sprawdza Twoje dziecko, dostaje jedną czystą stronę: każde znaczenie, wyjaśnienie na poziomie dziecka (Tryb dla dzieci), trzy prawdziwe przykłady i obrazek do każdego znaczenia. Plus kontekst (wklej zdanie i otrzymaj właściwe znaczenie), osobisty zeszyt słów z mądrymi ćwiczeniami, gry słowne i quizy, panel rodzica pokazujący, ile nauczyło się każde dziecko, do 5 dzieci na osobnych profilach, wszystko w 30+ językach, w zamkniętej, bezpiecznej przestrzeni bez otwartego czatu i bez reklam.",
      },
      {
        q: "Dlaczego nie zapytać po prostu czatbota albo Google?",
        a: "Bo to narzędzia dla dorosłych. Google zwraca reklamy i linki na wszystkie strony, a otwarty czatbot to rozmowa bez granic, w której żaden rodzic nie zostawia dziecka samego. Gadit jest zbudowany na odwrót: jedna zamknięta, czysta strona na słowo, na poziomie dziecka, bez możliwości zgubienia się.",
      },
      {
        q: "Skąd mam wiedzieć, że moje dziecko naprawdę robi postępy?",
        a: "Dostajesz panel rodzica. Jednym rzutem oka widzisz, ile słów nauczyło się każde dziecko, ile doszło w tym tygodniu i jakie są jego ostatnie słowa. Każde inne narzędzie odpowiada dziecku i zapomina; Gadit zapisuje każde słowo w osobistym zeszycie dziecka, więc obserwujesz, jak słownictwo rośnie tydzień po tygodniu.",
      },
      {
        q: "Dla jakiego wieku to jest?",
        a: "Sercem Gadit są dzieci w wieku szkolnym, od pierwszej klasy po szkołę średnią. Tryb dla dzieci wyjaśnia prosto dla najmłodszych, a pełne wyjaśnienia służą też nastolatkom i rodzicom. Konto zakłada rodzic.",
      },
      {
        q: "Czy pomaga z angielskim i innymi językami?",
        a: "Bardzo. Dziecko może sprawdzić słowo po angielsku i dostać proste wyjaśnienie w swoim języku, z obrazkiem i przykładami, dokładnie ten pomocnik, którego brakuje w domu. A działa w 30+ językach, więc dziecko może dostać wyjaśnienie także w języku, którym mówicie w domu.",
      },
      {
        q: "Ile to kosztuje?",
        a: "$59 rocznie lub $5.99 miesięcznie, po 14-dniowym okresie próbnym. Bez ukrytych opłat, a anulujesz w dowolnym momencie jednym kliknięciem.",
      },
      {
        q: "Ile dzieci mogę dodać?",
        a: "Do 5 dzieci w jednym planie Rodzinnym, każde z własnym profilem, zeszytem i ćwiczeniami.",
      },
      {
        q: "Czy możemy wypróbować bez zobowiązań?",
        a: "Tak. Okres próbny zaczyna się od karty, ale pierwsza opłata następuje dopiero, gdy kończy się 14 dni. Anuluj wcześniej w dowolnym momencie, jednym kliknięciem, i nic nie płacisz.",
      },
    ],
    finalTitle: "Zacznij dziś i patrz, jak słownictwo rośnie",
    finalSub: "Dwa tygodnie za darmo. Anulowanie jednym kliknięciem. I dziecko, które uczy się samo rozumieć słowa.",
    finalCta: "Rozpocznij 14-dniowy bezpłatny okres próbny",
    footerTerms: "Regulamin",
    footerPrivacy: "Prywatność",
  },
  fa: {
    heroBadge: "یک فرهنگ لغت تصویری و هوشمند برای همه‌ی خانواده",
    whatIs: "Gadit یک فرهنگ لغت هوشمند و تصویری برای کودکان است: هر واژه با توضیحی در سطح کودک، یک تصویر، مثال‌ها و بازی‌ها و آزمون‌هایی همراه می‌شود که یادگیری واژه‌ها را سرگرم‌کننده می‌کند. دایره‌ی واژگان رشد می‌کند، درک مطلب بهتر می‌شود و کودک شما در مدرسه بهتر عمل می‌کند.",
    ctaMicro: "",
    trustLine: "تا 5 کودک، هرکدام در سطح خودش",
    credLine: "ساخته شده بر پایه‌ی 15 سال تجربه با بیش از 15,000 والد، دانش‌آموز و مربی",
    credKicker: "ما که هستیم",
    credTitle: "15 سال در آموزش. حالا در یک ابزار برای کودک شما.",
    credBody: "Gadit توسط تیمی با 15 سال تجربه در آموزش ساخته شده است، تیمی که با بیش از 15,000 والد، دانش‌آموز و مربی کار کرده است. آنچه را بارها و بارها دیدیم که کار می‌کند، هم در کلاس و هم در خانه، در یک ابزار ساده گرد آوردیم که کودک می‌تواند به‌تنهایی از آن استفاده کند.",
    proofTitle: "دفترچه‌ی واژگان · نمونه",
    proofBig: "12 واژه‌ی جدید این هفته",
    proofWords: ["رؤیا", "زنده", "بی‌میل"],
    angles: {
      vocab: {
        h1: "دایره‌ی واژگان کودک شما رشد می‌کند. واژه به واژه.",
        sub: "هر واژه‌ای که کودک شما درباره‌اش می‌پرسد، در دفترچه‌ی واژگان شخصی‌اش در Gadit جای می‌گیرد: با یک تصویر، توضیحی در سطح کودک، و تمرینی کوتاه که واژه را دوباره برمی‌گرداند تا از آنِ او شود. در پایان ماه دفترچه را باز کنید و رشد واژگان را ببینید، واژه به واژه.",
      },
      relief: {
        h1: "دیگر فرهنگ لغت خانواده نباشید",
        sub: "از امروز، وقتی کودکتان می‌پرسد «این یعنی چه؟»، یک جا دارد تا خودش پاسخ را پیدا کند: هر معنا، یک تصویر برای هرکدام، و توضیحی در سطح کودک. نه چتِ باز، نه تبلیغ.",
      },
      anxiety: {
        h1: "کودک شما همه‌ی واژه‌ها را درست می‌خواند، اما واقعاً نمی‌فهمد",
        sub: "همیشه نمی‌ایستد که بپرسد. واژه‌ای را که نمی‌فهمد رد می‌کند، ادامه می‌دهد، و مطلب جا نمی‌افتد. با گذر زمان به سرخوردگی از مدرسه و حسِ «من نمی‌توانم» تبدیل می‌شود. Gadit به کودک شما یک جا می‌دهد تا بایستد، واقعاً بفهمد، و با واژه در دست به درس برگردد.",
      },
      safe: {
        h1: "تنها صفحه‌ای که می‌توانید بدون نگرانی به کودک بدهید",
        sub: "نه چتِ باز. نه فیدِ بی‌پایان. نه تبلیغ. یک جای تمیز که کودک واژه‌ای را تایپ می‌کند، آن را کامل می‌فهمد، و به تکالیف برمی‌گردد.",
      },
    },
    heroCta: "دوره‌ی آزمایشی رایگان 14 روزه‌ات را شروع کن",
    heroTrust: "بدون چتِ باز · بدون تبلیغ · لغو با یک کلیک",
    ownerCta: "به فضای خانوادگی‌ات برو",
    stats: ["30+ زبان", "یک تصویر برای هر معنا", "تا 5 کودک", "لغو با یک کلیک"],
    demoKicker: "نتیجه",
    demoTitle: "کودک شما هر واژه را می‌فهمد، و دایره‌ی واژگانش هر روز رشد می‌کند",
    painKicker: "درد واقعی",
    painTitle: "کودک شما می‌خواند، اما همیشه واقعاً نمی‌فهمد",
    painBody1: "در واقع خوشحال می‌شوید وقتی کودکتان می‌ایستد و معنای واژه‌ای را می‌پرسد. مشکل همه‌ی واژه‌هایی است که برای پرسیدنشان نمی‌ایستد. آن‌ها را رد می‌کند، به خواندن ادامه می‌دهد، و مطلب جا نمی‌افتد. دایره‌ی واژگان لاغر می‌ماند، و درک مطلب واژه به واژه فرو می‌ریزد.",
    painBody2: "و این بسیار فراتر از یک نمره اثر می‌گذارد. کودکی که نمی‌فهمد حس می‌کند به‌اندازه‌ی کافی خوب نیست، از مدرسه سرخورده می‌شود، و اعتمادبه‌نفسش را از دست می‌دهد. و این بی‌صدا رخ می‌دهد، بی‌آنکه کسی بتواند جایی را که رشته پاره شد نشان دهد.",
    reframe: "و دقیقاً همین‌جاست که Gadit وارد می‌شود.",
    puzzleKicker: "آنچه در ذهن کودک می‌گذرد",
    puzzleTitle: "متن یک پازل است. هر واژه یک قطعه.",
    puzzleBody: "وقتی کودکی می‌خواند، ذهنش از واژه‌ها یک تصویر کامل می‌سازد. هر واژه‌ای که می‌فهمد قطعه‌ای است که سرِ جایش می‌نشیند. هر واژه‌ی گم‌شده سوراخی در تصویر است. فقط سه یا چهار سوراخ، و کودک دیگر تصویر را نمی‌بیند، حتی اگر تک‌تکِ حروف را درست خوانده باشد.",
    puzzleBefore: "پاراگرافی با واژه‌های گم‌شده",
    puzzleAfter: "با Gadit، هر قطعه سرِ جایش",
    puzzleLine: "وقتی هر واژه روشن است، کودک کل تصویر را می‌بیند.",
    chainKicker: "چطور کار می‌کند",
    chainTitle: "هر آنچه کودک شما دریافت می‌کند، روی هر واژه",
    chainSteps: [
      "کودک شما واژه‌ای را که نمی‌فهمد تایپ می‌کند",
      "توضیحی در سطح چشمش، یک تصویر و سه مثال می‌گیرد",
      "واژه در دفترچه‌ی شخصی‌اش ذخیره می‌شود",
      "و در تمرینی کوتاه برمی‌گردد، تا واقعاً از آنِ او شود",
    ],
    howBlocks: [
      { t: "واژه را تایپ کن", b: "کودک شما هر واژه‌ای را که نمی‌فهمد، در حالت کودکان، در جایی تمیز و امن تایپ می‌کند." },
      { t: "یک تعریف روشن", b: "توضیحی در سطح چشم کودک، بدون واژه‌های دشوار برای توضیح واژه‌های دشوار." },
      { t: "سه مثال", b: "جمله‌های واقعی که نشان می‌دهند واژه چگونه درون یک متن زندگی می‌کند، نه فقط یک تعریف خشک." },
      { t: "یک تصویر برای هر معنا", b: "چون کودکان آنچه را می‌بینند بسیار بهتر از آنچه برایشان نوشته می‌شود به یاد می‌سپارند." },
      { t: "بافت", b: "جمله‌ای از کتاب را بچسبان و Gadit دقیقاً معنایی را که با آن جور درمی‌آید نشان می‌کند." },
      { t: "یک دفترچه‌ی شخصی", b: "هر واژه‌ای که کودک شما جست‌وجو کرده در دفترچه‌اش ذخیره می‌شود، و فرار نمی‌کند." },
      { t: "یک آزمون کوتاه", b: "پرسشی سریع که واژه را درست پیش از آنکه از یاد برود برمی‌گرداند." },
      { t: "یک بازی", b: "یادگیری از راه بازی، روی واژه‌هایی که کودک شما خودش جست‌وجو کرده است." },
    ],
    chainCost: "",
    chainTurnTitle: "و این چیزی است که به دست می‌آورید",
    chainTurnBody: "هر واژه‌ای که کودک شما رویش گیر کرده به واژه‌ای تبدیل می‌شود که می‌داند، و شما آن را سیاه روی سفید می‌بینید: چند واژه را هفته به هفته بست. به‌جای امید به اینکه چیزی دارد بهتر می‌شود، به‌سادگی می‌بینید که رخ می‌دهد.",
    dashKicker: "داشبورد والدین",
    dashTitle: "دقیقاً می‌بینید هر کودک چقدر یاد گرفته است",
    dashBody: "هر کودک یک دفترچه‌ی واژگان شخصی دارد که رشد می‌کند. در داشبورد خود در یک نگاه می‌بینید هر کودک چند واژه یاد گرفته، چند واژه این هفته افزوده شده، و تازه‌ترین واژه‌هایش. هر ابزار دیگری به کودک پاسخ می‌دهد و فراموش می‌کند. Gadit به یاد می‌سپارد، و شما پیشرفت را هفته به هفته می‌بینید.",
    dashKids: [
      { name: "نوا", total: 47, week: 12 },
      { name: "عیدو", total: 31, week: 8 },
      { name: "مایا", total: 63, week: 15 },
    ],
    dashWordsLabel: "واژه در دفترچه",
    dashWeekLabel: "این هفته",
    featuresKicker: "چه چیزی درونش هست",
    features: [
      {
        kicker: "هر معنا",
        title: "یک واژه. هر معنا. یک تصویر برای هرکدام.",
        body: "یک واژه اغلب چند معنای متفاوت دارد، و اینجاست که کودکان سردرگم می‌شوند. Gadit همه را در یک جا نشان می‌دهد، هرکدام با سه مثال واقعی و تصویر خودش، چون مغز کودک تصویرها را بسیار بهتر از واژه‌ها به یاد می‌سپارد.",
      },
      {
        kicker: "حالت کودکان",
        title: "توضیح‌ها در سطح چشم کودک شما",
        body: "یک کلید، و هر توضیح به زبانی تبدیل می‌شود که کودک 8 ساله واقعاً می‌فهمد. بدون واژه‌های دشوار برای توضیح واژه‌های دشوار، بدون تعریف‌های دَوَرانی. فقط فهمیدن.",
      },
      {
        kicker: "بافت",
        title: "جمله را بچسبان، معنای درست را بگیر",
        body: "بیشتر واژه‌ها بیش از یک معنا دارند، و اینجاست که کودکان گم می‌شوند. جمله را از کتاب یا کاربرگ بچسبان، و Gadit دقیقاً نشان می‌دهد کدام معنا جور درمی‌آید.",
      },
      {
        kicker: "دفترچه‌ی شخصی",
        title: "واژه‌ها فرار نمی‌کنند",
        body: "هر واژه‌ای که کودک شما جست‌وجو می‌کند در دفترچه‌ی شخصی‌اش جای می‌گیرد، و تمرینِ هوشمندِ کوتاه آن را درست پیش از آنکه از یاد برود برمی‌گرداند. دایره‌ی واژگان واقعاً این‌طور ساخته می‌شود، یک واژه در هر بار.",
      },
      {
        kicker: "یک پروفایل برای هر کودک",
        title: "هر کودک فضای خودش را دارد",
        body: "هر کودک در خانواده یک پروفایل جداگانه دارد: دفترچه‌اش، تمرینش، تاریخچه‌اش. حالت کودکان توضیح را تطبیق می‌دهد، ساده و روشن برای کوچک‌ترها و کامل‌تر برای بزرگ‌ترها، و کسی پا روی واژه‌های کسی نمی‌گذارد.",
      },
      {
        kicker: "بازی‌های واژگان",
        title: "بازی‌های یادگیری روی واژه‌های کودک شما",
        body: "آزمون‌ها و بازی‌های کوتاه که از واژه‌هایی ساخته شده‌اند که کودک شما واقعاً جست‌وجو کرده است. چند دقیقه بازی، و دایره‌ی واژگان بدون زحمت رشد می‌کند.",
      },
      {
        kicker: "زبان دوم",
        title: "بهترین کمک‌کارِ تکالیف برای زبان دوم",
        body: "کودک شما واژه‌ای را به انگلیسی تایپ می‌کند و توضیحی ساده به زبان خودش می‌گیرد، با یک تصویر و مثال‌ها. بدون سرگردانی میان فرهنگ لغت، مترجم و یوتیوب.",
      },
    ],
    midCtaTitle: "همین حالا شروع کن، و ببین دایره‌ی واژگان کودکت روز به روز رشد می‌کند",
    midCta: "دوره‌ی آزمایشی رایگان 14 روزه‌ات را شروع کن",
    compareKicker: "تفاوت",
    compareTitle: "چرا فقط در گوگل جست‌وجو نکنیم یا از یک چت‌بات نپرسیم؟",
    compareGadit: "Gadit",
    compareOther: "اینترنت باز",
    compareRows: [
      { label: "یک صفحه‌ی تمیز برای هر واژه", gadit: true, other: false },
      { label: "توضیح‌ها در سطح کودک", gadit: true, other: false },
      { label: "یک تصویر برای هر معنا", gadit: true, other: false },
      { label: "دفترچه و تمرینی که می‌مانند", gadit: true, other: false },
      { label: "تبلیغ و لینک به هر سو", gadit: false, other: true },
      { label: "چتِ بازِ بی‌مرز", gadit: false, other: true },
    ],
    safeTitle: "یک ناحیه‌ی جدا و تمیز. نه دری به جایی دیگر.",
    safeBody: "Gadit فضایی کاملاً بسته است: نه چتِ باز، نه فید، نه تبلیغ، نه لینک بیرونی. کودک از اینجا به تیک‌تاک یا هر اپ دیگری کشیده نمی‌شود. اینجا فقط یک کار هست: فهمیدن یک واژه، و برگشتن به درس.",
    safeLine: "یک صفحه که می‌توانید با خیال آسوده به کودک بدهید.",
    stackTitle: "چه چیزی در طرح خانواده هست",
    stackItems: [
      "جست‌وجوی نامحدود برای همه‌ی خانواده",
      "هر معنا، با یک تصویر برای هرکدام",
      "حالت کودکان برای هر سن",
      "بررسی جمله با بازخورد فوری",
      "یک دفترچه‌ی شخصی و تمرین هوشمند برای هر کودک",
      "بازی‌ها و آزمون‌های واژگان",
      "تا 5 کودک با پروفایل‌های جداگانه",
      "30+ زبان با پشتیبانی کامل",
    ],
    priceKicker: "قیمت‌گذاری",
    priceTitle: "طرح خانواده",
    trialBadge: "دوره‌ی آزمایشی رایگان 14 روزه",
    yearly: "$59 / سال",
    yearlyNote: "یعنی $4.92 در ماه برای همه‌ی خانواده، و نزدیک به دو ماه در مقایسه با پرداخت ماهانه برایت صرفه‌جویی می‌کند",
    priceAnchor: "کمتر از یک جلسه‌ی تدریس خصوصی، برای یک سال کامل، برای هر کودک در خانه",
    monthly: "$5.99 / ماه",
    billedYearly: "سالانه",
    billedMonthly: "ماهانه",
    yearlySave: "-18%",
    priceCta: "دوره‌ی آزمایشی را شروع کن",
    cancelNote: "اولین پرداخت فقط پس از 14 روز. هر زمان از صفحه‌ی حسابت لغو کن، با یک کلیک.",
    singleChild: "فقط یک دانش‌آموز در خانه؟ Deep ماهی $4.99 است. با کمی بیشتر می‌توانی تا 5 کودک اضافه کنی.",
    guaranteeTitle: "آزمون تو: دو هفته",
    guaranteeBody: "دو هفته استفاده‌ی واقعی به آن بده، رایگان. اگر تا روز 14 دفترچه‌ی کودکت دست‌کم 20 واژه‌ی جدید جمع نکرده باشد، با یک کلیک لغو کن و چیزی نپرداختی.",
    faqTitle: "پرسش‌هایی که والدین می‌پرسند",
    faq: [
      {
        q: "با Gadit چه به دست می‌آورم؟",
        a: "هر واژه‌ای که کودک شما جست‌وجو می‌کند یک صفحه‌ی تمیز می‌گیرد: هر معنا، توضیحی در سطح کودک (حالت کودکان)، سه مثال واقعی، و یک تصویر برای هر معنا. به‌علاوه بافت (جمله‌ای را بچسبان و معنای درست را بگیر)، یک دفترچه‌ی واژگان شخصی با تمرین هوشمند، بازی‌ها و آزمون‌های واژگان، یک داشبورد والدین که نشان می‌دهد هر کودک چقدر یاد گرفته، تا 5 کودک روی پروفایل‌های جداگانه، همه در 30+ زبان، در فضایی بسته و امن بدون چتِ باز و بدون تبلیغ.",
      },
      {
        q: "چرا فقط از یک چت‌بات یا گوگل نپرسیم؟",
        a: "چون آن‌ها ابزارهایی برای بزرگسالان هستند. گوگل تبلیغ و لینک به هر سو برمی‌گرداند، و یک چت‌بات باز گفت‌وگویی بی‌مرز است که هیچ والدی کودک را در آن تنها نمی‌گذارد. Gadit برعکس ساخته شده است: یک صفحه‌ی بسته و تمیز برای هر واژه، در سطح کودک، بی‌آنکه راهی برای گم‌شدن باشد.",
      },
      {
        q: "از کجا بدانم کودکم واقعاً پیشرفت می‌کند؟",
        a: "یک داشبورد والدین می‌گیرید. در یک نگاه می‌بینید هر کودک چند واژه یاد گرفته، چند واژه این هفته افزوده شده، و تازه‌ترین واژه‌هایش. هر ابزار دیگری به کودک پاسخ می‌دهد و فراموش می‌کند؛ Gadit هر واژه را در دفترچه‌ی شخصی کودک ذخیره می‌کند، تا شما رشد واژگان را هفته به هفته ببینید.",
      },
      {
        q: "برای چه سنی است؟",
        a: "قلب Gadit کودکان سن مدرسه است، از کلاس اول تا دبیرستان. حالت کودکان برای کوچک‌ترها ساده توضیح می‌دهد، و توضیح‌های کامل به نوجوانان و والدین هم خدمت می‌کند. والد حساب را باز می‌کند.",
      },
      {
        q: "آیا با انگلیسی و زبان‌های دیگر کمک می‌کند؟",
        a: "بسیار زیاد. کودک می‌تواند واژه‌ای را به انگلیسی جست‌وجو کند و توضیحی ساده به زبان خودش بگیرد، با یک تصویر و مثال‌ها، دقیقاً همان کمک‌کاری که در خانه کم است. و در 30+ زبان کار می‌کند، پس کودک می‌تواند توضیح را به زبانی که در خانه صحبت می‌کنید هم بگیرد.",
      },
      {
        q: "چقدر هزینه دارد؟",
        a: "$59 در سال یا $5.99 در ماه، پس از دوره‌ی آزمایشی 14 روزه. بدون هزینه‌ی پنهان، و هر زمان با یک کلیک لغو می‌کنی.",
      },
      {
        q: "چند کودک می‌توانم اضافه کنم؟",
        a: "تا 5 کودک روی یک طرح خانواده، هرکدام با پروفایل، دفترچه و تمرین خودش.",
      },
      {
        q: "می‌توانیم بدون تعهد امتحانش کنیم؟",
        a: "بله. دوره‌ی آزمایشی با یک کارت شروع می‌شود، اما اولین پرداخت فقط زمانی رخ می‌دهد که 14 روز به پایان برسد. هر زمان پیش از آن لغو کن، با یک کلیک، و چیزی نمی‌پردازی.",
      },
    ],
    finalTitle: "همین امروز شروع کن، و ببین دایره‌ی واژگان رشد می‌کند",
    finalSub: "دو هفته رایگان. لغو با یک کلیک. و کودکی که یاد می‌گیرد واژه‌ها را خودش بفهمد.",
    finalCta: "دوره‌ی آزمایشی رایگان 14 روزه‌ات را شروع کن",
    footerTerms: "شرایط",
    footerPrivacy: "حریم خصوصی",
  },
  id: {
    heroBadge: "Kamus visual dan cerdas untuk seluruh keluarga",
    whatIs: "Gadit adalah kamus cerdas dan visual untuk anak: setiap kata mendapat penjelasan sesuai level anak, gambar, contoh, serta permainan dan kuis yang membuat belajar kata jadi menyenangkan. Kosakata bertambah, pemahaman membaca meningkat, dan anak Anda lebih berhasil di sekolah.",
    ctaMicro: "",
    trustLine: "Hingga 5 anak, masing-masing sesuai levelnya sendiri",
    credLine: "Dibangun di atas 15 tahun pengalaman bersama lebih dari 15.000 orang tua, murid, dan pendidik",
    credKicker: "Siapa kami",
    credTitle: "15 tahun di dunia pendidikan. Kini dalam satu alat untuk anak Anda.",
    credBody: "Gadit dibangun oleh tim dengan 15 tahun pengalaman di dunia pendidikan, yang telah bekerja dengan lebih dari 15.000 orang tua, murid, dan pendidik. Apa yang kami lihat berhasil berulang kali, di kelas maupun di rumah, kami rangkum ke dalam satu alat sederhana yang bisa digunakan anak sendiri.",
    proofTitle: "Buku catatan kata · contoh",
    proofBig: "12 kata baru minggu ini",
    proofWords: ["mimpi", "jelas", "enggan"],
    angles: {
      vocab: {
        h1: "Kosakata anak Anda bertambah. Kata demi kata.",
        sub: "Setiap kata yang ditanyakan anak masuk ke buku catatan kata pribadinya di Gadit: dengan gambar, penjelasan sesuai level anak, dan latihan singkat yang mengembalikannya sampai kata itu benar-benar dikuasai. Buka buku catatan di akhir bulan dan saksikan kosakata bertambah, kata demi kata.",
      },
      relief: {
        h1: "Berhenti menjadi kamus keluarga",
        sub: "Mulai hari ini, ketika anak Anda bertanya 'apa artinya ini?', mereka punya satu tempat untuk menemukan jawabannya sendiri: setiap makna, gambar untuk masing-masing, dan penjelasan sesuai level anak. Tanpa chat terbuka, tanpa iklan.",
      },
      anxiety: {
        h1: "Anak Anda membaca setiap kata dengan benar, tapi tidak benar-benar paham",
        sub: "Mereka tidak selalu berhenti untuk bertanya. Mereka melewati kata yang tidak dipahami, terus membaca, dan materinya tidak masuk. Lama-lama itu berubah menjadi frustrasi terhadap sekolah dan perasaan 'aku tidak bisa'. Gadit memberi anak Anda satu tempat untuk berhenti, benar-benar paham, dan kembali ke pelajaran dengan kata itu di tangan.",
      },
      safe: {
        h1: "Satu layar yang bisa Anda berikan kepada anak tanpa khawatir",
        sub: "Tanpa chat terbuka. Tanpa feed tanpa akhir. Tanpa iklan. Satu tempat yang bersih tempat anak mengetik sebuah kata, memahaminya sepenuhnya, dan kembali mengerjakan PR.",
      },
    },
    heroCta: "Mulai uji coba gratis 14 hari",
    heroTrust: "Tanpa chat terbuka · Tanpa iklan · Batalkan dengan satu klik",
    ownerCta: "Buka ruang keluarga Anda",
    stats: ["30+ bahasa", "Gambar untuk setiap makna", "Hingga 5 anak", "Batalkan dengan satu klik"],
    demoKicker: "Hasilnya",
    demoTitle: "Anak Anda memahami setiap kata, dan kosakatanya bertambah setiap hari",
    painKicker: "Rasa sakit yang sebenarnya",
    painTitle: "Anak Anda membaca, tapi tidak selalu benar-benar paham",
    painBody1: "Anda sebenarnya senang ketika anak Anda berhenti untuk bertanya apa arti sebuah kata. Masalahnya adalah semua kata yang tidak mereka tanyakan. Mereka melewatinya, terus membaca, dan materinya tidak masuk. Kosakata tetap tipis, dan pemahaman runtuh kata demi kata.",
    painBody2: "Dan ini menyentuh jauh lebih dari sekadar nilai. Anak yang tidak paham merasa tidak cukup baik, frustrasi dengan sekolah, dan kehilangan kepercayaan diri. Dan itu terjadi dalam diam, tanpa ada yang bisa menunjuk di mana benangnya putus.",
    reframe: "Dan di sinilah tepatnya Gadit hadir.",
    puzzleKicker: "Apa yang terjadi di kepala anak",
    puzzleTitle: "Teks adalah teka-teki. Setiap kata adalah kepingnya.",
    puzzleBody: "Ketika anak membaca, pikirannya menyusun gambaran utuh dari kata-kata. Setiap kata yang dipahami adalah keping yang pas di tempatnya. Setiap kata yang hilang adalah lubang dalam gambar. Cukup tiga atau empat lubang, dan anak tidak lagi melihat gambarnya, meski ia mengeja setiap huruf.",
    puzzleBefore: "Sebuah paragraf dengan kata-kata yang hilang",
    puzzleAfter: "Dengan Gadit, setiap keping di tempatnya",
    puzzleLine: "Ketika setiap kata jelas, anak melihat keseluruhan gambar.",
    chainKicker: "Cara kerjanya",
    chainTitle: "Semua yang didapat anak Anda, pada setiap kata",
    chainSteps: [
      "Anak Anda mengetik kata yang tidak dipahami",
      "Mereka mendapat penjelasan sesuai levelnya, gambar, dan tiga contoh",
      "Kata itu tersimpan di buku catatan pribadinya",
      "Dan kembali dalam latihan singkat, sampai benar-benar dikuasai",
    ],
    howBlocks: [
      { t: "Ketik katanya", b: "Anak Anda mengetik kata apa pun yang tidak dipahami, dalam Mode Anak, di tempat yang bersih dan aman." },
      { t: "Definisi yang jelas", b: "Penjelasan sesuai level anak, tanpa kata sulit yang menjelaskan kata sulit." },
      { t: "Tiga contoh", b: "Kalimat nyata yang menunjukkan bagaimana kata itu hidup di dalam teks, bukan sekadar definisi kering." },
      { t: "Gambar untuk setiap makna", b: "Karena anak mengingat apa yang mereka lihat jauh lebih baik daripada apa yang tertulis untuk mereka." },
      { t: "Konteks", b: "Tempelkan kalimat dari buku dan Gadit menandai tepat makna yang sesuai." },
      { t: "Buku catatan pribadi", b: "Setiap kata yang dicari anak Anda tersimpan di buku catatannya, dan tidak kabur." },
      { t: "Kuis singkat", b: "Pertanyaan cepat yang mengembalikan kata itu tepat sebelum ia terlupakan." },
      { t: "Permainan", b: "Belajar sambil bermain, dengan kata-kata yang dicari sendiri oleh anak Anda." },
    ],
    chainCost: "",
    chainTurnTitle: "Dan inilah yang Anda dapatkan",
    chainTurnBody: "Setiap kata yang membuat anak Anda tersendat menjadi kata yang mereka kuasai, dan Anda melihatnya hitam di atas putih: berapa banyak kata yang mereka tuntaskan, minggu demi minggu. Alih-alih berharap ada yang membaik, Anda cukup menyaksikannya terjadi.",
    dashKicker: "Dasbor orang tua",
    dashTitle: "Anda melihat tepat berapa banyak yang telah dipelajari setiap anak",
    dashBody: "Setiap anak punya buku catatan kata pribadi yang terus bertumbuh. Di dasbor Anda melihat, sekilas, berapa banyak kata yang telah dipelajari setiap anak, berapa yang ditambahkan minggu ini, dan kata-kata terbarunya. Alat lain menjawab anak Anda lalu lupa. Gadit mengingat, dan Anda melihat kemajuan minggu demi minggu.",
    dashKids: [
      { name: "Noa", total: 47, week: 12 },
      { name: "Ido", total: 31, week: 8 },
      { name: "Maya", total: 63, week: 15 },
    ],
    dashWordsLabel: "kata di buku catatan",
    dashWeekLabel: "minggu ini",
    featuresKicker: "Apa yang ada di dalamnya",
    features: [
      {
        kicker: "Setiap makna",
        title: "Satu kata. Setiap makna. Gambar untuk masing-masing.",
        body: "Satu kata sering punya beberapa makna berbeda, dan di situlah anak jadi bingung. Gadit menampilkan semuanya di satu tempat, masing-masing dengan tiga contoh nyata dan gambarnya sendiri, karena otak anak mengingat gambar jauh lebih baik daripada kata.",
      },
      {
        kicker: "Mode Anak",
        title: "Penjelasan sesuai level anak Anda",
        body: "Satu tombol, dan setiap penjelasan berubah menjadi bahasa yang benar-benar dipahami anak usia 8 tahun. Tanpa kata sulit yang menjelaskan kata sulit, tanpa definisi berputar. Hanya pemahaman.",
      },
      {
        kicker: "Konteks",
        title: "Tempelkan kalimat, dapatkan makna yang tepat",
        body: "Sebagian besar kata punya lebih dari satu makna, dan di situlah anak tersesat. Tempelkan kalimat dari buku atau lembar kerja, dan Gadit menandai tepat makna mana yang sesuai.",
      },
      {
        kicker: "Buku catatan pribadi",
        title: "Kata-kata itu tidak kabur",
        body: "Setiap kata yang dicari anak Anda masuk ke buku catatan pribadinya, dan latihan cerdas singkat mengembalikannya tepat sebelum ia terlupakan. Begitulah kosakata benar-benar dibangun, satu kata setiap kali.",
      },
      {
        kicker: "Profil per anak",
        title: "Setiap anak punya ruangnya sendiri",
        body: "Setiap anak dalam keluarga mendapat profil terpisah: buku catatannya, latihannya, riwayatnya. Mode Anak menyesuaikan penjelasan, sederhana dan jelas untuk yang kecil dan lebih lengkap untuk yang besar, dan tidak ada yang mengusik kata milik yang lain.",
      },
      {
        kicker: "Permainan kata",
        title: "Permainan belajar dari kata-kata anak Anda",
        body: "Kuis dan permainan singkat yang dibangun dari kata-kata yang benar-benar dicari anak Anda. Beberapa menit bermain, dan kosakata bertambah tanpa usaha.",
      },
      {
        kicker: "Bahasa kedua",
        title: "Pembantu PR terbaik untuk bahasa kedua",
        body: "Anak Anda mengetik kata dalam bahasa Inggris dan mendapat penjelasan sederhana dalam bahasanya sendiri, dengan gambar dan contoh. Tanpa bolak-balik antara kamus, penerjemah, dan YouTube.",
      },
    ],
    midCtaTitle: "Mulai sekarang, dan saksikan kosakata anak Anda bertambah hari demi hari",
    midCta: "Mulai uji coba gratis 14 hari",
    compareKicker: "Perbedaannya",
    compareTitle: "Kenapa tidak Google saja atau bertanya ke chatbot?",
    compareGadit: "Gadit",
    compareOther: "Internet terbuka",
    compareRows: [
      { label: "Satu halaman bersih per kata", gadit: true, other: false },
      { label: "Penjelasan sesuai level anak", gadit: true, other: false },
      { label: "Gambar untuk setiap makna", gadit: true, other: false },
      { label: "Buku catatan dan latihan yang melekat", gadit: true, other: false },
      { label: "Iklan dan tautan ke segala arah", gadit: false, other: true },
      { label: "Chat terbuka tanpa batas", gadit: false, other: true },
    ],
    safeTitle: "Zona terpisah yang bersih. Bukan pintu menuju tempat lain.",
    safeBody: "Gadit adalah ruang yang sepenuhnya tertutup: tanpa chat terbuka, tanpa feed, tanpa iklan, tanpa tautan keluar. Anak tidak ditarik dari sini ke TikTok atau aplikasi lain mana pun. Hanya ada satu hal yang bisa dilakukan di sini: memahami sebuah kata, lalu kembali belajar.",
    safeLine: "Satu layar yang bisa Anda berikan kepada anak dengan tenang.",
    stackTitle: "Yang termasuk dalam paket Keluarga",
    stackItems: [
      "Pencarian tak terbatas untuk seluruh keluarga",
      "Setiap makna, dengan gambar untuk masing-masing",
      "Mode Anak untuk setiap usia",
      "Pemeriksaan kalimat dengan umpan balik seketika",
      "Buku catatan pribadi dan latihan cerdas per anak",
      "Permainan dan kuis kata",
      "Hingga 5 anak dengan profil terpisah",
      "30+ bahasa dengan dukungan penuh",
    ],
    priceKicker: "Harga",
    priceTitle: "Paket Keluarga",
    trialBadge: "Uji coba gratis 14 hari",
    yearly: "$59 / tahun",
    yearlyNote: "itu setara $4.92 per bulan untuk seluruh keluarga, dan menghemat hampir dua bulan dibanding membayar bulanan",
    priceAnchor: "Kurang dari satu sesi les privat, untuk setahun penuh, untuk setiap anak di rumah",
    monthly: "$5.99 / bulan",
    billedYearly: "Tahunan",
    billedMonthly: "Bulanan",
    yearlySave: "-18%",
    priceCta: "Mulai uji coba",
    cancelNote: "Pembayaran pertama hanya setelah 14 hari. Batalkan kapan saja dari halaman akun Anda, satu klik.",
    singleChild: "Hanya satu murid di rumah? Deep seharga $4.99/bulan. Dengan sedikit tambahan Anda bisa menambahkan hingga 5 anak.",
    guaranteeTitle: "Uji Anda: dua minggu",
    guaranteeBody: "Coba selama dua minggu penggunaan nyata, gratis. Jika sampai hari ke-14 buku catatan anak Anda belum mengumpulkan setidaknya 20 kata baru, batalkan dengan satu klik dan Anda tidak membayar apa pun.",
    faqTitle: "Pertanyaan yang diajukan orang tua",
    faq: [
      {
        q: "Apa yang saya dapatkan dengan Gadit?",
        a: "Setiap kata yang dicari anak Anda mendapat satu halaman bersih: setiap makna, penjelasan sesuai level anak (Mode Anak), tiga contoh nyata, dan gambar per makna. Ditambah konteks (tempelkan kalimat dan dapatkan makna yang tepat), buku catatan kata pribadi dengan latihan cerdas, permainan dan kuis kata, dasbor orang tua yang menunjukkan berapa banyak yang telah dipelajari setiap anak, hingga 5 anak dengan profil terpisah, semuanya dalam 30+ bahasa, di ruang tertutup yang aman tanpa chat terbuka dan tanpa iklan.",
      },
      {
        q: "Kenapa tidak bertanya saja ke chatbot atau Google?",
        a: "Karena itu adalah alat untuk orang dewasa. Google mengembalikan iklan dan tautan ke segala arah, dan chatbot terbuka adalah percakapan tanpa batas yang tidak akan ditinggalkan orang tua mana pun bersama anaknya sendirian. Gadit dibangun dengan cara sebaliknya: satu halaman tertutup yang bersih per kata, sesuai level anak, tanpa jalan untuk tersesat.",
      },
      {
        q: "Bagaimana saya tahu anak saya benar-benar maju?",
        a: "Anda mendapat dasbor orang tua. Sekilas Anda melihat berapa banyak kata yang telah dipelajari setiap anak, berapa yang ditambahkan minggu ini, dan kata-kata terbarunya. Setiap alat lain menjawab anak lalu lupa; Gadit menyimpan setiap kata di buku catatan pribadi anak, sehingga Anda menyaksikan kosakata bertambah minggu demi minggu.",
      },
      {
        q: "Untuk usia berapa ini?",
        a: "Inti dari Gadit adalah anak usia sekolah, dari kelas satu hingga sekolah menengah atas. Mode Anak menjelaskan secara sederhana untuk yang muda, dan penjelasan lengkap juga melayani remaja dan orang tua. Orang tua yang membuka akun.",
      },
      {
        q: "Apakah membantu untuk bahasa Inggris dan bahasa lain?",
        a: "Sangat. Anak bisa mencari kata dalam bahasa Inggris dan mendapat penjelasan sederhana dalam bahasanya sendiri, dengan gambar dan contoh, persis pembantu yang hilang di rumah. Dan ini bekerja dalam 30+ bahasa, sehingga anak juga bisa mendapat penjelasan dalam bahasa yang Anda gunakan di rumah.",
      },
      {
        q: "Berapa biayanya?",
        a: "$59 setahun atau $5.99 sebulan, setelah uji coba 14 hari. Tanpa biaya tersembunyi, dan Anda bisa membatalkan kapan saja dengan satu klik.",
      },
      {
        q: "Berapa banyak anak yang bisa saya tambahkan?",
        a: "Hingga 5 anak dalam satu paket Keluarga, masing-masing dengan profil, buku catatan, dan latihannya sendiri.",
      },
      {
        q: "Bisakah kami mencobanya tanpa komitmen?",
        a: "Bisa. Uji coba dimulai dengan kartu, tapi pembayaran pertama baru terjadi ketika 14 hari berakhir. Batalkan kapan saja sebelum itu, satu klik, dan Anda tidak membayar apa pun.",
      },
    ],
    finalTitle: "Mulai hari ini, dan saksikan kosakata bertambah",
    finalSub: "Dua minggu gratis. Batalkan satu klik. Dan anak yang belajar memahami kata sendiri.",
    finalCta: "Mulai uji coba gratis 14 hari",
    footerTerms: "Ketentuan",
    footerPrivacy: "Privasi",
  },
  he: {
    heroBadge: "מילון חזותי וחכם לכל המשפחה",
    whatIs: "Gadit הוא מילון חכם וחזותי לילדים: כל מילה מקבלת הסבר בגובה העיניים של הילד, תמונה, דוגמאות, ומשחקים וחידונים שהופכים לימוד מילים לכיף. אוצר המילים גדל, הילד מבין את הנקרא, ומצליח יותר בלימודים.",
    ctaMicro: "",
    trustLine: "עד 5 ילדים במשפחה, כל אחד ברמה שלו",
    credLine: "מבוסס על 15 שנות ניסיון עם למעלה מ-15,000 הורים, תלמידים ואנשי חינוך",
    credKicker: "מי אנחנו",
    credTitle: "15 שנה בחינוך. עכשיו בכלי אחד לילד.",
    credBody: "Gadit נבנה על ידי צוות עם 15 שנות ניסיון בחינוך, שליווה למעלה מ-15,000 הורים, תלמידים ואנשי חינוך. את מה שראינו עובד שוב ושוב, בכיתה ובבית, הכנסנו לתוך כלי אחד פשוט שהילד יכול להשתמש בו לבד.",
    proofTitle: "מחברת מילים · דוגמה",
    proofBig: "12 מילים חדשות השבוע",
    proofWords: ["חלום", "מרהיב", "נחוש"],
    angles: {
      vocab: {
        h1: "אוצר המילים של הילד שלכם גדל. מילה אחרי מילה.",
        sub: "כל מילה שהילד שואל עליה נכנסת למחברת המילים האישית שלו ב-Gadit: עם תמונה, הסבר בגובה העיניים של הילד, ותרגול קצר שמחזיר אותה עד שהיא שלו. פותחים את המחברת בסוף החודש ורואים את אוצר המילים גדל, מילה אחרי מילה.",
      },
      relief: {
        h1: "די להיות המילון הפרטי של הבית",
        sub: "מהיום, כשהילד שואל \"מה זה אומר?\", יש לו מקום אחד שבו הוא מוצא את התשובה לבד: כל המשמעויות, תמונה לכל משמעות, והסבר בגובה העיניים של הילד. בלי צ'אט פתוח ובלי פרסומות.",
      },
      anxiety: {
        h1: "הילד קורא כל מילה נכון, אבל לא באמת מבין",
        sub: "הוא לא תמיד עוצר לשאול. הוא מדלג על מילה שהוא לא מבין, ממשיך הלאה, והחומר לא נכנס. לאט לאט זה הופך לתסכול מהלימודים ולתחושה של \"אני לא מצליח\". Gadit נותן לילד מקום אחד לעצור בו, להבין באמת, ולחזור לשיעור עם המילה שלו.",
      },
      safe: {
        h1: "המסך היחיד שנותנים לילד בלי לפחד",
        sub: "לא צ'אט פתוח. לא פיד אינסופי. לא פרסומות. מקום אחד נקי שבו ילד מקליד מילה, מבין אותה עד הסוף, וחוזר לשיעורים.",
      },
    },
    heroCta: "מתחילים 14 ימי ניסיון חינם",
    heroTrust: "בלי צ'אט פתוח · בלי פרסומות · ביטול בלחיצה אחת",
    ownerCta: "לאזור המשפחה שלכם",
    stats: ["30+ שפות ממשק", "תמונה לכל משמעות", "עד 5 ילדים", "ביטול בלחיצה אחת"],
    demoKicker: "התוצאה",
    demoTitle: "הילד מבין כל מילה, ואוצר המילים שלו גדל כל יום",
    painKicker: "נקודת הכאב האמיתית",
    painTitle: "הילד קורא, אבל לא תמיד באמת מבין",
    painBody1: "אתם דווקא שמחים כשהילד עוצר ושואל מה זה מילה. הבעיה היא כל המילים שהוא לא עוצר לשאול עליהן. הוא מדלג עליהן, ממשיך לקרוא, והחומר לא נכנס. אוצר המילים נשאר דל, וההבנה נשברת מילה אחרי מילה.",
    painBody2: "וזה נוגע בהרבה יותר מציון. ילד שלא מבין מרגיש שהוא לא מספיק טוב, מתוסכל מהלימודים, ומאבד ביטחון. וזה קורה בשקט, בלי שאף אחד יודע להצביע איפה בדיוק נשבר החוט.",
    reframe: "וזה בדיוק המקום שבו Gadit נכנס.",
    puzzleKicker: "מה קורה בראש של הילד",
    puzzleTitle: "טקסט הוא פאזל. כל מילה היא חתיכה.",
    puzzleBody: "כשילד קורא, המוח שלו מרכיב תמונה שלמה מהמילים. כל מילה שהוא מבין היא חתיכה שנכנסת למקום. כל מילה שחסרה היא חור בתמונה. מספיק שלושה-ארבעה חורים, והילד כבר לא רואה את התמונה, גם אם הגה כל אות נכון.",
    puzzleBefore: "פסקה עם מילים חסרות",
    puzzleAfter: "עם Gadit, כל חתיכה במקום",
    puzzleLine: "כשכל המילים ברורות, הילד רואה את התמונה השלמה.",
    chainKicker: "איך זה עובד",
    chainTitle: "על כל מילה, הילד מקבל את כל זה",
    chainSteps: [
      "הילד מקליד מילה שהוא לא מבין",
      "מקבל הסבר בגובה העיניים שלו, תמונה ושלוש דוגמאות",
      "המילה נשמרת במחברת האישית שלו",
      "וחוזרת בתרגול קצר, עד שהיא באמת שלו",
    ],
    howBlocks: [
      { t: "הקלדת המילה", b: "הילד מקליד כל מילה שהוא לא מבין, במצב ילדים, במקום נקי ובטוח." },
      { t: "הגדרה ברורה", b: "הסבר בגובה העיניים של הילד, בלי מילים קשות שמסבירות מילים קשות." },
      { t: "שלוש דוגמאות", b: "משפטים אמיתיים שמראים איך המילה חיה בתוך טקסט, לצד תמונה שממחישה אותה." },
      { t: "תמונה לכל משמעות", b: "כי ילדים זוכרים מה שהם רואים, הרבה יותר טוב ממה שכתוב להם." },
      { t: "הבנת הקשר", b: "מדביקים משפט מהספר, ו-Gadit מסמן בדיוק את המשמעות שמתאימה לו." },
      { t: "מחברת אישית", b: "כל מילה שהילד חיפש נשמרת במחברת שלו, ולא בורחת." },
      { t: "חידון קצר", b: "שאלה קצרה שמחזירה את המילה בדיוק כשהיא עומדת להישכח." },
      { t: "משחק", b: "לומדים תוך כדי משחק, על המילים שהילד עצמו חיפש." },
    ],
    chainCost: "",
    chainTurnTitle: "וזה מה שאתם מקבלים",
    chainTurnBody: "כל מילה שהילד נתקע בה הופכת למילה שהוא יודע, ואתם רואים את זה שחור על גבי לבן: כמה מילים הוא סגר, שבוע אחרי שבוע. במקום לקוות שמשהו משתפר, אתם פשוט רואים את זה קורה.",
    dashKicker: "לוח הבקרה להורה",
    dashTitle: "אתם רואים בדיוק כמה כל ילד למד",
    dashBody: "לכל ילד במשפחה יש מחברת מילים אישית שגדלה. בלוח הבקרה שלכם אתם רואים במבט אחד כמה מילים כל ילד למד, כמה נוספו השבוע, ואילו מילים אחרונות. כל כלי אחר עונה לילד ושוכח. Gadit שומר, ואתם רואים את ההתקדמות שבוע אחרי שבוע.",
    dashKids: [
      { name: "נועה", total: 47, week: 12 },
      { name: "עידו", total: 31, week: 8 },
      { name: "מאיה", total: 63, week: 15 },
    ],
    dashWordsLabel: "מילים במחברת",
    dashWeekLabel: "השבוע",
    featuresKicker: "מה יש בפנים",
    features: [
      {
        kicker: "כל המשמעויות",
        title: "מילה אחת. כל הפירושים. תמונה לכל אחד.",
        body: "למילה אחת יש הרבה פעמים כמה משמעויות שונות, ושם ילדים מתבלבלים. Gadit מציג את כולן במקום אחד, כל אחת עם שלוש דוגמאות אמיתיות ותמונה משלה, כי מוח של ילד זוכר תמונות הרבה יותר טוב ממילים.",
      },
      {
        kicker: "מצב ילדים",
        title: "הסבר בגובה העיניים של הילד",
        body: "מתג אחד, וכל ההסברים עוברים לשפה שילד בן 8 באמת מבין. בלי מילים קשות שמסבירות מילים קשות, בלי הגדרות מעגליות. פשוט להבין.",
      },
      {
        kicker: "הבנת הקשר",
        title: "מדביקים משפט, מקבלים את הפירוש הנכון",
        body: "לרוב המילים יש יותר מפירוש אחד, ושם ילדים הולכים לאיבוד. מדביקים את המשפט מהספר או מדף העבודה, ו-Gadit מסמן בדיוק איזו משמעות מתאימה להקשר הזה.",
      },
      {
        kicker: "מחברת אישית",
        title: "המילים לא בורחות",
        body: "כל מילה שהילד חיפש נשמרת במחברת האישית שלו, ותרגול קצר וחכם מחזיר אותה בדיוק כשהיא עומדת להישכח. ככה אוצר מילים באמת נבנה, מילה אחרי מילה.",
      },
      {
        kicker: "פרופיל לכל ילד",
        title: "לכל ילד המרחב שלו",
        body: "לכל ילד במשפחה פרופיל נפרד: המחברת שלו, התרגול שלו וההיסטוריה שלו. מצב ילדים מתאים את ההסבר, פשוט וברור לקטנים ומלא יותר לגדולים, ואף אחד לא דורך לאף אחד על המילים.",
      },
      {
        kicker: "משחקי מילים",
        title: "משחקי למידה על המילים של הילד",
        body: "חידונים ומשחקים קצרים שבנויים על המילים שהילד עצמו חיפש. כמה דקות של משחק, ואוצר המילים גדל בלי מאמץ.",
      },
      {
        kicker: "אנגלית",
        title: "העוזר הכי טוב לשיעורי אנגלית",
        body: "הילד מקליד מילה באנגלית ומקבל הסבר פשוט בעברית, עם תמונה ודוגמאות. בלי לנדוד בין מילון, גוגל טרנסלייט ויוטיוב. שיעורי אנגלית מפסיקים להיות מלחמה.",
      },
    ],
    midCtaTitle: "התחילו וראו איך אוצר המילים של הילד גדל יום אחרי יום",
    midCta: "מתחילים 14 ימי ניסיון חינם",
    compareKicker: "ההבדל",
    compareTitle: "למה לא פשוט לחפש בגוגל או לשאול צ'אט?",
    compareGadit: "Gadit",
    compareOther: "האינטרנט הפתוח",
    compareRows: [
      { label: "עמוד אחד נקי לכל מילה", gadit: true, other: false },
      { label: "הסבר בגובה העיניים של הילד", gadit: true, other: false },
      { label: "תמונה לכל משמעות", gadit: true, other: false },
      { label: "מחברת ותרגול שנשארים", gadit: true, other: false },
      { label: "פרסומות וקישורים לכל כיוון", gadit: false, other: true },
      { label: "צ'אט פתוח בלי גבולות", gadit: false, other: true },
    ],
    safeTitle: "אזור נפרד ונקי, לא שער לשום מקום אחר",
    safeBody: "Gadit הוא מקום סגור לגמרי: אין צ'אט פתוח, אין פיד, אין פרסומות ואין קישורים החוצה. הילד לא נשאב מכאן לטיקטוק או לאף אפליקציה אחרת. יש כאן דבר אחד לעשות: להבין מילה, ולחזור ללימודים.",
    safeLine: "מסך אחד שאפשר לתת לילד בראש שקט.",
    stackTitle: "מה מקבלים במסלול המשפחתי",
    stackItems: [
      "חיפושים בלי הגבלה לכל המשפחה",
      "כל המשמעויות, עם תמונה לכל משמעות",
      "מצב ילדים לכל הגילאים",
      "בדיקת משפטים עם משוב מיידי",
      "מחברת אישית ותרגול חכם לכל ילד",
      "משחקי מילים וחידונים",
      "עד 5 ילדים בפרופילים נפרדים",
      "30+ שפות, כולל עברית מלאה ואנגלית",
    ],
    priceKicker: "התמחור",
    priceTitle: "מסלול המשפחה",
    trialBadge: "14 ימי ניסיון חינם",
    yearly: "199 ₪ לשנה",
    yearlyNote: "פחות מ-17 ₪ לחודש לכל המשפחה, וחוסכים קרוב לחודשיים לעומת התשלום החודשי",
    priceAnchor: "פחות משיעור פרטי אחד, לשנה שלמה, לכל הילדים בבית",
    monthly: "19.90 ₪ לחודש",
    billedYearly: "שנתי",
    billedMonthly: "חודשי",
    yearlySave: "-17%",
    priceCta: "מתחילים את הניסיון",
    cancelNote: "החיוב בשקלים, רק בתום 14 הימים. מבטלים בלחיצה אחת מדף החשבון, מתי שרוצים.",
    singleChild: "יש בבית תלמיד אחד? מסלול Deep ב-₪16.90 לחודש. בשלושה שקלים נוספים מצרפים עד 5 ילדים.",
    guaranteeTitle: "המבחן שלכם: שבועיים",
    guaranteeBody: "תנו לזה שבועיים בשימוש אמיתי, בחינם. אם עד יום ה-14 לא הצטברו במחברת של הילד לפחות 20 מילים חדשות, מבטלים בלחיצה אחת ולא שילמתם שקל.",
    faqTitle: "שאלות של הורים",
    faq: [
      {
        q: "מה אני מקבל ב-Gadit?",
        a: "כל מילה שהילד מחפש מקבלת עמוד אחד נקי: כל המשמעויות, הסבר בגובה העיניים של הילד (מצב ילדים), שלוש דוגמאות אמיתיות, ותמונה לכל משמעות. בנוסף, הבנת הקשר (מדביקים משפט ומקבלים את המשמעות הנכונה), מחברת מילים אישית עם תרגול חכם, משחקי מילים וחידונים, לוח בקרה להורה שמראה כמה כל ילד למד, עד 5 ילדים בפרופילים נפרדים, והכול ב-30+ שפות, במרחב סגור ובטוח, בלי צ'אט פתוח ובלי פרסומות.",
      },
      {
        q: "למה לא פשוט לשאול צ'אט או גוגל?",
        a: "כי אלה כלים למבוגרים. חיפוש בגוגל מחזיר פרסומות וקישורים לכל כיוון, וצ'אט פתוח הוא שיחה בלי גבולות שאף הורה לא משאיר בה ילד לבד. Gadit בנוי הפוך: עמוד אחד סגור ונקי לכל מילה, בגובה העיניים של הילד, בלי שום דרך ללכת לאיבוד.",
      },
      {
        q: "איך אני יודע שהילד באמת מתקדם?",
        a: "יש לכם לוח בקרה להורה. במבט אחד רואים כמה מילים כל ילד למד, כמה נוספו השבוע ואילו מילים אחרונות. כל כלי אחר עונה לילד ושוכח, ו-Gadit שומר כל מילה במחברת האישית של הילד, כך שאתם רואים את אוצר המילים גדל שבוע אחרי שבוע.",
      },
      {
        q: "לאילו גילאים זה מתאים?",
        a: "הלב של Gadit הוא ילדים בגיל בית ספר, מכיתה א ועד תיכון. מצב ילדים מסביר בפשטות לקטנים, וההסברים המלאים משרתים גם בני נוער והורים. את החשבון פותח ההורה.",
      },
      {
        q: "זה עוזר גם באנגלית ובשפות נוספות?",
        a: "מאוד. אפשר לחפש מילה באנגלית ולקבל הסבר בעברית פשוטה, עם תמונה ודוגמאות, בדיוק הכלי שחסר בבית לשיעורי אנגלית. וזה עובד ב-30+ שפות, כך שהילד יכול לקבל את ההסבר גם בשפה שמדברים אצלכם בבית.",
      },
      {
        q: "המחיר באמת בשקלים?",
        a: "כן. החיוב בשקלים, בכרטיס ישראלי רגיל, בלי עמלות המרה ובלי הפתעות: ₪199 לשנה או ₪19.90 לחודש, אחרי 14 ימי הניסיון.",
      },
      {
        q: "כמה ילדים אפשר לחבר?",
        a: "עד 5 ילדים במנוי משפחתי אחד, לכל ילד פרופיל, מחברת ותרגול משלו.",
      },
      {
        q: "אפשר לנסות בלי להתחייב?",
        a: "כן. מתחילים 14 ימי ניסיון עם כרטיס, אבל החיוב הראשון יורד רק בתום הניסיון. מבטלים בכל רגע קודם, בלחיצה אחת, ולא תחויבו בכלום.",
      },
    ],
    finalTitle: "התחילו היום, וראו את אוצר המילים גדל",
    finalSub: "שבועיים חינם. ביטול בלחיצה. והילד לומד להבין מילים לבד, ואוצר המילים שלו גדל.",
    finalCta: "מתחילים 14 ימי ניסיון חינם",
    footerTerms: "תנאים",
    footerPrivacy: "פרטיות",
  },
  en: {
    heroBadge: "A visual, smart dictionary for the whole family",
    whatIs: "Gadit is a smart, visual dictionary for kids: every word gets a kid-level explanation, a picture, examples, and games and quizzes that make learning words fun. Vocabulary grows, reading comprehension improves, and your child does better at school.",
    ctaMicro: "",
    trustLine: "Up to 5 kids, each at their own level",
    credLine: "Built on 15 years of experience with more than 15,000 parents, students and educators",
    credKicker: "Who we are",
    credTitle: "15 years in education. Now in one tool for your child.",
    credBody: "Gadit was built by a team with 15 years of experience in education, that has worked with more than 15,000 parents, students and educators. What we saw work again and again, in the classroom and at home, we put into one simple tool a child can use on their own.",
    proofTitle: "Word notebook · example",
    proofBig: "12 new words this week",
    proofWords: ["dream", "vivid", "reluctant"],
    angles: {
      vocab: {
        h1: "Your child's vocabulary grows. Word by word.",
        sub: "Every word your child asks about lands in their personal word notebook in Gadit: with a picture, a kid-level explanation, and short practice that brings it back until it is theirs. Open the notebook at the end of the month and watch the vocabulary grow, word by word.",
      },
      relief: {
        h1: "Stop being the family dictionary",
        sub: "From today, when your kid asks \"what does this mean?\", they have one place to find the answer alone: every meaning, a picture for each one, and an explanation at kid level. No open chat, no ads.",
      },
      anxiety: {
        h1: "Your child reads every word right, but does not really understand",
        sub: "They do not always stop to ask. They skip a word they do not understand, keep going, and the material does not sink in. Over time it turns into frustration with school and a feeling of \"I can't do this\". Gadit gives your child one place to stop, truly understand, and get back to the lesson with the word in hand.",
      },
      safe: {
        h1: "The one screen you can hand a child without worry",
        sub: "No open chat. No endless feed. No ads. One clean place where a kid types a word, understands it fully, and goes back to homework.",
      },
    },
    heroCta: "Start your 14-day free trial",
    heroTrust: "No open chat · No ads · Cancel in one click",
    ownerCta: "Go to your family space",
    stats: ["30+ languages", "A picture per meaning", "Up to 5 kids", "Cancel in one click"],
    demoKicker: "The result",
    demoTitle: "Your child understands every word, and their vocabulary grows every day",
    painKicker: "The real pain",
    painTitle: "Your child reads, but does not always truly understand",
    painBody1: "You're actually glad when your child stops to ask what a word means. The problem is all the words they don't stop to ask about. They skip them, keep reading, and the material doesn't sink in. Vocabulary stays thin, and comprehension breaks word after word.",
    painBody2: "And it touches far more than a grade. A child who does not understand feels not good enough, gets frustrated with school, and loses confidence. And it happens silently, with nobody able to point to where the thread broke.",
    reframe: "And this is exactly where Gadit comes in.",
    puzzleKicker: "What happens in a child's head",
    puzzleTitle: "Text is a puzzle. Every word is a piece.",
    puzzleBody: "When a child reads, their mind assembles a whole picture from the words. Every word they understand is a piece that clicks into place. Every missing word is a hole in the picture. Just three or four holes, and the child no longer sees the picture, even if they sounded out every letter.",
    puzzleBefore: "A paragraph with missing words",
    puzzleAfter: "With Gadit, every piece in place",
    puzzleLine: "When every word is clear, the child sees the whole picture.",
    chainKicker: "How it works",
    chainTitle: "Everything your child gets, on every word",
    chainSteps: [
      "Your child types a word they do not understand",
      "They get an explanation at their eye level, a picture and three examples",
      "The word is saved in their personal notebook",
      "And comes back in short practice, until it is truly theirs",
    ],
    howBlocks: [
      { t: "Type the word", b: "Your child types any word they don't understand, in Kids Mode, in a clean and safe place." },
      { t: "A clear definition", b: "An explanation at the child's eye level, no hard words explaining hard words." },
      { t: "Three examples", b: "Real sentences that show how the word lives inside a text, with an image, not just a definition." },
      { t: "A picture for every meaning", b: "Because children remember what they see far better than what is written to them." },
      { t: "Context", b: "Paste a sentence from the book and Gadit marks exactly the meaning that fits it." },
      { t: "A personal notebook", b: "Every word your child looked up is saved in their notebook, and doesn't run away." },
      { t: "A short quiz", b: "A quick question that brings the word back right before it slips away." },
      { t: "A game", b: "Learning through play, on the words your child looked up themselves." },
    ],
    chainCost: "",
    chainTurnTitle: "And this is what you get",
    chainTurnBody: "Every word your child got stuck on becomes a word they know, and you see it in black and white: how many words they closed, week after week. Instead of hoping something is improving, you simply watch it happen.",
    dashKicker: "The parent dashboard",
    dashTitle: "You see exactly how much each child has learned",
    dashBody: "Every child has a personal word notebook that grows. In your dashboard you see, at a glance, how many words each child has learned, how many were added this week, and their most recent words. Any other tool answers your child and forgets. Gadit remembers, and you see the progress week after week.",
    dashKids: [
      { name: "Noa", total: 47, week: 12 },
      { name: "Ido", total: 31, week: 8 },
      { name: "Maya", total: 63, week: 15 },
    ],
    dashWordsLabel: "words in notebook",
    dashWeekLabel: "this week",
    featuresKicker: "What's inside",
    features: [
      {
        kicker: "Every meaning",
        title: "One word. Every meaning. A picture for each.",
        body: "One word often has several different meanings, and that is where kids get confused. Gadit shows them all in one place, each with three real examples and its own picture, because a child's brain remembers images far better than words.",
      },
      {
        kicker: "Kids Mode",
        title: "Explanations at your child's eye level",
        body: "One switch, and every explanation turns into language an 8-year-old actually understands. No hard words explaining hard words, no circular definitions. Just understanding.",
      },
      {
        kicker: "Context",
        title: "Paste a sentence, get the right meaning",
        body: "Most words have more than one meaning, and that is where kids get lost. Paste the sentence from the book or worksheet, and Gadit marks exactly which meaning fits.",
      },
      {
        kicker: "Personal notebook",
        title: "The words don't run away",
        body: "Every word your child looks up lands in their personal notebook, and short smart practice brings it back right before it slips away. That is how vocabulary is really built, one word at a time.",
      },
      {
        kicker: "A profile per child",
        title: "Every child gets their own space",
        body: "Each child in the family gets a separate profile: their notebook, their practice, their history. Kids Mode adapts the explanation, simple and clear for the little ones and fuller for the older ones, and nobody steps on anybody's words.",
      },
      {
        kicker: "Word games",
        title: "Learning games on your child's words",
        body: "Short quizzes and games built from the words your child actually looked up. A few minutes of play, and vocabulary grows without effort.",
      },
      {
        kicker: "Second language",
        title: "The best homework helper for a second language",
        body: "Your child types a word in English and gets a simple explanation in their own language, with a picture and examples. No wandering between a dictionary, a translator and YouTube.",
      },
    ],
    midCtaTitle: "Start now, and watch your child's vocabulary grow day by day",
    midCta: "Start your 14-day free trial",
    compareKicker: "The difference",
    compareTitle: "Why not just Google it or ask a chatbot?",
    compareGadit: "Gadit",
    compareOther: "The open internet",
    compareRows: [
      { label: "One clean page per word", gadit: true, other: false },
      { label: "Explanations at kid level", gadit: true, other: false },
      { label: "A picture for every meaning", gadit: true, other: false },
      { label: "A notebook and practice that stick", gadit: true, other: false },
      { label: "Ads and links in every direction", gadit: false, other: true },
      { label: "Open-ended chat with no bounds", gadit: false, other: true },
    ],
    safeTitle: "A separate, clean zone. Not a doorway anywhere else.",
    safeBody: "Gadit is a fully closed space: no open chat, no feed, no ads, no outbound links. A child is not pulled from here into TikTok or any other app. There is one thing to do here: understand a word, and get back to studying.",
    safeLine: "One screen you can hand a child with a clear mind.",
    stackTitle: "What the Family plan includes",
    stackItems: [
      "Unlimited searches for the whole family",
      "Every meaning, with a picture for each",
      "Kids Mode for every age",
      "Sentence checking with instant feedback",
      "A personal notebook and smart practice per child",
      "Word games and quizzes",
      "Up to 5 kids with separate profiles",
      "30+ languages with full support",
    ],
    priceKicker: "Pricing",
    priceTitle: "The Family plan",
    trialBadge: "14-day free trial",
    yearly: "$59 / year",
    yearlyNote: "that is $4.92 a month for the whole family, and saves you close to two months versus paying monthly",
    priceAnchor: "Less than one private tutoring session, for a whole year, for every child at home",
    monthly: "$5.99 / month",
    billedYearly: "Yearly",
    billedMonthly: "Monthly",
    yearlySave: "-18%",
    priceCta: "Start the trial",
    cancelNote: "First charge only after the 14 days. Cancel anytime from your account page, one click.",
    singleChild: "Just one student at home? Deep is $4.99/month. For a little more you can add up to 5 kids.",
    guaranteeTitle: "Your test: two weeks",
    guaranteeBody: "Give it two weeks of real use, free. If by day 14 your child's notebook has not gathered at least 20 new words, cancel in one click and you paid nothing.",
    faqTitle: "Questions parents ask",
    faq: [
      {
        q: "What do I get with Gadit?",
        a: "Every word your child looks up gets one clean page: every meaning, a kid-level explanation (Kids Mode), three real examples, and a picture per meaning. Plus context (paste a sentence and get the right meaning), a personal word notebook with smart practice, word games and quizzes, a parent dashboard showing how much each child has learned, up to 5 kids on separate profiles, all in 30+ languages, in a closed, safe space with no open chat and no ads.",
      },
      {
        q: "Why not just ask a chatbot or Google?",
        a: "Because those are tools for adults. Google returns ads and links in every direction, and an open chatbot is a boundless conversation no parent leaves a child alone in. Gadit is built the other way around: one closed, clean page per word, at kid level, with no way to get lost.",
      },
      {
        q: "How do I know my child is actually progressing?",
        a: "You get a parent dashboard. At a glance you see how many words each child has learned, how many were added this week, and their latest words. Every other tool answers the child and forgets; Gadit saves every word in the child's personal notebook, so you watch the vocabulary grow week after week.",
      },
      {
        q: "What ages is it for?",
        a: "The heart of Gadit is school-age kids, from first grade through high school. Kids Mode explains simply for the young ones, and the full explanations serve teens and parents too. The parent opens the account.",
      },
      {
        q: "Does it help with English and other languages?",
        a: "Very much. A child can look up a word in English and get a simple explanation in their own language, with a picture and examples, exactly the helper missing at home. And it works in 30+ languages, so the child can get the explanation in the language you speak at home too.",
      },
      {
        q: "How much does it cost?",
        a: "$59 a year or $5.99 a month, after the 14-day trial. No hidden fees, and you cancel anytime in one click.",
      },
      {
        q: "How many kids can I add?",
        a: "Up to 5 kids on one Family plan, each with their own profile, notebook and practice.",
      },
      {
        q: "Can we try it without committing?",
        a: "Yes. The trial starts with a card, but the first charge happens only when the 14 days end. Cancel anytime before that, one click, and you pay nothing.",
      },
    ],
    finalTitle: "Start today, and watch the vocabulary grow",
    finalSub: "Two weeks free. One-click cancel. And a child who learns to understand words on their own.",
    finalCta: "Start your 14-day free trial",
    footerTerms: "Terms",
    footerPrivacy: "Privacy",
  },
  zu: {
    heroBadge: "Isichazamazwi esibonakalayo, esihlakaniphile somndeni wonke",
    whatIs: "Gadit isichazamazwi esihlakaniphile, esibonakalayo sezingane: igama ngalinye lithola incazelo esezingeni lengane, isithombe, izibonelo, kanye nemidlalo nemibuzo eyenza ukufunda amagama kube mnandi. Ulwazi lwamagama luyakhula, ukuqonda okufundwayo kuyathuthuka, futhi ingane yakho yenza kangcono esikoleni.",
    ctaMicro: "",
    trustLine: "Kuze kube izingane ezi-5, ngayinye isezingeni layo",
    credLine: "Kwakhelwe phezu kweminyaka engu-15 yolwazi nabazali abangaphezu kuka-15,000, abafundi nothisha",
    credKicker: "Singobani",
    credTitle: "Iminyaka engu-15 emfundweni. Manje kuthuluzi elilodwa lengane yakho.",
    credBody: "Gadit yakhiwe ithimba elinolwazi lweminyaka engu-15 emfundweni, elisebenze nabazali abangaphezu kuka-15,000, abafundi nothisha. Lokho esakubona kusebenza kaninginingi, ekilasini nasekhaya, sikubeke kuthuluzi elilodwa elilula ingane engalisebenzisa yodwa.",
    proofTitle: "Incwadana yamagama · isibonelo",
    proofBig: "Amagama amasha angu-12 kuleli sonto",
    proofWords: ["iphupho", "okugqamile", "ovilaphayo"],
    angles: {
      vocab: {
        h1: "Ulwazi lwamagama lwengane yakho luyakhula. Igama ngegama.",
        sub: "Igama ngalinye ingane yakho ebuza ngalo lihlala encwadaneni yayo yamagama siqu e-Gadit: nesithombe, incazelo esezingeni lengane, nokuzilolonga okufushane okulibuyisa lize libe ngelayo. Vula incwadana ekupheleni kwenyanga bese ubuka ulwazi lwamagama lukhula, igama ngegama.",
      },
      relief: {
        h1: "Yeka ukuba yisichazamazwi somndeni",
        sub: "Kusukela namuhla, uma ingane yakho ibuza \"lokhu kusho ukuthini?\", inendawo eyodwa lapho ingathola khona impendulo yodwa: yonke incazelo, isithombe sencazelo ngayinye, nencazelo esezingeni lengane. Akukho ingxoxo evulekile, akukho zikhangiso.",
      },
      anxiety: {
        h1: "Ingane yakho ifunda wonke amagama kahle, kodwa ayiqondi ngempela",
        sub: "Ayihlali njalo ime ibuze. Iyaleqa igama engaliqondi, iqhubeke, futhi okufundwayo akungeni. Ngokuhamba kwesikhathi lokhu kuphenduka ukukhungatheka ngesikole nomuzwa wokuthi \"angikwazi lokhu\". Gadit inikeza ingane yakho indawo eyodwa yokuma, iqonde ngempela, ibuyele esifundweni isiliqondile igama.",
      },
      safe: {
        h1: "Isikrini esisodwa ongasinika ingane ungakhathazeki",
        sub: "Akukho ingxoxo evulekile. Akukho ukushunyayelwa okungapheli. Akukho zikhangiso. Indawo eyodwa ehlanzekile lapho ingane ithayipha khona igama, iliqonde ngokugcwele, ibuyele emsebenzini wesikole.",
      },
    },
    heroCta: "Qala isikhathi sakho samahhala sezinsuku ezingu-14",
    heroTrust: "Akukho ingxoxo evulekile · Akukho zikhangiso · Khansela ngokuchofoza kanye",
    ownerCta: "Iya endaweni yakho yomndeni",
    stats: ["Izilimi ezingu-21", "Isithombe encazelweni ngayinye", "Kuze kube izingane ezi-5", "Khansela ngokuchofoza kanye"],
    demoKicker: "Umphumela",
    demoTitle: "Ingane yakho iqonda wonke amagama, futhi ulwazi lwayo lwamagama lukhula nsuku zonke",
    painKicker: "Ubuhlungu bangempela",
    painTitle: "Ingane yakho iyafunda, kodwa ayiqondi ngempela ngaso sonke isikhathi",
    painBody1: "Empeleni uyajabula uma ingane yakho ima ibuze ukuthi igama lisho ukuthini. Inkinga yiwo wonke amagama engami ibuze ngawo. Iyawaleqa, iqhubeke ifunde, futhi okufundwayo akungeni. Ulwazi lwamagama luhlala luncane, futhi ukuqonda kuyaphuka igama emva kwegama.",
    painBody2: "Futhi kuthinta okungaphezu kwesimaki nje. Ingane engaqondi izizwa ingalungile ngokwanele, ikhungatheke ngesikole, futhi ilahlekelwe ukuzethemba. Futhi kwenzeka buthule, kungekho muntu okwazi ukukhomba lapho intambo yephuke khona.",
    reframe: "Futhi yilapha kanye lapho Gadit ingena khona.",
    puzzleKicker: "Okwenzeka ekhanda lengane",
    puzzleTitle: "Umbhalo uyiphazili. Igama ngalinye liyingxenye.",
    puzzleBody: "Uma ingane ifunda, ingqondo yayo yakha isithombe esiphelele ngamagama. Igama ngalinye eliqondayo yingxenye engena endaweni yayo. Igama ngalinye elingekho yimbobo esithombeni. Izimbobo ezintathu noma ezine nje, ingane ayisasiboni isithombe, ngisho noma iphimise zonke izinhlamvu.",
    puzzleBefore: "Isigaba esinamagama angekho",
    puzzleAfter: "Nge-Gadit, yonke ingxenye isendaweni yayo",
    puzzleLine: "Uma wonke amagama ecacile, ingane ibona isithombe esiphelele.",
    chainKicker: "Ukuthi kusebenza kanjani",
    chainTitle: "Konke ingane yakho ekutholayo, kwigama ngalinye",
    chainSteps: [
      "Ingane yakho ithayipha igama engaliqondi",
      "Ithola incazelo esezingeni layo, isithombe nezibonelo ezintathu",
      "Igama ligcinwa encwadaneni yayo siqu",
      "Bese libuya ekuzilolongeni okufushane, lize libe ngelayo ngempela",
    ],
    howBlocks: [
      { t: "Thayipha igama", b: "Ingane yakho ithayipha noma yiliphi igama engaliqondi, eModini Yezingane, endaweni ehlanzekile nephephile." },
      { t: "Incazelo ecacile", b: "Incazelo esezingeni leso lengane, akukho magama anzima achaza amagama anzima." },
      { t: "Izibonelo ezintathu", b: "Imisho yangempela ekhombisa ukuthi igama liphila kanjani ngaphakathi kombhalo, hhayi nje incazelo eyomile." },
      { t: "Isithombe sencazelo ngayinye", b: "Ngoba izingane zikhumbula lokho ezikubonayo kangcono kakhulu kunalokho ezikubhalelwayo." },
      { t: "Umongo", b: "Namathisela umusho ovela encwadini bese Gadit imaka incazelo efanele ngqo." },
      { t: "Incwadana yakho siqu", b: "Igama ngalinye ingane yakho eliphenyile ligcinwa encwadaneni yayo, futhi alibaleki." },
      { t: "Umbuzo omfushane", b: "Umbuzo osheshayo obuyisa igama ngaphambi nje kokuba libaleke." },
      { t: "Umdlalo", b: "Ukufunda ngokudlala, ngamagama ingane yakho eziphenyele wona." },
    ],
    chainCost: "",
    chainTurnTitle: "Futhi yilokhu okutholayo",
    chainTurnBody: "Igama ngalinye ingane yakho ebibambeke kulo liba yigama eyaziyo, futhi ukubona ngokusobala: mangaki amagama eyawavalile, isonto emva kwesonto. Esikhundleni sokuthemba ukuthi kukhona okuthuthukayo, umane ukubuke kwenzeka.",
    dashKicker: "Ideshibhodi lomzali",
    dashTitle: "Ubona kahle ukuthi ingane ngayinye ifunde kangakanani",
    dashBody: "Ingane ngayinye inencwadana yamagama yayo siqu ekhulayo. Kwideshibhodi lakho ubona, ngokushesha, ukuthi ingane ngayinye ifunde amagama amangaki, mangaki angeziwe kuleli sonto, namagama ayo akamuva. Noma yiliphi elinye ithuluzi liyayiphendula ingane yakho bese liyakhohlwa. Gadit iyakhumbula, futhi ubona intuthuko isonto emva kwesonto.",
    dashKids: [
      { name: "Noa", total: 47, week: 12 },
      { name: "Ido", total: 31, week: 8 },
      { name: "Maya", total: 63, week: 15 },
    ],
    dashWordsLabel: "amagama encwadaneni",
    dashWeekLabel: "kuleli sonto",
    featuresKicker: "Okungaphakathi",
    features: [
      {
        kicker: "Yonke incazelo",
        title: "Igama elilodwa. Yonke incazelo. Isithombe sencazelo ngayinye.",
        body: "Igama elilodwa ngokuvamile linezincazelo eziningi ezahlukene, futhi yilapho izingane zidideka khona. Gadit izikhombisa zonke endaweni eyodwa, ngayinye inezibonelo ezintathu zangempela nesithombe sayo, ngoba ubuchopho bengane bukhumbula izithombe kangcono kakhulu kunamagama.",
      },
      {
        kicker: "Imodi Yezingane",
        title: "Izincazelo ezisezingeni leso lengane yakho",
        body: "Ukushintsha kanye, bese yonke incazelo iguquka ibe ulimi ingane eneminyaka engu-8 eluqonda ngempela. Akukho magama anzima achaza amagama anzima, akukho zincazelo eziphindelelayo. Ukuqonda kuphela.",
      },
      {
        kicker: "Umongo",
        title: "Namathisela umusho, uthole incazelo efanele",
        body: "Amagama amaningi anencazelo engaphezu kweyodwa, futhi yilapho izingane zilahleka khona. Namathisela umusho ovela encwadini noma ephepheni lomsebenzi, bese Gadit imaka ngqo ukuthi iyiphi incazelo efanele.",
      },
      {
        kicker: "Incwadana siqu",
        title: "Amagama awabaleki",
        body: "Igama ngalinye ingane yakho eliphenyayo lihlala encwadaneni yayo siqu, futhi ukuzilolonga okufushane okuhlakaniphile likubuyisa ngaphambi nje kokuba libaleke. Yileyo ndlela ulwazi lwamagama olwakhiwa ngayo ngempela, igama ngalinye ngesikhathi.",
      },
      {
        kicker: "Iphrofayela yengane ngayinye",
        title: "Ingane ngayinye ithola indawo yayo",
        body: "Ingane ngayinye emndenini ithola iphrofayela ehlukile: incwadana yayo, ukuzilolonga kwayo, umlando wayo. Imodi Yezingane ilungisa incazelo, ilula futhi icacile kwabancane futhi iphelele kubadala, futhi akekho ogxoba amagama omunye.",
      },
      {
        kicker: "Imidlalo yamagama",
        title: "Imidlalo yokufunda ngamagama engane yakho",
        body: "Imibuzo emifushane nemidlalo eyakhiwe ngamagama ingane yakho eziphenyele wona ngempela. Imizuzu embalwa yokudlala, bese ulwazi lwamagama lukhula ngaphandle komzamo.",
      },
      {
        kicker: "Ulimi lwesibili",
        title: "Umsizi womsebenzi wesikole ongcono kakhulu wolimi lwesibili",
        body: "Ingane yakho ithayipha igama ngesiNgisi bese ithola incazelo elula ngolimi lwayo, nesithombe nezibonelo. Akukho ukuzulazula phakathi kwesichazamazwi, umhumushi ne-YouTube.",
      },
    ],
    midCtaTitle: "Qala manje, bese ubuka ulwazi lwamagama lwengane yakho lukhula usuku nosuku",
    midCta: "Qala isikhathi sakho samahhala sezinsuku ezingu-14",
    compareKicker: "Umehluko",
    compareTitle: "Kungani ungangeni nje ku-Google noma ubuze i-chatbot?",
    compareGadit: "Gadit",
    compareOther: "I-inthanethi evulekile",
    compareRows: [
      { label: "Ikhasi elilodwa elihlanzekile igama ngalinye", gadit: true, other: false },
      { label: "Izincazelo ezisezingeni lengane", gadit: true, other: false },
      { label: "Isithombe sencazelo ngayinye", gadit: true, other: false },
      { label: "Incwadana nokuzilolonga okunamathelayo", gadit: true, other: false },
      { label: "Izikhangiso nezixhumanisi kuzo zonke izindawo", gadit: false, other: true },
      { label: "Ingxoxo evulekile engenamikhawulo", gadit: false, other: true },
    ],
    safeTitle: "Indawo ehlukile, ehlanzekile. Hhayi umnyango oya kwenye indawo.",
    safeBody: "Gadit yindawo evaleke ngokugcwele: akukho ingxoxo evulekile, akukho ifidi, akukho zikhangiso, akukho zixhumanisi eziphumela ngaphandle. Ingane ayidonswa lapha iyiswe ku-TikTok noma kunoma yiluphi olunye uhlelo lokusebenza. Kunento eyodwa okumele yenziwe lapha: ukuqonda igama, ubuyele ekufundeni.",
    safeLine: "Isikrini esisodwa ongasinika ingane ngengqondo ekhululekile.",
    stackTitle: "Okuhlanganiswe uhlelo lomndeni",
    stackItems: [
      "Ukusesha okungenamkhawulo komndeni wonke",
      "Yonke incazelo, nesithombe sencazelo ngayinye",
      "Imodi Yezingane yayo yonke iminyaka",
      "Ukuhlola umusho ngempendulo esheshayo",
      "Incwadana siqu nokuzilolonga okuhlakaniphile kwengane ngayinye",
      "Imidlalo yamagama nemibuzo",
      "Kuze kube izingane ezi-5 ezinamaphrofayela ahlukene",
      "Izilimi ezingu-21 ngokusekelwa okugcwele",
    ],
    priceKicker: "Amanani",
    priceTitle: "Uhlelo lomndeni",
    trialBadge: "Isikhathi samahhala sezinsuku ezingu-14",
    yearly: "$59 / unyaka",
    yearlyNote: "lokho kungu-$4.92 ngenyanga komndeni wonke, futhi kukonga cishe izinyanga ezimbili uma kuqhathaniswa nokukhokha nyanga zonke",
    priceAnchor: "Kungaphansi kweseshini eyodwa yokufundisa okuyimfihlo, unyaka wonke, wengane ngayinye ekhaya",
    monthly: "$5.99 / inyanga",
    billedYearly: "Nyaka zonke",
    billedMonthly: "Nyanga zonke",
    yearlySave: "-18%",
    priceCta: "Qala isikhathi sokulinga",
    cancelNote: "Ukukhokhiswa kokuqala kwenzeka kuphela ngemva kwezinsuku ezingu-14. Khansela noma nini ekhasini lakho le-akhawunti, ngokuchofoza kanye.",
    singleChild: "Umfundi oyedwa kuphela ekhaya? I-Deep ingu-$4.99/inyanga. Ngokweqa okuncane ungangeza kuze kube izingane ezi-5.",
    guaranteeTitle: "Ukuhlolwa kwakho: amaviki amabili",
    guaranteeBody: "Inike amaviki amabili okusetshenziswa kwangempela, mahhala. Uma ngosuku lwe-14 incwadana yengane yakho ingakabuthi okungenani amagama amasha angu-20, khansela ngokuchofoza kanye futhi awukhokhanga lutho.",
    faqTitle: "Imibuzo abazali abayibuzayo",
    faq: [
      {
        q: "Ngithola ini nge-Gadit?",
        a: "Igama ngalinye ingane yakho eliphenyayo lithola ikhasi elilodwa elihlanzekile: yonke incazelo, incazelo esezingeni lengane (Imodi Yezingane), izibonelo ezintathu zangempela, nesithombe sencazelo ngayinye. Ngaphezu kwalokho umongo (namathisela umusho uthole incazelo efanele), incwadana yamagama siqu enokuzilolonga okuhlakaniphile, imidlalo yamagama nemibuzo, ideshibhodi lomzali elikhombisa ukuthi ingane ngayinye ifunde kangakanani, kuze kube izingane ezi-5 kumaphrofayela ahlukene, konke ngezilimi ezingu-21, endaweni evaliwe, ephephile engenayo ingxoxo evulekile nezikhangiso.",
      },
      {
        q: "Kungani ungabuzi nje i-chatbot noma u-Google?",
        a: "Ngoba lawo ngamathuluzi abantu abadala. U-Google ubuyisela izikhangiso nezixhumanisi kuzo zonke izindawo, futhi i-chatbot evulekile iyingxoxo engenamkhawulo umzali angeke ashiye ingane yodwa kuyo. Gadit yakhiwe ngendlela ephambene: ikhasi elilodwa elivaliwe, elihlanzekile igama ngalinye, esezingeni lengane, ngaphandle kwendlela yokulahleka.",
      },
      {
        q: "Ngazi kanjani ukuthi ingane yami iyathuthuka ngempela?",
        a: "Uthola ideshibhodi lomzali. Ngokushesha ubona ukuthi ingane ngayinye ifunde amagama amangaki, mangaki angeziwe kuleli sonto, namagama ayo akamuva. Wonke amanye amathuluzi ayayiphendula ingane bese ayakhohlwa; Gadit igcina igama ngalinye encwadaneni siqu yengane, ngakho ubuka ulwazi lwamagama lukhula isonto emva kwesonto.",
      },
      {
        q: "Yiziphi iminyaka okuyiyona?",
        a: "Inhliziyo ye-Gadit izingane ezisesikoleni, kusukela ebangeni lokuqala kuya esikoleni samabanga aphezulu. Imodi Yezingane ichaza kalula kwabancane, futhi izincazelo eziphelele zisiza intsha nabazali futhi. Umzali uvula i-akhawunti.",
      },
      {
        q: "Ingasiza yini ngesiNgisi nezinye izilimi?",
        a: "Kakhulu impela. Ingane ingaphenya igama ngesiNgisi bese ithola incazelo elula ngolimi lwayo, nesithombe nezibonelo, umsizi kanye oshoda ekhaya. Futhi isebenza ngezilimi ezingu-21, ngakho ingane ingathola incazelo nangolimi olukhuluma ngalo ekhaya.",
      },
      {
        q: "Kubiza malini?",
        a: "$59 ngonyaka noma $5.99 ngenyanga, ngemva kwesikhathi sokulinga sezinsuku ezingu-14. Akukho zimali ezifihliwe, futhi ukhansela noma nini ngokuchofoza kanye.",
      },
      {
        q: "Zingaki izingane engingazingeza?",
        a: "Kuze kube izingane ezi-5 ohlelweni olulodwa lomndeni, ngayinye inephrofayela yayo, incwadana nokuzilolonga.",
      },
      {
        q: "Singakuzama ngaphandle kokuzibophezela?",
        a: "Yebo. Isikhathi sokulinga siqala ngekhadi, kodwa ukukhokhiswa kokuqala kwenzeka kuphela uma sekuphela izinsuku ezingu-14. Khansela noma nini ngaphambi kwalokho, ngokuchofoza kanye, futhi awukhokhi lutho.",
      },
    ],
    finalTitle: "Qala namuhla, bese ubuka ulwazi lwamagama lukhula",
    finalSub: "Amaviki amabili mahhala. Ukukhansela ngokuchofoza kanye. Nengane efunda ukuqonda amagama yodwa.",
    finalCta: "Qala isikhathi sakho samahhala sezinsuku ezingu-14",
    footerTerms: "Imigomo",
    footerPrivacy: "Ubumfihlo",
  },
  el: {
    heroBadge: "Ένα οπτικό, έξυπνο λεξικό για όλη την οικογένεια",
    whatIs: "Το Gadit είναι ένα έξυπνο, οπτικό λεξικό για παιδιά: κάθε λέξη παίρνει μια εξήγηση στο επίπεδο του παιδιού, μια εικόνα, παραδείγματα, καθώς και παιχνίδια και κουίζ που κάνουν την εκμάθηση λέξεων διασκεδαστική. Το λεξιλόγιο μεγαλώνει, η κατανόηση κειμένου βελτιώνεται και το παιδί σου τα πάει καλύτερα στο σχολείο.",
    ctaMicro: "",
    trustLine: "Έως 5 παιδιά, το καθένα στο δικό του επίπεδο",
    credLine: "Χτισμένο πάνω σε 15 χρόνια εμπειρίας με περισσότερους από 15.000 γονείς, μαθητές και εκπαιδευτικούς",
    credKicker: "Ποιοι είμαστε",
    credTitle: "15 χρόνια στην εκπαίδευση. Τώρα σε ένα εργαλείο για το παιδί σου.",
    credBody: "Το Gadit φτιάχτηκε από μια ομάδα με 15 χρόνια εμπειρίας στην εκπαίδευση, που έχει δουλέψει με περισσότερους από 15.000 γονείς, μαθητές και εκπαιδευτικούς. Ό,τι είδαμε να δουλεύει ξανά και ξανά, στην τάξη και στο σπίτι, το βάλαμε σε ένα απλό εργαλείο που ένα παιδί μπορεί να χρησιμοποιήσει μόνο του.",
    proofTitle: "Τετράδιο λέξεων · παράδειγμα",
    proofBig: "12 νέες λέξεις αυτή την εβδομάδα",
    proofWords: ["όνειρο", "ζωντανός", "διστακτικός"],
    angles: {
      vocab: {
        h1: "Το λεξιλόγιο του παιδιού σου μεγαλώνει. Λέξη προς λέξη.",
        sub: "Κάθε λέξη για την οποία ρωτάει το παιδί σου καταλήγει στο προσωπικό του τετράδιο λέξεων στο Gadit: με μια εικόνα, μια εξήγηση στο επίπεδό του και μια σύντομη εξάσκηση που την επαναφέρει μέχρι να γίνει δική του. Άνοιξε το τετράδιο στο τέλος του μήνα και δες το λεξιλόγιο να μεγαλώνει, λέξη προς λέξη.",
      },
      relief: {
        h1: "Σταμάτα να είσαι το λεξικό της οικογένειας",
        sub: "Από σήμερα, όταν το παιδί σου ρωτάει \"τι σημαίνει αυτό;\", έχει ένα μέρος για να βρει μόνο του την απάντηση: κάθε σημασία, μια εικόνα για την καθεμία και μια εξήγηση στο επίπεδο του παιδιού. Χωρίς ανοιχτή συνομιλία, χωρίς διαφημίσεις.",
      },
      anxiety: {
        h1: "Το παιδί σου διαβάζει σωστά κάθε λέξη, αλλά δεν καταλαβαίνει πραγματικά",
        sub: "Δεν σταματά πάντα για να ρωτήσει. Προσπερνά μια λέξη που δεν καταλαβαίνει, συνεχίζει, και το υλικό δεν εμπεδώνεται. Με τον καιρό αυτό γίνεται απογοήτευση με το σχολείο και ένα αίσθημα \"δεν τα καταφέρνω\". Το Gadit δίνει στο παιδί σου ένα μέρος για να σταματήσει, να καταλάβει πραγματικά και να επιστρέψει στο μάθημα έχοντας τη λέξη στο χέρι.",
      },
      safe: {
        h1: "Η μία οθόνη που μπορείς να δώσεις σε ένα παιδί χωρίς ανησυχία",
        sub: "Χωρίς ανοιχτή συνομιλία. Χωρίς ατέλειωτο feed. Χωρίς διαφημίσεις. Ένα καθαρό μέρος όπου το παιδί πληκτρολογεί μια λέξη, την καταλαβαίνει πλήρως και επιστρέφει στα μαθήματα.",
      },
    },
    heroCta: "Ξεκίνα τη δωρεάν δοκιμή 14 ημερών",
    heroTrust: "Χωρίς ανοιχτή συνομιλία · Χωρίς διαφημίσεις · Ακύρωση με ένα κλικ",
    ownerCta: "Πήγαινε στον οικογενειακό σου χώρο",
    stats: ["30+ γλώσσες", "Μια εικόνα ανά σημασία", "Έως 5 παιδιά", "Ακύρωση με ένα κλικ"],
    demoKicker: "Το αποτέλεσμα",
    demoTitle: "Το παιδί σου καταλαβαίνει κάθε λέξη και το λεξιλόγιό του μεγαλώνει κάθε μέρα",
    painKicker: "Ο πραγματικός πόνος",
    painTitle: "Το παιδί σου διαβάζει, αλλά δεν καταλαβαίνει πάντα πραγματικά",
    painBody1: "Στην πραγματικότητα χαίρεσαι όταν το παιδί σου σταματά για να ρωτήσει τι σημαίνει μια λέξη. Το πρόβλημα είναι όλες οι λέξεις για τις οποίες δεν σταματά να ρωτήσει. Τις προσπερνά, συνεχίζει να διαβάζει και το υλικό δεν εμπεδώνεται. Το λεξιλόγιο μένει φτωχό και η κατανόηση σπάει λέξη με λέξη.",
    painBody2: "Και αυτό αγγίζει πολύ περισσότερα από έναν βαθμό. Ένα παιδί που δεν καταλαβαίνει νιώθει ανεπαρκές, απογοητεύεται με το σχολείο και χάνει την αυτοπεποίθησή του. Και συμβαίνει σιωπηλά, χωρίς κανείς να μπορεί να δείξει πού έσπασε το νήμα.",
    reframe: "Και εδώ ακριβώς μπαίνει το Gadit.",
    puzzleKicker: "Τι συμβαίνει στο μυαλό ενός παιδιού",
    puzzleTitle: "Το κείμενο είναι ένα παζλ. Κάθε λέξη είναι ένα κομμάτι.",
    puzzleBody: "Όταν ένα παιδί διαβάζει, το μυαλό του συναρμολογεί μια ολόκληρη εικόνα από τις λέξεις. Κάθε λέξη που καταλαβαίνει είναι ένα κομμάτι που μπαίνει στη θέση του. Κάθε λέξη που λείπει είναι μια τρύπα στην εικόνα. Μόνο τρεις ή τέσσερις τρύπες, και το παιδί δεν βλέπει πια την εικόνα, ακόμη κι αν πρόφερε κάθε γράμμα.",
    puzzleBefore: "Μια παράγραφος με λέξεις που λείπουν",
    puzzleAfter: "Με το Gadit, κάθε κομμάτι στη θέση του",
    puzzleLine: "Όταν κάθε λέξη είναι ξεκάθαρη, το παιδί βλέπει ολόκληρη την εικόνα.",
    chainKicker: "Πώς λειτουργεί",
    chainTitle: "Όλα όσα παίρνει το παιδί σου, σε κάθε λέξη",
    chainSteps: [
      "Το παιδί σου πληκτρολογεί μια λέξη που δεν καταλαβαίνει",
      "Παίρνει μια εξήγηση στο επίπεδό του, μια εικόνα και τρία παραδείγματα",
      "Η λέξη αποθηκεύεται στο προσωπικό του τετράδιο",
      "Και επιστρέφει σε σύντομη εξάσκηση, μέχρι να γίνει πραγματικά δική του",
    ],
    howBlocks: [
      { t: "Πληκτρολόγησε τη λέξη", b: "Το παιδί σου πληκτρολογεί οποιαδήποτε λέξη δεν καταλαβαίνει, σε Παιδική Λειτουργία, σε ένα καθαρό και ασφαλές μέρος." },
      { t: "Ένας ξεκάθαρος ορισμός", b: "Μια εξήγηση στο επίπεδο του παιδιού, χωρίς δύσκολες λέξεις που εξηγούν δύσκολες λέξεις." },
      { t: "Τρία παραδείγματα", b: "Πραγματικές προτάσεις που δείχνουν πώς ζει η λέξη μέσα σε ένα κείμενο, όχι απλώς ένας στεγνός ορισμός." },
      { t: "Μια εικόνα για κάθε σημασία", b: "Επειδή τα παιδιά θυμούνται αυτά που βλέπουν πολύ καλύτερα από αυτά που τους γράφονται." },
      { t: "Πλαίσιο", b: "Επικόλλησε μια πρόταση από το βιβλίο και το Gadit επισημαίνει ακριβώς τη σημασία που ταιριάζει." },
      { t: "Ένα προσωπικό τετράδιο", b: "Κάθε λέξη που έψαξε το παιδί σου αποθηκεύεται στο τετράδιό του και δεν χάνεται." },
      { t: "Ένα σύντομο κουίζ", b: "Μια γρήγορη ερώτηση που επαναφέρει τη λέξη λίγο πριν ξεχαστεί." },
      { t: "Ένα παιχνίδι", b: "Μάθηση μέσα από το παιχνίδι, πάνω στις λέξεις που έψαξε το ίδιο το παιδί σου." },
    ],
    chainCost: "",
    chainTurnTitle: "Και αυτό είναι που παίρνεις",
    chainTurnBody: "Κάθε λέξη στην οποία κόλλησε το παιδί σου γίνεται μια λέξη που ξέρει, και το βλέπεις μαύρο επάνω σε άσπρο: πόσες λέξεις έκλεισε, εβδομάδα με εβδομάδα. Αντί να ελπίζεις ότι κάτι βελτιώνεται, απλώς το βλέπεις να συμβαίνει.",
    dashKicker: "Ο πίνακας των γονιών",
    dashTitle: "Βλέπεις ακριβώς πόσα έχει μάθει κάθε παιδί",
    dashBody: "Κάθε παιδί έχει ένα προσωπικό τετράδιο λέξεων που μεγαλώνει. Στον πίνακά σου βλέπεις, με μια ματιά, πόσες λέξεις έχει μάθει κάθε παιδί, πόσες προστέθηκαν αυτή την εβδομάδα και τις πιο πρόσφατες λέξεις του. Κάθε άλλο εργαλείο απαντά στο παιδί σου και ξεχνά. Το Gadit θυμάται, και εσύ βλέπεις την πρόοδο εβδομάδα με εβδομάδα.",
    dashKids: [
      { name: "Νόα", total: 47, week: 12 },
      { name: "Ίντο", total: 31, week: 8 },
      { name: "Μάγια", total: 63, week: 15 },
    ],
    dashWordsLabel: "λέξεις στο τετράδιο",
    dashWeekLabel: "αυτή την εβδομάδα",
    featuresKicker: "Τι υπάρχει μέσα",
    features: [
      {
        kicker: "Κάθε σημασία",
        title: "Μία λέξη. Κάθε σημασία. Μια εικόνα για την καθεμία.",
        body: "Μια λέξη έχει συχνά αρκετές διαφορετικές σημασίες, και εκεί μπερδεύονται τα παιδιά. Το Gadit τις δείχνει όλες σε ένα μέρος, την καθεμία με τρία πραγματικά παραδείγματα και τη δική της εικόνα, επειδή ο εγκέφαλος ενός παιδιού θυμάται τις εικόνες πολύ καλύτερα από τις λέξεις.",
      },
      {
        kicker: "Παιδική Λειτουργία",
        title: "Εξηγήσεις στο επίπεδο του παιδιού σου",
        body: "Ένας διακόπτης, και κάθε εξήγηση μετατρέπεται σε γλώσσα που ένα παιδί 8 ετών πραγματικά καταλαβαίνει. Χωρίς δύσκολες λέξεις που εξηγούν δύσκολες λέξεις, χωρίς κυκλικούς ορισμούς. Μόνο κατανόηση.",
      },
      {
        kicker: "Πλαίσιο",
        title: "Επικόλλησε μια πρόταση, πάρε τη σωστή σημασία",
        body: "Οι περισσότερες λέξεις έχουν πάνω από μία σημασία, και εκεί χάνονται τα παιδιά. Επικόλλησε την πρόταση από το βιβλίο ή το φύλλο εργασίας, και το Gadit επισημαίνει ακριβώς ποια σημασία ταιριάζει.",
      },
      {
        kicker: "Προσωπικό τετράδιο",
        title: "Οι λέξεις δεν χάνονται",
        body: "Κάθε λέξη που ψάχνει το παιδί σου καταλήγει στο προσωπικό του τετράδιο, και μια σύντομη έξυπνη εξάσκηση την επαναφέρει λίγο πριν ξεφύγει. Έτσι χτίζεται πραγματικά το λεξιλόγιο, μία λέξη κάθε φορά.",
      },
      {
        kicker: "Ένα προφίλ ανά παιδί",
        title: "Κάθε παιδί παίρνει τον δικό του χώρο",
        body: "Κάθε παιδί στην οικογένεια παίρνει ξεχωριστό προφίλ: το τετράδιό του, την εξάσκησή του, το ιστορικό του. Η Παιδική Λειτουργία προσαρμόζει την εξήγηση, απλή και ξεκάθαρη για τα μικρά και πιο πλήρη για τα μεγαλύτερα, και κανείς δεν πατάει τις λέξεις κανενός.",
      },
      {
        kicker: "Παιχνίδια λέξεων",
        title: "Εκπαιδευτικά παιχνίδια πάνω στις λέξεις του παιδιού σου",
        body: "Σύντομα κουίζ και παιχνίδια φτιαγμένα από τις λέξεις που πραγματικά έψαξε το παιδί σου. Λίγα λεπτά παιχνιδιού, και το λεξιλόγιο μεγαλώνει χωρίς κόπο.",
      },
      {
        kicker: "Δεύτερη γλώσσα",
        title: "Ο καλύτερος βοηθός εργασιών για μια δεύτερη γλώσσα",
        body: "Το παιδί σου πληκτρολογεί μια λέξη στα αγγλικά και παίρνει μια απλή εξήγηση στη δική του γλώσσα, με εικόνα και παραδείγματα. Χωρίς περιπλάνηση ανάμεσα σε λεξικό, μεταφραστή και YouTube.",
      },
    ],
    midCtaTitle: "Ξεκίνα τώρα, και δες το λεξιλόγιο του παιδιού σου να μεγαλώνει μέρα με τη μέρα",
    midCta: "Ξεκίνα τη δωρεάν δοκιμή 14 ημερών",
    compareKicker: "Η διαφορά",
    compareTitle: "Γιατί όχι απλώς μια αναζήτηση στο Google ή ένα chatbot;",
    compareGadit: "Gadit",
    compareOther: "Το ανοιχτό διαδίκτυο",
    compareRows: [
      { label: "Μία καθαρή σελίδα ανά λέξη", gadit: true, other: false },
      { label: "Εξηγήσεις στο επίπεδο του παιδιού", gadit: true, other: false },
      { label: "Μια εικόνα για κάθε σημασία", gadit: true, other: false },
      { label: "Ένα τετράδιο και εξάσκηση που μένουν", gadit: true, other: false },
      { label: "Διαφημίσεις και σύνδεσμοι προς κάθε κατεύθυνση", gadit: false, other: true },
      { label: "Ανοιχτή συνομιλία χωρίς όρια", gadit: false, other: true },
    ],
    safeTitle: "Μια ξεχωριστή, καθαρή ζώνη. Όχι μια πόρτα προς οπουδήποτε αλλού.",
    safeBody: "Το Gadit είναι ένας εντελώς κλειστός χώρος: χωρίς ανοιχτή συνομιλία, χωρίς feed, χωρίς διαφημίσεις, χωρίς εξωτερικούς συνδέσμους. Ένα παιδί δεν παρασύρεται από εδώ στο TikTok ή σε οποιαδήποτε άλλη εφαρμογή. Υπάρχει ένα πράγμα να κάνεις εδώ: να καταλάβεις μια λέξη και να επιστρέψεις στα μαθήματα.",
    safeLine: "Μία οθόνη που μπορείς να δώσεις σε ένα παιδί με ήσυχο το μυαλό σου.",
    stackTitle: "Τι περιλαμβάνει το οικογενειακό πλάνο",
    stackItems: [
      "Απεριόριστες αναζητήσεις για όλη την οικογένεια",
      "Κάθε σημασία, με μια εικόνα για την καθεμία",
      "Παιδική Λειτουργία για κάθε ηλικία",
      "Έλεγχος πρότασης με άμεση ανατροφοδότηση",
      "Ένα προσωπικό τετράδιο και έξυπνη εξάσκηση ανά παιδί",
      "Παιχνίδια λέξεων και κουίζ",
      "Έως 5 παιδιά με ξεχωριστά προφίλ",
      "30+ γλώσσες με πλήρη υποστήριξη",
    ],
    priceKicker: "Τιμές",
    priceTitle: "Το οικογενειακό πλάνο",
    trialBadge: "Δωρεάν δοκιμή 14 ημερών",
    yearly: "$59 / έτος",
    yearlyNote: "δηλαδή $4.92 τον μήνα για όλη την οικογένεια, και σε γλιτώνει σχεδόν δύο μήνες σε σχέση με τη μηνιαία πληρωμή",
    priceAnchor: "Λιγότερο από μία ιδιωτική διδασκαλία, για έναν ολόκληρο χρόνο, για κάθε παιδί στο σπίτι",
    monthly: "$5.99 / μήνα",
    billedYearly: "Ετήσια",
    billedMonthly: "Μηνιαία",
    yearlySave: "-18%",
    priceCta: "Ξεκίνα τη δοκιμή",
    cancelNote: "Η πρώτη χρέωση μόνο μετά τις 14 ημέρες. Ακύρωσε όποτε θες από τη σελίδα του λογαριασμού σου, με ένα κλικ.",
    singleChild: "Μόνο ένας μαθητής στο σπίτι; Το Deep είναι $4.99/μήνα. Για λίγο παραπάνω μπορείς να προσθέσεις έως 5 παιδιά.",
    guaranteeTitle: "Η δοκιμή σου: δύο εβδομάδες",
    guaranteeBody: "Δώσ' του δύο εβδομάδες πραγματικής χρήσης, δωρεάν. Αν μέχρι την 14η ημέρα το τετράδιο του παιδιού σου δεν έχει μαζέψει τουλάχιστον 20 νέες λέξεις, ακύρωσε με ένα κλικ και δεν πλήρωσες τίποτα.",
    faqTitle: "Ερωτήσεις που κάνουν οι γονείς",
    faq: [
      {
        q: "Τι παίρνω με το Gadit;",
        a: "Κάθε λέξη που ψάχνει το παιδί σου παίρνει μία καθαρή σελίδα: κάθε σημασία, μια εξήγηση στο επίπεδο του παιδιού (Παιδική Λειτουργία), τρία πραγματικά παραδείγματα και μια εικόνα ανά σημασία. Επιπλέον πλαίσιο (επικόλλησε μια πρόταση και πάρε τη σωστή σημασία), ένα προσωπικό τετράδιο λέξεων με έξυπνη εξάσκηση, παιχνίδια λέξεων και κουίζ, έναν πίνακα γονιών που δείχνει πόσα έχει μάθει κάθε παιδί, έως 5 παιδιά σε ξεχωριστά προφίλ, όλα σε 30+ γλώσσες, σε έναν κλειστό, ασφαλή χώρο χωρίς ανοιχτή συνομιλία και χωρίς διαφημίσεις.",
      },
      {
        q: "Γιατί όχι απλώς ένα chatbot ή το Google;",
        a: "Επειδή αυτά είναι εργαλεία για ενήλικες. Το Google επιστρέφει διαφημίσεις και συνδέσμους προς κάθε κατεύθυνση, και ένα ανοιχτό chatbot είναι μια συνομιλία χωρίς όρια στην οποία κανένας γονιός δεν αφήνει μόνο του ένα παιδί. Το Gadit είναι φτιαγμένο ανάποδα: μία κλειστή, καθαρή σελίδα ανά λέξη, στο επίπεδο του παιδιού, χωρίς τρόπο να χαθείς.",
      },
      {
        q: "Πώς ξέρω ότι το παιδί μου προοδεύει πραγματικά;",
        a: "Παίρνεις έναν πίνακα γονιών. Με μια ματιά βλέπεις πόσες λέξεις έχει μάθει κάθε παιδί, πόσες προστέθηκαν αυτή την εβδομάδα και τις πιο πρόσφατες λέξεις του. Κάθε άλλο εργαλείο απαντά στο παιδί και ξεχνά· το Gadit αποθηκεύει κάθε λέξη στο προσωπικό τετράδιο του παιδιού, ώστε να βλέπεις το λεξιλόγιο να μεγαλώνει εβδομάδα με εβδομάδα.",
      },
      {
        q: "Για ποιες ηλικίες είναι;",
        a: "Η καρδιά του Gadit είναι τα παιδιά σχολικής ηλικίας, από την πρώτη δημοτικού μέχρι το λύκειο. Η Παιδική Λειτουργία εξηγεί απλά για τα μικρά, και οι πλήρεις εξηγήσεις εξυπηρετούν και τους εφήβους και τους γονείς. Ο γονιός ανοίγει τον λογαριασμό.",
      },
      {
        q: "Βοηθάει με τα αγγλικά και άλλες γλώσσες;",
        a: "Πάρα πολύ. Ένα παιδί μπορεί να ψάξει μια λέξη στα αγγλικά και να πάρει μια απλή εξήγηση στη δική του γλώσσα, με εικόνα και παραδείγματα, ακριβώς ο βοηθός που λείπει στο σπίτι. Και λειτουργεί σε 30+ γλώσσες, οπότε το παιδί μπορεί να πάρει την εξήγηση και στη γλώσσα που μιλάτε στο σπίτι.",
      },
      {
        q: "Πόσο κοστίζει;",
        a: "$59 τον χρόνο ή $5.99 τον μήνα, μετά τη δοκιμή των 14 ημερών. Χωρίς κρυφές χρεώσεις, και ακυρώνεις όποτε θες με ένα κλικ.",
      },
      {
        q: "Πόσα παιδιά μπορώ να προσθέσω;",
        a: "Έως 5 παιδιά σε ένα οικογενειακό πλάνο, το καθένα με το δικό του προφίλ, τετράδιο και εξάσκηση.",
      },
      {
        q: "Μπορούμε να το δοκιμάσουμε χωρίς δέσμευση;",
        a: "Ναι. Η δοκιμή ξεκινά με μια κάρτα, αλλά η πρώτη χρέωση γίνεται μόνο όταν τελειώσουν οι 14 ημέρες. Ακύρωσε όποτε θες πριν από αυτό, με ένα κλικ, και δεν πληρώνεις τίποτα.",
      },
    ],
    finalTitle: "Ξεκίνα σήμερα, και δες το λεξιλόγιο να μεγαλώνει",
    finalSub: "Δύο εβδομάδες δωρεάν. Ακύρωση με ένα κλικ. Και ένα παιδί που μαθαίνει να καταλαβαίνει τις λέξεις μόνο του.",
    finalCta: "Ξεκίνα τη δωρεάν δοκιμή 14 ημερών",
    footerTerms: "Όροι",
    footerPrivacy: "Απόρρητο",
  },
  nl: {
    heroBadge: "Een visueel, slim woordenboek voor het hele gezin",
    whatIs: "Gadit is een slim, visueel woordenboek voor kinderen: elk woord krijgt uitleg op kinderniveau, een afbeelding, voorbeelden en spelletjes en quizzen die woorden leren leuk maken. De woordenschat groeit, het begrijpend lezen verbetert en je kind presteert beter op school.",
    ctaMicro: "",
    trustLine: "Tot 5 kinderen, elk op hun eigen niveau",
    credLine: "Gebouwd op 15 jaar ervaring met meer dan 15.000 ouders, leerlingen en docenten",
    credKicker: "Wie we zijn",
    credTitle: "15 jaar in het onderwijs. Nu in één tool voor je kind.",
    credBody: "Gadit is gebouwd door een team met 15 jaar ervaring in het onderwijs, dat met meer dan 15.000 ouders, leerlingen en docenten heeft gewerkt. Wat we keer op keer zagen werken, in de klas en thuis, hebben we in één eenvoudige tool gestopt die een kind zelfstandig kan gebruiken.",
    proofTitle: "Woordenschrift · voorbeeld",
    proofBig: "12 nieuwe woorden deze week",
    proofWords: ["droom", "levendig", "aarzelend"],
    angles: {
      vocab: {
        h1: "De woordenschat van je kind groeit. Woord voor woord.",
        sub: "Elk woord waar je kind naar vraagt, belandt in zijn persoonlijke woordenschrift in Gadit: met een afbeelding, uitleg op kinderniveau en korte oefeningen die het woord terugbrengen tot het echt van hem is. Open het schrift aan het eind van de maand en zie de woordenschat groeien, woord voor woord.",
      },
      relief: {
        h1: "Stop met het gezinswoordenboek zijn",
        sub: "Vanaf vandaag heeft je kind, wanneer het vraagt „wat betekent dit?”, één plek om het antwoord zelf te vinden: elke betekenis, een afbeelding bij elk, en uitleg op kinderniveau. Geen open chat, geen advertenties.",
      },
      anxiety: {
        h1: "Je kind leest elk woord goed, maar begrijpt het niet echt",
        sub: "Ze stoppen niet altijd om iets te vragen. Ze slaan een woord over dat ze niet begrijpen, lezen door, en de stof beklijft niet. Na verloop van tijd wordt het frustratie met school en een gevoel van „dit kan ik niet”. Gadit geeft je kind één plek om even stil te staan, het écht te begrijpen en met het woord in de hand terug te keren naar de les.",
      },
      safe: {
        h1: "Het ene scherm dat je een kind zonder zorgen kunt geven",
        sub: "Geen open chat. Geen eindeloze feed. Geen advertenties. Eén overzichtelijke plek waar een kind een woord typt, het volledig begrijpt en teruggaat naar het huiswerk.",
      },
    },
    heroCta: "Start je gratis proefperiode van 14 dagen",
    heroTrust: "Geen open chat · Geen advertenties · Opzeggen met één klik",
    ownerCta: "Ga naar je gezinsruimte",
    stats: ["30+ talen", "Een afbeelding per betekenis", "Tot 5 kinderen", "Opzeggen met één klik"],
    demoKicker: "Het resultaat",
    demoTitle: "Je kind begrijpt elk woord, en zijn woordenschat groeit met de dag",
    painKicker: "De echte pijn",
    painTitle: "Je kind leest, maar begrijpt niet altijd echt",
    painBody1: "Je bent eigenlijk blij wanneer je kind stopt om te vragen wat een woord betekent. Het probleem zijn alle woorden waar het niet voor stopt. Die slaat het over, het leest door, en de stof beklijft niet. De woordenschat blijft dun, en het begrip breekt woord na woord.",
    painBody2: "En het raakt veel meer dan een cijfer. Een kind dat het niet begrijpt, voelt zich niet goed genoeg, raakt gefrustreerd met school en verliest zijn zelfvertrouwen. En het gebeurt in stilte, zonder dat iemand kan aanwijzen waar de draad brak.",
    reframe: "En precies hier komt Gadit om de hoek kijken.",
    puzzleKicker: "Wat er in het hoofd van een kind gebeurt",
    puzzleTitle: "Tekst is een puzzel. Elk woord is een stukje.",
    puzzleBody: "Wanneer een kind leest, stelt zijn geest een compleet beeld samen uit de woorden. Elk woord dat het begrijpt, is een stukje dat op zijn plaats klikt. Elk ontbrekend woord is een gat in het beeld. Slechts drie of vier gaten, en het kind ziet het beeld niet meer, zelfs al las het elke letter hardop.",
    puzzleBefore: "Een alinea met ontbrekende woorden",
    puzzleAfter: "Met Gadit, elk stukje op zijn plaats",
    puzzleLine: "Wanneer elk woord duidelijk is, ziet het kind het hele beeld.",
    chainKicker: "Hoe het werkt",
    chainTitle: "Alles wat je kind krijgt, bij elk woord",
    chainSteps: [
      "Je kind typt een woord dat het niet begrijpt",
      "Het krijgt uitleg op ooghoogte, een afbeelding en drie voorbeelden",
      "Het woord wordt opgeslagen in zijn persoonlijke schrift",
      "En komt terug in korte oefeningen, tot het echt van hem is",
    ],
    howBlocks: [
      { t: "Typ het woord", b: "Je kind typt elk woord dat het niet begrijpt, in de Kindermodus, in een overzichtelijke en veilige omgeving." },
      { t: "Een duidelijke definitie", b: "Uitleg op ooghoogte van het kind, geen moeilijke woorden die moeilijke woorden uitleggen." },
      { t: "Drie voorbeelden", b: "Echte zinnen die laten zien hoe het woord binnen een tekst leeft, niet zomaar een droge definitie." },
      { t: "Een afbeelding bij elke betekenis", b: "Omdat kinderen wat ze zien veel beter onthouden dan wat er voor hen wordt opgeschreven." },
      { t: "Context", b: "Plak een zin uit het boek en Gadit markeert precies de betekenis die erbij past." },
      { t: "Een persoonlijk schrift", b: "Elk woord dat je kind heeft opgezocht, wordt opgeslagen in zijn schrift, en loopt niet weg." },
      { t: "Een korte quiz", b: "Een snelle vraag die het woord terugbrengt vlak voordat het wegglipt." },
      { t: "Een spel", b: "Leren door spelen, met de woorden die je kind zelf heeft opgezocht." },
    ],
    chainCost: "",
    chainTurnTitle: "En dit is wat je krijgt",
    chainTurnBody: "Elk woord waar je kind op vastliep, wordt een woord dat het kent, en je ziet het zwart op wit: hoeveel woorden het leerde, week na week. In plaats van te hopen dat er iets verbetert, kijk je gewoon toe hoe het gebeurt.",
    dashKicker: "Het ouderdashboard",
    dashTitle: "Je ziet precies hoeveel elk kind heeft geleerd",
    dashBody: "Elk kind heeft een persoonlijk woordenschrift dat groeit. In je dashboard zie je in één oogopslag hoeveel woorden elk kind heeft geleerd, hoeveel er deze week bij zijn gekomen, en zijn recentste woorden. Elke andere tool antwoordt je kind en vergeet het. Gadit onthoudt, en jij ziet de vooruitgang week na week.",
    dashKids: [
      { name: "Noa", total: 47, week: 12 },
      { name: "Ido", total: 31, week: 8 },
      { name: "Maya", total: 63, week: 15 },
    ],
    dashWordsLabel: "woorden in schrift",
    dashWeekLabel: "deze week",
    featuresKicker: "Wat er in zit",
    features: [
      {
        kicker: "Elke betekenis",
        title: "Eén woord. Elke betekenis. Een afbeelding bij elk.",
        body: "Eén woord heeft vaak meerdere verschillende betekenissen, en juist daar raken kinderen in de war. Gadit toont ze allemaal op één plek, elk met drie echte voorbeelden en een eigen afbeelding, want het brein van een kind onthoudt beelden veel beter dan woorden.",
      },
      {
        kicker: "Kindermodus",
        title: "Uitleg op ooghoogte van je kind",
        body: "Eén schakelaar, en elke uitleg verandert in taal die een 8-jarige echt begrijpt. Geen moeilijke woorden die moeilijke woorden uitleggen, geen cirkeldefinities. Alleen begrip.",
      },
      {
        kicker: "Context",
        title: "Plak een zin, krijg de juiste betekenis",
        body: "De meeste woorden hebben meer dan één betekenis, en juist daar raken kinderen de weg kwijt. Plak de zin uit het boek of werkblad, en Gadit markeert precies welke betekenis erbij past.",
      },
      {
        kicker: "Persoonlijk schrift",
        title: "De woorden lopen niet weg",
        body: "Elk woord dat je kind opzoekt, belandt in zijn persoonlijke schrift, en korte slimme oefeningen brengen het terug vlak voordat het wegglipt. Zo wordt woordenschat echt opgebouwd, woord voor woord.",
      },
      {
        kicker: "Een profiel per kind",
        title: "Elk kind krijgt zijn eigen ruimte",
        body: "Elk kind in het gezin krijgt een apart profiel: zijn schrift, zijn oefeningen, zijn geschiedenis. De Kindermodus past de uitleg aan, simpel en duidelijk voor de kleintjes en uitgebreider voor de oudere kinderen, en niemand komt aan de woorden van een ander.",
      },
      {
        kicker: "Woordspelletjes",
        title: "Leerspelletjes met de woorden van je kind",
        body: "Korte quizzen en spelletjes opgebouwd uit de woorden die je kind daadwerkelijk heeft opgezocht. Een paar minuten spelen, en de woordenschat groeit vanzelf.",
      },
      {
        kicker: "Tweede taal",
        title: "De beste huiswerkhulp voor een tweede taal",
        body: "Je kind typt een woord in het Engels en krijgt een eenvoudige uitleg in zijn eigen taal, met een afbeelding en voorbeelden. Geen gedwaal tussen een woordenboek, een vertaler en YouTube.",
      },
    ],
    midCtaTitle: "Begin nu, en zie de woordenschat van je kind dag na dag groeien",
    midCta: "Start je gratis proefperiode van 14 dagen",
    compareKicker: "Het verschil",
    compareTitle: "Waarom niet gewoon googelen of een chatbot vragen?",
    compareGadit: "Gadit",
    compareOther: "Het open internet",
    compareRows: [
      { label: "Eén overzichtelijke pagina per woord", gadit: true, other: false },
      { label: "Uitleg op kinderniveau", gadit: true, other: false },
      { label: "Een afbeelding bij elke betekenis", gadit: true, other: false },
      { label: "Een schrift en oefeningen die beklijven", gadit: true, other: false },
      { label: "Advertenties en links in elke richting", gadit: false, other: true },
      { label: "Open chat zonder grenzen", gadit: false, other: true },
    ],
    safeTitle: "Een aparte, overzichtelijke zone. Geen deur naar ergens anders.",
    safeBody: "Gadit is een volledig afgesloten ruimte: geen open chat, geen feed, geen advertenties, geen externe links. Een kind wordt hier niet naar TikTok of een andere app getrokken. Er is hier maar één ding te doen: een woord begrijpen, en teruggaan naar het leren.",
    safeLine: "Eén scherm dat je een kind met een gerust hart kunt geven.",
    stackTitle: "Wat het Family-abonnement omvat",
    stackItems: [
      "Onbeperkt zoeken voor het hele gezin",
      "Elke betekenis, met een afbeelding bij elk",
      "Kindermodus voor elke leeftijd",
      "Zinscontrole met directe feedback",
      "Een persoonlijk schrift en slimme oefeningen per kind",
      "Woordspelletjes en quizzen",
      "Tot 5 kinderen met aparte profielen",
      "30+ talen met volledige ondersteuning",
    ],
    priceKicker: "Prijzen",
    priceTitle: "Het Family-abonnement",
    trialBadge: "Gratis proefperiode van 14 dagen",
    yearly: "$59 / jaar",
    yearlyNote: "dat is $4.92 per maand voor het hele gezin, en bespaart je bijna twee maanden vergeleken met maandelijks betalen",
    priceAnchor: "Minder dan één privéles, voor een heel jaar, voor elk kind thuis",
    monthly: "$5.99 / maand",
    billedYearly: "Jaarlijks",
    billedMonthly: "Maandelijks",
    yearlySave: "-18%",
    priceCta: "Start de proefperiode",
    cancelNote: "Eerste afschrijving pas na de 14 dagen. Zeg op elk moment op via je accountpagina, met één klik.",
    singleChild: "Maar één leerling thuis? Deep kost $4.99/maand. Voor iets meer kun je tot 5 kinderen toevoegen.",
    guaranteeTitle: "Jouw test: twee weken",
    guaranteeBody: "Geef het twee weken van echt gebruik, gratis. Als het schrift van je kind op dag 14 niet minstens 20 nieuwe woorden heeft verzameld, zeg je op met één klik en heb je niets betaald.",
    faqTitle: "Vragen die ouders stellen",
    faq: [
      {
        q: "Wat krijg ik met Gadit?",
        a: "Elk woord dat je kind opzoekt, krijgt één overzichtelijke pagina: elke betekenis, uitleg op kinderniveau (Kindermodus), drie echte voorbeelden, en een afbeelding per betekenis. Plus context (plak een zin en krijg de juiste betekenis), een persoonlijk woordenschrift met slimme oefeningen, woordspelletjes en quizzen, een ouderdashboard dat laat zien hoeveel elk kind heeft geleerd, tot 5 kinderen op aparte profielen, alles in 30+ talen, in een afgesloten, veilige ruimte zonder open chat en zonder advertenties.",
      },
      {
        q: "Waarom niet gewoon een chatbot of Google vragen?",
        a: "Omdat dat tools voor volwassenen zijn. Google levert advertenties en links in elke richting op, en een open chatbot is een grenzeloos gesprek waar geen enkele ouder een kind alleen in achterlaat. Gadit is andersom gebouwd: één afgesloten, overzichtelijke pagina per woord, op kinderniveau, zonder kans om te verdwalen.",
      },
      {
        q: "Hoe weet ik of mijn kind echt vooruitgaat?",
        a: "Je krijgt een ouderdashboard. In één oogopslag zie je hoeveel woorden elk kind heeft geleerd, hoeveel er deze week bij zijn gekomen, en zijn laatste woorden. Elke andere tool antwoordt het kind en vergeet het; Gadit slaat elk woord op in het persoonlijke schrift van het kind, zodat je de woordenschat week na week ziet groeien.",
      },
      {
        q: "Voor welke leeftijden is het?",
        a: "De kern van Gadit is schoolgaande kinderen, vanaf de basisschool tot de bovenbouw van de middelbare school. De Kindermodus legt eenvoudig uit voor de jongsten, en de volledige uitleg is ook geschikt voor tieners en ouders. De ouder opent het account.",
      },
      {
        q: "Helpt het bij Engels en andere talen?",
        a: "Zeer zeker. Een kind kan een woord in het Engels opzoeken en een eenvoudige uitleg in zijn eigen taal krijgen, met een afbeelding en voorbeelden, precies de hulp die thuis ontbreekt. En het werkt in 30+ talen, zodat het kind de uitleg ook kan krijgen in de taal die je thuis spreekt.",
      },
      {
        q: "Hoeveel kost het?",
        a: "$59 per jaar of $5.99 per maand, na de proefperiode van 14 dagen. Geen verborgen kosten, en je zegt op elk moment op met één klik.",
      },
      {
        q: "Hoeveel kinderen kan ik toevoegen?",
        a: "Tot 5 kinderen op één Family-abonnement, elk met zijn eigen profiel, schrift en oefeningen.",
      },
      {
        q: "Kunnen we het proberen zonder verplichting?",
        a: "Ja. De proefperiode start met een kaart, maar de eerste afschrijving gebeurt pas wanneer de 14 dagen aflopen. Zeg op elk moment daarvoor op, met één klik, en je betaalt niets.",
      },
    ],
    finalTitle: "Begin vandaag, en zie de woordenschat groeien",
    finalSub: "Twee weken gratis. Opzeggen met één klik. En een kind dat leert woorden zelfstandig te begrijpen.",
    finalCta: "Start je gratis proefperiode van 14 dagen",
    footerTerms: "Voorwaarden",
    footerPrivacy: "Privacy",
  },
  ru: {
    heroBadge: "Умный визуальный словарь для всей семьи",
    whatIs: "Gadit — умный визуальный словарь для детей: каждое слово получает объяснение на уровне ребёнка, картинку, примеры, а также игры и викторины, которые превращают изучение слов в удовольствие. Словарный запас растёт, ребёнок понимает прочитанное и лучше учится.",
    ctaMicro: "",
    trustLine: "До 5 детей в семье, каждый на своём уровне",
    credLine: "Основано на 15 годах опыта работы с более чем 15 000 родителей, учеников и педагогов",
    credKicker: "Кто мы",
    credTitle: "15 лет в образовании. Теперь в одном инструменте для ребёнка.",
    credBody: "Gadit создан командой с 15-летним опытом в образовании, которая сопровождала более 15 000 родителей, учеников и педагогов. То, что снова и снова работало в классе и дома, мы вложили в один простой инструмент, которым ребёнок пользуется сам.",
    proofTitle: "Тетрадь слов · пример",
    proofBig: "12 новых слов за неделю",
    proofWords: ["мечта", "великолепный", "упорный"],
    angles: {
      vocab: {
        h1: "Словарный запас вашего ребёнка растёт. Слово за словом.",
        sub: "Каждое слово, о котором спрашивает ребёнок, попадает в его личную тетрадь слов в Gadit: с картинкой, объяснением на уровне ребёнка и коротким повторением, которое возвращает слово, пока оно не станет своим. Открываете тетрадь в конце месяца и видите, как словарный запас растёт, слово за словом.",
      },
      relief: {
        h1: "Хватит быть домашним словарём",
        sub: "С этого дня, когда ребёнок спрашивает «что это значит?», у него есть одно место, где он находит ответ сам: все значения, картинка к каждому значению и объяснение на уровне ребёнка. Без открытого чата и без рекламы.",
      },
      anxiety: {
        h1: "Ребёнок читает каждое слово правильно, но не понимает по-настоящему",
        sub: "Он не всегда останавливается, чтобы спросить. Он пропускает непонятное слово, идёт дальше, и материал не усваивается. Постепенно это превращается в разочарование от учёбы и чувство «у меня не получается». Gadit даёт ребёнку одно место, где можно остановиться, понять по-настоящему и вернуться к уроку со своим словом.",
      },
      safe: {
        h1: "Единственный экран, который можно дать ребёнку без страха",
        sub: "Не открытый чат. Не бесконечная лента. Не реклама. Одно чистое место, где ребёнок вводит слово, понимает его до конца и возвращается к урокам.",
      },
    },
    heroCta: "Начать 14 дней бесплатно",
    heroTrust: "Без открытого чата · без рекламы · отмена в один клик",
    ownerCta: "В ваш семейный кабинет",
    stats: ["30+ языков интерфейса", "Картинка к каждому значению", "До 5 детей", "Отмена в один клик"],
    demoKicker: "Результат",
    demoTitle: "Ребёнок понимает каждое слово, и его словарный запас растёт каждый день",
    painKicker: "Настоящая болевая точка",
    painTitle: "Ребёнок читает, но не всегда понимает по-настоящему",
    painBody1: "Вы как раз рады, когда ребёнок останавливается и спрашивает, что значит слово. Проблема — все слова, о которых он не останавливается спросить. Он их пропускает, продолжает читать, и материал не усваивается. Словарный запас остаётся бедным, а понимание рушится слово за словом.",
    painBody2: "И это влияет на гораздо большее, чем оценка. Ребёнок, который не понимает, чувствует, что он недостаточно хорош, разочаровывается в учёбе и теряет уверенность. И это происходит тихо, так что никто не может указать, где именно порвалась нить.",
    reframe: "И именно здесь появляется Gadit.",
    puzzleKicker: "Что происходит в голове ребёнка",
    puzzleTitle: "Текст — это пазл. Каждое слово — деталь.",
    puzzleBody: "Когда ребёнок читает, его мозг собирает целую картину из слов. Каждое понятое слово — деталь, вставшая на место. Каждое пропущенное слово — дыра в картине. Достаточно трёх-четырёх дыр, и ребёнок уже не видит картину, даже если произнёс каждую букву правильно.",
    puzzleBefore: "Абзац с пропущенными словами",
    puzzleAfter: "С Gadit каждая деталь на месте",
    puzzleLine: "Когда все слова ясны, ребёнок видит целую картину.",
    chainKicker: "Как это работает",
    chainTitle: "На каждое слово ребёнок получает всё это",
    chainSteps: [
      "Ребёнок вводит непонятное слово",
      "Получает объяснение на своём уровне, картинку и три примера",
      "Слово сохраняется в его личной тетради",
      "И возвращается в коротком повторении, пока не станет по-настоящему своим",
    ],
    howBlocks: [
      { t: "Ввод слова", b: "Ребёнок вводит любое непонятное слово, в детском режиме, в чистом и безопасном месте." },
      { t: "Ясное объяснение", b: "Объяснение на уровне ребёнка, без сложных слов, объясняющих сложные слова." },
      { t: "Три примера", b: "Настоящие предложения, которые показывают, как слово живёт в тексте, а не только сухое определение." },
      { t: "Картинка к каждому значению", b: "Потому что дети запоминают увиденное гораздо лучше написанного." },
      { t: "Понимание в контексте", b: "Вставляете предложение из книги, и Gadit отмечает именно то значение, которое ему подходит." },
      { t: "Личная тетрадь", b: "Каждое слово, которое ребёнок искал, сохраняется в его тетради и не убегает." },
      { t: "Короткая викторина", b: "Короткий вопрос, который возвращает слово именно тогда, когда оно вот-вот забудется." },
      { t: "Игра", b: "Учатся во время игры, на словах, которые ребёнок искал сам." },
    ],
    chainCost: "",
    chainTurnTitle: "И вот что получаете вы",
    chainTurnBody: "Каждое слово, на котором ребёнок застрял, превращается в слово, которое он знает, и вы видите это чёрным по белому: сколько слов он закрыл, неделя за неделей. Вместо того чтобы надеяться, что что-то улучшается, вы просто видите, как это происходит.",
    dashKicker: "Панель для родителя",
    dashTitle: "Вы видите точно, сколько выучил каждый ребёнок",
    dashBody: "У каждого ребёнка в семье своя личная тетрадь слов, которая растёт. На вашей панели вы одним взглядом видите, сколько слов выучил каждый ребёнок, сколько добавилось за неделю и какие слова последние. Любой другой инструмент отвечает ребёнку и забывает. Gadit сохраняет, а вы видите прогресс неделя за неделей.",
    dashKids: [
      { name: "Ноа", total: 47, week: 12 },
      { name: "Идо", total: 31, week: 8 },
      { name: "Майя", total: 63, week: 15 },
    ],
    dashWordsLabel: "слов в тетради",
    dashWeekLabel: "за неделю",
    featuresKicker: "Что внутри",
    features: [
      {
        kicker: "Все значения",
        title: "Одно слово. Все значения. Картинка к каждому.",
        body: "У одного слова часто есть несколько разных значений, и здесь дети путаются. Gadit показывает их все в одном месте, каждое с тремя настоящими примерами и своей картинкой, потому что мозг ребёнка запоминает картинки гораздо лучше слов.",
      },
      {
        kicker: "Детский режим",
        title: "Объяснение на уровне ребёнка",
        body: "Один переключатель, и все объяснения переходят на язык, который восьмилетний ребёнок действительно понимает. Без сложных слов, объясняющих сложные слова, без замкнутых определений. Просто понятно.",
      },
      {
        kicker: "Контекст",
        title: "Вставьте предложение — получите нужное значение",
        body: "У большинства слов больше одного значения, и именно там дети теряются. Вставьте предложение из книги или рабочего листа, и Gadit отметит, какое значение подходит именно к этому контексту.",
      },
      {
        kicker: "Личная тетрадь",
        title: "Слова не убегают",
        body: "Каждое слово, которое ребёнок искал, сохраняется в его личной тетради, а короткое умное повторение возвращает его именно тогда, когда оно вот-вот забудется. Так по-настоящему строится словарный запас, слово за словом.",
      },
      {
        kicker: "Профиль для каждого ребёнка",
        title: "У каждого ребёнка своё пространство",
        body: "У каждого ребёнка в семье отдельный профиль: своя тетрадь, своё повторение и своя история. Детский режим подстраивает объяснение — просто и понятно для маленьких и полнее для старших, и никто не мешает друг другу со своими словами.",
      },
      {
        kicker: "Игры со словами",
        title: "Обучающие игры на словах ребёнка",
        body: "Короткие викторины и игры, построенные на словах, которые ребёнок искал сам. Несколько минут игры — и словарный запас растёт без усилий.",
      },
      {
        kicker: "Английский",
        title: "Лучший помощник для уроков английского",
        body: "Ребёнок вводит слово на английском и получает простое объяснение на своём языке, с картинкой и примерами. Без метаний между словарём, переводчиком и YouTube. Уроки английского перестают быть войной.",
      },
    ],
    midCtaTitle: "Начните и смотрите, как словарный запас ребёнка растёт день за днём",
    midCta: "Начать 14 дней бесплатно",
    compareKicker: "Разница",
    compareTitle: "Почему не просто загуглить или спросить чат-бота?",
    compareGadit: "Gadit",
    compareOther: "Открытый интернет",
    compareRows: [
      { label: "Одна чистая страница на каждое слово", gadit: true, other: false },
      { label: "Объяснение на уровне ребёнка", gadit: true, other: false },
      { label: "Картинка к каждому значению", gadit: true, other: false },
      { label: "Тетрадь и повторение, которые остаются", gadit: true, other: false },
      { label: "Реклама и ссылки во все стороны", gadit: false, other: true },
      { label: "Открытый чат без границ", gadit: false, other: true },
    ],
    safeTitle: "Отдельное чистое пространство, не дверь куда-то ещё",
    safeBody: "Gadit — полностью закрытое место: нет открытого чата, нет ленты, нет рекламы и нет ссылок наружу. Ребёнка отсюда не утягивает в TikTok или другое приложение. Здесь одно дело: понять слово и вернуться к учёбе.",
    safeLine: "Один экран, который можно дать ребёнку со спокойной душой.",
    stackTitle: "Что входит в семейный план",
    stackItems: [
      "Безлимитные поиски для всей семьи",
      "Все значения, с картинкой к каждому",
      "Детский режим для всех возрастов",
      "Проверка предложений с мгновенной обратной связью",
      "Личная тетрадь и умное повторение для каждого ребёнка",
      "Игры со словами и викторины",
      "До 5 детей в отдельных профилях",
      "30+ языков, включая полную поддержку русского, иврита и английского",
    ],
    priceKicker: "Цена",
    priceTitle: "Семейный план",
    trialBadge: "14 дней бесплатно",
    yearly: "199 ₪ в год",
    yearlyNote: "Меньше 17 ₪ в месяц за всю семью, и вы экономите почти два месяца по сравнению с помесячной оплатой",
    priceAnchor: "Меньше одного частного урока — на целый год, для всех детей дома",
    monthly: "19.90 ₪ в месяц",
    billedYearly: "Годовой",
    billedMonthly: "Помесячно",
    yearlySave: "-17%",
    priceCta: "Начать пробный период",
    cancelNote: "Оплата в шекелях, только по окончании 14 дней. Отмена в один клик со страницы аккаунта, когда захотите.",
    singleChild: "Дома один ученик? План Deep за 16.90 ₪ в месяц. За три шекеля больше добавляете до 5 детей.",
    guaranteeTitle: "Ваш тест: две недели",
    guaranteeBody: "Дайте этому две недели в реальном использовании, бесплатно. Если к 14-му дню в тетради ребёнка не набралось хотя бы 20 новых слов, отмените в один клик и вы не заплатили ни шекеля.",
    faqTitle: "Вопросы родителей",
    faq: [
      {
        q: "Что я получаю в Gadit?",
        a: "Каждое слово, которое ищет ребёнок, получает одну чистую страницу: все значения, объяснение на уровне ребёнка (детский режим), три настоящих примера и картинку к каждому значению. А также контекст (вставьте предложение и получите нужное значение), личную тетрадь слов с умным повторением, игры и викторины, панель для родителя, которая показывает, сколько выучил каждый ребёнок, до 5 детей в отдельных профилях — и всё это на 30+ языках, в закрытом и безопасном пространстве, без открытого чата и без рекламы.",
      },
      {
        q: "Почему не просто спросить чат-бота или Google?",
        a: "Потому что это инструменты для взрослых. Google возвращает рекламу и ссылки во все стороны, а открытый чат — это беседа без границ, в которой ни один родитель не оставит ребёнка одного. Gadit устроен наоборот: одна закрытая чистая страница на каждое слово, на уровне ребёнка, без всякой возможности потеряться.",
      },
      {
        q: "Как я узнаю, что ребёнок действительно прогрессирует?",
        a: "У вас есть панель для родителя. Одним взглядом вы видите, сколько слов выучил каждый ребёнок, сколько добавилось за неделю и какие слова последние. Любой другой инструмент отвечает ребёнку и забывает, а Gadit сохраняет каждое слово в личной тетради ребёнка, так что вы видите, как словарный запас растёт неделя за неделей.",
      },
      {
        q: "Для какого возраста это подходит?",
        a: "Сердце Gadit — дети школьного возраста, с первого класса до старшей школы. Детский режим объясняет просто для младших, а полные объяснения служат и подросткам, и родителям. Аккаунт открывает родитель.",
      },
      {
        q: "Помогает ли это с английским и другими языками?",
        a: "Очень. Можно искать слово на английском и получить простое объяснение на своём языке, с картинкой и примерами — именно тот помощник, которого не хватало дома для уроков английского. И это работает на 30+ языках, так что ребёнок может получить объяснение и на языке, на котором говорят у вас дома.",
      },
      {
        q: "Цена действительно в шекелях?",
        a: "Да. Оплата в шекелях, обычной израильской картой, без комиссий за конвертацию и без сюрпризов: 199 ₪ в год или 19.90 ₪ в месяц, после 14 дней пробного периода.",
      },
      {
        q: "Сколько детей можно добавить?",
        a: "До 5 детей в одном семейном плане, у каждого свой профиль, тетрадь и повторение.",
      },
      {
        q: "Можно попробовать без обязательств?",
        a: "Да. Пробный период начинается с картой, но первое списание происходит только по окончании 14 дней. Отмените в любой момент до этого, в один клик, и вы не заплатите ничего.",
      },
    ],
    finalTitle: "Начните сегодня и смотрите, как растёт словарный запас",
    finalSub: "Две недели бесплатно. Отмена в один клик. И ребёнок учится понимать слова сам.",
    finalCta: "Начать 14 дней бесплатно",
    footerTerms: "Условия",
    footerPrivacy: "Конфиденциальность",
  },
  ar: {
    heroBadge: "قاموس ذكي ومصوَّر لكل أفراد العائلة",
    whatIs: "Gadit قاموس ذكي ومصوَّر للأطفال: كل كلمة تحصل على شرح بمستوى الطفل، وصورة، وأمثلة، وألعاب واختبارات تجعل تعلُّم الكلمات ممتعاً. تنمو الحصيلة اللغوية، ويتحسّن الفهم القرائي، ويتقدّم طفلك في المدرسة.",
    ctaMicro: "",
    trustLine: "حتى 5 أطفال، كلٌّ حسب مستواه",
    credLine: "مبني على 15 عاماً من الخبرة مع أكثر من 15,000 من الآباء والطلاب والمعلمين",
    credKicker: "من نحن",
    credTitle: "15 عاماً في التعليم. والآن في أداة واحدة بين يدَي طفلك.",
    credBody: "بُني Gadit على يد فريق يملك 15 عاماً من الخبرة في التعليم، عمل مع أكثر من 15,000 من الآباء والطلاب والمعلمين. كل ما رأيناه ينجح مرة بعد مرة، في الصف وفي البيت، وضعناه في أداة واحدة بسيطة يستطيع الطفل استخدامها بمفرده.",
    proofTitle: "دفتر الكلمات · مثال",
    proofBig: "12 كلمة جديدة هذا الأسبوع",
    proofWords: ["حلم", "واضح", "متردّد"],
    angles: {
      vocab: { h1: "حصيلة طفلك اللغوية تنمو. كلمة بعد كلمة.", sub: "كل كلمة يسأل عنها طفلك تستقرّ في دفتر كلماته الشخصي في Gadit: مع صورة، وشرح بمستوى الطفل، وتدريب قصير يعيدها إليه حتى تصبح ملكه. افتح الدفتر في نهاية الشهر، وشاهد الحصيلة تكبر، كلمة بعد كلمة." },
      relief: { h1: "توقّف عن أن تكون قاموس العائلة", sub: "من اليوم، حين يسأل طفلك «ماذا تعني هذه الكلمة؟»، يجد مكاناً واحداً يعرف فيه الإجابة بنفسه: كل المعاني، وصورة لكل واحد منها، وشرح بمستوى الطفل. بلا محادثة مفتوحة، بلا إعلانات." },
      anxiety: { h1: "طفلك يقرأ كل كلمة بشكل صحيح، لكنه لا يفهم حقاً", sub: "لا يتوقّف دائماً ليسأل. يتخطّى كلمة لا يفهمها، ويكمل، فلا تترسّخ المادة. ومع الوقت يتحوّل ذلك إلى إحباط من المدرسة وشعور بأن «أنا لا أستطيع». يمنح Gadit طفلك مكاناً واحداً يتوقّف فيه، ويفهم حقاً، ويعود إلى الدرس والكلمة بين يديه." },
      safe: { h1: "الشاشة الوحيدة التي تسلّمها لطفلك دون قلق", sub: "بلا محادثة مفتوحة. بلا خلاصة لا تنتهي. بلا إعلانات. مكان واحد نظيف يكتب فيه الطفل كلمة، يفهمها كاملة، ويعود إلى واجباته." },
    },
    heroCta: "ابدأ تجربتك المجانية لمدة 14 يوماً",
    heroTrust: "بلا محادثة مفتوحة · بلا إعلانات · إلغاء بنقرة واحدة",
    ownerCta: "انتقل إلى مساحة عائلتك",
    stats: ["30+ لغة", "صورة لكل معنى", "حتى 5 أطفال", "إلغاء بنقرة واحدة"],
    demoKicker: "النتيجة",
    demoTitle: "طفلك يفهم كل كلمة، وحصيلته اللغوية تنمو كل يوم",
    painKicker: "الألم الحقيقي",
    painTitle: "طفلك يقرأ، لكنه لا يفهم دائماً فهماً حقيقياً",
    painBody1: "أنت في الواقع سعيد حين يتوقّف طفلك ليسأل عن معنى كلمة. المشكلة في كل الكلمات التي لا يتوقّف ليسأل عنها. يتخطّاها، ويكمل القراءة، فلا تترسّخ المادة. تبقى الحصيلة اللغوية ضعيفة، وينكسر الفهم كلمة بعد كلمة.",
    painBody2: "والأمر يمسّ ما هو أبعد بكثير من الدرجة. الطفل الذي لا يفهم يشعر بأنه ليس جيداً بما يكفي، ويُحبَط من المدرسة، ويفقد ثقته. ويحدث ذلك بصمت، دون أن يستطيع أحد أن يشير إلى المكان الذي انقطع فيه الخيط.",
    reframe: "وهنا بالضبط يأتي دور Gadit.",
    puzzleKicker: "ما يحدث في رأس الطفل",
    puzzleTitle: "النص أحجية. وكل كلمة قطعة.",
    puzzleBody: "حين يقرأ الطفل، يركّب ذهنه صورة كاملة من الكلمات. كل كلمة يفهمها قطعة تستقرّ في مكانها. وكل كلمة ناقصة ثغرة في الصورة. ثلاث أو أربع ثغرات فقط، ولا يعود الطفل يرى الصورة، حتى لو نطق كل حرف.",
    puzzleBefore: "فقرة بكلمات ناقصة",
    puzzleAfter: "مع Gadit، كل قطعة في مكانها",
    puzzleLine: "حين تكون كل كلمة واضحة، يرى الطفل الصورة كاملة.",
    chainKicker: "كيف يعمل",
    chainTitle: "كل ما يحصل عليه طفلك، مع كل كلمة",
    chainSteps: ["طفلك يكتب كلمة لا يفهمها", "يحصل على شرح في مستوى نظره، وصورة وثلاثة أمثلة", "تُحفَظ الكلمة في دفتره الشخصي", "وتعود في تدريب قصير، حتى تصبح ملكه حقاً"],
    howBlocks: [
      { t: "اكتب الكلمة", b: "يكتب طفلك أي كلمة لا يفهمها، في وضع الأطفال، في مكان نظيف وآمن." },
      { t: "تعريف واضح", b: "شرح في مستوى نظر الطفل، بلا كلمات صعبة تشرح كلمات صعبة." },
      { t: "ثلاثة أمثلة", b: "جُمل حقيقية تُظهر كيف تعيش الكلمة داخل النص، لا مجرّد تعريف جاف." },
      { t: "صورة لكل معنى", b: "لأن الأطفال يتذكّرون ما يرونه أفضل بكثير مما يُكتب لهم." },
      { t: "السياق", b: "الصق جملة من الكتاب، ويحدّد Gadit بالضبط المعنى الذي يناسبها." },
      { t: "دفتر شخصي", b: "كل كلمة بحث عنها طفلك تُحفَظ في دفتره، ولا تهرب." },
      { t: "اختبار قصير", b: "سؤال سريع يعيد الكلمة قبل أن تنساها بلحظة." },
      { t: "لعبة", b: "تعلُّم باللعب، على الكلمات التي بحث عنها طفلك بنفسه." },
    ],
    chainCost: "",
    chainTurnTitle: "وهذا ما تحصل عليه",
    chainTurnBody: "كل كلمة تعثّر عندها طفلك تصبح كلمة يعرفها، وتراها بالأبيض والأسود: كم كلمة أغلق، أسبوعاً بعد أسبوع. بدل أن تأمل أن شيئاً ما يتحسّن، تشاهده يحدث ببساطة.",
    dashKicker: "لوحة الآباء",
    dashTitle: "ترى بالضبط كم تعلّم كل طفل",
    dashBody: "لكل طفل دفتر كلمات شخصي ينمو. في لوحتك ترى، بنظرة واحدة، كم كلمة تعلّم كل طفل، وكم كلمة أُضيفت هذا الأسبوع، وأحدث كلماته. أي أداة أخرى تجيب طفلك ثم تنسى. أما Gadit فيتذكّر، وأنت ترى التقدّم أسبوعاً بعد أسبوع.",
    dashKids: [ { name: "نور", total: 47, week: 12 }, { name: "آدم", total: 31, week: 8 }, { name: "مايا", total: 63, week: 15 } ],
    dashWordsLabel: "كلمة في الدفتر",
    dashWeekLabel: "هذا الأسبوع",
    featuresKicker: "ما بداخله",
    features: [
      { kicker: "كل معنى", title: "كلمة واحدة. كل المعاني. وصورة لكل واحد.", body: "غالباً ما تحمل الكلمة الواحدة عدة معانٍ مختلفة، وهنا يقع الأطفال في الحيرة. يعرضها Gadit جميعها في مكان واحد، كلٌّ مع ثلاثة أمثلة حقيقية وصورته الخاصة، لأن دماغ الطفل يتذكّر الصور أفضل بكثير من الكلمات." },
      { kicker: "وضع الأطفال", title: "شروحات في مستوى نظر طفلك", body: "زرّ واحد، ويتحوّل كل شرح إلى لغة يفهمها فعلاً طفل في الثامنة. بلا كلمات صعبة تشرح كلمات صعبة، بلا تعريفات تدور حول نفسها. مجرّد فهم." },
      { kicker: "السياق", title: "الصق جملة، واحصل على المعنى الصحيح", body: "معظم الكلمات تحمل أكثر من معنى، وهنا يضيع الأطفال. الصق الجملة من الكتاب أو ورقة العمل، ويحدّد Gadit بالضبط أي معنى يناسب." },
      { kicker: "دفتر شخصي", title: "الكلمات لا تهرب", body: "كل كلمة يبحث عنها طفلك تستقرّ في دفتره الشخصي، وتدريب قصير وذكي يعيدها قبل أن تنساها بلحظة. هكذا تُبنى الحصيلة اللغوية حقاً، كلمة كلمة." },
      { kicker: "ملف لكل طفل", title: "لكل طفل مساحته الخاصة", body: "كل طفل في العائلة يحصل على ملف منفصل: دفتره، وتدريبه، وسجلّه. يتكيّف وضع الأطفال مع الشرح، بسيطاً وواضحاً للصغار وأكمل للكبار، ولا أحد يتعدّى على كلمات أحد." },
      { kicker: "ألعاب الكلمات", title: "ألعاب تعليمية على كلمات طفلك", body: "اختبارات وألعاب قصيرة مبنية من الكلمات التي بحث عنها طفلك فعلاً. بضع دقائق من اللعب، وتنمو الحصيلة اللغوية دون جهد." },
      { kicker: "لغة ثانية", title: "أفضل مساعد للواجبات في لغة ثانية", body: "يكتب طفلك كلمة بالإنجليزية ويحصل على شرح بسيط بلغته هو، مع صورة وأمثلة. بلا تنقّل بين قاموس ومترجم ويوتيوب." },
    ],
    midCtaTitle: "ابدأ الآن، وشاهد حصيلة طفلك اللغوية تنمو يوماً بعد يوم",
    midCta: "ابدأ تجربتك المجانية لمدة 14 يوماً",
    compareKicker: "الفرق",
    compareTitle: "لماذا لا تكتفي بالبحث في جوجل أو سؤال روبوت محادثة؟",
    compareGadit: "Gadit",
    compareOther: "الإنترنت المفتوح",
    compareRows: [
      { label: "صفحة واحدة نظيفة لكل كلمة", gadit: true, other: false },
      { label: "شروحات بمستوى الطفل", gadit: true, other: false },
      { label: "صورة لكل معنى", gadit: true, other: false },
      { label: "دفتر وتدريب يترسّخان", gadit: true, other: false },
      { label: "إعلانات وروابط في كل اتجاه", gadit: false, other: true },
      { label: "محادثة مفتوحة بلا حدود", gadit: false, other: true },
    ],
    safeTitle: "منطقة منفصلة ونظيفة. لا بوابة إلى أي مكان آخر.",
    safeBody: "Gadit مساحة مغلقة تماماً: بلا محادثة مفتوحة، بلا خلاصة، بلا إعلانات، بلا روابط خارجية. لا يُسحَب الطفل من هنا إلى تيك توك أو أي تطبيق آخر. هناك شيء واحد يُفعَل هنا: فهم كلمة، والعودة إلى الدراسة.",
    safeLine: "شاشة واحدة تسلّمها لطفلك بصفاء ذهن.",
    stackTitle: "ما تشمله خطة العائلة",
    stackItems: ["عمليات بحث غير محدودة لكل أفراد العائلة", "كل معنى، مع صورة لكل واحد", "وضع الأطفال لكل عمر", "فحص الجُمل مع ملاحظات فورية", "دفتر شخصي وتدريب ذكي لكل طفل", "ألعاب واختبارات كلمات", "حتى 5 أطفال بملفات منفصلة", "30+ لغة بدعم كامل"],
    priceKicker: "الأسعار",
    priceTitle: "خطة العائلة",
    trialBadge: "تجربة مجانية 14 يوماً",
    yearly: "$59 / سنة",
    yearlyNote: "أي $4.92 في الشهر لكل أفراد العائلة، ويوفّر لك ما يقارب شهرين مقارنة بالدفع الشهري",
    priceAnchor: "أقل من حصة درس خصوصي واحدة، لسنة كاملة، ولكل طفل في البيت",
    monthly: "$5.99 / شهر",
    billedYearly: "سنوي",
    billedMonthly: "شهري",
    yearlySave: "-18%",
    priceCta: "ابدأ التجربة",
    cancelNote: "لا خصم إلا بعد الـ 14 يوماً. ألغِ في أي وقت من صفحة حسابك، بنقرة واحدة.",
    singleChild: "طالب واحد فقط في البيت؟ خطة Deep بـ $4.99/شهر. وبقليل أكثر يمكنك إضافة حتى 5 أطفال.",
    guaranteeTitle: "اختبارك: أسبوعان",
    guaranteeBody: "جرّبه أسبوعين من الاستخدام الحقيقي، مجاناً. إن لم يجمع دفتر طفلك بحلول اليوم الـ 14 ما لا يقلّ عن 20 كلمة جديدة، ألغِ بنقرة واحدة ولم تدفع شيئاً.",
    faqTitle: "أسئلة يطرحها الآباء",
    faq: [
      { q: "ماذا أحصل عليه مع Gadit؟", a: "كل كلمة يبحث عنها طفلك تحصل على صفحة واحدة نظيفة: كل المعاني، وشرح بمستوى الطفل (وضع الأطفال)، وثلاثة أمثلة حقيقية، وصورة لكل معنى. إضافة إلى السياق (الصق جملة واحصل على المعنى الصحيح)، ودفتر كلمات شخصي بتدريب ذكي، وألعاب واختبارات كلمات، ولوحة للآباء تُظهر كم تعلّم كل طفل، وحتى 5 أطفال بملفات منفصلة، كل ذلك بـ 30+ لغة، في مساحة مغلقة وآمنة بلا محادثة مفتوحة وبلا إعلانات." },
      { q: "لماذا لا أكتفي بسؤال روبوت محادثة أو جوجل؟", a: "لأن تلك أدوات للكبار. جوجل يعيد إعلانات وروابط في كل اتجاه، وروبوت المحادثة المفتوح محادثة بلا حدود لا يترك فيها أي والد طفله وحده. أما Gadit فمبني على العكس تماماً: صفحة واحدة مغلقة ونظيفة لكل كلمة، بمستوى الطفل، بلا طريقة للضياع." },
      { q: "كيف أعرف أن طفلي يتقدّم فعلاً؟", a: "تحصل على لوحة للآباء. بنظرة واحدة ترى كم كلمة تعلّم كل طفل، وكم كلمة أُضيفت هذا الأسبوع، وأحدث كلماته. كل أداة أخرى تجيب الطفل ثم تنسى؛ أما Gadit فيحفظ كل كلمة في دفتر الطفل الشخصي، فتشاهد الحصيلة اللغوية تنمو أسبوعاً بعد أسبوع." },
      { q: "لأي الأعمار هو مناسب؟", a: "قلب Gadit هو أطفال سنّ المدرسة، من الصف الأول حتى الثانوية. يشرح وضع الأطفال ببساطة للصغار، والشروحات الكاملة تخدم المراهقين والآباء أيضاً. الوالد هو من يفتح الحساب." },
      { q: "هل يساعد في الإنجليزية واللغات الأخرى؟", a: "كثيراً. يستطيع الطفل البحث عن كلمة بالإنجليزية ويحصل على شرح بسيط بلغته هو، مع صورة وأمثلة، وهو بالضبط المساعد الناقص في البيت. وهو يعمل بـ 30+ لغة، فيمكن للطفل أن يحصل على الشرح باللغة التي تتحدّثها في البيت أيضاً." },
      { q: "كم يكلّف؟", a: "$59 في السنة أو $5.99 في الشهر، بعد تجربة الـ 14 يوماً. بلا رسوم خفية، وتلغي في أي وقت بنقرة واحدة." },
      { q: "كم طفلاً يمكنني إضافته؟", a: "حتى 5 أطفال في خطة عائلة واحدة، لكل واحد ملفه ودفتره وتدريبه." },
      { q: "هل يمكننا تجربته دون التزام؟", a: "نعم. تبدأ التجربة ببطاقة، لكن أول خصم يحدث فقط عند انتهاء الـ 14 يوماً. ألغِ في أي وقت قبل ذلك، بنقرة واحدة، ولا تدفع شيئاً." },
    ],
    finalTitle: "ابدأ اليوم، وشاهد الحصيلة اللغوية تنمو",
    finalSub: "أسبوعان مجاناً. إلغاء بنقرة واحدة. وطفل يتعلّم أن يفهم الكلمات بنفسه.",
    finalCta: "ابدأ تجربتك المجانية لمدة 14 يوماً",
    footerTerms: "الشروط",
    footerPrivacy: "الخصوصية",
  },
  es: {
    heroBadge: "Un diccionario visual e inteligente para toda la familia",
    whatIs: "Gadit es un diccionario visual e inteligente para niños: cada palabra recibe una explicación a su nivel, una imagen, ejemplos, juegos y cuestionarios que hacen que aprender palabras sea divertido. El vocabulario crece, la comprensión lectora mejora y tu hijo rinde mejor en la escuela.",
    ctaMicro: "",
    trustLine: "Hasta 5 niños, cada uno a su propio nivel",
    credLine: "Creado sobre 15 años de experiencia con más de 15.000 padres, estudiantes y educadores",
    credKicker: "Quiénes somos",
    credTitle: "15 años en la educación. Ahora en una sola herramienta para tu hijo.",
    credBody: "Gadit fue creado por un equipo con 15 años de experiencia en educación, que ha trabajado con más de 15.000 padres, estudiantes y educadores. Lo que vimos funcionar una y otra vez, en el aula y en casa, lo reunimos en una herramienta simple que un niño puede usar por su cuenta.",
    proofTitle: "Cuaderno de palabras · ejemplo",
    proofBig: "12 palabras nuevas esta semana",
    proofWords: ["sueño", "vívido", "reacio"],
    angles: {
      vocab: {
        h1: "El vocabulario de tu hijo crece. Palabra a palabra.",
        sub: "Cada palabra que tu hijo pregunta llega a su cuaderno de palabras personal en Gadit: con una imagen, una explicación a su nivel y una práctica breve que la trae de vuelta hasta que la hace suya. Abre el cuaderno al final del mes y mira cómo crece el vocabulario, palabra a palabra.",
      },
      relief: {
        h1: "Deja de ser el diccionario de la familia",
        sub: "Desde hoy, cuando tu hijo pregunte «¿qué significa esto?», tiene un solo lugar para encontrar la respuesta solo: cada significado, una imagen para cada uno y una explicación a nivel infantil. Sin chat abierto, sin anuncios.",
      },
      anxiety: {
        h1: "Tu hijo lee cada palabra bien, pero no entiende de verdad",
        sub: "No siempre se detiene a preguntar. Se salta una palabra que no entiende, sigue adelante y el contenido no cala. Con el tiempo se convierte en frustración con la escuela y en la sensación de «yo no puedo con esto». Gadit le da a tu hijo un solo lugar para detenerse, entender de verdad y volver a la lección con la palabra en la mano.",
      },
      safe: {
        h1: "La única pantalla que puedes darle a un niño sin preocuparte",
        sub: "Sin chat abierto. Sin feed infinito. Sin anuncios. Un solo lugar limpio donde un niño escribe una palabra, la entiende del todo y vuelve a la tarea.",
      },
    },
    heroCta: "Comienza tu prueba gratis de 14 días",
    heroTrust: "Sin chat abierto · Sin anuncios · Cancela con un clic",
    ownerCta: "Ir a tu espacio familiar",
    stats: ["30+ idiomas", "Una imagen por significado", "Hasta 5 niños", "Cancela con un clic"],
    demoKicker: "El resultado",
    demoTitle: "Tu hijo entiende cada palabra, y su vocabulario crece cada día",
    painKicker: "El dolor real",
    painTitle: "Tu hijo lee, pero no siempre entiende de verdad",
    painBody1: "En realidad te alegra cuando tu hijo se detiene a preguntar qué significa una palabra. El problema son todas las palabras por las que no se detiene a preguntar. Se las salta, sigue leyendo y el contenido no cala. El vocabulario se queda pobre y la comprensión se rompe palabra tras palabra.",
    painBody2: "Y afecta a mucho más que a una nota. Un niño que no entiende se siente insuficiente, se frustra con la escuela y pierde la confianza. Y ocurre en silencio, sin que nadie pueda señalar dónde se rompió el hilo.",
    reframe: "Y aquí es exactamente donde entra Gadit.",
    puzzleKicker: "Lo que pasa en la cabeza de un niño",
    puzzleTitle: "Un texto es un rompecabezas. Cada palabra es una pieza.",
    puzzleBody: "Cuando un niño lee, su mente arma una imagen completa a partir de las palabras. Cada palabra que entiende es una pieza que encaja en su lugar. Cada palabra que le falta es un hueco en la imagen. Bastan tres o cuatro huecos, y el niño ya no ve la imagen, aunque haya pronunciado cada letra.",
    puzzleBefore: "Un párrafo con palabras que faltan",
    puzzleAfter: "Con Gadit, cada pieza en su lugar",
    puzzleLine: "Cuando cada palabra está clara, el niño ve la imagen completa.",
    chainKicker: "Cómo funciona",
    chainTitle: "Todo lo que tu hijo recibe, en cada palabra",
    chainSteps: [
      "Tu hijo escribe una palabra que no entiende",
      "Recibe una explicación a su nivel, una imagen y tres ejemplos",
      "La palabra se guarda en su cuaderno personal",
      "Y vuelve en una práctica breve, hasta que la hace de verdad suya",
    ],
    howBlocks: [
      { t: "Escribe la palabra", b: "Tu hijo escribe cualquier palabra que no entienda, en Modo Niños, en un lugar limpio y seguro." },
      { t: "Una definición clara", b: "Una explicación al nivel del niño, sin palabras difíciles que explican palabras difíciles." },
      { t: "Tres ejemplos", b: "Frases reales que muestran cómo vive la palabra dentro de un texto, no solo una definición seca." },
      { t: "Una imagen para cada significado", b: "Porque los niños recuerdan lo que ven mucho mejor que lo que se les escribe." },
      { t: "Contexto", b: "Pega una frase del libro y Gadit marca exactamente el significado que encaja." },
      { t: "Un cuaderno personal", b: "Cada palabra que tu hijo consultó se guarda en su cuaderno, y no se escapa." },
      { t: "Un cuestionario breve", b: "Una pregunta rápida que trae la palabra de vuelta justo antes de que se escape." },
      { t: "Un juego", b: "Aprender jugando, con las palabras que tu hijo mismo consultó." },
    ],
    chainCost: "",
    chainTurnTitle: "Y esto es lo que consigues",
    chainTurnBody: "Cada palabra en la que tu hijo se atascó se convierte en una palabra que domina, y lo ves en blanco y negro: cuántas palabras cerró, semana tras semana. En lugar de esperar que algo esté mejorando, simplemente lo ves suceder.",
    dashKicker: "El panel para padres",
    dashTitle: "Ves exactamente cuánto ha aprendido cada niño",
    dashBody: "Cada niño tiene un cuaderno de palabras personal que crece. En tu panel ves, de un vistazo, cuántas palabras ha aprendido cada niño, cuántas se añadieron esta semana y sus palabras más recientes. Cualquier otra herramienta le responde a tu hijo y se olvida. Gadit recuerda, y tú ves el progreso semana tras semana.",
    dashKids: [
      { name: "Noa", total: 47, week: 12 },
      { name: "Ido", total: 31, week: 8 },
      { name: "Maya", total: 63, week: 15 },
    ],
    dashWordsLabel: "palabras en el cuaderno",
    dashWeekLabel: "esta semana",
    featuresKicker: "Qué incluye",
    features: [
      {
        kicker: "Cada significado",
        title: "Una palabra. Cada significado. Una imagen para cada uno.",
        body: "Una misma palabra suele tener varios significados distintos, y ahí es donde los niños se confunden. Gadit se los muestra todos en un solo lugar, cada uno con tres ejemplos reales y su propia imagen, porque el cerebro de un niño recuerda las imágenes mucho mejor que las palabras.",
      },
      {
        kicker: "Modo Niños",
        title: "Explicaciones al nivel de tu hijo",
        body: "Un solo interruptor, y cada explicación se convierte en un lenguaje que un niño de 8 años entiende de verdad. Sin palabras difíciles que explican palabras difíciles, sin definiciones circulares. Solo comprensión.",
      },
      {
        kicker: "Contexto",
        title: "Pega una frase, recibe el significado correcto",
        body: "La mayoría de las palabras tienen más de un significado, y ahí es donde los niños se pierden. Pega la frase del libro o de la ficha, y Gadit marca exactamente qué significado encaja.",
      },
      {
        kicker: "Cuaderno personal",
        title: "Las palabras no se escapan",
        body: "Cada palabra que tu hijo consulta llega a su cuaderno personal, y una práctica breve e inteligente la trae de vuelta justo antes de que se escape. Así se construye de verdad el vocabulario, una palabra a la vez.",
      },
      {
        kicker: "Un perfil por niño",
        title: "Cada niño tiene su propio espacio",
        body: "Cada niño de la familia tiene un perfil separado: su cuaderno, su práctica, su historial. El Modo Niños adapta la explicación, simple y clara para los pequeños y más completa para los mayores, y nadie pisa las palabras de nadie.",
      },
      {
        kicker: "Juegos de palabras",
        title: "Juegos de aprendizaje con las palabras de tu hijo",
        body: "Cuestionarios y juegos breves creados a partir de las palabras que tu hijo realmente consultó. Unos minutos de juego, y el vocabulario crece sin esfuerzo.",
      },
      {
        kicker: "Segundo idioma",
        title: "El mejor apoyo con la tarea de un segundo idioma",
        body: "Tu hijo escribe una palabra en inglés y recibe una explicación sencilla en su propio idioma, con una imagen y ejemplos. Sin andar entre un diccionario, un traductor y YouTube.",
      },
    ],
    midCtaTitle: "Empieza ahora, y mira cómo crece el vocabulario de tu hijo día a día",
    midCta: "Comienza tu prueba gratis de 14 días",
    compareKicker: "La diferencia",
    compareTitle: "¿Por qué no simplemente buscarlo en Google o preguntarle a un chatbot?",
    compareGadit: "Gadit",
    compareOther: "El internet abierto",
    compareRows: [
      { label: "Una página limpia por palabra", gadit: true, other: false },
      { label: "Explicaciones a nivel infantil", gadit: true, other: false },
      { label: "Una imagen para cada significado", gadit: true, other: false },
      { label: "Un cuaderno y práctica que se fijan", gadit: true, other: false },
      { label: "Anuncios y enlaces en todas direcciones", gadit: false, other: true },
      { label: "Chat abierto y sin límites", gadit: false, other: true },
    ],
    safeTitle: "Una zona aparte y limpia. No una puerta hacia ningún otro sitio.",
    safeBody: "Gadit es un espacio totalmente cerrado: sin chat abierto, sin feed, sin anuncios, sin enlaces externos. A un niño no lo arrastran desde aquí a TikTok ni a ninguna otra app. Aquí hay una sola cosa que hacer: entender una palabra, y volver a estudiar.",
    safeLine: "Una pantalla que puedes darle a un niño con la mente tranquila.",
    stackTitle: "Qué incluye el plan Familia",
    stackItems: [
      "Búsquedas ilimitadas para toda la familia",
      "Cada significado, con una imagen para cada uno",
      "Modo Niños para todas las edades",
      "Revisión de frases con retroalimentación instantánea",
      "Un cuaderno personal y práctica inteligente por niño",
      "Juegos de palabras y cuestionarios",
      "Hasta 5 niños con perfiles separados",
      "30+ idiomas con soporte completo",
    ],
    priceKicker: "Precios",
    priceTitle: "El plan Familia",
    trialBadge: "Prueba gratis de 14 días",
    yearly: "$59 / año",
    yearlyNote: "eso es $4,92 al mes para toda la familia, y te ahorra casi dos meses frente al pago mensual",
    priceAnchor: "Menos que una sola clase particular, para un año entero, para cada niño de la casa",
    monthly: "$5.99 / mes",
    billedYearly: "Anual",
    billedMonthly: "Mensual",
    yearlySave: "-18%",
    priceCta: "Comienza la prueba",
    cancelNote: "El primer cargo solo después de los 14 días. Cancela cuando quieras desde la página de tu cuenta, con un clic.",
    singleChild: "¿Solo un estudiante en casa? Deep cuesta $4.99/mes. Por un poco más puedes añadir hasta 5 niños.",
    guaranteeTitle: "Tu prueba: dos semanas",
    guaranteeBody: "Dale dos semanas de uso real, gratis. Si al día 14 el cuaderno de tu hijo no ha reunido al menos 20 palabras nuevas, cancela con un clic y no pagaste nada.",
    faqTitle: "Preguntas que hacen los padres",
    faq: [
      {
        q: "¿Qué obtengo con Gadit?",
        a: "Cada palabra que tu hijo consulta recibe una página limpia: cada significado, una explicación a nivel infantil (Modo Niños), tres ejemplos reales y una imagen por significado. Además contexto (pega una frase y obtén el significado correcto), un cuaderno de palabras personal con práctica inteligente, juegos de palabras y cuestionarios, un panel para padres que muestra cuánto ha aprendido cada niño, hasta 5 niños en perfiles separados, todo en 30+ idiomas, en un espacio cerrado y seguro sin chat abierto y sin anuncios.",
      },
      {
        q: "¿Por qué no simplemente preguntarle a un chatbot o a Google?",
        a: "Porque esas son herramientas para adultos. Google devuelve anuncios y enlaces en todas direcciones, y un chatbot abierto es una conversación sin límites en la que ningún padre deja solo a su hijo. Gadit está construido al revés: una sola página cerrada y limpia por palabra, a nivel infantil, sin forma de perderse.",
      },
      {
        q: "¿Cómo sé que mi hijo realmente está progresando?",
        a: "Recibes un panel para padres. De un vistazo ves cuántas palabras ha aprendido cada niño, cuántas se añadieron esta semana y sus últimas palabras. Cualquier otra herramienta le responde al niño y se olvida; Gadit guarda cada palabra en el cuaderno personal del niño, para que veas cómo crece el vocabulario semana tras semana.",
      },
      {
        q: "¿Para qué edades es?",
        a: "El corazón de Gadit son los niños en edad escolar, desde primer grado hasta la secundaria. El Modo Niños explica de forma sencilla para los más pequeños, y las explicaciones completas sirven también a adolescentes y padres. El padre o la madre abre la cuenta.",
      },
      {
        q: "¿Ayuda con el inglés y otros idiomas?",
        a: "Muchísimo. Un niño puede consultar una palabra en inglés y recibir una explicación sencilla en su propio idioma, con una imagen y ejemplos, justo el apoyo que falta en casa. Y funciona en 30+ idiomas, así que el niño también puede recibir la explicación en el idioma que hablas en casa.",
      },
      {
        q: "¿Cuánto cuesta?",
        a: "$59 al año o $5.99 al mes, tras la prueba de 14 días. Sin cargos ocultos, y cancelas cuando quieras con un clic.",
      },
      {
        q: "¿Cuántos niños puedo añadir?",
        a: "Hasta 5 niños en un plan Familia, cada uno con su propio perfil, cuaderno y práctica.",
      },
      {
        q: "¿Podemos probarlo sin comprometernos?",
        a: "Sí. La prueba empieza con una tarjeta, pero el primer cargo ocurre solo cuando terminan los 14 días. Cancela cuando quieras antes de eso, con un clic, y no pagas nada.",
      },
    ],
    finalTitle: "Empieza hoy, y mira cómo crece el vocabulario",
    finalSub: "Dos semanas gratis. Cancelación con un clic. Y un niño que aprende a entender las palabras por su cuenta.",
    finalCta: "Comienza tu prueba gratis de 14 días",
    footerTerms: "Términos",
    footerPrivacy: "Privacidad",
  },
  pt: {
    heroBadge: "Um dicionário visual e inteligente para a família toda",
    whatIs: "O Gadit é um dicionário visual e inteligente para crianças: cada palavra ganha uma explicação no nível da criança, uma imagem, exemplos, além de jogos e quizzes que tornam o aprendizado divertido. O vocabulário cresce, a compreensão de leitura melhora e seu filho vai melhor na escola.",
    ctaMicro: "",
    trustLine: "Até 5 crianças, cada uma no seu próprio nível",
    credLine: "Construído sobre 15 anos de experiência com mais de 15.000 pais, alunos e educadores",
    credKicker: "Quem somos",
    credTitle: "15 anos em educação. Agora em uma única ferramenta para seu filho.",
    credBody: "O Gadit foi criado por uma equipe com 15 anos de experiência em educação, que trabalhou com mais de 15.000 pais, alunos e educadores. Tudo o que vimos funcionar de novo e de novo, na sala de aula e em casa, colocamos em uma ferramenta simples que a criança usa sozinha.",
    proofTitle: "Caderno de palavras · exemplo",
    proofBig: "12 palavras novas nesta semana",
    proofWords: ["sonho", "vívido", "relutante"],
    angles: {
      vocab: {
        h1: "O vocabulário do seu filho cresce. Palavra por palavra.",
        sub: "Cada palavra que seu filho pergunta vai parar no caderno de palavras pessoal dele no Gadit: com uma imagem, uma explicação no nível da criança e uma prática curta que traz a palavra de volta até ela ser dele de verdade. Abra o caderno no fim do mês e veja o vocabulário crescer, palavra por palavra.",
      },
      relief: {
        h1: "Pare de ser o dicionário da família",
        sub: "A partir de hoje, quando seu filho perguntar «o que isso quer dizer?», ele tem um único lugar para achar a resposta sozinho: cada significado, uma imagem para cada um e uma explicação no nível da criança. Sem chat aberto, sem anúncios.",
      },
      anxiety: {
        h1: "Seu filho lê cada palavra certinho, mas não entende de verdade",
        sub: "Nem sempre ele para para perguntar. Pula uma palavra que não entende, segue em frente, e a matéria não fixa. Com o tempo isso vira frustração com a escola e a sensação de «eu não consigo». O Gadit dá ao seu filho um único lugar para parar, entender de verdade e voltar para a lição com a palavra na mão.",
      },
      safe: {
        h1: "A única tela que você entrega para uma criança sem preocupação",
        sub: "Sem chat aberto. Sem feed sem fim. Sem anúncios. Um lugar limpo onde a criança digita uma palavra, entende por completo e volta para a lição de casa.",
      },
    },
    heroCta: "Comece seu teste grátis de 14 dias",
    heroTrust: "Sem chat aberto · Sem anúncios · Cancele com um clique",
    ownerCta: "Ir para o espaço da sua família",
    stats: ["30+ idiomas", "Uma imagem por significado", "Até 5 crianças", "Cancele com um clique"],
    demoKicker: "O resultado",
    demoTitle: "Seu filho entende cada palavra, e o vocabulário dele cresce todos os dias",
    painKicker: "A dor de verdade",
    painTitle: "Seu filho lê, mas nem sempre entende de verdade",
    painBody1: "Na verdade você fica feliz quando seu filho para para perguntar o que uma palavra quer dizer. O problema são todas as palavras que ele não para para perguntar. Ele pula, continua lendo, e a matéria não fixa. O vocabulário fica raso, e a compreensão se quebra palavra após palavra.",
    painBody2: "E isso mexe com muito mais do que uma nota. Uma criança que não entende se sente incapaz, se frustra com a escola e perde a confiança. E acontece em silêncio, sem que ninguém consiga apontar onde o fio se rompeu.",
    reframe: "E é exatamente aqui que o Gadit entra.",
    puzzleKicker: "O que acontece na cabeça da criança",
    puzzleTitle: "O texto é um quebra-cabeça. Cada palavra é uma peça.",
    puzzleBody: "Quando a criança lê, a mente dela monta uma imagem inteira a partir das palavras. Cada palavra que ela entende é uma peça que se encaixa. Cada palavra que falta é um buraco na imagem. Bastam três ou quatro buracos, e a criança já não enxerga a imagem, mesmo tendo soletrado cada letra.",
    puzzleBefore: "Um parágrafo com palavras faltando",
    puzzleAfter: "Com o Gadit, cada peça no lugar",
    puzzleLine: "Quando toda palavra está clara, a criança enxerga a imagem inteira.",
    chainKicker: "Como funciona",
    chainTitle: "Tudo o que seu filho recebe, em cada palavra",
    chainSteps: [
      "Seu filho digita uma palavra que não entende",
      "Ele recebe uma explicação no nível dele, uma imagem e três exemplos",
      "A palavra fica salva no caderno pessoal dele",
      "E volta em uma prática curta, até ser dele de verdade",
    ],
    howBlocks: [
      { t: "Digite a palavra", b: "Seu filho digita qualquer palavra que não entende, no Modo Kids, em um lugar limpo e seguro." },
      { t: "Uma definição clara", b: "Uma explicação no nível da criança, sem palavras difíceis explicando palavras difíceis." },
      { t: "Três exemplos", b: "Frases reais que mostram como a palavra vive dentro de um texto, não só uma definição seca." },
      { t: "Uma imagem para cada significado", b: "Porque as crianças lembram muito melhor do que veem do que do que está escrito para elas." },
      { t: "Contexto", b: "Cole uma frase do livro e o Gadit marca exatamente o significado que se encaixa nela." },
      { t: "Um caderno pessoal", b: "Cada palavra que seu filho pesquisou fica salva no caderno dele, e não foge." },
      { t: "Um quiz curto", b: "Uma pergunta rápida que traz a palavra de volta bem antes de ela escapar." },
      { t: "Um jogo", b: "Aprender brincando, com as palavras que seu filho mesmo pesquisou." },
    ],
    chainCost: "",
    chainTurnTitle: "E é isto que você ganha",
    chainTurnBody: "Cada palavra em que seu filho travou vira uma palavra que ele conhece, e você vê isso preto no branco: quantas palavras ele fechou, semana após semana. Em vez de torcer para que algo esteja melhorando, você simplesmente vê acontecer.",
    dashKicker: "O painel dos pais",
    dashTitle: "Você vê exatamente quanto cada criança aprendeu",
    dashBody: "Cada criança tem um caderno de palavras pessoal que cresce. No seu painel você vê, num olhar, quantas palavras cada criança aprendeu, quantas foram adicionadas nesta semana e as palavras mais recentes dela. Qualquer outra ferramenta responde seu filho e esquece. O Gadit lembra, e você vê o progresso semana após semana.",
    dashKids: [
      { name: "Noa", total: 47, week: 12 },
      { name: "Ido", total: 31, week: 8 },
      { name: "Maya", total: 63, week: 15 },
    ],
    dashWordsLabel: "palavras no caderno",
    dashWeekLabel: "nesta semana",
    featuresKicker: "O que tem dentro",
    features: [
      {
        kicker: "Cada significado",
        title: "Uma palavra. Todos os significados. Uma imagem para cada.",
        body: "Uma palavra costuma ter vários significados diferentes, e é aí que as crianças se confundem. O Gadit mostra todos em um só lugar, cada um com três exemplos reais e sua própria imagem, porque o cérebro da criança lembra imagens muito melhor do que palavras.",
      },
      {
        kicker: "Modo Kids",
        title: "Explicações no nível do seu filho",
        body: "Um toque, e cada explicação vira uma linguagem que uma criança de 8 anos entende de verdade. Sem palavras difíceis explicando palavras difíceis, sem definições em círculo. Só entendimento.",
      },
      {
        kicker: "Contexto",
        title: "Cole uma frase, receba o significado certo",
        body: "A maioria das palavras tem mais de um significado, e é aí que as crianças se perdem. Cole a frase do livro ou da atividade, e o Gadit marca exatamente qual significado se encaixa.",
      },
      {
        kicker: "Caderno pessoal",
        title: "As palavras não fogem",
        body: "Cada palavra que seu filho pesquisa vai parar no caderno pessoal dele, e uma prática curta e inteligente a traz de volta bem antes de ela escapar. É assim que o vocabulário se constrói de verdade, uma palavra de cada vez.",
      },
      {
        kicker: "Um perfil por criança",
        title: "Cada criança ganha o seu próprio espaço",
        body: "Cada criança da família ganha um perfil separado: o caderno dela, a prática dela, o histórico dela. O Modo Kids adapta a explicação, simples e clara para os pequenos e mais completa para os maiores, e ninguém pisa nas palavras de ninguém.",
      },
      {
        kicker: "Jogos de palavras",
        title: "Jogos de aprender com as palavras do seu filho",
        body: "Quizzes e jogos curtos montados com as palavras que seu filho realmente pesquisou. Alguns minutos de brincadeira, e o vocabulário cresce sem esforço.",
      },
      {
        kicker: "Segundo idioma",
        title: "O melhor apoio na lição de casa de um segundo idioma",
        body: "Seu filho digita uma palavra em inglês e recebe uma explicação simples no idioma dele, com imagem e exemplos. Sem ficar pulando entre dicionário, tradutor e YouTube.",
      },
    ],
    midCtaTitle: "Comece agora e veja o vocabulário do seu filho crescer dia após dia",
    midCta: "Comece seu teste grátis de 14 dias",
    compareKicker: "A diferença",
    compareTitle: "Por que não simplesmente pesquisar no Google ou perguntar a um chatbot?",
    compareGadit: "Gadit",
    compareOther: "A internet aberta",
    compareRows: [
      { label: "Uma página limpa por palavra", gadit: true, other: false },
      { label: "Explicações no nível da criança", gadit: true, other: false },
      { label: "Uma imagem para cada significado", gadit: true, other: false },
      { label: "Um caderno e uma prática que fixam", gadit: true, other: false },
      { label: "Anúncios e links em toda direção", gadit: false, other: true },
      { label: "Chat aberto sem limites", gadit: false, other: true },
    ],
    safeTitle: "Uma zona separada e limpa. Não uma porta para nenhum outro lugar.",
    safeBody: "O Gadit é um espaço totalmente fechado: sem chat aberto, sem feed, sem anúncios, sem links para fora. A criança não é puxada daqui para o TikTok nem para nenhum outro app. Aqui há uma única coisa a fazer: entender uma palavra e voltar a estudar.",
    safeLine: "Uma tela que você entrega para a criança com a cabeça tranquila.",
    stackTitle: "O que o plano Família inclui",
    stackItems: [
      "Buscas ilimitadas para a família toda",
      "Cada significado, com uma imagem para cada um",
      "Modo Kids para todas as idades",
      "Verificação de frases com retorno na hora",
      "Um caderno pessoal e prática inteligente por criança",
      "Jogos de palavras e quizzes",
      "Até 5 crianças com perfis separados",
      "30+ idiomas com suporte completo",
    ],
    priceKicker: "Preços",
    priceTitle: "O plano Família",
    trialBadge: "Teste grátis de 14 dias",
    yearly: "$59 / ano",
    yearlyNote: "isso dá $4.92 por mês para a família toda, e economiza quase dois meses em comparação com o pagamento mensal",
    priceAnchor: "Menos do que uma aula particular, por um ano inteiro, para cada criança de casa",
    monthly: "$5.99 / mês",
    billedYearly: "Anual",
    billedMonthly: "Mensal",
    yearlySave: "-18%",
    priceCta: "Começar o teste",
    cancelNote: "A primeira cobrança só depois dos 14 dias. Cancele quando quiser na página da sua conta, com um clique.",
    singleChild: "Só um aluno em casa? O Deep custa $4.99/mês. Por um pouco mais você adiciona até 5 crianças.",
    guaranteeTitle: "Seu teste: duas semanas",
    guaranteeBody: "Dê duas semanas de uso real, de graça. Se, até o dia 14, o caderno do seu filho não tiver reunido pelo menos 20 palavras novas, cancele com um clique e você não pagou nada.",
    faqTitle: "Perguntas que os pais fazem",
    faq: [
      {
        q: "O que eu recebo com o Gadit?",
        a: "Cada palavra que seu filho pesquisa ganha uma página limpa: cada significado, uma explicação no nível da criança (Modo Kids), três exemplos reais e uma imagem por significado. Além de contexto (cole uma frase e receba o significado certo), um caderno de palavras pessoal com prática inteligente, jogos de palavras e quizzes, um painel dos pais mostrando quanto cada criança aprendeu, até 5 crianças em perfis separados, tudo em 30+ idiomas, em um espaço fechado e seguro, sem chat aberto e sem anúncios.",
      },
      {
        q: "Por que não simplesmente perguntar a um chatbot ou pesquisar no Google?",
        a: "Porque essas são ferramentas para adultos. O Google devolve anúncios e links em toda direção, e um chatbot aberto é uma conversa sem limites em que nenhum pai deixa uma criança sozinha. O Gadit é construído ao contrário: uma página fechada e limpa por palavra, no nível da criança, sem jeito de se perder.",
      },
      {
        q: "Como eu sei que meu filho está realmente progredindo?",
        a: "Você ganha um painel dos pais. Num olhar você vê quantas palavras cada criança aprendeu, quantas foram adicionadas nesta semana e as palavras mais recentes. Toda outra ferramenta responde a criança e esquece; o Gadit salva cada palavra no caderno pessoal da criança, então você vê o vocabulário crescer semana após semana.",
      },
      {
        q: "Para quais idades é?",
        a: "O coração do Gadit são crianças em idade escolar, do primeiro ano ao ensino médio. O Modo Kids explica de forma simples para os pequenos, e as explicações completas servem também para adolescentes e pais. O responsável abre a conta.",
      },
      {
        q: "Ajuda com inglês e outros idiomas?",
        a: "E muito. A criança pode pesquisar uma palavra em inglês e receber uma explicação simples no idioma dela, com imagem e exemplos, exatamente o apoio que faltava em casa. E funciona em 30+ idiomas, então a criança pode receber a explicação também no idioma que você fala em casa.",
      },
      {
        q: "Quanto custa?",
        a: "$59 por ano ou $5.99 por mês, depois do teste de 14 dias. Sem taxas escondidas, e você cancela quando quiser com um clique.",
      },
      {
        q: "Quantas crianças posso adicionar?",
        a: "Até 5 crianças em um plano Família, cada uma com seu próprio perfil, caderno e prática.",
      },
      {
        q: "Dá para experimentar sem compromisso?",
        a: "Dá. O teste começa com um cartão, mas a primeira cobrança só acontece quando os 14 dias terminam. Cancele quando quiser antes disso, com um clique, e você não paga nada.",
      },
    ],
    finalTitle: "Comece hoje e veja o vocabulário crescer",
    finalSub: "Duas semanas grátis. Cancelamento com um clique. E uma criança que aprende a entender palavras sozinha.",
    finalCta: "Comece seu teste grátis de 14 dias",
    footerTerms: "Termos",
    footerPrivacy: "Privacidade",
  },
  fr: {
    heroBadge: "Un dictionnaire visuel et intelligent pour toute la famille",
    whatIs: "Gadit est un dictionnaire visuel et intelligent pour les enfants : chaque mot reçoit une explication à hauteur d'enfant, une image, des exemples, ainsi que des jeux et des quiz qui rendent l'apprentissage des mots amusant. Le vocabulaire s'enrichit, la compréhension de lecture progresse, et votre enfant réussit mieux à l'école.",
    ctaMicro: "",
    trustLine: "Jusqu'à 5 enfants, chacun à son niveau",
    credLine: "Fondé sur 15 ans d'expérience auprès de plus de 15 000 parents, élèves et enseignants",
    credKicker: "Qui nous sommes",
    credTitle: "15 ans dans l'éducation. Aujourd'hui réunis dans un seul outil pour votre enfant.",
    credBody: "Gadit a été créé par une équipe forte de 15 ans d'expérience dans l'éducation, qui a accompagné plus de 15 000 parents, élèves et enseignants. Ce qui fonctionnait encore et encore, en classe comme à la maison, nous l'avons réuni dans un outil simple qu'un enfant peut utiliser seul.",
    proofTitle: "Carnet de mots · exemple",
    proofBig: "12 nouveaux mots cette semaine",
    proofWords: ["rêve", "vif", "réticent"],
    angles: {
      vocab: {
        h1: "Le vocabulaire de votre enfant s'enrichit. Mot après mot.",
        sub: "Chaque mot sur lequel votre enfant s'interroge arrive dans son carnet de mots personnel dans Gadit : avec une image, une explication à hauteur d'enfant et un court exercice qui le fait revenir jusqu'à ce qu'il soit vraiment acquis. Ouvrez le carnet à la fin du mois et regardez le vocabulaire grandir, mot après mot.",
      },
      relief: {
        h1: "Arrêtez d'être le dictionnaire de la famille",
        sub: "Dès aujourd'hui, quand votre enfant demande «c'est quoi ça?», il a un seul endroit pour trouver la réponse tout seul : chaque sens, une image pour chacun, et une explication à hauteur d'enfant. Pas de chat ouvert, pas de publicité.",
      },
      anxiety: {
        h1: "Votre enfant lit chaque mot correctement, mais ne comprend pas vraiment",
        sub: "Il ne s'arrête pas toujours pour demander. Il saute un mot qu'il ne comprend pas, poursuit sa lecture, et la matière ne rentre pas. Avec le temps, cela se transforme en frustration face à l'école et en un sentiment de «je n'y arrive pas». Gadit offre à votre enfant un seul endroit pour s'arrêter, comprendre vraiment, et revenir à la leçon avec le mot bien en main.",
      },
      safe: {
        h1: "Le seul écran que vous pouvez confier à un enfant sans inquiétude",
        sub: "Pas de chat ouvert. Pas de fil sans fin. Pas de publicité. Un seul endroit épuré où l'enfant tape un mot, le comprend entièrement, et retourne à ses devoirs.",
      },
    },
    heroCta: "Commencez votre essai gratuit de 14 jours",
    heroTrust: "Pas de chat ouvert · Pas de publicité · Annulez en un clic",
    ownerCta: "Accéder à votre espace famille",
    stats: ["30+ langues", "Une image par sens", "Jusqu'à 5 enfants", "Annulez en un clic"],
    demoKicker: "Le résultat",
    demoTitle: "Votre enfant comprend chaque mot, et son vocabulaire s'enrichit chaque jour",
    painKicker: "La vraie difficulté",
    painTitle: "Votre enfant lit, mais ne comprend pas toujours vraiment",
    painBody1: "En réalité, vous êtes content quand votre enfant s'arrête pour demander le sens d'un mot. Le problème, ce sont tous les mots sur lesquels il ne s'arrête pas. Il les saute, continue à lire, et la matière ne rentre pas. Le vocabulaire reste pauvre, et la compréhension se brise mot après mot.",
    painBody2: "Et cela touche bien plus qu'une note. Un enfant qui ne comprend pas se sent pas assez bon, se décourage face à l'école, et perd confiance. Et cela se produit en silence, sans que personne ne puisse pointer l'endroit où le fil s'est rompu.",
    reframe: "Et c'est précisément là que Gadit intervient.",
    puzzleKicker: "Ce qui se passe dans la tête d'un enfant",
    puzzleTitle: "Un texte est un puzzle. Chaque mot est une pièce.",
    puzzleBody: "Quand un enfant lit, son esprit assemble une image complète à partir des mots. Chaque mot qu'il comprend est une pièce qui se met en place. Chaque mot manquant est un trou dans l'image. Trois ou quatre trous seulement, et l'enfant ne voit plus l'image, même s'il a déchiffré chaque lettre.",
    puzzleBefore: "Un paragraphe avec des mots manquants",
    puzzleAfter: "Avec Gadit, chaque pièce à sa place",
    puzzleLine: "Quand chaque mot est clair, l'enfant voit l'image entière.",
    chainKicker: "Comment ça marche",
    chainTitle: "Tout ce que votre enfant reçoit, sur chaque mot",
    chainSteps: [
      "Votre enfant tape un mot qu'il ne comprend pas",
      "Il reçoit une explication à sa hauteur, une image et trois exemples",
      "Le mot est enregistré dans son carnet personnel",
      "Et il revient dans un court exercice, jusqu'à ce qu'il soit vraiment acquis",
    ],
    howBlocks: [
      { t: "Taper le mot", b: "Votre enfant tape n'importe quel mot qu'il ne comprend pas, en Mode Enfant, dans un endroit épuré et sûr." },
      { t: "Une définition claire", b: "Une explication à hauteur d'enfant, sans mots difficiles pour expliquer des mots difficiles." },
      { t: "Trois exemples", b: "De vraies phrases qui montrent comment le mot vit à l'intérieur d'un texte, pas seulement une définition sèche." },
      { t: "Une image pour chaque sens", b: "Parce que les enfants retiennent bien mieux ce qu'ils voient que ce qu'on leur écrit." },
      { t: "Le contexte", b: "Collez une phrase tirée du livre et Gadit repère exactement le sens qui lui correspond." },
      { t: "Un carnet personnel", b: "Chaque mot que votre enfant a cherché est enregistré dans son carnet, et ne s'échappe pas." },
      { t: "Un court quiz", b: "Une question rapide qui ramène le mot juste avant qu'il ne s'efface." },
      { t: "Un jeu", b: "Apprendre en jouant, à partir des mots que votre enfant a cherchés lui-même." },
    ],
    chainCost: "",
    chainTurnTitle: "Et voici ce que vous obtenez",
    chainTurnBody: "Chaque mot sur lequel votre enfant a buté devient un mot qu'il connaît, et vous le voyez noir sur blanc : combien de mots il a maîtrisés, semaine après semaine. Au lieu d'espérer que quelque chose s'améliore, vous le voyez simplement se produire.",
    dashKicker: "Le tableau de bord parent",
    dashTitle: "Vous voyez exactement combien chaque enfant a appris",
    dashBody: "Chaque enfant possède un carnet de mots personnel qui grandit. Dans votre tableau de bord, vous voyez d'un coup d'œil combien de mots chaque enfant a appris, combien ont été ajoutés cette semaine, et ses mots les plus récents. N'importe quel autre outil répond à votre enfant puis oublie. Gadit se souvient, et vous voyez les progrès semaine après semaine.",
    dashKids: [
      { name: "Noa", total: 47, week: 12 },
      { name: "Ido", total: 31, week: 8 },
      { name: "Maya", total: 63, week: 15 },
    ],
    dashWordsLabel: "mots dans le carnet",
    dashWeekLabel: "cette semaine",
    featuresKicker: "Ce qu'il y a à l'intérieur",
    features: [
      {
        kicker: "Chaque sens",
        title: "Un mot. Tous ses sens. Une image pour chacun.",
        body: "Un mot a souvent plusieurs sens différents, et c'est là que les enfants se perdent. Gadit les montre tous au même endroit, chacun avec trois exemples réels et sa propre image, parce que le cerveau d'un enfant retient bien mieux les images que les mots.",
      },
      {
        kicker: "Mode Enfant",
        title: "Des explications à hauteur de votre enfant",
        body: "Un simple bouton, et chaque explication se transforme en un langage qu'un enfant de 8 ans comprend vraiment. Pas de mots difficiles pour expliquer des mots difficiles, pas de définitions circulaires. Juste de la compréhension.",
      },
      {
        kicker: "Le contexte",
        title: "Collez une phrase, obtenez le bon sens",
        body: "La plupart des mots ont plus d'un sens, et c'est là que les enfants se perdent. Collez la phrase tirée du livre ou de la fiche d'exercices, et Gadit repère exactement quel sens correspond.",
      },
      {
        kicker: "Carnet personnel",
        title: "Les mots ne s'échappent pas",
        body: "Chaque mot que votre enfant cherche arrive dans son carnet personnel, et un court exercice intelligent le ramène juste avant qu'il ne s'efface. C'est ainsi qu'on construit vraiment le vocabulaire, un mot à la fois.",
      },
      {
        kicker: "Un profil par enfant",
        title: "Chaque enfant a son propre espace",
        body: "Chaque enfant de la famille reçoit un profil distinct : son carnet, ses exercices, son historique. Le Mode Enfant adapte l'explication, simple et claire pour les plus petits et plus complète pour les plus grands, et personne n'empiète sur les mots de personne.",
      },
      {
        kicker: "Jeux de mots",
        title: "Des jeux d'apprentissage sur les mots de votre enfant",
        body: "De courts quiz et jeux construits à partir des mots que votre enfant a réellement cherchés. Quelques minutes de jeu, et le vocabulaire s'enrichit sans effort.",
      },
      {
        kicker: "Langue seconde",
        title: "Le meilleur assistant de devoirs pour une langue seconde",
        body: "Votre enfant tape un mot en anglais et reçoit une explication simple dans sa propre langue, avec une image et des exemples. Fini de naviguer entre un dictionnaire, un traducteur et YouTube.",
      },
    ],
    midCtaTitle: "Commencez maintenant, et regardez le vocabulaire de votre enfant s'enrichir jour après jour",
    midCta: "Commencez votre essai gratuit de 14 jours",
    compareKicker: "La différence",
    compareTitle: "Pourquoi ne pas simplement chercher sur Google ou demander à un chatbot?",
    compareGadit: "Gadit",
    compareOther: "Internet ouvert",
    compareRows: [
      { label: "Une page épurée par mot", gadit: true, other: false },
      { label: "Des explications à hauteur d'enfant", gadit: true, other: false },
      { label: "Une image pour chaque sens", gadit: true, other: false },
      { label: "Un carnet et des exercices qui restent", gadit: true, other: false },
      { label: "Des publicités et des liens dans tous les sens", gadit: false, other: true },
      { label: "Une conversation sans limites", gadit: false, other: true },
    ],
    safeTitle: "Un espace à part, épuré. Pas une porte vers ailleurs.",
    safeBody: "Gadit est un espace entièrement fermé : pas de chat ouvert, pas de fil, pas de publicité, pas de liens sortants. Un enfant n'est pas entraîné d'ici vers TikTok ou une autre appli. Il n'y a qu'une seule chose à faire ici : comprendre un mot, et revenir à ses études.",
    safeLine: "Un écran que vous pouvez confier à un enfant l'esprit tranquille.",
    stackTitle: "Ce que comprend le forfait Famille",
    stackItems: [
      "Recherches illimitées pour toute la famille",
      "Chaque sens, avec une image pour chacun",
      "Le Mode Enfant pour tous les âges",
      "Vérification de phrase avec retour instantané",
      "Un carnet personnel et des exercices intelligents par enfant",
      "Jeux de mots et quiz",
      "Jusqu'à 5 enfants avec des profils distincts",
      "30+ langues entièrement prises en charge",
    ],
    priceKicker: "Tarifs",
    priceTitle: "Le forfait Famille",
    trialBadge: "Essai gratuit de 14 jours",
    yearly: "$59 / an",
    yearlyNote: "soit $4.92 par mois pour toute la famille, ce qui vous fait économiser près de deux mois par rapport au paiement mensuel",
    priceAnchor: "Moins qu'une seule séance de cours particulier, pour une année entière, pour chaque enfant à la maison",
    monthly: "$5.99 / mois",
    billedYearly: "Annuel",
    billedMonthly: "Mensuel",
    yearlySave: "-18%",
    priceCta: "Commencer l'essai",
    cancelNote: "Premier prélèvement seulement après les 14 jours. Annulez à tout moment depuis votre page de compte, en un clic.",
    singleChild: "Un seul élève à la maison? Deep est à $4.99/mois. Pour un peu plus, vous pouvez ajouter jusqu'à 5 enfants.",
    guaranteeTitle: "Votre test : deux semaines",
    guaranteeBody: "Faites un vrai essai de deux semaines, gratuitement. Si au 14e jour le carnet de votre enfant n'a pas rassemblé au moins 20 nouveaux mots, annulez en un clic et vous n'avez rien payé.",
    faqTitle: "Les questions que les parents posent",
    faq: [
      {
        q: "Qu'est-ce que j'obtiens avec Gadit?",
        a: "Chaque mot que votre enfant cherche reçoit une page épurée : chaque sens, une explication à hauteur d'enfant (Mode Enfant), trois exemples réels, et une image par sens. Plus le contexte (collez une phrase et obtenez le bon sens), un carnet de mots personnel avec des exercices intelligents, des jeux de mots et des quiz, un tableau de bord parent montrant combien chaque enfant a appris, jusqu'à 5 enfants sur des profils distincts, le tout en 30+ langues, dans un espace fermé et sûr, sans chat ouvert et sans publicité.",
      },
      {
        q: "Pourquoi ne pas simplement demander à un chatbot ou à Google?",
        a: "Parce que ce sont des outils pour adultes. Google renvoie des publicités et des liens dans tous les sens, et un chatbot ouvert est une conversation sans limites dans laquelle aucun parent ne laisse un enfant seul. Gadit est conçu à l'inverse : une page fermée et épurée par mot, à hauteur d'enfant, sans aucun moyen de se perdre.",
      },
      {
        q: "Comment savoir si mon enfant progresse vraiment?",
        a: "Vous avez un tableau de bord parent. D'un coup d'œil, vous voyez combien de mots chaque enfant a appris, combien ont été ajoutés cette semaine, et ses derniers mots. Tout autre outil répond à l'enfant puis oublie ; Gadit enregistre chaque mot dans le carnet personnel de l'enfant, pour que vous voyiez le vocabulaire grandir semaine après semaine.",
      },
      {
        q: "Pour quels âges est-ce fait?",
        a: "Le cœur de Gadit, ce sont les enfants d'âge scolaire, de la première année du primaire jusqu'au lycée. Le Mode Enfant explique simplement pour les plus jeunes, et les explications complètes servent aussi aux adolescents et aux parents. C'est le parent qui ouvre le compte.",
      },
      {
        q: "Est-ce que ça aide pour l'anglais et d'autres langues?",
        a: "Énormément. Un enfant peut chercher un mot en anglais et obtenir une explication simple dans sa propre langue, avec une image et des exemples, exactement l'aide qui manque à la maison. Et cela fonctionne en 30+ langues, pour que l'enfant puisse aussi recevoir l'explication dans la langue que vous parlez à la maison.",
      },
      {
        q: "Combien ça coûte?",
        a: "$59 par an ou $5.99 par mois, après l'essai de 14 jours. Pas de frais cachés, et vous annulez à tout moment en un clic.",
      },
      {
        q: "Combien d'enfants puis-je ajouter?",
        a: "Jusqu'à 5 enfants sur un seul forfait Famille, chacun avec son propre profil, son carnet et ses exercices.",
      },
      {
        q: "Peut-on l'essayer sans s'engager?",
        a: "Oui. L'essai commence avec une carte, mais le premier prélèvement n'a lieu qu'à la fin des 14 jours. Annulez à tout moment avant cela, en un clic, et vous ne payez rien.",
      },
    ],
    finalTitle: "Commencez aujourd'hui, et regardez le vocabulaire grandir",
    finalSub: "Deux semaines gratuites. Annulation en un clic. Et un enfant qui apprend à comprendre les mots tout seul.",
    finalCta: "Commencez votre essai gratuit de 14 jours",
    footerTerms: "Conditions",
    footerPrivacy: "Confidentialité",
  },
  de: {
    heroBadge: "Ein visuelles, smartes Wörterbuch für die ganze Familie",
    whatIs: "Gadit ist ein smartes, visuelles Wörterbuch für Kinder: Zu jedem Wort gibt es eine kindgerechte Erklärung, ein Bild, Beispiele sowie Spiele und Quizze, die das Wörterlernen zum Vergnügen machen. Der Wortschatz wächst, das Leseverständnis wird besser, und Ihr Kind kommt in der Schule leichter mit.",
    ctaMicro: "",
    trustLine: "Bis zu 5 Kinder, jedes auf seinem eigenen Niveau",
    credLine: "Aufgebaut auf 15 Jahren Erfahrung mit mehr als 15.000 Eltern, Schülern und Pädagogen",
    credKicker: "Wer wir sind",
    credTitle: "15 Jahre in der Bildung. Jetzt in einem Werkzeug für Ihr Kind.",
    credBody: "Gadit wurde von einem Team mit 15 Jahren Erfahrung in der Bildung entwickelt, das mit mehr als 15.000 Eltern, Schülern und Pädagogen gearbeitet hat. Was wir immer wieder erfolgreich erlebt haben, im Klassenzimmer und zu Hause, haben wir in ein einfaches Werkzeug gepackt, das ein Kind ganz allein bedienen kann.",
    proofTitle: "Wörterheft · Beispiel",
    proofBig: "12 neue Wörter diese Woche",
    proofWords: ["Traum", "lebhaft", "zögerlich"],
    angles: {
      vocab: {
        h1: "Der Wortschatz Ihres Kindes wächst. Wort für Wort.",
        sub: "Jedes Wort, nach dem Ihr Kind fragt, landet in seinem persönlichen Wörterheft in Gadit: mit einem Bild, einer kindgerechten Erklärung und kurzen Übungen, die es immer wieder zurückholen, bis es sitzt. Öffnen Sie das Heft am Monatsende und sehen Sie zu, wie der Wortschatz wächst, Wort für Wort.",
      },
      relief: {
        h1: "Sie müssen nicht länger das Familienwörterbuch sein",
        sub: "Ab heute hat Ihr Kind einen einzigen Ort, an dem es die Antwort selbst findet, wenn es fragt „Was bedeutet das?“: jede Bedeutung, ein Bild zu jeder einzelnen, und eine Erklärung auf Kinderniveau. Kein offener Chat, keine Werbung.",
      },
      anxiety: {
        h1: "Ihr Kind liest jedes Wort richtig, versteht es aber nicht wirklich",
        sub: "Es hält nicht immer inne, um zu fragen. Es überspringt ein Wort, das es nicht versteht, liest weiter, und der Stoff bleibt nicht hängen. Mit der Zeit wird daraus Frust mit der Schule und das Gefühl „Das schaffe ich nicht“. Gadit gibt Ihrem Kind einen Ort, an dem es innehalten, wirklich verstehen und mit dem Wort in der Hand zur Aufgabe zurückkehren kann.",
      },
      safe: {
        h1: "Der eine Bildschirm, den Sie einem Kind ohne Sorge geben können",
        sub: "Kein offener Chat. Kein endloser Feed. Keine Werbung. Ein einziger, klarer Ort, an dem ein Kind ein Wort eintippt, es vollständig versteht und zu den Hausaufgaben zurückkehrt.",
      },
    },
    heroCta: "Starten Sie Ihre 14-tägige kostenlose Testphase",
    heroTrust: "Kein offener Chat · Keine Werbung · Kündbar mit einem Klick",
    ownerCta: "Zu Ihrem Familienbereich",
    stats: ["30+ Sprachen", "Ein Bild pro Bedeutung", "Bis zu 5 Kinder", "Kündbar mit einem Klick"],
    demoKicker: "Das Ergebnis",
    demoTitle: "Ihr Kind versteht jedes Wort, und sein Wortschatz wächst jeden Tag",
    painKicker: "Der wahre Schmerz",
    painTitle: "Ihr Kind liest, versteht aber nicht immer wirklich",
    painBody1: "Eigentlich sind Sie froh, wenn Ihr Kind innehält und fragt, was ein Wort bedeutet. Das Problem sind all die Wörter, bei denen es nicht innehält und fragt. Es überspringt sie, liest weiter, und der Stoff bleibt nicht hängen. Der Wortschatz bleibt dünn, und das Verständnis bricht Wort für Wort auseinander.",
    painBody2: "Und das betrifft weit mehr als eine Note. Ein Kind, das nicht versteht, fühlt sich nicht gut genug, ist frustriert mit der Schule und verliert das Selbstvertrauen. Und das geschieht leise, ohne dass jemand sagen könnte, wo der Faden gerissen ist.",
    reframe: "Und genau hier kommt Gadit ins Spiel.",
    puzzleKicker: "Was im Kopf eines Kindes passiert",
    puzzleTitle: "Ein Text ist ein Puzzle. Jedes Wort ist ein Teil.",
    puzzleBody: "Wenn ein Kind liest, setzt sein Kopf aus den Wörtern ein ganzes Bild zusammen. Jedes Wort, das es versteht, ist ein Teil, das an seinen Platz rutscht. Jedes fehlende Wort ist ein Loch im Bild. Nur drei oder vier Löcher, und das Kind sieht das Bild nicht mehr, selbst wenn es jeden Buchstaben laut vorgelesen hat.",
    puzzleBefore: "Ein Absatz mit fehlenden Wörtern",
    puzzleAfter: "Mit Gadit sitzt jedes Teil an seinem Platz",
    puzzleLine: "Wenn jedes Wort klar ist, sieht das Kind das ganze Bild.",
    chainKicker: "So funktioniert es",
    chainTitle: "Alles, was Ihr Kind bekommt, zu jedem Wort",
    chainSteps: [
      "Ihr Kind tippt ein Wort ein, das es nicht versteht",
      "Es bekommt eine Erklärung auf seiner Augenhöhe, ein Bild und drei Beispiele",
      "Das Wort wird in seinem persönlichen Heft gespeichert",
      "Und kommt in kurzen Übungen zurück, bis es wirklich sitzt",
    ],
    howBlocks: [
      { t: "Das Wort eintippen", b: "Ihr Kind tippt jedes Wort ein, das es nicht versteht, im Kindermodus, an einem klaren und sicheren Ort." },
      { t: "Eine klare Definition", b: "Eine Erklärung auf Augenhöhe des Kindes, keine schweren Wörter, die schwere Wörter erklären." },
      { t: "Drei Beispiele", b: "Echte Sätze, die zeigen, wie das Wort in einem Text lebt, nicht nur eine trockene Definition." },
      { t: "Ein Bild zu jeder Bedeutung", b: "Weil Kinder sich viel besser an das erinnern, was sie sehen, als an das, was ihnen geschrieben wird." },
      { t: "Kontext", b: "Fügen Sie einen Satz aus dem Buch ein, und Gadit markiert genau die Bedeutung, die passt." },
      { t: "Ein persönliches Heft", b: "Jedes Wort, das Ihr Kind nachgeschlagen hat, wird in seinem Heft gespeichert und läuft nicht davon." },
      { t: "Ein kurzes Quiz", b: "Eine schnelle Frage, die das Wort zurückholt, kurz bevor es entgleitet." },
      { t: "Ein Spiel", b: "Lernen durch Spielen, mit den Wörtern, die Ihr Kind selbst nachgeschlagen hat." },
    ],
    chainCost: "",
    chainTurnTitle: "Und das bekommen Sie dabei heraus",
    chainTurnBody: "Jedes Wort, an dem Ihr Kind hängengeblieben ist, wird zu einem Wort, das es kennt, und Sie sehen es schwarz auf weiß: wie viele Wörter es abgeschlossen hat, Woche für Woche. Statt zu hoffen, dass sich etwas verbessert, sehen Sie einfach zu, wie es passiert.",
    dashKicker: "Das Eltern-Dashboard",
    dashTitle: "Sie sehen genau, wie viel jedes Kind gelernt hat",
    dashBody: "Jedes Kind hat ein persönliches Wörterheft, das wächst. In Ihrem Dashboard sehen Sie auf einen Blick, wie viele Wörter jedes Kind gelernt hat, wie viele diese Woche dazugekommen sind und seine neuesten Wörter. Jedes andere Werkzeug antwortet Ihrem Kind und vergisst es dann. Gadit merkt es sich, und Sie sehen den Fortschritt Woche für Woche.",
    dashKids: [
      { name: "Noa", total: 47, week: 12 },
      { name: "Ido", total: 31, week: 8 },
      { name: "Maya", total: 63, week: 15 },
    ],
    dashWordsLabel: "Wörter im Heft",
    dashWeekLabel: "diese Woche",
    featuresKicker: "Was drinsteckt",
    features: [
      {
        kicker: "Jede Bedeutung",
        title: "Ein Wort. Jede Bedeutung. Ein Bild zu jeder.",
        body: "Ein Wort hat oft mehrere verschiedene Bedeutungen, und genau da geraten Kinder durcheinander. Gadit zeigt sie alle an einem Ort, jede mit drei echten Beispielen und ihrem eigenen Bild, denn das Gehirn eines Kindes merkt sich Bilder viel besser als Wörter.",
      },
      {
        kicker: "Kindermodus",
        title: "Erklärungen auf Augenhöhe Ihres Kindes",
        body: "Ein Schalter, und jede Erklärung wird zu einer Sprache, die ein Achtjähriger wirklich versteht. Keine schweren Wörter, die schwere Wörter erklären, keine Definitionen, die sich im Kreis drehen. Einfach Verständnis.",
      },
      {
        kicker: "Kontext",
        title: "Einen Satz einfügen, die richtige Bedeutung erhalten",
        body: "Die meisten Wörter haben mehr als eine Bedeutung, und genau da verlieren Kinder den Faden. Fügen Sie den Satz aus dem Buch oder Arbeitsblatt ein, und Gadit markiert genau, welche Bedeutung passt.",
      },
      {
        kicker: "Persönliches Heft",
        title: "Die Wörter laufen nicht davon",
        body: "Jedes Wort, das Ihr Kind nachschlägt, landet in seinem persönlichen Heft, und kurze, smarte Übungen holen es zurück, kurz bevor es entgleitet. So wird Wortschatz wirklich aufgebaut, ein Wort nach dem anderen.",
      },
      {
        kicker: "Ein Profil pro Kind",
        title: "Jedes Kind bekommt seinen eigenen Bereich",
        body: "Jedes Kind in der Familie bekommt ein eigenes Profil: sein Heft, seine Übungen, seinen Verlauf. Der Kindermodus passt die Erklärung an, einfach und klar für die Kleinen und ausführlicher für die Älteren, und niemand kommt den Wörtern eines anderen in die Quere.",
      },
      {
        kicker: "Wortspiele",
        title: "Lernspiele mit den Wörtern Ihres Kindes",
        body: "Kurze Quizze und Spiele, gebaut aus den Wörtern, die Ihr Kind tatsächlich nachgeschlagen hat. Ein paar Minuten Spiel, und der Wortschatz wächst ganz mühelos.",
      },
      {
        kicker: "Zweite Sprache",
        title: "Der beste Hausaufgabenhelfer für eine zweite Sprache",
        body: "Ihr Kind tippt ein Wort auf Englisch ein und bekommt eine einfache Erklärung in seiner eigenen Sprache, mit Bild und Beispielen. Kein Hin und Her zwischen Wörterbuch, Übersetzer und YouTube.",
      },
    ],
    midCtaTitle: "Legen Sie jetzt los und sehen Sie zu, wie der Wortschatz Ihres Kindes Tag für Tag wächst",
    midCta: "Starten Sie Ihre 14-tägige kostenlose Testphase",
    compareKicker: "Der Unterschied",
    compareTitle: "Warum nicht einfach googeln oder einen Chatbot fragen?",
    compareGadit: "Gadit",
    compareOther: "Das offene Internet",
    compareRows: [
      { label: "Eine klare Seite pro Wort", gadit: true, other: false },
      { label: "Erklärungen auf Kinderniveau", gadit: true, other: false },
      { label: "Ein Bild zu jeder Bedeutung", gadit: true, other: false },
      { label: "Ein Heft und Übungen, die hängen bleiben", gadit: true, other: false },
      { label: "Werbung und Links in alle Richtungen", gadit: false, other: true },
      { label: "Offener Chat ohne Grenzen", gadit: false, other: true },
    ],
    safeTitle: "Ein eigener, klarer Bereich. Keine Tür zu irgendwo sonst.",
    safeBody: "Gadit ist ein vollständig geschlossener Raum: kein offener Chat, kein Feed, keine Werbung, keine ausgehenden Links. Ein Kind wird von hier nicht zu TikTok oder einer anderen App gezogen. Es gibt hier nur eine Sache zu tun: ein Wort verstehen und zum Lernen zurückkehren.",
    safeLine: "Ein Bildschirm, den Sie einem Kind mit ruhigem Gewissen geben können.",
    stackTitle: "Was im Familientarif enthalten ist",
    stackItems: [
      "Unbegrenzte Suchen für die ganze Familie",
      "Jede Bedeutung, mit einem Bild zu jeder",
      "Kindermodus für jedes Alter",
      "Satzprüfung mit sofortiger Rückmeldung",
      "Ein persönliches Heft und smarte Übungen pro Kind",
      "Wortspiele und Quizze",
      "Bis zu 5 Kinder mit eigenen Profilen",
      "30+ Sprachen mit voller Unterstützung",
    ],
    priceKicker: "Preise",
    priceTitle: "Der Familientarif",
    trialBadge: "14 Tage kostenlos testen",
    yearly: "$59 / Jahr",
    yearlyNote: "das sind $4.92 im Monat für die ganze Familie und spart Ihnen fast zwei Monate gegenüber der monatlichen Zahlung",
    priceAnchor: "Weniger als eine einzige Nachhilfestunde, für ein ganzes Jahr, für jedes Kind zu Hause",
    monthly: "$5.99 / Monat",
    billedYearly: "Jährlich",
    billedMonthly: "Monatlich",
    yearlySave: "-18%",
    priceCta: "Testphase starten",
    cancelNote: "Erste Abbuchung erst nach den 14 Tagen. Jederzeit kündbar über Ihre Kontoseite, mit einem Klick.",
    singleChild: "Nur ein Schüler zu Hause? Deep kostet $4.99/Monat. Für etwas mehr können Sie bis zu 5 Kinder hinzufügen.",
    guaranteeTitle: "Ihr Test: zwei Wochen",
    guaranteeBody: "Geben Sie ihm zwei Wochen echten Gebrauch, kostenlos. Wenn das Heft Ihres Kindes bis zum 14. Tag nicht mindestens 20 neue Wörter gesammelt hat, kündigen Sie mit einem Klick und haben nichts bezahlt.",
    faqTitle: "Fragen, die Eltern stellen",
    faq: [
      {
        q: "Was bekomme ich mit Gadit?",
        a: "Jedes Wort, das Ihr Kind nachschlägt, bekommt eine klare Seite: jede Bedeutung, eine kindgerechte Erklärung (Kindermodus), drei echte Beispiele und ein Bild pro Bedeutung. Dazu Kontext (einen Satz einfügen und die richtige Bedeutung erhalten), ein persönliches Wörterheft mit smarten Übungen, Wortspiele und Quizze, ein Eltern-Dashboard, das zeigt, wie viel jedes Kind gelernt hat, bis zu 5 Kinder auf eigenen Profilen, alles in 30+ Sprachen, in einem geschlossenen, sicheren Raum ohne offenen Chat und ohne Werbung.",
      },
      {
        q: "Warum nicht einfach einen Chatbot fragen oder googeln?",
        a: "Weil das Werkzeuge für Erwachsene sind. Google liefert Werbung und Links in alle Richtungen, und ein offener Chatbot ist ein grenzenloses Gespräch, in dem kein Elternteil ein Kind allein lässt. Gadit ist andersherum gebaut: eine geschlossene, klare Seite pro Wort, auf Kinderniveau, ohne die Möglichkeit, sich zu verlieren.",
      },
      {
        q: "Woher weiß ich, dass mein Kind wirklich Fortschritte macht?",
        a: "Sie bekommen ein Eltern-Dashboard. Auf einen Blick sehen Sie, wie viele Wörter jedes Kind gelernt hat, wie viele diese Woche dazugekommen sind und seine neuesten Wörter. Jedes andere Werkzeug antwortet dem Kind und vergisst es dann; Gadit speichert jedes Wort im persönlichen Heft des Kindes, sodass Sie zusehen, wie der Wortschatz Woche für Woche wächst.",
      },
      {
        q: "Für welches Alter ist es gedacht?",
        a: "Das Herz von Gadit sind Kinder im Schulalter, von der ersten Klasse bis zur Oberstufe. Der Kindermodus erklärt einfach für die Jüngeren, und die ausführlichen Erklärungen dienen auch Jugendlichen und Eltern. Das Konto eröffnet ein Elternteil.",
      },
      {
        q: "Hilft es bei Englisch und anderen Sprachen?",
        a: "Sehr. Ein Kind kann ein Wort auf Englisch nachschlagen und eine einfache Erklärung in seiner eigenen Sprache erhalten, mit Bild und Beispielen, genau der Helfer, der zu Hause fehlt. Und es funktioniert in 30+ Sprachen, sodass das Kind die Erklärung auch in der Sprache bekommen kann, die Sie zu Hause sprechen.",
      },
      {
        q: "Was kostet es?",
        a: "$59 im Jahr oder $5.99 im Monat, nach der 14-tägigen Testphase. Keine versteckten Gebühren, und Sie kündigen jederzeit mit einem Klick.",
      },
      {
        q: "Wie viele Kinder kann ich hinzufügen?",
        a: "Bis zu 5 Kinder in einem Familientarif, jedes mit eigenem Profil, Heft und Übungen.",
      },
      {
        q: "Können wir es unverbindlich ausprobieren?",
        a: "Ja. Die Testphase beginnt mit einer Karte, aber die erste Abbuchung erfolgt erst, wenn die 14 Tage vorbei sind. Kündigen Sie jederzeit vorher, mit einem Klick, und Sie zahlen nichts.",
      },
    ],
    finalTitle: "Legen Sie heute los und sehen Sie den Wortschatz wachsen",
    finalSub: "Zwei Wochen kostenlos. Kündbar mit einem Klick. Und ein Kind, das lernt, Wörter selbst zu verstehen.",
    finalCta: "Starten Sie Ihre 14-tägige kostenlose Testphase",
    footerTerms: "AGB",
    footerPrivacy: "Datenschutz",
  },
  cs: {
    heroBadge: "Vizuální a chytrý slovník pro celou rodinu",
    whatIs: "Gadit je chytrý vizuální slovník pro děti: každé slovo dostane vysvětlení na dětské úrovni, obrázek, příklady a hry i kvízy, díky kterým je učení slov zábava. Slovní zásoba roste, čtení s porozuměním se zlepšuje a vašemu dítěti se lépe daří ve škole.",
    ctaMicro: "",
    trustLine: "Až 5 dětí, každé na své vlastní úrovni",
    credLine: "Postaveno na 15 letech zkušeností s více než 15 000 rodiči, žáky a pedagogy",
    credKicker: "Kdo jsme",
    credTitle: "15 let ve vzdělávání. Teď v jednom nástroji pro vaše dítě.",
    credBody: "Gadit vytvořil tým s 15 lety zkušeností ve vzdělávání, který pracoval s více než 15 000 rodiči, žáky a pedagogy. To, co jsme viděli fungovat znovu a znovu, ve třídě i doma, jsme vložili do jednoho jednoduchého nástroje, který dítě zvládne samo.",
    proofTitle: "Sešit slov · příklad",
    proofBig: "12 nových slov tento týden",
    proofWords: ["sen", "živý", "zdráhavý"],
    angles: {
      vocab: {
        h1: "Slovní zásoba vašeho dítěte roste. Slovo po slově.",
        sub: "Každé slovo, na které se vaše dítě zeptá, přistane v jeho osobním sešitu slov v Gaditu: s obrázkem, vysvětlením na dětské úrovni a krátkým procvičováním, které slovo vrací, dokud si ho dítě neosvojí. Otevřete sešit na konci měsíce a sledujte, jak slovní zásoba roste, slovo po slově.",
      },
      relief: {
        h1: "Přestaňte být rodinným slovníkem",
        sub: "Od dneška, když se vaše dítě zeptá „co to znamená?“, má jedno místo, kde si odpověď najde samo: každý význam, ke každému obrázek a vysvětlení na dětské úrovni. Žádný otevřený chat, žádné reklamy.",
      },
      anxiety: {
        h1: "Vaše dítě přečte správně každé slovo, ale doopravdy nerozumí",
        sub: "Ne vždy se zastaví a zeptá. Přeskočí slovo, kterému nerozumí, čte dál a látka se neuchytí. Časem se to promění ve frustraci ze školy a pocit „tohle nezvládnu“. Gadit dá vašemu dítěti jedno místo, kde se zastaví, opravdu porozumí a vrátí se k učení se slovem v ruce.",
      },
      safe: {
        h1: "Jediná obrazovka, kterou můžete dát dítěti bez obav",
        sub: "Žádný otevřený chat. Žádný nekonečný feed. Žádné reklamy. Jedno čisté místo, kde dítě napíše slovo, plně mu porozumí a vrátí se k úkolům.",
      },
    },
    heroCta: "Začněte 14denní zkušební verzi zdarma",
    heroTrust: "Žádný otevřený chat · Žádné reklamy · Zrušení jedním kliknutím",
    ownerCta: "Přejít do rodinného prostoru",
    stats: ["20 jazyků", "Obrázek ke každému významu", "Až 5 dětí", "Zrušení jedním kliknutím"],
    demoKicker: "Výsledek",
    demoTitle: "Vaše dítě rozumí každému slovu a jeho slovní zásoba roste každý den",
    painKicker: "Skutečná bolest",
    painTitle: "Vaše dítě čte, ale ne vždy doopravdy rozumí",
    painBody1: "Ve skutečnosti jste rádi, když se vaše dítě zastaví a zeptá, co slovo znamená. Problém jsou všechna ta slova, na která se nezeptá. Přeskočí je, čte dál a látka se neuchytí. Slovní zásoba zůstává chudá a porozumění se láme slovo za slovem.",
    painBody2: "A týká se to mnohem víc než jen známky. Dítě, které nerozumí, se cítí nedostatečné, frustruje se ze školy a ztrácí sebedůvěru. A děje se to potichu, aniž by kdokoli dokázal ukázat, kde se nit přetrhla.",
    reframe: "A přesně tady přichází Gadit.",
    puzzleKicker: "Co se děje dítěti v hlavě",
    puzzleTitle: "Text je puzzle. Každé slovo je dílek.",
    puzzleBody: "Když dítě čte, jeho mysl skládá z jednotlivých slov celý obraz. Každé slovo, kterému rozumí, je dílek, který zapadne na místo. Každé chybějící slovo je díra v obraze. Stačí tři nebo čtyři díry a dítě už obraz nevidí, i kdyby přečetlo každé písmeno.",
    puzzleBefore: "Odstavec s chybějícími slovy",
    puzzleAfter: "S Gaditem každý dílek na místě",
    puzzleLine: "Když je každé slovo jasné, dítě vidí celý obraz.",
    chainKicker: "Jak to funguje",
    chainTitle: "Všechno, co vaše dítě dostane, u každého slova",
    chainSteps: [
      "Vaše dítě napíše slovo, kterému nerozumí",
      "Dostane vysvětlení na své úrovni, obrázek a tři příklady",
      "Slovo se uloží do jeho osobního sešitu",
      "A vrátí se v krátkém procvičování, dokud si ho dítě opravdu neosvojí",
    ],
    howBlocks: [
      { t: "Napište slovo", b: "Vaše dítě napíše jakékoli slovo, kterému nerozumí, v Dětském režimu, na čistém a bezpečném místě." },
      { t: "Jasná definice", b: "Vysvětlení na úrovni dítěte, žádná těžká slova vysvětlující těžká slova." },
      { t: "Tři příklady", b: "Skutečné věty, které ukazují, jak slovo žije uvnitř textu, ne jen suchá definice." },
      { t: "Obrázek ke každému významu", b: "Protože děti si mnohem lépe pamatují to, co vidí, než to, co je jim napsáno." },
      { t: "Kontext", b: "Vložte větu z knihy a Gadit označí přesně ten význam, který jí odpovídá." },
      { t: "Osobní sešit", b: "Každé slovo, které si vaše dítě vyhledalo, se uloží do jeho sešitu a neuteče." },
      { t: "Krátký kvíz", b: "Rychlá otázka, která vrátí slovo zpět těsně předtím, než se vytratí." },
      { t: "Hra", b: "Učení hrou, na slovech, která si vaše dítě samo vyhledalo." },
    ],
    chainCost: "",
    chainTurnTitle: "A tohle je to, co získáte",
    chainTurnBody: "Každé slovo, na kterém vaše dítě uvízlo, se stane slovem, které zná, a vy to vidíte černé na bílém: kolik slov uzavřelo, týden po týdnu. Místo abyste doufali, že se něco zlepšuje, prostě sledujete, jak se to děje.",
    dashKicker: "Rodičovský přehled",
    dashTitle: "Vidíte přesně, kolik se každé dítě naučilo",
    dashBody: "Každé dítě má osobní sešit slov, který roste. Ve svém přehledu na první pohled vidíte, kolik slov se každé dítě naučilo, kolik jich přibylo tento týden a jeho nejnovější slova. Jakýkoli jiný nástroj vašemu dítěti odpoví a zapomene. Gadit si pamatuje a vy sledujete pokrok týden po týdnu.",
    dashKids: [
      { name: "Nela", total: 47, week: 12 },
      { name: "Adam", total: 31, week: 8 },
      { name: "Eliška", total: 63, week: 15 },
    ],
    dashWordsLabel: "slov v sešitu",
    dashWeekLabel: "tento týden",
    featuresKicker: "Co je uvnitř",
    features: [
      {
        kicker: "Každý význam",
        title: "Jedno slovo. Každý význam. Ke každému obrázek.",
        body: "Jedno slovo má často několik různých významů, a právě tady se děti pletou. Gadit je ukáže všechny na jednom místě, každý se třemi skutečnými příklady a vlastním obrázkem, protože dětský mozek si pamatuje obrazy mnohem lépe než slova.",
      },
      {
        kicker: "Dětský režim",
        title: "Vysvětlení na úrovni vašeho dítěte",
        body: "Jeden přepínač a každé vysvětlení se promění v jazyk, kterému osmileté dítě opravdu rozumí. Žádná těžká slova vysvětlující těžká slova, žádné kruhové definice. Jen porozumění.",
      },
      {
        kicker: "Kontext",
        title: "Vložte větu, získejte správný význam",
        body: "Většina slov má více než jeden význam, a právě tady se děti ztrácejí. Vložte větu z knihy nebo pracovního listu a Gadit označí přesně ten význam, který sedí.",
      },
      {
        kicker: "Osobní sešit",
        title: "Slova neutíkají",
        body: "Každé slovo, které si vaše dítě vyhledá, přistane v jeho osobním sešitu, a krátké chytré procvičování ho vrátí zpět těsně předtím, než se vytratí. Přesně tak se opravdu buduje slovní zásoba, slovo po slově.",
      },
      {
        kicker: "Profil pro každé dítě",
        title: "Každé dítě dostane svůj vlastní prostor",
        body: "Každé dítě v rodině dostane samostatný profil: svůj sešit, své procvičování, svou historii. Dětský režim přizpůsobí vysvětlení, jednoduché a jasné pro nejmenší a plnější pro starší, a nikdo si neplete slova s ostatními.",
      },
      {
        kicker: "Slovní hry",
        title: "Učební hry na slovech vašeho dítěte",
        body: "Krátké kvízy a hry postavené ze slov, která si vaše dítě skutečně vyhledalo. Pár minut hry a slovní zásoba roste bez námahy.",
      },
      {
        kicker: "Druhý jazyk",
        title: "Nejlepší pomocník s domácími úkoly do druhého jazyka",
        body: "Vaše dítě napíše slovo v angličtině a dostane jednoduché vysvětlení ve svém vlastním jazyce, s obrázkem a příklady. Žádné bloudění mezi slovníkem, překladačem a YouTube.",
      },
    ],
    midCtaTitle: "Začněte hned teď a sledujte, jak slovní zásoba vašeho dítěte roste den za dnem",
    midCta: "Začněte 14denní zkušební verzi zdarma",
    compareKicker: "Rozdíl",
    compareTitle: "Proč to prostě nevygooglit nebo se nezeptat chatbota?",
    compareGadit: "Gadit",
    compareOther: "Otevřený internet",
    compareRows: [
      { label: "Jedna čistá stránka na každé slovo", gadit: true, other: false },
      { label: "Vysvětlení na dětské úrovni", gadit: true, other: false },
      { label: "Obrázek ke každému významu", gadit: true, other: false },
      { label: "Sešit a procvičování, které drží", gadit: true, other: false },
      { label: "Reklamy a odkazy na všechny strany", gadit: false, other: true },
      { label: "Otevřený chat bez hranic", gadit: false, other: true },
    ],
    safeTitle: "Oddělená, čistá zóna. Ne dveře někam jinam.",
    safeBody: "Gadit je zcela uzavřený prostor: žádný otevřený chat, žádný feed, žádné reklamy, žádné odkazy ven. Dítě odsud není staženo do TikToku ani žádné jiné aplikace. Je tu jen jedna věc, kterou lze dělat: porozumět slovu a vrátit se k učení.",
    safeLine: "Jedna obrazovka, kterou můžete dát dítěti s klidnou hlavou.",
    stackTitle: "Co plán Family zahrnuje",
    stackItems: [
      "Neomezené vyhledávání pro celou rodinu",
      "Každý význam, s obrázkem ke každému",
      "Dětský režim pro každý věk",
      "Kontrola vět s okamžitou zpětnou vazbou",
      "Osobní sešit a chytré procvičování pro každé dítě",
      "Slovní hry a kvízy",
      "Až 5 dětí se samostatnými profily",
      "20 jazyků s plnou podporou",
    ],
    priceKicker: "Ceník",
    priceTitle: "Plán Family",
    trialBadge: "14denní zkušební verze zdarma",
    yearly: "$59 / rok",
    yearlyNote: "to je $4.92 měsíčně pro celou rodinu a ušetříte téměř dva měsíce oproti měsíčnímu placení",
    priceAnchor: "Méně než jedno soukromé doučování, na celý rok, pro každé dítě doma",
    monthly: "$5.99 / měsíc",
    billedYearly: "Ročně",
    billedMonthly: "Měsíčně",
    yearlySave: "-18%",
    priceCta: "Začít zkušební verzi",
    cancelNote: "První platba až po uplynutí 14 dnů. Zrušit můžete kdykoli na stránce svého účtu, jedním kliknutím.",
    singleChild: "Jen jeden žák doma? Deep stojí $4.99/měsíc. Za o něco víc můžete přidat až 5 dětí.",
    guaranteeTitle: "Váš test: dva týdny",
    guaranteeBody: "Dejte tomu dva týdny skutečného používání, zdarma. Pokud do 14. dne sešit vašeho dítěte nenasbírá alespoň 20 nových slov, zrušte to jedním kliknutím a nezaplatili jste nic.",
    faqTitle: "Otázky, které kladou rodiče",
    faq: [
      {
        q: "Co s Gaditem získám?",
        a: "Každé slovo, které si vaše dítě vyhledá, dostane jednu čistou stránku: každý význam, vysvětlení na dětské úrovni (Dětský režim), tři skutečné příklady a obrázek ke každému významu. K tomu kontext (vložte větu a získejte správný význam), osobní sešit slov s chytrým procvičováním, slovní hry a kvízy, rodičovský přehled ukazující, kolik se každé dítě naučilo, až 5 dětí na samostatných profilech, to vše ve 14 jazycích, v uzavřeném a bezpečném prostoru bez otevřeného chatu a bez reklam.",
      },
      {
        q: "Proč se prostě nezeptat chatbota nebo Googlu?",
        a: "Protože to jsou nástroje pro dospělé. Google vrací reklamy a odkazy na všechny strany a otevřený chatbot je konverzace bez hranic, ve které žádný rodič nenechá dítě samotné. Gadit je postavený obráceně: jedna uzavřená, čistá stránka na každé slovo, na dětské úrovni, bez možnosti se ztratit.",
      },
      {
        q: "Jak poznám, že moje dítě opravdu dělá pokroky?",
        a: "Získáte rodičovský přehled. Na první pohled vidíte, kolik slov se každé dítě naučilo, kolik jich přibylo tento týden a jeho nejnovější slova. Každý jiný nástroj dítěti odpoví a zapomene; Gadit uloží každé slovo do osobního sešitu dítěte, takže sledujete, jak slovní zásoba roste týden po týdnu.",
      },
      {
        q: "Pro jaký věk je to určené?",
        a: "Srdcem Gaditu jsou děti školního věku, od první třídy až po střední školu. Dětský režim vysvětluje jednoduše pro nejmenší a plná vysvětlení poslouží i teenagerům a rodičům. Účet zakládá rodič.",
      },
      {
        q: "Pomáhá s angličtinou a dalšími jazyky?",
        a: "Velmi. Dítě si může vyhledat slovo v angličtině a dostat jednoduché vysvětlení ve svém vlastním jazyce, s obrázkem a příklady, přesně ten pomocník, který doma chybí. A funguje to ve 14 jazycích, takže dítě může dostat vysvětlení i v jazyce, kterým doma mluvíte.",
      },
      {
        q: "Kolik to stojí?",
        a: "$59 ročně nebo $5.99 měsíčně, po 14denní zkušební verzi. Žádné skryté poplatky a zrušit můžete kdykoli jedním kliknutím.",
      },
      {
        q: "Kolik dětí mohu přidat?",
        a: "Až 5 dětí na jednom plánu Family, každé se svým vlastním profilem, sešitem a procvičováním.",
      },
      {
        q: "Můžeme to vyzkoušet bez závazku?",
        a: "Ano. Zkušební verze začíná s kartou, ale první platba proběhne až po uplynutí 14 dnů. Zrušte to kdykoli předtím, jedním kliknutím, a nezaplatíte nic.",
      },
    ],
    finalTitle: "Začněte ještě dnes a sledujte, jak slovní zásoba roste",
    finalSub: "Dva týdny zdarma. Zrušení jedním kliknutím. A dítě, které se naučí rozumět slovům samo.",
    finalCta: "Začněte 14denní zkušební verzi zdarma",
    footerTerms: "Podmínky",
    footerPrivacy: "Soukromí",
  },
  sk: {
    heroBadge: "Vizuálny a inteligentný slovník pre celú rodinu",
    whatIs: "Gadit je inteligentný vizuálny slovník pre deti: každé slovo dostane vysvetlenie na detskej úrovni, obrázok, príklady a hry aj kvízy, ktoré robia učenie slov zábavným. Slovná zásoba rastie, čitateľské porozumenie sa zlepšuje a vaše dieťa je v škole úspešnejšie.",
    ctaMicro: "",
    trustLine: "Až 5 detí, každé na svojej vlastnej úrovni",
    credLine: "Postavené na 15 rokoch skúseností s viac než 15 000 rodičmi, žiakmi a pedagógmi",
    credKicker: "Kto sme",
    credTitle: "15 rokov v školstve. Teraz v jednom nástroji pre vaše dieťa.",
    credBody: "Gadit vytvoril tím s 15 rokmi skúseností v školstve, ktorý spolupracoval s viac než 15 000 rodičmi, žiakmi a pedagógmi. To, čo znova a znova fungovalo v triede aj doma, sme vložili do jedného jednoduchého nástroja, ktorý dieťa zvládne samo.",
    proofTitle: "Zošit slov · príklad",
    proofBig: "12 nových slov tento týždeň",
    proofWords: ["sen", "živý", "zdráhavý"],
    angles: {
      vocab: {
        h1: "Slovná zásoba vášho dieťaťa rastie. Slovo po slove.",
        sub: "Každé slovo, na ktoré sa vaše dieťa opýta, pristane v jeho osobnom zošite slov v Gadit: s obrázkom, vysvetlením na detskej úrovni a krátkym precvičovaním, ktoré ho vracia späť, kým ho dieťa naozaj neovládne. Otvorte zošit na konci mesiaca a sledujte, ako slovná zásoba rastie, slovo po slove.",
      },
      relief: {
        h1: "Prestaňte byť rodinným slovníkom",
        sub: "Odteraz, keď sa vaše dieťa opýta „čo to znamená?“, má jedno miesto, kde nájde odpoveď samo: každý význam, obrázok ku každému z nich a vysvetlenie na detskej úrovni. Žiadny otvorený chat, žiadne reklamy.",
      },
      anxiety: {
        h1: "Vaše dieťa prečíta každé slovo správne, no naozaj nerozumie",
        sub: "Nie vždy sa zastaví, aby sa opýtalo. Preskočí slovo, ktorému nerozumie, číta ďalej a látka mu nesadne. Postupom času sa z toho stane frustrácia zo školy a pocit „toto nezvládnem“. Gadit dá vášmu dieťaťu jedno miesto, kde sa zastaví, naozaj porozumie a vráti sa k hodine so slovom v rukách.",
      },
      safe: {
        h1: "Jediná obrazovka, ktorú môžete dať dieťaťu bez obáv",
        sub: "Žiadny otvorený chat. Žiadny nekonečný feed. Žiadne reklamy. Jedno prehľadné miesto, kde dieťa napíše slovo, naplno mu porozumie a vráti sa k úlohám.",
      },
    },
    heroCta: "Začnite 14-dňovú skúšku zdarma",
    heroTrust: "Žiadny otvorený chat · Žiadne reklamy · Zrušenie jedným kliknutím",
    ownerCta: "Prejsť do rodinného priestoru",
    stats: ["20 jazykov", "Obrázok ku každému významu", "Až 5 detí", "Zrušenie jedným kliknutím"],
    demoKicker: "Výsledok",
    demoTitle: "Vaše dieťa rozumie každému slovu a jeho slovná zásoba rastie každý deň",
    painKicker: "Skutočný problém",
    painTitle: "Vaše dieťa číta, no nie vždy naozaj rozumie",
    painBody1: "V skutočnosti ste radi, keď sa vaše dieťa zastaví a opýta, čo znamená nejaké slovo. Problém sú všetky slová, na ktoré sa nezastaví opýtať. Preskočí ich, číta ďalej a látka mu nesadne. Slovná zásoba zostáva chudobná a porozumenie sa láme slovo po slove.",
    painBody2: "A dotýka sa to oveľa viac než len známky. Dieťa, ktoré nerozumie, sa cíti nedostatočné, frustruje ho škola a stráca sebadôveru. A deje sa to potichu, bez toho, aby ktokoľvek vedel ukázať, kde sa niť pretrhla.",
    reframe: "A presne tu prichádza na scénu Gadit.",
    puzzleKicker: "Čo sa deje v hlave dieťaťa",
    puzzleTitle: "Text je puzzle. Každé slovo je dielik.",
    puzzleBody: "Keď dieťa číta, jeho myseľ skladá zo slov celý obraz. Každé slovo, ktorému rozumie, je dielik, ktorý zapadne na miesto. Každé chýbajúce slovo je diera v obraze. Stačia tri alebo štyri diery a dieťa už obraz nevidí, aj keby vyslovilo každé písmeno.",
    puzzleBefore: "Odsek s chýbajúcimi slovami",
    puzzleAfter: "S Gadit každý dielik na svojom mieste",
    puzzleLine: "Keď je každé slovo jasné, dieťa vidí celý obraz.",
    chainKicker: "Ako to funguje",
    chainTitle: "Všetko, čo vaše dieťa dostane ku každému slovu",
    chainSteps: [
      "Vaše dieťa napíše slovo, ktorému nerozumie",
      "Dostane vysvetlenie na svojej úrovni, obrázok a tri príklady",
      "Slovo sa uloží do jeho osobného zošita",
      "A vráti sa v krátkom precvičovaní, kým ho dieťa naozaj neovládne",
    ],
    howBlocks: [
      { t: "Napíš slovo", b: "Vaše dieťa napíše akékoľvek slovo, ktorému nerozumie, v Detskom režime, na prehľadnom a bezpečnom mieste." },
      { t: "Jasná definícia", b: "Vysvetlenie na úrovni dieťaťa, žiadne ťažké slová vysvetľujúce ťažké slová." },
      { t: "Tri príklady", b: "Skutočné vety, ktoré ukazujú, ako slovo žije vnútri textu, nielen suchú definíciu." },
      { t: "Obrázok ku každému významu", b: "Pretože deti si oveľa lepšie pamätajú to, čo vidia, než to, čo je im napísané." },
      { t: "Kontext", b: "Vložte vetu z knihy a Gadit označí presne ten význam, ktorý do nej sedí." },
      { t: "Osobný zošit", b: "Každé slovo, ktoré si vaše dieťa vyhľadalo, sa uloží do jeho zošita a neutečie." },
      { t: "Krátky kvíz", b: "Rýchla otázka, ktorá slovo vráti tesne predtým, než sa vytratí." },
      { t: "Hra", b: "Učenie hrou, na slovách, ktoré si vaše dieťa vyhľadalo samo." },
    ],
    chainCost: "",
    chainTurnTitle: "A toto dostanete",
    chainTurnBody: "Každé slovo, na ktorom sa vaše dieťa zaseklo, sa stane slovom, ktoré pozná, a vidíte to čierne na bielom: koľko slov uzavrelo, týždeň za týždňom. Namiesto dúfania, že sa niečo zlepšuje, jednoducho sledujete, ako sa to deje.",
    dashKicker: "Prehľad pre rodičov",
    dashTitle: "Vidíte presne, koľko sa každé dieťa naučilo",
    dashBody: "Každé dieťa má osobný zošit slov, ktorý rastie. Vo svojom prehľade vidíte na prvý pohľad, koľko slov sa každé dieťa naučilo, koľko ich pribudlo tento týždeň a jeho najnovšie slová. Akýkoľvek iný nástroj vášmu dieťaťu odpovie a zabudne. Gadit si pamätá a vy vidíte pokrok týždeň za týždňom.",
    dashKids: [
      { name: "Nina", total: 47, week: 12 },
      { name: "Adam", total: 31, week: 8 },
      { name: "Ema", total: 63, week: 15 },
    ],
    dashWordsLabel: "slov v zošite",
    dashWeekLabel: "tento týždeň",
    featuresKicker: "Čo je vnútri",
    features: [
      {
        kicker: "Každý význam",
        title: "Jedno slovo. Každý význam. Obrázok ku každému.",
        body: "Jedno slovo má často niekoľko rôznych významov a práve tam sa deti zamotajú. Gadit im ukáže všetky na jednom mieste, každý s tromi skutočnými príkladmi a vlastným obrázkom, pretože detský mozog si pamätá obrázky oveľa lepšie než slová.",
      },
      {
        kicker: "Detský režim",
        title: "Vysvetlenia na úrovni vášho dieťaťa",
        body: "Jeden prepínač a každé vysvetlenie sa zmení na jazyk, ktorému osemročné dieťa naozaj rozumie. Žiadne ťažké slová vysvetľujúce ťažké slová, žiadne kruhové definície. Len porozumenie.",
      },
      {
        kicker: "Kontext",
        title: "Vložte vetu, dostanete správny význam",
        body: "Väčšina slov má viac než jeden význam a práve tam sa deti stratia. Vložte vetu z knihy alebo pracovného listu a Gadit označí presne ten význam, ktorý sedí.",
      },
      {
        kicker: "Osobný zošit",
        title: "Slová neutečú",
        body: "Každé slovo, ktoré si vaše dieťa vyhľadá, pristane v jeho osobnom zošite a krátke šikovné precvičovanie ho vráti tesne predtým, než sa vytratí. Takto sa naozaj buduje slovná zásoba, slovo po slove.",
      },
      {
        kicker: "Profil pre každé dieťa",
        title: "Každé dieťa dostane svoj vlastný priestor",
        body: "Každé dieťa v rodine dostane samostatný profil: svoj zošit, svoje precvičovanie, svoju históriu. Detský režim prispôsobí vysvetlenie, jednoduché a jasné pre menšie deti a plnšie pre staršie, a nikto si nezasahuje do slov toho druhého.",
      },
      {
        kicker: "Slovné hry",
        title: "Vzdelávacie hry na slovách vášho dieťaťa",
        body: "Krátke kvízy a hry vytvorené zo slov, ktoré si vaše dieťa naozaj vyhľadalo. Pár minút hry a slovná zásoba rastie bez námahy.",
      },
      {
        kicker: "Druhý jazyk",
        title: "Najlepší pomocník s domácimi úlohami pre druhý jazyk",
        body: "Vaše dieťa napíše slovo v angličtine a dostane jednoduché vysvetlenie vo vlastnom jazyku, s obrázkom a príkladmi. Žiadne blúdenie medzi slovníkom, prekladačom a YouTube.",
      },
    ],
    midCtaTitle: "Začnite teraz a sledujte, ako slovná zásoba vášho dieťaťa rastie deň za dňom",
    midCta: "Začnite 14-dňovú skúšku zdarma",
    compareKicker: "Rozdiel",
    compareTitle: "Prečo to jednoducho nevygúgliť alebo sa nespýtať chatbota?",
    compareGadit: "Gadit",
    compareOther: "Otvorený internet",
    compareRows: [
      { label: "Jedna prehľadná stránka na každé slovo", gadit: true, other: false },
      { label: "Vysvetlenia na detskej úrovni", gadit: true, other: false },
      { label: "Obrázok ku každému významu", gadit: true, other: false },
      { label: "Zošit a precvičovanie, ktoré zostanú", gadit: true, other: false },
      { label: "Reklamy a odkazy na všetky strany", gadit: false, other: true },
      { label: "Otvorený chat bez hraníc", gadit: false, other: true },
    ],
    safeTitle: "Samostatná, prehľadná zóna. Nie dvere kamkoľvek inam.",
    safeBody: "Gadit je úplne uzavretý priestor: žiadny otvorený chat, žiadny feed, žiadne reklamy, žiadne odkazy von. Dieťa sa odtiaľto nedostane na TikTok ani do inej aplikácie. Je tu jediná vec, ktorú treba robiť: porozumieť slovu a vrátiť sa k učeniu.",
    safeLine: "Jedna obrazovka, ktorú môžete dať dieťaťu s pokojnou mysľou.",
    stackTitle: "Čo obsahuje rodinný plán",
    stackItems: [
      "Neobmedzené vyhľadávania pre celú rodinu",
      "Každý význam, s obrázkom ku každému",
      "Detský režim pre každý vek",
      "Kontrola viet s okamžitou spätnou väzbou",
      "Osobný zošit a šikovné precvičovanie pre každé dieťa",
      "Slovné hry a kvízy",
      "Až 5 detí so samostatnými profilmi",
      "20 jazykov s plnou podporou",
    ],
    priceKicker: "Cena",
    priceTitle: "Rodinný plán",
    trialBadge: "14-dňová skúška zdarma",
    yearly: "$59 / rok",
    yearlyNote: "to je $4.92 mesačne pre celú rodinu a ušetríte takmer dva mesiace oproti mesačnému plateniu",
    priceAnchor: "Menej než jedno súkromné doučovanie, na celý rok, pre každé dieťa doma",
    monthly: "$5.99 / mesiac",
    billedYearly: "Ročne",
    billedMonthly: "Mesačne",
    yearlySave: "-18%",
    priceCta: "Začať skúšku",
    cancelNote: "Prvá platba až po 14 dňoch. Zrušte kedykoľvek na stránke svojho účtu, jedným kliknutím.",
    singleChild: "Len jeden žiak doma? Deep je $4.99/mesiac. Za o niečo viac môžete pridať až 5 detí.",
    guaranteeTitle: "Váš test: dva týždne",
    guaranteeBody: "Dajte tomu dva týždne skutočného používania, zdarma. Ak do 14. dňa zošit vášho dieťaťa nenazbieral aspoň 20 nových slov, zrušte to jedným kliknutím a nezaplatili ste nič.",
    faqTitle: "Otázky, ktoré kladú rodičia",
    faq: [
      {
        q: "Čo s Gadit dostanem?",
        a: "Každé slovo, ktoré si vaše dieťa vyhľadá, dostane jednu prehľadnú stránku: každý význam, vysvetlenie na detskej úrovni (Detský režim), tri skutočné príklady a obrázok ku každému významu. K tomu kontext (vložte vetu a dostanete správny význam), osobný zošit slov so šikovným precvičovaním, slovné hry a kvízy, prehľad pre rodičov, ktorý ukazuje, koľko sa každé dieťa naučilo, až 5 detí na samostatných profiloch, to všetko v 20 jazykoch, v uzavretom, bezpečnom priestore bez otvoreného chatu a bez reklám.",
      },
      {
        q: "Prečo sa jednoducho neopýtať chatbota alebo Googlu?",
        a: "Pretože to sú nástroje pre dospelých. Google vráti reklamy a odkazy na všetky strany a otvorený chatbot je konverzácia bez hraníc, pri ktorej žiadny rodič nenechá dieťa samo. Gadit je postavený opačne: jedna uzavretá, prehľadná stránka na každé slovo, na detskej úrovni, bez možnosti stratiť sa.",
      },
      {
        q: "Ako zistím, či moje dieťa naozaj napreduje?",
        a: "Dostanete prehľad pre rodičov. Na prvý pohľad vidíte, koľko slov sa každé dieťa naučilo, koľko ich pribudlo tento týždeň a jeho najnovšie slová. Každý iný nástroj dieťaťu odpovie a zabudne; Gadit ukladá každé slovo do osobného zošita dieťaťa, takže sledujete, ako slovná zásoba rastie týždeň za týždňom.",
      },
      {
        q: "Pre aký vek je určený?",
        a: "Srdcom Gadit sú deti školského veku, od prvého ročníka až po strednú školu. Detský režim vysvetľuje jednoducho pre malých a plné vysvetlenia poslúžia aj tínedžerom a rodičom. Účet zakladá rodič.",
      },
      {
        q: "Pomáha s angličtinou a inými jazykmi?",
        a: "Veľmi. Dieťa si môže vyhľadať slovo v angličtine a dostať jednoduché vysvetlenie vo vlastnom jazyku, s obrázkom a príkladmi, presne ten pomocník, ktorý doma chýba. A funguje to v 20 jazykoch, takže dieťa môže dostať vysvetlenie aj v jazyku, ktorým hovoríte doma.",
      },
      {
        q: "Koľko to stojí?",
        a: "$59 ročne alebo $5.99 mesačne, po 14-dňovej skúške. Žiadne skryté poplatky a zrušíte kedykoľvek jedným kliknutím.",
      },
      {
        q: "Koľko detí môžem pridať?",
        a: "Až 5 detí na jednom rodinnom pláne, každé s vlastným profilom, zošitom a precvičovaním.",
      },
      {
        q: "Môžeme to vyskúšať bez záväzku?",
        a: "Áno. Skúška sa začína s kartou, ale prvá platba prebehne až vtedy, keď skončí 14 dní. Zrušte kedykoľvek predtým, jedným kliknutím, a nezaplatíte nič.",
      },
    ],
    finalTitle: "Začnite ešte dnes a sledujte, ako slovná zásoba rastie",
    finalSub: "Dva týždne zdarma. Zrušenie jedným kliknutím. A dieťa, ktoré sa naučí rozumieť slovám samo.",
    finalCta: "Začnite 14-dňovú skúšku zdarma",
    footerTerms: "Podmienky",
    footerPrivacy: "Súkromie",
  },
  it: {
    heroBadge: "Un dizionario visivo e intelligente per tutta la famiglia",
    whatIs: "Gadit è un dizionario visivo e intelligente per bambini: ogni parola riceve una spiegazione a misura di bambino, un'immagine, degli esempi e giochi e quiz che rendono divertente imparare le parole. Il vocabolario cresce, la comprensione del testo migliora e tuo figlio va meglio a scuola.",
    ctaMicro: "",
    trustLine: "Fino a 5 bambini, ognuno al proprio livello",
    credLine: "Costruito su 15 anni di esperienza con più di 15.000 genitori, studenti ed educatori",
    credKicker: "Chi siamo",
    credTitle: "15 anni nell'istruzione. Ora in un solo strumento per tuo figlio.",
    credBody: "Gadit è stato creato da un team con 15 anni di esperienza nell'istruzione, che ha lavorato con più di 15.000 genitori, studenti ed educatori. Ciò che abbiamo visto funzionare volta dopo volta, in classe e a casa, l'abbiamo messo in un unico strumento semplice che un bambino può usare da solo.",
    proofTitle: "Quaderno delle parole · esempio",
    proofBig: "12 parole nuove questa settimana",
    proofWords: ["sogno", "vivido", "riluttante"],
    angles: {
      vocab: {
        h1: "Il vocabolario di tuo figlio cresce. Parola dopo parola.",
        sub: "Ogni parola su cui tuo figlio si interroga finisce nel suo quaderno delle parole personale su Gadit: con un'immagine, una spiegazione a misura di bambino e un breve esercizio che la riporta finché non diventa davvero sua. Apri il quaderno alla fine del mese e guarda il vocabolario crescere, parola dopo parola.",
      },
      relief: {
        h1: "Smetti di essere il dizionario di famiglia",
        sub: "Da oggi, quando tuo figlio chiede «che cosa vuol dire?», ha un unico posto dove trovare la risposta da solo: ogni significato, un'immagine per ciascuno e una spiegazione a misura di bambino. Nessuna chat aperta, nessuna pubblicità.",
      },
      anxiety: {
        h1: "Tuo figlio legge ogni parola correttamente, ma non capisce davvero",
        sub: "Non sempre si ferma a chiedere. Salta una parola che non capisce, va avanti e la materia non entra. Con il tempo si trasforma in frustrazione verso la scuola e nella sensazione di «non ci riesco». Gadit dà a tuo figlio un unico posto dove fermarsi, capire davvero e tornare alla lezione con la parola in mano.",
      },
      safe: {
        h1: "L'unico schermo che puoi mettere in mano a un bambino senza preoccupazioni",
        sub: "Nessuna chat aperta. Nessun feed infinito. Nessuna pubblicità. Un unico spazio pulito dove un bambino digita una parola, la capisce fino in fondo e torna ai compiti.",
      },
    },
    heroCta: "Inizia la prova gratuita di 14 giorni",
    heroTrust: "Nessuna chat aperta · Nessuna pubblicità · Disdici con un clic",
    ownerCta: "Vai al tuo spazio famiglia",
    stats: ["30+ lingue", "Un'immagine per significato", "Fino a 5 bambini", "Disdici con un clic"],
    demoKicker: "Il risultato",
    demoTitle: "Tuo figlio capisce ogni parola, e il suo vocabolario cresce ogni giorno",
    painKicker: "Il vero problema",
    painTitle: "Tuo figlio legge, ma non sempre capisce davvero",
    painBody1: "In realtà sei contento quando tuo figlio si ferma a chiedere che cosa significa una parola. Il problema sono tutte le parole su cui non si ferma a chiedere. Le salta, continua a leggere e la materia non entra. Il vocabolario resta povero e la comprensione si spezza parola dopo parola.",
    painBody2: "E riguarda molto più di un voto. Un bambino che non capisce si sente non abbastanza bravo, si frustra con la scuola e perde fiducia. E succede in silenzio, senza che nessuno riesca a indicare dove si è spezzato il filo.",
    reframe: "Ed è proprio qui che entra in gioco Gadit.",
    puzzleKicker: "Cosa succede nella testa di un bambino",
    puzzleTitle: "Il testo è un puzzle. Ogni parola è un pezzo.",
    puzzleBody: "Quando un bambino legge, la sua mente costruisce un quadro completo a partire dalle parole. Ogni parola che capisce è un pezzo che va al suo posto. Ogni parola mancante è un buco nel quadro. Bastano tre o quattro buchi e il bambino non vede più il quadro, anche se ha letto ogni lettera.",
    puzzleBefore: "Un paragrafo con parole mancanti",
    puzzleAfter: "Con Gadit, ogni pezzo al suo posto",
    puzzleLine: "Quando ogni parola è chiara, il bambino vede il quadro completo.",
    chainKicker: "Come funziona",
    chainTitle: "Tutto ciò che tuo figlio riceve, su ogni parola",
    chainSteps: [
      "Tuo figlio digita una parola che non capisce",
      "Riceve una spiegazione alla sua altezza, un'immagine e tre esempi",
      "La parola viene salvata nel suo quaderno personale",
      "E ritorna in un breve esercizio, finché non diventa davvero sua",
    ],
    howBlocks: [
      { t: "Digita la parola", b: "Tuo figlio digita qualsiasi parola non capisce, in Modalità Bambini, in un posto pulito e sicuro." },
      { t: "Una definizione chiara", b: "Una spiegazione all'altezza del bambino, senza parole difficili che spiegano parole difficili." },
      { t: "Tre esempi", b: "Frasi reali che mostrano come la parola vive dentro un testo, non solo una definizione arida." },
      { t: "Un'immagine per ogni significato", b: "Perché i bambini ricordano ciò che vedono molto meglio di ciò che viene scritto loro." },
      { t: "Contesto", b: "Incolla una frase dal libro e Gadit segna esattamente il significato che le si adatta." },
      { t: "Un quaderno personale", b: "Ogni parola che tuo figlio ha cercato viene salvata nel suo quaderno, e non scappa via." },
      { t: "Un quiz veloce", b: "Una domanda rapida che riporta la parola proprio prima che sfugga." },
      { t: "Un gioco", b: "Imparare giocando, sulle parole che tuo figlio ha cercato da solo." },
    ],
    chainCost: "",
    chainTurnTitle: "Ed ecco cosa ottieni",
    chainTurnBody: "Ogni parola su cui tuo figlio si è bloccato diventa una parola che conosce, e lo vedi nero su bianco: quante parole ha chiuso, settimana dopo settimana. Invece di sperare che qualcosa stia migliorando, lo guardi semplicemente accadere.",
    dashKicker: "La dashboard dei genitori",
    dashTitle: "Vedi esattamente quanto ha imparato ogni bambino",
    dashBody: "Ogni bambino ha un quaderno delle parole personale che cresce. Nella tua dashboard vedi, a colpo d'occhio, quante parole ha imparato ciascun bambino, quante ne ha aggiunte questa settimana e le sue parole più recenti. Qualsiasi altro strumento risponde a tuo figlio e dimentica. Gadit ricorda, e tu vedi i progressi settimana dopo settimana.",
    dashKids: [
      { name: "Sofia", total: 47, week: 12 },
      { name: "Leo", total: 31, week: 8 },
      { name: "Giulia", total: 63, week: 15 },
    ],
    dashWordsLabel: "parole nel quaderno",
    dashWeekLabel: "questa settimana",
    featuresKicker: "Cosa c'è dentro",
    features: [
      {
        kicker: "Ogni significato",
        title: "Una parola. Ogni significato. Un'immagine per ciascuno.",
        body: "Una parola ha spesso diversi significati, ed è proprio lì che i bambini si confondono. Gadit li mostra tutti in un unico posto, ognuno con tre esempi reali e la propria immagine, perché il cervello di un bambino ricorda le immagini molto meglio delle parole.",
      },
      {
        kicker: "Modalità Bambini",
        title: "Spiegazioni all'altezza di tuo figlio",
        body: "Un interruttore, e ogni spiegazione si trasforma in un linguaggio che un bambino di 8 anni capisce davvero. Niente parole difficili che spiegano parole difficili, niente definizioni circolari. Solo comprensione.",
      },
      {
        kicker: "Contesto",
        title: "Incolla una frase, ottieni il significato giusto",
        body: "La maggior parte delle parole ha più di un significato, ed è proprio lì che i bambini si perdono. Incolla la frase dal libro o dalla scheda, e Gadit segna esattamente quale significato si adatta.",
      },
      {
        kicker: "Quaderno personale",
        title: "Le parole non scappano via",
        body: "Ogni parola che tuo figlio cerca finisce nel suo quaderno personale, e un breve esercizio intelligente la riporta proprio prima che sfugga. È così che si costruisce davvero il vocabolario, una parola alla volta.",
      },
      {
        kicker: "Un profilo per ogni bambino",
        title: "Ogni bambino ha il proprio spazio",
        body: "Ogni bambino della famiglia ha un profilo separato: il suo quaderno, i suoi esercizi, la sua cronologia. La Modalità Bambini adatta la spiegazione, semplice e chiara per i più piccoli e più completa per i più grandi, e nessuno pesta le parole di un altro.",
      },
      {
        kicker: "Giochi di parole",
        title: "Giochi didattici sulle parole di tuo figlio",
        body: "Quiz e giochi brevi costruiti dalle parole che tuo figlio ha davvero cercato. Pochi minuti di gioco, e il vocabolario cresce senza sforzo.",
      },
      {
        kicker: "Seconda lingua",
        title: "Il miglior aiuto per i compiti in una seconda lingua",
        body: "Tuo figlio digita una parola in inglese e riceve una spiegazione semplice nella propria lingua, con un'immagine ed esempi. Niente più vagare tra dizionario, traduttore e YouTube.",
      },
    ],
    midCtaTitle: "Inizia ora, e guarda il vocabolario di tuo figlio crescere giorno dopo giorno",
    midCta: "Inizia la prova gratuita di 14 giorni",
    compareKicker: "La differenza",
    compareTitle: "Perché non cercarlo semplicemente su Google o chiedere a un chatbot?",
    compareGadit: "Gadit",
    compareOther: "Internet aperto",
    compareRows: [
      { label: "Una pagina pulita per ogni parola", gadit: true, other: false },
      { label: "Spiegazioni a misura di bambino", gadit: true, other: false },
      { label: "Un'immagine per ogni significato", gadit: true, other: false },
      { label: "Un quaderno ed esercizi che restano", gadit: true, other: false },
      { label: "Pubblicità e link in ogni direzione", gadit: false, other: true },
      { label: "Chat aperta senza limiti", gadit: false, other: true },
    ],
    safeTitle: "Una zona separata e pulita. Non una porta verso qualsiasi altro posto.",
    safeBody: "Gadit è uno spazio completamente chiuso: nessuna chat aperta, nessun feed, nessuna pubblicità, nessun link in uscita. Un bambino non viene trascinato da qui a TikTok o a qualsiasi altra app. Qui c'è una sola cosa da fare: capire una parola e tornare a studiare.",
    safeLine: "Un unico schermo che puoi mettere in mano a un bambino con la mente serena.",
    stackTitle: "Cosa include il piano Famiglia",
    stackItems: [
      "Ricerche illimitate per tutta la famiglia",
      "Ogni significato, con un'immagine per ciascuno",
      "Modalità Bambini per ogni età",
      "Verifica delle frasi con feedback immediato",
      "Un quaderno personale ed esercizi intelligenti per ogni bambino",
      "Giochi di parole e quiz",
      "Fino a 5 bambini con profili separati",
      "30+ lingue con supporto completo",
    ],
    priceKicker: "Prezzi",
    priceTitle: "Il piano Famiglia",
    trialBadge: "Prova gratuita di 14 giorni",
    yearly: "$59 / anno",
    yearlyNote: "cioè $4.92 al mese per tutta la famiglia, e ti fa risparmiare quasi due mesi rispetto al pagamento mensile",
    priceAnchor: "Meno di una singola lezione privata, per un anno intero, per ogni bambino di casa",
    monthly: "$5.99 / mese",
    billedYearly: "Annuale",
    billedMonthly: "Mensile",
    yearlySave: "-18%",
    priceCta: "Inizia la prova",
    cancelNote: "Il primo addebito solo dopo i 14 giorni. Disdici quando vuoi dalla pagina del tuo account, con un clic.",
    singleChild: "Un solo studente in casa? Deep costa $4.99/mese. Per poco di più puoi aggiungere fino a 5 bambini.",
    guaranteeTitle: "La tua prova: due settimane",
    guaranteeBody: "Provalo per due settimane di uso reale, gratis. Se entro il 14° giorno il quaderno di tuo figlio non ha raccolto almeno 20 parole nuove, disdici con un clic e non hai pagato nulla.",
    faqTitle: "Le domande che fanno i genitori",
    faq: [
      {
        q: "Cosa ottengo con Gadit?",
        a: "Ogni parola che tuo figlio cerca riceve una pagina pulita: ogni significato, una spiegazione a misura di bambino (Modalità Bambini), tre esempi reali e un'immagine per ogni significato. In più il contesto (incolla una frase e ottieni il significato giusto), un quaderno delle parole personale con esercizi intelligenti, giochi di parole e quiz, una dashboard per i genitori che mostra quanto ha imparato ogni bambino, fino a 5 bambini su profili separati, tutto in 30+ lingue, in uno spazio chiuso e sicuro senza chat aperta e senza pubblicità.",
      },
      {
        q: "Perché non chiedere semplicemente a un chatbot o a Google?",
        a: "Perché quelli sono strumenti per adulti. Google restituisce pubblicità e link in ogni direzione, e un chatbot aperto è una conversazione senza limiti in cui nessun genitore lascia un bambino da solo. Gadit è costruito al contrario: una pagina chiusa e pulita per ogni parola, a misura di bambino, senza modo di perdersi.",
      },
      {
        q: "Come faccio a sapere che mio figlio sta davvero progredendo?",
        a: "Ricevi una dashboard per i genitori. A colpo d'occhio vedi quante parole ha imparato ciascun bambino, quante ne ha aggiunte questa settimana e le sue parole più recenti. Ogni altro strumento risponde al bambino e dimentica; Gadit salva ogni parola nel quaderno personale del bambino, così guardi il vocabolario crescere settimana dopo settimana.",
      },
      {
        q: "Per quali età è pensato?",
        a: "Il cuore di Gadit sono i bambini in età scolare, dalla prima elementare fino alle superiori. La Modalità Bambini spiega in modo semplice per i più piccoli, e le spiegazioni complete servono anche agli adolescenti e ai genitori. È il genitore che apre l'account.",
      },
      {
        q: "Aiuta con l'inglese e le altre lingue?",
        a: "Moltissimo. Un bambino può cercare una parola in inglese e ottenere una spiegazione semplice nella propria lingua, con un'immagine ed esempi, esattamente l'aiuto che manca a casa. E funziona in 30+ lingue, così il bambino può ricevere la spiegazione anche nella lingua che parlate a casa.",
      },
      {
        q: "Quanto costa?",
        a: "$59 all'anno o $5.99 al mese, dopo la prova di 14 giorni. Nessun costo nascosto, e disdici quando vuoi con un clic.",
      },
      {
        q: "Quanti bambini posso aggiungere?",
        a: "Fino a 5 bambini su un unico piano Famiglia, ognuno con il proprio profilo, quaderno ed esercizi.",
      },
      {
        q: "Possiamo provarlo senza impegno?",
        a: "Sì. La prova inizia con una carta, ma il primo addebito avviene solo quando finiscono i 14 giorni. Disdici quando vuoi prima di allora, con un clic, e non paghi nulla.",
      },
    ],
    finalTitle: "Inizia oggi, e guarda il vocabolario crescere",
    finalSub: "Due settimane gratis. Disdetta con un clic. E un bambino che impara a capire le parole da solo.",
    finalCta: "Inizia la prova gratuita di 14 giorni",
    footerTerms: "Termini",
    footerPrivacy: "Privacy",
  },
  ja: {
    heroBadge: "家族みんなのための、目で見てわかる賢い辞書",
    whatIs: "Gaditは、子どものための目で見てわかる賢い辞書です。どんな言葉も、子どもがわかる説明とイラスト、例文、そして言葉を覚えるのが楽しくなるゲームやクイズで身につきます。語彙が広がり、読解力が伸びて、お子さまの学校の成績も上がっていきます。",
    ctaMicro: "",
    trustLine: "最大5人のお子さままで、それぞれのレベルに合わせて",
    credLine: "15,000人を超える保護者、生徒、教育者と歩んできた15年の経験から生まれました",
    credKicker: "私たちについて",
    credTitle: "教育の現場で15年。その経験を、お子さまのための一つの道具に。",
    credBody: "Gaditは、教育の現場で15年の経験を積み、15,000人を超える保護者、生徒、教育者と関わってきたチームが作りました。教室でも家庭でも何度も効果があったことを、子どもが一人でも使えるシンプルな道具にまとめました。",
    proofTitle: "言葉ノート・例",
    proofBig: "今週の新しい言葉、12個",
    proofWords: ["夢", "鮮やか", "気が進まない"],
    angles: {
      vocab: {
        h1: "お子さまの語彙が、一語ずつ広がっていきます。",
        sub: "お子さまが気になった言葉は、Gaditの自分専用の言葉ノートに残ります。イラストと、子どもがわかる説明、そして身につくまで繰り返す短い練習つきです。月末にノートを開けば、語彙が一語ずつ増えていくのが見えます。",
      },
      relief: {
        h1: "家族の「歩く辞書」を、そろそろ卒業しませんか",
        sub: "今日から、お子さまが「これどういう意味?」と聞いてきたとき、自分で答えを見つけられる場所が一つできます。すべての意味と、それぞれのイラスト、そして子どもの目線に合わせた説明。開かれたチャットも、広告もありません。",
      },
      anxiety: {
        h1: "一字一字は正しく読めても、本当の意味はわかっていない",
        sub: "お子さまはいつも立ち止まって質問するわけではありません。わからない言葉を飛ばして読み進めるので、内容が頭に入りません。やがてそれは学校への不満や「自分にはできない」という気持ちに変わっていきます。Gaditは、立ち止まってしっかり理解し、その言葉を手にして授業に戻れる場所をお子さまに用意します。",
      },
      safe: {
        h1: "心配せずに子どもに渡せる、たった一つの画面",
        sub: "開かれたチャットも、終わりのないフィードも、広告もありません。子どもが言葉を打ち込み、しっかり理解して、また宿題に戻るだけの、すっきりした場所です。",
      },
    },
    heroCta: "14日間の無料トライアルを始める",
    heroTrust: "開かれたチャットなし・広告なし・ワンクリックで解約",
    ownerCta: "家族のスペースへ",
    stats: ["30+言語", "意味ごとにイラスト", "最大5人のお子さままで", "ワンクリックで解約"],
    demoKicker: "その結果",
    demoTitle: "お子さまがどんな言葉も理解し、語彙が毎日広がっていきます",
    painKicker: "本当の悩み",
    painTitle: "お子さまは読めても、いつも本当に理解しているとは限りません",
    painBody1: "お子さまが言葉の意味を聞きに立ち止まってくれるのは、実はありがたいことです。問題は、立ち止まって聞かないほうの言葉です。それらを飛ばして読み進めるので、内容が頭に入りません。語彙はなかなか増えず、読解は一語ごとにつまずいていきます。",
    painBody2: "そしてこれは、成績だけの話ではありません。理解できない子どもは、自分は足りないと感じ、学校に不満を持ち、自信を失っていきます。しかもそれは静かに進み、どこで糸が切れたのか誰にもわからないのです。",
    reframe: "Gaditは、まさにこの場面のためにあります。",
    puzzleKicker: "子どもの頭の中で起きていること",
    puzzleTitle: "文章はパズル。一つ一つの言葉が、そのピースです。",
    puzzleBody: "子どもが読むとき、頭の中では言葉から一つの絵が組み上がっていきます。わかる言葉は、はまるピースです。わからない言葉は、絵にあいた穴です。たった三つか四つ穴があるだけで、子どもはもう絵が見えなくなります。たとえ一字一字は読めていても。",
    puzzleBefore: "言葉が抜けた段落",
    puzzleAfter: "Gaditなら、すべてのピースがそろう",
    puzzleLine: "どの言葉もわかれば、子どもは絵の全体が見えます。",
    chainKicker: "使い方",
    chainTitle: "どんな言葉でも、お子さまが受け取れるすべて",
    chainSteps: [
      "お子さまがわからない言葉を打ち込みます",
      "自分の目線に合った説明と、イラストと、3つの例文が返ってきます",
      "その言葉は自分専用のノートに保存されます",
      "そして、しっかり身につくまで短い練習で戻ってきます",
    ],
    howBlocks: [
      { t: "言葉を打ち込む", b: "お子さまがわからない言葉を、キッズモードで、すっきり安全な場所に打ち込みます。" },
      { t: "わかりやすい定義", b: "子どもの目線に合った説明。難しい言葉を難しい言葉で説明することはありません。" },
      { t: "3つの例文", b: "その言葉が文章の中でどう生きるかを見せる本物の文。ただの無味乾燥な定義ではありません。" },
      { t: "意味ごとのイラスト", b: "子どもは、書かれたものより見たもののほうがずっとよく覚えるからです。" },
      { t: "文脈判定", b: "本の一文を貼り付ければ、Gaditがその文にぴったり合う意味を的確に示します。" },
      { t: "自分専用のノート", b: "お子さまが調べた言葉はすべてノートに保存され、逃げていきません。" },
      { t: "短いクイズ", b: "忘れかけるちょうどそのとき、言葉を呼び戻す手早い問題です。" },
      { t: "ゲーム", b: "お子さま自身が調べた言葉で、遊びながら学びます。" },
    ],
    chainCost: "",
    chainTurnTitle: "そして、あなたが手にするもの",
    chainTurnBody: "お子さまがつまずいた言葉が、知っている言葉に変わっていきます。しかもそれが、はっきり目に見えます。週ごとにいくつの言葉を身につけたのか。何かよくなっているはずと願うのではなく、実際に起きているのをただ見守るだけです。",
    dashKicker: "保護者ダッシュボード",
    dashTitle: "それぞれのお子さまがどれだけ学んだか、はっきりわかります",
    dashBody: "お子さま一人ひとりに、育っていく自分専用の言葉ノートがあります。ダッシュボードでは、各お子さまがいくつの言葉を学んだか、今週いくつ増えたか、直近の言葉は何かがひと目でわかります。ほかの道具はお子さまに答えて、そのまま忘れます。Gaditは覚えていて、週ごとの成長をあなたが見届けられます。",
    dashKids: [
      { name: "ノア", total: 47, week: 12 },
      { name: "イド", total: 31, week: 8 },
      { name: "マヤ", total: 63, week: 15 },
    ],
    dashWordsLabel: "ノートの言葉数",
    dashWeekLabel: "今週",
    featuresKicker: "中身のご紹介",
    features: [
      {
        kicker: "すべての意味",
        title: "一つの言葉。すべての意味。それぞれにイラスト。",
        body: "一つの言葉には、いくつもの違う意味があることがよくあります。子どもが混乱するのは、まさにそこです。Gaditはそれらを一つの場所にまとめて見せます。それぞれに3つの本物の例文と専用のイラストつきです。子どもの脳は、言葉よりも絵のほうがずっとよく覚えるからです。",
      },
      {
        kicker: "キッズモード",
        title: "お子さまの目線に合わせた説明",
        body: "スイッチを一つ切り替えるだけで、どの説明も8歳の子が本当に理解できる言葉に変わります。難しい言葉で難しい言葉を説明することも、堂々巡りの定義もありません。あるのは、わかることだけです。",
      },
      {
        kicker: "文脈判定",
        title: "一文を貼るだけで、正しい意味がわかる",
        body: "たいていの言葉には意味が複数あり、子どもが迷子になるのはそこです。本やプリントの一文を貼り付ければ、Gaditがどの意味が合うかを的確に示します。",
      },
      {
        kicker: "自分専用のノート",
        title: "言葉が逃げていきません",
        body: "お子さまが調べた言葉はすべて自分専用のノートに残り、賢い短い練習が、忘れかけるちょうどそのときに呼び戻します。語彙は本当は、こうして一語ずつ積み上がっていくものです。",
      },
      {
        kicker: "お子さまごとのプロフィール",
        title: "お子さま一人ひとりに、自分の場所を",
        body: "家族のお子さま一人ひとりに、別々のプロフィールがあります。自分のノート、自分の練習、自分の履歴です。キッズモードが説明を合わせ、小さな子にはシンプルで明快に、大きな子にはより詳しく。誰かの言葉を別の子が踏み荒らすこともありません。",
      },
      {
        kicker: "言葉のゲーム",
        title: "お子さまの言葉で遊ぶ学習ゲーム",
        body: "お子さまが実際に調べた言葉から作られる、短いクイズとゲームです。数分遊ぶだけで、語彙が無理なく広がっていきます。",
      },
      {
        kicker: "第二言語",
        title: "第二言語の宿題に、いちばん頼れる助っ人",
        body: "お子さまが英語の言葉を打ち込むと、自分の言語でのシンプルな説明が、イラストと例文つきで返ってきます。辞書と翻訳とYouTubeを行き来する必要はもうありません。",
      },
    ],
    midCtaTitle: "今すぐ始めて、お子さまの語彙が日に日に広がるのを見届けましょう",
    midCta: "14日間の無料トライアルを始める",
    compareKicker: "その違い",
    compareTitle: "検索したり、チャットボットに聞いたりするだけではダメなの?",
    compareGadit: "Gadit",
    compareOther: "普通のインターネット",
    compareRows: [
      { label: "言葉ごとに、すっきりした1ページ", gadit: true, other: false },
      { label: "子どもの目線に合わせた説明", gadit: true, other: false },
      { label: "意味ごとのイラスト", gadit: true, other: false },
      { label: "身につくノートと練習", gadit: true, other: false },
      { label: "あちこちに広告とリンク", gadit: false, other: true },
      { label: "際限のない自由なチャット", gadit: false, other: true },
    ],
    safeTitle: "独立した、すっきりした場所。どこかへの入り口ではありません。",
    safeBody: "Gaditは完全に閉じた空間です。開かれたチャットも、フィードも、広告も、外部リンクもありません。子どもがここからTikTokや他のアプリへ引き込まれることはありません。ここですることは一つだけ。言葉を理解して、また勉強に戻ることです。",
    safeLine: "安心した気持ちで子どもに渡せる、一つの画面。",
    stackTitle: "ファミリープランに含まれるもの",
    stackItems: [
      "家族みんなで検索し放題",
      "すべての意味を、それぞれのイラストとともに",
      "どの年齢にも合うキッズモード",
      "その場でフィードバックが返る文チェック",
      "お子さまごとの自分専用ノートと賢い練習",
      "言葉のゲームとクイズ",
      "別々のプロフィールで最大5人のお子さままで",
      "30+言語にしっかり対応",
    ],
    priceKicker: "料金",
    priceTitle: "ファミリープラン",
    trialBadge: "14日間無料トライアル",
    yearly: "$59 / year",
    yearlyNote: "家族みんなで月あたり$4.92。月々払いに比べて2か月分近くおトクです",
    priceAnchor: "家庭教師1回分より安く、家じゅうのどのお子さまも、まる1年使えます",
    monthly: "$5.99 / month",
    billedYearly: "年払い",
    billedMonthly: "月払い",
    yearlySave: "-18%",
    priceCta: "トライアルを始める",
    cancelNote: "初回の請求は14日間が終わってから。解約はいつでも、アカウントページからワンクリックで。",
    singleChild: "お家に生徒さんが1人だけなら、Deepが月$4.99です。あと少し足せば、最大5人のお子さままで追加できます。",
    guaranteeTitle: "あなたのお試し期間は、2週間です",
    guaranteeBody: "まずは2週間、無料で本気で使ってみてください。もし14日目までにお子さまのノートに新しい言葉が20個以上たまっていなければ、ワンクリックで解約でき、料金は一切かかりません。",
    faqTitle: "保護者からよくいただく質問",
    faq: [
      {
        q: "Gaditで何が手に入りますか?",
        a: "お子さまが調べた言葉ごとに、すっきりした1ページが手に入ります。すべての意味、子どもの目線に合わせた説明(キッズモード)、3つの本物の例文、そして意味ごとのイラストです。さらに文脈判定(一文を貼れば正しい意味が返る)、賢い練習つきの自分専用の言葉ノート、言葉のゲームとクイズ、各お子さまの学習量がわかる保護者ダッシュボード、別々のプロフィールで最大5人のお子さままで、これらすべてが30+言語で、開かれたチャットも広告もない、閉じた安全な空間で使えます。",
      },
      {
        q: "チャットボットや検索に聞くだけではダメなの?",
        a: "それらは大人のための道具だからです。検索はあちこちに広告とリンクを返し、開かれたチャットボットは、どの親も子どもを一人にしておけない際限のない会話です。Gaditはその逆に作られています。言葉ごとに閉じた、すっきりした1ページを、子どもの目線で。迷子になりようがありません。",
      },
      {
        q: "うちの子が本当に伸びているか、どうやってわかりますか?",
        a: "保護者ダッシュボードが手に入ります。各お子さまがいくつの言葉を学んだか、今週いくつ増えたか、直近の言葉は何かがひと目でわかります。ほかの道具はどれも、子どもに答えて忘れてしまいます。Gaditはすべての言葉を子どもの自分専用ノートに保存するので、週ごとに語彙が広がるのを見届けられます。",
      },
      {
        q: "何歳向けですか?",
        a: "Gaditの中心は、小学1年生から高校生までの学齢のお子さまです。キッズモードが小さな子にはやさしく説明し、詳しい説明は中高生や保護者にも役立ちます。アカウントは保護者が開きます。",
      },
      {
        q: "英語やほかの言語にも役立ちますか?",
        a: "とても役立ちます。お子さまは英語の言葉を調べて、自分の言語でのシンプルな説明を、イラストと例文つきで受け取れます。まさに家庭に足りなかった助っ人です。30+言語で使えるので、お家で話す言語で説明を受け取ることもできます。",
      },
      {
        q: "料金はいくらですか?",
        a: "14日間のトライアルのあと、年$59または月$5.99です。隠れた費用はなく、いつでもワンクリックで解約できます。",
      },
      {
        q: "お子さまは何人まで追加できますか?",
        a: "1つのファミリープランで最大5人のお子さままで。それぞれに自分のプロフィール、ノート、練習があります。",
      },
      {
        q: "気軽に試せますか?",
        a: "はい。トライアルはカード登録から始まりますが、初回の請求は14日間が終わったときだけです。それまでにいつでもワンクリックで解約でき、料金は一切かかりません。",
      },
    ],
    finalTitle: "今日から始めて、語彙が広がっていくのを見届けましょう",
    finalSub: "2週間無料。ワンクリック解約。そして、言葉を自分で理解できるようになるお子さま。",
    finalCta: "14日間の無料トライアルを始める",
    footerTerms: "利用規約",
    footerPrivacy: "プライバシー",
  },
  hi: {
    heroBadge: "पूरे परिवार के लिए एक विज़ुअल, स्मार्ट डिक्शनरी",
    whatIs: "Gadit बच्चों के लिए एक स्मार्ट, विज़ुअल डिक्शनरी है: हर शब्द के साथ बच्चों की समझ के हिसाब से आसान समझाइश, एक तस्वीर, उदाहरण, और ऐसे गेम्स और क्विज़ जो शब्द सीखना मज़ेदार बना देते हैं। शब्दभंडार बढ़ता है, पढ़ने की समझ बेहतर होती है, और आपका बच्चा स्कूल में आगे निकलता है।",
    ctaMicro: "",
    trustLine: "5 बच्चों तक, हर एक अपने-अपने स्तर पर",
    credLine: "15,000 से ज़्यादा माता-पिता, विद्यार्थियों और शिक्षकों के साथ 15 साल के अनुभव पर आधारित",
    credKicker: "हम कौन हैं",
    credTitle: "शिक्षा में 15 साल। अब आपके बच्चे के लिए एक टूल में।",
    credBody: "Gadit को उस टीम ने बनाया है जिसके पास शिक्षा में 15 साल का अनुभव है और जिसने 15,000 से ज़्यादा माता-पिता, विद्यार्थियों और शिक्षकों के साथ काम किया है। क्लासरूम में और घर पर, जो चीज़ें बार-बार काम करती देखीं, उन सबको हमने एक ऐसे आसान टूल में डाल दिया जिसे बच्चा खुद इस्तेमाल कर सकता है।",
    proofTitle: "शब्द नोटबुक · उदाहरण",
    proofBig: "इस हफ़्ते 12 नए शब्द",
    proofWords: ["सपना", "जीवंत", "हिचकिचाता"],
    angles: {
      vocab: {
        h1: "आपके बच्चे का शब्दभंडार बढ़ता है। एक-एक शब्द करके।",
        sub: "आपका बच्चा जो भी शब्द पूछता है, वह Gadit में उसकी अपनी शब्द नोटबुक में जुड़ जाता है: एक तस्वीर, बच्चों के स्तर की समझाइश, और छोटी-सी प्रैक्टिस के साथ जो उसे तब तक लौटाती रहती है जब तक वह शब्द बच्चे का अपना न बन जाए। महीने के आख़िर में नोटबुक खोलिए और देखिए शब्दभंडार कैसे बढ़ता है, एक-एक शब्द करके।",
      },
      relief: {
        h1: "अब आपको परिवार की चलती-फिरती डिक्शनरी नहीं बनना पड़ेगा",
        sub: "आज से, जब आपका बच्चा पूछे „इसका मतलब क्या है?“, तो उसके पास जवाब खुद ढूँढने की एक जगह होगी: हर मतलब, हर एक के लिए एक तस्वीर, और बच्चों के स्तर पर समझाइश। कोई खुला चैट नहीं, कोई विज्ञापन नहीं।",
      },
      anxiety: {
        h1: "आपका बच्चा हर शब्द सही पढ़ता है, पर सच में समझ नहीं पाता",
        sub: "वह हमेशा रुककर पूछता नहीं। जो शब्द समझ नहीं आता उसे छोड़कर आगे बढ़ जाता है, और विषय दिमाग में बैठता ही नहीं। समय के साथ यह स्कूल को लेकर निराशा और „मुझसे नहीं होगा“ जैसी भावना में बदल जाता है। Gadit आपके बच्चे को एक जगह देता है जहाँ वह रुके, सच में समझे, और शब्द अपने साथ लेकर पाठ पर वापस लौटे।",
      },
      safe: {
        h1: "वह इकलौती स्क्रीन जो आप बच्चे को बेफ़िक्र थमा सकते हैं",
        sub: "कोई खुला चैट नहीं। कोई अंतहीन फ़ीड नहीं। कोई विज्ञापन नहीं। एक साफ़-सुथरी जगह जहाँ बच्चा शब्द टाइप करता है, उसे पूरी तरह समझता है, और होमवर्क पर लौट जाता है।",
      },
    },
    heroCta: "अपना 14-दिन का मुफ़्त ट्रायल शुरू करें",
    heroTrust: "कोई खुला चैट नहीं · कोई विज्ञापन नहीं · एक क्लिक में रद्द करें",
    ownerCta: "अपने फ़ैमिली स्पेस पर जाएँ",
    stats: ["30+ भाषाएँ", "हर मतलब के लिए एक तस्वीर", "5 बच्चों तक", "एक क्लिक में रद्द"],
    demoKicker: "नतीजा",
    demoTitle: "आपका बच्चा हर शब्द समझता है, और उसका शब्दभंडार हर दिन बढ़ता है",
    painKicker: "असली तकलीफ़",
    painTitle: "आपका बच्चा पढ़ता है, पर हमेशा सच में समझ नहीं पाता",
    painBody1: "जब आपका बच्चा रुककर किसी शब्द का मतलब पूछता है, तो असल में आपको ख़ुशी होती है। दिक्कत उन सब शब्दों की है जिन्हें पूछने के लिए वह रुकता ही नहीं। उन्हें छोड़कर आगे पढ़ता रहता है, और विषय दिमाग में बैठता नहीं। शब्दभंडार कमज़ोर रह जाता है, और समझ एक-एक शब्द पर टूटती जाती है।",
    painBody2: "और इसका असर सिर्फ़ नंबरों तक सीमित नहीं रहता। जो बच्चा समझ नहीं पाता वह ख़ुद को कमतर महसूस करता है, स्कूल से चिढ़ने लगता है, और आत्मविश्वास खो देता है। और यह सब चुपचाप होता है, जहाँ कोई यह बता ही नहीं पाता कि कड़ी कहाँ टूटी।",
    reframe: "और ठीक यहीं Gadit काम आता है।",
    puzzleKicker: "बच्चे के दिमाग में क्या होता है",
    puzzleTitle: "पाठ एक पहेली है। हर शब्द एक टुकड़ा है।",
    puzzleBody: "जब बच्चा पढ़ता है, तो उसका मन शब्दों से एक पूरी तस्वीर जोड़ता है। हर समझा हुआ शब्द एक टुकड़ा है जो सही जगह बैठ जाता है। हर छूटा हुआ शब्द तस्वीर में एक छेद है। बस तीन-चार छेद, और बच्चे को पूरी तस्वीर दिखनी बंद हो जाती है, भले ही उसने हर अक्षर सही पढ़ा हो।",
    puzzleBefore: "छूटे हुए शब्दों वाला एक पैराग्राफ़",
    puzzleAfter: "Gadit के साथ, हर टुकड़ा अपनी जगह",
    puzzleLine: "जब हर शब्द साफ़ हो, तो बच्चा पूरी तस्वीर देख पाता है।",
    chainKicker: "यह कैसे काम करता है",
    chainTitle: "हर शब्द पर आपके बच्चे को जो कुछ मिलता है",
    chainSteps: [
      "आपका बच्चा वह शब्द टाइप करता है जो उसे समझ नहीं आता",
      "उसे उसकी समझ के स्तर पर समझाइश, एक तस्वीर और तीन उदाहरण मिलते हैं",
      "वह शब्द उसकी अपनी नोटबुक में सहेज लिया जाता है",
      "और छोटी प्रैक्टिस में लौटता रहता है, जब तक वह सच में उसका अपना न बन जाए",
    ],
    howBlocks: [
      { t: "शब्द टाइप करें", b: "आपका बच्चा जो भी शब्द समझ न आए उसे किड्स मोड में, एक साफ़ और सुरक्षित जगह पर टाइप करता है।" },
      { t: "एक साफ़ परिभाषा", b: "बच्चे की समझ के स्तर पर समझाइश, कठिन शब्दों को समझाने के लिए और कठिन शब्दों का इस्तेमाल नहीं।" },
      { t: "तीन उदाहरण", b: "असली वाक्य जो दिखाते हैं कि शब्द किसी पाठ के अंदर कैसे जीता है, सिर्फ़ एक सूखी परिभाषा नहीं।" },
      { t: "हर मतलब के लिए एक तस्वीर", b: "क्योंकि बच्चे जो देखते हैं उसे लिखे हुए से कहीं बेहतर याद रखते हैं।" },
      { t: "संदर्भ", b: "किताब से एक वाक्य पेस्ट करें और Gadit ठीक वही मतलब चिह्नित कर देता है जो उसमें फ़िट बैठता है।" },
      { t: "एक निजी नोटबुक", b: "आपके बच्चे ने जो भी शब्द देखा, वह उसकी नोटबुक में सहेजा जाता है, और भाग नहीं जाता।" },
      { t: "एक छोटा क्विज़", b: "एक झटपट सवाल जो शब्द को ठीक उससे पहले लौटा लाता है जब वह भूलने वाला हो।" },
      { t: "एक गेम", b: "खेल-खेल में सीखना, उन्हीं शब्दों पर जो आपके बच्चे ने ख़ुद देखे हैं।" },
    ],
    chainCost: "",
    chainTurnTitle: "और यह आपको मिलता है",
    chainTurnBody: "आपका बच्चा जिस भी शब्द पर अटका, वह उसका जाना-पहचाना शब्द बन जाता है, और आप इसे साफ़-साफ़ देखते हैं: उसने कितने शब्द पक्के किए, हफ़्ता दर हफ़्ता। कुछ सुधर रहा है, इसकी उम्मीद करने के बजाय आप बस इसे होते हुए देखते हैं।",
    dashKicker: "पैरेंट डैशबोर्ड",
    dashTitle: "आप ठीक-ठीक देखते हैं कि हर बच्चे ने कितना सीखा",
    dashBody: "हर बच्चे की अपनी शब्द नोटबुक होती है जो बढ़ती रहती है। आपके डैशबोर्ड में आप एक नज़र में देखते हैं कि हर बच्चे ने कितने शब्द सीखे, इस हफ़्ते कितने जुड़े, और उसके सबसे नए शब्द कौन से हैं। कोई भी दूसरा टूल आपके बच्चे को जवाब देता है और भूल जाता है। Gadit याद रखता है, और आप हफ़्ता दर हफ़्ता प्रगति देखते हैं।",
    dashKids: [
      { name: "नोआ", total: 47, week: 12 },
      { name: "इदो", total: 31, week: 8 },
      { name: "माया", total: 63, week: 15 },
    ],
    dashWordsLabel: "नोटबुक में शब्द",
    dashWeekLabel: "इस हफ़्ते",
    featuresKicker: "अंदर क्या है",
    features: [
      {
        kicker: "हर मतलब",
        title: "एक शब्द। हर मतलब। हर एक के लिए एक तस्वीर।",
        body: "एक ही शब्द के अक्सर कई अलग-अलग मतलब होते हैं, और यहीं बच्चे उलझ जाते हैं। Gadit उन सबको एक जगह दिखाता है, हर एक के साथ तीन असली उदाहरण और उसकी अपनी तस्वीर, क्योंकि बच्चे का दिमाग शब्दों से कहीं बेहतर तस्वीरें याद रखता है।",
      },
      {
        kicker: "किड्स मोड",
        title: "आपके बच्चे की समझ के स्तर पर समझाइश",
        body: "एक ही स्विच, और हर समझाइश ऐसी भाषा में बदल जाती है जो 8 साल का बच्चा सच में समझता है। कठिन शब्दों को समझाने के लिए कठिन शब्द नहीं, घुमावदार परिभाषाएँ नहीं। बस समझ।",
      },
      {
        kicker: "संदर्भ",
        title: "एक वाक्य पेस्ट करें, सही मतलब पाएँ",
        body: "ज़्यादातर शब्दों के एक से ज़्यादा मतलब होते हैं, और यहीं बच्चे रास्ता भटक जाते हैं। किताब या वर्कशीट से वाक्य पेस्ट करें, और Gadit ठीक वही मतलब चिह्नित कर देता है जो फ़िट बैठता है।",
      },
      {
        kicker: "निजी नोटबुक",
        title: "शब्द भागते नहीं",
        body: "आपका बच्चा जो भी शब्द देखता है वह उसकी निजी नोटबुक में जुड़ जाता है, और छोटी स्मार्ट प्रैक्टिस उसे ठीक उससे पहले लौटा लाती है जब वह भूलने वाला हो। असल में शब्दभंडार ऐसे ही बनता है, एक-एक शब्द करके।",
      },
      {
        kicker: "हर बच्चे का अपना प्रोफ़ाइल",
        title: "हर बच्चे को अपनी जगह मिलती है",
        body: "परिवार के हर बच्चे को एक अलग प्रोफ़ाइल मिलता है: उसकी नोटबुक, उसकी प्रैक्टिस, उसका इतिहास। किड्स मोड समझाइश को ढाल लेता है, छोटों के लिए आसान और साफ़, और बड़ों के लिए ज़्यादा भरपूर, और किसी के शब्द किसी दूसरे से नहीं टकराते।",
      },
      {
        kicker: "शब्द गेम्स",
        title: "आपके बच्चे के अपने शब्दों पर सीखने वाले गेम्स",
        body: "छोटे क्विज़ और गेम्स जो उन्हीं शब्दों से बनते हैं जो आपके बच्चे ने सचमुच देखे। कुछ मिनट का खेल, और शब्दभंडार बिना मेहनत के बढ़ता है।",
      },
      {
        kicker: "दूसरी भाषा",
        title: "दूसरी भाषा के होमवर्क में सबसे अच्छा साथी",
        body: "आपका बच्चा अंग्रेज़ी में एक शब्द टाइप करता है और अपनी भाषा में एक आसान समझाइश पाता है, तस्वीर और उदाहरणों के साथ। डिक्शनरी, ट्रांसलेटर और YouTube के बीच भटकने की ज़रूरत नहीं।",
      },
    ],
    midCtaTitle: "अभी शुरू करें, और देखें कैसे आपके बच्चे का शब्दभंडार दिन-ब-दिन बढ़ता है",
    midCta: "अपना 14-दिन का मुफ़्त ट्रायल शुरू करें",
    compareKicker: "फ़र्क",
    compareTitle: "बस Google या किसी चैटबॉट से क्यों न पूछें?",
    compareGadit: "Gadit",
    compareOther: "खुला इंटरनेट",
    compareRows: [
      { label: "हर शब्द के लिए एक साफ़ पेज", gadit: true, other: false },
      { label: "बच्चों के स्तर पर समझाइश", gadit: true, other: false },
      { label: "हर मतलब के लिए एक तस्वीर", gadit: true, other: false },
      { label: "एक नोटबुक और प्रैक्टिस जो टिकती है", gadit: true, other: false },
      { label: "हर तरफ़ विज्ञापन और लिंक", gadit: false, other: true },
      { label: "बिना किसी सीमा का खुला चैट", gadit: false, other: true },
    ],
    safeTitle: "एक अलग, साफ़ ज़ोन। कहीं और जाने का दरवाज़ा नहीं।",
    safeBody: "Gadit एक पूरी तरह बंद जगह है: कोई खुला चैट नहीं, कोई फ़ीड नहीं, कोई विज्ञापन नहीं, बाहर ले जाने वाला कोई लिंक नहीं। बच्चा यहाँ से खिंचकर TikTok या किसी और ऐप में नहीं चला जाता। यहाँ करने को एक ही चीज़ है: एक शब्द समझना, और पढ़ाई पर वापस लौट जाना।",
    safeLine: "एक स्क्रीन जो आप निश्चिंत मन से बच्चे को थमा सकते हैं।",
    stackTitle: "फ़ैमिली प्लान में क्या-क्या शामिल है",
    stackItems: [
      "पूरे परिवार के लिए असीमित खोज",
      "हर मतलब, हर एक के लिए एक तस्वीर के साथ",
      "हर उम्र के लिए किड्स मोड",
      "तुरंत फ़ीडबैक के साथ वाक्य जाँच",
      "हर बच्चे के लिए एक निजी नोटबुक और स्मार्ट प्रैक्टिस",
      "शब्द गेम्स और क्विज़",
      "अलग प्रोफ़ाइल के साथ 5 बच्चों तक",
      "पूरे सहयोग के साथ 30+ भाषाएँ",
    ],
    priceKicker: "कीमत",
    priceTitle: "फ़ैमिली प्लान",
    trialBadge: "14-दिन का मुफ़्त ट्रायल",
    yearly: "$59 / साल",
    yearlyNote: "यानी पूरे परिवार के लिए $4.92 महीना, और मासिक भुगतान की तुलना में यह आपके लगभग दो महीने बचाता है",
    priceAnchor: "एक प्राइवेट ट्यूशन सेशन से भी कम में, पूरे एक साल के लिए, घर के हर बच्चे के लिए",
    monthly: "$5.99 / महीना",
    billedYearly: "सालाना",
    billedMonthly: "मासिक",
    yearlySave: "-18%",
    priceCta: "ट्रायल शुरू करें",
    cancelNote: "पहला शुल्क 14 दिनों के बाद ही। कभी भी अपने अकाउंट पेज से रद्द करें, एक क्लिक में।",
    singleChild: "घर पर बस एक ही विद्यार्थी? Deep $4.99/महीना है। थोड़ा और देकर आप 5 बच्चों तक जोड़ सकते हैं।",
    guaranteeTitle: "आपकी परख: दो हफ़्ते",
    guaranteeBody: "इसे दो हफ़्ते सचमुच इस्तेमाल करके देखें, मुफ़्त में। अगर 14वें दिन तक आपके बच्चे की नोटबुक में कम से कम 20 नए शब्द न जुड़े हों, तो एक क्लिक में रद्द करें और आपने कुछ भी नहीं चुकाया।",
    faqTitle: "जो सवाल माता-पिता पूछते हैं",
    faq: [
      {
        q: "Gadit से मुझे क्या मिलता है?",
        a: "आपका बच्चा जो भी शब्द देखता है उसके लिए एक साफ़ पेज मिलता है: हर मतलब, बच्चों के स्तर की समझाइश (किड्स मोड), तीन असली उदाहरण, और हर मतलब के लिए एक तस्वीर। इसके अलावा संदर्भ (एक वाक्य पेस्ट करें और सही मतलब पाएँ), स्मार्ट प्रैक्टिस के साथ एक निजी शब्द नोटबुक, शब्द गेम्स और क्विज़, एक पैरेंट डैशबोर्ड जो दिखाता है कि हर बच्चे ने कितना सीखा, अलग प्रोफ़ाइल पर 5 बच्चों तक, यह सब 30+ भाषाओं में, एक बंद, सुरक्षित जगह में जहाँ कोई खुला चैट और कोई विज्ञापन नहीं।",
      },
      {
        q: "बस किसी चैटबॉट या Google से क्यों न पूछें?",
        a: "क्योंकि वे बड़ों के लिए बने टूल हैं। Google हर तरफ़ विज्ञापन और लिंक लौटाता है, और एक खुला चैटबॉट एक असीम बातचीत है जिसमें कोई माता-पिता बच्चे को अकेला नहीं छोड़ते। Gadit ठीक उलटा बना है: हर शब्द के लिए एक बंद, साफ़ पेज, बच्चों के स्तर पर, जहाँ भटकने का कोई रास्ता नहीं।",
      },
      {
        q: "मुझे कैसे पता चलेगा कि मेरा बच्चा सचमुच आगे बढ़ रहा है?",
        a: "आपको एक पैरेंट डैशबोर्ड मिलता है। एक नज़र में आप देखते हैं कि हर बच्चे ने कितने शब्द सीखे, इस हफ़्ते कितने जुड़े, और उसके सबसे नए शब्द कौन से हैं। हर दूसरा टूल बच्चे को जवाब देकर भूल जाता है; Gadit हर शब्द को बच्चे की निजी नोटबुक में सहेजता है, ताकि आप हफ़्ता दर हफ़्ता शब्दभंडार बढ़ते देखें।",
      },
      {
        q: "यह किस उम्र के लिए है?",
        a: "Gadit का दिल स्कूल जाने वाले बच्चे हैं, पहली कक्षा से हाई स्कूल तक। किड्स मोड छोटों के लिए आसान समझाता है, और पूरी समझाइश किशोरों और माता-पिता के भी काम आती है। अकाउंट माता-पिता खोलते हैं।",
      },
      {
        q: "क्या यह अंग्रेज़ी और दूसरी भाषाओं में मदद करता है?",
        a: "बहुत ज़्यादा। बच्चा अंग्रेज़ी में एक शब्द देख सकता है और अपनी भाषा में एक आसान समझाइश पा सकता है, तस्वीर और उदाहरणों के साथ, ठीक वही साथी जो घर पर नहीं होता। और यह 30+ भाषाओं में काम करता है, इसलिए बच्चा उस भाषा में भी समझाइश पा सकता है जो आप घर पर बोलते हैं।",
      },
      {
        q: "इसकी कीमत कितनी है?",
        a: "14-दिन के ट्रायल के बाद, $59 साल या $5.99 महीना। कोई छिपा शुल्क नहीं, और आप कभी भी एक क्लिक में रद्द कर सकते हैं।",
      },
      {
        q: "मैं कितने बच्चे जोड़ सकता हूँ?",
        a: "एक फ़ैमिली प्लान पर 5 बच्चों तक, हर एक का अपना प्रोफ़ाइल, नोटबुक और प्रैक्टिस।",
      },
      {
        q: "क्या हम बिना किसी बंधन के इसे आज़मा सकते हैं?",
        a: "हाँ। ट्रायल कार्ड से शुरू होता है, पर पहला शुल्क तभी लगता है जब 14 दिन ख़त्म होते हैं। उससे पहले कभी भी रद्द करें, एक क्लिक में, और आप कुछ भी नहीं चुकाते।",
      },
    ],
    finalTitle: "आज ही शुरू करें, और देखें शब्दभंडार को बढ़ते हुए",
    finalSub: "दो हफ़्ते मुफ़्त। एक क्लिक में रद्द। और एक ऐसा बच्चा जो शब्दों को ख़ुद समझना सीखता है।",
    finalCta: "अपना 14-दिन का मुफ़्त ट्रायल शुरू करें",
    footerTerms: "शर्तें",
    footerPrivacy: "गोपनीयता",
  },
  am: {
    heroBadge: "ለመላው ቤተሰብ የተዘጋጀ ምስላዊ እና ብልህ መዝገበ ቃላት",
    whatIs: "Gadit ለልጆች የተሰራ ብልህ እና ምስላዊ መዝገበ ቃላት ነው። እያንዳንዱ ቃል በልጅ ደረጃ ማብራሪያ፣ ስዕል፣ ምሳሌዎች እንዲሁም ቃላትን መማር አስደሳች የሚያደርጉ ጨዋታዎችና ፈተናዎች ያገኛል። የቃላት ክምችት ያድጋል፣ የንባብ ግንዛቤ ይሻሻላል፣ ልጅዎም በትምህርት ቤት የተሻለ ውጤት ያመጣል።",
    ctaMicro: "",
    trustLine: "እስከ 5 ልጆች፣ እያንዳንዱ በራሱ ደረጃ",
    credLine: "ከ15,000 በላይ ወላጆች፣ ተማሪዎችና አስተማሪዎች ጋር በ15 ዓመት ልምድ ላይ የተመሠረተ",
    credKicker: "እኛ ማን ነን",
    credTitle: "በትምህርት 15 ዓመት። አሁን ለልጅዎ በአንድ መሣሪያ ውስጥ።",
    credBody: "Gadit በትምህርት ዘርፍ የ15 ዓመት ልምድ ባለው፣ ከ15,000 በላይ ወላጆች፣ ተማሪዎችና አስተማሪዎች ጋር በሠራ ቡድን ተገንብቷል። በክፍል ውስጥም ሆነ በቤት ውስጥ ደጋግመን ሲሠራ ያየነውን ነገር፣ ልጅ ብቻውን ሊጠቀምበት በሚችል አንድ ቀላል መሣሪያ ውስጥ አኖርነው።",
    proofTitle: "የቃላት ደብተር · ምሳሌ",
    proofBig: "በዚህ ሳምንት 12 አዲስ ቃላት",
    proofWords: ["ሕልም", "ግልጽ", "ወደኋላ የሚል"],
    angles: {
      vocab: {
        h1: "የልጅዎ የቃላት ክምችት ያድጋል። ቃል በቃል።",
        sub: "ልጅዎ የሚጠይቀው እያንዳንዱ ቃል በGadit ውስጥ ወዳለው የግል ቃላት ደብተሩ ይገባል፦ ከስዕል፣ ከልጅ ደረጃ ማብራሪያ እና እስኪያውቀው ድረስ ቃሉን መልሶ ከሚያመጣ አጭር ልምምድ ጋር። በወሩ መጨረሻ ደብተሩን ክፈትና የቃላት ክምችቱ ቃል በቃል ሲያድግ ተመልከት።",
      },
      relief: {
        h1: "የቤተሰቡ መዝገበ ቃላት መሆንህን አቁም",
        sub: "ከዛሬ ጀምሮ ልጅህ 'ይህ ምን ማለት ነው?' ብሎ ሲጠይቅ፣ መልሱን ብቻውን የሚያገኝበት አንድ ቦታ አለው፦ እያንዳንዱ ትርጉም፣ ለእያንዳንዱ ስዕል፣ በልጅ ደረጃ ማብራሪያ። ክፍት ውይይት የለም፣ ማስታወቂያ የለም።",
      },
      anxiety: {
        h1: "ልጅዎ እያንዳንዱን ቃል በትክክል ያነባል፣ ግን በእውነት አይረዳም",
        sub: "ሁልጊዜ ለመጠየቅ አይቆምም። ያልገባውን ቃል ዘሎ አልፎ ይቀጥላል፣ ትምህርቱም ወደ አእምሮው አይገባም። ከጊዜ በኋላ ይህ ወደ ትምህርት ቤት ብስጭትና 'ይህን መስራት አልችልም' ወደሚል ስሜት ይለወጣል። Gadit ልጅዎ የሚቆምበት፣ በእውነት የሚረዳበት እና ቃሉን ይዞ ወደ ትምህርቱ የሚመለስበት አንድ ቦታ ይሰጠዋል።",
      },
      safe: {
        h1: "ያለ ስጋት ለልጅ ማስረከብ የሚቻል ብቸኛው ስክሪን",
        sub: "ክፍት ውይይት የለም። የማያልቅ ዝርዝር የለም። ማስታወቂያ የለም። ልጅ ቃል የሚጽፍበት፣ ሙሉ በሙሉ የሚረዳበት እና ወደ የቤት ስራው የሚመለስበት አንድ ንጹህ ቦታ።",
      },
    },
    heroCta: "የ14 ቀን ነጻ ሙከራዎን ይጀምሩ",
    heroTrust: "ክፍት ውይይት የለም · ማስታወቂያ የለም · በአንድ ጠቅታ ይሰርዙ",
    ownerCta: "ወደ የቤተሰብ ቦታዎ ይሂዱ",
    stats: ["30+ ቋንቋዎች", "ለእያንዳንዱ ትርጉም ስዕል", "እስከ 5 ልጆች", "በአንድ ጠቅታ ይሰርዙ"],
    demoKicker: "ውጤቱ",
    demoTitle: "ልጅዎ እያንዳንዱን ቃል ይረዳል፣ የቃላት ክምችቱም በየቀኑ ያድጋል",
    painKicker: "እውነተኛው ህመም",
    painTitle: "ልጅዎ ያነባል፣ ግን ሁልጊዜ በእውነት አይረዳም",
    painBody1: "ልጅዎ የቃል ትርጉም ለመጠየቅ ሲቆም በእውነቱ ደስ ይልዎታል። ችግሩ ለመጠየቅ የማይቆምባቸው ሁሉም ቃላት ናቸው። ዘሎ ያልፋቸዋል፣ ማንበቡን ይቀጥላል፣ ትምህርቱም ወደ አእምሮው አይገባም። የቃላት ክምችት ቀጭን ሆኖ ይቀራል፣ ግንዛቤም ቃል በቃል ይሰበራል።",
    painBody2: "ይህም ከውጤት እጅግ በላይ ይነካል። የማይረዳ ልጅ በቂ አለመሆኑን ይሰማዋል፣ በትምህርት ቤት ይበሳጫል፣ በራስ የመተማመን ስሜቱንም ያጣል። ይህም ማንም ክሩ የተበጠሰበትን ቦታ ማመልከት ሳይችል፣ በጸጥታ ይከሰታል።",
    reframe: "Gadit የሚገባው በትክክል እዚህ ጋር ነው።",
    puzzleKicker: "በልጅ ጭንቅላት ውስጥ ምን ይከሰታል",
    puzzleTitle: "ጽሑፍ ፐዝል ነው። እያንዳንዱ ቃል ቁራጭ ነው።",
    puzzleBody: "ልጅ ሲያነብ አእምሮው ከቃላቱ ሙሉ ምስል ይገጣጥማል። የሚረዳው እያንዳንዱ ቃል ቦታውን የሚይዝ ቁራጭ ነው። የጎደለ እያንዳንዱ ቃል በምስሉ ውስጥ ቀዳዳ ነው። ሦስት ወይም አራት ቀዳዳዎች ብቻ፣ ልጁ እያንዳንዱን ፊደል ቢያነብም እንኳ ምስሉን ከእንግዲህ አያየውም።",
    puzzleBefore: "ቃላት የጎደሉት አንቀጽ",
    puzzleAfter: "ከGadit ጋር፣ እያንዳንዱ ቁራጭ በቦታው",
    puzzleLine: "እያንዳንዱ ቃል ግልጽ ሲሆን፣ ልጁ ሙሉውን ምስል ያያል።",
    chainKicker: "እንዴት እንደሚሰራ",
    chainTitle: "ልጅዎ በእያንዳንዱ ቃል የሚያገኘው ሁሉ",
    chainSteps: [
      "ልጅዎ ያልገባውን ቃል ይጽፋል",
      "በዓይኑ ደረጃ ማብራሪያ፣ ስዕል እና ሦስት ምሳሌዎችን ያገኛል",
      "ቃሉ በግል ደብተሩ ውስጥ ይቀመጣል",
      "እና በእውነት እስኪያውቀው ድረስ በአጭር ልምምድ ውስጥ ይመለሳል",
    ],
    howBlocks: [
      { t: "ቃሉን ይጻፉ", b: "ልጅዎ ያልገባውን ማንኛውንም ቃል፣ በልጆች ሁነታ ውስጥ፣ በንጹህና ደህንነቱ በተጠበቀ ቦታ ይጽፋል።" },
      { t: "ግልጽ ትርጉም", b: "በልጁ ዓይን ደረጃ ማብራሪያ፣ ከባድ ቃላትን በከባድ ቃላት ማብራራት የለም።" },
      { t: "ሦስት ምሳሌዎች", b: "ቃሉ በጽሑፍ ውስጥ እንዴት እንደሚኖር የሚያሳዩ እውነተኛ ዓረፍተ ነገሮች፣ ደረቅ ትርጉም ብቻ አይደለም።" },
      { t: "ለእያንዳንዱ ትርጉም ስዕል", b: "ልጆች ከተጻፈላቸው ይልቅ የሚያዩትን በጣም በተሻለ ሁኔታ ስለሚያስታውሱ።" },
      { t: "አውድ", b: "ከመጽሐፉ ዓረፍተ ነገር ይለጥፉ፣ Gadit ከዚያ ጋር የሚስማማውን ትርጉም በትክክል ያመለክታል።" },
      { t: "የግል ደብተር", b: "ልጅዎ የፈለገው እያንዳንዱ ቃል በደብተሩ ውስጥ ይቀመጣል፣ አይሸሽም።" },
      { t: "አጭር ፈተና", b: "ቃሉ ከመዘንጋቱ ልክ በፊት መልሶ የሚያመጣ ፈጣን ጥያቄ።" },
      { t: "ጨዋታ", b: "ልጅዎ ራሱ በፈለጋቸው ቃላት ላይ፣ በጨዋታ መማር።" },
    ],
    chainCost: "",
    chainTurnTitle: "የሚያገኙትም ይህ ነው",
    chainTurnBody: "ልጅዎ የተቸገረበት እያንዳንዱ ቃል የሚያውቀው ቃል ይሆናል፣ ይህንም በጥቁርና ነጭ ያያሉ፦ ሳምንት በሳምንት ስንት ቃላት እንደዘጋ። አንድ ነገር እየተሻሻለ እንደሆነ ከመመኘት ይልቅ፣ ሲከሰት ብቻ ይመለከታሉ።",
    dashKicker: "የወላጅ ዳሽቦርድ",
    dashTitle: "እያንዳንዱ ልጅ ምን ያህል እንደተማረ በትክክል ያያሉ",
    dashBody: "እያንዳንዱ ልጅ የሚያድግ የግል ቃላት ደብተር አለው። በዳሽቦርድዎ ውስጥ በአንድ እይታ እያንዳንዱ ልጅ ስንት ቃላት እንደተማረ፣ በዚህ ሳምንት ስንት እንደተጨመሩ እና የቅርብ ጊዜ ቃላቱን ያያሉ። ማንኛውም ሌላ መሣሪያ ልጅዎን መልስ ሰጥቶ ይረሳል። Gadit ያስታውሳል፣ እርስዎም እድገቱን ሳምንት በሳምንት ያያሉ።",
    dashKids: [
      { name: "ኖአ", total: 47, week: 12 },
      { name: "ኢዶ", total: 31, week: 8 },
      { name: "ማያ", total: 63, week: 15 },
    ],
    dashWordsLabel: "በደብተር ውስጥ ያሉ ቃላት",
    dashWeekLabel: "በዚህ ሳምንት",
    featuresKicker: "ውስጡ ያለው",
    features: [
      {
        kicker: "እያንዳንዱ ትርጉም",
        title: "አንድ ቃል። እያንዳንዱ ትርጉም። ለእያንዳንዱ ስዕል።",
        body: "አንድ ቃል ብዙ ጊዜ በርካታ የተለያዩ ትርጉሞች አሉት፣ ልጆችም የሚደናገሩት እዚያ ጋር ነው። Gadit ሁሉንም በአንድ ቦታ ያሳያቸዋል፣ እያንዳንዱን ከሦስት እውነተኛ ምሳሌዎችና ከራሱ ስዕል ጋር፣ ምክንያቱም የልጅ አእምሮ ከቃላት ይልቅ ምስሎችን በጣም በተሻለ ሁኔታ ያስታውሳል።",
      },
      {
        kicker: "የልጆች ሁነታ",
        title: "በልጅዎ ዓይን ደረጃ ማብራሪያዎች",
        body: "አንድ ማብሪያ ብቻ፣ እያንዳንዱ ማብራሪያ የ8 ዓመት ልጅ በእውነት ወደሚረዳው ቋንቋ ይለወጣል። ከባድ ቃላትን በከባድ ቃላት ማብራራት የለም፣ የሚሽከረከር ትርጉም የለም። ግንዛቤ ብቻ።",
      },
      {
        kicker: "አውድ",
        title: "ዓረፍተ ነገር ይለጥፉ፣ ትክክለኛውን ትርጉም ያግኙ",
        body: "አብዛኞቹ ቃላት ከአንድ በላይ ትርጉም አላቸው፣ ልጆችም የሚጠፉት እዚያ ጋር ነው። ከመጽሐፉ ወይም ከሥራ ወረቀቱ ዓረፍተ ነገሩን ይለጥፉ፣ Gadit የትኛው ትርጉም እንደሚስማማ በትክክል ያመለክታል።",
      },
      {
        kicker: "የግል ደብተር",
        title: "ቃላቱ አይሸሹም",
        body: "ልጅዎ የሚፈልገው እያንዳንዱ ቃል ወደ ግል ደብተሩ ይገባል፣ ብልህ አጭር ልምምድም ከመዘንጋቱ ልክ በፊት መልሶ ያመጣዋል። የቃላት ክምችት በእውነት የሚገነባው በዚህ መንገድ ነው፣ አንድ ቃል በአንድ ጊዜ።",
      },
      {
        kicker: "ለእያንዳንዱ ልጅ መገለጫ",
        title: "እያንዳንዱ ልጅ የራሱን ቦታ ያገኛል",
        body: "በቤተሰቡ ውስጥ ያለ እያንዳንዱ ልጅ የተለየ መገለጫ ያገኛል፦ ደብተሩ፣ ልምምዱ፣ ታሪኩ። የልጆች ሁነታ ማብራሪያውን ያስማማል፣ ለትንንሾቹ ቀላልና ግልጽ፣ ለትልልቆቹ ሙሉ፣ ማንም የማንንም ቃላት አይረግጥም።",
      },
      {
        kicker: "የቃላት ጨዋታዎች",
        title: "በልጅዎ ቃላት ላይ የመማሪያ ጨዋታዎች",
        body: "ልጅዎ በእውነት ከፈለጋቸው ቃላት የተሰሩ አጭር ፈተናዎችና ጨዋታዎች። ጥቂት ደቂቃ ጨዋታ፣ የቃላት ክምችትም ያለ ጥረት ያድጋል።",
      },
      {
        kicker: "ሁለተኛ ቋንቋ",
        title: "ለሁለተኛ ቋንቋ ምርጡ የቤት ስራ ረዳት",
        body: "ልጅዎ በእንግሊዝኛ ቃል ይጽፋል፣ በራሱ ቋንቋ ቀላል ማብራሪያ ከስዕልና ከምሳሌዎች ጋር ያገኛል። በመዝገበ ቃላት፣ በተርጓሚና በYouTube መካከል መንከራተት የለም።",
      },
    ],
    midCtaTitle: "አሁን ይጀምሩ፣ የልጅዎም የቃላት ክምችት ቀን በቀን ሲያድግ ይመልከቱ",
    midCta: "የ14 ቀን ነጻ ሙከራዎን ይጀምሩ",
    compareKicker: "ልዩነቱ",
    compareTitle: "ለምን Google ማድረግ ወይም ቻትቦት መጠየቅ ብቻ አይሆንም?",
    compareGadit: "Gadit",
    compareOther: "ክፍት ኢንተርኔት",
    compareRows: [
      { label: "ለእያንዳንዱ ቃል አንድ ንጹህ ገጽ", gadit: true, other: false },
      { label: "በልጅ ደረጃ ማብራሪያዎች", gadit: true, other: false },
      { label: "ለእያንዳንዱ ትርጉም ስዕል", gadit: true, other: false },
      { label: "የሚጣበቅ ደብተርና ልምምድ", gadit: true, other: false },
      { label: "በየአቅጣጫው ማስታወቂያዎችና አገናኞች", gadit: false, other: true },
      { label: "ወሰን የሌለው ክፍት ውይይት", gadit: false, other: true },
    ],
    safeTitle: "የተለየ፣ ንጹህ ቦታ። ወደ ሌላ ማንኛውም ቦታ በር አይደለም።",
    safeBody: "Gadit ሙሉ በሙሉ የተዘጋ ቦታ ነው፦ ክፍት ውይይት የለም፣ ዝርዝር የለም፣ ማስታወቂያ የለም፣ ወደ ውጭ የሚወስድ አገናኝ የለም። ልጅ ከዚህ ወደ TikTok ወይም ወደ ማንኛውም ሌላ መተግበሪያ አይሳብም። እዚህ ማድረግ ያለበት አንድ ነገር አለ፦ ቃል መረዳት፣ ወደ ትምህርትም መመለስ።",
    safeLine: "በተረጋጋ አእምሮ ለልጅ ማስረከብ የሚቻል አንድ ስክሪን።",
    stackTitle: "የቤተሰብ እቅድ የሚያካትተው",
    stackItems: [
      "ለመላው ቤተሰብ ያልተገደበ ፍለጋ",
      "እያንዳንዱ ትርጉም፣ ለእያንዳንዱ ስዕል ጋር",
      "ለእያንዳንዱ ዕድሜ የልጆች ሁነታ",
      "ከቅጽበታዊ አስተያየት ጋር የዓረፍተ ነገር ማረጋገጫ",
      "ለእያንዳንዱ ልጅ የግል ደብተርና ብልህ ልምምድ",
      "የቃላት ጨዋታዎችና ፈተናዎች",
      "እስከ 5 ልጆች በተለያዩ መገለጫዎች",
      "ሙሉ ድጋፍ ያለው 30+ ቋንቋዎች",
    ],
    priceKicker: "ዋጋ",
    priceTitle: "የቤተሰብ እቅድ",
    trialBadge: "የ14 ቀን ነጻ ሙከራ",
    yearly: "$59 / year",
    yearlyNote: "ይህ ለመላው ቤተሰብ በወር $4.92 ነው፣ ከወርሃዊ ክፍያ ጋር ሲነጻጸርም ወደ ሁለት ወር የሚጠጋ ገንዘብ ይቆጥብልዎታል",
    priceAnchor: "ከአንድ የግል ትምህርት ክፍለ ጊዜ ባነሰ፣ ለአንድ ሙሉ ዓመት፣ በቤት ውስጥ ላለ ለእያንዳንዱ ልጅ",
    monthly: "$5.99 / month",
    billedYearly: "ዓመታዊ",
    billedMonthly: "ወርሃዊ",
    yearlySave: "-18%",
    priceCta: "ሙከራውን ይጀምሩ",
    cancelNote: "የመጀመሪያ ክፍያ ከ14 ቀናት በኋላ ብቻ። በማንኛውም ጊዜ ከመለያ ገጽዎ በአንድ ጠቅታ ይሰርዙ።",
    singleChild: "በቤት ውስጥ አንድ ተማሪ ብቻ? Deep በወር $4.99 ነው። በጥቂት ተጨማሪ ገንዘብ እስከ 5 ልጆች ማከል ይችላሉ።",
    guaranteeTitle: "የእርስዎ ፈተና፦ ሁለት ሳምንት",
    guaranteeBody: "ለሁለት ሳምንት እውነተኛ አጠቃቀም ነጻ ይሞክሩት። በ14ኛው ቀን የልጅዎ ደብተር ቢያንስ 20 አዲስ ቃላት ካልሰበሰበ፣ በአንድ ጠቅታ ይሰርዙ ምንም አልከፈሉም ማለት ነው።",
    faqTitle: "ወላጆች የሚጠይቁት ጥያቄዎች",
    faq: [
      {
        q: "ከGadit ምን አገኛለሁ?",
        a: "ልጅዎ የሚፈልገው እያንዳንዱ ቃል አንድ ንጹህ ገጽ ያገኛል፦ እያንዳንዱ ትርጉም፣ በልጅ ደረጃ ማብራሪያ (የልጆች ሁነታ)፣ ሦስት እውነተኛ ምሳሌዎች እና ለእያንዳንዱ ትርጉም ስዕል። በተጨማሪም አውድ (ዓረፍተ ነገር ይለጥፉ ትክክለኛውን ትርጉም ያግኙ)፣ ብልህ ልምምድ ያለው የግል ቃላት ደብተር፣ የቃላት ጨዋታዎችና ፈተናዎች፣ እያንዳንዱ ልጅ ምን ያህል እንደተማረ የሚያሳይ የወላጅ ዳሽቦርድ፣ በተለያዩ መገለጫዎች እስከ 5 ልጆች፣ ሁሉም በ30+ ቋንቋዎች፣ ክፍት ውይይትም ሆነ ማስታወቂያ በሌለው የተዘጋ ደህንነቱ በተጠበቀ ቦታ ውስጥ።",
      },
      {
        q: "ለምን ቻትቦት መጠየቅ ወይም Google ማድረግ ብቻ አይሆንም?",
        a: "እነዚያ ለአዋቂዎች የተሰሩ መሣሪያዎች ስለሆኑ። Google በየአቅጣጫው ማስታወቂያዎችንና አገናኞችን ይመልሳል፣ ክፍት ቻትቦትም ማንም ወላጅ ልጁን ብቻውን የማይተውበት ወሰን የሌለው ውይይት ነው። Gadit በተቃራኒው መንገድ ተገንብቷል፦ ለእያንዳንዱ ቃል አንድ የተዘጋ፣ ንጹህ ገጽ፣ በልጅ ደረጃ፣ የመጥፋት እድል በሌለበት።",
      },
      {
        q: "ልጄ በእውነት እየተሻሻለ መሆኑን እንዴት አውቃለሁ?",
        a: "የወላጅ ዳሽቦርድ ያገኛሉ። በአንድ እይታ እያንዳንዱ ልጅ ስንት ቃላት እንደተማረ፣ በዚህ ሳምንት ስንት እንደተጨመሩ እና የቅርብ ጊዜ ቃላቱን ያያሉ። ማንኛውም ሌላ መሣሪያ ልጁን መልስ ሰጥቶ ይረሳል፤ Gadit እያንዳንዱን ቃል በልጁ የግል ደብተር ውስጥ ያስቀምጣል፣ ስለዚህ የቃላት ክምችቱ ሳምንት በሳምንት ሲያድግ ይመለከታሉ።",
      },
      {
        q: "ለየትኞቹ ዕድሜዎች ነው?",
        a: "የGadit ልብ ከአንደኛ ክፍል እስከ ሁለተኛ ደረጃ ትምህርት ቤት ያሉ የትምህርት ዕድሜ ልጆች ናቸው። የልጆች ሁነታ ለትንንሾቹ በቀላሉ ያብራራል፣ ሙሉ ማብራሪያዎቹም ለወጣቶችና ለወላጆችም ያገለግላሉ። መለያውን የሚከፍተው ወላጁ ነው።",
      },
      {
        q: "በእንግሊዝኛና በሌሎች ቋንቋዎች ይረዳል?",
        a: "በጣም። ልጅ በእንግሊዝኛ ቃል ፈልጎ በራሱ ቋንቋ ቀላል ማብራሪያ ከስዕልና ከምሳሌዎች ጋር ማግኘት ይችላል፣ በቤት ውስጥ የጎደለው ረዳት በትክክል ነው። በ30+ ቋንቋዎችም ይሰራል፣ ስለዚህ ልጁ በቤት ውስጥ በሚናገሩት ቋንቋም ማብራሪያውን ማግኘት ይችላል።",
      },
      {
        q: "ስንት ያስከፍላል?",
        a: "ከ14 ቀን ሙከራ በኋላ በዓመት $59 ወይም በወር $5.99። ምንም የተደበቀ ክፍያ የለም፣ በማንኛውም ጊዜም በአንድ ጠቅታ ይሰርዛሉ።",
      },
      {
        q: "ስንት ልጆች ማከል እችላለሁ?",
        a: "በአንድ የቤተሰብ እቅድ እስከ 5 ልጆች፣ እያንዳንዱ በራሱ መገለጫ፣ ደብተርና ልምምድ።",
      },
      {
        q: "ሳንገባ መሞከር እንችላለን?",
        a: "አዎ። ሙከራው በካርድ ይጀምራል፣ ግን የመጀመሪያው ክፍያ የሚከሰተው 14 ቀናት ሲያልቁ ብቻ ነው። ከዚያ በፊት በማንኛውም ጊዜ በአንድ ጠቅታ ይሰርዙ፣ ምንም አይከፍሉም።",
      },
    ],
    finalTitle: "ዛሬ ይጀምሩ፣ የቃላት ክምችቱም ሲያድግ ይመልከቱ",
    finalSub: "ሁለት ሳምንት ነጻ። በአንድ ጠቅታ መሰረዝ። እና ቃላትን በራሱ መረዳት የሚማር ልጅ።",
    finalCta: "የ14 ቀን ነጻ ሙከራዎን ይጀምሩ",
    footerTerms: "ውሎች",
    footerPrivacy: "ግላዊነት",
  },
};

/* ─────────────────── product mockups (per feature) ─────────────────── */

// Per-language content for the demo mockups on this page (the little
// phone/notebook/quiz illustrations). Was a pile of ar/ru/he/en inline
// ternaries, so every other language showed English example words and
// sentences. Now one map keyed by UI language; falls back to en.
type FamMock = Record<string, string>;

const FAM_MOCK: Record<string, FamMock> = {
  en: {
    meaningsWord: "bat",
    meaning1T: "The animal that flies at night",
    meaning1Ex: "\"A bat flew out of the cave.\"",
    meaning2T: "The stick used in baseball",
    meaning2Ex: "\"She swung the bat and hit the ball.\"",
    kidsBubble: "\"Reluctant\" is when you don't really want to do something, and your feet go slow. Like walking to the dentist.",
    contextSentence: "My biggest {dream} is to be a doctor",
    contextMeaning: "The meaning here: a hope or goal you want to reach",
    notebookTitle: "Noa's notebook",
    notebookDue: "practice today",
    profile1Name: "Noa",
    profile1Grade: "2nd grade",
    profile2Name: "Ido",
    profile2Grade: "6th grade",
    profile3Name: "Maya",
    profile3Grade: "9th grade",
    gameTwinTrap: "Twin Trap",
    gameTimeTraveler: "Time Traveler",
    gameStreak: "6-day streak 🔥",
    englishWord: "reluctant",
    englishMeaningT: "Not really wanting to",
    englishMeaningEx: "\"He was reluctant to start his homework.\"",
    puzzleSentence: "The sailor was {determined} to reach the island, despite the {storm} he never {hesitated}",
    dreamWord: "dream",
    dreamPos: "noun",
    dreamMeaningFull: "images and thoughts that pass through the mind during sleep",
    dreamExample: "\"Last night I had a dream about a far journey.\"",
    dreamMeaningShort: "Images and thoughts that pass through the mind during sleep",
    dreamKidDef: "\"Dream\" is the pictures and stories that run through your head while you sleep. Sometimes happy, sometimes strange, and they fade when you wake up.",
    dreamEx1: "\"Last night I had a dream about a long journey.\"",
    dreamEx2: "\"She woke up from a scary dream.\"",
    dreamEx3: "\"His big dream is to fly to space.\"",
    kidsLabel: "Kids Mode",
    searchHint: "Type a word",
    tabMeanings: "Meanings",
    tabPicture: "Picture",
    tabNotebook: "Notebook",
    searchTagline: "The child types a word, and that is it.",
    quizQ: "What does \"dream\" mean?",
    quizRight: "Images and thoughts during sleep",
    quizWrong1: "A kind of cake",
    quizWrong2: "A musical instrument",
  },
  he: {
    meaningsWord: "עין",
    meaning1T: "אֵיבָר הראייה שבגוף",
    meaning1Ex: "\"נכנס לי גרגר חול לעין.\"",
    meaning2T: "מעיין, מקור מים הנובע מהאדמה",
    meaning2Ex: "\"מילאנו בקבוקים ממי העין הקרירים.\"",
    kidsBubble: "\"reluctant\" זה כשלא ממש בא לך לעשות משהו, והרגליים נגררות לאט. כמו ללכת לרופא שיניים.",
    contextSentence: "{החלום} הכי גדול שלי הוא להיות רופא",
    contextMeaning: "המשמעות כאן: תקווה או מטרה שרוצים להגשים",
    notebookTitle: "המחברת של נועה",
    notebookDue: "לתרגל היום",
    profile1Name: "נועה",
    profile1Grade: "כיתה ב׳",
    profile2Name: "עידו",
    profile2Grade: "כיתה ו׳",
    profile3Name: "מאיה",
    profile3Grade: "כיתה ט׳",
    gameTwinTrap: "מלכודת התאומים",
    gameTimeTraveler: "מטייל בזמן",
    gameStreak: "רצף של 6 ימים 🔥",
    englishWord: "reluctant",
    englishMeaningT: "כשלא ממש רוצים משהו",
    englishMeaningEx: "\"הוא לא ממש רצה להתחיל את שיעורי הבית.\"",
    puzzleSentence: "המלח היה {נחוש} להגיע לאי, ולמרות ה{סערה} הוא מעולם לא {היסס}",
    dreamWord: "חלום",
    dreamPos: "שם עצם",
    dreamMeaningFull: "תמונות ומחשבות שעוברות בראש בזמן השינה",
    dreamExample: "\"אתמול בלילה חלמתי חלום על מסע רחוק.\"",
    dreamMeaningShort: "תמונות ומחשבות שעוברות בראש בזמן השינה",
    dreamKidDef: "\"חלום\" הוא התמונות והסיפורים שרצים לך בראש בזמן השינה. לפעמים שמחים, לפעמים מוזרים, והם נמוגים ברגע שמתעוררים.",
    dreamEx1: "\"אתמול בלילה חלמתי חלום על מסע ארוך.\"",
    dreamEx2: "\"היא התעוררה מחלום מפחיד.\"",
    dreamEx3: "\"החלום הגדול שלו הוא לטוס לחלל.\"",
    kidsLabel: "מצב ילדים",
    searchHint: "להקליד מילה",
    tabMeanings: "משמעויות",
    tabPicture: "תמונה",
    tabNotebook: "מחברת",
    searchTagline: "הילד מקליד מילה, וזהו.",
    quizQ: "מה זה \"חלום\"?",
    quizRight: "תמונות ומחשבות בזמן השינה",
    quizWrong1: "סוג של עוגה",
    quizWrong2: "כלי נגינה",
  },
  ar: {
    meaningsWord: "عين",
    meaning1T: "عضو الإبصار في الجسم",
    meaning1Ex: "\"دخلت حبة رمل في عيني.\"",
    meaning2T: "نبع ماء يخرج من الأرض",
    meaning2Ex: "\"ملأنا القوارير من ماء العين البارد.\"",
    kidsBubble: "\"reluctant\" هي عندما لا ترغب حقاً في فعل شيء، فتمشي قدماك ببطء. مثل الذهاب إلى طبيب الأسنان.",
    contextSentence: "أكبر {حُلم} لديّ أن أصبح طبيباً",
    contextMeaning: "المعنى هنا: أمل أو هدف تريد الوصول إليه",
    notebookTitle: "دفتر يوسف",
    notebookDue: "التدريب اليوم",
    profile1Name: "يوسف",
    profile1Grade: "الصف الثاني",
    profile2Name: "ليلى",
    profile2Grade: "الصف السادس",
    profile3Name: "عمر",
    profile3Grade: "الصف التاسع",
    gameTwinTrap: "فخ التوأم",
    gameTimeTraveler: "مسافر عبر الزمن",
    gameStreak: "سلسلة 6 أيام 🔥",
    englishWord: "reluctant",
    englishMeaningT: "لا يرغب حقاً",
    englishMeaningEx: "\"كان متردداً في بدء واجباته المدرسية.\"",
    puzzleSentence: "كان البحّار {مصمّماً} على الوصول إلى الجزيرة، ورغم {العاصفة} لم {يتردّد} أبداً",
    dreamWord: "حُلم",
    dreamPos: "اسم",
    dreamMeaningFull: "صور وأفكار تمر في الذهن أثناء النوم",
    dreamExample: "\"الليلة الماضية رأيت حلماً عن رحلة بعيدة.\"",
    dreamMeaningShort: "صور وأفكار تمر في الذهن أثناء النوم",
    dreamKidDef: "\"الحُلم\" هو الصور والقصص التي تمر في رأسك أثناء النوم. أحياناً سعيدة وأحياناً غريبة، وتتلاشى عند الاستيقاظ.",
    dreamEx1: "\"الليلة الماضية رأيت حلماً عن رحلة طويلة.\"",
    dreamEx2: "\"استيقظت من حلم مخيف.\"",
    dreamEx3: "\"حلمه الكبير أن يطير إلى الفضاء.\"",
    kidsLabel: "وضع الأطفال",
    searchHint: "اكتب كلمة",
    tabMeanings: "المعاني",
    tabPicture: "صورة",
    tabNotebook: "الدفتر",
    searchTagline: "يكتب الطفل كلمة، وهذا كل شيء.",
    quizQ: "ماذا تعني كلمة \"حُلم\"؟",
    quizRight: "صور وأفكار أثناء النوم",
    quizWrong1: "نوع من الكعك",
    quizWrong2: "آلة موسيقية",
  },
  ru: {
    meaningsWord: "ключ",
    meaning1T: "предмет, которым открывают замок",
    meaning1Ex: "\"Я потерял ключ от квартиры.\"",
    meaning2T: "родник, источник воды из земли",
    meaning2Ex: "\"Мы пили холодную воду из лесного ключа.\"",
    kidsBubble: "\"reluctant\" это когда тебе не очень хочется что-то делать и ноги идут медленно. Как идти к зубному врачу.",
    contextSentence: "Моя самая большая {мечта} стать врачом",
    contextMeaning: "Значение здесь: надежда или цель, которую хочешь достичь",
    notebookTitle: "Тетрадь Ани",
    notebookDue: "повторить сегодня",
    profile1Name: "Аня",
    profile1Grade: "2-й класс",
    profile2Name: "Максим",
    profile2Grade: "6-й класс",
    profile3Name: "Соня",
    profile3Grade: "9-й класс",
    gameTwinTrap: "Ловушка близнецов",
    gameTimeTraveler: "Путешественник во времени",
    gameStreak: "серия из 6 дней 🔥",
    englishWord: "reluctant",
    englishMeaningT: "Не очень-то хочет",
    englishMeaningEx: "\"Он неохотно приступал к домашнему заданию.\"",
    puzzleSentence: "Моряк был полон {решимости} добраться до острова, и несмотря на {шторм} он ни разу не {дрогнул}",
    dreamWord: "сон",
    dreamPos: "существительное",
    dreamMeaningFull: "образы и мысли, проходящие в сознании во время сна",
    dreamExample: "\"Прошлой ночью мне приснился сон о далёком путешествии.\"",
    dreamMeaningShort: "Образы и мысли, проходящие в сознании во время сна",
    dreamKidDef: "\"Сон\" это картинки и истории, которые проносятся в голове, пока ты спишь. Иногда весёлые, иногда странные, и они тают, когда просыпаешься.",
    dreamEx1: "\"Прошлой ночью мне приснился сон о долгом путешествии.\"",
    dreamEx2: "\"Она проснулась от страшного сна.\"",
    dreamEx3: "\"Его большая мечта полететь в космос.\"",
    kidsLabel: "Детский режим",
    searchHint: "Введите слово",
    tabMeanings: "Значения",
    tabPicture: "Картинка",
    tabNotebook: "Тетрадь",
    searchTagline: "Ребёнок вводит слово, и всё.",
    quizQ: "Что означает слово \"сон\"?",
    quizRight: "Образы и мысли во время сна",
    quizWrong1: "Вид торта",
    quizWrong2: "Музыкальный инструмент",
  },
  es: {
    meaningsWord: "banco",
    meaning1T: "asiento largo para varias personas",
    meaning1Ex: "\"Nos sentamos en un banco del parque.\"",
    meaning2T: "lugar donde se guarda el dinero",
    meaning2Ex: "\"Fui al banco a sacar dinero.\"",
    kidsBubble: "\"reluctant\" es cuando no tienes muchas ganas de hacer algo y tus pies van despacio. Como ir al dentista.",
    contextSentence: "Mi mayor {sueño} es ser médico",
    contextMeaning: "El significado aquí: una esperanza o meta que quieres alcanzar",
    notebookTitle: "El cuaderno de Lucía",
    notebookDue: "practicar hoy",
    profile1Name: "Lucía",
    profile1Grade: "2.º grado",
    profile2Name: "Mateo",
    profile2Grade: "6.º grado",
    profile3Name: "Sofía",
    profile3Grade: "9.º grado",
    gameTwinTrap: "Trampa de gemelos",
    gameTimeTraveler: "Viajero del tiempo",
    gameStreak: "racha de 6 días 🔥",
    englishWord: "reluctant",
    englishMeaningT: "Sin muchas ganas",
    englishMeaningEx: "\"No tenía muchas ganas de empezar los deberes.\"",
    puzzleSentence: "El marinero estaba {decidido} a llegar a la isla, y pese a la {tormenta} nunca {dudó}",
    dreamWord: "sueño",
    dreamPos: "sustantivo",
    dreamMeaningFull: "imágenes y pensamientos que pasan por la mente durante el sueño",
    dreamExample: "\"Anoche tuve un sueño sobre un viaje lejano.\"",
    dreamMeaningShort: "Imágenes y pensamientos que pasan por la mente durante el sueño",
    dreamKidDef: "\"Sueño\" son las imágenes y las historias que pasan por tu cabeza mientras duermes. A veces alegres, a veces extrañas, y se desvanecen al despertar.",
    dreamEx1: "\"Anoche tuve un sueño sobre un largo viaje.\"",
    dreamEx2: "\"Se despertó de un sueño aterrador.\"",
    dreamEx3: "\"Su gran sueño es volar al espacio.\"",
    kidsLabel: "Modo niños",
    searchHint: "Escribe una palabra",
    tabMeanings: "Significados",
    tabPicture: "Imagen",
    tabNotebook: "Cuaderno",
    searchTagline: "El niño escribe una palabra, y ya está.",
    quizQ: "¿Qué significa \"sueño\"?",
    quizRight: "Imágenes y pensamientos durante el sueño",
    quizWrong1: "Un tipo de pastel",
    quizWrong2: "Un instrumento musical",
  },
  pt: {
    meaningsWord: "manga",
    meaning1T: "fruta tropical doce e alaranjada",
    meaning1Ex: "\"Comi uma manga bem madura.\"",
    meaning2T: "parte da roupa que cobre o braço",
    meaning2Ex: "\"Arregacei a manga da camisa.\"",
    kidsBubble: "\"reluctant\" é quando não tens muita vontade de fazer algo e os teus pés andam devagar. Como ir ao dentista.",
    contextSentence: "O meu maior {sonho} é ser médico",
    contextMeaning: "O significado aqui: uma esperança ou objetivo que queres alcançar",
    notebookTitle: "O caderno da Sofia",
    notebookDue: "praticar hoje",
    profile1Name: "Sofia",
    profile1Grade: "2.º ano",
    profile2Name: "Miguel",
    profile2Grade: "6.º ano",
    profile3Name: "Beatriz",
    profile3Grade: "9.º ano",
    gameTwinTrap: "Armadilha dos Gémeos",
    gameTimeTraveler: "Viajante do Tempo",
    gameStreak: "sequência de 6 dias 🔥",
    englishWord: "reluctant",
    englishMeaningT: "Sem muita vontade",
    englishMeaningEx: "\"Ele estava sem vontade de começar os trabalhos de casa.\"",
    puzzleSentence: "O marinheiro estava {determinado} a chegar à ilha, e apesar da {tempestade} nunca {hesitou}",
    dreamWord: "sonho",
    dreamPos: "substantivo",
    dreamMeaningFull: "imagens e pensamentos que passam pela mente durante o sono",
    dreamExample: "\"Ontem à noite tive um sonho sobre uma viagem distante.\"",
    dreamMeaningShort: "Imagens e pensamentos que passam pela mente durante o sono",
    dreamKidDef: "\"Sonho\" são as imagens e as histórias que passam pela tua cabeça enquanto dormes. Às vezes alegres, às vezes estranhas, e desaparecem quando acordas.",
    dreamEx1: "\"Ontem à noite tive um sonho sobre uma longa viagem.\"",
    dreamEx2: "\"Ela acordou de um sonho assustador.\"",
    dreamEx3: "\"O seu grande sonho é voar até ao espaço.\"",
    kidsLabel: "Modo crianças",
    searchHint: "Escreve uma palavra",
    tabMeanings: "Significados",
    tabPicture: "Imagem",
    tabNotebook: "Caderno",
    searchTagline: "A criança escreve uma palavra, e pronto.",
    quizQ: "O que significa \"sonho\"?",
    quizRight: "Imagens e pensamentos durante o sono",
    quizWrong1: "Um tipo de bolo",
    quizWrong2: "Um instrumento musical",
  },
  fr: {
    meaningsWord: "avocat",
    meaning1T: "personne qui défend les gens au tribunal",
    meaning1Ex: "\"L'avocat a défendu son client.\"",
    meaning2T: "fruit vert à gros noyau",
    meaning2Ex: "\"J'ai mangé un avocat au déjeuner.\"",
    kidsBubble: "\"reluctant\" c'est quand tu n'as pas vraiment envie de faire quelque chose et que tes pieds traînent. Comme aller chez le dentiste.",
    contextSentence: "Mon plus grand {rêve} est de devenir médecin",
    contextMeaning: "Le sens ici: un espoir ou un but que l'on veut atteindre",
    notebookTitle: "Le cahier de Léa",
    notebookDue: "à réviser aujourd'hui",
    profile1Name: "Léa",
    profile1Grade: "CE1",
    profile2Name: "Hugo",
    profile2Grade: "6e",
    profile3Name: "Chloé",
    profile3Grade: "3e",
    gameTwinTrap: "Le piège des jumeaux",
    gameTimeTraveler: "Voyageur du temps",
    gameStreak: "série de 6 jours 🔥",
    englishWord: "reluctant",
    englishMeaningT: "Sans vraiment vouloir",
    englishMeaningEx: "\"Il rechignait à commencer ses devoirs.\"",
    puzzleSentence: "Le marin était {déterminé} à atteindre l'île, et malgré la {tempête} il n'a jamais {hésité}",
    dreamWord: "rêve",
    dreamPos: "nom",
    dreamMeaningFull: "images et pensées qui traversent l'esprit pendant le sommeil",
    dreamExample: "\"La nuit dernière, j'ai fait un rêve sur un voyage lointain.\"",
    dreamMeaningShort: "Images et pensées qui traversent l'esprit pendant le sommeil",
    dreamKidDef: "\"Rêve\", ce sont les images et les histoires qui défilent dans ta tête pendant que tu dors. Parfois joyeuses, parfois étranges, et elles s'effacent au réveil.",
    dreamEx1: "\"La nuit dernière, j'ai fait un rêve sur un long voyage.\"",
    dreamEx2: "\"Elle s'est réveillée d'un rêve effrayant.\"",
    dreamEx3: "\"Son grand rêve est de voler dans l'espace.\"",
    kidsLabel: "Mode enfant",
    searchHint: "Tape un mot",
    tabMeanings: "Sens",
    tabPicture: "Image",
    tabNotebook: "Cahier",
    searchTagline: "L'enfant tape un mot, et c'est tout.",
    quizQ: "Que signifie \"rêve\"?",
    quizRight: "Images et pensées pendant le sommeil",
    quizWrong1: "Une sorte de gâteau",
    quizWrong2: "Un instrument de musique",
  },
  de: {
    meaningsWord: "Bank",
    meaning1T: "Sitzgelegenheit für mehrere Personen",
    meaning1Ex: "\"Wir saßen auf einer Bank im Park.\"",
    meaning2T: "Ort, an dem man Geld aufbewahrt",
    meaning2Ex: "\"Ich ging zur Bank, um Geld abzuheben.\"",
    kidsBubble: "\"reluctant\" ist, wenn du etwas nicht wirklich tun willst und deine Füße langsam werden. Wie der Gang zum Zahnarzt.",
    contextSentence: "Mein größter {Traum} ist es, Arzt zu werden",
    contextMeaning: "Die Bedeutung hier: eine Hoffnung oder ein Ziel, das man erreichen möchte",
    notebookTitle: "Emmas Heft",
    notebookDue: "heute üben",
    profile1Name: "Emma",
    profile1Grade: "2. Klasse",
    profile2Name: "Leon",
    profile2Grade: "6. Klasse",
    profile3Name: "Mia",
    profile3Grade: "9. Klasse",
    gameTwinTrap: "Zwillingsfalle",
    gameTimeTraveler: "Zeitreisender",
    gameStreak: "6-Tage-Serie 🔥",
    englishWord: "reluctant",
    englishMeaningT: "Nicht wirklich wollen",
    englishMeaningEx: "\"Er begann seine Hausaufgaben nur widerwillig.\"",
    puzzleSentence: "Der Seemann war {entschlossen}, die Insel zu erreichen, und trotz des {Sturms} {zögerte} er nie",
    dreamWord: "Traum",
    dreamPos: "Substantiv",
    dreamMeaningFull: "Bilder und Gedanken, die während des Schlafs durch den Kopf gehen",
    dreamExample: "\"Letzte Nacht hatte ich einen Traum von einer fernen Reise.\"",
    dreamMeaningShort: "Bilder und Gedanken, die während des Schlafs durch den Kopf gehen",
    dreamKidDef: "\"Traum\" sind die Bilder und Geschichten, die dir durch den Kopf gehen, während du schläfst. Mal fröhlich, mal seltsam, und sie verblassen, wenn du aufwachst.",
    dreamEx1: "\"Letzte Nacht hatte ich einen Traum von einer langen Reise.\"",
    dreamEx2: "\"Sie wachte aus einem beängstigenden Traum auf.\"",
    dreamEx3: "\"Sein großer Traum ist es, ins All zu fliegen.\"",
    kidsLabel: "Kindermodus",
    searchHint: "Ein Wort eingeben",
    tabMeanings: "Bedeutungen",
    tabPicture: "Bild",
    tabNotebook: "Heft",
    searchTagline: "Das Kind gibt ein Wort ein, und das war's.",
    quizQ: "Was bedeutet \"Traum\"?",
    quizRight: "Bilder und Gedanken während des Schlafs",
    quizWrong1: "Eine Art Kuchen",
    quizWrong2: "Ein Musikinstrument",
  },
  cs: {
    meaningsWord: "zámek",
    meaning1T: "velké panské sídlo",
    meaning1Ex: "\"Navštívili jsme starý zámek.\"",
    meaning2T: "zařízení na zamykání dveří",
    meaning2Ex: "\"Zámek u dveří se zasekl.\"",
    kidsBubble: "\"reluctant\" je, když se ti do něčeho moc nechce a nohy jdou pomalu. Jako jít k zubaři.",
    contextSentence: "Můj největší {sen} je stát se lékařem",
    contextMeaning: "Význam zde: naděje nebo cíl, kterého chceš dosáhnout",
    notebookTitle: "Eliščin sešit",
    notebookDue: "procvičit dnes",
    profile1Name: "Eliška",
    profile1Grade: "2. třída",
    profile2Name: "Jakub",
    profile2Grade: "6. třída",
    profile3Name: "Tereza",
    profile3Grade: "9. třída",
    gameTwinTrap: "Past na dvojčata",
    gameTimeTraveler: "Cestovatel časem",
    gameStreak: "série 6 dnů 🔥",
    englishWord: "reluctant",
    englishMeaningT: "Nemít moc chuť",
    englishMeaningEx: "\"Do domácích úkolů se mu moc nechtělo.\"",
    puzzleSentence: "Námořník byl {odhodlaný} dostat se na ostrov, a navzdory {bouři} nikdy {nezaváhal}",
    dreamWord: "sen",
    dreamPos: "podstatné jméno",
    dreamMeaningFull: "obrazy a myšlenky, které procházejí myslí během spánku",
    dreamExample: "\"Včera v noci se mi zdál sen o daleké cestě.\"",
    dreamMeaningShort: "Obrazy a myšlenky, které procházejí myslí během spánku",
    dreamKidDef: "\"Sen\" jsou obrázky a příběhy, které ti běží hlavou, když spíš. Někdy veselé, někdy zvláštní, a zmizí, když se probudíš.",
    dreamEx1: "\"Včera v noci se mi zdál sen o dlouhé cestě.\"",
    dreamEx2: "\"Probudila se z děsivého snu.\"",
    dreamEx3: "\"Jeho velký sen je letět do vesmíru.\"",
    kidsLabel: "Dětský režim",
    searchHint: "Napiš slovo",
    tabMeanings: "Významy",
    tabPicture: "Obrázek",
    tabNotebook: "Sešit",
    searchTagline: "Dítě napíše slovo, a je to.",
    quizQ: "Co znamená \"sen\"?",
    quizRight: "Obrazy a myšlenky během spánku",
    quizWrong1: "Druh dortu",
    quizWrong2: "Hudební nástroj",
  },
  sk: {
    meaningsWord: "zámok",
    meaning1T: "veľké panské sídlo",
    meaning1Ex: "\"Navštívili sme starý zámok.\"",
    meaning2T: "zariadenie na zamykanie dverí",
    meaning2Ex: "\"Zámok na dverách sa zasekol.\"",
    kidsBubble: "\"reluctant\" je, keď sa ti do niečoho veľmi nechce a nohy idú pomaly. Ako ísť k zubárovi.",
    contextSentence: "Mojím najväčším {snom} je stať sa lekárom",
    contextMeaning: "Význam tu: nádej alebo cieľ, ktorý chceš dosiahnuť",
    notebookTitle: "Ninin zošit",
    notebookDue: "precvičiť dnes",
    profile1Name: "Nina",
    profile1Grade: "2. ročník",
    profile2Name: "Adam",
    profile2Grade: "6. ročník",
    profile3Name: "Ema",
    profile3Grade: "9. ročník",
    gameTwinTrap: "Pasca na dvojčatá",
    gameTimeTraveler: "Cestovateľ časom",
    gameStreak: "séria 6 dní 🔥",
    englishWord: "reluctant",
    englishMeaningT: "Nemať veľkú chuť",
    englishMeaningEx: "\"Do domácich úloh sa mu veľmi nechcelo.\"",
    puzzleSentence: "Námorník bol {odhodlaný} dostať sa na ostrov, a napriek {búrke} nikdy {nezaváhal}",
    dreamWord: "sen",
    dreamPos: "podstatné meno",
    dreamMeaningFull: "obrazy a myšlienky, ktoré prechádzajú mysľou počas spánku",
    dreamExample: "\"Včera v noci sa mi sníval sen o ďalekej ceste.\"",
    dreamMeaningShort: "Obrazy a myšlienky, ktoré prechádzajú mysľou počas spánku",
    dreamKidDef: "\"Sen\" sú obrázky a príbehy, ktoré ti bežia hlavou, keď spíš. Niekedy veselé, niekedy zvláštne, a zmiznú, keď sa zobudíš.",
    dreamEx1: "\"Včera v noci sa mi sníval sen o dlhej ceste.\"",
    dreamEx2: "\"Prebudila sa z desivého sna.\"",
    dreamEx3: "\"Jeho veľký sen je letieť do vesmíru.\"",
    kidsLabel: "Detský režim",
    searchHint: "Napíš slovo",
    tabMeanings: "Významy",
    tabPicture: "Obrázok",
    tabNotebook: "Zošit",
    searchTagline: "Dieťa napíše slovo, a je to.",
    quizQ: "Čo znamená \"sen\"?",
    quizRight: "Obrazy a myšlienky počas spánku",
    quizWrong1: "Druh torty",
    quizWrong2: "Hudobný nástroj",
  },
  it: {
    meaningsWord: "riso",
    meaning1T: "L'atto di ridere, l'ilarità",
    meaning1Ex: "«Il suo riso allegro riempì tutta la stanza.»",
    meaning2T: "Il cereale bianco che si mangia a tavola",
    meaning2Ex: "«Ho cucinato il riso per cena.»",
    kidsBubble: "«Riluttante» è quando non hai proprio voglia di fare una cosa e i piedi vanno piano piano. Come andare dal dentista.",
    contextSentence: "Il mio più grande {sogno} è diventare medico",
    contextMeaning: "Qui significa: una speranza o un traguardo che vuoi raggiungere",
    notebookTitle: "Il quaderno di Giulia",
    notebookDue: "da ripassare oggi",
    profile1Name: "Giulia",
    profile1Grade: "seconda elementare",
    profile2Name: "Marco",
    profile2Grade: "prima media",
    profile3Name: "Sofia",
    profile3Grade: "prima superiore",
    gameTwinTrap: "Trappola dei Gemelli",
    gameTimeTraveler: "Viaggiatore del Tempo",
    gameStreak: "6 giorni di fila 🔥",
    englishWord: "reluctant",
    englishMeaningT: "Che non ne ha davvero voglia",
    englishMeaningEx: "«Era riluttante a iniziare i compiti.»",
    puzzleSentence: "Il marinaio era {determinato} a raggiungere l'isola, nonostante la {tempesta} non {esitò} mai",
    dreamWord: "sogno",
    dreamPos: "sostantivo",
    dreamMeaningFull: "immagini e pensieri che attraversano la mente durante il sonno",
    dreamExample: "«Ieri notte ho fatto un sogno su un lungo viaggio.»",
    dreamMeaningShort: "Immagini e pensieri che attraversano la mente durante il sonno",
    dreamKidDef: "«Sogno» sono le immagini e le storie che ti passano per la testa mentre dormi. A volte belle, a volte strane, e svaniscono quando ti svegli.",
    dreamEx1: "«Ieri notte ho fatto un sogno su un lungo viaggio.»",
    dreamEx2: "«Si è svegliata da un sogno spaventoso.»",
    dreamEx3: "«Il suo grande sogno è volare nello spazio.»",
    kidsLabel: "Modalità Bambini",
    searchHint: "Scrivi una parola",
    tabMeanings: "Significati",
    tabPicture: "Immagine",
    tabNotebook: "Quaderno",
    searchTagline: "Il bambino scrive una parola, e basta.",
    quizQ: "Che cosa significa «sogno»?",
    quizRight: "Immagini e pensieri durante il sonno",
    quizWrong1: "Un tipo di torta",
    quizWrong2: "Uno strumento musicale",
  },
  ja: {
    meaningsWord: "はし",
    meaning1T: "川などにかかり、向こう岸へ渡るための橋",
    meaning1Ex: "「橋を渡って向こう岸へ行った。」",
    meaning2T: "食事のときに使う箸",
    meaning2Ex: "「箸でごはんを食べる。」",
    kidsBubble: "「気が進まない」は、あることを本当はやりたくなくて、足がのろのろになること。歯医者さんに歩いていくときみたいにね。",
    contextSentence: "私のいちばんの{夢}は医者になることです",
    contextMeaning: "ここでの意味：かなえたい希望や目標",
    notebookTitle: "さくらのノート",
    notebookDue: "今日の練習",
    profile1Name: "さくら",
    profile1Grade: "小学2年生",
    profile2Name: "はると",
    profile2Grade: "小学6年生",
    profile3Name: "みお",
    profile3Grade: "中学3年生",
    gameTwinTrap: "そっくりわな",
    gameTimeTraveler: "タイムトラベラー",
    gameStreak: "6日連続 🔥",
    englishWord: "reluctant",
    englishMeaningT: "あまり気が進まない",
    englishMeaningEx: "「彼は宿題を始めるのに気が進まなかった。」",
    puzzleSentence: "船乗りは島にたどり着こうと{決意}し、{嵐}の中でも決して{ためらわ}なかった",
    dreamWord: "夢",
    dreamPos: "名詞",
    dreamMeaningFull: "眠っているあいだに心をよぎる映像や思い",
    dreamExample: "「昨夜、遠い旅の夢を見た。」",
    dreamMeaningShort: "眠っているあいだに心をよぎる映像や思い",
    dreamKidDef: "「夢」は、眠っているあいだに頭の中を流れる絵やお話のこと。楽しいときもあれば、へんてこなときもあって、目がさめると消えてしまうんだ。",
    dreamEx1: "「昨夜、遠い旅の夢を見た。」",
    dreamEx2: "「彼女はこわい夢から目をさました。」",
    dreamEx3: "「彼の大きな夢は宇宙へ飛ぶことだ。」",
    kidsLabel: "キッズモード",
    searchHint: "言葉を入力",
    tabMeanings: "意味",
    tabPicture: "絵",
    tabNotebook: "ノート",
    searchTagline: "子どもが言葉を入力する。それだけ。",
    quizQ: "「夢」の意味は？",
    quizRight: "眠っているあいだの映像や思い",
    quizWrong1: "ケーキの一種",
    quizWrong2: "楽器の一種",
  },
  hi: {
    meaningsWord: "सोना",
    meaning1T: "बहुमूल्य पीली धातु जिससे गहने बनते हैं",
    meaning1Ex: "“उसने सोने की अंगूठी पहनी।”",
    meaning2T: "आँखें बंद करके नींद लेना",
    meaning2Ex: "“बच्चे रात को जल्दी सोना चाहते हैं।”",
    kidsBubble: "“अनिच्छुक” तब होता है जब आपका किसी काम को करने का बिल्कुल मन नहीं होता, और पैर धीरे-धीरे चलते हैं। जैसे दाँतों के डॉक्टर के पास जाना।",
    contextSentence: "मेरा सबसे बड़ा {सपना} डॉक्टर बनना है",
    contextMeaning: "यहाँ इसका मतलब: एक उम्मीद या लक्ष्य जिसे आप पाना चाहते हैं",
    notebookTitle: "आन्या की नोटबुक",
    notebookDue: "आज अभ्यास करना है",
    profile1Name: "आन्या",
    profile1Grade: "दूसरी कक्षा",
    profile2Name: "आरव",
    profile2Grade: "छठी कक्षा",
    profile3Name: "दीया",
    profile3Grade: "नौवीं कक्षा",
    gameTwinTrap: "जुड़वाँ जाल",
    gameTimeTraveler: "समय यात्री",
    gameStreak: "लगातार 6 दिन 🔥",
    englishWord: "reluctant",
    englishMeaningT: "करने का सच में मन न होना",
    englishMeaningEx: "“वह अपना होमवर्क शुरू करने में अनिच्छुक था।”",
    puzzleSentence: "नाविक द्वीप तक पहुँचने के लिए {दृढ़} था, {तूफ़ान} के बावजूद उसने कभी {संकोच} नहीं किया",
    dreamWord: "सपना",
    dreamPos: "संज्ञा",
    dreamMeaningFull: "नींद के दौरान मन में आने वाले चित्र और विचार",
    dreamExample: "“कल रात मैंने एक लंबी यात्रा का सपना देखा।”",
    dreamMeaningShort: "नींद के दौरान मन में आने वाले चित्र और विचार",
    dreamKidDef: "“सपना” वे तस्वीरें और कहानियाँ हैं जो सोते समय आपके दिमाग में चलती हैं। कभी खुशी वाली, कभी अजीब, और जागते ही गायब हो जाती हैं।",
    dreamEx1: "“कल रात मैंने एक लंबी यात्रा का सपना देखा।”",
    dreamEx2: "“वह एक डरावने सपने से जाग गई।”",
    dreamEx3: "“उसका बड़ा सपना अंतरिक्ष में उड़ना है।”",
    kidsLabel: "किड्स मोड",
    searchHint: "कोई शब्द लिखें",
    tabMeanings: "अर्थ",
    tabPicture: "चित्र",
    tabNotebook: "नोटबुक",
    searchTagline: "बच्चा एक शब्द लिखता है, और बस।",
    quizQ: "“सपना” का क्या मतलब है?",
    quizRight: "नींद के दौरान आने वाले चित्र और विचार",
    quizWrong1: "एक तरह का केक",
    quizWrong2: "एक वाद्य यंत्र",
  },
  am: {
    meaningsWord: "ብር",
    meaning1T: "ውድ የሆነ ነጭ ብረት",
    meaning1Ex: "«እናቷ የብር ቀለበት አጠለቀች።»",
    meaning2T: "የኢትዮጵያ ገንዘብ",
    meaning2Ex: "«መቶ ብር ከፈለ።»",
    kidsBubble: "«ፈቃደኛ ያለመሆን» ማለት አንድ ነገር ለማድረግ ልብህ ሳይፈልግ ሲቀር፣ እግርህም ቀስ ብሎ ሲራመድ ነው። ወደ ጥርስ ሐኪም እንደመሄድ ማለት ነው።",
    contextSentence: "ትልቁ {ሕልሜ} ዶክተር መሆን ነው",
    contextMeaning: "እዚህ ትርጉሙ፦ ልታሳካው የምትፈልገው ተስፋ ወይም ግብ",
    notebookTitle: "የሳራ ደብተር",
    notebookDue: "ዛሬ ልምምድ",
    profile1Name: "ሳራ",
    profile1Grade: "ሁለተኛ ክፍል",
    profile2Name: "ናትናኤል",
    profile2Grade: "ስድስተኛ ክፍል",
    profile3Name: "ሄለን",
    profile3Grade: "ዘጠነኛ ክፍል",
    gameTwinTrap: "የመንታ ወጥመድ",
    gameTimeTraveler: "የጊዜ ተጓዥ",
    gameStreak: "ተከታታይ 6 ቀናት 🔥",
    englishWord: "reluctant",
    englishMeaningT: "በእውነት ማድረግ አለመፈለግ",
    englishMeaningEx: "«የቤት ስራውን ለመጀመር ፈቃደኛ አልነበረም።»",
    puzzleSentence: "መርከበኛው ደሴቱ ላይ ለመድረስ {ቆራጥ} ነበር፣ {ማዕበሉ} ቢኖርም ፈጽሞ {አልተወላወለም}",
    dreamWord: "ሕልም",
    dreamPos: "ስም",
    dreamMeaningFull: "በእንቅልፍ ጊዜ በአእምሮ ውስጥ የሚያልፉ ምስሎችና ሐሳቦች",
    dreamExample: "«ትናንት ማታ ስለ ሩቅ ጉዞ ሕልም አየሁ።»",
    dreamMeaningShort: "በእንቅልፍ ጊዜ በአእምሮ ውስጥ የሚያልፉ ምስሎችና ሐሳቦች",
    dreamKidDef: "«ሕልም» ማለት ስትተኛ በጭንቅላትህ ውስጥ የሚሮጡ ሥዕሎችና ታሪኮች ናቸው። አንዳንዴ አስደሳች፣ አንዳንዴ እንግዳ፣ ስትነቃም ይጠፋሉ።",
    dreamEx1: "«ትናንት ማታ ስለ ረጅም ጉዞ ሕልም አየሁ።»",
    dreamEx2: "«ከሚያስፈራ ሕልም ነቃች።»",
    dreamEx3: "«ትልቁ ሕልሙ ወደ ጠፈር መብረር ነው።»",
    kidsLabel: "የልጆች ሁነታ",
    searchHint: "አንድ ቃል ጻፍ",
    tabMeanings: "ትርጉሞች",
    tabPicture: "ሥዕል",
    tabNotebook: "ደብተር",
    searchTagline: "ልጁ አንድ ቃል ይጽፋል፣ ያ ብቻ ነው።",
    quizQ: "«ሕልም» ማለት ምን ማለት ነው?",
    quizRight: "በእንቅልፍ ጊዜ የሚመጡ ምስሎችና ሐሳቦች",
    quizWrong1: "የኬክ ዓይነት",
    quizWrong2: "የሙዚቃ መሣሪያ",
  },
  uk: {
    meaningsWord: "коса",
    meaning1T: "Заплетене довге волосся",
    meaning1Ex: "«У неї була довга руса коса.»",
    meaning2T: "Інструмент для косіння трави",
    meaning2Ex: "«Дід нагострив косу перед сінокосом.»",
    kidsBubble: "«Неохочий» це коли тобі зовсім не хочеться щось робити, і ноги йдуть повільно-повільно. Наче йдеш до зубного лікаря.",
    contextSentence: "Моя найбільша {мрія} стати лікарем",
    contextMeaning: "Тут означає: надія або мета, якої ти хочеш досягти",
    notebookTitle: "Зошит Софії",
    notebookDue: "повторити сьогодні",
    profile1Name: "Софія",
    profile1Grade: "2-й клас",
    profile2Name: "Максим",
    profile2Grade: "6-й клас",
    profile3Name: "Марія",
    profile3Grade: "9-й клас",
    gameTwinTrap: "Пастка близнюків",
    gameTimeTraveler: "Мандрівник у часі",
    gameStreak: "6 днів поспіль 🔥",
    englishWord: "reluctant",
    englishMeaningT: "Коли насправді не хочеться",
    englishMeaningEx: "«Він неохоче брався за домашнє завдання.»",
    puzzleSentence: "Моряк був {рішучий} дістатися острова, попри {шторм} він жодного разу не {завагався}",
    dreamWord: "сон",
    dreamPos: "іменник",
    dreamMeaningFull: "образи й думки, що проходять у голові під час сну",
    dreamExample: "«Минулої ночі мені наснився сон про далеку подорож.»",
    dreamMeaningShort: "Образи й думки, що проходять у голові під час сну",
    dreamKidDef: "«Сон» це картинки й історії, що біжать у твоїй голові, поки ти спиш. Іноді веселі, іноді дивні, і вони зникають, щойно ти прокидаєшся.",
    dreamEx1: "«Минулої ночі мені наснився сон про довгу подорож.»",
    dreamEx2: "«Вона прокинулася від страшного сну.»",
    dreamEx3: "«Йому наснився дивовижний сон про політ у космос.»",
    kidsLabel: "Дитячий режим",
    searchHint: "Введіть слово",
    tabMeanings: "Значення",
    tabPicture: "Малюнок",
    tabNotebook: "Зошит",
    searchTagline: "Дитина вводить слово, і все.",
    quizQ: "Що означає «сон»?",
    quizRight: "Образи й думки під час сну",
    quizWrong1: "Різновид торта",
    quizWrong2: "Музичний інструмент",
  },
  tr: {
    meaningsWord: "yüz",
    meaning1T: "Başın ön kısmı, surat",
    meaning1Ex: "“Gülümseyince yüzü aydınlandı.”",
    meaning2T: "Doksan dokuzdan sonra gelen sayı, 100",
    meaning2Ex: "“Kutuda yüz tane boya kalemi var.”",
    kidsBubble: "“İsteksiz”, bir şeyi yapmayı hiç canın istemediğinde ve ayaklarının ağır ağır gittiği zamandır. Dişçiye yürümek gibi.",
    contextSentence: "En büyük {hayalim} doktor olmak",
    contextMeaning: "Buradaki anlamı: ulaşmak istediğin bir umut ya da hedef",
    notebookTitle: "Zeynep'in defteri",
    notebookDue: "bugün alıştırma",
    profile1Name: "Zeynep",
    profile1Grade: "2. sınıf",
    profile2Name: "Emir",
    profile2Grade: "6. sınıf",
    profile3Name: "Elif",
    profile3Grade: "9. sınıf",
    gameTwinTrap: "İkiz Tuzağı",
    gameTimeTraveler: "Zaman Yolcusu",
    gameStreak: "6 gün üst üste 🔥",
    englishWord: "reluctant",
    englishMeaningT: "Pek de istemeyen",
    englishMeaningEx: "“Ödevine başlamakta isteksizdi.”",
    puzzleSentence: "Denizci adaya ulaşmakta {kararlıydı}, {fırtınaya} rağmen hiç {tereddüt} etmedi",
    dreamWord: "rüya",
    dreamPos: "isim",
    dreamMeaningFull: "uyku sırasında zihinden geçen görüntüler ve düşünceler",
    dreamExample: "“Dün gece uzak bir yolculuk rüyası gördüm.”",
    dreamMeaningShort: "Uyku sırasında zihinden geçen görüntüler ve düşünceler",
    dreamKidDef: "“Rüya”, sen uyurken kafanın içinde akan resimler ve hikâyelerdir. Bazen mutlu, bazen tuhaf olur ve uyanınca kaybolurlar.",
    dreamEx1: "“Dün gece uzun bir yolculuk rüyası gördüm.”",
    dreamEx2: "“Korkunç bir rüyadan uyandı.”",
    dreamEx3: "“En büyük rüyası uzaya uçmak.”",
    kidsLabel: "Çocuk Modu",
    searchHint: "Bir kelime yaz",
    tabMeanings: "Anlamlar",
    tabPicture: "Resim",
    tabNotebook: "Defter",
    searchTagline: "Çocuk bir kelime yazar, hepsi bu.",
    quizQ: "“Rüya” ne demek?",
    quizRight: "Uyku sırasındaki görüntüler ve düşünceler",
    quizWrong1: "Bir çeşit kek",
    quizWrong2: "Bir müzik aleti",
  },
  pl: {
    meaningsWord: "zamek",
    meaning1T: "Warowna budowla, dawna siedziba króla",
    meaning1Ex: "„Zwiedzaliśmy stary zamek na wzgórzu.”",
    meaning2T: "Suwak zapinany w ubraniu",
    meaning2Ex: "„Zepsuł się zamek w mojej kurtce.”",
    kidsBubble: "„Niechętny” to wtedy, gdy wcale nie masz ochoty czegoś robić i nogi idą wolno, wolno. Jak wtedy, gdy idziesz do dentysty.",
    contextSentence: "Moim największym {marzeniem} jest zostać lekarzem",
    contextMeaning: "Tutaj znaczy: nadzieja lub cel, który chcesz osiągnąć",
    notebookTitle: "Zeszyt Zofii",
    notebookDue: "ćwiczenie na dziś",
    profile1Name: "Zofia",
    profile1Grade: "druga klasa",
    profile2Name: "Jakub",
    profile2Grade: "szósta klasa",
    profile3Name: "Maja",
    profile3Grade: "pierwsza klasa liceum",
    gameTwinTrap: "Pułapka Bliźniąt",
    gameTimeTraveler: "Podróżnik w Czasie",
    gameStreak: "6 dni z rzędu 🔥",
    englishWord: "reluctant",
    englishMeaningT: "Niezbyt chętny do zrobienia czegoś",
    englishMeaningEx: "„Niechętnie zabierał się do odrabiania lekcji.”",
    puzzleSentence: "Żeglarz był {zdeterminowany}, by dotrzeć na wyspę, mimo {sztormu} nigdy się nie {zawahał}",
    dreamWord: "sen",
    dreamPos: "rzeczownik",
    dreamMeaningFull: "obrazy i myśli przepływające przez głowę podczas snu",
    dreamExample: "„Zeszłej nocy miałem sen o dalekiej podróży.”",
    dreamMeaningShort: "Obrazy i myśli przepływające przez głowę podczas snu",
    dreamKidDef: "„Sen” to obrazki i historie, które biegną ci w głowie, kiedy śpisz. Czasem wesołe, czasem dziwne, i znikają, gdy się budzisz.",
    dreamEx1: "„Zeszłej nocy miałem sen o długiej podróży.”",
    dreamEx2: "„Obudziła się ze strasznego snu.”",
    dreamEx3: "„Śniło mu się, że leci w kosmos.”",
    kidsLabel: "Tryb dla dzieci",
    searchHint: "Wpisz słowo",
    tabMeanings: "Znaczenia",
    tabPicture: "Obrazek",
    tabNotebook: "Zeszyt",
    searchTagline: "Dziecko wpisuje słowo i tyle.",
    quizQ: "Co znaczy „sen”?",
    quizRight: "Obrazy i myśli podczas snu",
    quizWrong1: "Rodzaj ciasta",
    quizWrong2: "Instrument muzyczny",
  },
  fa: {
    meaningsWord: "شیر",
    meaning1T: "حیوان درنده و نیرومند جنگل",
    meaning1Ex: "«شیر در جنگل غرید.»",
    meaning2T: "نوشیدنی سفیدی که از حیوانات به دست می‌آید",
    meaning2Ex: "«هر روز صبح یک لیوان شیر می‌خورم.»",
    kidsBubble: "«بی‌میل» یعنی وقتی اصلاً دلت نمی‌خواهد کاری را انجام بدهی و پاهایت آرام آرام راه می‌روند. مثل رفتن به دندان‌پزشکی.",
    contextSentence: "بزرگ‌ترین {رویای} من پزشک شدن است",
    contextMeaning: "معنی اینجا: امید یا هدفی که می‌خواهی به آن برسی",
    notebookTitle: "دفترچه‌ی زهرا",
    notebookDue: "تمرین امروز",
    profile1Name: "زهرا",
    profile1Grade: "کلاس دوم",
    profile2Name: "علی",
    profile2Grade: "کلاس ششم",
    profile3Name: "یاسمن",
    profile3Grade: "کلاس نهم",
    gameTwinTrap: "تله‌ی دوقلوها",
    gameTimeTraveler: "مسافر زمان",
    gameStreak: "6 روز پیاپی 🔥",
    englishWord: "reluctant",
    englishMeaningT: "کسی که واقعاً تمایلی ندارد",
    englishMeaningEx: "«او برای شروع تکالیفش بی‌میل بود.»",
    puzzleSentence: "ملوان {مصمم} بود به جزیره برسد، با وجود {طوفان} هرگز {تردید} نکرد",
    dreamWord: "رویا",
    dreamPos: "اسم",
    dreamMeaningFull: "تصویرها و اندیشه‌هایی که هنگام خواب از ذهن می‌گذرند",
    dreamExample: "«دیشب رویای یک سفر دور را دیدم.»",
    dreamMeaningShort: "تصویرها و اندیشه‌هایی که هنگام خواب از ذهن می‌گذرند",
    dreamKidDef: "«رویا» همان تصویرها و داستان‌هایی است که وقتی خوابی در سرت جریان دارند. گاهی شاد، گاهی عجیب، و همین‌که بیدار می‌شوی محو می‌شوند.",
    dreamEx1: "«دیشب رویای یک سفر طولانی را دیدم.»",
    dreamEx2: "«او از یک رویای ترسناک بیدار شد.»",
    dreamEx3: "«بزرگ‌ترین رویای او پرواز به فضاست.»",
    kidsLabel: "حالت کودکان",
    searchHint: "یک واژه بنویس",
    tabMeanings: "معناها",
    tabPicture: "تصویر",
    tabNotebook: "دفترچه",
    searchTagline: "کودک یک واژه می‌نویسد، همین.",
    quizQ: "«رویا» یعنی چه؟",
    quizRight: "تصویرها و اندیشه‌ها هنگام خواب",
    quizWrong1: "نوعی کیک",
    quizWrong2: "یک ساز موسیقی",
  },
  id: {
    meaningsWord: "bulan",
    meaning1T: "Benda langit yang bersinar di malam hari",
    meaning1Ex: "“Bulan purnama bersinar terang malam ini.”",
    meaning2T: "Jangka waktu sekitar tiga puluh hari",
    meaning2Ex: "“Kami akan berlibur bulan depan.”",
    kidsBubble: "“Enggan” itu ketika kamu benar-benar tidak ingin melakukan sesuatu, dan kakimu melangkah pelan-pelan. Seperti berjalan ke dokter gigi.",
    contextSentence: "{Mimpi} terbesarku adalah menjadi dokter",
    contextMeaning: "Artinya di sini: harapan atau tujuan yang ingin kamu capai",
    notebookTitle: "Buku catatan Putri",
    notebookDue: "latihan hari ini",
    profile1Name: "Putri",
    profile1Grade: "kelas 2 SD",
    profile2Name: "Rizki",
    profile2Grade: "kelas 6 SD",
    profile3Name: "Dewi",
    profile3Grade: "kelas 3 SMP",
    gameTwinTrap: "Jebakan Kembar",
    gameTimeTraveler: "Penjelajah Waktu",
    gameStreak: "6 hari beruntun 🔥",
    englishWord: "reluctant",
    englishMeaningT: "Tidak begitu ingin melakukan",
    englishMeaningEx: "“Dia enggan mulai mengerjakan PR-nya.”",
    puzzleSentence: "Pelaut itu {bertekad} mencapai pulau, meski ada {badai} ia tidak pernah {ragu}",
    dreamWord: "mimpi",
    dreamPos: "kata benda",
    dreamMeaningFull: "gambar dan pikiran yang melintas di benak saat tidur",
    dreamExample: "“Semalam aku bermimpi tentang perjalanan jauh.”",
    dreamMeaningShort: "Gambar dan pikiran yang melintas di benak saat tidur",
    dreamKidDef: "“Mimpi” adalah gambar dan cerita yang berjalan di kepalamu saat kamu tidur. Kadang menyenangkan, kadang aneh, dan hilang begitu kamu bangun.",
    dreamEx1: "“Semalam aku bermimpi tentang perjalanan panjang.”",
    dreamEx2: "“Dia terbangun dari mimpi yang menakutkan.”",
    dreamEx3: "“Mimpi besarnya adalah terbang ke luar angkasa.”",
    kidsLabel: "Mode Anak",
    searchHint: "Ketik sebuah kata",
    tabMeanings: "Makna",
    tabPicture: "Gambar",
    tabNotebook: "Buku catatan",
    searchTagline: "Anak mengetik sebuah kata, dan selesai.",
    quizQ: "Apa arti “mimpi”?",
    quizRight: "Gambar dan pikiran saat tidur",
    quizWrong1: "Sejenis kue",
    quizWrong2: "Alat musik",
  },
  nl: {
    meaningsWord: "bank",
    meaning1T: "Een lange zitplaats in de woonkamer",
    meaning1Ex: "„We zaten samen op de bank televisie te kijken.”",
    meaning2T: "Een plek waar je je geld bewaart",
    meaning2Ex: "„Ze bracht haar spaargeld naar de bank.”",
    kidsBubble: "„Onwillig” is wanneer je iets eigenlijk niet wilt doen en je voeten heel langzaam gaan. Net als lopen naar de tandarts.",
    contextSentence: "Mijn grootste {droom} is om dokter te worden",
    contextMeaning: "De betekenis hier: een hoop of doel dat je wilt bereiken",
    notebookTitle: "Emma's schrift",
    notebookDue: "vandaag oefenen",
    profile1Name: "Emma",
    profile1Grade: "groep 4",
    profile2Name: "Daan",
    profile2Grade: "groep 8",
    profile3Name: "Sophie",
    profile3Grade: "derde klas",
    gameTwinTrap: "Tweelingval",
    gameTimeTraveler: "Tijdreiziger",
    gameStreak: "6 dagen op rij 🔥",
    englishWord: "reluctant",
    englishMeaningT: "Niet echt zin hebben om iets te doen",
    englishMeaningEx: "„Hij was onwillig om aan zijn huiswerk te beginnen.”",
    puzzleSentence: "De zeeman was {vastberaden} om het eiland te bereiken, ondanks de {storm} {aarzelde} hij nooit",
    dreamWord: "droom",
    dreamPos: "zelfstandig naamwoord",
    dreamMeaningFull: "beelden en gedachten die tijdens de slaap door je hoofd gaan",
    dreamExample: "„Vannacht had ik een droom over een verre reis.”",
    dreamMeaningShort: "Beelden en gedachten die tijdens de slaap door je hoofd gaan",
    dreamKidDef: "„Dromen” zijn de plaatjes en verhalen die door je hoofd lopen terwijl je slaapt. Soms leuk, soms raar, en ze vervagen als je wakker wordt.",
    dreamEx1: "„Vannacht had ik een droom over een lange reis.”",
    dreamEx2: "„Ze werd wakker uit een enge droom.”",
    dreamEx3: "„Zijn grote droom is naar de ruimte vliegen.”",
    kidsLabel: "Kindermodus",
    searchHint: "Typ een woord",
    tabMeanings: "Betekenissen",
    tabPicture: "Afbeelding",
    tabNotebook: "Schrift",
    searchTagline: "Het kind typt een woord, en dat is het.",
    quizQ: "Wat betekent „droom”?",
    quizRight: "Beelden en gedachten tijdens de slaap",
    quizWrong1: "Een soort taart",
    quizWrong2: "Een muziekinstrument",
  },
};

// Split a sentence that marks a word with {braces} into [before, word, after].
function splitMark(s: string): [string, string, string] {
  const m = s.match(/^(.*?)\{([^}]*)\}(.*)$/);
  return m ? [m[1], m[2], m[3]] : [s, "", ""];
}

function famMock(lang: string): FamMock {
  return FAM_MOCK[lang] ?? FAM_MOCK.en;
}

function MockMeanings({ lang }: { lang: string }) {
  const m = famMock(lang);
  const word = m.meaningsWord;
  const m1 = { t: m.meaning1T, ex: m.meaning1Ex };
  const m2 = { t: m.meaning2T, ex: m.meaning2Ex };
  return (
    <div className="fam-mock">
      <div className="fam-mock-search">
        <SearchIcon /> <span>{word}</span>
      </div>
      {[m1, m2].map((m, i) => (
        <div key={i} className="fam-mock-meaning">
          <div className={`fam-mock-thumb fam-mock-thumb-${i}`}>
            {i === 0 ? <LeafIcon /> : <ArrowUpIcon />}
          </div>
          <div>
            <div className="fam-mock-meaning-t">{i + 1}. {m.t}</div>
            <div className="fam-mock-meaning-ex">{m.ex}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MockKids({ lang }: { lang: string }) {
  const m = famMock(lang);
  return (
    <div className="fam-mock">
      <div className="fam-mock-toggle">
        <span className="fam-mock-toggle-pill">{m.kidsLabel}</span>
        <span className="fam-mock-toggle-on" />
      </div>
      <div className="fam-mock-bubble">
        {m.kidsBubble}
      </div>
      <Image
        src="/gad-it-character.png"
        alt=""
        width={72}
        height={72}
        className="fam-mock-char"
      />
    </div>
  );
}

function MockContext({ lang }: { lang: string }) {
  const m = famMock(lang);
  const [pre, mark, post] = splitMark(m.contextSentence);
  return (
    <div className="fam-mock">
      <div className="fam-mock-sentence">
        {pre}<mark>{mark}</mark>{post}
      </div>
      <div className="fam-mock-arrow">↓</div>
      <div className="fam-mock-picked">
        <CheckIcon color="#0EA5A5" />
        <span>{m.contextMeaning}</span>
      </div>
    </div>
  );
}

// Sample "words to look up" shown in the notebook mockup, one triplet per
// UI language, so a Dutch/French/etc. visitor never sees English example
// words. (Used to only cover ar/ru/he and fell back to English otherwise.)
const EXAMPLE_WORDS: Record<string, [string, string, string]> = {
  en: ["dream", "vivid", "reluctant"],
  he: ["חלום", "מרהיב", "נחוש"],
  ar: ["حلم", "واضح", "متردّد"],
  ru: ["мечта", "яркий", "упорный"],
  es: ["sueño", "vívido", "reacio"],
  pt: ["sonho", "vívido", "relutante"],
  fr: ["rêve", "éclatant", "réticent"],
  de: ["Traum", "lebhaft", "zögerlich"],
  cs: ["sen", "živý", "váhavý"],
  sk: ["sen", "žiarivý", "zdráhavý"],
  it: ["sogno", "vivido", "riluttante"],
  ja: ["夢", "鮮やか", "曖昧"],
  hi: ["सपना", "जीवंत", "अनिच्छुक"],
  am: ["ህልም", "ደማቅ", "እምቢተኛ"],
  uk: ["мрія", "яскравий", "нерішучий"],
  tr: ["hayal", "canlı", "isteksiz"],
  pl: ["marzenie", "żywy", "niechętny"],
  fa: ["رویا", "روشن", "مردد"],
  id: ["mimpi", "cerah", "enggan"],
  nl: ["droom", "levendig", "aarzelend"],
};

function MockNotebook({ lang }: { lang: string }) {
  const m = famMock(lang);
  const words = EXAMPLE_WORDS[lang] ?? EXAMPLE_WORDS.en;
  return (
    <div className="fam-mock">
      <div className="fam-mock-nb-title">{m.notebookTitle}</div>
      {words.map((w, i) => (
        <div key={i} className="fam-mock-nb-row">
          <CheckIcon color={i < 2 ? "#0EA5A5" : "#d1d5db"} />
          <span>{w}</span>
          {i === 2 && <span className="fam-mock-nb-due">{m.notebookDue}</span>}
        </div>
      ))}
    </div>
  );
}

function MockProfiles({ lang }: { lang: string }) {
  const m = famMock(lang);
  const kids = [
    { n: m.profile1Name, g: m.profile1Grade, c: "#0EA5A5" },
    { n: m.profile2Name, g: m.profile2Grade, c: "#7C3AED" },
    { n: m.profile3Name, g: m.profile3Grade, c: "#D97706" },
  ];
  return (
    <div className="fam-mock fam-mock-profiles">
      {kids.map((k) => (
        <div key={k.n} className="fam-mock-profile">
          <div className="fam-mock-avatar" style={{ background: k.c }}>
            {k.n[0]}
          </div>
          <div className="fam-mock-profile-n">{k.n}</div>
          <div className="fam-mock-profile-g">{k.g}</div>
        </div>
      ))}
    </div>
  );
}

function MockGames({ lang }: { lang: string }) {
  const m = famMock(lang);
  return (
    <div className="fam-mock fam-mock-games">
      <div className="fam-mock-game" style={{ background: "rgba(14,165,165,0.1)" }}>
        <PuzzleIcon />
        <span>{m.gameTwinTrap}</span>
      </div>
      <div className="fam-mock-game" style={{ background: "rgba(124,58,237,0.1)" }}>
        <ClockIcon />
        <span>{m.gameTimeTraveler}</span>
      </div>
      <div className="fam-mock-score">{m.gameStreak}</div>
    </div>
  );
}

function MockEnglish({ lang }: { lang: string }) {
  const m = famMock(lang);
  return (
    <div className="fam-mock">
      <div className="fam-mock-search">
        <SearchIcon /> <span>{m.englishWord}</span>
      </div>
      <div className="fam-mock-meaning">
        <div className="fam-mock-thumb fam-mock-thumb-1">
          <PersonIcon />
        </div>
        <div>
          <div className="fam-mock-meaning-t">{m.englishMeaningT}</div>
          <div className="fam-mock-meaning-ex">{m.englishMeaningEx}</div>
        </div>
      </div>
    </div>
  );
}

/** The puzzle metaphor made concrete (Gadi 2026-07-26): the same
 *  sentence shown twice. First with its key words missing — dashed gaps
 *  a child cannot fill, so the whole meaning collapses. Then complete,
 *  every word a solid piece, and the picture is whole. Words ARE the
 *  pieces of the picture. */
function PuzzleMock({ lang, beforeLabel, afterLabel }: { lang: string; beforeLabel: string; afterLabel: string }) {
  type Tok = string | { k: string };
  const tokens: Tok[] = famMock(lang).puzzleSentence.split(" ").map((w) => {
    const mm = w.match(/^\{(.*)\}$/);
    return mm ? { k: mm[1] } : w;
  });
  return (
    <div className="fam-puzzle">
      <div className="fam-puzzle-block fam-puzzle-bad">
        <div className="fam-puzzle-cap fam-puzzle-cap-bad">{beforeLabel}</div>
        <p className="fam-puzzle-text">
          {tokens.map((t, i) => (
            <Fragment key={i}>
              {typeof t === "string" ? (
                <span className="fam-pz-word">{t}</span>
              ) : (
                <span className="fam-pz-gap" aria-hidden>?</span>
              )}{" "}
            </Fragment>
          ))}
        </p>
      </div>
      <div className="fam-puzzle-arrow" aria-hidden>↓</div>
      <div className="fam-puzzle-block fam-puzzle-good">
        <div className="fam-puzzle-cap fam-puzzle-cap-good">
          <CheckIcon color="#0b7d7d" />
          {afterLabel}
        </div>
        <p className="fam-puzzle-text">
          {tokens.map((t, i) => (
            <Fragment key={i}>
              {typeof t === "string" ? (
                <span className="fam-pz-word">{t}</span>
              ) : (
                <span className="fam-pz-fill">{t.k}</span>
              )}{" "}
            </Fragment>
          ))}
        </p>
      </div>
    </div>
  );
}

/** A faithful mockup of the real Gadit word screen inside a phone
 *  shell. Gadi's feedback (2026-07-17): the page showed warm family
 *  scenes but never the PRODUCT as an app on a device. This is the
 *  actual UI (teal search pill, big word title, part-of-speech chip,
 *  a meaning card with its picture, Kids Mode toggle, example) so a
 *  parent sees exactly what they are buying. */
function PhoneMock({ lang }: { lang: string }) {
  const m = famMock(lang);
  const word = m.dreamWord;
  const pos = m.dreamPos;
  const meaning = m.dreamMeaningFull;
  const example = m.dreamExample;
  const kids = m.kidsLabel;
  const searchHint = m.searchHint;
  return (
    <div className="fam-phone" aria-hidden>
      <div className="fam-phone-notch" />
      <div className="fam-phone-screen">
        <div className="fam-ph-top">
          <span className="fam-ph-brand">Gad<span className="fam-ph-it">it</span></span>
          <span className="fam-ph-kids">
            <span className="fam-ph-kids-label">{kids}</span>
            <span className="fam-ph-toggle" />
          </span>
        </div>
        <div className="fam-ph-search">
          <SearchIcon />
          <span className="fam-ph-word-typed">{word}</span>
          <span className="fam-ph-hint">{searchHint}</span>
        </div>
        <div className="fam-ph-title-row">
          <span className="fam-ph-title">{word}</span>
          <span className="fam-ph-pos">{pos}</span>
        </div>
        <div className="fam-ph-card">
          <div className="fam-ph-pic">
            <MoonIcon />
            <span className="fam-ph-star fam-ph-star-1" />
            <span className="fam-ph-star fam-ph-star-2" />
            <span className="fam-ph-star fam-ph-star-3" />
          </div>
          <div className="fam-ph-meaning-row">
            <span className="fam-ph-num">1</span>
            <div>
              <div className="fam-ph-def">{meaning}</div>
              <div className="fam-ph-ex">{example}</div>
            </div>
          </div>
        </div>
        <div className="fam-ph-tabs">
          <span className="is-active">{m.tabMeanings}</span>
          <span>{m.tabPicture}</span>
          <span>{m.tabNotebook}</span>
        </div>
      </div>
    </div>
  );
}

/** Step 1 of the how-it-works flow: the child types a word. A faithful
 *  recreation of the real search screen (Kids Mode on, teal search pill
 *  with the typed word and a blinking caret). */
function MockSearch({ lang }: { lang: string }) {
  const m = famMock(lang);
  return (
    <div className="fam-mock">
      <div className="fam-mock-toggle">
        <span className="fam-mock-toggle-pill">{m.kidsLabel}</span>
        <span className="fam-mock-toggle-on" />
      </div>
      <div className="fam-mock-search fam-mock-search-lg">
        <SearchIcon />
        <span>{m.dreamWord}</span>
        <span className="fam-mock-caret" aria-hidden />
      </div>
      <div className="fam-mock-searchhint">{m.searchTagline}</div>
    </div>
  );
}

/** Step 2 of the how-it-works flow: the meaning, shown with a PROMINENT
 *  picture (Gadi 2026-07-29 — the picture is the heart of the product and
 *  was barely visible as tiny icons before). A big illustrated card, the
 *  kid-level meaning, and an example. */
function MockPicture({ lang }: { lang: string }) {
  const m = famMock(lang);
  return (
    <div className="fam-mock">
      <div className="fam-mock-search">
        <SearchIcon /> <span>{m.dreamWord}</span>
      </div>
      <div className="fam-ph-pic fam-mock-pic" aria-hidden>
        {/* A child dreaming — a sleeping face with a dream cloud (moon +
            stars) above, not just a night sky (Gadi 2026-08-02). */}
        <svg viewBox="0 0 140 110" style={{ width: "82%", height: "auto" }} fill="none" aria-hidden="true">
          <circle cx="66" cy="58" r="4" fill="rgba(255,255,255,0.16)" />
          <circle cx="77" cy="48" r="6" fill="rgba(255,255,255,0.16)" />
          <ellipse cx="100" cy="34" rx="30" ry="19" fill="rgba(255,255,255,0.18)" />
          <path d="M104 24a10 10 0 1 0 7 15 8 8 0 0 1-7-15z" fill="#FDE68A" />
          <circle cx="88" cy="30" r="1.6" fill="#FDE68A" />
          <circle cx="114" cy="40" r="1.4" fill="#FDE68A" />
          <ellipse cx="52" cy="95" rx="40" ry="10" fill="rgba(255,255,255,0.16)" />
          <circle cx="50" cy="74" r="18" fill="#F8FAFC" />
          <path d="M40 72q4 4 8 0" stroke="#7C3AED" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M52 72q4 4 8 0" stroke="#7C3AED" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M44 82q6 5 12 0" stroke="#7C3AED" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </div>
      <div className="fam-mock-meaning">
        <div>
          <div className="fam-mock-meaning-t">{m.dreamMeaningShort}</div>
          <div className="fam-mock-meaning-ex">{m.dreamExample}</div>
        </div>
      </div>
    </div>
  );
}

/** Definition block: the kid-level meaning, on its own. */
function MockDefinition({ lang }: { lang: string }) {
  const m = famMock(lang);
  return (
    <div className="fam-mock">
      <div className="fam-mock-search">
        <SearchIcon /> <span>{m.dreamWord}</span>
      </div>
      <div className="fam-mock-bubble">{m.dreamKidDef}</div>
    </div>
  );
}

/** Examples block: three real sentences with the word. */
function MockExamples({ lang }: { lang: string }) {
  const m = famMock(lang);
  const ex = [m.dreamEx1, m.dreamEx2, m.dreamEx3];
  return (
    <div className="fam-mock">
      <div className="fam-mock-search">
        <SearchIcon /> <span>{m.dreamWord}</span>
      </div>
      <div className="fam-mock-examples">
        {ex.map((e, i) => (
          <div key={i} className="fam-mock-ex-row">
            <span className="fam-mock-ex-num">{i + 1}</span>
            <span>{e}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Quiz block: a short practice question on its own. */
function MockQuiz({ lang }: { lang: string }) {
  const m = famMock(lang);
  return (
    <div className="fam-mock">
      <div className="fam-mock-quiz fam-mock-quiz-solo">
        <div className="fam-mock-quiz-q">{m.quizQ}</div>
        <div className="fam-mock-quiz-opt is-right">{m.quizRight}</div>
        <div className="fam-mock-quiz-opt">{m.quizWrong1}</div>
        <div className="fam-mock-quiz-opt">{m.quizWrong2}</div>
      </div>
    </div>
  );
}

const MOCKUPS = [MockMeanings, MockKids, MockContext, MockNotebook, MockProfiles, MockGames, MockEnglish];

// One block per feature, in order, each with its own real product screen
// (Gadi 2026-07-29: separate every feature so each gets its own space).
// type → definition → examples → picture → context → notebook → quiz → game.
const HOW_MOCKS = [
  MockSearch, MockDefinition, MockExamples, MockPicture,
  MockContext, MockNotebook, MockQuiz, MockGames,
];

// Real illustrations (GPT, 2026-07-17, teal paper-cutout style, in
// /public/fam as compressed WebP). One per feature; the 7th (English
// homework) has no clean illustration yet (every generation leaked
// text), so it falls back to the CSS mockup. Alt text is intentionally
// empty: these are decorative, the copy carries the meaning.
const FEATURE_IMG: Array<string | null> = [
  "meanings",
  "kids-mode",
  "context",
  "notebook",
  "profiles",
  "games",
  "english",
];

/* ────────────────────────── page ────────────────────────── */

export default function FamiliesLandingClient({ withNav = false }: { withNav?: boolean }) {
  const params = useSearchParams();
  const { user, familyId, promptLogin } = useAuth();
  const { lang, dir } = useLang();
  const href = useHref();
  const he = lang === "he";
  const c = (COPY as Record<string, Copy>)[lang] ?? COPY.en;

  // Default angle: vocab (Gadi 2026-07-17 + council: the master promise
  // is visible vocabulary growth; the pain angles stay as variants).
  const rawAngle = params.get("v");
  const angle: Angle = ANGLES.includes(rawAngle as Angle) ? (rawAngle as Angle) : "vocab";
  const hero = c.angles[angle];

  // Default to MONTHLY (Gadi 2026-07-29): the yearly figure can scare a
  // cold visitor. Show the small monthly price first; the yearly tab wears
  // a discount badge so the saving is visible before they even click it.
  const [billing, setBilling] = useState<"yearly" | "monthly">("monthly");
  const isOwner = !!user && familyId === user.uid;

  const viewedRef = useRef(false);
  useEffect(() => {
    if (viewedRef.current) return;
    viewedRef.current = true;
    track("families_lp_view", { angle, lang });
  }, [angle, lang]);

  // Craft pass (2026-07-26): sections rise in as they enter the viewport,
  // and a sticky CTA bar slides up once the hero has scrolled away so the
  // action is always one tap from the reader (CRO: repeat the CTA at every
  // decision point). Both degrade gracefully — no JS or reduced-motion
  // leaves everything visible and static.
  const rootRef = useRef<HTMLDivElement>(null);
  const heroEndRef = useRef<HTMLDivElement>(null);
  const [showSticky, setShowSticky] = useState(false);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.classList.add("fam-js");
    const bands = Array.from(root.querySelectorAll<HTMLElement>(".fam-band"));
    let revealObs: IntersectionObserver | null = null;
    if (!reduce && "IntersectionObserver" in window) {
      revealObs = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              e.target.classList.add("is-in");
              revealObs?.unobserve(e.target);
            }
          }
        },
        { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
      );
      bands.forEach((b) => revealObs?.observe(b));
    } else {
      bands.forEach((b) => b.classList.add("is-in"));
    }
    let stickyObs: IntersectionObserver | null = null;
    const sentinel = heroEndRef.current;
    if (sentinel && "IntersectionObserver" in window) {
      stickyObs = new IntersectionObserver(
        ([e]) => setShowSticky(!e.isIntersecting),
        { threshold: 0 },
      );
      stickyObs.observe(sentinel);
    }
    return () => {
      revealObs?.disconnect();
      stickyObs?.disconnect();
    };
  }, []);

  function startTrial(source: string) {
    track("families_lp_cta", { angle, billing, source });
    if (isOwner) {
      window.location.href = href("/family");
      return;
    }
    const priceId = billing === "yearly" ? PRICE_FAMILY_YEARLY : PRICE_FAMILY_MONTHLY;
    if (!priceId) {
      console.error("Missing Stripe priceId");
      window.alert("Pricing is misconfigured. Please contact support.");
      return;
    }
    promptLogin({
      mode: "signup",
      onSuccess: () => {
        window.location.href = `${href("/checkout")}?price=${encodeURIComponent(priceId)}`;
      },
    });
  }

  function startDeep() {
    track("families_lp_cta", { angle, billing: "deep_monthly", source: "single_child" });
    if (!PRICE_DEEP_MONTHLY) return;
    promptLogin({
      mode: "signup",
      onSuccess: () => {
        window.location.href = `${href("/checkout")}?price=${encodeURIComponent(PRICE_DEEP_MONTHLY)}`;
      },
    });
  }

  const ctaLabel = isOwner ? c.ownerCta : c.heroCta;

  return (
    <div dir={dir} className="fam-page" ref={rootRef}>
      <style>{FAM_CSS}</style>

      {withNav ? (
        /* In-site version (/families): the full Gadit topbar, matching
           /schools. Wrapped in a .wordbook context because the topbar CSS
           is scoped under .wordbook — the families page is .fam-page, so
           without this wrapper the nav collapsed into an unstyled cluster
           (Gadi 2026-07-29). The wrapper only carries fonts/vars, no box. */
        <div className="wordbook wb-force-light" dir={dir}>
          <header className="wb-shell-topbar">
            <Link href={href("/")} className="wb-wordmark" dir="ltr" translate="no">
              Gad<span className="wb-wordmark-it">it</span>
            </Link>
            <WbShellNav active="families" />
            <div className="wb-shell-actions">
              <ShareButton
                url="https://www.gadit.app/families"
                currentPage
                title={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).title}
                text=""
                shareLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).shareLabel}
                copiedLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).copiedLabel}
              />
              <LangSwitcher />
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
            <div className="wb-shell-mobile-menu-cluster">
              <ShareButton
                url="https://www.gadit.app/families"
                currentPage
                title={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).title}
                text=""
                shareLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).shareLabel}
                copiedLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).copiedLabel}
              />
              <LangSwitchMobile />
              <WbShellBurger active="families" />
            </div>
          </header>
        </div>
      ) : (
        /* Standalone campaign version (/families/landing): brand only,
           no nav, so a sent link reads as a single product page. A small
           language switcher sits in the corner so a visitor can change the
           interface language without a site nav. */
        <header className="fam-topbrand">
          <div className="fam-topbrand-lang">
            <LangSwitcher variant="muted" />
          </div>
          <Link href={href("/")} className="fam-logo-word" aria-label="Gadit" dir="ltr" translate="no">
            Gad<span className="fam-logo-it">it</span>
          </Link>
          <div className="fam-topbrand-tagline">{c.heroBadge}</div>
        </header>
      )}

      <main>
        {/* 1 · Hero — for a COLD visitor: category first (badge),
             then the promise (h1), then a plain what-it-is line, then
             the product itself on a phone so it is instantly clear
             this is a word app, not an abstract idea. */}
        <section className="fam-hero">
          <div className="fam-hero-grid">
            <div className="fam-hero-text">
              <h1 className="fam-h1">{hero.h1}</h1>
              <p className="fam-whatis">{c.whatIs}</p>
              <button type="button" className="fam-cta" onClick={() => startTrial("hero")}>
                {ctaLabel}
              </button>
              {c.ctaMicro && <div className="fam-cta-micro">{c.ctaMicro}</div>}
              <div className="fam-trustline">{c.trustLine}</div>
            </div>
            <div className="fam-hero-visual">
              <div className="fam-hero-stage">
                <div className="fam-hero-panel" aria-hidden />
                <PhoneMock lang={lang} />
                <div className="fam-proof-card" aria-hidden>
                  <div className="fam-proof-head">
                    <NotebookIcon />
                    <span>{c.proofTitle}</span>
                  </div>
                  <div className="fam-proof-big">{c.proofBig}</div>
                  <div className="fam-proof-words">
                    {c.proofWords.map((w, i) => (
                      <span key={i} className="fam-proof-chip">
                        <CheckIcon color="#0EA5A5" />
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="fam-trustbar">
            {c.stats.map((s, i) => (
              <span key={i} className="fam-trustbar-item">
                <CheckIcon color="#0b7d7d" />
                {s}
              </span>
            ))}
          </div>
          <div className="fam-credline">{c.credLine}</div>
        </section>
        <div ref={heroEndRef} aria-hidden className="fam-hero-sentinel" />

        {/* 2 · Pain — the REAL academic pain (Gadi 2026-07-26). Not the
             kid asking about words (that is a good thing) but the words
             they skip: comprehension quietly breaks, vocabulary stays
             thin, retrieval fails, grades slip. White band gives a clean
             break from the cream hero above. */}
        <section className="fam-band fam-band-white">
          <div className="fam-section fam-center">
            <div className="fam-kicker fam-kicker-light">{c.painKicker}</div>
            <h2 className="fam-h2">{c.painTitle}</h2>
            <div className="fam-inline-img">
              <Image src="/fam/pain.webp" alt="" width={1200} height={900} sizes="(max-width: 760px) 92vw, 600px" />
            </div>
            <p className="fam-body fam-body-center">{c.painBody1}</p>
            <p className="fam-body fam-body-center fam-body-strong">{c.painBody2}</p>
            <p className="fam-reframe">{c.reframe}</p>
          </div>
        </section>

        {/* 3 · Puzzle metaphor (Gadi 2026-07-26): text is a puzzle, every
             word a piece. Missing words are holes and the child stops
             seeing the whole picture. Before (gaps) → after (filled). */}
        <section className="fam-band fam-band-cream">
          <div className="fam-section fam-center">
            <div className="fam-kicker fam-kicker-light">{c.puzzleKicker}</div>
            <h2 className="fam-h2">{c.puzzleTitle}</h2>
            <p className="fam-body fam-body-center">{c.puzzleBody}</p>
            <PuzzleMock lang={lang} beforeLabel={c.puzzleBefore} afterLabel={c.puzzleAfter} />
            <p className="fam-reframe">{c.puzzleLine}</p>
          </div>
        </section>

        {/* 4 · How it works (Gadi 2026-07-28, 5-model synthesis): the old
             negative word→sentence→paragraph chain was redundant with the
             pain + puzzle above (too much problem-piling before showing the
             product), so it is now a POSITIVE 4-step of the actual flow,
             ending in the visible-progress payoff + CTA. */}
        <section className="fam-band fam-band-white">
          <div className="fam-section fam-center fam-section-wide">
            <div className="fam-kicker">{c.chainKicker}</div>
            <h2 className="fam-h2">{c.chainTitle}</h2>
            <div className="fam-how-steps">
              {c.howBlocks.map((blk, i) => {
                const Mock = HOW_MOCKS[i] ?? HOW_MOCKS[0];
                return (
                  <div key={i} className="fam-how-step">
                    <div className="fam-how-step-head">
                      <span className="fam-how-num">{i + 1}</span>
                      <span className="fam-how-text">{blk.t}</span>
                    </div>
                    <div className="fam-how-visual">
                      <Mock lang={lang} />
                    </div>
                    <p className="fam-how-body">{blk.b}</p>
                  </div>
                );
              })}
            </div>
            <div className="fam-chain-turn">
              <div className="fam-chain-turn-title">{c.chainTurnTitle}</div>
              <p className="fam-chain-turn-body">{c.chainTurnBody}</p>
              <button type="button" className="fam-cta" onClick={() => startTrial("chain")}>
                {ctaLabel}
              </button>
            </div>
          </div>
        </section>

        {/* 5 · The parent dashboard (Gadi 2026-07-18): the moat. A mockup
             of the real /family progress view so a parent sees they are
             buying visible, accumulating proof of growth that ChatGPT
             cannot give. */}
        <section className="fam-band fam-band-cream">
          <div className="fam-feature">
            <div className="fam-feature-text">
              <div className="fam-kicker">{c.dashKicker}</div>
              <h2 className="fam-h2 fam-h2-start">{c.dashTitle}</h2>
              <p className="fam-body">{c.dashBody}</p>
            </div>
            <div className="fam-feature-visual">
              <div className="fam-dashmock">
                <div className="fam-dashmock-sum">
                  <div className="fam-dashmock-sumnum">141</div>
                  <div className="fam-dashmock-sumlabel">{he ? "מילים במחברות המשפחה" : "words in the family's notebooks"}</div>
                </div>
                {c.dashKids.map((k, i) => {
                  const colors = ["#0EA5A5", "#7C3AED", "#D97706"];
                  const pct = Math.min(100, Math.round((k.total / 70) * 100));
                  return (
                    <div key={i} className="fam-dashmock-row">
                      <div className="fam-dashmock-avatar" style={{ background: colors[i % 3] }}>
                        {k.name.charAt(0)}
                      </div>
                      <div className="fam-dashmock-info">
                        <div className="fam-dashmock-name">{k.name}</div>
                        <div className="fam-dashmock-bar">
                          <span style={{ width: `${pct}%`, background: colors[i % 3] }} />
                        </div>
                      </div>
                      <div className="fam-dashmock-nums">
                        <span className="fam-dashmock-total">{k.total}</span>
                        <span className="fam-dashmock-week">+{k.week} {c.dashWeekLabel}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 4 · Features — one section per feature, alternating */}
        {c.features.map((f, i) => {
          const Mock = MOCKUPS[i];
          const flip = i % 2 === 1;
          return (
            <section key={i} className={`fam-band ${i % 2 === 0 ? "fam-band-white" : "fam-band-cream"}`}>
              <div className={`fam-feature ${flip ? "is-flipped" : ""}`}>
                <div className="fam-feature-text">
                  <div className="fam-kicker">{f.kicker}</div>
                  <h2 className="fam-h2 fam-h2-start">{f.title}</h2>
                  <p className="fam-body">{f.body}</p>
                </div>
                <div className="fam-feature-visual">
                  {FEATURE_IMG[i] ? (
                    <Image
                      src={`/fam/${FEATURE_IMG[i]}.webp`}
                      alt=""
                      width={1200}
                      height={900}
                      className="fam-feature-illus"
                      sizes="(max-width: 760px) 92vw, 440px"
                    />
                  ) : (
                    <Mock lang={lang} />
                  )}
                </div>
              </div>
            </section>
          );
        })}

        {/* 5 · Mid CTA */}
        <section className="fam-band fam-band-teal">
          <div className="fam-section fam-center">
            <h2 className="fam-h2 fam-h2-onteal">{c.midCtaTitle}</h2>
            <button type="button" className="fam-cta fam-cta-inverse" onClick={() => startTrial("mid")}>
              {isOwner ? c.ownerCta : c.midCta}
            </button>
          </div>
        </section>

        {/* 6 · Comparison */}
        <section className="fam-band fam-band-white">
          <div className="fam-section">
            <div className="fam-kicker">{c.compareKicker}</div>
            <h2 className="fam-h2">{c.compareTitle}</h2>
            <div className="fam-compare">
              <div className="fam-compare-head">
                <span />
                <span className="fam-compare-brand">{c.compareGadit}</span>
                <span>{c.compareOther}</span>
              </div>
              {c.compareRows.map((r, i) => (
                <div key={i} className="fam-compare-row">
                  <span>{r.label}</span>
                  <span>{r.gadit ? <CheckIcon color="#0EA5A5" /> : <XIcon />}</span>
                  <span>{r.other ? <CheckIcon color="#b91c1c" /> : <XIcon />}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7 · Safety */}
        <section className="fam-band fam-band-purple">
          <div className="fam-section fam-center">
            <ShieldBigIcon />
            <h2 className="fam-h2">{c.safeTitle}</h2>
            <div className="fam-inline-img">
              <Image src="/fam/safe.webp" alt="" width={1200} height={900} sizes="(max-width: 760px) 92vw, 560px" />
            </div>
            <p className="fam-body fam-body-center">{c.safeBody}</p>
            <p className="fam-safe-line">{c.safeLine}</p>
          </div>
        </section>

        {/* 8 · Value stack */}
        <section className="fam-band fam-band-cream">
          <div className="fam-section">
            <h2 className="fam-h2">{c.stackTitle}</h2>
            <ul className="fam-list fam-stack">
              {c.stackItems.map((item, i) => (
                <li key={i}>
                  <CheckIcon color="#0EA5A5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 8.5 · Credibility (Gadi 2026-07-28): the honest proof the page
             lacked. 15 years in education, 15,000+ parents/students/
             educators. Kept generic on purpose, no institution named, to
             respect the brand separation. Placed right before the price so
             trust is highest at the ask. */}
        <section className="fam-band fam-band-purple">
          <div className="fam-section fam-center">
            <div className="fam-kicker">{c.credKicker}</div>
            <h2 className="fam-h2">{c.credTitle}</h2>
            <p className="fam-body fam-body-center">{c.credBody}</p>
          </div>
        </section>

        {/* 9 · Pricing */}
        <section className="fam-band fam-band-white" id="fam-pricing">
          <div className="fam-section">
            <div className="fam-kicker">{c.priceKicker}</div>
            <div className="fam-price-card">
              <div className="fam-price-badge">{c.trialBadge}</div>
              <h2 className="fam-price-title">{c.priceTitle}</h2>

              <div className="fam-billing-toggle" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={billing === "monthly"}
                  className={billing === "monthly" ? "is-active" : ""}
                  onClick={() => setBilling("monthly")}
                >
                  {c.billedMonthly}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={billing === "yearly"}
                  className={billing === "yearly" ? "is-active" : ""}
                  onClick={() => setBilling("yearly")}
                >
                  {c.billedYearly}
                  <span className="fam-billing-save" dir="ltr">{c.yearlySave}</span>
                </button>
              </div>

              <div className="fam-price-amount">{billing === "yearly" ? c.yearly : c.monthly}</div>
              {billing === "yearly" && <div className="fam-price-note">{c.yearlyNote}</div>}
              <div className="fam-price-anchor">{c.priceAnchor}</div>

              <button type="button" className="fam-cta fam-cta-wide" onClick={() => startTrial("pricing")}>
                {isOwner ? c.ownerCta : c.priceCta}
              </button>
              <p className="fam-cancel-note">{c.cancelNote}</p>
            </div>

            {!isOwner && (
              <button type="button" className="fam-single-link" onClick={startDeep}>
                {c.singleChild}
              </button>
            )}

            {/* Guarantee */}
            <div className="fam-guarantee">
              <ShieldIcon />
              <div>
                <div className="fam-guarantee-t">{c.guaranteeTitle}</div>
                <div className="fam-guarantee-b">{c.guaranteeBody}</div>
              </div>
            </div>
          </div>
        </section>

        {/* 10 · FAQ */}
        <section className="fam-band fam-band-cream">
          <div className="fam-section">
            <h2 className="fam-h2">{c.faqTitle}</h2>
            <div className="fam-faq">
              {c.faq.map((f, i) => (
                <details key={i} className="fam-faq-item">
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 11 · Final CTA */}
        <section className="fam-band fam-band-teal">
          <div className="fam-section fam-center fam-final">
            <div className="fam-final-img">
              <Image src="/fam/routine.webp" alt="" width={1200} height={800} sizes="(max-width: 760px) 92vw, 560px" />
            </div>
            <h2 className="fam-h2 fam-h2-onteal">{c.finalTitle}</h2>
            <p className="fam-final-sub">{c.finalSub}</p>
            <button type="button" className="fam-cta fam-cta-inverse" onClick={() => startTrial("final")}>
              {isOwner ? c.ownerCta : c.finalCta}
            </button>
          </div>
        </section>
      </main>

      {/* Sticky CTA — mobile only, appears once the hero scrolls away */}
      <div className={`fam-sticky ${showSticky ? "is-shown" : ""}`}>
        <div className="fam-sticky-inner">
          <span className="fam-sticky-note">{c.trialBadge}</span>
          <button type="button" className="fam-cta fam-sticky-cta" onClick={() => startTrial("sticky")}>
            {ctaLabel}
          </button>
        </div>
      </div>

      <footer className="fam-footer">
        <span>© Gadit {new Date().getFullYear()}</span>
        <Link href={href("/terms")}>{c.footerTerms}</Link>
        <Link href={href("/privacy")}>{c.footerPrivacy}</Link>
      </footer>
    </div>
  );
}

/* ────────────────────────── icons ────────────────────────── */

function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ flexShrink: 0 }}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2.4" strokeLinecap="round" aria-hidden style={{ flexShrink: 0 }}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ flexShrink: 0 }}>
      <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
function ShieldBigIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ margin: "0 auto 10px", display: "block" }}>
      <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4-4" />
    </svg>
  );
}
function LeafIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0b7d7d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 21c0-9 4-15 14-17-1 10-6 15-14 17z" />
      <path d="M6 21c3-6 7-10 11-12" />
    </svg>
  );
}
function ArrowUpIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6d28d9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}
function PersonIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0b7d7d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </svg>
  );
}
function PuzzleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0b7d7d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6d28d9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="#fff" aria-hidden style={{ opacity: 0.95 }}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}
function NotebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0b7d7d" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ flexShrink: 0 }}>
      <path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2z" />
      <path d="M9 3v18" />
    </svg>
  );
}

/* ────────────────────────── styles ────────────────────────── */

const FAM_CSS = `
.fam-page {
  min-height: 100dvh;
  background: #f6f4ee;
  color: #1f2937;
  display: flex;
  flex-direction: column;
}
.fam-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 22px;
  max-width: 1040px;
  width: 100%;
  margin: 0 auto;
}
.fam-wordmark {
  font-weight: 800;
  font-size: 22px;
  color: #1f2937;
  text-decoration: none;
  letter-spacing: -0.02em;
}
.fam-wordmark-it { color: #0EA5A5; font-style: italic; }
.fam-logo { display: inline-flex; align-items: center; line-height: 0; }
.fam-logo-icon { border-radius: 11px; display: block; }
.fam-topbrand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 9px;
  padding: 26px 20px 6px;
  position: relative;
}
.fam-topbrand-lang { position: absolute; top: 14px; inset-inline-end: 16px; }
/* Matches the real Gadit wordmark from the live site: Inter, dark ink
   "Gad" + teal italic "it" (globals .wb-home-logo). */
.fam-logo-word {
  font-family: var(--font-inter), 'Inter', system-ui, sans-serif;
  font-weight: 600;
  font-size: 36px;
  line-height: 1;
  letter-spacing: -0.03em;
  color: #0B0F19;
  text-decoration: none;
  direction: ltr;
}
.fam-logo-it { color: #0EA5A5; font-style: italic; font-weight: 500; }
.fam-topbrand-tagline {
  font-weight: 700;
  font-size: 14px;
  color: #0b7d7d;
  background: rgba(14,165,165,0.09);
  border: 1px solid rgba(14,165,165,0.22);
  border-radius: 999px;
  padding: 5px 16px;
}
.fam-header-cta {
  border: 1.5px solid #0EA5A5;
  background: transparent;
  color: #0b7d7d;
  font-weight: 700;
  font-size: 13.5px;
  padding: 8px 14px;
  border-radius: 999px;
  cursor: pointer;
}
.fam-hero {
  padding: 26px 20px 30px;
  max-width: 1000px;
  margin: 0 auto;
}
.fam-hero-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 26px;
  align-items: center;
  text-align: center;
}
.fam-hero-visual { display: flex; justify-content: center; }
@media (min-width: 880px) {
  .fam-hero-grid {
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    text-align: start;
  }
  .fam-hero-text { order: 1; }
  .fam-hero-visual { order: 2; }
}

/* Anchored product stage: phone sits in front of a soft teal panel,
   with a notebook proof card overlapping its corner (the master
   promise made visible, per the 5-AI hero review). */
.fam-hero-stage { position: relative; display: inline-block; padding: 10px 0 34px; }
.fam-hero-panel {
  position: absolute;
  inset: 24px -6% 60px -6%;
  background:
    radial-gradient(120% 90% at 50% 30%, rgba(14,165,165,0.16), rgba(14,165,165,0.05) 60%, transparent 75%);
  border-radius: 34px;
  z-index: 0;
}
.fam-hero-stage .fam-phone { position: relative; z-index: 1; }
.fam-proof-card {
  position: absolute;
  z-index: 2;
  bottom: 8px;
  inset-inline-end: -14px;
  width: 190px;
  background: #fff;
  border: 1px solid rgba(31,41,55,0.08);
  border-radius: 16px;
  box-shadow: 0 16px 36px rgba(31,41,55,0.16);
  padding: 12px 14px;
  text-align: start;
  direction: rtl;
}
.fam-proof-head {
  display: flex; align-items: center; gap: 6px;
  font-weight: 700; font-size: 12.5px; color: #0b7d7d;
}
.fam-proof-big { font-weight: 800; font-size: 17px; color: #1f2937; margin: 6px 0 8px; }
.fam-proof-words { display: flex; flex-wrap: wrap; gap: 5px; }
.fam-proof-chip {
  display: inline-flex; align-items: center; gap: 3px;
  background: rgba(14,165,165,0.09);
  border-radius: 999px;
  padding: 3px 8px;
  font-size: 11.5px; font-weight: 600; color: #374151;
}
@media (max-width: 400px) {
  .fam-proof-card { width: 150px; inset-inline-start: -6px; padding: 10px 12px; }
  .fam-proof-big { font-size: 15px; }
}
.fam-badge {
  display: inline-block;
  background: rgba(14,165,165,0.1);
  color: #0b7d7d;
  border: 1px solid rgba(14,165,165,0.25);
  font-weight: 700;
  font-size: 13px;
  padding: 5px 14px;
  border-radius: 999px;
  margin-bottom: 18px;
}
.fam-h1 {
  font-size: clamp(30px, 5.6vw, 46px);
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -0.02em;
  margin: 0 0 14px;
}
.fam-whatis {
  font-size: clamp(14.5px, 2.1vw, 16.5px);
  line-height: 1.6;
  color: #4b5563;
  font-weight: 400;
  margin: 0 0 20px;
  max-width: 520px;
}
.fam-hero-text .fam-whatis { margin-inline: auto; }
@media (min-width: 880px) {
  .fam-hero-text .fam-whatis { margin-inline: 0; }
}
.fam-sub {
  font-size: clamp(15px, 2.3vw, 17px);
  line-height: 1.65;
  color: #6b7280;
  margin: 0 auto 24px;
  max-width: 620px;
}
.fam-cta {
  background: #0EA5A5;
  color: #fff;
  border: none;
  font-weight: 800;
  font-size: 17px;
  padding: 15px 30px;
  border-radius: 13px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(14,165,165,0.22);
  transition: transform 160ms ease-out;
}
.fam-cta-micro { margin-top: 10px; font-size: 13px; color: #9ca3af; }
.fam-trustline { margin-top: 16px; font-size: 14px; font-weight: 600; color: #4b5563; }
.fam-cta:active { transform: scale(0.97); }
.fam-cta-wide { width: 100%; }
.fam-cta-inverse {
  background: #fff;
  color: #0b7d7d;
  box-shadow: 0 6px 18px rgba(0,0,0,0.18);
}
.fam-trust { margin-top: 14px; font-size: 13.5px; color: #6b7280; }
.fam-hero-img {
  margin: 28px auto 0;
  max-width: 680px;
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(31,41,55,0.14);
  line-height: 0;
}
.fam-hero-img img { width: 100%; height: auto; display: block; }
.fam-inline-img {
  margin: 4px auto 20px;
  max-width: 560px;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 14px 36px rgba(31,41,55,0.12);
  line-height: 0;
}
.fam-inline-img img { width: 100%; height: auto; display: block; }
.fam-feature-illus {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 18px;
  box-shadow: 0 14px 34px rgba(31,41,55,0.12);
}
.fam-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-top: 26px;
}
.fam-stat {
  background: #fff;
  border: 1px solid rgba(31,41,55,0.08);
  border-radius: 999px;
  padding: 8px 16px;
  font-weight: 700;
  font-size: 13.5px;
  color: #374151;
}
/* Uniform band rhythm: every section gets the same generous vertical
   space, and a hairline top divider makes the boundary between two
   sections read clearly even when the two warm tones sit next to each
   other (Gadi 2026-07-26 — the hero and the block under it blurred into
   one). Teal/purple carry their own strong colour so they skip the
   hairline. */
.fam-band { padding: 62px 0; }
.fam-band-cream { background: #f6f4ee; border-top: 1px solid rgba(31,41,55,0.06); }
.fam-band-white { background: #ffffff; border-top: 1px solid rgba(31,41,55,0.06); }
.fam-band-teal { background: #0EA5A5; }
.fam-band-purple { background: rgba(124,58,237,0.07); }
.fam-band-ink { background: #fdf6ec; }
@media (max-width: 760px) {
  .fam-band { padding: 46px 0; }
}
.fam-section { max-width: 760px; margin: 0 auto; padding: 0 20px; }
.fam-center { text-align: center; }
.fam-kicker {
  text-align: center;
  font-weight: 800;
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #0b7d7d;
  margin-bottom: 8px;
}
.fam-kicker-light { color: #b45309; }
.fam-h2 {
  font-size: clamp(24px, 4.4vw, 32px);
  font-weight: 800;
  letter-spacing: -0.01em;
  margin: 0 0 16px;
  text-align: center;
}
.fam-h2-start { text-align: start; }
.fam-h2-onteal { color: #fff; }
.fam-body { font-size: 16.5px; line-height: 1.7; color: #374151; margin: 0 0 12px; }
.fam-body-strong { font-weight: 700; color: #1f2937; }
.fam-body-center { text-align: center; max-width: 560px; margin-inline: auto; }
.fam-reframe {
  font-size: clamp(19px, 3vw, 23px);
  font-weight: 800;
  color: #0b7d7d;
  text-align: center;
  margin: 22px 0 0;
}

/* When the chain lives inside a two-column feature (section 2), align
   the illustration to the top of the tall text column and let the
   chain fill the column instead of centering at 480px. */
.fam-feature-top { align-items: start; }
.fam-feature-text .fam-chain { margin-inline: 0; max-width: 100%; }
.fam-feature-text .fam-chain-turn { margin-inline: 0; }
@media (min-width: 761px) {
  .fam-feature-top .fam-feature-illus { position: sticky; top: 24px; }
}

/* Reading-comprehension chain */
.fam-chain {
  max-width: 480px;
  margin: 4px auto 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.fam-chain-step {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border: 1px solid rgba(217,119,6,0.18);
  border-radius: 14px;
  padding: 13px 16px;
  margin-bottom: 26px;
  box-shadow: 0 6px 16px rgba(31,41,55,0.05);
}
.fam-chain-num {
  width: 26px; height: 26px; flex-shrink: 0;
  border-radius: 50%;
  background: rgba(217,119,6,0.12);
  color: #b45309;
  font-weight: 800; font-size: 13px;
  display: flex; align-items: center; justify-content: center;
}
.fam-chain-text { font-size: 15.5px; font-weight: 600; color: #1f2937; line-height: 1.45; }
.fam-chain-arrow {
  position: absolute;
  bottom: -23px;
  inset-inline-start: 50%;
  transform: translateX(50%);
  color: #d97706;
  font-size: 18px;
  font-weight: 800;
}
.fam-chain-step:last-of-type { margin-bottom: 16px; }
.fam-chain-cost {
  text-align: center;
  font-size: clamp(18px, 2.6vw, 21px);
  font-weight: 800;
  color: #b91c1c;
  margin-top: 4px;
}
.fam-chain-turn {
  max-width: 620px;
  margin: 30px auto 0;
  background: #fff;
  border: 2px solid #0EA5A5;
  border-radius: 20px;
  padding: 24px 24px 26px;
  text-align: center;
  box-shadow: 0 14px 36px rgba(14,165,165,0.12);
}
.fam-chain-turn-title {
  font-size: clamp(20px, 3vw, 25px);
  font-weight: 800;
  color: #0b7d7d;
  margin-bottom: 10px;
}
.fam-chain-turn-title::before {
  content: "";
  display: block;
  width: 44px; height: 3px;
  background: #0EA5A5;
  border-radius: 999px;
  margin: 0 auto 14px;
}
.fam-chain-turn-body {
  font-size: 16px;
  line-height: 1.65;
  color: #374151;
  margin: 0 auto 18px;
  max-width: 520px;
}

/* Parent dashboard mockup (mirrors the real /family progress view) */
.fam-dashmock {
  background: #fff;
  border: 1px solid rgba(31,41,55,0.1);
  border-radius: 20px;
  padding: 18px;
  box-shadow: 0 16px 40px rgba(31,41,55,0.1);
  direction: rtl;
}
.fam-dashmock-sum {
  background: linear-gradient(140deg, rgba(14,165,165,0.12), rgba(14,165,165,0.04));
  border: 1px solid rgba(14,165,165,0.2);
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 14px;
}
.fam-dashmock-sumnum { font-size: 30px; font-weight: 800; color: #0b7d7d; line-height: 1; }
.fam-dashmock-sumlabel { font-size: 12.5px; color: #6b7280; font-weight: 600; margin-top: 2px; }
.fam-dashmock-row { display: flex; align-items: center; gap: 11px; padding: 9px 0; }
.fam-dashmock-row + .fam-dashmock-row { border-top: 1px solid rgba(31,41,55,0.06); }
.fam-dashmock-avatar {
  width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
  color: #fff; font-weight: 800; font-size: 16px;
  display: flex; align-items: center; justify-content: center;
}
.fam-dashmock-info { flex: 1; min-width: 0; }
.fam-dashmock-name { font-weight: 700; font-size: 14.5px; color: #1f2937; margin-bottom: 5px; }
.fam-dashmock-bar {
  height: 7px; border-radius: 999px; background: #eef0f2; overflow: hidden;
}
.fam-dashmock-bar span { display: block; height: 100%; border-radius: 999px; }
.fam-dashmock-nums { text-align: end; flex-shrink: 0; }
.fam-dashmock-total { display: block; font-size: 20px; font-weight: 800; color: #1f2937; line-height: 1; }
.fam-dashmock-week { font-size: 11.5px; font-weight: 700; color: #6d28d9; }
/* Phone-frame product mockup */
.fam-phone-wrap { display: flex; justify-content: center; margin-top: 8px; }
.fam-phone {
  width: 300px;
  max-width: 84vw;
  background: #1f2937;
  border-radius: 40px;
  padding: 12px;
  box-shadow: 0 26px 60px rgba(31,41,55,0.32);
  position: relative;
  direction: rtl;
}
.fam-phone-notch {
  position: absolute;
  top: 12px; left: 50%;
  transform: translateX(-50%);
  width: 120px; height: 24px;
  background: #1f2937;
  border-radius: 0 0 16px 16px;
  z-index: 2;
}
.fam-phone-screen {
  background: #f6f4ee;
  border-radius: 30px;
  padding: 34px 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.fam-ph-top { display: flex; align-items: center; justify-content: space-between; }
.fam-ph-brand { font-weight: 800; font-size: 17px; color: #1f2937; letter-spacing: -0.02em; }
.fam-ph-it { color: #0EA5A5; font-style: italic; }
.fam-ph-kids { display: flex; align-items: center; gap: 6px; }
.fam-ph-kids-label { font-size: 11px; font-weight: 700; color: #0b7d7d; }
.fam-ph-toggle {
  width: 30px; height: 18px;
  background: #0EA5A5;
  border-radius: 999px;
  position: relative;
}
.fam-ph-toggle::after {
  content: ""; position: absolute; top: 2.5px; inset-inline-end: 2.5px;
  width: 13px; height: 13px; background: #fff; border-radius: 50%;
}
.fam-ph-search {
  display: flex; align-items: center; gap: 8px;
  background: #fff;
  border: 1.5px solid rgba(14,165,165,0.4);
  border-radius: 999px;
  padding: 10px 14px;
}
.fam-ph-word-typed { font-weight: 700; font-size: 15px; color: #1f2937; }
.fam-ph-hint { margin-inline-start: auto; font-size: 12px; color: #b8bcc4; }
.fam-ph-title-row { display: flex; align-items: baseline; gap: 10px; padding-top: 2px; }
.fam-ph-title { font-size: 30px; font-weight: 800; color: #1f2937; letter-spacing: -0.02em; }
.fam-ph-pos {
  font-size: 11.5px; font-weight: 700; color: #7C3AED;
  background: rgba(124,58,237,0.1); border-radius: 999px; padding: 3px 10px;
}
.fam-ph-card {
  background: #fff;
  border: 1px solid rgba(31,41,55,0.08);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 6px 16px rgba(31,41,55,0.06);
}
.fam-ph-pic {
  height: 92px;
  background: linear-gradient(140deg, #1e3a8a, #4c1d95);
  display: flex; align-items: center; justify-content: center;
  position: relative;
}
.fam-ph-star {
  position: absolute; width: 4px; height: 4px; background: #fff; border-radius: 50%; opacity: 0.9;
}
.fam-ph-star-1 { top: 20px; inset-inline-start: 40px; }
.fam-ph-star-2 { top: 54px; inset-inline-end: 44px; width: 3px; height: 3px; }
.fam-ph-star-3 { top: 30px; inset-inline-end: 70px; width: 5px; height: 5px; }
.fam-ph-meaning-row { display: flex; gap: 10px; padding: 12px 14px; }
.fam-ph-num {
  width: 22px; height: 22px; flex-shrink: 0;
  background: rgba(14,165,165,0.12); color: #0b7d7d;
  border-radius: 50%; font-weight: 800; font-size: 12px;
  display: flex; align-items: center; justify-content: center;
}
.fam-ph-def { font-size: 13.5px; font-weight: 600; color: #1f2937; line-height: 1.45; }
.fam-ph-ex { font-size: 12px; color: #6b7280; margin-top: 4px; line-height: 1.4; }
.fam-ph-tabs { display: flex; gap: 8px; justify-content: center; padding-top: 2px; }
.fam-ph-tabs span {
  font-size: 11.5px; font-weight: 700; color: #9ca3af;
  padding: 5px 12px; border-radius: 999px;
}
.fam-ph-tabs span.is-active { background: #0EA5A5; color: #fff; }
.fam-final-img {
  margin: 0 auto 22px;
  max-width: 560px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 16px 40px rgba(0,0,0,0.22);
  line-height: 0;
}
.fam-final-img img { width: 100%; height: auto; display: block; }
.fam-feature {
  max-width: 940px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 36px;
  align-items: center;
}
.fam-feature.is-flipped .fam-feature-text { order: 2; }
.fam-feature.is-flipped .fam-feature-visual { order: 1; }
.fam-feature-text .fam-kicker { text-align: start; }
@media (max-width: 760px) {
  .fam-feature { grid-template-columns: 1fr; gap: 20px; }
  .fam-feature.is-flipped .fam-feature-text { order: 1; }
  .fam-feature.is-flipped .fam-feature-visual { order: 2; }
}
.fam-mock {
  background: #fff;
  border: 1px solid rgba(31,41,55,0.14);
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 10px 28px rgba(31,41,55,0.13), 0 2px 6px rgba(31,41,55,0.08);
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
}
.fam-mock-search {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f3f4f6;
  border-radius: 999px;
  padding: 9px 14px;
  font-weight: 700;
  font-size: 15px;
}
.fam-mock-meaning { display: flex; gap: 12px; align-items: flex-start; }
.fam-mock-thumb {
  width: 46px; height: 46px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.fam-mock-thumb-0 { background: linear-gradient(135deg, rgba(14,165,165,0.18), rgba(14,165,165,0.06)); }
.fam-mock-thumb-1 { background: linear-gradient(135deg, rgba(124,58,237,0.16), rgba(124,58,237,0.05)); }
.fam-mock-meaning-t { font-weight: 700; font-size: 14.5px; }
.fam-mock-meaning-ex { color: #6b7280; font-size: 13px; margin-top: 2px; }
.fam-mock-toggle { display: flex; align-items: center; gap: 10px; }
.fam-mock-toggle-pill {
  background: rgba(14,165,165,0.12);
  color: #0b7d7d;
  font-weight: 800;
  font-size: 13px;
  border-radius: 999px;
  padding: 5px 12px;
}
.fam-mock-toggle-on {
  width: 38px; height: 22px;
  background: #0EA5A5;
  border-radius: 999px;
  position: relative;
}
.fam-mock-toggle-on::after {
  content: "";
  position: absolute;
  top: 3px; inset-inline-end: 3px;
  width: 16px; height: 16px;
  background: #fff;
  border-radius: 50%;
}
.fam-mock-bubble {
  background: #f0fdfa;
  border: 1px solid rgba(14,165,165,0.25);
  border-radius: 14px;
  padding: 12px 14px;
  font-size: 14px;
  line-height: 1.65;
}
.fam-mock-char { position: absolute; bottom: -14px; inset-inline-end: -10px; }
.fam-mock-sentence {
  font-size: 15.5px;
  background: #f9fafb;
  border-radius: 12px;
  padding: 12px 14px;
  line-height: 1.6;
}
.fam-mock-sentence mark {
  background: rgba(14,165,165,0.2);
  border-radius: 5px;
  padding: 1px 5px;
  font-weight: 800;
}
.fam-mock-arrow { text-align: center; color: #0EA5A5; font-weight: 800; }
.fam-mock-picked {
  display: flex; gap: 8px; align-items: center;
  font-weight: 700; font-size: 14px;
  background: rgba(14,165,165,0.08);
  border-radius: 12px;
  padding: 10px 12px;
}
.fam-mock-nb-title { font-weight: 800; font-size: 14.5px; }
.fam-mock-nb-row { display: flex; align-items: center; gap: 8px; font-size: 14.5px; }
.fam-mock-nb-due {
  margin-inline-start: auto;
  background: rgba(217,119,6,0.12);
  color: #b45309;
  font-weight: 700;
  font-size: 11.5px;
  border-radius: 999px;
  padding: 3px 9px;
}
.fam-mock-quiz {
  border-top: 1px dashed rgba(31,41,55,0.15);
  padding-top: 12px;
  display: flex; flex-direction: column; gap: 7px;
}
.fam-mock-quiz-q { font-weight: 700; font-size: 13.5px; }
.fam-mock-quiz-opt {
  border: 1.5px solid rgba(31,41,55,0.12);
  border-radius: 10px;
  padding: 7px 11px;
  font-size: 13px;
}
.fam-mock-quiz-opt.is-right { border-color: #0EA5A5; background: rgba(14,165,165,0.07); font-weight: 700; }
.fam-mock-profiles { flex-direction: row; justify-content: space-around; }
.fam-mock-profile { text-align: center; }
.fam-mock-avatar {
  width: 52px; height: 52px;
  border-radius: 50%;
  color: #fff;
  font-weight: 800;
  font-size: 20px;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 6px;
}
.fam-mock-profile-n { font-weight: 700; font-size: 14px; }
.fam-mock-profile-g { color: #6b7280; font-size: 12px; }
.fam-mock-games { flex-direction: row; flex-wrap: wrap; }
.fam-mock-game {
  flex: 1;
  min-width: 120px;
  border-radius: 14px;
  padding: 16px 12px;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  font-weight: 700; font-size: 13.5px;
}
.fam-mock-score {
  width: 100%;
  text-align: center;
  font-weight: 700;
  font-size: 13px;
  color: #b45309;
}
.fam-compare {
  background: #fff;
  border: 1px solid rgba(31,41,55,0.1);
  border-radius: 18px;
  overflow: hidden;
  max-width: 560px;
  margin: 0 auto;
  box-shadow: 0 10px 28px rgba(31,41,55,0.07);
}
.fam-compare-head, .fam-compare-row {
  display: grid;
  grid-template-columns: 1fr 84px 84px;
  align-items: center;
  padding: 11px 16px;
  font-size: 14px;
}
.fam-compare-head {
  background: #f9fafb;
  font-weight: 800;
  font-size: 13px;
}
.fam-compare-head span:nth-child(2), .fam-compare-head span:nth-child(3),
.fam-compare-row span:nth-child(2), .fam-compare-row span:nth-child(3) {
  text-align: center;
  display: flex; justify-content: center;
}
.fam-compare-brand { color: #0b7d7d; }
.fam-compare-row { border-top: 1px solid rgba(31,41,55,0.06); }
.fam-safe-line {
  text-align: center;
  font-weight: 800;
  color: #7C3AED;
  margin: 16px 0 0;
  font-size: 16px;
}
.fam-list {
  list-style: none;
  padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: 12px;
  max-width: 520px;
  margin-inline: auto;
}
.fam-list li { display: flex; gap: 10px; align-items: flex-start; font-size: 15.5px; line-height: 1.55; }
.fam-stack {
  background: #fff;
  border: 1px solid rgba(31,41,55,0.08);
  border-radius: 18px;
  padding: 22px 24px;
}
.fam-price-card {
  background: #fff;
  border: 2px solid #0EA5A5;
  border-radius: 22px;
  padding: 26px 24px;
  max-width: 460px;
  margin: 0 auto;
  text-align: center;
  box-shadow: 0 14px 40px rgba(14,165,165,0.12);
}
.fam-price-badge {
  display: inline-block;
  background: #0EA5A5;
  color: #fff;
  font-weight: 800;
  font-size: 13px;
  padding: 5px 14px;
  border-radius: 999px;
  margin-bottom: 10px;
}
.fam-price-title { font-size: 24px; font-weight: 800; margin: 0 0 14px; }
.fam-billing-toggle {
  display: inline-flex;
  background: #f3f4f6;
  border-radius: 999px;
  padding: 4px;
  margin-bottom: 14px;
}
.fam-billing-toggle button {
  border: none;
  background: transparent;
  font-weight: 700;
  font-size: 13.5px;
  color: #6b7280;
  padding: 7px 16px;
  border-radius: 999px;
  cursor: pointer;
}
.fam-billing-toggle button.is-active { background: #fff; color: #0b7d7d; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
.fam-billing-toggle button { display: inline-flex; align-items: center; gap: 6px; }
.fam-billing-save {
  background: #10B981; color: #fff;
  font-size: 10.5px; font-weight: 800;
  padding: 1px 6px; border-radius: 999px;
  line-height: 1.5;
}
/* Follow the page direction so Hebrew reads "19.90 ₪ לחודש" (number on
   the right, unit on the left) rather than the LTR "לחודש 19.90 ₪". */
.fam-price-amount { font-size: 36px; font-weight: 800; }
.fam-price-note { color: #0b7d7d; font-weight: 700; font-size: 14.5px; margin-top: 2px; margin-bottom: 8px; }
.fam-price-anchor {
  color: #6b7280;
  font-size: 13px;
  font-weight: 600;
  margin: 0 auto 16px;
  max-width: 320px;
  line-height: 1.45;
}
.fam-cancel-note { color: #6b7280; font-size: 12.5px; margin: 12px 0 0; line-height: 1.55; }
.fam-single-link {
  display: block;
  margin: 18px auto 0;
  background: none;
  border: none;
  color: #6b7280;
  font-size: 14px;
  text-decoration: underline;
  cursor: pointer;
}
.fam-guarantee {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  background: rgba(124,58,237,0.06);
  border: 1px solid rgba(124,58,237,0.2);
  border-radius: 18px;
  padding: 18px 20px;
  max-width: 560px;
  margin: 26px auto 0;
}
.fam-guarantee-t { font-weight: 800; font-size: 16px; margin-bottom: 4px; }
.fam-guarantee-b { color: #4b5563; font-size: 14.5px; line-height: 1.65; }
.fam-faq { display: flex; flex-direction: column; gap: 10px; }
.fam-faq-item {
  background: #fff;
  border: 1px solid rgba(31,41,55,0.08);
  border-radius: 14px;
  padding: 14px 18px;
}
.fam-faq-item summary { font-weight: 700; font-size: 15.5px; cursor: pointer; list-style: none; }
.fam-faq-item summary::-webkit-details-marker { display: none; }
.fam-faq-item p { margin: 10px 0 0; color: #4b5563; font-size: 14.5px; line-height: 1.65; }
.fam-final { padding: 10px 20px; }
.fam-final-sub { color: rgba(255,255,255,0.9); font-size: 16px; margin: 0 0 20px; }
.fam-footer {
  display: flex;
  gap: 18px;
  justify-content: center;
  padding: 22px;
  color: #9ca3af;
  font-size: 13px;
  border-top: 1px solid rgba(31,41,55,0.06);
}
.fam-footer a { color: #9ca3af; text-decoration: none; }

/* Puzzle metaphor: a sentence with missing pieces, then whole */
.fam-puzzle {
  max-width: 540px;
  margin: 10px auto 6px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.fam-puzzle-block {
  background: #fff;
  border: 1px solid rgba(31,41,55,0.1);
  border-radius: 16px;
  padding: 16px 18px 18px;
  box-shadow: 0 10px 28px rgba(31,41,55,0.08);
  text-align: start;
}
.fam-puzzle-bad { border-color: rgba(185,28,28,0.2); }
.fam-puzzle-good { border-color: rgba(14,165,165,0.32); }
.fam-puzzle-cap {
  font-size: 12.5px;
  font-weight: 800;
  letter-spacing: 0.02em;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.fam-puzzle-cap-bad { color: #b91c1c; }
.fam-puzzle-cap-good { color: #0b7d7d; }
.fam-puzzle-text {
  margin: 0;
  font-size: 16.5px;
  line-height: 2.15;
  color: #1f2937;
  font-weight: 600;
}
.fam-pz-gap {
  display: inline-block;
  min-width: 42px;
  text-align: center;
  border: 2px dashed rgba(185,28,28,0.5);
  border-radius: 8px;
  color: rgba(185,28,28,0.75);
  background: rgba(185,28,28,0.05);
  font-weight: 800;
  padding: 1px 8px;
}
.fam-pz-fill {
  display: inline-block;
  border-radius: 8px;
  background: rgba(14,165,165,0.14);
  border: 2px solid rgba(14,165,165,0.36);
  color: #0b7d7d;
  font-weight: 800;
  padding: 1px 8px;
}
.fam-puzzle-arrow {
  text-align: center;
  color: #0EA5A5;
  font-weight: 800;
  font-size: 20px;
  line-height: 1;
}

/* ─── Craft pass (2026-07-26): motion, sticky CTA, trust bar, polish ─── */
.fam-page {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}
.fam-h1, .fam-h2 { text-wrap: balance; }
.fam-body, .fam-whatis, .fam-chain-turn-body, .fam-guarantee-b { text-wrap: pretty; }

/* CTA state polish: hover lift, active press, keyboard focus ring, custom
   easing (emil: ease-out with punch, exit shorter than enter). */
.fam-cta {
  transition: transform 180ms cubic-bezier(0.23,1,0.32,1), box-shadow 200ms ease, background-color 160ms ease;
}
.fam-cta:hover { transform: translateY(-2px); box-shadow: 0 10px 26px rgba(14,165,165,0.3); background-color: #0c9a9a; }
.fam-cta:active { transform: translateY(0) scale(0.98); }
.fam-cta:focus-visible { outline: 3px solid rgba(14,165,165,0.45); outline-offset: 3px; }
.fam-cta-inverse:hover { background-color: #fff; box-shadow: 0 10px 26px rgba(0,0,0,0.22); }

/* Scroll reveal — only when JS is active, so no-JS stays fully visible. */
.fam-js .fam-band {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 640ms cubic-bezier(0.23,1,0.32,1), transform 640ms cubic-bezier(0.23,1,0.32,1);
}
.fam-js .fam-band.is-in { opacity: 1; transform: none; }

/* Hero trust bar — the honest at-a-glance credibility strip. */
.fam-trustbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px 20px;
  max-width: 720px;
  margin: 24px auto 0;
  padding: 0 20px;
}
.fam-trustbar-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13.5px;
  font-weight: 700;
  color: #4b5563;
}
.fam-hero-sentinel { height: 1px; width: 100%; }

/* Credibility line under the hero trust bar */
.fam-credline {
  max-width: 640px;
  margin: 14px auto 0;
  padding: 0 20px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
}

/* Positive "how it works" steps: teal accent instead of the amber
   problem-chain accent, since this section now shows the product flow. */
.fam-how .fam-chain-step { border-color: rgba(14,165,165,0.2); }
.fam-how .fam-chain-num { background: rgba(14,165,165,0.12); color: #0b7d7d; }
.fam-how .fam-chain-arrow { color: #0EA5A5; }

/* Sticky CTA bar (mobile) — appears after the hero scrolls out of view. */
.fam-sticky {
  position: fixed;
  inset-inline: 0;
  bottom: 0;
  z-index: 50;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-top: 1px solid rgba(31,41,55,0.1);
  box-shadow: 0 -6px 24px rgba(31,41,55,0.1);
  padding: 10px 16px calc(10px + env(safe-area-inset-bottom));
  transform: translateY(130%);
  transition: transform 320ms cubic-bezier(0.32,0.72,0,1);
}
.fam-sticky.is-shown { transform: none; }
.fam-sticky-inner {
  max-width: 560px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.fam-sticky-note { font-size: 13px; font-weight: 800; color: #0b7d7d; white-space: nowrap; }
.fam-sticky-cta { padding: 12px 22px; font-size: 15px; }
@media (min-width: 900px) { .fam-sticky { display: none; } }
@media (max-width: 899px) { .fam-footer { padding-bottom: 86px; } }

@media (prefers-reduced-motion: reduce) {
  .fam-js .fam-band { opacity: 1; transform: none; transition: none; }
  .fam-sticky, .fam-cta { transition: none; }
}

/* How it works: one block per feature, each with a real product screen.
   Two rows of four on desktop; every card the same height via
   grid-auto-rows:1fr + a flex column that stretches the mock (Gadi
   2026-07-29). */
.fam-section-wide { max-width: 1140px; }
.fam-how-steps {
  display: grid;
  grid-template-columns: 1fr;
  grid-auto-rows: 1fr;
  gap: 26px 18px;
  text-align: start;
  margin: 10px 0 12px;
}
@media (min-width: 560px) { .fam-how-steps { grid-template-columns: 1fr 1fr; } }
@media (min-width: 1000px) { .fam-how-steps { grid-template-columns: repeat(4, 1fr); } }
.fam-how-step { display: flex; flex-direction: column; height: 100%; }
.fam-how-visual { flex: 1; display: flex; }
.fam-how-visual .fam-mock { flex: 1; margin: 0; }
.fam-how-body { flex-shrink: 0; }
.fam-how-step-head { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; }
.fam-how-num {
  flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%;
  background: rgba(14,165,165,0.12); color: #0b7d7d;
  font-weight: 800; font-size: 14px;
  display: flex; align-items: center; justify-content: center;
}
.fam-how-text { font-size: 15.5px; font-weight: 700; color: #1f2937; line-height: 1.45; padding-top: 3px; }
.fam-how-visual .fam-mock { margin: 0; }
.fam-mock-search-lg { font-size: 17px; padding: 12px 16px; }
.fam-mock-caret {
  width: 2px; height: 18px; background: #0EA5A5; border-radius: 1px;
  margin-inline-start: 2px; animation: fam-caret 1s step-end infinite;
}
@keyframes fam-caret { 50% { opacity: 0; } }
.fam-mock-searchhint { font-size: 12.5px; color: #9ca3af; font-weight: 500; }
.fam-mock-pic { border-radius: 14px; height: 120px; }
.fam-mock-pic svg { width: 46px; height: 46px; }
.fam-how-body { font-size: 13.5px; color: #6b7280; line-height: 1.55; margin: 12px 0 0; }
.fam-mock-examples { display: flex; flex-direction: column; gap: 8px; }
.fam-mock-ex-row { display: flex; gap: 9px; align-items: flex-start; font-size: 13.5px; color: #374151; line-height: 1.5; }
.fam-mock-ex-num {
  flex-shrink: 0; width: 20px; height: 20px; border-radius: 50%;
  background: rgba(14,165,165,0.1); color: #0b7d7d;
  font-weight: 800; font-size: 11px;
  display: flex; align-items: center; justify-content: center;
}
.fam-mock-quiz-solo { border-top: none; padding-top: 0; }
@media (prefers-reduced-motion: reduce) { .fam-mock-caret { animation: none; } }
`;
