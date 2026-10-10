import type { HelpContent } from "./help-i18n";
import type { Lang } from "./i18n";

/** Help Center in uk, tr, pl, fa, id, nl (2026-10-10 i18n sweep). Same ids, order and meaning as the English block in help-i18n.ts. */
export const HELP_MORE_3: Partial<Record<Lang, HelpContent>> = {
  uk: {
    eyebrow: "Центр допомоги",
    heading: "Знайдіть відповідь швидко.",
    lede: "Поширені запитання та покрокові рішення, згруповані за темами. Якщо не бачите свого питання, зв'яжіться з командою внизу сторінки.",
    stillNeedHelpHeading: "Досі не вийшло?",
    stillNeedHelpBody: "Напишіть нам напряму. Команда читає кожне повідомлення і відповідає протягом одного або двох днів.",
    emailCta: "Написати нам",
    responseTime: "Зазвичай відповідаємо протягом 24 до 48 годин.",
    categories: [
      {
        id: "billing",
        icon: "💳",
        title: "Оплата і підписка",
        items: [
          {
            id: "change-card",
            q: "Як змінити кредитну картку для підписки?",
            a: [
              "Перейти на нову картку можна менш ніж за хвилину і без скасування. Ваша поточна підписка продовжує діяти, просто з новою карткою.",
              "1. Увійдіть на gadit.app і відкрийте сторінку «Акаунт» (угорі праворуч). 2. Натисніть «Керування оплатою». 3. Відкриється захищена сторінка Stripe. Натисніть «Додати спосіб оплати», введіть нову картку і позначте її як основну. 4. За бажанням видаліть стару картку.",
              "Починаючи з наступного платіжного циклу, усі списання йдуть з нової картки. Попереднє списання (вже здійснене) залишається на старій картці. Повернення коштів не потрібне, якщо тільки ви окремо його не хочете.",
            ],
          },
          {
            id: "cancel",
            q: "Як скасувати підписку?",
            a: [
              "Самостійно, будь-коли. Увійдіть, відкрийте «Акаунт», натисніть «Керування оплатою», а потім «Скасувати підписку».",
              "Доступ зберігається до кінця вже оплаченого періоду. Після цього акаунт повертається на Basic (безкоштовний). Ваші збережені слова, історія і записник залишаються в безпеці та доступні.",
              "Якщо ви скасували помилково або передумали, можна відновити підписку на тій самій сторінці до завершення періоду.",
            ],
          },
          {
            id: "switch-plan",
            q: "Як перейти з Clear на Deep (або навпаки)?",
            a: [
              "«Акаунт», потім «Керування оплатою», потім «Оновити підписку». Виберіть новий план.",
              "Stripe автоматично розраховує різницю в ціні пропорційно до днів, що залишилися в поточному періоді. Якщо ви переходите на вищий план, з вас спишуть лише різницю за решту періоду. Якщо переходите на нижчий, кредит зарахується до наступного рахунку.",
            ],
          },
          {
            id: "invoice",
            q: "Як завантажити рахунок або квитанцію?",
            a: [
              "«Акаунт», потім «Керування оплатою», потім «Історія рахунків». Для кожного списання є PDF-квитанція для завантаження з платіжними даними, які ви зберегли.",
              "Якщо в рахунку потрібне інше ім'я, адреса чи податковий номер (наприклад, назва компанії для податкових цілей), оновіть платіжні дані на тій самій сторінці перед завантаженням. Наступна квитанція буде з новими даними.",
            ],
          },
          {
            id: "portal-error",
            q: "Натиснули «Керування оплатою», а з'явилася помилка. Що робити?",
            a: [
              "Є дві поширені причини. По-перше, у вашому акаунті немає активної підписки Stripe. По-друге, у Stripe може ще не бути повного платіжного профілю для вашого акаунта.",
              "Проста перша перевірка: вийдіть, знову увійдіть з тією поштою, яку використовували під час оплати, і спробуйте ще раз. Якщо не допомогло, напишіть нам з поштою акаунта, і команда виправить це зі свого боку за хвилину.",
            ],
          },
          {
            id: "autorenew",
            q: "Чи поновлюється підписка автоматично?",
            a: [
              "Так. Місячні плани поновлюються щомісяця, річні щороку в ту саму дату. Дату наступного списання видно у вашому акаунті та на порталі Stripe.",
              "Якщо не хочете автопоновлення, скасуйте будь-коли до дати поновлення. Скасування не діє одразу. Доступ зберігається до кінця вже оплаченого періоду.",
            ],
          },
          {
            id: "refund",
            q: "Чи можна повернути гроші?",
            a: [
              "Так. Якщо покупка була менш ніж 14 днів тому і сервісом майже не користувалися, напишіть нам з поштою акаунта і коротко поясніть причину. Такі повернення схвалюються без суперечок.",
              "Якщо минуло понад 14 днів, команда розглядає кожен випадок окремо. Скасуйте підписку, щоб вона не поновлювалася далі, і напишіть нам.",
            ],
          },
          {
            id: "unknown-charge",
            q: "Бачу списання, яке не впізнаю.",
            a: [
              "Списання відображаються як GADIT або GADIT.APP на суму $2.99 (Clear щомісяця), $4.99 (Deep щомісяця), $29.99 (Clear щороку) або $49.99 (Deep щороку). Якщо сума не збігається, можливо, це інший сервіс.",
              "Якщо ви впевнені, що це не ваше списання, поки не відкривайте спір через банк. Спершу напишіть нам напряму, вказавши дату і суму. Команда знайде списання, пояснить, що це, і за потреби поверне кошти. Банківський спір може ускладнити майбутні оплати, тому вирішити питання через підтримку зазвичай швидше і безпечніше.",
            ],
          },
          {
            id: "failed-payment",
            q: "Платіж не пройшов. Що робити?",
            a: [
              "Stripe автоматично повторює невдалі платежі кілька разів протягом наступних днів. Більшість проблем зникають самі, щойно банк зніме блокування або на картці буде достатньо коштів.",
              "Якщо хочете виправити одразу, перейдіть до «Акаунт» → «Керування оплатою» → «Додати спосіб оплати», введіть робочу картку і зробіть її основною. Stripe одразу повторить невдале списання з нової картки. Якщо підписка вже повернулася на Basic, можна оформити її знову на сторінці «Ціни», і ваш записник залишиться цілим.",
            ],
          },
          {
            id: "plan-comparison",
            q: "Чим відрізняються Basic, Clear і Deep?",
            a: [
              "Basic (безкоштовно): до 20 пошуків слів на день, усі значення, приклади для кожного значення, ідіоми та походження слова. Для простого пошуку реєстрація не потрібна.",
              "Clear ($2.99/місяць або $29.99/рік): необмежені пошуки, пояснення для дітей, зображення до слова (30/місяць), складання власного речення з відгуком, детальні ідіоми і 30 днів історії пошуку.",
              "Deep ($4.99/місяць або $49.99/рік): усе, що є в Clear, плюс тренувальні тести, особистий записник з розумним інтервальним повторенням, розрізнення схожих слів і більша квота зображень (100/місяць).",
            ],
          },
        ],
      },
      {
        id: "account",
        icon: "👤",
        title: "Акаунт і вхід",
        items: [
          {
            id: "no-verification-email",
            q: "Не прийшов лист для підтвердження.",
            a: [
              "Спершу перевірте папки «Спам» і «Промоакції». Gmail і Outlook іноді відправляють туди листи акаунта, доки ви не позначите один із них як «Не спам».",
              "Якщо там його немає, можливо, під час реєстрації адресу введено з помилкою. Спробуйте зареєструватися ще раз і уважно перевірте адресу. Якщо ви реєструвалися через Google, лист для підтвердження не потрібен.",
            ],
          },
          {
            id: "forgot-password",
            q: "Не пам'ятаю пароль.",
            a: [
              "Відкрийте вікно входу і натисніть «Забули пароль?». Введіть пошту, яку використовуєте для Gadit, і за хвилину або дві отримаєте посилання для скидання.",
              "Якщо лист не прийшов, перевірте спам. Якщо його досі немає, можливо, ви реєструвалися через Google, а не через пошту і пароль. Спробуйте кнопку «Продовжити з Google».",
            ],
          },
          {
            id: "wrong-credentials",
            q: "Пароль точно правильний, але з'являється «Неправильна пошта або пароль».",
            a: [
              "Перевірте три речі. По-перше, Caps Lock. По-друге, пробіл у кінці під час копіювання. По-третє, можливо, ви реєструвалися через Google, а не з паролем (тоді скористайтеся кнопкою «Продовжити з Google»).",
              "Досі не виходить? Скиньте пароль у тому самому вікні. Так ви почнете з чистого аркуша.",
            ],
          },
          {
            id: "google-fails",
            q: "Вхід через Google не працює.",
            a: [
              "Найчастіша причина: браузер блокує сторонні файли cookie або спливні вікна для gadit.app. Дозвольте їх у дозволах сайту в адресному рядку і спробуйте ще раз.",
              "У режимі інкогніто вхід через Google навмисно обмежено. Перейдіть у звичайне вікно браузера.",
            ],
          },
          {
            id: "change-email",
            q: "Як змінити пошту в акаунті?",
            a: [
              "«Акаунт», натисніть на свою пошту, «Змінити пошту». Нову адресу потрібно підтвердити, щоб зміна набула чинності. Підписка, історія і записник переносяться повністю.",
              "Якщо пошта прив'язана до клієнта Stripe, оновіть її також на платіжному порталі Stripe, щоб майбутні квитанції надходили на нову адресу.",
            ],
          },
          {
            id: "delete-account",
            q: "Як видалити акаунт?",
            a: [
              "«Акаунт», унизу сторінки, «Видалити акаунт». Це назавжди. Підписку буде скасовано, записник та історію стерто, а пошта звільниться для нової реєстрації.",
              "Записи Stripe про минулі списання залишаються (за законом ми мусимо зберігати їх для бухгалтерії). Більше нічого не зберігається.",
            ],
          },
          {
            id: "share-account",
            q: "Чи можуть мій партнер або дитина користуватися моїм акаунтом?",
            a: [
              "Один користувач в акаунті одночасно. Дитячий режим дозволяє одному акаунту Clear або Deep служити і батькам, і дитині: увімкніть перемикач, і визначення стануть зрозумілими для дітей без окремих входів.",
              "Якщо двоє дорослих хочуть окремі записники та прогрес, створіть два акаунти. Clear коштує $2.99 на місяць за акаунт.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "Здається, у мене випадково два акаунти. Що робити?",
            a: [
              "Зазвичай так буває, коли людина реєструється один раз через Google, а вдруге через пошту і пароль з тією самою адресою, або коли реєструється двічі з різними адресами. Кожна реєстрація створює окремий акаунт Gadit з власним записником, історією і станом підписки.",
              "Напишіть нам обидві адреси (або UID зі сторінки «Акаунт») і вкажіть, який акаунт хочете залишити. Команда перенесе записники та історію на вибраний акаунт, а потім акуратно закриє інший. Жодні дані не втрачаються.",
            ],
          },
        ],
      },
      {
        id: "product",
        icon: "🔍",
        title: "Користування Gadit",
        items: [
          {
            id: "wrong-definition",
            q: "Здається, визначення неправильне. Що робити?",
            a: [
              "На кожній сторінці результату внизу є невелика кнопка «Повідомити». Натисніть її, виберіть категорію (визначення, етимологія, приклад, ідіома, пояснення для дітей тощо) і напишіть коротку примітку. Вона надходить прямо команді, і кожне повідомлення переглядається.",
              "Не бійтеся бути надто прискіпливими. Саме такі відгуки покращують словник швидше за все інше.",
            ],
          },
          {
            id: "kids-not-working",
            q: "Дитячий режим не змінює пояснення.",
            a: [
              "Дитячий режим змінює текст лише там, де для слова вже створено пояснення для дітей. Для зовсім нових слів, які ви щойно шукали, зачекайте від 10 до 15 секунд. Дитяча версія створюється на льоту під час першого пошуку.",
              "Також: дитячий режим потребує Clear або Deep. Якщо у вас Basic, перемикач запропонує перейти на вищий план. Анонімним користувачам буде запропоновано зареєструватися.",
            ],
          },
          {
            id: "voice-fails",
            q: "Голосовий пошук не працює.",
            a: [
              "Голосовому пошуку потрібен дозвіл на мікрофон. Більшість браузерів питають один раз для кожного сайту. Якщо ви випадково натиснули «Блокувати», потрібно змінити це вручну: натисніть значок замка або інформації поруч із gadit.app в адресному рядку, потім «Налаштування сайту», потім «Мікрофон», потім «Дозволити».",
              "У Safari на iOS доступ до мікрофона також потребує перемикача в Параметри → Safari → Мікрофон. Голос зараз доступний у Clear і Deep: користувачі Basic бачать пропозицію перейти на вищий план, а відвідувачі без входу бачать запрошення увійти.",
            ],
          },
          {
            id: "no-image",
            q: "Не вдається створити зображення для слова.",
            a: [
              "Створення зображень доступне в Clear або Deep з місячною квотою. Clear отримує 30 зображень на місяць, Deep 100. Якщо квоту вичерпано, ви побачите обмеження. Вона оновлюється 1-го числа кожного місяця.",
              "Якщо квоту не вичерпано, а помилки все одно є, зазвичай це тимчасово. Спробуйте ще раз через 30 секунд. Постійні помилки означають баг. Будь ласка, повідомте про це зі сторінки слова.",
            ],
          },
          {
            id: "save-word",
            q: "Як зберегти слово в записник?",
            a: [
              "На будь-якій сторінці результату натисніть «Зберегти в записник» біля назви. Записник доступний у Clear і Deep: там можна пізніше переглядати збережені слова, бачити їх у вигляді галактики і проходити розумні тренування (Deep).",
              "Слова, які ви зберегли і відкрили хоча б раз, доступні офлайн з локального кешу. Офлайн-пакет також кешує найпопулярніші слова вашою мовою, тож ви готові навіть без інтернету.",
            ],
          },
          {
            id: "offline",
            q: "Як працює офлайн-режим?",
            a: [
              "Слова, які ви вже переглядали, кешуються локально. Відкрийте їх знову без інтернету, і вони завантажаться миттєво. Повний офлайн-пакет (найпопулярніші слова вашою мовою) завантажується на вимогу зі сторінки записника.",
              "Пошук зовсім нового слова все одно потребує з'єднання, бо Gadit має створити визначення з нуля. Офлайн-кеш призначений для слів, які ви вже досліджували.",
            ],
          },
          {
            id: "slow",
            q: "Застосунок працює повільно.",
            a: [
              "Перший пошук слова найповільніший, бо Gadit створює повний результат з нуля: зазвичай кілька секунд, іноді довше для складних слів. Наступні пошуки того самого слова миттєві, з кешу.",
              "Якщо повільно працює все, спробуйте жорстке оновлення: Cmd+Shift+R на Mac, Ctrl+Shift+R на Windows. Якщо повільність зберігається на різних сторінках, напишіть нам, вказавши країну і браузер, щоб команда перевірила мережевий маршрут до наших серверів з вашого регіону.",
            ],
          },
          {
            id: "word-not-found",
            q: "Шукаю слово, а результату немає. Що сталося?",
            a: [
              "Спершу перевірте написання. Gadit здебільшого справляється з дрібними описками, але неправильна голосна чи пропущена літера можуть усе збити. Спробуйте запропоноване виправлення, якщо воно з'явиться.",
              "Крім того, дуже рідкісні або сленгові слова можуть не дати впевненого результату. Якщо ви впевнені, що слово існує, натисніть кнопку «Повідомити» на сторінці результату (або на екрані помилки) і повідомте нам. Кожне повідомлення переглядається, а справжні пропуски повертаються в систему.",
            ],
          },
          {
            id: "change-language",
            q: "Як змінити мову інтерфейсу?",
            a: [
              "Угорі праворуч на будь-якій сторінці є маленький значок прапора (або назва поточної мови). Натисніть його і виберіть з 30+ мов: англійська, грецька, іврит, арабська, російська, іспанська, португальська, французька, німецька, чеська, словацька, італійська, японська, гінді, амхарська, зулу.",
              "Ваш вибір зберігається на цьому пристрої. Усе перезавантажується новою мовою: інтерфейс, меню, майбутні визначення слів, приклади, пояснення для дітей і навіть етимологія. Уже кешовані результати старою мовою залишаються, доки ви знову не шукатимете ці слова.",
            ],
          },
        ],
      },
      {
        id: "partner",
        icon: "🤝",
        title: "Партнерська програма",
        items: [
          {
            id: "join-partner",
            q: "Як стати партнером Gadit?",
            a: [
              "Відкрийте /partners з будь-якої сторінки і натисніть «Стати партнером». Зареєструйтеся з іменем і поштою, і ваше унікальне реферальне посилання та панель для відстеження кліків і комісій будуть готові одразу. Без очікування схвалення.",
              "Участь безкоштовна і відкрита для всіх. Щоб стати партнером, підписка Gadit не потрібна.",
            ],
          },
          {
            id: "commission-model",
            q: "Як розраховуються комісії?",
            a: [
              "Стандартні умови: 25% від кожного платежу клієнта протягом його першого року. Після першого року ви отримуєте 10% від кожного платежу, доки клієнт продовжує платити.",
              "Це однаково працює для місячних і річних планів, бо комісія рахується з кожного фактичного платежу. Якщо клієнт скасовує підписку, ваша комісія припиняється з його останнім платежем.",
              "Команда може встановлювати інші ставки для окремих партнерів. Ваші ставки завжди показані в партнерській панелі, яку можна відкрити з /partners.",
            ],
          },
          {
            id: "payout",
            q: "Коли я отримаю виплату?",
            a: [
              "Щомісяця, щойно ваш баланс перевищить $50. Ми використовуємо спосіб виплати, який ви вказали в партнерській панелі (банківський переказ, PayPal тощо). $50 це мінімальний поріг, а не стеля. Ви можете заробити набагато більше, просто виплату отримуєте, коли перевищите поріг.",
              "Комісії стають доступними через 30 днів після оплати підписки, щоб врахувати період повернення коштів. Тож комісія за підписку в січні стає доступною на початку лютого і потрапляє в найближчу виплату, щойно баланс перевищить $50.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "Реєстрація пройшла, але панель порожня.",
            a: [
              "Статистика з'являється після першого кліку на ваше посилання. Порожня панель означає лише, що ніхто ще не клікнув. Поділіться посиланням. Щойно почнеться активність, панель оновлюватиметься майже в реальному часі.",
              "Якщо ви поділилися посиланням і хтось зареєструвався, але панель цього не показує, напишіть нам приблизний час реєстрації, і команда перевірить атрибуцію.",
            ],
          },
          {
            id: "attribution-window",
            q: "Як довго реферальне посилання відстежує відвідувача?",
            a: [
              "Шістдесят днів. Коли відвідувач клікає ваше посилання, ми встановлюємо cookie, який визначає вас як реферера. Якщо він зареєструється і оформить підписку будь-коли протягом наступних 60 днів (навіть якщо піде з сайту і повернеться пізніше через пошук Google), атрибуція все одно зараховується вам.",
              "Очищення cookie: якщо відвідувач очистить cookie або змінить браузер чи пристрій до реєстрації, атрибуцію можна втратити. Обійти це неможливо, але 60 днів це щедрий строк порівняно з більшістю партнерських програм.",
            ],
          },
          {
            id: "missing-commission",
            q: "Хтось зареєструвався за моїм посиланням, але комісії не видно.",
            a: [
              "Найчастіше справа в часі: реєстрація з'являється в панелі за кілька хвилин, але комісія нараховується лише після фактичної оплати підписки (а це може бути через кілька днів, якщо в людини безкоштовний пробний період). Перевірте ще раз після завершення пробного періоду.",
              "Якщо підписку оплачено, а комісії все ще немає через 48 годин, напишіть нам приблизний час реєстрації та пошту або приблизне ім'я підписника, якщо знаєте. Команда перевірить ланцюжок атрибуції і вручну виправить будь-який пропуск.",
            ],
          },
        ],
      },
      {
        id: "general",
        icon: "❓",
        title: "Загальне",
        items: [
          {
            id: "what-is-gadit",
            q: "Що таке Gadit?",
            a: [
              "Багатомовний словник, створений, щоб слово справді стало зрозумілим, а не просто отримало визначення в один рядок. Кожне слово відкривається з усіма значеннями, реальними прикладами для кожного значення, ідіомами, етимологією, зображенням за бажанням і (з Clear і Deep) поясненням для дітей, складанням власного речення з відгуком і тестами.",
              "Зараз 30+ мов інтерфейсу. У команді це називають «зробити GAD слову»: зрозуміти слово до кінця, а не просто перекласти його.",
            ],
          },
          {
            id: "languages",
            q: "Які мови ви підтримуєте?",
            a: [
              "Інтерфейс: англійська, грецька, іврит, арабська, російська, іспанська, португальська, французька, німецька, чеська, словацька, італійська, японська, зулу.",
              "Ви можете шукати слово будь-якою з цих мов і отримувати визначення, приклади та все інше вибраною мовою інтерфейсу. Іврит і арабська повністю підтримують напрямок справа наліво (RTL) і використовують рідні шрифти.",
            ],
          },
          {
            id: "kid-safety",
            q: "Чи безпечний Gadit для дітей?",
            a: [
              "Gadit створено для того, щоб батьки могли безпечно користуватися ним разом із дитиною. Дитячий режим дає прості, конкретні пояснення, що відповідають віку (приблизно для віку від 5 до 10 років), за допомогою того самого рушія, що створює контент для дорослих, з чіткими інструкціями спрощувати. Контент, створений користувачами, ніколи не показується дітям.",
              "Відповідно до наших правил і норм захисту приватності дітей у всьому світі, власний акаунт можна мати з 13 років. Стандартний варіант: акаунт батьків, яким вони користуються разом із дитиною, і саме для цього створено дитячий режим.",
            ],
          },
          {
            id: "data",
            q: "Де зберігаються мої дані? Ви їх продаєте?",
            a: [
              "Акаунт, історія, записник і створені зображення надійно зберігаються у Firebase, у зашифрованому вигляді. Ми нікому не продаємо ваші дані. Ми передаємо лише те, що потрібно для роботи Gadit (зберігання, платежі, постачальники контенту), як описано в Політиці конфіденційності.",
              "Ви можете експортувати записник або видалити акаунт будь-коли на сторінці «Акаунт».",
            ],
          },
          {
            id: "contact-direct",
            q: "Як зв'язатися з вами напряму?",
            a: [
              "Скористайтеся кнопкою пошти внизу цієї сторінки. Лист надходить прямо до скриньки команди. Ми читаємо кожне повідомлення і відповідаємо протягом 24 до 48 годин (часто швидше).",
              "Для підтримки пошта краща за чат: вона дає команді змогу уважно прочитати і вдумливо відповісти. Підтримки телефоном поки немає.",
            ],
          },
        ],
      },
    ],
  },
  tr: {
    eyebrow: "Yardım Merkezi",
    heading: "Cevabı hızla bulun.",
    lede: "Sık sorulan sorular ve adım adım çözümler, konulara göre düzenlendi. Sorununuzu burada göremiyorsanız sayfanın altından ekiple iletişime geçin.",
    stillNeedHelpHeading: "Hâlâ çözemediniz mi?",
    stillNeedHelpBody: "Bize doğrudan yazın. Her mesaj ekip tarafından okunur ve bir iki gün içinde yanıtlanır.",
    emailCta: "Bize e-posta gönderin",
    responseTime: "Genellikle 24 ila 48 saat içinde yanıt veriyoruz.",
    categories: [
      {
        id: "billing",
        icon: "💳",
        title: "Ödeme ve abonelik",
        items: [
          {
            id: "change-card",
            q: "Aboneliğimdeki kredi kartını nasıl değiştiririm?",
            a: [
              "İptal etmeden, bir dakikadan kısa sürede yeni karta geçebilirsiniz. Mevcut aboneliğiniz devam eder, sadece yeni kartla.",
              "1. gadit.app adresinde oturum açın ve Hesap sayfanızı açın (sağ üstte). 2. \"Faturalandırmayı yönet\"e tıklayın. 3. Güvenli bir Stripe sayfası açılır. \"Ödeme yöntemi ekle\"ye tıklayın, yeni kartı girin ve Varsayılan olarak işaretleyin. 4. İsterseniz eski kartı kaldırın.",
              "Bir sonraki fatura döneminden itibaren tüm ödemeler yeni karttan alınır. Önceki ödeme (zaten tahsil edilmiş olan) eski kartta kalır. Özellikle istemediğiniz sürece iade gerekmez.",
            ],
          },
          {
            id: "cancel",
            q: "Aboneliğimi nasıl iptal ederim?",
            a: [
              "Kendiniz, istediğiniz zaman. Oturum açın, Hesap'ı açın, Faturalandırmayı yönet'e ve ardından Aboneliği iptal et'e tıklayın.",
              "Erişiminiz, ödemesini yaptığınız dönemin sonuna kadar devam eder. Ardından hesap Basic'e (ücretsiz) döner. Kaydettiğiniz kelimeler, geçmişiniz ve defteriniz güvende ve erişilebilir kalır.",
              "Yanlışlıkla iptal ettiyseniz veya fikrinizi değiştirdiyseniz, dönem bitmeden aynı sayfadan aboneliği sürdürebilirsiniz.",
            ],
          },
          {
            id: "switch-plan",
            q: "Clear'dan Deep'e (veya tersine) nasıl geçerim?",
            a: [
              "Hesap, ardından Faturalandırmayı yönet, ardından Aboneliği güncelle. Yeni planı seçin.",
              "Stripe fiyat farkını, mevcut dönemde kalan günlere göre orantılı olarak otomatik hesaplar. Üst plana geçiyorsanız, dönemin geri kalanı için yalnızca fark tahsil edilir. Daha düşük bir plana geçiyorsanız, kalan tutar bir sonraki faturanıza alacak olarak yansıtılır.",
            ],
          },
          {
            id: "invoice",
            q: "Fatura veya makbuzu nasıl indiririm?",
            a: [
              "Hesap, ardından Faturalandırmayı yönet, ardından Fatura geçmişi. Her ödemenin, kaydettiğiniz fatura bilgilerini içeren indirilebilir bir PDF makbuzu vardır.",
              "Faturada farklı bir ad, adres veya vergi numarası gerekiyorsa (örneğin vergi amaçlı bir şirket adı), indirmeden önce aynı sayfada fatura bilgilerinizi güncelleyin. Sonraki makbuz yeni bilgileri kullanır.",
            ],
          },
          {
            id: "portal-error",
            q: "Faturalandırmayı yönet'e tıkladım ama hata aldım. Şimdi ne yapmalıyım?",
            a: [
              "İki yaygın neden var. Birincisi, hesabınızda etkin bir Stripe aboneliği yok. İkincisi, Stripe'ta henüz hesabınız için eksiksiz bir fatura profili olmayabilir.",
              "Kolay bir ilk kontrol: oturumu kapatın, ödeme sırasında kullandığınız e-postayla tekrar oturum açın ve yeniden deneyin. Yine olmazsa hesap e-postanızla bize yazın, ekip bunu bir dakika içinde bizim taraftan düzeltir.",
            ],
          },
          {
            id: "autorenew",
            q: "Aboneliğim otomatik olarak yenilenir mi?",
            a: [
              "Evet. Aylık planlar her ay, yıllık planlar her yıl aynı tarihte yenilenir. Bir sonraki ödeme tarihini hesabınızda ve Stripe portalında görebilirsiniz.",
              "Otomatik yenileme istemiyorsanız, yenileme tarihinden önce istediğiniz zaman iptal edin. İptal hemen gerçekleşmez. Ödemesini yaptığınız dönem boyunca erişiminiz devam eder.",
            ],
          },
          {
            id: "refund",
            q: "İade alabilir miyim?",
            a: [
              "Evet. Satın alma 14 günden kısa süre önce yapıldıysa ve hizmet pek kullanılmadıysa, hesap e-postanızla ve nedenini kısaca açıklayan bir notla bize yazın. Bu iadeler sorunsuz onaylanır.",
              "14 günden fazla geçtiyse ekip her durumu ayrı değerlendirir. Yenilenmeye devam etmemesi için aboneliği iptal edin ve bize e-posta gönderin.",
            ],
          },
          {
            id: "unknown-charge",
            q: "Tanımadığım bir ödeme görüyorum.",
            a: [
              "Ödemeler GADIT veya GADIT.APP adıyla $2.99 (Clear aylık), $4.99 (Deep aylık), $29.99 (Clear yıllık) veya $49.99 (Deep yıllık) tutarında görünür. Eşleşmiyorsa başka bir hizmetten olabilir.",
              "Sizin olmadığından eminseniz henüz bankanız üzerinden itiraz etmeyin. Önce tarih ve tutarla birlikte bize doğrudan yazın. Ekip ödemeyi bulur, ne olduğunu açıklar ve gerekirse iade eder. Banka itirazı gelecekteki ödemeleri zorlaştırabilir, bu yüzden sorunu destek üzerinden çözmek genellikle daha hızlı ve daha güvenlidir.",
            ],
          },
          {
            id: "failed-payment",
            q: "Ödemem başarısız oldu. Ne yapmalıyım?",
            a: [
              "Stripe başarısız ödemeleri sonraki günlerde otomatik olarak birkaç kez yeniden dener. Çoğu sorun, banka blokajı kaldırdığında veya kartta yeterli bakiye olduğunda kendiliğinden çözülür.",
              "Hemen düzeltmek isterseniz Hesap → Faturalandırmayı yönet → Ödeme yöntemi ekle'ye gidin, çalışan bir kart girin ve Varsayılan olarak ayarlayın. Stripe başarısız ödemeyi yeni kartla hemen yeniden dener. Aboneliğiniz zaten Basic'e düştüyse Fiyatlar sayfasından yeniden abone olabilirsiniz ve defteriniz olduğu gibi kalır.",
            ],
          },
          {
            id: "plan-comparison",
            q: "Basic, Clear ve Deep arasındaki fark nedir?",
            a: [
              "Basic (ücretsiz): günde en fazla 20 kelime araması, tüm anlamlar, her anlam için örnekler, deyimler ve kelime kökeni. Temel aramalar için kayıt gerekmez.",
              "Clear ($2.99/ay veya $29.99/yıl): sınırsız arama, çocuklara uygun açıklamalar, kelime başına bir görsel (30/ay), kendi cümlenizi kurup geri bildirim alma, ayrıntılı deyimler ve 30 günlük arama geçmişi.",
              "Deep ($4.99/ay veya $49.99/yıl): Clear'daki her şey, artı alıştırma testleri, akıllı aralıklı tekrar alıştırmalı kişisel defter, benzer kelimeleri ayırt etme ve daha büyük görsel kotası (100/ay).",
            ],
          },
        ],
      },
      {
        id: "account",
        icon: "👤",
        title: "Hesap ve oturum açma",
        items: [
          {
            id: "no-verification-email",
            q: "Doğrulama e-postam gelmedi.",
            a: [
              "Önce spam ve promosyonlar klasörlerine bakın. Gmail ve Outlook, siz birini \"Spam değil\" olarak işaretleyene kadar hesap e-postalarını bazen oraya yönlendirir.",
              "Orada da yoksa kayıt sırasında e-posta adresi yanlış yazılmış olabilir. Tekrar kaydolmayı deneyin ve adresi dikkatle kontrol edin. Google ile kaydolduysanız doğrulama e-postası gerekmez.",
            ],
          },
          {
            id: "forgot-password",
            q: "Şifremi unuttum.",
            a: [
              "Oturum açma penceresini açın ve \"Şifrenizi mi unuttunuz?\"a tıklayın. Gadit için kullandığınız e-postayı girin, bir iki dakika içinde sıfırlama bağlantısı gelir.",
              "E-posta gelmezse spam klasörüne bakın. Yine gelmezse, e-posta ve şifre yerine Google ile kaydolmuş olabilirsiniz. \"Google ile devam et\" düğmesini deneyin.",
            ],
          },
          {
            id: "wrong-credentials",
            q: "Şifremin doğru olduğundan eminim ama \"E-posta veya şifre yanlış\" diyor.",
            a: [
              "Kontrol edilecek üç şey var. Birincisi, Caps Lock. İkincisi, kopyalayıp yapıştırırken sonda kalan boşluk. Üçüncüsü, şifre yerine Google ile kaydolmuş olabilirsiniz (bu durumda \"Google ile devam et\"i kullanın).",
              "Hâlâ olmuyor mu? Aynı pencereden şifreyi sıfırlayın. Böylece temiz bir başlangıç yaparsınız.",
            ],
          },
          {
            id: "google-fails",
            q: "Google ile oturum açma çalışmıyor.",
            a: [
              "En yaygın neden: tarayıcınız gadit.app için üçüncü taraf çerezleri veya açılır pencereleri engelliyor. Adres çubuğundaki izinlerden bunlara izin verin ve tekrar deneyin.",
              "Gizli moddaysanız Google ile oturum açma bilerek kısıtlanmıştır. Normal bir tarayıcı penceresine geçin.",
            ],
          },
          {
            id: "change-email",
            q: "Hesabımdaki e-postayı nasıl değiştiririm?",
            a: [
              "Hesap, e-postanıza tıklayın, E-postayı değiştir. Değişikliğin geçerli olması için yeni adresi onaylamanız gerekir. Aboneliğiniz, geçmişiniz ve defteriniz olduğu gibi aktarılır.",
              "E-posta bir Stripe müşterisine bağlıysa, gelecekteki makbuzların yeni adrese gitmesi için onu Stripe fatura portalında da güncelleyin.",
            ],
          },
          {
            id: "delete-account",
            q: "Hesabımı nasıl silerim?",
            a: [
              "Hesap, sayfanın en altı, Hesabı sil. Bu kalıcıdır. Aboneliğiniz iptal edilir, defteriniz ve geçmişiniz silinir ve e-posta adresi yeni bir kayıt için serbest kalır.",
              "Geçmiş ödemelere ait Stripe kayıtları kalır (muhasebe için saklamamız yasal olarak zorunludur). Başka hiçbir şey kalmaz.",
            ],
          },
          {
            id: "share-account",
            q: "Eşim veya çocuğum hesabımı paylaşabilir mi?",
            a: [
              "Bir hesapta aynı anda tek bir kullanıcı oturum açabilir. Çocuk modu, tek bir Clear veya Deep hesabının hem ebeveyne hem çocuğa hizmet etmesini sağlar: anahtarı açın, tanımlar ayrı oturum açmaya gerek kalmadan çocuklara uygun şekilde görünür.",
              "Ayrı defter ve ilerleme isteyen iki yetişkin için iki hesap oluşturun. Clear, hesap başına aylık $2.99'dur.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "Sanırım yanlışlıkla iki hesabım var. Şimdi ne yapmalıyım?",
            a: [
              "Bu genellikle biri aynı adresle bir kez Google ile, bir kez de e-posta ve şifreyle kaydolduğunda ya da iki farklı e-posta adresiyle iki kez kaydolduğunda olur. Her kayıt, kendi defteri, geçmişi ve abonelik durumu olan ayrı bir Gadit hesabı oluşturur.",
              "İki e-posta adresini (veya Hesap sayfasındaki UID'leri) ve hangisini tutmak istediğinizi bize yazın. Ekip defterleri ve geçmişi seçtiğiniz hesapta birleştirir, ardından diğerini düzgünce kapatır. Hiçbir veri kaybolmaz.",
            ],
          },
        ],
      },
      {
        id: "product",
        icon: "🔍",
        title: "Gadit'i kullanmak",
        items: [
          {
            id: "wrong-definition",
            q: "Tanımın yanlış olduğunu düşünüyorum. Ne yapmalıyım?",
            a: [
              "Her sonuç sayfasının altında küçük bir \"Bildir\" düğmesi vardır. Ona dokunun, bir kategori seçin (tanım, etimoloji, örnek, deyim, çocuk açıklaması vb.) ve kısa bir not yazın. Not doğrudan ekibe gelir ve her bildirim incelenir.",
              "Fazla titiz olmaktan çekinmeyin. Sözlük en hızlı bu tür geri bildirimlerle gelişir.",
            ],
          },
          {
            id: "kids-not-working",
            q: "Çocuk modu açıklamayı değiştirmiyor.",
            a: [
              "Çocuk modu, metni yalnızca kelime için çocuklara uygun açıklama zaten oluşturulmuşsa değiştirir. Az önce aradığınız yepyeni kelimeler için 10 ila 15 saniye bekleyin. Çocuk sürümü ilk seferde anında oluşturulur.",
              "Ayrıca çocuk modu Clear veya Deep gerektirir. Basic kullanıyorsanız anahtar sizi plan yükseltmeye davet eder. Anonim kullanıcılardan kaydolmaları istenir.",
            ],
          },
          {
            id: "voice-fails",
            q: "Sesli arama çalışmıyor.",
            a: [
              "Sesli arama mikrofon izni gerektirir. Çoğu tarayıcı her site için bir kez sorar. Yanlışlıkla Engelle'ye tıkladıysanız bunu elle geri değiştirmeniz gerekir: adres çubuğunda gadit.app'in yanındaki kilit veya bilgi simgesine, ardından Site ayarları'na, ardından Mikrofon'a, ardından İzin ver'e tıklayın.",
              "iOS'ta Safari'de mikrofon erişimi için ayrıca Ayarlar → Safari → Mikrofon anahtarının açık olması gerekir. Ses şu anda bir Clear ve Deep özelliğidir: Basic kullanıcıları yükseltme davetini, oturum açmamış ziyaretçiler ise oturum açma davetini görür.",
            ],
          },
          {
            id: "no-image",
            q: "Kelime için görsel oluşturamıyorum.",
            a: [
              "Görsel oluşturma, aylık kotası olan bir Clear veya Deep özelliğidir. Clear ayda 30 görsel, Deep 100 görsel alır. Kotayı doldurduysanız bir sınır ekranı görürsünüz. Kota her ayın 1'inde sıfırlanır.",
              "Kotanın altındaysanız ve yine hata görüyorsanız bu genellikle geçicidir. 30 saniye sonra tekrar deneyin. Sürekli tekrarlayan hatalar bir yazılım hatasıdır. Lütfen kelime sayfasından bildirin.",
            ],
          },
          {
            id: "save-word",
            q: "Bir kelimeyi defterime nasıl kaydederim?",
            a: [
              "Herhangi bir kelime sonuç sayfasında başlığın yanındaki Deftere kaydet'e dokunun. Defter bir Clear ve Deep özelliğidir: kaydettiğiniz kelimeleri daha sonra gözden geçirebilir, galaksi görünümünde görebilir ve akıllı alıştırma oturumları yapabilirsiniz (Deep).",
              "Kaydettiğiniz ve en az bir kez açtığınız kelimeler yerel önbellekten çevrimdışı kullanılabilir. Çevrimdışı paket ayrıca dilinizdeki en popüler kelimeleri önbelleğe alır, böylece internet olmadan da hazır olursunuz.",
            ],
          },
          {
            id: "offline",
            q: "Çevrimdışı mod nasıl çalışır?",
            a: [
              "Daha önce görüntülediğiniz kelimeler yerel olarak önbelleğe alınır. İnternet olmadan tekrar açtığınızda anında yüklenirler. Tam çevrimdışı paket (dilinizdeki en çok kullanılan kelimeler) defter sayfasından isteğe bağlı olarak indirilir.",
              "Yepyeni bir kelimeyi aramak yine bağlantı gerektirir, çünkü Gadit tanımı sıfırdan oluşturmak zorundadır. Çevrimdışı önbellek, daha önce incelediğiniz kelimeler içindir.",
            ],
          },
          {
            id: "slow",
            q: "Uygulama yavaş geliyor.",
            a: [
              "Bir kelimenin ilk araması en yavaşıdır, çünkü Gadit sonucun tamamını sıfırdan oluşturur: genellikle birkaç saniye, karmaşık kelimelerde bazen daha uzun. Aynı kelimenin sonraki aramaları önbellekten anında gelir.",
              "Her şey yavaş geliyorsa sert yenileme deneyin: Mac'te Cmd+Shift+R, Windows'ta Ctrl+Shift+R. Yavaşlık farklı sayfalarda da sürerse, ekibin bölgenizden sunucularımıza giden ağ rotasını kontrol edebilmesi için ülkenizi ve tarayıcınızı belirterek bize e-posta gönderin.",
            ],
          },
          {
            id: "word-not-found",
            q: "Bir kelime aradım ve sonuç çıkmadı. Ne oluyor?",
            a: [
              "Önce yazımı kontrol edin. Gadit küçük yazım hatalarını çoğu zaman tolere eder, ancak yanlış bir ünlü veya eksik bir harf sonucu bozabilir. Önerilen bir düzeltme çıkarsa onu deneyin.",
              "Bunun dışında, çok nadir veya argo kelimeler güvenilir bir sonuç vermeyebilir. Kelimenin gerçek olduğundan eminseniz, sonuç sayfasındaki (veya hata ekranındaki) Bildir düğmesine tıklayıp bize haber verin. Her bildirim incelenir ve gerçek eksikler sisteme geri beslenir.",
            ],
          },
          {
            id: "change-language",
            q: "Arayüz dilini nasıl değiştiririm?",
            a: [
              "Her sayfanın sağ üstünde küçük bir bayrak simgesi (veya geçerli dilinizin adı) görürsünüz. Ona dokunun ve 30+ dil arasından seçin: İngilizce, Yunanca, İbranice, Arapça, Rusça, İspanyolca, Portekizce, Fransızca, Almanca, Çekçe, Slovakça, İtalyanca, Japonca, Hintçe, Amharca, Zuluca.",
              "Seçiminiz bu cihaza kaydedilir. Her şey yeni dilde yeniden yüklenir: arayüz, menüler, gelecekteki kelime tanımları, örnekler, çocuk açıklamaları, hatta etimoloji. Eski dilde önbelleğe alınmış sonuçlar, o kelimeleri tekrar arayana kadar kalır.",
            ],
          },
        ],
      },
      {
        id: "partner",
        icon: "🤝",
        title: "Ortaklık programı",
        items: [
          {
            id: "join-partner",
            q: "Nasıl Gadit ortağı olurum?",
            a: [
              "Herhangi bir sayfadan /partners adresini açın ve \"Ortak ol\"a tıklayın. Adınız ve e-postanızla kaydolun. Benzersiz yönlendirme bağlantınız ve tıklamaları ve komisyonları takip edeceğiniz panel hemen hazır olur. Onay beklemenize gerek yok.",
              "Katılım ücretsizdir ve herkese açıktır. Ortak olmak için Gadit aboneliğine ihtiyacınız yoktur.",
            ],
          },
          {
            id: "commission-model",
            q: "Komisyonlar nasıl hesaplanır?",
            a: [
              "Standart koşullar, bir müşterinin ilk yılında yaptığı her ödemenin %25'idir. İlk yıldan sonra, müşteri ödemeye devam ettiği sürece her ödemenin %10'unu kazanırsınız.",
              "Bu, aylık ve yıllık planlarda aynı şekilde işler, çünkü komisyon her gerçek ödeme üzerinden hesaplanır. Müşteri iptal ederse komisyonunuz son ödemesiyle birlikte durur.",
              "Ekip belirli ortaklar için farklı oranlar belirleyebilir. Kendi oranlarınız her zaman /partners üzerinden ulaşabileceğiniz ortak panelinizde görünür.",
            ],
          },
          {
            id: "payout",
            q: "Ödememi ne zaman alırım?",
            a: [
              "Aylık olarak, bakiyeniz $50'ı geçtiğinde. Ortak panelinde belirlediğiniz ödeme yöntemini kullanırız (banka havalesi, PayPal vb.). $50 bir üst sınır değil, asgari eşiktir. Çok daha fazlasını kazanabilirsiniz, ödemeyi sadece eşiği geçtiğinizde alırsınız.",
              "Komisyonlar, iade süresini karşılamak için abonelik ödemesinden 30 gün sonra serbest bırakılır. Yani Ocak ayındaki bir abonelik Şubat başında serbest kalır ve bakiyeniz $50'ı geçtiğinde bir sonraki ödemenize eklenir.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "Katıldım ama panelim boş.",
            a: [
              "İstatistikler bağlantınıza yapılan ilk tıklamadan sonra görünür. Boş olması yalnızca henüz kimsenin tıklamadığı anlamına gelir. Bağlantıyı paylaşın. Etkinlik başladığında panel neredeyse gerçek zamanlı güncellenir.",
              "Paylaştıysanız ve biri kaydolduysa ama panel bunu göstermiyorsa, kaydın yaklaşık zamanıyla bize yazın, ekip atfı kontrol eder.",
            ],
          },
          {
            id: "attribution-window",
            q: "Yönlendirme bağlantım bir ziyaretçiyi ne kadar süre takip eder?",
            a: [
              "Altmış gün. Bir ziyaretçi bağlantınıza tıkladığında, sizi yönlendiren olarak tanımlayan bir çerez yerleştiririz. Sonraki 60 gün içinde herhangi bir zamanda kaydolup abone olursa (siteden ayrılıp daha sonra bir Google aramasıyla geri gelse bile), atıf yine size yazılır.",
              "Çerez temizleme: ziyaretçi kaydolmadan önce çerezlerini temizler veya tarayıcı ya da cihaz değiştirirse atıf kaybolabilir. Bunun bir çözümü yok, ancak 60 gün çoğu ortaklık programına kıyasla cömert bir süredir.",
            ],
          },
          {
            id: "missing-commission",
            q: "Biri bağlantım üzerinden kaydoldu ama komisyonu göremiyorum.",
            a: [
              "Çoğu zaman bu bir zamanlama meselesidir: kayıt birkaç dakika içinde panelde görünür, ancak komisyon yalnızca abonelik gerçekten ödendiğinde işlenir (ücretsiz deneme kullanıyorlarsa bu günler sonra olabilir). Deneme süresi bittikten sonra tekrar kontrol edin.",
              "Abonelik ödendiyse ama 48 saat sonra hâlâ komisyonu görmüyorsanız, yaklaşık kayıt zamanı ve biliyorsanız abonenin e-postası veya yaklaşık adıyla bize yazın. Ekip atıf zincirini inceler ve eksikleri elle düzeltir.",
            ],
          },
        ],
      },
      {
        id: "general",
        icon: "❓",
        title: "Genel",
        items: [
          {
            id: "what-is-gadit",
            q: "Gadit nedir?",
            a: [
              "Tek satırlık bir tanım vermekle kalmayıp kelimenin gerçekten oturmasını sağlamak için geliştirilmiş çok dilli bir sözlük. Her kelime tüm anlamları, her anlam için gerçek örnekler, deyimler, etimoloji, isteğe bağlı bir görsel ve (Clear ve Deep ile) çocuklara uygun açıklama, kendi cümlenizi kurup geri bildirim alma ve testlerle açılır.",
              "Şu anda 30+ arayüz dili var. Ekip içinde buna \"bir kelimeyi GAD'lemek\" diyoruz: bir kelimeyi sadece çevirmek değil, sonuna kadar anlamak.",
            ],
          },
          {
            id: "languages",
            q: "Hangi dilleri destekliyorsunuz?",
            a: [
              "Arayüz: İngilizce, Yunanca, İbranice, Arapça, Rusça, İspanyolca, Portekizce, Fransızca, Almanca, Çekçe, Slovakça, İtalyanca, Japonca, Zuluca.",
              "Bu dillerden herhangi birinde bir kelime arayabilir ve tanımı, örnekleri ve diğer her şeyi seçtiğiniz arayüz dilinde alabilirsiniz. İbranice ve Arapça tamamen sağdan sola (RTL) gösterilir ve kendi yazı tiplerini kullanır.",
            ],
          },
          {
            id: "kid-safety",
            q: "Gadit çocuklar için güvenli mi?",
            a: [
              "Gadit, bir ebeveynin çocuğuyla birlikte güvenle kullanması için tasarlandı. Çocuk modu, yetişkin içeriğini üreten aynı motoru basitleştirme yönünde açık talimatlarla kullanarak basit, somut ve yaşa uygun (yaklaşık 5 ila 10 yaş düzeyinde) açıklamalar üretir. Kullanıcıların oluşturduğu içerik çocuklara asla gösterilmez.",
              "Politikalarımız ve dünya genelindeki çocuk gizliliği kurallarıyla uyumlu olarak bağımsız hesap sahipliği 13 yaş ve üzeri içindir. Standart yöntem, ebeveynin çocuğuyla birlikte kullandığı bir ebeveyn hesabıdır ve Çocuk modu tam olarak bunun için yapıldı.",
            ],
          },
          {
            id: "data",
            q: "Verilerim nerede saklanıyor? Onları satıyor musunuz?",
            a: [
              "Hesap, geçmiş, defter ve oluşturulan görseller Firebase'de güvenli şekilde ve depolamada şifrelenmiş olarak saklanır. Verilerinizi kimseye satmıyoruz. Gizlilik Politikası'nda açıklandığı gibi yalnızca Gadit'i çalıştırmak için gerekenleri paylaşıyoruz (depolama, ödemeler, içerik sağlayıcılar).",
              "Defterinizi dışa aktarabilir veya hesabınızı istediğiniz zaman Hesap sayfasından silebilirsiniz.",
            ],
          },
          {
            id: "contact-direct",
            q: "Size doğrudan nasıl ulaşırım?",
            a: [
              "Bu sayfanın altındaki e-posta düğmesini kullanın. Mesajınız doğrudan ekibin gelen kutusuna gider. Her mesaj okunur ve 24 ila 48 saat içinde (çoğu zaman daha hızlı) yanıtlanır.",
              "Destek için e-posta sohbetten daha iyidir: ekibe dikkatle okuyup düşünerek yanıt verme fırsatı tanır. Telefon desteği henüz sunulmuyor.",
            ],
          },
        ],
      },
    ],
  },
  pl: {
    eyebrow: "Centrum pomocy",
    heading: "Szybko znajdź odpowiedź.",
    lede: "Najczęstsze pytania i rozwiązania krok po kroku, pogrupowane według tematów. Jeśli nie widzisz swojego problemu, skontaktuj się z zespołem na dole strony.",
    stillNeedHelpHeading: "Nadal potrzebujesz pomocy?",
    stillNeedHelpBody: "Napisz do nas bezpośrednio. Zespół czyta każdą wiadomość i odpowiada w ciągu dnia lub dwóch.",
    emailCta: "Napisz do nas",
    responseTime: "Zwykle odpowiadamy w ciągu 24 do 48 godzin.",
    categories: [
      {
        id: "billing",
        icon: "💳",
        title: "Płatności i subskrypcja",
        items: [
          {
            id: "change-card",
            q: "Jak zmienić kartę kredytową w subskrypcji?",
            a: [
              "Możesz przejść na nową kartę w niecałą minutę, bez anulowania. Twoja obecna subskrypcja działa dalej, tylko z nowej karty.",
              "1. Zaloguj się na gadit.app i otwórz stronę Konto (w prawym górnym rogu). 2. Kliknij „Zarządzaj płatnościami”. 3. Otworzy się bezpieczna strona Stripe. Kliknij „Dodaj metodę płatności”, wpisz dane nowej karty i oznacz ją jako domyślną. 4. Opcjonalnie usuń starą kartę.",
              "Od następnego okresu rozliczeniowego wszystkie płatności idą z nowej karty. Poprzednia płatność (już pobrana) pozostaje na starej karcie. Zwrot nie jest potrzebny, chyba że wyraźnie go chcesz.",
            ],
          },
          {
            id: "cancel",
            q: "Jak anulować subskrypcję?",
            a: [
              "Samodzielnie, w dowolnym momencie. Zaloguj się, otwórz Konto, kliknij Zarządzaj płatnościami, a potem Anuluj subskrypcję.",
              "Dostęp trwa do końca okresu, za który już zapłacono. Potem konto wraca do planu Basic (bezpłatnego). Twoje zapisane słowa, historia i notatnik pozostają bezpieczne i dostępne.",
              "Jeśli anulujesz przez pomyłkę lub zmienisz zdanie, możesz wznowić subskrypcję na tej samej stronie przed końcem okresu.",
            ],
          },
          {
            id: "switch-plan",
            q: "Jak przejść z Clear na Deep (lub odwrotnie)?",
            a: [
              "Konto, potem Zarządzaj płatnościami, potem Aktualizuj subskrypcję. Wybierz nowy plan.",
              "Stripe automatycznie oblicza różnicę w cenie, proporcjonalnie do dni pozostałych w bieżącym okresie. Przy przejściu na wyższy plan zapłacisz tylko różnicę za resztę okresu. Przy przejściu na niższy plan nadwyżka zostanie zaliczona na poczet następnego rachunku.",
            ],
          },
          {
            id: "invoice",
            q: "Jak pobrać fakturę lub potwierdzenie płatności?",
            a: [
              "Konto, potem Zarządzaj płatnościami, potem Historia faktur. Do każdej płatności jest potwierdzenie w PDF do pobrania, z zapisanymi przez Ciebie danymi rozliczeniowymi.",
              "Jeśli na fakturze potrzebujesz innego imienia i nazwiska, adresu lub numeru identyfikacji podatkowej (na przykład nazwy firmy do celów podatkowych), zaktualizuj dane rozliczeniowe na tej samej stronie przed pobraniem. Następne potwierdzenie będzie zawierać nowe dane.",
            ],
          },
          {
            id: "portal-error",
            q: "Po kliknięciu Zarządzaj płatnościami pojawia się błąd. Co teraz?",
            a: [
              "Są dwie częste przyczyny. Po pierwsze, Twoje konto nie ma aktywnej subskrypcji w Stripe. Po drugie, Stripe może jeszcze nie mieć pełnego profilu rozliczeniowego dla Twojego konta.",
              "Prosty pierwszy krok: wyloguj się, zaloguj ponownie adresem e-mail użytym przy płatności i spróbuj jeszcze raz. Jeśli nadal nie działa, napisz do nas z adresem e-mail konta, a zespół naprawi to po naszej stronie w minutę.",
            ],
          },
          {
            id: "autorenew",
            q: "Czy moja subskrypcja odnawia się automatycznie?",
            a: [
              "Tak. Plany miesięczne odnawiają się co miesiąc, roczne co rok tego samego dnia. Datę następnej płatności widać na Twoim koncie i w portalu Stripe.",
              "Jeśli nie chcesz automatycznego odnawiania, anuluj w dowolnym momencie przed datą odnowienia. Anulowanie nie działa natychmiast. Dostęp zachowujesz do końca opłaconego okresu.",
            ],
          },
          {
            id: "refund",
            q: "Czy mogę otrzymać zwrot pieniędzy?",
            a: [
              "Tak. Jeśli zakup był mniej niż 14 dni temu, a usługa nie była intensywnie używana, napisz do nas z adresem e-mail konta i krótką informacją o powodzie. Takie zwroty zatwierdzamy bez problemów.",
              "Jeśli minęło więcej niż 14 dni, zespół rozpatruje każdy przypadek indywidualnie. Anuluj subskrypcję, żeby się dalej nie odnawiała, i napisz do nas.",
            ],
          },
          {
            id: "unknown-charge",
            q: "Widzę płatność, której nie rozpoznaję.",
            a: [
              "Płatności widnieją jako GADIT lub GADIT.APP na kwotę $2.99 (Clear miesięcznie), $4.99 (Deep miesięcznie), $29.99 (Clear rocznie) lub $49.99 (Deep rocznie). Jeśli kwota się nie zgadza, płatność może pochodzić z innej usługi.",
              "Jeśli masz pewność, że to nie Twoja płatność, nie zgłaszaj jeszcze reklamacji w banku. Najpierw napisz bezpośrednio do nas, podając datę i kwotę. Zespół ją znajdzie, wyjaśni, czego dotyczy, i w razie potrzeby zwróci pieniądze. Reklamacja bankowa może utrudnić przyszłe płatności, więc rozwiązanie sprawy przez wsparcie jest zwykle szybsze i bezpieczniejsze.",
            ],
          },
          {
            id: "failed-payment",
            q: "Moja płatność się nie powiodła. Co robić?",
            a: [
              "Stripe automatycznie ponawia nieudane płatności kilka razy w kolejnych dniach. Większość problemów rozwiązuje się sama, gdy bank zdejmie blokadę lub na karcie pojawią się wystarczające środki.",
              "Jeśli chcesz to naprawić od razu, przejdź do Konto → Zarządzaj płatnościami → Dodaj metodę płatności, wpisz działającą kartę i ustaw ją jako domyślną. Stripe od razu ponowi nieudaną płatność z nowej karty. Jeśli subskrypcja już wróciła do planu Basic, możesz wykupić ją ponownie na stronie Cennik, a Twój notatnik pozostanie nienaruszony.",
            ],
          },
          {
            id: "plan-comparison",
            q: "Czym różnią się Basic, Clear i Deep?",
            a: [
              "Basic (bezpłatny): do 20 wyszukań słów dziennie, wszystkie znaczenia, przykłady do każdego znaczenia, idiomy i pochodzenie słowa. Podstawowe wyszukiwanie nie wymaga rejestracji.",
              "Clear ($2.99/miesiąc lub $29.99/rok): nieograniczone wyszukiwania, wyjaśnienia dla dzieci, obrazek do słowa (30/miesiąc), układanie własnych zdań z informacją zwrotną, szczegóły idiomów i 30 dni historii wyszukiwania.",
              "Deep ($4.99/miesiąc lub $49.99/rok): wszystko z Clear, a do tego quizy ćwiczeniowe, osobisty notatnik z inteligentnymi powtórkami w odstępach, rozróżnianie podobnych słów i większy limit obrazków (100/miesiąc).",
            ],
          },
        ],
      },
      {
        id: "account",
        icon: "👤",
        title: "Konto i logowanie",
        items: [
          {
            id: "no-verification-email",
            q: "Nie dotarł e-mail weryfikacyjny.",
            a: [
              "Najpierw sprawdź foldery Spam i Oferty. Gmail i Outlook czasem przenoszą tam e-maile dotyczące konta, dopóki nie oznaczysz jednego z nich jako „To nie spam”.",
              "Jeśli go tam nie ma, adres mógł zostać błędnie wpisany przy rejestracji. Spróbuj zarejestrować się ponownie i dokładnie sprawdź adres. Jeśli rejestracja była przez Google, e-mail weryfikacyjny nie jest potrzebny.",
            ],
          },
          {
            id: "forgot-password",
            q: "Nie pamiętam hasła.",
            a: [
              "Otwórz okno logowania i kliknij „Nie pamiętasz hasła?”. Wpisz adres e-mail, którego używasz w Gadit, a w ciągu minuty lub dwóch dostaniesz link do zresetowania hasła.",
              "Jeśli e-mail nie dotrze, sprawdź spam. Jeśli nadal go nie ma, możliwe, że rejestracja była przez Google, a nie przez e-mail i hasło. Spróbuj przycisku „Kontynuuj z Google”.",
            ],
          },
          {
            id: "wrong-credentials",
            q: "Hasło na pewno jest poprawne, ale widzę komunikat „Nieprawidłowy e-mail lub hasło”.",
            a: [
              "Sprawdź trzy rzeczy. Po pierwsze, Caps Lock. Po drugie, spację na końcu przy kopiowaniu i wklejaniu. Po trzecie, czy rejestracja nie była przez Google zamiast hasła (wtedy użyj „Kontynuuj z Google”).",
              "Nadal nie działa? Zresetuj hasło w tym samym oknie. To pozwala zacząć od czystej karty.",
            ],
          },
          {
            id: "google-fails",
            q: "Logowanie przez Google nie działa.",
            a: [
              "Najczęstsza przyczyna: przeglądarka blokuje pliki cookie stron trzecich lub wyskakujące okna dla gadit.app. Zezwól na nie w uprawnieniach na pasku adresu i spróbuj ponownie.",
              "W trybie incognito logowanie przez Google jest celowo ograniczone. Przełącz się na zwykłe okno przeglądarki.",
            ],
          },
          {
            id: "change-email",
            q: "Jak zmienić adres e-mail konta?",
            a: [
              "Konto, kliknij swój adres e-mail, Zmień e-mail. Nowy adres trzeba potwierdzić, zanim zmiana zacznie obowiązywać. Subskrypcja, historia i notatnik przechodzą w całości.",
              "Jeśli adres jest powiązany z klientem w Stripe, zaktualizuj go także w portalu płatności Stripe, żeby przyszłe potwierdzenia trafiały na nowy adres.",
            ],
          },
          {
            id: "delete-account",
            q: "Jak usunąć konto?",
            a: [
              "Konto, dół strony, Usuń konto. To nieodwracalne. Subskrypcja zostaje anulowana, notatnik i historia są usuwane, a adres e-mail zwalnia się do ponownej rejestracji.",
              "Zapisy Stripe o wcześniejszych płatnościach pozostają (prawo wymaga od nas przechowywania ich do celów księgowych). Nic więcej nie zostaje.",
            ],
          },
          {
            id: "share-account",
            q: "Czy partner lub dziecko mogą korzystać z mojego konta?",
            a: [
              "Na jednym koncie może być naraz zalogowana jedna osoba. Tryb dla dzieci pozwala, by jedno konto Clear lub Deep służyło rodzicowi i dziecku: wystarczy przełącznik, a definicje wyświetlają się w wersji dla dzieci bez osobnego logowania.",
              "Jeśli dwie dorosłe osoby chcą mieć osobne notatniki i postępy, utwórz dwa konta. Clear kosztuje $2.99 miesięcznie za konto.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "Chyba mam przez pomyłkę dwa konta. Co teraz?",
            a: [
              "Zwykle dzieje się tak, gdy ktoś rejestruje się raz przez Google, a raz przez e-mail i hasło na ten sam adres, albo rejestruje się dwa razy na różne adresy e-mail. Każda rejestracja tworzy osobne konto Gadit z własnym notatnikiem, historią i stanem subskrypcji.",
              "Napisz do nas, podając oba adresy e-mail (lub UID ze strony Konto) i informację, które konto chcesz zachować. Zespół połączy notatniki i historię na wybranym koncie, a potem porządnie zamknie drugie. Żadne dane nie przepadną.",
            ],
          },
        ],
      },
      {
        id: "product",
        icon: "🔍",
        title: "Korzystanie z Gadit",
        items: [
          {
            id: "wrong-definition",
            q: "Wydaje mi się, że definicja jest błędna. Co zrobić?",
            a: [
              "Na dole każdej strony wyników jest mały przycisk „Zgłoś”. Dotknij go, wybierz kategorię (definicja, etymologia, przykład, idiom, wyjaśnienie dla dzieci i tak dalej) i napisz krótką uwagę. Trafia ona prosto do zespołu i każde zgłoszenie jest sprawdzane.",
              "Nie bój się drobiazgowości. Słownik poprawia się dzięki takim uwagom szybciej niż dzięki czemukolwiek innemu.",
            ],
          },
          {
            id: "kids-not-working",
            q: "Tryb dla dzieci nie zmienia wyjaśnienia.",
            a: [
              "Tryb dla dzieci zmienia tekst tylko wtedy, gdy dla danego słowa przygotowano już wyjaśnienie dla dzieci. Przy zupełnie nowych słowach, które właśnie wyszukujesz, odczekaj od 10 do 15 sekund. Wersja dla dzieci powstaje na bieżąco przy pierwszym wyszukaniu.",
              "Poza tym tryb dla dzieci wymaga planu Clear lub Deep. W planie Basic przełącznik zaproponuje przejście na wyższy plan. Użytkownicy anonimowi zobaczą zachętę do rejestracji.",
            ],
          },
          {
            id: "voice-fails",
            q: "Wyszukiwanie głosowe nie działa.",
            a: [
              "Wyszukiwanie głosowe wymaga zgody na dostęp do mikrofonu. Większość przeglądarek pyta o nią raz dla każdej strony. Jeśli przypadkiem kliknięto Blokuj, trzeba to zmienić ręcznie: kliknij ikonę kłódki lub informacji obok gadit.app na pasku adresu, potem Ustawienia witryny, potem Mikrofon, potem Zezwalaj.",
              "W Safari na iOS dostęp do mikrofonu wymaga też włączenia przełącznika w Ustawienia → Safari → Mikrofon. Głos jest obecnie funkcją planów Clear i Deep: użytkownicy Basic widzą propozycję przejścia na wyższy plan, a niezalogowani odwiedzający zachętę do zalogowania.",
            ],
          },
          {
            id: "no-image",
            q: "Nie mogę wygenerować obrazka do słowa.",
            a: [
              "Generowanie obrazków to funkcja planów Clear i Deep z miesięcznym limitem. Clear ma 30 obrazków miesięcznie, Deep 100. Po wykorzystaniu limitu zobaczysz blokadę. Limit odnawia się 1. dnia każdego miesiąca.",
              "Jeśli limit nie jest wykorzystany, a błędy nadal występują, zwykle są chwilowe. Spróbuj ponownie za 30 sekund. Uporczywe błędy to usterka. Zgłoś ją ze strony słowa.",
            ],
          },
          {
            id: "save-word",
            q: "Jak zapisać słowo w notatniku?",
            a: [
              "Na dowolnej stronie wyników dotknij Zapisz w notatniku obok tytułu. Notatnik to funkcja planów Clear i Deep: możesz w nim później przeglądać zapisane słowa, oglądać je w widoku galaktyki i robić inteligentne sesje ćwiczeń (Deep).",
              "Słowa zapisane i otwarte co najmniej raz są dostępne offline z lokalnej pamięci podręcznej. Pakiet offline zapisuje też najpopularniejsze słowa w Twoim języku, dzięki czemu masz je pod ręką nawet bez internetu.",
            ],
          },
          {
            id: "offline",
            q: "Jak działa tryb offline?",
            a: [
              "Słowa, które już zostały wyświetlone, są przechowywane lokalnie w pamięci podręcznej. Otwórz je ponownie bez internetu, a wczytają się natychmiast. Pełny pakiet offline (najpopularniejsze słowa w Twoim języku) pobierasz na żądanie ze strony notatnika.",
              "Wyszukanie zupełnie nowego słowa nadal wymaga połączenia, bo Gadit musi przygotować definicję od zera. Pamięć offline służy do słów, które już zostały przez Ciebie sprawdzone.",
            ],
          },
          {
            id: "slow",
            q: "Aplikacja działa wolno.",
            a: [
              "Pierwsze wyszukanie słowa trwa najdłużej, bo Gadit tworzy pełny wynik od zera: zwykle kilka sekund, czasem dłużej przy złożonych słowach. Kolejne wyszukania tego samego słowa są natychmiastowe, z pamięci podręcznej.",
              "Jeśli wolno działa wszystko, spróbuj twardego odświeżenia: Cmd+Shift+R na Macu, Ctrl+Shift+R na Windows. Jeśli spowolnienie utrzymuje się na różnych stronach, napisz do nas, podając kraj i przeglądarkę, żeby zespół mógł sprawdzić trasę sieciową z Twojego regionu do naszych serwerów.",
            ],
          },
          {
            id: "word-not-found",
            q: "Wyszukane słowo nie daje wyniku. Co się dzieje?",
            a: [
              "Najpierw sprawdź pisownię. Gadit zwykle radzi sobie z drobnymi literówkami, ale zła samogłoska lub brakująca litera mogą go zmylić. Jeśli pojawi się sugerowana poprawka, wypróbuj ją.",
              "Poza tym bardzo rzadkie lub slangowe słowa mogą nie dać pewnego wyniku. Jeśli masz pewność, że słowo istnieje, kliknij przycisk Zgłoś na stronie wyników (lub na ekranie błędu) i daj nam znać. Każde zgłoszenie jest sprawdzane, a prawdziwe braki trafiają z powrotem do systemu.",
            ],
          },
          {
            id: "change-language",
            q: "Jak zmienić język interfejsu?",
            a: [
              "W prawym górnym rogu każdej strony widać małą ikonę flagi (lub nazwę bieżącego języka). Dotknij jej i wybierz spośród ponad 30 języków: angielski, grecki, hebrajski, arabski, rosyjski, hiszpański, portugalski, francuski, niemiecki, czeski, słowacki, włoski, japoński, hindi, amharski, zulu.",
              "Twój wybór zapisuje się na tym urządzeniu. Wszystko wczytuje się w nowym języku: interfejs, menu, przyszłe definicje słów, przykłady, wyjaśnienia dla dzieci, a nawet etymologia. Wyniki zapisane już w pamięci podręcznej w starym języku pozostają, dopóki ponownie nie wyszukasz tych słów.",
            ],
          },
        ],
      },
      {
        id: "partner",
        icon: "🤝",
        title: "Program partnerski",
        items: [
          {
            id: "join-partner",
            q: "Jak zostać partnerem Gadit?",
            a: [
              "Otwórz /partners z dowolnej strony i kliknij „Zostań partnerem”. Zarejestruj się, podając imię i adres e-mail, a Twój unikalny link polecający oraz panel do śledzenia kliknięć i prowizji będą gotowe od razu. Bez czekania na akceptację.",
              "Dołączenie jest bezpłatne i otwarte dla każdego. Aby zostać partnerem, nie potrzebujesz subskrypcji Gadit.",
            ],
          },
          {
            id: "commission-model",
            q: "Jak obliczane są prowizje?",
            a: [
              "Standardowe warunki to 25% każdej płatności klienta w jego pierwszym roku. Po pierwszym roku otrzymujesz 10% każdej płatności tak długo, jak klient płaci.",
              "Działa to tak samo w planach miesięcznych i rocznych, bo prowizja liczona jest od każdej faktycznej płatności. Jeśli klient anuluje, Twoja prowizja kończy się wraz z jego ostatnią płatnością.",
              "Zespół może ustalić inne stawki dla konkretnych partnerów. Twoje stawki zawsze widać w panelu partnera, do którego przejdziesz z /partners.",
            ],
          },
          {
            id: "payout",
            q: "Kiedy dostanę wypłatę?",
            a: [
              "Co miesiąc, gdy Twoje saldo przekroczy $50. Korzystamy z metody wypłaty ustawionej w panelu partnera (przelew bankowy, PayPal i tak dalej). $50 to minimalny próg, a nie limit. Możesz zarobić znacznie więcej, po prostu wypłatę dostajesz po przekroczeniu progu.",
              "Prowizje są zwalniane 30 dni po płatności za subskrypcję, ze względu na okres zwrotów. Prowizja za subskrypcję ze stycznia zostaje więc zwolniona na początku lutego i trafia do najbliższej wypłaty, gdy saldo przekroczy $50.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "Dołączenie się udało, ale panel jest pusty.",
            a: [
              "Statystyki pojawiają się po pierwszym kliknięciu w Twój link. Pusty panel oznacza tylko, że nikt jeszcze nie kliknął. Udostępnij link. Gdy zacznie się aktywność, panel aktualizuje się niemal w czasie rzeczywistym.",
              "Jeśli link został udostępniony i ktoś się zarejestrował, ale panel tego nie pokazuje, napisz do nas z przybliżonym czasem rejestracji, a zespół sprawdzi przypisanie.",
            ],
          },
          {
            id: "attribution-window",
            q: "Jak długo mój link polecający śledzi odwiedzającego?",
            a: [
              "Sześćdziesiąt dni. Gdy odwiedzający kliknie Twój link, zapisujemy plik cookie, który wskazuje Cię jako polecającego. Jeśli zarejestruje się i wykupi subskrypcję w ciągu kolejnych 60 dni (nawet jeśli opuści stronę i wróci później przez wyszukiwarkę Google), przypisanie nadal trafia do Ciebie.",
              "Czyszczenie cookie: jeśli odwiedzający wyczyści pliki cookie lub zmieni przeglądarkę albo urządzenie przed rejestracją, przypisanie może zostać utracone. Nie da się tego obejść, ale 60 dni to hojne okno w porównaniu z większością programów partnerskich.",
            ],
          },
          {
            id: "missing-commission",
            q: "Ktoś zarejestrował się z mojego linku, ale nie widzę prowizji.",
            a: [
              "Najczęściej chodzi o czas: rejestracja pojawia się w panelu w ciągu kilku minut, ale prowizja jest naliczana dopiero po faktycznym opłaceniu subskrypcji (co może nastąpić kilka dni później, jeśli ta osoba korzysta z bezpłatnego okresu próbnego). Sprawdź ponownie po zakończeniu okresu próbnego.",
              "Jeśli subskrypcja została opłacona, a po 48 godzinach nadal nie widzisz prowizji, napisz do nas z przybliżonym czasem rejestracji oraz adresem e-mail lub przybliżonym imieniem subskrybenta, jeśli je znasz. Zespół prześledzi łańcuch przypisania i ręcznie naprawi każdy brak.",
            ],
          },
        ],
      },
      {
        id: "general",
        icon: "❓",
        title: "Ogólne",
        items: [
          {
            id: "what-is-gadit",
            q: "Czym jest Gadit?",
            a: [
              "To wielojęzyczny słownik stworzony po to, żeby słowo naprawdę „zaskoczyło”, a nie tylko dostało jednolinijkową definicję. Każde słowo otwiera się ze wszystkimi znaczeniami, prawdziwymi przykładami do każdego znaczenia, idiomami, etymologią, opcjonalnym obrazkiem oraz (w Clear i Deep) wyjaśnieniem dla dzieci, układaniem własnych zdań z informacją zwrotną i quizami.",
              "Obecnie ponad 30 języków interfejsu. W zespole mówimy na to „zrobić GAD słowu”: zrozumieć słowo do samego końca, a nie tylko je przetłumaczyć.",
            ],
          },
          {
            id: "languages",
            q: "Jakie języki obsługujecie?",
            a: [
              "Interfejs: angielski, grecki, hebrajski, arabski, rosyjski, hiszpański, portugalski, francuski, niemiecki, czeski, słowacki, włoski, japoński, zulu.",
              "Możesz wyszukać słowo w każdym z tych języków i otrzymać definicję, przykłady i całą resztę w wybranym języku interfejsu. Hebrajski i arabski są w pełni wyświetlane od prawej do lewej (RTL) i używają swoich natywnych czcionek.",
            ],
          },
          {
            id: "kid-safety",
            q: "Czy Gadit jest bezpieczny dla dzieci?",
            a: [
              "Gadit powstał z myślą o tym, by rodzic mógł bezpiecznie korzystać z niego razem z dzieckiem. Tryb dla dzieci tworzy wyjaśnienia proste, konkretne i dostosowane do wieku (mniej więcej na poziomie 5 do 10 lat), korzystając z tego samego silnika co treści dla dorosłych, z wyraźnymi instrukcjami upraszczania. Dzieciom nigdy nie są pokazywane treści tworzone przez użytkowników.",
              "Zgodnie z naszymi zasadami i przepisami o ochronie prywatności dzieci na całym świecie samodzielne konto może mieć osoba od 13. roku życia. Standardowy model to konto rodzica, z którego rodzic korzysta razem z dzieckiem, i właśnie do tego służy tryb dla dzieci.",
            ],
          },
          {
            id: "data",
            q: "Gdzie są przechowywane moje dane? Czy je sprzedajecie?",
            a: [
              "Konto, historia, notatnik i wygenerowane obrazki są bezpiecznie przechowywane w Firebase, w postaci zaszyfrowanej. Nie sprzedajemy Twoich danych nikomu. Udostępniamy tylko to, co potrzebne do działania Gadit (przechowywanie, płatności, dostawcy treści), zgodnie z Polityką prywatności.",
              "W dowolnym momencie możesz wyeksportować notatnik lub usunąć konto na stronie Konto.",
            ],
          },
          {
            id: "contact-direct",
            q: "Jak skontaktować się z Wami bezpośrednio?",
            a: [
              "Użyj przycisku e-mail na dole tej strony. Wiadomość trafia prosto do skrzynki zespołu. Każdą wiadomość czytamy i odpowiadamy w ciągu 24 do 48 godzin (często szybciej).",
              "W sprawach wsparcia e-mail sprawdza się lepiej niż czat: zespół może uważnie przeczytać wiadomość i przemyślanie odpowiedzieć. Wsparcia telefonicznego na razie nie oferujemy.",
            ],
          },
        ],
      },
    ],
  },
  fa: {
    eyebrow: "مرکز راهنما",
    heading: "پاسخ را سریع پیدا کنید.",
    lede: "پرسش‌های رایج و راه‌حل‌های گام‌به‌گام، دسته‌بندی‌شده بر اساس موضوع. اگر مشکل‌تان را اینجا نمی‌بینید، از پایین صفحه با تیم در تماس باشید.",
    stillNeedHelpHeading: "هنوز مشکل حل نشده؟",
    stillNeedHelpBody: "مستقیم برای ما بنویسید. تیم همه پیام‌ها را می‌خواند و ظرف یکی دو روز پاسخ می‌دهد.",
    emailCta: "ایمیل به ما",
    responseTime: "پاسخ معمول: ظرف 24 تا 48 ساعت.",
    categories: [
      {
        id: "billing",
        icon: "💳",
        title: "پرداخت و اشتراک",
        items: [
          {
            id: "change-card",
            q: "چطور کارت اعتباری اشتراکم را عوض کنم؟",
            a: [
              "می‌توانید در کمتر از یک دقیقه و بدون لغو اشتراک به کارت جدید بروید. اشتراک فعلی‌تان ادامه پیدا می‌کند، فقط با کارت جدید.",
              "1. در gadit.app وارد شوید و صفحه «حساب» را باز کنید (بالا سمت راست). 2. روی «مدیریت پرداخت» کلیک کنید. 3. یک صفحه امن Stripe باز می‌شود. روی «افزودن روش پرداخت» کلیک کنید، کارت جدید را وارد کنید و آن را به‌عنوان پیش‌فرض علامت بزنید. 4. در صورت تمایل کارت قدیمی را حذف کنید.",
              "از دوره صورتحساب بعدی، همه پرداخت‌ها از کارت جدید انجام می‌شود. پرداخت قبلی (که قبلاً دریافت شده) روی کارت قدیمی می‌ماند. نیازی به بازپرداخت نیست، مگر اینکه مشخصاً آن را بخواهید.",
            ],
          },
          {
            id: "cancel",
            q: "چطور اشتراکم را لغو کنم؟",
            a: [
              "خودتان، هر زمان. وارد شوید، «حساب» را باز کنید، روی «مدیریت پرداخت» و سپس «لغو اشتراک» کلیک کنید.",
              "دسترسی شما تا پایان دوره‌ای که پرداخت کرده‌اید ادامه دارد. بعد از آن حساب به Basic (رایگان) برمی‌گردد. واژه‌های ذخیره‌شده، تاریخچه و دفترچه‌تان امن و در دسترس می‌مانند.",
              "اگر اشتباهی لغو کردید یا نظرتان عوض شد، می‌توانید پیش از پایان دوره از همان صفحه اشتراک را از سر بگیرید.",
            ],
          },
          {
            id: "switch-plan",
            q: "چطور از Clear به Deep (یا برعکس) بروم؟",
            a: [
              "«حساب»، بعد «مدیریت پرداخت»، بعد «به‌روزرسانی اشتراک». طرح جدید را انتخاب کنید.",
              "Stripe تفاوت قیمت را به‌طور خودکار و به نسبت روزهای باقی‌مانده از دوره فعلی حساب می‌کند. اگر به طرح بالاتر می‌روید، فقط مابه‌التفاوت برای بقیه دوره از شما گرفته می‌شود. اگر به طرح پایین‌تر می‌روید، اعتبار باقی‌مانده در صورتحساب بعدی اعمال می‌شود.",
            ],
          },
          {
            id: "invoice",
            q: "چطور فاکتور یا رسید را دانلود کنم؟",
            a: [
              "«حساب»، بعد «مدیریت پرداخت»، بعد «تاریخچه فاکتورها». هر پرداخت یک رسید PDF قابل دانلود با مشخصات صورتحسابی که ذخیره کرده‌اید دارد.",
              "اگر روی فاکتور به نام، نشانی یا شناسه مالیاتی دیگری نیاز دارید (مثلاً نام شرکت برای امور مالیاتی)، پیش از دانلود مشخصات صورتحساب را در همان صفحه به‌روز کنید. رسید بعدی با مشخصات جدید صادر می‌شود.",
            ],
          },
          {
            id: "portal-error",
            q: "روی «مدیریت پرداخت» کلیک کردم ولی خطا گرفتم. حالا چه کنم؟",
            a: [
              "دو علت رایج وجود دارد. اول، حساب شما اشتراک فعال Stripe ندارد. دوم، ممکن است Stripe هنوز پروفایل صورتحساب کاملی برای حساب شما نداشته باشد.",
              "یک بررسی ساده برای شروع: خارج شوید، با ایمیلی که هنگام پرداخت استفاده کردید دوباره وارد شوید و دوباره امتحان کنید. اگر باز هم نشد، با ایمیل حساب‌تان برای ما بنویسید تا تیم در یک دقیقه از طرف ما درستش کند.",
            ],
          },
          {
            id: "autorenew",
            q: "آیا اشتراکم خودکار تمدید می‌شود؟",
            a: [
              "بله. طرح‌های ماهانه هر ماه و طرح‌های سالانه هر سال در همان تاریخ تمدید می‌شوند. تاریخ پرداخت بعدی را در حساب‌تان و در پورتال Stripe می‌بینید.",
              "اگر تمدید خودکار نمی‌خواهید، هر زمان پیش از تاریخ تمدید لغو کنید. لغو فوری نیست. تا پایان دوره‌ای که پرداخت کرده‌اید دسترسی دارید.",
            ],
          },
          {
            id: "refund",
            q: "آیا می‌توانم پولم را پس بگیرم؟",
            a: [
              "بله. اگر خرید کمتر از 14 روز پیش بوده و از سرویس زیاد استفاده نشده، با ایمیل حساب‌تان و توضیح کوتاهی درباره دلیلش برای ما بنویسید. این بازپرداخت‌ها بی‌دردسر تأیید می‌شوند.",
              "اگر بیش از 14 روز گذشته، تیم هر مورد را جداگانه بررسی می‌کند. اشتراک را لغو کنید تا دیگر تمدید نشود و به ما ایمیل بزنید.",
            ],
          },
          {
            id: "unknown-charge",
            q: "پرداختی می‌بینم که آن را نمی‌شناسم.",
            a: [
              "پرداخت‌ها با نام GADIT یا GADIT.APP و مبلغ $2.99 (Clear ماهانه)، $4.99 (Deep ماهانه)، $29.99 (Clear سالانه) یا $49.99 (Deep سالانه) نمایش داده می‌شوند. اگر مطابقت ندارد، ممکن است از سرویس دیگری باشد.",
              "اگر مطمئنید که مال شما نیست، فعلاً از طریق بانک اعتراض نکنید. اول مستقیم با ذکر تاریخ و مبلغ برای ما بنویسید. تیم آن را پیدا می‌کند، توضیح می‌دهد چیست و در صورت نیاز بازپرداخت می‌کند. اعتراض بانکی ممکن است پرداخت‌های آینده را دشوارتر کند، پس حل آن از طریق پشتیبانی معمولاً سریع‌تر و امن‌تر است.",
            ],
          },
          {
            id: "failed-payment",
            q: "پرداختم ناموفق بود. چه کار کنم؟",
            a: [
              "Stripe پرداخت‌های ناموفق را طی روزهای بعد چند بار به‌طور خودکار دوباره امتحان می‌کند. بیشتر این موارد وقتی بانک مسدودی را بردارد یا کارت موجودی کافی داشته باشد، خودبه‌خود حل می‌شوند.",
              "اگر می‌خواهید همین حالا درستش کنید، به «حساب» ← «مدیریت پرداخت» ← «افزودن روش پرداخت» بروید، یک کارت معتبر وارد کنید و آن را پیش‌فرض کنید. Stripe بلافاصله پرداخت ناموفق را با کارت جدید دوباره امتحان می‌کند. اگر اشتراک‌تان قبلاً به Basic برگشته، می‌توانید از صفحه «قیمت‌ها» دوباره مشترک شوید و دفترچه‌تان دست‌نخورده می‌ماند.",
            ],
          },
          {
            id: "plan-comparison",
            q: "تفاوت Basic، Clear و Deep چیست؟",
            a: [
              "Basic (رایگان): تا 20 جستجوی واژه در روز، همه معانی، مثال برای هر معنا، اصطلاحات و ریشه واژه. برای جستجوهای ساده ثبت‌نام لازم نیست.",
              "Clear ($2.99 در ماه یا $29.99 در سال): جستجوی نامحدود، توضیح مناسب کودکان، یک تصویر برای هر واژه (30 در ماه)، ساختن جمله خودتان همراه با بازخورد، جزئیات اصطلاحات و 30 روز تاریخچه جستجو.",
              "Deep ($4.99 در ماه یا $49.99 در سال): همه امکانات Clear، به‌علاوه آزمونک‌های تمرینی، دفترچه شخصی با تمرین هوشمند تکرار فاصله‌دار، تشخیص واژه‌های مشابه و سهمیه تصویر بیشتر (100 در ماه).",
            ],
          },
        ],
      },
      {
        id: "account",
        icon: "👤",
        title: "حساب و ورود",
        items: [
          {
            id: "no-verification-email",
            q: "ایمیل تأیید به دستم نرسید.",
            a: [
              "اول پوشه‌های هرزنامه و تبلیغات را بررسی کنید. Gmail و Outlook گاهی ایمیل‌های حساب را به آنجا می‌فرستند تا وقتی که یکی را «هرزنامه نیست» علامت بزنید.",
              "اگر آنجا هم نبود، شاید نشانی ایمیل هنگام ثبت‌نام اشتباه تایپ شده باشد. دوباره ثبت‌نام کنید و نشانی را با دقت بررسی کنید. اگر با Google ثبت‌نام کرده‌اید، ایمیل تأیید لازم نیست.",
            ],
          },
          {
            id: "forgot-password",
            q: "رمز عبورم را فراموش کرده‌ام.",
            a: [
              "پنجره ورود را باز کنید و روی «رمز عبور را فراموش کرده‌اید؟» کلیک کنید. ایمیلی را که برای Gadit استفاده می‌کنید وارد کنید تا ظرف یکی دو دقیقه لینک بازنشانی برایتان بیاید.",
              "اگر ایمیل نرسید، پوشه هرزنامه را ببینید. اگر باز هم نرسید، شاید به‌جای ایمیل و رمز عبور با Google ثبت‌نام کرده‌اید. دکمه «ادامه با Google» را امتحان کنید.",
            ],
          },
          {
            id: "wrong-credentials",
            q: "مطمئنم رمز عبورم درست است، ولی پیام «ایمیل یا رمز عبور اشتباه است» می‌آید.",
            a: [
              "سه چیز را بررسی کنید. اول، Caps Lock. دوم، فاصله اضافه در انتها هنگام کپی و چسباندن. سوم، شاید به‌جای رمز عبور با Google ثبت‌نام کرده‌اید (در این صورت از «ادامه با Google» استفاده کنید).",
              "هنوز درست نشد؟ از همان پنجره رمز عبور را بازنشانی کنید. این کار همه‌چیز را از نو و تمیز تنظیم می‌کند.",
            ],
          },
          {
            id: "google-fails",
            q: "ورود با Google کار نمی‌کند.",
            a: [
              "رایج‌ترین علت: مرورگرتان کوکی‌های شخص ثالث یا پنجره‌های بازشو را برای gadit.app مسدود کرده است. در مجوزهای نوار نشانی آنها را مجاز کنید و دوباره امتحان کنید.",
              "اگر در حالت ناشناس (incognito) هستید، ورود با Google عمداً محدود شده است. به یک پنجره معمولی مرورگر بروید.",
            ],
          },
          {
            id: "change-email",
            q: "چطور ایمیل حسابم را عوض کنم؟",
            a: [
              "«حساب»، روی ایمیل‌تان کلیک کنید، «تغییر ایمیل». برای اعمال تغییر باید نشانی جدید را تأیید کنید. اشتراک، تاریخچه و دفترچه‌تان همگی منتقل می‌شوند.",
              "اگر ایمیل به یک مشتری Stripe متصل است، آن را در پورتال صورتحساب Stripe هم به‌روز کنید تا رسیدهای بعدی به نشانی جدید بروند.",
            ],
          },
          {
            id: "delete-account",
            q: "چطور حسابم را حذف کنم؟",
            a: [
              "«حساب»، پایین صفحه، «حذف حساب». این کار دائمی است. اشتراک‌تان لغو می‌شود، دفترچه و تاریخچه‌تان پاک می‌شوند و ایمیل برای ثبت‌نام تازه آزاد می‌شود.",
              "سوابق Stripe از پرداخت‌های گذشته باقی می‌ماند (از نظر قانونی موظفیم آنها را برای حسابداری نگه داریم). هیچ چیز دیگری باقی نمی‌ماند.",
            ],
          },
          {
            id: "share-account",
            q: "آیا همسر یا فرزندم می‌تواند از حساب من استفاده کند؟",
            a: [
              "در هر لحظه فقط یک کاربر می‌تواند وارد یک حساب باشد. حالت کودک به یک حساب Clear یا Deep اجازه می‌دهد هم به والد و هم به کودک خدمت کند: کلید را بزنید تا تعریف‌ها بدون ورود جداگانه به زبان کودکانه نمایش داده شوند.",
              "برای دو بزرگسال که هر دو دفترچه و پیشرفت جداگانه می‌خواهند، دو حساب بسازید. Clear برای هر حساب ماهانه $2.99 است.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "فکر می‌کنم اشتباهی دو حساب دارم. حالا چه کنم؟",
            a: [
              "این معمولاً وقتی پیش می‌آید که کسی با یک نشانی، یک بار با Google و یک بار با ایمیل و رمز عبور ثبت‌نام کند، یا دو بار با دو نشانی ایمیل متفاوت ثبت‌نام کند. هر ثبت‌نام یک حساب جداگانه Gadit با دفترچه، تاریخچه و وضعیت اشتراک خودش می‌سازد.",
              "هر دو نشانی ایمیل (یا UIDها از صفحه «حساب») را برای ما بفرستید و بگویید کدام را می‌خواهید نگه دارید. تیم دفترچه‌ها و تاریخچه را در حسابی که انتخاب می‌کنید ادغام می‌کند و سپس حساب دیگر را مرتب می‌بندد. هیچ داده‌ای از دست نمی‌رود.",
            ],
          },
        ],
      },
      {
        id: "product",
        icon: "🔍",
        title: "استفاده از Gadit",
        items: [
          {
            id: "wrong-definition",
            q: "فکر می‌کنم تعریف اشتباه است. چه کنم؟",
            a: [
              "پایین هر صفحه نتیجه یک دکمه کوچک «گزارش» هست. روی آن بزنید، یک دسته را انتخاب کنید (تعریف، ریشه‌شناسی، مثال، اصطلاح، توضیح کودکانه و غیره) و یادداشتی کوتاه بنویسید. یادداشت مستقیم به دست تیم می‌رسد و هر گزارش بررسی می‌شود.",
              "نگران سخت‌گیری زیاد نباشید. فرهنگ لغت با این بازخوردها سریع‌تر از هر چیز دیگری بهتر می‌شود.",
            ],
          },
          {
            id: "kids-not-working",
            q: "حالت کودک توضیح را تغییر نمی‌دهد.",
            a: [
              "حالت کودک فقط وقتی متن را عوض می‌کند که برای آن واژه از قبل توضیح کودکانه ساخته شده باشد. برای واژه‌های کاملاً تازه‌ای که همین الان جستجو کرده‌اید، 10 تا 15 ثانیه صبر کنید. نسخه کودکانه بار اول همان لحظه ساخته می‌شود.",
              "همچنین حالت کودک به Clear یا Deep نیاز دارد. اگر Basic دارید، کلید از شما می‌خواهد طرح را ارتقا دهید. از کاربران ناشناس خواسته می‌شود ثبت‌نام کنند.",
            ],
          },
          {
            id: "voice-fails",
            q: "جستجوی صوتی کار نمی‌کند.",
            a: [
              "جستجوی صوتی به اجازه دسترسی به میکروفون نیاز دارد. بیشتر مرورگرها برای هر سایت یک بار می‌پرسند. اگر اشتباهی روی «مسدود کردن» کلیک کرده‌اید، باید دستی آن را برگردانید: روی نماد قفل یا اطلاعات کنار gadit.app در نوار نشانی کلیک کنید، سپس «تنظیمات سایت»، سپس «میکروفون»، سپس «اجازه دادن».",
              "در Safari روی iOS، دسترسی به میکروفون به روشن کردن کلید در «تنظیمات» ← Safari ← «میکروفون» هم نیاز دارد. جستجوی صوتی فعلاً از امکانات Clear و Deep است: کاربران Basic پیشنهاد ارتقا می‌بینند و بازدیدکنندگانی که وارد نشده‌اند پیشنهاد ورود.",
            ],
          },
          {
            id: "no-image",
            q: "نمی‌توانم برای واژه تصویر بسازم.",
            a: [
              "ساخت تصویر از امکانات Clear یا Deep با سهمیه ماهانه است. Clear ماهی 30 تصویر و Deep ماهی 100 تصویر دارد. اگر سهمیه تمام شده باشد، پیام محدودیت می‌بینید. سهمیه روز اول هر ماه از نو شروع می‌شود.",
              "اگر هنوز سهمیه دارید و باز هم خطا می‌بینید، معمولاً موقتی است. 30 ثانیه بعد دوباره امتحان کنید. خطاهای مداوم یعنی باگ. لطفاً از صفحه واژه گزارش دهید.",
            ],
          },
          {
            id: "save-word",
            q: "چطور واژه‌ای را در دفترچه‌ام ذخیره کنم؟",
            a: [
              "در هر صفحه نتیجه واژه، کنار عنوان روی «ذخیره در دفترچه» بزنید. دفترچه از امکانات Clear و Deep است: می‌توانید بعداً واژه‌های ذخیره‌شده را مرور کنید، آنها را در نمای کهکشانی ببینید و جلسه‌های تمرین هوشمند داشته باشید (Deep).",
              "واژه‌هایی که ذخیره کرده و دست‌کم یک بار باز کرده‌اید، از حافظه محلی به‌صورت آفلاین در دسترس‌اند. بسته آفلاین پرطرفدارترین واژه‌های زبان شما را هم ذخیره می‌کند تا بدون اینترنت هم آماده باشید.",
            ],
          },
          {
            id: "offline",
            q: "حالت آفلاین چطور کار می‌کند؟",
            a: [
              "واژه‌هایی که قبلاً دیده‌اید به‌صورت محلی ذخیره می‌شوند. بدون اینترنت دوباره بازشان کنید و فوراً بارگذاری می‌شوند. بسته کامل آفلاین (پرکاربردترین واژه‌های زبان شما) در صورت درخواست از صفحه دفترچه دانلود می‌شود.",
              "جستجوی یک واژه کاملاً تازه همچنان به اتصال نیاز دارد، چون Gadit باید تعریف را از صفر بسازد. حافظه آفلاین برای واژه‌هایی است که قبلاً بررسی کرده‌اید.",
            ],
          },
          {
            id: "slow",
            q: "برنامه کند به نظر می‌رسد.",
            a: [
              "اولین جستجوی هر واژه کندترین است، چون Gadit نتیجه کامل را از صفر می‌سازد: معمولاً چند ثانیه، و برای واژه‌های پیچیده گاهی بیشتر. جستجوهای بعدی همان واژه فوری‌اند و از حافظه موقت ارائه می‌شوند.",
              "اگر همه‌چیز کند است، یک بازخوانی کامل (hard refresh) امتحان کنید: Cmd+Shift+R در Mac و Ctrl+Shift+R در Windows. اگر کندی در صفحه‌های مختلف ادامه داشت، لطفاً با ذکر کشور و مرورگرتان به ما ایمیل بزنید تا تیم مسیر شبکه از منطقه شما تا سرورهای ما را بررسی کند.",
            ],
          },
          {
            id: "word-not-found",
            q: "واژه‌ای را جستجو کردم و نتیجه‌ای نگرفتم. چه اتفاقی افتاده؟",
            a: [
              "اول املا را بررسی کنید. Gadit بیشتر وقت‌ها غلط‌های تایپی کوچک را تشخیص می‌دهد، اما یک حرف صدادار اشتباه یا حرفی جاافتاده می‌تواند آن را به خطا بیندازد. اگر اصلاح پیشنهادی نمایش داده شد، آن را امتحان کنید.",
              "گذشته از این، واژه‌های بسیار کمیاب یا عامیانه ممکن است نتیجه مطمئنی ندهند. اگر مطمئنید واژه واقعی است، روی دکمه «گزارش» در صفحه نتیجه (یا صفحه خطا) کلیک کنید و به ما خبر دهید. هر گزارش بررسی می‌شود و موارد واقعاً جاافتاده به سیستم برگردانده می‌شوند.",
            ],
          },
          {
            id: "change-language",
            q: "چطور زبان رابط کاربری را عوض کنم؟",
            a: [
              "بالا سمت راست هر صفحه یک نماد کوچک پرچم (یا نام زبان فعلی‌تان) می‌بینید. روی آن بزنید و از میان بیش از 30 زبان انتخاب کنید: انگلیسی، یونانی، عبری، عربی، روسی، اسپانیایی، پرتغالی، فرانسوی، آلمانی، چکی، اسلواکی، ایتالیایی، ژاپنی، هندی، امهری، زولو.",
              "انتخاب شما روی همین دستگاه ذخیره می‌شود. همه‌چیز با زبان جدید دوباره بارگذاری می‌شود: رابط کاربری، منوها، تعریف‌های بعدی واژه‌ها، مثال‌ها، توضیح‌های کودکانه و حتی ریشه‌شناسی. نتایجی که از قبل به زبان قدیمی ذخیره شده‌اند تا وقتی آن واژه‌ها را دوباره جستجو کنید باقی می‌مانند.",
            ],
          },
        ],
      },
      {
        id: "partner",
        icon: "🤝",
        title: "برنامه همکاری",
        items: [
          {
            id: "join-partner",
            q: "چطور همکار Gadit شوم؟",
            a: [
              "از هر صفحه‌ای /partners را باز کنید و روی «همکار شوید» کلیک کنید. با نام و ایمیل‌تان ثبت‌نام کنید تا لینک معرفی اختصاصی‌تان و داشبوردی برای پیگیری کلیک‌ها و پورسانت‌ها فوراً آماده شود. بدون انتظار برای تأیید.",
              "عضویت رایگان و برای همه آزاد است. برای همکار شدن به اشتراک Gadit نیاز ندارید.",
            ],
          },
          {
            id: "commission-model",
            q: "پورسانت‌ها چطور محاسبه می‌شوند؟",
            a: [
              "شرایط استاندارد، 25% از هر پرداختی است که مشتری در سال اول خود انجام می‌دهد. بعد از سال اول، تا وقتی مشتری به پرداخت ادامه دهد، 10% از هر پرداخت را دریافت می‌کنید.",
              "این برای طرح‌های ماهانه و سالانه یکسان است، چون پورسانت بر اساس هر پرداخت واقعی حساب می‌شود. اگر مشتری لغو کند، پورسانت شما با آخرین پرداخت او متوقف می‌شود.",
              "تیم می‌تواند برای همکاران مشخصی نرخ‌های متفاوتی تعیین کند. نرخ‌های خودتان همیشه در داشبورد همکاری‌تان نمایش داده می‌شود که از /partners به آن دسترسی دارید.",
            ],
          },
          {
            id: "payout",
            q: "کی پول دریافت می‌کنم؟",
            a: [
              "ماهانه، وقتی موجودی‌تان از $50 بیشتر شود. از روش پرداختی که در داشبورد همکاری تنظیم کرده‌اید استفاده می‌کنیم (انتقال بانکی، PayPal و غیره). $50 حداقل آستانه است، نه سقف. می‌توانید خیلی بیشتر درآمد داشته باشید، فقط وقتی از آستانه بگذرید پرداخت را دریافت می‌کنید.",
              "پورسانت‌ها 30 روز پس از پرداخت اشتراک آزاد می‌شوند تا مهلت بازپرداخت پوشش داده شود. بنابراین پورسانت اشتراک ژانویه اوایل فوریه آزاد می‌شود و وقتی موجودی‌تان از $50 بگذرد در پرداخت بعدی‌تان قرار می‌گیرد.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "عضو شدم ولی داشبوردم خالی است.",
            a: [
              "آمار پس از اولین کلیک روی لینک شما نمایش داده می‌شود. خالی بودن فقط یعنی هنوز کسی کلیک نکرده. لینک را به اشتراک بگذارید. وقتی فعالیت شروع شود، داشبورد تقریباً به‌صورت لحظه‌ای به‌روز می‌شود.",
              "اگر لینک را به اشتراک گذاشته‌اید و کسی ثبت‌نام کرده ولی داشبورد آن را نشان نمی‌دهد، با زمان تقریبی ثبت‌نام برای ما بنویسید تا تیم انتساب را بررسی کند.",
            ],
          },
          {
            id: "attribution-window",
            q: "لینک معرفی من تا چه مدت یک بازدیدکننده را ردیابی می‌کند؟",
            a: [
              "شصت روز. وقتی بازدیدکننده‌ای روی لینک شما کلیک می‌کند، کوکی‌ای ثبت می‌کنیم که شما را به‌عنوان معرف مشخص می‌کند. اگر او در 60 روز بعد هر زمان ثبت‌نام کند و مشترک شود (حتی اگر سایت را ترک کند و بعداً از طریق جستجوی Google برگردد)، انتساب همچنان به نام شما ثبت می‌شود.",
              "پاک شدن کوکی: اگر بازدیدکننده پیش از ثبت‌نام کوکی‌هایش را پاک کند یا مرورگر یا دستگاهش را عوض کند، ممکن است انتساب از دست برود. راه‌حلی برای این وجود ندارد، اما 60 روز در مقایسه با بیشتر برنامه‌های همکاری مهلت سخاوتمندانه‌ای است.",
            ],
          },
          {
            id: "missing-commission",
            q: "کسی از طریق لینک من ثبت‌نام کرد ولی پورسانت را نمی‌بینم.",
            a: [
              "بیشتر وقت‌ها موضوع زمان است: ثبت‌نام ظرف چند دقیقه در داشبورد نمایش داده می‌شود، اما پورسانت فقط وقتی ثبت می‌شود که اشتراک واقعاً پرداخت شود (که اگر از دوره آزمایشی رایگان استفاده کنند، ممکن است چند روز بعد باشد). پس از پایان دوره آزمایشی دوباره سر بزنید.",
              "اگر اشتراک پرداخت شده ولی بعد از 48 ساعت هنوز پورسانت را نمی‌بینید، با زمان تقریبی ثبت‌نام و، اگر می‌دانید، ایمیل یا نام تقریبی مشترک برای ما بنویسید. تیم زنجیره انتساب را بررسی می‌کند و هر کمبودی را دستی اصلاح می‌کند.",
            ],
          },
        ],
      },
      {
        id: "general",
        icon: "❓",
        title: "عمومی",
        items: [
          {
            id: "what-is-gadit",
            q: "Gadit چیست؟",
            a: [
              "یک فرهنگ لغت چندزبانه که ساخته شده تا واژه واقعاً جا بیفتد، نه اینکه فقط یک تعریف یک‌خطی بدهد. هر واژه با همه معانی‌اش، مثال‌های واقعی برای هر معنا، اصطلاحات، ریشه‌شناسی، یک تصویر اختیاری و (با Clear و Deep) توضیح کودکانه، ساختن جمله خودتان همراه با بازخورد و آزمونک‌ها باز می‌شود.",
              "در حال حاضر بیش از 30 زبان رابط کاربری. در تیم به این کار می‌گوییم «GAD کردن یک واژه»: فهمیدن یک واژه تا انتها، نه فقط ترجمه کردنش.",
            ],
          },
          {
            id: "languages",
            q: "از چه زبان‌هایی پشتیبانی می‌کنید؟",
            a: [
              "رابط کاربری: انگلیسی، یونانی، عبری، عربی، روسی، اسپانیایی، پرتغالی، فرانسوی، آلمانی، چکی، اسلواکی، ایتالیایی، ژاپنی، زولو.",
              "می‌توانید یک واژه را به هر یک از این زبان‌ها جستجو کنید و تعریف، مثال‌ها و همه‌چیز دیگر را به زبان رابطی که انتخاب کرده‌اید دریافت کنید. عبری و عربی کاملاً راست‌به‌چپ (RTL) هستند و از قلم‌های بومی خودشان استفاده می‌کنند.",
            ],
          },
          {
            id: "kid-safety",
            q: "آیا Gadit برای کودکان امن است؟",
            a: [
              "Gadit طوری طراحی شده که والدین بتوانند با خیال راحت همراه کودک از آن استفاده کنند. حالت کودک توضیح‌هایی ساده، ملموس و مناسب سن (حدود سطح 5 تا 10 سالگی) تولید می‌کند و از همان موتوری استفاده می‌کند که محتوای بزرگسالان را می‌سازد، با دستورالعمل‌های صریح برای ساده‌سازی. محتوای تولیدشده توسط کاربران هرگز به کودکان نشان داده نمی‌شود.",
              "مطابق با سیاست‌های ما و قوانین حریم خصوصی کودکان در سراسر جهان، داشتن حساب مستقل از 13 سالگی به بالا ممکن است. الگوی استاندارد، حساب والد است که والد همراه با فرزندش از آن استفاده می‌کند و حالت کودک دقیقاً برای همین ساخته شده است.",
            ],
          },
          {
            id: "data",
            q: "داده‌هایم کجا ذخیره می‌شوند؟ آنها را می‌فروشید؟",
            a: [
              "حساب، تاریخچه، دفترچه و تصاویر ساخته‌شده به‌طور امن و به‌صورت رمزگذاری‌شده در Firebase ذخیره می‌شوند. ما داده‌های شما را به هیچ‌کس نمی‌فروشیم. فقط آنچه برای اجرای Gadit لازم است (ذخیره‌سازی، پرداخت‌ها، ارائه‌دهندگان محتوا) را به اشتراک می‌گذاریم، همان‌طور که در سیاست حریم خصوصی آمده است.",
              "هر زمان می‌توانید از دفترچه‌تان خروجی بگیرید یا حساب‌تان را از صفحه «حساب» حذف کنید.",
            ],
          },
          {
            id: "contact-direct",
            q: "چطور مستقیم با شما تماس بگیرم؟",
            a: [
              "از دکمه ایمیل پایین همین صفحه استفاده کنید. پیام مستقیم به صندوق تیم می‌رود. همه پیام‌ها خوانده می‌شوند و ظرف 24 تا 48 ساعت (اغلب زودتر) پاسخ داده می‌شوند.",
              "برای پشتیبانی، ایمیل از چت بهتر است: به تیم فرصت می‌دهد با دقت بخواند و سنجیده پاسخ دهد. پشتیبانی تلفنی هنوز ارائه نمی‌شود.",
            ],
          },
        ],
      },
    ],
  },
  id: {
    eyebrow: "Pusat Bantuan",
    heading: "Temukan jawaban dengan cepat.",
    lede: "Pertanyaan umum dan solusi langkah demi langkah, dikelompokkan per topik. Jika masalah Anda tidak ada di sini, hubungi tim di bagian bawah halaman.",
    stillNeedHelpHeading: "Masih buntu?",
    stillNeedHelpBody: "Tulis langsung kepada kami. Setiap pesan dibaca oleh tim dan dibalas dalam satu atau dua hari.",
    emailCta: "Kirim email ke kami",
    responseTime: "Biasanya kami membalas dalam 24 hingga 48 jam.",
    categories: [
      {
        id: "billing",
        icon: "💳",
        title: "Tagihan & langganan",
        items: [
          {
            id: "change-card",
            q: "Bagaimana cara mengganti kartu kredit untuk langganan saya?",
            a: [
              "Anda bisa beralih ke kartu baru dalam waktu kurang dari satu menit tanpa membatalkan. Langganan Anda saat ini tetap berjalan, hanya dengan kartu baru.",
              "1. Masuk di gadit.app dan buka halaman Akun (kanan atas). 2. Klik \"Kelola tagihan\". 3. Halaman Stripe yang aman akan terbuka. Klik \"Tambah metode pembayaran\", masukkan kartu baru, dan jadikan sebagai Default. 4. Jika mau, hapus kartu lama.",
              "Mulai siklus tagihan berikutnya, semua tagihan dikenakan ke kartu baru. Tagihan sebelumnya (yang sudah ditarik) tetap pada kartu lama. Tidak perlu pengembalian dana kecuali Anda memang menginginkannya.",
            ],
          },
          {
            id: "cancel",
            q: "Bagaimana cara membatalkan langganan saya?",
            a: [
              "Bisa sendiri, kapan saja. Masuk, buka Akun, klik Kelola tagihan, lalu Batalkan langganan.",
              "Akses Anda tetap berlaku hingga akhir periode yang sudah dibayar. Setelah itu akun kembali ke Basic (gratis). Kata tersimpan, riwayat, dan buku catatan Anda tetap aman dan bisa diakses.",
              "Jika Anda membatalkan secara tidak sengaja atau berubah pikiran, Anda bisa melanjutkan langganan dari halaman yang sama sebelum periodenya berakhir.",
            ],
          },
          {
            id: "switch-plan",
            q: "Bagaimana cara beralih dari Clear ke Deep (atau sebaliknya)?",
            a: [
              "Akun, lalu Kelola tagihan, lalu Perbarui langganan. Pilih paket baru.",
              "Stripe menghitung selisih harga secara otomatis, secara proporsional sesuai sisa hari dalam periode saat ini. Jika Anda meningkatkan paket, Anda hanya dikenai selisihnya untuk sisa periode. Jika Anda beralih ke paket yang lebih rendah, kreditnya berlaku untuk tagihan berikutnya.",
            ],
          },
          {
            id: "invoice",
            q: "Bagaimana cara mengunduh faktur atau tanda terima?",
            a: [
              "Akun, lalu Kelola tagihan, lalu Riwayat faktur. Setiap tagihan memiliki tanda terima PDF yang bisa diunduh, berisi detail tagihan yang Anda simpan.",
              "Jika Anda memerlukan nama, alamat, atau nomor identitas pajak yang berbeda pada faktur (misalnya nama perusahaan untuk keperluan pajak), perbarui detail tagihan di halaman yang sama sebelum mengunduh. Tanda terima berikutnya akan memakai detail baru.",
            ],
          },
          {
            id: "portal-error",
            q: "Saya mengklik Kelola tagihan tetapi muncul error. Lalu bagaimana?",
            a: [
              "Ada dua penyebab umum. Pertama, akun Anda tidak memiliki langganan Stripe yang aktif. Kedua, Stripe mungkin belum memiliki profil tagihan lengkap untuk akun Anda.",
              "Pemeriksaan awal yang mudah: keluar, masuk kembali dengan email yang Anda gunakan saat checkout, lalu coba lagi. Jika masih gagal, hubungi kami dengan email akun Anda dan tim akan memperbaikinya dari sisi kami dalam satu menit.",
            ],
          },
          {
            id: "autorenew",
            q: "Apakah langganan saya diperpanjang otomatis?",
            a: [
              "Ya. Paket bulanan diperpanjang setiap bulan, paket tahunan setiap tahun pada tanggal yang sama. Anda bisa melihat tanggal tagihan berikutnya di akun Anda dan di portal Stripe.",
              "Jika tidak ingin perpanjangan otomatis, batalkan kapan saja sebelum tanggal perpanjangan. Pembatalan tidak berlaku seketika. Anda tetap memiliki akses selama periode yang sudah dibayar.",
            ],
          },
          {
            id: "refund",
            q: "Bisakah saya mendapatkan pengembalian dana?",
            a: [
              "Bisa. Jika pembelian dilakukan kurang dari 14 hari yang lalu dan layanan belum banyak digunakan, tulis kepada kami dengan email akun Anda dan catatan singkat tentang alasannya. Pengembalian dana seperti ini disetujui tanpa dipersulit.",
              "Jika sudah lebih dari 14 hari, tim menanganinya kasus per kasus. Batalkan langganan agar tidak terus diperpanjang, lalu kirim email kepada kami.",
            ],
          },
          {
            id: "unknown-charge",
            q: "Saya melihat tagihan yang tidak saya kenali.",
            a: [
              "Tagihan muncul sebagai GADIT atau GADIT.APP sebesar $2.99 (Clear bulanan), $4.99 (Deep bulanan), $29.99 (Clear tahunan), atau $49.99 (Deep tahunan). Jika tidak cocok, mungkin itu dari layanan lain.",
              "Jika Anda yakin itu bukan tagihan Anda, jangan ajukan sanggahan lewat bank dulu. Tulis langsung kepada kami terlebih dahulu dengan tanggal dan jumlahnya. Tim akan menemukannya, menjelaskan tagihan apa itu, dan mengembalikan dana bila perlu. Sanggahan bank bisa mempersulit tagihan di masa depan, jadi menyelesaikannya melalui dukungan biasanya lebih cepat dan lebih aman.",
            ],
          },
          {
            id: "failed-payment",
            q: "Pembayaran saya gagal. Apa yang harus saya lakukan?",
            a: [
              "Stripe otomatis mencoba ulang pembayaran yang gagal beberapa kali selama beberapa hari berikutnya. Sebagian besar kegagalan teratasi sendiri setelah bank melepas penahanan atau saldo kartu mencukupi.",
              "Jika ingin segera memperbaikinya, buka Akun → Kelola tagihan → Tambah metode pembayaran, masukkan kartu yang berfungsi, dan jadikan Default. Stripe akan langsung mencoba ulang tagihan yang gagal dengan kartu baru. Jika langganan Anda sudah turun ke Basic, Anda bisa berlangganan lagi dari halaman Harga dan buku catatan Anda tetap utuh.",
            ],
          },
          {
            id: "plan-comparison",
            q: "Apa perbedaan Basic, Clear, dan Deep?",
            a: [
              "Basic (gratis): hingga 20 pencarian kata per hari, semua makna, contoh untuk setiap makna, idiom, dan asal kata. Tidak perlu mendaftar untuk pencarian dasar.",
              "Clear ($2.99/bulan atau $29.99/tahun): pencarian tanpa batas, penjelasan ramah anak, satu gambar per kata (30/bulan), menyusun kalimat sendiri dengan umpan balik, detail idiom, dan riwayat pencarian 30 hari.",
              "Deep ($4.99/bulan atau $49.99/tahun): semua fitur Clear, ditambah kuis latihan, buku catatan pribadi dengan latihan pengulangan berjarak yang cerdas, membedakan kata-kata yang mirip, dan kuota gambar lebih besar (100/bulan).",
            ],
          },
        ],
      },
      {
        id: "account",
        icon: "👤",
        title: "Akun & masuk",
        items: [
          {
            id: "no-verification-email",
            q: "Saya tidak menerima email verifikasi.",
            a: [
              "Periksa folder spam dan promosi terlebih dahulu. Gmail dan Outlook terkadang mengarahkan email akun ke sana sampai Anda menandai salah satunya sebagai \"Bukan spam\".",
              "Jika tidak ada di sana, mungkin alamat email salah ketik saat mendaftar. Coba daftar lagi dan periksa alamatnya dengan teliti. Jika Anda mendaftar dengan Google, email verifikasi tidak diperlukan.",
            ],
          },
          {
            id: "forgot-password",
            q: "Saya lupa kata sandi.",
            a: [
              "Buka dialog masuk dan klik \"Lupa kata sandi?\". Masukkan email yang Anda gunakan untuk Gadit dan Anda akan menerima tautan reset dalam satu atau dua menit.",
              "Jika email tidak masuk, periksa spam. Jika tetap tidak ada, mungkin Anda mendaftar dengan Google, bukan dengan email dan kata sandi. Coba tombol \"Lanjutkan dengan Google\".",
            ],
          },
          {
            id: "wrong-credentials",
            q: "Saya yakin kata sandi saya benar tetapi muncul \"Email atau kata sandi salah\".",
            a: [
              "Ada tiga hal yang perlu diperiksa. Pertama, Caps Lock. Kedua, spasi di akhir saat menyalin dan menempel. Ketiga, Anda mendaftar dengan Google, bukan dengan kata sandi (gunakan \"Lanjutkan dengan Google\" sebagai gantinya).",
              "Masih buntu? Reset kata sandi dari dialog yang sama. Dengan begitu semuanya kembali bersih.",
            ],
          },
          {
            id: "google-fails",
            q: "Masuk dengan Google tidak berhasil.",
            a: [
              "Penyebab paling umum: browser Anda memblokir cookie pihak ketiga atau pop-up untuk gadit.app. Izinkan keduanya di pengaturan izin pada bilah alamat, lalu coba lagi.",
              "Jika Anda dalam mode penyamaran (incognito), masuk dengan Google memang sengaja dibatasi. Beralihlah ke jendela browser biasa.",
            ],
          },
          {
            id: "change-email",
            q: "Bagaimana cara mengganti email di akun saya?",
            a: [
              "Akun, klik email Anda, Ganti email. Anda perlu mengonfirmasi alamat baru agar perubahan berlaku. Langganan, riwayat, dan buku catatan Anda semuanya ikut pindah.",
              "Jika email terhubung dengan pelanggan Stripe, perbarui juga di portal tagihan Stripe agar tanda terima selanjutnya dikirim ke alamat baru.",
            ],
          },
          {
            id: "delete-account",
            q: "Bagaimana cara menghapus akun saya?",
            a: [
              "Akun, bagian bawah halaman, Hapus akun. Ini permanen. Langganan Anda dibatalkan, buku catatan dan riwayat Anda dihapus, dan email tersebut bisa dipakai lagi untuk pendaftaran baru.",
              "Catatan Stripe atas tagihan sebelumnya tetap ada (kami wajib menyimpannya secara hukum untuk keperluan akuntansi). Tidak ada hal lain yang tersisa.",
            ],
          },
          {
            id: "share-account",
            q: "Bisakah pasangan atau anak saya berbagi akun saya?",
            a: [
              "Satu akun hanya untuk satu pengguna yang masuk pada satu waktu. Mode anak memungkinkan satu akun Clear atau Deep melayani orang tua dan anak: aktifkan tombolnya dan definisi tampil ramah anak tanpa perlu login terpisah.",
              "Untuk dua orang dewasa yang sama-sama ingin buku catatan dan kemajuan terpisah, buat dua akun. Clear seharga $2.99 per bulan per akun.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "Sepertinya saya tidak sengaja punya dua akun. Lalu bagaimana?",
            a: [
              "Ini biasanya terjadi ketika seseorang mendaftar sekali dengan Google dan sekali dengan email dan kata sandi menggunakan alamat yang sama, atau mendaftar dua kali dengan alamat email yang berbeda. Setiap pendaftaran membuat akun Gadit terpisah dengan buku catatan, riwayat, dan status langganannya sendiri.",
              "Tulis kepada kami dengan kedua alamat email (atau UID dari halaman Akun) dan akun mana yang ingin Anda pertahankan. Tim akan menggabungkan buku catatan dan riwayat ke akun pilihan Anda, lalu menutup akun lainnya dengan rapi. Tidak ada data yang hilang.",
            ],
          },
        ],
      },
      {
        id: "product",
        icon: "🔍",
        title: "Menggunakan Gadit",
        items: [
          {
            id: "wrong-definition",
            q: "Menurut saya definisinya salah. Apa yang harus saya lakukan?",
            a: [
              "Setiap halaman hasil memiliki tombol kecil \"Laporkan\" di bagian bawah. Ketuk tombol itu, pilih kategori (definisi, etimologi, contoh, idiom, penjelasan anak, dan sebagainya) dan tulis catatan singkat. Laporan langsung masuk ke tim dan setiap laporan ditinjau.",
              "Jangan khawatir terlalu teliti. Kamus ini berkembang lebih cepat dari masukan seperti ini dibanding dari hal lain apa pun.",
            ],
          },
          {
            id: "kids-not-working",
            q: "Mode anak tidak mengubah penjelasan.",
            a: [
              "Mode anak hanya mengubah teks jika kata tersebut sudah memiliki penjelasan ramah anak. Untuk kata yang benar-benar baru dan baru saja Anda cari, tunggu 10 hingga 15 detik. Versi ramah anak dibuat secara langsung saat pertama kali dicari.",
              "Selain itu, mode anak memerlukan Clear atau Deep. Jika Anda memakai Basic, tombolnya akan meminta Anda meningkatkan paket. Pengguna anonim akan diminta mendaftar.",
            ],
          },
          {
            id: "voice-fails",
            q: "Pencarian suara tidak berfungsi.",
            a: [
              "Pencarian suara memerlukan izin mikrofon. Sebagian besar browser menanyakannya sekali per situs. Jika Anda tidak sengaja mengklik Blokir, Anda perlu mengubahnya kembali secara manual: klik ikon gembok atau info di samping gadit.app pada bilah alamat, lalu Setelan situs, lalu Mikrofon, lalu Izinkan.",
              "Di Safari iOS, akses mikrofon juga memerlukan tombol di Pengaturan → Safari → Mikrofon. Fitur suara saat ini tersedia di Clear dan Deep: pengguna Basic melihat ajakan untuk meningkatkan paket, pengunjung yang belum masuk melihat ajakan untuk masuk.",
            ],
          },
          {
            id: "no-image",
            q: "Saya tidak bisa membuat gambar untuk kata tersebut.",
            a: [
              "Pembuatan gambar adalah fitur Clear atau Deep dengan kuota bulanan. Clear mendapat 30 gambar per bulan, Deep 100. Jika kuota sudah habis, Anda akan melihat pemberitahuan batas. Kuota diatur ulang setiap tanggal 1 setiap bulan.",
              "Jika kuota belum habis dan masih gagal, biasanya itu sementara. Coba lagi dalam 30 detik. Kegagalan yang terus-menerus adalah bug. Silakan laporkan dari halaman kata.",
            ],
          },
          {
            id: "save-word",
            q: "Bagaimana cara menyimpan kata ke buku catatan saya?",
            a: [
              "Di halaman hasil kata mana pun, ketuk Simpan ke buku catatan di dekat judul. Buku catatan adalah fitur Clear dan Deep, tempat Anda bisa meninjau kata tersimpan nanti, melihatnya dalam tampilan galaksi, dan menjalankan sesi latihan cerdas (Deep).",
              "Kata yang sudah Anda simpan dan buka setidaknya sekali tersedia secara offline dari cache lokal. Paket offline juga menyimpan kata-kata paling populer dalam bahasa Anda, jadi Anda siap meski tanpa internet.",
            ],
          },
          {
            id: "offline",
            q: "Bagaimana cara kerja mode offline?",
            a: [
              "Kata yang sudah pernah Anda lihat disimpan di cache lokal. Buka lagi tanpa internet dan kata itu langsung termuat. Paket offline lengkap (kata-kata teratas dalam bahasa Anda) bisa diunduh sesuai permintaan dari halaman buku catatan.",
              "Mencari kata yang benar-benar baru tetap memerlukan koneksi, karena Gadit harus menyusun definisinya dari awal. Cache offline ditujukan untuk kata-kata yang sudah Anda jelajahi.",
            ],
          },
          {
            id: "slow",
            q: "Aplikasinya terasa lambat.",
            a: [
              "Pencarian pertama sebuah kata adalah yang paling lambat karena Gadit menyusun hasil lengkapnya dari awal: biasanya beberapa detik, kadang lebih lama untuk kata yang rumit. Pencarian berikutnya untuk kata yang sama langsung tampil dari cache.",
              "Jika semuanya terasa lambat, coba muat ulang paksa: Cmd+Shift+R di Mac, Ctrl+Shift+R di Windows. Jika lambatnya terus terjadi di berbagai halaman, kirim email kepada kami dengan negara dan browser Anda agar tim bisa memeriksa jalur jaringan ke server kami dari wilayah Anda.",
            ],
          },
          {
            id: "word-not-found",
            q: "Saya mencari sebuah kata dan tidak mendapat hasil. Ada apa?",
            a: [
              "Pertama, periksa ejaannya. Gadit biasanya bisa menangani salah ketik kecil, tetapi huruf vokal yang salah atau huruf yang hilang bisa membuatnya meleset. Coba koreksi yang disarankan jika muncul.",
              "Selain itu, kata yang sangat langka atau slang mungkin tidak memberikan hasil yang meyakinkan. Jika Anda yakin kata itu ada, klik tombol Laporkan di halaman hasil (atau di layar error) dan beri tahu kami. Setiap laporan ditinjau dan kata yang benar-benar terlewat dimasukkan kembali ke sistem.",
            ],
          },
          {
            id: "change-language",
            q: "Bagaimana cara mengganti bahasa antarmuka?",
            a: [
              "Di kanan atas setiap halaman, Anda akan melihat ikon bendera kecil (atau nama bahasa Anda saat ini). Ketuk dan pilih dari 30+ bahasa: Inggris, Yunani, Ibrani, Arab, Rusia, Spanyol, Portugis, Prancis, Jerman, Ceko, Slovakia, Italia, Jepang, Hindi, Amhar, Zulu.",
              "Pilihan Anda disimpan di perangkat ini. Semuanya dimuat ulang dalam bahasa baru: antarmuka, menu, definisi kata berikutnya, contoh, penjelasan anak, bahkan etimologi. Hasil yang sudah tersimpan di cache dalam bahasa lama tetap ada sampai Anda mencari kata-kata itu lagi.",
            ],
          },
        ],
      },
      {
        id: "partner",
        icon: "🤝",
        title: "Program mitra",
        items: [
          {
            id: "join-partner",
            q: "Bagaimana cara menjadi mitra Gadit?",
            a: [
              "Buka /partners dari halaman mana pun dan klik \"Jadi mitra\". Daftar dengan nama dan email Anda, dan tautan rujukan unik Anda serta dasbor untuk memantau klik dan komisi langsung siap. Tidak perlu menunggu persetujuan.",
              "Bergabung itu gratis dan terbuka untuk siapa saja. Anda tidak memerlukan langganan Gadit untuk menjadi mitra.",
            ],
          },
          {
            id: "commission-model",
            q: "Bagaimana komisi dihitung?",
            a: [
              "Ketentuan standarnya adalah 25% dari setiap pembayaran yang dilakukan pelanggan pada tahun pertamanya. Setelah tahun pertama itu, Anda mendapat 10% dari setiap pembayaran selama pelanggan terus membayar.",
              "Ini berlaku sama untuk paket bulanan dan tahunan, karena komisi dihitung dari setiap pembayaran yang benar-benar terjadi. Jika pelanggan membatalkan, komisi Anda berhenti pada pembayaran terakhirnya.",
              "Tim dapat menetapkan tarif berbeda untuk mitra tertentu. Tarif Anda sendiri selalu tampil di dasbor mitra, yang bisa Anda buka dari /partners.",
            ],
          },
          {
            id: "payout",
            q: "Kapan saya dibayar?",
            a: [
              "Setiap bulan, setelah saldo Anda melewati $50. Kami menggunakan metode pembayaran yang Anda atur di dasbor mitra (transfer bank, PayPal, dan sebagainya). $50 adalah ambang minimum, bukan batas atas. Anda bisa menghasilkan jauh lebih banyak, Anda hanya menerima pembayaran saat melewati ambang tersebut.",
              "Komisi dicairkan 30 hari setelah pembayaran langganan, untuk memberi ruang bagi masa pengembalian dana. Jadi langganan bulan Januari dicairkan awal Februari dan masuk ke pembayaran Anda berikutnya setelah saldo melewati $50.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "Saya sudah bergabung tetapi dasbor saya kosong.",
            a: [
              "Statistik muncul setelah klik pertama pada tautan Anda. Kosong hanya berarti belum ada yang mengklik. Bagikan tautannya. Dasbor diperbarui hampir secara real time begitu aktivitas dimulai.",
              "Jika Anda sudah membagikannya dan seseorang sudah mendaftar tetapi dasbor belum menunjukkannya, tulis kepada kami dengan perkiraan waktu pendaftaran dan tim akan memeriksa atribusinya.",
            ],
          },
          {
            id: "attribution-window",
            q: "Berapa lama tautan rujukan saya terus melacak pengunjung?",
            a: [
              "Enam puluh hari. Saat pengunjung mengklik tautan Anda, kami memasang cookie yang mengidentifikasi Anda sebagai perujuk. Jika mereka mendaftar dan berlangganan kapan saja dalam 60 hari berikutnya (bahkan jika mereka meninggalkan situs dan kembali lagi nanti lewat pencarian Google), atribusinya tetap dikreditkan kepada Anda.",
              "Penghapusan cookie: jika pengunjung menghapus cookie atau berganti browser/perangkat sebelum mendaftar, atribusi bisa hilang. Tidak ada cara mengatasinya, tetapi 60 hari adalah jangka waktu yang longgar dibandingkan sebagian besar program mitra.",
            ],
          },
          {
            id: "missing-commission",
            q: "Seseorang mendaftar lewat tautan saya tetapi saya tidak melihat komisinya.",
            a: [
              "Paling sering ini soal waktu: pendaftaran muncul di dasbor dalam hitungan menit, tetapi komisi baru dicatat setelah langganan benar-benar dibayar (yang bisa beberapa hari kemudian jika mereka sedang dalam uji coba gratis). Periksa lagi setelah masa uji coba berakhir.",
              "Jika langganan sudah dibayar tetapi Anda masih belum melihat komisinya setelah 48 jam, tulis kepada kami dengan perkiraan waktu pendaftaran dan email atau perkiraan nama pelanggan jika Anda tahu. Tim akan menelusuri rantai atribusi dan memperbaiki kekurangan apa pun secara manual.",
            ],
          },
        ],
      },
      {
        id: "general",
        icon: "❓",
        title: "Umum",
        items: [
          {
            id: "what-is-gadit",
            q: "Apa itu Gadit?",
            a: [
              "Kamus multibahasa yang dibuat agar sebuah kata benar-benar dipahami, bukan sekadar memberi definisi satu baris. Setiap kata terbuka dengan semua maknanya, contoh nyata untuk tiap makna, idiom, etimologi, gambar opsional, dan (dengan Clear dan Deep) penjelasan ramah anak, menyusun kalimat sendiri dengan umpan balik, serta kuis.",
              "Saat ini tersedia 30+ bahasa antarmuka. Di internal tim, kami menyebutnya \"GAD sebuah kata\": memahami kata sampai tuntas, bukan sekadar menerjemahkannya.",
            ],
          },
          {
            id: "languages",
            q: "Bahasa apa saja yang didukung?",
            a: [
              "Antarmuka: Inggris, Yunani, Ibrani, Arab, Rusia, Spanyol, Portugis, Prancis, Jerman, Ceko, Slovakia, Italia, Jepang, Zulu.",
              "Anda bisa mencari kata dalam bahasa mana pun dari daftar itu dan mendapatkan definisi, contoh, dan semuanya dalam bahasa antarmuka pilihan Anda. Bahasa Ibrani dan Arab sepenuhnya ditampilkan dari kanan ke kiri (RTL) dan menggunakan font aslinya.",
            ],
          },
          {
            id: "kid-safety",
            q: "Apakah Gadit aman untuk anak-anak?",
            a: [
              "Gadit dirancang agar orang tua dapat menggunakannya dengan aman bersama anak. Mode anak menghasilkan penjelasan yang sederhana, konkret, dan sesuai usia (kira-kira tingkat usia 5 hingga 10 tahun), menggunakan mesin yang sama dengan konten dewasa, dengan instruksi tegas untuk menyederhanakan. Konten buatan pengguna tidak pernah ditampilkan kepada anak-anak.",
              "Sesuai kebijakan kami dan aturan privasi anak di seluruh dunia, kepemilikan akun secara mandiri berlaku untuk usia 13 tahun ke atas. Pola standarnya adalah akun orang tua yang digunakan orang tua bersama anaknya, dan untuk itulah Mode anak dibuat.",
            ],
          },
          {
            id: "data",
            q: "Di mana data saya disimpan? Apakah Anda menjualnya?",
            a: [
              "Akun, riwayat, buku catatan, dan gambar yang dibuat disimpan dengan aman di Firebase, terenkripsi dalam penyimpanan. Kami tidak menjual data Anda kepada siapa pun. Kami hanya membagikan apa yang diperlukan untuk menjalankan Gadit (penyimpanan, pembayaran, penyedia konten), sebagaimana dijelaskan dalam Kebijakan Privasi.",
              "Anda bisa mengekspor buku catatan atau menghapus akun kapan saja dari halaman Akun.",
            ],
          },
          {
            id: "contact-direct",
            q: "Bagaimana cara menghubungi Anda secara langsung?",
            a: [
              "Gunakan tombol email di bagian bawah halaman ini. Pesan langsung masuk ke kotak masuk tim. Setiap pesan dibaca dan dibalas dalam 24 hingga 48 jam (sering lebih cepat).",
              "Untuk dukungan, email lebih baik daripada chat: tim punya kesempatan membaca dengan cermat dan membalas dengan matang. Dukungan telepon belum tersedia.",
            ],
          },
        ],
      },
    ],
  },
  nl: {
    eyebrow: "Helpcentrum",
    heading: "Vind snel een antwoord.",
    lede: "Veelgestelde vragen en stapsgewijze oplossingen, geordend per onderwerp. Staat je probleem er niet bij? Neem dan onderaan contact op met het team.",
    stillNeedHelpHeading: "Kom je er nog niet uit?",
    stillNeedHelpBody: "Schrijf ons direct. Het team leest elk bericht en reageert binnen een dag of twee.",
    emailCta: "Mail ons",
    responseTime: "Gebruikelijke reactietijd: binnen 24 tot 48 uur.",
    categories: [
      {
        id: "billing",
        icon: "💳",
        title: "Facturering & abonnement",
        items: [
          {
            id: "change-card",
            q: "Hoe wijzig ik de creditcard voor mijn abonnement?",
            a: [
              "Je kunt in minder dan een minuut overstappen op een nieuwe kaart, zonder op te zeggen. Je huidige abonnement loopt gewoon door, alleen op de nieuwe kaart.",
              "1. Log in op gadit.app en open je Account-pagina (rechtsboven). 2. Klik op \"Facturering beheren\". 3. Er opent een beveiligde Stripe-pagina. Klik op \"Betaalmethode toevoegen\", voer de nieuwe kaart in en stel hem in als standaard. 4. Verwijder eventueel de oude kaart.",
              "Vanaf de volgende factuurperiode gaat alles naar de nieuwe kaart. De vorige betaling (al afgeschreven) blijft op de oude kaart. Een terugbetaling is niet nodig, tenzij je die specifiek wilt.",
            ],
          },
          {
            id: "cancel",
            q: "Hoe zeg ik mijn abonnement op?",
            a: [
              "Zelf, op elk moment. Log in, open Account, klik op Facturering beheren en daarna op Abonnement opzeggen.",
              "Je toegang loopt door tot het einde van de periode die je al hebt betaald. Daarna valt het account terug naar Basic (gratis). Je opgeslagen woorden, geschiedenis en notitieboek blijven veilig en toegankelijk.",
              "Heb je per ongeluk opgezegd of ben je van gedachten veranderd? Dan kun je het abonnement op dezelfde pagina hervatten voordat de periode afloopt.",
            ],
          },
          {
            id: "switch-plan",
            q: "Hoe stap ik over van Clear naar Deep (of andersom)?",
            a: [
              "Account, dan Facturering beheren, dan Abonnement bijwerken. Kies het nieuwe abonnement.",
              "Stripe berekent het prijsverschil automatisch, naar rato van de resterende dagen in de huidige periode. Stap je over naar een hoger abonnement, dan betaal je alleen het verschil voor de rest van de periode. Stap je over naar een lager abonnement, dan wordt het tegoed verrekend met je volgende factuur.",
            ],
          },
          {
            id: "invoice",
            q: "Hoe download ik een factuur of betalingsbewijs?",
            a: [
              "Account, dan Facturering beheren, dan Factuurgeschiedenis. Bij elke betaling hoort een downloadbaar pdf-bewijs met de factuurgegevens die je hebt opgeslagen.",
              "Heb je een andere naam, een ander adres of een ander btw-nummer op de factuur nodig (bijvoorbeeld een bedrijfsnaam voor de belasting)? Werk dan je factuurgegevens op dezelfde pagina bij voordat je downloadt. Het volgende bewijs gebruikt de nieuwe gegevens.",
            ],
          },
          {
            id: "portal-error",
            q: "Ik klikte op Facturering beheren maar kreeg een foutmelding. Wat nu?",
            a: [
              "Er zijn twee veelvoorkomende oorzaken. Ten eerste heeft je account geen actief Stripe-abonnement. Ten tweede heeft Stripe mogelijk nog geen volledig factuurprofiel voor je account.",
              "Een makkelijke eerste check: log uit, log opnieuw in met het e-mailadres dat je bij het afrekenen hebt gebruikt en probeer het nog eens. Lukt het nog steeds niet, neem dan contact met ons op met het e-mailadres van je account en het team lost het binnen een minuut aan onze kant op.",
            ],
          },
          {
            id: "autorenew",
            q: "Wordt mijn abonnement automatisch verlengd?",
            a: [
              "Ja. Maandabonnementen worden elke maand verlengd, jaarabonnementen elk jaar op dezelfde datum. De volgende factuurdatum zie je in je account en in het Stripe-portaal.",
              "Wil je geen automatische verlenging, zeg dan op elk moment vóór de verlengingsdatum op. Opzeggen gaat niet direct in. Je houdt toegang tot het einde van de periode die je al hebt betaald.",
            ],
          },
          {
            id: "refund",
            q: "Kan ik mijn geld terugkrijgen?",
            a: [
              "Ja. Als de aankoop minder dan 14 dagen geleden was en de dienst nauwelijks is gebruikt, schrijf ons dan met het e-mailadres van je account en een korte toelichting waarom. Zulke terugbetalingen worden zonder gedoe goedgekeurd.",
              "Is het langer dan 14 dagen geleden, dan bekijkt het team het per geval. Zeg het abonnement op zodat het niet blijft verlengen, en mail ons.",
            ],
          },
          {
            id: "unknown-charge",
            q: "Ik zie een afschrijving die ik niet herken.",
            a: [
              "Afschrijvingen verschijnen als GADIT of GADIT.APP met $2.99 (Clear per maand), $4.99 (Deep per maand), $29.99 (Clear per jaar) of $49.99 (Deep per jaar). Klopt het niet, dan komt het misschien van een andere dienst.",
              "Weet je zeker dat het niet van jou is? Start dan nog geen betwisting via je bank. Schrijf ons eerst direct met de datum en het bedrag. Het team zoekt het op, legt uit wat het is en betaalt terug als dat nodig is. Een betwisting via de bank kan toekomstige betalingen lastiger maken, dus het oplossen via support is meestal sneller en veiliger.",
            ],
          },
          {
            id: "failed-payment",
            q: "Mijn betaling is mislukt. Wat moet ik doen?",
            a: [
              "Stripe probeert mislukte betalingen in de dagen daarna automatisch een paar keer opnieuw. De meeste problemen lossen zich vanzelf op zodra de bank de blokkering opheft of er genoeg saldo op de kaart staat.",
              "Wil je het meteen oplossen, ga dan naar Account → Facturering beheren → Betaalmethode toevoegen, voer een werkende kaart in en stel die in als standaard. Stripe probeert de mislukte betaling dan direct opnieuw op de nieuwe kaart. Is je abonnement al teruggevallen naar Basic, dan kun je je opnieuw abonneren via Prijzen en blijft je notitieboek intact.",
            ],
          },
          {
            id: "plan-comparison",
            q: "Wat is het verschil tussen Basic, Clear en Deep?",
            a: [
              "Basic (gratis): tot 20 woordzoekopdrachten per dag, alle betekenissen, voorbeelden per betekenis, uitdrukkingen en woordherkomst. Voor gewone zoekopdrachten hoef je je niet aan te melden.",
              "Clear ($2.99/maand of $29.99/jaar): onbeperkt zoeken, kindvriendelijke uitleg, een afbeelding per woord (30/maand), zelf een zin maken met feedback, uitgebreide uitdrukkingen en 30 dagen zoekgeschiedenis.",
              "Deep ($4.99/maand of $49.99/jaar): alles van Clear, plus oefenquizzen, het persoonlijke notitieboek met slim gespreid herhalen, het onderscheiden van vergelijkbare woorden en een groter afbeeldingstegoed (100/maand).",
            ],
          },
        ],
      },
      {
        id: "account",
        icon: "👤",
        title: "Account & inloggen",
        items: [
          {
            id: "no-verification-email",
            q: "Ik heb mijn verificatiemail niet ontvangen.",
            a: [
              "Kijk eerst in je spam- en promotiemappen. Gmail en Outlook sturen accountmails daar soms naartoe totdat je er een als \"Geen spam\" markeert.",
              "Staat hij daar niet, dan is het e-mailadres bij het aanmelden misschien verkeerd getypt. Meld je opnieuw aan en controleer het adres goed. Heb je je aangemeld met Google, dan is er geen verificatiemail nodig.",
            ],
          },
          {
            id: "forgot-password",
            q: "Ik ben mijn wachtwoord vergeten.",
            a: [
              "Open het inlogvenster en klik op \"Wachtwoord vergeten?\". Vul het e-mailadres in dat je voor Gadit gebruikt en je krijgt binnen een minuut of twee een resetlink.",
              "Komt de mail niet aan, kijk dan in je spam. Komt hij nog steeds niet, dan heb je je misschien aangemeld met Google in plaats van met e-mail en wachtwoord. Probeer de knop \"Doorgaan met Google\".",
            ],
          },
          {
            id: "wrong-credentials",
            q: "Ik weet zeker dat mijn wachtwoord klopt, maar ik krijg \"Onjuist e-mailadres of wachtwoord\".",
            a: [
              "Drie dingen om te controleren. Ten eerste Caps Lock. Ten tweede een spatie aan het eind bij kopiëren en plakken. Ten derde: misschien heb je je aangemeld met Google in plaats van met een wachtwoord (gebruik dan \"Doorgaan met Google\").",
              "Lukt het nog steeds niet? Reset je wachtwoord in hetzelfde venster. Dan begin je weer met een schone lei.",
            ],
          },
          {
            id: "google-fails",
            q: "Inloggen met Google werkt niet.",
            a: [
              "Meest voorkomende oorzaak: je browser blokkeert cookies van derden of pop-ups voor gadit.app. Sta ze toe via de machtigingen in de adresbalk en probeer het opnieuw.",
              "In de incognitomodus is inloggen met Google bewust beperkt. Schakel over naar een gewoon browservenster.",
            ],
          },
          {
            id: "change-email",
            q: "Hoe wijzig ik het e-mailadres van mijn account?",
            a: [
              "Account, klik op je e-mailadres, E-mailadres wijzigen. Je moet het nieuwe adres bevestigen voordat de wijziging ingaat. Je abonnement, geschiedenis en notitieboek gaan allemaal mee.",
              "Is het e-mailadres gekoppeld aan een Stripe-klant, werk het dan ook bij in het factureringsportaal van Stripe, zodat toekomstige betalingsbewijzen naar het nieuwe adres gaan.",
            ],
          },
          {
            id: "delete-account",
            q: "Hoe verwijder ik mijn account?",
            a: [
              "Account, onderaan de pagina, Account verwijderen. Dit is definitief. Je abonnement wordt opgezegd, je notitieboek en geschiedenis worden gewist en het e-mailadres komt vrij voor een nieuwe aanmelding.",
              "Stripe-gegevens van eerdere betalingen blijven bewaard (we zijn wettelijk verplicht ze te bewaren voor de boekhouding). Verder blijft er niets over.",
            ],
          },
          {
            id: "share-account",
            q: "Kunnen mijn partner of kind mijn account delen?",
            a: [
              "Eén ingelogde gebruiker per account tegelijk. Met de kindermodus kan één Clear- of Deep-account een ouder en een kind bedienen: zet de schakelaar om en definities worden kindvriendelijk weergegeven, zonder aparte logins.",
              "Willen twee volwassenen allebei een eigen notitieboek en eigen voortgang, maak dan twee accounts aan. Clear kost $2.99 per maand per account.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "Ik denk dat ik per ongeluk twee accounts heb. Wat nu?",
            a: [
              "Dit gebeurt meestal als iemand zich met hetzelfde adres één keer via Google en één keer met e-mail en wachtwoord aanmeldt, of zich twee keer aanmeldt met verschillende e-mailadressen. Elke aanmelding maakt een apart Gadit-account met een eigen notitieboek, geschiedenis en abonnementsstatus.",
              "Stuur ons beide e-mailadressen (of de UID's van de Account-pagina) en laat weten welk account je wilt houden. Het team voegt de notitieboeken en geschiedenis samen in het account dat je kiest en sluit het andere netjes af. Er gaan geen gegevens verloren.",
            ],
          },
        ],
      },
      {
        id: "product",
        icon: "🔍",
        title: "Gadit gebruiken",
        items: [
          {
            id: "wrong-definition",
            q: "Ik denk dat de definitie niet klopt. Wat doe ik?",
            a: [
              "Onderaan elke resultaatpagina staat een kleine knop \"Melden\". Tik erop, kies een categorie (definitie, etymologie, voorbeeld, uitdrukking, uitleg voor kinderen, enzovoort) en schrijf een korte opmerking. Die komt rechtstreeks bij het team binnen en elke melding wordt bekeken.",
              "Wees niet bang om te kritisch te zijn. Het woordenboek wordt van deze feedback sneller beter dan van wat dan ook.",
            ],
          },
          {
            id: "kids-not-working",
            q: "De kindermodus verandert de uitleg niet.",
            a: [
              "De kindermodus past alleen tekst aan als er voor het woord al een kindvriendelijke uitleg is gemaakt. Geef het bij gloednieuwe woorden die je net hebt opgezocht 10 tot 15 seconden. De kindvriendelijke versie wordt de eerste keer ter plekke gemaakt.",
              "Verder vereist de kindermodus Clear of Deep. Gebruik je Basic, dan vraagt de schakelaar je om te upgraden. Anonieme gebruikers wordt gevraagd zich aan te melden.",
            ],
          },
          {
            id: "voice-fails",
            q: "Zoeken met spraak werkt niet.",
            a: [
              "Zoeken met spraak heeft toestemming voor de microfoon nodig. De meeste browsers vragen dat één keer per site. Heb je per ongeluk op Blokkeren geklikt, dan moet je dat handmatig terugzetten: klik op het slot- of info-icoon naast gadit.app in de adresbalk, dan Site-instellingen, dan Microfoon, dan Toestaan.",
              "In Safari op iOS moet microfoontoegang ook aanstaan via Instellingen → Safari → Microfoon. Spraak is momenteel een functie van Clear en Deep: Basic-gebruikers zien een uitnodiging om te upgraden, niet-ingelogde bezoekers een uitnodiging om in te loggen.",
            ],
          },
          {
            id: "no-image",
            q: "Ik kan geen afbeelding voor het woord maken.",
            a: [
              "Afbeeldingen maken is een functie van Clear of Deep met een maandelijks tegoed. Clear krijgt 30 afbeeldingen per maand, Deep 100. Is je tegoed op, dan zie je een melding. Het tegoed wordt op de 1e van elke maand gereset.",
              "Zit je onder je tegoed en gaat het toch mis, dan is dat meestal tijdelijk. Probeer het over 30 seconden opnieuw. Blijvende fouten zijn een bug. Meld het dan via de woordpagina.",
            ],
          },
          {
            id: "save-word",
            q: "Hoe sla ik een woord op in mijn notitieboek?",
            a: [
              "Tik op een woordpagina op Opslaan in notitieboek bij de titel. Het notitieboek is een functie van Clear en Deep waarin je opgeslagen woorden later kunt herhalen, ze in een sterrenstelselweergave kunt bekijken en slimme oefensessies kunt doen (Deep).",
              "Woorden die je hebt opgeslagen en minstens één keer hebt geopend, zijn offline beschikbaar uit de lokale cache. Het offlinepakket slaat ook de populairste woorden in jouw taal op, zodat je ook zonder internet klaar bent.",
            ],
          },
          {
            id: "offline",
            q: "Hoe werkt de offlinemodus?",
            a: [
              "Woorden die je al hebt bekeken, worden lokaal opgeslagen. Open ze opnieuw zonder internet en ze laden direct. Het volledige offlinepakket (de belangrijkste woorden in jouw taal) download je op verzoek via de notitieboekpagina.",
              "Voor het zoeken naar een gloednieuw woord heb je nog steeds verbinding nodig, omdat Gadit de definitie vanaf nul moet maken. De offlinecache is voor woorden die je al hebt verkend.",
            ],
          },
          {
            id: "slow",
            q: "De app voelt traag.",
            a: [
              "Het eerste opzoeken van een woord is het traagst, omdat Gadit het volledige resultaat vanaf nul maakt: meestal een paar seconden, soms langer bij complexe woorden. Daarna gaat het opzoeken van hetzelfde woord meteen, vanuit de cache.",
              "Voelt alles traag, probeer dan een harde vernieuwing: Cmd+Shift+R op Mac, Ctrl+Shift+R op Windows. Blijft het op meerdere pagina's traag, mail ons dan je land en browser, zodat het team de netwerkroute van jouw regio naar onze servers kan controleren.",
            ],
          },
          {
            id: "word-not-found",
            q: "Ik zocht een woord en kreeg geen resultaat. Wat is er aan de hand?",
            a: [
              "Controleer eerst de spelling. Gadit kan meestal kleine typfouten aan, maar een verkeerde klinker of een ontbrekende letter kan het in de war brengen. Probeer de voorgestelde correctie als die verschijnt.",
              "Daarnaast kunnen zeer zeldzame woorden of slangwoorden geen betrouwbaar resultaat opleveren. Weet je zeker dat het woord bestaat, klik dan op de knop Melden op de resultaatpagina (of op het foutscherm) en laat het ons weten. Elke melding wordt bekeken en echte missers gaan terug het systeem in.",
            ],
          },
          {
            id: "change-language",
            q: "Hoe wijzig ik de taal van de interface?",
            a: [
              "Rechtsboven op elke pagina zie je een klein vlagicoon (of de naam van je huidige taal). Tik erop en kies uit 30+ talen: Engels, Grieks, Hebreeuws, Arabisch, Russisch, Spaans, Portugees, Frans, Duits, Tsjechisch, Slowaaks, Italiaans, Japans, Hindi, Amhaars, Zoeloe.",
              "Je keuze wordt op dit apparaat bewaard. Alles laadt opnieuw in de nieuwe taal: de interface, de menu's, toekomstige woorddefinities, voorbeelden, uitleg voor kinderen, zelfs de etymologie. Resultaten die al in de oude taal in de cache staan, blijven staan totdat je die woorden opnieuw opzoekt.",
            ],
          },
        ],
      },
      {
        id: "partner",
        icon: "🤝",
        title: "Partnerprogramma",
        items: [
          {
            id: "join-partner",
            q: "Hoe word ik Gadit-partner?",
            a: [
              "Open /partners vanaf elke pagina en klik op \"Word partner\". Meld je aan met je naam en e-mailadres, en je unieke verwijzingslink plus een dashboard om klikken en commissies te volgen staan meteen klaar. Je hoeft niet op goedkeuring te wachten.",
              "Meedoen is gratis en staat open voor iedereen. Je hebt geen Gadit-abonnement nodig om partner te worden.",
            ],
          },
          {
            id: "commission-model",
            q: "Hoe worden commissies berekend?",
            a: [
              "De standaardvoorwaarden zijn 25% van elke betaling die een klant in het eerste jaar doet. Na dat eerste jaar verdien je 10% van elke betaling, zolang de klant blijft betalen.",
              "Dit werkt hetzelfde voor maand- en jaarabonnementen, omdat de commissie over elke daadwerkelijke betaling wordt berekend. Zegt een klant op, dan stopt je commissie bij diens laatste betaling.",
              "Het team kan voor specifieke partners andere tarieven instellen. Je eigen tarieven staan altijd in je partnerdashboard, dat je via /partners bereikt.",
            ],
          },
          {
            id: "payout",
            q: "Wanneer word ik uitbetaald?",
            a: [
              "Maandelijks, zodra je saldo boven $50 komt. We gebruiken de uitbetaalmethode die je in het partnerdashboard hebt ingesteld (bankoverschrijving, PayPal, enzovoort). $50 is de minimumdrempel, geen plafond. Je kunt veel meer verdienen, je ontvangt de uitbetaling gewoon zodra je de drempel passeert.",
              "Commissies worden 30 dagen na de abonnementsbetaling vrijgegeven, vanwege de terugbetalingstermijn. Een abonnement uit januari wordt dus begin februari vrijgegeven en komt in je volgende uitbetaling zodra je saldo boven $50 komt.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "Ik doe mee, maar mijn dashboard is leeg.",
            a: [
              "Statistieken verschijnen na de eerste klik op je link. Leeg betekent alleen dat nog niemand heeft geklikt. Ga de link delen. Zodra er activiteit is, wordt het dashboard bijna realtime bijgewerkt.",
              "Heb je de link gedeeld en heeft iemand zich aangemeld, maar zie je dat niet terug in het dashboard? Schrijf ons dan met het geschatte tijdstip van aanmelding en het team controleert de toeschrijving.",
            ],
          },
          {
            id: "attribution-window",
            q: "Hoe lang blijft mijn verwijzingslink een bezoeker volgen?",
            a: [
              "Zestig dagen. Als een bezoeker op je link klikt, plaatsen we een cookie die jou als verwijzer aanmerkt. Meldt die bezoeker zich binnen de volgende 60 dagen aan en neemt die een abonnement (ook als die de site verlaat en later via een zoekopdracht in Google terugkomt), dan wordt het nog steeds aan jou toegeschreven.",
              "Cookies wissen: als de bezoeker vóór het aanmelden cookies wist of van browser/apparaat wisselt, kan de toeschrijving verloren gaan. Daar is geen oplossing voor, maar 60 dagen is een ruime termijn vergeleken met de meeste partnerprogramma's.",
            ],
          },
          {
            id: "missing-commission",
            q: "Iemand heeft zich via mijn link aangemeld, maar ik zie de commissie niet.",
            a: [
              "Meestal is het een kwestie van timing: de aanmelding verschijnt binnen enkele minuten in het dashboard, maar de commissie wordt pas geboekt als het abonnement echt is betaald (dat kan dagen later zijn bij een gratis proefperiode). Kijk opnieuw na afloop van de proefperiode.",
              "Is het abonnement betaald maar zie je na 48 uur nog steeds geen commissie, schrijf ons dan met het geschatte tijdstip van aanmelding en het e-mailadres of de naam van de abonnee bij benadering, als je die weet. Het team duikt in de toeschrijvingsketen en herstelt eventuele missers handmatig.",
            ],
          },
        ],
      },
      {
        id: "general",
        icon: "❓",
        title: "Algemeen",
        items: [
          {
            id: "what-is-gadit",
            q: "Wat is Gadit?",
            a: [
              "Een meertalig woordenboek dat is gemaakt om een woord echt te laten landen, niet alleen om een definitie van één regel te geven. Elk woord opent met al zijn betekenissen, echte voorbeelden per betekenis, uitdrukkingen, etymologie, een optionele afbeelding en (met Clear en Deep) kindvriendelijke uitleg, zelf een zin maken met feedback, en quizzen.",
              "Op dit moment 30+ interfacetalen. Intern noemt het team het \"een woord GADden\": een woord helemaal doorgronden, niet alleen vertalen.",
            ],
          },
          {
            id: "languages",
            q: "Welke talen ondersteunen jullie?",
            a: [
              "Interface: Engels, Grieks, Hebreeuws, Arabisch, Russisch, Spaans, Portugees, Frans, Duits, Tsjechisch, Slowaaks, Italiaans, Japans, Zoeloe.",
              "Je kunt een woord opzoeken in elk van die talen en krijgt de definitie, voorbeelden en al het andere in de interfacetaal die je hebt gekozen. Hebreeuws en Arabisch worden volledig van rechts naar links (RTL) weergegeven en gebruiken hun eigen lettertypen.",
            ],
          },
          {
            id: "kid-safety",
            q: "Is Gadit veilig voor kinderen?",
            a: [
              "Gadit is ontworpen zodat een ouder het veilig samen met een kind kan gebruiken. De kindermodus geeft uitleg die eenvoudig, concreet en passend bij de leeftijd is (ongeveer op het niveau van 5 tot 10 jaar), met dezelfde engine die de inhoud voor volwassenen maakt, met expliciete instructies om te vereenvoudigen. Door gebruikers gemaakte inhoud wordt nooit aan kinderen getoond.",
              "In lijn met ons beleid en de regels voor de privacy van kinderen wereldwijd is een eigen account mogelijk vanaf 13 jaar. Het standaardpatroon is een account van een ouder dat de ouder samen met het kind gebruikt, en precies daarvoor is de kindermodus gemaakt.",
            ],
          },
          {
            id: "data",
            q: "Waar worden mijn gegevens opgeslagen? Verkopen jullie ze?",
            a: [
              "Account, geschiedenis, notitieboek en gemaakte afbeeldingen worden veilig opgeslagen in Firebase, versleuteld bij opslag. We verkopen je gegevens aan niemand. We delen alleen wat nodig is om Gadit te laten werken (opslag, betalingen, contentleveranciers), zoals beschreven in het privacybeleid.",
              "Je kunt je notitieboek op elk moment exporteren of je account verwijderen via de Account-pagina.",
            ],
          },
          {
            id: "contact-direct",
            q: "Hoe bereik ik jullie direct?",
            a: [
              "Gebruik de e-mailknop onderaan deze pagina. Die gaat rechtstreeks naar de inbox van het team. Elk bericht wordt gelezen en binnen 24 tot 48 uur beantwoord (vaak sneller).",
              "Voor support werkt e-mail beter dan chat: het team kan zorgvuldig lezen en doordacht antwoorden. Telefonische support bieden we nog niet aan.",
            ],
          },
        ],
      },
    ],
  },
};
