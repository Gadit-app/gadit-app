"use client";

/**
 * Shown across the app and the site to a signed-in user whose subscription is
 * past_due but still inside the 7-day grace window (auth-context `pastDue`).
 * Their paid access is retained for now; this bar tells them the charge failed
 * and gives a one-click way to update the card (Stripe billing portal via
 * /api/portal). Renders nothing for everyone else. Gadi 2026-08-31.
 */
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";

type Copy = { msg: (days: number) => string; cta: string; busy: string };

const COPY: Record<string, Copy> = {
  he: { msg: (d) => `החיוב על המנוי לא עבר. הגישה נשמרת לך עוד ${d} ימים, עדכנו כרטיס כדי לא לאבד אותה.`, cta: "עדכון כרטיס", busy: "רגע…" },
  en: { msg: (d) => `Your subscription payment failed. Your access stays for ${d} more days, update your card to keep it.`, cta: "Update card", busy: "One moment…" },
  ar: { msg: (d) => `لم تُقبل عملية دفع الاشتراك. يبقى وصولك ${d} أيام أخرى، حدّث البطاقة كي لا تفقده.`, cta: "تحديث البطاقة", busy: "لحظة…" },
  ru: { msg: (d) => `Оплата подписки не прошла. Доступ сохраняется ещё ${d} дн., обновите карту, чтобы не потерять его.`, cta: "Обновить карту", busy: "Секунду…" },
  es: { msg: (d) => `El pago de tu suscripción falló. Tu acceso continúa ${d} días más, actualiza la tarjeta para conservarlo.`, cta: "Actualizar tarjeta", busy: "Un momento…" },
  pt: { msg: (d) => `O pagamento da assinatura falhou. Seu acesso continua por mais ${d} dias, atualize o cartão para mantê-lo.`, cta: "Atualizar cartão", busy: "Um momento…" },
  fr: { msg: (d) => `Le paiement de votre abonnement a échoué. Votre accès reste actif ${d} jours, mettez à jour la carte pour le conserver.`, cta: "Mettre à jour la carte", busy: "Un instant…" },
  de: { msg: (d) => `Die Zahlung deines Abos ist fehlgeschlagen. Dein Zugang bleibt noch ${d} Tage, aktualisiere die Karte, um ihn zu behalten.`, cta: "Karte aktualisieren", busy: "Einen Moment…" },
  cs: { msg: (d) => `Platba za předplatné neprošla. Zbývající dny přístupu: ${d}. Aktualizujte kartu, abyste o přístup nepřišli.`, cta: "Aktualizovat kartu", busy: "Moment…" },
  sk: { msg: (d) => `Platba za predplatné neprešla. Zostávajúce dni prístupu: ${d}. Aktualizujte kartu, aby ste o prístup neprišli.`, cta: "Aktualizovať kartu", busy: "Moment…" },
  it: { msg: (d) => `Il pagamento dell'abbonamento non è andato a buon fine. L'accesso resta attivo per altri ${d} giorni, aggiorna la carta per mantenerlo.`, cta: "Aggiorna carta", busy: "Un attimo…" },
  ja: { msg: (d) => `サブスクリプションのお支払いができませんでした。アクセスはあと${d}日間ご利用いただけます。引き続きご利用いただくには、カードを更新してください。`, cta: "カードを更新", busy: "少々お待ちください…" },
  hi: { msg: (d) => `आपकी सदस्यता का भुगतान नहीं हो पाया। आपकी पहुँच ${d} दिन और बनी रहेगी, इसे जारी रखने के लिए अपना कार्ड अपडेट करें।`, cta: "कार्ड अपडेट करें", busy: "एक पल…" },
  am: { msg: (d) => `የደንበኝነት ክፍያዎ አልተሳካም። መዳረሻዎ ለተጨማሪ ${d} ቀናት ይቆያል፣ እንዳያጡት ካርድዎን ያዘምኑ።`, cta: "ካርድ ያዘምኑ", busy: "አንድ አፍታ…" },
  uk: { msg: (d) => `Оплата підписки не пройшла. Доступ зберігається ще ${d} дн., оновіть картку, щоб не втратити його.`, cta: "Оновити картку", busy: "Секунду…" },
  tr: { msg: (d) => `Abonelik ödemeniz başarısız oldu. Erişiminiz ${d} gün daha devam edecek, kaybetmemek için kartınızı güncelleyin.`, cta: "Kartı güncelle", busy: "Bir saniye…" },
  pl: { msg: (d) => `Płatność za subskrypcję nie powiodła się. Pozostałe dni dostępu: ${d}. Zaktualizuj kartę, aby nie stracić dostępu.`, cta: "Zaktualizuj kartę", busy: "Chwileczkę…" },
  fa: { msg: (d) => `پرداخت اشتراک شما انجام نشد. دسترسی شما تا ${d} روز دیگر باقی می‌ماند، برای حفظ آن کارت خود را به‌روزرسانی کنید.`, cta: "به‌روزرسانی کارت", busy: "یک لحظه…" },
  id: { msg: (d) => `Pembayaran langganan Anda gagal. Akses Anda tetap aktif ${d} hari lagi, perbarui kartu Anda agar akses tidak hilang.`, cta: "Perbarui kartu", busy: "Sebentar…" },
  nl: { msg: (d) => `De betaling van je abonnement is mislukt. Je toegang blijft nog ${d} dagen actief, werk je kaart bij om die te behouden.`, cta: "Kaart bijwerken", busy: "Een moment…" },
  el: { msg: (d) => `Η πληρωμή της συνδρομής σας απέτυχε. Η πρόσβασή σας διατηρείται για ακόμη ${d} ημέρες, ενημερώστε την κάρτα σας για να μην τη χάσετε.`, cta: "Ενημέρωση κάρτας", busy: "Μια στιγμή…" },
  zu: { msg: (d) => `Inkokhelo yokubhalisa kwakho ayiphumelelanga. Ukufinyelela kwakho kuzohlala izinsuku ezingu-${d} ezengeziwe, buyekeza ikhadi lakho ukuze ungakulahlekelwa.`, cta: "Buyekeza ikhadi", busy: "Umzuzwana…" },
  vi: { msg: (d) => `Thanh toán gói đăng ký không thành công. Quyền truy cập của bạn còn ${d} ngày nữa, hãy cập nhật thẻ để tiếp tục sử dụng.`, cta: "Cập nhật thẻ", busy: "Chờ một chút…" },
  fil: { msg: (d) => `Hindi natuloy ang bayad sa iyong subscription. Mananatili ang access mo nang ${d} araw pa, i-update ang iyong card para hindi ito mawala.`, cta: "I-update ang card", busy: "Sandali lang…" },
  af: { msg: (d) => `Jou intekeningbetaling het misluk. Jou toegang bly nog ${d} dae aktief, werk jou kaart by om dit te behou.`, cta: "Werk kaart by", busy: "Een oomblik…" },
  sw: { msg: (d) => `Malipo ya usajili wako hayakufanikiwa. Ufikiaji wako utaendelea kwa siku ${d} zaidi, sasisha kadi yako ili usiupoteze.`, cta: "Sasisha kadi", busy: "Subiri kidogo…" },
  "zh-CN": { msg: (d) => `你的订阅付款未成功。访问权限还将保留 ${d} 天，请更新银行卡以继续使用。`, cta: "更新银行卡", busy: "请稍候…" },
  "zh-TW": { msg: (d) => `你的訂閱付款未成功。存取權限還會保留 ${d} 天，請更新信用卡以繼續使用。`, cta: "更新信用卡", busy: "請稍候…" },
  ko: { msg: (d) => `구독 결제가 실패했어요. 이용 권한은 ${d}일 더 유지되니, 계속 이용하려면 카드를 업데이트해 주세요.`, cta: "카드 업데이트", busy: "잠시만요…" },
  th: { msg: (d) => `การชำระเงินค่าสมาชิกไม่สำเร็จ คุณยังใช้งานได้อีก ${d} วัน อัปเดตบัตรเพื่อใช้งานต่อ`, cta: "อัปเดตบัตร", busy: "สักครู่…" },
  bn: { msg: (d) => `আপনার সাবস্ক্রিপশনের পেমেন্ট ব্যর্থ হয়েছে। আপনার অ্যাক্সেস আরও ${d} দিন থাকবে, তা ধরে রাখতে কার্ড আপডেট করুন।`, cta: "কার্ড আপডেট করুন", busy: "এক মুহূর্ত…" },
  da: { msg: (d) => `Betalingen for dit abonnement mislykkedes. Din adgang fortsætter i ${d} dage mere, opdater dit kort for at beholde den.`, cta: "Opdater kort", busy: "Et øjeblik…" },
  hu: { msg: (d) => `Az előfizetés díját nem sikerült levonni. A hozzáférésed még ${d} napig megmarad, frissítsd a kártyádat, hogy ne veszítsd el.`, cta: "Kártya frissítése", busy: "Egy pillanat…" },
};
function copyFor(lang: string): Copy { return COPY[lang] ?? COPY.en; }

export function PastDueBanner() {
  const { user, pastDue, graceUntil } = useAuth();
  const { lang, dir } = useLang();
  const [busy, setBusy] = useState(false);

  if (!user || !pastDue) return null;
  const c = copyFor(lang);
  const days = graceUntil ? Math.max(1, Math.ceil((graceUntil - Date.now()) / 86_400_000)) : 7;

  async function updateCard() {
    if (!user) return;
    setBusy(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/portal", { method: "POST", headers: { Authorization: `Bearer ${idToken}` } });
      const data = (await res.json()) as { url?: string };
      if (data.url) { window.location.href = data.url; return; }
    } catch { /* fall through */ }
    setBusy(false);
    // Portal unavailable (no Stripe customer yet): send them to the account page.
    window.location.href = "/account";
  }

  return (
    <div
      dir={dir}
      role="alert"
      style={{
        position: "sticky", top: 0, zIndex: 60, width: "100%",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 14, flexWrap: "wrap",
        padding: "9px 16px", background: "#B45309", color: "#fff",
        fontSize: 14, fontWeight: 600, textAlign: "center",
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
        <span aria-hidden="true">⚠️</span>{c.msg(days)}
      </span>
      <button
        type="button"
        onClick={updateCard}
        disabled={busy}
        style={{
          background: "#fff", color: "#B45309", border: "none", borderRadius: 999,
          padding: "6px 16px", fontSize: 13.5, fontWeight: 800, cursor: busy ? "default" : "pointer",
          fontFamily: "inherit", opacity: busy ? 0.7 : 1, whiteSpace: "nowrap",
        }}
      >
        {busy ? c.busy : c.cta}
      </button>
    </div>
  );
}
