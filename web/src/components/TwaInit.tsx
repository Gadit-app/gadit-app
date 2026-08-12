"use client";

import { useEffect } from "react";
import { markTwaIfDetected } from "@/lib/twa";

/** Detects + persists the TWA (Android app) context on load. Renders nothing. */
export function TwaInit() {
  useEffect(() => {
    markTwaIfDetected();
  }, []);
  return null;
}
