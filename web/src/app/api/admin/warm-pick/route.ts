import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { pickImage, pickImageKey } from "@/lib/classroom-image";

/**
 * Admin: draw house-style pictures (soft 3D, lib/classroom-image pickImage,
 * ~0.65 cents each at low quality) for English words, so the flash cards and
 * picture games show one look everywhere (Gadi 2026-10-22).
 *
 *   POST /api/admin/warm-pick?secret=$ADMIN_SECRET
 *   { words: string[], max?: number (default 20, at most 60), dry?: boolean }
 *
 * A word that already has a house-style picture is skipped. A word with only
 * an older picture (the flat kids style, or none at all) is drawn. With dry,
 * nothing is drawn: it answers how many would be. Three at a time.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const ENGLISH_WORD = /^[a-z][a-z' -]{1,28}[a-z]$/i;

export async function POST(req: NextRequest) {
  if (!process.env.ADMIN_SECRET || req.nextUrl.searchParams.get("secret") !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const b = (await req.json().catch(() => null)) as { words?: unknown; max?: unknown; dry?: unknown } | null;
  const words = [...new Set((Array.isArray(b?.words) ? b!.words : []).filter((w): w is string => typeof w === "string").map((w) => w.trim()).filter((w) => ENGLISH_WORD.test(w)))];
  const max = Math.min(60, Math.max(1, Number(b?.max) || 20));
  const db = getAdminDb();
  const snaps = words.length ? await db.getAll(...words.map((w) => db.collection("imageCache").doc(pickImageKey(w)))) : [];
  const todo = words.filter((_, i) => !snaps[i]?.get("url")).slice(0, max);
  if (b?.dry === true) return NextResponse.json({ asked: words.length, alreadyHouse: words.length - words.filter((_, i) => !snaps[i]?.get("url")).length, wouldDraw: todo.length, estUsd: +(todo.length * 0.0075).toFixed(3) });
  const results: { word: string; status: string; url?: string }[] = [];
  for (let i = 0; i < todo.length; i += 3) {
    const out = await Promise.all(todo.slice(i, i + 3).map((w) => pickImage(w, "everyday words").catch((e) => ({ status: "error", error: String(e) }) as const)));
    out.forEach((r, j) => results.push({ word: todo[i + j], status: r.status, ...("url" in r && r.url ? { url: r.url } : {}) }));
  }
  return NextResponse.json({ drawn: results.filter((r) => r.status === "generated").length, results });
}
