"use client";

/**
 * /say: the Say-it tool as a page in the shared tool frame (Gadi
 * 2026-10-11: it opened as a popup while every other tool is a page; the
 * frame keeps a kid's skin and the top bar, the two things the popup was
 * for).
 */

import { useLang } from "@/lib/lang-context";
import { ToolPage } from "@/components/design/ToolPage";
import { SayTool, sayHeading } from "./SayTool";

export function SayClient() {
  const { lang } = useLang();
  const h = sayHeading(lang);
  return (
    <ToolPage active="say" width={640} title={h.title} sub={h.sub}>
      <SayTool framed />
    </ToolPage>
  );
}
