import { planCopy } from "@/lib/plan-copy";
import { langNameIn } from "@/lib/i18n";
import { neighbourWords } from "@/lib/word-index";

/**
 * Server-rendered links under a word page that shows a definition (SEO plan
 * item 6, Gadi 2026-10-06): the same word in the other languages that have
 * it, nearby words in this language, and the "all words" hub. Real <a> links,
 * so search engines can walk from word to word; before this every word page
 * was an orphan reachable only through the sitemap.
 */

const RTL = new Set(["he", "ar", "fa"]);

function wordHref(lang: string, word: string): string {
  const w = encodeURIComponent(word.toLowerCase());
  return lang === "en" ? `/word/${w}` : `/${lang}/word/${w}`;
}

export async function WordLinks({ lang, word, langs }: { lang: string; word: string; langs: string[] }) {
  const near = await neighbourWords(lang, word, 12);
  const others = langs.filter((l) => l !== lang);
  if (!near.length && !others.length) return null;
  const hub = lang === "en" ? "/words" : `/${lang}/words`;

  const wrap: React.CSSProperties = {
    maxWidth: 760,
    margin: "8px auto 40px",
    padding: "0 16px",
    display: "grid",
    gap: 18,
    direction: RTL.has(lang) ? "rtl" : "ltr",
    color: "var(--ink-muted, #5B6B70)",
    fontSize: 14,
  };
  const h: React.CSSProperties = { margin: "0 0 8px", fontSize: 13, fontWeight: 600, letterSpacing: "0.02em", textTransform: "uppercase" };
  const list: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: "6px 14px", margin: 0, padding: 0, listStyle: "none" };
  const a: React.CSSProperties = { color: "var(--teal-deep, #0E7490)", textDecoration: "none" };

  return (
    <nav aria-label={planCopy(lang, "wlMore")} style={wrap}>
      {others.length > 0 && (
        <div>
          <h2 style={h}>{planCopy(lang, "wlOtherLangs")}</h2>
          <ul style={list}>
            {others.map((l) => (
              <li key={l}>
                <a href={wordHref(l, word)} hrefLang={l} style={a}>
                  {langNameIn(l, lang)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      {near.length > 0 && (
        <div>
          <h2 style={h}>{planCopy(lang, "wlMore")}</h2>
          <ul style={list}>
            {near.map((w) => (
              <li key={w}>
                <a href={wordHref(lang, w)} style={a} dir="auto">
                  {w}
                </a>
              </li>
            ))}
            <li>
              <a href={hub} style={{ ...a, fontWeight: 600 }}>
                {planCopy(lang, "wlAll")}
              </a>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
