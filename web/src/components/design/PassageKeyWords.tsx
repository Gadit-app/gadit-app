"use client";

/**
 * PassageKeyWords — the Reader's "key words" panel.
 *
 * A parent pastes a child's homework and wants help fast, without tapping word
 * by word. This serves that moment the on-brand way (Sept 2026 positioning
 * council): it does the VOCABULARY job on the whole passage, not translation.
 *
 * WORDS are primary — the handful most worth learning from the text, each a tap
 * away from its full Gadit page (opens in a new tab so the reader keeps its
 * place, like the word popover). The GIST is secondary — one short orientation
 * line saying what the text is about, deliberately not long enough to do the
 * homework from. The words do the work; the gist only orients.
 *
 * Calls POST /api/passage-words (gpt-4o-mini, cached). Copy: he + en now, en
 * fallback for the rest until a batch translation lands. Gadi 2026-09-09.
 */

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useHref } from "@/lib/href";
import { stripLookupDiacritics } from "@/lib/tokenize-words";
import type { Lang } from "@/lib/i18n";

type KeyWord = { word: string; meaning: string };
type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; gist: string; words: KeyWord[] }
  | { status: "error" }
  | { status: "login" };

type Copy = { cta: string; loading: string; gistLabel: string; wordsLabel: string; tapHint: string; error: string; empty: string };

const COPY: Record<string, Copy> = {
  en: {
    cta: "Key words in this text",
    loading: "Finding the key words…",
    gistLabel: "What this is about",
    wordsLabel: "Words worth learning",
    tapHint: "Tap a word to learn it in full.",
    error: "That didn't work. Try again.",
    empty: "No stand-out words here. Tap any word in the text to learn it.",
  },
  he: {
    cta: "המילים החשובות בקטע",
    loading: "מאתרים את המילים החשובות…",
    gistLabel: "על מה הקטע",
    wordsLabel: "מילים שכדאי ללמוד",
    tapHint: "לחצו על מילה כדי ללמוד אותה במלואה.",
    error: "לא הצלחנו. אפשר לנסות שוב.",
    empty: "אין כאן מילים בולטות. אפשר ללחוץ על כל מילה בטקסט כדי ללמוד אותה.",
  },
  ar: {
    cta: "الكلمات المهمة في هذا النص",
    loading: "نبحث عن الكلمات المهمة…",
    gistLabel: "عمّ يتحدث النص",
    wordsLabel: "كلمات تستحق التعلّم",
    tapHint: "اضغط على كلمة لتتعلّمها بالكامل.",
    error: "لم ينجح ذلك. حاول مرة أخرى.",
    empty: "لا توجد كلمات بارزة هنا. اضغط على أي كلمة في النص لتتعلّمها.",
  },
  ru: {
    cta: "Ключевые слова в тексте",
    loading: "Ищем ключевые слова…",
    gistLabel: "О чём этот текст",
    wordsLabel: "Слова, которые стоит выучить",
    tapHint: "Нажмите на слово, чтобы узнать о нём всё.",
    error: "Не получилось. Попробуйте ещё раз.",
    empty: "Здесь нет особо важных слов. Нажмите на любое слово в тексте, чтобы изучить его.",
  },
  es: {
    cta: "Palabras clave de este texto",
    loading: "Buscando las palabras clave…",
    gistLabel: "De qué trata",
    wordsLabel: "Palabras que vale la pena aprender",
    tapHint: "Toca una palabra para aprenderla a fondo.",
    error: "No funcionó. Inténtalo de nuevo.",
    empty: "No hay palabras destacadas aquí. Toca cualquier palabra del texto para aprenderla.",
  },
  pt: {
    cta: "Palavras-chave deste texto",
    loading: "Procurando as palavras-chave…",
    gistLabel: "Do que se trata",
    wordsLabel: "Palavras que vale a pena aprender",
    tapHint: "Toque em uma palavra para aprendê-la por completo.",
    error: "Não deu certo. Tente novamente.",
    empty: "Não há palavras de destaque aqui. Toque em qualquer palavra do texto para aprendê-la.",
  },
  fr: {
    cta: "Mots clés de ce texte",
    loading: "Recherche des mots clés…",
    gistLabel: "De quoi ça parle",
    wordsLabel: "Mots à apprendre",
    tapHint: "Touchez un mot pour tout apprendre sur lui.",
    error: "Ça n'a pas marché. Réessayez.",
    empty: "Aucun mot marquant ici. Touchez n'importe quel mot du texte pour l'apprendre.",
  },
  de: {
    cta: "Schlüsselwörter in diesem Text",
    loading: "Wir suchen die Schlüsselwörter…",
    gistLabel: "Worum es geht",
    wordsLabel: "Wörter, die sich lohnen",
    tapHint: "Tippe auf ein Wort, um alles darüber zu lernen.",
    error: "Das hat nicht geklappt. Versuche es noch einmal.",
    empty: "Hier gibt es keine besonderen Wörter. Tippe auf ein beliebiges Wort im Text, um es zu lernen.",
  },
  cs: {
    cta: "Klíčová slova v textu",
    loading: "Hledáme klíčová slova…",
    gistLabel: "O čem to je",
    wordsLabel: "Slova, která stojí za to naučit se",
    tapHint: "Klepněte na slovo a naučte se ho celé.",
    error: "Nepovedlo se. Zkuste to znovu.",
    empty: "Nejsou tu žádná výrazná slova. Klepněte na libovolné slovo v textu a naučte se ho.",
  },
  sk: {
    cta: "Kľúčové slová v texte",
    loading: "Hľadáme kľúčové slová…",
    gistLabel: "O čom to je",
    wordsLabel: "Slová, ktoré sa oplatí naučiť",
    tapHint: "Ťuknite na slovo a naučte sa ho celé.",
    error: "Nepodarilo sa. Skúste to znova.",
    empty: "Nie sú tu žiadne výrazné slová. Ťuknite na ľubovoľné slovo v texte a naučte sa ho.",
  },
  it: {
    cta: "Parole chiave del testo",
    loading: "Cerchiamo le parole chiave…",
    gistLabel: "Di cosa parla",
    wordsLabel: "Parole da imparare",
    tapHint: "Tocca una parola per impararla fino in fondo.",
    error: "Non ha funzionato. Riprova.",
    empty: "Nessuna parola in evidenza qui. Tocca una parola qualsiasi del testo per impararla.",
  },
  ja: {
    cta: "この文章の大事な単語",
    loading: "大事な単語を探しています…",
    gistLabel: "この文章の内容",
    wordsLabel: "覚えておきたい単語",
    tapHint: "単語をタップすると、くわしく学べます。",
    error: "うまくいきませんでした。もう一度お試しください。",
    empty: "特に目立つ単語はありません。文章の中の単語をタップして学んでみましょう。",
  },
  hi: {
    cta: "इस पाठ के मुख्य शब्द",
    loading: "मुख्य शब्द ढूँढ रहे हैं…",
    gistLabel: "यह किस बारे में है",
    wordsLabel: "सीखने लायक शब्द",
    tapHint: "किसी शब्द पर टैप करें और उसे पूरी तरह सीखें।",
    error: "यह नहीं हो सका। फिर से कोशिश करें।",
    empty: "यहाँ कोई खास शब्द नहीं है। पाठ के किसी भी शब्द पर टैप करके उसे सीखें।",
  },
  am: {
    cta: "በዚህ ጽሑፍ ውስጥ ያሉ ቁልፍ ቃላት",
    loading: "ቁልፍ ቃላቱን እየፈለግን ነው…",
    gistLabel: "ጽሑፉ ስለ ምንድን ነው",
    wordsLabel: "መማር የሚገባቸው ቃላት",
    tapHint: "ቃሉን ሙሉ በሙሉ ለመማር ይንኩት።",
    error: "አልተሳካም። እንደገና ይሞክሩ።",
    empty: "እዚህ ጎልተው የሚታዩ ቃላት የሉም። ለመማር በጽሑፉ ውስጥ ያለ ማንኛውንም ቃል ይንኩ።",
  },
  uk: {
    cta: "Ключові слова в тексті",
    loading: "Шукаємо ключові слова…",
    gistLabel: "Про що цей текст",
    wordsLabel: "Слова, які варто вивчити",
    tapHint: "Торкніться слова, щоб дізнатися про нього все.",
    error: "Не вийшло. Спробуйте ще раз.",
    empty: "Тут немає особливих слів. Торкніться будь-якого слова в тексті, щоб вивчити його.",
  },
  tr: {
    cta: "Bu metindeki anahtar kelimeler",
    loading: "Anahtar kelimeleri buluyoruz…",
    gistLabel: "Metin ne hakkında",
    wordsLabel: "Öğrenmeye değer kelimeler",
    tapHint: "Bir kelimeye dokunarak onu tüm yönleriyle öğren.",
    error: "Olmadı. Tekrar dene.",
    empty: "Burada öne çıkan kelime yok. Öğrenmek için metindeki herhangi bir kelimeye dokun.",
  },
  pl: {
    cta: "Kluczowe słowa w tym tekście",
    loading: "Szukamy kluczowych słów…",
    gistLabel: "O czym to jest",
    wordsLabel: "Słowa warte nauki",
    tapHint: "Dotknij słowa, aby poznać je w całości.",
    error: "Nie udało się. Spróbuj ponownie.",
    empty: "Brak wyróżniających się słów. Dotknij dowolnego słowa w tekście, aby je poznać.",
  },
  fa: {
    cta: "واژه‌های کلیدی این متن",
    loading: "در حال پیدا کردن واژه‌های کلیدی…",
    gistLabel: "این متن درباره چیست",
    wordsLabel: "واژه‌هایی که ارزش یادگیری دارند",
    tapHint: "روی یک واژه بزنید تا آن را کامل یاد بگیرید.",
    error: "نشد. دوباره تلاش کنید.",
    empty: "اینجا واژه برجسته‌ای نیست. روی هر واژه‌ای در متن بزنید تا آن را یاد بگیرید.",
  },
  id: {
    cta: "Kata kunci dalam teks ini",
    loading: "Mencari kata kunci…",
    gistLabel: "Tentang apa teks ini",
    wordsLabel: "Kata yang layak dipelajari",
    tapHint: "Ketuk sebuah kata untuk mempelajarinya secara lengkap.",
    error: "Tidak berhasil. Coba lagi.",
    empty: "Tidak ada kata yang menonjol di sini. Ketuk kata mana pun di teks untuk mempelajarinya.",
  },
  nl: {
    cta: "Kernwoorden in deze tekst",
    loading: "We zoeken de kernwoorden…",
    gistLabel: "Waar het over gaat",
    wordsLabel: "Woorden die de moeite waard zijn",
    tapHint: "Tik op een woord om het helemaal te leren.",
    error: "Dat lukte niet. Probeer het opnieuw.",
    empty: "Geen opvallende woorden hier. Tik op een woord in de tekst om het te leren.",
  },
  el: {
    cta: "Λέξεις-κλειδιά σε αυτό το κείμενο",
    loading: "Ψάχνουμε τις λέξεις-κλειδιά…",
    gistLabel: "Τι λέει το κείμενο",
    wordsLabel: "Λέξεις που αξίζει να μάθεις",
    tapHint: "Πάτησε μια λέξη για να τη μάθεις πλήρως.",
    error: "Δεν τα καταφέραμε. Δοκίμασε ξανά.",
    empty: "Δεν υπάρχουν ξεχωριστές λέξεις εδώ. Πάτησε οποιαδήποτε λέξη στο κείμενο για να τη μάθεις.",
  },
  zu: {
    cta: "Amagama abalulekile kulo mbhalo",
    loading: "Sithola amagama abalulekile…",
    gistLabel: "Lokhu kumayelana nani",
    wordsLabel: "Amagama okufanele uwafunde",
    tapHint: "Thepha igama ukuze ulifunde ngokugcwele.",
    error: "Akuphumelelanga. Zama futhi.",
    empty: "Awekho amagama agqamile lapha. Thepha noma yiliphi igama embhalweni ukuze ulifunde.",
  },
  vi: {
    cta: "Từ khóa trong đoạn này",
    loading: "Đang tìm từ khóa…",
    gistLabel: "Nội dung chính",
    wordsLabel: "Những từ đáng học",
    tapHint: "Chạm vào một từ để học đầy đủ.",
    error: "Chưa được. Hãy thử lại.",
    empty: "Không có từ nổi bật nào ở đây. Chạm vào bất kỳ từ nào trong đoạn để học.",
  },
  fil: {
    cta: "Mahahalagang salita sa tekstong ito",
    loading: "Hinahanap ang mahahalagang salita…",
    gistLabel: "Tungkol saan ito",
    wordsLabel: "Mga salitang sulit matutunan",
    tapHint: "I-tap ang isang salita para matutunan ito nang buo.",
    error: "Hindi ito gumana. Subukang muli.",
    empty: "Walang namumukod na salita dito. I-tap ang kahit anong salita sa teksto para matutunan ito.",
  },
  af: {
    cta: "Sleutelwoorde in hierdie teks",
    loading: "Ons soek die sleutelwoorde…",
    gistLabel: "Waaroor dit gaan",
    wordsLabel: "Woorde wat die moeite werd is",
    tapHint: "Tik op 'n woord om dit ten volle te leer.",
    error: "Dit het nie gewerk nie. Probeer weer.",
    empty: "Geen opvallende woorde hier nie. Tik op enige woord in die teks om dit te leer.",
  },
  sw: {
    cta: "Maneno muhimu katika maandishi haya",
    loading: "Tunatafuta maneno muhimu…",
    gistLabel: "Hii inahusu nini",
    wordsLabel: "Maneno yanayofaa kujifunza",
    tapHint: "Gusa neno ili ulijifunze kikamilifu.",
    error: "Haikufanikiwa. Jaribu tena.",
    empty: "Hakuna maneno yanayojitokeza hapa. Gusa neno lolote katika maandishi ili ulijifunze.",
  },
  "zh-CN": {
    cta: "这段文字的关键词",
    loading: "正在找关键词…",
    gistLabel: "主要内容",
    wordsLabel: "值得学习的词",
    tapHint: "点一个词，完整学习它。",
    error: "没有成功，请重试。",
    empty: "这里没有特别突出的词。点文中任意一个词来学习它。",
  },
  "zh-TW": {
    cta: "這段文字的關鍵詞",
    loading: "正在找關鍵詞…",
    gistLabel: "主要內容",
    wordsLabel: "值得學習的詞",
    tapHint: "點一個詞，完整學習它。",
    error: "沒有成功，請再試一次。",
    empty: "這裡沒有特別突出的詞。點文中任何一個詞來學習它。",
  },
  ko: {
    cta: "이 글의 핵심 단어",
    loading: "핵심 단어를 찾고 있어요…",
    gistLabel: "이 글의 내용",
    wordsLabel: "배워 둘 만한 단어",
    tapHint: "단어를 누르면 자세히 배울 수 있어요.",
    error: "잘 안 됐어요. 다시 시도해 주세요.",
    empty: "눈에 띄는 단어가 없어요. 글 속 아무 단어나 눌러 배워 보세요.",
  },
  th: {
    cta: "คำสำคัญในข้อความนี้",
    loading: "กำลังหาคำสำคัญ…",
    gistLabel: "เนื้อหาเกี่ยวกับอะไร",
    wordsLabel: "คำที่น่าเรียนรู้",
    tapHint: "แตะคำเพื่อเรียนรู้อย่างครบถ้วน",
    error: "ไม่สำเร็จ ลองอีกครั้ง",
    empty: "ไม่มีคำที่โดดเด่นในนี้ แตะคำใดก็ได้ในข้อความเพื่อเรียนรู้",
  },
  bn: {
    cta: "এই লেখার মূল শব্দ",
    loading: "মূল শব্দগুলো খুঁজছি…",
    gistLabel: "এটি কী নিয়ে",
    wordsLabel: "শেখার মতো শব্দ",
    tapHint: "কোনো শব্দে ট্যাপ করে পুরোটা শিখুন।",
    error: "হলো না। আবার চেষ্টা করুন।",
    empty: "এখানে আলাদা করে চোখে পড়ার মতো শব্দ নেই। শিখতে লেখার যেকোনো শব্দে ট্যাপ করুন।",
  },
  da: {
    cta: "Nøgleord i denne tekst",
    loading: "Vi finder nøgleordene…",
    gistLabel: "Hvad det handler om",
    wordsLabel: "Ord, der er værd at lære",
    tapHint: "Tryk på et ord for at lære det helt.",
    error: "Det virkede ikke. Prøv igen.",
    empty: "Ingen ord skiller sig ud her. Tryk på et hvilket som helst ord i teksten for at lære det.",
  },
  hu: {
    cta: "Kulcsszavak ebben a szövegben",
    loading: "Keressük a kulcsszavakat…",
    gistLabel: "Miről szól",
    wordsLabel: "Megtanulásra érdemes szavak",
    tapHint: "Koppints egy szóra, hogy alaposan megtanuld.",
    error: "Ez nem sikerült. Próbáld újra.",
    empty: "Nincsenek kiemelkedő szavak. Koppints a szöveg bármelyik szavára, hogy megtanuld.",
  },
};

function copy(lang: string): Copy {
  return COPY[lang] ?? COPY.en;
}

export function PassageKeyWords({ text, lang }: { text: string; lang: Lang }) {
  const { user } = useAuth();
  const href = useHref();
  const t = copy(lang);
  const [state, setState] = useState<State>({ status: "idle" });

  async function run() {
    if (state.status === "loading") return;
    setState({ status: "loading" });
    try {
      if (!user) { setState({ status: "login" }); return; }
      const idToken = await user.getIdToken();
      const res = await fetch("/api/passage-words", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ text, lang }),
      });
      if (res.status === 401) { setState({ status: "login" }); return; }
      if (!res.ok) { setState({ status: "error" }); return; }
      const json = (await res.json()) as { gist?: string; words?: KeyWord[] };
      const words = Array.isArray(json.words) ? json.words : [];
      setState({ status: "ready", gist: json.gist ?? "", words });
    } catch {
      setState({ status: "error" });
    }
  }

  // Collapsed: a single, clearly-labelled action.
  if (state.status === "idle" || state.status === "login" || state.status === "error") {
    return (
      <div style={{ marginBottom: 18 }}>
        <button type="button" onClick={run} style={ctaBtn}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 3v4M3 5h4M6 17v4M4 19h4M13 3l2.5 6.5L22 12l-6.5 2.5L13 21l-2.5-6.5L4 12l6.5-2.5L13 3z" />
          </svg>
          <span>{t.cta}</span>
        </button>
        {state.status === "error" && <p style={{ margin: "8px 2px 0", fontSize: 13, color: "#B91C1C" }}>{t.error}</p>}
      </div>
    );
  }

  if (state.status === "loading") {
    return (
      <div style={{ ...panel, marginBottom: 18, color: "var(--ink-muted,#6B7280)", fontSize: 14 }}>
        {t.loading}
      </div>
    );
  }

  // Ready.
  const { gist, words } = state;
  return (
    <div style={{ ...panel, marginBottom: 18 }}>
      {words.length > 0 ? (
        <>
          <div style={labelRow}>{t.wordsLabel}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: gist ? 16 : 4 }}>
            {words.map((w, i) => (
              <Link
                key={i}
                href={href(`/word/${encodeURIComponent(stripLookupDiacritics(w.word))}`)}
                target="_blank"
                rel="noopener noreferrer"
                style={chip}
              >
                <span style={{ fontWeight: 700, color: "var(--ink,#20272E)" }}>{w.word}</span>
                {w.meaning && <span style={{ color: "var(--ink-muted,#6B7280)", fontWeight: 500 }}>· {w.meaning}</span>}
              </Link>
            ))}
          </div>
          <p style={{ margin: "0 0 2px", fontSize: 12.5, color: "var(--ink-muted,#9CA3AF)" }}>{t.tapHint}</p>
        </>
      ) : (
        <p style={{ margin: 0, fontSize: 14, color: "var(--ink-muted,#6B7280)" }}>{t.empty}</p>
      )}

      {gist && (
        <div style={{ marginTop: words.length > 0 ? 14 : 0, paddingTop: 14, borderTop: "1px solid var(--hairline,#EEF1F3)" }}>
          <div style={labelRow}>{t.gistLabel}</div>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: "var(--ink,#20272E)" }}>{gist}</p>
        </div>
      )}
    </div>
  );
}

const ctaBtn: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 8,
  background: "var(--card,#fff)", color: "var(--teal-deep,#0E7490)",
  border: "1px solid rgba(14,165,165,0.4)", borderRadius: 12,
  padding: "10px 16px", fontSize: 14.5, fontWeight: 700, cursor: "pointer",
  fontFamily: "inherit", transition: "background 0.16s ease, transform 0.16s ease",
};

const panel: React.CSSProperties = {
  background: "var(--card,#fff)", border: "1px solid var(--hairline,#E5E7EB)",
  borderRadius: 16, padding: "16px 18px",
  boxShadow: "0 1px 2px rgba(16,24,40,0.04)",
};

const labelRow: React.CSSProperties = {
  fontSize: 11.5, letterSpacing: "0.12em", textTransform: "uppercase",
  fontWeight: 700, color: "var(--teal-deep,#0E7490)", marginBottom: 9,
};

const chip: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 5,
  background: "var(--paper,#F7FAFA)", border: "1px solid var(--hairline,#E5E7EB)",
  borderRadius: 999, padding: "7px 13px", fontSize: 14, textDecoration: "none",
  lineHeight: 1.2, transition: "border-color 0.16s ease, background 0.16s ease",
};
