// Tiny Web Audio effects for Truth or Dare (no files). The context is created
// and resumed from a touch handler (unlock), so mobile autoplay rules allow
// the later timer-driven sounds.
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

/** Call from a pointer/touch handler so iOS lets sound play afterwards. */
export function unlockAudio() {
  const ac = audio();
  if (!ac) return;
  // A silent blip is what actually unlocks output on iOS Safari.
  const g = ac.createGain();
  g.gain.value = 0;
  const o = ac.createOscillator();
  o.connect(g).connect(ac.destination);
  o.start();
  o.stop(ac.currentTime + 0.01);
}

function tone(freq: number, delay: number, duration: number, volume = 0.18, type: OscillatorType = "sine", to?: number) {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime + delay;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + duration);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(volume, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  o.connect(g).connect(ac.destination);
  o.start(t);
  o.stop(t + duration + 0.02);
}

export const sfx = {
  /** A finger lands on the screen. */
  touch: () => tone(660, 0, 0.08, 0.08, "triangle"),
  /** Countdown tick; `step` 0..n gets higher as the pick gets closer. */
  tick: (step: number) => tone(520 + step * 90, 0, 0.07, 0.12, "square"),
  /** Someone has been picked. */
  pick: () => {
    tone(180, 0, 0.5, 0.25, "sawtooth", 70);
    tone(880, 0.02, 0.18, 0.16, "triangle");
    tone(1320, 0.12, 0.25, 0.14, "triangle");
  },
  /** Card reveal. */
  reveal: () => {
    tone(523, 0, 0.12, 0.12, "triangle");
    tone(784, 0.08, 0.2, 0.12, "triangle");
  },
};
