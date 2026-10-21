"use client";

/**
 * The one way to add homework (Gadi 2026-10-12, stage 2, after the council):
 * photograph the page or paste it, check what was read, confirm what it is
 * (a word list, a text to read, workbook pages; the likely one is already
 * chosen), pick the test day, save. The child then sees it as the one
 * "what to do" card on the Homework page.
 *
 * No new model calls: the photo is read by /api/ocr, a list is paired by
 * /api/spell-set, workbook pages become a lesson through /api/learn, and the
 * task itself is stored by /api/homework-task.
 */
import { WaitText } from "@/components/WaitText";
import { GaditIcon } from "@/components/design/GaditIcon";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { intakeCopy } from "@/lib/homework-intake-i18n";

type Kind = "list" | "text" | "pages";
type DateChoice = "none" | "tomorrow" | "sunday" | "week" | "other";

/** A guess from the shape of the text: short lines are a list, sentences a text. */
function guessKind(text: string, pages: number): Kind {
  if (pages >= 2) return "pages";
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const words = text.split(/\s+/).filter(Boolean).length;
  if (lines.length >= 3 && words / lines.length <= 3.2) return "list";
  return words >= 25 ? "text" : "list";
}

function isoDay(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function addDays(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}
/** The coming Sunday (the Israeli school week starts on Sunday). */
function nextSunday(): Date {
  const d = new Date();
  d.setDate(d.getDate() + (((7 - d.getDay()) % 7) || 7));
  return d;
}

export type SavedTask = { kind: Kind; title: string; testDate: string | null; words?: Array<{ en: string; he: string }>; text?: string; at: number };

export function HomeworkIntake({ lang, dir, nativeLang, learnLang, initialFiles, onSaved, onCancel }: {
  lang: string;
  dir: "rtl" | "ltr";
  /** The other side of a word pair (as on the dictation page). */
  nativeLang: string;
  /** The language workbook lessons are built in (English, or Hebrew as L2). */
  learnLang: string | null;
  /** Photos chosen from the big button on the Homework page. */
  initialFiles?: File[] | null;
  onSaved: (task: SavedTask) => void;
  onCancel: () => void;
}) {
  const { user } = useAuth();
  const c = intakeCopy(lang);
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const [canCamera, setCanCamera] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read once from the device
    try { setCanCamera(window.matchMedia("(pointer: coarse)").matches); } catch { /* upload only */ }
  }, []);
  const [text, setText] = useState("");
  const [pages, setPages] = useState(0);
  const [kind, setKind] = useState<Kind | null>(null);
  const [when, setWhen] = useState<DateChoice>("none");
  const [other, setOther] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const started = useRef(false);

  const auth = async () => ({ Authorization: `Bearer ${await user!.getIdToken()}` });

  async function readPhotos(files: File[]) {
    if (!user || !files.length) return;
    setBusy(true);
    setMsg(c.reading);
    let added = "";
    let ok = 0;
    try {
      for (const f of files.slice(0, 6)) {
        const fd = new FormData();
        fd.append("image", f);
        const r = await fetch("/api/ocr", { method: "POST", headers: await auth(), body: fd });
        const j = (await r.json().catch(() => ({}))) as { text?: string };
        const t = (j.text ?? "").trim();
        if (r.ok && t) { added += (added ? "\n" : "") + t; ok += 1; }
      }
    } catch { /* reported below */ }
    setBusy(false);
    if (!ok) { setMsg(c.fail); return; }
    const all = (text ? `${text}\n` : "") + added;
    const n = pages + ok;
    setText(all);
    setPages(n);
    setKind(guessKind(all, n));
    setMsg(c.check);
  }

  // Photos picked from the Homework page's big button are read right away.
  useEffect(() => {
    if (started.current || !initialFiles?.length || !user) return;
    started.current = true;
    void readPhotos(initialFiles);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFiles, user]);

  const testDate = (): string | null => {
    if (when === "tomorrow") return isoDay(addDays(1));
    if (when === "sunday") return isoDay(nextSunday());
    if (when === "week") return isoDay(addDays(7));
    if (when === "other") return /^\d{4}-\d{2}-\d{2}$/.test(other) ? other : null;
    return null;
  };

  async function save() {
    if (!user || !kind || busy) return;
    const t = text.trim();
    if (t.length < 2) return;
    setBusy(true);
    setMsg(c.saving);
    try {
      const headers = { "Content-Type": "application/json", ...(await auth()) };
      const date = kind === "text" ? null : testDate();
      let body: Record<string, unknown>;
      if (kind === "list") {
        const r = await fetch("/api/spell-set", { method: "POST", headers, body: JSON.stringify({ list: t, uiLang: lang, nativeLang, ...(pages ? { fromPhoto: true } : {}) }) });
        const j = (await r.json().catch(() => ({}))) as { safe?: boolean; title?: string; words?: Array<{ en: string; he: string }> };
        if (!r.ok || !j.safe || !Array.isArray(j.words) || j.words.length < 2) throw new Error("list");
        // No title: the pairing service names every list "My list" in English;
        // the card says "a word list" in the child's language instead.
        body = { kind, title: "", words: j.words, testDate: date };
      } else if (kind === "pages") {
        if (!learnLang) throw new Error("lang");
        const r = await fetch("/api/learn", { method: "POST", headers, body: JSON.stringify({ action: "unit", lang: learnLang, text: t, testDate: date, ui: lang }) });
        const j = (await r.json().catch(() => ({}))) as { list?: { unit?: { topic?: string } } };
        if (!r.ok) throw new Error("pages");
        body = { kind, title: j.list?.unit?.topic ?? "", testDate: date };
      } else {
        body = { kind, title: t.split(/\s+/).slice(0, 6).join(" "), text: t };
      }
      const r = await fetch("/api/homework-task", { method: "POST", headers, body: JSON.stringify(body) });
      const j = (await r.json().catch(() => ({}))) as { task?: SavedTask };
      if (!r.ok || !j.task) throw new Error("save");
      setMsg("");
      onSaved(j.task);
    } catch {
      setMsg(c.error);
    } finally {
      setBusy(false);
    }
  }

  const sundayName = (() => {
    try { return new Intl.DateTimeFormat(lang, { weekday: "long" }).format(nextSunday()); } catch { return ""; }
  })();
  // The Sunday chip only where the school week starts on Sunday.
  const showSunday = (lang === "he" || lang === "ar") && !!sundayName;
  const dates: Array<[DateChoice, string]> = [
    ["tomorrow", c.tomorrow],
    ...(showSunday ? [["sunday", sundayName] as [DateChoice, string]] : []),
    ["week", c.week],
    ["other", c.other],
    ["none", c.none],
  ];
  const kinds: Array<[Kind, string]> = [["list", c.kList], ["text", c.kText], ...(learnLang ? [["pages", c.kPages] as [Kind, string]] : [])];

  return (
    <div className="wb-hw-intake" dir={dir}>
      <p className="wb-hw-intake-sub">{c.addSub}</p>
      <div className="wb-hw-intake-row">
        {/* Photograph (camera, on phones and tablets) or upload a picture. */}
        {canCamera && (
          <button type="button" className="wb-hw-intake-photo" disabled={busy} onClick={() => camRef.current?.click()}>
            <GaditIcon name="photo" size={24} /> {pages ? c.more : c.photo}
          </button>
        )}
        <button type="button" className={canCamera ? "wb-hw-chip" : "wb-hw-intake-photo"} disabled={busy} onClick={() => fileRef.current?.click()}>
          <GaditIcon name="upload" size={24} /> {c.upload}
        </button>
        <input ref={camRef} type="file" accept="image/*" capture="environment" hidden
          onChange={(e) => { const f = e.target.files ? Array.from(e.target.files) : []; e.target.value = ""; void readPhotos(f); }} />
        <input ref={fileRef} type="file" accept="image/*" multiple hidden
          onChange={(e) => { const f = e.target.files ? Array.from(e.target.files) : []; e.target.value = ""; void readPhotos(f); }} />
      </div>
      <textarea id="hw-intake-text" className="wb-hw-intake-text" rows={6} dir={dir} value={text} placeholder={c.pastePh}
        onChange={(e) => { const v = e.target.value; setText(v); if (!kind && v.trim().length > 3) setKind(guessKind(v, pages)); }} />
      {msg && <p className="wb-hw-intake-msg" role="status">{busy ? <WaitText text={msg} /> : msg}</p>}
      {text.trim().length > 3 && kind && (
        <>
          <div className="wb-hw-intake-q">{c.what}</div>
          <div className="wb-hw-intake-chips" role="radiogroup" aria-label={c.what}>
            {kinds.map(([k, label]) => (
              <button key={k} type="button" role="radio" aria-checked={kind === k} className={`wb-hw-chip${kind === k ? " is-on" : ""}`} onClick={() => setKind(k)}>{label}</button>
            ))}
          </div>
          {kind !== "text" && (
            <>
              <div className="wb-hw-intake-q">{c.when}</div>
              <div className="wb-hw-intake-chips" role="radiogroup" aria-label={c.when}>
                {dates.map(([k, label]) => (
                  <button key={k} type="button" role="radio" aria-checked={when === k} className={`wb-hw-chip${when === k ? " is-on" : ""}`} onClick={() => setWhen(k)}>{label}</button>
                ))}
              </div>
              {when === "other" && (
                <input id="hw-intake-date" type="date" className="wb-hw-intake-date" value={other} onChange={(e) => setOther(e.target.value)} />
              )}
            </>
          )}
          <div className="wb-hw-intake-row">
            <button type="button" className="wb-hw-intake-save" disabled={busy || (when === "other" && kind !== "text" && !other)} onClick={() => void save()}>
              {busy ? <WaitText text={c.saving} /> : c.save}
            </button>
            <button type="button" className="wb-hw-chip" disabled={busy} onClick={onCancel}>{c.cancel}</button>
          </div>
        </>
      )}
    </div>
  );
}
