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
export const MAX_CATEGORY_CHARS = 30;
/** Category for questions imported without one. */
export const DEFAULT_CATEGORY = "อื่น ๆ";
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
  category: string;
}

/** A question as typed or imported (no id yet). */
export type QuestionInput = Omit<Question, "id">;

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

// ---------- audience display ----------

/** What the players' screen needs — never the answer. */
export interface DisplayState {
  phase: Phase;
  settings: ChaserSettings;
  /** Shown only while the clock runs or during Pushback (like the host view). */
  question: string | null;
  category: string | null;
  questionNumber: number;
  started: boolean;
  running: boolean;
  remainingMs: number;
  totalMs: number;
  playerScore: number;
  chaserScore: number;
  pushback: boolean;
  pushbackAttempts: number;
  pushbackWins: number;
  winner: Side | null;
  endReason: ChaserGame["endReason"];
  chaserTimeLeftMs: number | null;
  event: ChaserGame["event"];
}

/** The current question is on screen (clock running, or Pushback). */
export function isQuestionVisible(game: ChaserGame): boolean {
  const inRound = game.phase === "round1" || game.phase === "round2";
  return inRound && game.started && (game.running || game.pushback);
}

export function toDisplayState(game: ChaserGame): DisplayState {
  const q = isQuestionVisible(game) ? currentQuestion(game) : null;
  return {
    phase: game.phase,
    settings: game.settings,
    question: q?.question ?? null,
    category: q?.category ?? null,
    questionNumber: game.cursor + 1,
    started: game.started,
    running: game.running,
    remainingMs: game.remainingMs,
    totalMs: (game.phase === "round2" || game.phase === "result" ? game.settings.round2Seconds : game.settings.round1Seconds) * 1000,
    playerScore: game.playerScore,
    chaserScore: game.chaserScore,
    pushback: game.pushback,
    pushbackAttempts: game.pushbackAttempts,
    pushbackWins: game.pushbackWins,
    winner: game.winner,
    endReason: game.endReason,
    chaserTimeLeftMs: game.chaserTimeLeftMs,
    event: game.event,
  };
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

/** Trimmed, single-spaced, capped; empty → DEFAULT_CATEGORY. */
export function cleanCategory(v: unknown): string {
  const s = typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, MAX_CATEGORY_CHARS).trim() : "";
  return s || DEFAULT_CATEGORY;
}

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
    out.push({ id: q.id, question, answer, category: cleanCategory(q.category) });
  }
  return out;
}

/**
 * One question per line: `คำถาม | คำตอบ` (split on the last "|", so questions
 * may contain one), or pasted spreadsheet columns `คำถาม⇥คำตอบ` /
 * `หมวด⇥คำถาม⇥คำตอบ`. A line `# หมวด` sets the category of the lines below it
 * (until the next header); before any header it is `category`.
 */
export function parseQuestions(
  text: string,
  category: string = DEFAULT_CATEGORY,
): { questions: QuestionInput[]; skipped: number } {
  const questions: QuestionInput[] = [];
  let current = cleanCategory(category);
  let skipped = 0;
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const tabs = line.includes("\t");
    if (trimmed.startsWith("#") && !tabs && !line.includes("|")) {
      current = cleanCategory(trimmed.replace(/^#+/, ""));
      continue;
    }
    let cat = current;
    let question = "";
    let answer = "";
    if (tabs) {
      const cols = line.split("\t").map((c) => c.trim());
      answer = cols.pop() ?? "";
      if (cols.length >= 2) cat = cleanCategory(cols.shift());
      question = cols.join(" ").trim();
    } else {
      const at = line.lastIndexOf("|");
      question = at > 0 ? line.slice(0, at).trim() : "";
      answer = at > 0 ? line.slice(at + 1).trim() : "";
    }
    if (question && answer) questions.push({ question, answer, category: cat });
    else skipped++;
  }
  return { questions, skipped };
}

/** Inverse of parseQuestions: a `# หมวด` line wherever the category changes. */
export function formatQuestions(list: readonly QuestionInput[]): string {
  const lines: string[] = [];
  let current: string | null = null;
  for (const q of list) {
    const cat = cleanCategory(q.category);
    if (cat !== current) {
      if (lines.length) lines.push("");
      lines.push(`# ${cat}`);
      current = cat;
    }
    lines.push(`${q.question} | ${q.answer}`);
  }
  return lines.join("\n");
}

/** Built-in bank text → questions whose ids stay the same across deploys. */
export function bankFromText(text: string, prefix = "std"): Question[] {
  return parseQuestions(text).questions.map((q) => ({ id: `${prefix}-${questionKey(q)}`, ...q }));
}

/** Categories in first-seen order with their question counts. */
export function listCategories(bank: readonly Pick<Question, "category">[]): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const q of bank) counts.set(q.category, (counts.get(q.category) ?? 0) + 1);
  return [...counts].map(([name, count]) => ({ name, count }));
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

// ---------- deck: spread categories, no repeats within a day ----------

/**
 * Stable short key for "the same question" — by its text, so re-importing the
 * same question (new id) still counts as already asked. FNV-1a, base36.
 */
export function questionKey(q: Pick<Question, "question">): string {
  const text = q.question.normalize("NFC").replace(/\s+/g, " ").trim().toLowerCase();
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

/** Local calendar day, e.g. "2026-11-03" (the device's time zone). */
export function dayKey(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Questions already shown today: `{ day, keys }` from questionKey(). */
export interface UsedLog {
  day: string;
  keys: string[];
}

const MAX_USED_KEYS = 5000;

/** Stored log → today's keys only (a log from another day is empty). */
export function sanitizeUsed(raw: unknown, today: string): UsedLog {
  const r = (raw ?? {}) as Partial<Record<keyof UsedLog, unknown>>;
  if (r.day !== today || !Array.isArray(r.keys)) return { day: today, keys: [] };
  const keys = [...new Set(r.keys.filter((k): k is string => typeof k === "string" && k.length > 0 && k.length < 32))];
  return { day: today, keys: keys.slice(-MAX_USED_KEYS) };
}

/** Add one key for `today` (starting a new log when the day has changed). */
export function addUsed(log: UsedLog, key: string, today: string): UsedLog {
  const keys = log.day === today ? log.keys : [];
  if (keys.includes(key)) return log.day === today ? log : { day: today, keys };
  return { day: today, keys: [...keys, key].slice(-MAX_USED_KEYS) };
}

/**
 * Random order that spreads categories out: each pick avoids the last two
 * categories (when there are enough of them) and favours the categories with
 * the most questions left, so every stretch of the deck mixes the whole bank.
 * `recent` = categories just before this list (to keep a seam spread too).
 */
export function mixByCategory<T extends Pick<Question, "category">>(
  list: readonly T[],
  random: () => number = Math.random,
  recent: readonly string[] = [],
): T[] {
  const groups = new Map<string, T[]>();
  for (const q of shuffle(list, random)) {
    const g = groups.get(q.category);
    if (g) g.push(q);
    else groups.set(q.category, [q]);
  }
  const gap = Math.min(2, groups.size - 1);
  const last = gap > 0 ? recent.slice(-gap) : [];
  const out: T[] = [];
  while (out.length < list.length) {
    const live = [...groups].filter(([, qs]) => qs.length > 0);
    let choices = live.filter(([c]) => !last.includes(c));
    if (!choices.length) choices = live.filter(([c]) => c !== last[last.length - 1]);
    if (!choices.length) choices = live;
    const total = choices.reduce((n, [, qs]) => n + qs.length, 0);
    let r = random() * total;
    let pick = choices[choices.length - 1];
    for (const choice of choices) {
      r -= choice[1].length;
      if (r < 0) {
        pick = choice;
        break;
      }
    }
    out.push(pick[1].pop()!);
    if (gap > 0) {
      last.push(pick[0]);
      if (last.length > gap) last.shift();
    }
  }
  return out;
}

export interface DeckOptions {
  /** questionKey()s already shown today. */
  used?: ReadonlySet<string>;
  /** Categories switched off for this game. */
  off?: ReadonlySet<string>;
  random?: () => number;
}

/**
 * The game deck: questions not yet shown today first (spread by category),
 * then — only if a game outlasts them — today's used ones. Duplicate question
 * texts in the bank count once. `fresh` = how many come before the repeats.
 */
export function buildDeck<T extends Question>(
  bank: readonly T[],
  { used = new Set(), off = new Set(), random = Math.random }: DeckOptions = {},
): { deck: T[]; fresh: number } {
  const seen = new Set<string>();
  const unused: T[] = [];
  const again: T[] = [];
  for (const q of bank) {
    if (off.has(q.category)) continue;
    const key = questionKey(q);
    if (seen.has(key)) continue;
    seen.add(key);
    (used.has(key) ? again : unused).push(q);
  }
  const first = mixByCategory(unused, random);
  const rest = mixByCategory(again, random, first.slice(-2).map((q) => q.category));
  return { deck: [...first, ...rest], fresh: first.length };
}
