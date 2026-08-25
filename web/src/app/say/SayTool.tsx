"use client";

/**
 * SayTool — the "Say it in ___" pronunciation-practice tool body.
 *
 * Shared by the /say page (SayClient) and the global SayModal so a kid can
 * open it as a window over their own skinned screen without losing their
 * theme or a way back (Gadi 2026-08-18). Renders just the tool (title, sub,
 * gates, form, result); the page / modal supply the surrounding chrome.
 * Pass `onClose` to show a close (X) button (modal use).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { LANGUAGES, type Lang } from "@/lib/i18n";
import { useLang } from "@/lib/lang-context";
import { useAuth } from "@/lib/auth-context";
import { useHref } from "@/lib/href";
import { TTSButton } from "@/components/design/TTSButton";
import VoiceInput from "@/components/VoiceInput";

type Copy = {
  title: string; sub: string; from: string; to: string;
  placeholder: string; button: string; loading: string;
  hearing: string; tip: string; loginTitle: string; loginBody: string;
  loginCta: string; errGeneric: string; speak: string;
  paidTitle: string; paidBody: string; paidCta: string; close: string;
  practiceTitle: string; practiceHint: string; practiceBtn: string;
  pcCorrect: string; pcClose: string; pcWrong: string; heardLabel: string;
};
const COPY: Partial<Record<Lang, Copy>> = {
  ar: {"title":"قُلها بلغة أخرى","sub":"اكتب جملة، اختر اللغة التي تتعلمها، واسمع بالضبط كيف تُنطق.","from":"سأكتب بـ","to":"قُلها بـ","placeholder":"اكتب جملة لتتدرب على قولها…","button":"قُلها","loading":"جارٍ الترجمة…","hearing":"هكذا تُقال","tip":"نصيحة للنطق","loginTitle":"سجّل الدخول للتدرب","loginBody":"التدرب على الكلام جزء من حسابك في Gadit.","loginCta":"اذهب إلى Gadit","errGeneric":"حدث خطأ ما. حاول مرة أخرى.","speak":"تكلّم بدل الكتابة","paidTitle":"ميزة مدفوعة","paidBody":"قُلها جزء من خطط Clear وDeep وFamily وSchools.","paidCta":"اطّلع على الخطط","close":"إغلاق","practiceTitle":"الآن جرّب أنت","practiceHint":"قُلها بصوت عالٍ، وسأتحقق من نطقك.","practiceBtn":"تدرّب على قولها","pcCorrect":"أحسنت. النطق كان صحيحًا.","pcClose":"أوشكت على النجاح. استمع مرة أخرى وحاول مجددًا.","pcWrong":"ليس تمامًا بعد. استمع إليها مرة أخرى، ثم حاول مرة أخرى.","heardLabel":"سمعت"},
  ru: {"title":"Скажите это на другом языке","sub":"Введите предложение, выберите язык, который вы изучаете, и услышьте, как именно это произносится.","from":"Я напишу на","to":"Сказать на","placeholder":"Введите предложение, чтобы потренироваться его произносить…","button":"Скажите это","loading":"Переводим…","hearing":"Вот как это произносится","tip":"Совет по произношению","loginTitle":"Войдите, чтобы потренироваться","loginBody":"Тренировка речи входит в вашу учётную запись Gadit.","loginCta":"Перейти в Gadit","errGeneric":"Что-то пошло не так. Попробуйте ещё раз.","speak":"Говорите вместо того, чтобы печатать","paidTitle":"Платная функция","paidBody":"«Скажите это» входит в планы Clear, Deep, Family и Schools.","paidCta":"Посмотреть планы","close":"Закрыть","practiceTitle":"Теперь попробуйте вы","practiceHint":"Произнесите вслух, и я проверю ваше произношение.","practiceBtn":"Потренироваться произносить","pcCorrect":"Отлично. Прозвучало верно.","pcClose":"Почти получилось. Послушайте ещё раз и попробуйте снова.","pcWrong":"Пока не совсем. Послушайте ещё раз, а потом попробуйте снова.","heardLabel":"Я услышал"},
  es: {"title":"Dilo en otro idioma","sub":"Escribe una frase, elige el idioma que estás aprendiendo y escucha exactamente cómo se dice.","from":"Escribiré en","to":"Dilo en","placeholder":"Escribe una frase para practicar cómo se dice…","button":"Dilo","loading":"Traduciendo…","hearing":"Así es como se dice","tip":"Consejo de pronunciación","loginTitle":"Inicia sesión para practicar","loginBody":"La práctica de pronunciación forma parte de tu cuenta de Gadit.","loginCta":"Ir a Gadit","errGeneric":"Algo salió mal. Inténtalo de nuevo.","speak":"Habla en lugar de escribir","paidTitle":"Una función de pago","paidBody":"Dilo forma parte de los planes Clear, Deep, Family y Schools.","paidCta":"Ver planes","close":"Cerrar","practiceTitle":"Ahora te toca a ti","practiceHint":"Dilo en voz alta y comprobaré tu pronunciación.","practiceBtn":"Practicar cómo se dice","pcCorrect":"Perfecto. Sonó bien.","pcClose":"Casi lo tienes. Escúchalo de nuevo e inténtalo una vez más.","pcWrong":"Todavía no del todo. Escúchalo otra vez y prueba una vez más.","heardLabel":"Escuché"},
  pt: {"title":"Diga em outro idioma","sub":"Digite uma frase, escolha o idioma que está aprendendo e ouça exatamente como se diz.","from":"Vou escrever em","to":"Diga em","placeholder":"Digite uma frase para praticar como dizê-la…","button":"Diga","loading":"Traduzindo…","hearing":"Veja como se diz","tip":"Dica de pronúncia","loginTitle":"Entre para praticar","loginBody":"A prática de fala faz parte da sua conta Gadit.","loginCta":"Ir para o Gadit","errGeneric":"Algo deu errado. Tente novamente.","speak":"Fale em vez de digitar","paidTitle":"Um recurso pago","paidBody":"Diga faz parte dos planos Clear, Deep, Family e Schools.","paidCta":"Ver planos","close":"Fechar","practiceTitle":"Agora é a sua vez","practiceHint":"Diga em voz alta e eu vou verificar a sua pronúncia.","practiceBtn":"Praticar como dizer","pcCorrect":"Perfeito. Ficou certinho.","pcClose":"Quase lá. Ouça de novo e tente mais uma vez.","pcWrong":"Ainda não foi dessa vez. Ouça de novo e tente mais uma vez.","heardLabel":"Eu ouvi"},
  fr: {"title":"Dites-le dans une autre langue","sub":"Tapez une phrase, choisissez la langue que vous apprenez et écoutez exactement comment la dire.","from":"Je vais écrire en","to":"Dites-le en","placeholder":"Tapez une phrase pour vous entraîner à la dire…","button":"Dites-le","loading":"Traduction…","hearing":"Voici comment le dire","tip":"Conseil de prononciation","loginTitle":"Connectez-vous pour vous entraîner","loginBody":"L'entraînement à l'oral fait partie de votre compte Gadit.","loginCta":"Aller sur Gadit","errGeneric":"Une erreur s'est produite. Réessayez.","speak":"Parlez au lieu d'écrire","paidTitle":"Une fonctionnalité payante","paidBody":"Dites-le fait partie des offres Clear, Deep, Family et Schools.","paidCta":"Voir les offres","close":"Fermer","practiceTitle":"À vous d'essayer","practiceHint":"Dites-le à voix haute et je vérifierai votre prononciation.","practiceBtn":"S'entraîner à le dire","pcCorrect":"Parfait. C'était bien prononcé.","pcClose":"Vous y êtes presque. Écoutez encore et réessayez une fois.","pcWrong":"Pas tout à fait. Écoutez-le encore, puis réessayez.","heardLabel":"J'ai entendu"},
  de: {"title":"Sag es in einer anderen Sprache","sub":"Gib einen Satz ein, wähle die Sprache, die du lernst, und höre, wie man ihn genau ausspricht.","from":"Ich schreibe auf","to":"Sag es auf","placeholder":"Gib einen Satz ein, um das Aussprechen zu üben…","button":"Sag es","loading":"Wird übersetzt…","hearing":"So wird es gesagt","tip":"Aussprache-Tipp","loginTitle":"Melde dich an, um zu üben","loginBody":"Das Sprechtraining gehört zu deinem Gadit-Konto.","loginCta":"Zu Gadit","errGeneric":"Etwas ist schiefgelaufen. Versuch es noch einmal.","speak":"Sprich, statt zu tippen","paidTitle":"Eine kostenpflichtige Funktion","paidBody":"Sag es gehört zu den Tarifen Clear, Deep, Family und Schools.","paidCta":"Tarife ansehen","close":"Schließen","practiceTitle":"Jetzt bist du dran","practiceHint":"Sprich es laut aus, und ich überprüfe deine Aussprache.","practiceBtn":"Aussprechen üben","pcCorrect":"Genau richtig. Das hat gut geklungen.","pcClose":"Fast geschafft. Hör noch einmal zu und versuch es noch einmal.","pcWrong":"Noch nicht ganz. Hör es dir noch einmal an und versuch es erneut.","heardLabel":"Ich habe gehört"},
  cs: {"title":"Řekni to v jiném jazyce","sub":"Napiš větu, vyber jazyk, který se učíš, a poslechni si, jak přesně ji vyslovit.","from":"Budu psát v","to":"Řekni to v","placeholder":"Napiš větu, kterou si chceš procvičit vyslovit…","button":"Řekni to","loading":"Překládám…","hearing":"Takhle se to řekne","tip":"Tip na výslovnost","loginTitle":"Přihlas se a procvičuj","loginBody":"Procvičování mluvení je součástí tvého účtu Gadit.","loginCta":"Přejít na Gadit","errGeneric":"Něco se pokazilo. Zkus to znovu.","speak":"Mluv místo psaní","paidTitle":"Placená funkce","paidBody":"Řekni to je součástí plánů Clear, Deep, Family a Schools.","paidCta":"Zobrazit plány","close":"Zavřít","practiceTitle":"Teď to zkus ty","practiceHint":"Řekni to nahlas a já zkontroluju tvou výslovnost.","practiceBtn":"Procvičit vyslovování","pcCorrect":"Přesně tak. Znělo to správně.","pcClose":"Skoro to máš. Poslechni si to znovu a zkus to ještě jednou.","pcWrong":"Ještě to není ono. Poslechni si to znovu a zkus to ještě jednou.","heardLabel":"Slyšel jsem"},
  sk: {"title":"Povedz to v inom jazyku","sub":"Napíš vetu, vyber jazyk, ktorý sa učíš, a vypočuj si, ako presne ju vysloviť.","from":"Budem písať v","to":"Povedz to v","placeholder":"Napíš vetu, ktorú si chceš precvičiť vysloviť…","button":"Povedz to","loading":"Prekladám…","hearing":"Takto sa to povie","tip":"Tip na výslovnosť","loginTitle":"Prihlás sa a precvičuj","loginBody":"Precvičovanie rozprávania je súčasťou tvojho účtu Gadit.","loginCta":"Prejsť na Gadit","errGeneric":"Niečo sa pokazilo. Skús to znova.","speak":"Hovor namiesto písania","paidTitle":"Platená funkcia","paidBody":"Povedz to je súčasťou plánov Clear, Deep, Family a Schools.","paidCta":"Zobraziť plány","close":"Zavrieť","practiceTitle":"Teraz to skús ty","practiceHint":"Povedz to nahlas a ja skontrolujem tvoju výslovnosť.","practiceBtn":"Precvičiť vyslovovanie","pcCorrect":"Presne tak. Znelo to správne.","pcClose":"Takmer to máš. Vypočuj si to znova a skús to ešte raz.","pcWrong":"Ešte to nie je ono. Vypočuj si to znova a skús to ešte raz.","heardLabel":"Počul som"},
  it: {"title":"Dillo in un'altra lingua","sub":"Scrivi una frase, scegli la lingua che stai imparando e ascolta esattamente come si dice.","from":"Scriverò in","to":"Dillo in","placeholder":"Scrivi una frase per esercitarti a dirla…","button":"Dillo","loading":"Traduzione…","hearing":"Ecco come si dice","tip":"Consiglio di pronuncia","loginTitle":"Accedi per esercitarti","loginBody":"L'esercizio di pronuncia fa parte del tuo account Gadit.","loginCta":"Vai su Gadit","errGeneric":"Qualcosa è andato storto. Riprova.","speak":"Parla invece di scrivere","paidTitle":"Una funzione a pagamento","paidBody":"Dillo fa parte dei piani Clear, Deep, Family e Schools.","paidCta":"Vedi i piani","close":"Chiudi","practiceTitle":"Ora prova tu","practiceHint":"Dillo ad alta voce e controllerò la tua pronuncia.","practiceBtn":"Esercitati a dirlo","pcCorrect":"Perfetto. Suonava bene.","pcClose":"Ci sei quasi. Ascolta di nuovo e riprova ancora una volta.","pcWrong":"Non ancora del tutto. Ascoltalo di nuovo e riprova.","heardLabel":"Ho sentito"},
  ja: {"title":"別の言語で言ってみよう","sub":"文を入力して、学んでいる言語を選ぶと、正しい言い方をそのまま聞けます。","from":"入力する言語","to":"言ってみる言語","placeholder":"言う練習をしたい文を入力してください…","button":"言ってみる","loading":"翻訳しています…","hearing":"こう言います","tip":"発音のコツ","loginTitle":"ログインして練習しましょう","loginBody":"話す練習は Gadit アカウントの一部です。","loginCta":"Gadit へ","errGeneric":"問題が発生しました。もう一度お試しください。","speak":"入力する代わりに話す","paidTitle":"有料の機能です","paidBody":"「言ってみる」は Clear、Deep、Family、Schools の各プランに含まれています。","paidCta":"プランを見る","close":"閉じる","practiceTitle":"今度はあなたの番です","practiceHint":"声に出して言ってみてください。発音をチェックします。","practiceBtn":"言う練習をする","pcCorrect":"ばっちりです。正しく言えていました。","pcClose":"もう少しです。もう一度聞いて、もう一回言ってみましょう。","pcWrong":"まだ少し違います。もう一度聞いてから、もう一回言ってみましょう。","heardLabel":"こう聞こえました"},
  hi: {"title":"इसे किसी दूसरी भाषा में कहें","sub":"एक वाक्य लिखें, जो भाषा आप सीख रहे हैं उसे चुनें, और सुनें कि इसे कैसे कहा जाता है।","from":"मैं इसमें लिखूँगा","to":"इसमें कहें","placeholder":"कहने का अभ्यास करने के लिए एक वाक्य लिखें…","button":"इसे कहें","loading":"अनुवाद हो रहा है…","hearing":"इसे ऐसे कहते हैं","tip":"उच्चारण की सलाह","loginTitle":"अभ्यास के लिए साइन इन करें","loginBody":"बोलने का अभ्यास आपके Gadit खाते का हिस्सा है।","loginCta":"Gadit पर जाएँ","errGeneric":"कुछ गड़बड़ हो गई। फिर से कोशिश करें।","speak":"लिखने के बजाय बोलें","paidTitle":"एक सशुल्क सुविधा","paidBody":"इसे कहें Clear, Deep, Family और Schools प्लान का हिस्सा है।","paidCta":"प्लान देखें","close":"बंद करें","practiceTitle":"अब आप कोशिश करें","practiceHint":"इसे ज़ोर से कहें, और मैं आपका उच्चारण जाँचूँगा।","practiceBtn":"कहने का अभ्यास करें","pcCorrect":"बिलकुल सही। यह सही लगा।","pcClose":"बस थोड़ा और। एक बार फिर सुनें और दोबारा कोशिश करें।","pcWrong":"अभी पूरी तरह नहीं। इसे फिर से सुनें, फिर एक बार और कोशिश करें।","heardLabel":"मैंने सुना"},
  am: {"title":"በሌላ ቋንቋ ተናገረው","sub":"ዓረፍተ ነገር ጻፍ፣ የምትማረውን ቋንቋ ምረጥ፣ እና እንዴት እንደሚባል በትክክል ስማ።","from":"የምጽፈው በ","to":"ተናገረው በ","placeholder":"ለመናገር ለመለማመድ ዓረፍተ ነገር ጻፍ…","button":"ተናገረው","loading":"በመተርጎም ላይ…","hearing":"እንዴት እንደሚባል ይኸውልህ","tip":"የአነባበብ ጠቃሚ ምክር","loginTitle":"ለመለማመድ ግባ","loginBody":"የመናገር ልምምድ የGADIT መለያህ አካል ነው።","loginCta":"ወደ GADIT ሂድ","errGeneric":"የሆነ ስህተት ተፈጥሯል። እንደገና ሞክር።","speak":"ከመጻፍ ይልቅ ተናገር","paidTitle":"የሚከፈልበት ባህሪ","paidBody":"Say it የClear፣ Deep፣ Family እና Schools እቅዶች አካል ነው።","paidCta":"እቅዶችን እይ","close":"ዝጋ","practiceTitle":"አሁን አንተ ሞክር","practiceHint":"ጮክ ብለህ ተናገረው፣ እኔም አነባበብህን አረጋግጣለሁ።","practiceBtn":"መናገርን ተለማመድ","pcCorrect":"በትክክል። ልክ ተሰማ።","pcClose":"ልትደርስበት ተቃርበሃል። እንደገና አዳምጥና አንድ ጊዜ ሞክር።","pcWrong":"ገና አልደረስክም። እንደገና ስማውና እንደገና ሞክር።","heardLabel":"የሰማሁት"},
  uk: {"title":"Скажіть це іншою мовою","sub":"Наберіть речення, оберіть мову, яку вивчаєте, і почуйте, як саме це вимовляти.","from":"Я пишу","to":"Скажіть це","placeholder":"Наберіть речення, щоб потренувати вимову…","button":"Сказати","loading":"Перекладаємо…","hearing":"Ось як це вимовити","tip":"Порада щодо вимови","loginTitle":"Увійдіть, щоб тренуватися","loginBody":"Практика мовлення входить до вашого облікового запису GADIT.","loginCta":"Перейти до GADIT","errGeneric":"Щось пішло не так. Спробуйте ще раз.","speak":"Говоріть замість того, щоб набирати","paidTitle":"Платна функція","paidBody":"Say it входить до планів Clear, Deep, Family і Schools.","paidCta":"Переглянути плани","close":"Закрити","practiceTitle":"Тепер ваша черга","practiceHint":"Скажіть це вголос, а я перевірю вашу вимову.","practiceBtn":"Тренувати вимову","pcCorrect":"Точно в ціль. Звучало правильно.","pcClose":"Майже вийшло. Послухайте ще раз і спробуйте знову.","pcWrong":"Поки що не зовсім. Послухайте ще раз, а потім спробуйте знову.","heardLabel":"Я почув"},
  tr: {"title":"Başka bir dilde söyle","sub":"Bir cümle yaz, öğrendiğin dili seç ve tam olarak nasıl söyleneceğini dinle.","from":"Şu dilde yazacağım","to":"Şu dilde söyle","placeholder":"Söylemeyi çalışmak için bir cümle yaz…","button":"Söyle","loading":"Çevriliyor…","hearing":"İşte nasıl söyleneceği","tip":"Telaffuz ipucu","loginTitle":"Çalışmak için giriş yap","loginBody":"Konuşma pratiği GADIT hesabının bir parçasıdır.","loginCta":"GADIT'e git","errGeneric":"Bir şeyler ters gitti. Tekrar dene.","speak":"Yazmak yerine konuş","paidTitle":"Ücretli bir özellik","paidBody":"Say it, Clear, Deep, Family ve Schools planlarının bir parçasıdır.","paidCta":"Planları gör","close":"Kapat","practiceTitle":"Şimdi sen dene","practiceHint":"Yüksek sesle söyle, ben de telaffuzunu kontrol edeyim.","practiceBtn":"Söylemeyi çalış","pcCorrect":"Tam isabet. Doğru duyuldu.","pcClose":"Neredeyse oldu. Tekrar dinle ve bir kez daha dene.","pcWrong":"Henüz tam değil. Tekrar dinle, sonra bir kez daha dene.","heardLabel":"Ben şunu duydum"},
  pl: {"title":"Powiedz to w innym języku","sub":"Wpisz zdanie, wybierz język, którego się uczysz, i posłuchaj, jak dokładnie to wymówić.","from":"Będę pisać w","to":"Powiedz to w","placeholder":"Wpisz zdanie, aby poćwiczyć wymowę…","button":"Powiedz to","loading":"Tłumaczenie…","hearing":"Oto jak to powiedzieć","tip":"Wskazówka dotycząca wymowy","loginTitle":"Zaloguj się, aby ćwiczyć","loginBody":"Ćwiczenie mówienia jest częścią Twojego konta GADIT.","loginCta":"Przejdź do GADIT","errGeneric":"Coś poszło nie tak. Spróbuj ponownie.","speak":"Mów zamiast pisać","paidTitle":"Funkcja płatna","paidBody":"Say it jest częścią planów Clear, Deep, Family i Schools.","paidCta":"Zobacz plany","close":"Zamknij","practiceTitle":"Teraz Twoja kolej","practiceHint":"Powiedz to na głos, a ja sprawdzę Twoją wymowę.","practiceBtn":"Ćwicz wymowę","pcCorrect":"Idealnie. Brzmiało dobrze.","pcClose":"Już prawie. Posłuchaj jeszcze raz i spróbuj ponownie.","pcWrong":"Jeszcze nie do końca. Posłuchaj jeszcze raz, a potem spróbuj ponownie.","heardLabel":"Usłyszałem"},
  fa: {"title":"آن را به زبان دیگری بگو","sub":"یک جمله بنویس، زبانی را که یاد می‌گیری انتخاب کن و دقیقاً بشنو که چطور گفته می‌شود.","from":"می‌نویسم به","to":"بگو به","placeholder":"برای تمرین گفتن، یک جمله بنویس…","button":"بگو","loading":"در حال ترجمه…","hearing":"این‌طور گفته می‌شود","tip":"نکته تلفظ","loginTitle":"برای تمرین وارد شو","loginBody":"تمرین صحبت کردن بخشی از حساب GADIT توست.","loginCta":"به GADIT برو","errGeneric":"مشکلی پیش آمد. دوباره امتحان کن.","speak":"به‌جای نوشتن، صحبت کن","paidTitle":"یک ویژگی پولی","paidBody":"Say it بخشی از پلن‌های Clear، Deep، Family و Schools است.","paidCta":"دیدن پلن‌ها","close":"بستن","practiceTitle":"حالا تو امتحان کن","practiceHint":"با صدای بلند بگو تا تلفظت را بررسی کنم.","practiceBtn":"تمرین گفتن","pcCorrect":"دقیقاً درست. درست به گوش رسید.","pcClose":"نزدیک بودی. دوباره گوش کن و یک بار دیگر امتحان کن.","pcWrong":"هنوز کامل نیست. دوباره بشنو و بعد یک بار دیگر امتحان کن.","heardLabel":"من شنیدم"},
  id: {"title":"Ucapkan dalam bahasa lain","sub":"Ketik sebuah kalimat, pilih bahasa yang kamu pelajari, dan dengar persis cara mengucapkannya.","from":"Aku akan mengetik dalam","to":"Ucapkan dalam","placeholder":"Ketik kalimat untuk melatih pengucapan…","button":"Ucapkan","loading":"Menerjemahkan…","hearing":"Beginilah cara mengucapkannya","tip":"Tips pengucapan","loginTitle":"Masuk untuk berlatih","loginBody":"Latihan berbicara adalah bagian dari akun GADIT-mu.","loginCta":"Ke GADIT","errGeneric":"Terjadi kesalahan. Coba lagi.","speak":"Bicara saja daripada mengetik","paidTitle":"Fitur berbayar","paidBody":"Say it termasuk dalam paket Clear, Deep, Family, dan Schools.","paidCta":"Lihat paket","close":"Tutup","practiceTitle":"Sekarang giliranmu","practiceHint":"Ucapkan dengan lantang, dan aku akan memeriksa pengucapanmu.","practiceBtn":"Latih pengucapan","pcCorrect":"Tepat sekali. Terdengar benar.","pcClose":"Hampir saja. Dengar sekali lagi dan coba sekali lagi.","pcWrong":"Belum pas. Dengar lagi, lalu coba sekali lagi.","heardLabel":"Aku mendengar"},
  nl: {"title":"Zeg het in een andere taal","sub":"Typ een zin, kies de taal die je leert en hoor precies hoe je het zegt.","from":"Ik typ in","to":"Zeg het in","placeholder":"Typ een zin om het uitspreken te oefenen…","button":"Zeg het","loading":"Vertalen…","hearing":"Zo zeg je het","tip":"Uitspraaktip","loginTitle":"Log in om te oefenen","loginBody":"Spreekoefening hoort bij je GADIT-account.","loginCta":"Ga naar GADIT","errGeneric":"Er ging iets mis. Probeer het opnieuw.","speak":"Spreek in plaats van typen","paidTitle":"Een betaalde functie","paidBody":"Say it hoort bij de plannen Clear, Deep, Family en Schools.","paidCta":"Bekijk plannen","close":"Sluiten","practiceTitle":"Nu jij","practiceHint":"Zeg het hardop, dan controleer ik je uitspraak.","practiceBtn":"Oefen het uitspreken","pcCorrect":"Helemaal goed. Dat klonk juist.","pcClose":"Bijna. Luister nog eens en probeer het nog een keer.","pcWrong":"Nog niet helemaal. Luister het opnieuw en probeer het dan nog eens.","heardLabel":"Ik hoorde"},
  el: {"title":"Πες το σε άλλη γλώσσα","sub":"Γράψε μια πρόταση, διάλεξε τη γλώσσα που μαθαίνεις και άκουσε ακριβώς πώς να την πεις.","from":"Θα γράψω στα","to":"Πες το στα","placeholder":"Γράψε μια πρόταση για να εξασκηθείς στην προφορά…","button":"Πες το","loading":"Μετάφραση…","hearing":"Να πώς το λες","tip":"Συμβουλή προφοράς","loginTitle":"Συνδέσου για να εξασκηθείς","loginBody":"Η εξάσκηση στην ομιλία είναι μέρος του λογαριασμού σου στο GADIT.","loginCta":"Πήγαινε στο GADIT","errGeneric":"Κάτι πήγε στραβά. Δοκίμασε ξανά.","speak":"Μίλα αντί να πληκτρολογείς","paidTitle":"Λειτουργία επί πληρωμή","paidBody":"Το Say it είναι μέρος των πλάνων Clear, Deep, Family και Schools.","paidCta":"Δες τα πλάνα","close":"Κλείσιμο","practiceTitle":"Τώρα δοκίμασε εσύ","practiceHint":"Πες το δυνατά κι εγώ θα ελέγξω την προφορά σου.","practiceBtn":"Εξασκήσου στην προφορά","pcCorrect":"Ακριβώς. Ακούστηκε σωστό.","pcClose":"Σχεδόν το πέτυχες. Άκουσέ το ξανά και δοκίμασε άλλη μια φορά.","pcWrong":"Όχι ακόμα. Άκουσέ το ξανά και μετά δοκίμασε άλλη μια φορά.","heardLabel":"Άκουσα"},
  zu: {"title":"Kusho ngolunye ulimi","sub":"Bhala umusho, ukhethe ulimi olufundayo, futhi uzwe ukuthi kushiwo kanjani ncamashi.","from":"Ngizobhala nge","to":"Kusho nge","placeholder":"Bhala umusho ukuze uzijwayeze ukukhuluma…","button":"Kusho","loading":"Iyahumusha…","hearing":"Nakhu ukuthi kushiwo kanjani","tip":"Ithiphu lokuphimisela","loginTitle":"Ngena ukuze uzijwayeze","loginBody":"Ukuzijwayeza ukukhuluma kuyingxenye ye-akhawunti yakho ye-GADIT.","loginCta":"Iya ku-GADIT","errGeneric":"Kukhona okungahambanga kahle. Zama futhi.","speak":"Khuluma esikhundleni sokubhala","paidTitle":"Isici esikhokhelwayo","paidBody":"I-Say it iyingxenye yezinhlelo ze-Clear, Deep, Family kanye ne-Schools.","paidCta":"Buka izinhlelo","close":"Vala","practiceTitle":"Manje zama wena","practiceHint":"Kusho ngokuzwakalayo, mina ngizohlola ukuphimisela kwakho.","practiceBtn":"Zijwayeze ukukusho","pcCorrect":"Uqondile. Kuzwakale kulungile.","pcClose":"Usucishe wafika. Lalela futhi bese uzama futhi.","pcWrong":"Awukafiki okwamanje. Kuzwe futhi, bese uzama futhi.","heardLabel":"Ngizwe"},
  vi: {"title":"Nói câu này bằng ngôn ngữ khác","sub":"Nhập một câu, chọn ngôn ngữ bạn đang học, và nghe cách phát âm chính xác.","from":"Tôi sẽ nhập bằng","to":"Nói bằng","placeholder":"Nhập một câu để luyện nói…","button":"Nói đi","loading":"Đang dịch…","hearing":"Đây là cách nói","tip":"Mẹo phát âm","loginTitle":"Đăng nhập để luyện tập","loginBody":"Luyện nói là một phần trong tài khoản GADIT của bạn.","loginCta":"Đến GADIT","errGeneric":"Đã có lỗi xảy ra. Hãy thử lại.","speak":"Nói thay vì gõ","paidTitle":"Tính năng trả phí","paidBody":"Say it thuộc các gói Clear, Deep, Family và Schools.","paidCta":"Xem các gói","close":"Đóng","practiceTitle":"Giờ tới lượt bạn","practiceHint":"Hãy nói to lên, tôi sẽ kiểm tra cách phát âm của bạn.","practiceBtn":"Luyện phát âm","pcCorrect":"Chuẩn luôn. Nghe rất đúng.","pcClose":"Gần đúng rồi. Nghe lại một lần nữa và thử lại nhé.","pcWrong":"Chưa đúng lắm. Nghe lại rồi thử thêm một lần nữa nhé.","heardLabel":"Tôi nghe được"},
  fil: {"title":"Sabihin ito sa ibang wika","sub":"Mag-type ng pangungusap, piliin ang wikang inaaral mo, at pakinggan kung paano ito eksaktong sabihin.","from":"Magta-type ako sa","to":"Sabihin ito sa","placeholder":"Mag-type ng pangungusap para pagsanayang sabihin…","button":"Sabihin ito","loading":"Isinasalin…","hearing":"Ganito ito sabihin","tip":"Tip sa pagbigkas","loginTitle":"Mag-sign in para magsanay","loginBody":"Ang pagsasanay sa pagsasalita ay bahagi ng iyong Gadit account.","loginCta":"Pumunta sa Gadit","errGeneric":"May nangyaring mali. Subukan ulit.","speak":"Magsalita sa halip na mag-type","paidTitle":"Isang bayad na feature","paidBody":"Ang Say it ay bahagi ng mga planong Clear, Deep, Family at Schools.","paidCta":"Tingnan ang mga plano","close":"Isara","practiceTitle":"Subukan mo naman ngayon","practiceHint":"Sabihin ito nang malakas, at titingnan ko ang iyong pagbigkas.","practiceBtn":"Pagsanayang sabihin","pcCorrect":"Tama na tama. Maganda ang pagkakabigkas mo.","pcClose":"Halos tama na. Pakinggan ulit at subukan pa isang beses.","pcWrong":"Hindi pa masyado. Pakinggan ulit, saka subukang muli.","heardLabel":"Narinig ko"},
  af: {"title":"Sê dit in 'n ander taal","sub":"Tik 'n sin in, kies die taal wat jy leer, en hoor presies hoe om dit te sê.","from":"Ek tik in","to":"Sê dit in","placeholder":"Tik 'n sin in om te oefen om te sê…","button":"Sê dit","loading":"Vertaal tans…","hearing":"So sê jy dit","tip":"Uitspraakwenk","loginTitle":"Meld aan om te oefen","loginBody":"Spraakoefening is deel van jou Gadit-rekening.","loginCta":"Gaan na Gadit","errGeneric":"Iets het verkeerd geloop. Probeer weer.","speak":"Praat in plaas van tik","paidTitle":"'n Betaalde funksie","paidBody":"Say it is deel van die Clear-, Deep-, Family- en Schools-planne.","paidCta":"Sien planne","close":"Maak toe","practiceTitle":"Nou probeer jy","practiceHint":"Sê dit hardop, en ek sal jou uitspraak nagaan.","practiceBtn":"Oefen om dit te sê","pcCorrect":"Presies reg. Dit het reg geklink.","pcClose":"Amper daar. Luister weer en gee dit nog een kans.","pcWrong":"Nog nie heeltemal nie. Hoor dit weer, en probeer dan nog 'n keer.","heardLabel":"Ek het gehoor"},
  sw: {"title":"Iseme kwa lugha nyingine","sub":"Andika sentensi, chagua lugha unayojifunza, na usikie hasa jinsi ya kuisema.","from":"Nitaandika kwa","to":"Iseme kwa","placeholder":"Andika sentensi ili ujizoeze kuisema…","button":"Iseme","loading":"Inatafsiri…","hearing":"Hivi ndivyo ya kuisema","tip":"Dokezo la matamshi","loginTitle":"Ingia ili ujizoeze","loginBody":"Mazoezi ya kuzungumza ni sehemu ya akaunti yako ya Gadit.","loginCta":"Nenda kwa Gadit","errGeneric":"Hitilafu imetokea. Jaribu tena.","speak":"Sema badala ya kuandika","paidTitle":"Kipengele cha kulipia","paidBody":"Say it ni sehemu ya mipango ya Clear, Deep, Family na Schools.","paidCta":"Angalia mipango","close":"Funga","practiceTitle":"Sasa jaribu wewe","practiceHint":"Isema kwa sauti, nami nitakagua matamshi yako.","practiceBtn":"Jizoeze kuisema","pcCorrect":"Sawa kabisa. Ilisikika vizuri.","pcClose":"Umekaribia. Sikiliza tena na ujaribu mara moja zaidi.","pcWrong":"Bado kidogo. Isikie tena, kisha ujaribu tena.","heardLabel":"Nilisikia"},
  "zh-CN": {"title":"用另一种语言说出来","sub":"输入一个句子，选择你正在学的语言，听听它到底该怎么说。","from":"我要输入的语言","to":"用这种语言说","placeholder":"输入一个句子来练习说……","button":"说出来","loading":"正在翻译……","hearing":"这样说就对了","tip":"发音提示","loginTitle":"登录后即可练习","loginBody":"口语练习是你 Gadit 账户的一部分。","loginCta":"前往 Gadit","errGeneric":"出了点问题，请再试一次。","speak":"用说的，不用打字","paidTitle":"付费功能","paidBody":"Say it 属于 Clear、Deep、Family 和 Schools 套餐。","paidCta":"查看套餐","close":"关闭","practiceTitle":"现在换你试试","practiceHint":"大声说出来，我来帮你检查发音。","practiceBtn":"练习说这句","pcCorrect":"太准了，听起来完全正确。","pcClose":"就差一点。再听一遍，再试一次。","pcWrong":"还差一点。再听一遍，然后再试一次。","heardLabel":"我听到的是"},
  "zh-TW": {"title":"用另一種語言說出來","sub":"輸入一個句子，選擇你正在學的語言，聽聽它到底該怎麼說。","from":"我要輸入的語言","to":"用這種語言說","placeholder":"輸入一個句子來練習說……","button":"說出來","loading":"正在翻譯……","hearing":"這樣說就對了","tip":"發音提示","loginTitle":"登入後即可練習","loginBody":"口說練習是你 Gadit 帳戶的一部分。","loginCta":"前往 Gadit","errGeneric":"出了點問題，請再試一次。","speak":"用說的，不用打字","paidTitle":"付費功能","paidBody":"Say it 屬於 Clear、Deep、Family 和 Schools 方案。","paidCta":"查看方案","close":"關閉","practiceTitle":"現在換你試試","practiceHint":"大聲說出來，我來幫你檢查發音。","practiceBtn":"練習說這句","pcCorrect":"太準了，聽起來完全正確。","pcClose":"就差一點。再聽一遍，再試一次。","pcWrong":"還差一點。再聽一遍，然後再試一次。","heardLabel":"我聽到的是"},
  ko: {"title":"다른 언어로 말해 보세요","sub":"문장을 입력하고 배우고 있는 언어를 선택하면, 정확히 어떻게 말하는지 들려드려요.","from":"입력할 언어","to":"이 언어로 말하기","placeholder":"말하기 연습할 문장을 입력하세요…","button":"말하기","loading":"번역 중…","hearing":"이렇게 말하면 돼요","tip":"발음 팁","loginTitle":"로그인하고 연습하세요","loginBody":"말하기 연습은 회원님의 Gadit 계정에 포함되어 있어요.","loginCta":"Gadit으로 가기","errGeneric":"문제가 발생했어요. 다시 시도해 주세요.","speak":"입력하지 말고 말해 보세요","paidTitle":"유료 기능","paidBody":"Say it은 Clear, Deep, Family, Schools 요금제에 포함되어 있어요.","paidCta":"요금제 보기","close":"닫기","practiceTitle":"이제 직접 해 보세요","practiceHint":"소리 내어 말해 보세요. 제가 발음을 확인해 드릴게요.","practiceBtn":"말하기 연습","pcCorrect":"정확해요. 아주 잘 들렸어요.","pcClose":"거의 다 됐어요. 다시 듣고 한 번만 더 해 보세요.","pcWrong":"아직 조금 부족해요. 다시 듣고 한 번 더 해 보세요.","heardLabel":"이렇게 들렸어요"},
  th: {"title":"พูดเป็นอีกภาษาหนึ่ง","sub":"พิมพ์ประโยค เลือกภาษาที่คุณกำลังเรียน แล้วฟังว่าต้องพูดอย่างไรให้ถูก","from":"ฉันจะพิมพ์เป็น","to":"พูดเป็นภาษา","placeholder":"พิมพ์ประโยคเพื่อฝึกพูด…","button":"พูดเลย","loading":"กำลังแปล…","hearing":"พูดแบบนี้ได้เลย","tip":"เคล็ดลับการออกเสียง","loginTitle":"เข้าสู่ระบบเพื่อฝึก","loginBody":"การฝึกพูดเป็นส่วนหนึ่งของบัญชี Gadit ของคุณ","loginCta":"ไปที่ Gadit","errGeneric":"เกิดข้อผิดพลาด ลองอีกครั้ง","speak":"พูดแทนการพิมพ์","paidTitle":"ฟีเจอร์แบบเสียเงิน","paidBody":"Say it เป็นส่วนหนึ่งของแพ็กเกจ Clear, Deep, Family และ Schools","paidCta":"ดูแพ็กเกจ","close":"ปิด","practiceTitle":"ตอนนี้ลองพูดดู","practiceHint":"พูดออกมาดังๆ แล้วฉันจะช่วยตรวจการออกเสียงให้","practiceBtn":"ฝึกพูดประโยคนี้","pcCorrect":"เป๊ะเลย ฟังดูถูกต้องมาก","pcClose":"เกือบแล้ว ฟังอีกครั้งแล้วลองใหม่อีกที","pcWrong":"ยังไม่ค่อยได้ ฟังอีกครั้งแล้วลองใหม่อีกที","heardLabel":"ฉันได้ยินว่า"},
  bn: {"title":"অন্য একটি ভাষায় বলুন","sub":"একটি বাক্য টাইপ করুন, আপনি যে ভাষা শিখছেন তা বেছে নিন, আর ঠিক কীভাবে বলতে হয় তা শুনুন।","from":"আমি টাইপ করব","to":"এই ভাষায় বলুন","placeholder":"বলার অনুশীলন করতে একটি বাক্য টাইপ করুন…","button":"বলুন","loading":"অনুবাদ করা হচ্ছে…","hearing":"এভাবে বলতে হয়","tip":"উচ্চারণের টিপ","loginTitle":"অনুশীলন করতে সাইন ইন করুন","loginBody":"বলার অনুশীলন আপনার Gadit অ্যাকাউন্টের অংশ।","loginCta":"Gadit-এ যান","errGeneric":"কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।","speak":"টাইপ করার বদলে বলুন","paidTitle":"একটি পেইড ফিচার","paidBody":"Say it হলো Clear, Deep, Family ও Schools প্ল্যানের অংশ।","paidCta":"প্ল্যান দেখুন","close":"বন্ধ করুন","practiceTitle":"এবার আপনি চেষ্টা করুন","practiceHint":"জোরে বলুন, আর আমি আপনার উচ্চারণ যাচাই করব।","practiceBtn":"বলার অনুশীলন করুন","pcCorrect":"একদম ঠিক। শুনতে নিখুঁত লাগল।","pcClose":"প্রায় হয়ে গেছে। আরেকবার শুনে আরেকবার চেষ্টা করুন।","pcWrong":"এখনো ঠিক হয়নি। আবার শুনুন, তারপর আরেকবার চেষ্টা করুন।","heardLabel":"আমি শুনলাম"},
  da: {"title":"Sig det på et andet sprog","sub":"Skriv en sætning, vælg det sprog du er ved at lære, og hør præcis hvordan du siger det.","from":"Jeg skriver på","to":"Sig det på","placeholder":"Skriv en sætning for at øve dig i at sige den…","button":"Sig det","loading":"Oversætter…","hearing":"Sådan siger du det","tip":"Udtaletip","loginTitle":"Log ind for at øve","loginBody":"Taleøvelse er en del af din Gadit-konto.","loginCta":"Gå til Gadit","errGeneric":"Noget gik galt. Prøv igen.","speak":"Tal i stedet for at skrive","paidTitle":"En betalt funktion","paidBody":"Say it er en del af planerne Clear, Deep, Family og Schools.","paidCta":"Se planer","close":"Luk","practiceTitle":"Nu prøver du","practiceHint":"Sig det højt, så tjekker jeg din udtale.","practiceBtn":"Øv dig i at sige det","pcCorrect":"Helt rigtigt. Det lød korrekt.","pcClose":"Næsten der. Lyt igen og giv det et forsøg mere.","pcWrong":"Ikke helt endnu. Hør det igen, og prøv så en gang til.","heardLabel":"Jeg hørte"},
  hu: {"title":"Mondd egy másik nyelven","sub":"Írj be egy mondatot, válaszd ki a tanult nyelvet, és hallgasd meg, pontosan hogyan kell kimondani.","from":"Ezen a nyelven írok","to":"Mondd ezen a nyelven","placeholder":"Írj be egy mondatot, hogy gyakorold a kimondását…","button":"Mondd ki","loading":"Fordítás…","hearing":"Így kell kimondani","tip":"Kiejtési tipp","loginTitle":"Jelentkezz be a gyakorláshoz","loginBody":"A beszédgyakorlás a Gadit-fiókod része.","loginCta":"Irány a Gadit","errGeneric":"Valami hiba történt. Próbáld újra.","speak":"Beszélj gépelés helyett","paidTitle":"Fizetős funkció","paidBody":"A Say it a Clear, Deep, Family és Schools csomagok része.","paidCta":"Csomagok megtekintése","close":"Bezárás","practiceTitle":"Most próbáld te","practiceHint":"Mondd ki hangosan, és ellenőrzöm a kiejtésed.","practiceBtn":"Gyakorold a kimondását","pcCorrect":"Telitalálat. Ez jól hangzott.","pcClose":"Majdnem megvan. Hallgasd meg újra, és próbáld meg még egyszer.","pcWrong":"Még nem egészen. Halld újra, aztán próbáld meg még egyszer.","heardLabel":"Ezt hallottam"},
  en: {
    title: "Say it in another language",
    sub: "Type a sentence, pick the language you're learning, and hear exactly how to say it.",
    from: "I'll type in", to: "Say it in",
    placeholder: "Type a sentence to practise saying…",
    button: "Say it", loading: "Translating…",
    hearing: "Here's how to say it", tip: "Pronunciation tip",
    loginTitle: "Sign in to practise",
    loginBody: "Speaking practice is part of your Gadit account.",
    loginCta: "Go to Gadit",
    errGeneric: "Something went wrong. Try again.",
    speak: "Speak instead of typing",
    paidTitle: "A paid feature",
    paidBody: "Say it is part of the Clear, Deep, Family and Schools plans.",
    paidCta: "See plans", close: "Close",
    practiceTitle: "Now you try",
    practiceHint: "Say it aloud, and I'll check your pronunciation.",
    practiceBtn: "Practice saying it",
    pcCorrect: "Spot on. That sounded right.",
    pcClose: "Almost there. Listen again and give it one more go.",
    pcWrong: "Not quite yet. Hear it again, then try once more.",
    heardLabel: "I heard",
  },
  he: {
    title: "תגיד את זה בשפה אחרת",
    sub: "מקלידים משפט, בוחרים את השפה שאתה לומד, ושומעים בדיוק איך אומרים את זה.",
    from: "אקליד ב", to: "תגיד ב",
    placeholder: "הקלד משפט לתרגול…",
    button: "תגיד את זה", loading: "מתרגם…",
    hearing: "ככה אומרים את זה", tip: "טיפ להגייה",
    loginTitle: "התחבר כדי לתרגל",
    loginBody: "תרגול דיבור הוא חלק מהחשבון שלך בגדית.",
    loginCta: "לגדית",
    errGeneric: "משהו השתבש. נסה שוב.",
    speak: "לדבר במקום להקליד",
    paidTitle: "פיצ'ר בתוכניות בתשלום",
    paidBody: "תגיד את זה זמין בתוכניות Clear, Deep, Family ו-Schools.",
    paidCta: "לתוכניות", close: "סגור",
    practiceTitle: "עכשיו תורך",
    practiceHint: "אמרו את זה בקול, ואבדוק את ההגייה.",
    practiceBtn: "תרגול הגייה",
    pcCorrect: "מדויק. נשמע נכון.",
    pcClose: "כמעט. הקשיבו שוב ונסו עוד פעם.",
    pcWrong: "עוד לא בדיוק. הקשיבו שוב, ותנסו שוב.",
    heardLabel: "שמעתי",
  },
};
function copy(lang: Lang): Copy {
  return COPY[lang] ?? COPY.en!;
}
function dirOf(code: string): "ltr" | "rtl" {
  return LANGUAGES.find((l) => l.code === code)?.dir ?? "ltr";
}

// ── Pronunciation scoring (Gadi 2026-08-25) ──────────────────────────────
// The learner speaks the target phrase; /api/transcribe (Whisper, hinted to the
// target language) returns what it heard. If the target-language recognizer
// produces the target word, the pronunciation was clear enough. Normalize both
// (case, punctuation, and Latin/Hebrew/Arabic diacritics) and compare.
function normPron(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-֑ͯ-ׇֽֿׁׂًׅׄ-ٰٟ]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}
// A 1-to-5 star score, the scale everyone knows from reviews (Gadi 2026-08-25):
// 5 = spot on, and the empty stars make it obvious how much room is left. The
// tier drives the color + message (4-5 green, 3 amber, 1-2 red). Tuned to be
// encouraging without cheapening a perfect score; short words and near-
// containment get a little slack, since one missed sound is a big fraction of a
// short word.
function scoreStars(target: string, spoken: string): { stars: number; tier: "correct" | "close" | "wrong" } {
  const t = normPron(target), s = normPron(spoken);
  let eff: number;
  if (!s || !t) eff = 0;
  else if (t === s) eff = 1;
  else if (t.length >= 2 && s.length >= 2 && (t.includes(s) || s.includes(t))) {
    eff = Math.max(Math.min(t.length, s.length) / Math.max(t.length, s.length), 0.75);
  } else {
    const dist = levenshtein(t, s);
    eff = 1 - dist / Math.max(t.length, s.length);
    if (t.length <= 6 && dist <= 2) eff = Math.max(eff, 0.72);
  }
  const stars = eff >= 0.9 ? 5 : eff >= 0.78 ? 4 : eff >= 0.6 ? 3 : eff >= 0.4 ? 2 : 1;
  const tier = stars >= 4 ? "correct" : stars === 3 ? "close" : "wrong";
  return { stars, tier };
}

export function SayTool({ onClose }: { onClose?: () => void }) {
  const { lang, dir } = useLang();
  const { user, plan } = useAuth();
  const href = useHref();
  const t = copy(lang);
  const paid = plan === "clear" || plan === "deep";

  const [sourceLang, setSourceLang] = useState<string>(lang);
  const [targetLang, setTargetLang] = useState<string>(lang === "en" ? "es" : "en");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    translation: string; romanization: string; tip: string; targetLang: string;
  } | null>(null);
  const [pron, setPron] = useState<{ stars: number; tier: "correct" | "close" | "wrong"; heard: string } | null>(null);

  useEffect(() => { setSourceLang(lang); }, [lang]);

  const checkPron = useCallback((spoken: string) => {
    setResult((r) => {
      if (r) setPron({ ...scoreStars(r.translation, spoken), heard: spoken });
      return r;
    });
  }, []);

  const autoPlayedRef = useRef<string>("");

  const submit = useCallback(async () => {
    if (!user || !text.trim() || busy) return;
    setBusy(true); setError(""); setResult(null); setPron(null);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/say", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ text: text.trim(), targetLang, sourceLang }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch {
      setError(t.errGeneric);
    } finally {
      setBusy(false);
    }
  }, [user, text, busy, targetLang, sourceLang, t.errGeneric]);

  useEffect(() => {
    if (!result || !user) return;
    if (plan !== "clear" && plan !== "deep") return;
    const key = `${result.targetLang}|${result.translation}`;
    if (autoPlayedRef.current === key) return;
    autoPlayedRef.current = key;
    (async () => {
      try {
        const idToken = await user.getIdToken();
        const r = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
          body: JSON.stringify({ text: result.translation, lang: result.targetLang }),
        });
        if (!r.ok) return;
        const url = URL.createObjectURL(await r.blob());
        const audio = new Audio(url);
        audio.onended = () => URL.revokeObjectURL(url);
        void audio.play();
      } catch { /* best effort */ }
    })();
  }, [result, user, plan]);

  const learnable = LANGUAGES;

  return (
    <div dir={dir} style={{ position: "relative" }}>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label={t.close}
          title={t.close}
          style={{
            position: "absolute", insetInlineEnd: -4, top: -4, width: 36, height: 36,
            borderRadius: "50%", border: "none", cursor: "pointer", background: "transparent",
            color: "var(--ink, #14181F)", opacity: 0.55, fontSize: 22, lineHeight: 1,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          ×
        </button>
      )}

      <h1 style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.15, margin: "0 0 8px", textWrap: "balance", paddingInlineEnd: onClose ? 32 : 0 }}>{t.title}</h1>
      <p style={{ fontSize: 15, opacity: 0.7, margin: "0 0 22px" }}>{t.sub}</p>

      {!user ? (
        <div style={{ background: "var(--surface, #fff)", border: "1px solid var(--rule, #E7E7E2)", borderRadius: 16, padding: 28, textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{t.loginTitle}</div>
          <div style={{ fontSize: 15, opacity: 0.7, marginBottom: 18 }}>{t.loginBody}</div>
          <a href={href("/")} style={{ display: "inline-block", background: "#0EA5A5", color: "#fff", fontWeight: 700, padding: "12px 24px", borderRadius: 999, textDecoration: "none" }}>{t.loginCta}</a>
        </div>
      ) : !paid ? (
        <div style={{ background: "var(--surface, #fff)", border: "1px solid var(--rule, #E7E7E2)", borderRadius: 16, padding: 28, textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{t.paidTitle}</div>
          <div style={{ fontSize: 15, opacity: 0.7, marginBottom: 18 }}>{t.paidBody}</div>
          <a href={href("/pricing")} style={{ display: "inline-block", background: "#0EA5A5", color: "#fff", fontWeight: 700, padding: "12px 24px", borderRadius: 999, textDecoration: "none" }}>{t.paidCta}</a>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
            <label style={{ flex: "1 1 180px", fontSize: 13, fontWeight: 600, opacity: 0.75 }}>
              {t.from}
              <LangSelect value={sourceLang} onChange={setSourceLang} />
            </label>
            <label style={{ flex: "1 1 180px", fontSize: 13, fontWeight: 600, opacity: 0.75 }}>
              {t.to}
              <LangSelect value={targetLang} onChange={setTargetLang} options={learnable} />
            </label>
          </div>

          <div style={{ position: "relative" }}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t.placeholder}
              rows={3}
              dir={dirOf(sourceLang)}
              maxLength={500}
              style={{
                width: "100%", boxSizing: "border-box", fontSize: 18, lineHeight: 1.45,
                padding: "14px 16px 48px", borderRadius: 14, border: "1px solid var(--rule, #E7E7E2)",
                background: "var(--surface, #fff)", color: "inherit", resize: "vertical", fontFamily: "inherit",
              }}
            />
            <div style={{ position: "absolute", bottom: 10, insetInlineEnd: 10 }}>
              <VoiceInput
                uiLang={sourceLang}
                getIdToken={async () => (user ? await user.getIdToken() : null)}
                enabled={plan === "clear" || plan === "deep"}
                title={t.speak}
                onResult={(spoken) => setText((p) => (p.trim() ? p.trim() + " " + spoken : spoken))}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={submit}
            disabled={busy || !text.trim()}
            style={{
              marginTop: 14, width: "100%", background: busy || !text.trim() ? "#9CA3AF" : "#0EA5A5",
              color: "#fff", fontWeight: 700, fontSize: 17, padding: "14px", borderRadius: 999,
              border: "none", cursor: busy || !text.trim() ? "default" : "pointer",
            }}
          >
            {busy ? t.loading : t.button}
          </button>

          {error && <div style={{ marginTop: 16, color: "#DC2626", fontSize: 15 }}>{error}</div>}

          {result && (
            <div style={{ marginTop: 26, background: "var(--surface, #fff)", border: "1px solid var(--rule, #E7E7E2)", borderRadius: 18, padding: "22px 22px 24px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#0EA5A5", marginBottom: 12 }}>
                {t.hearing} · {LANGUAGES.find((l) => l.code === result.targetLang)?.label}
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div dir={dirOf(result.targetLang)} style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.3, flex: 1 }}>
                  {result.translation}
                </div>
                <TTSButton
                  text={result.translation}
                  audioLang={result.targetLang}
                  useOpenAI={plan === "clear" || plan === "deep"}
                  ariaLabel={t.hearing}
                  className="wb-word-listen-btn"
                />
              </div>
              {result.romanization && (
                <div style={{ marginTop: 10, fontSize: 17, opacity: 0.6, fontStyle: "italic" }}>{result.romanization}</div>
              )}
              {result.tip && (
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--rule, #E7E7E2)", fontSize: 14, opacity: 0.8 }}>
                  <span style={{ fontWeight: 700 }}>{t.tip}: </span>{result.tip}
                </div>
              )}

              {/* Pronunciation practice: the learner says it, Gadit checks. */}
              <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--rule, #E7E7E2)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#0EA5A5", marginBottom: 6 }}>{t.practiceTitle}</div>
                <div style={{ fontSize: 14, opacity: 0.75, marginBottom: 12 }}>{t.practiceHint}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <VoiceInput
                    key={result.translation}
                    uiLang={result.targetLang}
                    getIdToken={async () => (user ? await user.getIdToken() : null)}
                    enabled={paid}
                    title={t.practiceBtn}
                    onResult={checkPron}
                  />
                  <span style={{ fontSize: 14, opacity: 0.7 }}>{t.practiceBtn}</span>
                </div>
                {pron && (() => {
                  const c = pron.tier === "correct"
                    ? { bg: "rgba(16,185,129,0.1)", bd: "rgba(16,185,129,0.35)", fg: "#047857", ic: "✓", msg: t.pcCorrect }
                    : pron.tier === "close"
                      ? { bg: "rgba(245,158,11,0.12)", bd: "rgba(245,158,11,0.4)", fg: "#b45309", ic: "≈", msg: t.pcClose }
                      : { bg: "rgba(239,68,68,0.1)", bd: "rgba(239,68,68,0.35)", fg: "#b91c1c", ic: "↻", msg: t.pcWrong };
                  return (
                    <div style={{ marginTop: 14, borderRadius: 12, padding: "12px 14px", background: c.bg, border: `1px solid ${c.bd}` }}>
                      <div style={{ fontSize: 22, letterSpacing: 3, lineHeight: 1, marginBottom: 6 }} aria-label={`${pron.stars}/5`}>
                        <span style={{ color: "#F59E0B" }}>{"★".repeat(pron.stars)}</span><span style={{ color: "rgba(0,0,0,0.14)" }}>{"★".repeat(5 - pron.stars)}</span>
                      </div>
                      <div style={{ fontWeight: 700, color: c.fg, fontSize: 15 }}><span aria-hidden="true">{c.ic}</span> {c.msg}</div>
                      {pron.tier !== "correct" && (
                        <div style={{ marginTop: 5, fontSize: 14, opacity: 0.85 }}>
                          {t.heardLabel}: <span dir={dirOf(result.targetLang)} style={{ fontWeight: 600 }}>{pron.heard}</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function LangSelect({
  value, onChange, options = LANGUAGES,
}: {
  value: string; onChange: (v: string) => void;
  options?: typeof LANGUAGES;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        display: "block", width: "100%", marginTop: 6, fontSize: 16, fontWeight: 600,
        padding: "10px 12px", borderRadius: 12, border: "1px solid var(--rule, #E7E7E2)",
        background: "var(--surface, #fff)", color: "inherit", cursor: "pointer", fontFamily: "inherit",
      }}
    >
      {options.map((l) => (
        <option key={l.code} value={l.code}>{l.label}</option>
      ))}
    </select>
  );
}
