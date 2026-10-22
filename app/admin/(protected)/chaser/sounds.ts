// Synthesized game-show effects for the Chaser game (Web Audio, no files).
// The AudioContext is created lazily on the first sound, which always follows
// a click or key press, so autoplay policies allow it.
import { BEEP_SECONDS, DANGER_SECONDS, type GameEventKind, type Phase, type Side } from "@/lib/chaser";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuffer: AudioBuffer | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
      // Light compression keeps stacked layers loud without clipping.
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.ratio.value = 4;
      master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(comp).connect(ctx.destination);
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(
  freq: number,
  at: number,
  duration: number,
  { type = "sine", volume = 0.2, to }: { type?: OscillatorType; volume?: number; to?: number } = {},
) {
  const ac = audio();
  if (!ac || !master) return;
  const start = ac.currentTime + at;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, start + duration);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(master);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

/** Filtered white noise: impacts, whooshes, cymbal-ish shimmer. */
function noise(
  at: number,
  duration: number,
  {
    volume = 0.3,
    filter = "lowpass",
    freq = 800,
    to,
  }: { volume?: number; filter?: BiquadFilterType; freq?: number; to?: number } = {},
) {
  const ac = audio();
  if (!ac || !master) return;
  if (!noiseBuffer) {
    noiseBuffer = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  const start = ac.currentTime + at;
  const src = ac.createBufferSource();
  src.buffer = noiseBuffer;
  src.loop = true;
  const biquad = ac.createBiquadFilter();
  biquad.type = filter;
  biquad.frequency.setValueAtTime(freq, start);
  if (to) biquad.frequency.exponentialRampToValueAtTime(to, start + duration);
  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  src.connect(biquad).connect(gain).connect(master);
  src.start(start);
  src.stop(start + duration + 0.05);
}

const chord = (freqs: number[], at: number, duration: number, type: OscillatorType, volume: number) =>
  freqs.forEach((f) => tone(f, at, duration, { type, volume }));

export const sfx = {
  /** Wake the audio context from a user gesture. */
  unlock: () => void audio(),
  impact(at = 0, volume = 0.5) {
    tone(140, at, 0.5, { type: "sine", volume, to: 38 });
    noise(at, 0.35, { volume: volume * 0.7, filter: "lowpass", freq: 1800, to: 120 });
  },
  whoosh(at = 0) {
    noise(at, 0.45, { volume: 0.25, filter: "bandpass", freq: 300, to: 4000 });
  },
  sparkle(at = 0) {
    [2093, 2637, 3136, 4186].forEach((f, i) => tone(f, at + i * 0.045, 0.18, { type: "sine", volume: 0.06 }));
  },
  correct() {
    tone(784, 0, 0.12, { type: "triangle", volume: 0.25 });
    tone(1047, 0.08, 0.14, { type: "triangle", volume: 0.25 });
    tone(1568, 0.16, 0.3, { type: "triangle", volume: 0.22 });
    sfx.sparkle(0.12);
  },
  /** Chaser scores: ominous low stab. */
  chaserStep() {
    sfx.impact(0, 0.45);
    chord([98, 147, 196], 0, 0.45, "sawtooth", 0.07);
    tone(392, 0.05, 0.25, { type: "square", volume: 0.06, to: 330 });
  },
  wrong() {
    tone(180, 0, 0.45, { type: "sawtooth", volume: 0.14, to: 100 });
    tone(186, 0, 0.45, { type: "square", volume: 0.08, to: 104 });
  },
  skip() {
    sfx.whoosh();
  },
  pushback() {
    sfx.impact(0, 0.6);
    for (let i = 0; i < 3; i++) {
      tone(660, 0.1 + i * 0.3, 0.15, { type: "square", volume: 0.12 });
      tone(880, 0.25 + i * 0.3, 0.15, { type: "square", volume: 0.12 });
    }
    noise(0.1, 0.9, { volume: 0.12, filter: "highpass", freq: 3000 });
  },
  pushbackSuccess() {
    sfx.whoosh();
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.05 + i * 0.07, 0.2, { type: "square", volume: 0.1 }));
    sfx.impact(0.33, 0.5);
    chord([523, 784, 1047], 0.33, 0.6, "triangle", 0.12);
    sfx.sparkle(0.4);
  },
  /** Clock started. */
  go() {
    noise(0, 0.6, { volume: 0.2, filter: "bandpass", freq: 200, to: 3000 });
    tone(220, 0, 0.55, { type: "sawtooth", volume: 0.08, to: 880 });
    sfx.impact(0.55, 0.6);
    chord([440, 554, 659], 0.55, 0.5, "square", 0.06);
  },
  /** Danger-zone second tick. */
  tick() {
    tone(1200, 0, 0.04, { type: "square", volume: 0.07 });
    noise(0, 0.03, { volume: 0.08, filter: "highpass", freq: 5000 });
  },
  /** Final-seconds beep; `last` is the final second. */
  beep(last: boolean) {
    tone(last ? 1320 : 880, 0, last ? 0.35 : 0.12, { type: "square", volume: 0.14 });
    tone(last ? 660 : 440, 0, last ? 0.35 : 0.12, { type: "sine", volume: 0.12 });
  },
  /** Round-1 buzzer. */
  buzzer() {
    sfx.impact(0, 0.6);
    tone(140, 0, 1.1, { type: "sawtooth", volume: 0.16 });
    tone(147, 0, 1.1, { type: "square", volume: 0.09 });
  },
  gameOver(winner: Side) {
    if (winner === "player") {
      sfx.impact(0, 0.5);
      [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.1 + i * 0.12, 0.25, { type: "square", volume: 0.1 }));
      chord([523, 659, 784, 1047], 0.6, 1.4, "triangle", 0.11);
      chord([1047, 1319], 0.6, 1.4, "square", 0.04);
      noise(0.6, 1.6, { volume: 0.1, filter: "highpass", freq: 6000 });
      sfx.sparkle(0.7);
      sfx.sparkle(1.0);
    } else {
      sfx.impact(0, 0.7);
      chord([131, 156, 196], 0, 0.5, "sawtooth", 0.08);
      chord([123, 147, 185], 0.5, 0.5, "sawtooth", 0.08);
      chord([110, 131, 165], 1.0, 1.4, "sawtooth", 0.09);
      sfx.impact(1.0, 0.6);
      tone(55, 1.0, 1.4, { type: "sine", volume: 0.3 });
    }
  },
};

/** One sound per game event (host and display share the mapping). */
export function playEventSound(kind: GameEventKind, phase: Phase, winner: Side | null) {
  switch (kind) {
    case "correct":
      return phase === "round2" ? sfx.chaserStep() : sfx.correct();
    case "pushback-success":
      return sfx.pushbackSuccess();
    case "wrong":
    case "pushback-fail":
      return sfx.wrong();
    case "skip":
      return sfx.skip();
    case "pushback":
      return sfx.pushback();
    case "round-over":
      return sfx.buzzer();
    case "game-over":
      return sfx.gameOver(winner ?? "player");
  }
}

/** Tick through the danger zone (10…6 s), beep on the last 5. */
export function playCountdown(secs: number) {
  if (secs >= 1 && secs <= BEEP_SECONDS) sfx.beep(secs === 1);
  else if (secs > BEEP_SECONDS && secs <= DANGER_SECONDS) sfx.tick();
}
