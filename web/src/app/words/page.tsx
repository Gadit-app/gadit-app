import type { Metadata } from "next";
import { headers } from "next/headers";
import { planCopy } from "@/lib/plan-copy";
import { LANGUAGES } from "@/lib/i18n";
import { wordIndex } from "@/lib/word-index";

/**
 * /words (and /<lang>/words): every word that has a public definition in the
 * page's language, A to Z, each linked to its word page. The hub that ties the
 * word pages together for search engines (SEO plan item 6, Gadi 2026-10-06).
 */

const ALL_LANGS: string[] = LANGUAGES.map((l) => l.code);
const BASE = "https://www.gadit.app";
const RTL = new Set(["he", "ar", "fa"]);

async function pageLang(): Promise<string> {
  const h = await headers();
  const l = h.get("x-gadit-lang");
  return l && ALL_LANGS.includes(l) ? l : "en";
}
const hubUrl = (l: string) => (l === "en" ? `${BASE}/words` : `${BASE}/${l}/words`);

export async function generateMetadata(): Promise<Metadata> {
  const lang = await pageLang();
  return {
    title: `${planCopy(lang, "wlHubTitle")}`,
    description: planCopy(lang, "wlHubSub"),
    alternates: {
      canonical: hubUrl(lang),
      languages: { ...Object.fromEntries(ALL_LANGS.map((l) => [l, hubUrl(l)])), "x-default": hubUrl("en") },
    },
  };
}

export default async function WordsHub() {
  const lang = await pageLang();
  const words = await wordIndex(lang);
  const groups = new Map<string, string[]>();
  for (const w of words) {
    const first = Array.from(w)[0]?.toLocaleUpperCase(lang) ?? "#";
    const key = /\p{L}/u.test(first) ? first : "#";
    const g = groups.get(key) ?? [];
    g.push(w);
    groups.set(key, g);
  }
  const keys = [...groups.keys()];
  const wordHref = (w: string) => (lang === "en" ? `/word/${encodeURIComponent(w)}` : `/${lang}/word/${encodeURIComponent(w)}`);
  const a: React.CSSProperties = { color: "var(--teal-deep, #0E7490)", textDecoration: "none" };

  return (
    <main
      dir={RTL.has(lang) ? "rtl" : "ltr"}
      style={{ maxWidth: 900, margin: "0 auto", padding: "40px 16px 64px", color: "var(--ink, #16242A)", fontSize: 15, lineHeight: 1.6 }}
    >
      <p style={{ margin: "0 0 10px" }}>
        <a href={lang === "en" ? "/" : `/${lang}`} style={{ ...a, fontWeight: 700, fontSize: 20 }}>Gadit</a>
      </p>
      <h1 style={{ fontSize: 30, margin: "0 0 8px", textWrap: "balance" }}>{planCopy(lang, "wlHubTitle")}</h1>
      <p style={{ margin: "0 0 22px", color: "var(--ink-muted, #5B6B70)" }}>{planCopy(lang, "wlHubSub")}</p>
      <nav aria-label="A-Z" style={{ display: "flex", flexWrap: "wrap", gap: "6px 10px", margin: "0 0 26px" }}>
        {keys.map((k) => (
          <a key={k} href={`#l-${encodeURIComponent(k)}`} style={{ ...a, fontWeight: 600 }}>{k}</a>
        ))}
      </nav>
      {keys.map((k) => (
        <section key={k} id={`l-${encodeURIComponent(k)}`} style={{ margin: "0 0 22px" }}>
          <h2 style={{ fontSize: 18, margin: "0 0 8px" }}>{k}</h2>
          <ul style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", margin: 0, padding: 0, listStyle: "none" }}>
            {groups.get(k)!.map((w) => (
              <li key={w}><a href={wordHref(w)} style={a} dir="auto">{w}</a></li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
