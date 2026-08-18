"use client";

/**
 * /say page wrapper. The tool itself lives in SayTool (shared with the
 * global SayModal, which is how it opens for logged-in users over their
 * own themed screen). This standalone page stays for direct-link access.
 */

import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { SayTool } from "./SayTool";

export function SayClient() {
  const { dir } = useLang();
  const href = useHref();
  return (
    <div className="wordbook" dir={dir} style={{ minHeight: "100dvh", background: "var(--paper, #F7F7F5)", color: "var(--ink, #14181F)" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", maxWidth: 760, margin: "0 auto" }}>
        <a href={href("/")} style={{ fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", textDecoration: "none", color: "inherit" }}>
          Gad<span style={{ color: "#0EA5A5" }}>it</span>
        </a>
      </header>
      <main style={{ maxWidth: 640, margin: "0 auto", padding: "8px 20px 64px" }}>
        <SayTool />
      </main>
    </div>
  );
}
