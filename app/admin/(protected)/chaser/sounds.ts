// Short synthesized effects for the Chaser game (Web Audio, no files).
// The AudioContext is created lazily on the first sound, which always follows
// a click or key press, so autoplay policies allow it.

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
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
  if (!ac) return;
  const start = ac.currentTime + at;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, start + duration);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export const sfx = {
  /** Wake the audio context from a user gesture. */
  unlock: () => void audio(),
  correct() {
    tone(660, 0, 0.12, { type: "triangle", volume: 0.25 });
    tone(990, 0.1, 0.22, { type: "triangle", volume: 0.25 });
  },
  wrong() {
    tone(180, 0, 0.4, { type: "sawtooth", volume: 0.12, to: 110 });
    tone(186, 0, 0.4, { type: "square", volume: 0.06, to: 112 });
  },
  skip() {
    tone(520, 0, 0.08, { type: "sine", volume: 0.12 });
  },
  pushback() {
    tone(220, 0, 0.35, { type: "square", volume: 0.1, to: 880 });
    tone(880, 0.35, 0.12, { type: "square", volume: 0.12 });
    tone(880, 0.52, 0.12, { type: "square", volume: 0.12 });
    tone(1320, 0.69, 0.3, { type: "square", volume: 0.12 });
  },
  /** Countdown beep; `last` is the final second. */
  beep(last: boolean) {
    tone(last ? 1320 : 880, 0, last ? 0.3 : 0.1, { type: "square", volume: 0.1 });
  },
  /** Round-1 buzzer. */
  buzzer() {
    tone(140, 0, 0.9, { type: "sawtooth", volume: 0.15 });
    tone(147, 0, 0.9, { type: "square", volume: 0.08 });
  },
  gameOver(winner: "player" | "chaser") {
    if (winner === "player") {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.13, 0.25, { type: "triangle", volume: 0.22 }));
      tone(1047, 0.55, 0.7, { type: "triangle", volume: 0.22 });
      tone(1319, 0.55, 0.7, { type: "triangle", volume: 0.14 });
    } else {
      [392, 370, 349].forEach((f, i) => tone(f, i * 0.28, 0.3, { type: "sawtooth", volume: 0.12 }));
      tone(262, 0.9, 1.1, { type: "sawtooth", volume: 0.14, to: 196 });
    }
  },
};
