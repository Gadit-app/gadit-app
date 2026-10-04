// Family email series in every UI language (Gadi 2026-10-05). The fixed
// strings of each email (footer, and the defaults of the editable closing,
// signature and guides link). The email texts themselves are translated
// per email and stored as overrides (emailTemplates/{key}.{lang}).

export const FAMILY_LANGS = ["he","en","ar","ru","es","pt","fr","de","cs","sk","it","ja","hi","am","uk","tr","pl","fa","id","nl","el","zu","vi","fil","af","sw","zh-CN","zh-TW","ko","th","bn","da","hu"] as const;
export type FamilyLang = (typeof FAMILY_LANGS)[number];
export const isFamilyLang = (l: unknown): l is FamilyLang => typeof l === "string" && (FAMILY_LANGS as readonly string[]).includes(l);
export const RTL_LANGS = new Set(["he", "ar", "fa"]);

export type FamilyFixed = { unsub: string; tagline: string; closing: string; signature: string; helpText: string };
export const FAMILY_FIXED: Record<FamilyLang, FamilyFixed> = {
  "he": {"unsub":"להסרה מרשימת התפוצה","tagline":"להבין כל מילה עד הסוף","closing":"אנחנו כאן לכל שאלה ועזרה.","signature":"הצוות של Gadit","helpText":"לכל ההדרכות"},
  "en": {"unsub":"Unsubscribe","tagline":"","closing":"We're here for any question or help.","signature":"The Gadit team","helpText":"All guides"},
  "ar": {"unsub":"إلغاء الاشتراك","tagline":"افهم الكلمات حتى النهاية","closing":"نحن هنا لأي سؤال أو للمساعدة.","signature":"فريق Gadit","helpText":"كل الأدلة"},
  "ru": {"unsub":"Отписаться","tagline":"Понять слова до конца","closing":"Мы рядом, если возникнут вопросы или нужна помощь.","signature":"Команда Gadit","helpText":"Все инструкции"},
  "es": {"unsub":"Cancelar suscripción","tagline":"Entender palabras hasta el final","closing":"Estamos aquí para cualquier duda o ayuda.","signature":"El equipo de Gadit","helpText":"Todas las guías"},
  "pt": {"unsub":"Cancelar subscrição","tagline":"Entender palavras até o fim","closing":"Estamos aqui para qualquer dúvida ou ajuda.","signature":"A equipa da Gadit","helpText":"Todos os guias"},
  "fr": {"unsub":"Se désabonner","tagline":"Comprendre les mots jusqu'au bout","closing":"Nous sommes là si vous avez la moindre question ou besoin d’aide.","signature":"L’équipe Gadit","helpText":"Tous les guides"},
  "de": {"unsub":"Abmelden","tagline":"Wörter bis zum Ende verstehen","closing":"Wir sind bei Fragen oder wenn du Hilfe brauchst für dich da.","signature":"Das Gadit-Team","helpText":"Alle Anleitungen"},
  "cs": {"unsub":"Odhlásit odběr","tagline":"Pochopit slova až do konce","closing":"Kdykoli budete mít dotaz nebo budete potřebovat pomoct, jsme tu pro vás.","signature":"Tým Gadit","helpText":"Všechny návody"},
  "sk": {"unsub":"Odhlásiť sa","tagline":"Pochopiť slová až do konca","closing":"Sme tu pre každú otázku aj pomoc.","signature":"Tím Gadit","helpText":"Všetky návody"},
  "it": {"unsub":"Disiscriviti","tagline":"Capire le parole fino in fondo","closing":"Siamo qui per qualsiasi domanda o aiuto.","signature":"Il team di Gadit","helpText":"Tutte le guide"},
  "ja": {"unsub":"配信停止","tagline":"言葉を最後まで理解する","closing":"ご質問やお困りごとがあれば、いつでもご連絡ください。","signature":"Gaditチーム","helpText":"ガイド一覧"},
  "hi": {"unsub":"सदस्यता समाप्त करें","tagline":"शब्दों को पूरी तरह समझें","closing":"किसी भी सवाल या मदद के लिए हम यहीं हैं।","signature":"Gadit टीम","helpText":"सभी गाइड"},
  "am": {"unsub":"ደንበኝነትን ያቋርጡ","tagline":"ቃላትን እስከ መጨረሻው መረዳት","closing":"ለማንኛውም ጥያቄ ወይም እገዛ እኛ እዚህ ነን።","signature":"የGadit ቡድን","helpText":"ሁሉም መመሪያዎች"},
  "uk": {"unsub":"Відписатися","tagline":"Розумій слова до кінця","closing":"Ми поруч, якщо виникнуть запитання чи потрібна допомога.","signature":"Команда Gadit","helpText":"Усі інструкції"},
  "tr": {"unsub":"Abonelikten çık","tagline":"Kelimeleri sonuna kadar anla","closing":"Sorunuz olursa ya da yardıma ihtiyacınız olursa buradayız.","signature":"Gadit ekibi","helpText":"Tüm rehberler"},
  "pl": {"unsub":"Wypisz się","tagline":"Zrozum słowa do końca","closing":"Jesteśmy tu, jeśli masz pytania albo potrzebujesz pomocy.","signature":"Zespół Gadit","helpText":"Wszystkie poradniki"},
  "fa": {"unsub":"لغو اشتراک","tagline":"کلمه‌ها را تا آخر بفهم","closing":"برای هر سوال یا کمکی، اینجاییم.","signature":"تیم Gadit","helpText":"همه راهنماها"},
  "id": {"unsub":"Berhenti berlangganan","tagline":"Pahami kata sampai tuntas","closing":"Kami siap membantu kalau ada pertanyaan.","signature":"Tim Gadit","helpText":"Semua panduan"},
  "nl": {"unsub":"Uitschrijven","tagline":"Begrijp woorden tot het einde","closing":"We helpen je graag met elke vraag.","signature":"Het Gadit-team","helpText":"Alle gidsen"},
  "el": {"unsub":"Κατάργηση εγγραφής","tagline":"Κατάλαβε τις λέξεις μέχρι το τέλος","closing":"Είμαστε εδώ για ό,τι χρειαστείτε ή αν έχετε κάποια απορία.","signature":"Η ομάδα του Gadit","helpText":"Όλοι οι οδηγοί"},
  "zu": {"unsub":"Zikhiphe ohlwini","tagline":"Qonda amagama kuze kube sekugcineni","closing":"Sikhona uma unemibuzo noma udinga usizo.","signature":"Ithimba lakwa-Gadit","helpText":"Yonke imihlahlandlela"},
  "vi": {"unsub":"Hủy đăng ký","tagline":"Hiểu trọn từng từ","closing":"Bọn mình luôn sẵn sàng nếu bạn cần hỏi gì hoặc cần hỗ trợ.","signature":"Đội ngũ Gadit","helpText":"Tất cả hướng dẫn"},
  "fil": {"unsub":"Mag-unsubscribe","tagline":"Intindihin ang bawat salita nang lubos","closing":"Nandito kami kung may tanong ka o kailangan mo ng tulong.","signature":"Ang team ng Gadit","helpText":"Lahat ng gabay"},
  "af": {"unsub":"Teken uit","tagline":"Verstaan elke woord heeltemal","closing":"Ons is hier vir enige vrae of hulp.","signature":"Die Gadit-span","helpText":"Alle gidse"},
  "sw": {"unsub":"Jiondoe","tagline":"Elewa kila neno kikamilifu","closing":"Tuko hapa kwa maswali yoyote au msaada.","signature":"Timu ya Gadit","helpText":"Miongozo yote"},
  "zh-CN": {"unsub":"取消订阅","tagline":"每个词，都能真正听懂","closing":"有任何问题或需要帮助，我们都在。","signature":"Gadit 团队","helpText":"全部指南"},
  "zh-TW": {"unsub":"取消訂閱","tagline":"每個字，都懂到透","closing":"有任何問題或需要幫忙，我們都在。","signature":"Gadit 團隊","helpText":"所有指南"},
  "ko": {"unsub":"구독 취소","tagline":"모든 단어를 끝까지 이해해요","closing":"궁금한 점이나 도움이 필요하시면 언제든지 문의해 주세요.","signature":"Gadit 팀","helpText":"모든 가이드"},
  "th": {"unsub":"ยกเลิกการรับข่าวสาร","tagline":"เข้าใจทุกคำอย่างลึกซึ้ง","closing":"หากมีคำถามหรือต้องการความช่วยเหลือ เรายินดีเสมอ","signature":"ทีม Gadit","helpText":"คู่มือทั้งหมด"},
  "bn": {"unsub":"সাবস্ক্রিপশন বন্ধ করুন","tagline":"প্রতিটি শব্দ পুরোপুরি বুঝুন","closing":"কোনো প্রশ্ন বা সাহায্য লাগলে আমরা আছি।","signature":"Gadit টিম","helpText":"সব গাইড"},
  "da": {"unsub":"Afmeld","tagline":"Forstå hvert ord helt til bunds","closing":"Vi er her, hvis du har spørgsmål eller brug for hjælp.","signature":"Teamet bag Gadit","helpText":"Alle guides"},
  "hu": {"unsub":"Leiratkozás","tagline":"Érts meg minden szót igazán.","closing":"Ha kérdésed van, vagy segítség kell, itt vagyunk.","signature":"A Gadit csapata","helpText":"Összes útmutató"},
};
