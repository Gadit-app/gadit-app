import type { HelpContent } from "./help-i18n";
import type { Lang } from "./i18n";

/** Help Center in uk, tr, pl, fa, id, nl (2026-10-10 i18n sweep). Same ids, order and meaning as the English block in help-i18n.ts. */
export const HELP_MORE_3: Partial<Record<Lang, HelpContent>> = {
  uk: {
    eyebrow: "Центр допомоги",
    heading: "Знайдіть відповідь швидко",
    lede: "Поширені запитання та покрокові рішення, згруповані за темами. Якщо не бачите свого питання, зв'яжіться з командою внизу сторінки.",
    stillNeedHelpHeading: "Досі не вийшло?",
    stillNeedHelpBody: "Напишіть нам напряму. Команда читає кожне повідомлення і зазвичай відповідає протягом одного або двох днів.",
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
              "1. Увійдіть на gadit.app і відкрийте \"Акаунт\" у меню акаунта. 2. Натисніть \"Керувати оплатою\". 3. Відкриється захищена сторінка Stripe. Додайте нову картку як спосіб оплати і позначте її як основну. 4. За бажанням видаліть стару картку.",
              "Починаючи з наступного платіжного циклу, усі списання підуть з нової картки. Попереднє списання, яке вже пройшло, залишиться на старій картці. Зміна картки не переносить це списання і не змінює дату наступного списання.",
            ],
          },
          {
            id: "cancel",
            q: "Як скасувати підписку?",
            a: [
              "Самостійно, будь-коли. Увійдіть, відкрийте \"Акаунт\" і натисніть \"Скасувати підписку\" під своїм планом.",
              "Купили підписку в застосунку на iPhone або iPad? Скасуйте її в налаштуваннях підписок Apple. Посилання \"Керувати підпискою\" на сторінці \"Акаунт\" веде саме туди.",
              "У платній підписці доступ зберігається до кінця вже оплаченого періоду. Після цього акаунт переходить на Basic, безкоштовний. Ваші збережені слова та історія залишаються в безпеці.",
              "Під час 14-денного безкоштовного пробного періоду скасування одразу завершує пробний період, і нічого не списується. Якщо вас турбує лише автоматичне списання, виберіть цю причину у вікні скасування, і тоді можна буде просто вимкнути поновлення та користуватися пробним періодом до останнього дня.",
              "Якщо ви скасували платну підписку помилково або передумали, можна відновити її на тій самій сторінці до завершення періоду.",
            ],
          },
          {
            id: "switch-plan",
            q: "Як перейти між Individual і Family?",
            a: [
              "Щоб перейти на Family, відкрийте сторінку «Акаунт» і натисніть «Перейти на Family». Ваша поточна підписка оновиться на тій самій картці, без повторного введення даних.",
              "Stripe розраховує різницю за дні, що залишилися в поточному періоді, тож ви платите лише різницю. Щоб перейти з Family на Individual, напишіть нам з цієї сторінки, і команда переведе вас.",
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
              "Так, протягом 14 днів після першого платежу у вашому акаунті або після річного поновлення. Напишіть на support@gadit.app з адреси електронної пошти вашого акаунта, і ми повністю повернемо цей платіж. Причину вказувати не потрібно. Повернення також припиняє підписку, а гроші повертаються на картку, якою ви платили, зазвичай протягом 5 до 10 робочих днів.",
              "Після 14 днів платежі не повертаються, якщо тільки вас не списали помилково або закон у вашій країні не вимагає повернення. Ви можете будь-коли скасувати підписку, щоб вона не поновилася, і вона залишиться активною до кінця вже оплаченого періоду.",
              "Купили в застосунку на iPhone або iPad? Такі повернення оформлює Apple на reportaproblem.apple.com.",
            ],
          },
          {
            id: "unknown-charge",
            q: "Що це за списання з моєї картки?",
            a: [
              "Списання відображаються як GADIT або GADIT.APP. Сума відповідає вашому плану (Individual або Family, щомісяця або щороку) у валюті вашої країни, як показано на сторінці «Ціни». Підписки, оформлені до жовтня 2026 року, зберігають початкову ціну. Якщо сума не збігається, можливо, це інший сервіс.",
              "Якщо ви впевнені, що це не ваше списання, поки не відкривайте спір через банк. Спершу напишіть нам напряму, вказавши дату і суму. Команда знайде списання, пояснить, що це, і за потреби поверне кошти. Банківський спір може ускладнити майбутні оплати, тому вирішити питання через підтримку зазвичай швидше і безпечніше.",
            ],
          },
          {
            id: "failed-payment",
            q: "Платіж не пройшов. Що робити?",
            a: [
              "Stripe автоматично повторює невдалі платежі кілька разів протягом наступних днів. Більшість проблем зникають самі, щойно банк зніме блокування або на картці буде достатньо коштів.",
              "Угорі сторінки з'явиться смужка з повідомленням, що списання не пройшло, а доступ збережеться ще на кілька днів. Натисніть там \"Оновити картку\", введіть робочу картку, і ми одразу спробуємо списати з неї. Якщо підписка вже повернулася на Basic, можна оформити її знову на сторінці тарифів, і ваш записник залишиться цілим.",
            ],
          },
          {
            id: "plan-comparison",
            q: "Чим відрізняються Basic, Individual і Family?",
            a: [
              "Basic (безкоштовно): до 10 пошуків слів на день, усі значення, приклади, ідіоми, походження слова, правильне значення з речення і записник до 30 слів.",
              "Individual: одна людина, усі інструменти навчання. Необмежені пошуки, зображення до кожного значення, більше прикладів і запитань до кожного слова, складання речення з відгуком, Кожне слово, Скажи це, природний голос для озвучення і голосовий пошук, користування офлайн, ігри, вікторини й словесні дуелі, а також розумна практика з підготовкою до тестів і диктантами.",
              "Family: усе, що є в Individual, для щонайбільше 5 дітей і батьків, а також дитячий режим, окремий простір для кожної дитини, допомога з домашніми завданнями і батьківська панель зі сповіщенням про кожне слово. Для шкіл є окремий план. Ціни для вашої країни і 14-денний безкоштовний пробний період є на сторінці «Ціни».",
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
            q: "Не прийшов лист для підтвердження",
            a: [
              "Спершу перевірте папки «Спам» і «Промоакції». Gmail і Outlook іноді відправляють туди листи акаунта, доки ви не позначите один із них як «Не спам».",
              "Якщо там його немає, можливо, під час реєстрації адресу введено з помилкою. Спробуйте зареєструватися ще раз і уважно перевірте адресу. Якщо ви реєструвалися через Google, лист для підтвердження не потрібен.",
            ],
          },
          {
            id: "forgot-password",
            q: "Не пам'ятаю пароль",
            a: [
              "У вікні входу введіть свою пошту, потім натисніть \"Забув пароль?\". Посилання для скидання зазвичай приходить на пошту за хвилину або дві. Також можна натиснути \"Надіслати посилання для входу на пошту\" і увійти без пароля.",
              "Якщо лист не прийшов, перевірте спам. Якщо його досі немає, можливо, ви реєструвалися через Google, а не через пошту і пароль. Спробуйте кнопку \"Продовжити з Google\".",
            ],
          },
          {
            id: "wrong-credentials",
            q: "Пароль точно правильний, але з'являється «Неправильна пошта або пароль»",
            a: [
              "Перевірте три речі. По-перше, Caps Lock. По-друге, зайвий пробіл у кінці після копіювання. По-третє, можливо, ви реєструвалися через Google, а не з паролем, тоді скористайтеся кнопкою \"Продовжити з Google\".",
              "Досі не виходить? У тому самому повідомленні натисніть \"Надіслати посилання для входу на пошту\", щоб увійти без пароля, або \"Вибрати новий пароль\".",
            ],
          },
          {
            id: "google-fails",
            q: "Вхід через Google не працює",
            a: [
              "Усередині застосунків на кшталт Instagram, Facebook або TikTok кнопка Google прихована. Відкрийте посилання у своєму звичайному браузері або увійдіть через пошту. Якщо ви реєструвалися через Google, введіть ту саму пошту і натисніть \"Надіслати посилання для входу на пошту\".",
              "У приватному вікні, incognito, заблоковані cookies можуть завадити входу через Google, тож спробуйте звичайне вікно.",
            ],
          },
          {
            id: "change-email",
            q: "Як змінити пошту в акаунті?",
            a: [
              "Зміну пошти в акаунті робить команда. Напишіть нам з вашої поточної адреси і вкажіть у листі нову. Команда оновить її, а підписка, історія і записник залишаться як є.",
            ],
          },
          {
            id: "delete-account",
            q: "Як видалити акаунт?",
            a: [
              "Унизу сторінки \"Акаунт\" натисніть \"Видалити акаунт\" і для підтвердження введіть пошту свого акаунта. Це назавжди: підписку буде скасовано, записник та історію буде стерто, а пошта звільниться для нової реєстрації.",
              "Є один виняток, підписка, куплена в App Store. Видалення акаунта її не скасовує, тому спершу скасуйте її в налаштуваннях підписок Apple.",
              "Записи про минулі списання залишаються, бо закон зобов'язує нас зберігати їх для бухгалтерії.",
            ],
          },
          {
            id: "share-account",
            q: "Чи можуть мій партнер або дитина користуватися моїм акаунтом?",
            a: [
              "В одному акаунті одночасно може бути лише одна людина. Для родини саме для цього створено план Family: до 5 дітей і батьки, у кожного власний простір, власний записник і прогрес, а також дитячий режим для дітей і батьківська панель.",
              "Для одного дорослого Individual охоплює одну людину з усіма інструментами навчання. Порівняйте плани та ціни для вашої країни на сторінці «Ціни».",
            ],
          },
          {
            id: "multiple-accounts",
            q: "Здається, у мене випадково два акаунти. Що робити?",
            a: [
              "Зазвичай так буває, коли людина реєструється один раз через Google, а вдруге через пошту і пароль з тією самою адресою, або коли реєструється двічі з різними адресами. Кожна реєстрація створює окремий акаунт Gadit з власним записником, історією і станом підписки.",
              "Напишіть нам з однієї з двох адрес і вкажіть іншу адресу та який акаунт хочете залишити. Команда об'єднає записники та історію в обраний акаунт, а потім акуратно закриє інший. Жодні дані не загубляться.",
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
              "Поруч із кожним значенням, а також на картках ідіом і походження слова, є маленький значок прапорця. Натисніть його, виберіть, що саме не так, і за бажанням додайте коротку примітку. Повідомлення одразу потрапляє до команди, і кожне з них переглядається.",
              "Не бійтеся бути надто прискіпливими. Саме такі відгуки покращують словник швидше за все інше.",
            ],
          },
          {
            id: "kids-not-working",
            q: "Дитячий режим не змінює пояснення",
            a: [
              "Дитячий режим змінює текст лише там, де для слова вже є пояснення для дітей. Якщо ви щойно вперше шукали слово, зачекайте від 10 до 15 секунд, поки готується дитяча версія.",
              "Дитячий режим входить у план Family. На Individual замість нього ви побачите перемикач \"Простими словами\", який показує простіше пояснення кожного значення. У Basic або без акаунта перемикача немає. Передплатники, які оформили Clear або Deep до жовтня 2026 року, зберігають Дитячий режим. Щоб отримати його, перегляньте Family на сторінці тарифів.",
            ],
          },
          {
            id: "voice-fails",
            q: "Голосовий пошук не працює",
            a: [
              "Голосовому пошуку потрібен дозвіл на мікрофон. Більшість браузерів питають один раз для кожного сайту. Якщо ви випадково його заблокували, натисніть значок поруч із gadit.app в адресному рядку і дозвольте мікрофон у дозволах сайту.",
              "На iPhone та iPad також потрібно дозволити мікрофон для Safari в застосунку Налаштування на пристрої. Голосовий пошук входить у плани Individual і Family, тому в Basic і без акаунта кнопка мікрофона не з'являється. Щоб перейти на вищий план, відкрийте сторінку тарифів.",
            ],
          },
          {
            id: "no-image",
            q: "Не вдається отримати зображення до слова",
            a: [
              "Зображення входять у плани Individual і Family, до 100 нових зображень на місяць. Зображення, яке вже існує для цього значення, відкривається без зарахування в ліміт. Старий план Clear має 30 на місяць, а Basic зображень не містить. Коли зображення на місяць закінчаться, ви побачите повідомлення, а лічильник починається знову на початку кожного місяця.",
              "Якщо квоту не вичерпано, а помилки все одно є, зазвичай це тимчасово. Спробуйте ще раз через 30 секунд. Постійні помилки означають баг. Будь ласка, повідомте про це зі сторінки слова.",
            ],
          },
          {
            id: "save-word",
            q: "Як зберегти слово в записник?",
            a: [
              "Цього робити не потрібно. Коли ви увійшли, кожне слово, яке ви шукаєте, саме зберігається в записнику. У Basic записник вміщує до 30 слів. В Individual і Family обмежень немає, і є розумна практика, яка повертає ваші слова на повторення в потрібний час.",
              "В Individual і Family слова, які ви шукаєте, також зберігаються на вашому пристрої, тож відкриваються без інтернету. Щоб побачити свої слова, відкрийте записник з меню.",
            ],
          },
          {
            id: "offline",
            q: "Як працює офлайн-режим?",
            a: [
              "Користування офлайн входить у плани Individual і Family. Кожне слово, яке ви шукаєте, зберігається на вашому пристрої, тож знову відкривається миттєво без інтернету. Також на сторінці \"Акаунт\" можна натиснути \"Завантажити офлайн-набір\", щоб зберегти на цьому пристрої слова словника вашою мовою.",
              "Пошук зовсім нового слова все одно потребує з'єднання, бо Gadit має підготувати для нього повний результат. Офлайн-копія охоплює слова, які вже є на вашому пристрої. Якщо у вас Basic, перегляньте плани на сторінці тарифів.",
            ],
          },
          {
            id: "slow",
            q: "Застосунок працює повільно",
            a: [
              "Перший пошук слова найповільніший, бо Gadit створює повний результат з нуля: зазвичай кілька секунд, іноді довше для складних слів. Наступні пошуки того самого слова миттєві, з кешу.",
              "Якщо повільно працює все, спробуйте жорстке оновлення: Cmd+Shift+R на Mac, Ctrl+Shift+R на Windows. Якщо повільність зберігається на різних сторінках, напишіть нам, вказавши країну і браузер, щоб команда перевірила мережевий маршрут до наших серверів з вашого регіону.",
            ],
          },
          {
            id: "word-not-found",
            q: "Шукаю слово, а результату немає. Що сталося?",
            a: [
              "Спершу перевірте написання. Якщо була помилка, Gadit зазвичай показує виправлене слово і дає посилання, щоб усе одно пошукати саме те, що ви ввели.",
              "Дуже рідкісні або сленгові слова не завжди дають результат. Якщо ви впевнені, що слово існує, напишіть нам з цієї сторінки, і команда перевірить.",
            ],
          },
          {
            id: "change-language",
            q: "Як змінити мову інтерфейсу?",
            a: [
              "Угорі сторінки є значок глобуса з поточною мовою. Натисніть його і виберіть мову.",
              "Ваш вибір зберігається на цьому пристрої. Усе перезавантажується новою мовою: інтерфейс, меню, майбутні визначення слів, приклади, пояснення для дітей і навіть походження слова. Слова, які ви вже шукали старою мовою, залишаться нею, доки ви не пошукаєте їх знову.",
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
              "Перейдіть на gadit.app/partners і натисніть \"Приєднатися безкоштовно\". Введіть своє ім'я та пошту, потім натисніть \"Отримати мій партнерський код\". Ваше особисте посилання і партнерська панель, де видно кліки та комісії, будуть готові одразу, без очікування схвалення. Код і посилання також прийдуть на пошту.",
              "Участь безкоштовна і відкрита для всіх. Щоб стати партнером, підписка Gadit не потрібна.",
            ],
          },
          {
            id: "commission-model",
            q: "Як розраховуються комісії?",
            a: [
              "Стандартні умови такі: 25% від кожного платежу клієнта протягом його першого року. Після першого року ви отримуєте 10% від кожного платежу, доки клієнт продовжує платити. Якщо ви привели 5 платних клієнтів, ваша частка після першого року зростає до 15% назавжди.",
              "Це однаково працює для місячних і річних планів, бо комісія рахується з кожного фактичного платежу. Якщо клієнт скасовує підписку, ваша комісія припиняється з його останнім платежем.",
              "Команда може встановлювати інші ставки для окремих партнерів. Ваші ставки завжди показані у вашій партнерській панелі.",
            ],
          },
          {
            id: "payout",
            q: "Коли я отримаю виплату?",
            a: [
              "Раз на місяць, без мінімальної суми. Кожна комісія стає доступною до виплати через 30 днів після платежу клієнта, і все, що вже доступне, ми надсилаємо в наступній щомісячній виплаті на акаунт PayPal, який ви вказали у своїй партнерській панелі.",
              "Ми виплачуємо у валюті, якою заплатив клієнт, якщо PayPal може її надіслати. Якщо ні, то в доларах США, за курсом на день виплати.",
              "Комісії очікують 30 днів через повернення коштів: якщо платіж клієнта повертається, комісія за нього скасовується. Тому комісія за платіж у січні стає доступною до виплати в лютому і потрапляє в наступну щомісячну виплату.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "Реєстрація пройшла, але панель порожня",
            a: [
              "Статистика з'являється після першого кліку на ваше посилання. Порожня панель означає лише, що ніхто ще не клікнув. Поділіться посиланням. Щойно почнеться активність, панель оновлюватиметься майже в реальному часі.",
              "Якщо ви поділилися посиланням і хтось зареєструвався, але панель цього не показує, напишіть нам приблизний час реєстрації, і команда перевірить, звідки прийшла реєстрація.",
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
            q: "Хтось зареєструвався за моїм посиланням, але комісії не видно",
            a: [
              "Найчастіше справа в часі: реєстрація з'являється в панелі за кілька хвилин, але комісія зараховується лише після фактичної оплати підписки, а це може бути через кілька днів, якщо в людини безкоштовний пробний період. Перевірте ще раз після завершення пробного періоду.",
              "Якщо підписку оплачено, а комісії все ще немає через 48 годин, напишіть нам приблизний час реєстрації та пошту або приблизне ім'я підписника, якщо знаєте. Команда перевірить, звідки прийшла реєстрація, і вручну виправить будь-який пропуск.",
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
              "Gadit допомагає зрозуміти кожне слово до кінця, а не просто отримати визначення в один рядок. Кожне слово відкривається з усіма значеннями, реальними прикладами для кожного значення, ідіомами і походженням слова. Платні плани додають зображення до кожного значення, практику, ігри та інше, а Family додає дитячий режим і окремий простір для кожної дитини.",
              "Gadit працює 41 мовою. У команді це називають «зробити GAD слову»: зрозуміти слово до кінця, а не просто перекласти його. Щоб побачити, що входить у кожен план, відкрийте сторінку «Ціни».",
            ],
          },
          {
            id: "languages",
            q: "Які мови ви підтримуєте?",
            a: [
              "Gadit працює 41 мовою, серед них англійська, іврит, арабська, іспанська, французька, німецька, російська, китайська, японська, гінді, зулу, коса та африкаанс.",
              "Ви можете шукати слово будь-якою з цих мов і отримувати значення, приклади та все інше мовою, яку вибрали для інтерфейсу. Іврит, арабська і перська читаються справа наліво і мають власні шрифти. Щоб змінити мову, натисніть кнопку мови вгорі будь-якої сторінки.",
            ],
          },
          {
            id: "kid-safety",
            q: "Чи безпечний Gadit для дітей?",
            a: [
              "Gadit створено так, щоб батьки могли безпечно користуватися ним разом із дитиною. Дитячий режим дає прості, конкретні пояснення, що відповідають віку, приблизно для дітей 5 до 10 років, за допомогою того самого рушія, що створює контент для дорослих, але з чіткими інструкціями спрощувати. Контент, створений користувачами, ніколи не показується дітям.",
              "Власний акаунт призначений для дорослих, від 18 років. Діти й підлітки користуються Gadit через дорослого. Вдома батьки додають кожну дитину на сторінці Family, кожна дитина отримує власний простір із дитячим режимом, а батьківська панель показує слова, які шукає кожна дитина. У школі клас отримує посилання від учителя, і учні приєднуються без акаунта і без електронної пошти.",
            ],
          },
          {
            id: "data",
            q: "Де зберігаються мої дані? Ви їх продаєте?",
            a: [
              "Акаунт, історія, записник і створені зображення надійно зберігаються у Firebase, у зашифрованому вигляді. Ми нікому не продаємо ваші дані. Ми передаємо лише те, що потрібно для роботи Gadit (зберігання, платежі, постачальники контенту), як описано в Політиці конфіденційності.",
              "Ви можете будь-коли видалити акаунт на сторінці «Акаунт». Щоб отримати копію свого записника або будь-яких інших даних, які ми зберігаємо, напишіть нам з цієї сторінки.",
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
    heading: "Cevabı hızla bulun",
    lede: "Sık sorulan sorular ve adım adım çözümler, konulara göre düzenlendi. Sorununuzu burada göremiyorsanız sayfanın altından ekiple iletişime geçin.",
    stillNeedHelpHeading: "Hâlâ çözemediniz mi?",
    stillNeedHelpBody: "Bize doğrudan yazın. Her mesaj ekip tarafından okunur ve genellikle bir iki gün içinde yanıtlanır.",
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
              "1. gadit.app adresinde oturum açın ve hesap menüsünden \"Hesap\" bölümünü açın. 2. \"Faturalandırmayı yönet\" seçeneğine tıklayın. 3. Güvenli bir Stripe sayfası açılır. Yeni kartı bir ödeme yöntemi olarak ekleyin ve varsayılan olarak işaretleyin. 4. İsterseniz eski kartı kaldırın.",
              "Bir sonraki faturalandırma döneminden itibaren her şey yeni karta gider. Önceki ücret, zaten tahsil edildiği için, eski kartta kalır. Kartı değiştirmek o ücreti taşımaz ve bir sonraki faturalandırma tarihinizi değiştirmez.",
            ],
          },
          {
            id: "cancel",
            q: "Aboneliğimi nasıl iptal ederim?",
            a: [
              "Kendiniz, istediğiniz zaman. Giriş yapın, \"Hesap\" bölümünü açın ve planınızın altındaki Aboneliği iptal et seçeneğine dokunun.",
              "Aboneliği iPhone veya iPad uygulamasında mı satın aldınız? Apple abonelik ayarlarınızdan iptal edin. \"Hesap\" sayfanızdaki \"Aboneliği yönet\" bağlantısı sizi oraya götürür.",
              "Ücretli bir abonelikte erişiminiz, ödemesini yaptığınız dönemin sonuna kadar devam eder. Ardından hesap Basic'e, ücretsiz sürüme geçer. Kaydettiğiniz kelimeler ve geçmişiniz güvende kalır.",
              "14 günlük ücretsiz deneme sırasında iptal etmek denemeyi hemen sona erdirir ve hiçbir ücret alınmaz. Tek endişeniz otomatik tahsilatsa iptal penceresinde bu nedeni seçin. Böylece yenilemeyi kapatıp denemeyi son gününe kadar kullanmaya devam edebilirsiniz.",
              "Ücretli bir aboneliği yanlışlıkla iptal ettiyseniz veya fikrinizi değiştirdiyseniz, dönem bitmeden aynı sayfadan yeniden sürdürebilirsiniz.",
            ],
          },
          {
            id: "switch-plan",
            q: "Individual ile Family arasında nasıl geçiş yaparım?",
            a: [
              "Family'ye geçmek için Hesap sayfanızı açın ve \"Family'ye geç\" seçeneğine dokunun. Mevcut aboneliğiniz, kartınızı yeniden girmenize gerek kalmadan aynı kart üzerinden güncellenir.",
              "Stripe, mevcut dönemde kalan günler için farkı hesaplar, böylece yalnızca farkı ödersiniz. Family'den Individual'a geçmek için bu sayfadan bize yazın, ekip geçişi sizin için yapsın.",
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
              "Evet, hesabınızdaki ilk ödemeden veya yıllık yenilemeden itibaren 14 gün içinde. Hesabınızın e-posta adresinden support@gadit.app adresine yazın, o ödemeyi size tam olarak iade edelim. Bir neden belirtmeniz gerekmez. İade aynı zamanda aboneliği de sonlandırır ve para, ödeme yaptığınız karta genelde 5 ila 10 iş günü içinde döner.",
              "14 günden sonra, yanlışlıkla ücret alınmadıysa veya yaşadığınız yerdeki yasa bunu gerektirmiyorsa ödemeler iade edilmez. Aboneliğin yenilenmemesi için istediğiniz zaman iptal edebilirsiniz ve ödediğiniz dönemin sonuna kadar kullanmaya devam edersiniz.",
              "iPhone veya iPad uygulamasında mı satın aldınız? Bu iadeleri Apple, reportaproblem.apple.com üzerinden yapar.",
            ],
          },
          {
            id: "unknown-charge",
            q: "Kartımdaki bu ödeme nedir?",
            a: [
              "Ödemeler GADIT veya GADIT.APP olarak görünür. Tutar, Fiyatlar sayfasında gösterildiği gibi, ülkenizin para biriminde planınıza (Individual veya Family, aylık veya yıllık) karşılık gelir. Ekim 2026'dan önce başlayan abonelikler başladıkları fiyatla devam eder. Tutar uyuşmuyorsa başka bir hizmetten olabilir.",
              "Sizin olmadığından eminseniz henüz bankanız üzerinden itiraz etmeyin. Önce tarih ve tutarla birlikte bize doğrudan yazın. Ekip ödemeyi bulur, ne olduğunu açıklar ve gerekirse iade eder. Banka itirazı gelecekteki ödemeleri zorlaştırabilir, bu yüzden sorunu destek üzerinden çözmek genellikle daha hızlı ve daha güvenlidir.",
            ],
          },
          {
            id: "failed-payment",
            q: "Ödemem başarısız oldu. Ne yapmalıyım?",
            a: [
              "Stripe başarısız ödemeleri sonraki günlerde otomatik olarak birkaç kez yeniden dener. Çoğu sorun, banka blokajı kaldırdığında veya kartta yeterli bakiye olduğunda kendiliğinden çözülür.",
              "Sayfanın üstünde ücretlendirmenin gerçekleşmediğini söyleyen bir çubuk görünür ve erişiminiz birkaç gün daha açık kalır. Orada \"Kartı güncelle\" seçeneğine dokunun, çalışan bir kart girin, biz de ödemeyi hemen onunla tekrar deneriz. Aboneliğiniz zaten Basic'e düştüyse Fiyatlar sayfasından yeniden abone olabilirsiniz ve defteriniz olduğu gibi kalır.",
            ],
          },
          {
            id: "plan-comparison",
            q: "Basic, Individual ve Family arasındaki fark nedir?",
            a: [
              "Basic (ücretsiz): günde en fazla 10 kelime araması, tüm anlamlar, örnekler, deyimler, kelimenin kökeni, cümleden doğru anlam ve en fazla 30 kelimelik bir defter.",
              "Individual: tek kişi, tüm öğrenme araçları. Sınırsız arama, her anlam için bir görsel, her kelime için daha fazla örnek ve soru, geri bildirimle cümle kurma, Her kelime, Söyle, doğal bir sesle sesli okuma ve sesli arama, çevrimdışı kullanım, oyunlar, quiz'ler ve kelime düelloları, ayrıca sınav hazırlığı ve dikte ile akıllı pratik.",
              "Family: en fazla 5 çocuk ve ebeveynler için Individual'daki her şey, ayrıca Çocuk modu, her çocuk için ayrı bir alan, ödev yardımı ve her kelime için uyarı veren ebeveyn paneli. Okulların kendine ait bir planı var. Ülkenizin fiyatları ve 14 günlük ücretsiz deneme Fiyatlar sayfasında.",
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
            q: "Doğrulama e-postam gelmedi",
            a: [
              "Önce spam ve promosyonlar klasörlerine bakın. Gmail ve Outlook, siz birini \"Spam değil\" olarak işaretleyene kadar hesap e-postalarını bazen oraya yönlendirir.",
              "Orada da yoksa kayıt sırasında e-posta adresi yanlış yazılmış olabilir. Tekrar kaydolmayı deneyin ve adresi dikkatle kontrol edin. Google ile kaydolduysanız doğrulama e-postası gerekmez.",
            ],
          },
          {
            id: "forgot-password",
            q: "Şifremi unuttum",
            a: [
              "Giriş penceresinde e-posta adresinizi yazın, sonra \"Parolanı mı unuttun?\" seçeneğine dokunun. Sıfırlama bağlantısı genelde bir iki dakika içinde gelen kutunuza gelir. İsterseniz \"Bana e-postayla giriş bağlantısı gönder\" seçeneğine de dokunup şifresiz giriş yapabilirsiniz.",
              "E-posta gelmezse spam klasörünü kontrol edin. Hâlâ gelmiyorsa, e-posta ve şifre yerine Google ile kaydolmuş olabilirsiniz. \"Google ile devam et\" düğmesini deneyin.",
            ],
          },
          {
            id: "wrong-credentials",
            q: "Şifremin doğru olduğundan eminim ama \"E-posta veya şifre yanlış\" diyor",
            a: [
              "Kontrol edilecek üç şey var. Birincisi, Caps Lock. İkincisi, kopyalayıp yapıştırdıktan sonra sonda kalan fazladan boşluk. Üçüncüsü, şifre yerine Google ile kaydolmuş olabilirsiniz, bu durumda \"Google ile devam et\" kullanın.",
              "Hâlâ olmuyor mu? Aynı mesajda \"Bana e-postayla giriş bağlantısı gönder\" seçeneğine dokunup şifresiz giriş yapın veya \"Yeni şifre belirle\" seçeneğini kullanın.",
            ],
          },
          {
            id: "google-fails",
            q: "Google ile oturum açma çalışmıyor",
            a: [
              "Instagram, Facebook veya TikTok gibi uygulamaların içinde Google düğmesi gizli olur. Bağlantıyı normal tarayıcınızda açın veya e-postanızla giriş yapın. Google ile kaydolduysanız, o e-posta adresini yazıp \"Bana e-postayla giriş bağlantısı gönder\" seçeneğine dokunun.",
              "Gizli pencerede engellenen cookies, Google ile giriş yapmayı durdurabilir. Normal bir pencere deneyin.",
            ],
          },
          {
            id: "change-email",
            q: "Hesabımdaki e-postayı nasıl değiştiririm?",
            a: [
              "Hesabınızdaki e-postayı ekip değiştirir. Bize mevcut adresinizden e-posta gönderin ve mesajda yeni adresi yazın. Ekip günceller. Aboneliğiniz, geçmişiniz ve defteriniz olduğu gibi kalır.",
            ],
          },
          {
            id: "delete-account",
            q: "Hesabımı nasıl silerim?",
            a: [
              "\"Hesap\" sayfasının en altında \"Hesabı sil\" seçeneğine dokunun ve onay için hesap e-posta adresinizi yazın. Bu kalıcıdır. Aboneliğiniz iptal edilir, defteriniz ve geçmişiniz silinir ve e-posta adresiniz yeni bir kayıt için yeniden kullanılabilir.",
              "Tek istisna, App Store üzerinden alınmış bir aboneliktir. Hesabı silmek onu iptal etmez, bu yüzden önce Apple abonelik ayarlarınızdan iptal edin.",
              "Geçmiş ücretlendirme kayıtları kalır, çünkü yasa bunları muhasebe için saklamamızı gerektirir.",
            ],
          },
          {
            id: "share-account",
            q: "Eşim veya çocuğum hesabımı paylaşabilir mi?",
            a: [
              "Bir hesapta aynı anda tek bir kişi oturum açabilir. Bir aile için Family planı tam da bunun için tasarlandı: en fazla 5 çocuk ve ebeveynler, her birinin kendi alanı, kendi defteri ve ilerlemesi, ayrıca çocuklar için Çocuk modu ve bir ebeveyn paneli.",
              "Tek başına bir yetişkin için Individual, tüm öğrenme araçlarıyla bir kişiyi kapsar. Planları ve ülkenizin fiyatlarını Fiyatlar sayfasında karşılaştırın.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "Sanırım yanlışlıkla iki hesabım var. Şimdi ne yapmalıyım?",
            a: [
              "Bu genelde biri aynı adresle bir kez Google ile, bir kez de e-posta ve şifreyle kaydolduğunda veya iki farklı e-posta adresiyle iki kez kaydolduğunuzda olur. Her kayıt, kendi defteri, geçmişi ve abonelik durumu olan ayrı bir Gadit hesabı oluşturur.",
              "Bize iki adresten birinden e-posta gönderin ve mesajda diğer adresi ve hangi hesabı tutmak istediğinizi yazın. Ekip defterleri ve geçmişi seçtiğiniz hesapta birleştirir, sonra diğerini temiz şekilde kapatır. Hiçbir veri kaybolmaz.",
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
              "Her anlamın yanında, ayrıca deyimler ve kelime kökeni kartlarında küçük bir bayrak simgesi vardır. Ona dokunun, neyin yanlış olduğunu seçin ve isterseniz kısa bir not ekleyin. Bildirim doğrudan ekibe gelir ve her bildirim incelenir.",
              "Fazla titiz olmaktan çekinmeyin. Sözlük en hızlı bu geri bildirimlerle gelişir.",
            ],
          },
          {
            id: "kids-not-working",
            q: "Çocuk modu açıklamayı değiştirmiyor",
            a: [
              "Çocuk modu, yalnızca kelimenin zaten çocuk dostu bir açıklaması varsa metni değiştirir. Bir kelimeye ilk kez baktıysanız, çocuklara uygun sürüm hazırlanırken 10 ila 15 saniye bekleyin.",
              "Çocuk modu Family planının bir parçasıdır. Individual'da onun yerine \"Basit kelimelerle\" anahtarını görürsünüz, bu da her anlam için daha basit bir açıklama verir. Basic'te veya hesap olmadan anahtar yoktur. Ekim 2026'dan önce Clear veya Deep'e katılan aboneler Çocuk modunu kullanmaya devam eder. Almak için Fiyatlar sayfasındaki Family planına bakın.",
            ],
          },
          {
            id: "voice-fails",
            q: "Sesli arama çalışmıyor",
            a: [
              "Sesli arama mikrofon izni gerektirir. Çoğu tarayıcı her site için bir kez sorar. Mikrofonu yanlışlıkla engellediyseniz, adres çubuğunda gadit.app yanındaki simgeye dokunun ve site izinlerinden mikrofonu açın.",
              "iPhone ve iPad'de cihazın Ayarlar uygulamasında Safari için de mikrofon izni vermeniz gerekir. Sesli arama Individual ve Family planlarının bir parçasıdır, bu yüzden Basic'te ve hesapsız kullanımda mikrofon düğmesi görünmez. Yükseltmek için Fiyatlar sayfasını açın.",
            ],
          },
          {
            id: "no-image",
            q: "Kelime için görsel alamıyorum",
            a: [
              "Görseller Individual ve Family planlarının bir parçasıdır ve ayda en fazla 100 yeni görsel içerir. O anlam için zaten var olan bir görsel sayılmadan açılır. Eski Clear planında ayda 30 görsel vardır, Basic ise görsel içermez. Ayın görselleri bittiğinde bir bildirim görürsünüz ve sayaç her ayın başında yeniden başlar.",
              "Kotanın altındaysanız ve yine hata görüyorsanız bu genellikle geçicidir. 30 saniye sonra tekrar deneyin. Sürekli tekrarlayan hatalar bir yazılım hatasıdır. Lütfen kelime sayfasından bildirin.",
            ],
          },
          {
            id: "save-word",
            q: "Bir kelimeyi defterime nasıl kaydederim?",
            a: [
              "Buna gerek yok. Oturum açtığınızda, aradığınız her kelime defterinize kendiliğinden kaydedilir. Basic'te defter en fazla 30 kelime alır. Individual ve Family'de sınır yoktur ve kelimelerinizi doğru zamanda tekrar için geri getiren akıllı pratik de vardır.",
              "Individual ve Family'de aradığınız kelimeler cihazınızda da saklanır, böylece internet olmadan açılır. Kelimelerinizi görmek için menüden defteri açın.",
            ],
          },
          {
            id: "offline",
            q: "Çevrimdışı mod nasıl çalışır?",
            a: [
              "Çevrimdışı kullanım Individual ve Family planlarının bir parçasıdır. Aradığınız her kelime cihazınızda saklanır, böylece internet olmadan anında yeniden açılır. Ayrıca \"Hesap\" sayfanızda \"Çevrimdışı paketi indir\" seçeneğine dokunarak sözlüğümüzün sizin dilinizdeki kelimelerini bu cihaza kaydedebilirsiniz.",
              "Yepyeni bir kelimeyi aramak yine bağlantı gerektirir, çünkü Gadit'in onun için tam sonucu hazırlaması gerekir. Çevrimdışı kopya, cihazınızda zaten bulunan kelimeleri kapsar. Basic kullanıyorsanız Fiyatlar sayfasındaki planlara göz atın.",
            ],
          },
          {
            id: "slow",
            q: "Uygulama yavaş geliyor",
            a: [
              "Bir kelimenin ilk araması en yavaşıdır, çünkü Gadit sonucun tamamını sıfırdan oluşturur: genellikle birkaç saniye, karmaşık kelimelerde bazen daha uzun. Aynı kelimenin sonraki aramaları önbellekten anında gelir.",
              "Her şey yavaş geliyorsa sert yenileme deneyin: Mac'te Cmd+Shift+R, Windows'ta Ctrl+Shift+R. Yavaşlık farklı sayfalarda da sürerse, ekibin bölgenizden sunucularımıza giden ağ rotasını kontrol edebilmesi için ülkenizi ve tarayıcınızı belirterek bize e-posta gönderin.",
            ],
          },
          {
            id: "word-not-found",
            q: "Bir kelime aradım ve sonuç çıkmadı. Ne oluyor?",
            a: [
              "Önce yazımı kontrol edin. Yazım hatası varsa, Gadit genelde düzeltilmiş kelimeyi gösterir ve yine de yazdığınız şeyi aramak için bir bağlantı sunar.",
              "Çok nadir kelimeler veya argo her zaman sonuç vermez. Kelimenin gerçekten var olduğundan eminseniz bu sayfadan bize yazın, ekip kontrol etsin.",
            ],
          },
          {
            id: "change-language",
            q: "Arayüz dilini nasıl değiştiririm?",
            a: [
              "Sayfanın üst kısmında mevcut dilinizle birlikte bir dünya simgesi vardır. Ona dokunun ve bir dil seçin.",
              "Seçiminiz bu cihaza kaydedilir. Her şey yeni dilde yeniden yüklenir, arayüz, menüler, gelecekteki kelime tanımları, örnekler, çocuk açıklamaları, hatta kelimenin kökeni bile. Daha önce eski dilde baktığınız kelimeler, onları yeniden arayana kadar o dilde görünür.",
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
              "gadit.app/partners adresine gidin ve \"Ücretsiz katıl\" seçeneğine dokunun. Adınızı ve e-posta adresinizi girin, sonra \"Partner kodumu al\" seçeneğine dokunun. Kişisel bağlantınız ve tıklamalarla komisyonları gösteren partner paneliniz hemen hazır olur, onay beklemeniz gerekmez. Kod ve bağlantı ayrıca e-postayla da gelir.",
              "Katılım ücretsizdir ve herkese açıktır. Ortak olmak için Gadit aboneliğine ihtiyacınız yoktur.",
            ],
          },
          {
            id: "commission-model",
            q: "Komisyonlar nasıl hesaplanır?",
            a: [
              "Standart koşullar, bir müşterinin ilk yılında yaptığı her ödemenin %25'idir. İlk yıldan sonra, müşteri ödemeye devam ettiği sürece her ödemenin %10'unu kazanırsınız. 5 ödeme yapan müşteri getirirseniz, ilk yıldan sonraki payınız ömür boyu %15'e çıkar.",
              "Bu, aylık ve yıllık planlarda aynı şekilde işler, çünkü komisyon her gerçek ödeme üzerinden hesaplanır. Müşteri iptal ederse komisyonunuz son ödemesiyle birlikte durur.",
              "Ekip belirli ortaklar için farklı oranlar belirleyebilir. Kendi oranlarınız her zaman partner panelinizde görünür.",
            ],
          },
          {
            id: "payout",
            q: "Ödememi ne zaman alırım?",
            a: [
              "Ayda bir, minimum tutar olmadan. Her komisyon, müşterinin ödemesinden 30 gün sonra ödenebilir hale gelir ve ödenebilir olan her şey, partner panelinizde belirttiğiniz PayPal hesabına bir sonraki aylık ödemede gönderilir.",
              "PayPal gönderebiliyorsa ödemeyi müşterinin ödediği para biriminde yaparız. Aksi halde, ödeme yaptığımız gündeki kur üzerinden US dollars olarak göndeririz.",
              "Komisyonlar iadeler nedeniyle 30 gün bekler. Bir müşterinin ödemesi iade edilirse, o ödeme için komisyon da iptal edilir. Yani Ocak ayındaki bir ödeme için komisyon Şubat ayında ödenebilir hale gelir ve bir sonraki aylık ödemede gönderilir.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "Katıldım ama panelim boş",
            a: [
              "İstatistikler bağlantınıza yapılan ilk tıklamadan sonra görünür. Boş olması yalnızca henüz kimsenin tıklamadığı anlamına gelir. Bağlantıyı paylaşın. Etkinlik başladığında panel neredeyse gerçek zamanlı güncellenir.",
              "Paylaştıysanız ve biri kaydolduysa ama panel bunu göstermiyorsa, yaklaşık kayıt zamanıyla bize yazın, ekip kaydın nereden geldiğini kontrol etsin.",
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
            q: "Biri bağlantım üzerinden kaydoldu ama komisyonu göremiyorum",
            a: [
              "Çoğu zaman bu bir zamanlama meselesidir. Kayıt birkaç dakika içinde panelde görünür, ancak komisyon yalnızca abonelik gerçekten ödendiğinde işlenir, ücretsiz denemedeyse bu günler sonra olabilir. Deneme süresi bittikten sonra tekrar kontrol edin.",
              "Abonelik ödendiyse ama 48 saat sonra hâlâ komisyonu görmüyorsanız, yaklaşık kayıt zamanı ve biliyorsanız abonenin e-postası veya yaklaşık adıyla bize yazın. Ekip kaydın nereden geldiğini kontrol eder ve gözden kaçan bir şeyi elle düzeltir.",
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
              "Gadit, tek satırlık bir tanım almakla kalmayıp her kelimeyi sonuna kadar anlamanıza yardımcı olur. Her kelime tüm anlamları, her anlam için gerçek örnekler, deyimler ve kelimenin kökeniyle açılır. Ücretli planlar her anlam için bir görsel, pratik, oyunlar ve daha fazlasını ekler, Family ise Çocuk modunu ve her çocuk için ayrı bir alanı ekler.",
              "Gadit 41 dilde çalışır. Ekip içinde buna \"bir kelimeyi GAD'lemek\" diyoruz: bir kelimeyi sadece çevirmek değil, sonuna kadar anlamak. Her planın neler içerdiğini görmek için Fiyatlar sayfasını açın.",
            ],
          },
          {
            id: "languages",
            q: "Hangi dilleri destekliyorsunuz?",
            a: [
              "Gadit, aralarında İngilizce, İbranice, Arapça, İspanyolca, Fransızca, Almanca, Rusça, Çince, Japonca, Hintçe, Zuluca, Xhosaca ve Afrikaancanın da bulunduğu 41 dilde çalışır.",
              "Bu dillerden herhangi birinde bir kelime arayabilir ve anlamları, örnekleri ve diğer her şeyi arayüz için seçtiğiniz dilde alabilirsiniz. İbranice, Arapça ve Farsça sağdan sola okunur ve kendi yazı tiplerini kullanır. Dili değiştirmek için herhangi bir sayfanın üstündeki dil düğmesine dokunun.",
            ],
          },
          {
            id: "kid-safety",
            q: "Gadit çocuklar için güvenli mi?",
            a: [
              "Gadit, bir ebeveynin çocukla birlikte güvenle kullanması için tasarlandı. Çocuk modu, basitleştirme yönünde açık talimatlarla yetişkin içeriğini üreten aynı motoru kullanarak basit, somut ve yaşa uygun, yaklaşık 5 ila 10 yaş düzeyinde, açıklamalar üretir. Kullanıcıların oluşturduğu hiçbir içerik çocuklara asla gösterilmez.",
              "Kendi hesabınız yalnızca 18 yaş ve üzeri yetişkinler içindir. Çocuklar ve gençler Gadit'i bir yetişkin üzerinden kullanır. Evde ebeveyn her çocuğu Family sayfasından ekler, her çocuk Çocuk moduyla kendine ait bir alan alır ve ebeveyn paneli her çocuğun aradığı kelimeleri gösterir. Okulda ise sınıf öğretmenden bir bağlantı alır ve öğrenciler hesap veya e-posta adresi olmadan katılır.",
            ],
          },
          {
            id: "data",
            q: "Verilerim nerede saklanıyor? Onları satıyor musunuz?",
            a: [
              "Hesap, geçmiş, defter ve oluşturulan görseller Firebase'de güvenli şekilde ve depolamada şifrelenmiş olarak saklanır. Verilerinizi kimseye satmıyoruz. Gizlilik Politikası'nda açıklandığı gibi yalnızca Gadit'i çalıştırmak için gerekenleri paylaşıyoruz (depolama, ödemeler, içerik sağlayıcılar).",
              "Hesabınızı istediğiniz zaman Hesap sayfasından silebilirsiniz. Defterinizin veya sakladığımız diğer verilerin bir kopyasını almak için bu sayfadan bize yazın.",
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
    heading: "Szybko znajdź odpowiedź",
    lede: "Najczęstsze pytania i rozwiązania krok po kroku, pogrupowane według tematów. Jeśli nie widzisz swojego problemu, skontaktuj się z zespołem na dole strony.",
    stillNeedHelpHeading: "Nadal potrzebujesz pomocy?",
    stillNeedHelpBody: "Napisz do nas bezpośrednio. Zespół czyta każdą wiadomość i zwykle odpowiada w ciągu dnia lub dwóch.",
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
              "Możesz przejść na nową kartę w niecałą minutę, bez anulowania. Twoja obecna subskrypcja działa dalej, tylko na nowej karcie.",
              "1. Zaloguj się na gadit.app i otwórz \"Konto\" z menu konta. 2. Kliknij \"Zarządzaj płatnościami\". 3. Otworzy się bezpieczna strona Stripe. Dodaj nową kartę jako metodę płatności i ustaw ją jako domyślną. 4. Opcjonalnie usuń starą kartę.",
              "Od następnego okresu rozliczeniowego wszystko będzie pobierane z nowej karty. Poprzednia płatność, już pobrana, pozostaje na starej karcie. Zmiana karty nie przenosi tej płatności i nie zmienia daty następnego rozliczenia.",
            ],
          },
          {
            id: "cancel",
            q: "Jak anulować subskrypcję?",
            a: [
              "Samodzielnie, w dowolnym momencie. Zaloguj się, otwórz Konto i dotknij Anuluj subskrypcję pod swoim planem.",
              "Kupiono subskrypcję w aplikacji na iPhone lub iPadzie? Anuluj ją w ustawieniach subskrypcji Apple. Link \"Zarządzaj subskrypcją\" na stronie Konta przeniesie Cię właśnie tam.",
              "W płatnej subskrypcji dostęp trwa do końca okresu, za który już zapłacono. Potem konto przechodzi na plan Basic, bezpłatny. Twoje zapisane słowa i historia pozostają bezpieczne.",
              "W trakcie 14-dniowego bezpłatnego okresu próbnego anulowanie od razu kończy okres próbny i nic nie zostaje pobrane. Jeśli martwi Cię tylko automatyczna płatność, wybierz ten powód w oknie anulowania. Wtedy możesz wyłączyć odnowienie i korzystać z okresu próbnego do ostatniego dnia.",
              "Jeśli anulujesz płatną subskrypcję przez pomyłkę lub zmienisz zdanie, możesz ją wznowić na tej samej stronie przed końcem okresu.",
            ],
          },
          {
            id: "switch-plan",
            q: "Jak przejść między Individual a Family?",
            a: [
              "Aby przejść na Family, otwórz stronę Konto i dotknij „Przejdź na Family”. Twoja obecna subskrypcja zostanie zaktualizowana na tej samej karcie, bez ponownego wpisywania danych.",
              "Stripe wylicza różnicę za dni pozostałe w bieżącym okresie, więc płacisz tylko różnicę. Aby przejść z Family na Individual, napisz do nas z tej strony, a zespół zmieni plan za Ciebie.",
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
              "Tak, w ciągu 14 dni od pierwszej płatności na koncie albo od rocznego odnowienia. Napisz do support@gadit.app z adresu e-mail przypisanego do konta, a zwrócimy tę płatność w całości. Nie musisz podawać powodu. Zwrot kończy też subskrypcję, a pieniądze wracają na kartę, którą była opłacona, zwykle w ciągu 5 do 10 dni roboczych.",
              "Po 14 dniach płatności nie podlegają zwrotowi, chyba że opłata została pobrana przez pomyłkę albo prawo w kraju, w którym mieszkasz, tego wymaga. Możesz anulować w każdej chwili, żeby subskrypcja się nie odnowiła, i zachowasz dostęp do końca opłaconego okresu.",
              "Kupiono w aplikacji na iPhone lub iPadzie? Zwroty obsługuje Apple na stronie reportaproblem.apple.com.",
            ],
          },
          {
            id: "unknown-charge",
            q: "Co to za płatność na mojej karcie?",
            a: [
              "Płatności widnieją jako GADIT lub GADIT.APP. Kwota odpowiada Twojemu planowi (Individual lub Family, miesięcznie lub rocznie) w walucie Twojego kraju, tak jak na stronie Cennik. Subskrypcje rozpoczęte przed październikiem 2026 zachowują cenę z dnia rozpoczęcia. Jeśli kwota się nie zgadza, płatność może pochodzić z innej usługi.",
              "Jeśli masz pewność, że to nie Twoja płatność, nie zgłaszaj jeszcze reklamacji w banku. Najpierw napisz bezpośrednio do nas, podając datę i kwotę. Zespół ją znajdzie, wyjaśni, czego dotyczy, i w razie potrzeby zwróci pieniądze. Reklamacja bankowa może utrudnić przyszłe płatności, więc rozwiązanie sprawy przez wsparcie jest zwykle szybsze i bezpieczniejsze.",
            ],
          },
          {
            id: "failed-payment",
            q: "Moja płatność się nie powiodła. Co robić?",
            a: [
              "Stripe automatycznie ponawia nieudane płatności kilka razy w kolejnych dniach. Większość problemów rozwiązuje się sama, gdy bank zdejmie blokadę lub na karcie pojawią się wystarczające środki.",
              "Na górze strony pojawi się pasek z informacją, że płatność się nie udała, a dostęp zostanie utrzymany jeszcze przez kilka dni. Dotknij tam \"Zaktualizuj kartę\", wpisz działającą kartę, a od razu spróbujemy obciążyć ją tą płatnością. Jeśli subskrypcja już wróciła do planu Basic, możesz wykupić ją ponownie na stronie cennika, a Twój notatnik pozostanie bez zmian.",
            ],
          },
          {
            id: "plan-comparison",
            q: "Czym różnią się Basic, Individual i Family?",
            a: [
              "Basic (bezpłatny): do 10 wyszukań słów dziennie, wszystkie znaczenia, przykłady, idiomy, pochodzenie słowa, właściwe znaczenie ze zdania i notatnik do 30 słów.",
              "Individual: jedna osoba, wszystkie narzędzia do nauki. Nielimitowane wyszukiwania, obrazek do każdego znaczenia, więcej przykładów i pytań do każdego słowa, układanie zdania z informacją zwrotną, Każde słowo, Powiedz to, naturalny głos lektora i wyszukiwanie głosowe, korzystanie offline, gry, quizy i pojedynki na słowa oraz inteligentna praktyka z przygotowaniem do testów i dyktandami.",
              "Family: wszystko z Individual dla maksymalnie 5 dzieci i rodziców, a do tego tryb dla dzieci, osobna przestrzeń dla każdego dziecka, pomoc w pracach domowych i panel rodzica z powiadomieniem o każdym słowie. Szkoły mają własny plan. Ceny dla Twojego kraju i 14-dniowy bezpłatny okres próbny znajdziesz na stronie Cennik.",
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
            q: "Nie dotarł e-mail weryfikacyjny",
            a: [
              "Najpierw sprawdź foldery Spam i Oferty. Gmail i Outlook czasem przenoszą tam e-maile dotyczące konta, dopóki nie oznaczysz jednego z nich jako „To nie spam”.",
              "Jeśli go tam nie ma, adres mógł zostać błędnie wpisany przy rejestracji. Spróbuj zarejestrować się ponownie i dokładnie sprawdź adres. Jeśli rejestracja była przez Google, e-mail weryfikacyjny nie jest potrzebny.",
            ],
          },
          {
            id: "forgot-password",
            q: "Nie pamiętam hasła",
            a: [
              "W oknie logowania wpisz swój adres e-mail, a potem dotknij \"Nie pamiętasz hasła?\". Link do resetu zwykle trafia do skrzynki w ciągu minuty lub dwóch. Możesz też dotknąć \"Wyślij mi link do logowania\" i zalogować się bez hasła.",
              "Jeśli e-mail nie dotrze, sprawdź spam. Jeśli nadal go nie ma, możliwe, że konto zostało utworzone przez Google, a nie przez e-mail i hasło. Spróbuj przycisku \"Kontynuuj z Google\".",
            ],
          },
          {
            id: "wrong-credentials",
            q: "Hasło na pewno jest poprawne, ale widzę komunikat, że e-mail i hasło do siebie nie pasują",
            a: [
              "Sprawdź trzy rzeczy. Po pierwsze, Caps Lock. Po drugie, dodatkową spację na końcu po skopiowaniu i wklejeniu. Po trzecie, czy rejestracja nie była przez Google zamiast przez hasło, wtedy użyj \"Kontynuuj z Google\".",
              "Nadal nie działa? W tym samym komunikacie dotknij \"Wyślij mi link do logowania\", aby wejść bez hasła, albo \"Ustaw nowe hasło\".",
            ],
          },
          {
            id: "google-fails",
            q: "Logowanie przez Google nie działa",
            a: [
              "W aplikacjach takich jak Instagram, Facebook czy TikTok przycisk Google jest ukryty. Otwórz link w zwykłej przeglądarce albo zaloguj się e-mailem. Jeśli konto zostało utworzone przez Google, wpisz ten adres i dotknij \"Wyślij mi link do logowania\".",
              "W oknie prywatnym, incognito, zablokowane cookies mogą zatrzymać logowanie przez Google, więc spróbuj w zwykłym oknie.",
            ],
          },
          {
            id: "change-email",
            q: "Jak zmienić adres e-mail konta?",
            a: [
              "Zmianę adresu e-mail konta wykonuje zespół. Napisz do nas z obecnego adresu i podaj w wiadomości nowy adres. Zespół go zaktualizuje, a Twoja subskrypcja, historia i notatnik pozostaną bez zmian.",
            ],
          },
          {
            id: "delete-account",
            q: "Jak usunąć konto?",
            a: [
              "Na dole strony \"Konto\" dotknij \"Usuń konto\" i wpisz adres e-mail swojego konta, aby potwierdzić. To trwałe, subskrypcja zostanie anulowana, notatnik i historia usunięte, a adres e-mail znów będzie można użyć do nowej rejestracji.",
              "Jedyny wyjątek to subskrypcja kupiona w App Store, usunięcie konta jej nie anuluje, więc najpierw anuluj ją w ustawieniach subskrypcji Apple.",
              "Zapisy wcześniejszych obciążeń pozostają, bo prawo wymaga od nas przechowywania ich do celów księgowych.",
            ],
          },
          {
            id: "share-account",
            q: "Czy partner lub dziecko mogą korzystać z mojego konta?",
            a: [
              "Na jednym koncie może być naraz zalogowana jedna osoba. Dla całego domu stworzono plan Family: do 5 dzieci i rodzice, każdy z własną przestrzenią, własnym notatnikiem i postępami, a do tego tryb dla dzieci i panel rodzica.",
              "Dla jednej dorosłej osoby Individual obejmuje jedną osobę ze wszystkimi narzędziami do nauki. Porównaj plany i ceny dla Twojego kraju na stronie Cennik.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "Chyba mam przez pomyłkę dwa konta. Co teraz?",
            a: [
              "Zwykle dzieje się tak, gdy ktoś rejestruje się raz przez Google, a raz przez e-mail i hasło na ten sam adres, albo rejestruje się dwa razy na różne adresy e-mail. Każda rejestracja tworzy osobne konto Gadit z własnym notatnikiem, historią i stanem subskrypcji.",
              "Napisz do nas z jednego z tych dwóch adresów i podaj drugi adres oraz informację, które konto chcesz zachować. Zespół połączy notatniki i historię na wybranym koncie, a potem porządnie zamknie drugie. Żadne dane nie przepadną.",
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
              "Obok każdego znaczenia, a także na kartach idiomów i pochodzenia słowa, jest mała ikona flagi. Dotknij jej, wybierz, co jest nie tak, i jeśli chcesz, dodaj krótką uwagę. Trafia ona prosto do zespołu i każde zgłoszenie jest sprawdzane.",
              "Nie bój się drobiazgowości. Słownik poprawia się dzięki takim uwagom szybciej niż dzięki czemukolwiek innemu.",
            ],
          },
          {
            id: "kids-not-working",
            q: "Tryb dla dzieci nie zmienia wyjaśnienia",
            a: [
              "Tryb dla dzieci zmienia tekst tylko wtedy, gdy słowo ma już wyjaśnienie dla dzieci. Jeśli wyszukujesz słowo po raz pierwszy, odczekaj od 10 do 15 sekund, aż wersja dla dzieci będzie gotowa.",
              "Tryb dla dzieci jest częścią planu Family. W planie Individual zobaczysz zamiast niego przełącznik \"Prostymi słowami\", który pokazuje prostsze wyjaśnienie każdego znaczenia. W Basic albo bez konta nie ma żadnego przełącznika. Subskrybenci, którzy dołączyli do Clear lub Deep przed październikiem 2026, zachowują tryb dla dzieci. Aby go mieć, sprawdź Family na stronie cennika.",
            ],
          },
          {
            id: "voice-fails",
            q: "Wyszukiwanie głosowe nie działa",
            a: [
              "Wyszukiwanie głosowe wymaga zgody na dostęp do mikrofonu. Większość przeglądarek pyta o nią raz dla każdej strony. Jeśli mikrofon został zablokowany przez pomyłkę, dotknij ikony obok gadit.app na pasku adresu i zezwól na mikrofon w uprawnieniach witryny.",
              "Na iPhone i iPadzie trzeba też zezwolić na mikrofon dla Safari w aplikacji Ustawienia urządzenia. Wyszukiwanie głosowe jest częścią planów Individual i Family, więc w Basic i bez konta przycisk mikrofonu się nie pojawia. Aby przejść na wyższy plan, otwórz stronę cennika.",
            ],
          },
          {
            id: "no-image",
            q: "Nie mogę dostać obrazka do słowa",
            a: [
              "Obrazki są częścią planów Individual i Family, do 100 nowych obrazków miesięcznie. Obrazek, który już istnieje dla danego znaczenia, otwiera się bez wliczania do limitu. Starszy plan Clear ma 30 miesięcznie, a Basic nie obejmuje obrazków. Gdy obrazki na dany miesiąc się skończą, zobaczysz komunikat, a licznik zaczyna od nowa na początku każdego miesiąca.",
              "Jeśli limit nie jest wykorzystany, a błędy nadal występują, zwykle są chwilowe. Spróbuj ponownie za 30 sekund. Uporczywe błędy to usterka. Zgłoś ją ze strony słowa.",
            ],
          },
          {
            id: "save-word",
            q: "Jak zapisać słowo w notatniku?",
            a: [
              "Nie musisz tego robić. Po zalogowaniu każde wyszukane przez Ciebie słowo samo zapisuje się w notatniku. W Basic notatnik mieści do 30 słów. W Individual i Family nie ma limitu, a do tego jest inteligentna praktyka, która przypomina Ci słowa do powtórki we właściwym momencie.",
              "W Individual i Family wyszukane słowa są też przechowywane na Twoim urządzeniu, więc otwierają się bez internetu. Aby zobaczyć swoje słowa, otwórz notatnik z menu.",
            ],
          },
          {
            id: "offline",
            q: "Jak używać Gadit offline?",
            a: [
              "Korzystanie offline jest częścią planów Individual i Family. Każde wyszukane słowo jest przechowywane na Twoim urządzeniu, więc otwiera się ponownie natychmiast, bez internetu. Na stronie Konta możesz też dotknąć \"Pobierz pakiet offline\", aby zapisać na tym urządzeniu słowa z naszego słownika w Twoim języku.",
              "Wyszukanie zupełnie nowego słowa nadal wymaga połączenia, bo Gadit musi przygotować dla niego pełny wynik. Kopia offline obejmuje słowa, które już są na Twoim urządzeniu. Jeśli masz plan Basic, zobacz plany na stronie cennika.",
            ],
          },
          {
            id: "slow",
            q: "Aplikacja działa wolno",
            a: [
              "Pierwsze wyszukanie słowa trwa najdłużej, bo Gadit tworzy pełny wynik od zera: zwykle kilka sekund, czasem dłużej przy złożonych słowach. Kolejne wyszukania tego samego słowa są natychmiastowe, z pamięci podręcznej.",
              "Jeśli wolno działa wszystko, spróbuj twardego odświeżenia: Cmd+Shift+R na Macu, Ctrl+Shift+R na Windows. Jeśli spowolnienie utrzymuje się na różnych stronach, napisz do nas, podając kraj i przeglądarkę, żeby zespół mógł sprawdzić trasę sieciową z Twojego regionu do naszych serwerów.",
            ],
          },
          {
            id: "word-not-found",
            q: "Wyszukane słowo nie daje wyniku. Co się dzieje?",
            a: [
              "Najpierw sprawdź pisownię. Jeśli była literówka, Gadit zwykle pokazuje poprawione słowo wraz z linkiem do wyszukania tego, co zostało wpisane mimo wszystko.",
              "Bardzo rzadkie słowa albo slang nie zawsze dają wynik. Jeśli masz pewność, że słowo istnieje, napisz do nas z tej strony, a zespół to sprawdzi.",
            ],
          },
          {
            id: "change-language",
            q: "Jak zmienić język interfejsu?",
            a: [
              "U góry strony jest ikona globusa z bieżącym językiem. Dotknij jej i wybierz język.",
              "Twój wybór zapisuje się na tym urządzeniu. Wszystko wczytuje się w nowym języku, interfejs, menu, przyszłe definicje słów, przykłady, wyjaśnienia dla dzieci, a nawet pochodzenie słowa. Słowa wyszukane wcześniej w starym języku pozostaną w nim, dopóki nie wyszukasz ich ponownie.",
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
              "Wejdź na gadit.app/partners i dotknij \"Dołącz za darmo\". Wpisz swoje imię i adres e-mail, a potem dotknij \"Odbierz mój kod partnera\". Twój osobisty link i panel partnera, z kliknięciami i prowizjami, będą gotowe od razu, bez czekania na akceptację. Kod i link dostaniesz też e-mailem.",
              "Dołączenie jest bezpłatne i otwarte dla każdego. Aby zostać partnerem, nie potrzebujesz subskrypcji Gadit.",
            ],
          },
          {
            id: "commission-model",
            q: "Jak obliczane są prowizje?",
            a: [
              "Standardowe warunki to 25% każdej płatności klienta w jego pierwszym roku. Po pierwszym roku otrzymujesz 10% każdej płatności tak długo, jak klient płaci. Jeśli przyprowadzisz 5 płacących klientów, Twoja stawka po pierwszym roku wzrośnie do 15% na stałe.",
              "Działa to tak samo w planach miesięcznych i rocznych, bo prowizja liczona jest od każdej faktycznej płatności. Jeśli klient anuluje, Twoja prowizja kończy się wraz z jego ostatnią płatnością.",
              "Zespół może ustalić inne stawki dla konkretnych partnerów. Twoje stawki zawsze widać w panelu partnera.",
            ],
          },
          {
            id: "payout",
            q: "Kiedy dostanę wypłatę?",
            a: [
              "Raz w miesiącu, bez minimum. Każda prowizja staje się należna 30 dni po płatności klienta, a wszystko, co jest już należne, wysyłamy w najbliższej miesięcznej wypłacie na konto PayPal ustawione w panelu partnera.",
              "Płacimy w walucie, w której zapłacił klient, jeśli PayPal może ją wysłać, a w innym przypadku w dolarach amerykańskich, według kursu z dnia wypłaty.",
              "Prowizje czekają 30 dni ze względu na zwroty. Jeśli płatność klienta zostanie zwrócona, prowizja od niej jest anulowana. Dlatego prowizja od płatności ze stycznia staje się należna w lutym i trafia do najbliższej miesięcznej wypłaty.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "Dołączenie się udało, ale panel jest pusty",
            a: [
              "Statystyki pojawiają się po pierwszym kliknięciu w Twój link. Pusty panel oznacza tylko, że nikt jeszcze nie kliknął. Udostępnij link. Gdy zacznie się aktywność, panel aktualizuje się niemal w czasie rzeczywistym.",
              "Jeśli link został udostępniony i ktoś się zarejestrował, ale panel tego nie pokazuje, napisz do nas z przybliżonym czasem rejestracji, a zespół sprawdzi, skąd przyszła rejestracja.",
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
            q: "Ktoś zarejestrował się z mojego linku, ale nie widzę prowizji",
            a: [
              "Najczęściej chodzi o czas, rejestracja pojawia się w panelu w ciągu kilku minut, ale prowizja jest naliczana dopiero po faktycznym opłaceniu subskrypcji, co może nastąpić kilka dni później, jeśli ta osoba korzysta z bezpłatnego okresu próbnego. Sprawdź ponownie po zakończeniu okresu próbnego.",
              "Jeśli subskrypcja została opłacona, a po 48 godzinach nadal nie widzisz prowizji, napisz do nas z przybliżonym czasem rejestracji oraz adresem e-mail lub przybliżonym imieniem subskrybenta, jeśli je znasz. Zespół sprawdzi, skąd przyszła rejestracja, i ręcznie naprawi każdy brak.",
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
              "Gadit pomaga zrozumieć każde słowo do samego końca, a nie tylko dostać jednolinijkową definicję. Każde słowo otwiera się ze wszystkimi znaczeniami, prawdziwymi przykładami do każdego znaczenia, idiomami i pochodzeniem słowa. Płatne plany dodają obrazek do każdego znaczenia, praktykę, gry i więcej, a Family dodaje tryb dla dzieci i osobną przestrzeń dla każdego dziecka.",
              "Gadit działa w 41 językach. W zespole mówimy na to „zrobić GAD słowu”: zrozumieć słowo do samego końca, a nie tylko je przetłumaczyć. Aby zobaczyć, co obejmuje każdy plan, otwórz stronę Cennik.",
            ],
          },
          {
            id: "languages",
            q: "Jakie języki obsługujecie?",
            a: [
              "Gadit działa w 41 językach, wśród nich: angielski, hebrajski, arabski, hiszpański, francuski, niemiecki, rosyjski, chiński, japoński, hindi, zulu, xhosa i afrikaans.",
              "Możesz wyszukać słowo w każdym z tych języków i otrzymać znaczenia, przykłady i całą resztę w języku wybranym dla interfejsu. Hebrajski, arabski i perski czyta się od prawej do lewej, a każdy ma własne czcionki. Aby zmienić język, dotknij przycisku języka u góry dowolnej strony.",
            ],
          },
          {
            id: "kid-safety",
            q: "Czy Gadit jest bezpieczny dla dzieci?",
            a: [
              "Gadit powstał z myślą o tym, by rodzic mógł bezpiecznie korzystać z niego razem z dzieckiem. Tryb dla dzieci tworzy wyjaśnienia proste, konkretne i dostosowane do wieku, mniej więcej na poziomie 5 do 10 lat, korzystając z tego samego silnika co treści dla dorosłych, z wyraźnymi instrukcjami upraszczania. Dzieciom nigdy nie są pokazywane treści tworzone przez użytkowników.",
              "Własne konto jest dla dorosłych, od 18. roku życia. Dzieci i nastolatki korzystają z Gadit przez dorosłego. W domu rodzic dodaje każde dziecko na stronie Family, każde dziecko dostaje własną przestrzeń z trybem dla dzieci, a panel rodzica pokazuje słowa, które wyszukuje każde dziecko. W szkole klasa dostaje link od nauczyciela, a uczniowie dołączają bez konta i bez adresu e-mail.",
            ],
          },
          {
            id: "data",
            q: "Gdzie są przechowywane moje dane? Czy je sprzedajecie?",
            a: [
              "Konto, historia, notatnik i wygenerowane obrazki są bezpiecznie przechowywane w Firebase, w postaci zaszyfrowanej. Nie sprzedajemy Twoich danych nikomu. Udostępniamy tylko to, co potrzebne do działania Gadit (przechowywanie, płatności, dostawcy treści), zgodnie z Polityką prywatności.",
              "W dowolnym momencie możesz usunąć konto na stronie Konto. Aby dostać kopię notatnika lub innych danych, które przechowujemy, napisz do nas z tej strony.",
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
    heading: "پاسخ را سریع پیدا کنید",
    lede: "پرسش‌های رایج و راه‌حل‌های گام‌به‌گام، دسته‌بندی‌شده بر اساس موضوع. اگر مشکل‌تان را اینجا نمی‌بینید، از پایین صفحه با تیم در تماس باشید.",
    stillNeedHelpHeading: "هنوز مشکل حل نشده؟",
    stillNeedHelpBody: "مستقیم برای ما بنویسید. تیم همه پیام‌ها را می‌خواند و معمولاً ظرف یکی دو روز پاسخ می‌دهد.",
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
              "1. در gadit.app وارد شوید و از منوی حساب، «حساب» را باز کنید. 2. روی «مدیریت صورت‌حساب» بزنید. 3. یک صفحه امن Stripe باز می‌شود. کارت جدید را به‌عنوان روش پرداخت اضافه کنید و آن را پیش‌فرض بگذارید. 4. اگر خواستید، کارت قبلی را حذف کنید.",
              "از چرخه صورتحساب بعدی به بعد، همه چیز روی کارت جدید می‌رود. مبلغ قبلی، که از قبل دریافت شده، روی کارت قبلی می‌ماند. عوض کردن کارت آن مبلغ را جابه‌جا نمی‌کند و تاریخ صورتحساب بعدی را هم تغییر نمی‌دهد.",
            ],
          },
          {
            id: "cancel",
            q: "چطور اشتراکم را لغو کنم؟",
            a: [
              "خودتان، هر وقت بخواهید. وارد شوید، حساب را باز کنید و زیر طرح خود روی لغو اشتراک بزنید.",
              "اشتراک را در اپ iPhone یا iPad خریده‌اید؟ آن را از تنظیمات اشتراک Apple لغو کنید. لینک «مدیریت اشتراک» در صفحه حساب شما را به همان‌جا می‌برد.",
              "در اشتراک پولی، دسترسی شما تا پایان دوره‌ای که پرداخت کرده‌اید ادامه دارد. بعد از آن حساب به Basic، رایگان، منتقل می‌شود. واژه‌های ذخیره‌شده و تاریخچه‌تان امن می‌مانند.",
              "در دوره آزمایشی رایگان 14 روزه، لغو کردن دوره آزمایشی را همان لحظه تمام می‌کند و هیچ مبلغی کسر نمی‌شود. اگر تنها نگرانی‌تان پرداخت خودکار است، همین دلیل را در پنجره لغو انتخاب کنید تا بتوانید تمدید را خاموش کنید و دوره آزمایشی را تا آخرین روزش نگه دارید.",
              "اگر اشتراک پولی را اشتباهی لغو کردید یا نظرتان عوض شد، می‌توانید پیش از پایان دوره از همان صفحه آن را از سر بگیرید.",
            ],
          },
          {
            id: "switch-plan",
            q: "چطور بین Individual و Family جابه‌جا شوم؟",
            a: [
              "برای رفتن به Family، صفحه «حساب» را باز کنید و روی «تغییر به Family» بزنید. اشتراک فعلی‌تان روی همان کارت به‌روزرسانی می‌شود و لازم نیست کارت را دوباره وارد کنید.",
              "Stripe اختلاف را بر اساس روزهای باقی‌مانده از دوره فعلی حساب می‌کند، پس فقط تفاوت را می‌پردازید. برای رفتن از Family به Individual، از همین صفحه برای ما بنویسید تا تیم آن را برایتان تغییر دهد.",
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
              "بله، تا 14 روز بعد از اولین پرداخت حساب‌تان، یا بعد از تمدید سالانه. از ایمیل حساب‌تان به support@gadit.app پیام بدهید و ما همان پرداخت را کامل پس می‌دهیم. لازم نیست دلیلی بدهید. با بازپرداخت، اشتراک هم پایان می‌یابد و پول به همان کارتی برمی‌گردد که با آن پرداخت کرده‌اید، معمولاً ظرف 5 تا 10 روز کاری.",
              "بعد از 14 روز، پرداخت‌ها بازپرداخت نمی‌شوند، مگر این‌که اشتباهی از شما مبلغ گرفته شده باشد یا قانون محل زندگی‌تان این را لازم بداند. هر وقت بخواهید می‌توانید لغو کنید تا اشتراک تمدید نشود، و تا پایان دوره‌ای که برایش پرداخت کرده‌اید فعال می‌ماند.",
              "خرید را در برنامه iPhone یا iPad انجام داده‌اید؟ بازپرداخت‌های آن را Apple در reportaproblem.apple.com انجام می‌دهد.",
            ],
          },
          {
            id: "unknown-charge",
            q: "این پرداخت روی کارت من چیست؟",
            a: [
              "پرداخت‌ها با نام GADIT یا GADIT.APP نمایش داده می‌شوند. مبلغ با طرح شما (Individual یا Family، ماهانه یا سالانه) به ارز کشورتان مطابقت دارد، همان‌طور که در صفحه «قیمت‌ها» آمده است. اشتراک‌هایی که پیش از اکتبر 2026 شروع شده‌اند، با همان قیمت اولیه ادامه پیدا می‌کنند. اگر مبلغ مطابقت ندارد، ممکن است از سرویس دیگری باشد.",
              "اگر مطمئنید که مال شما نیست، فعلاً از طریق بانک اعتراض نکنید. اول مستقیم با ذکر تاریخ و مبلغ برای ما بنویسید. تیم آن را پیدا می‌کند، توضیح می‌دهد چیست و در صورت نیاز بازپرداخت می‌کند. اعتراض بانکی ممکن است پرداخت‌های آینده را دشوارتر کند، پس حل آن از طریق پشتیبانی معمولاً سریع‌تر و امن‌تر است.",
            ],
          },
          {
            id: "failed-payment",
            q: "پرداختم ناموفق بود. چه کار کنم؟",
            a: [
              "Stripe طی چند روز بعد، پرداخت‌های ناموفق را چند بار به‌طور خودکار دوباره امتحان می‌کند. بیشتر این موارد وقتی بانک مسدودی را بردارد یا کارت موجودی کافی داشته باشد، خودبه‌خود حل می‌شوند.",
              "بالای صفحه یک نوار نشان می‌دهد که پرداخت انجام نشده، و دسترسی شما چند روز دیگر هم حفظ می‌شود. همان‌جا روی «به‌روزرسانی کارت» بزنید، یک کارت معتبر وارد کنید و ما همان لحظه دوباره پرداخت را با آن امتحان می‌کنیم. اگر اشتراک‌تان قبلاً به Basic برگشته، می‌توانید از صفحه قیمت‌ها دوباره مشترک شوید و دفترچه‌تان دست‌نخورده می‌ماند.",
            ],
          },
          {
            id: "plan-comparison",
            q: "تفاوت Basic، Individual و Family چیست؟",
            a: [
              "Basic (رایگان): تا 10 جستجوی واژه در روز، همه معانی، مثال‌ها، اصطلاحات، ریشه واژه، معنای درست از روی جمله و دفترچه‌ای تا 30 واژه.",
              "Individual: برای یک نفر، با همه ابزارهای یادگیری. جستجوی نامحدود، تصویر برای هر معنا، مثال‌ها و پرسش‌های بیشتر برای هر واژه، ساختن جمله همراه با بازخورد، هر واژه، بگو، خواندن با صدای طبیعی و جستجوی صوتی، استفاده آفلاین، بازی‌ها، آزمونک‌ها و دوئل واژه‌ها، و تمرین هوشمند با آمادگی آزمون و دیکته.",
              "Family: همه امکانات Individual برای حداکثر 5 کودک و والدین، به‌علاوه حالت کودک، فضای جداگانه برای هر کودک، کمک در تکالیف و پنل والدین با هشدار برای هر واژه. مدرسه‌ها طرح جداگانه خودشان را دارند. قیمت‌های کشور شما و دوره آزمایشی رایگان 14 روزه در صفحه «قیمت‌ها» آمده است.",
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
            q: "ایمیل تأیید به دستم نرسید",
            a: [
              "اول پوشه‌های هرزنامه و تبلیغات را بررسی کنید. Gmail و Outlook گاهی ایمیل‌های حساب را به آنجا می‌فرستند تا وقتی که یکی را «هرزنامه نیست» علامت بزنید.",
              "اگر آنجا هم نبود، شاید نشانی ایمیل هنگام ثبت‌نام اشتباه تایپ شده باشد. دوباره ثبت‌نام کنید و نشانی را با دقت بررسی کنید. اگر با Google ثبت‌نام کرده‌اید، ایمیل تأیید لازم نیست.",
            ],
          },
          {
            id: "forgot-password",
            q: "رمز عبورم را فراموش کرده‌ام",
            a: [
              "در پنجره ورود، ایمیل‌تان را وارد کنید و بعد روی «گذرواژه را فراموش کردی؟» بزنید. لینک بازنشانی معمولاً ظرف یکی دو دقیقه به صندوق ایمیل‌تان می‌رسد. همچنین می‌توانید روی «لینک ورود را به ایمیلم بفرستید» بزنید و بدون رمز عبور وارد شوید.",
              "اگر ایمیل نرسید، پوشه هرزنامه را بررسی کنید. اگر باز هم نرسید، شاید به‌جای ایمیل و رمز عبور با Google ثبت‌نام کرده‌اید. دکمه «ادامه با Google» را امتحان کنید.",
            ],
          },
          {
            id: "wrong-credentials",
            q: "مطمئنم رمز عبورم درست است، ولی پیام «ایمیل یا رمز عبور اشتباه است» می‌آید",
            a: [
              "سه چیز را بررسی کنید. اول، Caps Lock. دوم، فاصله اضافه در انتها بعد از کپی و چسباندن. سوم، شاید به‌جای رمز عبور با Google ثبت‌نام کرده‌اید، در این صورت از «ادامه با Google» استفاده کنید.",
              "هنوز گیر کرده‌اید؟ در همان پیام روی «لینک ورود را به ایمیلم بفرستید» بزنید تا بدون رمز عبور وارد شوید، یا «انتخاب رمز تازه» را بزنید.",
            ],
          },
          {
            id: "google-fails",
            q: "ورود با Google کار نمی‌کند",
            a: [
              "داخل اپ‌هایی مثل Instagram، Facebook یا TikTok، دکمه Google پنهان است. لینک را در مرورگر معمولی‌تان باز کنید یا با ایمیل‌تان وارد شوید. اگر با Google ثبت‌نام کرده‌اید، همان ایمیل را وارد کنید و روی «لینک ورود را به ایمیلم بفرستید» بزنید.",
              "در پنجره خصوصی، incognito، ممکن است کوکی‌های مسدودشده جلوی ورود با Google را بگیرند، پس یک پنجره معمولی را امتحان کنید.",
            ],
          },
          {
            id: "change-email",
            q: "چطور ایمیل حسابم را عوض کنم؟",
            a: [
              "تغییر ایمیل حساب از طریق تیم انجام می‌شود. از نشانی فعلی‌تان برای ما ایمیل بفرستید و نشانی جدید را در پیام بنویسید. تیم آن را به‌روز می‌کند و اشتراک، تاریخچه و دفترچه‌تان هم همان‌طور می‌مانند.",
            ],
          },
          {
            id: "delete-account",
            q: "چطور حسابم را حذف کنم؟",
            a: [
              "در پایین صفحه «حساب»، روی «حذف حساب» بزنید و برای تأیید، ایمیل حساب‌تان را وارد کنید. این کار دائمی است. اشتراک‌تان لغو می‌شود، دفترچه و تاریخچه‌تان پاک می‌شوند و ایمیل برای ثبت‌نام تازه آزاد می‌شود.",
              "تنها استثنا اشتراکی است که در App Store خریده‌اید. با حذف حساب، آن اشتراک لغو نمی‌شود، پس اول آن را در تنظیمات اشتراک Apple لغو کنید.",
              "سوابق پرداخت‌های گذشته باقی می‌ماند، چون قانون ما را موظف می‌کند آنها را برای حسابداری نگه داریم.",
            ],
          },
          {
            id: "share-account",
            q: "آیا همسر یا فرزندم می‌تواند از حساب من استفاده کند؟",
            a: [
              "در هر لحظه فقط یک نفر می‌تواند وارد یک حساب باشد. برای یک خانواده، طرح Family دقیقاً برای همین ساخته شده است: حداکثر 5 کودک و والدین، هر کدام با فضای خودش، دفترچه و پیشرفت خودش، به‌علاوه حالت کودک برای بچه‌ها و پنل والدین.",
              "برای یک بزرگسال که تنها از آن استفاده می‌کند، Individual یک نفر را با همه ابزارهای یادگیری پوشش می‌دهد. طرح‌ها و قیمت‌های کشورتان را در صفحه «قیمت‌ها» مقایسه کنید.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "فکر می‌کنم اشتباهی دو حساب دارم. حالا چه کنم؟",
            a: [
              "این معمولاً وقتی پیش می‌آید که کسی یک بار با Google و یک بار با ایمیل و رمز عبور، با همان نشانی ثبت‌نام کند، یا وقتی دو بار با دو نشانی ایمیل متفاوت ثبت‌نام می‌کنید. هر ثبت‌نام یک حساب جداگانه Gadit با دفترچه، تاریخچه و وضعیت اشتراک خودش می‌سازد.",
              "از یکی از آن دو نشانی برای ما ایمیل بفرستید و نشانی دیگر و این‌که می‌خواهید کدام حساب را نگه دارید هم بنویسید. تیم دفترچه و تاریخچه را به حسابی که انتخاب می‌کنید منتقل و ادغام می‌کند و بعد حساب دیگر را تمیز می‌بندد. هیچ داده‌ای از دست نمی‌رود.",
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
              "کنار هر معنی، و همین‌طور روی کارت‌های اصطلاح‌ها و ریشه واژه، یک آیکن کوچک پرچم هست. روی آن بزنید، مشخص کنید چه چیزی اشتباه است و اگر خواستید یک یادداشت کوتاه هم اضافه کنید. گزارش مستقیم به دست تیم می‌رسد و همه گزارش‌ها بررسی می‌شوند.",
              "نگران سخت‌گیری زیاد نباشید. فرهنگ لغت با این بازخوردها سریع‌تر از هر چیز دیگری بهتر می‌شود.",
            ],
          },
          {
            id: "kids-not-working",
            q: "حالت کودک توضیح را تغییر نمی‌دهد",
            a: [
              "حالت کودک فقط وقتی متن را عوض می‌کند که آن واژه از قبل توضیح مناسب کودک داشته باشد. اگر واژه‌ای را همین حالا برای اولین بار جستجو کرده‌اید، 10 تا 15 ثانیه صبر کنید تا نسخه مناسب کودک آماده شود.",
              "حالت کودک بخشی از طرح Family است. در Individual به‌جای آن کلید «به زبان ساده» را می‌بینید که برای هر معنی توضیح ساده‌تری می‌دهد. در Basic یا بدون حساب اصلاً کلیدی وجود ندارد. مشترکانی که پیش از اکتبر 2026 به Clear یا Deep پیوسته‌اند، حالت کودک را نگه می‌دارند. برای گرفتن آن، Family را در صفحه قیمت‌ها ببینید.",
            ],
          },
          {
            id: "voice-fails",
            q: "جستجوی صوتی کار نمی‌کند",
            a: [
              "جستجوی صوتی به اجازه میکروفون نیاز دارد. بیشتر مرورگرها برای هر سایت یک بار می‌پرسند. اگر اشتباهی آن را بسته‌اید، روی نماد کنار gadit.app در نوار نشانی بزنید و در مجوزهای سایت میکروفون را فعال کنید.",
              "در iPhone و iPad، باید برای Safari هم در برنامه Settings دستگاه اجازه میکروفون را فعال کنید. جستجوی صوتی بخشی از طرح‌های Individual و Family است، بنابراین در Basic و بدون حساب دکمه میکروفون دیده نمی‌شود. برای ارتقا، صفحه قیمت‌ها را باز کنید.",
            ],
          },
          {
            id: "no-image",
            q: "نمی‌توانم برای واژه تصویر بگیرم",
            a: [
              "تصاویر بخشی از طرح‌های Individual و Family هستند، با حداکثر 100 تصویر جدید در ماه. تصویری که از قبل برای آن معنا وجود دارد بدون شمارش باز می‌شود. طرح قدیمی Clear ماهی 30 تصویر دارد و Basic تصویر ندارد. وقتی تصاویر ماه تمام شود پیامی می‌بینید و شمارش در ابتدای هر ماه دوباره شروع می‌شود.",
              "اگر هنوز سهمیه دارید و باز هم خطا می‌بینید، معمولاً موقتی است. 30 ثانیه بعد دوباره امتحان کنید. خطاهای مداوم یعنی باگ. لطفاً از صفحه واژه گزارش دهید.",
            ],
          },
          {
            id: "save-word",
            q: "چطور واژه‌ای را در دفترچه‌ام ذخیره کنم؟",
            a: [
              "لازم نیست. وقتی وارد حساب شده‌اید، هر واژه‌ای که جستجو می‌کنید خودبه‌خود در دفترچه‌تان ذخیره می‌شود. در Basic دفترچه تا 30 واژه جا دارد. در Individual و Family محدودیتی ندارد و تمرین هوشمند هم دارد که واژه‌هایتان را در زمان مناسب برای مرور برمی‌گرداند.",
              "در Individual و Family، واژه‌هایی که جستجو می‌کنید روی دستگاه‌تان هم نگه داشته می‌شوند، پس بدون اینترنت هم باز می‌شوند. برای دیدن واژه‌هایتان، دفترچه را از منو باز کنید.",
            ],
          },
          {
            id: "offline",
            q: "چطور از Gadit به‌صورت آفلاین استفاده کنم؟",
            a: [
              "استفاده آفلاین بخشی از طرح‌های Individual و Family است. هر واژه‌ای که جستجو می‌کنید روی دستگاه شما نگه داشته می‌شود، پس بعداً بدون اینترنت هم فوری دوباره باز می‌شود. همچنین می‌توانید در صفحه «حساب» روی «دانلود بسته آفلاین» بزنید تا واژه‌های واژه‌نامه ما به زبان شما روی این دستگاه ذخیره شوند.",
              "جستجوی یک واژه کاملاً تازه هنوز به اتصال نیاز دارد، چون Gadit باید نتیجه کامل آن را آماده کند. نسخه آفلاین فقط واژه‌هایی را پوشش می‌دهد که از قبل روی دستگاه شما هستند. اگر در Basic هستید، طرح‌ها را در صفحه قیمت‌ها ببینید.",
            ],
          },
          {
            id: "slow",
            q: "برنامه کند به نظر می‌رسد",
            a: [
              "اولین جستجوی هر واژه کندترین است، چون Gadit نتیجه کامل را از صفر می‌سازد: معمولاً چند ثانیه، و برای واژه‌های پیچیده گاهی بیشتر. جستجوهای بعدی همان واژه فوری‌اند و از حافظه موقت ارائه می‌شوند.",
              "اگر همه‌چیز کند است، یک بازخوانی کامل (hard refresh) امتحان کنید: Cmd+Shift+R در Mac و Ctrl+Shift+R در Windows. اگر کندی در صفحه‌های مختلف ادامه داشت، لطفاً با ذکر کشور و مرورگرتان به ما ایمیل بزنید تا تیم مسیر شبکه از منطقه شما تا سرورهای ما را بررسی کند.",
            ],
          },
          {
            id: "word-not-found",
            q: "واژه‌ای را جستجو کردم و نتیجه‌ای نگرفتم. چه خبر است؟",
            a: [
              "اول املا را بررسی کنید. اگر غلط تایپی بوده باشد، Gadit معمولاً واژه درست را نشان می‌دهد، همراه با لینکی برای این‌که با همان چیزی که تایپ کرده‌اید هم جستجو کنید.",
              "واژه‌های خیلی نادر یا عامیانه همیشه نتیجه ندارند. اگر مطمئنید واژه وجود دارد، از همین صفحه برای ما بنویسید تا تیم بررسی کند.",
            ],
          },
          {
            id: "change-language",
            q: "چطور زبان رابط کاربری را عوض کنم؟",
            a: [
              "بالای صفحه یک نماد کره زمین با زبان فعلی‌تان هست. روی آن بزنید و یک زبان انتخاب کنید.",
              "انتخاب شما روی این دستگاه ذخیره می‌شود. همه‌چیز در زبان جدید دوباره بارگذاری می‌شود، رابط کاربری، منوها، تعریف‌های بعدی واژه‌ها، مثال‌ها، توضیح‌های کودکانه، حتی ریشه واژه. واژه‌هایی که قبلاً در زبان قبلی جستجو کرده‌اید، تا وقتی دوباره جستجویشان نکنید همان‌طور نمایش داده می‌شوند.",
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
              "به gadit.app/partners بروید و روی «رایگان بپیوند» بزنید. نام و ایمیل‌تان را وارد کنید، سپس روی «کد شریک من را بگیر» بزنید. لینک شخصی شما و داشبورد همکاری‌تان، با کلیک‌ها و پورسانت‌ها، فوراً آماده می‌شود و نیازی به انتظار برای تأیید نیست. کد و لینک از طریق ایمیل هم برایتان ارسال می‌شود.",
              "عضویت رایگان و برای همه آزاد است. برای همکار شدن به اشتراک Gadit نیاز ندارید.",
            ],
          },
          {
            id: "commission-model",
            q: "پورسانت‌ها چطور محاسبه می‌شوند؟",
            a: [
              "شرایط استاندارد، 25% از هر پرداختی است که مشتری در سال اول خود انجام می‌دهد. بعد از سال اول، تا وقتی مشتری به پرداخت ادامه دهد، 10% از هر پرداخت را دریافت می‌کنید. اگر 5 مشتریِ پرداخت‌کننده بیاورید، سهم شما بعد از سال اول برای همیشه به 15% می‌رسد.",
              "این برای طرح‌های ماهانه و سالانه یکسان است، چون پورسانت بر اساس هر پرداخت واقعی حساب می‌شود. اگر مشتری لغو کند، پورسانت شما با آخرین پرداخت او متوقف می‌شود.",
              "تیم می‌تواند برای همکاران مشخصی نرخ‌های متفاوتی تعیین کند. نرخ‌های خودتان همیشه در داشبورد همکاری‌تان نمایش داده می‌شود.",
            ],
          },
          {
            id: "payout",
            q: "کی پول دریافت می‌کنم؟",
            a: [
              "ماهانه، بدون حداقل مبلغ. هر پورسانت 30 روز بعد از پرداخت مشتری قابل پرداخت می‌شود و هر چه قابل پرداخت باشد در پرداخت ماهانه بعدی به حساب PayPal که در داشبورد شریک‌تان تنظیم کرده‌اید فرستاده می‌شود.",
              "اگر PayPal بتواند با همان ارزی که مشتری پرداخت کرده پول را بفرستد، ما هم با همان ارز پرداخت می‌کنیم. در غیر این صورت، پرداخت به دلار آمریکا انجام می‌شود، با نرخ تبدیل روز پرداخت.",
              "پورسانت‌ها به خاطر بازپرداخت‌ها 30 روز منتظر می‌مانند. اگر پرداخت یک مشتری بازپرداخت شود، پورسانت مربوط به آن لغو می‌شود. پس پورسانت یک پرداخت ژانویه در فوریه قابل پرداخت می‌شود و در پرداخت ماهانه بعدی فرستاده می‌شود.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "عضو شدم ولی داشبوردم خالی است",
            a: [
              "آمار بعد از اولین کلیک روی لینک شما نمایش داده می‌شود. خالی بودن فقط یعنی هنوز کسی روی آن کلیک نکرده است. لینک را به اشتراک بگذارید. وقتی فعالیت شروع شود، داشبورد تقریباً به‌صورت لحظه‌ای به‌روز می‌شود.",
              "اگر لینک را به اشتراک گذاشته‌اید و کسی ثبت‌نام کرده ولی داشبورد آن را نشان نمی‌دهد، با زمان تقریبی ثبت‌نام برای ما بنویسید تا تیم بررسی کند ثبت‌نام از کجا آمده است.",
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
            q: "کسی از طریق لینک من ثبت‌نام کرد ولی پورسانت را نمی‌بینم",
            a: [
              "بیشتر وقت‌ها موضوع زمان است. ثبت‌نام ظرف چند دقیقه در داشبورد نمایش داده می‌شود، اما پورسانت فقط وقتی ثبت می‌شود که اشتراک واقعاً پرداخت شود، که اگر کاربر در دوره آزمایشی رایگان باشد ممکن است چند روز بعد باشد. بعد از پایان دوره آزمایشی دوباره بررسی کنید.",
              "اگر اشتراک پرداخت شده ولی بعد از 48 ساعت هنوز پورسانت را نمی‌بینید، با زمان تقریبی ثبت‌نام و، اگر می‌دانید، ایمیل یا نام تقریبی مشترک برای ما بنویسید. تیم بررسی می‌کند ثبت‌نام از کجا آمده و هر مورد جاافتاده را دستی اصلاح می‌کند.",
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
              "Gadit کمک می‌کند هر واژه را تا انتها بفهمید، نه اینکه فقط یک تعریف یک‌خطی بگیرید. هر واژه با همه معانی‌اش، مثال‌های واقعی برای هر معنا، اصطلاحات و ریشه واژه باز می‌شود. طرح‌های پولی تصویر برای هر معنا، تمرین، بازی و امکانات بیشتری اضافه می‌کنند و Family حالت کودک و فضای جداگانه برای هر کودک را اضافه می‌کند.",
              "Gadit به 41 زبان کار می‌کند. در تیم به این کار می‌گوییم «GAD کردن یک واژه»: فهمیدن یک واژه تا انتها، نه فقط ترجمه کردنش. برای دیدن امکانات هر طرح، صفحه «قیمت‌ها» را باز کنید.",
            ],
          },
          {
            id: "languages",
            q: "از چه زبان‌هایی پشتیبانی می‌کنید؟",
            a: [
              "Gadit به 41 زبان کار می‌کند، از جمله انگلیسی، عبری، عربی، اسپانیایی، فرانسوی، آلمانی، روسی، چینی، ژاپنی، هندی، زولو، خوسا و آفریکانس.",
              "می‌توانید واژه‌ای را به هر یک از این زبان‌ها جستجو کنید و معانی، مثال‌ها و همه‌چیز دیگر را به زبانی که برای رابط کاربری انتخاب کرده‌اید دریافت کنید. عبری، عربی و فارسی از راست به چپ خوانده می‌شوند و قلم‌های خودشان را دارند. برای تغییر زبان، روی دکمه زبان در بالای هر صفحه بزنید.",
            ],
          },
          {
            id: "kid-safety",
            q: "آیا Gadit برای کودکان امن است؟",
            a: [
              "Gadit طوری طراحی شده که والدین بتوانند با خیال راحت همراه کودک از آن استفاده کنند. حالت کودک توضیح‌هایی ساده، ملموس و مناسب سن، حدود سطح 5 تا 10 سالگی، تولید می‌کند و از همان موتوری استفاده می‌کند که محتوای بزرگسالان را می‌سازد، با دستورالعمل‌های صریح برای ساده‌سازی. محتوای تولیدشده توسط کاربران هرگز به کودکان نشان داده نمی‌شود.",
              "داشتن حساب شخصی فقط برای بزرگسالان 18 سال به بالا است. کودکان و نوجوانان از طریق یک بزرگسال از Gadit استفاده می‌کنند. در خانه، والد هر کودک را در صفحه Family اضافه می‌کند، هر کودک فضای خودش را با Kids Mode می‌گیرد و پنل والدین واژه‌هایی را که هر کودک جستجو می‌کند نشان می‌دهد. در مدرسه، کلاس یک لینک از معلم می‌گیرد و دانش‌آموزها بدون حساب و بدون آدرس ایمیل وارد می‌شوند.",
            ],
          },
          {
            id: "data",
            q: "داده‌هایم کجا ذخیره می‌شوند؟ آنها را می‌فروشید؟",
            a: [
              "حساب، تاریخچه، دفترچه و تصاویر ساخته‌شده به‌طور امن و به‌صورت رمزگذاری‌شده در Firebase ذخیره می‌شوند. ما داده‌های شما را به هیچ‌کس نمی‌فروشیم. فقط آنچه برای اجرای Gadit لازم است (ذخیره‌سازی، پرداخت‌ها، ارائه‌دهندگان محتوا) را به اشتراک می‌گذاریم، همان‌طور که در سیاست حریم خصوصی آمده است.",
              "هر زمان می‌توانید حساب‌تان را از صفحه «حساب» حذف کنید. برای دریافت نسخه‌ای از دفترچه‌تان یا هر داده دیگری که نزد ما هست، از همین صفحه برای ما بنویسید.",
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
    heading: "Temukan jawaban dengan cepat",
    lede: "Pertanyaan umum dan solusi langkah demi langkah, dikelompokkan per topik. Jika masalah Anda tidak ada di sini, hubungi tim di bagian bawah halaman.",
    stillNeedHelpHeading: "Masih buntu?",
    stillNeedHelpBody: "Tulis langsung kepada kami. Setiap pesan dibaca oleh tim dan biasanya dibalas dalam satu atau dua hari.",
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
              "1. Masuk ke gadit.app dan buka \"Akun\" dari menu akun. 2. Klik \"Kelola tagihan\". 3. Halaman Stripe yang aman akan terbuka. Tambahkan kartu baru sebagai metode pembayaran dan jadikan sebagai default. 4. Jika mau, hapus kartu lama.",
              "Mulai siklus tagihan berikutnya, semua tagihan akan masuk ke kartu baru. Tagihan sebelumnya, yang sudah ditarik, tetap ada di kartu lama. Mengganti kartu tidak memindahkan tagihan itu dan tidak mengubah tanggal tagihan berikutnya.",
            ],
          },
          {
            id: "cancel",
            q: "Bagaimana cara membatalkan langganan saya?",
            a: [
              "Bisa sendiri, kapan saja. Masuk, buka Akun, lalu ketuk Batalkan langganan di bawah paket Anda.",
              "Membeli langganan Anda di aplikasi iPhone atau iPad? Batalkan di pengaturan langganan Apple Anda. Tautan \"Kelola langganan\" di halaman Akun akan membawa Anda ke sana.",
              "Pada langganan berbayar, akses Anda tetap berlaku hingga akhir periode yang sudah dibayar. Setelah itu akun beralih ke Basic, gratis. Kata tersimpan dan riwayat Anda tetap aman.",
              "Selama uji coba gratis 14 hari, membatalkan akan langsung mengakhiri uji coba dan tidak ada tagihan apa pun. Jika yang Anda khawatirkan hanya tagihan otomatis, pilih alasan itu di jendela pembatalan dan Anda bisa mematikan perpanjangan, sambil tetap memakai uji coba sampai hari terakhirnya.",
              "Jika Anda membatalkan langganan berbayar secara tidak sengaja atau berubah pikiran, Anda bisa melanjutkannya dari halaman yang sama sebelum periodenya berakhir.",
            ],
          },
          {
            id: "switch-plan",
            q: "Bagaimana cara beralih antara Individual dan Family?",
            a: [
              "Untuk pindah ke Family, buka halaman Akun Anda lalu ketuk \"Beralih ke Family\". Langganan Anda saat ini diperbarui di kartu yang sama, tanpa perlu memasukkannya lagi.",
              "Stripe menghitung selisih untuk sisa hari dalam periode saat ini, jadi Anda hanya membayar selisihnya. Untuk pindah dari Family ke Individual, tulis kepada kami dari halaman ini dan tim akan memindahkannya untuk Anda.",
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
              "Bisa, dalam 14 hari sejak pembayaran pertama di akun Anda, atau sejak perpanjangan tahunan. Tulis ke support@gadit.app dari alamat email akun Anda dan kami akan mengembalikan pembayaran itu sepenuhnya. Anda tidak perlu memberikan alasan. Pengembalian dana ini juga mengakhiri langganan, dan uang akan kembali ke kartu yang Anda pakai untuk membayar, biasanya dalam 5 sampai 10 hari kerja.",
              "Setelah 14 hari, pembayaran tidak dapat dikembalikan, kecuali Anda ditagih karena kesalahan atau hukum di tempat Anda tinggal mewajibkannya. Anda bisa membatalkan kapan saja agar langganan tidak diperpanjang, dan tetap menggunakannya sampai akhir periode yang sudah Anda bayar.",
              "Membeli di aplikasi iPhone atau iPad? Apple menangani pengembalian dana tersebut di reportaproblem.apple.com.",
            ],
          },
          {
            id: "unknown-charge",
            q: "Tagihan apa ini di kartu saya?",
            a: [
              "Tagihan muncul sebagai GADIT atau GADIT.APP. Jumlahnya sesuai paket Anda (Individual atau Family, bulanan atau tahunan) dalam mata uang negara Anda, seperti yang tertera di halaman Harga. Langganan yang dimulai sebelum Oktober 2026 tetap memakai harga saat mulai. Jika jumlahnya tidak cocok, mungkin itu dari layanan lain.",
              "Jika Anda yakin itu bukan tagihan Anda, jangan ajukan sanggahan lewat bank dulu. Tulis langsung kepada kami terlebih dahulu dengan tanggal dan jumlahnya. Tim akan menemukannya, menjelaskan tagihan apa itu, dan mengembalikan dana bila perlu. Sanggahan bank bisa mempersulit tagihan di masa depan, jadi menyelesaikannya melalui dukungan biasanya lebih cepat dan lebih aman.",
            ],
          },
          {
            id: "failed-payment",
            q: "Pembayaran saya gagal. Apa yang harus saya lakukan?",
            a: [
              "Stripe otomatis mencoba ulang pembayaran yang gagal beberapa kali selama beberapa hari berikutnya. Sebagian besar kegagalan teratasi sendiri setelah bank melepas penahanan atau saldo kartu mencukupi.",
              "Sebuah bar di bagian atas halaman akan memberi tahu bahwa tagihan tidak berhasil, dan akses Anda tetap dipertahankan beberapa hari lagi. Ketuk \"Perbarui kartu\" di sana, masukkan kartu yang berfungsi, dan kami akan langsung mencoba menagihnya. Jika langganan Anda sudah turun ke Basic, Anda bisa berlangganan lagi dari halaman Harga dan buku catatan Anda tetap utuh.",
            ],
          },
          {
            id: "plan-comparison",
            q: "Apa bedanya Basic, Individual, dan Family?",
            a: [
              "Basic (gratis): hingga 10 pencarian kata per hari, semua makna, contoh, idiom, asal-usul kata, makna yang tepat dari sebuah kalimat, dan buku catatan hingga 30 kata.",
              "Individual: untuk satu orang, dengan semua alat belajar. Pencarian tanpa batas, gambar untuk setiap makna, lebih banyak contoh dan pertanyaan untuk setiap kata, menyusun kalimat dengan umpan balik, Setiap kata, Ucapkan, suara baca yang alami dan pencarian suara, penggunaan offline, game, kuis, dan duel kata, serta latihan pintar dengan persiapan ujian dan dikte.",
              "Family: semua yang ada di Individual untuk hingga 5 anak dan orang tua, plus Mode anak, ruang sendiri untuk setiap anak, bantuan PR, dan panel orang tua dengan notifikasi untuk setiap kata. Sekolah punya paket tersendiri. Harga untuk negara Anda dan uji coba gratis 14 hari ada di halaman Harga.",
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
            q: "Saya tidak menerima email verifikasi",
            a: [
              "Periksa folder spam dan promosi terlebih dahulu. Gmail dan Outlook terkadang mengarahkan email akun ke sana sampai Anda menandai salah satunya sebagai \"Bukan spam\".",
              "Jika tidak ada di sana, mungkin alamat email salah ketik saat mendaftar. Coba daftar lagi dan periksa alamatnya dengan teliti. Jika Anda mendaftar dengan Google, email verifikasi tidak diperlukan.",
            ],
          },
          {
            id: "forgot-password",
            q: "Saya lupa kata sandi",
            a: [
              "Di jendela masuk, ketik email Anda, lalu ketuk \"Lupa kata sandi?\". Tautan reset biasanya masuk ke kotak masuk Anda dalam satu atau dua menit. Anda juga bisa mengetuk \"Kirimi saya tautan masuk lewat email\" dan masuk tanpa kata sandi.",
              "Jika emailnya tidak masuk, periksa spam. Jika tetap tidak masuk, mungkin Anda mendaftar dengan Google, bukan dengan email dan kata sandi. Coba tombol \"Lanjutkan dengan Google\".",
            ],
          },
          {
            id: "wrong-credentials",
            q: "Kata sandi saya benar, tetapi muncul bahwa email dan kata sandinya tidak cocok",
            a: [
              "Ada tiga hal yang perlu diperiksa. Pertama, Caps Lock. Kedua, spasi tambahan di akhir setelah menyalin dan menempel. Ketiga, mungkin Anda mendaftar dengan Google, bukan dengan kata sandi, jadi gunakan \"Lanjutkan dengan Google\".",
              "Masih buntu? Di pesan yang sama, ketuk \"Kirimi saya tautan masuk lewat email\" untuk masuk tanpa kata sandi, atau \"Pilih kata sandi baru\".",
            ],
          },
          {
            id: "google-fails",
            q: "Masuk dengan Google tidak berhasil",
            a: [
              "Di dalam aplikasi seperti Instagram, Facebook, atau TikTok, tombol Google disembunyikan. Buka tautannya di browser biasa Anda, atau masuk dengan email Anda. Jika Anda mendaftar dengan Google, ketik email itu lalu ketuk \"Kirimi saya tautan masuk lewat email\".",
              "Di jendela privat, cookies yang diblokir bisa menghentikan masuk dengan Google, jadi coba jendela biasa.",
            ],
          },
          {
            id: "change-email",
            q: "Bagaimana cara mengganti email di akun saya?",
            a: [
              "Mengganti email akun dilakukan oleh tim. Kirimi kami email dari alamat Anda saat ini dan tulis alamat baru di pesannya. Tim akan memperbaruinya, dan langganan, riwayat, serta buku catatan Anda tetap seperti semula.",
            ],
          },
          {
            id: "delete-account",
            q: "Bagaimana cara menghapus akun saya?",
            a: [
              "Di bagian bawah halaman Akun, ketuk \"Hapus akun\" lalu ketik email akun Anda untuk konfirmasi. Ini permanen: langganan Anda dibatalkan, buku catatan dan riwayat Anda dihapus, dan emailnya dibebaskan untuk pendaftaran baru.",
              "Satu-satunya pengecualian adalah langganan yang dibeli di App Store: menghapus akun tidak membatalkannya, jadi batalkan dulu di pengaturan langganan Apple Anda.",
              "Catatan tagihan sebelumnya tetap ada, karena hukum mewajibkan kami menyimpannya untuk keperluan akuntansi.",
            ],
          },
          {
            id: "share-account",
            q: "Bisakah pasangan atau anak saya berbagi akun saya?",
            a: [
              "Setiap akun hanya untuk satu orang yang masuk pada satu waktu. Untuk satu keluarga, paket Family memang dibuat untuk ini: hingga 5 anak dan orang tua, masing-masing dengan ruang sendiri, buku catatan dan kemajuan sendiri, plus Mode anak untuk anak-anak dan panel orang tua.",
              "Untuk satu orang dewasa saja, Individual mencakup satu orang dengan semua alat belajar. Bandingkan paket dan harga untuk negara Anda di halaman Harga.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "Sepertinya saya tidak sengaja punya dua akun. Lalu bagaimana?",
            a: [
              "Ini biasanya terjadi ketika seseorang mendaftar sekali dengan Google dan sekali dengan email dan kata sandi menggunakan alamat yang sama, atau ketika Anda mendaftar dua kali dengan alamat email yang berbeda. Setiap pendaftaran membuat akun Gadit terpisah dengan buku catatan, riwayat, dan status langganannya sendiri.",
              "Kirimi kami email dari salah satu dari dua alamat itu, lalu tulis alamat lainnya dan akun mana yang ingin Anda pertahankan. Tim akan menggabungkan buku catatan dan riwayat ke akun yang Anda pilih, lalu menutup akun satunya dengan rapi. Tidak ada data yang hilang.",
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
              "Di samping setiap makna, dan di kartu idiom serta asal kata, ada ikon bendera kecil. Ketuk itu, pilih apa yang salah, dan tambahkan catatan singkat jika Anda mau. Laporan ini langsung masuk ke tim, dan setiap laporan ditinjau.",
              "Jangan khawatir terlalu teliti. Kamus ini berkembang lebih cepat dari masukan seperti ini dibanding dari hal lain apa pun.",
            ],
          },
          {
            id: "kids-not-working",
            q: "Mode anak tidak mengubah penjelasan",
            a: [
              "Mode anak hanya mengubah teks jika kata tersebut sudah memiliki penjelasan ramah anak. Untuk kata yang baru pertama kali Anda cari, tunggu 10 hingga 15 detik selagi versi ramah anak disiapkan.",
              "Mode anak adalah bagian dari paket Family. Di Individual, sebagai gantinya Anda akan melihat sakelar \"Dengan kata sederhana\", yang memberi penjelasan lebih sederhana untuk setiap makna. Di Basic atau tanpa akun tidak ada sakelar. Pelanggan yang bergabung dengan Clear atau Deep sebelum Oktober 2026 tetap memiliki Mode anak. Untuk mendapatkannya, lihat Family di halaman Harga.",
            ],
          },
          {
            id: "voice-fails",
            q: "Pencarian suara tidak berfungsi",
            a: [
              "Pencarian suara memerlukan izin mikrofon. Sebagian besar browser menanyakannya sekali per situs. Jika Anda memblokirnya tanpa sengaja, ketuk ikon di samping gadit.app pada bilah alamat dan izinkan mikrofon di izin situs.",
              "Di iPhone dan iPad, izinkan juga mikrofon untuk Safari di app Pengaturan perangkat. Pencarian suara adalah bagian dari paket Individual dan Family, jadi di Basic dan tanpa akun tombol mikrofon tidak muncul. Untuk upgrade, buka halaman Harga.",
            ],
          },
          {
            id: "no-image",
            q: "Saya tidak bisa mendapatkan gambar untuk kata ini",
            a: [
              "Gambar adalah bagian dari paket Individual dan Family, dengan hingga 100 gambar baru per bulan. Gambar yang sudah ada untuk makna tersebut terbuka tanpa dihitung. Paket Clear yang lama mendapat 30 per bulan, dan Basic tidak mencakup gambar. Saat gambar bulan itu habis, Anda akan melihat pemberitahuan, dan hitungannya dimulai lagi di awal setiap bulan.",
              "Jika kuota belum habis dan masih gagal, biasanya itu sementara. Coba lagi dalam 30 detik. Kegagalan yang terus-menerus adalah bug. Silakan laporkan dari halaman kata.",
            ],
          },
          {
            id: "save-word",
            q: "Bagaimana cara menyimpan kata ke buku catatan saya?",
            a: [
              "Anda tidak perlu melakukannya. Saat Anda masuk, setiap kata yang Anda cari otomatis tersimpan ke buku catatan. Di Basic, buku catatan memuat hingga 30 kata. Di Individual dan Family tidak ada batas, dan ada latihan pintar yang memunculkan kembali kata-kata Anda untuk diulang pada waktu yang tepat.",
              "Di Individual dan Family, kata yang Anda cari juga disimpan di perangkat Anda, jadi bisa dibuka tanpa internet. Untuk melihat kata-kata Anda, buka buku catatan dari menu.",
            ],
          },
          {
            id: "offline",
            q: "Bagaimana cara memakai Gadit secara offline?",
            a: [
              "Penggunaan offline adalah bagian dari paket Individual dan Family. Setiap kata yang Anda cari disimpan di perangkat Anda, jadi langsung terbuka lagi tanpa internet. Anda juga bisa mengetuk \"Unduh paket offline\" di halaman Akun untuk menyimpan kata-kata kamus kami dalam bahasa Anda di perangkat ini.",
              "Mencari kata yang benar-benar baru tetap memerlukan koneksi, karena Gadit harus menyiapkan hasil lengkapnya. Salinan offline mencakup kata-kata yang sudah ada di perangkat Anda. Jika Anda memakai Basic, lihat paket-paketnya di halaman Harga.",
            ],
          },
          {
            id: "slow",
            q: "Aplikasinya terasa lambat",
            a: [
              "Pencarian pertama sebuah kata adalah yang paling lambat karena Gadit menyusun hasil lengkapnya dari awal: biasanya beberapa detik, kadang lebih lama untuk kata yang rumit. Pencarian berikutnya untuk kata yang sama langsung tampil dari cache.",
              "Jika semuanya terasa lambat, coba muat ulang paksa: Cmd+Shift+R di Mac, Ctrl+Shift+R di Windows. Jika lambatnya terus terjadi di berbagai halaman, kirim email kepada kami dengan negara dan browser Anda agar tim bisa memeriksa jalur jaringan ke server kami dari wilayah Anda.",
            ],
          },
          {
            id: "word-not-found",
            q: "Saya mencari sebuah kata dan tidak mendapat hasil. Ada apa?",
            a: [
              "Pertama, periksa ejaannya. Jika ada salah ketik, Gadit biasanya menampilkan kata yang sudah dikoreksi, dengan tautan untuk tetap mencari apa yang Anda ketik.",
              "Kata yang sangat langka atau slang memang tidak selalu mendapat hasil. Jika Anda yakin kata itu ada, tulis kepada kami dari halaman ini dan tim akan memeriksanya.",
            ],
          },
          {
            id: "change-language",
            q: "Bagaimana cara mengganti bahasa antarmuka?",
            a: [
              "Di bagian atas halaman ada ikon globe dengan bahasa Anda saat ini. Ketuk itu lalu pilih bahasa.",
              "Pilihan Anda disimpan di perangkat ini. Semuanya dimuat ulang dalam bahasa baru: antarmuka, menu, definisi kata berikutnya, contoh, penjelasan anak, bahkan asal katanya. Kata-kata yang sudah Anda cari dalam bahasa lama akan tetap tampil dalam bahasa itu sampai Anda mencarinya lagi.",
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
              "Buka gadit.app/partners lalu ketuk \"Gabung gratis\". Masukkan nama dan email Anda, lalu ketuk \"Dapatkan kode partner saya\". Tautan pribadi dan dasbor partner Anda, dengan klik dan komisi, langsung siap tanpa menunggu persetujuan. Kode dan tautannya juga dikirim lewat email.",
              "Bergabung itu gratis dan terbuka untuk siapa saja. Anda tidak memerlukan langganan Gadit untuk menjadi partner.",
            ],
          },
          {
            id: "commission-model",
            q: "Bagaimana komisi dihitung?",
            a: [
              "Ketentuan standarnya adalah 25% dari setiap pembayaran yang dilakukan pelanggan pada tahun pertamanya. Setelah tahun pertama itu, Anda mendapat 10% dari setiap pembayaran selama pelanggan terus membayar. Jika Anda membawa 5 pelanggan berbayar, bagian Anda setelah tahun pertama naik menjadi 15% seumur hidup.",
              "Ini berlaku sama untuk paket bulanan dan tahunan, karena komisi dihitung dari setiap pembayaran yang benar-benar terjadi. Jika pelanggan membatalkan, komisi Anda berhenti pada pembayaran terakhirnya.",
              "Tim dapat menetapkan tarif berbeda untuk partner tertentu. Tarif Anda sendiri selalu tampil di dasbor partner Anda.",
            ],
          },
          {
            id: "payout",
            q: "Kapan saya dibayar?",
            a: [
              "Sekali sebulan, tanpa minimum. Setiap komisi bisa dibayarkan 30 hari setelah pembayaran pelanggan, dan semua yang sudah bisa dibayarkan akan dikirim pada pembayaran bulanan berikutnya ke akun PayPal yang Anda atur di dasbor partner Anda.",
              "Kami membayar dalam mata uang yang dipakai pelanggan saat membayar jika PayPal bisa mengirimkannya, dan jika tidak, dalam dolar AS, dengan kurs pada hari kami membayar.",
              "Komisi menunggu 30 hari karena pengembalian dana: jika pembayaran pelanggan dikembalikan, komisi untuk pembayaran itu dibatalkan. Jadi komisi dari pembayaran bulan Januari bisa dibayarkan pada bulan Februari, dan dikirim pada pembayaran bulanan berikutnya.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "Saya sudah bergabung tetapi dasbor saya kosong",
            a: [
              "Statistik muncul setelah klik pertama pada tautan Anda. Kosong hanya berarti belum ada yang mengklik. Bagikan tautannya. Dasbor diperbarui hampir secara real time begitu aktivitas dimulai.",
              "Jika Anda sudah membagikannya dan seseorang sudah mendaftar tetapi dasbor belum menunjukkannya, tulis kepada kami dengan perkiraan waktu pendaftaran dan tim akan memeriksa dari mana pendaftaran itu datang.",
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
            q: "Seseorang mendaftar lewat tautan saya tetapi saya tidak melihat komisinya",
            a: [
              "Paling sering ini soal waktu: pendaftaran muncul di dasbor dalam hitungan menit, tetapi komisi baru dicatat setelah langganan benar-benar dibayar, yang bisa beberapa hari kemudian jika mereka sedang dalam uji coba gratis. Periksa lagi setelah masa uji coba berakhir.",
              "Jika langganan sudah dibayar tetapi Anda masih belum melihat komisinya setelah 48 jam, tulis kepada kami dengan perkiraan waktu pendaftaran dan email atau perkiraan nama pelanggan jika Anda tahu. Tim akan memeriksa dari mana pendaftaran itu datang dan memperbaiki secara manual jika ada yang terlewat.",
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
              "Gadit membantu Anda memahami setiap kata sampai tuntas, bukan sekadar mendapat definisi satu baris. Setiap kata terbuka dengan semua maknanya, contoh nyata untuk tiap makna, idiom, dan asal-usul kata. Paket berbayar menambahkan gambar untuk setiap makna, latihan, game, dan lainnya, dan Family menambahkan Mode anak serta ruang sendiri untuk setiap anak.",
              "Gadit tersedia dalam 41 bahasa. Di internal tim, kami menyebutnya \"GAD sebuah kata\": memahami kata sampai tuntas, bukan sekadar menerjemahkannya. Untuk melihat isi setiap paket, buka halaman Harga.",
            ],
          },
          {
            id: "languages",
            q: "Bahasa apa saja yang didukung?",
            a: [
              "Gadit tersedia dalam 41 bahasa, termasuk Inggris, Ibrani, Arab, Spanyol, Prancis, Jerman, Rusia, Mandarin, Jepang, Hindi, Zulu, Xhosa, dan Afrikaans.",
              "Anda bisa mencari kata dalam bahasa mana pun dari daftar itu dan mendapatkan makna, contoh, dan semuanya dalam bahasa yang Anda pilih untuk antarmuka. Bahasa Ibrani, Arab, dan Persia dibaca dari kanan ke kiri, dengan font masing-masing. Untuk mengganti bahasa, ketuk tombol bahasa di bagian atas halaman mana pun.",
            ],
          },
          {
            id: "kid-safety",
            q: "Apakah Gadit aman untuk anak-anak?",
            a: [
              "Gadit dirancang agar orang tua dapat menggunakannya dengan aman bersama anak. Mode anak menghasilkan penjelasan yang sederhana, konkret, dan sesuai usia, kira-kira tingkat usia 5 hingga 10 tahun, menggunakan mesin yang sama dengan konten dewasa, dengan instruksi tegas untuk menyederhanakan. Konten buatan pengguna tidak pernah ditampilkan kepada anak-anak.",
              "Akun pribadi hanya untuk orang dewasa, usia 18 tahun ke atas. Anak-anak dan remaja menggunakan Gadit melalui orang dewasa. Di rumah, orang tua menambahkan setiap anak di halaman Family, setiap anak mendapat ruang sendiri dengan Mode anak, dan panel orang tua menampilkan kata-kata yang dicari setiap anak. Di sekolah, kelas mendapat tautan dari guru, dan siswa bergabung tanpa akun atau alamat email.",
            ],
          },
          {
            id: "data",
            q: "Di mana data saya disimpan? Apakah Anda menjualnya?",
            a: [
              "Akun, riwayat, buku catatan, dan gambar yang dibuat disimpan dengan aman di Firebase, terenkripsi dalam penyimpanan. Kami tidak menjual data Anda kepada siapa pun. Kami hanya membagikan apa yang diperlukan untuk menjalankan Gadit (penyimpanan, pembayaran, penyedia konten), sebagaimana dijelaskan dalam Kebijakan Privasi.",
              "Anda bisa menghapus akun kapan saja dari halaman Akun. Untuk mendapatkan salinan buku catatan atau data lain yang kami simpan, tulis kepada kami dari halaman ini.",
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
    heading: "Vind snel een antwoord",
    lede: "Veelgestelde vragen en stapsgewijze oplossingen, geordend per onderwerp. Staat je probleem er niet bij? Neem dan onderaan contact op met het team.",
    stillNeedHelpHeading: "Kom je er nog niet uit?",
    stillNeedHelpBody: "Schrijf ons direct. Het team leest elk bericht en reageert meestal binnen een dag of twee.",
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
              "1. Log in op gadit.app en open \"Account\" in het accountmenu. 2. Klik op \"Facturering beheren\". 3. Er opent een beveiligde Stripe-pagina. Voeg de nieuwe kaart toe als betaalmethode en stel die in als standaard. 4. Verwijder eventueel de oude kaart.",
              "Vanaf de volgende factuurperiode gaat alles naar de nieuwe kaart. De vorige betaling, die al is afgeschreven, blijft op de oude kaart. Het wijzigen van de kaart verplaatst die betaling niet en verandert je volgende factuurdatum niet.",
            ],
          },
          {
            id: "cancel",
            q: "Hoe zeg ik mijn abonnement op?",
            a: [
              "Zelf, op elk moment. Log in, open Account en tik onder je abonnement op Abonnement opzeggen.",
              "Heb je je abonnement in de iPhone of iPad app gekocht? Zeg het dan op in je Apple abonnementsinstellingen. De link \"Abonnement beheren\" op je Account-pagina brengt je daarheen.",
              "Bij een betaald abonnement loopt je toegang door tot het einde van de periode die je al hebt betaald. Daarna gaat het account over naar Basic, gratis. Je opgeslagen woorden en geschiedenis blijven veilig.",
              "Tijdens de gratis proefperiode van 14 dagen beëindigt opzeggen de proefperiode meteen en wordt er niets afgeschreven. Maak je je alleen zorgen over de automatische afschrijving, kies dan die reden in het opzegvenster. Dan kun je de verlenging uitzetten en de proefperiode houden tot de laatste dag.",
              "Heb je een betaald abonnement per ongeluk opgezegd of ben je van gedachten veranderd? Dan kun je het op dezelfde pagina hervatten voordat de periode afloopt.",
            ],
          },
          {
            id: "switch-plan",
            q: "Hoe wissel ik tussen Individual en Family?",
            a: [
              "Om over te stappen naar Family open je je accountpagina en tik je op \"Overstappen naar Family\". Je huidige abonnement wordt op dezelfde kaart bijgewerkt, zonder dat je die opnieuw hoeft in te voeren.",
              "Stripe berekent het verschil voor de dagen die nog over zijn in de huidige periode, dus je betaalt alleen het verschil. Wil je van Family naar Individual, schrijf ons dan via deze pagina en het team zet het voor je om.",
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
              "Ja, binnen 14 dagen na de eerste betaling op je account, of na een jaarlijkse verlenging. Mail naar support@gadit.app vanaf het e-mailadres van je account, dan betalen we die betaling volledig terug. Je hoeft geen reden op te geven. De terugbetaling stopt ook het abonnement, en het geld gaat terug naar de kaart waarmee je hebt betaald, meestal binnen 5 tot 10 werkdagen.",
              "Na 14 dagen worden betalingen niet terugbetaald, behalve als je per ongeluk bent belast of als de wet in het land waar je woont dat verplicht. Je kunt altijd opzeggen zodat het abonnement niet wordt verlengd, en je houdt het tot het einde van de periode waarvoor je hebt betaald.",
              "Gekocht in de app op iPhone of iPad? Apple regelt die terugbetalingen via reportaproblem.apple.com.",
            ],
          },
          {
            id: "unknown-charge",
            q: "Wat is deze afschrijving op mijn kaart?",
            a: [
              "Afschrijvingen verschijnen als GADIT of GADIT.APP. Het bedrag past bij je abonnement (Individual of Family, per maand of per jaar) in de valuta van je land, zoals op de prijzenpagina staat. Abonnementen van vóór oktober 2026 houden de prijs waarmee ze begonnen. Klopt het bedrag niet, dan kan het van een andere dienst zijn.",
              "Weet je zeker dat het niet van jou is? Start dan nog geen betwisting via je bank. Schrijf ons eerst direct met de datum en het bedrag. Het team zoekt het op, legt uit wat het is en betaalt terug als dat nodig is. Een betwisting via de bank kan toekomstige betalingen lastiger maken, dus het oplossen via support is meestal sneller en veiliger.",
            ],
          },
          {
            id: "failed-payment",
            q: "Mijn betaling is mislukt. Wat moet ik doen?",
            a: [
              "Stripe probeert mislukte betalingen in de dagen daarna automatisch een paar keer opnieuw. De meeste problemen lossen zich vanzelf op zodra de bank de blokkering opheft of er genoeg saldo op de kaart staat.",
              "Bovenaan de pagina zie je een balk dat de betaling niet is gelukt, en je toegang blijft nog een paar dagen actief. Tik daar op \"Kaart bijwerken\", vul een werkende kaart in, en we proberen de betaling daar meteen op. Is je abonnement al teruggevallen naar Basic, dan kun je je opnieuw abonneren via de prijzenpagina en blijft je notitieboek intact.",
            ],
          },
          {
            id: "plan-comparison",
            q: "Wat is het verschil tussen Basic, Individual en Family?",
            a: [
              "Basic (gratis): tot 10 woorden per dag opzoeken, elke betekenis, voorbeelden, uitdrukkingen, de herkomst van het woord, de juiste betekenis uit een zin en een notitieboek met maximaal 30 woorden.",
              "Individual: één persoon, alle leermiddelen. Onbeperkt opzoeken, een afbeelding bij elke betekenis, meer voorbeelden en vragen bij elk woord, een zin maken met feedback, Elk woord, Zeg het, een natuurlijke voorleesstem en zoeken met spraak, offline gebruik, games, quizzen en woordduels, en slimme oefeningen met toetsvoorbereiding en dictees.",
              "Family: alles uit Individual voor maximaal 5 kinderen en de ouders, plus de kindermodus, een eigen plek voor elk kind, hulp bij huiswerk en het ouderoverzicht met een melding bij elk woord. Scholen hebben een eigen abonnement. De prijzen voor je land en de gratis proefperiode van 14 dagen staan op de prijzenpagina.",
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
            q: "Ik heb mijn verificatiemail niet ontvangen",
            a: [
              "Kijk eerst in je spam- en promotiemappen. Gmail en Outlook sturen accountmails daar soms naartoe totdat je er een als \"Geen spam\" markeert.",
              "Staat hij daar niet, dan is het e-mailadres bij het aanmelden misschien verkeerd getypt. Meld je opnieuw aan en controleer het adres goed. Heb je je aangemeld met Google, dan is er geen verificatiemail nodig.",
            ],
          },
          {
            id: "forgot-password",
            q: "Ik ben mijn wachtwoord vergeten",
            a: [
              "Typ in het inlogvenster je e-mailadres en tik dan op \"Wachtwoord vergeten?\". Een resetlink komt meestal binnen een minuut of twee aan. Je kunt ook op \"Stuur me een inloglink per e-mail\" tikken en zonder wachtwoord inloggen.",
              "Komt de mail niet aan, kijk dan in je spam. Komt hij nog steeds niet, dan heb je je misschien aangemeld met Google in plaats van met e-mail en wachtwoord. Probeer de knop \"Doorgaan met Google\".",
            ],
          },
          {
            id: "wrong-credentials",
            q: "Mijn wachtwoord klopt, maar er staat dat het e-mailadres en wachtwoord niet overeenkomen",
            a: [
              "Drie dingen om te controleren. Ten eerste Caps Lock. Ten tweede een extra spatie aan het eind na kopiëren en plakken. Ten derde: misschien heb je je aangemeld met Google in plaats van met een wachtwoord, gebruik dan \"Doorgaan met Google\".",
              "Lukt het nog steeds niet? Tik in hetzelfde bericht op \"Stuur me een inloglink per e-mail\" om zonder wachtwoord in te loggen, of op \"Nieuw wachtwoord kiezen\".",
            ],
          },
          {
            id: "google-fails",
            q: "Inloggen met Google werkt niet",
            a: [
              "Binnen apps zoals Instagram, Facebook of TikTok is de Google-knop verborgen. Open de link in je gewone browser, of log in met je e-mail. Als je je met Google hebt aangemeld, typ dan dat e-mailadres en tik op \"Stuur me een inloglink per e-mail\".",
              "In een privévenster, incognito, kunnen geblokkeerde cookies het inloggen met Google tegenhouden, dus probeer een gewoon venster.",
            ],
          },
          {
            id: "change-email",
            q: "Hoe wijzig ik het e-mailadres van mijn account?",
            a: [
              "Het wijzigen van het e-mailadres van je account gaat via het team. Mail ons vanaf je huidige adres en zet het nieuwe adres in je bericht. Het team past het aan, en je abonnement, geschiedenis en notitieboek blijven zoals ze zijn.",
            ],
          },
          {
            id: "delete-account",
            q: "Hoe verwijder ik mijn account?",
            a: [
              "Onderaan de Account-pagina tik je op \"Account verwijderen\" en typ je ter bevestiging het e-mailadres van je account. Dit is definitief. Je abonnement wordt opgezegd, je notitieboek en geschiedenis worden gewist en het e-mailadres komt vrij voor een nieuwe aanmelding.",
              "De enige uitzondering is een abonnement dat in de App Store is gekocht. Het verwijderen van je account zegt dat niet op, dus zeg het eerst op in je Apple abonnementsinstellingen.",
              "Gegevens van eerdere betalingen blijven bewaard, omdat we die wettelijk moeten bewaren voor de boekhouding.",
            ],
          },
          {
            id: "share-account",
            q: "Kunnen mijn partner of kind mijn account delen?",
            a: [
              "Per account is er één persoon tegelijk ingelogd. Voor een gezin is het Family-abonnement hiervoor gemaakt: maximaal 5 kinderen en de ouders, elk met een eigen plek, een eigen notitieboek en eigen voortgang, plus de kindermodus voor de kinderen en een ouderoverzicht.",
              "Voor één volwassene alleen dekt Individual één persoon met alle leermiddelen. Vergelijk de abonnementen en de prijzen voor je land op de prijzenpagina.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "Ik denk dat ik per ongeluk twee accounts heb. Wat nu?",
            a: [
              "Dit gebeurt meestal als iemand zich één keer met Google en één keer met e-mail en wachtwoord aanmeldt met hetzelfde adres, of zich twee keer aanmeldt met verschillende e-mailadressen. Elke aanmelding maakt een apart Gadit-account met een eigen notitieboek, geschiedenis en abonnementsstatus.",
              "Mail ons vanaf een van de twee adressen en zet het andere adres erbij, plus welk account je wilt houden. Het team voegt het notitieboek en de geschiedenis samen in het account dat je kiest en sluit het andere netjes af. Er gaan geen gegevens verloren.",
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
              "Naast elke betekenis, en op de kaarten met uitdrukkingen en woordoorsprong, staat een klein vlag-icoon. Tik erop, kies wat er niet klopt, en voeg als je wilt een korte opmerking toe. Het komt rechtstreeks bij het team binnen, en elke melding wordt bekeken.",
              "Wees niet bang om te kritisch te zijn. Het woordenboek wordt van deze feedback sneller beter dan van wat dan ook.",
            ],
          },
          {
            id: "kids-not-working",
            q: "De kindermodus verandert de uitleg niet",
            a: [
              "De kindermodus past de tekst alleen aan als er voor het woord al een kindvriendelijke uitleg is. Heb je een woord net voor het eerst opgezocht, geef het dan 10 tot 15 seconden terwijl de kindvriendelijke versie wordt voorbereid.",
              "De kindermodus hoort bij het Family-abonnement. Bij Individual zie je in plaats daarvan de schakelaar \"In eenvoudige woorden\", die een eenvoudigere uitleg van elke betekenis geeft. Bij Basic of zonder account is er geen schakelaar. Abonnees die vóór oktober 2026 Clear of Deep namen, houden de kindermodus. Wil je hem ook, bekijk dan Family op de prijzenpagina.",
            ],
          },
          {
            id: "voice-fails",
            q: "Zoeken met spraak werkt niet",
            a: [
              "Zoeken met spraak heeft toestemming voor de microfoon nodig. De meeste browsers vragen dat één keer per site. Heb je die per ongeluk geblokkeerd, tik dan op het icoon naast gadit.app in de adresbalk en sta de microfoon toe in de siterechten.",
              "Op iPhone en iPad moet je de microfoon ook toestaan voor Safari in de app Instellingen van het apparaat. Zoeken met spraak hoort bij de abonnementen Individual en Family, dus bij Basic en zonder account verschijnt de microfoonknop niet. Om te upgraden open je de prijzenpagina.",
            ],
          },
          {
            id: "no-image",
            q: "Ik krijg geen afbeelding bij het woord",
            a: [
              "Afbeeldingen horen bij de abonnementen Individual en Family, met maximaal 100 nieuwe afbeeldingen per maand. Een afbeelding die al bestaat voor die betekenis opent zonder mee te tellen. Het oudere Clear-abonnement heeft er 30 per maand, en Basic bevat geen afbeeldingen. Als de afbeeldingen van de maand op zijn, zie je een melding, en de telling begint aan het begin van elke maand opnieuw.",
              "Zit je onder je tegoed en gaat het toch mis, dan is dat meestal tijdelijk. Probeer het over 30 seconden opnieuw. Blijvende fouten zijn een bug. Meld het dan via de woordpagina.",
            ],
          },
          {
            id: "save-word",
            q: "Hoe sla ik een woord op in mijn notitieboek?",
            a: [
              "Dat hoeft niet. Als je bent ingelogd, wordt elk woord dat je opzoekt vanzelf in je notitieboek bewaard. Bij Basic past het notitieboek maximaal 30 woorden. Bij Individual en Family is er geen limiet en krijg je slimme oefeningen, die je woorden op het juiste moment terugbrengen om te herhalen.",
              "Bij Individual en Family worden de woorden die je opzoekt ook op je apparaat bewaard, zodat ze zonder internet openen. Je woorden zie je door het notitieboek te openen via het menu.",
            ],
          },
          {
            id: "offline",
            q: "Hoe gebruik ik Gadit offline?",
            a: [
              "Offline gebruik hoort bij de abonnementen Individual en Family. Elk woord dat je opzoekt, wordt op je apparaat bewaard, zodat het zonder internet meteen weer opent. Je kunt ook op \"Offline pakket downloaden\" tikken op je Account-pagina om de woorden van ons woordenboek in jouw taal op dit apparaat op te slaan.",
              "Voor een volledig nieuw woord heb je nog steeds verbinding nodig, omdat Gadit er het volledige resultaat voor moet voorbereiden. De offline kopie bevat de woorden die al op je apparaat staan. Zit je op Basic, bekijk dan de abonnementen op de prijzenpagina.",
            ],
          },
          {
            id: "slow",
            q: "De app voelt traag",
            a: [
              "Het eerste opzoeken van een woord is het traagst, omdat Gadit het volledige resultaat vanaf nul maakt: meestal een paar seconden, soms langer bij complexe woorden. Daarna gaat het opzoeken van hetzelfde woord meteen, vanuit de cache.",
              "Voelt alles traag, probeer dan een harde vernieuwing: Cmd+Shift+R op Mac, Ctrl+Shift+R op Windows. Blijft het op meerdere pagina's traag, mail ons dan je land en browser, zodat het team de netwerkroute van jouw regio naar onze servers kan controleren.",
            ],
          },
          {
            id: "word-not-found",
            q: "Ik zocht een woord en kreeg geen resultaat. Wat is er aan de hand?",
            a: [
              "Controleer eerst de spelling. Als er een tikfout was, laat Gadit meestal het gecorrigeerde woord zien, met een link om toch te zoeken op wat je had getypt.",
              "Zeer zeldzame woorden of slangwoorden geven niet altijd een resultaat. Weet je zeker dat het woord bestaat, schrijf ons dan vanaf deze pagina en het team kijkt ernaar.",
            ],
          },
          {
            id: "change-language",
            q: "Hoe wijzig ik de taal van de interface?",
            a: [
              "Bovenaan de pagina staat een wereldbol-icoon met je huidige taal. Tik erop en kies een taal.",
              "Je keuze wordt op dit apparaat bewaard. Alles laadt opnieuw in de nieuwe taal: de interface, de menu's, toekomstige woorddefinities, voorbeelden, uitleg voor kinderen, zelfs de woordoorsprong. Woorden die je al in de oude taal hebt opgezocht, blijven daarin staan tot je ze opnieuw opzoekt.",
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
              "Ga naar gadit.app/partners en tik op \"Gratis meedoen\". Vul je naam en e-mailadres in en tik dan op \"Mijn partnercode ophalen\". Je persoonlijke link en partnerdashboard, met klikken en commissies, staan meteen klaar, zonder wachttijd voor goedkeuring. De code en link komen ook per e-mail aan.",
              "Meedoen is gratis en staat open voor iedereen. Je hebt geen Gadit-abonnement nodig om partner te worden.",
            ],
          },
          {
            id: "commission-model",
            q: "Hoe worden commissies berekend?",
            a: [
              "De standaardvoorwaarden zijn 25% van elke betaling die een klant in het eerste jaar doet. Na dat eerste jaar verdien je 10% van elke betaling, zolang de klant blijft betalen. Breng je 5 betalende klanten aan, dan stijgt jouw aandeel na het eerste jaar levenslang naar 15%.",
              "Dit werkt hetzelfde voor maand- en jaarabonnementen, omdat de commissie over elke daadwerkelijke betaling wordt berekend. Zegt een klant op, dan stopt je commissie bij diens laatste betaling.",
              "Het team kan voor specifieke partners andere tarieven instellen. Je eigen tarieven staan altijd in je partnerdashboard.",
            ],
          },
          {
            id: "payout",
            q: "Wanneer word ik uitbetaald?",
            a: [
              "Eén keer per maand, zonder minimumbedrag. Elke commissie wordt 30 dagen na de betaling van de klant uitbetaalbaar, en alles wat uitbetaalbaar is wordt in de volgende maandelijkse uitbetaling gestuurd naar het PayPal-account dat je in je partnerdashboard hebt ingesteld.",
              "We betalen in de valuta waarin de klant heeft betaald als PayPal die kan versturen, en anders in Amerikaanse dollars, tegen de wisselkoers op de dag van uitbetaling.",
              "Commissies wachten 30 dagen vanwege terugbetalingen. Als de betaling van een klant wordt terugbetaald, vervalt de commissie daarop. Een commissie op een betaling in januari wordt dus in februari uitbetaalbaar en gaat mee in de volgende maandelijkse uitbetaling.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "Ik doe mee, maar mijn dashboard is leeg",
            a: [
              "Statistieken verschijnen na de eerste klik op je link. Leeg betekent alleen dat nog niemand heeft geklikt. Ga de link delen. Zodra er activiteit is, wordt het dashboard bijna realtime bijgewerkt.",
              "Heb je de link gedeeld en heeft iemand zich aangemeld, maar zie je dat niet terug in het dashboard? Schrijf ons dan met het geschatte tijdstip van aanmelding en het team controleert waar de aanmelding vandaan kwam.",
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
            q: "Iemand heeft zich via mijn link aangemeld, maar ik zie de commissie niet",
            a: [
              "Meestal is het een kwestie van timing: de aanmelding verschijnt binnen enkele minuten in het dashboard, maar de commissie wordt pas geboekt als het abonnement echt is betaald, dat kan dagen later zijn bij een gratis proefperiode. Kijk opnieuw na afloop van de proefperiode.",
              "Is het abonnement betaald maar zie je na 48 uur nog steeds geen commissie, schrijf ons dan met het geschatte tijdstip van aanmelding en het e-mailadres of de naam van de abonnee bij benadering, als je die weet. Het team controleert waar de aanmelding vandaan kwam en herstelt eventuele missers handmatig.",
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
              "Gadit helpt je elk woord helemaal te begrijpen, niet alleen een definitie van één regel te krijgen. Elk woord opent met al zijn betekenissen, echte voorbeelden per betekenis, uitdrukkingen en de herkomst van het woord. De betaalde abonnementen voegen een afbeelding bij elke betekenis, oefenen, games en meer toe, en Family voegt de kindermodus en een eigen plek voor elk kind toe.",
              "Gadit werkt in 41 talen. Intern noemt het team het \"een woord GADden\": een woord helemaal doorgronden, niet alleen vertalen. Wat elk abonnement bevat, zie je op de prijzenpagina.",
            ],
          },
          {
            id: "languages",
            q: "Welke talen ondersteunen jullie?",
            a: [
              "Gadit werkt in 41 talen, waaronder Engels, Hebreeuws, Arabisch, Spaans, Frans, Duits, Russisch, Chinees, Japans, Hindi, Zoeloe, Xhosa en Afrikaans.",
              "Je kunt een woord opzoeken in elk van die talen en krijgt de betekenissen, voorbeelden en al het andere in de taal die je voor de interface hebt gekozen. Hebreeuws, Arabisch en Perzisch lees je van rechts naar links, met hun eigen lettertypen. Wisselen doe je met de taalknop bovenaan elke pagina.",
            ],
          },
          {
            id: "kid-safety",
            q: "Is Gadit veilig voor kinderen?",
            a: [
              "Gadit is ontworpen zodat een ouder het veilig samen met een kind kan gebruiken. De kindermodus geeft uitleg die eenvoudig, concreet en passend bij de leeftijd is, ongeveer op het niveau van 5 tot 10 jaar, met dezelfde engine die de inhoud voor volwassenen maakt, met expliciete instructies om te vereenvoudigen. Door gebruikers gemaakte inhoud wordt nooit aan kinderen getoond.",
              "Een eigen account is voor volwassenen van 18 jaar en ouder. Kinderen en tieners gebruiken Gadit via een volwassene. Thuis voegt een ouder elk kind toe op de Family-pagina, elk kind krijgt een eigen plek met Kids Mode, en het ouderoverzicht laat de woorden zien die elk kind opzoekt. Op school krijgt de klas een link van de docent, en leerlingen doen mee zonder account of e-mailadres.",
            ],
          },
          {
            id: "data",
            q: "Waar worden mijn gegevens opgeslagen? Verkopen jullie ze?",
            a: [
              "Account, geschiedenis, notitieboek en gemaakte afbeeldingen worden veilig opgeslagen in Firebase, versleuteld bij opslag. We verkopen je gegevens aan niemand. We delen alleen wat nodig is om Gadit te laten werken (opslag, betalingen, contentleveranciers), zoals beschreven in het privacybeleid.",
              "Je kunt je account op elk moment verwijderen via de Account-pagina. Wil je een kopie van je notitieboek of van andere gegevens die we bewaren, schrijf ons dan via deze pagina.",
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
