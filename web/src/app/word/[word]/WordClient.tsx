"use client";

/**
 * WordClient — the result page.
 *
 * Streams from /api/define and renders with ResultView on the dark
 * navy stage. Handles:
 *   - 401 → opens login modal (search requires sign-in)
 *   - 429 → quota card with Upgrade CTA
 *   - SSE delta events → progressive partial render (skeleton-friendly)
 *   - SSE done event → final result + cache flag
 *
 * Image generation, save-to-notebook, share, action tile clicks all
 * wire to existing API endpoints. Compose / Quiz / Report each open a
 * modal layered above the result.
 */

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { parse as parsePartialJson, Allow } from "partial-json";
import Link from "next/link";

import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { detectWrongKeyboard } from "@/lib/keyboard-layout";
import { v2 } from "@/lib/i18n-v2";
import { ShareButton, APP_SHARE_COPY } from "@/components/ShareButton";
import { LangSwitchMobile } from "@/components/LangSwitchMobile";
import { WbShellNav, WbShellBurger } from "@/components/design/WbShellChrome";
import { StartFreeCTA } from "@/components/StartFreeCTA";
import { GadVerbStamp } from "@/components/GadVerbStamp";
import { WbUserMenu } from "@/components/design/WbUserMenu";
import { getWordSet, curatedDef } from "@/lib/word-sets";
import { KidsModeToggle } from "@/components/KidsModeToggle";
import { AppearancePicker } from "@/components/AppearancePicker";
import VoiceInput from "@/components/VoiceInput";
import { useHref, wordPath } from "@/lib/href";
import { getCachedWord, setCachedWord, setPinned as setPinnedDb } from "@/lib/offline-db";
import { UpgradeModal, type UpgradeTrigger } from "@/components/UpgradeModal";
import { LANGUAGES, langNameIn, type Lang } from "@/lib/i18n";
import { track } from "@/lib/track";
import { useKidsMode } from "@/lib/use-kids-mode";

import { MarketingHeader } from "@/components/design/MarketingHeader";
import { ClassroomTopbar } from "@/components/design/ClassroomTopbar";
import { skinStyleVars, readStashedSkin } from "@/lib/school-skin";
import { HomeFooter } from "@/components/design/home";
import { ComposeModalV2 } from "@/components/design/ComposeModalV2";
import { QuizModalV2 } from "@/components/design/QuizModalV2";
import { WordGameModal } from "@/components/design/WordGameModal";
import {
  ReportModalV2,
  type ReportContext,
} from "@/components/design/ReportModalV2";
import {
  ResultView,
  type WordResult,
  type Plan,
} from "@/components/design/result";

// ─── Anonymous search counter ──────────────────────────────────
// Local-only mirror of the server-side IP quota. Pure UX hint —
// drives the "X searches left today" banner. The server is the
// source of truth (it'll 429 when the IP cap is hit regardless of
// what localStorage says); this counter just tells us when to
// surface the heads-up before that happens.
//
// LIFETIME (not daily) anon allowance, per device. Gadi 2026-09-06: after
// 3 total searches from the same phone (cache hit OR miss, never resetting by
// day), the visitor hits a HARD wall and must register (free). This is the
// primary enforcement — the server still caps cache-MISS generations by IP as
// a cost backstop. Clearing localStorage / incognito resets it; that's an
// accepted trade-off (real visitors won't, and signup is free).
//
// localStorage layout: { count: 3 }  (a stray legacy `date` field is ignored).
// Present mode (schools) labels. Kept local rather than in i18n-v2 so we
// don't touch 30+ language blocks for two strings on a schools-only
// control; anything missing falls back to English, same as the other
// local maps in the chrome. Hebrew is singular and gender-neutral.
const PRESENT_LABELS: Record<string, { enter: string; exit: string; hint: string }> = {
  he: { enter: "מצב הקרנה", exit: "יציאה ממצב הקרנה", hint: "תצוגה נקייה למסך הכיתה" },
  en: { enter: "Present mode", exit: "Exit present mode", hint: "A clean view for the classroom screen" },
  ar: { enter: "وضع العرض", exit: "الخروج من وضع العرض", hint: "عرض نظيف لشاشة الصف" },
  ru: { enter: "Режим показа", exit: "Выйти из режима показа", hint: "Чистый вид для экрана класса" },
  es: { enter: "Modo presentación", exit: "Salir del modo presentación", hint: "Una vista limpia para la pantalla del aula" },
  pt: { enter: "Modo apresentação", exit: "Sair do modo apresentação", hint: "Uma vista limpa para o ecrã da turma" },
  fr: { enter: "Mode présentation", exit: "Quitter le mode présentation", hint: "Une vue épurée pour l'écran de la classe" },
  de: { enter: "Präsentationsmodus", exit: "Präsentationsmodus beenden", hint: "Eine klare Ansicht für den Klassenbildschirm" },
  it: { enter: "Modalità presentazione", exit: "Esci dalla modalità presentazione", hint: "Una vista pulita per lo schermo della classe" },
  cs: { enter: "Režim promítání", exit: "Ukončit režim promítání", hint: "Čistý pohled pro školní obrazovku" },
  sk: { enter: "Režim premietania", exit: "Ukončiť režim premietania", hint: "Čistý pohľad pre školnú obrazovku" },
  ja: { enter: "プレゼンモード", exit: "プレゼンモードを終了", hint: "教室の画面向けのすっきり表示" },
  hi: { enter: "प्रस्तुति मोड", exit: "प्रस्तुति मोड से बाहर निकलें", hint: "कक्षा की स्क्रीन के लिए साफ़ दृश्य" },
  am: { enter: "የማቅረቢያ ሁነታ", exit: "ከማቅረቢያ ሁነታ ውጣ", hint: "ለክፍል ስክሪን ንጹህ እይታ" },
  uk: { enter: "Режим показу", exit: "Вийти з режиму показу", hint: "Чистий вигляд для екрана в класі" },
  tr: { enter: "Sunum modu", exit: "Sunum modundan çık", hint: "Sınıf ekranı için sade bir görünüm" },
  pl: { enter: "Tryb prezentacji", exit: "Zakończ tryb prezentacji", hint: "Przejrzysty widok na ekran w klasie" },
  fa: { enter: "حالت نمایش", exit: "خروج از حالت نمایش", hint: "نمایی ساده برای صفحه کلاس" },
  id: { enter: "Mode presentasi", exit: "Keluar dari mode presentasi", hint: "Tampilan bersih untuk layar kelas" },
  nl: { enter: "Presentatiemodus", exit: "Presentatiemodus verlaten", hint: "Een rustige weergave voor het klasscherm" },
  el: { enter: "Λειτουργία παρουσίασης", exit: "Έξοδος από την παρουσίαση", hint: "Καθαρή προβολή για την οθόνη της τάξης" },
  zu: { enter: "Imodi yokwethula", exit: "Phuma kumodi yokwethula", hint: "Ukubuka okuhlanzekile kwesikrini sekilasi" },
  vi: { enter: "Chế độ trình chiếu", exit: "Thoát chế độ trình chiếu", hint: "Giao diện gọn gàng cho màn hình lớp học" },
  fil: { enter: "Mode ng presentasyon", exit: "Lumabas sa mode ng presentasyon", hint: "Malinis na view para sa screen ng silid-aralan" },
  af: { enter: "Aanbiedingsmodus", exit: "Verlaat aanbiedingsmodus", hint: "'n Skoon aansig vir die klasskerm" },
  sw: { enter: "Hali ya uwasilishaji", exit: "Toka kwenye hali ya uwasilishaji", hint: "Mwonekano safi kwa skrini ya darasa" },
  "zh-CN": { enter: "演示模式", exit: "退出演示模式", hint: "适合教室屏幕的简洁视图" },
  "zh-TW": { enter: "簡報模式", exit: "退出簡報模式", hint: "適合教室螢幕的簡潔畫面" },
  ko: { enter: "발표 모드", exit: "발표 모드 끝내기", hint: "교실 화면용 깔끔한 보기" },
  th: { enter: "โหมดนำเสนอ", exit: "ออกจากโหมดนำเสนอ", hint: "มุมมองที่สะอาดตาสำหรับจอในห้องเรียน" },
  bn: { enter: "উপস্থাপনা মোড", exit: "উপস্থাপনা মোড থেকে বের হন", hint: "শ্রেণিকক্ষের স্ক্রিনের জন্য পরিষ্কার দৃশ্য" },
  da: { enter: "Præsentationstilstand", exit: "Afslut præsentationstilstand", hint: "En ren visning til klassens skærm" },
  hu: { enter: "Bemutató mód", exit: "Kilépés a bemutató módból", hint: "Letisztult nézet az osztálytermi kijelzőre" },
};
function presentLabels(lang: string) {
  return PRESENT_LABELS[lang] ?? PRESENT_LABELS.en;
}

// ─── Inline UI copy (all 33 UI languages, English fallback) ───────
type QuotaFn = (u?: number, l?: number) => string;
const IMAGE_QUOTA_COPY: Record<string, QuotaFn> = {
  en: (u, l) => `You've used your monthly image quota (${u}/${l}). Resets at the start of next month.`,
  he: (u, l) => `הגעת למגבלת התמונות החודשית (${u}/${l}). מתאפס בתחילת החודש הבא.`,
  ar: (u, l) => `وصلت إلى حد الصور الشهري (${u}/${l}). يُعاد ضبطه في بداية الشهر القادم.`,
  ru: (u, l) => `Месячный лимит изображений исчерпан (${u}/${l}). Сбрасывается в начале следующего месяца.`,
  es: (u, l) => `Has alcanzado el límite mensual de imágenes (${u}/${l}). Se reinicia el próximo mes.`,
  pt: (u, l) => `Você atingiu o limite mensal de imagens (${u}/${l}). Reinicia no próximo mês.`,
  fr: (u, l) => `Vous avez atteint la limite mensuelle d'images (${u}/${l}). Réinitialisation au mois prochain.`,
  de: (u, l) => `Du hast das monatliche Bildlimit erreicht (${u}/${l}). Wird zum Monatsanfang zurückgesetzt.`,
  cs: (u, l) => `Dosáhl jsi měsíčního limitu obrázků (${u}/${l}). Resetuje se začátkem dalšího měsíce.`,
  sk: (u, l) => `Dosiahol si mesačný limit obrázkov (${u}/${l}). Resetuje sa začiatkom ďalšieho mesiaca.`,
  it: (u, l) => `Hai raggiunto il limite mensile di immagini (${u}/${l}). Si resetta all'inizio del prossimo mese.`,
  ja: (u, l) => `今月の画像枚数の上限に達しました (${u}/${l})。来月初めにリセットされます。`,
  hi: (u, l) => `आप इस महीने की तस्वीर सीमा तक पहुँच गए (${u}/${l})। अगले महीने की शुरुआत में रीसेट होगी।`,
  am: (u, l) => `የዚህ ወር የምስል ገደብ ተሞልቷል (${u}/${l})። በሚቀጥለው ወር መጀመሪያ እንደገና ይጀምራል።`,
  uk: (u, l) => `Місячний ліміт зображень вичерпано (${u}/${l}). Він оновиться на початку наступного місяця.`,
  tr: (u, l) => `Aylık resim sınırına ulaştın (${u}/${l}). Gelecek ayın başında sıfırlanır.`,
  pl: (u, l) => `Miesięczny limit obrazków został wykorzystany (${u}/${l}). Odnowi się na początku następnego miesiąca.`,
  fa: (u, l) => `سقف ماهانهٔ تصویرها پر شده است (${u}/${l}). اول ماه بعد دوباره شروع می‌شود.`,
  id: (u, l) => `Batas gambar bulanan sudah tercapai (${u}/${l}). Akan diatur ulang di awal bulan depan.`,
  nl: (u, l) => `Je hebt de maandelijkse limiet voor afbeeldingen bereikt (${u}/${l}). Die wordt begin volgende maand weer aangevuld.`,
  el: (u, l) => `Έφτασες το μηνιαίο όριο εικόνων (${u}/${l}). Μηδενίζεται στην αρχή του επόμενου μήνα.`,
  zu: (u, l) => `Usufinyelele umkhawulo wezithombe wale nyanga (${u}/${l}). Uzoqala kabusha ekuqaleni kwenyanga ezayo.`,
  vi: (u, l) => `Bạn đã dùng hết số hình ảnh của tháng này (${u}/${l}). Hạn mức sẽ được làm mới vào đầu tháng sau.`,
  fil: (u, l) => `Naabot mo na ang buwanang limitasyon ng larawan (${u}/${l}). Magre-reset ito sa simula ng susunod na buwan.`,
  af: (u, l) => `Jy het die maandelikse beeldlimiet bereik (${u}/${l}). Dit begin weer aan die begin van volgende maand.`,
  sw: (u, l) => `Umefikia kikomo cha picha cha mwezi huu (${u}/${l}). Kitaanza upya mwanzoni mwa mwezi ujao.`,
  "zh-CN": (u, l) => `本月的图片数量已达上限 (${u}/${l})。下个月初会重置。`,
  "zh-TW": (u, l) => `本月的圖片數量已達上限 (${u}/${l})。下個月初會重置。`,
  ko: (u, l) => `이번 달 이미지 한도에 도달했어요 (${u}/${l}). 다음 달 초에 초기화돼요.`,
  th: (u, l) => `ใช้รูปภาพครบโควตาของเดือนนี้แล้ว (${u}/${l}) จะรีเซ็ตเมื่อต้นเดือนหน้า`,
  bn: (u, l) => `এই মাসের ছবির সীমা পূর্ণ হয়েছে (${u}/${l})। পরের মাসের শুরুতে আবার চালু হবে।`,
  da: (u, l) => `Du har brugt månedens billedgrænse (${u}/${l}). Den nulstilles i starten af næste måned.`,
  hu: (u, l) => `Elérted a havi képkeretet (${u}/${l}). A következő hónap elején újraindul.`,
};

const IMAGE_FAILED_COPY: Record<string, string> = {
  en: "Could not create the image. Try again in a moment.",
  he: "התמונה נכשלה ביצירה. נסו שוב בעוד רגע.",
  ar: "فشل إنشاء الصورة. حاول مرة أخرى بعد قليل.",
  ru: "Не удалось создать изображение. Попробуйте ещё раз.",
  es: "No se pudo crear la imagen. Inténtalo de nuevo.",
  pt: "Não foi possível gerar a imagem. Tente novamente.",
  fr: "L'image n'a pas pu être créée. Réessayez.",
  de: "Bild konnte nicht erstellt werden. Versuche es noch einmal.",
  cs: "Obrázek se nepodařilo vytvořit. Zkus to znovu.",
  sk: "Obrázok sa nepodarilo vytvoriť. Skús to znova.",
  it: "Impossibile creare l'immagine. Riprova tra un momento.",
  ja: "画像を生成できませんでした。少し待ってもう一度お試しください。",
  hi: "तस्वीर नहीं बन पाई। कुछ देर में फिर कोशिश करें।",
  am: "ምስሉን መፍጠር አልተቻለም። ትንሽ ቆይተው እንደገና ይሞክሩ።",
  uk: "Не вдалося створити зображення. Спробуйте ще раз.",
  tr: "Resim oluşturulamadı. Birazdan tekrar dene.",
  pl: "Nie udało się utworzyć obrazka. Spróbuj ponownie za chwilę.",
  fa: "ساختن تصویر ممکن نشد. کمی بعد دوباره امتحان کنید.",
  id: "Gambar tidak bisa dibuat. Coba lagi sebentar lagi.",
  nl: "De afbeelding kon niet worden gemaakt. Probeer het zo nog eens.",
  el: "Δεν ήταν δυνατή η δημιουργία της εικόνας. Δοκίμασε ξανά σε λίγο.",
  zu: "Asikwazanga ukwenza isithombe. Zama futhi emva kwesikhashana.",
  vi: "Không tạo được hình ảnh. Hãy thử lại sau giây lát.",
  fil: "Hindi nagawa ang larawan. Subukan ulit mamaya.",
  af: "Die prent kon nie geskep word nie. Probeer weer oor 'n oomblik.",
  sw: "Imeshindikana kutengeneza picha. Jaribu tena baada ya muda mfupi.",
  "zh-CN": "无法生成图片，请稍后再试。",
  "zh-TW": "無法產生圖片，請稍後再試。",
  ko: "이미지를 만들 수 없었어요. 잠시 후 다시 시도해 주세요.",
  th: "สร้างรูปภาพไม่สำเร็จ ลองใหม่อีกครั้งในอีกสักครู่",
  bn: "ছবিটি তৈরি করা যায়নি। একটু পরে আবার চেষ্টা করুন।",
  da: "Billedet kunne ikke laves. Prøv igen om lidt.",
  hu: "Nem sikerült elkészíteni a képet. Próbáld újra egy kicsit később.",
};

const GENERIC_ERROR_COPY: Record<string, string> = {
  en: "Something went wrong. Try again.",
  he: "משהו השתבש. נסו שוב.",
  ar: "حدث خطأ ما. حاول مرة أخرى.",
  ru: "Что-то пошло не так. Попробуйте ещё раз.",
  es: "Algo salió mal. Inténtalo de nuevo.",
  pt: "Algo deu errado. Tente novamente.",
  fr: "Une erreur s'est produite. Réessayez.",
  de: "Etwas ist schiefgelaufen. Versuche es erneut.",
  cs: "Něco se pokazilo. Zkus to znovu.",
  sk: "Niečo sa pokazilo. Skús to znova.",
  it: "Qualcosa è andato storto. Riprova.",
  ja: "問題が発生しました。もう一度お試しください。",
  hi: "कुछ ग़लत हुआ। फिर से कोशिश करें।",
  am: "የሆነ ችግር ተፈጥሯል። እንደገና ይሞክሩ።",
  uk: "Щось пішло не так. Спробуйте ще раз.",
  tr: "Bir şeyler ters gitti. Tekrar dene.",
  pl: "Coś poszło nie tak. Spróbuj ponownie.",
  fa: "مشکلی پیش آمد. دوباره امتحان کنید.",
  id: "Terjadi kesalahan. Coba lagi.",
  nl: "Er ging iets mis. Probeer het opnieuw.",
  el: "Κάτι πήγε στραβά. Δοκίμασε ξανά.",
  zu: "Kukhona okungahambanga kahle. Zama futhi.",
  vi: "Đã xảy ra lỗi. Hãy thử lại.",
  fil: "May nangyaring mali. Subukan ulit.",
  af: "Iets het skeefgeloop. Probeer weer.",
  sw: "Hitilafu imetokea. Jaribu tena.",
  "zh-CN": "出了点问题，请再试一次。",
  "zh-TW": "發生了一點問題，請再試一次。",
  ko: "문제가 생겼어요. 다시 시도해 주세요.",
  th: "เกิดข้อผิดพลาด ลองใหม่อีกครั้ง",
  bn: "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
  da: "Noget gik galt. Prøv igen.",
  hu: "Valami hiba történt. Próbáld újra.",
};

const NETWORK_LOST_COPY: Record<string, string> = {
  en: "Lost network connection. Check your internet and try again.",
  he: "החיבור לאינטרנט אבד. בדקו את הרשת ונסו שוב.",
  ar: "انقطع الاتصال بالإنترنت. تحقق من الشبكة وحاول مرة أخرى.",
  ru: "Пропало подключение к интернету. Проверьте сеть и попробуйте ещё раз.",
  es: "Se perdió la conexión a internet. Revisa la red e inténtalo de nuevo.",
  pt: "A conexão com a internet caiu. Verifique a rede e tente novamente.",
  fr: "Connexion internet perdue. Vérifiez le réseau et réessayez.",
  de: "Die Internetverbindung ist weg. Prüfe das Netzwerk und versuche es erneut.",
  cs: "Ztratilo se připojení k internetu. Zkontroluj síť a zkus to znovu.",
  sk: "Stratilo sa pripojenie k internetu. Skontroluj sieť a skús to znova.",
  it: "Connessione internet persa. Controlla la rete e riprova.",
  ja: "インターネット接続が切れました。ネットワークを確認してやり直してください。",
  hi: "इंटरनेट कनेक्शन टूट गया। नेटवर्क जाँचें और फिर कोशिश करें।",
  am: "የኢንተርኔት ግንኙነት ተቋርጧል። ኔትወርኩን አረጋግጠው እንደገና ይሞክሩ።",
  uk: "Зникло з'єднання з інтернетом. Перевірте мережу й спробуйте ще раз.",
  tr: "İnternet bağlantısı koptu. Ağını kontrol edip tekrar dene.",
  pl: "Utracono połączenie z internetem. Sprawdź sieć i spróbuj ponownie.",
  fa: "اتصال اینترنت قطع شد. شبکه را بررسی کنید و دوباره امتحان کنید.",
  id: "Koneksi internet terputus. Periksa jaringan lalu coba lagi.",
  nl: "De internetverbinding is weggevallen. Controleer je netwerk en probeer het opnieuw.",
  el: "Χάθηκε η σύνδεση στο διαδίκτυο. Έλεγξε το δίκτυο και δοκίμασε ξανά.",
  zu: "Uxhumano lwe-inthanethi lunqamukile. Hlola inethiwekhi bese uzama futhi.",
  vi: "Mất kết nối internet. Hãy kiểm tra mạng và thử lại.",
  fil: "Nawala ang koneksyon sa internet. Tingnan ang network at subukan ulit.",
  af: "Die internetverbinding is verloor. Kyk na jou netwerk en probeer weer.",
  sw: "Muunganisho wa intaneti umekatika. Angalia mtandao kisha ujaribu tena.",
  "zh-CN": "网络连接已断开。请检查网络后再试一次。",
  "zh-TW": "網路連線已中斷。請檢查網路後再試一次。",
  ko: "인터넷 연결이 끊겼어요. 네트워크를 확인하고 다시 시도해 주세요.",
  th: "การเชื่อมต่ออินเทอร์เน็ตขาดหาย ตรวจสอบเครือข่ายแล้วลองใหม่อีกครั้ง",
  bn: "ইন্টারনেট সংযোগ বিচ্ছিন্ন হয়েছে। নেটওয়ার্ক দেখে আবার চেষ্টা করুন।",
  da: "Internetforbindelsen blev afbrudt. Tjek netværket og prøv igen.",
  hu: "Megszakadt az internetkapcsolat. Ellenőrizd a hálózatot, és próbáld újra.",
};

const SAVE_FAILED_COPY: Record<string, string> = {
  en: "Save failed, try again",
  he: "השמירה נכשלה, נסו שוב",
  ar: "فشل الحفظ, حاول مرة أخرى",
  ru: "Не удалось сохранить, попробуйте снова",
  es: "Error al guardar, inténtalo de nuevo",
  pt: "Falha ao salvar, tente novamente",
  fr: "Échec de l'enregistrement, réessayez",
  de: "Speichern fehlgeschlagen, erneut versuchen",
  cs: "Uložení selhalo, zkuste to znovu",
  sk: "Uloženie zlyhalo, skús to znova",
  it: "Salvataggio fallito, riprova",
  ja: "保存に失敗しました。もう一度お試しください",
  hi: "सहेजना असफल, फिर से कोशिश करें",
  am: "ማስቀመጥ አልተሳካም፣ እንደገና ይሞክሩ",
  uk: "Не вдалося зберегти, спробуйте ще раз",
  tr: "Kaydedilemedi, tekrar dene",
  pl: "Nie udało się zapisać, spróbuj ponownie",
  fa: "ذخیره نشد، دوباره امتحان کنید",
  id: "Gagal menyimpan, coba lagi",
  nl: "Opslaan mislukt, probeer het opnieuw",
  el: "Η αποθήκευση απέτυχε, δοκίμασε ξανά",
  zu: "Ukulondoloza kwehlulekile, zama futhi",
  vi: "Lưu không thành công, hãy thử lại",
  fil: "Hindi na-save, subukan ulit",
  af: "Stoor het misluk, probeer weer",
  sw: "Imeshindikana kuhifadhi, jaribu tena",
  "zh-CN": "保存失败，请重试",
  "zh-TW": "儲存失敗，請重試",
  ko: "저장하지 못했어요. 다시 시도해 주세요",
  th: "บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง",
  bn: "সংরক্ষণ করা যায়নি, আবার চেষ্টা করুন",
  da: "Gemning mislykkedes, prøv igen",
  hu: "A mentés nem sikerült, próbáld újra",
};

const SEARCH_DICTIONARY_COPY: Record<string, string> = {
  en: "Search dictionary",
  he: "חיפוש במילון",
  ar: "البحث في القاموس",
  ru: "Поиск в словаре",
  es: "Buscar en el diccionario",
  pt: "Pesquisar no dicionário",
  fr: "Rechercher dans le dictionnaire",
  de: "Im Wörterbuch suchen",
  cs: "Hledat ve slovníku",
  sk: "Hľadať v slovníku",
  it: "Cerca nel dizionario",
  ja: "辞書で検索",
  hi: "शब्दकोश में खोजें",
  am: "መዝገበ ቃላት ውስጥ ፈልግ",
  uk: "Пошук у словнику",
  tr: "Sözlükte ara",
  pl: "Szukaj w słowniku",
  fa: "جستجو در فرهنگ لغت",
  id: "Cari di kamus",
  nl: "Zoeken in woordenboek",
  el: "Αναζήτηση στο λεξικό",
  zu: "Sesha kusichazamazwi",
  vi: "Tra từ điển",
  fil: "Maghanap sa diksyunaryo",
  af: "Soek in woordeboek",
  sw: "Tafuta kamusini",
  "zh-CN": "查词典",
  "zh-TW": "查字典",
  ko: "사전 검색",
  th: "ค้นหาในพจนานุกรม",
  bn: "অভিধানে খুঁজুন",
  da: "Søg i ordbogen",
  hu: "Keresés a szótárban",
};

// Typo banner: {s1}<strong>{word}</strong>{s2} · <Link>{q1}“{typed}”{q2}</Link>
type TypoCopy = { s1: string; s2: string; q1: string; q2: string };
const TYPO_BANNER_COPY: Record<string, TypoCopy> = {
  en: { s1: "Showing results for ", s2: "", q1: "Search instead for ", q2: "" },
  he: { s1: "מציג תוצאות עבור ", s2: "", q1: "חפש בכל זאת את ", q2: "" },
  ar: { s1: "عرض نتائج لـ ", s2: "", q1: "ابحث بدلاً من ذلك عن ", q2: "" },
  ru: { s1: "Результаты для ", s2: "", q1: "Искать вместо этого ", q2: "" },
  es: { s1: "Mostrando resultados de ", s2: "", q1: "Buscar en su lugar ", q2: "" },
  pt: { s1: "Mostrando resultados para ", s2: "", q1: "Pesquisar por ", q2: "" },
  fr: { s1: "Résultats pour ", s2: "", q1: "Rechercher plutôt ", q2: "" },
  de: { s1: "Ergebnisse für ", s2: "", q1: "Stattdessen suchen nach ", q2: "" },
  cs: { s1: "Zobrazeny výsledky pro ", s2: "", q1: "Hledat místo toho ", q2: "" },
  sk: { s1: "Zobrazujú sa výsledky pre ", s2: "", q1: "Hľadať namiesto toho ", q2: "" },
  it: { s1: "Risultati per ", s2: "", q1: "Cerca invece ", q2: "" },
  ja: { s1: "", s2: " の結果を表示しています", q1: "代わりに ", q2: " を検索" },
  hi: { s1: "", s2: " के परिणाम दिखा रहे हैं", q1: "इसके बजाय ", q2: " खोजें" },
  am: { s1: "የሚታዩት ውጤቶች: ", s2: "", q1: "በምትኩ ", q2: " ፈልግ" },
  uk: { s1: "Результати для ", s2: "", q1: "Шукати натомість ", q2: "" },
  tr: { s1: "", s2: " için sonuçlar gösteriliyor", q1: "Bunun yerine ", q2: " ara" },
  pl: { s1: "Wyniki dla ", s2: "", q1: "Szukaj zamiast tego ", q2: "" },
  fa: { s1: "نمایش نتایج برای ", s2: "", q1: "جستجوی ", q2: " به‌جای آن" },
  id: { s1: "Menampilkan hasil untuk ", s2: "", q1: "Cari ", q2: " sebagai gantinya" },
  nl: { s1: "Resultaten voor ", s2: "", q1: "Zoek in plaats daarvan naar ", q2: "" },
  el: { s1: "Αποτελέσματα για ", s2: "", q1: "Αναζήτηση αντί γι' αυτό για ", q2: "" },
  zu: { s1: "Imiphumela ye: ", s2: "", q1: "Sesha esikhundleni salokho: ", q2: "" },
  vi: { s1: "Đang hiển thị kết quả cho ", s2: "", q1: "Vẫn tìm ", q2: "" },
  fil: { s1: "Ipinapakita ang resulta para sa ", s2: "", q1: "Hanapin na lang ang ", q2: "" },
  af: { s1: "Wys resultate vir ", s2: "", q1: "Soek eerder na ", q2: "" },
  sw: { s1: "Inaonyesha matokeo ya ", s2: "", q1: "Tafuta badala yake ", q2: "" },
  "zh-CN": { s1: "正在显示 ", s2: " 的结果", q1: "仍然搜索 ", q2: "" },
  "zh-TW": { s1: "正在顯示 ", s2: " 的結果", q1: "仍然搜尋 ", q2: "" },
  ko: { s1: "", s2: " 검색 결과를 보여 드려요", q1: "대신 ", q2: " 검색하기" },
  th: { s1: "แสดงผลลัพธ์สำหรับ ", s2: "", q1: "ค้นหา ", q2: " แทน" },
  bn: { s1: "", s2: " এর ফলাফল দেখানো হচ্ছে", q1: "এর বদলে ", q2: " খুঁজুন" },
  da: { s1: "Viser resultater for ", s2: "", q1: "Søg i stedet efter ", q2: "" },
  hu: { s1: "Találatok erre: ", s2: "", q1: "Keresés inkább erre: ", q2: "" },
};

const BACK_TO_COPY: Record<string, string> = {
  en: "Back to ",
  he: "חזרה אל ",
  ar: "العودة إلى ",
  ru: "Назад к ",
  es: "Volver a ",
  pt: "Voltar a ",
  fr: "Retour à ",
  de: "Zurück zu ",
  cs: "Zpět na ",
  sk: "Späť na ",
  it: "Torna a ",
  ja: " に戻る ",
  hi: " पर वापस ",
  am: "ተመለስ: ",
  uk: "Назад до ",
  tr: "Geri dön: ",
  pl: "Wróć do ",
  fa: "بازگشت به ",
  id: "Kembali ke ",
  nl: "Terug naar ",
  el: "Επιστροφή σε ",
  zu: "Buyela ku ",
  vi: "Quay lại ",
  fil: "Bumalik sa ",
  af: "Terug na ",
  sw: "Rudi kwa ",
  "zh-CN": "返回 ",
  "zh-TW": "返回 ",
  ko: "돌아가기: ",
  th: "กลับไปที่ ",
  bn: "ফিরে যান: ",
  da: "Tilbage til ",
  hu: "Vissza ide: ",
};

const CLOSE_COPY: Record<string, string> = {
  en: "Close", he: "סגור", ar: "إغلاق", ru: "Закрыть", es: "Cerrar", pt: "Fechar",
  fr: "Fermer", de: "Schließen", cs: "Zavřít", sk: "Zavrieť", it: "Chiudi", ja: "閉じる",
  hi: "बंद करें", am: "ዝጋ", uk: "Закрити", tr: "Kapat", pl: "Zamknij", fa: "بستن",
  id: "Tutup", nl: "Sluiten", el: "Κλείσιμο", zu: "Vala", vi: "Đóng", fil: "Isara",
  af: "Maak toe", sw: "Funga", "zh-CN": "关闭", "zh-TW": "關閉", ko: "닫기", th: "ปิด",
  bn: "বন্ধ করুন", da: "Luk", hu: "Bezárás",
};

const PREPARING_PICTURE_COPY: Record<string, string> = {
  en: "Preparing a picture...",
  he: "מכינים תמונה...",
  ar: "نجهّز صورة...",
  ru: "Готовим картинку...",
  es: "Preparando una imagen...",
  pt: "Preparando uma imagem...",
  fr: "Préparation d'une image...",
  de: "Bild wird vorbereitet...",
  cs: "Připravujeme obrázek...",
  sk: "Pripravujeme obrázok...",
  it: "Stiamo preparando un'immagine...",
  ja: "画像を準備しています...",
  hi: "तस्वीर तैयार कर रहे हैं...",
  am: "ምስል እያዘጋጀን ነው...",
  uk: "Готуємо картинку...",
  tr: "Resim hazırlanıyor...",
  pl: "Przygotowujemy obrazek...",
  fa: "در حال آماده کردن تصویر...",
  id: "Menyiapkan gambar...",
  nl: "We maken een afbeelding klaar...",
  el: "Ετοιμάζουμε μια εικόνα...",
  zu: "Silungiselela isithombe...",
  vi: "Đang chuẩn bị hình ảnh...",
  fil: "Inihahanda ang larawan...",
  af: "Ons berei 'n prent voor...",
  sw: "Tunaandaa picha...",
  "zh-CN": "正在准备图片...",
  "zh-TW": "正在準備圖片...",
  ko: "그림을 준비하고 있어요...",
  th: "กำลังเตรียมรูปภาพ...",
  bn: "ছবি তৈরি করা হচ্ছে...",
  da: "Vi gør et billede klar...",
  hu: "Készítjük a képet...",
};

function pick<T>(map: Record<string, T>, lang: string): T {
  return map[lang] ?? map.en;
}

const ANON_COUNTER_KEY = "gadit-anon-searches";
const ANON_LIFETIME_LIMIT = 3;

function readAnonCounter(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(ANON_COUNTER_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as { count?: number };
    return Number(parsed.count) || 0;
  } catch {
    return 0;
  }
}

function bumpAnonCounter(): number {
  if (typeof window === "undefined") return 0;
  const next = readAnonCounter() + 1;
  try {
    window.localStorage.setItem(ANON_COUNTER_KEY, JSON.stringify({ count: next }));
  } catch {
    /* localStorage full / blocked, silent */
  }
  return next;
}

// SoftWall — friendly "you've used your free searches" page that
// replaces the result card when the server returns 429. Variants:
//   nextStep="signup"  → anonymous visitor; CTA is sign-up (5/day → 20/day)
//   nextStep="upgrade" → signed-in basic user; CTA is upgrade to Clear
// Both variants use the same warm-paper card layout + electric-blue
// CTA so the visual signature stays consistent with the rest of the
// product — this is intentional: a stranger-feeling page would
// trigger "wait, is this a paywall trick?" doubt.
function SoftWall({
  nextStep,
  lang,
  onSignUp,
}: {
  nextStep: "signup" | "upgrade";
  lang: import("@/lib/i18n").Lang;
  onSignUp: () => void;
}) {
  const href = useHref();
  const isSignup = nextStep === "signup";
  // Funnel event (council verdict 2026-07-08): every wall impression
  // is counted so "how many see the wall / how many sign up from it"
  // is measurable before and after the 5→2 quota change.
  useEffect(() => {
    track("softwall_shown", { variant: nextStep, lang });
  }, [nextStep, lang]);
  return (
    <div
      className="wb-softwall"
      style={{
        padding: "clamp(32px, 4vw, 48px) clamp(28px, 4vw, 44px)",
        marginBottom: 24,
        textAlign: "center",
        background: "#FFFFFF",
        border: "1px solid var(--rule, #E5E7EB)",
        borderRadius: 16,
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
        fontFamily: "var(--wb-sans)",
      }}
    >
      <h2
        style={{
          fontFamily: "var(--wb-sans)",
          fontSize: "clamp(24px, 3vw, 30px)",
          fontWeight: 700,
          color: "var(--ink, #111827)",
          marginBottom: 12,
          letterSpacing: "-0.01em",
          lineHeight: 1.25,
        }}
      >
        {v2(lang, isSignup ? "softWallAnonTitle" : "softWallBasicTitle")}
      </h2>
      <p
        style={{
          fontFamily: "var(--wb-sans)",
          fontSize: 15,
          color: "var(--ink-muted, #4B5563)",
          maxWidth: "44ch",
          margin: "0 auto 24px",
          lineHeight: 1.55,
        }}
      >
        {v2(lang, isSignup ? "softWallAnonBody" : "softWallBasicBody")}
      </p>
      {isSignup ? (
        <button
          type="button"
          onClick={onSignUp}
          style={{
            fontFamily: "var(--wb-sans)",
            padding: "12px 28px",
            borderRadius: 999,
            fontSize: 14.5,
            fontWeight: 600,
            color: "white",
            background: "rgb(14, 165, 165)",
            border: "none",
            cursor: "pointer",
            transition: "background 160ms",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgb(13, 148, 148)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgb(14, 165, 165)"; }}
        >
          {v2(lang, "softWallSignupCta")}
        </button>
      ) : (
        <Link
          href={href("/pricing")}
          style={{
            fontFamily: "var(--wb-sans)",
            display: "inline-block",
            padding: "12px 28px",
            borderRadius: 999,
            fontSize: 14.5,
            fontWeight: 600,
            color: "white",
            textDecoration: "none",
            background: "rgb(14, 165, 165)",
          }}
        >
          {v2(lang, "upgradeToClear")}
        </Link>
      )}
    </div>
  );
}

// Cream-friendly inline language switcher for the wordbook topbar.
// LangSwitcher in design/ assumes a dark surface; this one is sized
// and colored for cream paper. Pure local state, closes on outside click.
function WordbookLangSwitch() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const active = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  return (
    <div ref={wrapRef} className="wb-lang-wrap">
      <button
        type="button"
        className="wb-lang-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change language"
      >
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
          <path
            d="M1.5 7h11M7 1.5c1.7 2 1.7 9 0 11M7 1.5c-1.7 2-1.7 9 0 11"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
        <span>{langNameIn(active.code, lang)}</span>
        <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="wb-lang-panel" role="listbox">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              role="option"
              aria-selected={l.code === lang}
              className={l.code === lang ? "is-active" : ""}
              onClick={() => {
                setLang(l.code as Lang);
                setOpen(false);
              }}
            >
              <span style={{ display: "inline-flex", flexDirection: "column", lineHeight: 1.2 }}>
                <span>{langNameIn(l.code, lang)}</span>
                {langNameIn(l.code, lang) !== l.label && (
                  <span dir={l.dir} style={{ fontSize: 11, opacity: 0.5, unicodeBidi: "isolate" }}>{l.label}</span>
                )}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Skeleton card — shown while the SSE stream is still bringing in data
// before any meaning has parsed cleanly.
function SkeletonCard({ height = 120 }: { height?: number }) {
  return (
    <div
      className="gd-card"
      style={{
        padding: "32px",
        opacity: 0.5,
        minHeight: height,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, oklch(0.95 0.01 85 / 0.6) 50%, transparent 100%)",
          animation: "gd-drift 1.6s ease-in-out infinite",
        }}
      />
    </div>
  );
}

interface SSEDelta {
  type: "delta";
  partial: string;
}
interface SSEDone {
  type: "done";
  result: WordResult & { fromCache?: boolean };
}
interface SSEError {
  type: "error";
  message: string;
}
type SSEEvent = SSEDelta | SSEDone | SSEError;

export function WordClient({
  initialWord,
  initialResult = null,
  preloadLang = "en",
}: {
  initialWord: string;
  /** Server-preloaded definition from the Firestore cache (anonymous
   *  "base" tier, preloadLang UI language). When present and the
   *  client context matches (anonymous, same lang, no context
   *  sentence), the API fetch is skipped entirely — crawlers get full
   *  HTML, anonymous users get an instant render that doesn't touch
   *  their daily quota. Launch SEO fix 2026-07-04. */
  initialResult?: WordResult | null;
  preloadLang?: string;
}) {
  const { user, loading: authLoading, plan: authPlan, promptLogin, familyRole, schoolId } = useAuth();
  const { lang, dir } = useLang();
  const router = useRouter();
  const href = useHref();
  const searchParams = useSearchParams();
  const contextSentence = searchParams?.get("sentence")?.trim() || "";
  // Kids Mode subscription: when the user flips the toggle in the
  // masthead, the effect below picks up the new value and re-fetches
  // the entry under the new prompt + cache key.
  const [kidsMode] = useKidsMode();
  // Persistent search bar sitting between the masthead and the result.
  // Lives in WordClient (not chrome) so the input doesn't reset every
  // time the masthead re-renders for share/lang/menu toggles.
  const [headerQuery, setHeaderQuery] = useState("");
  // When wrong-keyboard auto-correct fires, the original mis-typed
  // word is preserved in ?from=… so we can show a banner that lets
  // the user override and search the original anyway. ?stay=1 is
  // set by that override link to skip the redirect on re-entry.
  const typedOriginal = searchParams?.get("from")?.trim() || "";
  const stayOnInput = searchParams?.get("stay") === "1";
  // ?back=<word> set by the WordPopover when the user opens a tapped
  // word's full definition. Surfaces a 'back to <word>' chip at the
  // top of the result so the user can return to the original
  // definition they were reading without losing their place.
  const backWord = searchParams?.get("back")?.trim() || "";
  // ?cls=<CODE> set by the /c/<CODE> kid landing page. When present,
  // this search came from a classroom — fire-and-forget log it to the
  // classroom's search log so the teacher can see what their class
  // looked up today. No personal data is logged, only the word + lang
  // (+ first name only when the roster picker was used).
  const classroomCode = searchParams?.get("cls")?.trim() || "";
  // The school's skin colour, stashed by the /c/<CODE> landing so the word
  // page themes to it without another lookup. Read after mount (sessionStorage
  // is client-only) to avoid a hydration mismatch.
  const [classroomSkin, setClassroomSkin] = useState<string | null>(null);
  useEffect(() => {
    if (classroomCode) setClassroomSkin(readStashedSkin(classroomCode));
  }, [classroomCode]);
  // Present / projector mode (Gadi 2026-08-05, schools council): the SAME
  // clean Gadit word view with the top chrome hidden, for a teacher
  // explaining a word to the whole class on the classroom screen. Same
  // format as always, just without the top menu. Initialised from
  // ?present=1 (shareable link) and toggled live by the corner button.
  const [present, setPresent] = useState(searchParams?.get("present") === "1");
  // In present mode the search bar is hidden (we are showing words, not
  // searching). A small "open dictionary" button reveals it on demand.
  const [showSearch, setShowSearch] = useState(false);
  // Word-set stepping (schools council 2026-08-05). ?set=<id> means this
  // word is part of a curated themed set the teacher is walking through;
  // show a prev/next stepper (and arrow-key paging) that keeps present +
  // set params so the whole lesson stays clean on the projector.
  const setId = searchParams?.get("set")?.trim() || "";
  const wordSet = setId ? getWordSet(setId) : undefined;
  const setIdx = wordSet
    ? wordSet.words.findIndex((w) => w.trim().toLowerCase() === initialWord.trim().toLowerCase())
    : -1;
  const goToSetWord = (w: string) =>
    router.push(href(`/word/${encodeURIComponent(w)}?present=1&set=${encodeURIComponent(setId)}`));
  // Classroom mode: a set word shown on the projector. Show ONE relevant
  // definition (Gadi's curated one when we have it, else the first
  // meaning) plus an auto-generated picture, never the full multi-meaning
  // result, so students see the subject-relevant sense only.
  const classroomMode = present && !!wordSet && setIdx >= 0;
  useEffect(() => {
    if (!wordSet || setIdx < 0) return;
    function onKey(e: KeyboardEvent) {
      if (!wordSet) return;
      if (e.key === "ArrowRight" && setIdx < wordSet.words.length - 1) goToSetWord(wordSet.words[setIdx + 1]);
      else if (e.key === "ArrowLeft" && setIdx > 0) goToSetWord(wordSet.words[setIdx - 1]);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setId, setIdx]);
  // ?sn=<first-name> set by the /c/<CODE> roster picker. Carries
  // forward through the persistent search bar so a kid who chains
  // multiple lookups stays attributed. Empty string == anonymous.
  const classroomStudentName = searchParams?.get("sn")?.trim() || "";
  // ?in=1 set by /c/<CODE> only when the school's classroom window is
  // currently active (default Sun-Thu 7:30-15:00 Asia/Jerusalem). When
  // true, the word page unlocks the extended classroom features
  // (image, kids' explanation, classroom game) on top of the always-
  // on basic dictionary. Outside the window the kid keeps the search
  // but those extras go dark — the kid view shows a soft "Want full
  // Gadit at home? Family" hint instead.
  const classroomInSession = searchParams?.get("in") === "1";

  // Seed from the server preload so the first paint (and the crawler's
  // HTML snapshot) already contains the definition. The fetch effect
  // below decides whether the preload is authoritative or needs a
  // refetch (signed-in user, lang mismatch, context sentence).
  const [result, setResult] = useState<WordResult | null>(initialResult);
  const [loading, setLoading] = useState(!initialResult);
  const [isSaved, setIsSaved] = useState(false);

  // Parent alert: when the searcher is a child in a family, tell the
  // server so the parent gets notified (push + email) that their kid
  // looked up this word. Best-effort and fire-and-forget; the endpoint
  // is a silent no-op for anyone who isn't a kid. Fires once per word.
  const notifiedWordRef = useRef<string>("");
  useEffect(() => {
    const w = result?.word;
    // Only on a COMPLETE result. During SSE streaming result.word is built
    // up letter by letter (ח → חפ → חפץ), so firing on every change sent
    // the parent 3 alerts for prefixes. loading stays true until the final
    // result lands, so gate on it.
    if (loading || !w || familyRole !== "kid" || !user) return;
    if (notifiedWordRef.current === w) return;
    notifiedWordRef.current = w;
    (async () => {
      try {
        const idToken = await user.getIdToken();
        await fetch("/api/family/notify-search", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
          body: JSON.stringify({ word: w, language: result?.language ?? "", uiLang: lang }),
          keepalive: true,
        });
      } catch {
        /* best effort — never disturb the search flow */
      }
    })();
  }, [result?.word, result?.language, familyRole, user, loading, lang]);
  // Offline pin state: true means the user has explicitly downloaded
  // this word for offline study (vs the implicit auto-cache that all
  // Clear/Deep users get on view). Loaded from IDB once the result
  // lands; toggled by the Pin button in WordHeader.
  const [isPinned, setIsPinned] = useState(false);
  // Upgrade modal — open with the feature + tier the user just tried.
  // Null = no modal showing.
  const [upgradeTrigger, setUpgradeTrigger] = useState<UpgradeTrigger | null>(null);

  // Cross-language is a flagship feature (Gadi 2026-08-03): a student on a
  // Russian/Hebrew UI can type a word in ANY language and get the meaning
  // explained in their interface language. The old wrong-keyboard rescue
  // auto-redirected any Latin input on a Hebrew UI to its keyboard-mapped
  // Hebrew (e.g. "dream" -> "גרקשץ"), because it only checked that the
  // mapping produced Hebrew LETTERS, not a real WORD. That hijacked every
  // legitimate foreign-word lookup. We no longer redirect — the word is
  // defined exactly as typed, in the UI language. Genuine wrong-keyboard
  // typos still get the model's own "did you mean" suggestion in the
  // result. `detectWrongKeyboard` is intentionally left unused here.
  void detectWrongKeyboard;
  // Brief toast above the topbar confirming a save worked. The button
  // label also flips to "Saved" but the toast gives an explicit ack.
  const [saveFlash, setSaveFlash] = useState(false);
  // The 429 case carries a "nextStep" hint from the server — anon
  // visitors see "sign up to keep searching", basic users see
  // "upgrade to Clear for unlimited". Captures the difference so we
  // render the right CTA on the soft wall.
  const [quotaState, setQuotaState] = useState<{
    reached: boolean;
    nextStep: "signup" | "upgrade" | null;
  }>({ reached: false, nextStep: null });
  const [errorMsg, setErrorMsg] = useState<string>("");
  // Anonymous-only soft banner: when an unsigned visitor has done
  // their 4th or 5th search of the day (out of a 5/day cap), we
  // show a small "X free searches left — sign up to keep going"
  // line above the result. State lives on the client; the actual
  // counter is in localStorage.
  const [anonSearchesLeft, setAnonSearchesLeft] = useState<number | null>(null);
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [imageGenerating, setImageGenerating] = useState(false);
  // Kids Mode: a picture per meaning, keyed by meaning index, shown inline
  // under each definition. Adult mode never fills this.
  const [kidsImages, setKidsImages] = useState<Record<number, string>>({});
  // Which meaning indexes are still generating their kids picture, so the
  // card can show a skeleton instead of blank space (blank space made a
  // parent think it failed and tap the manual action, creating a duplicate).
  const [kidsImgLoading, setKidsImgLoading] = useState<Record<number, boolean>>({});
  // Surface image-gen failures to the user — previously the handler
  // swallowed any non-402 error and the user saw 'loading → nothing',
  // with no signal that anything had gone wrong. A Czech beta tester
  // hit a quota error and could not tell why the button did nothing.
  const [imageError, setImageError] = useState<string | null>(null);
  // Classroom present mode: subject-appropriate example sentences pinned
  // to the word's curated (subject-relevant) meaning, fetched from
  // /api/classroom-examples. A polysemous curriculum word like "אות"
  // (a letter of the alphabet, in the language set) then shows letter
  // examples, not a musical-signal or medal example. Falls back to the
  // general /api/define examples until these land (or if none exist).
  const [classroomExamples, setClassroomExamples] = useState<string[]>([]);
  const [composeOpen, setComposeOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [wordGameOpen, setWordGameOpen] = useState(false);

  // Niqqud (מנוקד) — optional Hebrew vowel points for young readers (grades
  // 1-2). The toggle persists per device; when on for a Hebrew word we fetch a
  // vowelized copy of the word/meanings/examples (Dicta, via /api/niqqud) and
  // render THAT, while every logic path keeps the original un-vowelized text.
  // Gadi 2026-08-22.
  const [niqqud, setNiqqud] = useState(false);
  const [niqResult, setNiqResult] = useState<WordResult | null>(null);
  const isHebrewWord = !!result && /[֐-׿]/.test(result.word || "");
  const isArabicWord = !!result && /[؀-ۿ]/.test(result.word || "");
  useEffect(() => {
    try { setNiqqud(localStorage.getItem("gadit-niqqud") === "1"); } catch { /* ignore */ }
  }, []);
  function toggleNiqqud() {
    setNiqqud((v) => {
      const next = !v;
      try { localStorage.setItem("gadit-niqqud", next ? "1" : "0"); } catch { /* ignore */ }
      return next;
    });
  }
  useEffect(() => {
    if (!niqqud || !(isHebrewWord || isArabicWord) || !result || !user) { setNiqResult(null); return; }
    let cancelled = false;
    (async () => {
      try {
        // Vowelizable = Hebrew (Dicta niqqud) or Arabic (LLM tashkeel).
        const isHeb = (s?: string) => !!s && /[֐-׿؀-ۿ]/.test(s);
        // Collect only the text that's actually SHOWN in the current mode:
        // in Kids Mode the kids explanation replaces the standard meaning.
        const texts: string[] = [];
        const add = (s?: string) => { if (isHeb(s)) texts.push(s as string); };
        add(result.word);
        for (const m of result.meanings ?? []) {
          if (kidsMode && m.kidsExplanation) {
            add(m.kidsExplanation.intro);
            add(m.kidsExplanation.explanation);
            for (const ex of m.kidsExplanation.examples ?? []) add(ex);
          } else {
            add(m.meaning);
            for (const ex of m.examples ?? []) add(ex);
          }
        }
        const unique = Array.from(new Set(texts));
        if (unique.length === 0) { setNiqResult(null); return; }
        const idToken = await user.getIdToken();
        const res = await fetch("/api/niqqud", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
          body: JSON.stringify({ texts: unique }),
        });
        if (!res.ok) throw new Error("niqqud");
        const data = (await res.json()) as { niqqud?: string[] };
        const niq = data.niqqud ?? [];
        if (cancelled || niq.length !== unique.length) return;
        const map = new Map<string, string>();
        unique.forEach((tx, i) => map.set(tx, niq[i] ?? tx));
        const v = (s?: string) => (s && map.has(s) ? (map.get(s) as string) : s);
        const vMeanings = (result.meanings ?? []).map((m) => ({
          ...m,
          meaning: v(m.meaning) ?? m.meaning,
          examples: (m.examples ?? []).map((e) => v(e) ?? e),
          kidsExplanation: m.kidsExplanation
            ? {
                ...m.kidsExplanation,
                intro: v(m.kidsExplanation.intro),
                explanation: v(m.kidsExplanation.explanation) ?? m.kidsExplanation.explanation,
                examples: (m.kidsExplanation.examples ?? []).map((e) => v(e) ?? e),
              }
            : m.kidsExplanation,
        }));
        setNiqResult({ ...result, word: v(result.word) ?? result.word, meanings: vMeanings });
      } catch {
        if (!cancelled) setNiqResult(null); // Dicta down → plain Hebrew, no break
      }
    })();
    return () => { cancelled = true; };
  }, [niqqud, isHebrewWord, isArabicWord, result, user, kidsMode]);
  const displayResult = niqqud && niqResult ? niqResult : result;
  const [reportContext, setReportContext] = useState<ReportContext | null>(
    null
  );

  // Plan as the API gates it: anonymous → "basic", auth-context → server.
  const plan: Plan = authPlan ?? "basic";

  // Guard against double-firing in dev StrictMode AND against
  // re-fetches caused by unstable deps. Key embeds user.uid so an
  // anonymous → signed-in transition re-runs the fetch (otherwise
  // a visitor who signs in mid-skeleton would never see the result).
  const fetchedFor = useRef<string | null>(null);

  // promptLogin is recreated every AuthProvider render, which used to
  // re-fire the effect each time React's auth state updated. Stash a
  // ref so the effect's deps stay minimal and the guard actually
  // works (see effect below).
  const promptLoginRef = useRef(promptLogin);
  useEffect(() => {
    promptLoginRef.current = promptLogin;
  }, [promptLogin]);

  // Classroom search logging. Fires once per (code, word) combo when
  // the user arrived from /c/<CODE>. Server-side this writes an entry
  // to schools/{schoolId}/classrooms/{classroomId}/searches/ + bumps
  // the running classroom searchCount. Fire-and-forget — a failed log
  // is silent because the user has nothing to do about it.
  useEffect(() => {
    if (!classroomCode || !initialWord) return;
    fetch("/api/classroom/log-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: classroomCode,
        word: initialWord,
        lang,
        ...(classroomStudentName && { studentName: classroomStudentName }),
      }),
    }).catch(() => {
      // Silent. Logging is best-effort, never blocks the result.
    });
  }, [classroomCode, classroomStudentName, initialWord, lang]);

  useEffect(() => {
    if (!initialWord) return;
    // Wait for auth to resolve before deciding anon vs signed-in. Without this
    // a signed-in visitor whose device still holds an old anon counter could
    // flash the signup wall during the brief auth-loading window. The
    // preloaded result (if any) is already on screen from initial state, so
    // this gate never blanks an SEO landing. authLoading is in the deps so the
    // effect re-runs the moment auth settles.
    if (authLoading) return;
    const key = `${initialWord}::${user?.uid ?? "anon"}`;
    if (fetchedFor.current === key) return;

    // Server preload short-circuit: the page arrived with the cached
    // definition already rendered. Keep it — no API call — as long as
    // the client context matches what the server preloaded for:
    // anonymous visitor, same UI language, no context sentence. Any
    // mismatch (user signs in, lang switch, ?sentence=) falls through
    // to the normal fetch. Crawlers always match this branch, which is
    // what turns the GSC Soft 404s into indexable pages.
    if (initialResult && !user && !contextSentence && lang === preloadLang) {
      fetchedFor.current = key;
      setResult(initialResult);
      setLoading(false);
      setErrorMsg("");
      // Cleanup must reset the fetch guard: the guard key doesn't
      // include lang, so without this a lang switch would hit the
      // key-match early-return above and keep stale-language content.
      return () => {
        fetchedFor.current = null;
      };
    }

    fetchedFor.current = key;

    let cancelled = false;
    const controller = new AbortController();

    async function run() {
      setLoading(true);
      setQuotaState({ reached: false, nextStep: null });
      setErrorMsg("");
      setResult(null);
      setImageUrl(undefined);
      setKidsImages({});
      setAnonSearchesLeft(null);

      // HARD anon wall (Gadi 2026-09-06): 3 lifetime searches per device, then
      // registration is required (free). Counts cache hits too, so it fires on
      // popular words as well, and never resets by day. Block BEFORE the fetch
      // so search #4 never reaches the engine — the signup softwall renders
      // instead. The server still caps cache-miss cost by IP separately.
      if (!user && readAnonCounter() >= ANON_LIFETIME_LIMIT) {
        // SoftWall tracks "softwall_shown" on render, so don't double-count here.
        setQuotaState({ reached: true, nextStep: "signup" });
        setLoading(false);
        return;
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (user) {
        try {
          const idToken = await user.getIdToken();
          headers.Authorization = `Bearer ${idToken}`;
        } catch {
          // anonymous fallback
        }
      }

      let res: Response;
      try {
        res = await fetch("/api/define", {
          method: "POST",
          headers,
          body: JSON.stringify({
            word: initialWord,
            uiLang: lang,
            ...(contextSentence ? { contextSentence } : {}),
          }),
          signal: controller.signal,
        });
      } catch (e) {
        // AbortError fires when strict-mode cleanup aborts the
        // duplicate fetch; that's expected and quiet. Anything else
        // surfaces as a real error.
        if (cancelled || (e instanceof DOMException && e.name === "AbortError")) {
          return;
        }
        // Network failure (offline, DNS, etc.). Before surfacing an
        // error, look the word up in the offline IDB cache — if the
        // user is a Clear/Deep subscriber and has previously viewed
        // this word, we can still render it without any network.
        if (plan === "clear" || plan === "deep") {
          try {
            const cached = await getCachedWord(lang, initialWord);
            if (cached && !cancelled) {
              setResult(cached.result as WordResult);
              setLoading(false);
              return;
            }
          } catch {
            // IDB miss / unsupported — fall through to the error path.
          }
        }
        setErrorMsg(String(e));
        setLoading(false);
        return;
      }

      if (cancelled) return;

      // 401 used to be the "anonymous wall" — that wall is gone, so a
      // 401 now would only mean a corrupt token or an expired session
      // for a previously-signed-in user. Treat as a generic auth
      // failure: open sign-in, no special handling.
      if (res.status === 401) {
        promptLoginRef.current();
        setLoading(false);
        return;
      }
      if (res.status === 429) {
        // Parse the hint so the soft-wall component can show the
        // right CTA (Sign up vs Upgrade to Clear).
        const body = (await res.json().catch(() => ({}))) as {
          nextStep?: "signup" | "upgrade";
        };
        setQuotaState({
          reached: true,
          nextStep: body.nextStep ?? (user ? "upgrade" : "signup"),
        });
        setLoading(false);
        return;
      }
      if (res.status === 400) {
        // Server rejected the input as not a plausible word. Surface
        // the human-readable message instead of a raw HTTP code.
        const body = (await res.json().catch(() => ({}))) as {
          message?: string;
        };
        setErrorMsg(
          body.message ??
            "That doesn't look like a word we can define. Try a single word or a short phrase."
        );
        setLoading(false);
        return;
      }
      if (res.status === 503) {
        // Upstream (OpenAI) is unavailable — quota, outage, transient
        // 5xx. Show a calm "try again shortly" instead of "HTTP 503"
        // so users don't think the app itself is broken. Gadi
        // 2026-06-22 incident: OpenAI quota ran out and a subscriber
        // saw a raw "HTTP 500".
        const body = (await res.json().catch(() => ({}))) as {
          message?: string;
        };
        setErrorMsg(
          body.message ??
            "Our definition engine is temporarily unavailable. Please try again in a few minutes."
        );
        setLoading(false);
        return;
      }
      if (!res.ok || !res.body) {
        // Generic last-resort fallback for any unexpected non-2xx —
        // still less scary than "HTTP 500".
        setErrorMsg("Something went wrong. Please try again in a moment.");
        setLoading(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finalResult: (WordResult & { fromCache?: boolean }) | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (cancelled) {
          reader.cancel().catch(() => undefined);
          return;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (!payload) continue;

          let event: SSEEvent;
          try {
            event = JSON.parse(payload) as SSEEvent;
          } catch {
            continue;
          }

          if (event.type === "delta") {
            try {
              const partial = parsePartialJson(
                event.partial,
                Allow.ALL
              ) as Partial<WordResult>;
              if (partial && typeof partial === "object") {
                // Only render meanings that are at least minimally
                // shaped — partial-json hands us mid-stream rows like
                // { meaning: "חלום ז" } before examples have arrived,
                // and the renderer used to crash when examples was
                // undefined. Defensive rendering inside MeaningCard
                // catches the rest, but filtering here avoids a flash
                // of empty cards on screen during the stream.
                const partialMeanings = Array.isArray(partial.meanings)
                  ? partial.meanings.filter(
                      (m): m is NonNullable<typeof m> =>
                        !!m && typeof m === "object" && typeof m.meaning === "string"
                    )
                  : [];
                // Spread the whole partial so no field is dropped mid-stream
                // (this used to hand-pick fields and silently lost the
                // cross-language `translation` gloss + `ipa` — 2026-08-13).
                // Only the rendered-shape fields are overridden for safety.
                setResult({
                  ...(partial as WordResult),
                  word: partial.word ?? initialWord,
                  language: partial.language ?? "",
                  meanings: partialMeanings,
                  etymology: partial.etymology ?? "",
                  generalIdioms: partial.generalIdioms,
                });
              }
            } catch {
              // partial JSON not yet parseable — keep accumulating
            }
          } else if (event.type === "done") {
            finalResult = event.result;
          } else if (event.type === "error") {
            setErrorMsg(event.message);
          }
        }
      }

      if (cancelled) return;

      if (finalResult) {
        setResult(finalResult);
        // Mark first-successful-search so the PWA install prompt can
        // wake up. Idempotent; safe to set on every successful result.
        try {
          if (typeof window !== "undefined") {
            localStorage.setItem("gadit_first_search_done", "1");
          }
        } catch { /* private mode etc., silently ignore */ }
        // Offline cache write — Clear/Deep only. Every successful
        // result gets persisted to IndexedDB so the same lookup works
        // from any device the user has installed the PWA on, even
        // with no network later (school WiFi blocked, plane, etc.).
        // Fire-and-forget; failure here must never break the render.
        if (plan === "clear" || plan === "deep") {
          void setCachedWord(lang, initialWord, finalResult);
        }
        track("search", {
          word: initialWord.slice(0, 40),
          uiLang: lang,
          plan,
          fromCache: Boolean(finalResult.fromCache),
          meaningsCount: finalResult.meanings?.length ?? 0,
          surface: "v2",
        });

        // For anonymous visitors only, bump the local counter and,
        // if they're at search 4 or 5 (i.e. 1-2 left), surface the
        // soft banner above the result. Cache hits AND misses count
        // toward the visible UX counter — beta testers found it
        // weird that the limit "didn't decrement" on popular words
        // (the server bypasses cache hits for billing, but UX-wise
        // the user just made a search either way).
        if (!user) {
          const used = bumpAnonCounter();
          const left = Math.max(0, ANON_LIFETIME_LIMIT - used);
          if (left > 0 && left <= 2) {
            setAnonSearchesLeft(left);
          }
        }
      } else if (!cancelled) {
        setErrorMsg("Stream ended without final result");
      }
      setLoading(false);
    }

    run();

    return () => {
      cancelled = true;
      // Actually abort the in-flight HTTP request — without this the
      // first fetch from Strict Mode's double-mount keeps running on
      // the OpenAI backend for ~30-100s, blocking the second fetch
      // behind it via per-key rate limiting and leaving the user on
      // a stuck skeleton. abort() rejects the fetch with AbortError
      // which the catch block above quietly swallows.
      controller.abort();
      // Reset the guard so the second (real) mount is allowed to
      // start a fresh fetch — without this the second mount sees the
      // key match and skips, and since the first fetch was aborted
      // nothing ever sets result.
      fetchedFor.current = null;
    };
    // Deps intentionally minimal: only the inputs that should
    // *trigger* a re-fetch. plan + promptLogin used to be here and
    // caused the fetch to re-fire on every auth-context render —
    // which combined with StrictMode produced 2 in-flight fetches
    // and a skeleton that never settled (the second fetch's setState
    // races the first's). plan is read inside run() via the
    // surrounding closure; promptLogin via promptLoginRef.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialWord, lang, user, authLoading, contextSentence, initialResult, preloadLang]);

  // Classroom mode: auto-generate the picture so the word shows WITH its
  // image by default on the projector, no click. Prompts with the curated
  // definition so the picture matches the subject-relevant sense.
  useEffect(() => {
    if (!classroomMode || !result || imageUrl || imageGenerating || !user) return;
    const def = curatedDef(initialWord) ?? result.meanings[0]?.meaning ?? "";
    void handleGenerate({ meaning: def, example: result.meanings[0]?.examples?.[0] ?? "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classroomMode, result, imageUrl, imageGenerating, user]);

  // Kids Mode: generate a picture for EACH meaning, shown inline under its
  // definition with no "Generate" click. Sequential + silent: the first kid
  // to view a (word, meaning, lang) pays; it lands in the img_kids_* cache
  // so every kid after gets it free (generate-image serves the cache before
  // the quota check). Stops early if a call fails (e.g. the monthly image
  // quota) so we never hammer the API. Non-basic only (a Family kid is on
  // "deep"). Classroom has its own single-image effect above.
  const kidsGenWordRef = useRef<string>("");
  useEffect(() => {
    // Complete result only — mid-stream result.word is a partial prefix,
    // so without this we'd generate images for ח, חפ, חפץ.
    if (loading || !kidsMode || classroomMode || !result?.word || !user || plan === "basic") return;
    if (kidsGenWordRef.current === result.word) return;
    kidsGenWordRef.current = result.word;
    const meanings = result.meanings ?? [];
    const w = result.word;
    const authedUser = user; // narrowed non-null above; keep it for the nested workers
    let cancelled = false;
    // Fresh word: clear any stale pictures and mark every meaning as
    // "generating" so each card shows a skeleton until its image lands.
    setKidsImages({});
    setKidsImgLoading(() => {
      const m: Record<number, boolean> = {};
      for (let i = 0; i < meanings.length; i++) m[i] = true;
      return m;
    });
    (async () => {
      // Generate the meanings' pictures CONCURRENTLY (bounded pool) instead of
      // one-after-another, so a 3-meaning word doesn't take 3x the wait — the
      // slow part is the image model, and the calls are independent (different
      // cache keys). Cap concurrency so we don't trip the image-API rate limit.
      // Gadi 2026-09-23. On a quota (429) we stop starting new ones.
      const CONCURRENCY = 3;
      let nextIndex = 0;
      let stop = false;
      async function worker() {
        while (!cancelled && !stop) {
          const i = nextIndex++;
          if (i >= meanings.length) return;
          try {
            const idToken = await authedUser.getIdToken();
            const res = await fetch("/api/generate-image", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
              body: JSON.stringify({
                word: w,
                meaning: meanings[i]?.meaning ?? "",
                example: meanings[i]?.examples?.[0] ?? "",
                uiLang: lang,
                kidsMode: true,
              }),
            });
            if (!res.ok) {
              if (res.status === 429) stop = true; // monthly image quota — stop starting new ones
              if (!cancelled) setKidsImgLoading((prev) => ({ ...prev, [i]: false }));
              continue;
            }
            const data = (await res.json()) as { url?: string };
            if (cancelled) return;
            if (data.url) setKidsImages((prev) => ({ ...prev, [i]: data.url as string }));
            setKidsImgLoading((prev) => ({ ...prev, [i]: false }));
          } catch {
            if (!cancelled) setKidsImgLoading((prev) => ({ ...prev, [i]: false }));
            // network hiccup on one image — keep the others going
          }
        }
      }
      await Promise.all(
        Array.from({ length: Math.min(CONCURRENCY, meanings.length) }, () => worker()),
      );
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kidsMode, classroomMode, result?.word, user, plan, loading]);

  // Auto-save every looked-up word to the notebook, silently, once per word.
  // Kids never have to tap "Save" (and the parent dashboard captures what
  // they explored); paying adults (Clear / Deep / Family) also get every
  // word saved the moment they look it up (Gadi 2026-08-17). Non-basic only
  // — the notebook is a paid feature.
  const autoSavedRef = useRef<string>("");
  useEffect(() => {
    // Complete result only — mid-stream result.word is a partial prefix.
    if (loading || !result?.word || !user || plan === "basic") return;
    if (autoSavedRef.current === result.word) return;
    autoSavedRef.current = result.word;
    (async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch("/api/notebook", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
          body: JSON.stringify({
            word: result.word,
            language: result.language,
            meaning: result.meanings[0]?.meaning ?? "",
          }),
        });
        if (res.ok) setIsSaved(true);
      } catch {
        /* best effort — auto-save must never disturb the reading flow */
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kidsMode, result?.word, user, plan, loading]);

  // Voice assistant arrival (?speak=1): read the definition aloud once, so a
  // hands-free "Gadit, what is X" gets a spoken answer (Gadi 2026-08-17).
  const spokeRef = useRef(false);
  useEffect(() => {
    if (searchParams?.get("speak") !== "1") return;
    if (spokeRef.current || loading || !result?.word || !user) return;
    if (plan !== "clear" && plan !== "deep") return;
    spokeRef.current = true;
    (async () => {
      try {
        const meaning = result.meanings?.[0]?.meaning ?? "";
        const text = `${result.word}. ${meaning}`.slice(0, 600);
        const idToken = await user.getIdToken();
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
          body: JSON.stringify({ text, lang }),
        });
        if (!res.ok) return;
        const url = URL.createObjectURL(await res.blob());
        const audio = new Audio(url);
        audio.onended = () => URL.revokeObjectURL(url);
        void audio.play();
      } catch {
        /* best effort — a missing spoken answer must never break the page */
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, result?.word, user, plan]);

  // Classroom present mode: fetch subject-appropriate examples for the
  // curated meaning. Uses the SET's language (the curated defs are
  // Hebrew) so examples match the definition, and passes the resolved
  // meaning so the cache key lines up with the admin warm-set. Best
  // effort: on empty/failure we keep the general define examples.
  useEffect(() => {
    if (!classroomMode || !result) {
      setClassroomExamples([]);
      return;
    }
    let cancelled = false;
    const meaning = curatedDef(initialWord) ?? result.meanings[0]?.meaning ?? "";
    const exLang = wordSet?.lang ?? lang;
    const params = new URLSearchParams({ word: initialWord, uiLang: exLang });
    if (setId) params.set("set", setId);
    if (meaning) params.set("meaning", meaning);
    fetch(`/api/classroom-examples?${params.toString()}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { examples?: string[] } | null) => {
        if (!cancelled && Array.isArray(d?.examples) && d.examples.length > 0) {
          setClassroomExamples(d.examples);
        }
      })
      .catch(() => {
        /* keep define examples */
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classroomMode, initialWord, setId, result]);

  // ── Action handlers ───────────────────────────────────────────
  async function handleGenerate(opts?: { meaning?: string; example?: string; silent?: boolean }) {
    if (!result || !user) {
      if (!opts?.silent) promptLogin(v2(lang, "generateImage"));
      return;
    }
    if (imageGenerating) return; // guard against double-click
    setImageGenerating(true);
    setImageError(null);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          word: result.word,
          // Classroom mode passes the curated (subject-relevant) definition
          // so the picture depicts the right sense of the word.
          meaning: opts?.meaning ?? result.meanings[0]?.meaning ?? "",
          // First example sentence anchors the image prompt to a real
          // scene — biggest win for abstract words ("חוויה", "תקווה")
          // that have no everyday object to photograph. See
          // buildDallePrompt comment for the why.
          example: opts?.example ?? result.meanings[0]?.examples?.[0] ?? "",
          uiLang: lang,
          // Kids Mode → server swaps to the modern-flat illustration
          // prompt (Style B, locked 2026-06-19) and stores the result
          // in a separate img_kids_<lang>_* cache namespace so adult
          // and kid users of the same word each get the right look.
          kidsMode,
        }),
      });
      if (!res.ok) {
        if (res.status === 402) {
          // Auto (kids) generation must never yank the reader to /pricing.
          if (!opts?.silent) router.push(href("/pricing"));
          return;
        }
        // Silent (auto) mode fails quietly — no error card on the page.
        if (opts?.silent) return;
        // Parse the body for a known error code and surface a
        // language-appropriate message instead of failing silently.
        let bodyJson: { error?: string; used?: number; limit?: number } = {};
        try { bodyJson = await res.json(); } catch { /* not json */ }
        const code = bodyJson.error ?? `http_${res.status}`;
        const localised =
          code === "monthly_limit_reached"
            ? pick(IMAGE_QUOTA_COPY, lang)(bodyJson.used, bodyJson.limit)
            : code === "image_generation_failed" || code === "no_image_returned"
            ? pick(IMAGE_FAILED_COPY, lang)
            : pick(GENERIC_ERROR_COPY, lang);
        setImageError(localised);
        console.error("[generate-image] failed:", res.status, bodyJson);
        return;
      }
      const data = (await res.json()) as { url?: string };
      if (data.url) setImageUrl(data.url);
    } catch (e) {
      console.error("generate-image:", e);
      if (opts?.silent) return;
      setImageError(
        pick(NETWORK_LOST_COPY, lang)
      );
    } finally {
      setImageGenerating(false);
    }
  }

  function handleUpgrade(tab?: string, tier?: "clear" | "deep") {
    // If we know the feature + tier (locked-tab click flow), show the
    // contextual modal. Otherwise (e.g. SoftWall upgrade button, quota
    // wall) fall through to the pricing page directly.
    if (tab && tier && (tab === "image" || tab === "kids" || tab === "compose" || tab === "quiz" || tab === "compare")) {
      setUpgradeTrigger({ feature: tab, tier });
      return;
    }
    router.push(href("/pricing"));
  }

  // Tracks why save failed so we can show the right toast/text.
  // null = either succeeded or hasn't been attempted this turn.
  const [saveError, setSaveError] = useState<string>("");

  async function handleSave() {
    if (!user) {
      promptLogin(v2(lang, "saveToNotebook"));
      return;
    }
    if (!result) return;
    // Notebook is a Clear-tier feature. Basic users get the contextual
    // upgrade modal instead of a silent /pricing redirect — exactly
    // the same UX as locked tabs (image/kids/quiz/etc).
    if (plan === "basic") {
      setUpgradeTrigger({ feature: "notebook", tier: "clear" });
      return;
    }
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/notebook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          // /api/notebook expects { word, language, meaning } — the
          // earlier 'uiLang' typo here matched no field on the server
          // and silently 400'd, which is why every save looked like
          // a no-op until the red error toast was added.
          word: result.word,
          language: result.language,
          meaning: result.meanings[0]?.meaning ?? "",
        }),
      });
      if (res.ok) {
        setIsSaved(true);
        setSaveError("");
        setSaveFlash(true);
        window.setTimeout(() => setSaveFlash(false), 2400);
      } else {
        // Server rejected — surface an error toast so the click feels
        // acknowledged even on failure.
        console.error("notebook POST failed:", res.status, await res.text());
        setSaveError(`HTTP ${res.status}`);
        setSaveFlash(true);
        window.setTimeout(() => { setSaveFlash(false); setSaveError(""); }, 3000);
      }
    } catch (e) {
      console.error("notebook:", e);
      setSaveError(String(e));
      setSaveFlash(true);
      window.setTimeout(() => { setSaveFlash(false); setSaveError(""); }, 3000);
    }
  }

  function handleShare() {
    if (typeof navigator === "undefined") return;
    const nav = navigator as Navigator & {
      share?: (data: ShareData) => Promise<void>;
    };
    const url = window.location.href;
    if (nav.share) {
      nav
        .share({ title: `Gadit, ${result?.word ?? ""}`, url })
        .catch(() => undefined);
    } else {
      nav.clipboard?.writeText(url).catch(() => undefined);
    }
  }

  // Toggle the IDB pinned flag for the current word. Pin = user has
  // explicitly downloaded this entry for offline study, so it's
  // protected from any future auto-prune logic. The underlying
  // record is the one setCachedWord already wrote on render; we
  // only flip the pinned boolean here, not the result body.
  async function handlePin() {
    if (!result) return;
    const next = !isPinned;
    setIsPinned(next);
    try {
      await setPinnedDb(lang, initialWord, next);
    } catch (e) {
      console.warn("[pin] failed:", e);
      // Revert UI on failure so the user doesn't get a false-positive
      // 'saved' state when the underlying store rejected the write.
      setIsPinned(!next);
    }
  }

  // Whenever a fresh result lands AND the user is on Clear/Deep, read
  // back the IDB record to surface the existing pinned state on the
  // button. (Auto-cache write fires from inside run(); we only need
  // to read after it settles.)
  useEffect(() => {
    if (!result) return;
    if (plan !== "clear" && plan !== "deep") return;
    let cancelled = false;
    (async () => {
      const entry = await getCachedWord(lang, initialWord);
      if (!cancelled) setIsPinned(Boolean(entry?.pinned));
    })();
    return () => { cancelled = true; };
  }, [result, plan, lang, initialWord]);

  function handleAction(id: "save" | "image" | "compose" | "practice" | "compare" | "kids") {
    if (id === "save") return handleSave();
    if (id === "image") return handleGenerate();
    if (id === "compose") {
      if (!user) {
        promptLogin(v2(lang, "composeSubmit"));
        return;
      }
      if (plan === "basic") {
        router.push(href("/pricing"));
        return;
      }
      setComposeOpen(true);
      return;
    }
    if (id === "practice") {
      if (!user) {
        promptLogin(v2(lang, "quizEyebrow"));
        return;
      }
      if (plan !== "deep") {
        router.push(href("/pricing"));
        return;
      }
      setQuizOpen(true);
      return;
    }
    if (id === "compare") {
      // "Word games" entry point — Deep-tier feature. Opens the
      // WordGameModal which runs a mini-session anchored to THIS word
      // (anagram + fill-blank). The hub at /play stays as the broad
      // multi-word session. Anonymous → signup; basic/clear → pricing;
      // deep → modal.
      if (!user) {
        promptLogin(v2(lang, "actionCompare"));
        return;
      }
      if (plan !== "deep") {
        router.push(href("/pricing"));
        return;
      }
      setWordGameOpen(true);
      return;
    }
    if (id === "kids") {
      // Kids' explanation gates on Clear+ tier (per existing KidsCard
      // locked logic). For now, route anonymous → signup, basic → pricing,
      // clear/deep → no-op (will surface inline kids modal in next iter).
      if (!user) {
        promptLogin(v2(lang, "forKids"));
        return;
      }
      if (plan === "basic") {
        router.push(href("/pricing"));
        return;
      }
      // TODO: open a kids-explanation modal. For now this is a soft
      // landing — the data exists in result.meanings[i].kidsExplanation
      // and a dedicated modal will be wired in the next iter.
      return;
    }
  }

  // ── Render ─────────────────────────────────────────────────────
  // Wordbook redesign — the entire /word/[word] page lives on cream
  // paper, no navy stage, no starfield. The V2 MarketingHeader is
  // intentionally NOT rendered here: it's dark navy chrome that
  // clashes with the cream surface and adds noise above the word.
  // A minimal wordmark + home link in `.wb-shell-topbar` takes its
  // place; Save / Share live inside ResultView's own topbar.
  return (
    <div
      className={`wordbook wb-shell-page${familyRole === "kid" ? " wb-kid-bg" : ""}`}
      dir={dir}
      style={classroomCode ? skinStyleVars(classroomSkin) : undefined}
    >
      {saveFlash && (
        <div
          className={`wb-save-toast ${saveError ? "is-error" : ""}`}
          role="status"
        >
          {saveError
            ? pick(SAVE_FAILED_COPY, lang)
            : v2(lang, "savedToWordBook")}
        </div>
      )}
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Classroom mode hides the full Gadit chrome entirely (logo,
            nav, plan badge, lang switch, share, account menu). Gadi
            (2026-06-28) also removed the minimal mustard "back to
            classroom" strip after the persistent search bar below
            turned out to do the same job — typing a new word in the
            persistent bar now preserves the ?cls= param so the kid
            stays in classroom mode and the search keeps logging.

            2026-08-25 (Gadi): the fully-stripped word page left kids with
            no way back to Class Notebook / Word Games / Say it. Restore the
            classroom topbar (the search itself stays in the persistent bar
            below). */}
        {classroomCode && <ClassroomTopbar code={classroomCode} lang={lang} />}
        {!classroomCode && !present && (
        <header className="wb-shell-topbar">
          <Link href={href("/")} className="wb-wordmark" dir="ltr" aria-label="Gadit home">
            Gad<span className="wb-wordmark-it">it</span>
          </Link>
          <WbShellNav />
          <div className="wb-shell-actions">
            {/* Present mode entry (schools only). Lives in the actions row
                rather than as a floating corner button so it can never sit
                on top of the mobile burger — .wb-shell-actions is hidden
                below 1024px, and projecting to a class screen is not a
                phone job anyway. Gadi 2026-09-08.
                Gated to !!wordSet (2026-09-09): a bare unlabelled square on
                EVERY word page for any school account read as clutter to a
                parent using Gadit normally. Projecting is a lesson activity,
                so the entry only belongs when the teacher is actually walking
                a curated word set (?set=…); a standalone word never shows it. */}
            {user && !!schoolId && !classroomCode && !!wordSet && (
              <button
                type="button"
                className="wb-shell-share"
                onClick={() => setPresent(true)}
                aria-label={presentLabels(lang).enter}
                title={`${presentLabels(lang).enter}. ${presentLabels(lang).hint}`}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3m13-5v3a2 2 0 0 1-2 2h-3" />
                </svg>
              </button>
            )}
            {/* Kid skin picker, so a kid can change their look from the word
                page too (it was on home/notebook/play but missing here, where
                the skin is most visible). Gadi 2026-08-21. */}
            {familyRole === "kid" && <AppearancePicker scope="kid" />}
            <KidsModeToggle
              plan={plan}
              onBasicGate={() => {
                if (!user) {
                  promptLogin(v2(lang, "kidsModeBasicGate"));
                  return;
                }
                setUpgradeTrigger({ feature: "kids", tier: "clear" });
              }}
            />
            {user && (
              <ShareButton
                url="https://www.gadit.app/"
                title={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).title}
                text=""
                shareLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).shareLabel}
                copiedLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).copiedLabel}
              />
            )}
            <WordbookLangSwitch />
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
                  {v2(lang, "signIn")}
                </button>
              </>
            )}
          </div>
        <div className="wb-shell-mobile-cta">
          <StartFreeCTA />
        </div>
        {/* Mobile identity cluster, Share + Avatar live inline next to
            the wordmark so the corner reads as "you, signed in" the way
            Google's mobile chrome does. Pulled out of the old
            wb-shell-share-mobile-wrap (which now holds only the Kids
            toggle). 2026-06-19 Gadi feedback. */}
        {user && (
          <div className="wb-shell-mobile-identity">
            {/* Kid skin picker on mobile (desktop one is in the hidden
                .wb-shell-actions), mirroring notebook/play. Gadi 2026-08-21. */}
            {familyRole === "kid" && <AppearancePicker scope="kid" />}
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
        <div className="wb-shell-share-mobile-wrap">
          {/* Mobile mirror of the Kids toggle. The desktop toggle lives
              inside .wb-shell-actions (hidden under 767px), so without
              this mirror a parent on a phone could not flip the mode
              mid-read. */}
          <KidsModeToggle
            plan={plan}
            onBasicGate={() => {
              if (!user) {
                promptLogin(v2(lang, "kidsModeBasicGate"));
                return;
              }
              setUpgradeTrigger({ feature: "kids", tier: "clear" });
            }}
          />
        </div>
        <div className="wb-shell-mobile-menu-cluster">
          {/* Burger FIRST so in RTL it sits at the inline-start (right) of the
              cluster and stays on-screen even if the row overflows — the lang
              switcher, less critical, is the one that clips off the left edge if
              anything does. Fixes the lang covering/hiding the burger on the
              word page (Gadi 2026-09-19). Present mode also gets a burger entry
              so a teacher projecting from a portrait tablet still has a way in. */}
          <WbShellBurger
            extra={
              user && !!schoolId && !classroomCode && !!wordSet
                ? (close) => (
                    <button
                      type="button"
                      className="wb-shell-mobile-link"
                      onClick={() => { close(); setPresent(true); }}
                    >
                      {presentLabels(lang).enter}
                    </button>
                  )
                : undefined
            }
          />
          <LangSwitchMobile />
        </div>

        </header>
        )}

        {/* Exit present mode. Only rendered while present mode is ON, when
            the topbar is hidden and this floating corner button is the only
            way back. The ENTRY button used to render here too, and that was
            the white square Gadi photographed on 2026-09-08: fixed
            insetInlineEnd:12 lands on the visual LEFT in RTL, which is
            exactly the mobile burger corner, and z-index 50 painted it over
            the menu cluster (z-index 4) so the menu could not be opened.
            The entry point now lives inline in .wb-shell-actions (see the
            topbar above), which is desktop-only — and present mode is a
            projector feature, so a phone never needed it. */}
        {user && !!schoolId && !classroomCode && present && (
          <button
            type="button"
            onClick={() => setPresent((p) => !p)}
            aria-label={presentLabels(lang).exit}
            title={presentLabels(lang).exit}
            style={{
              position: "fixed",
              top: 12,
              insetInlineEnd: 12,
              zIndex: 50,
              width: 40,
              height: 40,
              borderRadius: 10,
              border: "1px solid rgba(31,41,55,0.12)",
              background: "rgba(255,255,255,0.72)",
              color: "#6b7280",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              boxShadow: "0 1px 4px rgba(31,41,55,0.08)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* "Open dictionary" button, present mode only. We are showing
            words on the board, not searching, so the search field is
            hidden until the teacher taps this (schools, Gadi 2026-08-09). */}
        {present && user && !classroomCode && (
          <button
            type="button"
            onClick={() => setShowSearch((s) => !s)}
            style={{
              position: "fixed",
              top: 12,
              insetInlineStart: 12,
              zIndex: 50,
              height: 40,
              borderRadius: 999,
              border: "1px solid rgba(31,41,55,0.12)",
              background: showSearch ? "#0EA5A5" : "rgba(255,255,255,0.85)",
              color: showSearch ? "#fff" : "#0b7d7d",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "0 14px",
              fontWeight: 700,
              fontSize: 13.5,
              fontFamily: "inherit",
              boxShadow: "0 1px 4px rgba(31,41,55,0.08)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
            {pick(SEARCH_DICTIONARY_COPY, lang)}
          </button>
        )}

        {/* Word-set stepper: prev / position / next, fixed at the bottom
            so a teacher can walk a themed set on the projector. Arrow keys
            page too. */}
        {wordSet && setIdx >= 0 && (
          <div style={{ position: "fixed", insetInlineStart: 0, insetInlineEnd: 0, bottom: 16, display: "flex", justifyContent: "center", zIndex: 50, pointerEvents: "none" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.94)", border: "1px solid rgba(31,41,55,0.12)", borderRadius: 999, padding: "8px 12px", boxShadow: "0 4px 16px rgba(31,41,55,0.14)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", pointerEvents: "auto", maxWidth: "92vw" }}>
              <button
                type="button"
                aria-label="Previous word"
                disabled={setIdx <= 0}
                onClick={() => goToSetWord(wordSet.words[setIdx - 1])}
                style={{ width: 34, height: 34, borderRadius: 999, border: "none", background: setIdx <= 0 ? "#F3F4F6" : "#0EA5A5", color: setIdx <= 0 ? "#9CA3AF" : "#fff", cursor: setIdx <= 0 ? "default" : "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
              </button>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: "#374151", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {wordSet.title} · {setIdx + 1}/{wordSet.words.length}
              </span>
              <button
                type="button"
                aria-label="Next word"
                disabled={setIdx >= wordSet.words.length - 1}
                onClick={() => goToSetWord(wordSet.words[setIdx + 1])}
                style={{ width: 34, height: 34, borderRadius: 999, border: "none", background: setIdx >= wordSet.words.length - 1 ? "#F3F4F6" : "#0EA5A5", color: setIdx >= wordSet.words.length - 1 ? "#9CA3AF" : "#fff", cursor: setIdx >= wordSet.words.length - 1 ? "default" : "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
              </button>
            </div>
          </div>
        )}

        {/* Persistent search bar, Eyal (June 2026) flagged that
            — in classroom mode this bar fully replaces the regular
            topbar's search functionality (the bar's onSubmit
            preserves the ?cls= param so subsequent searches still
            log to the classroom). */}
        {/* (placeholder anchor — same comment block continues below) */}
        {/* Persistent search bar, Eyal (June 2026) flagged that
            launching a second search from a result page meant hunting
            for the magnifying-glass icon in the masthead. Many real
            dictionaries surface a full input bar above the word so a
            reader can chain lookups without breaking flow. We do the
            same: a single text field + submit that reuses the
            existing /word/[word] route. The input lives BETWEEN the
            chrome and the result body so the word title still anchors
            the page. */}
        {/* The searchbar wrap is wrapped in a sticky stage so the input
            stays in view as the reader scrolls past long etymology +
            idiom sections. Gadi 2026-06-26 audit fix M1. */}
        <div className="wb-word-searchbar-stage" style={present ? (showSearch ? { marginTop: 64, marginBottom: 20 } : { display: "none" }) : undefined}>
        <div className="wb-word-searchbar-wrap">
          <form
            className="wb-word-searchbar"
            onSubmit={(e) => {
              e.preventDefault();
              const q = headerQuery.trim();
              if (!q) return;
              setHeaderQuery("");
              // Preserve the classroom context when the persistent
              // search bar is used inside a classroom session — the
              // kid stays in classroom mode AND the new word gets
              // logged to the class search log via the existing
              // ?cls= side-effect. Without this, a kid who types a
              // second word into the persistent bar loses the
              // classroom branding and the log entry.
              const clsParam = classroomCode
                ? `?cls=${encodeURIComponent(classroomCode)}${classroomStudentName ? `&sn=${encodeURIComponent(classroomStudentName)}` : ""}`
                : "";
              router.push(href(wordPath(q, clsParam)));
            }}
          >
            {/* Convention layout, same recipe the homepage pill follows
                (LLM Council R3 2026-06-20): input at the START edge,
                action cluster (mic + magnifier-submit) at the END.
                Dropped the leading decorative magnifier and the labelled
                "Search" button; the trailing magnifier IS the submit
                now. Enter still submits. RTL auto-mirrors via the
                wordbook[dir] cascade. */}
            <input
              type="text"
              className="wb-word-searchbar-input"
              value={headerQuery}
              onChange={(e) => setHeaderQuery(e.target.value)}
              placeholder={v2(lang, "searchPlaceholderHome")}
              aria-label={v2(lang, "navSearch")}
              autoComplete="off"
              spellCheck={false}
            />
            <div className="wb-word-searchbar-mic">
              <VoiceInput
                uiLang={lang}
                getIdToken={async () => {
                  if (!user) return null;
                  try { return await user.getIdToken(); } catch { return null; }
                }}
                onResult={(text) => {
                  setHeaderQuery(text);
                  const clsParam = classroomCode
                ? `?cls=${encodeURIComponent(classroomCode)}${classroomStudentName ? `&sn=${encodeURIComponent(classroomStudentName)}` : ""}`
                : "";
                  router.push(href(wordPath(text.trim(), clsParam)));
                }}
                enabled={true}
                title={v2(lang, "voiceInputTitle")}
                size="sm"
              />
            </div>
            <button
              type="submit"
              className="wb-word-searchbar-submit"
              aria-label={v2(lang, "navSearch")}
              title={v2(lang, "navSearch")}
              disabled={!headerQuery.trim()}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="6.5" />
                <path d="m20 20-4-4" />
              </svg>
            </button>
          </form>
        </div>
        </div>

        {/* V2 main, holds quota walls, error messages, and the
            loading skeleton. Once the Wordbook result is loaded, this
            entire block is unmounted so the cream ResultView below
            sits flush against the MarketingHeader instead of being
            pushed offscreen by an empty 60px main wrapper. */}
        {!result && (
        <main
          style={{
            maxWidth: 880,
            margin: "0 auto",
            padding: "24px 24px 36px",
          }}
        >
          {quotaState.reached && (
            <SoftWall
              nextStep={quotaState.nextStep ?? "signup"}
              lang={lang}
              onSignUp={() => {
                promptLogin({
                  mode: "signup",
                  onSuccess: () => {
                    // Once they're signed in, retry the original word —
                    // they've now got the 20/day quota.
                    setQuotaState({ reached: false, nextStep: null });
                    fetchedFor.current = null;
                    setLoading(true);
                  },
                });
              }}
            />
          )}

          {errorMsg && !quotaState.reached && (
            <div
              className="gd-card"
              style={{ padding: "24px", marginBottom: 24 }}
            >
              <p
                className="gd-font-sans-ui"
                style={{ fontSize: 14, color: "var(--gd-ink-700)" }}
              >
                {errorMsg}
              </p>
            </div>
          )}

          {loading && !result && (
            <div style={{ paddingTop: 24 }}>
              <div className="wb-skeleton" style={{ height: 120 }} />
              <div className="wb-skeleton" style={{ height: 220 }} />
              <div className="wb-skeleton" style={{ height: 160 }} />
            </div>
          )}

        </main>
        )}

        {/* Wordbook redesign: ResultView renders full-width on its own
            cream paper, breaking out of the V2 navy `main` constraint
            above. Loading/error/soft-wall states still render inside
            the V2 main; once the result is loaded, the cream Wordbook
            page takes over.  See web/public/gadit-final.html. */}
        {result && typedOriginal && typedOriginal !== result.word && (
          <div className="wb-typo-banner" role="status">
            {(() => {
              const t = pick(TYPO_BANNER_COPY, lang);
              return (
                <>
                  {t.s1}<strong>{result.word}</strong>{t.s2}
                  {" · "}
                  <Link href={`/word/${encodeURIComponent(typedOriginal)}?stay=1`}>
                    {t.q1}&ldquo;{typedOriginal}&rdquo;{t.q2}
                  </Link>
                </>
              );
            })()}
          </div>
        )}
        {/* 'Back to <previous word>' chip, appears whenever the user
            landed on this page via the WordPopover's 'Open full
            definition' button (which appends ?back=<originalWord> so
            the destination knows where the reader came from). Clicking
            returns to the original word's page. Hidden in the normal
            search flow when there's no back context. */}
        {result && backWord && backWord.toLowerCase() !== result.word.toLowerCase() && (
          <div className="wb-back-chip-wrap">
            <Link href={href(`/word/${encodeURIComponent(backWord)}`)} className="wb-back-chip">
              <span aria-hidden="true">{dir === "rtl" ? "→" : "←"}</span>
              <span>
                {pick(BACK_TO_COPY, lang)}
                <strong>{backWord}</strong>
              </span>
            </Link>
          </div>
        )}
        {/* Inline image-gen error, surfaces the quota / failure /
            network error the silent path used to swallow. Self-
            dismissing close button so users can clear it once they've
            seen it. */}
        {result && imageError && (
          <div className="wb-image-error-banner" role="alert">
            <span>{imageError}</span>
            <button
              type="button"
              onClick={() => setImageError(null)}
              aria-label={pick(CLOSE_COPY, lang)}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}
        {result && (classroomMode ? (
          <div
            className="wb-classroom-card"
            style={{ maxWidth: 760, margin: "0 auto", paddingTop: 72, textAlign: dir === "rtl" ? "right" : "left" }}
          >
            {/* The word itself, big — this is what the class is looking at. */}
            <div style={{ fontSize: 46, lineHeight: 1.1, fontWeight: 800, color: "#0b7d7d", marginBottom: 16 }}>
              {result.word}
            </div>
            <p style={{ fontSize: 24, lineHeight: 1.65, fontWeight: 600, color: "#1f2937", margin: "0 0 20px" }}>
              {curatedDef(initialWord) ?? result.meanings[0]?.meaning ?? ""}
            </p>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={result.word}
                style={{ display: "block", maxWidth: 380, width: "100%", borderRadius: 14, margin: "0 auto 22px", boxShadow: "0 4px 18px rgba(31,41,55,0.10)" }}
              />
            ) : imageGenerating ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "20px 0", color: "#9CA3AF" }} aria-busy="true">
                <svg className="wb-image-spinner" width="40" height="40" viewBox="0 0 44 44" aria-hidden="true">
                  <circle cx="22" cy="22" r="18" fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="3" />
                  <circle cx="22" cy="22" r="18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="28 84" />
                </svg>
                <span style={{ fontSize: 14 }}>{pick(PREPARING_PICTURE_COPY, lang)}</span>
              </div>
            ) : null}
            {(() => {
              // Prefer the subject-appropriate curated examples; fall back
              // to the general define examples until (or unless) those land.
              const shownExamples = classroomExamples.length
                ? classroomExamples
                : result.meanings[0]?.examples ?? [];
              return shownExamples.length ? (
                <div style={{ marginTop: 6, display: "grid", gap: 10 }}>
                  {shownExamples.slice(0, 3).map((ex, i) => (
                    <div key={i} style={{ fontSize: 19, lineHeight: 1.6, color: "#374151" }}>
                      <span style={{ color: "#0EA5A5", fontWeight: 800, marginInlineEnd: 8 }}>{i + 1}</span>{ex}
                    </div>
                  ))}
                </div>
              ) : null;
            })()}
          </div>
        ) : (
          <ResultView
            result={displayResult ?? result}
            streaming={loading}
            showNiqqud={(isHebrewWord || isArabicWord) && !!user}
            niqqudOn={niqqud}
            onToggleNiqqud={toggleNiqqud}
            plan={plan}
            classroomInSession={classroomInSession}
            imageUrl={imageUrl}
            imageGenerating={imageGenerating}
            kidsImages={kidsImages}
            kidsImagesLoading={kidsImgLoading}
            isSaved={isSaved}
            onSave={handleSave}
            onShare={handleShare}
            isPinned={isPinned}
            onPin={plan === "clear" || plan === "deep" ? handlePin : undefined}
            onGenerate={handleGenerate}
            onUpgrade={handleUpgrade}
            onRegenerate={handleGenerate}
            onSaveImage={handleSave}
            onAction={handleAction}
            onReport={(section) => {
              const presetMap: Record<string, string> = {
                etymology: "etymology",
                idioms: "idioms",
              };
              const preset = section.startsWith("meaning-")
                ? "definition"
                : presetMap[section] ?? "";
              setReportContext({
                word: result.word,
                contextSnapshot: { section, result },
                defaultCategories: preset ? [preset] : [],
              });
            }}
          />
        ))}

        {/* HomeFooter intentionally omitted on /word pages, the V2
            navy footer clashes with the cream Wordbook surface. A
            cream-friendly footer (or no footer at all, matching the
            mockup) will be addressed in the homepage port. */}

        {!present && <GadVerbStamp />}
      </div>

      {result && (
        <ComposeModalV2
          open={composeOpen}
          onClose={() => setComposeOpen(false)}
          word={result.word}
          meanings={result.meanings.map((m) => m.meaning)}
        />
      )}

      <ReportModalV2
        open={reportContext !== null}
        onClose={() => setReportContext(null)}
        context={reportContext ?? undefined}
      />

      {result && (
        <QuizModalV2
          open={quizOpen}
          onClose={() => setQuizOpen(false)}
          word={result.word}
          meaning={result.meanings[0]?.meaning ?? ""}
          language={result.language}
        />
      )}

      {result && (
        <WordGameModal
          open={wordGameOpen}
          onClose={() => setWordGameOpen(false)}
          word={result.word}
          language={result.language}
          meaning={result.meanings[0]?.meaning ?? ""}
          examples={result.meanings.flatMap((m) => m.examples ?? []).filter((s) => typeof s === "string" && s.trim().length > 4)}
        />
      )}

      <UpgradeModal
        trigger={upgradeTrigger}
        lang={lang as "he" | "en" | "ar" | "ru" | "es" | "pt" | "fr"}
        dir={dir}
        onClose={() => setUpgradeTrigger(null)}
      />
    </div>
  );
}
