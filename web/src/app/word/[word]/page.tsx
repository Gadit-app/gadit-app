import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import WordClient from "./WordClient";

interface Meaning {
  meaning: string;
  examples: string[];
}
interface Etymology {
  sourceLanguage?: string;
  originalWord?: string;
  breakdown?: string;
  originalMeaning?: string;
  historyNote?: string;
}
interface WordResult {
  word: string;
  language: string;
  multiplemeanings: boolean;
  meanings: Meaning[];
  etymology?: Etymology | string;
  suggestedWord?: string;
}

// Detect script to pick a language hint for the API
function detectLang(word: string): "he" | "en" | "ar" | "ru" {
  if (/[֐-׿]/.test(word)) return "he";
  if (/[؀-ۿ]/.test(word)) return "ar";
  if (/[Ѐ-ӿ]/.test(word)) return "ru";
  return "en";
}

async function getOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("host") || "www.gadit.app";
  const proto = h.get("x-forwarded-proto") || "https";
  return `${proto}://${host}`;
}

async function fetchWord(word: string): Promise<WordResult | null> {
  try {
    const origin = await getOrigin();
    const uiLang = detectLang(word);
    const res = await fetch(`${origin}/api/define`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word, uiLang }),
      // Cache server-side renders for 1 hour to avoid hammering the API
      next: { revalidate: 3600 },
    });
    if (!res.ok || !res.body) return null;
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    let final: WordResult | null = null;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() || "";
      for (const line of lines) {
        const t = line.trim();
        if (!t.startsWith("data:")) continue;
        const data = t.slice(5).trim();
        if (!data) continue;
        try {
          const ev = JSON.parse(data);
          if (ev.type === "done") final = ev.result;
        } catch {}
      }
    }
    return final;
  } catch (e) {
    console.error("word page fetch:", e);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ word: string }>;
}): Promise<Metadata> {
  const { word: rawWord } = await params;
  const word = decodeURIComponent(rawWord);
  const result = await fetchWord(word);

  // Word not found / API error → fall back to generic metadata
  if (!result || result.suggestedWord) {
    return {
      title: `${word} — Gadit`,
      description: `Look up "${word}" — meanings, examples, etymology.`,
    };
  }

  const firstMeaning = result.meanings?.[0]?.meaning ?? "";
  const allMeanings = result.meanings?.map((m) => m.meaning).slice(0, 3).join(" · ");
  const description =
    allMeanings.length > 20
      ? allMeanings.slice(0, 200)
      : firstMeaning
      ? `${firstMeaning.slice(0, 200)}`
      : `Look up "${word}" — meanings, examples, etymology.`;

  const title = `${word} — meaning, examples & etymology | Gadit`;
  const url = `https://www.gadit.app/word/${encodeURIComponent(word)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "Gadit",
      type: "article",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function WordPage({
  params,
}: {
  params: Promise<{ word: string }>;
}) {
  const { word: rawWord } = await params;
  const word = decodeURIComponent(rawWord);
  const result = await fetchWord(word);

  if (!result) notFound();

  // Pre-rendered SEO content (visible to crawlers and on first paint)
  // The interactive client component takes over for the live experience.
  return (
    <main className="min-h-screen bg-[#F8FAFC] pt-28 pb-20 px-4">
      <div className="max-w-2xl mx-auto">
        {/* SEO-only block — semantic markup, hidden visually once the
            client component mounts to avoid duplicate UI */}
        <div className="sr-only" aria-hidden="false">
          <h1>{word}</h1>
          {result.meanings?.map((m, i) => (
            <section key={i}>
              <h2>{m.meaning}</h2>
              {m.examples?.length ? (
                <ul>
                  {m.examples.map((ex, j) => (
                    <li key={j}>{ex}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
          {typeof result.etymology === "object" && result.etymology?.originalMeaning ? (
            <section>
              <h2>Origin</h2>
              <p>{result.etymology.sourceLanguage} · {result.etymology.originalMeaning}</p>
              {result.etymology.historyNote ? <p>{result.etymology.historyNote}</p> : null}
            </section>
          ) : null}
          <p>
            <Link href="/">Look up another word at Gadit</Link>
          </p>
        </div>

        {/* Interactive view — re-uses the live result UI by fetching client-side */}
        <WordClient word={word} initialResult={result} />
      </div>
    </main>
  );
}
