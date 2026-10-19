"use client";

import { useEffect } from "react";
import { isIosApp } from "@/lib/native-app";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    // Only register in production. In dev, the SW would interfere with hot reload.
    if (process.env.NODE_ENV !== "production") return;
    // Not inside the iOS app: its push is native, and a worker's own fetches
    // may not carry the app's user agent, which keeps purchase pages out.
    if (isIosApp()) {
      navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister())).catch(() => {});
      return;
    }

    const onLoad = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch((e) => console.warn("[sw] registration failed", e));
    };

    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });
  }, []);

  return null;
}
