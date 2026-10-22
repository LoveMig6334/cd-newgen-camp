"use client";
// Audience screen for the Chaser game. Mirrors the host page over
// BroadcastChannel (same browser) and adds the show: big clock, the step
// tube, particles, shakes, call-outs and sound.
import { DANGER_SECONDS, formatClock, secondsLeft, type DisplayState } from "@/lib/chaser";
import { useCallback, useEffect, useRef, useState } from "react";
import { HiArrowsPointingIn, HiArrowsPointingOut, HiPause, HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import { display } from "../fonts";
import { playCountdown, playEventSound, sfx } from "../sounds";
import { DISPLAY_PING_MS, openSync } from "../sync";
import { ParticleField } from "./particles";

const BLUE = ["#e0f2fe", "#7dd3fc", "#38bdf8", "#0ea5e9", "#ffffff"];
const YELLOW = ["#fef9c3", "#fde047", "#facc15", "#f59e0b", "#ffffff"];

const GLOW = {
  blue: "[text-shadow:0_0_18px_rgba(56,189,248,0.95),0_0_60px_rgba(56,189,248,0.6)]",
  yellow: "[text-shadow:0_0_18px_rgba(250,204,21,0.95),0_0_60px_rgba(250,204,21,0.6)]",
  white: "[text-shadow:0_0_18px_rgba(255,255,255,0.7),0_0_60px_rgba(125,211,252,0.45)]",
  red: "[text-shadow:0_0_18px_rgba(239,68,68,0.95),0_0_60px_rgba(239,68,68,0.6)]",
};

type Tone = "blue" | "yellow" | "white" | "red" | "grey";
const TONE_TEXT: Record<Tone, string> = {
  blue: `text-sky-300 ${GLOW.blue}`,
  yellow: `text-yellow-300 ${GLOW.yellow}`,
  white: `text-white ${GLOW.white}`,
  red: `text-red-400 ${GLOW.red}`,
  grey: "text-white/70",
};

interface Callout {
  id: number;
  text: string;
  sub?: string;
  tone: Tone;
}
interface Floater {
  id: number;
  text: string;
  x: number;
  y: number;
  tone: Tone;
}

/** First letter for a badge; skips Thai leading vowels (เ แ โ ใ ไ). */
const initial = (name: string) => Array.from(name.replace(/^[เแโใไ]+/, ""))[0]?.toUpperCase() ?? "?";

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

let nextId = 1;

export default function ChaserDisplay() {
  const [state, setState] = useState<DisplayState | null>(null);
  const [armed, setArmed] = useState(false);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [idle, setIdle] = useState(false);
  const [noHost, setNoHost] = useState(false);
  const [callout, setCallout] = useState<Callout | null>(null);
  const [floaters, setFloaters] = useState<Floater[]>([]);

  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<ParticleField | null>(null);
  const prevRef = useRef<DisplayState | null>(null);
  const soundRef = useRef(false);
  const syncRef = useRef<ReturnType<typeof openSync>>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const soundOn = armed && !muted;
  useEffect(() => {
    soundRef.current = soundOn;
    syncRef.current?.post({ type: "ping", sound: soundOn });
  }, [soundOn]);

  // ---- sync with the host page ----
  useEffect(() => {
    const sync = openSync((msg) => {
      if (msg.type === "state") {
        setState(msg.state);
        setNoHost(false);
      } else if (msg.type === "bye") {
        setState(null);
        prevRef.current = null;
      }
    });
    syncRef.current = sync;
    if (!sync) {
      setNoHost(true);
      return;
    }
    sync.post({ type: "hello" });
    const ping = setInterval(() => sync.post({ type: "ping", sound: soundRef.current }), DISPLAY_PING_MS);
    const waiting = setTimeout(() => setNoHost((n) => n || prevRef.current === null), 2500);
    const bye = () => sync.post({ type: "bye" });
    window.addEventListener("pagehide", bye);
    return () => {
      clearInterval(ping);
      clearTimeout(waiting);
      window.removeEventListener("pagehide", bye);
      bye();
      sync.close();
      syncRef.current = null;
    };
  }, []);

  // ---- canvas ----
  useEffect(() => {
    if (!canvasRef.current) return;
    const field = new ParticleField(canvasRef.current);
    fieldRef.current = field;
    const onResize = () => field.resize();
    window.addEventListener("resize", onResize);
    const pending = timers.current;
    return () => {
      window.removeEventListener("resize", onResize);
      field.destroy();
      pending.forEach(clearTimeout);
    };
  }, []);

  // ---- fullscreen / idle cursor / keys ----
  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    let t: ReturnType<typeof setTimeout>;
    const onMove = () => {
      setIdle(false);
      clearTimeout(t);
      t = setTimeout(() => setIdle(true), 2500);
    };
    window.addEventListener("mousemove", onMove);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      window.removeEventListener("mousemove", onMove);
      clearTimeout(t);
    };
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void rootRef.current?.requestFullscreen?.().catch(() => {});
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "m" || e.key === "M") setMuted((m) => !m);
      if (e.key === "f" || e.key === "F") toggleFullscreen();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleFullscreen]);

  const arm = () => {
    sfx.unlock();
    setArmed(true);
    toggleFullscreen();
  };

  // ---- effects toolkit ----
  const later = (ms: number, fn: () => void) => {
    timers.current.push(setTimeout(fn, ms));
  };

  const shake = (power: number) => {
    if (reducedMotion() || !stageRef.current) return;
    const frames: Keyframe[] = Array.from({ length: 9 }, (_, i) => {
      const p = power * (1 - i / 9);
      return {
        transform: `translate(${(Math.random() * 2 - 1) * p}px, ${(Math.random() * 2 - 1) * p}px) rotate(${(Math.random() * 2 - 1) * p * 0.04}deg)`,
      };
    });
    stageRef.current.animate([...frames, { transform: "none" }], { duration: 520, easing: "ease-out" });
  };

  const flash = (color: string, strength = 0.6, duration = 650) => {
    const el = flashRef.current;
    if (!el) return;
    el.style.background = color;
    el.animate([{ opacity: strength }, { opacity: 0 }], { duration, easing: "ease-out" });
  };

  const shout = (text: string, tone: Tone, sub?: string, ms = 1500) => {
    const id = nextId++;
    setCallout({ id, text, tone, sub });
    later(ms, () => setCallout((c) => (c?.id === id ? null : c)));
  };

  const float = (text: string, x: number, y: number, tone: Tone) => {
    const id = nextId++;
    setFloaters((f) => [...f, { id, text, x, y, tone }]);
    later(1200, () => setFloaters((f) => f.filter((x) => x.id !== id)));
  };

  /** Screen point on the tube at `fraction` of its length. */
  const tubePoint = (fraction: number) => {
    const r = trackRef.current?.getBoundingClientRect();
    if (!r) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    return { x: r.left + r.width * Math.min(1, Math.max(0, fraction)), y: r.top + r.height / 2 };
  };

  // ---- react to host updates ----
  useEffect(() => {
    if (!state) return;
    const prev = prevRef.current;
    prevRef.current = state;
    // First state after (re)connecting: show it, don't replay its effects.
    if (!prev) return;
    const field = fieldRef.current;
    const play = (fn: () => void) => {
      if (soundRef.current) fn();
    };

    if (state.phase === "round1" && state.started && !prev.started) {
      shout("GO!", "blue", state.settings.playerName);
      flash("#38bdf8", 0.35);
      play(sfx.go);
    }
    if (state.phase === "round2" && prev.phase === "interlude") {
      shout("ไล่ล่า!", "yellow", `${state.settings.chaserName} ออกตัว`);
      flash("#facc15", 0.4);
      shake(10);
      const p = tubePoint(0);
      field?.burst(p.x, p.y, YELLOW, { count: 120, speed: 18, angle: 0, spread: Math.PI / 1.5 });
      play(sfx.go);
    }

    const ev = state.event;
    if (ev && ev.seq !== prev.event?.seq) {
      play(() => playEventSound(ev.kind, state.phase, state.winner));
      const target = Math.max(1, state.playerScore);
      switch (ev.kind) {
        case "correct": {
          if (state.phase === "round1") {
            later(80, () => {
              const p = tubePoint(1);
              field?.burst(p.x, p.y, BLUE, { count: 110, speed: 17 });
              field?.ring(p.x, p.y, "#38bdf8", 220);
              float("+1", p.x - 40, p.y - 90, "blue");
            });
            flash("#38bdf8", 0.18);
            shake(5);
          } else {
            const p = tubePoint(state.chaserScore / target);
            field?.burst(p.x, p.y, YELLOW, { count: 120, speed: 18 });
            field?.ring(p.x, p.y, "#facc15", 240);
            float("+1", p.x, p.y - 90, "yellow");
            flash("#facc15", 0.22);
            shake(9);
          }
          break;
        }
        case "wrong": {
          const p = tubePoint(0.5);
          float("ผิด", p.x, p.y - 80, "red");
          flash("#ef4444", 0.25);
          shake(6);
          break;
        }
        case "skip": {
          const p = tubePoint(0.5);
          float("ข้าม", p.x, p.y - 80, "grey");
          break;
        }
        case "pushback": {
          flash("#ffffff", 0.85, 900);
          shake(22);
          shout("PUSHBACK!", "blue", "ผู้เล่นตอบได้", 1700);
          const p = tubePoint(state.chaserScore / target);
          field?.ring(p.x, p.y, "#7dd3fc", 420);
          field?.burst(p.x, p.y, BLUE, { count: 90, speed: 14 });
          break;
        }
        case "pushback-success": {
          const p = tubePoint((state.chaserScore + 1) / target);
          field?.burst(p.x, p.y, BLUE, { count: 220, speed: 24 });
          field?.ring(p.x, p.y, "#38bdf8", 480);
          later(150, () => field?.ring(p.x, p.y, "#e0f2fe", 320));
          flash("#38bdf8", 0.5);
          shake(18);
          shout("ถอยไป!", "blue", `${state.settings.chaserName} −1 step`);
          break;
        }
        case "pushback-fail":
          shout("ไม่สำเร็จ", "grey", undefined, 1100);
          flash("#ef4444", 0.2);
          break;
        case "round-over":
          flash("#ffffff", 0.7, 900);
          shake(16);
          shout("หมดเวลา!", "white", `${state.settings.playerName} ได้ ${state.playerScore} step`, 1900);
          break;
        case "game-over":
          if (state.winner === "chaser") {
            const p = tubePoint(1);
            flash("#facc15", 0.85, 1100);
            shake(30);
            field?.burst(p.x, p.y, YELLOW, { count: 300, speed: 30 });
            field?.ring(p.x, p.y, "#facc15", 700);
            later(250, () => field?.ring(p.x, p.y, "#fef08a", 500));
            later(400, () => field?.burst(window.innerWidth / 2, window.innerHeight / 2, YELLOW, { count: 200, speed: 26 }));
            shout(state.endReason === "zero" ? "0 STEP" : "ไล่ทัน!", "yellow", `${state.settings.chaserName} ชนะ`, 2200);
          } else {
            flash("#38bdf8", 0.7, 1000);
            shake(14);
            shout("รอดแล้ว!", "blue", `${state.settings.playerName} ชนะ`, 2200);
            [0, 450, 900, 1500, 2200].forEach((ms, i) =>
              later(ms, () => {
                field?.confetti([...BLUE, "#a5b4fc"], 140);
                const x = window.innerWidth * (0.2 + 0.6 * ((i * 37) % 10) / 10);
                field?.burst(x, window.innerHeight * 0.35, BLUE, { count: 140, speed: 20 });
              }),
            );
          }
          break;
      }
    }

    // Countdown sounds + heartbeat in the danger zone.
    const ticking = (state.phase === "round1" || state.phase === "round2") && state.running && !state.pushback;
    const secs = secondsLeft(state.remainingMs);
    if (ticking && secs !== secondsLeft(prev.remainingMs) && secs >= 1 && secs <= DANGER_SECONDS) {
      play(() => playCountdown(secs));
      if (secs <= 3) flash("#ef4444", 0.12, 400);
    }
  }, [state]); // runs once per host update

  const mode = stageMode(state);
  const secs = state ? secondsLeft(state.remainingMs) : 0;
  const inRound = state?.phase === "round1" || state?.phase === "round2";
  const ticking = Boolean(inRound && state?.running && !state?.pushback);
  const danger = ticking && secs <= DANGER_SECONDS;

  return (
    <div
      ref={rootRef}
      className={`fixed inset-0 z-50 overflow-hidden bg-[#020308] text-white select-none ${idle && armed ? "cursor-none" : ""}`}
      data-phase={state?.phase ?? "waiting"}
      data-pushback={state?.pushback || undefined}
    >
      <StageBackdrop mode={mode} />
      {danger && <div className="cd-danger pointer-events-none fixed inset-0 z-[5]" aria-hidden />}

      <div ref={stageRef} className="relative z-10 flex h-full flex-col overflow-y-auto px-[4vw] py-[3vh]">
        {!state ? (
          <Waiting noHost={noHost} />
        ) : state.phase === "setup" ? (
          <Intro state={state} />
        ) : (
          <Show state={state} trackRef={trackRef} danger={danger} ticking={ticking} />
        )}
      </div>

      <div ref={flashRef} className="pointer-events-none fixed inset-0 z-20 opacity-0" aria-hidden />
      <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-30 h-full w-full" aria-hidden />

      {floaters.map((f) => (
        <div
          key={f.id}
          className={`${display.className} cd-float pointer-events-none fixed z-40 text-5xl font-bold sm:text-7xl ${TONE_TEXT[f.tone]}`}
          style={{ left: f.x, top: f.y }}
        >
          {f.text}
        </div>
      ))}

      {callout && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center p-4" role="status">
          <div key={callout.id} className="cd-slam text-center">
            <p
              className={`${display.className} font-bold leading-none tracking-wider ${TONE_TEXT[callout.tone]}`}
              style={{ fontSize: "clamp(4rem, 15vw, 14rem)" }}
            >
              {callout.text}
            </p>
            {callout.sub && (
              <p className="mt-3 text-2xl font-semibold text-white sm:text-4xl [text-shadow:0_2px_20px_rgba(0,0,0,0.9)]">
                {callout.sub}
              </p>
            )}
          </div>
        </div>
      )}

      {armed && (
        <div
          className={`fixed bottom-4 right-4 z-50 flex gap-2 transition-opacity duration-300 ${idle ? "opacity-0" : "opacity-100"}`}
        >
          <CornerButton label={muted ? "เปิดเสียง (M)" : "ปิดเสียง (M)"} onClick={() => setMuted((m) => !m)}>
            {muted ? <HiSpeakerXMark className="h-5 w-5" /> : <HiSpeakerWave className="h-5 w-5" />}
          </CornerButton>
          <CornerButton label={fullscreen ? "ออกจากเต็มจอ (F)" : "เต็มจอ (F)"} onClick={toggleFullscreen}>
            {fullscreen ? <HiArrowsPointingIn className="h-5 w-5" /> : <HiArrowsPointingOut className="h-5 w-5" />}
          </CornerButton>
        </div>
      )}

      {!armed && (
        <button
          type="button"
          onClick={arm}
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-6 bg-black/80 p-6 text-center backdrop-blur-sm"
        >
          <span
            className={`${display.className} text-6xl font-bold tracking-[0.2em] text-white sm:text-8xl ${GLOW.white}`}
          >
            CHASER
          </span>
          <span className="rounded-2xl border-2 border-sky-300 bg-sky-500/20 px-8 py-4 text-2xl font-semibold shadow-[0_0_40px_rgba(56,189,248,0.5)] sm:text-3xl">
            คลิกเพื่อเริ่มจอแสดงผล
          </span>
          <span className="max-w-xl text-white/60">
            ลากหน้าต่างนี้ไปที่จอโปรเจกเตอร์ก่อน แล้วคลิก — จะเปิดเสียงและเต็มจอ (ปุ่ม F สลับเต็มจอ, M ปิดเสียง)
          </span>
        </button>
      )}
    </div>
  );
}

// ---------- stage ----------

type StageMode = "idle" | "player" | "chase" | "pushback" | "win-player" | "win-chaser";

function stageMode(s: DisplayState | null): StageMode {
  if (!s || s.phase === "setup") return "idle";
  if (s.phase === "round1") return "player";
  if (s.phase === "result") return s.winner === "chaser" ? "win-chaser" : "win-player";
  return s.pushback ? "pushback" : "chase";
}

const BEAMS: Record<StageMode, [string, string]> = {
  idle: ["rgba(56,189,248,0.35)", "rgba(250,204,21,0.3)"],
  player: ["rgba(56,189,248,0.4)", "rgba(56,189,248,0.3)"],
  chase: ["rgba(250,204,21,0.35)", "rgba(56,189,248,0.25)"],
  pushback: ["rgba(125,211,252,0.6)", "rgba(56,189,248,0.55)"],
  "win-player": ["rgba(56,189,248,0.55)", "rgba(165,180,252,0.45)"],
  "win-chaser": ["rgba(250,204,21,0.55)", "rgba(245,158,11,0.45)"],
};

const GLOWS: Record<StageMode, string> = {
  idle: "radial-gradient(ellipse 60% 50% at 15% 100%, rgba(56,189,248,0.25), transparent 70%), radial-gradient(ellipse 60% 50% at 85% 100%, rgba(250,204,21,0.2), transparent 70%)",
  player: "radial-gradient(ellipse 80% 55% at 50% 105%, rgba(14,165,233,0.4), transparent 70%)",
  chase: "radial-gradient(ellipse 80% 55% at 50% 105%, rgba(234,179,8,0.32), transparent 70%), radial-gradient(ellipse 50% 40% at 100% 50%, rgba(14,165,233,0.2), transparent 70%)",
  pushback: "radial-gradient(ellipse 100% 80% at 50% 50%, rgba(14,165,233,0.55), transparent 75%), #041a3a",
  "win-player": "radial-gradient(ellipse 90% 70% at 50% 60%, rgba(14,165,233,0.5), transparent 75%)",
  "win-chaser": "radial-gradient(ellipse 90% 70% at 50% 60%, rgba(234,179,8,0.45), transparent 75%)",
};

function StageBackdrop({ mode }: { mode: StageMode }) {
  const [a, b] = BEAMS[mode];
  return (
    <div className="pointer-events-none fixed inset-0" aria-hidden>
      <div className="absolute inset-0 transition-[background] duration-700" style={{ background: GLOWS[mode] }} />
      {mode === "pushback" && <div className="chaser-alarm absolute inset-0" />}
      {/* sweeping spotlights */}
      {[
        { left: "12%", color: a, delay: "0s" },
        { left: "32%", color: b, delay: "-2.3s" },
        { left: "68%", color: b, delay: "-4.1s" },
        { left: "88%", color: a, delay: "-1.2s" },
      ].map((beam) => (
        <div
          key={beam.left}
          className="cd-beam absolute -top-[10vh] h-[130vh] w-[16vw] opacity-70 blur-2xl"
          style={{
            left: beam.left,
            marginLeft: "-8vw",
            animationDelay: beam.delay,
            background: `linear-gradient(to bottom, ${beam.color}, transparent 75%)`,
            clipPath: "polygon(42% 0, 58% 0, 100% 100%, 0 100%)",
            transition: "background 0.7s",
          }}
        />
      ))}
      {/* perspective floor grid */}
      <div className="absolute inset-x-0 bottom-0 h-[38vh] [perspective:600px]">
        <div
          className="absolute inset-x-[-50%] bottom-0 h-[200%] origin-bottom opacity-40"
          style={{
            transform: "rotateX(62deg)",
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.12) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.12) 2px, transparent 2px)",
            backgroundSize: "70px 70px",
            maskImage: "linear-gradient(to top, black, transparent 80%)",
          }}
        />
      </div>
    </div>
  );
}

function CornerButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-black/50 text-white/80 backdrop-blur hover:bg-white/10"
    >
      {children}
    </button>
  );
}

// ---------- screens ----------

function Waiting({ noHost }: { noHost: boolean }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <p
        className={`${display.className} cd-breathe font-bold tracking-[0.2em] text-white ${GLOW.white}`}
        style={{ fontSize: "clamp(4rem, 14vw, 12rem)" }}
      >
        CHASER
      </p>
      <p className="text-xl text-white/60 sm:text-2xl">
        {noHost ? "ยังไม่พบหน้าพิธีกร — เปิด /admin/chaser ในเบราว์เซอร์เดียวกัน" : "กำลังเชื่อมต่อหน้าพิธีกร…"}
      </p>
    </div>
  );
}

function Intro({ state }: { state: DisplayState }) {
  const { playerName, chaserName } = state.settings;
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-[4vh] text-center">
      <p
        className={`${display.className} cd-breathe font-bold tracking-[0.2em] text-white ${GLOW.white}`}
        style={{ fontSize: "clamp(4rem, 15vw, 13rem)" }}
      >
        CHASER
      </p>
      <div className="flex w-full max-w-6xl flex-col items-center justify-center gap-4 sm:flex-row sm:gap-10">
        <NamePlate name={playerName} role="ผู้เล่น" tone="blue" />
        <span className={`${display.className} text-4xl font-bold text-white/70 sm:text-6xl`}>VS</span>
        <NamePlate name={chaserName} role="Chaser" tone="yellow" />
      </div>
      <p className="cd-breathe text-xl text-white/60 sm:text-2xl">รอพิธีกรเริ่มเกม…</p>
    </div>
  );
}

function NamePlate({ name, role, tone }: { name: string; role: string; tone: "blue" | "yellow" }) {
  const ring =
    tone === "blue"
      ? "border-sky-300/70 bg-sky-500/15 shadow-[0_0_50px_rgba(56,189,248,0.45)]"
      : "border-yellow-300/70 bg-yellow-400/10 shadow-[0_0_50px_rgba(250,204,21,0.4)]";
  return (
    <div className={`w-full max-w-md rounded-3xl border-2 px-8 py-5 ${ring}`}>
      <p className="text-lg text-white/60">{role}</p>
      <p
        className={`${display.className} truncate font-bold ${TONE_TEXT[tone]}`}
        style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
      >
        {name}
      </p>
    </div>
  );
}

function Show({
  state,
  trackRef,
  danger,
  ticking,
}: {
  state: DisplayState;
  trackRef: React.RefObject<HTMLDivElement | null>;
  danger: boolean;
  ticking: boolean;
}) {
  const { settings, phase } = state;
  const round2 = phase === "round2";
  const chasing = phase !== "round1";
  const target = state.playerScore;
  const gap = Math.max(0, target - state.chaserScore);

  const label =
    phase === "round1"
      ? `รอบที่ 1 · ${settings.playerName} สะสม step`
      : phase === "interlude"
        ? "หมดเวลารอบที่ 1"
        : round2
          ? `รอบที่ 2 · ${settings.chaserName} ไล่ล่า!`
          : "ผลการแข่งขัน";

  return (
    <div className="flex flex-1 flex-col gap-[2.5vh]">
      {/* top: label + clock */}
      <div className="flex flex-col items-center">
        <p
          className={`${display.className} text-lg font-medium tracking-widest sm:text-2xl ${
            phase === "round1" ? "text-sky-300" : round2 ? "text-yellow-300" : "text-white/70"
          }`}
        >
          {label}
        </p>
        {phase === "interlude" || phase === "result" ? null : (
          <Clock state={state} danger={danger} ticking={ticking} />
        )}
      </div>

      {phase === "interlude" && (
        <div className="flex flex-col items-center text-center">
          <p className="text-2xl font-semibold text-yellow-200 sm:text-4xl">เป้าหมายของ {settings.chaserName}</p>
          <p
            className={`${display.className} cd-slam-in font-bold leading-none tabular-nums text-sky-300 ${GLOW.blue}`}
            style={{ fontSize: "clamp(7rem, 26vh, 18rem)" }}
          >
            {target}
          </p>
          <p className="text-xl text-white/80 sm:text-3xl">
            step ภายใน <span className={`${display.className} font-bold text-white`}>{formatClock(settings.round2Seconds * 1000)}</span>
          </p>
        </div>
      )}

      {phase === "result" && <ResultHeadline state={state} />}

      {/* scoreline */}
      <div className="flex items-end justify-between gap-4">
        {chasing ? (
          <>
            <div>
              <p className="text-base text-yellow-200/80 sm:text-xl">{settings.chaserName}</p>
              <p
                className={`${display.className} font-bold leading-none tabular-nums text-yellow-300 ${GLOW.yellow}`}
                style={{ fontSize: "clamp(3rem, 9vh, 7rem)" }}
              >
                {state.chaserScore}
              </p>
            </div>
            {phase !== "interlude" && (
              <p className={`${display.className} pb-2 text-center text-xl font-semibold sm:text-4xl`}>
                {state.winner === "chaser" ? (
                  <span className={`text-yellow-300 ${GLOW.yellow}`}>ไล่ทันแล้ว!</span>
                ) : state.winner === "player" ? (
                  <span className={`text-sky-300 ${GLOW.blue}`}>หนีรอด! ห่าง {gap} step</span>
                ) : (
                  <>
                    ห่างอีก <span className={`text-sky-300 ${GLOW.blue}`}>{gap}</span> step
                  </>
                )}
              </p>
            )}
            <div className="text-right">
              <p className="text-base text-sky-200/80 sm:text-xl">เป้าหมาย · {settings.playerName}</p>
              <p
                className={`${display.className} font-bold leading-none tabular-nums text-sky-300 ${GLOW.blue}`}
                style={{ fontSize: "clamp(3rem, 9vh, 7rem)" }}
              >
                {target}
              </p>
            </div>
          </>
        ) : (
          <>
            <p className={`${display.className} text-2xl font-bold text-sky-200 sm:text-4xl`}>{settings.playerName}</p>
            <p
              className={`${display.className} font-bold leading-none tabular-nums text-sky-300 ${GLOW.blue}`}
              style={{ fontSize: "clamp(3.5rem, 11vh, 8rem)" }}
            >
              {state.playerScore}
              <span className="ml-3 text-[0.4em] text-sky-200/80">STEP</span>
            </p>
          </>
        )}
      </div>

      <Tube
        steps={target}
        chaser={state.chaserScore}
        mode={chasing ? "chase" : "collect"}
        settling={phase === "interlude"}
        pushback={state.pushback}
        trackRef={trackRef}
        playerName={settings.playerName}
        chaserName={settings.chaserName}
      />

      {(phase === "round1" || round2) && <QuestionPanel state={state} />}
      {phase === "interlude" && (
        <p className="cd-breathe mt-auto text-center text-xl text-white/60 sm:text-2xl">รอพิธีกรเริ่มรอบที่ 2…</p>
      )}
      {phase === "result" && <ResultStats state={state} />}
    </div>
  );
}

function Clock({ state, danger, ticking }: { state: DisplayState; danger: boolean; ticking: boolean }) {
  const secs = secondsLeft(state.remainingMs);
  const red = secs <= DANGER_SECONDS;
  return (
    <div className="flex flex-col items-center">
      <div
        key={danger ? secs : "calm"}
        className={`${display.className} font-bold leading-none tabular-nums transition-[color,opacity] ${
          red ? `text-red-500 ${GLOW.red}` : `text-white ${GLOW.white}`
        } ${danger ? "cd-heartbeat" : ""} ${ticking && red ? "chaser-blink" : ""} ${state.pushback ? "opacity-40" : ""}`}
        style={{ fontSize: "clamp(4rem, 17vh, 14rem)" }}
      >
        {formatClock(state.remainingMs)}
      </div>
      <div className="mt-1 h-2 w-[min(32rem,70vw)] overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-[width] duration-150 ${red ? "bg-red-500 shadow-[0_0_14px_rgba(239,68,68,0.9)]" : "bg-white/80"}`}
          style={{ width: `${Math.max(0, Math.min(100, (state.remainingMs / state.totalMs) * 100))}%` }}
        />
      </div>
      {state.pushback && (
        <span className="mt-2 inline-flex items-center gap-2 rounded-full border border-sky-200/70 bg-sky-400/20 px-4 py-1 text-lg font-semibold text-sky-100">
          <HiPause className="h-5 w-5" /> นาฬิกาหยุด
        </span>
      )}
    </div>
  );
}

/** Gap between steps shrinks as the tube gets busier. */
const stepGap = (n: number) => (n <= 6 ? 10 : n <= 12 ? 6 : n <= 24 ? 4 : n <= 40 ? 2 : 1);

function Tube({
  steps,
  chaser,
  mode,
  settling,
  pushback,
  trackRef,
  playerName,
  chaserName,
}: {
  steps: number;
  chaser: number;
  mode: "collect" | "chase";
  settling: boolean;
  pushback: boolean;
  trackRef: React.RefObject<HTMLDivElement | null>;
  playerName: string;
  chaserName: string;
}) {
  const g = stepGap(steps);
  const k = Math.min(chaser, steps);
  // Boundary after k steps, accounting for the gaps.
  const headLeft =
    steps === 0 || k === 0
      ? "0%"
      : k >= steps
        ? "100%"
        : `calc((100% - ${(steps - 1) * g}px) * ${k / steps} + ${(k - 0.5) * g}px)`;
  const chase = mode === "chase";

  return (
    <div className="relative pt-[clamp(2.5rem,7vh,4.5rem)]">
      {/* tube */}
      <div
        className={`relative rounded-full border-2 p-[clamp(4px,0.8vh,10px)] transition-[box-shadow,border-color] duration-700 ${
          chase
            ? "border-yellow-200/40 bg-white/[0.04] shadow-[0_0_60px_rgba(250,204,21,0.25),inset_0_0_30px_rgba(0,0,0,0.8)]"
            : "border-sky-200/50 bg-white/[0.04] shadow-[0_0_70px_rgba(56,189,248,0.4),inset_0_0_30px_rgba(0,0,0,0.8)]"
        }`}
        style={{ height: "clamp(4.5rem, 18vh, 12rem)" }}
      >
        <div ref={trackRef} className="relative flex h-full overflow-hidden rounded-full" style={{ gap: g }}>
          {steps === 0 && (
            <div className="flex flex-1 items-center justify-center text-2xl text-white/30 sm:text-4xl">0 STEP</div>
          )}
          {Array.from({ length: steps }, (_, i) => {
            const yellow = chase && i < k;
            const dim = chase && !yellow;
            return (
              <div
                key={i}
                className={`cd-cell-in relative h-full flex-1 overflow-hidden ${
                  yellow
                    ? "bg-linear-to-b from-yellow-100 via-yellow-400 to-amber-600 shadow-[0_0_24px_rgba(250,204,21,0.9)]"
                    : dim
                      ? "bg-linear-to-b from-sky-900/70 via-blue-950/80 to-sky-900/70"
                      : "bg-linear-to-b from-sky-200 via-sky-400 to-blue-700 shadow-[0_0_24px_rgba(56,189,248,0.8)]"
                }`}
                style={{
                  transition: "background 0.6s, box-shadow 0.6s",
                  transitionDelay: settling ? `${600 + i * 40}ms` : "0ms",
                }}
              >
                {/* glass highlight */}
                <div className="absolute inset-x-0 top-[12%] h-[18%] bg-white/30 blur-[2px]" />
              </div>
            );
          })}
          {/* moving shine */}
          <div className="cd-shine pointer-events-none absolute inset-y-0 w-1/4 bg-linear-to-r from-transparent via-white/25 to-transparent" />
        </div>
      </div>

      {/* badges ride above the tube */}
      <div className="pointer-events-none absolute inset-x-[clamp(6px,1vh,12px)] top-0 bottom-0">
        <Badge name={playerName} tone="blue" style={{ left: "100%" }} />
        {chase && (
          <div
            className="absolute top-0 bottom-0 transition-[left] duration-700"
            style={{ left: headLeft, transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
          >
            <div className={pushback ? "cd-tremble" : undefined}>
              <Badge name={chaserName} tone="yellow" style={{ left: 0 }} />
            </div>
            {/* glowing head line */}
            <div className="absolute bottom-0 left-0 top-[clamp(2.5rem,7vh,4.5rem)] w-[6px] -translate-x-1/2 rounded-full bg-yellow-100 shadow-[0_0_20px_6px_rgba(250,204,21,0.9),0_0_60px_20px_rgba(250,204,21,0.5)]" />
          </div>
        )}
      </div>
    </div>
  );
}

function Badge({ name, tone, style }: { name: string; tone: "blue" | "yellow"; style: React.CSSProperties }) {
  const look =
    tone === "blue"
      ? "border-sky-100 bg-sky-500 text-white shadow-[0_0_30px_rgba(56,189,248,0.95)]"
      : "border-yellow-50 bg-yellow-400 text-yellow-950 shadow-[0_0_30px_rgba(250,204,21,0.95)]";
  return (
    <div
      className={`${display.className} absolute top-0 flex -translate-x-1/2 items-center justify-center rounded-full border-[3px] font-bold ${look}`}
      style={{ ...style, width: "clamp(2.25rem, 6vh, 4rem)", height: "clamp(2.25rem, 6vh, 4rem)", fontSize: "clamp(1rem, 3vh, 2rem)" }}
      title={name}
    >
      {initial(name)}
    </div>
  );
}

function QuestionPanel({ state }: { state: DisplayState }) {
  const { pushback } = state;
  return (
    <div
      className={`relative mt-auto flex min-h-[18vh] flex-col justify-center rounded-3xl border-2 px-[3vw] py-[2.5vh] backdrop-blur-sm transition-colors duration-500 ${
        pushback
          ? "border-sky-200 bg-sky-500/20 shadow-[0_0_70px_rgba(56,189,248,0.55)]"
          : state.phase === "round2"
            ? "border-yellow-300/30 bg-black/45"
            : "border-sky-300/30 bg-black/45"
      }`}
    >
      {pushback && (
        <div className="mb-2 flex flex-wrap items-baseline gap-x-5">
          <span
            className={`${display.className} font-bold tracking-wider text-white ${GLOW.blue}`}
            style={{ fontSize: "clamp(2.25rem, 6vh, 4.5rem)" }}
          >
            PUSHBACK!
          </span>
          <span className="text-2xl font-semibold text-sky-100 sm:text-4xl">ผู้เล่นตอบได้</span>
        </div>
      )}
      {state.question ? (
        <>
          {!pushback && <p className="text-base text-white/45 sm:text-lg">ข้อที่ {state.questionNumber}</p>}
          <p className="font-semibold leading-snug text-white" style={{ fontSize: "clamp(1.6rem, 4.6vh, 3.75rem)" }}>
            {state.question}
          </p>
        </>
      ) : (
        <p className="cd-breathe text-center text-2xl text-white/60 sm:text-4xl">
          {state.started ? "หยุดเวลาชั่วคราว" : `เตรียมตัว… ${state.settings.playerName}`}
        </p>
      )}
    </div>
  );
}

function ResultHeadline({ state }: { state: DisplayState }) {
  const playerWon = state.winner === "player";
  const name = playerWon ? state.settings.playerName : state.settings.chaserName;
  return (
    <div className="flex flex-col items-center text-center">
      <p className="text-2xl text-white/70 sm:text-3xl">ผู้ชนะ</p>
      <p
        className={`${display.className} cd-slam-in max-w-full break-words font-bold leading-tight ${
          playerWon ? `text-sky-300 ${GLOW.blue}` : `text-yellow-300 ${GLOW.yellow}`
        }`}
        style={{ fontSize: "clamp(3.5rem, 15vh, 11rem)" }}
      >
        {name}
      </p>
    </div>
  );
}

function ResultStats({ state }: { state: DisplayState }) {
  const items: { label: string; value: string; tone: string }[] = [
    { label: `รอบที่ 1 · ${state.settings.playerName}`, value: `${state.playerScore} step`, tone: "text-sky-300" },
    {
      label: `รอบที่ 2 · ${state.settings.chaserName}`,
      value: state.endReason === "zero" ? "ไม่ต้องเล่น" : `${state.chaserScore} / ${state.playerScore}`,
      tone: "text-yellow-300",
    },
    { label: "Pushback สำเร็จ", value: `${state.pushbackWins} ครั้ง`, tone: "text-sky-200" },
  ];
  if (state.chaserTimeLeftMs !== null) {
    items.push({ label: "เวลาที่เหลือ", value: formatClock(state.chaserTimeLeftMs), tone: "text-white" });
  }
  return (
    <div className={`mt-auto grid gap-3 ${items.length === 4 ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-3"}`}>
      {items.map((s) => (
        <div key={s.label} className="rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-center backdrop-blur-sm">
          <p className="truncate text-sm text-white/55 sm:text-base">{s.label}</p>
          <p className={`${display.className} mt-2 text-3xl font-bold leading-tight tabular-nums sm:text-5xl ${s.tone}`}>
            {s.value}
          </p>
        </div>
      ))}
    </div>
  );
}
