import { NextRequest, NextResponse } from "next/server";
import { sampleTrialReminder } from "@/lib/email-drip/trial-reminder";

/** GET /api/admin/trial-reminder-preview?secret=&lang=he — the trial-end
 *  billing reminder with sample values, as HTML (Gadi 2026-10-06). */
export async function GET(req: NextRequest) {
  const s = req.nextUrl.searchParams.get("secret") ?? "";
  if (!process.env.ADMIN_SECRET || s !== process.env.ADMIN_SECRET) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const lang = req.nextUrl.searchParams.get("lang") ?? "he";
  const r = sampleTrialReminder(lang);
  return new NextResponse(`<!-- ${r.subject.replace(/--/g, "")} -->\n${r.html}`, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
