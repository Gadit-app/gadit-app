"use client";

import { useCallback, useState } from "react";
import { useAdminContext } from "../admin-context";
import { setsBySubject, subjectLabel, type WordSet } from "@/lib/word-sets";

/**
 * Review grid for the classroom word sets. Grouped by subject; each set
 * expands into a grid of its words (definition + cached image + cached
 * examples), with per-word "regenerate image / examples" and a per-set
 * "warm this set" that drives /api/admin/warm-set to completion.
 *
 * Read-only until you click a regenerate/warm button — the grid itself
 * only reads caches, so scanning ~50 sets costs no OpenAI spend.
 */

const SECRET_KEY = "gadit_admin_secret_v1";

type AdminLang = "en" | "he";

type WordRow = {
  word: string;
  meaning: string;
  meaningSource: "curated" | "cache" | null;
  imageUrl: string | null;
  examples: string[];
};

const STR: Record<AdminLang, Record<string, string>> = {
  he: {
    title: "מערכי מילים",
    subtitle: "כל מילה בכל מערך: הגדרה, תמונת מקרן ודוגמאות. לתקן חריגים בלחיצה.",
    expand: "פתח",
    collapse: "סגור",
    warmSet: "חמם מערך",
    warming: "מחמם…",
    loading: "טוען…",
    words: "מילים",
    noMeaning: "אין הגדרה עדיין",
    curated: "הגדרה קבועה",
    cache: "מהמטמון",
    noImage: "אין תמונה",
    noExamples: "אין דוגמאות עדיין",
    regenImage: "צור תמונה מחדש",
    regenExamples: "צור דוגמאות מחדש",
    working: "עובד…",
    reload: "רענן",
    warmDone: "המערך חומם",
    error: "שגיאה",
  },
  en: {
    title: "Word sets",
    subtitle: "Every word in every set: definition, projector image, examples. Fix outliers in one click.",
    expand: "Open",
    collapse: "Close",
    warmSet: "Warm this set",
    warming: "Warming…",
    loading: "Loading…",
    words: "words",
    noMeaning: "No definition yet",
    curated: "Curated",
    cache: "From cache",
    noImage: "No image",
    noExamples: "No examples yet",
    regenImage: "Regenerate image",
    regenExamples: "Regenerate examples",
    working: "Working…",
    reload: "Reload",
    warmDone: "Set warmed",
    error: "Error",
  },
};

export default function AdminSetsClient() {
  const { secret, lang } = useAdminContext();
  const t = STR[lang];
  const groups = setsBySubject();

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#111827" }}>{t.title}</h1>
        <p style={{ color: "#6B7280", fontSize: 14, marginTop: 4, maxWidth: 640 }}>{t.subtitle}</p>
      </div>

      {groups.map((g) => (
        <section key={g.key} style={{ marginBottom: 28 }}>
          <h2
            style={{
              margin: "0 0 12px",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 0.6,
              textTransform: "uppercase",
              color: "#6B7280",
            }}
          >
            {subjectLabel(g.key)} · {g.sets.length}
          </h2>
          <div style={{ display: "grid", gap: 10 }}>
            {g.sets.map((set) => (
              <SetCard key={set.id} set={set} secret={secret} t={t} lang={lang} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

function handle401(r: Response) {
  if (r.status === 401 && typeof window !== "undefined") {
    localStorage.removeItem(SECRET_KEY);
    window.location.reload();
  }
}

function SetCard({
  set,
  secret,
  t,
  lang,
}: {
  set: WordSet;
  secret: string;
  t: Record<string, string>;
  lang: AdminLang;
}) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<WordRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [warming, setWarming] = useState(false);
  const [warmMsg, setWarmMsg] = useState<string>("");
  const [error, setError] = useState<string>("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const r = await fetch(`/api/admin/sets?secret=${encodeURIComponent(secret)}&set=${encodeURIComponent(set.id)}`);
      handle401(r);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = (await r.json()) as { words: WordRow[] };
      setRows(j.words);
    } catch (e) {
      setError(String(e instanceof Error ? e.message : e));
    } finally {
      setLoading(false);
    }
  }, [secret, set.id]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && !rows && !loading) void load();
  };

  const warm = async () => {
    setWarming(true);
    setWarmMsg("");
    setError("");
    try {
      let offset = 0;
      let guard = 0;
      // Follow nextOffset until the whole set is warmed. guard caps the
      // loop so a bug can never spin forever.
      while (guard++ < 40) {
        const r = await fetch(
          `/api/admin/warm-set?secret=${encodeURIComponent(secret)}&set=${encodeURIComponent(set.id)}&offset=${offset}`,
        );
        handle401(r);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = (await r.json()) as { total: number; nextOffset: number | null; capped: boolean };
        const done = j.capped ? j.nextOffset ?? j.total : j.total;
        setWarmMsg(`${Math.min(done, j.total)}/${j.total}`);
        if (!j.capped || j.nextOffset == null) break;
        offset = j.nextOffset;
      }
      setWarmMsg(t.warmDone);
      await load();
    } catch (e) {
      setError(String(e instanceof Error ? e.message : e));
    } finally {
      setWarming(false);
    }
  };

  const onRegen = (updated: WordRow) => {
    setRows((prev) => (prev ? prev.map((w) => (w.word === updated.word ? updated : w)) : prev));
  };

  return (
    <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 16px",
          cursor: "pointer",
        }}
        onClick={toggle}
      >
        <span style={{ fontSize: 15, fontWeight: 700, color: "#111827", flex: 1 }}>
          {set.title}
          {set.grade ? <span style={{ color: "#9CA3AF", fontWeight: 500 }}> · {set.grade}</span> : null}
          <span style={{ color: "#9CA3AF", fontWeight: 500 }}> · {set.words.length} {t.words}</span>
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            void warm();
          }}
          disabled={warming}
          style={btnStyle(warming, "#0EA5A5")}
        >
          {warming ? `${t.warming} ${warmMsg}` : t.warmSet}
        </button>
        <span style={{ color: "#9CA3AF", fontSize: 13 }}>{open ? t.collapse : t.expand}</span>
      </div>

      {error && (
        <div style={{ background: "#FEF2F2", color: "#991B1B", padding: "8px 16px", fontSize: 13 }}>{error}</div>
      )}
      {!error && warmMsg && !warming && (
        <div style={{ background: "#ECFDF5", color: "#065F46", padding: "8px 16px", fontSize: 13 }}>{warmMsg}</div>
      )}

      {open && (
        <div style={{ padding: 16, borderTop: "1px solid #F3F4F6" }}>
          {loading && <div style={{ color: "#6B7280", fontSize: 14 }}>{t.loading}</div>}
          {rows && (
            <div
              style={{
                display: "grid",
                gap: 12,
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              }}
            >
              {rows.map((w) => (
                <WordCell key={w.word} row={w} setId={set.id} secret={secret} t={t} lang={lang} onRegen={onRegen} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function WordCell({
  row,
  setId,
  secret,
  t,
  lang,
  onRegen,
}: {
  row: WordRow;
  setId: string;
  secret: string;
  t: Record<string, string>;
  lang: AdminLang;
  onRegen: (r: WordRow) => void;
}) {
  const [busy, setBusy] = useState<"image" | "examples" | null>(null);
  const [err, setErr] = useState<string>("");
  const dir = lang === "he" ? "rtl" : "ltr";

  const regen = async (action: "image" | "examples") => {
    setBusy(action);
    setErr("");
    try {
      const r = await fetch(`/api/admin/sets?secret=${encodeURIComponent(secret)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, set: setId, word: row.word }),
      });
      handle401(r);
      if (!r.ok) {
        const j = (await r.json().catch(() => null)) as { error?: string; detail?: string } | null;
        throw new Error(j?.detail ?? j?.error ?? `HTTP ${r.status}`);
      }
      const j = (await r.json()) as { imageUrl: string | null; examples: string[] };
      onRegen({
        ...row,
        ...(action === "image" && j.imageUrl ? { imageUrl: j.imageUrl } : {}),
        ...(action === "examples" ? { examples: j.examples } : {}),
      });
    } catch (e) {
      setErr(String(e instanceof Error ? e.message : e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div
      dir={dir}
      style={{ border: "1px solid #E5E7EB", borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, justifyContent: "space-between" }}>
        <span style={{ fontSize: 18, fontWeight: 800, color: "#0b7d7d" }}>{row.word}</span>
        <MeaningBadge source={row.meaningSource} t={t} />
      </div>

      <div
        style={{
          width: "100%",
          aspectRatio: "1 / 1",
          borderRadius: 8,
          background: "#F9FAFB",
          border: "1px solid #F3F4F6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {row.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={row.imageUrl} alt={row.word} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ color: "#9CA3AF", fontSize: 12 }}>{t.noImage}</span>
        )}
      </div>

      <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: row.meaning ? "#374151" : "#9CA3AF" }}>
        {row.meaning || t.noMeaning}
      </p>

      {row.examples.length ? (
        <ol style={{ margin: 0, paddingInlineStart: 18, display: "grid", gap: 3 }}>
          {row.examples.slice(0, 3).map((ex, i) => (
            <li key={i} style={{ fontSize: 12.5, lineHeight: 1.45, color: "#4B5563" }}>
              {ex}
            </li>
          ))}
        </ol>
      ) : (
        <div style={{ fontSize: 12.5, color: "#9CA3AF" }}>{t.noExamples}</div>
      )}

      {err && <div style={{ fontSize: 12, color: "#991B1B" }}>{err}</div>}

      <div style={{ display: "flex", gap: 6, marginTop: "auto" }}>
        <button
          type="button"
          disabled={busy !== null || !row.meaningSource}
          onClick={() => regen("image")}
          style={btnStyle(busy !== null || !row.meaningSource, "#7C3AED")}
        >
          {busy === "image" ? t.working : t.regenImage}
        </button>
        <button
          type="button"
          disabled={busy !== null || !row.meaningSource}
          onClick={() => regen("examples")}
          style={btnStyle(busy !== null || !row.meaningSource, "#374151")}
        >
          {busy === "examples" ? t.working : t.regenExamples}
        </button>
      </div>
    </div>
  );
}

function MeaningBadge({ source, t }: { source: "curated" | "cache" | null; t: Record<string, string> }) {
  if (!source) return null;
  const isCurated = source === "curated";
  return (
    <span
      style={{
        fontSize: 10.5,
        fontWeight: 700,
        padding: "2px 6px",
        borderRadius: 5,
        background: isCurated ? "#ECFEFF" : "#FEF3C7",
        color: isCurated ? "#0E7490" : "#92400E",
        whiteSpace: "nowrap",
      }}
    >
      {isCurated ? t.curated : t.cache}
    </span>
  );
}

function btnStyle(disabled: boolean, bg: string): React.CSSProperties {
  return {
    padding: "6px 10px",
    borderRadius: 7,
    border: "none",
    background: disabled ? "#E5E7EB" : bg,
    color: disabled ? "#9CA3AF" : "white",
    fontSize: 12,
    fontWeight: 600,
    cursor: disabled ? "default" : "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  };
}
