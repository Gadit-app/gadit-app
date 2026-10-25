"use client";

/**
 * walkthroughs-family — step builders for the "Family & install" guides:
 * install on a phone, add a family member (family/add/FamilyAddClient), pair
 * a child's device (family/[memberId]/pair + /join), the parent dashboard and
 * alerts (family/FamilyClient), Homework (homework/SpellClient) and ranks,
 * streaks and the family leaderboard (KidsGameHeader, FamilyLeaderboard).
 */

import type { Lang } from "@/lib/i18n";
import { gt, gtf } from "@/lib/guide-i18n";
import type { WalkStep } from "@/components/Walkthrough";
import { menuItems, MENU } from "@/components/walkthroughs-start";
import {
  Screen, AppBar, TopMenu, Sheet, Eyebrow, Row, PrimaryBtn, GhostBtn, QrBlock, Tabs, Toggle, Chip, Tile, Field, Note, RankBadge, WT,
} from "@/components/walkthrough-ui";

function Title({ children, sub }: { children: string; sub?: string }) {
  return (
    <div>
      <div style={{ fontSize: 19, fontWeight: 800, color: WT.ink, lineHeight: 1.25 }}>{children}</div>
      {sub && <div style={{ fontSize: 12.5, color: WT.muted, marginTop: 3, lineHeight: 1.45 }}>{sub}</div>}
    </div>
  );
}

function Avatar({ letter, color, size = 34 }: { letter: string; color: string; size?: number }) {
  return <span style={{ width: size, height: size, borderRadius: "50%", background: color, color: "#fff", display: "grid", placeItems: "center", fontSize: size * 0.42, fontWeight: 800, flex: "none" }}>{letter}</span>;
}

/** Two thin line icons of the real install sheets. */
function ShareIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v12M8 7l4-4 4 4" /><path d="M6 11H5v10h14V11h-1" />
    </svg>
  );
}

function familyTabs(lang: Lang) {
  return [gt(lang, "ui.tabHome"), gt(lang, "ui.tabFamily"), gt(lang, "ui.settings")];
}

// ── install ──
export function installSteps(lang: Lang): WalkStep[] {
  const safariBar = (
    <div dir="ltr" style={{ display: "flex", alignItems: "center", justifyContent: "space-around", background: "#F8F8F8", borderTop: `1px solid ${WT.line}`, margin: "auto -12px -12px", padding: "10px 0 14px" }}>
      <span style={{ color: "#2563EB", fontSize: 18 }}>‹</span>
      <span style={{ color: "#9CA3AF", fontSize: 18 }}>›</span>
      <ShareIcon />
      <span style={{ color: "#2563EB", fontSize: 15 }}>▤</span>
      <span style={{ color: "#2563EB", fontSize: 15 }}>▢</span>
    </div>
  );
  return [
    {
      caption: gt(lang, "install.s1"),
      tap: { x: "50%", y: "94%" },
      screen: (
        <Screen>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#EEF0F3", borderRadius: 10, padding: "7px 12px", fontSize: 12.5, color: WT.muted }}>
            <span>🔒</span><span dir="ltr">gadit.app</span>
          </div>
          <Sheet style={{ flex: 1, display: "grid", placeItems: "center" }}>
            <div dir="ltr" style={{ fontSize: 30, fontWeight: 800, color: WT.ink }}>Gad<span style={{ color: WT.teal }}>it</span></div>
          </Sheet>
          {safariBar}
        </Screen>
      ),
    },
    {
      caption: gt(lang, "install.s2"),
      tap: { x: "50%", y: "89%" },
      screen: (
        <Screen bg="#E9ECEF">
          <div style={{ marginTop: "auto" }} />
          <Sheet style={{ padding: 8, display: "flex", flexDirection: "column", gap: 8 }}>
            <Row icon={<ShareIcon />} label={gt(lang, "ui.share")} iconBg="#EAF2FF" />
            <div style={{ border: `2px solid ${WT.teal}`, borderRadius: 15 }}>
              <Row icon="➕" label={gt(lang, "ui.addHome")} iconBg="#EAF6F3" />
            </div>
          </Sheet>
        </Screen>
      ),
    },
    {
      caption: gt(lang, "install.s3"),
      tap: { x: lang === "he" ? "20%" : "80%", y: "91%" },
      screen: (
        <Screen>
          <AppBar />
          <Sheet style={{ flex: 1, display: "grid", placeItems: "center" }}>
            <div dir="ltr" style={{ fontSize: 30, fontWeight: 800, color: WT.ink }}>Gad<span style={{ color: WT.teal }}>it</span></div>
          </Sheet>
          <Sheet style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10, boxShadow: "0 -6px 20px rgba(15,23,42,.08)" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon-192.png" alt="" width={38} height={38} style={{ borderRadius: 10 }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: WT.ink }}>{gt(lang, "ui.installTitle")}</div>
                <div style={{ fontSize: 12, color: WT.muted, lineHeight: 1.4 }}>{gt(lang, "ui.installAndroid")}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <GhostBtn>{gt(lang, "ui.later")}</GhostBtn>
              <PrimaryBtn>{gt(lang, "ui.install")}</PrimaryBtn>
            </div>
          </Sheet>
        </Screen>
      ),
    },
    {
      caption: gt(lang, "install.s4"),
      screen: (
        <Screen bg="linear-gradient(160deg,#DCE7F0,#CBD9E6)">
          <div style={{ margin: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon-192.png" alt="" width={74} height={74} style={{ borderRadius: 18, boxShadow: "0 10px 24px rgba(14,165,165,0.35)" }} />
            <div style={{ fontSize: 13, fontWeight: 600, color: WT.ink }}>Gadit</div>
          </div>
        </Screen>
      ),
    },
  ];
}

// ── add a family member ──
export function addChildSteps(lang: Lang): WalkStep[] {
  const roles = [
    { k: "ui.roleDad", c: "#0EA5A5", i: "♂" },
    { k: "ui.roleMom", c: "#7C3AED", i: "♀" },
    { k: "ui.roleSon", c: "#F59E0B", i: "☺" },
    { k: "ui.roleDaughter", c: "#EC4899", i: "☺" },
  ];
  const colors = ["#0EA5A5", "#7C3AED", "#F59E0B", "#EC4899", "#2563EB", "#16A34A", "#DC2626", "#0B1220"];
  const form = (name: string, dup?: boolean) => (
    <Screen>
      <Title sub={gt(lang, "ui.nameColor")}>{gt(lang, "ui.whoJoining")}</Title>
      <Field label={gt(lang, "ui.name")} text={name} focused={!dup} />
      <div style={{ width: 110 }}><Field label={gt(lang, "ui.ageOpt")} text="9" /></div>
      <div>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: WT.soft, marginBottom: 6 }}>{gt(lang, "ui.avatarColor")}</div>
        <div style={{ display: "flex", gap: 7 }}>
          {colors.map((c, k) => <span key={c} style={{ width: 22, height: 22, borderRadius: "50%", background: c, boxShadow: k === 3 ? `0 0 0 2px #fff, 0 0 0 4px ${c}` : "none" }} />)}
        </div>
      </div>
      {dup && (
        <Sheet style={{ padding: 12, borderColor: WT.teal, background: "rgba(14,165,165,.06)" }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: WT.ink }}>{gtf(lang, "ui.dupTitle", { name })}</div>
          <div style={{ fontSize: 12.5, color: WT.soft, marginTop: 3, lineHeight: 1.45 }}>{gt(lang, "ui.dupBody")}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            <PrimaryBtn>{gt(lang, "ui.reconnect")}</PrimaryBtn>
            <GhostBtn>{gt(lang, "ui.addAnyway")}</GhostBtn>
          </div>
        </Sheet>
      )}
      {!dup && (
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <GhostBtn>{gt(lang, "ui.cancel")}</GhostBtn>
          <PrimaryBtn>{gt(lang, "ui.addToFamily")}</PrimaryBtn>
        </div>
      )}
    </Screen>
  );
  return [
    {
      caption: gt(lang, "addchild.s1"),
      tap: { x: "50%", y: "35%" },
      screen: (
        <Screen>
          <Tabs items={familyTabs(lang)} active={1} />
          <Eyebrow>{gt(lang, "ui.children")}</Eyebrow>
          <Row icon={<Avatar letter={gt(lang, "demo.child1").slice(0, 1)} color="#EC4899" />} label={gt(lang, "demo.child1")} sub={gt(lang, "ui.roleDaughter")} iconBg="transparent" />
          <div style={{ border: `1.5px dashed ${WT.teal}`, borderRadius: 14, padding: "12px 14px", fontSize: 14.5, fontWeight: 700, color: WT.tealDeep, textAlign: "center" }}>＋ {gt(lang, "ui.addMember")}</div>
        </Screen>
      ),
    },
    {
      caption: gt(lang, "addchild.s2"),
      tap: { x: lang === "he" ? "74%" : "26%", y: "42%" },
      screen: (
        <Screen>
          <Title sub={gt(lang, "ui.pickRole")}>{gt(lang, "ui.whoJoining")}</Title>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 6 }}>
            {roles.map((r, k) => (
              <Sheet key={r.k} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 14, borderColor: k === 2 ? WT.teal : WT.line, borderWidth: k === 2 ? 2 : 1 }}>
                <span style={{ width: 50, height: 50, borderRadius: "50%", background: r.c, color: "#fff", display: "grid", placeItems: "center", fontSize: 24 }}>{r.i}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: WT.ink }}>{gt(lang, r.k)}</span>
              </Sheet>
            ))}
          </div>
        </Screen>
      ),
    },
    {
      caption: gt(lang, "addchild.s3"),
      screen: form(gt(lang, "demo.child2")),
    },
    {
      caption: gt(lang, "addchild.s4"),
      screen: form(gt(lang, "demo.child1"), true),
    },
  ];
}

// ── pair a child's device ──
export function pairSteps(lang: Lang): WalkStep[] {
  return [
    {
      caption: gt(lang, "pair.s1"),
      tap: { x: "50%", y: "41%" },
      screen: (
        <Screen>
          <Tabs items={familyTabs(lang)} active={1} />
          <Eyebrow>{gt(lang, "ui.children")}</Eyebrow>
          <Sheet style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: 14 }}>
            <Avatar letter={gt(lang, "demo.child2").slice(0, 1)} color="#F59E0B" size={46} />
            <div style={{ fontSize: 15, fontWeight: 800, color: WT.ink }}>{gt(lang, "demo.child2")}</div>
            <div style={{ fontSize: 12, color: WT.muted }}>{gt(lang, "ui.roleSon")}</div>
            <span style={{ marginTop: 4, fontSize: 13, fontWeight: 700, color: WT.tealDeep, border: `1.5px solid ${WT.teal}`, borderRadius: 999, padding: "6px 14px" }}>{gt(lang, "ui.pairDevice")}</span>
          </Sheet>
        </Screen>
      ),
    },
    {
      caption: gt(lang, "pair.s2"),
      screen: (
        <Screen>
          <Title>{gt(lang, "ui.pairDevice")}</Title>
          <Note>{gt(lang, "ui.reconnectNote")}</Note>
          <Sheet style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: WT.ink, alignSelf: "flex-start" }}>{gt(lang, "ui.pairQr")}</div>
            <QrBlock code="" />
            <div style={{ fontSize: 12, color: WT.muted }}>{gt(lang, "ui.or")}</div>
            <div dir="ltr" style={{ fontSize: 13, fontWeight: 700, color: WT.tealDeep }}>gadit.app/join</div>
            <div style={{ fontSize: 11.5, color: WT.muted }}>{gt(lang, "ui.yourCode")}</div>
            <div dir="ltr" style={{ fontSize: 24, fontWeight: 800, letterSpacing: "0.18em", color: WT.ink }}>048213</div>
          </Sheet>
        </Screen>
      ),
    },
    {
      caption: gt(lang, "pair.s3"),
      tap: { x: "50%", y: "39%" },
      screen: (
        <Screen>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <div dir="ltr" style={{ fontSize: 32, fontWeight: 800, color: WT.ink }}>Gad<span style={{ color: WT.teal }}>it</span></div>
          </div>
          <div style={{ display: "flex", alignItems: "center", background: WT.surface, border: `1.5px solid ${WT.line}`, borderRadius: 999, padding: "11px 14px", fontSize: 14, color: WT.faint }}>{gt(lang, "ui.searchPlaceholder")}</div>
          <div style={{ textAlign: "center", fontSize: 13, color: WT.soft, marginTop: 6 }}>{gt(lang, "ui.joinLine")}</div>
          <div style={{ display: "flex", justifyContent: "center" }}><GhostBtn>{gt(lang, "ui.enterCode")}</GhostBtn></div>
        </Screen>
      ),
    },
    {
      caption: gt(lang, "pair.s4"),
      tap: { x: "50%", y: "35%" },
      screen: (
        <Screen>
          <div style={{ marginTop: 40 }}><Title sub={gt(lang, "ui.joinSub")}>{gt(lang, "ui.joinTitle")}</Title></div>
          <Field label={gt(lang, "ui.sixDigit")} text="048213" focused />
          <PrimaryBtn full>{gt(lang, "ui.continue")}</PrimaryBtn>
          <Note>✓ {gt(lang, "ui.joined")}</Note>
        </Screen>
      ),
    },
  ];
}

function KidCard({ lang, name, color, words, days, rank, week, recent }: { lang: Lang; name: string; color: string; words: number; days: number; rank: string; week: number; recent: string[] }) {
  return (
    <Sheet style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar letter={name.slice(0, 1)} color={color} />
        <div style={{ flex: 1, fontSize: 15, fontWeight: 800, color: WT.ink }}>{name}</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: WT.teal, lineHeight: 1 }}>{words}</div>
          <div style={{ fontSize: 10.5, color: WT.muted }}>{gt(lang, "ui.wordsInNb")}</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
        {[gtf(lang, "ui.daysRow", { n: days }), `🏅 ${rank}`, gtf(lang, "ui.weekly", { n: week })].map((b) => (
          <span key={b} style={{ fontSize: 11, fontWeight: 600, color: WT.soft, background: WT.paper, borderRadius: 999, padding: "3px 8px" }}>{b}</span>
        ))}
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: WT.muted }}>{gt(lang, "ui.recentWords")}</div>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
        {recent.map((w) => <span key={w} style={{ fontSize: 11.5, color: WT.tealDeep, border: `1px solid ${WT.line}`, borderRadius: 999, padding: "3px 9px" }}>{w}</span>)}
      </div>
    </Sheet>
  );
}

function Leaderboard({ lang }: { lang: Lang }) {
  const rows = [
    { n: gt(lang, "demo.child1"), c: "#EC4899", r: "tracker", rn: gt(lang, "rank.tracker"), w: 128 },
    { n: gt(lang, "demo.parent"), c: WT.teal, r: "explorer", rn: gt(lang, "rank.explorer"), w: 96, you: true },
    { n: gt(lang, "demo.child2"), c: "#F59E0B", r: "explorer", rn: gt(lang, "rank.explorer"), w: 74 },
  ];
  const medal = ["#E8B923", "#B8C0CC", "#CD7F32"];
  return (
    <Sheet style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
      <div>
        <div style={{ fontSize: 14.5, fontWeight: 800, color: WT.ink }}>{gt(lang, "ui.leaderboard")}</div>
        <div style={{ fontSize: 11.5, color: WT.muted }}>{gt(lang, "ui.leaderSub")}</div>
      </div>
      {rows.map((r, k) => (
        <div key={r.n} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 20, height: 20, borderRadius: "50%", background: medal[k], color: "#fff", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 800, flex: "none" }}>{k + 1}</span>
          <Avatar letter={r.n.slice(0, 1)} color={r.c} size={26} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: WT.ink }}>{r.n}{r.you && <span style={{ fontSize: 10, color: WT.tealDeep, background: "rgba(14,165,165,.1)", borderRadius: 6, padding: "1px 5px", marginInlineStart: 5 }}>{gt(lang, "ui.you")}</span>}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10.5, color: WT.muted }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/ranks/${r.r}.webp`} alt="" width={16} height={16} style={{ objectFit: "contain" }} />{r.rn}
            </div>
          </div>
          <span style={{ fontSize: 15, fontWeight: 800, color: WT.teal }}>{r.w}</span>
        </div>
      ))}
    </Sheet>
  );
}

// ── parent dashboard ──
export function dashboardSteps(lang: Lang): WalkStep[] {
  return [
    {
      caption: gt(lang, "dash.s1"),
      screen: (
        <Screen>
          <Tabs items={familyTabs(lang)} active={0} />
          <Title sub={gtf(lang, "ui.kidsLine", { n: 2, w: 202 })}>{`${gt(lang, "ui.greetEvening")}, ${gt(lang, "demo.parent")} 🌆`}</Title>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <Sheet style={{ padding: 10 }}><div style={{ fontSize: 20, fontWeight: 800, color: WT.teal }}>298</div><div style={{ fontSize: 11.5, color: WT.muted }}>{gt(lang, "ui.familyWords")}</div></Sheet>
            <Sheet style={{ padding: 10 }}><div style={{ fontSize: 20, fontWeight: 800, color: WT.teal }}>+20</div><div style={{ fontSize: 11.5, color: WT.muted }}>{gt(lang, "ui.newThisWeek")}</div></Sheet>
          </div>
          <Eyebrow>{gt(lang, "ui.overview")}</Eyebrow>
          <KidCard lang={lang} name={gt(lang, "demo.child1")} color="#EC4899" words={128} days={5} rank={gt(lang, "rank.tracker")} week={12} recent={[gt(lang, "demo.word"), gt(lang, "demo.word2"), gt(lang, "demo.word3")]} />
        </Screen>
      ),
    },
    {
      caption: gt(lang, "dash.s2"),
      screen: (
        <Screen>
          <Eyebrow>{gt(lang, "ui.overview")}</Eyebrow>
          <KidCard lang={lang} name={gt(lang, "demo.child1")} color="#EC4899" words={128} days={5} rank={gt(lang, "rank.tracker")} week={12} recent={[gt(lang, "demo.word"), gt(lang, "demo.word2"), gt(lang, "demo.word3")]} />
          <KidCard lang={lang} name={gt(lang, "demo.child2")} color="#F59E0B" words={74} days={2} rank={gt(lang, "rank.explorer")} week={8} recent={[gt(lang, "demo.kw2"), gt(lang, "demo.kw3")]} />
        </Screen>
      ),
    },
    {
      caption: gt(lang, "dash.s3"),
      screen: (
        <Screen>
          <Leaderboard lang={lang} />
        </Screen>
      ),
    },
    {
      caption: gt(lang, "dash.s4"),
      screen: (
        <Screen>
          <Sheet style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: WT.ink }}>{gt(lang, "ui.recentLookups")}</div>
              <div style={{ fontSize: 11.5, color: WT.muted }}>{gt(lang, "ui.recentSub")}</div>
            </div>
            {[
              { w: gt(lang, "demo.word"), n: gt(lang, "demo.child1"), t: "18:42" },
              { w: gt(lang, "demo.kw2"), n: gt(lang, "demo.child2"), t: "17:05" },
              { w: gt(lang, "demo.word2"), n: gt(lang, "demo.child1"), t: "16:30" },
            ].map((r) => (
              <div key={r.w} style={{ display: "flex", alignItems: "center", gap: 8, borderTop: `1px solid ${WT.line}`, paddingTop: 8 }}>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: WT.ink }}>{r.w}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", background: WT.teal, borderRadius: 999, padding: "2px 8px" }}>{r.n}</span>
                <span dir="ltr" style={{ fontSize: 11, color: WT.muted }}>{gt(lang, "ui.today")} {r.t}</span>
              </div>
            ))}
          </Sheet>
        </Screen>
      ),
    },
  ];
}

// ── alerts about your kids ──
export function alertsSteps(lang: Lang): WalkStep[] {
  const head = (
    <div>
      <div style={{ fontSize: 15, fontWeight: 800, color: WT.ink }}>{gt(lang, "ui.alertsLabel")}</div>
      <div style={{ fontSize: 12, color: WT.muted, lineHeight: 1.45, marginTop: 2 }}>{gt(lang, "ui.alertsSub")}</div>
    </div>
  );
  const radio = (k: string, sub: string, on: boolean) => (
    <Sheet style={{ padding: 10, display: "flex", gap: 8, alignItems: "flex-start", borderColor: on ? WT.teal : WT.line, borderWidth: on ? 2 : 1 }}>
      <span style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${on ? WT.teal : WT.faint}`, display: "grid", placeItems: "center", flex: "none", marginTop: 2 }}>{on && <span style={{ width: 8, height: 8, borderRadius: "50%", background: WT.teal }} />}</span>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: WT.ink }}>{gt(lang, k)}</div>
        <div style={{ fontSize: 11.5, color: WT.muted }}>{gt(lang, sub)}</div>
      </div>
    </Sheet>
  );
  return [
    {
      caption: gt(lang, "alerts.s1"),
      tap: { x: lang === "he" ? "18%" : "86%", y: "30%" },
      screen: (
        <Screen>
          <Tabs items={familyTabs(lang)} active={2} />
          {head}
          <Toggle on={false} label={gt(lang, "ui.alertsSwitch")} />
        </Screen>
      ),
    },
    {
      caption: gt(lang, "alerts.s2"),
      screen: (
        <Screen>
          <Tabs items={familyTabs(lang)} active={2} />
          {head}
          <Toggle on label={gt(lang, "ui.alertsSwitch")} />
          {radio("ui.alertNow", "ui.alertNowSub", true)}
          {radio("ui.alertDaily", "ui.alertDailySub", false)}
        </Screen>
      ),
    },
    {
      caption: gt(lang, "alerts.s3"),
      tap: { x: "50%", y: "30%" },
      screen: (
        <Screen>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: WT.ink }}>{gt(lang, "ui.alertWhat")}</div>
          {["ui.alertCat1", "ui.alertCat2", "ui.alertCat3"].map((k) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: WT.ink }}>
              <span style={{ width: 18, height: 18, borderRadius: 5, background: WT.teal, color: "#fff", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 800 }}>✓</span>{gt(lang, k)}
            </div>
          ))}
          <div style={{ marginTop: 8 }}><PrimaryBtn full>{gt(lang, "ui.alertDevice")}</PrimaryBtn></div>
        </Screen>
      ),
    },
    {
      caption: gt(lang, "alerts.s4"),
      screen: (
        <Screen bg="linear-gradient(160deg,#DCE7F0,#CBD9E6)">
          <div style={{ marginTop: 8, background: "rgba(255,255,255,.92)", borderRadius: 16, padding: "12px 14px", display: "flex", gap: 10, alignItems: "center", boxShadow: "0 6px 18px rgba(11,18,32,0.12)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon-192.png" alt="" width={34} height={34} style={{ borderRadius: 9, flex: "none" }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: WT.ink }}>Gadit</div>
              <div style={{ fontSize: 12.5, color: WT.soft }}>{gt(lang, "demo.alertText")}</div>
            </div>
          </div>
        </Screen>
      ),
    },
  ];
}

// ── homework (kids on Family) ──
export function homeworkSteps(lang: Lang): WalkStep[] {
  const kids = gt(lang, "ui.kidsMode");
  const addBtn = (icon: string, k: string) => (
    <span style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4, background: WT.surface, border: `1px solid ${WT.line}`, borderRadius: 12, padding: "9px 6px", fontSize: 13, fontWeight: 700, color: WT.ink }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/icons/${icon}.webp`} alt="" width={24} height={24} style={{ objectFit: "contain" }} />{gt(lang, k)}
    </span>
  );
  const tiles = (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      <Tile img="/play/hw-learn.webp" title={gt(lang, "ui.hwLearn")} />
      <Tile img="/play/hw-read.webp" title={gt(lang, "ui.hwRead")} />
      <Tile img="/play/hw-test.webp" title={gt(lang, "ui.hwTest")} />
    </div>
  );
  return [
    {
      caption: gt(lang, "homework.s1"),
      tap: { x: lang === "he" ? "80%" : "26%", y: "29%" },
      screen: (
        <Screen>
          <AppBar kids={kids} kidsOn />
          <div style={{ fontSize: 19, fontWeight: 800, color: WT.ink }}>{gt(lang, "ui.nav.homework")}</div>
          <Sheet style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: WT.ink }}>{gt(lang, "ui.hwAdd")}</div>
            <div style={{ display: "flex", gap: 6 }}>
              {addBtn("photo", "ui.hwPhoto")}{addBtn("upload", "ui.hwUpload")}{addBtn("paste", "ui.hwPaste")}
            </div>
          </Sheet>
          {tiles}
        </Screen>
      ),
    },
    {
      caption: gt(lang, "homework.s2"),
      tap: { x: lang === "he" ? "17%" : "83%", y: "51%" },
      screen: (
        <Screen>
          <Field text={gt(lang, "demo.hwList")} multiline focused />
          <div style={{ fontSize: 12.5, fontWeight: 700, color: WT.soft }}>{gt(lang, "ui.hwWhat")}</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <Chip active>{gt(lang, "ui.hwWordList")}</Chip><Chip>{gt(lang, "ui.hwText")}</Chip><Chip>{gt(lang, "ui.hwPages")}</Chip>
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: WT.soft }}>{gt(lang, "ui.hwWhen")}</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <Chip active>{gt(lang, "ui.hwTomorrow")}</Chip><Chip>{gt(lang, "ui.hwWeek")}</Chip><Chip>{gt(lang, "ui.hwNoTest")}</Chip>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
            <GhostBtn>{gt(lang, "ui.cancel")}</GhostBtn><PrimaryBtn>{gt(lang, "ui.hwSave")}</PrimaryBtn>
          </div>
        </Screen>
      ),
    },
    {
      caption: gt(lang, "homework.s3"),
      screen: (
        <Screen>
          <div style={{ fontSize: 19, fontWeight: 800, color: WT.ink }}>{gt(lang, "ui.nav.homework")}</div>
          <Sheet style={{ padding: 12, display: "flex", alignItems: "center", gap: 10, borderColor: WT.teal }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/todo.webp" alt="" width={34} height={34} style={{ objectFit: "contain" }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: WT.tealDeep }}>{gt(lang, "ui.hwTodo")}</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: WT.ink }}>{gt(lang, "ui.hwWordList")} · {gtf(lang, "ui.hwWords", { n: 6 })}</div>
            </div>
            <PrimaryBtn>{gt(lang, "ui.hwStart")}</PrimaryBtn>
          </Sheet>
          {tiles}
        </Screen>
      ),
    },
    {
      caption: gt(lang, "homework.s4"),
      screen: (
        <Screen>
          <div style={{ fontSize: 17, fontWeight: 800, color: WT.ink }}>{gt(lang, "ui.hwLearn")}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <Tile img="/play/hw-lessons.webp" title={gt(lang, "ui.hwWhichLang")} />
            <Tile img="/play/hw-dict.webp" title={gt(lang, "ui.hwSpelling")} sub={gt(lang, "ui.hwSpellingSub")} />
            <Tile img="/play/hw-pick-word.webp" title={gt(lang, "ui.hwPick")} sub={gt(lang, "ui.hwPickSub")} />
            <Tile img="/play/hw-pick.webp" title={gt(lang, "ui.hwPickPic")} sub={gt(lang, "ui.hwPickPicSub")} />
          </div>
        </Screen>
      ),
    },
  ];
}

// ── ranks, streaks and the family leaderboard ──
export function ranksSteps(lang: Lang): WalkStep[] {
  const ranks = [
    { r: "scout", k: "rank.scout", min: 0, state: "done" },
    { r: "explorer", k: "rank.explorer", min: 20, state: "here" },
    { r: "tracker", k: "rank.tracker", min: 60, state: "locked" },
    { r: "ranger", k: "rank.ranger", min: 120, state: "locked" },
  ];
  const tile = (icon: string, num: string, label: string, sub: string, color: string) => (
    <Sheet style={{ padding: 8, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, textAlign: "center" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={icon} alt="" width={34} height={34} style={{ objectFit: "contain" }} />
      <div style={{ fontSize: 13, fontWeight: 800, color, lineHeight: 1.2 }}>{num}</div>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: WT.ink }}>{label}</div>
      <div style={{ fontSize: 9.5, color: WT.muted, lineHeight: 1.3 }}>{sub}</div>
    </Sheet>
  );
  return [
    {
      caption: gt(lang, "ranks.s1"),
      tap: { x: lang === "he" ? "31%" : "72%", y: "6%" },
      screen: (
        <Screen>
          <AppBar help rank="explorer" highlight="rank" />
          <Sheet style={{ flex: 1, display: "grid", placeItems: "center" }}>
            <div dir="ltr" style={{ fontSize: 30, fontWeight: 800, color: WT.ink }}>Gad<span style={{ color: WT.teal }}>it</span></div>
          </Sheet>
        </Screen>
      ),
    },
    {
      caption: gt(lang, "ranks.s2"),
      screen: (
        <Screen bg="rgba(11,18,32,0.35)">
          <Sheet style={{ marginTop: 20, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: WT.ink }}>{gt(lang, "ui.yourRanks")}</div>
            <div style={{ fontSize: 11.5, color: WT.muted, lineHeight: 1.45 }}>{gtf(lang, "ui.ranksSub", { n: 34 })}</div>
            {ranks.map((x) => (
              <div key={x.r} style={{ display: "flex", alignItems: "center", gap: 8, padding: 6, borderRadius: 10, border: `1.5px solid ${x.state === "here" ? "#8B5CF6" : "transparent"}`, opacity: x.state === "locked" ? 0.6 : 1 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/ranks/${x.r}.webp`} alt="" width={34} height={34} style={{ objectFit: "contain" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: WT.ink }}>{gt(lang, x.k)}</div>
                  <div style={{ fontSize: 10.5, color: WT.muted }}>{x.min}+ {gt(lang, "ui.points")}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: x.state === "here" ? "#8B5CF6" : WT.muted }}>{x.state === "here" ? gt(lang, "ui.youHere") : x.state === "done" ? "✓" : gt(lang, "ui.locked")}</span>
              </div>
            ))}
          </Sheet>
        </Screen>
      ),
    },
    {
      caption: gt(lang, "ranks.s3"),
      screen: (
        <Screen>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
            {tile("/icons/streak.webp", "5", gt(lang, "ui.dayStreak"), gtf(lang, "ui.daysInRow", { n: 5 }), WT.teal)}
            {tile("/icons/goal.webp", "7/10", gt(lang, "ui.weeklyGoal"), gtf(lang, "ui.goalWords", { n: 7, g: 10 }), "#F59E0B")}
            {tile("/ranks/explorer.webp", gt(lang, "rank.explorer"), gt(lang, "ui.yourRank"), gtf(lang, "ui.toNext", { n: 26 }), "#8B5CF6")}
          </div>
          <Sheet style={{ padding: 8, display: "flex", flexDirection: "column", gap: 2 }}>
            {[
              { e: "🚀", k: "ui.skinSpace", lock: "" },
              { e: "🔒", k: "ui.skinSunset", lock: gt(lang, "rank.tracker") },
              { e: "🔒", k: "ui.skinAurora", lock: gt(lang, "rank.guide") },
            ].map((s) => (
              <div key={s.k} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 8, background: s.lock ? "transparent" : "rgba(14,165,165,.08)" }}>
                <span style={{ fontSize: 17 }}>{s.e}</span>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: s.lock ? WT.muted : WT.ink }}>{gt(lang, s.k)}</span>
                {s.lock && <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10.5, color: WT.muted }}><RankBadge rank={s.k === "ui.skinSunset" ? "tracker" : "guide"} size={18} />{s.lock}</span>}
              </div>
            ))}
          </Sheet>
        </Screen>
      ),
    },
    {
      caption: gt(lang, "ranks.s4"),
      screen: (
        <Screen>
          <Tabs items={familyTabs(lang)} active={0} />
          <Leaderboard lang={lang} />
        </Screen>
      ),
    },
  ];
}

/** Re-exported for the learn guides that open from the top menu. */
export function MenuOpen({ lang, active, who = "adult" }: { lang: Lang; active: number; who?: "adult" | "kids" | "kid" }) {
  return (
    <Screen>
      <AppBar menuOpen help={who === "adult"} kids={who === "kids" ? gt(lang, "ui.kidsMode") : undefined} kidsOn={who === "kids"} />
      <TopMenu items={menuItems(lang, who)} active={active} />
    </Screen>
  );
}
export { MENU };
