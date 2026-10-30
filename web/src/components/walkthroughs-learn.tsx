"use client";

/**
 * walkthroughs-learn — step builders for the "Learning tools" guides: Every
 * Word (read/ReaderClient + ReadingCheck), Say it (say/SayTool), Practice
 * (exercises → SpellClient area="practice"), the word games (play/PlayClient)
 * and Word Duel (play/duel/DuelHub, /duel/[code]).
 */

import type { Lang } from "@/lib/i18n";
import { gt, gtf } from "@/lib/guide-i18n";
import type { WalkStep } from "@/components/Walkthrough";
import { MenuOpen, MENU } from "@/components/walkthroughs-family";
import {
  Screen, AppBar, Sheet, Eyebrow, Chip, PrimaryBtn, GhostBtn, Field, Tile, Note, SpeakerBtn, MicIcon, Toggle, WT,
} from "@/components/walkthrough-ui";

function H({ children, sub, icon }: { children: string; sub?: string; icon?: string }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 19, fontWeight: 800, color: WT.ink, lineHeight: 1.25 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {icon && <img src={`/icons/${icon}.webp`} alt="" width={30} height={30} style={{ objectFit: "contain" }} />}
        {children}
      </div>
      {sub && <div style={{ fontSize: 12, color: WT.muted, marginTop: 3, lineHeight: 1.45 }}>{sub}</div>}
    </div>
  );
}

function IconBtn({ icon, label }: { icon: string; label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: WT.surface, border: `1px solid ${WT.line}`, borderRadius: 11, padding: "7px 9px", fontSize: 12, fontWeight: 600, color: WT.ink }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/icons/${icon}.webp`} alt="" width={22} height={22} style={{ objectFit: "contain" }} />{label}
    </span>
  );
}

// ── Every Word (the reader) ──
export function readerSteps(lang: Lang): WalkStep[] {
  const kw = [gt(lang, "demo.kw1"), gt(lang, "demo.kw2"), gt(lang, "demo.kw3")];
  const passage = gt(lang, "demo.passage");
  /** The passage with the opened words in green and one word tapped. */
  const text = (opened: string[]) => {
    const parts = passage.split(/(\s+)/);
    return parts.map((p, k) => {
      const bare = p.replace(/[.,]/g, "");
      if (opened.some((o) => bare === o || bare.endsWith(o))) {
        return <span key={k} style={{ color: "#0F7B4F", background: "rgba(16,185,129,.14)", borderBottom: "2px solid #10B981", borderRadius: 3 }}>{p}<sup style={{ fontSize: 8 }}>✓</sup></span>;
      }
      return <span key={k}>{p}</span>;
    });
  };
  return [
    {
      caption: gt(lang, "reader.s1"),
      tap: { x: lang === "he" ? "83%" : "36%", y: lang === "he" ? "42%" : "38%" },
      screen: (
        <Screen>
          <AppBar help />
          <H icon="read" sub={gt(lang, "ui.readerSub")}>{gt(lang, "ui.readerTitle")}</H>
          <Field placeholder={gt(lang, "ui.readerPh")} multiline />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <IconBtn icon="photo" label={gt(lang, "ui.photo")} />
            <IconBtn icon="upload" label={gt(lang, "ui.upload")} />
            <IconBtn icon="screen" label={gt(lang, "ui.shareScreen")} />
          </div>
          <div><PrimaryBtn>{gt(lang, "ui.openText")}</PrimaryBtn></div>
        </Screen>
      ),
    },
    {
      caption: gt(lang, "reader.s2"),
      screen: (
        <Screen>
          <Sheet style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: WT.tealDeep }}>✦ {gt(lang, "ui.keyWords")}</div>
            <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: ".06em", color: WT.muted, textTransform: "uppercase" }}>{gt(lang, "ui.worthLearning")}</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {kw.map((w, k) => <Chip key={w}><b>{w}</b> · {gt(lang, `demo.kw${k + 1}m`)}</Chip>)}
            </div>
          </Sheet>
          <Sheet style={{ fontSize: 15, lineHeight: 1.8, color: WT.ink }}>{passage}</Sheet>
        </Screen>
      ),
    },
    {
      caption: gt(lang, "reader.s3"),
      tap: { x: lang === "he" ? "86%" : "20%", y: "20%" },
      screen: (
        <Screen>
          <div style={{ fontSize: 11.5, color: WT.muted }}>{gt(lang, "ui.tapHint")}</div>
          <Sheet style={{ fontSize: 15, lineHeight: 1.9, color: WT.ink }}>{text([kw[0], kw[1]])}</Sheet>
          <Sheet style={{ padding: 12, borderColor: WT.teal, boxShadow: "0 10px 24px rgba(15,23,42,.12)", display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: WT.ink }}>{kw[1]}</span>
              <SpeakerBtn size={24} />
              <span style={{ marginInlineStart: "auto", color: WT.muted }}>✕</span>
            </div>
            <div style={{ fontSize: 13.5, color: WT.soft, lineHeight: 1.5 }}>{gt(lang, "demo.kw2m")}</div>
            <div><PrimaryBtn>{gt(lang, "ui.openFull")}</PrimaryBtn></div>
          </Sheet>
        </Screen>
      ),
    },
    {
      caption: gt(lang, "reader.s4"),
      screen: (
        <Screen>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, color: WT.tealDeep }}>
            <span>{gt(lang, "ui.checkWords")}</span><span>{gtf(lang, "ui.aOfB", { a: 1, b: 3 })}</span>
          </div>
          <div style={{ height: 4, borderRadius: 999, background: WT.line }}><div style={{ width: "33%", height: "100%", borderRadius: 999, background: WT.teal }} /></div>
          <div style={{ background: WT.paper, borderRadius: 10, padding: "10px 12px", fontSize: 13.5, lineHeight: 1.6, color: WT.ink }}>{passage}</div>
          <div style={{ fontSize: 14.5, fontWeight: 800, color: WT.ink }}>{gtf(lang, "ui.whatMeans", { w: kw[1] })}</div>
          {[gt(lang, "demo.quizWrong2"), gt(lang, "demo.kw2m"), gt(lang, "demo.quizWrong")].map((o, k) => (
            <div key={k} style={{ border: `${k === 1 ? 2 : 1}px solid ${k === 1 ? "#10B981" : WT.line}`, background: k === 1 ? "rgba(16,185,129,.08)" : WT.surface, borderRadius: 10, padding: "9px 12px", fontSize: 13, color: WT.ink }}>• {o}{k === 1 ? " ✓" : ""}</div>
          ))}
          <Note color="#0F7B4F" bg="rgba(16,185,129,.1)">{gt(lang, "ui.correct")}</Note>
        </Screen>
      ),
    },
  ];
}

// ── Say it ──
export function saySteps(lang: Lang): WalkStep[] {
  const select = (label: string, value: string) => (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: WT.soft, marginBottom: 4 }}>{label}</div>
      <div style={{ background: WT.surface, border: `1px solid ${WT.line}`, borderRadius: 10, padding: "8px 10px", fontSize: 13, color: WT.ink, display: "flex", justifyContent: "space-between" }}>{value}<span style={{ color: WT.muted }}>▾</span></div>
    </div>
  );
  const top = (
    <>
      <H icon="say" sub={gt(lang, "ui.saySub")}>{gt(lang, "ui.nav.say")}</H>
      <div style={{ display: "flex", gap: 8 }}>
        {select(gt(lang, "ui.typeIn"), gt(lang, "demo.sayFrom"))}
        {select(gt(lang, "ui.sayIn"), gt(lang, "demo.sayTo"))}
      </div>
    </>
  );
  const result = (practice?: boolean, score?: boolean) => (
    <Sheet style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: ".06em", color: WT.tealDeep, textTransform: "uppercase" }}>{gt(lang, "ui.howToSay")} · {gt(lang, "demo.sayTo")}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span dir="ltr" style={{ fontSize: 17, fontWeight: 800, color: WT.ink }}>{gt(lang, "demo.sayResult")}</span>
        <SpeakerBtn active={!practice} />
      </div>
      {practice && (
        <>
          <div style={{ fontSize: 13, fontWeight: 800, color: WT.ink }}>{gt(lang, "ui.nowYouTry")}</div>
          <div style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: 6, background: WT.teal, color: "#fff", borderRadius: 999, padding: "9px 14px", fontSize: 13.5, fontWeight: 700 }}><MicIcon color="#fff" />{gt(lang, "ui.practiceSay")}</div>
        </>
      )}
      {score && (
        <>
          <div style={{ fontSize: 20, letterSpacing: 2 }}><span style={{ color: "#F5B301" }}>★★★★★</span></div>
          <Note color="#0F7B4F" bg="rgba(16,185,129,.1)">{gt(lang, "ui.spotOn")}</Note>
        </>
      )}
    </Sheet>
  );
  return [
    {
      caption: gt(lang, "say.s1"),
      tap: { x: lang === "he" ? "79%" : "21%", y: "42%" },
      screen: (
        <Screen>
          {top}
          <Field text={gt(lang, "demo.saySentence")} mic multiline focused />
          <div><PrimaryBtn>{gt(lang, "ui.nav.say")}</PrimaryBtn></div>
        </Screen>
      ),
    },
    {
      caption: gt(lang, "say.s2"),
      screen: (
        <Screen>
          {top}
          <Field text={gt(lang, "demo.saySentence")} mic />
          {result()}
        </Screen>
      ),
    },
    {
      caption: gt(lang, "say.s3"),
      tap: { x: lang === "he" ? "72%" : "28%", y: "32%" },
      screen: (
        <Screen>
          <Field text={gt(lang, "demo.saySentence")} mic />
          {result(true)}
        </Screen>
      ),
    },
    {
      caption: gt(lang, "say.s4"),
      screen: (
        <Screen>
          <Field text={gt(lang, "demo.saySentence")} mic />
          {result(true, true)}
        </Screen>
      ),
    },
  ];
}

// ── Practice (grown-ups) ──
export function practiceSteps(lang: Lang): WalkStep[] {
  return [
    {
      caption: gt(lang, "practice.s1"),
      tap: { x: lang === "he" ? "34%" : "66%", y: "28%" },
      screen: <MenuOpen lang={lang} active={MENU.practice} />,
    },
    {
      caption: gt(lang, "practice.s2"),
      screen: (
        <Screen>
          <AppBar help />
          <H icon="test" sub={gt(lang, "ui.practiceSub")}>{gt(lang, "ui.nav.practice")}</H>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <Tile img="/play/hw-read.webp" title={gt(lang, "ui.prRead")} />
            <Tile img="/play/hw-test.webp" title={gt(lang, "ui.hwTest")} />
            <Tile img="/play/hw-dict.webp" title={gt(lang, "ui.prDict")} />
            <Tile img="/play/hw-lessons.webp" title={gt(lang, "ui.prLang")} />
          </div>
        </Screen>
      ),
    },
    {
      caption: gt(lang, "practice.s3"),
      tap: { x: lang === "he" ? "80%" : "20%", y: "34%" },
      screen: (
        <Screen>
          <H>{gt(lang, "ui.hwTest")}</H>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: WT.ink }}>📝 {gt(lang, "ui.pasteList")}</div>
          <div style={{ fontSize: 12, color: WT.muted }}>{gt(lang, "ui.pasteListSub")}</div>
          <Field text={gt(lang, "demo.testList")} multiline focused />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <PrimaryBtn>{gt(lang, "ui.createSet")}</PrimaryBtn>
            <GhostBtn>📷 {gt(lang, "ui.photoList")}</GhostBtn>
          </div>
        </Screen>
      ),
    },
    {
      caption: gt(lang, "practice.s4"),
      screen: (
        <Screen>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, color: WT.muted }}><span dir="ltr">3 / 10</span></div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}><SpeakerBtn size={64} active /></div>
          <div style={{ textAlign: "center", fontSize: 13, color: WT.soft }}>{gt(lang, "ui.writeIn")}</div>
          <Field text={gt(lang, "demo.dictWord")} focused />
          <Note color="#0F7B4F" bg="rgba(16,185,129,.1)">{gt(lang, "ui.dictCorrect")}</Note>
          <div><PrimaryBtn>{gt(lang, "ui.next")}</PrimaryBtn></div>
        </Screen>
      ),
    },
  ];
}

// ── Word games ──
export function gamesSteps(lang: Lang): WalkStep[] {
  return [
    {
      caption: gt(lang, "games.s1"),
      tap: { x: lang === "he" ? "34%" : "66%", y: "47%" },
      screen: <MenuOpen lang={lang} active={MENU.play} />,
    },
    {
      caption: gt(lang, "games.s2"),
      screen: (
        <Screen>
          <H icon="play">{gt(lang, "ui.wordGames")}</H>
          <Eyebrow>{gt(lang, "ui.fromNotebook")}</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <Tile img="/play/flashcards.webp" title={gt(lang, "ui.gWordCards")} />
            <Tile img="/play/truefalse.webp" title={gt(lang, "ui.gTrueFalse")} />
            <Tile img="/play/quiz.webp" title={gt(lang, "ui.gQuiz")} />
            <Tile img="/play/memory.webp" title={gt(lang, "ui.gMemory")} />
          </div>
        </Screen>
      ),
    },
    {
      caption: gt(lang, "games.s3"),
      screen: (
        <Screen>
          <Eyebrow>{gt(lang, "ui.secOrigin")}</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <Tile img="/play/time.webp" title={gt(lang, "ui.gTime")} />
            <Tile img="/play/passport.webp" title={gt(lang, "ui.gPassport")} />
          </div>
          <Eyebrow>{gt(lang, "ui.secPrecision")}</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <Tile img="/play/twin.webp" title={gt(lang, "ui.gTwin")} />
            <Tile img="/play/shade.webp" title={gt(lang, "ui.gShade")} />
          </div>
        </Screen>
      ),
    },
    {
      caption: gt(lang, "games.s4"),
      screen: (
        <Screen>
          <Sheet style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <div style={{ fontSize: 40 }}>🎉</div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/ranks/explorer.webp" alt="" width={64} height={64} style={{ objectFit: "contain" }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: "#8B5CF6" }}>{gt(lang, "ui.newSkin")}</div>
            <div style={{ fontSize: 12, color: WT.muted, textAlign: "center", lineHeight: 1.5, padding: "0 8px" }}>{gt(lang, "ui.pointsRule")}</div>
          </Sheet>
        </Screen>
      ),
    },
  ];
}

// ── Word Duel ──
export function duelSteps(lang: Lang): WalkStep[] {
  const mode = (icon: string, t: string, s: string, hl?: boolean) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, background: WT.surface, border: `${hl ? 2 : 1}px solid ${hl ? WT.teal : WT.line}`, borderRadius: 13, padding: "8px 10px" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/icons/${icon}.webp`} alt="" width={34} height={34} style={{ objectFit: "contain", flex: "none" }} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: WT.ink }}>{gt(lang, t)}</div>
        <div style={{ fontSize: 10.5, color: WT.muted, lineHeight: 1.35 }}>{gt(lang, s)}</div>
      </div>
    </div>
  );
  const steps: WalkStep[] = [
    {
      caption: gt(lang, "duel.s1"),
      tap: { x: "50%", y: "22%" },
      screen: (
        <Screen>
          <H icon="play">{gt(lang, "ui.wordGames")}</H>
          <Eyebrow>{gt(lang, "ui.fromNotebook")}</Eyebrow>
          <Tile img="/play/duel-mascot.webp" title={gt(lang, "ui.duelCard")} sub={gt(lang, "ui.duelCardSub")} highlight />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <Tile img="/play/flashcards.webp" title={gt(lang, "ui.gWordCards")} />
            <Tile img="/play/quiz.webp" title={gt(lang, "ui.gQuiz")} />
          </div>
        </Screen>
      ),
    },
    {
      caption: gt(lang, "duel.s2"),
      screen: (
        <Screen>
          <H icon="duel" sub={gt(lang, "ui.duelSub")}>{gt(lang, "ui.duelTitle")}</H>
          {mode("same-device", "ui.dSame", "ui.dSameSub")}
          {mode("invite", "ui.dInvite", "ui.dInviteSub", true)}
          {mode("code", "ui.dCode", "ui.dCodeSub")}
          {lang === "he" && mode("online", "ui.dOnline", "ui.dOnlineSub")}
          {mode("bot", "ui.dBot", "ui.dBotSub")}
        </Screen>
      ),
    },
  ];
  // "Someone online now" shows only in the Hebrew UI (DuelHub), so only the
  // Hebrew guide explains the parent's OK for it.
  if (lang === "he") {
    steps.push({
      caption: gt(lang, "duel.s3"),
      tap: { x: "16%", y: "16%" },
      screen: (
        <Screen>
          <div style={{ display: "flex", gap: 4, background: WT.surface, border: `1px solid ${WT.line}`, borderRadius: 12, padding: 4 }}>
            {[gt(lang, "ui.tabHome"), gt(lang, "ui.tabFamily"), gt(lang, "ui.settings")].map((t, k) => (
              <span key={t} style={{ flex: 1, textAlign: "center", padding: "7px 4px", borderRadius: 9, fontSize: 13, fontWeight: k === 2 ? 700 : 500, color: k === 2 ? "#fff" : WT.soft, background: k === 2 ? WT.teal : "transparent" }}>{t}</span>
            ))}
          </div>
          <Toggle on label={`⚔️ ${gt(lang, "ui.duelKids")}`} />
          <div style={{ fontSize: 12, color: WT.muted, lineHeight: 1.5 }}>{gt(lang, "ui.duelKidsSub")}</div>
        </Screen>
      ),
    });
  }
  steps.push({
    caption: gt(lang, "duel.s4"),
    screen: (
      <Screen>
        <Sheet style={{ padding: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ fontSize: 34 }}>🏆</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: WT.ink }}>{gt(lang, "ui.youWon")}</div>
          <div style={{ fontSize: 12.5, color: WT.muted }}>{gtf(lang, "ui.rightOf", { n: 4, t: 5 })}</div>
        </Sheet>
        <Sheet style={{ padding: 12 }}>
          <div style={{ fontSize: 13.5, fontWeight: 800, color: WT.ink, marginBottom: 6 }}>{gt(lang, "ui.winsTable")}</div>
          {[{ m: "🥇", n: gt(lang, "demo.child1"), w: 6, g: 9 }, { m: "🥈", n: gt(lang, "demo.parent"), w: 3, g: 9 }].map((r) => (
            <div key={r.n} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", fontSize: 13, color: WT.ink }}>
              <span>{r.m}</span><span style={{ flex: 1, fontWeight: 700 }}>{r.n}</span>
              <span style={{ fontSize: 11.5, color: WT.muted }}>{gtf(lang, "ui.winsGames", { w: r.w, g: r.g })}</span>
            </div>
          ))}
        </Sheet>
        <div style={{ display: "flex", justifyContent: "center" }}><PrimaryBtn>{gt(lang, "ui.playAgain")}</PrimaryBtn></div>
      </Screen>
    ),
  });
  return steps;
}
