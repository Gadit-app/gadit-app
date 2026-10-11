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

const COPY: Record<string, { tonight: (t: string) => string; go: string }> = {
  he: { tonight: (t) => `התרגול של הערב: ${t}`, go: "לשיעורי הבית" },
  en: { tonight: (t) => `Tonight's practice: ${t}`, go: "Go to Homework" },
  ar: { tonight: (t) => `تدريب الليلة: ${t}`, go: "إلى الواجبات" },
  ru: { tonight: (t) => `Практика на вечер: ${t}`, go: "К домашке" },
};

export function HomeworkStrip() {
  const { user } = useAuth();
  const { lang, dir } = useLang();
  const href = useHref();
  const [title, setTitle] = useState<string | null>(null);
  const c = COPY[lang];
  useEffect(() => {
    if (!user || !c) return;
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
  }, [user, lang, c]);
  if (!c || !title) return null;
  return (
    <Link href={href("/spell")} className="wb-homework-strip" dir={dir}>
      <ToolIcon id="spell" size={22} />
      <span className="wb-homework-strip-text">{c.tonight(title)}</span>
      <span className="wb-homework-strip-go">{c.go}</span>
    </Link>
  );
}
