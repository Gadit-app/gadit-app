import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { computeGamification, toLocalDateStr, type RankKey } from "@/lib/gamification";

/**
 * Family leaderboard (Gadi 2026-10-17): who in the family looked up the most
 * words, parents AND children on one board. Read-only.
 *
 * Source: users/{uid}/notebook. Every signed-in lookup is auto-saved there
 * once per word (WordClient auto-save, adults and kids alike), one doc per
 * distinct (language, word) with the ISO `addedAt` of the FIRST lookup. So
 * "this week" = distinct words first looked up in the last 7 days (rolling,
 * same rule as the dashboard's "+N this week"), "all time" = distinct words.
 * Words bulk-added by the offline pack (source "popular-pack") were never
 * looked up and are left out of both counts.
 *
 * Rank: the same points the child sees on their own header (one point per
 * notebook word, plus POINTS.understood per understood word).
 *
 * Auth: Bearer ID token of any member of the family (the owner, a paired
 * parent or a child). The family is the caller's own (families/{uid} for the
 * owner, users/{uid}.familyId otherwise) and the caller must be one of its
 * members, so no other family's data is ever read. Coach tokens are refused:
 * a coach sees one child only, never the household.
 */

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

type Row = {
  memberId: string;
  name: string;
  role: string;
  colorIndex: number;
  avatarId: string;
  photoUrl: string;
  isYou: boolean;
  week: number;
  allTime: number;
  rankKey: RankKey;
};

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const idToken = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : "";
    if (!idToken) return NextResponse.json({ error: "login_required" }, { status: 401 });

    let uid = "";
    try {
      const decoded = await getAdminAuth().verifyIdToken(idToken);
      if (decoded.coach === true) return NextResponse.json({ error: "not_family_member" }, { status: 403 });
      uid = decoded.uid;
    } catch {
      return NextResponse.json({ error: "login_required" }, { status: 401 });
    }

    const db = getAdminDb();
    let familyId: string | null = null;
    if ((await db.collection("families").doc(uid).get()).exists) {
      familyId = uid;
    } else {
      const fid = (await db.collection("users").doc(uid).get()).get("familyId");
      if (typeof fid === "string" && fid) familyId = fid;
    }
    if (!familyId) return NextResponse.json({ error: "not_family_member" }, { status: 403 });

    const membersSnap = await db.collection("families").doc(familyId).collection("members").get();
    type MemberDoc = {
      id: string;
      role?: string;
      name?: string;
      colorIndex?: number;
      userId?: string | null;
      isOwner?: boolean;
      avatarId?: string | null;
      avatarPhotoUrl?: string | null;
    };
    const members = membersSnap.docs.map((d): MemberDoc => ({ id: d.id, ...(d.data() as Omit<MemberDoc, "id">) }));
    // The owner's uid IS the family id; other members carry `userId` once
    // their device (or the shared-device switcher) linked them.
    const uidOf = (m: MemberDoc): string | null => (m.isOwner ? familyId : m.userId || null);

    // The caller must belong to this family.
    if (uid !== familyId && !members.some((m) => uidOf(m) === uid)) {
      return NextResponse.json({ error: "not_family_member" }, { status: 403 });
    }

    const now = Date.now();
    const cutoffMs = now - WEEK_MS;
    const todayStr = toLocalDateStr(new Date(now).toISOString());

    const rows = await Promise.all(
      members
        .filter((m) => !!uidOf(m)) // never-linked profiles can't look words up yet
        .map(async (m): Promise<Row> => {
          const memberUid = uidOf(m) as string;
          const row: Row = {
            memberId: m.id,
            name: m.name || "",
            role: m.role || "boy",
            colorIndex: typeof m.colorIndex === "number" ? m.colorIndex : 0,
            avatarId: m.avatarId || "",
            photoUrl: m.avatarPhotoUrl || "",
            isYou: memberUid === uid,
            week: 0,
            allTime: 0,
            rankKey: "scout",
          };
          try {
            const snap = await db
              .collection("users").doc(memberUid).collection("notebook")
              .select("addedAt", "source", "understood")
              .get();
            const all: string[] = [];
            let understood = 0;
            for (const d of snap.docs) {
              const x = d.data() as { addedAt?: string; source?: string; understood?: boolean };
              const at = typeof x.addedAt === "string" ? x.addedAt : "";
              if (!at) continue;
              all.push(at);
              if (x.understood === true) understood++;
              if (x.source === "popular-pack") continue;
              row.allTime++;
              const t = Date.parse(at);
              if (!Number.isNaN(t) && t >= cutoffMs) row.week++;
            }
            row.rankKey = computeGamification(all, now, todayStr, understood).rank.key;
          } catch (e) {
            console.error(`[family/leaderboard] notebook read failed for ${memberUid}:`, e);
          }
          return row;
        }),
    );

    rows.sort((a, b) => b.week - a.week || b.allTime - a.allTime || a.name.localeCompare(b.name));

    return NextResponse.json(
      { members: rows, weekDays: 7 },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (err) {
    console.error("[family/leaderboard] error:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
