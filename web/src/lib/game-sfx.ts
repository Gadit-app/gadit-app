/**
 * game-sfx: the sound kit for every game (2026-10-31).
 *
 * Built in the style of today's kids' games: bright bell chimes for a right
 * answer, a soft cartoon "bloop" for a wrong one (never a buzzer), a coin with
 * glitter for a star, a harp-and-whoosh for magic moments and a short brass
 * fanfare for a win. Everything is synthesized with Web Audio (no files to
 * download) and goes through a light room reverb so it sounds full, not beepy.
 *
 * Sound is on by default; sfxOn()/setSfxOn() keep the child's choice
 * (localStorage "gadit-sfx"). Every call is safe to make anywhere: on the
 * server, before a tap has unlocked audio, or with sound off, it does nothing.
 */

const KEY = "gadit-sfx";
let ctx: AudioContext | null = null;
let out: GainNode | null = null;
let send: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;

export function sfxOn(): boolean {
  try { return localStorage.getItem(KEY) !== "off"; } catch { return true; }
}
export function setSfxOn(on: boolean): void {
  try { localStorage.setItem(KEY, on ? "on" : "off"); } catch { /* private mode */ }
  try { window.dispatchEvent(new Event("gadit-sfx")); } catch { /* server */ }
}

function audio(): AudioContext | null {
  if (typeof window === "undefined" || !sfxOn()) return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
      // master: a gentle compressor keeps layered sounds from clipping
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14; comp.knee.value = 12; comp.ratio.value = 3.5; comp.attack.value = 0.003; comp.release.value = 0.2;
      out = ctx.createGain(); out.gain.value = 0.9;
      out.connect(comp).connect(ctx.destination);
      // a small room: a short stereo noise tail
      const rev = ctx.createConvolver();
      const len = Math.floor(ctx.sampleRate * 1.4);
      const ir = ctx.createBuffer(2, len, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const d = ir.getChannelData(ch);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.8);
      }
      rev.buffer = ir;
      send = ctx.createGain(); send.gain.value = 0.22;
      send.connect(rev).connect(out);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const nd = noiseBuf.getChannelData(0);
      for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

type Dest = { dry?: number; wet?: number };
function bus(a: AudioContext, d: Dest = {}): GainNode {
  const g = a.createGain();
  const dry = a.createGain(); dry.gain.value = d.dry ?? 1;
  const wet = a.createGain(); wet.gain.value = d.wet ?? 0.6;
  g.connect(dry).connect(out!);
  g.connect(wet).connect(send!);
  return g;
}

/** One oscillator with an attack/decay envelope. */
function tone(a: AudioContext, dst: AudioNode, o: {
  f: number; t: number; dur: number; peak: number; type?: OscillatorType; attack?: number; to?: number; detune?: number; lp?: number;
}) {
  const osc = a.createOscillator();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.f, o.t);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, o.t + o.dur);
  if (o.detune) osc.detune.value = o.detune;
  const g = a.createGain();
  const at = o.attack ?? 0.004;
  g.gain.setValueAtTime(0.0001, o.t);
  g.gain.linearRampToValueAtTime(o.peak, o.t + at);
  g.gain.exponentialRampToValueAtTime(0.0001, o.t + at + o.dur);
  let node: AudioNode = osc;
  if (o.lp) { const f = a.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = o.lp; osc.connect(f); node = f; }
  node.connect(g).connect(dst);
  osc.start(o.t);
  osc.stop(o.t + at + o.dur + 0.05);
}

/** A bell / chime: a few inharmonic partials, the high ones fading first. */
function bell(a: AudioContext, dst: AudioNode, f: number, t: number, peak: number, decay = 0.8) {
  const parts: [number, number, number][] = [[1, 1, 1], [2.01, 0.42, 0.6], [3.0, 0.22, 0.42], [4.16, 0.12, 0.3], [5.43, 0.06, 0.2]];
  for (const [r, g, d] of parts) tone(a, dst, { f: f * r, t, dur: decay * d, peak: peak * g, attack: 0.002 });
}

/** Filtered noise: whooshes, swishes, glitter. */
function noise(a: AudioContext, dst: AudioNode, o: { t: number; dur: number; peak: number; type?: BiquadFilterType; f0: number; f1?: number; q?: number; attack?: number }) {
  const src = a.createBufferSource();
  src.buffer = noiseBuf;
  src.loop = true;
  const f = a.createBiquadFilter();
  f.type = o.type ?? "bandpass";
  f.Q.value = o.q ?? 1.2;
  f.frequency.setValueAtTime(o.f0, o.t);
  if (o.f1) f.frequency.exponentialRampToValueAtTime(o.f1, o.t + o.dur);
  const g = a.createGain();
  const at = o.attack ?? 0.01;
  g.gain.setValueAtTime(0.0001, o.t);
  g.gain.linearRampToValueAtTime(o.peak, o.t + at);
  g.gain.exponentialRampToValueAtTime(0.0001, o.t + o.dur);
  src.connect(f).connect(g).connect(dst);
  src.start(o.t);
  src.stop(o.t + o.dur + 0.05);
}

/** A soft marimba note (wood bar: fundamental + the 4th partial). */
function marimba(a: AudioContext, dst: AudioNode, f: number, t: number, peak: number) {
  tone(a, dst, { f, t, dur: 0.42, peak, attack: 0.002 });
  tone(a, dst, { f: f * 3.99, t, dur: 0.09, peak: peak * 0.28, attack: 0.001 });
  tone(a, dst, { f: f * 0.5, t, dur: 0.18, peak: peak * 0.18, attack: 0.002 });
}

/** A brass-like note (sawtooth, opening filter). */
function brass(a: AudioContext, dst: AudioNode, f: number, t: number, dur: number, peak: number) {
  for (const det of [-6, 6]) {
    const osc = a.createOscillator(); osc.type = "sawtooth"; osc.frequency.value = f; osc.detune.value = det;
    const fl = a.createBiquadFilter(); fl.type = "lowpass"; fl.Q.value = 0.8;
    fl.frequency.setValueAtTime(700, t); fl.frequency.linearRampToValueAtTime(3200, t + 0.05); fl.frequency.exponentialRampToValueAtTime(1400, t + dur);
    const g = a.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + 0.025);
    g.gain.setValueAtTime(peak, t + Math.max(0.03, dur - 0.08)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.12);
    osc.connect(fl).connect(g).connect(dst);
    osc.start(t); osc.stop(t + dur + 0.2);
  }
}

const now = (a: AudioContext) => a.currentTime + 0.01;
// C-major pentatonic from C5: every step sounds good after the one before
const PENTA = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51, 1567.98, 1760, 2093];

export const sfx = {
  /** A light bubble pop: tapping a tile, a card, a button in a game. */
  tap() {
    const a = audio(); if (!a) return; const t = now(a); const d = bus(a, { wet: 0.2 });
    tone(a, d, { f: 480, to: 1150, t, dur: 0.07, peak: 0.5, attack: 0.002 });
    noise(a, d, { t, dur: 0.02, peak: 0.12, type: "highpass", f0: 3500 });
  },

  /** Right answer: a bright two-note chime with a little sparkle. */
  correct() {
    const a = audio(); if (!a) return; const t = now(a); const d = bus(a);
    bell(a, d, 1318.51, t, 0.2, 0.55);
    bell(a, d, 1760, t + 0.085, 0.24, 0.9);
    [2637, 3136, 3520, 4186].forEach((f, i) => bell(a, d, f, t + 0.13 + i * 0.045, 0.035, 0.35));
  },

  /** Wrong answer: a soft cartoon "bloop", friendly, never a buzzer. */
  wrong() {
    const a = audio(); if (!a) return; const t = now(a); const d = bus(a, { wet: 0.3 });
    tone(a, d, { f: 392, to: 330, t, dur: 0.13, peak: 0.16, type: "triangle", lp: 1600 });
    tone(a, d, { f: 311, to: 220, t: t + 0.13, dur: 0.26, peak: 0.16, type: "triangle", lp: 1400 });
    tone(a, d, { f: 155, to: 110, t: t + 0.13, dur: 0.22, peak: 0.08 });
  },

  /** A star / coin found: the classic two-step coin with glitter. */
  star() {
    const a = audio(); if (!a) return; const t = now(a); const d = bus(a, { wet: 0.5 });
    tone(a, d, { f: 987.77, t, dur: 0.06, peak: 0.09, type: "square", lp: 4200 });
    tone(a, d, { f: 1318.51, t: t + 0.07, dur: 0.38, peak: 0.09, type: "square", lp: 4200 });
    bell(a, d, 1318.51, t + 0.07, 0.11, 0.6);
    noise(a, d, { t: t + 0.08, dur: 0.35, peak: 0.035, type: "highpass", f0: 6500 });
  },

  /** One letter placed in a spelling: each next letter a step higher (a combo). */
  letter(step = 0) {
    const a = audio(); if (!a) return; const t = now(a); const d = bus(a, { wet: 0.35 });
    marimba(a, d, PENTA[Math.min(step, PENTA.length - 1)], t, 0.45);
  },

  /** A card flip / page turn: a quick swish. */
  flip() {
    const a = audio(); if (!a) return; const t = now(a); const d = bus(a, { wet: 0.15 });
    noise(a, d, { t, dur: 0.11, peak: 0.38, f0: 1400, f1: 4200, q: 0.9, attack: 0.02 });
    tone(a, d, { f: 900, to: 1300, t: t + 0.07, dur: 0.04, peak: 0.14, attack: 0.002 });
  },

  /** Magic moment (a gate opens, a word is spelled): whoosh + harp + shimmer. */
  magic() {
    const a = audio(); if (!a) return; const t = now(a); const d = bus(a, { wet: 0.8 });
    noise(a, d, { t, dur: 0.7, peak: 0.1, f0: 300, f1: 3200, q: 0.7, attack: 0.25 });
    [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98].forEach((f, i) => {
      tone(a, d, { f, t: t + 0.05 + i * 0.055, dur: 0.55, peak: 0.1, type: "triangle", attack: 0.003 });
      bell(a, d, f * 2, t + 0.05 + i * 0.055, 0.025, 0.4);
    });
    [1046.5, 1318.51, 1567.98].forEach((f) => bell(a, d, f, t + 0.42, 0.07, 1.5));
  },

  /** A win / a finished game: a short brass fanfare with confetti pops. */
  win() {
    const a = audio(); if (!a) return; const t = now(a); const d = bus(a, { wet: 0.55 });
    const seq: [number, number, number][] = [[392, 0, 0.09], [523.25, 0.1, 0.09], [659.25, 0.2, 0.09], [783.99, 0.3, 0.16]];
    for (const [f, dt, dur] of seq) brass(a, d, f, t + dt, dur, 0.07);
    for (const f of [523.25, 659.25, 783.99, 1046.5]) brass(a, d, f, t + 0.5, 0.7, 0.05);
    bell(a, d, 2093, t + 0.5, 0.06, 1.2);
    for (let i = 0; i < 7; i++) {
      const tt = t + 0.5 + i * 0.07 + Math.random() * 0.04;
      tone(a, d, { f: 600 + Math.random() * 500, to: 1400 + Math.random() * 600, t: tt, dur: 0.05, peak: 0.07, attack: 0.002 });
    }
    noise(a, d, { t: t + 0.5, dur: 0.8, peak: 0.03, type: "highpass", f0: 7000 });
  },

  /** Something new opens (a world, an area, a rank): a fast level-up run. */
  unlock() {
    const a = audio(); if (!a) return; const t = now(a); const d = bus(a, { wet: 0.6 });
    PENTA.slice(0, 9).forEach((f, i) => tone(a, d, { f, t: t + i * 0.042, dur: 0.12, peak: 0.07, type: "square", lp: 3800 }));
    [1046.5, 1318.51, 1567.98, 2093].forEach((f) => bell(a, d, f, t + 0.4, 0.06, 1.3));
    noise(a, d, { t: t + 0.05, dur: 0.5, peak: 0.05, f0: 800, f1: 6000, q: 0.6, attack: 0.2 });
  },

  /** A curtain or a scene opening: a soft airy whoosh. */
  whoosh() {
    const a = audio(); if (!a) return; const t = now(a); const d = bus(a, { wet: 0.4 });
    noise(a, d, { t, dur: 0.9, peak: 0.36, type: "lowpass", f0: 250, f1: 2400, q: 0.8, attack: 0.35 });
  },

  /** Last seconds of a timed round: a light tick. */
  tick() {
    const a = audio(); if (!a) return; const t = now(a); const d = bus(a, { wet: 0.1 });
    tone(a, d, { f: 1800, t, dur: 0.03, peak: 0.24, attack: 0.001 });
    noise(a, d, { t, dur: 0.02, peak: 0.1, type: "highpass", f0: 5000 });
  },
};

export type SfxName = keyof typeof sfx;
