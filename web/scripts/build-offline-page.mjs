// Builds public/offline.html, the page the service worker shows when there is
// no internet and the page asked for is not saved on the device (Gadi
// 2026-11-09, with the offline dictionary). It is plain HTML + JS, so it works
// with no Next.js bundle: it reads the offline dictionary straight from
// IndexedDB ("gadit-offline", same store as src/lib/offline-db.ts).
//
// UI text comes from the existing translations (i18n-v2 packs + the account
// page), plus one new line in NOT_SAVED below. Re-run after changing either:
//   node scripts/build-offline-page.mjs
// and bump CACHE_VERSION in public/sw.js, which precaches the page.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const WEB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PACKS = path.join(WEB, "src/lib/i18n-v2-packs");
const ACCOUNT = fs.readFileSync(path.join(WEB, "src/app/account/AccountClient.tsx"), "utf8");

const NOT_SAVED = {
  en: "This word isn't saved on this device yet. Connect to the internet to look it up.",
  he: "המילה הזאת עוד לא שמורה במכשיר. התחברו לאינטרנט כדי לחפש אותה.",
  ar: "هذه الكلمة غير محفوظة على هذا الجهاز بعد. اتصل بالإنترنت للبحث عنها.",
  ru: "Этого слова пока нет на устройстве. Подключитесь к интернету, чтобы найти его.",
  es: "Esta palabra aún no está guardada en este dispositivo. Conéctate a internet para buscarla.",
  pt: "Esta palavra ainda não está salva neste dispositivo. Conecte-se à internet para procurá-la.",
  fr: "Ce mot n'est pas encore enregistré sur cet appareil. Connectez-vous à internet pour le chercher.",
  de: "Dieses Wort ist noch nicht auf diesem Gerät gespeichert. Verbinde dich mit dem Internet, um es nachzuschlagen.",
  cs: "Toto slovo zatím není v zařízení uložené. Připoj se k internetu a vyhledej ho.",
  sk: "Toto slovo ešte nie je v zariadení uložené. Pripoj sa na internet a vyhľadaj ho.",
  it: "Questa parola non è ancora salvata su questo dispositivo. Connettiti a internet per cercarla.",
  ja: "この単語はまだこの端末に保存されていません。インターネットに接続して調べてください。",
  hi: "यह शब्द अभी इस डिवाइस पर सहेजा नहीं गया है। इसे खोजने के लिए इंटरनेट से जुड़ें।",
  am: "ይህ ቃል እስካሁን በዚህ መሣሪያ ላይ አልተቀመጠም። ለመፈለግ ከኢንተርኔት ጋር ይገናኙ።",
  uk: "Цього слова ще немає на пристрої. Підключіться до інтернету, щоб знайти його.",
  tr: "Bu kelime henüz bu cihaza kaydedilmedi. Aramak için internete bağlan.",
  pl: "Tego słowa nie ma jeszcze na tym urządzeniu. Połącz się z internetem, aby je wyszukać.",
  fa: "این واژه هنوز روی این دستگاه ذخیره نشده است. برای جستجوی آن به اینترنت وصل شو.",
  id: "Kata ini belum tersimpan di perangkat ini. Sambungkan ke internet untuk mencarinya.",
  nl: "Dit woord staat nog niet op dit apparaat. Maak verbinding met internet om het op te zoeken.",
  el: "Αυτή η λέξη δεν έχει αποθηκευτεί ακόμη σε αυτή τη συσκευή. Συνδέσου στο ίντερνετ για να την αναζητήσεις.",
  zu: "Leli gama alikagcinwa kule divayisi. Xhuma ku-inthanethi ukuze ulisesha.",
  vi: "Từ này chưa được lưu trên thiết bị. Hãy kết nối internet để tra cứu.",
  fil: "Hindi pa naka-save ang salitang ito sa device na ito. Kumonekta sa internet para hanapin ito.",
  af: "Hierdie woord is nog nie op hierdie toestel gestoor nie. Koppel aan die internet om dit op te soek.",
  sw: "Neno hili bado halijahifadhiwa kwenye kifaa hiki. Unganisha intaneti ili kulitafuta.",
  "zh-CN": "这个词还没有保存在这台设备上。请连接网络后查询。",
  "zh-TW": "這個詞還沒有儲存在這台裝置上。請連上網路後查詢。",
  ko: "이 단어는 아직 이 기기에 저장되지 않았어요. 인터넷에 연결해서 찾아보세요.",
  th: "คำนี้ยังไม่ได้บันทึกไว้ในอุปกรณ์นี้ เชื่อมต่ออินเทอร์เน็ตเพื่อค้นหา",
  bn: "এই শব্দটি এখনো এই ডিভাইসে সংরক্ষিত হয়নি। খুঁজতে ইন্টারনেটে যুক্ত হোন।",
  da: "Dette ord er ikke gemt på enheden endnu. Gå på internettet for at slå det op.",
  hu: "Ez a szó még nincs elmentve ezen az eszközön. Csatlakozz az internethez, hogy kikeresd.",
  xh: "Eli gama alikagcinwa kwesi sixhobo. Qhagamshela kwi-intanethi ukuze ulikhangele.",
  nso: "Lentšu le ga se la bolokwa sedirišweng se. Kgokagana le inthanete go le nyaka.",
  tn: "Lefoko le ga le ise le bolokwe mo sedirisiweng se. Golagana le inthanete go le batla.",
  st: "Lentswe lena ha le eso bolokwe sesebedisweng sena. Hokela inthaneteng ho le batla.",
  ts: "Rito leri a ri si hlayisiwa eka xitirhisiwa lexi. Hlanganisa na inthanete leswaku mi ri lava.",
  ss: "Leligama alikagcinwa kulesi sisetjentiswa. Xhumana ne-inthanethi kute ulifune.",
  ve: "Ipfi heli a li athu vhulungwa kha tshishumiswa itshi. Ṱumanani na inthanethe u itela u li ṱoḓa.",
  nr: "Ilizwi leli alikabulungwa kilesi sisetjenziswa. Hlanganisa ne-inthanethi bona ulifune.",
};

function packString(src, key) {
  const m = src.match(new RegExp(`"${key}":\\s*("(?:[^"\\\\]|\\\\.)*")`));
  return m ? JSON.parse(m[1]) : null;
}
function recordFrom(src, name) {
  const st = src.indexOf(`const ${name}: Record<Lang, string> = {`);
  const end = src.indexOf("\n};", st);
  const out = {};
  for (const m of src.slice(st, end).matchAll(/^\s*"?([a-zA-Z-]+)"?:\s*("(?:[^"\\]|\\.)*"),?\s*$/gm)) out[m[1]] = JSON.parse(m[2]);
  return out;
}
const available = recordFrom(ACCOUNT, "OFFLINE_AVAILABLE_COPY");
const unit = recordFrom(ACCOUNT, "WORDS_UNIT_COPY");
const en = fs.readFileSync(path.join(PACKS, "en.ts"), "utf8");
const KEYS = { title: "offlinePackHeader", placeholder: "searchPlaceholderHome", origin: "wordOriginEyebrow", idioms: "idiomsEyebrow" };
const T = {};
for (const f of fs.readdirSync(PACKS)) {
  const lang = f.replace(/\.ts$/, "");
  const src = fs.readFileSync(path.join(PACKS, f), "utf8");
  const t = {};
  for (const [k, key] of Object.entries(KEYS)) t[k] = packString(src, key) ?? packString(en, key);
  t.available = available[lang] ?? available.en;
  t.unit = unit[lang] ?? unit.en;
  t.notSaved = NOT_SAVED[lang] ?? NOT_SAVED.en;
  T[lang] = t;
}
const missing = Object.entries(T).filter(([, t]) => Object.values(t).some((v) => !v)).map(([l]) => l);
if (missing.length) throw new Error("missing strings for " + missing.join(","));

const template = fs.readFileSync(path.join(WEB, "scripts/offline-page.template.html"), "utf8");
fs.writeFileSync(path.join(WEB, "public/offline.html"), template.replace("__STRINGS__", JSON.stringify(T)));
console.log("public/offline.html written,", Object.keys(T).length, "languages");
