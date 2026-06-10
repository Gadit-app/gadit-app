"use client";

/**
 * HelpCenter — categorised troubleshooting + FAQ rendered on /contact.
 *
 * Architecture notes:
 * - Uses native <details>/<summary> for accordion behavior. No client
 *   state, no JS to ship, free keyboard + screen reader support. The
 *   visual chrome is pure CSS in globals.css under `.wb-help-*`.
 * - Categories carry stable `id`s (billing / account / product /
 *   partner / general) so other pages can deep-link via #billing.
 *   We also set scrollMarginTop so the topbar doesn't cover the
 *   anchor when the page scrolls to it.
 * - Each Q&A item also has a stable id (e.g. #q-change-card) so an
 *   email reply or a tooltip elsewhere can deep-link to the exact
 *   question.
 * - i18n: HE + EN comprehensive, other 10 locales currently fall back
 *   to EN inside help-i18n.ts. When Andrea's Slovak audience grows,
 *   sk is the priority translate target.
 */

import { useLang } from "@/lib/lang-context";
import { HELP } from "@/lib/help-i18n";

// The only mailbox actually wired up in Namecheap forwarding right now
// is gadi@gadit.app (set up June 9 2026). A `support@gadit.app` alias is
// referenced in legal docs (Privacy, Terms) by convention but isn't
// receiving mail yet — if/when that forwarder is added, switch this
// constant. For now the Help Center "email me" CTA goes straight to
// Gadi's working address, which also matches the first-person founder
// voice the Help Center uses throughout ("I read every message myself").
const SUPPORT_EMAIL = "gadi@gadit.app";

export function HelpCenter() {
  const { lang, dir } = useLang();
  const c = HELP[lang] ?? HELP.en;
  const isRtl = dir === "rtl";

  return (
    <section className="wb-help" dir={dir}>
      <header className="wb-help-head">
        <div className="wb-help-eyebrow">{c.eyebrow}</div>
        <h1 className="wb-help-title">{c.heading}</h1>
        <p className="wb-help-lede">{c.lede}</p>
      </header>

      <div className="wb-help-categories">
        {c.categories.map((cat) => (
          <section
            key={cat.id}
            id={cat.id}
            className="wb-help-cat"
            aria-labelledby={`wb-help-cat-${cat.id}`}
          >
            <h2 id={`wb-help-cat-${cat.id}`} className="wb-help-cat-title">
              <span className="wb-help-cat-icon" aria-hidden="true">
                {cat.icon}
              </span>
              <span>{cat.title}</span>
            </h2>

            <div className="wb-help-items">
              {cat.items.map((item) => (
                <details
                  key={item.id}
                  id={`q-${item.id}`}
                  className="wb-help-item"
                >
                  <summary className="wb-help-q">
                    <span className="wb-help-q-text">{item.q}</span>
                    <span className="wb-help-q-chevron" aria-hidden="true">
                      {/* Pure-CSS rotation via [open] state on parent — see
                          globals.css. The svg path is the same in both
                          states; only the rotation changes, so the
                          element shows as a downward chevron when closed
                          and an upward chevron when open. */}
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 5l4 4 4-4" />
                      </svg>
                    </span>
                  </summary>
                  <div className="wb-help-a">
                    {item.a.map((para, i) => (
                      <p key={i} className="wb-help-a-p">
                        {para}
                      </p>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="wb-help-footer">
        <h3 className="wb-help-footer-title">{c.stillNeedHelpHeading}</h3>
        <p className="wb-help-footer-body">{c.stillNeedHelpBody}</p>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="wb-help-email-cta"
          dir={isRtl ? "rtl" : "ltr"}
        >
          {c.emailCta}
        </a>
        <p className="wb-help-response-time">{c.responseTime}</p>
        <p className="wb-help-email-line" dir="ltr">
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        </p>
      </div>
    </section>
  );
}
