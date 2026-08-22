"use client";

/**
 * Rewards section for the /family owner dashboard (kids gamification v2,
 * "approach B", Gadi 2026-08-23). The parent gives a child GIFT points as a
 * treat; the child spends them in the skin store. This makes the store work
 * for EVERY family, not only Yooniz families — Yooniz is just another way to
 * top up the same wallet.
 *
 * Gift points are cosmetic-only, never affect ranks, and are capped per week
 * (shared with the Yooniz gift). One tap gives; the row shows what's left this
 * week. Self-contained: fetches the family's children via switch-member.
 */
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";

type Member = { id: string; name: string; isOwner: boolean; role?: string };

const AMOUNTS = [10, 20, 30] as const;

const T: Record<string, { title: string; lede: string; none: string; give: string; gave: string; left: string; capped: string; err: string }> = {
  ar: { title: "المكافآت", lede: "امنح طفلك نقاط هدايا كمفاجأة لطيفة. ينفقها على مظاهر جديدة في المتجر. النقاط للمظهر فقط ولا تؤثر أبدًا على الرتب.", none: "أضف طفلًا لمنح المكافآت.", give: "امنح", gave: "أُرسلت", left: "متبقٍ هذا الأسبوع", capped: "تم بلوغ الحد الأسبوعي. المزيد الأسبوع القادم.", err: "حدث خطأ ما. حاول مرة أخرى." },
  ru: { title: "Награды", lede: "Подари ребёнку подарочные очки как приятный сюрприз. Он тратит их на новые образы в магазине. Очки нужны только для внешнего вида и никогда не влияют на ранги.", none: "Добавь ребёнка, чтобы дарить награды.", give: "Подарить", gave: "отправлено", left: "осталось на этой неделе", capped: "Недельный лимит достигнут. Ещё на следующей неделе.", err: "Что-то пошло не так. Попробуй ещё раз." },
  es: { title: "Recompensas", lede: "Regala puntos a tu hijo como un premio especial. Los gasta en skins nuevos de la tienda. Los puntos son solo para el aspecto y nunca afectan a los rangos.", none: "Añade un hijo para dar recompensas.", give: "Dar", gave: "enviado", left: "quedan esta semana", capped: "Límite semanal alcanzado. Más la próxima semana.", err: "Algo salió mal. Inténtalo de nuevo." },
  pt: { title: "Recompensas", lede: "Dê pontos de presente ao seu filho como um mimo. Ele os gasta em skins novos na loja. Os pontos são só para a aparência e nunca afetam os ranks.", none: "Adicione uma criança para dar recompensas.", give: "Dar", gave: "enviado", left: "restam esta semana", capped: "Limite semanal atingido. Mais na próxima semana.", err: "Algo deu errado. Tente de novo." },
  fr: { title: "Récompenses", lede: "Offre à ton enfant des points cadeaux pour lui faire plaisir. Il les dépense en nouveaux skins dans la boutique. Les points servent juste au look et n'affectent jamais les rangs.", none: "Ajoute un enfant pour offrir des récompenses.", give: "Offrir", gave: "envoyé", left: "restants cette semaine", capped: "Limite de la semaine atteinte. D'autres la semaine prochaine.", err: "Un souci est survenu. Réessaie." },
  de: { title: "Belohnungen", lede: "Schenke deinem Kind Geschenkpunkte als kleine Freude. Es gibt sie im Shop für neue Skins aus. Die Punkte sind nur fürs Aussehen und wirken sich nie auf die Ränge aus.", none: "Füge ein Kind hinzu, um Belohnungen zu geben.", give: "Geben", gave: "gesendet", left: "übrig diese Woche", capped: "Wochenlimit erreicht. Mehr nächste Woche.", err: "Etwas ist schiefgelaufen. Versuch es noch mal." },
  cs: { title: "Odměny", lede: "Dej dítěti dárkové body jako malou radost. Utratí je v obchodě za nové vzhledy. Body jsou jen na parádu a nikdy neovlivňují pořadí.", none: "Přidej dítě, abys mohl dávat odměny.", give: "Dát", gave: "odesláno", left: "zbývá tento týden", capped: "Týdenní limit vyčerpán. Další příští týden.", err: "Něco se pokazilo. Zkus to znovu." },
  sk: { title: "Odmeny", lede: "Daj dieťaťu darčekové body ako malú radosť. Minie ich v obchode na nové vzhľady. Body sú len na parádu a nikdy neovplyvňujú poradie.", none: "Pridaj dieťa, aby si mohol dávať odmeny.", give: "Dať", gave: "odoslané", left: "zostáva tento týždeň", capped: "Týždenný limit vyčerpaný. Ďalšie budúci týždeň.", err: "Niečo sa pokazilo. Skús to znova." },
  it: { title: "Ricompense", lede: "Regala punti al tuo bambino come piccola sorpresa. Li spende per nuovi skin nel negozio. I punti servono solo per l'aspetto e non influenzano mai i ranghi.", none: "Aggiungi un bambino per dare ricompense.", give: "Dai", gave: "inviato", left: "rimasti questa settimana", capped: "Limite settimanale raggiunto. Altri la prossima settimana.", err: "Qualcosa è andato storto. Riprova." },
  ja: { title: "ごほうび", lede: "がんばったごほうびに、お子さんへギフトポイントをおくれます。ストアで新しいスキンに使えます。ポイントは見た目だけのもので、ランクには影響しません。", none: "お子さんを追加するとごほうびをおくれます。", give: "おくる", gave: "おくったよ", left: "今週ののこり", capped: "今週のじょうげんに達しました。来週またどうぞ。", err: "うまくいきませんでした。もう一度お試しください。" },
  hi: { title: "इनाम", lede: "अपने बच्चे को खुशी के तौर पर गिफ्ट पॉइंट दें। वह इन्हें स्टोर में नई स्किन पर खर्च करता है। पॉइंट सिर्फ दिखावे के लिए हैं और रैंक पर कभी असर नहीं डालते।", none: "इनाम देने के लिए एक बच्चा जोड़ें।", give: "दें", gave: "भेजा गया", left: "इस हफ़्ते बाकी", capped: "इस हफ़्ते की सीमा पूरी। अगले हफ़्ते और।", err: "कुछ गड़बड़ हो गई। फिर से कोशिश करें।" },
  am: { title: "ሽልማቶች", lede: "ልጅን በስጦታ ነጥቦች እንደ ሽልማት አበረታታ። እነሱን በመደብሩ ውስጥ አዲስ ስኪኖች ላይ ያውሏቸዋል። ነጥቦቹ ለመልክ ብቻ ሲሆኑ ደረጃዎችን በጭራሽ አይነኩም።", none: "ሽልማት ለመስጠት ልጅ ጨምር።", give: "ስጥ", gave: "ተልኳል", left: "በዚህ ሳምንት ቀሪ", capped: "የሳምንቱ ገደብ ደርሷል። ተጨማሪ በሚቀጥለው ሳምንት።", err: "የሆነ ችግር ተፈጥሯል። እንደገና ሞክር።" },
  uk: { title: "Нагороди", lede: "Подаруй дитині подарункові бали як приємний бонус. Вона витрачає їх на нові образи в магазині. Бали лише для вигляду й ніколи не впливають на ранги.", none: "Додай дитину, щоб дарувати нагороди.", give: "Дати", gave: "надіслано", left: "залишилось цього тижня", capped: "Тижневий ліміт вичерпано. Більше наступного тижня.", err: "Щось пішло не так. Спробуй ще раз." },
  tr: { title: "Ödüller", lede: "Bir çocuğa küçük bir sürpriz olarak hediye puanı ver. O da bunları mağazada yeni görünümler için harcar. Puanlar sadece görünüm içindir, seviyeleri asla etkilemez.", none: "Ödül vermek için bir çocuk ekle.", give: "Ver", gave: "gönderildi", left: "bu hafta kalan", capped: "Haftalık sınıra ulaşıldı. Gerisi haftaya.", err: "Bir şeyler ters gitti. Tekrar dene." },
  pl: { title: "Nagrody", lede: "Podaruj dziecku punkty prezentowe w nagrodę. Wyda je na nowe skórki w sklepie. Punkty służą tylko do wyglądu i nigdy nie wpływają na rangi.", none: "Dodaj dziecko, aby przyznawać nagrody.", give: "Daj", gave: "wysłano", left: "pozostało w tym tygodniu", capped: "Osiągnięto tygodniowy limit. Więcej w przyszłym tygodniu.", err: "Coś poszło nie tak. Spróbuj ponownie." },
  fa: { title: "جایزه‌ها", lede: "به کودک به‌عنوان یک تشویق امتیاز هدیه بده. او آن‌ها را در فروشگاه برای ظاهرهای تازه خرج می‌کند. امتیازها فقط برای ظاهرند و هرگز روی رتبه‌ها اثر نمی‌گذارند.", none: "برای دادن جایزه یک کودک اضافه کن.", give: "بده", gave: "فرستاده شد", left: "مانده این هفته", capped: "به سقف هفتگی رسیدی. باقی‌اش هفته بعد.", err: "مشکلی پیش آمد. دوباره امتحان کن." },
  id: { title: "Hadiah", lede: "Beri anak poin hadiah sebagai apresiasi. Mereka memakainya untuk tampilan baru di toko. Poin hanya untuk gaya dan tidak pernah memengaruhi peringkat.", none: "Tambahkan anak untuk memberi hadiah.", give: "Beri", gave: "terkirim", left: "sisa minggu ini", capped: "Batas mingguan tercapai. Lagi minggu depan.", err: "Ada yang tidak beres. Coba lagi." },
  nl: { title: "Beloningen", lede: "Geef een kind cadeaupunten als beloning. Ze geven ze uit aan nieuwe skins in de winkel. Punten zijn alleen voor de look en hebben nooit invloed op de rangen.", none: "Voeg een kind toe om beloningen te geven.", give: "Geef", gave: "verstuurd", left: "over deze week", capped: "Weeklimiet bereikt. Volgende week meer.", err: "Er ging iets mis. Probeer opnieuw." },
  el: { title: "Ανταμοιβές", lede: "Δώσε σε ένα παιδί πόντους δώρου ως επιβράβευση. Τους ξοδεύει για νέες εμφανίσεις στο κατάστημα. Οι πόντοι είναι μόνο για την εμφάνιση και δεν επηρεάζουν ποτέ τα επίπεδα.", none: "Πρόσθεσε ένα παιδί για να δίνεις ανταμοιβές.", give: "Δώσε", gave: "στάλθηκε", left: "απομένουν αυτή την εβδομάδα", capped: "Έφτασες το εβδομαδιαίο όριο. Κι άλλα την επόμενη εβδομάδα.", err: "Κάτι πήγε στραβά. Δοκίμασε ξανά." },
  zu: { title: "Imiklomelo", lede: "Nika ingane amaphuzu esipho njengomvuzo. Iwasebenzisela izimo ezintsha esitolo. Amaphuzu awokubukeka nje futhi awawathinti neze amazinga.", none: "Engeza ingane ukuze unike imiklomelo.", give: "Nika", gave: "kuthunyeliwe", left: "okusele kuleli sonto", capped: "Ufinyelele umkhawulo weviki. Okunye ngeviki elizayo.", err: "Kukhona okungahambanga kahle. Zama futhi." },
  vi: { title: "Phần thưởng", lede: "Tặng con điểm quà tặng để khích lệ. Con dùng chúng để đổi giao diện mới trong cửa hàng. Điểm chỉ để làm đẹp và không bao giờ ảnh hưởng đến thứ hạng.", none: "Thêm một bé để trao phần thưởng.", give: "Tặng", gave: "đã gửi", left: "còn lại tuần này", capped: "Đã đạt giới hạn tuần. Thêm vào tuần sau.", err: "Có gì đó không ổn. Thử lại nhé." },
  fil: { title: "Mga gantimpala", lede: "Bigyan ng gift point ang bata bilang treat. Ginagamit nila ito para sa mga bagong skin sa store. Pang-porma lang ang mga point at hindi nakakaapekto sa rank.", none: "Magdagdag ng bata para makapagbigay ng gantimpala.", give: "Magbigay", gave: "naipadala", left: "natitira ngayong linggo", capped: "Naabot na ang limit sa linggo. May bago sa susunod na linggo.", err: "May nangyaring mali. Subukan ulit." },
  af: { title: "Belonings", lede: "Gee 'n kind geskenkpunte as 'n bederf. Hulle spandeer dit aan nuwe skins in die winkel. Punte is net vir voorkoms en beïnvloed nooit range nie.", none: "Voeg 'n kind by om belonings te gee.", give: "Gee", gave: "gestuur", left: "oor hierdie week", capped: "Weeklikse limiet bereik. Meer volgende week.", err: "Iets het verkeerd geloop. Probeer weer." },
  sw: { title: "Zawadi", lede: "Mpe mtoto pointi za zawadi kama tuzo. Anazitumia kununua skini mpya dukani. Pointi ni za mapambo tu na haziathiri vyeo.", none: "Ongeza mtoto ili utoe zawadi.", give: "Toa", gave: "zimetumwa", left: "zimebaki wiki hii", capped: "Kikomo cha wiki kimefikiwa. Zaidi wiki ijayo.", err: "Kuna hitilafu imetokea. Jaribu tena." },
  "zh-CN": { title: "奖励", lede: "把礼物点数送给孩子作为奖励。他们可以在商店里用来换新皮肤。点数只是用来装扮的，不会影响等级。", none: "添加一个孩子才能送奖励。", give: "赠送", gave: "已送出", left: "本周还剩", capped: "本周额度已用完，下周再来。", err: "出错了，请再试一次。" },
  "zh-TW": { title: "獎勵", lede: "把禮物點數送給孩子作為獎勵。他們可以在商店裡用來換新造型。點數只是用來裝扮的，不會影響等級。", none: "先新增一個孩子才能送獎勵。", give: "贈送", gave: "已送出", left: "本週還剩", capped: "本週額度已用完，下週再來。", err: "出錯了，請再試一次。" },
  ko: { title: "보상", lede: "아이에게 선물 포인트를 상으로 주세요. 아이는 상점에서 새 스킨을 사는 데 씁니다. 포인트는 꾸미기용일 뿐, 등급에는 전혀 영향을 주지 않아요.", none: "아이를 추가하면 보상을 줄 수 있어요.", give: "주기", gave: "보냄", left: "이번 주 남음", capped: "이번 주 한도에 도달했어요. 다음 주에 더 줄 수 있어요.", err: "문제가 생겼어요. 다시 시도해 주세요." },
  th: { title: "รางวัล", lede: "มอบแต้มของขวัญให้เด็กเป็นรางวัล เด็กจะเอาไปแลกสกินใหม่ในร้านค้า แต้มเป็นแค่ของตกแต่ง ไม่มีผลต่ออันดับ", none: "เพิ่มเด็กก่อนถึงจะมอบรางวัลได้", give: "มอบ", gave: "ส่งแล้ว", left: "เหลือในสัปดาห์นี้", capped: "ถึงขีดจำกัดของสัปดาห์นี้แล้ว สัปดาห์หน้ามีอีก", err: "มีบางอย่างผิดพลาด ลองอีกครั้ง" },
  bn: { title: "পুরস্কার", lede: "সন্তানকে পুরস্কার হিসেবে উপহার পয়েন্ট দাও। ওরা এগুলো দিয়ে স্টোরে নতুন স্কিন কেনে। পয়েন্ট শুধু সাজসজ্জার জন্য, র‍্যাঙ্কে কোনো প্রভাব ফেলে না।", none: "পুরস্কার দিতে একজন সন্তান যোগ করো।", give: "দাও", gave: "পাঠানো হয়েছে", left: "এই সপ্তাহে বাকি", capped: "এই সপ্তাহের সীমা শেষ। আগামী সপ্তাহে আরও।", err: "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করো।" },
  da: { title: "Belønninger", lede: "Giv et barn gavepoint som en lille belønning. De bruger dem på nye skins i butikken. Point er kun til pynt og påvirker aldrig rangene.", none: "Tilføj et barn for at give belønninger.", give: "Giv", gave: "sendt", left: "tilbage i denne uge", capped: "Ugens grænse er nået. Mere næste uge.", err: "Noget gik galt. Prøv igen." },
  hu: { title: "Jutalmak", lede: "Adj a gyereknek ajándékpontokat jutalomként. Új skinekre költheti a boltban. A pontok csak a külsőt díszítik, a rangokra sosem hatnak.", none: "Adj hozzá egy gyereket, hogy jutalmat adhass.", give: "Adok", gave: "elküldve", left: "maradt ezen a héten", capped: "Elérted a heti korlátot. Jövő héten újra.", err: "Valami hiba történt. Próbáld újra." },
  en: {
    title: "Rewards",
    lede: "Give a child gift points as a treat. They spend them on new skins in the store. Points are just for looks and never affect ranks.",
    none: "Add a child to give rewards.",
    give: "Give",
    gave: "sent",
    left: "left this week",
    capped: "Weekly limit reached. More next week.",
    err: "Something went wrong. Try again.",
  },
  he: {
    title: "פרסים",
    lede: "תן לילד נקודות מתנה כפרס. הוא מוציא אותן על סקינים חדשים בחנות. הנקודות הן לקישוט בלבד ולא משפיעות על הדרגה.",
    none: "הוסף ילד כדי לתת פרסים.",
    give: "תן",
    gave: "נשלחו",
    left: "נשארו השבוע",
    capped: "הגעת למכסה השבועית. עוד בשבוע הבא.",
    err: "משהו השתבש. נסה שוב.",
  },
};
function t(lang: string) { return T[lang] ?? T.en; }

export function RewardsSection() {
  const { user } = useAuth();
  const { lang, dir } = useLang();
  const c = t(lang);

  const [kids, setKids] = useState<Member[]>([]);
  const [busy, setBusy] = useState<string | null>(null); // memberId being gifted
  const [result, setResult] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/family/switch-member", { headers: { Authorization: `Bearer ${idToken}` } });
      if (res.ok) {
        const d = (await res.json()) as { members?: Member[] };
        setKids((d.members ?? []).filter((m) => !m.isOwner && (m.role === "boy" || m.role === "girl")));
      }
    } catch { /* leave as-is */ }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  async function give(memberId: string, amount: number) {
    if (!user || busy) return;
    setBusy(memberId); setError("");
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/family/gift-points", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ memberId, amount }),
      });
      const d = (await res.json()) as { granted?: number; remainingThisWeek?: number };
      if (!res.ok) throw new Error();
      const msg = (d.granted ?? 0) > 0
        ? `🎁 +${d.granted} ${c.gave} · ${d.remainingThisWeek ?? 0} ${c.left}`
        : c.capped;
      setResult((r) => ({ ...r, [memberId]: msg }));
    } catch {
      setError(c.err);
    } finally {
      setBusy(null);
    }
  }

  if (kids.length === 0) return null;

  return (
    <section dir={dir} style={{ marginTop: 28 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)", marginBottom: 4 }}>🎁 {c.title}</h2>
      <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 16, maxWidth: 560 }}>{c.lede}</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {kids.map((k) => (
          <div key={k.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 12, border: "1px solid var(--rule)", background: "var(--surface)", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 120 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>{k.name || "—"}</div>
              {result[k.id] && <div style={{ fontSize: 12.5, color: "var(--accent, #0EA5A5)", fontWeight: 600, marginTop: 2 }}>{result[k.id]}</div>}
            </div>
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              {AMOUNTS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => give(k.id, a)}
                  disabled={busy === k.id}
                  style={{
                    background: "color-mix(in srgb, var(--accent, #0EA5A5) 12%, transparent)",
                    color: "var(--accent, #0EA5A5)", border: "1px solid color-mix(in srgb, var(--accent, #0EA5A5) 40%, transparent)",
                    borderRadius: 999, padding: "7px 14px", fontSize: 14, fontWeight: 800,
                    cursor: busy === k.id ? "default" : "pointer", opacity: busy === k.id ? 0.5 : 1,
                    fontFamily: "inherit", fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {c.give} {a}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {error && <div style={{ color: "#DC2626", fontSize: 13, marginTop: 8 }}>{error}</div>}
    </section>
  );
}
