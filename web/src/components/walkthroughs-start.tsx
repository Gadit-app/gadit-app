"use client";

/**
 * walkthroughs-start — step builders for the "Getting started" guides: the
 * word search, listening, niqqud, the self-filling notebook, the sentence
 * field, more on every word, word questions and Kids Mode. Each returns
 * WalkStep[] for a language, recreating today's real screens (HomeClient,
 * WordClient + design/result.tsx, MeaningPractice, WordQuestions, the top bar
 * and menu in WbShellChrome / ToolPage) with the shared walkthrough-ui pieces.
 */

import type { Lang } from "@/lib/i18n";
import { gt, gtf } from "@/lib/guide-i18n";
import type { WalkStep } from "@/components/Walkthrough";
import {
  Screen, AppBar, TopMenu, SearchPill, SentenceBox, WordHead, MeaningCard, SectionHead, TextLink,
  GadItBtn, Note, Field, Chip, Sheet, PrimaryBtn, WT,
} from "@/components/walkthrough-ui";

/** The real menu items, in the real order (WbShellChrome useNavLinks):
 *  a grown-up on Family sees Practice, a child (or Kids Mode) sees Homework. */
export function menuItems(lang: Lang, who: "adult" | "kids" | "kid" = "adult"): string[] {
  return [
    gt(lang, "ui.nav.search"),
    gt(lang, who === "kid" ? "ui.nav.myWords" : "ui.nav.notebook"),
    gt(lang, who === "adult" ? "ui.nav.practice" : "ui.nav.homework"),
    gt(lang, "ui.nav.reader"),
    gt(lang, "ui.nav.say"),
    gt(lang, "ui.nav.games"),
  ];
}

/** Indexes into menuItems(). */
export const MENU = { search: 0, notebook: 1, practice: 2, homework: 2, reader: 3, say: 4, play: 5 } as const;

function Logo() {
  return (
    <div style={{ textAlign: "center", marginTop: 18 }}>
      <div dir="ltr" style={{ fontSize: 34, fontWeight: 800, color: WT.ink, letterSpacing: "-0.02em" }}>Gad<span style={{ color: WT.teal }}>it</span></div>
    </div>
  );
}

/** The home screen: logo, tagline, search pill with mic, sentence box. */
function HomeScreen({ lang, word, sentence, focusWord, focusSentence, micOn }: { lang: Lang; word?: string; sentence?: string; focusWord?: boolean; focusSentence?: boolean; micOn?: boolean }) {
  return (
    <Screen>
      <AppBar />
      <Logo />
      <div style={{ textAlign: "center", fontSize: 13, color: WT.muted, marginTop: -6 }}>{gt(lang, "ui.tagline")}</div>
      <SearchPill text={word} placeholder={gt(lang, "ui.searchPlaceholder")} focused={focusWord} micOn={micOn} />
      <SentenceBox text={sentence} placeholder={gt(lang, "ui.sentencePh")} focused={focusSentence} tall />
    </Screen>
  );
}

function NotebookTitle({ lang }: { lang: Lang }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 19, fontWeight: 800, color: WT.ink }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icons/notebook.webp" alt="" width={30} height={30} style={{ objectFit: "contain" }} />
      {gt(lang, "ui.myNotebook")}
    </div>
  );
}

function tabs(lang: Lang) {
  return [gt(lang, "ui.tabImage"), gt(lang, "ui.tabKids"), gt(lang, "ui.tabQuiz"), gt(lang, "ui.tabGames")];
}

function ScrollIcon() {
  return <span style={{ fontSize: 15 }}>📜</span>;
}

function OriginBlock({ lang }: { lang: Lang }) {
  const row = (k: string, v: string) => (
    <div style={{ display: "flex", gap: 8, fontSize: 12.5, lineHeight: 1.5 }}>
      <span style={{ color: WT.muted, minWidth: 74 }}>{gt(lang, k)}</span>
      <span style={{ color: WT.ink, fontWeight: 600 }}>{v}</span>
    </div>
  );
  return (
    <Sheet style={{ padding: 12, display: "flex", flexDirection: "column", gap: 4 }}>
      <SectionHead icon={<ScrollIcon />}>{gt(lang, "ui.origin")}</SectionHead>
      {row("ui.originLang", gt(lang, "demo.originLang"))}
      {row("ui.originWord", gt(lang, "demo.originWord"))}
      {row("ui.originMeant", gt(lang, "demo.originMeant"))}
    </Sheet>
  );
}

function QuestionsBlock({ lang, open }: { lang: Lang; open?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <SectionHead icon={<span style={{ width: 18, height: 18, borderRadius: "50%", border: `1.6px solid ${WT.tealDeep}`, color: WT.tealDeep, display: "grid", placeItems: "center", fontSize: 11, fontWeight: 800 }}>?</span>}>{gt(lang, "ui.wqTitle")}</SectionHead>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <Chip>{gt(lang, "ui.oppos")}</Chip>
        <Chip>{gt(lang, "ui.similar")}</Chip>
        <Chip active={open}>{gt(lang, "ui.wordFamily")}</Chip>
        <Chip>{gt(lang, "ui.mistakes")}</Chip>
        <Chip>{gt(lang, "ui.remember")}</Chip>
      </div>
    </div>
  );
}

// ── search ──
export function searchSteps(lang: Lang): WalkStep[] {
  const word = gt(lang, "demo.word");
  return [
    {
      caption: gt(lang, "search.s1"),
      tap: { x: "50%", y: "33%" },
      screen: <HomeScreen lang={lang} word={word} focusWord />,
    },
    {
      caption: gt(lang, "search.s2"),
      screen: (
        <Screen>
          <SearchPill text={word} />
          <WordHead word={word} pos={gt(lang, "demo.pos")} />
          <SectionHead>{gt(lang, "ui.definitions")} (2)</SectionHead>
          <MeaningCard n={1} pos={gt(lang, "demo.pos")} meaning={gt(lang, "demo.meaning")} examples={[gt(lang, "demo.example")]} />
          <MeaningCard n={2} pos={gt(lang, "demo.pos")} meaning={gt(lang, "demo.meaning2")} examples={[gt(lang, "demo.example2")]} />
        </Screen>
      ),
    },
    {
      caption: gt(lang, "search.s3"),
      tap: { x: lang === "he" ? "83%" : "17%", y: "35%" },
      screen: (
        <Screen>
          <WordHead word={word} pos={gt(lang, "demo.pos")} />
          <MeaningCard n={1} pos={gt(lang, "demo.pos")} meaning={gt(lang, "demo.meaning")} examples={[gt(lang, "demo.example")]} tabs={tabs(lang)} activeTab={0} image />
        </Screen>
      ),
    },
    {
      caption: gt(lang, "search.s4"),
      screen: (
        <Screen>
          <OriginBlock lang={lang} />
          <GadItBtn label={gt(lang, "ui.gadIt")} hint={gt(lang, "ui.gadHint")} />
          <QuestionsBlock lang={lang} />
        </Screen>
      ),
    },
  ];
}

// ── listen ──
export function listenSteps(lang: Lang): WalkStep[] {
  const word = gt(lang, "demo.word");
  return [
    {
      caption: gt(lang, "listen.s1"),
      tap: { x: lang === "he" ? "72%" : "44%", y: "18%" },
      screen: (
        <Screen>
          <SearchPill text={word} />
          <WordHead word={word} pos={gt(lang, "demo.pos")} />
          <MeaningCard n={1} pos={gt(lang, "demo.pos")} meaning={gt(lang, "demo.meaning")} examples={[gt(lang, "demo.example")]} />
        </Screen>
      ),
    },
    {
      caption: gt(lang, "listen.s2"),
      screen: (
        <Screen>
          <SearchPill text={word} />
          <WordHead word={word} pos={gt(lang, "demo.pos")} speaking />
          <div style={{ display: "flex", gap: 4, justifyContent: "center", alignItems: "center", height: 40 }}>{[10, 18, 26, 18, 10].map((h, k) => (<span key={k} style={{ width: 4, height: h, borderRadius: 2, background: WT.teal }} />))}</div>
          <MeaningCard n={1} pos={gt(lang, "demo.pos")} meaning={gt(lang, "demo.meaning")} examples={[gt(lang, "demo.example")]} />
        </Screen>
      ),
    },
  ];
}

// ── niqqud ── (Hebrew content on purpose: the button exists only on a Hebrew
// or Arabic word, so every language's guide shows a Hebrew word.)
export function niqqudSteps(lang: Lang): WalkStep[] {
  const he = "סקרן";
  const heNiqqud = "סַקְרָן";
  const meaning = gt(lang, "demo.meaning");
  return [
    {
      caption: gt(lang, "niqqud.s1"),
      tap: { x: lang === "he" ? "58%" : "47%", y: "15%" },
      screen: (
        <Screen>
          <SearchPill text={he} />
          <WordHead word={he} niqqud={gt(lang, "ui.niqqud")} />
          <MeaningCard n={1} meaning={meaning} />
        </Screen>
      ),
    },
    {
      caption: gt(lang, "niqqud.s2"),
      screen: (
        <Screen>
          <SearchPill text={he} />
          <WordHead word={heNiqqud} niqqud={gt(lang, "ui.niqqud")} niqqudOn />
          <MeaningCard n={1} meaning={meaning} />
        </Screen>
      ),
    },
  ];
}

// ── save → the notebook fills itself ──
export function saveSteps(lang: Lang): WalkStep[] {
  const word = gt(lang, "demo.word");
  const nbWords = [word, gt(lang, "demo.word2"), gt(lang, "demo.word3")];
  const nbMeanings = ["demo.meaning", "demo.word2m", "demo.word3m"];
  return [
    {
      caption: gt(lang, "save.s1"),
      screen: (
        <Screen>
          <SearchPill text={word} />
          <WordHead word={word} pos={gt(lang, "demo.pos")} />
          <Note><span aria-hidden="true">✓</span><span>{gt(lang, "ui.savedNote")}</span></Note>
          <MeaningCard n={1} pos={gt(lang, "demo.pos")} meaning={gt(lang, "demo.meaning")} examples={[gt(lang, "demo.example")]} />
        </Screen>
      ),
    },
    {
      caption: gt(lang, "save.s2"),
      tap: { x: lang === "he" ? "34%" : "66%", y: "21%" },
      screen: (
        <Screen>
          <AppBar menuOpen />
          <TopMenu items={menuItems(lang)} active={MENU.notebook} />
        </Screen>
      ),
    },
    {
      caption: gt(lang, "save.s3"),
      screen: (
        <Screen>
          <AppBar />
          <NotebookTitle lang={lang} />
          {nbWords.map((w, k) => (
            <Sheet key={w} style={{ padding: "10px 12px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontSize: 15.5, fontWeight: 800, color: WT.tealDeep }}>{w}</span>
                <span style={{ fontSize: 11, color: "#0F7B4F", fontWeight: 700 }}>{gt(lang, "ui.offline")}</span>
              </div>
              <div style={{ fontSize: 12.5, color: WT.soft, lineHeight: 1.45, marginTop: 2 }}>{gt(lang, nbMeanings[k])}</div>
            </Sheet>
          ))}
        </Screen>
      ),
    },
    {
      caption: gt(lang, "save.s4"),
      screen: (
        <Screen>
          <AppBar />
          <NotebookTitle lang={lang} />
          <Note color={WT.soft} bg={WT.surface}>{gtf(lang, "ui.freeCount", { n: 3 })}</Note>
          {nbWords.map((w) => (
            <Sheet key={w} style={{ padding: "11px 14px" }}>
              <span style={{ fontSize: 15.5, fontWeight: 700, color: WT.ink }}>{w}</span>
            </Sheet>
          ))}
        </Screen>
      ),
    },
  ];
}

// ── the sentence field (context) ──
export function contextSteps(lang: Lang): WalkStep[] {
  const w = gt(lang, "demo.contextWord");
  return [
    {
      caption: gt(lang, "context.s1"),
      tap: { x: "50%", y: "44%" },
      screen: <HomeScreen lang={lang} word={w} sentence={gt(lang, "demo.contextSentence")} focusSentence />,
    },
    {
      caption: gt(lang, "context.s2"),
      screen: (
        <Screen>
          <SearchPill text={w} />
          <WordHead word={w} pos={gt(lang, "demo.contextPos")} />
          <SectionHead>{gt(lang, "ui.definitions")}</SectionHead>
          <MeaningCard n={1} pos={gt(lang, "demo.contextPos")} meaning={gt(lang, "demo.contextMeaning")} examples={[gt(lang, "demo.contextSentence")]} />
        </Screen>
      ),
    },
    {
      caption: gt(lang, "context.s3"),
      tap: { x: "50%", y: "17%" },
      screen: (
        <Screen>
          <SearchPill placeholder={gt(lang, "ui.searchPlaceholder")} />
          <SentenceBox placeholder={gt(lang, "ui.sentencePh")} focused />
          <WordHead word={gt(lang, "demo.word")} pos={gt(lang, "demo.pos")} />
          <MeaningCard n={1} pos={gt(lang, "demo.pos")} meaning={gt(lang, "demo.meaning")} />
        </Screen>
      ),
    },
  ];
}

// ── more on every word (MeaningPractice + Gad it!) ──
export function wordPageSteps(lang: Lang): WalkStep[] {
  const word = gt(lang, "demo.word");
  const links = (
    <>
      <TextLink>{gt(lang, "ui.moreExamples")}</TextLink>
      <TextLink>✎ {gt(lang, "ui.compose")}</TextLink>
    </>
  );
  return [
    {
      caption: gt(lang, "wordpage.s1"),
      tap: { x: "50%", y: "37%" },
      screen: (
        <Screen>
          <WordHead word={word} pos={gt(lang, "demo.pos")} />
          <MeaningCard n={1} pos={gt(lang, "demo.pos")} meaning={gt(lang, "demo.meaning")} examples={[gt(lang, "demo.example")]} links={links} tabs={tabs(lang)} />
        </Screen>
      ),
    },
    {
      caption: gt(lang, "wordpage.s2"),
      screen: (
        <Screen>
          <MeaningCard n={1} pos={gt(lang, "demo.pos")} meaning={gt(lang, "demo.meaning")} examples={[gt(lang, "demo.example")]}>
            <div style={{ marginTop: 10, border: `1px solid ${WT.line}`, borderRadius: 12, padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
              <Field text={gt(lang, "demo.mySentence")} mic focused multiline />
              <div><PrimaryBtn>{gt(lang, "ui.checkSentence")}</PrimaryBtn></div>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#0F9E6E", color: "#fff", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 800, flex: "none" }}>✓</span>
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: ".06em", color: "#0F9E6E", textTransform: "uppercase" }}>{gt(lang, "ui.perfect")}</div>
                  <div style={{ fontSize: 12.5, color: WT.ink, lineHeight: 1.45 }}>{gt(lang, "demo.feedbackMsg")}</div>
                </div>
              </div>
            </div>
          </MeaningCard>
        </Screen>
      ),
    },
    {
      caption: gt(lang, "wordpage.s3"),
      tap: { x: lang === "he" ? "64%" : "44%", y: "40%" },
      screen: (
        <Screen>
          <WordHead word={word} pos={gt(lang, "demo.pos")} />
          <MeaningCard n={1} pos={gt(lang, "demo.pos")} meaning={gt(lang, "demo.meaning")}
            examples={[gt(lang, "demo.example"), gt(lang, "demo.moreEx1"), gt(lang, "demo.moreEx2")]} links={links} />
        </Screen>
      ),
    },
    {
      caption: gt(lang, "wordpage.s4"),
      screen: (
        <Screen>
          <OriginBlock lang={lang} />
          <GadItBtn label={gt(lang, "ui.gadDone")} hint={gt(lang, "ui.gadDoneSub")} done />
        </Screen>
      ),
    },
  ];
}

// ── word questions ──
export function extrasSteps(lang: Lang): WalkStep[] {
  return [
    {
      caption: gt(lang, "extras.s1"),
      tap: { x: lang === "he" ? "76%" : "22%", y: "57%" },
      screen: (
        <Screen>
          <OriginBlock lang={lang} />
          <GadItBtn label={gt(lang, "ui.gadIt")} hint={gt(lang, "ui.gadHint")} />
          <QuestionsBlock lang={lang} />
        </Screen>
      ),
    },
    {
      caption: gt(lang, "extras.s2"),
      screen: (
        <Screen>
          <QuestionsBlock lang={lang} open />
          <Sheet style={{ padding: 12 }}>
            <div style={{ fontSize: 12, color: WT.muted, marginBottom: 4 }}>{gt(lang, "ui.wordFamily")}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: WT.ink, lineHeight: 1.5 }}>{gt(lang, "demo.familyAnswer")}</div>
          </Sheet>
        </Screen>
      ),
    },
  ];
}

// ── Kids Mode ──
export function kidsSteps(lang: Lang): WalkStep[] {
  const word = gt(lang, "demo.word");
  const kids = gt(lang, "ui.kidsMode");
  return [
    {
      caption: gt(lang, "kids.s1"),
      tap: { x: lang === "he" ? "62%" : "40%", y: "6%" },
      screen: (
        <Screen>
          <AppBar kids={kids} />
          <SearchPill text={word} />
          <WordHead word={word} pos={gt(lang, "demo.pos")} />
          <MeaningCard n={1} pos={gt(lang, "demo.pos")} meaning={gt(lang, "demo.meaning")} examples={[gt(lang, "demo.example")]} />
        </Screen>
      ),
    },
    {
      caption: gt(lang, "kids.s2"),
      screen: (
        <Screen>
          <AppBar kids={kids} kidsOn />
          <SearchPill text={word} />
          <WordHead word={word} />
          <MeaningCard n={1} meaning={gt(lang, "demo.kidsMeaning")} examples={[gt(lang, "demo.example")]} />
        </Screen>
      ),
    },
    {
      caption: gt(lang, "kids.s3"),
      screen: (
        <Screen>
          <AppBar kids={kids} kidsOn menuOpen />
          <TopMenu items={menuItems(lang, "kids")} active={MENU.homework} />
        </Screen>
      ),
    },
    {
      caption: gt(lang, "kids.s4"),
      tap: { x: lang === "he" ? "64%" : "34%", y: "25%" },
      screen: (
        <Screen>
          <div style={{ textAlign: "center", fontSize: 20, fontWeight: 800, color: WT.ink, marginTop: 40 }}>{gt(lang, "ui.whoUsing")}</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 18, marginTop: 16, flexWrap: "wrap" }}>
            {[{ n: gt(lang, "demo.child1"), c: "#EC4899" }, { n: gt(lang, "demo.child2"), c: "#F59E0B" }].map((m) => (
              <div key={m.n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <span style={{ width: 76, height: 76, borderRadius: "50%", background: m.c, color: "#fff", display: "grid", placeItems: "center", fontSize: 30, fontWeight: 800 }}>{m.n.slice(0, 1)}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: WT.ink }}>{m.n}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "auto", textAlign: "center", fontSize: 12.5, color: WT.muted, textDecoration: "underline" }}>{gt(lang, "ui.exitShared")}</div>
        </Screen>
      ),
    },
  ];
}
