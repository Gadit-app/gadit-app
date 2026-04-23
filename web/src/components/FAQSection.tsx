"use client";

import { useState } from "react";
import { useLang } from "@/lib/lang-context";
import { CONTACT } from "@/lib/contact-i18n";

export default function FAQSection() {
  const { lang, dir } = useLang();
  const c = CONTACT[lang];
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 px-4 bg-[#F8FAFC]" dir={dir}>
      <div className="max-w-2xl mx-auto observe-section section-hidden">
        <div className="text-center mb-10">
          <h2
            className="text-3xl font-bold mb-3"
            style={{ color: "#0F172A", letterSpacing: dir === "rtl" ? "0.2px" : "-0.5px" }}
          >
            {c.faqHeading}
          </h2>
        </div>

        <div
          className="bg-white rounded-3xl overflow-hidden"
          style={{
            border: "1px solid rgb(226 232 240 / 0.9)",
            boxShadow: "0 2px 8px 0 rgb(0 0 0 / 0.04)",
          }}
        >
          <ul className="divide-y divide-slate-100">
            {c.faq.map((item, i) => {
              const isOpen = openIndex === i;
              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="w-full flex items-start justify-between gap-4 px-6 sm:px-8 py-4 text-start hover:bg-slate-50 transition-colors"
                  >
                    <span
                      className="text-sm sm:text-base font-medium flex-1"
                      style={{ color: "#0F172A" }}
                    >
                      {item.q}
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-slate-400 text-lg flex-shrink-0 mt-0.5 select-none"
                      style={{
                        transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                        transition: "transform 0.2s ease",
                        lineHeight: 1,
                      }}
                    >
                      +
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-6 sm:px-8 pb-5 -mt-1">
                      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                        {item.a}
                      </p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
