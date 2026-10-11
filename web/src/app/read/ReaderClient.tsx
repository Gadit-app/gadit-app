"use client";

import { ToolPage } from "@/components/design/ToolPage";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { ReaderText } from "@/components/design/ReaderText";
import { PassageKeyWords } from "@/components/design/PassageKeyWords";
import { GuideButton } from "@/components/GuideButton";
import { distinctWordCount, wordKey } from "@/lib/tokenize-words";
import { type Lang } from "@/lib/i18n";
import { misc } from "@/lib/misc-i18n";

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
};

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
    captureScreen: "Capture screen",
  },
  he: {
    title: "להבין כל מילה",
    sub: "הדביקו טקסט, צלמו עמוד, העלו תמונה או צלמו את המסך שלכם.\nהטקסט ייכנס לאזור הלבן, וכל מילה בו תהיה לחיצה עם ההגדרה שלה.",
    placeholder: "להדביק כאן טקסט או צילום מסך…",
    load: "לפתוח את הטקסט",
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
    camera: "לצלם עמוד",
    upload: "להעלות תמונה או PDF",
    captureScreen: "צילום מסך",
  },
  "ar": {"title":"افهم كل كلمة","sub":"الصق نصًا، أو صوّر صفحة، أو ارفع صورة، أو التقط شاشتك.\nيظهر النص في المربع الأبيض، ويمكنك النقر على أي كلمة لمعرفة معناها.","placeholder":"الصق نصك هنا…","load":"افتح النص","photo":"صورة أو ملف PDF","reading":"جارٍ قراءة الملف…","ocrError":"تعذّرت علينا قراءة هذا الملف. جرّب صورة أوضح، أو ملف PDF أو صورة بنص مقروء.","newText":"نص جديد","progress":"{a} من {b} كلمة","doneAll":"عمل رائع. لقد مررت على كل كلمة.","hint":"انقر على أي كلمة لرؤية معانيها. الكلمات التي فتحتها تتحول إلى الأخضر.","loginTitle":"سجّل الدخول لقراءة نص","loginBtn":"تسجيل الدخول","upgradeTitle":"قراءة نص ميزة مدفوعة","upgradeBtn":"اطّلع على الخطط","loading":"جارٍ التحميل…","camera":"التقاط بالكاميرا","upload":"رفع صورة أو PDF"},
  "ru": {"title":"Понять каждое слово","sub":"Вставьте текст, сфотографируйте страницу, загрузите изображение или сделайте снимок экрана.\nТекст появится в белом поле, и вы сможете нажать на любое слово, чтобы узнать его значение.","placeholder":"Вставьте свой текст сюда…","load":"Открыть текст","photo":"Фото, изображение или PDF","reading":"Читаем файл…","ocrError":"Не удалось прочитать этот файл. Попробуйте более четкое фото или PDF либо изображение с читаемым текстом.","newText":"Новый текст","progress":"{a} из {b} слов","doneAll":"Отличная работа. Вы прошли по всем словам.","hint":"Нажмите на любое слово, чтобы увидеть его значения. Открытые слова становятся зелеными.","loginTitle":"Войдите, чтобы читать текст","loginBtn":"Войти","upgradeTitle":"Чтение текста, это платная функция","upgradeBtn":"Посмотреть тарифы","loading":"Загрузка…","camera":"Сфотографировать камерой","upload":"Загрузить изображение или PDF"},
  "es": {"title":"Entiende cada palabra","sub":"Pega un texto, fotografía una página, sube una imagen o captura tu pantalla.\nEl texto aparece en el recuadro blanco y puedes tocar cualquier palabra para ver qué significa.","placeholder":"Pega tu texto aquí…","load":"Abrir texto","photo":"Foto, imagen o PDF","reading":"Leyendo el archivo…","ocrError":"No pudimos leer ese archivo. Prueba con una foto más nítida, o con un PDF o imagen con texto legible.","newText":"Texto nuevo","progress":"{a} de {b} palabras","doneAll":"Buen trabajo. Revisaste todas las palabras.","hint":"Toca cualquier palabra para ver sus significados. Las palabras que abriste se ponen verdes.","loginTitle":"Inicia sesión para leer un texto","loginBtn":"Iniciar sesión","upgradeTitle":"Leer un texto es una función de pago","upgradeBtn":"Ver planes","loading":"Cargando…","camera":"Fotografiar con la cámara","upload":"Subir imagen o PDF"},
  "pt": {"title":"Entenda cada palavra","sub":"Cole um texto, fotografe uma página, envie uma imagem ou capture sua tela.\nO texto vai para a caixa branca, e você pode tocar em qualquer palavra para ver o que ela significa.","placeholder":"Cole seu texto aqui…","load":"Abrir texto","photo":"Foto, imagem ou PDF","reading":"Lendo o arquivo…","ocrError":"Não conseguimos ler esse arquivo. Tente uma foto mais nítida, ou um PDF ou imagem com texto legível.","newText":"Novo texto","progress":"{a} de {b} palavras","doneAll":"Bom trabalho. Você passou por todas as palavras.","hint":"Toque em qualquer palavra para ver seus significados. As palavras que você abriu ficam verdes.","loginTitle":"Faça login para ler um texto","loginBtn":"Entrar","upgradeTitle":"Ler um texto é um recurso pago","upgradeBtn":"Ver planos","loading":"Carregando…","camera":"Fotografar com a câmera","upload":"Enviar imagem ou PDF"},
  "fr": {"title":"Comprendre chaque mot","sub":"Collez un texte, photographiez une page, importez une image ou capturez votre écran.\nLe texte s'affiche dans le cadre blanc, et vous pouvez toucher n'importe quel mot pour voir ce qu'il signifie.","placeholder":"Collez votre texte ici…","load":"Ouvrir le texte","photo":"Photo, image ou PDF","reading":"Lecture du fichier…","ocrError":"Nous n'avons pas pu lire ce fichier. Essayez une photo plus nette, ou un PDF ou une image avec un texte lisible.","newText":"Nouveau texte","progress":"{a} sur {b} mots","doneAll":"Beau travail. Vous avez parcouru tous les mots.","hint":"Touchez n'importe quel mot pour voir ses sens. Les mots que vous avez ouverts deviennent verts.","loginTitle":"Connectez-vous pour lire un texte","loginBtn":"Se connecter","upgradeTitle":"Lire un texte est une fonction payante","upgradeBtn":"Voir les offres","loading":"Chargement…","camera":"Photographier avec l'appareil","upload":"Importer une image ou un PDF"},
  "de": {"title":"Jedes Wort verstehen","sub":"Füge einen Text ein, fotografiere eine Seite, lade ein Bild hoch oder mach einen Screenshot.\nDer Text landet im weißen Feld, und du kannst auf jedes Wort tippen, um zu sehen, was es bedeutet.","placeholder":"Füge deinen Text hier ein…","load":"Text öffnen","photo":"Foto, Bild oder PDF","reading":"Datei wird gelesen…","ocrError":"Wir konnten diese Datei nicht lesen. Versuche ein schärferes Foto oder ein PDF oder Bild mit lesbarem Text.","newText":"Neuer Text","progress":"{a} von {b} Wörtern","doneAll":"Gut gemacht. Du bist jedes Wort durchgegangen.","hint":"Tippe auf ein beliebiges Wort, um seine Bedeutungen zu sehen. Geöffnete Wörter werden grün.","loginTitle":"Melde dich an, um einen Text zu lesen","loginBtn":"Anmelden","upgradeTitle":"Einen Text zu lesen ist eine kostenpflichtige Funktion","upgradeBtn":"Tarife ansehen","loading":"Wird geladen…","camera":"Mit Kamera fotografieren","upload":"Bild oder PDF hochladen"},
  "cs": {"title":"Rozumět každému slovu","sub":"Vložte text, vyfoťte stránku, nahrajte obrázek nebo zachyťte obrazovku.\nText se objeví v bílém poli a můžete klepnout na jakékoli slovo a zjistit, co znamená.","placeholder":"Sem vložte svůj text…","load":"Otevřít text","photo":"Fotka, obrázek nebo PDF","reading":"Čteme soubor…","ocrError":"Tento soubor se nám nepodařilo přečíst. Zkuste ostřejší fotku nebo PDF či obrázek s čitelným textem.","newText":"Nový text","progress":"{a} z {b} slov","doneAll":"Dobrá práce. Prošli jste každé slovo.","hint":"Klepněte na jakékoli slovo a zobrazte jeho významy. Slova, která jste otevřeli, zezelenají.","loginTitle":"Přihlaste se a čtěte text","loginBtn":"Přihlásit se","upgradeTitle":"Čtení textu je placená funkce","upgradeBtn":"Zobrazit plány","loading":"Načítání…","camera":"Vyfotit fotoaparátem","upload":"Nahrát obrázek nebo PDF"},
  "sk": {"title":"Rozumieť každému slovu","sub":"Vložte text, odfoťte stránku, nahrajte obrázok alebo zachyťte obrazovku.\nText sa zobrazí v bielom poli a môžete ťuknúť na ktorékoľvek slovo, aby ste zistili, čo znamená.","placeholder":"Sem vložte svoj text…","load":"Otvoriť text","photo":"Fotka, obrázok alebo PDF","reading":"Čítame súbor…","ocrError":"Tento súbor sa nám nepodarilo prečítať. Skúste ostrejšiu fotku alebo PDF či obrázok s čitateľným textom.","newText":"Nový text","progress":"{a} z {b} slov","doneAll":"Dobrá práca. Prešli ste každé slovo.","hint":"Ťuknite na ktorékoľvek slovo a zobrazte jeho významy. Slová, ktoré ste otvorili, zozelenejú.","loginTitle":"Prihláste sa a čítajte text","loginBtn":"Prihlásiť sa","upgradeTitle":"Čítanie textu je platená funkcia","upgradeBtn":"Zobraziť plány","loading":"Načítava sa…","camera":"Odfotiť fotoaparátom","upload":"Nahrať obrázok alebo PDF"},
  "it": {"title":"Capisci ogni parola","sub":"Incolla un testo, fotografa una pagina, carica un'immagine o cattura lo schermo.\nIl testo compare nel riquadro bianco e puoi toccare qualsiasi parola per scoprire cosa significa.","placeholder":"Incolla qui il tuo testo…","load":"Apri il testo","photo":"Foto, immagine o PDF","reading":"Lettura del file…","ocrError":"Non siamo riusciti a leggere questo file. Prova con una foto più nitida, oppure un PDF o un'immagine con testo leggibile.","newText":"Nuovo testo","progress":"{a} di {b} parole","doneAll":"Ottimo lavoro. Hai esaminato ogni parola.","hint":"Tocca una parola qualsiasi per vedere i suoi significati. Le parole che hai aperto diventano verdi.","loginTitle":"Accedi per leggere un testo","loginBtn":"Accedi","upgradeTitle":"Leggere un testo è una funzione a pagamento","upgradeBtn":"Vedi i piani","loading":"Caricamento…","camera":"Fotografa con la fotocamera","upload":"Carica immagine o PDF"},
  "ja": {"title":"すべての単語を理解する","sub":"テキストを貼り付けたり、ページを撮影したり、画像をアップロードしたり、画面をキャプチャしたりできます。\nテキストは白い枠に表示され、どの単語でもタップすると意味がわかります。","placeholder":"ここにテキストを貼り付けてください…","load":"テキストを開く","photo":"写真、画像、または PDF","reading":"ファイルを読み込んでいます…","ocrError":"このファイルを読み取れませんでした。より鮮明な写真、または読み取れるテキストの PDF か画像でお試しください。","newText":"新しいテキスト","progress":"{b} 語中 {a} 語","doneAll":"お疲れさまでした。すべての単語に目を通しました。","hint":"どの単語でもタップすると、その意味が表示されます。開いた単語は緑色になります。","loginTitle":"テキストを読むにはサインインしてください","loginBtn":"サインイン","upgradeTitle":"テキストを読む機能は有料です","upgradeBtn":"プランを見る","loading":"読み込み中…","camera":"カメラで撮影","upload":"画像またはPDFをアップロード"},
  "hi": {"title":"हर शब्द समझें","sub":"टेक्स्ट पेस्ट करें, किसी पेज की फ़ोटो लें, कोई इमेज अपलोड करें या अपनी स्क्रीन कैप्चर करें।\nटेक्स्ट सफ़ेद बॉक्स में आ जाता है, और किसी भी शब्द पर टैप करके उसका मतलब देखें।","placeholder":"अपना टेक्स्ट यहाँ पेस्ट करें…","load":"टेक्स्ट खोलें","photo":"फोटो, इमेज या PDF","reading":"फ़ाइल पढ़ी जा रही है…","ocrError":"हम वह फ़ाइल नहीं पढ़ पाए। कोई साफ़ फोटो आज़माएँ, या पढ़ने योग्य टेक्स्ट वाली PDF / इमेज।","newText":"नया टेक्स्ट","progress":"{b} में से {a} शब्द","doneAll":"बढ़िया काम। आपने हर शब्द देख लिया।","hint":"किसी भी शब्द पर टैप करके उसके अर्थ देखें। जो शब्द आपने खोले हैं वे हरे हो जाते हैं।","loginTitle":"टेक्स्ट पढ़ने के लिए साइन इन करें","loginBtn":"साइन इन करें","upgradeTitle":"टेक्स्ट पढ़ना एक पेड फ़ीचर है","upgradeBtn":"प्लान देखें","loading":"लोड हो रहा है…","camera":"कैमरे से फ़ोटो लें","upload":"छवि या PDF अपलोड करें"},
  "am": {"title":"እያንዳንዱን ቃል ይረዱ","sub":"ጽሑፍ ይለጥፉ፣ ገጽ ፎቶ ያንሱ፣ ምስል ይስቀሉ ወይም ማያ ገጽዎን ይቅረጹ።\nጽሑፉ ወደ ነጩ ሳጥን ይገባል፤ የማንኛውንም ቃል ትርጉም ለማየት ቃሉን ይንኩ።","placeholder":"ጽሑፍዎን እዚህ ይለጥፉ…","load":"ጽሑፍ ክፈት","photo":"ፎቶ፣ ምስል ወይም PDF","reading":"ፋይሉ እየተነበበ ነው…","ocrError":"ያንን ፋይል ማንበብ አልቻልንም። ግልጽ የሆነ ፎቶ ይሞክሩ፣ ወይም ሊነበብ የሚችል ጽሑፍ ያለው PDF / ምስል።","newText":"አዲስ ጽሑፍ","progress":"ከ{b} ውስጥ {a} ቃላት","doneAll":"ጥሩ ሥራ። እያንዳንዱን ቃል አልፈዋል።","hint":"ትርጉሞቹን ለማየት ማንኛውንም ቃል ይንኩ። የከፈቷቸው ቃላት አረንጓዴ ይሆናሉ።","loginTitle":"ጽሑፍ ለማንበብ ይግቡ","loginBtn":"ግባ","upgradeTitle":"ጽሑፍ ማንበብ የሚከፈልበት ባህሪ ነው","upgradeBtn":"እቅዶችን ይመልከቱ","loading":"በመጫን ላይ…","camera":"በካሜራ ፎቶ አንሳ","upload":"ምስል ወይም PDF ስቀል"},
  "uk": {"title":"Зрозуміти кожне слово","sub":"Вставте текст, сфотографуйте сторінку, завантажте зображення або зробіть знімок екрана.\nТекст з'явиться в білому полі, і ви зможете торкнутися будь-якого слова, щоб дізнатися його значення.","placeholder":"Вставте свій текст тут…","load":"Відкрити текст","photo":"Фото, зображення або PDF","reading":"Читання файлу…","ocrError":"Не вдалося прочитати цей файл. Спробуйте чіткіше фото або PDF / зображення з розбірливим текстом.","newText":"Новий текст","progress":"{a} з {b} слів","doneAll":"Гарна робота. Ви пройшли кожне слово.","hint":"Торкніться будь-якого слова, щоб побачити його значення. Слова, які ви відкрили, стають зеленими.","loginTitle":"Увійдіть, щоб читати текст","loginBtn":"Увійти","upgradeTitle":"Читання тексту, це платна функція","upgradeBtn":"Переглянути плани","loading":"Завантаження…","camera":"Сфотографувати камерою","upload":"Завантажити зображення або PDF"},
  "tr": {"title":"Her kelimeyi anla","sub":"Bir metin yapıştır, bir sayfanın fotoğrafını çek, bir görsel yükle ya da ekranını yakala.\nMetin beyaz kutuya gelir ve herhangi bir kelimeye dokunarak ne anlama geldiğini görebilirsin.","placeholder":"Metninizi buraya yapıştırın…","load":"Metni aç","photo":"Fotoğraf, görsel veya PDF","reading":"Dosya okunuyor…","ocrError":"Bu dosyayı okuyamadık. Daha net bir fotoğraf ya da okunabilir metin içeren bir PDF / görsel deneyin.","newText":"Yeni metin","progress":"{b} kelimeden {a} tanesi","doneAll":"Güzel iş. Her kelimeyi gözden geçirdiniz.","hint":"Anlamlarını görmek için herhangi bir kelimeye dokunun. Açtığınız kelimeler yeşile döner.","loginTitle":"Metin okumak için giriş yapın","loginBtn":"Giriş yap","upgradeTitle":"Metin okuma ücretli bir özelliktir","upgradeBtn":"Planları gör","loading":"Yükleniyor…","camera":"Kamerayla çek","upload":"Görsel veya PDF yükle"},
  "pl": {"title":"Zrozum każde słowo","sub":"Wklej tekst, sfotografuj stronę, prześlij obraz lub zrób zrzut ekranu.\nTekst trafi do białego pola i możesz dotknąć dowolnego słowa, żeby zobaczyć, co znaczy.","placeholder":"Wklej swój tekst tutaj…","load":"Otwórz tekst","photo":"Zdjęcie, obraz lub PDF","reading":"Odczytywanie pliku…","ocrError":"Nie udało się odczytać tego pliku. Spróbuj wyraźniejszego zdjęcia albo pliku PDF / obrazu z czytelnym tekstem.","newText":"Nowy tekst","progress":"{a} z {b} słów","doneAll":"Dobra robota. Przejrzałeś każde słowo.","hint":"Dotknij dowolnego słowa, aby zobaczyć jego znaczenia. Słowa, które otworzyłeś, zmieniają kolor na zielony.","loginTitle":"Zaloguj się, aby przeczytać tekst","loginBtn":"Zaloguj się","upgradeTitle":"Czytanie tekstu to funkcja płatna","upgradeBtn":"Zobacz plany","loading":"Ładowanie…","camera":"Zrób zdjęcie aparatem","upload":"Prześlij obraz lub PDF"},
  "fa": {"title":"هر واژه را بفهمید","sub":"متنی را بچسبانید، از یک صفحه عکس بگیرید، تصویری بارگذاری کنید یا از صفحه‌نمایش خود اسکرین‌شات بگیرید.\nمتن در کادر سفید قرار می‌گیرد و می‌توانید روی هر کلمه بزنید تا معنی آن را ببینید.","placeholder":"متن خود را اینجا بچسبانید…","load":"باز کردن متن","photo":"عکس، تصویر یا PDF","reading":"در حال خواندن فایل…","ocrError":"نتوانستیم آن فایل را بخوانیم. یک عکس واضح‌تر، یا یک PDF / تصویر با متن خوانا را امتحان کنید.","newText":"متن جدید","progress":"{a} از {b} واژه","doneAll":"کارتان عالی بود. همه واژه‌ها را مرور کردید.","hint":"برای دیدن معناهای هر واژه روی آن ضربه بزنید. واژه‌هایی که باز کرده‌اید سبز می‌شوند.","loginTitle":"برای خواندن متن وارد شوید","loginBtn":"ورود","upgradeTitle":"خواندن متن یک ویژگی پولی است","upgradeBtn":"دیدن پلن‌ها","loading":"در حال بارگذاری…","camera":"عکس با دوربین","upload":"بارگذاری تصویر یا PDF"},
  "id": {"title":"Pahami setiap kata","sub":"Tempel teks, foto halaman, unggah gambar, atau tangkap layarmu.\nTeksnya masuk ke kotak putih, dan kamu bisa ketuk kata apa pun untuk melihat artinya.","placeholder":"Tempel teksmu di sini…","load":"Buka teks","photo":"Foto, gambar, atau PDF","reading":"Membaca file…","ocrError":"Kami tidak bisa membaca file itu. Coba foto yang lebih jelas, atau PDF / gambar dengan teks yang terbaca.","newText":"Teks baru","progress":"{a} dari {b} kata","doneAll":"Kerja bagus. Kamu sudah melewati setiap kata.","hint":"Ketuk kata mana pun untuk melihat maknanya. Kata yang sudah kamu buka menjadi hijau.","loginTitle":"Masuk untuk membaca teks","loginBtn":"Masuk","upgradeTitle":"Membaca teks adalah fitur berbayar","upgradeBtn":"Lihat paket","loading":"Memuat…","camera":"Foto dengan kamera","upload":"Unggah gambar atau PDF"},
  "nl": {"title":"Begrijp elk woord","sub":"Plak een tekst, fotografeer een pagina, upload een afbeelding of maak een schermafbeelding.\nDe tekst komt in het witte vak en je kunt op elk woord tikken om te zien wat het betekent.","placeholder":"Plak je tekst hier…","load":"Tekst openen","photo":"Foto, afbeelding of PDF","reading":"Bestand wordt gelezen…","ocrError":"We konden dat bestand niet lezen. Probeer een duidelijkere foto, of een PDF / afbeelding met leesbare tekst.","newText":"Nieuwe tekst","progress":"{a} van {b} woorden","doneAll":"Goed gedaan. Je bent elk woord langsgegaan.","hint":"Tik op een woord om de betekenissen te zien. Woorden die je hebt geopend worden groen.","loginTitle":"Log in om een tekst te lezen","loginBtn":"Inloggen","upgradeTitle":"Een tekst lezen is een betaalde functie","upgradeBtn":"Bekijk abonnementen","loading":"Laden…","camera":"Foto maken met camera","upload":"Afbeelding of PDF uploaden"},
  "el": {"title":"Κατανόησε κάθε λέξη","sub":"Επικόλλησε ένα κείμενο, φωτογράφισε μια σελίδα, ανέβασε μια εικόνα ή κάνε λήψη της οθόνης σου.\nΤο κείμενο μπαίνει στο λευκό πλαίσιο και μπορείς να πατήσεις οποιαδήποτε λέξη για να δεις τι σημαίνει.","placeholder":"Επικολλήστε το κείμενό σας εδώ…","load":"Άνοιγμα κειμένου","photo":"Φωτογραφία, εικόνα ή PDF","reading":"Ανάγνωση αρχείου…","ocrError":"Δεν μπορέσαμε να διαβάσουμε αυτό το αρχείο. Δοκιμάστε μια πιο καθαρή φωτογραφία, ή ένα PDF / εικόνα με ευανάγνωστο κείμενο.","newText":"Νέο κείμενο","progress":"{a} από {b} λέξεις","doneAll":"Ωραία δουλειά. Περάσατε από κάθε λέξη.","hint":"Πατήστε οποιαδήποτε λέξη για να δείτε τις σημασίες της. Οι λέξεις που έχετε ανοίξει γίνονται πράσινες.","loginTitle":"Συνδεθείτε για να διαβάσετε ένα κείμενο","loginBtn":"Σύνδεση","upgradeTitle":"Η ανάγνωση κειμένου είναι πληρωμένη λειτουργία","upgradeBtn":"Δείτε τα πλάνα","loading":"Φόρτωση…","camera":"Φωτογράφιση με κάμερα","upload":"Μεταφόρτωση εικόνας ή PDF"},
  "zu": {"title":"Qonda wonke amagama","sub":"Namathisela umbhalo, thatha isithombe sekhasi, layisha isithombe noma uthwebule isikrini sakho.\nUmbhalo ungena ebhokisini elimhlophe, futhi ungathepha noma yiliphi igama ukuze ubone ukuthi lisho ukuthini.","placeholder":"Namathisela umbhalo wakho lapha…","load":"Vula umbhalo","photo":"Isithombe, umfanekiso noma i-PDF","reading":"Ifunda ifayela…","ocrError":"Asikwazanga ukufunda lelo fayela. Zama isithombe esicacile kakhulu, noma i-PDF / umfanekiso onombhalo ofundekayo.","newText":"Umbhalo omusha","progress":"{a} kwamagama angu-{b}","doneAll":"Umsebenzi omuhle. Udlule kuwo wonke amagama.","hint":"Thinta noma yiliphi igama ukuze ubone izincazelo zalo. Amagama owuwavulile aba luhlaza.","loginTitle":"Ngena ukuze ufunde umbhalo","loginBtn":"Ngena","upgradeTitle":"Ukufunda umbhalo kuyisici okukhokhelwayo","upgradeBtn":"Buka amapulani","loading":"Iyalayisha…","camera":"Thwebula ngekhamera","upload":"Layisha isithombe noma i-PDF"},
  "vi": {"title":"Hiểu mọi từ","sub":"Dán văn bản, chụp ảnh một trang, tải ảnh lên hoặc chụp màn hình.\nVăn bản sẽ hiện trong ô trắng, và bạn có thể chạm vào bất kỳ từ nào để xem nghĩa của từ đó.","placeholder":"Dán văn bản của bạn vào đây…","load":"Mở văn bản","photo":"Ảnh, hình ảnh hoặc PDF","reading":"Đang đọc tệp…","ocrError":"Chúng tôi không đọc được tệp đó. Hãy thử ảnh rõ hơn, hoặc một tệp PDF / hình ảnh có chữ dễ đọc.","newText":"Văn bản mới","progress":"{a} trên {b} từ","doneAll":"Làm tốt lắm. Bạn đã xem qua mọi từ.","hint":"Chạm vào bất kỳ từ nào để xem ý nghĩa của nó. Những từ bạn đã mở sẽ chuyển sang màu xanh lá.","loginTitle":"Đăng nhập để đọc một văn bản","loginBtn":"Đăng nhập","upgradeTitle":"Đọc một văn bản là tính năng trả phí","upgradeBtn":"Xem các gói","loading":"Đang tải…","camera":"Chụp bằng máy ảnh","upload":"Tải lên ảnh hoặc PDF"},
  "fil": {"title":"Unawain ang bawat salita","sub":"Mag-paste ng teksto, kunan ng litrato ang isang pahina, mag-upload ng larawan, o i-capture ang iyong screen.\nLalabas ang teksto sa puting kahon, at puwede mong i-tap ang kahit anong salita para makita ang kahulugan nito.","placeholder":"I-paste ang iyong teksto dito…","load":"Buksan ang teksto","photo":"Litrato, larawan o PDF","reading":"Binabasa ang file…","ocrError":"Hindi namin nabasa ang file na iyon. Subukan ang mas malinaw na litrato, o isang PDF / larawan na may nababasang teksto.","newText":"Bagong teksto","progress":"{a} ng {b} salita","doneAll":"Magaling. Napagdaanan mo na ang bawat salita.","hint":"I-tap ang anumang salita para makita ang mga kahulugan nito. Ang mga salitang nabuksan mo ay nagiging berde.","loginTitle":"Mag-sign in para magbasa ng teksto","loginBtn":"Mag-sign in","upgradeTitle":"Ang pagbasa ng teksto ay bayad na feature","upgradeBtn":"Tingnan ang mga plano","loading":"Naglo-load…","camera":"Kumuha gamit ang camera","upload":"Mag-upload ng larawan o PDF"},
  "af": {"title":"Verstaan elke woord","sub":"Plak 'n teks, neem 'n foto van 'n bladsy, laai 'n prent op of neem 'n skermskoot.\nDie teks verskyn in die wit blokkie, en jy kan op enige woord tik om te sien wat dit beteken.","placeholder":"Plak jou teks hier…","load":"Maak teks oop","photo":"Foto, prent of PDF","reading":"Besig om die lêer te lees…","ocrError":"Ons kon nie daardie lêer lees nie. Probeer 'n duideliker foto, of 'n PDF / prent met leesbare teks.","newText":"Nuwe teks","progress":"{a} van {b} woorde","doneAll":"Mooi werk. Jy het deur elke woord gegaan.","hint":"Tik enige woord om sy betekenisse te sien. Woorde wat jy oopgemaak het, word groen.","loginTitle":"Meld aan om 'n teks te lees","loginBtn":"Meld aan","upgradeTitle":"Om 'n teks te lees is 'n betaalde kenmerk","upgradeBtn":"Sien planne","loading":"Besig om te laai…","camera":"Neem foto met kamera","upload":"Laai prent of PDF op"},
  "sw": {"title":"Elewa kila neno","sub":"Bandika maandishi, piga picha ya ukurasa, pakia picha au nasa skrini yako.\nMaandishi yanaingia kwenye kisanduku cheupe, na unaweza kugusa neno lolote kuona maana yake.","placeholder":"Bandika maandishi yako hapa…","load":"Fungua maandishi","photo":"Picha, taswira au PDF","reading":"Inasoma faili…","ocrError":"Hatukuweza kusoma faili hilo. Jaribu picha iliyo wazi zaidi, au PDF / taswira yenye maandishi yanayosomeka.","newText":"Maandishi mapya","progress":"{a} kati ya maneno {b}","doneAll":"Kazi nzuri. Umepitia kila neno.","hint":"Gusa neno lolote ili kuona maana zake. Maneno uliyoyafungua yanakuwa ya kijani.","loginTitle":"Ingia ili kusoma maandishi","loginBtn":"Ingia","upgradeTitle":"Kusoma maandishi ni kipengele cha kulipia","upgradeBtn":"Ona mipango","loading":"Inapakia…","camera":"Piga picha kwa kamera","upload":"Pakia picha au PDF"},
  "zh-CN": {"title":"理解每个词","sub":"粘贴文字、拍下一页、上传图片或截取屏幕。\n文字会出现在白色框里，点任意一个词就能看到它的意思。","placeholder":"在此粘贴你的文本…","load":"打开文本","photo":"照片、图片或 PDF","reading":"正在读取文件…","ocrError":"我们无法读取该文件。请尝试更清晰的照片，或文字清晰可读的 PDF / 图片。","newText":"新文本","progress":"{a}/{b} 词","doneAll":"做得好。你已经看完了每一个词。","hint":"点击任意词语即可查看它的含义。你打开过的词会变成绿色。","loginTitle":"登录以阅读文本","loginBtn":"登录","upgradeTitle":"阅读文本是付费功能","upgradeBtn":"查看套餐","loading":"正在加载…","camera":"用相机拍照","upload":"上传图片或PDF"},
  "zh-TW": {"title":"理解每個詞","sub":"貼上文字、拍下一頁、上傳圖片或擷取螢幕畫面。\n文字會出現在白色框中，點任何一個詞就能看到它的意思。","placeholder":"在此貼上你的文字…","load":"開啟文本","photo":"相片、圖片或 PDF","reading":"正在讀取檔案…","ocrError":"我們無法讀取該檔案。請嘗試更清晰的相片，或文字清楚可讀的 PDF / 圖片。","newText":"新文本","progress":"{a}/{b} 詞","doneAll":"做得好。你已經看完每一個詞。","hint":"點按任何詞語即可查看它的含義。你開啟過的詞會變成綠色。","loginTitle":"登入以閱讀文本","loginBtn":"登入","upgradeTitle":"閱讀文本是付費功能","upgradeBtn":"查看方案","loading":"正在載入…","camera":"用相機拍照","upload":"上傳圖片或PDF"},
  "ko": {"title":"모든 단어 이해하기","sub":"텍스트를 붙여넣거나, 페이지를 촬영하거나, 이미지를 올리거나, 화면을 캡처하세요.\n텍스트가 흰색 상자에 표시되고, 아무 단어나 탭하면 뜻을 볼 수 있어요.","placeholder":"여기에 텍스트를 붙여넣으세요…","load":"텍스트 열기","photo":"사진, 이미지 또는 PDF","reading":"파일을 읽는 중…","ocrError":"해당 파일을 읽을 수 없습니다. 더 선명한 사진이나, 글자가 읽기 쉬운 PDF / 이미지로 다시 시도해 보세요.","newText":"새 텍스트","progress":"{b}개 중 {a}개 단어","doneAll":"잘하셨어요. 모든 단어를 살펴봤습니다.","hint":"아무 단어나 탭하면 그 뜻을 볼 수 있습니다. 열어 본 단어는 초록색으로 바뀝니다.","loginTitle":"텍스트를 읽으려면 로그인하세요","loginBtn":"로그인","upgradeTitle":"텍스트 읽기는 유료 기능입니다","upgradeBtn":"요금제 보기","loading":"불러오는 중…","camera":"카메라로 촬영","upload":"이미지 또는 PDF 업로드"},
  "th": {"title":"เข้าใจทุกคำ","sub":"วางข้อความ ถ่ายรูปหน้าหนังสือ อัปโหลดรูปภาพ หรือจับภาพหน้าจอ\nข้อความจะแสดงในกรอบสีขาว แตะคำไหนก็ได้เพื่อดูความหมาย","placeholder":"วางข้อความของคุณที่นี่…","load":"เปิดข้อความ","photo":"ภาพถ่าย รูปภาพ หรือ PDF","reading":"กำลังอ่านไฟล์…","ocrError":"เราอ่านไฟล์นั้นไม่ได้ ลองใช้ภาพถ่ายที่ชัดขึ้น หรือ PDF / รูปภาพที่มีข้อความอ่านออกได้","newText":"ข้อความใหม่","progress":"{a}/{b} คำ","doneAll":"เยี่ยมมาก คุณดูครบทุกคำแล้ว","hint":"แตะคำใดก็ได้เพื่อดูความหมายของคำนั้น คำที่คุณเปิดแล้วจะเปลี่ยนเป็นสีเขียว","loginTitle":"ลงชื่อเข้าใช้เพื่ออ่านข้อความ","loginBtn":"ลงชื่อเข้าใช้","upgradeTitle":"การอ่านข้อความเป็นฟีเจอร์แบบเสียเงิน","upgradeBtn":"ดูแพ็กเกจ","loading":"กำลังโหลด…","camera":"ถ่ายด้วยกล้อง","upload":"อัปโหลดรูปภาพหรือ PDF"},
  "bn": {"title":"প্রতিটি শব্দ বুঝুন","sub":"টেক্সট পেস্ট করুন, একটি পাতার ছবি তুলুন, একটি ছবি আপলোড করুন বা আপনার স্ক্রিন ক্যাপচার করুন।\nটেক্সটটি সাদা বাক্সে চলে আসে, আর যেকোনো শব্দে ট্যাপ করে তার মানে দেখে নিন।","placeholder":"আপনার লেখা এখানে পেস্ট করুন…","load":"লেখা খুলুন","photo":"ছবি, ইমেজ বা PDF","reading":"ফাইলটি পড়া হচ্ছে…","ocrError":"আমরা সেই ফাইলটি পড়তে পারিনি। আরও স্পষ্ট একটি ছবি চেষ্টা করুন, অথবা পড়ার যোগ্য লেখাসহ একটি PDF / ইমেজ ব্যবহার করুন।","newText":"নতুন লেখা","progress":"{b}টির মধ্যে {a}টি শব্দ","doneAll":"চমৎকার। আপনি প্রতিটি শব্দ দেখে ফেলেছেন।","hint":"অর্থ দেখতে যেকোনো শব্দে ট্যাপ করুন। আপনি যে শব্দগুলো খুলেছেন সেগুলো সবুজ হয়ে যায়।","loginTitle":"একটি লেখা পড়তে সাইন ইন করুন","loginBtn":"সাইন ইন","upgradeTitle":"লেখা পড়া একটি পেইড ফিচার","upgradeBtn":"প্ল্যান দেখুন","loading":"লোড হচ্ছে…","camera":"ক্যামেরা দিয়ে ছবি তুলুন","upload":"ছবি বা PDF আপলোড করুন"},
  "da": {"title":"Forstå hvert ord","sub":"Indsæt en tekst, fotografér en side, upload et billede eller tag et skærmbillede.\nTeksten kommer ind i den hvide boks, og du kan trykke på et hvilket som helst ord for at se, hvad det betyder.","placeholder":"Indsæt din tekst her…","load":"Åbn tekst","photo":"Foto, billede eller PDF","reading":"Læser filen…","ocrError":"Vi kunne ikke læse den fil. Prøv et tydeligere foto eller en PDF / et billede med læsbar tekst.","newText":"Ny tekst","progress":"{a} af {b} ord","doneAll":"Godt gået. Du har været igennem hvert ord.","hint":"Tryk på et hvilket som helst ord for at se dets betydninger. Ord, du har åbnet, bliver grønne.","loginTitle":"Log ind for at læse en tekst","loginBtn":"Log ind","upgradeTitle":"At læse en tekst er en betalt funktion","upgradeBtn":"Se abonnementer","loading":"Indlæser…","camera":"Tag foto med kamera","upload":"Upload billede eller PDF"},
  "hu": {"title":"Értsd meg minden szót","sub":"Illessz be egy szöveget, fotózz le egy oldalt, tölts fel egy képet, vagy készíts képernyőképet.\nA szöveg a fehér mezőbe kerül, és bármelyik szóra koppintva megnézheted, mit jelent.","placeholder":"Illeszd be ide a szöveged…","load":"Szöveg megnyitása","photo":"Fénykép, kép vagy PDF","reading":"A fájl beolvasása…","ocrError":"Nem tudtuk beolvasni azt a fájlt. Próbálj egy élesebb fényképet, vagy egy olvasható szöveget tartalmazó PDF / kép fájlt.","newText":"Új szöveg","progress":"{a} / {b} szó","doneAll":"Szép munka. Minden szót átnéztél.","hint":"Koppints bármelyik szóra, hogy lásd a jelentéseit. A megnyitott szavak zöldre váltanak.","loginTitle":"Jelentkezz be a szöveg olvasásához","loginBtn":"Bejelentkezés","upgradeTitle":"A szöveg olvasása fizetős funkció","upgradeBtn":"Csomagok megtekintése","loading":"Betöltés…","camera":"Fotózás kamerával","upload":"Kép vagy PDF feltöltése"},
};

function copy(lang: Lang): ReaderStrings {
  return READER_COPY[lang] ?? READER_COPY.en;
}

function fmtProgress(tpl: string, a: number, b: number): string {
  return tpl.replace("{a}", String(a)).replace("{b}", String(b));
}

/**
 * Prepare a picked file for the OCR upload. Images are downscaled to a max edge
 * and re-encoded as JPEG so a multi-MB phone photo lands well under the
 * serverless body limit (the usual cause of "we couldn't read the file"), and
 * EXIF orientation is baked in so a sideways photo OCRs upright. PDFs and any
 * format the browser can't decode pass through unchanged.
 */
async function prepareForUpload(file: Blob): Promise<Blob> {
  if (file.type === "application/pdf" || !file.type.startsWith("image/")) return file;
  // 3000px keeps fine detail (Hebrew niqqud, small print) legible for OCR while
  // JPEG at 0.92 still lands well under the body limit for a page of text.
  const MAX_EDGE = 3000;
  const JPEG_QUALITY = 0.92;
  const SMALL_ENOUGH = 1.2 * 1024 * 1024; // already small and reasonable → leave it
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const longest = Math.max(bitmap.width, bitmap.height);
    // Nothing to gain from re-encoding a small, well-sized image.
    if (longest <= MAX_EDGE && file.size <= SMALL_ENOUGH) { bitmap.close?.(); return file; }
    const scale = Math.min(1, MAX_EDGE / longest);
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) { bitmap.close?.(); return file; }
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY));
    return blob && blob.size > 0 ? blob : file;
  } catch {
    // HEIC on a browser that can't decode it, etc. — send the original and let
    // the server try; if it's too large the user gets the clear size message.
    return file;
  }
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
  const [ocrState, setOcrState] = useState<"idle" | "reading" | "error">("idle");
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
    if (v) setText(v);
  }

  function resetText() {
    setText("");
    setDraft("");
    setReviewed(new Set());
    setOcrState("idle");
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
      const j = (await res.json().catch(() => ({}))) as { text?: string };
      let out = (j.text ?? "").trim();
      // A blank/black capture makes the model reply "I'm sorry, I can't
      // transcribe…" — that is a FAILURE, not the text. Don't load it.
      if (!res.ok || !out || looksLikeRefusal(out)) {
        setOcrState("error");
        return;
      }
      // Hebrew: OCR routinely drops niqqud, but a young reader needs it. Run the
      // text through Dicta (via /api/niqqud) to restore accurate, readable vowel
      // points. Best-effort: on failure keep the un-niqqud'd text.
      if (/[֐-׿]/.test(out)) {
        try {
          const nres = await fetch("/api/niqqud", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
            body: JSON.stringify({ texts: [out] }),
          });
          if (nres.ok) {
            const nj = (await nres.json()) as { niqqud?: string[] };
            if (Array.isArray(nj.niqqud) && nj.niqqud[0]) out = nj.niqqud[0];
          }
        } catch { /* keep the plain text */ }
      }
      setDraft(out);
      setText(out);
      setOcrState("idle");
    } catch {
      setOcrState("error");
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
    // Desktop: keep the plain file picker (no reason to open a webcam to read a
    // newspaper). The process-death problem is mobile-only anyway.
    const isTouch = typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches;
    if (!md?.getUserMedia || !isTouch) { cameraRef.current?.click(); return; }
    try {
      const stream = await md.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 2600 }, height: { ideal: 2600 } },
        audio: false,
      });
      streamRef.current = stream;
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
  }

  // Shutter: grab the current video frame and OCR it, all in-page.
  async function shootPhoto() {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const w = v.videoWidth, h = v.videoHeight;
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) { stopCamera(); return; }
    ctx.drawImage(v, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.92));
    stopCamera();
    if (blob) await runOcr(blob); else setOcrState("error");
  }

  // Release the camera if the component unmounts mid-capture.
  useEffect(() => () => { streamRef.current?.getTracks().forEach((tk) => tk.stop()); }, []);

  const canCaptureScreen = typeof navigator !== "undefined" && !!(navigator.mediaDevices as { getDisplayMedia?: unknown } | undefined)?.getDisplayMedia;

  const allDone = total > 0 && reviewed.size >= total;

  return (
    // The shared tool frame (Gadi 2026-10-11): same bar, same centred title.
    <ToolPage active="read" width={760} title={t.title} titleExtra={<GuideButton guide="reader" size={24} />} sub={t.sub}>
      <div style={{ fontFamily: fontBody(lang) }}>
        {authLoading || (user && !planReady) ? (
          <div style={{ color: "var(--ink-muted,#6B7280)" }}>{t.loading}</div>
        ) : !user ? (
          <Gate title={t.loginTitle} btn={t.loginBtn} onClick={() => promptLogin?.()} />
        ) : plan === "basic" ? (
          <Gate title={t.upgradeTitle} btn={t.upgradeBtn} href={href("/pricing")} />
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
                <div style={{ ...ghostBtn, opacity: 0.7, cursor: "default" }}>{t.reading}</div>
              ) : (
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <button type="button" onClick={openCamera} style={ghostBtn}>
                    📷 {camLabel}
                  </button>
                  <button type="button" onClick={() => uploadRef.current?.click()} style={ghostBtn}>
                    📄 {uploadLabel}
                  </button>
                  {canCaptureScreen && (
                    <button type="button" onClick={onCaptureScreen} style={ghostBtn}>
                      🖥️ {screenLabel}
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
                    style={{ flex: 1, width: "100%", height: "100%", objectFit: "contain", background: "#000" }}
                  />
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
                      aria-label={misc("capture", lang)}
                      style={{ width: 72, height: 72, borderRadius: "50%", background: "#fff", border: "5px solid rgba(255,255,255,0.45)", cursor: "pointer", boxShadow: "0 0 0 2px #000 inset" }}
                    />
                    <span style={{ width: 60 }} aria-hidden="true" />
                  </div>
                </div>
              )}
            </div>
            {ocrState === "error" && (
              <p style={{ marginTop: 12, color: "#B91C1C", fontSize: 14 }}>{t.ocrError}</p>
            )}
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
                <button type="button" onClick={resetText} style={{ background: "none", border: "none", color: "var(--teal-deep,#0E7490)", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", textDecoration: "underline" }}>
                  {t.newText}
                </button>
              </div>
              <div style={{ height: 8, borderRadius: 999, background: "var(--hairline,#E5E7EB)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${total ? Math.round((reviewed.size / total) * 100) : 0}%`, background: allDone ? "#16A34A" : "var(--teal,#0EA5A5)", borderRadius: 999, transition: "width 0.25s" }} />
              </div>
            </div>
            {/* Words-first: the on-brand fast help for a parent who won't tap
                word by word. The key words to learn (primary) + a short gist. */}
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
                <ReaderText text={text} reviewed={reviewed} onReview={markReviewed} hardKeys={hardKeys} />
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  );
}

function Gate({ title, btn, onClick, href }: { title: string; btn: string; onClick?: () => void; href?: string }) {
  const inner = (
    <span style={{ display: "inline-block", background: "var(--teal,#0EA5A5)", color: "#fff", borderRadius: 12, padding: "11px 22px", fontSize: 15, fontWeight: 700, cursor: "pointer", textDecoration: "none" }}>
      {btn}
    </span>
  );
  return (
    <div style={{ background: "var(--card,#fff)", border: "1px solid var(--hairline,#E5E7EB)", borderRadius: 16, padding: 26 }}>
      <p style={{ margin: "0 0 16px", fontSize: 16, color: "var(--ink,#20272E)" }}>{title}</p>
      {href ? <Link href={href}>{inner}</Link> : <span onClick={onClick}>{inner}</span>}
    </div>
  );
}
