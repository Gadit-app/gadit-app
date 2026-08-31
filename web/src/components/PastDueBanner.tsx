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
