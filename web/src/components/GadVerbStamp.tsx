"use client";

/**
 * GadVerbStamp — small dictionary-style entry that defines "Gad" as a
 * verb, used as a quiet brand element in page footers.
 *
 * The meta-joke: a dictionary app defining its own brand name as a
 * verb in its own format. Adults who notice it smile; everyone else
 * scrolls past without friction. The Wordmark Flip animation in the
 * topbar (Gadit → Gad it.) is the visual primer, this stamp is the
 * verbal payoff.
 *
 * Layout is a small left-aligned card with a profile icon, the
 * headword + IPA + part-of-speech in a single line, the definition
 * underneath, and a sample sentence below. The icon implies a
 * speaker without committing to a specific illustrated mascot.
 *
 * Translatable parts: the definition itself (`verbStampDef`). The
 * headword "Gad", the IPA `/ɡæd/`, the part-of-speech abbrev `v.`,
 * and the example "Now I Gad it." all stay in English in every UI
 * locale — the joke is exactly that "Gad" is a new English verb.
 */

import { useLang } from "@/lib/lang-context";
import { v2 } from "@/lib/i18n-v2";

export function GadVerbStamp() {
  const { lang } = useLang();

  return (
    <aside
      className="wb-verb-stamp"
      role="note"
      aria-label="Gad — to understand a word, fully"
      dir="ltr"
    >
      <div className="wb-verb-stamp-head">
        <span className="wb-verb-stamp-icon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle
              cx="12"
              cy="12"
              r="10.5"
              stroke="currentColor"
              strokeWidth="1.1"
            />
            <circle
              cx="12"
              cy="10"
              r="3.2"
              stroke="currentColor"
              strokeWidth="1.1"
            />
            <path
              d="M 5.5 19.5 Q 12 14.5 18.5 19.5"
              stroke="currentColor"
              strokeWidth="1.1"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </span>
        <span className="wb-verb-stamp-headword">Gad</span>
        <span className="wb-verb-stamp-ipa">/ɡæd/</span>
        <span className="wb-verb-stamp-pos">v.</span>
      </div>
      <p className="wb-verb-stamp-def" lang={lang}>
        {v2(lang, "verbStampDef")}.
      </p>
      <p className="wb-verb-stamp-example">&ldquo;Now I Gad it.&rdquo;</p>
    </aside>
  );
}
