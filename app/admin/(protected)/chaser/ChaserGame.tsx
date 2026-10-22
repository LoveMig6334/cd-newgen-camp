"use client";
import {
  BEEP_SECONDS,
  DANGER_SECONDS,
  DEFAULT_SETTINGS,
  MAX_NAME_CHARS,
  MAX_ROUND_SECONDS,
  MIN_ROUND_SECONDS,
  chaserReducer,
  currentQuestion,
  formatClock,
  formatQuestions,
  newGame,
  parseQuestions,
  sanitizeBank,
  sanitizeSettings,
  secondsLeft,
  shuffle,
  type ChaserGame as Game,
  type ChaserSettings,
  type GameEventKind,
  type Question,
  type Verdict,
} from "@/lib/chaser";
import { SAMPLE_QUESTIONS } from "@/lib/chaserQuestions";
import { Chakra_Petch } from "next/font/google";
import Link from "next/link";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import {
  HiArrowLeft,
  HiArrowPath,
  HiArrowsPointingIn,
  HiArrowsPointingOut,
  HiCheck,
  HiForward,
  HiPause,
  HiPlay,
  HiPlus,
  HiSpeakerWave,
  HiSpeakerXMark,
  HiTrash,
  HiXMark,
} from "react-icons/hi2";
import { sfx } from "./sounds";

const display = Chakra_Petch({ subsets: ["thai", "latin"], weight: ["500", "700"] });

const STORAGE = { settings: "chaser:settings", bank: "chaser:bank", muted: "chaser:muted" };

const GLOW = {
  player: "[text-shadow:0_0_12px_rgba(56,189,248,0.9),0_0_40px_rgba(56,189,248,0.5)]",
  chaser: "[text-shadow:0_0_12px_rgba(248,59,92,0.9),0_0_40px_rgba(248,59,92,0.5)]",
  white: "[text-shadow:0_0_14px_rgba(255,255,255,0.6),0_0_40px_rgba(125,211,252,0.35)]",
  amber: "[text-shadow:0_0_12px_rgba(251,191,36,0.95),0_0_44px_rgba(251,191,36,0.55)]",
};

const FLASH: Partial<Record<GameEventKind, string>> = {
  correct: "bg-emerald-400",
  "pushback-success": "bg-sky-400",
  wrong: "bg-rose-500",
  "pushback-fail": "bg-rose-500",
  pushback: "bg-amber-400",
  "round-over": "bg-white",
  "game-over": "bg-white",
};

type Draft = Omit<ChaserSettings, "round1Seconds" | "round2Seconds"> & {
  round1Seconds: string;
  round2Seconds: string;
};

const toDraft = (s: ChaserSettings): Draft => ({
  ...s,
  round1Seconds: String(s.round1Seconds),
  round2Seconds: String(s.round2Seconds),
});

function readJson(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable — settings live for this page view only
  }
}

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `q-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const isTyping = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName));

const VERDICT_KEYS: Record<string, Verdict> = {
  Digit1: "correct",
  Numpad1: "correct",
  Digit2: "wrong",
  Numpad2: "wrong",
  Digit3: "skip",
  Numpad3: "skip",
};

export default function ChaserGame() {
  const [game, dispatch] = useReducer(chaserReducer, undefined, () => newGame());
  const [draft, setDraft] = useState<Draft>(() => toDraft(DEFAULT_SETTINGS));
  const [bank, setBank] = useState<Question[]>(SAMPLE_QUESTIONS);
  const [muted, setMuted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef(game);
  const mutedRef = useRef(muted);
  const playedSeq = useRef(0);
  const lastBeep = useRef("");

  useEffect(() => {
    gameRef.current = game;
    mutedRef.current = muted;
  });

  // ---- persistence ----
  useEffect(() => {
    const settings = readJson(STORAGE.settings);
    if (settings) setDraft(toDraft(sanitizeSettings(settings)));
    const stored = sanitizeBank(readJson(STORAGE.bank));
    if (stored) setBank(stored);
    setMuted(readJson(STORAGE.muted) === true);
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) writeJson(STORAGE.settings, draft);
  }, [loaded, draft]);
  useEffect(() => {
    if (loaded) writeJson(STORAGE.bank, bank);
  }, [loaded, bank]);
  useEffect(() => {
    if (loaded) writeJson(STORAGE.muted, muted);
  }, [loaded, muted]);

  // ---- clock ----
  const inRound = game.phase === "round1" || game.phase === "round2";
  const ticking = inRound && game.running && !game.pushback;
  useEffect(() => {
    if (!ticking) return;
    let last = performance.now();
    const timer = setInterval(() => {
      const now = performance.now();
      dispatch({ type: "tick", ms: now - last });
      last = now;
    }, 100);
    return () => clearInterval(timer);
  }, [ticking]);

  // ---- sounds ----
  const secs = secondsLeft(game.remainingMs);
  useEffect(() => {
    if (!ticking || secs < 1 || secs > BEEP_SECONDS) return;
    const key = `${game.phase}:${secs}`;
    if (lastBeep.current === key) return;
    lastBeep.current = key;
    if (!mutedRef.current) sfx.beep(secs === 1);
  }, [ticking, secs, game.phase]);

  useEffect(() => {
    const e = game.event;
    if (!e || e.seq === playedSeq.current) return;
    playedSeq.current = e.seq;
    if (mutedRef.current) return;
    switch (e.kind) {
      case "correct":
      case "pushback-success":
        return sfx.correct();
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
        return sfx.gameOver(gameRef.current.winner ?? "player");
    }
  }, [game.event]);

  // ---- controls ----
  const decide = useCallback((verdict: Verdict) => {
    sfx.unlock();
    dispatch({ type: "verdict", verdict });
  }, []);

  /** Space: start / pause / resume the clock, or start round 2. */
  const primary = useCallback(() => {
    sfx.unlock();
    const g = gameRef.current;
    if (g.phase === "interlude") dispatch({ type: "beginRound2" });
    else if (g.running) dispatch({ type: "pause" });
    else dispatch({ type: "go" });
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const phase = gameRef.current.phase;
      if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (phase === "setup" || phase === "result") return;
      if (e.code === "Space") {
        e.preventDefault();
        if (!e.repeat) primary();
        return;
      }
      const verdict = VERDICT_KEYS[e.code];
      if (verdict) {
        e.preventDefault();
        if (!e.repeat) decide(verdict);
      }
    };
    // Swallow keyup so a focused button doesn't also activate.
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isTyping(e.target)) e.preventDefault();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [decide, primary]);

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void rootRef.current?.requestFullscreen?.();
  };

  const validBank = bank
    .map((q) => ({ ...q, question: q.question.trim(), answer: q.answer.trim() }))
    .filter((q) => q.question && q.answer);

  const start = () => {
    if (validBank.length === 0) return;
    const settings = sanitizeSettings(draft);
    setDraft(toDraft(settings));
    sfx.unlock();
    dispatch({ type: "start", settings, deck: shuffle(validBank) });
  };

  const endGame = () => {
    if (game.phase !== "result" && !window.confirm("จบเกมนี้แล้วกลับไปหน้าตั้งค่า?")) return;
    dispatch({ type: "reset" });
  };

  const mode =
    game.phase === "round1"
      ? "player"
      : game.phase === "round2"
        ? game.pushback
          ? "pushback"
          : "chaser"
        : game.phase === "result"
          ? (game.winner ?? "neutral")
          : "neutral";
  const flash = game.event ? FLASH[game.event.kind] : undefined;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-50 overflow-y-auto bg-[#04050c] text-white"
      data-phase={game.phase}
      data-pushback={game.pushback || undefined}
    >
      <Backdrop mode={mode} />
      {flash && (
        <div
          key={game.event!.seq}
          className={`chaser-flash pointer-events-none fixed inset-0 z-10 ${flash}`}
          aria-hidden
        />
      )}

      <div className="relative z-20 mx-auto flex min-h-full max-w-6xl flex-col px-4 pb-4 pt-3 sm:px-6">
        <header className="flex items-center justify-between gap-3 py-2">
          <div className="flex items-baseline gap-3 min-w-0">
            <span
              className={`${display.className} text-2xl font-bold tracking-[0.2em] text-rose-400 sm:text-3xl ${GLOW.chaser}`}
            >
              CHASER
            </span>
            <span className="hidden truncate text-sm text-white/50 sm:inline">{PHASE_LABEL[game.phase]}</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <IconButton
              label={muted ? "เปิดเสียง" : "ปิดเสียง"}
              onClick={() => setMuted((m) => !m)}
              active={muted}
            >
              {muted ? <HiSpeakerXMark className="h-5 w-5" /> : <HiSpeakerWave className="h-5 w-5" />}
            </IconButton>
            <IconButton label={fullscreen ? "ออกจากเต็มจอ" : "เต็มจอ"} onClick={toggleFullscreen}>
              {fullscreen ? <HiArrowsPointingIn className="h-5 w-5" /> : <HiArrowsPointingOut className="h-5 w-5" />}
            </IconButton>
            {game.phase === "setup" ? (
              <Link
                href="/admin"
                className="flex h-10 items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 text-sm text-white/80 hover:bg-white/10"
              >
                <HiArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">แอดมิน</span>
              </Link>
            ) : (
              <IconButton label="จบเกม" onClick={endGame}>
                <HiXMark className="h-5 w-5" />
              </IconButton>
            )}
          </div>
        </header>

        <main className="flex flex-1 flex-col">
          {game.phase === "setup" && (
            <SetupScreen
              draft={draft}
              setDraft={setDraft}
              bank={bank}
              setBank={setBank}
              validCount={validBank.length}
              onStart={start}
            />
          )}
          {inRound && <RoundScreen game={game} onDecide={decide} onPrimary={primary} />}
          {game.phase === "interlude" && <InterludeScreen game={game} onStart={primary} />}
          {game.phase === "result" && <ResultScreen game={game} onReplay={endGame} />}
        </main>
      </div>
    </div>
  );
}

const PHASE_LABEL: Record<Game["phase"], string> = {
  setup: "ตั้งค่าเกม",
  round1: "รอบที่ 1 · สะสมแต้ม",
  interlude: "พักก่อนรอบที่ 2",
  round2: "รอบที่ 2 · ไล่ล่า",
  result: "ผลการแข่งขัน",
};

// ---------- shared bits ----------

function Backdrop({ mode }: { mode: "neutral" | "player" | "chaser" | "pushback" }) {
  const layer = "pointer-events-none fixed inset-0 transition-opacity duration-500";
  return (
    <>
      <div
        className={`${layer} opacity-40`}
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at 50% 100%, black 20%, transparent 75%)",
        }}
      />
      <div
        className={`${layer} ${mode === "neutral" ? "opacity-100" : "opacity-0"}`}
        style={{
          background:
            "radial-gradient(ellipse 60% 70% at 0% 0%, rgba(56,189,248,0.22), transparent 70%), radial-gradient(ellipse 60% 70% at 100% 0%, rgba(244,63,94,0.22), transparent 70%)",
        }}
      />
      <div
        className={`${layer} ${mode === "player" ? "opacity-100" : "opacity-0"}`}
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(56,189,248,0.38), transparent 70%), radial-gradient(ellipse 50% 40% at 50% 110%, rgba(37,99,235,0.25), transparent 70%)",
        }}
      />
      <div
        className={`${layer} ${mode === "chaser" ? "opacity-100" : "opacity-0"}`}
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(244,63,94,0.4), transparent 70%), radial-gradient(ellipse 50% 40% at 50% 110%, rgba(190,18,60,0.3), transparent 70%)",
        }}
      />
      <div
        className={`${layer} ${mode === "pushback" ? "opacity-100 chaser-alarm" : "opacity-0"}`}
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 0%, rgba(14,165,233,0.55), transparent 70%), radial-gradient(ellipse 70% 50% at 50% 110%, rgba(251,191,36,0.3), transparent 70%), #031530",
        }}
      />
    </>
  );
}

function IconButton({
  label,
  onClick,
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
        active
          ? "border-amber-400/60 bg-amber-400/15 text-amber-300"
          : "border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

const panel = "rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm";
const field =
  "w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/30";

// ---------- setup ----------

function SetupScreen({
  draft,
  setDraft,
  bank,
  setBank,
  validCount,
  onStart,
}: {
  draft: Draft;
  setDraft: React.Dispatch<React.SetStateAction<Draft>>;
  bank: Question[];
  setBank: React.Dispatch<React.SetStateAction<Question[]>>;
  validCount: number;
  onStart: () => void;
}) {
  const set = (key: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setDraft((d) => ({ ...d, [key]: e.target.value }));

  return (
    <div className="grid gap-5 py-3 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <section className={`${panel} space-y-5 p-5`}>
        <div className="text-center">
          <h1
            className={`${display.className} text-5xl font-bold tracking-[0.15em] text-white ${GLOW.white}`}
          >
            CHASER
          </h1>
          <p className="mt-1 text-sm text-white/60">เกมควิซไล่ล่า · พิธีกรควบคุมบนจอเดียว</p>
        </div>

        <label className="block">
          <span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-sky-300">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.9)]" />
            ชื่อผู้เล่น
          </span>
          <input
            value={draft.playerName}
            onChange={set("playerName")}
            maxLength={MAX_NAME_CHARS}
            className={field}
            placeholder={DEFAULT_SETTINGS.playerName}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-rose-300">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.9)]" />
            ชื่อ Chaser
          </span>
          <input
            value={draft.chaserName}
            onChange={set("chaserName")}
            maxLength={MAX_NAME_CHARS}
            className={`${field} focus:border-rose-400 focus:ring-rose-400/30`}
            placeholder={DEFAULT_SETTINGS.chaserName}
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(["round1Seconds", "round2Seconds"] as const).map((key, i) => (
            <label key={key} className="block">
              <span className="mb-1.5 block text-sm text-white/70">เวลารอบที่ {i + 1} (วินาที)</span>
              <input
                type="number"
                inputMode="numeric"
                min={MIN_ROUND_SECONDS}
                max={MAX_ROUND_SECONDS}
                value={draft[key]}
                onChange={set(key)}
                className={`${field} tabular-nums`}
              />
            </label>
          ))}
        </div>

        <button
          type="button"
          onClick={onStart}
          disabled={validCount === 0}
          className={`${display.className} w-full rounded-2xl bg-linear-to-r from-sky-500 via-indigo-500 to-rose-500 py-4 text-2xl font-bold tracking-wider text-white shadow-[0_0_30px_rgba(99,102,241,0.5)] transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40`}
        >
          เริ่มเกม
        </button>
        {validCount === 0 && <p className="text-center text-sm text-amber-300">เพิ่มคำถามอย่างน้อย 1 ข้อก่อนเริ่ม</p>}

        <details className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white/70">
          <summary className="cursor-pointer font-medium text-white/85">กติกาย่อ & ปุ่มลัด</summary>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>รอบ 1: ผู้เล่นตอบถูก +1 แต้ม แต้มที่ได้คือเป้าหมายของ Chaser (0 แต้ม = Chaser ชนะทันที)</li>
            <li>รอบ 2: Chaser ต้องถึงเป้าหมายก่อนหมดเวลา</li>
            <li>Chaser ตอบผิด → นาฬิกาหยุด ผู้เล่นตอบ (Pushback) ถูก = Chaser ถอย 1 ช่อง</li>
            <li>
              ปุ่มลัด: <Kbd>1</Kbd> ถูก · <Kbd>2</Kbd> ผิด · <Kbd>3</Kbd> ข้าม · <Kbd>Space</Kbd>{" "}
              เริ่ม/หยุดเวลา
            </li>
          </ul>
        </details>
      </section>

      <QuestionBank bank={bank} setBank={setBank} validCount={validCount} />
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-white/25 bg-white/10 px-1.5 py-0.5 font-mono text-xs text-white/90">
      {children}
    </kbd>
  );
}

function QuestionBank({
  bank,
  setBank,
  validCount,
}: {
  bank: Question[];
  setBank: React.Dispatch<React.SetStateAction<Question[]>>;
  validCount: number;
}) {
  const [adding, setAdding] = useState({ question: "", answer: "" });
  const [showText, setShowText] = useState(false);
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");

  const update = (id: string, patch: Partial<Question>) =>
    setBank((b) => b.map((q) => (q.id === id ? { ...q, ...patch } : q)));

  const add = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const question = adding.question.trim();
    const answer = adding.answer.trim();
    if (!question || !answer) return;
    setBank((b) => [...b, { id: newId(), question, answer }]);
    setAdding({ question: "", answer: "" });
  };

  const importText = (replace: boolean) => {
    const { questions, skipped } = parseQuestions(text);
    if (questions.length === 0) {
      setMessage("ไม่พบคำถามที่อ่านได้ — ใช้รูปแบบ คำถาม | คำตอบ บรรทัดละข้อ");
      return;
    }
    if (replace && !window.confirm(`แทนที่คลังคำถามทั้งหมดด้วย ${questions.length} ข้อนี้?`)) return;
    const added = questions.map((q) => ({ id: newId(), ...q }));
    setBank((b) => (replace ? added : [...b, ...added]));
    setText("");
    setMessage(
      `${replace ? "แทนที่ด้วย" : "เพิ่ม"} ${questions.length} ข้อ` +
        (skipped ? ` · ข้าม ${skipped} บรรทัดที่ไม่มีตัวคั่น | หรือแท็บ` : ""),
    );
  };

  return (
    <section className={`${panel} flex min-h-0 flex-col p-5`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">
          คลังคำถาม <span className="ml-1 text-white/50 tabular-nums">{validCount} ข้อ</span>
        </h2>
        <div className="flex flex-wrap gap-2 text-sm">
          <button
            type="button"
            onClick={() => {
              setShowText((s) => !s);
              setMessage("");
            }}
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 hover:bg-white/10"
          >
            {showText ? "ปิดกล่องข้อความ" : "นำเข้า / แก้เป็นข้อความ"}
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm("แทนที่คลังคำถามด้วยชุดตัวอย่าง?")) setBank(SAMPLE_QUESTIONS);
            }}
            className="flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 hover:bg-white/10"
          >
            <HiArrowPath className="h-4 w-4" /> ชุดตัวอย่าง
          </button>
          <button
            type="button"
            onClick={() => {
              if (bank.length && window.confirm(`ลบคำถามทั้งหมด ${bank.length} ข้อ?`)) setBank([]);
            }}
            className="flex items-center gap-1 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-rose-200 hover:bg-rose-500/20"
          >
            <HiTrash className="h-4 w-4" /> ลบทั้งหมด
          </button>
        </div>
      </div>

      {showText && (
        <div className="mt-4 space-y-2 rounded-xl border border-white/10 bg-black/30 p-3">
          <p className="text-sm text-white/60">
            บรรทัดละ 1 ข้อ: <code className="text-sky-300">คำถาม | คำตอบ</code> หรือคัดลอก 2 คอลัมน์จาก Google
            Sheets / Excel มาวางได้เลย
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            className={`${field} font-mono text-sm`}
            placeholder={"เมืองหลวงของญี่ปุ่นคือเมืองใด | โตเกียว\n7 × 8 เท่ากับเท่าไร | 56"}
          />
          <div className="flex flex-wrap gap-2 text-sm">
            <button
              type="button"
              onClick={() => importText(false)}
              className="rounded-lg bg-sky-500 px-3 py-1.5 font-medium text-white hover:bg-sky-400"
            >
              เพิ่มต่อท้าย
            </button>
            <button
              type="button"
              onClick={() => importText(true)}
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 hover:bg-white/10"
            >
              แทนที่ทั้งหมด
            </button>
            <button
              type="button"
              onClick={() => {
                setText(formatQuestions(bank.filter((q) => q.question.trim() && q.answer.trim())));
                setMessage("ดึงคำถามทั้งหมดมาแล้ว — แก้ไขแล้วกด “แทนที่ทั้งหมด” หรือคัดลอกเก็บไว้");
              }}
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 hover:bg-white/10"
            >
              ดึงคำถามทั้งหมดมาแก้ / คัดลอก
            </button>
          </div>
          {message && <p className="text-sm text-amber-200">{message}</p>}
        </div>
      )}

      <form onSubmit={add} className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_12rem_auto]">
        <input
          value={adding.question}
          onChange={(e) => setAdding((a) => ({ ...a, question: e.target.value }))}
          placeholder="คำถามใหม่"
          className={field}
        />
        <input
          value={adding.answer}
          onChange={(e) => setAdding((a) => ({ ...a, answer: e.target.value }))}
          placeholder="เฉลย"
          className={field}
        />
        <button
          type="submit"
          disabled={!adding.question.trim() || !adding.answer.trim()}
          className="flex items-center justify-center gap-1 rounded-xl bg-white/10 px-4 py-2.5 font-medium hover:bg-white/20 disabled:opacity-40"
        >
          <HiPlus className="h-4 w-4" /> เพิ่ม
        </button>
      </form>

      <ol className="mt-3 max-h-[55vh] min-h-0 space-y-2 overflow-y-auto pr-1">
        {bank.length === 0 && (
          <li className="rounded-xl border border-dashed border-white/15 p-6 text-center text-white/50">
            ยังไม่มีคำถาม — เพิ่มทีละข้อ นำเข้าจากข้อความ หรือกด “ชุดตัวอย่าง”
          </li>
        )}
        {bank.map((q, i) => (
          <li
            key={q.id}
            className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-start gap-2 rounded-xl border border-white/10 bg-black/20 p-2 sm:grid-cols-[2rem_minmax(0,1fr)_12rem_auto] sm:items-center"
          >
            <span className="pt-2 text-right text-sm text-white/40 tabular-nums sm:pt-0">{i + 1}</span>
            <input
              value={q.question}
              onChange={(e) => update(q.id, { question: e.target.value })}
              aria-label={`คำถามข้อ ${i + 1}`}
              className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1.5 outline-none hover:border-white/10 focus:border-sky-400 focus:bg-black/40"
            />
            <input
              value={q.answer}
              onChange={(e) => update(q.id, { answer: e.target.value })}
              aria-label={`เฉลยข้อ ${i + 1}`}
              className="col-start-2 row-start-2 w-full rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-emerald-300 outline-none hover:border-white/10 focus:border-sky-400 focus:bg-black/40 sm:col-start-auto sm:row-start-auto"
            />
            <button
              type="button"
              onClick={() => setBank((b) => b.filter((x) => x.id !== q.id))}
              aria-label={`ลบข้อ ${i + 1}`}
              className="col-start-3 row-start-1 flex h-9 w-9 items-center justify-center rounded-lg text-white/40 hover:bg-rose-500/15 hover:text-rose-300 sm:col-start-auto sm:row-start-auto"
            >
              <HiTrash className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}

// ---------- rounds ----------

function Clock({ ms, total, ticking, frozen }: { ms: number; total: number; ticking: boolean; frozen: boolean }) {
  const danger = secondsLeft(ms) <= DANGER_SECONDS;
  const color = danger ? `text-red-500 ${GLOW.chaser}` : `text-white ${GLOW.white}`;
  return (
    <div className="flex flex-col items-center" role="timer" aria-live="off">
      <div
        className={`${display.className} font-bold leading-none tabular-nums transition-opacity ${color} ${
          danger && ticking ? "chaser-blink" : ""
        } ${frozen ? "opacity-50" : ""}`}
        style={{ fontSize: "clamp(3.75rem, min(22vw, 16vh), 10rem)" }}
      >
        {formatClock(ms)}
      </div>
      <div className="mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${danger ? "bg-red-500" : "bg-white/70"}`}
          style={{ width: `${Math.max(0, Math.min(100, (ms / total) * 100))}%` }}
        />
      </div>
      <div className="mt-2 h-7" aria-live="polite">
        {frozen && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/60 bg-amber-400/15 px-3 py-1 text-sm font-semibold text-amber-200">
            <HiPause className="h-4 w-4" /> นาฬิกาหยุด
          </span>
        )}
      </div>
    </div>
  );
}

function ScoreCard({
  side,
  label,
  name,
  value,
  suffix,
}: {
  side: "player" | "chaser";
  label: string;
  name: string;
  value: React.ReactNode;
  suffix?: React.ReactNode;
}) {
  const tone =
    side === "player"
      ? "border-sky-400/40 bg-sky-500/10 shadow-[0_0_30px_rgba(56,189,248,0.15)]"
      : "border-rose-400/40 bg-rose-500/10 shadow-[0_0_30px_rgba(244,63,94,0.15)]";
  return (
    <div className={`rounded-2xl border px-3 py-3 text-center sm:px-5 ${tone}`}>
      <p className="text-xs tracking-wider text-white/55">{label}</p>
      <p className={`truncate font-semibold ${side === "player" ? "text-sky-200" : "text-rose-200"}`}>{name}</p>
      <p
        className={`${display.className} mt-1 text-5xl font-bold leading-none tabular-nums sm:text-6xl ${
          side === "player" ? `text-sky-300 ${GLOW.player}` : `text-rose-400 ${GLOW.chaser}`
        }`}
      >
        {value}
        {suffix}
      </p>
    </div>
  );
}

/** First letter for a track token; skips Thai leading vowels (เ แ โ ใ ไ). */
const initial = (name: string) => Array.from(name.replace(/^[เแโใไ]+/, ""))[0]?.toUpperCase() ?? "?";

function ChaseTrack({
  target,
  score,
  chaserName,
  playerName,
  hitKey,
}: {
  target: number;
  score: number;
  chaserName: string;
  playerName: string;
  hitKey: number;
}) {
  const pct = (Math.min(score, target) / target) * 100;
  return (
    <div className={`${panel} px-6 pb-3 pt-12 sm:px-10 sm:pt-14`} aria-label={`${chaserName} อยู่ช่อง ${score} จาก ${target}`}>
      <div className="relative">
        <div
          className="absolute -top-12 z-10 transition-[left] duration-500 ease-out"
          style={{ left: `${pct}%`, transform: "translateX(-50%)" }}
        >
          <div key={hitKey} className={hitKey ? "chaser-shake" : undefined}>
            <div
              className={`${display.className} flex h-10 w-10 items-center justify-center rounded-full border-2 border-rose-200 bg-rose-600 text-lg font-bold shadow-[0_0_20px_rgba(244,63,94,0.9)] sm:h-11 sm:w-11`}
            >
              {initial(chaserName)}
            </div>
          </div>
        </div>
        <div className="absolute -top-12 right-0 translate-x-1/2">
          <div
            className={`${display.className} flex h-10 w-10 items-center justify-center rounded-full border-2 border-sky-200 bg-sky-600 text-lg font-bold shadow-[0_0_20px_rgba(56,189,248,0.9)] sm:h-11 sm:w-11`}
          >
            {initial(playerName)}
          </div>
        </div>
        <div
          className={`grid ${target > 30 ? "gap-px" : "gap-1"}`}
          style={{ gridTemplateColumns: `repeat(${target}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: target }, (_, i) => {
            const filled = i < score;
            return (
              <div
                key={i}
                className={`flex h-9 items-center justify-center rounded-sm text-xs font-semibold tabular-nums transition-colors duration-300 sm:h-11 sm:rounded-md sm:text-sm ${
                  filled
                    ? "bg-rose-500 text-white shadow-[0_0_14px_rgba(244,63,94,0.8)]"
                    : i === target - 1
                      ? "border border-sky-400/60 bg-sky-500/15 text-sky-200"
                      : "border border-white/10 bg-white/5 text-white/40"
                }`}
              >
                {target <= 30 ? i + 1 : ""}
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-2 flex justify-between text-xs text-white/50 sm:text-sm">
        <span className="text-rose-300">{chaserName}</span>
        <span className="text-sky-300">เป้าหมาย {target} · {playerName}</span>
      </div>
    </div>
  );
}

function RoundScreen({
  game,
  onDecide,
  onPrimary,
}: {
  game: Game;
  onDecide: (v: Verdict) => void;
  onPrimary: () => void;
}) {
  const { settings } = game;
  const round2 = game.phase === "round2";
  const q = currentQuestion(game);
  const waiting = !game.started;
  const paused = game.started && !game.running && !game.pushback;
  const canDecide = game.running || game.pushback;
  const total = (round2 ? settings.round2Seconds : settings.round1Seconds) * 1000;
  const hitKey = game.event?.kind === "pushback-success" ? game.event.seq : 0;
  // "ผู้เล่น (ทีมฟ้า)" — skip the bracket when the name is just "ผู้เล่น".
  const playerTag = settings.playerName === DEFAULT_SETTINGS.playerName ? "" : `(${settings.playerName})`;

  return (
    <div className="flex flex-1 flex-col gap-4 py-2 sm:gap-5">
      <div className="grid grid-cols-2 items-center gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-6">
        <div className="col-span-2 sm:order-2 sm:col-span-1">
          <Clock ms={game.remainingMs} total={total} ticking={game.running && !game.pushback} frozen={game.pushback} />
        </div>
        <div className="sm:order-1">
          {round2 ? (
            <ScoreCard side="player" label="เป้าหมาย" name={settings.playerName} value={game.playerScore} />
          ) : (
            <ScoreCard side="player" label="แต้มสะสม" name={settings.playerName} value={game.playerScore} />
          )}
        </div>
        <div className="sm:order-3">
          {round2 ? (
            <ScoreCard
              side="chaser"
              label="ไล่ได้"
              name={settings.chaserName}
              value={game.chaserScore}
              suffix={<span className="text-2xl text-rose-300/60 sm:text-3xl">/{game.playerScore}</span>}
            />
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-center sm:px-5">
              <p className="text-xs tracking-wider text-white/55">ข้อที่</p>
              <p className="truncate font-semibold text-white/70">ตอบได้ไม่จำกัด</p>
              <p className={`${display.className} mt-1 text-5xl font-bold leading-none tabular-nums text-white/80 sm:text-6xl`}>
                {game.started ? game.cursor + 1 : "–"}
              </p>
            </div>
          )}
        </div>
      </div>

      {round2 && (
        <ChaseTrack
          target={game.playerScore}
          score={game.chaserScore}
          chaserName={settings.chaserName}
          playerName={settings.playerName}
          hitKey={hitKey}
        />
      )}

      <div
        className={`relative flex flex-1 flex-col justify-center rounded-3xl border p-5 sm:p-8 ${
          game.pushback
            ? "border-2 border-amber-300 bg-sky-950/70 shadow-[0_0_40px_rgba(251,191,36,0.4)]"
            : round2
              ? "border-rose-400/25 bg-black/40"
              : "border-sky-400/25 bg-black/40"
        }`}
        style={{ minHeight: "9rem" }}
      >
        {q && !waiting && !paused ? (
          <>
            {game.pushback ? (
              <div className="chaser-pop mb-1 flex flex-wrap items-baseline gap-x-4 gap-y-1" role="status">
                <span
                  className={`${display.className} text-4xl font-bold tracking-wider text-amber-300 sm:text-5xl ${GLOW.amber}`}
                >
                  PUSHBACK!
                </span>
                <span className="text-xl font-semibold text-sky-100 sm:text-2xl">
                  ผู้เล่นตอบได้{playerTag && <span className="text-sky-300"> {playerTag}</span>}
                </span>
              </div>
            ) : (
              <p className="text-sm text-white/45">
                คำถามข้อที่ {game.cursor + 1}
                {game.cursor >= game.deck.length && " · คำถามวนซ้ำ"}
              </p>
            )}
            <p
              className="mt-2 font-semibold leading-snug text-white"
              style={{ fontSize: "clamp(1.4rem, 0.9rem + 2.2vw, 3rem)" }}
            >
              {q.question}
            </p>
            <p className="mt-3 text-sm text-white/40">
              เฉลย (พิธีกร): <span className="font-medium text-emerald-300/90">{q.answer}</span>
            </p>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-xl text-white/70">
              {waiting ? `${settings.playerName} พร้อมไหม?` : "หยุดเวลาชั่วคราว"}
            </p>
            <button
              type="button"
              onClick={onPrimary}
              className={`${display.className} flex items-center gap-2 rounded-2xl bg-sky-500 px-10 py-4 text-2xl font-bold shadow-[0_0_30px_rgba(56,189,248,0.6)] hover:bg-sky-400 active:scale-[0.98]`}
            >
              <HiPlay className="h-7 w-7" />
              {waiting ? "เริ่มจับเวลา" : "เดินต่อ"}
            </button>
            <p className="text-sm text-white/40">
              หรือกด <Kbd>Space</Kbd>
            </p>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 bg-linear-to-t from-[#04050c] from-70% to-transparent px-4 pb-1 pt-5 sm:-mx-6 sm:px-6">
        <div className="mb-2 flex items-center justify-between gap-2 text-sm">
          <span className={game.pushback ? "font-semibold text-amber-200" : "text-white/50"}>
            {game.pushback
              ? `ตัดสินคำตอบของผู้เล่น${playerTag && ` ${playerTag}`}`
              : `ตัดสินคำตอบของ ${round2 ? settings.chaserName : settings.playerName}`}
          </span>
          {game.started && !game.pushback && (
            <button
              type="button"
              onClick={onPrimary}
              className="flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-3 py-1 text-white/70 hover:bg-white/10"
            >
              {game.running ? <HiPause className="h-4 w-4" /> : <HiPlay className="h-4 w-4" />}
              {game.running ? "หยุดเวลา" : "เดินต่อ"}
            </button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <VerdictButton
            onClick={() => onDecide("correct")}
            disabled={!canDecide}
            hotkey="1"
            className="border-emerald-300/60 bg-emerald-500/85 shadow-[0_0_24px_rgba(16,185,129,0.45)] hover:bg-emerald-400"
          >
            <HiCheck className="h-7 w-7" /> ถูก
          </VerdictButton>
          <VerdictButton
            onClick={() => onDecide("wrong")}
            disabled={!canDecide}
            hotkey="2"
            className="border-rose-300/60 bg-rose-600/85 shadow-[0_0_24px_rgba(244,63,94,0.45)] hover:bg-rose-500"
          >
            <HiXMark className="h-7 w-7" /> ผิด
          </VerdictButton>
          <VerdictButton
            onClick={() => onDecide("skip")}
            disabled={!canDecide}
            hotkey="3"
            className="border-white/25 bg-white/10 hover:bg-white/20"
          >
            <HiForward className="h-7 w-7" /> ข้าม
          </VerdictButton>
        </div>
      </div>
    </div>
  );
}

function VerdictButton({
  onClick,
  disabled,
  hotkey,
  className,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  hotkey: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${display.className} relative flex items-center justify-center gap-1.5 rounded-2xl border py-4 text-2xl font-bold text-white transition active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none sm:py-5 sm:text-3xl ${className}`}
    >
      {children}
      <span className="absolute right-2 top-1.5 hidden font-mono text-xs font-normal text-white/60 sm:block">
        {hotkey}
      </span>
    </button>
  );
}

// ---------- between rounds / result ----------

function InterludeScreen({ game, onStart }: { game: Game; onStart: () => void }) {
  const { settings } = game;
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8 text-center">
      <p className="text-lg text-white/60">
        หมดเวลารอบที่ 1 · <span className="text-sky-300">{settings.playerName}</span> ทำได้
      </p>
      <p className="text-2xl font-semibold text-rose-200 sm:text-3xl">เป้าหมายของ {settings.chaserName}</p>
      <p
        className={`${display.className} chaser-pop font-bold leading-none tabular-nums text-sky-300 ${GLOW.player}`}
        style={{ fontSize: "clamp(8rem, 30vw, 18rem)" }}
      >
        {game.playerScore}
      </p>
      <p className="text-xl text-white/80 sm:text-2xl">
        แต้ม ภายในเวลา{" "}
        <span className={`${display.className} font-bold text-white`}>
          {formatClock(settings.round2Seconds * 1000)}
        </span>
      </p>
      <button
        type="button"
        onClick={onStart}
        className={`${display.className} mt-4 flex items-center gap-2 rounded-2xl bg-rose-600 px-12 py-5 text-3xl font-bold shadow-[0_0_40px_rgba(244,63,94,0.6)] hover:bg-rose-500 active:scale-[0.98]`}
      >
        <HiPlay className="h-8 w-8" /> เริ่มรอบที่ 2
      </button>
      <p className="text-sm text-white/40">
        นาฬิกาจะเดินเมื่อกดปุ่ม · หรือกด <Kbd>Space</Kbd>
      </p>
    </div>
  );
}

function ResultScreen({ game, onReplay }: { game: Game; onReplay: () => void }) {
  const { settings } = game;
  const playerWon = game.winner === "player";
  const winnerName = playerWon ? settings.playerName : settings.chaserName;
  const headline =
    game.endReason === "caught"
      ? `${settings.chaserName} ไล่ทันแล้ว!`
      : game.endReason === "zero"
        ? `${settings.playerName} ทำได้ 0 แต้ม — Chaser ชนะทันที`
        : `${settings.playerName} หนีรอด! หมดเวลาก่อน Chaser ไล่ทัน`;

  const stats: { label: string; value: React.ReactNode; tone: string }[] = [
    {
      label: `รอบที่ 1 · ${settings.playerName}`,
      value: `${game.playerScore} แต้ม`,
      tone: "text-sky-300",
    },
    {
      label: `รอบที่ 2 · ${settings.chaserName}`,
      value: game.endReason === "zero" ? "ไม่ต้องเล่น" : `${game.chaserScore} / ${game.playerScore}`,
      tone: "text-rose-400",
    },
    {
      label: "Pushback สำเร็จ",
      value: `${game.pushbackWins} ครั้ง`,
      tone: "text-amber-300",
    },
  ];
  if (game.chaserTimeLeftMs !== null) {
    stats.push({ label: "เวลาที่เหลือ", value: formatClock(game.chaserTimeLeftMs), tone: "text-white" });
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-8 text-center">
      <p className="text-xl text-white/70">ผู้ชนะ</p>
      <p
        className={`${display.className} chaser-pop max-w-full break-words font-bold leading-tight ${
          playerWon ? `text-sky-300 ${GLOW.player}` : `text-rose-400 ${GLOW.chaser}`
        }`}
        style={{ fontSize: "clamp(3.5rem, 12vw, 9rem)" }}
      >
        {winnerName}
      </p>
      <p className="text-xl font-medium text-white/85 sm:text-2xl">{headline}</p>

      <div className={`grid w-full max-w-4xl gap-3 ${stats.length === 4 ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-3"}`}>
        {stats.map((s) => (
          <div key={s.label} className={`${panel} px-4 py-4`}>
            <p className="truncate text-sm text-white/55">{s.label}</p>
            <p className={`${display.className} mt-1 text-3xl font-bold tabular-nums sm:text-4xl ${s.tone}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>
      {game.pushbackAttempts > 0 && (
        <p className="-mt-2 text-sm text-white/45">
          Chaser ตอบผิด {game.pushbackAttempts} ครั้ง · ผู้เล่นตอบถูก {game.pushbackWins} ครั้ง
        </p>
      )}

      <button
        type="button"
        onClick={onReplay}
        className={`${display.className} mt-2 flex items-center gap-2 rounded-2xl bg-linear-to-r from-sky-500 via-indigo-500 to-rose-500 px-12 py-4 text-2xl font-bold shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:brightness-110 active:scale-[0.98]`}
      >
        <HiArrowPath className="h-7 w-7" /> เล่นใหม่
      </button>
    </div>
  );
}
