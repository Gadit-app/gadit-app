"use client";

import { useLang } from "@/lib/lang-context";
import { CONTACT } from "@/lib/contact-i18n";

const SUPPORT_EMAIL = "support@neweducationacademy.com";

export default function ContactSection() {
  const { lang, dir } = useLang();
  const c = CONTACT[lang];

  return (
    <section id="contact" className="py-24 px-4 bg-white scroll-mt-20" dir={dir}>
      <div className="max-w-xl mx-auto text-center observe-section section-hidden">
        <h2
          className="text-3xl font-bold mb-3"
          style={{ color: "#0F172A", letterSpacing: dir === "rtl" ? "0.2px" : "-0.5px" }}
        >
          {c.stillNeedHelpHeading}
        </h2>
        <p className="text-slate-500 text-base mb-8 leading-relaxed">{c.stillNeedHelpBody}</p>

        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="btn-primary inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-10 5L2 7" />
          </svg>
          <span>{c.emailButton}</span>
        </a>

        <p className="text-xs text-slate-400 mt-5">{c.responseTime}</p>
        <p className="text-xs text-slate-400 mt-1" dir="ltr">
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="hover:text-blue-600 transition-colors"
          >
            {SUPPORT_EMAIL}
          </a>
        </p>
      </div>
    </section>
  );
}
