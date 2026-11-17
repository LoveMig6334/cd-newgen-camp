// Tiny Web Audio effects for the Secret Santa lucky block (no files).
// unlock() must run from a tap so iOS lets the later timer-driven sounds play.
let ctx: AudioContext | null = null;
let muted = false;

function audio(): AudioContext | null {
  if (muted || typeof window === "undefined") return null;
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

export function setMuted(value: boolean) {
  muted = value;
}

export function unlockAudio() {
  const ac = audio();
  if (!ac) return;
  const g = ac.createGain();
  g.gain.value = 0;
  const o = ac.createOscillator();
  o.connect(g).connect(ac.destination);
  o.start();
  o.stop(ac.currentTime + 0.01);
}

function tone(freq: number, delay: number, duration: number, volume = 0.15, type: OscillatorType = "sine", to?: number) {
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

function noise(delay: number, duration: number, volume = 0.3) {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime + delay;
  const len = Math.floor(ac.sampleRate * duration);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2;
  const src = ac.createBufferSource();
  src.buffer = buf;
  const filter = ac.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 1800;
  const g = ac.createGain();
  g.gain.value = volume;
  src.connect(filter).connect(g).connect(ac.destination);
  src.start(t);
}

export const sfx = {
  tap: () => tone(740, 0, 0.07, 0.08, "triangle"),
  /** Block rattles; `step` grows as it is about to break. */
  rattle: (step: number) => tone(160 + step * 40, 0, 0.06, 0.1, "square"),
  burst: () => {
    noise(0, 0.45, 0.35);
    tone(320, 0, 0.35, 0.18, "sawtooth", 80);
  },
  /** Sleigh-bell sparkle for the reveal. */
  jingle: () => {
    const notes = [1319, 1568, 1760, 2093, 2637];
    notes.forEach((f, i) => tone(f, 0.05 + i * 0.07, 0.5, 0.09, "sine"));
    notes.forEach((f, i) => tone(f * 2, 0.08 + i * 0.07, 0.25, 0.03, "triangle"));
  },
};
