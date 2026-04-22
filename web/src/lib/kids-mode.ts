"use client";
import { useEffect, useState } from "react";

const STORAGE_KEY = "gadit:kidsMode";

export function useKidsMode(): [boolean, (v: boolean) => void] {
  const [enabled, setEnabled] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "1") setEnabled(true);
    } catch {
      // localStorage unavailable
    }
  }, []);

  const update = (v: boolean) => {
    setEnabled(v);
    try {
      localStorage.setItem(STORAGE_KEY, v ? "1" : "0");
    } catch {
      // ignore
    }
  };

  return [enabled, update];
}
