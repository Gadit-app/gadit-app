"use client";

import { AppIntentPing } from "@/components/AppIntentPing";
import { WaitText } from "@/components/WaitText";
import { GaditIcon } from "@/components/design/GaditIcon";
import { ToolPage } from "@/components/design/ToolPage";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { ReaderText } from "@/components/design/ReaderText";
import { PassageKeyWords } from "@/components/design/PassageKeyWords";
import { ReadingCheck } from "@/components/design/ReadingCheck";
import { GuideButton } from "@/components/GuideButton";
import { distinctWordCount, tokenizeWords, wordKey, UNSURE_MARK } from "@/lib/tokenize-words";
import { readingCheckCopy } from "@/lib/reading-check-i18n";
import { notifyActivity } from "@/lib/notify-activity-client";
import { type Lang } from "@/lib/i18n";
import { misc } from "@/lib/misc-i18n";
import { homeworkCopy } from "@/lib/homework-i18n";
import { practiceCopy } from "@/lib/practice-i18n";
import { ReportQuestionButton } from "@/components/play/ReportQuestionButton";
import { playNotActive } from "@/lib/play-copy";
import { prepareForUpload } from "@/lib/ocr-upload";

/**
 * /read — the Reader. Paste or photograph a passage; Gadit lays it out as
 * tappable words; the reader goes word by word, opening meanings, and each
 * word gets a green check. Progress is per-text and persisted locally so a
 * refresh keeps it.
 *
 * Access: paid tiers (the OCR call costs money) — same gate as the other AI
 * tools. Reviewed words also flow through the normal look-up path, so they
 * still land in the notebook / vocabulary history.
 */

function fontBody(lang: Lang): string {
  if (lang === "he") return "var(--wb-he)";
  if (lang === "ar") return "var(--wb-ar)";
  if (lang === "ja") return "var(--wb-jp)";
  if (lang === "hi") return "var(--wb-hi)";
  return "var(--wb-sans)";
}

function hashText(t: string): string {
  let h = 5381;
  for (let i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

type ReaderStrings = {
  title: string; sub: string; placeholder: string; load: string; photo: string;
  reading: string; ocrError: string; newText: string;
  /** Progress template with {a} = reviewed, {b} = total. */
  progress: string;
  doneAll: string; hint: string; loginTitle: string; loginBtn: string;
  upgradeTitle: string; upgradeBtn: string; loading: string;
  /** Two distinct upload actions. Optional so the 31 batch-translated langs
   *  compile; they fall back to English until their natives land. */
  camera?: string; upload?: string;
  /** Capture-screen button (desktop). Optional; English fallback. */
  captureScreen?: string;
  /** Tooltip + aria-label of the per-sentence "understand" control in ReaderText. */
  understandSentence?: string;
  /** Photo quality and correcting the read text (Gadi 2026-10-26). Optional;
   *  English fallback (every language has them today). */
  editText?: string; editDone?: string;
  /** Too blurry to read: nothing is loaded. */
  unreadable?: string;
  /** Above the text: some words are marked ⟦?⟧ / the photo was soft. */
  unsureNote?: string; poorNote?: string;
  /** Under the in-page camera on a computer. */
  desktopHint?: string;
  /** aria-label of a marked (unread) word. */
  unsureWord?: string;
};

type OcrCopyKey = "editText" | "editDone" | "unreadable" | "unsureNote" | "poorNote" | "desktopHint" | "unsureWord";

// Reader UI copy. en + he authored; every other language falls back to en until
// its native strings land (translated in a batch). The look-up and OCR
// themselves already work in every language — this is only the chrome.
const READER_COPY: Record<string, ReaderStrings> = {
  en: {
    title: "Understand every word",
    sub: "Paste a text, photograph a page, upload an image or capture your screen.\nThe text goes into the white box, and you can tap any word to see what it means.",
    placeholder: "Paste text or a screenshot here…",
    load: "Open text",
    photo: "Photo, image or PDF",
    reading: "Reading the file…",
    ocrError: "We couldn't read that file. Try a clearer photo, or a PDF / image with readable text.",
    newText: "New text",
    progress: "{a} of {b} words",
    doneAll: "Nice work. You went over every word.",
    hint: "Tap any word to see its meaning. Words you've opened turn green.",
    loginTitle: "Sign in to read a text",
    loginBtn: "Sign in",
    upgradeTitle: "Reading a text is a paid feature",
    upgradeBtn: "See plans",
    loading: "Loading…",
    camera: "Photograph with camera",
    upload: "Upload image or PDF",
    captureScreen: "Share screen",
    understandSentence: "Understand this sentence",
    editText: "Edit text",
    editDone: "Done",
    unreadable: "The photo isn't sharp enough to read.\nTake it closer, straight above the page, in good light.",
    unsureNote: "Some words were not clear in the photo and are marked with a question mark.\nCheck and fix them before reading.",
    poorNote: "The photo was not sharp, so some words may have been read wrong.\nCheck and fix them before reading.",
    desktopHint: "On a computer, a photo taken with a phone is sharper",
    unsureWord: "Unclear word",
  },
  he: {
    title: "להבין כל מילה",
    sub: "הדביקו טקסט, צלמו עמוד, העלו תמונה או צלמו את המסך שלכם.\nהטקסט ייכנס לאזור הלבן, וכל מילה בו תהיה לחיצה עם ההגדרה שלה.",
    placeholder: "הדביקו כאן טקסט, או השתמשו בכפתורים שלמטה: צלמו עמוד, העלו תמונה או PDF, או שתפו מסך.",
    load: "פתחו את הטקסט",
    photo: "צילום, תמונה או PDF",
    reading: "קורא את הקובץ…",
    ocrError: "לא הצלחנו לקרוא את הקובץ. כדאי צילום ברור יותר, או PDF/תמונה עם טקסט קריא.",
    newText: "טקסט חדש",
    progress: "{a} מתוך {b} מילים",
    doneAll: "כל הכבוד. עברת על כל המילים.",
    hint: "לוחצים על כל מילה כדי לראות את ההסבר שלה. מילים שפתחת נצבעות בירוק.",
    loginTitle: "צריך להתחבר כדי לקרוא טקסט",
    loginBtn: "התחברות",
    upgradeTitle: "קריאת טקסט היא תכונה בתשלום",
    upgradeBtn: "לצפייה במסלולים",
    loading: "טוען…",
    camera: "צלמו עמוד",
    upload: "העלו תמונה או PDF",
    captureScreen: "שתפו מסך",
    understandSentence: "להבין את המשפט הזה",
    editText: "עריכת הטקסט",
    editDone: "סיום",
    unreadable: "התמונה לא חדה מספיק כדי לקרוא אותה.\nצלמו קרוב יותר, ישר מעל הדף ובאור טוב.",
    unsureNote: "חלק מהמילים לא היו ברורות בתמונה ומסומנות בסימן שאלה.\nבדקו ותקנו אותן לפני הקריאה.",
    poorNote: "התמונה לא הייתה חדה, ולכן ייתכן שחלק מהמילים נקראו לא נכון.\nבדקו ותקנו אותן לפני הקריאה.",
    desktopHint: "במחשב, צילום עם הטלפון יוצא חד יותר",
    unsureWord: "מילה לא ברורה",
  },
  "ar": {"title":"افهم كل كلمة","sub":"الصق نصًا، أو صوّر صفحة، أو ارفع صورة، أو التقط شاشتك.\nيظهر النص في المربع الأبيض، ويمكنك النقر على أي كلمة لمعرفة معناها.","placeholder":"الصق نصك هنا…","load":"افتح النص","photo":"صورة أو ملف PDF","reading":"جارٍ قراءة الملف…","ocrError":"تعذّرت علينا قراءة هذا الملف. جرّب صورة أوضح، أو ملف PDF أو صورة بنص مقروء.","newText":"نص جديد","progress":"{a} من {b} كلمة","doneAll":"عمل رائع. لقد مررت على كل كلمة.","hint":"انقر على أي كلمة لرؤية معانيها. الكلمات التي فتحتها تتحول إلى الأخضر.","loginTitle":"سجّل الدخول لقراءة نص","loginBtn":"تسجيل الدخول","upgradeTitle":"قراءة نص ميزة مدفوعة","upgradeBtn":"اطّلع على الخطط","loading":"جارٍ التحميل…","camera":"التقاط بالكاميرا","upload":"رفع صورة أو PDF","captureScreen":"مشاركة الشاشة","understandSentence":"افهم هذه الجملة","editText":"تعديل النص","editDone":"تم","unreadable":"الصورة ليست واضحة بما يكفي لقراءتها.\nصوّر من مسافة أقرب، مباشرة فوق الصفحة، وفي إضاءة جيدة.","unsureNote":"بعض الكلمات لم تكن واضحة في الصورة وهي مُعلَّمة بعلامة استفهام.\nراجعها وصحّحها قبل القراءة.","poorNote":"الصورة لم تكن واضحة، لذلك ربما قُرئت بعض الكلمات بشكل خاطئ.\nراجعها وصحّحها قبل القراءة.","desktopHint":"على الكمبيوتر، تكون الصورة الملتقطة بالهاتف أوضح","unsureWord":"كلمة غير واضحة"},
  "ru": {"title":"Понять каждое слово","sub":"Вставьте текст, сфотографируйте страницу, загрузите изображение или сделайте снимок экрана.\nТекст появится в белом поле, и вы сможете нажать на любое слово, чтобы узнать его значение.","placeholder":"Вставьте свой текст сюда…","load":"Открыть текст","photo":"Фото, изображение или PDF","reading":"Читаем файл…","ocrError":"Не удалось прочитать этот файл. Попробуйте более четкое фото или PDF либо изображение с читаемым текстом.","newText":"Новый текст","progress":"{a} из {b} слов","doneAll":"Отличная работа. Вы прошли по всем словам.","hint":"Нажмите на любое слово, чтобы увидеть его значения. Открытые слова становятся зелеными.","loginTitle":"Войдите, чтобы читать текст","loginBtn":"Войти","upgradeTitle":"Чтение текста, это платная функция","upgradeBtn":"Посмотреть тарифы","loading":"Загрузка…","camera":"Сфотографировать камерой","upload":"Загрузить изображение или PDF","captureScreen":"Показать экран","understandSentence":"Понять это предложение","editText":"Изменить текст","editDone":"Готово","unreadable":"Фото недостаточно четкое, чтобы его прочитать.\nСнимите ближе, прямо над страницей и при хорошем свете.","unsureNote":"Некоторые слова на фото были нечеткими и отмечены вопросительным знаком.\nПроверьте и исправьте их перед чтением.","poorNote":"Фото было нечетким, поэтому некоторые слова могли быть прочитаны неверно.\nПроверьте и исправьте их перед чтением.","desktopHint":"На компьютере фото, снятое телефоном, получается четче","unsureWord":"Неразборчивое слово"},
  "es": {"title":"Entiende cada palabra","sub":"Pega un texto, fotografía una página, sube una imagen o captura tu pantalla.\nEl texto aparece en el recuadro blanco y puedes tocar cualquier palabra para ver qué significa.","placeholder":"Pega tu texto aquí…","load":"Abrir texto","photo":"Foto, imagen o PDF","reading":"Leyendo el archivo…","ocrError":"No pudimos leer ese archivo. Prueba con una foto más nítida, o con un PDF o imagen con texto legible.","newText":"Texto nuevo","progress":"{a} de {b} palabras","doneAll":"Buen trabajo. Revisaste todas las palabras.","hint":"Toca cualquier palabra para ver sus significados. Las palabras que abriste se ponen verdes.","loginTitle":"Inicia sesión para leer un texto","loginBtn":"Iniciar sesión","upgradeTitle":"Leer un texto es una función de pago","upgradeBtn":"Ver planes","loading":"Cargando…","camera":"Fotografiar con la cámara","upload":"Subir imagen o PDF","captureScreen":"Compartir pantalla","understandSentence":"Entiende esta frase","editText":"Editar texto","editDone":"Listo","unreadable":"La foto no es lo bastante nítida para leerla.\nTómala más cerca, justo encima de la página y con buena luz.","unsureNote":"Algunas palabras no se veían claras en la foto y están marcadas con un signo de interrogación.\nRevísalas y corrígelas antes de leer.","poorNote":"La foto no era nítida, así que algunas palabras pueden haberse leído mal.\nRevísalas y corrígelas antes de leer.","desktopHint":"En una computadora, una foto tomada con el teléfono sale más nítida","unsureWord":"Palabra poco clara"},
  "pt": {"title":"Entenda cada palavra","sub":"Cole um texto, fotografe uma página, envie uma imagem ou capture sua tela.\nO texto vai para a caixa branca, e você pode tocar em qualquer palavra para ver o que ela significa.","placeholder":"Cole seu texto aqui…","load":"Abrir texto","photo":"Foto, imagem ou PDF","reading":"Lendo o arquivo…","ocrError":"Não conseguimos ler esse arquivo. Tente uma foto mais nítida, ou um PDF ou imagem com texto legível.","newText":"Novo texto","progress":"{a} de {b} palavras","doneAll":"Bom trabalho. Você passou por todas as palavras.","hint":"Toque em qualquer palavra para ver seus significados. As palavras que você abriu ficam verdes.","loginTitle":"Faça login para ler um texto","loginBtn":"Entrar","upgradeTitle":"Ler um texto é um recurso pago","upgradeBtn":"Ver planos","loading":"Carregando…","camera":"Fotografar com a câmera","upload":"Enviar imagem ou PDF","captureScreen":"Compartilhar tela","understandSentence":"Entenda esta frase","editText":"Editar texto","editDone":"Concluir","unreadable":"A foto não está nítida o suficiente para ser lida.\nTire mais de perto, bem em cima da página e com boa luz.","unsureNote":"Algumas palavras não estavam claras na foto e estão marcadas com um ponto de interrogação.\nConfira e corrija antes de ler.","poorNote":"A foto não estava nítida, então algumas palavras podem ter sido lidas errado.\nConfira e corrija antes de ler.","desktopHint":"No computador, uma foto tirada com o celular sai mais nítida","unsureWord":"Palavra pouco clara"},
  "fr": {"title":"Comprendre chaque mot","sub":"Collez un texte, photographiez une page, importez une image ou capturez votre écran.\nLe texte s'affiche dans le cadre blanc, et vous pouvez toucher n'importe quel mot pour voir ce qu'il signifie.","placeholder":"Collez votre texte ici…","load":"Ouvrir le texte","photo":"Photo, image ou PDF","reading":"Lecture du fichier…","ocrError":"Nous n'avons pas pu lire ce fichier. Essayez une photo plus nette, ou un PDF ou une image avec un texte lisible.","newText":"Nouveau texte","progress":"{a} sur {b} mots","doneAll":"Beau travail. Vous avez parcouru tous les mots.","hint":"Touchez n'importe quel mot pour voir ses sens. Les mots que vous avez ouverts deviennent verts.","loginTitle":"Connectez-vous pour lire un texte","loginBtn":"Se connecter","upgradeTitle":"Lire un texte est une fonction payante","upgradeBtn":"Voir les offres","loading":"Chargement…","camera":"Photographier avec l'appareil","upload":"Importer une image ou un PDF","captureScreen":"Partager l'écran","understandSentence":"Comprendre cette phrase","editText":"Modifier le texte","editDone":"Terminé","unreadable":"La photo n'est pas assez nette pour être lue.\nPrenez-la de plus près, bien au-dessus de la page et avec une bonne lumière.","unsureNote":"Certains mots n'étaient pas nets sur la photo et sont marqués d'un point d'interrogation.\nVérifiez-les et corrigez-les avant de lire.","poorNote":"La photo n'était pas nette, certains mots ont donc pu être mal lus.\nVérifiez-les et corrigez-les avant de lire.","desktopHint":"Sur un ordinateur, une photo prise avec un téléphone est plus nette","unsureWord":"Mot peu clair"},
  "de": {"title":"Jedes Wort verstehen","sub":"Füge einen Text ein, fotografiere eine Seite, lade ein Bild hoch oder mach einen Screenshot.\nDer Text landet im weißen Feld, und du kannst auf jedes Wort tippen, um zu sehen, was es bedeutet.","placeholder":"Füge deinen Text hier ein…","load":"Text öffnen","photo":"Foto, Bild oder PDF","reading":"Datei wird gelesen…","ocrError":"Wir konnten diese Datei nicht lesen. Versuche ein schärferes Foto oder ein PDF oder Bild mit lesbarem Text.","newText":"Neuer Text","progress":"{a} von {b} Wörtern","doneAll":"Gut gemacht. Du bist jedes Wort durchgegangen.","hint":"Tippe auf ein beliebiges Wort, um seine Bedeutungen zu sehen. Geöffnete Wörter werden grün.","loginTitle":"Melde dich an, um einen Text zu lesen","loginBtn":"Anmelden","upgradeTitle":"Einen Text zu lesen ist eine kostenpflichtige Funktion","upgradeBtn":"Tarife ansehen","loading":"Wird geladen…","camera":"Mit Kamera fotografieren","upload":"Bild oder PDF hochladen","captureScreen":"Bildschirm teilen","understandSentence":"Diesen Satz verstehen","editText":"Text bearbeiten","editDone":"Fertig","unreadable":"Das Foto ist nicht scharf genug, um es zu lesen.\nFotografiere näher, direkt über der Seite und bei gutem Licht.","unsureNote":"Einige Wörter waren auf dem Foto nicht deutlich und sind mit einem Fragezeichen markiert.\nPrüfe und korrigiere sie vor dem Lesen.","poorNote":"Das Foto war nicht scharf, daher wurden einige Wörter vielleicht falsch gelesen.\nPrüfe und korrigiere sie vor dem Lesen.","desktopHint":"Am Computer wird ein Foto mit dem Handy schärfer","unsureWord":"Undeutliches Wort"},
  "cs": {"title":"Rozumět každému slovu","sub":"Vložte text, vyfoťte stránku, nahrajte obrázek nebo zachyťte obrazovku.\nText se objeví v bílém poli a můžete klepnout na jakékoli slovo a zjistit, co znamená.","placeholder":"Sem vložte svůj text…","load":"Otevřít text","photo":"Fotka, obrázek nebo PDF","reading":"Čteme soubor…","ocrError":"Tento soubor se nám nepodařilo přečíst. Zkuste ostřejší fotku nebo PDF či obrázek s čitelným textem.","newText":"Nový text","progress":"{a} z {b} slov","doneAll":"Dobrá práce. Prošli jste každé slovo.","hint":"Klepněte na jakékoli slovo a zobrazte jeho významy. Slova, která jste otevřeli, zezelenají.","loginTitle":"Přihlaste se a čtěte text","loginBtn":"Přihlásit se","upgradeTitle":"Čtení textu je placená funkce","upgradeBtn":"Zobrazit plány","loading":"Načítání…","camera":"Vyfotit fotoaparátem","upload":"Nahrát obrázek nebo PDF","captureScreen":"Sdílet obrazovku","understandSentence":"Rozumět této větě","editText":"Upravit text","editDone":"Hotovo","unreadable":"Fotka není dost ostrá, aby se dala přečíst.\nVyfoťte ji zblízka, přímo nad stránkou a při dobrém světle.","unsureNote":"Některá slova nebyla na fotce zřetelná a jsou označena otazníkem.\nPřed čtením je zkontrolujte a opravte.","poorNote":"Fotka nebyla ostrá, takže některá slova mohla být přečtena špatně.\nPřed čtením je zkontrolujte a opravte.","desktopHint":"Na počítači je fotka pořízená telefonem ostřejší","unsureWord":"Nezřetelné slovo"},
  "sk": {"title":"Rozumieť každému slovu","sub":"Vložte text, odfoťte stránku, nahrajte obrázok alebo zachyťte obrazovku.\nText sa zobrazí v bielom poli a môžete ťuknúť na ktorékoľvek slovo, aby ste zistili, čo znamená.","placeholder":"Sem vložte svoj text…","load":"Otvoriť text","photo":"Fotka, obrázok alebo PDF","reading":"Čítame súbor…","ocrError":"Tento súbor sa nám nepodarilo prečítať. Skúste ostrejšiu fotku alebo PDF či obrázok s čitateľným textom.","newText":"Nový text","progress":"{a} z {b} slov","doneAll":"Dobrá práca. Prešli ste každé slovo.","hint":"Ťuknite na ktorékoľvek slovo a zobrazte jeho významy. Slová, ktoré ste otvorili, zozelenejú.","loginTitle":"Prihláste sa a čítajte text","loginBtn":"Prihlásiť sa","upgradeTitle":"Čítanie textu je platená funkcia","upgradeBtn":"Zobraziť plány","loading":"Načítava sa…","camera":"Odfotiť fotoaparátom","upload":"Nahrať obrázok alebo PDF","captureScreen":"Zdieľať obrazovku","understandSentence":"Rozumieť tejto vete","editText":"Upraviť text","editDone":"Hotovo","unreadable":"Fotka nie je dosť ostrá, aby sa dala prečítať.\nOdfoťte ju zblízka, priamo nad stránkou a pri dobrom svetle.","unsureNote":"Niektoré slová neboli na fotke zreteľné a sú označené otáznikom.\nPred čítaním ich skontrolujte a opravte.","poorNote":"Fotka nebola ostrá, preto niektoré slová mohli byť prečítané nesprávne.\nPred čítaním ich skontrolujte a opravte.","desktopHint":"Na počítači je fotka odfotená telefónom ostrejšia","unsureWord":"Nezreteľné slovo"},
  "it": {"title":"Capisci ogni parola","sub":"Incolla un testo, fotografa una pagina, carica un'immagine o cattura lo schermo.\nIl testo compare nel riquadro bianco e puoi toccare qualsiasi parola per scoprire cosa significa.","placeholder":"Incolla qui il tuo testo…","load":"Apri il testo","photo":"Foto, immagine o PDF","reading":"Lettura del file…","ocrError":"Non siamo riusciti a leggere questo file. Prova con una foto più nitida, oppure un PDF o un'immagine con testo leggibile.","newText":"Nuovo testo","progress":"{a} di {b} parole","doneAll":"Ottimo lavoro. Hai esaminato ogni parola.","hint":"Tocca una parola qualsiasi per vedere i suoi significati. Le parole che hai aperto diventano verdi.","loginTitle":"Accedi per leggere un testo","loginBtn":"Accedi","upgradeTitle":"Leggere un testo è una funzione a pagamento","upgradeBtn":"Vedi i piani","loading":"Caricamento…","camera":"Fotografa con la fotocamera","upload":"Carica immagine o PDF","captureScreen":"Condividi schermo","understandSentence":"Capisci questa frase","editText":"Modifica il testo","editDone":"Fatto","unreadable":"La foto non è abbastanza nitida per essere letta.\nScattala più da vicino, proprio sopra la pagina e con una buona luce.","unsureNote":"Alcune parole non erano chiare nella foto e sono segnate con un punto interrogativo.\nControllale e correggile prima di leggere.","poorNote":"La foto non era nitida, quindi alcune parole potrebbero essere state lette male.\nControllale e correggile prima di leggere.","desktopHint":"Dal computer, una foto scattata con il telefono è più nitida","unsureWord":"Parola poco chiara"},
  "ja": {"title":"すべての単語を理解する","sub":"テキストを貼り付けたり、ページを撮影したり、画像をアップロードしたり、画面をキャプチャしたりできます。\nテキストは白い枠に表示され、どの単語でもタップすると意味がわかります。","placeholder":"ここにテキストを貼り付けてください…","load":"テキストを開く","photo":"写真、画像、または PDF","reading":"ファイルを読み込んでいます…","ocrError":"このファイルを読み取れませんでした。より鮮明な写真、または読み取れるテキストの PDF か画像でお試しください。","newText":"新しいテキスト","progress":"{b} 語中 {a} 語","doneAll":"お疲れさまでした。すべての単語に目を通しました。","hint":"どの単語でもタップすると、その意味が表示されます。開いた単語は緑色になります。","loginTitle":"テキストを読むにはサインインしてください","loginBtn":"サインイン","upgradeTitle":"テキストを読む機能は有料です","upgradeBtn":"プランを見る","loading":"読み込み中…","camera":"カメラで撮影","upload":"画像またはPDFをアップロード","captureScreen":"画面を共有","understandSentence":"この文を理解する","editText":"テキストを編集","editDone":"完了","unreadable":"写真が鮮明でないため読み取れません。\nもっと近くで、ページの真上から、明るい場所で撮影してください。","unsureNote":"写真で読み取れなかった単語があり、疑問符で示しています。\n読む前に確認して直してください。","poorNote":"写真が鮮明でなかったため、一部の単語が正しく読み取れていない可能性があります。\n読む前に確認して直してください。","desktopHint":"パソコンの場合、スマートフォンで撮った写真のほうが鮮明です","unsureWord":"読み取れない単語"},
  "hi": {"title":"हर शब्द समझें","sub":"टेक्स्ट पेस्ट करें, किसी पेज की फ़ोटो लें, कोई इमेज अपलोड करें या अपनी स्क्रीन कैप्चर करें।\nटेक्स्ट सफ़ेद बॉक्स में आ जाता है, और किसी भी शब्द पर टैप करके उसका मतलब देखें।","placeholder":"अपना टेक्स्ट यहाँ पेस्ट करें…","load":"टेक्स्ट खोलें","photo":"फोटो, इमेज या PDF","reading":"फ़ाइल पढ़ी जा रही है…","ocrError":"हम वह फ़ाइल नहीं पढ़ पाए। कोई साफ़ फोटो आज़माएँ, या पढ़ने योग्य टेक्स्ट वाली PDF / इमेज।","newText":"नया टेक्स्ट","progress":"{b} में से {a} शब्द","doneAll":"बढ़िया काम। आपने हर शब्द देख लिया।","hint":"किसी भी शब्द पर टैप करके उसके अर्थ देखें। जो शब्द आपने खोले हैं वे हरे हो जाते हैं।","loginTitle":"टेक्स्ट पढ़ने के लिए साइन इन करें","loginBtn":"साइन इन करें","upgradeTitle":"टेक्स्ट पढ़ना एक पेड फ़ीचर है","upgradeBtn":"प्लान देखें","loading":"लोड हो रहा है…","camera":"कैमरे से फ़ोटो लें","upload":"छवि या PDF अपलोड करें","captureScreen":"स्क्रीन शेयर करें","understandSentence":"यह वाक्य समझें","editText":"टेक्स्ट बदलें","editDone":"हो गया","unreadable":"फ़ोटो इतनी साफ़ नहीं है कि उसे पढ़ा जा सके।\nपास से, पेज के ठीक ऊपर से और अच्छी रोशनी में फ़ोटो लें।","unsureNote":"फ़ोटो में कुछ शब्द साफ़ नहीं थे और उन पर प्रश्नचिह्न लगाया गया है।\nपढ़ने से पहले उन्हें जाँचें और ठीक करें।","poorNote":"फ़ोटो साफ़ नहीं थी, इसलिए हो सकता है कुछ शब्द गलत पढ़े गए हों।\nपढ़ने से पहले उन्हें जाँचें और ठीक करें।","desktopHint":"कंप्यूटर पर, फ़ोन से ली गई फ़ोटो ज़्यादा साफ़ आती है","unsureWord":"अस्पष्ट शब्द"},
  "am": {"title":"እያንዳንዱን ቃል ይረዱ","sub":"ጽሑፍ ይለጥፉ፣ ገጽ ፎቶ ያንሱ፣ ምስል ይስቀሉ ወይም ማያ ገጽዎን ይቅረጹ።\nጽሑፉ ወደ ነጩ ሳጥን ይገባል፤ የማንኛውንም ቃል ትርጉም ለማየት ቃሉን ይንኩ።","placeholder":"ጽሑፍዎን እዚህ ይለጥፉ…","load":"ጽሑፍ ክፈት","photo":"ፎቶ፣ ምስል ወይም PDF","reading":"ፋይሉ እየተነበበ ነው…","ocrError":"ያንን ፋይል ማንበብ አልቻልንም። ግልጽ የሆነ ፎቶ ይሞክሩ፣ ወይም ሊነበብ የሚችል ጽሑፍ ያለው PDF / ምስል።","newText":"አዲስ ጽሑፍ","progress":"ከ{b} ውስጥ {a} ቃላት","doneAll":"ጥሩ ሥራ። እያንዳንዱን ቃል አልፈዋል።","hint":"ትርጉሞቹን ለማየት ማንኛውንም ቃል ይንኩ። የከፈቷቸው ቃላት አረንጓዴ ይሆናሉ።","loginTitle":"ጽሑፍ ለማንበብ ይግቡ","loginBtn":"ግባ","upgradeTitle":"ጽሑፍ ማንበብ የሚከፈልበት ባህሪ ነው","upgradeBtn":"እቅዶችን ይመልከቱ","loading":"በመጫን ላይ…","camera":"በካሜራ ፎቶ አንሳ","upload":"ምስል ወይም PDF ስቀል","captureScreen":"ማያ ገጽ አጋራ","understandSentence":"ይህን ዓረፍተ ነገር ይረዱ","editText":"ጽሑፉን አርትዕ","editDone":"ተጠናቋል","unreadable":"ፎቶው ለማንበብ በቂ ግልጽ አይደለም።\nበቅርበት፣ ልክ ከገጹ በላይ ሆነው እና በጥሩ ብርሃን ያንሱ።","unsureNote":"በፎቶው ላይ አንዳንድ ቃላት ግልጽ አልነበሩም እና በጥያቄ ምልክት ተለይተዋል።\nከማንበብዎ በፊት ይፈትሹና ያስተካክሏቸው።","poorNote":"ፎቶው ግልጽ ስላልነበረ አንዳንድ ቃላት በስህተት ተነብበው ሊሆን ይችላል።\nከማንበብዎ በፊት ይፈትሹና ያስተካክሏቸው።","desktopHint":"በኮምፒውተር ላይ፣ በስልክ የተነሳ ፎቶ ይበልጥ ግልጽ ነው","unsureWord":"ግልጽ ያልሆነ ቃል"},
  "uk": {"title":"Зрозуміти кожне слово","sub":"Вставте текст, сфотографуйте сторінку, завантажте зображення або зробіть знімок екрана.\nТекст з'явиться в білому полі, і ви зможете торкнутися будь-якого слова, щоб дізнатися його значення.","placeholder":"Вставте свій текст тут…","load":"Відкрити текст","photo":"Фото, зображення або PDF","reading":"Читання файлу…","ocrError":"Не вдалося прочитати цей файл. Спробуйте чіткіше фото або PDF / зображення з розбірливим текстом.","newText":"Новий текст","progress":"{a} з {b} слів","doneAll":"Гарна робота. Ви пройшли кожне слово.","hint":"Торкніться будь-якого слова, щоб побачити його значення. Слова, які ви відкрили, стають зеленими.","loginTitle":"Увійдіть, щоб читати текст","loginBtn":"Увійти","upgradeTitle":"Читання тексту, це платна функція","upgradeBtn":"Переглянути плани","loading":"Завантаження…","camera":"Сфотографувати камерою","upload":"Завантажити зображення або PDF","captureScreen":"Показати екран","understandSentence":"Зрозуміти це речення","editText":"Редагувати текст","editDone":"Готово","unreadable":"Фото недостатньо чітке, щоб його прочитати.\nЗнімайте ближче, просто над сторінкою і при доброму світлі.","unsureNote":"Деякі слова на фото були нечіткими й позначені знаком питання.\nПеревірте й виправте їх перед читанням.","poorNote":"Фото було нечітким, тому деякі слова могли бути прочитані неправильно.\nПеревірте й виправте їх перед читанням.","desktopHint":"На комп'ютері фото, зняте телефоном, виходить чіткішим","unsureWord":"Нечітке слово"},
  "tr": {"title":"Her kelimeyi anla","sub":"Bir metin yapıştır, bir sayfanın fotoğrafını çek, bir görsel yükle ya da ekranını yakala.\nMetin beyaz kutuya gelir ve herhangi bir kelimeye dokunarak ne anlama geldiğini görebilirsin.","placeholder":"Metninizi buraya yapıştırın…","load":"Metni aç","photo":"Fotoğraf, görsel veya PDF","reading":"Dosya okunuyor…","ocrError":"Bu dosyayı okuyamadık. Daha net bir fotoğraf ya da okunabilir metin içeren bir PDF / görsel deneyin.","newText":"Yeni metin","progress":"{b} kelimeden {a} tanesi","doneAll":"Güzel iş. Her kelimeyi gözden geçirdiniz.","hint":"Anlamlarını görmek için herhangi bir kelimeye dokunun. Açtığınız kelimeler yeşile döner.","loginTitle":"Metin okumak için giriş yapın","loginBtn":"Giriş yap","upgradeTitle":"Metin okuma ücretli bir özelliktir","upgradeBtn":"Planları gör","loading":"Yükleniyor…","camera":"Kamerayla çek","upload":"Görsel veya PDF yükle","captureScreen":"Ekranı paylaş","understandSentence":"Bu cümleyi anla","editText":"Metni düzenle","editDone":"Bitti","unreadable":"Fotoğraf okunacak kadar net değil.\nDaha yakından, sayfanın tam üstünden ve iyi ışıkta çekin.","unsureNote":"Fotoğrafta bazı kelimeler net değildi ve soru işaretiyle işaretlendi.\nOkumadan önce kontrol edip düzeltin.","poorNote":"Fotoğraf net değildi, bu yüzden bazı kelimeler yanlış okunmuş olabilir.\nOkumadan önce kontrol edip düzeltin.","desktopHint":"Bilgisayarda, telefonla çekilen fotoğraf daha net çıkar","unsureWord":"Net olmayan kelime"},
  "pl": {"title":"Zrozum każde słowo","sub":"Wklej tekst, sfotografuj stronę, prześlij obraz lub zrób zrzut ekranu.\nTekst trafi do białego pola i możesz dotknąć dowolnego słowa, żeby zobaczyć, co znaczy.","placeholder":"Wklej swój tekst tutaj…","load":"Otwórz tekst","photo":"Zdjęcie, obraz lub PDF","reading":"Odczytywanie pliku…","ocrError":"Nie udało się odczytać tego pliku. Spróbuj wyraźniejszego zdjęcia albo pliku PDF / obrazu z czytelnym tekstem.","newText":"Nowy tekst","progress":"{a} z {b} słów","doneAll":"Dobra robota. Przejrzałeś każde słowo.","hint":"Dotknij dowolnego słowa, aby zobaczyć jego znaczenia. Słowa, które otworzyłeś, zmieniają kolor na zielony.","loginTitle":"Zaloguj się, aby przeczytać tekst","loginBtn":"Zaloguj się","upgradeTitle":"Czytanie tekstu to funkcja płatna","upgradeBtn":"Zobacz plany","loading":"Ładowanie…","camera":"Zrób zdjęcie aparatem","upload":"Prześlij obraz lub PDF","captureScreen":"Udostępnij ekran","understandSentence":"Zrozum to zdanie","editText":"Edytuj tekst","editDone":"Gotowe","unreadable":"Zdjęcie nie jest wystarczająco ostre, żeby je odczytać.\nZrób je bliżej, prosto nad stroną i przy dobrym świetle.","unsureNote":"Niektóre słowa na zdjęciu były niewyraźne i są oznaczone znakiem zapytania.\nSprawdź je i popraw przed czytaniem.","poorNote":"Zdjęcie nie było ostre, więc niektóre słowa mogły zostać odczytane błędnie.\nSprawdź je i popraw przed czytaniem.","desktopHint":"Na komputerze zdjęcie zrobione telefonem jest ostrzejsze","unsureWord":"Niewyraźne słowo"},
  "fa": {"title":"هر واژه را بفهمید","sub":"متنی را بچسبانید، از یک صفحه عکس بگیرید، تصویری بارگذاری کنید یا از صفحه‌نمایش خود اسکرین‌شات بگیرید.\nمتن در کادر سفید قرار می‌گیرد و می‌توانید روی هر کلمه بزنید تا معنی آن را ببینید.","placeholder":"متن خود را اینجا بچسبانید…","load":"باز کردن متن","photo":"عکس، تصویر یا PDF","reading":"در حال خواندن فایل…","ocrError":"نتوانستیم آن فایل را بخوانیم. یک عکس واضح‌تر، یا یک PDF / تصویر با متن خوانا را امتحان کنید.","newText":"متن جدید","progress":"{a} از {b} واژه","doneAll":"کارتان عالی بود. همه واژه‌ها را مرور کردید.","hint":"برای دیدن معناهای هر واژه روی آن ضربه بزنید. واژه‌هایی که باز کرده‌اید سبز می‌شوند.","loginTitle":"برای خواندن متن وارد شوید","loginBtn":"ورود","upgradeTitle":"خواندن متن یک ویژگی پولی است","upgradeBtn":"دیدن پلن‌ها","loading":"در حال بارگذاری…","camera":"عکس با دوربین","upload":"بارگذاری تصویر یا PDF","captureScreen":"اشتراک‌گذاری صفحه","understandSentence":"این جمله را بفهمید","editText":"ویرایش متن","editDone":"تمام","unreadable":"عکس به اندازه کافی واضح نیست که خوانده شود.\nاز نزدیک‌تر، درست بالای صفحه و در نور خوب عکس بگیرید.","unsureNote":"برخی واژه‌ها در عکس واضح نبودند و با علامت سؤال مشخص شده‌اند.\nپیش از خواندن، آن‌ها را بررسی و اصلاح کنید.","poorNote":"عکس واضح نبود، پس ممکن است برخی واژه‌ها اشتباه خوانده شده باشند.\nپیش از خواندن، آن‌ها را بررسی و اصلاح کنید.","desktopHint":"روی کامپیوتر، عکسی که با گوشی گرفته شود واضح‌تر است","unsureWord":"واژه نامشخص"},
  "id": {"title":"Pahami setiap kata","sub":"Tempel teks, foto halaman, unggah gambar, atau tangkap layarmu.\nTeksnya masuk ke kotak putih, dan kamu bisa ketuk kata apa pun untuk melihat artinya.","placeholder":"Tempel teksmu di sini…","load":"Buka teks","photo":"Foto, gambar, atau PDF","reading":"Membaca file…","ocrError":"Kami tidak bisa membaca file itu. Coba foto yang lebih jelas, atau PDF / gambar dengan teks yang terbaca.","newText":"Teks baru","progress":"{a} dari {b} kata","doneAll":"Kerja bagus. Kamu sudah melewati setiap kata.","hint":"Ketuk kata mana pun untuk melihat maknanya. Kata yang sudah kamu buka menjadi hijau.","loginTitle":"Masuk untuk membaca teks","loginBtn":"Masuk","upgradeTitle":"Membaca teks adalah fitur berbayar","upgradeBtn":"Lihat paket","loading":"Memuat…","camera":"Foto dengan kamera","upload":"Unggah gambar atau PDF","captureScreen":"Bagikan layar","understandSentence":"Pahami kalimat ini","editText":"Edit teks","editDone":"Selesai","unreadable":"Fotonya kurang tajam untuk dibaca.\nAmbil lebih dekat, tepat di atas halaman, dengan cahaya yang baik.","unsureNote":"Beberapa kata tidak jelas di foto dan ditandai dengan tanda tanya.\nPeriksa dan perbaiki sebelum membaca.","poorNote":"Fotonya tidak tajam, jadi beberapa kata mungkin terbaca salah.\nPeriksa dan perbaiki sebelum membaca.","desktopHint":"Di komputer, foto yang diambil dengan ponsel lebih tajam","unsureWord":"Kata tidak jelas"},
  "nl": {"title":"Begrijp elk woord","sub":"Plak een tekst, fotografeer een pagina, upload een afbeelding of maak een schermafbeelding.\nDe tekst komt in het witte vak en je kunt op elk woord tikken om te zien wat het betekent.","placeholder":"Plak je tekst hier…","load":"Tekst openen","photo":"Foto, afbeelding of PDF","reading":"Bestand wordt gelezen…","ocrError":"We konden dat bestand niet lezen. Probeer een duidelijkere foto, of een PDF / afbeelding met leesbare tekst.","newText":"Nieuwe tekst","progress":"{a} van {b} woorden","doneAll":"Goed gedaan. Je bent elk woord langsgegaan.","hint":"Tik op een woord om de betekenissen te zien. Woorden die je hebt geopend worden groen.","loginTitle":"Log in om een tekst te lezen","loginBtn":"Inloggen","upgradeTitle":"Een tekst lezen is een betaalde functie","upgradeBtn":"Bekijk abonnementen","loading":"Laden…","camera":"Foto maken met camera","upload":"Afbeelding of PDF uploaden","captureScreen":"Scherm delen","understandSentence":"Begrijp deze zin","editText":"Tekst bewerken","editDone":"Klaar","unreadable":"De foto is niet scherp genoeg om te lezen.\nMaak hem dichterbij, recht boven de pagina en bij goed licht.","unsureNote":"Sommige woorden waren niet duidelijk op de foto en zijn gemarkeerd met een vraagteken.\nControleer en verbeter ze voordat je gaat lezen.","poorNote":"De foto was niet scherp, dus sommige woorden zijn misschien verkeerd gelezen.\nControleer en verbeter ze voordat je gaat lezen.","desktopHint":"Op een computer is een foto die je met een telefoon maakt scherper","unsureWord":"Onduidelijk woord"},
  "el": {"title":"Κατανόησε κάθε λέξη","sub":"Επικόλλησε ένα κείμενο, φωτογράφισε μια σελίδα, ανέβασε μια εικόνα ή κάνε λήψη της οθόνης σου.\nΤο κείμενο μπαίνει στο λευκό πλαίσιο και μπορείς να πατήσεις οποιαδήποτε λέξη για να δεις τι σημαίνει.","placeholder":"Επικολλήστε το κείμενό σας εδώ…","load":"Άνοιγμα κειμένου","photo":"Φωτογραφία, εικόνα ή PDF","reading":"Ανάγνωση αρχείου…","ocrError":"Δεν μπορέσαμε να διαβάσουμε αυτό το αρχείο. Δοκιμάστε μια πιο καθαρή φωτογραφία, ή ένα PDF / εικόνα με ευανάγνωστο κείμενο.","newText":"Νέο κείμενο","progress":"{a} από {b} λέξεις","doneAll":"Ωραία δουλειά. Περάσατε από κάθε λέξη.","hint":"Πατήστε οποιαδήποτε λέξη για να δείτε τις σημασίες της. Οι λέξεις που έχετε ανοίξει γίνονται πράσινες.","loginTitle":"Συνδεθείτε για να διαβάσετε ένα κείμενο","loginBtn":"Σύνδεση","upgradeTitle":"Η ανάγνωση κειμένου είναι πληρωμένη λειτουργία","upgradeBtn":"Δείτε τα πλάνα","loading":"Φόρτωση…","camera":"Φωτογράφιση με κάμερα","upload":"Μεταφόρτωση εικόνας ή PDF","captureScreen":"Κοινή χρήση οθόνης","understandSentence":"Κατανόησε αυτή την πρόταση","editText":"Επεξεργασία κειμένου","editDone":"Τέλος","unreadable":"Η φωτογραφία δεν είναι αρκετά καθαρή για να διαβαστεί.\nΤραβήξτε την πιο κοντά, ακριβώς πάνω από τη σελίδα και με καλό φως.","unsureNote":"Κάποιες λέξεις δεν ήταν καθαρές στη φωτογραφία και σημειώνονται με ερωτηματικό.\nΕλέγξτε τις και διορθώστε τις πριν από την ανάγνωση.","poorNote":"Η φωτογραφία δεν ήταν καθαρή, οπότε κάποιες λέξεις μπορεί να διαβάστηκαν λάθος.\nΕλέγξτε τις και διορθώστε τις πριν από την ανάγνωση.","desktopHint":"Σε υπολογιστή, μια φωτογραφία από το κινητό βγαίνει πιο καθαρή","unsureWord":"Ασαφής λέξη"},
  "zu": {"title":"Qonda wonke amagama","sub":"Namathisela umbhalo, thatha isithombe sekhasi, layisha isithombe noma uthwebule isikrini sakho.\nUmbhalo ungena ebhokisini elimhlophe, futhi ungathepha noma yiliphi igama ukuze ubone ukuthi lisho ukuthini.","placeholder":"Namathisela umbhalo wakho lapha…","load":"Vula umbhalo","photo":"Isithombe, umfanekiso noma i-PDF","reading":"Ifunda ifayela…","ocrError":"Asikwazanga ukufunda lelo fayela. Zama isithombe esicacile kakhulu, noma i-PDF / umfanekiso onombhalo ofundekayo.","newText":"Umbhalo omusha","progress":"{a} kwamagama angu-{b}","doneAll":"Umsebenzi omuhle. Udlule kuwo wonke amagama.","hint":"Thinta noma yiliphi igama ukuze ubone izincazelo zalo. Amagama owuwavulile aba luhlaza.","loginTitle":"Ngena ukuze ufunde umbhalo","loginBtn":"Ngena","upgradeTitle":"Ukufunda umbhalo kuyisici okukhokhelwayo","upgradeBtn":"Buka amapulani","loading":"Iyalayisha…","camera":"Thwebula ngekhamera","upload":"Layisha isithombe noma i-PDF","captureScreen":"Yabelana ngesikrini","understandSentence":"Qonda lo musho","editText":"Hlela umbhalo","editDone":"Kuqediwe","unreadable":"Isithombe asicacile ngokwanele ukuze sifundeke.\nSithathe usondele kakhulu, ngqo phezu kwekhasi, ekukhanyeni okuhle.","unsureNote":"Amanye amagama abengacacile esithombeni futhi amakwe ngophawu lombuzo.\nWahlole futhi uwalungise ngaphambi kokufunda.","poorNote":"Isithombe besingacacile, ngakho amanye amagama kungenzeka afundwe kabi.\nWahlole futhi uwalungise ngaphambi kokufunda.","desktopHint":"Kukhompyutha, isithombe esithathwe ngefoni sicaca kakhulu","unsureWord":"Igama elingacacile"},
  "xh": {
    title: "Qonda lonke igama",
    sub: "Ncamathisela isicatshulwa, fota iphepha, layisha umfanekiso okanye ufote isikrini sakho.\nIsicatshulwa singena kwibhokisi emhlophe, kwaye ungacofa naliphi na igama ukuze ubone ukuba lithetha ntoni.",
    placeholder: "Ncamathisela isicatshulwa okanye umfanekiso wesikrini apha…",
    load: "Vula isicatshulwa",
    photo: "Ifoto, umfanekiso okanye i-PDF",
    reading: "Sifunda ifayile…",
    ocrError: "Asikwazanga ukufunda loo fayile. Zama ifoto ecace ngakumbi, okanye i-PDF / umfanekiso onesicatshulwa esifundekayo.",
    newText: "Isicatshulwa esitsha",
    progress: "Amagama angama-{a} kwangama-{b}",
    doneAll: "Umsebenzi omhle. Uwadlule onke amagama.",
    hint: "Cofa naliphi na igama ukuze ubone intsingiselo yalo. Amagama osele uwavulile aba luhlaza.",
    loginTitle: "Ngena ukuze ufunde isicatshulwa",
    loginBtn: "Ngena",
    upgradeTitle: "Ukufunda isicatshulwa luphawu oluhlawulelwayo",
    upgradeBtn: "Jonga izicwangciso",
    loading: "Iyalayisha…",
    camera: "Fota ngekhamera",
    upload: "Layisha umfanekiso okanye i-PDF",
    captureScreen: "Fota isikrini",
    understandSentence: "Qonda esi sivakalisi",
    editText: "Hlela isicatshulwa",
    editDone: "Kugqityiwe",
    unreadable: "Ifoto ayicacanga ngokwaneleyo ukuba ifundeke.\nYifote usondele ngakumbi, ngqo phezu kwephepha, ekukhanyeni okuhle.",
    unsureNote: "Amanye amagama ebengacacanga kwifoto kwaye aphawulwe ngophawu lombuzo.\nWajonge uze uwalungise phambi kokufunda.",
    poorNote: "Ifoto ibingacacanga, ngoko amanye amagama asenokuba afundwe kakubi.\nWajonge uze uwalungise phambi kokufunda.",
    desktopHint: "Kwikhompyutha, ifoto ethathwe ngefowuni icaca ngakumbi",
    unsureWord: "Igama elingacacanga",
  },
  "nso": {
    title: "Kwešiša lentšu le lengwe le le lengwe",
    sub: "Kgomaretša sengwalwa, tšea seswantšho sa letlakala, laiša seswantšho goba o tšee seswantšho sa sekirini sa gago.\nSengwalwa se tsena ka lepokising le lešweu, gomme o ka kgotla lentšu lefe goba lefe go bona gore le ra eng.",
    placeholder: "Kgomaretša sengwalwa goba seswantšho sa sekirini mo…",
    load: "Bula sengwalwa",
    photo: "Seswantšho goba PDF",
    reading: "Re bala faele…",
    ocrError: "Re paletšwe ke go bala faele yeo. Leka seswantšho se se bonagalago gabotse, goba PDF / seswantšho seo se nago le sengwalwa se se balegago.",
    newText: "Sengwalwa se seswa",
    progress: "Mantšu a {a} go a {b}",
    doneAll: "Mošomo o mobotse. O fetile lentšu le lengwe le le lengwe.",
    hint: "Kgotla lentšu lefe goba lefe go bona tlhalošo ya lona. Mantšu ao o a butšego a fetoga a matala.",
    loginTitle: "Tsena gore o bale sengwalwa",
    loginBtn: "Tsena",
    upgradeTitle: "Go bala sengwalwa ke karolo ye e lefelwago",
    upgradeBtn: "Bona maano",
    loading: "E a laiša…",
    camera: "Tšea seswantšho ka khamera",
    upload: "Laiša seswantšho goba PDF",
    captureScreen: "Tšea seswantšho sa sekirini",
    understandSentence: "Kwešiša lefoko le",
    editText: "Lokiša sengwalwa",
    editDone: "Go phethilwe",
    unreadable: "Seswantšho ga se bonagale gabotse go lekana gore se balwe.\nSe tšee o batamela, thwii godimo ga letlakala, seetšeng se sebotse.",
    unsureNote: "Mantšu a mangwe a be a sa bonagale gabotse seswantšhong gomme a swailwe ka leswao la potšišo.\nA hlahlobe gomme o a lokiše pele o bala.",
    poorNote: "Seswantšho se be se sa bonagale gabotse, ka fao mantšu a mangwe a ka be a badilwe phošo.\nA hlahlobe gomme o a lokiše pele o bala.",
    desktopHint: "Khomphuthareng, seswantšho se se tšerwego ka mogala se bonagala gabotse",
    unsureWord: "Lentšu le le sa bonagalego",
  },
  "tn": {
    title: "Tlhaloganya lefoko lengwe le lengwe",
    sub: "Kopolola mokwalo, tsaya setshwantsho sa tsebe, tsenya setshwantsho kgotsa tsaya setshwantsho sa sekirini sa gago.\nMokwalo o tsena mo lebokosong le lesweu, mme o ka tobetsa lefoko lefe kana lefe go bona gore le raya eng.",
    placeholder: "Kopolola mokwalo kgotsa setshwantsho sa sekirini fa…",
    load: "Bula mokwalo",
    photo: "Setshwantsho, ditshwantsho kgotsa PDF",
    reading: "Re bala faele…",
    ocrError: "Ga re a kgona go bala faele eo. Leka setshwantsho se se phepafetseng, kgotsa PDF / setshwantsho se se nang le mokwalo o o balegang.",
    newText: "Mokwalo o moša",
    progress: "{a} mo go {b} a mafoko",
    doneAll: "Tiro e ntle. O fetile mo lefokong lengwe le lengwe.",
    hint: "Tobetsa lefoko lefe kana lefe go bona tlhaloso ya lone. Mafoko a o a butseng a fetoga botala.",
    loginTitle: "Tsena go bala mokwalo",
    loginBtn: "Tsena",
    upgradeTitle: "Go bala mokwalo ke karolo e e duelelwang",
    upgradeBtn: "Bona maano",
    loading: "Go a laisiwa…",
    camera: "Tsaya setshwantsho ka khamera",
    upload: "Tsenya setshwantsho kgotsa PDF",
    captureScreen: "Tsaya setshwantsho sa sekirini",
    understandSentence: "Tlhaloganya polelo e",
    editText: "Baakanya mokwalo",
    editDone: "Go fedile",
    unreadable: "Setshwantsho ga se a phepafala go lekana gore se balwe.\nSe tseye o le gaufi, fa godimo ga tsebe tota, mo leseding le le siameng.",
    unsureNote: "Mafoko mangwe a ne a sa bonale sentle mo setshwantshong mme a tshwailwe ka letshwao la potso.\nA tlhatlhobe o be o a baakanye pele o bala.",
    poorNote: "Setshwantsho se ne se sa phepafala, ka jalo mafoko mangwe a ka tswa a badilwe phoso.\nA tlhatlhobe o be o a baakanye pele o bala.",
    desktopHint: "Mo khomputareng, setshwantsho se se tserweng ka founu se phepafala go feta",
    unsureWord: "Lefoko le le sa bonaleng",
  },
  "st": {
    title: "Utlwisisa lentswe le leng le le leng",
    sub: "Kgomaretsa sengolwa, nka foto ya leqephe, kenya setshwantsho kapa o nke setshwantsho sa skrine sa hao.\nSengolwa se kena lebokoseng le lesweu, mme o ka tobetsa lentswe lefe kapa lefe ho bona hore le bolelang.",
    placeholder: "Kgomaretsa sengolwa kapa setshwantsho sa skrine mona…",
    load: "Bula sengolwa",
    photo: "Foto, setshwantsho kapa PDF",
    reading: "Re bala faele…",
    ocrError: "Ha re a kgona ho bala faele eo. Leka foto e hlakileng haholwanyane, kapa PDF / setshwantsho se nang le sengolwa se balehang.",
    newText: "Sengolwa se setjha",
    progress: "{a} ho mantswe a {b}",
    doneAll: "Mosebetsi o motle. O fetile lentswe le leng le le leng.",
    hint: "Tobetsa lentswe lefe kapa lefe ho bona moelelo wa lona. Mantswe ao o a butseng a fetoha a matala.",
    loginTitle: "Kena hore o bale sengolwa",
    loginBtn: "Kena",
    upgradeTitle: "Ho bala sengolwa ke karolo e lefellwang",
    upgradeBtn: "Sheba merero",
    loading: "E a laeta…",
    camera: "Nka foto ka khamera",
    upload: "Kenya setshwantsho kapa PDF",
    captureScreen: "Nka setshwantsho sa skrine",
    understandSentence: "Utlwisisa polelo ena",
    editText: "Lokisa sengolwa",
    editDone: "Ho phethilwe",
    unreadable: "Foto ha e a hlaka ho lekana hore e balwe.\nE nke o le haufi, ka holimo ho leqephe hantle, leseling le letle.",
    unsureNote: "Mantswe a mang a ne a sa hlaka fotong mme a tshwailwe ka letshwao la potso.\nA hlahlobe mme o a lokise pele o bala.",
    poorNote: "Foto e ne e sa hlaka, kahoo mantswe a mang a ka be a badilwe hampe.\nA hlahlobe mme o a lokise pele o bala.",
    desktopHint: "Khomputareng, foto e nkuweng ka fono e hlaka haholwanyane",
    unsureWord: "Lentswe le sa hlakang",
  },
  "ts": {
    title: "Twisisa rito rin'wana na rin'wana",
    sub: "Nameka tsalwa, teka xifaniso xa tluka, khandziyisa xifaniso kumbe u teka xifaniso xa xikirini.\nTsalwa ri nghena ebokisini ro basa, kutani u nga thinta rito rin'wana na rin'wana leswaku u vona leswi ri swi vulaka.",
    placeholder: "Nameka tsalwa kumbe xifaniso xa xikirini laha…",
    load: "Pfula tsalwa",
    photo: "Xifaniso, swifaniso kumbe PDF",
    reading: "Hi hlaya fayili…",
    ocrError: "A hi swi kotanga ku hlaya fayili yoleyo. Ringeta xifaniso lexi vonakaka kahle, kumbe PDF / xifaniso lexi nga na tsalwa leri hlayekaka.",
    newText: "Tsalwa lerintshwa",
    progress: "{a} eka marito ya {b}",
    doneAll: "U tirhile kahle. U langute rito rin'wana na rin'wana.",
    hint: "Thinta rito rin'wana na rin'wana leswaku u vona nhlamuselo ya rona. Marito lawa u ma pfuleke ma hundzuka rihlaza.",
    loginTitle: "Nghena leswaku u hlaya tsalwa",
    loginBtn: "Nghena",
    upgradeTitle: "Ku hlaya tsalwa i xihlawulekisi xo hakeriwa",
    upgradeBtn: "Vona tipulani",
    loading: "Ya layicha…",
    camera: "Teka xifaniso hi khamera",
    upload: "Khandziyisa xifaniso kumbe PDF",
    captureScreen: "Teka xifaniso xa xikirini",
    understandSentence: "Twisisa xivulwa lexi",
    editText: "Lulamisa tsalwa",
    editDone: "Swi hetile",
    unreadable: "Xifaniso a xi vonaki kahle ku ringana leswaku xi hlayiwa.\nXi teke u ri ekusuhi, ehenhla ka tluka hi ku kongoma, eka ku vonakala lokunene.",
    unsureNote: "Marito man'wana a ma nga vonaki kahle eka xifaniso naswona ma funghiwile hi mfungho wa xivutiso.\nMa kambisise u ma lulamisa u nga si hlaya.",
    poorNote: "Xifaniso a xi nga vonaki kahle, hikwalaho marito man'wana ma nga va ma hlayiwile hi ndlela yo hoxeka.\nMa kambisise u ma lulamisa u nga si hlaya.",
    desktopHint: "Eka khompyuta, xifaniso lexi tekiweke hi riqingho xi vonaka kahle ku tlula",
    unsureWord: "Rito leri nga vonakiki",
  },
  "ss": {
    title: "Condza onkhe emagama",
    sub: "Namatsisela umbhalo, tfwebula likhasi, layisha sitfombe nobe utfwebule sikrini sakho.\nUmbhalo ungena ebhokisini lelimhlophe, futsi ungacindzetela nobe nguliphi ligama kute ubone kutsi lisho kutsini.",
    placeholder: "Namatsisela umbhalo nobe sitfombe sesikrini lapha…",
    load: "Vula umbhalo",
    photo: "Sitfombe, lifayela lesitfombe nobe i-PDF",
    reading: "Kufundvwa lifayela…",
    ocrError: "Asikhonanga kufundza lelofayela. Zama sitfombe lesicace kakhulu, nobe i-PDF / sitfombe lesinembhalo lofundzekako.",
    newText: "Umbhalo lomusha",
    progress: "{a} kwa-{b} emagama",
    doneAll: "Umsebenti lomuhle. Uwadlulile onkhe emagama.",
    hint: "Cindzetela nobe nguliphi ligama kute ubone inchazelo yalo. Emagama lowavulile aba luhlata.",
    loginTitle: "Ngena kute ufundze umbhalo",
    loginBtn: "Ngena",
    upgradeTitle: "Kufundza umbhalo kuyintfo lekhokhelwako",
    upgradeBtn: "Buka emahlelo",
    loading: "Kuyalayisha…",
    camera: "Tfwebula ngelikhamera",
    upload: "Layisha sitfombe nobe i-PDF",
    captureScreen: "Tfwebula sikrini",
    understandSentence: "Condza lomusho",
    editText: "Lungisa umbhalo",
    editDone: "Kuphelile",
    unreadable: "Sitfombe asicaci ngalokwanele kutsi sifundvwe.\nSitfwebule useduze, ngco ngetulu kwelikhasi, ekukhanyeni lokuhle.",
    unsureNote: "Lamanye emagama bekangacaci esitfombeni futsi akhonjwe ngeluphawu lwemubuto.\nWahlole futsi uwalungise ngaphambi kwekufundza.",
    poorNote: "Sitfombe besingacaci, ngako lamanye emagama kungenteka afundvwe kabi.\nWahlole futsi uwalungise ngaphambi kwekufundza.",
    desktopHint: "Ekhomphyutheni, sitfombe lesitfwetjulwe ngelucingo sicaca kakhulu",
    unsureWord: "Ligama lelingacaci",
  },
  "ve": {
    title: "Pfesesani ipfi ḽiṅwe na ḽiṅwe",
    sub: "Dzhenisani ṱhaluso, dzhiani tshifanyiso tsha siaṱari, rumelani tshifanyiso kana ni dzhie tshifanyiso tsha tshikirini.\nṰhaluso i dzhena kha bogisi ḽitshena, nahone ni nga kwama ipfi ḽiṅwe na ḽiṅwe uri ni vhone zwine ḽa amba.",
    placeholder: "Dzhenisani ṱhaluso kana tshifanyiso tsha tshikirini fhano…",
    load: "Vulani ṱhaluso",
    photo: "Tshifanyiso, tshifanyiso kana PDF",
    reading: "Ri khou vhala faela…",
    ocrError: "A ro ngo kona u vhala faela iyo. Lingedzani tshifanyiso tshi vhonalaho zwavhuḓi, kana PDF / tshifanyiso tshi re na ṱhaluso i vhalaeaho.",
    newText: "Ṱhaluso ntswa",
    progress: "{a} kha maipfi a {b}",
    doneAll: "Mushumo wavhuḓi. No sedza ipfi ḽiṅwe na ḽiṅwe.",
    hint: "Kwamani ipfi ḽiṅwe na ḽiṅwe uri ni vhone ndeme yaḽo. Maipfi e na a vula a vha madala.",
    loginTitle: "Dzhenani uri ni vhale ṱhaluso",
    loginBtn: "Dzhenani",
    upgradeTitle: "U vhala ṱhaluso ndi tshipiḓa tsha u badelwa",
    upgradeBtn: "Vhonani pulane",
    loading: "Zwi khou ḓa…",
    camera: "Dzhiani tshifanyiso nga khamera",
    upload: "Rumelani tshifanyiso kana PDF",
    captureScreen: "Dzhiani tshifanyiso tsha tshikirini",
    understandSentence: "Pfesesani mutaladzi uyu",
    editText: "Lugisani ṱhaluso",
    editDone: "Zwo fhela",
    unreadable: "Tshifanyiso a tshi vhonali zwavhuḓi u lingana uri tshi vhalwe.\nTshi dzhieni ni tsini, nṱha ha siaṱari, kha tshedza tshavhuḓi.",
    unsureNote: "Maipfi maṅwe o vha a sa vhonali zwavhuḓi kha tshifanyiso nahone o swayiwa nga tshiga tsha mbudziso.\nA ṱoleni ni a lugise ni sa athu vhala.",
    poorNote: "Tshifanyiso tsho vha tshi sa vhonali zwavhuḓi, ngauralo maipfi maṅwe a nga vha o vhaliwa nga nḓila i si yone.\nA ṱoleni ni a lugise ni sa athu vhala.",
    desktopHint: "Kha khomphiyutha, tshifanyiso tsho dzhiiwaho nga foni tshi vhonala zwavhuḓi u fhira",
    unsureWord: "Ipfi ḽi sa vhonali",
  },
  "nr": {
    title: "Zwisisa ilizwi ngalinye",
    sub: "Namathisela umtlolo, thatha isithombe sekhasi, layisha isithombe namkha uthathe isithombe sesikrini sakho.\nUmtlolo ungena ebhokisini elimhlophe, begodu ungathinta nanyana ngiliphi ilizwi bona ubone bona litjho ini.",
    placeholder: "Namathisela umtlolo namkha isithombe sesikrini lapha…",
    load: "Vula umtlolo",
    photo: "Isithombe, umfanekiso namkha i-PDF",
    reading: "Kufundwa ifayela…",
    ocrError: "Asikghonanga ukufunda ifayela leyo. Linga isithombe esikhanya khulu, namkha i-PDF / isithombe esinomtlolo ofundekako.",
    newText: "Umtlolo omutjha",
    progress: "{a} kwa-{b} amezwi",
    doneAll: "Wenze kuhle. Udlule elizwini ngalinye.",
    hint: "Thinta nanyana ngiliphi ilizwi bona ubone ihlathululo yalo. Amezwi osuwavulile aba luhlaza.",
    loginTitle: "Ngena bona ufunde umtlolo",
    loginBtn: "Ngena",
    upgradeTitle: "Ukufunda umtlolo kuyinzuzo ebhadelelwako",
    upgradeBtn: "Bona amahlelo",
    loading: "Kuyalayitha…",
    camera: "Thatha isithombe ngekhamera",
    upload: "Layisha isithombe namkha i-PDF",
    captureScreen: "Thatha isithombe sesikrini",
    understandSentence: "Zwisisa umutjho lo",
    editText: "Lungisa umtlolo",
    editDone: "Kuphelile",
    unreadable: "Isithombe asikhanyi ngokwaneleko bona sifundeke.\nSithathe useduze, ngqo ngaphezu kwekhasi, ekukhanyeni okuhle.",
    unsureNote: "Amanye amezwi bekangakhanyi esithombeni begodu atjengiswe ngetshwayo lombuzo.\nWahlole begodu uwalungise ngaphambi kokufunda.",
    poorNote: "Isithombe besingakhanyi, ngalokho amanye amezwi kungenzeka bona afundwe kumbi.\nWahlole begodu uwalungise ngaphambi kokufunda.",
    desktopHint: "Ekhomphyutheni, isithombe esithathwe ngefoni sikhanya khulu",
    unsureWord: "Ilizwi elingakhanyiko",
  },
  "vi": {"title":"Hiểu mọi từ","sub":"Dán văn bản, chụp ảnh một trang, tải ảnh lên hoặc chụp màn hình.\nVăn bản sẽ hiện trong ô trắng, và bạn có thể chạm vào bất kỳ từ nào để xem nghĩa của từ đó.","placeholder":"Dán văn bản của bạn vào đây…","load":"Mở văn bản","photo":"Ảnh, hình ảnh hoặc PDF","reading":"Đang đọc tệp…","ocrError":"Chúng tôi không đọc được tệp đó. Hãy thử ảnh rõ hơn, hoặc một tệp PDF / hình ảnh có chữ dễ đọc.","newText":"Văn bản mới","progress":"{a} trên {b} từ","doneAll":"Làm tốt lắm. Bạn đã xem qua mọi từ.","hint":"Chạm vào bất kỳ từ nào để xem ý nghĩa của nó. Những từ bạn đã mở sẽ chuyển sang màu xanh lá.","loginTitle":"Đăng nhập để đọc một văn bản","loginBtn":"Đăng nhập","upgradeTitle":"Đọc một văn bản là tính năng trả phí","upgradeBtn":"Xem các gói","loading":"Đang tải…","camera":"Chụp bằng máy ảnh","upload":"Tải lên ảnh hoặc PDF","captureScreen":"Chia sẻ màn hình","understandSentence":"Hiểu câu này","editText":"Sửa văn bản","editDone":"Xong","unreadable":"Ảnh chưa đủ nét để đọc.\nHãy chụp gần hơn, ngay phía trên trang và ở nơi đủ sáng.","unsureNote":"Một số từ trong ảnh không rõ và được đánh dấu bằng dấu chấm hỏi.\nHãy kiểm tra và sửa lại trước khi đọc.","poorNote":"Ảnh không nét, nên một số từ có thể đã bị đọc sai.\nHãy kiểm tra và sửa lại trước khi đọc.","desktopHint":"Trên máy tính, ảnh chụp bằng điện thoại sẽ nét hơn","unsureWord":"Từ không rõ"},
  "fil": {"title":"Unawain ang bawat salita","sub":"Mag-paste ng teksto, kunan ng litrato ang isang pahina, mag-upload ng larawan, o i-capture ang iyong screen.\nLalabas ang teksto sa puting kahon, at puwede mong i-tap ang kahit anong salita para makita ang kahulugan nito.","placeholder":"I-paste ang iyong teksto dito…","load":"Buksan ang teksto","photo":"Litrato, larawan o PDF","reading":"Binabasa ang file…","ocrError":"Hindi namin nabasa ang file na iyon. Subukan ang mas malinaw na litrato, o isang PDF / larawan na may nababasang teksto.","newText":"Bagong teksto","progress":"{a} ng {b} salita","doneAll":"Magaling. Napagdaanan mo na ang bawat salita.","hint":"I-tap ang anumang salita para makita ang mga kahulugan nito. Ang mga salitang nabuksan mo ay nagiging berde.","loginTitle":"Mag-sign in para magbasa ng teksto","loginBtn":"Mag-sign in","upgradeTitle":"Ang pagbasa ng teksto ay bayad na feature","upgradeBtn":"Tingnan ang mga plano","loading":"Naglo-load…","camera":"Kumuha gamit ang camera","upload":"Mag-upload ng larawan o PDF","captureScreen":"Ibahagi ang screen","understandSentence":"Unawain ang pangungusap na ito","editText":"I-edit ang teksto","editDone":"Tapos na","unreadable":"Hindi sapat ang linaw ng litrato para mabasa.\nKunan nang mas malapit, diretso sa ibabaw ng pahina, at sa maliwanag na lugar.","unsureNote":"May ilang salitang hindi malinaw sa litrato at may markang tandang pananong.\nSuriin at itama ang mga ito bago magbasa.","poorNote":"Hindi malinaw ang litrato, kaya maaaring mali ang pagkabasa sa ilang salita.\nSuriin at itama ang mga ito bago magbasa.","desktopHint":"Sa computer, mas malinaw ang litratong kinunan gamit ang telepono","unsureWord":"Hindi malinaw na salita"},
  "af": {"title":"Verstaan elke woord","sub":"Plak 'n teks, neem 'n foto van 'n bladsy, laai 'n prent op of neem 'n skermskoot.\nDie teks verskyn in die wit blokkie, en jy kan op enige woord tik om te sien wat dit beteken.","placeholder":"Plak jou teks hier…","load":"Maak teks oop","photo":"Foto, prent of PDF","reading":"Besig om die lêer te lees…","ocrError":"Ons kon nie daardie lêer lees nie. Probeer 'n duideliker foto, of 'n PDF / prent met leesbare teks.","newText":"Nuwe teks","progress":"{a} van {b} woorde","doneAll":"Mooi werk. Jy het deur elke woord gegaan.","hint":"Tik enige woord om sy betekenisse te sien. Woorde wat jy oopgemaak het, word groen.","loginTitle":"Meld aan om 'n teks te lees","loginBtn":"Meld aan","upgradeTitle":"Om 'n teks te lees is 'n betaalde kenmerk","upgradeBtn":"Sien planne","loading":"Besig om te laai…","camera":"Neem foto met kamera","upload":"Laai prent of PDF op","captureScreen":"Deel skerm","understandSentence":"Verstaan hierdie sin","editText":"Wysig teks","editDone":"Klaar","unreadable":"Die foto is nie skerp genoeg om te lees nie.\nNeem dit nader, reg bo die bladsy en in goeie lig.","unsureNote":"Sommige woorde was nie duidelik op die foto nie en is met 'n vraagteken gemerk.\nGaan dit na en maak dit reg voordat jy lees.","poorNote":"Die foto was nie skerp nie, so sommige woorde is dalk verkeerd gelees.\nGaan dit na en maak dit reg voordat jy lees.","desktopHint":"Op 'n rekenaar is 'n foto wat met 'n foon geneem is skerper","unsureWord":"Onduidelike woord"},
  "sw": {"title":"Elewa kila neno","sub":"Bandika maandishi, piga picha ya ukurasa, pakia picha au nasa skrini yako.\nMaandishi yanaingia kwenye kisanduku cheupe, na unaweza kugusa neno lolote kuona maana yake.","placeholder":"Bandika maandishi yako hapa…","load":"Fungua maandishi","photo":"Picha, taswira au PDF","reading":"Inasoma faili…","ocrError":"Hatukuweza kusoma faili hilo. Jaribu picha iliyo wazi zaidi, au PDF / taswira yenye maandishi yanayosomeka.","newText":"Maandishi mapya","progress":"{a} kati ya maneno {b}","doneAll":"Kazi nzuri. Umepitia kila neno.","hint":"Gusa neno lolote ili kuona maana zake. Maneno uliyoyafungua yanakuwa ya kijani.","loginTitle":"Ingia ili kusoma maandishi","loginBtn":"Ingia","upgradeTitle":"Kusoma maandishi ni kipengele cha kulipia","upgradeBtn":"Ona mipango","loading":"Inapakia…","camera":"Piga picha kwa kamera","upload":"Pakia picha au PDF","captureScreen":"Shiriki skrini","understandSentence":"Elewa sentensi hii","editText":"Hariri maandishi","editDone":"Nimemaliza","unreadable":"Picha haiko wazi vya kutosha kusomeka.\nIpige karibu zaidi, moja kwa moja juu ya ukurasa, kwenye mwanga mzuri.","unsureNote":"Baadhi ya maneno hayakuwa wazi kwenye picha na yamewekewa alama ya kuuliza.\nYakague na uyasahihishe kabla ya kusoma.","poorNote":"Picha haikuwa wazi, kwa hiyo huenda baadhi ya maneno yamesomwa vibaya.\nYakague na uyasahihishe kabla ya kusoma.","desktopHint":"Kwenye kompyuta, picha iliyopigwa kwa simu huwa wazi zaidi","unsureWord":"Neno lisilo wazi"},
  "zh-CN": {"title":"理解每个词","sub":"粘贴文字、拍下一页、上传图片或截取屏幕。\n文字会出现在白色框里，点任意一个词就能看到它的意思。","placeholder":"在此粘贴你的文本…","load":"打开文本","photo":"照片、图片或 PDF","reading":"正在读取文件…","ocrError":"我们无法读取该文件。请尝试更清晰的照片，或文字清晰可读的 PDF / 图片。","newText":"新文本","progress":"{a}/{b} 词","doneAll":"做得好。你已经看完了每一个词。","hint":"点击任意词语即可查看它的含义。你打开过的词会变成绿色。","loginTitle":"登录以阅读文本","loginBtn":"登录","upgradeTitle":"阅读文本是付费功能","upgradeBtn":"查看套餐","loading":"正在加载…","camera":"用相机拍照","upload":"上传图片或PDF","captureScreen":"共享屏幕","understandSentence":"理解这句话","editText":"编辑文本","editDone":"完成","unreadable":"照片不够清晰，无法读取。\n请靠近一些，正对页面上方，在光线充足的地方拍摄。","unsureNote":"照片中有些词看不清，已用问号标出。\n阅读前请检查并改正。","poorNote":"照片不够清晰，有些词可能读错了。\n阅读前请检查并改正。","desktopHint":"在电脑上，用手机拍的照片更清晰","unsureWord":"看不清的词"},
  "zh-TW": {"title":"理解每個詞","sub":"貼上文字、拍下一頁、上傳圖片或擷取螢幕畫面。\n文字會出現在白色框中，點任何一個詞就能看到它的意思。","placeholder":"在此貼上你的文字…","load":"開啟文本","photo":"相片、圖片或 PDF","reading":"正在讀取檔案…","ocrError":"我們無法讀取該檔案。請嘗試更清晰的相片，或文字清楚可讀的 PDF / 圖片。","newText":"新文本","progress":"{a}/{b} 詞","doneAll":"做得好。你已經看完每一個詞。","hint":"點按任何詞語即可查看它的含義。你開啟過的詞會變成綠色。","loginTitle":"登入以閱讀文本","loginBtn":"登入","upgradeTitle":"閱讀文本是付費功能","upgradeBtn":"查看方案","loading":"正在載入…","camera":"用相機拍照","upload":"上傳圖片或PDF","captureScreen":"共用螢幕","understandSentence":"理解這句話","editText":"編輯文字","editDone":"完成","unreadable":"相片不夠清晰，無法讀取。\n請靠近一點，正對頁面上方，在光線充足的地方拍攝。","unsureNote":"相片中有些詞看不清楚，已用問號標出。\n閱讀前請檢查並修正。","poorNote":"相片不夠清晰，有些詞可能讀錯了。\n閱讀前請檢查並修正。","desktopHint":"在電腦上，用手機拍的相片更清晰","unsureWord":"看不清楚的詞"},
  "ko": {"title":"모든 단어 이해하기","sub":"텍스트를 붙여넣거나, 페이지를 촬영하거나, 이미지를 올리거나, 화면을 캡처하세요.\n텍스트가 흰색 상자에 표시되고, 아무 단어나 탭하면 뜻을 볼 수 있어요.","placeholder":"여기에 텍스트를 붙여넣으세요…","load":"텍스트 열기","photo":"사진, 이미지 또는 PDF","reading":"파일을 읽는 중…","ocrError":"해당 파일을 읽을 수 없습니다. 더 선명한 사진이나, 글자가 읽기 쉬운 PDF / 이미지로 다시 시도해 보세요.","newText":"새 텍스트","progress":"{b}개 중 {a}개 단어","doneAll":"잘하셨어요. 모든 단어를 살펴봤습니다.","hint":"아무 단어나 탭하면 그 뜻을 볼 수 있습니다. 열어 본 단어는 초록색으로 바뀝니다.","loginTitle":"텍스트를 읽으려면 로그인하세요","loginBtn":"로그인","upgradeTitle":"텍스트 읽기는 유료 기능입니다","upgradeBtn":"요금제 보기","loading":"불러오는 중…","camera":"카메라로 촬영","upload":"이미지 또는 PDF 업로드","captureScreen":"화면 공유","understandSentence":"이 문장 이해하기","editText":"텍스트 수정","editDone":"완료","unreadable":"사진이 선명하지 않아 읽을 수 없어요.\n더 가까이에서, 페이지 바로 위에서, 밝은 곳에서 찍어 주세요.","unsureNote":"사진에서 일부 단어가 잘 보이지 않아 물음표로 표시했어요.\n읽기 전에 확인하고 고쳐 주세요.","poorNote":"사진이 선명하지 않아 일부 단어를 잘못 읽었을 수 있어요.\n읽기 전에 확인하고 고쳐 주세요.","desktopHint":"컴퓨터에서는 휴대폰으로 찍은 사진이 더 선명해요","unsureWord":"잘 보이지 않는 단어"},
  "th": {"title":"เข้าใจทุกคำ","sub":"วางข้อความ ถ่ายรูปหน้าหนังสือ อัปโหลดรูปภาพ หรือจับภาพหน้าจอ\nข้อความจะแสดงในกรอบสีขาว แตะคำไหนก็ได้เพื่อดูความหมาย","placeholder":"วางข้อความของคุณที่นี่…","load":"เปิดข้อความ","photo":"ภาพถ่าย รูปภาพ หรือ PDF","reading":"กำลังอ่านไฟล์…","ocrError":"เราอ่านไฟล์นั้นไม่ได้ ลองใช้ภาพถ่ายที่ชัดขึ้น หรือ PDF / รูปภาพที่มีข้อความอ่านออกได้","newText":"ข้อความใหม่","progress":"{a}/{b} คำ","doneAll":"เยี่ยมมาก คุณดูครบทุกคำแล้ว","hint":"แตะคำใดก็ได้เพื่อดูความหมายของคำนั้น คำที่คุณเปิดแล้วจะเปลี่ยนเป็นสีเขียว","loginTitle":"ลงชื่อเข้าใช้เพื่ออ่านข้อความ","loginBtn":"ลงชื่อเข้าใช้","upgradeTitle":"การอ่านข้อความเป็นฟีเจอร์แบบเสียเงิน","upgradeBtn":"ดูแพ็กเกจ","loading":"กำลังโหลด…","camera":"ถ่ายด้วยกล้อง","upload":"อัปโหลดรูปภาพหรือ PDF","captureScreen":"แชร์หน้าจอ","understandSentence":"เข้าใจประโยคนี้","editText":"แก้ไขข้อความ","editDone":"เสร็จแล้ว","unreadable":"ภาพถ่ายไม่ชัดพอที่จะอ่านได้\nถ่ายให้ใกล้ขึ้น ตรงเหนือหน้ากระดาษ และในที่ที่มีแสงดี","unsureNote":"บางคำในภาพไม่ชัดและถูกทำเครื่องหมายด้วยเครื่องหมายคำถาม\nโปรดตรวจและแก้ไขก่อนอ่าน","poorNote":"ภาพถ่ายไม่ชัด จึงอาจอ่านบางคำผิด\nโปรดตรวจและแก้ไขก่อนอ่าน","desktopHint":"บนคอมพิวเตอร์ ภาพที่ถ่ายด้วยโทรศัพท์จะชัดกว่า","unsureWord":"คำที่ไม่ชัด"},
  "bn": {"title":"প্রতিটি শব্দ বুঝুন","sub":"টেক্সট পেস্ট করুন, একটি পাতার ছবি তুলুন, একটি ছবি আপলোড করুন বা আপনার স্ক্রিন ক্যাপচার করুন।\nটেক্সটটি সাদা বাক্সে চলে আসে, আর যেকোনো শব্দে ট্যাপ করে তার মানে দেখে নিন।","placeholder":"আপনার লেখা এখানে পেস্ট করুন…","load":"লেখা খুলুন","photo":"ছবি, ইমেজ বা PDF","reading":"ফাইলটি পড়া হচ্ছে…","ocrError":"আমরা সেই ফাইলটি পড়তে পারিনি। আরও স্পষ্ট একটি ছবি চেষ্টা করুন, অথবা পড়ার যোগ্য লেখাসহ একটি PDF / ইমেজ ব্যবহার করুন।","newText":"নতুন লেখা","progress":"{b}টির মধ্যে {a}টি শব্দ","doneAll":"চমৎকার। আপনি প্রতিটি শব্দ দেখে ফেলেছেন।","hint":"অর্থ দেখতে যেকোনো শব্দে ট্যাপ করুন। আপনি যে শব্দগুলো খুলেছেন সেগুলো সবুজ হয়ে যায়।","loginTitle":"একটি লেখা পড়তে সাইন ইন করুন","loginBtn":"সাইন ইন","upgradeTitle":"লেখা পড়া একটি পেইড ফিচার","upgradeBtn":"প্ল্যান দেখুন","loading":"লোড হচ্ছে…","camera":"ক্যামেরা দিয়ে ছবি তুলুন","upload":"ছবি বা PDF আপলোড করুন","captureScreen":"স্ক্রিন শেয়ার করুন","understandSentence":"এই বাক্যটি বুঝুন","editText":"লেখা সম্পাদনা করুন","editDone":"হয়ে গেছে","unreadable":"ছবিটি পড়ার মতো যথেষ্ট স্পষ্ট নয়।\nআরও কাছ থেকে, পাতার ঠিক ওপর থেকে এবং ভালো আলোতে ছবি তুলুন।","unsureNote":"ছবিতে কিছু শব্দ স্পষ্ট ছিল না, সেগুলো প্রশ্নচিহ্ন দিয়ে চিহ্নিত করা হয়েছে।\nপড়ার আগে সেগুলো দেখে ঠিক করে নিন।","poorNote":"ছবিটি স্পষ্ট ছিল না, তাই কিছু শব্দ ভুল পড়া হয়ে থাকতে পারে।\nপড়ার আগে সেগুলো দেখে ঠিক করে নিন।","desktopHint":"কম্পিউটারে, ফোনে তোলা ছবি বেশি স্পষ্ট হয়","unsureWord":"অস্পষ্ট শব্দ"},
  "da": {"title":"Forstå hvert ord","sub":"Indsæt en tekst, fotografér en side, upload et billede eller tag et skærmbillede.\nTeksten kommer ind i den hvide boks, og du kan trykke på et hvilket som helst ord for at se, hvad det betyder.","placeholder":"Indsæt din tekst her…","load":"Åbn tekst","photo":"Foto, billede eller PDF","reading":"Læser filen…","ocrError":"Vi kunne ikke læse den fil. Prøv et tydeligere foto eller en PDF / et billede med læsbar tekst.","newText":"Ny tekst","progress":"{a} af {b} ord","doneAll":"Godt gået. Du har været igennem hvert ord.","hint":"Tryk på et hvilket som helst ord for at se dets betydninger. Ord, du har åbnet, bliver grønne.","loginTitle":"Log ind for at læse en tekst","loginBtn":"Log ind","upgradeTitle":"At læse en tekst er en betalt funktion","upgradeBtn":"Se abonnementer","loading":"Indlæser…","camera":"Tag foto med kamera","upload":"Upload billede eller PDF","captureScreen":"Del skærm","understandSentence":"Forstå denne sætning","editText":"Rediger tekst","editDone":"Færdig","unreadable":"Billedet er ikke skarpt nok til at blive læst.\nTag det tættere på, lige over siden og i godt lys.","unsureNote":"Nogle ord var ikke tydelige på billedet og er markeret med et spørgsmålstegn.\nTjek og ret dem, før du læser.","poorNote":"Billedet var ikke skarpt, så nogle ord kan være læst forkert.\nTjek og ret dem, før du læser.","desktopHint":"På en computer bliver et billede taget med en telefon skarpere","unsureWord":"Utydeligt ord"},
  "hu": {"title":"Értsd meg minden szót","sub":"Illessz be egy szöveget, fotózz le egy oldalt, tölts fel egy képet, vagy készíts képernyőképet.\nA szöveg a fehér mezőbe kerül, és bármelyik szóra koppintva megnézheted, mit jelent.","placeholder":"Illeszd be ide a szöveged…","load":"Szöveg megnyitása","photo":"Fénykép, kép vagy PDF","reading":"A fájl beolvasása…","ocrError":"Nem tudtuk beolvasni azt a fájlt. Próbálj egy élesebb fényképet, vagy egy olvasható szöveget tartalmazó PDF / kép fájlt.","newText":"Új szöveg","progress":"{a} / {b} szó","doneAll":"Szép munka. Minden szót átnéztél.","hint":"Koppints bármelyik szóra, hogy lásd a jelentéseit. A megnyitott szavak zöldre váltanak.","loginTitle":"Jelentkezz be a szöveg olvasásához","loginBtn":"Bejelentkezés","upgradeTitle":"A szöveg olvasása fizetős funkció","upgradeBtn":"Csomagok megtekintése","loading":"Betöltés…","camera":"Fotózás kamerával","upload":"Kép vagy PDF feltöltése","captureScreen":"Képernyő megosztása","understandSentence":"Értsd meg ezt a mondatot","editText":"Szöveg szerkesztése","editDone":"Kész","unreadable":"A fénykép nem elég éles ahhoz, hogy be lehessen olvasni.\nFotózd közelebbről, egyenesen az oldal fölül, jó fényben.","unsureNote":"Néhány szó nem volt tiszta a fényképen, ezeket kérdőjel jelöli.\nOlvasás előtt ellenőrizd és javítsd ki őket.","poorNote":"A fénykép nem volt éles, ezért néhány szót talán rosszul olvastunk be.\nOlvasás előtt ellenőrizd és javítsd ki őket.","desktopHint":"Számítógépen a telefonnal készült fénykép élesebb","unsureWord":"Nem olvasható szó"},
};

function copy(lang: Lang): ReaderStrings {
  return READER_COPY[lang] ?? READER_COPY.en;
}

function fmtProgress(tpl: string, a: number, b: number): string {
  return tpl.replace("{a}", String(a)).replace("{b}", String(b));
}

/** A short model reply that is a refusal ("I'm sorry, I can't transcribe…")
 *  rather than real transcribed text — usually a blank/black capture. */
function looksLikeRefusal(t: string): boolean {
  const s = t.trim().toLowerCase();
  if (s.length > 300) return false; // real transcriptions are longer than a refusal
  return (
    s.startsWith("i'm sorry") || s.startsWith("i am sorry") || s.startsWith("sorry") ||
    s.includes("can't transcribe") || s.includes("cannot transcribe") ||
    s.includes("unable to transcribe") || s.includes("no readable text") ||
    s.includes("can't help") || s.includes("cannot help")
  );
}

function marks(t: string): number {
  return t.split(UNSURE_MARK).length - 1;
}

/** Direction of a text from its own letters, for the edit box: Hebrew, Arabic
 *  or Persian read right to left, anything else left to right; an empty box
 *  follows the interface. */
function textDir(t: string, ui: "ltr" | "rtl"): "ltr" | "rtl" {
  const rtl = (t.match(/[֐-׿؀-ۿݐ-ݿ]/g) ?? []).length;
  const other = (t.match(/[A-Za-zÀ-ɏͰ-ϿЀ-ӿ]/g) ?? []).length;
  if (!rtl && !other) return ui;
  return rtl >= other ? "rtl" : "ltr";
}

/** The browser's ImageCapture (Chrome, Edge, Android): a real still from the
 *  camera, at the sensor's resolution and with autofocus, instead of a frame
 *  of the softer, smaller video stream. Absent on Safari and Firefox. */
type StillCapture = {
  takePhoto: (settings?: { imageWidth?: number; imageHeight?: number }) => Promise<Blob>;
  getPhotoCapabilities?: () => Promise<{ imageWidth?: { max?: number }; imageHeight?: { max?: number } }>;
};
function stillCaptureFor(track: MediaStreamTrack | undefined): StillCapture | null {
  if (!track || track.readyState !== "live" || typeof window === "undefined") return null;
  const IC = (window as unknown as { ImageCapture?: new (t: MediaStreamTrack) => StillCapture }).ImageCapture;
  if (!IC) return null;
  try { return new IC(track); } catch { return null; }
}

function hasStillCapture(): boolean {
  return typeof window !== "undefined" && "ImageCapture" in window;
}

/** iPhone / iPad (an iPad reports itself as a Mac with touch). */
function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /iP(hone|ad|od)/.test(ua) || (ua.includes("Macintosh") && (navigator.maxTouchPoints ?? 0) > 1);
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const to = setTimeout(() => reject(new Error("timeout")), ms);
    p.then((v) => { clearTimeout(to); resolve(v); }, (e) => { clearTimeout(to); reject(e); });
  });
}

const ghostBtn: CSSProperties = {
  background: "transparent",
  color: "var(--ink,#20272E)",
  border: "1px solid var(--hairline,#E5E7EB)",
  borderRadius: 12,
  padding: "12px 18px",
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
};

export function ReaderClient() {
  const { user, plan, planReady, loading: authLoading, promptLogin } = useAuth();
  const { lang, dir } = useLang();
  const href = useHref();
  const t = copy(lang);
  const oc = (k: OcrCopyKey): string => t[k] ?? READER_COPY.en[k] ?? "";
  // Opened from Homework ("Reading a text", Gadi 2026-10-12): the same
  // reader, with the Homework tab lit, a way back and a "done reading" button.
  // Grown-ups open /read on its own and see none of this.
  // Opened from a grown-up's Practice (Gadi 2026-10-22): the same frame,
  // with the Practice tab lit and the way back to Practice.
  const hwCopy = homeworkCopy(lang);
  const pr = practiceCopy(lang);
  const [from, setFrom] = useState<"homework" | "practice" | null>(null);
  useEffect(() => {
    try {
      const f = new URLSearchParams(window.location.search).get("from");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- read once from the address
      setFrom(f === "homework" || f === "practice" ? f : null);
    } catch { /* plain reader */ }
  }, []);
  const fromHw = from !== null;
  const fromPractice = from === "practice";
  const hc = fromPractice ? { ...hwCopy, read: pr.read, home: pr.home } : hwCopy;
  const homePath = fromPractice ? "/exercises" : "/homework";

  const [draft, setDraft] = useState("");
  // Restore the open passage from the session so a refresh, or opening a word's
  // full page (which we open in a new tab anyway), never loses it.
  const [text, setText] = useState<string>(() => {
    try { return typeof window !== "undefined" ? (sessionStorage.getItem("gadit-reader-text") ?? "") : ""; } catch { return ""; }
  });
  useEffect(() => {
    try {
      if (text) sessionStorage.setItem("gadit-reader-text", text);
      else sessionStorage.removeItem("gadit-reader-text");
    } catch { /* ignore */ }
  }, [text]);
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());
  // "unreadable": the photo was too blurry, so nothing was loaded (Gadi
  // 2026-10-26: a soft photo had made the reader invent words instead).
  const [ocrState, setOcrState] = useState<"idle" | "reading" | "error" | "unreadable">("idle");
  // The text as it was read from a photo or PDF (before niqqud), so "Edit
  // text" edits the letters that were read, and whether the photo was soft.
  // Null for a pasted text. Kept in the session next to the text.
  const [ocrMeta, setOcrMeta] = useState<{ raw: string; poor: boolean } | null>(() => {
    try {
      const v = typeof window !== "undefined" ? sessionStorage.getItem("gadit-reader-ocr") : null;
      const j = v ? (JSON.parse(v) as { raw?: unknown; poor?: unknown }) : null;
      return j && typeof j.raw === "string" ? { raw: j.raw, poor: j.poor === true } : null;
    } catch { return null; }
  });
  useEffect(() => {
    try {
      if (ocrMeta) sessionStorage.setItem("gadit-reader-ocr", JSON.stringify(ocrMeta));
      else sessionStorage.removeItem("gadit-reader-ocr");
    } catch { /* ignore */ }
  }, [ocrMeta]);
  // Correcting the text before reading (after a photo, or any time).
  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState("");
  const [editBusy, setEditBusy] = useState(false);
  const cameraRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  // In-page camera (Gadi 2026-09-19): on Android, opening the NATIVE camera via
  // <input capture> lets the OS kill the PWA process while the camera is
  // foregrounded — on return the app cold-reloads to the home page and the
  // photo is lost (confirmed on video). Capturing inside the page with
  // getUserMedia keeps everything in one process, so nothing reloads.
  const [camOpen, setCamOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // A computer's webcam gives a soft, small picture of a page: say so under
  // the camera (a phone photo is sharper). Shutter busy while a still is taken.
  const [camHint, setCamHint] = useState(false);
  const [shooting, setShooting] = useState(false);
  const camLabel = t.camera ?? READER_COPY.en.camera ?? "Photograph with camera";
  const uploadLabel = t.upload ?? READER_COPY.en.upload ?? "Upload image or PDF";
  const screenLabel = t.captureScreen ?? READER_COPY.en.captureScreen ?? "Capture screen";

  const total = useMemo(() => (text ? distinctWordCount(text) : 0), [text]);
  const storageKey = useMemo(() => (text ? `gadit-reader-${hashText(text)}` : ""), [text]);

  // The harder words to highlight for attention (Gadi 2026-09-19). Filled in the
  // background when a text opens; empty until then so the text shows instantly.
  const [hardKeys, setHardKeys] = useState<Set<string>>(new Set());

  // Load persisted progress when a text is opened.
  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      setReviewed(raw ? new Set(JSON.parse(raw) as string[]) : new Set());
    } catch { setReviewed(new Set()); }
  }, [storageKey]);

  // Fetch the harder words to highlight, in the background, once per text. Uses
  // the same /api/passage-words analysis (cached), so it also warms the "key
  // words" panel. Best-effort: on any failure the text just isn't highlighted.
  useEffect(() => {
    setHardKeys(new Set());
    if (!text || !user) return;
    let cancelled = false;
    (async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch("/api/passage-words", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
          body: JSON.stringify({ text, lang }),
        });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { hard?: string[] };
        if (!cancelled && Array.isArray(data.hard)) {
          setHardKeys(new Set(data.hard.map((w) => wordKey(w)).filter(Boolean)));
        }
      } catch { /* best-effort */ }
    })();
    return () => { cancelled = true; };
  }, [text, user, lang]);

  // The reading check ("done reading, let's check", Gadi 2026-10-20): the
  // words the child tapped plus a few hard ones they did not, then questions
  // on the content. Null while reading.
  const [check, setCheck] = useState<{ tapped: string[]; hard: string[]; n: number } | null>(null);
  const rc = readingCheckCopy(lang);

  function startCheck() {
    // Each distinct word once, as it first appears in the text.
    const forms = new Map<string, string>();
    for (const tk of tokenizeWords(text)) {
      if (tk.type !== "word") continue;
      const k = wordKey(tk.value);
      if (!forms.has(k)) forms.set(k, tk.value);
    }
    const order = [...forms.keys()];
    const tappedKeys = order.filter((k) => reviewed.has(k));
    // More than 8 tapped: the hard ones first, then in reading order.
    const tapped = [...tappedKeys.filter((k) => hardKeys.has(k)), ...tappedKeys.filter((k) => !hardKeys.has(k))].slice(0, 8);
    const hard = order.filter((k) => hardKeys.has(k) && !reviewed.has(k)).slice(0, 3);
    setCheck({ tapped: tapped.map((k) => forms.get(k)!), hard: hard.map((k) => forms.get(k)!), n: Date.now() });
    try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch { /* ignore */ }
  }

  function endCheck() {
    setCheck(null);
    try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch { /* ignore */ }
  }

  function markReviewed(word: string) {
    const key = wordKey(word);
    setReviewed((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      if (storageKey) {
        try { localStorage.setItem(storageKey, JSON.stringify([...next])); } catch { /* ignore */ }
      }
      return next;
    });
  }

  function openText() {
    const v = draft.trim();
    if (!v) return;
    setOcrMeta(null);
    setText(v);
  }

  function resetText() {
    setCheck(null);
    setText("");
    setDraft("");
    setReviewed(new Set());
    setOcrState("idle");
    setOcrMeta(null);
    setEditing(false);
  }

  // Hebrew: OCR routinely drops niqqud, but a young reader needs it. Run the
  // text through Dicta (via /api/niqqud) to restore accurate, readable vowel
  // points. Best-effort: on failure keep the un-niqqud'd text. The marks of
  // unread words must come back untouched, or the plain text is kept.
  async function withNiqqud(plain: string, idToken: string): Promise<string> {
    if (!/[֐-׿]/.test(plain)) return plain;
    try {
      const nres = await fetch("/api/niqqud", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ texts: [plain] }),
      });
      if (nres.ok) {
        const nj = (await nres.json()) as { niqqud?: string[] };
        const out = Array.isArray(nj.niqqud) ? nj.niqqud[0] : "";
        if (out && marks(out) === marks(plain)) return out;
      }
    } catch { /* keep the plain text */ }
    return plain;
  }

  // Shared OCR pipeline for every input path (file, camera, pasted screenshot,
  // screen capture): downscale/recompress the image, send it to /api/ocr, and
  // load the extracted text.
  async function runOcr(input: Blob) {
    if (!user) return;
    setOcrState("reading");
    try {
      const prepared = await prepareForUpload(input);
      const idToken = await user.getIdToken();
      const fd = new FormData();
      fd.append("image", prepared, "upload");
      const res = await fetch("/api/ocr", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
        body: fd,
      });
      const j = (await res.json().catch(() => ({}))) as { text?: string; legible?: string; unsure?: number };
      if (!res.ok) { setOcrState("error"); return; }
      const plain = (j.text ?? "").trim();
      // Too blurry to read, nothing on the page, or a refusal ("I'm sorry, I
      // can't transcribe…", a blank/black capture): no passage is loaded, the
      // reader is told how to take a sharper photo instead.
      if (j.legible === "unreadable" || !plain || looksLikeRefusal(plain)) {
        setOcrState("unreadable");
        return;
      }
      // A soft photo: the text loads with a notice to check it, and every
      // word that could not be read shows as a marked "?" (never a guess).
      const poor = j.legible === "poor" || (j.unsure ?? 0) > 0 || marks(plain) > 0;
      const out = await withNiqqud(plain, idToken);
      setOcrMeta({ raw: plain, poor });
      setEditing(false);
      setDraft(out);
      setText(out);
      setOcrState("idle");
    } catch {
      setOcrState("error");
    }
  }

  // "Edit text": the text as it was read (before niqqud) in an editable box.
  function startEdit() {
    setCheck(null);
    setEditDraft(ocrMeta?.raw ?? text);
    setEditing(true);
  }

  // "Done": the corrected text goes through the same steps as a fresh read
  // (niqqud for Hebrew read from a photo; the key words, the harder words and
  // the progress follow the new text on their own).
  async function finishEdit() {
    const plain = editDraft.trim();
    if (!plain || !user || editBusy) return;
    if (plain === (ocrMeta?.raw ?? text).trim()) {
      // Checked, nothing changed: the "photo was soft" notice has done its job.
      setOcrMeta((m) => (m ? { ...m, poor: false } : m));
      setEditing(false);
      return;
    }
    setEditBusy(true);
    try {
      let out = plain;
      if (ocrMeta) {
        out = await withNiqqud(plain, await user.getIdToken());
        setOcrMeta({ raw: plain, poor: false });
      }
      setDraft(out);
      setText(out);
      setEditing(false);
    } catch {
      setDraft(plain);
      setText(plain);
      setEditing(false);
    } finally {
      setEditBusy(false);
    }
  }

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) await runOcr(file);
  }

  // Paste a screenshot (from Windows Snip / Chrome or Google screenshot / any
  // snipping tool) straight into the box: if the clipboard holds an image we
  // OCR it; otherwise the normal text paste happens.
  async function onPasteBox(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it.type.startsWith("image/")) {
        const blob = it.getAsFile();
        if (blob) { e.preventDefault(); await runOcr(blob); return; }
      }
    }
  }

  // Capture the screen (a window or a browser tab, e.g. the page you're reading
  // on another site) and turn what's on it into text. Desktop only.
  async function onCaptureScreen() {
    const md = navigator.mediaDevices as MediaDevices & {
      getDisplayMedia?: (c?: DisplayMediaStreamOptions) => Promise<MediaStream>;
    };
    if (!md?.getDisplayMedia) return;
    setOcrState("reading");
    let stream: MediaStream | null = null;
    try {
      stream = await md.getDisplayMedia({ video: { width: { ideal: 3000 } } } as DisplayMediaStreamOptions);
      const video = document.createElement("video");
      video.muted = true;
      video.srcObject = stream;
      await video.play().catch(() => {});
      // Wait for real dimensions (metadata), then for an actually-painted frame,
      // so we never grab a black/blank frame that the model would refuse to read.
      if (!video.videoWidth) {
        await new Promise<void>((res) => {
          const to = setTimeout(res, 2000);
          video.onloadedmetadata = () => { clearTimeout(to); res(); };
        });
      }
      await new Promise<void>((res) => {
        const v = video as HTMLVideoElement & { requestVideoFrameCallback?: (cb: () => void) => number };
        if (typeof v.requestVideoFrameCallback === "function") v.requestVideoFrameCallback(() => res());
        else setTimeout(res, 500);
      });
      const w = video.videoWidth, h = video.videoHeight;
      if (!w || !h) { setOcrState("error"); return; }
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) { setOcrState("error"); return; }
      ctx.drawImage(video, 0, 0, w, h);
      stream.getTracks().forEach((tk) => tk.stop());
      stream = null;
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.92));
      if (blob) await runOcr(blob); else setOcrState("error");
    } catch (err) {
      // User dismissed the "choose what to share" picker → not an error, just reset.
      if (err && typeof err === "object" && (err as { name?: string }).name === "NotAllowedError") setOcrState("idle");
      else setOcrState("error");
    } finally {
      stream?.getTracks().forEach((tk) => tk.stop());
    }
  }

  // Open the in-page camera. Falls back to the native file-input camera if
  // getUserMedia isn't available or the user blocks it, so capture still works.
  async function openCamera() {
    const md = typeof navigator !== "undefined" ? navigator.mediaDevices : undefined;
    // A computer with a camera (a laptop's webcam) opens it too (Gadi
    // 2026-10-21: "Photograph a page" on a laptop opened the file picker).
    // Only a computer with no camera at all gets the file picker.
    if (!md?.getUserMedia) { cameraRef.current?.click(); return; }
    const isTouch = typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches;
    // iPhone / iPad: the in-page camera there can only grab a frame of the
    // video (no ImageCapture in Safari), which is softer than a real photo.
    // The phone's own camera returns a full, focused still and iOS keeps the
    // page alive meanwhile (the reload problem above is Android's), so it is
    // used instead. Android keeps the in-page camera, now with real stills.
    if (isTouch && isIOS() && !hasStillCapture()) { cameraRef.current?.click(); return; }
    if (!isTouch) {
      try {
        const devices = await md.enumerateDevices();
        if (!devices.some((d) => d.kind === "videoinput")) { cameraRef.current?.click(); return; }
      } catch { cameraRef.current?.click(); return; }
    }
    try {
      const stream = await md.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 2600 }, height: { ideal: 2600 } },
        audio: false,
      });
      streamRef.current = stream;
      // A computer's camera (not facing the page, or a small picture) reads a
      // page poorly: the hint under it suggests the phone instead.
      const st = stream.getVideoTracks()[0]?.getSettings?.() ?? {};
      const longest = Math.max(st.width ?? 0, st.height ?? 0);
      setCamHint(!isTouch && (st.facingMode !== "environment" || longest < 1600));
      setCamOpen(true);
    } catch (err) {
      // Permission denied → nothing we can do in-page; fall back to the OS camera.
      if (err && typeof err === "object" && (err as { name?: string }).name === "NotAllowedError") {
        cameraRef.current?.click();
      } else {
        cameraRef.current?.click();
      }
    }
  }

  // Attach the live stream to the <video> once the modal is mounted.
  useEffect(() => {
    if (!camOpen) return;
    const v = videoRef.current;
    const s = streamRef.current;
    if (v && s) {
      v.srcObject = s;
      v.play().catch(() => { /* autoplay gesture already satisfied by the tap */ });
    }
  }, [camOpen]);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((tk) => tk.stop());
    streamRef.current = null;
    setCamOpen(false);
    setShooting(false);
  }

  // Shutter, all in-page. Where the browser can (ImageCapture: Chrome, Edge,
  // Android) a real still is taken from the camera, at full resolution and
  // focused; a frame of the live video is softer and smaller, and a soft
  // photo is what made words come back wrong (Gadi 2026-10-26). Anywhere
  // else, or if the still fails, the current video frame is used as before.
  async function shootPhoto() {
    const v = videoRef.current;
    if (!v || !v.videoWidth || shooting) return;
    setShooting(true);
    let blob: Blob | null = null;
    const still = stillCaptureFor(streamRef.current?.getVideoTracks()[0]);
    if (still) {
      try {
        let size: { imageWidth?: number; imageHeight?: number } | undefined;
        try {
          const caps = await withTimeout(still.getPhotoCapabilities?.() ?? Promise.resolve(undefined), 3000);
          if (caps?.imageWidth?.max && caps?.imageHeight?.max) size = { imageWidth: caps.imageWidth.max, imageHeight: caps.imageHeight.max };
        } catch { /* the camera's default still size */ }
        blob = await withTimeout(still.takePhoto(size).catch(() => still.takePhoto()), 8000);
        if (!blob || blob.size < 2000) blob = null;
      } catch { blob = null; }
    }
    if (!blob && v.videoWidth) {
      const w = v.videoWidth, h = v.videoHeight;
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(v, 0, 0, w, h);
        blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.92));
      }
    }
    stopCamera();
    if (blob) await runOcr(blob); else setOcrState("error");
  }

  // Release the camera if the component unmounts mid-capture.
  useEffect(() => () => { streamRef.current?.getTracks().forEach((tk) => tk.stop()); }, []);

  const canCaptureScreen = typeof navigator !== "undefined" && !!(navigator.mediaDevices as { getDisplayMedia?: unknown } | undefined)?.getDisplayMedia;

  const allDone = total > 0 && reviewed.size >= total;
  const unsureLeft = useMemo(() => marks(text), [text]);

  return (
    // The shared tool frame (Gadi 2026-10-11): same bar, same centred title.
    <ToolPage active={fromPractice ? "practice" : fromHw ? "spell" : "read"} width={760} title={fromHw ? hc.read : t.title} titleExtra={<GuideButton guide="reader" size={24} />} sub={t.sub}>
      <div style={{ fontFamily: fontBody(lang) }}>
        {fromHw && (
          <Link href={href(homePath)} className="wb-hw-back">
            {dir === "rtl" ? "→" : "←"} {hc.home}
          </Link>
        )}
        {authLoading || (user && !planReady) ? (
          <div style={{ color: "var(--ink-muted,#6B7280)" }}><WaitText text={t.loading} live /></div>
        ) : !user ? (
          <Gate title={t.loginTitle} btn={t.loginBtn} onClick={() => promptLogin?.()} />
        ) : plan === "basic" ? (
          <Gate title={t.upgradeTitle} btn={t.upgradeBtn} href={href("/pricing")} buy lang={lang} />
        ) : !text ? (
          // Input state: paste or photograph.
          <div>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onPaste={onPasteBox}
              placeholder={t.placeholder}
              dir={dir}
              rows={8}
              style={{ width: "100%", boxSizing: "border-box", padding: "14px 16px", borderRadius: 14, border: "1px solid var(--hairline,#E5E7EB)", fontSize: 16, lineHeight: 1.6, fontFamily: "inherit", background: "var(--card,#fff)", color: "var(--ink,#20272E)", resize: "vertical", outline: "none" }}
            />
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 14, alignItems: "center", justifyContent: "space-between" }}>
              {/* Two distinct upload actions so it's obvious which is which. */}
              {ocrState === "reading" ? (
                <div style={{ ...ghostBtn, opacity: 0.7, cursor: "default" }}><WaitText text={t.reading} live /></div>
              ) : (
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <button type="button" onClick={openCamera} style={ghostBtn}>
                    <GaditIcon name="photo" size={28} className="wb-read-btn-ico" /> {camLabel}
                  </button>
                  <button type="button" onClick={() => uploadRef.current?.click()} style={ghostBtn}>
                    <GaditIcon name="upload" size={28} className="wb-read-btn-ico" /> {uploadLabel}
                  </button>
                  {canCaptureScreen && (
                    <button type="button" onClick={onCaptureScreen} style={ghostBtn}>
                      <GaditIcon name="screen" size={28} className="wb-read-btn-ico" /> {screenLabel}
                    </button>
                  )}
                </div>
              )}
              {/* Primary action, sits at the end (left in RTL). */}
              <button
                type="button"
                onClick={openText}
                disabled={!draft.trim()}
                style={{ background: "var(--teal,#0EA5A5)", color: "#fff", border: "none", borderRadius: 12, padding: "12px 22px", fontSize: 15, fontWeight: 700, cursor: draft.trim() ? "pointer" : "default", opacity: draft.trim() ? 1 : 0.5, fontFamily: "inherit" }}
              >
                {t.load}
              </button>
              {/* Camera: hints mobile to open the camera. Upload: images + PDF. */}
              <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={onPhoto} style={{ display: "none" }} />
              <input ref={uploadRef} type="file" accept="image/*,application/pdf" onChange={onPhoto} style={{ display: "none" }} />

              {/* In-page camera modal — keeps capture in one process so Android
                  never kills the PWA on return (Gadi 2026-09-19). */}
              {camOpen && (
                <div
                  role="dialog"
                  aria-modal="true"
                  style={{ position: "fixed", inset: 0, zIndex: 3000, background: "#000", display: "flex", flexDirection: "column" }}
                >
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    style={{ flex: 1, width: "100%", height: "100%", minHeight: 0, objectFit: "contain", background: "#000" }}
                  />
                  {camHint && (
                    <p style={{ margin: 0, padding: "12px 22px 0", background: "#000", color: "rgba(255,255,255,0.85)", fontSize: 14, lineHeight: 1.4, textAlign: "center" }}>
                      {oc("desktopHint")}
                    </p>
                  )}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "18px 22px calc(18px + env(safe-area-inset-bottom))", background: "#000" }}>
                    <button
                      type="button"
                      onClick={stopCamera}
                      style={{ background: "none", border: "none", color: "#fff", fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", padding: 8 }}
                    >
                      {misc("cancel", lang)}
                    </button>
                    <button
                      type="button"
                      onClick={shootPhoto}
                      disabled={shooting}
                      aria-label={misc("capture", lang)}
                      style={{ width: 72, height: 72, borderRadius: "50%", background: "#fff", border: "5px solid rgba(255,255,255,0.45)", cursor: shooting ? "default" : "pointer", opacity: shooting ? 0.5 : 1, boxShadow: "0 0 0 2px #000 inset" }}
                    />
                    <span style={{ width: 60 }} aria-hidden="true" />
                  </div>
                </div>
              )}
            </div>
            {ocrState === "error" && (
              <p style={{ marginTop: 12, color: "#B91C1C", fontSize: 14 }}>{t.ocrError}</p>
            )}
            {/* Too blurry: nothing was loaded; how to take a sharper photo. */}
            {ocrState === "unreadable" && (
              <p role="alert" style={{ marginTop: 12, color: "#B91C1C", fontSize: 14.5, lineHeight: 1.55, whiteSpace: "pre-line" }}>{oc("unreadable")}</p>
            )}
          </div>
        ) : check ? (
          // The reading check, in place of the text.
          <ReadingCheck
            key={check.n}
            text={text}
            lang={lang}
            dir={dir}
            tapped={check.tapped}
            hard={check.hard}
            fromHw={fromHw}
            homeHref={href(homePath)}
            homeLabel={hc.home}
            onReadAgain={endCheck}
          />
        ) : editing ? (
          // Correcting the text that was read, before reading it.
          <div>
            <textarea
              value={editDraft}
              onChange={(e) => setEditDraft(e.target.value)}
              dir={textDir(editDraft, dir)}
              rows={12}
              autoFocus
              aria-label={oc("editText")}
              style={{ width: "100%", boxSizing: "border-box", padding: "14px 16px", borderRadius: 14, border: "1px solid var(--hairline,#E5E7EB)", fontSize: 17, lineHeight: 1.7, fontFamily: "inherit", background: "var(--card,#fff)", color: "var(--ink,#20272E)", resize: "vertical", outline: "none", textAlign: "start" }}
            />
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 14, alignItems: "center", justifyContent: "flex-end" }}>
              {editBusy ? (
                <div style={{ ...ghostBtn, opacity: 0.7, cursor: "default" }}><WaitText text={t.loading} live /></div>
              ) : (
                <>
                  <button type="button" onClick={() => setEditing(false)} style={ghostBtn}>
                    {misc("cancel", lang)}
                  </button>
                  <button
                    type="button"
                    onClick={() => void finishEdit()}
                    disabled={!editDraft.trim()}
                    style={{ background: "var(--teal,#0EA5A5)", color: "#fff", border: "none", borderRadius: 12, padding: "12px 22px", fontSize: 15, fontWeight: 700, cursor: editDraft.trim() ? "pointer" : "default", opacity: editDraft.trim() ? 1 : 0.5, fontFamily: "inherit" }}
                  >
                    {oc("editDone")}
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          // Reading state.
          <div>
            {/* Sticky progress bar */}
            <div style={{ position: "sticky", top: 8, zIndex: 20, background: "var(--paper,#F9FAFB)", paddingBottom: 12, marginBottom: 16, borderBottom: "1px solid var(--hairline,#E5E7EB)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: allDone ? "#16A34A" : "var(--ink,#20272E)" }}>
                  {allDone ? t.doneAll : fmtProgress(t.progress, reviewed.size, total)}
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                  <button type="button" onClick={startEdit} style={{ background: "none", border: "none", color: "var(--teal-deep,#0E7490)", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", textDecoration: "underline", padding: 0 }}>
                    {oc("editText")}
                  </button>
                  <button type="button" onClick={resetText} style={{ background: "none", border: "none", color: "var(--teal-deep,#0E7490)", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", textDecoration: "underline", padding: 0 }}>
                    {t.newText}
                  </button>
                </span>
              </div>
              <div style={{ height: 8, borderRadius: 999, background: "var(--hairline,#E5E7EB)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${total ? Math.round((reviewed.size / total) * 100) : 0}%`, background: allDone ? "#16A34A" : "var(--teal,#0EA5A5)", borderRadius: 999, transition: "width 0.25s" }} />
              </div>
            </div>
            {/* Words-first: the on-brand fast help for a parent who won't tap
                word by word. The key words to learn (primary) + a short gist. */}
            {/* A soft photo (Gadi 2026-10-26): words that could not be read show
                as a marked "?", and the reader is asked to check and fix the
                text before reading. Gone once the text is checked and fixed. */}
            {(unsureLeft > 0 || ocrMeta?.poor) && (
              <div role="status" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap", background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: 14, padding: "12px 16px", marginBottom: 16, color: "#78350F" }}>
                <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.55, whiteSpace: "pre-line", flex: "1 1 260px" }}>
                  {unsureLeft > 0 ? oc("unsureNote") : oc("poorNote")}
                </p>
                <button type="button" onClick={startEdit} style={{ background: "var(--card,#fff)", color: "#78350F", border: "1.5px solid #F59E0B", borderRadius: 12, padding: "8px 16px", fontSize: 14.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flex: "0 0 auto" }}>
                  {oc("editText")}
                </button>
              </div>
            )}
            <PassageKeyWords text={text} lang={lang} />
            {/* The reading area is now a clearly-bounded sheet, so it's obvious
                where the text lives on the page (Gadi 2026-09-09). */}
            <div
              style={{
                background: "var(--card,#fff)",
                border: "1px solid var(--hairline,#E5E7EB)",
                borderRadius: 18,
                padding: "22px 22px 26px",
                boxShadow: "0 1px 2px rgba(16,24,40,0.04), 0 10px 30px rgba(16,24,40,0.04)",
              }}
            >
              <p style={{ margin: "0 0 14px", fontSize: 13.5, color: "var(--ink-muted,#9CA3AF)" }}>{t.hint}</p>
              {/* The text's own direction (English inside the Hebrew UI read
                  right-to-left, so a full stop jumped to the line start). */}
              <div dir="auto" style={{ textAlign: "start" }}>
                <ReaderText text={text} reviewed={reviewed} onReview={markReviewed} hardKeys={hardKeys} understandLabel={t.understandSentence ?? READER_COPY.en.understandSentence} unsureLabel={oc("unsureWord")} />
              </div>
            </div>
            {/* Done reading: check the words and the content (everyone, not
                only from Homework). The way back to Homework comes after it. */}
            {/* Two ways out (Gadi 2026-10-21): the check is offered, never
                forced. "Done reading" ends without it (back to Homework, the
                parent still hears about the reading, or a new text). */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
              <button
                type="button"
                onClick={startCheck}
                style={{ background: "var(--teal,#0EA5A5)", color: "#fff", border: "none", borderRadius: 14, padding: "14px 26px", fontSize: 16.5, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", maxWidth: "100%" }}
              >
                {rc.start}
              </button>
              {fromHw ? (
                <Link href={href(homePath)}
                  onClick={() => void notifyActivity(user, { kind: "read", label: text.trim().split(/\s+/).slice(0, 6).join(" ") })}
                  style={{ background: "var(--card,#fff)", color: "var(--teal-deep,#0E7490)", border: "1.5px solid var(--teal,#0EA5A5)", borderRadius: 14, padding: "12px 22px", fontSize: 15.5, fontWeight: 700, textDecoration: "none", fontFamily: "inherit", maxWidth: "100%" }}>
                  {hc.doneRead}
                </Link>
              ) : (
                <button type="button" onClick={resetText}
                  style={{ background: "var(--card,#fff)", color: "var(--teal-deep,#0E7490)", border: "1.5px solid var(--teal,#0EA5A5)", borderRadius: 14, padding: "12px 22px", fontSize: 15.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", maxWidth: "100%" }}>
                  {hc.doneRead}
                </button>
              )}
            </div>
            {/* "Found a mistake?" here too (Gadi 2026-10-17): the key words, the
                gist and any open explanation go with the report. */}
            <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
              <ReportQuestionButton where="read" snapshot={() => ({ text: (document.querySelector("main")?.innerText || "").slice(0, 3000) })} />
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  );
}

// buy: an upgrade gate. Inside the Play / iOS app it shows only a neutral line
// with no button (store rules; .gd-buy / .gd-play-only, lib/play-copy.ts).
function Gate({ title, btn, onClick, href, buy, lang }: { title: string; btn: string; onClick?: () => void; href?: string; buy?: boolean; lang?: string }) {
  const inner = (
    <span style={{ display: "inline-block", background: "var(--teal,#0EA5A5)", color: "#fff", borderRadius: 12, padding: "11px 22px", fontSize: 15, fontWeight: 700, cursor: "pointer", textDecoration: "none" }}>
      {btn}
    </span>
  );
  return (
    <div style={{ background: "var(--card,#fff)", border: "1px solid var(--hairline,#E5E7EB)", borderRadius: 16, padding: 26 }}>
      <p className={buy ? "gd-buy" : undefined} style={{ margin: "0 0 16px", fontSize: 16, color: "var(--ink,#20272E)" }}>{title}</p>
      {buy && <p className="gd-play-only" style={{ margin: 0, fontSize: 16, color: "var(--ink,#20272E)" }}>{playNotActive(lang ?? "en")}</p>}
      {buy && <AppIntentPing feature="reader" />}
      {href ? <Link href={href} className={buy ? "gd-buy" : undefined}>{inner}</Link> : <span onClick={onClick}>{inner}</span>}
    </div>
  );
}
