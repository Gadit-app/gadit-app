"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminContext } from "../../admin-context";

/**
 * Admin · Pilot requests: every pilot / quote request a school sent from the
 * schools landing form (schoolOrders), newest first, with a status Gadi sets
 * as he works the lead (new, contacted, pilot opened, closed).
 * Auth: the AdminShell secret, sent as ?secret= to /api/admin/schools/orders.
 */

type Status = "new" | "contacted" | "pilot_opened" | "closed";

type Order = {
  id: string;
  schoolName: string;
  contactName: string;
  role: string | null;
  email: string;
  phone: string | null;
  city: string | null;
  size: string | null;
  sizeLabel: string | null;
  grade: string | null;
  schoolType: string | null;
  notes: string | null;
  lang: string;
  kind: "pilot" | "order";
  status: Status;
  statusAt: string | null;
  createdAt: string | null;
};

const STATUSES: Status[] = ["new", "contacted", "pilot_opened", "closed"];

const STATUS_COLOR: Record<Status, { bg: string; fg: string }> = {
  new: { bg: "#FEF3C7", fg: "#92400E" },
  contacted: { bg: "#DBEAFE", fg: "#1E40AF" },
  pilot_opened: { bg: "#D1FAE5", fg: "#065F46" },
  closed: { bg: "#F3F4F6", fg: "#4B5563" },
};

const COPY = {
  en: {
    title: "Pilot requests",
    subtitle: (n: number, open: number) => `${n} requests · ${open} new`,
    loading: "Loading…",
    empty: "No requests yet. They appear here when a school sends the form on the schools page.",
    status: { new: "New", contacted: "Contacted", pilot_opened: "Pilot opened", closed: "Closed" } as Record<Status, string>,
    kind: { pilot: "Pilot", order: "Order" },
    contact: "Contact",
    email: "Email",
    phone: "Phone",
    city: "City",
    size: "Students in the grades",
    grade: "Start grade",
    schoolType: "School type",
    notes: "Notes",
    lang: "Language",
    sent: "Sent",
    statusSet: "Status set",
    saving: "Saving…",
    saveError: "Could not save",
    types: { state: "State", "state-religious": "State religious", arab: "Arab", other: "Other" } as Record<string, string>,
  },
  he: {
    title: "בקשות פיילוט",
    subtitle: (n: number, open: number) => `${n} בקשות · ${open} חדשות`,
    loading: "טוען…",
    empty: "אין עדיין בקשות. הן מופיעות כאן כשבית ספר שולח את הטופס בעמוד בתי הספר.",
    status: { new: "חדשה", contacted: "נוצר קשר", pilot_opened: "פיילוט נפתח", closed: "סגורה" } as Record<Status, string>,
    kind: { pilot: "פיילוט", order: "הזמנה" },
    contact: "איש קשר",
    email: "אימייל",
    phone: "טלפון",
    city: "עיר",
    size: "תלמידים בשכבות",
    grade: "שכבת התחלה",
    schoolType: "סוג בית הספר",
    notes: "הערות",
    lang: "שפה",
    sent: "נשלחה",
    statusSet: "הסטטוס עודכן",
    saving: "שומר…",
    saveError: "השמירה נכשלה",
    types: { state: "ממלכתי", "state-religious": "ממלכתי דתי", arab: "ערבי", other: "אחר" } as Record<string, string>,
  },
};

function fmt(iso: string | null, lang: "he" | "en"): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(lang === "he" ? "he-IL" : "en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jerusalem" });
}

export default function AdminSchoolOrdersClient() {
  const { secret, lang } = useAdminContext();
  const t = COPY[lang];
  const dir: "rtl" | "ltr" = lang === "he" ? "rtl" : "ltr";

  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/schools/orders?secret=${encodeURIComponent(secret)}`, { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      setOrders(((await res.json()) as { orders: Order[] }).orders);
    } catch (e) {
      setError(String(e instanceof Error ? e.message : e));
    } finally {
      setLoading(false);
    }
  }, [secret]);

  useEffect(() => { void load(); }, [load]);

  const setStatus = async (o: Order, status: Status) => {
    if (busy) return;
    setBusy(o.id);
    setError("");
    const prev = orders;
    setOrders((list) => (list ?? []).map((x) => (x.id === o.id ? { ...x, status } : x)));
    try {
      const res = await fetch(`/api/admin/schools/orders?secret=${encodeURIComponent(secret)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: o.id, status }),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const j = (await res.json()) as { statusAt: string };
      setOrders((list) => (list ?? []).map((x) => (x.id === o.id ? { ...x, status, statusAt: j.statusAt } : x)));
    } catch (e) {
      setOrders(prev);
      setError(`${t.saveError}: ${String(e instanceof Error ? e.message : e)}`);
    } finally {
      setBusy(null);
    }
  };

  const openCount = (orders ?? []).filter((o) => o.status === "new").length;

  return (
    <div dir={dir}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#111827" }}>{t.title}</h1>
        <p style={{ color: "#6B7280", fontSize: 14, marginTop: 4 }}>
          {loading && !orders ? t.loading : orders ? t.subtitle(orders.length, openCount) : ""}
        </p>
      </div>

      {error && <div style={errBox}>{error}</div>}
      {orders && orders.length === 0 && <div style={emptyBox}>{t.empty}</div>}

      <div style={{ display: "grid", gap: 12 }}>
        {(orders ?? []).map((o) => {
          const c = STATUS_COLOR[o.status];
          const rows: Array<[string, React.ReactNode, ("ltr" | "auto")?]> = [
            [t.contact, [o.contactName, o.role].filter(Boolean).join(" · "), "auto"],
            [t.email, o.email ? <a href={`mailto:${o.email}`} style={link}>{o.email}</a> : null, "ltr"],
            [t.phone, o.phone ? <a href={`tel:${o.phone}`} style={link}>{o.phone}</a> : null, "ltr"],
            [t.city, o.city, "auto"],
            [t.size, o.sizeLabel || o.size, "auto"],
            [t.grade, o.grade, "auto"],
            [t.schoolType, o.schoolType ? (t.types[o.schoolType] ?? o.schoolType) : null, "auto"],
            [t.lang, o.lang, "ltr"],
          ];
          return (
            <div key={o.id} style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 12, padding: 16, borderInlineStart: `4px solid ${c.fg}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 17, fontWeight: 700, color: "#111827" }} dir="auto">{o.schoolName || "?"}</span>
                <span style={{ ...pill, background: o.kind === "pilot" ? "#E0F2FE" : "#EDE9FE", color: o.kind === "pilot" ? "#075985" : "#5B21B6" }}>
                  {t.kind[o.kind]}
                </span>
                <span style={{ color: "#6B7280", fontSize: 12 }}>{t.sent} {fmt(o.createdAt, lang)}</span>
                <span style={{ marginInlineStart: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                  <select
                    value={o.status}
                    disabled={busy === o.id}
                    onChange={(e) => void setStatus(o, e.target.value as Status)}
                    style={{ padding: "6px 10px", borderRadius: 999, border: "none", background: c.bg, color: c.fg, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{t.status[s]}</option>)}
                  </select>
                  {busy === o.id && <span style={{ color: "#6B7280", fontSize: 12 }}>{t.saving}</span>}
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "8px 16px", marginTop: 12 }}>
                {rows.filter(([, v]) => v).map(([k, v, d]) => (
                  <div key={k} style={{ minWidth: 0 }}>
                    <div style={fieldLabel}>{k}</div>
                    <div style={{ fontSize: 14, color: "#111827", overflowWrap: "anywhere" }} dir={d ?? "auto"}>{v}</div>
                  </div>
                ))}
              </div>
              {o.notes && (
                <div style={{ marginTop: 10 }}>
                  <div style={fieldLabel}>{t.notes}</div>
                  <div style={{ fontSize: 14, color: "#111827", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }} dir="auto">{o.notes}</div>
                </div>
              )}
              {o.statusAt && (
                <div style={{ marginTop: 10, color: "#9CA3AF", fontSize: 12 }}>{t.statusSet} {fmt(o.statusAt, lang)}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const pill: React.CSSProperties = { fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999 };
const fieldLabel: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: "#6B7280", letterSpacing: 0.4, marginBottom: 2 };
const link: React.CSSProperties = { color: "#0E7490", textDecoration: "none" };
const errBox: React.CSSProperties = { background: "#FEF2F2", color: "#991B1B", padding: 12, borderRadius: 8, margin: "16px 0", fontSize: 14 };
const emptyBox: React.CSSProperties = { background: "white", border: "1px solid #E5E7EB", borderRadius: 12, padding: 32, textAlign: "center", color: "#6B7280", fontSize: 14 };
