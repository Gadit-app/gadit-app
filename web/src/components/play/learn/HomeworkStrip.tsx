"use client";

/**
 * One strip on the games page that points to Homework when there is a
 * lesson to do (Gadi 2026-10-11, the nav council: learning lives in
 * Homework; the games page only reminds). Nothing when no language is
 * being learned.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { ToolIcon } from "@/components/design/ToolIcon";
import { homeworkCopy } from "@/lib/homework-i18n";

// "Tonight's practice: <topic>" in every UI language; the button is the
// Homework section's own title (homework-i18n), so the two always match.
const TONIGHT: Record<string, string> = {
  he: "התרגול של הערב", en: "Tonight's practice", ar: "تدريب الليلة", ru: "Практика на вечер",
  es: "La práctica de esta noche", pt: "A prática de hoje à noite", fr: "L'entraînement de ce soir", de: "Heute Abend üben",
  cs: "Dnešní večerní procvičování", sk: "Dnešné večerné precvičovanie", it: "L'esercizio di stasera", ja: "今夜の練習",
  hi: "आज शाम का अभ्यास", am: "የዛሬ ምሽት ልምምድ", uk: "Вправа на вечір", tr: "Bu akşamın çalışması",
  pl: "Dzisiejsze ćwiczenie", fa: "تمرین امشب", id: "Latihan malam ini", nl: "De oefening van vanavond",
  el: "Η εξάσκηση της βραδιάς", zu: "Umsebenzi wakusihlwa", vi: "Bài luyện tối nay", fil: "Pagsasanay ngayong gabi",
  af: "Vanaand se oefening", sw: "Mazoezi ya leo jioni", "zh-CN": "今晚的练习", "zh-TW": "今晚的練習",
  ko: "오늘 저녁 연습", th: "แบบฝึกของคืนนี้", bn: "আজ সন্ধ্যার অনুশীলন", da: "Aftenens øvelse",
  hu: "A ma esti gyakorlás", xh: "Umsebenzi wangokuhlwa", nso: "Thuto ya bošego bja lehono", tn: "Boithapolo jwa maitseboa a gompieno",
  st: "Boikwetliso ba bosiu bona", ts: "Ntirho wa namuntlha nimadyambu", ss: "Kuticeceshisa kwanalokushona", ve: "Ndowendo ya madekwana a ṋamusi",
  nr: "Ukuzibandula kwanamhlanjesi",
};
// The four first languages keep their own "go to" wording.
const GO: Record<string, string> = { he: "לשיעורי הבית", en: "Go to Homework", ar: "إلى الواجبات", ru: "К домашке" };


export function HomeworkStrip() {
  const { user } = useAuth();
  const { lang, dir } = useLang();
  const href = useHref();
  const [title, setTitle] = useState<string | null>(null);
  const label = TONIGHT[lang] ?? TONIGHT.en;
  const go = GO[lang] ?? homeworkCopy(lang).title;
  useEffect(() => {
    if (!user) return;
    let alive = true;
    void (async () => {
      try {
        const r = await fetch(`/api/learn?ui=${encodeURIComponent(lang)}`, { headers: { Authorization: `Bearer ${await user.getIdToken()}` }, cache: "no-store" });
        const j = await r.json();
        if (!j.profile?.lang) return;
        const next = (j.lessons?.list ?? []).find((l: { id: string }) => l.id === j.lessons?.next);
        const t = j.lesson?.topic ?? next?.title;
        if (alive && t) setTitle(t);
      } catch { /* no strip */ }
    })();
    return () => { alive = false; };
  }, [user, lang]);
  if (!title) return null;
  return (
    <Link href={href("/homework")} className="wb-homework-strip" dir={dir}>
      <ToolIcon id="spell" size={22} />
      <span className="wb-homework-strip-text">{label}: {title}</span>
      <span className="wb-homework-strip-go">{go}</span>
    </Link>
  );
}
