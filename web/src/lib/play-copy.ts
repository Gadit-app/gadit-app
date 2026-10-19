/**
 * Neutral copy for Play mode (the Android Play app and the iOS App Store app,
 * html[data-play="1"]). Inside the apps nothing may be sold and no text may
 * point to buying elsewhere (Google Play Payments policy, Apple App Review
 * 3.1.1 / 3.1.3), so where the web shows an upgrade wall the apps show one
 * plain line instead: no plan name, no price, no link.
 *
 * Render both: the web variant tagged .gd-buy (hidden in Play mode) and this
 * one tagged .gd-play-only (shown ONLY in Play mode, globals.css). Pure CSS,
 * so the first server paint is already right in either mode.
 */

const NOT_ACTIVE: Record<string, string> = {
  en: "This option isn't active on this account.",
  he: "האפשרות הזו לא פעילה בחשבון הזה.",
  ar: "هذا الخيار غير مفعّل في هذا الحساب.",
  ru: "Эта возможность не активна в этом аккаунте.",
  es: "Esta opción no está activa en esta cuenta.",
  pt: "Esta opção não está ativa nesta conta.",
  fr: "Cette option n'est pas active sur ce compte.",
  de: "Diese Option ist für dieses Konto nicht aktiv.",
  cs: "Tato možnost není u tohoto účtu aktivní.",
  sk: "Táto možnosť nie je v tomto účte aktívna.",
  it: "Questa opzione non è attiva su questo account.",
  ja: "このアカウントではこの機能は有効になっていません。",
  hi: "यह विकल्प इस खाते पर सक्रिय नहीं है।",
  am: "ይህ አማራጭ በዚህ መለያ ላይ አልነቃም።",
  uk: "Ця можливість не активна в цьому акаунті.",
  tr: "Bu seçenek bu hesapta etkin değil.",
  pl: "Ta opcja nie jest aktywna na tym koncie.",
  fa: "این گزینه در این حساب فعال نیست.",
  id: "Opsi ini tidak aktif di akun ini.",
  nl: "Deze optie is niet actief op dit account.",
  el: "Αυτή η επιλογή δεν είναι ενεργή σε αυτόν τον λογαριασμό.",
  zu: "Lokhu akukasebenzi kule akhawunti.",
  vi: "Tùy chọn này chưa được bật cho tài khoản này.",
  fil: "Hindi aktibo ang opsyong ito sa account na ito.",
  af: "Hierdie opsie is nie aktief op hierdie rekening nie.",
  sw: "Chaguo hili halijawashwa kwenye akaunti hii.",
  "zh-CN": "此账户未启用该功能。",
  "zh-TW": "此帳戶未啟用這項功能。",
  ko: "이 계정에서는 이 기능이 활성화되어 있지 않습니다.",
  th: "ตัวเลือกนี้ยังไม่เปิดใช้งานในบัญชีนี้",
  bn: "এই অ্যাকাউন্টে এই বিকল্পটি চালু নেই।",
  da: "Denne mulighed er ikke aktiv på denne konto.",
  hu: "Ez a lehetőség nem aktív ezen a fiókon.",
  xh: "Olu khetho alusebenzi kule akhawunti.",
  nso: "Kgetho ye ga e šome akhaonteng ye.",
  tn: "Kgetho e ga e dire mo akhaontong e.",
  st: "Kgetho ena ha e sebetse akhaontong ena.",
  ts: "Ntlawulo leyi a yi tirhi eka akhawunti leyi.",
  ss: "Lokukhetsa akusebenti kule-akhawunti.",
  ve: "Khetho iyi a i khou shuma kha akhaunthu iyi.",
  nr: "Ukukhetha lokhu akusebenzi ku-akhawunthi le.",
};

const LIMIT_RESETS: Record<string, string> = {
  en: "The limit resets tomorrow.",
  he: "המכסה מתחדשת מחר.",
  ar: "يتجدد الحد غدًا.",
  ru: "Лимит обновится завтра.",
  es: "El límite se renueva mañana.",
  pt: "O limite renova amanhã.",
  fr: "La limite se renouvelle demain.",
  de: "Das Limit wird morgen zurückgesetzt.",
  cs: "Limit se obnoví zítra.",
  sk: "Limit sa obnoví zajtra.",
  it: "Il limite si rinnova domani.",
  ja: "上限は明日リセットされます。",
  hi: "सीमा कल फिर से शुरू होगी।",
  am: "ገደቡ ነገ ይታደሳል።",
  uk: "Ліміт оновиться завтра.",
  tr: "Sınır yarın yenilenir.",
  pl: "Limit odnowi się jutro.",
  fa: "سقف فردا دوباره شروع می\u200cشود.",
  id: "Batasnya diatur ulang besok.",
  nl: "De limiet wordt morgen vernieuwd.",
  el: "Το όριο ανανεώνεται αύριο.",
  zu: "Umkhawulo uzovuseleleka kusasa.",
  vi: "Giới hạn sẽ được đặt lại vào ngày mai.",
  fil: "Magre-reset ang limit bukas.",
  af: "Die limiet word môre herstel.",
  sw: "Kikomo kitaanza upya kesho.",
  "zh-CN": "额度明天重置。",
  "zh-TW": "額度明天重置。",
  ko: "한도는 내일 초기화됩니다.",
  th: "ขีดจำกัดจะเริ่มใหม่พรุ่งนี้",
  bn: "সীমা আগামীকাল আবার শুরু হবে।",
  da: "Grænsen nulstilles i morgen.",
  hu: "A korlát holnap megújul.",
  xh: "Umda uza kuhlaziywa ngomso.",
  nso: "Kelelo e tla thoma gape gosasa.",
  tn: "Selekanyo se tla simolola sešwa ka moso.",
  st: "Moedi o tla qala bocha hosane.",
  ts: "Mpimo wu ta sungula nakambe mundzuku.",
  ss: "Umkhawulo utawucala kabusha kusasa.",
  ve: "Mukano u ḓo thoma hafhu matshelo.",
  nr: "Umkhawulo uzokuthoma kabutjha kusasa.",
};

/** "The limit resets tomorrow." (the daily search wall inside the apps). */
export function playLimitResets(lang: string): string {
  return LIMIT_RESETS[lang] ?? LIMIT_RESETS.en;
}

/** "This option isn't active on this account." in the UI language. */
export function playNotActive(lang: string): string {
  return NOT_ACTIVE[lang] ?? NOT_ACTIVE.en;
}

/** Client-side: is this tab in Play mode (Android Play app or iOS app)?
 *  Reads the html[data-play] mark set by the server and the layout script.
 *  For click handlers and effects only; for what is RENDERED use the
 *  .gd-buy / .gd-play-only classes so the server paint is right. */
export function isPlayModeClient(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.getAttribute("data-play") === "1";
}
