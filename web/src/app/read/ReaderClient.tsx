"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { WbUserMenu } from "@/components/design/WbUserMenu";
import { WbShellNav, WbShellBurger } from "@/components/design/WbShellChrome";
import { LangSwitchMobile } from "@/components/LangSwitchMobile";
import { ShareButton, APP_SHARE_COPY } from "@/components/ShareButton";
import { ReaderText } from "@/components/design/ReaderText";
import { distinctWordCount, wordKey } from "@/lib/tokenize-words";
import { LANGUAGES, type Lang } from "@/lib/i18n";

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
};

// Reader UI copy. en + he authored; every other language falls back to en until
// its native strings land (translated in a batch). The look-up and OCR
// themselves already work in every language — this is only the chrome.
const READER_COPY: Record<string, ReaderStrings> = {
  en: {
    title: "Read a text",
    sub: "Paste a text or photograph a page. Gadit turns every word into a tap, so you can go word by word and reveal all its meanings.",
    placeholder: "Paste your text here…",
    load: "Open text",
    photo: "Photo, image or PDF",
    reading: "Reading the file…",
    ocrError: "We couldn't read that file. Try a clearer photo, or a PDF / image with readable text.",
    newText: "New text",
    progress: "{a} of {b} words",
    doneAll: "Nice work. You went over every word.",
    hint: "Tap any word to see its meanings. Words you've opened turn green.",
    loginTitle: "Sign in to read a text",
    loginBtn: "Sign in",
    upgradeTitle: "Reading a text is a paid feature",
    upgradeBtn: "See plans",
    loading: "Loading…",
    camera: "Photograph with camera",
    upload: "Upload image or PDF",
  },
  he: {
    title: "קריאת טקסט",
    sub: "להדביק טקסט או לצלם עמוד. גדית הופך כל מילה ללחיצה, ואפשר לעבור מילה-מילה ולגלות את כל המשמעויות שלה.",
    placeholder: "להדביק כאן את הטקסט…",
    load: "לפתוח את הטקסט",
    photo: "צילום, תמונה או PDF",
    reading: "קורא את הקובץ…",
    ocrError: "לא הצלחנו לקרוא את הקובץ. כדאי צילום ברור יותר, או PDF/תמונה עם טקסט קריא.",
    newText: "טקסט חדש",
    progress: "{a} מתוך {b} מילים",
    doneAll: "כל הכבוד. עברת על כל המילים.",
    hint: "לוחצים על כל מילה כדי לראות את המשמעויות. מילים שפתחת נצבעות בירוק.",
    loginTitle: "צריך להתחבר כדי לקרוא טקסט",
    loginBtn: "התחברות",
    upgradeTitle: "קריאת טקסט היא תכונה בתשלום",
    upgradeBtn: "לצפייה במסלולים",
    loading: "טוען…",
    camera: "צילום מהמצלמה",
    upload: "העלאת תמונה או PDF",
  },
  "ar": {"title":"اقرأ نصاً","sub":"الصق نصاً أو صوّر صفحة. يحوّل Gadit كل كلمة إلى نقرة، حتى تتنقل كلمة كلمة وتكشف كل معانيها.","placeholder":"الصق نصك هنا…","load":"افتح النص","photo":"صورة أو ملف PDF","reading":"جارٍ قراءة الملف…","ocrError":"تعذّرت علينا قراءة هذا الملف. جرّب صورة أوضح، أو ملف PDF أو صورة بنص مقروء.","newText":"نص جديد","progress":"{a} من {b} كلمة","doneAll":"عمل رائع. لقد مررت على كل كلمة.","hint":"انقر على أي كلمة لرؤية معانيها. الكلمات التي فتحتها تتحول إلى الأخضر.","loginTitle":"سجّل الدخول لقراءة نص","loginBtn":"تسجيل الدخول","upgradeTitle":"قراءة نص ميزة مدفوعة","upgradeBtn":"اطّلع على الخطط","loading":"جارٍ التحميل…","camera":"التقاط بالكاميرا","upload":"رفع صورة أو PDF"},
  "ru": {"title":"Читать текст","sub":"Вставьте текст или сфотографируйте страницу. Gadit превращает каждое слово в нажатие, чтобы вы могли идти слово за словом и раскрывать все его значения.","placeholder":"Вставьте свой текст сюда…","load":"Открыть текст","photo":"Фото, изображение или PDF","reading":"Читаем файл…","ocrError":"Не удалось прочитать этот файл. Попробуйте более четкое фото или PDF либо изображение с читаемым текстом.","newText":"Новый текст","progress":"{a} из {b} слов","doneAll":"Отличная работа. Вы прошли по всем словам.","hint":"Нажмите на любое слово, чтобы увидеть его значения. Открытые слова становятся зелеными.","loginTitle":"Войдите, чтобы читать текст","loginBtn":"Войти","upgradeTitle":"Чтение текста, это платная функция","upgradeBtn":"Посмотреть тарифы","loading":"Загрузка…","camera":"Сфотографировать камерой","upload":"Загрузить изображение или PDF"},
  "es": {"title":"Leer un texto","sub":"Pega un texto o fotografía una página. Gadit convierte cada palabra en un toque, para que puedas ir palabra por palabra y descubrir todos sus significados.","placeholder":"Pega tu texto aquí…","load":"Abrir texto","photo":"Foto, imagen o PDF","reading":"Leyendo el archivo…","ocrError":"No pudimos leer ese archivo. Prueba con una foto más nítida, o con un PDF o imagen con texto legible.","newText":"Texto nuevo","progress":"{a} de {b} palabras","doneAll":"Buen trabajo. Revisaste todas las palabras.","hint":"Toca cualquier palabra para ver sus significados. Las palabras que abriste se ponen verdes.","loginTitle":"Inicia sesión para leer un texto","loginBtn":"Iniciar sesión","upgradeTitle":"Leer un texto es una función de pago","upgradeBtn":"Ver planes","loading":"Cargando…","camera":"Fotografiar con la cámara","upload":"Subir imagen o PDF"},
  "pt": {"title":"Ler um texto","sub":"Cole um texto ou fotografe uma página. O Gadit transforma cada palavra em um toque, para você avançar palavra por palavra e revelar todos os seus significados.","placeholder":"Cole seu texto aqui…","load":"Abrir texto","photo":"Foto, imagem ou PDF","reading":"Lendo o arquivo…","ocrError":"Não conseguimos ler esse arquivo. Tente uma foto mais nítida, ou um PDF ou imagem com texto legível.","newText":"Novo texto","progress":"{a} de {b} palavras","doneAll":"Bom trabalho. Você passou por todas as palavras.","hint":"Toque em qualquer palavra para ver seus significados. As palavras que você abriu ficam verdes.","loginTitle":"Faça login para ler um texto","loginBtn":"Entrar","upgradeTitle":"Ler um texto é um recurso pago","upgradeBtn":"Ver planos","loading":"Carregando…","camera":"Fotografar com a câmera","upload":"Enviar imagem ou PDF"},
  "fr": {"title":"Lire un texte","sub":"Collez un texte ou photographiez une page. Gadit transforme chaque mot en un toucher, pour avancer mot à mot et révéler tous ses sens.","placeholder":"Collez votre texte ici…","load":"Ouvrir le texte","photo":"Photo, image ou PDF","reading":"Lecture du fichier…","ocrError":"Nous n'avons pas pu lire ce fichier. Essayez une photo plus nette, ou un PDF ou une image avec un texte lisible.","newText":"Nouveau texte","progress":"{a} sur {b} mots","doneAll":"Beau travail. Vous avez parcouru tous les mots.","hint":"Touchez n'importe quel mot pour voir ses sens. Les mots que vous avez ouverts deviennent verts.","loginTitle":"Connectez-vous pour lire un texte","loginBtn":"Se connecter","upgradeTitle":"Lire un texte est une fonction payante","upgradeBtn":"Voir les offres","loading":"Chargement…","camera":"Photographier avec l'appareil","upload":"Importer une image ou un PDF"},
  "de": {"title":"Einen Text lesen","sub":"Füge einen Text ein oder fotografiere eine Seite. Gadit macht aus jedem Wort einen Tipp, damit du Wort für Wort vorgehen und all seine Bedeutungen aufdecken kannst.","placeholder":"Füge deinen Text hier ein…","load":"Text öffnen","photo":"Foto, Bild oder PDF","reading":"Datei wird gelesen…","ocrError":"Wir konnten diese Datei nicht lesen. Versuche ein schärferes Foto oder ein PDF oder Bild mit lesbarem Text.","newText":"Neuer Text","progress":"{a} von {b} Wörtern","doneAll":"Gut gemacht. Du bist jedes Wort durchgegangen.","hint":"Tippe auf ein beliebiges Wort, um seine Bedeutungen zu sehen. Geöffnete Wörter werden grün.","loginTitle":"Melde dich an, um einen Text zu lesen","loginBtn":"Anmelden","upgradeTitle":"Einen Text zu lesen ist eine kostenpflichtige Funktion","upgradeBtn":"Tarife ansehen","loading":"Wird geladen…","camera":"Mit Kamera fotografieren","upload":"Bild oder PDF hochladen"},
  "cs": {"title":"Přečíst text","sub":"Vložte text nebo vyfoťte stránku. Gadit promění každé slovo v klepnutí, abyste mohli postupovat slovo po slovu a odhalit všechny jeho významy.","placeholder":"Sem vložte svůj text…","load":"Otevřít text","photo":"Fotka, obrázek nebo PDF","reading":"Čteme soubor…","ocrError":"Tento soubor se nám nepodařilo přečíst. Zkuste ostřejší fotku nebo PDF či obrázek s čitelným textem.","newText":"Nový text","progress":"{a} z {b} slov","doneAll":"Dobrá práce. Prošli jste každé slovo.","hint":"Klepněte na jakékoli slovo a zobrazte jeho významy. Slova, která jste otevřeli, zezelenají.","loginTitle":"Přihlaste se a čtěte text","loginBtn":"Přihlásit se","upgradeTitle":"Čtení textu je placená funkce","upgradeBtn":"Zobrazit plány","loading":"Načítání…","camera":"Vyfotit fotoaparátem","upload":"Nahrát obrázek nebo PDF"},
  "sk": {"title":"Prečítať text","sub":"Vložte text alebo odfoťte stranu. Gadit premení každé slovo na ťuknutie, aby ste mohli postupovať slovo po slove a odhaliť všetky jeho významy.","placeholder":"Sem vložte svoj text…","load":"Otvoriť text","photo":"Fotka, obrázok alebo PDF","reading":"Čítame súbor…","ocrError":"Tento súbor sa nám nepodarilo prečítať. Skúste ostrejšiu fotku alebo PDF či obrázok s čitateľným textom.","newText":"Nový text","progress":"{a} z {b} slov","doneAll":"Dobrá práca. Prešli ste každé slovo.","hint":"Ťuknite na ktorékoľvek slovo a zobrazte jeho významy. Slová, ktoré ste otvorili, zozelenejú.","loginTitle":"Prihláste sa a čítajte text","loginBtn":"Prihlásiť sa","upgradeTitle":"Čítanie textu je platená funkcia","upgradeBtn":"Zobraziť plány","loading":"Načítava sa…","camera":"Odfotiť fotoaparátom","upload":"Nahrať obrázok alebo PDF"},
  "it": {"title":"Leggere un testo","sub":"Incolla un testo o fotografa una pagina. Gadit trasforma ogni parola in un tocco, così puoi procedere parola per parola e scoprire tutti i suoi significati.","placeholder":"Incolla qui il tuo testo…","load":"Apri il testo","photo":"Foto, immagine o PDF","reading":"Lettura del file…","ocrError":"Non siamo riusciti a leggere questo file. Prova con una foto più nitida, oppure un PDF o un'immagine con testo leggibile.","newText":"Nuovo testo","progress":"{a} di {b} parole","doneAll":"Ottimo lavoro. Hai esaminato ogni parola.","hint":"Tocca una parola qualsiasi per vedere i suoi significati. Le parole che hai aperto diventano verdi.","loginTitle":"Accedi per leggere un testo","loginBtn":"Accedi","upgradeTitle":"Leggere un testo è una funzione a pagamento","upgradeBtn":"Vedi i piani","loading":"Caricamento…","camera":"Fotografa con la fotocamera","upload":"Carica immagine o PDF"},
  "ja": {"title":"テキストを読む","sub":"テキストを貼り付けるか、ページを撮影してください。Gadit はすべての単語をタップできるようにするので、単語を一つずつたどってそのすべての意味を明らかにできます。","placeholder":"ここにテキストを貼り付けてください…","load":"テキストを開く","photo":"写真、画像、または PDF","reading":"ファイルを読み込んでいます…","ocrError":"このファイルを読み取れませんでした。より鮮明な写真、または読み取れるテキストの PDF か画像でお試しください。","newText":"新しいテキスト","progress":"{b} 語中 {a} 語","doneAll":"お疲れさまでした。すべての単語に目を通しました。","hint":"どの単語でもタップすると、その意味が表示されます。開いた単語は緑色になります。","loginTitle":"テキストを読むにはサインインしてください","loginBtn":"サインイン","upgradeTitle":"テキストを読む機能は有料です","upgradeBtn":"プランを見る","loading":"読み込み中…","camera":"カメラで撮影","upload":"画像またはPDFをアップロード"},
  "hi": {"title":"टेक्स्ट पढ़ें","sub":"कोई टेक्स्ट पेस्ट करें या किसी पेज की फोटो लें। Gadit हर शब्द को एक टैप में बदल देता है, ताकि आप शब्द दर शब्द बढ़ सकें और उसके सभी अर्थ देख सकें।","placeholder":"अपना टेक्स्ट यहाँ पेस्ट करें…","load":"टेक्स्ट खोलें","photo":"फोटो, इमेज या PDF","reading":"फ़ाइल पढ़ी जा रही है…","ocrError":"हम वह फ़ाइल नहीं पढ़ पाए। कोई साफ़ फोटो आज़माएँ, या पढ़ने योग्य टेक्स्ट वाली PDF / इमेज।","newText":"नया टेक्स्ट","progress":"{b} में से {a} शब्द","doneAll":"बढ़िया काम। आपने हर शब्द देख लिया।","hint":"किसी भी शब्द पर टैप करके उसके अर्थ देखें। जो शब्द आपने खोले हैं वे हरे हो जाते हैं।","loginTitle":"टेक्स्ट पढ़ने के लिए साइन इन करें","loginBtn":"साइन इन करें","upgradeTitle":"टेक्स्ट पढ़ना एक पेड फ़ीचर है","upgradeBtn":"प्लान देखें","loading":"लोड हो रहा है…","camera":"कैमरे से फ़ोटो लें","upload":"छवि या PDF अपलोड करें"},
  "am": {"title":"ጽሑፍ ያንብቡ","sub":"ጽሑፍ ይለጥፉ ወይም ገጽ ፎቶ ያንሱ። Gadit እያንዳንዱን ቃል ወደ ንክኪ ይለውጠዋል፣ ስለዚህ ቃል በቃል መሄድና ሁሉንም ትርጉሞቹን ማየት ይችላሉ።","placeholder":"ጽሑፍዎን እዚህ ይለጥፉ…","load":"ጽሑፍ ክፈት","photo":"ፎቶ፣ ምስል ወይም PDF","reading":"ፋይሉ እየተነበበ ነው…","ocrError":"ያንን ፋይል ማንበብ አልቻልንም። ግልጽ የሆነ ፎቶ ይሞክሩ፣ ወይም ሊነበብ የሚችል ጽሑፍ ያለው PDF / ምስል።","newText":"አዲስ ጽሑፍ","progress":"ከ{b} ውስጥ {a} ቃላት","doneAll":"ጥሩ ሥራ። እያንዳንዱን ቃል አልፈዋል።","hint":"ትርጉሞቹን ለማየት ማንኛውንም ቃል ይንኩ። የከፈቷቸው ቃላት አረንጓዴ ይሆናሉ።","loginTitle":"ጽሑፍ ለማንበብ ይግቡ","loginBtn":"ግባ","upgradeTitle":"ጽሑፍ ማንበብ የሚከፈልበት ባህሪ ነው","upgradeBtn":"እቅዶችን ይመልከቱ","loading":"በመጫን ላይ…","camera":"በካሜራ ፎቶ አንሳ","upload":"ምስል ወይም PDF ስቀል"},
  "uk": {"title":"Читати текст","sub":"Вставте текст або сфотографуйте сторінку. Gadit перетворює кожне слово на дотик, щоб ви могли йти слово за словом і розкривати всі його значення.","placeholder":"Вставте свій текст тут…","load":"Відкрити текст","photo":"Фото, зображення або PDF","reading":"Читання файлу…","ocrError":"Не вдалося прочитати цей файл. Спробуйте чіткіше фото або PDF / зображення з розбірливим текстом.","newText":"Новий текст","progress":"{a} з {b} слів","doneAll":"Гарна робота. Ви пройшли кожне слово.","hint":"Торкніться будь-якого слова, щоб побачити його значення. Слова, які ви відкрили, стають зеленими.","loginTitle":"Увійдіть, щоб читати текст","loginBtn":"Увійти","upgradeTitle":"Читання тексту, це платна функція","upgradeBtn":"Переглянути плани","loading":"Завантаження…","camera":"Сфотографувати камерою","upload":"Завантажити зображення або PDF"},
  "tr": {"title":"Bir metin oku","sub":"Bir metin yapıştırın veya bir sayfanın fotoğrafını çekin. Gadit her kelimeyi bir dokunuşa dönüştürür, böylece kelime kelime ilerleyip tüm anlamlarını görebilirsiniz.","placeholder":"Metninizi buraya yapıştırın…","load":"Metni aç","photo":"Fotoğraf, görsel veya PDF","reading":"Dosya okunuyor…","ocrError":"Bu dosyayı okuyamadık. Daha net bir fotoğraf ya da okunabilir metin içeren bir PDF / görsel deneyin.","newText":"Yeni metin","progress":"{b} kelimeden {a} tanesi","doneAll":"Güzel iş. Her kelimeyi gözden geçirdiniz.","hint":"Anlamlarını görmek için herhangi bir kelimeye dokunun. Açtığınız kelimeler yeşile döner.","loginTitle":"Metin okumak için giriş yapın","loginBtn":"Giriş yap","upgradeTitle":"Metin okuma ücretli bir özelliktir","upgradeBtn":"Planları gör","loading":"Yükleniyor…","camera":"Kamerayla çek","upload":"Görsel veya PDF yükle"},
  "pl": {"title":"Przeczytaj tekst","sub":"Wklej tekst lub zrób zdjęcie strony. Gadit zamienia każde słowo w dotknięcie, dzięki czemu możesz iść słowo po słowie i odkrywać wszystkie jego znaczenia.","placeholder":"Wklej swój tekst tutaj…","load":"Otwórz tekst","photo":"Zdjęcie, obraz lub PDF","reading":"Odczytywanie pliku…","ocrError":"Nie udało się odczytać tego pliku. Spróbuj wyraźniejszego zdjęcia albo pliku PDF / obrazu z czytelnym tekstem.","newText":"Nowy tekst","progress":"{a} z {b} słów","doneAll":"Dobra robota. Przejrzałeś każde słowo.","hint":"Dotknij dowolnego słowa, aby zobaczyć jego znaczenia. Słowa, które otworzyłeś, zmieniają kolor na zielony.","loginTitle":"Zaloguj się, aby przeczytać tekst","loginBtn":"Zaloguj się","upgradeTitle":"Czytanie tekstu to funkcja płatna","upgradeBtn":"Zobacz plany","loading":"Ładowanie…","camera":"Zrób zdjęcie aparatem","upload":"Prześlij obraz lub PDF"},
  "fa": {"title":"خواندن یک متن","sub":"یک متن را بچسبانید یا از یک صفحه عکس بگیرید. Gadit هر واژه را به یک لمس تبدیل می‌کند تا بتوانید واژه به واژه پیش بروید و همه معناهای آن را ببینید.","placeholder":"متن خود را اینجا بچسبانید…","load":"باز کردن متن","photo":"عکس، تصویر یا PDF","reading":"در حال خواندن فایل…","ocrError":"نتوانستیم آن فایل را بخوانیم. یک عکس واضح‌تر، یا یک PDF / تصویر با متن خوانا را امتحان کنید.","newText":"متن جدید","progress":"{a} از {b} واژه","doneAll":"کارتان عالی بود. همه واژه‌ها را مرور کردید.","hint":"برای دیدن معناهای هر واژه روی آن ضربه بزنید. واژه‌هایی که باز کرده‌اید سبز می‌شوند.","loginTitle":"برای خواندن متن وارد شوید","loginBtn":"ورود","upgradeTitle":"خواندن متن یک ویژگی پولی است","upgradeBtn":"دیدن پلن‌ها","loading":"در حال بارگذاری…","camera":"عکس با دوربین","upload":"بارگذاری تصویر یا PDF"},
  "id": {"title":"Baca teks","sub":"Tempel teks atau foto sebuah halaman. Gadit mengubah setiap kata menjadi satu ketukan, sehingga kamu bisa maju kata demi kata dan menampilkan semua maknanya.","placeholder":"Tempel teksmu di sini…","load":"Buka teks","photo":"Foto, gambar, atau PDF","reading":"Membaca file…","ocrError":"Kami tidak bisa membaca file itu. Coba foto yang lebih jelas, atau PDF / gambar dengan teks yang terbaca.","newText":"Teks baru","progress":"{a} dari {b} kata","doneAll":"Kerja bagus. Kamu sudah melewati setiap kata.","hint":"Ketuk kata mana pun untuk melihat maknanya. Kata yang sudah kamu buka menjadi hijau.","loginTitle":"Masuk untuk membaca teks","loginBtn":"Masuk","upgradeTitle":"Membaca teks adalah fitur berbayar","upgradeBtn":"Lihat paket","loading":"Memuat…","camera":"Foto dengan kamera","upload":"Unggah gambar atau PDF"},
  "nl": {"title":"Een tekst lezen","sub":"Plak een tekst of fotografeer een pagina. Gadit maakt van elk woord een tik, zodat je woord voor woord kunt gaan en alle betekenissen kunt onthullen.","placeholder":"Plak je tekst hier…","load":"Tekst openen","photo":"Foto, afbeelding of PDF","reading":"Bestand wordt gelezen…","ocrError":"We konden dat bestand niet lezen. Probeer een duidelijkere foto, of een PDF / afbeelding met leesbare tekst.","newText":"Nieuwe tekst","progress":"{a} van {b} woorden","doneAll":"Goed gedaan. Je bent elk woord langsgegaan.","hint":"Tik op een woord om de betekenissen te zien. Woorden die je hebt geopend worden groen.","loginTitle":"Log in om een tekst te lezen","loginBtn":"Inloggen","upgradeTitle":"Een tekst lezen is een betaalde functie","upgradeBtn":"Bekijk abonnementen","loading":"Laden…","camera":"Foto maken met camera","upload":"Afbeelding of PDF uploaden"},
  "el": {"title":"Διαβάστε ένα κείμενο","sub":"Επικολλήστε ένα κείμενο ή φωτογραφίστε μια σελίδα. Το Gadit μετατρέπει κάθε λέξη σε ένα άγγιγμα, ώστε να προχωράτε λέξη προς λέξη και να αποκαλύπτετε όλες τις σημασίες της.","placeholder":"Επικολλήστε το κείμενό σας εδώ…","load":"Άνοιγμα κειμένου","photo":"Φωτογραφία, εικόνα ή PDF","reading":"Ανάγνωση αρχείου…","ocrError":"Δεν μπορέσαμε να διαβάσουμε αυτό το αρχείο. Δοκιμάστε μια πιο καθαρή φωτογραφία, ή ένα PDF / εικόνα με ευανάγνωστο κείμενο.","newText":"Νέο κείμενο","progress":"{a} από {b} λέξεις","doneAll":"Ωραία δουλειά. Περάσατε από κάθε λέξη.","hint":"Πατήστε οποιαδήποτε λέξη για να δείτε τις σημασίες της. Οι λέξεις που έχετε ανοίξει γίνονται πράσινες.","loginTitle":"Συνδεθείτε για να διαβάσετε ένα κείμενο","loginBtn":"Σύνδεση","upgradeTitle":"Η ανάγνωση κειμένου είναι πληρωμένη λειτουργία","upgradeBtn":"Δείτε τα πλάνα","loading":"Φόρτωση…","camera":"Φωτογράφιση με κάμερα","upload":"Μεταφόρτωση εικόνας ή PDF"},
  "zu": {"title":"Funda umbhalo","sub":"Namathisela umbhalo noma uthwebule ikhasi. Gadit iguqula igama ngalinye libe ukuthinta, ukuze ukwazi ukuhamba igama ngegama futhi wembule zonke izincazelo zalo.","placeholder":"Namathisela umbhalo wakho lapha…","load":"Vula umbhalo","photo":"Isithombe, umfanekiso noma i-PDF","reading":"Ifunda ifayela…","ocrError":"Asikwazanga ukufunda lelo fayela. Zama isithombe esicacile kakhulu, noma i-PDF / umfanekiso onombhalo ofundekayo.","newText":"Umbhalo omusha","progress":"{a} kwamagama angu-{b}","doneAll":"Umsebenzi omuhle. Udlule kuwo wonke amagama.","hint":"Thinta noma yiliphi igama ukuze ubone izincazelo zalo. Amagama owuwavulile aba luhlaza.","loginTitle":"Ngena ukuze ufunde umbhalo","loginBtn":"Ngena","upgradeTitle":"Ukufunda umbhalo kuyisici okukhokhelwayo","upgradeBtn":"Buka amapulani","loading":"Iyalayisha…","camera":"Thwebula ngekhamera","upload":"Layisha isithombe noma i-PDF"},
  "vi": {"title":"Đọc một văn bản","sub":"Dán một đoạn văn bản hoặc chụp ảnh một trang. Gadit biến mỗi từ thành một lần chạm, để bạn có thể đi qua từng từ và khám phá tất cả ý nghĩa của nó.","placeholder":"Dán văn bản của bạn vào đây…","load":"Mở văn bản","photo":"Ảnh, hình ảnh hoặc PDF","reading":"Đang đọc tệp…","ocrError":"Chúng tôi không đọc được tệp đó. Hãy thử ảnh rõ hơn, hoặc một tệp PDF / hình ảnh có chữ dễ đọc.","newText":"Văn bản mới","progress":"{a} trên {b} từ","doneAll":"Làm tốt lắm. Bạn đã xem qua mọi từ.","hint":"Chạm vào bất kỳ từ nào để xem ý nghĩa của nó. Những từ bạn đã mở sẽ chuyển sang màu xanh lá.","loginTitle":"Đăng nhập để đọc một văn bản","loginBtn":"Đăng nhập","upgradeTitle":"Đọc một văn bản là tính năng trả phí","upgradeBtn":"Xem các gói","loading":"Đang tải…","camera":"Chụp bằng máy ảnh","upload":"Tải lên ảnh hoặc PDF"},
  "fil": {"title":"Magbasa ng teksto","sub":"I-paste ang isang teksto o kunan ng litrato ang isang pahina. Ginagawa ng Gadit ang bawat salita na isang tap, kaya puwede kang sumulong salita por salita at ipakita ang lahat ng kahulugan nito.","placeholder":"I-paste ang iyong teksto dito…","load":"Buksan ang teksto","photo":"Litrato, larawan o PDF","reading":"Binabasa ang file…","ocrError":"Hindi namin nabasa ang file na iyon. Subukan ang mas malinaw na litrato, o isang PDF / larawan na may nababasang teksto.","newText":"Bagong teksto","progress":"{a} ng {b} salita","doneAll":"Magaling. Napagdaanan mo na ang bawat salita.","hint":"I-tap ang anumang salita para makita ang mga kahulugan nito. Ang mga salitang nabuksan mo ay nagiging berde.","loginTitle":"Mag-sign in para magbasa ng teksto","loginBtn":"Mag-sign in","upgradeTitle":"Ang pagbasa ng teksto ay bayad na feature","upgradeBtn":"Tingnan ang mga plano","loading":"Naglo-load…","camera":"Kumuha gamit ang camera","upload":"Mag-upload ng larawan o PDF"},
  "af": {"title":"Lees 'n teks","sub":"Plak 'n teks of neem 'n foto van 'n bladsy. Gadit maak van elke woord 'n tik, sodat jy woord vir woord kan gaan en al sy betekenisse kan ontdek.","placeholder":"Plak jou teks hier…","load":"Maak teks oop","photo":"Foto, prent of PDF","reading":"Besig om die lêer te lees…","ocrError":"Ons kon nie daardie lêer lees nie. Probeer 'n duideliker foto, of 'n PDF / prent met leesbare teks.","newText":"Nuwe teks","progress":"{a} van {b} woorde","doneAll":"Mooi werk. Jy het deur elke woord gegaan.","hint":"Tik enige woord om sy betekenisse te sien. Woorde wat jy oopgemaak het, word groen.","loginTitle":"Meld aan om 'n teks te lees","loginBtn":"Meld aan","upgradeTitle":"Om 'n teks te lees is 'n betaalde kenmerk","upgradeBtn":"Sien planne","loading":"Besig om te laai…","camera":"Neem foto met kamera","upload":"Laai prent of PDF op"},
  "sw": {"title":"Soma maandishi","sub":"Bandika maandishi au piga picha ya ukurasa. Gadit hufanya kila neno kuwa mguso, ili uweze kwenda neno kwa neno na kufunua maana zake zote.","placeholder":"Bandika maandishi yako hapa…","load":"Fungua maandishi","photo":"Picha, taswira au PDF","reading":"Inasoma faili…","ocrError":"Hatukuweza kusoma faili hilo. Jaribu picha iliyo wazi zaidi, au PDF / taswira yenye maandishi yanayosomeka.","newText":"Maandishi mapya","progress":"{a} kati ya maneno {b}","doneAll":"Kazi nzuri. Umepitia kila neno.","hint":"Gusa neno lolote ili kuona maana zake. Maneno uliyoyafungua yanakuwa ya kijani.","loginTitle":"Ingia ili kusoma maandishi","loginBtn":"Ingia","upgradeTitle":"Kusoma maandishi ni kipengele cha kulipia","upgradeBtn":"Ona mipango","loading":"Inapakia…","camera":"Piga picha kwa kamera","upload":"Pakia picha au PDF"},
  "zh-CN": {"title":"阅读文本","sub":"粘贴一段文本或拍摄一页。Gadit 将每个词都变成可点击的，让你逐词阅读，揭示它的所有含义。","placeholder":"在此粘贴你的文本…","load":"打开文本","photo":"照片、图片或 PDF","reading":"正在读取文件…","ocrError":"我们无法读取该文件。请尝试更清晰的照片，或文字清晰可读的 PDF / 图片。","newText":"新文本","progress":"{a}/{b} 词","doneAll":"做得好。你已经看完了每一个词。","hint":"点击任意词语即可查看它的含义。你打开过的词会变成绿色。","loginTitle":"登录以阅读文本","loginBtn":"登录","upgradeTitle":"阅读文本是付费功能","upgradeBtn":"查看套餐","loading":"正在加载…","camera":"用相机拍照","upload":"上传图片或PDF"},
  "zh-TW": {"title":"閱讀文本","sub":"貼上一段文字或拍攝一頁。Gadit 讓每個詞都能點按，讓你逐詞閱讀，揭示它的所有含義。","placeholder":"在此貼上你的文字…","load":"開啟文本","photo":"相片、圖片或 PDF","reading":"正在讀取檔案…","ocrError":"我們無法讀取該檔案。請嘗試更清晰的相片，或文字清楚可讀的 PDF / 圖片。","newText":"新文本","progress":"{a}/{b} 詞","doneAll":"做得好。你已經看完每一個詞。","hint":"點按任何詞語即可查看它的含義。你開啟過的詞會變成綠色。","loginTitle":"登入以閱讀文本","loginBtn":"登入","upgradeTitle":"閱讀文本是付費功能","upgradeBtn":"查看方案","loading":"正在載入…","camera":"用相機拍照","upload":"上傳圖片或PDF"},
  "ko": {"title":"텍스트 읽기","sub":"텍스트를 붙여넣거나 페이지를 촬영하세요. Gadit은 모든 단어를 탭할 수 있게 만들어, 단어 하나하나를 짚어 가며 그 모든 뜻을 펼쳐 보여줍니다.","placeholder":"여기에 텍스트를 붙여넣으세요…","load":"텍스트 열기","photo":"사진, 이미지 또는 PDF","reading":"파일을 읽는 중…","ocrError":"해당 파일을 읽을 수 없습니다. 더 선명한 사진이나, 글자가 읽기 쉬운 PDF / 이미지로 다시 시도해 보세요.","newText":"새 텍스트","progress":"{b}개 중 {a}개 단어","doneAll":"잘하셨어요. 모든 단어를 살펴봤습니다.","hint":"아무 단어나 탭하면 그 뜻을 볼 수 있습니다. 열어 본 단어는 초록색으로 바뀝니다.","loginTitle":"텍스트를 읽으려면 로그인하세요","loginBtn":"로그인","upgradeTitle":"텍스트 읽기는 유료 기능입니다","upgradeBtn":"요금제 보기","loading":"불러오는 중…","camera":"카메라로 촬영","upload":"이미지 또는 PDF 업로드"},
  "th": {"title":"อ่านข้อความ","sub":"วางข้อความหรือถ่ายภาพหน้ากระดาษ Gadit เปลี่ยนทุกคำให้แตะได้ เพื่อให้คุณไล่อ่านทีละคำและเผยความหมายทั้งหมดของคำนั้น","placeholder":"วางข้อความของคุณที่นี่…","load":"เปิดข้อความ","photo":"ภาพถ่าย รูปภาพ หรือ PDF","reading":"กำลังอ่านไฟล์…","ocrError":"เราอ่านไฟล์นั้นไม่ได้ ลองใช้ภาพถ่ายที่ชัดขึ้น หรือ PDF / รูปภาพที่มีข้อความอ่านออกได้","newText":"ข้อความใหม่","progress":"{a}/{b} คำ","doneAll":"เยี่ยมมาก คุณดูครบทุกคำแล้ว","hint":"แตะคำใดก็ได้เพื่อดูความหมายของคำนั้น คำที่คุณเปิดแล้วจะเปลี่ยนเป็นสีเขียว","loginTitle":"ลงชื่อเข้าใช้เพื่ออ่านข้อความ","loginBtn":"ลงชื่อเข้าใช้","upgradeTitle":"การอ่านข้อความเป็นฟีเจอร์แบบเสียเงิน","upgradeBtn":"ดูแพ็กเกจ","loading":"กำลังโหลด…","camera":"ถ่ายด้วยกล้อง","upload":"อัปโหลดรูปภาพหรือ PDF"},
  "bn": {"title":"একটি লেখা পড়ুন","sub":"একটি লেখা পেস্ট করুন বা একটি পৃষ্ঠার ছবি তুলুন। Gadit প্রতিটি শব্দকে ট্যাপযোগ্য করে তোলে, যাতে আপনি শব্দে শব্দে এগিয়ে গিয়ে তার সব অর্থ দেখতে পারেন।","placeholder":"আপনার লেখা এখানে পেস্ট করুন…","load":"লেখা খুলুন","photo":"ছবি, ইমেজ বা PDF","reading":"ফাইলটি পড়া হচ্ছে…","ocrError":"আমরা সেই ফাইলটি পড়তে পারিনি। আরও স্পষ্ট একটি ছবি চেষ্টা করুন, অথবা পড়ার যোগ্য লেখাসহ একটি PDF / ইমেজ ব্যবহার করুন।","newText":"নতুন লেখা","progress":"{b}টির মধ্যে {a}টি শব্দ","doneAll":"চমৎকার। আপনি প্রতিটি শব্দ দেখে ফেলেছেন।","hint":"অর্থ দেখতে যেকোনো শব্দে ট্যাপ করুন। আপনি যে শব্দগুলো খুলেছেন সেগুলো সবুজ হয়ে যায়।","loginTitle":"একটি লেখা পড়তে সাইন ইন করুন","loginBtn":"সাইন ইন","upgradeTitle":"লেখা পড়া একটি পেইড ফিচার","upgradeBtn":"প্ল্যান দেখুন","loading":"লোড হচ্ছে…","camera":"ক্যামেরা দিয়ে ছবি তুলুন","upload":"ছবি বা PDF আপলোড করুন"},
  "da": {"title":"Læs en tekst","sub":"Indsæt en tekst, eller tag et billede af en side. Gadit gør hvert ord til et tryk, så du kan gå ord for ord og få alle dets betydninger frem.","placeholder":"Indsæt din tekst her…","load":"Åbn tekst","photo":"Foto, billede eller PDF","reading":"Læser filen…","ocrError":"Vi kunne ikke læse den fil. Prøv et tydeligere foto eller en PDF / et billede med læsbar tekst.","newText":"Ny tekst","progress":"{a} af {b} ord","doneAll":"Godt gået. Du har været igennem hvert ord.","hint":"Tryk på et hvilket som helst ord for at se dets betydninger. Ord, du har åbnet, bliver grønne.","loginTitle":"Log ind for at læse en tekst","loginBtn":"Log ind","upgradeTitle":"At læse en tekst er en betalt funktion","upgradeBtn":"Se abonnementer","loading":"Indlæser…","camera":"Tag foto med kamera","upload":"Upload billede eller PDF"},
  "hu": {"title":"Szöveg olvasása","sub":"Illessz be egy szöveget, vagy fényképezz le egy oldalt. A Gadit minden szót megérinthetővé tesz, így szóról szóra haladhatsz, és felfedheted minden jelentését.","placeholder":"Illeszd be ide a szöveged…","load":"Szöveg megnyitása","photo":"Fénykép, kép vagy PDF","reading":"A fájl beolvasása…","ocrError":"Nem tudtuk beolvasni azt a fájlt. Próbálj egy élesebb fényképet, vagy egy olvasható szöveget tartalmazó PDF / kép fájlt.","newText":"Új szöveg","progress":"{a} / {b} szó","doneAll":"Szép munka. Minden szót átnéztél.","hint":"Koppints bármelyik szóra, hogy lásd a jelentéseit. A megnyitott szavak zöldre váltanak.","loginTitle":"Jelentkezz be a szöveg olvasásához","loginBtn":"Bejelentkezés","upgradeTitle":"A szöveg olvasása fizetős funkció","upgradeBtn":"Csomagok megtekintése","loading":"Betöltés…","camera":"Fotózás kamerával","upload":"Kép vagy PDF feltöltése"},
};

function copy(lang: Lang): ReaderStrings {
  return READER_COPY[lang] ?? READER_COPY.en;
}

function fmtProgress(tpl: string, a: number, b: number): string {
  return tpl.replace("{a}", String(a)).replace("{b}", String(b));
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
  const { user, plan, loading: authLoading, promptLogin } = useAuth();
  const { lang, dir } = useLang();
  const href = useHref();
  const t = copy(lang);

  const [draft, setDraft] = useState("");
  const [text, setText] = useState("");
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());
  const [ocrState, setOcrState] = useState<"idle" | "reading" | "error">("idle");
  const cameraRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const camLabel = t.camera ?? READER_COPY.en.camera ?? "Photograph with camera";
  const uploadLabel = t.upload ?? READER_COPY.en.upload ?? "Upload image or PDF";

  const total = useMemo(() => (text ? distinctWordCount(text) : 0), [text]);
  const storageKey = useMemo(() => (text ? `gadit-reader-${hashText(text)}` : ""), [text]);

  // Load persisted progress when a text is opened.
  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      setReviewed(raw ? new Set(JSON.parse(raw) as string[]) : new Set());
    } catch { setReviewed(new Set()); }
  }, [storageKey]);

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

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;
    setOcrState("reading");
    try {
      const idToken = await user.getIdToken();
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/ocr", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
        body: fd,
      });
      const j = (await res.json().catch(() => ({}))) as { text?: string };
      if (res.ok && j.text && j.text.trim()) {
        setDraft(j.text);
        setText(j.text.trim());
        setOcrState("idle");
      } else {
        setOcrState("error");
      }
    } catch {
      setOcrState("error");
    }
  }

  const allDone = total > 0 && reviewed.size >= total;

  return (
    <div className="wordbook wb-shell-page" dir={dir}>
      <header className="wb-shell-topbar">
        <Link href={href("/")} className="wb-wordmark" dir="ltr">
          Gad<span className="wb-wordmark-it">it</span>
        </Link>
        <WbShellNav />
        <div className="wb-shell-actions">
          <ShareButton
            url="https://www.gadit.app/"
            title={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).title}
            text=""
            shareLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).shareLabel}
            copiedLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).copiedLabel}
          />
          <LangSwitch />
          {user ? <WbUserMenu /> : null}
        </div>
        {user && (
          <div className="wb-shell-mobile-identity">
            <WbUserMenu />
          </div>
        )}
        <div className="wb-shell-mobile-menu-cluster">
          <LangSwitchMobile />
          <WbShellBurger />
        </div>
      </header>

      <main style={{ maxWidth: 760, margin: "0 auto", padding: "40px 20px 96px", fontFamily: fontBody(lang) }}>
        <h1 style={{ margin: "0 0 10px", fontSize: "clamp(26px,4.5vw,36px)", fontWeight: 800, color: "var(--ink,#20272E)" }}>
          {t.title}
        </h1>
        <p style={{ margin: "0 0 26px", fontSize: 16.5, lineHeight: 1.55, color: "var(--ink-muted,#6B7280)", maxWidth: "56ch" }}>
          {t.sub}
        </p>

        {authLoading ? (
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
                  <button type="button" onClick={() => cameraRef.current?.click()} style={ghostBtn}>
                    📷 {camLabel}
                  </button>
                  <button type="button" onClick={() => uploadRef.current?.click()} style={ghostBtn}>
                    📄 {uploadLabel}
                  </button>
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
            <p style={{ margin: "0 0 14px", fontSize: 13.5, color: "var(--ink-muted,#9CA3AF)" }}>{t.hint}</p>
            <ReaderText text={text} reviewed={reviewed} onReview={markReviewed} />
          </div>
        )}
      </main>
    </div>
  );
}

// Desktop language chip — same look/behavior as the one on /notebook and
// /account (there's no shared component; each surface carries its own).
function LangSwitch() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);
  const active = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];
  return (
    <div ref={wrapRef} className="wb-lang-chip-wrap">
      <button type="button" className="wb-lang-chip" onClick={() => setOpen((v) => !v)}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" />
        </svg>
        {active.label}
      </button>
      {open && (
        <ul className="wb-lang-menu" role="listbox">
          {LANGUAGES.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                className={l.code === lang ? "is-active" : ""}
                onClick={() => { setLang(l.code as Lang); setOpen(false); }}
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
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
