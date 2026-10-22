// "Chaser" quiz game: rules as a pure reducer so `npm test` can drive a whole
// game with plain Node (no imports).
//
// Round 1: the player banks +1 per correct answer until the clock runs out;
// that score becomes the Chaser's target (0 → Chaser wins at once).
// Round 2: the Chaser needs to reach the target before the clock runs out.
// A wrong Chaser answer stops the clock and hands the same question to the
// player ("Pushback"): correct moves the Chaser back one (never below 0).

export const DEFAULT_ROUND_SECONDS = 120;
export const MIN_ROUND_SECONDS = 10;
export const MAX_ROUND_SECONDS = 600;
export const MAX_NAME_CHARS = 40;
/** Countdown beeps on the last N seconds. */
export const BEEP_SECONDS = 5;
/** Clock turns red and blinks on the last N seconds. */
export const DANGER_SECONDS = 10;

export type Phase = "setup" | "round1" | "interlude" | "round2" | "result";
export type Verdict = "correct" | "wrong" | "skip";
export type Side = "player" | "chaser";
export type GameEventKind =
  | "correct"
  | "wrong"
  | "skip"
  | "pushback"
  | "pushback-success"
  | "pushback-fail"
  | "round-over"
  | "game-over";

export interface Question {
  id: string;
  question: string;
  answer: string;
}

export interface ChaserSettings {
  playerName: string;
  chaserName: string;
  round1Seconds: number;
  round2Seconds: number;
}

export interface ChaserGame {
  phase: Phase;
  settings: ChaserSettings;
  /** Shuffled copy of the bank; questions cycle if it runs out. */
  deck: Question[];
  /** Questions drawn so far (current one is deck[cursor % deck.length]). */
  cursor: number;
  /** Clock started for this round (round 1 waits on a "ready" screen). */
  started: boolean;
  /** Clock is ticking (false before start, while paused or in Pushback). */
  running: boolean;
  remainingMs: number;
  /** Player's round-1 score = the Chaser's target. */
  playerScore: number;
  chaserScore: number;
  pushback: boolean;
  pushbackAttempts: number;
  pushbackWins: number;
  winner: Side | null;
  endReason: "caught" | "zero" | "timeout" | null;
  /** Clock left when the Chaser caught up. */
  chaserTimeLeftMs: number | null;
  /** Last thing that happened, for sounds/flashes (seq changes every event). */
  event: { seq: number; kind: GameEventKind } | null;
}

export type ChaserAction =
  | { type: "start"; settings: ChaserSettings; deck: Question[] }
  | { type: "go" }
  | { type: "pause" }
  | { type: "tick"; ms: number }
  | { type: "verdict"; verdict: Verdict }
  | { type: "beginRound2" }
  | { type: "reset" };

export const DEFAULT_SETTINGS: ChaserSettings = {
  playerName: "ผู้เล่น",
  chaserName: "Chaser",
  round1Seconds: DEFAULT_ROUND_SECONDS,
  round2Seconds: DEFAULT_ROUND_SECONDS,
};

export function newGame(settings: ChaserSettings = DEFAULT_SETTINGS): ChaserGame {
  return {
    phase: "setup",
    settings,
    deck: [],
    cursor: 0,
    started: false,
    running: false,
    remainingMs: settings.round1Seconds * 1000,
    playerScore: 0,
    chaserScore: 0,
    pushback: false,
    pushbackAttempts: 0,
    pushbackWins: 0,
    winner: null,
    endReason: null,
    chaserTimeLeftMs: null,
    event: null,
  };
}

export function currentQuestion(game: ChaserGame): Question | null {
  return game.deck.length ? game.deck[game.cursor % game.deck.length] : null;
}

/** Whole seconds shown on the clock (rounded up, so 0 only at time-out). */
export function secondsLeft(ms: number): number {
  return Math.max(0, Math.ceil(ms / 1000));
}

/** m:ss */
export function formatClock(ms: number): string {
  const s = secondsLeft(ms);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

const emit = (game: ChaserGame, kind: GameEventKind) => ({
  seq: (game.event?.seq ?? 0) + 1,
  kind,
});

function timeUp(game: ChaserGame): ChaserGame {
  const g = { ...game, remainingMs: 0, running: false };
  if (game.phase === "round1") {
    return game.playerScore === 0
      ? { ...g, phase: "result", winner: "chaser", endReason: "zero", event: emit(game, "game-over") }
      : { ...g, phase: "interlude", event: emit(game, "round-over") };
  }
  return { ...g, phase: "result", winner: "player", endReason: "timeout", event: emit(game, "game-over") };
}

function judge(game: ChaserGame, verdict: Verdict): ChaserGame {
  const next = game.cursor + 1;
  if (game.phase === "round1") {
    return verdict === "correct"
      ? { ...game, cursor: next, playerScore: game.playerScore + 1, event: emit(game, "correct") }
      : { ...game, cursor: next, event: emit(game, verdict) };
  }

  if (game.pushback) {
    // Player answers the Chaser's missed question; the clock resumes after.
    const success = verdict === "correct";
    return {
      ...game,
      cursor: next,
      pushback: false,
      running: true,
      chaserScore: success ? Math.max(0, game.chaserScore - 1) : game.chaserScore,
      pushbackWins: game.pushbackWins + (success ? 1 : 0),
      event: emit(game, success ? "pushback-success" : "pushback-fail"),
    };
  }

  if (verdict === "wrong") {
    return {
      ...game,
      pushback: true,
      running: false,
      pushbackAttempts: game.pushbackAttempts + 1,
      event: emit(game, "pushback"),
    };
  }
  if (verdict === "skip") return { ...game, cursor: next, event: emit(game, "skip") };

  const chaserScore = game.chaserScore + 1;
  if (chaserScore >= game.playerScore) {
    return {
      ...game,
      cursor: next,
      chaserScore,
      running: false,
      phase: "result",
      winner: "chaser",
      endReason: "caught",
      chaserTimeLeftMs: game.remainingMs,
      event: emit(game, "game-over"),
    };
  }
  return { ...game, cursor: next, chaserScore, event: emit(game, "correct") };
}

export function chaserReducer(game: ChaserGame, action: ChaserAction): ChaserGame {
  const inRound = game.phase === "round1" || game.phase === "round2";
  switch (action.type) {
    case "start":
      if (action.deck.length === 0) return game;
      return { ...newGame(action.settings), phase: "round1", deck: action.deck, event: game.event };
    case "go":
      // Start or resume the clock (not during Pushback — the verdict resumes it).
      return inRound && !game.pushback && game.remainingMs > 0
        ? { ...game, started: true, running: true }
        : game;
    case "pause":
      return inRound && game.running ? { ...game, running: false } : game;
    case "tick": {
      if (!inRound || !game.running || game.pushback || !(action.ms > 0)) return game;
      const remainingMs = game.remainingMs - action.ms;
      return remainingMs > 0 ? { ...game, remainingMs } : timeUp(game);
    }
    case "verdict":
      // Decisions only count while the clock runs, or for the Pushback answer.
      if (game.phase === "round2" && game.pushback) return judge(game, action.verdict);
      return inRound && game.running ? judge(game, action.verdict) : game;
    case "beginRound2":
      if (game.phase !== "interlude") return game;
      return {
        ...game,
        phase: "round2",
        // The question on screen at the round-1 buzzer was never answered.
        cursor: game.cursor + 1,
        remainingMs: game.settings.round2Seconds * 1000,
        started: true,
        running: true,
      };
    case "reset":
      return { ...newGame(game.settings), event: game.event };
  }
}

// ---------- settings + question bank ----------

const clampSeconds = (v: unknown) => {
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() ? Number(v) : NaN;
  return Number.isFinite(n)
    ? Math.min(MAX_ROUND_SECONDS, Math.max(MIN_ROUND_SECONDS, Math.round(n)))
    : DEFAULT_ROUND_SECONDS;
};

const cleanName = (v: unknown, fallback: string) =>
  (typeof v === "string" ? v.trim().slice(0, MAX_NAME_CHARS) : "") || fallback;

export function sanitizeSettings(raw: unknown): ChaserSettings {
  const r = (raw ?? {}) as Partial<Record<keyof ChaserSettings, unknown>>;
  return {
    playerName: cleanName(r.playerName, DEFAULT_SETTINGS.playerName),
    chaserName: cleanName(r.chaserName, DEFAULT_SETTINGS.chaserName),
    round1Seconds: clampSeconds(r.round1Seconds),
    round2Seconds: clampSeconds(r.round2Seconds),
  };
}

/** Keep well-formed questions from stored JSON; null if it isn't a list. */
export function sanitizeBank(raw: unknown): Question[] | null {
  if (!Array.isArray(raw)) return null;
  const seen = new Set<string>();
  const out: Question[] = [];
  for (const item of raw) {
    const q = item as Partial<Record<keyof Question, unknown>> | null;
    if (!q || typeof q.id !== "string" || seen.has(q.id)) continue;
    if (typeof q.question !== "string" || typeof q.answer !== "string") continue;
    const question = q.question.trim();
    const answer = q.answer.trim();
    if (!question || !answer) continue;
    seen.add(q.id);
    out.push({ id: q.id, question, answer });
  }
  return out;
}

/**
 * One question per line: `คำถาม | คำตอบ`, or tab-separated (pasted from a
 * spreadsheet). Splits on the last separator so questions may contain "|".
 */
export function parseQuestions(text: string): {
  questions: { question: string; answer: string }[];
  skipped: number;
} {
  const questions: { question: string; answer: string }[] = [];
  let skipped = 0;
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const sep = line.includes("\t") ? "\t" : "|";
    const at = line.lastIndexOf(sep);
    const question = at > 0 ? line.slice(0, at).trim() : "";
    const answer = at > 0 ? line.slice(at + 1).trim() : "";
    if (question && answer) questions.push({ question, answer });
    else skipped++;
  }
  return { questions, skipped };
}

export function formatQuestions(list: { question: string; answer: string }[]): string {
  return list.map((q) => `${q.question} | ${q.answer}`).join("\n");
}

/** Fisher–Yates; `random` returns [0, 1). */
export function shuffle<T>(list: readonly T[], random: () => number = Math.random): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
