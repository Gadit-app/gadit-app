"use client";

/**
 * /family/add — owner adds a new family member.
 *
 * Two-step flow:
 *   1. Role picker — 4 cards (אבא/אמא/בן/בת).
 *   2. Name input + color picker, then "Add".
 *
 * On submit:
 *   - Writes a member doc to families/{ownerUid}/members/{auto-id}.
 *   - Routes to /family/[id]/pair so the owner can immediately
 *     generate a QR code for the new member's device.
 *   - For parents the owner adds (mother/father), this still routes
 *     to /pair, since the secondary parent also pairs via QR + code
 *     (same flow as kids, role claim differs).
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addDoc, collection, getDocs, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { db } from "@/lib/firebase";
import { MemberRole, MEMBER_COLORS, MAX_KIDS_PER_FAMILY, isParentRole } from "@/lib/family";

const COPY: Record<string, {
  title: string;
  step1: string;
  step2: string;
  father: string;
  mother: string;
  boy: string;
  girl: string;
  nameLabel: string;
  namePlaceholder: string;
  colorLabel: string;
  ageLabel?: string;
  back: string;
  cancel: string;
  add: string;
  adding: string;
  capReached: string;
}> = {
  he: {
    title: "מי מצטרף למשפחה?",
    step1: "בחרו תפקיד",
    step2: "שם וצבע",
    father: "אבא",
    mother: "אמא",
    boy: "בן",
    girl: "בת",
    nameLabel: "שם",
    namePlaceholder: "מאיה",
    colorLabel: "צבע אווטאר",
    ageLabel: "גיל (לא חובה)",
    back: "→ חזרה",
    cancel: "ביטול",
    add: "הוסף למשפחה",
    adding: "מוסיף...",
    capReached: `מנוי Family מוגבל ל-${MAX_KIDS_PER_FAMILY} ילדים. לא ניתן להוסיף עוד ילדים, אבל אפשר עדיין להוסיף הורה.`,
  },
  en: {
    title: "Who's joining the family?",
    step1: "Pick a role",
    step2: "Name & color",
    father: "Dad",
    mother: "Mom",
    boy: "Son",
    girl: "Daughter",
    nameLabel: "Name",
    namePlaceholder: "Maya",
    colorLabel: "Avatar color",
    ageLabel: "Age (optional)",
    back: "← Back",
    cancel: "Cancel",
    add: "Add to family",
    adding: "Adding...",
    capReached: `Family is limited to ${MAX_KIDS_PER_FAMILY} children. You can't add more children, but you can still add a parent.`,
  },
  zu: {
    title: "Ubani ojoyina umndeni?",
    step1: "Khetha indima",
    step2: "Igama nombala",
    father: "Ubaba",
    mother: "Umama",
    boy: "Indodana",
    girl: "Indodakazi",
    nameLabel: "Igama",
    namePlaceholder: "Maya",
    colorLabel: "Umbala we-avatar",
    ageLabel: "Iminyaka (akuphoqelekile)",
    back: "← Emuva",
    cancel: "Khansela",
    add: "Engeza emndenini",
    adding: "Kuyengezwa...",
    capReached: `I-Family ikhawulelwe ezinganeni ezingu-${MAX_KIDS_PER_FAMILY}. Awukwazi ukwengeza izingane ezengeziwe, kodwa usengakwazi ukwengeza umzali.`,
  },
  el: {
    title: "Ποιος μπαίνει στην οικογένεια;",
    step1: "Διάλεξε ρόλο",
    step2: "Όνομα και χρώμα",
    father: "Μπαμπάς",
    mother: "Μαμά",
    boy: "Γιος",
    girl: "Κόρη",
    nameLabel: "Όνομα",
    namePlaceholder: "Μαρία",
    colorLabel: "Χρώμα άβαταρ",
    ageLabel: "Ηλικία (προαιρετικό)",
    back: "← Πίσω",
    cancel: "Ακύρωση",
    add: "Προσθήκη στην οικογένεια",
    adding: "Προσθήκη...",
    capReached: `Το Family περιορίζεται σε ${MAX_KIDS_PER_FAMILY} παιδιά. Δεν μπορείς να προσθέσεις άλλα παιδιά, αλλά μπορείς ακόμη να προσθέσεις γονέα.`,
  },
  ru: {
    title: "Кто присоединяется к семье?",
    step1: "Выберите роль",
    step2: "Имя и цвет",
    father: "Папа",
    mother: "Мама",
    boy: "Сын",
    girl: "Дочь",
    nameLabel: "Имя",
    namePlaceholder: "Майя",
    colorLabel: "Цвет аватара",
    ageLabel: "Возраст (необязательно)",
    back: "← Назад",
    cancel: "Отмена",
    add: "Добавить в семью",
    adding: "Добавляем...",
    capReached: `Family ограничен ${MAX_KIDS_PER_FAMILY} детьми. Больше детей добавить нельзя, но можно добавить родителя.`,
  },
  hi: {
    title: "परिवार में कौन जुड़ रहा है?",
    step1: "भूमिका चुनें",
    step2: "नाम और रंग",
    father: "पापा",
    mother: "मम्मी",
    boy: "बेटा",
    girl: "बेटी",
    nameLabel: "नाम",
    namePlaceholder: "आर्या",
    colorLabel: "अवतार का रंग",
    ageLabel: "उम्र (वैकल्पिक)",
    back: "← वापस",
    cancel: "रद्द करें",
    add: "परिवार में जोड़ें",
    adding: "जोड़ रहे हैं...",
    capReached: `Family ${MAX_KIDS_PER_FAMILY} बच्चों तक सीमित है। और बच्चे नहीं जोड़ सकते, पर माता-पिता अब भी जोड़ सकते हैं।`,
  },
  am: {
    title: "ማን ነው ቤተሰቡን የሚቀላቀለው?",
    step1: "ሚና ይምረጡ",
    step2: "ስም እና ቀለም",
    father: "አባት",
    mother: "እናት",
    boy: "ወንድ ልጅ",
    girl: "ሴት ልጅ",
    nameLabel: "ስም",
    namePlaceholder: "ሰላም",
    colorLabel: "የአምሳያ ቀለም",
    ageLabel: "ዕድሜ (አማራጭ)",
    back: "← ተመለስ",
    cancel: "ሰርዝ",
    add: "ወደ ቤተሰቡ ጨምር",
    adding: "እየጨመርን ነው...",
    capReached: `Family እስከ ${MAX_KIDS_PER_FAMILY} ልጆች ብቻ ነው። ተጨማሪ ልጆች መጨመር አይቻልም፣ ግን አሁንም ወላጅ መጨመር ይችላሉ።`,
  },
  ar: {
    title: "من سينضم إلى العائلة؟",
    step1: "اختر الدور",
    step2: "الاسم واللون",
    father: "أب",
    mother: "أم",
    boy: "ابن",
    girl: "ابنة",
    nameLabel: "الاسم",
    namePlaceholder: "مريم",
    colorLabel: "لون الصورة الرمزية",
    ageLabel: "العمر (اختياري)",
    back: "→ رجوع",
    cancel: "إلغاء",
    add: "أضف إلى العائلة",
    adding: "جارٍ الإضافة...",
    capReached: `باقة Family تتسع لـ ${MAX_KIDS_PER_FAMILY} أطفال فقط. لا يمكن إضافة المزيد من الأطفال، لكن لا يزال بإمكانك إضافة أحد الوالدين.`,
  },
  es: {
    title: "¿Quién se une a la familia?",
    step1: "Elige un rol",
    step2: "Nombre y color",
    father: "Papá",
    mother: "Mamá",
    boy: "Hijo",
    girl: "Hija",
    nameLabel: "Nombre",
    namePlaceholder: "Sofía",
    colorLabel: "Color del avatar",
    ageLabel: "Edad (opcional)",
    back: "← Atrás",
    cancel: "Cancelar",
    add: "Añadir a la familia",
    adding: "Añadiendo...",
    capReached: `Family tiene un límite de ${MAX_KIDS_PER_FAMILY} hijos. No puedes añadir más hijos, pero sí puedes añadir a un padre o una madre.`,
  },
  pt: {
    title: "Quem vai entrar na família?",
    step1: "Escolha um papel",
    step2: "Nome e cor",
    father: "Pai",
    mother: "Mãe",
    boy: "Filho",
    girl: "Filha",
    nameLabel: "Nome",
    namePlaceholder: "Sofia",
    colorLabel: "Cor do avatar",
    ageLabel: "Idade (opcional)",
    back: "← Voltar",
    cancel: "Cancelar",
    add: "Adicionar à família",
    adding: "Adicionando...",
    capReached: `O Family tem limite de ${MAX_KIDS_PER_FAMILY} filhos. Não é possível adicionar mais filhos, mas você ainda pode adicionar um pai ou uma mãe.`,
  },
  fr: {
    title: "Qui rejoint la famille ?",
    step1: "Choisissez un rôle",
    step2: "Prénom et couleur",
    father: "Papa",
    mother: "Maman",
    boy: "Fils",
    girl: "Fille",
    nameLabel: "Prénom",
    namePlaceholder: "Léa",
    colorLabel: "Couleur de l'avatar",
    ageLabel: "Âge (facultatif)",
    back: "← Retour",
    cancel: "Annuler",
    add: "Ajouter à la famille",
    adding: "Ajout...",
    capReached: `Family est limité à ${MAX_KIDS_PER_FAMILY} enfants. Vous ne pouvez plus ajouter d'enfants, mais vous pouvez encore ajouter un parent.`,
  },
  de: {
    title: "Wer kommt zur Familie dazu?",
    step1: "Rolle wählen",
    step2: "Name und Farbe",
    father: "Papa",
    mother: "Mama",
    boy: "Sohn",
    girl: "Tochter",
    nameLabel: "Name",
    namePlaceholder: "Mia",
    colorLabel: "Avatar-Farbe",
    ageLabel: "Alter (optional)",
    back: "← Zurück",
    cancel: "Abbrechen",
    add: "Zur Familie hinzufügen",
    adding: "Wird hinzugefügt...",
    capReached: `Family ist auf ${MAX_KIDS_PER_FAMILY} Kinder begrenzt. Weitere Kinder können nicht hinzugefügt werden, ein Elternteil aber schon.`,
  },
  cs: {
    title: "Kdo se připojuje k rodině?",
    step1: "Vyberte roli",
    step2: "Jméno a barva",
    father: "Táta",
    mother: "Máma",
    boy: "Syn",
    girl: "Dcera",
    nameLabel: "Jméno",
    namePlaceholder: "Ema",
    colorLabel: "Barva avatara",
    ageLabel: "Věk (nepovinné)",
    back: "← Zpět",
    cancel: "Zrušit",
    add: "Přidat do rodiny",
    adding: "Přidáváme...",
    capReached: `Family je omezen na ${MAX_KIDS_PER_FAMILY} dětí. Další děti už přidat nelze, ale stále můžete přidat rodiče.`,
  },
  sk: {
    title: "Kto sa pridáva k rodine?",
    step1: "Vyberte rolu",
    step2: "Meno a farba",
    father: "Otec",
    mother: "Mama",
    boy: "Syn",
    girl: "Dcéra",
    nameLabel: "Meno",
    namePlaceholder: "Ema",
    colorLabel: "Farba avatara",
    ageLabel: "Vek (nepovinné)",
    back: "← Späť",
    cancel: "Zrušiť",
    add: "Pridať do rodiny",
    adding: "Pridávame...",
    capReached: `Family je obmedzený na ${MAX_KIDS_PER_FAMILY} detí. Ďalšie deti už pridať nemôžete, ale stále môžete pridať rodiča.`,
  },
  it: {
    title: "Chi si unisce alla famiglia?",
    step1: "Scegli un ruolo",
    step2: "Nome e colore",
    father: "Papà",
    mother: "Mamma",
    boy: "Figlio",
    girl: "Figlia",
    nameLabel: "Nome",
    namePlaceholder: "Giulia",
    colorLabel: "Colore dell'avatar",
    ageLabel: "Età (facoltativa)",
    back: "← Indietro",
    cancel: "Annulla",
    add: "Aggiungi alla famiglia",
    adding: "Aggiunta in corso...",
    capReached: `Family è limitato a ${MAX_KIDS_PER_FAMILY} figli. Non puoi aggiungere altri figli, ma puoi ancora aggiungere un genitore.`,
  },
  ja: {
    title: "家族に加わるのはだれですか？",
    step1: "役割を選ぶ",
    step2: "名前と色",
    father: "お父さん",
    mother: "お母さん",
    boy: "息子",
    girl: "娘",
    nameLabel: "名前",
    namePlaceholder: "さくら",
    colorLabel: "アバターの色",
    ageLabel: "年齢（任意）",
    back: "← 戻る",
    cancel: "キャンセル",
    add: "家族に追加",
    adding: "追加中...",
    capReached: `Family に登録できる子どもは ${MAX_KIDS_PER_FAMILY} 人までです。これ以上子どもは追加できませんが、保護者は追加できます。`,
  },
  uk: {
    title: "Хто приєднується до родини?",
    step1: "Оберіть роль",
    step2: "Ім'я та колір",
    father: "Тато",
    mother: "Мама",
    boy: "Син",
    girl: "Донька",
    nameLabel: "Ім'я",
    namePlaceholder: "Марія",
    colorLabel: "Колір аватара",
    ageLabel: "Вік (необов'язково)",
    back: "← Назад",
    cancel: "Скасувати",
    add: "Додати до родини",
    adding: "Додаємо...",
    capReached: `Family обмежено ${MAX_KIDS_PER_FAMILY} дітьми. Більше дітей додати не можна, але можна додати батька чи матір.`,
  },
  tr: {
    title: "Aileye kim katılıyor?",
    step1: "Bir rol seçin",
    step2: "Ad ve renk",
    father: "Baba",
    mother: "Anne",
    boy: "Oğul",
    girl: "Kız",
    nameLabel: "Ad",
    namePlaceholder: "Elif",
    colorLabel: "Avatar rengi",
    ageLabel: "Yaş (isteğe bağlı)",
    back: "← Geri",
    cancel: "İptal",
    add: "Aileye ekle",
    adding: "Ekleniyor...",
    capReached: `Family en fazla ${MAX_KIDS_PER_FAMILY} çocukla sınırlıdır. Daha fazla çocuk eklenemez, ancak yine de bir ebeveyn ekleyebilirsiniz.`,
  },
  pl: {
    title: "Kto dołącza do rodziny?",
    step1: "Wybierz rolę",
    step2: "Imię i kolor",
    father: "Tata",
    mother: "Mama",
    boy: "Syn",
    girl: "Córka",
    nameLabel: "Imię",
    namePlaceholder: "Zuzia",
    colorLabel: "Kolor awatara",
    ageLabel: "Wiek (opcjonalnie)",
    back: "← Wstecz",
    cancel: "Anuluj",
    add: "Dodaj do rodziny",
    adding: "Dodawanie...",
    capReached: `Family obejmuje maksymalnie ${MAX_KIDS_PER_FAMILY} dzieci. Nie można dodać więcej dzieci, ale nadal można dodać rodzica.`,
  },
  fa: {
    title: "چه کسی به خانواده می‌پیوندد؟",
    step1: "نقش را انتخاب کنید",
    step2: "نام و رنگ",
    father: "پدر",
    mother: "مادر",
    boy: "پسر",
    girl: "دختر",
    nameLabel: "نام",
    namePlaceholder: "مریم",
    colorLabel: "رنگ آواتار",
    ageLabel: "سن (اختیاری)",
    back: "→ بازگشت",
    cancel: "لغو",
    add: "افزودن به خانواده",
    adding: "در حال افزودن...",
    capReached: `اشتراک Family حداکثر ${MAX_KIDS_PER_FAMILY} فرزند دارد. امکان افزودن فرزند بیشتر نیست، اما هنوز می‌توانید یک والد اضافه کنید.`,
  },
  id: {
    title: "Siapa yang bergabung dengan keluarga?",
    step1: "Pilih peran",
    step2: "Nama dan warna",
    father: "Ayah",
    mother: "Ibu",
    boy: "Anak laki-laki",
    girl: "Anak perempuan",
    nameLabel: "Nama",
    namePlaceholder: "Aisyah",
    colorLabel: "Warna avatar",
    ageLabel: "Usia (opsional)",
    back: "← Kembali",
    cancel: "Batal",
    add: "Tambahkan ke keluarga",
    adding: "Menambahkan...",
    capReached: `Family dibatasi hingga ${MAX_KIDS_PER_FAMILY} anak. Anda tidak bisa menambah anak lagi, tetapi masih bisa menambahkan orang tua.`,
  },
  nl: {
    title: "Wie komt er bij het gezin?",
    step1: "Kies een rol",
    step2: "Naam en kleur",
    father: "Papa",
    mother: "Mama",
    boy: "Zoon",
    girl: "Dochter",
    nameLabel: "Naam",
    namePlaceholder: "Emma",
    colorLabel: "Avatarkleur",
    ageLabel: "Leeftijd (optioneel)",
    back: "← Terug",
    cancel: "Annuleren",
    add: "Toevoegen aan gezin",
    adding: "Bezig met toevoegen...",
    capReached: `Family is beperkt tot ${MAX_KIDS_PER_FAMILY} kinderen. Je kunt geen kinderen meer toevoegen, maar wel nog een ouder.`,
  },
  vi: {
    title: "Ai sẽ tham gia gia đình?",
    step1: "Chọn vai trò",
    step2: "Tên và màu",
    father: "Bố",
    mother: "Mẹ",
    boy: "Con trai",
    girl: "Con gái",
    nameLabel: "Tên",
    namePlaceholder: "Mai",
    colorLabel: "Màu ảnh đại diện",
    ageLabel: "Tuổi (không bắt buộc)",
    back: "← Quay lại",
    cancel: "Hủy",
    add: "Thêm vào gia đình",
    adding: "Đang thêm...",
    capReached: `Gói Family giới hạn ${MAX_KIDS_PER_FAMILY} con. Bạn không thể thêm con nữa, nhưng vẫn có thể thêm bố hoặc mẹ.`,
  },
  fil: {
    title: "Sino ang sasali sa pamilya?",
    step1: "Pumili ng papel",
    step2: "Pangalan at kulay",
    father: "Tatay",
    mother: "Nanay",
    boy: "Anak na lalaki",
    girl: "Anak na babae",
    nameLabel: "Pangalan",
    namePlaceholder: "Maria",
    colorLabel: "Kulay ng avatar",
    ageLabel: "Edad (opsyonal)",
    back: "← Bumalik",
    cancel: "Kanselahin",
    add: "Idagdag sa pamilya",
    adding: "Idinadagdag...",
    capReached: `Hanggang ${MAX_KIDS_PER_FAMILY} anak lang ang Family. Hindi ka na makakapagdagdag ng anak, pero puwede ka pang magdagdag ng magulang.`,
  },
  af: {
    title: "Wie sluit by die gesin aan?",
    step1: "Kies 'n rol",
    step2: "Naam en kleur",
    father: "Pa",
    mother: "Ma",
    boy: "Seun",
    girl: "Dogter",
    nameLabel: "Naam",
    namePlaceholder: "Anika",
    colorLabel: "Avatarkleur",
    ageLabel: "Ouderdom (opsioneel)",
    back: "← Terug",
    cancel: "Kanselleer",
    add: "Voeg by gesin",
    adding: "Voeg tans by...",
    capReached: `Family is beperk tot ${MAX_KIDS_PER_FAMILY} kinders. Jy kan nie meer kinders byvoeg nie, maar jy kan steeds 'n ouer byvoeg.`,
  },
  sw: {
    title: "Nani anajiunga na familia?",
    step1: "Chagua jukumu",
    step2: "Jina na rangi",
    father: "Baba",
    mother: "Mama",
    boy: "Mwana wa kiume",
    girl: "Binti",
    nameLabel: "Jina",
    namePlaceholder: "Amani",
    colorLabel: "Rangi ya avatar",
    ageLabel: "Umri (si lazima)",
    back: "← Rudi",
    cancel: "Ghairi",
    add: "Ongeza kwenye familia",
    adding: "Inaongeza...",
    capReached: `Family ina kikomo cha watoto ${MAX_KIDS_PER_FAMILY}. Huwezi kuongeza watoto zaidi, lakini bado unaweza kuongeza mzazi.`,
  },
  "zh-CN": {
    title: "谁要加入家庭？",
    step1: "选择角色",
    step2: "名字和颜色",
    father: "爸爸",
    mother: "妈妈",
    boy: "儿子",
    girl: "女儿",
    nameLabel: "名字",
    namePlaceholder: "小雨",
    colorLabel: "头像颜色",
    ageLabel: "年龄（选填）",
    back: "← 返回",
    cancel: "取消",
    add: "添加到家庭",
    adding: "正在添加...",
    capReached: `Family 最多可添加 ${MAX_KIDS_PER_FAMILY} 个孩子。无法再添加孩子，但仍然可以添加家长。`,
  },
  "zh-TW": {
    title: "誰要加入家庭？",
    step1: "選擇角色",
    step2: "名字和顏色",
    father: "爸爸",
    mother: "媽媽",
    boy: "兒子",
    girl: "女兒",
    nameLabel: "名字",
    namePlaceholder: "小雨",
    colorLabel: "頭像顏色",
    ageLabel: "年齡（選填）",
    back: "← 返回",
    cancel: "取消",
    add: "加入家庭",
    adding: "正在新增...",
    capReached: `Family 最多可新增 ${MAX_KIDS_PER_FAMILY} 個孩子。無法再新增孩子，但仍然可以新增家長。`,
  },
  ko: {
    title: "누가 가족에 합류하나요?",
    step1: "역할 선택",
    step2: "이름과 색상",
    father: "아빠",
    mother: "엄마",
    boy: "아들",
    girl: "딸",
    nameLabel: "이름",
    namePlaceholder: "지우",
    colorLabel: "아바타 색상",
    ageLabel: "나이 (선택)",
    back: "← 뒤로",
    cancel: "취소",
    add: "가족에 추가",
    adding: "추가하는 중...",
    capReached: `Family에는 자녀를 최대 ${MAX_KIDS_PER_FAMILY}명까지 추가할 수 있어요. 자녀는 더 추가할 수 없지만 부모는 추가할 수 있어요.`,
  },
  th: {
    title: "ใครจะเข้าร่วมครอบครัว?",
    step1: "เลือกบทบาท",
    step2: "ชื่อและสี",
    father: "พ่อ",
    mother: "แม่",
    boy: "ลูกชาย",
    girl: "ลูกสาว",
    nameLabel: "ชื่อ",
    namePlaceholder: "มะลิ",
    colorLabel: "สีอวาตาร์",
    ageLabel: "อายุ (ไม่บังคับ)",
    back: "← ย้อนกลับ",
    cancel: "ยกเลิก",
    add: "เพิ่มในครอบครัว",
    adding: "กำลังเพิ่ม...",
    capReached: `Family จำกัดลูกไว้ที่ ${MAX_KIDS_PER_FAMILY} คน เพิ่มลูกไม่ได้อีกแล้ว แต่ยังเพิ่มผู้ปกครองได้`,
  },
  bn: {
    title: "পরিবারে কে যোগ দিচ্ছে?",
    step1: "ভূমিকা বেছে নিন",
    step2: "নাম ও রং",
    father: "বাবা",
    mother: "মা",
    boy: "ছেলে",
    girl: "মেয়ে",
    nameLabel: "নাম",
    namePlaceholder: "মায়া",
    colorLabel: "অ্যাভাটারের রং",
    ageLabel: "বয়স (ঐচ্ছিক)",
    back: "← ফিরে যান",
    cancel: "বাতিল",
    add: "পরিবারে যোগ করুন",
    adding: "যোগ করা হচ্ছে...",
    capReached: `Family-তে সর্বোচ্চ ${MAX_KIDS_PER_FAMILY}টি সন্তান যোগ করা যায়। আর সন্তান যোগ করা যাবে না, তবে এখনও একজন অভিভাবক যোগ করতে পারবেন।`,
  },
  da: {
    title: "Hvem bliver en del af familien?",
    step1: "Vælg en rolle",
    step2: "Navn og farve",
    father: "Far",
    mother: "Mor",
    boy: "Søn",
    girl: "Datter",
    nameLabel: "Navn",
    namePlaceholder: "Emma",
    colorLabel: "Avatarfarve",
    ageLabel: "Alder (valgfrit)",
    back: "← Tilbage",
    cancel: "Annuller",
    add: "Tilføj til familien",
    adding: "Tilføjer...",
    capReached: `Family er begrænset til ${MAX_KIDS_PER_FAMILY} børn. Du kan ikke tilføje flere børn, men du kan stadig tilføje en forælder.`,
  },
  hu: {
    title: "Ki csatlakozik a családhoz?",
    step1: "Válassz szerepet",
    step2: "Név és szín",
    father: "Apa",
    mother: "Anya",
    boy: "Fiú",
    girl: "Lány",
    nameLabel: "Név",
    namePlaceholder: "Anna",
    colorLabel: "Avatar színe",
    ageLabel: "Életkor (nem kötelező)",
    back: "← Vissza",
    cancel: "Mégse",
    add: "Hozzáadás a családhoz",
    adding: "Hozzáadás...",
    capReached: `A Family legfeljebb ${MAX_KIDS_PER_FAMILY} gyereket enged. Több gyereket nem adhatsz hozzá, de szülőt még igen.`,
  },
};

const ROLE_DEFS: Array<{ role: MemberRole; iconViewBox: string; iconPath: string }> = [
  // Mars symbol
  { role: "father", iconViewBox: "0 0 24 24", iconPath: "M14 4h6v6 M20 4l-7 7 M11 14a5 5 0 1 1-3.5-8.5 5 5 0 0 1 3.5 8.5z" },
  // Venus symbol
  { role: "mother", iconViewBox: "0 0 24 24", iconPath: "M12 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10z M12 14v6 M9 18h6" },
  // Smiley
  { role: "boy", iconViewBox: "0 0 24 24", iconPath: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M8.5 10v.5 M15.5 10v.5 M8.5 14.5c1.2 1.2 5 1.2 7 0" },
  // Bow
  { role: "girl", iconViewBox: "0 0 24 24", iconPath: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M8.5 10v.5 M15.5 10v.5 M8.5 14.5c1.2 1.2 5 1.2 7 0 M5 4l4 4 M19 4l-4 4" },
];

export function FamilyAddClient() {
  const { user, loading } = useAuth();
  const { lang, dir } = useLang();
  const href = useHref();
  const router = useRouter();
  const c = COPY[lang] ?? COPY.en;

  const [role, setRole] = useState<MemberRole | null>(null);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [colorIndex, setColorIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [childCount, setChildCount] = useState<number | null>(null);

  // Snapshot the family's current child count once on mount. This is the
  // gate that prevents the parent from adding a 6th child on the Family
  // plan. Picking up here instead of subscribing because the parent flow
  // is short-lived: pick role -> add -> redirect.
  useEffect(() => {
    if (!user) return;
    void (async () => {
      try {
        const snap = await getDocs(collection(db, "families", user.uid, "members"));
        const kids = snap.docs.filter((d) => !isParentRole(d.data().role)).length;
        setChildCount(kids);
      } catch {
        setChildCount(0);
      }
    })();
  }, [user]);

  const atKidCap =
    role !== null && !isParentRole(role) && childCount !== null && childCount >= MAX_KIDS_PER_FAMILY;

  async function addMember() {
    if (!user || !role) return;
    if (atKidCap) return;
    setSaving(true);
    try {
      // Age is only meaningful for a child, and it's optional. Stored so we
      // can tune reading level / defaults by age later (Gadi 2026-09-19).
      const ageNum = !isParentRole(role) && age.trim() ? Math.max(3, Math.min(18, parseInt(age, 10) || 0)) : 0;
      const ref = await addDoc(collection(db, "families", user.uid, "members"), {
        role,
        name: name.trim(),
        colorIndex,
        isOwner: false,
        ...(ageNum ? { age: ageNum } : {}),
        createdAt: serverTimestamp(),
      });
      router.push(href(`/family/${ref.id}/pair`));
    } catch (e) {
      console.error("add member failed:", e);
      setSaving(false);
    }
  }

  if (loading || !user) {
    return <div className="wordbook wb-family-page" dir={dir}>&nbsp;</div>;
  }

  return (
    <div className="wordbook wb-family-page" dir={dir}>
      <main className="wb-family-main">
        <Link href={href("/family")} className="wb-family-back">{c.back}</Link>

        <header className="wb-family-header">
          <h1 className="wb-family-title">{c.title}</h1>
          <p className="wb-family-sub">{role ? c.step2 : c.step1}</p>
        </header>

        {!role ? (
          <div className="wb-family-role-grid">
            {ROLE_DEFS.map((r, i) => (
              <button
                key={r.role}
                type="button"
                className="wb-family-role-card"
                onClick={() => {
                  setRole(r.role);
                  setColorIndex(i % MEMBER_COLORS.length);
                }}
              >
                <div className="wb-family-role-icon" style={{ background: MEMBER_COLORS[i] }}>
                  <svg width="32" height="32" viewBox={r.iconViewBox} fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d={r.iconPath} />
                  </svg>
                </div>
                <div className="wb-family-role-label">{c[r.role]}</div>
              </button>
            ))}
          </div>
        ) : (
          <div className="wb-family-add-form">
            {atKidCap && (
              <div className="wb-family-cap-pill" style={{ alignSelf: "stretch" }}>
                {c.capReached}
              </div>
            )}
            <label className="wb-family-field">
              <span className="wb-family-field-label">{c.nameLabel}</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={c.namePlaceholder}
                autoFocus
                className="wb-family-field-input"
              />
            </label>

            {role !== null && !isParentRole(role) && (
              <label className="wb-family-field">
                <span className="wb-family-field-label">{c.ageLabel ?? COPY.en.ageLabel}</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={3}
                  max={18}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="8"
                  className="wb-family-field-input"
                  style={{ maxWidth: 120 }}
                />
              </label>
            )}

            <div className="wb-family-field">
              <span className="wb-family-field-label">{c.colorLabel}</span>
              <div className="wb-family-color-row">
                {MEMBER_COLORS.map((color, i) => (
                  <button
                    key={color}
                    type="button"
                    className={`wb-family-color-dot${i === colorIndex ? " is-selected" : ""}`}
                    style={{ background: color }}
                    onClick={() => setColorIndex(i)}
                    aria-label={`color ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="wb-family-form-actions">
              <button
                type="button"
                className="wb-family-cta-ghost"
                onClick={() => setRole(null)}
                disabled={saving}
              >
                {c.cancel}
              </button>
              <button
                type="button"
                className="wb-family-cta"
                onClick={addMember}
                disabled={saving || atKidCap}
              >
                {saving ? c.adding : c.add}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
