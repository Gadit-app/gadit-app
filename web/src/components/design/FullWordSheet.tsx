"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

/**
 * A word's full definition on top of the current screen (Gadi 2026-10-21:
 * from a text, homework or a game, "open the full definition" used to open a
 * new tab, which on a phone or in the app means leaving with no way back).
 * The word page loads inside the sheet, and one big "Back" button closes it:
 * the text, the green words and the game's progress are exactly as they were.
 */
const BACK: Record<string, string> = { en: "Back", he: "חזרה", ar: "رجوع", ru: "Назад", es: "Volver", pt: "Voltar", fr: "Retour", de: "Zurück", cs: "Zpět", sk: "Späť", it: "Indietro", ja: "戻る", hi: "वापस", am: "ተመለስ", uk: "Назад", tr: "Geri", pl: "Wróć", fa: "بازگشت", id: "Kembali", nl: "Terug", el: "Πίσω", zu: "Buyela", xh: "Buyela", nso: "Boela", tn: "Boela", st: "Kgutlela", ts: "Tlhelela", ss: "Buyela", ve: "Humela", nr: "Buyela", vi: "Quay lại", fil: "Bumalik", af: "Terug", sw: "Rudi", "zh-CN": "返回", "zh-TW": "返回", ko: "돌아가기", th: "กลับ", bn: "ফিরে যান", da: "Tilbage", hu: "Vissza" };

export function FullWordSheet({ url, lang, dir, onClose }: { url: string; lang: string; dir: "rtl" | "ltr"; onClose: () => void }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [onClose]);
  if (typeof document === "undefined") return null;
  const src = url + (url.includes("?") ? "&" : "?") + "sheet=1";
  return createPortal(
    <div className="gd-word-sheet" role="dialog" aria-modal="true" dir={dir}>
      <div className="gd-word-sheet-bar">
        <button type="button" className="gd-word-sheet-back" onClick={onClose} autoFocus>
          <span aria-hidden="true">{dir === "rtl" ? "→" : "←"}</span> {BACK[lang] ?? BACK.en}
        </button>
      </div>
      <iframe className="gd-word-sheet-frame" src={src} title={BACK[lang] ?? BACK.en} />
    </div>,
    document.body,
  );
}
