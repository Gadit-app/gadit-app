import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, verifyUserAndGetPlan } from "@/lib/firebase-admin";

/**
 * Error reporting endpoint.
 *
 * Anyone (signed in or anonymous) can report a problem with a definition,
 * etymology, example, quiz, or comparison result. Reports are written to
 * Firestore under errorReports/{autoId}.
 *
 * The point: collect feedback at scale to identify systemic prompt issues.
 * Admin reviews them via /admin/reports.
 */

type ReportCategory =
  | "definition"
  | "etymology"
  | "example"
  | "kids_explanation"
  | "idioms"
  | "image"
  | "quiz_wrong_answer"
  | "compose_feedback"
  | "compare_words"
  | "other";

const ALLOWED_CATEGORIES: ReportCategory[] = [
  "definition",
  "etymology",
  "example",
  "kids_explanation",
  "idioms",
  "image",
  "quiz_wrong_answer",
  "compose_feedback",
  "compare_words",
  "other",
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      categories,
      details,
      word,
      uiLang,
      contextSnapshot,
      pageUrl,
    } = body;

    // Basic validation
    if (!Array.isArray(categories) || categories.length === 0) {
      return NextResponse.json(
        { error: "at_least_one_category_required" },
        { status: 400 }
      );
    }
    const validCategories = categories.filter(
      (c: string): c is ReportCategory => ALLOWED_CATEGORIES.includes(c as ReportCategory)
    );
    if (validCategories.length === 0) {
      return NextResponse.json({ error: "invalid_categories" }, { status: 400 });
    }

    // Optional auth — capture user info if logged in (for admin context),
    // but anonymous reports are also allowed (lower friction).
    const authHeader = req.headers.get("Authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const userInfo = idToken ? await verifyUserAndGetPlan(idToken) : null;

    const db = getAdminDb();

    // If signed in, fetch their email from the users doc.
    let userEmail: string | null = null;
    if (userInfo?.userId) {
      try {
        const userDoc = await db.collection("users").doc(userInfo.userId).get();
        userEmail = (userDoc.data()?.email as string | undefined) ?? null;
      } catch {
        // ignore — email is optional
      }
    }

    const reportDoc = {
      categories: validCategories,
      details: typeof details === "string" ? details.trim().slice(0, 2000) : "",
      word: typeof word === "string" ? word.trim().slice(0, 200) : "",
      uiLang: typeof uiLang === "string" ? uiLang.slice(0, 5) : "en",
      pageUrl: typeof pageUrl === "string" ? pageUrl.slice(0, 500) : "",
      // contextSnapshot: serialized full GPT response so admin can see exactly
      // what the user was looking at when they reported the problem.
      // Cap at ~10KB to prevent abuse.
      contextSnapshot:
        typeof contextSnapshot === "string"
          ? contextSnapshot.slice(0, 10000)
          : JSON.stringify(contextSnapshot ?? {}).slice(0, 10000),
      // User info (if signed in)
      userId: userInfo?.userId ?? null,
      userEmail,
      userPlan: userInfo?.plan ?? "anonymous",
      // Metadata
      createdAt: new Date().toISOString(),
      status: "open" as const, // open | reviewed | fixed | wontfix
      adminNote: "",
    };

    const ref = await db.collection("errorReports").add(reportDoc);

    return NextResponse.json({ id: ref.id, ok: true });
  } catch (err) {
    console.error("report-error error:", err);
    return NextResponse.json(
      { error: "internal_error", details: String(err) },
      { status: 500 }
    );
  }
}
