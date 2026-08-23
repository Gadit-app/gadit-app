"use client";

/**
 * Coaches section for the /family owner dashboard (Gadi 2026-08-22). The
 * parent grants a coach access to a specific child by email, sees active
 * grants, and can revoke any of them. Self-contained: fetches the family's
 * children (via switch-member) and the grants (via /api/family/coach).
 */
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";

type Member = { id: string; name: string; isOwner: boolean };
type Grant = { id: string; coachEmail: string; memberId: string; memberName: string };

const T: Record<string, {
  title: string; lede: string; emailPh: string; childPh: string; add: string; adding: string;
  none: string; revoke: string; forChild: string; invalidEmail: string; pickChild: string; err: string;
}> = {
  ar: { title: "المدرّبون", lede: "امنح المدرّب صلاحية الوصول إلى ملف الطفل لإضافة كلمات أثناء الدروس. يمكنك إلغاء الصلاحية في أي وقت.", emailPh: "البريد الإلكتروني للمدرّب", childPh: "أي طفل؟", add: "منح الصلاحية", adding: "جارٍ المنح...", none: "لا يوجد مدرّبون بعد.", revoke: "إلغاء", forChild: "لـ", invalidEmail: "أدخل بريدًا إلكترونيًا صحيحًا.", pickChild: "اختر طفلًا.", err: "حدث خطأ ما. حاول مرة أخرى." },
  ru: { title: "Наставники", lede: "Дайте наставнику доступ к профилю ребёнка, чтобы добавлять слова во время занятий. Доступ можно отозвать в любой момент.", emailPh: "Эл. почта наставника", childPh: "Какой ребёнок?", add: "Предоставить доступ", adding: "Предоставляем...", none: "Наставников пока нет.", revoke: "Отозвать", forChild: "для", invalidEmail: "Введите корректный адрес эл. почты.", pickChild: "Выберите ребёнка.", err: "Что-то пошло не так. Попробуйте ещё раз." },
  es: { title: "Tutores", lede: "Da a un tutor acceso al perfil de un niño para añadir palabras durante las clases. Puedes revocarlo cuando quieras.", emailPh: "Correo del tutor", childPh: "¿Qué niño?", add: "Dar acceso", adding: "Dando acceso...", none: "Aún no hay tutores.", revoke: "Revocar", forChild: "para", invalidEmail: "Introduce un correo válido.", pickChild: "Elige un niño.", err: "Algo salió mal. Inténtalo de nuevo." },
  pt: { title: "Tutores", lede: "Dê a um tutor acesso ao perfil de uma criança para adicionar palavras durante as aulas. Você pode revogar quando quiser.", emailPh: "E-mail do tutor", childPh: "Qual criança?", add: "Conceder acesso", adding: "Concedendo...", none: "Ainda não há tutores.", revoke: "Revogar", forChild: "para", invalidEmail: "Digite um e-mail válido.", pickChild: "Escolha uma criança.", err: "Algo deu errado. Tente de novo." },
  fr: { title: "Tuteurs", lede: "Donnez à un tuteur l'accès au profil d'un enfant pour ajouter des mots pendant les leçons. Vous pouvez révoquer l'accès à tout moment.", emailPh: "E-mail du tuteur", childPh: "Quel enfant ?", add: "Accorder l'accès", adding: "Attribution...", none: "Aucun tuteur pour l'instant.", revoke: "Révoquer", forChild: "pour", invalidEmail: "Saisissez une adresse e-mail valide.", pickChild: "Choisissez un enfant.", err: "Une erreur s'est produite. Réessayez." },
  de: { title: "Lernbegleiter", lede: "Gib einem Lernbegleiter Zugriff auf das Profil eines Kindes, um während der Stunden Wörter hinzuzufügen. Du kannst den Zugriff jederzeit entziehen.", emailPh: "E-Mail des Lernbegleiters", childPh: "Welches Kind?", add: "Zugriff gewähren", adding: "Wird gewährt...", none: "Noch keine Lernbegleiter.", revoke: "Entziehen", forChild: "für", invalidEmail: "Gib eine gültige E-Mail-Adresse ein.", pickChild: "Wähle ein Kind.", err: "Etwas ist schiefgelaufen. Versuch es nochmal." },
  cs: { title: "Lektoři", lede: "Dejte lektorovi přístup k profilu dítěte, aby mohl během lekcí přidávat slova. Přístup můžete kdykoli zrušit.", emailPh: "E-mail lektora", childPh: "Které dítě?", add: "Udělit přístup", adding: "Uděluji...", none: "Zatím žádní lektoři.", revoke: "Zrušit", forChild: "pro", invalidEmail: "Zadejte platný e-mail.", pickChild: "Vyberte dítě.", err: "Něco se pokazilo. Zkuste to znovu." },
  sk: { title: "Lektori", lede: "Dajte lektorovi prístup k profilu dieťaťa, aby mohol počas hodín pridávať slová. Prístup môžete kedykoľvek zrušiť.", emailPh: "E-mail lektora", childPh: "Ktoré dieťa?", add: "Udeliť prístup", adding: "Udeľujem...", none: "Zatiaľ žiadni lektori.", revoke: "Zrušiť", forChild: "pre", invalidEmail: "Zadajte platný e-mail.", pickChild: "Vyberte dieťa.", err: "Niečo sa pokazilo. Skúste to znova." },
  it: { title: "Tutor", lede: "Dai a un tutor l'accesso al profilo di un bambino per aggiungere parole durante le lezioni. Puoi revocarlo quando vuoi.", emailPh: "Email del tutor", childPh: "Quale bambino?", add: "Concedi l'accesso", adding: "Concessione in corso...", none: "Ancora nessun tutor.", revoke: "Revoca", forChild: "per", invalidEmail: "Inserisci un'email valida.", pickChild: "Scegli un bambino.", err: "Qualcosa è andato storto. Riprova." },
  ja: { title: "コーチ", lede: "コーチに子どものプロフィールへのアクセスを許可すると、レッスン中に単語を追加できます。いつでも取り消せます。", emailPh: "コーチのメールアドレス", childPh: "どの子ども？", add: "アクセスを許可", adding: "許可しています...", none: "まだコーチがいません。", revoke: "取り消す", forChild: "対象", invalidEmail: "有効なメールアドレスを入力してください。", pickChild: "子どもを選んでください。", err: "問題が発生しました。もう一度お試しください。" },
  hi: { title: "कोच", lede: "किसी कोच को बच्चे की प्रोफ़ाइल तक पहुँच दें ताकि वे कक्षाओं के दौरान शब्द जोड़ सकें. आप इसे कभी भी रद्द कर सकते हैं.", emailPh: "कोच का ईमेल", childPh: "कौन सा बच्चा?", add: "पहुँच दें", adding: "दी जा रही है...", none: "अभी तक कोई कोच नहीं.", revoke: "रद्द करें", forChild: "के लिए", invalidEmail: "एक मान्य ईमेल दर्ज करें.", pickChild: "एक बच्चा चुनें.", err: "कुछ गलत हो गया. फिर से कोशिश करें." },
  am: { title: "አሰልጣኞች", lede: "በትምህርት ጊዜ ቃላት እንዲጨምር አሰልጣኝ ወደ ልጅ መገለጫ መዳረሻ ስጡ። በማንኛውም ጊዜ መሰረዝ ይችላሉ።", emailPh: "የአሰልጣኝ ኢሜይል", childPh: "የትኛው ልጅ?", add: "መዳረሻ ስጥ", adding: "በመስጠት ላይ...", none: "እስካሁን አሰልጣኞች የሉም።", revoke: "ሻር", forChild: "ለ", invalidEmail: "ትክክለኛ ኢሜይል ያስገቡ።", pickChild: "ልጅ ይምረጡ።", err: "የሆነ ችግር ተፈጥሯል። እንደገና ሞክር።" },
  uk: { title: "Наставники", lede: "Надайте наставнику доступ до профілю дитини, щоб додавати слова під час занять. Можна скасувати будь-коли.", emailPh: "Email наставника", childPh: "Яка дитина?", add: "Надати доступ", adding: "Надаємо...", none: "Наставників поки немає.", revoke: "Скасувати", forChild: "для", invalidEmail: "Введіть дійсний email.", pickChild: "Виберіть дитину.", err: "Щось пішло не так. Спробуйте ще раз." },
  tr: { title: "Koçlar", lede: "Ders sırasında kelime eklemesi için bir koça çocuğun profiline erişim verin. İstediğiniz zaman iptal edebilirsiniz.", emailPh: "Koçun e-postası", childPh: "Hangi çocuk?", add: "Erişim ver", adding: "Veriliyor...", none: "Henüz koç yok.", revoke: "İptal et", forChild: "için", invalidEmail: "Geçerli bir e-posta girin.", pickChild: "Bir çocuk seç.", err: "Bir şeyler ters gitti. Tekrar deneyin." },
  pl: { title: "Korepetytorzy", lede: "Daj korepetytorowi dostęp do profilu dziecka, aby dodawał słowa podczas lekcji. Możesz cofnąć dostęp w każdej chwili.", emailPh: "E-mail korepetytora", childPh: "Które dziecko?", add: "Przyznaj dostęp", adding: "Przyznawanie...", none: "Brak korepetytorów.", revoke: "Cofnij", forChild: "dla", invalidEmail: "Podaj prawidłowy e-mail.", pickChild: "Wybierz dziecko.", err: "Coś poszło nie tak. Spróbuj ponownie." },
  fa: { title: "مربیان", lede: "به یک مربی دسترسی به پروفایل کودک بدهید تا در طول درس‌ها کلمه اضافه کند. هر زمان می‌توانید لغو کنید.", emailPh: "ایمیل مربی", childPh: "کدام کودک؟", add: "اعطای دسترسی", adding: "در حال اعطا...", none: "هنوز مربی‌ای وجود ندارد.", revoke: "لغو", forChild: "برای", invalidEmail: "یک ایمیل معتبر وارد کنید.", pickChild: "یک کودک انتخاب کنید.", err: "مشکلی پیش آمد. دوباره امتحان کنید." },
  id: { title: "Pengajar", lede: "Beri pengajar akses ke profil anak untuk menambahkan kata saat pelajaran. Bisa dicabut kapan saja.", emailPh: "Email pengajar", childPh: "Anak yang mana?", add: "Beri akses", adding: "Memberi akses...", none: "Belum ada pengajar.", revoke: "Cabut", forChild: "untuk", invalidEmail: "Masukkan email yang valid.", pickChild: "Pilih anak.", err: "Terjadi kesalahan. Coba lagi." },
  nl: { title: "Begeleiders", lede: "Geef een begeleider toegang tot het profiel van een kind om woorden toe te voegen tijdens de les. Je kunt de toegang altijd intrekken.", emailPh: "E-mail van begeleider", childPh: "Welk kind?", add: "Toegang geven", adding: "Bezig met geven...", none: "Nog geen begeleiders.", revoke: "Intrekken", forChild: "voor", invalidEmail: "Voer een geldig e-mailadres in.", pickChild: "Kies een kind.", err: "Er ging iets mis. Probeer opnieuw." },
  el: { title: "Εκπαιδευτές", lede: "Δώστε σε έναν εκπαιδευτή πρόσβαση στο προφίλ ενός παιδιού για να προσθέτει λέξεις κατά τη διάρκεια των μαθημάτων. Μπορείτε να την ανακαλέσετε ανά πάσα στιγμή.", emailPh: "Email εκπαιδευτή", childPh: "Ποιο παιδί;", add: "Παραχώρηση πρόσβασης", adding: "Παραχώρηση...", none: "Δεν υπάρχουν ακόμη εκπαιδευτές.", revoke: "Ανάκληση", forChild: "για", invalidEmail: "Εισάγετε έγκυρο email.", pickChild: "Επιλέξτε ένα παιδί.", err: "Κάτι πήγε στραβά. Δοκιμάστε ξανά." },
  zu: { title: "Abaqeqeshi", lede: "Nikeza umqeqeshi ukufinyelela kuphrofayela yengane ukuze engeze amagama phakathi nezifundo. Ungakususa noma nini.", emailPh: "I-imeyili yomqeqeshi", childPh: "Iyiphi ingane?", add: "Nikeza ukufinyelela", adding: "Iyanikezwa...", none: "Abekho abaqeqeshi okwamanje.", revoke: "Susa", forChild: "ku", invalidEmail: "Faka i-imeyili evumelekile.", pickChild: "Khetha ingane.", err: "Kukhona okungahambanga kahle. Zama futhi." },
  vi: { title: "Gia sư", lede: "Cho gia sư quyền truy cập hồ sơ của trẻ để thêm từ trong buổi học. Bạn có thể thu hồi bất cứ lúc nào.", emailPh: "Email của gia sư", childPh: "Bé nào?", add: "Cấp quyền", adding: "Đang cấp quyền...", none: "Chưa có gia sư nào.", revoke: "Thu hồi", forChild: "cho", invalidEmail: "Nhập email hợp lệ.", pickChild: "Chọn một bé.", err: "Đã xảy ra lỗi. Vui lòng thử lại." },
  fil: { title: "Mga Coach", lede: "Bigyan ng access ang isang coach sa profile ng bata para magdagdag ng mga salita habang may aralin. Puwedeng bawiin anumang oras.", emailPh: "Email ng coach", childPh: "Aling bata?", add: "Bigyan ng access", adding: "Binibigyan...", none: "Wala pang coach.", revoke: "Bawiin", forChild: "para kay", invalidEmail: "Maglagay ng wastong email.", pickChild: "Pumili ng bata.", err: "May nagkamali. Subukan ulit." },
  af: { title: "Afrigters", lede: "Gee 'n afrigter toegang tot 'n kind se profiel om woorde tydens lesse by te voeg. Herroep enige tyd.", emailPh: "Afrigter se e-pos", childPh: "Watter kind?", add: "Gee toegang", adding: "Besig om toegang te gee...", none: "Nog geen afrigters nie.", revoke: "Herroep", forChild: "vir", invalidEmail: "Voer 'n geldige e-pos in.", pickChild: "Kies 'n kind.", err: "Iets het verkeerd geloop. Probeer weer." },
  sw: { title: "Makocha", lede: "Mpe kocha ruhusa ya wasifu wa mtoto ili kuongeza maneno wakati wa masomo. Ondoa ruhusa wakati wowote.", emailPh: "Barua pepe ya kocha", childPh: "Mtoto yupi?", add: "Toa ruhusa", adding: "Inatoa ruhusa...", none: "Bado hakuna makocha.", revoke: "Ondoa ruhusa", forChild: "kwa", invalidEmail: "Weka barua pepe sahihi.", pickChild: "Chagua mtoto.", err: "Kuna hitilafu. Jaribu tena." },
  "zh-CN": { title: "辅导老师", lede: "授予辅导老师访问孩子资料的权限，在课程中添加单词。可随时撤销。", emailPh: "辅导老师的邮箱", childPh: "哪个孩子？", add: "授予权限", adding: "正在授予...", none: "还没有辅导老师。", revoke: "撤销", forChild: "给", invalidEmail: "请输入有效的邮箱。", pickChild: "请选择一个孩子。", err: "出错了，请再试一次。" },
  "zh-TW": { title: "輔導老師", lede: "授予輔導老師存取孩子資料的權限，在課程中新增單字。可隨時撤銷。", emailPh: "輔導老師的電子郵件", childPh: "哪個孩子？", add: "授予權限", adding: "正在授予...", none: "還沒有輔導老師。", revoke: "撤銷", forChild: "給", invalidEmail: "請輸入有效的電子郵件。", pickChild: "請選擇一個孩子。", err: "出錯了，請再試一次。" },
  ko: { title: "코치", lede: "코치에게 아이 프로필 접근 권한을 주면 수업 중에 단어를 추가할 수 있어요. 언제든지 해제할 수 있어요.", emailPh: "코치 이메일", childPh: "어떤 아이인가요?", add: "권한 주기", adding: "부여하는 중...", none: "아직 코치가 없어요.", revoke: "해제", forChild: "대상", invalidEmail: "올바른 이메일을 입력하세요.", pickChild: "아이를 선택하세요.", err: "문제가 발생했어요. 다시 시도하세요." },
  th: { title: "โค้ช", lede: "ให้สิทธิ์โค้ชเข้าถึงโปรไฟล์ของเด็กเพื่อเพิ่มคำศัพท์ระหว่างบทเรียน ยกเลิกได้ทุกเมื่อ", emailPh: "อีเมลของโค้ช", childPh: "เด็กคนไหน?", add: "ให้สิทธิ์", adding: "กำลังให้สิทธิ์...", none: "ยังไม่มีโค้ช", revoke: "ยกเลิกสิทธิ์", forChild: "สำหรับ", invalidEmail: "กรอกอีเมลที่ถูกต้อง", pickChild: "เลือกเด็กหนึ่งคน", err: "เกิดข้อผิดพลาด ลองอีกครั้ง" },
  bn: { title: "কোচ", lede: "কোনো কোচকে সন্তানের প্রোফাইলে প্রবেশাধিকার দিন যাতে পাঠের সময় শব্দ যোগ করতে পারেন। যেকোনো সময় বাতিল করা যায়।", emailPh: "কোচের ইমেইল", childPh: "কোন সন্তান?", add: "প্রবেশাধিকার দিন", adding: "দেওয়া হচ্ছে...", none: "এখনও কোনো কোচ নেই।", revoke: "বাতিল করুন", forChild: "জন্য", invalidEmail: "একটি সঠিক ইমেইল দিন।", pickChild: "একটি সন্তান বেছে নিন।", err: "কিছু ভুল হয়েছে। আবার চেষ্টা করুন।" },
  da: { title: "Vejledere", lede: "Giv en vejleder adgang til et barns profil, så der kan tilføjes ord under undervisningen. Kan tilbagekaldes når som helst.", emailPh: "Vejlederens e-mail", childPh: "Hvilket barn?", add: "Giv adgang", adding: "Giver adgang...", none: "Ingen vejledere endnu.", revoke: "Tilbagekald", forChild: "til", invalidEmail: "Indtast en gyldig e-mail.", pickChild: "Vælg et barn.", err: "Noget gik galt. Prøv igen." },
  hu: { title: "Oktatók", lede: "Adj hozzáférést egy oktatónak a gyermek profiljához, hogy órák közben szavakat adhasson hozzá. Bármikor visszavonható.", emailPh: "Oktató e-mail-címe", childPh: "Melyik gyerek?", add: "Hozzáférés adása", adding: "Hozzáférés adása...", none: "Még nincs oktató.", revoke: "Visszavonás", forChild: "számára", invalidEmail: "Adj meg egy érvényes e-mail-címet.", pickChild: "Válassz egy gyereket.", err: "Valami hiba történt. Próbáld újra." },
  en: {
    title: "Coaches",
    lede: "Give a coach access to a child's profile to add words during lessons. Revoke anytime.",
    emailPh: "Coach's email",
    childPh: "Which child?",
    add: "Grant access",
    adding: "Granting...",
    none: "No coaches yet.",
    revoke: "Revoke",
    forChild: "for",
    invalidEmail: "Enter a valid email.",
    pickChild: "Pick a child.",
    err: "Something went wrong. Try again.",
  },
  he: {
    title: "מאמנים",
    lede: "תן למאמן גישה לפרופיל של ילד כדי להוסיף מילים במהלך השיעורים. אפשר לבטל בכל רגע.",
    emailPh: "האימייל של המאמן",
    childPh: "איזה ילד?",
    add: "הענקת גישה",
    adding: "מעניק...",
    none: "אין עדיין מאמנים.",
    revoke: "ביטול",
    forChild: "עבור",
    invalidEmail: "הזן אימייל תקין.",
    pickChild: "בחר ילד.",
    err: "משהו השתבש. נסה שוב.",
  },
};
function t(lang: string) { return T[lang] ?? T.en; }

export function CoachesSection() {
  const { user } = useAuth();
  const { lang, dir } = useLang();
  const c = t(lang);

  const [kids, setKids] = useState<Member[]>([]);
  const [grants, setGrants] = useState<Grant[]>([]);
  const [email, setEmail] = useState("");
  const [memberId, setMemberId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const [mRes, gRes] = await Promise.all([
        fetch("/api/family/switch-member", { headers: { Authorization: `Bearer ${idToken}` } }),
        fetch("/api/family/coach", { headers: { Authorization: `Bearer ${idToken}` } }),
      ]);
      if (mRes.ok) {
        const d = (await mRes.json()) as { members?: Member[] };
        setKids((d.members ?? []).filter((m) => !m.isOwner));
      }
      if (gRes.ok) {
        const d = (await gRes.json()) as { grants?: Grant[] };
        setGrants(d.grants ?? []);
      }
    } catch { /* leave as-is */ }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  async function add() {
    if (!user || busy) return;
    const e = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { setError(c.invalidEmail); return; }
    if (!memberId) { setError(c.pickChild); return; }
    setBusy(true); setError("");
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/family/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ coachEmail: e, memberId }),
      });
      if (!res.ok) throw new Error();
      setEmail(""); setMemberId("");
      await load();
    } catch {
      setError(c.err);
    } finally {
      setBusy(false);
    }
  }

  async function revoke(grantId: string) {
    if (!user) return;
    setError("");
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/family/coach/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ grantId }),
      });
      if (!res.ok) throw new Error();
      setGrants((g) => g.filter((x) => x.id !== grantId));
    } catch {
      setError(c.err);
    }
  }

  const inputStyle: React.CSSProperties = {
    flex: 1, minWidth: 0, padding: "11px 13px", borderRadius: 12, border: "1px solid var(--rule)",
    background: "var(--surface)", color: "var(--ink)", fontSize: 15, fontFamily: "inherit",
  };

  return (
    <section dir={dir} style={{ marginTop: 28 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)", marginBottom: 4 }}>{c.title}</h2>
      <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 16, maxWidth: 560 }}>{c.lede}</p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <input
          type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder={c.emailPh} style={{ ...inputStyle, flexBasis: 220 }} dir="ltr"
        />
        <select value={memberId} onChange={(e) => setMemberId(e.target.value)} style={{ ...inputStyle, flexBasis: 150 }}>
          <option value="">{c.childPh}</option>
          {kids.map((k) => <option key={k.id} value={k.id}>{k.name || "—"}</option>)}
        </select>
        <button
          type="button" onClick={add} disabled={busy}
          style={{ background: "#0EA5A5", color: "#fff", border: "none", borderRadius: 12, padding: "11px 20px", fontSize: 15, fontWeight: 700, cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1, fontFamily: "inherit" }}
        >
          {busy ? c.adding : c.add}
        </button>
      </div>
      {error && <div style={{ color: "#DC2626", fontSize: 13, marginBottom: 8 }}>{error}</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
        {grants.length === 0 ? (
          <div style={{ fontSize: 14, color: "var(--ink-muted)" }}>{c.none}</div>
        ) : (
          grants.map((g) => (
            <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 12, border: "1px solid var(--rule)", background: "var(--surface)" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis" }} dir="ltr">{g.coachEmail}</div>
                <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>{c.forChild} {g.memberName || "—"}</div>
              </div>
              <button
                type="button" onClick={() => revoke(g.id)}
                style={{ background: "transparent", color: "#DC2626", border: "1px solid color-mix(in srgb, #DC2626 40%, transparent)", borderRadius: 999, padding: "6px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}
              >
                {c.revoke}
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
