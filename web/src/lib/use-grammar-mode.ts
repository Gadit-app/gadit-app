"use client";

import { useEffect, useState, useCallback } from "react";

/**
 * useGrammarMode — persistent "show part-of-speech labels next to each
 * meaning" toggle. Stored in localStorage so a learner who flips it on
 * once gets POS labels on every word after that, across tabs and
 * sessions.
 *
 * Christopher (early tester, 2026-06-19, WhatsApp) flagged missing
 * grammar info; Gadi's call was to gate the data behind a toggle so
 * the default render stays clean (idioms, etymology, examples — POS
 * is meta-info most casual readers don't want crowding the card).
 *
 * Not plan-gated. POS comes back in the cached /api/define payload
 * regardless, so showing it costs us nothing.
 */

const KEY = "gadit-grammar-mode";
const EVENT_NAME = "gadit-grammar-mode-change";

export function useGrammarMode(): [boolean, (next: boolean) => void] {
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setOn(window.localStorage.getItem(KEY) === "1");
    const onChange = () => {
      setOn(window.localStorage.getItem(KEY) === "1");
    };
    window.addEventListener("storage", onChange);
    window.addEventListener(EVENT_NAME, onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener(EVENT_NAME, onChange);
    };
  }, []);

  const set = useCallback((next: boolean) => {
    if (typeof window === "undefined") return;
    if (next) window.localStorage.setItem(KEY, "1");
    else window.localStorage.removeItem(KEY);
    window.dispatchEvent(new Event(EVENT_NAME));
  }, []);

  return [on, set];
}

export function readGrammarMode(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY) === "1";
}
